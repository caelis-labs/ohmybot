document.querySelectorAll<HTMLElement>('[data-bot-demo]').forEach(player => {
  const video = player.querySelector('video');
  if (!video) return;
  const button = player.querySelector<HTMLButtonElement>('[data-playback]');
  if (!button) return;
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
