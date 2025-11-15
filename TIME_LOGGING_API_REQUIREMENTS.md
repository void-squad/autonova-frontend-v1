# Time Logging API Requirements for Employee Dashboard

## Overview
This document specifies the API endpoint needed for the Employee Dashboard to display time logging statistics from the `time_logs` table.

## Database Schema Reference
```sql
CREATE TABLE time_logs (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    hours DECIMAL(5, 2) NOT NULL CHECK (hours > 0),
    note TEXT,
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(user_id) ON DELETE CASCADE
);
```

## Required API Endpoint

### **GET** `/api/v1/employee/time-logs/stats`

**Purpose:** Get aggregated time logging statistics for the authenticated employee to display in the dashboard.

**Authentication:** Required (Employee role)

**Authorization:** Employee can only view their own time logs

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Status Codes:**
- `200 OK` - Successfully retrieved statistics
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User is not an employee
- `500 Internal Server Error` - Server error

**Response Body:**
```typescript
{
  // Current period statistics
  "totalHoursThisWeek": 32.5,          // Sum of hours for current week (Monday-Sunday)
  "totalHoursThisMonth": 140.25,       // Sum of hours for current month
  "totalHoursToday": 6.5,              // Sum of hours logged today
  
  // Daily breakdown for current week
  "dailyHours": [
    {
      "date": "2025-11-06",            // ISO date format (YYYY-MM-DD)
      "hours": 8.0,                     // Total hours for this day
      "logCount": 3                     // Number of time log entries
    },
    {
      "date": "2025-11-05",
      "hours": 7.5,
      "logCount": 2
    }
    // ... more days
  ],
  
  // Recent time log entries (last 10)
  "recentLogs": [
    {
      "id": "uuid-here",
      "projectId": "project-uuid",
      "projectName": "Vehicle Customization - Tesla Model 3",  // From projects table
      "taskId": "task-uuid",
      "taskName": "Install Custom Exhaust System",            // From project_tasks table
      "hours": 3.5,
      "note": "Completed exhaust installation and testing",
      "loggedAt": "2025-11-06T14:30:00Z"                      // ISO timestamp
    }
    // ... more logs
  ],
  
  // Summary statistics
  "averageHoursPerDay": 6.8,           // Average hours per working day
  "totalLogs": 45,                     // Total count of all time log entries
  "mostProductiveDay": {
    "date": "2025-11-04",
    "hours": 10.5
  }
}
```

## SQL Query Examples

### 1. Total Hours This Week
```sql
SELECT 
    COALESCE(SUM(hours), 0) as totalHoursThisWeek
FROM time_logs
WHERE employee_id = ?
    AND YEARWEEK(logged_at, 1) = YEARWEEK(CURRENT_DATE, 1);
```

### 2. Total Hours This Month
```sql
SELECT 
    COALESCE(SUM(hours), 0) as totalHoursThisMonth
FROM time_logs
WHERE employee_id = ?
    AND YEAR(logged_at) = YEAR(CURRENT_DATE)
    AND MONTH(logged_at) = MONTH(CURRENT_DATE);
```

### 3. Total Hours Today
```sql
SELECT 
    COALESCE(SUM(hours), 0) as totalHoursToday
FROM time_logs
WHERE employee_id = ?
    AND DATE(logged_at) = CURRENT_DATE;
```

### 4. Daily Hours Breakdown (Current Week)
```sql
SELECT 
    DATE(logged_at) as date,
    SUM(hours) as hours,
    COUNT(*) as logCount
FROM time_logs
WHERE employee_id = ?
    AND YEARWEEK(logged_at, 1) = YEARWEEK(CURRENT_DATE, 1)
GROUP BY DATE(logged_at)
ORDER BY date DESC;
```

### 5. Recent Logs with Project/Task Names
```sql
SELECT 
    tl.id,
    tl.project_id as projectId,
    p.name as projectName,
    tl.task_id as taskId,
    pt.name as taskName,
    tl.hours,
    tl.note,
    tl.logged_at as loggedAt
FROM time_logs tl
LEFT JOIN projects p ON tl.project_id = p.id
LEFT JOIN project_tasks pt ON tl.task_id = pt.id
WHERE tl.employee_id = ?
ORDER BY tl.logged_at DESC
LIMIT 10;
```

