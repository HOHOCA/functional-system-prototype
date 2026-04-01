class ProtonCreatePlanComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            onConfirm: null,
            onCancel: null,
            defaultValues: null,
            ...options
        };
        this.modalEl = null;
        this._boundEscHandler = this.handleEsc.bind(this);
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('proton-create-plan-styles')) return;
        const style = document.createElement('style');
        style.id = 'proton-create-plan-styles';
        style.textContent = `
            .pcp-mask{
                position: fixed;
                inset: 0;
                z-index: 10070;
                background: rgba(0,0,0,0.68);
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Microsoft YaHei', 'PingFang SC', -apple-system, sans-serif;
                color: #ddd;
                font-size: 13px;
            }
            .pcp-mask.embedded{
                position: absolute;
            }
            .pcp-mask.embedded .pcp-dialog{
                width: calc(100% - 8px);
                height: calc(100% - 8px);
                max-width: none;
                max-height: none;
                border-radius: 4px;
            }
            .pcp-dialog{
                width: min(980px, calc(100vw - 48px));
                height: min(720px, calc(100vh - 48px));
                background: #1f1f1f;
                border: 1px solid #3f3f3f;
                border-radius: 6px;
                box-shadow: 0 12px 28px rgba(0,0,0,0.45);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .pcp-header{
                height: 44px;
                border-bottom: 1px solid #383838;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 12px 0 14px;
                background: #262626;
                flex-shrink: 0;
            }
            .pcp-header h3{
                margin: 0;
                font-size: 16px;
                color: #f0f0f0;
                font-weight: 500;
            }
            .pcp-close{
                border: none;
                background: transparent;
                color: #a8a8a8;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .pcp-close:hover{
                background: rgba(255,255,255,0.08);
                color: #fff;
            }
            .pcp-body{
                flex: 1;
                min-height: 0;
                overflow: auto;
                padding: 12px 14px 14px;
                background: #232323;
                display: flex;
                flex-direction: column;
                gap: 14px;
            }
            /* 横线居中标题（与系统截图一致） */
            .pcp-section-divider{
                display: flex;
                align-items: center;
                gap: 12px;
                margin: 2px 0 10px;
                color: #c8c8c8;
                font-size: 13px;
                font-weight: 500;
            }
            .pcp-section-divider::before,
            .pcp-section-divider::after{
                content: "";
                flex: 1;
                height: 1px;
                background: #3a3a3a;
            }
            .pcp-section-divider span{
                flex-shrink: 0;
            }
            .pcp-beam-tab-bar{
                display: flex;
                align-items: flex-end;
                border-bottom: 1px solid #3a3a3a;
                margin-bottom: 0;
                padding: 0 2px;
            }
            .pcp-tab-item{
                padding: 8px 14px 6px;
                margin-bottom: -1px;
                font-size: 13px;
                color: #b0b0b0;
                border: 1px solid transparent;
                border-bottom: none;
                border-radius: 3px 3px 0 0;
                background: transparent;
                cursor: default;
            }
            .pcp-tab-item.is-active{
                color: #e8e8e8;
                font-weight: 500;
                border-color: #404040;
                border-bottom: 2px solid #3aacde;
                background: #2a2a2a;
            }
            .pcp-inner-panel{
                background: #1e1e1e;
                border: 1px solid #3d3d3d;
                border-radius: 3px;
                padding: 12px 12px 10px;
                margin-top: 0;
            }
            .pcp-inner-panel .pcp-section-divider{
                margin-top: 4px;
            }
            .pcp-inner-panel .pcp-section-divider:first-child{
                margin-top: 0;
            }
            .pcp-form-block{
                margin-bottom: 4px;
            }
            .pcp-form-row{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px 20px;
                align-items: center;
                margin-bottom: 10px;
            }
            .pcp-form-row:last-child{
                margin-bottom: 0;
            }
            .pcp-form-row.is-full{
                grid-template-columns: 1fr;
            }
            .pcp-cell{
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
            }
            .pcp-cell.is-stack-right{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px 12px;
                align-items: center;
            }
            .pcp-cell.is-stack-right .pcp-mini-fields{
                display: contents;
            }
            .pcp-mini-field{
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
            }
            .pcp-mini-field .pcp-label{
                min-width: 72px;
            }
            .pcp-grid-2{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px 14px;
            }
            .pcp-grid-1{
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
            }
            .pcp-row{
                display: grid;
                grid-template-columns: 100px 1fr;
                gap: 10px;
                align-items: center;
            }
            .pcp-row.is-span-2{
                grid-column: 1 / -1;
            }
            .pcp-label{
                color: #cfcfcf;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: right;
                flex-shrink: 0;
                min-width: 72px;
            }
            .pcp-cell .pcp-label{
                min-width: 56px;
                width: auto;
            }
            .pcp-row .pcp-label{
                width: 100px;
                min-width: 100px;
            }
            .pcp-label.required::before{
                content: "*";
                color: #f35b5b;
                margin-right: 2px;
            }
            .pcp-control{
                height: 30px;
                border: 1px solid #3b3b3b;
                background: #141414;
                color: #f0f0f0;
                border-radius: 4px;
                padding: 0 10px;
                outline: none;
                font-size: 12px;
                font-family: inherit;
                width: 100%;
                min-width: 0;
            }
            .pcp-control:disabled{
                background: #1a1a1a;
                color: #cfcfcf;
                cursor: not-allowed;
                opacity: 1;
            }
            input.pcp-control[type="number"]{
                -moz-appearance: textfield;
                appearance: textfield;
            }
            input.pcp-control[type="number"]::-webkit-outer-spin-button,
            input.pcp-control[type="number"]::-webkit-inner-spin-button{
                -webkit-appearance: none;
                margin: 0;
            }
            .pcp-control:focus{
                border-color: #3aacde;
                box-shadow: 0 0 0 2px rgba(58,172,222,0.12);
            }
            .pcp-control[readonly]{
                background: #1a1a1a;
                color: #cfcfcf;
            }
            select.pcp-control{
                appearance: none;
                background-image:
                    linear-gradient(45deg, transparent 50%, #777 50%),
                    linear-gradient(135deg, #777 50%, transparent 50%);
                background-position:
                    calc(100% - 14px) 11px,
                    calc(100% - 9px) 11px;
                background-size: 5px 5px, 5px 5px;
                background-repeat: no-repeat;
                padding-right: 22px;
            }
            .pcp-textarea{
                height: 30px;
                padding-top: 6px;
                padding-bottom: 6px;
                resize: none;
                overflow: hidden;
                line-height: 1.4;
                flex: 1;
                min-width: 0;
            }
            .pcp-textarea::-webkit-scrollbar{
                width: 0;
                height: 0;
            }
            .pcp-full-desc-row{
                display: flex;
                align-items: flex-start;
                gap: 8px;
                margin-bottom: 10px;
            }
            .pcp-full-desc-row .pcp-label{
                padding-top: 7px;
                width: 56px;
                min-width: 56px;
            }
            .pcp-dose-grid{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px 14px;
            }
            .pcp-dose-grid .pcp-row.pcp-dose-single{
                grid-column: 1;
            }
            .pcp-inline{
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
            }
            .pcp-inline .pcp-control{
                flex: 1;
            }
            .pcp-unit{
                color: #a6a6a6;
                flex-shrink: 0;
            }
            .pcp-target-row{
                display: flex;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
            }
            .pcp-target-row .pcp-control{
                max-width: 220px;
                flex: 1;
                min-width: 140px;
            }
            .pcp-radio-row{
                display: flex;
                align-items: center;
                gap: 14px;
            }
            .pcp-radio{
                display: inline-flex;
                align-items: center;
                gap: 6px;
                color: #d7d7d7;
                font-size: 12px;
                user-select: none;
            }
            .pcp-radio input{
                accent-color: #3aacde;
            }
            .pcp-footer{
                border-top: 1px solid #383838;
                height: 56px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 10px;
                padding: 0 14px;
                background: #262626;
                flex-shrink: 0;
            }
            .pcp-btn{
                min-width: 92px;
                height: 34px;
                border-radius: 4px;
                border: 1px solid #8a8a8a;
                background: transparent;
                color: #eaeaea;
                cursor: pointer;
                font-family: inherit;
            }
            .pcp-btn:hover{
                background: rgba(255,255,255,0.06);
            }
            .pcp-btn.primary{
                border-color: #3aacde;
                background: #2a9dd0;
                color: #fff;
            }
            .pcp-btn.primary:hover{
                background: #33addf;
            }
            .pcp-error{
                color: #f35b5b;
                font-size: 12px;
                margin-top: 6px;
                display: none;
            }
            .pcp-error.show{
                display: block;
            }
        `;
        document.head.appendChild(style);
    }

    getDefaultValues() {
        const defaults = {
            planName: 'plan123',
            designer: 'manteia',
            planImage: 'CT 1',
            structure: 'RTSTRUCT 1',
            patientPosition: 'Head First-Supine',
            planDescription: '',

            groupName: 'Group 1',
            beamType: 'PROTON',
            machine: 'ProBeam_TR3',
            technique: 'PBS',
            groupDescription: '',
            toleranceTable: 'T1',

            totalDosePhy: 4545.0,
            totalDoseRbe: 4999.5,
            rbeFactor: 1.1,
            fractions: 20,
            fractionDoseRbe: 249.97,

            targetMode: 'ROI',
            targetRoi: 'CTV1'
        };
        const merged = {
            ...defaults,
            ...(this.options.defaultValues || {})
        };
        if (merged.toleranceTable == null && merged.referenceTable != null) {
            merged.toleranceTable = merged.referenceTable;
        }
        return merged;
    }

    show() {
        if (this.modalEl) return;
        const values = this.getDefaultValues();
        this.modalEl = document.createElement('div');
        this.modalEl.className = 'pcp-mask';

        const mountContainer = this.options.mountContainer || document.body;
        if (mountContainer !== document.body) {
            this.modalEl.classList.add('embedded');
            if (getComputedStyle(mountContainer).position === 'static') {
                mountContainer.style.position = 'relative';
            }
        }

        this.modalEl.innerHTML = `
            <div class="pcp-dialog" role="dialog" aria-modal="true" aria-label="新建计划">
                <div class="pcp-header">
                    <h3>新建计划</h3>
                    <button class="pcp-close" data-role="close" aria-label="关闭">
                        <i class="fas fa-times" style="font-size:14px;"></i>
                    </button>
                </div>
                <div class="pcp-body">
                    <div class="pcp-form-block">
                        <div class="pcp-section-divider"><span>基本信息</span></div>
                        <div class="pcp-form-row">
                            <div class="pcp-cell">
                                <div class="pcp-label required">名称</div>
                                <input class="pcp-control" id="pcpPlanName" value="${this.escapeAttr(values.planName)}" />
                            </div>
                            <div class="pcp-cell is-stack-right">
                                <div class="pcp-mini-field">
                                    <div class="pcp-label required">计划图像</div>
                                    <select class="pcp-control" id="pcpPlanImage">
                                        ${this.renderOptions(['CT 1', 'CT 2', 'CT 3'], values.planImage)}
                                    </select>
                                </div>
                                <div class="pcp-mini-field">
                                    <div class="pcp-label required">勾画</div>
                                    <select class="pcp-control" id="pcpStructure">
                                        ${this.renderOptions(['RTSTRUCT 1', 'RTSTRUCT 2'], values.structure)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="pcp-form-row">
                            <div class="pcp-cell">
                                <div class="pcp-label required">设计者</div>
                                <input class="pcp-control" id="pcpDesigner" value="${this.escapeAttr(values.designer)}" />
                            </div>
                            <div class="pcp-cell">
                                <div class="pcp-label required">患者摆位</div>
                                <select class="pcp-control" id="pcpPatientPosition" disabled>
                                    ${this.renderOptions(['Head First-Supine', 'Head First-Prone', 'Feet First-Supine', 'Feet First-Prone'], values.patientPosition)}
                                </select>
                            </div>
                        </div>
                        <div class="pcp-full-desc-row">
                            <div class="pcp-label">描述</div>
                            <textarea class="pcp-control pcp-textarea" id="pcpPlanDescription">${this.escapeHtml(values.planDescription)}</textarea>
                        </div>
                        <div class="pcp-error" id="pcpPlanError">请填写必填项</div>
                    </div>

                    <div class="pcp-form-block">
                        <div class="pcp-beam-tab-bar">
                            <div class="pcp-tab-item is-active" role="tab" aria-selected="true">射束组-1</div>
                        </div>
                        <div class="pcp-inner-panel">
                            <div class="pcp-section-divider"><span>基本信息</span></div>
                            <div class="pcp-form-row">
                                <div class="pcp-cell">
                                    <div class="pcp-label required">名称</div>
                                    <input class="pcp-control" id="pcpGroupName" value="${this.escapeAttr(values.groupName)}" readonly />
                                </div>
                                <div class="pcp-cell">
                                    <div class="pcp-label required">治疗机</div>
                                    <select class="pcp-control" id="pcpMachine">
                                        ${this.renderOptions(['ProBeam_TR3', 'ProBeam_TR2', 'ProBeam_TR1'], values.machine)}
                                    </select>
                                </div>
                            </div>
                            <div class="pcp-form-row">
                                <div class="pcp-cell">
                                    <div class="pcp-label required">辐射类型</div>
                                    <select class="pcp-control" id="pcpBeamType">
                                        ${this.renderOptions(['PROTON', 'PHOTON'], values.beamType)}
                                    </select>
                                </div>
                                <div class="pcp-cell">
                                    <div class="pcp-label required">技术</div>
                                    <select class="pcp-control" id="pcpTechnique">
                                        ${this.renderOptions(['PBS', 'DS', 'SFO', 'MFO'], values.technique)}
                                    </select>
                                </div>
                            </div>
                            <div class="pcp-full-desc-row">
                                <div class="pcp-label">描述</div>
                                <textarea class="pcp-control pcp-textarea" id="pcpGroupDescription">${this.escapeHtml(values.groupDescription)}</textarea>
                            </div>
                            <div class="pcp-form-row is-full">
                                <div class="pcp-cell" style="width:100%; gap:10px;">
                                    <div class="pcp-label required">容差表</div>
                                    <select class="pcp-control" id="pcpToleranceTable" style="flex:1; min-width:0;">
                                        ${this.renderOptions(['T1', 'T2', 'T3'], values.toleranceTable)}
                                    </select>
                                </div>
                            </div>

                            <div class="pcp-section-divider"><span>目标剂量</span></div>
                            <div class="pcp-dose-grid">
                                <div class="pcp-row">
                                    <div class="pcp-label required">总剂量(PHY)</div>
                                    <div class="pcp-inline">
                                        <input class="pcp-control" id="pcpTotalDosePhy" type="number" step="0.01" value="${this.escapeAttr(values.totalDosePhy)}" />
                                        <span class="pcp-unit">cGy</span>
                                    </div>
                                </div>
                                <div class="pcp-row">
                                    <div class="pcp-label">RBE因子</div>
                                    <div class="pcp-inline">
                                        <input class="pcp-control" id="pcpRbeFactor" type="number" step="0.01" value="${this.escapeAttr(values.rbeFactor)}" readonly />
                                    </div>
                                </div>
                                <div class="pcp-row">
                                    <div class="pcp-label required">总剂量(RBE)</div>
                                    <div class="pcp-inline">
                                        <input class="pcp-control" id="pcpTotalDoseRbe" type="number" step="0.01" value="${this.escapeAttr(values.totalDoseRbe)}" />
                                        <span class="pcp-unit">cGy</span>
                                    </div>
                                </div>
                                <div class="pcp-row">
                                    <div class="pcp-label required">分次数</div>
                                    <div class="pcp-inline">
                                        <input class="pcp-control" id="pcpFractions" type="number" step="1" value="${this.escapeAttr(values.fractions)}" />
                                    </div>
                                </div>
                                <div class="pcp-row pcp-dose-single">
                                    <div class="pcp-label required">分次剂量(RBE)</div>
                                    <div class="pcp-inline">
                                        <input class="pcp-control" id="pcpFractionDoseRbe" type="number" step="0.01" value="${this.escapeAttr(values.fractionDoseRbe)}" readonly />
                                        <span class="pcp-unit">cGy</span>
                                    </div>
                                </div>
                            </div>

                            <div class="pcp-section-divider"><span>目标靶区</span></div>
                            <div class="pcp-target-row">
                                <label class="pcp-radio"><input type="radio" name="pcp-target-mode" value="ROI" ${values.targetMode === 'ROI' ? 'checked' : ''} />ROI</label>
                                <select class="pcp-control" id="pcpTargetRoi">
                                    ${this.renderOptions(['CTV1', 'CTV2', 'PTV', 'GTV'], values.targetRoi)}
                                </select>
                            </div>
                            <div class="pcp-error" id="pcpGroupError">请填写射束组必填项</div>
                        </div>
                    </div>
                </div>
                <div class="pcp-footer">
                    <button class="pcp-btn" data-role="cancel">取消</button>
                    <button class="pcp-btn primary" data-role="confirm">确定</button>
                </div>
            </div>
        `;

        mountContainer.appendChild(this.modalEl);
        this.bindEvents();
        window.addEventListener('keydown', this._boundEscHandler);

        // 初始聚焦
        setTimeout(() => this.modalEl?.querySelector('#pcpPlanName')?.focus(), 0);
    }

    bindEvents() {
        if (!this.modalEl) return;
        const close = this.modalEl.querySelector('[data-role="close"]');
        const cancel = this.modalEl.querySelector('[data-role="cancel"]');
        const confirm = this.modalEl.querySelector('[data-role="confirm"]');

        const getEl = (id) => this.modalEl?.querySelector(`#${id}`);
        const parseNum = (el) => {
            if (!el) return NaN;
            const raw = (el.value ?? '').toString().trim();
            const parsed = Number.parseFloat(raw);
            return Number.isFinite(parsed) ? parsed : NaN;
        };
        const parseIntSafe = (el) => {
            if (!el) return NaN;
            const raw = (el.value ?? '').toString().trim();
            const parsed = Number.parseInt(raw, 10);
            return Number.isFinite(parsed) ? parsed : NaN;
        };
        const format2 = (n) => (Number.isFinite(n) ? (Math.round(n * 100) / 100).toFixed(2) : '');

        const doCancel = () => {
            this.hide();
            if (typeof this.options.onCancel === 'function') this.options.onCancel();
        };

        close?.addEventListener('click', doCancel);
        cancel?.addEventListener('click', doCancel);

        confirm?.addEventListener('click', () => {
            const result = this.getFormData();
            if (!result) return;
            this.hide();
            if (typeof this.options.onConfirm === 'function') this.options.onConfirm(result);
        });

        // 点击遮罩关闭（仅 body 模式）
        this.modalEl.addEventListener('click', (e) => {
            if (!this.modalEl) return;
            if (e.target === this.modalEl && this.options.mountContainer === document.body) {
                doCancel();
            }
        });

        // 去掉 number 输入框滚轮/箭头导致的数值变化
        this.modalEl.querySelectorAll('input.pcp-control[type="number"]').forEach((input) => {
            input.addEventListener(
                'wheel',
                (e) => {
                    if (document.activeElement === input) e.preventDefault();
                },
                { passive: false }
            );
            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
            });
        });

        // 自动计算：分次剂量(RBE) = 总剂量(RBE) / 分次数
        const totalDoseRbeEl = getEl('pcpTotalDoseRbe');
        const fractionsEl = getEl('pcpFractions');
        const fractionDoseRbeEl = getEl('pcpFractionDoseRbe');
        const updateFractionDose = () => {
            const total = parseNum(totalDoseRbeEl);
            const fr = parseIntSafe(fractionsEl);
            if (!fractionDoseRbeEl) return;
            if (Number.isFinite(total) && Number.isFinite(fr) && fr > 0) {
                fractionDoseRbeEl.value = format2(total / fr);
            } else {
                fractionDoseRbeEl.value = '';
            }
        };
        totalDoseRbeEl?.addEventListener('input', updateFractionDose);
        fractionsEl?.addEventListener('input', updateFractionDose);
        updateFractionDose();
    }

    handleEsc(event) {
        if (event.key === 'Escape') {
            this.hide();
            if (typeof this.options.onCancel === 'function') this.options.onCancel();
        }
    }

    markError(showPlanError, showGroupError) {
        const planErr = this.modalEl?.querySelector('#pcpPlanError');
        const groupErr = this.modalEl?.querySelector('#pcpGroupError');
        if (planErr) planErr.classList.toggle('show', Boolean(showPlanError));
        if (groupErr) groupErr.classList.toggle('show', Boolean(showGroupError));
    }

    getFormData() {
        if (!this.modalEl) return null;
        const v = (id) => {
            const el = this.modalEl.querySelector(`#${id}`);
            if (!el) return '';
            if (el.tagName === 'TEXTAREA') return (el.value ?? '').trim();
            return (el.value ?? '').trim();
        };
        const n = (id, fallback) => {
            const raw = v(id);
            const parsed = Number.parseFloat(raw);
            return Number.isFinite(parsed) ? parsed : fallback;
        };
        const planName = v('pcpPlanName');
        const designer = v('pcpDesigner');
        const planImage = v('pcpPlanImage');
        const structure = v('pcpStructure');
        const patientPosition = v('pcpPatientPosition');

        const groupName = v('pcpGroupName');
        const beamType = v('pcpBeamType');
        const machine = v('pcpMachine');
        const technique = v('pcpTechnique');
        const toleranceTable = v('pcpToleranceTable');

        const totalDosePhy = n('pcpTotalDosePhy', NaN);
        const totalDoseRbe = n('pcpTotalDoseRbe', NaN);
        const fractionDoseRbe = n('pcpFractionDoseRbe', NaN);
        const fractionsRaw = v('pcpFractions');
        const fractionsParsed = Number.parseInt(fractionsRaw, 10);
        const fractionsOk = Number.isFinite(fractionsParsed) && fractionsParsed >= 1;

        const doseCoreOk =
            Number.isFinite(totalDosePhy) &&
            Number.isFinite(totalDoseRbe) &&
            Number.isFinite(fractionDoseRbe) &&
            fractionsOk;

        const requiredPlanOk = Boolean(planName && designer && planImage && structure && patientPosition);
        const requiredGroupOk = Boolean(
            groupName &&
            beamType &&
            machine &&
            technique &&
            toleranceTable &&
            doseCoreOk
        );
        this.markError(!requiredPlanOk, !requiredGroupOk);
        if (!requiredPlanOk || !requiredGroupOk) return null;

        const targetModeEl = this.modalEl.querySelector('input[name="pcp-target-mode"]:checked');
        const targetMode = targetModeEl ? targetModeEl.value : 'ROI';

        const data = {
            plan: {
                name: planName,
                designer,
                image: planImage,
                structure,
                patientPosition,
                description: v('pcpPlanDescription')
            },
            group: {
                name: groupName,
                beamType,
                machine,
                technique,
                description: v('pcpGroupDescription'),
                toleranceTable
            },
            dose: {
                totalDosePhy,
                totalDoseRbe,
                rbeFactor: n('pcpRbeFactor', 1.1),
                fractions: fractionsParsed,
                fractionDoseRbe
            },
            target: {
                mode: targetMode,
                roi: v('pcpTargetRoi')
            }
        };

        // 轻量归一化：保持 2 位小数输出
        const round2 = (x) => (Number.isFinite(x) ? Number(x.toFixed(2)) : x);
        data.dose.totalDosePhy = round2(data.dose.totalDosePhy);
        data.dose.totalDoseRbe = round2(data.dose.totalDoseRbe);
        data.dose.rbeFactor = round2(data.dose.rbeFactor);
        data.dose.fractionDoseRbe = round2(data.dose.fractionDoseRbe);
        data.dose.fractions = Math.max(1, Math.round(data.dose.fractions || 1));

        return data;
    }

    hide() {
        if (!this.modalEl) return;
        window.removeEventListener('keydown', this._boundEscHandler);
        this.modalEl.remove();
        this.modalEl = null;
    }

    destroy() {
        this.hide();
    }

    renderOptions(options, selected) {
        const sel = String(selected ?? '');
        return (Array.isArray(options) ? options : []).map((opt) => {
            const v = String(opt);
            const isSel = v === sel ? 'selected' : '';
            return `<option value="${this.escapeAttr(v)}" ${isSel}>${this.escapeHtml(v)}</option>`;
        }).join('');
    }

    escapeAttr(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    escapeHtml(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }
}

if (typeof window !== 'undefined') {
    window.ProtonCreatePlanComponent = ProtonCreatePlanComponent;
}

