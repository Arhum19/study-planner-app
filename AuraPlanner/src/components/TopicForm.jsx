import { useState } from "react";

export default function TopicForm({ onTopicsChange, darkMode = false }) {
  const [topics, setTopics] = useState([]);

  const addTopic = () => {
    const newTopic = {
      id: Date.now(),
      name: "",
      difficulty: 3,
      subtopics: [],
    };
    const updatedTopics = [...topics, newTopic];
    setTopics(updatedTopics);
    onTopicsChange(updatedTopics);
  };

  const removeTopic = (topicId) => {
    const updatedTopics = topics.filter((t) => t.id !== topicId);
    setTopics(updatedTopics);
    onTopicsChange(updatedTopics);
  };

  const updateTopic = (topicId, field, value) => {
    const updatedTopics = topics.map((topic) =>
      topic.id === topicId ? { ...topic, [field]: value } : topic
    );
    setTopics(updatedTopics);
    onTopicsChange(updatedTopics);
  };

  const addSubtopic = (topicId) => {
    const updatedTopics = topics.map((topic) => {
      if (topic.id === topicId) {
        const newSubtopic = {
          id: Date.now(),
          name: "",
          percentage: 0,
        };
        return {
          ...topic,
          subtopics: [...topic.subtopics, newSubtopic],
        };
      }
      return topic;
    });
    setTopics(updatedTopics);
    onTopicsChange(updatedTopics);
  };

  const removeSubtopic = (topicId, subtopicId) => {
    const updatedTopics = topics.map((topic) => {
      if (topic.id === topicId) {
        return {
          ...topic,
          subtopics: topic.subtopics.filter((st) => st.id !== subtopicId),
        };
      }
      return topic;
    });
    setTopics(updatedTopics);
    onTopicsChange(updatedTopics);
  };

  const updateSubtopic = (topicId, subtopicId, field, value) => {
    const updatedTopics = topics.map((topic) => {
      if (topic.id === topicId) {
        return {
          ...topic,
          subtopics: topic.subtopics.map((st) =>
            st.id === subtopicId ? { ...st, [field]: value } : st
          ),
        };
      }
      return topic;
    });
    setTopics(updatedTopics);
    onTopicsChange(updatedTopics);
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-md mb-6 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Topics
        </h2>
        <button
          onClick={addTopic}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
        >
          + Add Topic
        </button>
      </div>

      <div className="space-y-6">
        {topics.map((topic, topicIndex) => (
          <div
            key={topic.id}
            className={`border rounded-lg p-4 ${
              darkMode
                ? "border-gray-600 bg-gray-700"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label
                  className={`block text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Topic Name
                </label>
                <input
                  type="text"
                  value={topic.name}
                  onChange={(e) =>
                    updateTopic(topic.id, "name", e.target.value)
                  }
                  placeholder="e.g., Sorting Algorithms"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                      : "border-gray-300"
                  }`}
                />
              </div>

              <div className="w-48">
                <label
                  className={`block text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Difficulty: {topic.difficulty}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={topic.difficulty}
                  onChange={(e) =>
                    updateTopic(
                      topic.id,
                      "difficulty",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div
                  className={`flex justify-between text-xs mt-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <span>Easy</span>
                  <span>Hard</span>
                </div>
              </div>

              <button
                onClick={() => removeTopic(topic.id)}
                className="self-start px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
              >
                Remove
              </button>
            </div>

            <div className="ml-4">
              <div className="flex justify-between items-center mb-2">
                <label
                  className={`text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Subtopics (optional)
                </label>
                <button
                  onClick={() => addSubtopic(topic.id)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
                >
                  + Add Subtopic
                </button>
              </div>

              {topic.subtopics.length > 0 && (
                <div className="space-y-2">
                  {topic.subtopics.map((subtopic) => (
                    <div key={subtopic.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={subtopic.name}
                        onChange={(e) =>
                          updateSubtopic(
                            topic.id,
                            subtopic.id,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Subtopic name"
                        className={`flex-1 px-3 py-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode
                            ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                            : "border-gray-300"
                        }`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={subtopic.percentage}
                        onChange={(e) =>
                          updateSubtopic(
                            topic.id,
                            subtopic.id,
                            "percentage",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="%"
                        className={`w-20 px-3 py-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "border-gray-300"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        %
                      </span>
                      <button
                        onClick={() => removeSubtopic(topic.id, subtopic.id)}
                        className="px-2 py-1 bg-red-400 text-white text-sm rounded-lg hover:bg-red-500 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div
                    className={`text-xs mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Total:{" "}
                    {topic.subtopics.reduce(
                      (sum, st) => sum + (st.percentage || 0),
                      0
                    )}
                    %
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {topics.length === 0 && (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No topics added yet. Click "Add Topic" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
