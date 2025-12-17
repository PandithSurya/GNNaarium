import React from 'react';
import { X, Code, Copy } from 'lucide-react';

const codeExamples = {
  GCN: `import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv

class GCN(torch.nn.Module):
    def __init__(self, num_features, hidden_dim, num_classes, dropout=0.5):
        super().__init__()
        self.conv1 = GCNConv(num_features, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, num_classes)
        self.dropout = dropout

    def forward(self, x, edge_index):
        # First GCN layer
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=self.dropout, training=self.training)
        
        # Second GCN layer
        x = self.conv2(x, edge_index)
        return F.log_softmax(x, dim=1)`,

  GAT: `import torch
import torch.nn.functional as F
from torch_geometric.nn import GATConv

class GAT(torch.nn.Module):
    def __init__(self, num_features, hidden_dim, num_classes, heads=8, dropout=0.6):
        super().__init__()
        self.conv1 = GATConv(num_features, hidden_dim, heads=heads, dropout=dropout)
        self.conv2 = GATConv(hidden_dim * heads, num_classes, heads=1, dropout=dropout)
        self.dropout = dropout

    def forward(self, x, edge_index):
        # Multi-head attention layer
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = self.conv1(x, edge_index)
        x = F.elu(x)
        
        # Output layer
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = self.conv2(x, edge_index)
        return F.log_softmax(x, dim=1)`,

  GIN: `import torch
import torch.nn.functional as F
from torch_geometric.nn import GINConv
from torch.nn import Sequential, Linear, ReLU

class GIN(torch.nn.Module):
    def __init__(self, num_features, hidden_dim, num_classes, dropout=0.5):
        super().__init__()
        
        # MLP for first GIN layer
        mlp1 = Sequential(
            Linear(num_features, hidden_dim),
            ReLU(),
            Linear(hidden_dim, hidden_dim)
        )
        self.conv1 = GINConv(mlp1)
        
        # MLP for second GIN layer
        mlp2 = Sequential(
            Linear(hidden_dim, hidden_dim),
            ReLU(),
            Linear(hidden_dim, num_classes)
        )
        self.conv2 = GINConv(mlp2)
        self.dropout = dropout

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=self.dropout, training=self.training)
        
        x = self.conv2(x, edge_index)
        return F.log_softmax(x, dim=1)`,

  GraphSage: `import torch
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv

class GraphSage(torch.nn.Module):
    def __init__(self, num_features, hidden_dim, num_classes, dropout=0.5):
        super().__init__()
        self.conv1 = SAGEConv(num_features, hidden_dim)
        self.conv2 = SAGEConv(hidden_dim, num_classes)
        self.dropout = dropout

    def forward(self, x, edge_index):
        # Sample and aggregate from neighbors
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=self.dropout, training=self.training)
        
        x = self.conv2(x, edge_index)
        return F.log_softmax(x, dim=1)`
};

function CodeModal({ modelName, isOpen, onClose }) {
  if (!isOpen || !codeExamples[modelName]) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeExamples[modelName]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card-neo rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-neo-primary">{modelName} Implementation</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="btn-neo-secondary flex items-center space-x-2 px-3 py-2 rounded-lg"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neo-elevated transition-colors"
            >
              <X className="w-5 h-5 text-neo-secondary" />
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-100">
            <code>{codeExamples[modelName]}</code>
          </pre>
        </div>

        <div className="mt-4 p-4 rounded-lg" style={{backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6'}}>
          <p className="text-sm text-neo-primary">
            <strong>Note:</strong> This is a simplified implementation. The actual GNNaarium models include additional features like batch normalization, residual connections, and advanced regularization techniques.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CodeModal;