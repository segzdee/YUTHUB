# YUTHUB Design System: Minimalist, Purposeful, Beautiful
## A Steve Jobs Aesthetic for Enterprise Housing Software

---

## Philosophy
Every pixel serves a purpose. Every word has been earned. Whitespace is conversation. Beauty comes from clarity, not decoration.

---

# 1. DESIGN FOUNDATIONS

## 1.1 Typography System
**Primary Font Stack:** `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Font Usage Rules:**
- **Headlines (H1):** 56px, 600 weight, +2 letter-spacing
- **Section Headings (H2):** 36px, 600 weight, +1 letter-spacing
- **Subheadings (H3):** 24px, 500 weight, line-height 1.3
- **Body Text (P):** 16px, 400 weight, line-height 1.6, color #111
- **Small Text:** 14px, 400 weight, color #666
- **Micro Text (labels):** 12px, 500 weight, color #999

**Never use color for hierarchy. Use weight and size.**

---

## 1.2 Color Palette

| Purpose | Color | Hex | Use Case |
|---------|-------|-----|----------|
| Background | Pure White | #FFFFFF | Page background, cards, containers |
| Primary Text | Dark Charcoal | #111111 | Headlines, body text, primary content |
| Secondary Text | Medium Grey | #666666 | Subtext, helper text, timestamps |
| Tertiary Text | Light Grey | #999999 | Labels, placeholders, disabled states |
| Border/Divider | Very Light Grey | #F0F0F0 | Lines between sections, subtle separation |
| Accent (Active) | Soft Blue-Violet Gradient | `linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)` | CTAs, active states, hover effects |
| Success | Gentle Green | #10B981 | Positive outcomes, active statuses |
| Warning | Warm Amber | #F59E0B | Alerts, pending states |
| Error | Soft Red | #EF4444 | Errors, critical alerts |
| Focus Ring | Accent | #4F46E5 with 3px ring | Keyboard navigation focus state |

**Apply colors sparingly. Default to grayscale, add color only for action or state.**

---

## 1.3 Spacing System (8px grid)

| Level | Value | Use |
|-------|-------|-----|
| xs | 4px | Icon spacing, tiny gaps |
| sm | 8px | Small padding, compact spacing |
| md | 16px | Standard padding, margins between elements |
| lg | 24px | Section margins, card padding |
| xl | 32px | Major section breaks |
| 2xl | 48px | Hero section spacing, large gaps |
| 3xl | 64px | Page-level spacing |

---

## 1.4 Border & Radius

- **Button Radius:** 12px (2xl)
- **Card Radius:** 16px (3xl)
- **Input Radius:** 10px (lg)
- **Avatar Radius:** 50% (circle) or 8px (square)
- **Border Width:** 1px (subtle lines only)
- **Border Color:** #F0F0F0 (barely visible)

---

## 1.5 Elevation & Shadows

```css
/* Subtle - cards, hover states */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

/* Medium - dropdown, modal backdrop */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);

/* Deep - modal, elevated components */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);

/* Focus Ring */
box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
```

**Never use multiple nested shadows. One shadow only.**

---

## 1.6 Motion & Animation

| Animation | Duration | Curve | Use |
|-----------|----------|-------|-----|
| Hover / Focus | 150ms | cubic-bezier(0.4, 0, 0.2, 1) | Button hover, link underline |
| Transition | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Page navigation, drawer open/close |
| Entrance | 500ms | cubic-bezier(0.4, 0, 0.2, 1) | Fade-in, slide-up on page load |
| Scroll Reveal | 600ms | cubic-bezier(0.4, 0, 0.2, 1) | Content appears as user scrolls |

**Rules:**
- All animations are functional, never decorative.
- Never use bounce, elastic, or spring curves.
- Disable animations for users with `prefers-reduced-motion`.
- Maximum 2 simultaneous animations per screen.

---

# 2. COMPONENT LIBRARY

## 2.1 Button Component

### Primary Button (CTA)
```html
<button class="btn btn-primary">
  Get Started
