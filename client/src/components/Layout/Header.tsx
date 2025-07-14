import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, Menu, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import CrisisModal from "@/components/CrisisConnect/CrisisModal";
import CrossModuleSearch from "@/components/CrossModule/CrossModuleSearch";
import { ThemeToggle, AccessibilityToggle, LanguageToggle } from "@/components/ui/theme-toggle";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { ContextualHelp } from "@/components/navigation/ContextualHelp";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useLocation } from "wouter";
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';
import NotificationCenter from '@/components/Dashboard/NotificationCenter';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useLanguage();
  const [location] = useLocation();
  const { connectionStatus, isConnected } = useWebSocketConnection();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      <header className="bg-background border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground truncate">
                  YUTHUB
                </h1>
                <ContextualHelp context={location.split('/')[1] || 'dashboard'} />
              </div>
              <Breadcrumbs className="mb-1" />
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {t('welcome')}, {user?.firstName || user?.email || "User"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Cross-Module Search */}
            <div className="hidden md:block w-64">
              <CrossModuleSearch />
            </div>
            
            {/* Crisis Connect Button */}
            <Button
              onClick={() => setShowCrisisModal(true)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              size="sm"
              aria-label="Emergency Crisis Connect"
            >
              <AlertTriangle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Crisis Connect</span>
            </Button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Accessibility Toggle */}
            <AccessibilityToggle />
            
            {/* Language Toggle */}
            <LanguageToggle />
            
            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications (3 unread)"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  3
                </span>
                {isConnected && (
                  <span className="absolute -bottom-1 -left-1 bg-green-500 rounded-full h-2 w-2"></span>
                )}
              </Button>
              
              <NotificationCenter 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
              />
            </div>
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs sm:text-sm font-medium">
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-sm">
                    {user?.firstName || user?.email || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
