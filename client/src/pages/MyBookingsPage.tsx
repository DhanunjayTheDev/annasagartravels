import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBookingStore } from '@/stores/bookingStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Calendar, MapPin, ArrowRight, Bus, Car, IndianRupee } from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';

export default function MyBookingsPage() {
  const { bookings, fetchMyBookings, isLoading } = useBookingStore();

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
          <p className="text-muted-foreground mb-4">Start your journey by booking a vehicle.</p>
          <Link to="/vehicles">
            <Button>Browse Vehicles</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left section */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                      {booking.vehicleSnapshot.vehicleType === 'bus' ? (
                        <Bus className="h-6 w-6 text-primary" />
                      ) : (
                        <Car className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{booking.vehicleSnapshot.name}</h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mb-2">{booking.bookingId}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.trip.pickupLocation}
                          <ArrowRight className="h-3 w-3" />
                          {booking.trip.dropLocation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(booking.schedule.startDateTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right section */}
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <p className="text-lg font-semibold flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {formatCurrency(booking.pricing.finalAmount)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {booking.payment.status}
                      </Badge>
                    </div>
                    <Link to={`/booking/${booking._id}/confirmation`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        View <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
