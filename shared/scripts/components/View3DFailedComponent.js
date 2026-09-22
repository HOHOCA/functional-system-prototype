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
                        <span class="mozi-view-icon mozi-view-icon-rotate" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="toolbar-btn-svg" title="缩放" data-active="false">
                        <span class="mozi-view-icon mozi-view-icon-zoom" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="toolbar-btn-svg" title="拖动" data-active="false">
                        <span class="mozi-view-icon mozi-view-icon-pan" aria-hidden="true"></span>
                    </button>
                    <button type="button" class="toolbar-btn-svg" title="全屏" data-active="false">
                        <span class="mozi-view-icon mozi-view-icon-maximize" aria-hidden="true"></span>
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
