/**
 * StudyPlanr Scheduler (updated)
 * - Adds minimum/estimated hours per topic
 * - Adaptive session chunk sizing when availability is tight
 * - Dynamic reprioritization while scheduling
 * - Reserve revision days only when coverage is achievable
 */

// Difficulty to weight mapping (unchanged)
const DIFFICULTY_WEIGHTS = {
  1: 1.0,
  2: 1.2,
  3: 1.4,
  4: 1.7,
  5: 2.0,
};

/**
 * Normalize subtopic percentages to sum to 100
 */
function normalizeSubtopics(subtopics) {
  if (!subtopics || subtopics.length === 0) return null;

  const total = subtopics.reduce((sum, st) => sum + (st.percentage || 0), 0);

  if (total === 0) return subtopics;

  return subtopics.map((st) => ({
    ...st,
    percentage: (st.percentage / total) * 100,
  }));
}

/**
 * Calculate total available hours from availability array
 */
function calculateTotalHours(availability) {
  return availability.reduce((sum, day) => sum + (day.hours || 0), 0);
}

/**
 * Calculate hours required for each topic based on difficulty weight
 *
 * Changes:
 * - Supports optional topic.estimatedHours (explicit estimate from user)
 * - Ensures a sensible minimum hours per topic based on difficulty
 * - Allocated hours = max(proportionalAllocation, estimatedHoursIfProvided, minHours)
 */
function distributeHoursAcrossTopics(topics, totalAvailableHours) {
  // Defensive copy
  const topicsCopy = topics.map((t) => ({ ...t }));

  // Calculate total weight (use difficulty weight and estimatedHours presence)
  const totalWeight = topicsCopy.reduce((sum, topic) => {
    const w = DIFFICULTY_WEIGHTS[topic.difficulty] || 1.0;
    return sum + w;
  }, 0);

  // sum of explicit estimated hours (optional)
  const totalEstimatedHours = topicsCopy.reduce((sum, topic) => {
    return sum + (topic.estimatedHours || 0);
  }, 0);

  // If the user provided explicit estimated hours that exceed totalAvailableHours,
  // proportional allocation should still try to respect estimates but we'll normalize later.
  return topicsCopy.map((topic) => {
    const weight = DIFFICULTY_WEIGHTS[topic.difficulty] || 1.0;
    // proportional allocation by weight
    const proportional =
      totalWeight > 0
        ? (weight / totalWeight) * totalAvailableHours
        : totalAvailableHours / Math.max(1, topicsCopy.length);

    // Minimum hours heuristic (ensure each topic gets some meaningful time)
    // Example: difficulty * 0.75 hours (tunable). This gives diff=5 => 3.75h minimum.
    const minHours = Math.max(0.5, topic.difficulty * 0.75);

    // If user provided estimatedHours, use it as a lower bound (or higher if it is).
    const estimated = topic.estimatedHours
      ? Math.max(0, topic.estimatedHours)
      : 0;

    // Final allocated hours is the max of the three: proportional, estimated, minHours
    const allocatedHours = Math.max(proportional, estimated, minHours);

    return {
      ...topic,
      allocatedHours,
      weight,
    };
  });
}

/**
 * Create task queue with subtopics
 * (unchanged except for minor defensive checks)
 */
function createTaskQueue(topics) {
  const tasks = [];

  topics.forEach((topic) => {
    let subtopics = topic.subtopics;

    // If no subtopics, create a default one with 100%
    if (!subtopics || subtopics.length === 0) {
      subtopics = [{ name: topic.name, percentage: 100 }];
    } else {
      subtopics = normalizeSubtopics(subtopics);
    }

    // Create tasks for each subtopic
    subtopics.forEach((subtopic) => {
      const subtopicHours =
        (subtopic.percentage / 100) * (topic.allocatedHours || 0);
      tasks.push({
        topic: topic.name,
        subtopic: subtopic.name,
        difficulty: topic.difficulty,
        totalHours: subtopicHours,
        remainingHours: subtopicHours,
        progressPercent: 0,
      });
    });
  });

  // Sort by difficulty (descending) as an initial ordering
  return tasks.sort((a, b) => b.difficulty - a.difficulty);
}