</button>
```

**Styles:**
- Background: Gradient (accent)
- Padding: 12px 24px
- Border: none
- Border-radius: 12px
- Font: 16px, 600 weight
- Text color: white
- Hover: Slight lift (1px shadow increase) + opacity 95%
- Active: 2px down transform
- Disabled: opacity 50%, cursor not-allowed

### Secondary Button
```html
<button class="btn btn-secondary">
  Learn More
</button>
```

**Styles:**
- Background: transparent
- Border: 1px solid #F0F0F0
- Padding: 12px 24px
- Text color: #111
- Hover: Background #F9F9F9, border #E5E5E5

### Tertiary Button (Ghost)
```html
<button class="btn btn-tertiary">
  View Details →
</button>
```

**Styles:**
- Background: transparent
- Border: none
- Text color: #666
- Hover: Text color #111, underline (animated slide-right)

---

## 2.2 Input Fields

```html
<input type="email" placeholder="your@email.com" class="input-field" />
```

**Styles:**
- Padding: 12px 16px
- Border: 1px solid #F0F0F0
- Border-radius: 10px
- Font: 16px, 400 weight
- Background: #FAFAFA
- Placeholder: #999

**States:**
- Hover: Border #E5E5E5, background #FFF
- Focus: Border #4F46E5, box-shadow (3px focus ring)
- Error: Border #EF4444, background tinted red (#FEF2F2)

---

## 2.3 Cards

```html
<div class="card">
  <div class="card-header">
    <h3>Housing Management</h3>
  </div>
  <div class="card-body">
    <p>Unified view of all properties and placements.</p>
  </div>
  <div class="card-footer">
    <a href="#">Learn more →</a>
  </div>
</div>
```

**Styles:**
- Padding: 24px
- Border-radius: 16px
- Border: 1px solid #F0F0F0
- Background: #FFF
- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08)
- Hover: Shadow increases to 0 4px 12px rgba(0, 0, 0, 0.12)
- Transition: 300ms

---

## 2.4 Navigation Bar

```html
<nav class="navbar">
  <div class="navbar-brand">
    <img src="logo.svg" alt="YUTHUB" />
  </div>
  <ul class="navbar-menu">
    <li><a href="#">Home</a></li>
    <li><a href="#">Platform</a></li>
    <li><a href="#">Pricing</a></li>
    <li><a href="#">Resources</a></li>
    <li><a href="#" class="btn btn-primary">Sign In</a></li>
  </ul>
</nav>
```

**Styles:**
- Height: 64px
- Position: sticky, top 0
- Background: initially transparent
- On scroll > 10px: fade-in white background + subtle shadow
- Padding: 0 48px
- Logo height: 28px
- Menu items: 16px, 400 weight, color #666
- Menu item hover: color #111, underline fade-in from bottom (200ms)
- Active menu item: underline always visible

---

## 2.5 Hero Section

```html
<section class="hero">
  <h1>Empowering Youth Housing. Simplified.</h1>
  <p>One platform for housing management, support services, and safeguarding.</p>
  <button class="btn btn-primary">Book a Demo</button>
</section>
```

**Styles:**
- Min-height: 80vh
- Display: flex, centered
- Flex-direction: column
- Align: center
- Padding: 120px 48px
- Background: linear-gradient(180deg, #FFFFFF 0%, #F9F9F9 100%)
- Headline: 56px, 600 weight, max-width 800px, color #111
- Subtext: 20px, 400 weight, color #666, margin-top 24px
- Button: margin-top 48px
- Motion: text fades up on page load (300ms stagger)

---

## 2.6 Section with Image/Text Grid

```html
<section class="section-grid">
  <div class="grid-content">
    <h2>Housing Management Reimagined</h2>
    <p>Unified dashboard for properties, rooms, and placements.</p>
    <ul class="feature-list">
      <li>Real-time occupancy tracking</li>
      <li>Automated tenancy workflows</li>
      <li>Document management</li>
    </ul>
  </div>
  <div class="grid-image">
    <img src="dashboard-preview.png" alt="Dashboard" />
  </div>
