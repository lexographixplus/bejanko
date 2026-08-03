import { getQuotes } from "@/lib/actions/quotes";
import { QuotesManager } from "@/components/admin/quotes-manager";

export default async function QuotesPage() {
  const quotes = await getQuotes();
  return <QuotesManager quotes={quotes} />;
}
