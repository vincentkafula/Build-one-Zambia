import { Link } from 'react-router';
import { MapPin, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
        <MapPin className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-6xl font-bold text-foreground mb-3">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mb-3">Page not found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved. Check the URL or navigate back to safety.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to="/"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:opacity-90 transition font-medium"
        >
          <Home className="w-4 h-4" />
          Go to Dashboard
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-muted text-muted-foreground px-5 py-2.5 rounded-xl hover:bg-muted/80 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
