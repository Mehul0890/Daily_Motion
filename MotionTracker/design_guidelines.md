# Daily Motion Habit Tracking App - Design Guidelines

## Design Approach
**Reference-Based + Modern App Aesthetics**
Drawing inspiration from modern productivity apps (Notion, Linear, Headspace) combined with health tracking interfaces (Apple Health, Strava). The design prioritizes clarity, motivation, and aesthetic appeal to encourage daily engagement.

## Core Design Principles
- **Glass-morphism & Depth**: Layered UI with frosted glass effects, subtle shadows, and depth
- **Data Visualization First**: Charts and graphs are primary UI elements, not afterthoughts
- **Motivational Design**: Progress indicators, streaks, and positive reinforcement throughout
- **Seamless Dual Theming**: Dark and light modes with smooth transitions

## Typography System
**Primary Font**: Inter (clean, modern, excellent readability for data)
**Hierarchy**:
- Hero/Display: 3xl to 4xl, font-weight 700
- Section Headers: xl to 2xl, font-weight 600
- Body Text: base to lg, font-weight 400
- Data/Numbers: lg to 2xl, font-weight 600-700 (emphasis on metrics)
- Labels/Captions: sm to base, font-weight 500

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, and 12
- Component padding: p-4 to p-8
- Section spacing: gap-6 to gap-8
- Card margins: m-4 to m-6
- Container max-width: max-w-7xl with px-4

**Grid Structure**:
- Dashboard: 3-column grid on desktop (lg:grid-cols-3), 1-column mobile
- Analytics cards: 2-column on tablet (md:grid-cols-2), stacked mobile
- Activity lists: Single column with generous spacing

## Color Strategy
**Light Mode Palette**: Blue (#3B82F6), Purple (#8B5CF6), Teal (#14B8A6)
**Dark Mode Palette**: Deeper saturations with higher contrast
**Usage**:
- Primary actions: Blue gradient (blue-500 to blue-600)
- Accent elements: Purple for achievements, Teal for productivity metrics
- Glass-morphism backgrounds: bg-white/10 to bg-white/20 with backdrop-blur
- Neutral grays for text hierarchy

## Component Library

### Navigation & Structure
- **Top Navigation**: Glass-morphic header with blur, fixed position, contains logo, theme toggle, profile avatar
- **Side Navigation** (Desktop): Collapsible sidebar with icon + label, active state with gradient background
- **Bottom Navigation** (Mobile): Fixed tab bar with icons and labels, active state highlighted

### Dashboard Components
- **Stat Cards**: Glass-morphic cards with gradient borders, large number display, small trend indicator, icon in corner
- **Activity Pie Chart**: Centered with legend, interactive segments, shows percentage on hover
- **Streak Counter**: Prominent display with flame/calendar icon, animated on increment
- **Daily Progress Bar**: Thick, gradient-filled, with time markers and goals

### Input & Forms
- **Activity Selector**: Dropdown with icons for each activity type, custom activity creation inline
- **Time Input**: Dual input for hours/minutes with increment/decrement buttons, quick-add presets (15min, 30min, 1hr)
- **Date Picker**: Calendar overlay with heatmap coloring for historical data

### Analytics Screens
- **Weekly Bar Chart**: Horizontal bars comparing activities, stacked view option, hover tooltips with exact times
- **Monthly Heatmap**: GitHub-style contribution calendar, color intensity based on total time, clickable cells showing daily breakdown
- **Comparison Cards**: Side-by-side metrics with percentage change indicators and trend arrows

### Notifications & Modals
- **Toast Notifications**: Slide in from top-right, glass effect, auto-dismiss, success/warning color coding
- **Modal Overlays**: Centered with backdrop blur, smooth scale-in animation, rounded corners
- **Reminder Settings**: Time picker with AM/PM toggle, notification preview

### Profile & Settings
- **User Profile Card**: Avatar with gradient ring, stats summary below, edit button
- **Settings Toggles**: Large touch-friendly switches for dark mode and notifications
- **Theme Switcher**: Sun/moon icon toggle with smooth transition animation

## Screen-Specific Layouts

### Onboarding (3 screens)
Full-viewport slides with centered content, large illustrations/icons, gradient backgrounds, swipe navigation with progress dots

### Login/Register
Centered card (max-w-md), glass effect, social login options, smooth form validation, floating labels

### Home Dashboard
Hero section with greeting and daily summary, 3-column metrics grid, today's activity pie chart, recent activity list, quick-add floating action button

### Daily Motion Input
Large time input at top, activity selector grid below (2-3 columns), submit button with haptic feedback, recent entries list at bottom

### Weekly Report
Week selector at top, bar chart occupying 60% of viewport, insight cards below in 2-column grid, "Export" and "Share" actions

### Monthly Analytics
Month/year selector, calendar heatmap (7-column grid for days), stat cards for best/worst days, monthly summary with AI-generated insights

### Settings
List-style layout with grouped sections (Account, Notifications, Appearance, Data), each setting with icon, description, and control element

## Animations & Interactions
- **Page Transitions**: Fade and slight slide (Framer Motion), 200-300ms duration
- **Card Reveals**: Stagger animation on dashboard load, 50ms delay between cards
- **Chart Animations**: Data points animate in sequentially, smooth easing
- **Button States**: Scale on press (0.95), subtle shadow increase on hover
- **Loading States**: Skeleton screens with shimmer effect, pulsing placeholder cards

## Images
**Hero Illustrations**: Abstract geometric shapes representing productivity/time management on onboarding screens
**Empty States**: Friendly illustrations when no data exists (e.g., empty clipboard for no activities)
**Achievement Badges**: Icon-based with gradient fills for milestones
No large photographic hero images - this is a data-focused app where charts and metrics are the visual heroes

## Accessibility
- Touch targets minimum 44x44px
- Color contrast ratios meet WCAG AA (4.5:1 for text)
- Keyboard navigation for all interactive elements
- Screen reader labels for charts and data visualizations
- Focus indicators with theme-aware colors

## Responsive Breakpoints
- Mobile: < 640px (single column, bottom nav)
- Tablet: 640px - 1024px (2-column grids, condensed sidebar)
- Desktop: > 1024px (full 3-column layouts, expanded sidebar)