</section>
```

**Styles:**
- Display: grid, 2 columns on desktop, 1 on mobile
- Gap: 64px
- Max-width: 1200px
- Content width: 40%
- Image width: 60%
- Headline: 36px, 600 weight
- Feature list: bullet-less, each item 16px with small icon (16px) on left
- Icon color: #4F46E5
- Image: border-radius 16px, box-shadow subtle
- On scroll: content fades in from left, image fades in from right (staggered 100ms)

---

## 2.7 Feature Cards Grid

```html
<section class="features">
  <h2>Five Essentials of YUTHUB</h2>
  <div class="cards-grid">
    <div class="feature-card">
      <div class="card-icon">🏠</div>
      <h3>Housing</h3>
      <p>Unified property and placement management.</p>
    </div>
    <!-- Repeat for Support, Safeguarding, Finance, Independence -->
  </div>
</section>
```

**Styles:**
- Grid: 5 columns on desktop, 2 on tablet, 1 on mobile
- Gap: 24px
- Card padding: 32px
- Card text-align: center
- Icon size: 48px, emoji or SVG
- Card border-radius: 16px
- Card hover: lift 2px, shadow increases
- Card transition: 300ms
- On scroll: stagger entrance (50ms between each card)

---

# 3. PAGE TEMPLATES

## 3.1 Landing Page (Public Home)

**Structure:**
```
├── Navigation Bar (sticky, transparent)
├── Hero Section
│   ├── Headline (56px)
│   ├── Subtext (20px)
│   └── CTA Button
├── Value Propositions (5 horizontal sections)
│   ├── Housing Management → Simplified
│   ├── Support Pathways → Personalized
│   ├── Safeguarding → Proactive
│   ├── Finance → Transparent
│   └── Independence → Empowered
├── Social Proof
│   ├── Organization logos
│   └── One testimonial quote
├── Pricing Preview
│   ├── 3-tier pricing cards
│   └── Monthly/Annual toggle
├── Footer
└── End
```

**Key Principles:**
- Hero section: 60% of viewport height
- Only 4 top-level sections
- Each section breathes with whitespace (2xl or 3xl spacing)
- Minimal copy (5–8 words per headline)
- One scroll-triggered animation per section (fade-in, text-reveal)
- Call-to-action every 3 sections (subtle)

---

## 3.2 Platform Overview Page

**Structure:**
```
├── Navigation Bar
├── Hero
│   ├── "Built for organizations that believe housing is more than walls."
│   └── Subtle background video or gradient
├── Module 1: Housing Management
│   ├── Icon + 4-word headline
│   ├── Single sentence description
│   └── Dashboard screenshot (preview)
├── Module 2: Support Services
├── Module 3: Safeguarding
├── Module 4: Financial Management
├── Module 5: Independence Pathways
├── Module 6: Crisis Connect
├── "See How It Works" Section
│   └── Embedded product demo (2-min video loop)
├── CTA Section
│   └── "Ready to learn more? →"
├── Footer
└── End
```

**Key Principles:**
- One module per full-screen section
- Alternating layout: image right, text left; image left, text right
- Each module occupies 80-100% viewport height
- Scroll-triggered animations (content slides up, image fades in)
- No more than 3 sentences of body text per module

---

## 3.3 Pricing Page

**Structure:**
```
├── Navigation Bar
├── Hero
│   ├── "Simple, Transparent Pricing"
│   └── "Everything you need, nothing you don't."
├── Pricing Toggle (Monthly / Annual)
├── 3 Pricing Cards
│   ├── Starter
│   │   ├── Price display ($XXX/mo)
│   │   ├── Feature list (4-6 items)
│   │   └── CTA: "Start Free Trial"
│   ├── Professional
│   │   ├── Price display (popular badge)
│   │   ├── Feature list (8-10 items)
│   │   └── CTA: "Start Free Trial"
│   └── Enterprise
│       ├── "Custom pricing"
│       └── CTA: "Contact Sales"
├── FAQ Section (Accordion)
├── Feature Comparison Table (condensed)
├── Footer
└── End
```

**Key Principles:**
- Cards stack vertically on mobile, 3-column grid on desktop
- Professional card slightly elevated (shadow lift, subtle scale)
- Feature list: checkmarks (accent color), no boxes
- Annual toggle: 20% discount badge
- Smooth transition on toggle (150ms)
- No comparison table above the fold

---

## 3.4 About Page

**Structure:**
```
├── Navigation Bar
├── Hero
│   ├── "About YUTHUB"
│   └── "Housing is more than walls."
├── Section 1: Vision
│   ├── Icon (vision/lightbulb)
│   ├── Headline: "Empowering youth independence through technology."
│   └── 2-3 sentences of body text
├── Section 2: Approach
│   ├── Icon (approach/compass)
│   ├── Headline: "Design-first. Human-centered. Scalable."
│   └── 2-3 sentences of body text
├── Section 3: Promise
│   ├── Icon (promise/shield)
│   ├── Headline: "Reliability, privacy, and support."
│   └── 2-3 sentences of body text
├── Team Section (optional, minimal)
│   └── Small grayscale photos, names, roles (very restrained)
├── Footer
└── End
```

**Key Principles:**
- Black text on pure white background only
- Use subtle grayscale photos (one subject, blurred background)
- Avoid stock imagery; use real team photos if included
- Each section: icon (24x24), headline, body text, spacing
- No more than 50 words per section

---

## 3.5 Contact Page

**Structure:**
```
├── Navigation Bar
├── Hero
│   ├── "Get in Touch"
│   └── "We're here to help."
├── Two-Column Layout
│   ├── Left: Contact Form
│   │   ├── Name input
│   │   ├── Email input
│   │   ├── Message textarea
│   │   └── Submit button
│   └── Right: Contact Info
│       ├── Email (clickable link)
│       ├── Phone (clickable link)
│       └── Minimal illustration or map
├── Footer
└── End
```

**Key Principles:**
- Form left, info right on desktop; stacked on mobile
- Form fields: large padding, subtle borders, focus glow
- Message textarea: 200px min-height
- No form clutter (no job title, no company size, etc.)
- Submit button: full width on mobile, 180px on desktop
- Contact info: 2-3 lines max

---

## 3.6 Sign In / Dashboard Access

**Structure (Sign In Page):**
```
├── Full-screen layout
├── Dark gradient background (optional subtle animation)
├── Centered form card
│   ├── YUTHUB logo
│   ├── "Sign In to Your Dashboard"
│   ├── Email input
│   ├── Password input
│   ├── "Remember me" checkbox
│   ├── Sign In button (full width)
│   ├── "Forgot password?" (link)
│   └── "Need access?" (link)
└── End
```

**Styles:**
- Form width: 380px max
- Background: white or very light gray
- Input styling: same as elsewhere (border, shadow on focus)
- Button: gradient accent, full width
- Links: small, 12px, color #666
- Subtle entry animation: form fades in + slides up

---

# 4. AUTHENTICATED DASHBOARDS

## 4.1 Dashboard Layout System

**Universal Structure:**
```
├── Top Navigation Bar
│   ├── Logo/Home link
│   ├── Search bar
│   ├── Notifications (icon with badge)
│   ├── User profile menu
│   └── Settings link
├── Left Sidebar (Collapsible)
│   ├── Module nav (one active)
│   ├── Sub-nav items (contextual)
│   └── Collapse/expand toggle
├── Main Content Area
│   ├── Page header (title + breadcrumb)
│   ├── Primary action buttons
│   └── Main content (table, cards, or canvas)
└── End
```

**Principles:**
- Left sidebar: 240px wide (collapsed: 64px)
- Top nav: 64px height
- Main content: max-width 1400px
- All text: grayscale (only accent color for active states)
- No color overload

---

## 4.2 Admin Dashboard

**Focus:** Organization overview, users, billing, settings.

**Primary Sections:**
- Overview: KPIs (residents, properties, active incidents, MRR)
- Users: Team member list, roles, access
- Billing: Subscription, invoices, usage
- Settings: Organization profile, configurations

**Layout:**
- Top row: 4 KPI cards (each with number, label, and trend indicator)
- Below: two columns
  - Left (60%): Data table or detailed view
  - Right (40%): Sidebar with filters or details

---

## 4.3 Manager Dashboard

**Focus:** Residents, staff, incidents, reports.

**Primary Sections:**
- Residents: List with search, filters, quick actions
- Staff: Team roster, availability
- Incidents: Open incidents, priority stack, recent activity
- Reports: Quick reports, export options

**Layout:**
- Large main table/list with 4–5 columns
- Right sidebar: filters, bulk actions
- Top: search bar + quick filters

---

## 4.4 Support Worker Dashboard

**Focus:** Assigned residents, daily tasks, case notes, messages.

**Primary Sections:**
- My Residents: Assigned list with status indicators
- Today's Tasks: Daily action items (checklist style)
- Case Notes: Recent notes, search
- Messages: Unread messages, quick reply

**Layout:**
- Left: resident list (thumbnail + name + status)
- Right: content area (resident profile, tasks, notes)
- Sticky top: today's date, task count

---

## 4.5 Resident Portal

**Focus:** My plan, goals, progress, messages, support requests.

**Primary Sections:**
- My Plan: Current support plan, goals, timeline
- Progress: Milestones achieved, current progress bars
- Messages: Communicate with support worker
- Help: FAQs, contact support

**Layout:**
- Centered, single-column design
- Cards for each section
- Large, readable fonts (18px body text)
- Emoji or simple icons for visual breaks

---

# 5. NAVIGATION INFORMATION ARCHITECTURE

## 5.1 Top Navigation Menu (5 items only)

```
YUTHUB [Logo] | Home | Platform | Pricing | Resources | Sign In
```

- **Home:** Landing page
- **Platform:** Product overview, all modules
- **Pricing:** Pricing plans
- **Resources:** Demo, docs, help center, blog
- **Sign In:** Dashboard login (or "Dashboard" if logged in)

---

## 5.2 Platform Menu Expandable

When user hovers "Platform":
```
Platform
├── Housing Management
├── Support Services
├── Safeguarding
├── Financial Management
├── Independence Pathways
└── Crisis Connect
```

---

## 5.3 Resources Menu Expandable

When user hovers "Resources":
```
Resources
├── Product Demo (video)
├── Documentation
├── Help Center
├── Blog / Insights
└── API Reference
```

---

## 5.4 Authenticated Sidebar Navigation

```
YUTHUB [Logo]

