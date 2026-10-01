"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function CyberShieldHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 260;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.4);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    // Main group holds the shield & graph
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.2);
    dirLight1.position.set(4, 6, 4);
    scene.add(dirLight1);

    const pointLight = new THREE.PointLight(0x00f0ff, 3.0, 8);
    pointLight.position.set(0, 0, 0.6);
    scene.add(pointLight);

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

    // LAYER 1: Base Heavy Armor Plate
    const baseShape = createHexagonShape(1.05, 1.2);
    const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.88,
      roughness: 0.28,
      emissive: 0x0284c7,
      emissiveIntensity: 0.1,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.z = -0.04;
    mainGroup.add(baseMesh);

    const baseEdgeGeo = new THREE.EdgesGeometry(baseGeo);
    const baseEdgeMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.7,
    });
    const baseEdges = new THREE.LineSegments(baseEdgeGeo, baseEdgeMat);
    baseMesh.add(baseEdges);

    // LAYER 2: Mid Reinforcement Armor Plate
    const midShape = createHexagonShape(0.8, 1.18);
    const midGeo = new THREE.ExtrudeGeometry(midShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    });
    const midMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.92,
      roughness: 0.22,
      emissive: 0x0369a1,
      emissiveIntensity: 0.12,
    });
    const midMesh = new THREE.Mesh(midGeo, midMat);
    midMesh.position.z = 0.05;
    mainGroup.add(midMesh);

    const midEdgeGeo = new THREE.EdgesGeometry(midGeo);
    const midEdgeMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });
    const midEdges = new THREE.LineSegments(midEdgeGeo, midEdgeMat);
    midMesh.add(midEdges);

    // LAYER 3: Inner Carbon Plate
    const innerShape = createHexagonShape(0.55, 1.15);
    const innerGeo = new THREE.ExtrudeGeometry(innerShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      metalness: 0.8,
      roughness: 0.4,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.position.z = 0.11;
    mainGroup.add(innerMesh);

    const innerEdgeGeo = new THREE.EdgesGeometry(innerGeo);
    const innerEdgeMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9,
    });
    const innerEdges = new THREE.LineSegments(innerEdgeGeo, innerEdgeMat);
    innerMesh.add(innerEdges);

    // Circuit lines on shield
    const circuitPoints: THREE.Vector3[] = [];
    const traces = [
      [-0.65, 0.55, 0.14], [-0.35, 0.55, 0.14], [-0.2, 0.35, 0.14],
      [0.65, 0.55, 0.14], [0.35, 0.55, 0.14], [0.2, 0.35, 0.14],
      [-0.55, -0.45, 0.14], [-0.3, -0.45, 0.14], [-0.15, -0.25, 0.14],
      [0.55, -0.45, 0.14], [0.3, -0.45, 0.14], [0.15, -0.25, 0.14],
    ];
    for (let i = 0; i < traces.length; i += 3) {
      circuitPoints.push(
        new THREE.Vector3(...traces[i]),
        new THREE.Vector3(...traces[i + 1]),
        new THREE.Vector3(...traces[i + 1]),
        new THREE.Vector3(...traces[i + 2])
      );
    }
    const circuitGeo = new THREE.BufferGeometry().setFromPoints(circuitPoints);
    const circuitMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95,
    });
    const circuitLines = new THREE.LineSegments(circuitGeo, circuitMat);
    mainGroup.add(circuitLines);

    // Central Holographic Core
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0, 0.18);
    mainGroup.add(coreGroup);

    const coreSphereGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const coreSphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9,
    });
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    coreGroup.add(coreSphere);

    const ring1Geo = new THREE.TorusGeometry(0.28, 0.012, 16, 48);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(0.38, 0.01, 16, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 4;
    coreGroup.add(ring2);

    // Orbiting Network Graph Nodes & Lines
    const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8,
    });

    const nodeCoords = [
      new THREE.Vector3(-1.45, 0.9, 0.3),
      new THREE.Vector3(1.45, 0.9, 0.3),
      new THREE.Vector3(-1.6, -0.3, 0.4),
      new THREE.Vector3(1.6, -0.3, 0.4),
      new THREE.Vector3(-1.1, -1.2, 0.5),
      new THREE.Vector3(1.1, -1.2, 0.5),
    ];

    nodeCoords.forEach((pos) => {
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      mainGroup.add(nodeMesh);
    });

    const netLinePoints: THREE.Vector3[] = [];
    nodeCoords.forEach((pos, idx) => {
      const nextPos = nodeCoords[(idx + 1) % nodeCoords.length];
      netLinePoints.push(pos, nextPos);
      netLinePoints.push(pos, new THREE.Vector3(pos.x * 0.5, pos.y * 0.5, 0.1));
    });
    const netLineGeo = new THREE.BufferGeometry().setFromPoints(netLinePoints);
    const netLineMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.4,
    });
    const netLines = new THREE.LineSegments(netLineGeo, netLineMat);
    mainGroup.add(netLines);

    // Interaction state: drag and hover tilt
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        dragVelocityX = deltaX * 0.005;
        dragVelocityY = deltaY * 0.005;
        mainGroup.rotation.y += dragVelocityX;
        mainGroup.rotation.x += dragVelocityY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        targetTiltX = x * 0.35;
        targetTiltY = y * 0.35;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {}
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);

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

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        mainGroup.rotation.y += 0.006 + dragVelocityX;
        mainGroup.rotation.x += dragVelocityY;
        dragVelocityX *= 0.94;
        dragVelocityY *= 0.94;

        currentTiltX += (targetTiltX - currentTiltX) * 0.05;
        currentTiltY += (targetTiltY - currentTiltY) * 0.05;
        mainGroup.rotation.y += currentTiltX * 0.012;
        mainGroup.rotation.x += currentTiltY * 0.012;
      }

      // Breathing motion
      mainGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.04;

      // Pulsing core
      const pulse = 1 + Math.sin(elapsedTime * 3) * 0.16;
      coreSphere.scale.set(pulse, pulse, pulse);
      ring1.rotation.z = elapsedTime * 0.8;
      ring2.rotation.z = -elapsedTime * 0.6;
      ring2.rotation.y = elapsedTime * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);

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
      coreSphereGeo.dispose();
      coreSphereMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      netLineGeo.dispose();
      netLineMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing group">
      {/* Ambient glow backdrop */}
      <div className="absolute inset-0 -z-10 rounded-full bg-cyan-500/10 blur-2xl transform scale-75 pointer-events-none" />
      <div
        ref={containerRef}
        className="w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 touch-none"
        aria-label="Interactive 3D Cyber Security Shield"
      />
      <Link
        href="/shield"
        className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all opacity-80 group-hover:opacity-100"
      >
        <span>Open 3D Lab (Full Tron Grid)</span>
        <span>→</span>
      </Link>
    </div>
  );
}
