# 📚 Aura Planner - Problem Statement

## 🎯 Overview

Students often struggle with creating effective study plans that match their available time, academic load, and exam timelines. Most existing planners are either too generic or demand more effort to set up than the studying itself. As a result, students end up making unrealistic timetables, skipping important topics, or getting confused about where to even start. When deadlines get close, they panic, waste time deciding what to study, and lose consistency because the plan doesn't adapt to their actual schedule.

**The Gap:** There is a clear need for a simple, personalized planning tool that instantly turns a student's availability and topics into a realistic, structured schedule—without requiring expert-level planning skills. The solution must help students manage their time smartly, reduce stress, and stay consistent, especially when they are working with tight or uneven time slots.

---

## 😣 Pain Points

- ❌ Students struggle to create realistic study plans
- ❌ No proper guideline on how to divide topics or prioritize difficult ones
- ❌ Last-minute panic leads to random, unproductive studying
- ❌ Students can't track what to study each hour or day
- ❌ Individual schedules differ (classes, part-time jobs, commute), making generic plans useless
- ❌ Students don't know which topics deserve more time or revision

---

## 💡 Why It Matters

- ✅ **Reduces stress** and decision fatigue by giving clear structure
- ✅ **Maximizes efficiency** - helps students use their limited time effectively
- ✅ **Increases consistency** and improves study outcomes
- ✅ **Personalized guidance** without needing tutors or paid apps
- ✅ Works like a minimal **"study coach"** that guides the student during exam prep

---

## 🎯 MVP Goal

1. Generate a **realistic study plan instantly** based on user availability and topics
2. Support various timelines: **hourly, daily, and weekly planning**
3. Provide simple, **structured breakdowns** (what to study, when, and for how long)
4. Include **balanced sessions** with appropriate revision time
5. **Reduce planning effort** so students can focus on studying

---

## ✅ In-Scope Features

| Feature                  | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| 📝 **Input Management**  | Accept student inputs: subjects/topics, difficulty, available time |
| 📅 **Plan Generation**   | Generate structured plans (hourly / daily / weekly)                |
| 🔢 **Session Breakdown** | Provide session-by-session breakdowns                              |
| 🔄 **Flexibility**       | Allow simple regeneration when inputs change                       |
| 📄 **Export**            | Display the plan in list/table format or export as PDF             |

---

## ❌ Out of Scope

- 📖 Teaching content, explanations, notes, or concept help
- ⚠️ Making "impossible" schedules realistic (e.g., 1 hour for 4 major subjects)
- 📊 Advanced analytics, productivity tracking, or reminders
- 📅 Calendar integration or notifications
- 👥 Multi-user or collaborative planning
- 🤖 AI tutoring, solving questions, or generating study material

---

## 📌 Key Assumptions

1. ✓ The student can correctly enter their available hours and topics
2. ✓ Each topic has a predictable difficulty level and estimated study time
3. ✓ The user will follow the generated plan as closely as possible
4. ✓ The system doesn't need to validate academic content—it only schedules it
5. ✓ The student has at least some usable time per day to allocate
6. ✓ The planner is used for short to medium study timelines (hours to weeks)
7. ✓ Output format (list/table/PDF) is sufficient for the MVP—no full calendar UI required

---

## 🚀 Current Implementation

**Aura Planner** successfully addresses these pain points by:

- 🎨 **Clean, intuitive UI** with dark mode support
- ⚡ **Instant plan generation** based on difficulty-weighted algorithm
- 📊 **Visual progress tracking** with color-coded sessions
- 📅 **Smart scheduling** - learning days + dedicated revision day
- 📄 **Professional PDF export** with formatted tables
- 🎯 **Realistic time allocation** that respects user constraints

The MVP is now complete and ready to help students study smarter, not harder! 🎓

