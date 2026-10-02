(() => {
  document.documentElement.classList.add('js');
  let theme;
  try { theme = localStorage.getItem('starlight-theme') || localStorage.getItem('caelis_theme'); } catch {}
  const dark = theme === 'dark' || (theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
