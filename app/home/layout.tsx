import { ReactNode } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { AppLayout } from "@/components/app-layout";

export default function HomeLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const EXCLUDE_SIDEBAR_PATHS = [
    "/login",
    "/register",
    "/forgot-password",
    "/not-found",
    "/error",
    "/global-error",
    "/maintenance",
  ];
  return (
    <AuthProvider>
      <AppLayout excludePaths={EXCLUDE_SIDEBAR_PATHS}>{children}</AppLayout>
    </AuthProvider>
  );
}
