import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const METRICS = [
  { key: 'val_acc',    label: 'Val Accuracy',       fmt: v => `${(v > 1 ? v : v*100).toFixed(1)}%`, valueColor: '#16A34A', bg: '#F0FDF4' },
  { key: 'train_loss', label: 'Train Loss',          fmt: v => v.toFixed(4),                          valueColor: '#E60000', bg: '#FFF0F0' },
  { key: 'asr',        label: 'Attack Success Rate', fmt: v => `${(v > 1 ? v : v*100).toFixed(1)}%`, valueColor: '#EA580C', bg: '#FFF7ED' },
  { key: 'robust_acc', label: 'Robust Accuracy',     fmt: v => `${(v > 1 ? v : v*100).toFixed(1)}%`, valueColor: '#0891B2', bg: '#ECFEFF' },
];

export default function MetricsPanel({ currentMetric, metrics }) {
  const trend = (key) => {
    if (metrics.length < 2) return null;
    const cur  = metrics[metrics.length - 1][key];
    const prev = metrics[metrics.length - 2][key];
    if (cur == null || prev == null) return null;
    return cur > prev ? 'up' : cur < prev ? 'down' : null;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {METRICS.map(({ key, label, fmt, valueColor, bg }) => {
        const val = currentMetric?.[key];
        const t   = trend(key);
        return (
          <div key={key} className="card p-4" style={{ borderLeft: `3px solid ${valueColor}` }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#737373' }}>{label}</p>
            <p className="text-2xl font-semibold mt-1 tabular-nums" style={{ color: val != null ? valueColor : '#D6D6D6' }}>
              {val != null ? fmt(val) : '—'}
            </p>
            {t && (
              <div className="flex items-center gap-1 mt-1.5 text-xs font-medium" style={{ color: t === 'up' ? '#16A34A' : '#E60000' }}>
                {t === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {t === 'up' ? 'Improving' : 'Declining'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
