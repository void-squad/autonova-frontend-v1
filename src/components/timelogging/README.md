# Time Logging Components (Frontend)

The time-logging UI components found under `src/components/timelogging/` of the Autonova frontend.

Contents

- Overview
- Component catalog (what each component does)
- Key props & data shapes (DTOs)
- API endpoints used by the frontend
- Local dev / seeding notes
- UX rules and edge cases
- Developer notes & where to extend

## Overview

The time-logging feature provides an employee-facing set of components that allow starting/stopping timers, creating manual time logs, viewing historical logs, filtering, and viewing small analytics widgets. Most components are small, focused, and composable so the TimeLoggingPage orchestrates them.

Location

- `autonova-frontend-v1/src/components/timelogging/`

## Component catalog

- `TimeLogStats.tsx` — summary cards for today's hours, weekly total, active timer summary.
- `ActiveTimer.tsx` — persistent timer that tracks elapsed time. Persists state in localStorage so refreshing the page doesn't lose the active timer.
- `SmartSuggestions.tsx` — suggests tasks the employee should start; shows a disabled "Running" button when the suggestion matches the active task.
- `ProjectTaskList.tsx` — shows projects and their tasks with priority badges and start buttons.
- `TimeLogFilters.tsx` — advanced filters (date range, project, task, employee); UI uses pending/applied filters with an explicit Apply button.
- `TimeLogHistory.tsx` — table of historical time logs with pagination and export capability.
- `WeeklySummary.tsx` — weekly aggregated view used for analytics.
- `EfficiencyMeter.tsx` — displays an efficiency badge and progress bar; uses level-specific backgrounds to preserve contrast.
- `TimerStopModal.tsx` — modal shown when stopping a timer to capture optional note; closes immediately after submit for snappy UX.
- `ManualTimeLogModal.tsx` — modal for adding manual logs (project, task, hours, note).

## Key props and DTOs (frontend types)

The frontend mirrors a subset of backend DTOs. Types are under `src/types/` and `src/components/timelogging` expects these shapes:

- TimeLogDto

  - id: string
  - projectId: string
  - projectTitle?: string
  - taskId: string
  - taskName?: string
  - employeeId: string
  - hours: number (displayed with 2 decimals)
  - note?: string
  - loggedAt: string (ISO timestamp)

- ProjectDto (partial)

  - id: string
  - title: string
  - status: string ('PENDING','IN_PROGRESS','COMPLETED')
  - priority: string ('LOW','MEDIUM','HIGH')

- TaskDto (partial)
  - id: string
  - projectId: string
  - taskName: string
  - estimatedHours?: number
  - actualHours?: number

Note: Many components accept optional `project` and `task` objects when the backend supplies enriched DTOs.

## API endpoints used (frontend -> backend)

The frontend calls the time-logging service (via gateway) using `VITE_API_BASE_URL` (example: `http://localhost:8080/api`). Key endpoints:

- GET `/time-logs?employeeId={id}` — fetch logs for an employee (with optional filters)
- POST `/time-logs` — create a time log (body: TimeLogDto minus `id`)
- PUT `/time-logs/{id}` — update time log
- GET `/projects/employee/{employeeId}` — projects for employee (used by ProjectTaskList)
- GET `/tasks/project/{projectId}` — tasks for a project
- GET `/time-logs/summary/weekly` — weekly aggregation (used by WeeklySummary)

If your environment uses an API gateway, ensure `VITE_API_BASE_URL` points to the gateway (example: `http://localhost:8080/api`) so CORS and auth pass through correctly.

## Local dev and seeding

1. Run the backend time-logging service locally (see backend README) so endpoints exist.
2. Backend `data.sql` should be applied first — it creates `emp-001`, `cust-001`, `veh-001` etc.

## UX rules and edge cases

- Hours formatting: display with 2 decimal places across all components (e.g., `1.50`).
- Timer behavior: starting a timer for a task should stop any currently running timer for the same employee and persist the new active timer in localStorage.
- SmartSuggestions: if the suggested task is currently running, the action button should be disabled and display `Running`.
- TimerStopModal: after the user submits a note, the modal currently closes immediately for a responsive UX. If you prefer to wait for backend acknowledgement before closing, change the modal to await the API response and handle errors gracefully.
- Filters: the filter UI uses a "pending" state that only applies when the user clicks Apply. The UI shows an active-filter badge only when filters differ from defaults.

## Developer notes & where to extend

- Add new components or modify existing ones under `src/components/timelogging/`.
- Centralize API changes in `src/Api/timeLoggingApi.ts` (or wherever axios instances are defined) so components remain thin.
- If the backend moves to an event-driven enrichment model (project/task metadata owned by project-service):
  - Update `TimeLogDto` to accept optional `project` and `task` objects.
  - Make UI resilient to missing enrichment data (show IDs and a spinner or fallback text).
