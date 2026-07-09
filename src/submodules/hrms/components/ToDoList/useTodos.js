import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  toggleTodoArchive,
  toggleTodoStatus,
  updateTodo,
} from "./todoApi";

export default function useTodos({ companyId, companySlug, createdBy }) {
  const [todos, setTodos] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    dueDate: "",
    sort: "newest",
    archived: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTodos = useCallback(async () => {
    if (!companyId && !companySlug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await fetchTodos({
        company_id: companyId,
        company_slug: companySlug,
        created_by: createdBy,
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        due_date: filters.dueDate,
        sort: filters.sort,
        archived: filters.archived,
      });

      setTodos(data);
    } catch (err) {
      console.error(err);
      setError("Could not load todos right now.");
    } finally {
      setLoading(false);
    }
  }, [companyId, companySlug, createdBy, filters]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const saveTodo = useCallback(
    async (form, todoId = null, extra = {}) => {
      try {
        setSaving(true);
        setError("");

        const payload = {
          company_id: companyId,
          company_slug: companySlug,
          created_by: createdBy,
          title: form.title,
          description: form.description,
          priority: form.priority,
          due_date: form.due_date || null,
          status: extra.status || form.status || "pending",
          is_archived: extra.is_archived ?? form.is_archived ?? false,
          subtasks: form.subtasks || [],
        };

        if (todoId) {
          await updateTodo(todoId, payload);
        } else {
          await createTodo(payload);
        }

        await loadTodos();
        return { success: true };
      } catch (err) {
        console.error(err);
        setError("We could not save that todo.");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [companyId, companySlug, createdBy, loadTodos],
  );

  const removeTodo = useCallback(
    async (todoId) => {
      try {
        setSaving(true);
        await deleteTodo(todoId, createdBy);
        await loadTodos();
      } catch (err) {
        console.error(err);
        setError("We could not delete that todo.");
      } finally {
        setSaving(false);
      }
    },
    [createdBy, loadTodos],
  );

  const flipTodoStatus = useCallback(
    async (todoId) => {
      try {
        setSaving(true);
        await toggleTodoStatus(todoId, createdBy);
        await loadTodos();
      } catch (err) {
        console.error(err);
        setError("We could not update the todo status.");
      } finally {
        setSaving(false);
      }
    },
    [createdBy, loadTodos],
  );

  const flipTodoArchive = useCallback(
    async (todoId) => {
      try {
        setSaving(true);
        await toggleTodoArchive(todoId, createdBy);
        await loadTodos();
      } catch (err) {
        console.error(err);
        setError("We could not update the archive state.");
      } finally {
        setSaving(false);
      }
    },
    [createdBy, loadTodos],
  );

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(
      (todo) => todo.status === "completed",
    ).length;
    const pending = total - completed;
    const highPriority = todos.filter(
      (todo) => todo.priority === "high",
    ).length;

    return { total, completed, pending, highPriority };
  }, [todos]);

  return {
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
  };
}
