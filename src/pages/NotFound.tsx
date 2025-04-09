
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-system-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-system-blue-600 font-bold text-9xl">404</div>
        <h1 className="mt-4 text-3xl font-bold text-system-gray-800">Page not found</h1>
        <p className="mt-4 text-lg text-system-gray-600">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button
            className="flex items-center"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => navigate("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            Return home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
