# 🎓 VIVA Preparation Guide - Aura Study Planner

> **Student:** Arhum19  
> **Project:** Study Planner Assistant  
> **Exam:** Mid-Term Viva  
> **Focus:** Logic & Functionality Questions

---

## 📑 Quick Navigation

1. [Project Overview](#-project-overview)
2. [Architecture & Data Flow](#-architecture--data-flow)
3. [Core Algorithm - The Brain](#-core-algorithm---the-brain)
4. [Key Functions Explained](#-key-functions-explained)
5. [Frontend Logic](#-frontend-logic)
6. [Common Viva Questions](#-common-viva-questions)
7. [Edge Cases & How They're Handled](#-edge-cases--how-theyre-handled)
8. [Quick Revision Cheatsheet](#-quick-revision-cheatsheet)

---

## 🎯 Project Overview

### What is this project?

A **Study Planner Application** that automatically generates personalized study schedules based on:

- Available study days and daily hours
- Topics to cover with their difficulties
- Optional subtopics with percentage distribution

### The Core Problem It Solves

| Problem                         | Solution                                        |
| ------------------------------- | ----------------------------------------------- |
| Students don't know how to plan | Algorithm automatically creates realistic plan  |
| No time allocation guidance     | Difficulty-weighted time distribution           |
| Forget to revise                | Last day automatically reserved for revision    |
| Unrealistic expectations        | Progress based on time consumed, not completion |

### Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  React 18 + Vite + Tailwind CSS                        │
│  Port: 5174                                            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST (JSON)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                            │
│  Node.js + Express.js + CORS                           │
│  Port: 5000                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture & Data Flow

### Complete Request-Response Flow

```
User Input                API Call                 Scheduler              Response
    │                        │                         │                      │
    │  1. Set Duration       │                         │                      │
    │  2. Set Availability   │                         │                      │
    │  3. Add Topics         │                         │                      │
    │  4. Click Generate     │                         │                      │
    │                        │                         │                      │
    └───────────────────────►│                         │                      │
                             │  POST /api/generate-plan│                      │
                             │  {                      │                      │
                             │    durationDays: 7,     │                      │
                             │    availability: [...], │                      │
                             │    topics: [...],       │                      │
                             │    sessionLength: 1.5   │                      │
                             │  }                      │                      │
                             └────────────────────────►│                      │
                                                       │  generatePlan()      │
                                                       │  - distribute hours  │
                                                       │  - create tasks      │
                                                       │  - assign sessions   │
                                                       │  - schedule revision │
                                                       │                      │
                                                       └─────────────────────►│
                                                                              │
                                                       { meta, dailyPlan,     │
                                                         topicsSummary,       │
                                                         warnings }           │
                             ◄────────────────────────────────────────────────┘
    ◄────────────────────────┘
    │
    │  Display PlanView Component
    │  - Show daily schedule
    │  - Show progress bars
    │  - Show warnings
    ▼
```

### File Structure & Purpose

```
AuraPlanner/
├── src/                          # FRONTEND
│   ├── pages/
│   │   └── PlannerPage.jsx      # Main page, orchestrates all components
│   ├── components/
│   │   ├── AvailabilityForm.jsx # Input: days, hours, session length
│   │   ├── TopicForm.jsx        # Input: topics, difficulty, subtopics
│   │   ├── PlanView.jsx         # Output: displays generated plan
│   │   ├── DayDropdown.jsx      # Output: collapsible day view
│   │   └── ExportButton.jsx     # Export: PDF generation
│   └── api/
│       └── apiClient.js         # HTTP client for backend calls
│
└── backend/                      # BACKEND
    └── src/
        ├── server.js            # Express server setup
        ├── routes/
        │   └── planRoutes.js    # API endpoints
        └── scheduler.js         # ⭐ CORE ALGORITHM (most important!)
```

---

## 🧠 Core Algorithm - The Brain

### The `scheduler.js` - Step by Step

This is the **MOST IMPORTANT** file. Here's exactly how it works:

### STEP 1: Difficulty Weight System

```javascript
const DIFFICULTY_WEIGHTS = {
  1: 1.0, // Easy topic - normal time
  2: 1.2, // Slightly harder - 20% more time
  3: 1.4, // Medium - 40% more time
  4: 1.7, // Hard - 70% more time
  5: 2.0, // Very hard - DOUBLE the time
};
```

**🎤 Viva Answer:**

> "Harder topics get more study time proportionally. A difficulty-5 topic gets TWICE as much time as a difficulty-1 topic because difficult concepts need more practice."

### STEP 2: The Main Logic Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    generatePlan(input)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SEPARATE DAYS                                               │
│     ├── Learning Days = All days EXCEPT last                   │
│     └── Revision Day = ONLY the last day                       │
│                                                                 │
│  2. DISTRIBUTE HOURS (to topics based on difficulty)           │
│     └── More difficult = More hours                            │
│                                                                 │
│  3. CREATE TASK QUEUE                                           │
│     └── Break topics into subtopics (tasks)                    │
│     └── Sort by difficulty (hardest first)                     │
│                                                                 │
│  4. ASSIGN SESSIONS TO LEARNING DAYS                           │
│     └── Dynamic session sizing                                 │
│     └── Fill each day until hours exhausted                    │
│                                                                 │
│  5. SCHEDULE REVISION ON LAST DAY                              │
│     └── Only topics that were actually studied                 │
│     └── Difficulty 4-5 = 2 revision slots                      │
│     └── Difficulty 2-3 = 1 revision slot                       │
│                                                                 │
│  6. CALCULATE COVERAGE & WARNINGS                              │
│     └── Coverage = (allocated / required) × 100%               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Key Functions Explained

### 1. `distributeHoursAcrossTopics(topics, totalAvailableHours)`

**Purpose:** Allocate study hours to each topic based on difficulty

**Logic:**

```
For each topic:
  1. Get its weight from DIFFICULTY_WEIGHTS
  2. Calculate proportional share = (topic weight / total weight) × total hours
  3. Ensure minimum hours (difficulty × 0.75)
  4. Assign the maximum of: proportional, estimated, minimum
```

**Example:**

```
Input:
  - Topics: [Sorting (diff=3), Searching (diff=5)]
  - Total Hours: 10h

Calculation:
  - Sorting weight = 1.4
  - Searching weight = 2.0
  - Total weight = 3.4

  - Sorting gets: (1.4/3.4) × 10 = 4.1 hours
  - Searching gets: (2.0/3.4) × 10 = 5.9 hours
```

**🎤 Viva Answer:**

> "I distribute hours proportionally based on difficulty weights. A topic with difficulty 5 has weight 2.0, while difficulty 1 has weight 1.0. I divide total hours based on each topic's share of total weight."

---

### 2. `createTaskQueue(topics)`

**Purpose:** Break topics into smaller tasks (subtopics) and sort them

**Logic:**

```
For each topic:
  IF has subtopics:
    - Normalize percentages to sum to 100%
    - Create task for each subtopic
    - Each task gets proportional hours
  ELSE:
    - Create single task with 100% of topic hours

Sort all tasks by difficulty (DESCENDING - hardest first)
```

**Example:**

```
Input: Topic "Sorting" (3 hours) with subtopics:
  - Bubble Sort: 30%
  - Quick Sort: 70%

Output Tasks:
  - { topic: "Sorting", subtopic: "Bubble Sort", totalHours: 0.9 }
  - { topic: "Sorting", subtopic: "Quick Sort", totalHours: 2.1 }
```

**🎤 Viva Answer:**

> "I break down each topic into subtopics as individual tasks. If a topic has subtopics with percentages, each subtopic gets its proportional share of hours. If no subtopics exist, the whole topic becomes one task."

---

### 3. `assignSessions(tasks, availability, sessionLength)`

**Purpose:** Fit tasks into daily time slots

**Logic:**

```
For each day in availability:
  While (day has remaining time AND tasks remain):
    1. Re-sort tasks (most remaining hours first)
    2. Pick top unfinished task
    3. Calculate session chunk:
       - Minimum: 0.25h (15 minutes)
       - Maximum: sessionLength (user's preference)
       - Actual: min(remaining task, remaining day, sessionLength)
    4. Reduce task's remaining hours
    5. Update progress percentage
    6. Add session to day's schedule
```

**Key Formula for Progress:**

```javascript
progressPercent = ((totalHours - remainingHours) / totalHours) × 100
```

**🎤 Viva Answer:**

> "I iterate through each day and greedily assign sessions. I pick the task with the most remaining hours, calculate how much time to allocate (respecting session length limits), update the task's progress, and continue until the day is full or all tasks are done."

---

### 4. `calculateRevisionSlots(tasks)`

**Purpose:** Determine revision needs based on difficulty

**Logic:**

```
For each completed task:
  IF difficulty >= 4: Create 2 revision slots
  ELSE IF difficulty >= 2: Create 1 revision slot
  ELSE: No revision needed

Revision duration = min(1.5 hours, 30% of original time)
```

**🎤 Viva Answer:**

> "Harder topics need more revision. Difficulty 4-5 topics get 2 revision slots, difficulty 2-3 get 1 slot. Each revision slot is 30% of original study time, capped at 1.5 hours to avoid too-long sessions."

---

### 5. The Simple Last-Day Revision Rule

```javascript
// STEP 1: Separate days
const learningDays = totalDays > 1 ? avail.slice(0, -1) : avail;
const revisionDay = totalDays > 1 ? avail[avail.length - 1] : null;
```

**🎤 Viva Answer:**

> "My simple rule is: the LAST day is ONLY for revision, all other days are ONLY for learning. This ensures students always have dedicated revision time and only revise topics they've actually studied."

---

## 💻 Frontend Logic

### PlannerPage.jsx - The Orchestrator

**State Management:**

```javascript
const [availability, setAvailability] = useState(null); // Duration & hours
const [topics, setTopics] = useState([]); // User's topics
const [plan, setPlan] = useState(null); // Generated plan
const [loading, setLoading] = useState(false); // Loading state
const [error, setError] = useState(null); // Error messages
```

**Flow:**

1. User fills `AvailabilityForm` → updates `availability` state
2. User fills `TopicForm` → updates `topics` state
3. User clicks "Generate Plan" → `handleGeneratePlan()` called
4. Frontend sends POST request to backend
5. Backend returns plan → stored in `plan` state
6. `PlanView` component renders the plan

### AvailabilityForm.jsx - Input Handler

**Key Logic:**

```javascript
// Convert weeks to days
const days = type === "weeks" ? value * 7 : value;

// Generate default availability (3 hours each day)
const newAvailability = Array.from({ length: days }, (_, i) => ({
  day: i + 1,
  hours: 3,
}));
```

### DayDropdown.jsx - Progress Display

**Progress Bar Calculation:**

```javascript
// Progress bar fills based on percentage
<div style={{ width: `${safePercentage}%` }}>
  {safePercentage > 10 && `${safePercentage}%`}
</div>

// Color coding:
// Learning sessions = Green gradient
// Revision sessions = Purple gradient
```

---

## ❓ Common Viva Questions

### Q1: "How does your algorithm distribute time among topics?"

**Answer:**

> "I use a difficulty-weighted proportional distribution. Each difficulty level (1-5) has a weight multiplier:
>
> - Easy (1) = 1.0x
> - Hard (5) = 2.0x
>
> I sum all weights, then each topic gets its proportional share. For example, if Topic A has weight 1.5 and Topic B has weight 2.0, with 10 hours total:
>
> - Topic A gets (1.5/3.5) × 10 = 4.3 hours
> - Topic B gets (2.0/3.5) × 10 = 5.7 hours"

---

### Q2: "Why does the last day only have revision?"

**Answer:**

> "I implemented a simple, clear rule: last day = revision only. This ensures:
>
> 1. Students always have dedicated revision time
> 2. Only topics that were actually studied appear in revision
> 3. No confusion about whether a day is for learning or revision
> 4. Guaranteed revision slot unless the schedule is only 1 day"

---

### Q3: "How do you calculate progress percentage?"

**Answer:**

> "Progress is based on TIME CONSUMED, not task completion. The formula is:
>
> `Progress = (allocatedHours / totalHours) × 100%`
>
> This is more realistic because if a student only has 80% of the time needed, they'll see 80% coverage - not false 100% completion."

---

### Q4: "What happens if user doesn't have enough time?"

**Answer:**

> "The algorithm handles this gracefully:
>
> 1. It allocates all available time across topics proportionally
> 2. Calculates coverage percentage (e.g., 75% of syllabus covered)
> 3. Generates warnings like 'Additional 5h needed for full completion'
> 4. Shows which topics have limited coverage
> 5. Still produces a usable plan with the available time"

---

### Q5: "Explain the session assignment logic"

**Answer:**

> "I use a greedy algorithm with dynamic reprioritization:
>
> 1. For each day, I start with available hours
> 2. Sort tasks by remaining hours (most hours first)
> 3. Pick the top task
> 4. Calculate session duration:
>    - Minimum: 15 minutes (0.25h)
>    - Maximum: user's session length preference
>    - Actual: whatever fits in remaining day time
> 5. Reduce task's remaining hours
> 6. Add session to day's schedule
> 7. Repeat until day is full or all tasks complete
> 8. Move to next day"

---

### Q6: "How do subtopics work?"

**Answer:**

> "Subtopics divide a topic into smaller units with percentage weights:
>
> 1. User adds subtopics with custom percentages (e.g., Bubble Sort 30%, Quick Sort 70%)
> 2. I normalize these to sum to 100%
> 3. Each subtopic becomes a separate task
> 4. Hours are distributed proportionally
> 5. Example: 3-hour Sorting topic with 30/70 split → Bubble gets 0.9h, Quick gets 2.1h
>
> If no subtopics are added, the entire topic is treated as one task."

---

### Q7: "What is the flow of data from frontend to backend?"

**Answer:**

> "The flow is:
>
> 1. **Frontend collects input:** availability, topics, session length
> 2. **Frontend sends POST** to `/api/generate-plan` with JSON payload
> 3. **Backend validates** the request (checks required fields)
> 4. **Scheduler runs** `generatePlan()` function
> 5. **Algorithm executes:** distribute hours → create tasks → assign sessions → schedule revision
> 6. **Backend returns** plan as JSON response
> 7. **Frontend renders** the plan using React components"

---

### Q8: "How does the PDF export work?"

**Answer:**

> "I generate PDF using browser's native print functionality:
>
> 1. Create an HTML document with styled tables
> 2. Include all plan data (meta info, daily schedule, warnings)
> 3. Open a new browser window with this HTML
> 4. Trigger the browser's print dialog
> 5. User selects 'Save as PDF' from print options
>
> This approach requires no external libraries and produces clean, professional PDFs."

---

### Q9: "Why React + Node instead of just React?"

**Answer:**

> "I separated frontend and backend for:
>
> 1. **Separation of concerns:** UI logic vs business logic
> 2. **Scalability:** Backend can be extended with database, auth, etc.
> 3. **API design:** Clean RESTful endpoints for future mobile app
> 4. **Testing:** Backend logic can be unit tested independently
> 5. **Future-proofing:** Can add MongoDB, JWT auth, email services easily"

---

### Q10: "How do you handle edge cases?"

**Answer:**

> "I handle several edge cases:
>
> 1. **Single day schedule:** All topics compressed, no revision day
> 2. **Zero hours on a day:** That day is skipped, no sessions assigned
> 3. **Too many topics, little time:** Shows coverage percentage and warnings
> 4. **No subtopics:** Topic itself becomes a single task
> 5. **Very short sessions:** Minimum 15 minutes (0.25h) enforced
> 6. **Empty inputs:** Frontend validation prevents submission"

---

## 🚨 Edge Cases & How They're Handled

| Edge Case                        | What Happens                           | Where Handled                             |
| -------------------------------- | -------------------------------------- | ----------------------------------------- |
| **1 day only**                   | No revision day, all time for learning | `generatePlan()` - line 266-267           |
| **0 hours on a day**             | Day skipped, no sessions               | `assignSessions()` - while loop condition |
| **Difficulty not set**           | Defaults to weight 1.0                 | `distributeHoursAcrossTopics()`           |
| **No subtopics**                 | Topic becomes single 100% task         | `createTaskQueue()` - line 86-87          |
| **Percentages don't sum to 100** | Auto-normalized                        | `normalizeSubtopics()`                    |
| **Session too short**            | Minimum 0.25h enforced                 | `assignSessions()` - line 179-185         |
| **Not enough time**              | Shows coverage % and warnings          | `generatePlan()` - warnings section       |

---

## 📋 Quick Revision Cheatsheet

### The 5 Core Steps (Memorize This!)

```
1️⃣ SEPARATE DAYS
   └── Learning Days = All except last
   └── Revision Day = Only last day

2️⃣ DISTRIBUTE HOURS
   └── Weight formula: difficulty → [1.0, 1.2, 1.4, 1.7, 2.0]
   └── Proportional: (topic_weight / total_weight) × hours

3️⃣ CREATE TASK QUEUE
   └── Break into subtopics
   └── Sort by difficulty (hardest first)

4️⃣ ASSIGN SESSIONS
   └── Greedy algorithm
   └── Fill days until exhausted
   └── Min session: 0.25h

5️⃣ SCHEDULE REVISION
   └── Only studied topics
   └── Diff 4-5: 2 slots
   └── Diff 2-3: 1 slot
```

### Key Formulas

| Formula                                                   | Purpose                |
| --------------------------------------------------------- | ---------------------- |
| `progress = (allocated / total) × 100`                    | Track completion       |
| `coverage = (allocated / required) × 100`                 | Show syllabus coverage |
| `topic_hours = (weight / total_weight) × available_hours` | Distribute time        |
| `revision_duration = min(1.5, original × 0.3)`            | Cap revision sessions  |

### Key Numbers

| Value   | Meaning                                |
| ------- | -------------------------------------- |
| `0.25h` | Minimum session length (15 min)        |
| `1.5h`  | Default session length                 |
| `30%`   | Revision time as % of study time       |
| `2.0`   | Maximum difficulty weight (for diff=5) |

---

## 🎯 Final Tips for Viva

1. **Start with the big picture:** "My app takes student availability and topics, then generates a difficulty-weighted study schedule with dedicated revision time."

2. **Explain the simple rule:** "Last day is revision only, all other days are learning only."

3. **Mention the formula:** "Harder topics get proportionally more time based on difficulty weights from 1.0 to 2.0."

4. **Show you understand limitations:** "Progress is based on time consumed, not actual learning, because the system can't measure understanding."

5. **Be ready for code:** Know where each function is and what it does.

---

**Good luck with your viva! 🚀**

_Document created: December 13, 2025_
