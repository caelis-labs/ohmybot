// iPad desktop mode reports MacIntel; touch support distinguishes it from macOS.
export function detectDownloadPlatform({userAgent = '', platform = '', maxTouchPoints = 0}) {
  if (/Android|iPhone|iPad|iPod/i.test(userAgent) || (/Mac/i.test(platform) && maxTouchPoints > 1)) return 'mobile';
  if (/Windows/i.test(userAgent) || /^Win/i.test(platform)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(userAgent) || /^Mac/i.test(platform)) return 'mac';
  return 'other';
}
