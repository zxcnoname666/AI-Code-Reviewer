# Contributing to AI Code Review

First off, thank you for considering contributing to AI Code Review! 🎉 It's people like you that make this project better for everyone.

## 🌟 Ways to Contribute

There are many ways to contribute to this project:

- 🐛 **Report Bugs** - Found a bug? Let us know!
- 💡 **Suggest Features** - Have an idea? We'd love to hear it!
- 📝 **Improve Documentation** - Help others understand the project better
- 🔧 **Submit Pull Requests** - Fix bugs or add new features
- ⭐ **Star the Repository** - Show your support!
- 💬 **Answer Questions** - Help others in discussions and issues

## 🐛 Reporting Bugs

Before creating a bug report, please check if the issue has already been reported. If it hasn't, create an issue and include:

- **Clear title** - Describe the bug in a few words
- **Description** - Detailed explanation of the issue
- **Steps to reproduce** - How can we replicate the bug?
- **Expected behavior** - What should happen?
- **Actual behavior** - What actually happens?
- **Environment details**:
  - Node.js version
  - Operating system
  - AI Code Review version
  - AI model being used
  - Relevant configuration

**Example:**
```markdown
### Bug: AI code review fails with custom model endpoint

**Description:**
When using Azure OpenAI endpoint, the action fails with error "Invalid API endpoint".

**Steps to reproduce:**
1. Configure workflow with Azure OpenAI endpoint
2. Set `OPENAI_API_MODEL: gpt-5`
3. Create a pull request
4. Action fails with authentication error

**Expected:** Should use Azure OpenAI endpoint successfully
**Actual:** Fails with 401 authentication error

**Environment:**
- Node.js: 20.10.0
- OS: Ubuntu 22.04
- AI Code Review: v1.0.0
- Model: gpt-5 (Azure)
```

## 💡 Suggesting Features

Feature requests are welcome! Before suggesting, please:

1. Check if the feature has already been suggested
2. Consider if it fits the project scope
3. Provide a clear use case

Include in your feature request:

- **Problem statement** - What problem does this solve?
- **Proposed solution** - How would you implement it?
- **Alternatives considered** - Other ways to solve this?
- **Use cases** - When would this be useful?

**Example:**
```markdown
### Feature: Support for DeepSeek models

**Problem:** DeepSeek R1 is a powerful open-source reasoning model that many teams want to use

**Solution:** Add support for DeepSeek API with parameters:
- DEEPSEEK_API_KEY
- DEEPSEEK_MODEL (deepseek-chat, deepseek-coder)

**Alternatives:**
- Use OpenAI-compatible proxy
- Only support major providers

**Use cases:**
- Teams using DeepSeek for cost savings
- Users preferring open-source models
- Chinese market where DeepSeek is popular
```

## 🔧 Pull Request Process

### Setting Up Development Environment

1. **Fork and clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/AI-Code-Review.git
cd AI-Code-Review
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Build the project:**
```bash
pnpm run build
```

4. **Run type checking:**
```bash
pnpm run type-check
```

### Making Changes

1. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

2. **Make your changes:**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed
   - Use `node:` prefix for built-in modules (e.g., `node:fs`, `node:path`)

3. **Test your changes:**
```bash
pnpm run build
pnpm run type-check
# Test manually with a test repository
```

4. **Commit using conventional commits:**
```bash
git commit -m "feat: add support for DeepSeek models

- Add DEEPSEEK_API_KEY configuration
- Implement DeepSeek API integration
- Update documentation with examples"
```

### Submitting Pull Request

1. **Push to your fork:**
```bash
git push origin feature/your-feature-name
```

