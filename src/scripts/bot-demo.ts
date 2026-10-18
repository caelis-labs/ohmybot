document.querySelectorAll<HTMLElement>('[data-bot-demo]').forEach(player => {
  const video = player.querySelector('video');
  if (!video) return;
  const button = player.querySelector<HTMLButtonElement>('[data-playback]');
  if (!button) return;
  const captions = player.querySelector<HTMLButtonElement>('[data-captions]');
  const fullscreen = player.querySelector<HTMLButtonElement>('[data-fullscreen]');
  const track = video.textTracks[0];
  // The film already has embedded captions. Load the selectable VTT without
  // displaying a second set until the viewer requests it (also useful fullscreen).
  if (track && captions) {
    track.mode = 'hidden';
    captions.hidden = false;
    const updateCaptions = () => {
      const showing = track.mode === 'showing';
      captions.setAttribute('aria-pressed', String(showing));
      captions.setAttribute('aria-label', (showing ? captions.dataset.hideLabel : captions.dataset.showLabel)!);
    };
    captions.addEventListener('click', () => {
      track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
      updateCaptions();
    });
    video.textTracks.addEventListener('change', updateCaptions);
  }
  const safariVideo = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
  if (fullscreen && (document.fullscreenEnabled || safariVideo.webkitEnterFullscreen)) {
    fullscreen.hidden = false;
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === player) await document.exitFullscreen();
        else if (document.fullscreenEnabled) await player.requestFullscreen();
        else safariVideo.webkitEnterFullscreen?.();
      } catch {
        // Fall back to the native player's controls if fullscreen is denied.
        video.controls = true;
      }
    });
    document.addEventListener('fullscreenchange', () => {
      fullscreen.setAttribute('aria-label', (document.fullscreenElement === player ? fullscreen.dataset.exitLabel : fullscreen.dataset.enterLabel)!);
    });
  }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  let automaticPause = false;
  let explicitPlay = false;

  // Muted inline playback is permitted by mobile/Safari autoplay policies.
  video.muted = true;
  video.loop = true;
  video.autoplay = !motion.matches;
  const updateButton = () => {
    button.dataset.state = video.paused ? 'paused' : 'playing';
    button.setAttribute('aria-label', (video.paused ? button.dataset.playLabel : button.dataset.pauseLabel) ?? 'Play / pause');
  };
  const play = () => { void video.play().catch(updateButton); };
  const sync = () => {
    if (document.hidden || (motion.matches && !explicitPlay)) {
      if (!video.paused) { automaticPause = true; video.pause(); }
    } else if (!userPaused) play();
  };
  video.addEventListener('pause', () => {
    if (automaticPause) automaticPause = false;
    else if (!document.hidden && !video.ended) userPaused = true;
    updateButton();
  });
  video.addEventListener('play', () => { userPaused = false; updateButton(); });

  button.addEventListener('click', () => {
    if (video.paused) {
      explicitPlay = true;
      userPaused = false;
      play();
    } else {
      userPaused = true;
      video.pause();
    }
  });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => {
    if (!video.paused) { automaticPause = true; video.pause(); }
  });
  window.addEventListener('pageshow', sync);
  motion.addEventListener('change', sync);
  button.hidden = false;
  updateButton();
  sync();
});
