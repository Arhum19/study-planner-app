# 📖 Use Cases - Aura Planner

> **Project:** Study Planner Assistant  
> **Version:** 1.0  
> **Date:** December 7, 2025

---

## 📋 Use Cases Overview

| Use Case ID | Use Case Name | Actor | Priority |
|-------------|---------------|-------|----------|
| UC-001 | Generate Study Plan | Student | High |
| UC-002 | Export Study Plan to PDF | Student | Medium |
| UC-003 | Modify and Regenerate Plan | Student | High |

---

## 🎯 Use Case 1: Generate Study Plan

### Basic Information
- **Use Case ID:** UC-001
- **Use Case Name:** Generate Study Plan
- **Actor:** Student
- **Priority:** High
- **Status:** Implemented

### Description
Student creates a new personalized study plan by providing their available time and topics to study.

### Trigger
Student clicks the "🚀 Generate Study Plan" button after filling in all required inputs.

### Preconditions
1. Application is running and accessible
2. Student is on the main planner page
3. Student has at least one day with available hours entered
4. Student has added at least one topic with difficulty level

### Main Flow

| Step | Actor | Action |
|------|-------|--------|
| 1 | Student | Opens the Aura Planner application |
| 2 | Student | Enters study duration (number of days) |
| 3 | Student | Inputs available hours for each day |
| 4 | Student | Adds topic name (e.g., "Data Structures") |
| 5 | Student | Optionally adds subtopics with percentage allocation |
| 6 | Student | Sets difficulty level (1-5) using slider |
| 7 | Student | Repeats steps 4-6 for additional topics |
| 8 | Student | Clicks "🚀 Generate Study Plan" button |
| 9 | System | Validates all inputs |
| 10 | System | Calculates total available hours |
| 11 | System | Allocates hours based on difficulty weights |
| 12 | System | Separates last day for revision (if >1 day) |
| 13 | System | Distributes topics across learning days |
| 14 | System | Schedules revision sessions on last day |
| 15 | System | Displays generated plan with daily schedule |
| 16 | Student | Reviews the generated study plan |

### Postconditions
- Study plan is successfully generated and displayed
- Daily schedule shows all learning sessions
- Last day shows revision sessions
- Progress bars display time-based completion
- Topics overview shows allocation per topic
- Coverage percentage is displayed

### Alternate Flow 1: Insufficient Time for All Topics

| Step | Actor | Action |
|------|-------|--------|
| 8a.1 | System | Detects total required hours > available hours |
| 8a.2 | System | Generates plan with maximum possible coverage |
| 8a.3 | System | Displays warning messages: |
|      |        | - "⚠️ Time constraint: XX% of syllabus covered" |
|      |        | - "⏰ Additional Xh needed to complete all topics" |
|      |        | - "📚 Topics with limited coverage: [names]" |
| 8a.4 | System | Prioritizes higher difficulty topics |
| 8a.5 | Student | Reviews warnings and decides to: |
|      |        | Option A: Accept partial coverage |
|      |        | Option B: Add more days/hours and regenerate |
| 8a.6 | Flow | Returns to step 16 (Option A) or step 2 (Option B) |

### Alternate Flow 2: Single Day Schedule

| Step | Actor | Action |
|------|-------|--------|
| 10b.1 | System | Detects duration = 1 day |
| 10b.2 | System | Skips revision day separation |
| 10b.3 | System | Allocates all hours for learning only |
| 10b.4 | System | Displays warning: "Last day reserved for revision, but no revision scheduled" |
| 10b.5 | Flow | Continues to step 15 |

### Alternate Flow 3: Invalid Input

| Step | Actor | Action |
|------|-------|--------|
| 9c.1 | System | Detects missing or invalid data |
| 9c.2 | System | Displays error message (e.g., "Please add at least one topic") |
| 9c.3 | Student | Corrects the input |
| 9c.4 | Flow | Returns to step 8 |

### Business Rules
1. Minimum session duration: 0.25 hours (15 minutes)
2. Difficulty weights: 1→1.0, 2→1.2, 3→1.4, 4→1.7, 5→2.0
3. Last day reserved for revision (if total days > 1)
4. Topics without subtopics normalized to single "main" subtopic at 100%
5. Subtopic percentages must sum to 100%
6. Progress calculated as: (time consumed / total allocated) × 100%

---

