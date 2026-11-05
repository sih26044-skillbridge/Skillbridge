import React from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

export const SkillBadge = ({
  name,
  category,
  variant = 'default', // 'default' | 'matched' | 'missing' | 'removable'
  onRemove,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const variantStyles = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    matched: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    missing: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    removable: 'bg-blue-50 text-blue-700 border-blue-200 pr-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses[size] || sizeClasses.md} ${
        variantStyles[variant] || variantStyles.default
      } transition-colors`}
    >
      {variant === 'matched' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
      {variant === 'missing' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
      <span>{name}</span>
      {variant === 'removable' && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-full p-0.5 hover:bg-blue-200 text-blue-600 hover:text-blue-900 focus:outline-none"
          title={`Remove ${name}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
};