/**
 * Assign sessions to days
 *
 * Changes:
 * - Uses dynamic reprioritization: re-sorts available tasks each allocation loop
 * - Uses adaptive session chunk sizing when many tasks or low availability
 * - Avoids reserving revision days here; revision reservation decision is handled in generatePlan()
 *
 * Returns {dailyPlan, taskStates, allocatedHours}
 */
function assignSessions(tasks, availability, sessionLength) {
  // tasks: array of task objects with remainingHours
  // availability: array [{day, hours}]
  const dailyPlan = [];
  // Use deep clone of tasks as mutable states
  const taskStates = tasks.map((t) => ({ ...t }));

  // Helper: count incomplete tasks
  const countIncompleteTasks = () =>
    taskStates.filter((t) => t.remainingHours > 0.001).length;

  // Total remaining hours across all tasks (updated dynamically)
  const getTotalRemainingHours = () =>
    taskStates.reduce((s, t) => s + Math.max(0, t.remainingHours), 0);

  // iterate through all days (learning days only; revision will be scheduled later)
  availability.forEach((dayAvail) => {
    const day = {
      day: dayAvail.day,
      availabilityHours: dayAvail.hours,
      sessions: [],
    };

    let remainingHours = dayAvail.hours;

    // While there's time and unfinished tasks
    while (remainingHours >= 0.25 && getTotalRemainingHours() > 0.001) {
      // Reprioritize tasks each loop: sort by remainingHours desc, then difficulty desc
      taskStates.sort((a, b) => {
        const remDiff = b.remainingHours - a.remainingHours;
        if (Math.abs(remDiff) > 1e-6) return remDiff;
        return b.difficulty - a.difficulty;
      });

      // pick the top unfinished task
      const task = taskStates.find((t) => t.remainingHours > 0.001);
      if (!task) break;

      // Estimate dynamic session chunk:
      // - targetChunk starts at sessionLength (user preference)
      // - but if many tasks remain or total remaining hours small, adapt down
      const tasksRemaining = Math.max(1, countIncompleteTasks());
      const totalRemaining = getTotalRemainingHours();

      // If user's sessionLength is large relative to remainingHours or tasks, reduce:
      // targetChunk heuristic: min(sessionLength, remainingHours, totalRemaining / tasksRemaining)
      // Ensure at least 0.25 hrs (15 min)
      let targetChunk = Math.min(
        sessionLength || 1.5,
        task.remainingHours,
        Math.max(0.25, totalRemaining / tasksRemaining)
      );

      // Another guard: do not request more than remainingHours of the day
      targetChunk = Math.min(targetChunk, remainingHours);

      // Ensure minimum workable chunk, but try to squeeze in small remainders
      if (targetChunk < 0.25) {
        // If task has very little left (< 0.25h) and we have some day time left, take it anyway
        if (
          task.remainingHours > 0 &&
          task.remainingHours < 0.25 &&
          remainingHours >= task.remainingHours
        ) {
          targetChunk = task.remainingHours; // Use what's left of the task
        } else if (remainingHours >= 0.25) {
          targetChunk = 0.25;
        } else {
          break;
        }
      }

      // Update task
      task.remainingHours = Math.max(
        0,
        parseFloat((task.remainingHours - targetChunk).toFixed(6))
      );
      task.progressPercent =
        task.totalHours > 0
          ? Math.round(
              ((task.totalHours - task.remainingHours) / task.totalHours) * 100
            )
          : 100;

      // push session
      day.sessions.push({
        duration: parseFloat(targetChunk.toFixed(2)),
        topic: task.topic,
        subtopic: task.subtopic,
        progressAfterSession: task.progressPercent,
      });

      remainingHours = parseFloat((remainingHours - targetChunk).toFixed(6));
    }

    dailyPlan.push(day);
  });

  const allocatedHours = dailyPlan.reduce(
    (sum, d) => sum + d.sessions.reduce((s, sess) => s + sess.duration, 0),
    0
  );

  return { dailyPlan, taskStates, allocatedHours };
}

