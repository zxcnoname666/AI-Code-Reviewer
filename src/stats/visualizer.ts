/**
 * Beautiful statistics and visualization for code review
 */

import type { ReviewStatistics, ReviewIssue } from '../types/index.js';
import Table from 'cli-table3';

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
  const table = new Table({
    chars: {
      'top': '━', 'top-mid': '⁤', 'top-left': '┏', 'top-right': '┓',
      'bottom': '━', 'bottom-mid': '⁤', 'bottom-left': '┗', 'bottom-right': '┛',
      'left': '┃', 'left-mid': '┃', 'mid': '⁤', 'mid-mid': '⁤',
      'right': '┃', 'right-mid': '┃', 'middle': '┃'
    },
    style: { 'padding-left': 0, 'padding-right': 0 },
    colWidths: [69]
  });

  table.push(
    [''],
    ['    🤖  𝗔𝗜 𝗖𝗢𝗗𝗘 𝗥𝗘𝗩𝗜𝗘𝗪 - 𝗔𝗡𝗔𝗟𝗬𝗦𝗜𝗦 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘  🤖'],
    [''],
    ['         ⚡ Powered by Advanced AI & Deep Code Analysis ⚡'],
    ['']
  );

  return '```\n' + table.toString() + '\n```';
}

/**
 * Generate overview section
 */
function generateOverviewSection(stats: ReviewStatistics): string {
  const table = new Table({
    head: [],
    colWidths: [22, 42],
    style: { head: [], border: [] }
  });

  table.push(
    ['Files Reviewed', stats.totalFiles.toString()],
    ['Total Lines Changed', stats.totalLines.toString()],
    ['Lines Added', `+${stats.additions}`],
    ['Lines Deleted', `-${stats.deletions}`],
    ['Review Time', formatDuration(stats.reviewTime)],
    ['Tokens Used', stats.tokensUsed.toLocaleString()]
  );

  return '## 📊 Review Overview\n\n```\n' + table.toString() + '\n```';
}

/**
 * Generate issues chart with sparkline
 */
function generateIssuesChart(stats: ReviewStatistics): string {
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

  const table = new Table({
    head: [],
    colWidths: [70],
    style: { head: [], border: [] }
  });

  table.push(
    [`🔴 Critical   ${criticalBar}  ${String(stats.criticalIssues).padStart(3)} (${String(criticalPct).padStart(2)}%)`],
    [`⚠️  Warnings   ${warningBar}  ${String(stats.warningIssues).padStart(3)} (${String(warningPct).padStart(2)}%)`],
    [`📘 Info       ${infoBar}  ${String(stats.infoIssues).padStart(3)} (${String(infoPct).padStart(2)}%)`]
  );

  const divider = new Table({
    head: [],
    colWidths: [70],
    style: { head: [], border: [] },
    chars: { 'top': '─', 'top-mid': '┼', 'top-left': '├', 'top-right': '┤' }
  });

  const summaryTable = new Table({
    head: [],
    colWidths: [70],
    style: { head: [], border: [] }
  });

  summaryTable.push(
    [`Total Issues: ${stats.issuesFound}`],
    [`Files Affected: ${stats.filesWithIssues}/${stats.totalFiles}`]
  );

  let result = '## 🎯 Issues Found\n\n```\n' + table.toString() + '\n';
  result += divider.toString().split('\n')[0] + '\n';
  result += summaryTable.toString() + '\n```';

  // Add sparkline visualization
  if (stats.issuesFound > 0) {
    const sparkline = generateSparkline([
      stats.criticalIssues,
      stats.warningIssues,
      stats.infoIssues,
    ]);
    result += '\n\n**Trend**: ' + sparkline + ' (Critical → Warning → Info)';
  }

  return result;
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
  // Complexity levels
  let level: string;
  let icon: string;

  if (complexity <= 5) {
    level = 'LOW';
    icon = '✅';
  } else if (complexity <= 10) {
    level = 'MODERATE';
    icon = '⚠️';
  } else if (complexity <= 20) {
    level = 'HIGH';
    icon = '🟠';
  } else {
    level = 'VERY HIGH';
    icon = '🔴';
  }

  const table = new Table({
    head: ['Complexity Gauge'],
    colWidths: [43],
    style: { head: ['cyan'], border: [] }
  });

  // Draw gauge
  const gaugePos = Math.min(Math.floor((complexity / 30) * 35), 35);
  const gauge = '░'.repeat(gaugePos) + '█' + '░'.repeat(35 - gaugePos);

  table.push(
    [''],
    [`      ${icon} ${level.padEnd(15)} ${complexity.toFixed(1).padEnd(10)}`],
    [''],
    [`  ${gauge}`],
    ['  0' + ' '.repeat(34) + '30+']
  );

  return '## 🎚️ Average Complexity\n\n```\n' + table.toString() + '\n```';
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
  lines.push(`⏱️ Review Time:       ${formatDuration(stats.reviewTime)}`);
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

  const table = new Table({
    chars: {
      'top': '━', 'top-mid': '⁤', 'top-left': '┏', 'top-right': '┓',
      'bottom': '━', 'bottom-mid': '⁤', 'bottom-left': '┗', 'bottom-right': '┛',
      'left': '┃', 'left-mid': '┃', 'mid': '⁤', 'mid-mid': '⁤',
      'right': '┃', 'right-mid': '┃', 'middle': '┃'
    },
    style: { 'padding-left': 0, 'padding-right': 0 },
    colWidths: [53]
  });

  table.push(
    [''],
    [`  ${statusIcon}  ${status}`],
    [''],
    [`  📊 Quality Score: ${scoreBar}`],
    [''],
    ['  Issues Found:'],
    [`    • Critical: ${String(stats.criticalIssues).padStart(3)} 🔴`],
    [`    • Warnings:  ${String(stats.warningIssues).padStart(3)} ⚠️`],
    [`    • Info:      ${String(stats.infoIssues).padStart(3)} 📘`],
    [''],
    [`  Files: ${stats.filesWithIssues}/${stats.totalFiles} affected`],
    ['']
  );

  return '```\n' + table.toString() + '\n```';
}
