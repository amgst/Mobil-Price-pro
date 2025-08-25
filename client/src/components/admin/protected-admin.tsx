import { Shield } from "lucide-react";

interface ProtectedAdminProps {
  children: React.ReactNode;
}

export function ProtectedAdmin({ children }: ProtectedAdminProps) {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">
                Mobile Price Admin
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">Open Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}