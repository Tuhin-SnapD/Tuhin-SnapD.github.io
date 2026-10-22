import Phaser from 'phaser';

export const FONT = 'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const C = {
  ink: 0x070a18,
  panel: 0x0d1329,
  panelSoft: 0x121a36,
  violet: 0x7c5cff,
  cyan: 0x22d3ee,
  pink: 0xf472b6,
  amber: 0xfbbf24,
  mint: 0x34d399,
  blue: 0x60a5fa,
  text: '#e9edf9',
  muted: '#98a2c2',
  dim: '#6f7a9c'
};

export const ACCENTS = [C.violet, C.cyan, C.pink, C.amber, C.mint, C.blue, 0xa78bfa, 0xf97316];

export const css = (n) => '#' + n.toString(16).padStart(6, '0');

/** Vertical or horizontal linear-gradient canvas texture. */
export function gradientTexture(scene, key, w, h, stops, direction = 'v') {
  if (scene.textures.exists(key)) return scene.textures.get(key);
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const g = direction === 'v'
    ? ctx.createLinearGradient(0, 0, 0, h)
    : ctx.createLinearGradient(0, 0, w, 0);
  for (const [pos, color] of stops) g.addColorStop(pos, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  tex.refresh();
  return tex;
}

/** Radial-gradient canvas texture (glow / soft shadow / spark). */
export function radialTexture(scene, key, w, h, stops) {
  if (scene.textures.exists(key)) return scene.textures.get(key);
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
  for (const [pos, color] of stops) g.addColorStop(pos, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  tex.refresh();
  return tex;
}

/** Draw a centered rounded panel into a Graphics object. */
export function drawPanel(g, w, h, radius, fill, fillAlpha, stroke, strokeAlpha, strokeWidth = 1) {
  g.clear();
  g.fillStyle(fill, fillAlpha);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
  if (strokeAlpha > 0) {
    g.lineStyle(strokeWidth, stroke, strokeAlpha);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
  }
  return g;
}

/**
 * Glass pill/button. Returns the container plus its parts.
 * `parent` lets the button live inside another container (modal).
 */
export function makeButton(scene, x, y, w, h, label, opts = {}) {
  const {
    parent = null,
    radius = Math.min(h / 2, 18),
    fill = 0xffffff,
    fillAlpha = 0.07,
    hoverFillAlpha = 0.14,
    stroke = 0xffffff,
    strokeAlpha = 0.16,
    hoverStrokeAlpha = 0.34,
    color = C.text,
    hoverColor = '#ffffff',
    fontSize = 14,
    fontStyle = '600',
    onClick = null
  } = opts;

  const container = scene.add.container(x, y);
  const bg = scene.add.graphics();
  drawPanel(bg, w, h, radius, fill, fillAlpha, stroke, strokeAlpha);
  const text = scene.add.text(0, 0, label, {
    fontFamily: FONT,
    fontSize: `${fontSize}px`,
    fontStyle,
    color,
    align: 'center'
  }).setOrigin(0.5);

  container.add([bg, text]);
  container.setSize(w, h);
  container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
  container.input.cursor = 'pointer';

  container.on('pointerover', () => {
    drawPanel(bg, w, h, radius, fill, hoverFillAlpha, stroke, hoverStrokeAlpha);
    text.setColor(hoverColor);
    scene.tweens.add({ targets: container, scale: 1.03, duration: 140, ease: 'Power2' });
  });
  container.on('pointerout', () => {
    drawPanel(bg, w, h, radius, fill, fillAlpha, stroke, strokeAlpha);
    text.setColor(color);
    scene.tweens.add({ targets: container, scale: 1, duration: 140, ease: 'Power2' });
  });
  container.on('pointerdown', () => {
    scene.tweens.add({ targets: container, scale: 0.96, duration: 80, yoyo: true, ease: 'Power2' });
    if (onClick) onClick();
  });

  if (parent) parent.add(container);

  return { container, bg, text, redraw: () => drawPanel(bg, w, h, radius, fill, fillAlpha, stroke, strokeAlpha) };
}

/** Small transient message at the bottom of the screen. */
export function showToast(scene, message) {
  if (scene._toast) scene._toast.destroy();

  const cam = scene.cameras.main;
  const container = scene.add.container(cam.width / 2, cam.height - 80)
    .setScrollFactor(0)
    .setDepth(9000)
    .setAlpha(0);
  const bg = scene.add.graphics();
  const text = scene.add.text(0, 0, message, {
    fontFamily: FONT,
    fontSize: '14px',
    fontStyle: '500',
    color: C.text
  }).setOrigin(0.5);
  const w = text.width + 40;
  drawPanel(bg, w, 40, 20, C.panel, 0.96, 0xffffff, 0.16);
  container.add([bg, text]);
  container.setSize(w, 40);
  scene._toast = container;

  scene.tweens.add({ targets: container, alpha: 1, y: cam.height - 96, duration: 220, ease: 'Power2' });
  scene.tweens.add({
    targets: container,
    alpha: 0,
    delay: 2000,
    duration: 320,
    onComplete: () => {
      container.destroy();
      if (scene._toast === container) scene._toast = null;
    }
  });
}

/** HEAD request that also rejects Vite/SPA HTML fallbacks. */
export async function resumeExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const type = res.headers.get('content-type') || '';
    return res.ok && !type.includes('text/html');
  } catch {
    return false;
  }
}