## 📄 Use Case 2: Export Study Plan to PDF

### Basic Information
- **Use Case ID:** UC-002
- **Use Case Name:** Export Study Plan to PDF
- **Actor:** Student
- **Priority:** Medium
- **Status:** Implemented

### Description
Student exports the generated study plan to a professional PDF format for offline viewing, printing, or sharing.

### Trigger
Student clicks the "📄 Export PDF" button after plan is generated.

### Preconditions
1. A valid study plan has been generated
2. Plan is currently displayed on screen
3. Browser supports print functionality

### Main Flow

| Step | Actor | Action |
|------|-------|--------|
| 1 | Student | Reviews generated study plan |
| 2 | Student | Clicks "📄 Export PDF" button |
| 3 | System | Generates HTML document with formatted tables |
| 4 | System | Includes: |
|   |        | - Plan summary (total hours, days, coverage) |
|   |        | - Topics overview table |
|   |        | - Daily schedule tables for all days |
|   |        | - Warning boxes (if applicable) |
| 5 | System | Opens print preview in new window |
| 6 | System | Applies professional CSS styling |
| 7 | Student | Reviews print preview |
| 8 | Student | Selects "Save as PDF" from print dialog |
| 9 | Student | Chooses save location and filename |
| 10 | System | Generates PDF file |
| 11 | System | Saves file to selected location |
| 12 | Student | Confirms successful save |

### Postconditions
- PDF file is created and saved to disk
- PDF contains all plan information in readable format
- PDF maintains proper formatting and styling
- Student can open, print, or share the PDF

### Alternate Flow 1: Print Instead of PDF

| Step | Actor | Action |
|------|-------|--------|
| 8a.1 | Student | Selects "Print" instead of "Save as PDF" |
| 8a.2 | System | Sends document to selected printer |
| 8a.3 | Student | Receives printed study plan |

### Alternate Flow 2: No Plan Generated

| Step | Actor | Action |
|------|-------|--------|
| 2b.1 | System | Detects no plan exists |
| 2b.2 | System | Displays alert: "No plan to export" |
| 2b.3 | System | Export button remains disabled |
| 2b.4 | Student | Must generate plan first |

### Business Rules
1. Export only available after plan generation
2. PDF includes all days, not just learning days
3. Revision sessions clearly marked with purple badge
4. Learning sessions marked with blue badge
5. Professional styling with tables and color coding

---

## 🔄 Use Case 3: Modify and Regenerate Plan

### Basic Information
- **Use Case ID:** UC-003
- **Use Case Name:** Modify and Regenerate Plan
- **Actor:** Student
- **Priority:** High
- **Status:** Implemented

### Description
Student modifies existing inputs (time availability, topics, difficulty) and regenerates a new study plan.

### Trigger
Student realizes they need to adjust their schedule or topic priorities after seeing the initial plan.

### Preconditions
1. An initial study plan has been generated
2. Plan is currently displayed
3. Input form is still accessible

### Main Flow

| Step | Actor | Action |
|------|-------|--------|
| 1 | Student | Reviews current generated plan |
| 2 | Student | Identifies areas needing adjustment |
| 3 | Student | Scrolls to input section (form remains visible) |
| 4 | Student | Modifies one or more of: |
|   |        | - Duration (days) |
|   |        | - Daily available hours |
|   |        | - Topic names |
|   |        | - Subtopics and percentages |
|   |        | - Difficulty levels |
| 5 | Student | Adds new topics using "+ Add Topic" button (optional) |
| 6 | Student | Removes unwanted topics using "Remove" button (optional) |
| 7 | Student | Adds/removes subtopics (optional) |
| 8 | Student | Clicks "🚀 Generate Study Plan" button again |
| 9 | System | Validates updated inputs |
| 10 | System | Clears previous plan from display |
| 11 | System | Recalculates with new parameters |
| 12 | System | Generates and displays new plan |
| 13 | Student | Compares new plan with remembered previous version |
| 14 | Student | Decides to: |
|    |        | Option A: Accept new plan and export |
|    |        | Option B: Modify again and regenerate |

### Postconditions
- New study plan replaces the old plan
- New plan reflects all modified inputs
- All calculations are based on updated data
- Previous plan is not saved (unless exported)

### Alternate Flow 1: Increase Available Time

