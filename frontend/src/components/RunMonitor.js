import React, { useState, useEffect, useRef } from 'react';
import { Play, BarChart3, Activity, Brain, AlertCircle, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../api';
import GraphVisualization from './GraphVisualization';
import MetricsPanel from './MetricsPanel';
import ExplanationVisualization from './ExplanationVisualization';

function RunMonitor({ run, config, onRunComplete, onStartRun, isRunning, configChanged, trainedConfig, user, token, onSignInClick }) {
  const [status, setStatus] = useState('idle');
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [explanations, setExplanations] = useState([]);
  const [currentMetric, setCurrentMetric] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const connectWebSocket = (runId) => {
    try {
      wsRef.current = api.connectWebSocket(runId);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setStatus('running');
      };
      
      wsRef.current.onmessage = (event) => {
        console.log('WebSocket message:', event.data);
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setStatus('completed');
        
        // Update experiment history with final results
        const finalResults = currentMetric || (metrics.length > 0 ? metrics[metrics.length - 1] : null);
        console.log('Updating experiment with final results:', finalResults);
        console.log('Current metrics array:', metrics);
        console.log('Current run_id:', run?.run_id);
        
        if (finalResults && run?.run_id) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const history = JSON.parse(localStorage.getItem('experimentHistory') || '[]');
          const expIndex = history.findIndex(exp => {
            const expId = String(exp.id);
            return (expId.startsWith(`${run.run_id}-`) || exp.id === run.run_id) && exp.user_email === currentUser.email;
          });
          console.log('Found experiment at index:', expIndex, 'for run_id:', run.run_id);
          console.log('Current history length:', history.length);
          
          if (expIndex !== -1) {
            // Map current metric fields to expected final result fields
            const updatedResults = {
              final_train_loss: finalResults?.train_loss || null,
              final_val_acc: finalResults?.val_acc || null,
              final_asr: finalResults?.asr || null,
              final_robust_acc: finalResults?.robust_acc || null,
              // Keep original fields for backward compatibility
              train_loss: finalResults?.train_loss || null,
              val_acc: finalResults?.val_acc || null,
              asr: finalResults?.asr || null,
              robust_acc: finalResults?.robust_acc || null,
              // Additional accuracy fields for compatibility
              accuracy: finalResults?.val_acc || null,
              validation_accuracy: finalResults?.val_acc || null
            };
            
            console.log('Final results object:', finalResults);
            console.log('Val_acc from final results:', finalResults?.val_acc);
            
            console.log('Updating experiment at index', expIndex, 'with results:', updatedResults);
            history[expIndex].results = updatedResults;
            localStorage.setItem('experimentHistory', JSON.stringify(history));
            console.log('Successfully updated experiment history');
          } else {
            console.log('Experiment not found in history, available IDs:', history.map(h => h.id));
            console.log('Looking for run_id prefix:', `${run.run_id}-`);
          }
        } else {
          console.log('Missing finalResults or run_id:', { finalResults, runId: run?.run_id });
        }
        
        setTimeout(() => {
          setMetrics([]);
          setLogs([]);
          setExplanations([]);
          setCurrentMetric(null);
          setStatus('idle');
          wsRef.current = null;
          onRunComplete?.(finalResults);
        }, 2000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setStatus('error');
      onRunComplete?.(null);
    }
  };

  const handleWebSocketMessage = (data) => {
    console.log('WebSocket message received:', data);
    switch (data.type) {
      case 'log':
        setLogs(prev => [...prev, { timestamp: new Date(), message: data.msg }]);
        break;
      case 'metric':
        const metric = {
          epoch: data.epoch,
          train_loss: data.train_loss,
          val_acc: data.val_acc,
          asr: data.asr,
          robust_acc: data.robust_acc
        };
        setMetrics(prev => [...prev, metric]);
        setCurrentMetric(metric);
        
        // Save results immediately when we get metrics
        if (run?.run_id) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const history = JSON.parse(localStorage.getItem('experimentHistory') || '[]');
          const expIndex = history.findIndex(exp => {
            const expId = String(exp.id);
            return (expId.startsWith(`${run.run_id}-`) || exp.id === run.run_id) && exp.user_email === currentUser.email;
          });
          
          if (expIndex !== -1) {
            history[expIndex].results = {
              val_acc: metric.val_acc,
              train_loss: metric.train_loss
            };
            localStorage.setItem('experimentHistory', JSON.stringify(history));
          }
        }
        break;
      case 'explanation':
        console.log('Explanation received:', data);
        if (data.explanation) {
          console.log('Adding explanation:', data.explanation);
          setExplanations(prev => {
            const newExplanations = [...prev, data.explanation];
            console.log('New explanations array:', newExplanations);
            return newExplanations;
          });
        } else if (data.explanations) {
          setExplanations(data.explanations);
        }
        setLogs(prev => [...prev, { 
          timestamp: new Date(), 
          message: `Explainer ${data.explainer} completed for node ${data.explanation?.node_idx ?? 'N/A'}` 
        }]);
        break;
      case 'status':
        console.log('Status update:', data.status);
        setStatus(data.status);
        break;
      default:
        console.log('Unknown message type:', data.type);
        break;
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      idle: { label: 'Idle', className: 'status-badge bg-gray-100 text-gray-700' },
      running: { label: 'Running', className: 'status-badge status-running' },
      completed: { label: 'Completed', className: 'status-badge status-completed' },
      error: { label: 'Error', className: 'status-badge status-error' },
      stopped: { label: 'Stopped', className: 'status-badge bg-yellow-100 text-yellow-700' }
    };
    
    const config = statusConfig[status] || statusConfig.idle;
    return <span className={config.className}>{config.label}</span>;
  };

  useEffect(() => {
    if (run?.run_id && !wsRef.current) {
      console.log('Connecting to run:', run.run_id);
      
      // Save experiment to history when run starts
      const experiment = {
        id: `${run.run_id}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        config: JSON.parse(JSON.stringify(config)),
        results: null,
        user_email: JSON.parse(localStorage.getItem('user') || '{}').email
      };
      const history = JSON.parse(localStorage.getItem('experimentHistory') || '[]');
      // Remove any existing experiment with same run_id to prevent duplicates
      const filteredHistory = history.filter(exp => {
        const expId = String(exp.id);
        return !expId.startsWith(`${run.run_id}-`) && exp.id !== run.run_id;
      });
      filteredHistory.unshift(experiment);
      localStorage.setItem('experimentHistory', JSON.stringify(filteredHistory.slice(0, 50)));
      
      setTimeout(() => {
        connectWebSocket(run.run_id);
      }, 1000);
    }
  }, [run?.run_id]);

  const experimentConfigCard = (
    <div className="card-neo rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-neo-primary">Experiment Configuration</h3>
        </div>
        {configChanged && trainedConfig && (
          <div className="alert-neo-warning px-4 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-sm">
            <span>⚠️</span>
            <span className="font-medium">Configuration changed — retrain to apply</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Model', value: `${config.model?.name || 'None'} (${config.model?.epochs || 50} epochs)`, icon: '🧠' },
          { label: 'Dataset', value: config.dataset?.name || 'None', icon: '📊' },
          { label: 'Attack', value: config.attack?.name || 'None', icon: '⚔️' },
          { label: 'Defense', value: config.defense?.name || 'None', icon: '🛡️' },
          { label: 'Explainer', value: config.explainer?.name || 'None', icon: '🔍' }
        ].map((item, idx) => (
          <div key={idx} className="metric-neo p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{item.icon}</span>
              <span className="font-semibold text-neo-secondary text-sm">{item.label}</span>
            </div>
            <p className="metric-neo-value text-sm leading-relaxed">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (!run) {
    return (
      <div className="space-y-6">
        {experimentConfigCard}
        <div className="card-neo text-center py-12 rounded-2xl shadow-xl">
          <Play className="w-12 h-12 text-neo-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neo-primary mb-2">
            {trainedConfig ? 'Retrain Model' : 'Train Model'}
          </h3>
          <p className="text-neo-secondary mb-6">
            {configChanged && trainedConfig 
              ? 'Apply your configuration changes by retraining the model.'
              : 'Review your configuration and start training.'}
          </p>
          {!token || !user ? (
            <div 
              className="alert-neo-warning px-6 py-4 rounded-xl text-center mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onSignInClick}
            >
              <p className="font-medium text-neo-primary mb-2">🔒 Authentication Required</p>
              <p className="text-sm text-neo-secondary">Click here to sign in with Google and start training</p>
            </div>
          ) : null}
          <button
            onClick={() => {
              console.log('Train Model button clicked, isRunning:', isRunning);
              if (!isRunning) {
                onStartRun();
              }
            }}
            disabled={isRunning || !token || !user}
            className="btn-neo-primary flex items-center space-x-2 disabled:opacity-50 mx-auto px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Starting...' : (!token || !user ? 'Sign In Required' : 'Train Model')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {experimentConfigCard}

      {/* Status Overview */}
      <div className="card-neo rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-neo-primary">Training Monitor</h2>
          </div>
          {getStatusBadge()}
        </div>

        <MetricsPanel currentMetric={currentMetric} metrics={metrics} />
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="metric-neo p-4 rounded-lg">
            <p className="text-sm text-neo-secondary">Run ID</p>
            <p className="text-lg font-semibold text-neo-primary">{run.run_id}</p>
          </div>
          <div className="metric-neo p-4 rounded-lg">
            <p className="text-sm text-neo-secondary">Epochs Completed</p>
            <p className="text-lg font-semibold text-neo-primary">{metrics.length}</p>
          </div>
          <div className="metric-neo p-4 rounded-lg">
            <p className="text-sm text-neo-secondary">Explanations</p>
            <p className="text-lg font-semibold text-neo-primary">{explanations.length}</p>
          </div>
        </div>
      </div>

      {/* Modern Metrics Chart */}
      {metrics.length > 0 && (
        <div className="card-neo rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4" style={{backgroundColor: 'rgba(0, 184, 217, 0.1)', borderBottom: '1px solid var(--border)'}}>
            <div className="flex items-center space-x-3">
              <div className="p-2 icon-neo-gradient rounded-xl">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neo-primary">Training Metrics</h3>
                <p className="text-sm text-neo-secondary">{metrics.length} epochs completed</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-80 card-neo rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="epoch" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '14px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="val_acc" 
                    stroke="url(#blueGradient)" 
                    name="Validation Accuracy"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="train_loss" 
                    stroke="url(#redGradient)" 
                    name="Training Loss"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#ffffff' }}
                  />
                  {metrics.some(m => m.asr !== null) && (
                    <Line 
                      type="monotone" 
                      dataKey="asr" 
                      stroke="url(#orangeGradient)" 
                      name="Attack Success Rate"
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
                    />
                  )}
                  {metrics.some(m => m.robust_acc !== null) && (
                    <Line 
                      type="monotone" 
                      dataKey="robust_acc" 
                      stroke="url(#greenGradient)" 
                      name="Robust Accuracy"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                    />
                  )}
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="redGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#eab308" />
                    </linearGradient>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Graph Visualization */}
      {run && (
        <GraphVisualization 
          dataset={config?.dataset?.name}
          nodeExplanations={explanations}
          selectedNodes={config?.explainer?.node_ids}
          attackConfig={config?.attack}
          defenseConfig={config?.defense}
          metrics={metrics}
          explainerConfig={config?.explainer}
        />
      )}

      {/* Enhanced Explanations Visualization */}
      <ExplanationVisualization 
        explanations={explanations}
        selectedNodes={config?.explainer?.node_ids}
      />

      {/* Logs */}
      <div className="card-neo rounded-2xl shadow-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-neo-primary">Training Logs</h3>
        </div>
        <div className="p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
          {logs.length === 0 ? (
            <p className="text-neo-secondary">No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-neo-secondary">
                  [{log.timestamp.toLocaleTimeString()}]
                </span>
                <span className="ml-2">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RunMonitor;