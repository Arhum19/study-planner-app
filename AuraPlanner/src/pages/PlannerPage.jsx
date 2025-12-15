import { useState } from "react";
import AvailabilityForm from "../components/AvailabilityForm";
import TopicForm from "../components/TopicForm";
import PlanView from "../components/PlanView";
import ExportButton from "../components/ExportButton";
import apiClient from "../api/apiClient";

export default function PlannerPage() {
  const [availability, setAvailability] = useState(null);
  const [topics, setTopics] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleGeneratePlan = async () => {
    // Validation
    if (
      !availability ||
      !availability.availability ||
      availability.availability.length === 0
    ) {
      setError("Please set your study duration and availability");
      return;
    }

    if (topics.length === 0) {
      setError("Please add at least one topic");
      return;
    }

    // Check if topics have names
    const invalidTopics = topics.filter((t) => !t.name.trim());
    if (invalidTopics.length > 0) {
      setError("All topics must have a name");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Transform topics to backend format
      const formattedTopics = topics.map((topic) => ({
        name: topic.name,
        difficulty: topic.difficulty,
        subtopics:
          topic.subtopics.length > 0
            ? topic.subtopics.map((st) => ({
                name: st.name,
                percentage: st.percentage,
              }))
            : null,
      }));

      const payload = {
        durationDays: availability.durationDays,
        availability: availability.availability,
        sessionLength: availability.sessionLength,
        topics: formattedTopics,
      };

      const response = await apiClient.generatePlan(payload);

      if (response.success) {
        setPlan(response.plan);
        setError(null);
      } else {
        setError("Failed to generate plan");
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to generate plan. Make sure the backend server is running."
      );
      console.error("Error generating plan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen py-8 transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-100 ${
              darkMode
                ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                : "bg-gray-800 text-gray-100 hover:bg-gray-700"
            }`}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1
            className={`text-4xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            AURA PLANNER
          </h1>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            Create realistic study plans based on your availability
          </p>
        </div>

        <AvailabilityForm
          onAvailabilityChange={setAvailability}
          darkMode={darkMode}
        />

        <TopicForm onTopicsChange={setTopics} darkMode={darkMode} />

        {error && (
          <div
            className={`mb-6 p-4 border rounded-lg ${
              darkMode
                ? "bg-red-900/20 border-red-700"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className={darkMode ? "text-red-300" : "text-red-700"}>
              ❌ {error}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-100"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              "🚀 Generate Study Plan"
            )}
          </button>

          <ExportButton plan={plan} />
        </div>

        {plan && <PlanView plan={plan} darkMode={darkMode} />}
      </div>
    </div>
  );
}