2. **Create Pull Request** with:
   - Clear title following conventional commits
   - Description of changes
   - Reference to related issues (Fixes #123)
   - Screenshots/GIFs if UI/output changes

**PR Template:**
```markdown
## Description
Brief description of your changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How did you test these changes?
- [ ] Built successfully with `pnpm run build`
- [ ] Type checking passes with `pnpm run type-check`
- [ ] Tested with test repository
- [ ] Verified output formatting

## Checklist
- [ ] Code builds successfully
- [ ] Type checking passes
- [ ] Documentation updated (README, CONTRIBUTING, etc.)
- [ ] Follows conventional commits
- [ ] No breaking changes (or documented)
- [ ] Used `node:` prefix for Node.js built-in modules

## Related Issues
Fixes #123
```

3. **Respond to reviews:**
   - Be open to feedback
   - Make requested changes
   - Push updates to the same branch

## 📏 Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Add types for all parameters and return values
- Use interfaces for object shapes
- Avoid `any` type (use `unknown` if necessary)
- Use `node:` prefix for Node.js built-in modules

**Good:**
```typescript
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface CommitData {
  sha: string;
  message: string;
  author: string;
  date: Date;
}

async function parseCommit(data: CommitData): Promise<ParsedCommit> {
  // implementation
}
```

**Bad:**
```typescript
import fs from 'fs';  // Missing node: prefix
import path from 'path';  // Missing node: prefix

function parseCommit(data: any) {  // Using any
  // implementation
}
```

### Naming Conventions

- **Files:** kebab-case (`git-utils.ts`, `ast-parser.ts`)
- **Functions:** camelCase (`parseCommit`, `analyzeComplexity`)
- **Classes:** PascalCase (`CommitParser`, `ASTAnalyzer`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_MODEL`, `MAX_CHUNK_SIZE`)
- **Types/Interfaces:** PascalCase (`CommitData`, `ReviewConfig`)

### Code Organization

```typescript
// 1. Imports - Node built-ins first (with node: prefix)
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// 2. External imports
import { exec } from '@actions/exec';
import type { Octokit } from '@octokit/rest';

// 3. Internal imports
import type { Config, FileChange } from './types/index.js';

// 4. Types/Interfaces
interface Options {
  model: string;
  temperature: number;
}

// 5. Constants
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 3;

// 6. Functions
export async function processReview(options: Options): Promise<void> {
  // implementation
}
```

### Comments

- Write self-documenting code when possible
- Add comments for complex logic or non-obvious decisions
- Use JSDoc for public functions and exported APIs

```typescript
/**
 * Generates a comprehensive code review using AI analysis
 *
 * @param files - Array of changed files in the PR
 * @param config - AI configuration including model and temperature
 * @param tools - Available analysis tools for the AI to use
 * @returns Generated review with issues and statistics
 *
 * @example
 * ```typescript
 * const review = await generateReview(
 *   changedFiles,
 *   { model: 'gpt-5', temperature: 0.7 },
 *   availableTools
 * );
 * ```
 */
export async function generateReview(
  files: FileChange[],
  config: AIConfig,
  tools: AITool[]
): Promise<ReviewResult> {
  // implementation
}
```

## 🧪 Testing Guidelines

Currently, testing is primarily manual. To test your changes:

1. **Create a test repository** with various file types and languages
2. **Set up AI Code Review** with your changes (use local build)
3. **Create test PRs** with different scenarios:
   - Small PRs (1-2 files)
   - Large PRs (10+ files, 1000+ lines)
   - Different languages (TypeScript, Python, Rust, etc.)
   - PRs with linter errors
   - PRs with complex functions
4. **Verify the review output**:
   - Check statistics formatting
   - Verify tool usage by AI
   - Confirm issue detection accuracy
   - Test multi-language support

**Future:** We plan to add automated tests. PRs adding tests are highly appreciated!

## 📝 Documentation

When making changes, update documentation:

- **README.md** - For user-facing changes and features
- **CONTRIBUTING.md** - For development process changes
- **Code comments** - For implementation details
- **JSDoc** - For public APIs
- **Examples** - Add usage examples for new features

### Documentation Standards

- Use clear, concise language
- Include code examples for features
- Keep examples realistic and practical
- Update configuration tables when adding parameters
- Add screenshots for visual changes

## 🔒 Security

If you discover a security vulnerability:

1. **Do NOT open a public issue**
2. Email the maintainer privately (see SECURITY.md)
3. Include detailed description and reproduction steps
4. Allow time for fix before public disclosure
5. Wait for response before public disclosure

## 📜 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring (no functional changes)
- `perf:` - Performance improvements
- `test:` - Adding/updating tests
- `build:` - Build system changes (esbuild, dependencies)
- `ci:` - CI configuration changes (GitHub Actions)
- `chore:` - Other changes (maintenance, tooling)

**Scope (optional):**
- `ai` - AI client, prompts, tools
- `analysis` - AST, linters, complexity
- `github` - GitHub API integration
- `stats` - Statistics and visualization
- `chunking` - Smart chunking logic
- `types` - TypeScript types

**Examples:**
```bash
feat(ai): add support for Claude Opus 4 model

fix(analysis): resolve AST parsing error for JSX fragments

docs: update README with Gemini 2.5 Pro examples

refactor(stats): simplify complexity calculation logic

perf(chunking): optimize token counting for large files
```

## 🎯 Development Tips

### Working with AI Tools

When adding new tools to `src/ai/tools-registry.ts`:

1. Define clear tool description (AI reads this)
2. Use JSON Schema for parameters
3. Implement tool function with error handling
4. Add usage examples in prompts
5. Test with various scenarios

```typescript
{
  name: 'new_analysis_tool',
  description: 'Clear description of what this tool does and when to use it',
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the file to analyze',
      },
    },
    required: ['file_path'],
  },
}
```

### Working with Prompts

When modifying `src/ai/prompts.ts`:

1. Be specific and clear
2. Use examples to guide AI behavior
3. Test with various PR scenarios
4. Consider token limits
5. Maintain senior-level perspective

### Adding New Linters

To add support for a new language linter in `src/analysis/linter-runner.ts`:

1. Add linter detection logic
2. Implement output parsing
3. Map severity levels (error, warning, info)
4. Add file type support
5. Document in README

## 🏆 Recognition

Contributors are recognized in:

- GitHub Contributors page
- Release notes (for significant contributions)
- README (for major features)
- Special thanks in commit messages

## ❓ Questions?

Have questions about contributing?

- Open a [Discussion](https://github.com/zxcnoname666/AI-Code-Review/discussions)
- Comment on existing issues
- Reach out to maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, makes a difference. Thank you for helping make AI Code Review better! 🚀

**Happy Coding!** 💻✨
