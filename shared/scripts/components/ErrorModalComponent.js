class ErrorModalComponent {
    constructor(options = {}) {
        this.options = { mountContainer: document.body, ...options };
        this.root = null;
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('error-modal-component-styles')) return;
        const style = document.createElement('style');
        style.id = 'error-modal-component-styles';
        style.textContent = `
            .emc-wrap { width: 100%; height: 100%; min-height: 420px; display: flex; align-items: center; justify-content: center; background: #111; padding: 16px; box-sizing: border-box; }
            .emc-modal { width: min(600px, 100%); height: 320px; background: linear-gradient(180deg, #333 0%, #2b2b2b 100%); border: 1px solid #3a3a3a; border-radius: 8px; color: #e6e6e6; box-shadow: 0 12px 36px rgba(0,0,0,0.55); display: flex; flex-direction: column; }
            .emc-header { padding: 14px 20px 12px; display: flex; align-items: center; justify-content: space-between; }
            .emc-title { margin: 0; font-size: 16px; font-weight: 500; color: #d7d7d7; }
            .emc-close { color: #8a8a8a; font-size: 18px; line-height: 1; }
            .emc-body { padding: 8px 20px 20px; display: flex; align-items: center; gap: 24px; flex: 1; }
            .emc-icon { width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(180deg, #f4c95e 0%, #bd8b2a 100%); color: #4b3a1b; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 700; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 6px rgba(0,0,0,0.35); }
            .emc-text { color: #d0d0d0; line-height: 1.7; font-size: 13px; }
            .emc-divider { height: 1px; background: #3b3b3b; }
            .emc-actions { padding: 14px 20px 18px; display: flex; justify-content: flex-end; gap: 16px; }
            .emc-btn { min-width: 88px; height: 32px; border-radius: 4px; border: 1px solid #575757; background: #3f3f3f; color: #d2d2d2; cursor: pointer; font-size: 13px; font-weight: 500; }
            .emc-btn.primary { border-color: #3aacde; background: #2a9dd0; color: #fff; }
            .emc-btn.primary:hover { background: #33addf; }
        `;
        document.head.appendChild(style);
    }

    show() {
        if (this.root) return;
        this.root = document.createElement('div');
        this.root.className = 'emc-wrap';
        this.root.innerHTML = `
            <div class="emc-modal" role="dialog" aria-modal="false" aria-label="错误类弹窗">
                <div class="emc-header">
                    <h3 class="emc-title">错误</h3>
                    <div class="emc-close">×</div>
                </div>
                <div class="emc-body">
                    <div class="emc-icon">×</div>
                    <div class="emc-text">第24、25对叶片存在叶片超出“同一箱体相邻叶片最大尖端差”值。</div>
                </div>
                <div class="emc-divider"></div>
                <div class="emc-actions">
                    <button type="button" class="emc-btn">取消</button>
                    <button type="button" class="emc-btn primary">确定</button>
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
    window.ErrorModalComponent = ErrorModalComponent;
}
