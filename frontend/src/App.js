import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, Database, Shield, Brain, Play, History,
  ChevronLeft, ChevronRight, LayoutDashboard, LogOut,
  User, Menu, X, Network, Settings
} from 'lucide-react';
import Homepage from './components/Homepage';
import DatasetSelector from './components/DatasetSelector';
import ModelConfig from './components/ModelConfig';
import AttackDefenseConfig from './components/AttackDefenseConfig';
import ExplainerConfig from './components/ExplainerConfig';
import RunMonitor from './components/RunMonitor';
import Playground from './components/Playground';
import ExperimentHistory from './components/ExperimentHistory';
import { api } from './api';

const NAV = [
  { id: 'playground',     label: 'Quick Start',     icon: Zap },
  { id: 'dataset',        label: 'Dataset',          icon: Database },
  { id: 'model',          label: 'Model',            icon: Brain },
  { id: 'attack-defense', label: 'Attack & Defense', icon: Shield },
  { id: 'explainer',      label: 'Explainer',        icon: Network },
  { id: 'run',            label: 'Training Monitor', icon: Play },
];

function ConfigStrip({ config }) {
  const chips = [
    config.model?.name    || 'No model',
    config.dataset?.name  || 'No dataset',
    config.attack?.name   || 'No attack',
    config.defense?.name  || 'No defense',
    config.explainer?.name|| 'No explainer',
  ];
  return (
    <div className="config-strip">
      {chips.map((c, i) => <span key={i} className="config-chip">{c}</span>)}
    </div>
  );
}

