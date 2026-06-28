import React from 'react';
import { Target, Shield, Info } from 'lucide-react';

const ATTACK_CAT_STYLE = {
  Evasion:   { bg: '#FFF0F0', color: '#E60000', border: '#FFB3B3' },
  Poisoning: { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
  Privacy:   { bg: '#FDF2F8', color: '#DB2777', border: '#FBCFE8' },
};

const DEFENSE_CAT_STYLE = {
  Preprocessing:      { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  Training:           { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  'Privacy Protection':{ bg: '#FAF5FF', color: '#9333EA', border: '#E9D5FF' },
};

const ATTACKS = [
  { name: 'FGSM',            category: 'Evasion',   desc: 'Fast Gradient Sign Method. Single-step gradient attack on node features.',            compat: ['GCN','GAT'] },
  { name: 'PGD',             category: 'Evasion',   desc: 'Projected Gradient Descent. Iterative multi-step attack within epsilon constraints.', compat: ['GCN','GraphTransformer'] },
  { name: 'Nettack',         category: 'Evasion',   desc: 'Targeted structural + feature attack using gradient-guided perturbations.',            compat: ['GCN','GAT','KA-GNN'] },
  { name: 'Metattack',       category: 'Poisoning', desc: 'Meta-learning based poisoning attack that corrupts the graph during training.',         compat: ['GCN','GraphSage'] },
  { name: 'CLGA',            category: 'Evasion',   desc: 'Contrastive Learning Graph Attack. Disrupts contrastive self-supervised learning.',    compat: ['GraphTransformer'] },
  { name: 'Model Inversion', category: 'Privacy',   desc: 'Reconstructs private node attributes from model outputs and graph structure.',         compat: ['KA-GNN'] },
];

const DEFENSES = [
  { name: 'jaccard',                display: 'GCN-Jaccard',            category: 'Preprocessing',       desc: 'Filters suspicious edges based on Jaccard feature similarity.',          against: ['Nettack','CLGA'] },
  { name: 'feature_denoising',      display: 'Feature Denoising',      category: 'Preprocessing',       desc: 'Smooths node features via neighbor averaging to reduce perturbations.',   against: ['FGSM','PGD','CLGA'] },
  { name: 'adversarial_training',   display: 'Adversarial Training',   category: 'Training',            desc: 'Augments training with adversarial examples to improve robustness.',      against: ['Nettack','PGD','FGSM','Metattack'] },
  { name: 'Gradient Regularization',display: 'Gradient Regularization',category: 'Training',            desc: 'Regularizes gradients during training to prevent adversarial overfitting.',against: ['FGSM','PGD'] },
  { name: 'GNNGuard',               display: 'GNNGuard',               category: 'Preprocessing',       desc: 'Attention-based defense that prunes suspicious graph connections.',         against: ['CLGA','Nettack','Metattack'] },
  { name: 'differential_privacy',   display: 'Differential Privacy',   category: 'Privacy Protection',  desc: 'Adds calibrated noise during training for formal privacy guarantees.',     against: ['Model Inversion'] },
];

function byCategory(items) {
  return [...new Set(items.map(i => i.category))].map(cat => ({
    cat, items: items.filter(i => i.category === cat),
  }));
}

function Panel({ title, icon: Icon, iconColor, items, catStyles, activeItem, onNone, onSelect, paramComponent, infoText }) {
  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="section-desc mb-5">
          {title === 'Attack' ? 'Choose an adversarial attack to test model robustness.' : 'Choose a defense mechanism to protect your model.'}
        </p>

        {/* None option */}
        <button onClick={onNone} className={`select-card text-left w-full mb-4 ${!activeItem?.name ? 'selected' : ''}`}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#0D0D0D' }}>No {title}</p>
          <p className="text-xs" style={{ color: '#737373' }}>Baseline training without any {title.toLowerCase()}.</p>
        </button>

        {byCategory(items).map(({ cat, items: catItems }) => {
          const cs = catStyles[cat] || { bg: '#F5F5F5', color: '#525252', border: '#EBEBEB' };
          return (
            <div key={cat} className="mt-4">
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3" style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                {cat}
              </span>
              <div className="space-y-2">
                {catItems.map(item => {
                  const isSelected = activeItem?.name === item.name;
                  return (
                    <button key={item.name} onClick={() => onSelect(item)} className={`select-card text-left w-full ${isSelected ? 'selected' : ''}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold" style={{ color: '#0D0D0D' }}>{item.display || item.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cs.bg, color: cs.color }}>{cat}</span>
                      </div>
                      <p className="text-xs leading-relaxed mb-2" style={{ color: '#737373' }}>{item.desc}</p>
                      <p className="text-xs" style={{ color: '#BDBDBD' }}>
                        <span className="font-medium" style={{ color: '#525252' }}>{item.compat ? 'Models:' : 'Against:'}</span>{' '}
                        {(item.compat || item.against).join(', ')}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {paramComponent}
      </div>

      <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#BDBDBD' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#737373' }}>{infoText}</p>
      </div>
    </div>
  );
}

export default function AttackDefenseConfig({ attackConfig, defenseConfig, onAttackChange, onDefenseChange }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Panel
        title="Attack"
        icon={Target}
        iconColor="#E60000"
        items={ATTACKS}
        catStyles={ATTACK_CAT_STYLE}
        activeItem={attackConfig}
        onNone={() => onAttackChange(null)}
        onSelect={item => onAttackChange(attackConfig?.name === item.name ? null : { name: item.name, budget_pct: 0.05 })}
        infoText={<><strong style={{ color: '#E60000' }}>Evasion</strong> attacks perturb at inference time. <strong style={{ color: '#EA580C' }}>Poisoning</strong> corrupts training data. <strong style={{ color: '#DB2777' }}>Privacy</strong> attacks reconstruct sensitive node attributes.</>}
        paramComponent={attackConfig?.name && (
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid #EBEBEB' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: '#525252' }}>Attack parameters</p>
            <div>
              <label className="label">Budget percentage</label>
              <input type="number" value={attackConfig.budget_pct ?? 0.05} onChange={e => onAttackChange({ ...attackConfig, budget_pct: parseFloat(e.target.value) })} min={0.01} max={0.5} step={0.01} className="input w-40" />
              <p className="text-xs mt-1" style={{ color: '#BDBDBD' }}>Attack strength (0.01–0.5)</p>
            </div>
          </div>
        )}
      />
      <Panel
        title="Defense"
        icon={Shield}
        iconColor="#16A34A"
        items={DEFENSES}
        catStyles={DEFENSE_CAT_STYLE}
        activeItem={defenseConfig}
        onNone={() => onDefenseChange(null)}
        onSelect={item => onDefenseChange(defenseConfig?.name === item.name ? null : { name: item.name, threshold: 0.01 })}
        infoText={<><strong style={{ color: '#16A34A' }}>Preprocessing</strong> defenses filter data before training. <strong style={{ color: '#D97706' }}>Training</strong> defenses modify the learning process. <strong style={{ color: '#9333EA' }}>Privacy</strong> defenses bound information leakage.</>}
        paramComponent={defenseConfig?.name && (
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid #EBEBEB' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: '#525252' }}>Defense parameters</p>
            <div>
              <label className="label">Threshold</label>
              <input type="number" value={defenseConfig.threshold ?? 0.01} onChange={e => onDefenseChange({ ...defenseConfig, threshold: parseFloat(e.target.value) })} min={0.001} max={1} step={0.001} className="input w-40" />
              <p className="text-xs mt-1" style={{ color: '#BDBDBD' }}>Defense strength (0.001–1.0)</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
