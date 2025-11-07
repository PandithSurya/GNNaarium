import React, { useState } from 'react';
import { Search, Brain, Target, Layers, Zap, Eye, BarChart3 } from 'lucide-react';

function ExplainerConfig({ config, onChange }) {
  const explainers = [
    {
      name: 'GNNExplainer',
      category: 'Post-hoc',
      icon: Search,
      description: 'Baseline post-hoc explainer that optimizes edge masks to identify important subgraphs.',
      explanation: 'Widely used and interpretable method that learns edge importance through gradient-based optimization.',
      strengths: ['Well-established', 'Interpretable results', 'Works with any GNN'],
      limitations: ['Computationally expensive', 'Local explanations only'],
      useCases: ['Node classification', 'Subgraph identification', 'Feature importance']
    },
    {
      name: 'PGExplainer',
      category: 'Post-hoc',
      icon: Brain,
      description: 'Parametric explainer that uses neural networks to generate explanations efficiently.',
      explanation: 'Scalable approach good for real-world datasets with consistent explanation quality.',
      strengths: ['Scalable', 'Fast inference', 'Consistent quality'],
      limitations: ['Requires training', 'Less interpretable'],
      useCases: ['Large-scale graphs', 'Real-time explanations', 'Production systems']
    },
    {
      name: 'SubgraphX',
      category: 'Post-hoc',
      icon: Target,
      description: 'Shapley value-based explainer with strong theoretical grounding for subgraph importance.',
      explanation: 'Uses game theory principles to fairly attribute importance to different graph components.',
      strengths: ['Theoretical guarantees', 'Fair attribution', 'Robust explanations'],
      limitations: ['Computationally intensive', 'Requires sampling'],
      useCases: ['Critical applications', 'Research', 'Fairness-sensitive domains']
    },
    {
      name: 'ProtGNN',
      category: 'Intrinsic',
      icon: Layers,
      description: 'Self-interpretable prototype-based method that provides inherent interpretability.',
      explanation: 'Covers intrinsically interpretable side by learning representative prototypes during training.',
      strengths: ['Inherently interpretable', 'No post-processing', 'Human-friendly'],
      limitations: ['Model architecture dependent', 'May reduce accuracy'],
      useCases: ['Healthcare', 'Legal applications', 'High-stakes decisions']
    },
    {
      name: 'GraphMask',
      category: 'Post-hoc',
      icon: Zap,
      description: 'Edge-masking explainer that integrates structural reasoning for better explanations.',
      explanation: 'Combines edge importance with graph structure understanding for coherent explanations.',
      strengths: ['Structure-aware', 'Coherent explanations', 'Good fidelity'],
      limitations: ['Complex optimization', 'Parameter sensitive'],
      useCases: ['Social networks', 'Molecular graphs', 'Structured data']
    },
    {
      name: 'NeuronAnalysis',
      category: 'Global',
      icon: Eye,
      description: 'Global concept-based explainer that connects neurons to logical concepts.',
      explanation: 'Analyzes internal model representations to understand what concepts the model has learned.',
      strengths: ['Global insights', 'Concept discovery', 'Model debugging'],
      limitations: ['Complex interpretation', 'Requires domain knowledge'],
      useCases: ['Model analysis', 'Concept discovery', 'Debugging']
    }
  ];

  const updateExplainerField = (field, value) => {
    onChange(config ? { ...config, [field]: value } : { name: '', [field]: value });
  };

  return (
    <div className="space-y-8">
      <div className="card-neo rounded-2xl shadow-xl p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg icon-neo-gradient">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neo-primary">Explainer Configuration</h2>
            <p className="text-sm text-neo-secondary">Understand model decisions through interpretability methods</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-neo-primary mb-2">Select Explainer Method</h3>
          <p className="text-neo-secondary mb-6">Choose how to interpret your model's predictions</p>
          
          {/* No Explainer Option */}
          <div className="mb-6">
            <div
              onClick={() => onChange(null)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg card-neo ${
                !config?.name ? 'transform scale-105' : ''
              }`}
              style={{
                borderColor: !config?.name ? 'var(--border-hover)' : 'var(--border)',
                backgroundColor: !config?.name ? 'var(--bg-elevated)' : 'var(--bg-surface)'
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  !config?.name ? 'icon-neo-primary' : 'bg-neo-elevated'
                }`}>
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-neo-primary">No Explainer</h4>
              </div>
              <p className="text-sm text-neo-secondary mb-2">Train and evaluate model without explanation generation.</p>
              <p className="text-xs text-neo-secondary">Baseline mode focusing purely on model performance without interpretability analysis.</p>
            </div>
          </div>

          {/* Explainer Categories */}
          {['Post-hoc', 'Intrinsic', 'Global'].map(category => (
            <div key={category} className="space-y-4">
              <h4 className="font-medium text-neo-primary flex items-center space-x-2">
                <span>{category === 'Post-hoc' ? '🔍' : category === 'Intrinsic' ? '🧠' : '🌐'}</span>
                <span>{category} Explainers</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {explainers.filter(explainer => explainer.category === category).map(explainer => {
                  const Icon = explainer.icon;
                  const isSelected = config?.name === explainer.name;
                  return (
                    <div
                      key={explainer.name}
                      onClick={() => onChange(isSelected ? null : { name: explainer.name })}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg card-neo ${
                        isSelected ? 'transform scale-105' : ''
                      }`}
                      style={{
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)'
                      }}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'icon-neo-primary' : 'bg-neo-elevated'
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-neo-primary">{explainer.name}</h5>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            explainer.category === 'Post-hoc' ? 'text-neo-primary-color' :
                            explainer.category === 'Intrinsic' ? 'text-neo-accent' :
                            'text-neo-secondary'
                          }`} style={{
                            backgroundColor: explainer.category === 'Post-hoc' ? 'rgba(0, 184, 217, 0.1)' :
                            explainer.category === 'Intrinsic' ? 'rgba(139, 92, 246, 0.1)' :
                            'rgba(148, 163, 184, 0.1)'
                          }}>
                            {explainer.category}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-neo-secondary mb-3">{explainer.description}</p>
                      <p className="text-xs text-neo-secondary mb-3">{explainer.explanation}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium" style={{color: '#10B981'}}>Strengths:</span>
                          <p className="text-xs text-neo-secondary">{explainer.strengths.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium" style={{color: '#EF4444'}}>Limitations:</span>
                          <p className="text-xs text-neo-secondary">{explainer.limitations.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-neo-primary-color">Use Cases:</span>
                          <p className="text-xs text-neo-secondary">{explainer.useCases.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {config?.name && (
            <div className="mt-8 p-6 card-neo rounded-xl">
              <h4 className="font-bold text-neo-primary mb-6 flex items-center space-x-2">
                <span>⚙️</span>
                <span>Explainer Parameters</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Target Node Index */}
                <div>
                  <label className="block text-sm font-medium text-neo-primary mb-2">
                    Target Node Index(es)
                  </label>
                  <input
                    type="text"
                    value={config.node_idx || '0'}
                    onChange={(e) => updateExplainerField('node_idx', e.target.value)}
                    className="input-neo w-full px-3 py-2 rounded-lg"
                    placeholder="0,1,2 or single node like 5"
                  />
                  <p className="text-xs text-neo-secondary mt-1">Node(s) to explain (comma-separated, 0-based)</p>
                </div>

                {/* Epochs (for optimization-based explainers) */}
                {['GNNExplainer', 'GraphMask'].includes(config.name) && (
                  <div>
                    <label className="block text-sm font-medium text-neo-primary mb-2">
                      Optimization Epochs
                    </label>
                    <input
                      type="number"
                      value={config.explainer_epochs || 100}
                      onChange={(e) => updateExplainerField('explainer_epochs', parseInt(e.target.value))}
                      className="input-neo w-full px-3 py-2 rounded-lg"
                      min="10"
                      max="500"
                      step="10"
                    />
                    <p className="text-xs text-neo-secondary mt-1">Training epochs for explanation</p>
                  </div>
                )}

                {/* Number of Samples (for SubgraphX) */}
                {config.name === 'SubgraphX' && (
                  <div>
                    <label className="block text-sm font-medium text-neo-primary mb-2">
                      Shapley Samples
                    </label>
                    <input
                      type="number"
                      value={config.num_samples || 50}
                      onChange={(e) => updateExplainerField('num_samples', parseInt(e.target.value))}
                      className="input-neo w-full px-3 py-2 rounded-lg"
                      min="10"
                      max="200"
                      step="10"
                    />
                    <p className="text-xs text-neo-secondary mt-1">Number of samples for Shapley values</p>
                  </div>
                )}

                {/* Number of Prototypes (for ProtGNN) */}
                {config.name === 'ProtGNN' && (
                  <div>
                    <label className="block text-sm font-medium text-neo-primary mb-2">
                      Number of Prototypes
                    </label>
                    <input
                      type="number"
                      value={config.num_prototypes || 5}
                      onChange={(e) => updateExplainerField('num_prototypes', parseInt(e.target.value))}
                      className="input-neo w-full px-3 py-2 rounded-lg"
                      min="1"
                      max="20"
                      step="1"
                    />
                    <p className="text-xs text-neo-secondary mt-1">Number of prototype nodes to find</p>
                  </div>
                )}

                {/* Sparsity Weight */}
                {['GNNExplainer', 'GraphMask'].includes(config.name) && (
                  <div>
                    <label className="block text-sm font-medium text-neo-primary mb-2">
                      Sparsity Weight
                    </label>
                    <input
                      type="number"
                      value={config.sparsity_weight || 0.01}
                      onChange={(e) => updateExplainerField('sparsity_weight', parseFloat(e.target.value))}
                      className="input-neo w-full px-3 py-2 rounded-lg"
                      min="0.001"
                      max="0.1"
                      step="0.001"
                    />
                    <p className="text-xs text-neo-secondary mt-1">Weight for sparsity regularization</p>
                  </div>
                )}

                {/* Learning Rate */}
                {['GNNExplainer', 'GraphMask'].includes(config.name) && (
                  <div>
                    <label className="block text-sm font-medium text-neo-primary mb-2">
                      Learning Rate
                    </label>
                    <input
                      type="number"
                      value={config.lr || 0.01}
                      onChange={(e) => updateExplainerField('lr', parseFloat(e.target.value))}
                      className="input-neo w-full px-3 py-2 rounded-lg"
                      min="0.001"
                      max="0.1"
                      step="0.001"
                    />
                    <p className="text-xs text-neo-secondary mt-1">Learning rate for optimization</p>
                  </div>
                )}

              </div>

              {/* Explainer-specific information */}
              <div className="mt-6 p-4 rounded-xl" style={{backgroundColor: 'rgba(0, 184, 217, 0.1)', border: '1px solid var(--primary)'}}>
                <h5 className="font-bold text-neo-primary-color mb-3 flex items-center space-x-2">
                  <span>💡</span>
                  <span>About {config.name}</span>
                </h5>
                {config.name === 'GNNExplainer' && (
                  <p className="text-sm text-neo-primary-color">
                    Optimizes a learnable edge mask to identify the most important subgraph for the prediction. 
                    Higher epochs provide better explanations but take longer to compute.
                  </p>
                )}
                {config.name === 'PGExplainer' && (
                  <p className="text-sm text-neo-primary-color">
                    Uses a parametric approach with neural networks to generate explanations efficiently. 
                    Provides consistent explanation quality across different inputs.
                  </p>
                )}
                {config.name === 'SubgraphX' && (
                  <p className="text-sm text-neo-primary-color">
                    Computes Shapley values to fairly attribute importance to graph components. 
                    More samples provide more accurate Shapley values but increase computation time.
                  </p>
                )}
                {config.name === 'ProtGNN' && (
                  <p className="text-sm text-neo-primary-color">
                    Finds prototype nodes that are most similar to the target node. 
                    Provides inherently interpretable explanations through representative examples.
                  </p>
                )}
                {config.name === 'GraphMask' && (
                  <p className="text-sm text-neo-primary-color">
                    Learns edge masks while considering graph structure for coherent explanations. 
                    Balances explanation fidelity with structural reasoning.
                  </p>
                )}
                {config.name === 'NeuronAnalysis' && (
                  <p className="text-sm text-neo-primary-color">
                    Analyzes internal model activations to understand learned concepts. 
                    Provides global insights into model behavior and decision-making patterns.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ExplainerConfig;