import { useState, useEffect } from "react";

// Progress Bar Component for all sessions
const ProgressBar = ({ percentage, isRevision = false }) => {
  const safePercentage = Math.min(100, Math.max(0, percentage || 0));

  // Different gradient colors for learning vs revision
  const gradientClass = isRevision
    ? "bg-gradient-to-r from-purple-500 to-blue-500"
    : "bg-gradient-to-r from-green-500 to-emerald-600";

  return (
    <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${gradientClass} flex items-center justify-center text-xs font-semibold text-white`}
        style={{ width: `${safePercentage}%` }}
      >
        {safePercentage > 10 && `${safePercentage}%`}
      </div>
    </div>
  );
};

export default function DayDropdown({
  day,
  availabilityHours,
  sessions,
  isRevision = false,
  darkMode = false,
  expandAll = true,
}) {
  const [isOpen, setIsOpen] = useState(expandAll);

  // Update local state when expandAll prop changes
  useEffect(() => {
    setIsOpen(expandAll);
  }, [expandAll]);

  const totalSessionHours = sessions.reduce((sum, s) => sum + s.duration, 0);

  // Helper function to format duration
  const formatDuration = (hours) => {
    if (hours >= 1) {
      return `${hours.toFixed(1)}h`;
    } else {
      const minutes = Math.round(hours * 60);
      return `${minutes}min`;
    }
  };

  return (
    <div
      className={`border rounded-lg mb-3 shadow-sm ${
        darkMode ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 flex justify-between items-center transition ${
          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-4">
          <span
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Day {day}{" "}
            {isRevision && (
              <span className="text-sm text-purple-600">(Revision)</span>
            )}
          </span>
          <span
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {totalSessionHours.toFixed(1)}h / {availabilityHours}h
          </span>
          <span
            className={`text-sm ${
              darkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <th
                    className={`text-left py-3 px-4 font-medium w-24 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Duration
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium w-1/4 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Topic
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium w-1/4 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Subtopic
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium w-1/3 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr
                    key={index}
                    className={`border-b ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <td
                      className={`py-3 px-4 ${
                        darkMode ? "text-gray-300" : "text-gray-800"
                      }`}
                    >
                      {formatDuration(session.duration)}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        darkMode ? "text-gray-300" : "text-gray-800"
                      }`}
                    >
                      {session.topic}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        darkMode ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      {session.subtopic}
                      {session.type === "revision" && (
                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          Revision
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="w-full max-w-xs">
                        {session.type === "revision" ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-75"></div>
                            <span className="text-xs text-purple-600 font-medium">
                              Review
                            </span>
                          </div>
                        ) : session.progressAfterSession !== undefined ? (
                          <ProgressBar
                            percentage={session.progressAfterSession}
                            isRevision={false}
                          />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
