import { createPortal } from "react-dom";
import { useRef, useState } from "react";

const ActionIconButton = ({ icon, label, onClick, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const localRef = useRef(null);
  const IconComponent = icon;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (localRef.current) {
      const rect = localRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  };

  return (
    <>
      <button
        ref={localRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className={className}
        aria-label={label}
        type="button"
      >
        <IconComponent className="size-4" />
      </button>

      {isHovered &&
        createPortal(
          <div
            className="app-floating fixed text-[12px] font-medium rounded-xl px-2.5 py-1.5 whitespace-nowrap z-9999 pointer-events-none text-(--text-strong) before:absolute before:left-1/2 before:-translate-x-1/2 before:top-full before:border-x-[5px] before:border-x-transparent before:border-t-[5px] before:border-t-(--border-soft) after:absolute after:left-1/2 after:-translate-x-1/2 after:top-[calc(100%-1px)] after:border-x-4 after:border-x-transparent after:border-t-4 after:border-t-(--bg-panel-strong)"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ActionIconButton;
