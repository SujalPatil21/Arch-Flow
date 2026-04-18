import * as dagre from "dagre";
import { GraphNode, GraphEdge } from "../types/graphTypes";

/**
 * Computes deterministic node positions using Dagre.
 */
export const computeLayout = (nodes: GraphNode[], edges: GraphEdge[]) => {
  if (nodes.length === 0) return;
  
  if (nodes.length === 1) {
    nodes[0].position = { x: 0, y: 0 };
    return;
  }

  const g = new dagre.graphlib.Graph();
  
  // Set fixed configuration
  g.setGraph({
    rankdir: "LR",
    nodesep: 50,
    ranksep: 100,
    marginx: 20,
    marginy: 20
  });
  
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes
  for (const node of nodes) {
    g.setNode(node.id, { width: 180, height: 40 });
  }

  // Add edges
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  // Compute layout
  dagre.layout(g);

  // Assign positions with finite check
  for (const node of nodes) {
    const pos = g.node(node.id);
    const x = pos && Number.isFinite(pos.x) ? pos.x : 0;
    const y = pos && Number.isFinite(pos.y) ? pos.y : 0;
    
    node.position = { x, y };
  }
};