| Step | Actor | Action |
|------|-------|--------|
| 4a.1 | Student | Sees warning about insufficient time |
| 4a.2 | Student | Increases daily hours or adds more days |
| 4a.3 | Student | Regenerates plan |
| 4a.4 | System | Shows improved coverage percentage |
| 4a.5 | System | Warnings disappear or reduce |

### Alternate Flow 2: Adjust Topic Difficulty

| Step | Actor | Action |
|------|-------|--------|
| 4b.1 | Student | Realizes a topic is harder than initially thought |
| 4b.2 | Student | Increases difficulty slider for that topic |
| 4b.3 | Student | Regenerates plan |
| 4b.4 | System | Allocates more time to that topic |
| 4b.5 | System | Redistributes time from easier topics |

### Alternate Flow 3: Add/Remove Topics

| Step | Actor | Action |
|------|-------|--------|
| 5c.1 | Student | Decides to add a forgotten topic |
| 5c.2 | Student | Clicks "+ Add Topic" button |
| 5c.3 | System | Adds new topic input fields |
| 5c.4 | Student | Fills in topic details |
| 5c.5 | Student | OR removes existing topic via "Remove" button |
| 5c.6 | Student | Regenerates plan |
| 5c.7 | System | Recalculates with updated topic list |

### Business Rules
1. Each regeneration completely replaces previous plan
2. No history of previous plans is maintained
3. All inputs remain editable after plan generation
4. Student can regenerate unlimited times
5. Form validation occurs on each generation attempt

---

## 🎨 High-Level System Design

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                    (React Frontend - Port 5174)              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ PlannerPage   │  │  TopicForm   │  │   PlanView      │  │
│  │ - Main Layout │  │  - Input UI  │  │   - Display     │  │
│  │ - State Mgmt  │  │  - Sliders   │  │   - Dropdowns   │  │
│  └───────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│          │                  │                    │           │
│          └──────────────────┴────────────────────┘           │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │  ExportButton   │                       │
│                    │  - PDF Export   │                       │
│                    └─────────────────┘                       │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                     HTTP POST /api/plan
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       SERVER LAYER                           │
│                (Node.js + Express - Port 5000)               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              routes/planner.js                       │    │
│  │         - POST /api/plan endpoint                    │    │
│  │         - Request validation                         │    │
│  └─────────────────┬───────────────────────────────────┘    │
│                    │                                          │
│         ┌──────────▼──────────┐                              │
│         │   scheduler.js      │                              │
│         │   (Core Algorithm)  │                              │
│         └─────────────────────┘                              │
│                    │                                          │
│   ┌────────────────┼─────────────────┐                       │
│   │                │                 │                       │
│   ▼                ▼                 ▼                       │
│ ┌──────┐  ┌──────────────┐  ┌──────────────┐               │
│ │Topic │  │   Session     │  │  Revision    │               │
│ │Dist- │  │   Scheduler   │  │  Planner     │               │
│ │rib.  │  │   - Dynamic   │  │  - Last Day  │               │
│ └──────┘  └──────────────┘  └──────────────┘               │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    JSON Response
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    RESPONSE STRUCTURE                        │
├─────────────────────────────────────────────────────────────┤
│  {                                                            │
│    meta: { days, hours, coverage, ... },                     │
│    topicsSummary: [ { name, difficulty, hours, ... } ],      │
│    dailyPlan: [ { day, sessions: [...] } ],                  │
│    warnings: [ "⚠️ Time constraint...", ... ]                │
│  }                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### Plan Generation Flow

