import { useState, useEffect, useCallback } from 'react';
import { Calendar, Car, Clock, X, Edit, Filter, Loader2, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [confirmCancelModal, setConfirmCancelModal] = useState(null); // id of appointment to cancel
  const [notification, setNotification] = useState(null); // { message: string, type: 'success' | 'error' }
  
  // New state for dynamic slot loading
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSlotLoading, setIsSlotLoading] = useState(false);


  // --- Customer ID Extraction ---
  // Assuming a user object stored in localStorage has an 'id' property (e.g., 23)
  const userStr = localStorage.getItem("authUser");
  const user = userStr ? JSON.parse(userStr) : null;
  const customerId = user?.id; // e.g., 23
  
  // Construct the UUID format required by the backend: 00000000-0000-0000-0000-0000000000XX
  const customerUuid = customerId
    ? `00000000-0000-0000-0000-${String(customerId).padStart(12, '0')}`
    : null;

  const API_BASE = "http://localhost:8080/api/v1/appointments";

  // --- Fetch Appointments (Real API Call) ---
  const fetchAppointments = useCallback(async () => {
    if (!customerUuid) {
      setLoading(false);
      console.warn("No customer ID found. Cannot fetch appointments.");
      return;
    }

    try {
      setLoading(true);
      // REAL API CALL: GET /customer/{customerId}
      const fetchUrl = `${API_BASE}/customer/${customerUuid}`;
      
      const res = await fetch(fetchUrl);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP Error ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      
      const formatted = data.map(a => ({
        id: a.id,
        vehicle: a.vehicleName || 'Unknown Vehicle',

        service: a.serviceType,
        // Ensure status is capitalized for display
        status: a.status.charAt(0).toUpperCase() + a.status.slice(1).toLowerCase(),
        
        // Date/Time formatting based on startTime
        date: new Date(a.startTime).toISOString().split('T')[0],
        time: new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        
        created: new Date(a.createdAt).toISOString().split('T')[0],
        startTime: a.startTime,
        endTime: a.endTime
      }));

      setAppointments(formatted);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setNotification({ message: `Could not load appointments. ${err.message || 'Network error.'}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [customerUuid]);

  // --- Fetch Available Slots (Real API Call) ---
  // --- Fetch Available Slots (Real API Call) ---
const fetchAvailableSlots = useCallback(async (selectedDate) => {
  if (!selectedDate) {
    setAvailableSlots([]);
    return;
  }

  setIsSlotLoading(true);
  setAvailableSlots([]);
  setRescheduleData(prev => ({ ...prev, time: '' })); // Clear selected time

  try {
    const localDateTime = new Date(`${selectedDate}T09:00:00`);
    const offsetMinutes = localDateTime.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offsetMinutes / 60)).toString().padStart(2, "0");
    const offsetMins = Math.abs(offsetMinutes % 60).toString().padStart(2, "0");
    const timezoneOffsetSign = offsetMinutes <= 0 ? "+" : "-";
    const timezoneOffset = `${timezoneOffsetSign}${offsetHours}:${offsetMins}`;

    const rangeStartISO = `${selectedDate}T10:00:00${timezoneOffset}`;
const rangeEndISO   = `${selectedDate}T19:00:00${timezoneOffset}`;

    const fetchUrl = `${API_BASE}/availability/slots?start=${encodeURIComponent(rangeStartISO)}&end=${encodeURIComponent(rangeEndISO)}`;
    const res = await fetch(fetchUrl);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP Error ${res.status}: ${errorText}`);
    }

    const data = await res.json();

    // Format slots in 12-hour format with AM/PM and exclude current appointment's slot
    const formattedSlots = data.map(slot => {
  const dateObj = new Date(slot.start);
  return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      })
      .filter(slotTime => slotTime !== rescheduleModal?.time);

    setAvailableSlots(formattedSlots);

  } catch (err) {
    console.error("Error fetching available slots:", err);
    setNotification({ message: `Could not load available slots. ${err.message || 'Network error.'}`, type: 'error' });
    setAvailableSlots([]);
  } finally {
    setIsSlotLoading(false);
  }
}, [API_BASE, rescheduleModal]);




  // Effect to trigger slot fetch when date changes in modal
  useEffect(() => {
  if (rescheduleModal && rescheduleData.date) {
    fetchAvailableSlots(rescheduleData.date);
  }
}, [rescheduleModal, rescheduleData.date, fetchAvailableSlots]);


  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // --- Execute Cancel Appointment (Real API Call) ---
  const executeCancelAppointment = async (id) => {
    setConfirmCancelModal(null); // Close the confirmation modal first

    try {
      // REAL API CALL: POST /{id}/cancel
      const res = await fetch(`${API_BASE}/${id}/cancel`, {
        method: "POST",
      });

      if (res.ok) {
        setNotification({ message: `Appointment ${id} cancelled successfully.`, type: 'success' });
        fetchAppointments(); // Refresh list to show 'Cancelled' status
      } else {
        const errorText = await res.text();
        setNotification({ message: `Failed to cancel appointment ${id}. Error: ${errorText}`, type: 'error' });
        console.error("Cancellation failed:", errorText);
      }

    } catch (err) {
      console.error(err);
      setNotification({ message: "An unexpected network error occurred while cancelling the appointment.", type: 'error' });
    }
  };

  // --- Reschedule Appointment (Real API Call) ---
  const rescheduleAppointment = async (id, date, time) => {
    try {
      // 1. Combine date & time and calculate local offset
      const localDateTime = new Date(`${date}T${time}`);
      
      // Calculate Timezone Offset (e.g., +05:30)
      const offsetMinutes = localDateTime.getTimezoneOffset(); // e.g., -330 for UTC+5:30
      const offsetHours = Math.abs(Math.floor(offsetMinutes / 60)).toString().padStart(2, "0");
      const offsetMins = Math.abs(offsetMinutes % 60).toString().padStart(2, "0");
      // If offsetMinutes is negative (Local is ahead of UTC), sign is +
      const timezoneOffsetSign = offsetMinutes <= 0 ? "+" : "-";
      const timezoneOffset = `${timezoneOffsetSign}${offsetHours}:${offsetMins}`;

      // Start Time ISO string
      const startISO = `${date}T${time}:00${timezoneOffset}`;

      // 2. Fix for 1-hour shift: Calculate the end time string 1 hour later without relying on Date.toISOString()
      // This ensures we append the correct local offset to the correct local end time.
      const [hour, minute] = time.split(':').map(Number);
      const newHour = hour + 1;
      const endTimeStr = `${String(newHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      
      // End Time ISO string
      const endISO = `${date}T${endTimeStr}:00${timezoneOffset}`;

      console.log(`Attempting reschedule of ${id}. Start ISO: ${startISO}, End ISO: ${endISO}`);
      
      // REAL API CALL: POST /{id}/reschedule?start={startISO}&end={endISO}
      const rescheduleUrl = `${API_BASE}/${id}/reschedule?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`;
      
      const res = await fetch(rescheduleUrl, {
        method: "POST",
      });

      if (res.ok) {
        setNotification({ message: `Appointment ${id} rescheduled successfully to ${date} ${time}.`, type: 'success' });
        setRescheduleModal(null); // Close modal
        setRescheduleData({ date: '', time: '' }); // Reset form
        fetchAppointments(); // Refresh list
      } else {
        const errorText = await res.text();
        setNotification({ message: `Failed to reschedule appointment ${id}. Error: ${errorText}`, type: 'error' });
        console.error("Reschedule failed:", errorText);
      }

    } catch (err) {
      console.error("Error rescheduling appointment:", err);
      setNotification({ message: "Error rescheduling appointment.", type: 'error' });
    }
  };

  // Utility to get status colors
  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Accepted: 'bg-green-100 text-green-800 border-green-300',
      Completed: 'bg-blue-100 text-blue-800 border-blue-300',
      Rejected: 'bg-red-100 text-red-800 border-red-300',
      Cancelled: 'bg-gray-200 text-gray-800 border-gray-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-500 border-gray-300';
  };

  const filteredAppointments =
    filter === 'all'
      ? appointments
      : appointments.filter(a => a.status.toLowerCase() === filter);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl transition-all duration-300 transform ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        } animate-bounce-in`} role="alert" onClick={() => setNotification(null)}>
          <div className="flex items-center">
            {notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertTriangle className="h-5 w-5 mr-2" />}
            <span className="font-medium">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 text-white hover:text-opacity-75">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
              <Car className="h-6 w-6 text-white" />
            </span>
            <span className="text-2xl font-bold">Autonova</span>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all">
            Book New Appointment
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900">My Appointments</h1>
          <p className="text-gray-600 text-lg">View and manage your service appointments</p>
        </div>
        
        

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Filter Buttons */}
            <div className="mb-6 flex flex-wrap gap-2 p-3 bg-white border rounded-xl shadow-sm">
              <span className="flex items-center text-gray-500 mr-2 font-semibold text-sm"><Filter className="h-4 w-4 mr-1"/> Status:</span>
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
              <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Pending</button>
              <button onClick={() => setFilter('accepted')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'accepted' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Accepted</button>
              <button onClick={() => setFilter('rejected')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'rejected' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Rejected</button>
              <button onClick={() => setFilter('cancelled')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'cancelled' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancelled</button>
              <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Completed</button>
            </div>

            <div className="grid gap-4">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{apt.service}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(apt.status)}`}>{apt.status}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Car className="h-4 w-4 text-blue-500" />
                          <span>Vehicle: {apt.vehicle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>Appointment Date: {new Date(apt.startTime).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>

                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>Service Time: {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(apt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Filter className="h-4 w-4 text-blue-500" />
                          <span>Booked On: {new Date(apt.created).toLocaleString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>

                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {/* Allow reschedule/cancel only for Pending and Accepted */}
                      {(apt.status === 'Pending' || apt.status === 'Accepted') && (
                        <>
                          <button onClick={() => { setRescheduleModal(apt); setRescheduleData({ date: apt.date, time: apt.time }); }} className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-2 transition-all shadow-sm">
                            <Edit className="h-4 w-4" />
                            Reschedule
                          </button>
                          <button onClick={() => setConfirmCancelModal(apt.id)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-2 transition-all shadow-sm">
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </>
                      )}
                      {(apt.status === 'Rejected' || apt.status === 'Cancelled' || apt.status === 'Completed') && (
                        <div className="px-4 py-2 text-gray-500 text-xs text-center border border-gray-100 rounded-lg">
                            No actions available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAppointments.length === 0 && (
              <div className="bg-white border rounded-xl p-12 text-center shadow-lg">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No {filter !== 'all' ? filter : ''} appointments found</h3>
                <p className="text-gray-600 mb-4">It looks like you don't have any appointments matching this status yet.</p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg font-medium transition-all">
                  Book Your Next Appointment
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform scale-100 transition-transform">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Reschedule Appointment</h3>
            <p className="text-gray-600 mb-4">{rescheduleModal.service} - {rescheduleModal.vehicle}</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium block mb-2 text-gray-700">New Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2 text-gray-700">New Time</label>
                <div className="relative">
                  <select
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white appearance-none pr-10"
  value={rescheduleData.time}
  onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
  disabled={!rescheduleData.date || isSlotLoading}
>
  <option value="">
    {isSlotLoading
      ? 'Loading slots...'
      : rescheduleData.date ? 'Select available time' : 'Select date first'
    }
  </option>
  {availableSlots.map(slot => (
    <option key={slot} value={slot}>{slot}</option>
  ))}
</select>

                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {isSlotLoading && rescheduleData.date && (
                  <p className="text-sm text-blue-600 mt-1 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-1"/> Fetching available slots...
                  </p>
                )}
                {!isSlotLoading && rescheduleData.date && availableSlots.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">No slots available for this date. Try another day.</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setRescheduleModal(null); setRescheduleData({ date: '', time: '' }); setAvailableSlots([]); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors text-gray-700">Cancel</button>
              <button
                onClick={() => rescheduleAppointment(rescheduleModal.id, rescheduleData.date, rescheduleData.time)}
                disabled={!rescheduleData.date || !rescheduleData.time || isSlotLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal (Replaces confirm()) */}
      {confirmCancelModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl transform scale-100 transition-transform text-center">
            <X className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Confirm Cancellation</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancelModal(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors text-gray-700">Keep Appointment</button>
              <button
                onClick={() => executeCancelAppointment(confirmCancelModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
              >
                Yes, Cancel It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}