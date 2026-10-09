import { useEffect, useState, FormEvent } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus, Pencil, Trash2, X, Car, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Vehicle {
  _id: string;
  name: string;
  vehicleType: string;
  category: string;
  seatingCapacity: number;
  rate: number;
  pricingType: string;
  isAvailable: boolean;
  registrationNumber: string;
  images: string[];
}

const emptyForm = {
  name: '',
  vehicleType: 'car',
  category: 'sedan',
  seatingCapacity: 4,
  rate: 0,
  pricingType: 'per_km',
  minimumFare: 0,
  fuelType: 'diesel',
  registrationNumber: '',
  description: '',
  amenities: '',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vehicles?limit=100');
      setVehicles(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setImages(null);
    setShowModal(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditId(v._id);
    setForm({
      name: v.name,
      vehicleType: v.vehicleType,
      category: v.category,
      seatingCapacity: v.seatingCapacity,
      rate: v.rate,
      pricingType: v.pricingType,
      minimumFare: 0,
      fuelType: 'diesel',
      registrationNumber: v.registrationNumber,
      description: '',
      amenities: '',
    });
    setImages(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') {
          const arr = String(v).split(',').map((a) => a.trim()).filter(Boolean);
          arr.forEach((a) => fd.append('amenities', a));
        } else {
          fd.append(k, String(v));
        }
      });
      if (images) {
        Array.from(images).forEach((f) => fd.append('images', f));
      }

      if (editId) {
        await api.put(`/admin/vehicles/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Vehicle updated');
      } else {
        await api.post('/admin/vehicles', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Vehicle created');
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/admin/vehicles/${id}`);
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await api.put(`/admin/vehicles/${id}`, { isAvailable: !current });
      fetchVehicles();
    } catch (err: any) {
      toast.error('Failed to update availability');
    }
  };

  const filtered = vehicles.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.registrationNumber.toLowerCase().includes(search.toLowerCase())
  );

  const inputClasses = 'w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-sm text-gray-500 mt-1">{vehicles.length} vehicles in fleet</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/25">
          <Plus className="h-4 w-4" /> Add Vehicle
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vehicles..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Seats</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Rate</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded-lg animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No vehicles found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                          <Car className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{v.name}</p>
                          <p className="text-xs text-gray-400">{v.registrationNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">{v.vehicleType}</td>
                    <td className="px-6 py-4 capitalize text-gray-600">{v.category}</td>
                    <td className="px-6 py-4 text-gray-600">{v.seatingCapacity}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(v.rate)}<span className="text-gray-400 font-normal">/{v.pricingType.replace('per_', '')}</span></td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAvailability(v._id, v.isAvailable)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${v.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${v.isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {v.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><Pencil className="h-4 w-4 text-gray-500" /></button>
                        <button onClick={() => handleDelete(v._id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{editId ? 'Update vehicle details' : 'Add a new vehicle to fleet'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClasses} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                  <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} className={inputClasses}>
                    <option value="car">Car</option>
                    <option value="bus">Bus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClasses}>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="luxury">Luxury</option>
                    <option value="mini_bus">Mini Bus</option>
                    <option value="standard_bus">Standard Bus</option>
                    <option value="luxury_bus">Luxury Bus</option>
                    <option value="sleeper_bus">Sleeper Bus</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Seats</label>
                  <input type="number" min={1} value={form.seatingCapacity} onChange={(e) => setForm({ ...form, seatingCapacity: +e.target.value })} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fuel Type</label>
                  <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} className={inputClasses}>
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="cng">CNG</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rate (₹)</label>
                  <input type="number" min={0} value={form.rate} onChange={(e) => setForm({ ...form, rate: +e.target.value })} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pricing Type</label>
                  <select value={form.pricingType} onChange={(e) => setForm({ ...form, pricingType: e.target.value })} className={inputClasses}>
                    <option value="per_km">Per KM</option>
                    <option value="per_day">Per Day</option>
                    <option value="per_trip">Per Trip</option>
                    <option value="per_seat">Per Seat</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Registration Number</label>
                <input type="text" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amenities (comma separated)</label>
                <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="AC, Music, USB Charging" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputClasses} />
              </div>
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Images</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
                </div>
              )}
              <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25">
                {submitting ? 'Saving...' : editId ? 'Update Vehicle' : 'Create Vehicle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
