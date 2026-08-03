import { ImageResponse } from "next/og";
import { getEssayBySlug } from "@/lib/actions/essays";
import { SITE_NAME } from "@/lib/site";
import { truncate } from "@/lib/utils";

export const alt = "Essay";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = await getEssayBySlug(slug);

  const title = essay?.title ?? "Essay";
  const excerpt = essay?.excerpt ? truncate(essay.excerpt, 140) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F2F4F1",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 4, background: "#8A2B2B" }} />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#8A2B2B",
              fontWeight: 600,
            }}
          >
            Essay
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 58 : 72,
              fontWeight: 700,
              color: "#141916",
              lineHeight: 1.12,
              letterSpacing: -2,
            }}
          >
            {truncate(title, 110)}
          </div>
          {excerpt && (
            <div style={{ fontSize: 28, color: "#5A635E", lineHeight: 1.45 }}>
              {excerpt}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid #DCE1DA",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="6.5" r="3.2" fill="#8A2B2B" />
          <path d="M10 13a6 6 0 0 0 12 0" stroke="#8A2B2B" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M5 16.5a11 11 0 0 0 22 0" stroke="#8A2B2B" strokeOpacity="0.5" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#141916" }}>
              {SITE_NAME}
            </div>
          </div>
          {essay?.readingTime && (
            <div style={{ fontSize: 24, color: "#5A635E" }}>
              {essay.readingTime} min read
            </div>
          )}
        </div>
      </div>
    ),
    size
  );
}
