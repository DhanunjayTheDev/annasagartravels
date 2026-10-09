import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { MapPin } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-6">
          <MapPin className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Looks like you've taken a wrong turn. The page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button size="lg">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
