import type { Metadata } from "next";
import { getAiInfoAndTitle } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { ChatPageClient } from "@/components/chat-page-client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // 使用服务端安全的方案获取AI信息和标题
  const { title, description } = await getAiInfoAndTitle(id);

  if (title === "") {
    redirect("/home");
  }

  return {
    title,
    description,
  };
}

export default async function ChatPage({ params }: Props) {
  const { id } = await params;
  return <ChatPageClient aiId={id} />;
}
