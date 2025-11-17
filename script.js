// script.js - improved interactions: hearts on click, autoplay fallback, navigation to book
document.addEventListener('DOMContentLoaded', () => {
  const music = document.getElementById('bgmusic');
  const playBtn = document.getElementById('playBtn');
  const openBookBtn = document.getElementById('openBookBtn');
  const particlesRoot = document.getElementById('particles-root');
  const cakeArea = document.getElementById('cakeArea');

  // Try autoplay; show play button if blocked
  async function tryPlay() {
    try {
      await music.play();
      if (playBtn) playBtn.style.display = 'none';
    } catch (e) {
      if (playBtn) playBtn.style.display = 'inline-block';
    }
  }
  tryPlay();

  if (playBtn) {
    playBtn.addEventListener('click', async () => {
      try { await music.play(); playBtn.style.display = 'none'; }
      catch (e) { console.warn('play blocked', e); }
    });
  }

  // Spawn many hearts at (x,y) - used for clicks
  function spawnHearts(x, y, count = 14) {
    const colors = ['#ff99cc','#ff66b3','#ffd6ea','#ffb3d6','#ff8ac1'];
    for (let i = 0; i < count; i++) {
      const h = document.createElement('div');
      h.className = 'gen-heart';
      const size = 10 + Math.random() * 18;
      h.style.width = `${size}px`;
      h.style.height = `${size}px`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      h.style.background = `linear-gradient(180deg, ${color}, ${shade(color, -8)})`;
      h.style.left = `${x - size/2}px`;
      h.style.top = `${y - size/2}px`;
      // hearts shape: use pseudo-structure via before/after by innerHTML
      h.innerHTML = `<div style="position:absolute;inset:0;transform:rotate(45deg);"></div>`;
      particlesRoot.appendChild(h);
      // random velocity
      const dx = (Math.random() - 0.5) * 160;
      const dy = -80 - Math.random() * 220;
      const rot = (Math.random() * 360) * (Math.random() > 0.5 ? 1 : -1);
      const dur = 800 + Math.random() * 1000;
      // animate via Web Animations API
      h.animate([
        { transform: `translate(0px,0px) rotate(${rot}deg) scale(0.8)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot + 120}deg) scale(1.2)`, opacity: 0.02 }
      ], {
        duration: dur,
        easing: 'cubic-bezier(.2,.8,.2,1)',
        fill: 'forwards',
        delay: Math.random() * 120
      });
      setTimeout(()=> h.remove(), dur + 200);
    }
  }

  // small color shade helper
  function shade(hex, percent) {
    // hex like #ff99cc or #fff
    let c = hex.replace('#','');
    if (c.length === 3) c = c.split('').map(s=>s+s).join('');
    const num = parseInt(c,16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    r = Math.max(Math.min(255,r),0);
    g = Math.max(Math.min(255,g),0);
    b = Math.max(Math.min(255,b),0);
    return `rgb(${r},${g},${b})`;
  }

  // When user clicks elements marked data-heartable or cake area, spawn many hearts
  document.addEventListener('click', (e) => {
    const target = e.target;
    // find mouse position
    const x = e.clientX;
    const y = e.clientY;
    // Always spawn a small burst so it's fun (but limit if clicking many times quickly)
    const el = target.closest('[data-heartable]');
    if (el || target.classList.contains('cake-tier') || target.closest('.cake-area')) {
      spawnHearts(x, y, 20);
      // small sparkle on cake
      if (target.closest('.cake-area')) cakeSparkle(x, y);
    } else {
      // light hearts for general clicks
      spawnHearts(x, y, 6);
    }
  });

  // cake sparkle mini effect
  function cakeSparkle(x, y) {
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('div');
      s.style.position = 'fixed';
      s.style.left = `${x + (Math.random()-0.5)*40}px`;
      s.style.top = `${y + (Math.random()-0.5)*40}px`;
      s.style.width = s.style.height = `${3 + Math.random()*6}px`;
      s.style.background = 'rgba(255,255,255,0.9)';
      s.style.borderRadius = '50%';
      s.style.zIndex = 1100;
      particlesRoot.appendChild(s);
      const dur = 500 + Math.random()*500;
      s.animate([
        { transform: 'translateY(0) scale(0.6)', opacity: 1 },
        { transform: `translateY(${-30 - Math.random()*40}px) scale(1.4)`, opacity: 0 }
      ], {duration: dur, easing:'ease-out', fill:'forwards'});
      setTimeout(()=> s.remove(), dur + 50);
    }
  }

  // openBookBtn navigates to book.html with fade
  if (openBookBtn) {
    openBookBtn.addEventListener('click', () => {
      document.querySelector('.page-root').style.transition = 'opacity .45s ease';
      document.querySelector('.page-root').style.opacity = 0;
      setTimeout(() => { window.location.href = 'book.html'; }, 460);
    });
  }

  // Extra: click on cake area also pulses the cake
  if (cakeArea) {
    cakeArea.addEventListener('click', (e) => {
      const cake = document.getElementById('mainCake');
      if (!cake) return;
      cake.animate([
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-6px) scale(1.03)' },
        { transform: 'translateY(0) scale(1)' }
      ], { duration: 420, easing:'ease-out' });
    });
  }

  // create soft falling petals/confetti every few seconds (low frequency)
  function softFall() {
    const palette = ['#ffd6ea','#ffb3d6','#ffdce8','#ffe0f2'];
    const el = document.createElement('div');
    el.style.position = 'fixed';
    const size = 8 + Math.random()*16;
    el.style.width = `${size}px`;
    el.style.height = `${size * 0.6}px`;
    el.style.left = `${Math.random()*100}%`;
    el.style.top = `-10vh`;
    el.style.background = palette[Math.floor(Math.random()*palette.length)];
    el.style.borderRadius = '4px';
    el.style.opacity = 0.95;
    el.style.zIndex = 900;
    particlesRoot.appendChild(el);
    const dur = 7000 + Math.random()*5000;
    el.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${120 + Math.random()*40}vh) rotate(${360 + Math.random()*360}deg)`, opacity: 0.95 }
    ], { duration: dur, easing: 'linear', fill: 'forwards' });
    setTimeout(()=> el.remove(), dur + 200);
  }
  setInterval(softFall, 1800);
  // initial soft burst
  for (let i=0;i<6;i++) setTimeout(softFall, i*220);

});