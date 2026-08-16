import React from 'react';
import { X } from 'lucide-react';

/* ─── Button ─── */
export function Button({ children, variant = 'default', size = 'default', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  const variants = {
    default: 'bg-[#1a5c3d] text-[#faf8f3] hover:bg-[#1f6b47] active:bg-[#155033] shadow-sm',
    secondary: 'bg-[#f0ebe0] text-[#1a2b23] hover:bg-[#e8e1d2]',
    outline: 'border border-[#e5ddd1] bg-white text-[#6b8a7e] hover:bg-[#f0ede7] hover:text-[#12211c]',
    ghost: 'text-[#6b8a7e] hover:bg-[#f0ede7] hover:text-[#12211c]',
    destructive: 'bg-[#dc2626] text-white hover:bg-[#ef4444] shadow-sm',
    accent: 'bg-[#e5a51b] text-[#12211c] hover:bg-[#d49518] shadow-sm',
  };
  const sizes = {
    default: 'h-10 px-5 text-sm',
    sm: 'h-8 px-3.5 text-xs',
    lg: 'h-11 px-6 text-sm',
    icon: 'h-9 w-9',
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

/* ─── Input ─── */
export function Input({ className = '', ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-lg border border-[#e5ddd1] bg-white px-4 py-2.5 text-sm text-[#12211c] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1a5c3d]/20 focus:border-[#1a5c3d] disabled:opacity-50 transition-colors ${className}`}
      {...props}
    />
  );
}

/* ─── Select ─── */
export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`h-10 w-full rounded-lg border border-[#e5ddd1] bg-white px-4 py-2.5 text-sm text-[#12211c] focus:outline-none focus:ring-2 focus:ring-[#1a5c3d]/20 focus:border-[#1a5c3d] disabled:opacity-50 transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

/* ─── Label ─── */
export function Label({ children, className = '' }) {
  return <label className={`text-sm font-medium text-[#12211c] ${className}`}>{children}</label>;
}

/* ─── Card ─── */
export function Card({ children, className = '' }) {
  return <div className={`rounded-xl border border-[#e5ddd1] bg-white shadow-sm ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = '' }) {
  return <div className={`px-7 py-5 ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-base font-semibold text-[#12211c] ${className}`}>{children}</h3>;
}
export function CardContent({ children, className = '' }) {
  return <div className={`px-7 py-5 ${className}`}>{children}</div>;
}

/* ─── Dialog ─── */
export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl mx-4 border border-[#e5ddd1]">
        {children}
      </div>
    </div>
  );
}
export function DialogHeader({ children }) {
  return <div className="flex items-center justify-between px-7 py-5 border-b border-[#e5ddd1]">{children}</div>;
}
export function DialogTitle({ children }) {
  return <h2 className="text-base font-semibold text-[#12211c]">{children}</h2>;
}
export function DialogContent({ children }) {
  return <div className="px-7 py-6 space-y-5">{children}</div>;
}
export function DialogClose({ onClose }) {
  return (
    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0ede7] transition-colors">
      <X className="w-4 h-4 text-[#6b8a7e]" />
    </button>
  );
}

/* ─── Table ─── */
export function Table({ children, className = '' }) {
  return <div className={`overflow-x-auto ${className}`}><table className="w-full">{children}</table></div>;
}
export function TableHeader({ children }) {
  return <thead className="bg-[#f0ede7]">{children}</thead>;
}
export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}
export function TableRow({ children, className = '' }) {
  return <tr className={`border-b border-[#e5ddd1] hover:bg-[#f0fdf4] transition-colors ${className}`}>{children}</tr>;
}
export function TableHead({ children, className = '' }) {
  return <th className={`px-6 py-3.5 text-left text-xs font-semibold text-[#6b8a7e] uppercase tracking-wider ${className}`}>{children}</th>;
}
export function TableCell({ children, className = '' }) {
  return <td className={`px-6 py-3.5 text-sm text-[#12211c] ${className}`}>{children}</td>;
}

/* ─── Badge ─── */
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#f0fdf4] text-[#1a5c3d]',
    secondary: 'bg-[#f0ede7] text-[#6b8a7e]',
    success: 'bg-[#f0fdf4] text-[#1a5c3d]',
    warning: 'bg-[#fefce8] text-[#e5a51b]',
    destructive: 'bg-[#fef2f2] text-[#dc2626]',
    outline: 'border border-[#e5ddd1] text-[#6b8a7e]',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

/* ─── StatCard ─── */
export function StatCard({ icon: Icon, label, value, subtitle, accent = false }) {
  return (
    <div className="bg-white rounded-xl border border-[#e5ddd1] shadow-sm px-6 py-5">
      <p className="text-xs font-medium text-[#6b8a7e] mb-2">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${accent ? 'text-[#e5a51b]' : 'text-[#12211c]'}`}>{value}</p>
      {subtitle && <p className="text-xs text-[#9ca3af] mt-1">{subtitle}</p>}
    </div>
  );
}

/* ─── PageHeader ─── */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#12211c]" style={{ fontFamily: '"Playfair Display", serif' }}>{title}</h1>
        {subtitle && <p className="text-sm text-[#6b8a7e] mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

/* ─── FilterTabs ─── */
export function FilterTabs({ options, active, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-[#f0ede7] rounded-lg w-fit mb-8">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
            active === opt.value
              ? 'bg-white text-[#12211c] shadow-sm'
              : 'text-[#6b8a7e] hover:text-[#12211c]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Spinner ─── */
export function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#e5ddd1] border-t-[#1a5c3d] rounded-full animate-spin" />
    </div>
  );
}

/* ─── EmptyState ─── */
export function EmptyState({ message = 'Nenhum registro encontrado' }) {
  return <div className="text-center py-16 text-[#9ca3af] text-sm">{message}</div>;
}

/* ─── ConfirmDelete ─── */
export function ConfirmDelete({ open, onClose, onConfirm, label = '' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl shadow-2xl p-7 max-w-sm mx-4 border border-[#e5ddd1]">
        <h3 className="text-base font-semibold text-[#12211c] mb-2">Confirmar exclusão</h3>
        <p className="text-sm text-[#6b8a7e] mb-6 leading-relaxed">
          Tem certeza que deseja excluir{label ? ` "${label}"` : ''}? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Excluir</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── TotalBar ─── */
export function TotalBar({ label = 'Total Geral', value }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 rounded-xl bg-[#fefce8] border border-[#fef9c3] mb-8">
      <span className="text-sm font-semibold text-[#e5a51b]">{label}</span>
      <span className="text-xl font-bold text-[#e5a51b]">{value}</span>
    </div>
  );
}
