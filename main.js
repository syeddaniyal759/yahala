/* ==========================================================
   Eventra — Three.js + GSAP scroll choreography
   ========================================================== */

gsap.registerPlugin(ScrollTrigger);

/* ------------------ Loader ------------------ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 600);
  introAnimation();
});

/* ------------------ Custom cursor ------------------ */
(function cursor() {
  const c = document.getElementById('cursor');
  const d = document.getElementById('cursor-dot');
  let mx = 0, my = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    d.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });
  function loop() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    c.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();
  document.querySelectorAll('a, button, .tilt, .sol-card, .vision-card').forEach(el => {
    el.addEventListener('mouseenter', () => c.classList.add('grow'));
    el.addEventListener('mouseleave', () => c.classList.remove('grow'));
  });
})();

/* ------------------ Hero intro ------------------ */
function introAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.hero-title .line span', {
    y: 0,
    duration: 1.1,
    stagger: 0.12,
  })
  .to('.hero-sub', { opacity: 1, y: 0, duration: 0.9 }, '-=0.5')
  .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
}

/* ------------------ Hero Three.js scene ------------------ */
(function heroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Wireframe icosahedron core — Dusty Grape
  const coreGeo = new THREE.IcosahedronGeometry(1.4, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x5C459C,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // Inner solid glow sphere — Toffee Brown soft
  const innerGeo = new THREE.SphereGeometry(0.7, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x8C5738,
    transparent: true,
    opacity: 0.09,
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  scene.add(inner);

  // Outer torus — Toffee Brown
  const torusGeo = new THREE.TorusGeometry(2.2, 0.014, 16, 100);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0x8C5738, transparent: true, opacity: 0.6 });
  const torus1 = new THREE.Mesh(torusGeo, torusMat);
  torus1.rotation.x = Math.PI / 3;
  scene.add(torus1);

  // Second torus — Dusty Grape
  const torus2 = new THREE.Mesh(torusGeo, torusMat.clone());
  torus2.material.color.set(0x5C459C);
  torus2.material.opacity = 0.55;
  torus2.rotation.x = -Math.PI / 4;
  torus2.rotation.y = Math.PI / 5;
  torus2.scale.set(1.2, 1.2, 1.2);
  scene.add(torus2);

  // Third torus — Dusty Olive
  const torus3 = new THREE.Mesh(torusGeo, torusMat.clone());
  torus3.material.color.set(0x787859);
  torus3.material.opacity = 0.4;
  torus3.rotation.x = Math.PI / 6;
  torus3.rotation.z = Math.PI / 3;
  torus3.scale.set(0.85, 0.85, 0.85);
  scene.add(torus3);

  // Particle field — grape dots
  const particleCount = 900;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 4 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x5C459C,
    size: 0.022,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Mouse parallax
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener('mousemove', (e) => {
    tmx = (e.clientX / window.innerWidth - 0.5) * 0.6;
    tmy = (e.clientY / window.innerHeight - 0.5) * 0.6;
  });

  // Scroll-driven rotation
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;

    core.rotation.x = t * 0.15 + scrollY * 0.001;
    core.rotation.y = t * 0.2 + scrollY * 0.0015;
    inner.rotation.y = t * 0.3;
    inner.scale.setScalar(1 + Math.sin(t * 1.2) * 0.05);

    torus1.rotation.z = t * 0.1;
    torus2.rotation.z = -t * 0.12;

    particles.rotation.y = t * 0.02;
    particles.rotation.x = scrollY * 0.0005;

    camera.position.x += (mx * 1.2 - camera.position.x) * 0.05;
    camera.position.y += (-my * 1.2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Hero scene also fades and shrinks as user scrolls past
  gsap.to(canvas, {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
    opacity: 0,
    scale: 0.85,
  });
})();

