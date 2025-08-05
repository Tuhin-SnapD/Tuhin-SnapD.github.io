// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.maxHistoryLength = 60; // Keep last 60 frames
    
    this.createDisplay();
    this.startMonitoring();
  }
  
  createDisplay() {
    // Create performance display
    const perfDiv = document.createElement('div');
    perfDiv.id = 'performance-display';
    perfDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      pointer-events: none;
    `;
    
    perfDiv.innerHTML = `
      <div>FPS: <span id="fps-display">0</span></div>
      <div>Avg FPS: <span id="avg-fps-display">0</span></div>
      <div>Min FPS: <span id="min-fps-display">0</span></div>
    `;
    
    document.body.appendChild(perfDiv);
  }
  
  startMonitoring() {
    const updateFPS = () => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.fpsHistory.push(this.fps);
        
        // Keep only recent history
        if (this.fpsHistory.length > this.maxHistoryLength) {
          this.fpsHistory.shift();
        }
        
        // Update display
        const fpsDisplay = document.getElementById('fps-display');
        const avgFpsDisplay = document.getElementById('avg-fps-display');
        const minFpsDisplay = document.getElementById('min-fps-display');
        
        if (fpsDisplay) fpsDisplay.textContent = this.fps;
        if (avgFpsDisplay) {
          const avgFPS = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
          avgFpsDisplay.textContent = avgFPS;
        }
        if (minFpsDisplay) {
          const minFPS = Math.min(...this.fpsHistory);
          minFpsDisplay.textContent = minFPS;
        }
        
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    requestAnimationFrame(updateFPS);
  }
  
  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }
  
  getMinFPS() {
    if (this.fpsHistory.length === 0) return 0;
    return Math.min(...this.fpsHistory);
  }
  
  hide() {
    const display = document.getElementById('performance-display');
    if (display) {
      display.style.display = 'none';
    }
  }
  
  show() {
    const display = document.getElementById('performance-display');
    if (display) {
      display.style.display = 'block';
    }
  }
}

// Export for use in main.js
window.PerformanceMonitor = PerformanceMonitor; 