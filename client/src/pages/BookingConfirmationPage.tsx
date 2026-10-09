import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookingStore } from '@/stores/bookingStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, ArrowRight, Download, Phone, IndianRupee } from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { currentBooking, fetchBooking, createPaymentOrder, verifyPayment, isLoading } = useBookingStore();

  useEffect(() => {
    if (bookingId) fetchBooking(bookingId);
  }, [bookingId, fetchBooking]);

  const handlePayment = async () => {
    if (!currentBooking) return;

    try {
      const order = await createPaymentOrder(currentBooking._id);

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Annasagar Travels',
        description: `Booking ${order.bookingId}`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            if (bookingId) fetchBooking(bookingId);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: order.customer.name,
          contact: order.customer.phone,
          email: order.customer.email || '',
        },
        theme: { color: '#1a56db' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  if (isLoading || !currentBooking) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  const booking = currentBooking;
  const isPaid = booking.payment.status === 'paid';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Success header */}
      <div className="text-center mb-8">
        <CheckCircle className={`h-16 w-16 mx-auto mb-4 ${isPaid ? 'text-green-500' : 'text-yellow-500'}`} />
        <h1 className="text-2xl font-bold mb-2">
          {isPaid ? 'Booking Confirmed!' : 'Booking Created'}
        </h1>
        <p className="text-muted-foreground">
          Booking ID: <span className="font-mono font-semibold text-foreground">{booking.bookingId}</span>
        </p>
      </div>

      {/* Booking details */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Booking Details</CardTitle>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Vehicle</p>
              <p className="font-medium">{booking.vehicleSnapshot.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {booking.vehicleSnapshot.category} • {booking.vehicleSnapshot.vehicleType}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{booking.customer.name}</p>
              <p className="text-xs text-muted-foreground">{booking.customer.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pickup</p>
              <p className="font-medium">{booking.trip.pickupLocation}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Drop</p>
              <p className="font-medium">{booking.trip.dropLocation}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Start</p>
              <p className="font-medium">{formatDateTime(booking.schedule.startDateTime)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End</p>
              <p className="font-medium">{formatDateTime(booking.schedule.endDateTime)}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Fare</span>
              <span>{formatCurrency(booking.pricing.baseFare)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes</span>
              <span>{formatCurrency(booking.pricing.taxes)}</span>
            </div>
            {booking.pricing.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(booking.pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total Amount</span>
              <span className="flex items-center gap-1 text-primary">
                <IndianRupee className="h-4 w-4" />
                {formatCurrency(booking.pricing.finalAmount)}
              </span>
            </div>
          </div>

          {/* Payment status */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge className={getStatusColor(booking.payment.status)}>
                  {booking.payment.status.toUpperCase()}
                </Badge>
              </div>
              {!isPaid && booking.status !== 'cancelled' && (
                <Button onClick={handlePayment} className="gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Pay Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/my-bookings">
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            My Bookings
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/vehicles">
          <Button variant="ghost" className="w-full sm:w-auto">
            Book Another Vehicle
          </Button>
        </Link>
      </div>

      {/* Contact */}
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>Need help? <a href="tel:+919999999999" className="text-primary hover:underline inline-flex items-center gap-1"><Phone className="h-3 w-3" /> Call us</a></p>
      </div>
    </div>
  );
}
