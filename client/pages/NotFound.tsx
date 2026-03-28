import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="container py-20 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-foreground/70 mb-8">
            Sorry, we couldn't find the page you're looking for. The route{" "}
            <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code>{" "}
            doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Go to Home
            </Link>
            <Link
              to="/book"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Book a Ride
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-foreground/60 mb-4">Need help?</p>
            <Link
              to="/"
              className="text-primary hover:underline font-semibold"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
