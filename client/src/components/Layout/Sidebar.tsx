import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  DollarSign,
  Settings,
  HelpCircle
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Housing Management", href: "/housing", icon: Building },
  { name: "Support Services", href: "/support", icon: Users },
  { name: "Independence Pathway", href: "/independence", icon: TrendingUp },
  { name: "Analytics & Outcomes", href: "/analytics", icon: BarChart3 },
  { name: "Safeguarding", href: "/safeguarding", icon: Shield },
  { name: "Crisis Connect", href: "/crisis", icon: AlertTriangle },
  { name: "Financials", href: "/financials", icon: DollarSign },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/help", icon: HelpCircle },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 fixed h-full z-10">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">YUTHUB</h1>
      </div>
      
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 text-primary border-r-2 border-primary"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="px-4 space-y-2">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 text-primary border-r-2 border-primary"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
