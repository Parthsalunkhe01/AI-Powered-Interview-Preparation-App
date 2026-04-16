import React, { useState, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const TagInput = ({
  tags,
  onChange,
  placeholder = "Type and press Enter…",
  disabled = false,
  variant = "amber",
  error,
  inputRef: externalRef,
}) => {
  const [inputValue, setInputValue] = useState("");
  const internalRef = useRef(null);
  const ref = externalRef || internalRef;

  const addTag = (value) => {
    const trimmed = value.trim().replace(/,$/, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "flex min-h-[48px] w-full flex-wrap gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm transition-all duration-300",
          "focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 focus-within:ring-offset-0",
          disabled && "cursor-not-allowed opacity-50 shadow-inner",
          error ? "border-rose-500" : "border-white/10"
        )}
        onClick={() => ref.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-[11px] font-bold transition-all shadow-sm",
              variant === "amber"
                ? "bg-amber text-amber-foreground"
                : variant === "premium"
                  ? "bg-white/10 border border-white/10 text-white hover:bg-white/15"
                  : "border border-border bg-secondary text-secondary-foreground"
            )}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="ml-1 rounded-full p-0.5 hover:bg-white/20 transition-all text-white/60 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {!disabled && (
          <input
            ref={ref}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="min-w-[140px] flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            disabled={disabled}
          />
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default TagInput;