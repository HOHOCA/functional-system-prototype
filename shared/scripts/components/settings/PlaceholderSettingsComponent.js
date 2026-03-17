class PlaceholderSettingsComponent {
  constructor(options) {
    this.options = options || {};
  }

  mount(containerEl) {
    if (!containerEl) return;
    const title = this.options.title || '设置';
    containerEl.innerHTML = `
      <h2 class="panel-title">${title}</h2>
      <div style="color:#b0b0b0;font-size:0.9rem;line-height:1.8;">
        该面板暂未组件化实现（占位）。
      </div>
    `;
  }
}

window.PlaceholderSettingsComponent = PlaceholderSettingsComponent;