```
┌─────────┐
│ Student │
└────┬────┘
     │
     │ 1. Fill Form
     │    - Days: 7
     │    - Availability: [4h, 4h, 4h, 4h, 4h, 4h, 3h]
     │    - Topics: [DataStructures(4), Algorithms(5), Database(3)]
     ▼
┌─────────────────┐
│  Input Collect  │
│  (TopicForm)    │
└────┬────────────┘
     │
     │ 2. Submit Data (POST /api/plan)
     │    { durationDays: 7, availability: [...], topics: [...] }
     ▼
┌──────────────────────────────────────────────┐
│         Backend Processing                    │
│  (scheduler.js - generatePlan)               │
├──────────────────────────────────────────────┤
│                                               │
│  Step 1: Validate Input                      │
│    ✓ Check days > 0                          │
│    ✓ Check topics.length > 0                 │
│    ✓ Validate difficulty range (1-5)         │
│                                               │
│  Step 2: Calculate Total Hours               │
│    Total: 27h                                │
│    Learning Days: 6 (24h)                    │
│    Revision Day: 1 (3h)                      │
│                                               │
│  Step 3: Distribute by Difficulty            │
│    Weights: DS=1.7, Algo=2.0, DB=1.4         │
│    Allocated: DS=8h, Algo=10h, DB=6h         │
│                                               │
│  Step 4: Create Task Queue                   │
│    Tasks: [                                  │
│      {topic: Algorithms, subtopic: Sorting}, │
│      {topic: DataStructures, subtopic: ...}, │
│      ...                                     │
│    ]                                         │
│                                               │
│  Step 5: Schedule Learning (Days 1-6)        │
│    Day 1: Algo(2h), DS(2h)                   │
│    Day 2: Algo(2h), DS(2h)                   │
│    ...                                       │
│                                               │
│  Step 6: Calculate Coverage                  │
│    Coverage: 100%                            │
│                                               │
│  Step 7: Schedule Revision (Day 7)           │
│    Tasks with progress > 0 get revision      │
│    Day 7: Algo(1h), DS(1h), DB(1h)           │
│                                               │
└────┬─────────────────────────────────────────┘
     │
     │ 3. Return JSON Response
     ▼
┌─────────────────┐
│   PlanView      │
│   - Display     │
│   - Progress    │
│   - Warnings    │
└────┬────────────┘
     │
     │ 4. Render UI
     ▼
┌─────────┐
│ Student │
│ Reviews │
│  Plan   │
└─────────┘
```

---

## 🔄 State Transitions

```
┌──────────────┐
│  Initial     │  Student opens app
│  State       │
└──────┬───────┘
       │
       │ Add topics & hours
       ▼
┌──────────────┐
│  Form Filled │  All required fields complete
│  State       │
└──────┬───────┘
       │
       │ Click Generate
       ▼
┌──────────────┐
│  Loading     │  API call in progress
│  State       │
└──────┬───────┘
       │
       │ Response received
       ▼
┌──────────────┐
│  Plan        │  Plan displayed
│  Generated   │
└──────┬───────┘
       │
       ├──────► Modify inputs ──► Form Filled State
       │
       └──────► Click Export ──► PDF Generated
```

---

## 🎯 Key Components

### 1. **Frontend Components**
- `PlannerPage.jsx` - Main container, state management
- `TopicForm.jsx` - User input form with dynamic topics
- `PlanView.jsx` - Plan display with expand/collapse
- `DayDropdown.jsx` - Individual day schedule display
- `ProgressBar.jsx` - Visual progress indicators
- `ExportButton.jsx` - PDF export functionality

### 2. **Backend Components**
- `server.js` - Express server setup
- `routes/planner.js` - API endpoints
- `scheduler.js` - Core algorithm
  - `distributeHoursAcrossTopics()` - Difficulty-based allocation
  - `createTaskQueue()` - Task normalization
  - `assignSessions()` - Session scheduling
  - `calculateRevisionSlots()` - Revision calculation
  - `generatePlan()` - Main orchestrator

### 3. **Data Models**

**Input Model:**
```javascript
{
  durationDays: Number,
  availability: [{ day: Number, hours: Number }],
  topics: [{
    name: String,
    difficulty: Number (1-5),
    subtopics: [{ name: String, percentage: Number }]
  }]
}
```

**Output Model:**
```javascript
{
  meta: {
    totalDays, learningDays, revisionDays,
    totalAvailableHours, coveragePercent, ...
  },
  topicsSummary: [{ name, difficulty, hours, progress }],
  dailyPlan: [{ day, sessions: [{ duration, topic, subtopic, type }] }],
  warnings: [String]
}
```

---

## 📋 Use Case Summary

The three primary use cases cover:

1. **UC-001: Generate Study Plan** - Core functionality for creating personalized schedules
2. **UC-002: Export Study Plan to PDF** - Sharing and offline access
3. **UC-003: Modify and Regenerate Plan** - Iterative refinement and flexibility

These use cases represent **100% of the user-facing functionality** in the MVP, ensuring students can plan, export, and adjust their study schedules effectively.

---

*Document Version: 1.0*  
*Last Updated: December 7, 2025*  
*Status: ✅ Complete*
