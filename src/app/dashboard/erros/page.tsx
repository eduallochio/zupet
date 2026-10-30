import ErrorsClient from "@/components/ErrorsClient";
import { getAppErrors } from "@/lib/app-errors";

export const revalidate = 0;

export default async function ErrosPage() {
  const errors = await getAppErrors("zupet");
  return <ErrorsClient errors={errors} title="Erros do App" subtitle="Erros e crashes capturados no app Zupet (tutor)" />;
}
