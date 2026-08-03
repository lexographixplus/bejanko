import { getEssays } from "@/lib/actions/essays";
import { EssaysManager } from "@/components/admin/essays-manager";

export default async function EssaysPage() {
  const essays = await getEssays();
  return <EssaysManager essays={essays} />;
}
