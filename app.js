/*
  Azka's portfolio interactions (no frameworks).
  - Sticky header elevation
  - Mobile nav
  - Scroll reveal
  - Cursor glow + project spotlight
  - Tiny 3D tilt
  - Lightweight particles background
  - Contact form (mailto helper)
*/

// Helpers
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const $ = (sel, root = document) => root.querySelector(sel);

// Year + sticky header
(() => {
  const topbar = $("[data-elevate]");
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const setElevated = () => {
    if (!topbar) return;
    topbar.classList.toggle("is-elevated", window.scrollY > 8);
  };
  setElevated();
  window.addEventListener("scroll", setElevated, { passive: true });
})();

// Mobile nav toggle
(() => {
  const toggle = $(".nav__toggle");
  const menu = $(".nav__menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking a link
  $$("a", menu).forEach((a) => {
    a.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

// Scroll reveal
(() => {
  const els = $$(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
})();

// Cursor glow + project spotlight
(() => {
  const glow = $("#glow");
  const projects = $$(".project");
  if (!glow && !projects.length) return;

  const onMove = (e) => {
    document.body.classList.add("is-pointer");

    if (glow) {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }

    projects.forEach((card) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  };

  const onLeave = () => {
    document.body.classList.remove("is-pointer");
  };

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseleave", onLeave);
})();

// Tiny 3D tilt for the first .card3d
(() => {
  const card = $(".card3d");
  if (!card) return;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const onMove = (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rotY = clamp((x - 0.5) * 12, -9, 9);
    const rotX = clamp((0.5 - y) * 12, -9, 9);
    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-1px)`;
  };

  const reset = () => {
    card.style.transform = "";
  };

  card.addEventListener("mousemove", onMove);
  card.addEventListener("mouseleave", reset);
})();

// Particles background (super light)
(() => {
  const canvas = $("#fx");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  let w = 0;
  let h = 0;
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  const resize = () => {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const rand = (min, max) => min + Math.random() * (max - min);
  const count = Math.max(38, Math.min(70, Math.floor(w / 22)));

  const dots = Array.from({ length: count }).map(() => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(1, 2.4),
    vx: rand(-0.2, 0.2),
    vy: rand(-0.18, 0.18),
    a: rand(0.06, 0.14),
  }));

  const step = () => {
    ctx.clearRect(0, 0, w, h);

    // dots
    for (const p of dots) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168,85,247,${p.a})`;
      ctx.fill();
    }

    // subtle links (nearest-neighbour)
    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      for (let j = i + 1; j < dots.length; j++) {
        const b = dots[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 125) {
          const alpha = (1 - dist / 125) * 0.08;
          ctx.strokeStyle = `rgba(236,72,153,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();


// Contact form helper (generates a mailto with subject/body)
(() => {
  const form = $("[data-contact-form]");
  if (!form) return;
  const status = $("#formStatus");
  const email = form.getAttribute("data-to") || "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#name")?.value?.trim() || "";
    const from = $("#email")?.value?.trim() || "";
    const msg = $("#message")?.value?.trim() || "";

    if (!msg) {
      if (status) status.textContent = "Please write a message.";
      return;
    }

    const subject = encodeURIComponent(`Portfolio enquiry — ${name || ""}`.trim());
    const body = encodeURIComponent(
      `Hi Azka,\n\n${msg}\n\n— ${name}${from ? `\n${from}` : ""}`
    );

    if (email) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      if (status) status.textContent = "Opening your email app…";
    } else {
      if (status) status.textContent = "Email address missing.";
    }
  });
})();
