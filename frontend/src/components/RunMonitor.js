import React, { useState, useEffect, useRef } from 'react';
import { Play, Cpu, Terminal, AlertTriangle, Hash, Timer, Microscope, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../api';
import GraphVisualization from './GraphVisualization';
import MetricsPanel from './MetricsPanel';
import ExplanationVisualization from './ExplanationVisualization';

const STATUS = {
  idle:      { label: 'Idle',      bg: '#F5F5F5', color: '#737373', dot: '#D6D6D6', pulse: false },
  running:   { label: 'Running',   bg: '#F5F5F5', color: '#0D0D0D', dot: '#0D0D0D', pulse: true  },
  completed: { label: 'Completed', bg: '#F5F5F5', color: '#0D0D0D', dot: '#0D0D0D', pulse: false },
  error:     { label: 'Error',     bg: '#FFF0F0', color: '#E60000', dot: '#E60000', pulse: false },
  stopped:   { label: 'Stopped',   bg: '#F5F5F5', color: '#737373', dot: '#737373', pulse: false },
};

const LINES = [
  { key: 'val_acc',    name: 'Val Accuracy',       color: '#0D0D0D' },
  { key: 'train_loss', name: 'Train Loss',          color: '#E60000' },
  { key: 'asr',        name: 'Attack Success Rate', color: '#737373', cond: true },
  { key: 'robust_acc', name: 'Robust Accuracy',     color: '#404040', cond: true },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg px-3 py-2.5 text-xs"
      style={{ border: '1px solid #EBEBEB', boxShadow: '0 4px 12px rgb(0 0 0/0.08)' }}>
      <p className="font-semibold mb-1.5" style={{ color: '#525252' }}>Epoch {label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span style={{ color: '#737373' }}>{p.name}</span>
          </div>
          <span className="font-semibold" style={{ color: '#0D0D0D' }}>
            {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RunMonitor({ run, config, onRunComplete, onStartRun, isRunning, configChanged, trainedConfig, user, token, onSignInClick }) {
  const [status,        setStatus]        = useState('idle');
  const [metrics,       setMetrics]       = useState([]);
  const [logs,          setLogs]          = useState([]);
  const [explanations,  setExplanations]  = useState([]);
  const [currentMetric, setCurrentMetric] = useState(null);
  const wsRef   = useRef(null);
  const logsRef = useRef(null);

  useEffect(() => () => { wsRef.current?.close(); wsRef.current = null; }, []);
  useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [logs]);

  const connectWS = (runId) => {
    try {
      wsRef.current = api.connectWebSocket(runId);
      wsRef.current.onopen    = () => setStatus('running');
      wsRef.current.onmessage = (e) => { try { handleMsg(JSON.parse(e.data)); } catch {} };
      wsRef.current.onclose   = () => {
        setStatus('completed');
        const final = currentMetric || metrics[metrics.length - 1] || null;
        if (final && run?.run_id) saveHistory(final);
        setTimeout(() => {
          setMetrics([]); setLogs([]); setExplanations([]); setCurrentMetric(null);
          setStatus('idle'); wsRef.current = null; onRunComplete?.(final);
        }, 2500);
      };
      wsRef.current.onerror = () => setStatus('error');
    } catch { setStatus('error'); onRunComplete?.(null); }
  };

  const handleMsg = (data) => {
    if (data.type === 'log') {
      setLogs(prev => [...prev, { ts: new Date(), msg: data.msg }]);
    } else if (data.type === 'metric') {
      const m = { epoch: data.epoch, train_loss: data.train_loss, val_acc: data.val_acc, asr: data.asr, robust_acc: data.robust_acc };
      setMetrics(prev => [...prev, m]);
      setCurrentMetric(m);
      if (run?.run_id) {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        const h = JSON.parse(localStorage.getItem('experimentHistory') || '[]');
        const i = h.findIndex(e => String(e.id).startsWith(`${run.run_id}-`) && e.user_email === u.email);
        if (i !== -1) { h[i].results = { val_acc: m.val_acc, train_loss: m.train_loss }; localStorage.setItem('experimentHistory', JSON.stringify(h)); }
      }
    } else if (data.type === 'explanation') {
      if (data.explanation) setExplanations(prev => [...prev, data.explanation]);
      else if (data.explanations) setExplanations(data.explanations);
      setLogs(prev => [...prev, { ts: new Date(), msg: `Explainer ${data.explainer} completed for node ${data.explanation?.node_idx ?? 'N/A'}` }]);
    } else if (data.type === 'status') {
      setStatus(data.status);
    }
  };

  const saveHistory = (final) => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    const h = JSON.parse(localStorage.getItem('experimentHistory') || '[]');
    const i = h.findIndex(e => String(e.id).startsWith(`${run.run_id}-`) && e.user_email === u.email);
    if (i !== -1) {
      h[i].results = { final_val_acc: final.val_acc, final_train_loss: final.train_loss, val_acc: final.val_acc, train_loss: final.train_loss, asr: final.asr, robust_acc: final.robust_acc, accuracy: final.val_acc };
      localStorage.setItem('experimentHistory', JSON.stringify(h));
    }
  };

  useEffect(() => {
    if (!run?.run_id || wsRef.current) return;
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    const exp = { id: `${run.run_id}-${Date.now()}`, timestamp: new Date().toISOString(), config: JSON.parse(JSON.stringify(config)), results: null, user_email: u.email };
    const h = JSON.parse(localStorage.getItem('experimentHistory') || '[]');
    const filtered = h.filter(e => !String(e.id).startsWith(`${run.run_id}-`) && e.id !== run.run_id);
    filtered.unshift(exp);
    localStorage.setItem('experimentHistory', JSON.stringify(filtered.slice(0, 50)));
    setTimeout(() => connectWS(run.run_id), 1000);
  }, [run?.run_id]);

  const sc = STATUS[status] || STATUS.idle;
  const visibleLines = LINES.filter(l => !l.cond || (l.key === 'asr' ? metrics.some(m => m.asr != null) : metrics.some(m => m.robust_acc != null)));

  if (!run) {
    return (
      <div className="space-y-5">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4" style={{ color: '#BDBDBD' }} />
            <h2 className="section-title">Training monitor</h2>
          </div>
          <p className="section-desc mb-6">Review your configuration and start training.</p>

          {configChanged && trainedConfig && (
            <div className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 mb-5 text-sm"
              style={{ background: '#F5F5F5', border: '1px solid #D6D6D6', color: '#525252' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#737373' }} />
              Configuration changed — retrain to apply the new settings.
            </div>
          )}

          {(!token || !user) && (
            <div className="flex items-start gap-3 rounded-lg px-4 py-3 mb-5"
              style={{ background: '#FFF0F0', border: '1px solid #FFB3B3' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E60000' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#B30000' }}>Authentication required</p>
                <button onClick={onSignInClick} className="text-xs underline mt-0.5" style={{ color: '#E60000' }}>
                  Sign in with Google
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onStartRun}
            disabled={isRunning || !token || !user}
            className="btn-lg btn-primary gap-2"
            style={{ opacity: (isRunning || !token || !user) ? 0.4 : 1 }}
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Starting…' : (!token || !user ? 'Sign in required' : 'Start training')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Status + metrics */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4" style={{ color: '#BDBDBD' }} />
            <h2 className="section-title">Training monitor</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
            style={{ background: sc.bg, color: sc.color, border: '1px solid #EBEBEB' }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: sc.dot, animation: sc.pulse ? 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite' : 'none' }} />
            {sc.label}
          </div>
        </div>

        <MetricsPanel currentMetric={currentMetric} metrics={metrics} />

        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { label: 'Run ID',       value: run.run_id,         Icon: Hash },
            { label: 'Epochs',       value: metrics.length,      Icon: Timer },
            { label: 'Explanations', value: explanations.length, Icon: Microscope },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color: '#BDBDBD' }} />
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#737373' }}>{label}</p>
              </div>
              <p className="text-lg font-semibold tabular-nums truncate" style={{ color: '#0D0D0D' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      {metrics.length > 0 && (
        <div className="card p-6">
          <h3 className="section-title mb-5">Training metrics</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={metrics} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
              <XAxis dataKey="epoch" tick={{ fontSize: 11, fill: '#BDBDBD' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#BDBDBD' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16, color: '#525252' }} />
              {visibleLines.map(l => (
                <Line key={l.key} type="monotone" dataKey={l.key} name={l.name}
                  stroke={l.color} strokeWidth={2} dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: l.color }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {run && (
        <GraphVisualization
          dataset={config?.dataset?.name}
          nodeExplanations={explanations}
          selectedNodes={config?.explainer?.node_ids}
          attackConfig={config?.attack}
          defenseConfig={config?.defense}
          metrics={metrics}
          explainerConfig={config?.explainer}
        />
      )}

      <ExplanationVisualization explanations={explanations} selectedNodes={config?.explainer?.node_ids} />

      {/* Log console */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4" style={{ color: '#BDBDBD' }} />
          <h3 className="section-title">Training logs</h3>
          <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-medium"
            style={{ background: '#F5F5F5', color: '#525252' }}>
            {logs.length} entries
          </span>
        </div>
        <div ref={logsRef} className="log-block h-48 scrollbar-none">
          {logs.length === 0
            ? <span style={{ color: '#525252' }}>Waiting for training output…</span>
            : logs.map((log, i) => (
              <div key={i} className="mb-1">
                <span style={{ color: '#525252' }}>[{log.ts.toLocaleTimeString()}]</span>
                <span className="ml-2" style={{ color: '#BDBDBD' }}>{log.msg}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
