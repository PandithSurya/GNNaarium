import React, { useState, useEffect } from 'react';
import { History, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

function ExperimentHistory() {
  const [experiments, setExperiments] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = currentUser.email;
      
      if (!userEmail) {
        setExperiments([]);
        return;
      }
      
      // Try to load from MongoDB first
      const response = await fetch('/api/experiments');
      if (response.ok) {
        const data = await response.json();
        const mongoExperiments = data.experiments || [];
        
        // Also load localStorage experiments and filter by user
        let localExperiments = [];
        try {
          const saved = localStorage.getItem('experimentHistory');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              localExperiments = parsed.filter(exp => exp.user_email === userEmail);
            }
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
        
        // Merge and deduplicate experiments
        const allExperiments = [...mongoExperiments, ...localExperiments];
        const uniqueExperiments = allExperiments.filter((exp, index, self) => 
          index === self.findIndex(e => (e._id || e.id) === (exp._id || exp.id))
        );
        
        setExperiments(uniqueExperiments);
      } else {
        // Fallback to localStorage only
        const saved = localStorage.getItem('experimentHistory');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const userExperiments = parsed.filter(exp => exp.user_email === userEmail);
            setExperiments(userExperiments);
          }
        }
      }
    } catch (error) {
      console.error('Error loading experiments:', error);
      // Fallback to localStorage
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userEmail = currentUser.email;
        const saved = localStorage.getItem('experimentHistory');
        if (saved && userEmail) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const userExperiments = parsed.filter(exp => exp.user_email === userEmail);
            setExperiments(userExperiments);
          }
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        setExperiments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteExperiment = async (id) => {
    try {
      // Try to delete from MongoDB first
      const response = await fetch(`/api/experiments/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from local state
        const updated = experiments.filter(e => String(e._id || e.id) !== String(id));
        setExperiments(updated);
      } else {
        // Fallback to localStorage deletion
        const updated = experiments.filter(e => {
          const expId = String(e.id);
          const targetId = String(id);
          return expId !== targetId && !expId.startsWith(targetId + '-');
        });
        setExperiments(updated);
        localStorage.setItem('experimentHistory', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error deleting experiment:', error);
      // Fallback to localStorage deletion
      const updated = experiments.filter(e => {
        const expId = String(e.id);
        const targetId = String(id);
        return expId !== targetId && !expId.startsWith(targetId + '-');
      });
      setExperiments(updated);
      localStorage.setItem('experimentHistory', JSON.stringify(updated));
    }
  };

  const exportExperiment = (exp) => {
    try {
      if (!exp || !exp.id) {
        throw new Error('Invalid experiment data');
      }
      const blob = new Blob([JSON.stringify(exp, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `experiment-${exp.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting experiment:', error);
      alert('Failed to export experiment');
    }
  };

  const getAccuracy = (results, expId) => {
    console.log(`Accuracy check for experiment ${expId}:`, results);
    if (!results) {
      console.log(`No results for ${expId}`);
      return 'N/A';
    }
    
    const accuracy = results.final_val_acc || results.val_acc || results.accuracy;
    console.log(`Found accuracy for ${expId}:`, accuracy);
    
    if (accuracy === null || accuracy === undefined) {
      console.log(`Accuracy is null/undefined for ${expId}`);
      return 'N/A';
    }
    
    const value = accuracy > 1 ? accuracy : accuracy * 100;
    console.log(`Formatted accuracy for ${expId}:`, value);
    return `${value.toFixed(1)}%`;
  };

  const getTrainLoss = (results) => {
    if (!results) return 'N/A';
    
    const loss = results.final_train_loss || results.train_loss;
    return loss ? loss.toFixed(4) : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="card-neo rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
              <History className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-neo-primary">Experiment History</h2>
          </div>
          {experiments.length > 0 && (
            <button
              onClick={() => {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const userEmail = currentUser.email;
                if (userEmail) {
                  const saved = localStorage.getItem('experimentHistory');
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    const otherUserExperiments = parsed.filter(exp => exp.user_email !== userEmail);
                    localStorage.setItem('experimentHistory', JSON.stringify(otherUserExperiments));
                  }
                }
                setExperiments([]);
              }}
              className="btn-neo-secondary px-3 py-1 text-sm rounded"
            >
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neo-primary mx-auto mb-4"></div>
            <p className="text-neo-secondary">Loading experiments...</p>
          </div>
        ) : experiments.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-neo-secondary mx-auto mb-4" />
            <p className="text-neo-secondary">No experiments yet. Start training to see history!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {experiments.map((exp) => (
              <div key={`exp-${exp._id || exp.id}`} className="card-neo rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-neo-primary">
                      {exp.config?.model?.name || 'GCN'} on {exp.config?.dataset?.name || 'Unknown'}
                    </h4>
                    <p className="text-sm text-neo-secondary">
                      {new Date(exp.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-neo-secondary">Accuracy</div>
                      <div className="font-bold text-lg" style={{color: '#10B981'}}>
                        {getAccuracy(exp.results, exp.id)}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const expId = exp._id || exp.id;
                          setExpandedId(expandedId === expId ? null : expId);
                        }}
                        className="p-2 rounded-lg transition-colors btn-neo-secondary"
                        title="Toggle Details"
                      >
                        {expandedId === exp.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => exportExperiment(exp)}
                        className="p-2 rounded-lg transition-colors btn-neo-secondary"
                        title="Export"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteExperiment(exp._id || exp.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444'}}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {expandedId === (exp._id || exp.id) && (
                  <div className="mt-4 pt-4" style={{borderTop: '1px solid var(--border)'}}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Model</h5>
                        <p className="font-medium text-neo-primary">{exp.config?.model?.name || 'GCN'}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Dataset</h5>
                        <p className="font-medium text-neo-primary">{exp.config?.dataset?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Epochs</h5>
                        <p className="font-medium text-neo-primary">{exp.config?.model?.epochs || 50}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Learning Rate</h5>
                        <p className="font-medium text-neo-primary">{exp.config?.model?.lr || 0.01}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Hidden Dim</h5>
                        <p className="font-medium text-neo-primary">{exp.config?.model?.hidden_dim || 64}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Dropout</h5>
                        <p className="font-medium text-neo-primary">{exp.config?.model?.dropout || 0.5}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Attack</h5>
                        <p className="font-medium text-neo-primary">{exp.config?.attack?.name || 'None'}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Defense</h5>
                        <p className="font-medium text-neo-primary">{exp.config?.defense?.name || 'None'}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Explainer</h5>
                        <p className="font-medium text-neo-primary">{exp.config?.explainer?.name || 'None'}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Train Loss</h5>
                        <p className="font-medium text-neo-primary">{getTrainLoss(exp.results)}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Val Accuracy</h5>
                        <p className="font-medium text-neo-primary">{getAccuracy(exp.results, exp.id)}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-neo-secondary mb-1">Seed</h5>
                        <p className="font-medium text-neo-primary">{exp.config?.model?.seed || 42}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExperimentHistory;