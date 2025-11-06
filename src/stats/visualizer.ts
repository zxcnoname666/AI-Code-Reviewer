/**
 * Beautiful statistics and visualization for code review
 */

import type { ReviewStatistics, ReviewIssue } from '../types/index.js';

/**
 * Generate beautiful statistics report
 */
export function generateStatisticsReport(stats: ReviewStatistics, issues: ReviewIssue[]): string {
  const sections: string[] = [];

  sections.push(generateHeader());
  sections.push(generateOverviewSection(stats));
  sections.push(generateIssuesChart(stats));
  sections.push(generateCategoryDistribution(stats));
  sections.push(generateLanguageDistribution(stats));
  sections.push(generateComplexityGauge(stats.averageComplexity));
  sections.push(generatePerformanceMetrics(stats));
  sections.push(generateTopIssues(issues));

  return sections.join('\n\n');
}

/**
 * Generate header with logo
 */
function generateHeader(): string {
  return `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                     ┃
┃    🤖  𝗔𝗜 𝗖𝗢𝗗𝗘 𝗥𝗘𝗩𝗜𝗘𝗪 - 𝗔𝗡𝗔𝗟𝗬𝗦𝗜𝗦 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘  🤖          ┃
┃                                                                     ┃
┃         ⚡ Powered by Advanced AI & Deep Code Analysis ⚡          ┃
┃                                                                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`;
}

/**
 * Generate overview section
 */
function generateOverviewSection(stats: ReviewStatistics): string {
  const lines: string[] = [];

  lines.push('## 📊 Review Overview\n');
  lines.push('```');
  lines.push('┌─────────────────────────────────────────────────────────────┐');
  lines.push(`│  Files Reviewed      │ ${padRight(stats.totalFiles.toString(), 40)} │`);
  lines.push(`│  Total Lines Changed │ ${padRight(stats.totalLines.toString(), 40)} │`);
  lines.push(`│  Lines Added         │ ${padRight(`+${stats.additions}`, 40)} │`);
  lines.push(`│  Lines Deleted       │ ${padRight(`-${stats.deletions}`, 40)} │`);
  lines.push(`│  Review Time         │ ${padRight(formatDuration(stats.reviewTime), 40)} │`);
  lines.push(`│  Tokens Used         │ ${padRight(stats.tokensUsed.toLocaleString(), 40)} │`);
  lines.push('└─────────────────────────────────────────────────────────────┘');
  lines.push('```');

  return lines.join('\n');
}

/**
 * Generate issues chart with sparkline
 */
function generateIssuesChart(stats: ReviewStatistics): string {
  const lines: string[] = [];

  lines.push('## 🎯 Issues Found\n');

  const maxIssues = Math.max(
    stats.criticalIssues,
    stats.warningIssues,
    stats.infoIssues,
    1
  );

  const criticalBar = generateBar(stats.criticalIssues, maxIssues, 40, '█');
  const warningBar = generateBar(stats.warningIssues, maxIssues, 40, '█');
  const infoBar = generateBar(stats.infoIssues, maxIssues, 40, '█');

  // Calculate percentages
  const total = stats.criticalIssues + stats.warningIssues + stats.infoIssues;
  const criticalPct = total > 0 ? Math.round((stats.criticalIssues / total) * 100) : 0;
  const warningPct = total > 0 ? Math.round((stats.warningIssues / total) * 100) : 0;
  const infoPct = total > 0 ? Math.round((stats.infoIssues / total) * 100) : 0;

  lines.push('```');
  lines.push('┌─────────────────────────────────────────────────────────┐');
  lines.push(`│ 🔴 Critical   ${criticalBar}  ${String(stats.criticalIssues).padStart(3)} (${String(criticalPct).padStart(2)}%) │`);
  lines.push(`│ ⚠️  Warnings   ${warningBar}  ${String(stats.warningIssues).padStart(3)} (${String(warningPct).padStart(2)}%) │`);
  lines.push(`│ 📘 Info       ${infoBar}  ${String(stats.infoIssues).padStart(3)} (${String(infoPct).padStart(2)}%) │`);
  lines.push('├─────────────────────────────────────────────────────────┤');
  lines.push(`│ Total Issues: ${stats.issuesFound.toString().padEnd(42)} │`);
  lines.push(`│ Files Affected: ${stats.filesWithIssues}/${stats.totalFiles}${' '.repeat(38 - (stats.filesWithIssues.toString() + stats.totalFiles.toString()).length)} │`);
  lines.push('└─────────────────────────────────────────────────────────┘');
  lines.push('```');

  // Add sparkline visualization
  if (stats.issuesFound > 0) {
    const sparkline = generateSparkline([
      stats.criticalIssues,
      stats.warningIssues,
      stats.infoIssues,
    ]);
    lines.push('');
    lines.push(`**Trend**: ${sparkline} (Critical → Warning → Info)`);
  }

  return lines.join('\n');
}

/**
 * Generate category distribution pie chart
 */
function generateCategoryDistribution(stats: ReviewStatistics): string {
  if (Object.keys(stats.categoryCounts).length === 0) {
    return '';
  }

  const lines: string[] = [];
  lines.push('## 📁 Issues by Category\n');
  lines.push('```');

  const total = Object.values(stats.categoryCounts).reduce((sum, count) => sum + count, 0);

  const sortedCategories = Object.entries(stats.categoryCounts).sort((a, b) => b[1] - a[1]);

  for (const [category, count] of sortedCategories) {
    const percentage = Math.round((count / total) * 100);
    const bar = generateBar(count, total, 30, '█');
    const icon = getCategoryIcon(category);

    lines.push(`${icon} ${padRight(category, 15)} ${bar} ${count} (${percentage}%)`);
  }

  lines.push('```');

  return lines.join('\n');
}

/**
 * Generate language distribution
 */
function generateLanguageDistribution(stats: ReviewStatistics): string {
  if (Object.keys(stats.languageDistribution).length === 0) {
    return '';
  }

  const lines: string[] = [];
  lines.push('## 🗣️ Language Distribution\n');
  lines.push('```');

  const total = Object.values(stats.languageDistribution).reduce((sum, count) => sum + count, 0);

  const sortedLangs = Object.entries(stats.languageDistribution).sort((a, b) => b[1] - a[1]);

  for (const [lang, count] of sortedLangs) {
    const percentage = Math.round((count / total) * 100);
    const bar = generateBar(count, total, 25, '▓');

    lines.push(`${padRight(lang, 12)} ${bar} ${percentage}%`);
  }

  lines.push('```');

  return lines.join('\n');
}

/**
 * Generate complexity gauge
 */
function generateComplexityGauge(complexity: number): string {
  const lines: string[] = [];

  lines.push('## 🎚️ Average Complexity\n');

  // Complexity levels
  let level: string;
  let color: string;
  let icon: string;

  if (complexity <= 5) {
    level = 'LOW';
    color = 'GREEN';
    icon = '✅';
  } else if (complexity <= 10) {
    level = 'MODERATE';
    color = 'YELLOW';
    icon = '⚠️';
  } else if (complexity <= 20) {
    level = 'HIGH';
    color = 'ORANGE';
    icon = '🟠';
  } else {
    level = 'VERY HIGH';
    color = 'RED';
    icon = '🔴';
  }

  lines.push('```');
  lines.push('┌─────────────────────────────────────────┐');
  lines.push('│  Complexity Gauge                       │');
  lines.push('├─────────────────────────────────────────┤');
  lines.push('│                                         │');
  lines.push(`│      ${icon} ${padRight(level, 15)} ${padRight(complexity.toFixed(1), 10)}  │`);
  lines.push('│                                         │');

  // Draw gauge
  const gaugePos = Math.min(Math.floor((complexity / 30) * 35), 35);
  const gauge = '│  ' + '░'.repeat(gaugePos) + '█' + '░'.repeat(35 - gaugePos) + '  │';
  lines.push(gauge);

  lines.push('│  0                                  30+ │');
  lines.push('└─────────────────────────────────────────┘');
  lines.push('```');

  return lines.join('\n');
}

/**
 * Generate performance metrics
 */
function generatePerformanceMetrics(stats: ReviewStatistics): string {
  const linesPerSecond = Math.round(stats.totalLines / (stats.reviewTime / 1000));
  const filesPerMinute = Math.round((stats.totalFiles / stats.reviewTime) * 60000);

  const lines: string[] = [];

  lines.push('## ⚡ Performance Metrics\n');
  lines.push('```');
  lines.push(`⏱️  Review Time:       ${formatDuration(stats.reviewTime)}`);
  lines.push(`📄 Files/Minute:      ${filesPerMinute}`);
  lines.push(`📝 Lines/Second:      ${linesPerSecond}`);
  lines.push(`🤖 Tokens Used:       ${stats.tokensUsed.toLocaleString()}`);
  lines.push(`💰 Approx Cost:       $${estimateCost(stats.tokensUsed)}`);
  lines.push('```');

  return lines.join('\n');
}

/**
 * Generate top issues table
 */
