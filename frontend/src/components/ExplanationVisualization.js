import React, { useState, useEffect } from 'react';
import { Microscope, AlertCircle, AlignLeft, BarChart2 } from 'lucide-react';

function buildNarrative(exp, topFeatures, topEdges) {
  const lines = [];
  const target = exp.task_type === 'graph' ? 'the entire graph' : `node ${exp.node_idx}`;
  const method = exp.method || 'the explainer';

  lines.push(`${method} was used to explain the model's prediction for ${target}.`);

  if (exp.target_prediction !== undefined)
    lines.push(`The model predicted class ${exp.target_prediction} for this target.`);

  if (exp.confidence !== undefined && exp.fidelity !== undefined)
    lines.push(`The model made this prediction with ${(exp.confidence * 100).toFixed(1)}% confidence, and the explanation preserves ${(exp.fidelity * 100).toFixed(1)}% of the original prediction (fidelity).`);
  else if (exp.confidence !== undefined)
    lines.push(`The model made this prediction with ${(exp.confidence * 100).toFixed(1)}% confidence.`);
  else if (exp.fidelity !== undefined)
    lines.push(`The explanation preserves ${(exp.fidelity * 100).toFixed(1)}% of the original prediction (fidelity)${exp.fidelity === 1.0 ? ' — a perfect score' : exp.fidelity > 0.8 ? ', which is strong' : ', which is moderate'}.`);

  if (exp.num_hops_used)
    lines.push(`The explanation was computed using a ${exp.num_hops_used}-hop neighbourhood around the target node, meaning only nodes within ${exp.num_hops_used} edge${exp.num_hops_used > 1 ? 's' : ''} of the target were considered.`);

  if (topFeatures.length > 0) {
    const top = topFeatures[0];
    const positives = topFeatures.filter(f => f.v > 0);
    const negatives = topFeatures.filter(f => f.v < 0);
    lines.push(
      `Looking at node features, feature F${top.i} had the strongest influence on the prediction (score: ${top.v.toFixed(3)}). ` +
      (positives.length > 0 ? `${positives.length} feature${positives.length > 1 ? 's' : ''} pushed the prediction towards this class` : '') +
      (positives.length > 0 && negatives.length > 0 ? ', while ' : '') +
      (negatives.length > 0 ? `${negatives.length} feature${negatives.length > 1 ? 's' : ''} worked against it` : '') +
      '.'
    );
  } else {
    lines.push('No feature attribution data was available for this explanation.');
  }

  if (topEdges.length > 0) {
    const top = topEdges[0];
    const important = topEdges.filter(e => Math.abs(e.v) > 0.1).length;
    lines.push(
      `Among the graph edges, edge E${top.i} was the most structurally important (score: ${top.v.toFixed(3)}). ` +
      `${important} edge${important !== 1 ? 's' : ''} had a notable impact on the prediction, suggesting the model relies on specific connections in the graph structure.`
    );
  }

  if (exp.prototypes?.length > 0) {
    const best = exp.prototypes[0];
    lines.push(
      `This is a prototype-based explanation. The target node's learned representation is most similar to node ${best.node_idx}` +
      (best.label != null ? ` (class ${best.label})` : '') +
      ` with a similarity of ${(best.similarity * 100).toFixed(1)}%. ` +
      `The model classified this node by comparing it to ${exp.prototypes.length} prototype${exp.prototypes.length > 1 ? 's' : ''} in the embedding space.`
    );
  }

  if (exp.method === 'GraphMask') {
    const retained = exp.edges_retained || 0;
    const gated = exp.edges_gated_off || 0;
    const total = exp.total_edges_evaluated || retained + gated;
    lines.push(
      `GraphMask is a global explainer — it explains the model's message-passing behaviour across the whole graph rather than a single prediction. ` +
      `Out of ${total} edges evaluated, ${retained} were found essential and ${gated} were identified as redundant.` +
      (exp.prediction_invariance !== undefined ? ` The model's predictions remained ${(exp.prediction_invariance * 100).toFixed(1)}% consistent when redundant edges were removed.` : '')
    );
  }

  if (exp.method === 'NeuronAnalysis' && exp.logical_concepts) {
    const and = exp.logical_concepts.AND_patterns?.length || 0;
    const or  = exp.logical_concepts.OR_patterns?.length  || 0;
    const not = exp.logical_concepts.NOT_patterns?.length || 0;
    if (and + or + not > 0)
      lines.push(`Neuron analysis discovered ${and} AND-type, ${or} OR-type, and ${not} NOT-type logical patterns in the model's internal representations, describing how combinations of features trigger specific neurons.`);
  }

  return lines;
}

