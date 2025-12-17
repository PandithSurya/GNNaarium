import React, { useState } from 'react';
import { Zap, Settings, Play, RotateCcw } from 'lucide-react';

function Playground({ config, onConfigChange, onStartExperiment, isRunning, onNavigate, user, token, onSignInClick }) {
  const [preset, setPreset] = useState('default');

  const presets = {
    beginner: {
      name: 'Beginner',
      desc: 'Fast training with simple model',
      config: {
        model: { name: 'GCN', hidden_dim: 32, dropout: 0.5, lr: 0.01, epochs: 20, heads: 4 },
        dataset: { name: 'Cora' }
      }
    },
    research: {
      name: 'Research',
      desc: 'High-capacity model for best performance',
      config: {
        model: { name: 'GAT', hidden_dim: 128, dropout: 0.6, lr: 0.005, epochs: 200, heads: 8 },
        dataset: { name: 'PubMed' }
      }
    },
    fast_demo: {
      name: 'Fast Demo',
      desc: 'Quick 10-epoch demo',
      config: {
        model: { name: 'GraphSage', hidden_dim: 64, dropout: 0.5, lr: 0.01, epochs: 10, heads: 4 },
        dataset: { name: 'Cora' }
      }
    },
    attention: {
      name: 'Attention Explorer',
      desc: 'Visualize attention mechanisms',
      config: {
        model: { name: 'GraphTransformer', hidden_dim: 64, dropout: 0.5, lr: 0.01, epochs: 50, heads: 8 },
        dataset: { name: 'Citeseer' },
        explainer: { name: 'GNNExplainer', node_idx: 0 }
      }
    }
  };

  const applyPreset = (presetKey) => {
    setPreset(presetKey);
    const presetConfig = presets[presetKey].config;
    onConfigChange(presetConfig);
    
    // Navigate to show current configuration after applying preset
    setTimeout(() => {
      if (onNavigate) {
        onNavigate();
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="card-neo rounded-2xl shadow-xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-accent">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-neo-primary">Quick Start Presets</h2>
        </div>
        <p className="text-neo-secondary mb-6">
          Choose a preset configuration to get started quickly, or customize your own experiment.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(presets).map(([key, preset]) => (
            <div
              key={key}
              onClick={() => applyPreset(key)}
              className="p-4 card-neo rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
              style={{
                borderColor: 'var(--border)',
                '&:hover': { borderColor: 'var(--accent)' }
              }}
            >
              <h3 className="font-semibold mb-2 text-neo-primary">{preset.name}</h3>
              <p className="text-sm text-neo-secondary mb-3">{preset.desc}</p>
              <div className="text-xs space-y-1 text-neo-secondary">
                <div>Model: {preset.config.model.name}</div>
                <div>Dataset: {preset.config.dataset.name}</div>
                <div>Epochs: {preset.config.model.epochs}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="current-configuration" className="card-neo rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-neo-primary">Current Configuration</h2>
          </div>
          <button
            onClick={() => applyPreset('beginner')}
            className="btn-neo-secondary flex items-center space-x-2 px-4 py-2 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-neo-primary">Model Settings</h3>
            <div className="metric-neo p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neo-secondary">Architecture:</span>
                <span className="font-medium text-neo-primary">{config.model?.name || 'GCN'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neo-secondary">Hidden Dim:</span>
                <span className="font-medium text-neo-primary">{config.model?.hidden_dim || 64}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neo-secondary">Learning Rate:</span>
                <span className="font-medium text-neo-primary">{config.model?.lr || 0.01}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neo-secondary">Epochs:</span>
                <span className="font-medium text-neo-primary">{config.model?.epochs || 50}</span>
              </div>
              {['GAT', 'GraphTransformer', 'KA-GNN'].includes(config.model?.name) && (
                <div className="flex justify-between">
                  <span className="text-neo-secondary">Attention Heads:</span>
                  <span className="font-medium text-neo-primary">{config.model?.heads || 8}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-neo-primary">Experiment Settings</h3>
            <div className="metric-neo p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neo-secondary">Dataset:</span>
                <span className="font-medium text-neo-primary">{config.dataset?.name || 'Cora'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neo-secondary">Attack:</span>
                <span className="font-medium text-neo-primary">{config.attack?.name || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neo-secondary">Defense:</span>
                <span className="font-medium text-neo-primary">{config.defense?.name || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neo-secondary">Explainer:</span>
                <span className="font-medium text-neo-primary">{config.explainer?.name || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center space-y-4">
          {!token || !user ? (
            <div 
              className="alert-neo-warning px-6 py-4 rounded-xl text-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onSignInClick}
            >
              <p className="font-medium text-neo-primary mb-2">🔒 Authentication Required</p>
              <p className="text-sm text-neo-secondary">Click here to sign in with Google and start training</p>
            </div>
          ) : null}
          <button
            onClick={() => {
              console.log('Start Experiment button clicked, isRunning:', isRunning);
              if (!isRunning) {
                onStartExperiment();
              }
            }}
            disabled={isRunning || !token || !user}
            className="btn-neo-primary flex items-center justify-center space-x-3 text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl disabled:opacity-50 w-full sm:w-auto"
          >
            <Play className="w-5 h-5" />
            <span className="truncate">{isRunning ? 'Starting...' : (!token || !user ? 'Sign In Required' : 'Start Experiment')}</span>
          </button>
        </div>
      </div>

      <div className="card-neo rounded-2xl shadow-xl p-6" style={{backgroundColor: 'rgba(0, 184, 217, 0.1)', border: '1px solid var(--primary)'}}>
        <h3 className="font-semibold text-neo-primary-color mb-2">💡 Pro Tip</h3>
        <p className="text-neo-primary-color text-sm">
          Start with the "Beginner" preset to see results quickly, then experiment with different models and datasets. 
          Use "Attention Explorer" to visualize how GAT and GraphTransformer models focus on different parts of the graph.
        </p>
      </div>
    </div>
  );
}

export default Playground;