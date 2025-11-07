import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Info, Network, Layers, Eye, Shuffle, Zap, Brain, CheckCircle, XCircle, Star, Zap as Lightning, Filter } from 'lucide-react';

const models = [
  { 
    value: 'GCN', 
    name: 'GCN', 
    fullName: 'Graph Convolutional Network',
    icon: Network,
    description: 'Uses spectral graph convolutions with localized filters. Good for node classification on homophilic graphs where connected nodes tend to have similar features.',
    strengths: 'Fast, simple, works well on citation networks',
    tasks: 'Node Classification, Link Prediction',
    architecture: '2-layer spectral convolution with ReLU activation'
  },
  { 
    value: 'GIN', 
    name: 'GIN', 
    fullName: 'Graph Isomorphism Network',
    icon: Layers,
    description: 'Maximally powerful GNN that can distinguish any graphs that differ in their structure. Uses sum aggregation and MLPs for theoretical guarantees.',
    strengths: 'Theoretically powerful, good for graph-level tasks',
    tasks: 'Graph Classification, Molecular Property Prediction',
    architecture: 'MLP + sum aggregation with theoretical guarantees'
  },
  { 
    value: 'GAT', 
    name: 'GAT', 
    fullName: 'Graph Attention Network',
    icon: Eye,
    description: 'Uses attention mechanisms to weight neighbor contributions dynamically. Can focus on the most relevant neighbors for each node.',
    strengths: 'Handles heterophilic graphs, interpretable attention weights',
    tasks: 'Node Classification, Social Network Analysis',
    architecture: 'Multi-head attention with 8 heads + ELU activation'
  },
  { 
    value: 'GraphSage', 
    name: 'GraphSage', 
    fullName: 'Graph Sample and Aggregate',
    icon: Shuffle,
    description: 'Samples and aggregates features from node neighborhoods. Designed for inductive learning on large graphs with unseen nodes.',
    strengths: 'Scalable, works on large graphs, inductive capability',
    tasks: 'Large-scale Node Classification, Inductive Learning',
    architecture: 'Sampling + aggregation with mean pooling'
  },
  { 
    value: 'GraphTransformer', 
    name: 'Graph Transformer', 
    fullName: 'Graph Transformer',
    icon: Zap,
    description: 'Applies transformer architecture to graphs using multi-head attention. Captures long-range dependencies between nodes.',
    strengths: 'Captures global patterns, powerful for complex relationships',
    tasks: 'Complex Graph Analysis, Long-range Dependencies',
    architecture: 'Multi-head transformer with 8 attention heads'
  },
  { 
    value: 'KA-GNN', 
    name: 'KA-GNN', 
    fullName: 'Knowledge-Aware GNN',
    icon: Brain,
    description: 'Integrates external knowledge through attention mechanisms. Combines graph structure with domain knowledge for enhanced predictions.',
    strengths: 'Knowledge integration, enhanced reasoning capabilities',
    tasks: 'Knowledge Graph Completion, Reasoning Tasks',
    architecture: 'GCN + multi-head attention + knowledge integration'
  }
];

