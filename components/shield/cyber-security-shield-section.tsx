"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, RefreshCw, X, Cpu, Server, Terminal, Lock, Cloud, Network } from "lucide-react";

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
      "Engineered robust full-stack systems with strict CSRF tokens, encrypted sessions, Eloquent ORM sanitization against SQLi, and multi-role RBAC authorization.",
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

export function CyberSecurityShieldSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const defaultCamPos = useRef({ x: 0, y: 0.6, z: 5.2 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 560;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(defaultCamPos.current.x, defaultCamPos.current.y, defaultCamPos.current.z);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    // 3. Post-Processing: UnrealBloomPass
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.1, // strength
      0.35, // radius
      0.65 // threshold
    );
    composer.addPass(bloomPass);

    // 4. OrbitControls with 3-Second Idle Auto-Rotate
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 3.0;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Restrict from going below Tron floor
    controlsRef.current = controls;

    let idleTimer: NodeJS.Timeout | null = null;
    const startIdleTimer = () => {
      controls.autoRotate = false;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 3000);
    };

    controls.addEventListener("start", startIdleTimer);
    controls.addEventListener("change", () => {
      if (!controls.autoRotate) {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          controls.autoRotate = true;
        }, 3000);
      }
    });

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a0e17, 1.8);
    scene.add(ambientLight);

    // Cyan Directional Light
    const cyanLight = new THREE.DirectionalLight(0x00f0ff, 2.8);
    cyanLight.position.set(5, 7, 5);
    scene.add(cyanLight);

    // White Directional Light
    const whiteLight = new THREE.DirectionalLight(0xffffff, 1.8);
    whiteLight.position.set(-5, 4, 4);
    scene.add(whiteLight);

    // Core Point Light
    const pointLight = new THREE.PointLight(0x00f0ff, 4.0, 10);
    pointLight.position.set(0, 0, 0.7);
    scene.add(pointLight);

    // 6. Tron Cyber Grid Floor
    const gridHelper = new THREE.GridHelper(26, 32, 0x00f0ff, 0x0284c7);
    gridHelper.position.y = -2.2;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.22;
    scene.add(gridHelper);

    // Main Group for Shield
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
    const baseShape = createHexagonShape(1.25, 1.22);
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
      emissiveIntensity: 0.1,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.z = -0.06;
    shieldGroup.add(baseMesh);

    const baseEdgeGeo = new THREE.EdgesGeometry(baseGeo);
    const baseEdgeMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.7,
    });
    const baseEdges = new THREE.LineSegments(baseEdgeGeo, baseEdgeMat);
    baseMesh.add(baseEdges);

    // LAYER 2: Mid Reinforcement Armor Plate
    const midShape = createHexagonShape(0.96, 1.2);
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
      emissiveIntensity: 0.12,
    });
    const midMesh = new THREE.Mesh(midGeo, midMat);
    midMesh.position.z = 0.06;
    shieldGroup.add(midMesh);

    const midEdgeGeo = new THREE.EdgesGeometry(midGeo);
    const midEdgeMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
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
    });
    const innerEdges = new THREE.LineSegments(innerEdgeGeo, innerEdgeMat);
    innerMesh.add(innerEdges);

    // 7. Surface Glowing Circuit Pattern
    const circuitPoints: THREE.Vector3[] = [];
    const circuitCoords = [
      // Top left
      [-0.8, 0.72, 0.19], [-0.45, 0.72, 0.19], [-0.3, 0.45, 0.19], [-0.18, 0.45, 0.19],
      // Top right
      [0.8, 0.72, 0.19], [0.45, 0.72, 0.19], [0.3, 0.45, 0.19], [0.18, 0.45, 0.19],
      // Bottom left
      [-0.7, -0.65, 0.19], [-0.4, -0.65, 0.19], [-0.25, -0.38, 0.19], [-0.15, -0.38, 0.19],
      // Bottom right
      [0.7, -0.65, 0.19], [0.4, -0.65, 0.19], [0.25, -0.38, 0.19], [0.15, -0.38, 0.19],
      // Horizontal traces
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

    // 8. Central Holographic Pulsing Core (#00F0FF emissive)
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0, 0.22);
    shieldGroup.add(coreGroup);

    const coreSphereGeo = new THREE.SphereGeometry(0.2, 20, 20);
    const coreSphereMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    });
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    coreGroup.add(coreSphere);

    const ring1Geo = new THREE.TorusGeometry(0.36, 0.016, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(0.48, 0.012, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.7,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3.5;
    coreGroup.add(ring2);

    // 9. 6 Network Graph Skill Nodes (SphereGeometry)
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // Coordinates positioned around the shield perimeter
    const nodeCoordsArr = [
      new THREE.Vector3(-2.2, 1.3, 0.4),  // Laravel
      new THREE.Vector3(2.2, 1.3, 0.4),   // Docker
      new THREE.Vector3(2.6, -0.3, 0.6),  // Kali Linux
      new THREE.Vector3(1.7, -1.6, 0.8),  // Python
      new THREE.Vector3(-1.7, -1.6, 0.8), // AWS
      new THREE.Vector3(-2.6, -0.3, 0.6), // Network Security
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.14, 18, 18);

    SKILL_NODES.forEach((skillData, idx) => {
      const pos = nodeCoordsArr[idx];
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 1.2,
        roughness: 0.15,
        metalness: 0.85,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      nodeMesh.userData = { skillData };

      // Outer glowing ring halo
      const haloGeo = new THREE.RingGeometry(0.18, 0.22, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.lookAt(camera.position);
      nodeMesh.add(halo);

      networkGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
    });

    // Connecting Network Graph Lines (Lines between nodes and shield anchors)
    const shieldAnchors = [
      new THREE.Vector3(-0.95, 0.6, 0.15),
      new THREE.Vector3(0.95, 0.6, 0.15),
      new THREE.Vector3(1.1, -0.2, 0.15),
      new THREE.Vector3(0.65, -1.05, 0.15),
      new THREE.Vector3(-0.65, -1.05, 0.15),
      new THREE.Vector3(-1.1, -0.2, 0.15),
    ];

    const netLinesPoints: THREE.Vector3[] = [];
    nodeCoordsArr.forEach((pos, idx) => {
      // Connect to shield anchor
      netLinesPoints.push(pos, shieldAnchors[idx]);
      // Connect to next neighboring node
      const nextPos = nodeCoordsArr[(idx + 1) % nodeCoordsArr.length];
      netLinesPoints.push(pos, nextPos);
    });

    const netLinesGeo = new THREE.BufferGeometry().setFromPoints(netLinesPoints);
    const netLinesMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.5,
    });
    const netLines = new THREE.LineSegments(netLinesGeo, netLinesMat);
    networkGroup.add(netLines);

    // 10. Data Flow Moving Particles (THREE.Points)
    const particleCount = 80;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.6 + Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.2;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.006,
        z: (Math.random() - 0.5) * 0.008,
      });
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 11. Raycaster: Hover (scale 1.5x, pointer cursor) & Click (open panel)
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
          // Scale 1.5x on hover
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

    // 12. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
          composer.setSize(newW, newH);
          bloomPass.resolution.set(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 13. Render Loop
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

      // Gentle floating breathing motion on shield
      shieldGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.05;

      // Update particle positions (data flow simulation)
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Orbit around Y
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        const angle = Math.atan2(z, x) + 0.008;
        const rad = Math.sqrt(x * x + z * z);
        positions[i * 3] = Math.cos(angle) * rad;
        positions[i * 3 + 2] = Math.sin(angle) * rad;

        // Subtle vertical float
        positions[i * 3 + 1] += Math.sin(elapsedTime * 2 + i) * 0.003;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Ensure node halos always face the camera
      nodeMeshes.forEach((mesh) => {
        const halo = mesh.children[0];
        if (halo) halo.lookAt(camera.position);
      });

      composer.render();
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
      nodeGeo.dispose();
      netLinesGeo.dispose();
      netLinesMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      gridHelper.dispose();
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
      controlsRef.current.autoRotate = true;
      controlsRef.current.update();
      setSelectedNode(null);
    }
  };

  return (
    <section className="relative w-full my-12 overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#0a0e17] shadow-2xl">
      {/* 3D Canvas Container (500-600px height) */}
      <div
        ref={containerRef}
        className="w-full h-[520px] sm:h-[580px] touch-none select-none relative"
      />

      {/* Top Left Title / Status Badge */}
      <div className="absolute top-5 left-5 pointer-events-none z-20">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>CYBER DEFENSE PERIMETER // 3D SHIELD</span>
        </div>
      </div>

      {/* Top Right Guidance Text */}
      <div className="absolute top-5 right-5 pointer-events-none z-20 hidden md:block">
        <div className="text-right text-[11px] font-mono text-muted-foreground/80 space-y-0.5">
          <p>Drag to Rotate • Scroll to Zoom</p>
          <p className="text-cyan-400">Click any skill node to inspect diagnostics</p>
        </div>
      </div>

      {/* Bottom Right UI Button: Reset View */}
      <div className="absolute bottom-5 right-5 z-20">
        <Button
          size="sm"
          variant="outline"
          onClick={handleResetView}
          className="rounded-full text-xs h-8 px-3.5 gap-1.5 bg-background/80 backdrop-blur-md border-cyan-500/30 text-foreground hover:bg-cyan-500/20 hover:border-cyan-500 transition-all shadow-lg"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset View</span>
        </Button>
      </div>

      {/* Side HTML Info Panel (Raycaster click on node) */}
      {selectedNode && (
        <div className="absolute top-16 right-4 sm:right-6 w-80 sm:w-96 z-30 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
          <Card className="border border-cyan-500/40 bg-[#0a0e17]/95 backdrop-blur-xl shadow-2xl text-foreground text-left">
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
              <div className="flex flex-col items-start gap-1 text-left">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 self-start">
                  {selectedNode.category}
                </span>
                <CardTitle className="text-base font-bold font-heading text-white flex items-center gap-2 text-left">
                  <selectedNode.icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>{selectedNode.name}</span>
                </CardTitle>
                <p className="text-xs text-cyan-300/80 font-mono text-left">
                  {selectedNode.role}
                </p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-muted-foreground hover:text-white p-1 rounded-md transition-colors"
                aria-label="Close skill details"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                {selectedNode.description}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                  SECURITY & TECHNICAL HIGHLIGHTS:
                </span>
                <ul className="space-y-1 text-[11px] font-mono">
                  {selectedNode.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-foreground/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
