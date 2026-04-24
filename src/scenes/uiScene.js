export default class UIScene extends Phaser.Scene {
  // Styling constants
  static STYLES = {
    COLORS: {
      OVERLAY: 0x000000,
      MODAL_BG: 0x1a1a2e,
      MODAL_BORDER: 0x4ade80,
      TITLE: '#4ade80',
      YEAR: '#a78bfa',
      TEXT: '#ffffff',
      SKILLS_TITLE: '#60a5fa',
      SKILLS_ITEM: '#d1d5db',
      LINK_BG: 0x3b82f6,
      RESUME_BG: 0x818cf8,
      CLOSE_BG: 0xef4444,
      STROKE: 0xffffff
    },
    FONTS: {
      TITLE: 'bold 28px monospace',
      YEAR: '16px monospace',
      DESCRIPTION: '16px monospace',
      SKILLS_TITLE: 'bold 18px monospace',
      SKILLS_ITEM: '14px monospace',
      LINK: '12px monospace',
      RESUME: '14px monospace',
      CLOSE: 'bold 32px monospace'
    },
    SIZES: {
      MODAL_WIDTH_MAX: 600,
      MODAL_WIDTH_RATIO: 0.9,
      MODAL_HEIGHT_MAX: 600,
      MODAL_HEIGHT_RATIO: 0.85,
      MODAL_PADDING: 30,
      CONTENT_PADDING: 60,
      CLOSE_BUTTON_SIZE: 40,
      CLOSE_BUTTON_OFFSET: 30,
      TITLE_OFFSET: 30,
      YEAR_SPACING: 35,
      DESC_SPACING: 50,
      YEAR_DESC_SPACING: 70,
      SKILLS_SPACING: 20,
      SKILLS_ITEM_SPACING: 25,
      SKILLS_TITLE_SPACING: 30,
      LINK_SPACING: 20,
      LINK_BUTTON_WIDTH: 70,
      LINK_BUTTON_HEIGHT: 40,
      LINK_BUTTON_GAP: 80,
      RESUME_BUTTON_WIDTH: 150,
      RESUME_BUTTON_HEIGHT: 40,
      RESUME_SPACING: 20
    },
    OPACITY: {
      OVERLAY: 0.7,
      MODAL_BG: 0.95,
      LINK_BUTTON: 0.8,
      RESUME_BUTTON: 0.8,
      CLOSE_BUTTON: 0.8
    },
    STROKE_WIDTH: {
      MODAL: 2,
      LINK_BUTTON: 1,
      CLOSE_BUTTON: 2
    }
  };

  constructor() {
    super({ key: 'UIScene' });
    this.modal = null;
    this.currentLocationData = null;
    this.resumeUrl = '/resume.pdf';
  }

  create() {
    // This scene is created after world scene
    // It will be launched when needed
  }

  init(data) {
    if (data?.resumeUrl) this.resumeUrl = data.resumeUrl;
    if (data?.locationData) {
      this.currentLocationData = data.locationData;
      this.showModal(data.locationData, data.locationId);
    }
  }

  showModal(locationData, locationId) {
    // Validate input
    if (!locationData || !locationData.title) {
      console.warn('Invalid location data provided to modal');
      return;
    }

    // Clean up any existing modal first
    this.destroyModal();

    const { width, height } = this.cameras.main;
    const modalDimensions = this.calculateModalDimensions(width, height);

    // Initialize modal object
    this.modal = {
      elements: [],
      escKey: null,
      modalTop: height / 2 - modalDimensions.height / 2,
      modalBottom: height / 2 + modalDimensions.height / 2,
      modalLeft: width / 2 - modalDimensions.width / 2,
      modalRight: width / 2 + modalDimensions.width / 2
    };

    // Create modal elements with animations
    this.createOverlay(width, height);
    this.createModalBackground(width, height, modalDimensions);
    this.createTitle(width, height, locationData.title, modalDimensions);
    
    // Start content below the title (title origin is 0.5, so y is center; add half height to get bottom)
    let currentY = this.modal.title.y + this.modal.title.height / 2;
    currentY = this.createYear(width, locationData.year, currentY);
    currentY = this.createDescription(width, locationData.description, currentY, modalDimensions.width);
    currentY = this.createSkillsSection(width, locationData.skills, currentY);
    currentY = this.createLinks(width, locationData.links, currentY);
    this.createResumeButton(width, locationId, currentY);
    this.createCloseButton(width, height, modalDimensions);
    this.setupKeyboardListeners();
    
    // Animate modal entrance
    this.animateModalEntrance();
  }
  
  animateModalEntrance() {
    if (!this.modal || !this.modal.modalBg) return;
    
    // Start with modal scaled down and transparent
    const initialScale = 0.5;
    const initialAlpha = 0;
    
    this.modal.modalBg.setScale(initialScale);
    this.modal.modalBg.setAlpha(initialAlpha);
    this.modal.overlay.setAlpha(0);
    
    // Animate overlay fade in
    this.tweens.add({
      targets: this.modal.overlay,
      alpha: UIScene.STYLES.OPACITY.OVERLAY,
      duration: 300,
      ease: 'Power2'
    });
    
    // Animate modal scale and fade in
    this.tweens.add({
      targets: this.modal.modalBg,
      scale: 1,
      alpha: UIScene.STYLES.OPACITY.MODAL_BG,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Animate content elements appearing
        this.animateContentEntrance();
      }
    });
  }
  
  animateContentEntrance() {
    if (!this.modal) return;
    
    const elements = [
      this.modal.title,
      this.modal.year,
      this.modal.description,
      this.modal.skillsTitle,
      ...(this.modal.skillsList || []),
      ...(this.modal.linkButtons || []),
      this.modal.closeBtn
    ].filter(el => el);
    
    elements.forEach((element, index) => {
      if (element) {
        element.setAlpha(0);
        element.setY(element.y - 20);
        this.tweens.add({
          targets: element,
          alpha: 1,
          y: element.y + 20,
          duration: 300,
          delay: index * 50,
          ease: 'Power2'
        });
      }
    });
  }

  calculateModalDimensions(screenWidth, screenHeight) {
    return {
      width: Math.min(
        UIScene.STYLES.SIZES.MODAL_WIDTH_MAX,
        screenWidth * UIScene.STYLES.SIZES.MODAL_WIDTH_RATIO
      ),
      height: Math.min(
        UIScene.STYLES.SIZES.MODAL_HEIGHT_MAX,
        screenHeight * UIScene.STYLES.SIZES.MODAL_HEIGHT_RATIO
      )
    };
  }

  createOverlay(width, height) {
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      UIScene.STYLES.COLORS.OVERLAY,
      UIScene.STYLES.OPACITY.OVERLAY
    );
    overlay.setScrollFactor(0);
    overlay.setInteractive();
    overlay.on('pointerdown', () => this.closeModal());
    
    this.modal.elements.push(overlay);
    this.modal.overlay = overlay;
  }

  createModalBackground(width, height, { width: modalWidth, height: modalHeight }) {
    const modalBg = this.add.rectangle(
      width / 2,
      height / 2,
      modalWidth,
      modalHeight,
      UIScene.STYLES.COLORS.MODAL_BG,
      UIScene.STYLES.OPACITY.MODAL_BG
    );
    modalBg.setScrollFactor(0);
    modalBg.setStrokeStyle(
      UIScene.STYLES.STROKE_WIDTH.MODAL,
      UIScene.STYLES.COLORS.MODAL_BORDER
    );
    
    this.modal.elements.push(modalBg);
    this.modal.modalBg = modalBg;
  }

  createTitle(width, height, titleText, { height: modalHeight }) {
    const title = this.add.text(
      width / 2,
      height / 2 - modalHeight / 2 + UIScene.STYLES.SIZES.TITLE_OFFSET,
      titleText,
      {
        font: UIScene.STYLES.FONTS.TITLE,
        fill: UIScene.STYLES.COLORS.TITLE,
        align: 'center'
      }
    );
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    
    this.modal.elements.push(title);
    this.modal.title = title;
    return title;
  }

  createYear(width, year, startY) {
    if (!year) return startY;
    
    const yearText = this.add.text(
      width / 2,
      startY + UIScene.STYLES.SIZES.YEAR_SPACING,
      year,
      {
        font: UIScene.STYLES.FONTS.YEAR,
        fill: UIScene.STYLES.COLORS.YEAR,
        align: 'center'
      }
    );
    yearText.setOrigin(0.5);
    yearText.setScrollFactor(0);
    
    this.modal.elements.push(yearText);
    this.modal.year = yearText;
    return yearText.y;
  }

  createDescription(width, descriptionText, startY, modalWidth) {
    const hasYear = !!this.modal.year;
    const spacing = hasYear ? UIScene.STYLES.SIZES.YEAR_DESC_SPACING : UIScene.STYLES.SIZES.DESC_SPACING;

    const descriptionY = startY + spacing;
    const maxY = this.modal.modalBottom - UIScene.STYLES.SIZES.MODAL_PADDING;

    const description = this.add.text(
      width / 2,
      descriptionY,
      descriptionText || '',
      {
        font: UIScene.STYLES.FONTS.DESCRIPTION,
        fill: UIScene.STYLES.COLORS.TEXT,
        align: 'center',
        wordWrap: { width: modalWidth - UIScene.STYLES.SIZES.CONTENT_PADDING }
      }
    );
    description.setOrigin(0.5, 0);
    description.setScrollFactor(0);
    
    // Check if description extends beyond modal, and adjust if needed
    const descBottom = description.y + description.height;
    if (descBottom > maxY) {
      description.setY(maxY - description.height);
    }
    
    this.modal.elements.push(description);
    this.modal.description = description;
    return Math.max(description.y + description.height, descriptionY);
  }

  createSkillsSection(width, skills, startY) {
    if (!skills || skills.length === 0) return startY;
    
    const maxY = this.modal.modalBottom - UIScene.STYLES.SIZES.MODAL_PADDING;
    const currentY = startY + UIScene.STYLES.SIZES.SKILLS_SPACING;
    
    // Check if there's enough space for skills section
    if (currentY >= maxY) return startY;
    
    const skillsTitle = this.add.text(
      width / 2,
      currentY,
      'Skills:',
      {
        font: UIScene.STYLES.FONTS.SKILLS_TITLE,
        fill: UIScene.STYLES.COLORS.SKILLS_TITLE
      }
    );
    skillsTitle.setOrigin(0.5, 0);
    skillsTitle.setScrollFactor(0);
    
    this.modal.elements.push(skillsTitle);
    this.modal.skillsTitle = skillsTitle;
    
    let skillY = currentY + UIScene.STYLES.SIZES.SKILLS_TITLE_SPACING;
    const skillsList = [];
    
    skills.forEach(skill => {
      // Stop adding skills if we're running out of space
      if (skillY >= maxY) return;
      
      const skillText = this.add.text(
        width / 2,
        skillY,
        `• ${skill}`,
        {
          font: UIScene.STYLES.FONTS.SKILLS_ITEM,
          fill: UIScene.STYLES.COLORS.SKILLS_ITEM
        }
      );
      skillText.setOrigin(0.5, 0);
      skillText.setScrollFactor(0);
      
      this.modal.elements.push(skillText);
      skillsList.push(skillText);
      skillY += UIScene.STYLES.SIZES.SKILLS_ITEM_SPACING;
    });
    
    this.modal.skillsList = skillsList;
    return skillY;
  }

  createLinks(width, links, startY) {
    if (!links || links.length === 0) return startY;
    
    const maxY = this.modal.modalBottom - UIScene.STYLES.SIZES.MODAL_PADDING;
    const currentY = startY + UIScene.STYLES.SIZES.LINK_SPACING;
    
    // Check if there's enough space for links
    if (currentY + UIScene.STYLES.SIZES.LINK_BUTTON_HEIGHT > maxY) return startY;
    
    const totalLinksWidth = (links.length - 1) * UIScene.STYLES.SIZES.LINK_BUTTON_GAP;
    const linkStartX = width / 2 - totalLinksWidth / 2;
    const linkButtons = [];
    
    links.forEach((link, index) => {
      const linkBtn = this.createLinkButton(
        linkStartX + index * UIScene.STYLES.SIZES.LINK_BUTTON_GAP,
        currentY,
        link.text,
        () => window.open(link.url, '_blank', 'noopener,noreferrer')
      );
      linkButtons.push(linkBtn.button, linkBtn.text);
    });
    
    this.modal.linkButtons = linkButtons;
    return currentY + UIScene.STYLES.SIZES.LINK_BUTTON_HEIGHT;
  }

  createLinkButton(x, y, text, onClick) {
    const button = this.add.rectangle(
      x,
      y,
      UIScene.STYLES.SIZES.LINK_BUTTON_WIDTH,
      UIScene.STYLES.SIZES.LINK_BUTTON_HEIGHT,
      UIScene.STYLES.COLORS.LINK_BG,
      UIScene.STYLES.OPACITY.LINK_BUTTON
    );
    button.setScrollFactor(0);
    button.setStrokeStyle(
      UIScene.STYLES.STROKE_WIDTH.LINK_BUTTON,
      UIScene.STYLES.COLORS.STROKE
    );
    button.setInteractive({ useHandCursor: true });
    
    // Hover effects
    button.on('pointerover', () => {
      this.tweens.add({
        targets: button,
        scale: 1.1,
        fillTint: 0x60a5fa,
        duration: 150,
        ease: 'Power2'
      });
    });
    
    button.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scale: 1,
        fillTint: 0xffffff,
        duration: 150,
        ease: 'Power2'
      });
    });
    
    button.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: onClick
      });
    });
    
    const buttonText = this.add.text(x, y, text, {
      font: UIScene.STYLES.FONTS.LINK,
      fill: UIScene.STYLES.COLORS.TEXT,
      align: 'center'
    });
    buttonText.setOrigin(0.5);
    buttonText.setScrollFactor(0);
    
    this.modal.elements.push(button, buttonText);
    return { button, text: buttonText };
  }

  createResumeButton(width, locationId, startY) {
    if (locationId !== 'projects') return;
    
    const maxY = this.modal.modalBottom - UIScene.STYLES.SIZES.MODAL_PADDING;
    const resumeY = startY + UIScene.STYLES.SIZES.RESUME_SPACING;
    
    // Check if there's enough space for resume button
    if (resumeY + UIScene.STYLES.SIZES.RESUME_BUTTON_HEIGHT > maxY) return;
    
    const resumeBtn = this.add.rectangle(
      width / 2,
      resumeY,
      UIScene.STYLES.SIZES.RESUME_BUTTON_WIDTH,
      UIScene.STYLES.SIZES.RESUME_BUTTON_HEIGHT,
      UIScene.STYLES.COLORS.RESUME_BG,
      UIScene.STYLES.OPACITY.RESUME_BUTTON
    );
    resumeBtn.setScrollFactor(0);
    resumeBtn.setStrokeStyle(
      UIScene.STYLES.STROKE_WIDTH.LINK_BUTTON,
      UIScene.STYLES.COLORS.STROKE
    );
    resumeBtn.setInteractive({ useHandCursor: true });
    
    // Hover effects
    resumeBtn.on('pointerover', () => {
      this.tweens.add({
        targets: resumeBtn,
        scale: 1.05,
        fillTint: 0xa78bfa,
        duration: 150,
        ease: 'Power2'
      });
    });
    
    resumeBtn.on('pointerout', () => {
      this.tweens.add({
        targets: resumeBtn,
        scale: 1,
        fillTint: 0xffffff,
        duration: 150,
        ease: 'Power2'
      });
    });
    
    const resumeBtnText = this.add.text(
      resumeBtn.x,
      resumeBtn.y,
      '📄 Download Resume',
      {
        font: UIScene.STYLES.FONTS.RESUME,
        fill: UIScene.STYLES.COLORS.TEXT
      }
    );
    resumeBtnText.setOrigin(0.5);
    resumeBtnText.setScrollFactor(0);
    
    resumeBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: resumeBtn,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          window.open(this.resumeUrl, '_blank', 'noopener,noreferrer');
        }
      });
    });
    
    if (!this.modal.linkButtons) {
      this.modal.linkButtons = [];
    }
    this.modal.linkButtons.push(resumeBtn, resumeBtnText);
    this.modal.elements.push(resumeBtn, resumeBtnText);
  }

  createCloseButton(width, height, { width: modalWidth, height: modalHeight }) {
    const closeBtn = this.add.rectangle(
      width / 2 + modalWidth / 2 - UIScene.STYLES.SIZES.CLOSE_BUTTON_OFFSET,
      height / 2 - modalHeight / 2 + UIScene.STYLES.SIZES.TITLE_OFFSET,
      UIScene.STYLES.SIZES.CLOSE_BUTTON_SIZE,
      UIScene.STYLES.SIZES.CLOSE_BUTTON_SIZE,
      UIScene.STYLES.COLORS.CLOSE_BG,
      UIScene.STYLES.OPACITY.CLOSE_BUTTON
    );
    closeBtn.setScrollFactor(0);
    closeBtn.setStrokeStyle(
      UIScene.STYLES.STROKE_WIDTH.CLOSE_BUTTON,
      UIScene.STYLES.COLORS.STROKE
    );
    closeBtn.setInteractive({ useHandCursor: true });
    
    // Hover effects
    closeBtn.on('pointerover', () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 1.15,
        fillTint: 0xff6b6b,
        duration: 150,
        ease: 'Power2'
      });
    });
    
    closeBtn.on('pointerout', () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 1,
        fillTint: 0xffffff,
        duration: 150,
        ease: 'Power2'
      });
    });
    
    const closeText = this.add.text(
      closeBtn.x,
      closeBtn.y,
      '×',
      {
        font: UIScene.STYLES.FONTS.CLOSE,
        fill: UIScene.STYLES.COLORS.TEXT
      }
    );
    closeText.setOrigin(0.5);
    closeText.setScrollFactor(0);
    
    closeBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => this.closeModal()
      });
    });
    
    this.modal.elements.push(closeBtn, closeText);
    this.modal.closeBtn = closeBtn;
    this.modal.closeText = closeText;
  }

  setupKeyboardListeners() {
    const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.once('down', () => this.closeModal());
    this.modal.escKey = escKey;
  }

  destroyModal() {
    if (!this.modal) return;

    // Remove keyboard listener
    if (this.modal.escKey) {
      this.modal.escKey.removeAllListeners();
      this.modal.escKey = null;
    }

    // Destroy all elements using the elements array
    if (this.modal.elements) {
      this.modal.elements.forEach(element => {
        if (element && typeof element.destroy === 'function') {
          element.destroy();
        }
      });
    }

    // Clear references
    this.modal = null;
  }

  closeModal() {
    if (!this.modal) return;
    
    // Animate modal exit
    if (this.modal.modalBg) {
      this.tweens.add({
        targets: this.modal.modalBg,
        scale: 0.5,
        alpha: 0,
        duration: 300,
        ease: 'Back.easeIn'
      });
    }
    
    if (this.modal.overlay) {
      this.tweens.add({
        targets: this.modal.overlay,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          this.destroyModal();
          
          // Resume world scene movement
          const worldScene = this.scene.get('WorldScene');
          if (worldScene?.resumeMovement) {
            worldScene.resumeMovement();
          }

          this.scene.stop();
        }
      });
    } else {
      this.destroyModal();
      const worldScene = this.scene.get('WorldScene');
      if (worldScene?.resumeMovement) {
        worldScene.resumeMovement();
      }
      this.scene.stop();
    }
  }
}

