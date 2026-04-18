import { Router, Request, Response } from "express";
import { validateInput } from "../utils/validator";
import { buildArchitectureGraph } from "../graph/graphBuilder";
import { deepFreeze } from "../utils/deepFreeze";

const router = Router();

router.post("/analyze", (req: Request, res: Response) => {
  try {
    const { files = [], dependencies = [] } = req.body;

    // 1. Validation & Normalization
    const { files: validFiles, dependencies: validDeps } = validateInput(files, dependencies);

    // 2. Build Entire Result (Graph, Views, Metadata)
    const result = buildArchitectureGraph({
      files: validFiles,
      dependencies: validDeps
    });

    // 3. Hardening (Immutability)
    deepFreeze(result.nodeMap);
    deepFreeze(result.searchIndex);
    deepFreeze(result.queryContext);

    // 4. Update Final Metadata (Payload Size)
    const payloadStr = JSON.stringify(result);
    const payloadSizeKB = Math.round(payloadStr.length / 1024);
    result.metadata.payloadSize = payloadSizeKB;

    return res.status(200).json(result);
  } catch (error) {
    console.error("Analysis Exception:", error);
    
    // Canonical Fallback Structure
    return res.status(200).json({
      graph: { nodes: [], edges: [] },
      views: { default: [], highImpact: [], entryPoints: [], byFolder: {} },
      nodeMap: {},
      searchIndex: {},
      queryContext: { topNodes: [], entryPoints: [], nodeMap: {} },
      metadata: {
        totalFiles: 0,
        totalEdges: 0,
        validEdges: 0,
        isLargeGraph: false,
        payloadSize: 0
      }
    });
  }
});

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

export default router;
