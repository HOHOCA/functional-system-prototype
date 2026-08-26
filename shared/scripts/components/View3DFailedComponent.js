/**
 * 3D 重建视图失败空态
 * 3D 区域展示提示文案，避免纯黑空白。
 */
class View3DFailedComponent {
    static DEFAULT_MESSAGE = '未生成3D图像，请检查是否存在ROI轮廓';

    static overlayHtml(message, { hidden = false } = {}) {
        const text = View3DFailedComponent._esc(message || View3DFailedComponent.DEFAULT_MESSAGE);
        return `<div class="view3d-empty-overlay" data-view3d-empty${hidden ? ' hidden' : ''}>
            <p class="view3d-empty-message">${text}</p>
        </div>`;
    }

    static showIn(container, message) {
        if (!container) return;
        let overlay = container.querySelector('[data-view3d-empty]');
        if (!overlay) {
            const host = container.querySelector('.view3d-canvas-container') || container;
            host.insertAdjacentHTML('beforeend', View3DFailedComponent.overlayHtml(message));
            overlay = host.querySelector('[data-view3d-empty]');
        }
        const text = overlay.querySelector('.view3d-empty-message');
        if (text && message) text.textContent = message;
        overlay.hidden = false;
        overlay.removeAttribute('hidden');
    }

    static hideIn(container) {
        const overlay = container && container.querySelector('[data-view3d-empty]');
        if (overlay) overlay.hidden = true;
    }

    static _esc(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string'
            ? document.getElementById(containerId)
            : containerId;

        if (!this.container) {
            console.error('3D View failed container not found:', containerId);
            return;
        }

        if (!this.container.id) {
            this.container.id = 'view3d-failed-' + Date.now();
        }

        this.uid = this.container.id;
        this.options = {
            showToolbar: true,
            showHeader: true,
            toolbarTitle: '3D',
            message: View3DFailedComponent.DEFAULT_MESSAGE,
            ...options
        };

        this.ensureStyles();
        this.render();
    }

    ensureStyles() {
        if (document.getElementById('view3d-failed-component-styles')) return;
        const style = document.createElement('style');
        style.id = 'view3d-failed-component-styles';
        style.textContent = `
            .view3d-failed-wrapper { position: relative; width: 100%; height: 100%; min-height: 280px; background: #111; display: flex; flex-direction: column; }
            .view3d-empty-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #111; z-index: 2; }
            .view3d-empty-overlay[hidden] { display: none !important; }
            .view3d-empty-message { margin: 0; color: #9a9a9a; font-size: 14px; line-height: 1.7; text-align: center; padding: 0 24px; }
        `;
        document.head.appendChild(style);
    }

    renderToolbar() {
        if (!this.options.showToolbar) return '';
        const titleHtml = this.options.showHeader
            ? `<div class="toolbar-title">${View3DFailedComponent._esc(this.options.toolbarTitle || '3D')}</div>`
            : '';
        const uid = this.uid;
        return `
            <div class="cross-section-view2d-toolbar" data-view3d-failed-toolbar="${uid}">
                ${titleHtml}
                <div class="toolbar-group toolbar-group-right">
                    <button type="button" class="toolbar-btn-svg" title="旋转" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-rotate-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <rect x="6" y="8" width="12" height="8" rx="1" stroke="url(#gradient-rotate-${uid})" stroke-width="2" fill="none"/>
                            <path d="M18 8 L18 5 L21 8 L18 11 L18 8" fill="url(#gradient-rotate-${uid})"/>
                        </svg>
                    </button>
                    <button type="button" class="toolbar-btn-svg" title="缩放" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-zoom-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle cx="10" cy="10" r="7" stroke="url(#gradient-zoom-${uid})" stroke-width="2" fill="none"/>
                            <line x1="15" y1="15" x2="21" y2="21" stroke="url(#gradient-zoom-${uid})" stroke-width="2" stroke-linecap="round"/>
                            <line x1="7" y1="10" x2="13" y2="10" stroke="url(#gradient-zoom-${uid})" stroke-width="2" stroke-linecap="round"/>
                            <line x1="10" y1="7" x2="10" y2="13" stroke="url(#gradient-zoom-${uid})" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button type="button" class="toolbar-btn-svg" title="拖动" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-pan-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M9 6 C9 4 10 3 11 3 C12 3 13 4 13 6 L13 11 L14.5 9.5 C15.5 8.5 17 8.5 17.5 9.5 C18 10.5 18 11.5 17 12.5 L13.5 17 C12.5 18.5 11 19 9 19 L6 19 C4.5 19 3 17.5 3 16 L3 12 C3 10.5 4 9.5 5 9.5 C6 9.5 7 10 7 11 L7 6 C7 4 8 3 9 3 C9 3 9 4 9 6 Z" stroke="url(#gradient-pan-${uid})" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button type="button" class="toolbar-btn-svg" title="全屏" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-maximize-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M3 3 L3 9 M3 3 L9 3" stroke="url(#gradient-maximize-${uid})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 3 L21 9 M21 3 L15 3" stroke="url(#gradient-maximize-${uid})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 21 L3 15 M3 21 L9 21" stroke="url(#gradient-maximize-${uid})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 21 L21 15 M21 21 L15 21" stroke="url(#gradient-maximize-${uid})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    render() {
        this.container.innerHTML = `
            <div class="view3d-wrapper view3d-failed-wrapper bv3d-wrapper">
                ${this.renderToolbar()}
                <div class="view3d-canvas-container">
                    ${View3DFailedComponent.overlayHtml(this.options.message)}
                </div>
            </div>
        `;
    }

    showEmptyState(message) {
        View3DFailedComponent.showIn(this.container, message || this.options.message);
    }

    hideEmptyState() {
        View3DFailedComponent.hideIn(this.container);
    }

    destroy() {
        if (this.container) this.container.innerHTML = '';
    }
}

if (typeof window !== 'undefined') {
    window.View3DFailedComponent = View3DFailedComponent;
}
