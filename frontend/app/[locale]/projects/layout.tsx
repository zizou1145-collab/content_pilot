import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProjectsLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
