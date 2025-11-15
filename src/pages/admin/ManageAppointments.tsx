import { useState } from 'react';
import { Calendar, Car, Clock, Check, X, Filter, Search, ChevronDown, User } from 'lucide-react';

const mockAppointments = [
  { id: '1', customer: 'John Doe', vehicle: '2022 Honda Civic', service: 'Oil Change', date: '2025-11-10', time: '10:00 AM', status: 'Pending', employee: null, created: '2025-11-05' },
  { id: '2', customer: 'Jane Smith', vehicle: '2021 Toyota Camry', service: 'Brake Service', date: '2025-11-15', time: '02:00 PM', status: 'Accepted', employee: 'Mike Johnson', created: '2025-11-03' },
  { id: '3', customer: 'Bob Wilson', vehicle: '2022 Honda Civic', service: 'Full Inspection', date: '2025-11-08', time: '09:00 AM', status: 'Completed', employee: 'Sarah Lee', created: '2025-10-25' },
  { id: '4', customer: 'Alice Brown', vehicle: '2023 Ford Mustang', service: 'Engine Diagnostics', date: '2025-11-20', time: '11:00 AM', status: 'Pending', employee: null, created: '2025-11-06' },
  { id: '5', customer: 'Charlie Davis', vehicle: '2022 Honda Civic', service: 'AC Service', date: '2025-11-12', time: '03:00 PM', status: 'Pending', employee: null, created: '2025-11-07' },
  { id: '6', customer: 'Emma Wilson', vehicle: '2021 BMW X5', service: 'Tire Replacement', date: '2025-11-18', time: '01:00 PM', status: 'Accepted', employee: 'Tom Anderson', created: '2025-11-04' },
];

const mockEmployees = ['Mike Johnson', 'Sarah Lee', 'Tom Anderson', 'Lisa Chen'];

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Accepted: 'bg-green-100 text-green-800 border-green-300',
      Completed: 'bg-blue-100 text-blue-800 border-blue-300',
      Rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || '';
  };

  const handleStatusChange = (id, newStatus) => {
    if (confirm(`Are you sure you want to ${newStatus.toLowerCase()} this appointment?`)) {
      setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
      alert(`Appointment ${newStatus.toLowerCase()} successfully`);
    }
  };

  const handleAssignEmployee = (apt) => {
    setAssignModal(apt);
    setSelectedEmployee(apt.employee || '');
  };

  const submitAssignment = () => {
    if (!selectedEmployee) {
      alert('Please select an employee');
      return;
    }
    setAppointments(appointments.map(apt => apt.id === assignModal.id ? { ...apt, employee: selectedEmployee } : apt));
    alert(`Employee ${selectedEmployee} assigned successfully`);
    setAssignModal(null);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
    completed: appointments.filter(a => a.status === 'Completed').length
  };

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

        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search by customer, vehicle, or service..." className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <input type="date" className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}>
              <option value="all">All Employees</option>
              {mockEmployees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              <option value="">Unassigned</option>
            </select>
          </div>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Vehicle</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Service</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Assigned To</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
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
                      {apt.employee ? (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          {apt.employee}
                        </div>
                      ) : (
                        <button onClick={() => handleAssignEmployee(apt)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Assign</button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {apt.status === 'Pending' && (
                          <>
                            <button onClick={() => handleStatusChange(apt.id, 'Accepted')} className="p-2 bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100" title="Accept">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleStatusChange(apt.id, 'Rejected')} className="p-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100" title="Reject">
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {apt.status === 'Accepted' && !apt.employee && (
                          <button onClick={() => handleAssignEmployee(apt)} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100">Assign Employee</button>
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

      {assignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Assign Employee</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Appointment Details:</div>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="text-sm"><span className="font-medium">Customer:</span> {assignModal.customer}</div>
                <div className="text-sm"><span className="font-medium">Service:</span> {assignModal.service}</div>
                <div className="text-sm"><span className="font-medium">Date:</span> {assignModal.date} at {assignModal.time}</div>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-sm font-medium block mb-2">Select Employee</label>
              <select className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                <option value="">Choose an employee</option>
                {mockEmployees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={submitAssignment} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 font-medium">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}