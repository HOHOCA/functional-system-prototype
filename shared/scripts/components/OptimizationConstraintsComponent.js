class OptimizationConstraintsComponent {
    constructor(containerOrOptions = {}, maybeOptions = {}) {
        this.container = null;
        // 兼容两种调用方式：
        // 1) new OptimizationConstraintsComponent(options)
        // 2) new OptimizationConstraintsComponent(mountElOrId, options)
        if (
            containerOrOptions instanceof HTMLElement
            || (typeof containerOrOptions === 'string' && containerOrOptions.trim() !== '')
        ) {
            this.container = containerOrOptions;
            this.options = maybeOptions || {};
        } else {
            this.options = containerOrOptions || {};
        }

        // 简单的 mock 数据：ROI、射束、处方剂量
        this.beams = ['Beam 1', 'Beam 2', 'Beam 3'];
        this.prescriptionDose = 4000; // cGy

        this.rois = [
            { id: 'roi1', name: '0_GTV_Prostate', type: 'GTV', color: '#ff00ff' },
            { id: 'roi2', name: '3800CTV', type: 'CTV', color: '#00ffff' },
            { id: 'roi3', name: 'Bladder', type: 'OAR', color: '#0000ff' },
            { id: 'roi4', name: 'Rectum', type: 'OAR', color: '#ff0000' },
            { id: 'roi5', name: '275R', type: 'OAR', color: '#00ff00' },
            { id: 'roi6', name: '90R', type: 'OAR', color: '#ffff00' },
            { id: 'roi7', name: 'External', type: 'EXTERNAL', color: '#cccccc' }
        ];

        // ROI 候选库：用于“添加ROI”弹窗（可通过 options.roiLibrary 覆盖）
        // 说明：state.rois 是“已添加到列表的 ROI”；roiLibrary 是“计划内可选 ROI”全集。
        this.roiLibrary = Array.isArray(this.options?.roiLibrary) && this.options.roiLibrary.length
            ? this.options.roiLibrary
            : [
                { name: 'CTV', type: 'CTV' },
                { name: 'GTV', type: 'GTV' },
                { name: 'PTV', type: 'PTV' },
                { name: 'RTV 1', type: 'OAR' },
                { name: 'RTV 2', type: 'OAR' },
                { name: 'RTV 3', type: 'OAR' },
                { name: 'RTV 4', type: 'OAR' },
                { name: 'RTV 5', type: 'OAR' },
                { name: 'BrachialPlexus_L', type: 'OAR' },
                { name: 'BrachialPlexus_R', type: 'OAR' },
                { name: 'Body', type: 'BODY' },
                { name: 'CTV1', type: 'CTV' }
            ].map((r, idx) => ({
                id: `lib-${idx + 1}`,
                name: r.name,
                type: r.type,
                color: '#888888'
            }));

        // 约束函数列表（简化版，只含需求中提到的）
        this.functionOptions = [
            { value: 'MaxDose', label: 'Max Dose', group: 'max' },
            { value: 'MinDose', label: 'Min Dose', group: 'min' },
            { value: 'MaxDVH', label: 'Max DVH', group: 'max' },
            { value: 'MinDVH', label: 'Min DVH', group: 'min' },
            { value: 'MeanDose', label: 'Mean Dose', group: 'avg' },
            { value: 'UniformDose', label: 'Uniform Dose', group: 'avg' },
            { value: 'UpperGEUD', label: 'Upper gEUD', group: 'max' },
            { value: 'TargetGEUD', label: 'Target gEUD', group: 'avg' },
            { value: 'LowerGEUD', label: 'Lower gEUD', group: 'min' },
            { value: 'MaxLETd', label: 'Max LETd', group: 'max' },
            { value: 'MinLETd', label: 'Min LETd', group: 'min' },
            { value: 'FallOff', label: 'Fall Off', group: 'other' },
            { value: 'InwardReduce', label: 'Inward Reduce', group: 'other' }
        ];

        // 当前数据结构：按 ROI 分组的约束
        this.state = {
            rois: [],
            robustConfigured: true // 原型中简单默认已配置，可直接勾选鲁棒性
        };

        // 列配置（用于“约束列表设置”弹窗）；columnLocked：必选列，与产品截图一致不可关闭
        // 列顺序与「约束列表设置」/宽表一致；后段为扩展参数列（截图：实际剂量、体积、预测值、剂量、LETd…）
        this.columns = [
            { key: 'visible', label: 'Show/Hide', visible: true, columnLocked: true },
            { key: 'color', label: '颜色', visible: true, columnLocked: true },
            { key: 'roi', label: 'ROI', visible: true, columnLocked: true },
            { key: 'roiType', label: '类型', visible: false },
            { key: 'func', label: '函数', visible: true },
            { key: 'expr', label: '约束', visible: true },
            { key: 'scope', label: '生效范围', visible: true },
            { key: 'robust', label: '鲁棒性', visible: true },
            { key: 'weight', label: '权重', visible: true },
            { key: 'penalty', label: '罚分', visible: true },
            { key: 'actualDose', label: '实际剂量[cGy](RBE)', visible: true },
            { key: 'volume', label: '体积[%]', visible: true },
            { key: 'predicted', label: '预测值', visible: true },
            { key: 'dose', label: '剂量[cGy](RBE)', visible: true },
            { key: 'letd', label: 'LETd[keV/μm]', visible: true },
            { key: 'gEUDa', label: 'gEUD a', visible: true },
            { key: 'fallOffDistance', label: '跌落距离[cm]', visible: true },
            { key: 'fallOffHighDose', label: '跌落高剂量[cGy](RBE)', visible: true },
            { key: 'fallOffLowDose', label: '跌落低剂量[cGy](RBE)', visible: true },
            { key: 'weakStrong', label: '强/弱', visible: true }
        ];

        // 模板列表（仅前端内存，演示用）
        this.templates = [
            // 器官限量模板示例（包含 SFRT）
            {
                id: 'tmpl-sfrt-demo',
                name: 'conventional fractionation(4)',
                templateType: 'organ-limit',
                isSFRT: true,
                roiEntries: [
                    {
                        roiName: '0_GTV_Prostate',
                        roiType: 'GTV',
                        constraints: [
                            { func: 'MinDVH', volume: 99, dose: 4000, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 100, robust: false, scope: ['auto'], weakStrong: 'weak' },
                            { func: 'MaxDose', volume: '', dose: 4280, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 50, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: '3800CTV',
                        roiType: 'CTV',
                        constraints: [
                            { func: 'MinDVH', volume: 98, dose: 3800, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 100, robust: false, scope: ['auto'], weakStrong: 'weak' },
                            { func: 'MaxDVH', volume: 5, dose: 4060, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 80, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: 'Bladder',
                        roiType: 'OAR',
                        constraints: [
                            { func: 'UpperGEUD', volume: '', dose: 3200, gEUDa: 1, letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 10, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: 'Rectum',
                        roiType: 'OAR',
                        constraints: [
                            { func: 'UpperGEUD', volume: '', dose: 2800, gEUDa: 1, letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 10, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: 'Body',
                        roiType: 'BODY',
                        constraints: [
                            { func: 'MaxDose', volume: '', dose: 4300, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 100, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: '90R',
                        roiType: 'OAR',
                        constraints: [
                            { func: 'MaxDVH', volume: 1, dose: 2200, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 10, robust: false, scope: ['beam-2'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: '275R',
                        roiType: 'OAR',
                        constraints: [
                            { func: 'MaxDVH', volume: 1, dose: 2200, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 10, robust: false, scope: ['beam-3'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: 'External',
                        roiType: 'EXTERNAL',
                        constraints: [
                            { func: 'MaxDose', volume: '', dose: 4400, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 50, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: 'POI_SFRT_1',
                        roiType: 'POI',
                        constraints: [
                            { func: 'MeanDose', volume: '', dose: 2000, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 5, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: 'POI_SFRT_2',
                        roiType: 'POI',
                        constraints: [
                            { func: 'MeanDose', volume: '', dose: 1800, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 5, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: 'Rectum',
                        roiType: 'OAR',
                        constraints: [
                            {
                                func: 'InwardReduce',
                                volume: '',
                                dose: 2400,
                                gEUDa: '',
                                letd: '',
                                fallOffDistance: '',
                                fallOffHighDose: 4280,
                                targetRoiId: '0_GTV_Prostate', // 模板中配置的靶区名称，加载时按名称匹配当前计划靶区
                                weight: 20,
                                robust: false,
                                scope: ['auto'],
                                weakStrong: 'weak'
                            }
                        ]
                    }
                ]
            },
            // 器官限量模板示例（普通）
            {
                id: 'tmpl-organ-rtog',
                name: 'RTOG',
                templateType: 'organ-limit',
                isSFRT: false,
                roiEntries: [
                    {
                        roiName: 'SpinalCord',
                        roiType: 'OAR',
                        constraints: [
                            { func: 'MaxDose', volume: '', dose: 4500, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 100, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: 'BrainStem',
                        roiType: 'OAR',
                        constraints: [
                            { func: 'MaxDose', volume: '', dose: 5400, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 100, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    }
                ]
            },
            // 优化约束模板示例
            {
                id: 'tmpl-opt-5158',
                name: '5158',
                templateType: 'optimization',
                isSFRT: false,
                roiEntries: [
                    {
                        roiName: 'PTV',
                        roiType: 'PTV',
                        constraints: [
                            { func: 'MinDVH', volume: 99, dose: 5000, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 100, robust: false, scope: ['auto'], weakStrong: 'weak' },
                            { func: 'MaxDVH', volume: 1, dose: 5400, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 80, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: 'Lung_L',
                        roiType: 'OAR',
                        constraints: [
                            { func: 'MaxDVH', volume: 20, dose: 2000, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 20, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    },
                    {
                        roiName: 'Lung_R',
                        roiType: 'OAR',
                        constraints: [
                            { func: 'MaxDVH', volume: 20, dose: 2000, gEUDa: '', letd: '', fallOffDistance: '', fallOffHighDose: '', weight: 20, robust: false, scope: ['auto'], weakStrong: 'weak' }
                        ]
                    }
                ]
            }
        ];

        // 初始化默认 ROI 与约束
        this.initDefaultData();
        /** 列表字段设置按钮若被挂到 columnSettingsHost，需跟踪以便下次 render 前移除，避免重复节点 */
        this._externalColumnSettingsBtn = null;
    }

    mount(container) {
        if (typeof container === 'string') {
            this.container = document.getElementById(container);
        } else {
            this.container = container;
        }
        if (!this.container) return;

        this.ensureStyles();
        this.render();
        this.bindEvents();
    }

    resolveColumnSettingsHost() {
        const h = this.options && this.options.columnSettingsHost;
        if (!h) return null;
        if (typeof h === 'string') {
            return document.getElementById(h) || document.querySelector(h);
        }
        if (h instanceof HTMLElement) return h;
        return null;
    }

    ensureStyles() {
        if (document.getElementById('opt-constraints-component-styles')) return;
        const style = document.createElement('style');
        style.id = 'opt-constraints-component-styles';
        style.innerHTML = `
        .opt-constraints-root {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            background: #1a1a1a;
            color: #e5e5e5;
            font-size: 12px;
            font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
        }
        .opt-constraints-toolbar {
            display: flex;
            align-items: center;
            padding: 6px 10px;
            background: #252525;
            border-bottom: 1px solid #333;
            gap: 8px;
        }
        .opt-constraints-toolbar-left {
            display: flex;
            gap: 6px;
        }
        .opt-btn {
            min-width: 64px;
            height: 26px;
            padding: 0 10px;
            background: #303030;
            border: 1px solid #444;
            border-radius: 2px;
            color: #ddd;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 12px;
        }
        .opt-btn.opt-icon-btn {
            min-width: 26px;
            width: 26px;
            padding: 0;
            background: transparent;
            border: none;
        }
        .opt-btn.opt-icon-btn:hover {
            background: rgba(255, 255, 255, 0.08);
        }
        .opt-btn svg {
            width: 14px;
            height: 14px;
            display: block;
            fill: currentColor;
        }
        .opt-btn i {
            font-size: 12px;
        }
        .opt-column-settings-btn {
            min-width: 28px;
            padding: 0 6px;
        }
        .opt-btn:hover {
            background: #3a3a3a;
            border-color: #555;
        }
        .opt-btn:disabled {
            opacity: 0.45;
            cursor: default;
        }
        .opt-constraints-table-wrapper {
            flex: 1;
            min-height: 0;
            overflow: auto;
            background: #1a1a1a;
        }
        .opt-constraints-table {
            width: max-content;
            min-width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 12px;
            border: 1px solid #2f2f2f;
            table-layout: auto;
        }
        .opt-constraints-table th,
        .opt-constraints-table td {
            border-bottom: 1px solid #2f2f2f;
            border-right: 1px solid #2f2f2f;
            padding: 5px 10px;
            white-space: nowrap;
            overflow: visible;
            vertical-align: middle;
            color: #ccc;
        }
        .opt-constraints-table th:last-child,
        .opt-constraints-table td:last-child {
            border-right: none;
        }
        .opt-constraints-table tbody tr:last-child td {
            border-bottom: none;
        }
        .opt-constraints-table th {
            background: #2a2a2a;
            position: sticky;
            top: 0;
            z-index: 1;
            font-weight: 600;
            color: #fff;
            border-bottom: 2px solid #3f3f3f;
        }
        .opt-constraints-table tbody tr:hover {
            background: #232323;
        }
        .opt-constraints-table tbody tr.opt-row-selected {
            background: #30353f;
        }
        .opt-constraints-table input:not([type="checkbox"]),
        .opt-constraints-table select {
            background: #111;
            border: 1px solid #333;
            border-radius: 4px;
            color: #ddd;
            padding: 4px 8px;
            box-sizing: border-box;
            font-size: 12px;
            max-width: 320px;
        }
        .opt-constraints-table select {
            min-width: 120px;
            width: auto;
            field-sizing: content;
        }
        .opt-constraints-table input[type="number"] {
            min-width: 56px;
            width: 100%;
            max-width: 140px;
        }
        /* 统一去掉 number 输入框上下箭头（Chrome/Safari/Firefox） */
        .opt-constraints-root input[type="number"],
        .opt-modal input[type="number"] {
            -moz-appearance: textfield;
            appearance: textfield;
        }
        .opt-constraints-root input[type="number"]::-webkit-outer-spin-button,
        .opt-constraints-root input[type="number"]::-webkit-inner-spin-button,
        .opt-modal input[type="number"]::-webkit-outer-spin-button,
        .opt-modal input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .opt-constraints-table input:focus,
        .opt-constraints-table select:focus {
            outline: none;
            border-color: #555;
            background: #1a1a1a;
        }
        .opt-constraints-table input:disabled,
        .opt-constraints-table select:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background: #181818;
        }
        .opt-constraints-eye-btn {
            cursor: pointer;
            color: #999;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .opt-constraints-eye-btn.active {
            color: #3AACDE;
        }
        .opt-constraints-color-dot {
            width: 12px;
            height: 12px;
            border-radius: 2px;
            display: inline-block;
            box-shadow: 0 0 4px rgba(0,0,0,0.6);
        }
        .opt-penalty-highlight {
            color: #f97373;
        }
        .opt-predicted-wrap {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .opt-predicted-input {
            flex: 1;
            min-width: 0;
            background: #111;
            border: 1px solid #333;
            border-radius: 4px;
            color: #9ca3af;
            padding: 3px 6px;
            font-size: 12px;
            box-sizing: border-box;
        }
        .opt-predicted-arrow {
            flex-shrink: 0;
            color: #2dd4bf;
            font-size: 14px;
            line-height: 1;
        }
        .opt-weak-strong-select {
            width: 100%;
            max-width: 64px;
            background: #111;
            border: 1px solid #333;
            border-radius: 4px;
            color: #86efac;
            padding: 2px 4px;
            font-size: 11px;
            box-sizing: border-box;
        }
        .opt-weak-strong-select option {
            color: #ddd;
            background: #1a1a1a;
        }
        .opt-constraints-footer {
            flex-shrink: 0;
            padding: 4px 10px;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #333;
            background: #252525;
        }
        .opt-column-settings-btn {
            margin-left: auto;
        }
        .opt-modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        .opt-modal {
            background: #1a1a1a;
            border-radius: 6px;
            min-width: 420px;
            max-width: 720px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 16px rgba(0,0,0,0.6);
            border: 1px solid #333;
        }
        .opt-modal-header {
            flex-shrink: 0;
            padding: 10px 14px;
            border-bottom: 1px solid #333;
            background: #242424;
            font-weight: 500;
            font-size: 13px;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .opt-modal-close {
            color: #bbb;
        }
        .opt-modal-close:hover {
            color: #fff;
        }
        .opt-modal-body {
            flex: 1;
            min-height: 0;
            padding: 10px 14px;
            overflow: auto;
        }
        .opt-modal-footer {
            flex-shrink: 0;
            padding: 8px 14px;
            border-top: 1px solid #333;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
        }
        .opt-simple-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .opt-simple-list label {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 12px;
            color: #ddd;
        }
        .opt-simple-list input[type="checkbox"] {
            margin-right: 4px;
        }
        /* —— 约束列表设置弹窗（与视觉稿一致）—— */
        .opt-modal-column-settings {
            width: 380px;
            min-width: 320px;
            max-width: 92vw;
            font-size: 12px;
            font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
            border-radius: 8px;
            border: 1px solid #2a2a2a;
            background: #141414;
            box-shadow: 0 8px 32px rgba(0,0,0,0.55);
        }
        .opt-modal-column-settings .opt-modal-header {
            padding: 14px 16px;
            background: #1a1a1a;
            border-bottom: 1px solid #2c2c2c;
            font-size: 13px;
            font-weight: 600;
        }
        .opt-modal-column-settings .opt-modal-body {
            padding: 0;
            background: #141414;
        }
        .opt-modal-column-settings .opt-modal-footer {
            padding: 12px 16px;
            border-top: 1px solid #2c2c2c;
            background: #1a1a1a;
            gap: 10px;
        }
        .opt-column-settings-list {
            display: flex;
            flex-direction: column;
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .opt-column-setting-row {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 44px;
            padding: 0 16px;
            margin: 0;
            background: #1c1c1c;
            border-bottom: 1px solid #2f2f2f;
            user-select: none;
            box-sizing: border-box;
        }
        .opt-column-setting-row:last-child {
            border-bottom: none;
        }
        .opt-column-setting-row:hover {
            background: #222222;
        }
        .opt-column-setting-row .opt-col-toggle {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            margin: 0;
            accent-color: #3AACDE;
            cursor: pointer;
        }
        .opt-column-setting-row .opt-col-toggle:disabled {
            cursor: default;
            opacity: 0.65;
        }
        .opt-column-setting-row .opt-col-label {
            flex: 1;
            min-width: 0;
            font-size: 12px;
            color: #ececec;
            line-height: 1.3;
            cursor: pointer;
        }
        .opt-column-setting-row.is-locked .opt-col-label {
            cursor: default;
            color: #c4c4c4;
        }
        .opt-column-settings-drag {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            padding: 6px 4px;
            cursor: grab;
            opacity: 0.75;
        }
        .opt-column-settings-drag:active {
            cursor: grabbing;
        }
        .opt-column-settings-drag span {
            display: block;
            width: 16px;
            height: 2px;
            background: #7a7a7a;
            border-radius: 1px;
        }
        .opt-modal-column-settings .opt-col-btn-cancel {
            min-width: 72px;
            height: 30px;
            padding: 0 14px;
            background: transparent;
            border: 1px solid #b8b8b8;
            color: #f0f0f0;
            border-radius: 4px;
            font-size: 12px;
        }
        .opt-modal-column-settings .opt-col-btn-cancel:hover {
            background: rgba(255,255,255,0.06);
            border-color: #d0d0d0;
        }
        .opt-modal-column-settings .opt-col-btn-ok {
            min-width: 72px;
            height: 30px;
            padding: 0 14px;
            background: #3AACDE;
            border: 1px solid #2f9bc9;
            color: #fff;
            border-radius: 4px;
            font-weight: 500;
            font-size: 12px;
        }
        .opt-modal-column-settings .opt-col-btn-ok:hover {
            background: #4ab8e8;
            border-color: #3AACDE;
        }
        /* —— 编辑约束弹窗（分区表单，随函数切换条件区）—— */
        .opt-edit-constraint-modal {
            width: 440px;
            max-width: 94vw;
            min-width: 320px;
            font-size: 12px;
            font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
            background: #2b2b2b;
            border: 1px solid #3a3a3a;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.55);
        }
        .opt-edit-constraint-modal .opt-modal-header {
            padding: 14px 16px;
            background: #2b2b2b;
            border-bottom: 1px solid #3a3a3a;
            font-size: 13px;
            font-weight: 600;
            color: #f0f0f0;
        }
        .opt-edit-constraint-modal .opt-modal-body.opt-ec-body {
            padding: 12px 16px 8px;
            max-height: 72vh;
            overflow: auto;
            background: #2b2b2b;
        }
        .opt-edit-constraint-modal .opt-modal-footer {
            padding: 12px 16px;
            border-top: 1px solid #3a3a3a;
            background: #2b2b2b;
            justify-content: flex-end;
            gap: 10px;
        }
        .opt-ec-row {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            gap: 12px;
        }
        .opt-ec-label {
            flex: 0 0 100px;
            text-align: right;
            font-size: 12px;
            color: #b0b0b0;
            line-height: 1.3;
        }
        .opt-ec-req {
            color: #ff5252;
            margin-right: 2px;
        }
        .opt-ec-control {
            flex: 1;
            min-width: 0;
        }
        .opt-ec-input-wrap {
            position: relative;
            width: 100%;
        }
        .opt-ec-input {
            width: 100%;
            box-sizing: border-box;
            height: 32px;
            padding: 6px 10px;
            background: #1a1a1a;
            border: 1px solid #454545;
            border-radius: 4px;
            color: #f0f0f0;
            font-size: 12px;
        }
        .opt-ec-input.opt-ec-input--suffix {
            padding-right: 92px;
        }
        .opt-ec-input:focus {
            outline: none;
            border-color: #5a5a5a;
        }
        .opt-ec-input-readonly {
            cursor: default;
            opacity: 0.95;
        }
        .opt-ec-suffix {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 11px;
            color: #8a8a8a;
            pointer-events: none;
            white-space: nowrap;
        }
        .opt-ec-select {
            width: 100%;
            height: 32px;
            box-sizing: border-box;
            padding: 4px 28px 4px 10px;
            background: #1a1a1a;
            border: 1px solid #454545;
            border-radius: 4px;
            color: #f0f0f0;
            font-size: 12px;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%23999'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 8px center;
        }
        .opt-ec-select:focus {
            outline: none;
            border-color: #5a5a5a;
        }
        .opt-ec-select-scope {
            color: #3AACDE;
        }
        .opt-ec-func-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .opt-ec-func-bar {
            flex-shrink: 0;
            width: 4px;
            height: 20px;
            border-radius: 2px;
            background: #757575;
        }
        .opt-ec-func-wrap .opt-ec-select {
            flex: 1;
            min-width: 0;
        }
        .opt-ec-section {
            display: flex;
            align-items: center;
            margin: 16px 0 12px;
            font-size: 11px;
            color: #7a7a7a;
        }
        .opt-ec-section::before,
        .opt-ec-section::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #404040;
        }
        .opt-ec-section span {
            padding: 0 12px;
            white-space: nowrap;
        }
        .opt-ec-row-robust .opt-ec-radio-group {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .opt-ec-radio {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #909090;
            cursor: pointer;
        }
        .opt-ec-radio input {
            accent-color: #6b6b6b;
        }
        .opt-ec-btn-cancel {
            min-width: 72px;
            height: 30px;
            padding: 0 14px;
            background: transparent !important;
            border: 1px solid #c0c0c0 !important;
            color: #f0f0f0 !important;
            border-radius: 4px;
            font-size: 12px;
        }
        .opt-ec-btn-cancel:hover {
            background: rgba(255,255,255,0.06) !important;
        }
        .opt-ec-btn-ok {
            min-width: 72px;
            height: 30px;
            padding: 0 14px;
            background: #3AACDE !important;
            border: 1px solid #2f9bc9 !important;
            color: #fff !important;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        .opt-ec-btn-ok:hover {
            background: #4ab8e8 !important;
        }
        /* —— 添加ROI 弹窗（左右双列表）—— */
        .opt-add-roi-modal {
            width: 760px;
            max-width: 96vw;
            min-width: 640px;
            background: #2b2b2b;
            border: 1px solid #3a3a3a;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.55);
            font-size: 12px;
            font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
        }
        .opt-add-roi-modal .opt-modal-header {
            padding: 14px 16px;
            background: #2b2b2b;
            border-bottom: 1px solid #3a3a3a;
            font-size: 13px;
            font-weight: 600;
            color: #f0f0f0;
        }
        .opt-add-roi-modal .opt-modal-body {
            padding: 12px 16px 8px;
            background: #2b2b2b;
        }
        .opt-add-roi-modal .opt-modal-footer {
            padding: 12px 16px;
            border-top: 1px solid #3a3a3a;
            background: #2b2b2b;
            justify-content: flex-end;
            gap: 10px;
        }
        .opt-add-roi-layout {
            display: grid;
            grid-template-columns: 1fr 56px 1fr;
            gap: 16px;
            align-items: center;
        }
        .opt-add-roi-panel-title {
            font-size: 12px;
            color: #b0b0b0;
            margin-bottom: 8px;
        }
        .opt-add-roi-list {
            height: 360px;
            border: 1px solid #3a3a3a;
            border-radius: 4px;
            background: #1a1a1a;
            overflow: auto;
        }
        .opt-add-roi-item {
            padding: 10px 12px;
            border-bottom: 1px solid #2b2b2b;
            color: #d8d8d8;
            cursor: pointer;
            user-select: none;
        }
        .opt-add-roi-item:last-child { border-bottom: none; }
        .opt-add-roi-item:hover { background: #222; }
        .opt-add-roi-item.active {
            background: rgba(58, 172, 222, 0.22);
            outline: 1px solid rgba(58, 172, 222, 0.7);
        }
        .opt-add-roi-transfer {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
            justify-content: center;
        }
        .opt-add-roi-transfer-btn {
            width: 28px;
            height: 28px;
            border-radius: 4px;
            border: 1px solid #4a4a4a;
            background: #2f2f2f;
            color: #ddd;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .opt-add-roi-transfer-btn:hover { background: #3a3a3a; }
        .opt-add-roi-transfer-btn:disabled { opacity: 0.45; cursor: default; }
        .opt-add-roi-addall {
            margin-top: 8px;
            font-size: 12px;
            color: #3AACDE;
            cursor: pointer;
            user-select: none;
            display: inline-block;
        }
        .opt-add-roi-addall:hover { text-decoration: underline; }
        `;
        document.head.appendChild(style);
    }

    initDefaultData() {
        // 初始化成与截图接近的一组示例数据
        const [roiGTV, roiCTV, roiBladder, roiRectum, roi275R, roi90R, roiExternal] = this.rois;

        this.state.rois = [
            {
                id: roiGTV.id,
                name: roiGTV.name,
                type: roiGTV.type,
                color: roiGTV.color,
                visible: true,
                order: 0,
                constraints: [
                    {
                        id: 'c-gtv-min',
                        roiId: roiGTV.id,
                        func: 'MinDose',
                        volume: '',
                        dose: 4000,
                        gEUDa: '',
                        letd: '',
                        fallOffDistance: '',
                        fallOffHighDose: '',
                        targetRoiId: '',
                        scope: ['auto'],
                        robust: false,
                        weight: 100,
                        penalty: '0.02 (50%)',
                        actualDose: 3881.9,
                        actualLETd: '',
                        weakStrong: 'weak'
                    },
                    {
                        id: 'c-gtv-max',
                        roiId: roiGTV.id,
                        func: 'MaxDose',
                        volume: '',
                        dose: 4150,
                        gEUDa: '',
                        letd: '',
                        fallOffDistance: '',
                        fallOffHighDose: '',
                        targetRoiId: '',
                        scope: ['auto'],
                        robust: false,
                        weight: 100,
                        penalty: '0.00 (0%)',
                        actualDose: 4141.46,
                        actualLETd: '',
                        weakStrong: 'weak'
                    }
                ]
            },
            {
                id: roiCTV.id,
                name: roiCTV.name,
                type: roiCTV.type,
                color: roiCTV.color,
                visible: true,
                order: 1,
                constraints: [
                    {
                        id: 'c-ctv-min',
                        roiId: roiCTV.id,
                        func: 'MinDose',
                        volume: '',
                        dose: 3800,
                        gEUDa: '',
                        letd: '',
                        fallOffDistance: '',
                        fallOffHighDose: '',
                        targetRoiId: '',
                        scope: ['auto'],
                        robust: false,
                        weight: 100,
                        penalty: '0.01 (23%)',
                        actualDose: 3693.79,
                        actualLETd: '',
                        weakStrong: 'weak'
                    },
                    {
                        id: 'c-ctv-max',
                        roiId: roiCTV.id,
                        func: 'MaxDose',
                        volume: '',
                        dose: 3910,
                        gEUDa: '',
                        letd: '',
                        fallOffDistance: '',
                        fallOffHighDose: '',
                        targetRoiId: '',
                        scope: ['auto'],
                        robust: false,
                        weight: 100,
                        penalty: '0.01 (27%)',
                        actualDose: 3966.35,
                        actualLETd: '',
                        weakStrong: 'weak'
                    }
                ]
            },
            {
                id: roiBladder.id,
                name: roiBladder.name,
                type: roiBladder.type,
                color: roiBladder.color,
                visible: true,
                order: 2,
                constraints: [
                    {
                        id: 'c-bladder-maxdvh',
                        roiId: roiBladder.id,
                        func: 'MaxDVH',
                        volume: 1.0,
                        dose: 3400,
                        gEUDa: '',
                        letd: '',
                        fallOffDistance: '',
                        fallOffHighDose: '',
                        targetRoiId: '',
                        scope: ['auto'],
                        robust: false,
                        weight: 100,
                        penalty: '0.00 (0%)',
                        actualDose: 3156.21,
                        actualLETd: '',
                        weakStrong: 'weak'
                    }
                ]
            },
            {
                id: roiRectum.id,
                name: roiRectum.name,
                type: roiRectum.type,
                color: roiRectum.color,
                visible: true,
                order: 3,
                constraints: [
                    {
                        id: 'c-rectum-max',
                        roiId: roiRectum.id,
                        func: 'MaxDose',
                        volume: '',
                        dose: 3400,
                        gEUDa: '',
                        letd: '',
                        fallOffDistance: '',
                        fallOffHighDose: '',
                        targetRoiId: '',
                        scope: ['auto'],
                        robust: false,
                        weight: 10,
                        penalty: '0.00 (0%)',
                        actualDose: 3815.9,
                        actualLETd: '',
                        weakStrong: 'weak'
                    }
                ]
            },
            {
                id: roi275R.id,
                name: roi275R.name,
                type: roi275R.type,
                color: roi275R.color,
                visible: true,
                order: 4,
                constraints: [
                    {
                        id: 'c-275r-mindvh',
                        roiId: roi275R.id,
                        func: 'MinDVH',
                        volume: 1.0,
                        dose: 2200,
                        gEUDa: '',
                        letd: '',
                        fallOffDistance: '',
                        fallOffHighDose: '',
                        targetRoiId: '',
                        scope: ['beam-3'],
                        robust: false,
                        weight: 10,
                        penalty: '0.00 (0%)',
                        actualDose: 3861.15,
                        actualLETd: '',
                        weakStrong: 'weak'
                    }
                ]
            },
            {
                id: roi90R.id,
                name: roi90R.name,
                type: roi90R.type,
                color: roi90R.color,
                visible: true,
                order: 5,
                constraints: [
                    {
                        id: 'c-90r-mindvh',
                        roiId: roi90R.id,
                        func: 'MinDVH',
                        volume: 1.0,
                        dose: 2200,
                        gEUDa: '',
                        letd: '',
                        fallOffDistance: '',
                        fallOffHighDose: '',
                        targetRoiId: '',
                        scope: ['beam-2'],
                        robust: false,
                        weight: 10,
                        penalty: '0.00 (0%)',
                        actualDose: 3841.76,
                        actualLETd: '',
                        weakStrong: 'weak'
                    }
                ]
            },
            {
                id: roiExternal.id,
                name: roiExternal.name,
                type: roiExternal.type,
                color: roiExternal.color,
                visible: true,
                order: 6,
                constraints: [
                    {
                        id: 'c-ext-max',
                        roiId: roiExternal.id,
                        func: 'MaxDose',
                        volume: '',
                        dose: 4300,
                        gEUDa: '',
                        letd: '',
                        fallOffDistance: '',
                        fallOffHighDose: '',
                        targetRoiId: '',
                        scope: ['auto'],
                        robust: false,
                        weight: 50,
                        penalty: '0.00 (0%)',
                        actualDose: 4141.46,
                        actualLETd: '',
                        weakStrong: 'weak'
                    }
                ]
            }
        ];
    }

    createEmptyConstraint(roi) {
        return {
            id: 'c-' + Math.random().toString(36).slice(2),
            roiId: roi.id,
            func: '',
            volume: '',
            dose: '',
            gEUDa: '',
            letd: '',
            fallOffDistance: '',
            fallOffHighDose: '',
            targetRoiId: '',
            scope: ['auto'],
            robust: false,
            weight: '',
            penalty: '',
            actualDose: '',
            actualLETd: '',
            weakStrong: 'weak',
            predicted: ''
        };
    }

    createDefaultMinDVHConstraint(roi) {
        const c = this.createEmptyConstraint(roi);
        c.func = 'MinDVH';
        c.volume = 100.0;
        c.dose = this.prescriptionDose;
        c.weight = roi.type === 'PTV' || roi.type === 'CTV' || roi.type === 'GTV' ? 100 : 0;
        c.scope = ['auto'];
        return c;
    }

    render() {
        if (!this.container) return;
        // 允许外部直接调用 render()（不走 mount）时也能注入样式
        this.ensureStyles();
        if (this._externalColumnSettingsBtn && this._externalColumnSettingsBtn.parentNode) {
            this._externalColumnSettingsBtn.remove();
        }
        this._externalColumnSettingsBtn = null;
        this.container.innerHTML = '';

        const root = document.createElement('div');
        root.className = 'opt-constraints-root';
        root.innerHTML = `
            <div class="opt-constraints-toolbar">
                <button class="opt-btn opt-column-settings-btn" data-action="column-settings">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
            <div class="opt-constraints-table-wrapper">
                ${this.renderTable()}
            </div>
            <div class="opt-constraints-footer">
                <div class="opt-constraints-toolbar-left">
                    <button class="opt-btn" data-action="add-roi">添加ROI</button>
                    <button class="opt-btn" data-action="delete-roi">删除ROI</button>
                    <button class="opt-btn" data-action="add-constraint">添加约束</button>
                    <button class="opt-btn" data-action="edit-constraint">编辑约束</button>
                    <button class="opt-btn" data-action="delete-constraint">删除约束</button>
                    <button class="opt-btn" data-action="move-up">上移</button>
                    <button class="opt-btn" data-action="move-down">下移</button>
                    <button class="opt-btn" data-action="load-template">加载模板</button>
                    <button class="opt-btn" data-action="create-template">创建模板</button>
                </div>
            </div>
        `;

        this.container.appendChild(root);
        this.root = root;

        const columnSettingsBtn = root.querySelector('.opt-column-settings-btn');
        if (columnSettingsBtn) {
            columnSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openColumnSettingsModal();
            });
        }

        const settingsHost = this.resolveColumnSettingsHost();
        if (settingsHost && columnSettingsBtn) {
            settingsHost.appendChild(columnSettingsBtn);
            this._externalColumnSettingsBtn = columnSettingsBtn;
            const topToolbar = root.querySelector('.opt-constraints-toolbar');
            if (topToolbar && topToolbar.childElementCount === 0) {
                topToolbar.remove();
            }
        }

        this.updatePenaltyHighlight();
        this.updateToolbarButtonState();
    }

    renderTable() {
        const visibleColumns = this.columns.filter(c => c.visible);
        const allVisible = this.state.rois.length === 0 ? true : this.state.rois.every(r => r.visible);
        const headerCells = visibleColumns.map(col => {
            if (col.key === 'visible') {
                return `<th data-col="${col.key}" style="text-align: center;">
                            <i class="fas ${allVisible ? 'fa-eye' : 'fa-eye-slash'}" 
                               data-role="header-toggle-visible"
                               style="color: ${allVisible ? '#3AACDE' : '#888'}; cursor: pointer;" 
                               title="${allVisible ? '全部隐藏' : '全部显示'}"></i>
                        </th>`;
            }
            if (col.key === 'color') {
                return `<th data-col="${col.key}">颜色</th>`;
            }
            return `<th data-col="${col.key}">${col.label}</th>`;
        }).join('');

        let bodyHtml = '';
        this.state.rois
            .sort((a, b) => a.order - b.order)
            .forEach(roi => {
                const constraints = roi.constraints;
                constraints.forEach((c, idx) => {
                    const isFirst = idx === 0;
                    const rowId = `${roi.id}-${c.id}`;
                    bodyHtml += `
                        <tr class="${this.selectedRowId === rowId ? 'opt-row-selected' : ''}" 
                            data-row-id="${rowId}" 
                            data-roi-id="${roi.id}" 
                            data-constraint-id="${c.id}">
                            ${visibleColumns.map(col => this.renderCell(col.key, roi, c, isFirst)).join('')}
                        </tr>
                    `;
                });
            });

        const colMinPx = {
            visible: 44,
            color: 52,
            roi: 132,
            roiType: 72,
            func: 136,
            expr: 176,
            scope: 124,
            robust: 72,
            weight: 80,
            penalty: 112,
            actualDose: 120,
            volume: 96,
            predicted: 108,
            dose: 112,
            letd: 100,
            gEUDa: 88,
            fallOffDistance: 108,
            fallOffHighDose: 132,
            fallOffLowDose: 132,
            weakStrong: 76,
            actualLETd: 100,
            targetRoi: 120
        };
        const colgroup = visibleColumns.map(col => {
            const w = colMinPx[col.key] ?? 88;
            return `<col style="min-width:${w}px" />`;
        }).join('');

        return `
            <table class="opt-constraints-table">
                <colgroup>${colgroup}</colgroup>
                <thead>
                    <tr>${headerCells}</tr>
                </thead>
                <tbody>
                    ${bodyHtml}
                </tbody>
            </table>
        `;
    }

    renderCell(key, roi, c, isFirstRowOfRoi) {
        switch (key) {
            case 'visible':
                return `<td style="text-align: center;">
                    <i class="fas ${roi.visible ? 'fa-eye' : 'fa-eye-slash'} opt-constraints-row-eye" 
                       style="color: ${roi.visible ? '#3AACDE' : '#888'}; cursor: pointer;" 
                       title="${roi.visible ? '隐藏' : '显示'}"></i>
                </td>`;
            case 'color':
                return `<td><span class="opt-constraints-color-dot" style="background:${roi.color};"></span></td>`;
            case 'roi':
                return `<td>${isFirstRowOfRoi ? roi.name : ''}</td>`;
            case 'roiType':
                return `<td>${isFirstRowOfRoi ? (roi.type || '') : ''}</td>`;
            case 'func':
                return `<td>
                    <select data-field="func">
                        <option value=""></option>
                        ${this.functionOptions.map(opt => `
                            <option value="${opt.value}" ${opt.value === c.func ? 'selected' : ''}>
                                ${opt.label}
                            </option>`).join('')}
                    </select>
                </td>`;
            case 'expr':
                return `<td>${this.buildConstraintExpression(c)}</td>`;
            case 'volume':
                return `<td>${this.renderNumberInput('volume', c.volume, this.isVolumeEnabled(c), null, null, this.isVolumeEnabled(c) ? '' : '(0.01 …')}</td>`;
            case 'dose':
                return `<td>${this.renderNumberInput('dose', c.dose, this.isPrimaryDoseColumnEnabled(c), null, null, this.isPrimaryDoseColumnEnabled(c) ? '' : '')}</td>`;
            case 'fallOffLowDose':
                return `<td>${this.renderNumberInput('dose', c.dose, this.isFallOffLowDoseColumnEnabled(c), null, null, this.isFallOffLowDoseColumnEnabled(c) ? '' : '[0.00 ~ 10000…')}</td>`;
            case 'gEUDa':
                return `<td>${this.renderNumberInput('gEUDa', c.gEUDa, this.isGEUDEaEnabled(c), null, null, this.isGEUDEaEnabled(c) ? '' : '[-40…')}</td>`;
            case 'letd':
                return `<td>${this.renderNumberInput('letd', c.letd, this.isLETdEnabled(c), null, null, this.isLETdEnabled(c) ? '' : '[0.01 ~…')}</td>`;
            case 'fallOffDistance':
                return `<td>${this.renderNumberInput('fallOffDistance', c.fallOffDistance, this.isFallOffDistanceEnabled(c), null, null, this.isFallOffDistanceEnabled(c) ? '' : '[0.00 …')}</td>`;
            case 'fallOffHighDose':
                return `<td>${this.renderNumberInput('fallOffHighDose', c.fallOffHighDose, this.isFallOffHighDoseColumnEnabled(c), null, null, this.isFallOffHighDoseColumnEnabled(c) ? '' : '[0.00 ~ 10000…')}</td>`;
            case 'predicted': {
                const pv = c.predicted != null && c.predicted !== '' ? this._ecEscapeAttr(String(c.predicted)) : '';
                return `<td class="opt-predicted-cell">
                    <div class="opt-predicted-wrap">
                        <input type="text" class="opt-predicted-input" data-field="predicted" value="${pv}">
                        <span class="opt-predicted-arrow" aria-hidden="true">→</span>
                    </div>
                </td>`;
            }
            case 'weakStrong': {
                const ws = c.weakStrong === 'strong' ? 'strong' : 'weak';
                return `<td>
                    <select data-field="weakStrong" class="opt-weak-strong-select">
                        <option value="weak" ${ws === 'weak' ? 'selected' : ''}>弱</option>
                        <option value="strong" ${ws === 'strong' ? 'selected' : ''}>强</option>
                    </select>
                </td>`;
            }
            case 'targetRoi':
                return `<td>${this.renderTargetRoiSelect(c)}</td>`;
            case 'scope':
                return `<td>${this.renderScopeSelect(c)}</td>`;
            case 'robust':
                return `<td style="text-align:center;">
                    <input type="checkbox" data-field="robust" ${this.state.robustConfigured ? '' : 'disabled'} ${c.robust ? 'checked' : ''}/>
                </td>`;
            case 'weight':
                return `<td>${this.renderNumberInput('weight', c.weight, !!c.func, 0, 1000)}</td>`;
            case 'penalty':
                return `<td class="opt-penalty-cell">${c.penalty || '0.00 (0%)'}</td>`;
            case 'actualDose':
                return `<td>${c.actualDose !== '' ? Number(c.actualDose).toFixed(2) : ''}</td>`;
            case 'actualLETd':
                return `<td>${c.actualLETd !== '' ? Number(c.actualLETd).toFixed(2) : ''}</td>`;
            default:
                return '<td></td>';
        }
    }

    renderNumberInput(field, value, enabled, min, max, placeholder) {
        const ph = placeholder
            ? ` placeholder="${this._ecEscapeAttr(placeholder)}"`
            : '';
        return `<input type="number" step="0.01" data-field="${field}" 
            ${enabled ? '' : 'disabled'} 
            ${min != null ? `min="${min}"` : ''} 
            ${max != null ? `max="${max}"` : ''} 
            value="${value !== '' && value != null ? value : ''}"${ph}>`;
    }

    renderTargetRoiSelect(c) {
        const options = [''].concat(this.state.rois.map(r => r.name));
        return `
            <select data-field="targetRoiId">
                ${options.map(name => {
                    const selected = name && this.rois.find(r => r.name === name && r.id === c.targetRoiId);
                    return `<option value="${name}" ${selected ? 'selected' : ''}>${name}</option>`;
                }).join('')}
            </select>
        `;
    }

    renderScopeSelect(c) {
        const items = [
            { value: 'auto', label: '自动分配' },
            { value: 'even', label: '射束均分' },
            ...this.beams.map((b, idx) => ({ value: 'beam-' + (idx + 1), label: b }))
        ];
        const current = Array.isArray(c.scope) ? (c.scope[0] || 'auto') : (c.scope || 'auto');
        return `
            <select data-field="scope">
                ${items.map(item => `
                    <option value="${item.value}" ${current === item.value ? 'selected' : ''}>
                        ${item.label}
                    </option>
                `).join('')}
            </select>
        `;
    }

    isVolumeEnabled(c) {
        return c.func === 'MaxDVH' || c.func === 'MinDVH';
    }

    isDoseEnabled(c) {
        return !!c.func;
    }

    /** 宽表「剂量」列：跌落类函数在「跌落低剂量」列编辑，此处禁用避免重复 */
    isPrimaryDoseColumnEnabled(c) {
        if (!c.func) return false;
        return c.func !== 'FallOff' && c.func !== 'InwardReduce';
    }

    isFallOffLowDoseColumnEnabled(c) {
        return c.func === 'FallOff' || c.func === 'InwardReduce';
    }

    isFallOffHighDoseColumnEnabled(c) {
        return c.func === 'FallOff' || c.func === 'InwardReduce';
    }

    isFallOffDistanceEnabled(c) {
        return c.func === 'FallOff';
    }

    isGEUDEaEnabled(c) {
        return c.func === 'UpperGEUD' || c.func === 'TargetGEUD' || c.func === 'LowerGEUD';
    }

    isLETdEnabled(c) {
        return c.func === 'MaxLETd' || c.func === 'MinLETd';
    }

    buildConstraintExpression(c) {
        if (!c.func) return '';
        switch (c.func) {
            case 'MaxDose':
                return c.dose ? `剂量 ${c.dose}cGy` : 'Max Dose';
            case 'MinDose':
                return c.dose ? `剂量 ${c.dose}cGy` : 'Min Dose';
            case 'MaxDVH':
            case 'MinDVH':
                if (c.volume && c.dose) {
                    return `体积 ${Number(c.volume).toFixed(2)}%，剂量 ${c.dose}cGy`;
                }
                return this.funcLabel(c.func);
            case 'MeanDose':
            case 'UniformDose':
                return c.dose ? `剂量 ${c.dose}cGy` : this.funcLabel(c.func);
            case 'UpperGEUD':
            case 'TargetGEUD':
            case 'LowerGEUD':
                if (c.dose && c.gEUDa !== '') {
                    return `剂量 ${c.dose}cGy，gEUDa ${c.gEUDa}`;
                }
                return this.funcLabel(c.func);
            case 'MaxLETd':
            case 'MinLETd':
                return c.letd ? `LETd ${c.letd} keV/μm` : this.funcLabel(c.func);
            case 'FallOff':
                if (c.fallOffHighDose && c.dose && c.fallOffDistance) {
                    return `跌落高剂量 ${c.fallOffHighDose}cGy，跌落低剂量 ${c.dose}cGy，跌落距离 ${c.fallOffDistance}cm`;
                }
                return 'Fall Off';
            case 'InwardReduce':
                // 与原型截图一致：显示跌落高/低剂量 + 靶区
                {
                    const hi = c.fallOffHighDose;
                    const lo = c.dose;
                    let targetName = '';
                    if (c.targetRoiId) {
                        const t =
                            this.state?.rois?.find(r => r.id === c.targetRoiId)
                            || this.state?.rois?.find(r => r.name === c.targetRoiId);
                        targetName = t ? t.name : String(c.targetRoiId);
                    }

                    const parts = [];
                    if (hi !== '' && hi != null && !Number.isNaN(Number(hi))) {
                        parts.push(`跌落高剂量 ${Number(hi).toFixed(2)}cGy`);
                    }
                    if (lo !== '' && lo != null && !Number.isNaN(Number(lo))) {
                        parts.push(`跌落低剂量 ${Number(lo).toFixed(2)}cGy`);
                    }
                    if (targetName) {
                        parts.push(`靶区 ${targetName}`);
                    }

                    return parts.length ? parts.join('，') : 'Inward Reduce';
                }
            default:
                return this.funcLabel(c.func);
        }
    }

    funcLabel(funcValue) {
        const item = this.functionOptions.find(f => f.value === funcValue);
        return item ? item.label : funcValue;
    }

    getFunctionStyleGroup(funcValue) {
        if (!funcValue) return 'other';
        const item = this.functionOptions.find(f => f.value === funcValue);
        return item && item.group ? item.group : 'other';
    }

    getFunctionAccentColor(group) {
        if (group === 'max') return '#e53935';
        if (group === 'min') return '#43a047';
        if (group === 'avg') return '#3AACDE';
        return '#757575';
    }

    _ecReadNumberInput(el) {
        if (!el) return '';
        const v = el.value;
        if (v === '') return '';
        const n = Number(v);
        return Number.isNaN(n) ? '' : n;
    }

    _ecEscapeAttr(s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    getRoiLibrary() {
        const lib = Array.isArray(this.roiLibrary) ? this.roiLibrary : [];
        // 把 this.rois 也并入候选库，避免“库里没有默认 ROI”导致无法再次添加
        const map = new Map();
        lib.forEach(r => map.set(r.id, r));
        (this.rois || []).forEach(r => {
            if (r && r.id && !map.has(r.id)) map.set(r.id, r);
        });
        // 把当前已添加 ROI 也并入候选库，保证弹窗“已添加ROI”一定能显示
        (this.state?.rois || []).forEach(r => {
            if (r && r.id && !map.has(r.id)) {
                map.set(r.id, {
                    id: r.id,
                    name: r.name,
                    type: r.type,
                    color: r.color || '#888888'
                });
            }
        });
        return Array.from(map.values());
    }

    buildEditConstraintScopeOptions(work) {
        const items = [
            { value: 'auto', label: '自动分配' },
            { value: 'even', label: '射束均分' },
            ...this.beams.map((b, idx) => ({ value: `beam-${idx + 1}`, label: b }))
        ];
        const current = Array.isArray(work.scope) ? (work.scope[0] || 'auto') : (work.scope || 'auto');
        return items.map(item => `
            <option value="${item.value}" ${current === item.value ? 'selected' : ''}>${item.label}</option>
        `).join('');
    }

    buildEditConstraintTargetRoiOptions(work) {
        let selectedValue = work.targetRoiId || '';
        const byId = this.state.rois.find(r => r.id === selectedValue);
        const byName = this.state.rois.find(r => r.name === selectedValue);
        if (!byId && byName) selectedValue = byName.id;
        return `
            <option value=""></option>
            ${this.state.rois.map(r => `
                <option value="${r.id}" ${r.id === selectedValue ? 'selected' : ''}>${this._ecEscapeAttr(r.name)}</option>
            `).join('')}
        `;
    }

    buildEditConstraintConditionInnerHtml(work) {
        const req = '<span class="opt-ec-req">*</span>';
        const numRow = (field, label, required, suffix) => {
            const v = work[field] !== '' && work[field] != null ? work[field] : '';
            const suf = suffix ? `<span class="opt-ec-suffix">${suffix}</span>` : '';
            const sufClass = suffix ? ' opt-ec-input--suffix' : '';
            const mark = required ? req : '';
            return `
            <div class="opt-ec-row">
                <label class="opt-ec-label">${mark}${label}</label>
                <div class="opt-ec-control">
                    <div class="opt-ec-input-wrap">
                        <input type="number" step="0.01" class="opt-ec-input${sufClass}" data-field="${field}" value="${v}">
                        ${suf}
                    </div>
                </div>
            </div>`;
        };

        const rows = [];
        const f = work.func;

        if (!f) {
            rows.push(numRow('dose', '剂量', true, 'cGy (RBE)'));
        } else if (f === 'MaxDose' || f === 'MinDose' || f === 'MeanDose' || f === 'UniformDose') {
            rows.push(numRow('dose', '剂量', true, 'cGy (RBE)'));
        } else if (f === 'MaxDVH' || f === 'MinDVH') {
            rows.push(numRow('volume', '体积', true, '%'));
            rows.push(numRow('dose', '剂量', true, 'cGy (RBE)'));
        } else if (f === 'UpperGEUD' || f === 'LowerGEUD' || f === 'TargetGEUD') {
            rows.push(numRow('dose', '剂量', true, 'cGy (RBE)'));
            rows.push(numRow('gEUDa', 'gEUDa', true, ''));
        } else if (f === 'MaxLETd' || f === 'MinLETd') {
            rows.push(numRow('letd', 'LETd', true, 'keV/μm'));
        } else if (f === 'FallOff') {
            rows.push(numRow('fallOffHighDose', '跌落高剂量', true, 'cGy (RBE)'));
            rows.push(numRow('dose', '跌落低剂量', true, 'cGy (RBE)'));
            rows.push(numRow('fallOffDistance', '跌落距离', true, 'cm'));
        } else if (f === 'InwardReduce') {
            rows.push(numRow('fallOffHighDose', '跌落高剂量', true, 'cGy (RBE)'));
            rows.push(numRow('dose', '跌落低剂量', true, 'cGy (RBE)'));
            rows.push(`
            <div class="opt-ec-row">
                <label class="opt-ec-label">${req}对应靶区</label>
                <div class="opt-ec-control">
                    <select class="opt-ec-select" data-field="targetRoiId">
                        ${this.buildEditConstraintTargetRoiOptions(work)}
                    </select>
                </div>
            </div>`);
        }

        const robustDisabled = !this.state.robustConfigured;
        const onChecked = work.robust ? 'checked' : '';
        const offChecked = !work.robust ? 'checked' : '';
        rows.push(`
        <div class="opt-ec-row opt-ec-row-robust">
            <label class="opt-ec-label">鲁棒性优化</label>
            <div class="opt-ec-control opt-ec-radio-group">
                <label class="opt-ec-radio">
                    <input type="radio" name="optEditRobust" value="1" ${onChecked} ${robustDisabled ? 'disabled' : ''}>
                    <span>开启</span>
                </label>
                <label class="opt-ec-radio">
                    <input type="radio" name="optEditRobust" value="0" ${offChecked} ${robustDisabled ? 'disabled' : ''}>
                    <span>关闭</span>
                </label>
            </div>
        </div>`);

        return rows.join('');
    }

    syncEditConstraintWorkFromModal(modal, work) {
        const funcEl = modal.querySelector('[data-field="func"]');
        if (funcEl) work.func = funcEl.value;
        const wEl = modal.querySelector('[data-field="weight"]');
        if (wEl) work.weight = this._ecReadNumberInput(wEl);
        const scEl = modal.querySelector('[data-field="scope"]');
        if (scEl) work.scope = [scEl.value || 'auto'];
        const rb = modal.querySelector('input[name="optEditRobust"]:checked');
        if (rb && !rb.disabled) work.robust = rb.value === '1';

        ['volume', 'dose', 'gEUDa', 'letd', 'fallOffDistance', 'fallOffHighDose'].forEach(field => {
            const el = modal.querySelector(`input[data-field="${field}"]`);
            if (el) work[field] = this._ecReadNumberInput(el);
        });
        const tr = modal.querySelector('[data-field="targetRoiId"]');
        if (tr) work.targetRoiId = tr.value || '';
    }

    applyEditConstraintWorkToConstraint(constraint, work) {
        constraint.func = work.func;
        constraint.volume = work.volume;
        constraint.dose = work.dose;
        constraint.gEUDa = work.gEUDa;
        constraint.letd = work.letd;
        constraint.fallOffDistance = work.fallOffDistance;
        constraint.fallOffHighDose = work.fallOffHighDose;
        constraint.targetRoiId = work.targetRoiId || '';
        constraint.weight = work.weight;
        constraint.robust = work.robust;
        constraint.scope = Array.isArray(work.scope) ? [...work.scope] : [work.scope || 'auto'];
        constraint.weakStrong = work.weakStrong === 'strong' ? 'strong' : 'weak';
        constraint.predicted = work.predicted != null ? work.predicted : '';
    }

    bindEvents() {
        if (!this.container) return;

        // 使用 container 事件委托，避免 render() 替换 DOM 后监听器失效（与 ChannelListComponent 一致）
        this.container.addEventListener('click', (e) => {
            const clicked = e.target;

            // 表头总开关眼睛（与 ChannelListComponent 完全一致）
            const headerEyeTh = clicked.closest('.opt-constraints-table thead th:first-child');
            if (headerEyeTh && (clicked.classList.contains('fa-eye') ||
                                clicked.classList.contains('fa-eye-slash') ||
                                clicked.classList.contains('fas') ||
                                clicked.tagName === 'I' ||
                                clicked.closest('[data-role="header-toggle-visible"]'))) {
                e.stopPropagation();
                e.preventDefault();
                this.toggleAllVisibility();
                return;
            }

            // 单行眼睛（始终可点击，与通道列表一致）
            const rowEye = clicked.closest('.opt-constraints-row-eye');
            if (rowEye) {
                e.stopPropagation();
                const tr = rowEye.closest('tr');
                if (tr && tr.dataset.roiId) {
                    this.toggleVisibility(tr.dataset.roiId);
                }
                return;
            }

            // 工具栏按钮
            const btn = clicked.closest('.opt-btn[data-action]');
            if (btn) {
                const action = btn.dataset.action;
                if (action === 'column-settings') {
                    return;
                }
                switch (action) {
                    case 'add-roi': this.openAddRoiModal(); break;
                    case 'delete-roi': this.confirmDeleteRoi(); break;
                    case 'add-constraint': this.handleAddConstraint(); break;
                    case 'edit-constraint': this.openEditConstraintModal(); break;
                    case 'delete-constraint': this.confirmDeleteConstraint(); break;
                    case 'move-up': this.moveRoi(-1); break;
                    case 'move-down': this.moveRoi(1); break;
                    case 'load-template':
                        this.openLoadTemplateModal();
                        break;
                    case 'create-template':
                        this.openCreateTemplateModal();
                        break;
                }
                return;
            }

            // 选中行
            const row = clicked.closest('tr[data-row-id]');
            if (row) {
                this.selectedRowId = row.dataset.rowId;
                this.updateRowSelection();
                this.updateToolbarButtonState();
            }
        });

        this.container.addEventListener('dblclick', (e) => {
            const row = e.target.closest('tr[data-row-id]');
            if (row) {
                this.selectedRowId = row.dataset.rowId;
                this.updateRowSelection();
                this.openEditConstraintModal();
            }
        });

        this.container.addEventListener('change', (e) => {
            const target = e.target;
            const tr = target.closest('tr[data-row-id]');
            if (!tr) return;
            const roiId = tr.dataset.roiId;
            const constraintId = tr.dataset.constraintId;

            const field = target.dataset.field;
            if (!field) return;

            const roi = this.state.rois.find(r => r.id === roiId);
            if (!roi) return;
            const constraint = roi.constraints.find(c => c.id === constraintId);
            if (!constraint) return;

            if (field === 'robust') {
                constraint.robust = target.checked;
            } else if (field === 'scope') {
                const selected = target.value;
                constraint.scope = selected || 'auto';
                // 单选下拉，无需重新 render
            } else if (field === 'func') {
                constraint.func = target.value;
                this.applyDefaultsForFunction(roi, constraint);
                this.render();
            } else if (field === 'targetRoiId') {
                constraint.targetRoiId = target.value;
            } else if (field === 'weakStrong') {
                constraint.weakStrong = target.value === 'strong' ? 'strong' : 'weak';
            } else if (field === 'predicted') {
                constraint.predicted = target.value;
            } else {
                // 数值字段
                const v = target.value;
                constraint[field] = v === '' ? '' : Number(v);
            }

            // 更新表达式与罚分高亮
            this.updatePenaltyHighlight();
        });
    }

    updateRowSelection() {
        this.root.querySelectorAll('tr[data-row-id]').forEach(tr => {
            tr.classList.toggle('opt-row-selected', tr.dataset.rowId === this.selectedRowId);
        });
    }

    toggleVisibility(roiId) {
        const roi = this.state.rois.find(r => r.id === roiId);
        if (!roi) return;
        roi.visible = !roi.visible;
        this.render();
    }

    toggleAllVisibility() {
        if (this.state.rois.length === 0) return;

        const allVisible = this.state.rois.every(r => r.visible);
        const newVisible = !allVisible;
        this.state.rois.forEach(r => { r.visible = newVisible; });

        this.render();
    }

    // scope 现在是单选字符串，不再需要多选归一逻辑

    applyDefaultsForFunction(roi, constraint) {
        const isTarget = ['PTV', 'CTV', 'GTV', 'IRRAD_VOLUME', 'TREATED_VOLUME'].includes(roi.type);
        switch (constraint.func) {
            case 'MaxDose':
                constraint.dose = isTarget ? this.prescriptionDose * 1.07 : this.prescriptionDose;
                constraint.weight = isTarget ? 100 : 0;
                break;
            case 'MinDose':
                constraint.dose = isTarget ? this.prescriptionDose : 1;
                constraint.weight = isTarget ? 100 : 0;
                break;
            case 'MaxDVH':
                constraint.volume = isTarget ? 5 : 1;
                constraint.dose = isTarget ? this.prescriptionDose * 1.07 : this.prescriptionDose;
                break;
            case 'MinDVH':
                constraint.volume = isTarget ? 99 : 1;
                constraint.dose = isTarget ? this.prescriptionDose : 1;
                break;
            case 'MeanDose':
                constraint.dose = this.prescriptionDose;
                break;
            case 'UniformDose':
                constraint.dose = this.prescriptionDose;
                break;
            case 'UpperGEUD':
                constraint.dose = this.prescriptionDose;
                constraint.gEUDa = isTarget ? 20 : 1;
                break;
            case 'TargetGEUD':
                constraint.dose = this.prescriptionDose;
                constraint.gEUDa = -1;
                break;
            case 'LowerGEUD':
                constraint.dose = this.prescriptionDose;
                constraint.gEUDa = -1;
                break;
            case 'MaxLETd':
            case 'MinLETd':
                constraint.letd = 10;
                break;
            case 'FallOff':
                constraint.fallOffHighDose = isTarget ? this.prescriptionDose * 1.07 : 1;
                constraint.dose = isTarget ? this.prescriptionDose * 0.6 : 1;
                constraint.fallOffDistance = isTarget ? 0.3 : 0.1;
                break;
            default:
                break;
        }
    }

    // ---- 通用提示弹窗（使用原型样式，而非浏览器原生） ----

    showAlert(message, onClose) {
        const backdrop = document.createElement('div');
        backdrop.className = 'opt-modal-backdrop';
        backdrop.innerHTML = `
            <div class="opt-modal" style="min-width:320px; max-width:420px;">
                <div class="opt-modal-header">
                    <span>提示</span>
                    <button class="opt-btn opt-icon-btn opt-modal-close" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="opt-modal-body" style="font-size:12px; color:#ddd;">
                    ${message}
                </div>
                <div class="opt-modal-footer">
                    <button class="opt-btn" data-role="ok">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const close = () => {
            backdrop.remove();
            if (onClose) onClose();
        };

        const okBtn = backdrop.querySelector('[data-role="ok"]');
        if (okBtn) okBtn.addEventListener('click', close);
        const closeBtn = backdrop.querySelector('[data-role="close"]');
        if (closeBtn) closeBtn.addEventListener('click', close);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) close();
        });
    }

    showConfirm(message, onConfirm, onCancel) {
        const backdrop = document.createElement('div');
        backdrop.className = 'opt-modal-backdrop';
        backdrop.innerHTML = `
            <div class="opt-modal" style="min-width:320px; max-width:420px;">
                <div class="opt-modal-header">
                    <span>确认</span>
                    <button class="opt-btn opt-icon-btn opt-modal-close" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="opt-modal-body" style="font-size:12px; color:#ddd;">
                    ${message}
                </div>
                <div class="opt-modal-footer">
                    <button class="opt-btn" data-role="cancel">取消</button>
                    <button class="opt-btn" data-role="ok">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const close = () => backdrop.remove();
        const okBtn = backdrop.querySelector('[data-role="ok"]');
        const cancelBtn = backdrop.querySelector('[data-role="cancel"]');
        const closeBtn = backdrop.querySelector('[data-role="close"]');

        if (okBtn) {
            okBtn.addEventListener('click', () => {
                close();
                if (onConfirm) onConfirm();
            });
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                close();
                if (onCancel) onCancel();
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                close();
                if (onCancel) onCancel();
            });
        }
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                close();
                if (onCancel) onCancel();
            }
        });
    }

    updatePenaltyHighlight() {
        // 标红罚分最高的前三条
        const allConstraints = [];
        this.state.rois.forEach(roi => {
            roi.constraints.forEach(c => {
                if (c.penalty) {
                    const num = parseFloat(String(c.penalty).split(' ')[0]);
                    allConstraints.push({ c, value: isNaN(num) ? 0 : num });
                }
            });
        });

        // 按罚分从大到小排序，取前三
        allConstraints.sort((a, b) => b.value - a.value);
        const top3 = new Set(allConstraints.slice(0, 3).map(item => item.c));

        const tbody = this.root.querySelector('tbody');
        if (!tbody) return;
        tbody.querySelectorAll('tr').forEach(tr => {
            const cell = tr.querySelector('.opt-penalty-cell');
            if (!cell) return;
            cell.classList.remove('opt-penalty-highlight');
            const roiId = tr.dataset.roiId;
            const constraintId = tr.dataset.constraintId;
            const roi = this.state.rois.find(r => r.id === roiId);
            const constraint = roi && roi.constraints.find(c => c.id === constraintId);
            if (constraint && top3.has(constraint)) {
                cell.classList.add('opt-penalty-highlight');
            }
        });
    }

    updateToolbarButtonState() {
        const hasSelection = !!this.selectedRowId;
        const selInfo = this.getSelectedInfo();
        const hasRoi = !!selInfo.roi;

        this.root.querySelectorAll('.opt-btn[data-action]').forEach(btn => {
            const action = btn.dataset.action;
            let disabled = false;
            if (action === 'delete-roi' || action === 'move-up' || action === 'move-down') {
                disabled = !hasRoi;
            }
            if (action === 'add-constraint' || action === 'edit-constraint' || action === 'delete-constraint') {
                disabled = !hasSelection;
            }
            btn.disabled = disabled;
        });
    }

    getSelectedInfo() {
        if (!this.selectedRowId) return { roi: null, constraint: null };
        const [roiId, constraintId] = this.selectedRowId.split('-c-');
        const roi = this.state.rois.find(r => this.selectedRowId.startsWith(r.id));
        if (!roi) return { roi: null, constraint: null };
        const constraint = roi.constraints.find(c => ('c-' + this.selectedRowId.split('c-')[1]) === c.id);
        return { roi, constraint };
    }

    // ---- ROI / 约束操作 ----

    openAddRoiModal() {
        const existingIds = new Set(this.state.rois.map(r => r.id));
        const library = this.getRoiLibrary();
        const candidates = library.filter(r => !existingIds.has(r.id));

        const backdrop = document.createElement('div');
        backdrop.className = 'opt-modal-backdrop';
        backdrop.innerHTML = `
            <div class="opt-modal opt-add-roi-modal" role="dialog" aria-labelledby="optAddRoiTitle">
                <div class="opt-modal-header">
                    <span id="optAddRoiTitle">添加ROI</span>
                    <button class="opt-btn opt-icon-btn opt-modal-close" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="opt-modal-body">
                    <div class="opt-add-roi-layout">
                        <div>
                            <div class="opt-add-roi-panel-title">备选ROI</div>
                            <div class="opt-add-roi-list" id="optRoiCandidateList"></div>
                            <div class="opt-add-roi-addall" data-role="add-all">添加全部ROI</div>
                        </div>
                        <div class="opt-add-roi-transfer">
                            <button class="opt-add-roi-transfer-btn" type="button" data-role="move-right" title="添加">&gt;</button>
                            <button class="opt-add-roi-transfer-btn" type="button" data-role="move-left" title="移除">&lt;</button>
                        </div>
                        <div>
                            <div class="opt-add-roi-panel-title">已添加ROI</div>
                            <div class="opt-add-roi-list" id="optRoiSelectedList"></div>
                        </div>
                    </div>
                </div>
                <div class="opt-modal-footer">
                    <button class="opt-btn opt-ec-btn-cancel" type="button" data-role="cancel">取消</button>
                    <button class="opt-btn opt-ec-btn-ok" type="button" data-role="ok">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const candidateListEl = backdrop.querySelector('#optRoiCandidateList');
        const selectedListEl = backdrop.querySelector('#optRoiSelectedList');
        const moveRightBtn = backdrop.querySelector('[data-role="move-right"]');
        const moveLeftBtn = backdrop.querySelector('[data-role="move-left"]');

        const roiById = new Map(library.map(r => [r.id, r]));
        // 打开即回显：右侧=当前已添加 ROI（按 state.rois 当前顺序），左侧=剩余候选
        const selectedIds = this.state.rois.map(r => r.id).filter(id => roiById.has(id));
        const selectedIdSet = new Set(selectedIds);
        const candidateIds = candidates.map(r => r.id).filter(id => !selectedIdSet.has(id));

        let activeCandidateId = candidateIds[0] || '';
        let activeSelectedId = selectedIds[0] || '';

        const renderLists = () => {
            candidateListEl.innerHTML = candidateIds.length
                ? candidateIds.map(id => {
                    const r = roiById.get(id);
                    if (!r) return '';
                    return `<div class="opt-add-roi-item ${id === activeCandidateId ? 'active' : ''}" data-list="candidate" data-id="${id}">${this._ecEscapeAttr(r.name)}</div>`;
                }).join('')
                : `<div class="opt-add-roi-item" style="cursor:default;color:#7a7a7a;">无可添加ROI</div>`;

            selectedListEl.innerHTML = selectedIds.length
                ? selectedIds.map(id => {
                    const r = roiById.get(id);
                    if (!r) return '';
                    return `<div class="opt-add-roi-item ${id === activeSelectedId ? 'active' : ''}" data-list="selected" data-id="${id}">${this._ecEscapeAttr(r.name)}</div>`;
                }).join('')
                : `<div class="opt-add-roi-item" style="cursor:default;color:#7a7a7a;">未选择ROI</div>`;

            moveRightBtn.disabled = !activeCandidateId;
            moveLeftBtn.disabled = !activeSelectedId;
        };

        const pickNextActive = () => {
            if (activeCandidateId && !candidateIds.includes(activeCandidateId)) {
                activeCandidateId = candidateIds[0] || '';
            }
            if (activeSelectedId && !selectedIds.includes(activeSelectedId)) {
                activeSelectedId = selectedIds[0] || '';
            }
        };

        const moveRight = () => {
            if (!activeCandidateId) return;
            const idx = candidateIds.indexOf(activeCandidateId);
            if (idx < 0) return;
            candidateIds.splice(idx, 1);
            selectedIds.push(activeCandidateId);
            activeSelectedId = activeCandidateId;
            activeCandidateId = candidateIds[Math.min(idx, candidateIds.length - 1)] || '';
            renderLists();
        };

        const moveLeft = () => {
            if (!activeSelectedId) return;
            const idx = selectedIds.indexOf(activeSelectedId);
            if (idx < 0) return;
            selectedIds.splice(idx, 1);
            candidateIds.push(activeSelectedId);
            activeCandidateId = activeSelectedId;
            activeSelectedId = selectedIds[Math.min(idx, selectedIds.length - 1)] || '';
            renderLists();
        };

        backdrop.addEventListener('click', (e) => {
            const item = e.target.closest('.opt-add-roi-item');
            if (item) {
                const id = item.getAttribute('data-id');
                const list = item.getAttribute('data-list');
                if (list === 'candidate') {
                    activeCandidateId = id;
                    activeSelectedId = '';
                } else {
                    activeSelectedId = id;
                    activeCandidateId = '';
                }
                renderLists();
                return;
            }
            const roleEl = e.target.closest('[data-role]');
            if (!roleEl) return;
            const role = roleEl.getAttribute('data-role');
            if (role === 'move-right') moveRight();
            if (role === 'move-left') moveLeft();
            if (role === 'add-all') {
                while (candidateIds.length) {
                    const id = candidateIds.shift();
                    selectedIds.push(id);
                }
                activeCandidateId = '';
                activeSelectedId = selectedIds[0] || '';
                renderLists();
            }
        });

        // 双击快速移动
        backdrop.addEventListener('dblclick', (e) => {
            const item = e.target.closest('.opt-add-roi-item');
            if (!item) return;
            const list = item.getAttribute('data-list');
            if (list === 'candidate') {
                activeCandidateId = item.getAttribute('data-id');
                moveRight();
            } else {
                activeSelectedId = item.getAttribute('data-id');
                moveLeft();
            }
        });

        const okBtn = backdrop.querySelector('[data-role="ok"]');
        const cancelBtn = backdrop.querySelector('[data-role="cancel"]');
        const closeBtn = backdrop.querySelector('[data-role="close"]');
        const close = () => backdrop.remove();
        cancelBtn.addEventListener('click', close);
        closeBtn.addEventListener('click', close);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) close();
        });
        okBtn.addEventListener('click', () => {
            // 同步为“选择集”：允许在弹窗中移除已添加 ROI
            const selectedSet = new Set(selectedIds);

            // 1) 移除：仅移除那些在 roiById 中存在、且不在 selectedSet 中的 state.rois
            const removedIds = new Set(
                (this.state.rois || [])
                    .map(r => r.id)
                    .filter(id => roiById.has(id) && !selectedSet.has(id))
            );
            if (removedIds.size) {
                this.state.rois = (this.state.rois || []).filter(r => !removedIds.has(r.id));
                if (this.selectedRowId) {
                    const hit = Array.from(removedIds).some(id => String(this.selectedRowId).startsWith(id + '-'));
                    if (hit) this.selectedRowId = null;
                }
            }

            // 2) 新增：把 selectedSet 里尚未存在的 ROI 加进 state.rois
            const existedAfterRemoval = new Set((this.state.rois || []).map(r => r.id));
            selectedIds.forEach(id => {
                if (existedAfterRemoval.has(id)) return;
                const roi = roiById.get(id);
                if (!roi) return;
                this.state.rois.push({
                    id: roi.id,
                    name: roi.name,
                    type: roi.type,
                    color: roi.color || '#888888',
                    visible: true,
                    order: this.state.rois.length,
                    constraints: [this.createEmptyConstraint(roi)]
                });
            });

            // 3) 排序：按 selectedIds 顺序重排（仅对候选库中的 ROI 生效，其它 ROI 保持相对顺序）
            const orderIndex = new Map(selectedIds.map((id, i) => [id, i]));
            const inLib = [];
            const outLib = [];
            (this.state.rois || []).forEach(r => {
                if (orderIndex.has(r.id)) inLib.push(r);
                else outLib.push(r);
            });
            inLib.sort((a, b) => (orderIndex.get(a.id) ?? 1e9) - (orderIndex.get(b.id) ?? 1e9));
            this.state.rois = [...inLib, ...outLib];
            this.state.rois.forEach((r, i) => { r.order = i; });

            close();
            this.render();
        });

        pickNextActive();
        renderLists();
    }

    confirmDeleteRoi() {
        const selInfo = this.getSelectedInfo();
        if (!selInfo.roi) return;
        const roi = selInfo.roi;

        this.showConfirm(`是否删除 ROI：${roi.name} 及其所有优化约束？`, () => {
            this.state.rois = this.state.rois.filter(r => r.id !== roi.id);
            this.selectedRowId = null;
            this.render();
        });
    }

    handleAddConstraint() {
        const selInfo = this.getSelectedInfo();
        if (!selInfo.roi) {
            this.showAlert('请先选中ROI再添加优化约束。');
            return;
        }
        const roi = selInfo.roi;
        const constraint = this.createEmptyConstraint(roi);
        roi.constraints.push(constraint);
        this.selectedRowId = `${roi.id}-${constraint.id}`;
        this.render();
    }

    openEditConstraintModal() {
        const selInfo = this.getSelectedInfo();
        if (!selInfo.constraint || !selInfo.roi) return;
        const { roi, constraint } = selInfo;

        const work = {
            func: constraint.func || '',
            volume: constraint.volume,
            dose: constraint.dose,
            gEUDa: constraint.gEUDa,
            letd: constraint.letd,
            fallOffDistance: constraint.fallOffDistance,
            fallOffHighDose: constraint.fallOffHighDose,
            targetRoiId: constraint.targetRoiId || '',
            scope: Array.isArray(constraint.scope) ? [...constraint.scope] : (constraint.scope ? [constraint.scope] : ['auto']),
            weight: constraint.weight,
            robust: !!constraint.robust,
            weakStrong: constraint.weakStrong || 'weak',
            predicted: constraint.predicted != null ? constraint.predicted : ''
        };

        const grp0 = this.getFunctionStyleGroup(work.func);
        const barColor0 = this.getFunctionAccentColor(grp0);
        const condHtml = this.buildEditConstraintConditionInnerHtml(work);
        const wVal = work.weight !== '' && work.weight != null ? work.weight : '';

        const backdrop = document.createElement('div');
        backdrop.className = 'opt-modal-backdrop';
        backdrop.innerHTML = `
            <div class="opt-modal opt-edit-constraint-modal" role="dialog" aria-labelledby="optEditConstraintTitle">
                <div class="opt-modal-header">
                    <span id="optEditConstraintTitle">编辑约束</span>
                    <button class="opt-btn opt-icon-btn opt-modal-close" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="opt-modal-body opt-ec-body">
                    <div class="opt-ec-row">
                        <label class="opt-ec-label"><span class="opt-ec-req">*</span>ROI</label>
                        <div class="opt-ec-control">
                            <input type="text" class="opt-ec-input opt-ec-input-readonly" readonly
                                value="${this._ecEscapeAttr(roi.name)}">
                        </div>
                    </div>
                    <div class="opt-ec-row">
                        <label class="opt-ec-label"><span class="opt-ec-req">*</span>函数</label>
                        <div class="opt-ec-control opt-ec-func-wrap">
                            <span class="opt-ec-func-bar" aria-hidden="true" style="background:${barColor0}"></span>
                            <select class="opt-ec-select" data-field="func">
                                <option value=""></option>
                                ${this.functionOptions.map(opt => `
                                    <option value="${opt.value}" ${opt.value === work.func ? 'selected' : ''}>${opt.label}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="opt-ec-section"><span>条件</span></div>
                    <div id="optEditConditionMount">${condHtml}</div>
                    <div class="opt-ec-section"><span>生效范围</span></div>
                    <div class="opt-ec-row">
                        <label class="opt-ec-label"><span class="opt-ec-req">*</span>生效范围</label>
                        <div class="opt-ec-control">
                            <select class="opt-ec-select opt-ec-select-scope" data-field="scope">
                                ${this.buildEditConstraintScopeOptions(work)}
                            </select>
                        </div>
                    </div>
                    <div class="opt-ec-section"><span>权重</span></div>
                    <div class="opt-ec-row">
                        <label class="opt-ec-label">权重</label>
                        <div class="opt-ec-control">
                            <div class="opt-ec-input-wrap">
                                <input type="number" step="1" class="opt-ec-input" data-field="weight" value="${wVal}">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="opt-modal-footer">
                    <button class="opt-btn opt-ec-btn-cancel" type="button" data-role="cancel">取消</button>
                    <button class="opt-btn opt-ec-btn-ok" type="button" data-role="ok">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const modal = backdrop.querySelector('.opt-edit-constraint-modal');
        const conditionMount = modal.querySelector('#optEditConditionMount');
        const funcSelect = modal.querySelector('[data-field="func"]');

        const updateFuncBar = () => {
            const bar = modal.querySelector('.opt-ec-func-bar');
            if (!bar || !funcSelect) return;
            const g = this.getFunctionStyleGroup(funcSelect.value);
            bar.style.background = this.getFunctionAccentColor(g);
        };

        const refreshConditionBlock = () => {
            this.syncEditConstraintWorkFromModal(modal, work);
            work.func = funcSelect ? funcSelect.value : work.func;
            this.applyDefaultsForFunction(roi, work);
            conditionMount.innerHTML = this.buildEditConstraintConditionInnerHtml(work);
            updateFuncBar();
        };

        funcSelect.addEventListener('change', refreshConditionBlock);

        const okBtn = backdrop.querySelector('[data-role="ok"]');
        const cancelBtn = backdrop.querySelector('[data-role="cancel"]');
        const closeBtn = backdrop.querySelector('[data-role="close"]');

        const applyFromModal = () => {
            this.syncEditConstraintWorkFromModal(modal, work);
            this.applyEditConstraintWorkToConstraint(constraint, work);
            backdrop.remove();
            this.render();
        };

        okBtn.addEventListener('click', applyFromModal);
        const close = () => backdrop.remove();
        cancelBtn.addEventListener('click', close);
        closeBtn.addEventListener('click', close);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) close();
        });
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyFromModal();
            }
        });
    }

    confirmDeleteConstraint() {
        const selInfo = this.getSelectedInfo();
        if (!selInfo.constraint || !selInfo.roi) return;
        const { roi, constraint } = selInfo;

        this.showConfirm('是否删除所选优化约束？', () => {
            if (roi.constraints.length === 1) {
                // 最后一条：清空内容，但保留行
                Object.assign(constraint, this.createEmptyConstraint(roi), { id: constraint.id });
            } else {
                roi.constraints = roi.constraints.filter(c => c.id !== constraint.id);
            }

            this.selectedRowId = null;
            this.render();
        });
    }

    moveRoi(offset) {
        const selInfo = this.getSelectedInfo();
        if (!selInfo.roi) return;
        const roi = selInfo.roi;
        const idx = this.state.rois.findIndex(r => r.id === roi.id);
        const newIndex = idx + offset;
        if (newIndex < 0 || newIndex >= this.state.rois.length) return;

        const tmp = this.state.rois[idx];
        this.state.rois[idx] = this.state.rois[newIndex];
        this.state.rois[newIndex] = tmp;
        this.state.rois.forEach((r, i) => r.order = i);

        this.render();
    }

    openColumnSettingsModal() {
        const backdrop = document.createElement('div');
        backdrop.className = 'opt-modal-backdrop';
        backdrop.innerHTML = `
            <div class="opt-modal opt-modal-column-settings" role="dialog" aria-labelledby="optColumnSettingsTitle">
                <div class="opt-modal-header">
                    <span id="optColumnSettingsTitle">约束列表设置</span>
                    <button class="opt-btn opt-icon-btn opt-modal-close" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="opt-modal-body">
                    <div class="opt-column-settings-list" id="optColumnList">
                        ${this.columns.map(col => {
                            const locked = !!col.columnLocked;
                            const checked = locked ? true : !!col.visible;
                            return `
                            <div class="opt-column-setting-row ${locked ? 'is-locked' : ''}" data-key="${col.key}">
                                <input type="checkbox" class="opt-col-toggle" data-role="toggle"
                                    ${checked ? 'checked' : ''}
                                    ${locked ? 'disabled' : ''} />
                                <span class="opt-col-label" data-role="col-label">${col.label || ''}</span>
                                <span class="opt-column-settings-drag" draggable="true" title="拖拽排序" aria-hidden="true"><span></span><span></span></span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                <div class="opt-modal-footer">
                    <button class="opt-btn opt-col-btn-cancel" type="button" data-role="cancel">取消</button>
                    <button class="opt-btn opt-col-btn-ok" type="button" data-role="ok">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const list = backdrop.querySelector('#optColumnList');
        let dragEl = null;

        list.addEventListener('click', (e) => {
            const lab = e.target.closest('[data-role="col-label"]');
            if (!lab) return;
            const row = lab.closest('.opt-column-setting-row');
            if (!row || row.classList.contains('is-locked')) return;
            const cb = row.querySelector('.opt-col-toggle');
            if (cb && !cb.disabled) cb.checked = !cb.checked;
        });

        list.addEventListener('dragstart', (e) => {
            const handle = e.target.closest('.opt-column-settings-drag');
            if (!handle) {
                e.preventDefault();
                return;
            }
            dragEl = handle.closest('.opt-column-setting-row');
            if (!dragEl) return;
            e.dataTransfer.effectAllowed = 'move';
            try {
                e.dataTransfer.setData('text/plain', dragEl.dataset.key || '');
            } catch (_) {
                // ignore
            }
        });
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!dragEl) return;
            const row = e.target.closest('.opt-column-setting-row');
            if (!row || row === dragEl) return;
            const rect = row.getBoundingClientRect();
            const after = (e.clientY - rect.top) > rect.height / 2;
            list.insertBefore(dragEl, after ? row.nextSibling : row);
        });
        list.addEventListener('dragend', () => {
            dragEl = null;
        });

        const okBtn = backdrop.querySelector('[data-role="ok"]');
        const cancelBtn = backdrop.querySelector('[data-role="cancel"]');
        const closeBtn = backdrop.querySelector('[data-role="close"]');
        const close = () => backdrop.remove();
        cancelBtn.addEventListener('click', close);
        closeBtn.addEventListener('click', close);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) close();
        });
        okBtn.addEventListener('click', () => {
            const newColumns = [];
            list.querySelectorAll('.opt-column-setting-row').forEach(row => {
                const key = row.dataset.key;
                const src = this.columns.find(c => c.key === key);
                if (!src) return;
                const cb = row.querySelector('.opt-col-toggle');
                const visible = src.columnLocked ? true : !!(cb && cb.checked);
                newColumns.push({ ...src, visible });
            });
            this.columns = newColumns;
            backdrop.remove();
            this.render();
        });
    }

    // ---- 模板相关：创建 / 加载（MVP，仅前端内存） ----

    createTemplateSnapshot() {
        const roiEntries = this.state.rois
            .slice()
            .sort((a, b) => a.order - b.order)
            .map(roi => ({
                roiId: roi.id,
                roiName: roi.name,
                roiType: roi.type,
                constraints: roi.constraints.map(c => ({
                    func: c.func,
                    volume: c.volume,
                    dose: c.dose,
                    gEUDa: c.gEUDa,
                    letd: c.letd,
                    fallOffDistance: c.fallOffDistance,
                    fallOffHighDose: c.fallOffHighDose,
                    targetRoiId: c.targetRoiId,
                    weight: c.weight,
                    robust: c.robust,
                    scope: Array.isArray(c.scope) ? [...c.scope] : (c.scope ? [c.scope] : ['auto']),
                    weakStrong: c.weakStrong || 'weak',
                    predicted: c.predicted != null ? c.predicted : ''
                }))
            }));
        return { roiEntries };
    }

    makeTemplateNameUnique(baseName) {
        // 保留方法名以兼容后续可能的复用，但根据最新需求：
        // 1）不再自动加后缀生成唯一名称；
        // 2）只做基础裁剪与重复性检查，重复时返回空字符串让调用方自行提示。
        const MAX_LEN = 32;
        let name = (baseName || '').trim();
        if (!name) return '';
        if (name.length > MAX_LEN) {
            name = name.slice(0, MAX_LEN);
        }
        const exists = this.templates.some(t => t.name === name);
        return exists ? '' : name;
    }

    openCreateTemplateModal() {
        const snapshot = this.createTemplateSnapshot();
        if (!snapshot.roiEntries.length) {
            this.showAlert('当前没有可用于创建模板的优化约束。');
            return;
        }

        const backdrop = document.createElement('div');
        backdrop.className = 'opt-modal-backdrop';

        const renderRows = () => {
            return snapshot.roiEntries.map((entry, roiIdx) => {
                return entry.constraints.map((c, idx) => {
                    const expr = this.buildConstraintExpression({
                        func: c.func,
                        volume: c.volume,
                        dose: c.dose,
                        gEUDa: c.gEUDa,
                        letd: c.letd,
                        fallOffDistance: c.fallOffDistance,
                        fallOffHighDose: c.fallOffHighDose
                    });
                    return `
                        <tr data-roi-idx="${roiIdx}" data-c-idx="${idx}">
                            <td>${idx === 0 ? entry.roiName : ''}</td>
                            <td>${c.func || ''}</td>
                            <td>${expr || ''}</td>
                            <td style="text-align:center;">
                                <input type="checkbox" ${c.robust ? 'checked' : ''} disabled>
                            </td>
                            <td>${c.weight !== '' && c.weight != null ? c.weight : ''}</td>
                            <td style="text-align:center;">
                                <button class="opt-btn opt-icon-btn" type="button" data-role="delete-row" aria-label="删除">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                        <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v9h-2v-9zm4 0h2v9h-2v-9zM7 10h2v9H7v-9zm1-1h10l-1 12H9L8 9z"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }).join('');
        };

        backdrop.innerHTML = `
            <div class="opt-modal" style="min-width:720px;">
                <div class="opt-modal-header">
                    <span>创建模板</span>
                    <button class="opt-btn opt-icon-btn opt-modal-close" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="opt-modal-body">
                    <div style="margin-bottom:10px; display:flex; align-items:center; gap:8px;">
                        <label style="font-size:12px; color:#ddd;">
                            模板名称：
                            <input type="text" id="optTemplateNameInput" maxlength="32" style="margin-left:4px; width:220px; background:#111;border:1px solid #333;border-radius:4px;color:#ddd;padding:3px 6px;font-size:12px;">
                        </label>
                    </div>
                    <div style="border:1px solid #333; border-radius:4px; overflow:auto; max-height:360px;">
                        <table class="opt-constraints-table" style="border:none;">
                            <thead>
                                <tr>
                                    <th style="width:140px;">ROI</th>
                                    <th style="width:100px;">函数</th>
                                    <th>约束</th>
                                    <th style="width:80px;">鲁棒性</th>
                                    <th style="width:80px;">权重</th>
                                    <th style="width:80px;">操作</th>
                                </tr>
                            </thead>
                            <tbody id="optTemplateEditBody">
                                ${renderRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="opt-modal-footer">
                    <button class="opt-btn" data-role="cancel">取消</button>
                    <button class="opt-btn" data-role="ok">确定</button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        const tbody = backdrop.querySelector('#optTemplateEditBody');
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-role="delete-row"]');
            if (!btn) return;
            const tr = btn.closest('tr');
            const roiIdx = Number(tr.dataset.roiIdx);
            const cIdx = Number(tr.dataset.cIdx);
            const entry = snapshot.roiEntries[roiIdx];
            if (!entry) return;
            entry.constraints.splice(cIdx, 1);
            if (!entry.constraints.length) {
                snapshot.roiEntries.splice(roiIdx, 1);
            }
            if (!snapshot.roiEntries.length) {
                this.showAlert('模板中已无任何约束行，将取消创建模板。');
                backdrop.remove();
                return;
            }
            tbody.innerHTML = renderRows();
        });

        const okBtn = backdrop.querySelector('[data-role="ok"]');
        const cancelBtn = backdrop.querySelector('[data-role="cancel"]');
        const closeBtn = backdrop.querySelector('[data-role="close"]');
        const nameInput = backdrop.querySelector('#optTemplateNameInput');

        cancelBtn.addEventListener('click', () => backdrop.remove());
        closeBtn.addEventListener('click', () => backdrop.remove());
        okBtn.addEventListener('click', () => {
            const rawName = nameInput.value.trim();
            if (!rawName) {
                this.showAlert('请输入模板名称。');
                return;
            }
            // 名称长度限制：通过 maxlength="32" 控制输入，这里只做兜底裁剪
            const MAX_LEN = 32;
            const name = rawName.length > MAX_LEN ? rawName.slice(0, MAX_LEN) : rawName;
            // 与已有模板重复时，直接提示，不再自动加后缀
            if (this.templates.some(t => t.name === name)) {
                this.showAlert('模板名称已存在，请重新命名');
                return;
            }
            const newTemplate = {
                id: 'tmpl-' + Date.now(),
                name,
                isSFRT: false,
                roiEntries: JSON.parse(JSON.stringify(snapshot.roiEntries))
            };
            this.templates.push(newTemplate);
            backdrop.remove();
        });
    }

    openLoadTemplateModal() {
        if (!this.templates.length) {
            this.showAlert('当前没有可用的模板，请先创建模板。');
            return;
        }

        let selectedTemplate = this.templates[0];

        const buildRows = (tpl) => {
            return tpl.roiEntries.map(entry => {
                return entry.constraints.map((c, idx) => {
                    let expr;
                    if (c.func === 'InwardReduce') {
                        // 加载模板预览中，Inward Reduce 恒定按模板数据展示三段信息：高剂量、低剂量、靶区
                        const hi = c.fallOffHighDose;
                        const lo = c.dose;
                        const targetName = c.targetRoiId || '';
                        const parts = [];
                        if (hi !== '' && hi != null && !Number.isNaN(Number(hi))) {
                            parts.push(`跌落高剂量 ${Number(hi).toFixed(2)}cGy`);
                        }
                        if (lo !== '' && lo != null && !Number.isNaN(Number(lo))) {
                            parts.push(`跌落低剂量 ${Number(lo).toFixed(2)}cGy`);
                        }
                        if (targetName) {
                            parts.push(`靶区 ${targetName}`);
                        }
                        expr = parts.join('，');
                    } else {
                        expr = this.buildConstraintExpression({
                            func: c.func,
                            volume: c.volume,
                            dose: c.dose,
                            gEUDa: c.gEUDa,
                            letd: c.letd,
                            fallOffDistance: c.fallOffDistance,
                            fallOffHighDose: c.fallOffHighDose
                        });
                    }
                    return `
                        <tr>
                            <td>${idx === 0 ? entry.roiName : ''}</td>
                            <td>${c.func || ''}</td>
                            <td>${expr || ''}</td>
                            <td style="text-align:center;">
                                <input type="checkbox" ${c.robust ? 'checked' : ''} disabled>
                            </td>
                            <td>${c.weight !== '' && c.weight != null ? c.weight : ''}</td>
                        </tr>
                    `;
                }).join('');
            }).join('');
        };

        const backdrop = document.createElement('div');
        backdrop.className = 'opt-modal-backdrop';
        backdrop.innerHTML = `
            <div class="opt-modal" style="min-width:760px; height:420px;">
                <div class="opt-modal-header">
                    <span>加载模板</span>
                    <button class="opt-btn opt-icon-btn opt-modal-close" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="opt-modal-body" style="display:flex; flex-direction:column; overflow:hidden;">
                    <div style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div style="display:flex; align-items:center; gap:8px; flex:1;">
                            <span style="font-size:12px; color:#ddd; white-space:nowrap;">选择模板：</span>
                            <div class="clinical-target-dropdown" id="optTemplateDropdown" style="width:260px;">
                                <div class="clinical-target-dropdown-trigger" id="optTemplateDropdownTrigger">
                                    <span class="clinical-target-dropdown-text">
                                        ${selectedTemplate.name}${selectedTemplate.isSFRT ? ' (SFRT)' : ''}
                                    </span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="clinical-target-dropdown-menu" id="optTemplateDropdownMenu" style="display:none;">
                                    <input type="text"
                                           class="clinical-target-dropdown-search"
                                           id="optTemplateSearch"
                                           placeholder="查找选项"
                                           style="width: 100%; padding: 6px 8px; border: none; border-bottom: 1px solid #333; background: #2a2a2a; color: #ddd; font-size: 12px; box-sizing: border-box;">
                                    <div class="clinical-target-dropdown-options" id="optTemplateOptions">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button class="opt-btn" id="optDeleteTemplateBtn">删除模板</button>
                    </div>
                    <div style="flex:1; min-height:0; border:1px solid #333; border-radius:4px; overflow:auto;">
                        <table class="opt-constraints-table" style="border:none;">
                            <thead>
                                <tr>
                                    <th style="width:140px;">ROI</th>
                                    <th style="width:100px;">函数</th>
                                    <th>约束</th>
                                    <th style="width:80px;">鲁棒性</th>
                                    <th style="width:80px;">权重</th>
                                </tr>
                            </thead>
                            <tbody id="optTemplatePreviewBody">
                                ${buildRows(selectedTemplate)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="opt-modal-footer">
                    <span id="optTemplateHint" style="flex:1; align-items:center; display:flex; font-size:11px; color:#9ca3af;"></span>
                    <button class="opt-btn" data-role="cancel">取消</button>
                    <button class="opt-btn" data-role="next">下一步</button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        const deleteBtn = backdrop.querySelector('#optDeleteTemplateBtn');
        const tbody = backdrop.querySelector('#optTemplatePreviewBody');
        const hint = backdrop.querySelector('#optTemplateHint');
        const trigger = backdrop.querySelector('#optTemplateDropdownTrigger');
        const menu = backdrop.querySelector('#optTemplateDropdownMenu');
        const searchInput = backdrop.querySelector('#optTemplateSearch');
        const optionsContainer = backdrop.querySelector('#optTemplateOptions');

        const organLimitTemplates = () => this.templates.filter(t => t.templateType === 'organ-limit');
        const optimizationTemplates = () => this.templates.filter(t => t.templateType === 'optimization');

        const refreshPreviewAndDeleteState = () => {
            tbody.innerHTML = buildRows(selectedTemplate);
            trigger.querySelector('.clinical-target-dropdown-text').textContent =
                `${selectedTemplate.name}${selectedTemplate.isSFRT ? ' (SFRT)' : ''}`;
            if (selectedTemplate.isSFRT || selectedTemplate.templateType === 'organ-limit') {
                deleteBtn.disabled = true;
            } else {
                deleteBtn.disabled = false;
            }
            // 目前在第一步弹窗底部不再显示提示文案
            hint.textContent = '';
        };

        const renderDropdownOptions = (keyword = '') => {
            const kw = keyword.trim().toLowerCase();
            const matchFilter = (t) =>
                !kw ||
                t.name.toLowerCase().includes(kw);

            const organList = organLimitTemplates().filter(matchFilter);
            const optList = optimizationTemplates().filter(matchFilter);

            let html = '';
            if (organList.length) {
                html += `<div style="padding:6px 12px;font-size:11px;color:#9ca3af;">器官限量模板</div>`;
                html += organList.map(t => `
                    <div class="clinical-target-dropdown-option" data-template-id="${t.id}">
                        ${t.name}${t.isSFRT ? ' (SFRT)' : ''}
                    </div>
                `).join('');
            }
            if (optList.length) {
                html += `<div style="padding:6px 12px;font-size:11px;color:#9ca3af;">优化约束模板</div>`;
                html += optList.map(t => `
                    <div class="clinical-target-dropdown-option" data-template-id="${t.id}">
                        ${t.name}
                    </div>
                `).join('');
            }
            if (!html) {
                html = `<div style="padding:8px 12px;font-size:12px;color:#6b7280;">无匹配模板</div>`;
            }
            optionsContainer.innerHTML = html;
        };

        renderDropdownOptions();
        refreshPreviewAndDeleteState();

        trigger.addEventListener('click', () => {
            const visible = menu.style.display !== 'none';
            menu.style.display = visible ? 'none' : 'flex';
            if (!visible) {
                searchInput.value = '';
                renderDropdownOptions('');
                searchInput.focus();
            }
        });

        searchInput.addEventListener('input', () => {
            renderDropdownOptions(searchInput.value || '');
        });

        optionsContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.clinical-target-dropdown-option[data-template-id]');
            if (!item) return;
            const id = item.getAttribute('data-template-id');
            const tpl = this.templates.find(t => t.id === id);
            if (!tpl) return;
            selectedTemplate = tpl;
            menu.style.display = 'none';
            refreshPreviewAndDeleteState();
        });

        document.addEventListener('click', (e) => {
            if (!backdrop.contains(e.target)) return;
            const inDropdown = e.target.closest('#optTemplateDropdown');
            if (!inDropdown) {
                menu.style.display = 'none';
            }
        });

        deleteBtn.addEventListener('click', () => {
            if (!selectedTemplate) return;
            if (selectedTemplate.isSFRT || selectedTemplate.templateType === 'organ-limit') {
                // 器官限量模板在此处不支持删除
                return;
            }
            this.showConfirm(`是否删除模板：${selectedTemplate.name}？`, () => {
                this.templates = this.templates.filter(t => t.id !== selectedTemplate.id);
                if (!this.templates.length) {
                    backdrop.remove();
                    return;
                }
                selectedTemplate = this.templates[0];
                renderDropdownOptions(searchInput.value || '');
                refreshPreviewAndDeleteState();
            });
        });

        const cancelBtn = backdrop.querySelector('[data-role="cancel"]');
        const nextBtn = backdrop.querySelector('[data-role="next"]');
        const closeBtn = backdrop.querySelector('[data-role="close"]');

        cancelBtn.addEventListener('click', () => backdrop.remove());
        closeBtn.addEventListener('click', () => backdrop.remove());
        nextBtn.addEventListener('click', () => {
            backdrop.remove();
            this.openTemplateMappingModal(selectedTemplate);
        });
    }

    openTemplateMappingModal(template) {
        const isSFRT = !!template.isSFRT;

        const planRois = this.state.rois.slice().sort((a, b) => a.order - b.order);
        const templateRoiEntries = (template.roiEntries || []).slice();
        const templateRoiNameSet = new Set(templateRoiEntries.map(e => e.roiName));

        const autoMatchPlanRoiForTemplate = (tplEntry) => {
            return planRois.find(r => r.name === tplEntry.roiName && r.type === tplEntry.roiType)
                || planRois.find(r => r.name === tplEntry.roiName)
                || null;
        };

        const backdrop = document.createElement('div');
        backdrop.className = 'opt-modal-backdrop';

        const buildRows = () => {
            if (isSFRT) {
                // SFRT：左列固定为“计划结构（当前计划ROI）”，右列为“模板结构”下拉（只读），未匹配显示 none
                const relevantPlanRois = planRois.filter(r => {
                    if (templateRoiNameSet.has(r.name)) return true;
                    // 演示用：包含 SFRT 关键字的 ROI 也视为相关
                    return String(r.name || '').toUpperCase().includes('SFRT');
                });

                // SFRT 相关模板结构项（例如 POI_SFRT_x）不在下拉中显示，由系统内部自动处理
                const visibleTemplateEntries = templateRoiEntries.filter(e => {
                    const upper = String(e.roiName || '').toUpperCase();
                    return !upper.includes('SFRT');
                });

                return relevantPlanRois.map(plan => {
                    const matchedTpl = visibleTemplateEntries.find(e => e.roiName === plan.name && e.roiType === plan.type)
                        || visibleTemplateEntries.find(e => e.roiName === plan.name)
                        || null;
                    const selectedTplName = matchedTpl ? matchedTpl.roiName : '';

                    return `
                        <tr data-plan-roi-id="${plan.id}">
                            <td>${plan.name}</td>
                            <td>
                                <select data-role="template-roi-select" style="width:100%; background:#111;border:1px solid #333;border-radius:4px;color:#ddd;padding:3px 6px;font-size:12px;">
                                    <option value="">none</option>
                                    ${visibleTemplateEntries.map(e => `
                                        <option value="${e.roiName}" ${e.roiName === selectedTplName ? 'selected' : ''}>
                                            ${e.roiName}
                                        </option>
                                    `).join('')}
                                </select>
                            </td>
                        </tr>
                    `;
                }).join('');
            }

            // 非 SFRT：左列模板结构，右列计划结构（可选）
            return templateRoiEntries.map(entry => {
                const autoPlan = autoMatchPlanRoiForTemplate(entry);
                const autoPlanId = autoPlan ? autoPlan.id : '';

                return `
                    <tr data-template-roi="${entry.roiName}">
                        <td>${entry.roiName}</td>
                        <td>
                            <select data-role="plan-roi-select" style="width:100%; background:#111;border:1px solid #333;border-radius:4px;color:#ddd;padding:3px 6px;font-size:12px;">
                                <option value="">none</option>
                                ${planRois.map(r => `
                                    <option value="${r.id}" ${r.id === autoPlanId ? 'selected' : ''}>
                                        ${r.name}
                                    </option>
                                `).join('')}
                            </select>
                        </td>
                    </tr>
                `;
            }).join('');
        };

        backdrop.innerHTML = `
            <div class="opt-modal" style="min-width:560px; height:420px;">
                <div class="opt-modal-header">
                    <span>加载模板</span>
                    <button class="opt-btn opt-icon-btn opt-modal-close" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="opt-modal-body" style="display:flex; flex-direction:column; overflow:hidden;">
                    ${isSFRT ? `
                        <div style="flex-shrink:0; margin-bottom:8px; font-size:11px; color:#fbbf24;">
                            当前模板包含晶格靶区，将应用到所有小球和总勾画，此处不显示模板结构中的晶格靶区。
                        </div>
                    ` : ''}
                    <div style="flex:1; min-height:0; border:1px solid #333; border-radius:4px; overflow:auto;">
                        <table class="opt-constraints-table" style="border:none;">
                            <thead>
                                <tr>
                                    <th style="width:180px;">${isSFRT ? '计划结构' : '模板结构'}</th>
                                    <th style="width:180px;">${isSFRT ? '模板结构' : '计划结构'}</th>
                                </tr>
                            </thead>
                            <tbody id="optTemplateMapBody">
                                ${buildRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="opt-modal-footer">
                    <button class="opt-btn" data-role="cancel">取消</button>
                    <button class="opt-btn" data-role="ok">确定</button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        const cancelBtn = backdrop.querySelector('[data-role="cancel"]');
        const okBtn = backdrop.querySelector('[data-role="ok"]');
        const tbody = backdrop.querySelector('#optTemplateMapBody');
        const closeBtn = backdrop.querySelector('[data-role="close"]');

        cancelBtn.addEventListener('click', () => backdrop.remove());
        closeBtn.addEventListener('click', () => backdrop.remove());
        okBtn.addEventListener('click', () => {
            const mapping = {};

            if (isSFRT) {
                // SFRT：读取“计划结构”每行所选模板结构（只读下拉），仅当选择了具体模板 ROI 时建立映射
                tbody.querySelectorAll('tr[data-plan-roi-id]').forEach(tr => {
                    const planId = tr.getAttribute('data-plan-roi-id');
                    const plan = planRois.find(r => r.id === planId);
                    if (!plan) return;
                    const sel = tr.querySelector('select[data-role="template-roi-select"]');
                    const tplName = sel ? sel.value : '';
                    if (!tplName) return; // none
                    mapping[tplName] = plan;
                });
            } else {
                templateRoiEntries.forEach(entry => {
                    const row = tbody.querySelector(`tr[data-template-roi="${entry.roiName}"]`);
                    if (!row) return;
                    const select = row.querySelector('select[data-role="plan-roi-select"]');
                    if (!select) return;
                    const planId = select.value;
                    if (!planId) return;
                    const plan = planRois.find(r => r.id === planId);
                    if (plan) {
                        mapping[entry.roiName] = plan;
                    }
                });
            }

            this.applyTemplateToState(template, mapping);
            backdrop.remove();
            this.render();
        });
    }

    applyTemplateToState(template, mapping) {
        if (!mapping) return;

        template.roiEntries.forEach(entry => {
            const planRoi = mapping[entry.roiName];
            if (!planRoi) return;

            const roiGroup = this.state.rois.find(r => r.id === planRoi.id);
            if (!roiGroup) return;

            entry.constraints.forEach(tplC => {
                if (!tplC.func) return;

                let target = roiGroup.constraints.find(c => c.func === tplC.func);
                if (!target) {
                    target = this.createEmptyConstraint(roiGroup);
                    roiGroup.constraints.push(target);
                }

                target.func = tplC.func;
                target.volume = tplC.volume;
                target.dose = tplC.dose;
                target.gEUDa = tplC.gEUDa;
                target.letd = tplC.letd;
                target.fallOffDistance = tplC.fallOffDistance;
                target.fallOffHighDose = tplC.fallOffHighDose;
                // Inward Reduce 等函数的靶区：仅拷贝模板中的 targetRoiId，用于显示，不再做额外匹配逻辑
                target.targetRoiId = tplC.targetRoiId || '';
                target.weight = tplC.weight;
                target.robust = tplC.robust;
                target.scope = Array.isArray(tplC.scope) ? [...tplC.scope] : (tplC.scope ? [tplC.scope] : ['auto']);
                target.weakStrong = tplC.weakStrong || 'weak';
                target.predicted = tplC.predicted != null ? tplC.predicted : '';
            });
        });
    }

    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }
}

