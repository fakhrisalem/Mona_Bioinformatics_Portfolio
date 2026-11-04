const root = document.documentElement;
const themeButton = document.getElementById('theme-toggle');
const menuButton = document.getElementById('menu-toggle');
const nav = document.getElementById('site-nav');
const motionButton = document.getElementById('motion-toggle');
const year = document.getElementById('year');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = motionPreference.matches;

if (year) year.textContent = String(new Date().getFullYear());

function setTheme(theme) {
  root.dataset.theme = theme;
  const nextLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  themeButton?.setAttribute('aria-label', nextLabel);
  themeButton?.setAttribute('title', nextLabel);
  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute('content', theme === 'dark' ? '#071a1d' : '#f4f2e9');
  try { localStorage.setItem('mona-theme', theme); } catch (_) {}
}

setTheme(root.dataset.theme || 'dark');

themeButton?.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Open navigation menu' : 'Close navigation menu');
  nav?.classList.toggle('is-open', !expanded);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation menu');
    nav.classList.remove('is-open');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation menu');
    nav.classList.remove('is-open');
    menuButton?.focus();
  }
});

function setMotionPaused(paused) {
  motionPaused = paused;
  root.dataset.motionPaused = String(paused);
  if (motionButton) {
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Play molecular animation' : 'Pause molecular animation');
    motionButton.innerHTML = `${paused ? '▶' : 'Ⅱ'} <span>${paused ? 'Play motion' : 'Pause motion'}</span>`;
  }
  window.dispatchEvent(new CustomEvent('portfolio:motion', { detail: { paused } }));
}
setMotionPaused(motionPaused);
motionButton?.addEventListener('click', () => setMotionPaused(!motionPaused));
motionPreference.addEventListener?.('change', (event) => {
  if (event.matches) setMotionPaused(true);
});

const revealTargets = document.querySelectorAll('.section-heading, .project-card, .certificate-card, .skill-group, .focus-copy, .interest-core, .interest-node, .contact-panel');
revealTargets.forEach((element, index) => {
  element.classList.add('reveal');
  if (index % 3 !== 0) element.classList.add(`reveal-delay-${index % 3}`);
});
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
}

