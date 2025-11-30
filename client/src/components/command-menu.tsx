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
          <CommandGroup heading="Suggestions">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/dashboard"))}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/dashboard/residents"))}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Residents</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/dashboard/properties"))}
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>Properties</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Forms">
            <CommandItem
              onSelect={() =>
                runCommand(() => navigate("/dashboard/forms/resident-intake"))
              }
            >
              <User className="mr-2 h-4 w-4" />
              <span>Resident Intake</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  navigate("/dashboard/forms/property-registration")
                )
              }
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>Property Registration</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => navigate("/dashboard/forms/incident-report"))
              }
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span>Incident Report</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => navigate("/dashboard/forms/support-plan"))
              }
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              <span>Support Plan</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Reports & Analytics">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/dashboard/reports"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Reports</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/dashboard/analytics"))}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/dashboard/financials"))}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Financials</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Compliance">
            <CommandItem
              onSelect={() =>
                runCommand(() => navigate("/dashboard/safeguarding"))
              }
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>Safeguarding</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/dashboard/settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/dashboard/security"))}
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>Security</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/help"))}
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
