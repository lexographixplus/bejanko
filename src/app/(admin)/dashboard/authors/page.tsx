import { getAuthors } from "@/lib/actions/authors";
import { AuthorsManager } from "@/components/admin/authors-manager";

export default async function AuthorsPage() {
  const authors = await getAuthors();
  return <AuthorsManager authors={authors} />;
}