function ModelConfig({ config, onChange, datasetConfig }) {
  const [showOnlyCompatible, setShowOnlyCompatible] = useState(false);
  
  const updateField = (field, value) => {
    onChange({ ...config, [field]: value });
  };

  const getCompatibility = (datasetName) => {
    const compatibility = {
      'Cora': {
        compatible: ['GCN', 'GAT', 'GraphSage', 'KA-GNN'],
        incompatible: ['GIN', 'GraphTransformer'],
        recommended: 'GCN',
        performance: { 'GCN': 95, 'GAT': 88, 'GraphSage': 85, 'KA-GNN': 82 },
        reasons: {
          'GIN': 'Designed for graph-level tasks, not node classification',
          'GraphTransformer': 'Expects dense molecular graphs with continuous edge features'
        }
      },
      'Citeseer': {
        compatible: ['GCN', 'GAT', 'GraphSage'],
        incompatible: ['GIN', 'GraphTransformer', 'KA-GNN'],
        recommended: 'GAT',
        performance: { 'GCN': 78, 'GAT': 85, 'GraphSage': 80 },
        reasons: {
          'GIN': 'Performs graph-level learning, not node classification',
          'GraphTransformer': 'Requires dense molecular graph data',
          'KA-GNN': 'Relies on external knowledge graphs not available in Citeseer'
        }
      },
      'PubMed': {
        compatible: ['GCN', 'GAT', 'KA-GNN'],
        incompatible: ['GIN', 'GraphSage', 'GraphTransformer'],
        recommended: 'KA-GNN',
        performance: { 'GCN': 82, 'GAT': 86, 'KA-GNN': 89 },
        reasons: {
          'GIN': 'Designed for graph-level tasks',
          'GraphSage': 'May underperform on small homogeneous graphs',
          'GraphTransformer': 'Needs dense feature-rich molecular graphs'
        }
      },
      'Reddit': {
        compatible: ['GraphSage', 'GAT'],
        incompatible: ['GCN', 'GIN', 'GraphTransformer', 'KA-GNN'],
        recommended: 'GraphSage',
        performance: { 'GraphSage': 92, 'GAT': 75 },
        reasons: {
          'GCN': 'Struggles with scalability on massive graphs',
          'GIN': 'Graph-level only, not suitable for node classification',
          'GraphTransformer': 'Computationally expensive for large-scale graphs',
          'KA-GNN': 'Too computationally expensive for Reddit scale'
        }
      },
      'MUTAG': {
        compatible: ['GIN'],
        incompatible: ['GCN', 'GAT', 'GraphSage', 'GraphTransformer', 'KA-GNN'],
        recommended: 'GIN',
        performance: { 'GIN': 88 },
        reasons: {
          'GCN': 'Node-centric, not suitable for graph classification',
          'GAT': 'Designed for node-level tasks, not graph classification',
          'GraphSage': 'Node-level model, incompatible with graph tasks',
          'GraphTransformer': 'Requires continuous 3D edge features not in MUTAG',
          'KA-GNN': 'Node-centric and requires external knowledge'
        }
      },
      'PROTEINS': {
        compatible: ['GIN'],
        incompatible: ['GCN', 'GAT', 'GraphSage', 'GraphTransformer', 'KA-GNN'],
        recommended: 'GIN',
        performance: { 'GIN': 76 },
        reasons: {
          'GCN': 'Node-level model, not for graph classification',
          'GAT': 'Focuses on node-level prediction',
          'GraphSage': 'Node-level prediction, not graph classification',
          'GraphTransformer': 'Requires different molecular encoding',
          'KA-GNN': 'Node-centric, not suitable for graph tasks'
        }
      },
      'ZINC': {
        compatible: ['GraphTransformer'],
        incompatible: ['GCN', 'GIN', 'GAT', 'GraphSage', 'KA-GNN'],
        recommended: 'GraphTransformer',
        performance: { 'GraphTransformer': 84 },
        reasons: {
          'GCN': 'Classification-based, not for regression tasks',
          'GIN': 'Classification-based, lacks regression capability',
          'GAT': 'Classification-focused, not regression',
          'GraphSage': 'Classification model, not for continuous prediction',
          'KA-GNN': 'Classification-based, not designed for regression'
        }
      },
      'OGBN-Arxiv': {
        compatible: ['GCN', 'GraphSage', 'GAT', 'KA-GNN'],
        incompatible: ['GIN', 'GraphTransformer'],
        recommended: 'GraphSage',
        performance: { 'GCN': 72, 'GraphSage': 78, 'GAT': 75, 'KA-GNN': 76 },
        reasons: {
          'GIN': 'Designed for graph-level tasks, not node classification',
          'GraphTransformer': 'Memory-intensive for large graphs, requires dense attention'
        }
      }
    };
    return compatibility[datasetName] || { compatible: [], incompatible: [], reasons: {}, recommended: null, performance: {} };
  };

  const datasetName = datasetConfig?.name;
  const compatibility = useMemo(() => {
    return datasetName ? getCompatibility(datasetName) : null;
  }, [datasetName]);

  const filteredModels = useMemo(() => {
    if (showOnlyCompatible && compatibility?.compatible) {
      return models.filter(model => compatibility.compatible.includes(model.value));
    }
    return models;
  }, [showOnlyCompatible, compatibility?.compatible]);

  const selectedModel = models.find(m => m.value === config.name) || models[0];

  return (
    <div className="card-neo rounded-2xl shadow-xl p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-neo-primary">Model Configuration</h2>
      </div>

      {/* Dataset Compatibility Section */}
      {compatibility && (
        <div className="mb-8 p-6 card-neo rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-neo-primary flex items-center space-x-2 text-lg">
              <span>🧩</span>
              <span>Model Compatibility for {datasetName}</span>
            </h4>
            <button
              onClick={() => setShowOnlyCompatible(!showOnlyCompatible)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showOnlyCompatible 
                  ? 'btn-neo-primary' 
                  : 'btn-neo-secondary'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{showOnlyCompatible ? 'Show All' : 'Filter Compatible'}</span>
            </button>
          </div>
          
          {/* Recommended Model */}
          {compatibility.recommended && (
            <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: 'rgba(0, 184, 217, 0.1)', border: '1px solid var(--primary)'}}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg icon-neo-primary">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-neo-primary-color">Recommended Model</h5>
                  <p className="text-sm text-neo-primary-color">
                    <span className="font-medium">{compatibility.recommended}</span> is the best choice for {datasetName}
                    {compatibility.performance[compatibility.recommended] && 
                      ` (${compatibility.performance[compatibility.recommended]}% expected accuracy)`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compatible Models */}
            <div>
              <h5 className="font-semibold text-neo-primary mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Compatible Models</span>
              </h5>
              <div className="space-y-2">
                {compatibility.compatible.map(model => {
                  const performance = compatibility.performance[model];
                  return (
                    <div 
                      key={model} 
                      className="flex items-center justify-between p-3 rounded-lg" 
                      style={{backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981'}}
                    >
                      <span className="font-medium" style={{color: '#10B981'}}>{model}</span>
                      {performance && (
                        <div className="flex items-center space-x-2">
                          <Lightning className="w-4 h-4" style={{color: '#10B981'}} />
                          <span className="px-2 py-1 rounded text-xs font-medium" style={{color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)'}}>
                            {performance}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Incompatible Models */}
            <div>
              <h5 className="font-semibold mb-3 flex items-center space-x-2" style={{color: '#EF4444'}}>
                <XCircle className="w-5 h-5" />
                <span>Incompatible Models</span>
              </h5>
              <div className="space-y-2">
                {compatibility.incompatible.map(model => (
                  <div key={model} className="p-3 rounded-lg" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444'}}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium" style={{color: '#EF4444'}}>{model}</span>
                      <div className="text-xs" style={{color: '#EF4444'}}>
                        {compatibility.reasons[model] && (
                          <span title={compatibility.reasons[model]}>Why?</span>
                        )}
                      </div>
                    </div>
                    {compatibility.reasons[model] && (
                      <p className="text-xs mt-1" style={{color: '#EF4444'}}>
                        {compatibility.reasons[model]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-neo-primary mb-6">
          Select Model Architecture 
          <span className="text-sm text-neo-secondary">({filteredModels.length} models)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((model) => {
            const Icon = model.icon;
            const isSelected = config.name === model.value;
            return (
              <div
                key={model.value}
                onClick={() => updateField('name', model.value)}
                className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md card-neo ${
                  isSelected ? 'transform scale-105' : ''
                }`}
                style={{
                  backgroundColor: isSelected ? 'rgba(0, 184, 217, 0.1)' : 'var(--bg-surface)',
                  border: isSelected ? '2px solid var(--primary)' : 'none'
                }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'icon-neo-primary' : 'bg-neo-elevated'
                  }`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neo-primary">{model.name}</h4>
                    <p className="text-xs text-neo-secondary">{model.fullName}</p>
                  </div>
                </div>
                <p className="text-sm text-neo-secondary mb-2">{model.description}</p>
                <div className="space-y-1">
                  <p className="text-xs text-neo-primary-color font-medium">Best for: {model.tasks}</p>
                  <p className="text-xs text-neo-secondary">{model.architecture}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-neo-primary mb-4">Training Parameters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-neo-primary mb-2">
            Hidden Dimension
          </label>
          <input
            type="number"
            value={config.hidden_dim}
            onChange={(e) => updateField('hidden_dim', parseInt(e.target.value))}
            className="input-neo w-full px-3 py-2 rounded-lg"
            min="8"
            max="512"
          />
          <p className="text-xs text-neo-secondary mt-1">Size of hidden layers (8-512)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-primary mb-2">
            Dropout Rate
          </label>
          <input
            type="number"
            value={config.dropout}
            onChange={(e) => updateField('dropout', parseFloat(e.target.value))}
            className="input-neo w-full px-3 py-2 rounded-lg"
            min="0"
            max="1"
            step="0.1"
          />
          <p className="text-xs text-neo-secondary mt-1">Regularization (0.0-1.0)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-primary mb-2">
            Learning Rate
          </label>
          <input
            type="number"
            value={config.lr}
            onChange={(e) => updateField('lr', parseFloat(e.target.value))}
            className="input-neo w-full px-3 py-2 rounded-lg"
            min="0.0001"
            max="1"
            step="0.001"
          />
          <p className="text-xs text-neo-secondary mt-1">Optimizer learning rate</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-primary mb-2">
            Epochs
          </label>
          <input
            type="number"
            value={config.epochs}
            onChange={(e) => updateField('epochs', parseInt(e.target.value))}
            className="input-neo w-full px-3 py-2 rounded-lg"
            min="1"
            max="1000"
          />
          <p className="text-xs text-neo-secondary mt-1">Training iterations</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-primary mb-2">
            Weight Decay
          </label>
          <input
            type="number"
            value={config.weight_decay}
            onChange={(e) => updateField('weight_decay', parseFloat(e.target.value))}
            className="input-neo w-full px-3 py-2 rounded-lg"
            min="0"
            max="0.01"
            step="0.0001"
          />
          <p className="text-xs text-neo-secondary mt-1">L2 regularization</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neo-primary mb-2">
            Random Seed
          </label>
          <input
            type="number"
            value={config.seed}
            onChange={(e) => updateField('seed', parseInt(e.target.value))}
            className="input-neo w-full px-3 py-2 rounded-lg"
            min="0"
          />
          <p className="text-xs text-neo-secondary mt-1">For reproducibility</p>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg" style={{backgroundColor: 'rgba(0, 184, 217, 0.1)', border: '1px solid var(--primary)'}}>
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-neo-primary-color mt-0.5" />
          <div className="text-sm text-neo-primary-color">
            <p className="font-medium mb-1 text-neo-primary">Selected: {selectedModel.fullName}</p>
            <p className="mt-2 text-xs text-neo-secondary">All models use 2-layer architecture with ReLU activation and dropout regularization.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelConfig;