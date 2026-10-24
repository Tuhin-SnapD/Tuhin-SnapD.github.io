import Phaser from 'phaser';
import { C, FONT, ACCENTS, drawPanel, makeButton, showToast } from '../ui/theme.js';

const ZONE_ORDER = ['childhood', 'school', 'college', 'firstJob', 'current', 'skills', 'projects', 'future'];

const PANEL_PAD_X = 40;
const PANEL_PAD_TOP = 48;
const PANEL_PAD_BOTTOM = 32;

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
    this.modal = null;
    this.modalData = null;
    this.modalHandlers = null;
    this.pending = null;
    this.resumeUrl = '/resume.pdf';
    this.resumeAvailable = false;
    this.closing = false;
    this.drag = null;
  }

  init(data) {
    this.pending = data || null;
    this.resumeUrl = data?.resumeUrl || '/resume.pdf';
    this.resumeAvailable = !!data?.resumeAvailable;
    this.closing = false;
    this.modalData = null;
  }

  create() {
    if (this.pending?.locationData) {
      this.modalData = {
        locationData: this.pending.locationData,
        locationId: this.pending.locationId
      };
      this.showModal(this.pending.locationData, this.pending.locationId);
    }
    this.pending = null;

    this.scale.on('resize', this.handleResize, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard.off('keydown-ESC', this.closeModal, this);
      this.scale.off('resize', this.handleResize, this);
      this.clearModalInput();
    });
  }

  handleResize() {
    if (!this.modal || this.modal.closing || !this.modalData) return;

    // Rebuild on resize/orientation change so the panel, mask and wrapped text
    // all use the new viewport dimensions.
    this.destroyModal();
    this.showModal(this.modalData.locationData, this.modalData.locationId);
  }

  showModal(locationData, locationId) {
    if (!locationData || !locationData.title) {
      console.warn('Invalid location data provided to modal');
      return;
    }

    const { width, height } = this.cameras.main;
    const index = Math.max(0, ZONE_ORDER.indexOf(locationId));
    const accent = ACCENTS[index % ACCENTS.length];

    const panelW = Math.min(620, width - 32);
    const maxPanelH = Math.min(620, height - 24);
    const maxTextW = panelW - PANEL_PAD_X * 2;

    const overlay = this.add.rectangle(0, 0, width, height, 0x050814, 0.72)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0)
      .setAlpha(0)
      .setInteractive();
    overlay.on('pointerdown', () => this.closeModal());

    const content = this.add.container(0, 0);

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
        makeButton(this, i * (linkW + gap) + linkW / 2, y + 22, linkW, 44, link.text, {
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
      makeButton(this, 100, y + 23, 200, 46, '↓  Download resume', {
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
    const panelH = Math.min(maxPanelH, Math.max(300, contentH + 88));
    const contentLocalX = -panelW / 2 + PANEL_PAD_X;
    const contentLocalY = -panelH / 2 + PANEL_PAD_TOP;
    const viewportH = Math.max(80, panelH - PANEL_PAD_TOP - PANEL_PAD_BOTTOM);
    const maxScroll = Math.max(0, contentH - viewportH);

    content.setPosition(contentLocalX, contentLocalY);

    const root = this.add.container(width / 2, height / 2).setDepth(1).setScrollFactor(0);

    // Absorbs clicks so tapping inside the panel doesn't dismiss the modal.
    const blocker = this.add.rectangle(0, 0, panelW, panelH, 0x000000, 0.001).setInteractive();

    const shadow = this.add.graphics();
    shadow.fillStyle(0x02040e, 0.55);
    shadow.fillRoundedRect(-panelW / 2 + 4, -panelH / 2 + 16, panelW, panelH, 24);

    const glow = this.add.image(0, 0, 'glow')
      .setScale(3.1, 2.1)
      .setTint(accent)
      .setAlpha(0.12)
      .setBlendMode(Phaser.BlendModes.ADD);

    const panel = this.add.graphics();
    drawPanel(panel, panelW, panelH, 24, C.panel, 0.94, 0xffffff, 0.13, 1.5);

    const accentBar = this.add.graphics();
    accentBar.fillStyle(accent, 0.95);
    accentBar.fillRoundedRect(-panelW / 2 + 40, -panelH / 2 + 26, 46, 3, 1.5);

    root.add([blocker, shadow, glow, panel, accentBar, content]);

    const close = makeButton(this, panelW / 2 - 30, -panelH / 2 + 30, 36, 36, '✕', {
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
    close.container.input.hitArea.setTo(-24, -24, 48, 48);

    // Clip scrolling content to the panel's inner area.
    const maskShape = this.make.graphics({ add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(width / 2 + contentLocalX, height / 2 + contentLocalY, maxTextW, viewportH);
    content.setMask(maskShape.createGeometryMask());

    let scrollHint = null;
    if (maxScroll > 0) {
      scrollHint = this.add.text(panelW / 2 - 26, panelH / 2 - 18, 'SCROLL ↓', {
        fontFamily: FONT,
        fontSize: '10px',
        fontStyle: '700',
        color: C.dim
      }).setOrigin(1, 0.5).setAlpha(0.65);
      root.add(scrollHint);
    }

    this.modal = {
      overlay,
      root,
      panel,
      close,
      content,
      blocker,
      maskShape,
      scrollHint,
      accent,
      panelW,
      panelH,
      contentH,
      contentLocalY,
      viewportH,
      maxScroll,
      scroll: 0,
      closing: false
    };

    this.attachModalInput(blocker);

    this.input.keyboard.off('keydown-ESC', this.closeModal, this);
    this.input.keyboard.on('keydown-ESC', this.closeModal, this);

    root.setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 220, ease: 'Power2' });
    this.tweens.add({ targets: root, alpha: 1, duration: 260, ease: 'Power2' });
  }

  attachModalInput(blocker) {
    const onPointerDown = (pointer) => {
      if (!this.modal) return;
      this.drag = { y: pointer.y, scroll: this.modal.scroll };
    };
    const onPointerMove = (pointer) => {
      if (!this.modal || !this.drag || !pointer.isDown) return;
      const dy = pointer.y - this.drag.y;
      this.setScroll(this.drag.scroll - dy);
    };
    const onPointerUp = () => {
      this.drag = null;
    };
    const onWheel = (pointer, over, dx, dy) => {
      if (!this.modal || this.modal.maxScroll <= 0) return;
      this.setScroll(this.modal.scroll + dy * 0.6);
    };

    blocker.on('pointerdown', onPointerDown);
    this.input.on('pointermove', onPointerMove);
    this.input.on('pointerup', onPointerUp);
    this.input.on('wheel', onWheel);

    this.modalHandlers = { onPointerMove, onPointerUp, onWheel };
  }

  setScroll(value) {
    if (!this.modal) return;
    const scroll = Phaser.Math.Clamp(value, 0, this.modal.maxScroll);
    this.modal.scroll = scroll;
    this.modal.content.y = this.modal.contentLocalY - scroll;
    this.modal.scrollHint?.setAlpha(scroll > 6 ? 0 : 0.65);
  }

  clearModalInput() {
    if (!this.modalHandlers) return;
    this.input.off('pointermove', this.modalHandlers.onPointerMove);
    this.input.off('pointerup', this.modalHandlers.onPointerUp);
    this.input.off('wheel', this.modalHandlers.onWheel);
    this.modalHandlers = null;
    this.drag = null;
  }

  closeModal() {
    if (!this.modal || this.modal.closing) return;
    this.modal.closing = true;

    this.input.keyboard.off('keydown-ESC', this.closeModal, this);

    const { root, overlay } = this.modal;
    this.tweens.killTweensOf([root, overlay]);

    this.tweens.add({ targets: overlay, alpha: 0, duration: 200, ease: 'Power2' });
    this.tweens.add({
      targets: root,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.destroyModal();

        const worldScene = this.scene.get('WorldScene');
        if (worldScene?.resumeMovement) worldScene.resumeMovement();

        this.scene.stop();
      }
    });
  }

  destroyModal() {
    if (!this.modal) return;

    this.tweens.killTweensOf([this.modal.root, this.modal.overlay]);
    this.clearModalInput();

    try {
      this.modal.content.clearMask(true);
    } catch (error) {
      // Mask may already be gone during shutdown.
    }
    this.modal.maskShape?.destroy();
    this.modal.root?.destroy(true);
    this.modal.overlay?.destroy();
    this.modal = null;
  }
}