/* ------------------ Background floating 3D shapes ------------------ */
(function bgScene() {
  const canvas = document.getElementById('bg-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 14;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const shapes = [];
  const geos = [
    new THREE.OctahedronGeometry(0.6, 0),
    new THREE.TetrahedronGeometry(0.6),
    new THREE.IcosahedronGeometry(0.55, 0),
    new THREE.TorusGeometry(0.5, 0.04, 8, 32),
  ];
  const colors = [0x5C459C, 0x8C5738, 0x787859, 0x425261];

  for (let i = 0; i < 14; i++) {
    const geo = geos[i % geos.length];
    const mat = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(
      (Math.random() - 0.5) * 28,
      (Math.random() - 0.5) * 28,
      (Math.random() - 0.5) * 14 - 4
    );
    m.userData.speed = 0.0008 + Math.random() * 0.0015;
    m.userData.driftX = (Math.random() - 0.5) * 0.002;
    m.userData.driftY = (Math.random() - 0.5) * 0.002;
    m.scale.setScalar(0.6 + Math.random() * 1.6);
    scene.add(m);
    shapes.push(m);
  }

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  function animate() {
    shapes.forEach((s, i) => {
      s.rotation.x += s.userData.speed;
      s.rotation.y += s.userData.speed * 1.4;
      s.position.x += s.userData.driftX;
      s.position.y += s.userData.driftY;
      // Wrap
      if (s.position.x > 16) s.position.x = -16;
      if (s.position.x < -16) s.position.x = 16;
      if (s.position.y > 16) s.position.y = -16;
      if (s.position.y < -16) s.position.y = 16;
    });
    camera.position.y = -scrollY * 0.002;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ------------------ Interactive brand pattern ------------------
   Single layer, fixed tile size, animated only via background-position.
   No rotation, no scale, no warping — pattern stays a clean wallpaper
   that drifts behind the content as you scroll and tracks the cursor.
*/
(function patternBg() {
  const wrap = document.getElementById('pattern-bg');
  const l1 = document.getElementById('pattern-layer-1');
  if (!wrap || !l1) return;

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  let scroll = window.scrollY;
  let tScroll = scroll;

  window.addEventListener('mousemove', (e) => {
    tmx = (e.clientX / window.innerWidth - 0.5);
    tmy = (e.clientY / window.innerHeight - 0.5);
  });
  window.addEventListener('scroll', () => { tScroll = window.scrollY; }, { passive: true });

  function loop() {
    // smooth lerp for natural feel
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    scroll += (tScroll - scroll) * 0.12;

    // Pattern parallax via background-position only.
    // - Vertical drift = scroll * 0.35 (pattern moves up at 35% of scroll speed → depth)
    // - Mouse offset = ±28px (subtle cursor-follow without floating)
    const bx = mx * 28;
    const by = -scroll * 0.35 + my * 28;

    l1.style.backgroundPosition = `${bx.toFixed(1)}px ${by.toFixed(1)}px`;
    requestAnimationFrame(loop);
  }
  loop();

  // Auto-dim pattern over dark sections (feature-strip + contact)
  const darkSections = document.querySelectorAll('.feature-strip, .contact');
  const io = new IntersectionObserver((entries) => {
    const anyVisible = entries.some(e => e.isIntersecting && e.intersectionRatio > 0.25);
    if (anyVisible) wrap.classList.add('pattern-dim');
    else wrap.classList.remove('pattern-dim');
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
  darkSections.forEach(s => io.observe(s));
})();

/* ------------------ Showcase: Three.js ambient + parallax orbits ------------------ */
(function showcaseScene() {
  const canvas = document.getElementById('showcase-canvas');
  const stage = document.getElementById('showcase-stage');
  const core = document.getElementById('stage-core');
  if (!canvas || !stage || !core) return;

  /* --- Three.js ambient: drifting Y-mark and teardrop wireframes --- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 12;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Ring particles around the central dashboard area
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 5 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * 0.9;
    positions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
    positions[i * 3 + 1] = r * Math.sin(phi) * 1.6;
    positions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xc9a456, size: 0.04, transparent: true, opacity: 0.7, sizeAttenuation: true,
  }));
  scene.add(particles);

  // A few drifting wireframe shapes for depth
  const driftShapes = [];
  const geos = [
    new THREE.OctahedronGeometry(0.7),
    new THREE.IcosahedronGeometry(0.6),
    new THREE.TorusGeometry(0.6, 0.02, 8, 32),
  ];
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(
      geos[i % geos.length],
      new THREE.MeshBasicMaterial({
        color: i % 2 ? 0xc9a456 : 0xe8e3d9,
        wireframe: true, transparent: true, opacity: 0.35,
      })
    );
    m.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 8 - 2
    );
    m.userData.spd = 0.001 + Math.random() * 0.003;
    m.userData.driftY = (Math.random() - 0.5) * 0.004;
    scene.add(m);
    driftShapes.push(m);
  }

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    particles.rotation.y = t * 0.04;
    particles.rotation.x = Math.sin(t * 0.2) * 0.05;
    driftShapes.forEach((s) => {
      s.rotation.x += s.userData.spd;
      s.rotation.y += s.userData.spd * 1.4;
      s.position.y += s.userData.driftY;
      if (s.position.y > 6) s.position.y = -6;
      if (s.position.y < -6) s.position.y = 6;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  /* --- Mouse parallax on the central dashboard + orbit cards --- */
  const orbits = stage.querySelectorAll('.orbit');
  let tmx = 0, tmy = 0, mx = 0, my = 0;

  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    tmx = (e.clientX - r.left) / r.width - 0.5;
    tmy = (e.clientY - r.top) / r.height - 0.5;
  });
  stage.addEventListener('mouseleave', () => { tmx = 0; tmy = 0; });

  // Persistent rotation values for the core (scroll-driven baseline + mouse offset)
  let scrollTilt = 0;
  ScrollTrigger.create({
    trigger: '.showcase',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => { scrollTilt = self.progress; },
  });

  function loop() {
    mx += (tmx - mx) * 0.06;
    my += (tmy - my) * 0.06;

    // Core: base tilt eases as you scroll past, mouse adds subtle nudge
    const baseRX = 14 - scrollTilt * 18;   // 14° -> -4°
    const baseRY = -10 + scrollTilt * 20;  // -10° -> 10°
    const rx = baseRX + my * -8;
    const ry = baseRY + mx * 12;
    core.style.transform = `translate(-50%, -50%) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

    // Orbits: each follows mouse with depth-weighted offset + slow float
    const t = performance.now() * 0.001;
    orbits.forEach((el, i) => {
      const depth = parseFloat(getComputedStyle(el).getPropertyValue('--depth')) || 50;
      const offX = mx * depth;
      const offY = my * depth;
      const floatY = Math.sin(t + i * 1.3) * 6;
      const floatX = Math.cos(t * 0.7 + i * 0.9) * 4;
      el.style.transform = `translate3d(${(offX + floatX).toFixed(1)}px, ${(offY + floatY).toFixed(1)}px, 0)`;
    });

    requestAnimationFrame(loop);
  }
  loop();

  // Reveal orbits in sequence on scroll-in
  gsap.from(orbits, {
    scrollTrigger: { trigger: '.showcase', start: 'top 75%', toggleActions: 'play none none reverse' },
    opacity: 0,
    scale: 0.7,
    duration: 0.9,
    stagger: 0.08,
    ease: 'back.out(1.4)',
  });
  gsap.from('.stage-core', {
    scrollTrigger: { trigger: '.showcase', start: 'top 75%', toggleActions: 'play none none reverse' },
    opacity: 0,
    scale: 0.92,
    duration: 1,
    ease: 'power3.out',
  });
})();

/* ------------------ Hero Option 6: spotlight reveal ------------------ */
(function spotlightHero() {
  const hero = document.getElementById('hero-6');
  const spot = document.getElementById('spotlight');
  const glow = document.getElementById('spot-glow');
  if (!hero || !spot || !glow) return;

  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let cx = tx, cy = ty;

  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
  });
  // Touch support
  hero.addEventListener('touchmove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = e.touches[0].clientX - r.left;
    ty = e.touches[0].clientY - r.top;
  }, { passive: true });

  function loop() {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    const x = `${cx.toFixed(0)}px`;
    const y = `${cy.toFixed(0)}px`;
    spot.style.setProperty('--mx', x);
    spot.style.setProperty('--my', y);
    glow.style.setProperty('--mx', x);
    glow.style.setProperty('--my', y);
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ------------------ Hero Option 2: depth-card parallax ------------------ */
(function depthHero() {
  const stage = document.getElementById('depth-stage');
  if (!stage) return;
  const cards = stage.querySelectorAll('.d-card');

  let tmx = 0, tmy = 0, mx = 0, my = 0;

  // Track mouse globally so the effect is felt across the whole hero
  const heroSection = stage.closest('.hero-v5');
  const target = heroSection || stage;

  target.addEventListener('mousemove', (e) => {
    const r = target.getBoundingClientRect();
    tmx = (e.clientX - r.left) / r.width - 0.5;
    tmy = (e.clientY - r.top) / r.height - 0.5;
  });
  target.addEventListener('mouseleave', () => { tmx = 0; tmy = 0; });

  // Cache base rotation from CSS --base var
  const baseRotations = [];
  cards.forEach((c) => {
    const base = getComputedStyle(c).getPropertyValue('--base').trim();
    const m = base.match(/-?\d+(\.\d+)?/);
    baseRotations.push(m ? parseFloat(m[0]) : 0);
  });

  function loop() {
    mx += (tmx - mx) * 0.06;
    my += (tmy - my) * 0.06;
    cards.forEach((c, i) => {
      const depth = parseFloat(c.dataset.depth) || 40;
      const tx = mx * depth;
      const ty = my * depth * 0.7;
      const tilt = mx * 6;
      const rot = baseRotations[i] + tilt;
      c.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
    });
    requestAnimationFrame(loop);
  }
  loop();

  // Stagger cards in on first appearance
  gsap.from(cards, {
    scrollTrigger: { trigger: '.hero-v5', start: 'top 75%', toggleActions: 'play none none reverse' },
    opacity: 0,
    scale: 0.7,
    duration: 0.9,
    stagger: 0.1,
    ease: 'back.out(1.4)',
  });
})();

/* ------------------ Globe Showcase: 3D Gulf events globe ------------------ */
(function globeShowcase() {
  const canvas = document.getElementById('globe-canvas');
  const cardsLayer = document.getElementById('globe-cards');
  const stage = document.getElementById('globe-stage');
  const dragHint = document.getElementById('drag-hint');
  if (!canvas || !cardsLayer || !stage) return;

  /* --- City data (lat, lng, label, attendees, status) --- */
  const cities = [
    { name: 'Riyadh',      flag: '🇸🇦', lat: 24.7136, lng: 46.6753, event: 'Gov Forum',       count: '5,120 registered', live: true  },
    { name: 'Jeddah',      flag: '🇸🇦', lat: 21.4858, lng: 39.1925, event: 'Trade Expo',      count: '2,410 attending',  live: true  },
    { name: 'Dubai',       flag: '🇦🇪', lat: 25.2048, lng: 55.2708, event: 'Tech Summit',     count: '2,847 live now',   live: true  },
    { name: 'Abu Dhabi',   flag: '🇦🇪', lat: 24.4539, lng: 54.3773, event: 'Innovation Days', count: '1,640 live now',   live: true  },
    { name: 'Doha',        flag: '🇶🇦', lat: 25.2854, lng: 51.5310, event: 'Education Expo',  count: '1,932 live now',   live: true  },
    { name: 'Kuwait City', flag: '🇰🇼', lat: 29.3759, lng: 47.9774, event: 'Finance Forum',   count: '980 attending',    live: false },
    { name: 'Manama',      flag: '🇧🇭', lat: 26.2235, lng: 50.5876, event: 'Health Congress', count: '1,205 attending',  live: true  },
    { name: 'Muscat',      flag: '🇴🇲', lat: 23.5859, lng: 58.4059, event: 'Energy Summit',   count: '1,540 attending',  live: false },
  ];
  const arcPairs = [[0, 2], [3, 4], [1, 6], [5, 7], [2, 4], [0, 6], [3, 7]];

  /* --- Three.js scene --- */
  const scene = new THREE.Scene();
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
  camera.position.z = 7.2;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* --- Globe group: solid sphere + wireframe overlay + atmospheric glow --- */
  const globe = new THREE.Group();
  // Tilt the globe to favour the GCC region (around 25°N) — bring it forward & up
  globe.rotation.x = -0.45;
  globe.rotation.y = -0.9;
  scene.add(globe);

  // Base sphere
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(2, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x1a0e3a })
  );
  globe.add(earth);

  // Lat/lng wireframe overlay
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(2.005, 36, 18),
    new THREE.MeshBasicMaterial({
      color: 0xc9a456, wireframe: true, transparent: true, opacity: 0.18,
    })
  );
  globe.add(wire);

  // Subtle dotted overlay for "land" feel — random dots on the sphere
  const dotCount = 1400;
  const dotPositions = new Float32Array(dotCount * 3);
  for (let i = 0; i < dotCount; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 2.01;
    dotPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    dotPositions[i * 3 + 1] = r * Math.cos(phi);
    dotPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
  const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({
    color: 0x6f53b3, size: 0.018, transparent: true, opacity: 0.7, sizeAttenuation: true,
  }));
  globe.add(dots);

  // Atmospheric glow (back-side sphere)
  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.18, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xc9a456, transparent: true, opacity: 0.08, side: THREE.BackSide,
    })
  ));
  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.32, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x5C459C, transparent: true, opacity: 0.06, side: THREE.BackSide,
    })
  ));

  /* --- Lat/lng → 3D position --- */
  function latLngToVec(lat, lng, r) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta),
    );
  }

  /* --- City pins (small glowing spheres) --- */
  const pinObjects = [];
  cities.forEach((c) => {
    const pos = latLngToVec(c.lat, c.lng, 2.02);
    const pin = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 16, 16),
      new THREE.MeshBasicMaterial({ color: c.live ? 0xc9a456 : 0xe8e3d9 })
    );
    pin.position.copy(pos);
    globe.add(pin);

    // Halo around the pin (soft glow)
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({
        color: c.live ? 0xc9a456 : 0xe8e3d9,
        transparent: true, opacity: 0.35,
      })
    );
    halo.position.copy(pos);
    globe.add(halo);

    // Outward beam (small line from surface out)
    if (c.live) {
      const out = pos.clone().normalize().multiplyScalar(2.18);
      const beamGeo = new THREE.BufferGeometry().setFromPoints([pos, out]);
      const beam = new THREE.Line(beamGeo, new THREE.LineBasicMaterial({
        color: 0xc9a456, transparent: true, opacity: 0.7,
      }));
      globe.add(beam);
    }

    pinObjects.push({ mesh: pin, pos: pos.clone(), city: c });
  });

  /* --- Animated arcs between city pairs --- */
  const arcObjects = [];
  arcPairs.forEach(([i, j]) => {
    const start = latLngToVec(cities[i].lat, cities[i].lng, 2.02);
    const end   = latLngToVec(cities[j].lat, cities[j].lng, 2.02);
    const dist  = start.distanceTo(end);
    const mid   = start.clone().lerp(end, 0.5).normalize().multiplyScalar(2.02 + dist * 0.4);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(60);

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const arc = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: 0xc9a456, transparent: true, opacity: 0.32,
    }));
    globe.add(arc);

    // Travelling pulse along the arc
    const pulseGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const pulse = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color: 0xe6c068 }));
    globe.add(pulse);

    arcObjects.push({
      curve,
      pulse,
      offset: Math.random(),
      speed: 0.08 + Math.random() * 0.06,
    });
  });

  /* --- HTML cards anchored to live city pins --- */
  const cardElements = pinObjects
    .filter(p => p.city.live)
    .slice(0, 5) // limit to 5 cards visible on screen
    .map((p) => {
      const el = document.createElement('div');
      el.className = 'globe-card';
      el.innerHTML = `
        <span class="gc-flag">${p.city.flag}</span>
        <span class="gc-pulse"></span>
        <div class="gc-info">
          <span class="gc-city">${p.city.name} · ${p.city.event}</span>
          <span class="gc-stat">${p.city.count}</span>
        </div>`;
      cardsLayer.appendChild(el);
      return { el, pin: p };
    });

  /* --- Drag-to-rotate (mouse + touch) --- */
  let isDragging = false;
  let lastX = 0, lastY = 0;
  let velX = 0, velY = 0;
  let userInteracted = false;

  function onDown(x, y) {
    isDragging = true;
    lastX = x; lastY = y;
    canvas.style.cursor = 'grabbing';
    if (!userInteracted) {
      userInteracted = true;
      if (dragHint) dragHint.classList.add('hidden');
    }
  }
  function onMove(x, y) {
    if (!isDragging) return;
    const dx = x - lastX;
    const dy = y - lastY;
    velX = dx * 0.005;
    velY = dy * 0.005;
    globe.rotation.y += velX;
    globe.rotation.x += velY;
    lastX = x; lastY = y;
  }
  function onUp() {
    isDragging = false;
    canvas.style.cursor = 'grab';
  }

  canvas.addEventListener('mousedown', (e) => onDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', onUp);
  canvas.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  canvas.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  canvas.addEventListener('touchend', onUp);

  /* --- Render loop --- */
  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();

    // Auto-rotate when not dragging (and ease velocity to zero after release)
    if (!isDragging) {
      globe.rotation.y += 0.0018 + velX * 0.5;
      globe.rotation.x += velY * 0.5;
      velX *= 0.94;
      velY *= 0.94;
    }
    // Clamp x rotation so user can't flip globe upside-down forever
    globe.rotation.x = Math.max(-1.2, Math.min(0.6, globe.rotation.x));

    // Travelling arc pulses
    arcObjects.forEach((a) => {
      a.offset += a.speed * 0.012;
      if (a.offset > 1) a.offset -= 1;
      const p = a.curve.getPoint(a.offset);
      a.pulse.position.copy(p);
      a.pulse.scale.setScalar(0.8 + Math.sin(t * 4 + a.offset * 6) * 0.3);
    });

    // Project pins to screen and update HTML cards
    const rect = canvas.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const offsetX = rect.left - stageRect.left;
    const offsetY = rect.top - stageRect.top;

    cardElements.forEach(({ el, pin }) => {
      const world = pin.pos.clone().applyMatrix4(globe.matrixWorld);
      const projected = world.clone().project(camera);
      // Hidden if behind globe (negative Z when transformed to camera space)
      const camSpace = world.clone().applyMatrix4(camera.matrixWorldInverse);
      const visible = camSpace.z < 0; // in front of camera
      // Also check if the pin is on the front-facing side of the globe
      const dot = world.clone().normalize().dot(camera.position.clone().normalize());
      const facing = dot > -0.1; // a little tolerance for edge cases

      if (visible && facing) {
        const screenX = (projected.x * 0.5 + 0.5) * rect.width + offsetX;
        const screenY = (-projected.y * 0.5 + 0.5) * rect.height + offsetY;
        el.style.left = `${screenX.toFixed(1)}px`;
        el.style.top = `${(screenY - 40).toFixed(1)}px`; // sit above the pin
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  /* --- Live counters tick up over time --- */
  const eventsEl = document.getElementById('globe-events');
  const attendeesEl = document.getElementById('globe-attendees');
  if (eventsEl && attendeesEl) {
    let baseAttendees = 18247;
    let baseEvents = 12;
    setInterval(() => {
      baseAttendees += Math.floor(Math.random() * 14) + 1;
      attendeesEl.textContent = baseAttendees.toLocaleString('en-US');
      if (Math.random() > 0.92) {
        baseEvents += Math.random() > 0.5 ? 1 : -1;
        baseEvents = Math.max(8, Math.min(18, baseEvents));
        eventsEl.textContent = baseEvents;
      }
    }, 1400);
  }

  /* --- Section reveal --- */
  gsap.from('#globe-canvas', {
    scrollTrigger: { trigger: '.globe-showcase', start: 'top 70%', toggleActions: 'play none none reverse' },
    opacity: 0,
    scale: 0.85,
    duration: 1.4,
    ease: 'power3.out',
  });
})();

/* ------------------ Reveal on scroll ------------------ */
gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
  });
});

/* ------------------ Section title char split + 3D drop ------------------ */
gsap.utils.toArray('.section-title').forEach((title) => {
  gsap.from(title, {
    scrollTrigger: {
      trigger: title,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    rotationX: -40,
    transformOrigin: '50% 50% -50',
    duration: 1.2,
    ease: 'power3.out',
  });
});

/* ------------------ Stat counters ------------------ */
gsap.utils.toArray('.stat-num').forEach((el) => {
  const target = parseInt(el.dataset.count, 10);
  const obj = { val: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.floor(obj.val); },
      });
    },
  });
});

/* ------------------ 3D tilt on cards ------------------ */
document.querySelectorAll('.tilt').forEach((el) => {
  let rect;
  el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
  el.addEventListener('mousemove', (e) => {
    if (!rect) rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -14;
    const ry = ((x / rect.width) - 0.5) * 14;
    gsap.to(el, { rotationX: rx, rotationY: ry, transformPerspective: 1000, duration: 0.4, ease: 'power2.out' });
    el.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
    el.style.setProperty('--my', `${(y / rect.height) * 100}%`);
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power3.out' });
    rect = null;
  });
});

/* ------------------ Industries: pinned horizontal scroll ------------------
   Initialised AFTER document.fonts.ready so brand fonts (Moon 2.0, Madani
   Arabic) finish loading before GSAP measures track width. This is the
   single most important defence against the recurring "scroll messed up"
   issue on the AR page. */
function initIndustriesScroll() {
  const track = document.getElementById('industries-track');
  if (!track) return;
  if (window.innerWidth < 860) return;

  const compute = () => {
    const trackWidth = track.scrollWidth;
    const distance = trackWidth - window.innerWidth + 80;
    return Math.max(distance, 0);
  };

  const rtl = document.documentElement.dir === 'rtl';
  gsap.to(track, {
    x: () => (rtl ? compute() : -compute()),
    ease: 'none',
    scrollTrigger: {
      trigger: '.industries',
      start: 'top top',
      end: () => `+=${compute()}`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Multiple staggered refreshes — layout, images, late CSS can all shift measurements
  setTimeout(() => { try { ScrollTrigger.refresh(); } catch (e) {} }, 300);
  setTimeout(() => { try { ScrollTrigger.refresh(); } catch (e) {} }, 1000);
  setTimeout(() => { try { ScrollTrigger.refresh(); } catch (e) {} }, 2500);
  window.addEventListener('resize', () => { try { ScrollTrigger.refresh(); } catch (e) {} });
  window.addEventListener('load', () => { try { ScrollTrigger.refresh(); } catch (e) {} });
}

// Initialise once after fonts load AND window load — whichever comes later
function bootIndustriesScroll() {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (document.readyState === 'complete') initIndustriesScroll();
      else window.addEventListener('load', initIndustriesScroll);
    });
  } else {
    window.addEventListener('load', initIndustriesScroll);
  }
}
bootIndustriesScroll();

/* ------------------ Fullscreen takeover menu ------------------ */
(function fullscreenMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('fullscreen-menu');
  const closeBtn = document.getElementById('fm-close');
  if (!toggle || !menu) return;

  function open() {
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  }
  function close() {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }
  function toggleMenu() {
    if (document.body.classList.contains('menu-open')) close();
    else open();
  }

  toggle.addEventListener('click', toggleMenu);
  if (closeBtn) closeBtn.addEventListener('click', close);

  // Close when a menu item is clicked (small delay so the link can scroll first)
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setTimeout(close, 220));
  });

  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) close();
  });
})();

/* ------------------ Nav hide on scroll down ------------------ */
(function navScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let last = 0;
  const hidePos = '-220px'; // clears the slim bar + logo overflow below
  const showPos = '0px';
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > last && y > 200) nav.style.top = hidePos;
    else nav.style.top = showPos;
    last = y;
  }, { passive: true });
})();

/* ------------------ Content protection deterrents ------------------
   Blocks right-click, common DevTools shortcuts, and copy/cut events.
   Note: anyone determined can bypass via browser menu, disabled JS, or
   view-source — this only stops casual users. */
(function contentGuard() {
  // 1. Right-click menu (which contains "Inspect")
  document.addEventListener('contextmenu', (e) => { e.preventDefault(); return false; });

  // 2. DevTools / view-source / save shortcuts
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    // F12
    if (k === 'f12') { e.preventDefault(); return false; }
    // Ctrl+Shift+I / J / C  (Chrome / Edge / Firefox DevTools panels + element picker)
    if (e.ctrlKey && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) {
      e.preventDefault(); return false;
    }
    // Cmd+Opt+I / J / C on macOS
    if (e.metaKey && e.altKey && (k === 'i' || k === 'j' || k === 'c')) {
      e.preventDefault(); return false;
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && k === 'u') { e.preventDefault(); return false; }
    // Cmd+Opt+U on macOS
    if (e.metaKey && e.altKey && k === 'u') { e.preventDefault(); return false; }
    // Ctrl+S / Cmd+S (save page)
    if ((e.ctrlKey || e.metaKey) && k === 's') { e.preventDefault(); return false; }
    // Ctrl+A (select all) — optional; remove these two lines if you want users to be able to highlight
    if ((e.ctrlKey || e.metaKey) && k === 'a' && !['INPUT','TEXTAREA'].includes((e.target.tagName||'').toUpperCase())) {
      e.preventDefault(); return false;
    }
  });

  // 3. Copy / cut / drag — silently no-op
  ['copy', 'cut', 'dragstart'].forEach((evt) => {
    document.addEventListener(evt, (e) => {
      // Allow inside form fields
      const tag = (e.target && e.target.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
    });
  });
})();

/* ------------------ Refresh ScrollTrigger after fonts/loader ------------------
   Critical for deployment: brand fonts (Moon 2.0, Madani Arabic) load async,
   reflow the layout after ScrollTrigger has already measured positions.
   Refresh on EVERY major layout event so pinned sections stay correct. */
function refreshTriggers() {
  try { ScrollTrigger.refresh(); } catch (e) {}
}

// 1. After all stylesheets + images have loaded
window.addEventListener('load', () => setTimeout(refreshTriggers, 100));

// 2. After all @font-face fonts have finished loading (the big one for deploy)
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    refreshTriggers();
    // Belt-and-suspenders: refresh again a few hundred ms later in case
    // a late-loading font still triggers reflow
    setTimeout(refreshTriggers, 400);
    setTimeout(refreshTriggers, 1200);
  });
}

// 3. On window resize (defensive)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(refreshTriggers, 250);
});

/* ------------------ Phone country code selector ------------------ */
(function phoneCountrySelector() {
  // Curated list: GCC + MENA + major intl. iso, dial code, English name, Arabic name, flag emoji.
  const COUNTRIES = [
    { iso: 'SA', code: '+966', en: 'Saudi Arabia',        ar: 'السعودية',        flag: '🇸🇦' },
    { iso: 'AE', code: '+971', en: 'United Arab Emirates', ar: 'الإمارات',         flag: '🇦🇪' },
    { iso: 'KW', code: '+965', en: 'Kuwait',              ar: 'الكويت',           flag: '🇰🇼' },
    { iso: 'QA', code: '+974', en: 'Qatar',               ar: 'قطر',              flag: '🇶🇦' },
    { iso: 'BH', code: '+973', en: 'Bahrain',             ar: 'البحرين',          flag: '🇧🇭' },
    { iso: 'OM', code: '+968', en: 'Oman',                ar: 'عُمان',            flag: '🇴🇲' },
    { iso: 'YE', code: '+967', en: 'Yemen',               ar: 'اليمن',            flag: '🇾🇪' },
    { iso: 'EG', code: '+20',  en: 'Egypt',               ar: 'مصر',              flag: '🇪🇬' },
    { iso: 'JO', code: '+962', en: 'Jordan',              ar: 'الأردن',           flag: '🇯🇴' },
    { iso: 'LB', code: '+961', en: 'Lebanon',             ar: 'لبنان',            flag: '🇱🇧' },
    { iso: 'SY', code: '+963', en: 'Syria',               ar: 'سوريا',            flag: '🇸🇾' },
    { iso: 'IQ', code: '+964', en: 'Iraq',                ar: 'العراق',           flag: '🇮🇶' },
    { iso: 'PS', code: '+970', en: 'Palestine',           ar: 'فلسطين',           flag: '🇵🇸' },
    { iso: 'MA', code: '+212', en: 'Morocco',             ar: 'المغرب',           flag: '🇲🇦' },
    { iso: 'DZ', code: '+213', en: 'Algeria',             ar: 'الجزائر',          flag: '🇩🇿' },
    { iso: 'TN', code: '+216', en: 'Tunisia',             ar: 'تونس',             flag: '🇹🇳' },
    { iso: 'LY', code: '+218', en: 'Libya',               ar: 'ليبيا',            flag: '🇱🇾' },
    { iso: 'SD', code: '+249', en: 'Sudan',               ar: 'السودان',          flag: '🇸🇩' },
    { iso: 'TR', code: '+90',  en: 'Turkey',              ar: 'تركيا',            flag: '🇹🇷' },
    { iso: 'IR', code: '+98',  en: 'Iran',                ar: 'إيران',            flag: '🇮🇷' },
    { iso: 'PK', code: '+92',  en: 'Pakistan',            ar: 'باكستان',          flag: '🇵🇰' },
    { iso: 'IN', code: '+91',  en: 'India',               ar: 'الهند',            flag: '🇮🇳' },
    { iso: 'BD', code: '+880', en: 'Bangladesh',          ar: 'بنغلاديش',         flag: '🇧🇩' },
    { iso: 'PH', code: '+63',  en: 'Philippines',         ar: 'الفلبين',          flag: '🇵🇭' },
    { iso: 'ID', code: '+62',  en: 'Indonesia',           ar: 'إندونيسيا',        flag: '🇮🇩' },
    { iso: 'MY', code: '+60',  en: 'Malaysia',            ar: 'ماليزيا',          flag: '🇲🇾' },
    { iso: 'SG', code: '+65',  en: 'Singapore',           ar: 'سنغافورة',         flag: '🇸🇬' },
    { iso: 'CN', code: '+86',  en: 'China',               ar: 'الصين',            flag: '🇨🇳' },
    { iso: 'JP', code: '+81',  en: 'Japan',               ar: 'اليابان',          flag: '🇯🇵' },
    { iso: 'KR', code: '+82',  en: 'South Korea',         ar: 'كوريا الجنوبية',   flag: '🇰🇷' },
    { iso: 'GB', code: '+44',  en: 'United Kingdom',      ar: 'المملكة المتحدة',  flag: '🇬🇧' },
    { iso: 'IE', code: '+353', en: 'Ireland',             ar: 'أيرلندا',          flag: '🇮🇪' },
    { iso: 'FR', code: '+33',  en: 'France',              ar: 'فرنسا',            flag: '🇫🇷' },
    { iso: 'DE', code: '+49',  en: 'Germany',             ar: 'ألمانيا',          flag: '🇩🇪' },
    { iso: 'IT', code: '+39',  en: 'Italy',               ar: 'إيطاليا',          flag: '🇮🇹' },
    { iso: 'ES', code: '+34',  en: 'Spain',               ar: 'إسبانيا',          flag: '🇪🇸' },
    { iso: 'NL', code: '+31',  en: 'Netherlands',         ar: 'هولندا',           flag: '🇳🇱' },
    { iso: 'BE', code: '+32',  en: 'Belgium',             ar: 'بلجيكا',           flag: '🇧🇪' },
    { iso: 'CH', code: '+41',  en: 'Switzerland',         ar: 'سويسرا',           flag: '🇨🇭' },
    { iso: 'SE', code: '+46',  en: 'Sweden',              ar: 'السويد',           flag: '🇸🇪' },
    { iso: 'NO', code: '+47',  en: 'Norway',              ar: 'النرويج',          flag: '🇳🇴' },
    { iso: 'DK', code: '+45',  en: 'Denmark',             ar: 'الدنمارك',         flag: '🇩🇰' },
    { iso: 'FI', code: '+358', en: 'Finland',             ar: 'فنلندا',           flag: '🇫🇮' },
    { iso: 'GR', code: '+30',  en: 'Greece',              ar: 'اليونان',          flag: '🇬🇷' },
    { iso: 'PT', code: '+351', en: 'Portugal',            ar: 'البرتغال',         flag: '🇵🇹' },
    { iso: 'RU', code: '+7',   en: 'Russia',              ar: 'روسيا',            flag: '🇷🇺' },
    { iso: 'US', code: '+1',   en: 'United States',       ar: 'الولايات المتحدة', flag: '🇺🇸' },
    { iso: 'CA', code: '+1',   en: 'Canada',              ar: 'كندا',             flag: '🇨🇦' },
    { iso: 'MX', code: '+52',  en: 'Mexico',              ar: 'المكسيك',          flag: '🇲🇽' },
    { iso: 'BR', code: '+55',  en: 'Brazil',              ar: 'البرازيل',         flag: '🇧🇷' },
    { iso: 'AR', code: '+54',  en: 'Argentina',           ar: 'الأرجنتين',        flag: '🇦🇷' },
    { iso: 'AU', code: '+61',  en: 'Australia',           ar: 'أستراليا',         flag: '🇦🇺' },
    { iso: 'NZ', code: '+64',  en: 'New Zealand',         ar: 'نيوزيلندا',        flag: '🇳🇿' },
    { iso: 'ZA', code: '+27',  en: 'South Africa',        ar: 'جنوب أفريقيا',     flag: '🇿🇦' },
    { iso: 'NG', code: '+234', en: 'Nigeria',             ar: 'نيجيريا',          flag: '🇳🇬' },
    { iso: 'KE', code: '+254', en: 'Kenya',               ar: 'كينيا',            flag: '🇰🇪' },
    { iso: 'ET', code: '+251', en: 'Ethiopia',            ar: 'إثيوبيا',          flag: '🇪🇹' },
  ];

  const isArabic = document.documentElement.dir === 'rtl';

  document.querySelectorAll('[data-phone-input]').forEach((root) => {
    const btn = root.querySelector('.phone-cc-btn');
    const flagEl = root.querySelector('[data-flag]');
    const codeEl = root.querySelector('[data-code]');
    const numInput = root.querySelector('.phone-num');
    const menu = root.querySelector('.phone-cc-menu');
    const search = root.querySelector('.phone-cc-search');
    const list = root.querySelector('.phone-cc-list');
    const hidden = root.parentElement.querySelector('[data-phone-output]');

    let selected = COUNTRIES.find((c) => c.iso === (root.dataset.default || 'SA')) || COUNTRIES[0];

    // Sort alphabetically by the active-language name. Use Intl.Collator so
    // Arabic letters sort correctly when on the AR page.
    const collator = new Intl.Collator(isArabic ? 'ar' : 'en', { sensitivity: 'base' });
    const sortedCountries = [...COUNTRIES].sort((a, b) =>
      collator.compare(isArabic ? a.ar : a.en, isArabic ? b.ar : b.en)
    );

    function render(filter) {
      const q = (filter || '').trim().toLowerCase();
      const filtered = q
        ? sortedCountries.filter((c) =>
            c.en.toLowerCase().includes(q) ||
            c.ar.includes(q) ||
            c.code.includes(q) ||
            c.iso.toLowerCase().includes(q)
          )
        : sortedCountries;
      if (!filtered.length) {
        list.innerHTML = '<li class="phone-cc-empty">' + (isArabic ? 'لا توجد نتائج' : 'No results') + '</li>';
        return;
      }
      list.innerHTML = filtered.map((c) => `
        <li role="option" data-iso="${c.iso}" ${c.iso === selected.iso ? 'aria-selected="true"' : ''}>
          <span class="flag">${c.flag}</span>
          <span class="name">${isArabic ? c.ar : c.en}</span>
          <span class="code">${c.code}</span>
        </li>
      `).join('');
      // Re-parse flags with Twemoji if available so they render on Windows/Chrome too
      if (window.twemoji) {
        try { twemoji.parse(list, { folder: 'svg', ext: '.svg' }); } catch (e) {}
      }
    }

    function applySelection(c) {
      selected = c;
      flagEl.textContent = c.flag;
      codeEl.textContent = c.code;
      if (window.twemoji) {
        try { twemoji.parse(flagEl, { folder: 'svg', ext: '.svg' }); } catch (e) {}
      }
      syncHidden();
    }

    function syncHidden() {
      if (!hidden) return;
      const num = (numInput.value || '').replace(/\D+/g, '');
      hidden.value = num ? selected.code + num : '';
    }

    function open() {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      search.value = '';
      render('');
      setTimeout(() => search.focus(), 50);
    }
    function close() {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.hidden ? open() : close();
    });

    search.addEventListener('input', () => render(search.value));
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); btn.focus(); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const first = list.querySelector('li[data-iso]');
        if (first) first.click();
      }
    });

    list.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-iso]');
      if (!li) return;
      const c = COUNTRIES.find((x) => x.iso === li.dataset.iso);
      if (c) {
        applySelection(c);
        close();
        numInput.focus();
      }
    });

    numInput.addEventListener('input', syncHidden);

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) close();
    });
    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) close();
    });

    // Initial render of the trigger button
    applySelection(selected);
  });
})();

/* ------------------ Contact form submit (Formsubmit.co AJAX) ------------------
   Posts to formsubmit.co with JSON. Shows the .form-success div on 200, the
   .form-error div on failure. Keeps the user on the page. */
(function contactFormHandler() {
  document.querySelectorAll('form.contact-form[action*="formsubmit.co"]').forEach((form) => {
    const successEl = form.querySelector('.form-success');
    const errorEl = form.querySelector('.form-error');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.querySelector('span')?.textContent : '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (successEl) successEl.hidden = true;
      if (errorEl) errorEl.hidden = true;

      if (submitBtn) {
        submitBtn.disabled = true;
        const span = submitBtn.querySelector('span');
        if (span) span.textContent = document.documentElement.dir === 'rtl' ? 'جارٍ الإرسال…' : 'Sending…';
      }

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.success === 'true' || data.success === true)) {
          if (successEl) successEl.hidden = false;
          form.reset();
        } else {
          throw new Error(data.message || 'submit failed');
        }
      } catch (err) {
        if (errorEl) errorEl.hidden = false;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          const span = submitBtn.querySelector('span');
          if (span && originalLabel) span.textContent = originalLabel;
        }
      }
    });
  });
})();
