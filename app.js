const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

// Year
const year = $('#year');
if (year) year.textContent = new Date().getFullYear();

// Scroll progress
const bar = $('#scrollbar');
const setProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? (scrollY / max) * 100 : 0;
  if (bar) bar.style.width = `${pct}%`;
};
addEventListener('scroll', setProgress, {passive:true});
setProgress();

// Mobile nav
const toggle = $('.nav__toggle');
const menu = $('.nav__menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => menu.classList.remove('is-open')));
}

// Header elevation
const topbar = $('[data-elevate]');
const elevate = () => topbar && topbar.classList.toggle('is-elevated', scrollY > 8);
addEventListener('scroll', elevate, {passive:true}); elevate();

// Reveal animations
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
}, {threshold:.12});
$$('.reveal').forEach(el => io.observe(el));

// Cursor glow
const glow = $('#glow');
addEventListener('mousemove', e => {
  if (!glow) return;
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
}, {passive:true});

// Tiny tilt on project cards
$$('.project-card, .stat').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `translateY(-8px) rotateX(${-y*4}deg) rotateY(${x*4}deg)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

// Lightweight animated particles / constellation
const canvas = $('#fx');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let points = [];
  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    points = Array.from({length: Math.min(55, Math.floor(innerWidth/24))}, () => ({
      x: Math.random()*innerWidth,
      y: Math.random()*innerHeight,
      vx: (Math.random()-.5)*.25,
      vy: (Math.random()-.5)*.25
    }));
  };
  resize(); addEventListener('resize', resize);
  const draw = () => {
    ctx.clearRect(0,0,innerWidth,innerHeight);
    ctx.fillStyle = 'rgba(124,58,237,.18)';
    ctx.strokeStyle = 'rgba(124,58,237,.10)';
    points.forEach((p,i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x<0 || p.x>innerWidth) p.vx *= -1;
      if (p.y<0 || p.y>innerHeight) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2); ctx.fill();
      for (let j=i+1;j<points.length;j++) {
        const q=points[j], d=Math.hypot(p.x-q.x,p.y-q.y);
        if (d<120){ctx.globalAlpha=1-d/120;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.globalAlpha=1;}
      }
    });
    requestAnimationFrame(draw);
  };
  draw();
}
