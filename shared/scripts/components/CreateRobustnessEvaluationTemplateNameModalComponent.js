// 创建鲁棒性评估模板 — 仅组名输入（保存流程原型弹窗）
class CreateRobustnessEvaluationTemplateNameModalComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            defaultGroupName: '',
            onConfirm: null,
            onCancel: null,
            /** 与加载模板弹窗构造参数一致时传入，用于与自定义 templates 去重 */
            existingTemplateListOptions: null,
            ...options
        };
        this.modalEl = null;
        this._dupTipEl = null;
        this._boundEsc = this._onEsc.bind(this);
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('create-robustness-eval-template-name-styles')) return;
        const style = document.createElement('style');
        style.id = 'create-robustness-eval-template-name-styles';
        style.textContent = `
            .crtn-mask{
                position: fixed;
                inset: 0;
                z-index: 10063;
                background: rgba(0,0,0,0.68);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .crtn-dialog{
                width: min(420px, calc(100vw - 32px));
                background: #1f1f1f;
                border: 1px solid #3f3f3f;
                border-radius: 6px;
                box-shadow: 0 12px 28px rgba(0,0,0,0.45);
                color: #e8e8e8;
                font-size: 13px;
                overflow: hidden;
            }
            .crtn-header{
                height: 42px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 12px 0 14px;
                background: #262626;
                border-bottom: 1px solid #383838;
            }
            .crtn-header h3{
                margin: 0;
                font-size: 16px;
                font-weight: 500;
                color: #f0f0f0;
            }
            .crtn-close{
                border: none;
                background: transparent;
                color: #a8a8a8;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
            }
            .crtn-close:hover{
                background: rgba(255,255,255,0.08);
                color: #fff;
            }
            .crtn-body{
                padding: 18px 14px 20px;
                background: #232323;
            }
            .crtn-row{
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .crtn-label{
                flex-shrink: 0;
                width: 48px;
                color: #e8e8e8;
            }
            .crtn-input{
                flex: 1;
                min-width: 0;
                height: 32px;
                border: 1px solid #3b3b3b;
                background: #141414;
                color: #f0f0f0;
                border-radius: 4px;
                padding: 0 10px;
                outline: none;
                font-size: 13px;
            }
            .crtn-input:focus{
                border-color: #3aacde;
            }
            .crtn-footer{
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 12px 14px;
                background: #262626;
                border-top: 1px solid #383838;
            }
            .crtn-btn{
                min-width: 80px;
                height: 32px;
                padding: 0 14px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
                border: 1px solid #6b6b6b;
                background: transparent;
                color: #fff;
            }
            .crtn-btn:hover{
                background: rgba(255,255,255,0.06);
            }
            .crtn-btn.primary{
                border-color: #3aacde;
                background: #2a9dd0;
                color: #fff;
            }
            .crtn-btn.primary:hover{
                background: #33addf;
            }
            .crtn-dup-mask{
                position: fixed;
                inset: 0;
                z-index: 10064;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .crtn-dup-dialog{
                width: min(380px, calc(100vw - 48px));
                background: #1f1f1f;
                border: 1px solid #3f3f3f;
                border-radius: 6px;
                box-shadow: 0 12px 28px rgba(0,0,0,0.45);
                overflow: hidden;
            }
            .crtn-dup-head{
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                padding: 0 6px 0 14px;
                background: #262626;
                border-bottom: 1px solid #383838;
            }
            .crtn-dup-body{
                padding: 28px 20px 32px;
                background: #232323;
                text-align: center;
                color: #f0f0f0;
                font-size: 14px;
                line-height: 1.55;
            }
            .crtn-dup-footer{
                padding: 12px 14px;
                background: #262626;
                border-top: 1px solid #383838;
                display: flex;
                justify-content: flex-end;
            }
        `;
        document.head.appendChild(style);
    }

    _removeDuplicateNameTip() {
        if (!this._dupTipEl) return;
        this._dupTipEl.remove();
        this._dupTipEl = null;
    }

    _showDuplicateNameTip() {
        this._removeDuplicateNameTip();
        const mask = document.createElement('div');
        mask.className = 'crtn-dup-mask';
        mask.setAttribute('role', 'presentation');
        mask.innerHTML = `
            <div class="crtn-dup-dialog" role="alertdialog" aria-modal="true" aria-labelledby="crtnDupMsg">
                <div class="crtn-dup-head">
                    <button type="button" class="crtn-close" data-dup-role="close" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="crtn-dup-body" id="crtnDupMsg">已存在相同组名的模板！</div>
                <div class="crtn-dup-footer">
                    <button type="button" class="crtn-btn primary" data-dup-role="ok">确定</button>
                </div>
            </div>
        `;
        const dismiss = () => this._removeDuplicateNameTip();
        mask.querySelector('[data-dup-role="close"]').addEventListener('click', dismiss);
        mask.querySelector('[data-dup-role="ok"]').addEventListener('click', dismiss);
        mask.addEventListener('click', (e) => {
            if (e.target === mask) dismiss();
        });
        document.body.appendChild(mask);
        this._dupTipEl = mask;
        const okBtn = mask.querySelector('[data-dup-role="ok"]');
        setTimeout(() => okBtn && okBtn.focus(), 0);
    }

    show() {
        if (this.modalEl) return;
        const initial = String(this.options.defaultGroupName ?? '');

        this.modalEl = document.createElement('div');
        this.modalEl.className = 'crtn-mask';
        this.modalEl.innerHTML = `
            <div class="crtn-dialog" role="dialog" aria-modal="true" aria-labelledby="crtnTitle">
                <div class="crtn-header">
                    <h3 id="crtnTitle">创建鲁棒性评估模板</h3>
                    <button type="button" class="crtn-close" data-role="close" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="crtn-body">
                    <div class="crtn-row">
                        <label class="crtn-label" for="crtnGroupName">组名</label>
                        <input type="text" class="crtn-input" id="crtnGroupName" value="${this._escapeAttr(initial)}" autocomplete="off" />
                    </div>
                </div>
                <div class="crtn-footer">
                    <button type="button" class="crtn-btn" data-role="cancel">取消</button>
                    <button type="button" class="crtn-btn primary" data-role="confirm">确定</button>
                </div>
            </div>
        `;

        const mount = this.options.mountContainer || document.body;
        mount.appendChild(this.modalEl);

        const input = this.modalEl.querySelector('#crtnGroupName');
        const close = () => this._cancel();

        this.modalEl.querySelector('[data-role="close"]').addEventListener('click', close);
        this.modalEl.querySelector('[data-role="cancel"]').addEventListener('click', close);
        this.modalEl.querySelector('[data-role="confirm"]').addEventListener('click', () => {
            const groupName = (input && input.value) ? input.value.trim() : '';
            if (!groupName) {
                alert('请输入组名');
                return;
            }
            const existing =
                typeof window.LoadRobustnessEvaluationTemplateModalComponent !== 'undefined'
                    ? window.LoadRobustnessEvaluationTemplateModalComponent.getExistingTemplateGroupNames(
                          this.options.existingTemplateListOptions
                      )
                    : (() => {
                          const names = new Set(['1']);
                          const raw = window.__lrtDemoSaveTemplates;
                          if (Array.isArray(raw)) {
                              raw.forEach((t) => {
                                  const n = String(t.groupName ?? '').trim();
                                  if (n) names.add(n);
                              });
                          }
                          return names;
                      })();
            if (existing.has(groupName)) {
                this._showDuplicateNameTip();
                return;
            }
            if (typeof this.options.onConfirm === 'function') {
                this.options.onConfirm({ groupName });
            }
            this._closeOnly();
        });

        this.modalEl.addEventListener('click', (e) => {
            if (e.target === this.modalEl) close();
        });

        window.addEventListener('keydown', this._boundEsc);
        setTimeout(() => input && input.focus(), 0);
    }

    _onEsc(e) {
        if (e.key !== 'Escape') return;
        if (this._dupTipEl) {
            this._removeDuplicateNameTip();
            return;
        }
        this._cancel();
    }

    _cancel() {
        if (typeof this.options.onCancel === 'function') {
            this.options.onCancel();
        }
        this._closeOnly();
    }

    _closeOnly() {
        this._removeDuplicateNameTip();
        if (!this.modalEl) return;
        window.removeEventListener('keydown', this._boundEsc);
        this.modalEl.remove();
        this.modalEl = null;
    }

    hide() {
        this._closeOnly();
    }

    _escapeAttr(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

if (typeof window !== 'undefined') {
    window.CreateRobustnessEvaluationTemplateNameModalComponent = CreateRobustnessEvaluationTemplateNameModalComponent;
}
