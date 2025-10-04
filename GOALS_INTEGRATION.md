# Goals Feature Integration

## Overview
Integrated the Goals API endpoints with the frontend to fetch, display, and create goals dynamically.

## Changes Made

### 1. Created Goals Service (`src/lib/services/goals.ts`)
- **Functions:**
  - `fetchGoals(token, isActive?)` - Fetch all goals for authenticated user
  - `createGoal(token, goalData)` - Create a new goal
  - `updateGoal(token, goalId, updates)` - Update existing goal
  - `deleteGoal(token, goalId)` - Delete a goal

- **Types:**
  - `Goal` - API response type matching backend structure
  - `CreateGoalData` - Payload type for creating goals

### 2. Enhanced AddGoalForm Component (`src/routes/goals/AddGoalForm.svelte`)
- Added all required fields from API:
  - Title (required)
  - Description
  - Type (short/medium/long) - dropdown selector
  - Short Description
  - Metric Key (required)
  - Target Value (required)
  - Start Date (required)
  - End Date (optional)
- Added validation for required fields
- Added loading state during submission
- Added error display
- Form now emits properly structured data for API

### 3. Updated Goals Page (`src/routes/goals/+page.svelte`)
- Integrated with goals API service
- Fetches active goals on mount using `fetchGoals()`
- Displays loading state while fetching
- Displays empty state when no goals exist
- Maps API goal structure to Timeline component format
- Handles goal creation through form submission
- Error handling and display
- Calculated statistics based on real data:
  - Total active goals
  - Completed goals
  - Available points
  - Earned points

### 4. Updated Config (`src/lib/config.ts`)
- Added fallback to `VITE_API_BASE_URL` environment variable
- Maintains backward compatibility with `VITE_BACKEND_URL`

## API Integration Details

### GET Goals Endpoint
```bash
curl -X GET "https://localhost:5000/api/goals/?is_active=true" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <token>"
```

**Response Format:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "description": "string",
    "type": "short|medium|long",
    "progress": number,
    "desc_short": "string|null",
    "metric_key": "string",
    "target_value": number,
    "is_active": boolean,
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD|null",
    "created_at": "ISO timestamp"
  }
]
```

### POST Goals Endpoint
```bash
curl -X POST "https://localhost:5000/api/goals/" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meditar 30 días seguidos",
    "description": "Crear hábito de meditación diaria",
    "type": "short",
    "desc_short": "Meditar diariamente",
    "metric_key": "meditation_days",
    "target_value": 30,
    "is_active": true,
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "progress": "0"
  }'
```

## Data Mapping

### API Goal → Timeline Goal
- `id` → `id`
- `title` → `title`
- `description` → `description`
- `end_date` (or `start_date`) → `deadline`
- `progress` → determines `status` (0=pending, >0=in-progress, 100=completed)
- `type` → `type`
- `progress` → `progress`
- `type` → calculates `points` (short=50, medium=200, long=500)

## Authentication
Uses the `AuthStore.getToken()` method to retrieve the JWT token from localStorage and includes it in the `Authorization: Bearer <token>` header for all API requests.

## Environment Variables
Make sure to set in `.env`:
```bash
VITE_API_BASE_URL=http://localhost:5000
# or for production
VITE_API_BASE_URL=https://your-backend-url.com
```

## Features
✅ Fetch and display real goals from API
✅ Create new goals with complete form
✅ Loading states
✅ Empty states
✅ Error handling and display
✅ Real-time statistics calculation
✅ Mobile and desktop responsive
✅ Type-safe with TypeScript
✅ Authentication integration

## Next Steps (Optional)
- [ ] Add goal update functionality (edit existing goals)
- [ ] Add goal deletion with confirmation
- [ ] Add progress update feature
- [ ] Add filtering (by type, status)
- [ ] Add sorting options
- [ ] Add refresh button
- [ ] Add optimistic updates
- [ ] Add pull-to-refresh on mobile
