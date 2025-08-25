import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOHead } from "@/components/seo/seo-head";
import { Loader2, Shield } from "lucide-react";

interface AuthStatus {
  isAuthenticated: boolean;
  username: string | null;
}

interface LoginResponse {
  success: boolean;
  message: string;
  redirectTo?: string;
}

export default function AdminLogin() {
  const [, setLocation] = useLocation();

  // Automatically redirect to admin since authentication is disabled
  React.useEffect(() => {
    setLocation("/admin");
  }, [setLocation]);



  return (
    <>
      <SEOHead 
        title="Admin Access - Mobile Price"
        description="Redirecting to admin panel"
        canonical="/admin/login"
        noIndex={true}
      />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Redirecting to Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-gray-600">Authentication disabled - redirecting...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}