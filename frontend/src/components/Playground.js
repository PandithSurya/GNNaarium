import React, { useState } from 'react';
import { Zap, RotateCcw, Play, ArrowRight, Settings } from 'lucide-react';

const PRESETS = {
  beginner:  { label: 'Beginner',          desc: 'Fast training with a simple model.',           meta: ['GCN','Cora','20 epochs'],          config: { model: { name: 'GCN',              hidden_dim: 32,  dropout: 0.5, lr: 0.01,  epochs: 20,  heads: 4, seed: 42, weight_decay: 5e-4 }, dataset: { name: 'Cora'     } } },
  research:  { label: 'Research',          desc: 'High-capacity model for best performance.',    meta: ['GAT','PubMed','200 epochs'],        config: { model: { name: 'GAT',              hidden_dim: 128, dropout: 0.6, lr: 0.005, epochs: 200, heads: 8, seed: 42, weight_decay: 5e-4 }, dataset: { name: 'PubMed'   } } },
  fast_demo: { label: 'Fast Demo',         desc: 'Quick 10-epoch run to verify the pipeline.',  meta: ['GraphSage','Cora','10 epochs'],     config: { model: { name: 'GraphSage',        hidden_dim: 64,  dropout: 0.5, lr: 0.01,  epochs: 10,  heads: 4, seed: 42, weight_decay: 5e-4 }, dataset: { name: 'Cora'     } } },
  attention: { label: 'Attention Explorer',desc: 'Visualize attention with GNNExplainer.',     meta: ['GraphTransformer','Citeseer','50 epochs'], config: { model: { name: 'GraphTransformer', hidden_dim: 64,  dropout: 0.5, lr: 0.01,  epochs: 50,  heads: 8, seed: 42, weight_decay: 5e-4 }, dataset: { name: 'Citeseer' }, explainer: { name: 'GNNExplainer', node_idx: '0' } } },
};

const CONFIG_TABS = [
  { id: 'dataset',        label: 'Dataset' },
  { id: 'model',          label: 'Model' },
  { id: 'attack-defense', label: 'Attack & Defense' },
  { id: 'explainer',      label: 'Explainer' },
];

export default function Playground({ config, onConfigChange, onStartExperiment, isRunning, user, token, onSignInClick, onNavigateToTab }) {
  const [activePreset, setActivePreset] = useState(null);

  const applyPreset = (key) => {
    setActivePreset(key);
    onConfigChange({ attack: null, defense: null, explainer: null, ...PRESETS[key].config });
  };

  const canStart = !isRunning && !!token && !!user;

  return (
    <div className="space-y-6">

      {/* Presets */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4" style={{ color: '#E60000' }} />
          <h2 className="section-title">Quick start presets</h2>
        </div>
        <p className="text-sm mb-5" style={{ color: '#737373' }}>
          Select a preset to populate your experiment configuration instantly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(PRESETS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`select-card text-left ${activePreset === key ? 'selected' : ''}`}
            >
              <h3 className="text-sm font-semibold text-b-500 mb-1">{p.label}</h3>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: '#737373' }}>{p.desc}</p>
              <div className="flex flex-wrap gap-1">
                {p.meta.map(m => (
                  <span key={m} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#F5F5F5', color: '#525252' }}>{m}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Config summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" style={{ color: '#BDBDBD' }} />
            <h2 className="section-title">Current configuration</h2>
          </div>
          <button onClick={() => applyPreset('beginner')} className="btn-sm btn-secondary gap-1.5">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Model',         value: config.model?.name     || '—' },
            { label: 'Dataset',       value: config.dataset?.name   || '—' },
            { label: 'Epochs',        value: String(config.model?.epochs  ?? 50)   },
            { label: 'Learning Rate', value: String(config.model?.lr      ?? 0.01) },
          ].map(({ label, value }) => (
            <div key={label} className="metric-card">
              <p className="metric-label">{label}</p>
              <p className="text-base font-semibold text-b-500 mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {[
            { title: 'Model settings', rows: [
              ['Architecture', config.model?.name       || 'GCN'],
              ['Hidden dim',   config.model?.hidden_dim ?? 64],
              ['Dropout',      config.model?.dropout    ?? 0.5],
              ['Weight decay', config.model?.weight_decay ?? '5e-4'],
              ['Seed',         config.model?.seed       ?? 42],
            ]},
            { title: 'Experiment settings', rows: [
              ['Dataset',   config.dataset?.name    || 'Cora'],
              ['Attack',    config.attack?.name     || 'None'],
              ['Defense',   config.defense?.name    || 'None'],
              ['Explainer', config.explainer?.name  || 'None'],
            ]},
          ].map(({ title, rows }) => (
            <div key={title} className="rounded-lg p-4 text-sm space-y-2" style={{ background: '#FAFAFA' }}>
              <p className="font-medium text-b-400 mb-2">{title}</p>
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span style={{ color: '#737373' }}>{k}</span>
                  <span className="font-medium text-b-500">{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Navigate shortcuts */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CONFIG_TABS.map(t => (
            <button key={t.id} onClick={() => onNavigateToTab(t.id)} className="btn-sm btn-secondary gap-1">
              Configure {t.label} <ArrowRight className="w-3 h-3" />
            </button>
          ))}
        </div>

        {/* Auth warning */}
        {(!token || !user) && (
          <div className="mb-4 flex items-start gap-3 rounded-lg px-4 py-3" style={{ background: '#FFF0F0', border: '1px solid #FFB3B3' }}>
            <div className="status-dot-red mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium" style={{ color: '#B30000' }}>Authentication required</p>
              <p className="text-xs mt-0.5" style={{ color: '#E60000' }}>
                <button onClick={onSignInClick} className="underline">Sign in with Google</button> to start training.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onStartExperiment}
          disabled={!canStart}
          className="btn-lg btn-primary gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Training in progress…' : (!token || !user ? 'Sign in required' : 'Start experiment')}
        </button>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: '#FFF0F0', border: '1px solid #FFD6D6' }}>
        <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E60000' }} />
        <p className="text-sm" style={{ color: '#800000' }}>
          <strong>Tip:</strong> Start with <em>Beginner</em> to see results quickly, then use <em>Attention Explorer</em> to visualize how transformer-based models weight different parts of the graph.
        </p>
      </div>
    </div>
  );
}
