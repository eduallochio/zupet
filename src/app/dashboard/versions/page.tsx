import { getAppUsers } from "@/lib/app-users";
import VersionsClient from "./VersionsClient";

export const dynamic = "force-dynamic";

export default async function VersionsPage() {
  const users = await getAppUsers();
  return <VersionsClient users={users} />;
}
