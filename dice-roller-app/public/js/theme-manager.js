console.log('[THEME-MANAGER] Загружен');

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'default'; // default, mocha
    this.glassMode = localStorage.getItem('glass') === 'true';
    this.init();
  }

  init() {
    this.applyTheme();
    this.applyGlass();
    this.createSwitcher();
    console.log(`[THEME] Инициализирован: ${this.currentTheme}, glass: ${this.glassMode}`);
  }

  applyTheme() {
    const root = document.documentElement;
    
    if (this.currentTheme === 'mocha') {
      document.body.setAttribute('data-theme', 'mocha');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }

  applyGlass() {
    if (this.glassMode) {
      document.body.setAttribute('data-glass', 'true');
      console.log('[THEME] Glass ENABLED - добавлены CSS переменные');
    } else {
      document.body.removeAttribute('data-glass');
      console.log('[THEME] Glass DISABLED');
    }
  }

  createSwitcher() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const oldSwitcher = navbar.querySelector('.theme-switcher');
    if (oldSwitcher) oldSwitcher.remove();

    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';

    // Theme buttons
    const themes = [
      { id: 'default', emoji: '🟣', label: 'Фиолетовая' },
      { id: 'mocha', emoji: '🎨', label: 'Mocha' }
    ];

    themes.forEach(({ id, emoji, label }) => {
      const btn = document.createElement('button');
      btn.className = `theme-btn ${id === this.currentTheme ? 'active' : ''}`;
      btn.textContent = emoji;
      btn.title = label;
      btn.addEventListener('click', () => this.switchTheme(id));
      switcher.appendChild(btn);
    });

    // Glass button
    const glassBtn = document.createElement('button');
    glassBtn.className = `theme-btn ${this.glassMode ? 'active' : ''}`;
    glassBtn.textContent = this.glassMode ? '✨' : '🔷';
    glassBtn.title = this.glassMode ? 'Стекло ВКЛ' : 'Стекло ВЫКЛ';
    glassBtn.addEventListener('click', () => this.toggleGlass());
    switcher.appendChild(glassBtn);

    const exitLink = navbar.querySelector('.nav-link:last-child');
    if (exitLink) {
      navbar.insertBefore(switcher, exitLink);
    } else {
      navbar.appendChild(switcher);
    }
  }

  switchTheme(themeName) {
    this.currentTheme = themeName;
    localStorage.setItem('theme', themeName);
    this.applyTheme();
    this.createSwitcher();
    console.log(`[THEME] Переключился на: ${themeName}`);
  }

  toggleGlass() {
    this.glassMode = !this.glassMode;
    localStorage.setItem('glass', this.glassMode ? 'true' : 'false');
    this.applyGlass();
    this.createSwitcher();
    console.log(`[THEME] Glassmorphism: ${this.glassMode}`);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
  });
} else {
  window.themeManager = new ThemeManager();
}