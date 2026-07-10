import React, { useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import MyTask from "./Mytask";
import AssignTask from "./AssignTask";
import ToDoList from "../../components/ToDoList/ToDoList";
import { ClipboardList, ClipboardCheck, ListTodo } from "lucide-react";

import { usePermission } from "../../../../hooks/usePermission";

const TaskTabs = () => {
  const [activeTab, setActiveTab] = useState("my-task");
  const { user } = useAuth();
  const { hasAccess } = usePermission();

  const canAssignTask = hasAccess("hrms.self_service.tasks.assign");

  const tabs = [
    {
      id: "my-task",
      label: "My Task",
      icon: ClipboardList,
      component: <MyTask />,
    },
    ...(canAssignTask
      ? [
          {
            id: "assign-task",
            label: "Assign Task",
            icon: ClipboardCheck,
            description: "Assign new tasks to team members",
            component: <AssignTask />,
          },
        ]
      : []),
    {
      id: "todo-list",
      label: "To Do List",
      icon: ListTodo,
      description: "Keep track of your personal checklists",
      component: <ToDoList />,
    },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="w-full font-sans">

      <div className="mb-6 flex justify-center">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-bold tracking-[-0.02em] transition-all duration-200 sm:px-4 ${
                  isActive
                    ? "border-transparent text-white shadow-[0_14px_28px_rgba(0,166,81,0.18)]"
                    : "border-(--border-soft) bg-white/88 text-(--text-body) hover:border-(--border-strong) hover:bg-white hover:text-(--brand)"
                }`}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(135deg, var(--brand), #00c853)",
                      }
                    : undefined
                }
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    isActive
                      ? "border border-white/10 bg-white/16 text-white"
                      : "bg-(--bg-subtle) text-(--text-soft)"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>


      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="w-full"
          >
            {activeTabData?.component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskTabs;