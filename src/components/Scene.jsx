import { useEffect, useRef } from "react";
import * as THREE from "three";

function makeFacade() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  const cells = [];

  function paint() {
    context.fillStyle = "#d9d2c6";
    context.fillRect(0, 0, 512, 1024);
    context.fillStyle = "#cfc6b8";
    context.fillRect(0, 0, 512, 18);
    cells.forEach((cell) => {
      context.fillStyle = cell.lit ? cell.glow : cell.dark;
      context.fillRect(cell.x, cell.y, 32, 40);
      context.fillStyle = "rgba(255,255,255,0.14)";
      context.fillRect(cell.x, cell.y, 32, 3);
    });
  }

  const cols = 8;
  const rows = 18;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const lit = Math.random() > 0.78;
      cells.push({
        x: 28 + x * 60,
        y: 36 + y * 54,
        lit,
        glow: Math.random() > 0.5 ? "#f0d7a4" : "#e7b56a",
        dark: Math.random() > 0.82 ? "#3a342c" : "#1b1916",
      });
    }
  }
  paint();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return {
    texture,
    tick() {
      for (let i = 0; i < 5; i += 1) {
        const cell = cells[Math.floor(Math.random() * cells.length)];
        cell.lit = !cell.lit;
      }
      paint();
      texture.needsUpdate = true;
    },
  };
}

