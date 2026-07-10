import { useState } from "react";
import MyTask from "./Mytask";
import ToDoList from "../../components/ToDoList/ToDoList";
import AssignTask from "./AssignTask";

const TaskPage = ({ canAssignTask }) => {
  const [activeTab, setActiveTab] = useState("my");

  return (
    <div className="app-shell p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="app-title max-w-3xl">Task Management</h1>
          <p className="app-subtitle mt-1">
            Manage all your team and personal tasks here
          </p>
        </div>

        <div className="flex gap-6 border-b border-(--border-soft) mb-6 pb-px">
          <button
            onClick={() => setActiveTab("my")}
            className={`pb-2 text-sm font-bold transition-all relative ${
              activeTab === "my"
                ? "text-(--brand) border-b-2 border-(--brand)"
                : "text-(--text-soft) hover:text-(--text-strong) border-b-2 border-transparent"
            }`}
          >
            My Task
          </button>

          <button
            onClick={() => setActiveTab("todo")}
            className={`pb-2 text-sm font-bold transition-all relative ${
              activeTab === "todo"
                ? "text-(--brand) border-b-2 border-(--brand)"
                : "text-(--text-soft) hover:text-(--text-strong) border-b-2 border-transparent"
            }`}
          >
            To Do List
          </button>

          {canAssignTask && (
            <button
              onClick={() => setActiveTab("assign")}
              className={`pb-2 text-sm font-bold transition-all relative ${
                activeTab === "assign"
                  ? "text-(--brand) border-b-2 border-(--brand)"
                  : "text-(--text-soft) hover:text-(--text-strong) border-b-2 border-transparent"
              }`}
            >
              Assign Task
            </button>
          )}
        </div>

        <div className="w-full">
          {activeTab === "my" && <MyTask />}
          {activeTab === "todo" && <ToDoList />}
          {activeTab === "assign" && canAssignTask && <AssignTask />}
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