### 6. Average Hours Per Day (Last 30 days)
```sql
SELECT 
    COALESCE(AVG(daily_hours), 0) as averageHoursPerDay
FROM (
    SELECT DATE(logged_at) as log_date, SUM(hours) as daily_hours
    FROM time_logs
    WHERE employee_id = ?
        AND logged_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
    GROUP BY DATE(logged_at)
) as daily_totals;
```

### 7. Most Productive Day (Last 30 days)
```sql
SELECT 
    DATE(logged_at) as date,
    SUM(hours) as hours
FROM time_logs
WHERE employee_id = ?
    AND logged_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY DATE(logged_at)
ORDER BY hours DESC
LIMIT 1;
```

### 8. Total Logs Count
```sql
SELECT COUNT(*) as totalLogs
FROM time_logs
WHERE employee_id = ?;
```

## Implementation Notes

### Authentication
- Extract `employee_id` from the authenticated JWT token
- Do NOT allow employees to view other employees' time logs
- Ensure the `employee_id` from the token matches the query parameter

### Performance Considerations
- Add index on `(employee_id, logged_at)` for faster queries
- Consider caching this endpoint for 5-15 minutes
- Use database connection pooling
- Optimize JOINs with proper indexes on foreign keys

### Error Handling
- Return appropriate HTTP status codes
- Provide clear error messages
- Log errors for debugging
- Handle database connection failures gracefully

### Data Validation
- Ensure `employee_id` exists in the database
- Validate date ranges if filters are added
- Handle NULL values appropriately (use COALESCE)

### Example Index Creation
```sql
-- Improve query performance
CREATE INDEX idx_time_logs_employee_logged 
ON time_logs(employee_id, logged_at DESC);

CREATE INDEX idx_time_logs_project 
ON time_logs(project_id);

CREATE INDEX idx_time_logs_task 
ON time_logs(task_id);
```

## Additional Endpoints (Optional for Future)

### Get Detailed Time Logs with Filtering
```
GET /api/v1/employee/time-logs?page=1&limit=20&startDate=2025-11-01&endDate=2025-11-30
```

### Create Time Log Entry
```
POST /api/v1/employee/time-logs
Body: {
  "projectId": "uuid",
  "taskId": "uuid",
  "hours": 3.5,
  "note": "Optional note",
  "loggedAt": "2025-11-06T14:30:00Z"  // Optional, defaults to now
}
```

### Update Time Log Entry
```
PATCH /api/v1/employee/time-logs/:id
Body: {
  "hours": 4.0,
  "note": "Updated note",
  "loggedAt": "2025-11-06T15:00:00Z"
}
```

### Delete Time Log Entry
```
DELETE /api/v1/employee/time-logs/:id
```

## Frontend Integration

The frontend is already configured to call this endpoint:

**File:** `src/lib/api/employee.ts`
```typescript
getTimeLogStats: async (): Promise<TimeLogStats> => {
  const response = await api.get<TimeLogStats>('/employee/time-logs/stats');
  return response.data;
}
```

**Usage in Dashboard:** `src/pages/employee/EmployeeDashboard.tsx`
```typescript
const timeLogsData = await employeeApi.getTimeLogStats();
setTimeLogStats(timeLogsData);
```

## Testing Checklist

- [ ] Endpoint returns correct data for authenticated employee
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 403 for non-employee users
- [ ] Week calculations use correct week boundaries (Monday-Sunday)
- [ ] Month calculations handle month transitions correctly
- [ ] Daily hours array is sorted by date descending
- [ ] Recent logs include project and task names
- [ ] Handles employees with no time logs (returns zeros)
- [ ] Performance is acceptable (< 500ms response time)
- [ ] Database indexes are in place
- [ ] NULL values are handled properly
- [ ] Timezone handling is correct

## Questions?

Contact the frontend team if:
- The response structure needs modification
- Additional fields are needed
- Performance issues arise
- Data format questions

---

**Priority:** High  
**Estimated Backend Work:** 2-4 hours  
**Required For:** Employee Dashboard v1.0  
**Dependencies:** `projects` and `project_tasks` tables must exist
