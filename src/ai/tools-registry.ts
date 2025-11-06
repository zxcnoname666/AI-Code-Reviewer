/**
 * AI Tools Registry - Central registry for all AI tools
 */

import type { AITool, ToolCall, ToolResult, FileChange } from '../types/index.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { exec } from '@actions/exec';
import { parseFile } from '../analysis/ast-parser.js';
import { lintFile } from '../analysis/linter-runner.js';

/**
 * Tool execution context
 */
export interface ToolContext {
  workdir: string;
  files: FileChange[];
  baseSha: string;
  headSha: string;
}

/**
 * All available tools for AI
 */
export const AI_TOOLS: AITool[] = [
  {
    name: 'read_file',
    description: 'Read the complete content of a file from the repository. Use this to see the full context of a file.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file relative to repository root',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'get_file_diff',
    description: 'Get the git diff for a specific file. Shows what was changed (additions/deletions).',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file',
        },
        context_lines: {
          type: 'number',
          description: 'Number of context lines around changes (default: 3)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'analyze_file_ast',
    description: 'Perform deep AST (Abstract Syntax Tree) analysis on a file. Returns functions, classes, imports, and code metrics.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to analyze',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'find_function_callers',
    description: 'Find all places where a function is called. Useful for understanding the impact of changes.',
    parameters: {
      type: 'object',
      properties: {
        function_name: {
          type: 'string',
          description: 'Name of the function to find callers for',
        },
        file_path: {
          type: 'string',
          description: 'Path to the file containing the function',
        },
      },
      required: ['function_name', 'file_path'],
    },
  },
  {
    name: 'find_function_dependencies',
    description: 'Find all functions that a given function depends on (calls). Shows the dependency tree.',
    parameters: {
      type: 'object',
      properties: {
        function_name: {
          type: 'string',
          description: 'Name of the function',
        },
        file_path: {
          type: 'string',
          description: 'Path to the file containing the function',
        },
      },
      required: ['function_name', 'file_path'],
    },
  },
  {
    name: 'run_linter',
    description: 'Run linter on a file to find potential issues, style violations, and code quality problems.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to lint',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'search_code',
    description: 'Search for a pattern in the codebase using grep. Useful for finding similar patterns or usages.',
    parameters: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Pattern to search for (supports regex)',
        },
        file_pattern: {
          type: 'string',
          description: 'File pattern to search in (e.g., "*.ts", "src/**/*.js")',
        },
      },
      required: ['pattern'],
    },
  },
  {
    name: 'get_commit_info',
    description: 'Get detailed information about a specific commit, including message, author, and files changed.',
    parameters: {
      type: 'object',
      properties: {
        sha: {
          type: 'string',
          description: 'Commit SHA (can be short or full)',
        },
      },
      required: ['sha'],
    },
  },
  {
    name: 'get_file_history',
    description: 'Get the recent commit history for a specific file. Useful for understanding the evolution of a file.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of commits to return (default: 10)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'analyze_function_complexity',
    description: 'Analyze cyclomatic complexity and other metrics for a specific function.',
    parameters: {
      type: 'object',
      properties: {
        function_name: {
          type: 'string',
          description: 'Name of the function to analyze',
        },
        file_path: {
          type: 'string',
          description: 'Path to the file containing the function',
        },
      },
      required: ['function_name', 'file_path'],
    },
  },
  {
    name: 'get_commits_list',
    description: 'Get the list of commits in the pull request with hash, author, date, and message. Essential for understanding the evolution of changes.',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of commits to return (default: 50)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_commit_diff',
    description: 'Get the full diff for a specific commit by its hash. Shows all changes made in that commit.',
    parameters: {
      type: 'object',
      properties: {
        sha: {
          type: 'string',
          description: 'Commit SHA (can be short or full)',
        },
        file_path: {
          type: 'string',
          description: 'Optional: filter diff to specific file only',
        },
      },
      required: ['sha'],
    },
  },
  {
    name: 'read_large_diff_chunk',
    description: 'Read a portion of a large diff file in chunks to avoid token limits. Useful for reviewing very large changes.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file',
        },
        chunk_index: {
          type: 'number',
          description: 'Which chunk to read (0-based index)',
        },
        lines_per_chunk: {
          type: 'number',
          description: 'Number of diff lines per chunk (default: 100)',
        },
      },
      required: ['path', 'chunk_index'],
    },
  },
  {
    name: 'get_pr_context',
    description: 'Get comprehensive context about the pull request including branch info, labels, reviewers, and linked issues.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'analyze_function_impact',
    description: 'Comprehensive analysis of function call sites across the entire project. Shows full context around each call (not just grep lines) to analyze breaking changes when function signatures change. Essential for reviewing parameter changes, refactoring, and API modifications.',
    parameters: {
      type: 'object',
      properties: {
        function_name: {
          type: 'string',
          description: 'Name of the function to analyze',
        },
        file_path: {
          type: 'string',
          description: 'Path to the file containing the function definition',
        },
        context_lines: {
          type: 'number',
          description: 'Number of lines to show before and after each call (default: 5)',
        },
      },
      required: ['function_name', 'file_path'],
    },
  },
];

