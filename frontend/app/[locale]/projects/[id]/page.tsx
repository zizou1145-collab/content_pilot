import { setRequestLocale } from "next-intl/server";
import { ProjectDetailContent } from "./ProjectDetailContent";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function ProjectDetailPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProjectDetailContent />;
}
