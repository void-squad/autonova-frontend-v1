import { useState, useEffect } from 'react';
import { Calendar, Car, Clock, X, Edit, ChevronRight, Filter, Loader2 } from 'lucide-react';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  // ✅ Extract customer ID
  const userStr = localStorage.getItem("authUser");
  const user = userStr ? JSON.parse(userStr) : null;
  const customerId = user?.id;
  const customerUuid = customerId
    ? `00000000-0000-0000-0000-${String(customerId).padStart(12, '0')}`
    : null;

  const API_BASE = "http://localhost:8080/api/v1/appointments";

  // ✅ Fetch all appointments
  useEffect(() => {
    if (!customerUuid) return;
    fetchAppointments();
  }, [customerUuid]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/customer/${customerUuid}`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = await res.json();

      const formatted = data.map(a => ({
        id: a.id,
        vehicle: a.vehicleId || 'Unknown Vehicle',
        service: a.serviceType,
        date: new Date(a.startTime).toISOString().split('T')[0],
        time: new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: a.status.charAt(0).toUpperCase() + a.status.slice(1).toLowerCase(),
        created: new Date(a.createdAt).toISOString().split('T')[0],
        startTime: a.startTime,
        endTime: a.endTime
      }));

      setAppointments(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cancel appointment
  const cancelAppointment = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Appointment cancelled successfully");
        fetchAppointments();
      } else {
        alert("Failed to cancel appointment");
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling appointment");
    }
  };

  // ✅ Reschedule appointment
  const rescheduleAppointment = async (id, date, time) => {
    try {
      // combine date & time into ISO_OFFSET_DATE_TIME format (e.g. 2025-11-07T11:00:00+05:30)
      const localDateTime = new Date(`${date}T${time}`);
      const offsetMinutes = localDateTime.getTimezoneOffset();
      const offsetHours = Math.abs(Math.floor(offsetMinutes / 60))
        .toString()
        .padStart(2, "0");
      const offsetMins = Math.abs(offsetMinutes % 60)
        .toString()
        .padStart(2, "0");
      const offsetSign = offsetMinutes <= 0 ? "+" : "-";
      const offset = `${offsetSign}${offsetHours}:${offsetMins}`;
      const startISO = `${date}T${time}:00${offset}`;

      // assume 1 hour duration
      const end = new Date(localDateTime.getTime() + 60 * 60 * 1000);
      const endISO = `${end.toISOString().slice(0, 19)}${offset}`;

      const res = await fetch(`${API_BASE}/${id}/reschedule?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Appointment rescheduled successfully");
        setRescheduleModal(null);
        fetchAppointments();
      } else {
        const text = await res.text();
        alert("Failed to reschedule: " + text);
      }
    } catch (err) {
      console.error(err);
      alert("Error rescheduling appointment");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Accepted: 'bg-green-100 text-green-800 border-green-300',
      Completed: 'bg-blue-100 text-blue-800 border-blue-300',
      Rejected: 'bg-red-100 text-red-800 border-red-300',
      Cancelled: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || '';
  };

  const filteredAppointments =
    filter === 'all'
      ? appointments
      : appointments.filter(a => a.status.toLowerCase() === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
              <Car className="h-6 w-6 text-white" />
            </span>
            <span className="text-2xl font-bold">Autonova</span>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 shadow-sm">
            Book New Appointment
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Appointments</h1>
          <p className="text-gray-600 text-lg">View and manage your service appointments</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-md font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>All</button>
              <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-md font-medium transition-colors ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>Pending</button>
              <button onClick={() => setFilter('accepted')} className={`px-4 py-2 rounded-md font-medium transition-colors ${filter === 'accepted' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>Accepted</button>
              <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-md font-medium transition-colors ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>Completed</button>
            </div>

            <div className="grid gap-4">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold">{apt.service}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>{apt.status}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Car className="h-4 w-4" />
                          <span>{apt.vehicle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{apt.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Filter className="h-4 w-4" />
                          <span>Booked: {apt.created}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {(apt.status === 'Pending' || apt.status === 'Accepted') && (
                        <>
                          <button onClick={() => setRescheduleModal(apt)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Reschedule
                          </button>
                          <button onClick={() => cancelAppointment(apt.id)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100 flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAppointments.length === 0 && (
              <div className="bg-white border rounded-lg p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No appointments found</h3>
                <p className="text-gray-600 mb-4">You don't have any {filter !== 'all' ? filter : ''} appointments yet.</p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 shadow-sm font-medium">
                  Book Your First Appointment
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {rescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Reschedule Appointment</h3>
            <p className="text-gray-600 mb-4">{rescheduleModal.service} - {rescheduleModal.vehicle}</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium block mb-2">New Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">New Time</label>
                <select
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                >
                  <option value="">Select time</option>
                  <option>09:00</option>
                  <option>10:00</option>
                  <option>11:00</option>
                  <option>13:00</option>
                  <option>14:00</option>
                  <option>15:00</option>
                  <option>16:00</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRescheduleModal(null)} className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancel</button>
              <button
                onClick={() => rescheduleAppointment(rescheduleModal.id, rescheduleData.date, rescheduleData.time)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
