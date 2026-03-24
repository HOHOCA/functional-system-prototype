class PromptProgressModalComponent {
    constructor(options = {}) {
        this.options = { mountContainer: document.body, ...options };
        this.root = null;
        this.progressTimer = null;
        this.progress = 65;
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('prompt-progress-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'prompt-progress-modal-styles';
        style.textContent = `
            .ppm-wrap { width: 100%; height: 100%; min-height: 420px; display: flex; align-items: center; justify-content: center; background: #111; padding: 16px; box-sizing: border-box; }
            .ppm-modal { width: min(600px, 100%); height: 319px; background: linear-gradient(180deg, #333333 0%, #2b2b2b 100%); border: 1px solid #3a3a3a; border-radius: 8px; color: #e6e6e6; display: flex; flex-direction: column; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55); }
            .ppm-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; margin-top: 30px; margin-bottom: 20px; }
            .ppm-text { margin: 0; color: #c0c0c0; font-size: 13px; line-height: 1.7; }
            .ppm-row { display: flex; align-items: center; gap: 16px; }
            .ppm-bar { width: 300px; height: 8px; border-radius: 4px; background: #1a1a1a; border: 1px solid #3a3a3a; overflow: hidden; }
            .ppm-fill { height: 100%; background: linear-gradient(90deg, #1e92ff 0%, #4da6ff 100%); width: 65%; transition: width 0.3s ease; }
            .ppm-percent { min-width: 40px; color: #8a8a8a; font-size: 13px; }
            .ppm-actions { padding: 14px 20px 18px; display: flex; justify-content: flex-end; }
            .ppm-btn { min-width: 88px; height: 32px; border-radius: 4px; border: 1px solid #575757; background: #3f3f3f; color: #d2d2d2; cursor: pointer; font-size: 13px; font-weight: 500; }
        `;
        document.head.appendChild(style);
    }

    show() {
        if (this.root) return;
        this.root = document.createElement('div');
        this.root.className = 'ppm-wrap';
        this.root.innerHTML = `
            <div class="ppm-modal" role="dialog" aria-modal="false" aria-label="提示-进度条类">
                <div class="ppm-main">
                    <p class="ppm-text">正在备份数据...</p>
                    <div class="ppm-row">
                        <div class="ppm-bar"><div class="ppm-fill"></div></div>
                        <div class="ppm-percent">65%</div>
                    </div>
                </div>
                <div class="ppm-actions">
                    <button type="button" class="ppm-btn">取消</button>
                </div>
            </div>
        `;
        (this.options.mountContainer || document.body).appendChild(this.root);
        this.startProgressAnimation();
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
