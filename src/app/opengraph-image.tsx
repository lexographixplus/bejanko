import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
            Writer · Thinker · Creator
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#141916",
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            A writing space first,
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#5A635E",
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            a literary community second.
          </div>
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
          <div style={{ fontSize: 30, fontWeight: 700, color: "#141916" }}>
            {SITE_NAME}
          </div>
          <div style={{ fontSize: 24, color: "#5A635E" }}>
            Essays · Notes · Quotes
          </div>
        </div>
      </div>
    ),
    size
  );
}
