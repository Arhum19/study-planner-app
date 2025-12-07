import { useState } from "react";
import DayDropdown from "./DayDropdown";

export default function PlanView({ plan, darkMode = false }) {
  const [expandAll, setExpandAll] = useState(true);

  if (!plan || !plan.dailyPlan) {
    return null;
  }

  const toggleAll = () => {
    setExpandAll(!expandAll);
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Arhum Study Planner
          </h2>
          <p
            className={`text-sm mt-1 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Generated on {new Date(plan.meta.generatedAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={toggleAll}
          className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-md ${
            darkMode
              ? "bg-gray-700 text-gray-200 hover:bg-gray-600 hover:shadow-lg hover:scale-105 active:scale-100"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-lg hover:scale-105 active:scale-100"
          }`}
        >
          {expandAll ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Warnings */}
      {plan.warnings && plan.warnings.length > 0 && (
        <div
          className={`mb-6 p-4 border rounded-lg ${
            darkMode
              ? "bg-yellow-900/20 border-yellow-700"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              darkMode ? "text-yellow-300" : "text-yellow-800"
            }`}
          >
            ⚠️ Warnings
          </h3>
          <ul
            className={`text-sm space-y-1 ${
              darkMode ? "text-yellow-200" : "text-yellow-700"
            }`}
          >
            {plan.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta Information */}
      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg ${
          darkMode ? "bg-blue-900/20" : "bg-blue-50"
        }`}
      >
        <div>
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Duration
          </p>
          <p
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {plan.meta.durationDays} days
          </p>
        </div>
        <div>
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Total Hours
          </p>
          <p
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {plan.meta.totalAvailableHours}h
          </p>
        </div>
        <div>
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Coverage
          </p>
          <p
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {plan.meta.coveragePercent || 100}%
          </p>
        </div>
        <div>
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Topics
          </p>
          <p
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {plan.topicsSummary.length}
          </p>
        </div>
      </div>

      {/* Topics Summary */}
      <div className="mb-6">
        <h3
          className={`text-lg font-semibold mb-3 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Topics Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plan.topicsSummary.map((topic, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg ${
                darkMode
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {topic.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {topic.allocatedHours}h
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                    Difficulty: {topic.difficulty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Plan */}
      <div className="mb-6">
        <h3
          className={`text-lg font-semibold mb-3 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Daily Schedule
        </h3>
        <div>
          {plan.dailyPlan.map((day) => (
            <DayDropdown
              key={day.day}
              day={day.day}
              availabilityHours={day.availabilityHours}
              sessions={day.sessions}
              darkMode={darkMode}
              expandAll={expandAll}
            />
          ))}
        </div>
      </div>

      {/* Revision Plan */}
      {plan.revisionPlan && plan.revisionPlan.length > 0 && (
        <div>
          <h3
            className={`text-lg font-semibold mb-3 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Revision Schedule
          </h3>
          <div>
            {plan.revisionPlan.map((day) => {
              const dailyEntry = plan.dailyPlan.find((d) => d.day === day.day);
              const availHours = dailyEntry ? dailyEntry.availabilityHours : 0;

              return (
                <DayDropdown
                  key={`revision-${day.day}`}
                  day={day.day}
                  availabilityHours={availHours}
                  sessions={day.sessions}
                  isRevision={true}
                  darkMode={darkMode}
                  expandAll={expandAll}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
