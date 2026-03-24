class WarningDeleteModalComponent {
    constructor(options = {}) {
        this.options = { mountContainer: document.body, ...options };
        this.root = null;
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('warning-delete-modal-component-styles')) return;
        const style = document.createElement('style');
        style.id = 'warning-delete-modal-component-styles';
        style.textContent = `
            .wdmc-wrap { width: 100%; height: 100%; min-height: 420px; display: flex; align-items: center; justify-content: center; background: #111; padding: 16px; box-sizing: border-box; }
            .wdmc-modal { width: min(600px, 100%); height: 320px; background: #2D2D2D; border: 1px solid #3a3a3a; border-radius: 8px; color: #fff; box-shadow: 0 12px 36px rgba(0,0,0,0.55); display: flex; flex-direction: column; }
            .wdmc-header { padding: 14px 20px 12px; display: flex; align-items: center; justify-content: space-between; }
            .wdmc-title { margin: 0; font-size: 16px; font-weight: 500; color: #fff; }
            .wdmc-close { color: #fff; font-size: 18px; line-height: 1; }
            .wdmc-body { padding: 8px 20px 20px; display: flex; align-items: center; gap: 24px; flex: 1; }
            .wdmc-icon { width: 58px; height: 58px; border-radius: 50%; background: #E74C3C; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 700; flex-shrink: 0; }
            .wdmc-text { color: #fff; font-size: 13px; line-height: 1.7; }
            .wdmc-divider { height: 1px; background: #3b3b3b; }
            .wdmc-actions { padding: 14px 20px 18px; display: flex; justify-content: flex-end; gap: 16px; }
            .wdmc-btn { min-width: 88px; height: 32px; border-radius: 4px; border: 1px solid #575757; background: #3f3f3f; color: #d2d2d2; cursor: pointer; font-size: 13px; font-weight: 500; }
            .wdmc-btn.delete { border-color: #E74C3C; background: #E74C3C; color: #fff; }
        `;
        document.head.appendChild(style);
    }

    show() {
        if (this.root) return;
        this.root = document.createElement('div');
        this.root.className = 'wdmc-wrap';
        this.root.innerHTML = `
            <div class="wdmc-modal" role="dialog" aria-modal="false" aria-label="警告-删除类弹窗">
                <div class="wdmc-header">
                    <h3 class="wdmc-title">警告</h3>
                    <div class="wdmc-close">×</div>
                </div>
                <div class="wdmc-body">
                    <div class="wdmc-icon">!</div>
                    <div class="wdmc-text">是否删除未导入的远程节点数据？</div>
                </div>
                <div class="wdmc-divider"></div>
                <div class="wdmc-actions">
                    <button type="button" class="wdmc-btn">取消</button>
                    <button type="button" class="wdmc-btn delete">删除</button>
                </div>
            </div>
        `;
        (this.options.mountContainer || document.body).appendChild(this.root);
    }

    hide() {
        if (!this.root) return;
        this.root.remove();
        this.root = null;
    }

    destroy() {
        this.hide();
    }
}

if (typeof window !== 'undefined') {
    window.WarningDeleteModalComponent = WarningDeleteModalComponent;
}
