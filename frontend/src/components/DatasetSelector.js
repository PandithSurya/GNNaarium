import React, { useState, useEffect } from 'react';
import { Upload, Database, Info, BookOpen, Users, Atom, Dna, Globe } from 'lucide-react';
import { api } from '../api';
import { HelpTooltip } from './Tooltip';

function DatasetSelector({ config, onChange }) {
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadFiles, setUploadFiles] = useState({ nodes: null, edges: null });
  const [uploadStats, setUploadStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const datasets = [
    {
      name: 'Cora',
      icon: BookOpen,
      category: 'Citation Network',
      nodes: 2708,
      edges: 5429,
      features: 1433,
      classes: 7,
      featureType: 'Bag-of-words (paper keywords)',
      task: 'Node classification (paper topics)',
      description: 'Scientific publications dataset with citation links. Each node represents a paper, edges are citations.'
    },
    {
      name: 'Citeseer',
      icon: BookOpen,
      category: 'Citation Network',
      nodes: 3327,
      edges: 4732,
      features: 3703,
      classes: 6,
      featureType: 'Bag-of-words (paper keywords)',
      task: 'Node classification (paper topics)',
      description: 'Computer science papers with citation relationships. Smaller but denser than Cora.'
    },
    {
      name: 'PubMed',
      icon: BookOpen,
      category: 'Citation Network',
      nodes: 19717,
      edges: 44338,
      features: 500,
      classes: 3,
      featureType: 'TF-IDF word vectors',
      task: 'Node classification (medical topics)',
      description: 'Biomedical publications from PubMed database. Larger scale citation network.'
    },
    {
      name: 'Reddit',
      icon: Users,
      category: 'Social Network',
      nodes: 232965,
      edges: 11606919,
      features: 602,
      classes: 41,
      featureType: 'Post embeddings',
      task: 'Node classification (community prediction)',
      description: 'Large-scale social network from Reddit posts. Each node is a post, edges connect posts from same user.'
    },
    {
      name: 'MUTAG',
      icon: Atom,
      category: 'Molecular',
      nodes: '17.9 avg',
      edges: '19.8 avg',
      features: 7,
      classes: 2,
      featureType: 'Atom types',
      task: 'Graph classification (mutagenicity)',
      description: 'Chemical compounds dataset. Predict whether molecules are mutagenic (cancer-causing).'
    },
    {
      name: 'PROTEINS',
      icon: Dna,
      category: 'Biological',
      nodes: '39.1 avg',
      edges: '72.8 avg',
      features: 3,
      classes: 2,
      featureType: 'Amino acid types',
      task: 'Graph classification (protein function)',
      description: 'Protein structures dataset. Classify proteins as enzymes or non-enzymes based on structure.'
    },
    {
      name: 'ZINC',
      icon: Atom,
      category: 'Molecular',
      nodes: '23.2 avg',
      edges: '24.9 avg',
      features: 28,
      classes: 'Regression',
      featureType: 'Atom and bond features',
      task: 'Graph regression (molecular properties)',
      description: 'Drug-like molecules from ZINC database. Predict molecular properties like solubility.'
    },
    {
      name: 'OGBN-Arxiv',
      icon: Globe,
      category: 'Academic Network',
      nodes: 169343,
      edges: 1166243,
      features: 128,
      classes: 40,
      featureType: 'Paper embeddings',
      task: 'Node classification (subject areas)',
      description: 'ArXiv papers with citation network. Predict academic subject area of papers.'
    }
  ];

  const handleUpload = async () => {
    if (!uploadFiles.nodes) return;
    
    setLoading(true);
    try {
      const response = await api.uploadDataset(uploadFiles.nodes, uploadFiles.edges);
      setUploadStats(response.data);
      // Use the dataset_id returned from the server
      onChange({ name: response.data.dataset_id, stats: response.data });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-neo rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-neo-primary">Dataset Selection</h2>
          </div>
          <button
            onClick={() => setUploadMode(!uploadMode)}
            className="btn-neo-secondary flex items-center space-x-2 px-4 py-2 rounded-lg"
          >
            <Upload className="w-4 h-4" />
            <span>{uploadMode ? 'Use Built-in' : 'Upload Custom'}</span>
          </button>
        </div>

        {config?.name && config.name.startsWith('custom_') && (
          <div className="mb-4 p-3 rounded-lg" style={{backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6'}}>
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4" style={{color: '#3B82F6'}} />
              <span className="font-medium" style={{color: '#3B82F6'}}>Custom Dataset Selected</span>
            </div>
            <p className="text-sm text-neo-secondary mt-1">Using uploaded dataset: {config.name}</p>
          </div>
        )}

        {!uploadMode ? (
          <div className="space-y-6">
            <h3 className="font-medium text-neo-primary">Available Datasets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((dataset) => {
                const Icon = dataset.icon;
                const isSelected = config?.name === dataset.name;
                return (
                  <div
                    key={dataset.name}
                    onClick={() => {
                      onChange({ name: dataset.name });
                      setUploadStats(null); // Clear upload stats when selecting builtin
                    }}
                    className={`card-neo p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-2 border-primary transform scale-105'
                        : 'border-2 border-transparent hover:border-border-hover'
                    }`}
                    style={{
                      borderColor: isSelected ? 'var(--primary)' : 'transparent',
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
                        <h4 className="font-semibold text-neo-primary">{dataset.name}</h4>
                        <p className="text-xs text-neo-secondary">{dataset.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-neo-secondary mb-3">{dataset.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-neo-secondary mb-2">
                      <div><span className="font-medium">Nodes:</span> {dataset.nodes}</div>
                      <div><span className="font-medium">Edges:</span> {dataset.edges}</div>
                      <div><span className="font-medium">Features:</span> {dataset.features}</div>
                      <div><span className="font-medium">Classes:</span> {dataset.classes}</div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-medium text-neo-primary">Task:</span> <span className="text-neo-primary-color">{dataset.task}</span></p>
                      <p><span className="font-medium text-neo-primary">Features:</span> <span className="text-neo-secondary">{dataset.featureType}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-neo-primary mb-3">Upload Custom Dataset</h3>
              <div className="p-4 rounded-lg" style={{backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6'}}>
                <h4 className="font-medium text-neo-primary mb-2">Dataset Requirements</h4>
                <div className="space-y-3 text-sm text-neo-secondary">
                  <div>
                    <p className="font-medium text-neo-primary">Nodes CSV (Required):</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li><code className="bg-neo-elevated px-1 rounded">id</code> - Unique node identifier (integer)</li>
                      <li><code className="bg-neo-elevated px-1 rounded">label</code> - Node class/target (integer)</li>
                      <li><code className="bg-neo-elevated px-1 rounded">feature1, feature2, ...</code> - Node features (numeric)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-neo-primary">Edges CSV (Optional):</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li><code className="bg-neo-elevated px-1 rounded">source</code> - Source node ID (integer)</li>
                      <li><code className="bg-neo-elevated px-1 rounded">target</code> - Target node ID (integer)</li>
                      <li>If not provided, nodes will be treated as isolated (no edges)</li>
                    </ul>
                  </div>
                  <div className="text-xs">
                    <p><strong>Note:</strong> Node IDs in edges file must match IDs in nodes file. Edges are automatically made bidirectional.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neo-primary mb-2 flex items-center space-x-2">
                  <span>Nodes CSV File <span className="text-red-500">*</span></span>
                  <HelpTooltip content="CSV file containing node information. Must have 'id', 'label', and feature columns." />
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFiles(prev => ({ ...prev, nodes: e.target.files[0] }))}
                  className="input-neo w-full px-3 py-2 rounded-lg"
                />
                <p className="text-xs text-neo-secondary mt-1">
                  Required: id, label, feature columns
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neo-primary mb-2 flex items-center space-x-2">
                  <span>Edges CSV File <span className="text-neo-secondary">(Optional)</span></span>
                  <HelpTooltip content="CSV file defining graph connections. Must have 'source' and 'target' columns. If omitted, nodes will be isolated." />
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFiles(prev => ({ ...prev, edges: e.target.files[0] }))}
                  className="input-neo w-full px-3 py-2 rounded-lg"
                />
                <p className="text-xs text-neo-secondary mt-1">
                  Optional: source, target columns
                </p>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={!uploadFiles.nodes || loading}
              className="btn-neo-primary px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Dataset'}
            </button>
          </div>
        )}

        {uploadStats && (
          <div className="mt-6 p-4 rounded-lg" style={{backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981'}}>
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4" style={{color: '#10B981'}} />
              <span className="font-medium" style={{color: '#10B981'}}>Dataset Uploaded Successfully</span>
            </div>
            <div className="mb-2 text-sm text-neo-secondary">
              <span>Dataset ID: </span>
              <span className="font-mono text-neo-primary">{uploadStats.dataset_id}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-neo-secondary">
              <div>
                <span>Nodes:</span>
                <span className="ml-2 font-medium text-neo-primary">{uploadStats.num_nodes}</span>
              </div>
              <div>
                <span>Edges:</span>
                <span className="ml-2 font-medium text-neo-primary">{uploadStats.num_edges}</span>
              </div>
              <div>
                <span>Features:</span>
                <span className="ml-2 font-medium text-neo-primary">{uploadStats.num_features}</span>
              </div>
              <div>
                <span>Classes:</span>
                <span className="ml-2 font-medium text-neo-primary">{uploadStats.num_classes}</span>
              </div>
              <div>
                <span>Task:</span>
                <span className="ml-2 font-medium text-neo-primary">
                  {uploadStats.task_type === 'node_classification' ? 'Node Classification' : 
                   uploadStats.task_type === 'graph_classification' ? 'Graph Classification' : 
                   uploadStats.task_type}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DatasetSelector;