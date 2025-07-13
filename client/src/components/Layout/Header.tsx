import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import CrisisModal from "@/components/CrisisConnect/CrisisModal";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate truncate">
                Dashboard Overview
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Welcome back, {user?.firstName || user?.email || "User"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Crisis Connect Button */}
            <Button
              onClick={() => setShowCrisisModal(true)}
              className="bg-accent text-white hover:bg-red-700"
              size="sm"
            >
              <AlertTriangle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Crisis Connect</span>
            </Button>
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </span>
              </div>
              <div className="text-sm hidden sm:block">
                <p className="font-medium text-slate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"
                  }
                </p>
                <p className="text-gray-500 text-xs">{user?.role || "Staff"}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
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
