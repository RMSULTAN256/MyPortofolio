"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function CyberGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 260;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Camera placed with comfortable margin so rings/particles never get clipped
    camera.position.z = 4.6;

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

    // Main group holds the globe and all rings/satellites so they ALL rotate together on user drag / tilt
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Outer Latitude & Longitude Sphere Grid (compact radius)
    const sphereRadius = 1.1;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 20, 14);
    const sphereWireGeo = new THREE.WireframeGeometry(sphereGeo);
    const sphereLineMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.25,
    });
    const sphereLines = new THREE.LineSegments(sphereWireGeo, sphereLineMat);
    mainGroup.add(sphereLines);

    // 2. Geodesic Facet Shell (Icosahedron wireframe)
    const icoGeo = new THREE.IcosahedronGeometry(sphereRadius, 2);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    mainGroup.add(icoMesh);

    // 3. Glowing Node Vertices
    const pointsMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.045,
      transparent: true,
      opacity: 0.95,
    });
    const points = new THREE.Points(icoGeo, pointsMat);
    mainGroup.add(points);

    // 4. Dual Gyroscopic Orbital Rings - ATTACHED TO MAINGROUP so they rotate with the globe!
    const ring1Radius = 1.42;
    const ring2Radius = 1.55;

    const orbitGroup1 = new THREE.Group();
    orbitGroup1.rotation.x = Math.PI / 3.2;
    orbitGroup1.rotation.y = Math.PI / 6;
    mainGroup.add(orbitGroup1);

    const orbitRing1Geo = new THREE.TorusGeometry(ring1Radius, 0.01, 16, 72);
    const orbitRing1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
    });
    const orbitRing1 = new THREE.Mesh(orbitRing1Geo, orbitRing1Mat);
    orbitGroup1.add(orbitRing1);

    const orbitGroup2 = new THREE.Group();
    orbitGroup2.rotation.x = -Math.PI / 3.5;
    orbitGroup2.rotation.y = -Math.PI / 4.5;
    mainGroup.add(orbitGroup2);

    const orbitRing2Geo = new THREE.TorusGeometry(ring2Radius, 0.009, 16, 72);
    const orbitRing2Mat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.4,
    });
    const orbitRing2 = new THREE.Mesh(orbitRing2Geo, orbitRing2Mat);
    orbitGroup2.add(orbitRing2);

    // 5. Satellites on Orbital Rings
    const satGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const sat1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const sat1A = new THREE.Mesh(satGeo, sat1Mat);
    const sat1B = new THREE.Mesh(satGeo, sat1Mat);
    orbitGroup1.add(sat1A);
    orbitGroup1.add(sat1B);

    const sat2Mat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    const sat2A = new THREE.Mesh(satGeo, sat2Mat);
    const sat2B = new THREE.Mesh(satGeo, sat2Mat);
    orbitGroup2.add(sat2A);
    orbitGroup2.add(sat2B);

    // 6. Inner Shield Core (rotates in opposite direction inside mainGroup)
    const innerGeo = new THREE.IcosahedronGeometry(0.62, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // Pulsing core node
    const coreGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // 7. Ambient Cyber Floating Particles inside mainGroup
    const particleCount = 36;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.25 + Math.random() * 0.45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.03,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

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

      // Drag damping and auto spin on the entire constellation
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

      // Orbital rotation of satellites along their respective rings
      sat1A.position.set(
        Math.cos(elapsedTime * 1.5) * ring1Radius,
        Math.sin(elapsedTime * 1.5) * ring1Radius,
        0
      );
      sat1B.position.set(
        Math.cos(elapsedTime * 1.5 + Math.PI) * ring1Radius,
        Math.sin(elapsedTime * 1.5 + Math.PI) * ring1Radius,
        0
      );

      sat2A.position.set(
        Math.cos(-elapsedTime * 1.2) * ring2Radius,
        Math.sin(-elapsedTime * 1.2) * ring2Radius,
        0
      );
      sat2B.position.set(
        Math.cos(-elapsedTime * 1.2 + Math.PI) * ring2Radius,
        Math.sin(-elapsedTime * 1.2 + Math.PI) * ring2Radius,
        0
      );

      // Continuous independent 3D gyroscopic rotation of the orbital rings
      orbitGroup1.rotation.y = elapsedTime * 0.4;
      orbitGroup1.rotation.x = Math.PI / 3.2 + Math.sin(elapsedTime * 0.5) * 0.2;
      orbitGroup1.rotation.z = Math.cos(elapsedTime * 0.4) * 0.15;

      orbitGroup2.rotation.y = -elapsedTime * 0.32;
      orbitGroup2.rotation.x = -Math.PI / 3.5 + Math.cos(elapsedTime * 0.6) * 0.22;
      orbitGroup2.rotation.z = Math.sin(elapsedTime * 0.35) * 0.18;

      // Reverse spin on inner shield
      innerMesh.rotation.y = -elapsedTime * 0.3;
      innerMesh.rotation.x = elapsedTime * 0.2;

      // Gentle pulse on core node
      const pulse = 1 + Math.sin(elapsedTime * 2.8) * 0.15;
      coreMesh.scale.set(pulse, pulse, pulse);

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

      sphereGeo.dispose();
      sphereWireGeo.dispose();
      sphereLineMat.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      pointsMat.dispose();
      orbitRing1Geo.dispose();
      orbitRing1Mat.dispose();
      orbitRing2Geo.dispose();
      orbitRing2Mat.dispose();
      satGeo.dispose();
      sat1Mat.dispose();
      sat2Mat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing">
      {/* Subtle cyber ambient glow backdrop */}
      <div className="absolute inset-0 -z-10 rounded-full bg-cyan-500/10 blur-2xl transform scale-75 pointer-events-none" />
      <div
        ref={containerRef}
        className="w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 touch-none"
        aria-label="Interactive 3D Cyber Security Globe"
      />
    </div>
  );
}
