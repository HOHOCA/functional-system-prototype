class SpectralCTAnalysisComponent {
    constructor(options = {}) {
        this.options = options;
        this.modal = null;
        this.mode = 'energy'; // 'energy' | 'sbi'
        this.state = {
            imageGroup: null,
            energyHigh: null,
            energyLow: null,
            sbiItem: null,
            results: new Set([
                'virtualMono', 'spr', 'iodine', 'calcium', 'electronDensity', 'effectiveZ', 'iron', 'oxygen'
            ])
        };
        this.loadingMask = null;
    }

    getCurrentGroup() {
        if (typeof this.options.getCurrentGroup === 'function') {
            return this.options.getCurrentGroup();
        }
        return { id: 'group-1', name: '当前影像组' };
    }

    getEnergyChoices() {
        if (typeof this.options.getEnergyChoices === 'function') {
            return this.options.getEnergyChoices();
        }
        // 默认示例
        return [
            { id: 'high-140', label: '140kVp' },
            { id: 'low-80', label: '80kVp' },
            { id: 'mono-40', label: '40keV 虚拟单能影像' },
            { id: 'mono-70', label: '70keV 虚拟单能影像' }
        ];
    }

    getSBIChoices() {
        if (typeof this.options.getSBIChoices === 'function') {
            return this.options.getSBIChoices();
        }
        // 默认示例
        return [
            { id: 'sbi-1', label: 'SBI 20240302 19:02:25' },
            { id: 'sbi-2', label: 'SBI 20240303 10:15:12' }
        ];
    }

    open() {
        if (this.modal) {
            this.close();
        }
        this.state.imageGroup = this.getCurrentGroup();
        const targetContainer = this.options.container || null;
        
        const modal = document.createElement('div');
        modal.className = 'spectral-modal-mask';
        // 如果是预览模式，移除模态框遮罩样式，改为内联显示
        if (targetContainer) {
            modal.style.position = 'relative';
            modal.style.display = 'block';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.background = 'transparent';
        }
        modal.innerHTML = `
            <div class="spectral-modal">
                <div class="modal-header">
                    <span>能谱CT分析</span>
                    <button class="close-btn" aria-label="close">&times;</button>
                </div>
                <div class="modal-tabs">
                    <button class="tab-btn active" data-mode="energy">能量CT分析</button>
                    <button class="tab-btn" data-mode="sbi">SBI分析</button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <label>影像组</label>
                        <select id="spct-group" disabled>
                            <option value="${this.state.imageGroup.id}">[${this.state.imageGroup.name}]</option>
                        </select>
                    </div>

                    <div class="energy-params">
                        <div class="form-row">
                            <label>能量1</label>
                            <select id="spct-energy-high"></select>
                        </div>
                        <div class="form-row">
                            <label>能量2</label>
                            <select id="spct-energy-low"></select>
                        </div>
                    </div>

                    <div class="sbi-params" style="display:none;">
                        <div class="form-row">
                            <label>SBI</label>
                            <select id="spct-sbi"></select>
                        </div>
                    </div>

                    <div class="section-title">生成结果选择</div>
                    <div class="result-grid">
                        ${this.renderResultItem('virtualMono','虚拟单能影像')}
                        ${this.renderResultItem('spr','SPR图')}
                        ${this.renderResultItem('iodine','碘图')}
                        ${this.renderResultItem('calcium','钙图')}
                        ${this.renderResultItem('electronDensity','电子密度图')}
                        ${this.renderResultItem('effectiveZ','有效原子序数图')}
                        ${this.renderResultItem('iron','铁图')}
                        ${this.renderResultItem('oxygen','氧图')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="spct-cancel">取消</button>
                    <button class="btn btn-primary" id="spct-confirm">确定</button>
                </div>
            </div>
        `;
        // 根据是否有容器决定添加到哪
        if (targetContainer) {
            targetContainer.appendChild(modal);
        } else {
            document.body.appendChild(modal);
        }
        this.modal = modal;
        this.injectStyles();
        this.fillChoices();
        this.bindEvents();
        this.updateConfirmState();
    }

    renderResultItem(key, label) {
        const checked = this.state.results.has(key);
        const mark = checked ? '■' : '□';
        return `<div class="result-item" data-key="${key}"><span class="checkbox-mark">${mark}</span><span class="label">${label}</span></div>`;
    }

    fillChoices() {
        const highSel = this.modal.querySelector('#spct-energy-high');
        const lowSel = this.modal.querySelector('#spct-energy-low');
        const energies = this.getEnergyChoices();
        energies.forEach(e => {
            const o1 = document.createElement('option'); o1.value = e.id; o1.textContent = e.label; highSel.appendChild(o1);
            const o2 = document.createElement('option'); o2.value = e.id; o2.textContent = e.label; lowSel.appendChild(o2);
        });
        if (energies.length) {
            highSel.value = energies[0].id;
            lowSel.value = energies[Math.min(1, energies.length - 1)].id;
            this.state.energyHigh = highSel.value;
            this.state.energyLow = lowSel.value;
        }

        const sbiSel = this.modal.querySelector('#spct-sbi');
        const sbiList = this.getSBIChoices();
        sbiList.forEach(s => {
            const o = document.createElement('option'); o.value = s.id; o.textContent = s.label; sbiSel.appendChild(o);
        });
        if (sbiList.length) this.state.sbiItem = sbiList[0].id;
    }

    bindEvents() {
        const closeBtn = this.modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.cancel());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.cancel();
        });

        // Tabs
        const tabBtns = this.modal.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.mode = btn.dataset.mode;
            this.modal.querySelector('.energy-params').style.display = this.mode === 'energy' ? 'block' : 'none';
            this.modal.querySelector('.sbi-params').style.display = this.mode === 'sbi' ? 'block' : 'none';
        }));

        // Selects
        this.modal.querySelector('#spct-energy-high').addEventListener('change', (e) => this.state.energyHigh = e.target.value);
        this.modal.querySelector('#spct-energy-low').addEventListener('change', (e) => this.state.energyLow = e.target.value);
        this.modal.querySelector('#spct-sbi').addEventListener('change', (e) => this.state.sbiItem = e.target.value);

        // Results toggles
        this.modal.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => {
                const key = item.dataset.key;
                if (this.state.results.has(key)) {
                    this.state.results.delete(key);
                } else {
                    this.state.results.add(key);
                }
                const mark = item.querySelector('.checkbox-mark');
                mark.textContent = this.state.results.has(key) ? '■' : '□';
                this.updateConfirmState();
            });
        });

        // Footer buttons
        this.modal.querySelector('#spct-cancel').addEventListener('click', () => this.cancel());
        this.modal.querySelector('#spct-confirm').addEventListener('click', () => this.confirm());
    }

    updateConfirmState() {
        const btn = this.modal.querySelector('#spct-confirm');
        const enabled = this.state.results.size > 0;
        btn.disabled = !enabled;
        btn.classList.toggle('disabled', !enabled);
    }

    confirm() {
        if (this.state.results.size === 0) return;
        this.showLoading();
        if (typeof this.options.onConfirm === 'function') {
            try {
                this.options.onConfirm({
                    mode: this.mode,
                    group: this.state.imageGroup,
                    energyHigh: this.state.energyHigh,
                    energyLow: this.state.energyLow,
                    sbiItem: this.state.sbiItem,
                    results: Array.from(this.state.results)
                }).then(() => {
                    this.hideLoading();
                    this.close();
                }).catch((err) => {
                    console.error(err);
                    this.hideLoading();
                    this.close();
                });
            } catch (e) {
                this.hideLoading();
                this.close();
            }
        } else {
            // Demo: simulate 1.2s
            setTimeout(() => { this.hideLoading(); this.close(); }, 1200);
        }
    }

    cancel() {
        this.close();
    }

    close() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
        this.modal = null;
    }

    showLoading() {
        if (!this.modal) return;
        const mask = document.createElement('div');
        mask.className = 'spct-loading-mask';
        mask.innerHTML = `<div class="spinner"></div><div class="tip">正在生成结果，请稍候...</div>`;
        this.modal.appendChild(mask);
        this.loadingMask = mask;
    }

    hideLoading() {
        if (this.loadingMask && this.loadingMask.parentNode) {
            this.loadingMask.parentNode.removeChild(this.loadingMask);
        }
        this.loadingMask = null;
    }

    injectStyles() {
        if (document.getElementById('spct-styles')) return;
        const style = document.createElement('style');
        style.id = 'spct-styles';
        style.textContent = `
            .spectral-modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1000}
            .spectral-modal{width:520px;background:#2b2b2b;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.5);overflow:hidden}
            .spectral-modal .modal-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#333;border-bottom:1px solid #444;color:#fff;font-size:14px}
            .spectral-modal .close-btn{background:transparent;border:0;color:#fff;font-size:20px;cursor:pointer}
            .spectral-modal .modal-tabs{display:flex;background:#2f2f2f;border-bottom:1px solid #3a3a3a}
            .spectral-modal .tab-btn{flex:1;padding:10px 0;background:transparent;border:0;color:#a9b1bd;cursor:pointer}
            .spectral-modal .tab-btn.active{color:#21a1f1;border-bottom:2px solid #21a1f1}
            .spectral-modal .modal-body{padding:14px;color:#e5e7eb;font-size:13px}
            .spectral-modal .form-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
            .spectral-modal label{width:72px;color:#cbd5e1}
            .spectral-modal select{flex:1;background:#1f1f1f;border:1px solid #3a3a3a;color:#e5e7eb;border-radius:4px;padding:6px}
            .spectral-modal .section-title{margin:8px 0;color:#cbd5e1}
            .spectral-modal .result-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
            .spectral-modal .result-item{display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #3a3a3a;border-radius:4px;background:#1f1f1f;cursor:pointer}
            .spectral-modal .result-item .checkbox-mark{width:16px;text-align:center;color:#21a1f1}
            .spectral-modal .modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:12px 16px;border-top:1px solid #3a3a3a;background:#2f2f2f}
            .spectral-modal .btn{min-width:86px;border:0;border-radius:4px;padding:8px 12px;cursor:pointer}
            .spectral-modal .btn-primary{background:#21a1f1;color:#0b0b0b}
            .spectral-modal .btn-primary.disabled{background:#3b8ab3;opacity:.6;cursor:not-allowed}
            .spectral-modal .btn-secondary{background:#4b5563;color:#e5e7eb}
            .spct-loading-mask{position:absolute;inset:0;background:rgba(0,0,0,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
            .spct-loading-mask .spinner{width:36px;height:36px;border:3px solid #4b5563;border-top-color:#21a1f1;border-radius:50%;animation:spct-spin 1s linear infinite}
            .spct-loading-mask .tip{color:#e5e7eb}
            @keyframes spct-spin{to{transform:rotate(360deg)}}
        `;
        document.head.appendChild(style);
    }
}

window.SpectralCTAnalysisComponent = SpectralCTAnalysisComponent;


