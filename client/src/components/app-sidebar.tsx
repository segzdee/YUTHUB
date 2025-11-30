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
  const { state } = useSidebar()

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
              <Link to="/app/help">
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
