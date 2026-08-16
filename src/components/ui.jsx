import React from 'react';
import { X } from 'lucide-react';

export function Button({ children, variant = 'default', size = 'default', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  const variants = {
    default: 'bg-green-600 text-white hover:bg-green-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    accent: 'bg-amber-600 text-white hover:bg-amber-700',
  };
  const sizes = {
    default: 'h-9 px-4 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-6 text-sm',
    icon: 'h-9 w-9',
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

export function Input({ className = '', ...props }) {
  return <input className={`h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 disabled:opacity-50 ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return <select className={`h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 disabled:opacity-50 ${className}`} {...props}>{children}</select>;
}

export function Label({ children, className = '' }) {
  return <label className={`text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-lg border border-gray-200 bg-white ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-sm font-semibold text-gray-900 ${className}`}>{children}</h3>;
}
export function CardContent({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl mx-4">
        {children}
      </div>
    </div>
  );
}
export function DialogHeader({ children }) {
  return <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">{children}</div>;
}
export function DialogTitle({ children }) {
  return <h2 className="text-base font-semibold text-gray-900">{children}</h2>;
}
export function DialogContent({ children }) {
  return <div className="p-6 space-y-5">{children}</div>;
}
export function DialogClose({ onClose }) {
  return <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>;
}

export function Table({ children, className = '' }) {
  return <div className={`overflow-x-auto ${className}`}><table className="w-full">{children}</table></div>;
}
export function TableHeader({ children }) {
  return <thead>{children}</thead>;
}
export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}
export function TableRow({ children, className = '' }) {
  return <tr className={`border-b border-gray-100 hover:bg-gray-50 ${className}`}>{children}</tr>;
}
export function TableHead({ children, className = '' }) {
  return <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>{children}</th>;
}
export function TableCell({ children, className = '' }) {
  return <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>;
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-green-50 text-green-700',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    destructive: 'bg-red-50 text-red-700',
    outline: 'border border-gray-200 text-gray-600',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
}

export function StatCard({ icon: Icon, label, value, subtitle, accent = false }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-xl font-semibold ${accent ? 'text-amber-600' : 'text-gray-900'}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function Spinner() {
  return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin" /></div>;
}

export function EmptyState({ message = 'Nenhum registro encontrado' }) {
  return <div className="text-center py-12 text-gray-400 text-sm">{message}</div>;
}

export function ConfirmDelete({ open, onClose, onConfirm, label = '' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Confirmar exclusão</h3>
        <p className="text-sm text-gray-500 mb-5">Tem certeza que deseja excluir{label ? ` "${label}"` : ''}? Esta ação não pode ser desfeita.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Excluir</Button>
        </div>
      </div>
    </div>
  );
}
