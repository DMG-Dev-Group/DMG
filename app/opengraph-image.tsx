import { ImageResponse } from "next/og";

export const alt = "DMG — Damage Group · Software de alto padrão";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated OG card: void black, red bloom, the hero headline. No external assets.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#050506",
          padding: "84px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-160px",
            top: "180px",
            width: "620px",
            height: "620px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,30,30,0.38), rgba(255,30,30,0) 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#8A8A93",
            fontSize: "24px",
            letterSpacing: "8px",
          }}
        >
          <div style={{ width: "12px", height: "12px", background: "#FF1E1E" }} />
          DAMAGE GROUP
        </div>
        <div
          style={{
            marginTop: "28px",
            display: "flex",
            color: "#EDECEF",
            fontSize: "94px",
            fontWeight: 700,
          }}
        >
          Nós construímos.
        </div>
        <div style={{ display: "flex", fontSize: "94px", fontWeight: 700 }}>
          <span style={{ color: "#8A8A93" }}>E quebramos&nbsp;</span>
          <span style={{ color: "#FFFFFF" }}>o padrão.</span>
        </div>
        <div style={{ marginTop: "40px", display: "flex", color: "#8A8A93", fontSize: "30px" }}>
          Software de alto padrão · dano controlado
        </div>
      </div>
    ),
    { ...size },
  );
}
