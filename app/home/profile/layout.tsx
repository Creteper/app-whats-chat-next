import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsChat - Profile",
  description: "WhatsChat - Login",
};

export default function ProfileLayOut({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
