import React from 'react';
import { X } from 'lucide-react';

// Button
export function Button({ children, variant = 'default', size = 'default', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-sm';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-none',
    outline: 'border border-border bg-card hover:bg-muted hover:border-primary/30 shadow-none',
    ghost: 'hover:bg-muted shadow-none',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20',
    accent: 'bg-accent text-white hover:bg-accent/90 shadow-accent/20',
  };
  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Input
export function Input({ className = '', ...props }) {
  return (
    <input
      className={`flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

// Select
export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// Label
export function Label({ children, className = '' }) {
  return <label className={`text-sm font-medium leading-none text-foreground ${className}`}>{children}</label>;
}

// Card
export function Card({ children, className = '' }) {
  return <div className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm animate-fade-in ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = '' }) {
  return <div className={`p-5 pb-3 ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-base font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}
export function CardContent({ children, className = '' }) {
  return <div className={`p-5 pt-3 ${className}`}>{children}</div>;
}

// Dialog/Modal
export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-xl border border-border shadow-2xl mx-4">
        {children}
      </div>
    </div>
  );
}
export function DialogHeader({ children }) {
  return (
    <div className="flex items-center justify-between p-5 pb-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
      {children}
    </div>
  );
}
export function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold" style={{ color: 'hsl(160 45% 22%)' }}>{children}</h2>;
}
export function DialogContent({ children }) {
  return <div className="p-5 space-y-4">{children}</div>;
}
export function DialogClose({ onClose }) {
  return (
    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
      <X className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}

// Table
export function Table({ children, className = '' }) {
  return <div className={`w-full overflow-x-auto ${className}`}><table className="w-full text-sm">{children}</table></div>;
}
export function TableHeader({ children }) {
  return (
    <thead className="bg-muted/50">
      {children}
    </thead>
  );
}
export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}
export function TableRow({ children, className = '' }) {
  return <tr className={`border-b border-border/50 hover:bg-primary/5 transition-colors duration-150 ${className}`}>{children}</tr>;
}
export function TableHead({ children, className = '' }) {
  return <th className={`h-11 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider ${className}`}>{children}</th>;
}
export function TableCell({ children, className = '' }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

// Badge
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    destructive: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    outline: 'ring-1 ring-border text-foreground',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Stat Card - muito mais bonito
export function StatCard({ icon: Icon, label, value, subtitle, accent = false }) {
  return (
    <Card className={`overflow-hidden ${accent ? 'ring-1 ring-accent/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold tracking-tight" style={accent ? { color: 'hsl(42 85% 55%)' } : { color: 'hsl(160 45% 22%)' }}>
              {value}
            </p>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`p-2.5 rounded-xl ${accent ? 'bg-accent/15' : 'bg-primary/10'}`}>
              <Icon className={`w-4 h-4 ${accent ? 'text-accent' : 'text-primary'}`} strokeWidth={2.5} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Spinner
export function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

// Empty state
export function EmptyState({ message = 'Nenhum registro encontrado' }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}

// Confirm Delete Dialog
export function ConfirmDelete({ open, onClose, onConfirm, label = '' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card rounded-xl border border-border shadow-2xl p-6 max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-destructive/10">
            <X className="w-4 h-4 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Confirmar exclusão</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5 pl-11">
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
