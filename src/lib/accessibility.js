export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

export function getContrastRatio(color1, color2) {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g).map(Number);
    const [r, g, b] = rgb.map((val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function meetsWCAGStandard(contrastRatio, level = 'AA', size = 'normal') {
  const standards = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 },
  };

  return contrastRatio >= standards[level][size];
}

export function addSkipLink(targetId, text = 'Skip to main content') {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'skip-link';
  skipLink.textContent = text;
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 10000;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);
}

export function addLandmarks() {
  const main = document.querySelector('main');
  if (main && !main.getAttribute('role')) {
    main.setAttribute('role', 'main');
  }

  const nav = document.querySelector('nav');
  if (nav && !nav.getAttribute('role')) {
    nav.setAttribute('role', 'navigation');
  }

  const footer = document.querySelector('footer');
  if (footer && !footer.getAttribute('role')) {
    footer.setAttribute('role', 'contentinfo');
  }
}

export function enhanceFormAccessibility(form) {
  const inputs = form.querySelectorAll('input, textarea, select');
  
  inputs.forEach((input) => {
    if (!input.id) {
      input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
    }

    const label = form.querySelector(`label[for="${input.id}"]`);
    if (!label && !input.getAttribute('aria-label')) {
      const placeholder = input.getAttribute('placeholder');
      if (placeholder) {
        input.setAttribute('aria-label', placeholder);
      }
    }

    if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
      input.setAttribute('aria-required', 'true');
    }

    const errorElement = form.querySelector(`[data-error-for="${input.id}"]`);
    if (errorElement) {
      input.setAttribute('aria-describedby', errorElement.id || `error-${input.id}`);
      if (!errorElement.id) {
        errorElement.id = `error-${input.id}`;
      }
    }
  });
}

export function addKeyboardNavigation(element, onSelect) {
  const items = element.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"]');
  let currentIndex = 0;

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        currentIndex = (currentIndex + 1) % items.length;
        items[currentIndex].focus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        items[currentIndex].focus();
        break;
      case 'Home':
        e.preventDefault();
        currentIndex = 0;
        items[0].focus();
        break;
      case 'End':
        e.preventDefault();
        currentIndex = items.length - 1;
        items[items.length - 1].focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect?.(items[currentIndex]);
        break;
      default:
        break;
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

export function setPageTitle(title) {
  document.title = title;
  announceToScreenReader(`Page changed to ${title}`);
}

export function addAriaLabels(element) {
  const buttons = element.querySelectorAll('button:not([aria-label])');
  buttons.forEach((button) => {
    if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
      const icon = button.querySelector('svg, img');
      if (icon) {
        const alt = icon.getAttribute('alt') || icon.getAttribute('title');
        if (alt) {
          button.setAttribute('aria-label', alt);
        }
      }
    }
  });

  const links = element.querySelectorAll('a:not([aria-label])');
  links.forEach((link) => {
    if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
      const img = link.querySelector('img');
      if (img && img.alt) {
        link.setAttribute('aria-label', img.alt);
      }
    }
  });
}

export const accessibilityUtils = {
  announceToScreenReader,
  trapFocus,
  getContrastRatio,
  meetsWCAGStandard,
  addSkipLink,
  addLandmarks,
  enhanceFormAccessibility,
  addKeyboardNavigation,
  setPageTitle,
  addAriaLabels,
};
