// 内嵌：复制「创建鲁棒性评估」弹窗（无时相不确定性、场景表无时相列），用于从加载模板弹窗新增模板
class LrtEmbeddedCreateRobustnessModal {
    constructor(options = {}) {
        this.options = {
            defaultGroupName: '鲁棒性评估',
            title: '创建新模板',
            onComplete: null,
            onCancel: null,
            ...options
        };
        this.el = null;
        this.scenarioRows = [];
        this._esc = (e) => {
            if (e.key === 'Escape') this._cancel();
        };
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('lrt-embedded-create-robustness-styles')) return;
        const style = document.createElement('style');
        style.id = 'lrt-embedded-create-robustness-styles';
        style.textContent = `
            .lrtc-eb-mask{
                position: fixed;
                inset: 0;
                z-index: 10062;
                background: rgba(0,0,0,0.72);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .lrtc-eb-dialog{
                width: min(1300px, calc(100vw - 48px));
                height: min(720px, calc(100vh - 48px));
                background: #1f1f1f;
                border: 1px solid #3f3f3f;
                border-radius: 6px;
                box-shadow: 0 12px 28px rgba(0,0,0,0.45);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                color: #ddd;
                font-size: 13px;
            }
            .lrtc-eb-header{
                height: 42px;
                border-bottom: 1px solid #383838;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 12px 0 14px;
                background: #262626;
                flex-shrink: 0;
            }
            .lrtc-eb-header h3{
                margin: 0;
                font-size: 16px;
                color: #f0f0f0;
                font-weight: 500;
            }
            .lrtc-eb-close{
                border: none;
                background: transparent;
                color: #a8a8a8;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
            }
            .lrtc-eb-close:hover{
                background: rgba(255,255,255,0.08);
                color: #fff;
            }
            .lrtc-eb-body{
                flex: 1;
                min-height: 0;
                display: grid;
                grid-template-columns: 48% 52%;
                gap: 10px;
                padding: 10px 12px;
                background: #232323;
            }
            .lrtc-eb-cre-left, .lrtc-eb-cre-right{
                min-height: 0;
                display: flex;
                flex-direction: column;
                background: #222;
                border: 1px solid #363636;
            }
            .lrtc-eb-cre-left{
                position: relative;
                padding-bottom: 46px;
            }
            .lrtc-eb-cre-section{
                border-bottom: 1px solid #333;
                padding: 10px 12px;
            }
            .lrtc-eb-cre-row{
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            .lrtc-eb-cre-row:last-child{ margin-bottom: 0; }
            .lrtc-eb-cre-label{
                width: 88px;
                color: #cfcfcf;
                flex-shrink: 0;
            }
            .lrtc-eb-cre-label.required::before{
                content: "*";
                color: #f35b5b;
                margin-right: 2px;
            }
            .lrtc-eb-cre-input{
                height: 30px;
                border: 1px solid #3b3b3b;
                background: #141414;
                color: #f0f0f0;
                border-radius: 4px;
                padding: 0 10px;
                outline: none;
            }
            .lrtc-eb-cre-input:focus{ border-color: #3aacde; }
            .lrtc-eb-dialog input[type="number"]::-webkit-outer-spin-button,
            .lrtc-eb-dialog input[type="number"]::-webkit-inner-spin-button{
                -webkit-appearance: none;
                margin: 0;
            }
            .lrtc-eb-dialog input[type="number"]{
                -moz-appearance: textfield;
                appearance: textfield;
            }
            .lrtc-eb-cre-input.name{ flex: 1; }
            .lrtc-eb-cre-input.short{ width: 96px; text-align: center; }
            .lrtc-eb-cre-unit{ color: #a6a6a6; }
            .lrtc-eb-cre-radio-group{
                display: flex;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
            }
            .lrtc-eb-cre-radio{
                display: inline-flex;
                align-items: center;
                gap: 5px;
                color: #d7d7d7;
            }
            .lrtc-eb-cre-radio input{ accent-color: #3aacde; }
            .lrtc-eb-cre-custom-count{
                width: 96px;
                height: 28px;
                border: 1px solid #3b3b3b;
                background: #141414;
                color: #f0f0f0;
                border-radius: 4px;
                text-align: center;
            }
            .lrtc-eb-cre-axis-area{
                padding: 10px 14px 12px;
                border-bottom: 1px solid #333;
            }
            .lrtc-eb-cre-axis-grid{
                margin-top: 6px;
                min-height: 230px;
                border: 1px dashed #3e3e3e;
                border-radius: 6px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #aaa;
            }
            .lrtc-eb-cre-human{
                width: 52px;
                height: 140px;
                position: relative;
            }
            .lrtc-eb-cre-human::before{
                content: "";
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: linear-gradient(180deg,#b0b0b0,#7e7e7e);
            }
            .lrtc-eb-cre-human::after{
                content: "";
                position: absolute;
                top: 24px;
                left: 50%;
                transform: translateX(-50%);
                width: 36px;
                height: 108px;
                border-radius: 18px;
                background: linear-gradient(180deg,#9a9a9a,#6f6f6f);
            }
            .lrtc-eb-cre-tag{
                position: absolute;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                color: #d6d6d6;
                font-size: 12px;
            }
            .lrtc-eb-cre-tag-value{
                min-width: 70px;
                height: 26px;
                border: 1px solid #3b3b3b;
                background: #121212;
                border-radius: 4px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0 6px;
                color: #fff;
            }
            .lrtc-eb-cre-tag.top{ top: 14px; left: 50%; transform: translateX(-50%); }
            .lrtc-eb-cre-tag.bottom{ bottom: 14px; left: 50%; transform: translateX(-50%); }
            .lrtc-eb-cre-tag.left{ left: 16px; top: 50%; transform: translateY(-50%); }
            .lrtc-eb-cre-tag.right{ right: 16px; top: 50%; transform: translateY(-50%); }
            .lrtc-eb-cre-tag.front{ left: 18px; bottom: 62px; }
            .lrtc-eb-cre-tag.back{ right: 18px; top: 62px; }
            .lrtc-eb-cre-tag.front .lrtc-eb-cre-dir,
            .lrtc-eb-cre-tag.back .lrtc-eb-cre-dir{ width: 24px; }
            .lrtc-eb-cre-density{ padding: 10px 12px; }
            .lrtc-eb-cre-right-head{
                height: 36px;
                display: flex;
                align-items: center;
                padding: 0 10px;
                border-bottom: 1px solid #333;
                color: #c9c9c9;
            }
            .lrtc-eb-cre-table-wrap{
                flex: 1;
                min-height: 0;
                overflow: auto;
            }
            .lrtc-eb-cre-table{
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }
            .lrtc-eb-cre-table th,
            .lrtc-eb-cre-table td{
                border-bottom: 1px solid #303030;
                border-right: 1px solid #303030;
                text-align: center;
                padding: 4px;
                height: 34px;
                color: #ddd;
            }
            .lrtc-eb-cre-table th:last-child,
            .lrtc-eb-cre-table td:last-child{ border-right: none; }
            .lrtc-eb-cre-table th{
                position: sticky;
                top: 0;
                z-index: 1;
                background: #232323;
                color: #cfcfcf;
                font-weight: 500;
            }
            .lrtc-eb-cre-cell-input{
                width: 100%;
                height: 24px;
                border: 1px solid #3a3a3a;
                background: #111;
                color: #fff;
                border-radius: 4px;
                text-align: center;
                font-size: 12px;
                padding: 0 4px;
            }
            .lrtc-eb-cre-del-btn{
                width: 24px;
                height: 24px;
                border: none;
                background: transparent;
                color: #46c3e8;
                cursor: pointer;
                border-radius: 4px;
            }
            .lrtc-eb-cre-del-btn:hover{ background: rgba(70,195,232,0.12); }
            .lrtc-eb-cre-right-toolbar{
                border-top: 1px solid #333;
                padding: 8px 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .lrtc-eb-cre-mini-btn{
                width: 24px;
                height: 24px;
                border: 1px solid #3a3a3a;
                background: #1a1a1a;
                color: #49c7ea;
                border-radius: 3px;
                cursor: pointer;
            }
            .lrtc-eb-cre-mini-btn:hover{ background: #212121; }
            .lrtc-eb-footer{
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
            .lrtc-eb-btn{
                min-width: 92px;
                height: 34px;
                border-radius: 4px;
                border: 1px solid #4d4d4d;
                background: #2b2b2b;
                color: #d8d8d8;
                cursor: pointer;
            }
            .lrtc-eb-btn:hover{ background: #343434; }
            .lrtc-eb-btn.primary{
                border-color: #3aacde;
                background: #2a9dd0;
                color: #fff;
            }
            .lrtc-eb-btn.primary:hover{ background: #33addf; }
            .lrtc-eb-cre-action-btn{
                height: 28px;
                border-radius: 4px;
                border: 1px solid #2f8bb6;
                background: #0f6f95;
                color: #dff6ff;
                cursor: pointer;
                padding: 0 10px;
                font-size: 12px;
                margin-right: 8px;
            }
            .lrtc-eb-cre-action-btn:hover{ background: #1384b1; }
            .lrtc-eb-cre-left-actions{
                position: absolute;
                right: 12px;
                bottom: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
        `;
        document.head.appendChild(style);
    }

    normalizeNumber(value, fallback) {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    getScenarioMode() {
        if (!this.el) return '12';
        const checked = this.el.querySelector('input[name="lrtc-eb-scenario-mode"]:checked');
        return checked ? checked.value : '12';
    }

    getTargetScenarioCount() {
        if (!this.el) return 12;
        const mode = this.getScenarioMode();
        if (mode === '12') return 12;
        if (mode === '21') return 21;
        const custom = this.el.querySelector('#lrtcEbCustomCount');
        const value = parseInt(custom && custom.value, 10);
        return Number.isFinite(value) ? Math.max(1, Math.min(81, value)) : 12;
    }

    to2(value) {
        return Number(value.toFixed(2));
    }

    generateRegularRows(count) {
        const root = this.el;
        const position = root
            ? this.normalizeNumber(root.querySelector('#lrtcEbPositionUncertainty').value, 0.5)
            : 0.5;
        const density = root
            ? this.normalizeNumber(root.querySelector('#lrtcEbDensityUncertainty').value, 3.5)
            : 3.5;

        const base = [
            { rl: position, is: 0, pa: 0 },
            { rl: position, is: 0, pa: 0 },
            { rl: 0, is: position, pa: 0 },
            { rl: 0, is: position, pa: 0 },
            { rl: 0, is: 0, pa: position },
            { rl: 0, is: 0, pa: position },
            { rl: -position, is: 0, pa: 0 },
            { rl: -position, is: 0, pa: 0 },
            { rl: 0, is: -position, pa: 0 },
            { rl: 0, is: -position, pa: 0 },
            { rl: 0, is: 0, pa: -position },
            { rl: 0, is: 0, pa: -position }
        ];

        const baseRows = [];
        for (let i = 0; i < count; i++) {
            const item = base[i % base.length];
            baseRows.push({
                rl: item.rl,
                is: item.is,
                pa: item.pa,
                density: i % 2 === 0 ? Math.abs(density) : -Math.abs(density)
            });
        }
        return baseRows;
    }

    generateRandomRows(count) {
        const root = this.el;
        const position = root
            ? this.normalizeNumber(root.querySelector('#lrtcEbPositionUncertainty').value, 0.5)
            : 0.5;
        const density = root
            ? this.normalizeNumber(root.querySelector('#lrtcEbDensityUncertainty').value, 3.5)
            : 3.5;
        const range = Math.abs(position);
        const den = Math.abs(density);
        const baseRows = [];
        for (let i = 0; i < count; i++) {
            baseRows.push({
                rl: this.to2((Math.random() * 2 - 1) * range),
                is: this.to2((Math.random() * 2 - 1) * range),
                pa: this.to2((Math.random() * 2 - 1) * range),
                density: this.to2((Math.random() * 2 - 1) * den)
            });
        }
        return baseRows;
    }

    refreshAxisTagValues() {
        if (!this.el) return;
        const value = this.normalizeNumber(this.el.querySelector('#lrtcEbPositionUncertainty').value, 0.5).toFixed(2);
        const text = `${value} cm`;
        ['lrtcEbTopTag', 'lrtcEbBottomTag', 'lrtcEbLeftTag', 'lrtcEbRightTag', 'lrtcEbFrontTag', 'lrtcEbBackTag'].forEach(
            (id) => {
                const el = this.el.querySelector(`#${id}`);
                if (el) el.textContent = text;
            }
        );
    }

    renderTable() {
        if (!this.el) return;
        const tbody = this.el.querySelector('#lrtcEbScenarioBody');
        const scenarioCount = this.el.querySelector('#lrtcEbScenarioCount');
        tbody.innerHTML = this.scenarioRows
            .map(
                (row, index) => `
            <tr data-row-index="${index}">
                <td>${index + 1}</td>
                <td><input class="lrtc-eb-cre-cell-input" data-field="rl" value="${row.rl.toFixed(2)}" /></td>
                <td><input class="lrtc-eb-cre-cell-input" data-field="is" value="${row.is.toFixed(2)}" /></td>
                <td><input class="lrtc-eb-cre-cell-input" data-field="pa" value="${row.pa.toFixed(2)}" /></td>
                <td><input class="lrtc-eb-cre-cell-input" data-field="density" value="${row.density.toFixed(2)}" /></td>
                <td>
                    <button type="button" class="lrtc-eb-cre-del-btn" data-role="delete-row" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`
            )
            .join('');
        if (scenarioCount) scenarioCount.textContent = String(this.scenarioRows.length);

        tbody.querySelectorAll('.lrtc-eb-cre-cell-input').forEach((input) => {
            input.addEventListener('change', () => {
                const rowEl = input.closest('tr');
                const rowIndex = parseInt(rowEl.dataset.rowIndex, 10);
                const field = input.dataset.field;
                const value = this.normalizeNumber(input.value, 0);
                this.scenarioRows[rowIndex][field] = value;
                input.value = value.toFixed(2);
            });
        });

        tbody.querySelectorAll('[data-role="delete-row"]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const rowEl = btn.closest('tr');
                const rowIndex = parseInt(rowEl.dataset.rowIndex, 10);
                this.scenarioRows.splice(rowIndex, 1);
                this.renderTable();
            });
        });

        this.refreshAxisTagValues();
    }

    bindEvents() {
        if (!this.el) return;

        const close = () => this._cancel();
        this.el.querySelector('[data-role="close"]').addEventListener('click', close);
        this.el.querySelector('[data-role="cancel"]').addEventListener('click', close);

        this.el.querySelector('[data-role="confirm"]').addEventListener('click', () => {
            const groupName = this.el.querySelector('#lrtcEbGroupName').value.trim();
            if (!groupName) {
                alert('请输入组名');
                return;
            }
            const scenarios = this.scenarioRows.map((r) => ({
                rl: r.rl,
                is: r.is,
                pa: r.pa,
                density: r.density
            }));
            if (typeof this.options.onComplete === 'function') {
                this.options.onComplete({ groupName, scenarios });
            }
            this._closeOnly();
        });

        const modeRadios = this.el.querySelectorAll('input[name="lrtc-eb-scenario-mode"]');
        const customCount = this.el.querySelector('#lrtcEbCustomCount');
        const positionInput = this.el.querySelector('#lrtcEbPositionUncertainty');
        const densityInput = this.el.querySelector('#lrtcEbDensityUncertainty');

        modeRadios.forEach((radio) => {
            radio.addEventListener('change', () => {
                const mode = this.getScenarioMode();
                if (customCount) customCount.disabled = mode !== 'custom';
            });
        });

        if (positionInput) {
            positionInput.addEventListener('input', () => this.refreshAxisTagValues());
        }

        this.el.querySelector('[data-role="regular-generate"]').addEventListener('click', () => {
            this.scenarioRows = this.generateRegularRows(this.getTargetScenarioCount());
            this.renderTable();
        });

        this.el.querySelector('[data-role="random-generate"]').addEventListener('click', () => {
            this.scenarioRows = this.generateRandomRows(this.getTargetScenarioCount());
            this.renderTable();
        });

        this.el.querySelector('[data-role="add-row"]').addEventListener('click', () => {
            if (this.scenarioRows.length >= 81) return;
            this.scenarioRows.push({
                rl: 0,
                is: 0,
                pa: 0,
                density: this.normalizeNumber(densityInput.value, 3.5)
            });
            this.renderTable();
        });

        this.el.querySelector('[data-role="delete-all-rows"]').addEventListener('click', () => {
            this.scenarioRows = [];
            this.renderTable();
        });

        this.el.addEventListener('click', (e) => {
            if (e.target === this.el) this._cancel();
        });
    }

    _closeOnly() {
        if (!this.el) return;
        window.removeEventListener('keydown', this._esc);
        this.el.remove();
        this.el = null;
    }

    _cancel() {
        if (typeof this.options.onCancel === 'function') {
            this.options.onCancel();
        }
        this._closeOnly();
    }

    open() {
        this.ensureStyles();
        if (this.el) return;

        const gname = this._escapeAttr(this.options.defaultGroupName || '鲁棒性评估');

        this.el = document.createElement('div');
        this.el.className = 'lrtc-eb-mask';
        this.el.innerHTML = `
            <div class="lrtc-eb-dialog" role="dialog" aria-modal="true" aria-labelledby="lrtcEbTitle">
                <div class="lrtc-eb-header">
                    <h3 id="lrtcEbTitle">${this._escapeAttr(this.options.title || "创建新模板")}</h3>
                    <button type="button" class="lrtc-eb-close" data-role="close" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="lrtc-eb-body">
                    <div class="lrtc-eb-cre-left">
                        <div class="lrtc-eb-cre-section">
                            <div class="lrtc-eb-cre-row">
                                <label class="lrtc-eb-cre-label required">组名</label>
                                <input class="lrtc-eb-cre-input name" id="lrtcEbGroupName" value="${gname}" />
                            </div>
                            <div class="lrtc-eb-cre-row">
                                <label class="lrtc-eb-cre-label required">生成场景数</label>
                                <div class="lrtc-eb-cre-radio-group">
                                    <label class="lrtc-eb-cre-radio"><input type="radio" name="lrtc-eb-scenario-mode" value="12" checked />12</label>
                                    <label class="lrtc-eb-cre-radio"><input type="radio" name="lrtc-eb-scenario-mode" value="21" />21</label>
                                    <label class="lrtc-eb-cre-radio">
                                        <input type="radio" name="lrtc-eb-scenario-mode" value="custom" />自定义
                                        <input class="lrtc-eb-cre-custom-count" id="lrtcEbCustomCount" type="number" min="1" max="81" value="12" disabled />
                                        <span class="lrtc-eb-cre-unit">[1 ~ 81]</span>
                                    </label>
                                </div>
                            </div>
                            <div class="lrtc-eb-cre-row">
                                <label class="lrtc-eb-cre-label required">摆位不确定性</label>
                                <input class="lrtc-eb-cre-input short" id="lrtcEbPositionUncertainty" type="number" step="0.01" value="0.50" />
                                <span class="lrtc-eb-cre-unit">cm</span>
                            </div>
                        </div>
                        <div class="lrtc-eb-cre-axis-area">
                            <div class="lrtc-eb-cre-axis-grid">
                                <div class="lrtc-eb-cre-tag top"><span class="lrtc-eb-cre-dir">上</span><span class="lrtc-eb-cre-tag-value" id="lrtcEbTopTag">0.50 cm</span></div>
                                <div class="lrtc-eb-cre-tag bottom"><span class="lrtc-eb-cre-dir">下</span><span class="lrtc-eb-cre-tag-value" id="lrtcEbBottomTag">0.50 cm</span></div>
                                <div class="lrtc-eb-cre-tag left"><span class="lrtc-eb-cre-dir">右</span><span class="lrtc-eb-cre-tag-value" id="lrtcEbRightTag">0.50 cm</span></div>
                                <div class="lrtc-eb-cre-tag right"><span class="lrtc-eb-cre-dir">左</span><span class="lrtc-eb-cre-tag-value" id="lrtcEbLeftTag">0.50 cm</span></div>
                                <div class="lrtc-eb-cre-tag front"><span class="lrtc-eb-cre-dir">前</span><span class="lrtc-eb-cre-tag-value" id="lrtcEbFrontTag">0.50 cm</span></div>
                                <div class="lrtc-eb-cre-tag back"><span class="lrtc-eb-cre-dir">后</span><span class="lrtc-eb-cre-tag-value" id="lrtcEbBackTag">0.50 cm</span></div>
                                <div class="lrtc-eb-cre-human"></div>
                            </div>
                        </div>
                        <div class="lrtc-eb-cre-density">
                            <div class="lrtc-eb-cre-row">
                                <label class="lrtc-eb-cre-label required">密度不确定性</label>
                                <input class="lrtc-eb-cre-input short" id="lrtcEbDensityUncertainty" type="number" step="0.01" value="3.50" />
                                <span class="lrtc-eb-cre-unit">%</span>
                            </div>
                        </div>
                        <div class="lrtc-eb-cre-left-actions">
                            <button type="button" class="lrtc-eb-cre-action-btn" data-role="random-generate">随机生成</button>
                            <button type="button" class="lrtc-eb-cre-action-btn" data-role="regular-generate">规律生成</button>
                        </div>
                    </div>
                    <div class="lrtc-eb-cre-right">
                        <div class="lrtc-eb-cre-right-head">
                            <span>场景列表（场景数<span id="lrtcEbScenarioCount">12</span>）</span>
                        </div>
                        <div class="lrtc-eb-cre-table-wrap">
                            <table class="lrtc-eb-cre-table">
                                <thead>
                                    <tr>
                                        <th style="width:52px;">序号</th>
                                        <th>R-L</th>
                                        <th>I-S</th>
                                        <th>P-A</th>
                                        <th>密度不确定性[%]</th>
                                        <th style="width:58px;">操作</th>
                                    </tr>
                                </thead>
                                <tbody id="lrtcEbScenarioBody"></tbody>
                            </table>
                        </div>
                        <div class="lrtc-eb-cre-right-toolbar">
                            <button type="button" class="lrtc-eb-cre-mini-btn" data-role="add-row" title="新增"><i class="fas fa-plus"></i></button>
                            <button type="button" class="lrtc-eb-cre-mini-btn" data-role="delete-all-rows" title="清空全部"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
                <div class="lrtc-eb-footer">
                    <button type="button" class="lrtc-eb-btn" data-role="cancel">取消</button>
                    <button type="button" class="lrtc-eb-btn primary" data-role="confirm">保存</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.el);
        this.scenarioRows = this.generateRegularRows(12);
        this.bindEvents();
        this.renderTable();
        window.addEventListener('keydown', this._esc);
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

// 加载鲁棒性评估模板 — 双栏：模板列表 + 场景明细
class LoadRobustnessEvaluationTemplateModalComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            onConfirm: null,
            onCancel: null,
            templates: null,
            ...options
        };
        this.modalEl = null;
        this._boundEscHandler = this.handleEsc.bind(this);
        this._selectedTemplateId = null;
        this._embeddedCreate = null;
        this.ensureStyles();
    }

    /** 演示用：从卡片「保存→创建模板」写入，刷新页面即清空 */
    static appendDemoTemplateFromSave(groupName) {
        const g = String(groupName || '').trim();
        if (!g) return;
        window.__lrtDemoSaveTemplates = window.__lrtDemoSaveTemplates || [];
        window.__lrtDemoSaveTemplates.push({
            id: `save-demo-${Date.now()}`,
            groupName: g,
            scenarios: LoadRobustnessEvaluationTemplateModalComponent.defaultScenarios12()
        });
    }

    static _getDemoSaveTemplatesSnapshot() {
        const raw = window.__lrtDemoSaveTemplates;
        if (!Array.isArray(raw) || !raw.length) return [];
        return raw.map((t) => ({
            id: String(t.id),
            groupName: String(t.groupName ?? ''),
            scenarios: Array.isArray(t.scenarios) ? t.scenarios.map((r) => ({ ...r })) : []
        }));
    }

    /**
     * 与 getTemplates() 来源一致，用于组名去重（trim 后完全相等视为同名）
     * @param {object} [listOptions] 与 LoadRobustnessEvaluationTemplateModalComponent 构造参数一致时可传 { templates }
     */
    static getExistingTemplateGroupNames(listOptions) {
        const names = new Set();
        const opt = listOptions && typeof listOptions === 'object' ? listOptions : {};
        if (Array.isArray(opt.templates) && opt.templates.length) {
            opt.templates.forEach((t) => {
                const n = String(t.groupName ?? '').trim();
                if (n) names.add(n);
            });
        } else {
            names.add('1');
        }
        LoadRobustnessEvaluationTemplateModalComponent._getDemoSaveTemplatesSnapshot().forEach((t) => {
            const n = String(t.groupName ?? '').trim();
            if (n) names.add(n);
        });
        return names;
    }

    static defaultScenarios12() {
        const position = 0.5;
        const density = 3.5;
        const base = [
            { rl: position, is: 0, pa: 0 },
            { rl: position, is: 0, pa: 0 },
            { rl: 0, is: position, pa: 0 },
            { rl: 0, is: position, pa: 0 },
            { rl: 0, is: 0, pa: position },
            { rl: 0, is: 0, pa: position },
            { rl: -position, is: 0, pa: 0 },
            { rl: -position, is: 0, pa: 0 },
            { rl: 0, is: -position, pa: 0 },
            { rl: 0, is: -position, pa: 0 },
            { rl: 0, is: 0, pa: -position },
            { rl: 0, is: 0, pa: -position }
        ];
        const rows = [];
        for (let i = 0; i < 12; i++) {
            const item = base[i % base.length];
            rows.push({
                rl: item.rl,
                is: item.is,
                pa: item.pa,
                density: i % 2 === 0 ? Math.abs(density) : -Math.abs(density)
            });
        }
        return rows;
    }

    ensureStyles() {
        if (document.getElementById('load-robustness-template-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'load-robustness-template-modal-styles';
        style.textContent = `
            .lrt-mask{
                position: fixed;
                inset: 0;
                z-index: 10061;
                background: rgba(0,0,0,0.68);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .lrt-dialog{
                width: min(920px, calc(100vw - 40px));
                height: min(560px, calc(100vh - 40px));
                background: #1f1f1f;
                border: 1px solid #3f3f3f;
                border-radius: 6px;
                box-shadow: 0 12px 28px rgba(0,0,0,0.45);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                color: #ddd;
                font-size: 13px;
            }
            .lrt-header{
                height: 42px;
                border-bottom: 1px solid #383838;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 12px 0 14px;
                background: #262626;
                flex-shrink: 0;
            }
            .lrt-header h3{
                margin: 0;
                font-size: 16px;
                color: #f0f0f0;
                font-weight: 500;
            }
            .lrt-close{
                border: none;
                background: transparent;
                color: #a8a8a8;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
            }
            .lrt-close:hover{
                background: rgba(255,255,255,0.08);
                color: #fff;
            }
            .lrt-body{
                flex: 1;
                min-height: 0;
                display: grid;
                grid-template-columns: 38% 62%;
                gap: 10px;
                padding: 10px 12px;
                background: #232323;
            }
            .lrt-pane{
                min-height: 0;
                display: flex;
                flex-direction: column;
                background: #222;
                border: 1px solid #363636;
                border-radius: 4px;
                overflow: hidden;
            }
            .lrt-right-pane{
                position: relative;
            }
            .lrt-pane-title{
                padding: 8px 10px;
                border-bottom: 1px solid #333;
                color: #e8e8e8;
                font-weight: 500;
                flex-shrink: 0;
            }
            .lrt-left-inner{
                flex: 1;
                min-height: 0;
                display: flex;
                flex-direction: column;
                position: relative;
                padding-bottom: 44px;
            }
            .lrt-table-wrap{
                flex: 1;
                min-height: 0;
                overflow: auto;
            }
            .lrt-table-wrap::-webkit-scrollbar{ width: 6px; height: 6px; }
            .lrt-table-wrap::-webkit-scrollbar-thumb{ background: #555; border-radius: 3px; }
            .lrt-table{
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
            }
            .lrt-table th,
            .lrt-table td{
                padding: 8px 10px;
                text-align: left;
                border-bottom: 1px solid #2e2e2e;
            }
            .lrt-table th{
                background: #1a1a1a;
                color: #b0b0b0;
                font-weight: 500;
                position: sticky;
                top: 0;
                z-index: 1;
            }
            .lrt-table tbody tr{
                cursor: pointer;
            }
            .lrt-table tbody tr:hover{
                background: rgba(255,255,255,0.04);
            }
            .lrt-table tbody tr.selected{
                background: rgba(58, 172, 222, 0.22);
                outline: 1px solid rgba(58, 172, 222, 0.5);
                outline-offset: -1px;
            }
            .lrt-table .lrt-col-check{ width: 40px; text-align: center; }
            .lrt-table .lrt-col-actions{
                width: 72px;
                text-align: center;
                white-space: nowrap;
            }
            .lrt-action-ico{
                border: none;
                background: transparent;
                color: #9ca3af;
                padding: 4px 6px;
                cursor: pointer;
                border-radius: 4px;
            }
            .lrt-action-ico:hover{
                color: #3aacde;
                background: rgba(255,255,255,0.06);
            }
            .lrt-left-footer{
                position: absolute;
                left: 10px;
                bottom: 10px;
            }
            .lrt-add-btn{
                width: 30px;
                height: 30px;
                border: 1px solid #4a4a4a;
                background: #252525;
                color: #ccc;
                border-radius: 4px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .lrt-add-btn:hover{
                border-color: #5a5a5a;
                background: #2f2f2f;
            }
            .lrt-footer{
                border-top: 1px solid #383838;
                padding: 10px 14px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                background: #262626;
                flex-shrink: 0;
            }
            .lrt-phase{
                border-top: 1px solid #333;
                padding: 8px 10px;
                background: #222;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .lrt-phase-title{
                color: #d8d8d8;
                font-size: 13px;
                margin-bottom: 0;
                flex-shrink: 0;
            }
            .lrt-phase-dropdown{
                position: relative;
                width: 100%;
            }
            .lrt-phase-trigger{
                width: 100%;
                height: 30px;
                border: 1px solid #3b3b3b;
                background: #141414;
                color: #e3e3e3;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 0 10px;
                cursor: pointer;
            }
            .lrt-phase-trigger:hover{
                border-color: #4b4b4b;
            }
            .lrt-phase-trigger i{
                color: #9ea4aa;
                font-size: 12px;
                transition: transform 0.2s ease;
            }
            .lrt-phase-dropdown.open .lrt-phase-trigger i{
                transform: rotate(180deg);
            }
            .lrt-phase-panel{
                border: 1px solid #343434;
                background: #1a1a1a;
                max-height: 320px;
                overflow: auto;
                margin-bottom: 4px;
                border-radius: 4px;
                display: none;
                position: absolute;
                left: 0;
                right: 0;
                top: auto;
                bottom: calc(100% + 2px);
                z-index: 10;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
            }
            .lrt-phase-dropdown.open .lrt-phase-panel{
                display: block;
            }
            .lrt-phase-group-row{
                display: flex;
                align-items: center;
                gap: 10px;
                height: 34px;
                padding: 0 10px;
                border-bottom: 1px solid #303030;
                background: #202020;
                color: #d9d9d9;
                font-weight: 500;
            }
            .lrt-phase-toggle{
                width: 16px;
                height: 16px;
                border: none;
                background: transparent;
                color: #9ea4aa;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                padding: 0;
                flex-shrink: 0;
            }
            .lrt-phase-toggle:hover{
                color: #d7dce1;
            }
            .lrt-phase-toggle i{
                font-size: 11px;
            }
            .lrt-phase-item{
                display: flex;
                align-items: center;
                gap: 10px;
                height: 34px;
                padding: 0 10px 0 26px;
                border-bottom: 1px solid #2e2e2e;
                color: #d5d5d5;
            }
            .lrt-phase-item:last-child{
                border-bottom: none;
            }
            .lrt-phase-label{
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .lrt-check{
                width: 14px;
                height: 14px;
                accent-color: #3aacde;
                cursor: pointer;
                flex-shrink: 0;
            }
            .lrt-btn{
                min-width: 88px;
                height: 32px;
                padding: 0 14px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
                border: 1px solid #4a4a4a;
                background: #2a2a2a;
                color: #e5e5e5;
            }
            .lrt-btn:hover{ background: #333; }
            .lrt-btn.primary{
                border-color: #3aacde;
                background: #2a9dd0;
                color: #fff;
            }
            .lrt-btn.primary:hover{
                background: #33addf;
            }
        `;
        document.head.appendChild(style);
    }

    getTemplates() {
        let base;
        if (Array.isArray(this.options.templates) && this.options.templates.length) {
            base = this.options.templates.map((t) => ({
                id: String(t.id),
                groupName: String(t.groupName ?? ''),
                scenarios: Array.isArray(t.scenarios) ? t.scenarios.map((r) => ({ ...r })) : []
            }));
        } else {
            base = [
                {
                    id: '1',
                    groupName: '1',
                    scenarios: LoadRobustnessEvaluationTemplateModalComponent.defaultScenarios12()
                }
            ];
        }
        const demo = LoadRobustnessEvaluationTemplateModalComponent._getDemoSaveTemplatesSnapshot();
        return base.concat(demo);
    }

    show() {
        if (this.modalEl) return;
        this._templates = this.getTemplates();
        const first = this._templates[0];
        this._selectedTemplateId = first ? first.id : null;

        this.modalEl = document.createElement('div');
        this.modalEl.className = 'lrt-mask';
        const mountContainer = this.options.mountContainer || document.body;
        this.modalEl.innerHTML = `
            <div class="lrt-dialog" role="dialog" aria-modal="true" aria-labelledby="lrtTitle">
                <div class="lrt-header">
                    <h3 id="lrtTitle">加载鲁棒性评估模板</h3>
                    <button type="button" class="lrt-close" data-role="close" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="lrt-body">
                    <div class="lrt-pane">
                        <div class="lrt-pane-title">模板列表</div>
                        <div class="lrt-left-inner">
                            <div class="lrt-table-wrap">
                                <table class="lrt-table">
                                    <thead>
                                        <tr>
                                            <th class="lrt-col-check"></th>
                                            <th>组名</th>
                                            <th>场景数</th>
                                            <th class="lrt-col-actions">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody id="lrtTemplateBody"></tbody>
                                </table>
                            </div>
                            <div class="lrt-left-footer">
                                <button type="button" class="lrt-add-btn" data-role="add-template" title="新增模板">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="lrt-pane lrt-right-pane">
                        <div class="lrt-pane-title">场景列表（场景数<span id="lrtScenarioCount">0</span>）</div>
                        <div class="lrt-table-wrap">
                            <table class="lrt-table">
                                <thead>
                                    <tr>
                                        <th style="width:52px;">序号</th>
                                        <th>R-L</th>
                                        <th>I-S</th>
                                        <th>P-A</th>
                                        <th>密度不确定性[%]</th>
                                    </tr>
                                </thead>
                                <tbody id="lrtScenarioBody"></tbody>
                            </table>
                        </div>
                        <div class="lrt-phase">
                            <div class="lrt-phase-title">时相不确定性</div>
                            <div class="lrt-phase-dropdown" id="lrtPhaseDropdown">
                                <button class="lrt-phase-trigger" type="button" id="lrtPhaseTrigger" aria-expanded="false">
                                    <span id="lrtPhaseTriggerText">未选择</span>
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                                <div class="lrt-phase-panel" id="lrtPhasePanel">
                                    <div class="lrt-phase-group-row">
                                        <button class="lrt-phase-toggle" type="button" id="lrtPhase4dctToggle" aria-label="展开折叠4DCT">
                                            <i class="fas fa-chevron-down"></i>
                                        </button>
                                        <input class="lrt-check" type="checkbox" id="lrtPhaseGroup4dct" />
                                        <label class="lrt-phase-label" for="lrtPhaseGroup4dct">4DCT 20210308</label>
                                    </div>
                                    <div class="lrt-phase-item lrt-phase-child-row">
                                        <input class="lrt-check lrt-phase-child lrt-phase-child-4dct" type="checkbox" id="lrtPhase0" data-phase="CT 1 20210308 0%" />
                                        <label class="lrt-phase-label" for="lrtPhase0">CT 1 20210308 0%</label>
                                    </div>
                                    <div class="lrt-phase-item lrt-phase-child-row">
                                        <input class="lrt-check lrt-phase-child lrt-phase-child-4dct" type="checkbox" id="lrtPhase10" data-phase="CT 2 20210308 10%" />
                                        <label class="lrt-phase-label" for="lrtPhase10">CT 2 20210308 10%</label>
                                    </div>
                                    <div class="lrt-phase-item lrt-phase-child-row">
                                        <input class="lrt-check lrt-phase-child lrt-phase-child-4dct" type="checkbox" id="lrtPhase20" data-phase="CT 3 20210308 20%" />
                                        <label class="lrt-phase-label" for="lrtPhase20">CT 3 20210308 20%</label>
                                    </div>
                                    <div class="lrt-phase-item lrt-phase-child-row">
                                        <input class="lrt-check lrt-phase-child lrt-phase-child-4dct" type="checkbox" id="lrtPhase30" data-phase="CT 4 20210308 30%" />
                                        <label class="lrt-phase-label" for="lrtPhase30">CT 4 20210308 30%</label>
                                    </div>
                                    <div class="lrt-phase-item lrt-phase-child-row">
                                        <input class="lrt-check lrt-phase-child lrt-phase-child-4dct" type="checkbox" id="lrtPhase40" data-phase="CT 5 20210308 40%" />
                                        <label class="lrt-phase-label" for="lrtPhase40">CT 5 20210308 40%</label>
                                    </div>
                                    <div class="lrt-phase-item lrt-phase-child-row">
                                        <input class="lrt-check lrt-phase-child lrt-phase-child-4dct" type="checkbox" id="lrtPhase50" data-phase="CT 6 20210308 50%" />
                                        <label class="lrt-phase-label" for="lrtPhase50">CT 6 20210308 50%</label>
                                    </div>
                                    <div class="lrt-phase-item lrt-phase-child-row">
                                        <input class="lrt-check lrt-phase-child lrt-phase-child-4dct" type="checkbox" id="lrtPhase60" data-phase="CT 7 20210308 60%" />
                                        <label class="lrt-phase-label" for="lrtPhase60">CT 7 20210308 60%</label>
                                    </div>
                                    <div class="lrt-phase-item lrt-phase-child-row">
                                        <input class="lrt-check lrt-phase-child lrt-phase-child-4dct" type="checkbox" id="lrtPhase70" data-phase="CT 8 20210308 70%" />
                                        <label class="lrt-phase-label" for="lrtPhase70">CT 8 20210308 70%</label>
                                    </div>
                                    <div class="lrt-phase-item lrt-phase-child-row">
                                        <input class="lrt-check lrt-phase-child lrt-phase-child-4dct" type="checkbox" id="lrtPhase80" data-phase="CT 9 20210308 80%" />
                                        <label class="lrt-phase-label" for="lrtPhase80">CT 9 20210308 80%</label>
                                    </div>
                                    <div class="lrt-phase-item lrt-phase-child-row">
                                        <input class="lrt-check lrt-phase-child lrt-phase-child-4dct" type="checkbox" id="lrtPhase90" data-phase="CT 10 20210308 90%" />
                                        <label class="lrt-phase-label" for="lrtPhase90">CT 10 20210308 90%</label>
                                    </div>
                                    <div class="lrt-phase-item">
                                        <input class="lrt-check lrt-phase-child" type="checkbox" id="lrtPhaseMip" data-phase="MIP 14 20251230" checked disabled />
                                        <label class="lrt-phase-label" for="lrtPhaseMip">MIP 14 20251230</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="lrt-footer">
                    <button type="button" class="lrt-btn" data-role="cancel">取消</button>
                    <button type="button" class="lrt-btn primary" data-role="confirm">加入评估</button>
                </div>
            </div>
        `;

        mountContainer.appendChild(this.modalEl);
        this.bindEvents();
        this.renderTemplateTable();
        this.renderScenarioTable();
        window.addEventListener('keydown', this._boundEscHandler);
    }

    bindEvents() {
        if (!this.modalEl) return;

        const close = () => {
            this.hide();
            if (typeof this.options.onCancel === 'function') {
                this.options.onCancel();
            }
        };

        this.modalEl.querySelector('[data-role="close"]').addEventListener('click', close);
        this.modalEl.querySelector('[data-role="cancel"]').addEventListener('click', close);

        this.modalEl.querySelector('[data-role="confirm"]').addEventListener('click', () => {
            const tpl = this._templates.find((t) => t.id === this._selectedTemplateId);
            const selectedPhaseUncertainties = Array.from(this.modalEl.querySelectorAll('.lrt-phase-child:checked'))
                .map((item) => item.dataset.phase)
                .filter(Boolean);
            this.hide();
            if (typeof this.options.onConfirm === 'function') {
                this.options.onConfirm(tpl ? {
                    ...tpl,
                    selectedPhaseUncertainties,
                    scenarios: tpl.scenarios.map((r) => ({ ...r }))
                } : null);
            }
        });

        this.modalEl.querySelector('[data-role="add-template"]').addEventListener('click', () => {
            const nextIdx = this._templates.length + 1;
            this._embeddedCreate = new LrtEmbeddedCreateRobustnessModal({
                defaultGroupName: String(nextIdx),
                onComplete: ({ groupName, scenarios }) => {
                    this._embeddedCreate = null;
                    const id = `tpl-${Date.now()}`;
                    this._templates.push({
                        id,
                        groupName,
                        scenarios: scenarios.map((r) => ({ ...r }))
                    });
                    this._selectedTemplateId = id;
                    this.renderTemplateTable();
                    this.renderScenarioTable();
                },
                onCancel: () => {
                    this._embeddedCreate = null;
                }
            });
            this._embeddedCreate.open();
        });

        this.modalEl.addEventListener('click', (e) => {
            if (e.target === this.modalEl) close();
        });

        const phaseGroup = this.modalEl.querySelector('#lrtPhaseGroup4dct');
        const phase4dctToggle = this.modalEl.querySelector('#lrtPhase4dctToggle');
        const phaseChildren = Array.from(this.modalEl.querySelectorAll('.lrt-phase-child'));
        const phaseGroupChildren = Array.from(this.modalEl.querySelectorAll('.lrt-phase-child-4dct'));
        const phaseChildRows = Array.from(this.modalEl.querySelectorAll('.lrt-phase-child-row'));
        const phaseDropdown = this.modalEl.querySelector('#lrtPhaseDropdown');
        const phaseTrigger = this.modalEl.querySelector('#lrtPhaseTrigger');
        const phaseTriggerText = this.modalEl.querySelector('#lrtPhaseTriggerText');
        let is4dctExpanded = true;

        const syncPhaseGroupState = () => {
            const checkedCount = phaseGroupChildren.filter((item) => item.checked).length;
            if (phaseGroup) {
                if (checkedCount === 0) {
                    phaseGroup.checked = false;
                    phaseGroup.indeterminate = false;
                } else if (checkedCount === phaseGroupChildren.length) {
                    phaseGroup.checked = true;
                    phaseGroup.indeterminate = false;
                } else {
                    phaseGroup.checked = false;
                    phaseGroup.indeterminate = true;
                }
            }
            const selectedAllCount = phaseChildren.filter((item) => item.checked).length;
            if (phaseTriggerText) {
                if (selectedAllCount === 0) phaseTriggerText.textContent = '未选择';
                else if (selectedAllCount === phaseChildren.length) phaseTriggerText.textContent = '已选全部';
                else phaseTriggerText.textContent = `已选 ${selectedAllCount} 项`;
            }
        };

        const update4dctChildVisibility = () => {
            phaseChildRows.forEach((row) => {
                row.style.display = is4dctExpanded ? 'flex' : 'none';
            });
            if (phase4dctToggle) {
                phase4dctToggle.innerHTML = is4dctExpanded
                    ? '<i class="fas fa-chevron-down"></i>'
                    : '<i class="fas fa-chevron-right"></i>';
            }
        };

        const closePhaseDropdown = () => {
            if (!phaseDropdown || !phaseTrigger) return;
            phaseDropdown.classList.remove('open');
            phaseTrigger.setAttribute('aria-expanded', 'false');
        };
        const openPhaseDropdown = () => {
            if (!phaseDropdown || !phaseTrigger) return;
            phaseDropdown.classList.add('open');
            phaseTrigger.setAttribute('aria-expanded', 'true');
        };

        if (phaseTrigger && phaseDropdown) {
            phaseTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if (phaseDropdown.classList.contains('open')) closePhaseDropdown();
                else openPhaseDropdown();
            });
            phaseDropdown.addEventListener('click', (e) => e.stopPropagation());
            if (!this._phaseDropdownDocClickHandler) {
                this._phaseDropdownDocClickHandler = () => {
                    closePhaseDropdown();
                };
                document.addEventListener('click', this._phaseDropdownDocClickHandler);
            }
        }

        if (phaseGroup) {
            phaseGroup.addEventListener('change', () => {
                phaseGroupChildren.forEach((item) => {
                    item.checked = phaseGroup.checked;
                });
                syncPhaseGroupState();
            });
        }
        if (phase4dctToggle) {
            phase4dctToggle.addEventListener('click', () => {
                is4dctExpanded = !is4dctExpanded;
                update4dctChildVisibility();
            });
        }
        phaseChildren.forEach((item) => {
            item.addEventListener('change', () => {
                syncPhaseGroupState();
            });
        });
        update4dctChildVisibility();
        syncPhaseGroupState();

        this.modalEl.querySelector('#lrtTemplateBody').addEventListener('click', (e) => {
            const editBtn = e.target.closest('[data-action="edit-template"]');
            const delBtn = e.target.closest('[data-action="delete-template"]');
            if (editBtn || delBtn) {
                e.stopPropagation();
                const tr = (editBtn || delBtn).closest('tr[data-template-id]');
                const tid = tr && tr.getAttribute('data-template-id');
                if (editBtn) {
                    console.log('编辑模板', tid);
                }
                if (delBtn) {
                    if (this._templates.length <= 1) return;
                    this._templates = this._templates.filter((t) => t.id !== tid);
                    if (this._selectedTemplateId === tid) {
                        this._selectedTemplateId = this._templates[0] ? this._templates[0].id : null;
                    }
                    this.renderTemplateTable();
                    this.renderScenarioTable();
                }
                return;
            }
            const row = e.target.closest('tr[data-template-id]');
            if (row) {
                this._selectedTemplateId = row.getAttribute('data-template-id');
                this.renderTemplateTable();
                this.renderScenarioTable();
            }
        });
    }

    handleEsc(event) {
        if (event.key !== 'Escape') return;
        if (this._embeddedCreate && this._embeddedCreate.el) {
            this._embeddedCreate._cancel();
            return;
        }
        this.hide();
        if (typeof this.options.onCancel === 'function') {
            this.options.onCancel();
        }
    }

    _fmt(n) {
        const x = Number(n);
        if (Number.isNaN(x)) return '—';
        return x.toFixed(2);
    }

    renderTemplateTable() {
        if (!this.modalEl) return;
        const tbody = this.modalEl.querySelector('#lrtTemplateBody');
        tbody.innerHTML = this._templates
            .map((t) => {
                const sel = t.id === this._selectedTemplateId;
                const count = t.scenarios.length;
                return `
                <tr class="${sel ? 'selected' : ''}" data-template-id="${this._escapeAttr(t.id)}">
                    <td class="lrt-col-check">
                        <input type="checkbox" ${sel ? 'checked' : ''} aria-label="选择模板" />
                    </td>
                    <td>${this._escapeHtml(t.groupName)}</td>
                    <td>${count}</td>
                    <td class="lrt-col-actions">
                        <button type="button" class="lrt-action-ico" data-action="edit-template" title="编辑">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button type="button" class="lrt-action-ico" data-action="delete-template" title="删除">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>`;
            })
            .join('');

        tbody.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
            cb.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const tr = cb.closest('tr[data-template-id]');
                const tid = tr && tr.getAttribute('data-template-id');
                if (tid) {
                    this._selectedTemplateId = tid;
                    this.renderTemplateTable();
                    this.renderScenarioTable();
                }
            });
        });
    }

    renderScenarioTable() {
        if (!this.modalEl) return;
        const tpl = this._templates.find((t) => t.id === this._selectedTemplateId);
        const scenarios = tpl && Array.isArray(tpl.scenarios) ? tpl.scenarios : [];
        const countEl = this.modalEl.querySelector('#lrtScenarioCount');
        if (countEl) countEl.textContent = String(scenarios.length);

        const tbody = this.modalEl.querySelector('#lrtScenarioBody');
        tbody.innerHTML = scenarios
            .map(
                (r, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${this._fmt(r.rl)}</td>
                <td>${this._fmt(r.is)}</td>
                <td>${this._fmt(r.pa)}</td>
                <td>${this._fmt(r.density)}</td>
            </tr>`
            )
            .join('');
    }

    _escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    _escapeAttr(s) {
        return this._escapeHtml(s).replace(/'/g, '&#39;');
    }

    hide() {
        if (this._embeddedCreate && this._embeddedCreate.el) {
            this._embeddedCreate._closeOnly();
            this._embeddedCreate = null;
        }
        if (!this.modalEl) return;
        if (this._phaseDropdownDocClickHandler) {
            document.removeEventListener('click', this._phaseDropdownDocClickHandler);
            this._phaseDropdownDocClickHandler = null;
        }
        window.removeEventListener('keydown', this._boundEscHandler);
        this.modalEl.remove();
        this.modalEl = null;
    }

    destroy() {
        this.hide();
    }
}

if (typeof window !== 'undefined') {
    window.LrtEmbeddedCreateRobustnessModal = LrtEmbeddedCreateRobustnessModal;
    window.LoadRobustnessEvaluationTemplateModalComponent = LoadRobustnessEvaluationTemplateModalComponent;
}
