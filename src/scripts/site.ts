const root = document.documentElement;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = theme;
  try { localStorage.setItem('starlight-theme', theme); localStorage.setItem('caelis_theme', theme); } catch {}
  window.dispatchEvent(new Event('caelis:themechange'));
}));

document.querySelectorAll<HTMLDetailsElement>('.mobile-menu').forEach(menu => {
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); } });
  document.addEventListener('click', event => { if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false; });
});

document.querySelectorAll<HTMLElement>('[data-install]').forEach(install => {
  const tabs = [...install.querySelectorAll<HTMLButtonElement>('[data-tab]')];
  const select = (tab: HTMLButtonElement) => {
    tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
    install.querySelectorAll<HTMLElement>('[data-panel]').forEach(panel => panel.classList.toggle('is-active', panel.dataset.panel === tab.dataset.tab));
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next !== null) { event.preventDefault(); select(tabs[next]); tabs[next].focus(); }
    });
  });
  if (/Windows/i.test(navigator.userAgent) && tabs[1]) select(tabs[1]);
});

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const status = button.closest('[data-install]')?.querySelector('[role="status"]');
  try {
    await navigator.clipboard.writeText(button.dataset.copy || '');
    button.dataset.copied = 'true';
    if (status) status.textContent = button.dataset.success || 'Copied';
    setTimeout(() => { delete button.dataset.copied; if (status) status.textContent = ''; }, 2000);
  } catch {
    if (status) status.textContent = button.dataset.failure || 'Please select and copy the command.';
  }
}));

if ('IntersectionObserver' in window && !motion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll<HTMLElement>('.reveal').forEach(element => {
    if (element.getBoundingClientRect().top > innerHeight) element.classList.add('pending');
    observer.observe(element);
  });
}

document.querySelectorAll<HTMLVideoElement>('[data-demo]').forEach(video => {
  const toggle = video.parentElement?.querySelector<HTMLButtonElement>('[data-video-toggle]');
  let visible = false;
  let userPaused = false;
  let userStarted = false;
  const load = () => {
    const source = video.querySelector('source');
    if (source?.dataset.src) { source.src = source.dataset.src; delete source.dataset.src; video.load(); }
  };
  const updateButton = () => {
    if (!toggle) return;
    const playing = !video.paused;
    toggle.setAttribute('aria-label', (playing ? toggle.dataset.pause : toggle.dataset.play) || 'Play demo');
    const label = toggle.querySelector('[data-video-label]');
    const glyph = toggle.querySelector('.play-glyph');
    if (label) label.textContent = (playing ? toggle.dataset.pause : toggle.dataset.play) || '';
    if (glyph) glyph.textContent = playing ? 'Ⅱ' : '▶';
  };
  const sync = () => {
    if (!visible || document.hidden || userPaused || (motion.matches && !userStarted)) video.pause();
    else { load(); video.play().catch(() => updateButton()); }
  };
  toggle?.addEventListener('click', () => {
    if (!video.paused) { userPaused = true; video.pause(); }
    else { userPaused = false; userStarted = true; load(); video.play().catch(() => updateButton()); }
  });
  video.addEventListener('play', updateButton); video.addEventListener('pause', updateButton);
  new IntersectionObserver(entries => { visible = entries[0].intersectionRatio >= .25; sync(); }, { threshold: [0, .25] }).observe(video);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', () => { userStarted = false; sync(); });
});
