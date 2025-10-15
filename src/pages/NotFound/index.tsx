import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * 404 Not Found Page
 *
 * AI Agent Reference:
 * - Uses shadcn/ui components (Button)
 * - Uses Link for navigation
 * - Uses Tailwind CSS class names
 * - Exports component with export default
 */
export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="text-xl text-muted-foreground">Page Not Found</p>
        <p className="text-sm text-muted-foreground max-w-md">
          The page you are looking for does not exist or has been moved
        </p>
        <Button asChild size="lg">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
