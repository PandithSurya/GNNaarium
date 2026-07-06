import React, { useState, useEffect } from 'react';
import { History, Download, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export default function ExperimentHistory() {
  const [experiments, setExperiments] = useState([]);
  const [expanded,    setExpanded]    = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const me = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      if (!me.email) { setExperiments([]); return; }
      const deleted = JSON.parse(localStorage.getItem('deletedExperiments') || '[]');
      let list = [];
      try {
        const r = await fetch('/api/experiments', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (r.ok) { const d = await r.json(); list = d.experiments || []; }
      } catch {}
      try {
        const local = JSON.parse(localStorage.getItem('experimentHistory') || '[]').filter(e => e.user_email === me.email);
        const merged = [...list, ...local];
        const seen = new Set();
        setExperiments(merged.filter(e => {
          const k = String(e._id || e.id);
          if (seen.has(k) || deleted.includes(k)) return false;
          seen.add(k); return true;
        }));
      } catch { setExperiments(list); }
    } finally { setLoading(false); }
  };

  const addDeleted = (id) => {
    const deleted = JSON.parse(localStorage.getItem('deletedExperiments') || '[]');
    if (!deleted.includes(String(id))) {
      deleted.push(String(id));
      localStorage.setItem('deletedExperiments', JSON.stringify(deleted));
    }
  };

  const del = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const r = await fetch(`/api/experiments/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!r.ok) console.warn('DB delete failed:', await r.text());
    } catch (e) { console.warn('DB delete error:', e); }
    addDeleted(id);
    const saved = JSON.parse(localStorage.getItem('experimentHistory') || '[]');
    localStorage.setItem('experimentHistory', JSON.stringify(
      saved.filter(e => String(e._id || e.id) !== String(id))
    ));
    setExperiments(prev => prev.filter(e => String(e._id || e.id) !== String(id)));
  };

  const exportExp = (exp) => {
    const blob = new Blob([JSON.stringify(exp, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `experiment-${exp._id || exp.id}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const fmtAcc  = (r) => { if (!r) return '—'; const v = r.final_val_acc ?? r.val_acc ?? r.accuracy; if (v == null) return '—'; return `${(v > 1 ? v : v * 100).toFixed(1)}%`; };
  const fmtLoss = (r) => { if (!r) return '—'; const v = r.final_train_loss ?? r.train_loss; return v != null ? v.toFixed(4) : '—'; };

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <div className="section-header">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" style={{ color: '#9333EA' }} />
            <h2 className="section-title">Experiment history</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-1" style={{ background: '#FAF5FF', color: '#9333EA' }}>{experiments.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-sm btn-ghost gap-1.5"><RefreshCw className="w-3.5 h-3.5" /></button>
            {experiments.length > 0 && (
              <button
                onClick={() => {
                  const me = JSON.parse(localStorage.getItem('user') || '{}');
                  const saved = JSON.parse(localStorage.getItem('experimentHistory') || '[]');
                  const toDelete = saved.filter(e => e.user_email === me.email).map(e => String(e._id || e.id));
                  const existing = JSON.parse(localStorage.getItem('deletedExperiments') || '[]');
                  localStorage.setItem('deletedExperiments', JSON.stringify([...new Set([...existing, ...toDelete])]));
                  localStorage.setItem('experimentHistory', JSON.stringify(saved.filter(e => e.user_email !== me.email)));
                  setExperiments([]);
                }}
                className="btn-sm btn-secondary"
                style={{ color: '#E60000', borderColor: '#FFB3B3' }}
              >Clear all</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 rounded-full animate-spin mx-auto mb-3" style={{ border: '2px solid #E60000', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: '#737373' }}>Loading experiments…</p>
          </div>
        ) : experiments.length === 0 ? (
          <div className="text-center py-14">
            <History className="w-10 h-10 mx-auto mb-3" style={{ color: '#EBEBEB' }} />
            <p className="text-sm font-medium" style={{ color: '#737373' }}>No experiments yet</p>
            <p className="text-xs mt-1" style={{ color: '#BDBDBD' }}>Start training to record your first experiment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Dataset</th>
                  <th>Attack</th>
                  <th>Defense</th>
                  <th style={{ textAlign: 'right' }}>Val Acc</th>
                  <th style={{ textAlign: 'right' }}>Train Loss</th>
                  <th style={{ textAlign: 'right' }}>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {experiments.map(exp => {
                  const id     = exp._id || exp.id;
                  const cfg    = exp.config || {};
                  const isOpen = expanded === id;
                  return (
                    <React.Fragment key={id}>
                      <tr>
                        <td className="font-medium" style={{ color: '#0D0D0D' }}>{cfg.model?.name || 'GCN'}</td>
                        <td style={{ color: '#525252' }}>{cfg.dataset?.name || '—'}</td>
                        <td>
                          {cfg.attack?.name
                            ? <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FFF0F0', color: '#E60000' }}>{cfg.attack.name}</span>
                            : <span style={{ color: '#BDBDBD' }}>—</span>}
                        </td>
                        <td>
                          {cfg.defense?.name
                            ? <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#F0FDF4', color: '#16A34A' }}>{cfg.defense.name}</span>
                            : <span style={{ color: '#BDBDBD' }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#16A34A' }}>{fmtAcc(exp.results)}</td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#E60000' }}>{fmtLoss(exp.results)}</td>
                        <td style={{ textAlign: 'right', fontSize: 12, color: '#BDBDBD', whiteSpace: 'nowrap' }}>
                          {new Date(exp.timestamp).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setExpanded(isOpen ? null : id)} className="btn-sm btn-ghost" style={{ padding: '6px' }}>
                              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => exportExp(exp)} className="btn-sm btn-ghost" style={{ padding: '6px' }}><Download className="w-3.5 h-3.5" /></button>
                            <button onClick={() => del(id)} className="btn-sm btn-ghost" style={{ padding: '6px', color: '#E60000' }}><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr style={{ background: '#FAFAFA' }}>
                          <td colSpan={8} style={{ padding: '16px' }}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 text-xs">
                              {[
                                ['Model',      cfg.model?.name       || 'GCN',   '#9333EA'],
                                ['Dataset',    cfg.dataset?.name     || '—',     '#0891B2'],
                                ['Epochs',     cfg.model?.epochs     || 50,      '#0D0D0D'],
                                ['LR',         cfg.model?.lr         || 0.01,    '#0D0D0D'],
                                ['Hidden dim', cfg.model?.hidden_dim || 64,      '#0D0D0D'],
                                ['Dropout',    cfg.model?.dropout    || 0.5,     '#0D0D0D'],
                                ['Attack',     cfg.attack?.name      || 'None',  '#E60000'],
                                ['Defense',    cfg.defense?.name     || 'None',  '#16A34A'],
                                ['Explainer',  cfg.explainer?.name   || 'None',  '#9333EA'],
                                ['Seed',       cfg.model?.seed       || 42,      '#0D0D0D'],
                                ['Val acc',    fmtAcc(exp.results),               '#16A34A'],
                                ['Train loss', fmtLoss(exp.results),              '#E60000'],
                              ].map(([k, v, c]) => (
                                <div key={k}>
                                  <p className="font-medium mb-0.5" style={{ color: '#BDBDBD' }}>{k}</p>
                                  <p className="font-semibold" style={{ color: c }}>{String(v)}</p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
