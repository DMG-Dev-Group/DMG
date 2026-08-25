"use client";

import { Component, type ReactNode } from "react";

/**
 * CanvasBoundary — isolates the WebGL subtree. If anything in the 3D core throws
 * (driver quirk, effect incompatibility, lost context), we render nothing and let
 * the CSS CorePoster underneath carry the experience instead of crashing the page.
 */
export class CanvasBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[DMG] core WebGL disabled, falling back to poster:", error);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
