import React, { useState } from 'react';
import { Shield, Brain, BarChart3, ArrowRight, Database, Zap, Eye, ChevronDown, ChevronUp, LogOut, User } from 'lucide-react';

function GNNLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="3.5"  r="2"   fill="white" />
      <circle cx="3.5" cy="18"  r="2"   fill="white" />
      <circle cx="20.5" cy="18" r="2"   fill="white" />
      <circle cx="12"  cy="12" r="1.5" fill="white" fillOpacity="0.65" />
      <line x1="12" y1="5.5"  x2="12"   y2="10.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.9" />
      <line x1="12" y1="12"   x2="5.2"  y2="16.4" stroke="white" strokeWidth="1.3" strokeOpacity="0.9" />
      <line x1="12" y1="12"   x2="18.8" y2="16.4" stroke="white" strokeWidth="1.3" strokeOpacity="0.9" />
      <line x1="12" y1="5.5"  x2="5.2"  y2="16.4" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" strokeDasharray="2.5 2" />
      <line x1="12" y1="5.5"  x2="18.8" y2="16.4" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" strokeDasharray="2.5 2" />
      <line x1="5.2" y1="16.4" x2="18.8" y2="16.4" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" strokeDasharray="2.5 2" />
    </svg>
  );
}

const FEATURES = [
  { icon: Brain,     title: 'GNN Architectures',    desc: 'GCN, GAT, GIN, GraphSAGE, GraphTransformer, and KA-GNN with configurable hyperparameters.',  bg: '#FAF5FF', color: '#9333EA' },
  { icon: Shield,    title: 'Attack & Defense',      desc: 'FGSM, PGD, Nettack, Metattack adversarial attacks paired with state-of-the-art defenses.',   bg: '#FFF7ED', color: '#EA580C' },
  { icon: Eye,       title: 'Explainability',        desc: 'GNNExplainer, PGExplainer, SubgraphX, ProtGNN and more for model interpretability.',          bg: '#FAF5FF', color: '#9333EA' },
  { icon: BarChart3, title: 'Real-time Monitoring',  desc: 'Live training metrics streamed over WebSocket with interactive charts and logs.',              bg: '#F0FDF4', color: '#16A34A' },
  { icon: Database,  title: 'Datasets',              desc: 'Cora, Citeseer, PubMed, Reddit, MUTAG, PROTEINS, ZINC, OGBN-Arxiv or upload your own.',       bg: '#ECFEFF', color: '#0891B2' },
  { icon: Zap,       title: 'Quick Start',           desc: 'Prebuilt experiment presets let you go from zero to training in under 30 seconds.',           bg: '#FFFBEB', color: '#D97706' },
];

const STATS = [
  { label: 'Cora · 2,708 nodes',    color: '#9333EA' },
  { label: 'PubMed · 19,717 nodes', color: '#0891B2' },
  { label: '6 GNN architectures',   color: '#16A34A' },
  { label: '6 attack methods',      color: '#EA580C' },
  { label: '6 defense strategies',  color: '#D97706' },
  { label: '6 explainers',          color: '#9333EA' },
];

const FAQS = [
  { q: 'How do Graph Neural Networks work?',    a: 'GNNs use message-passing: each node aggregates features from its neighbors, updates its own representation, and this repeats across layers — enabling nodes to capture information from k-hop neighborhoods. Final representations are used for node classification, link prediction, or graph-level tasks.' },
  { q: 'What datasets are supported?',          a: 'GNNaarium ships with 8 benchmark datasets: Cora, Citeseer, PubMed (citation networks), Reddit (social), MUTAG, PROTEINS (molecular/biological), ZINC, and OGBN-Arxiv. You can also upload custom datasets as CSV files.' },
  { q: 'Do I need a GPU to use the platform?',  a: 'No — the platform runs on CPU by default. Smaller datasets like Cora and Citeseer train in seconds. For PubMed or OGBN-Arxiv, a CUDA-compatible GPU is recommended for faster training.' },
  { q: 'What is an adversarial attack on a GNN?', a: 'Adversarial attacks perturb either node features or graph structure to degrade model predictions. Evasion attacks happen at inference time; poisoning attacks corrupt training data. GNNaarium supports both, letting you measure and improve model robustness.' },
];

