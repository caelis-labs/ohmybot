import { detectDownloadPlatform } from "./download-platform.mjs";

type TrackProps = Record<string, string | number | boolean | undefined>;

const track = (name: string, props: TrackProps = {}) => {
  document.dispatchEvent(
    new CustomEvent("caelis:track", { detail: { name, ...props } }),
  );
  const w = window as unknown as {
    plausible?: (event: string, options?: { props?: TrackProps }) => void;
    umami?: { track: (event: string, data?: TrackProps) => void };
  };
  try {
    w.plausible?.(name, { props });
    w.umami?.track(name, props);
  } catch {
    // Analytics is optional; never block the page.
  }
};

const platform = detectDownloadPlatform(navigator);
document.documentElement.dataset.platform = platform;

const downloadCtas = document.querySelectorAll<HTMLAnchorElement>(
  "[data-download-cta]",
);
for (const cta of downloadCtas) {
  const key =
    platform === "mac"
      ? "Mac"
      : platform === "windows"
        ? "Windows"
        : platform === "linux"
          ? "Linux"
          : "Other";
  cta.href = cta.dataset[`href${key}`] || cta.href;
  const label = cta.querySelector<HTMLElement>("[data-download-label]");
  if (label)
    label.textContent = cta.dataset[`label${key}`] || label.textContent;
  cta.dataset.platform = platform;
  cta.addEventListener("click", () => track("download_cta", { platform }));
}
const summary = document.querySelector<HTMLElement>("[data-platform-summary]");
if (summary && summary.dataset[platform])
  summary.textContent = summary.dataset[platform] || "";
document
  .querySelectorAll<HTMLElement>("[data-platform-card]")
  .forEach((card) => {
    card.classList.toggle(
      "is-detected",
      card.dataset.platformCard === platform,
    );
  });

document
  .querySelectorAll<HTMLAnchorElement>("[data-download-click]")
  .forEach((link) => {
    link.addEventListener("click", () =>
      track("download_click", {
        platform: link.dataset.downloadClick || "unknown",
      }),
    );
  });

const navToggle =
  document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
const navPanel = document.querySelector<HTMLElement>("[data-nav-panel]");
const setNav = (open: boolean) => {
  if (!navToggle || !navPanel) return;
  navPanel.hidden = !open;
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute(
    "aria-label",
    open
      ? navToggle.dataset.labelClose || "Close menu"
      : navToggle.dataset.labelMenu || "Menu",
  );
};
navToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  setNav(Boolean(navPanel?.hidden ?? true));
});
navPanel
  ?.querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => setNav(false)));
document.addEventListener("click", (event) => {
  if (!navPanel || navPanel.hidden) return;
  const target = event.target as Node;
  if (!navPanel.contains(target) && !navToggle?.contains(target)) setNav(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !navPanel || navPanel.hidden) return;
  setNav(false);
  navToggle?.focus();
});
window.matchMedia("(min-width: 981px)").addEventListener("change", (event) => {
  if (event.matches) setNav(false);
});

document
  .querySelector<HTMLButtonElement>("[data-theme-toggle]")
  ?.addEventListener("click", () => {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("starlight-theme", theme);
      localStorage.setItem("caelis_theme", theme);
    } catch {
      // Optional persistence.
    }
    track("theme_toggle", { theme });
  });

document
  .querySelectorAll<HTMLButtonElement>("[data-copy-install]")
  .forEach((button) => {
    button.addEventListener("click", async () => {
      const command = button.dataset.command || "";
      const status = document.querySelector<HTMLElement>("[data-copy-status]");
      try {
        await navigator.clipboard.writeText(command);
        if (status) status.textContent = button.dataset.copied || "";
        track("linux_copy", { command: "install.sh" });
        window.setTimeout(() => {
          if (status) status.textContent = "";
        }, 2200);
      } catch {
        // The command remains selectable if clipboard access is unavailable.
      }
    });
  });

const dialog = document.querySelector<HTMLDialogElement>("[data-film-dialog]");
const film = dialog?.querySelector("video");
const filmStage = dialog?.querySelector<HTMLElement>("[data-film-stage]");
const filmOpeners = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-open-film]"),
];
const captionToggle = dialog?.querySelector<HTMLButtonElement>(
  "[data-film-captions]",
);
const fullscreenToggle = dialog?.querySelector<HTMLButtonElement>(
  "[data-film-fullscreen]",
);
const fullscreenLabel = fullscreenToggle?.innerHTML || "";
let lastOpener: HTMLButtonElement | null = null;

film?.textTracks.addEventListener("change", () => {
  captionToggle?.setAttribute(
    "aria-pressed",
    String(film.textTracks[0]?.mode === "showing"),
  );
});
captionToggle?.addEventListener("click", () => {
  const enabled = captionToggle.getAttribute("aria-pressed") !== "true";
  captionToggle.setAttribute("aria-pressed", String(enabled));
  if (film?.textTracks[0])
    film.textTracks[0].mode = enabled ? "showing" : "disabled";
});

const restoreExpandedView = () => {
  dialog?.classList.remove("is-expanded");
  if (fullscreenToggle) {
    fullscreenToggle.innerHTML = fullscreenLabel;
    fullscreenToggle.setAttribute("aria-pressed", "false");
  }
};

