"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function DropdownSelect({ options, value, onChange, placeholder = "Select...", style }: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", ...style }}>
      <button
        type="button"
        className="url-input"
        style={{
          width: "100%",
          padding: "12px",
          background: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          textAlign: "left",
          border: isOpen ? "1px solid var(--indigo)" : "1px solid var(--border)",
          outline: "none"
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: selectedOption ? "inherit" : "var(--text-muted)" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} style={{ color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto",
            padding: "6px"
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              style={{
                width: "100%",
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: option.value === value ? "var(--bg-secondary)" : "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
                color: "var(--text-primary)"
              }}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => {
                  if (option.value !== value) {
                      e.currentTarget.style.background = "var(--bg-secondary)";
                  }
              }}
              onMouseLeave={(e) => {
                  if (option.value !== value) {
                      e.currentTarget.style.background = "transparent";
                  }
              }}
            >
              <span style={{ fontWeight: option.value === value ? 600 : 400 }}>{option.label}</span>
              {option.value === value && <Check size={14} color="var(--indigo)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
