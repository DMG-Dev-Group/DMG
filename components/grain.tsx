/**
 * Film grain — a fixed, pointer-events-none overlay for cinematic texture.
 * Per perf rules: grain lives ONLY on a fixed layer (never on a scrolling
 * container) so it never triggers continuous GPU repaints. Static, ~3% opacity.
 */
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix type='saturate' values='0'/>
      </filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`,
  );

export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] opacity-[0.035] mix-blend-soft-light"
      style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: "140px 140px" }}
    />
  );
}
