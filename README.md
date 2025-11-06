# 🤖 AI Code Review - Advanced Analysis

<div align="center">

![AI Code Review Banner](https://img.shields.io/badge/AI_Code_Review-Advanced_Analysis-purple?style=for-the-badge&logo=github-actions)

**AI-Powered Code Review | Deep Static Analysis | Beautiful Statistics**

[![GitHub Release](https://img.shields.io/github/v/release/zxcnoname666/Release-Helper?style=flat-square&logo=github)](https://github.com/zxcnoname666/Release-Helper/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square)](https://nodejs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5-412991?style=flat-square&logo=openai)](https://openai.com/)

[Quick Start](#-quick-start) • [Features](#-features) • [Configuration](#-configuration) • [Examples](#-example-output) • [Development](#-development)

</div>

---

## 📋 Overview

**AI Code Review** is a next-generation GitHub Action that transforms pull request reviews through **advanced AI analysis** and **deep code understanding**. Powered by OpenAI GPT-5, it provides senior-level code reviews with AST parsing, linter integration, dependency tracking, and stunning visual statistics.

### 🎯 Why AI Code Review?

- 🧠 **Senior-Level Reviews** - AI thinks like an experienced developer
- 🔍 **Deep Analysis** - AST parsing, complexity metrics, call graphs
- 🎨 **Beautiful Stats** - ASCII charts, graphs, and visual reports
- 🛠️ **Tool-Powered** - AI actively investigates code with analysis tools
- 🌍 **Multi-Language** - Reviews in any language (English, Russian, etc.)
- 📦 **Smart Chunking** - Handles massive PRs efficiently

---

## ✨ Features

### 🧠 **AI-Powered Intelligence**

- **GPT-5 Integration**: Context-aware, comprehensive code reviews
- **Tool Calling System**: AI uses 10+ analysis tools to investigate code
- **Multi-Language Support**: Review comments in any language
- **Senior-Level Feedback**: Explains the "why" behind suggestions

### 🔍 **Advanced Code Analysis**

- **AST Parsing**: Extract functions, classes, dependencies from code
- **Linter Integration**: Auto-runs ESLint, Pylint, Rust Clippy, C# Analyzers, and custom linters
- **Custom Linter Support**: Integrate any linter with simple configuration
- **Dependency Tracking**: Maps function calls and dependencies
- **Complexity Metrics**: Cyclomatic complexity, maintainability index
- **Call Graph Analysis**: Understand function relationships and impact
- **Multi-Language**: TypeScript, JavaScript, Python, Rust, C#, and more

### 📊 **Beautiful Statistics**

```
╔════════════════════════════════════════╗
║  ✅ LOOKS GOOD                         ║
║  Issues: 2 | Critical: 0 | Warnings: 2 ║
╚════════════════════════════════════════╝

## 🎯 Issues Found
Critical  ░░░░░░░░░░░░░░░░░░░░ 0
Warnings  ████████░░░░░░░░░░░░ 2
Info      ░░░░░░░░░░░░░░░░░░░░ 0

## 🎚️ Average Complexity
┌──────────────────────────────┐
│  ✅ LOW         4.5          │
│  ░░░░░░░░█░░░░░░░░░░░░░░░   │
└──────────────────────────────┘
```

### 🎯 **Smart Features**

- **Intelligent Chunking**: Splits large PRs optimally
- **Silent Mode**: Reduce notification spam
- **Auto Labeling**: Manages PR labels based on review
- **Inline Comments**: Issues posted on specific lines
- **Severity Levels**: Filter by critical, warning, info

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

      - name: AI Code Review
        uses: zxcnoname666/Release-Helper@v3
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Advanced Configuration

```yaml
- name: AI Code Review
  uses: zxcnoname666/Release-Helper@v3
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    OPENAI_API_MODEL: 'gpt-5-high'
    REVIEW_LANGUAGE: 'ru'      # Review in Russian
    SILENT_MODE: 'true'        # Reduce notifications
    ENABLE_AST: 'true'         # Deep code analysis
    ENABLE_LINTERS: 'true'     # Run linters
    MAX_CHUNK_SIZE: '8000'     # Larger chunks
```

---

## ⚙️ Configuration

### Required Inputs

| Input | Description |
|-------|-------------|
| `GITHUB_TOKEN` | GitHub token (auto-provided) |

### Optional Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | - |
| `OPENAI_API_MODEL` | Model (`gpt-5`, `gpt-5-high`, `o3`) | `gpt-5` |
| `OPENAI_API_BASE_URL` | Custom endpoint (Azure, etc.) | `https://api.openai.com/v1` |
| `REVIEW_LANGUAGE` | Review language (`en`, `ru`, `es`, `fr`, etc.) | `en` |
| `SILENT_MODE` | Minimize notifications | `false` |
| `MAX_CHUNK_SIZE` | Max tokens per chunk | `6000` |
| `ENABLE_LINTERS` | Run linters | `true` |
| `ENABLE_AST` | AST analysis | `true` |
| `ENABLE_DEPENDENCY_ANALYSIS` | Dependency tracking | `true` |
| `SEVERITY_THRESHOLD` | Min severity (`info`, `warning`, `error`) | `warning` |

---

## 📖 How It Works

### 1. Fetch PR
- Retrieves PR details and changed files
- Analyzes file types and languages

### 2. Smart Chunking
- Splits large PRs intelligently
- Groups related files by module
- Optimizes token usage

### 3. Deep Analysis
- **AST Parsing**: Extracts code structure
- **Linting**: Runs appropriate linters
- **Complexity**: Calculates metrics
- **Call Graph**: Maps dependencies

### 4. AI Review with Tools
The AI has access to 10+ analysis tools:

- `read_file` - Read full file content
- `get_file_diff` - View specific changes
- `analyze_file_ast` - Deep AST analysis
- `find_function_callers` - Find usage
- `find_function_dependencies` - Check dependencies
- `run_linter` - Execute linters
- `search_code` - Search patterns
- `get_commit_info` - Commit details
- `analyze_function_complexity` - Metrics

The AI **actively uses tools** before reviewing for accurate feedback.

### 5. Generate Review
- Categorizes issues by severity
- Provides code examples and fixes
- Recognizes good code
- Creates beautiful statistics

### 6. Post to GitHub
- Posts comprehensive review
- Adds inline comments
- Manages labels automatically
- Supports silent mode

---

## 📊 Example Output

### Statistics Report

```
╔══════════════════════════════════════════════════════════════════════╗
║        🤖  AI CODE REVIEW - ANALYSIS COMPLETE  🤖                    ║
╚══════════════════════════════════════════════════════════════════════╝

## 📊 Review Overview

┌─────────────────────────────────────────────────────────────┐
│  Files Reviewed      │ 15                                    │
│  Total Lines Changed │ 450                                   │
│  Lines Added         │ +320                                  │
│  Lines Deleted       │ -130                                  │
│  Review Time         │ 45s                                   │
│  Tokens Used         │ 8,450                                 │
└─────────────────────────────────────────────────────────────┘

## 🎯 Issues Found

Critical  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0
Warnings  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2
Info      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0

## 📁 Issues by Category

🐛 bug              ████████░░░░░░░░░░ 1 (33%)
⚡ performance      ████████░░░░░░░░░░ 1 (33%)
⭐ best-practice   ████░░░░░░░░░░░░░░ 1 (33%)

## 🎚️ Average Complexity

┌─────────────────────────────────────────┐
│  Complexity Gauge                       │
├─────────────────────────────────────────┤
│      ✅ LOW            4.5              │
│  ░░░░░░░░░█░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  0                                  30+ │
└─────────────────────────────────────────┘
```

---

## 🌟 Advanced Use Cases

### Custom Linter Integration

Integrate your own linters programmatically:

```typescript
import { registerCustomLinter } from '@zxcnoname666/ai-code-review';

// Example: Register a custom Go linter
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
      column: issue.Pos.Column,
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
- **Custom**: Any linter you configure!

### Custom OpenAI Endpoint (Azure)

```yaml
- uses: zxcnoname666/Release-Helper@v3
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_KEY }}
    OPENAI_API_BASE_URL: 'https://your-resource.openai.azure.com/v1'
    OPENAI_API_MODEL: 'gpt-5'
```

### Multi-Language Teams

```yaml
- uses: zxcnoname666/Release-Helper@v3
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    REVIEW_LANGUAGE: 'ru'  # Russian reviews
```

### High-Performance Setup

```yaml
- uses: zxcnoname666/Release-Helper@v3
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    OPENAI_API_MODEL: 'o3'     # Ultra-advanced reasoning model
    MAX_CHUNK_SIZE: '12000'
    SILENT_MODE: 'true'
```

---

## 🛠️ Development

### Prerequisites
- Node.js 20+
- pnpm 9+

### Setup
```bash
git clone https://github.com/zxcnoname666/Release-Helper.git
cd Release-Helper
pnpm install
pnpm build
```

### Project Structure
```
src/
├── index.ts              # Entry point
├── types/                # TypeScript types
├── ai/                   # AI client & prompts
│   ├── client.ts
│   ├── prompts.ts
│   └── tools-registry.ts
├── analysis/             # Code analysis
│   ├── ast-parser.ts
│   ├── linter-runner.ts
│   └── call-graph.ts
├── chunking/             # Smart chunking
├── github/               # GitHub API
├── stats/                # Visualization
└── utils/                # Utilities
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and open PR

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- [OpenAI GPT-5](https://openai.com) - Advanced AI model
- [GitHub Actions](https://github.com/features/actions)
- [@babel/parser](https://babeljs.io/docs/en/babel-parser)
- [@typescript-eslint/parser](https://typescript-eslint.io)
- [Rust Clippy](https://github.com/rust-lang/rust-clippy)
- [.NET Roslyn Analyzers](https://github.com/dotnet/roslyn-analyzers)

---

## 📞 Support

- 🐛 [Report Bug](https://github.com/zxcnoname666/Release-Helper/issues)
- 💡 [Request Feature](https://github.com/zxcnoname666/Release-Helper/issues)
- 📖 [Documentation](https://github.com/zxcnoname666/Release-Helper)

---

<div align="center">

**Made with ❤️ by [zxcnoname666](https://github.com/zxcnoname666)**

⭐ Star this repo if you find it useful!

</div>
