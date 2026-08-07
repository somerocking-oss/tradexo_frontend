import { RegisterBusinessForm } from "./RegisterBusinessForm";
import { RegisterBusinessHero, RegisterTrustStatsBar } from "./RegisterBusinessHero";
import { fetchSiteSettings } from "@/lib/cms";
import {
  buildTrustStats,
  fetchPlatformStats,
  formatStatCount,
} from "@/lib/platform-stats";

export default async function RegisterBusinessPage() {
  const [settings, platformStats] = await Promise.all([
    fetchSiteSettings(),
    fetchPlatformStats(),
  ]);
  const trustStats = buildTrustStats(settings?.homepage?.trustStats, platformStats);
  const businessCountLabel =
    platformStats && platformStats.businessCount > 0
      ? formatStatCount(platformStats.businessCount)
      : null;

  return (
    <>
      <RegisterBusinessHero
        businessCountLabel={businessCountLabel}
        trustStats={trustStats}
      />
      <RegisterTrustStatsBar stats={trustStats} />
      <RegisterBusinessForm registeredToday={platformStats?.registeredToday || 0} />
    </>
  );
}
