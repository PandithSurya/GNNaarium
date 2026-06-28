import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, Star, Filter, BookOpen, Code } from 'lucide-react';
import TheoryModal from './TheoryModal';
import CodeModal from './CodeModal';

const TASK_COLOR = {
  'Node Classification':             { bg: '#ECFEFF', color: '#0891B2' },
  'Graph Classification':            { bg: '#FFFBEB', color: '#D97706' },
  'Large-scale Node Classification': { bg: '#F0FDF4', color: '#16A34A' },
  'Complex Graph Analysis':          { bg: '#FAF5FF', color: '#9333EA' },
  'Knowledge Graph Tasks':           { bg: '#FDF2F8', color: '#DB2777' },
};

const MODELS = [
  { value: 'GCN',              name: 'GCN',               fullName: 'Graph Convolutional Network',  tasks: 'Node Classification',             desc: 'Spectral convolutions with localized filters. Fast and effective on citation networks.' },
  { value: 'GIN',              name: 'GIN',               fullName: 'Graph Isomorphism Network',    tasks: 'Graph Classification',            desc: 'Maximally expressive GNN with sum aggregation and MLP. Strong theoretical guarantees.' },
  { value: 'GAT',              name: 'GAT',               fullName: 'Graph Attention Network',      tasks: 'Node Classification',             desc: 'Multi-head attention weights neighbor contributions. Handles heterophilic graphs well.' },
  { value: 'GraphSage',        name: 'GraphSAGE',         fullName: 'Graph Sample and Aggregate',   tasks: 'Large-scale Node Classification', desc: 'Samples and aggregates neighborhoods. Designed for inductive learning on large graphs.' },
  { value: 'GraphTransformer', name: 'Graph Transformer', fullName: 'Graph Transformer',            tasks: 'Complex Graph Analysis',          desc: 'Transformer adapted to graphs. Captures long-range dependencies via global attention.' },
  { value: 'KA-GNN',           name: 'KA-GNN',            fullName: 'Knowledge-Aware GNN',          tasks: 'Knowledge Graph Tasks',           desc: 'Integrates external knowledge through attention. Enhances knowledge-intensive tasks.' },
];

const COMPAT = {
  Cora:         { compatible: ['GCN','GAT','GraphSage','KA-GNN'],       incompatible: ['GIN','GraphTransformer'],             recommended: 'GCN' },
  Citeseer:     { compatible: ['GCN','GAT','GraphSage'],                incompatible: ['GIN','GraphTransformer','KA-GNN'],    recommended: 'GAT' },
  PubMed:       { compatible: ['GCN','GAT','KA-GNN'],                   incompatible: ['GIN','GraphSage','GraphTransformer'], recommended: 'KA-GNN' },
  Reddit:       { compatible: ['GraphSage','GAT'],                      incompatible: ['GCN','GIN','GraphTransformer','KA-GNN'], recommended: 'GraphSage' },
  MUTAG:        { compatible: ['GIN'],                                   incompatible: ['GCN','GAT','GraphSage','GraphTransformer','KA-GNN'], recommended: 'GIN' },
  PROTEINS:     { compatible: ['GIN'],                                   incompatible: ['GCN','GAT','GraphSage','GraphTransformer','KA-GNN'], recommended: 'GIN' },
  ZINC:         { compatible: ['GraphTransformer'],                      incompatible: ['GCN','GIN','GAT','GraphSage','KA-GNN'], recommended: 'GraphTransformer' },
  'OGBN-Arxiv': { compatible: ['GCN','GraphSage','GAT','KA-GNN'],       incompatible: ['GIN','GraphTransformer'],             recommended: 'GraphSage' },
};

const PARAMS = [
  { key: 'hidden_dim',   label: 'Hidden dimension',  hint: '8–512',            type: 'int',   min: 8,      max: 512,   step: 8 },
  { key: 'dropout',      label: 'Dropout rate',      hint: '0.0–1.0',          type: 'float', min: 0,      max: 1,     step: 0.1 },
  { key: 'lr',           label: 'Learning rate',     hint: 'Step size',        type: 'float', min: 0.0001, max: 1,     step: 0.001 },
  { key: 'epochs',       label: 'Epochs',            hint: '1–1000',           type: 'int',   min: 1,      max: 1000,  step: 1 },
  { key: 'weight_decay', label: 'Weight decay',      hint: 'L2 regularization',type: 'float', min: 0,      max: 0.01,  step: 0.0001 },
  { key: 'seed',         label: 'Random seed',       hint: 'Reproducibility',  type: 'int',   min: 0,      max: 99999, step: 1 },
];

