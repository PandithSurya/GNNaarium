import React, { useState, useEffect } from 'react';
import { Eye, BarChart3, Target, Zap, Info } from 'lucide-react';

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
              Node: {explanation.node_idx ?? 'N/A'}
            </div>
          </div>
        </div>

        {explanation.fidelity && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Fidelity</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-green-800">
                {(explanation.fidelity * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-green-600">
                Explanation quality
              </div>
            </div>
          </div>
        )}

        {explanation.sparsity && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Sparsity</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-purple-800">
                {(explanation.sparsity * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-purple-600">
                Feature selectivity
              </div>
            </div>
          </div>
        )}

        {explanation.attribution_sum && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Total Attribution</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-orange-800">
                {explanation.attribution_sum.toFixed(3)}
              </div>
              <div className="text-sm text-orange-600">
                Sum of attributions
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
          Select Node to Explain
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
              Node {exp.node_idx || idx}
            </button>
          ))}
        </div>
      </div>

      {selectedExplanation && (
        <div className="space-y-6">
          {/* Error Display */}
          {selectedExplanation.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-800">Error</span>
              </div>
              <p className="text-red-700 mt-1">{selectedExplanation.error}</p>
            </div>
          )}

          {!selectedExplanation.error && (
            <>
              {/* Metrics */}
              {renderMetrics(selectedExplanation)}

              {viewMode === 'detailed' && (
                <>
                  {/* Feature Importance */}
                  {renderFeatureImportance(selectedExplanation)}

                  {/* Visualization Image */}
                  {selectedExplanation.visualization && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Visual Explanation</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <img
                          src={selectedExplanation.visualization}
                          alt={`Explanation for Node ${selectedExplanation.node_id}`}
                          className="max-w-full h-auto rounded border"
                        />
                      </div>
                    </div>
                  )}

                  {/* Edge Importance */}
                  {selectedExplanation.edge_importance && selectedExplanation.edge_importance.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Edge Importance</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex flex-wrap gap-1">
                          {selectedExplanation.edge_importance.slice(0, 20).map((importance, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor: `rgba(${importance > 0 ? '34, 197, 94' : '239, 68, 68'}, ${Math.abs(importance)})`
                              }}
                              title={`Edge ${idx}: ${importance.toFixed(3)}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Green: Positive importance, Red: Negative importance
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {viewMode === 'overview' && (
                <div className="card-neo rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-neo-primary">Explanation Summary</h4>
                  <div className="text-sm text-neo-secondary space-y-1">
                    <p>• Method: {selectedExplanation.method}</p>
                    <p>• Target Node: {selectedExplanation.node_idx}</p>
                    {selectedExplanation.target_prediction !== undefined && (
                      <p>• Prediction: {selectedExplanation.target_prediction}</p>
                    )}
                    {selectedExplanation.confidence && (
                      <p>• Confidence: {(selectedExplanation.confidence * 100).toFixed(1)}%</p>
                    )}
                    {selectedExplanation.edge_importance && (
                      <p>• {selectedExplanation.edge_importance.length} edges analyzed</p>
                    )}
                    {selectedExplanation.prototypes && (
                      <p>• {selectedExplanation.prototypes.length} prototypes found</p>
                    )}
                    {selectedExplanation.shapley_values && (
                      <p>• {selectedExplanation.shapley_values.length} Shapley values computed</p>
                    )}
                  </div>
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