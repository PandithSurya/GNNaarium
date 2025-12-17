import React, { useState, useEffect } from 'react';
import { Eye, BarChart3, Target, Zap, Info, CheckCircle, AlertTriangle } from 'lucide-react';

function ExplanationVisualization({ explanations, selectedNodes }) {
  const [selectedExplanation, setSelectedExplanation] = useState(null);
  const [viewMode, setViewMode] = useState('overview');

  useEffect(() => {
    if (explanations && explanations.length > 0) {
      setSelectedExplanation(explanations[0]);
    }
  }, [explanations]);

  if (!explanations || explanations.length === 0) {
    return (
      <div className="card-neo rounded-2xl shadow-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-neo-primary">Explanation Visualization</h3>
        </div>
        <div className="text-center py-8 text-neo-secondary">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No explanations available. Run an explainer to see results.</p>
        </div>
      </div>
    );
  }

  const renderFeatureImportance = (explanation) => {
    const features = explanation.feature_importance || explanation.attributions || [];
    if (!features.length) return null;

    const maxAbs = Math.max(...features.map(f => Math.abs(f)));
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Feature Importance</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {features.slice(0, 15).map((importance, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <span className="text-xs w-8 text-gray-600">F{idx}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                <div
                  className={`h-2 rounded-full ${importance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{
                    width: `${Math.abs(importance) / maxAbs * 100}%`,
                    marginLeft: importance < 0 ? `${(1 - Math.abs(importance) / maxAbs) * 100}%` : '0'
                  }}
                />
              </div>
              <span className="text-xs w-12 text-right">
                {importance.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMetrics = (explanation) => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="card-neo p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-blue-100">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-neo-primary">Method</span>
          </div>
          <div className="mt-1">
            <div className="text-lg font-bold text-neo-primary">
              {explanation.method || 'Unknown'}
            </div>
            <div className="text-sm text-neo-secondary">
              {explanation.task_type === 'node' ? `Node: ${explanation.node_idx ?? 'N/A'}` : 'Graph-level'}
            </div>
            {explanation.num_hops_used && (
              <div className="text-xs text-green-600 mt-1">
                ✓ {explanation.num_hops_used}-hop subgraph
              </div>
            )}
          </div>
        </div>

        {explanation.fidelity !== undefined && (
          <div className="card-neo p-3 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.1)'}}>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-neo-primary">Fidelity</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-neo-primary">
                {(explanation.fidelity * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-neo-secondary">
                Prediction preserved
              </div>
            </div>
          </div>
        )}

        {explanation.confidence !== undefined && (
          <div className="card-neo p-3 rounded-lg" style={{backgroundColor: 'rgba(139, 92, 246, 0.1)'}}>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-neo-primary">Confidence</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-neo-primary">
                {(explanation.confidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-neo-secondary">
                Model certainty
              </div>
            </div>
          </div>
        )}

        {explanation.edge_importance && explanation.edge_importance.length > 0 && (
          <div className="card-neo p-3 rounded-lg" style={{backgroundColor: 'rgba(249, 115, 22, 0.1)'}}>
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-neo-primary">Edges Analyzed</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-neo-primary">
                {explanation.edge_importance.length}
              </div>
              <div className="text-sm text-neo-secondary">
                {explanation.task_type === 'node' ? 'In k-hop subgraph' : 'In full graph'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card-neo rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-neo-primary">Explanation Visualization</h3>
        </div>
        
        <div className="flex space-x-1 card-neo rounded-lg p-1">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'overview' ? 'btn-neo-primary' : 'btn-neo-secondary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'detailed' ? 'btn-neo-primary' : 'btn-neo-secondary'
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Node Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neo-primary mb-2">
          Select Explanation
        </label>
        <div className="flex flex-wrap gap-2">
          {explanations.map((exp, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedExplanation(exp)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedExplanation?.node_idx === exp.node_idx
                  ? 'btn-neo-primary'
                  : 'btn-neo-secondary'
              }`}
            >
              {exp.task_type === 'graph' ? 'Graph' : `Node ${exp.node_idx || idx}`}
              {exp.task_type === 'node' && exp.num_hops_used && (
                <span className="ml-1 text-xs text-green-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedExplanation && (
        <div className="space-y-6">
          {/* Error Display */}
          {selectedExplanation.error && (
            <div className="card-neo rounded-lg p-4" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)'}}>
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-red-600" />
                <span className="font-medium text-neo-primary">Explainer Error</span>
              </div>
              <p className="text-neo-secondary mt-1">{selectedExplanation.error}</p>
              <p className="text-neo-secondary text-sm mt-2">
                This may indicate the explainer violated mandatory rules (e.g., using full graph for node explanations).
              </p>
            </div>
          )}
          
          {/* GraphMask validation warning */}
          {selectedExplanation.method === 'GraphMask' && selectedExplanation.prediction_invariance < 0.8 && (
            <div className="card-neo rounded-lg p-4 mb-6" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)'}}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-neo-primary">Conceptually Invalid</span>
              </div>
              <p className="text-neo-secondary mt-1">
                GraphMask results flagged as invalid due to low prediction invariance ({(selectedExplanation.prediction_invariance * 100).toFixed(1)}%). 
                High invariance is expected for global message-level explanations.
              </p>
            </div>
          )}
          
          {/* Compliance Status for non-GraphMask explainers */}
          {!selectedExplanation.error && selectedExplanation.method !== 'GraphMask' && selectedExplanation.task_type === 'node' && (
            <div className="card-neo rounded-lg p-3" style={{backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)'}}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-neo-primary">Compliance Status</span>
              </div>
              <p className="text-neo-secondary text-sm mt-1">
                ✓ Node-level explanation uses {selectedExplanation.num_hops_used || 'k'}-hop subgraph (compliant with mandatory rules)
              </p>
              {selectedExplanation.fidelity !== undefined && (
                <p className={`text-sm mt-1 ${selectedExplanation.fidelity > 0.8 ? 'text-green-600' : 'text-orange-600'}`}>
                  ✓ Fidelity: {(selectedExplanation.fidelity * 100).toFixed(1)}% {selectedExplanation.fidelity === 1.0 ? '(Perfect!)' : ''}
                </p>
              )}
            </div>
          )}
          
          {/* GraphMask compliance status */}
          {selectedExplanation.method === 'GraphMask' && !selectedExplanation.error && (
            <div className="card-neo rounded-lg p-3" style={{backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)'}}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-neo-primary">Global Explainer Status</span>
              </div>
              <p className="text-neo-secondary text-sm mt-1">
                ✓ Global message-level analysis (explains model behavior, not individual predictions)
              </p>
              <p className="text-neo-secondary text-sm mt-1">
                ✓ Binary gates learned on {selectedExplanation.total_edges_evaluated || 0} edges
              </p>
              {selectedExplanation.prediction_invariance !== undefined && (
                <p className={`text-sm mt-1 ${selectedExplanation.prediction_invariance >= 0.8 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedExplanation.prediction_invariance >= 0.8 ? '✓' : '✗'} Prediction Invariance: {(selectedExplanation.prediction_invariance * 100).toFixed(1)}%
                </p>
              )}
            </div>
          )}
          
          {/* ProtGNN validation warning */}
          {selectedExplanation.method === 'ProtGNN' && !selectedExplanation.valid_explanation && (
            <div className="card-neo rounded-lg p-4 mb-6" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)'}}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-neo-primary">Invalid Prototype Explanation</span>
              </div>
              <p className="text-neo-secondary mt-1">
                Prototypes show mixed classes or low similarity scores. This may indicate insufficient training or dataset complexity.
              </p>
            </div>
          )}
          
          {/* ProtGNN compliance status */}
          {selectedExplanation.method === 'ProtGNN' && !selectedExplanation.error && (
            <div className="card-neo rounded-lg p-3" style={{backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)'}}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-neo-primary">Self-interpretable Status</span>
              </div>
              <p className="text-neo-secondary text-sm mt-1">
                ✓ Intrinsic explanation via prototype similarity (not post-hoc analysis)
              </p>
              <p className="text-neo-secondary text-sm mt-1">
                ✓ Explains via embedding-space similarity, not causal edges
              </p>
              {selectedExplanation.prototype_class_agreement !== undefined && (
                <p className={`text-sm mt-1 ${selectedExplanation.prototype_class_agreement ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedExplanation.prototype_class_agreement ? '✓' : '✗'} Prototype class agreement: {selectedExplanation.prototype_class_agreement ? 'Consistent' : 'Mixed'}
                </p>
              )}
            </div>
          )}

          {!selectedExplanation.error && (
            <>
              {/* GraphMask-specific metrics */}
              {selectedExplanation.method === 'GraphMask' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="card-neo p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded bg-purple-100">
                        <Zap className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-neo-primary">Explainer Type</span>
                    </div>
                    <div className="mt-1">
                      <div className="text-lg font-bold text-neo-primary">
                        Global
                      </div>
                      <div className="text-sm text-neo-secondary">
                        Message-level
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-neo p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-neo-primary">Total Edges</span>
                    </div>
                    <div className="mt-1">
                      <div className="text-lg font-bold text-neo-primary">
                        {selectedExplanation.total_edges_evaluated || 0}
                      </div>
                      <div className="text-sm text-neo-secondary">Evaluated</div>
                    </div>
                  </div>
                  
                  <div className="card-neo p-3 rounded-lg" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)'}}>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-neo-primary">Gated Off</span>
                    </div>
                    <div className="mt-1">
                      <div className="text-lg font-bold text-neo-primary">
                        {selectedExplanation.edges_gated_off || 0}
                      </div>
                      <div className="text-sm text-neo-secondary">Redundant</div>
                      {(selectedExplanation.edges_gated_off || 0) === 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          No redundant edges detected. This indicates a highly coupled message-passing structure.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-neo p-3 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.1)'}}>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-neo-primary">Retained</span>
                    </div>
                    <div className="mt-1">
                      <div className="text-lg font-bold text-neo-primary">
                        {selectedExplanation.edges_retained || 0}
                      </div>
                      <div className="text-sm text-neo-secondary">Essential</div>
                    </div>
                  </div>
                  
                  {selectedExplanation.prediction_invariance !== undefined && (
                    <div className="card-neo p-3 rounded-lg" style={{backgroundColor: 'rgba(139, 92, 246, 0.1)'}}>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-neo-primary">Prediction Invariance</span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-bold text-neo-primary">
                          {(selectedExplanation.prediction_invariance * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-neo-secondary">
                          {selectedExplanation.prediction_invariance >= 0.8 ? 'Valid' : 'Invalid'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="card-neo p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-neo-primary">Context</span>
                    </div>
                    <div className="mt-1">
                      <div className="text-sm font-bold text-neo-primary">
                        {selectedExplanation.visualization_context || 'Global'}
                      </div>
                      <div className="text-xs text-neo-secondary">Visualization only</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Standard metrics for other explainers */}
              {selectedExplanation.method !== 'GraphMask' && renderMetrics(selectedExplanation)}

              {viewMode === 'detailed' && (
                <>
                  {/* Feature Importance */}
                  {renderFeatureImportance(selectedExplanation)}
                  
                  {/* Method-specific detailed information */}
                  {selectedExplanation.method === 'SubgraphX' && selectedExplanation.shapley_values && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Shapley Values (Top 10)</h4>
                      <div className="card-neo rounded-lg p-3 space-y-1">
                        {selectedExplanation.shapley_values.slice(0, 10).map((value, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>Edge {idx}</span>
                            <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
                              {value.toFixed(4)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedExplanation.method === 'NeuronAnalysis' && selectedExplanation.neuron_concepts && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Neuron Concepts</h4>
                      <div className="card-neo rounded-lg p-3 space-y-2">
                        {Object.entries(selectedExplanation.neuron_concepts).map(([layer, concepts]) => (
                          <div key={layer}>
                            <h5 className="font-medium text-xs text-gray-700">{layer}</h5>
                            <div className="space-y-1">
                              {concepts.slice(0, 3).map((concept, idx) => (
                                <div key={idx} className="text-xs card-neo p-2 rounded">
                                  <span className="font-medium">Neuron {concept.neuron_idx}:</span>
                                  <span className="ml-1">{concept.concept}</span>
                                  <span className="ml-2 text-gray-500">({concept.activation.toFixed(3)})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subgraph Information */}
                  {selectedExplanation.subgraph_edges && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Explanatory Subgraph</h4>
                      <div className="card-neo rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Edges in subgraph:</span>
                            <span className="ml-2">{selectedExplanation.subgraph_edges[0]?.length || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium">Method:</span>
                            <span className="ml-2">{selectedExplanation.method}</span>
                          </div>
                          {selectedExplanation.fidelity !== undefined && (
                            <div>
                              <span className="font-medium">Fidelity:</span>
                              <span className={`ml-2 ${selectedExplanation.fidelity > 0.8 ? 'text-green-600' : 'text-red-600'}`}>
                                {(selectedExplanation.fidelity * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {selectedExplanation.structural_reasoning && (
                            <div className="text-blue-600">
                              ✓ Structural reasoning applied
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edge Importance */}
                  {selectedExplanation.edge_importance && selectedExplanation.edge_importance.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Edge Importance 
                        {selectedExplanation.task_type === 'node' && (
                          <span className="text-xs text-green-600 ml-2">({selectedExplanation.num_hops_used}-hop subgraph)</span>
                        )}
                      </h4>
                      <div className="card-neo rounded-lg p-3">
                        <div className="flex flex-wrap gap-1">
                          {selectedExplanation.edge_importance.slice(0, 30).map((importance, idx) => {
                            const normalizedImportance = Math.min(Math.abs(importance), 1);
                            return (
                              <div
                                key={idx}
                                className="w-3 h-3 rounded border border-gray-300"
                                style={{
                                  backgroundColor: `rgba(${importance > 0 ? '34, 197, 94' : '239, 68, 68'}, ${normalizedImportance})`
                                }}
                                title={`Edge ${idx}: ${importance.toFixed(3)}`}
                              />
                            );
                          })}
                        </div>
                        <div className="mt-3 text-xs text-neo-secondary">
                          <p>Green: Positive importance, Red: Negative importance</p>
                          <p>Showing {Math.min(selectedExplanation.edge_importance.length, 30)} of {selectedExplanation.edge_importance.length} edges</p>
                          {selectedExplanation.task_type === 'node' && (
                            <p className="text-green-600 font-medium">✓ Analysis restricted to k-hop neighborhood</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {viewMode === 'overview' && (
                <div className="space-y-4">
                  <div className="card-neo rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-neo-primary">Explanation Summary</h4>
                    <div className="text-sm text-neo-secondary space-y-1">
                      <p>• Method: {selectedExplanation.method}</p>
                      {selectedExplanation.method === 'GraphMask' && (
                        <>
                          <p>• Type: Global (message-level)</p>
                          <p>• Context: {selectedExplanation.visualization_context || 'Global analysis'}</p>
                          <p>• Edges Evaluated: {selectedExplanation.total_edges_evaluated || 0}</p>
                          <p>• Redundant Edges: {selectedExplanation.edges_gated_off || 0}</p>
                          <p>• Essential Edges: {selectedExplanation.edges_retained || 0}</p>
                        </>
                      )}
                      {selectedExplanation.method !== 'GraphMask' && (
                        <>
                          <p>• Task Type: {selectedExplanation.task_type || 'node'}</p>
                          <p>• Target: {selectedExplanation.task_type === 'graph' ? 'Entire Graph' : `Node ${selectedExplanation.node_idx}`}</p>
                        </>
                      )}
                      {selectedExplanation.num_hops_used && (
                        <p className="text-green-600">• ✓ Uses {selectedExplanation.num_hops_used}-hop subgraph (compliant)</p>
                      )}
                      {selectedExplanation.target_prediction !== undefined && (
                        <p>• Prediction: Class {selectedExplanation.target_prediction}</p>
                      )}
                      {selectedExplanation.confidence && (
                        <p>• Confidence: {(selectedExplanation.confidence * 100).toFixed(1)}%</p>
                      )}
                      {selectedExplanation.edge_importance && (
                        <p>• {selectedExplanation.edge_importance.length} edges analyzed</p>
                      )}
                      {selectedExplanation.method === 'ProtGNN' && (
                        <>
                          <p>• Type: Self-interpretable (prototype-based)</p>
                          <p>• Scope: Embedding-space similarity</p>
                          <p>• Prototypes Found: {selectedExplanation.num_prototypes || 0}</p>
                          <p>• Top Similarity: {((selectedExplanation.top_similarity || 0) * 100).toFixed(1)}%</p>
                          <p>• Class Agreement: {selectedExplanation.prototype_class_agreement ? 'Consistent' : 'Mixed'}</p>
                        </>
                      )}
                      {selectedExplanation.method !== 'ProtGNN' && selectedExplanation.prototypes && (
                        <p>• {selectedExplanation.prototypes.length} prototypes found</p>
                      )}
                      {selectedExplanation.shapley_values && (
                        <p>• {selectedExplanation.shapley_values.length} Shapley values computed</p>
                      )}
                      {selectedExplanation.concept_rules && (
                        <p>• {selectedExplanation.concept_rules.length} logical rules discovered</p>
                      )}
                      {selectedExplanation.method === 'GraphMask' && selectedExplanation.prediction_invariance !== undefined && (
                        <p className={selectedExplanation.prediction_invariance >= 0.8 ? 'text-green-600' : 'text-red-600'}>
                          • Prediction Invariance: {(selectedExplanation.prediction_invariance * 100).toFixed(1)}% {selectedExplanation.prediction_invariance >= 0.8 ? '(Valid)' : '(Invalid)'}
                        </p>
                      )}
                      {selectedExplanation.method !== 'GraphMask' && selectedExplanation.fidelity !== undefined && (
                        <p className={selectedExplanation.fidelity > 0.8 ? 'text-green-600' : 'text-orange-600'}>
                          • Fidelity: {(selectedExplanation.fidelity * 100).toFixed(1)}% {selectedExplanation.fidelity === 1.0 ? '(Perfect!)' : ''}
                        </p>
                      )}
                      {selectedExplanation.parametric && selectedExplanation.trained && (
                        <p className="text-blue-600">
                          • ✓ Parametric explainer trained successfully
                        </p>
                      )}
                      {selectedExplanation.fidelity_warning && (
                        <p className="text-orange-600">
                          • ⚠ {selectedExplanation.fidelity_warning}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Method-specific details */}
                  {selectedExplanation.method === 'ProtGNN' && selectedExplanation.prototypes && (
                    <div className="card-neo rounded-lg p-4">
                      <h4 className="font-medium mb-2 text-neo-primary">Top-{selectedExplanation.prototypes.length} Prototypes</h4>
                      <div className="space-y-2">
                        {selectedExplanation.prototypes.slice(0, 5).map((proto, idx) => (
                          <div key={idx} className="text-sm card-neo p-3 rounded flex justify-between items-center">
                            <div>
                              <span className="font-medium">Prototype {proto.node_idx}</span>
                              {proto.label !== null && <span className="text-blue-600 ml-2">(Class {proto.label})</span>}
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">{(proto.similarity * 100).toFixed(1)}%</div>
                              <div className="text-xs text-gray-500">similarity</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        <strong>Explanation:</strong> This node was classified because its learned representation is highly similar to these class prototypes.
                      </div>
                    </div>
                  )}
                  
                  {selectedExplanation.method === 'NeuronAnalysis' && selectedExplanation.logical_concepts && (
                    <div className="card-neo rounded-lg p-4">
                      <h4 className="font-medium mb-2 text-neo-primary">Logical Concepts</h4>
                      <div className="space-y-2 text-sm">
                        {selectedExplanation.logical_concepts.AND_patterns?.length > 0 && (
                          <div>
                            <span className="font-medium text-green-600">AND Patterns:</span>
                            <span className="ml-2">{selectedExplanation.logical_concepts.AND_patterns.length} rules</span>
                          </div>
                        )}
                        {selectedExplanation.logical_concepts.OR_patterns?.length > 0 && (
                          <div>
                            <span className="font-medium text-blue-600">OR Patterns:</span>
                            <span className="ml-2">{selectedExplanation.logical_concepts.OR_patterns.length} rules</span>
                          </div>
                        )}
                        {selectedExplanation.logical_concepts.NOT_patterns?.length > 0 && (
                          <div>
                            <span className="font-medium text-red-600">NOT Patterns:</span>
                            <span className="ml-2">{selectedExplanation.logical_concepts.NOT_patterns.length} rules</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ExplanationVisualization;