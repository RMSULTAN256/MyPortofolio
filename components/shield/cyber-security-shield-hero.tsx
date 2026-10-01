"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, X, Cpu, Server, Terminal, Cloud, Network, Shield } from "lucide-react";

export interface SkillNodeData {
  id: string;
  name: string;
  role: string;
  category: "Fullstack" | "DevOps & Cloud" | "Cyber Security" | "Scripting";
  description: string;
  highlights: string[];
  icon: any;
}

const SKILL_NODES: SkillNodeData[] = [
  {
    id: "laravel",
    name: "Laravel",
    role: "Backend & Secure Web Architecture",
    category: "Fullstack",
    description:
      "Engineered robust full-stack systems with strict CSRF protection, encrypted sessions, Eloquent ORM sanitization against SQLi, and multi-role RBAC authorization.",
    highlights: ["MFA & WhatsApp OTP Authentication", "Custom Middleware Security", "REST API Token Hardening"],
    icon: Server,
  },
  {
    id: "docker",
    name: "Docker",
    role: "Container Isolation & Sandboxing",
    category: "DevOps & Cloud",
    description:
      "Deploying lightweight isolated container environments for vulnerable CTF lab challenges, rootless containers, and reproducible deployment pipelines.",
    highlights: ["Isolated Network Bridges", "Minimal Alpine Security Images", "Non-Root Daemon Constraints"],
    icon: Cpu,
  },
  {
    id: "kali",
    name: "Kali Linux",
    role: "Offensive Security & Pen-Testing",
    category: "Cyber Security",
    description:
      "Vulnerability assessment, security scanning, packet sniffing, and threat emulation for web application penetration testing and MITRE ATT&CK mitigation.",
    highlights: ["Burp Suite / Nmap / Metasploit", "OWASP Top 10 Web Exploitation", "Network Reconnaissance"],
    icon: Terminal,
  },
  {
    id: "golang",
    name: "Golang",
    role: "High-Performance Backend & Security Tools",
    category: "Scripting",
    description:
      "Developing high-throughput concurrent backend services, custom network scanners, fast packet analyzers, and automated security monitoring systems.",
    highlights: ["Concurrent Goroutine Scanners", "Fast Socket & Packet Tooling", "Memory-Safe Backend Services"],
    icon: Terminal,
  },
  {
    id: "redhat",
    name: "Red Hat (RHEL)",
    role: "Enterprise Linux & Hardening (RHCSA)",
    category: "Cyber Security",
    description:
      "Enterprise Linux server administration (RHCSA certified), firewalld rules, SELinux enforcement, systemd service locking, and storage management (LVM).",
    highlights: ["RHCSA Certified (EX200)", "SELinux Enforcing Security", "LVM & Storage Administration"],
    icon: Server,
  },
  {
    id: "devsecops",
    name: "DevSecOps",
    role: "Automated Security & CI/CD Hardening",
    category: "DevOps & Cloud",
    description:
      "Integrating automated vulnerability scanning, container security audits, and secure deployment workflows into CI/CD pipelines.",
    highlights: ["Automated Security Pipelines", "Container Vulnerability Auditing", "Secure SDLC Implementation"],
    icon: Shield,
  },
];

