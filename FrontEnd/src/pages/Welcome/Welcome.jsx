import React, { useRef, useEffect } from 'react';
import {WelcomeArrowIcon} from '../../assets/Icons/Icon';
import * as THREE from 'three';
import './Welcome.css';
// This component creates a 3D animated background using Three.js, with a low-poly terrain and stars.
//  It also includes a welcome message and a call-to-action button.
const Welcome = () => {
  // Refs to store Three.js objects and the animation frame ID for cleanup
  const canvasContainerRef = useRef(null);
  const rafRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  // useEffect to set up the Three.js scene when the component mounts
  useEffect(() => {
    // Ensure the canvas container ref is available
    // try and catch principle 
    if (!canvasContainerRef.current) return;

    // cleanup any existing canvas elements before creating a new scene
    while (canvasContainerRef.current.firstChild) {
      canvasContainerRef.current.removeChild(canvasContainerRef.current.firstChild);
    }


    // ========== Make Scene ==========
    // scene is the container for all 3D objects, lights, and cameras. 
    // It defines the 3D world where everything exists.
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b1a);
    scene.fog = new THREE.FogExp2(0x050b1a, 0.008);
    sceneRef.current = scene;


    // ========== Camera ==========
    // The camera defines the viewpoint from which we see the 3D scene.
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 18);
    cameraRef.current = camera;


    // ========== Render ==========
    // The renderer is responsible for drawing the scene from the perspective of the camera onto the canvas element in the DOM.
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;


    // ========== Lights ==========
    // Lighting is crucial for making the 3D objects visible and giving them depth and realism.
    // Ambient light provides a base level of illumination.
    const ambientLight = new THREE.AmbientLight(0x111122);
    scene.add(ambientLight);
    // Directional light simulates sunlight and creates shadows.
    const mainLight = new THREE.DirectionalLight(0x4488ff, 0.7);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);
    // Point lights add localized light sources that can create highlights and enhance the 3D effect.
    const backLight = new THREE.PointLight(0x2266aa, 0.4);
    backLight.position.set(0, 2, -8);
    scene.add(backLight);
    // A cyan point light that will animate to create a dynamic lighting effect on the terrain.
    const cyanLight = new THREE.PointLight(0x00f2fe, 0.5);
    cyanLight.position.set(3, 2, 4);
    scene.add(cyanLight);


    // ========== (Low-Poly Mesh) ==========
    // This section creates a low-poly terrain mesh by generating vertices based on sine and cosine waves to create a wavy surface.
    const width = 50;
    const depth = 50;
    const segments = 70;

    const vertices = [];
    const indices = [];
    const colors = [];
    // The nested loops generate a grid of vertices for the terrain
    // the y-coordinate is calculated using a combination of sine and cosine functions to create a wavy effect. The colors are also calculated based on the y-coordinate to give a gradient effect to the terrain.
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
    // The next nested loops create the indices for the terrain mesh
    // define how the vertices are connected to form triangles.
    // Each square in the grid is made up of two triangles, and the indices specify which vertices belong to each triangle.
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
    // define a material for the terrain mesh that uses vertex colors and has a wireframe appearance.
    // The material is also set to be transparent with an emissive color to give it a glowing effect. 
    // The metalness and roughness properties are adjusted to enhance the visual style of the terrain.
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
    // Finally, a mesh is created from the geometry and material, and it is added to the scene. 
    // This mesh represents the low-poly terrain that will be rendered in the background.
    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    scene.add(terrainMesh);


    // ========== Stars ==========
    // This section creates a starfield by generating a large number of points with random positions in 3D space.
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    // The loop populates the starPositions array with random x, y, and z coordinates for each star.
    // The stars are distributed in a wide area around the scene to create a sense of depth and immersion.
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 180;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 70 - 40;
    }
    // The star geometry is created by setting the position attribute with the generated star positions.
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    // A PointsMaterial is used to render the stars as small points with a specified color and size.
    // The material is also set to be transparent to allow for blending effects.
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 1.0 }));
    // The stars are added to the scene, and they will be rendered as part of the background.
    scene.add(stars);


    // ========== mouse Reaction ==========
    // This section sets up event listeners to allow the camera to react to mouse movements and scroll events.
    let mouseX = 0, mouseY = 0;
    let targetZoom = 14;
    let currentZoom = 14;
    let cameraRotY = 0;
    // The handleMouseMove function updates the mouseX and mouseY variables based on the current mouse position, normalized to a range of -1 to 1.
    // It allows the camera to react to mouse movements by adjusting its position and rotation based on the mouse coordinates.
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    // The handleWheel function adjusts the targetZoom variable based on the scroll wheel input
    // Allows the user to zoom in and out of the scene. The zoom level is clamped between 12 and 14 to prevent excessive zooming.
    const handleWheel = (e) => {
      targetZoom += e.deltaY * 0.02;
      targetZoom = Math.min(14, Math.max(12, targetZoom));
    };

    // The handleResize function updates the camera's aspect ratio and the renderer's size when the window is resized
    // Ensures that the scene remains properly scaled and displayed on different screen sizes.
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Event listeners are added to the window object to listen fro mouse events .
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', handleResize);

    // ========== Draw ==========
    // The animate function is the main animation loop that updates the scene and renders it on each frame.
    // It uses requestAnimationFrame to ensure smooth animations.
    let time = 0;
    // The camera's position and rotation are updated based on the mouse position and the target zoom level, 
    // creates an interactive experience where the user can explore the 3D scene by moving the mouse and scrolling.
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
    // This section creates a point cloud representation of the terrain vertices to enhance the visual effect of the low-poly mesh.
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

    // A PointsMaterial is created for the vertices, which defines how the points will be rendered.
    // The material is set to be transparent and uses additive blending to create a glowing effect on the vertices.
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
    // The return function in the useEffect hook is used to clean up event listeners and Three.js resources when the component unmounts.
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
        <div className="hero">
          <h1 className="hero-title">
            Welcome to <br />
            <span className="gradient-text">AlgoHub</span>
          </h1>
          <button className="cta-button" onClick={() => window.location.href = '/Login'}>
            Get Started
          <WelcomeArrowIcon className="arrow" />
          </button>
        </div>
      </div>
    </div >
  );
};

export default Welcome;