import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Share2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const DATASET_SIZES = { Cora: 60, Citeseer: 80, PubMed: 100 };

function buildGraph(count) {
  const nodes = Array.from({ length: count }, (_, i) => ({ id: i }));
  const links = [];
  const deg = new Array(count).fill(1);
  for (let i = 1; i < count; i++) {
    const conns = Math.min(i, 1 + Math.floor(Math.random() * 3));
    const added = new Set();
    for (let c = 0; c < conns; c++) {
      const total = deg.slice(0, i).reduce((a, b) => a + b, 0);
      let r = Math.random() * total, j = 0;
      while (r > 0 && j < i - 1) { r -= deg[j]; j++; }
      if (!added.has(j)) { links.push({ source: i, target: j, idx: links.length }); deg[i]++; deg[j]++; added.add(j); }
    }
  }
  return { nodes, links };
}

export default function GraphVisualization({ dataset, nodeExplanations, attackConfig, defenseConfig, explainerConfig }) {
  const fgRef = useRef();
  const containerRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [viewMode, setViewMode] = useState('original');
  const [hovered, setHovered] = useState(null);
  const [width, setWidth] = useState(800);

  const parsedSelected = useMemo(() => {
    const raw = explainerConfig?.node_idx;
    if (!raw) return [];
    return String(raw).split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  }, [explainerConfig]);

  // Build graph on dataset change
  useEffect(() => {
    if (!dataset) return;
    const count = DATASET_SIZES[dataset] || 60;
    setGraphData(buildGraph(count));
    setViewMode('original');
  }, [dataset]);

  // Fit view after graph loads
  useEffect(() => {
    if (!graphData.nodes.length) return;
    const t = setTimeout(() => fgRef.current?.zoomToFit(400, 40), 600);
    return () => clearTimeout(t);
  }, [graphData]);

  // Responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => setWidth(containerRef.current.clientWidth));
    ro.observe(containerRef.current);
    setWidth(containerRef.current.clientWidth);
    return () => ro.disconnect();
  }, []);

  const neighborSet = useMemo(() => {
    const s = new Set();
    parsedSelected.forEach(sid => {
      graphData.links.forEach(({ source, target }) => {
        const a = typeof source === 'object' ? source.id : source;
        const b = typeof target === 'object' ? target.id : target;
        if (a === sid) s.add(b);
        if (b === sid) s.add(a);
      });
    });
    return s;
  }, [parsedSelected, graphData.links]);

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const id = node.id;
    const isSelected  = parsedSelected.includes(id);
    const hasExplain  = nodeExplanations?.some(e => e.node_idx === id);
    const isNeighbor  = neighborSet.has(id);
    const isHovered   = hovered?.id === id;

    let r      = 4;
    let fill   = '#2A2A2A';
    let stroke = '#404040';
    let glow   = null;

    if (isSelected)      { r = 7;   fill = '#E60000'; stroke = '#FF4444'; glow = 'rgba(230,0,0,0.5)'; }
    else if (hasExplain) { r = 6;   fill = '#22C55E'; stroke = '#16A34A'; glow = 'rgba(34,197,94,0.45)'; }
    else if (isNeighbor) { r = 4.5; fill = '#3A3A3A'; stroke = '#555555'; }
    else if (isHovered)  { r = 5.5; fill = '#525252'; stroke = '#737373'; glow = 'rgba(255,255,255,0.15)'; }

    // Glow ring
    if (glow) {
      const grad = ctx.createRadialGradient(node.x, node.y, r * 0.5, node.x, node.y, r * 3.2);
      grad.addColorStop(0, glow);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Node body
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = (isSelected || hasExplain) ? 1.5 / globalScale : 0.8 / globalScale;
    ctx.stroke();

    // Label
    if (isSelected || hasExplain || isHovered) {
      const label = String(id);
      const fs = Math.max(8, 11 / globalScale);
      ctx.font = `600 ${fs}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = isSelected ? '#FF8080' : hasExplain ? '#86EFAC' : '#BDBDBD';
      ctx.fillText(label, node.x, node.y - r - 2 / globalScale);
    }
  }, [parsedSelected, nodeExplanations, neighborSet, hovered]);

  const linkColor = useCallback((link) => {
    if (viewMode === 'attacked' && attackConfig?.name && link.idx % 9 < 2) return 'rgba(230,0,0,0.7)';
    if (viewMode === 'defended' && defenseConfig?.name && link.idx % 7 === 0) return 'rgba(34,197,94,0.6)';
    const a = typeof link.source === 'object' ? link.source.id : link.source;
    const b = typeof link.target === 'object' ? link.target.id : link.target;
    if (parsedSelected.includes(a) || parsedSelected.includes(b)) return 'rgba(80,80,80,0.8)';
    return 'rgba(40,40,40,0.9)';
  }, [viewMode, attackConfig, defenseConfig, parsedSelected]);

  const linkWidth = useCallback((link) => {
    if (viewMode === 'attacked' && attackConfig?.name && link.idx % 9 < 2) return 1.5;
    if (viewMode === 'defended' && defenseConfig?.name && link.idx % 7 === 0) return 1.2;
    return 0.6;
  }, [viewMode, attackConfig, defenseConfig]);

  const linkDirectionalParticles = useCallback((link) => {
    if (viewMode === 'attacked' && attackConfig?.name && link.idx % 9 < 2) return 3;
    if (viewMode === 'defended' && defenseConfig?.name && link.idx % 7 === 0) return 2;
    return 0;
  }, [viewMode, attackConfig, defenseConfig]);

  const linkDirectionalParticleColor = useCallback((link) => {
    if (viewMode === 'attacked') return '#FF4444';
    return '#4ADE80';
  }, [viewMode]);

  const modes = [
    { key: 'original', label: 'Original' },
    ...(attackConfig?.name  ? [{ key: 'attacked', label: 'Attacked' }]  : []),
    ...(defenseConfig?.name ? [{ key: 'defended', label: 'Defended' }] : []),
  ];

  const legendItems = [
    { fill: '#2A2A2A', stroke: '#404040', label: 'Node' },
    ...(parsedSelected.length        ? [{ fill: '#E60000', stroke: '#FF4444', label: 'Selected' }]  : []),
    ...(nodeExplanations?.length     ? [{ fill: '#22C55E', stroke: '#16A34A', label: 'Explained' }] : []),
    ...(parsedSelected.length        ? [{ fill: '#3A3A3A', stroke: '#555555', label: 'Neighbor' }]  : []),
  ];

  if (!dataset) return null;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EBEBEB' }}>
        <div className="flex items-center gap-2.5">
          <Share2 className="w-4 h-4" style={{ color: '#BDBDBD' }} />
          <h3 className="font-semibold" style={{ fontSize: 15, color: '#0D0D0D' }}>Graph structure</h3>
          <span className="badge badge-bw">{dataset}</span>
          {graphData.nodes.length > 0 && (
            <span className="text-xs" style={{ color: '#BDBDBD' }}>
              {graphData.nodes.length} nodes · {graphData.links.length} edges
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            {[
              { icon: ZoomIn,    fn: () => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 200), title: 'Zoom in'  },
              { icon: ZoomOut,   fn: () => fgRef.current?.zoom(fgRef.current.zoom() * 0.75, 200), title: 'Zoom out' },
              { icon: RotateCcw, fn: () => fgRef.current?.zoomToFit(300, 40), title: 'Fit'  },
            ].map(({ icon: Icon, fn, title }) => (
              <button key={title} onClick={fn} title={title}
                className="btn-sm btn-secondary"
                style={{ padding: '4px 8px', height: 28 }}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* View mode tabs */}
          {modes.length > 1 && (
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: '#F5F5F5' }}>
              {modes.map(m => (
                <button key={m.key} onClick={() => setViewMode(m.key)}
                  className="btn-sm"
                  style={{
                    background: viewMode === m.key ? '#FFFFFF' : 'transparent',
                    color: viewMode === m.key ? '#0D0D0D' : '#737373',
                    boxShadow: viewMode === m.key ? '0 1px 2px rgb(0 0 0/0.08)' : 'none',
                    border: viewMode === m.key ? '1px solid #EBEBEB' : '1px solid transparent',
                    borderRadius: 6, height: 26,
                  }}>
                  {m.key === 'attacked' && <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ background: '#E60000' }} />}
                  {m.key === 'defended' && <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ background: '#22C55E' }} />}
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Graph canvas */}
      <div ref={containerRef} style={{ background: '#0A0A0A', position: 'relative' }}>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          width={width}
          height={420}
          backgroundColor="#0A0A0A"
          nodeCanvasObject={nodeCanvasObject}
          nodeCanvasObjectMode={() => 'replace'}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkDirectionalParticles={linkDirectionalParticles}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={linkDirectionalParticleColor}
          onNodeHover={setHovered}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          minZoom={0.3}
          maxZoom={6}
        />

        {/* Hover tooltip */}
        {hovered && (
          <div className="absolute top-3 left-3 text-xs rounded-lg px-3 py-2.5 pointer-events-none"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FFFFFF', boxShadow: '0 4px 20px rgb(0 0 0/0.5)' }}>
            <p className="font-semibold mb-1">Node {hovered.id}</p>
            {parsedSelected.includes(hovered.id) && <p style={{ color: '#FF8080' }}>● Selected for explanation</p>}
            {nodeExplanations?.some(e => e.node_idx === hovered.id) && <p style={{ color: '#86EFAC' }}>● Explanation computed</p>}
            {neighborSet.has(hovered.id) && !parsedSelected.includes(hovered.id) && <p style={{ color: '#737373' }}>● Neighbor of selected</p>}
            {!parsedSelected.includes(hovered.id) && !nodeExplanations?.some(e => e.node_idx === hovered.id) && !neighborSet.has(hovered.id) && (
              <p style={{ color: '#525252' }}>Regular node</p>
            )}
          </div>
        )}

        <p className="absolute bottom-3 left-3 text-xs" style={{ color: '#2A2A2A' }}>
          Scroll to zoom · drag nodes · drag canvas to pan
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3"
        style={{ borderTop: '1px solid #141414', background: '#0F0F0F' }}>
        {legendItems.map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: item.fill, border: `1.5px solid ${item.stroke}` }} />
            <span className="text-xs" style={{ color: '#525252' }}>{item.label}</span>
          </div>
        ))}
        {viewMode === 'attacked' && attackConfig?.name && (
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 rounded-full" style={{ background: '#E60000' }} />
            <span className="text-xs" style={{ color: '#525252' }}>Attack edge</span>
          </div>
        )}
        {viewMode === 'defended' && defenseConfig?.name && (
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 rounded-full" style={{ background: '#22C55E' }} />
            <span className="text-xs" style={{ color: '#525252' }}>Defense edge</span>
          </div>
        )}
      </div>
    </div>
  );
}
