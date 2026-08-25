/**
 * Shared "damage" state — the scroll-driven fracture progress of the core.
 * GSAP ScrollTrigger tweens `fracture` (0 = intact, 1 = fully shattered); the
 * crystal shader reads it every frame via useFrame. A plain mutable object on
 * purpose: no React re-render on a value that changes every scroll frame.
 */
export const damage = {
  /** 0 intact -> 1 fully fractured/dissolved. */
  fracture: 0,
};
