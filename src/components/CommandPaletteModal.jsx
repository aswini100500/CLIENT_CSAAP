import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Command,
  CornerDownLeft,
  CreditCard,
  ArrowDownLeft,
  ShoppingCart,
  Tag,
  BookOpen,
  Repeat,
  FileMinus,
  FilePlus,
  ListFilter,
  UserPlus,
  Users,
  FolderPlus,
  FolderTree,
  Calendar,
  Scale,
  Receipt,
  BarChart3,
  FileCheck,
  Building2,
  Banknote,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { ALL_COMMANDS } from "../config/commandRegistry";

const ICON_MAP = {
  CreditCard,
  ArrowDownLeft,
  ShoppingCart,
  Tag,
  BookOpen,
  Repeat,
  FileMinus,
  FilePlus,
  ListFilter,
  UserPlus,
  Users,
  FolderPlus,
  FolderTree,
  Calendar,
  Scale,
  Receipt,
  BarChart3,
  FileCheck,
  Building2,
  Banknote,
  LayoutDashboard,
};

const CATEGORIES = [
  "All",
  "Vouchers",
  "Registers",
  "Masters",
  "Reports",
  "Banking",
];

const CommandPaletteModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setActiveCategory("All");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  const filteredCommands = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    let baseList = ALL_COMMANDS;
    if (activeCategory !== "All") {
      baseList = ALL_COMMANDS.filter(
        (cmd) => cmd.category.toLowerCase() === activeCategory.toLowerCase(),
      );
    }

    if (!query) {
      return baseList.map((cmd) => ({
        ...cmd,
        isShortcutMatch: false,
      }));
    }

    const shortcutMatches = [];
    const titleMatches = [];

    baseList.forEach((cmd) => {
      const shortcut = cmd.shortcut?.toLowerCase();
      const title = cmd.title.toLowerCase();
      const category = cmd.category.toLowerCase();
      const keywords = (cmd.defaultKeywords || []).map((k) => k.toLowerCase());

      if (shortcut && (shortcut === query || shortcut.startsWith(query))) {
        shortcutMatches.push({
          ...cmd,
          isShortcutMatch: true,
        });
      } else if (
        title.includes(query) ||
        category.includes(query) ||
        keywords.some((kw) => kw.includes(query))
      ) {
        titleMatches.push({
          ...cmd,
          isShortcutMatch: false,
        });
      }
    });

    return [...shortcutMatches, ...titleMatches];
  }, [searchTerm, activeCategory]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, activeCategory]);

  useEffect(() => {
    if (resultsRef.current && resultsRef.current.children[selectedIndex]) {
      resultsRef.current.children[selectedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  const executeCommand = (cmd, isNewTab = false) => {
    if (!cmd || !cmd.path) return;
    onClose();
    if (isNewTab) {
      window.open(cmd.path, "_blank");
    } else {
      navigate(cmd.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        setSelectedIndex(
          (prev) =>
            (prev - 1 + filteredCommands.length) % filteredCommands.length,
        );
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const currentIdx = CATEGORIES.indexOf(activeCategory);
      const prevIdx = (currentIdx - 1 + CATEGORIES.length) % CATEGORIES.length;
      setActiveCategory(CATEGORIES[prevIdx]);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const currentIdx = CATEGORIES.indexOf(activeCategory);
      const nextIdx = (currentIdx + 1) % CATEGORIES.length;
      setActiveCategory(CATEGORIES[nextIdx]);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands.length > 0 && filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex], e.ctrlKey || e.metaKey);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-20 px-4 bg-slate-900/40 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#e2f2e9] overflow-hidden flex flex-col max-h-[80vh] transition-all duration-200"
        style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="relative flex items-center px-4 py-3.5 border-b border-[#e2f2e9] bg-[#f8faf8]">
          <Search className="size-5  text-[#00a651] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-[#042f2e] placeholder-[#94a3b8] text-base font-semibold outline-none"
            placeholder="Search accounting pages or type a shortcut (e.g. adpv, adrv, trbl)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs font-bold text-[#475569] hover:text-[#042f2e] bg-[#e2f2e9] hover:bg-[#c6f1d6] px-2 py-0.5 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-1.5 px-4 py-2.5 bg-[#f8faf8] border-b border-[#e2f2e9]">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-[#00a651] text-white shadow-2xs"
                    : "text-[#475569] hover:text-[#042f2e] hover:bg-[#e2f2e9]/70"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div
          className="flex-1 overflow-y-auto p-2 bg-white space-y-1"
          ref={resultsRef}
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center">
              <div className="size-12 rounded-2xl bg-[#ecfdf5] border border-[#e2f2e9] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="size-6  text-[#00a651]" />
              </div>
              <p className="text-sm font-bold text-[#042f2e]">
                No matching command found
              </p>
              <p className="text-xs font-medium text-[#475569] mt-1">
                Try searching for a voucher name, ledger, or shortcut code like
                adpv, adrv, trbl.
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const IconComp = ICON_MAP[cmd.icon] || Command;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 border ${
                    isSelected
                      ? "bg-[#ecfdf5] border-[#c6f1d6] shadow-2xs text-[#042f2e]"
                      : "border-transparent text-[#1e293b] hover:bg-[#f8faf8] hover:border-[#e2f2e9]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isSelected
                          ? "bg-[#00a651] text-white shadow-2xs"
                          : "bg-[#f8faf8] text-[#00a651] border border-[#e2f2e9]"
                      }`}
                    >
                      <IconComp className="size-4 " />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-extrabold text-sm truncate ${isSelected ? "text-[#042f2e]" : "text-[#1e293b]"}`}
                        >
                          {cmd.title}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                            isSelected
                              ? "bg-[#00a651] text-white"
                              : "bg-[#f0fdf4] text-[#008c44] border border-[#c6f1d6]"
                          }`}
                        >
                          {cmd.category}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-medium block truncate mt-0.5 ${
                          isSelected ? "text-[#475569]" : "text-[#94a3b8]"
                        }`}
                      >
                        {cmd.path}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    {cmd.shortcut && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wider rounded-md uppercase font-mono border transition-colors ${
                          cmd.isShortcutMatch
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-[#f0fdf4] text-[#008c44] border-[#c6f1d6]"
                        }`}
                      >
                        {cmd.shortcut}
                      </span>
                    )}

                    {isSelected && (
                      <div className="flex items-center text-xs font-bold gap-1 text-[#00a651]">
                        <CornerDownLeft className="size-3.5 " />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-3 bg-[#f8faf8] border-[#e2f2e9] flex items-center justify-between text-xs font-semibold text-[#475569]">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 bg-white border border-[#e2f2e9] rounded-md shadow-2xs font-mono text-[11px] text-[#042f2e]">
                ↑↓
              </kbd>{" "}
              navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 bg-white border border-[#e2f2e9] rounded-md shadow-2xs font-mono text-[11px] text-[#042f2e]">
                ←→
              </kbd>{" "}
              types
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 bg-white border border-[#e2f2e9] rounded-md shadow-2xs font-mono text-[11px] text-[#042f2e]">
                ↵
              </kbd>{" "}
              open
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 bg-white border border-[#e2f2e9] rounded-md shadow-2xs font-mono text-[11px] text-[#042f2e]">
                Ctrl+↵
              </kbd>{" "}
              new tab
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 bg-white border border-[#e2f2e9] rounded-md shadow-2xs font-mono text-[11px] text-[#042f2e]">
                ESC
              </kbd>{" "}
              exit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPaletteModal;
