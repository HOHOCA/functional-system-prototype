class VirtualMonoEnergyComponent {
    constructor(options = {}) {
        this.options = options;
        this.modal = null;
        this.state = {
            group: null,
            keV: ''
        };
        this.loadingMask = null;
    }

    getCurrentGroup() {
        if (typeof this.options.getCurrentGroup === 'function') {
            return this.options.getCurrentGroup();
        }
        return { id: 'group-1', name: '【双能CT】20240302 19:02:25' };
    }

    open() {
        if (this.modal) this.close();
        this.state.group = this.getCurrentGroup();
        const mask = document.createElement('div');
        mask.className = 'vmi-modal-mask';
        mask.innerHTML = `
            <div class="vmi-modal">
                <div class="modal-header">
                    <span>虚拟单能影像获取</span>
                    <button class="close-btn" aria-label="close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <label>影像组</label>
                        <select id="vmi-group" disabled>
                            <option value="${this.state.group.id}">[${this.state.group.name}]</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>能量</label>
                        <div class="kv-input">
                            <input id="vmi-kev" type="text" inputmode="numeric" placeholder="40-200" />
                            <span class="unit">keV</span>
                        </div>
                    </div>
                    <div class="hint" id="vmi-hint" style="display:none;"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="vmi-cancel">取消</button>
                    <button class="btn btn-primary" id="vmi-confirm" disabled>获取</button>
                </div>
            </div>`;
        document.body.appendChild(mask);
        this.modal = mask;
        this.injectStyles();
        this.bindEvents();
    }

    bindEvents() {
        const closeBtn = this.modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
        const kevInput = this.modal.querySelector('#vmi-kev');
        kevInput.addEventListener('input', () => this.onInputChange());
        this.modal.querySelector('#vmi-cancel').addEventListener('click', () => this.close());
        this.modal.querySelector('#vmi-confirm').addEventListener('click', () => this.confirm());
    }

    onInputChange() {
        const input = this.modal.querySelector('#vmi-kev');
        const hint = this.modal.querySelector('#vmi-hint');
        const confirmBtn = this.modal.querySelector('#vmi-confirm');
        const raw = (input.value || '').trim();
        this.state.keV = raw;
        const val = parseInt(raw, 10);

        input.classList.remove('error');
        hint.style.display = 'none';
        hint.textContent = '';
        confirmBtn.disabled = true;

        if (raw === '') {
            input.classList.add('error');
            hint.textContent = '能量不能为空';
            hint.style.display = 'block';
            return;
        }
        if (!/^\d+$/.test(raw) || isNaN(val) || val < 40 || val > 200) {
            input.classList.add('error');
            hint.textContent = '请输入40-200之间的整数值';
            hint.style.display = 'block';
            return;
        }
        // valid
        confirmBtn.disabled = false;
    }

    confirm() {
        const input = this.modal.querySelector('#vmi-kev');
        const hint = this.modal.querySelector('#vmi-hint');
        const confirmBtn = this.modal.querySelector('#vmi-confirm');
        if (confirmBtn.disabled) return;

        this.showLoading();
        const keV = parseInt(this.state.keV, 10);
        const onConfirm = this.options.onConfirm || (() => new Promise((r)=>setTimeout(r, 1200)));
        onConfirm({ group: this.state.group, keV }).then(() => {
            this.hideLoading();
            // 通知系统刷新患者树并在当前能谱组新增VMI图像
            document.dispatchEvent(new CustomEvent('vmi-generated', { detail: { group: this.state.group, keV } }));
            this.close();
        }).catch(() => {
            this.hideLoading();
            input.classList.add('error');
            hint.textContent = '获取失败，请重试';
            hint.style.display = 'block';
            confirmBtn.disabled = false;
        });
    }

    showLoading() {
        const mask = document.createElement('div');
        mask.className = 'vmi-loading-mask';
        mask.innerHTML = `<div class="spinner"></div><div class="tip">正在生成结果，请稍候...</div>`;
        this.modal.appendChild(mask);
        this.loadingMask = mask;
        this.modal.querySelector('#vmi-confirm').disabled = true;
    }

    hideLoading() {
        if (this.loadingMask && this.loadingMask.parentNode) {
            this.loadingMask.parentNode.removeChild(this.loadingMask);
        }
        this.loadingMask = null;
    }

    close() {
        if (this.modal && this.modal.parentNode) this.modal.parentNode.removeChild(this.modal);
        this.modal = null;
    }

    injectStyles() {
        if (document.getElementById('vmi-styles')) return;
        const style = document.createElement('style');
        style.id = 'vmi-styles';
        style.textContent = `
            .vmi-modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1000}
            .vmi-modal{width:480px;background:#2b2b2b;border-radius:8px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.5)}
            .vmi-modal .modal-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#333;border-bottom:1px solid #444;color:#fff}
            .vmi-modal .close-btn{background:transparent;border:0;color:#fff;font-size:20px;cursor:pointer}
            .vmi-modal .modal-body{padding:16px;color:#e5e7eb}
            .vmi-modal .form-row{display:flex;align-items:center;gap:10px;margin-bottom:12px}
            .vmi-modal label{width:64px;color:#cbd5e1}
            .vmi-modal select{flex:1;background:#1f1f1f;border:1px solid #3a3a3a;color:#e5e7eb;border-radius:4px;padding:6px}
            .vmi-modal .kv-input{display:flex;align-items:center;gap:8px;flex:1}
            .vmi-modal .kv-input input{flex:1;background:#1f1f1f;border:1px solid #3a3a3a;color:#e5e7eb;border-radius:4px;padding:6px}
            .vmi-modal .kv-input input.error{border-color:#ef4444}
            .vmi-modal .kv-input .unit{color:#9aa5b1}
            .vmi-modal .hint{margin-top:-6px;margin-bottom:8px;color:#ef4444;font-size:12px}
            .vmi-modal .modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:12px 16px;border-top:1px solid #3a3a3a;background:#2f2f2f}
            .vmi-modal .btn{min-width:86px;border:0;border-radius:4px;padding:8px 12px;cursor:pointer}
            .vmi-modal .btn-primary{background:#21a1f1;color:#0b0b0b}
            .vmi-modal .btn-secondary{background:#4b5563;color:#e5e7eb}
            .vmi-loading-mask{position:absolute;inset:0;background:rgba(0,0,0,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
            .vmi-loading-mask .spinner{width:36px;height:36px;border:3px solid #4b5563;border-top-color:#21a1f1;border-radius:50%;animation:vmi-spin 1s linear infinite}
            .vmi-loading-mask .tip{color:#e5e7eb}
            @keyframes vmi-spin{to{transform:rotate(360deg)}}
        `;
        document.head.appendChild(style);
    }
}

window.VirtualMonoEnergyComponent = VirtualMonoEnergyComponent;