const STEPS = [
  { step: '01', title: 'Choose Dataset',       desc: 'Pick a benchmark or upload your own CSV.',               bg: '#ECFEFF', border: '#A5F3FC', color: '#0891B2' },
  { step: '02', title: 'Configure Model',      desc: 'Select a GNN architecture and hyperparameters.',         bg: '#FAF5FF', border: '#E9D5FF', color: '#9333EA' },
  { step: '03', title: 'Add Attack & Defense', desc: 'Test robustness with adversarial scenarios.',            bg: '#FFF7ED', border: '#FED7AA', color: '#EA580C' },
  { step: '04', title: 'Train & Analyze',      desc: 'Monitor live metrics and interpret results.',            bg: '#F0FDF4', border: '#BBF7D0', color: '#16A34A' },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-2">
      {FAQS.map((faq, i) => (
        <div key={i} className="card overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium" style={{ color: '#0D0D0D' }}>{faq.q}</span>
            {open === i
              ? <ChevronUp   className="w-4 h-4 flex-shrink-0" style={{ color: '#BDBDBD' }} />
              : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#BDBDBD' }} />}
          </button>
          {open === i && (
            <div className="px-6 pb-5 pt-4 text-sm leading-relaxed" style={{ borderTop: '1px solid #F5F5F5', color: '#525252' }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Homepage({ onTryItOut, onSignIn, user, onLogout }) {
  return (
    <div className="min-h-screen" style={{ background: '#F5F5F5' }}>

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white" style={{ borderBottom: '1px solid #EBEBEB' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#0D0D0D' }}>
              <GNNLogo size={18} />
            </div>
            <span className="font-semibold" style={{ color: '#0D0D0D' }}>GNNaarium</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm hidden sm:block" style={{ color: '#525252' }}>{user.name}</span>
                <button onClick={onTryItOut} className="btn-md"
                  style={{ background: '#0D0D0D', color: '#FFFFFF' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0D0D0D'}
                >Open Platform</button>
                <button onClick={onLogout} className="btn-md btn-secondary" style={{ padding: '8px' }}>
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={onSignIn} className="btn-md btn-secondary hidden sm:flex">
                  <User className="w-4 h-4" /> Sign in
                </button>
                <button onClick={onTryItOut} className="btn-md"
                  style={{ background: '#0D0D0D', color: '#FFFFFF' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0D0D0D'}
                >Get started</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#F5F5F5', color: '#525252', border: '1px solid #EBEBEB' }}>
            <span className="status-dot-dark" />
            Open research platform
          </div>
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight max-w-3xl mx-auto" style={{ color: '#0D0D0D', textWrap: 'balance' }}>
            Graph Neural Network<br />
            <span style={{ color: '#0D0D0D' }}>Robustness Analysis</span>
          </h1>
          <p className="mt-6 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#737373', textWrap: 'balance' }}>
            Train, attack, defend, and explain GNN models in a professional research environment.
            Built for AI researchers, ML engineers, and universities.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <button onClick={onTryItOut} className="btn-lg gap-2"
              style={{ background: '#0D0D0D', color: '#FFFFFF', fontSize: '15px', padding: '10px 24px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
              onMouseLeave={e => e.currentTarget.style.background = '#0D0D0D'}
            >
              Start experimenting <ArrowRight className="w-4 h-4" />
            </button>
            {!user && (
              <button onClick={onSignIn} className="btn-lg btn-secondary" style={{ fontSize: '15px', padding: '10px 24px' }}>
                Sign in with Google
              </button>
            )}
          </div>
        </section>

        {/* Stats strip */}
        <section className="bg-white" style={{ borderTop: '1px solid #EBEBEB', borderBottom: '1px solid #EBEBEB' }}>
          <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {STATS.map(s => (
              <span key={s.label} className="text-sm font-medium" style={{ color: s.color }}>{s.label}</span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold tracking-tight" style={{ color: '#0D0D0D' }}>Everything you need to study GNN robustness</h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: '#737373' }}>A comprehensive toolkit covering the full experiment lifecycle.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, bg, color }) => (
              <div key={title} className="card p-6 transition-shadow duration-200 hover:shadow-sm">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#0D0D0D' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#737373' }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="bg-white" style={{ borderTop: '1px solid #EBEBEB', borderBottom: '1px solid #EBEBEB' }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-semibold tracking-tight" style={{ color: '#0D0D0D' }}>How it works</h2>
              <p className="mt-3" style={{ color: '#737373' }}>A structured workflow from dataset to insights.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {STEPS.map(({ step, title, desc, bg, border, color }) => (
                <div key={step} className="text-center">
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center mx-auto mb-4" style={{ background: bg, borderColor: border }}>
                    <span className="text-xs font-bold" style={{ color }}>{step}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: '#0D0D0D' }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#737373' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold tracking-tight" style={{ color: '#0D0D0D' }}>Frequently asked questions</h2>
          </div>
          <FAQ />
        </section>

        {/* CTA */}
        <section style={{ background: '#0D0D0D' }} className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-semibold text-white tracking-tight">Ready to explore GNN robustness?</h2>
            <p className="mt-4 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>Start your first experiment in under a minute.</p>
            <button
              onClick={onTryItOut}
              className="mt-8 btn-lg gap-2 font-semibold"
              style={{ background: 'white', color: '#0D0D0D', padding: '10px 32px', fontSize: '15px' }}
            >
              Open the platform <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white" style={{ borderTop: '1px solid #EBEBEB' }}>
          <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#0D0D0D' }}>
                <GNNLogo size={12} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#525252' }}>GNNaarium</span>
            </div>
            <p className="text-xs" style={{ color: '#BDBDBD' }}>Graph Neural Network robustness research platform.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
