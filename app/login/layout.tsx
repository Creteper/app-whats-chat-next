import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsChat - Login",
  description: "WhatsChat - Login",
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
