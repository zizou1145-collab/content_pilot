import { redirect } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

/**
 * /projects has no dedicated list page; projects are shown on the dashboard.
 * Redirect to dashboard so the sidebar "Projects" link works.
 */
export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: "/dashboard", locale });
}
