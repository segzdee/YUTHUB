import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import CrisisModal from "@/components/CrisisConnect/CrisisModal";

export default function Header() {
  const { user } = useAuth();
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate">Dashboard Overview</h2>
            <p className="text-sm text-gray-600">
              Welcome back, {user?.firstName || user?.email || "User"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Crisis Connect Button */}
            <Button
              onClick={() => setShowCrisisModal(true)}
              className="bg-accent text-white hover:bg-red-700"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Crisis Connect
            </Button>
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"
                  }
                </p>
                <p className="text-gray-500">{user?.role || "Staff"}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <CrisisModal 
        isOpen={showCrisisModal} 
        onClose={() => setShowCrisisModal(false)} 
      />
    </>
  );
}
