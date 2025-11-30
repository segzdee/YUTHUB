# shadcn/ui Implementation Guide

## Overview

This project uses **shadcn/ui** components with the **New York** style variant and **neutral** color palette for a clean, modern SaaS aesthetic. All components follow accessibility best practices with built-in ARIA attributes, focus states, and keyboard navigation.

## Configuration

The shadcn/ui configuration is located in `components.json`:

```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

## Installed Components

### Core UI Components
- **Button** - All button variants with proper states
- **Card** - Metric displays and content containers
- **Badge** - Status indicators (compliant/at-risk/overdue)
- **Input** - Form inputs with validation
- **Label** - Accessible form labels
- **Textarea** - Multi-line text input
- **Checkbox** - Selection controls
- **Switch** - Toggle switches
- **Select** - Dropdown selections
- **Separator** - Visual dividers
- **Skeleton** - Loading states
- **Avatar** - User representations
- **Progress** - Progress indicators
- **Tooltip** - Contextual information

### Navigation Components
- **Sidebar** - Main navigation with collapsible sections
- **Sheet** - Mobile navigation drawer
- **Breadcrumb** - Wayfinding
- **Tabs** - Content organization
- **DropdownMenu** - Contextual actions
- **Command** - Global search (⌘K)

### Data Display Components
- **Table** - Basic table component
- **DataTable** - Advanced table with sorting, filtering, pagination (custom)
- **Calendar** - Date selection and scheduling
- **Accordion** - Expandable content sections
- **Collapsible** - Collapsible sections

### Feedback Components
- **Toast/Toaster** - Notifications
- **Sonner** - Enhanced toast notifications
- **Alert** - Important messages
- **AlertDialog** - Confirmation dialogs
- **Dialog** - Modal dialogs
- **Popover** - Floating content

### Form Components
- **Form** - Form wrapper with react-hook-form integration
- All form controls integrate with **zod** for validation

## Key Custom Components

### 1. DashboardShell

The main dashboard layout component that provides:
- Collapsible sidebar navigation
- Header with breadcrumbs
- Search button (triggers Command menu)
- Notifications button
- User menu dropdown
- Mobile-responsive design

**Usage:**
```tsx
import { DashboardShell } from "@/components/dashboard-shell"

export default function MyPage() {
  return (
    <DashboardShell
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Current Page" },
      ]}
    >
      {/* Your page content */}
    </DashboardShell>
  )
}
```

### 2. AppSidebar

Collapsible sidebar with organized navigation sections:
- Dashboard
- Residents (with sub-items)
- Properties (with sub-items)
- Compliance (with sub-items)
- Reports (with sub-items)
- Settings (with sub-items)

**Features:**
- Automatic highlighting of active routes
- Collapsible sections
- Icon mode when collapsed
- Smooth animations

### 3. CommandMenu

Global search accessible via **⌘K** (Mac) or **Ctrl+K** (Windows/Linux):
- Quick navigation to any page
- Grouped by category
- Keyboard-navigable
- Fuzzy search support

**Auto-activated on:**
- ⌘K / Ctrl+K keyboard shortcut
- Search button in header

### 4. DataTable

Advanced data table component with:
- **Sorting** - Click column headers to sort
- **Filtering** - Search by any column
- **Pagination** - Navigate through large datasets
- **Row Selection** - Select multiple rows with checkboxes
- **Column Visibility** - Toggle which columns to display
- **Row Actions** - Dropdown menu for row-specific actions

**Usage:**
```tsx
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

const columns: ColumnDef<YourType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  // ... more columns
]

<DataTable
  columns={columns}
  data={yourData}
  searchKey="name"
  searchPlaceholder="Search by name..."
  onRowClick={(row) => console.log(row)}
/>
```

### 5. ResidentsTable

Example implementation of DataTable for resident management:
- Pre-configured columns for resident data
- Status badges
- Support level indicators
- Row actions menu
- Click to view details

## Component Usage Examples

### Cards with Metrics

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">48</div>
    <p className="text-xs text-muted-foreground">
      <span className="text-green-600">+12%</span> from last month
    </p>
  </CardContent>
</Card>
```

### Status Badges

```tsx
<Badge variant="success">Compliant</Badge>
<Badge variant="warning">At Risk</Badge>
<Badge variant="error">Overdue</Badge>
<Badge variant="secondary">Pending</Badge>
```

### Tabs for Organization

```tsx
<Tabs defaultValue="residents">
  <TabsList>
    <TabsTrigger value="residents">Residents</TabsTrigger>
    <TabsTrigger value="properties">Properties</TabsTrigger>
    <TabsTrigger value="reports">Reports</TabsTrigger>
  </TabsList>

  <TabsContent value="residents">
    {/* Resident content */}
  </TabsContent>

  <TabsContent value="properties">
    {/* Property content */}
  </TabsContent>

  <TabsContent value="reports">
    {/* Report content */}
  </TabsContent>
</Tabs>
```

