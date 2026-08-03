import { getMessages } from "@/lib/actions/messages";
import { MessagesManager } from "@/components/admin/messages-manager";

export default async function MessagesPage() {
  const messages = await getMessages();
  return <MessagesManager messages={messages} />;
}
