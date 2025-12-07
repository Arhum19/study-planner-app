import { useState } from "react";

export default function AvailabilityForm({
  onAvailabilityChange,
  darkMode = false,
}) {
  const [durationType, setDurationType] = useState("days");
  const [durationValue, setDurationValue] = useState(7);
  const [availability, setAvailability] = useState([]);
  const [sessionLength, setSessionLength] = useState(1.5);

  const handleDurationChange = (value, type) => {
    const days = type === "weeks" ? value * 7 : value;
    setDurationValue(value);
    setDurationType(type);

    // Generate default availability
    const newAvailability = Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      hours: 3,
    }));
    setAvailability(newAvailability);

    onAvailabilityChange({
      durationDays: days,
      availability: newAvailability,
      sessionLength,
    });
  };

  const handleHoursChange = (dayIndex, hours) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].hours = parseFloat(hours) || 0;
    setAvailability(newAvailability);

    onAvailabilityChange({
      durationDays: availability.length,
      availability: newAvailability,
      sessionLength,
    });
  };

  const handleSessionLengthChange = (length) => {
    setSessionLength(length);
    onAvailabilityChange({
      durationDays: availability.length,
      availability,
      sessionLength: length,
    });
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-md mb-6 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2
        className={`text-2xl font-bold mb-4 ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Study Duration & Availability
      </h2>

      <div className="mb-6">
        <label
          className={`block text-sm font-medium mb-2 ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Duration
        </label>
        <div className="flex gap-4">
          <input
            type="number"
            min="1"
            max="52"
            value={durationValue}
            onChange={(e) =>
              handleDurationChange(parseInt(e.target.value) || 1, durationType)
            }
            className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "border-gray-300"
            }`}
          />
          <select
            value={durationType}
            onChange={(e) =>
              handleDurationChange(durationValue, e.target.value)
            }
            className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "border-gray-300"
            }`}
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label
          className={`block text-sm font-medium mb-2 ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Session Length (hours)
        </label>
        <input
          type="number"
          min="0.5"
          max="3"
          step="0.5"
          value={sessionLength}
          onChange={(e) =>
            handleSessionLengthChange(parseFloat(e.target.value))
          }
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "border-gray-300"
          }`}
        />
      </div>

      {availability.length > 0 && (
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Daily Availability (hours)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
            {availability.map((day, index) => (
              <div key={day.day} className="flex items-center gap-2">
                <label
                  className={`text-sm w-16 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Day {day.day}:
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={day.hours}
                  onChange={(e) => handleHoursChange(index, e.target.value)}
                  className={`flex-1 px-3 py-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "border-gray-300"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
