import { detectDownloadPlatform } from './download-platform.mjs';

const downloadPlatform = detectDownloadPlatform(navigator);
const downloadTabs = document.querySelector<HTMLElement>('[data-download-tabs]');
const platformTabs = [...document.querySelectorAll<HTMLButtonElement>('[data-download-tab]')];
const platformPanels = [...document.querySelectorAll<HTMLElement>('[data-download-panel]')];
const chooseHint = document.querySelector<HTMLElement>('[data-download-choose]');
const selectDownload = (platform: string, focus = false) => {
  platformTabs.forEach((tab, index) => {
    const active = tab.dataset.downloadTab === platform;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active || (platform === '' && index === 0) ? 0 : -1;
    if (active && focus) tab.focus();
  });
  platformPanels.forEach(panel => { panel.hidden = panel.dataset.downloadPanel !== platform; });
  if (chooseHint) chooseHint.hidden = platform !== '';
};
if (downloadTabs) {
  downloadTabs.hidden = false;
  selectDownload(['mac', 'windows', 'linux'].includes(downloadPlatform) ? downloadPlatform : '');
  platformTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectDownload(tab.dataset.downloadTab || ''));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % platformTabs.length
        : event.key === 'ArrowLeft' ? (index + platformTabs.length - 1) % platformTabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? platformTabs.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault(); selectDownload(platformTabs[next].dataset.downloadTab || '', true);
    });
  });
}

document.querySelector<HTMLButtonElement>('[data-copy-install]')?.addEventListener('click', async event => {
  const button = event.currentTarget as HTMLButtonElement;
  try {
    await navigator.clipboard.writeText(button.dataset.command || '');
    const status = document.querySelector<HTMLElement>('[data-copy-status]');
    if (status) status.textContent = button.dataset.copied || '';
  } catch { /* The full command remains selectable if clipboard access is unavailable. */ }
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

document.querySelector<HTMLButtonElement>('[data-theme-toggle]')?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('starlight-theme', theme); localStorage.setItem('caelis_theme', theme); } catch { /* Optional persistence. */ }
});

document.querySelectorAll<HTMLElement>('[data-workflow]').forEach(workflow => {
  const tabs = [...workflow.querySelectorAll<HTMLButtonElement>('[data-workflow-tab]')];
  const select = (selected: HTMLButtonElement, focus = false) => {
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls') || '');
      if (panel) {
        panel.hidden = !active;
        panel.classList.remove('panel-enter');
        if (active && !reducedMotion.matches) panel.classList.add('panel-enter');
      }
    });
    if (focus) selected.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault(); select(tabs[next], true);
    });
  });
});

// Only below-fold sections animate. The page remains visible if scripts fail.
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.remove('is-pending'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll<HTMLElement>('.reveal').forEach(element => {
    if (element.getBoundingClientRect().top > innerHeight) {
      element.classList.add('is-pending'); observer.observe(element);
    }
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { document.querySelectorAll('.is-pending').forEach(element => element.classList.remove('is-pending')); observer.disconnect(); }
  }, { once: true });
}

const dialog = document.querySelector<HTMLDialogElement>('[data-film-dialog]');
const openFilm = document.querySelector<HTMLButtonElement>('[data-open-film]');
const film = dialog?.querySelector('video');
const filmStage = dialog?.querySelector<HTMLElement>('[data-film-stage]');
const captionToggle = dialog?.querySelector<HTMLButtonElement>('[data-film-captions]');
film?.textTracks.addEventListener('change', () => {
  captionToggle?.setAttribute('aria-pressed', String(film.textTracks[0]?.mode === 'showing'));
});
captionToggle?.addEventListener('click', () => {
  const enabled = captionToggle.getAttribute('aria-pressed') !== 'true';
  captionToggle.setAttribute('aria-pressed', String(enabled));
  if (film?.textTracks[0]) film.textTracks[0].mode = enabled ? 'showing' : 'disabled';
});
const fullscreenToggle = dialog?.querySelector<HTMLButtonElement>('[data-film-fullscreen]');
const fullscreenLabel = fullscreenToggle?.innerHTML || '';
const restoreExpandedView = () => {
  dialog?.classList.remove('is-expanded');
  if (fullscreenToggle) { fullscreenToggle.innerHTML = fullscreenLabel; fullscreenToggle.setAttribute('aria-pressed', 'false'); }
};
fullscreenToggle?.addEventListener('click', async () => {
  if (!film) return;
  if (dialog?.classList.contains('is-expanded')) { restoreExpandedView(); return; }
  const nativeFilm = film as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
  if (document.fullscreenElement) { await document.exitFullscreen(); return; }
  try {
    if (document.fullscreenEnabled && filmStage?.requestFullscreen) await filmStage.requestFullscreen();
    else if (nativeFilm.webkitEnterFullscreen) nativeFilm.webkitEnterFullscreen();
    else throw new Error('Native fullscreen unavailable');
    fullscreenToggle.dataset.state = 'entered';
  } catch (error) {
    // Some browser contexts deny native fullscreen. Still offer a useful,
    // reversible viewport-sized player without claiming an OS fullscreen state.
    film.controls = true;
    dialog?.classList.add('is-expanded');
    fullscreenToggle.dataset.state = 'expanded-viewport';
    fullscreenToggle.dataset.reason = error instanceof Error ? error.message : String(error);
    fullscreenToggle.setAttribute('aria-pressed', 'true');
    fullscreenToggle.textContent = document.documentElement.lang === 'zh-CN' ? '收起画面' : 'Restore view';
  }
});
document.addEventListener('fullscreenchange', () => fullscreenToggle?.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement))));
const selectFilmSource = () => {
  if (!film) return;
  const mobile = matchMedia('(max-width: 640px)').matches && Boolean(film.dataset.mobileBase);
  const base = mobile ? film.dataset.mobileBase : film.dataset.desktopBase;
  if (dialog) dialog.dataset.layout = mobile ? 'mobile' : 'desktop';
  if (base && film.querySelector('source')?.getAttribute('src') !== `${base}.mp4`) {
    film.querySelector('source')?.setAttribute('src', `${base}.mp4`);
    film.querySelector('track')?.setAttribute('src', `${base}.vtt`);
    film.poster = `${base}.webp`;
    film.width = mobile ? Number(film.dataset.mobileWidth) : 1920;
    film.height = mobile ? Number(film.dataset.mobileHeight) : 1080;
    captionToggle?.setAttribute('aria-pressed', 'false');
    for (const track of film.textTracks) track.mode = 'disabled';
    film.load();
  }
};
// Initialize the matching poster/source with preload=none. A new
// opening may reselect; there is deliberately no resize/media-change listener.
selectFilmSource();
openFilm?.addEventListener('click', () => {
  if (!film) return;
  selectFilmSource();
  dialog?.showModal(); film.play().catch(() => {});
});
dialog?.querySelector('[data-close-film]')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('close', () => { film?.pause(); if (document.fullscreenElement === filmStage) document.exitFullscreen().catch(() => {}); restoreExpandedView(); openFilm?.focus(); });
dialog?.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
