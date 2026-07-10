import React, { useEffect, useMemo, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import {
  Archive,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ClipboardList,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  AlertTriangle,
} from "lucide-react";
import useTodos from "./useTodos";
import {
  TODO_FILTERS,
  TODO_PRIORITIES,
  TODO_SORT_OPTIONS,
  createEmptySubtask,
  createEmptyTodoForm,
  formatDateLabel,
  formatDateTimeLocal,
  getPriorityClasses,
  getProgress,
  getStatusClasses,
} from "./todoUtils";

const StatCard = ({ label, value, icon, bg }) => (
  <div className="app-panel p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-(--text-soft) truncate">
          {label}
        </p>
        <div className="mt-2 text-[26px] font-extrabold leading-none text-(--text-strong)">
          {value}
        </div>
      </div>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${bg}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const getDateGroupMeta = (createdAt) => {
  if (!createdAt) {
    return {
      key: "unknown-date",
      label: "Unknown Date",
      sortValue: Number.MAX_SAFE_INTEGER,
    };
  }

  const date = new Date(createdAt);
  const groupDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const yesterdayOnly = new Date(todayOnly);
  yesterdayOnly.setDate(yesterdayOnly.getDate() - 1);

  let label = groupDate.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (groupDate.getTime() === todayOnly.getTime()) {
    label = "Created Today";
  } else if (groupDate.getTime() === yesterdayOnly.getTime()) {
    label = "Created Yesterday";
  }

  return {
    key: groupDate.toISOString(),
    label,
    sortValue: groupDate.getTime(),
  };
};

const ToDoList = () => {
  const { user } = useAuth();
  const companyId = user.company_id;
  const companySlug = user.slug || "";
  const createdBy = user.user_id;
  const [viewMode, setViewMode] = useState("list");
  const [expandedTodos, setExpandedTodos] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedTodos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const {
    todos,
    filters,
    setFilters,
    loading,
    saving,
    error,
    stats,
    saveTodo,
    removeTodo,
    flipTodoStatus,
    flipTodoArchive,
  } = useTodos({ companyId, companySlug, createdBy });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [form, setForm] = useState(createEmptyTodoForm());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setNotice(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const openCreateModal = () => {
    setEditingTodo(null);
    setForm(createEmptyTodoForm());
    setIsModalOpen(true);
  };

  const openEditModal = (todo) => {
    setEditingTodo(todo);
    setForm({
      title: todo.title || "",
      description: todo.description || "",
      priority: todo.priority || "medium",
      due_date: formatDateTimeLocal(todo.due_date),
      status: todo.status,
      is_archived: todo.is_archived,
      subtasks: todo.subtasks?.length
        ? todo.subtasks.map((subtask) => ({
            id: subtask.id,
            title: subtask.title,
            is_completed: Boolean(subtask.is_completed),
          }))
        : [createEmptySubtask()],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTodo(null);
    setForm(createEmptyTodoForm());
  };

  const handleFormChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubtaskChange = (index, key, value) => {
    setForm((current) => ({
      ...current,
      subtasks: current.subtasks.map((subtask, subtaskIndex) =>
        subtaskIndex === index ? { ...subtask, [key]: value } : subtask,
      ),
    }));
  };

  const addSubtask = () => {
    setForm((current) => ({
      ...current,
      subtasks: [...current.subtasks, createEmptySubtask()],
    }));
  };

  const removeSubtask = (index) => {
    setForm((current) => ({
      ...current,
      subtasks:
        current.subtasks.length === 1
          ? [createEmptySubtask()]
          : current.subtasks.filter(
              (_, subtaskIndex) => subtaskIndex !== index,
            ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await saveTodo(form, editingTodo?.id || null);
    if (result?.success) {
      setNotice(editingTodo ? "Todo updated." : "Todo created.");
      closeModal();
    }
  };

  const handleSubtaskToggle = async (todo, index) => {
    const nextSubtasks = todo.subtasks.map((subtask, subtaskIndex) =>
      subtaskIndex === index
        ? { ...subtask, is_completed: !subtask.is_completed }
        : subtask,
    );

    await saveTodo(
      {
        ...todo,
        due_date: formatDateTimeLocal(todo.due_date),
        subtasks: nextSubtasks,
      },
      todo.id,
      { status: todo.status, is_archived: todo.is_archived },
    );
  };

  const visibleTitle = useMemo(
    () => (filters.archived ? "Archived To Do List" : "To Do List"),
    [filters.archived],
  );

  const filteredTodos = useMemo(() => {
    return todos;
  }, [todos]);

  const groupedTodos = useMemo(() => {
    const groupMap = new Map();

    filteredTodos.forEach((todo) => {
      const meta = getDateGroupMeta(todo.created_at);
      if (!groupMap.has(meta.key)) {
        groupMap.set(meta.key, { ...meta, items: [] });
      }
      groupMap.get(meta.key).items.push(todo);
    });

    return Array.from(groupMap.values()).sort(
      (a, b) => a.sortValue - b.sortValue,
    );
  }, [filteredTodos]);

  const globalSerialMap = useMemo(() => {
    const map = new Map();
    let serial = 1;
    groupedTodos.forEach((group) => {
      group.items.forEach((todo) => {
        map.set(todo.id, serial++);
      });
    });
    return map;
  }, [groupedTodos]);

  return (
    <div className="crm-module-root w-full space-y-6">
      <div className="app-panel p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="app-heading">{visibleTitle}</h3>
          <p className="app-subtitle mt-0.5">
            Plan, track, and finish your day-to-day checklist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                archived: !current.archived,
              }))
            }
            className="app-btn-secondary flex items-center gap-2 cursor-pointer"
          >
            <Archive className="h-4 w-4" />
            {filters.archived ? "Show Active" : "Show Archive"}
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="app-btn-primary flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Todo
          </button>
        </div>
      </div>

      <div className="app-grid-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<ClipboardList className="h-5 w-5 text-(--text-soft)" />}
          bg="bg-gray-50 border-gray-200"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          bg="bg-amber-50 border-amber-100"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          bg="bg-emerald-50 border-emerald-100"
        />
        <StatCard
          label="High Priority"
          value={stats.highPriority}
          icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
          bg="bg-rose-50 border-rose-100"
        />
      </div>

      <div className="app-panel p-4">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-faint)" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder="Search todo title or description"
              className="w-full pl-11! app-input text-sm"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-(--border-soft) bg-gray-50/50 px-3 py-0.5 focus-within:ring-2 focus-within:ring-(--brand-ring) focus-within:border-(--brand) transition-all">
            <Filter className="h-4 w-4 text-(--text-faint)" />
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              className="h-10 w-full bg-transparent text-sm text-(--text-strong) outline-none border-none cursor-pointer"
            >
              {TODO_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <select
            value={filters.priority}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                priority: event.target.value,
              }))
            }
            className="app-input text-sm h-11 w-full"
          >
            {TODO_PRIORITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 rounded-xl border border-(--border-soft) bg-gray-50/50 px-3 py-0.5 focus-within:ring-2 focus-within:ring-(--brand-ring) focus-within:border-(--brand) transition-all">
            <Calendar className="h-4 w-4 text-(--text-faint)" />
            <input
              type="date"
              value={filters.dueDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
              className="h-10 w-full bg-transparent text-sm text-(--text-strong) outline-none border-none"
            />
            {filters.dueDate ? (
              <button
                type="button"
                onClick={() =>
                  setFilters((current) => ({ ...current, dueDate: "" }))
                }
                className="p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                aria-label="Clear due date filter"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <select
            value={filters.sort}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                sort: event.target.value,
              }))
            }
            className="app-input text-sm h-11 w-full"
          >
            {TODO_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-2xl border border-(--border-soft) bg-white"
            />
          ))}
        </div>
      ) : filteredTodos.length ? (
        <div className="space-y-6">
          {groupedTodos.map((group) => (
            <section key={group.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-extrabold text-(--text-strong) uppercase tracking-wider">
                    {group.label}
                  </h2>
                  <p className="text-[11px] text-(--text-faint) font-semibold mt-0.5">
                    {group.items.length} item
                    {group.items.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-0.5 rounded-lg border border-(--border-soft) bg-white p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`rounded p-1 transition cursor-pointer ${viewMode === "list" ? "bg-(--brand) text-white" : "text-(--text-soft) hover:bg-gray-50"}`}
                    title="List view"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`rounded p-1 transition cursor-pointer ${viewMode === "grid" ? "bg-(--brand) text-white" : "text-(--text-soft) hover:bg-gray-50"}`}
                    title="Grid view"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-4 xl:grid-cols-2"
                    : "flex flex-col divide-y divide-(--border-soft)/50 rounded-2xl border border-(--border-soft) bg-white shadow-2xs overflow-hidden"
                }
              >
                {group.items.map((todo) => {
                  const progress = getProgress(todo.subtasks);
                  const hasDescription = Boolean(todo.description?.trim());
                  const hasSubtasks = todo.subtasks.length > 0;
                  const hasDueDate = Boolean(todo.due_date);

                  if (viewMode === "list") {
                    const isExpanded = expandedTodos.has(todo.id);
                    const serialIndex = globalSerialMap.get(todo.id);

                    return (
                      <div
                        key={todo.id}
                        className={`group transition-colors ${todo.status === "completed" ? "opacity-75" : ""}`}
                      >
                        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-(--bg-subtle)/30 transition-colors">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-slate-100 to-slate-200/60 border border-slate-300/50 shadow-xs shadow-slate-100 select-none">
                            <span className="text-[10px] font-bold tabular-nums text-slate-600">
                              {serialIndex}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => flipTodoStatus(todo.id)}
                            className="shrink-0 transition-transform hover:scale-110 cursor-pointer"
                            title={
                              todo.status === "completed"
                                ? "Mark pending"
                                : "Mark complete"
                            }
                          >
                            {todo.status === "completed" ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                            ) : (
                              <Circle className="h-4.5 w-4.5 text-gray-300 hover:text-(--brand)" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-sm font-semibold leading-snug ${todo.status === "completed" ? "text-gray-400 line-through" : "text-(--text-strong)"}`}
                              >
                                {todo.title}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${getPriorityClasses(todo.priority)}`}
                              >
                                {todo.priority}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${getStatusClasses(todo.status)}`}
                              >
                                {todo.status}
                              </span>
                            </div>

                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                              {hasDescription && (
                                <p className="truncate text-xs text-(--text-soft) max-w-xs">
                                  {todo.description}
                                </p>
                              )}
                              {hasDescription &&
                                (hasDueDate || hasSubtasks) && (
                                  <span className="text-gray-200 text-[10px]">
                                    ·
                                  </span>
                                )}
                              {hasDueDate && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-(--text-soft)">
                                  <Calendar className="h-3 w-3 text-(--text-faint)" />
                                  {formatDateLabel(todo.due_date)}
                                </span>
                              )}
                              {hasSubtasks && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(todo.id)}
                                  className="inline-flex items-center gap-1.5 text-[11px] text-(--text-soft) hover:text-(--brand) transition-colors cursor-pointer"
                                >
                                  <span className="inline-flex items-center gap-1">
                                    <span className="inline-block h-1 w-12 overflow-hidden rounded-full bg-gray-100">
                                      <span
                                        className="block h-full rounded-full bg-(--brand) transition-all"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </span>
                                    <span className="font-bold text-[10px]">
                                      {
                                        todo.subtasks.filter(
                                          (s) => s.is_completed,
                                        ).length
                                      }
                                      /{todo.subtasks.length}
                                    </span>
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-3 w-3 text-(--text-faint)" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 text-(--text-faint)" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => openEditModal(todo)}
                              className="rounded p-1 text-(--text-soft) transition hover:bg-(--brand-soft) hover:text-(--brand) cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => flipTodoArchive(todo.id)}
                              className="rounded p-1 text-(--text-soft) transition hover:bg-gray-100 hover:text-slate-700 cursor-pointer"
                              title="Archive"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTodo(todo.id)}
                              className="rounded p-1 text-(--text-soft) transition hover:bg-rose-50 hover:text-rose-500 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {hasSubtasks && isExpanded && (
                          <div className="mx-4 mb-3 overflow-hidden rounded-xl border border-(--border-soft) bg-(--bg-subtle)/20">
                            <div className="flex items-center justify-between border-b border-(--border-soft) px-3 py-1.5">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-(--text-soft)">
                                Subtasks
                              </span>
                              <span className="text-[10px] font-semibold text-(--text-soft)">
                                {
                                  todo.subtasks.filter((s) => s.is_completed)
                                    .length
                                }{" "}
                                of {todo.subtasks.length} done
                              </span>
                            </div>

                            <div className="divide-y divide-(--border-soft)/50 bg-white">
                              {todo.subtasks.map((subtask, index) => (
                                <button
                                  key={subtask.id || `${todo.id}-${index}`}
                                  type="button"
                                  onClick={() =>
                                    handleSubtaskToggle(todo, index)
                                  }
                                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-(--bg-subtle)/20 cursor-pointer"
                                >
                                  <span className="w-4 shrink-0 text-center text-[10px] font-bold text-gray-300 select-none">
                                    {index + 1}
                                  </span>
                                  {subtask.is_completed ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                  ) : (
                                    <Circle className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                                  )}
                                  <span
                                    className={`flex-1 text-[12px] font-medium ${subtask.is_completed ? "text-gray-400 line-through" : "text-(--text-strong)"}`}
                                  >
                                    {subtask.title}
                                  </span>
                                  <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${subtask.is_completed ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                                  >
                                    {subtask.is_completed ? "Done" : "Pending"}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={todo.id}
                      className="app-panel p-4 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${getStatusClasses(todo.status)}`}
                            >
                              {todo.status}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${getPriorityClasses(todo.priority)}`}
                            >
                              {todo.priority}
                            </span>
                            {hasDueDate && (
                              <span className="inline-flex items-center rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 ring-1 ring-sky-100">
                                {formatDateLabel(todo.due_date)}
                              </span>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-1 bg-white border border-(--border-soft) rounded-lg p-0.5 shadow-3xs">
                            <button
                              type="button"
                              onClick={() => openEditModal(todo)}
                              className="rounded p-1 text-(--text-soft) hover:bg-(--brand-soft) hover:text-(--brand) cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => flipTodoArchive(todo.id)}
                              className="rounded p-1 text-(--text-soft) hover:bg-gray-100 hover:text-slate-700 cursor-pointer"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTodo(todo.id)}
                              className="rounded p-1 text-(--text-soft) hover:bg-rose-50 hover:text-rose-500 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-sm font-bold text-(--text-strong)">
                          {todo.title}
                        </h3>
                        {hasDescription && (
                          <p className="mt-1 line-clamp-3 text-xs text-(--text-soft) leading-relaxed">
                            {todo.description}
                          </p>
                        )}
                      </div>

                      {hasSubtasks && (
                        <div className="mt-3">
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-(--text-soft) font-bold mb-1.5">
                            <div>{todo.subtasks.length} subtasks</div>
                            <div>{progress}% done</div>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="mt-3 space-y-1.5">
                            {todo.subtasks.map((subtask, index) => (
                              <button
                                key={subtask.id || `${todo.id}-${index}`}
                                type="button"
                                onClick={() => handleSubtaskToggle(todo, index)}
                                className="flex w-full items-center justify-between rounded-lg border border-(--border-soft) bg-gray-50 px-2.5 py-1.5 text-left transition hover:border-(--brand) hover:bg-(--brand-soft) cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {subtask.is_completed ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                  ) : (
                                    <Circle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                                  )}
                                  <span
                                    className={`text-xs truncate ${subtask.is_completed ? "text-gray-400 line-through" : "text-(--text-strong) font-medium"}`}
                                  >
                                    {subtask.title}
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 shrink-0">
                                  {subtask.is_completed ? "Done" : "Pending"}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {!hasSubtasks ? (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => flipTodoStatus(todo.id)}
                            className={`app-btn-primary py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-none min-h-8.5 w-full justify-center ${todo.status === "completed" ? "bg-slate-800 text-white" : ""}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {todo.status === "completed"
                              ? "Mark Pending"
                              : "Mark Complete"}
                          </button>
                        </div>
                      ) : todo.status !== "completed" ? (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => flipTodoStatus(todo.id)}
                            className="app-btn-primary py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-none min-h-8.5 w-full justify-center"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Mark All Complete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="app-panel border-dashed border-2 border-gray-300 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-(--text-soft) border border-gray-100">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-(--text-strong)">
            No todos found
          </h3>
          <p className="mt-1.5 text-xs text-(--text-soft) max-w-sm mx-auto leading-relaxed">
            Create your first item or adjust the filters to bring tasks back
            into view.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 app-btn-primary inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Todo
          </button>
        </div>
      )}

      {isModalOpen ? (
        <div className="app-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="app-modal flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-(--border-soft) px-6 py-4">
              <div>
                <h2 className="modal-title">
                  {editingTodo ? "Edit Todo" : "Create Todo"}
                </h2>
                <p className="modal-subtitle mt-0.5">
                  Keep it simple: title, priority, due date, and subtasks.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 hover:bg-(--bg-subtle) rounded-xl text-(--text-soft) transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="modal-label mb-1.5 block">Title</span>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        handleFormChange("title", event.target.value)
                      }
                      placeholder="Write the todo title"
                      className="w-full app-input text-sm"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="modal-label mb-1.5 block">Priority</span>
                    <select
                      value={form.priority}
                      onChange={(event) =>
                        handleFormChange("priority", event.target.value)
                      }
                      className="w-full app-input text-sm"
                    >
                      {TODO_PRIORITIES.filter(
                        (option) => option.value !== "all",
                      ).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="modal-label mb-1.5 block">Due Date</span>
                    <input
                      type="datetime-local"
                      value={form.due_date}
                      onChange={(event) =>
                        handleFormChange("due_date", event.target.value)
                      }
                      className="w-full app-input text-sm"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="modal-label mb-1.5 block">
                      Description
                    </span>
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        handleFormChange("description", event.target.value)
                      }
                      rows={3}
                      placeholder="Add context for the task"
                      className="w-full app-input text-sm resize-none"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between border-t border-(--border-soft)/50 pt-4">
                    <div>
                      <h3 className="text-sm font-bold text-(--text-strong)">
                        Subtasks
                      </h3>
                      <p className="text-xs text-(--text-soft)">
                        Break the work into smaller steps.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addSubtask}
                      className="app-btn-secondary py-1.5 px-3 min-h-9 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add Subtask
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.subtasks.map((subtask, index) => (
                      <div
                        key={subtask.id || index}
                        className="flex items-center gap-3 rounded-xl border border-(--border-soft) bg-gray-50 px-3 py-2"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleSubtaskChange(
                              index,
                              "is_completed",
                              !subtask.is_completed,
                            )
                          }
                          className="text-(--text-soft) hover:text-(--brand) cursor-pointer"
                        >
                          {subtask.is_completed ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                          ) : (
                            <Circle className="h-4.5 w-4.5" />
                          )}
                        </button>
                        <input
                          type="text"
                          value={subtask.title}
                          onChange={(event) =>
                            handleSubtaskChange(
                              index,
                              "title",
                              event.target.value,
                            )
                          }
                          placeholder={`Subtask ${index + 1}`}
                          className="w-full bg-transparent text-sm text-(--text-strong) outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubtask(index)}
                          className="p-1 hover:bg-rose-50 text-rose-500 rounded transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-(--border-soft) px-6 py-4 bg-gray-50/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="app-btn-secondary px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="app-btn-primary px-5 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingTodo
                      ? "Update Todo"
                      : "Create Todo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ToDoList;
