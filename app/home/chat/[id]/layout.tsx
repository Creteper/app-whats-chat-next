import { Metadata } from "next";

const metadata: Metadata = {
  title: "Whats Chat - Chat",
};

export default function ChatLayOut(children: { children: React.ReactNode }) {
  return <div className="w-full h-full">{children.children}</div>;
}
