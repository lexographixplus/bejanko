import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { ContentCountsSection } from "@/components/home/content-counts";
import { StartHereSection } from "@/components/home/start-here";
import { RecentFeedSection } from "@/components/home/recent-feed";
import { FeaturedBookSection } from "@/components/home/featured-book";
import { FeaturedAuthorsSection } from "@/components/home/featured-authors";
import { GuestBandSection } from "@/components/home/guest-band";
import { getContentCounts } from "@/lib/actions/stats";
import { getStartHereEssays, getRecentEssays } from "@/lib/actions/essays";
import { getFeaturedBook } from "@/lib/actions/books";
import { getFeaturedAuthors } from "@/lib/actions/authors";
import { getSettings } from "@/lib/actions/settings";

export default async function HomePage() {
  const [
    counts,
    startHereEssays,
    recentEssays,
    featuredBook,
    featuredAuthors,
    settings,
  ] = await Promise.all([
    getContentCounts(),
    getStartHereEssays(),
    getRecentEssays(3),
    getFeaturedBook(),
    getFeaturedAuthors(3),
    getSettings(),
  ]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <HeroSection />
        <ContentCountsSection counts={counts} />
        <StartHereSection essays={startHereEssays} />
        <RecentFeedSection essays={recentEssays} />
        <FeaturedBookSection book={featuredBook} />
        <FeaturedAuthorsSection authors={featuredAuthors} />
        <GuestBandSection image={settings.guestBandImageUrl} />
      </main>
      <Footer />
    </>
  );
}
