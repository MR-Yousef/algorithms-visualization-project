import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeArrowIcon } from '../../assets/Icons/Icon';
import * as THREE from 'three';
import './Welcome.css';

const Welcome = () => {
  const canvasContainerRef = useRef(null);
  const rafRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Cleanup old canvas
    while (canvasContainerRef.current.firstChild) {
      canvasContainerRef.current.removeChild(canvasContainerRef.current.firstChild);
    }

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b1a);
    scene.fog = new THREE.FogExp2(0x050b1a, 0.008);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 18);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x111122);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0x4488ff, 0.7);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);
    const backLight = new THREE.PointLight(0x2266aa, 0.4);
    backLight.position.set(0, 2, -8);
    scene.add(backLight);
    const cyanLight = new THREE.PointLight(0x00f2fe, 0.5);
    cyanLight.position.set(3, 2, 4);
    scene.add(cyanLight);

    // Low-poly terrain (unchanged)
    const width = 50;
    const depth = 50;
    const segments = 70;
    const vertices = [];
    const indices = [];
    const colors = [];
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * width;
      for (let j = 0; j <= segments; j++) {
        const z = (j / segments - 0.5) * depth;
        const wave1 = Math.sin(x * 0.6) * Math.cos(z * 0.6) * 0.5;
        const wave2 = Math.sin(x * 1.1) * 0.25;
        const wave3 = Math.cos(z * 1.0) * 0.25;
        const y = wave1 + wave2 + wave3 - 1.2;
        vertices.push(x, y, z);
        const t = (y + 1.5) / 2.5;
        colors.push(0.1 + t * 0.3, 0.3 + t * 0.6, 0.6 + t * 0.4);
      }
    }
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = i * (segments + 1) + j + 1;
        const c = (i + 1) * (segments + 1) + j;
        const d = (i + 1) * (segments + 1) + j + 1;
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    const terrainGeometry = new THREE.BufferGeometry();
    terrainGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    terrainGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    terrainGeometry.setIndex(indices);
    const terrainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      emissive: new THREE.Color(0xfffff8),
      emissiveIntensity: 0.15,
      roughness: 0.3
    });
    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    scene.add(terrainMesh);

    // Stars
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 180;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 70 - 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 1.0 }));
    scene.add(stars);

    // ------- Interaction -------
    let mouseX = 0, mouseY = 0;
    let targetZoom = 14;
    let currentZoom = 14;
    let cameraRotY = 0;

    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 'ontouchstart' in window;

    // Smoothing factors: faster on mobile
    const rotationSmooth = isMobile ? 0.12 : 0.06;
    const zoomSmooth = isMobile ? 0.15 : 0.08;

    // Device orientation handler (mobile)
    const orientationHandler = (e) => {
      // gamma: left/right tilt, range -90..90
      // beta: front/back tilt, range -180..180
      // Map to -1..1 with increased sensitivity (div by 30 instead of 45)
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      mouseX = Math.max(-1, Math.min(1, gamma / 30));
      mouseY = Math.max(-1, Math.min(1, beta / 30));
    };

    // Mouse handler (desktop)
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    // Cleanup functions for listeners
    let removeOrientation = null;
    let removeTouchPermission = null;

    if (isMobile && window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+
        const requestPermission = () => {
          DeviceOrientationEvent.requestPermission()
            .then(state => {
              if (state === 'granted') {
                window.addEventListener('deviceorientation', orientationHandler);
                removeOrientation = () => window.removeEventListener('deviceorientation', orientationHandler);
              }
            })
            .catch(console.error);
        };
        document.addEventListener('touchstart', requestPermission, { once: true });
        removeTouchPermission = () => document.removeEventListener('touchstart', requestPermission);
      } else {
        // Android / older iOS
        window.addEventListener('deviceorientation', orientationHandler);
        removeOrientation = () => window.removeEventListener('deviceorientation', orientationHandler);
      }
    } else {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Wheel (desktop only)
    const handleWheel = (e) => {
      targetZoom += e.deltaY * 0.02;
      targetZoom = Math.min(14, Math.max(12, targetZoom));
    };
    window.addEventListener('wheel', handleWheel, { passive: true });

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.016;

      cameraRotY += (mouseX * 0.35 - cameraRotY) * rotationSmooth;
      currentZoom += (targetZoom - currentZoom) * zoomSmooth;
      camera.position.x = Math.sin(cameraRotY) * currentZoom * 0.3;
      camera.position.z = Math.cos(cameraRotY) * currentZoom;
      camera.position.y = 2.2 + mouseY * 0.8;
      camera.lookAt(0, -0.8, 0);

      cyanLight.position.x = 3 + Math.sin(time * 0.8) * 1.2;
      stars.rotation.y += 0.0003;
      stars.rotation.x += 0.0002;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Vertices as points (decorative)
    const positionsAttribute = terrainGeometry.attributes.position.array;
    const vertexCount = positionsAttribute.length / 3;
    const vertexGeo = new THREE.BufferGeometry();
    const vertexPositions = new Float32Array(vertexCount * 3);
    for (let i = 0; i < vertexCount; i++) {
      vertexPositions[i * 3] = positionsAttribute[i * 3];
      vertexPositions[i * 3 + 1] = positionsAttribute[i * 3 + 1];
      vertexPositions[i * 3 + 2] = positionsAttribute[i * 3 + 2];
    }
    vertexGeo.setAttribute('position', new THREE.BufferAttribute(vertexPositions, 3));
    const vertexMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const verticesPoints = new THREE.Points(vertexGeo, vertexMaterial);
    scene.add(verticesPoints);

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
      } else {
        if (removeOrientation) removeOrientation();
        if (removeTouchPermission) removeTouchPermission();
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (rendererRef.current && canvasContainerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        canvasContainerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  return (
    <div className="welcome-container">
      <div className="canvas-background" ref={canvasContainerRef}></div>
      <div className="content-overlay">
        <div className="hero">
          <h1 className="hero-title">
            Welcome to <br />
            <span className="gradient-text">AlgoHub</span>
          </h1>
          <button className="cta-button" onClick={() => navigate('/login')}>
            Get Started
            <WelcomeArrowIcon className="arrow" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;