import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './Welcome.css';

const Welcome = () => {
  const canvasContainerRef = useRef(null);
  const rafRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // cleanup any existing canvas (in case of hot reloads)
    while (canvasContainerRef.current.firstChild) {
      canvasContainerRef.current.removeChild(canvasContainerRef.current.firstChild);
    }

    // ========== Make Scene ==========
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b1a);
    scene.fog = new THREE.FogExp2(0x050b1a, 0.008);
    sceneRef.current = scene;

    // ========== Camera ==========
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 18);
    cameraRef.current = camera;

    // ========== Render ==========
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ========== Lights ==========
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

    // ========== (Low-Poly Mesh) ==========
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

    // make geometry and material from the vertices, colors, and indices
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
      metalness: 0.8,
      roughness: 0.3
    });

    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    scene.add(terrainMesh);


    // ========== Stars ==========
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 180;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 70 - 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.35 }));
    scene.add(stars);



    // ========== mouse Reaction ==========
    let mouseX = 0, mouseY = 0;
    let targetZoom = 14;
    let currentZoom = 14;
    let cameraRotY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handleWheel = (e) => {
      targetZoom -= e.deltaY * 0.02;
      targetZoom = Math.min(14, Math.max(12, targetZoom));
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', handleResize);

    // ========== Draw ==========
    let time = 0;

    const animate = () => {
      time += 0.016;

      //Camera movement based on mouse position
      cameraRotY += (mouseX * 0.35 - cameraRotY) * 0.06;
      currentZoom += (targetZoom - currentZoom) * 0.08;

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
    // ========== Vertices as Points ==========
    const positionsAttribute = terrainGeometry.attributes.position.array;
    const vertexCount = positionsAttribute.length / 3;

    // إنشاء هندسة للنقاط
    const vertexGeo = new THREE.BufferGeometry();
    const vertexPositions = new Float32Array(vertexCount * 3);

    for (let i = 0; i < vertexCount; i++) {
      vertexPositions[i * 3] = positionsAttribute[i * 3];
      vertexPositions[i * 3 + 1] = positionsAttribute[i * 3 + 1];
      vertexPositions[i * 3 + 2] = positionsAttribute[i * 3 + 2];
    }

    vertexGeo.setAttribute('position', new THREE.BufferAttribute(vertexPositions, 3));

    // مادة النقاط (بيضاء / رمادية)
    const vertexMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const verticesPoints = new THREE.Points(vertexGeo, vertexMaterial);
    scene.add(verticesPoints);

    const VertexMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });

    // ========== Cleanup ==========
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
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
        <nav className="navbar">
          <div className="logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">AlgoHub</span>
          </div>
          <button className="btn-primary" onClick={() => window.location.href = '/Login'}> Get Started</button>
        </nav>

        <div className="hero">
          <h1 className="hero-title">
            Welcome to <br />
            <span className="gradient-text">AlgoHub</span>
          </h1>
          <button className="cta-button" onClick={() => window.location.href = '/Login'}>
            Get Started
            <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M13 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div >
  );
};

export default Welcome;