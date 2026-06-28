import React, { useState } from 'react';
import { Upload, CheckCircle2, Info } from 'lucide-react';
import { api } from '../api';

const CATEGORY_STYLE = {
  Citation:   { bg: '#ECFEFF', color: '#0891B2', border: '#A5F3FC' },
  Social:     { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  Molecular:  { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  Biological: { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
  Academic:   { bg: '#FAF5FF', color: '#9333EA', border: '#E9D5FF' },
};

const TASK_STYLE = {
  'Node classification':  { color: '#0891B2' },
  'Graph classification': { color: '#D97706' },
  'Graph regression':     { color: '#9333EA' },
};

const DATASETS = [
  { name: 'Cora',        category: 'Citation',   nodes: '2,708',   edges: '5,429',   features: 1433, classes: 7,   task: 'Node classification',  desc: 'Scientific publications with citation links. Standard node classification benchmark.' },
  { name: 'Citeseer',   category: 'Citation',   nodes: '3,327',   edges: '4,732',   features: 3703, classes: 6,   task: 'Node classification',  desc: 'Computer science papers with citation relationships. Denser than Cora.' },
  { name: 'PubMed',     category: 'Citation',   nodes: '19,717',  edges: '44,338',  features: 500,  classes: 3,   task: 'Node classification',  desc: 'Biomedical publications from PubMed. Larger-scale citation network.' },
  { name: 'Reddit',     category: 'Social',     nodes: '232,965', edges: '11.6M',   features: 602,  classes: 41,  task: 'Node classification',  desc: 'Large-scale social network from Reddit posts. Inductive learning benchmark.' },
  { name: 'MUTAG',      category: 'Molecular',  nodes: '17.9 avg',edges: '19.8 avg',features: 7,    classes: 2,   task: 'Graph classification', desc: 'Chemical compounds dataset. Predict mutagenicity.' },
  { name: 'PROTEINS',   category: 'Biological', nodes: '39.1 avg',edges: '72.8 avg',features: 3,    classes: 2,   task: 'Graph classification', desc: 'Protein structure graphs. Classify proteins as enzymes or non-enzymes.' },
  { name: 'ZINC',       category: 'Molecular',  nodes: '23.2 avg',edges: '24.9 avg',features: 28,   classes: '—', task: 'Graph regression',     desc: 'Drug-like molecules from ZINC database. Predict molecular properties.' },
  { name: 'OGBN-Arxiv', category: 'Academic',   nodes: '169,343', edges: '1.17M',   features: 128,  classes: 40,  task: 'Node classification',  desc: 'arXiv paper citation network. Large-scale OGB benchmark.' },
];

export default function DatasetSelector({ config, onChange }) {
  const [uploadMode,  setUploadMode]  = useState(false);
  const [files,       setFiles]       = useState({ nodes: null, edges: null });
  const [uploadStats, setUploadStats] = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const handleUpload = async () => {
    if (!files.nodes) return;
    setLoading(true); setError(null);
    try {
      const res = await api.uploadDataset(files.nodes, files.edges);
      setUploadStats(res.data);
      onChange({ name: res.data.dataset_id, stats: res.data });
    } catch (e) {
      setError(e.response?.data?.detail || 'Upload failed. Check your CSV format.');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="section-header">
          <div>
            <h2 className="section-title">Dataset</h2>
            <p className="section-desc">Select a benchmark dataset or upload your own graph data.</p>
          </div>
          <button
            onClick={() => { setUploadMode(!uploadMode); setUploadStats(null); setError(null); }}
            className="btn-md btn-secondary gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploadMode ? 'Browse datasets' : 'Upload CSV'}
          </button>
        </div>

        {/* Custom active notice */}
        {config?.name?.startsWith('custom_') && (
          <div className="flex items-center gap-2 rounded-lg px-4 py-2.5 mb-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#16A34A' }} />
            <span className="text-sm font-medium" style={{ color: '#15803D' }}>Custom dataset active: <code className="font-mono">{config.name}</code></span>
          </div>
        )}

        {/* Built-in grid */}
        {!uploadMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {DATASETS.map(ds => {
              const selected = config?.name === ds.name;
              const catStyle  = CATEGORY_STYLE[ds.category] || { bg: '#F5F5F5', color: '#525252', border: '#EBEBEB' };
              const taskStyle = TASK_STYLE[ds.task] || { color: '#525252' };
              return (
                <button
                  key={ds.name}
                  onClick={() => { onChange({ name: ds.name }); setUploadStats(null); }}
                  className={`select-card text-left ${selected ? 'selected' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm" style={{ color: '#0D0D0D' }}>{ds.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: catStyle.bg, color: catStyle.color }}>{ds.category}</span>
                  </div>
                  <p className="text-xs mb-3 leading-relaxed line-clamp-2" style={{ color: '#737373' }}>{ds.desc}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
                    <span style={{ color: '#BDBDBD' }}>Nodes <span className="font-medium" style={{ color: '#404040' }}>{ds.nodes}</span></span>
                    <span style={{ color: '#BDBDBD' }}>Edges <span className="font-medium" style={{ color: '#404040' }}>{ds.edges}</span></span>
                    <span style={{ color: '#BDBDBD' }}>Feats <span className="font-medium" style={{ color: '#404040' }}>{ds.features}</span></span>
                    <span style={{ color: '#BDBDBD' }}>Classes <span className="font-medium" style={{ color: '#404040' }}>{ds.classes}</span></span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: taskStyle.color }}>{ds.task}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Upload */}
        {uploadMode && (
          <div className="space-y-5">
            <div className="rounded-lg p-4" style={{ background: '#ECFEFF', border: '1px solid #A5F3FC' }}>
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: '#0E7490' }}>
                <Info className="w-4 h-4" /> CSV format requirements
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-xs" style={{ color: '#0E7490' }}>
                <div>
                  <p className="font-semibold mb-1">Nodes CSV (required)</p>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li><code className="font-mono">id</code> — unique integer node ID</li>
                    <li><code className="font-mono">label</code> — integer class/target</li>
                    <li><code className="font-mono">feature1, feature2…</code> — numeric features</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">Edges CSV (optional)</p>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li><code className="font-mono">source</code> — source node ID</li>
                    <li><code className="font-mono">target</code> — target node ID</li>
                    <li>Edges are made bidirectional automatically</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nodes CSV <span style={{ color: '#E60000' }}>*</span></label>
                <input type="file" accept=".csv" onChange={e => setFiles(p => ({ ...p, nodes: e.target.files[0] }))} className="input" />
              </div>
              <div>
                <label className="label">Edges CSV <span style={{ color: '#BDBDBD' }}>(optional)</span></label>
                <input type="file" accept=".csv" onChange={e => setFiles(p => ({ ...p, edges: e.target.files[0] }))} className="input" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm" style={{ background: '#FFF0F0', border: '1px solid #FFB3B3', color: '#B30000' }}>
                {error}
              </div>
            )}

            <button onClick={handleUpload} disabled={!files.nodes || loading} className="btn-md btn-primary" style={{ opacity: (!files.nodes || loading) ? 0.4 : 1 }}>
              {loading ? 'Uploading…' : 'Upload dataset'}
            </button>
          </div>
        )}

        {/* Success */}
        {uploadStats && (
          <div className="mt-5 rounded-lg p-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" style={{ color: '#16A34A' }} />
              <span className="text-sm font-semibold" style={{ color: '#15803D' }}>Upload successful</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {[['Nodes', uploadStats.num_nodes], ['Edges', uploadStats.num_edges], ['Features', uploadStats.num_features], ['Classes', uploadStats.num_classes],
                ['Task', uploadStats.task_type === 'node_classification' ? 'Node Classification' : uploadStats.task_type]].map(([k, v]) => (
                <div key={k}>
                  <p style={{ color: '#737373' }}>{k}</p>
                  <p className="font-semibold mt-0.5" style={{ color: '#0D0D0D' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
