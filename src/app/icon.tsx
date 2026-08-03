import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon: the logo mark on the brand red, drawn as inline SVG so it matches
 * `LogoMark` exactly. ImageResponse has no <use>/CSS support, so the arcs are
 * repeated here with explicit colours.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#8A2B2B",
          borderRadius: 7,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="6.5" r="3.4" fill="#ffffff" />
          <path d="M10 13a6 6 0 0 0 12 0" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M5 16.5a11 11 0 0 0 22 0" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size
  );
}
