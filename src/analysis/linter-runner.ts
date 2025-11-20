/**
 * Linter integration for various programming languages
 * Supports built-in linters and custom linter configurations
 */

import type { LintResult } from '../types/index.js';
import { exec } from '@actions/exec';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Custom linter configuration
 */
export interface CustomLinterConfig {
  command: string;
  args: string[];
  filePattern?: string;
  outputFormat?: 'json' | 'text';
  parser?: (output: string) => LintResult[];
}

/**
 * Global custom linters registry
 */
const customLinters: Map<string, CustomLinterConfig> = new Map();

/**
 * Register a custom linter
 */
export function registerCustomLinter(name: string, config: CustomLinterConfig): void {
  customLinters.set(name, config);
}

/**
 * Run appropriate linter for a file
 */
export async function lintFile(
  filename: string,
  workdir: string = process.cwd(),
  customLinterName?: string
): Promise<LintResult[]> {
  // Try custom linter first if specified
  if (customLinterName && customLinters.has(customLinterName)) {
    return await runCustomLinter(customLinterName, filename, workdir);
  }

  const language = detectLanguageFromFile(filename);

  try {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return await lintJavaScript(filename, workdir);

      case 'python':
        return await lintPython(filename, workdir);

      case 'rust':
        return await lintRust(filename, workdir);

      case 'csharp':
        return await lintCSharp(filename, workdir);

      default:
        return [];
    }
  } catch (error) {
    console.warn(`Linting failed for ${filename}:`, error);
    return [];
  }
}

/**
 * Run custom linter
 */
async function runCustomLinter(
  name: string,
  filename: string,
  workdir: string
): Promise<LintResult[]> {
  const config = customLinters.get(name)!;

  // Check file pattern if specified
  if (config.filePattern && !filename.match(config.filePattern)) {
    return [];
  }

  try {
    let output = '';

    const args = config.args.map(arg => arg.replace('{file}', filename));

    await exec(config.command, args, {
      cwd: workdir,
      ignoreReturnCode: true,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
    });

    if (!output.trim()) {
      return [];
    }

    // Use custom parser if provided
    if (config.parser) {
      return config.parser(output);
    }

    // Try to parse as JSON by default
    if (config.outputFormat === 'json') {
      try {
        return JSON.parse(output);
      } catch {
        console.warn(`Failed to parse JSON output from custom linter: ${name}`);
        return [];
      }
    }

    return [];
  } catch (error) {
    console.warn(`Custom linter ${name} failed:`, error);
    return [];
  }
}

/**
 * Default ESLint 9+ flat config for projects without config
 */
const DEFAULT_ESLINT_CONFIG_V9 = `// ESLint flat config (v9+)
export default [
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-undef': 'error',
      'no-constant-condition': 'warn',
      'no-empty': 'warn',
    },
  },
];
`;

/**
 * Lint JavaScript/TypeScript files
 */