function generateTopIssues(issues: ReviewIssue[]): string {
  if (issues.length === 0) {
    return '';
  }

  const lines: string[] = [];
  lines.push('## 🔝 Top Issues to Address\n');

  // Sort by severity and take top 10
  const sortOrder = { critical: 0, error: 1, warning: 2, info: 3 };
  const topIssues = issues
    .sort((a, b) => sortOrder[a.severity] - sortOrder[b.severity])
    .slice(0, 10);

  for (let i = 0; i < topIssues.length; i++) {
    const issue = topIssues[i];
    const icon = getSeverityIcon(issue.severity);
    const categoryIcon = getCategoryIcon(issue.category);

    lines.push(`### ${i + 1}. ${icon} ${issue.title}`);
    lines.push('');
    lines.push(`**File**: \`${issue.file}${issue.line ? `:${issue.line}` : ''}\``);
    lines.push(`**Category**: ${categoryIcon} ${issue.category}`);
    lines.push(`**Severity**: ${issue.severity}`);
    lines.push('');
    lines.push(issue.description);

    if (issue.suggestion) {
      lines.push('');
      lines.push('**Suggested Fix**:');
      lines.push(issue.suggestion);
    }

    if (issue.code) {
      lines.push('');
      lines.push('```');
      lines.push(issue.code);
      lines.push('```');
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Helper functions
 */

function generateBar(value: number, max: number, width: number, char: string): string {
  const filledWidth = Math.round((value / max) * width);
  return char.repeat(filledWidth) + '░'.repeat(width - filledWidth);
}

function padRight(str: string, width: number): string {
  return str + ' '.repeat(Math.max(0, width - str.length));
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function estimateCost(tokens: number): string {
  // Rough estimate based on GPT-4 pricing (~$0.03 per 1K tokens)
  const cost = (tokens / 1000) * 0.03;
  return cost.toFixed(4);
}

function getSeverityIcon(severity: string): string {
  const icons: Record<string, string> = {
    critical: '🔴',
    error: '❌',
    warning: '⚠️',
    info: '📘',
  };
  return icons[severity] || '❓';
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    bug: '🐛',
    security: '🔒',
    performance: '⚡',
    style: '🎨',
    'best-practice': '⭐',
    maintainability: '🔧',
  };
  return icons[category] || '📝';
}

/**
 * Generate sparkline from values
 */
function generateSparkline(values: number[]): string {
  if (values.length === 0) return '';

  const max = Math.max(...values, 1);
  const sparkChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

  return values
    .map(v => {
      const index = Math.min(
        Math.floor((v / max) * (sparkChars.length - 1)),
        sparkChars.length - 1
      );
      return sparkChars[index];
    })
    .join('');
}

/**
 * Generate progress bar with percentage
 */
function generateProgressBar(value: number, max: number, width: number = 20): string {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${Math.round(percentage)}%`;
}

/**
 * Generate summary badge with enhanced visualization
 */
export function generateSummaryBadge(stats: ReviewStatistics): string {
  let status = '';
  let statusIcon = '';

  if (stats.criticalIssues > 0) {
    status = 'NEEDS IMMEDIATE ATTENTION';
    statusIcon = '🔴';
  } else if (stats.warningIssues > 5) {
    status = 'SIGNIFICANT ISSUES FOUND';
    statusIcon = '⚠️';
  } else if (stats.warningIssues > 0) {
    status = 'MINOR ISSUES FOUND';
    statusIcon = '⚠️';
  } else {
    status = 'LOOKS GREAT';
    statusIcon = '✅';
  }

  const qualityScore = Math.max(0, 100 - (stats.criticalIssues * 20) - (stats.warningIssues * 5) - (stats.infoIssues * 1));
  const scoreBar = generateProgressBar(qualityScore, 100, 25);

  return `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                       ┃
┃  ${statusIcon}  ${status.padEnd(46)} ┃
┃                                                       ┃
┃  📊 Quality Score: ${scoreBar}   ┃
┃                                                       ┃
┃  Issues Found:                                        ┃
┃    • Critical: ${String(stats.criticalIssues).padStart(3)} 🔴${' '.repeat(35)} ┃
┃    • Warnings:  ${String(stats.warningIssues).padStart(3)} ⚠️${' '.repeat(35)} ┃
┃    • Info:      ${String(stats.infoIssues).padStart(3)} 📘${' '.repeat(35)} ┃
┃                                                       ┃
┃  Files: ${stats.filesWithIssues}/${stats.totalFiles} affected${' '.repeat(36 - (stats.filesWithIssues.toString() + stats.totalFiles.toString()).length)} ┃
┃                                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`;
}
