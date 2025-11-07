import React, { useState } from 'react';
import { Target, Shield, AlertTriangle, Zap, Lock, Eye, Crosshair, Bomb, UserX, Info } from 'lucide-react';

function AttackDefenseConfig({ attackConfig, defenseConfig, onAttackChange, onDefenseChange }) {
  const attacks = [
    {
      name: 'FGSM',
      category: 'Evasion',
      icon: Zap,
      description: 'Fast Gradient Sign Method for generating adversarial perturbations on node features.',
      explanation: 'Single-step gradient attack using sign of loss gradient for efficient adversarial examples.',
      compatibleModels: ['GCN', 'GAT'],
      compatibleDefenses: ['Feature Denoising', 'Gradient Regularization']
    },
    {
      name: 'PGD',
      category: 'Evasion', 
      icon: Zap,
      description: 'Projected Gradient Descent attack that iteratively perturbs node features within epsilon constraints.',
      explanation: 'Multi-step gradient-based attack that projects perturbations back to feasible space.',
      compatibleModels: ['GCN', 'GraphTransformer'],
      compatibleDefenses: ['Feature Denoising', 'Gradient Regularization']
    },
    {
      name: 'Nettack',
      category: 'Evasion',
      icon: Target,
      description: 'Targeted adversarial attack that modifies graph structure and node features to fool GNN predictions.',
      explanation: 'Uses gradient information to strategically perturb edges and features for maximum impact.',
      compatibleModels: ['GCN', 'GAT', 'KA-GNN'],
      compatibleDefenses: ['GCN-Jaccard', 'GNNGuard']
    },
    {
      name: 'Metattack',
      category: 'Poisoning',
      icon: Bomb,
      description: 'Meta-learning based poisoning attack that modifies graph structure during training phase.',
      explanation: 'Uses meta-gradients to find optimal graph modifications that degrade model performance.',
      compatibleModels: ['GCN', 'GraphSage'],
      compatibleDefenses: ['Adversarial Training', 'GNNGuard']
    },
    {
      name: 'CLGA',
      category: 'Evasion',
      icon: Target,
      description: 'Contrastive Learning Graph Attack that disrupts contrastive learning mechanisms.',
      explanation: 'Targets contrastive learning by manipulating graph structure to confuse similarity learning.',
      compatibleModels: ['GraphTransformer'],
      compatibleDefenses: ['GNNGuard', 'Feature Denoising']
    },
    {
      name: 'Model Inversion',
      category: 'Privacy',
      icon: UserX,
      description: 'Reconstructs private node attributes from model outputs and graph structure.',
      explanation: 'Privacy attack that inverts model predictions to recover sensitive node features.',
      compatibleModels: ['KA-GNN'],
      compatibleDefenses: ['Differential Privacy']
    }
  ];

  const defenses = [
    {
      name: 'jaccard',
      displayName: 'GCN-Jaccard',
      category: 'Preprocessing',
      icon: Shield,
      description: 'Filters suspicious edges using Jaccard similarity between connected nodes.',
      explanation: 'Removes edges with low feature similarity to defend against structural attacks.',
      compatibleAttacks: ['Nettack', 'CLGA']
    },
    {
      name: 'feature_denoising',
      displayName: 'Feature Denoising',
      category: 'Preprocessing',
      icon: Zap,
      description: 'Smooths node features using neighbor averaging to reduce noise and adversarial perturbations.',
      explanation: 'Applies low-pass filtering to node features to remove high-frequency noise.',
      compatibleAttacks: ['FGSM', 'PGD', 'CLGA']
    },
    {
      name: 'adversarial_training',
      displayName: 'Adversarial Training',
      category: 'Training',
      icon: Target,
      description: 'Trains the model with adversarial examples to improve robustness against attacks.',
      explanation: 'Augments training data with adversarial examples to learn robust representations.',
      compatibleAttacks: ['Nettack', 'PGD', 'FGSM', 'Metattack']
    },
    {
      name: 'Gradient Regularization',
      displayName: 'Gradient Regularization',
      category: 'Training',
      icon: Zap,
      description: 'Applies gradient regularization during training to improve model robustness.',
      explanation: 'Regularizes gradients to prevent overfitting and improve adversarial robustness.',
      compatibleAttacks: ['FGSM', 'PGD']
    },
    {
      name: 'GNNGuard',
      displayName: 'GNNGuard',
      category: 'Preprocessing',
      icon: Eye,
      description: 'Attention-based defense that filters edges based on feature similarity.',
      explanation: 'Uses attention mechanisms to identify and filter suspicious graph connections.',
      compatibleAttacks: ['CLGA', 'Nettack', 'Metattack']
    },
    {
      name: 'differential_privacy',
      displayName: 'Differential Privacy',
      category: 'Privacy Protection',
      icon: Lock,
      description: 'Adds calibrated noise during training to protect individual node privacy.',
      explanation: 'Formal privacy protection that bounds information leakage about training data.',
      compatibleAttacks: ['Model Inversion']
    }
  ];

  const updateAttackField = (field, value) => {
    onAttackChange(attackConfig ? { ...attackConfig, [field]: value } : { name: '', [field]: value });
  };

  const updateDefenseField = (field, value) => {
    onDefenseChange(defenseConfig ? { ...defenseConfig, [field]: value } : { name: '', [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Attack Configuration */}
      <div className="card-neo rounded-2xl shadow-xl p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #EF4444, #F97316)'}}>
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neo-primary">Attack Configuration</h2>
            <p className="text-sm text-neo-secondary">Select adversarial attacks to test model robustness</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-neo-primary mb-2">Select Attack Type</h3>
          <p className="text-neo-secondary mb-6">Choose how to challenge your model's robustness</p>
          
          {/* No Attack Option */}
          <div className="mb-6">
            <div
              onClick={() => onAttackChange(null)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md card-neo ${
                !attackConfig?.name ? 'transform scale-105' : ''
              }`}
              style={{
                borderColor: !attackConfig?.name ? 'var(--border-hover)' : 'var(--border)',
                backgroundColor: !attackConfig?.name ? 'var(--bg-elevated)' : 'var(--bg-surface)'
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className={`p-1 rounded ${
                  !attackConfig?.name ? 'icon-neo-primary' : 'bg-neo-elevated'
                }`}>
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h5 className="font-semibold text-neo-primary">No Attack</h5>
              </div>
              <p className="text-xs text-neo-secondary mb-2">Train model without any adversarial attacks.</p>
              <p className="text-xs text-neo-secondary">Baseline training to evaluate clean model performance.</p>
            </div>
          </div>

          {/* Attack Categories */}
          {['Evasion', 'Poisoning', 'Privacy'].map(category => (
            <div key={category} className="space-y-3">
              <h4 className="font-medium text-neo-primary flex items-center space-x-2">
                <span>{category === 'Evasion' ? '🧠' : category === 'Poisoning' ? '☣️' : '🔒'}</span>
                <span>{category} Attacks</span>
                <div className="relative group">
                  <Info className="w-4 h-4 text-neo-secondary hover:text-neo-primary cursor-help" />
                  <div className="absolute left-0 top-6 w-64 p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
                    {category === 'Evasion' && 'Evasion attacks modify input data at test time to fool trained models into making incorrect predictions without changing the training process.'}
                    {category === 'Poisoning' && 'Poisoning attacks corrupt the training data or process to degrade model performance, affecting the model during training phase.'}
                    {category === 'Privacy' && 'Privacy attacks attempt to extract sensitive information about training data or model parameters through various inference techniques.'}
                  </div>
                </div>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {attacks.filter(attack => attack.category === category).map(attack => {
                  const Icon = attack.icon;
                  const isSelected = attackConfig?.name === attack.name;
                  return (
                    <div
                      key={attack.name}
                      onClick={() => onAttackChange(isSelected ? null : { name: attack.name })}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md card-neo ${
                        isSelected ? 'transform scale-105' : ''
                      }`}
                      style={{
                        borderColor: isSelected ? '#EF4444' : 'var(--border)',
                        backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-surface)'
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`p-1 rounded ${
                          isSelected ? 'bg-red-500 text-white' : 'bg-neo-elevated'
                        }`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <h5 className="font-semibold text-neo-primary">{attack.name}</h5>
                      </div>
                      <p className="text-xs text-neo-secondary mb-2">{attack.description}</p>
                      <p className="text-xs text-neo-secondary mb-2">{attack.explanation}</p>
                      <div className="text-xs text-neo-primary-color">
                        <span className="font-medium">Compatible:</span> {attack.compatibleModels.join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {attackConfig?.name && (
            <div className="mt-6 p-4 card-neo rounded-lg">
              <h4 className="font-medium text-neo-primary mb-3">Attack Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neo-primary mb-2">
                    Budget Percentage
                  </label>
                  <input
                    type="number"
                    value={attackConfig.budget_pct || 0.05}
                    onChange={(e) => updateAttackField('budget_pct', parseFloat(e.target.value))}
                    className="input-neo w-full px-3 py-2 rounded-lg"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                  />
                  <p className="text-xs text-neo-secondary mt-1">Attack strength (0.01-0.5)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Defense Configuration */}
      <div className="card-neo rounded-2xl shadow-xl p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #10B981, #059669)'}}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neo-primary">Defense Configuration</h2>
            <p className="text-sm text-neo-secondary">Choose defense mechanisms to protect your model</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-neo-primary mb-2">Select Defense Mechanism</h3>
          <p className="text-neo-secondary mb-6">Strengthen your model against adversarial attacks</p>
          
          {/* No Defense Option */}
          <div className="mb-6">
            <div
              onClick={() => onDefenseChange(null)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md card-neo ${
                !defenseConfig?.name ? 'transform scale-105' : ''
              }`}
              style={{
                borderColor: !defenseConfig?.name ? 'var(--border-hover)' : 'var(--border)',
                backgroundColor: !defenseConfig?.name ? 'var(--bg-elevated)' : 'var(--bg-surface)'
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className={`p-1 rounded ${
                  !defenseConfig?.name ? 'icon-neo-primary' : 'bg-neo-elevated'
                }`}>
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h5 className="font-semibold text-neo-primary">No Defense</h5>
              </div>
              <p className="text-xs text-neo-secondary mb-2">Train model without any defense mechanisms.</p>
              <p className="text-xs text-neo-secondary">Baseline training to evaluate model vulnerability.</p>
            </div>
          </div>

          {/* Defense Categories */}
          {['Preprocessing', 'Training', 'Privacy Protection'].map(category => (
            <div key={category} className="space-y-3">
              <h4 className="font-medium text-neo-primary flex items-center space-x-2">
                <span>{category === 'Preprocessing' ? '🛡️' : category === 'Training' ? '⚔️' : '🔒'}</span>
                <span>{category} Defenses</span>
                <div className="relative group">
                  <Info className="w-4 h-4 text-neo-secondary hover:text-neo-primary cursor-help" />
                  <div className="absolute left-0 top-6 w-64 p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
                    {category === 'Preprocessing' && 'Preprocessing defenses clean or filter input data before training/inference to remove adversarial perturbations or suspicious patterns.'}
                    {category === 'Training' && 'Training defenses modify the learning process itself to make models more robust against attacks through techniques like adversarial training.'}
                    {category === 'Privacy Protection' && 'Privacy defenses add noise or use cryptographic techniques to prevent information leakage about training data or model parameters.'}
                  </div>
                </div>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {defenses.filter(defense => defense.category === category).map(defense => {
                  const Icon = defense.icon;
                  const isSelected = defenseConfig?.name === defense.name;
                  return (
                    <div
                      key={defense.name}
                      onClick={() => onDefenseChange(isSelected ? null : { name: defense.name })}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md card-neo ${
                        isSelected ? 'transform scale-105' : ''
                      }`}
                      style={{
                        borderColor: isSelected ? '#10B981' : 'var(--border)',
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface)'
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`p-1 rounded ${
                          isSelected ? 'bg-green-500 text-white' : 'bg-neo-elevated'
                        }`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <h5 className="font-semibold text-neo-primary">{defense.displayName}</h5>
                      </div>
                      <p className="text-xs text-neo-secondary mb-2">{defense.description}</p>
                      <p className="text-xs text-neo-secondary mb-2">{defense.explanation}</p>
                      <div className="text-xs" style={{color: '#10B981'}}>
                        <span className="font-medium">Against:</span> {defense.compatibleAttacks.join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {defenseConfig?.name && (
            <div className="mt-6 p-4 card-neo rounded-lg">
              <h4 className="font-medium text-neo-primary mb-3">Defense Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neo-primary mb-2">
                    Threshold
                  </label>
                  <input
                    type="number"
                    value={defenseConfig.threshold || 0.01}
                    onChange={(e) => updateDefenseField('threshold', parseFloat(e.target.value))}
                    className="input-neo w-full px-3 py-2 rounded-lg"
                    min="0.001"
                    max="1"
                    step="0.001"
                  />
                  <p className="text-xs text-neo-secondary mt-1">Defense strength (0.001-1.0)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttackDefenseConfig;