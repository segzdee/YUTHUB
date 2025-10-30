import { Moon, Sun, Settings, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const isDark = document.documentElement.classList.contains('dark')

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

export function AccessibilityToggle() {
  return (
    <Button variant="ghost" size="icon">
      <Settings className="h-5 w-5" />
    </Button>
  )
}

export function LanguageToggle() {
  return (
    <Button variant="ghost" size="icon">
      <Globe className="h-5 w-5" />
    </Button>
  )
}
