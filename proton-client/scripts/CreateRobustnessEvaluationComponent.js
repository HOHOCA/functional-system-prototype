class CreateRobustnessEvaluationComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            onConfirm: null,
            onCancel: null,
            ...options
        };
        this.modalEl = null;
        this.scenarioRows = [];
        this._boundEscHandler = this.handleEsc.bind(this);
        this.ensureStyles();
    }

    ensureStyles() {
        if (document.getElementById('create-robustness-evaluation-styles')) return;
        const style = document.createElement('style');
        style.id = 'create-robustness-evaluation-styles';
        style.textContent = `
            .create-robustness-evaluation-mask{
                position: fixed;
                inset: 0;
                z-index: 10060;
                background: rgba(0,0,0,0.68);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .create-robustness-evaluation-mask.embedded{
                position: absolute;
            }
            .create-robustness-evaluation-mask.embedded .create-robustness-evaluation-dialog{
                width: calc(100% - 8px);
                height: calc(100% - 8px);
                max-width: none;
                max-height: none;
                border-radius: 4px;
            }
            .create-robustness-evaluation-dialog{
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
            .create-robustness-evaluation-header{
                height: 42px;
                border-bottom: 1px solid #383838;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 12px 0 14px;
                background: #262626;
            }
            .create-robustness-evaluation-header h3{
                margin: 0;
                font-size: 16px;
                color: #f0f0f0;
                font-weight: 500;
            }
            .create-robustness-evaluation-close{
                border: none;
                background: transparent;
                color: #a8a8a8;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
            }
            .create-robustness-evaluation-close:hover{
                background: rgba(255,255,255,0.08);
                color: #fff;
            }
            .create-robustness-evaluation-body{
                flex: 1;
                min-height: 0;
                display: grid;
                grid-template-columns: 48% 52%;
                gap: 10px;
                padding: 10px 12px;
                background: #232323;
            }
            .cre-left, .cre-right{
                min-height: 0;
                display: flex;
                flex-direction: column;
                background: #222;
                border: 1px solid #363636;
            }
            .cre-left{
                position: relative;
                padding-bottom: 46px;
            }
            .cre-section{
                border-bottom: 1px solid #333;
                padding: 10px 12px;
            }
            .cre-row{
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            .cre-row:last-child{
                margin-bottom: 0;
            }
            .cre-label{
                width: 88px;
                color: #cfcfcf;
                flex-shrink: 0;
            }
            .cre-label.required::before{
                content: "*";
                color: #f35b5b;
                margin-right: 2px;
            }
            .cre-input{
                height: 30px;
                border: 1px solid #3b3b3b;
                background: #141414;
                color: #f0f0f0;
                border-radius: 4px;
                padding: 0 10px;
                outline: none;
            }
            .cre-input:focus{
                border-color: #3aacde;
            }
            .create-robustness-evaluation-dialog input[type="number"]::-webkit-outer-spin-button,
            .create-robustness-evaluation-dialog input[type="number"]::-webkit-inner-spin-button{
                -webkit-appearance: none;
                margin: 0;
            }
            .create-robustness-evaluation-dialog input[type="number"]{
                -moz-appearance: textfield;
                appearance: textfield;
            }
            .cre-input.name{
                flex: 1;
            }
            .cre-input.short{
                width: 96px;
                text-align: center;
            }
            .cre-unit{
                color: #a6a6a6;
            }
            .cre-radio-group{
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .cre-radio{
                display: inline-flex;
                align-items: center;
                gap: 5px;
                color: #d7d7d7;
            }
            .cre-radio input{
                accent-color: #3aacde;
            }
            .cre-custom-count{
                width: 96px;
                height: 28px;
                border: 1px solid #3b3b3b;
                background: #141414;
                color: #f0f0f0;
                border-radius: 4px;
                text-align: center;
            }
            .cre-axis-area{
                padding: 10px 14px 12px;
                border-bottom: 1px solid #333;
            }
            .cre-axis-grid{
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
            .cre-human{
                width: 52px;
                height: 140px;
                position: relative;
            }
            .cre-human::before{
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
            .cre-human::after{
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
            .cre-tag{
                position: absolute;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                color: #d6d6d6;
                font-size: 12px;
            }
            .cre-tag-value{
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
            .cre-tag.top{ top: 14px; left: 50%; transform: translateX(-50%); }
            .cre-tag.bottom{ bottom: 14px; left: 50%; transform: translateX(-50%); }
            .cre-tag.left{ left: 16px; top: 50%; transform: translateY(-50%); }
            .cre-tag.right{ right: 16px; top: 50%; transform: translateY(-50%); }
            .cre-tag.front{ left: 18px; bottom: 62px; }
            .cre-tag.back{ right: 18px; top: 62px; }
            .cre-tag.front .cre-dir,
            .cre-tag.back .cre-dir{
                width: 24px;
            }
            .cre-density{
                padding: 10px 12px;
            }
            .cre-phase{
                padding: 4px 12px 10px;
                border-top: 1px solid #333;
            }
            .cre-phase-title{
                color: #d8d8d8;
                font-size: 13px;
                margin-bottom: 8px;
            }
            .cre-phase-dropdown{
                position: relative;
            }
            .cre-phase-trigger{
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
            .cre-phase-trigger:hover{
                border-color: #4b4b4b;
            }
            .cre-phase-trigger i{
                color: #9ea4aa;
                font-size: 12px;
                transition: transform 0.2s ease;
            }
            .cre-phase-dropdown.open .cre-phase-trigger i{
                transform: rotate(180deg);
            }
            .cre-phase-panel{
                border: 1px solid #343434;
                background: #1a1a1a;
                max-height: 420px; /* 默认值：足够容纳常见选项，同时仍支持滚动 */
                overflow: auto;
                margin-top: 4px;
                border-radius: 4px;
                display: none;
                position: absolute;
                left: 0;
                right: 0;
                top: calc(100% + 2px);
                z-index: 8;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
            }
            .cre-phase-dropdown.open .cre-phase-panel{
                display: block;
            }
            .cre-phase-group-row{
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
            .cre-phase-toggle{
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
            .cre-phase-toggle:hover{
                color: #d7dce1;
            }
            .cre-phase-toggle i{
                font-size: 11px;
            }
            .cre-phase-item{
                display: flex;
                align-items: center;
                gap: 10px;
                height: 34px;
                padding: 0 10px 0 26px;
                border-bottom: 1px solid #2e2e2e;
                color: #d5d5d5;
            }
            .cre-phase-item:last-child{
                border-bottom: none;
            }
            /* 右侧表格行内：时相单选下拉（样式参考左侧 crePhaseDropdown） */
            .cre-row-phase-dropdown .cre-phase-item{
                padding: 0 10px;
                cursor: pointer;
                border-bottom: 1px solid #2e2e2e;
                color: #d5d5d5;
            }
            .cre-row-phase-dropdown .cre-phase-item:hover{
                background: rgba(255,255,255,0.04);
            }
            .cre-row-phase-dropdown .cre-phase-item.active{
                color: #3aacde;
                font-weight: 600;
            }
            .cre-row-phase-dropdown .cre-phase-panel{
                max-height: 320px;
            }
            .cre-phase-label{
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .cre-phase-label.with-crown{
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .cre-phase-crown{
                width: 13px;
                height: 13px;
                flex-shrink: 0;
                display: inline-block;
            }
            .cre-check{
                width: 14px;
                height: 14px;
                accent-color: #3aacde;
                cursor: pointer;
                flex-shrink: 0;
            }
            .cre-right-head{
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
                border-bottom: 1px solid #333;
                color: #c9c9c9;
            }
            .cre-table-wrap{
                flex: 1;
                min-height: 0;
                overflow: auto;
            }
            .cre-table{
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }
            .cre-table th,
            .cre-table td{
                border-bottom: 1px solid #303030;
                border-right: 1px solid #303030;
                text-align: center;
                padding: 4px;
                height: 34px;
                color: #ddd;
            }
            .cre-table th{
                position: sticky;
                top: 0;
                z-index: 1;
                background: #232323;
                color: #cfcfcf;
                font-weight: 500;
            }
            .cre-table th:last-child,
            .cre-table td:last-child{
                border-right: none;
            }
            .cre-cell-input{
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
            .cre-del-btn{
                width: 24px;
                height: 24px;
                border: none;
                background: transparent;
                color: #46c3e8;
                cursor: pointer;
                border-radius: 4px;
            }
            .cre-del-btn:hover{
                background: rgba(70,195,232,0.12);
            }
            .cre-right-toolbar{
                border-top: 1px solid #333;
                padding: 8px 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .cre-mini-btn{
                width: 24px;
                height: 24px;
                border: 1px solid #3a3a3a;
                background: #1a1a1a;
                color: #49c7ea;
                border-radius: 3px;
                cursor: pointer;
            }
            .cre-mini-btn:hover{
                background: #212121;
            }
            .create-robustness-evaluation-footer{
                border-top: 1px solid #383838;
                height: 56px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 10px;
                padding: 0 14px;
                background: #262626;
            }
            .cre-btn{
                min-width: 92px;
                height: 34px;
                border-radius: 4px;
                border: 1px solid #4d4d4d;
                background: #2b2b2b;
                color: #d8d8d8;
                cursor: pointer;
            }
            .cre-btn:hover{
                background: #343434;
            }
            .cre-btn.primary{
                border-color: #3aacde;
                background: #2a9dd0;
                color: #fff;
            }
            .cre-btn.primary:hover{
                background: #33addf;
            }
            .cre-action-btn{
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
            .cre-action-btn:hover{
                background: #1384b1;
            }
            .cre-left-actions{
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

    show() {
        if (this.modalEl) return;
        this.scenarioRows = this.generateRegularRows(12);
        this.modalEl = document.createElement('div');
        this.modalEl.className = 'create-robustness-evaluation-mask';
        const mountContainer = this.options.mountContainer || document.body;
        if (mountContainer !== document.body) {
            this.modalEl.classList.add('embedded');
            if (getComputedStyle(mountContainer).position === 'static') {
                mountContainer.style.position = 'relative';
            }
        }
        this.modalEl.innerHTML = `
            <div class="create-robustness-evaluation-dialog" role="dialog" aria-modal="true">
                <div class="create-robustness-evaluation-header">
                    <h3>创建鲁棒性评估</h3>
                    <button class="create-robustness-evaluation-close" data-role="close" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="create-robustness-evaluation-body">
                    <div class="cre-left">
                        <div class="cre-section">
                            <div class="cre-row">
                                <label class="cre-label required">组名</label>
                                <input class="cre-input name" id="creGroupName" value="鲁棒性评估" />
                            </div>
                            <div class="cre-row">
                                <label class="cre-label required">生成场景数</label>
                                <div class="cre-radio-group">
                                    <label class="cre-radio"><input type="radio" name="cre-scenario-mode" value="12" checked />12</label>
                                    <label class="cre-radio"><input type="radio" name="cre-scenario-mode" value="21" />21</label>
                                    <label class="cre-radio">
                                        <input type="radio" name="cre-scenario-mode" value="custom" />自定义
                                        <input class="cre-custom-count" id="creCustomCount" type="number" min="1" max="81" value="12" disabled />
                                        <span class="cre-unit">[1 ~ 81]</span>
                                    </label>
                                </div>
                            </div>
                            <div class="cre-row">
                                <label class="cre-label required">摆位不确定性</label>
                                <input class="cre-input short" id="crePositionUncertainty" type="number" step="0.01" value="0.50" />
                                <span class="cre-unit">cm</span>
                            </div>
                        </div>
                        <div class="cre-axis-area">
                            <div class="cre-axis-grid">
                                <div class="cre-tag top"><span class="cre-dir">上</span><span class="cre-tag-value" id="creTopTag">0.50 cm</span></div>
                                <div class="cre-tag bottom"><span class="cre-dir">下</span><span class="cre-tag-value" id="creBottomTag">0.50 cm</span></div>
                                <div class="cre-tag left"><span class="cre-dir">右</span><span class="cre-tag-value" id="creRightTag">0.50 cm</span></div>
                                <div class="cre-tag right"><span class="cre-dir">左</span><span class="cre-tag-value" id="creLeftTag">0.50 cm</span></div>
                                <div class="cre-tag front"><span class="cre-dir">前</span><span class="cre-tag-value" id="creFrontTag">0.50 cm</span></div>
                                <div class="cre-tag back"><span class="cre-dir">后</span><span class="cre-tag-value" id="creBackTag">0.50 cm</span></div>
                                <div class="cre-human"></div>
                            </div>
                        </div>
                        <div class="cre-density">
                            <div class="cre-row">
                                <label class="cre-label required">密度不确定性</label>
                                <input class="cre-input short" id="creDensityUncertainty" type="number" step="0.01" value="3.50" />
                                <span class="cre-unit">%</span>
                            </div>
                        </div>
                        <div class="cre-phase">
                            <div class="cre-phase-title">时相不确定性</div>
                            <div class="cre-phase-dropdown" id="crePhaseDropdown">
                                <button class="cre-phase-trigger" type="button" id="crePhaseTrigger" aria-expanded="false">
                                    <span id="crePhaseTriggerText">未选择</span>
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                                <div class="cre-phase-panel" id="crePhasePanel">
                                    <div class="cre-phase-group-row">
                                        <button class="cre-phase-toggle" type="button" id="crePhase4dctToggle" aria-label="展开折叠4DCT">
                                            <i class="fas fa-chevron-down"></i>
                                        </button>
                                        <input class="cre-check" type="checkbox" id="crePhaseGroup4dct" />
                                        <label class="cre-phase-label" for="crePhaseGroup4dct">4DCT 20210308</label>
                                    </div>
                                    <div class="cre-phase-item cre-phase-child-row">
                                        <input class="cre-check cre-phase-child cre-phase-child-4dct" type="checkbox" id="crePhase0" data-phase="CT 1 20210308 0%" />
                                        <label class="cre-phase-label" for="crePhase0">CT 1 20210308 0%</label>
                                    </div>
                                    <div class="cre-phase-item cre-phase-child-row">
                                        <input class="cre-check cre-phase-child cre-phase-child-4dct" type="checkbox" id="crePhase10" data-phase="CT 2 20210308 10%" />
                                        <label class="cre-phase-label" for="crePhase10">CT 2 20210308 10%</label>
                                    </div>
                                    <div class="cre-phase-item cre-phase-child-row">
                                        <input class="cre-check cre-phase-child cre-phase-child-4dct" type="checkbox" id="crePhase20" data-phase="CT 3 20210308 20%" />
                                        <label class="cre-phase-label" for="crePhase20">CT 3 20210308 20%</label>
                                    </div>
                                    <div class="cre-phase-item cre-phase-child-row">
                                        <input class="cre-check cre-phase-child cre-phase-child-4dct" type="checkbox" id="crePhase30" data-phase="CT 4 20210308 30%" />
                                        <label class="cre-phase-label" for="crePhase30">CT 4 20210308 30%</label>
                                    </div>
                                    <div class="cre-phase-item cre-phase-child-row">
                                        <input class="cre-check cre-phase-child cre-phase-child-4dct" type="checkbox" id="crePhase40" data-phase="CT 5 20210308 40%" />
                                        <label class="cre-phase-label" for="crePhase40">CT 5 20210308 40%</label>
                                    </div>
                                    <div class="cre-phase-item cre-phase-child-row">
                                        <input class="cre-check cre-phase-child cre-phase-child-4dct" type="checkbox" id="crePhase50" data-phase="CT 6 20210308 50%" />
                                        <label class="cre-phase-label" for="crePhase50">CT 6 20210308 50%</label>
                                    </div>
                                    <div class="cre-phase-item cre-phase-child-row">
                                        <input class="cre-check cre-phase-child cre-phase-child-4dct" type="checkbox" id="crePhase60" data-phase="CT 7 20210308 60%" />
                                        <label class="cre-phase-label" for="crePhase60">CT 7 20210308 60%</label>
                                    </div>
                                    <div class="cre-phase-item cre-phase-child-row">
                                        <input class="cre-check cre-phase-child cre-phase-child-4dct" type="checkbox" id="crePhase70" data-phase="CT 8 20210308 70%" />
                                        <label class="cre-phase-label" for="crePhase70">CT 8 20210308 70%</label>
                                    </div>
                                    <div class="cre-phase-item cre-phase-child-row">
                                        <input class="cre-check cre-phase-child cre-phase-child-4dct" type="checkbox" id="crePhase80" data-phase="CT 9 20210308 80%" />
                                        <label class="cre-phase-label" for="crePhase80">CT 9 20210308 80%</label>
                                    </div>
                                    <div class="cre-phase-item cre-phase-child-row">
                                        <input class="cre-check cre-phase-child cre-phase-child-4dct" type="checkbox" id="crePhase90" data-phase="CT 10 20210308 90%" />
                                        <label class="cre-phase-label" for="crePhase90">CT 10 20210308 90%</label>
                                    </div>
                                    <div class="cre-phase-item">
                                        <input class="cre-check cre-phase-child" type="checkbox" id="crePhaseMip" data-phase="MIP 14 20251230" checked disabled />
                                        <label class="cre-phase-label with-crown" for="crePhaseMip">
                                            <svg class="cre-phase-crown" viewBox="0 0 24 24" aria-hidden="true">
                                                <defs>
                                                    <linearGradient id="crePhaseCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stop-color="#ffd978"></stop>
                                                        <stop offset="100%" stop-color="#f5b942"></stop>
                                                    </linearGradient>
                                                </defs>
                                                <path fill="url(#crePhaseCrownGrad)" d="M3.2 17.8l1.6-9.4 5.1 4.1L12 6l2.1 6.5 5.1-4.1 1.6 9.4H3.2zm1.5 2.2h14.6v1.4H4.7V20z"/>
                                            </svg>
                                            <span>MIP 14 20251230</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="cre-left-actions">
                            <button class="cre-action-btn" data-role="random-generate">随机生成</button>
                            <button class="cre-action-btn" data-role="regular-generate">规律生成</button>
                        </div>
                    </div>
                    <div class="cre-right">
                        <div class="cre-right-head">
                            <span>场景列表（场景数<span id="creScenarioCount">12</span>）</span>
                        </div>
                        <div class="cre-table-wrap">
                            <table class="cre-table">
                                <thead>
                                    <tr>
                                        <th style="width:52px;">序号</th>
                                        <th>R-L</th>
                                        <th>I-S</th>
                                        <th>P-A</th>
                                        <th>密度不确定性[%]</th>
                                        <th id="crePhaseColumnHeader">时相</th>
                                        <th style="width:58px;">操作</th>
                                    </tr>
                                </thead>
                                <tbody id="creScenarioBody"></tbody>
                            </table>
                        </div>
                        <div class="cre-right-toolbar">
                            <button class="cre-mini-btn" data-role="add-row" title="新增"><i class="fas fa-plus"></i></button>
                            <button class="cre-mini-btn" data-role="delete-last-row" title="清空全部"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
                <div class="create-robustness-evaluation-footer">
                    <button class="cre-btn" data-role="cancel">取消</button>
                    <button class="cre-btn primary" data-role="confirm">开始评估</button>
                </div>
            </div>
        `;

        mountContainer.appendChild(this.modalEl);
        this.bindEvents();
        this.renderTable();
        window.addEventListener('keydown', this._boundEscHandler);
    }

    handleEsc(event) {
        if (event.key === 'Escape') {
            this.hide();
            if (typeof this.options.onCancel === 'function') {
                this.options.onCancel();
            }
        }
    }

    bindEvents() {
        if (!this.modalEl) return;

        const close = this.modalEl.querySelector('[data-role="close"]');
        const cancel = this.modalEl.querySelector('[data-role="cancel"]');
        const confirm = this.modalEl.querySelector('[data-role="confirm"]');
        const randomBtn = this.modalEl.querySelector('[data-role="random-generate"]');
        const regularBtn = this.modalEl.querySelector('[data-role="regular-generate"]');
        const addRowBtn = this.modalEl.querySelector('[data-role="add-row"]');
        const deleteLastRowBtn = this.modalEl.querySelector('[data-role="delete-last-row"]');
        const modeRadios = this.modalEl.querySelectorAll('input[name="cre-scenario-mode"]');
        const customCount = this.modalEl.querySelector('#creCustomCount');
        const positionInput = this.modalEl.querySelector('#crePositionUncertainty');
        const densityInput = this.modalEl.querySelector('#creDensityUncertainty');
        const phaseGroup = this.modalEl.querySelector('#crePhaseGroup4dct');
        const phase4dctToggle = this.modalEl.querySelector('#crePhase4dctToggle');
        const phaseChildren = Array.from(this.modalEl.querySelectorAll('.cre-phase-child'));
        const phaseGroupChildren = Array.from(this.modalEl.querySelectorAll('.cre-phase-child-4dct'));
        const phaseChildRows = Array.from(this.modalEl.querySelectorAll('.cre-phase-child-row'));
        const phaseDropdown = this.modalEl.querySelector('#crePhaseDropdown');
        const phaseTrigger = this.modalEl.querySelector('#crePhaseTrigger');
        const phaseTriggerText = this.modalEl.querySelector('#crePhaseTriggerText');
        const phasePanel = this.modalEl.querySelector('#crePhasePanel');
        let is4dctExpanded = true;

        close.addEventListener('click', () => this.hide());
        cancel.addEventListener('click', () => {
            this.hide();
            if (typeof this.options.onCancel === 'function') {
                this.options.onCancel();
            }
        });

        confirm.addEventListener('click', () => {
            const result = this.getFormData();
            if (!result.groupName) {
                alert('请输入组名');
                return;
            }
            this.hide();
            if (typeof this.options.onConfirm === 'function') {
                this.options.onConfirm(result);
            }
        });

        modeRadios.forEach((radio) => {
            radio.addEventListener('change', () => {
                const mode = this.getScenarioMode();
                customCount.disabled = mode !== 'custom';
            });
        });

        customCount.addEventListener('input', () => {
            if (this.getScenarioMode() !== 'custom') return;
        });

        positionInput.addEventListener('input', () => {
            this.refreshAxisTagValues();
        });

        regularBtn.addEventListener('click', () => {
            this.scenarioRows = this.generateRegularRows(this.getTargetScenarioCount());
            this.renderTable();
        });

        randomBtn.addEventListener('click', () => {
            this.scenarioRows = this.generateRandomRows(this.getTargetScenarioCount());
            this.renderTable();
        });

        addRowBtn.addEventListener('click', () => {
            if (this.scenarioRows.length >= 81) return;
            this.scenarioRows.push({
                rl: 0,
                is: 0,
                pa: 0,
                density: this.normalizeNumber(densityInput.value, 3.5),
                phase: (() => {
                    const selectedPhases = this.getSelectedPhases();
                    const crownedPhase = this.getCrownedPhase();
                    return selectedPhases.includes(crownedPhase)
                        ? crownedPhase
                        : (selectedPhases[0] || crownedPhase);
                })()
            });
            this.renderTable();
        });

        deleteLastRowBtn.addEventListener('click', () => {
            this.scenarioRows = [];
            this.renderTable();
        });

        const syncPhaseGroupState = () => {
            const checkedCount = phaseGroupChildren.filter((item) => item.checked).length;
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
            if (phasePanel) {
                // 恢复到默认样式，避免下次打开继承旧的 max-height/top/bottom
                phasePanel.style.maxHeight = '';
                phasePanel.style.top = '';
                phasePanel.style.bottom = '';
                phasePanel.style.marginTop = '';
            }
        };
        const openPhaseDropdown = () => {
            if (!phaseDropdown || !phaseTrigger) return;
            phaseDropdown.classList.add('open');
            phaseTrigger.setAttribute('aria-expanded', 'true');

            // 根据弹窗剩余高度动态调整下拉面板方向和最大高度，避免内容被截断
            if (phasePanel) {
                const triggerRect = phaseTrigger.getBoundingClientRect();
                const dialogEl = this.modalEl.querySelector('.create-robustness-evaluation-dialog');
                const dialogRect = dialogEl ? dialogEl.getBoundingClientRect() : null;

                const padding = 8; // 预留一点边距
                const availableDown = dialogRect
                    ? (dialogRect.bottom - triggerRect.bottom - padding)
                    : (window.innerHeight - triggerRect.bottom - padding);
                const availableUp = dialogRect
                    ? (triggerRect.top - dialogRect.top - padding)
                    : (triggerRect.top - padding);

                const preferDown = availableDown >= availableUp;
                const chosen = Math.max(160, Math.floor(preferDown ? availableDown : availableUp));

                phasePanel.style.maxHeight = `${Math.min(chosen, 520)}px`;

                if (preferDown) {
                    phasePanel.style.top = 'calc(100% + 2px)';
                    phasePanel.style.bottom = '';
                    phasePanel.style.marginTop = '4px';
                } else {
                    phasePanel.style.top = 'auto';
                    phasePanel.style.bottom = 'calc(100% + 2px)';
                    phasePanel.style.marginTop = '';
                }
            }
        };

        if (phaseTrigger && phaseDropdown) {
            phaseTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if (phaseDropdown.classList.contains('open')) {
                    closePhaseDropdown();
                } else {
                    openPhaseDropdown();
                }
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

        this.modalEl.addEventListener('click', (e) => {
            if (e.target === this.modalEl && this.options.mountContainer === document.body) {
                this.hide();
            }
        });
    }

    getScenarioMode() {
        if (!this.modalEl) return '12';
        const checked = this.modalEl.querySelector('input[name="cre-scenario-mode"]:checked');
        return checked ? checked.value : '12';
    }

    getTargetScenarioCount() {
        if (!this.modalEl) return 12;
        const mode = this.getScenarioMode();
        if (mode === '12') return 12;
        if (mode === '21') return 21;
        const custom = this.modalEl.querySelector('#creCustomCount');
        const value = parseInt(custom.value, 10);
        return Number.isFinite(value) ? Math.max(1, Math.min(81, value)) : 12;
    }

    normalizeNumber(value, fallback) {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    getSelectedPhases() {
        if (!this.modalEl) return ['MIP 14 20251230'];
        const selected = Array.from(this.modalEl.querySelectorAll('.cre-phase-child:checked'))
            .map((item) => item.dataset.phase)
            .filter(Boolean);
        return selected.length ? selected : ['MIP 14 20251230'];
    }

    getSelectedUncertaintyPhases() {
        if (!this.modalEl) return ['MIP 14 20251230'];
        return Array.from(this.modalEl.querySelectorAll('.cre-phase-child:checked'))
            .map((item) => item.dataset.phase)
            .filter(Boolean);
    }

    getCrownedPhase() {
        if (!this.modalEl) return 'MIP 14 20251230';

        const crownLabel = this.modalEl.querySelector('.cre-phase-label.with-crown');
        const phaseInputId = crownLabel ? crownLabel.getAttribute('for') : null;
        if (!phaseInputId) return 'MIP 14 20251230';

        const escapedId = (window.CSS && typeof CSS.escape === 'function')
            ? CSS.escape(phaseInputId)
            : phaseInputId;
        const inputEl = this.modalEl.querySelector(`#${escapedId}`);
        const phase = inputEl && inputEl.dataset ? inputEl.dataset.phase : null;
        return phase || 'MIP 14 20251230';
    }

    shouldShowPhaseColumn() {
        return this.scenarioRows.some((row) => !!row.phase);
    }

    expandRowsByPhases(baseRows) {
        const phases = this.getSelectedUncertaintyPhases();
        if (!phases.length) {
            return baseRows.map((row) => ({
                ...row,
                phase: null
            }));
        }
        const rows = [];
        phases.forEach((phase) => {
            baseRows.forEach((row) => {
                rows.push({
                    rl: row.rl,
                    is: row.is,
                    pa: row.pa,
                    density: row.density,
                    phase
                });
            });
        });
        return rows;
    }

    generateRegularRows(count) {
        const position = this.modalEl
            ? this.normalizeNumber(this.modalEl.querySelector('#crePositionUncertainty').value, 0.5)
            : 0.5;
        const density = this.modalEl
            ? this.normalizeNumber(this.modalEl.querySelector('#creDensityUncertainty').value, 3.5)
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
        return this.expandRowsByPhases(baseRows);
    }

    generateRandomRows(count) {
        const position = this.modalEl
            ? this.normalizeNumber(this.modalEl.querySelector('#crePositionUncertainty').value, 0.5)
            : 0.5;
        const density = this.modalEl
            ? this.normalizeNumber(this.modalEl.querySelector('#creDensityUncertainty').value, 3.5)
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
        return this.expandRowsByPhases(baseRows);
    }

    to2(value) {
        return Number(value.toFixed(2));
    }

    getShortPhaseLabel(phase) {
        const text = String(phase || '').trim();
        if (!text) return '—';
        if (/^mip\b/i.test(text)) return 'MIP';
        const pctMatch = text.match(/(\d+%)/);
        if (pctMatch) return pctMatch[1];
        return text;
    }

    renderTable() {
        if (!this.modalEl) return;
        const tbody = this.modalEl.querySelector('#creScenarioBody');
        const scenarioCount = this.modalEl.querySelector('#creScenarioCount');
        const phaseHeader = this.modalEl.querySelector('#crePhaseColumnHeader');
        const showPhaseColumn = this.shouldShowPhaseColumn();
        const phaseOptions = showPhaseColumn ? this.getSelectedPhases() : [];
        const crownedPhase = showPhaseColumn ? this.getCrownedPhase() : null;

        if (phaseHeader) {
            phaseHeader.style.display = showPhaseColumn ? '' : 'none';
        }

        const crownIconSvg = `
            <svg class="cre-phase-crown" viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                    <linearGradient id="crePhaseCrownGradRow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffd978"></stop>
                        <stop offset="100%" stop-color="#f5b942"></stop>
                    </linearGradient>
                </defs>
                <path fill="url(#crePhaseCrownGradRow)" d="M3.2 17.8l1.6-9.4 5.1 4.1L12 6l2.1 6.5 5.1-4.1 1.6 9.4H3.2zm1.5 2.2h14.6v1.4H4.7V20z"></path>
            </svg>
        `;

        tbody.innerHTML = this.scenarioRows.map((row, index) => {
            const rowPhase = showPhaseColumn
                ? (phaseOptions.includes(row.phase)
                    ? row.phase
                    : (phaseOptions.includes(crownedPhase)
                        ? crownedPhase
                        : phaseOptions[0]))
                : null;

            // 确保行的相位值与下拉选项一致，避免 value 不在 options 中导致显示错乱
            if (showPhaseColumn && row.phase !== rowPhase) {
                row.phase = rowPhase;
            }

            return `
            <tr data-row-index="${index}">
                <td>${index + 1}</td>
                <td><input class="cre-cell-input" data-field="rl" value="${row.rl.toFixed(2)}" /></td>
                <td><input class="cre-cell-input" data-field="is" value="${row.is.toFixed(2)}" /></td>
                <td><input class="cre-cell-input" data-field="pa" value="${row.pa.toFixed(2)}" /></td>
                <td><input class="cre-cell-input" data-field="density" value="${row.density.toFixed(2)}" /></td>
                ${showPhaseColumn ? `<td>
                    <div class="cre-phase-dropdown cre-row-phase-dropdown" data-row-phase-index="${index}">
                        <button class="cre-phase-trigger" type="button" aria-expanded="false">
                            ${rowPhase === crownedPhase ? crownIconSvg : ''}
                            <span class="cre-row-phase-trigger-text">${this.getShortPhaseLabel(rowPhase)}</span>
                            <i class="fas fa-chevron-down" aria-hidden="true"></i>
                        </button>
                        <div class="cre-phase-panel" role="listbox">
                            ${phaseOptions.map((phase) => `
                                <div class="cre-phase-item ${phase === rowPhase ? 'active' : ''}" data-phase-value="${phase}">
                                    ${phase === crownedPhase ? crownIconSvg : ''}
                                    <span class="cre-phase-label">${this.getShortPhaseLabel(phase)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </td>` : ''}
                <td>
                    <button class="cre-del-btn" data-role="delete-row" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        }).join('');
        scenarioCount.textContent = String(this.scenarioRows.length);

        tbody.querySelectorAll('.cre-cell-input').forEach((input) => {
            input.addEventListener('change', () => {
                const rowEl = input.closest('tr');
                const rowIndex = parseInt(rowEl.dataset.rowIndex, 10);
                const field = input.dataset.field;
                const value = this.normalizeNumber(input.value, 0);
                this.scenarioRows[rowIndex][field] = value;
                input.value = value.toFixed(2);
            });
        });

        const closeRowPhaseDropdowns = () => {
            const openDws = tbody.querySelectorAll('.cre-row-phase-dropdown.open');
            openDws.forEach((dw) => {
                dw.classList.remove('open');
                const trigger = dw.querySelector('.cre-phase-trigger');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        };

        tbody.querySelectorAll('.cre-row-phase-dropdown').forEach((dw) => {
            const rowIndex = parseInt(dw.dataset.rowPhaseIndex, 10);
            const trigger = dw.querySelector('.cre-phase-trigger');
            const panel = dw.querySelector('.cre-phase-panel');
            const triggerText = dw.querySelector('.cre-row-phase-trigger-text');

            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = dw.classList.contains('open');
                    closeRowPhaseDropdowns();
                    if (!isOpen) {
                        dw.classList.add('open');
                        trigger.setAttribute('aria-expanded', 'true');
                    }
                });
            }

            if (panel) {
                panel.querySelectorAll('.cre-phase-item').forEach((itemEl) => {
                    itemEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const phase = itemEl.dataset.phaseValue;
                        if (!phase) return;

                        this.scenarioRows[rowIndex].phase = phase;

                        if (triggerText) triggerText.textContent = this.getShortPhaseLabel(phase);

                        panel.querySelectorAll('.cre-phase-item.active').forEach((activeEl) => {
                            activeEl.classList.remove('active');
                        });
                        itemEl.classList.add('active');

                        dw.classList.remove('open');
                        if (trigger) trigger.setAttribute('aria-expanded', 'false');
                    });
                });
            }
        });

        if (!this._rowPhaseDropdownDocClickHandler) {
            this._rowPhaseDropdownDocClickHandler = (e) => {
                if (!this.modalEl) return;
                const clicked = e.target && e.target.closest ? e.target.closest('.cre-row-phase-dropdown') : null;
                if (clicked) return;
                this.modalEl.querySelectorAll('.cre-row-phase-dropdown.open').forEach((openDw) => {
                    openDw.classList.remove('open');
                    const trigger = openDw.querySelector('.cre-phase-trigger');
                    if (trigger) trigger.setAttribute('aria-expanded', 'false');
                });
            };
            document.addEventListener('click', this._rowPhaseDropdownDocClickHandler);
        }

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

    refreshAxisTagValues() {
        if (!this.modalEl) return;
        const value = this.normalizeNumber(this.modalEl.querySelector('#crePositionUncertainty').value, 0.5).toFixed(2);
        const text = `${value} cm`;
        const ids = ['creTopTag', 'creBottomTag', 'creLeftTag', 'creRightTag', 'creFrontTag', 'creBackTag'];
        ids.forEach((id) => {
            const el = this.modalEl.querySelector(`#${id}`);
            if (el) el.textContent = text;
        });
    }

    getFormData() {
        if (!this.modalEl) return null;
        const groupName = this.modalEl.querySelector('#creGroupName').value.trim();
        const scenarioMode = this.getScenarioMode();
        const customCount = this.modalEl.querySelector('#creCustomCount').value;
        const positionUncertainty = this.normalizeNumber(this.modalEl.querySelector('#crePositionUncertainty').value, 0.5);
        const densityUncertainty = this.normalizeNumber(this.modalEl.querySelector('#creDensityUncertainty').value, 3.5);
        const selectedPhaseUncertainties = Array.from(this.modalEl.querySelectorAll('.cre-phase-child:checked'))
            .map((item) => item.dataset.phase)
            .filter(Boolean);
        return {
            groupName,
            scenarioMode,
            customCount: parseInt(customCount, 10),
            positionUncertainty,
            densityUncertainty,
            selectedPhaseUncertainties,
            scenarios: this.scenarioRows.map((row, index) => ({
                index: index + 1,
                rl: row.rl,
                is: row.is,
                pa: row.pa,
                density: row.density,
                phase: row.phase || null
            }))
        };
    }

    hide() {
        if (!this.modalEl) return;
        if (this._phaseDropdownDocClickHandler) {
            document.removeEventListener('click', this._phaseDropdownDocClickHandler);
            this._phaseDropdownDocClickHandler = null;
        }
        if (this._rowPhaseDropdownDocClickHandler) {
            document.removeEventListener('click', this._rowPhaseDropdownDocClickHandler);
            this._rowPhaseDropdownDocClickHandler = null;
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
    window.CreateRobustnessEvaluationComponent = CreateRobustnessEvaluationComponent;
}
