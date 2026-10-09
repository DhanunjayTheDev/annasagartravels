import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useVehicleStore } from '@/stores/vehicleStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Car, IndianRupee } from 'lucide-react';
import type { BookingFormData } from '@/types';

export default function BookingPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { currentVehicle, fetchVehicle, isLoading: vehicleLoading } = useVehicleStore();
  const { createBooking, isLoading: bookingLoading } = useBookingStore();
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    pickupLocation: '',
    dropLocation: '',
    distance: '',
    tripType: 'oneWay',
    startDateTime: '',
    endDateTime: '',
    notes: '',
  });

  useEffect(() => {
    if (vehicleId) fetchVehicle(vehicleId);
  }, [vehicleId, fetchVehicle]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name,
        customerPhone: prev.customerPhone || user.phone,
        customerEmail: prev.customerEmail || user.email,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const estimatedFare = () => {
    if (!currentVehicle || !form.distance) return null;
    const distance = parseFloat(form.distance);
    if (isNaN(distance) || distance <= 0) return null;
    const base = currentVehicle.rate * distance;
    const fare = Math.max(base, currentVehicle.minimumFare || 0);
    const tax = fare * 0.05;
    return { base: fare, tax, total: fare + tax };
  };

  const fare = estimatedFare();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentVehicle) return;

    try {
      const bookingData: BookingFormData = {
        vehicleId: currentVehicle._id,
        customer: {
          name: form.customerName,
          phone: form.customerPhone,
          email: form.customerEmail,
        },
        trip: {
          pickupLocation: form.pickupLocation,
          dropLocation: form.dropLocation,
          distance: form.distance ? parseFloat(form.distance) : undefined,
          tripType: form.tripType,
        },
        schedule: {
          startDateTime: new Date(form.startDateTime).toISOString(),
          endDateTime: new Date(form.endDateTime).toISOString(),
        },
        notes: form.notes || undefined,
      };

      const booking = await createBooking(bookingData);
      toast.success('Booking created successfully!');
      navigate(`/booking/${booking._id}/confirmation`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    }
  };

  if (vehicleLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!currentVehicle) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Vehicle not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Book {currentVehicle.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Full Name"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    name="customerPhone"
                    type="tel"
                    value={form.customerPhone}
                    onChange={handleChange}
                    required
                    placeholder="10-digit mobile number"
                    pattern="[6-9][0-9]{9}"
                  />
                  <Input
                    label="Email (optional)"
                    name="customerEmail"
                    type="email"
                    value={form.customerEmail}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Pickup Location"
                    name="pickupLocation"
                    value={form.pickupLocation}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Ajmer Railway Station"
                  />
                  <Input
                    label="Drop Location"
                    name="dropLocation"
                    value={form.dropLocation}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Pushkar Temple"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Approx. Distance (km)"
                    name="distance"
                    type="number"
                    value={form.distance}
                    onChange={handleChange}
                    placeholder="e.g., 15"
                    min="1"
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Trip Type</label>
                    <select
                      name="tripType"
                      value={form.tripType}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="oneWay">One Way</option>
                      <option value="roundTrip">Round Trip</option>
                      <option value="hourly">Hourly Rental</option>
                      <option value="multiDay">Multi-Day</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Date & Time"
                    name="startDateTime"
                    type="datetime-local"
                    value={form.startDateTime}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="End Date & Time"
                    name="endDateTime"
                    type="datetime-local"
                    value={form.endDateTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special requirements..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  maxLength={500}
                />
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" isLoading={bookingLoading}>
              Confirm Booking
            </Button>
          </form>
        </div>

        {/* Fare Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {currentVehicle.images?.[0] ? (
                  <img src={currentVehicle.images[0].url} alt="" className="h-16 w-24 rounded object-cover" />
                ) : (
                  <div className="h-16 w-24 bg-muted rounded flex items-center justify-center">
                    <Car className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{currentVehicle.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{currentVehicle.category}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span>
                    {formatCurrency(currentVehicle.rate)}/{currentVehicle.pricingType === 'perKm' ? 'km' : 'hr'}
                  </span>
                </div>

                {fare && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Fare</span>
                      <span>{formatCurrency(fare.base)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (5%)</span>
                      <span>{formatCurrency(fare.tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base border-t pt-2">
                      <span>Estimated Total</span>
                      <span className="flex items-center gap-1 text-primary">
                        <IndianRupee className="h-4 w-4" />
                        {formatCurrency(fare.total)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {!fare && (
                <p className="text-xs text-muted-foreground text-center">
                  Enter distance to see estimated fare
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
