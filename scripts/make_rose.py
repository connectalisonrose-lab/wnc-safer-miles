#!/usr/bin/env python3
"""The WNC Safer Miles rose: layered petals around a folded heart.
   Built from explicit petal shapes so it reads as a rose, not a scalloped circle."""
import math

CX, CY = 80.0, 70.0
SQ = 0.95          # a touch of vertical squash so the bloom sits


def P(ang, r, cx=CX, cy=CY):
    a = math.radians(ang)
    return (cx + r * math.cos(a), cy + r * math.sin(a) * SQ)


def f(p):
    return f"{p[0]:.1f} {p[1]:.1f}"


def petal(ang, r0, r1, spread, curl=0.0, cx=CX, cy=CY):
    """A rounded petal from radius r0 out to r1, `spread` degrees wide, optionally swept."""
    base_l = P(ang - spread * 0.28 + curl, r0, cx, cy)
    base_r = P(ang + spread * 0.28 + curl, r0, cx, cy)
    tip_l = P(ang - spread * 0.17, r1 * 0.99, cx, cy)
    tip_r = P(ang + spread * 0.17, r1 * 0.99, cx, cy)
    mid_l = P(ang - spread * 0.5 + curl * 0.5, (r0 + r1) * 0.54, cx, cy)
    mid_r = P(ang + spread * 0.5 + curl * 0.5, (r0 + r1) * 0.54, cx, cy)
    out_l = P(ang - spread * 0.34, r1 * 1.02, cx, cy)
    out_r = P(ang + spread * 0.34, r1 * 1.02, cx, cy)
    return (f"M{f(base_l)} C{f(mid_l)} {f(out_l)} {f(tip_l)} "
            f"C{f(P(ang, r1 * 1.05, cx, cy))} {f(P(ang, r1 * 1.05, cx, cy))} {f(tip_r)} "
            f"C{f(out_r)} {f(mid_r)} {f(base_r)} "
            f"C{f(P(ang + spread * 0.12 + curl, r0 * 0.72, cx, cy))} "
            f"{f(P(ang - spread * 0.12 + curl, r0 * 0.72, cx, cy))} {f(base_l)}Z")


def spiral(a0, a1, r0, r1, n=40, cx=CX, cy=CY):
    """A smooth spiral, stroked: the heart of the rose coiling inward."""
    pts = [P(a0 + (a1 - a0) * i / n, r0 + (r1 - r0) * i / n, cx, cy) for i in range(n + 1)]
    d = [f"M{f(pts[0])}"]
    for i in range(1, len(pts) - 1, 2):
        d.append(f"Q{f(pts[i])} {f(pts[i+1])}")
    return " ".join(d)


def leaf(x0, y0, length, angle_deg, width, side=1):
    a = math.radians(angle_deg)
    ux, uy = math.cos(a), math.sin(a)
    nx, ny = -uy, ux
    tip = (x0 + length * ux, y0 + length * uy)
    c1 = (x0 + .30 * length * ux + side * width * nx, y0 + .30 * length * uy + side * width * ny)
    c2 = (x0 + .74 * length * ux + side * width * .70 * nx, y0 + .74 * length * uy + side * width * .70 * ny)
    c3 = (x0 + .74 * length * ux - side * width * .26 * nx, y0 + .74 * length * uy - side * width * .26 * ny)
    c4 = (x0 + .28 * length * ux - side * width * .30 * nx, y0 + .28 * length * uy - side * width * .30 * ny)
    body = f"M{x0:.1f} {y0:.1f} C{f(c1)} {f(c2)} {f(tip)} C{f(c3)} {f(c4)} {x0:.1f} {y0:.1f}Z"
    rib = (f"M{x0:.1f} {y0:.1f} Q{x0 + .55 * length * ux + side * width * .14 * nx:.1f} "
           f"{y0 + .55 * length * uy + side * width * .14 * ny:.1f} {f(tip)}")
    return body, rib


# --- bloom -------------------------------------------------------------
back = [petal(-90 + i * 72 + 36, 12, 48, 86) for i in range(5)]
mid = [petal(-90 + i * 72, 10, 37, 92, curl=6) for i in range(5)]
inner = [petal(-90 + i * 120 + 20, 6, 24, 104, curl=10) for i in range(3)]

heart = spiral(150, 520, 19.0, 3.4)
fold_l = spiral(210, 330, 26.0, 20.0)
fold_r = spiral(30, 150, 26.0, 20.0)

leaf_l, rib_l = leaf(79, 130, 46, 198, 18, side=1)
leaf_r, rib_r = leaf(81, 154, 42, -14, 16, side=-1)

svg = f'''<svg class="rose" viewBox="0 0 160 210" width="100" height="131" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="rsBack" x1=".2" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="var(--petal2)"/><stop offset="1" stop-color="var(--petal)"/>
    </linearGradient>
    <linearGradient id="rsMid" x1=".3" y1="0" x2=".7" y2="1">
      <stop offset="0" stop-color="var(--petal2)"/><stop offset="1" stop-color="var(--petalDeep,#8e4753)"/>
    </linearGradient>
    <linearGradient id="rsLeaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="var(--leaf2,#7da98a)"/><stop offset="1" stop-color="var(--leaf)"/>
    </linearGradient>
  </defs>

  <path d="M80 110 C83 138 78 166 80 204" fill="none" stroke="var(--leaf)" stroke-width="3.6" stroke-linecap="round"/>
  <path d="{leaf_l}" fill="url(#rsLeaf)"/>
  <path d="{rib_l}" fill="none" stroke="var(--leaf)" stroke-width="1.3" opacity=".4"/>
  <path d="{leaf_r}" fill="url(#rsLeaf)"/>
  <path d="{rib_r}" fill="none" stroke="var(--leaf)" stroke-width="1.3" opacity=".4"/>

  <g opacity=".85" fill="var(--leaf)">
    <path d="M80 116 C71 114 65 107 63 98 C71 101 77 107 80 116Z"/>
    <path d="M80 116 C89 114 95 107 97 98 C89 101 83 107 80 116Z"/>
  </g>

  <g fill="url(#rsBack)">
    <path d="{back[0]}"/><path d="{back[1]}"/><path d="{back[2]}"/><path d="{back[3]}"/><path d="{back[4]}"/>
  </g>
  <g fill="url(#rsMid)" opacity=".88">
    <path d="{mid[0]}"/><path d="{mid[1]}"/><path d="{mid[2]}"/><path d="{mid[3]}"/><path d="{mid[4]}"/>
  </g>
  <circle cx="{CX}" cy="{CY}" r="21" fill="url(#rsMid)"/>
  <g fill="var(--petal)" opacity=".75">
    <path d="{inner[0]}"/><path d="{inner[1]}"/><path d="{inner[2]}"/>
  </g>
  <path d="{heart}" fill="none" stroke="var(--petal2)" stroke-width="4.2" stroke-linecap="round" opacity=".95"/>
</svg>
'''
open('/home/claude/rose/rose.svg', 'w', encoding='utf-8').write(svg)
print('rose.svg written,', len(svg), 'bytes')
