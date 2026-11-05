import React from 'react';
import { Sparkles } from 'lucide-react';

export const MatchScoreBadge = ({ score, showBar = false }) => {
  const numScore = typeof score === 'number' ? score : parseFloat(score) || 0;

  // Color scheme based on match percentage
  const getColorClasses = (val) => {
    if (val >= 75) {
      return {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        bar: 'bg-emerald-500',
        text: 'text-emerald-700',
      };
    }
    if (val >= 50) {
      return {
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
        bar: 'bg-blue-500',
        text: 'text-blue-700',
      };
    }
    if (val >= 25) {
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        bar: 'bg-amber-500',
        text: 'text-amber-700',
      };
    }
    return {
      badge: 'bg-slate-100 text-slate-700 border-slate-300',
      bar: 'bg-slate-400',
      text: 'text-slate-600',
    };
  };

  const colors = getColorClasses(numScore);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.badge}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{numScore.toFixed(0)}% Match</span>
        </span>
      </div>

      {showBar && (
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, numScore))}%` }}
          />
        </div>
      )}
    </div>
  );
};