const finePointer = window.matchMedia('(pointer: fine)');
if (finePointer.matches && !motionPreference.matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const rx = (0.5 - y) * 2.8;
      const ry = (x - 0.5) * 3.4;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

async function buildMolecule() {
  const canvas = document.getElementById('molecule-canvas');
  const frame = document.getElementById('scene-frame');
  if (!canvas || !frame) return;

  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.set(0, 0, 9.2);
    scene.add(new THREE.AmbientLight(0xc7ffe2, 1.7));
    const keyLight = new THREE.PointLight(0xa9f5d0, 20, 18);
    keyLight.position.set(-3, 3, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xfb806f, 15, 16);
    rimLight.position.set(4, -2, 2);
    scene.add(rimLight);

    const molecule = new THREE.Group();
    scene.add(molecule);
    const helix = new THREE.Group();
    molecule.add(helix);
    const mintMaterial = new THREE.MeshStandardMaterial({ color: 0xa9f5d0, roughness: 0.3, metalness: 0.18, emissive: 0x194438, emissiveIntensity: 0.34 });
    const coralMaterial = new THREE.MeshStandardMaterial({ color: 0xfb806f, roughness: 0.33, metalness: 0.14, emissive: 0x471812, emissiveIntensity: 0.3 });
    const rungMaterial = new THREE.MeshStandardMaterial({ color: 0xe9dfc9, roughness: 0.36, metalness: 0.16, transparent: true, opacity: 0.73 });
    const beadGeometry = new THREE.SphereGeometry(0.075, 12, 10);
    const backboneA = [];
    const backboneB = [];
    const count = 128;
    const turns = Math.PI * 4.2;
    const height = 6.2;
    const radius = 1.05;

    for (let i = 0; i <= count; i += 1) {
      const t = i / count;
      const angle = t * turns;
      const y = (t - 0.5) * height;
      const a = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      const b = new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
      backboneA.push(a);
      backboneB.push(b);
      if (i % 2 === 0) {
        const beadA = new THREE.Mesh(beadGeometry, mintMaterial);
        beadA.position.copy(a);
        const beadB = new THREE.Mesh(beadGeometry, coralMaterial);
        beadB.position.copy(b);
        helix.add(beadA, beadB);
      }
      if (i % 12 === 0 && i < count) {
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        const direction = new THREE.Vector3().subVectors(b, a);
        const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, direction.length(), 6), rungMaterial);
        rung.position.copy(mid);
        rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        helix.add(rung);
      }
    }
    const lineA = new THREE.Line(new THREE.BufferGeometry().setFromPoints(backboneA), new THREE.LineBasicMaterial({ color: 0x8de9c2, transparent: true, opacity: 0.43 }));
    const lineB = new THREE.Line(new THREE.BufferGeometry().setFromPoints(backboneB), new THREE.LineBasicMaterial({ color: 0xf68d78, transparent: true, opacity: 0.43 }));
    helix.add(lineA, lineB);
    helix.rotation.z = -0.1;

    const proteinGeometry = new THREE.IcosahedronGeometry(1.12, 1);
    const protein = new THREE.Mesh(proteinGeometry, new THREE.MeshStandardMaterial({ color: 0x5a9f87, roughness: 0.43, metalness: 0.28, wireframe: true, transparent: true, opacity: 0.32 }));
    protein.position.set(1.38, 0.18, -1.1);
    protein.rotation.set(0.3, 0.4, 0.7);
    molecule.add(protein);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.009, 6, 140), new THREE.MeshBasicMaterial({ color: 0xa9f5d0, transparent: true, opacity: 0.2 }));
    ring.rotation.set(1.2, 0.25, 0.3);
    molecule.add(ring);
    const particlePositions = [];
    for (let i = 0; i < 100; i += 1) {
      particlePositions.push((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4 - 1.1);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xc7e9d9, size: 0.018, transparent: true, opacity: 0.7 }));
    scene.add(particles);

    const resize = () => {
      const { width, height: frameHeight } = frame.getBoundingClientRect();
      if (!width || !frameHeight) return;
      renderer.setSize(width, frameHeight, false);
      camera.aspect = width / frameHeight;
      camera.position.z = width < 600 ? 10.8 : 9.2;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);
    resize();
    frame.classList.add('scene-ready');

    let visible = true;
    let pageActive = true;
    let animationId = 0;
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) scheduleAnimation();
      else {
        cancelAnimationFrame(animationId);
        animationId = 0;
      }
    });
    visibilityObserver.observe(frame);
    document.addEventListener('visibilitychange', () => {
      pageActive = !document.hidden;
      if (pageActive) scheduleAnimation();
      else {
        cancelAnimationFrame(animationId);
        animationId = 0;
      }
    });
    const drawFrame = (time = 0) => {
      animationId = 0;
      if (!visible || !pageActive || motionPaused) {
        renderer.render(scene, camera);
        return;
      }
      const seconds = time * 0.001;
      helix.rotation.y = seconds * 0.16;
      helix.rotation.x = Math.sin(seconds * 0.22) * 0.08;
      protein.rotation.y += 0.0015;
      ring.rotation.z = seconds * 0.045;
      particles.rotation.y = seconds * 0.008;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(drawFrame);
    };
    const scheduleAnimation = () => {
      if (!motionPaused && visible && pageActive && !animationId) {
        animationId = requestAnimationFrame(drawFrame);
      }
    };
    window.addEventListener('portfolio:motion', () => {
      if (motionPaused) {
        cancelAnimationFrame(animationId);
        animationId = 0;
        renderer.render(scene, camera);
      } else {
        scheduleAnimation();
      }
    });
    if (motionPaused) renderer.render(scene, camera);
    else scheduleAnimation();
    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      renderer.dispose();
    }, { once: true });
  } catch (error) {
    console.warn('The molecular scene could not be loaded; the static illustration remains visible.', error);
    canvas.setAttribute('aria-hidden', 'true');
  }
}

buildMolecule();
