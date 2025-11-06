# 🤖 AI Code Review - Advanced Analysis

<div align="center">

![AI Code Review Banner](https://img.shields.io/badge/AI_Code_Review-Advanced_Analysis-purple?style=for-the-badge&logo=github-actions)

**AI-Powered Code Review | Deep Static Analysis | Beautiful Statistics**

[![GitHub Release](https://img.shields.io/github/v/release/zxcnoname666/AI-Code-Reviewer?style=flat-square&logo=github)](https://github.com/zxcnoname666/AI-Code-Reviewer/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square)](https://nodejs.org)

[Quick Start](#-quick-start) • [Features](#-features) • [Configuration](#-configuration) • [Examples](#-example-output) • [Development](#-development)

</div>

---

## 📋 Overview

**AI Code Review** is a next-generation GitHub Action that transforms pull request reviews through **advanced AI analysis** and **deep code understanding**. Compatible with the latest AI models including **GPT-5**, **Claude Opus 4**, **Gemini 2.5 Pro**, **O3**, and custom endpoints, it provides Principal/Staff-level code reviews with AST parsing, linter integration, dependency tracking, and stunning visual statistics.

### 🎯 Why AI Code Review?

- 🧠 **Senior-Level Reviews** - AI thinks like a Principal engineer with 15+ years experience
- 🔍 **Deep Analysis** - AST parsing, complexity metrics, call graphs, dependency tracking
- 🎨 **Beautiful Stats** - ASCII charts, sparklines, quality scores, and visual reports
- 🛠️ **Tool-Powered** - AI actively investigates code with 14 specialized analysis tools
- 🌍 **Multi-Language** - Reviews in any language (English, Russian, Spanish, etc.)
- 📦 **Smart Chunking** - Handles massive PRs efficiently without hitting token limits
- 🤖 **Multi-Model Support** - GPT-5, Claude 4, Gemini 2.5 Pro, O3, or your own endpoint

---

## ✨ Features

### 🧠 **AI-Powered Intelligence**

- **Latest AI Models**: GPT-5, Claude Opus 4, Gemini 2.5 Pro, O3/O4 reasoning models
- **Custom Endpoints**: Azure OpenAI, AWS Bedrock, local models, or any OpenAI-compatible API
- **Tool Calling System**: AI uses 14 specialized analysis tools to investigate code
- **Multi-Language Support**: Review comments in any language
- **Senior-Level Feedback**: Principal/Staff engineer perspective with deep "why" explanations
- **Context-Aware**: Understands commit history, PR context, and code evolution

### 🔍 **Advanced Code Analysis**

- **AST Parsing**: Extract functions, classes, dependencies from any language
- **Linter Integration**: Auto-runs ESLint, Pylint, Rust Clippy, C# Analyzers, and custom linters
- **Custom Linter Support**: Integrate any linter with simple configuration
- **Dependency Tracking**: Maps function calls and dependencies across the codebase
- **Complexity Metrics**: Cyclomatic complexity, maintainability index
- **Call Graph Analysis**: Understand function relationships and impact
- **Multi-Language**: TypeScript, JavaScript, Python, Rust, C#, Go, and more

### 📊 **Beautiful Statistics**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃    🤖  𝗔𝗜 𝗖𝗢𝗗𝗘 𝗥𝗘𝗩𝗜𝗘𝗪 - 𝗔𝗡𝗔𝗟𝗬𝗦𝗜𝗦 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘  🤖          ┃
┃         ⚡ Powered by Advanced AI & Deep Code Analysis ⚡          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

## 📊 Review Overview
┌─────────────────────────────────────────────────────────────┐
│  Files Reviewed      │ 15                                    │
│  Total Lines Changed │ 450                                   │
│  Lines Added         │ +320                                  │
│  Lines Deleted       │ -130                                  │
│  Review Time         │ 45s                                   │
│  Tokens Used         │ 8,450                                 │
│  Quality Score       │ ████████████████░░░░ 85/100          │
└─────────────────────────────────────────────────────────────┘

## 🎯 Issues Found
Critical  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0
Warnings  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2
Info      ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 1

## 🎚️ Average Complexity
┌─────────────────────────────────────────┐
│  ✅ LOW            4.5                  │
│  ░░░░░░░░░█░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  0                                  30+ │
└─────────────────────────────────────────┘
```

### 🎯 **Smart Features**

- **Intelligent Chunking**: Splits large PRs optimally by module boundaries
- **Silent Mode**: Reduce notification spam for your team
- **Auto Labeling**: Manages PR labels based on review results
- **Inline Comments**: Issues posted on specific lines with code context
- **Severity Levels**: Filter by critical, warning, info
- **Historical Context**: Analyzes file and commit history for better context

---

## 🚀 Quick Start

### Basic Setup

Create `.github/workflows/ai-review.yml`:

```yaml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Important for commit history

      - name: AI Code Review
        uses: zxcnoname666/AI-Code-Reviewer@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Advanced Configuration

```yaml
- name: AI Code Review
  uses: zxcnoname666/AI-Code-Reviewer@v1
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    OPENAI_API_MODEL: 'gpt-4o'       # Latest model
    REVIEW_LANGUAGE: 'ru'            # Review in Russian
    SILENT_MODE: 'true'              # Reduce notifications
    ENABLE_AST: 'true'               # Deep code analysis
    ENABLE_LINTERS: 'true'           # Run linters
    MAX_CHUNK_SIZE: '8000'           # Larger chunks for o3
```

---

## ⚙️ Configuration

### Required Inputs

| Input | Description |
|-------|-------------|
| `GITHUB_TOKEN` | GitHub token (auto-provided by Actions) |

### Optional Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (or compatible provider) | - |
| `OPENAI_API_MODEL` | Model name (`gpt-4o`, `gpt-4-turbo`, `o3-mini`, etc.) | `gpt-4o` |
| `OPENAI_API_BASE_URL` | Custom endpoint (Azure, AWS Bedrock, local) | `https://api.openai.com/v1` |
| `REVIEW_LANGUAGE` | Review language (`en`, `ru`, `es`, `fr`, `de`, etc.) | `en` |
| `SILENT_MODE` | Minimize email notifications | `false` |
| `MAX_CHUNK_SIZE` | Max tokens per chunk (adjust for your model) | `6000` |
| `ENABLE_LINTERS` | Run language-specific linters | `true` |
| `ENABLE_AST` | AST analysis for deep code understanding | `true` |
| `ENABLE_DEPENDENCY_ANALYSIS` | Dependency tracking and call graphs | `true` |
| `SEVERITY_THRESHOLD` | Min severity to report (`info`, `warning`, `error`) | `warning` |

---

## 📖 How It Works

### 1. Fetch PR Context
- Retrieves PR details, branch info, and linked issues
- Analyzes file types and programming languages
- Builds commit history timeline

### 2. Smart Chunking
- Splits large PRs intelligently by module boundaries
- Groups related files together
- Optimizes token usage for your chosen model

### 3. Deep Analysis (14 Tools)
The AI actively investigates code using specialized tools:

**File Analysis:**
- `read_file` - Read complete file content with syntax highlighting
- `get_file_diff` - View specific changes with context lines
- `analyze_file_ast` - Deep AST (Abstract Syntax Tree) parsing
- `read_large_diff_chunk` - Handle massive files in manageable chunks

**Code Understanding:**
- `find_function_callers` - Find all places where a function is called
- `find_function_dependencies` - Find what functions/modules a function depends on
- `analyze_function_complexity` - Cyclomatic complexity and maintainability metrics
- `search_code` - Search patterns across entire codebase

**Quality Tools:**
- `run_linter` - Execute language-specific linters (ESLint, Pylint, Clippy, etc.)

**Git & History:**
- `get_commits_list` - List all commits in the PR with authors and messages
- `get_commit_diff` - View full diff for a specific commit
- `get_commit_info` - Detailed commit metadata and statistics
- `get_file_history` - See how a file evolved over time
- `get_pr_context` - Comprehensive PR overview with labels and reviewers

### 4. AI Review
- Uses **mandatory workflow** requiring 4-6 tools minimum per review
- Analyzes from multiple dimensions: Security, Performance, Architecture, Maintainability
- Provides senior-level feedback with detailed explanations
- Recognizes good code and best practices

### 5. Generate Review
- Categorizes issues by severity (critical, warning, info)
- Provides code examples and suggested fixes
- Creates beautiful statistics with quality scores
- Generates actionable feedback

### 6. Post to GitHub
- Posts comprehensive review comment
- Adds inline comments on specific lines
- Manages labels automatically (needs-review, approved, etc.)
- Supports silent mode to reduce notification spam

---

## 📊 Example Output

### Full Review with Statistics

```markdown
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃    🤖  𝗔𝗜 𝗖𝗢𝗗𝗘 𝗥𝗘𝗩𝗜𝗘𝗪 - 𝗔𝗡𝗔𝗟𝗬𝗦𝗜𝗦 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘  🤖          ┃
┃         ⚡ Powered by Advanced AI & Deep Code Analysis ⚡          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

## 📊 Review Overview
┌─────────────────────────────────────────────────────────────┐
│  Files Reviewed      │ 15                                    │
│  Total Lines Changed │ 450 (+320/-130)                       │
│  Commits Analyzed    │ 8                                     │
│  Tools Used          │ 12                                    │
│  Review Time         │ 45s                                   │
│  Quality Score       │ ████████████████░░░░ 85/100          │
└─────────────────────────────────────────────────────────────┘

## 🎯 Issues Summary
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚠️  NEEDS CHANGES                        ┃
┃  Issues: 3 | Critical: 0 | Warnings: 2   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Critical  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0
Warnings  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2
Info      ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 1

## 🏆 Highlights
✅ Well-structured code with clear separation of concerns
✅ Comprehensive error handling in API endpoints
✅ Good use of TypeScript types for type safety

## ⚠️ Issues Found

### src/api/handler.ts:45
**Severity:** Warning | **Category:** Performance

The database query inside the loop creates N+1 queries. Consider using
a single query with JOIN or batch loading.

**Current:**
\`\`\`typescript
for (const user of users) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
}
\`\`\`

**Suggested:**
\`\`\`typescript
const posts = await db.query(`
  SELECT p.*, u.id as user_id
  FROM posts p
  JOIN users u ON p.user_id = u.id
  WHERE u.id IN (?)
`, [users.map(u => u.id)]);
\`\`\`

---

## 📁 Files Analyzed
- ✅ src/api/handler.ts (2 issues)
- ✅ src/utils/helpers.ts (1 issue)
- ✅ src/types/index.ts (clean)
- ✅ tests/api.test.ts (clean)

## 🎚️ Complexity Analysis
┌─────────────────────────────────────────┐
│  Average Complexity: 4.5 (✅ LOW)       │
│  ░░░░░░░░░█░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  0    5    10   15   20   25        30+ │
│                                         │
│  Highest: getUserWithPosts() = 8        │
│  Location: src/api/handler.ts:23        │
└─────────────────────────────────────────┘

## 📈 Trend: Issue Severity Over Time
▁▁▂▃▂▁▁ (Improving!)
```

---

## 🌟 Advanced Use Cases

### Use with Claude Opus 4 (Anthropic)

```yaml
- uses: zxcnoname666/AI-Code-Reviewer@v1
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    OPENAI_API_BASE_URL: 'https://api.anthropic.com/v1'
    OPENAI_API_MODEL: 'claude-opus-4'
```

### Use with Gemini 2.5 Pro (Google)

```yaml
- uses: zxcnoname666/AI-Code-Reviewer@v1
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
    OPENAI_API_BASE_URL: 'https://generativelanguage.googleapis.com/v1'
    OPENAI_API_MODEL: 'gemini-2.5-pro'
    MAX_CHUNK_SIZE: '12000'  # Gemini supports larger context
```

### Use with Azure OpenAI

```yaml
- uses: zxcnoname666/AI-Code-Reviewer@v1
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_KEY }}
    OPENAI_API_BASE_URL: 'https://your-resource.openai.azure.com/v1'
    OPENAI_API_MODEL: 'gpt-4o'
```

### Use with O3 Reasoning Model

```yaml
- uses: zxcnoname666/AI-Code-Reviewer@v1
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    OPENAI_API_MODEL: 'o3-mini'  # Advanced reasoning
    MAX_CHUNK_SIZE: '10000'
```

### Custom Linter Integration

Integrate your own linters programmatically:

```typescript
import { registerCustomLinter } from '@zxcnoname666/ai-code-review';

// Example: Register golangci-lint
registerCustomLinter('golangci-lint', {
  command: 'golangci-lint',
  args: ['run', '--out-format=json', '{file}'],
  filePattern: '\\.go$',
  outputFormat: 'json',
  parser: (output) => {
    const result = JSON.parse(output);
    return result.Issues.map(issue => ({
      file: issue.Pos.Filename,
      line: issue.Pos.Line,
      severity: issue.Severity === 'error' ? 'error' : 'warning',
      message: issue.Text,
      ruleId: issue.FromLinter,
    }));
  },
});
```

**Supported Built-in Linters:**
- **JavaScript/TypeScript**: ESLint
- **Python**: Pylint
- **Rust**: Clippy
- **C#**: dotnet format analyzers
- **Go**: golangci-lint (via custom integration)
- **Any**: Configure your own!

### Multi-Language Teams

```yaml
- uses: zxcnoname666/AI-Code-Reviewer@v1
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    REVIEW_LANGUAGE: 'ru'  # Russian reviews
```

### High-Performance Setup for Large Codebases

```yaml
- uses: zxcnoname666/AI-Code-Reviewer@v1
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    OPENAI_API_MODEL: 'o3'           # Best reasoning
    MAX_CHUNK_SIZE: '15000'          # Large context
    SILENT_MODE: 'true'
    ENABLE_AST: 'true'
    ENABLE_DEPENDENCY_ANALYSIS: 'true'
```

---

## 🛠️ Development

### Prerequisites
- Node.js 20+
- pnpm 9+

### Setup

```bash
git clone https://github.com/zxcnoname666/AI-Code-Reviewer.git
cd AI-Code-Reviewer
pnpm install
pnpm build
```

### Project Structure

```
src/
├── index.ts              # Entry point
├── types/                # TypeScript types
├── ai/                   # AI client & prompts
│   ├── client.ts         # OpenAI/compatible client
│   ├── prompts.ts        # System & user prompts
│   └── tools-registry.ts # 14 AI tools registry
├── analysis/             # Code analysis engines
│   ├── ast-parser.ts     # AST parsing (Babel, TS, Acorn)
│   ├── linter-runner.ts  # Multi-language linter runner
│   └── call-graph.ts     # Dependency & call graph analysis
├── chunking/             # Smart chunking strategies
│   └── strategy.ts       # Token-aware chunking
├── github/               # GitHub API integration
│   ├── client.ts         # PR & comments API
│   └── operations.ts     # Git operations
├── stats/                # Visualization & statistics
│   └── visualizer.ts     # ASCII art, charts, reports
└── utils/                # Utilities
    ├── token-counter.ts  # Token estimation (tiktoken)
    └── logger.ts         # Structured logging
```

### Build

```bash
pnpm run build        # Build with esbuild
pnpm run type-check   # TypeScript type checking
```

### Testing Locally

1. Create a test repository
2. Set up the workflow with your changes
3. Create a pull request
4. Verify the AI review output

---

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) - GPT-5, O3 models
- [Anthropic](https://anthropic.com) - Claude Opus 4
- [Google](https://deepmind.google/technologies/gemini/) - Gemini 2.5 Pro
- [GitHub Actions](https://github.com/features/actions)
- [@babel/parser](https://babeljs.io/docs/en/babel-parser) - JavaScript/TypeScript AST
- [@typescript-eslint/parser](https://typescript-eslint.io) - TypeScript analysis
- [Rust Clippy](https://github.com/rust-lang/rust-clippy) - Rust linting
- [.NET Roslyn Analyzers](https://github.com/dotnet/roslyn-analyzers) - C# analysis

---

## 📞 Support

- 🐛 [Report Bug](https://github.com/zxcnoname666/AI-Code-Reviewer/issues)
- 💡 [Request Feature](https://github.com/zxcnoname666/AI-Code-Reviewer/issues)
- 💬 [Discussions](https://github.com/zxcnoname666/AI-Code-Reviewer/discussions)
- 📖 [Documentation](https://github.com/zxcnoname666/AI-Code-Reviewer)

---

<div align="center">

**Made with ❤️ by [zxcnoname666](https://github.com/zxcnoname666)**

⭐ Star this repo if you find it useful!

</div>
