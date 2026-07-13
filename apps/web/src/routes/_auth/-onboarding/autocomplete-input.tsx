import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AutocompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: readonly string[];
  placeholder?: string;
  autoFocus?: boolean;
  maxSuggestions?: number;
};

function filterSuggestions(query: string, suggestions: readonly string[], maxSuggestions: number) {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) return [];

  return suggestions.filter((item) => item.toLowerCase().includes(normalized)).slice(0, maxSuggestions);
}

export function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  autoFocus,
  maxSuggestions = 6,
}: AutocompleteInputProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const filtered = filterSuggestions(value, suggestions, maxSuggestions);
  const showSuggestions = open && value.trim().length > 0 && filtered.length > 0;

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [value]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        role="combobox"
        aria-expanded={showSuggestions}
        aria-controls={listId}
        aria-autocomplete="list"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!showSuggestions) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((prev) => (prev + 1) % filtered.length);
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
          }

          if (event.key === "Enter" && highlightedIndex >= 0) {
            event.preventDefault();
            const suggestion = filtered[highlightedIndex];
            if (suggestion) selectSuggestion(suggestion);
          }

          if (event.key === "Escape") {
            setOpen(false);
            setHighlightedIndex(-1);
          }
        }}
      />

      {showSuggestions && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-neutral-200 bg-white py-1 shadow-md"
        >
          {filtered.map((suggestion, index) => (
            <li key={suggestion} role="option" aria-selected={highlightedIndex === index}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-primary-100/40",
                  highlightedIndex === index && "bg-primary-100/60",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
