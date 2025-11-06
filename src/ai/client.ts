/**
 * AI Client with tool calling support
 */

import type { PullRequestInfo, FileChange, ReviewConfig } from '../types/index.js';
import { info, warning } from '@actions/core';
import { generateSystemPrompt, generateUserPrompt, parseToolCalls } from './prompts.js';
import { AI_TOOLS, executeTool, type ToolContext } from './tools-registry.js';

/**
 * OpenAI API configuration
 */
interface OpenAIConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

/**
 * OpenAI API response type
 */
interface OpenAIResponse {
  choices: Array<{
    message: {
      content?: string;
      tool_calls?: Array<{
        function?: {
          name?: string;
          arguments?: string | Record<string, any>;
        };
        name?: string;
        arguments?: Record<string, any>;
      }>;
      refusal?: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Maximum iterations for tool use loop
 */
const MAX_ITERATIONS = 50; // Increased for thorough reviews

/**
 * Maximum tokens for response
 */
const MAX_TOKENS = 4000;

/**
 * Perform AI code review with tool support
 */
export async function performAIReview(
  pr: PullRequestInfo,
  files: FileChange[],
  config: ReviewConfig,
  workdir: string
): Promise<string> {
  if (!config.openaiApiKey) {
    throw new Error('OpenAI API key is required for AI review');
  }

  const aiConfig: OpenAIConfig = {
    apiKey: config.openaiApiKey,
    model: config.openaiApiModel || 'gpt-5',
    baseUrl: config.openaiApiBaseUrl || 'https://api.openai.com/v1',
  };

  const toolContext: ToolContext = {
    workdir,
    files,
    baseSha: pr.baseSha,
    headSha: pr.headSha,
  };

  info('🤖 Starting AI code review...');
  info(`Model: ${aiConfig.model}`);
  info(`Files to review: ${files.length}`);

  const systemPrompt = generateSystemPrompt();
  const userPrompt = generateUserPrompt(pr, files, config);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let iteration = 0;
  let totalToolCalls = 0;

  // Tool use loop
  while (iteration < MAX_ITERATIONS) {
    iteration++;
    info(`📊 AI Iteration ${iteration}/${MAX_ITERATIONS}`);

    const response = await callOpenAI(messages, aiConfig);

    // Check for tool calls first (before checking if response is empty)
    const toolCalls = parseToolCalls(response);

    // If we have tool calls, process them even if content is empty
    if (toolCalls.length > 0) {
      // Continue to tool execution below
    }
    // Check if response is empty and no tool calls
    else if (!response || response.trim().length === 0) {
      warning(`Empty response with no tool calls at iteration ${iteration}`);

      if (iteration > 1) {
        messages.push({
          role: 'user',
          content: 'Please provide your final code review based on the tool results you received.',
        });
        continue;
      } else {
        throw new Error('AI returned empty response on first iteration with no tool calls');
      }
    }
    // No tool calls but we have content - this is the final review
    else {
      info('✅ Final review generated');
      return cleanupResponse(response);
    }

    // Execute tools
    info(`🔧 Executing ${toolCalls.length} tool(s): ${toolCalls.map(t => t.name).join(', ')}`);
    totalToolCalls += toolCalls.length;

    const toolResults: string[] = [];

    for (const call of toolCalls) {
      try {
        info(`  → ${call.name}(${JSON.stringify(call.arguments)})`);
        const result = await executeTool(call, toolContext);

        if (result.error) {
          toolResults.push(`**Tool**: ${result.name}\n**Error**: ${result.error}`);
          warning(`Tool ${result.name} failed: ${result.error}`);
        } else {
          const resultStr = typeof result.result === 'string'
            ? result.result
            : JSON.stringify(result.result, null, 2);

          toolResults.push(`**Tool**: ${result.name}\n**Result**:\n${resultStr}`);
          info(`  ✓ ${result.name} completed`);
        }
      } catch (error: any) {
        toolResults.push(`**Tool**: ${call.name}\n**Error**: ${error.message}`);
        warning(`Tool ${call.name} crashed: ${error.message}`);
      }
    }

    // Add tool results to conversation
    messages.push(
      { role: 'assistant', content: response },
      {
        role: 'user',
        content: `# Tool Results\n\n${toolResults.join('\n\n---\n\n')}\n\n${iteration >= MAX_ITERATIONS - 2 ? 'This is one of your last iterations. Please generate your final comprehensive code review now.' : 'Continue analysis or generate final review.'}`,
      }
    );
  }

  info(`⚠️ Reached maximum iterations (${MAX_ITERATIONS})`);
  info(`Total tool calls made: ${totalToolCalls}`);

  // Try to get final response
  messages.push({
    role: 'user',
    content: 'Please provide your final code review summary based on all the analysis performed.',
  });

  const finalResponse = await callOpenAI(messages, aiConfig);
  return cleanupResponse(finalResponse);
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  config: OpenAIConfig
): Promise<string> {
  const url = config.baseUrl.includes('/chat/completions')
    ? config.baseUrl
    : `${config.baseUrl}/chat/completions`;

  // Convert tools to OpenAI tools format
  const tools = AI_TOOLS.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.3, // Lower temperature for more focused, consistent reviews
        max_tokens: MAX_TOKENS,
        top_p: 0.95,
        tools,
        tool_choice: 'auto', // Let model decide when to use tools
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }

    const data = await response.json() as OpenAIResponse;

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    const message = data.choices[0].message;
    let content = message.content || '';

    // Debug: Log message structure if content is empty but we have tokens
    if (!content && data.usage && data.usage.completion_tokens > 50) {
      warning(`Received ${data.usage.completion_tokens} completion tokens but empty content`);
      warning(`Message keys: ${Object.keys(message).join(', ')}`);
      if (message.refusal) {
        warning(`Model refused: ${message.refusal}`);
      }
    }

    // Handle structured tool calls from API
    // Some models return tool_calls in a separate field instead of in content
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCallsJson = message.tool_calls.map((tc: any) => ({
        name: tc.function?.name || tc.name,
        arguments: typeof tc.function?.arguments === 'string'
          ? JSON.parse(tc.function.arguments)
          : (tc.function?.arguments || tc.arguments || {}),
      }));

      // Format tool calls as JSON block so parseToolCalls can process them
      const toolCallsBlock = '\n\n```json\n' + JSON.stringify(toolCallsJson, null, 2) + '\n```\n';
      content = content ? content + toolCallsBlock : toolCallsBlock;
    }

    // Log token usage
    if (data.usage) {
      info(
        `  Tokens: ${data.usage.prompt_tokens} prompt + ${data.usage.completion_tokens} completion = ${data.usage.total_tokens} total`
      );
    }

    return content;
  } catch (error: any) {
    if (error.cause) {
      throw new Error(`Network error calling OpenAI: ${error.message} (${error.cause})`);
    }
    throw new Error(`Failed to call OpenAI API: ${error.message}`);
  }
}

