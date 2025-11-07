import React from 'react';
import { TrendingUp, Target, Shield, Zap } from 'lucide-react';

function MetricsPanel({ currentMetric, metrics }) {
  const getMetricTrend = (metricName) => {
    if (metrics.length < 2) return null;
    const current = metrics[metrics.length - 1][metricName];
    const previous = metrics[metrics.length - 2][metricName];
    if (current === null || previous === null) return null;
    return current > previous ? 'up' : 'down';
  };

  const MetricCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card-neo p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neo-secondary">{title}</p>
          <p className="text-2xl font-bold text-neo-primary">
            {value !== null && value !== undefined ? 
              (typeof value === 'number' ? 
                (value < 1 ? `${(value * 100).toFixed(1)}%` : value.toFixed(4))
                : value
              ) : 'N/A'
            }
          </p>
        </div>
        <div className={`p-3 rounded-full ${
          color === 'blue' ? 'icon-neo-primary' :
          color === 'red' ? 'bg-red-100' :
          color === 'orange' ? 'bg-orange-100' :
          color === 'green' ? 'bg-green-100' : 'bg-neo-elevated'
        }`}>
          <Icon className={`w-6 h-6 ${
            color === 'blue' ? 'text-white' :
            color === 'red' ? 'text-red-600' :
            color === 'orange' ? 'text-orange-600' :
            color === 'green' ? 'text-green-600' : 'text-white'
          }`} />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center mt-2 text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
          <span>{trend === 'up' ? 'Improving' : 'Declining'}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Validation Accuracy"
          value={currentMetric?.val_acc}
          icon={Target}
          color="blue"
          trend={getMetricTrend('val_acc')}
        />
        <MetricCard
          title="Training Loss"
          value={currentMetric?.train_loss}
          icon={TrendingUp}
          color="red"
          trend={getMetricTrend('train_loss')}
        />
        <MetricCard
          title="Attack Success Rate"
          value={currentMetric?.asr}
          icon={Zap}
          color="orange"
          trend={getMetricTrend('asr')}
        />
        <MetricCard
          title="Robust Accuracy"
          value={currentMetric?.robust_acc}
          icon={Shield}
          color="green"
          trend={getMetricTrend('robust_acc')}
        />
      </div>
      
      {/* Secondary Metrics */}
      {(currentMetric?.fidelity || currentMetric?.defense_effectiveness || currentMetric?.explanation_quality) && (
        <div className="flex flex-wrap gap-4">
          {currentMetric?.fidelity && (
            <div className="flex-1 min-w-64">
              <div className="card-neo p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neo-secondary">Model Fidelity</p>
                    <p className="text-xl font-bold text-neo-primary">
                      {(currentMetric.fidelity * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-neo-secondary mt-1">Prediction consistency</p>
              </div>
            </div>
          )}
          
          {currentMetric?.defense_effectiveness && (
            <div className="flex-1 min-w-64">
              <div className="card-neo p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neo-secondary">Defense Effectiveness</p>
                    <p className="text-xl font-bold text-neo-primary">
                      {currentMetric.defense_effectiveness.consistency ? 
                        (currentMetric.defense_effectiveness.consistency * 100).toFixed(1) + '%' : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-neo-secondary mt-1">Prediction preservation</p>
              </div>
            </div>
          )}
          
          {currentMetric?.explanation_quality && (
            <div className="flex-1 min-w-64">
              <div className="card-neo p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neo-secondary">Explanation Quality</p>
                    <p className="text-xl font-bold text-neo-primary">
                      {currentMetric.explanation_quality.success_rate ? 
                        (currentMetric.explanation_quality.success_rate * 100).toFixed(1) + '%' : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-xs text-neo-secondary mt-1">Explanation success rate</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MetricsPanel;