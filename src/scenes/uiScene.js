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
    this.wordWrapTempText = null; // Cache for word wrap calculations
  }

  create() {
    // This scene is created after world scene
    // It will be launched when needed
  }

  init(data) {
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
      escKey: null
    };

    // Create modal elements
    this.createOverlay(width, height);
    this.createModalBackground(width, height, modalDimensions);
    this.createTitle(width, height, locationData.title, modalDimensions);
    
    let currentY = this.modal.title.y;
    currentY = this.createYear(width, locationData.year, currentY);
    currentY = this.createDescription(width, locationData.description, currentY, modalDimensions.width);
    currentY = this.createSkillsSection(width, locationData.skills, currentY);
    currentY = this.createLinks(width, locationData.links, currentY);
    this.createResumeButton(width, locationId, currentY);
    this.createCloseButton(width, height, modalDimensions);
    this.setupKeyboardListeners();
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
    const descText = this.wordWrap(descriptionText || '', modalWidth - UIScene.STYLES.SIZES.CONTENT_PADDING);
    const hasYear = !!this.modal.year;
    const spacing = hasYear ? UIScene.STYLES.SIZES.YEAR_DESC_SPACING : UIScene.STYLES.SIZES.DESC_SPACING;
    
    const description = this.add.text(
      width / 2,
      startY + spacing,
      descText,
      {
        font: UIScene.STYLES.FONTS.DESCRIPTION,
        fill: UIScene.STYLES.COLORS.TEXT,
        align: 'center',
        wordWrap: { width: modalWidth - UIScene.STYLES.SIZES.CONTENT_PADDING }
      }
    );
    description.setOrigin(0.5, 0);
    description.setScrollFactor(0);
    
    this.modal.elements.push(description);
    this.modal.description = description;
    return description.y + description.height;
  }

  createSkillsSection(width, skills, startY) {
    if (!skills || skills.length === 0) return startY;
    
    const currentY = startY + UIScene.STYLES.SIZES.SKILLS_SPACING;
    
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
    
    const currentY = startY + UIScene.STYLES.SIZES.LINK_SPACING;
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
    button.on('pointerdown', onClick);
    
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
    
    const resumeY = startY + UIScene.STYLES.SIZES.RESUME_SPACING;
    
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
      window.open('/resume.pdf', '_blank', 'noopener,noreferrer');
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
    
    closeBtn.on('pointerdown', () => this.closeModal());
    
    this.modal.elements.push(closeBtn, closeText);
    this.modal.closeBtn = closeBtn;
    this.modal.closeText = closeText;
  }

  setupKeyboardListeners() {
    const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.once('down', () => this.closeModal());
    this.modal.escKey = escKey;
  }

  wordWrap(text, maxWidth) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Create cached temp text object if it doesn't exist
    if (!this.wordWrapTempText) {
      this.wordWrapTempText = this.add.text(-1000, -1000, '', {
        font: UIScene.STYLES.FONTS.DESCRIPTION
      });
    }
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      this.wordWrapTempText.setText(testLine);
      
      if (this.wordWrapTempText.width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join('\n');
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
    this.destroyModal();

    // Resume world scene movement
    const worldScene = this.scene.get('WorldScene');
    if (worldScene?.resumeMovement) {
      worldScene.resumeMovement();
    }

    this.scene.stop();
  }
}

