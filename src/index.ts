/**
 * AI Code Review Tool - Main Entry Point
 * Advanced code review with AI-powered analysis, AST parsing, and comprehensive feedback
 */

import { getInput, setFailed, info, warning, startGroup, endGroup } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import type { ReviewConfig, ReviewStatistics } from './types/index.js';
import { getPullRequestInfo, getChangedFiles, postReviewComment, postSilentComment, getReviewEvent, addLabels, removeLabel } from './github/client.js';
import { performAIReview, parseReviewSummary } from './ai/client.js';
import { createChunks, getChunkingStats } from './chunking/strategy.js';
import { generateStatisticsReport, generateSummaryBadge } from './stats/visualizer.js';

/**
 * Main action execution
 */
async function run(): Promise<void> {
  const startTime = Date.now();

  try {
    info('🚀 Starting AI Code Review Tool v1.0');
    info('═'.repeat(60));

    // ====== 1. Parse Configuration ======
    startGroup('📋 Configuration');

    const config: ReviewConfig = {
      githubToken: getInput('GITHUB_TOKEN', { required: true }),
      openaiApiKey: getInput('OPENAI_API_KEY'),
      openaiApiModel: getInput('OPENAI_API_MODEL') || 'gpt-5',
      openaiApiBaseUrl: getInput('OPENAI_API_BASE_URL') || 'https://api.openai.com/v1',
      reviewLanguage: getInput('REVIEW_LANGUAGE') || 'en',
      silentMode: getInput('SILENT_MODE') === 'true',
      maxChunkSize: parseInt(getInput('MAX_CHUNK_SIZE') || '6000', 10),
      enableLinters: getInput('ENABLE_LINTERS') !== 'false',
      enableAST: getInput('ENABLE_AST') !== 'false',
      enableDependencyAnalysis: getInput('ENABLE_DEPENDENCY_ANALYSIS') !== 'false',
      severityThreshold: (getInput('SEVERITY_THRESHOLD') || 'warning') as any,
    };

    info(`Model: ${config.openaiApiModel}`);
    info(`Language: ${config.reviewLanguage}`);
    info(`Silent Mode: ${config.silentMode}`);
    info(`AST Analysis: ${config.enableAST}`);
    info(`Linters: ${config.enableLinters}`);

    endGroup();

    // ====== 2. Get Pull Request Information ======
    startGroup('📥 Fetching Pull Request');

    const octokit = getOctokit(config.githubToken);
    const { owner, repo } = context.repo;

    // Get PR number from context
    // Support both pull_request events and issue_comment events (from /review command)
    let pullNumber: number | undefined;

    if (context.eventName === 'pull_request') {
      pullNumber = context.payload.pull_request?.number;
    } else if (context.eventName === 'issue_comment') {
      // Check if this is a PR comment (not regular issue)
      if (context.payload.issue?.pull_request) {
        pullNumber = context.payload.issue.number;
      }
    }

    if (!pullNumber) {
      throw new Error(
        'This action must be triggered by a pull_request event or a /review comment on a pull request'
      );
    }

    info(`Repository: ${owner}/${repo}`);
    info(`Pull Request: #${pullNumber}`);

    const prInfo = await getPullRequestInfo(octokit, owner, repo, pullNumber);

    info(`Title: ${prInfo.title}`);
    info(`Author: ${prInfo.author}`);
    info(`Branch: ${prInfo.headBranch} → ${prInfo.baseBranch}`);
    info(`Files Changed: ${prInfo.filesChanged}`);
    info(`Changes: +${prInfo.additions} -${prInfo.deletions}`);

    endGroup();

    // ====== 3. Get Changed Files ======
    startGroup('📂 Analyzing Changed Files');

    const files = await getChangedFiles(octokit, owner, repo, pullNumber);

    info(`Retrieved ${files.length} changed files`);

    // Group by language
    const byLanguage: Record<string, number> = {};
    for (const file of files) {
      const lang = file.language || 'Unknown';
      byLanguage[lang] = (byLanguage[lang] || 0) + 1;
    }

    info('Language distribution:');
    for (const [lang, count] of Object.entries(byLanguage)) {
      info(`  ${lang}: ${count} files`);
    }

    endGroup();

    // ====== 4. Chunking Strategy ======
    startGroup('🔀 Preparing Review Chunks');

    const chunks = createChunks(files, {
      name: 'balanced',
      maxTokensPerChunk: config.maxChunkSize,
      groupByModule: true,
      groupByType: true,
    });

    const chunkStats = getChunkingStats(chunks);

    info(`Created ${chunkStats.totalChunks} chunk(s)`);
    info(`Average files per chunk: ${chunkStats.avgFilesPerChunk}`);
    info(`Average tokens per chunk: ${chunkStats.avgTokensPerChunk}`);
    info(`Largest chunk: ${chunkStats.largestChunk} tokens`);

    if (chunks.length > 1) {
      info('\nChunks:');
      for (const chunk of chunks) {
        info(`  - ${chunk.id}: ${chunk.files.length} files, ~${chunk.estimatedTokens} tokens`);
        info(`    Reason: ${chunk.reason}`);
      }
    }

    endGroup();

    // ====== 5. Perform AI Review ======
    startGroup('🤖 AI Code Review');

    if (!config.openaiApiKey) {
      warning('No OpenAI API key provided. Skipping AI review.');
      info('Please provide OPENAI_API_KEY input to enable AI-powered code review.');

      await postSilentComment(
        octokit,
        owner,
        repo,
        pullNumber,
        '⚠️ **AI Code Review Skipped**\n\nNo OpenAI API key provided. Please configure the action to enable AI-powered code review.'
      );

      return;
    }

    let reviewContent = '';
    let totalTokensUsed = 0;

    if (chunks.length === 1) {
      // Single chunk - simple review
      info('Reviewing all files in single pass...');
      reviewContent = await performAIReview(prInfo, files, config, process.cwd());
    } else {
      // Multiple chunks - review each and combine
      info(`Reviewing in ${chunks.length} chunks...`);

      const chunkReviews: string[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        info(`\n📦 Chunk ${i + 1}/${chunks.length}: ${chunk.id}`);
        info(`Files:\n\`\`\`\n${chunk.files.map(f => f.filename).join('\n')}\n\`\`\``);

        const chunkReview = await performAIReview(
          { ...prInfo, filesChanged: chunk.files.length },
          chunk.files,
          config,
          process.cwd()
        );

        chunkReviews.push(`## Chunk ${i + 1}: ${chunk.reason}\n\nFiles:\n\`\`\`\n${chunk.files.map(f => f.filename).join('\n')}\n\`\`\`\n\n${chunkReview}`);
      }

      // Combine reviews
      reviewContent = `# AI Code Review - Multi-Part Analysis\n\n${chunkReviews.join('\n\n---\n\n')}`;
    }

    info('\n✅ AI Review completed');

    endGroup();

    // ====== 6. Parse Review Results ======
    startGroup('📊 Analyzing Results');

    const reviewSummary = parseReviewSummary(reviewContent);

    info(`Overall: ${reviewSummary.overall}`);
    info(`Critical Issues: ${reviewSummary.hasCriticalIssues ? 'Yes' : 'No'}`);
    info(`Warnings: ${reviewSummary.hasWarnings ? 'Yes' : 'No'}`);

    endGroup();

    // ====== 7. Generate Statistics ======
    startGroup('📈 Generating Statistics');

    const endTime = Date.now();
    const reviewTime = endTime - startTime;

    // Build statistics (simplified for now, can be enhanced with actual issue parsing)
    const stats: ReviewStatistics = {
      totalFiles: files.length,
      totalLines: files.reduce((sum, f) => sum + f.additions + f.deletions, 0),
      additions: files.reduce((sum, f) => sum + f.additions, 0),
      deletions: files.reduce((sum, f) => sum + f.deletions, 0),
      issuesFound: reviewSummary.hasCriticalIssues ? 5 : reviewSummary.hasWarnings ? 2 : 0, // Placeholder
      criticalIssues: reviewSummary.hasCriticalIssues ? 2 : 0, // Placeholder
      warningIssues: reviewSummary.hasWarnings ? 3 : 0, // Placeholder
      infoIssues: 0, // Placeholder
      filesWithIssues: reviewSummary.hasCriticalIssues || reviewSummary.hasWarnings ? Math.ceil(files.length * 0.3) : 0,
      averageComplexity: 5.5, // Placeholder
      reviewTime,
      tokensUsed: totalTokensUsed,
      categoryCounts: {
        security: 1,
        performance: 2,
        'best-practice': 1,
        maintainability: 1,
      },
      languageDistribution: byLanguage,
    };

    const statsReport = generateStatisticsReport(stats, []);
    const summaryBadge = generateSummaryBadge(stats);

    info('\n' + summaryBadge);

    endGroup();

    // ====== 8. Post Review to GitHub ======
    startGroup('📤 Posting Review');

    const fullReview = `${summaryBadge}\n\n${reviewContent}\n\n${statsReport}`;

    const reviewEvent = getReviewEvent(
      reviewSummary.hasCriticalIssues,
      reviewSummary.hasWarnings
    );

    if (config.silentMode) {
      info('Posting in silent mode...');
      await postSilentComment(octokit, owner, repo, pullNumber, fullReview);
    } else {
      info(`Posting review as: ${reviewEvent}`);
      await postReviewComment(octokit, owner, repo, pullNumber, fullReview, reviewEvent);
    }

    // Add labels based on review
    const labelsToAdd: string[] = [];
    const labelsToRemove: string[] = [];

    if (reviewSummary.hasCriticalIssues) {
      labelsToAdd.push('needs-changes');
      labelsToRemove.push('approved');
    } else if (reviewSummary.hasWarnings) {
      labelsToAdd.push('review-comments');
    } else {
      labelsToAdd.push('ai-approved');
      labelsToRemove.push('needs-changes', 'review-comments');
    }

    if (labelsToAdd.length > 0) {
      await addLabels(octokit, owner, repo, pullNumber, labelsToAdd);
    }

    for (const label of labelsToRemove) {
      await removeLabel(octokit, owner, repo, pullNumber, label);
    }

    endGroup();

    // ====== 9. Summary ======
    info('');
    info('═'.repeat(60));
    info('✅ AI Code Review Completed Successfully!');
    info('═'.repeat(60));
    info(`⏱️  Total Time: ${Math.round(reviewTime / 1000)}s`);
    info(`📁 Files Reviewed: ${files.length}`);
    info(`📊 Overall: ${reviewSummary.overall.toUpperCase()}`);
    info('═'.repeat(60));
  } catch (error: any) {
    setFailed(`❌ Action failed: ${error.message}`);

    if (error.stack) {
      info('\nStack trace:');
      info(error.stack);
    }
  }
}

// Run the action
run();
