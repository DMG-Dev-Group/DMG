import { snoise } from "./noise";

/**
 * Crystal "damage" shader — plain GLSL1 (three's default), maximally compatible:
 * interpolated normals, no derivatives, no extensions.
 *
 * Uniforms:
 *   uTime      — animation clock (drives noise evolution)
 *   uFracture  — 0 intact .. 1 shattered (scroll-driven, see lib/damage.ts)
 *   uMouseDir  — cursor direction; faces pointing at it bulge (cursor damage)
 *   uColorDark — glass base color
 *   uColorRed  — brand red for fresnel rim + incandescent crack veins
 */
export const crystalVertex = /* glsl */ `
uniform float uTime;
uniform float uFracture;
uniform vec3 uMouseDir;

varying vec3 vNormal;    // view-space normal
varying vec3 vViewPos;   // view-space position
varying vec3 vObj;       // displaced object-space position (stable dissolve mask)
varying float vN;        // raw noise (subtle internal tint)

${snoise}

void main() {
  vec3 p = position;

  // Displacement: push each vertex along its normal by noise * fracture.
  float n = snoise(position * 1.7 + vec3(0.0, 0.0, uTime * 0.2));
  vN = n;
  float disp = n * uFracture * 0.45;

  // Cursor "repulsion": faces oriented toward the pointer bulge outward.
  float mp = max(dot(normalize(normal), uMouseDir), 0.0);

  p += normal * (disp + mp * 0.20);

  vObj = p;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const crystalFragment = /* glsl */ `
uniform float uTime;
uniform float uFracture;
uniform vec3 uColorDark;
uniform vec3 uColorRed;

varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vObj;
varying float vN;

${snoise}

void main() {
  vec3 N = normalize(vNormal);        // flat, baked per-facet -> crisp facets
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(-vViewPos);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);

  // Dissolve: carve holes where a procedural field falls below a threshold that
  // rises with fracture. The boundary glows red = incandescent cracks.
  float mask = snoise(vObj * 2.3 + vec3(uTime * 0.12)) * 0.5 + 0.5;
  float thr = uFracture * 0.82;
  if (mask < thr) discard;
  float edge = 1.0 - smoothstep(thr, thr + 0.10, mask);

  // Two-light facet model. Flat normals make each facet catch a distinct shade,
  // reading as cut glass rather than a smooth ball.
  vec3 L1 = normalize(vec3(0.55, 0.8, 0.55));   // cool key
  vec3 L2 = normalize(vec3(-0.6, -0.2, 0.5));   // red fill
  float d1 = max(dot(N, L1), 0.0);
  float d2 = max(dot(N, L2), 0.0);
  float spec = pow(max(dot(reflect(-L1, N), V), 0.0), 48.0);

  vec3 col = uColorDark * 0.35;                        // near-black glass base
  col += vec3(0.09, 0.10, 0.13) * pow(d1, 2.0);        // tight cool facet sheen
  col += uColorRed * 0.28 * pow(d2, 1.8);              // red facet fill (the accent)
  col += vec3(0.65, 0.70, 0.85) * spec * 0.35;         // occasional glass glint
  col += uColorRed * fres * (0.30 + uFracture * 0.7);  // subtle red edge (tamed halo)
  col += uColorRed * edge * (1.6 + uFracture * 3.5);   // crack veins (fracture)

  gl_FragColor = vec4(col, 1.0);
}
`;
