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
          "flex min-h-[44px] w-full flex-wrap gap-2 rounded-xl border bg-card px-3 py-2.5 text-sm transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
          disabled && "cursor-not-allowed opacity-50",
          error ? "border-destructive" : "border-input"
        )}
        onClick={() => ref.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-medium transition-all",
              variant === "amber"
                ? "bg-amber text-amber-foreground"
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
                className="ml-0.5 rounded-full p-0.5 hover:opacity-70 transition-opacity"
              >
                <X className="h-2.5 w-2.5" />
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
            className="min-w-[120px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={disabled}
          />
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default TagInput;