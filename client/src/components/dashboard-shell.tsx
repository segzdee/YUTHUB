import * as React from "react"
import { Outlet, useLocation, Link } from "react-router-dom"
import { Search, Bell, LogOut, Settings, User } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { CommandMenu } from "@/components/command-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"

interface DashboardShellProps {
  children?: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  residents: "Residents",
  intake: "Resident Intake",
  "support-plans": "Support Plans",
  properties: "Properties",
  register: "Property Registration",
  compliance: "Compliance",
  safeguarding: "Safeguarding",
  incidents: "Incident Reports",
  progress: "Progress Tracking",
  reports: "Reports",
  analytics: "Analytics",
  financials: "Financials",
  settings: "Settings",
  account: "Account Settings",
  billing: "Billing",
  team: "Team Management",
}

export function DashboardShell({ children, breadcrumbs: customBreadcrumbs }: DashboardShellProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [unreadNotifications] = React.useState(3)

  // Get initial sidebar state from cookie
  const getDefaultOpen = () => {
    if (typeof document !== 'undefined') {
      const cookie = document.cookie.split('; ').find(row => row.startsWith('sidebar_state='))
      return cookie ? cookie.split('=')[1] === 'true' : true
    }
    return true
  }

  const [sidebarOpen, setSidebarOpen] = React.useState(getDefaultOpen)

  const breadcrumbs = React.useMemo(() => {
    if (customBreadcrumbs) return customBreadcrumbs

    const paths = location.pathname.split('/').filter(Boolean)
    if (paths[0] !== 'app') return []

    const crumbs: { label: string; href?: string }[] = []
    let currentPath = '/app'

    for (let i = 1; i < paths.length; i++) {
      currentPath += `/${paths[i]}`
      const label = routeLabels[paths[i]] || paths[i].charAt(0).toUpperCase() + paths[i].slice(1)
      crumbs.push({
        label,
        href: i < paths.length - 1 ? currentPath : undefined
      })
    }

    return crumbs
  }, [location.pathname, customBreadcrumbs])

  return (
    <SidebarProvider
      defaultOpen={sidebarOpen}
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true,
                })
                document.dispatchEvent(event)
              }}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search (⌘K)</span>
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
              <span className="sr-only">Notifications ({unreadNotifications} unread)</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.email || "User"} />
                    <AvatarFallback>
                      {user?.email ? user.email.substring(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Member"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/dashboard/settings/account" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/dashboard/settings/billing" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 space-y-6">
            {children || <Outlet />}
          </div>
        </main>
      </SidebarInset>
      </div>
      <CommandMenu />
    </SidebarProvider>
  )
}
