"use client";
import { useState, useEffect } from "react";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [manualText, setManualText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);
  const [activeTab, setActiveTab] = useState("manual");
  const [aiResponse, setAiResponse] = useState(null);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoadingTodos(true);
      const response = await fetch(`${process.env.API}/api/todos/`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data.todos || []);
      } else {
        console.error("Failed to fetch todos");
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setIsLoadingTodos(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    setIsLoadingManual(true);
    try {
      const response = await fetch(`${process.env.API}/api/todos/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: manualText }),
      });

      if (response.ok) {
        const data = await response.json();
        setManualText("");
        await fetchTodos(); // Refresh the todo list
        // Show success message
        setTimeout(() => {
          alert(data.message || "Todo created successfully!");
        }, 100);
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Failed to create todo"));
      }
    } catch (error) {
      console.error("Error creating todo:", error);
      alert("Network error occurred");
    } finally {
      setIsLoadingManual(false);
    }
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsLoadingAi(true);
    setAiResponse(null);
    try {
      const response = await fetch(`${process.env.API}/api/todos/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponse(data);
        setAiPrompt("");

        // If a todo was created, refresh the list
        if (
          data.tool_used === "create_todo" ||
          data.output.includes("✅ Todo created")
        ) {
          await fetchTodos();
        }
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Failed to process AI request"));
      }
    } catch (error) {
      console.error("Error with AI request:", error);
      alert("Network error occurred");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // For demo purposes - delete functionality (you'll need to implement this in your backend)
  const deleteTodo = async (id) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      // Since delete endpoint doesn't exist in your backend, we'll just remove from local state
      // In a real app, you would implement DELETE /api/todos/:id in your backend
      setTodos(todos.filter((todo) => todo._id !== id));
    }
  };

  const getToolIcon = (toolName) => {
    switch (toolName) {
      case "create_todo":
        return "✅";
      case "list_todos":
        return "📋";
      case "create_note":
        return "📝";
      case "get_user_info":
        return "👤";
      default:
        return "🤖";
    }
  };

  const getToolColor = (toolName) => {
    switch (toolName) {
      case "create_todo":
        return "bg-green-100 text-green-700";
      case "list_todos":
        return "bg-blue-100 text-blue-700";
      case "create_note":
        return "bg-yellow-100 text-yellow-700";
      case "get_user_info":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white text-center">
              Smart Todo Manager with AI Tools
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Create todos manually or let AI handle it with powerful tools
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "manual"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="inline-block mr-2">➕</span>
              Manual Todo
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "ai"
                  ? "bg-purple-50 text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="inline-block mr-2">🤖</span>
              AI Assistant
            </button>
            <button
              onClick={() => setActiveTab("todos")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "todos"
                  ? "bg-green-50 text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="inline-block mr-2">📋</span>
              All Todos ({todos.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Manual Todo Form */}
            {activeTab === "manual" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Create Manual Todo
                </h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Enter your todo (e.g., Buy groceries, Call dentist...)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    disabled={isLoadingManual}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleManualSubmit({ preventDefault: () => {} });
                      }
                    }}
                  />
                  <button
                    onClick={handleManualSubmit}
                    disabled={isLoadingManual || !manualText.trim()}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingManual ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Todo...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">➕</span>
                        Create Todo
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* AI Assistant Form */}
            {activeTab === "ai" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  AI Assistant
                </h2>
                <p className="text-gray-600 text-sm">
                  Available tools: Create Todo, List Todos, Create Note, Get
                  User Info
                </p>
                <div className="space-y-3">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Tell the AI what you want to do... Examples:&#10;• Create a todo to buy groceries&#10;• Show me all my todos&#10;• Make a note about the meeting&#10;• Get my user information"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                    rows="4"
                    disabled={isLoadingAi}
                  />
                  <button
                    onClick={handleAiSubmit}
                    disabled={isLoadingAi || !aiPrompt.trim()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoadingAi ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        AI Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🤖</span>
                        Send to AI Assistant
                      </div>
                    )}
                  </button>
                </div>

                {/* AI Response */}
                {aiResponse && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🤖</span>
                      <h3 className="font-semibold text-gray-800">
                        AI Response
                      </h3>
                      {aiResponse.tool_used &&
                        aiResponse.tool_used !== "none" && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getToolColor(
                              aiResponse.tool_used
                            )}`}
                          >
                            {getToolIcon(aiResponse.tool_used)}{" "}
                            {aiResponse.tool_used.replace("_", " ")}
                          </span>
                        )}
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {aiResponse.output}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Todo List */}
            {activeTab === "todos" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    All Todos ({todos.length})
                  </h2>
                  <button
                    onClick={fetchTodos}
                    disabled={isLoadingTodos}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isLoadingTodos ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "🔄 Refresh"
                    )}
                  </button>
                </div>

                {isLoadingTodos ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Loading todos...</span>
                  </div>
                ) : todos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    No todos yet. Create your first todo using Manual or AI
                    tabs!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todos.map((todo) => (
                      <div
                        key={todo._id}
                        className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-800 whitespace-pre-wrap break-words">
                            {todo.text}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">
                              {new Date(todo.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTodo(todo._id)}
                          className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                          title="Delete todo"
                        >
                          <span className="text-sm">🗑️</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