/**
 * Calculate revision slots based on difficulty
 * (unchanged)
 */
function calculateRevisionSlots(tasks) {
  const revisionNeeds = [];

  tasks.forEach((task) => {
    let slots = 0;

    if (task.difficulty >= 4) {
      slots = 2;
    } else if (task.difficulty >= 2) {
      slots = 1;
    }

    for (let i = 0; i < slots; i++) {
      revisionNeeds.push({
        topic: task.topic,
        subtopic: task.subtopic,
        difficulty: task.difficulty,
        duration: Math.min(1.5, task.totalHours * 0.3), // 30% of original time, max 1.5 hours
      });
    }
  });

  return revisionNeeds;
}

/**
 * Create revision plan for appropriate final days
 *
 * Changes:
 * - If revisionDaysCount === 0 (no revision), function returns []
 * - When revision days exist, schedule revision sessions first, then fill remaining with unfinished learning
 */
function createRevisionPlan(
  revisionNeeds,
  availability,
  dailyPlan,
  taskStates
) {
  // If there are no revision needs or no availability, return empty
  if (!revisionNeeds || revisionNeeds.length === 0) return [];

  const totalDays = availability.length;

  // Determine revisionDaysCount using same heuristic as assignSessions/previous code
  let revisionDaysCount;
  if (totalDays <= 3) {
    revisionDaysCount = 1;
  } else if (totalDays <= 7) {
    revisionDaysCount = Math.max(1, Math.ceil(totalDays * 0.2));
  } else {
    revisionDaysCount = Math.ceil(totalDays * 0.25);
  }

  // Ensure we don't exceed totalDays
  revisionDaysCount = Math.min(revisionDaysCount, totalDays);

  // revision days start index (1-based day property)
  const revisionStartDay = totalDays - revisionDaysCount + 1;

  // Find the dailyPlan entries for revision days (they were added above as placeholders or with sessions)
  const revisionDays = dailyPlan.filter((day) => day.day >= revisionStartDay);

  // Clone revisionNeeds array to mutate
  const revisionQueue = [...revisionNeeds];

  // Schedule revision sessions into revision days
  revisionDays.forEach((day) => {
    // compute free time in that day (remaining availability after sessions scheduled earlier)
    const used = day.sessions.reduce((s, ss) => s + (ss.duration || 0), 0);
    let remainingHours = Math.max(0, (day.availabilityHours || 0) - used);

    // First assign revision sessions (one by one)
    while (remainingHours >= 0.25 && revisionQueue.length > 0) {
      const rev = revisionQueue.shift();

      // allocate up to rev.duration but cap to 1.0 hour per slot to keep sessions reasonable
      const revDuration = Math.min(rev.duration || 0.25, remainingHours, 1.0);
      if (revDuration < 0.25) break;

      day.sessions.push({
        duration: parseFloat(revDuration.toFixed(2)),
        topic: rev.topic,
        subtopic: rev.subtopic,
        type: "revision",
      });

      remainingHours = parseFloat((remainingHours - revDuration).toFixed(6));
    }

    // If there's still time and there are unfinished tasks, allocate to them (small learning boost)
    if (remainingHours >= 0.25) {
      const incomplete = taskStates
        .filter((t) => t.remainingHours > 0.001)
        .sort((a, b) => b.remainingHours - a.remainingHours);
      while (remainingHours >= 0.25 && incomplete.length > 0) {
        const t = incomplete[0];
        const sess = Math.min(remainingHours, t.remainingHours, 1.5);
        if (sess < 0.25) break;

        t.remainingHours = Math.max(
          0,
          parseFloat((t.remainingHours - sess).toFixed(6))
        );
        t.progressPercent =
          t.totalHours > 0
            ? Math.round(
                ((t.totalHours - t.remainingHours) / t.totalHours) * 100
              )
            : 100;

        day.sessions.push({
          duration: parseFloat(sess.toFixed(2)),
          topic: t.topic,
          subtopic: t.subtopic,
          progressAfterSession: t.progressPercent,
        });

        remainingHours = parseFloat((remainingHours - sess).toFixed(6));
        if (t.remainingHours <= 0.001) {
          incomplete.shift();
        }
      }
    }
  });

  // Return only days that actually have revision sessions
  return revisionDays.filter((day) =>
    day.sessions.some((s) => s.type === "revision")
  );
}

