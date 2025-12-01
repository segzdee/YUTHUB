import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Users,
  Building2,
  FileText,
  Shield,
  TrendingUp,
  Home,
  ClipboardList,
  AlertTriangle,
  DollarSign,
  HelpCircle,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/app/dashboard"))}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/app/dashboard/residents"))}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>All Residents</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/app/dashboard/properties"))}
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>All Properties</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/app/dashboard/reports"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Reports</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() =>
                runCommand(() => navigate("/app/dashboard/residents/intake"))
              }
            >
              <User className="mr-2 h-4 w-4" />
              <span>New Resident Intake</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  navigate("/app/dashboard/properties/register")
                )
              }
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>Register Property</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => navigate("/app/dashboard/compliance/incidents"))
              }
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span>Report Incident</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => navigate("/app/dashboard/residents/support-plans"))
              }
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              <span>Create Support Plan</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => navigate("/app/dashboard/compliance/progress"))
              }
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Log Progress</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Reports & Compliance">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/app/dashboard/reports/analytics"))}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Analytics Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/app/dashboard/reports/financials"))}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Financial Reports</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => navigate("/app/dashboard/compliance/safeguarding"))
              }
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>Safeguarding</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/app/dashboard/settings/account"))}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/app/dashboard/settings/billing"))}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing & Subscription</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/app/help"))}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
