// app/api/v1/postChat/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Stream } from "openai/streaming";

// // 处理 GET 请求
// export async function GET(request: NextRequest) {
//   // 如需获取查询参数：request.nextUrl.searchParams.get("key")
//   const param = request.nextUrl.searchParams.get("key");

//   console.log(param, "data")
//   return NextResponse.json({ message: "GET success" }, { status: 200 });
// }

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.deepseek.com", // DeepSeek API 端点
});

// 处理 POST 请求
export async function POST(request: NextRequest) {
  try {
    const {
      messages,
      model = "deepseek-chat",
      stream = false,
    } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    // 使用 OpenAI SDK 创建聊天完成
    const completion = await openai.chat.completions.create({
      model,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 2048,
    });

    if (stream) {
      // 使用正确的类型处理流
      const completionStream =
        completion as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completionStream) {
              const data = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            console.error("Stream error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    // 非流式响应
    return NextResponse.json(completion);
  } catch (error: any) {
    console.error("Error in DeepSeek API route:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.type,
          code: error.code,
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