export default function ModelConfig({ config, onChange, datasetConfig }) {
  const [filterCompatible, setFilterCompatible] = useState(false);
  const [theoryModal, setTheoryModal] = useState(null);
  const [codeModal,   setCodeModal]   = useState(null);

  const datasetName = datasetConfig?.name;
  const isCustom    = datasetName?.startsWith('custom_');
  const compat      = !isCustom && datasetName ? COMPAT[datasetName] : null;

  const displayModels = useMemo(() =>
    filterCompatible && compat?.compatible
      ? MODELS.filter(m => compat.compatible.includes(m.value))
      : MODELS,
    [filterCompatible, compat]
  );

  const getStatus = (v) => {
    if (!compat) return 'neutral';
    if (compat.compatible.includes(v))   return 'compatible';
    if (compat.incompatible.includes(v)) return 'incompatible';
    return 'neutral';
  };

  const update = (field, value) => onChange({ ...config, [field]: value });

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="section-header">
          <div>
            <h2 className="section-title">Model architecture</h2>
            <p className="section-desc">Choose a GNN variant for your experiment.</p>
          </div>
          {compat && (
            <button
              onClick={() => setFilterCompatible(!filterCompatible)}
              className={`btn-sm gap-1.5 ${filterCompatible ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Filter className="w-3 h-3" />
              {filterCompatible ? 'Show all' : 'Compatible only'}
            </button>
          )}
        </div>

        {/* Recommendation — amber */}
        {compat?.recommended && (
          <div className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 mb-5" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <Star className="w-4 h-4 flex-shrink-0" style={{ color: '#D97706' }} />
            <p className="text-sm" style={{ color: '#92400E' }}>
              <strong>{compat.recommended}</strong> is recommended for <strong>{datasetName}</strong>.
            </p>
          </div>
        )}

        {/* Custom dataset — cyan */}
        {isCustom && (
          <div className="rounded-lg px-4 py-3 mb-5 text-sm" style={{ background: '#ECFEFF', border: '1px solid #A5F3FC', color: '#0E7490' }}>
            Custom dataset detected. Start with <strong>GCN</strong> for node classification or <strong>GIN</strong> for graph classification.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayModels.map(model => {
            const status    = getStatus(model.value);
            const selected  = config.name === model.value;
            const taskStyle = TASK_COLOR[model.tasks] || { bg: '#F5F5F5', color: '#525252' };
            return (
              <div
                key={model.value}
                onClick={() => update('name', model.value)}
                className={`select-card ${selected ? 'selected' : ''} ${status === 'incompatible' ? 'bad' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0D0D0D' }}>{model.name}</p>
                    <p className="text-xs" style={{ color: '#BDBDBD' }}>{model.fullName}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {status === 'compatible'   && <CheckCircle2 className="w-4 h-4" style={{ color: '#16A34A' }} />}
                    {status === 'incompatible' && <XCircle      className="w-4 h-4" style={{ color: '#BDBDBD' }} />}
                    {compat?.recommended === model.value && <Star className="w-3.5 h-3.5" style={{ color: '#D97706' }} />}
                    <button onClick={e => { e.stopPropagation(); setTheoryModal(model.value); }} className="p-1 rounded btn-ghost" title="Theory">
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setCodeModal(model.value); }} className="p-1 rounded btn-ghost" title="Code">
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs leading-relaxed mb-2.5" style={{ color: '#737373' }}>{model.desc}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: taskStyle.bg, color: taskStyle.color }}>{model.tasks}</span>
              </div>
            );
          })}
        </div>

        {/* Compat summary */}
        {compat && (
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <div>
              <p className="text-xs font-semibold flex items-center gap-1 mb-2" style={{ color: '#16A34A' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Compatible
              </p>
              <div className="flex flex-wrap gap-1.5">
                {compat.compatible.map(m => (
                  <span key={m} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>{m}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold flex items-center gap-1 mb-2" style={{ color: '#E60000' }}>
                <XCircle className="w-3.5 h-3.5" /> Incompatible
              </p>
              <div className="flex flex-wrap gap-1.5">
                {compat.incompatible.map(m => (
                  <span key={m} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FFF0F0', color: '#E60000', border: '1px solid #FFB3B3' }}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hyperparameters */}
      <div className="card p-6">
        <h2 className="section-title mb-5">Training parameters</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {PARAMS.map(({ key, label, hint, type, min, max, step }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                type="number"
                value={config[key] ?? ''}
                onChange={e => update(key, type === 'int' ? parseInt(e.target.value) : parseFloat(e.target.value))}
                min={min} max={max} step={step}
                className="input"
              />
              <p className="text-xs mt-1" style={{ color: '#BDBDBD' }}>{hint}</p>
            </div>
          ))}
        </div>
        {['GAT','GraphTransformer','KA-GNN'].includes(config.name) && (
          <div className="mt-5 pt-5 w-48" style={{ borderTop: '1px solid #EBEBEB' }}>
            <label className="label">Attention heads</label>
            <input type="number" value={config.heads ?? 8} onChange={e => update('heads', parseInt(e.target.value))} min={1} max={16} step={1} className="input" />
            <p className="text-xs mt-1" style={{ color: '#BDBDBD' }}>Multi-head attention count</p>
          </div>
        )}
      </div>

      <TheoryModal modelName={theoryModal} isOpen={!!theoryModal} onClose={() => setTheoryModal(null)} />
      <CodeModal   modelName={codeModal}   isOpen={!!codeModal}   onClose={() => setCodeModal(null)} />
    </div>
  );
}