export default function Scene() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      wrap.dataset.webgl = "off";
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x171512, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171512);
    scene.fog = new THREE.Fog(0x171512, 12, 22);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(5.4, 2.55, 6.35);

    scene.add(new THREE.AmbientLight(0xf4efe6, 0.42));
    const key = new THREE.DirectionalLight(0xfff3e2, 2.35);
    key.position.set(5.5, 8.5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 24;
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.bias = -0.0006;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc4622d, 0.9);
    rim.position.set(-6, 3.5, -4);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xc9d5dc, 0.35);
    fill.position.set(-2, 2, 7);
    scene.add(fill);

    const root = new THREE.Group();
    scene.add(root);
    const geos = [];
    const mats = [];

    const trackGeo = (geo) => {
      geos.push(geo);
      return geo;
    };
    const trackMat = (mat) => {
      mats.push(mat);
      return mat;
    };

    const concrete = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xe6dfd4, roughness: 0.88, metalness: 0.02 })
    );
    const stone = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 0.72, metalness: 0.08 })
    );
    const copper = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xb8734a, roughness: 0.38, metalness: 0.62 })
    );
    const metal = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x8d8880, roughness: 0.45, metalness: 0.55 })
    );
    const glass = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xb7c7d1,
        roughness: 0.08,
        metalness: 0.55,
        transparent: true,
        opacity: 0.55,
      })
    );
    const groundMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x221e1a, roughness: 1, metalness: 0 })
    );

    const facade = makeFacade();
    mats.push(facade.texture);
    const faced = trackMat(
      new THREE.MeshStandardMaterial({ map: facade.texture, roughness: 0.78, metalness: 0.03 })
    );

    function add(mesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);
      return mesh;
    }

    const ground = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(6.2, 72)), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    add(new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(2.55, 2.62, 0.14, 64)), stone)).position.y = 0.07;
    const ring = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(2.35, 0.012, 8, 80)), copper);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.15;
    root.add(ring);

    const podium = add(new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.7, 0.36, 1.75)), concrete));
    podium.position.set(0.12, 0.36, 0.05);

    const towerGeo = trackGeo(new THREE.BoxGeometry(1.18, 2.55, 1.02));
    const tower = add(new THREE.Mesh(towerGeo, [concrete, concrete, concrete, concrete, faced, faced]));
    tower.position.set(-0.42, 1.78, 0.02);
    const towerEdges = new THREE.LineSegments(
      trackGeo(new THREE.EdgesGeometry(towerGeo, 1)),
      trackMat(new THREE.LineBasicMaterial({ color: 0xc4622d, transparent: true, opacity: 0.28 }))
    );
    towerEdges.position.copy(tower.position);
    root.add(towerEdges);

    const wing = add(new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.42, 1.12, 1.18)), concrete));
    wing.position.set(0.92, 1.1, -0.02);
    const glassBox = add(new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.86, 0.62, 0.72)), glass));
    glassBox.position.set(0.98, 1.92, 0.02);

    const core = add(new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.34, 2.85, 0.34)), copper));
    core.position.set(0.22, 1.72, 0.52);

    const crown = add(new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.32, 0.06, 1.16)), copper));
    crown.position.set(-0.42, 3.08, 0.02);

    const scaffold = new THREE.Group();
    root.add(scaffold);
    for (let i = 0; i < 5; i += 1) {
      const pole = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 2.5, 8)), metal);
      pole.position.set(-1.08, 1.75, -0.42 + i * 0.22);
      pole.castShadow = true;
      scaffold.add(pole);
    }
    for (let i = 0; i < 4; i += 1) {
      const rail = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.03, 0.02, 1.05)), metal);
      rail.position.set(-1.08, 0.85 + i * 0.62, 0.02);
      scaffold.add(rail);
    }

    const crane = new THREE.Group();
    crane.position.set(-1.85, 0.16, -0.35);
    root.add(crane);
    const mast = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 3.15, 0.08)), metal);
    mast.position.y = 1.58;
    mast.castShadow = true;
    crane.add(mast);
    const jib = new THREE.Group();
    jib.position.y = 3.12;
    crane.add(jib);
    const arm = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.7, 0.045, 0.045)), metal);
    arm.position.x = 1.15;
    arm.castShadow = true;
    jib.add(arm);
    const stay = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.5, 0.015, 0.015)), copper);
    stay.position.set(0.7, 0.18, 0);
    stay.rotation.z = 0.22;
    jib.add(stay);
    const cable = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.008, 0.008, 1.15, 6)), copper);
    cable.position.set(2.15, -0.58, 0);
    jib.add(cable);
    const hook = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 0.08, 0.08)), copper);
    hook.position.set(2.15, -1.18, 0);
    jib.add(hook);

    root.rotation.y = 0.55;

    const pointer = { dragging: false, x: 0, vel: 0 };
    const onDown = (event) => {
      pointer.dragging = true;
      pointer.x = event.clientX;
    };
    const onMove = (event) => {
      if (!pointer.dragging) return;
      const dx = event.clientX - pointer.x;
      pointer.x = event.clientX;
      pointer.vel = dx * 0.005;
      root.rotation.y += pointer.vel;
    };
    const onUp = () => {
      pointer.dragging = false;
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const clock = new THREE.Clock();
    let frame = 0;
    let lightTick = 0;

    function resize() {
      const width = wrap.clientWidth || 1;
      const height = wrap.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();

    let raf = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (!reduce && !pointer.dragging) {
        pointer.vel *= 0.94;
        root.rotation.y += 0.0024 + pointer.vel;
      }
      if (!reduce) {
        jib.rotation.z = Math.sin(t * 0.55) * 0.03;
        hook.position.y = -1.18 + Math.sin(t * 1.3) * 0.06;
        lightTick += 1;
        if (lightTick % 110 === 0) facade.tick();
      }
      const target = pointer.dragging ? 0 : Math.sin(t * 0.25) * 0.08;
      camera.position.x += (5.4 + target - camera.position.x) * 0.04;
      camera.lookAt(0.1, 1.35, 0);
      renderer.render(scene, camera);
      frame += 1;
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      geos.forEach((geo) => geo.dispose());
      mats.forEach((mat) => {
        if (mat.dispose) mat.dispose();
      });
      renderer.dispose();
      frame;
    };
  }, []);

  return (
    <div className="scene-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <p className="webgl-fallback">Study model of a commercial block beside a domestic wing.</p>
    </div>
  );
}
