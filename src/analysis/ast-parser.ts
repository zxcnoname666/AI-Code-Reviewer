/**
 * Multi-language AST parser and analyzer
 */

import type { ASTNode, FunctionInfo, DependencyInfo, CodeMetrics } from '../types/index.js';
import { parse as babelParse } from '@babel/parser';

/**
 * Parse file and extract AST
 */
export async function parseFile(
  content: string,
  filename: string
): Promise<{
  ast: ASTNode | null;
  functions: FunctionInfo[];
  dependencies: DependencyInfo[];
  metrics: CodeMetrics;
}> {
  const language = detectLanguage(filename);
  console.log(`[parseFile] Detected language: ${language} for ${filename}`);

  try {
    switch (language) {
      case 'typescript':
      case 'tsx':
        console.log(`[parseFile] Using TypeScript parser for ${filename}`);
        return parseTypeScript(content, language === 'tsx');

      case 'javascript':
      case 'jsx':
        console.log(`[parseFile] Using JavaScript parser for ${filename}`);
        return parseJavaScript(content, language === 'jsx');

      default:
        console.log(`[parseFile] No parser for language '${language}' - returning basic metrics`);
        return {
          ast: null,
          functions: [],
          dependencies: [],
          metrics: getBasicMetrics(content),
        };
    }
  } catch (error) {
    console.error(`[parseFile] ❌ Failed to parse ${filename}:`, error);
    console.error(`[parseFile] Error type: ${error instanceof Error ? error.name : typeof error}`);
    console.error(`[parseFile] Error message: ${error instanceof Error ? error.message : String(error)}`);
    return {
      ast: null,
      functions: [],
      dependencies: [],
      metrics: getBasicMetrics(content),
    };
  }
}

/**
 * Detect programming language from filename
 */
export function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
    mjs: 'javascript',
    cjs: 'javascript',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
  };

  return langMap[ext || ''] || 'unknown';
}

/**
 * Parse TypeScript/TSX
 */
function parseTypeScript(
  content: string,
  isTSX: boolean
): {
  ast: ASTNode | null;
  functions: FunctionInfo[];
  dependencies: DependencyInfo[];
  metrics: CodeMetrics;
} {
  try {
    console.log(`[parseTypeScript] Parsing with Babel (TSX: ${isTSX})`);
    // Use Babel parser for TypeScript - it has better support
    const ast = babelParse(content, {
      sourceType: 'module',
      plugins: [
        'typescript',
        isTSX ? 'jsx' : null,
        'decorators-legacy',
        'classProperties',
        'dynamicImport',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'objectRestSpread',
        'optionalChaining',
        'nullishCoalescingOperator',
      ].filter(Boolean) as any[],
    });

    console.log(`[parseTypeScript] AST parsed successfully`);
    const functions = extractFunctions(ast as any);
    console.log(`[parseTypeScript] Extracted ${functions.length} functions`);
    const dependencies = extractDependencies(ast as any);
    console.log(`[parseTypeScript] Extracted ${dependencies.length} dependencies`);
    const metrics = calculateMetrics(content, functions);

    return {
      ast: simplifyAST(ast as any),
      functions,
      dependencies,
      metrics,
    };
  } catch (error) {
    console.error(`[parseTypeScript] ❌ Babel parsing failed:`, error);
    throw new Error(`TypeScript parsing failed: ${error}`);
  }
}

/**
 * Parse JavaScript/JSX
 */
function parseJavaScript(
  content: string,
  isJSX: boolean
): {
  ast: ASTNode | null;
  functions: FunctionInfo[];
  dependencies: DependencyInfo[];
  metrics: CodeMetrics;
} {
  try {
    console.log(`[parseJavaScript] Parsing with Babel (JSX: ${isJSX})`);
    const ast = babelParse(content, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'dynamicImport',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'objectRestSpread',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
    });

    console.log(`[parseJavaScript] AST parsed successfully`);
    const functions = extractFunctions(ast as any);
    console.log(`[parseJavaScript] Extracted ${functions.length} functions`);
    const dependencies = extractDependencies(ast as any);
    console.log(`[parseJavaScript] Extracted ${dependencies.length} dependencies`);
    const metrics = calculateMetrics(content, functions);

    return {
      ast: simplifyAST(ast as any),
      functions,
      dependencies,
      metrics,
    };
  } catch (error) {
    throw new Error(`JavaScript parsing failed: ${error}`);
  }
}

