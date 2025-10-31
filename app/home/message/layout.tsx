import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsChat - Message",
  description: "WhatsChat - Login",
};
export default function MessageLayOut({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
}
