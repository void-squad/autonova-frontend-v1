import { useState, useEffect } from 'react';
import { Calendar, Car, Clock, Wrench, ArrowLeft, Loader2, FileText } from 'lucide-react';

const SERVICE_TYPES = ['General Service', 'Oil Change', 'Brake Service', 'Engine Diagnostics', 'AC Service', 'Battery Replacement', 'Tire Replacement', 'Wheel Alignment', 'Full Inspection', 'Detailing Service'];

const mockVehicles = [
  { id: '1', name: '2022 Honda Civic - ABC 1234' },
  { id: '2', name: '2021 Toyota Camry - XYZ 5678' },
  { id: '3', name: '2023 Ford Mustang - DEF 9012' },
];

const mockTimeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

export default function BookAppointment() {
  const [loading, setLoading] = useState(false);
  const [vehicles] = useState(mockVehicles);
  const [availableSlots, setAvailableSlots] = useState(mockTimeSlots);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ vehicleId: '', serviceType: '', appointmentDate: '', timeSlot: '', notes: '' });

  useEffect(() => {
    if (formData.appointmentDate) {
      setLoadingSlots(true);
      setTimeout(() => { setAvailableSlots(mockTimeSlots); setLoadingSlots(false); }, 500);
    }
  }, [formData.appointmentDate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.vehicleId) newErrors.vehicleId = 'Please select a vehicle';
    if (!formData.serviceType) newErrors.serviceType = 'Please select a service type';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Please select a date';
    if (!formData.timeSlot) newErrors.timeSlot = 'Please select a time slot';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { alert('Appointment booked successfully! Status: Pending'); setLoading(false); }, 1000);
  };

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
          <button className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Book an Appointment</h1>
          <p className="text-gray-600 text-lg">Schedule your vehicle service with ease</p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold">Appointment Details</h2>
            <p className="text-gray-600 mt-1">Fill in the details below to book your service appointment</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium block">Select Vehicle</label>
              <div className="relative">
                <Car className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <select className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}>
                  <option value="">Choose your vehicle</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              {errors.vehicleId && <p className="text-sm text-red-600">{errors.vehicleId}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Service Type</label>
              <div className="relative">
                <Wrench className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <select className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}>
                  <option value="">Select service type</option>
                  {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {errors.serviceType && <p className="text-sm text-red-600">{errors.serviceType}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Appointment Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" min={new Date().toISOString().split('T')[0]} value={formData.appointmentDate} onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })} />
              </div>
              {errors.appointmentDate && <p className="text-sm text-red-600">{errors.appointmentDate}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Available Time Slots</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <select className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" value={formData.timeSlot} onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })} disabled={!formData.appointmentDate || loadingSlots}>
                  <option value="">{!formData.appointmentDate ? 'Select a date first' : loadingSlots ? 'Loading...' : 'Choose a time slot'}</option>
                  {availableSlots.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {errors.timeSlot && <p className="text-sm text-red-600">{errors.timeSlot}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Additional Notes (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" placeholder="Any specific requirements or issues?" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button className="flex-1 h-12 border rounded-md hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 shadow-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Booking...</> : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}