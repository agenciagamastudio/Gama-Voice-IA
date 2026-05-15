"use client";

import { useEffect, useState } from "react";
import { getAllCatalogDates } from "@/lib/storage";

interface DateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  title?: string;
}

export default function DateSelectorModal({ isOpen, onClose, onSelect, title = "Selecionar Data do Catálogo" }: DateSelectorModalProps) {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const catalogDates = getAllCatalogDates();
      setDates(catalogDates);
      if (catalogDates.length > 0) {
        setSelectedDate(catalogDates[0]);
      }
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedDate) {
      onSelect(selectedDate);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          padding: "24px",
          maxWidth: 400,
          boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text-1)" }}>{title}</h2>

        <div style={{ marginBottom: 24 }}>
          {dates.length === 0 ? (
            <div style={{ color: "var(--text-2)", fontSize: 14, textAlign: "center", padding: "20px" }}>
              Nenhuma data de catálogo disponível
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    background: selectedDate === date ? "var(--primary)" : "var(--bg)",
                    color: selectedDate === date ? "#0a0a0a" : "var(--text-1)",
                    fontWeight: selectedDate === date ? 700 : 500,
                    fontSize: 14,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  📅 {date}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-2)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: selectedDate ? "var(--primary)" : "var(--text-3)",
              color: "#0a0a0a",
              fontWeight: 700,
              fontSize: 13,
              cursor: selectedDate ? "pointer" : "not-allowed",
              opacity: selectedDate ? 1 : 0.5,
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
