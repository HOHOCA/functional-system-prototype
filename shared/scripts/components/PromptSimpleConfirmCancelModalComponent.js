class PromptSimpleConfirmCancelModalComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            title: '提示',
            message: '备份成功',
            confirmText: '确定',
            cancelText: '取消',
            onConfirm: null,
            onCancel: null,
            ...options
        };
        this.root = null;
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('prompt-simple-confirm-cancel-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'prompt-simple-confirm-cancel-modal-styles';
        style.textContent = `
            .psccm-wrap {
                position: fixed;
                inset: 0;
                z-index: 2147483647;
                width: 100%;
                height: 100%;
                min-height: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,0.55);
                padding: 16px;
                box-sizing: border-box;
            }
            .psccm-modal { width: min(600px, 100%); height: 250px; max-height: min(360px, 90vh); background: linear-gradient(180deg, #333333 0%, #2b2b2b 100%); border: 1px solid #3a3a3a; border-radius: 8px; color: #e6e6e6; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55); display: flex; flex-direction: column; }
            .psccm-header { padding: 14px 20px 12px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
            .psccm-title { margin: 0; font-size: 16px; font-weight: 500; color: #d7d7d7; }
            .psccm-close { border: none; background: transparent; cursor: pointer; padding: 6px 8px; color: #8a8a8a; font-size: 18px; line-height: 1; border-radius: 4px; }
            .psccm-close:hover { background: rgba(255,255,255,0.06); color: #cfcfcf; }
            .psccm-content { padding: 8px 20px 0; text-align: center; color: #c0c0c0; font-size: 13px; line-height: 1.7; flex: 1; display: flex; align-items: center; justify-content: center; white-space: pre-line; overflow: auto; min-height: 0; }
            .psccm-divider { height: 1px; background: #3b3b3b; flex-shrink: 0; }
            .psccm-actions { padding: 14px 20px 18px; display: flex; gap: 16px; justify-content: flex-end; flex-shrink: 0; }
            .psccm-btn { min-width: 88px; height: 32px; border-radius: 4px; border: 1px solid #575757; background: #3f3f3f; color: #d2d2d2; cursor: pointer; font-size: 13px; font-weight: 500; }
            .psccm-btn.primary { background: #2a9dd0; border-color: #3aacde; color: #fff; }
            .psccm-btn.primary:hover { background: #33addf; }
        `;
        document.head.appendChild(style);
    }

    show() {
        if (this.root) return;
        const title = String(this.options.title ?? '提示');
        const message = String(this.options.message ?? '');
        const confirmText = String(this.options.confirmText ?? '确定');
        const cancelText = String(this.options.cancelText ?? '取消');

        this.root = document.createElement('div');
        this.root.className = 'psccm-wrap';
        this.root.setAttribute('role', 'presentation');
        this.root.innerHTML = `
            <div class="psccm-modal" role="dialog" aria-modal="true" aria-labelledby="psccm-title-el">
                <div class="psccm-header">
                    <h3 class="psccm-title" id="psccm-title-el"></h3>
                    <button type="button" class="psccm-close" aria-label="关闭">×</button>
                </div>
                <div class="psccm-content"></div>
                <div class="psccm-divider"></div>
                <div class="psccm-actions">
                    <button type="button" class="psccm-btn" data-psccm-cancel></button>
                    <button type="button" class="psccm-btn primary" data-psccm-confirm></button>
                </div>
            </div>
        `;

        this.root.querySelector('#psccm-title-el').textContent = title;
        this.root.querySelector('.psccm-content').textContent = message;
        this.root.querySelector('[data-psccm-cancel]').textContent = cancelText;
        this.root.querySelector('[data-psccm-confirm]').textContent = confirmText;

        (this.options.mountContainer || document.body).appendChild(this.root);

        const dismiss = (fn) => {
            try {
                if (typeof fn === 'function') fn();
            } finally {
                this.hide();
            }
        };

        this.root.querySelector('.psccm-close')?.addEventListener('click', () => dismiss(this.options.onCancel));
        this.root.querySelector('[data-psccm-cancel]')?.addEventListener('click', () => dismiss(this.options.onCancel));
        this.root.querySelector('[data-psccm-confirm]')?.addEventListener('click', () => dismiss(this.options.onConfirm));
        this.root.addEventListener('click', (e) => {
            if (e.target === this.root) dismiss(this.options.onCancel);
        });
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
    window.PromptSimpleConfirmCancelModalComponent = PromptSimpleConfirmCancelModalComponent;
}
