import { getGuestPosts } from "@/lib/actions/guest-posts";
import { GuestPostsManager } from "@/components/admin/guest-posts-manager";

export default async function GuestPostsPage() {
  const posts = await getGuestPosts();
  return <GuestPostsManager posts={posts} />;
}
