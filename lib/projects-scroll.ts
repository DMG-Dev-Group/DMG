/**
 * Shared scroll progress for the Projetos section (0..1 across the pinned range).
 * GSAP ScrollTrigger writes `progress`; the 3D laptop reads it each frame to
 * drive its spin and screen swap. Plain mutable object (no per-frame re-render).
 */
export const projectsScroll = {
  progress: 0,
};