[Search]

─────────────

Dashboard
Housing
  └─ Properties
  └─ Residents
  └─ Placements

Support
  └─ Plans
  └─ Goals
  └─ Notes

Safeguarding
  └─ Incidents
  └─ Risk Assessments
  └─ Actions

Finance
  └─ Billing
  └─ Reports
  └─ Invoices

Settings
  └─ Organization
  └─ Users
  └─ Integrations

Help
```

---

# 6. USER JOURNEYS & FLOWS

## 6.1 New User Journey (Prospect to Subscriber)

```
1. Landing Page
   ├─ Hero statement
   ├─ Value proposition overview
   └─ CTA: "Book a Demo" or "Start Free Trial"

2. Platform Overview Page
   ├─ Learn 6 modules (Housing, Support, Safeguarding, Finance, Independence, Crisis)
   └─ CTA: "Try Free for 14 Days"

3. Pricing Page
   ├─ Compare plans
   └─ CTA: "Start Starter Plan" or "Contact Sales"

4. Sign Up (if trial)
   ├─ Email, password
   ├─ Organization name
   └─ CTA: "Create Account"

5. Onboarding Walkthrough (in-app)
   ├─ 1st Property setup
   ├─ 1st Resident profile
   ├─ 1st Staff member
   ├─ Permissions setup
   └─ Success: "Your platform is ready"

