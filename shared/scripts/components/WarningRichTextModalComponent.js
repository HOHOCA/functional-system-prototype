class WarningRichTextModalComponent {
    constructor(options = {}) {
        this.options = { mountContainer: document.body, ...options };
        this.root = null;
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('warning-rich-text-modal-component-styles')) return;
        const style = document.createElement('style');
        style.id = 'warning-rich-text-modal-component-styles';
        style.textContent = `
            .wrtmc-wrap { width: 100%; height: 100%; min-height: 430px; display: flex; align-items: center; justify-content: center; background: #111; padding: 16px; box-sizing: border-box; }
            .wrtmc-modal { width: min(480px, 100%); background: #2c2c2c; border: 1px solid #3a3a3a; border-radius: 8px; color: #e0e0e0; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .wrtmc-header { padding: 14px 20px 12px; display: flex; align-items: center; justify-content: space-between; }
            .wrtmc-title { margin: 0; font-size: 16px; font-weight: 500; color: #d7d7d7; }
            .wrtmc-close { color: #8a8a8a; font-size: 18px; line-height: 1; }
            .wrtmc-content { padding: 0 20px 24px; }
            .wrtmc-warning-row { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px; }
            .wrtmc-warning-text { margin: 0; color: #b0b0b0; font-size: 13px; font-weight: 400; }
            .wrtmc-table-wrap { background: #1a1a1a; border-radius: 4px; overflow: hidden; padding: 16px 16px 120px; }
            .wrtmc-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            .wrtmc-table th, .wrtmc-table td { border-bottom: 1px solid #3a3a3a; padding: 12px 16px; text-align: left; font-size: 13px; color: #c0c0c0; }
            .wrtmc-table th { background: #2a2a2a; color: #d2d2d2; font-weight: 500; }
            .wrtmc-actions { padding: 14px 20px 18px; display: flex; justify-content: flex-end; gap: 16px; }
            .wrtmc-btn { min-width: 88px; height: 32px; border-radius: 4px; border: 1px solid #575757; background: #3f3f3f; color: #d2d2d2; cursor: pointer; font-size: 13px; font-weight: 500; }
            .wrtmc-btn.ignore { border-color: #E74C3C; background: #E74C3C; color: #fff; font-size: 13px; font-weight: 500; }
        `;
        document.head.appendChild(style);
    }

    show() {
        if (this.root) return;
        this.root = document.createElement('div');
        this.root.className = 'wrtmc-wrap';
        this.root.innerHTML = `
            <div class="wrtmc-modal" role="dialog" aria-modal="false" aria-label="警告-富文本类弹窗">
                <div class="wrtmc-header">
                    <h3 class="wrtmc-title">警告</h3>
                    <div class="wrtmc-close">×</div>
                </div>
                <div class="wrtmc-content">
                    <div class="wrtmc-warning-row">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="#E74C3C" stroke-width="2"></circle>
                            <path d="M12 7V12M12 16H12.01" stroke="#E74C3C" stroke-width="2" stroke-linecap="round"></path>
                        </svg>
                        <p class="wrtmc-warning-text">以下施源器重建发生重叠，实际治疗时可能碰撞，是否继续？</p>
                    </div>
                    <div class="wrtmc-table-wrap">
                        <table class="wrtmc-table">
                            <thead>
                                <tr>
                                    <th>重叠施源器</th>
                                    <th>重叠所在层次</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>通道1（NONE）、通道2（宫颈施源器）</td>
                                    <td>123, 124, 127, 128...</td>
                                </tr>
                                <tr>
                                    <td>通道4（NONE）、通道5（宫颈施源器）、通道6（多通道施源器）</td>
                                    <td>103, 104, 105, 106...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="wrtmc-actions">
                    <button type="button" class="wrtmc-btn">取消</button>
                    <button type="button" class="wrtmc-btn ignore">忽略</button>
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
    window.WarningRichTextModalComponent = WarningRichTextModalComponent;
}
