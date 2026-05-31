import { X, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

// ─── Modal ────────────────────────────────────────────────────────────────────
export function AdminModal({
  title,
  onClose,
  children,
  size = "md",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  }[size];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-2 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`relative bg-white dark:bg-surface rounded-2xl shadow-2xl border border-border w-full ${sizeClass} max-h-[95vh] sm:max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-white/95 backdrop-blur z-10 rounded-t-2xl">
          <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="h-9 w-9 rounded-full grid place-items-center hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Modal Actions Footer ─────────────────────────────────────────────────────
export function ModalActions({
  onCancel,
  onSave,
  saving = false,
  saveLabel = "Сохранить",
  danger = false,
}: {
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
  saveLabel?: string;
  danger?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center gap-3 justify-end border-t border-border pt-5">
      <button
        onClick={onCancel}
        className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-surface-2 transition-colors"
      >
        Отмена
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 transition-all ${
          danger
            ? "bg-destructive text-white hover:bg-destructive/90"
            : "btn-gold"
        }`}
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saveLabel}
      </button>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────
export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      className={`bg-input border border-border rounded-xl px-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all ${className}`}
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({
  value,
  onChange,
  rows = 4,
  placeholder,
  mono = false,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`bg-input border border-border rounded-xl px-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-y ${mono ? "font-mono" : ""}`}
    />
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-input border border-border rounded-xl px-4 py-2.5 w-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
    >
      {children}
    </select>
  );
}

// ─── Checkbox Row ─────────────────────────────────────────────────────────────
export function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 text-sm cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`h-5 w-5 rounded-md border-2 grid place-items-center transition-all ${
            checked ? "bg-primary border-primary" : "border-border"
          }`}
        >
          {checked && (
            <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="font-medium text-foreground">{label}</span>
    </label>
  );
}

// ─── Page Title Bar ───────────────────────────────────────────────────────────
export function TitleBar({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  icon: Icon,
  color = "gold",
  pulse = false,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: "gold" | "blue" | "green" | "red";
  pulse?: boolean;
}) {
  const colorMap = {
    gold: "bg-primary/10 text-primary",
    blue: "bg-sky-500/10 text-sky-500",
    green: "bg-emerald-500/10 text-emerald-500",
    red: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="bg-white border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-[0_4px_20px_-4px_oklch(0.82_0.19_85/0.15)] transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className={`h-9 w-9 rounded-xl grid place-items-center ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
          {pulse && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          )}
        </div>
      </div>
      <div className="font-display text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}

// ─── Table Shell ──────────────────────────────────────────────────────────────
export function AdminTable({
  columns,
  children,
  empty,
}: {
  columns: string[];
  children: React.ReactNode;
  empty?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-5 py-3.5">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{children}</tbody>
        </table>
      </div>
      {empty}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-16 flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-2xl bg-surface grid place-items-center text-muted-foreground mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-t border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-surface-2 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-surface-2" />
      <div className="p-5 space-y-2">
        <div className="h-3 bg-surface-2 rounded w-1/4" />
        <div className="h-5 bg-surface-2 rounded w-3/4" />
        <div className="h-3 bg-surface-2 rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  new: { label: "Новая", classes: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25" },
  in_progress: { label: "В работе", classes: "bg-amber-500/15 text-amber-600 border-amber-500/25" },
  done: { label: "Готово", classes: "bg-sky-500/15 text-sky-600 border-sky-500/25" },
  archived: { label: "Архив", classes: "bg-muted/50 text-muted-foreground border-border" },
  rejected: { label: "Отклонена", classes: "bg-red-500/15 text-red-600 border-red-500/25" },
};

export function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? { label: status, classes: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

export function StatusButtons({
  current,
  onSelect,
  loading = false,
}: {
  current: string;
  onSelect: (s: string) => void;
  loading?: boolean;
}) {
  const statuses = Object.entries(STATUS_CONFIG);
  return (
    <div className="flex flex-wrap gap-1">
      {statuses.map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => key !== current && onSelect(key)}
          disabled={loading}
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
            current === key
              ? cfg.classes + " ring-2 ring-offset-1 ring-current"
              : "border-border text-muted-foreground hover:bg-surface-2"
          }`}
        >
          {cfg.label}
        </button>
      ))}
    </div>
  );
}

// ─── Section Divider ──────────────────────────────────────────────────────────
export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Save Banner ──────────────────────────────────────────────────────────────
export function SaveBanner({ saving, error }: { saving: boolean; error?: string }) {
  if (!saving && !error) return null;
  return (
    <div className={`mt-4 rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
      error
        ? "border-destructive/25 bg-destructive/5 text-destructive"
        : "border-primary/25 bg-primary/5 text-foreground"
    }`}>
      {saving && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      {saving ? "Сохранение..." : error}
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
export function ActionBtn({
  onClick,
  icon: Icon,
  label,
  variant = "default",
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`h-8 w-8 rounded-lg grid place-items-center transition-colors ${
        variant === "danger"
          ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
