# Security Policy

## 🔒 Reporting Security Vulnerabilities

The security of AI Code Review is a top priority. If you discover a security vulnerability, we appreciate your help in disclosing it to us responsibly.

### ⚠️ Please Do NOT:
- Open a public GitHub issue
- Disclose the vulnerability publicly before it's been addressed
- Exploit the vulnerability beyond what's necessary to demonstrate it

### ✅ Please Do:

**1. Report Privately**

Contact us directly at:
- **GitHub Security Advisories**: [Report a vulnerability](https://github.com/zxcnoname666/AI-Code-Review/security/advisories/new) (preferred)

**2. Include Details**

Please provide:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if you have one)
- Your contact information (optional)

**Example Report:**
```
Subject: [SECURITY] API Key Exposure in Logs

Description:
OpenAI API keys are being logged in plain text when debug mode is enabled,
creating a risk of credential exposure in CI logs.

Steps to Reproduce:
1. Enable debug logging with DEBUG=true
2. Run release workflow
3. Check action logs - API key is visible

Impact:
High - Exposed API keys could be used by unauthorized parties

Suggested Fix:
Mask API keys in all log outputs using GitHub's secret masking feature

Contact: security-researcher@example.com
```

**3. Response Timeline**

We will:
- Acknowledge your report within **48 hours**
- Provide an initial assessment within **5 business days**
- Keep you informed of our progress
- Credit you in the fix (unless you prefer anonymity)

## 🛡️ Security Measures

### Current Security Practices

**1. Secret Handling**
- All API keys are handled as GitHub secrets
- No secrets are logged or exposed in outputs
- GitHub automatically masks secrets in logs

**2. Dependency Security**
- Regular dependency updates
- Automated security scanning with Dependabot
- Minimal dependency footprint

**3. Code Security**
- TypeScript strict mode
- No use of `eval()` or similar dangerous functions
- Input validation on all external data
- Safe handling of git operations

**4. API Security**
- HTTPS-only communication
- OpenAI API calls use official SDK
- Rate limiting respected
- No credential storage

### Known Limitations

**OpenAI API Key**
- Required for AI changelog generation
- Stored as GitHub secret (encrypted at rest)
- Never committed to repository
- Transmitted over HTTPS only

**GitHub Token**
- Auto-provided by GitHub Actions
- Scoped permissions (contents: write only)
- Automatically revoked after workflow completes

## 🔐 Best Practices for Users

### Secure Configuration

**1. API Keys**
```yaml
# ✅ CORRECT - Use secrets
with:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

# ❌ WRONG - Never hardcode
with:
  OPENAI_API_KEY: 'sk-...'
```

**2. Permissions**
```yaml
# ✅ CORRECT - Minimal permissions
permissions:
  contents: write

# ❌ WRONG - Excessive permissions
permissions:
  contents: write
  packages: write
  id-token: write
```

**3. Branch Protection**
```yaml
# ✅ CORRECT - Protect release branch
on:
  push:
    branches: [main]

# Ensure branch protection rules are enabled
```

### Protecting Your Secrets

**GitHub Repository Secrets:**
1. Navigate to Settings → Secrets and variables → Actions
2. Add `OPENAI_API_KEY` as repository secret
3. Never commit secrets to the repository
4. Rotate keys regularly (recommended: every 90 days)
5. Use read-only tokens when possible

**Environment Variables:**
```bash
# ❌ WRONG - Don't expose in CI logs
echo $OPENAI_API_KEY

# ✅ CORRECT - GitHub automatically masks
# (but avoid echoing anyway)
```

## 🔍 Security Audits

### Regular Reviews

We perform security reviews:
- Before each major release
- When adding new features
- After dependency updates
- In response to vulnerability reports

### Third-Party Audits

Currently, no formal third-party audits have been conducted. We welcome security researchers to review the codebase.

## 📦 Dependency Security

### Dependency Management

- **Lock file**: `pnpm-lock.yaml` ensures reproducible builds
- **Updates**: Dependencies updated monthly (or sooner for security patches)
- **Scanning**: Automated scanning via GitHub Dependabot

### Current Dependencies

Core dependencies (production):
```json
{
  "@actions/core": "^1.x",
  "@actions/github": "^6.x",
  "openai": "^4.x"
}
```

All dependencies are from trusted sources with active maintenance.

## ⚡ Incident Response

### In Case of Security Incident

If a security vulnerability is confirmed:

**1. Assessment (Day 1)**
- Evaluate severity and impact
- Determine affected versions
- Develop mitigation strategy

**2. Fix Development (Days 2-5)**
- Develop and test fix
- Create security advisory (if needed)
- Prepare release notes

**3. Disclosure (Day 5-7)**
- Release patched version
- Publish security advisory
- Notify affected users
- Credit reporter (if desired)

**4. Post-Incident (Week 2)**
- Conduct post-mortem
- Update security practices
- Implement preventive measures

## 📊 Vulnerability Severity

We assess vulnerabilities using CVSS v3.1:

| Score | Severity | Response Time |
|-------|----------|---------------|
| 9.0-10.0 | Critical | 24 hours |
| 7.0-8.9 | High | 48 hours |
| 4.0-6.9 | Medium | 7 days |
| 0.1-3.9 | Low | 30 days |

## 🎯 Scope

### In Scope

Security issues in:
- AI Code Review source code (`src/`)
- GitHub Actions workflow execution
- API key handling and secret management
- Dependencies and supply chain
- Documentation that could lead to insecure usage

### Out of Scope

- Issues in third-party dependencies (report to them)
- Vulnerabilities in GitHub Actions platform (report to GitHub)
- OpenAI API vulnerabilities (report to OpenAI)
- Social engineering attacks
- Physical security

## 🏅 Hall of Fame

We recognize security researchers who help improve AI Code Review's security:

*(No vulnerabilities reported yet)*

**Want to be listed here?** Report a valid security vulnerability following our process!

## 📞 Contact

**Security Team:**
- GitHub: [@zxcnoname666](https://github.com/zxcnoname666)

**For general questions:** Open a [Discussion](https://github.com/zxcnoname666/AI-Code-Review/discussions)

**For bugs (non-security):** Open an [Issue](https://github.com/zxcnoname666/AI-Code-Review/issues)

## 📜 Disclosure Policy

We follow **Coordinated Vulnerability Disclosure**:

1. Researcher reports vulnerability privately
2. We acknowledge and investigate
3. We develop and test a fix
4. We release the fix
5. We publish security advisory
6. Researcher can publicly disclose (after fix is released)

Typical timeline: 7-30 days from report to public disclosure.

## 🔄 Updates to This Policy

This security policy may be updated periodically. Check this page for the latest version.

**Last Updated:** November 2025

---

## 🙏 Thank You

Thank you for helping keep AI Code Review and its users safe! Your responsible disclosure helps protect the entire community.

If you have suggestions for improving this security policy, please open a [Discussion](https://github.com/zxcnoname666/AI-Code-Review/discussions).
