/**
 * Shared scroll progress for the climax section (0..1 across the pinned range).
 * GSAP ScrollTrigger writes it; the shard field reads it each frame to drive the
 * explosion. Plain mutable object (no per-frame re-render).
 */
export const climaxScroll = {
  progress: 0,
};
