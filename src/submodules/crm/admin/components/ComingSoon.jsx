import React from "react";
import { Construction } from "lucide-react";

const ComingSoon = ({ title }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center size-full min-h-[70vh] text-center py-12">
      <div className="bg-(--brand-soft) p-6 rounded-full mb-6 border border-(--border-soft)">
        <Construction className="text-(--brand) size-12" />
      </div>
      <h1 className="text-3xl font-bold text-(--text-strong) mb-2">{title}</h1>
      <p className="text-(--text-faint) max-w-md">
        We're working hard to bring you the <strong>{title}</strong> module.
        Stay tuned for updates!
      </p>
    </div>
  );
};

export default ComingSoon;
