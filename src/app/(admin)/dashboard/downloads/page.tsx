import { getDownloads, getDownloadStats } from "@/lib/actions/downloads";
import { DownloadsManager } from "@/components/admin/downloads-manager";

export default async function DownloadsPage() {
  const [claims, stats] = await Promise.all([
    getDownloads(),
    getDownloadStats(),
  ]);

  return <DownloadsManager claims={claims} stats={stats} />;
}
