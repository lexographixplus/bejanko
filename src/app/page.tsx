import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { ContentCountsSection } from "@/components/home/content-counts";
import { StartHereSection } from "@/components/home/start-here";
import { RecentFeedSection } from "@/components/home/recent-feed";
import { GuestBandSection } from "@/components/home/guest-band";
import { getContentCounts } from "@/lib/actions/stats";
import { getStartHereEssays, getRecentEssays } from "@/lib/actions/essays";

export default async function HomePage() {
  const [counts, startHereEssays, recentEssays] = await Promise.all([
    getContentCounts(),
    getStartHereEssays(),
    getRecentEssays(3),
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
        <GuestBandSection />
      </main>
      <Footer />
    </>
  );
}
