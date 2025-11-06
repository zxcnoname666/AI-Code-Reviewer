/**
 * Call graph and dependency tracking
 */

import type { CallGraphNode, CallGraphEdge, FunctionInfo, DependencyInfo } from '../types/index.js';

/**
 * Build call graph from function information
 */
export function buildCallGraph(
  fileAnalysis: Map<string, { functions: FunctionInfo[]; dependencies: DependencyInfo[] }>
): Map<string, CallGraphNode> {
  const graph = new Map<string, CallGraphNode>();

  // First pass: create nodes for all functions
  for (const [file, analysis] of fileAnalysis.entries()) {
    for (const func of analysis.functions) {
      const key = `${file}:${func.name}`;

      graph.set(key, {
        name: func.name,
        file,
        line: func.line,
        callers: [],
        callees: [],
      });
    }
  }

  // Second pass: create edges based on function calls
  for (const [file, analysis] of fileAnalysis.entries()) {
    for (const func of analysis.functions) {
      const callerKey = `${file}:${func.name}`;
      const callerNode = graph.get(callerKey);

      if (!callerNode || !func.calls) continue;

      for (const calledFunc of func.calls) {
        // Try to find the called function in the same file first
        let calleeKey = `${file}:${calledFunc}`;
        let calleeNode = graph.get(calleeKey);

        // If not found in the same file, search in imported files
        if (!calleeNode) {
          const imported = findFunctionInImports(calledFunc, file, fileAnalysis);
          if (imported) {
            calleeKey = `${imported.file}:${calledFunc}`;
            calleeNode = graph.get(calleeKey);
          }
        }

        if (calleeNode) {
          const edge: CallGraphEdge = {
            from: callerKey,
            to: calleeKey,
            file,
            line: func.line,
          };

          callerNode.callees.push(edge);
          calleeNode.callers.push(edge);
        }
      }
    }
  }

  return graph;
}

/**
 * Find function in imported files
 */
function findFunctionInImports(
  funcName: string,
  currentFile: string,
  fileAnalysis: Map<string, { functions: FunctionInfo[]; dependencies: DependencyInfo[] }>
): { file: string; func: FunctionInfo } | null {
  const analysis = fileAnalysis.get(currentFile);
  if (!analysis) return null;

  for (const dep of analysis.dependencies) {
    if (dep.isExternal) continue;

    // Resolve relative path
    const depFile = resolveImportPath(dep.source, currentFile);
    const depAnalysis = fileAnalysis.get(depFile);

    if (depAnalysis) {
      const func = depAnalysis.functions.find(f => f.name === funcName);
      if (func) {
        return { file: depFile, func };
      }
    }
  }

  return null;
}

/**
 * Resolve import path relative to current file
 */
function resolveImportPath(importPath: string, currentFile: string): string {
  if (importPath.startsWith('.')) {
    const currentDir = currentFile.split('/').slice(0, -1).join('/');
    const parts = importPath.split('/');
    const dirParts = currentDir.split('/');

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        dirParts.pop();
      } else {
        dirParts.push(part);
      }
    }

    return dirParts.join('/');
  }

  return importPath;
}

/**
 * Find all callers of a function
 */
export function findCallers(
  funcName: string,
  file: string,
  graph: Map<string, CallGraphNode>
): CallGraphEdge[] {
  const key = `${file}:${funcName}`;
  const node = graph.get(key);

  return node?.callers || [];
}

/**
 * Find all callees of a function
 */
export function findCallees(
  funcName: string,
  file: string,
  graph: Map<string, CallGraphNode>
): CallGraphEdge[] {
  const key = `${file}:${funcName}`;
  const node = graph.get(key);

  return node?.callees || [];
}

/**
 * Find all dependencies of a function (transitive)
 */
export function findDependencies(
  funcName: string,
  file: string,
  graph: Map<string, CallGraphNode>,
  maxDepth: number = 3
): Set<string> {
  const visited = new Set<string>();
  const queue: Array<{ key: string; depth: number }> = [{ key: `${file}:${funcName}`, depth: 0 }];

  while (queue.length > 0) {
    const { key, depth } = queue.shift()!;

    if (visited.has(key) || depth >= maxDepth) continue;
    visited.add(key);

    const node = graph.get(key);
    if (!node) continue;

    for (const edge of node.callees) {
      if (!visited.has(edge.to)) {
        queue.push({ key: edge.to, depth: depth + 1 });
      }
    }
  }

  // Remove the original function from the result
  visited.delete(`${file}:${funcName}`);

  return visited;
}

/**
 * Get impact analysis: which functions are affected if this function changes
 */
export function getImpactAnalysis(
  funcName: string,
  file: string,
  graph: Map<string, CallGraphNode>,
  maxDepth: number = 5
): {
  directCallers: string[];
  allCallers: string[];
  impactedFiles: Set<string>;
  depth: number;
} {
  const directCallers: string[] = [];
  const allCallers = new Set<string>();
  const impactedFiles = new Set<string>();
  const visited = new Set<string>();
  const queue: Array<{ key: string; depth: number }> = [{ key: `${file}:${funcName}`, depth: 0 }];

  let maxDepthReached = 0;

  while (queue.length > 0) {
    const { key, depth } = queue.shift()!;

    if (visited.has(key) || depth >= maxDepth) continue;
    visited.add(key);

    maxDepthReached = Math.max(maxDepthReached, depth);

    const node = graph.get(key);
    if (!node) continue;

    for (const edge of node.callers) {
      if (depth === 0) {
        directCallers.push(edge.from);
      }

      if (!visited.has(edge.from)) {
        allCallers.add(edge.from);
        impactedFiles.add(edge.file);
        queue.push({ key: edge.from, depth: depth + 1 });
      }
    }
  }

  return {
    directCallers,
    allCallers: Array.from(allCallers),
    impactedFiles,
    depth: maxDepthReached,
  };
}

/**
 * Generate call graph visualization (simple text format)
 */
export function visualizeCallGraph(
  funcName: string,
  file: string,
  graph: Map<string, CallGraphNode>,
  maxDepth: number = 2
): string {
  const lines: string[] = [];

  lines.push(`Call Graph for ${funcName} (${file})`);
  lines.push('═'.repeat(60));

  // Show callees
  lines.push('\n📞 Calls:');
  const callees = findCallees(funcName, file, graph);
  if (callees.length === 0) {
    lines.push('  (no calls)');
  } else {
    for (const edge of callees) {
      const [calleeFile, calleeName] = edge.to.split(':');
      lines.push(`  → ${calleeName} (${calleeFile}:${edge.line})`);
    }
  }

  // Show callers
  lines.push('\n📲 Called by:');
  const callers = findCallers(funcName, file, graph);
  if (callers.length === 0) {
    lines.push('  (not called)');
  } else {
    for (const edge of callers) {
      const [callerFile, callerName] = edge.from.split(':');
      lines.push(`  ← ${callerName} (${callerFile}:${edge.line})`);
    }
  }

  // Show impact analysis
  const impact = getImpactAnalysis(funcName, file, graph, maxDepth);
  lines.push('\n🎯 Impact Analysis:');
  lines.push(`  Direct callers: ${impact.directCallers.length}`);
  lines.push(`  Total affected: ${impact.allCallers.length}`);
  lines.push(`  Impacted files: ${impact.impactedFiles.size}`);
  lines.push(`  Call depth: ${impact.depth}`);

  return lines.join('\n');
}
