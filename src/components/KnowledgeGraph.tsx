import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Memory } from '../utils/mockData';
import { getDomain } from '../utils/search';
import { ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react';

interface KnowledgeGraphProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
  selectedMemory: Memory | null;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  primaryTag: string;
  domain: string;
  memory: Memory;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
}

// Compute a similarity score between two memories (0.0 to 1.0)
function calculateMemorySimilarity(m1: Memory, m2: Memory): number {
  // Tag overlap score
  const set1 = new Set(m1.tags);
  const set2 = new Set(m2.tags);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  const tagOverlap = union.size > 0 ? intersection.size / union.size : 0;

  // Domain match
  const domainMatch = getDomain(m1.url) === getDomain(m2.url) ? 0.3 : 0;

  // Entity topic matches
  const topics1 = new Set(m1.entities.topics);
  const topics2 = new Set(m2.entities.topics);
  const topicIntersect = new Set([...topics1].filter(x => topics2.has(x)));
  const topicOverlap = (topics1.size + topics2.size) > 0 
    ? (topicIntersect.size * 2) / (topics1.size + topics2.size) 
    : 0;

  // Total similarity
  return Math.min(1.0, (tagOverlap * 0.5) + (topicOverlap * 0.4) + domainMatch);
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  memories,
  onSelectMemory,
  selectedMemory
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Generate color palette based on tag strings
  const getTagColor = (tag: string): string => {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      '#8b5cf6', // Violet
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#f43f5e', // Rose
      '#3b82f6', // Blue
      '#ec4899', // Pink
    ];
    return colors[hash % colors.length];
  };

  useEffect(() => {
    if (!svgRef.current || memories.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 500;

    // Clear old drawings
    d3.select(svgRef.current).selectAll('*').remove();

    // 1. Prepare Nodes & Links
    const nodes: GraphNode[] = memories.map(mem => ({
      id: mem.id,
      title: mem.title,
      primaryTag: mem.tags[0] || 'General',
      domain: getDomain(mem.url),
      memory: mem,
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100
    }));

    const links: GraphLink[] = [];
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const similarity = calculateMemorySimilarity(memories[i], memories[j]);
        // Threshold: Cosine similarity simulator > 0.25 (P1 Requirement: cosine similarity > 0.75 for v2, adapted here)
        if (similarity > 0.22) {
          links.push({
            source: memories[i].id,
            target: memories[j].id,
            value: similarity
          });
        }
      }
    }

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Create SVG Groups for layering
    const gContainer = svg.append('g').attr('class', 'graph-root');
    const linkGroup = gContainer.append('g').attr('class', 'links');
    const nodeGroup = gContainer.append('g').attr('class', 'nodes');

    // Add glowing filter definitions for nodes
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    filter.append('feMerge')
      .append('feMergeNode').attr('in', 'blur')
      .select(function() { return this.parentNode?.appendChild(this.cloneNode(true)) as Element; }) // duplicate to merge source
      .attr('in', 'SourceGraphic');

    // 2. Setup Physics Simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(35));

    // 3. Zooming Control
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        gContainer.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    zoomRef.current = zoom;

    // 4. Draw Links (Edges)
    const link = linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.08)')
      .attr('stroke-width', d => Math.max(1, d.value * 3))
      .attr('stroke-dasharray', d => d.value < 0.35 ? '3,3' : 'none')
      .style('transition', 'stroke 0.2s ease');

    // 5. Draw Nodes
    const node = nodeGroup.selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Node outer glowing ring (visible on hover/select)
    node.append('circle')
      .attr('class', 'glow-ring')
      .attr('r', 16)
      .attr('fill', 'none')
      .attr('stroke', d => getTagColor(d.primaryTag))
      .attr('stroke-width', 2)
      .attr('opacity', d => selectedMemory?.id === d.id ? 0.8 : 0)
      .attr('filter', 'url(#node-glow)');

    // Node solid center circle
    node.append('circle')
      .attr('r', 8)
      .attr('fill', d => getTagColor(d.primaryTag))
      .attr('stroke', '#06070a')
      .attr('stroke-width', 2);

    // Node title text labels
    node.append('text')
      .text(d => d.title.length > 25 ? d.title.slice(0, 22) + '...' : d.title)
      .attr('dy', 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 2px 4px rgba(0, 0, 0, 0.8)');

    // Node interactions
    node.on('mouseover', function(_event, d) {
      // Highlight hovered node and links
      node.selectAll('circle').style('opacity', 0.3);
      d3.select(this).selectAll('circle').style('opacity', 1);
      
      // Highlight links connected to this node
      link.attr('stroke', l => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sourceId === d.id || targetId === d.id) {
          // Highlight neighbors in node list
          node.filter((n: any) => n.id === sourceId || n.id === targetId)
            .selectAll('circle')
            .style('opacity', 1);
          return getTagColor(d.primaryTag);
        }
        return 'rgba(255, 255, 255, 0.02)';
      });
    })
    .on('mouseout', function() {
      // Restore node opacities
      node.selectAll('circle').style('opacity', null);
      node.selectAll('.glow-ring').style('opacity', (n: any) => selectedMemory?.id === n.id ? 0.8 : 0);
      link.attr('stroke', 'rgba(255, 255, 255, 0.08)');
    })
    .on('click', function(_event, d) {
      onSelectMemory(d.memory);
    });

    // 6. Update Position in Ticks
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0);

      node
        .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Drag helpers
    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Adjust graph to fit selected node in center
    if (selectedMemory) {
      const targetNode = nodes.find(n => n.id === selectedMemory.id);
      if (targetNode && targetNode.x && targetNode.y) {
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity.translate(width / 2 - targetNode.x * 1.2, height / 2 - targetNode.y * 1.2).scale(1.2)
        );
      }
    }

    return () => {
      simulation.stop();
    };
  }, [memories, selectedMemory]);

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    
    if (direction === 'reset') {
      svg.transition().duration(500).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
    } else {
      const factor = direction === 'in' ? 1.3 : 1 / 1.3;
      svg.transition().duration(300).call(zoomRef.current.scaleBy, factor);
    }
  };

  // Compile list of tags to show in the legend
  const uniqueTags = Array.from(new Set(memories.flatMap(m => m.tags))).slice(0, 6);

  return (
    <div className="flex-1 flex flex-col h-full relative" ref={containerRef}>
      
      {/* Legend & Controls Header */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="glass-panel p-3 flex flex-col gap-2 pointer-events-auto shadow-lg bg-[rgba(10,12,22,0.85)]" style={{ minWidth: '150px' }}>
          <h4 className="text-xs font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-1 mb-1.5 flex items-center gap-1.5">
            <Info size={12} className="text-[var(--color-primary)]" />
            Topic Clusters
          </h4>
          <div className="flex flex-col gap-1.5">
            {uniqueTags.map(tag => (
              <div key={tag} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getTagColor(tag) }}></span>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium">{tag}</span>
              </div>
            ))}
            {memories.length === 0 && (
              <span className="text-[10px] text-[var(--text-muted)]">No clusters generated</span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 glass-panel p-1.5 pointer-events-auto bg-[rgba(10,12,22,0.85)] shadow-lg">
        <button 
          onClick={() => handleZoom('in')}
          className="btn btn-ghost p-1.5 rounded hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:text-white"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button 
          onClick={() => handleZoom('out')}
          className="btn btn-ghost p-1.5 rounded hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:text-white"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button 
          onClick={() => handleZoom('reset')}
          className="btn btn-ghost p-1.5 rounded hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:text-white"
          title="Recenter Graph"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* D3 SVG Canvas */}
      {memories.length === 0 ? (
        <div className="flex-1 flex-center flex-col gap-2">
          <p className="text-sm text-[var(--text-secondary)]">Save some memories to populate the Knowledge Graph.</p>
        </div>
      ) : (
        <svg 
          ref={svgRef} 
          className="w-full h-full block bg-[#030406]"
          style={{ outline: 'none' }}
        />
      )}
    </div>
  );
};