6. Dashboard
   ├─ Empty state guides
   ├─ Contextual help
   └─ Suggested next steps
```

**Key Moments:**
- Each page answers one question only
- CTAs increase in specificity (generic → trial → plan-specific)
- No friction, no required fields beyond essentials
- Onboarding is guided, not forced

---

## 6.2 Returning User Journey (Daily Usage)

```
1. Sign In
   ├─ Email + Password (or magic link)
   └─ Dashboard loads to last-visited page

2. Dashboard Landing
   ├─ Quick stats view
   ├─ Today's priorities
   └─ Recent activity

3. Task Selection
   ├─ View residents
   ├─ Review incidents
   ├─ Check messages
   └─ Update case notes

4. Action
   ├─ Create/edit entry
   ├─ Assign tasks
   ├─ Communicate
   └─ Save (auto-save on keyup)

5. Navigation to Next Task
   └─ Repeat 3–4
```

---

# 7. EMPTY STATE & LOADING PATTERNS

## 7.1 Empty State (No Data)

```html
<div class="empty-state">
  <div class="empty-icon">📋</div>
  <h3>No Residents Yet</h3>
  <p>Start by adding your first resident to the system.</p>
  <button class="btn btn-primary">Add Resident</button>
</div>
```

**Styles:**
- Icon: 48px, emoji or SVG
- Headline: 18px, 600 weight
- Body: 14px, #666
- Button: secondary style
- Layout: centered, 200px max-width
- Margin: 64px top/bottom

---

## 7.2 Loading State (Skeleton)

```html
<div class="skeleton-card">
  <div class="skeleton-header"></div>
  <div class="skeleton-line"></div>
  <div class="skeleton-line" style="width: 80%;"></div>
</div>
```

**Styles:**
- Background: #F0F0F0
- Shimmer animation: subtle left-to-right pulse (1s loop)
- Border-radius: inherit (12px for buttons, 16px for cards)
- Height: matches real content height

---

## 7.3 Loading Spinner

**Use:** Minimal, centered, monochrome spinner.
- Size: 24px or 32px
- Color: #4F46E5
- Animation: rotate 360° over 1s, linear, infinite
- Use only when action takes >500ms

---

# 8. RESPONSIVE DESIGN

## 8.1 Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 640px | Single column, full width, no sidebar |
| Tablet | 640px–1024px | 2-column (content + sidebar if needed) |
| Desktop | > 1024px | Full layout with all components |

---

## 8.2 Mobile-First Rules

- **Navigation:** Hamburger menu collapses nav at < 768px
- **Sidebar:** Hidden on mobile, accessible via hamburger
- **Cards:** Full width on mobile, 2-column grid on tablet, multi-column on desktop
- **Typography:** Reduce by 2px on mobile (e.g., 56px → 40px)
- **Spacing:** Reduce by 25% on mobile (e.g., 48px → 32px)
- **Buttons:** Full width on mobile, auto on desktop

---

# 9. ACCESSIBILITY & INCLUSIVE DESIGN

## 9.1 Keyboard Navigation

- All interactive elements must be focusable (buttons, links, inputs)
- Tab order must follow logical reading order (left to right, top to bottom)
- Focus indicator: 3px solid accent color, 2px offset
- Never remove focus outline with `outline: none`

---

## 9.2 Color Contrast

- Text on background: minimum 4.5:1 contrast (WCAG AA)
- Large text: minimum 3:1 contrast
- Use of color alone is never the only indicator (pair with icon or text)
- Links are underlined or have strong visual treatment

---

## 9.3 Motion Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 9.4 Screen Reader Support

- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<h1>–<h6>`
- ARIA labels for icons: `<button aria-label="Close menu">`
- Live regions for updates: `<div aria-live="polite">`
- Form labels always connected: `<label for="email">`

---

# 10. IMPLEMENTATION GUIDELINES

## 10.1 Figma / Design Tool Setup

