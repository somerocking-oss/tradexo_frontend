import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tradexo — Find Local & B2B Businesses in India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "linear-gradient(135deg, #c2410c 0%, #ff6c00 50%, #fb923c 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.9, marginBottom: 16, letterSpacing: 4 }}>
          FIND · CONNECT · TRADE
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
          Tradexo
        </div>
        <div style={{ fontSize: 34, marginTop: 24, maxWidth: 820, lineHeight: 1.3, opacity: 0.95 }}>
          Find verified local businesses, B2B suppliers & manufacturers across India
        </div>
      </div>
    ),
    { ...size }
  );
}