fullscreenToggle?.addEventListener("click", async () => {
  if (!film) return;
  if (dialog?.classList.contains("is-expanded")) {
    restoreExpandedView();
    return;
  }
  const nativeFilm = film as HTMLVideoElement & {
    webkitEnterFullscreen?: () => void;
  };
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  try {
    if (document.fullscreenEnabled && filmStage?.requestFullscreen)
      await filmStage.requestFullscreen();
    else if (nativeFilm.webkitEnterFullscreen)
      nativeFilm.webkitEnterFullscreen();
    else throw new Error("Native fullscreen unavailable");
    fullscreenToggle.dataset.state = "entered";
  } catch (error) {
    film.controls = true;
    dialog?.classList.add("is-expanded");
    fullscreenToggle.dataset.state = "expanded-viewport";
    fullscreenToggle.dataset.reason =
      error instanceof Error ? error.message : String(error);
    fullscreenToggle.setAttribute("aria-pressed", "true");
    fullscreenToggle.textContent =
      document.documentElement.lang === "zh-CN" ? "收起画面" : "Restore view";
  }
});
document.addEventListener("fullscreenchange", () =>
  fullscreenToggle?.setAttribute(
    "aria-pressed",
    String(Boolean(document.fullscreenElement)),
  ),
);

const selectFilmSource = () => {
  if (!film) return;
  const mobile =
    window.matchMedia("(max-width: 700px)").matches &&
    Boolean(film.dataset.mobileBase);
  const base = mobile ? film.dataset.mobileBase : film.dataset.desktopBase;
  if (dialog) dialog.dataset.layout = mobile ? "mobile" : "desktop";
  if (!base) return;
  film.poster = `${base}.webp`;
  if (film.querySelector("source")?.getAttribute("src") !== `${base}.mp4`) {
    film.querySelector("source")?.setAttribute("src", `${base}.mp4`);
    film.querySelector("track")?.setAttribute("src", `${base}.vtt`);
    film.poster = `${base}.webp`;
    film.width = mobile ? Number(film.dataset.mobileWidth) : 1920;
    film.height = mobile ? Number(film.dataset.mobileHeight) : 1080;
    captionToggle?.setAttribute("aria-pressed", "false");
    for (const textTrack of film.textTracks) textTrack.mode = "disabled";
    film.load();
  }
};

filmOpeners.forEach((button) => {
  button.addEventListener("click", () => {
    if (!film || !dialog) return;
    lastOpener = button;
    selectFilmSource();
    dialog.showModal();
    film.play().catch(() => {});
    track("film_open", {
      trigger: button.classList.contains("demo-stage") ? "poster" : "button",
    });
  });
});
dialog
  ?.querySelector("[data-close-film]")
  ?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("close", () => {
  film?.pause();
  if (document.fullscreenElement === filmStage)
    document.exitFullscreen().catch(() => {});
  restoreExpandedView();
  lastOpener?.focus();
});
dialog?.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    dialog.close();
});

document
  .querySelectorAll<HTMLDetailsElement>(".faq-list details")
  .forEach((details) => {
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      const question =
        details.querySelector("summary")?.textContent?.trim() || "unknown";
      track("faq_open", { question });
    });
  });

const thresholds = [25, 50, 75, 100];
const reached = new Set<number>();
const onScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return;
  const depth = Math.min(
    100,
    Math.round(
      ((window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight) *
        100,
    ),
  );
  for (const threshold of thresholds) {
    if (depth >= threshold && !reached.has(threshold)) {
      reached.add(threshold);
      track("scroll_depth", { percent: threshold });
    }
  }
  if (reached.size === thresholds.length)
    window.removeEventListener("scroll", onScroll);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Native, passive motion: no animation dependency, no scroll capture.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const reveals = document.querySelectorAll<HTMLElement>(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );
  reveals.forEach((element) => revealObserver.observe(element));
  document.documentElement.classList.add("motion-ready");
}
// Each demo owns its timeline. Start only with the whole frame below the header.
const demos = [...document.querySelectorAll<HTMLElement>('[data-product-demo]')];
const demoSync: Array<() => void> = [];
for (const demo of demos) {
 const kind = demo.dataset.productDemo;
 const delays = kind === 'events' ? [1800, 2300, 2200, 1700, 2200] : kind === 'handoff' ? [1600, 2600, 1800, 2200] : [1800, 2500, 2200];
 let stage = 0, timer = 0, startedAt = 0, remaining = delays[0], began = false;
 const render = () => {
  demo.dataset.stage = String(stage);
  demo.dataset.done = String(stage === delays.length);
 };
 const sync = () => {
  if (timer) { clearTimeout(timer); timer = 0; remaining = Math.max(0, remaining - (performance.now() - startedAt)); }
  if (reducedMotion.matches) { stage = delays.length; render(); demo.dataset.playing='false'; return; }
  const box = demo.getBoundingClientRect();
  const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
  const fullyVisible = box.top >= headerBottom + 8 && box.bottom <= innerHeight - 8;
  const visibleHeight = Math.max(0, Math.min(box.bottom, innerHeight) - Math.max(box.top, headerBottom));
  const visible = !document.hidden && (began ? visibleHeight >= box.height * .7 : fullyVisible);
  demo.dataset.playing = String(visible);
  if (!visible) return;
  began = true;startedAt = performance.now();
  timer = window.setTimeout(() => { timer=0;stage = stage === delays.length ? 0 : stage + 1;remaining=delays[stage]??3200;render();sync(); }, remaining);
 };
 demoSync.push(sync);render();sync();
}
let demoFrame=0;
const scheduleDemos = () => {if (!demoFrame) demoFrame=requestAnimationFrame(()=>{demoFrame=0;demoSync.forEach(sync=>sync());});};
window.addEventListener('scroll',scheduleDemos,{passive:true});
window.addEventListener('resize',scheduleDemos,{passive:true});
document.addEventListener('visibilitychange',scheduleDemos);
reducedMotion.addEventListener('change',scheduleDemos);
