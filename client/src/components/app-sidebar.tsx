import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  BarChart3,
  Settings,
  ChevronRight,
  UserPlus,
  FileCheck,
  Home,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Heart,
  HelpCircle,
  LogOut,
  ChevronsUpDown,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"

const navItems = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Residents",
    icon: Users,
    items: [
      {
        title: "All Residents",
        url: "/app/dashboard/residents",
        icon: Users,
      },
      {
        title: "Resident Intake",
        url: "/app/dashboard/residents/intake",
        icon: UserPlus,
      },
      {
        title: "Support Plans",
        url: "/app/dashboard/residents/support-plans",
        icon: FileCheck,
      },
    ],
  },
  {
    title: "Properties",
    icon: Building2,
    items: [
      {
        title: "All Properties",
        url: "/app/dashboard/properties",
        icon: Building2,
      },
      {
        title: "Property Registration",
        url: "/app/dashboard/properties/register",
        icon: Home,
      },
    ],
  },
  {
    title: "Compliance",
    icon: ShieldCheck,
    items: [
      {
        title: "Safeguarding",
        url: "/app/dashboard/compliance/safeguarding",
        icon: ShieldCheck,
      },
      {
        title: "Incident Reports",
        url: "/app/dashboard/compliance/incidents",
        icon: AlertTriangle,
      },
      {
        title: "Progress Tracking",
        url: "/app/dashboard/compliance/progress",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      {
        title: "All Reports",
        url: "/app/dashboard/reports",
        icon: BarChart3,
      },
      {
        title: "Analytics",
        url: "/app/dashboard/reports/analytics",
        icon: TrendingUp,
      },
      {
        title: "Financials",
        url: "/app/dashboard/reports/financials",
        icon: DollarSign,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      {
        title: "Account Settings",
        url: "/app/dashboard/settings/account",
        icon: Settings,
      },
      {
        title: "Billing",
        url: "/app/dashboard/settings/billing",
        icon: DollarSign,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useSidebar()
  const { user, logout } = useAuth()

  // Helper function to check if a route is active
  const isRouteActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + '/')
  }

  // Helper function to check if any submenu item is active
  const isParentActive = (items: any[]) => {
    return items.some(item => isRouteActive(item.url))
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/app/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Heart className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">YUTHUB</span>
                  <span className="truncate text-xs">Housing Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) =>
                item.items ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isParentActive(item.items)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isParentActive(item.items)}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isRouteActive(subItem.url)}
                              >
                                <Link to={subItem.url}>
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isRouteActive(item.url!)}
                      tooltip={item.title}
                    >
                      <Link to={item.url!}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.email || "User"} />
                    <AvatarFallback className="rounded-lg">
                      {user?.email ? user.email.substring(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.email || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.organizationId ? "Organization Member" : "Free Account"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.email || "User"} />
                      <AvatarFallback className="rounded-lg">
                        {user?.email ? user.email.substring(0, 2).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.email || "User"}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email || "user@example.com"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/dashboard/settings/account" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/dashboard/settings/billing" className="cursor-pointer">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/help" className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
