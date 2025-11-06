# Contributing to Release Helper

First off, thank you for considering contributing to Release Helper! 🎉 It's people like you that make this project better for everyone.

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
  - Release Helper version
  - Relevant configuration

**Example:**
```markdown
### Bug: AI changelog generation fails with custom model

**Description:**
When using `gpt-5-high` model, the action fails with error "Invalid model".

**Steps to reproduce:**
1. Configure workflow with `OPENAI_API_MODEL: gpt-5-high`
2. Push commit with `!release: patch`
3. Action fails

**Expected:** Should use gpt-5-high model
**Actual:** Fails with error

**Environment:**
- Node.js: 20.10.0
- OS: Ubuntu 22.04
- Release Helper: v1.0.0
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
### Feature: Support for Anthropic Claude

**Problem:** Some users prefer Claude over OpenAI GPT models

**Solution:** Add support for Anthropic API with parameters:
- ANTHROPIC_API_KEY
- ANTHROPIC_MODEL (claude-3-opus, claude-3-sonnet)

**Alternatives:** 
- Keep OpenAI only (simpler maintenance)
- Support generic OpenAI-compatible APIs

**Use cases:**
- Users with Anthropic credits
- Teams preferring Claude's output style
```

## 🔧 Pull Request Process

### Setting Up Development Environment

1. **Fork and clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/release-helper.git
cd release-helper
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

3. **Test your changes:**
```bash
pnpm run build
pnpm run type-check
# Test manually with a test repository
```

4. **Commit using conventional commits:**
```bash
git commit -m "feat: add support for Anthropic Claude

- Add ANTHROPIC_API_KEY configuration
- Implement Claude API integration
- Update documentation"
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
   - Screenshots/GIFs if UI changes

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

## Testing
How did you test these changes?

## Checklist
- [ ] Code builds successfully
- [ ] Type checking passes
- [ ] Documentation updated
- [ ] Follows conventional commits
- [ ] No breaking changes (or documented)

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
- Avoid `any` type

**Good:**
```typescript
interface CommitData {
  sha: string;
  message: string;
  author: string;
}

function parseCommit(data: CommitData): ParsedCommit {
  // implementation
}
```

**Bad:**
```typescript
function parseCommit(data: any) {
  // implementation
}
```

### Naming Conventions

- **Files:** kebab-case (`git-utils.ts`)
- **Functions:** camelCase (`parseCommit`)
- **Classes:** PascalCase (`CommitParser`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_MODEL`)
- **Types/Interfaces:** PascalCase (`CommitData`)

### Code Organization

```typescript
// 1. Imports
import { readFile } from 'fs/promises';
import type { Config } from './types';

// 2. Types/Interfaces
interface Options {
  // ...
}

// 3. Constants
const DEFAULT_TIMEOUT = 5000;

// 4. Functions
export async function processRelease(options: Options): Promise<void> {
  // ...
}
```

### Comments

- Write self-documenting code
- Add comments for complex logic
- Use JSDoc for public functions

```typescript
/**
 * Generates changelog from commits using AI
 * @param commits - Array of commit objects
 * @param config - AI configuration options
 * @returns Generated changelog markdown
 */
export async function generateChangelog(
  commits: Commit[],
  config: AIConfig
): Promise<string> {
  // implementation
}
```

## 🧪 Testing Guidelines

Currently, testing is manual. To test your changes:

1. Create a test repository
2. Set up Release Helper with your changes
3. Make test commits with `!release` commands
4. Verify releases are created correctly
5. Check changelog quality

**Future:** We plan to add automated tests. PRs adding tests are highly appreciated!

## 📝 Documentation

When making changes, update documentation:

- **README.md** - For user-facing changes
- **Code comments** - For implementation details
- **Examples** - Add usage examples if needed

## 🔒 Security

If you discover a security vulnerability:

1. **Do NOT open a public issue**
2. Email the maintainer privately (see SECURITY.md)
3. Include detailed description and reproduction steps
4. Wait for response before public disclosure

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
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding/updating tests
- `build:` - Build system changes
- `ci:` - CI configuration changes
- `chore:` - Other changes

**Examples:**
```bash
feat(ai): add support for custom system prompts

fix(git): resolve issue with merge commits parsing

docs: update configuration examples in README

refactor(core): simplify version bumping logic
```

## 🏆 Recognition

Contributors are recognized in:

- GitHub Contributors page
- Release notes (for significant contributions)
- README (for major features)

## ❓ Questions?

Have questions about contributing?

- Open a [Discussion](https://github.com/zxcnoname666/release-helper/discussions)
- Comment on existing issues
- Reach out to maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, makes a difference. Thank you for helping make Release Helper better! 🚀

**Happy Coding!** 💻✨