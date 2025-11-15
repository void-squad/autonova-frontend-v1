import { useState } from 'react';
import { Calendar, Car, Clock, X, Edit, ChevronRight, Filter } from 'lucide-react';

const mockAppointments = [
  { id: '1', vehicle: '2022 Honda Civic', service: 'Oil Change', date: '2025-11-10', time: '10:00 AM', status: 'Pending', created: '2025-11-05' },
  { id: '2', vehicle: '2021 Toyota Camry', service: 'Brake Service', date: '2025-11-15', time: '02:00 PM', status: 'Accepted', created: '2025-11-03' },
  { id: '3', vehicle: '2022 Honda Civic', service: 'Full Inspection', date: '2025-11-08', time: '09:00 AM', status: 'Completed', created: '2025-10-25' },
  { id: '4', vehicle: '2023 Ford Mustang', service: 'Engine Diagnostics', date: '2025-11-20', time: '11:00 AM', status: 'Pending', created: '2025-11-06' },
  { id: '5', vehicle: '2022 Honda Civic', service: 'AC Service', date: '2025-10-30', time: '03:00 PM', status: 'Rejected', created: '2025-10-20' },
];

export default function MyAppointments() {
  const [appointments] = useState(mockAppointments);
  const [filter, setFilter] = useState('all');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

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

  const handleCancel = (id) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      alert(`Appointment ${id} cancelled successfully`);
    }
  };

  const handleReschedule = (apt) => {
    setRescheduleModal(apt);
    setRescheduleData({ date: apt.date, time: apt.time });
  };

  const submitReschedule = () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      alert('Please select both date and time');
      return;
    }
    alert(`Appointment rescheduled to ${rescheduleData.date} at ${rescheduleData.time}`);
    setRescheduleModal(null);
  };

  const filteredAppointments = filter === 'all' ? appointments : appointments.filter(a => a.status.toLowerCase() === filter);

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
                  {apt.status === 'Pending' && (
                    <>
                      <button onClick={() => handleReschedule(apt)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Reschedule
                      </button>
                      <button onClick={() => handleCancel(apt.id)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100 flex items-center gap-2">
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </>
                  )}
                  {apt.status === 'Accepted' && (
                    <button onClick={() => handleReschedule(apt)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Reschedule
                    </button>
                  )}
                  {(apt.status === 'Completed' || apt.status === 'Rejected') && (
                    <button className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      View Details
                    </button>
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
      </div>

      {rescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Reschedule Appointment</h3>
            <p className="text-gray-600 mb-4">{rescheduleModal.service} - {rescheduleModal.vehicle}</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium block mb-2">New Date</label>
                <input type="date" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={rescheduleData.date} onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">New Time</label>
                <select className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={rescheduleData.time} onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}>
                  <option value="">Select time</option>
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>01:00 PM</option>
                  <option>02:00 PM</option>
                  <option>03:00 PM</option>
                  <option>04:00 PM</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRescheduleModal(null)} className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={submitReschedule} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}