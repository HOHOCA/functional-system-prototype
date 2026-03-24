class PromptRichTextModalComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            ...options
        };
        this.root = null;
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('prompt-rich-text-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'prompt-rich-text-modal-styles';
        style.textContent = `
            .prtm-wrap {
                width: 100%;
                height: 100%;
                min-height: 420px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #111;
                padding: 16px;
                box-sizing: border-box;
            }
            .prtm-modal {
                width: min(480px, 100%);
                background: #2c2c2c;
                border: 1px solid #3a3a3a;
                border-radius: 8px;
                color: #e0e0e0;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            .prtm-header {
                padding: 14px 20px 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .prtm-title { margin: 0; font-size: 16px; font-weight: 500; color: #d7d7d7; }
            .prtm-close { color: #8a8a8a; font-size: 18px; line-height: 1; }
            .prtm-content { padding: 0 20px 24px; }
            .prtm-warning-row { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px; }
            .prtm-warning-text { margin: 0; color: #b0b0b0; font-size: 13px; font-weight: 400; }
            .prtm-table-wrap { background: #1a1a1a; border-radius: 4px; overflow: hidden; padding: 16px 16px 120px; }
            .prtm-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            .prtm-table th, .prtm-table td { border-bottom: 1px solid #3a3a3a; padding: 12px 16px; text-align: left; font-size: 13px; color: #c0c0c0; }
            .prtm-table th { background: #2a2a2a; color: #d2d2d2; font-weight: 500; }
            .prtm-actions { padding: 14px 20px 18px; display: flex; justify-content: flex-end; gap: 16px; }
            .prtm-btn { min-width: 88px; height: 32px; border-radius: 4px; border: 1px solid #575757; background: #3f3f3f; color: #d2d2d2; cursor: pointer; font-size: 13px; font-weight: 500; }
            .prtm-btn.primary { background: #2a9dd0; border-color: #3aacde; color: #fff; font-size: 13px; font-weight: 500; }
            .prtm-btn.primary:hover { background: #33addf; }
        `;
        document.head.appendChild(style);
    }

    show() {
        if (this.root) return;
        this.root = document.createElement('div');
        this.root.className = 'prtm-wrap';
        this.root.innerHTML = `
            <div class="prtm-modal" role="dialog" aria-modal="false" aria-label="提示-富文本类">
                <div class="prtm-header">
                    <h3 class="prtm-title">提示</h3>
                    <div class="prtm-close">×</div>
                </div>
                <div class="prtm-content">
                    <div class="prtm-warning-row">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="#E74C3C" stroke-width="2"></circle>
                            <path d="M12 7V12M12 16H12.01" stroke="#E74C3C" stroke-width="2" stroke-linecap="round"></path>
                        </svg>
                        <p class="prtm-warning-text">以下施源器重建发生重叠，是否取消剂量计算？</p>
                    </div>
                    <div class="prtm-table-wrap">
                        <table class="prtm-table">
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
                                    <td>通道4（NONE）、通道5（宫颈施源器）</td>
                                    <td>103, 104, 105, 106...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="prtm-actions">
                    <button type="button" class="prtm-btn">取消</button>
                    <button type="button" class="prtm-btn primary">确定</button>
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
    window.PromptRichTextModalComponent = PromptRichTextModalComponent;
}
