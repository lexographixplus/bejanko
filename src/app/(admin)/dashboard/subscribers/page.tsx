import { getSubscribers } from "@/lib/actions/newsletter";
import { SubscribersManager } from "@/components/admin/subscribers-manager";

export default async function SubscribersPage() {
  const subscribers = await getSubscribers();
  return <SubscribersManager subscribers={subscribers} />;
}
