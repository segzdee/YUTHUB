import * as React from "react"
import { Outlet, useLocation, Link } from "react-router-dom"
import { Search, Bell, User } from "lucide-react"

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
import { useAuth } from "@/hooks/useAuth"

interface DashboardShellProps {
  children?: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  housing: "Housing",
  support: "Support",
  independence: "Independence",
  analytics: "Analytics",
  safeguarding: "Safeguarding",
  crisis: "Crisis",
  financials: "Financials",
  billing: "Billing",
  forms: "Forms",
  reports: "Reports",
  settings: "Settings",
  help: "Help",
  "resident-intake": "Resident Intake",
  "support-plan": "Support Plan",
  "property-registration": "Property Registration",
  "incident-report": "Incident Report",
  "progress-tracking": "Progress Tracking",
}

export function DashboardShell({ children, breadcrumbs: customBreadcrumbs }: DashboardShellProps) {
  const { user, logout } = useAuth()
  const location = useLocation()

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
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
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.email || "My Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/help">Support</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children || <Outlet />}
        </div>
      </SidebarInset>
      <CommandMenu />
    </SidebarProvider>
  )
}
