class PromptProgressModalComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            message: '正在备份数据...',
            /** 设置后：进度在指定时间内走到 100% 并触发 onComplete（不再无限循环） */
            autoCompleteMs: null,
            onComplete: null,
            onCancel: null,
            showCancelButton: true,
            ...options
        };
        this.root = null;
        this.progressTimer = null;
        this.completeTimer = null;
        this.progress = 65;
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('prompt-progress-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'prompt-progress-modal-styles';
        style.textContent = `
            .ppm-wrap { width: 100%; height: 100%; min-height: 420px; display: flex; align-items: center; justify-content: center; background: #111; padding: 16px; box-sizing: border-box; }
            .ppm-wrap.ppm-embed{ min-height: 0; }
            .ppm-modal { width: min(600px, 100%); height: 319px; background: linear-gradient(180deg, #333333 0%, #2b2b2b 100%); border: 1px solid #3a3a3a; border-radius: 8px; color: #e6e6e6; display: flex; flex-direction: column; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55); }
            .ppm-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; margin-top: 30px; margin-bottom: 20px; }
            .ppm-text { margin: 0; color: #c0c0c0; font-size: 13px; line-height: 1.7; }
            .ppm-row { display: flex; align-items: center; gap: 16px; }
            .ppm-bar { width: 300px; height: 8px; border-radius: 4px; background: #1a1a1a; border: 1px solid #3a3a3a; overflow: hidden; }
            .ppm-fill { height: 100%; background: linear-gradient(90deg, #1e92ff 0%, #4da6ff 100%); width: 65%; transition: width 0.2s ease; }
            .ppm-percent { min-width: 40px; color: #8a8a8a; font-size: 13px; }
            .ppm-actions { padding: 14px 20px 18px; display: flex; justify-content: flex-end; }
            .ppm-btn { min-width: 88px; height: 32px; border-radius: 4px; border: 1px solid #575757; background: #3f3f3f; color: #d2d2d2; cursor: pointer; font-size: 13px; font-weight: 500; }
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
            this.root.classList.add('ppm-embed');
        }
    }

    show() {
        if (this.root) return;
        this.root = document.createElement('div');
        this.root.className = 'ppm-wrap';
        const msg = this._esc(this.options.message);
        const showCancel = this.options.showCancelButton !== false;
        this.root.innerHTML = `
            <div class="ppm-modal" role="dialog" aria-modal="true" aria-busy="true" aria-label="进度">
                <div class="ppm-main">
                    <p class="ppm-text">${msg}</p>
                    <div class="ppm-row">
                        <div class="ppm-bar"><div class="ppm-fill"></div></div>
                        <div class="ppm-percent">0%</div>
                    </div>
                </div>
                <div class="ppm-actions" ${showCancel ? '' : 'style="display:none"'}>
                    <button type="button" class="ppm-btn" data-ppm-cancel>取消</button>
                </div>
            </div>
        `;
        const mc = this.options.mountContainer || document.body;
        mc.appendChild(this.root);
        this._applyMountLayout();

        const fill = this.root.querySelector('.ppm-fill');
        const percentEl = this.root.querySelector('.ppm-percent');
        if (fill) fill.style.width = '0%';
        if (percentEl) percentEl.textContent = '0%';

        this.root.querySelector('[data-ppm-cancel]')?.addEventListener('click', () => {
            this.stopProgressAnimation();
            if (this.completeTimer) {
                clearTimeout(this.completeTimer);
                this.completeTimer = null;
            }
            if (typeof this.options.onCancel === 'function') this.options.onCancel();
            this.hide();
        });

        const ms = this.options.autoCompleteMs;
        if (ms != null && Number.isFinite(Number(ms)) && Number(ms) > 0) {
            this._runTimedProgress(Number(ms));
        } else {
            this.progress = 40;
            this.startProgressAnimation();
        }
    }

    _runTimedProgress(durationMs) {
        const fill = this.root && this.root.querySelector('.ppm-fill');
        const percentEl = this.root && this.root.querySelector('.ppm-percent');
        if (!fill || !percentEl) return;
        this.stopProgressAnimation();
        const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const tick = () => {
            if (!this.root) return;
            const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
            const p = Math.min(100, Math.round(((t1 - t0) / durationMs) * 100));
            fill.style.width = `${p}%`;
            percentEl.textContent = `${p}%`;
            if (p >= 100) {
                if (typeof this.options.onComplete === 'function') this.options.onComplete();
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    startProgressAnimation() {
        const fill = this.root && this.root.querySelector('.ppm-fill');
        const percent = this.root && this.root.querySelector('.ppm-percent');
        if (!fill || !percent) return;
        this.stopProgressAnimation();
        this.progressTimer = setInterval(() => {
            this.progress += 1;
            if (this.progress > 99) this.progress = 40;
            fill.style.width = `${this.progress}%`;
            percent.textContent = `${this.progress}%`;
        }, 180);
    }

    stopProgressAnimation() {
        if (!this.progressTimer) return;
        clearInterval(this.progressTimer);
        this.progressTimer = null;
    }

    hide() {
        this.stopProgressAnimation();
        if (this.completeTimer) {
            clearTimeout(this.completeTimer);
            this.completeTimer = null;
        }
        if (!this.root) return;
        this.root.remove();
        this.root = null;
    }

    destroy() {
        this.hide();
    }
}

if (typeof window !== 'undefined') {
    window.PromptProgressModalComponent = PromptProgressModalComponent;
}
