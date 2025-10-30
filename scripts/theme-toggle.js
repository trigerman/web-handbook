
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

  function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch (err) {
      succeeded = false;
    }
    document.body.removeChild(textarea);
    return succeeded;
  }

  function handleCopyButtons() {
    const buttons = document.querySelectorAll('.copy-button');
    buttons.forEach((button) => {
      if (button.dataset.copyBound === 'true') {
        return;
      }
      button.dataset.copyBound = 'true';
      button.dataset.copyLabel = button.textContent.trim() || 'Copy';
      button.setAttribute('aria-live', 'polite');
      button.addEventListener('click', async () => {
        if (button._copyTimeout) {
          clearTimeout(button._copyTimeout);
          button._copyTimeout = null;
        }

        const container = button.parentElement;
        if (!container) {
          return;
        }
        const pre = container.querySelector('pre');
        if (!pre) {
          return;
        }
        const text = pre.innerText.replace(/\u00A0/g, ' ').replace(/\s+$/, '');
        let success = false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            success = true;
          } else {
            success = fallbackCopyText(text);
          }
        } catch (err) {
          success = false;
        }

        button.textContent = success ? 'Copied!' : 'Copy failed';
        button.disabled = true;
        button._copyTimeout = setTimeout(() => {
          button.textContent = button.dataset.copyLabel;
          button.disabled = false;
          button._copyTimeout = null;
        }, success ? 1800 : 2200);
      });
    });
  }

  function linkifyPlainUrls() {
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentElement) {
          return NodeFilter.FILTER_REJECT;
        }
        if (node.parentElement.closest('a, code, pre, script, style, textarea')) {
          return NodeFilter.FILTER_REJECT;
        }
        return urlRegex.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    let current;
    while ((current = walker.nextNode())) {
      nodes.push(current);
    }

    nodes.forEach((node) => {
      const text = node.textContent;
      urlRegex.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;
      while ((match = urlRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        const anchor = document.createElement('a');
        anchor.href = match[0];
        anchor.textContent = match[0];
        anchor.className = 'text-indigo-600 dark:text-indigo-400 hover:underline font-medium';
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        fragment.appendChild(anchor);
        lastIndex = urlRegex.lastIndex;
      }
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
      node.parentNode.replaceChild(fragment, node);
    });
  }

  function initEnhancements() {
    handleCopyButtons();
    linkifyPlainUrls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancements, { once: true });
  } else {
    initEnhancements();
  }
})();
