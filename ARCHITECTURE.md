# Study Planner - Architecture & Design Guide

## Design System

### Color Palette (Elegant, Sophisticated)
- **Primary**: `#6366f1` (Indigo) - Main actions, highlights
- **Secondary**: `#8b5cf6` (Violet) - Accents, complementary elements
- **Success**: `#10b981` (Emerald) - Completed tasks, positive actions
- **Warning**: `#f59e0b` (Amber) - Medium priority, warnings
- **Danger**: `#ef4444` (Red) - High priority, destructive actions
- **Neutral**: `#6b7280` (Gray) - Secondary text, borders
- **Background**: `#ffffff` (White) - Main background
- **Surface**: `#f9fafb` (Light Gray) - Cards, containers
- **Text Primary**: `#111827` (Dark Gray) - Main text
- **Text Secondary**: `#6b7280` (Gray) - Secondary text

### Typography
- **Font Family**: Inter (system font stack fallback)
- **Headings**: Bold, 1.2 line-height
  - H1: 32px (2rem)
  - H2: 24px (1.5rem)
  - H3: 20px (1.25rem)
- **Body**: Regular, 1.5 line-height
  - Large: 16px (1rem)
  - Regular: 14px (0.875rem)
  - Small: 12px (0.75rem)

### Spacing & Layout
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Border radius: 8px (standard), 12px (large), 4px (small)
- Shadows:
  - Small: `0 1px 2px 0 rgba(0,0,0,0.05)`
  - Medium: `0 4px 6px -1px rgba(0,0,0,0.1)`
  - Large: `0 10px 15px -3px rgba(0,0,0,0.1)`

## Database Schema

### Tables

#### users (existing)
- id (PK)
- openId, name, email, loginMethod, role
- createdAt, updatedAt, lastSignedIn

#### subjects
- id (PK)
- userId (FK to users)
- name (varchar 255)
- color (varchar 7, hex color)
- icon (varchar 50, lucide icon name)
- description (text, nullable)
- createdAt, updatedAt

#### tasks
- id (PK)
- userId (FK to users)
- subjectId (FK to subjects, nullable)
- title (varchar 255)
- description (text, nullable)
- priority (enum: HIGH, MEDIUM, LOW)
- dueDate (datetime, nullable)
- completedAt (datetime, nullable)
- createdAt, updatedAt

#### pomodoro_sessions
- id (PK)
- userId (FK to users)
- taskId (FK to tasks, nullable)
- subjectId (FK to subjects, nullable)
- duration (int, seconds)
- type (enum: WORK, BREAK, LONG_BREAK)
- completedAt (datetime)
- createdAt

#### study_statistics
- id (PK)
- userId (FK to users)
- date (date)
- totalMinutes (int)
- sessionsCompleted (int)
- tasksCompleted (int)
- createdAt, updatedAt

#### subject_statistics
- id (PK)
- userId (FK to users)
- subjectId (FK to subjects)
- date (date)
- minutesSpent (int)
- tasksCompleted (int)
- createdAt, updatedAt

## API Architecture (tRPC Routers)

### auth
- `me` - Get current user
- `logout` - Logout user

### subjects
- `list` - Get all subjects for user
- `create` - Create new subject
- `update` - Update subject
- `delete` - Delete subject

### tasks
- `list` - Get tasks with filters (subject, priority, completed, date range)
- `create` - Create task
- `update` - Update task
- `delete` - Delete task
- `toggleComplete` - Mark task complete/incomplete
- `getById` - Get single task details
- `getByDate` - Get tasks for specific date
- `getUpcoming` - Get upcoming tasks (next 7 days)

### pomodoro
- `sessions.list` - Get session history
- `sessions.create` - Create completed session
- `sessions.getToday` - Get today's sessions
- `sessions.getStats` - Get session statistics

### statistics
- `getDaily` - Get daily statistics
- `getWeekly` - Get weekly statistics
- `getMonthly` - Get monthly statistics
- `getStreak` - Get current study streak
- `getBySubject` - Get statistics per subject

## Frontend Architecture

### Layout Structure
- **DashboardLayout**: Sidebar navigation with main content area
  - Sidebar: Navigation, user profile, quick actions
  - Main: Content area with header and body

### Page Structure
- `/` - Dashboard (overview)
- `/tasks` - Task manager
- `/calendar` - Calendar view
- `/subjects` - Subject management
- `/pomodoro` - Pomodoro timer
- `/progress` - Progress tracking

### Component Hierarchy
```
App
├── ThemeProvider
├── Router
│   ├── Home (Dashboard)
│   ├── TasksPage
│   ├── CalendarPage
│   ├── SubjectsPage
│   ├── PomodoroPage
│   └── ProgressPage
└── Toaster
```

### State Management
- **React Query (tRPC)**: Server state (tasks, subjects, statistics)
- **React Hooks**: Local UI state (form inputs, modals, filters)
- **Context**: Auth state, theme

## Key Implementation Details

### Task Priority System
- **HIGH**: Red color, shown first, due within 3 days
- **MEDIUM**: Amber color, shown second
- **LOW**: Gray color, shown last

### Pomodoro Configuration
- Work interval: 25 minutes (configurable)
- Short break: 5 minutes (configurable)
- Long break: 15 minutes (after 4 sessions)
- Session tracking: Store each completed session

### Study Streak Calculation
- Consecutive days with at least 1 completed Pomodoro session
- Reset if no sessions on a day
- Display current streak and longest streak

### Progress Tracking
- Daily statistics: Total minutes, sessions completed, tasks completed
- Subject statistics: Time spent per subject, tasks completed per subject
- Weekly/monthly aggregations for charts

## Performance Considerations
- Lazy load calendar and progress pages
- Paginate task lists (20 items per page)
- Cache subject list in React Query
- Debounce search/filter inputs
- Optimize re-renders with React.memo for list items
