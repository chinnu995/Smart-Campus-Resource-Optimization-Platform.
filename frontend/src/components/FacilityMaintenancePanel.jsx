import { useState } from 'react'
import { Wrench, CheckCircle2, AlertTriangle, AlertCircle, Play, Users, Hammer, ClipboardCheck, Sparkles, Server } from 'lucide-react'

// Mock maintenance tasks
const INITIAL_TASKS = [
  { id: 101, room: "A-202", type: "Electrical", issue: "Flickering lights in lecture hall", status: "pending", priority: "urgent", time: "11:30 AM" },
  { id: 102, room: "B-101", type: "HVAC", issue: "Air conditioning thermostat unresponsive", status: "pending", priority: "routine", time: "12:15 PM" },
  { id: 103, room: "C-101", type: "Plumbing", issue: "Low pressure water supply leakage", status: "pending", priority: "opportunistic", time: "1:45 PM" },
]

// Mock IoT device alerts
const DEVICE_ALERTS = [
  { id: 1, name: "Chiller Temperature Probe", location: "Block B Main AC Plant", error: "Sensor Calibration Drift (+2.4°C)", severity: "warning" },
  { id: 2, name: "Air Quality Node #14", location: "Room A-301 Lab", error: "Offline / No Signal received in 15 mins", severity: "critical" },
]

export default function FacilityMaintenancePanel() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [alerts, setAlerts] = useState(DEVICE_ALERTS)
  const [systemAlert, setSystemAlert] = useState("")

  const dispatchStaff = (taskId, name) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "in_progress", assigned: name } : t))
    triggerNotification(`Dispatched Ramesh to handle ticket #${taskId} at Room ${tasks.find(t => t.id === taskId).room}`)
  }

  const resolveTask = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "resolved" } : t))
    triggerNotification(`Ticket #${taskId} marked as RESOLVED. Occupants notified automatically.`)
  }

  const restartSensor = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
    triggerNotification(`Sensor reboot command sent. Calibration check initiated.`)
  }

  const triggerNotification = (msg) => {
    setSystemAlert(msg)
    setTimeout(() => setSystemAlert(""), 4000)
  }

  return (
    <div className="space-y-4">
      {/* Toast Alert Notification */}
      {systemAlert && (
        <div className="bg-navy border-l-4 border-orange text-white p-3.5 rounded-r-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-orange" />
            <p className="text-body font-medium">{systemAlert}</p>
          </div>
          <button onClick={() => setSystemAlert("")} className="text-label hover:underline">Dismiss</button>
        </div>
      )}

      {/* Stats and Fast Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button 
          onClick={() => triggerNotification("Initiating auto-assignment algorithm based on location proximity...")}
          className="flex items-center justify-between p-3.5 bg-white border border-gray-100 hover:border-orange/30 hover:bg-orange/5 rounded-card transition-all text-left shadow-sm group"
        >
          <div>
            <p className="text-label uppercase tracking-wider text-textmute">Optimization Tool</p>
            <p className="text-body font-semibold text-navy mt-0.5">Smart Dispatch Staff</p>
          </div>
          <Users size={16} className="text-orange group-hover:scale-110 transition-transform" />
        </button>

        <button 
          onClick={() => triggerNotification("Daily facility systems report generated. Emailed to Admin.")}
          className="flex items-center justify-between p-3.5 bg-white border border-gray-100 hover:border-orange/30 hover:bg-orange/5 rounded-card transition-all text-left shadow-sm group"
        >
          <div>
            <p className="text-label uppercase tracking-wider text-textmute">Maintenance Logs</p>
            <p className="text-body font-semibold text-navy mt-0.5">Systems Daily Checklist</p>
          </div>
          <ClipboardCheck size={16} className="text-navy group-hover:scale-110 transition-transform" />
        </button>

        <button 
          onClick={() => triggerNotification("Spare parts inventory sheet opened. Redirecting to depot...")}
          className="flex items-center justify-between p-3.5 bg-white border border-gray-100 hover:border-orange/30 hover:bg-orange/5 rounded-card transition-all text-left shadow-sm group"
        >
          <div>
            <p className="text-label uppercase tracking-wider text-textmute">Inventory Depot</p>
            <p className="text-body font-semibold text-navy mt-0.5">Order Spares & Parts</p>
          </div>
          <Hammer size={16} className="text-navy group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ticket Dispatch Queue */}
        <div className="bg-white rounded-card p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-nav font-semibold text-navy flex items-center gap-2">
                <Wrench size={16} className="text-orange" />
                Live Job Dispatch Queue
              </h4>
              <span className="px-2 py-0.5 bg-orange/10 text-orange rounded-full text-label font-bold">
                {tasks.filter(t => t.status !== "resolved").length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className={`p-3.5 rounded-xl border transition-all ${
                  task.status === "resolved" ? "bg-gray-50 border-gray-100 opacity-60" : "bg-page border-gray-100/80"
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-body font-bold text-navy">{task.room}</span>
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          task.priority === "urgent" ? "bg-red-100 text-red-700" :
                          task.priority === "routine" ? "bg-amber-100 text-amber-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-[12px] text-navy font-medium mt-1">{task.issue}</p>
                      <p className="text-label text-textmute mt-0.5">Service: {task.type} · Requested: {task.time}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {task.status === "pending" && (
                        <button
                          onClick={() => dispatchStaff(task.id, "Ramesh Kumar")}
                          className="flex items-center gap-1 px-3 py-1 bg-navy hover:bg-navy/90 text-white text-label font-bold rounded-lg transition-colors shadow-sm"
                        >
                          <Play size={10} /> Dispatch
                        </button>
                      )}
                      {task.status === "in_progress" && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-label text-orange font-bold">🛠 Assigned: {task.assigned}</span>
                          <button
                            onClick={() => resolveTask(task.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-700 hover:bg-green-800 text-white text-label font-bold rounded-lg transition-colors shadow-sm"
                          >
                            <CheckCircle2 size={10} /> Complete
                          </button>
                        </div>
                      )}
                      {task.status === "resolved" && (
                        <span className="text-label text-green-700 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hardware & IoT Alerts */}
        <div className="bg-white rounded-card p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-nav font-semibold text-navy flex items-center gap-2">
                <Server size={16} className="text-navy" />
                Failing IoT Nodes & HVAC Alerts
              </h4>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-label font-bold">
                {alerts.length} Warnings
              </span>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={24} className="text-green-700 mx-auto mb-2" />
                  <p className="text-body font-semibold text-navy">All Campus Systems Active</p>
                  <p className="text-label text-textmute">No telemetry sensor warnings detected.</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="p-3.5 rounded-xl border border-red-50 bg-red-50/20 flex justify-between items-start gap-4">
                    <div className="flex gap-2">
                      <div className="mt-0.5">
                        {alert.severity === "critical" ? (
                          <AlertCircle size={15} className="text-red-600" />
                        ) : (
                          <AlertTriangle size={15} className="text-amber-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-body font-bold text-navy leading-none">{alert.name}</p>
                        <p className="text-label text-textmute mt-1">Loc: {alert.location}</p>
                        <p className="text-[11px] text-red-700 font-medium mt-0.5">{alert.error}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => restartSensor(alert.id)}
                      className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-navy text-label font-bold rounded-lg transition-colors shadow-sm shrink-0"
                    >
                      Reboot Node
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
