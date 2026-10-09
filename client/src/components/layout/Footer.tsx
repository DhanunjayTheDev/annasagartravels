import { Car, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Car className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">Annasagar Travels</span>
            </Link>
            <p className="text-sm text-gray-400">
              Your trusted partner for car and bus rentals. Book comfortable, reliable vehicles for any journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/vehicles?vehicleType=car" className="hover:text-white transition-colors">Book a Car</Link></li>
              <li><Link to="/vehicles?vehicleType=bus" className="hover:text-white transition-colors">Book a Bus</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
            </ul>
          </div>

          {/* Vehicle Types */}
          <div>
            <h3 className="text-white font-semibold mb-4">Fleet</h3>
            <ul className="space-y-2 text-sm">
              <li>Sedans & Hatchbacks</li>
              <li>SUVs & Luxury Cars</li>
              <li>Mini Buses & Tempo</li>
              <li>Standard & Luxury Buses</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span>+91 9999 999 999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>info@annasagartravels.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5" />
                <span>Ajmer, Rajasthan, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Annasagar Travels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