/**
 * Extract function information from AST
 */
function extractFunctions(ast: any): FunctionInfo[] {
  const functions: FunctionInfo[] = [];

  function visit(node: any, parent: any = null) {
    if (!node || typeof node !== 'object') return;

    // Function declarations
    if (node.type === 'FunctionDeclaration' && node.id) {
      functions.push({
        name: node.id.name,
        line: node.loc?.start?.line || 0,
        column: node.loc?.start?.column || 0,
        params: node.params.map((p: any) => getParamName(p)),
        returnType: node.returnType?.typeAnnotation?.type,
        isAsync: node.async || false,
        isExported: isExported(node, parent),
        complexity: calculateComplexity(node),
        calls: extractFunctionCalls(node),
      });
    }

    // Arrow functions and function expressions with identifiers
    if (
      (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') &&
      parent?.type === 'VariableDeclarator' &&
      parent.id
    ) {
      functions.push({
        name: parent.id.name,
        line: node.loc?.start?.line || 0,
        column: node.loc?.start?.column || 0,
        params: node.params.map((p: any) => getParamName(p)),
        returnType: node.returnType?.typeAnnotation?.type,
        isAsync: node.async || false,
        isExported: isExported(parent, null),
        complexity: calculateComplexity(node),
        calls: extractFunctionCalls(node),
      });
    }

    // Class methods
    if (node.type === 'MethodDefinition' && node.key) {
      functions.push({
        name: node.key.name || node.key.value,
        line: node.loc?.start?.line || 0,
        column: node.loc?.start?.column || 0,
        params: node.value.params.map((p: any) => getParamName(p)),
        returnType: node.value.returnType?.typeAnnotation?.type,
        isAsync: node.value.async || false,
        isExported: false,
        complexity: calculateComplexity(node.value),
        calls: extractFunctionCalls(node.value),
      });
    }

    // Recursively visit children
    for (const key in node) {
      if (key === 'parent' || key === 'loc' || key === 'range') continue;
      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach(c => visit(c, node));
      } else if (child && typeof child === 'object') {
        visit(child, node);
      }
    }
  }

  visit(ast);
  return functions;
}

/**
 * Extract dependencies (imports/requires)
 */
function extractDependencies(ast: any): DependencyInfo[] {
  const dependencies: DependencyInfo[] = [];

  function visit(node: any) {
    if (!node || typeof node !== 'object') return;

    // ES6 imports
    if (node.type === 'ImportDeclaration') {
      dependencies.push({
        type: 'import',
        source: node.source.value,
        specifiers: node.specifiers.map((s: any) => s.local?.name || s.imported?.name || 'default'),
        line: node.loc?.start?.line || 0,
        isExternal: !node.source.value.startsWith('.'),
      });
    }

    // CommonJS require
    if (
      node.type === 'CallExpression' &&
      node.callee.name === 'require' &&
      node.arguments[0]?.type === 'StringLiteral'
    ) {
      dependencies.push({
        type: 'require',
        source: node.arguments[0].value,
        specifiers: [],
        line: node.loc?.start?.line || 0,
        isExternal: !node.arguments[0].value.startsWith('.'),
      });
    }

    // Dynamic imports
    if (node.type === 'ImportExpression') {
      dependencies.push({
        type: 'dynamic',
        source: node.source.value || '<dynamic>',
        specifiers: [],
        line: node.loc?.start?.line || 0,
        isExternal: true,
      });
    }

    // Recursively visit children
    for (const key in node) {
      if (key === 'parent' || key === 'loc' || key === 'range') continue;
      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach(visit);
      } else if (child && typeof child === 'object') {
        visit(child);
      }
    }
  }

  visit(ast);
  return dependencies;
}

