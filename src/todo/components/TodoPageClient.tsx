"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Todo, TodoStatus } from "@/todo/lib/db/todos";

interface Props {
  initialTodos: Todo[];
}

const STATUS_COLORS: Record<TodoStatus, string> = {
  done: "bg-green-400",
  started: "bg-yellow-400",
  not_started: "bg-red-400",
};

const STATUS_LABELS: Record<TodoStatus, string> = {
  done: "Done",
  started: "Started",
  not_started: "Not Started",
};

const STATUS_ORDER: TodoStatus[] = ["not_started", "started", "done"];

function getNextStatus(currentStatus: TodoStatus): TodoStatus {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
  return STATUS_ORDER[nextIndex];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function createDateRange(startDate: Date, days: number): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function TodoPageClient({ initialTodos }: Props) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoTime, setNewTodoTime] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate date range: 30 days before today + today + 180 days after (211 total days, ~6 months)
  // Current day will be at index 30 (on the far left of visible area)
  const visibleDates = useMemo(() => {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
    return createDateRange(startDate, 211);
  }, [today]);

  // Group todos by date
  const todosByDate = useMemo(() => {
    const grouped: Record<string, Todo[]> = {};
    todos.forEach((todo) => {
      const key = todo.due_date;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(todo);
    });
    // Sort todos within each date by due_time if available, then by name
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        if (a.due_time && b.due_time) {
          return a.due_time.localeCompare(b.due_time);
        }
        if (a.due_time) return -1;
        if (b.due_time) return 1;
        return a.name.localeCompare(b.name);
      });
    });
    return grouped;
  }, [todos]);

  const scrollToToday = () => {
    if (scrollContainerRef.current) {
      // Scroll to position current day on the far left
      // Column width is 200px
      scrollContainerRef.current.scrollLeft = 30 * 200;
    }
  };

  // Scroll to current day on mount
  useEffect(() => {
    scrollToToday();
  }, []);

  const handleStartAdding = (date: Date) => {
    const dateKey = getDateKey(date);
    setEditingDate(dateKey);
    setNewTodoName("");
    setNewTodoTime("");
  };

  const handleCancelAdding = () => {
    setEditingDate(null);
    setNewTodoName("");
    setNewTodoTime("");
  };

  const handleSubmitTodo = async (date: Date) => {
    if (!newTodoName.trim()) {
      handleCancelAdding();
      return;
    }

    const dueDate = getDateKey(date);
    const dueTime = newTodoTime.trim() ? `${newTodoTime.trim()}:00` : null;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTodoName.trim(),
          due_date: dueDate,
          due_time: dueTime,
          status: "not_started",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      const { id } = await response.json();

      // Add the new todo to state
      const newTodo: Todo = {
        id,
        name: newTodoName.trim(),
        due_date: dueDate,
        due_time: dueTime,
        status: "not_started",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTodos((prev) => {
        // Check if todo already exists (in case of race condition)
        const exists = prev.find((t) => t.id === id);
        return exists ? prev : [...prev, newTodo];
      });

      handleCancelAdding();
    } catch (error) {
      console.error("Error adding todo:", error);
      alert("Failed to add todo");
    }
  };

  const handleDeleteTodo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Failed to delete todo");
    }
  };

  const handleStatusChange = async (todo: Todo) => {
    const newStatus = getNextStatus(todo.status);

    try {
      const response = await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: todo.id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error("Error updating todo:", error);
      alert("Failed to update todo");
    }
  };


  const isToday = (date: Date): boolean => {
    return getDateKey(date) === getDateKey(today);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 py-2">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-zinc-900">
              Todo Calendar
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="flex h-[calc(100vh-3.5rem)]">
          {/* Legend Column */}
          <div
            className="hidden md:flex md:flex-col w-48 border-r border-zinc-200 bg-white flex-shrink-0 cursor-pointer hover:bg-zinc-50 transition-colors"
            onClick={scrollToToday}
            title="Click to scroll to today"
          >
            <div className="p-2 border-b border-zinc-200">
              <h2 className="text-sm font-semibold text-zinc-900">Spring 2026</h2>
            </div>
            <div className="p-2 space-y-2">
              {STATUS_ORDER.map((status) => (
                <div
                  key={status}
                  className="flex items-center gap-2 text-sm text-zinc-700"
                >
                  <div
                    className={`w-4 h-4 rounded ${STATUS_COLORS[status]}`}
                  />
                  <span>{STATUS_LABELS[status]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Scrollable Area */}
          <div className="flex-1 overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="h-full overflow-x-auto overflow-y-hidden"
            >
              <div className="flex h-full min-w-max">
                {visibleDates.map((date) => {
                  const dateKey = getDateKey(date);
                  const dayTodos = todosByDate[dateKey] || [];
                  const isEditing = editingDate === dateKey;
                  const isTodayDate = isToday(date);

                  return (
                    <div
                      key={dateKey}
                      className="border-r bg-white border-zinc-200 flex flex-col flex-shrink-0"
                      style={{ width: '200px' }}
                    >
                      {/* Day Header */}
                      <div className={`p-2 border-b ${isTodayDate ? 'bg-blue-50 border-blue-200' : 'border-zinc-200'}`}>
                        <div className={`text-sm font-semibold ${isTodayDate ? 'text-blue-700' : 'text-zinc-900'}`}>
                          {formatDate(date)}
                        </div>
                      </div>

                      {/* Todo Items */}
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
                        {dayTodos.map((todo) => (
                          <div
                            key={todo.id}
                            className={`p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity ${STATUS_COLORS[todo.status]}`}
                            onClick={() => handleStatusChange(todo)}
                            title="Click to change status"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-zinc-900 break-words">
                                  {todo.name}
                                </div>
                                {todo.due_time && (
                                  <div className="text-xs text-zinc-700 mt-0.5">
                                    {todo.due_time.substring(0, 5)}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => handleDeleteTodo(todo.id, e)}
                                className="text-zinc-700 hover:text-zinc-900 text-xs font-bold px-1 rounded hover:bg-zinc-300/50 flex-shrink-0"
                                title="Delete"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                        {isEditing ? (
                          <div className="space-y-1.5 p-1.5 border border-zinc-300 rounded bg-white">
                            <input
                              type="text"
                              value={newTodoName}
                              onChange={(e) => setNewTodoName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSubmitTodo(date);
                                } else if (e.key === "Escape") {
                                  handleCancelAdding();
                                }
                              }}
                              placeholder="Todo name"
                              className="w-full px-2 py-1 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={newTodoTime}
                              onChange={(e) => setNewTodoTime(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSubmitTodo(date);
                                } else if (e.key === "Escape") {
                                  handleCancelAdding();
                                }
                              }}
                              placeholder="Time (HH:MM)"
                              className="w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSubmitTodo(date)}
                                className="flex-1 px-2 py-1 text-xs font-medium text-white bg-zinc-700 hover:bg-zinc-800 rounded"
                              >
                                Add
                              </button>
                              <button
                                onClick={handleCancelAdding}
                                className="flex-1 px-2 py-1 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartAdding(date)}
                            className="w-full py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded border border-dashed border-zinc-300 hover:border-zinc-400 transition-colors"
                          >
                            + Add Todo
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

