import React from 'react';
import { Search, Info } from 'lucide-react';

const CAT_STYLE = {
  'Post-hoc':  { bg: '#FAF5FF', color: '#9333EA', border: '#E9D5FF' },
  'Intrinsic': { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  'Global':    { bg: '#ECFEFF', color: '#0891B2', border: '#A5F3FC' },
};

const EXPLAINERS = [
  { name: 'GNNExplainer',   category: 'Post-hoc',  desc: 'Optimizes edge masks to identify important subgraphs. Well-established baseline.',         strengths: 'Interpretable, works with any GNN', limitations: 'Slow for large graphs',         params: ['node_idx','explainer_epochs','sparsity_weight','lr'] },
  { name: 'PGExplainer',    category: 'Post-hoc',  desc: 'Neural parametric explainer that generates explanations efficiently.',                      strengths: 'Fast, scalable',                   limitations: 'Less interpretable',            params: ['node_idx'] },
  { name: 'SubgraphX',      category: 'Post-hoc',  desc: 'Shapley value-based explainer with game-theory grounding for fair attribution.',             strengths: 'Theoretical fairness guarantees',  limitations: 'Computationally intensive',     params: ['node_idx','num_samples'] },
  { name: 'ProtGNN',        category: 'Intrinsic', desc: 'Self-interpretable GNN — explains predictions via similarity to learned class prototypes.',  strengths: 'Intrinsic interpretability',       limitations: 'Embedding-space only',          params: ['num_prototypes'] },
  { name: 'GraphMask',      category: 'Post-hoc',  desc: 'Learns binary gates on message passing to identify essential edges. Global explainer.',      strengths: 'Structure-aware, good fidelity',   limitations: 'Complex optimization',          params: ['node_idx','explainer_epochs','sparsity_weight','lr'] },
  { name: 'NeuronAnalysis', category: 'Global',    desc: 'Analyzes internal activations to understand concepts the model has learned globally.',       strengths: 'Global model insights',            limitations: 'Requires domain knowledge',     params: ['node_idx'] },
];

const PARAM_DEFS = {
  node_idx:         { label: 'Target node index(es)', hint: 'Comma-separated, 0-based', type: 'text',   default: '0' },
  explainer_epochs: { label: 'Optimization epochs',   hint: '10–500',                   type: 'number', default: 100,  min: 10,    max: 500, step: 10 },
  sparsity_weight:  { label: 'Sparsity weight',        hint: '0.001–0.1',                type: 'number', default: 0.01, min: 0.001, max: 0.1, step: 0.001 },
  lr:               { label: 'Learning rate',          hint: '0.001–0.1',                type: 'number', default: 0.01, min: 0.001, max: 0.1, step: 0.001 },
  num_samples:      { label: 'Shapley samples',        hint: '10–200',                   type: 'number', default: 50,   min: 10,    max: 200, step: 10 },
  num_prototypes:   { label: 'Number of prototypes',   hint: '1–20',                     type: 'number', default: 5,    min: 1,     max: 20,  step: 1 },
};

const CATEGORIES = ['Post-hoc', 'Intrinsic', 'Global'];

export default function ExplainerConfig({ config, onChange }) {
  const selected  = config?.name;
  const explainer = EXPLAINERS.find(e => e.name === selected);

  const updateField = (field, value) =>
    onChange(config ? { ...config, [field]: value } : { name: '', [field]: value });

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-4 h-4" style={{ color: '#9333EA' }} />
          <h2 className="section-title">Explainer</h2>
        </div>
        <p className="section-desc mb-5">Interpretability methods to understand model decisions. Runs after training completes.</p>

        {/* None */}
        <button onClick={() => onChange(null)} className={`select-card text-left w-full mb-5 ${!selected ? 'selected' : ''}`}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#0D0D0D' }}>No explainer</p>
          <p className="text-xs" style={{ color: '#737373' }}>Train and evaluate without generating explanations.</p>
        </button>

        {CATEGORIES.map(cat => {
          const cs = CAT_STYLE[cat];
          return (
            <div key={cat} className="mb-6">
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3" style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                {cat}
              </span>
              <div className="grid sm:grid-cols-2 gap-3">
                {EXPLAINERS.filter(e => e.category === cat).map(exp => (
                  <button
                    key={exp.name}
                    onClick={() => onChange(selected === exp.name ? null : { name: exp.name })}
                    className={`select-card text-left ${selected === exp.name ? 'selected' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold" style={{ color: '#0D0D0D' }}>{exp.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cs.bg, color: cs.color }}>{cat}</span>
                    </div>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: '#737373' }}>{exp.desc}</p>
                    <div className="space-y-0.5 text-xs">
                      <p><span className="font-medium" style={{ color: '#16A34A' }}>+</span> <span style={{ color: '#737373' }}>{exp.strengths}</span></p>
                      <p><span className="font-medium" style={{ color: '#E60000' }}>–</span> <span style={{ color: '#737373' }}>{exp.limitations}</span></p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Parameters */}
      {explainer && (
        <div className="card p-6">
          <h3 className="section-title mb-1">Parameters — {explainer.name}</h3>
          <p className="section-desc mb-5">{explainer.desc}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {explainer.params.map(key => {
              const def = PARAM_DEFS[key];
              return (
                <div key={key}>
                  <label className="label">{def.label}</label>
                  <input
                    type={def.type}
                    value={config[key] ?? def.default}
                    onChange={e => updateField(key, def.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    {...(def.type === 'number' ? { min: def.min, max: def.max, step: def.step } : {})}
                    className="input"
                    placeholder={String(def.default)}
                  />
                  <p className="text-xs mt-1" style={{ color: '#BDBDBD' }}>{def.hint}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-lg p-3" style={{ background: '#FAF5FF', border: '1px solid #E9D5FF' }}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#9333EA' }} />
            <p className="text-xs leading-relaxed" style={{ color: '#6B21A8' }}>
              {selected === 'GraphMask'      && 'GraphMask is a global explainer — node selection is only for visualization context.'}
              {selected === 'ProtGNN'        && 'ProtGNN uses embedding-space similarity to prototypes, not edge masks.'}
              {selected === 'NeuronAnalysis' && 'NeuronAnalysis provides global model insights, not per-prediction explanations.'}
              {!['GraphMask','ProtGNN','NeuronAnalysis'].includes(selected) && `${selected} produces per-node subgraph explanations after model training.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
