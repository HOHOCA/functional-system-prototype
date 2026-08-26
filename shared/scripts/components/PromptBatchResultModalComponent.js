class PromptBatchResultModalComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            title: '自动勾画结果',
            successLabel: '勾画成功',
            failLabel: '勾画失败',
            confirmText: '确定',
            items: PromptBatchResultModalComponent.defaultItems(),
            onConfirm: null,
            onClose: null,
            ...options
        };
        this.root = null;
        this.ensureStyles();
    }

    static defaultItems() {
        const successOrgans = [
            'Brainstem',
            'SpinalCord',
            'Parotid_L',
            'Parotid_R',
            'Mandible',
            'OralCavity',
            'Larynx',
            'Eye_L',
            'Eye_R',
            'TemporalLobe_L',
            'TemporalLobe_R',
            'Cochlea_L',
            'TMJ_L',
            'TMJ_R',
            'Bladder',
            'Rectum',
            'Bowel_Small',
            'Body'
        ];
        const failOrgans = [
            'OpticNerve_L',
            'OpticNerve_R',
            'InnerEar_R',
            'Cochlea_R'
        ];
        return [
            ...successOrgans.map((name) => ({ name, success: true })),
            ...failOrgans.map((name) => ({ name, success: false }))
        ];
    }

    static iconSuccess() {
        return `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="8" fill="#3ecf4a"></circle>
            <path d="M4.6 8.2 L7 10.6 L11.5 5.5" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;
    }

    static iconFail() {
        return `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="8" fill="#e74c3c"></circle>
            <path d="M5.2 5.2 L10.8 10.8 M10.8 5.2 L5.2 10.8" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"></path>
        </svg>`;
    }

    ensureStyles() {
        let style = document.getElementById('prompt-batch-result-modal-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'prompt-batch-result-modal-styles';
            document.head.appendChild(style);
        }
        style.textContent = `
            .pbrm-wrap { width: 100%; height: 100%; min-height: 420px; display: flex; align-items: center; justify-content: center; background: #111; padding: 16px; box-sizing: border-box; }
            .pbrm-wrap.pbrm-embed { min-height: 0; }
            .pbrm-modal { width: min(460px, 100%); max-height: min(560px, 90vh); background: linear-gradient(180deg, #333333 0%, #2b2b2b 100%); border: 1px solid #3a3a3a; border-radius: 8px; color: #e6e6e6; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55); display: flex; flex-direction: column; }
            .pbrm-header { padding: 14px 16px 8px 20px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
            .pbrm-title { margin: 0; font-size: 16px; font-weight: 500; color: #d7d7d7; }
            .pbrm-close { border: none; background: transparent; color: #8a8a8a; font-size: 22px; line-height: 1; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
            .pbrm-close:hover { color: #ccc; background: rgba(255,255,255,0.06); }
            .pbrm-summary { display: flex; align-items: center; gap: 28px; padding: 4px 20px 12px; flex-shrink: 0; }
            .pbrm-stat { display: flex; align-items: center; gap: 8px; color: #c8c8c8; font-size: 13px; line-height: 1; }
            .pbrm-stat-icon { width: 16px; height: 16px; display: inline-flex; }
            .pbrm-list { margin: 0 16px; padding: 8px 12px 8px 14px; background: #1c1c1c; border-radius: 6px; overflow-y: auto; overflow-x: hidden; max-height: 268px; min-height: 0; flex: 0 1 auto; scrollbar-width: thin; scrollbar-color: #5a5a5a transparent; }
            .pbrm-list::-webkit-scrollbar { width: 6px; }
            .pbrm-list::-webkit-scrollbar-thumb { background: #5a5a5a; border-radius: 3px; }
            .pbrm-list::-webkit-scrollbar-track { background: transparent; }
            .pbrm-row { display: flex; align-items: center; gap: 8px; min-height: 28px; }
            .pbrm-name { flex-shrink: 0; max-width: 62%; color: #d0d0d0; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .pbrm-leader { flex: 1; height: 1px; min-width: 12px; background-image: radial-gradient(circle, #6a6a6a 0.85px, transparent 0.9px); background-size: 5px 1px; background-repeat: repeat-x; background-position: center; }
            .pbrm-status { width: 16px; height: 16px; display: inline-flex; flex-shrink: 0; }
            .pbrm-actions { padding: 16px 20px 18px; display: flex; justify-content: flex-end; flex-shrink: 0; }
            .pbrm-btn { min-width: 88px; height: 32px; border-radius: 4px; border: 1px solid #3aacde; background: #2a9dd0; color: #fff; cursor: pointer; font-size: 13px; font-weight: 500; }
            .pbrm-btn:hover { background: #33addf; }
        `;
    }

    _esc(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    _isSuccess(item) {
        if (!item || typeof item !== 'object') return true;
        if (item.status === 'fail' || item.status === 'error') return false;
        if (item.status === 'success') return true;
        return item.success !== false;
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
            this.root.classList.add('pbrm-embed');
        }
    }

    _groupItems(items) {
        const successItems = [];
        const failItems = [];
        items.forEach((item) => {
            if (this._isSuccess(item)) successItems.push(item);
            else failItems.push(item);
        });
        return { successItems, failItems };
    }

    _renderRows(items) {
        return items.map((item) => {
            const ok = this._isSuccess(item);
            const name = this._esc(item?.name ?? '');
            const icon = ok ? PromptBatchResultModalComponent.iconSuccess() : PromptBatchResultModalComponent.iconFail();
            const label = ok ? '勾画成功' : '勾画失败';
            return `<div class="pbrm-row">
                <span class="pbrm-name" title="${name}">${name}</span>
                <span class="pbrm-leader"></span>
                <span class="pbrm-status" aria-label="${label}">${icon}</span>
            </div>`;
        }).join('');
    }

    show() {
        if (this.root) return;
        const items = Array.isArray(this.options.items) ? this.options.items : [];
        const { successItems, failItems } = this._groupItems(items);
        const successCount = successItems.length;
        const failCount = failItems.length;
        const groupedItems = [...successItems, ...failItems];
        const title = this._esc(this.options.title);
        const successLabel = this._esc(this.options.successLabel);
        const failLabel = this._esc(this.options.failLabel);
        const confirmText = this._esc(this.options.confirmText);

        this.root = document.createElement('div');
        this.root.className = 'pbrm-wrap';
        this.root.innerHTML = `
            <div class="pbrm-modal" role="dialog" aria-modal="true" aria-labelledby="pbrm-title-el">
                <div class="pbrm-header">
                    <h3 class="pbrm-title" id="pbrm-title-el">${title}</h3>
                    <button type="button" class="pbrm-close" data-pbrm-close aria-label="关闭">×</button>
                </div>
                <div class="pbrm-summary">
                    <div class="pbrm-stat">
                        <span class="pbrm-stat-icon">${PromptBatchResultModalComponent.iconSuccess()}</span>
                        <span>${successLabel} ${successCount}</span>
                    </div>
                    <div class="pbrm-stat">
                        <span class="pbrm-stat-icon">${PromptBatchResultModalComponent.iconFail()}</span>
                        <span>${failLabel} ${failCount}</span>
                    </div>
                </div>
                <div class="pbrm-list">${this._renderRows(groupedItems)}</div>
                <div class="pbrm-actions">
                    <button type="button" class="pbrm-btn" data-pbrm-ok>${confirmText}</button>
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

        this.root.querySelector('[data-pbrm-ok]')?.addEventListener('click', () => {
            this.hide();
            done();
        });
        this.root.querySelector('[data-pbrm-close]')?.addEventListener('click', () => {
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
    window.PromptBatchResultModalComponent = PromptBatchResultModalComponent;
}
