"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { projects } from "@/data/projects";
import { projectsScroll } from "@/lib/projects-scroll";

const TWO_PI = Math.PI * 2;
const N = projects.length;

/* --------------------------------------------------------------------------
 * TUNING KNOBS — iterate against screenshots (I can't see the 3D here).
 * ------------------------------------------------------------------------ */
const SCALE = 1.05; // overall size
const POS_Y = -0.65; // vertical offset (corner toward the floor)
const TILT_X = 0.93; // pitch — stands the open laptop up so the SCREEN is vertical
const TILT_Z = -0.36; // roll — diagonal lean per the sketch (flip sign to mirror)
const LID_OPEN = -2.5; // lid angle wide open (~143deg)
const SCREEN_ROT = 0; // texture rotation (0 = upright)
const TURNS = N - 1; // full revolutions across the whole scroll

/** Title-card texture for projects without a real demo (dev / em breve). */
function makePlaceholder(name: string, badge: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const g = ctx.createLinearGradient(0, 0, 1024, 640);
  g.addColorStop(0, "#0c0c0e");
  g.addColorStop(1, "#180a0c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 640);

  const rg = ctx.createRadialGradient(512, 300, 0, 512, 300, 520);
  rg.addColorStop(0, "rgba(255,30,30,0.20)");
  rg.addColorStop(1, "transparent");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, 1024, 640);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#EDECEF";
  ctx.font = "bold 96px sans-serif";
  ctx.fillText(name, 512, 296);
  ctx.fillStyle = "#FF1E1E";
  ctx.font = "30px monospace";
  ctx.fillText(badge, 512, 404);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Realistic laptop keyboard (Avell ION A65i style): dense small keys, function
 *  row, full QWERTY block + numpad, red LED backlight bleed, trackpad. */
function makeKeyboard() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 680;
  const ctx = c.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#060608";
  ctx.fillRect(0, 0, 1024, 680);

  // Soft red backlight wash behind the keys
  const glow = ctx.createRadialGradient(430, 165, 20, 430, 185, 620);
  glow.addColorStop(0, "rgba(255,30,30,0.30)");
  glow.addColorStop(0.55, "rgba(150,12,16,0.10)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1024, 350);

  const uw = 44;
  const gap = 6;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cap = (x: number, y: number, w: number, h: number, label: string, fs: number) => {
    ctx.shadowColor = "rgba(255,30,30,0.75)";
    ctx.shadowBlur = 7;
    ctx.fillStyle = "#121217";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, w - 4, h * 0.45, 4);
    ctx.fill();
    if (label) {
      ctx.fillStyle = "#d2d2d8";
      ctx.font = `500 ${fs}px sans-serif`;
      ctx.fillText(label, x + w / 2, y + h / 2 + 1);
    }
  };

  const row = (
    x: number,
    y: number,
    h: number,
    keys: [string, number][],
    fs: number,
  ) => {
    for (const [label, units] of keys) {
      const w = units * uw + (units - 1) * gap;
      cap(x, y, w, h, label, fs);
      x += w + gap;
    }
  };

  const X = 24;
  row(X, 20, 28, [["esc", 1], ["F1", 1], ["F2", 1], ["F3", 1], ["F4", 1], ["F5", 1], ["F6", 1], ["F7", 1], ["F8", 1], ["F9", 1], ["F10", 1], ["F11", 1], ["F12", 1], ["del", 1]], 11);
  row(X, 56, 44, [["~", 1], ["1", 1], ["2", 1], ["3", 1], ["4", 1], ["5", 1], ["6", 1], ["7", 1], ["8", 1], ["9", 1], ["0", 1], ["-", 1], ["=", 1], ["bksp", 1.5]], 14);
  row(X, 106, 44, [["tab", 1.5], ["Q", 1], ["W", 1], ["E", 1], ["R", 1], ["T", 1], ["Y", 1], ["U", 1], ["I", 1], ["O", 1], ["P", 1], ["[", 1], ["]", 1]], 17);
  row(X, 156, 44, [["caps", 1.8], ["A", 1], ["S", 1], ["D", 1], ["F", 1], ["G", 1], ["H", 1], ["J", 1], ["K", 1], ["L", 1], ["Ç", 1], ["enter", 1.9]], 16);
  row(X, 206, 44, [["shift", 2.2], ["Z", 1], ["X", 1], ["C", 1], ["V", 1], ["B", 1], ["N", 1], ["M", 1], [",", 1], [".", 1], ["shift", 2.3]], 15);
  row(X, 256, 44, [["ctrl", 1.4], ["fn", 1], ["", 1], ["alt", 1.2], ["", 5.5], ["alt", 1.2], ["ctrl", 1.4]], 12);

  const NX = 772;
  row(NX, 56, 44, [["num", 1], ["/", 1], ["*", 1], ["-", 1]], 13);
  row(NX, 106, 44, [["7", 1], ["8", 1], ["9", 1], ["+", 1]], 15);
  row(NX, 156, 44, [["4", 1], ["5", 1], ["6", 1]], 15);
  row(NX, 206, 44, [["1", 1], ["2", 1], ["3", 1]], 15);
  row(NX, 256, 44, [["0", 2.05], [".", 1]], 15);

  // Trackpad
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(512 - 130, 384, 260, 205, 12);
  ctx.stroke();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/**
 * Laptop — a low-poly notebook (Avell-style, red-lit QWERTY keyboard) stood
 * upright on the corner of its deck, screen vertical facing the camera. The spin
 * group's Y rotation is scroll-driven; every full turn the screen returns
 * showing the next project (texture bound declaratively, swaps while facing away).
 */
export function Laptop() {
  const spin = useRef<THREE.Group>(null);
  const [texIdx, setTexIdx] = useState(0);

  const textures = useMemo(
    () =>
      projects.map((p) => {
        const t = p.demo
          ? (() => {
              const tex = new THREE.TextureLoader().load(p.demo!);
              tex.colorSpace = THREE.SRGBColorSpace;
              return tex;
            })()
          : makePlaceholder(
              p.nome,
              p.status === "desenvolvimento" ? "EM DESENVOLVIMENTO" : "EM BREVE",
            );
        t.center.set(0.5, 0.5);
        t.rotation = SCREEN_ROT;
        return t;
      }),
    [],
  );

  const keyboard = useMemo(() => makeKeyboard(), []);

  useFrame(() => {
    const p = projectsScroll.progress;
    if (spin.current) spin.current.rotation.y = p * TURNS * TWO_PI;
    const idx = Math.min(N - 1, Math.max(0, Math.round(p * (N - 1))));
    setTexIdx((prev) => (prev === idx ? prev : idx));
  });

  return (
    <group ref={spin} position={[0, POS_Y, 0]}>
      <group scale={SCALE} rotation={[TILT_X, 0, TILT_Z]}>
        {/* Base / chassis */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3, 0.14, 2]} />
          <meshStandardMaterial color="#111114" metalness={0.65} roughness={0.4} />
        </mesh>
        {/* QWERTY keyboard deck with red backlight */}
        <mesh position={[0, 0.075, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.82, 1.86]} />
          <meshBasicMaterial map={keyboard} toneMapped={false} />
        </mesh>
        {/* Red power LED near the hinge */}
        <mesh position={[1.25, 0.078, -0.82]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.03, 16]} />
          <meshBasicMaterial color="#ff1e1e" toneMapped={false} />
        </mesh>

        {/* Lid — hinged at the back edge */}
        <group position={[0, 0.07, -1]} rotation={[LID_OPEN, 0, 0]}>
          <mesh position={[0, 0, 0.98]}>
            <boxGeometry args={[3, 0.08, 1.95]} />
            <meshStandardMaterial
              color="#111114"
              metalness={0.65}
              roughness={0.4}
            />
          </mesh>
          {/* Screen display — texture bound declaratively, double-sided */}
          <mesh position={[0, -0.05, 0.98]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.78, 1.72]} />
            <meshBasicMaterial
              map={textures[texIdx]}
              color="#ffffff"
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          {/* thin red accent along the bottom bezel */}
          <mesh position={[0, -0.045, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.78, 0.03]} />
            <meshBasicMaterial color="#ff1e1e" toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
