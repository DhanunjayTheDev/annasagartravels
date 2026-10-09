import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVehicleStore } from '@/stores/vehicleStore';
import VehicleCard from '@/components/vehicles/VehicleCard';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Car, Bus, Filter } from 'lucide-react';

export default function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { vehicles, pagination, isLoading, fetchVehicles } = useVehicleStore();
  const [activeType, setActiveType] = useState(searchParams.get('vehicleType') || '');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeType) params.vehicleType = activeType;
    params.page = searchParams.get('page') || '1';
    params.limit = '12';
    params.isAvailable = 'true';
    fetchVehicles(params);
  }, [activeType, searchParams, fetchVehicles]);

  const handleTypeFilter = (type: string) => {
    setActiveType(type === activeType ? '' : type);
    setSearchParams(type && type !== activeType ? { vehicleType: type } : {});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {activeType === 'car' ? 'Cars' : activeType === 'bus' ? 'Buses' : 'Our Fleet'}
        </h1>
        <p className="text-muted-foreground">
          Browse and book from our selection of comfortable vehicles
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button
          variant={activeType === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeFilter('')}
          className="gap-1"
        >
          <Filter className="h-4 w-4" />
          All
        </Button>
        <Button
          variant={activeType === 'car' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeFilter('car')}
          className="gap-1"
        >
          <Car className="h-4 w-4" />
          Cars
        </Button>
        <Button
          variant={activeType === 'bus' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeFilter('bus')}
          className="gap-1"
        >
          <Bus className="h-4 w-4" />
          Buses
        </Button>
      </div>

      {/* Vehicle grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16">
          <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No vehicles found</h2>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <Button
                  key={i}
                  variant={pagination.page === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const params: Record<string, string> = { page: String(i + 1) };
                    if (activeType) params.vehicleType = activeType;
                    setSearchParams(params);
                  }}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
