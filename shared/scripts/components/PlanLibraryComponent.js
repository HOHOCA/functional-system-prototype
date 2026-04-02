/**
 * 公共组件 — 生成计划库（全屏弹窗 / 嵌入式预览）
 * 依赖（需在页面中先于本脚本引入）：PromptProgressModalComponent、PromptSimpleConfirmModalComponent、PlanLibraryGeneratedModalComponent。
 * `.plc-center` 内 `#planLibraryCenterRoot` 为上下三等分；上、中两格再左右两等分（`.plc-center-half`）；中格左侧可再嵌套左右两等分（`.plc-center-subhalf`）；下格整宽。
 * 上左：CrossSectionView2D；中左左：CoronalView2D；中左右：SagittalView2D（需页面引入对应脚本与 styles_plan_view_2d.css，或由本组件按需注入样式表）。
 * 右侧与底部随当前激活射束辐射类型切换：PROTON → Proton 3D/BEV、PBS 列表、质子射束优化设置；PHOTON → Photon 3D/BEV、射束列表为 DMLC、射束优化设置为 PhotonProtonBeamOptimizationSettings。
 */
class PlanLibraryComponent {
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
        this._railSubInstances = { roi: null, poi: null, dose: null };
        this._centerView2dInstances = { cross: null, coronal: null, sagittal: null };
        this._protonUiInstances = { view3d: null, bev: null, beamList: null, beamOpt: null };
        this._photonUiInstances = { view3d: null, bev: null, beamList: null, beamOpt: null };
        this._plcBottomTab = 'beam-list';
        this._plcLastRadMode = null;
        this._clinicalGoalsOpen = false;
        this._optSettingsOpen = false;
        this._optSettingsIterations = 20;
        this.ensureStyles();
    }

    /**
     * 计划优化模块运行在 shell 页的 iframe 中时，
     * 将当前 iframe 临时抬到最顶层，确保“生成计划库”可以盖住外层顶部导航。
     * 这里不把弹窗 DOM 挂到父文档，避免破坏组件内部对 document 的查询逻辑。
     */
    enterFullscreenBridge() {
        try {
            const frameEl = typeof window !== 'undefined' ? window.frameElement : null;
            if (!frameEl || frameEl.nodeType !== 1) return;

            const parentDoc = frameEl.ownerDocument;
            if (!parentDoc?.head) return;

            const styleId = 'plc-plan-library-iframe-bridge-style';
            if (!parentDoc.getElementById(styleId)) {
                const style = parentDoc.createElement('style');
                style.id = styleId;
                style.textContent = `
                    iframe.plc-plan-library-iframe-bridge{
                        position: fixed !important;
                        inset: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        max-width: none !important;
                        max-height: none !important;
                        z-index: 2147483646 !important;
                        display: block !important;
                        border: none !important;
                        margin: 0 !important;
                    }
                `;
                parentDoc.head.appendChild(style);
            }

            if (frameEl.classList) {
                frameEl.classList.add('plc-plan-library-iframe-bridge');
            } else {
                frameEl.className = `${frameEl.className || ''} plc-plan-library-iframe-bridge`.trim();
            }
        } catch (_) {
            /* ignore */
        }
    }

    exitFullscreenBridge() {
        try {
            const frameEl = typeof window !== 'undefined' ? window.frameElement : null;
            if (!frameEl || frameEl.nodeType !== 1) return;
            frameEl.classList?.remove('plc-plan-library-iframe-bridge');
        } catch (_) {
            /* ignore */
        }
    }

    /**
     * 计算 shared/styles 相对路径前缀。
     * - component-gallery/* → ../shared/styles/
     * - *-client/modules/* → ../../shared/styles/
     * - 根目录 index.html 等 → shared/styles/
     */
    getSharedStylesPrefix() {
        try {
            const p = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
            if (p.includes('/component-gallery/')) return '../shared/styles/';
            if (p.includes('-client/modules/')) return '../../shared/styles/';
        } catch (_) {
            // ignore
        }
        return 'shared/styles/';
    }

    ensureStyles() {
        this.ensurePlanView2dStylesheet();
        this.ensureView3dStylesheet();
        const sid = 'plan-library-component-styles-v1';
        [
            'photon-plan-library-styles',
            'photon-plan-library-styles-v2',
            'photon-plan-library-styles-v3',
            'photon-plan-library-styles-v4',
            'photon-plan-library-styles-v5'
        ].forEach((id) => document.getElementById(id)?.remove());
        if (document.getElementById(sid)) return;
        const style = document.createElement('style');
        style.id = sid;
        style.textContent = `
            .plc-mask{
                position: fixed;
                inset: 0;
                z-index: 10070;
                background: rgba(0,0,0,0.72);
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Microsoft YaHei', 'PingFang SC', -apple-system, sans-serif;
                color: #ddd;
                font-size: 12px;
            }
            .plc-mask.embedded{ position: absolute; }
            .plc-mask.embedded .plc-dialog{
                width: calc(100% - 6px);
                height: calc(100% - 6px);
                max-width: none;
                max-height: none;
                border-radius: 4px;
            }
            .plc-dialog{
                position: relative;
                width: 100vw;
                height: 100vh;
                max-width: none;
                max-height: none;
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 0;
                box-shadow: none;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .plc-header{
                height: 40px;
                flex-shrink: 0;
                border-bottom: 1px solid #333;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 12px;
                background: #222;
            }
            .plc-header h3{
                margin: 0;
                font-size: 15px;
                font-weight: 500;
                color: #f2f2f2;
            }
            .plc-close{
                border: none;
                background: transparent;
                color: #9a9a9a;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .plc-close:hover{ background: rgba(255,255,255,0.08); color: #fff; }
            .plc-main{
                flex: 1;
                min-height: 0;
                display: flex;
                flex-direction: row;
                position: relative;
                z-index: 0;
                isolation: isolate;
            }
            .plc-rail{
                width: 36px;
                flex-shrink: 0;
                background: #1e1e1e;
                border-right: 1px solid #333;
                display: flex;
                flex-direction: column;
                padding: 8px 0;
                gap: 4px;
                align-items: stretch;
            }
            .plc-rail-tab{
                writing-mode: vertical-rl;
                text-orientation: mixed;
                transform: matrix(-1, 0, 0, -1, 0, 0) rotate(180deg);
                font-size: 11px;
                color: #888;
                padding: 10px 4px;
                border-radius: 3px;
                cursor: pointer;
                letter-spacing: 0.02em;
                border: none;
                background: transparent;
                font: inherit;
                width: 100%;
                box-sizing: border-box;
                text-align: center;
            }
            .plc-rail-tab.is-active{
                background: rgba(58,172,222,0.18);
                color: #3aacde;
                font-weight: 500;
            }
            .plc-sidebar-panel{
                display: none;
            }
            .plc-sidebar-panel.is-active{
                flex: 1 1 auto;
                min-height: 0;
                display: block;
                overflow: visible;
            }
            /* ROI/POI/DOSE：与独立使用一致的列 flex；列表随内容增高，工具栏/属性区 margin-top:auto 置底；去掉属性区 300px 与列表区二次滚动 */
            .plc-sidebar-panel[data-plc-panel="roi"].is-active,
            .plc-sidebar-panel[data-plc-panel="poi"].is-active,
            .plc-sidebar-panel[data-plc-panel="dose"].is-active{
                display: flex;
                flex-direction: column;
                overflow: visible;
            }
            .plc-sidebar-panel[data-plc-panel="roi"] .plc-sub-mount,
            .plc-sidebar-panel[data-plc-panel="poi"] .plc-sub-mount,
            .plc-sidebar-panel[data-plc-panel="dose"] .plc-sub-mount{
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                flex-direction: column;
                overflow: visible;
            }
            .plc-sidebar-panel[data-plc-panel="roi"] .roi-panel-container,
            .plc-sidebar-panel[data-plc-panel="poi"] .poi-panel-container{
                flex: 1 1 auto;
                min-height: 100%;
                max-height: none;
                overflow: visible;
            }
            .plc-sidebar-panel[data-plc-panel="dose"] .dose-panel-container{
                flex: 1 1 auto;
                min-height: 100%;
                max-height: none;
                overflow: visible;
            }
            .plc-sidebar-panel[data-plc-panel="roi"] .roi-list-section,
            .plc-sidebar-panel[data-plc-panel="poi"] .poi-list-section{
                flex: 0 0 auto;
                flex-grow: 0;
                min-height: 0;
                max-height: none;
                overflow: visible;
            }
            .plc-sidebar-panel[data-plc-panel="roi"] .roi-info-section,
            .plc-sidebar-panel[data-plc-panel="poi"] .poi-info-section{
                max-height: none;
                overflow: visible;
            }
            .plc-sidebar-panel[data-plc-panel="dose"] .dose-levels-section{
                flex: 0 0 auto;
                overflow: visible;
            }
            .plc-sub-mount{
                min-height: 80px;
            }
            .plc-sub-placeholder{
                padding: 12px 8px;
                color: #888;
                font-size: 12px;
                line-height: 1.5;
            }
            .plc-sidebar{
                width: 268px;
                flex-shrink: 0;
                background: #1f1f1f;
                border-right: 1px solid #333;
                display: flex;
                flex-direction: column;
                min-height: 0;
            }
            .plc-sidebar-scroll{
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                flex-direction: column;
                overflow-x: hidden;
                overflow-y: auto;
                padding: 10px 12px 8px;
            }
            .plc-sidebar-scroll:has(#plc-panel-plan.is-active){
                overflow-y: hidden;
            }
            .plc-sidebar-panel[data-plc-panel="plan"].is-active{
                display: flex;
                flex-direction: column;
                flex: 1 1 auto;
                min-height: 0;
                overflow: hidden;
            }
            .plc-plan-basic{
                flex-shrink: 0;
            }
            .plc-plan-beam-section{
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                margin-top: 14px;
            }
            .plc-plan-beam-section .plc-beam-head{
                flex-shrink: 0;
                margin-top: 0;
            }
            .plc-plan-beam-scroll{
                flex: 1 1 auto;
                min-height: 0;
                overflow-x: hidden;
                overflow-y: auto;
                padding-bottom: 4px;
            }
            .plc-section-title{
                font-size: 12px;
                color: #c4c4c4;
                font-weight: 500;
                margin: 0 0 10px;
                padding-bottom: 6px;
                border-bottom: 1px solid #333;
            }
            .plc-row{
                display: grid;
                grid-template-columns: 72px 1fr;
                gap: 8px;
                align-items: center;
                margin-bottom: 8px;
            }
            .plc-row .plc-label{
                color: #b0b0b0;
                text-align: right;
                white-space: nowrap;
            }
            .plc-row .plc-label .plc-req{
                color: #e54545;
                margin-right: 2px;
            }
            .plc-control{
                height: 28px;
                border: 1px solid #3b3b3b;
                background: #141414;
                color: #eee;
                border-radius: 3px;
                padding: 0 8px;
                font-size: 12px;
                outline: none;
                width: 100%;
                min-width: 0;
                font-family: inherit;
            }
            .plc-control:focus{
                border-color: #3aacde;
                box-shadow: 0 0 0 1px rgba(58,172,222,0.2);
            }
            .plc-control:disabled, .plc-control[readonly]{
                background: #1a1a1a;
                color: #aaa;
            }
            .plc-control.plc-display-field{
                pointer-events: none;
                cursor: default;
            }
            select.plc-control{
                appearance: none;
                background-image: linear-gradient(45deg, transparent 50%, #777 50%),
                    linear-gradient(135deg, #777 50%, transparent 50%);
                background-position: calc(100% - 11px) 10px, calc(100% - 6px) 10px;
                background-size: 4px 4px, 4px 4px;
                background-repeat: no-repeat;
                padding-right: 20px;
            }
            input.plc-control[type="number"]::-webkit-outer-spin-button,
            input.plc-control[type="number"]::-webkit-inner-spin-button{
                -webkit-appearance: none;
                appearance: none;
                margin: 0;
            }
            input.plc-control[type="number"]{
                -moz-appearance: textfield;
                appearance: textfield;
            }
            .plc-inline-unit{
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .plc-inline-unit .plc-control{ flex: 1; }
            .plc-unit{ color: #888; flex-shrink: 0; font-size: 11px; }
            .plc-beam-head{
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 14px;
            }
            .plc-beam-head .plc-section-title{
                margin: 0;
                padding: 0;
                border: none;
            }
            .plc-icon-btns{ display: flex; gap: 6px; }
            .plc-icon-btn{
                width: 26px;
                height: 26px;
                border: none;
                border-radius: 3px;
                background: transparent;
                color: #3aacde;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .plc-icon-btn:hover{ background: rgba(58,172,222,0.12); }
            .plc-icon-btn.danger{ color: #c75c5c; }
            .plc-icon-btn.danger:hover{ background: rgba(199,92,92,0.12); }
            .plc-beam-list{
                display: flex;
                flex-direction: column;
                gap: 14px;
                margin-top: 8px;
            }
            .plc-beam-card{
                position: relative;
                margin-top: 6px;
                padding: 14px 10px 10px;
                border: 1px solid transparent;
                border-radius: 4px;
                background: #1a1a1a;
                cursor: pointer;
                box-sizing: border-box;
            }
            .plc-beam-card.is-active{
                border-color: #3aacde;
                box-shadow: 0 0 0 1px rgba(58,172,222,0.35);
            }
            .plc-beam-card .plc-beam-card-body{
                pointer-events: auto;
            }
            .plc-beam-card .plc-control{
                cursor: pointer;
            }
            .plc-beam-num{
                position: absolute;
                left: 10px;
                top: 0;
                transform: translateY(-50%);
                min-width: 30px;
                height: 22px;
                padding: 0 6px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 500;
                border-radius: 3px;
                background: #353535;
                color: #bbb;
                border: 1px solid #454545;
                box-sizing: border-box;
            }
            .plc-beam-card.is-active .plc-beam-num{
                background: #2a7fad;
                border-color: #3aacde;
                color: #fff;
            }
            .plc-clinical-wrap{
                display: none;
                flex-shrink: 0;
                padding: 8px 12px 10px;
                border-top: 1px solid #333;
                background: #1f1f1f;
            }
            .plc-sidebar[data-plc-sidebar-tab="plan"] .plc-clinical-wrap{
                display: block;
            }
            .plc-clinical{
                margin: 0;
                padding: 0;
                border: none;
                font-size: 12px;
                color: #9a9a9a;
            }
            .plc-clinical a{
                color: #3aacde;
                text-decoration: none;
                margin-left: 6px;
            }
            .plc-clinical a:hover{ text-decoration: underline; }
            .plc-sidebar-footer{
                flex-shrink: 0;
                padding: 10px 12px 12px;
                border-top: 1px solid #333;
                background: #1e1e1e;
            }
            .plc-btn-primary{
                width: 100%;
                height: 36px;
                border: none;
                border-radius: 4px;
                background: #2a9dd0;
                color: #fff;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                font-family: inherit;
            }
            .plc-btn-primary:hover{ background: #33addf; }

            .plc-center{
                flex: 1;
                min-width: 0;
                min-height: 0;
                background: #161616;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .plc-center-zone{
                flex: 1 1 0;
                min-height: 0;
                box-sizing: border-box;
                border-bottom: 1px solid #2c2c2c;
                background: #161616;
            }
            .plc-center-zone:nth-child(2){
                background: #181818;
            }
            .plc-center-zone:last-child{
                border-bottom: none;
            }
            .plc-center-zone.plc-center-zone--split{
                display: flex;
                flex-direction: row;
                min-width: 0;
            }
            .plc-center-half{
                flex: 1 1 0;
                min-width: 0;
                min-height: 0;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
            }
            .plc-center-half.plc-center-half--split{
                flex-direction: row;
            }
            .plc-view2d-mount,
            .plc-proton-mount{
                flex: 1 1 0;
                min-width: 0;
                min-height: 0;
                overflow: hidden;
                position: relative;
            }
            .plc-center-zone.plc-center-zone--bottom{
                display: flex;
                flex-direction: column;
                min-height: 0;
            }
            .plc-bottom-tabs{
                flex-shrink: 0;
                display: flex;
                gap: 0;
                align-items: stretch;
                border-bottom: 1px solid #2c2c2c;
                background: #1a1a1a;
            }
            .plc-bottom-tab{
                padding: 8px 14px;
                border: none;
                background: transparent;
                color: #888;
                cursor: pointer;
                font-size: 12px;
                font-family: inherit;
                border-bottom: 2px solid transparent;
                margin-bottom: -1px;
            }
            .plc-bottom-tab:hover{ color: #ccc; }
            .plc-bottom-tab.is-active{
                color: #f2f2f2;
                border-bottom-color: #33addf;
            }
            .plc-bottom-panels{
                flex: 1 1 0;
                min-height: 0;
                position: relative;
                background: #161616;
            }
            .plc-bottom-panel{
                position: absolute;
                inset: 0;
                overflow: auto;
                display: none;
                box-sizing: border-box;
            }
            .plc-bottom-panel.is-active{ display: block; }
            .plc-center-half:first-child{
                border-right: 1px solid #2c2c2c;
            }
            .plc-center-subhalf{
                flex: 1 1 0;
                min-width: 0;
                min-height: 0;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
            }
            .plc-center-subhalf:first-child{
                border-right: 1px solid #2c2c2c;
            }

            .plc-cg-overlay{
                position: absolute;
                inset: 0;
                z-index: 100;
                background: rgba(0,0,0,0.72);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px;
                box-sizing: border-box;
            }
            .plc-cg-overlay[hidden]{
                display: none !important;
            }
            .plc-cg-shell{
                width: min(1080px, 100%);
                height: min(620px, 100%);
                max-height: 100%;
                background: #1c1c1c;
                border: 1px solid #3d3d3d;
                border-radius: 6px;
                box-shadow: 0 14px 36px rgba(0,0,0,0.55);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                font-family: inherit;
            }
            .plc-cg-head{
                flex-shrink: 0;
                height: 40px;
                padding: 0 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid #333;
                background: #222;
            }
            .plc-cg-head h3{
                margin: 0;
                font-size: 15px;
                font-weight: 500;
                color: #f0f0f0;
            }
            .plc-cg-head-actions{
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .plc-cg-btn-ghost{
                box-sizing: border-box;
                border: 1px solid #454545;
                background: #2a2a2a;
                color: #ccc;
                font-size: 12px;
                padding: 5px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
            }
            .plc-cg-btn-ghost:hover{ background: #333; color: #fff; }
            .plc-cg-close{
                border: none;
                background: transparent;
                color: #9a9a9a;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .plc-cg-close:hover{ background: rgba(255,255,255,0.08); color: #fff; }
            .plc-cg-body{
                flex: 1;
                min-height: 0;
                display: flex;
                flex-direction: row;
            }
            .plc-cg-aside{
                width: 220px;
                flex-shrink: 0;
                border-right: 1px solid #333;
                background: #1a1a1a;
                display: flex;
                flex-direction: column;
                padding: 10px;
                gap: 10px;
                box-sizing: border-box;
            }
            .plc-cg-source{
                width: 100%;
                margin: 0;
                padding: 6px 8px;
                border-radius: 3px;
                border: 1px solid #454545;
                background: #262626;
                color: #ddd;
                font-size: 11px;
                font-family: inherit;
                line-height: 1.4;
                word-break: break-word;
                box-sizing: border-box;
            }
            .plc-cg-roi-tree{
                flex: 1;
                min-height: 0;
                overflow: auto;
                font-size: 12px;
                color: #bbb;
            }
            .plc-cg-roi-group{ margin-bottom: 12px; }
            .plc-cg-roi-group-title{
                color: #888;
                font-size: 11px;
                margin-bottom: 6px;
            }
            .plc-cg-roi-item{
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 0 4px 4px;
                cursor: default;
            }
            .plc-cg-dot{
                width: 8px;
                height: 8px;
                border-radius: 50%;
                flex-shrink: 0;
            }
            .plc-cg-table .plc-cg-color-cell{
                text-align: center;
                vertical-align: middle;
                width: 44px;
                white-space: nowrap;
            }
            .plc-cg-swatch{
                display: inline-block;
                width: 28px;
                height: 18px;
                border-radius: 3px;
                border: 1px solid rgba(255,255,255,0.28);
                box-shadow: inset 0 0 0 1px rgba(0,0,0,0.4);
                vertical-align: middle;
                box-sizing: border-box;
            }
            .plc-cg-main{
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                padding: 10px 14px;
                gap: 8px;
                overflow: hidden;
            }
            .plc-cg-req{
                color: #d85c5c;
                font-size: 11px;
                line-height: 1.45;
                flex-shrink: 0;
            }
            .plc-cg-req-note{
                display: inline-block;
                margin-top: 4px;
                color: #c9c9c9;
            }
            .plc-cg-main-top{
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
                flex-shrink: 0;
            }

            .plc-opt-overlay{
                position: absolute;
                inset: 0;
                z-index: 120;
                background: rgba(0,0,0,0.72);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px;
                box-sizing: border-box;
            }
            .plc-opt-overlay[hidden]{
                display: none !important;
            }
            .plc-opt-shell{
                width: min(400px, 100%);
                background: #1c1c1c;
                border: 1px solid #3d3d3d;
                border-radius: 6px;
                box-shadow: 0 14px 36px rgba(0,0,0,0.55);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                font-family: inherit;
            }
            .plc-opt-head{
                flex-shrink: 0;
                height: 40px;
                padding: 0 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid #333;
                background: #222;
            }
            .plc-opt-head h3{
                margin: 0;
                font-size: 15px;
                font-weight: 500;
                color: #f0f0f0;
            }
            .plc-opt-close{
                border: none;
                background: transparent;
                color: #9a9a9a;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .plc-opt-close:hover{ background: rgba(255,255,255,0.08); color: #fff; }
            .plc-opt-body{
                padding: 18px 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .plc-opt-row{
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .plc-opt-label{
                width: 92px;
                color: #ddd;
                font-size: 12px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .plc-opt-star{ color: #ff5f5f; font-size: 12px; }
            .plc-opt-input{
                width: 240px;
                height: 30px;
                border-radius: 4px;
                border: 1px solid #3a3a3a;
                background: #141414;
                color: #e6e6e6;
                padding: 0 10px;
                outline: none;
                font-family: inherit;
                font-size: 12px;
                box-sizing: border-box;
            }
            .plc-opt-input:focus{
                border-color: #33addf;
                box-shadow: 0 0 0 2px rgba(51,173,223,0.16);
            }
            .plc-opt-hint{
                color: #9f9f9f;
                font-size: 12px;
                margin-left: 102px;
            }
            .plc-opt-foot{
                padding: 12px 16px;
                border-top: 1px solid #333;
                background: #222;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            .plc-opt-btn{
                box-sizing: border-box;
                border: 1px solid #454545;
                background: #2a2a2a;
                color: #ccc;
                font-size: 12px;
                padding: 6px 14px;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
                min-width: 74px;
            }
            .plc-opt-btn:hover{ background: #333; color: #fff; }
            .plc-opt-btn-primary{
                border-color: #2a93c2;
                background: #2a93c2;
                color: #fff;
            }
            .plc-opt-btn-primary:hover{ background: #33addf; border-color: #33addf; }
            .plc-cg-scroll{
                flex: 1;
                min-height: 0;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                gap: 1px;
                background: #333;
                border-radius: 4px;
            }
            .plc-cg-tier{
                flex: 1 1 0;
                min-height: 0;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: #202020;
                border: none;
                border-radius: 0;
            }
            .plc-cg-tier-h{
                flex-shrink: 0;
                padding: 6px 10px;
                font-size: 12px;
                font-weight: 500;
                border-left: 4px solid #888;
            }
            .plc-cg-tier--hi .plc-cg-tier-h{
                border-left-color: #c75c5c;
                color: #e8a0a0;
                background: rgba(199,92,92,0.08);
            }
            .plc-cg-tier--mid .plc-cg-tier-h{
                border-left-color: #c9a227;
                color: #d4b85c;
                background: rgba(201,162,39,0.08);
            }
            .plc-cg-tier--lo .plc-cg-tier-h{
                border-left-color: #5a9a6a;
                color: #8fc49a;
                background: rgba(90,154,106,0.08);
            }
            .plc-cg-table-wrap{
                flex: 1 1 0;
                min-height: 0;
                overflow: auto;
            }
            .plc-cg-table{
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
                color: #ccc;
            }
            .plc-cg-table th,
            .plc-cg-table td{
                padding: 7px 8px;
                text-align: left;
                border-bottom: 1px solid #333;
                white-space: nowrap;
            }
            .plc-cg-table th{
                color: #888;
                font-weight: 500;
                background: #252525;
            }
            .plc-cg-table tr:last-child td{ border-bottom: none; }
            .plc-cg-table .plc-cg-ops{
                display: flex;
                gap: 8px;
                color: #6ab0d4;
            }
            .plc-cg-table .plc-cg-ops button{
                border: none;
                background: transparent;
                color: inherit;
                cursor: pointer;
                padding: 0;
                font-size: 12px;
            }
            .plc-cg-table .plc-cg-ops button:hover{ color: #9ccfe8; }
            .plc-cg-main-actions{
                flex-shrink: 0;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: flex-start;
                gap: 8px;
                padding-top: 10px;
                margin-top: 2px;
                border-top: 1px solid #333;
            }
            .plc-cg-foot{
                flex-shrink: 0;
                padding: 10px 14px;
                border-top: 1px solid #333;
                background: #1e1e1e;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 10px;
            }
            .plc-cg-foot-r{
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
            }
            .plc-cg-main-actions .plc-cg-btn-ghost{ padding: 6px 12px; }
            .plc-cg-foot .plc-cg-btn-ghost,
            .plc-cg-foot .plc-cg-btn-primary{
                box-sizing: border-box;
                height: 32px;
                min-width: 72px;
                padding: 0 16px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                line-height: 1.2;
            }
            .plc-cg-btn-primary{
                box-sizing: border-box;
                border: none;
                background: #2a9dd0;
                color: #fff;
                font-size: 13px;
                font-weight: 500;
                padding: 7px 22px;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
            }
            .plc-cg-btn-primary:hover{ background: #33addf; }
        `;
        document.head.appendChild(style);
    }

    /** 2D 视图依赖 shared/styles/styles_plan_view_2d.css（相对当前 HTML 页面解析路径）。 */
    ensurePlanView2dStylesheet() {
        const lid = 'plan-library-plan-view-2d-css';
        if (document.getElementById(lid)) return;
        const link = document.createElement('link');
        link.id = lid;
        link.rel = 'stylesheet';
        link.href = `${this.getSharedStylesPrefix()}styles_plan_view_2d.css`;
        document.head.appendChild(link);
    }

    /** Proton 3D / BEV 等依赖 shared/styles/styles_view_3d.css。 */
    ensureView3dStylesheet() {
        const lid = 'plan-library-view-3d-css';
        if (document.getElementById(lid)) return;
        const link = document.createElement('link');
        link.id = lid;
        link.rel = 'stylesheet';
        link.href = `${this.getSharedStylesPrefix()}styles_view_3d.css`;
        document.head.appendChild(link);
    }

    getActiveBeamCardFromModal() {
        if (!this.modalEl) return null;
        return this.modalEl.querySelector('#plcBeamList .plc-beam-card.is-active');
    }

    /** @returns {'PROTON'|'PHOTON'} */
    getActiveBeamRadiationType() {
        const card = this.getActiveBeamCardFromModal();
        if (!card) return 'PHOTON';
        return card.querySelector('[data-field="rad"]')?.value === 'PROTON' ? 'PROTON' : 'PHOTON';
    }

    isActiveBeamProton() {
        return this.getActiveBeamRadiationType() === 'PROTON';
    }

    mountPlcPlaceholder(el, msg) {
        if (!el) return;
        el.innerHTML = `<div class="plc-sub-placeholder">${this.escapeHtml(msg)}</div>`;
    }

    teardownProtonView3d() {
        const inst = this._protonUiInstances.view3d;
        this._protonUiInstances.view3d = null;
        if (!inst) return;
        try {
            inst.destroy?.();
        } catch (e) {
            /* noop */
        }
        document.getElementById('plcLibPlView3d')?.replaceChildren();
    }

    teardownProtonBev() {
        const inst = this._protonUiInstances.bev;
        this._protonUiInstances.bev = null;
        if (!inst) return;
        try {
            inst.destroy?.();
        } catch (e) {
            /* noop */
        }
        const el = document.getElementById('plcLibPlBev');
        if (el) el.innerHTML = '';
    }

    teardownProtonBeamList() {
        const inst = this._protonUiInstances.beamList;
        this._protonUiInstances.beamList = null;
        if (!inst) return;
        document.getElementById('plcLibBottomBeamListRoot')?.replaceChildren();
    }

    teardownProtonBeamOpt() {
        const inst = this._protonUiInstances.beamOpt;
        this._protonUiInstances.beamOpt = null;
        if (!inst) return;
        document.getElementById('plcLibBottomBeamOptRoot')?.replaceChildren();
    }

    teardownPhotonView3d() {
        const inst = this._photonUiInstances.view3d;
        this._photonUiInstances.view3d = null;
        if (!inst) return;
        try {
            inst.destroy?.();
        } catch (e) {
            /* noop */
        }
        document.getElementById('plcLibPlView3d')?.replaceChildren();
    }

    teardownPhotonBev() {
        const inst = this._photonUiInstances.bev;
        this._photonUiInstances.bev = null;
        if (!inst) return;
        try {
            inst.destroy?.();
        } catch (e) {
            /* noop */
        }
        const el = document.getElementById('plcLibPlBev');
        if (el) el.innerHTML = '';
    }

    teardownPhotonBeamList() {
        const inst = this._photonUiInstances.beamList;
        this._photonUiInstances.beamList = null;
        if (!inst) return;
        try {
            inst.destroy?.();
        } catch (e) {
            /* noop */
        }
        document.getElementById('plcLibBottomBeamListRoot')?.replaceChildren();
    }

    teardownPhotonBeamOpt() {
        const inst = this._photonUiInstances.beamOpt;
        this._photonUiInstances.beamOpt = null;
        if (!inst) return;
        try {
            inst.destroy?.();
        } catch (e) {
            /* noop */
        }
        document.getElementById('plcLibBottomBeamOptRoot')?.replaceChildren();
    }

    disposePlanLibraryCenterProtonPhoton() {
        [
            ['view3d', this._protonUiInstances],
            ['bev', this._protonUiInstances],
            ['beamList', this._protonUiInstances],
            ['beamOpt', this._protonUiInstances],
            ['view3d', this._photonUiInstances],
            ['bev', this._photonUiInstances],
            ['beamList', this._photonUiInstances],
            ['beamOpt', this._photonUiInstances]
        ].forEach(([k, bag]) => {
            const inst = bag[k];
            bag[k] = null;
            if (inst && typeof inst.destroy === 'function') {
                try {
                    inst.destroy();
                } catch (e) {
                    /* noop */
                }
            }
        });
        ['plcLibPlView3d', 'plcLibPlBev', 'plcLibBottomBeamListRoot', 'plcLibBottomBeamOptRoot'].forEach((id) => {
            document.getElementById(id)?.replaceChildren();
        });
    }

    setPlcBottomTab(key) {
        if (!this.modalEl || (key !== 'beam-list' && key !== 'beam-opt')) return;
        this._plcBottomTab = key;
        this.modalEl.querySelectorAll('.plc-bottom-tab[data-plc-bottom-tab]').forEach((btn) => {
            const on = btn.getAttribute('data-plc-bottom-tab') === key;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
            btn.tabIndex = on ? 0 : -1;
        });
        this.modalEl.querySelectorAll('.plc-bottom-panel[data-plc-bottom-panel]').forEach((p) => {
            const on = p.getAttribute('data-plc-bottom-panel') === key;
            p.classList.toggle('is-active', on);
            p.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
        this.syncPlanLibraryCenterMounts();
    }

    syncPlanLibraryCenterMounts() {
        if (!this.modalEl) return;
        const mode = this.getActiveBeamRadiationType();
        if (this._plcLastRadMode !== mode) {
            if (this._plcLastRadMode === 'PROTON') {
                this.teardownProtonView3d();
                this.teardownProtonBev();
                this.teardownProtonBeamList();
                this.teardownProtonBeamOpt();
            } else if (this._plcLastRadMode === 'PHOTON') {
                this.teardownPhotonView3d();
                this.teardownPhotonBev();
                this.teardownPhotonBeamList();
                this.teardownPhotonBeamOpt();
            }
            this._plcLastRadMode = mode;
        }

        const mount3d = document.getElementById('plcLibPlView3d');
        const mountBev = document.getElementById('plcLibPlBev');
        const mountList = document.getElementById('plcLibBottomBeamListRoot');
        const mountOpt = document.getElementById('plcLibBottomBeamOptRoot');

        if (mode === 'PROTON') {
            const PV = typeof window !== 'undefined' ? window.ProtonView3DComponent : undefined;
            const PB = typeof window !== 'undefined' ? window.ProtonBeamEyeViewComponent : undefined;
            const PL = typeof window !== 'undefined' ? window.ProtonBeamListComponentPBS : undefined;
            const PO = typeof window !== 'undefined' ? window.ProtonBeamOptimizationSettingsComponent : undefined;

            if (mount3d) {
                if (!this._protonUiInstances.view3d) {
                    if (typeof THREE === 'undefined') {
                        this.mountPlcPlaceholder(mount3d, 'Three.js 未加载，无法显示 Proton 3D。');
                    } else if (PV) {
                        this._protonUiInstances.view3d = new PV('plcLibPlView3d', {
                            enableToolbar: true,
                            enableRightClick: true,
                            showBeams: true,
                            showROIs: true,
                            showIsocenter: true,
                            showToolbar: true,
                            showHeader: true,
                            toolbarTitle: '3D'
                        });
                    } else {
                        this.mountPlcPlaceholder(mount3d, 'ProtonView3DComponent 未加载。请在页面中先引入该脚本（及 Three.js）。');
                    }
                }
            }

            if (mountBev) {
                if (!this._protonUiInstances.bev) {
                    if (PB) {
                        this._protonUiInstances.bev = new PB('plcLibPlBev', {
                            showToolbar: true,
                            showHeader: true,
                            toolbarTitle: 'BEV'
                        });
                    } else {
                        this.mountPlcPlaceholder(mountBev, 'ProtonBeamEyeViewComponent 未加载。请在页面中先引入该脚本。');
                    }
                }
            }

            if (this._plcBottomTab === 'beam-list') {
                this.teardownProtonBeamOpt();
                if (mountOpt) mountOpt.replaceChildren();
                if (mountList) {
                    if (!this._protonUiInstances.beamList) {
                        if (PL) {
                            this._protonUiInstances.beamList = new PL('plcLibBottomBeamListRoot', {
                                prefix: 'plcLibPbl-'
                            });
                        } else {
                            this.mountPlcPlaceholder(mountList, 'ProtonBeamListComponentPBS 未加载。请在页面中先引入该脚本。');
                        }
                    }
                }
            } else {
                this.teardownProtonBeamList();
                if (mountList) mountList.replaceChildren();
                if (mountOpt) {
                    if (!this._protonUiInstances.beamOpt) {
                        if (PO) {
                            this._protonUiInstances.beamOpt = new PO('plcLibBottomBeamOptRoot', {
                                prefix: 'plcLibPbo-'
                            });
                        } else {
                            this.mountPlcPlaceholder(
                                mountOpt,
                                'ProtonBeamOptimizationSettingsComponent 未加载。请在页面中先引入该脚本。'
                            );
                        }
                    }
                }
            }
            return;
        }

        const PhV = typeof window !== 'undefined' ? window.PhotonView3DComponent : undefined;
        const PhB = typeof window !== 'undefined' ? window.PhotonBeamEyeViewComponent : undefined;
        const DMLC = typeof window !== 'undefined' ? window.DMLCBeamListComponent : undefined;
        const PPBO =
            typeof window !== 'undefined' ? window.PhotonProtonBeamOptimizationSettingsComponent : undefined;

        if (mount3d) {
            if (!this._photonUiInstances.view3d) {
                if (typeof THREE === 'undefined') {
                    this.mountPlcPlaceholder(mount3d, 'Three.js 未加载，无法显示 Photon 3D。');
                } else if (PhV) {
                    this._photonUiInstances.view3d = new PhV('plcLibPlView3d', {
                        enableToolbar: true,
                        enableRightClick: true,
                        showBeams: true,
                        showROIs: true,
                        showIsocenter: true,
                        showToolbar: true,
                        showHeader: true,
                        toolbarTitle: '3D'
                    });
                } else {
                    this.mountPlcPlaceholder(mount3d, 'PhotonView3DComponent 未加载。请在页面中先引入该脚本（及 Three.js）。');
                }
            }
        }

        if (mountBev) {
            if (!this._photonUiInstances.bev) {
                if (PhB) {
                    this._photonUiInstances.bev = new PhB('plcLibPlBev', {
                        showToolbar: true,
                        showHeader: true,
                        toolbarTitle: 'BEV'
                    });
                } else {
                    this.mountPlcPlaceholder(mountBev, 'PhotonBeamEyeViewComponent 未加载。请在页面中先引入该脚本。');
                }
            }
        }

        if (this._plcBottomTab === 'beam-list') {
            this.teardownPhotonBeamOpt();
            if (mountOpt) mountOpt.replaceChildren();
            if (mountList) {
                if (!this._photonUiInstances.beamList) {
                    if (DMLC) {
                        this._photonUiInstances.beamList = new DMLC('plcLibBottomBeamListRoot', {
                            prefix: 'plcLibDmlcList-'
                        });
                    } else {
                        this.mountPlcPlaceholder(mountList, 'DMLCBeamListComponent 未加载。请在页面中先引入该脚本。');
                    }
                }
            }
        } else {
            this.teardownPhotonBeamList();
            if (mountList) mountList.replaceChildren();
            if (mountOpt) {
                if (!this._photonUiInstances.beamOpt) {
                    if (PPBO) {
                        this._photonUiInstances.beamOpt = new PPBO('plcLibBottomBeamOptRoot', {
                            prefix: 'plcLibPpbOpt-'
                        });
                    } else {
                        this.mountPlcPlaceholder(
                            mountOpt,
                            'PhotonProtonBeamOptimizationSettingsComponent 未加载。请在页面中先引入该脚本。'
                        );
                    }
                }
            }
        }
    }

    disposeCenterView2dInstances() {
        const ids = ['plcLibPlCross2d', 'plcLibPlCoronal2d', 'plcLibPlSagittal2d'];
        ids.forEach((id) => {
            const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
            if (el) el.innerHTML = '';
        });
        this._centerView2dInstances = { cross: null, coronal: null, sagittal: null };
    }

    schedulePlcDemoContours(view2dInstance) {
        if (!view2dInstance || typeof view2dInstance.addContour !== 'function') return;
        const tryAdd = () => {
            if (!view2dInstance.imageData) {
                setTimeout(tryAdd, 100);
                return;
            }
            const imageWidth = view2dInstance.imageData.width;
            const imageHeight = view2dInstance.imageData.height;
            const centerX = imageWidth / 2;
            const centerY = imageHeight / 2;
            const radius = Math.min(imageWidth, imageHeight) * 0.15;
            const contour1Points = [];
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                contour1Points.push({
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                });
            }
            view2dInstance.addContour('plc-lib-roi-1', contour1Points, '#FFFF00');
            const contour2Points = [];
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                contour2Points.push({
                    x: centerX + radius * 1.5 * Math.cos(angle),
                    y: centerY + radius * 1.5 * Math.sin(angle)
                });
            }
            view2dInstance.addContour('plc-lib-roi-2', contour2Points, '#00FF00');
        };
        setTimeout(tryAdd, 300);
    }

    ensureCenterView2dComponents() {
        const viewOpts = {
            enableToolbar: true,
            enableLayerControl: true,
            showDoseLegend: true,
            contoursVisible: true
        };
        const mountPlaceholder = (id, msg) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<div class="plc-sub-placeholder">${this.escapeHtml(msg)}</div>`;
        };
        const C = typeof window !== 'undefined' ? window.CrossSectionView2DComponent : undefined;
        const Co = typeof window !== 'undefined' ? window.CoronalView2DComponent : undefined;
        const S = typeof window !== 'undefined' ? window.SagittalView2DComponent : undefined;

        if (C && document.getElementById('plcLibPlCross2d')) {
            this._centerView2dInstances.cross = new C('plcLibPlCross2d', viewOpts);
            this.schedulePlcDemoContours(this._centerView2dInstances.cross);
        } else {
            mountPlaceholder(
                'plcLibPlCross2d',
                'CrossSectionView2D 未加载。请在页面中先引入 CrossSectionView2DComponent.js。'
            );
        }

        if (Co && document.getElementById('plcLibPlCoronal2d')) {
            this._centerView2dInstances.coronal = new Co('plcLibPlCoronal2d', viewOpts);
            this.schedulePlcDemoContours(this._centerView2dInstances.coronal);
        } else {
            mountPlaceholder(
                'plcLibPlCoronal2d',
                'CoronalView2D 未加载。请在页面中先引入 CoronalView2DComponent.js。'
            );
        }

        if (S && document.getElementById('plcLibPlSagittal2d')) {
            this._centerView2dInstances.sagittal = new S('plcLibPlSagittal2d', viewOpts);
            this.schedulePlcDemoContours(this._centerView2dInstances.sagittal);
        } else {
            mountPlaceholder(
                'plcLibPlSagittal2d',
                'SagittalView2D 未加载。请在页面中先引入 SagittalView2DComponent.js。'
            );
        }
    }

    getDefaults() {
        const d = {
            planImage: 'CT 1',
            structure: 'RTStruct 1',
            targetRoi: 'ptv',
            totalDose: 6000,
            fractions: 45,
            activeBeamIndex: 0,
            beams: [
                { machine: 'ProBeam', technique: 'PBS', radiationType: 'PROTON' },
                { machine: 'Elekta_SynergyVNSZ', technique: 'SMLC', radiationType: 'PHOTON' }
            ]
        };
        return { ...d, ...(this.options.defaultValues || {}) };
    }

    disposeRailSubInstances() {
        try {
            this._railSubInstances.roi?.destroy?.();
        } catch (e) {
            /* noop */
        }
        try {
            this._railSubInstances.poi?.destroy?.();
        } catch (e) {
            /* noop */
        }
        this._railSubInstances = { roi: null, poi: null, dose: null };
    }

    switchPlcRailPanel(panelKey) {
        if (!this.modalEl) return;
        const keys = ['plan', 'roi', 'poi', 'dose'];
        if (!keys.includes(panelKey)) return;

        this.modalEl.querySelectorAll('.plc-rail-tab[data-plc-panel]').forEach((t) => {
            const on = t.getAttribute('data-plc-panel') === panelKey;
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
            t.tabIndex = on ? 0 : -1;
        });
        this.modalEl.querySelectorAll('.plc-sidebar-panel[data-plc-panel]').forEach((p) => {
            const on = p.getAttribute('data-plc-panel') === panelKey;
            p.classList.toggle('is-active', on);
            p.setAttribute('aria-hidden', on ? 'false' : 'true');
        });

        this.modalEl.querySelector('.plc-sidebar')?.setAttribute('data-plc-sidebar-tab', panelKey);

        if (panelKey === 'roi') this.ensureRailRoi();
        else if (panelKey === 'poi') this.ensureRailPoi();
        else if (panelKey === 'dose') this.ensureRailDose();
    }

    ensureRailRoi() {
        if (this._railSubInstances.roi) return;
        const mount = document.getElementById('plcSidebarRoiRoot');
        if (!mount) return;
        if (typeof window.ROIComponent === 'undefined') {
            if (!mount.querySelector('.plc-sub-placeholder')) {
                mount.innerHTML = `<div class="plc-sub-placeholder">${this.escapeHtml('ROI 组件未加载。请在页面中先引入 ROIComponent.js。')}</div>`;
            }
            return;
        }
        this._railSubInstances.roi = new window.ROIComponent('plcSidebarRoiRoot', { prefix: 'plcLibRoi-' });
    }

    ensureRailPoi() {
        if (this._railSubInstances.poi) return;
        const mount = document.getElementById('plcSidebarPoiRoot');
        if (!mount) return;
        if (typeof window.POIComponent === 'undefined') {
            if (!mount.querySelector('.plc-sub-placeholder')) {
                mount.innerHTML = `<div class="plc-sub-placeholder">${this.escapeHtml('POI 组件未加载。请在页面中先引入 POIComponent.js。')}</div>`;
            }
            return;
        }
        this._railSubInstances.poi = new window.POIComponent('plcSidebarPoiRoot', { prefix: 'plcLibPoi-' });
    }

    ensureRailDose() {
        if (this._railSubInstances.dose) return;
        const mount = document.getElementById('plcSidebarDoseRoot');
        if (!mount) return;
        if (typeof window.DOSEComponent === 'undefined') {
            if (!mount.querySelector('.plc-sub-placeholder')) {
                mount.innerHTML = `<div class="plc-sub-placeholder">${this.escapeHtml('等剂量线组件未加载。请在页面中先引入 DOSEComponent.js。')}</div>`;
            }
            return;
        }
        this._railSubInstances.dose = new window.DOSEComponent('plcSidebarDoseRoot', { prefix: 'plcLibDose-' });
    }

    /** 直线加速器（光子） */
    getBeamPhotonMachines() {
        return ['HalcyonSN1057', 'Elekta_SynergyVNSZ'];
    }

    /** 质子加速器（截图：ProBeam / Hitachi / IBA） */
    getBeamProtonMachines() {
        return ['ProBeam', 'Hitachi', 'IBA'];
    }

    getBeamMachineOptions() {
        return [...this.getBeamPhotonMachines(), ...this.getBeamProtonMachines()];
    }

    isProtonMachine(machine) {
        return this.getBeamProtonMachines().includes(String(machine ?? ''));
    }

    /** 根据治疗机生成辐射类型下拉 HTML（光子机仅 PHOTON，质子机仅 PROTON） */
    beamRadSelectHtml(machine) {
        if (this.isProtonMachine(machine)) {
            return '<option value="PROTON" selected>PROTON</option>';
        }
        return '<option value="PHOTON" selected>PHOTON</option>';
    }

    /** 辐射类型 PROTON → 技术仅 PBS；PHOTON → DMLC/SMLC/VMAT */
    getBeamTechniqueOptions(radiationType) {
        return radiationType === 'PROTON' ? ['PBS'] : ['DMLC', 'SMLC', 'VMAT'];
    }

    coerceBeamTechnique(radiationType, technique) {
        const opts = this.getBeamTechniqueOptions(radiationType);
        const s = String(technique ?? '');
        return opts.includes(s) ? s : opts[0];
    }

    syncBeamCardDerivedFields(card) {
        if (!card) return;
        const machineSel = card.querySelector('[data-field="machine"]');
        const radSel = card.querySelector('[data-field="rad"]');
        const techSel = card.querySelector('[data-field="technique"]');
        if (!machineSel || !radSel || !techSel) return;
        const machine = machineSel.value;
        radSel.innerHTML = this.beamRadSelectHtml(machine);
        const rad = radSel.value;
        const techOpts = this.getBeamTechniqueOptions(rad);
        const prev = techSel.value;
        const sel = this.coerceBeamTechnique(rad, prev);
        techSel.innerHTML = this.opts(techOpts, sel);
        techSel.value = sel;
    }

    buildBeamListHtml(beams, activeBeamIndex) {
        const machines = this.getBeamMachineOptions();
        return beams
            .map((b, i) => {
                const num = String(i + 1).padStart(2, '0');
                const active = i === activeBeamIndex ? 'is-active' : '';
                const machine = b.machine && machines.includes(b.machine) ? b.machine : machines[0];
                const radHtml = this.beamRadSelectHtml(machine);
                const radVal = this.isProtonMachine(machine) ? 'PROTON' : 'PHOTON';
                const techOpts = this.getBeamTechniqueOptions(radVal);
                const tech = this.coerceBeamTechnique(radVal, b.technique);
                return `
                    <div class="plc-beam-card ${active}" data-beam-card="${i}" role="group" aria-label="射束 ${num}">
                        <span class="plc-beam-num">${num}</span>
                        <div class="plc-beam-card-body">
                            <div class="plc-row">
                                <span class="plc-label"><span class="plc-req" aria-hidden="true">*</span>治疗机</span>
                                <select class="plc-control" data-field="machine">${this.opts(machines, machine)}</select>
                            </div>
                            <div class="plc-row">
                                <span class="plc-label"><span class="plc-req" aria-hidden="true">*</span>辐射类型</span>
                                <select class="plc-control" data-field="rad">${radHtml}</select>
                            </div>
                            <div class="plc-row">
                                <span class="plc-label"><span class="plc-req" aria-hidden="true">*</span>技术</span>
                                <select class="plc-control" data-field="technique">${this.opts(techOpts, tech)}</select>
                            </div>
                        </div>
                    </div>`;
            })
            .join('');
    }

    readBeamsFromModal() {
        if (!this.modalEl) return [];
        return [...this.modalEl.querySelectorAll('#plcBeamList [data-beam-card]')].map((card) => ({
            machine: card.querySelector('[data-field="machine"]')?.value ?? '',
            radiationType: card.querySelector('[data-field="rad"]')?.value ?? 'PHOTON',
            technique: card.querySelector('[data-field="technique"]')?.value ?? ''
        }));
    }

    getActiveBeamIndexFromDom() {
        if (!this.modalEl) return 0;
        const el = this.modalEl.querySelector('#plcBeamList .plc-beam-card.is-active');
        if (!el) return 0;
        const n = Number.parseInt(el.getAttribute('data-beam-card'), 10);
        return Number.isFinite(n) ? n : 0;
    }

    setActiveBeamCard(index) {
        if (!this.modalEl) return;
        this.modalEl.querySelectorAll('#plcBeamList [data-beam-card]').forEach((c) => {
            const i = Number.parseInt(c.getAttribute('data-beam-card'), 10);
            c.classList.toggle('is-active', i === index);
        });
        this.syncPlanLibraryCenterMounts();
    }

    refreshBeamList(beams, activeBeamIndex) {
        const host = this.modalEl?.querySelector('#plcBeamList');
        if (!host) return;
        host.innerHTML = this.buildBeamListHtml(beams, activeBeamIndex);
        this.syncPlanLibraryCenterMounts();
    }

    show() {
        if (this.modalEl) return;
        this._plcBottomTab = 'beam-list';
        this._plcLastRadMode = null;
        const v = this.getDefaults();
        const fracDose = v.fractions > 0 ? ((v.totalDose / v.fractions) * 100) / 100 : 0;

        this.modalEl = document.createElement('div');
        this.modalEl.className = 'plc-mask';
        const mount = this.options.mountContainer || document.body;
        if (mount !== document.body) {
            this.modalEl.classList.add('embedded');
            if (getComputedStyle(mount).position === 'static') mount.style.position = 'relative';
        }

        const beamListHtml = this.buildBeamListHtml(v.beams, v.activeBeamIndex);

        this.modalEl.innerHTML = `
            <div class="plc-dialog" role="dialog" aria-modal="true" aria-label="生成计划库">
                <div class="plc-cg-overlay" id="plcClinicalGoalsOverlay" hidden aria-hidden="true">
                    <div class="plc-cg-shell" role="dialog" aria-modal="true" aria-labelledby="plcClinicalGoalsTitle" tabindex="-1">
                        <div class="plc-cg-head">
                            <h3 id="plcClinicalGoalsTitle">临床目标设置</h3>
                            <div class="plc-cg-head-actions">
                                <button type="button" class="plc-cg-close" data-role="cg-dismiss" aria-label="关闭临床目标"><i class="fas fa-times"></i></button>
                            </div>
                        </div>
                        <div class="plc-cg-body">
                            <aside class="plc-cg-aside" aria-label="ROI 选择">
                                <div class="plc-cg-source" aria-label="图像与结构集">CT 1 RTStruct 1 2021-12-29 1...</div>
                                <div class="plc-cg-roi-tree">
                                    <div class="plc-cg-roi-group">
                                        <div class="plc-cg-roi-group-title">靶区(1)</div>
                                        <div class="plc-cg-roi-item"><span class="plc-cg-dot" style="background:#c75c5c"></span> ptv</div>
                                    </div>
                                    <div class="plc-cg-roi-group">
                                        <div class="plc-cg-roi-group-title">非靶区(1)</div>
                                        <div class="plc-cg-roi-item"><span class="plc-cg-dot" style="background:#5a9a6a"></span> body</div>
                                    </div>
                                </div>
                            </aside>
                            <div class="plc-cg-main">
                                <div class="plc-cg-main-top">
                                    <p class="plc-cg-req">要求：必须包含 Body 和 PTV 的临床目标，其中 PTV 至少设置一个 Min Dose 或 Min DVH<br><span class="plc-cg-req-note">注意：以下函数仅对Proton计划生效：Fall Off、Inward Reduce</span></p>
                                    <button type="button" class="plc-cg-btn-ghost" data-role="cg-opt-settings">优化设置</button>
                                </div>
                                <div class="plc-cg-scroll" aria-label="临床目标优先级分区">
                                    <div class="plc-cg-tier plc-cg-tier--hi" aria-label="最重要">
                                        <div class="plc-cg-tier-h">最重要</div>
                                        <div class="plc-cg-table-wrap">
                                            <table class="plc-cg-table">
                                                <thead><tr><th>移动</th><th>颜色</th><th>ROI</th><th>类型</th><th>临床目标</th><th>操作</th></tr></thead>
                                                <tbody>
                                                    <tr>
                                                        <td>⋮⋮</td>
                                                        <td class="plc-cg-color-cell"><span class="plc-cg-swatch" style="background:#c75c5c" role="img" aria-label="颜色 #c75c5c"></span></td>
                                                        <td>ptv</td>
                                                        <td>PTV</td>
                                                        <td>D90.00%≥6000.00Gy</td>
                                                        <td class="plc-cg-ops"><button type="button" title="编辑"><i class="fas fa-edit"></i></button><button type="button" title="删除"><i class="fas fa-trash-alt"></i></button></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div class="plc-cg-tier plc-cg-tier--mid" aria-label="重要">
                                        <div class="plc-cg-tier-h">重要</div>
                                        <div class="plc-cg-table-wrap">
                                            <table class="plc-cg-table">
                                                <thead><tr><th>移动</th><th>颜色</th><th>ROI</th><th>类型</th><th>临床目标</th><th>操作</th></tr></thead>
                                                <tbody></tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div class="plc-cg-tier plc-cg-tier--lo" aria-label="一般">
                                        <div class="plc-cg-tier-h">一般</div>
                                        <div class="plc-cg-table-wrap">
                                            <table class="plc-cg-table">
                                                <thead><tr><th>移动</th><th>颜色</th><th>ROI</th><th>类型</th><th>临床目标</th><th>操作</th></tr></thead>
                                                <tbody>
                                                    <tr>
                                                        <td>⋮⋮</td>
                                                        <td class="plc-cg-color-cell"><span class="plc-cg-swatch" style="background:#5a9a6a" role="img" aria-label="颜色 #5a9a6a"></span></td>
                                                        <td>body</td>
                                                        <td>BODY</td>
                                                        <td>Dmax≤6600.00Gy</td>
                                                        <td class="plc-cg-ops"><button type="button" title="编辑"><i class="fas fa-edit"></i></button><button type="button" title="删除"><i class="fas fa-trash-alt"></i></button></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div class="plc-cg-main-actions" aria-label="临床目标操作">
                                    <button type="button" class="plc-cg-btn-ghost" data-role="cg-noop">添加目标</button>
                                    <button type="button" class="plc-cg-btn-ghost" data-role="cg-noop">加载模板</button>
                                    <button type="button" class="plc-cg-btn-ghost" data-role="cg-noop">创建模板</button>
                                    <button type="button" class="plc-cg-btn-ghost" data-role="cg-noop">一键清空</button>
                                </div>
                            </div>
                        </div>
                        <div class="plc-cg-foot">
                            <div class="plc-cg-foot-r">
                                <button type="button" class="plc-cg-btn-ghost" data-role="cg-dismiss">关闭</button>
                                <button type="button" class="plc-cg-btn-primary" data-role="cg-confirm">确定</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="plc-opt-overlay" id="plcOptSettingsOverlay" hidden aria-hidden="true">
                    <div class="plc-opt-shell" role="dialog" aria-modal="true" aria-labelledby="plcOptSettingsTitle" tabindex="-1">
                        <div class="plc-opt-head">
                            <h3 id="plcOptSettingsTitle">优化设置</h3>
                            <button type="button" class="plc-opt-close" data-role="opt-dismiss" aria-label="关闭优化设置"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="plc-opt-body">
                            <div class="plc-opt-row">
                                <span class="plc-opt-label"><span class="plc-opt-star" aria-hidden="true">*</span>迭代次数</span>
                                <input class="plc-opt-input" id="plcOptIterationsInput" type="number" min="1" max="2000" step="1" value="${this.escapeAttr(this._optSettingsIterations)}" aria-required="true" />
                            </div>
                            <div class="plc-opt-hint" id="plcOptEstimateText"></div>
                        </div>
                        <div class="plc-opt-foot">
                            <button type="button" class="plc-opt-btn" data-role="opt-cancel">取消</button>
                            <button type="button" class="plc-opt-btn plc-opt-btn-primary" data-role="opt-confirm">确定</button>
                        </div>
                    </div>
                </div>
                <div class="plc-header">
                    <h3>生成计划库</h3>
                    <button type="button" class="plc-close" data-role="close" aria-label="关闭"><i class="fas fa-times"></i></button>
                </div>
                <div class="plc-main">
                    <aside class="plc-rail" role="tablist" aria-label="侧栏页签">
                        <button type="button" class="plc-rail-tab is-active" role="tab" id="plc-tab-plan" data-plc-panel="plan" aria-selected="true" aria-controls="plc-panel-plan" tabindex="0">计划</button>
                        <button type="button" class="plc-rail-tab" role="tab" id="plc-tab-roi" data-plc-panel="roi" aria-selected="false" aria-controls="plc-panel-roi" tabindex="-1">ROIs</button>
                        <button type="button" class="plc-rail-tab" role="tab" id="plc-tab-poi" data-plc-panel="poi" aria-selected="false" aria-controls="plc-panel-poi" tabindex="-1">POIs</button>
                        <button type="button" class="plc-rail-tab" role="tab" id="plc-tab-dose" data-plc-panel="dose" aria-selected="false" aria-controls="plc-panel-dose" tabindex="-1">Isodoses</button>
                    </aside>
                    <aside class="plc-sidebar" data-plc-sidebar-tab="plan">
                        <div class="plc-sidebar-scroll">
                            <div class="plc-sidebar-panel is-active" data-plc-panel="plan" id="plc-panel-plan" role="tabpanel" aria-labelledby="plc-tab-plan" aria-hidden="false">
                            <div class="plc-plan-basic">
                            <div class="plc-section-title">基本信息</div>
                            <div class="plc-row">
                                <span class="plc-label"><span class="plc-req" aria-hidden="true">*</span>计划图像</span>
                                <select class="plc-control" id="plcPlanImage" aria-required="true">${this.opts(['CT 1', 'CT 2'], v.planImage)}</select>
                            </div>
                            <div class="plc-row">
                                <span class="plc-label"><span class="plc-req" aria-hidden="true">*</span>勾画</span>
                                <select class="plc-control" id="plcStructure" aria-required="true">${this.opts(['RTStruct 1', 'RTStruct 2'], v.structure)}</select>
                            </div>
                            <div class="plc-row">
                                <span class="plc-label"><span class="plc-req" aria-hidden="true">*</span>目标靶区</span>
                                <select class="plc-control" id="plcTargetRoi" aria-required="true">${this.opts(['ptv', 'CTV', 'GTV'], v.targetRoi)}</select>
                            </div>
                            <div class="plc-row">
                                <span class="plc-label"><span class="plc-req" aria-hidden="true">*</span>总剂量</span>
                                <div class="plc-inline-unit">
                                    <input class="plc-control" type="number" step="0.01" id="plcTotalDose" value="${this.escapeAttr(v.totalDose)}" aria-required="true" />
                                    <span class="plc-unit">cGy</span>
                                </div>
                            </div>
                            <div class="plc-row">
                                <span class="plc-label"><span class="plc-req" aria-hidden="true">*</span>分次数</span>
                                <input class="plc-control" type="number" id="plcFractions" value="${this.escapeAttr(v.fractions)}" aria-required="true" />
                            </div>
                            <div class="plc-row">
                                <span class="plc-label">分次剂量</span>
                                <div class="plc-inline-unit">
                                    <input class="plc-control plc-display-field" id="plcFracDose" readonly tabindex="-1" value="${fracDose.toFixed(2)}" aria-readonly="true" />
                                    <span class="plc-unit">cGy</span>
                                </div>
                            </div>
                            </div>
                            <div class="plc-plan-beam-section">
                            <div class="plc-beam-head">
                                <div class="plc-section-title">计划和射束信息</div>
                                <div class="plc-icon-btns">
                                    <button type="button" class="plc-icon-btn" title="添加" data-role="add-beam-card"><i class="fas fa-plus"></i></button>
                                    <button type="button" class="plc-icon-btn danger" title="删除" data-role="remove-beam-card"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                            <div class="plc-plan-beam-scroll">
                            <div class="plc-beam-list" id="plcBeamList">${beamListHtml}</div>
                            </div>
                            </div>
                            </div>
                            <div class="plc-sidebar-panel" data-plc-panel="roi" id="plc-panel-roi" role="tabpanel" aria-labelledby="plc-tab-roi" aria-hidden="true">
                                <div id="plcSidebarRoiRoot" class="plc-sub-mount"></div>
                            </div>
                            <div class="plc-sidebar-panel" data-plc-panel="poi" id="plc-panel-poi" role="tabpanel" aria-labelledby="plc-tab-poi" aria-hidden="true">
                                <div id="plcSidebarPoiRoot" class="plc-sub-mount"></div>
                            </div>
                            <div class="plc-sidebar-panel" data-plc-panel="dose" id="plc-panel-dose" role="tabpanel" aria-labelledby="plc-tab-dose" aria-hidden="true">
                                <div id="plcSidebarDoseRoot" class="plc-sub-mount"></div>
                            </div>
                        </div>
                        <div class="plc-clinical-wrap" aria-label="临床目标">
                            <div class="plc-clinical">临床目标 <a href="#" data-role="open-clinical-goals">去设置</a></div>
                        </div>
                        <div class="plc-sidebar-footer">
                            <button type="button" class="plc-btn-primary" data-role="confirm">生成计划库</button>
                        </div>
                    </aside>
                    <div class="plc-center" id="planLibraryCenterRoot" aria-label="主内容区">
                        <div class="plc-center-zone plc-center-zone--split" data-plc-center-zone="1" aria-label="主内容区 上三分之一">
                            <div class="plc-center-half" data-plc-center-half="L" aria-label="主内容区 上三分之一 左侧">
                                <div id="plcLibPlCross2d" class="plc-view2d-mount" aria-label="横断面 2D 视图"></div>
                            </div>
                            <div class="plc-center-half" data-plc-center-half="R" aria-label="主内容区 上三分之一 右侧">
                                <div id="plcLibPlView3d" class="plc-proton-mount" aria-label="3D 视图"></div>
                            </div>
                        </div>
                        <div class="plc-center-zone plc-center-zone--split" data-plc-center-zone="2" aria-label="主内容区 中三分之一">
                            <div class="plc-center-half plc-center-half--split" data-plc-center-half="L" aria-label="主内容区 中三分之一 左侧">
                                <div class="plc-center-subhalf" data-plc-subhalf="L" aria-label="主内容区 中三分之一 左侧 左半">
                                    <div id="plcLibPlCoronal2d" class="plc-view2d-mount" aria-label="冠状面 2D 视图"></div>
                                </div>
                                <div class="plc-center-subhalf" data-plc-subhalf="R" aria-label="主内容区 中三分之一 左侧 右半">
                                    <div id="plcLibPlSagittal2d" class="plc-view2d-mount" aria-label="矢状面 2D 视图"></div>
                                </div>
                            </div>
                            <div class="plc-center-half" data-plc-center-half="R" aria-label="主内容区 中三分之一 右侧">
                                <div id="plcLibPlBev" class="plc-proton-mount" aria-label="射束眼视图 BEV"></div>
                            </div>
                        </div>
                        <div class="plc-center-zone plc-center-zone--bottom" data-plc-center-zone="3" aria-label="主内容区 下三分之一">
                            <div class="plc-bottom-tabs" role="tablist" aria-label="主内容区底部">
                                <button type="button" class="plc-bottom-tab is-active" role="tab" id="plcBottomTabBeamList" data-plc-bottom-tab="beam-list" aria-selected="true" aria-controls="plcLibBottomBeamListRoot">射束列表</button>
                                <button type="button" class="plc-bottom-tab" role="tab" id="plcBottomTabBeamOpt" data-plc-bottom-tab="beam-opt" aria-selected="false" aria-controls="plcLibBottomBeamOptRoot" tabindex="-1">射束优化设置</button>
                            </div>
                            <div class="plc-bottom-panels">
                                <div id="plcLibBottomBeamListRoot" class="plc-bottom-panel is-active" data-plc-bottom-panel="beam-list" role="tabpanel" aria-labelledby="plcBottomTabBeamList" aria-hidden="false"></div>
                                <div id="plcLibBottomBeamOptRoot" class="plc-bottom-panel" data-plc-bottom-panel="beam-opt" role="tabpanel" aria-labelledby="plcBottomTabBeamOpt" aria-hidden="true"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        mount.appendChild(this.modalEl);
        this.bindEvents(v);
        this.ensureCenterView2dComponents();
        this.syncPlanLibraryCenterMounts();
        window.addEventListener('keydown', this._boundEscHandler);
        this.enterFullscreenBridge();
    }

    openClinicalGoalsModal() {
        if (!this.modalEl) return;
        const ov = this.modalEl.querySelector('#plcClinicalGoalsOverlay');
        if (!ov) return;
        ov.hidden = false;
        ov.setAttribute('aria-hidden', 'false');
        this._clinicalGoalsOpen = true;
        const btn = ov.querySelector('[data-role="cg-dismiss"]');
        if (btn instanceof HTMLElement) btn.focus();
    }

    closeClinicalGoalsModal() {
        if (!this.modalEl) return;
        const ov = this.modalEl.querySelector('#plcClinicalGoalsOverlay');
        if (!ov) return;
        ov.hidden = true;
        ov.setAttribute('aria-hidden', 'true');
        this._clinicalGoalsOpen = false;
    }

    getOptEstimateMinutes(iterations) {
        const n = Number(iterations);
        if (!Number.isFinite(n) || n <= 0) return 0;
        // 保持截图基准：20 次 → 23min
        const ratio = 23 / 20;
        return Math.max(1, Math.round(n * ratio));
    }

    refreshOptEstimateText() {
        if (!this.modalEl) return;
        const t = this.modalEl.querySelector('#plcOptEstimateText');
        if (!(t instanceof HTMLElement)) return;
        const n = Number(this._optSettingsIterations);
        const mins = this.getOptEstimateMinutes(n);
        t.textContent = `迭代${Number.isFinite(n) ? n : 0}次预计优化时间为${mins}min`;
    }

    openOptSettingsModal() {
        if (!this.modalEl) return;
        const ov = this.modalEl.querySelector('#plcOptSettingsOverlay');
        if (!ov) return;
        ov.hidden = false;
        ov.setAttribute('aria-hidden', 'false');
        this._optSettingsOpen = true;
        const inp = ov.querySelector('#plcOptIterationsInput');
        if (inp instanceof HTMLInputElement) {
            inp.value = String(this._optSettingsIterations ?? 20);
            inp.focus();
            inp.select?.();
        }
        this.refreshOptEstimateText();
    }

    closeOptSettingsModal() {
        if (!this.modalEl) return;
        const ov = this.modalEl.querySelector('#plcOptSettingsOverlay');
        if (!ov) return;
        ov.hidden = true;
        ov.setAttribute('aria-hidden', 'true');
        this._optSettingsOpen = false;
    }

    beginGeneratePlanLibraryFlow(data) {
        const mc = this.options.mountContainer || document.body;
        const PPM = typeof window !== 'undefined' ? window.PromptProgressModalComponent : null;
        const PSCM = typeof window !== 'undefined' ? window.PromptSimpleConfirmModalComponent : null;
        const PLG = typeof window !== 'undefined' ? window.PlanLibraryGeneratedModalComponent : null;
        if (typeof PPM !== 'function' || typeof PSCM !== 'function' || typeof PLG !== 'function') {
            this.hide();
            if (typeof this.options.onConfirm === 'function') this.options.onConfirm(data);
            return;
        }
        const ppm = new PPM({
            mountContainer: mc,
            message: '计划库生成中...',
            autoCompleteMs: 2600,
            onComplete: () => {
                ppm.hide();
                const pscm = new PSCM({
                    mountContainer: mc,
                    title: '提示',
                    message: '计划库生成成功！',
                    onConfirm: () => {
                        this.hide();
                        const plg = new PLG({ mountContainer: mc, planLibraryData: data });
                        plg.show();
                        if (typeof this.options.onConfirm === 'function') this.options.onConfirm(data);
                    }
                });
                pscm.show();
            },
            onCancel: () => {}
        });
        ppm.show();
    }

    bindEvents(initial) {
        if (!this.modalEl) return;
        const v = initial || this.getDefaults();
        const close = () => {
            this.hide();
            if (typeof this.options.onCancel === 'function') this.options.onCancel();
        };
        this.modalEl.querySelector('[data-role="close"]')?.addEventListener('click', close);
        this.modalEl.querySelectorAll('[data-role="noop"]').forEach((el) => {
            el.addEventListener('click', (e) => e.preventDefault());
        });
        this.modalEl.querySelector('[data-role="confirm"]')?.addEventListener('click', () => {
            const data = this.collectData();
            this.beginGeneratePlanLibraryFlow(data);
        });
        this.modalEl.addEventListener('click', (e) => {
            const cgOv = this.modalEl.querySelector('#plcClinicalGoalsOverlay');
            if (cgOv && !cgOv.hidden) {
                if (e.target === cgOv) {
                    e.preventDefault();
                    this.closeClinicalGoalsModal();
                    return;
                }
                const dismiss = e.target.closest('[data-role="cg-dismiss"]');
                if (dismiss && cgOv.contains(dismiss)) {
                    e.preventDefault();
                    this.closeClinicalGoalsModal();
                    return;
                }
                const confirmCg = e.target.closest('[data-role="cg-confirm"]');
                if (confirmCg && cgOv.contains(confirmCg)) {
                    e.preventDefault();
                    this.closeClinicalGoalsModal();
                    return;
                }
                const openOpt = e.target.closest('[data-role="cg-opt-settings"]');
                if (openOpt && cgOv.contains(openOpt)) {
                    e.preventDefault();
                    this.openOptSettingsModal();
                    return;
                }
            }

            const optOv = this.modalEl.querySelector('#plcOptSettingsOverlay');
            if (optOv && !optOv.hidden) {
                if (e.target === optOv) {
                    e.preventDefault();
                    this.closeOptSettingsModal();
                    return;
                }
                const dismiss = e.target.closest('[data-role="opt-dismiss"]');
                if (dismiss && optOv.contains(dismiss)) {
                    e.preventDefault();
                    this.closeOptSettingsModal();
                    return;
                }
                const cancelBtn = e.target.closest('[data-role="opt-cancel"]');
                if (cancelBtn && optOv.contains(cancelBtn)) {
                    e.preventDefault();
                    this.closeOptSettingsModal();
                    return;
                }
                const confirmBtn = e.target.closest('[data-role="opt-confirm"]');
                if (confirmBtn && optOv.contains(confirmBtn)) {
                    e.preventDefault();
                    this.closeOptSettingsModal();
                    return;
                }
            }

            const openCg = e.target.closest('[data-role="open-clinical-goals"]');
            if (openCg && this.modalEl.contains(openCg)) {
                e.preventDefault();
                this.openClinicalGoalsModal();
                return;
            }

            const bottomTab = e.target.closest('.plc-bottom-tab[data-plc-bottom-tab]');
            if (bottomTab && this.modalEl.contains(bottomTab)) {
                e.preventDefault();
                const k = bottomTab.getAttribute('data-plc-bottom-tab');
                if (k) this.setPlcBottomTab(k);
                return;
            }
            const addBeam = e.target.closest('[data-role="add-beam-card"]');
            if (addBeam && this.modalEl.contains(addBeam)) {
                e.preventDefault();
                const beams = this.readBeamsFromModal();
                const ai = this.getActiveBeamIndexFromDom();
                beams.push({ machine: 'ProBeam', technique: 'PBS', radiationType: 'PROTON' });
                this.refreshBeamList(beams, beams.length - 1);
                return;
            }
            const rmBeam = e.target.closest('[data-role="remove-beam-card"]');
            if (rmBeam && this.modalEl.contains(rmBeam)) {
                e.preventDefault();
                const beams = this.readBeamsFromModal();
                const ai = this.getActiveBeamIndexFromDom();
                if (beams.length <= 1) return;
                beams.splice(ai, 1);
                const na = Math.min(ai, beams.length - 1);
                this.refreshBeamList(beams, na);
                return;
            }
            const card = e.target.closest('[data-beam-card]');
            if (
                card &&
                this.modalEl.querySelector('#plcBeamList')?.contains(card) &&
                !e.target.closest('select')
            ) {
                const idx = Number.parseInt(card.getAttribute('data-beam-card'), 10);
                if (Number.isFinite(idx)) this.setActiveBeamCard(idx);
                return;
            }
            if (e.target === this.modalEl && this.options.mountContainer === document.body) close();
        });

        this.modalEl.addEventListener('input', (e) => {
            const optOv = this.modalEl.querySelector('#plcOptSettingsOverlay');
            if (!optOv || optOv.hidden) return;
            const t = e.target;
            if (!(t instanceof HTMLInputElement)) return;
            if (t.id !== 'plcOptIterationsInput') return;
            const raw = Number.parseInt(t.value, 10);
            const n = Number.isFinite(raw) ? Math.min(2000, Math.max(1, raw)) : 1;
            this._optSettingsIterations = n;
            if (String(n) !== t.value) t.value = String(n);
            this.refreshOptEstimateText();
        });

        this.modalEl.addEventListener('change', (e) => {
            const t = e.target;
            if (!(t instanceof HTMLSelectElement) || !this.modalEl.querySelector('#plcBeamList')?.contains(t)) {
                return;
            }
            const field = t.getAttribute('data-field');
            const card = t.closest('[data-beam-card]');
            if (!card) return;
            if (field === 'machine') {
                this.syncBeamCardDerivedFields(card);
            } else if (field === 'rad') {
                const techSel = card.querySelector('[data-field="technique"]');
                if (techSel) {
                    const rad = t.value;
                    const techOpts = this.getBeamTechniqueOptions(rad);
                    const sel = this.coerceBeamTechnique(rad, techSel.value);
                    techSel.innerHTML = this.opts(techOpts, sel);
                    techSel.value = sel;
                }
            }
            this.syncPlanLibraryCenterMounts();
        });

        const totalEl = this.modalEl.querySelector('#plcTotalDose');
        const frEl = this.modalEl.querySelector('#plcFractions');
        const fdEl = this.modalEl.querySelector('#plcFracDose');
        const upd = () => {
            const t = Number.parseFloat(totalEl?.value);
            const f = Number.parseInt(frEl?.value, 10);
            if (fdEl && Number.isFinite(t) && Number.isFinite(f) && f > 0) {
                fdEl.value = (Math.round((t / f) * 100) / 100).toFixed(2);
            }
        };
        totalEl?.addEventListener('input', upd);
        frEl?.addEventListener('input', upd);

        const rail = this.modalEl.querySelector('.plc-rail');
        rail?.addEventListener('click', (e) => {
            const tab = e.target.closest('.plc-rail-tab[data-plc-panel]');
            if (!tab || !this.modalEl.contains(tab)) return;
            const key = tab.getAttribute('data-plc-panel');
            if (key) this.switchPlcRailPanel(key);
        });
        rail?.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            const tabs = [...this.modalEl.querySelectorAll('.plc-rail-tab[data-plc-panel]')];
            const i = tabs.indexOf(document.activeElement);
            if (i < 0) return;
            e.preventDefault();
            const next = e.key === 'ArrowDown' ? Math.min(i + 1, tabs.length - 1) : Math.max(i - 1, 0);
            const t = tabs[next];
            t.focus();
            const key = t.getAttribute('data-plc-panel');
            if (key) this.switchPlcRailPanel(key);
        });
    }

    collectData() {
        if (!this.modalEl) return {};
        const q = (sel) => this.modalEl.querySelector(sel)?.value ?? '';
        const beams = this.readBeamsFromModal();
        const activeBeamIndex = this.getActiveBeamIndexFromDom();
        const active = beams[activeBeamIndex] || beams[0] || {};
        return {
            planImage: q('#plcPlanImage'),
            structure: q('#plcStructure'),
            targetRoi: q('#plcTargetRoi'),
            totalDose: Number.parseFloat(q('#plcTotalDose')),
            fractions: Number.parseInt(q('#plcFractions'), 10),
            beams,
            activeBeamIndex,
            machine: active.machine ?? '',
            radiationType: active.radiationType ?? 'PHOTON',
            technique: active.technique ?? ''
        };
    }

    handleEsc(e) {
        if (e.key === 'Escape') {
            if (this._optSettingsOpen) {
                this.closeOptSettingsModal();
                return;
            }
            if (this._clinicalGoalsOpen) {
                this.closeClinicalGoalsModal();
                return;
            }
            this.hide();
            if (typeof this.options.onCancel === 'function') this.options.onCancel();
        }
    }

    hide() {
        if (!this.modalEl) return;
        this.exitFullscreenBridge();
        this.disposePlanLibraryCenterProtonPhoton();
        this.disposeCenterView2dInstances();
        this.disposeRailSubInstances();
        window.removeEventListener('keydown', this._boundEscHandler);
        this.modalEl.remove();
        this.modalEl = null;
    }

    destroy() {
        this.hide();
    }

    opts(list, selected) {
        const s = String(selected ?? '');
        return (Array.isArray(list) ? list : []).map((x) => {
            const val = String(x);
            return `<option value="${this.escapeAttr(val)}" ${val === s ? 'selected' : ''}>${this.escapeHtml(val)}</option>`;
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
    window.PlanLibraryComponent = PlanLibraryComponent;
}
