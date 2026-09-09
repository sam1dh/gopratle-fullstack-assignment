"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PlaceSuggestion } from "@gopratle/contracts";
import { fetchPlaceSuggestions } from "../../lib/places-client";

interface LocationAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function LocationAutocomplete({
  id,
  value,
  onChange,
  placeholder,
  icon,
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [highlight, setHighlight] = useState(-1);
  const [loading, setLoading] = useState(false);
  const listId = useId();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    if (value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const results = await fetchPlaceSuggestions(value.trim(), "en", controller.signal);
        setSuggestions(results);
        setHighlight(-1);
        setOpen(results.length > 0);
      } catch {
        // Backend down or unconfigured: stay a plain text input.
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const choose = (s: PlaceSuggestion) => {
    onChange(s.text);
    setOpen(false);
    setSuggestions([]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setOpen(true);
        setHighlight(0);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setHighlight((h) => (h + 1) % suggestions.length);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
      e.preventDefault();
    } else if (e.key === "Enter" && highlight >= 0 && suggestions[highlight]) {
      choose(suggestions[highlight]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-[13px] w-[17px] h-[17px] text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={highlight >= 0 ? `${listId}-${highlight}` : undefined}
          aria-autocomplete="list"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          className="w-full h-[47px] border border-border-strong rounded-[var(--radius)] bg-white text-[15px] text-foreground pl-[41px] pr-[14px] placeholder:text-[#a6adbf] transition-[border-color,box-shadow] duration-150 hover:border-[#b9c1d2] focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)]"
        />
        {loading && (
          <span
            className="absolute right-[13px] w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
            aria-hidden="true"
          />
        )}
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white shadow-[var(--shadow-md)]">
          <ul id={listId} role="listbox" aria-label="Location suggestions" className="max-h-[240px] overflow-auto py-1.5">
            {suggestions.map((s, i) => (
              <li key={s.placeId} role="option" id={`${listId}-${i}`} aria-selected={i === highlight}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(s);
                  }}
                  onMouseEnter={() => setHighlight(i)}
                  className={`flex w-full flex-col gap-[1px] px-[14px] py-2 text-left transition-colors ${
                    i === highlight ? "bg-primary-soft" : "bg-white"
                  }`}
                >
                  <span className="text-[14px] font-semibold text-foreground">
                    {s.mainText || s.text}
                  </span>
                  {s.secondaryText && (
                    <span className="text-[12.5px] text-muted-foreground">{s.secondaryText}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <p className="border-t border-border px-[14px] py-1.5 text-[11px] text-muted-foreground">
            Powered by Google
          </p>
        </div>
      )}
    </div>
  );
}