export function CyberSecurityShieldHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const defaultCamPos = useRef({ x: 0, y: 0.1, z: 5.4 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // 1. Scene & Camera (100% transparent - zero clipping box)
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(defaultCamPos.current.x, defaultCamPos.current.y, defaultCamPos.current.z);
    cameraRef.current = camera;

    // 2. WebGL Renderer with full alpha transparency
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent clear color
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    // 3. OrbitControls clamped to front hemisphere (no 180° / 360° flip!)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = false; // We use smooth sine-wave sway instead
    controls.minDistance = 3.2;
    controls.maxDistance = 7.0;
    // Clamping azimuth so user can NEVER rotate around to the back of the shield:
    controls.minAzimuthAngle = -Math.PI / 4.8; // ~ -37.5 degrees
    controls.maxAzimuthAngle = Math.PI / 4.8;  // ~ +37.5 degrees
    controls.minPolarAngle = Math.PI / 2.4;    // ~ 75 degrees
    controls.maxPolarAngle = Math.PI / 1.85;   // ~ 97 degrees
    controlsRef.current = controls;

    let isUserInteracting = false;
    let idleTimer: NodeJS.Timeout | null = null;

    const onInteractionStart = () => {
      isUserInteracting = true;
      if (idleTimer) clearTimeout(idleTimer);
    };

    const onInteractionEnd = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isUserInteracting = false;
      }, 1500);
    };

    controls.addEventListener("start", onInteractionStart);
    controls.addEventListener("end", onInteractionEnd);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.2);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x00f0ff, 3.0);
    cyanLight.position.set(5, 7, 5);
    scene.add(cyanLight);

    const whiteLight = new THREE.DirectionalLight(0xffffff, 2.0);
    whiteLight.position.set(-5, 4, 4);
    scene.add(whiteLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 4.5, 9);
    pointLight.position.set(0, 0, 0.7);
    scene.add(pointLight);

    // 5. Radial Tron Cyber Grid Pedestal (Circular with natural falloff - ZERO square box edges!)
    const gridGroup = new THREE.Group();
    gridGroup.position.y = -1.9;
    scene.add(gridGroup);

    // Concentric coordinate rings fading toward the outer radius
    const ringRadii = [0.6, 1.1, 1.6, 2.1, 2.6, 3.2];
    const ringOpacities = [0.35, 0.28, 0.20, 0.14, 0.08, 0.03];
    const ringMeshes: THREE.Line[] = [];

    ringRadii.forEach((radius, idx) => {
      const ringGeo = new THREE.BufferGeometry();
      const segments = 48;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      ringGeo.setFromPoints(pts);
      const ringMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: ringOpacities[idx],
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Line(ringGeo, ringMat);
      gridGroup.add(ringMesh);
      ringMeshes.push(ringMesh);
    });

    // Radial spokes radiating outward from center
    const spokeCount = 12;
    const spokePoints: THREE.Vector3[] = [];
    for (let i = 0; i < spokeCount; i++) {
      const theta = (i / spokeCount) * Math.PI * 2;
      spokePoints.push(
        new THREE.Vector3(Math.cos(theta) * 0.6, 0, Math.sin(theta) * 0.6),
        new THREE.Vector3(Math.cos(theta) * 2.8, 0, Math.sin(theta) * 2.8)
      );
    }
    const spokeGeo = new THREE.BufferGeometry().setFromPoints(spokePoints);
    const spokeMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const spokes = new THREE.LineSegments(spokeGeo, spokeMat);
    gridGroup.add(spokes);

    // Main Group for Shield & Core
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    // Procedural Hexagon Shape Generator
    function createHexagonShape(radius: number, stretchY = 1.22): THREE.Shape {
      const shape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * stretchY;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      return shape;
    }

    // LAYER 1: Base Heavy Armor Plate (ExtrudeGeometry, dark gunmetal)
    const baseShape = createHexagonShape(1.22, 1.22);
    const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.88,
      roughness: 0.25,
      emissive: 0x0284c7,
      emissiveIntensity: 0.15,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.z = -0.06;
    shieldGroup.add(baseMesh);

    const baseEdgeGeo = new THREE.EdgesGeometry(baseGeo);
    const baseEdgeMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const baseEdges = new THREE.LineSegments(baseEdgeGeo, baseEdgeMat);
    baseMesh.add(baseEdges);

    // LAYER 2: Mid Reinforcement Armor Plate
    const midShape = createHexagonShape(0.95, 1.2);
    const midGeo = new THREE.ExtrudeGeometry(midShape, {
      depth: 0.09,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    const midMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.92,
      roughness: 0.2,
      emissive: 0x0369a1,
      emissiveIntensity: 0.15,
    });
    const midMesh = new THREE.Mesh(midGeo, midMat);
    midMesh.position.z = 0.06;
    shieldGroup.add(midMesh);

    const midEdgeGeo = new THREE.EdgesGeometry(midGeo);
    const midEdgeMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const midEdges = new THREE.LineSegments(midEdgeGeo, midEdgeMat);
    midMesh.add(midEdges);

    // LAYER 3: Inner Carbon Shield Plate
    const innerShape = createHexagonShape(0.68, 1.16);
    const innerGeo = new THREE.ExtrudeGeometry(innerShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x050811,
      metalness: 0.85,
      roughness: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.position.z = 0.15;
    shieldGroup.add(innerMesh);

    const innerEdgeGeo = new THREE.EdgesGeometry(innerGeo);
    const innerEdgeMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const innerEdges = new THREE.LineSegments(innerEdgeGeo, innerEdgeMat);
    innerMesh.add(innerEdges);

    // 6. Surface Glowing Circuit Pattern (#00F0FF)
    const circuitPoints: THREE.Vector3[] = [];
    const circuitCoords = [
      [-0.8, 0.72, 0.19], [-0.45, 0.72, 0.19], [-0.3, 0.45, 0.19], [-0.18, 0.45, 0.19],
      [0.8, 0.72, 0.19], [0.45, 0.72, 0.19], [0.3, 0.45, 0.19], [0.18, 0.45, 0.19],
      [-0.7, -0.65, 0.19], [-0.4, -0.65, 0.19], [-0.25, -0.38, 0.19], [-0.15, -0.38, 0.19],
      [0.7, -0.65, 0.19], [0.4, -0.65, 0.19], [0.25, -0.38, 0.19], [0.15, -0.38, 0.19],
      [-0.9, 0.05, 0.19], [-0.5, 0.05, 0.19], [-0.35, 0.18, 0.19],
      [0.9, 0.05, 0.19], [0.5, 0.05, 0.19], [0.35, 0.18, 0.19],
    ];

    for (let i = 0; i < circuitCoords.length; i += 2) {
      if (circuitCoords[i + 1]) {
        circuitPoints.push(
          new THREE.Vector3(...circuitCoords[i]),
          new THREE.Vector3(...circuitCoords[i + 1])
        );
      }
    }
    const circuitGeo = new THREE.BufferGeometry().setFromPoints(circuitPoints);
    const circuitMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const circuitLines = new THREE.LineSegments(circuitGeo, circuitMat);
    shieldGroup.add(circuitLines);

    // Micro solder pad nodes
    const padGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const padMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    circuitCoords.forEach((coord) => {
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.position.set(coord[0], coord[1], coord[2]);
      shieldGroup.add(padMesh);
    });

    // 7. Central Holographic Pulsing Core (#00F0FF emissive)
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0, 0.22);
    shieldGroup.add(coreGroup);

    const coreSphereGeo = new THREE.SphereGeometry(0.2, 20, 20);
    const coreSphereMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    coreGroup.add(coreSphere);

    const ring1Geo = new THREE.TorusGeometry(0.36, 0.016, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(0.48, 0.012, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3.5;
    coreGroup.add(ring2);

    // Additive glow flare behind core
    const flareGeo = new THREE.RingGeometry(0.2, 0.6, 32);
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const flareMesh = new THREE.Mesh(flareGeo, flareMat);
    coreGroup.add(flareMesh);

    // 8. 6 Network Graph Skill Nodes (SphereGeometry)
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    const nodeCoordsArr = [
      new THREE.Vector3(-1.85, 0.95, 0.35),  // Laravel
      new THREE.Vector3(1.85, 0.95, 0.35),   // Docker
      new THREE.Vector3(2.15, -0.15, 0.45),  // Kali Linux
      new THREE.Vector3(1.35, -1.1, 0.55),   // Python
      new THREE.Vector3(-1.35, -1.1, 0.55),  // AWS
      new THREE.Vector3(-2.15, -0.15, 0.45), // Network Security
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.12, 18, 18);

    SKILL_NODES.forEach((skillData, idx) => {
      const pos = nodeCoordsArr[idx];
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 1.5,
        roughness: 0.15,
        metalness: 0.85,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      nodeMesh.userData = { skillData };

      // Outer glowing ring halo
      const haloGeo = new THREE.RingGeometry(0.15, 0.2, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.lookAt(camera.position);
      nodeMesh.add(halo);

      networkGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
    });

    // Connecting Network Graph Lines
    const shieldAnchors = [
      new THREE.Vector3(-0.85, 0.45, 0.15),
      new THREE.Vector3(0.85, 0.45, 0.15),
      new THREE.Vector3(0.95, -0.1, 0.15),
      new THREE.Vector3(0.55, -0.85, 0.15),
      new THREE.Vector3(-0.55, -0.85, 0.15),
      new THREE.Vector3(-0.95, -0.1, 0.15),
    ];

    const netLinesPoints: THREE.Vector3[] = [];
    nodeCoordsArr.forEach((pos, idx) => {
      netLinesPoints.push(pos, shieldAnchors[idx]);
      const nextPos = nodeCoordsArr[(idx + 1) % nodeCoordsArr.length];
      netLinesPoints.push(pos, nextPos);
    });

    const netLinesGeo = new THREE.BufferGeometry().setFromPoints(netLinesPoints);
    const netLinesMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const netLines = new THREE.LineSegments(netLinesGeo, netLinesMat);
    networkGroup.add(netLines);

    // 9. Data Flow Moving Particles (THREE.Points)
    const particleCount = 75;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.5 + Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 2.8;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.045,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 10. Raycaster: Hover (scale 1.5x, pointer cursor) & Click (open panel)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let currentHovered: THREE.Mesh | null = null;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes, false);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        if (currentHovered !== mesh) {
          if (currentHovered) {
            currentHovered.scale.set(1.0, 1.0, 1.0);
          }
          currentHovered = mesh;
          currentHovered.scale.set(1.5, 1.5, 1.5);
          container.style.cursor = "pointer";
        }
      } else {
        if (currentHovered) {
          currentHovered.scale.set(1.0, 1.0, 1.0);
          currentHovered = null;
          container.style.cursor = "default";
        }
      }
    };

    const onPointerClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes, false);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const skill = mesh.userData.skillData as SkillNodeData;
        if (skill) {
          setSelectedNode(skill);
        }
      }
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("click", onPointerClick);

    // 11. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 12. Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      controls.update();

      // Pulsing core (#00F0FF pulse)
      const pulse = 1 + Math.sin(elapsedTime * 3.5) * 0.18;
      coreSphere.scale.set(pulse, pulse, pulse);
      ring1.rotation.z = elapsedTime * 0.9;
      ring2.rotation.z = -elapsedTime * 0.7;
      ring2.rotation.y = elapsedTime * 0.5;

      // Gentle left-right oscillation (sways ±20° left-right, NEVER flips 180°)
      if (!isUserInteracting) {
        const swayY = Math.sin(elapsedTime * 0.75) * 0.35; // ~20 degrees left-right
        const swayX = Math.cos(elapsedTime * 0.5) * 0.05;  // subtle breathing tilt
        shieldGroup.rotation.y = THREE.MathUtils.lerp(shieldGroup.rotation.y, swayY, 0.05);
        shieldGroup.rotation.x = THREE.MathUtils.lerp(shieldGroup.rotation.x, swayX, 0.05);
        networkGroup.rotation.y = THREE.MathUtils.lerp(networkGroup.rotation.y, swayY * 0.75, 0.05);
      }

      // Gentle floating breathing motion on shield
      shieldGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.04;

      // Update particle positions (data flow simulation)
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        const angle = Math.atan2(z, x) + 0.008;
        const rad = Math.sqrt(x * x + z * z);
        positions[i * 3] = Math.cos(angle) * rad;
        positions[i * 3 + 2] = Math.sin(angle) * rad;
        positions[i * 3 + 1] += Math.sin(elapsedTime * 2 + i) * 0.003;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Ensure node halos face camera
      nodeMeshes.forEach((mesh) => {
        const halo = mesh.children[0];
        if (halo) halo.lookAt(camera.position);
      });

      // Render directly with transparent background (ZERO black box!)
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (idleTimer) clearTimeout(idleTimer);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("click", onPointerClick);

      controls.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      baseEdgeGeo.dispose();
      baseEdgeMat.dispose();
      midGeo.dispose();
      midMat.dispose();
      midEdgeGeo.dispose();
      midEdgeMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      innerEdgeGeo.dispose();
      innerEdgeMat.dispose();
      circuitGeo.dispose();
      circuitMat.dispose();
      padGeo.dispose();
      padMat.dispose();
      coreSphereGeo.dispose();
      coreSphereMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      flareGeo.dispose();
      flareMat.dispose();
      nodeGeo.dispose();
      netLinesGeo.dispose();
      netLinesMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      spokeGeo.dispose();
      spokeMat.dispose();
      ringMeshes.forEach((r) => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleResetView = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(
        defaultCamPos.current.x,
        defaultCamPos.current.y,
        defaultCamPos.current.z
      );
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      setSelectedNode(null);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full select-none overflow-hidden pointer-events-auto">
      {/* 3D WebGL Canvas filling the hero section background */}
      <div
        ref={containerRef}
        className="w-full h-full touch-none cursor-grab active:cursor-grabbing bg-transparent"
      />

      {/* Floating HUD controls (Reset View & hint) */}
      <div className="absolute bottom-4 right-4 sm:right-8 z-30 flex items-center gap-2 pointer-events-auto">
        <span className="text-[10px] font-mono text-cyan-400/60 hidden sm:inline">
          Drag • Scroll • Click node
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleResetView}
          className="rounded-full text-xs h-7 px-2.5 gap-1.5 bg-background/70 backdrop-blur-md border-cyan-500/30 text-foreground hover:bg-cyan-500/20 hover:border-cyan-500 transition-all shadow-sm"
        >
          <RefreshCw className="w-3 h-3 text-cyan-400" />
          <span>Reset View</span>
        </Button>
      </div>

      {/* Floating HTML Info Panel (Raycaster click on node) */}
      {selectedNode && (
        <div className="absolute top-6 right-4 sm:right-8 w-72 sm:w-80 z-40 animate-in fade-in slide-in-from-right-4 duration-300 text-left pointer-events-auto">
          <Card className="border border-cyan-500/40 bg-background/95 backdrop-blur-xl shadow-2xl text-foreground text-left">
            <CardHeader className="p-3.5 pb-1.5 flex flex-row items-start justify-between space-y-0">
              <div className="flex flex-col items-start gap-1 text-left">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 self-start">
                  {selectedNode.category}
                </span>
                <CardTitle className="text-sm font-bold font-heading text-white flex items-center gap-2 text-left">
                  <selectedNode.icon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>{selectedNode.name}</span>
                </CardTitle>
                <p className="text-[11px] text-cyan-300/80 font-mono text-left">
                  {selectedNode.role}
                </p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-muted-foreground hover:text-white p-1 rounded-md transition-colors"
                aria-label="Close skill details"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </CardHeader>
            <CardContent className="p-3.5 pt-1.5 space-y-2.5 text-xs">
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                {selectedNode.description}
              </p>

              <div className="space-y-1 pt-1.5 border-t border-border/50">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                  HIGHLIGHTS:
                </span>
                <ul className="space-y-0.5 text-[10px] font-mono">
                  {selectedNode.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-foreground/90">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
