import { Graph } from "graphlib";
import { 
  GraphNode, 
  GraphEdge, 
  FileInput, 
  DependencyInput, 
  AnalysisResult 
} from "../types/graphTypes";
import { detectLayer } from "./layerDetector";
import { tokenize } from "../utils/tokenizer";
import { computeLayout } from "./layoutEngine";
import { buildViews } from "../views/viewBuilder";

/**
 * Builds the architecture graph and computes all derived views and metadata.
 */
export function buildArchitectureGraph(input: {
  files: FileInput[];
  dependencies: DependencyInput[];
}): AnalysisResult {
  const g = new Graph({ directed: true });
  
  // 1. Initialize nodes and indices
  const nodes: GraphNode[] = [];
  const nodesMap = new Map<string, GraphNode>();
  const searchIndexMap = new Map<string, Set<string>>();

  // 2. Node Creation Loop
  for (const file of input.files) {
    const segments = file.id.split("/");
    const name = segments[segments.length - 1];
    const folder = segments.length > 1 ? segments.slice(0, -1).join("/") : "root";

    const node: GraphNode = {
      id: file.id,
      name,
      label: name,
      folder,
      layer: detectLayer(file.id),
      impact: 0,
      dependencies: [],
      dependents: [],
      position: { x: 0, y: 0 },
      highlight: false
    };

    nodesMap.set(file.id, node);
    nodes.push(node);
    g.setNode(file.id);

    const tokens = tokenize(file.id);
    for (const token of tokens) {
      if (!searchIndexMap.has(token)) {
        searchIndexMap.set(token, new Set());
      }
      searchIndexMap.get(token)?.add(file.id);
    }
  }

  // 3. Add Edges
  for (const dep of input.dependencies) {
    const sourceNode = nodesMap.get(dep.from);
    const targetNode = nodesMap.get(dep.to);

    if (sourceNode && targetNode) {
      g.setEdge(dep.from, dep.to);
      if (!sourceNode.dependencies.includes(dep.to)) sourceNode.dependencies.push(dep.to);
      if (!targetNode.dependents.includes(dep.from)) targetNode.dependents.push(dep.from);
    }
  }

  // 4. Node Metrics (Impact)
  for (const node of nodes) {
    node.impact = node.dependents.length;
  }

  // 5. Parity Check
  if (nodes.length !== nodesMap.size) {
    console.warn("NodeMap Parity Mismatch. Rebuilding...");
    nodesMap.clear();
    for (const node of nodes) {
      nodesMap.set(node.id, node);
    }
  }

  // 6. Compute Layout
  const edges: GraphEdge[] = g.edges().map((e) => ({ source: e.v, target: e.w }));
  computeLayout(nodes, edges);

  // 7. Search Index (Sorted by Impact)
  const searchIndex: Record<string, string[]> = {};
  for (const [token, nodeIds] of searchIndexMap.entries()) {
    const sortedIds = Array.from(nodeIds).sort((a, b) => {
      const impactA = nodesMap.get(a)?.impact || 0;
      const impactB = nodesMap.get(b)?.impact || 0;
      return impactB - impactA;
    });
    searchIndex[token] = sortedIds.slice(0, 20);
  }

  // 8. Build Views & Query Context (Moved from API layer)
  const nodeMapObj = Object.fromEntries(nodesMap.entries());
  const { views, queryContext } = buildViews(nodes, nodeMapObj);

  // 9. Construct Metadata
  const metadata = {
    version: "2.0.0-LOCKED",
    totalFiles: input.files.length,
    totalEdges: input.dependencies.length,
    validEdges: edges.length,
    isLargeGraph: nodes.length > 200,
    payloadSize: 0 
  };

  console.log("GRAPH NODE COUNT:", nodes.length);
  console.log("GRAPH NODES SAMPLE:", nodes.slice(0, 10).map(n => n.id));

  // Task 7: Sanity Check
  if (nodes.length < 5 && input.files.length >= 5) {
     throw new Error("Graph generation failed to preserve nodes — ingestion likely failed");
  }

  // 10. Final Result Assembly
  return {
    graph: {
      nodes: nodes,
      edges: edges
    },
    views,
    nodeMap: nodeMapObj,
    searchIndex,
    queryContext,
    metadata
  };
}
