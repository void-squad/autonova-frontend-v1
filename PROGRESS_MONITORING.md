# Progress Monitoring Feature

## Overview

The Progress Monitoring feature provides real-time updates on vehicle service projects for both customers and employees. It uses Server-Sent Events (SSE) for live updates and integrates with the progress-monitoring-service backend.

## Features

### For Customers
- **Progress Monitoring Dashboard** (`/customer/progress-monitoring`): View all projects with their latest status updates
- **Project Progress Detail** (`/customer/progress/:projectId`): View detailed timeline of updates for a specific project
- **Live Updates**: Real-time notifications when employees post updates via SSE
- **Message Categories**: Updates are categorized (CREATED, APPROVED, COMPLETED, UPDATED, etc.)
- **Attachment Support**: View and download attachments posted by employees

### For Employees/Admins
- **Project Progress Management** (`/admin/projects/:projectId/progress`): Post updates and manage project progress
- **Update Posting**: Create status updates with different categories
- **File Attachments**: Upload files along with status updates
- **Task Management**: Update task statuses directly from the progress page
- **Live Updates**: See real-time updates from other team members via SSE

## API Integration

### Backend Service
- **Service**: `progress-monitoring-service`
- **Default Port**: 8086
- **Base URL**: Configured via `VITE_PROGRESS_API_BASE_URL` environment variable

### Key Endpoints
- `GET /api/projects/my/statuses` - Get all project statuses for customer
- `GET /api/projects/:projectId/messages` - Get all messages for a project
- `POST /api/projects/:projectId/messages` - Post a new status message (Employee only)
- `POST /api/projects/:projectId/messages/upload` - Upload file with message (Employee only)
- `GET /sse/projects/:projectId` - Subscribe to live updates via SSE

## Components

### New Files Created
1. **Types**: `src/types/progressMonitoring.ts`
   - TypeScript interfaces for messages, statuses, and SSE events

2. **Service**: `src/services/progressMonitoringService.ts`
   - API calls and SSE connection management

3. **Pages**:
   - `src/pages/customer/ProgressMonitoring.tsx` - Customer dashboard
   - `src/pages/customer/ProjectProgress.tsx` - Customer project detail (enhanced)
   - `src/pages/employee/ProjectProgress.tsx` - Employee project detail (enhanced)

### Modified Files
1. **Routes**: `src/App.tsx`
   - Added customer progress monitoring routes
   - Added admin project progress route

2. **Navigation**: `src/components/layout/CustomerSidebar.tsx`
   - Added "Progress Monitoring" menu item

3. **Admin Projects**: `src/pages/admin/ProjectDetailsPage.tsx`
   - Added "Progress Monitoring" button to navigate to progress page

4. **Configuration**: `.env.example`
   - Added progress monitoring service URL configuration

## Environment Variables

Add to your `.env` file:

```env
# Progress Monitoring Service
VITE_PROGRESS_API_BASE_URL=http://localhost:8086
VITE_PROGRESS_API_PORT=8086
```

## Usage

### Customer View
1. Navigate to "Progress Monitoring" from the sidebar
2. Click on any project card to view detailed updates
3. Real-time updates will appear automatically via SSE connection
4. Green "Live" badge indicates active SSE connection

### Employee/Admin View
1. Navigate to a project details page
2. Click "Progress Monitoring" button
3. Post updates using the form at the top
4. Select category, enter message, and optionally attach files
5. View all updates in the timeline below
6. Update task statuses directly from the sidebar

## Event Categories

- **CREATED**: Project/task created
- **APPROVED**: Project/task approved
- **REJECTED**: Project/task rejected
- **COMPLETED**: Project/task completed
- **UPDATED**: General update
- **APPLIED**: Change request applied

## SSE Connection

The SSE connection is automatically established when viewing a project's progress page. The connection:
- Automatically reconnects on errors
- Shows connection status with a "Live" badge
- Cleans up properly when leaving the page
- Requires authentication (uses token from localStorage)

## Error Handling

- Network errors display user-friendly messages
- SSE connection failures are logged and handled gracefully
- File upload errors are caught and displayed to users
- Form validation prevents empty messages

## Future Enhancements

- Pagination for large message lists
- Message filtering by category
- Email notifications for important updates
- Rich text formatting in messages
- Image preview for uploaded files
- Export/print progress timeline