/**
 * Clean up AI response
 */
function cleanupResponse(response: string): string {
  let cleaned = response;

  // Remove thinking blocks
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '');
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');

  // Remove tool call blocks
  const toolBlockRegex = /```json\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/g;
  cleaned = cleaned.replace(toolBlockRegex, (match, jsonContent) => {
    try {
      const parsed = JSON.parse(jsonContent);

      // Remove if it's a tool call
      if (Array.isArray(parsed) && parsed.some(item => item.name || item.tool)) {
        return '';
      }
      if (parsed.name || parsed.tool) {
        return '';
      }

      // Keep other JSON blocks
      return match;
    } catch {
      return match;
    }
  });

  // Remove multiple consecutive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Remove empty markdown sections
  cleaned = cleaned.replace(/#{1,6}\s*\n+#{1,6}/g, (match) => {
    return match.split('\n')[match.split('\n').length - 1];
  });

  return cleaned.trim();
}

/**
 * Parse review summary from AI response
 */
export function parseReviewSummary(response: string): {
  overall: 'approved' | 'needs-changes' | 'rejected';
  hasCriticalIssues: boolean;
  hasWarnings: boolean;
} {
  const lowerResponse = response.toLowerCase();

  // Detect critical issues
  const hasCriticalIssues =
    lowerResponse.includes('🔴') ||
    lowerResponse.includes('critical') ||
    lowerResponse.includes('blocking') ||
    lowerResponse.includes('must fix');

  // Detect warnings
  const hasWarnings = lowerResponse.includes('⚠️') || lowerResponse.includes('warning');

  // Determine overall assessment
  let overall: 'approved' | 'needs-changes' | 'rejected';

  if (hasCriticalIssues) {
    overall = 'rejected';
  } else if (hasWarnings) {
    overall = 'needs-changes';
  } else if (
    lowerResponse.includes('approved') ||
    lowerResponse.includes('looks good') ||
    lowerResponse.includes('✅')
  ) {
    overall = 'approved';
  } else {
    overall = 'needs-changes';
  }

  return {
    overall,
    hasCriticalIssues,
    hasWarnings,
  };
}

/**
 * Generate concise summary from full review
 */
export async function generateSummary(
  fullReview: string,
  config: ReviewConfig
): Promise<string> {
  if (!config.openaiApiKey) {
    throw new Error('OpenAI API key is required for summary generation');
  }

  const aiConfig: OpenAIConfig = {
    apiKey: config.openaiApiKey,
    model: config.openaiApiModel || 'gpt-5',
    baseUrl: config.openaiApiBaseUrl || 'https://api.openai.com/v1',
  };

  info('📝 Generating concise summary...');

  const language = config.reviewLanguage || 'en';
  const langInstruction = language !== 'en'
    ? `Write your summary in ${language} language.`
    : '';

  const messages = [
    {
      role: 'system',
      content: `You are a senior software engineer creating concise summaries of code reviews.
Your task is to read a detailed code review and create a brief but comprehensive summary that captures:
- The main purpose of the changes
- Critical issues found (if any)
- Key recommendations
- Overall assessment

Keep the summary under 300 words but make it informative and actionable. ${langInstruction}`,
    },
    {
      role: 'user',
      content: `Please create a concise summary of this code review:\n\n${fullReview}\n\n---\n\nProvide a summary that includes:
1. What changes were made (1-2 sentences)
2. Critical findings (if any)
3. Main recommendations
4. Overall verdict

Keep it brief but informative.`,
    },
  ];

  try {
    const response = await callOpenAI(messages, aiConfig);
    info('✅ Summary generated');
    return cleanupResponse(response);
  } catch (error: any) {
    warning(`Failed to generate summary: ${error.message}`);
    return ''; // Return empty string if summary fails - don't block the main review
  }
}
