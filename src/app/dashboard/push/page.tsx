import { getAppUsers } from "@/lib/app-users";
import PushClient from "./PushClient";

export const dynamic = "force-dynamic";

export default async function PushPage() {
  const users = await getAppUsers();
  return <PushClient users={users} />;
}
