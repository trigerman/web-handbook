
(function() {
  const storageKey = 'gitworkshop-theme';
  const root = document.documentElement;

  function applyTheme(t) {
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  let saved = localStorage.getItem(storageKey);
  if (!saved) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    saved = prefersDark ? 'dark' : 'light';
  }
  applyTheme(saved);

  window.toggleTheme = function() {
    let current = root.classList.contains('dark') ? 'dark' : 'light';
    let next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(storageKey, next);
  }
})();
