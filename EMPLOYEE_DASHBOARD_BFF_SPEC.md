# Employee Dashboard BFF Endpoint Specification

## Overview
This document specifies the Backend For Frontend (BFF) endpoint for the Employee Dashboard. The BFF service should aggregate data from multiple microservices into a single response.

## Endpoint

```
GET /api/employee/dashboard
```

**Authentication:** Required (JWT Bearer token)

**Authorization:** Employee role required

## Response Structure

```typescript
{
  "stats": {
    "assignedServices": number,          // Count from Tasks/Services Service
    "assignedProjects": number,          // Count from Projects Service
    "inProgressServices": number,        // Count from Tasks/Services Service
    "inProgressProjects": number,        // Count from Projects Service
    "completedToday": number,            // Combined count from both services
    "urgentTasks": number,               // Combined count
    "overdueTasks": number               // Combined count
  },
  "timeLogStats": {
    "totalHoursThisWeek": number,        // From Time Logs Service
    "totalHoursToday": number,           // From Time Logs Service
    "activeTimer": boolean,              // From Time Logs Service
    "averageHoursPerDay": number         // From Time Logs Service (optional)
  },
  "workItems": [
    {
      "id": string,
      "type": "service" | "project",
      "title": string,
      "description": string,
      "status": string,
      "priority": "urgent" | "high" | "normal" | "low",
      "vehicle": string,
      "customer": string,
      "estimatedTime": string,
      "dueDate": string (ISO 8601),
      "progress": number (0-100, for projects only)
    }
  ],
  "urgentTasks": [
    // Same structure as workItems, filtered by priority: "urgent"
  ],
  "overdueTasks": [
    // Same structure as workItems, filtered by dueDate < now
  ]
}
```

## Internal Service Calls

The BFF endpoint should make the following **parallel** calls to microservices:

### 1. Projects Service
```
GET /api/projects/employee/{employeeId}/assigned
GET /api/projects/employee/{employeeId}/stats

Response needed:
- List of assigned projects
- Project statistics
- Filter for urgent and overdue projects
```

### 2. Tasks/Services Service
```
GET /api/tasks/employee/{employeeId}/assigned
GET /api/tasks/employee/{employeeId}/stats

Response needed:
- List of assigned service tasks
- Task statistics
- Filter for urgent and overdue tasks
```

### 3. Time Logs Service
```
GET /api/time-logs/employee/{employeeId}/stats?period=week

Response needed:
- Total hours this week
- Total hours today
- Active timer status
```

### 4. Auth/User Service (Optional)
```
GET /api/users/{employeeId}/profile

Response needed:
- User information for context
```

## Business Logic

### Priority Calculation
- **urgent**: Tasks with priority="urgent" OR dueDate within 24 hours
- **high**: Tasks with priority="high" OR dueDate within 3 days
- **normal**: Default priority
- **low**: Tasks with priority="low"

### Overdue Calculation
- Tasks where `dueDate < currentDateTime` AND `status != "completed"`

### Data Aggregation
1. Combine projects and tasks into unified `workItems` array
2. Sort by: urgentTasks first, then by dueDate ascending
3. Limit to 50 most relevant items for performance

## Error Handling

If any microservice fails:
- **Stats aggregation**: Return partial data with available stats
- **Time logs**: Return `timeLogStats: null` if service unavailable
- **Work items**: Return empty array `[]` if service unavailable
- **HTTP 200** with partial data is preferred over complete failure

Example partial response:
```json
{
  "stats": { ... },
  "timeLogStats": null,  // Service unavailable
  "workItems": [],
  "urgentTasks": [],
  "overdueTasks": [],
  "warnings": [
    "Time Logs Service unavailable"
  ]
}
```

## Performance Requirements

- **Response Time**: < 500ms (target), < 1000ms (max)
- **Caching**: Consider caching for 30-60 seconds
- **Timeout**: Set 3-second timeout for each microservice call
- **Parallel Execution**: All microservice calls should be made in parallel

## Example Implementation (Pseudo-code)

```javascript
async function getEmployeeDashboard(employeeId) {
  // Make parallel calls to microservices
  const [projects, tasks, timeLogs] = await Promise.allSettled([
    projectsService.getEmployeeProjects(employeeId),
    tasksService.getEmployeeTasks(employeeId),
    timeLogsService.getStats(employeeId, 'week')
  ]);

  // Aggregate statistics
  const stats = {
    assignedServices: tasks.value?.assigned || 0,
    assignedProjects: projects.value?.assigned || 0,
    inProgressServices: tasks.value?.inProgress || 0,
    inProgressProjects: projects.value?.inProgress || 0,
    completedToday: (tasks.value?.completedToday || 0) + (projects.value?.completedToday || 0),
    urgentTasks: filterUrgent(tasks.value, projects.value).length,
    overdueTasks: filterOverdue(tasks.value, projects.value).length
  };

  // Combine and transform work items
  const workItems = combineAndTransform(tasks.value?.items, projects.value?.items);
  const urgentTasks = workItems.filter(item => item.priority === 'urgent');
  const overdueTasks = workItems.filter(item => isOverdue(item.dueDate));

  return {
    stats,
    timeLogStats: timeLogs.value || null,
    workItems,
    urgentTasks,
    overdueTasks
  };
}
```

## Testing

### Test Cases
1. ✅ All microservices available and returning data
2. ✅ Time Logs Service unavailable (partial response)
3. ✅ Projects Service unavailable (partial response)
4. ✅ Multiple microservices unavailable simultaneously
5. ✅ Empty datasets (new employee with no assignments)
6. ✅ Large datasets (employee with 100+ assignments)
7. ✅ Urgent tasks prioritization
8. ✅ Overdue tasks calculation

## Security Considerations

1. **Authentication**: Verify JWT token
2. **Authorization**: Ensure employeeId matches authenticated user
3. **Data Filtering**: Only return data for the authenticated employee
4. **Rate Limiting**: Apply rate limiting (e.g., 60 requests/minute)

## Migration Path

### Phase 1: BFF Implementation (Current)
- Implement `/api/employee/dashboard` endpoint
- Keep individual microservice endpoints for backward compatibility

### Phase 2: Frontend Migration
- Update frontend to use BFF endpoint
- Monitor and optimize performance

### Phase 3: Deprecation (Future)
- Deprecate individual aggregation endpoints
- Keep only BFF endpoint and specific detail endpoints

## Notes for Backend Developers

- Use async/await with Promise.allSettled for parallel calls
- Implement circuit breaker pattern for resilience
- Log failures for monitoring and alerting
- Consider using a cache layer (Redis) for frequently accessed data
- Add OpenTelemetry tracing for microservice call monitoring
- Document any assumptions about data formats from upstream services
