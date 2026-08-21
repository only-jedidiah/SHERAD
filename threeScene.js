// Three.js 3D Luxury Background, Studio Environment & 3D Interactive Showroom Car
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

class LuxuryShowroomScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.targetRotationY = 0.35;
    this.currentRotationY = 0.35;
    this.carWheelMeshes = [];
    this.carMaterials = {};

    this.init();
    this.createStage();
    this.createGoldParticles();
    this.createLightRings();
    this.create3DLuxuryCar();
    this.setupEvents();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07080b, 0.032);

    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.8, 8.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ambient Lighting (Warm & Luxurious)
    this.ambientLight = new THREE.AmbientLight(0xffeedd, 0.45);
    this.scene.add(this.ambientLight);

    // Primary Dynamic Spotlight (Champagne Gold)
    this.mainSpot = new THREE.SpotLight(0xd4af37, 8, 25, Math.PI / 4.5, 0.4, 1.2);
    this.mainSpot.position.set(0, 7.5, 4);
    this.scene.add(this.mainSpot);

    // Rim / Backlight (Subtle Ice Platinum)
    this.rimLight = new THREE.PointLight(0xb0d0ff, 3, 20);
    this.rimLight.position.set(-6, 3, -4);
    this.scene.add(this.rimLight);

    // Accent Gold Fill
    this.goldFill = new THREE.PointLight(0xe5b84c, 4, 18);
    this.goldFill.position.set(6, 3.5, 2.5);
    this.scene.add(this.goldFill);

    // Under-car Ground Glow
    this.underglowLight = new THREE.PointLight(0xd4af37, 2, 8);
    this.underglowLight.position.set(0, -1.3, 0);
    this.scene.add(this.underglowLight);
  }

  createStage() {
    // Reflective Studio Floor Grid
    const gridGeometry = new THREE.PlaneGeometry(60, 60, 40, 40);
    const gridMaterial = new THREE.MeshStandardMaterial({
      color: 0x090b10,
      metalness: 0.9,
      roughness: 0.22
    });
    this.floor = new THREE.Mesh(gridGeometry, gridMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -1.5;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    // Subtle Hexagonal Studio Grid Overlay
    const gridHelper = new THREE.GridHelper(50, 50, 0xd4af37, 0x161d2a);
    gridHelper.position.y = -1.49;
    gridHelper.material.opacity = 0.12;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);

    // Turntable Pedestal Base
    const discGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.1, 64);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f16,
      metalness: 0.8,
      roughness: 0.3
    });
    this.pedestal = new THREE.Mesh(discGeo, discMat);
    this.pedestal.position.set(0, -1.45, 0);
    this.scene.add(this.pedestal);

    // Gold Glowing Rim on Turntable
    const ringGeo = new THREE.TorusGeometry(3.7, 0.025, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.45
    });
    const discRing = new THREE.Mesh(ringGeo, ringMat);
    discRing.rotation.x = Math.PI / 2;
    discRing.position.set(0, -1.4, 0);
    this.scene.add(discRing);
  }

  createGoldParticles() {
    const count = 320;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = Math.random() * 10 - 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
      scales[i] = Math.random() * 0.7 + 0.3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Particle Texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 235, 170, 1)');
    grad.addColorStop(0.3, 'rgba(212, 175, 55, 0.8)');
    grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      color: 0xffd97d,
      size: 0.3,
      map: texture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createLightRings() {
    this.ringsGroup = new THREE.Group();

    const ringGeometry = new THREE.TorusGeometry(4.8, 0.018, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(0, 0, -2 - i * 2);
      ring.rotation.x = Math.PI / 2.2;
      ring.rotation.y = i * 0.4;
      this.ringsGroup.add(ring);
    }

    this.scene.add(this.ringsGroup);
  }

  // =========================================================================
  // 3D LUXURY VEHICLE MODEL (Procedural PBR Showroom Mesh)
  // =========================================================================
  create3DLuxuryCar() {
    this.carGroup = new THREE.Group();
    this.carGroup.position.set(0, -0.65, 0);

    // 1. Paint Materials
    this.carMaterials.body = new THREE.MeshStandardMaterial({
      color: 0x111318,
      metalness: 0.92,
      roughness: 0.2,
      envMapIntensity: 1.5
    });

    this.carMaterials.chrome = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.98,
      roughness: 0.1
    });

    this.carMaterials.glass = new THREE.MeshStandardMaterial({
      color: 0x050810,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.88
    });

    this.carMaterials.interior = new THREE.MeshStandardMaterial({
      color: 0x3d2712, // Rich Saddle/Mandarin Leather
      metalness: 0.2,
      roughness: 0.7
    });

    this.carMaterials.tires = new THREE.MeshStandardMaterial({
      color: 0x141416,
      metalness: 0.1,
      roughness: 0.85
    });

    this.carMaterials.headlights = new THREE.MeshBasicMaterial({
      color: 0xfffae0
    });

    this.carMaterials.taillights = new THREE.MeshBasicMaterial({
      color: 0xff1e28
    });

    // 2. Main Lower Chassis & Body
    const lowerBodyGeo = new THREE.BoxGeometry(2.1, 0.55, 4.8);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, this.carMaterials.body);
    lowerBody.position.y = 0;
    this.carGroup.add(lowerBody);

    // Aerodynamic Hood Slope
    const hoodGeo = new THREE.BoxGeometry(2.04, 0.32, 1.6);
    const hood = new THREE.Mesh(hoodGeo, this.carMaterials.body);
    hood.position.set(0, 0.22, 1.45);
    hood.rotation.x = -0.07;
    this.carGroup.add(hood);

    // Front Prestige Grille (Rolls / Maybach vertical chrome profile)
    const grilleGeo = new THREE.BoxGeometry(1.2, 0.48, 0.1);
    const grille = new THREE.Mesh(grilleGeo, this.carMaterials.chrome);
    grille.position.set(0, 0.12, 2.41);
    this.carGroup.add(grille);

    // Hood Mascot / Emblem
    const mascotGeo = new THREE.ConeGeometry(0.04, 0.12, 8);
    const mascot = new THREE.Mesh(mascotGeo, this.carMaterials.chrome);
    mascot.position.set(0, 0.42, 2.25);
    mascot.rotation.x = -0.2;
    this.carGroup.add(mascot);

    // 3. Cabin & Greenhouse Roof (Sloped Luxury Silhouette)
    const cabinGeo = new THREE.BoxGeometry(1.86, 0.58, 2.5);
    const cabin = new THREE.Mesh(cabinGeo, this.carMaterials.glass);
    cabin.position.set(0, 0.5, -0.2);
    this.carGroup.add(cabin);

    // Roof Top Shell
    const roofGeo = new THREE.BoxGeometry(1.78, 0.08, 2.2);
    const roof = new THREE.Mesh(roofGeo, this.carMaterials.body);
    roof.position.set(0, 0.8, -0.25);
    this.carGroup.add(roof);

    // Side Mirrors
    const mirrorGeo = new THREE.BoxGeometry(0.22, 0.1, 0.15);
    const leftMirror = new THREE.Mesh(mirrorGeo, this.carMaterials.body);
    leftMirror.position.set(-1.12, 0.45, 0.8);
    const rightMirror = new THREE.Mesh(mirrorGeo, this.carMaterials.body);
    rightMirror.position.set(1.12, 0.45, 0.8);
    this.carGroup.add(leftMirror);
    this.carGroup.add(rightMirror);

    // 4. Front LED Headlight Strips
    const headLGeo = new THREE.BoxGeometry(0.42, 0.08, 0.08);
    const headL1 = new THREE.Mesh(headLGeo, this.carMaterials.headlights);
    headL1.position.set(-0.76, 0.22, 2.4);
    const headL2 = new THREE.Mesh(headLGeo, this.carMaterials.headlights);
    headL2.position.set(0.76, 0.22, 2.4);
    this.carGroup.add(headL1);
    this.carGroup.add(headL2);

    // 5. Rear Continuous LED Lightbar
    const tailGeo = new THREE.BoxGeometry(1.9, 0.07, 0.08);
    const taillight = new THREE.Mesh(tailGeo, this.carMaterials.taillights);
    taillight.position.set(0, 0.25, -2.41);
    this.carGroup.add(taillight);

    // Rear Dual Exhaust Chrome Tips
    const exhGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 12);
    const exhL = new THREE.Mesh(exhGeo, this.carMaterials.chrome);
    exhL.rotation.x = Math.PI / 2;
    exhL.position.set(-0.7, -0.15, -2.42);
    const exhR = new THREE.Mesh(exhGeo, this.carMaterials.chrome);
    exhR.rotation.x = Math.PI / 2;
    exhR.position.set(0.7, -0.15, -2.42);
    this.carGroup.add(exhL);
    this.carGroup.add(exhR);

    // 6. Wheels (4 Luxury Multi-Spoke Wheels with Gold Calipers)
    const wheelPositions = [
      { x: -1.06, y: -0.28, z: 1.45 },
      { x: 1.06, y: -0.28, z: 1.45 },
      { x: -1.06, y: -0.28, z: -1.45 },
      { x: 1.06, y: -0.28, z: -1.45 }
    ];

    wheelPositions.forEach((pos, idx) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(pos.x, pos.y, pos.z);

      // Rubber Tire
      const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.25, 24);
      const tire = new THREE.Mesh(tireGeo, this.carMaterials.tires);
      tire.rotation.z = Math.PI / 2;
      wheelAssembly.add(tire);

      // Chrome / Gold Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.26, 16);
      const rim = new THREE.Mesh(rimGeo, this.carMaterials.chrome);
      rim.rotation.z = Math.PI / 2;
      wheelAssembly.add(rim);

      // Center Monogram Cap
      const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.27, 12);
      const cap = new THREE.Mesh(capGeo, this.carMaterials.body);
      cap.rotation.z = Math.PI / 2;
      wheelAssembly.add(cap);

      this.carWheelMeshes.push(wheelAssembly);
      this.carGroup.add(wheelAssembly);
    });

    // Shadow Plane under vehicle
    const shadowGeo = new THREE.PlaneGeometry(2.6, 5.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.55
    });
    const carShadow = new THREE.Mesh(shadowGeo, shadowMat);
    carShadow.rotation.x = -Math.PI / 2;
    carShadow.position.set(0, -0.64, 0);
    this.carGroup.add(carShadow);

    this.scene.add(this.carGroup);
  }

  // =========================================================================
  // CAR SYNCHRONIZATION WITH CAROUSEL
  // =========================================================================
  setCarTheme(index, carData) {
    if (!this.carGroup) return;

    // Angles configured for breathtaking 3D perspectives on card change:
    // 0: Rolls-Royce Cullinan (Prestige Front-Quarter 35°)
    // 1: Mercedes-Benz S580 (Executive Angled Profile -30°)
    // 2: Mercedes-Benz G63 (Commanding 45°)
    // 3: Range Rover Autobiography (Sleek Profile -50°)
    // 4: Cadillac Escalade (Grand Frontal Stance 15°)
    const angles = [0.45, -0.5, 0.75, -0.85, 0.2];
    this.targetRotationY = angles[index % angles.length];

    // Subtle paint color accent tuning
    if (this.carMaterials.body) {
      if (index === 0) {
        this.carMaterials.body.color.setHex(0x10131a); // Diamond Black
        if (this.underglowLight) this.underglowLight.color.setHex(0xd4af37);
      } else if (index === 1) {
        this.carMaterials.body.color.setHex(0x1a1e28); // Obsidian Metallic
        if (this.underglowLight) this.underglowLight.color.setHex(0xc0c0c0);
      } else if (index === 2) {
        this.carMaterials.body.color.setHex(0x0e0e12); // Night Black Matte
        if (this.underglowLight) this.underglowLight.color.setHex(0xe6b800);
      } else if (index === 3) {
        this.carMaterials.body.color.setHex(0x131a16); // British Santorini Black
        if (this.underglowLight) this.underglowLight.color.setHex(0xd4af37);
      } else if (index === 4) {
        this.carMaterials.body.color.setHex(0x161519); // Black Raven
        if (this.underglowLight) this.underglowLight.color.setHex(0xc9a050);
      }
    }
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Mobile gyroscope orientation
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma && e.beta) {
        this.mouse.targetX = (e.gamma / 60);
        this.mouse.targetY = (e.beta / 60);
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Gentle mouse damping
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.03;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.03;

    // Smooth Turn of the 3D Car with mouse hover influence
    if (this.carGroup) {
      const targetAngleWithMouse = this.targetRotationY + this.mouse.x * 0.18;
      this.currentRotationY += (targetAngleWithMouse - this.currentRotationY) * 0.045;
      this.carGroup.rotation.y = this.currentRotationY;

      // Subtle vertical floating breath
      this.carGroup.position.y = -0.65 + Math.sin(Date.now() * 0.0015) * 0.02;

      // Rotate turntable under the car smoothly
      if (this.pedestal) {
        this.pedestal.rotation.y = this.currentRotationY * 0.4;
      }
    }

    // Steady, presidential camera parallax
    this.camera.position.x = this.mouse.x * 0.3;
    this.camera.position.y = 1.8 + this.mouse.y * 0.15;
    this.camera.lookAt(0, 0.1, 0);

    // Subtle spotlight movement
    if (this.mainSpot) {
      this.mainSpot.position.x = this.mouse.x * 2.5;
      this.mainSpot.position.z = 4 + this.mouse.y * 1.2;
    }

    // Slowly rotate gold particle dust
    if (this.particles) {
      this.particles.rotation.y += 0.0004;
      this.particles.rotation.x += 0.00015;
    }

    // Slowly rotate light rings
    if (this.ringsGroup) {
      this.ringsGroup.children.forEach((ring, idx) => {
        ring.rotation.z += (idx % 2 === 0 ? 0.0006 : -0.0006) * (idx + 1);
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

export function initThreeScene(canvasId) {
  return new LuxuryShowroomScene(canvasId);
}
