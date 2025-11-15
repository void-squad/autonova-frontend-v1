import { useState, useEffect } from 'react';
import { Calendar, Car, Clock, Wrench, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { api } from '@/lib/api/axios-config';
import { Vehicle } from '@/types';

const SERVICE_TYPES = ['General Service', 'Oil Change', 'Brake Service', 'Engine Diagnostics', 'AC Service', 'Battery Replacement', 'Tire Replacement', 'Wheel Alignment', 'Full Inspection', 'Detailing Service'];

const mockVehicles = [
  { id: '1', name: '2022 Honda Civic - ABC 1234' },
  { id: '2', name: '2021 Toyota Camry - XYZ 5678' },
  { id: '3', name: '2023 Ford Mustang - DEF 9012' },
];

const mockTimeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

export default function BookAppointment() {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string }>>(mockVehicles);
  const [availableSlots, setAvailableSlots] = useState(mockTimeSlots);
  const [loadingSlots, setLoadingSlots] = useState(false);
  type FormData = {
    vehicleId: string;
    serviceType: string;
    appointmentDate: string;
    timeSlot: string;
    notes: string;
  };
  type FormErrors = Partial<Record<keyof FormData, string>>;

  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({ vehicleId: '', serviceType: '', appointmentDate: '', timeSlot: '', notes: '' });

  useEffect(() => {
    // Fetch vehicles for the authenticated customer when the page loads
    const fetchVehicles = async () => {
      try {
        const data = await api<Vehicle[]>('/api/customers/me/vehicles');
        if (Array.isArray(data)) {
          const mapped = data.map((v) => ({
            id: String(v.id),
            name: `${v.year} ${v.make} ${v.model} - ${v.licensePlate}`,
          }));
          setVehicles(mapped);
        }
      } catch (err) {
        // Keep mock vehicles on error and log for debugging
        // console.error('Failed to load vehicles', err);
      }
    };

    fetchVehicles();

  if (formData.appointmentDate) {
    setLoadingSlots(true);

    // Construct start/end for that date
    const start = `${formData.appointmentDate}T09:00:00+05:30`;
    const end = `${formData.appointmentDate}T18:00:00+05:30`;

    fetch(`/api/v1/appointments/availability/slots?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch slots");
        return res.json();
      })
      .then((data) => {
        // Convert the slot objects [{start, end}, ...] into display strings like "09:00 AM"
        const slots = data.map(slot => {
          const date = new Date(slot.start);
          return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        });
        setAvailableSlots(slots);
      })
      .catch((err) => {
        console.error("Error fetching slots:", err);
        setAvailableSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }
}, [formData.appointmentDate]);



  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.vehicleId) newErrors.vehicleId = 'Please select a vehicle';
    if (!formData.serviceType) newErrors.serviceType = 'Please select a service type';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Please select a date';
    if (!formData.timeSlot) newErrors.timeSlot = 'Please select a time slot';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 // Extract customer ID from localStorage
  const userStr = localStorage.getItem("authUser");
  const user = userStr ? JSON.parse(userStr) : null;
  const customerId = user?.id;

  // Convert numeric ID to UUID-like string for backend
  const customerUuid = customerId ? `00000000-0000-0000-0000-${String(customerId).padStart(12, '0')}` : null;

  const handleSubmit = async () => {
  if (!validate()) return;

  setLoading(true);
  setErrors({});

  try {
    // Example: convert timeSlot and appointmentDate to ISO timestamps
    const start = new Date(`${formData.appointmentDate}T${convertTo24Hour(formData.timeSlot)}:00+05:30`);

    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour slot

    const selectedVehicleId = formData.vehicleId;
    const vehicleUuid = selectedVehicleId
      ? `00000000-0000-0000-0000-${String(selectedVehicleId).padStart(12, '0')}`
      : null;
    const vehicleName = vehicles.find((v) => v.id === formData.vehicleId)?.name || 'Unknown';

    const payload = {
      customerId: customerUuid,
      customerUsername: user?.userName,
      vehicleId: vehicleUuid,
      vehicleName,
      serviceType: formData.serviceType,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      preferredEmployeeId: null,
      notes: formData.notes,
    };


    const res = await fetch("/api/v1/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to create appointment");
    }

    const data = await res.json();
    alert(`Appointment booked successfully! Status: ${data.status}`);
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

// helper function to convert "09:00 AM" → "09:00" and "01:00 PM" → "13:00"
function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
  return `${hours}:${minutes}`;
}


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