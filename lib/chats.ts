// chat.ts
import axios from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 流式响应的 chunk 类型
export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export async function postChatUseDeepSeek(
  request: ChatCompletionRequest,
  onStreamChunk?: (chunk: StreamChunk) => void,
  onStreamComplete?: (fullContent: string) => void
): Promise<ChatCompletionResponse | null> {
  try {
    const {
      messages,
      model = 'deepseek-chat',
      stream = false,
      temperature = 0.7,
      max_tokens = 2048
    } = request;

    // 如果不需要流式响应，直接返回完整结果
    if (!stream) {
      const response = await axios.post<ChatCompletionResponse>('/api/v1/chat', {
        messages,
        model,
        stream: false,
        temperature,
        max_tokens
      });
      return response.data;
    }

    // 处理流式响应
    if (stream && onStreamChunk) {
      return await handleStreamResponse(
        { messages, model, stream: true, temperature, max_tokens },
        onStreamChunk,
        onStreamComplete
      );
    }

    return null;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw error;
  }
}

// 处理流式响应
async function handleStreamResponse(
  request: ChatCompletionRequest,
  onChunk: (chunk: StreamChunk) => void,
  onComplete?: (fullContent: string) => void
): Promise<null> {
  const response = await fetch('/api/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  if (!reader) {
    throw new Error('No reader available for stream response');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6)) as StreamChunk;
            onChunk(data);
            
            // 累积内容
            const content = data.choices[0]?.delta?.content;
            if (content) {
              fullContent += content;
            }
          } catch (e) {
            console.warn('Failed to parse stream chunk:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // 流完成回调
  if (onComplete) {
    onComplete(fullContent);
  }

  return null;
}