async function lintJavaScript(filename: string, workdir: string): Promise<LintResult[]> {
  const results: LintResult[] = [];

  // Check if ESLint is available in the project
  const eslintConfigFiles = [
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.yml',
    '.eslintrc.yaml',
    'eslint.config.js',
  ];

  let hasEslintConfig = eslintConfigFiles.some(config =>
    existsSync(join(workdir, config))
  );

  // Create default config if none exists
  if (!hasEslintConfig) {
    try {
      const defaultConfigPath = join(workdir, 'eslint.config.js');
      writeFileSync(defaultConfigPath, DEFAULT_ESLINT_CONFIG_V9);
      hasEslintConfig = true;
      console.log(`Created default ESLint flat config at ${defaultConfigPath}`);
    } catch (error) {
      console.warn('Failed to create default ESLint config:', error);
      return results;
    }
  }

  try {
    let output = '';
    let errorOutput = '';

    // Try to use local ESLint first, fallback to npx
    const localEslintPath = join(workdir, 'node_modules', '.bin', 'eslint');
    const useLocalEslint = existsSync(localEslintPath);

    const command = useLocalEslint ? localEslintPath : 'npx';
    const args = useLocalEslint
      ? ['--format', 'json', filename]
      : ['--yes', 'eslint', '--format', 'json', filename];

    console.log(`Running linter: ${useLocalEslint ? 'local ESLint' : 'npx eslint'}`);

    const exitCode = await exec(command, args, {
      cwd: workdir,
      ignoreReturnCode: true,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
        stderr: (data: Buffer) => {
          errorOutput += data.toString();
        },
      },
    });

    // Check for missing dependencies error
    if (errorOutput && errorOutput.includes('Cannot find package')) {
      console.warn(`ESLint configuration error: Missing dependencies in project`);
      console.warn(`Project may need to run: npm install`);
      return results; // Return empty results instead of failing
    }

    if (output) {
      try {
        const eslintResults = JSON.parse(output);

        for (const fileResult of eslintResults) {
          for (const message of fileResult.messages || []) {
            results.push({
              file: filename,
              line: message.line,
              column: message.column,
              severity: mapESLintSeverity(message.severity),
              message: message.message,
              ruleId: message.ruleId || 'unknown',
              source: message.source,
            });
          }
        }
      } catch (parseError) {
        console.warn(`Failed to parse ESLint output: ${parseError}`);
      }
    }
  } catch (error: any) {
    // Gracefully handle linter failures without blocking the review
    const errorMsg = error.message || String(error);
    if (errorMsg.includes('Cannot find package') || errorMsg.includes('ERR_MODULE_NOT_FOUND')) {
      console.warn(`ESLint configuration error: Missing dependencies. Skipping linter for ${filename}`);
    } else {
      console.warn(`ESLint execution failed for ${filename}: ${errorMsg}`);
    }
  }

  return results;
}

/**
 * Lint Python files
 */
async function lintPython(filename: string, workdir: string): Promise<LintResult[]> {
  const results: LintResult[] = [];

  try {
    let output = '';

    await exec('pylint', ['--output-format=json', filename], {
      cwd: workdir,
      ignoreReturnCode: true,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
    });

    if (output) {
      const pylintResults = JSON.parse(output);

      for (const message of pylintResults) {
        results.push({
          file: filename,
          line: message.line,
          column: message.column,
          severity: mapPylintSeverity(message.type),
          message: message.message,
          ruleId: message['message-id'] || message.symbol || 'unknown',
        });
      }
    }
  } catch (error) {
    // Pylint not available
  }

  return results;
}

/**
 * Lint Rust files using clippy
 */
async function lintRust(filename: string, workdir: string): Promise<LintResult[]> {
  const results: LintResult[] = [];

  // Check if this is a Rust project (Cargo.toml exists)
  if (!existsSync(join(workdir, 'Cargo.toml'))) {
    return results;
  }

  try {
    let output = '';

    // Run clippy with JSON output
    await exec(
      'cargo',
      ['clippy', '--message-format=json', '--', '-W', 'clippy::all'],
      {
        cwd: workdir,
        ignoreReturnCode: true,
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString();
          },
        },
      }
    );

    if (output) {
      // Clippy outputs newline-delimited JSON
      const lines = output.trim().split('\n');

      for (const line of lines) {
        try {
          const message = JSON.parse(line);

          // Only process compiler messages
          if (message.reason !== 'compiler-message') {
            continue;
          }

          const msg = message.message;

          // Filter to only messages for our file
          if (msg.spans && msg.spans.length > 0) {
            for (const span of msg.spans) {
              if (span.file_name && span.file_name.includes(filename)) {
                results.push({
                  file: filename,
                  line: span.line_start,
                  column: span.column_start,
                  severity: mapClippySeverity(msg.level),
                  message: msg.message,
                  ruleId: msg.code?.code || 'clippy',
                });
              }
            }
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  } catch (error) {
    console.warn(`Clippy execution failed for ${filename}`);
  }

  return results;
}

/**
 * Check if directory contains .NET project files
 */
function hasDotNetProject(workdir: string): boolean {
  try {
    const files = readdirSync(workdir);
    return files.some(file =>
      file.endsWith('.csproj') ||
      file.endsWith('.sln') ||
      file.endsWith('.slnx')  // New .NET solution format
    );
  } catch {
    return false;
  }
}

/**
 * Lint C# files using dotnet format analyzers
 */
async function lintCSharp(filename: string, workdir: string): Promise<LintResult[]> {
  const results: LintResult[] = [];

  // Check if this is a .NET project (.csproj, .sln, or .slnx exists)
  if (!hasDotNetProject(workdir)) {
    return results;
  }

  try {
    let output = '';

    // Run dotnet format analyzers
    await exec(
      'dotnet',
      ['format', '--verify-no-changes', '--report', 'json', workdir],
      {
        cwd: workdir,
        ignoreReturnCode: true,
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString();
          },
        },
      }
    );

    if (output) {
      try {
        const formatResults = JSON.parse(output);

        if (formatResults.DocumentIssues) {
          for (const issue of formatResults.DocumentIssues) {
            // Filter to only issues for our file
            if (issue.FilePath && issue.FilePath.includes(filename)) {
              results.push({
                file: filename,
                line: issue.Line || 0,
                column: issue.Column || 0,
                severity: mapDotNetSeverity(issue.Severity),
                message: issue.Message || 'Code style violation',
                ruleId: issue.DiagnosticId || 'format',
              });
            }
          }
        }
      } catch {
        // Failed to parse, try alternative approach with build
        return await lintCSharpWithBuild(filename, workdir);
      }
    }
  } catch (error) {
    console.warn(`Dotnet format execution failed for ${filename}`);
  }

  return results;
}

