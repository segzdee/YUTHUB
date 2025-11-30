import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  FileText,
  Settings,
  ChevronRight,
  Home,
  UserPlus,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ClipboardList,
  Heart,
  Scale,
  HelpCircle,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

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

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Residents",
    icon: Users,
    items: [
      {
        title: "All Residents",
        url: "/dashboard/residents",
        icon: Users,
      },
      {
        title: "Resident Intake",
        url: "/dashboard/forms/resident-intake",
        icon: UserPlus,
      },
      {
        title: "Support Plans",
        url: "/dashboard/forms/support-plan",
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
        url: "/dashboard/properties",
        icon: Building2,
      },
      {
        title: "Property Registration",
        url: "/dashboard/forms/property-registration",
        icon: Home,
      },
      {
        title: "Room Allocation",
        url: "/dashboard/forms/room-allocation",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Compliance",
    icon: Shield,
    items: [
      {
        title: "Safeguarding",
        url: "/dashboard/safeguarding",
        icon: Shield,
      },
      {
        title: "Incident Reports",
        url: "/dashboard/forms/incident-report",
        icon: AlertTriangle,
      },
      {
        title: "Progress Tracking",
        url: "/dashboard/forms/progress-tracking",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Reports",
    icon: FileText,
    items: [
      {
        title: "All Reports",
        url: "/dashboard/reports",
        icon: FileText,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: TrendingUp,
      },
      {
        title: "Financials",
        url: "/dashboard/financials",
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
        url: "/dashboard/settings",
        icon: Settings,
      },
      {
        title: "Security",
        url: "/dashboard/security",
        icon: Shield,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
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
                    defaultOpen={item.items.some((subItem) =>
                      location.pathname.startsWith(subItem.url)
                    )}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
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
                                isActive={location.pathname === subItem.url}
                              >
                                <Link to={subItem.url}>
                                  <subItem.icon />
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
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/help">
                <HelpCircle />
                <span>Help & Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