function UserMenu({ user, onLogout, onSignIn }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) {
    return (
      <button onClick={onSignIn} className="btn-md btn-primary">
        <User className="w-4 h-4" /> Sign in
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg transition-colors hover:bg-w-100"
      >
        <div className="w-7 h-7 rounded-full bg-r-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-semibold">{user.name?.[0]?.toUpperCase() || 'U'}</span>
        </div>
        <span className="text-sm font-medium text-b-300 max-w-[120px] truncate hidden sm:block">{user.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-w-200 rounded-xl shadow-md z-50 py-1 overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #EBEBEB' }}>
            <p className="text-sm font-semibold text-b-500 truncate">{user.name}</p>
            <p className="text-xs text-b-50 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-r-500 hover:bg-r-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [currentView,      setCurrentView]      = useState('homepage');
  const [activeTab,        setActiveTab]         = useState('playground');
  const [sidebarCollapsed, setSidebarCollapsed]  = useState(false);
  const [mobileSidebarOpen,setMobileSidebarOpen] = useState(false);

  const [config, setConfig] = useState({
    dataset:  { name: 'Cora' },
    model:    { name: 'GCN', hidden_dim: 64, dropout: 0.5, lr: 0.01, epochs: 50, seed: 42, weight_decay: 5e-4 },
    attack:   null,
    defense:  null,
    explainer:null,
  });
  const [currentRun,    setCurrentRun]    = useState(null);
  const [isRunning,     setIsRunning]     = useState(false);
  const [trainedConfig, setTrainedConfig] = useState(null);
  const [configChanged, setConfigChanged] = useState(false);
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const nav = [
    ...NAV,
    ...(user && token ? [{ id: 'history', label: 'History', icon: History }] : []),
  ];

  const activeNav = nav.find(n => n.id === activeTab);

  const updateConfig = (section, data) => {
    setConfig(prev => {
      const next = { ...prev, [section]: data };
      if (trainedConfig) setConfigChanged(JSON.stringify(next) !== JSON.stringify(trainedConfig));
      return next;
    });
  };

  const startRun = async () => {
    if (!token || !user) { alert('Please sign in to start training'); return; }
    if (isRunning) return;
    try {
      setIsRunning(true);
      setCurrentRun(null);
      const response = await api.startRun(config);
      setCurrentRun(response.data);
      setTrainedConfig(JSON.parse(JSON.stringify(config)));
      setConfigChanged(false);
      setActiveTab('run');
    } catch (error) {
      if (error.response?.status === 401) { alert('Please sign in'); handleLogout(); }
      else alert('Failed to start run: ' + (error.response?.data?.detail || error.message));
      setIsRunning(false);
      setCurrentRun(null);
    }
  };

  const handleGoogleSignIn = () => {
    const redirect = currentView === 'homepage' ? '/' : '/playground';
    window.location.href = `http://localhost:8000/auth/google/login?redirect_to=${redirect}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null); setUser(null);
    setCurrentView('homepage');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get('token');
    const userData  = params.get('user');
    if (authToken && userData) {
      const userObj = JSON.parse(decodeURIComponent(userData));
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userObj));
      setToken(authToken); setUser(userObj);
      setCurrentView(window.location.pathname === '/playground' ? 'platform' : 'homepage');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (token) {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    }
  }, [token]);

  if (currentView === 'homepage') {
    return (
      <Homepage
        onTryItOut={() => setCurrentView('platform')}
        onSignIn={handleGoogleSignIn}
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F5F5' }}>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center h-14 px-4 flex-shrink-0" style={{ borderBottom: '1px solid #EBEBEB' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-r-500 flex items-center justify-center flex-shrink-0">
              <Network className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-b-500 text-sm truncate">GNNaarium</span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto hidden lg:flex items-center justify-center w-6 h-6 rounded-md btn-ghost flex-shrink-0"
          >
            {sidebarCollapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft  className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-none">
          <button
            onClick={() => setCurrentView('homepage')}
            className={`nav-item w-full ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
          >
            <LayoutDashboard className="nav-icon" />
            {!sidebarCollapsed && <span>Home</span>}
          </button>

          <div className={`${!sidebarCollapsed ? 'px-3 pt-4 pb-1' : 'px-2 pt-4 pb-1'}`}>
            {!sidebarCollapsed
              ? <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#BDBDBD' }}>Experiment</p>
              : <div className="divider" />
            }
          </div>

          {nav.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                className={`nav-item w-full ${activeTab === item.id ? 'active' : ''} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className="nav-icon" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        {!sidebarCollapsed && (
          <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid #EBEBEB' }}>
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-r-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">{user.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-b-500 truncate">{user.name}</p>
                  <p className="text-xs truncate" style={{ color: '#737373' }}>{user.email}</p>
                </div>
                <button onClick={handleLogout} className="btn-ghost btn-sm p-1.5 rounded-md">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={handleGoogleSignIn} className="btn-md btn-primary w-full">
                <User className="w-4 h-4" /> Sign in
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''} flex-1 flex flex-col min-w-0 overflow-hidden`}>

        {/* Top bar */}
        <header className="h-14 bg-white flex items-center px-4 gap-3 flex-shrink-0 z-20" style={{ borderBottom: '1px solid #EBEBEB' }}>
          <button
            className="lg:hidden btn-ghost btn-sm p-1.5 rounded-md"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <span style={{ color: '#BDBDBD' }}>Experiment</span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D6D6D6' }} />
            <span className="font-medium text-b-500 truncate">{activeNav?.label || 'Overview'}</span>
          </div>

          {/* Config changed warning */}
          {configChanged && trainedConfig && (
            <div className="hidden md:flex items-center gap-1.5 badge-red px-3 py-1.5 rounded-lg text-xs font-medium ml-2">
              <div className="status-dot-red" />
              Config changed — retrain to apply
            </div>
          )}

          <div className="ml-auto">
            <UserMenu user={user} onLogout={handleLogout} onSignIn={handleGoogleSignIn} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">

            {/* Config strip */}
            <div className="card p-3 hidden md:block">
              <ConfigStrip config={config} />
            </div>

            {activeTab === 'playground' && (
              <Playground
                config={config}
                onConfigChange={setConfig}
                onStartExperiment={startRun}
                isRunning={isRunning}
                user={user}
                token={token}
                onSignInClick={handleGoogleSignIn}
                onNavigateToTab={setActiveTab}
              />
            )}
            {activeTab === 'dataset' && (
              <DatasetSelector config={config.dataset} onChange={(d) => updateConfig('dataset', d)} />
            )}
            {activeTab === 'model' && (
              <ModelConfig config={config.model} onChange={(d) => updateConfig('model', d)} datasetConfig={config.dataset} />
            )}
            {activeTab === 'attack-defense' && (
              <AttackDefenseConfig
                attackConfig={config.attack}
                defenseConfig={config.defense}
                onAttackChange={(d) => updateConfig('attack', d)}
                onDefenseChange={(d) => updateConfig('defense', d)}
              />
            )}
            {activeTab === 'explainer' && (
              <ExplainerConfig config={config.explainer} onChange={(d) => updateConfig('explainer', d)} />
            )}
            {activeTab === 'run' && (
              <RunMonitor
                run={currentRun}
                config={config}
                onRunComplete={() => { setIsRunning(false); setCurrentRun(null); }}
                onStartRun={startRun}
                isRunning={isRunning}
                configChanged={configChanged}
                trainedConfig={trainedConfig}
                user={user}
                token={token}
                onSignInClick={handleGoogleSignIn}
              />
            )}
            {activeTab === 'history' && <ExperimentHistory />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
