import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVehicleStore } from '@/stores/vehicleStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Car, Users, Fuel, IndianRupee, ArrowLeft, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentVehicle: vehicle, isLoading, fetchVehicle } = useVehicleStore();

  useEffect(() => {
    if (id) fetchVehicle(id);
  }, [id, fetchVehicle]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Vehicle not found</h2>
        <Link to="/vehicles">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Fleet
          </Button>
        </Link>
      </div>
    );
  }

  const pricingLabel = vehicle.pricingType === 'perKm' ? 'per km' : vehicle.pricingType === 'perHour' ? 'per hour' : 'fixed rate';

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/vehicles" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Fleet
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-video rounded-lg bg-muted overflow-hidden">
            {vehicle.images?.[0] ? (
              <img src={vehicle.images[0].url} alt={vehicle.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Car className="h-24 w-24" />
              </div>
            )}
          </div>
          {vehicle.images && vehicle.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {vehicle.images.slice(1, 5).map((img) => (
                <div key={img._id} className="aspect-video rounded-md bg-muted overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{vehicle.name}</h1>
              <p className="text-muted-foreground capitalize">{vehicle.category} • {vehicle.vehicleType}</p>
            </div>
            <Badge variant={vehicle.isAvailable ? 'default' : 'destructive'}>
              {vehicle.isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
          </div>

          {vehicle.description && (
            <p className="text-muted-foreground mb-6">{vehicle.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-semibold">{vehicle.seatingCapacity} seats</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Fuel className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Fuel Type</p>
                <p className="font-semibold capitalize">{vehicle.fuelType}</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {vehicle.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {vehicle.amenities.map((amenity) => (
                  <span key={amenity} className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    <Check className="h-3.5 w-3.5" />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="p-6 rounded-lg border bg-blue-50/50 mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <IndianRupee className="h-6 w-6 text-primary" />
              <span className="text-4xl font-bold text-primary">{vehicle.rate}</span>
              <span className="text-muted-foreground">{pricingLabel}</span>
            </div>
            {vehicle.minimumFare > 0 && (
              <p className="text-sm text-muted-foreground">
                Minimum fare: {formatCurrency(vehicle.minimumFare)}
              </p>
            )}
          </div>

          <Link to={`/book/${vehicle._id}`}>
            <Button size="lg" className="w-full" disabled={!vehicle.isAvailable}>
              {vehicle.isAvailable ? 'Book This Vehicle' : 'Currently Unavailable'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