- **Artboards:** Mobile (375px), Tablet (768px), Desktop (1440px)
- **Component library:** Build all components as variants (state: default, hover, active, disabled)
- **Colors:** Create library with all hex values
- **Spacing:** Use 8px grid with guidelines every 16px

---

## 10.2 CSS / Tailwind Configuration

**If using Tailwind, customize `tailwind.config.js`:**

```javascript
module.exports = {
  theme: {
    colors: {
      white: '#FFFFFF',
      black: '#111111',
      gray: {
        50: '#FAFAFA',
        100: '#F9F9F9',
        200: '#F0F0F0',
        500: '#666666',
        600: '#555555',
        900: '#111111',
      },
      accent: {
        500: '#4F46E5',
        600: '#7C3AED',
      },
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    fontSize: {
      xs: ['12px', '1.4'],
      sm: ['14px', '1.5'],
      base: ['16px', '1.6'],
      lg: ['18px', '1.6'],
      xl: ['20px', '1.5'],
      '2xl': ['24px', '1.3'],
      '3xl': ['36px', '1.3'],
      '4xl': ['48px', '1.2'],
      '5xl': ['56px', '1.2'],
    },
    spacing: {
      0: '0',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px',
      8: '32px',
      12: '48px',
      16: '64px',
    },
    borderRadius: {
      sm: '8px',
      md: '10px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    boxShadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
      md: '0 4px 12px rgba(0, 0, 0, 0.12)',
      lg: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
      focus: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },
};
```

---

## 10.3 Component File Structure (React / Vue)

```
components/
├── Layout/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── MainLayout.tsx
├── Buttons/
│   ├── Button.tsx (primary, secondary, tertiary variants)
│   └── IconButton.tsx
├── Forms/
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Checkbox.tsx
│   └── Select.tsx
├── Cards/
│   ├── Card.tsx
│   ├── FeatureCard.tsx
│   └── PricingCard.tsx
├── Sections/
│   ├── Hero.tsx
│   ├── FeatureSection.tsx
│   └── Testimonial.tsx
└── Common/
    ├── EmptyState.tsx
    ├── Skeleton.tsx
    └── Spinner.tsx
```

---

## 10.4 Page File Structure

```
pages/
├── (marketing)/
│   ├── page.tsx (Landing)
│   ├── platform/page.tsx
│   ├── pricing/page.tsx
│   ├── about/page.tsx
│   └── contact/page.tsx
├── (auth)/
│   ├── signin/page.tsx
│   └── signup/page.tsx
└── (dashboard)/
    ├── layout.tsx (Dashboard layout)
    ├── page.tsx (Overview)
    ├── housing/page.tsx
    ├── support/page.tsx
    ├── safeguarding/page.tsx
    ├── finance/page.tsx
    ├── settings/page.tsx
    └── help/page.tsx
```

---

# 11. FINAL CHECKLIST

Before launching any page or feature:

- [ ] Headline is 5–8 words max
- [ ] No more than 3 levels of hierarchy
- [ ] Only one primary CTA per page/section
- [ ] All copy fits on first read (no scrolling for key message)
- [ ] Color used sparingly (accent + grayscale only)
- [ ] All animations are <500ms
- [ ] No notifications/alerts/flashing elements
- [ ] Focus states visible and clear
- [ ] Keyboard navigation tested
- [ ] Mobile version tested at 375px and 768px
- [ ] Load time under 3 seconds
- [ ] Whitespace (negative space) used intentionally
- [ ] No stock photos or clichés
- [ ] Every word serves a purpose
- [ ] If in doubt, remove it

---

# 12. DESIGN EVOLUTION

This system is not static. It evolves with user feedback and organizational growth.

**Review quarterly:**
- Are users completing tasks efficiently?
- Where do users get confused?
- What patterns emerged from usage?
- What can be simplified further?

**Principle:** Beauty is never added; clarity is always clarified.

---

**Remember:** Simplicity is not the absence of features. It's the absence of clutter.

Every pixel, every word, every motion serves the user's intention.
