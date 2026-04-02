class PromptSimpleConfirmModalComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            title: '提示',
            message: '请关闭所有患者再开始还原数据！',
            onConfirm: null,
            onClose: null,
            ...options
        };
        this.root = null;
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('prompt-simple-confirm-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'prompt-simple-confirm-modal-styles';
        style.textContent = `
            .pscm-wrap { width: 100%; height: 100%; min-height: 420px; display: flex; align-items: center; justify-content: center; background: #111; padding: 16px; box-sizing: border-box; }
            .pscm-wrap.pscm-embed{ min-height: 0; }
            .pscm-modal { width: min(600px, 100%); height: 320px; background: linear-gradient(180deg, #333333 0%, #2b2b2b 100%); border: 1px solid #3a3a3a; border-radius: 8px; color: #e6e6e6; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55); display: flex; flex-direction: column; }
            .pscm-header { padding: 14px 20px 12px; display: flex; align-items: center; justify-content: space-between; }
            .pscm-title { margin: 0; font-size: 16px; font-weight: 500; color: #d7d7d7; }
            .pscm-close { border: none; background: transparent; color: #8a8a8a; font-size: 22px; line-height: 1; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
            .pscm-close:hover { color: #ccc; background: rgba(255,255,255,0.06); }
            .pscm-content { padding: 8px 20px 0; text-align: center; color: #c0c0c0; font-size: 13px; line-height: 1.7; flex: 1; display: flex; align-items: center; justify-content: center; }
            .pscm-divider { height: 1px; background: #3b3b3b; }
            .pscm-actions { padding: 14px 20px 18px; display: flex; gap: 16px; justify-content: flex-end; }
            .pscm-btn { min-width: 88px; height: 32px; border-radius: 4px; border: 1px solid #3aacde; background: #2a9dd0; color: #fff; cursor: pointer; font-size: 13px; font-weight: 500; }
            .pscm-btn:hover { background: #33addf; }
        `;
        document.head.appendChild(style);
    }

    _esc(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    _applyMountLayout() {
        const mc = this.options.mountContainer || document.body;
        if (mc !== document.body) {
            const pos = window.getComputedStyle(mc).position;
            if (pos === 'static') mc.style.position = 'relative';
        }
        if (!this.root) return;
        if (mc === document.body) {
            this.root.style.cssText =
                'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:#111;padding:16px;box-sizing:border-box;';
        } else {
            this.root.style.cssText =
                'position:absolute;inset:0;z-index:10080;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.72);padding:16px;box-sizing:border-box;';
            this.root.classList.add('pscm-embed');
        }
    }

    show() {
        if (this.root) return;
        const title = this._esc(this.options.title);
        const message = this._esc(this.options.message);
        this.root = document.createElement('div');
        this.root.className = 'pscm-wrap';
        this.root.innerHTML = `
            <div class="pscm-modal" role="dialog" aria-modal="true" aria-labelledby="pscm-title-el">
                <div class="pscm-header">
                    <h3 class="pscm-title" id="pscm-title-el">${title}</h3>
                    <button type="button" class="pscm-close" data-pscm-close aria-label="关闭">×</button>
                </div>
                <div class="pscm-content">${message}</div>
                <div class="pscm-divider"></div>
                <div class="pscm-actions">
                    <button type="button" class="pscm-btn" data-pscm-ok>确定</button>
                </div>
            </div>
        `;
        const mc = this.options.mountContainer || document.body;
        mc.appendChild(this.root);
        this._applyMountLayout();

        const done = () => {
            if (typeof this.options.onConfirm === 'function') this.options.onConfirm();
        };
        const closeAll = () => {
            this.hide();
            if (typeof this.options.onClose === 'function') this.options.onClose();
        };

        this.root.querySelector('[data-pscm-ok]')?.addEventListener('click', () => {
            this.hide();
            done();
        });
        this.root.querySelector('[data-pscm-close]')?.addEventListener('click', () => {
            closeAll();
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
    window.PromptSimpleConfirmModalComponent = PromptSimpleConfirmModalComponent;
}
