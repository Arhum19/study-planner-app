# StudyPlanr - API Usage & Testing Guide

## 🎯 Quick Start

### Backend Server (Port 5000)

```powershell
cd backend
npm install
npm run dev
```

### Frontend (React + Vite)

```powershell
cd AuraPlanner  # or your frontend directory
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` (or next available port).

---

## 📡 API Endpoints

### Base URL

```
http://localhost:5000/api
```

### 1. Health Check

**GET** `/api/status`

**Response:**

```json
{
  "status": "ok"
}
```

**PowerShell Example:**

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/status" -Method GET
```

---

### 2. Generate Study Plan

**POST** `/api/generate-plan`

**Request Body:**

```json
{
  "durationDays": 7,
  "availability": [
    { "day": 1, "hours": 3 },
    { "day": 2, "hours": 5 },
    { "day": 3, "hours": 4 },
    { "day": 4, "hours": 2 },
    { "day": 5, "hours": 4 },
    { "day": 6, "hours": 3 },
    { "day": 7, "hours": 2 }
  ],
  "sessionLength": 1.5,
  "topics": [
    {
      "name": "Sorting",
      "difficulty": 3,
      "subtopics": [
        { "name": "Insertion sort", "percentage": 30 },
        { "name": "Selection sort", "percentage": 30 },
        { "name": "Merge sort", "percentage": 40 }
      ]
    },
    {
      "name": "Searching",
      "difficulty": 4,
      "subtopics": [
        { "name": "Binary search", "percentage": 60 },
        { "name": "Linear search", "percentage": 40 }
      ]
    },
    {
      "name": "Stack",
      "difficulty": 2,
      "subtopics": null
    },
    {
      "name": "Queue",
      "difficulty": 2,
      "subtopics": null
    }
  ]
}
```

**PowerShell Example:**

```powershell
# Using test-data.json
$testData = Get-Content "backend\test-data.json" -Raw
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/generate-plan" -Method POST -Body $testData -ContentType "application/json"
$response.plan | ConvertTo-Json -Depth 10
```

**Or inline:**

```powershell
$body = @{
    durationDays = 7
    availability = @(
        @{ day = 1; hours = 3 },
        @{ day = 2; hours = 5 }
    )
    sessionLength = 1.5
    topics = @(
        @{
            name = "Data Structures"
            difficulty = 4
            subtopics = $null
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5000/api/generate-plan" -Method POST -Body $body -ContentType "application/json"
```

**Response:**

```json
{
  "success": true,
  "plan": {
    "meta": {
      "generatedAt": "2025-12-07T...",
      "durationDays": 7,
      "totalAvailableHours": 23,
      "insufficient_hours": false,
      "coveragePercent": 100
    },
    "topicsSummary": [...],
    "dailyPlan": [...],
    "revisionPlan": [...],
    "warnings": []
  }
}
```

---

### 3. Get Last Saved Plan

**GET** `/api/plan`

**PowerShell Example:**

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method GET
```

**Response:** Returns the last generated/saved plan JSON.

---

### 4. Save Custom Plan

**POST** `/api/save-plan`

**Request Body:** Any valid plan JSON object.

**PowerShell Example:**

```powershell
$customPlan = @{
    meta = @{ generatedAt = (Get-Date).ToString("o") }
    dailyPlan = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/save-plan" -Method POST -Body $customPlan -ContentType "application/json"
```

---

## 🧪 Testing

### Run Unit Tests

```powershell
cd backend
npm test
```

**Expected Output:**

```
Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
```

### Test Coverage Includes:

- ✅ Difficulty weight mapping
- ✅ Subtopic percentage normalization
- ✅ Total hours calculation
- ✅ Hour distribution across topics
- ✅ Task queue creation
- ✅ Revision slot assignment
- ✅ Full plan generation integration

---
gg

## 🎨 Using the Frontend

1. **Start both servers** (backend on 5000, frontend on 5173)

2. **Navigate to** `http://localhost:5173`

3. **Fill in the forms:**

   - Set study duration (days or weeks)
   - Adjust daily availability hours
   - Add topics with difficulty levels (1-5)
   - Optionally add subtopics with percentages

4. **Generate Plan** - Click the button to create your study plan

5. **View Plan** - See daily sessions, topics, and progress tracking

6. **Export** - Download your plan as JSON for backup

---

## 🔧 Troubleshooting

### Port Already in Use

If you see "Port 5173 is in use", Vite will automatically use the next available port (5174, etc).

### Backend Not Responding

Ensure the backend is running:

```powershell
cd backend
npm run dev
```

You should see: `Server running on port 5000`

### CORS Errors

The backend has CORS enabled for all origins. If issues persist, check that both servers are running.

---

## 📦 File Structure

```
AuraPlanner/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server
│   │   ├── scheduler.js       # Algorithm logic
│   │   └── routes/
│   │       └── planRoutes.js  # API endpoints
│   ├── tests/
│   │   └── scheduler.test.js  # Unit tests
│   ├── data/
│   │   └── plans.json         # Persisted plans
│   ├── test-data.json         # Sample test payload
│   └── package.json
│
├── src/
│   ├── api/
│   │   └── apiClient.js       # Fetch wrapper
│   ├── components/
│   │   ├── AvailabilityForm.jsx
│   │   ├── TopicForm.jsx
│   │   ├── DayDropdown.jsx
│   │   ├── PlanView.jsx
│   │   └── ExportButton.jsx
│   ├── pages/
│   │   └── PlannerPage.jsx
│   └── App.jsx
└── package.json
```

---

## ✅ Feature Checklist

- ✅ Backend API with Express
- ✅ Scheduler algorithm with difficulty weighting
- ✅ Revision scheduling (20-25% of timeline)
- ✅ Subtopic support with percentage distribution
- ✅ Insufficient hours detection
- ✅ File persistence (plans.json)
- ✅ Jest unit tests (16 tests passing)
- ✅ React frontend with Tailwind CSS
- ✅ Form validation
- ✅ Collapsible day containers
- ✅ JSON export functionality
- ✅ Loading states and error handling

---

## 🚀 Next Steps

1. Add user authentication
2. Database integration (MongoDB/PostgreSQL)
3. Multiple plan management
4. Calendar integration
5. Email reminders
6. Progress tracking
7. Mobile responsive optimizations

---

## 📄 License

MIT