export default function ExplanationVisualization({ explanations }) {
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('visual');

  useEffect(() => {
    if (explanations?.length) setSelected(explanations[0]);
  }, [explanations]);

  if (!explanations?.length) return null;

  const exp = selected;

  const features = exp?.feature_importance || exp?.attributions || [];
  const topFeatures = features.length
    ? [...features.map((v, i) => ({ i, v }))].sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 8)
    : [];
  const maxFeat = topFeatures.length ? Math.max(...topFeatures.map(f => Math.abs(f.v))) : 1;

  const edgeImps = exp?.edge_importance || [];
  const topEdges = edgeImps.length
    ? [...edgeImps.map((v, i) => ({ i, v }))].sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 8)
    : [];
  const maxEdge = topEdges.length ? Math.max(...topEdges.map(e => Math.abs(e.v))) : 1;

  const narrative = exp ? buildNarrative(exp, topFeatures, topEdges) : [];

  const metricCards = exp ? [
    { label: 'Method', value: exp.method || '—' },
    { label: 'Target', value: exp.task_type === 'graph' ? 'Graph' : `Node ${exp.node_idx ?? '—'}` },
    ...(exp.fidelity !== undefined             ? [{ label: 'Fidelity',   value: `${(exp.fidelity * 100).toFixed(1)}%` }]   : []),
    ...(exp.confidence !== undefined           ? [{ label: 'Confidence', value: `${(exp.confidence * 100).toFixed(1)}%` }] : []),
    ...(exp.prediction_invariance !== undefined ? [{ label: 'Invariance', value: `${(exp.prediction_invariance * 100).toFixed(1)}%` }] : []),
    ...(exp.top_similarity !== undefined       ? [{ label: 'Similarity', value: `${(exp.top_similarity * 100).toFixed(1)}%` }] : []),
  ].slice(0, 4) : [];

  return (
    <div className="card p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Microscope className="w-4 h-4" style={{ color: '#BDBDBD' }} />
          <h3 className="section-title" style={{ fontSize: 16 }}>Explanations</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Node selector */}
          {explanations.length > 1 && (
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: '#F5F5F5' }}>
              {explanations.map((e, idx) => {
                const label = e.task_type === 'graph' ? 'Graph' : `Node ${e.node_idx ?? idx}`;
                const active = selected?.node_idx === e.node_idx && selected?.method === e.method;
                return (
                  <button key={idx} onClick={() => setSelected(e)} className="btn-sm"
                    style={{
                      background: active ? '#FFFFFF' : 'transparent',
                      color: active ? '#0D0D0D' : '#737373',
                      border: active ? '1px solid #EBEBEB' : '1px solid transparent',
                      boxShadow: active ? '0 1px 2px rgb(0 0 0/0.08)' : 'none',
                      borderRadius: 6, height: 26,
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: '#F5F5F5' }}>
            {[
              { key: 'visual',   Icon: BarChart2, label: 'Visual'   },
              { key: 'detailed', Icon: AlignLeft,  label: 'Detailed' },
            ].map(({ key, Icon, label }) => (
              <button key={key} onClick={() => setView(key)} className="btn-sm"
                style={{
                  background: view === key ? '#FFFFFF' : 'transparent',
                  color: view === key ? '#0D0D0D' : '#737373',
                  border: view === key ? '1px solid #EBEBEB' : '1px solid transparent',
                  boxShadow: view === key ? '0 1px 2px rgb(0 0 0/0.08)' : 'none',
                  borderRadius: 6, height: 26,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                <Icon style={{ width: 12, height: 12 }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {exp && (
        <div className="space-y-5">

          {/* Error */}
          {exp.error && (
            <div className="flex items-start gap-3 rounded-lg px-4 py-3"
              style={{ background: '#FFF0F0', border: '1px solid #FFB3B3' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E60000' }} />
              <p className="text-sm" style={{ color: '#B30000' }}>{exp.error}</p>
            </div>
          )}

          {/* Metric cards — always visible in both views */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metricCards.map(({ label, value }) => (
              <div key={label} className="card p-3">
                <p className="metric-label">{label}</p>
                <p className="font-semibold text-sm mt-1 truncate" style={{ color: '#0D0D0D' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── Visual view ── */}
          {view === 'visual' && (
            <div className="space-y-5">

              {topFeatures.length > 0 && (
                <div>
                  <p className="label mb-3">Top feature importances</p>
                  <div className="space-y-2">
                    {topFeatures.map(({ i, v }) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs w-8 text-right flex-shrink-0" style={{ color: '#737373' }}>F{i}</span>
                        <div className="flex-1 rounded-full overflow-hidden" style={{ background: '#F5F5F5', height: 6 }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${(Math.abs(v) / maxFeat) * 100}%`, background: v >= 0 ? '#22C55E' : '#E60000' }} />
                        </div>
                        <span className="text-xs w-14 text-right flex-shrink-0 tabular-nums"
                          style={{ color: v >= 0 ? '#16A34A' : '#B30000' }}>
                          {v.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topEdges.length > 0 && (
                <div>
                  <p className="label mb-3">Top edge importances</p>
                  <div className="space-y-2">
                    {topEdges.map(({ i, v }) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs w-8 text-right flex-shrink-0" style={{ color: '#737373' }}>E{i}</span>
                        <div className="flex-1 rounded-full overflow-hidden" style={{ background: '#F5F5F5', height: 6 }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${(Math.abs(v) / maxEdge) * 100}%`, background: v >= 0 ? '#0D0D0D' : '#E60000' }} />
                        </div>
                        <span className="text-xs w-14 text-right flex-shrink-0 tabular-nums"
                          style={{ color: v >= 0 ? '#0D0D0D' : '#B30000' }}>
                          {v.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {exp.prototypes?.length > 0 && (
                <div>
                  <p className="label mb-3">Prototype matches</p>
                  <div className="space-y-2">
                    {exp.prototypes.slice(0, 5).map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
                        <span className="text-sm" style={{ color: '#404040' }}>
                          Node {p.node_idx}
                          {p.label != null && <span className="ml-2 badge badge-bw">Class {p.label}</span>}
                        </span>
                        <span className="text-sm font-semibold tabular-nums" style={{ color: '#16A34A' }}>
                          {(p.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ── Detailed narrative view ── */}
          {view === 'detailed' && (
            <div className="space-y-3">
              {narrative.map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                    style={{ background: '#F5F5F5', color: '#737373' }}>
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: '#404040' }}>{line}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
