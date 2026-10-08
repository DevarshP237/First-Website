/**
 * CampusLearn — 3D Computer Workstation Engine
 * Procedural WebGL 3D Modern Laptop & Interactive Lab
 * Powered by Three.js with Real-time Animated Screen Canvas, Orbit Controls,
 * Mouse Parallax, Exploded Hardware Views, and Dynamic CS-101 Code Typing.
 */

(function () {
  'use strict';

  // Check WebGL availability
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable()) {
    console.warn('[CampusLearn 3D] WebGL not supported. Falling back to static view.');
    return;
  }

  // Global State
  const state = {
    screenMode: 'code', // 'code', 'neural', 'matrix'
    backlightColor: 0x38bdf8, // Sky blue default
    backlightName: 'cyan',
    isContinuous360: false,
    isExploded: false,
    explodedProgress: 0,
    targetExploded: 0,
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    mouseX: 0,
    mouseY: 0,
    targetRotationX: 0,
    targetRotationY: 0,
  };

  // Screen Canvas Texture Setup
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 1024;
  screenCanvas.height = 640;
  const ctx = screenCanvas.getContext('2d');
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.minFilter = THREE.LinearFilter;
  screenTexture.magFilter = THREE.LinearFilter;

  // Code Simulation State
  const codeLines = [
    { text: '// WP - Wisdom pro CS-101: Computer Science Fundamentals', color: '#64748b' },
    { text: '// University of Technology • Fall Semester 2025', color: '#64748b' },
    { text: '', color: '#94a3b8' },
    { text: 'import { AlgorithmEngine, NeuralNet } from "@wisdompro/core";', color: '#38bdf8' },
    { text: '', color: '#94a3b8' },
    { text: 'class WisdomProFundamentals {', color: '#f43f5e' },
    { text: '  private student: StudentProfile;', color: '#e2e8f0' },
    { text: '  public activeModules = 6;', color: '#10b981' },
    { text: '', color: '#94a3b8' },
    { text: '  constructor(id: string) {', color: '#fbbf24' },
    { text: '    this.student = new StudentProfile(id);', color: '#e2e8f0' },
    { text: '    this.initializeCorePillars(["Learn", "Practice", "Build", "Grow"]);', color: '#a855f7' },
    { text: '  }', color: '#fbbf24' },
    { text: '', color: '#94a3b8' },
    { text: '  public executeBinarySearch(dataset: number[], target: number): SearchResult {', color: '#38bdf8' },
    { text: '    // Algorithmic complexity: O(log n)', color: '#10b981' },
    { text: '    return AlgorithmEngine.divideAndConquer(dataset, target);', color: '#e2e8f0' },
    { text: '  }', color: '#38bdf8' },
    { text: '}', color: '#f43f5e' },
    { text: '', color: '#94a3b8' },
    { text: 'const portal = new WisdomProFundamentals("STUDENT-2025");', color: '#f59e0b' },
    { text: 'portal.executeBinarySearch([1, 4, 9, 16, 25, 36, 49, 64], 25);', color: '#38bdf8' },
  ];

  let currentLineIndex = 0;
  let currentCharIndex = 0;
  let codeTick = 0;
  let matrixDrops = [];
  const matrixCols = 40;
  for (let i = 0; i < matrixCols; i++) {
    matrixDrops[i] = Math.floor(Math.random() * -30);
  }

  // Neural simulation points
  const neuralNodes = [];
  for (let i = 0; i < 28; i++) {
    neuralNodes.push({
      x: 100 + Math.random() * 824,
      y: 100 + Math.random() * 440,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: 4 + Math.random() * 5,
      label: ['Binary Tree', 'Dijkstra', 'Recursion', 'Hash Map', 'Turing Machine', 'SQL Engine', 'Stack', 'Queue', 'CPU', 'O(1)', 'O(n)', 'O(log n)'][i % 12],
    });
  }

  // Draw Screen Texture Frame
  function updateScreenTexture() {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

    // Window Header Bar (macOS / Linux terminal style)
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, screenCanvas.width, 42);

    // Traffic light dots
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(24, 21, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(44, 21, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(64, 21, 6, 0, Math.PI * 2);
    ctx.fill();

    // Editor Tab title
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(90, 8, 220, 34);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('WisdomPro_CS101.ts', 110, 29);

    // Header Right Pill
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenCanvas.width - 240, 10, 220, 24);
    ctx.fillStyle = '#10b981';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('● SYSTEM: OPERATIONAL', screenCanvas.width - 220, 26);

    if (state.screenMode === 'code') {
      // CODE EDITOR MODE
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      
      // Draw line numbers gutter
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 42, 65, screenCanvas.height - 110);
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(65, 42);
      ctx.lineTo(65, screenCanvas.height - 110);
      ctx.stroke();

      // Render code lines
      let y = 74;
      for (let i = 0; i <= currentLineIndex && i < codeLines.length; i++) {
        // Gutter line number
        ctx.fillStyle = '#64748b';
        ctx.fillText(String(i + 1).padStart(2, ' '), 20, y);

        const line = codeLines[i];
        let textToDraw = line.text;
        if (i === currentLineIndex) {
          textToDraw = line.text.substring(0, currentCharIndex);
        }

        ctx.fillStyle = line.color;
        ctx.fillText(textToDraw, 85, y);

        // Blinking cursor on active line
        if (i === currentLineIndex && Math.floor(codeTick / 15) % 2 === 0) {
          const textWidth = ctx.measureText(textToDraw).width;
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(85 + textWidth + 2, y - 14, 9, 17);
        }

        y += 26;
      }

      // Bottom Terminal Panel
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, screenCanvas.height - 100, screenCanvas.width, 100);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(0, screenCanvas.height - 100, screenCanvas.width, 1);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText('TERMINAL // COMPILER OUTPUT', 24, screenCanvas.height - 76);

      ctx.fillStyle = '#10b981';
      ctx.fillText('[OK] CS-101 Algorithm Engine initialized (4 Pillars active)', 24, screenCanvas.height - 52);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('> Binary Search Test: Key 25 found at index 4 | Latency: 0.08ms | Complexity: O(log n)', 24, screenCanvas.height - 30);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('> WP - Wisdom pro portal connected to University of Technology cluster.', 24, screenCanvas.height - 10);

      // Advance Typing
      codeTick++;
      if (codeTick % 2 === 0) {
        if (currentLineIndex < codeLines.length) {
          if (currentCharIndex < codeLines[currentLineIndex].text.length) {
            currentCharIndex++;
          } else {
            currentLineIndex++;
            currentCharIndex = 0;
          }
        } else {
          // Loop code typing after pause
          if (codeTick > 300) {
            currentLineIndex = 0;
            currentCharIndex = 0;
            codeTick = 0;
          }
        }
      }
    } else if (state.screenMode === 'neural') {
      // HOLOGRAPHIC NEURAL GRAPH MODE
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;

      // Draw connections
      for (let i = 0; i < neuralNodes.length; i++) {
        for (let j = i + 1; j < neuralNodes.length; j++) {
          const dx = neuralNodes[i].x - neuralNodes[j].x;
          const dy = neuralNodes[i].y - neuralNodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(neuralNodes[i].x, neuralNodes[i].y);
            ctx.lineTo(neuralNodes[j].x, neuralNodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < neuralNodes.length; i++) {
        const n = neuralNodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 80 || n.x > screenCanvas.width - 80) n.vx *= -1;
        if (n.y < 80 || n.y > screenCanvas.height - 80) n.vy *= -1;

        // Outer pulse
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        // Node label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(n.label, n.x + 12, n.y + 4);
      }

      // Center title badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(screenCanvas.width / 2 - 180, 60, 360, 48);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(screenCanvas.width / 2 - 180, 60, 360, 48);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CS KNOWLEDGE GRAPH // INTERACTIVE', screenCanvas.width / 2, 88);
      ctx.textAlign = 'left';

    } else if (state.screenMode === 'matrix') {
      // MATRIX DIGITAL RAIN MODE
      ctx.fillStyle = 'rgba(3, 7, 18, 0.25)';
      ctx.fillRect(0, 42, screenCanvas.width, screenCanvas.height - 42);

      ctx.fillStyle = '#10b981';
      ctx.font = '16px monospace';

      const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]<>$#%@*';
      for (let i = 0; i < matrixDrops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 26 + 10;
        const y = matrixDrops[i] * 24 + 60;

        ctx.fillStyle = matrixDrops[i] % 4 === 0 ? '#a7f3d0' : '#10b981';
        ctx.fillText(text, x, y);

        if (y > screenCanvas.height && Math.random() > 0.975) {
          matrixDrops[i] = 0;
        }
        matrixDrops[i]++;
      }

      // Overlay cyber prompt
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(40, screenCanvas.height - 80, screenCanvas.width - 80, 50);
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(40, screenCanvas.height - 80, screenCanvas.width - 80, 50);
      ctx.fillStyle = '#10b981';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText('ROOT ACCESS GRANTED: WP - WISDOM PRO MAINFRAME // 1,740 CONNECTED NODES', 60, screenCanvas.height - 48);
    }

    screenTexture.needsUpdate = true;
  }

  // Create the 3D Workstation Scene
  function init3DWorkstation() {
    const container = document.getElementById('computer3d-stage');
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.1, 4.3);
    camera.lookAt(0, 0.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);

    // Orbit Controls
    let controls = null;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.target.set(0, 0.5, 0);
      controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below ground
      controls.minDistance = 2.2;
      controls.maxDistance = 7.0;
      controls.enablePan = false;
    }

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xffffff, 2.6);
    mainSpot.position.set(3, 6, 4);
    mainSpot.angle = Math.PI / 5;
    mainSpot.penumbra = 0.6;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const frontFillLight = new THREE.DirectionalLight(0x818cf8, 1.3);
    frontFillLight.position.set(0, 2, 5);
    scene.add(frontFillLight);

    // Screen Glow Emissive PointLight casting onto keyboard
    const screenGlowLight = new THREE.PointLight(0x38bdf8, 1.5, 3.5);
    screenGlowLight.position.set(0, 0.9, 0.4);
    scene.add(screenGlowLight);

    // Root Laptop Group (for rotation & mouse parallax)
    const laptopMasterGroup = new THREE.Group();
    laptopMasterGroup.rotation.set(0.12, -0.42, 0); // 3/4 beauty product showcase angle
    scene.add(laptopMasterGroup);

    // Materials
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e222d, // Space Gray metallic
      metalness: 0.82,
      roughness: 0.28,
    });

    const interiorBezelMat = new THREE.MeshStandardMaterial({
      color: 0x0f1219,
      metalness: 0.6,
      roughness: 0.4,
    });

    const keycapMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      metalness: 0.4,
      roughness: 0.5,
    });

    const keyboardBacklightMat = new THREE.MeshBasicMaterial({
      color: state.backlightColor,
      transparent: true,
      opacity: 0.7,
    });

    const screenDisplayMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
    });

    const accentEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.5,
    });

    // 1. BASE ASSEMBLY (Keyboard Deck)
    const baseGroup = new THREE.Group();
    laptopMasterGroup.add(baseGroup);

    // Base Chassis Geometry
    const baseWidth = 2.4;
    const baseDepth = 1.6;
    const baseHeight = 0.08;

    const baseChassis = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth),
      chassisMat
    );
    baseChassis.position.y = baseHeight / 2;
    baseChassis.castShadow = true;
    baseChassis.receiveShadow = true;
    baseGroup.add(baseChassis);

    // Rubber Feet (Underneath)
    const footGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.015, 16);
    const footMat = new THREE.MeshBasicMaterial({ color: 0x05070a });
    const footPositions = [
      [-1.0, 0, -0.65],
      [1.0, 0, -0.65],
      [-1.0, 0, 0.65],
      [1.0, 0, 0.65],
    ];
    footPositions.forEach(pos => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(pos[0], -0.005, pos[2]);
      baseGroup.add(foot);
    });

    // Recessed Keyboard Well
    const wellWidth = 2.0;
    const wellDepth = 0.85;
    const wellMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(wellWidth, wellDepth),
      new THREE.MeshStandardMaterial({ color: 0x0b0e14, roughness: 0.8, metalness: 0.2 })
    );
    wellMesh.rotation.x = -Math.PI / 2;
    wellMesh.position.set(0, baseHeight + 0.001, -0.15);
    baseGroup.add(wellMesh);

    // Backlight Glow Under Keyboard
    const backlightPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(wellWidth - 0.02, wellDepth - 0.02),
      keyboardBacklightMat
    );
    backlightPlane.rotation.x = -Math.PI / 2;
    backlightPlane.position.set(0, baseHeight + 0.002, -0.15);
    baseGroup.add(backlightPlane);

    // 3D Chiclet Keys Grid
    const keyRows = 5;
    const keyCols = 14;
    const keyGroup = new THREE.Group();
    baseGroup.add(keyGroup);

    const keyWidth = 0.12;
    const keyDepth = 0.12;
    const keyHeight = 0.02;
    const keyGeo = new THREE.BoxGeometry(keyWidth, keyHeight, keyDepth);

    for (let r = 0; r < keyRows; r++) {
      for (let c = 0; c < keyCols; c++) {
        // Spacebar adjustment on bottom row
        if (r === keyRows - 1 && c >= 4 && c <= 8) {
          if (c === 4) {
            const spaceGeo = new THREE.BoxGeometry(keyWidth * 5 + 0.08, keyHeight, keyDepth);
            const spaceKey = new THREE.Mesh(spaceGeo, keycapMat);
            const x = -wellWidth / 2 + 0.12 + 6 * (keyWidth + 0.02);
            const z = -0.15 - wellDepth / 2 + 0.1 + r * (keyDepth + 0.04);
            spaceKey.position.set(x, baseHeight + keyHeight / 2 + 0.003, z);
            keyGroup.add(spaceKey);
          }
          continue;
        }

        const keyMesh = new THREE.Mesh(keyGeo, keycapMat);
        const x = -wellWidth / 2 + 0.12 + c * (keyWidth + 0.02);
        const z = -0.15 - wellDepth / 2 + 0.1 + r * (keyDepth + 0.04);
        keyMesh.position.set(x, baseHeight + keyHeight / 2 + 0.003, z);
        keyGroup.add(keyMesh);
      }
    }

    // Precision Trackpad
    const trackpadWidth = 0.72;
    const trackpadDepth = 0.46;
    const trackpadMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(trackpadWidth, trackpadDepth),
      new THREE.MeshStandardMaterial({ color: 0x161a23, roughness: 0.35, metalness: 0.7 })
    );
    trackpadMesh.rotation.x = -Math.PI / 2;
    trackpadMesh.position.set(0, baseHeight + 0.002, 0.48);
    baseGroup.add(trackpadMesh);

    // Trackpad border outline
    const trackpadBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(trackpadWidth, trackpadDepth)),
      new THREE.LineBasicMaterial({ color: 0x334155 })
    );
    trackpadBorder.rotation.x = -Math.PI / 2;
    trackpadBorder.position.set(0, baseHeight + 0.0025, 0.48);
    baseGroup.add(trackpadBorder);

    // Side USB-C Ports
    const portGeo = new THREE.BoxGeometry(0.01, 0.02, 0.06);
    const portMat = new THREE.MeshBasicMaterial({ color: 0x05070a });
    const p1 = new THREE.Mesh(portGeo, portMat);
    p1.position.set(-baseWidth / 2 - 0.001, baseHeight / 2, -0.4);
    baseGroup.add(p1);
    const p2 = new THREE.Mesh(portGeo, portMat);
    p2.position.set(-baseWidth / 2 - 0.001, baseHeight / 2, -0.28);
    baseGroup.add(p2);
    const p3 = new THREE.Mesh(portGeo, portMat);
    p3.position.set(baseWidth / 2 + 0.001, baseHeight / 2, -0.4);
    baseGroup.add(p3);

    // 2. HINGE & SCREEN LID ASSEMBLY
    const hingeGroup = new THREE.Group();
    hingeGroup.position.set(0, baseHeight, -baseDepth / 2 + 0.04);
    laptopMasterGroup.add(hingeGroup);

    // Cylindrical Hinge
    const hingeGeo = new THREE.CylinderGeometry(0.035, 0.035, baseWidth * 0.75, 24);
    const hingeMesh = new THREE.Mesh(hingeGeo, chassisMat);
    hingeMesh.rotation.z = Math.PI / 2;
    hingeGroup.add(hingeMesh);

    // Screen Lid Group (pivots around hinge)
    const lidGroup = new THREE.Group();
    hingeGroup.add(lidGroup);

    // Set natural laptop open angle: 106 degrees from keyboard base
    lidGroup.rotation.x = -0.28;

    const lidWidth = 2.4;
    const lidDepth = 1.6;
    const lidThickness = 0.045;

    // Screen Back Shell (Space Gray Aluminum)
    const lidShell = new THREE.Mesh(
      new THREE.BoxGeometry(lidWidth, lidDepth, lidThickness),
      chassisMat
    );
    lidShell.position.set(0, lidDepth / 2, -lidThickness / 2);
    lidShell.castShadow = true;
    lidGroup.add(lidShell);

    // Illuminated University/CampusLearn Logo on Back of Lid
    const backLogoMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.12, 32),
      accentEmissiveMat
    );
    backLogoMesh.position.set(0, lidDepth / 2, -lidThickness - 0.002);
    backLogoMesh.rotation.y = Math.PI; // Face outwards to the back
    lidGroup.add(backLogoMesh);

    // Screen Front Bezel Frame
    const screenBorderMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(lidWidth - 0.04, lidDepth - 0.04),
      interiorBezelMat
    );
    screenBorderMesh.position.set(0, lidDepth / 2, 0.001);
    lidGroup.add(screenBorderMesh);

    // Webcam Notch & Indicator
    const camMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.012, 16),
      new THREE.MeshBasicMaterial({ color: 0x05070a })
    );
    camMesh.position.set(0, lidDepth - 0.03, 0.002);
    lidGroup.add(camMesh);

    const camLed = new THREE.Mesh(
      new THREE.CircleGeometry(0.004, 16),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    camLed.position.set(0.025, lidDepth - 0.03, 0.002);
    lidGroup.add(camLed);

    // The ACTIVE DISPLAY PANEL (Maps dynamic canvas texture)
    const displayWidth = 2.16;
    const displayHeight = 1.35;
    const displayMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(displayWidth, displayHeight),
      screenDisplayMat
    );
    displayMesh.position.set(0, lidDepth / 2 - 0.02, 0.003);
    lidGroup.add(displayMesh);

    // 3. FLOATING HOLOGRAPHIC PROPS & PEDESTAL
    const propsGroup = new THREE.Group();
    scene.add(propsGroup);

    // Circular Sci-Fi Radar Grid Pedestal
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.y = -0.05;
    propsGroup.add(pedestalGroup);

    const ringMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
    });

    for (let r = 1.2; r <= 3.2; r += 0.6) {
      const ringGeo = new THREE.BufferGeometry().setFromPoints(
        new THREE.Path().absarc(0, 0, r, 0, Math.PI * 2, true, 64).getPoints(64)
      );
      const ringLine = new THREE.Line(ringGeo, ringMat);
      ringLine.rotation.x = Math.PI / 2;
      pedestalGroup.add(ringLine);
    }

    // Radial spokes
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const spokeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(angle) * 1.0, 0, Math.sin(angle) * 1.0),
        new THREE.Vector3(Math.cos(angle) * 3.2, 0, Math.sin(angle) * 3.2),
      ]);
      const spoke = new THREE.Line(spokeGeo, ringMat);
      pedestalGroup.add(spoke);
    }

    // Floating Holographic Polyhedral Crystal (Octahedron & Icosahedron)
    const polyGeo = new THREE.OctahedronGeometry(0.22, 0);
    const polyMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      wireframe: true,
      emissiveIntensity: 0.8,
    });

    const floatingCrystal1 = new THREE.Mesh(polyGeo, polyMat);
    floatingCrystal1.position.set(-1.8, 1.2, 0.6);
    propsGroup.add(floatingCrystal1);

    const floatingCrystal2 = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.18, 0),
      new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x7e22ce,
        wireframe: true,
        emissiveIntensity: 0.8,
      })
    );
    floatingCrystal2.position.set(1.9, 1.4, -0.4);
    propsGroup.add(floatingCrystal2);

    // Floating CS Cubes
    const cubeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      wireframe: true,
    });
    const floatingCube = new THREE.Mesh(cubeGeo, cubeMat);
    floatingCube.position.set(1.6, 0.5, 1.0);
    propsGroup.add(floatingCube);

    // Ambient Starfield / Particle Cloud
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8.0;
      particlePositions[i + 1] = Math.random() * 4.0;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8.0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    propsGroup.add(particleSystem);

    // Mouse Interaction Tracking
    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      state.mouseX = x;
      state.mouseY = y;
    }
    container.addEventListener('mousemove', onMouseMove);

    // Exploded View Interpolation
    function updateExploded() {
      state.explodedProgress += (state.targetExploded - state.explodedProgress) * 0.08;
      const ep = state.explodedProgress;

      // Base lowers slightly
      baseGroup.position.y = -ep * 0.4;

      // Keys float up from deck
      keyGroup.position.y = ep * 0.35;

      // Hinge elevates
      hingeGroup.position.y = (baseHeight) + ep * 0.6;
      hingeGroup.position.z = (-baseDepth / 2 + 0.04) - ep * 0.2;

      // Lid separates into layers
      lidShell.position.z = (-lidThickness / 2) - ep * 0.35;
      displayMesh.position.z = (0.003) + ep * 0.35;
    }

    // Animation Render Loop
    let clock = new THREE.Clock();
    let frameId;

    function animate() {
      frameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Update Screen Texture canvas
      updateScreenTexture();

      // Exploded hardware view easing
      updateExploded();

      // Mouse Parallax & Natural Product Showcase Sway
      if (state.isContinuous360) {
        laptopMasterGroup.rotation.y += 0.006;
      } else {
        const idleSway = Math.sin(elapsedTime * 0.7) * 0.08;
        const targetRotY = -0.32 + idleSway + (state.mouseX * 0.28);
        laptopMasterGroup.rotation.y += (targetRotY - laptopMasterGroup.rotation.y) * 0.06;
      }

      // Parallax tilt on X axis
      const targetTiltX = 0.12 - (state.mouseY * 0.15);
      laptopMasterGroup.rotation.x += (targetTiltX - laptopMasterGroup.rotation.x) * 0.06;

      // Props animation
      pedestalGroup.rotation.y += 0.002;
      floatingCrystal1.rotation.x += 0.015;
      floatingCrystal1.rotation.y += 0.02;
      floatingCrystal1.position.y = 1.2 + Math.sin(elapsedTime * 2.0) * 0.12;

      floatingCrystal2.rotation.x -= 0.012;
      floatingCrystal2.rotation.z += 0.018;
      floatingCrystal2.position.y = 1.4 + Math.cos(elapsedTime * 2.2) * 0.14;

      floatingCube.rotation.x += 0.01;
      floatingCube.rotation.y += 0.015;
      floatingCube.position.y = 0.5 + Math.sin(elapsedTime * 1.8) * 0.08;

      particleSystem.rotation.y += 0.0008;

      if (controls) {
        controls.update();
      }

      renderer.render(scene, camera);
    }

    animate();

    // Resize Handler
    function handleResize() {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    // Observe container size changes (e.g. layout toggle)
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => handleResize());
      ro.observe(container);
    }

    // Public API for UI Dock Controls
    window.WisdomPro3D = window.CampusLearn3D = {
      setScreenMode: function (mode) {
        state.screenMode = mode;
        const badge = document.getElementById('screen-mode-badge');
        if (badge) {
          badge.textContent = mode.toUpperCase();
        }
      },
      cycleScreenMode: function () {
        const modes = ['code', 'neural', 'matrix'];
        const nextIdx = (modes.indexOf(state.screenMode) + 1) % modes.length;
        this.setScreenMode(modes[nextIdx]);
      },
      cycleBacklight: function () {
        const colors = [
          { name: 'cyan', hex: 0x38bdf8 },
          { name: 'emerald', hex: 0x10b981 },
          { name: 'amethyst', hex: 0xa855f7 },
          { name: 'amber', hex: 0xf59e0b },
        ];
        const currentIdx = colors.findIndex(c => c.name === state.backlightName);
        const next = colors[(currentIdx + 1) % colors.length];
        state.backlightName = next.name;
        state.backlightColor = next.hex;
        keyboardBacklightMat.color.setHex(next.hex);

        const badge = document.getElementById('backlight-badge');
        if (badge) {
          badge.textContent = next.name.toUpperCase();
        }
      },
      toggleAutoRotate: function () {
        state.isContinuous360 = !state.isContinuous360;
        const btn = document.getElementById('btn-autorotate');
        if (btn) {
          btn.classList.toggle('text-blue-500', state.isContinuous360);
          btn.classList.toggle('text-slate-400', !state.isContinuous360);
        }
      },
      toggleExplodedView: function () {
        state.isExploded = !state.isExploded;
        state.targetExploded = state.isExploded ? 1.0 : 0.0;
        const btn = document.getElementById('btn-exploded');
        if (btn) {
          btn.classList.toggle('bg-blue-600', state.isExploded);
          btn.classList.toggle('text-white', state.isExploded);
        }
      },
      resetCamera: function () {
        camera.position.set(0, 2.1, 4.3);
        laptopMasterGroup.rotation.set(0.12, -0.42, 0);
        state.targetRotationX = 0;
        state.targetRotationY = 0;
        if (controls) {
          controls.target.set(0, 0.5, 0);
          controls.reset();
        }
      },
      updateTheme: function (theme) {
        state.theme = theme;
        if (theme === 'dark') {
          ambientLight.intensity = 0.85;
          mainSpot.intensity = 2.5;
        } else {
          ambientLight.intensity = 1.2;
          mainSpot.intensity = 3.0;
        }
      },
    };
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DWorkstation);
  } else {
    init3DWorkstation();
  }
})();
