import { useState } from 'react'
import { Map, Grid, ExternalLink, Compass, Layers, Navigation, Loader2, AlertCircle, MapPin } from 'lucide-react'

const STATUS_STYLES = {
  free:     { bg: "#c0dd97", text: "#27500a", label: "Free" },
  moderate: { bg: "#fac775", text: "#633806", label: "Moderate" },
  crowded:  { bg: "#f09595", text: "#791f1f", label: "Crowded" },
  active:   { bg: "#85b7eb", text: "#0c447c", label: "Active" },
  idle:     { bg: "#e8e8f0", text: "#888888", label: "Idle" },
}

export default function CampusMap({ rooms = [], onRoomClick, highlightRoomId }) {
  const [viewMode, setViewMode] = useState("twin") // "twin" | "natural" | "nav"
  const [mapLayer, setMapLayer] = useState("h") // "h" for Hybrid, "m" for Standard Map, "p" for Terrain
  const [locationStatus, setLocationStatus] = useState("idle") // idle | loading | success | error
  const [userPos, setUserPos] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [activeBlock, setActiveBlock] = useState("A")
  
  const filtered = rooms.filter(r => r.block === activeBlock)
  
  // Group by floor
  const floors = {}
  filtered.forEach(r => {
    floors[r.floor] = floors[r.floor] || []
    floors[r.floor].push(r)
  })

  const locate = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.")
      setLocationStatus("error")
      return
    }
    setLocationStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationStatus("success")
      },
      (err) => {
        setErrorMsg("Could not retrieve your location: " + err.message)
        setLocationStatus("error")
      },
      { enableHighAccuracy: false, timeout: 15000 }
    )
  }

  return (
    <div className="bg-white rounded-card p-5 border border-gray-100 shadow-sm transition-all duration-300">
      {/* Top Header & View Toggle */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-50">
        <div>
          <h3 className="text-nav font-semibold text-navy flex items-center gap-2">
            {viewMode === "twin" && (
              <>
                <Grid size={18} className="text-orange animate-pulse" />
                Digital Twin · Live Campus State
              </>
            )}
            {viewMode === "natural" && (
              <>
                <Map size={18} className="text-orange" />
                PESITM Shivamogga · Natural Location
              </>
            )}
            {viewMode === "nav" && (
              <>
                <Navigation size={18} className="text-orange animate-bounce" />
                PESITM Campus Navigation & Routing
              </>
            )}
          </h3>
          <p className="text-label text-textmute mt-0.5">
            {viewMode === "twin" && "Real-time occupancy and environmental sensor data per room."}
            {viewMode === "natural" && "Geographic satellite and terrain coordinates on Sagar Road."}
            {viewMode === "nav" && "Live interactive routing with turn-by-turn directions from your position."}
          </p>
        </div>

        {/* Premium Segmented Toggle with 3 Options */}
        <div className="flex bg-page rounded-pill p-1 border border-gray-200/50 self-start xl:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setViewMode("twin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-label font-medium transition-all duration-200 whitespace-nowrap
              ${viewMode === "twin" ? "bg-white text-navy shadow-sm" : "text-textmute hover:text-navy"}`}
          >
            <Grid size={14} />
            Digital Twin
          </button>
          <button
            onClick={() => setViewMode("natural")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-label font-medium transition-all duration-200 whitespace-nowrap
              ${viewMode === "natural" ? "bg-white text-navy shadow-sm" : "text-textmute hover:text-navy"}`}
          >
            <Map size={14} />
            Natural Map
          </button>
          <button
            onClick={() => setViewMode("nav")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-label font-medium transition-all duration-200 whitespace-nowrap
              ${viewMode === "nav" ? "bg-white text-navy shadow-sm" : "text-textmute hover:text-navy"}`}
          >
            <Navigation size={14} />
            Live Navigation
          </button>
        </div>
      </div>

      {viewMode === "twin" && (
        <>
          {/* Block tabs */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-label uppercase tracking-wider text-textmute">Select Campus Area</p>
            <div className="flex gap-1 bg-page rounded-pill p-1">
              {["A", "B", "C"].map(b => (
                <button
                  key={b}
                  onClick={() => setActiveBlock(b)}
                  className={`px-4 py-1 rounded-pill text-body transition-colors
                    ${activeBlock === b ? "bg-navy text-white" : "text-textmute hover:text-navy"}`}
                >
                  Block {b}
                </button>
              ))}
            </div>
          </div>

          {/* Floor-wise tile grid */}
          <div className="space-y-4">
            {Object.keys(floors).sort((a, b) => +b - +a).map(floor => (
              <div key={floor}>
                <p className="text-label uppercase tracking-wider text-textmute mb-2">
                  Floor {floor === "0" ? "Ground" : floor}
                </p>
                <div className="grid grid-cols-9 gap-1.5">
                  {floors[floor].map(r => {
                    const s = STATUS_STYLES[r.status] || STATUS_STYLES.idle
                    const isHighlight = r.id === highlightRoomId
                    return (
                      <button
                        key={r.id}
                        onClick={() => onRoomClick?.(r)}
                        title={`${r.code} · ${s.label} · ${r.current_occupancy}/${r.capacity}`}
                        className={`relative aspect-square rounded-md text-label font-medium
                                    flex items-center justify-center transition-transform hover:scale-105
                                    ${isHighlight ? "ring-2 ring-orange" : ""}`}
                        style={{ backgroundColor: s.bg, color: s.text }}
                      >
                        {r.code.split('-')[1]}
                        {isHighlight && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange rounded-full pulse-dot" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-gray-100">
            {Object.entries(STATUS_STYLES).map(([k, s]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: s.bg }} />
                <span className="text-body text-textmute">{s.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {viewMode === "natural" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="relative rounded-card overflow-hidden border border-gray-100 shadow-inner" style={{ height: 400 }}>
            <iframe
              title="PESITM Shivamogga Natural Location Map"
              src={`https://maps.google.com/maps?q=PESITM%20Shivamogga&t=${mapLayer}&z=17&ie=UTF8&iwloc=&output=embed`}
              style={{ width: '100%', height: '100%', border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            
            {/* Map Badge/Floating Control */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md border border-gray-100 max-w-[240px]">
              <div className="flex items-center gap-1.5 mb-1">
                <Compass size={14} className="text-orange animate-spin-slow" />
                <span className="text-label font-bold text-navy uppercase tracking-wider">PESITM Campus Info</span>
              </div>
              <p className="text-body text-navy font-semibold">PES Institute of Technology & Management</p>
              <p className="text-label text-textmute mt-0.5">Sagar Road, Shivamogga, Karnataka 577204</p>
              <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1 text-label text-textmute">
                <p>📍 Lat: 13.9338° N</p>
                <p>📍 Lng: 75.5642° E</p>
              </div>
            </div>

            {/* Floating Map Layer Selector Control */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-md border border-gray-100 flex flex-col gap-1">
              <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-100 mb-1">
                <Layers size={13} className="text-orange" />
                <span className="text-label font-bold text-navy uppercase tracking-wider">Map Layers</span>
              </div>
              {[
                { id: "h", label: "Hybrid Satellite" },
                { id: "m", label: "Standard Map" },
                { id: "p", label: "Terrain View" }
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setMapLayer(layer.id)}
                  className={`px-3 py-1.5 rounded-lg text-label font-medium text-left transition-all duration-150 min-w-[130px]
                    ${mapLayer === layer.id
                      ? "bg-orange text-white shadow-sm"
                      : "text-navy hover:bg-page"}`}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-page rounded-card border border-gray-100">
            <div className="text-center sm:text-left">
              <h4 className="text-body font-semibold text-navy">PESITM College Campus Navigation</h4>
              <p className="text-label text-textmute mt-0.5">Access direct live navigation links, coordinates, and driving directions.</p>
            </div>
            <div className="flex gap-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=PESITM+Shivamogga"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 h-9 bg-orange hover:bg-orange/90 text-white text-label font-medium rounded-pill transition-colors shadow-sm"
              >
                <ExternalLink size={13} />
                Open Google Maps
              </a>
              <a
                href="https://www.openstreetmap.org/?mlat=13.9338&mlon=75.5642#map=17/13.9338/75.5642"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 h-9 bg-navy hover:bg-navy/90 text-white text-label font-medium rounded-pill transition-colors shadow-sm"
              >
                <ExternalLink size={13} />
                Open OSM
              </a>
            </div>
          </div>
        </div>
      )}

      {viewMode === "nav" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="relative rounded-card overflow-hidden border border-gray-100 shadow-inner" style={{ height: 400 }}>
            <iframe
              title="PESITM Shivamogga Live Navigation Map"
              src={
                userPos
                  ? `https://maps.google.com/maps?saddr=${userPos.lat},${userPos.lng}&daddr=PESITM%20Shivamogga&t=${mapLayer}&z=14&output=embed`
                  : `https://maps.google.com/maps?q=PESITM%20Shivamogga&t=${mapLayer}&z=17&ie=UTF8&iwloc=&output=embed`
              }
              style={{ width: '100%', height: '100%', border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Interactive Locate Controller (Left) */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-100 max-w-[280px] space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <Navigation size={15} className="text-orange" />
                  <span className="text-label font-bold text-navy uppercase tracking-wider">Live Position</span>
                </div>
                {locationStatus === "success" && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    CONNECTED
                  </span>
                )}
              </div>

              <p className="text-[12px] text-textmute leading-snug">
                Click below to compute a direct route from your current GPS location to PESITM Campus.
              </p>

              <button
                onClick={locate}
                disabled={locationStatus === "loading"}
                className="w-full flex items-center justify-center gap-2 h-9 bg-orange hover:bg-orange/90 disabled:opacity-60 text-white text-body font-semibold rounded-lg transition-colors shadow-sm"
              >
                {locationStatus === "loading" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Finding GPS Signal…
                  </>
                ) : (
                  <>
                    <MapPin size={14} />
                    Locate Me & Route
                  </>
                )}
              </button>

              {locationStatus === "success" && userPos && (
                <div className="bg-page rounded-lg p-2 border border-gray-200/50 space-y-1">
                  <p className="text-[10px] text-textmute uppercase tracking-wider font-semibold">Your Coordinates</p>
                  <p className="text-body font-medium text-navy text-[11px]">
                    📍 {userPos.lat.toFixed(5)}, {userPos.lng.toFixed(5)}
                  </p>
                </div>
              )}

              {locationStatus === "error" && (
                <div className="flex items-start gap-1.5 text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-snug">{errorMsg}</p>
                </div>
              )}
            </div>

            {/* Floating Map Layer Selector Control (Right) */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-md border border-gray-100 flex flex-col gap-1">
              <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-100 mb-1">
                <Layers size={13} className="text-orange" />
                <span className="text-label font-bold text-navy uppercase tracking-wider">Map Layers</span>
              </div>
              {[
                { id: "h", label: "Hybrid Satellite" },
                { id: "m", label: "Standard Map" },
                { id: "p", label: "Terrain View" }
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setMapLayer(layer.id)}
                  className={`px-3 py-1.5 rounded-lg text-label font-medium text-left transition-all duration-150 min-w-[130px]
                    ${mapLayer === layer.id
                      ? "bg-orange text-white shadow-sm"
                      : "text-navy hover:bg-page"}`}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-page rounded-card border border-gray-100">
            <h4 className="text-body font-semibold text-navy">Route Status</h4>
            <p className="text-label text-textmute mt-0.5">
              {userPos
                ? "Showing route directions inside the map from your current position on the highway to PESITM Campus."
                : "Awaiting your location permission to calculate distances and driving/walking tracks."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
