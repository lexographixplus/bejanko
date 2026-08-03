import { getBooks } from "@/lib/actions/books";
import { BooksManager } from "@/components/admin/books-manager";

export default async function BooksPage() {
  const [mine, others] = await Promise.all([getBooks("MINE"), getBooks("OTHERS")]);
  return <BooksManager mine={mine} others={others} />;
}
