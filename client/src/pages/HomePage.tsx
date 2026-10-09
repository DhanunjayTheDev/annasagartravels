import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Bus, Shield, Heart, MapPin, Search, Calendar, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock destinations for beautiful UI
const destinations = [
  { id: 1, name: 'Mumbai', time: 'Explore City', image: 'https://images.unsplash.com/photo-1522008342704-6b265b543c46?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'Goa', time: 'Beach Vibes', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e4f2?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'Lonavala', time: 'Hill Station', image: 'https://images.unsplash.com/photo-1571536802807-3cab2f5b47a0?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'Pune', time: 'Weekend Getaway', image: 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?auto=format&fit=crop&q=80&w=800' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'car' | 'bus'>('car');

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center pt-24 pb-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=2000" 
            alt="Travel background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 mt-12 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white text-center leading-tight mb-6 max-w-4xl font-serif text-balance"
          >
            Find your perfect ride, anywhere you go.
          </motion.h1>
          
          {/* Advanced Search Bar (Airbnb style) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-4xl bg-white rounded-full shadow-2xl p-2 mt-8 hidden md:flex items-center"
          >
            <div className="flex-1 grid grid-cols-3 divide-x divide-gray-200">
              <div className="px-6 py-2 hover:bg-gray-100 rounded-full cursor-pointer transition">
                <p className="text-xs font-bold text-gray-900">Vehicle</p>
                <p className="text-sm text-gray-500 truncate">Select type</p>
              </div>
              <div className="px-6 py-2 hover:bg-gray-100 rounded-full cursor-pointer transition">
                <p className="text-xs font-bold text-gray-900">Dates</p>
                <p className="text-sm text-gray-500 truncate">Add dates</p>
              </div>
              <div className="px-6 py-2 hover:bg-gray-100 rounded-full cursor-pointer transition">
                <p className="text-xs font-bold text-gray-900">Passengers</p>
                <p className="text-sm text-gray-500 truncate">Add guests</p>
              </div>
            </div>
            <Button 
              size="icon" 
              className="rounded-full h-14 w-14 bg-primary hover:bg-rose-600 shrink-0 ml-2"
              onClick={() => navigate('/vehicles')}
            >
              <Search className="h-6 w-6 text-white" />
            </Button>
          </motion.div>

          {/* Mobile Search button */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md bg-white rounded-full shadow-xl p-2 mt-8 flex md:hidden items-center"
          >
            <Button 
              className="flex-1 rounded-full h-14 bg-primary hover:bg-rose-600 gap-3 text-lg"
              onClick={() => navigate('/vehicles')}
            >
              <Search className="h-5 w-5" />
              Explore Vehicles
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Categories / Explore */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900">Explore by Category</h2>
          
          <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('car')}
              className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all whitespace-nowrap ${activeTab === 'car' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <Car className="h-5 w-5" />
              <span className="font-semibold">Premium Cars</span>
            </button>
            <button 
              onClick={() => setActiveTab('bus')}
              className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all whitespace-nowrap ${activeTab === 'bus' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <Bus className="h-5 w-5" />
              <span className="font-semibold">Luxury Buses</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Show different mock vehicles based on tab just for presentation on home page */}
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/vehicles?vehicleType=${activeTab}`)}
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
                  <img 
                    src={activeTab === 'car' 
                      ? `https://images.unsplash.com/photo-${[
                          '1549317661-bd32c8ce0db2', 
                          '1503377330813-64b8eb818182', 
                          '1550355291-bbee04a92027', 
                          '1493225457224-05e222295fa9'
                        ][i-1]}?auto=format&fit=crop&q=80&w=600`
                      : `https://images.unsplash.com/photo-${[
                        '1544620347-c4fd452dd919',
                        '1570125909232-eb263c188f7e',
                        '1464219222984-2f6d112c843c',
                        '1613214149922-fecddd05f2bf'
                      ][i-1]}?auto=format&fit=crop&q=80&w=600`
                    } 
                    alt="Vehicle" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full">
                    <Heart className="h-4 w-4 text-gray-500 hover:text-rose-500 transition" />
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                      {activeTab === 'car' 
                        ? ['Luxury SUV', 'Premium Sedan', 'Compact SUV', 'Sports Hatchback'][i-1]
                        : ['45-Seater Coach', 'Sleeper Bus', 'Mini Bus AC', 'Premium Volvo'][i-1]
                      }
                    </h3>
                    <p className="text-gray-500 text-sm">Professional Driver</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span>4.{8 + (i % 3) / 10}</span>
                  </div>
                </div>
                <p className="mt-1">
                  <span className="font-semibold text-gray-900">From ₹{(i * 500) + 1000}</span>
                  <span className="text-gray-500 text-sm"> / day</span>
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Inspiration */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">Inspiration for your next trip</h2>
          <p className="text-gray-500 mb-10 text-lg">Top destinations to explore with our premium fleet.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <motion.div 
                key={dest.id}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-2xl overflow-hidden aspect-square cursor-pointer group shadow-sm hover:shadow-xl transition-shadow"
              >
                <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-bold text-white mb-1">{dest.name}</h3>
                  <p className="text-white/80">{dest.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features/Trust Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-gray-900 font-serif">Why travel with us?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="bg-primary/10 p-4 rounded-2xl mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Verified & Safe</h3>
              <p className="text-gray-500 leading-relaxed">Every vehicle and driver is thoroughly vetted. Your safety is our absolute highest priority.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="bg-primary/10 p-4 rounded-2xl mb-6">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Premium Quality</h3>
              <p className="text-gray-500 leading-relaxed">Immaculately clean, well-maintained vehicles offering the highest standards of comfort.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="bg-primary/10 p-4 rounded-2xl mb-6">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Go Anywhere</h3>
              <p className="text-gray-500 leading-relaxed">From quick city transfers to multi-day outstation adventures, we've got you covered.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000" alt="Road trip" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">Your next great journey awaits.</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">Join thousands of happy travelers who trust us for their trips across India.</p>
          <Button size="lg" className="bg-primary hover:bg-rose-600 text-white rounded-full px-10 py-6 text-lg shadow-xl" onClick={() => navigate('/vehicles')}>
            Explore Vehicles
          </Button>
        </div>
      </section>
    </div>
  );
}