/**
 * Main function to generate study plan
 *
 * REVISED SIMPLE LOGIC:
 * 1. Last day = REVISION ONLY (if more than 1 day)
 * 2. All other days = LEARNING ONLY
 * 3. All topics compressed into learning days
 * 4. Progress = based on time consumed, not completion
 */
function generatePlan(input) {
  const {
    durationDays,
    availability = [],
    topics = [],
    sessionLength = 1.5,
  } = input;

  const avail = Array.isArray(availability) ? availability : [];
  const cleanedTopics = Array.isArray(topics) ? topics : [];
  const totalAvailableHours = calculateTotalHours(avail);
  const totalDays = avail.length;

  // ============================================================
  // STEP 1: Separate last day for revision, rest for learning
  // ============================================================
  const learningDays = totalDays > 1 ? avail.slice(0, -1) : avail;
  const revisionDay = totalDays > 1 ? avail[avail.length - 1] : null;

  const learningHoursAvailable = learningDays.reduce(
    (sum, d) => sum + d.hours,
    0
  );
  const revisionHoursAvailable = revisionDay ? revisionDay.hours : 0;

  // ============================================================
  // STEP 2: Distribute ALL topics across learning time
  // ============================================================
  const topicsWithHours = distributeHoursAcrossTopics(
    cleanedTopics,
    learningHoursAvailable
  );
  const tasksInitial = createTaskQueue(topicsWithHours);
  const totalRequiredHours = tasksInitial.reduce(
    (sum, t) => sum + (t.totalHours || 0),
    0
  );

  // Create learning availability from all days except last
  const learningAvailability = learningDays.map((d) => ({
    day: d.day,
    hours: d.hours,
  }));

  // ============================================================
  // STEP 3: Assign ALL learning sessions
  // ============================================================
  const { dailyPlan, taskStates, allocatedHours } = assignSessions(
    tasksInitial,
    learningAvailability,
    sessionLength
  );

  // Coverage based on TIME CONSUMED (not completion)
  const coveragePercent =
    totalRequiredHours > 0
      ? Math.round((allocatedHours / totalRequiredHours) * 100)
      : 100;

  // ============================================================
  // STEP 4: Schedule revision ONLY on last day
  // ============================================================
  // Any task that consumed ANY time gets revision slots
  const tasksWithProgress = taskStates.filter((t) => {
    const consumed = (t.totalHours || 0) - t.remainingHours;
    return consumed > 0.01;
  });

  let revisionSessions = [];
  let totalRevisionScheduled = 0;

  if (tasksWithProgress.length > 0 && revisionDay) {
    const revisionNeeds = calculateRevisionSlots(tasksWithProgress);
    let revTimeRemaining = revisionHoursAvailable;

    // Create the last day for revision ONLY
    const lastDayPlan = {
      day: revisionDay.day,
      availabilityHours: revisionDay.hours,
      sessions: [],
    };

    let dayRevTimeRemaining = revisionHoursAvailable;

    while (
      dayRevTimeRemaining >= 0.25 &&
      revisionNeeds.length > 0 &&
      revTimeRemaining > 0
    ) {
      const rev = revisionNeeds.shift();
      const revDuration = Math.min(
        rev.duration || 0.5,
        dayRevTimeRemaining,
        revTimeRemaining,
        1.0
      );

      if (revDuration >= 0.25) {
        lastDayPlan.sessions.push({
          duration: parseFloat(revDuration.toFixed(2)),
          topic: rev.topic,
          subtopic: rev.subtopic,
          type: "revision",
        });

        revisionSessions.push({
          day: revisionDay.day,
          duration: revDuration,
          topic: rev.topic,
          subtopic: rev.subtopic,
        });

        totalRevisionScheduled += revDuration;
        dayRevTimeRemaining -= revDuration;
        revTimeRemaining -= revDuration;
      }
    }

    // Add the last day to daily plan
    if (lastDayPlan.sessions.length > 0) {
      dailyPlan.push(lastDayPlan);
    }
  }

  // ============================================================
  // STEP 5: Build warnings and summary
  // ============================================================
  const warnings = [];
  const incompleteTopics = taskStates.filter((t) => t.remainingHours > 1.0);

  if (coveragePercent < 100) {
    warnings.push(
      `⚠️ Time constraint: ${coveragePercent}% of syllabus covered in available time`
    );
    const shortfall = totalRequiredHours - allocatedHours;
    if (shortfall > 0) {
      warnings.push(
        `⏰ Additional ${shortfall.toFixed(
          1
        )}h needed to fully complete all topics`
      );
    }
    if (incompleteTopics.length > 0) {
      warnings.push(
        `📚 Topics with limited coverage: ${incompleteTopics
          .map((t) => t.topic)
          .join(", ")}`
      );
    }
  }

  if (revisionDay && revisionSessions.length === 0) {
    warnings.push(
      `📅 Last day reserved for revision, but no revision scheduled yet`
    );
  }

  // Topic summary - group by main topic
  const topicMap = new Map();
  taskStates.forEach((task) => {
    const consumed = (task.totalHours || 0) - task.remainingHours;

    if (!topicMap.has(task.topic)) {
      topicMap.set(task.topic, {
        name: task.topic,
        totalHours: 0,
        allocatedHours: 0,
        difficulty: task.difficulty || 3,
      });
    }

    const topicEntry = topicMap.get(task.topic);
    topicEntry.totalHours += task.totalHours || 0;
    topicEntry.allocatedHours += consumed;
  });

  const topicsSummary = Array.from(topicMap.values()).map((topic) => ({
    name: topic.name,
    difficulty: topic.difficulty,
    totalHours: parseFloat(topic.totalHours.toFixed(2)),
    allocatedHours: parseFloat(topic.allocatedHours.toFixed(2)),
    progress:
      topic.totalHours > 0
        ? Math.min(
            Math.round((topic.allocatedHours / topic.totalHours) * 100),
            100
          )
        : 0,
  }));

  const fullyCovered = coveragePercent >= 99;
  const shortfallHours = Math.max(0, totalRequiredHours - allocatedHours);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      durationDays,
      totalAvailableHours: parseFloat(totalAvailableHours.toFixed(2)),
      totalRequiredHours: parseFloat(totalRequiredHours.toFixed(2)),
      allocatedLearningHours: parseFloat(allocatedHours.toFixed(2)),
      allocatedRevisionHours: parseFloat(totalRevisionScheduled.toFixed(2)),
      learningDays: learningDays.length,
      revisionDays: revisionDay ? 1 : 0,
      insufficient_hours: !fullyCovered,
      coveragePercent,
      shortfallHours: fullyCovered ? 0 : shortfallHours,
    },
    topicsSummary,
    dailyPlan: dailyPlan.sort((a, b) => a.day - b.day),
    revisionPlan: [],
    warnings,
  };
}

module.exports = {
  generatePlan,
  DIFFICULTY_WEIGHTS,
  normalizeSubtopics,
  calculateTotalHours,
  distributeHoursAcrossTopics,
  createTaskQueue,
  assignSessions,
  calculateRevisionSlots,
  createRevisionPlan,
};
