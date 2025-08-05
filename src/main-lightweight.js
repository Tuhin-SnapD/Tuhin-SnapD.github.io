import { gsap } from 'gsap';

class PortfolioLightweight {
  constructor() {
    this.canvas = document.getElementById('renderCanvas');
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.car = null;
    this.interactiveZones = [];
    this.keys = {};
    this.currentPosition = { x: 0, y: 0 };
    this.lastZoneCheck = 0;
    this.zoneCheckInterval = 100;
    
    this.init();
  }
  
  init() {
    this.createScene();
    this.createCar();
    this.setupControls();
    this.setupAnimations();
    
    // Hide loading screen
    document.getElementById('loading').style.display = 'none';
    
    // Start lightweight render loop
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });
    
    this.canvas.focus();
  }
  
  createScene() {
    // Create a simple 2D scene using CSS
    this.canvas.style.cssText = `
      position: relative;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      overflow: hidden;
    `;
    
    // Create ground grid
    this.createGroundGrid();
    
    // Create zone platforms
    this.createZonePlatforms();
    
    // Create decorative elements
    this.createDecorations();
  }
  
  createGroundGrid() {
    const grid = document.createElement('div');
    grid.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    `;
    this.canvas.appendChild(grid);
  }
  
  createZonePlatforms() {
    const zones = [
      { type: 'about', x: -15, y: -15, color: '#3366cc', label: 'About Me' },
      { type: 'projects', x: 15, y: -15, color: '#cc6633', label: 'Projects' },
      { type: 'resume', x: 0, y: 15, color: '#9933cc', label: 'Resume' }
    ];
    
    zones.forEach(zone => {
      const platform = document.createElement('div');
      platform.style.cssText = `
        position: absolute;
        width: 80px;
        height: 80px;
        background: ${zone.color};
        border-radius: 50%;
        transform: translate(-50%, -50%);
        left: ${50 + zone.x * 2}%;
        top: ${50 + zone.y * 2}%;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        cursor: pointer;
        z-index: 10;
      `;
      
      // Add label
      const label = document.createElement('div');
      label.textContent = zone.label;
      label.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 12px;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        white-space: nowrap;
      `;
      platform.appendChild(label);
      
      // Add hover effect
      platform.addEventListener('mouseenter', () => {
        platform.style.transform = 'translate(-50%, -50%) scale(1.1)';
        platform.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
      });
      
      platform.addEventListener('mouseleave', () => {
        platform.style.transform = 'translate(-50%, -50%) scale(1)';
        platform.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      });
      
      // Add click handler
      platform.addEventListener('click', () => {
        this.triggerZoneInteraction(zone.type);
      });
      
      this.canvas.appendChild(platform);
      
      this.interactiveZones.push({
        element: platform,
        type: zone.type,
        position: { x: zone.x, y: zone.y }
      });
    });
  }
  
  createDecorations() {
    // Create floating particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255,255,255,0.6);
        border-radius: 50%;
        animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
      
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      this.canvas.appendChild(particle);
    }
    
    // Add CSS animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
        50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
      }
      
      @keyframes carMove {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  createCar() {
    this.car = document.createElement('div');
    this.car.style.cssText = `
      position: absolute;
      width: 40px;
      height: 20px;
      background: linear-gradient(45deg, #cc3333, #ff6666);
      border-radius: 10px;
      transform: translate(-50%, -50%);
      left: 50%;
      top: 50%;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 20;
      transition: all 0.1s ease;
    `;
    
    // Add car details
    const details = document.createElement('div');
    details.style.cssText = `
      position: absolute;
      top: 2px;
      left: 2px;
      right: 2px;
      bottom: 2px;
      background: linear-gradient(45deg, #b33333, #e66666);
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.3);
    `;
    this.car.appendChild(details);
    
    // Add headlights
    const headlightL = document.createElement('div');
    headlightL.style.cssText = `
      position: absolute;
      width: 6px;
      height: 6px;
      background: #ffffcc;
      border-radius: 50%;
      top: 2px;
      left: 4px;
      box-shadow: 0 0 10px #ffffcc;
    `;
    this.car.appendChild(headlightL);
    
    const headlightR = document.createElement('div');
    headlightR.style.cssText = `
      position: absolute;
      width: 6px;
      height: 6px;
      background: #ffffcc;
      border-radius: 50%;
      top: 2px;
      right: 4px;
      box-shadow: 0 0 10px #ffffcc;
    `;
    this.car.appendChild(headlightR);
    
    this.canvas.appendChild(this.car);
  }
  
  setupControls() {
    if (this.isMobile) {
      this.setupMobileControls();
    } else {
      this.setupDesktopControls();
    }
  }
  
  setupDesktopControls() {
    document.addEventListener('keydown', (event) => {
      this.keys[event.code] = true;
    });
    
    document.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });
  }
  
  setupMobileControls() {
    const joystick = document.getElementById('joystick');
    const joystickKnob = document.getElementById('joystick-knob');
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    
    const handleStart = (e) => {
      isDragging = true;
      const rect = joystick.getBoundingClientRect();
      startPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    };
    
    const handleMove = (e) => {
      if (!isDragging) return;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const deltaX = clientX - startPos.x;
      const deltaY = clientY - startPos.y;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 25;
      
      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        const clampedX = Math.cos(angle) * maxDistance;
        const clampedY = Math.sin(angle) * maxDistance;
        
        joystickKnob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        this.joystickVector = { x: clampedX / maxDistance, y: clampedY / maxDistance };
      } else {
        joystickKnob.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        this.joystickVector = { x: deltaX / maxDistance, y: deltaY / maxDistance };
      }
    };
    
    const handleEnd = () => {
      isDragging = false;
      joystickKnob.style.transform = 'translate(-50%, -50%)';
      this.joystickVector = { x: 0, y: 0 };
    };
    
    joystick.addEventListener('touchstart', handleStart);
    joystick.addEventListener('touchmove', handleMove);
    joystick.addEventListener('touchend', handleEnd);
    joystick.addEventListener('mousedown', handleStart);
    joystick.addEventListener('mousemove', handleMove);
    joystick.addEventListener('mouseup', handleEnd);
  }
  
  setupAnimations() {
    // Add smooth animations for zone interactions
    gsap.set(this.car, { 
      x: 0, 
      y: 0,
      rotation: 0 
    });
  }
  
  animate() {
    const currentTime = performance.now();
    
    // Handle movement
    this.handleMovement();
    
    // Check zones periodically
    if (currentTime - this.lastZoneCheck > this.zoneCheckInterval) {
      this.checkZoneInteractions();
      this.lastZoneCheck = currentTime;
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  handleMovement() {
    const moveSpeed = 2;
    let moveVector = { x: 0, y: 0 };
    
    if (this.isMobile && this.joystickVector) {
      moveVector.x = this.joystickVector.x * moveSpeed;
      moveVector.y = this.joystickVector.y * moveSpeed;
    } else {
      if (this.keys['KeyW']) moveVector.y -= moveSpeed;
      if (this.keys['KeyS']) moveVector.y += moveSpeed;
      if (this.keys['KeyA']) moveVector.x -= moveSpeed;
      if (this.keys['KeyD']) moveVector.x += moveSpeed;
    }
    
    if (moveVector.x !== 0 || moveVector.y !== 0) {
      this.currentPosition.x += moveVector.x;
      this.currentPosition.y += moveVector.y;
      
      // Keep car within bounds
      this.currentPosition.x = Math.max(-45, Math.min(45, this.currentPosition.x));
      this.currentPosition.y = Math.max(-45, Math.min(45, this.currentPosition.y));
      
      // Update car position with smooth animation
      gsap.to(this.car, {
        x: this.currentPosition.x,
        y: this.currentPosition.y,
        duration: 0.1,
        ease: "power2.out"
      });
    }
  }
  
  checkZoneInteractions() {
    this.interactiveZones.forEach(zone => {
      const distance = Math.sqrt(
        Math.pow(this.currentPosition.x - zone.position.x, 2) +
        Math.pow(this.currentPosition.y - zone.position.y, 2)
      );
      
      if (distance < 4) {
        // Highlight zone
        zone.element.style.transform = 'translate(-50%, -50%) scale(1.1)';
        zone.element.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
        
        if (distance < 2) {
          this.triggerZoneInteraction(zone.type);
        }
      } else {
        zone.element.style.transform = 'translate(-50%, -50%) scale(1)';
        zone.element.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      }
    });
  }
  
  triggerZoneInteraction(zoneType) {
    if (this.lastTriggeredZone === zoneType) return;
    
    this.lastTriggeredZone = zoneType;
    
    // Add visual feedback
    gsap.to(this.car, {
      scale: 1.2,
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });
    
    switch (zoneType) {
      case 'about':
        window.showPopup('about-popup');
        break;
      case 'projects':
        window.showPopup('projects-popup');
        break;
      case 'resume':
        window.showPopup('resume-popup');
        break;
    }
    
    setTimeout(() => {
      this.lastTriggeredZone = null;
    }, 2000);
  }
  
  onWindowResize() {
    // Handle resize if needed
  }
}

// Initialize the lightweight portfolio
window.addEventListener('DOMContentLoaded', () => {
  window.portfolioLightweight = new PortfolioLightweight();
}); 