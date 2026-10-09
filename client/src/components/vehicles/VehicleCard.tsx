import { Link } from 'react-router-dom';
import { Car, Users, Fuel, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Vehicle } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const pricingLabel = vehicle.pricingType === 'perKm' ? '/km' : vehicle.pricingType === 'perHour' ? '/hr' : '';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {vehicle.images?.[0] ? (
          <img
            src={vehicle.images[0].url}
            alt={vehicle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Car className="h-16 w-16" />
          </div>
        )}
        <Badge className="absolute top-3 left-3">
          {vehicle.vehicleType === 'car' ? 'Car' : 'Bus'}
        </Badge>
        {!vehicle.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Currently Unavailable</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{vehicle.name}</h3>
        <p className="text-sm text-muted-foreground capitalize mb-3">{vehicle.category}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {vehicle.seatingCapacity} seats
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Fuel className="h-3.5 w-3.5" />
            {vehicle.fuelType}
          </span>
          {vehicle.amenities.slice(0, 2).map((a) => (
            <Badge key={a} variant="secondary" className="text-xs">
              {a}
            </Badge>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4 text-primary" />
            <span className="text-lg font-bold text-primary">{vehicle.rate}</span>
            <span className="text-sm text-muted-foreground">{pricingLabel}</span>
          </div>
          <Link to={`/book/${vehicle._id}`}>
            <Button size="sm" disabled={!vehicle.isAvailable}>
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