### Forms with Validation

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  residentName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.number().min(18).max(100),
  // ... more fields
})

export function ResidentForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      residentName: "",
      age: 18,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="residentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resident Name</FormLabel>
              <FormControl>
                <Input placeholder="John Smith" {...field} />
              </FormControl>
              <FormDescription>
                Enter the resident's full name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Dialogs for Confirmations

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Resident</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the
        resident's record from the system.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Toast Notifications

```tsx
import { toast } from "sonner"

// Success
toast.success("Resident added successfully")

// Error
toast.error("Failed to save changes")

// Info
toast.info("Refreshing dashboard data...")

// With description
toast.success("Resident updated", {
  description: "John Smith's profile has been updated successfully.",
})

// Loading state
const loadingToast = toast.loading("Saving changes...")
// Later...
toast.success("Changes saved", { id: loadingToast })
```

### Calendar for Scheduling

```tsx
import { Calendar } from "@/components/ui/calendar"

const [date, setDate] = React.useState<Date | undefined>(new Date())

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>
```

### Skeleton Loaders

```tsx
{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
) : (
  <DataTable data={data} columns={columns} />
)}
```

## Accessibility Features

All shadcn/ui components include:

### ✅ ARIA Attributes
- Proper labels and descriptions
- Role assignments
- State announcements

### ✅ Keyboard Navigation
- Tab navigation
- Arrow key navigation in lists/menus
- Enter/Space for activation
- Escape to close dialogs/menus

### ✅ Focus Management
- Visible focus indicators
- Focus trapping in modals
- Logical focus order

### ✅ Screen Reader Support
- Semantic HTML
- Hidden helper text
- Status announcements

## Typography System

The project uses **Inter** font with a proper hierarchy:

```tsx
// Page title
<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

// Section title
<h2 className="text-2xl font-semibold tracking-tight">Overview</h2>

// Card title
<h3 className="text-lg font-medium">Recent Activity</h3>

// Body text
<p className="text-sm text-muted-foreground">Description text</p>

// Small text
<span className="text-xs text-muted-foreground">Helper text</span>
```

## Color Palette (Neutral)

The neutral palette provides a clean, professional look:

```css
/* CSS Variables (in client/src/index.css) */
--background: 0 0% 100%;
--foreground: 0 0% 3.9%;
--card: 0 0% 100%;
--card-foreground: 0 0% 3.9%;
--popover: 0 0% 100%;
--popover-foreground: 0 0% 3.9%;
--primary: 0 0% 9%;
--primary-foreground: 0 0% 98%;
--secondary: 0 0% 96.1%;
--secondary-foreground: 0 0% 9%;
--muted: 0 0% 96.1%;
--muted-foreground: 0 0% 45.1%;
--accent: 0 0% 96.1%;
--accent-foreground: 0 0% 9%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 0 0% 98%;
--border: 0 0% 89.8%;
--input: 0 0% 89.8%;
--ring: 0 0% 3.9%;
--radius: 0.5rem;
```

## Best Practices

### 1. Always Use the Dashboard Shell
Wrap all dashboard pages with `DashboardShell` for consistent layout:

```tsx
export default function MyPage() {
  return (
    <DashboardShell breadcrumbs={[/* ... */]}>
      {/* content */}
    </DashboardShell>
  )
}
```

### 2. Use DataTable for Lists
Replace custom tables with the `DataTable` component for consistency and features.

### 3. Provide Loading States
Always show skeletons or loading indicators during async operations.

### 4. Use Proper Form Validation
Integrate `react-hook-form` with `zod` schemas for all forms.

### 5. Toast Notifications
Use Sonner for all user feedback and notifications.

### 6. Maintain Typography Hierarchy
Follow the established heading levels and text sizes.

### 7. Keyboard Shortcuts
Encourage users to use ⌘K for quick navigation.

### 8. Mobile Responsiveness
Test all layouts on mobile - the Sidebar automatically converts to a Sheet.

## Adding New Components

To add more shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Examples:
```bash
npx shadcn@latest add hover-card
npx shadcn@latest add navigation-menu
npx shadcn@latest add radio-group
```

## Example Dashboard Page

See `client/src/pages/DashboardExample.tsx` for a comprehensive example showing:
- DashboardShell usage
- Metric cards with loading states
- DataTable integration
- Tabs organization
- Calendar component
- Toast notifications
- Responsive design

## Migration Guide

To migrate existing pages:

1. **Replace Layout**: Wrap with `DashboardShell`
2. **Update Tables**: Use `DataTable` component
3. **Standardize Cards**: Use shadcn Card components
4. **Add Breadcrumbs**: Pass breadcrumb array to shell
5. **Update Forms**: Integrate react-hook-form + zod
6. **Replace Notifications**: Use Sonner toasts
7. **Add Loading States**: Use Skeleton components
8. **Update Badges**: Use shadcn Badge variants

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Table Docs](https://tanstack.com/table)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Radix UI](https://www.radix-ui.com)

---

**Last Updated:** November 30, 2024
