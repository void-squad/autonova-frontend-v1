import { useState, useEffect } from 'react';
import { Calendar, Car, Clock, Check, X, Filter, Search, User, Loader2 } from 'lucide-react';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);

  // ✅ Fetch all appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8080/api/v1/appointments/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch appointments');
        const data = await res.json();

        const formatted = data.map(a => ({
          id: a.id,
          customer: a.customerName || 'Unknown Customer',
          vehicle: a.vehicleId || 'Unknown Vehicle',
          service: a.serviceType,
          date: new Date(a.startTime).toISOString().split('T')[0],
          time: new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: a.status.charAt(0).toUpperCase() + a.status.slice(1).toLowerCase(),
       
          created: new Date(a.createdAt).toISOString().split('T')[0],
        }));

        setAppointments(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // ✅ (Optional) Fetch employee list (if backend endpoint exists)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/employees', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        setEmployees(data.map(e => ({ id: e.id, name: e.name })));
      } catch {
        setEmployees([]); // fallback if no endpoint yet
      }
    };
    fetchEmployees();
  }, []);

  // ✅ Helpers
  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Accepted: 'bg-green-100 text-green-800 border-green-300',
      Completed: 'bg-blue-100 text-blue-800 border-blue-300',
      Rejected: 'bg-red-100 text-red-800 border-red-300',
      Cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[status] || '';
  };

  // ✅ Update status (Accept / Reject / Complete)
  const handleStatusChange = async (id, newStatus) => {
    if (!confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;

    try {
      const res = await fetch(`http://localhost:8080/api/v1/appointments/${id}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to update status');

      setAppointments(appointments.map(a =>
        a.id === id ? { ...a, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase() } : a
      ));
    } catch (err) {
      console.error(err);
      alert('Error updating appointment status');
    }
  };

  // ✅ Filters
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch =
      apt.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || apt.status.toLowerCase() === filterStatus;
    const matchesDate = !filterDate || apt.date === filterDate;
    const matchesEmployee = filterEmployee === 'all' || apt.employee === filterEmployee;
    return matchesSearch && matchesStatus && matchesDate && matchesEmployee;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'Pending').length,
    accepted: appointments.filter(a => a.status === 'Accepted').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
              <Car className="h-6 w-6 text-white" />
            </span>
            <span className="text-2xl font-bold">Autonova Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Administrator</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Appointment Management</h1>
          <p className="text-gray-600 text-lg">Manage and track all service appointments</p>
        </div>

        {/* ✅ Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Appointments</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-900">{stats.pending}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-800 mb-1">Accepted</div>
            <div className="text-3xl font-bold text-green-900">{stats.accepted}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800 mb-1">Completed</div>
            <div className="text-3xl font-bold text-blue-900">{stats.completed}</div>
          </div>
        </div>

        {/* ✅ Filter Section */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, vehicle, or service..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="px-4 py-2 border rounded-md" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input type="date" className="px-4 py-2 border rounded-md" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
      
          </div>
        </div>

        {/* ✅ Appointment Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                 
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{apt.customer}</div>
                      <div className="text-sm text-gray-500">ID: {apt.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{apt.vehicle}</td>
                    <td className="px-6 py-4 text-sm">{apt.service}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{apt.date}</div>
                      <div className="text-sm text-gray-500">{apt.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>{apt.status}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {apt.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(apt.id, 'Accepted')}
                              className="p-2 bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(apt.id, 'Rejected')}
                              className="p-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No appointments found</h3>
              <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
