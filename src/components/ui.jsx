import React from 'react';
import { X } from 'lucide-react';

export function Button({ children, variant = 'default', size = 'default', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  const variants = {
    default: 'bg-[#15803d] text-white hover:bg-[#16a34a]',
    secondary: 'bg-[#f6f5f3] text-[#12211c] hover:bg-[#e8e6e3]',
    outline: 'border border-[#d1d5db] bg-white text-[#677e77] hover:bg-[#f6f5f3]',
    ghost: 'text-[#677e77] hover:bg-[#f6f5f3]',
    destructive: 'bg-[#dc2626] text-white hover:bg-[#ef4444]',
    accent: 'bg-[#b8860b] text-white hover:bg-[#a67c00]',
  };
  const sizes = {
    default: 'h-9 px-4 text-sm',
    sm: 'h-7 px-3 text-xs',
    lg: 'h-10 px-6 text-sm',
    icon: 'h-9 w-9',
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

export function Input({ className = '', ...props }) {
  return <input className={`h-10 w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#12211c] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#15803d] focus:border-[#15803d] disabled:opacity-50 ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return <select className={`h-10 w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#12211c] focus:outline-none focus:ring-1 focus:ring-[#15803d] focus:border-[#15803d] disabled:opacity-50 ${className}`} {...props}>{children}</select>;
}

export function Label({ children, className = '' }) {
  return <label className={`text-sm font-medium text-[#12211c] ${className}`}>{children}</label>;
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-md border border-[#e5e7eb] bg-white shadow-sm ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-sm font-semibold text-[#12211c] ${className}`}>{children}</h3>;
}
export function CardContent({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl mx-4 border border-[#e5e7eb]">
        {children}
      </div>
    </div>
  );
}
export function DialogHeader({ children }) {
  return <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">{children}</div>;
}
export function DialogTitle({ children }) {
  return <h2 className="text-sm font-semibold text-[#12211c]">{children}</h2>;
}
export function DialogContent({ children }) {
  return <div className="px-5 py-4 space-y-4">{children}</div>;
}
export function DialogClose({ onClose }) {
  return <button onClick={onClose} className="p-1 rounded hover:bg-[#f6f5f3]"><X className="w-4 h-4 text-[#677e77]" /></button>;
}

export function Table({ children, className = '' }) {
  return <div className={`overflow-x-auto ${className}`}><table className="w-full">{children}</table></div>;
}
export function TableHeader({ children }) {
  return <thead className="bg-[#f6f5f3]">{children}</thead>;
}
export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}
export function TableRow({ children, className = '' }) {
  return <tr className={`border-b border-[#e5e7eb] hover:bg-[#f0fdf4] ${className}`}>{children}</tr>;
}
export function TableHead({ children, className = '' }) {
  return <th className={`px-4 py-3 text-left text-xs font-medium text-[#677e77] uppercase tracking-wider ${className}`}>{children}</th>;
}
export function TableCell({ children, className = '' }) {
  return <td className={`px-4 py-3 text-sm text-[#12211c] ${className}`}>{children}</td>;
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#f0fdf4] text-[#15803d]',
    secondary: 'bg-[#f6f5f3] text-[#677e77]',
    success: 'bg-[#f0fdf4] text-[#15803d]',
    warning: 'bg-[#fefce8] text-[#b8860b]',
    destructive: 'bg-[#fef2f2] text-[#dc2626]',
    outline: 'border border-[#e5e7eb] text-[#677e77]',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
}

export function StatCard({ icon: Icon, label, value, subtitle, accent = false }) {
  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-sm p-4">
      <p className="text-xs text-[#677e77] font-medium mb-1">{label}</p>
      <p className={`text-lg font-semibold ${accent ? 'text-[#b8860b]' : 'text-[#12211c]'}`}>{value}</p>
      {subtitle && <p className="text-xs text-[#9ca3af] mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function Spinner() {
  return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#e5e7eb] border-t-[#15803d] rounded-full animate-spin" /></div>;
}

export function EmptyState({ message = 'Nenhum registro encontrado' }) {
  return <div className="text-center py-12 text-[#9ca3af] text-sm">{message}</div>;
}

export function ConfirmDelete({ open, onClose, onConfirm, label = '' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-lg shadow-xl p-5 max-w-sm mx-4 border border-[#e5e7eb]">
        <h3 className="text-sm font-semibold text-[#12211c] mb-2">Confirmar exclusão</h3>
        <p className="text-sm text-[#677e77] mb-4">Tem certeza que deseja excluir{label ? ` "${label}"` : ''}? Esta ação não pode ser desfeita.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Excluir</Button>
        </div>
      </div>
    </div>
  );
}
