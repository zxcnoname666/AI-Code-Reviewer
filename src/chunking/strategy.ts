/**
 * Intelligent chunking strategies for large pull requests
 */

import type { FileChange, Chunk, ChunkStrategy } from '../types/index.js';
import { estimateDiffTokens, estimateTokens } from '../utils/tokens.js';
import { extname, dirname } from 'node:path';

/**
 * Default chunking strategy
 */
export const DEFAULT_STRATEGY: ChunkStrategy = {
  name: 'balanced',
  maxTokensPerChunk: 6000,
  groupByModule: true,
  groupByType: true,
};

/**
 * Create chunks from file changes
 */
export function createChunks(
  files: FileChange[],
  strategy: ChunkStrategy = DEFAULT_STRATEGY
): Chunk[] {
  // Sort files by directory and type for better grouping
  const sortedFiles = sortFilesByRelevance(files);

  if (strategy.groupByModule) {
    return chunkByModule(sortedFiles, strategy);
  }

  return chunkBySize(sortedFiles, strategy);
}

/**
 * Sort files to group related changes together
 */
function sortFilesByRelevance(files: FileChange[]): FileChange[] {
  return files.sort((a, b) => {
    // Group by directory first
    const dirA = dirname(a.filename);
    const dirB = dirname(b.filename);
    if (dirA !== dirB) {
      return dirA.localeCompare(dirB);
    }

    // Then by file type
    const extA = extname(a.filename);
    const extB = extname(b.filename);
    if (extA !== extB) {
      return extA.localeCompare(extB);
    }

    // Finally by filename
    return a.filename.localeCompare(b.filename);
  });
}

/**
 * Chunk files by module/directory
 */
function chunkByModule(files: FileChange[], strategy: ChunkStrategy): Chunk[] {
  const chunks: Chunk[] = [];
  const filesByModule = groupFilesByModule(files);

  for (const [module, moduleFiles] of filesByModule.entries()) {
    const moduleTokens = estimateModuleTokens(moduleFiles);

    if (moduleTokens <= strategy.maxTokensPerChunk) {
      // Module fits in one chunk
      chunks.push({
        id: `chunk-${chunks.length + 1}-${sanitizeModuleName(module)}`,
        files: moduleFiles,
        totalChanges: moduleFiles.reduce((sum, f) => sum + f.changes, 0),
        estimatedTokens: moduleTokens,
        reason: `Module: ${module}`,
      });
    } else {
      // Module too large, split by size
      const subChunks = chunkBySize(moduleFiles, strategy, module);
      chunks.push(...subChunks);
    }
  }

  return chunks;
}

/**
 * Chunk files by size only
 */
function chunkBySize(
  files: FileChange[],
  strategy: ChunkStrategy,
  prefix: string = ''
): Chunk[] {
  const chunks: Chunk[] = [];
  let currentChunk: FileChange[] = [];
  let currentTokens = 0;

  for (const file of files) {
    const fileTokens = estimateFileTokens(file);

    if (currentTokens + fileTokens > strategy.maxTokensPerChunk && currentChunk.length > 0) {
      chunks.push({
        id: `chunk-${chunks.length + 1}${prefix ? `-${sanitizeModuleName(prefix)}` : ''}`,
        files: currentChunk,
        totalChanges: currentChunk.reduce((sum, f) => sum + f.changes, 0),
        estimatedTokens: currentTokens,
        reason: prefix ? `Part of ${prefix}` : 'Size-based grouping',
      });

      currentChunk = [file];
      currentTokens = fileTokens;
    } else {
      currentChunk.push(file);
      currentTokens += fileTokens;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({
      id: `chunk-${chunks.length + 1}${prefix ? `-${sanitizeModuleName(prefix)}` : ''}`,
      files: currentChunk,
      totalChanges: currentChunk.reduce((sum, f) => sum + f.changes, 0),
      estimatedTokens: currentTokens,
      reason: prefix ? `Part of ${prefix}` : 'Size-based grouping',
    });
  }

  return chunks;
}

/**
 * Group files by module/directory
 */
function groupFilesByModule(files: FileChange[]): Map<string, FileChange[]> {
  const modules = new Map<string, FileChange[]>();

  for (const file of files) {
    const module = getModuleName(file.filename);
    if (!modules.has(module)) {
      modules.set(module, []);
    }
    modules.get(module)!.push(file);
  }

  return modules;
}

/**
 * Get module name from filepath
 */
function getModuleName(filepath: string): string {
  const parts = filepath.split('/');

  // For src/module/... structure
  if (parts[0] === 'src' && parts.length > 2) {
    return `src/${parts[1]}`;
  }

  // For module/... structure
  if (parts.length > 1) {
    return parts[0];
  }

  return 'root';
}

/**
 * Sanitize module name for use in chunk ID
 */
function sanitizeModuleName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
}

/**
 * Estimate tokens for a file change
 */
function estimateFileTokens(file: FileChange): number {
  let tokens = estimateTokens(file.filename) + 20; // filename + metadata overhead

  if (file.patch) {
    tokens += estimateDiffTokens(file.patch);
  } else {
    // Estimate based on changes if no patch
    tokens += file.changes * 3; // rough estimate
  }

  return tokens;
}

/**
 * Estimate total tokens for module
 */
function estimateModuleTokens(files: FileChange[]): number {
  return files.reduce((sum, file) => sum + estimateFileTokens(file), 0);
}

/**
 * Get chunking statistics
 */
export function getChunkingStats(chunks: Chunk[]): {
  totalChunks: number;
  avgFilesPerChunk: number;
  avgTokensPerChunk: number;
  largestChunk: number;
  smallestChunk: number;
} {
  const fileCounts = chunks.map(c => c.files.length);
  const tokenCounts = chunks.map(c => c.estimatedTokens);

  return {
    totalChunks: chunks.length,
    avgFilesPerChunk: Math.round(
      fileCounts.reduce((sum, count) => sum + count, 0) / chunks.length
    ),
    avgTokensPerChunk: Math.round(
      tokenCounts.reduce((sum, count) => sum + count, 0) / chunks.length
    ),
    largestChunk: Math.max(...tokenCounts),
    smallestChunk: Math.min(...tokenCounts),
  };
}
