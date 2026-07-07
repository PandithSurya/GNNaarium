import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, Database, Shield, Brain, Play, History,
  ChevronLeft, ChevronRight, LayoutDashboard, LogOut,
  User, Menu, X, AlertCircle, Network
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

/* ── Node-graph logo SVG ── */
function GNNLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* nodes */}
      <circle cx="12" cy="3.5" r="2"   fill="white" />
      <circle cx="3.5" cy="18" r="2"   fill="white" />
      <circle cx="20.5" cy="18" r="2"  fill="white" />
      <circle cx="12"  cy="12" r="1.5" fill="white" fillOpacity="0.65" />
      {/* edges from center */}
      <line x1="12" y1="5.5"  x2="12"   y2="10.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.9" />
      <line x1="12" y1="12"   x2="5.2"  y2="16.4" stroke="white" strokeWidth="1.3" strokeOpacity="0.9" />
      <line x1="12" y1="12"   x2="18.8" y2="16.4" stroke="white" strokeWidth="1.3" strokeOpacity="0.9" />
      {/* outer dashed edges */}
      <line x1="12" y1="5.5"  x2="5.2"  y2="16.4" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" strokeDasharray="2.5 2" />
      <line x1="12" y1="5.5"  x2="18.8" y2="16.4" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" strokeDasharray="2.5 2" />
      <line x1="5.2" y1="16.4" x2="18.8" y2="16.4" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" strokeDasharray="2.5 2" />
    </svg>
  );
}

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
    config.model?.name     || 'No model',
    config.dataset?.name   || 'No dataset',
    config.attack?.name    || 'No attack',
    config.defense?.name   || 'No defense',
    config.explainer?.name || 'No explainer',
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
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg transition-colors btn-ghost"
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#1A1A1A' }}>
          <span className="text-white text-xs font-semibold">{user.name?.[0]?.toUpperCase() || 'U'}</span>
        </div>
        <span className="text-sm font-medium max-w-[120px] truncate hidden sm:block"
          style={{ color: '#2E2E2E' }}>{user.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl z-50 py-1 overflow-hidden"
          style={{ border: '1px solid #EBEBEB', boxShadow: '0 4px 12px rgb(0 0 0/0.08)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #EBEBEB' }}>
            <p className="text-sm font-semibold truncate" style={{ color: '#0D0D0D' }}>{user.name}</p>
            <p className="text-xs truncate" style={{ color: '#737373' }}>{user.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
            style={{ color: '#E60000' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFF0F0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentView,       setCurrentView]       = useState('homepage');
  const [activeTab,         setActiveTab]          = useState('playground');
  const [sidebarCollapsed,  setSidebarCollapsed]   = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen]  = useState(false);

  const [config, setConfig] = useState({
    dataset:   { name: 'Cora' },
    model:     { name: 'GCN', hidden_dim: 64, dropout: 0.5, lr: 0.01, epochs: 50, seed: 42, weight_decay: 5e-4 },
    attack:    null,
    defense:   null,
    explainer: null,
  });
  const [currentRun,    setCurrentRun]    = useState(null);
  const [isRunning,     setIsRunning]     = useState(false);
  const [trainedConfig, setTrainedConfig] = useState(null);
  const [configChanged, setConfigChanged] = useState(false);
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const nav = [...NAV, ...(user && token ? [{ id: 'history', label: 'History', icon: History }] : [])];
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
      setIsRunning(true); setCurrentRun(null);
      const response = await api.startRun(config);
      setCurrentRun(response.data);
      setTrainedConfig(JSON.parse(JSON.stringify(config)));
      setConfigChanged(false);
      setActiveTab('run');
    } catch (error) {
      if (error.response?.status === 401) { alert('Please sign in'); handleLogout(); }
      else alert('Failed to start run: ' + (error.response?.data?.detail || error.message));
      setIsRunning(false); setCurrentRun(null);
    }
  };

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const IS_DEV = !process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL.includes('localhost');

  const handleGoogleSignIn = () => {
    const origin = window.location.origin;
    if (IS_DEV) {
      window.location.href = `${BACKEND_URL}/auth/dev-login?origin=${encodeURIComponent(origin)}`;
    } else {
      const redirect = currentView === 'homepage' ? '/' : '/playground';
      window.location.href = `${BACKEND_URL}/auth/google/login?redirect_to=${redirect}&origin=${encodeURIComponent(origin)}`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    setToken(null); setUser(null); setCurrentView('homepage');
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
    return <Homepage onTryItOut={() => setCurrentView('platform')} onSignIn={handleGoogleSignIn} user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F5F5' }}>

      {mobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Logo — dark square with node-graph SVG */}
        <div className="flex items-center h-14 px-4 flex-shrink-0" style={{ borderBottom: '1px solid #EBEBEB' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#0D0D0D' }}>
              <GNNLogo size={18} />
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-sm truncate" style={{ color: '#0D0D0D' }}>GNNaarium</span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto hidden lg:flex items-center justify-center w-6 h-6 rounded-md btn-ghost flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
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

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid #EBEBEB' }}>
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#1A1A1A' }}>
                  <span className="text-white text-xs font-semibold">{user.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#0D0D0D' }}>{user.name}</p>
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

      {/* ── Main ── */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''} flex-1 flex flex-col min-w-0 overflow-hidden`}>

        {/* Top bar */}
        <header className="h-14 bg-white flex items-center px-4 gap-3 flex-shrink-0 z-20"
          style={{ borderBottom: '1px solid #EBEBEB' }}>
          <button
            className="lg:hidden btn-ghost btn-sm p-1.5 rounded-md"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <span style={{ color: '#BDBDBD' }}>Experiment</span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D6D6D6' }} />
            <span className="font-medium truncate" style={{ color: '#0D0D0D' }}>{activeNav?.label || 'Overview'}</span>
          </div>

          {/* Config changed — fully monochrome, no red */}
          {configChanged && trainedConfig && (
            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ml-2"
              style={{ background: '#F5F5F5', color: '#525252', border: '1px solid #EBEBEB' }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#737373' }} />
              Config changed — retrain to apply
            </div>
          )}

          <div className="ml-auto">
            <UserMenu user={user} onLogout={handleLogout} onSignIn={handleGoogleSignIn} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-6">

            <div className="card p-3 hidden md:block">
              <ConfigStrip config={config} />
            </div>

            {activeTab === 'playground' && (
              <Playground config={config} onConfigChange={setConfig} onStartExperiment={startRun}
                isRunning={isRunning} user={user} token={token}
                onSignInClick={handleGoogleSignIn} onNavigateToTab={setActiveTab} />
            )}
            {activeTab === 'dataset' && (
              <DatasetSelector config={config.dataset} onChange={(d) => updateConfig('dataset', d)} />
            )}
            {activeTab === 'model' && (
              <ModelConfig config={config.model} onChange={(d) => updateConfig('model', d)} datasetConfig={config.dataset} />
            )}
            {activeTab === 'attack-defense' && (
              <AttackDefenseConfig
                attackConfig={config.attack} defenseConfig={config.defense}
                onAttackChange={(d) => updateConfig('attack', d)}
                onDefenseChange={(d) => updateConfig('defense', d)} />
            )}
            {activeTab === 'explainer' && (
              <ExplainerConfig config={config.explainer} onChange={(d) => updateConfig('explainer', d)} />
            )}
            {activeTab === 'run' && (
              <RunMonitor run={currentRun} config={config}
                onRunComplete={() => { setIsRunning(false); setCurrentRun(null); }}
                onStartRun={startRun} isRunning={isRunning}
                configChanged={configChanged} trainedConfig={trainedConfig}
                user={user} token={token} onSignInClick={handleGoogleSignIn} />
            )}
            {activeTab === 'history' && <ExperimentHistory />}
          </div>
        </main>
      </div>
    </div>
  );
}
