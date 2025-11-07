import React, { useState } from 'react';
import { Play, Database, Shield, Brain, Settings, Home, Zap, History, User, LogOut } from 'lucide-react';
import Homepage from './components/Homepage';
import DatasetSelector from './components/DatasetSelector';
import ModelConfig from './components/ModelConfig';
import AttackDefenseConfig from './components/AttackDefenseConfig';
import ExplainerConfig from './components/ExplainerConfig';
import RunMonitor from './components/RunMonitor';
import Playground from './components/Playground';
import ExperimentHistory from './components/ExperimentHistory';
import { api } from './api';

function App() {
  const [currentView, setCurrentView] = useState('homepage');
  const [activeTab, setActiveTab] = useState('playground');

  const [config, setConfig] = useState({
    dataset: { name: 'Cora' },
    model: { name: 'GCN', hidden_dim: 64, dropout: 0.5, lr: 0.01, epochs: 50, seed: 42, weight_decay: 5e-4 },
    attack: null,
    defense: null,
    explainer: null
  });
  const [currentRun, setCurrentRun] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const [trainedConfig, setTrainedConfig] = useState(null);
  const [configChanged, setConfigChanged] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const tabs = [
    { id: 'playground', label: 'Playground', icon: Zap },
    { id: 'dataset', label: 'Dataset', icon: Database },
    { id: 'model', label: 'Model', icon: Settings },
    { id: 'attack-defense', label: 'Attack & Defense', icon: Shield },
    { id: 'explainer', label: 'Explainer', icon: Brain },
    { id: 'run', label: 'Run & Monitor', icon: Play },
    ...(user && token ? [{ id: 'history', label: 'History', icon: History }] : [])
  ];

  const startRun = async () => {
    // Check if user is authenticated
    if (!token || !user) {
      alert('Please sign in to start training');
      return;
    }
    
    if (isRunning) {
      console.log('Training already in progress, ignoring duplicate request');
      return; // Prevent duplicate runs
    }
    
    try {
      console.log('Starting training run...');
      setIsRunning(true);
      setCurrentRun(null); // Clear any previous run
      
      const response = await api.startRun(config);
      console.log('Training started with run ID:', response.data.run_id);
      
      setCurrentRun(response.data);
      setTrainedConfig(JSON.parse(JSON.stringify(config)));
      setConfigChanged(false);
      setActiveTab('run');
    } catch (error) {
      console.error('Failed to start run:', error);
      if (error.response?.status === 401) {
        alert('Please sign in to start training');
        handleLogout();
      } else {
        alert('Failed to start run: ' + (error.response?.data?.detail || error.message));
      }
      setIsRunning(false);
      setCurrentRun(null);
    }
  };

  const updateConfig = (section, data) => {
    setConfig(prev => {
      const newConfig = { ...prev, [section]: data };
      if (trainedConfig) {
        const changed = JSON.stringify(newConfig) !== JSON.stringify(trainedConfig);
        setConfigChanged(changed);
      } else {
        setConfigChanged(false);
      }
      return newConfig;
    });
  };

  const handleGoogleSignIn = () => {
    const redirectTo = currentView === 'homepage' ? '/' : '/playground';
    window.location.href = `http://localhost:8000/auth/google/login?redirect_to=${redirectTo}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Always redirect to homepage on logout
    setCurrentView('homepage');
  };

  // Check for auth callback
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token');
    const userData = urlParams.get('user');
    
    if (authToken && userData) {
      const userObj = JSON.parse(decodeURIComponent(userData));
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userObj));
      setToken(authToken);
      setUser(userObj);
      
      // Check if we're on playground path (from redirect)
      if (window.location.pathname === '/playground') {
        setCurrentView('platform');
        setActiveTab('playground');
      } else {
        // Default to homepage if no specific redirect
        setCurrentView('homepage');
      }
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (token) {
      // Try to get user from stored token
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [token, currentView]);

  if (currentView === 'homepage') {
    return <Homepage onTryItOut={() => setCurrentView('platform')} onSignIn={handleGoogleSignIn} user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-neo-primary">
      {/* Header */}
      <header className="header-neo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg icon-neo-gradient">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neo-primary">GNNaarium</h1>
                <p className="text-sm font-medium text-neo-secondary">Advanced Graph Neural Network Analysis Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('homepage')}
                className="btn-neo-secondary flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                <span className="font-medium">Home</span>
              </button>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="card-neo px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-neo-primary-color">{user.name}</p>
                    <p className="text-xs text-neo-accent">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-neo-secondary flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleGoogleSignIn}
                    data-signin-button
                    className="btn-neo-primary flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">Sign in with Google</span>
                  </button>
                  <div className="card-neo px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-neo-primary-color">Ready to Experiment</p>
                    <p className="text-xs text-neo-accent">Configure → Train → Analyze</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="nav-neo flex space-x-2 p-2 rounded-2xl shadow-xl mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-neo flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id ? 'active' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'playground' && (
            <Playground
              config={config}
              onConfigChange={setConfig}
              onStartExperiment={startRun}
              isRunning={isRunning}
              user={user}
              token={token}
              onSignInClick={() => {
                const signInButton = document.querySelector('[data-signin-button]');
                if (signInButton) {
                  signInButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  signInButton.focus();
                }
              }}
              onNavigate={() => {
                setTimeout(() => {
                  const configSection = document.getElementById('current-configuration');
                  if (configSection) {
                    configSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 200);
              }}
            />
          )}

          {activeTab === 'dataset' && (
            <>
              <DatasetSelector
                config={config.dataset}
                onChange={(data) => updateConfig('dataset', data)}
              />
              <div className="card-neo rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-neo-primary">Experiment Configuration</h3>
                  </div>
                  {configChanged && trainedConfig && (
                    <div className="alert-neo-warning px-4 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-sm">
                      <span>⚠️</span>
                      <span className="font-medium">Configuration changed — retrain to apply</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { label: 'Model', value: `${config.model?.name || 'None'} (${config.model?.epochs || 50} epochs)`, icon: '🧠' },
                    { label: 'Dataset', value: config.dataset?.name || 'None', icon: '📊' },
                    { label: 'Attack', value: config.attack?.name || 'None', icon: '⚔️' },
                    { label: 'Defense', value: config.defense?.name || 'None', icon: '🛡️' },
                    { label: 'Explainer', value: config.explainer?.name || 'None', icon: '🔍' }
                  ].map((item, idx) => (
                    <div key={idx} className="metric-neo p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-semibold text-neo-secondary text-sm">{item.label}</span>
                      </div>
                      <p className="metric-neo-value text-sm leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'model' && (
            <>
              <ModelConfig
                config={config.model}
                onChange={(data) => updateConfig('model', data)}
                datasetConfig={config.dataset}
              />
              <div className="card-neo rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-neo-primary">Experiment Configuration</h3>
                  </div>
                  {configChanged && trainedConfig && (
                    <div className="alert-neo-warning px-4 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-sm">
                      <span>⚠️</span>
                      <span className="font-medium">Configuration changed — retrain to apply</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { label: 'Model', value: `${config.model?.name || 'None'} (${config.model?.epochs || 50} epochs)`, icon: '🧠' },
                    { label: 'Dataset', value: config.dataset?.name || 'None', icon: '📊' },
                    { label: 'Attack', value: config.attack?.name || 'None', icon: '⚔️' },
                    { label: 'Defense', value: config.defense?.name || 'None', icon: '🛡️' },
                    { label: 'Explainer', value: config.explainer?.name || 'None', icon: '🔍' }
                  ].map((item, idx) => (
                    <div key={idx} className="metric-neo p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-semibold text-neo-secondary text-sm">{item.label}</span>
                      </div>
                      <p className="metric-neo-value text-sm leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'attack-defense' && (
            <>
              <AttackDefenseConfig
                attackConfig={config.attack}
                defenseConfig={config.defense}
                onAttackChange={(data) => updateConfig('attack', data)}
                onDefenseChange={(data) => updateConfig('defense', data)}
              />
              <div className="card-neo rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-neo-primary">Experiment Configuration</h3>
                  </div>
                  {configChanged && trainedConfig && (
                    <div className="alert-neo-warning px-4 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-sm">
                      <span>⚠️</span>
                      <span className="font-medium">Configuration changed — retrain to apply</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { label: 'Model', value: `${config.model?.name || 'None'} (${config.model?.epochs || 50} epochs)`, icon: '🧠' },
                    { label: 'Dataset', value: config.dataset?.name || 'None', icon: '📊' },
                    { label: 'Attack', value: config.attack?.name || 'None', icon: '⚔️' },
                    { label: 'Defense', value: config.defense?.name || 'None', icon: '🛡️' },
                    { label: 'Explainer', value: config.explainer?.name || 'None', icon: '🔍' }
                  ].map((item, idx) => (
                    <div key={idx} className="metric-neo p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-semibold text-neo-secondary text-sm">{item.label}</span>
                      </div>
                      <p className="metric-neo-value text-sm leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'explainer' && (
            <>
              <div className="card-neo rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-neo-primary">Experiment Configuration</h3>
                  </div>
                  {configChanged && trainedConfig && (
                    <div className="alert-neo-warning px-4 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-sm">
                      <span>⚠️</span>
                      <span className="font-medium">Configuration changed — retrain to apply</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { label: 'Model', value: `${config.model?.name || 'None'} (${config.model?.epochs || 50} epochs)`, icon: '🧠' },
                    { label: 'Dataset', value: config.dataset?.name || 'None', icon: '📊' },
                    { label: 'Attack', value: config.attack?.name || 'None', icon: '⚔️' },
                    { label: 'Defense', value: config.defense?.name || 'None', icon: '🛡️' },
                    { label: 'Explainer', value: config.explainer?.name || 'None', icon: '🔍' }
                  ].map((item, idx) => (
                    <div key={idx} className="metric-neo p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-semibold text-neo-secondary text-sm">{item.label}</span>
                      </div>
                      <p className="metric-neo-value text-sm leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <ExplainerConfig
                config={config.explainer}
                onChange={(data) => updateConfig('explainer', data)}
              />
              <div className="card-neo rounded-2xl shadow-xl p-8" style={{display: 'none'}}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-neo-primary">Experiment Configuration</h3>
                  </div>
                  {configChanged && trainedConfig && (
                    <div className="alert-neo-warning px-4 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-sm">
                      <span>⚠️</span>
                      <span className="font-medium">Configuration changed — retrain to apply</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { label: 'Model', value: `${config.model?.name || 'None'} (${config.model?.epochs || 50} epochs)`, icon: '🧠' },
                    { label: 'Dataset', value: config.dataset?.name || 'None', icon: '📊' },
                    { label: 'Attack', value: config.attack?.name || 'None', icon: '⚔️' },
                    { label: 'Defense', value: config.defense?.name || 'None', icon: '🛡️' },
                    { label: 'Explainer', value: config.explainer?.name || 'None', icon: '🔍' }
                  ].map((item, idx) => (
                    <div key={idx} className="metric-neo p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-semibold text-neo-secondary text-sm">{item.label}</span>
                      </div>
                      <p className="metric-neo-value text-sm leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'run' && (
            <RunMonitor
              run={currentRun}
              config={config}
              onRunComplete={() => {
                console.log('Training completed, resetting state');
                setIsRunning(false);
                setCurrentRun(null);
              }}
              onStartRun={startRun}
              isRunning={isRunning}
              configChanged={configChanged}
              trainedConfig={trainedConfig}
              user={user}
              token={token}
              onSignInClick={() => {
                const signInButton = document.querySelector('[data-signin-button]');
                if (signInButton) {
                  signInButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  signInButton.focus();
                }
              }}
            />
          )}

          {activeTab === 'history' && (
            <ExperimentHistory />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;