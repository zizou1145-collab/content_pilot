import { setRequestLocale } from "next-intl/server";
import { NewProjectPage } from "./NewProjectPage";

type Props = { params: Promise<{ locale: string }> };

export default async function NewProjectRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NewProjectPage />;
}
