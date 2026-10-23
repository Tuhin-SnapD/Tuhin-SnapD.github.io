import Phaser from 'phaser';
import { C, FONT, ACCENTS, drawPanel, makeButton, showToast } from '../ui/theme.js';

const ZONE_ORDER = ['childhood', 'school', 'college', 'firstJob', 'current', 'skills', 'projects', 'future'];

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
    this.modal = null;
    this.pending = null;
    this.resumeUrl = '/resume.pdf';
    this.resumeAvailable = false;
    this.closing = false;
  }

  init(data) {
    this.pending = data || null;
    this.resumeUrl = data?.resumeUrl || '/resume.pdf';
    this.resumeAvailable = !!data?.resumeAvailable;
    this.closing = false;
  }

  create() {
    if (this.pending?.locationData) {
      this.showModal(this.pending.locationData, this.pending.locationId);
    }
    this.pending = null;

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard.off('keydown-ESC', this.closeModal, this);
    });
  }

  showModal(locationData, locationId) {
    if (!locationData || !locationData.title) {
      console.warn('Invalid location data provided to modal');
      return;
    }

    const { width, height } = this.cameras.main;
    const index = Math.max(0, ZONE_ORDER.indexOf(locationId));
    const accent = ACCENTS[index % ACCENTS.length];

    const panelW = Math.min(620, width * 0.9);
    const maxPanelH = Math.min(620, height * 0.86);
    const maxTextW = panelW - 80;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x050814, 0.72)
      .setScrollFactor(0)
      .setDepth(0)
      .setAlpha(0)
      .setInteractive();
    overlay.on('pointerdown', () => this.closeModal());

    const root = this.add.container(width / 2, height / 2).setDepth(1).setScrollFactor(0);
    const content = this.add.container(0, 0);
    root.add(content);

    let y = 0;

    const eyebrow = this.add.text(0, y, `STOP ${String(index + 1).padStart(2, '0')} / 08`, {
      fontFamily: FONT,
      fontSize: '11px',
      fontStyle: '700',
      color: '#a78bfa'
    }).setOrigin(0, 0);
    content.add(eyebrow);
    y += eyebrow.height + 12;

    const title = this.add.text(0, y, locationData.title, {
      fontFamily: FONT,
      fontSize: '30px',
      fontStyle: '700',
      color: '#ffffff',
      wordWrap: { width: maxTextW },
      lineSpacing: 2
    }).setOrigin(0, 0);
    content.add(title);
    y += title.height + 14;

    if (locationData.year) {
      const yearText = this.add.text(0, 0, locationData.year, {
        fontFamily: FONT,
        fontSize: '12.5px',
        fontStyle: '600',
        color: '#c4b5fd'
      }).setOrigin(0.5);
      const pillW = yearText.width + 26;
      const pillBg = this.add.graphics();
      drawPanel(pillBg, pillW, 26, 13, accent, 0.16, accent, 0.35);
      const pill = this.add.container(pillW / 2, y + 13, [pillBg, yearText]);
      content.add(pill);
      y += 26 + 22;
    }

    if (locationData.description) {
      const desc = this.add.text(0, y, locationData.description, {
        fontFamily: FONT,
        fontSize: '15.5px',
        fontStyle: '400',
        color: '#c3cbe3',
        lineSpacing: 7,
        wordWrap: { width: maxTextW }
      }).setOrigin(0, 0);
      content.add(desc);
      y += desc.height + 24;
    }

    if (locationData.skills?.length) {
      const label = this.add.text(0, y, 'TOOLKIT', {
        fontFamily: FONT,
        fontSize: '10.5px',
        fontStyle: '700',
        color: C.dim
      }).setOrigin(0, 0);
      content.add(label);
      y += label.height + 12;

      let cx = 0;
      for (const skill of locationData.skills) {
        const chipText = this.add.text(0, 0, skill, {
          fontFamily: FONT,
          fontSize: '13px',
          fontStyle: '500',
          color: '#dbe2f5'
        }).setOrigin(0.5);
        const chipW = chipText.width + 24;
        const chipH = 30;

        if (cx + chipW > maxTextW) {
          cx = 0;
          y += chipH + 8;
        }

        const chipBg = this.add.graphics();
        drawPanel(chipBg, chipW, chipH, 15, 0xffffff, 0.06, 0xffffff, 0.12);
        const chip = this.add.container(cx + chipW / 2, y + chipH / 2, [chipBg, chipText]);
        content.add(chip);
        cx += chipW + 8;
      }
      y += 30 + 24;
    }

    if (locationData.links?.length) {
      const gap = 10;
      const linkW = (maxTextW - gap * (locationData.links.length - 1)) / locationData.links.length;
      locationData.links.forEach((link, i) => {
        const btn = makeButton(this, i * (linkW + gap) + linkW / 2, y + 22, linkW, 44, link.text, {
          parent: content,
          radius: 12,
          fill: accent,
          fillAlpha: 0.14,
          hoverFillAlpha: 0.26,
          stroke: accent,
          strokeAlpha: 0.42,
          hoverStrokeAlpha: 0.7,
          color: '#ffffff',
          fontSize: 13,
          onClick: () => window.open(link.url, '_blank', 'noopener,noreferrer')
        });
      });
      y += 44 + 16;
    }

    if (locationId === 'projects') {
      const btn = makeButton(this, 100, y + 23, 200, 46, '↓  Download resume', {
        parent: content,
        radius: 23,
        fill: accent,
        fillAlpha: 0.95,
        hoverFillAlpha: 1,
        stroke: 0xffffff,
        strokeAlpha: 0.2,
        hoverStrokeAlpha: 0.4,
        color: '#ffffff',
        fontSize: 14,
        onClick: () => {
          if (this.resumeAvailable) {
            window.open(this.resumeUrl, '_blank', 'noopener,noreferrer');
          } else {
            showToast(this, 'Resume not uploaded yet');
          }
        }
      });
      y += 46;
    }

    const contentH = y;
    const panelH = Math.min(maxPanelH, Math.max(340, contentH + 96));
    const panelWFinal = panelW;

    content.x = -panelWFinal / 2 + 40;
    content.y = -panelH / 2 + 48;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x02040e, 0.55);
    shadow.fillRoundedRect(-panelWFinal / 2 + 4, -panelH / 2 + 16, panelWFinal, panelH, 24);

    const glow = this.add.image(0, 0, 'glow')
      .setScale(3.1, 2.1)
      .setTint(accent)
      .setAlpha(0.12)
      .setBlendMode(Phaser.BlendModes.ADD);

    const panel = this.add.graphics();
    drawPanel(panel, panelWFinal, panelH, 24, C.panel, 0.94, 0xffffff, 0.13, 1.5);

    const accentBar = this.add.graphics();
    accentBar.fillStyle(accent, 0.95);
    accentBar.fillRoundedRect(-panelWFinal / 2 + 40, -panelH / 2 + 26, 46, 3, 1.5);

    root.addAt(accentBar, 0);
    root.addAt(panel, 0);
    root.addAt(glow, 0);
    root.addAt(shadow, 0);

    const close = makeButton(this, panelWFinal / 2 - 30, -panelH / 2 + 30, 36, 36, '✕', {
      parent: root,
      radius: 18,
      fill: 0xffffff,
      fillAlpha: 0.06,
      hoverFillAlpha: 0.14,
      stroke: 0xffffff,
      strokeAlpha: 0.14,
      hoverStrokeAlpha: 0.3,
      color: C.muted,
      hoverColor: '#ffffff',
      fontSize: 15,
      onClick: () => this.closeModal()
    });

    this.modal = {
      overlay,
      root,
      panel,
      close,
      content,
      accent,
      panelW: panelWFinal,
      panelH,
      contentH,
      closing: false
    };

    this.input.keyboard.off('keydown-ESC', this.closeModal, this);
    this.input.keyboard.on('keydown-ESC', this.closeModal, this);

    root.setAlpha(0);
    root.setScale(0.96);
    root.y = height / 2 + 14;
    this.tweens.add({ targets: overlay, alpha: 1, duration: 260, ease: 'Power2' });
    this.tweens.add({
      targets: root,
      alpha: 1,
      scale: 1,
      y: height / 2,
      duration: 340,
      ease: 'Back.easeOut'
    });
  }

  closeModal() {
    if (!this.modal || this.modal.closing) return;
    this.modal.closing = true;

    this.input.keyboard.off('keydown-ESC', this.closeModal, this);
    this.tweens.killTweensOf([this.modal.root, this.modal.overlay]);

    const { root, overlay } = this.modal;
    this.tweens.add({ targets: overlay, alpha: 0, duration: 220, ease: 'Power2' });
    this.tweens.add({
      targets: root,
      alpha: 0,
      scale: 0.97,
      duration: 220,
      ease: 'Power2',
      onComplete: () => {
        this.destroyModal();

        const worldScene = this.scene.get('WorldScene');
        if (worldScene?.resumeMovement) worldScene.resumeMovement();

        this.scene.stop();
      }
    });
  }

  resumeMovement() {
    // Kept for symmetry; WorldScene exposes resumeMovement too.
    const worldScene = this.scene.get('WorldScene');
    if (worldScene?.resumeMovement) worldScene.resumeMovement();
  }

  destroyModal() {
    if (!this.modal) return;

    this.tweens.killTweensOf([this.modal.root, this.modal.overlay]);
    this.modal.root?.destroy(true);
    this.modal.overlay?.destroy();
    this.modal = null;
  }
}
