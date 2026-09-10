import {
  convertToModelMessages,
  createUIMessageStream,
  generateText,
  smoothStream,
  stepCountIs,
  streamText,
  type UIMessage
} from 'ai'

import { chartTool, weatherTool } from '../../shared/utils'

function buildChatSystemPrompt(userName?: string | null) {
  return `You are a knowledgeable and helpful AI assistant. ${userName ? `The user's name is ${userName}.` : ''} Your goal is to provide clear, accurate, and well-structured responses.

**FORMATTING RULES (CRITICAL):**
- ABSOLUTELY NO MARKDOWN HEADINGS: Never use #, ##, ###, ####, #####, or ######
- NO underline-style headings with === or ---
- Use **bold text** for emphasis and section labels
- Examples:
  * Instead of "## Usage", write "**Usage:**" or just "Here's how to use it:"
  * Instead of "# Complete Guide", write "**Complete Guide**" or start directly with content
- Start all responses with content, never with a heading

**RESPONSE QUALITY:**
- Be concise yet comprehensive
- Use examples when helpful
- Break down complex topics into digestible parts
- Maintain a friendly, professional tone`
}

export function chatCompletionService() {
  const providerOptionsByThinkingState = (
    thinkingEnabled: boolean
  ): NonNullable<Parameters<typeof streamText>[0]['providerOptions']> => {
    if (thinkingEnabled) {
      return {
        openai: {
          reasoningEffort: 'low' as const,
          reasoningSummary: 'detailed' as const
        },
        google: {
          thinkingConfig: {
            includeThoughts: true,
            thinkingBudget: 2048
          }
        }
      }
    }

    return {
      openai: {
        reasoningEffort: 'minimal' as const
      }
    }
  }

  return {
    async generateTitle(input: { firstMessage: UIMessage }) {
      const { text } = await generateText({
        model: 'openai/gpt-4o-mini',
        system: `You are a title generator for a chat:
          - Generate a short title based on the first user's message
          - The title should be less than 30 characters long
          - The title should be a summary of the user's message
          - Do not use quotes (' or ") or colons (:) or any other punctuation
          - Do not use markdown, just plain text`,
        prompt: JSON.stringify(input.firstMessage)
      })

      return text
    },

    createResponseStream(input: {
      model: string
      messages: UIMessage[]
      thinkingEnabled: boolean
      userName?: string | null
      onFinish: (messages: UIMessage[]) => Promise<void>
    }) {
      return createUIMessageStream({
        execute: async ({ writer }) => {
          const result = streamText({
            model: input.model,
            system: buildChatSystemPrompt(input.userName),
            messages: await convertToModelMessages(input.messages),
            providerOptions: providerOptionsByThinkingState(input.thinkingEnabled),
            stopWhen: stepCountIs(5),
            experimental_transform: smoothStream({ chunking: 'word' }),
            tools: {
              weather: weatherTool,
              chart: chartTool
            }
          })

          writer.merge(
            result.toUIMessageStream({
              sendReasoning: input.thinkingEnabled
            })
          )
        },
        onFinish: async ({ messages }) => {
          await input.onFinish(messages)
        }
      })
    }
  }
}
