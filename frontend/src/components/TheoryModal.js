import React, { useEffect, useRef } from 'react';
import { X, BookOpen, ExternalLink } from 'lucide-react';

// LaTeX rendering component using KaTeX
function MathFormula({ formula }) {
  const mathRef = useRef(null);

  useEffect(() => {
    if (mathRef.current && window.katex) {
      try {
        window.katex.render(formula, mathRef.current, {
          displayMode: true,
          throwOnError: false,
          strict: false
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        mathRef.current.textContent = formula;
      }
    } else {
      // Fallback if KaTeX is not loaded
      if (mathRef.current) {
        mathRef.current.textContent = formula;
      }
    }
  }, [formula]);

  return (
    <div 
      ref={mathRef}
      className="text-center py-4 text-lg"
      style={{ minHeight: '60px' }}
    />
  );
}

const theoryData = {
  GCN: {
    title: 'Graph Convolutional Network',
    formula: 'H^{(l+1)} = \\sigma\\left(\\tilde{D}^{-1/2}\\tilde{A}\\tilde{D}^{-1/2}H^{(l)}W^{(l)}\\right)',
    explanation: 'GCN uses spectral graph convolutions with symmetric normalization. The adjacency matrix Ã = A + I includes self-loops, D̃ is the degree matrix with D̃_{ii} = Σ_j Ã_{ij}.',
    symbols: {
      'H^{(l+1)}': 'Node features at layer l+1',
      'H^{(l)}': 'Node features at layer l',
      '\\sigma': 'Activation function (ReLU)',
      '\\tilde{A}': 'Adjacency matrix with self-loops (A + I)',
      '\\tilde{D}': 'Degree matrix for normalization',
      'W^{(l)}': 'Learnable weight matrix at layer l'
    },
    papers: [
      { title: 'Semi-Supervised Classification with Graph Convolutional Networks', url: 'https://arxiv.org/abs/1609.02907', authors: 'Kipf & Welling (2017)' }
    ]
  },
  GAT: {
    title: 'Graph Attention Network',
    formula: '\\alpha_{ij} = \\frac{\\exp\\left(\\text{LeakyReLU}\\left(\\vec{a}^T[W\\vec{h}_i \\| W\\vec{h}_j]\\right)\\right)}{\\sum_{k \\in \\mathcal{N}_i} \\exp\\left(\\text{LeakyReLU}\\left(\\vec{a}^T[W\\vec{h}_i \\| W\\vec{h}_k]\\right)\\right)}',
    explanation: 'GAT uses attention mechanisms to weight neighbor contributions. Multi-head attention allows the model to attend to different representation subspaces simultaneously.',
    symbols: {
      '\\alpha_{ij}': 'Attention weight from node i to node j',
      '\\vec{h}_i': 'Feature vector of node i',
      '\\vec{a}': 'Attention mechanism parameter vector',
      'W': 'Linear transformation weight matrix',
      '\\|': 'Concatenation operation',
      '\\mathcal{N}_i': 'Neighborhood of node i',
      'LeakyReLU': 'Activation function allowing small negative values'
    },
    papers: [
      { title: 'Graph Attention Networks', url: 'https://arxiv.org/abs/1710.10903', authors: 'Veličković et al. (2018)' }
    ]
  },
  GIN: {
    title: 'Graph Isomorphism Network',
    formula: 'h_v^{(k+1)} = \\text{MLP}^{(k)}\\left(\\left(1 + \\epsilon^{(k)}\\right) \\cdot h_v^{(k)} + \\sum_{u \\in \\mathcal{N}(v)} h_u^{(k)}\\right)',
    explanation: 'GIN is provably the most powerful GNN for distinguishing graph structures that differ in their topology. The learnable parameter ε allows the model to distinguish between different node degrees.',
    symbols: {
      'h_v^{(k+1)}': 'Updated feature of node v at layer k+1',
      'h_v^{(k)}': 'Current feature of node v at layer k',
      'MLP^{(k)}': 'Multi-layer perceptron at layer k',
      '\\epsilon^{(k)}': 'Learnable parameter (helps distinguish node degrees)',
      '\\sum': 'Sum aggregation over neighbors',
      '\\mathcal{N}(v)': 'Neighbors of node v',
      'h_u^{(k)}': 'Feature of neighbor node u'
    },
    papers: [
      { title: 'How Powerful are Graph Neural Networks?', url: 'https://arxiv.org/abs/1810.00826', authors: 'Xu et al. (2019)' }
    ]
  },
  GraphSage: {
    title: 'GraphSAGE',
    formula: 'h_v^{(k+1)} = \\sigma\\left(W^{(k)} \\cdot \\text{CONCAT}\\left(h_v^{(k)}, \\text{AGG}\\left(\\{h_u^{(k)} : u \\in \\mathcal{N}(v)\\}\\right)\\right)\\right)',
    explanation: 'GraphSAGE samples and aggregates from node neighborhoods using various aggregation functions (mean, LSTM, pooling). Designed for inductive learning on large graphs with unseen nodes.',
    symbols: {
      'h_v^{(k+1)}': 'Updated node v representation at layer k+1',
      'h_v^{(k)}': 'Current node v representation at layer k',
      '\\sigma': 'Non-linear activation function',
      'W^{(k)}': 'Weight matrix at layer k',
      'CONCAT': 'Concatenation of node and neighbor features',
      'AGG': 'Aggregation function (mean, max, LSTM)',
      '\\{h_u^{(k)}\\}': 'Set of neighbor node features',
      '\\mathcal{N}(v)': 'Sampled neighborhood of node v'
    },
    papers: [
      { title: 'Inductive Representation Learning on Large Graphs', url: 'https://arxiv.org/abs/1706.02216', authors: 'Hamilton et al. (2017)' }
    ]
  },
  GraphTransformer: {
    title: 'Graph Transformer',
    formula: '\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
    explanation: 'Applies transformer architecture to graphs using positional encodings and structural attention. Captures long-range dependencies through self-attention mechanisms.',
    symbols: {
      'Q': 'Query matrix (what information to look for)',
      'K': 'Key matrix (what information is available)',
      'V': 'Value matrix (actual information content)',
      'QK^T': 'Attention scores (similarity between queries and keys)',
      'd_k': 'Dimension of key vectors (for scaling)',
      '\\sqrt{d_k}': 'Scaling factor to prevent large attention scores',
      'softmax': 'Converts scores to probability distribution'
    },
    papers: [
      { title: 'A Generalization of Transformer Networks to Graphs', url: 'https://arxiv.org/abs/2012.09699', authors: 'Dwivedi & Bresson (2021)' },
      { title: 'Graphormer: Do We Really Need Deep Graph Neural Networks for Graphs?', url: 'https://arxiv.org/abs/2106.05234', authors: 'Ying et al. (2021)' }
    ]
  },
  'KA-GNN': {
    title: 'Knowledge-Aware Graph Neural Network',
    formula: 'h_v^{(l+1)} = \\sigma\\left(W_1^{(l)}h_v^{(l)} + W_2^{(l)}\\sum_{u \\in \\mathcal{N}(v)} \\alpha_{vu}h_u^{(l)} + W_3^{(l)}k_v\\right)',
    explanation: 'Integrates external knowledge through attention mechanisms. Combines graph structure with domain knowledge for enhanced reasoning capabilities.',
    symbols: {
      'h_v^{(l+1)}': 'Enhanced node representation with knowledge',
      'W_1^{(l)}': 'Weight matrix for self-features',
      'W_2^{(l)}': 'Weight matrix for neighbor aggregation',
      'W_3^{(l)}': 'Weight matrix for external knowledge',
      '\\alpha_{vu}': 'Attention weight between nodes v and u',
      'k_v': 'External knowledge embedding for node v',
      '\\sigma': 'Activation function'
    },
    papers: [
      { title: 'Knowledge-aware Graph Neural Networks with Label Smoothness Regularization', url: 'https://arxiv.org/abs/1905.04426', authors: 'Wang et al. (2019)' }
    ]
  }
};

function TheoryModal({ modelName, isOpen, onClose }) {
  useEffect(() => {
    // Load KaTeX CSS and JS if not already loaded
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      document.head.appendChild(link);
    }
    
    if (!window.katex) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  if (!isOpen || !theoryData[modelName]) return null;

  const theory = theoryData[modelName];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card-neo rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-neo-primary">{theory.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neo-elevated transition-colors"
          >
            <X className="w-5 h-5 text-neo-secondary" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-neo-primary mb-3">Mathematical Formulation</h3>
            <div className="p-6 rounded-lg bg-neo-elevated">
              <MathFormula formula={theory.formula} />
            </div>
          </div>

          {theory.symbols && (
            <div>
              <h3 className="font-semibold text-neo-primary mb-3">Symbol Definitions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(theory.symbols).map(([symbol, meaning], index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-neo-elevated">
                    <div className="flex-shrink-0 w-16">
                      <MathFormula formula={symbol} />
                    </div>
                    <div className="flex-1 text-sm text-neo-secondary pt-2">
                      {meaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-neo-primary mb-3">Explanation</h3>
            <p className="text-neo-secondary leading-relaxed">{theory.explanation}</p>
          </div>

          <div>
            <h3 className="font-semibold text-neo-primary mb-3">Key Papers</h3>
            <div className="space-y-2">
              {theory.papers.map((paper, index) => (
                <a
                  key={index}
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 rounded-lg bg-neo-elevated hover:bg-neo-surface transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-neo-primary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-neo-primary hover:text-neo-primary-color font-medium">{paper.title}</div>
                    {paper.authors && (
                      <div className="text-sm text-neo-secondary mt-1">{paper.authors}</div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TheoryModal;