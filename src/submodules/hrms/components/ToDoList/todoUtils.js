export const TODO_FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

export const TODO_PRIORITIES = [
  { label: "All Priorities", value: "all" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export const TODO_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Due Date", value: "dueDate" },
  { label: "Title", value: "title" },
];

export const createEmptySubtask = () => ({
  id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: "",
  is_completed: false,
});

export const createEmptyTodoForm = () => ({
  title: "",
  description: "",
  priority: "medium",
  due_date: "",
  subtasks: [createEmptySubtask()],
});

export const formatDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const pad = (num) => String(num).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export const formatDateLabel = (value) => {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const hour12 = hours % 12 || 12;
  const meridiem = hours >= 12 ? "pm" : "am";

  return `${day}-${month}-${year} ${hour12}:${minutes}${meridiem}`;
};

export const getDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const isoDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch) {
      return isoDateMatch[1];
    }

    const localeDateMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (localeDateMatch) {
      const [, month, day, year] = localeDateMatch;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getPriorityClasses = (priority) => {
  const map = {
    low: "bg-slate-100 text-slate-700 ring-slate-200",
    medium: "bg-amber-50 text-amber-700 ring-amber-200",
    high: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  return map[priority] || map.medium;
};

export const getStatusClasses = (status) => {
  return status === "completed"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-amber-50 text-amber-700 ring-amber-200";
};

export const getProgress = (subtasks = []) => {
  if (!subtasks.length) {
    return 0;
  }

  const completedCount = subtasks.filter(
    (subtask) => subtask.is_completed,
  ).length;
  return Math.round((completedCount / subtasks.length) * 100);
};