/**
 * Alternative: Lint C# using dotnet build with analyzers
 */
async function lintCSharpWithBuild(filename: string, workdir: string): Promise<LintResult[]> {
  const results: LintResult[] = [];

  try {
    let output = '';

    await exec(
      'dotnet',
      ['build', '--no-restore', '/p:TreatWarningsAsErrors=false'],
      {
        cwd: workdir,
        ignoreReturnCode: true,
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString();
          },
          stderr: (data: Buffer) => {
            output += data.toString();
          },
        },
      }
    );

    // Parse MSBuild diagnostic format
    const diagnosticRegex = /(.+?)\((\d+),(\d+)\):\s+(warning|error)\s+(\S+):\s+(.+)/g;
    let match;

    while ((match = diagnosticRegex.exec(output)) !== null) {
      const [, file, line, column, severity, ruleId, message] = match;

      if (file.includes(filename)) {
        results.push({
          file: filename,
          line: parseInt(line, 10),
          column: parseInt(column, 10),
          severity: severity === 'error' ? 'error' : 'warning',
          message,
          ruleId,
        });
      }
    }
  } catch (error) {
    // Build failed
  }

  return results;
}

/**
 * Detect language from file extension
 */
function detectLanguageFromFile(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    py: 'python',
    rs: 'rust',
    cs: 'csharp',
  };

  return langMap[ext || ''] || 'unknown';
}

/**
 * Severity mappers
 */

function mapESLintSeverity(severity: number): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 2:
      return 'error';
    case 1:
      return 'warning';
    default:
      return 'info';
  }
}

function mapPylintSeverity(type: string): 'error' | 'warning' | 'info' {
  switch (type.toLowerCase()) {
    case 'error':
    case 'fatal':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
}

function mapClippySeverity(level: string): 'error' | 'warning' | 'info' {
  switch (level.toLowerCase()) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
}

function mapDotNetSeverity(severity?: string): 'error' | 'warning' | 'info' {
  if (!severity) return 'warning';

  switch (severity.toLowerCase()) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
}

/**
 * Aggregate lint results
 */
export function aggregateLintResults(results: LintResult[]): {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  byRule: Record<string, number>;
} {
  const byRule: Record<string, number> = {};

  for (const result of results) {
    byRule[result.ruleId] = (byRule[result.ruleId] || 0) + 1;
  }

  return {
    total: results.length,
    errors: results.filter(r => r.severity === 'error').length,
    warnings: results.filter(r => r.severity === 'warning').length,
    info: results.filter(r => r.severity === 'info').length,
    byRule,
  };
}
