import * as THREE from 'three';
import { gsap } from 'gsap';

class Portfolio3D {
  constructor() {
    this.canvas = document.getElementById('renderCanvas');
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.car = null;
    this.interactiveZones = [];
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Performance optimization
    this.keys = {};
    this.lastFrameTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
    this.lastZoneCheck = 0;
    this.zoneCheckInterval = 100;
    
    this.init();
  }
  
  init() {
    this.setupRenderer();
    this.setupCamera();
    this.setupLighting();
    this.createScene();
    this.createCar();
    this.setupControls();
    
    // Hide loading screen
    document.getElementById('loading').style.display = 'none';
    
    // Start optimized render loop
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });
    
    // Ensure canvas has focus for keyboard events
    this.canvas.addEventListener('click', () => {
      this.canvas.focus();
    });
    
    this.canvas.focus();
  }
  
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: false, // Disable antialiasing for better performance
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    this.renderer.shadowMap.enabled = false; // Disable shadows for performance
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 20, 0);
    this.camera.lookAt(0, 0, 0);
  }
  
  setupLighting() {
    // Simple ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    // Simple directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(1, 1, 0);
    this.scene.add(directionalLight);
    
    // Add fog for atmosphere
    this.scene.fog = new THREE.Fog(0x101020, 10, 100);
  }
  
  createScene() {
    // Create ground with simple geometry
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x2a4a2a,
      side: THREE.DoubleSide 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
    
    // Create simple walls
    this.createWalls();
    
    // Create decorative elements
    this.createDecorations();
  }
  
  createWalls() {
    const wallMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x666666,
      transparent: true,
      opacity: 0.3 
    });
    
    // North wall
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(50, 5, 1),
      wallMaterial
    );
    northWall.position.set(0, 2.5, -25);
    this.scene.add(northWall);
    
    // South wall
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(50, 5, 1),
      wallMaterial
    );
    southWall.position.set(0, 2.5, 25);
    this.scene.add(southWall);
    
    // East wall
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, 5, 50),
      wallMaterial
    );
    eastWall.position.set(25, 2.5, 0);
    this.scene.add(eastWall);
    
    // West wall
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, 5, 50),
      wallMaterial
    );
    westWall.position.set(-25, 2.5, 0);
    this.scene.add(westWall);
  }
  
  createDecorations() {
    // Create simple trees with shared materials
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x663311 });
    const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x1a4d1a });
    
    for (let i = 0; i < 6; i++) { // Reduced from 8 to 6 trees
      const tree = this.createSimpleTree(trunkMaterial, leavesMaterial);
      const angle = (i / 6) * Math.PI * 2;
      const radius = 20;
      tree.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      this.scene.add(tree);
    }
    
    // Create zone platforms
    this.createZonePlatforms();
  }
  
  createSimpleTree(trunkMaterial, leavesMaterial) {
    const treeGroup = new THREE.Group();
    
    // Simple trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 2),
      trunkMaterial
    );
    trunk.position.y = 1;
    treeGroup.add(trunk);
    
    // Simple leaves (cone)
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(1, 3, 6), // Low polygon count
      leavesMaterial
    );
    leaves.position.y = 3.5;
    treeGroup.add(leaves);
    
    return treeGroup;
  }
  
  createZonePlatforms() {
    // About Me zone
    const aboutPlatform = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 0.5, 8),
      new THREE.MeshBasicMaterial({ 
        color: 0x3366cc,
        transparent: true,
        opacity: 0.8 
      })
    );
    aboutPlatform.position.set(-15, 0.25, -15);
    this.scene.add(aboutPlatform);
    
    // Projects zone
    const projectsPlatform = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 0.5, 8),
      new THREE.MeshBasicMaterial({ 
        color: 0xcc6633,
        transparent: true,
        opacity: 0.8 
      })
    );
    projectsPlatform.position.set(15, 0.25, -15);
    this.scene.add(projectsPlatform);
    
    // Resume zone
    const resumePlatform = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 0.5, 8),
      new THREE.MeshBasicMaterial({ 
        color: 0x9933cc,
        transparent: true,
        opacity: 0.8 
      })
    );
    resumePlatform.position.set(0, 0.25, 15);
    this.scene.add(resumePlatform);
    
    // Store zone references
    this.interactiveZones = [
      { mesh: aboutPlatform, type: 'about', position: aboutPlatform.position },
      { mesh: projectsPlatform, type: 'projects', position: projectsPlatform.position },
      { mesh: resumePlatform, type: 'resume', position: resumePlatform.position }
    ];
  }
  
  createCar() {
    this.car = new THREE.Group();
    
    // Simple car body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.8, 3),
      new THREE.MeshBasicMaterial({ color: 0xcc3333 })
    );
    body.position.y = 0.4;
    this.car.add(body);
    
    // Simple roof
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.6, 1.5),
      new THREE.MeshBasicMaterial({ color: 0xb33333 })
    );
    roof.position.set(0, 1.1, -0.3);
    this.car.add(roof);
    
    // Simple wheels
    const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
    
    const wheelPositions = [
      [-1.2, 0.4, 1], [1.2, 0.4, 1],
      [-1.2, 0.4, -1], [1.2, 0.4, -1]
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(...pos);
      wheel.rotation.z = Math.PI / 2;
      this.car.add(wheel);
    });
    
    // Simple headlights
    const headlightMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffcc,
      transparent: true,
      opacity: 0.8 
    });
    const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    
    const headlightL = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlightL.position.set(-0.6, 0.6, 1.4);
    this.car.add(headlightL);
    
    const headlightR = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlightR.position.set(0.6, 0.6, 1.4);
    this.car.add(headlightR);
    
    this.car.position.set(0, 0, 0);
    this.scene.add(this.car);
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
  
  animate() {
    const currentTime = performance.now();
    
    // Frame rate limiting
    if (currentTime - this.lastFrameTime < this.frameInterval) {
      requestAnimationFrame(() => this.animate());
      return;
    }
    
    this.lastFrameTime = currentTime;
    
    // Handle movement
    this.handleMovement();
    
    // Check zones periodically
    if (currentTime - this.lastZoneCheck > this.zoneCheckInterval) {
      this.checkZoneInteractions();
      this.lastZoneCheck = currentTime;
    }
    
    // Update camera to follow car
    this.camera.position.x = this.car.position.x;
    this.camera.position.z = this.car.position.z + 20;
    this.camera.lookAt(this.car.position);
    
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
  
  handleMovement() {
    const moveSpeed = 0.15;
    let moveVector = new THREE.Vector3();
    
    if (this.isMobile && this.joystickVector) {
      moveVector.x = this.joystickVector.x * moveSpeed;
      moveVector.z = -this.joystickVector.y * moveSpeed;
    } else {
      if (this.keys['KeyW']) moveVector.z -= moveSpeed;
      if (this.keys['KeyS']) moveVector.z += moveSpeed;
      if (this.keys['KeyA']) moveVector.x -= moveSpeed;
      if (this.keys['KeyD']) moveVector.x += moveSpeed;
    }
    
    if (moveVector.length() > 0) {
      this.car.position.add(moveVector);
    }
  }
  
  checkZoneInteractions() {
    const carPos = this.car.position;
    
    this.interactiveZones.forEach(zone => {
      const distance = carPos.distanceTo(zone.position);
      
      if (distance < 4) {
        // Highlight zone
        zone.mesh.material.opacity = 1;
        
        if (distance < 2) {
          this.triggerZoneInteraction(zone.type);
        }
      } else {
        zone.mesh.material.opacity = 0.8;
      }
    });
  }
  
  triggerZoneInteraction(zoneType) {
    if (this.lastTriggeredZone === zoneType) return;
    
    this.lastTriggeredZone = zoneType;
    
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
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Initialize the portfolio when the page loads
window.addEventListener('DOMContentLoaded', () => {
  // Initialize performance monitor (optional - remove in production)
  if (window.location.search.includes('debug=true')) {
    new PerformanceMonitor();
  }
  
  window.portfolio3D = new Portfolio3D();
});