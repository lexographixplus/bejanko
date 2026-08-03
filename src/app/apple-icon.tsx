import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <svg width="128" height="128" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="6.5" r="3.2" fill="#ffffff" />
          <path d="M10 13a6 6 0 0 0 12 0" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M5 16.5a11 11 0 0 0 22 0" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size
  );
}