/**
 * Execute a tool with given parameters
 */
export async function executeTool(
  tool: ToolCall,
  context: ToolContext
): Promise<ToolResult> {
  try {
    const result = await executeToolInternal(tool, context);
    return {
      name: tool.name,
      result,
    };
  } catch (error: any) {
    return {
      name: tool.name,
      result: '',
      error: error.message || String(error),
    };
  }
}

/**
 * Internal tool execution logic
 */
async function executeToolInternal(tool: ToolCall, context: ToolContext): Promise<string> {
  const { name, arguments: args } = tool;

  switch (name) {
    case 'read_file':
      return await readFile(args.path, context);

    case 'get_file_diff':
      return await getFileDiff(args.path, args.context_lines || 3, context);

    case 'analyze_file_ast':
      return await analyzeFileAST(args.path, context);

    case 'find_function_callers':
      return await findFunctionCallers(args.function_name, args.file_path, context);

    case 'find_function_dependencies':
      return await findFunctionDependencies(args.function_name, args.file_path, context);

    case 'run_linter':
      return await runLinter(args.path, context);

    case 'search_code':
      return await searchCode(args.pattern, args.file_pattern, context);

    case 'get_commit_info':
      return await getCommitInfo(args.sha, context);

    case 'get_file_history':
      return await getFileHistory(args.path, args.limit || 10, context);

    case 'analyze_function_complexity':
      return await analyzeFunctionComplexity(args.function_name, args.file_path, context);

    case 'get_commits_list':
      return await getCommitsList(args.limit || 50, context);

    case 'get_commit_diff':
      return await getCommitDiff(args.sha, args.file_path, context);

    case 'read_large_diff_chunk':
      return await readLargeDiffChunk(args.path, args.chunk_index, args.lines_per_chunk || 100, context);

    case 'get_pr_context':
      return await getPRContext(context);

    case 'analyze_function_impact':
      return await analyzeFunctionImpact(args.function_name, args.file_path, args.context_lines || 5, context);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * Tool implementations
 */

async function readFile(path: string, context: ToolContext): Promise<string> {
  try {
    const fullPath = join(context.workdir, path);
    const content = readFileSync(fullPath, 'utf-8');

    return `\`\`\`
File: ${path}
Lines: ${content.split('\n').length}

${content}
\`\`\``;
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

async function getFileDiff(path: string, contextLines: number, context: ToolContext): Promise<string> {
  let output = '';

  await exec(
    'git',
    ['diff', `-U${contextLines}`, context.baseSha, context.headSha, '--', path],
    {
      cwd: context.workdir,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
    }
  );

  if (!output.trim()) {
    return `No changes in ${path}`;
  }

  return `\`\`\`diff
${output}
\`\`\``;
}

async function analyzeFileAST(path: string, context: ToolContext): Promise<string> {
  const fullPath = join(context.workdir, path);
  const content = readFileSync(fullPath, 'utf-8');

  console.log(`[analyze_file_ast] Parsing ${path}...`);
  const analysis = await parseFile(content, path);

  console.log(`[analyze_file_ast] Parse result for ${path}:`);
  console.log(`  - AST available: ${analysis.ast !== null}`);
  console.log(`  - Functions found: ${analysis.functions.length}`);
  console.log(`  - Dependencies found: ${analysis.dependencies.length}`);
  console.log(`  - Lines of code: ${analysis.metrics.linesOfCode}`);

  const lines: string[] = [];
  lines.push(`## AST Analysis: ${path}\n`);

  // Check if parsing failed
  if (analysis.ast === null) {
    console.log(`[analyze_file_ast] ⚠️ AST parsing failed for ${path} - returning basic metrics only`);
    lines.push(`⚠️ **Note**: Full AST parsing not available for this file.`);
    lines.push(`Showing basic metrics only.\n`);
  } else {
    console.log(`[analyze_file_ast] ✓ AST parsing successful for ${path}`);
  }

  lines.push(`### Metrics`);
  lines.push(`- Lines of code: ${analysis.metrics.linesOfCode}`);
  lines.push(`- Complexity: ${analysis.metrics.complexity}`);
  lines.push(`- Maintainability: ${analysis.metrics.maintainabilityIndex || 'N/A'}`);
  lines.push(`- Functions: ${analysis.metrics.functionCount}`);
  lines.push(`- Classes: ${analysis.metrics.classCount}`);
  lines.push(`- Comment ratio: ${(analysis.metrics.commentRatio * 100).toFixed(1)}%\n`);

  if (analysis.functions.length > 0) {
    console.log(`[analyze_file_ast] Listing ${analysis.functions.length} functions`);
    lines.push(`### Functions (${analysis.functions.length})`);
    for (const func of analysis.functions) {
      lines.push(`- **${func.name}** (line ${func.line})`);
      lines.push(`  - Params: ${func.params.join(', ') || 'none'}`);
      lines.push(`  - Complexity: ${func.complexity}`);
      lines.push(`  - Async: ${func.isAsync ? 'yes' : 'no'}`);
      lines.push(`  - Exported: ${func.isExported ? 'yes' : 'no'}`);
      if (func.calls && func.calls.length > 0) {
        lines.push(`  - Calls: ${func.calls.join(', ')}`);
      }
    }
    lines.push('');
  } else if (analysis.ast === null) {
    console.log(`[analyze_file_ast] No functions extracted due to parsing failure`);
    lines.push(`\n### Functions`);
    lines.push(`Could not extract function details - AST parsing failed for this file.`);
    lines.push(`The file appears to be valid code based on basic metrics (${analysis.metrics.linesOfCode} lines).`);
    lines.push(`**Recommendation**: Use read_file() or get_file_diff() to review the code manually.\n`);
  } else {
    console.log(`[analyze_file_ast] No functions found in ${path}`);
  }

  if (analysis.dependencies.length > 0) {
    console.log(`[analyze_file_ast] Found ${analysis.dependencies.length} dependencies`);
    lines.push(`### Dependencies (${analysis.dependencies.length})`);
    for (const dep of analysis.dependencies) {
      const type = dep.isExternal ? '📦 external' : '📁 local';
      lines.push(`- ${type}: ${dep.source} (line ${dep.line})`);
      if (dep.specifiers.length > 0) {
        lines.push(`  - Imports: ${dep.specifiers.join(', ')}`);
      }
    }
  }

  const result = lines.join('\n');
  console.log(`[analyze_file_ast] Returning ${result.length} chars for ${path}`);
  return result;
}

async function findFunctionCallers(funcName: string, _filePath: string, context: ToolContext): Promise<string> {
  // For now, use grep to find callers
  // NOTE: For detailed analysis with full context and type info, use analyze_function_impact instead
  // TODO: Integrate with call graph when analyzing all files (low priority - grep works well)
  let output = '';

  // Use -F for fixed string search to avoid regex special chars issues
  await exec(
    'git',
    ['grep', '-F', '-n', `${funcName}(`, context.headSha],
    {
      cwd: context.workdir,
      ignoreReturnCode: true,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
    }
  );

  if (!output.trim()) {
    return `No callers found for ${funcName}`;
  }

  const lines = output.trim().split('\n');
  const result: string[] = [];
  result.push(`## Callers of ${funcName}\n`);
  result.push(`Found ${lines.length} potential call sites:\n`);

  for (const line of lines.slice(0, 20)) {
    // Limit to 20
    result.push(`- ${line}`);
  }

  if (lines.length > 20) {
    result.push(`\n... and ${lines.length - 20} more`);
  }

  return result.join('\n');
}

async function findFunctionDependencies(funcName: string, filePath: string, context: ToolContext): Promise<string> {
  const fullPath = join(context.workdir, filePath);
  const content = readFileSync(fullPath, 'utf-8');

  const analysis = await parseFile(content, filePath);
  const func = analysis.functions.find(f => f.name === funcName);

  if (!func) {
    return `Function ${funcName} not found in ${filePath}`;
  }

  const lines: string[] = [];
  lines.push(`## Dependencies of ${funcName}\n`);

  if (func.calls && func.calls.length > 0) {
    lines.push(`Directly calls ${func.calls.length} function(s):\n`);
    for (const call of func.calls) {
      lines.push(`- ${call}`);
    }
  } else {
    lines.push('This function does not call any other functions.');
  }

  return lines.join('\n');
}

async function runLinter(path: string, context: ToolContext): Promise<string> {
  const results = await lintFile(path, context.workdir);

  if (results.length === 0) {
    return `✅ No linter issues found in ${path}`;
  }

  const lines: string[] = [];
  lines.push(`## Linter Results: ${path}\n`);
  lines.push(`Found ${results.length} issue(s):\n`);

  const grouped = new Map<string, typeof results>();
  for (const result of results) {
    const severity = result.severity;
    if (!grouped.has(severity)) {
      grouped.set(severity, []);
    }
    grouped.get(severity)!.push(result);
  }

  for (const [severity, items] of grouped.entries()) {
    const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
    lines.push(`### ${icon} ${severity.toUpperCase()} (${items.length})\n`);

    for (const item of items.slice(0, 10)) {
      lines.push(`- Line ${item.line}:${item.column} - ${item.message} (\`${item.ruleId}\`)`);
    }

    if (items.length > 10) {
      lines.push(`\n... and ${items.length - 10} more ${severity} issues`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function searchCode(pattern: string, filePattern: string | undefined, context: ToolContext): Promise<string> {
  let output = '';

  const args = ['grep', '-n', pattern];
  if (filePattern) {
    args.push('--', filePattern);
  }

  await exec('git', args, {
    cwd: context.workdir,
    ignoreReturnCode: true,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  });

  if (!output.trim()) {
    return `No matches found for pattern: ${pattern}`;
  }

  const lines = output.trim().split('\n');
  const result: string[] = [];
  result.push(`## Search Results for: ${pattern}\n`);
  result.push(`Found ${lines.length} match(es):\n`);

  for (const line of lines.slice(0, 30)) {
    result.push(`- ${line}`);
  }

  if (lines.length > 30) {
    result.push(`\n... and ${lines.length - 30} more matches`);
  }

  return result.join('\n');
}

async function getCommitInfo(sha: string, context: ToolContext): Promise<string> {
  let output = '';

  await exec('git', ['show', '--stat', '--pretty=format:%H%n%an%n%ae%n%at%n%s%n%b', sha], {
    cwd: context.workdir,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  });

  return `\`\`\`
${output}
\`\`\``;
}

async function getFileHistory(path: string, limit: number, context: ToolContext): Promise<string> {
  let output = '';

  await exec(
    'git',
    ['log', `--max-count=${limit}`, '--pretty=format:%h - %an, %ar : %s', '--', path],
    {
      cwd: context.workdir,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
    }
  );

  if (!output.trim()) {
    return `No history found for ${path}`;
  }

  return `## File History: ${path}\n\n${output}`;
}

async function analyzeFunctionComplexity(funcName: string, filePath: string, context: ToolContext): Promise<string> {
  const fullPath = join(context.workdir, filePath);
  const content = readFileSync(fullPath, 'utf-8');

  const analysis = await parseFile(content, filePath);
  const func = analysis.functions.find(f => f.name === funcName);

  if (!func) {
    return `Function ${funcName} not found in ${filePath}`;
  }

  const lines: string[] = [];
  lines.push(`## Complexity Analysis: ${funcName}\n`);
  lines.push(`File: ${filePath}`);
  lines.push(`Line: ${func.line}\n`);
  lines.push(`### Metrics`);
  lines.push(`- Cyclomatic Complexity: ${func.complexity}`);
  lines.push(`- Parameters: ${func.params.length}`);
  lines.push(`- Async: ${func.isAsync ? 'Yes' : 'No'}`);
  lines.push(`- Exported: ${func.isExported ? 'Yes' : 'No'}`);

  if (func.calls) {
    lines.push(`- Function calls: ${func.calls.length}`);
  }

  lines.push('\n### Assessment');
  const complexity = func.complexity || 0;
  if (complexity <= 5) {
    lines.push('✅ Low complexity - Easy to understand and maintain');
  } else if (complexity <= 10) {
    lines.push('⚠️ Moderate complexity - Consider refactoring if it grows');
  } else if (complexity <= 20) {
    lines.push('❌ High complexity - Should be refactored');
  } else {
    lines.push('🔴 Very high complexity - Refactoring required');
  }

  return lines.join('\n');
}

/**
 * Get list of commits in the PR
 */
async function getCommitsList(limit: number, context: ToolContext): Promise<string> {
  let output = '';

  await exec(
    'git',
    ['log', `--max-count=${limit}`, '--pretty=format:%H|%an|%ae|%at|%s', `${context.baseSha}..${context.headSha}`],
    {
      cwd: context.workdir,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
    }
  );

  if (!output.trim()) {
    return 'No commits found in this pull request';
  }

  const lines: string[] = [];
  lines.push('## Commits in Pull Request\n');
  lines.push('| Hash | Author | Email | Date | Message |');
  lines.push('|------|--------|-------|------|---------|');

  const commits = output.trim().split('\n');
  for (const commit of commits) {
    const [hash, author, email, timestamp, ...messageParts] = commit.split('|');
    const message = messageParts.join('|');
    const date = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
    const shortHash = hash.substring(0, 7);

    lines.push(`| \`${shortHash}\` | ${author} | ${email} | ${date} | ${message} |`);
  }

  lines.push(`\n**Total commits**: ${commits.length}`);

  return lines.join('\n');
}

/**
 * Get diff for a specific commit
 */
async function getCommitDiff(sha: string, filePath: string | undefined, context: ToolContext): Promise<string> {
  let output = '';

  const args = ['show', '--format=%H%n%an <%ae>%n%at%n%s%n%b', sha];
  if (filePath) {
    args.push('--', filePath);
  }

  await exec('git', args, {
    cwd: context.workdir,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  });

  if (!output.trim()) {
    return filePath
      ? `No changes found in commit ${sha} for file ${filePath}`
      : `Commit ${sha} not found`;
  }

  // Truncate if too large (> 10000 lines)
  const lines = output.split('\n');
  if (lines.length > 10000) {
    const truncated = lines.slice(0, 10000).join('\n');
    return `\`\`\`diff
${truncated}

... (truncated: commit diff was ${lines.length} lines, showing first 10000)
Use read_large_diff_chunk to read specific files in chunks if needed.
\`\`\``;
  }

  return `\`\`\`diff
${output}
\`\`\``;
}

/**
 * Read large diff in chunks
 */
async function readLargeDiffChunk(
  path: string,
  chunkIndex: number,
  linesPerChunk: number,
  context: ToolContext
): Promise<string> {
  let output = '';

  await exec(
    'git',
    ['diff', context.baseSha, context.headSha, '--', path],
    {
      cwd: context.workdir,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
    }
  );

  if (!output.trim()) {
    return `No changes found for ${path}`;
  }

  const lines = output.split('\n');
  const totalChunks = Math.ceil(lines.length / linesPerChunk);

  if (chunkIndex >= totalChunks) {
    return `Invalid chunk index ${chunkIndex}. File has ${totalChunks} chunks (0-${totalChunks - 1})`;
  }

  const startLine = chunkIndex * linesPerChunk;
  const endLine = Math.min(startLine + linesPerChunk, lines.length);
  const chunk = lines.slice(startLine, endLine).join('\n');

  const result: string[] = [];
  result.push(`## Diff Chunk for: ${path}`);
  result.push(`**Chunk**: ${chunkIndex + 1}/${totalChunks}`);
  result.push(`**Lines**: ${startLine + 1}-${endLine} of ${lines.length}`);
  result.push('');
  result.push('```diff');
  result.push(chunk);
  result.push('```');

  if (chunkIndex < totalChunks - 1) {
    result.push('');
    result.push(`💡 **Tip**: Use chunk_index=${chunkIndex + 1} to read the next chunk`);
  }

  return result.join('\n');
}

/**
 * Get PR context (placeholder - would need GitHub API integration)
 */
async function getPRContext(context: ToolContext): Promise<string> {
  const lines: string[] = [];

  lines.push('## Pull Request Context\n');
  lines.push(`**Base Branch**: ${context.baseSha.substring(0, 7)}`);
  lines.push(`**Head Branch**: ${context.headSha.substring(0, 7)}`);
  lines.push(`**Working Directory**: ${context.workdir}`);
  lines.push(`**Files Changed**: ${context.files.length}`);

  // Group files by status
  const statuses = {
    added: context.files.filter(f => f.status === 'added').length,
    modified: context.files.filter(f => f.status === 'modified').length,
    removed: context.files.filter(f => f.status === 'removed').length,
    renamed: context.files.filter(f => f.status === 'renamed').length,
  };

  lines.push('\n**File Changes**:');
  lines.push(`- ✅ Added: ${statuses.added}`);
  lines.push(`- ✏️ Modified: ${statuses.modified}`);
  lines.push(`- ❌ Removed: ${statuses.removed}`);
  lines.push(`- ↔️ Renamed: ${statuses.renamed}`);

  // Get branch info
  let branchOutput = '';
  try {
    await exec('git', ['branch', '-vv'], {
      cwd: context.workdir,
      listeners: {
        stdout: (data: Buffer) => {
          branchOutput += data.toString();
        },
      },
    });

    if (branchOutput) {
      lines.push('\n**Branch Info**:');
      lines.push('```');
      lines.push(branchOutput.trim());
      lines.push('```');
    }
  } catch {
    // Branch info not available
  }

  return lines.join('\n');
}

/**
 * Comprehensive function impact analysis
 * Shows full context around each call site for breaking change detection
 */
async function analyzeFunctionImpact(
  funcName: string,
  filePath: string,
  contextLines: number,
  context: ToolContext
): Promise<string> {
  const lines: string[] = [];

  lines.push(`## Function Impact Analysis: ${funcName}`);
  lines.push(`**Definition**: \`${filePath}\``);
  lines.push(`**Context**: ±${contextLines} lines around each call\n`);

  // First, get the function definition for reference
  try {
    const fullPath = join(context.workdir, filePath);
    const content = readFileSync(fullPath, 'utf-8');
    const analysis = await parseFile(content, filePath);
    const func = analysis.functions.find(f => f.name === funcName);

    if (func) {
      lines.push(`### Function Definition\n`);
      lines.push(`**Line**: ${func.line}`);
      lines.push(`**Parameters**: ${func.params.length > 0 ? func.params.join(', ') : '(none)'}`);
      lines.push(`**Async**: ${func.isAsync ? 'Yes' : 'No'}`);
      lines.push(`**Exported**: ${func.isExported ? 'Yes' : 'No'}`);
      lines.push(`**Complexity**: ${func.complexity || 'N/A'}\n`);
    }
  } catch (error) {
    lines.push(`⚠️ Could not parse function definition: ${error}\n`);
  }

  // Find all call sites using git grep
  let grepOutput = '';
  try {
    await exec(
      'git',
      ['grep', '-F', '-n', `${funcName}(`, context.headSha],
      {
        cwd: context.workdir,
        ignoreReturnCode: true,
        listeners: {
          stdout: (data: Buffer) => {
            grepOutput += data.toString();
          },
        },
      }
    );
  } catch (error) {
    return `❌ Failed to search for function calls: ${error}`;
  }

  if (!grepOutput.trim()) {
    lines.push(`### Call Sites\n`);
    lines.push(`✅ No call sites found (function may be unused or only called dynamically)\n`);
    return lines.join('\n');
  }

  // Parse grep results
  interface CallSite {
    file: string;
    line: number;
    snippet: string;
  }

  const callSites: CallSite[] = [];
  const grepLines = grepOutput.trim().split('\n');

  for (const grepLine of grepLines) {
    // Format: file:line:content
    const match = grepLine.match(/^([^:]+):(\d+):(.+)$/);
    if (match) {
      const [, file, lineStr, snippet] = match;
      callSites.push({
        file,
        line: parseInt(lineStr, 10),
        snippet: snippet.trim(),
      });
    }
  }

  lines.push(`### Call Sites\n`);
  lines.push(`Found **${callSites.length}** call site(s) across **${new Set(callSites.map(c => c.file)).size}** file(s)\n`);

  // Group by file
  const byFile = new Map<string, CallSite[]>();
  for (const site of callSites) {
    if (!byFile.has(site.file)) {
      byFile.set(site.file, []);
    }
    byFile.get(site.file)!.push(site);
  }

  // Show detailed context for each call site (limit to 15 total to avoid overwhelming)
  let shownCount = 0;
  const maxToShow = 15;

  for (const [file, sites] of byFile.entries()) {
    if (shownCount >= maxToShow) {
      const remaining = callSites.length - shownCount;
      lines.push(`\n... and **${remaining}** more call site(s) in other files`);
      lines.push(`💡 **Tip**: Use \`search_code\` or \`find_function_callers\` for a complete list`);
      break;
    }

    lines.push(`---\n`);
    lines.push(`#### \`${file}\` (${sites.length} call${sites.length > 1 ? 's' : ''})\n`);

    // Read the file to show context
    try {
      const fullPath = join(context.workdir, file);
      const fileContent = readFileSync(fullPath, 'utf-8');
      const fileLines = fileContent.split('\n');

      for (const site of sites) {
        if (shownCount >= maxToShow) break;

        const lineNum = site.line;
        const startLine = Math.max(1, lineNum - contextLines);
        const endLine = Math.min(fileLines.length, lineNum + contextLines);

        lines.push(`**Call at line ${lineNum}**:\n`);
        lines.push('```' + detectLanguageExtension(file));

        // Show context with line numbers
        for (let i = startLine; i <= endLine; i++) {
          const marker = i === lineNum ? '→' : ' ';
          const lineContent = fileLines[i - 1] || '';
          lines.push(`${marker} ${String(i).padStart(4, ' ')} | ${lineContent}`);
        }

        lines.push('```');

        // Extract and show types for TypeScript/JavaScript files
        if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          const typeInfo = extractTypeInformation(fileContent, fileLines, lineNum, funcName);
          if (typeInfo.length > 0) {
            lines.push('');
            lines.push('**Type Information**:');
            for (const info of typeInfo) {
              lines.push(`- \`${info.variable}\`: ${info.type}`);
            }
          }
        }

        lines.push('');
        shownCount++;
      }
    } catch (error) {
      lines.push(`⚠️ Could not read file context: ${error}\n`);
      shownCount += sites.length;
    }
  }

  // Add analysis summary
  lines.push(`---\n`);
  lines.push(`### Breaking Change Analysis\n`);
  lines.push(`**Total Impact**: ${callSites.length} call site(s) would be affected by changes to this function\n`);
  lines.push(`**Recommendations**:`);
  lines.push(`- Review all call sites before changing function signature`);
  lines.push(`- Check if parameter types/order match your changes`);
  lines.push(`- Consider adding/updating TypeScript types to catch issues at compile time`);
  lines.push(`- Add deprecation warnings if this is a public API`);

  if (callSites.length > 10) {
    lines.push(`- ⚠️ **High impact**: ${callSites.length} call sites - consider backward compatibility`);
  } else if (callSites.length > 5) {
    lines.push(`- ⚠️ **Medium impact**: ${callSites.length} call sites - thorough testing recommended`);
  } else if (callSites.length > 0) {
    lines.push(`- ✅ **Low impact**: ${callSites.length} call sites - manageable refactoring`);
  }

  return lines.join('\n');
}

/**
 * Extract type information from code around function call
 */
function extractTypeInformation(
  fileContent: string,
  fileLines: string[],
  callLineNum: number,
  funcName: string
): Array<{ variable: string; type: string }> {
  const typeInfo: Array<{ variable: string; type: string }> = [];

  // Get the call line
  const callLine = fileLines[callLineNum - 1] || '';

  // Extract variables/properties used in the function call
  // Match: funcName(arg1, arg2.prop, arg3[0], ...)
  const callMatch = callLine.match(new RegExp(`${funcName}\\s*\\(([^)]+)\\)`));
  if (!callMatch) return typeInfo;

  const argsText = callMatch[1];
  // Split by comma, but be careful with nested calls
  const args = argsText.split(',').map(a => a.trim());

  // Search context for type information (±50 lines)
  const searchStart = Math.max(0, callLineNum - 50);
  const searchEnd = Math.min(fileLines.length, callLineNum);
  const contextLines = fileLines.slice(searchStart, searchEnd);

  for (const arg of args) {
    if (!arg) continue;

    // Extract the base variable name (e.g., "item" from "item.quantity")
    const baseVar = arg.split('.')[0].split('[')[0].trim();

    if (!baseVar || baseVar.match(/^['"`\d]/) || baseVar === 'this') {
      // Skip literals and 'this'
      continue;
    }

    // Look for type annotations in context
    const typePatterns = [
      // const/let/var name: Type = ...
      new RegExp(`(?:const|let|var)\\s+${escapeRegExp(baseVar)}\\s*:\\s*([^=;\\n]+)`, 'i'),
      // function param: name: Type
      new RegExp(`[,(]\\s*${escapeRegExp(baseVar)}\\s*:\\s*([^,)=\\n]+)`, 'i'),
      // interface/type property
      new RegExp(`${escapeRegExp(baseVar)}\\s*:\\s*([^;,\\n]+);?`, 'i'),
    ];

    let foundType: string | null = null;

    for (const line of contextLines) {
      for (const pattern of typePatterns) {
        const match = line.match(pattern);
        if (match) {
          foundType = match[1].trim();
          break;
        }
      }
      if (foundType) break;
    }

    if (foundType) {
      // Clean up the type (remove comments, extra whitespace)
      foundType = foundType.replace(/\/\/.+$/, '').trim();

      // For property access like item.quantity, try to infer the property type
      if (arg.includes('.')) {
        const parts = arg.split('.');
        if (parts.length === 2) {
          const propName = parts[1].trim();
          // Try to find the interface/type definition
          const interfacePattern = new RegExp(
            `(?:interface|type)\\s+${escapeRegExp(foundType)}\\s*[={]([^}]+)}`,
            'is'
          );
          const interfaceMatch = fileContent.match(interfacePattern);

          if (interfaceMatch) {
            const interfaceBody = interfaceMatch[1];
            const propPattern = new RegExp(`${escapeRegExp(propName)}\\s*[?:]\\s*([^;,\\n]+)`, 'i');
            const propMatch = interfaceBody.match(propPattern);

            if (propMatch) {
              typeInfo.push({
                variable: arg,
                type: propMatch[1].trim() + ` (from ${foundType})`,
              });
              continue;
            }
          }

          // If not found in interface, just show the base type
          typeInfo.push({
            variable: baseVar,
            type: foundType,
          });
        }
      } else {
        typeInfo.push({
          variable: arg,
          type: foundType,
        });
      }
    }
  }

  return typeInfo;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detect language from file extension for syntax highlighting
 */
function detectLanguageExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'tsx',
    'js': 'javascript',
    'jsx': 'jsx',
    'py': 'python',
    'rs': 'rust',
    'go': 'go',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'rb': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
  };

  return langMap[ext] || '';
}
