import React, { useState } from 'react';
import { Brain, Network, Shield, Eye, ArrowRight, Zap, Target, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do GNNs work?",
      answer: "Graph Neural Networks operate through a sophisticated message-passing framework that enables nodes to learn from their local graph structure:\n\n🔄 Message Passing: Each node collects information from its immediate neighbors, creating 'messages' that contain relevant features and structural information.\n\n🧮 Aggregation: These messages are combined using functions like sum, mean, or max pooling to create a neighborhood representation.\n\n🔄 Update: The node updates its own representation by combining its current features with the aggregated neighborhood information through learnable neural networks.\n\n📈 Multi-layer Learning: This process repeats across multiple layers, allowing nodes to capture information from increasingly distant parts of the graph (k-hop neighborhoods).\n\n🎯 Task-specific Output: Final node representations are used for downstream tasks like node classification, link prediction, or graph-level predictions."
    },
    {
      question: "How can graph data be represented?",
      answer: "Graph data can be represented in several computational formats, each with specific advantages:\n\n📊 Adjacency Matrix: A square matrix A where A[i,j] = 1 if nodes i and j are connected. Simple but memory-intensive for large sparse graphs.\n\n📝 Edge List: A list of tuples (u,v) representing connections. Memory-efficient and easy to process, commonly used in modern frameworks.\n\n📋 Adjacency List: Each node maintains a list of its neighbors. Efficient for sparse graphs and neighbor traversal operations.\n\n🏷️ Node Features: Stored as feature matrices X where each row represents a node's attributes (e.g., text embeddings, numerical features).\n\n⚡ Sparse Representations: Modern libraries like PyTorch Geometric use COO (Coordinate) format for efficient storage and GPU computation.\n\n🔗 Edge Features: Additional edge attributes can be stored separately for weighted or attributed graphs."
    },
    {
      question: "What are the different types of GNNs?",
      answer: "Our platform supports six major GNN architectures, each with unique strengths:\n\n🌊 GCN (Graph Convolutional Network): The foundational architecture using spectral graph theory. Performs localized convolutions by averaging neighbor features, ideal for homophilic graphs where similar nodes connect.\n\n🔍 GIN (Graph Isomorphism Network): Theoretically the most expressive GNN for distinguishing graph structures. Uses injective aggregation functions and is particularly effective for graph-level tasks and molecular property prediction.\n\n👁️ GAT (Graph Attention Network): Employs multi-head attention mechanisms to learn adaptive importance weights for neighbors. Excellent for heterophilic graphs and provides interpretable attention scores.\n\n🎯 GraphSage: Designed for large-scale graphs using neighbor sampling and inductive learning. Can generalize to unseen nodes and is highly scalable for production systems.\n\n🤖 GraphTransformer: Adapts the transformer architecture to graphs using positional encodings and global attention. Captures long-range dependencies and excels in complex reasoning tasks.\n\n🧠 KA-GNN (Knowledge-Aware GNN): Integrates external knowledge bases with graph learning. Uses attention mechanisms to incorporate domain knowledge, enhancing performance on knowledge-intensive tasks."
    },
    {
      question: "Model Comparison Matrix",
      answer: (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20">
              <thead>
                <tr className="bg-white bg-opacity-20">
                  <th className="px-4 py-3 text-left text-white font-semibold">Model</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">Complexity</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">Attention</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Best For</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Speed</th>
                  <th className="px-4 py-3 text-left text-white font-semibold">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white border-opacity-10">
                  <td className="px-4 py-3 text-white font-medium">GCN</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Low</span></td>
                  <td className="px-4 py-3 text-center text-white">—</td>
                  <td className="px-4 py-3 text-gray-100">Node Classification</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '95%'}}></div>
                      </div>
                      <span className="text-white text-sm">95%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-white text-sm">85%</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-t border-white border-opacity-10">
                  <td className="px-4 py-3 text-white font-medium">GIN</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">Medium</span></td>
                  <td className="px-4 py-3 text-center text-white">—</td>
                  <td className="px-4 py-3 text-gray-100">Graph Classification</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-white text-sm">85%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '88%'}}></div>
                      </div>
                      <span className="text-white text-sm">88%</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-t border-white border-opacity-10">
                  <td className="px-4 py-3 text-white font-medium">GAT</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">Medium</span></td>
                  <td className="px-4 py-3 text-center text-white">👁️</td>
                  <td className="px-4 py-3 text-gray-100">Attention-based Learning</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                      <span className="text-white text-sm">75%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                      </div>
                      <span className="text-white text-sm">90%</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-t border-white border-opacity-10">
                  <td className="px-4 py-3 text-white font-medium">GraphSAGE</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">Medium</span></td>
                  <td className="px-4 py-3 text-center text-white">—</td>
                  <td className="px-4 py-3 text-gray-100">Large Graphs</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '90%'}}></div>
                      </div>
                      <span className="text-white text-sm">90%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>
                      <span className="text-white text-sm">87%</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-t border-white border-opacity-10">
                  <td className="px-4 py-3 text-white font-medium">GraphTransformer</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">High</span></td>
                  <td className="px-4 py-3 text-center text-white">👁️</td>
                  <td className="px-4 py-3 text-gray-100">Long-range Dependencies</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-white text-sm">60%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                      </div>
                      <span className="text-white text-sm">92%</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-t border-white border-opacity-10">
                  <td className="px-4 py-3 text-white font-medium">KA-GNN</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">Medium</span></td>
                  <td className="px-4 py-3 text-center text-white">👁️</td>
                  <td className="px-4 py-3 text-gray-100">Knowledge Graphs</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '70%'}}></div>
                      </div>
                      <span className="text-white text-sm">70%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '89%'}}></div>
                      </div>
                      <span className="text-white text-sm">89%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 rounded-lg p-3">
            <p className="text-blue-100 text-sm">
              💡 <strong>Tip:</strong> Choose GAT or GraphTransformer for attention-based learning. Use GraphSAGE for large-scale graphs. GCN is great for quick experiments.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="bg-white bg-opacity-10 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white hover:bg-opacity-5 transition-colors"
          >
            <span className="text-white font-semibold">{faq.question}</span>
            {openIndex === index ? 
              <ChevronUp className="w-5 h-5 text-white" /> : 
              <ChevronDown className="w-5 h-5 text-white" />
            }
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-6 pb-4 max-h-80 overflow-y-auto">
              {typeof faq.answer === 'string' ? (
                <p className="text-gray-100 leading-relaxed whitespace-pre-line">{faq.answer}</p>
              ) : (
                faq.answer
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Homepage = ({ onTryItOut, onSignIn, user, onLogout }) => {
  const scrollToTryItOut = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const button = document.getElementById('try-it-out-btn');
      if (button) {
        button.classList.add('animate-pulse');
        setTimeout(() => button.classList.remove('animate-pulse'), 2000);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen" style={{
      backgroundImage: 'url(/background.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>

      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white" style={{fontFamily: 'HK Modular, sans-serif'}}>GNNaarium</h1>
            </div>
            {!user ? (
              <button
                onClick={onSignIn}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2"
              >
                <span>Sign In</span>
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="border border-white bg-transparent hover:bg-white hover:bg-opacity-10 px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2"
              >
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <div className="relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-pulse">
                  <Network className="w-14 h-14 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-bounce">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-6 text-white animate-pulse">
              Graph Neural Networks
            </h1>
            <div className="flex justify-center mb-6">
              <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
            </div>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-100">
              Explore the power of Graph Convolutional Networks (GCNs) and analyze their robustness against adversarial attacks with our comprehensive research platform.
            </p>
            <button
              id="try-it-out-btn"
              onClick={onTryItOut}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300 flex items-center space-x-3 mx-auto transform hover:scale-105 hover:shadow-3xl"
            >
              <span className="text-white">Start Exploring</span>
              <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* What are GNNs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-black bg-opacity-40 rounded-3xl shadow-xl p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">What are Graph Neural Networks?</h2>
            <p className="text-lg max-w-4xl mx-auto text-gray-100">
              Graph Neural Networks are a class of deep learning models designed to work with graph-structured data, 
              where relationships between entities are as important as the entities themselves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg icon-neo-primary">
                <Network className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Graph Structure</h3>
              <p className="text-gray-100">
                GNNs process data represented as graphs with nodes (entities) and edges (relationships), 
                capturing complex interconnections naturally.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg icon-neo-accent">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Message Passing</h3>
              <p className="text-gray-100">
                Nodes exchange information with their neighbors through iterative message passing, 
                learning rich representations from local graph structure.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg icon-neo-gradient">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Applications</h3>
              <p className="text-gray-100">
                Used in social networks, molecular analysis, recommendation systems, 
                knowledge graphs, and many other domains with relational data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-12 bg-black bg-opacity-40 rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-4 text-white">Robustness Analysis Platform</h2>
          <p className="text-lg max-w-3xl mx-auto text-gray-100">
            Our platform provides comprehensive tools to train GCN models, test their robustness, 
            and understand their decision-making process through advanced explainability techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white bg-opacity-10 rounded-2xl shadow-xl p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg icon-neo-primary">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Datasets</h3>
            <p className="text-sm text-gray-100">
              Cora, Citeseer, PubMed citation network, Reddit, MUTAG, Proteins, ZINC, OGBN-Arxiv datasets.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-2xl shadow-xl p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg icon-neo-accent">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">GNN Training</h3>
            <p className="text-sm text-gray-100">
              Configurable model parameters with real-time training monitoring via WebSocket connections.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-2xl shadow-xl p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg icon-neo-gradient">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Attack & Defense</h3>
            <p className="text-sm text-gray-100">
              Test model robustness with adversarial attacks and evaluate defense mechanisms.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-2xl shadow-xl p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg icon-neo-primary">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Explainability</h3>
            <p className="text-sm text-gray-100">
              GNNExplainer and Integrated Gradients to understand model decision-making processes.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-black bg-opacity-40 rounded-3xl shadow-xl p-12">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">Frequently Asked Questions</h2>
          <FAQAccordion />
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div 
          onClick={scrollToTryItOut}
          className="bg-black bg-opacity-40 rounded-3xl shadow-2xl p-12 text-center cursor-pointer hover:shadow-3xl transition-all duration-200"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Explore GNN Robustness?</h2>
          <p className="text-xl text-gray-100 opacity-90">
            Start experimenting with Graph Convolutional Networks and discover how robust your models really are.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;