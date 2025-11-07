import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'lucide-react';

function GraphVisualization({ dataset, nodeExplanations, selectedNodes, attackConfig, defenseConfig, metrics, explainerConfig }) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [viewMode, setViewMode] = useState('original');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!dataset) return;
    const nodeCount = getNodeCount(dataset);
    const newNodes = generateNodes(nodeCount, 800, 400);
    const newEdges = generateEdges(newNodes);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [dataset]);

  // Parse selected nodes from explainer config
  const parsedSelectedNodes = React.useMemo(() => {
    if (explainerConfig?.node_idx) {
      if (typeof explainerConfig.node_idx === 'string') {
        return explainerConfig.node_idx.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      } else {
        return [parseInt(explainerConfig.node_idx)];
      }
    }
    return [];
  }, [explainerConfig]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleWheel = (event) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left - canvas.width / 2;
      const mouseY = event.clientY - rect.top - canvas.height / 2;
      
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.5, Math.min(3, zoom * zoomFactor));
      
      const zoomChange = newZoom / zoom;
      setPan(prev => ({
        x: prev.x - mouseX * (zoomChange - 1),
        y: prev.y - mouseY * (zoomChange - 1)
      }));
      
      setZoom(newZoom);
    };
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, pan]);
  
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth - 32;
    const height = canvas.height = 400;
    
    ctx.clearRect(0, 0, width, height);
    
    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2 + pan.x, -height / 2 + pan.y);
    
    // Draw edges with attack/defense visualization
    edges.forEach((edge, i) => {
      let strokeStyle = '#4b5563';
      let lineWidth = 1;
      
      if (viewMode === 'attacked' && attackConfig?.name && i % 10 < 2) {
        strokeStyle = '#ef4444';
        lineWidth = 2;
      } else if (viewMode === 'defended' && defenseConfig?.name && i % 8 === 0) {
        strokeStyle = '#10b981';
        ctx.setLineDash([5, 5]);
      }
      
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(edge.from.x, edge.from.y);
      ctx.lineTo(edge.to.x, edge.to.y);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    
    // Get neighbors of selected nodes
    const selectedNeighbors = new Set();
    parsedSelectedNodes.forEach(selectedIdx => {
      edges.forEach(edge => {
        if (edge.from.id === selectedIdx) selectedNeighbors.add(edge.to.id);
        if (edge.to.id === selectedIdx) selectedNeighbors.add(edge.from.id);
      });
    });
    
    // Draw nodes
    nodes.forEach((node, i) => {
      const isSelected = parsedSelectedNodes.includes(i);
      const hasExplanation = nodeExplanations?.some(exp => exp.node_idx === i);
      const isHovered = hoveredNode === i;
      const isNeighborOfSelected = selectedNeighbors.has(i);
      
      let fillColor = '#ffffff';
      let strokeColor = '#d1d5db';
      let radius = isHovered ? 8 : 6;
      
      if (isSelected) {
        fillColor = '#3b82f6';
        strokeColor = '#1d4ed8';
        radius = 8;
      } else if (hasExplanation) {
        fillColor = '#10b981';
        strokeColor = '#059669';
      } else if (isNeighborOfSelected) {
        fillColor = '#bfdbfe';
        strokeColor = '#93c5fd';
      }
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();
      
      if (isSelected || hasExplanation || isHovered) {
        ctx.fillStyle = '#000000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(i.toString(), node.x, node.y - 12);
      }
    });
    
    ctx.restore();
    
  }, [nodes, edges, selectedNodes, nodeExplanations, hoveredNode, viewMode, attackConfig, defenseConfig, parsedSelectedNodes, zoom, pan]);



  const getNodeCount = (dataset) => {
    const counts = { Cora: 50, Citeseer: 60, PubMed: 80 };
    return counts[dataset] || 50;
  };

  const generateNodes = (count, width = 800, height = 400) => {
    const nodes = [];
    const padding = 30;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: padding + Math.random() * (width - 2 * padding),
        y: padding + Math.random() * (height - 2 * padding),
        id: i
      });
    }
    return nodes;
  };

  const generateEdges = (nodes) => {
    const edges = [];
    const edgeCount = Math.min(nodes.length * 2, 100);
    for (let i = 0; i < edgeCount; i++) {
      const from = nodes[Math.floor(Math.random() * nodes.length)];
      const to = nodes[Math.floor(Math.random() * nodes.length)];
      if (from !== to) {
        edges.push({ from, to });
      }
    }
    return edges;
  };

  return (
    <div className="card-neo rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center icon-neo-primary">
            <Network className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-neo-primary">Interactive Graph</h3>
        </div>
        
        <div className="flex space-x-1 card-neo rounded-lg p-1">
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'original' ? 'btn-neo-primary' : 'btn-neo-secondary'
            }`}
          >
            Original
          </button>
          {attackConfig?.name && (
            <button
              onClick={() => setViewMode('attacked')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'attacked' ? 'btn-neo-primary' : 'btn-neo-secondary'
              }`}
            >
              Attacked
            </button>
          )}
          {defenseConfig?.name && (
            <button
              onClick={() => setViewMode('defended')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'defended' ? 'btn-neo-primary' : 'btn-neo-secondary'
              }`}
            >
              Defended
            </button>
          )}
        </div>
      </div>
      
      <div className="card-neo rounded-lg p-4">
        <canvas 
          ref={canvasRef}
          onMouseDown={(event) => {
            setIsDragging(true);
            setLastMousePos({ x: event.clientX, y: event.clientY });
          }}
          onMouseMove={(event) => {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left - pan.x) / zoom;
            const y = (event.clientY - rect.top - pan.y) / zoom;
            
            if (isDragging) {
              const deltaX = event.clientX - lastMousePos.x;
              const deltaY = event.clientY - lastMousePos.y;
              setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
              setLastMousePos({ x: event.clientX, y: event.clientY });
              canvas.style.cursor = 'grabbing';
            } else {
              const hoveredNodeIndex = nodes.findIndex(node => {
                const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
                return distance <= 10;
              });
              
              setHoveredNode(hoveredNodeIndex >= 0 ? hoveredNodeIndex : null);
              canvas.style.cursor = hoveredNodeIndex >= 0 ? 'pointer' : 'grab';
            }
          }}
          onMouseUp={() => {
            setIsDragging(false);
          }}
          onMouseLeave={() => {
            setIsDragging(false);
            setHoveredNode(null);
          }}

          className="rounded"
          style={{ maxWidth: '100%', border: '1px solid var(--border)', cursor: 'grab' }}
        />
        

        
        <div className="flex items-center space-x-4 mt-3 text-sm text-neo-secondary">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
            <span>Regular nodes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Selected for explanation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <span>Neighbor of selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Explanation computed</span>
          </div>
          {viewMode === 'attacked' && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-red-500"></div>
              <span>Attack edges</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-neo-secondary">
            Switch views to compare attack/defense effects
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newZoom = Math.min(3, zoom * 1.2);
                setZoom(newZoom);
              }}
              className="btn-neo-secondary px-2 py-1 text-xs rounded"
            >
              Zoom In
            </button>
            <button
              onClick={() => {
                const newZoom = Math.max(0.5, zoom * 0.8);
                setZoom(newZoom);
              }}
              className="btn-neo-secondary px-2 py-1 text-xs rounded"
            >
              Zoom Out
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="btn-neo-secondary px-2 py-1 text-xs rounded"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphVisualization;