"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Shield, Activity, Lock, Cpu, Globe, Key, X, RotateCw, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

export interface SecurityNodeData {
  id: string;
  name: string;
  category: string;
  status: string;
  threatLevel: "Secure" | "Guarded" | "High";
  latency: string;
  description: string;
  specs: string[];
}

const SECURITY_NODES: SecurityNodeData[] = [
  {
    id: "firewall",
    name: "Adaptive Packet Filter",
    category: "Network Defense",
    status: "Active (Firewalld / iptables)",
    threatLevel: "Secure",
    latency: "0.4 ms",
    description:
      "Enterprise stateful packet inspection blocking unauthorized SYN floods, spoofed IP frames, and illicit port scanning.",
    specs: ["Firewalld Rules: Enforced", "Dropped Probes: 1,420/hr", "TCP SYN Flood: Protected"],
  },
  {
    id: "selinux",
    name: "SELinux Kernel Shield",
    category: "System Integrity",
    status: "Enforcing (RHCSA Policy)",
    threatLevel: "Secure",
    latency: "< 0.1 ms",
    description:
      "Mandatory Access Control (MAC) confined domain isolation preventing privilege escalation across userland and daemon processes.",
    specs: ["Mode: Enforcing (Targeted)", "Type Enforcement: Active", "Booleans: Hardened"],
  },
  {
    id: "crypto",
    name: "Cryptographic Core",
    category: "Data Confidentiality",
    status: "AES-256-GCM / TLS 1.3",
    threatLevel: "Secure",
    latency: "1.2 ms",
    description:
      "Hardware-accelerated cryptographic primitives delivering end-to-end payload secrecy and perfect forward secrecy.",
    specs: ["Cipher: ChaCha20-Poly1305", "Key Rotation: 3600s", "Zero-Knowledge Hash: SHA-512"],
  },
  {
    id: "ids",
    name: "Threat Detection Engine",
    category: "Intrusion Analysis",
    status: "Real-time Heuristics",
    threatLevel: "Secure",
    latency: "2.1 ms",
    description:
      "Continuous deep packet inspection detecting anomalous payload signatures, CVE probes, and suspicious shell spawning.",
    specs: ["Rule Signatures: 28,400+", "False Positive Rate: <0.02%", "Real-time Alarms: Synchronized"],
  },
  {
    id: "waf",
    name: "Web Application Armor",
    category: "Application Layer",
    status: "OWASP Top 10 Mitigation",
    threatLevel: "Secure",
    latency: "0.8 ms",
    description:
      "Automated inspection guarding against SQL injections, Cross-Site Scripting (XSS), SSRF, and broken access controls.",
    specs: ["XSS Filter: Active", "SQLi Sanitization: Strict", "Rate-Limiter: 60 req/min/IP"],
  },
  {
    id: "auth",
    name: "Zero-Trust Identity",
    category: "Access & Identity",
    status: "MFA & Ed25519 Keys",
    threatLevel: "Secure",
    latency: "0.3 ms",
    description:
      "Continuous verification perimeter enforcing mutual authentication, short-lived JWT tokens, and strict PAM role boundaries.",
    specs: ["Auth Method: Hardware Key / OTP", "Session TTL: 900s", "Root Login: Disabled"],
  },
];

interface CyberShieldCanvasProps {
  mode?: "embedded" | "fullscreen";
  className?: string;
}

export function CyberShieldCanvas({
  mode = "fullscreen",
  className,
}: CyberShieldCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SecurityNodeData | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const defaultPos = useRef({ x: 0, y: 0.5, z: 4.8 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(defaultPos.current.x, defaultPos.current.y, defaultPos.current.z);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.minDistance = 2.4;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.15; // Don't flip below Tron floor
    controlsRef.current = controls;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f0ff, 1.8);
    dirLight2.position.set(-5, -3, 4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x00f0ff, 3.5, 10);
    pointLight.position.set(0, 0, 0.6);
    scene.add(pointLight);

    // 4. Tron / Cyber Grid Floor
    const gridHelper = new THREE.GridHelper(24, 32, 0x00f0ff, 0x0284c7);
    gridHelper.position.y = -2.1;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    scene.add(gridHelper);

    // Group for Shield and its core components
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    // Helper: Hexagon Shape
    function createHexagonShape(radius: number, stretchY = 1.2): THREE.Shape {
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

    // LAYER 1: Outer Heavy Armor Plate (Gunmetal Gray with beveled edge)
    const baseShape = createHexagonShape(1.25, 1.22);
    const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.88,
      roughness: 0.28,
      emissive: 0x0284c7,
      emissiveIntensity: 0.08,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.z = -0.05;
    shieldGroup.add(baseMesh);

    // Outer Edge glowing wireframe
    const baseEdgeGeo = new THREE.EdgesGeometry(baseGeo);
    const baseEdgeMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.65,
    });
    const baseEdges = new THREE.LineSegments(baseEdgeGeo, baseEdgeMat);
    baseMesh.add(baseEdges);

    // LAYER 2: Mid Reinforcement Armor Plate
    const midShape = createHexagonShape(0.96, 1.2);
    const midGeo = new THREE.ExtrudeGeometry(midShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    const midMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.92,
      roughness: 0.22,
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
      opacity: 0.75,
    });
    const midEdges = new THREE.LineSegments(midEdgeGeo, midEdgeMat);
    midMesh.add(midEdges);

    // LAYER 3: Inner Matte Carbon Plate
    const innerShape = createHexagonShape(0.68, 1.18);
    const innerGeo = new THREE.ExtrudeGeometry(innerShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      metalness: 0.8,
      roughness: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.position.z = 0.14;
    shieldGroup.add(innerMesh);

    const innerEdgeGeo = new THREE.EdgesGeometry(innerGeo);
    const innerEdgeMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9,
    });
    const innerEdges = new THREE.LineSegments(innerEdgeGeo, innerEdgeMat);
    innerMesh.add(innerEdges);

    // 5. Glowing Cyber Circuit Traces across Shield Front
    const circuitPoints: THREE.Vector3[] = [];
    const circuitTraceCoords = [
      // Top left track
      [-0.8, 0.7, 0.18], [-0.45, 0.7, 0.18], [-0.3, 0.45, 0.18], [-0.2, 0.45, 0.18],
      // Top right track
      [0.8, 0.7, 0.18], [0.45, 0.7, 0.18], [0.3, 0.45, 0.18], [0.2, 0.45, 0.18],
      // Bottom left track
      [-0.7, -0.6, 0.18], [-0.4, -0.6, 0.18], [-0.25, -0.35, 0.18], [-0.15, -0.35, 0.18],
      // Bottom right track
      [0.7, -0.6, 0.18], [0.4, -0.6, 0.18], [0.25, -0.35, 0.18], [0.15, -0.35, 0.18],
      // Mid horizontal accents
      [-0.9, 0, 0.18], [-0.5, 0, 0.18], [-0.35, 0.15, 0.18],
      [0.9, 0, 0.18], [0.5, 0, 0.18], [0.35, 0.15, 0.18],
    ];

    for (let i = 0; i < circuitTraceCoords.length; i += 2) {
      if (circuitTraceCoords[i + 1]) {
        circuitPoints.push(
          new THREE.Vector3(...circuitTraceCoords[i]),
          new THREE.Vector3(...circuitTraceCoords[i + 1])
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

    // Circuit solder pads (small micro spheres)
    const padGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const padMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    circuitTraceCoords.forEach((coord) => {
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.position.set(coord[0], coord[1], coord[2]);
      shieldGroup.add(padMesh);
    });

    // 6. Central Pulsing Holographic Core
    const coreCenterGroup = new THREE.Group();
    coreCenterGroup.position.set(0, 0, 0.22);
    shieldGroup.add(coreCenterGroup);

    // Glowing core sphere
    const coreSphereGeo = new THREE.SphereGeometry(0.2, 20, 20);
    const coreSphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9,
    });
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    coreCenterGroup.add(coreSphere);

    // Holographic core ring 1
    const coreRing1Geo = new THREE.TorusGeometry(0.36, 0.015, 16, 64);
    const coreRing1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });
    const coreRing1 = new THREE.Mesh(coreRing1Geo, coreRing1Mat);
    coreCenterGroup.add(coreRing1);

    // Holographic core ring 2 (tilted)
    const coreRing2Geo = new THREE.TorusGeometry(0.48, 0.012, 16, 64);
    const coreRing2Mat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
    });
    const coreRing2 = new THREE.Mesh(coreRing2Geo, coreRing2Mat);
    coreRing2.rotation.x = Math.PI / 4;
    coreCenterGroup.add(coreRing2);

    // 7. Interactive Network Graph Nodes (Spheres connected with Lines)
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    const nodePositions = [
      new THREE.Vector3(-1.9, 1.2, 0.5),   // Firewall
      new THREE.Vector3(1.9, 1.2, 0.5),    // SELinux
      new THREE.Vector3(-2.2, -0.4, 0.7),  // Crypto
      new THREE.Vector3(2.2, -0.4, 0.7),   // IDS
      new THREE.Vector3(-1.4, -1.5, 0.9),  // WAF
      new THREE.Vector3(1.4, -1.5, 0.9),   // Zero-Trust Auth
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    const nodeSphereGeo = new THREE.SphereGeometry(0.12, 16, 16);

    SECURITY_NODES.forEach((nodeData, idx) => {
      const pos = nodePositions[idx];
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.8,
      });
      const nodeMesh = new THREE.Mesh(nodeSphereGeo, nodeMat);
      nodeMesh.position.copy(pos);
      nodeMesh.userData = { nodeData, originalScale: 1.0, isHovered: false };

      // Outer aura ring around node
      const auraGeo = new THREE.RingGeometry(0.16, 0.19, 24);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      auraMesh.lookAt(camera.position);
      nodeMesh.add(auraMesh);

      networkGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
    });

    // Connecting Network Graph Lines between nodes & shield anchor points
    const networkLinePoints: THREE.Vector3[] = [];
    const shieldAnchors = [
      new THREE.Vector3(-0.9, 0.6, 0.2),
      new THREE.Vector3(0.9, 0.6, 0.2),
      new THREE.Vector3(-1.0, -0.2, 0.2),
      new THREE.Vector3(1.0, -0.2, 0.2),
      new THREE.Vector3(-0.6, -1.1, 0.2),
      new THREE.Vector3(0.6, -1.1, 0.2),
    ];

    nodePositions.forEach((pos, idx) => {
      // Connect to shield anchor
      networkLinePoints.push(pos, shieldAnchors[idx]);
      // Connect to neighboring node
      const nextIdx = (idx + 1) % nodePositions.length;
      networkLinePoints.push(pos, nodePositions[nextIdx]);
    });

    const networkLineGeo = new THREE.BufferGeometry().setFromPoints(networkLinePoints);
    const networkLineMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.45,
    });
    const networkLines = new THREE.LineSegments(networkLineGeo, networkLineMat);
    networkGroup.add(networkLines);

    // 8. Hexagon Grid Floating Network Data Particles
    const hexParticleCount = 28;
    const hexParticlesGroup = new THREE.Group();
    scene.add(hexParticlesGroup);

    const miniHexShape = createHexagonShape(0.08, 1);
    const miniHexGeo = new THREE.ShapeGeometry(miniHexShape);
    const miniHexMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });

    const miniHexMeshes: { mesh: THREE.Mesh; speed: number; rotSpeed: number }[] = [];
    for (let i = 0; i < hexParticleCount; i++) {
      const mesh = new THREE.Mesh(miniHexGeo, miniHexMat);
      mesh.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3
      );
      hexParticlesGroup.add(mesh);
      miniHexMeshes.push({
        mesh,
        speed: 0.004 + Math.random() * 0.008,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    // 9. Raycasting & Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let hoveredMesh: THREE.Mesh | null = null;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes, false);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        if (hoveredMesh !== mesh) {
          if (hoveredMesh) {
            hoveredMesh.scale.set(1, 1, 1);
          }
          hoveredMesh = mesh;
          hoveredMesh.scale.set(1.4, 1.4, 1.4);
          container.style.cursor = "pointer";
        }
      } else {
        if (hoveredMesh) {
          hoveredMesh.scale.set(1, 1, 1);
          hoveredMesh = null;
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
        const data = mesh.userData.nodeData as SecurityNodeData;
        if (data) {
          setSelectedNode(data);
        }
      }
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("click", onPointerClick);

    // Resize handler
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

    // 10. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      controls.update();

      // Pulsing core
      const pulse = 1 + Math.sin(elapsedTime * 3) * 0.16;
      coreSphere.scale.set(pulse, pulse, pulse);
      coreRing1.rotation.z = elapsedTime * 0.8;
      coreRing2.rotation.z = -elapsedTime * 0.6;
      coreRing2.rotation.y = elapsedTime * 0.4;

      // Subtle breathing motion on shield
      shieldGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.06;
      shieldGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.08;

      // Make aura rings face camera
      nodeMeshes.forEach((mesh) => {
        const aura = mesh.children[0];
        if (aura) aura.lookAt(camera.position);
      });

      // Animate floating mini hex particles
      miniHexMeshes.forEach(({ mesh, speed, rotSpeed }) => {
        mesh.position.y += speed;
        mesh.rotation.z += rotSpeed;
        if (mesh.position.y > 2.5) {
          mesh.position.y = -2.0;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
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
      coreRing1Geo.dispose();
      coreRing1Mat.dispose();
      coreRing2Geo.dispose();
      coreRing2Mat.dispose();
      nodeSphereGeo.dispose();
      networkLineGeo.dispose();
      networkLineMat.dispose();
      miniHexGeo.dispose();
      miniHexMat.dispose();
      gridHelper.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // UI Button Actions
  const toggleRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
      setIsAutoRotating(controlsRef.current.autoRotate);
    }
  };

  const handleZoomIn = () => {
    if (controlsRef.current && cameraRef.current) {
      const dir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(dir);
      cameraRef.current.position.addScaledVector(dir, 0.7);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current && cameraRef.current) {
      const dir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(dir);
      cameraRef.current.position.addScaledVector(dir, -0.7);
      controlsRef.current.update();
    }
  };

  const handleResetView = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(
        defaultPos.current.x,
        defaultPos.current.y,
        defaultPos.current.z
      );
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.autoRotate = true;
      setIsAutoRotating(true);
      controlsRef.current.update();
      setSelectedNode(null);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden select-none bg-background/50",
        mode === "fullscreen"
          ? "h-[calc(100vh-5rem)] rounded-xl border border-cyan-500/20 shadow-2xl"
          : "h-64 sm:h-72",
        className
      )}
    >
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full touch-none" />

      {/* Tron Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating HUD Controls */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-cyan-500/30 shadow-lg z-20">
        <Button
          size="sm"
          variant={isAutoRotating ? "default" : "outline"}
          onClick={toggleRotate}
          className="rounded-full text-xs h-8 px-3 gap-1.5"
        >
          <RotateCw className={cn("w-3.5 h-3.5", isAutoRotating && "animate-spin")} />
          Rotate
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          className="rounded-full text-xs h-8 px-3 gap-1.5"
        >
          <ZoomIn className="w-3.5 h-3.5" />
          Zoom In
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          className="rounded-full text-xs h-8 px-3 gap-1.5"
        >
          <ZoomOut className="w-3.5 h-3.5" />
          Zoom Out
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleResetView}
          className="rounded-full text-xs h-8 px-3 gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset View
        </Button>
      </div>

      {/* Header Badge */}
      <div className="absolute top-5 left-5 pointer-events-none z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>CYBER DEFENSE SHIELD // PROCEDURAL 3D</span>
        </div>
      </div>

      {/* Instructions Overlay */}
      <div className="absolute top-5 right-5 pointer-events-none z-20 hidden sm:block">
        <div className="text-right text-[11px] font-mono text-muted-foreground/80 space-y-0.5">
          <p>Drag to Rotate • Scroll to Zoom</p>
          <p className="text-cyan-400/90">Click any glowing node for diagnostics</p>
        </div>
      </div>

      {/* Floating HTML Info Panel (Raycaster Node Click) */}
      {selectedNode && (
        <div className="absolute top-16 right-4 sm:right-6 w-80 sm:w-96 z-30 animate-in fade-in slide-in-from-right-4 duration-300">
          <Card className="border border-cyan-500/40 bg-background/90 backdrop-blur-xl shadow-2xl">
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Activity className="w-3 h-3" />
                  {selectedNode.category}
                </div>
                <CardTitle className="text-base font-bold font-heading text-foreground">
                  {selectedNode.name}
                </CardTitle>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                {selectedNode.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[11px] font-mono">
                <div>
                  <span className="text-muted-foreground block">STATUS:</span>
                  <span className="text-emerald-400 font-semibold">{selectedNode.status}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">LATENCY:</span>
                  <span className="text-cyan-400 font-semibold">{selectedNode.latency}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-border/50">
                <span className="text-[11px] font-mono text-muted-foreground">SPECIFICATIONS:</span>
                <ul className="space-y-1 text-[11px] font-mono">
                  {selectedNode.specs.map((spec, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-foreground/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {spec}
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