/**
 * Extract function calls from a function node
 */
function extractFunctionCalls(node: any): string[] {
  const calls: string[] = [];

  function visit(n: any) {
    if (!n || typeof n !== 'object') return;

    if (n.type === 'CallExpression') {
      const calleeName = getCalleeName(n.callee);
      if (calleeName) calls.push(calleeName);
    }

    for (const key in n) {
      if (key === 'parent' || key === 'loc' || key === 'range') continue;
      const child = n[key];

      if (Array.isArray(child)) {
        child.forEach(visit);
      } else if (child && typeof child === 'object') {
        visit(child);
      }
    }
  }

  visit(node);
  return [...new Set(calls)];
}

/**
 * Calculate cyclomatic complexity
 */
function calculateComplexity(node: any): number {
  let complexity = 1;

  function visit(n: any) {
    if (!n || typeof n !== 'object') return;

    // Decision points increase complexity
    if (
      ['IfStatement', 'ConditionalExpression', 'SwitchCase', 'ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement', 'CatchClause', 'LogicalExpression'].includes(
        n.type
      )
    ) {
      if (n.type !== 'LogicalExpression' || n.operator === '&&' || n.operator === '||') {
        complexity++;
      }
    }

    for (const key in n) {
      if (key === 'parent' || key === 'loc' || key === 'range') continue;
      const child = n[key];

      if (Array.isArray(child)) {
        child.forEach(visit);
      } else if (child && typeof child === 'object') {
        visit(child);
      }
    }
  }

  visit(node);
  return complexity;
}

/**
 * Calculate code metrics
 */
function calculateMetrics(content: string, functions: FunctionInfo[]): CodeMetrics {
  const lines = content.split('\n');
  const codeLines = lines.filter(
    line => line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('/*')
  );

  const commentLines = lines.filter(
    line => line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')
  );

  const avgComplexity =
    functions.length > 0
      ? functions.reduce((sum, f) => sum + (f.complexity || 0), 0) / functions.length
      : 0;

  // Simple maintainability index estimation
  const maintainabilityIndex = Math.max(
    0,
    Math.min(100, 171 - 5.2 * Math.log(lines.length) - 0.23 * avgComplexity)
  );

  return {
    linesOfCode: codeLines.length,
    complexity: Math.round(avgComplexity * 10) / 10,
    maintainabilityIndex: Math.round(maintainabilityIndex),
    commentRatio: Math.round((commentLines.length / lines.length) * 100) / 100,
    functionCount: functions.length,
    classCount: countClasses(content),
  };
}

/**
 * Get basic metrics without AST parsing
 */
function getBasicMetrics(content: string): CodeMetrics {
  const lines = content.split('\n');

  return {
    linesOfCode: lines.filter(line => line.trim()).length,
    complexity: 0,
    maintainabilityIndex: 0,
    commentRatio: 0,
    functionCount: 0,
    classCount: 0,
  };
}

/**
 * Helper functions
 */
function getParamName(param: any): string {
  if (param.type === 'Identifier') return param.name;
  if (param.type === 'AssignmentPattern') return getParamName(param.left);
  if (param.type === 'RestElement') return '...' + getParamName(param.argument);
  return '<complex>';
}

function getCalleeName(callee: any): string {
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression') {
    const object = getCalleeName(callee.object);
    const property = callee.property.name || callee.property.value;
    return `${object}.${property}`;
  }
  return '';
}

function isExported(_node: any, parent: any): boolean {
  if (!parent) return false;
  return (
    parent.type === 'ExportNamedDeclaration' ||
    parent.type === 'ExportDefaultDeclaration'
  );
}

function countClasses(content: string): number {
  const classMatches = content.match(/\bclass\s+\w+/g);
  return classMatches ? classMatches.length : 0;
}

function simplifyAST(node: any): ASTNode | null {
  if (!node) return null;

  return {
    type: node.type,
    name: node.name || node.id?.name,
    start: node.start,
    end: node.end,
    loc: node.loc,
  };
}
