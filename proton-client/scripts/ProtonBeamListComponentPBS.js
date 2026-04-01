class ProtonBeamListComponentPBS {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        this.options = {
            prefix: options.prefix || '',
            onSelect: options.onSelect || (() => {}),
            onChange: options.onChange || (() => {}),
            onAdd: options.onAdd || (() => {}),
            onEdit: options.onEdit || (() => {}),
            onDelete: options.onDelete || (() => {}),
            onCopy: options.onCopy || (() => {}),
            onSort: options.onSort || (() => {}),
            ...options
        };

        this.beams = Array.isArray(options.beams) ? options.beams : this.getDemoBeams();
        this.selectedBeamId = this.beams[0]?.id ?? null;
        this.machineOptions = options.machineOptions || ['ProBeam_TR3', 'ProBeam_TR2', 'ProBeam_TR1'];
        this.modeOptions = options.modeOptions || ['PBS', 'DS', 'SFO', 'MFO'];
        this.targetOptions = options.targetOptions || ['CTV1', 'CTV2', 'PTV', 'GTV'];
        this.isoOptions = options.isoOptions || ['ISO1', 'ISO2', 'ISO3'];
        this.rangeShifterOptions = options.rangeShifterOptions || ['NONE', 'RS1', 'RS2', 'RS3'];
        this.defaultMachine = options.defaultMachine || 'ProBeam_TR3';
        this.defaultGroupName = options.defaultGroupName || 'Group 1';

        if (!this.container) {
            console.error('ProtonBeamListComponentPBS: 容器不存在', containerId);
            return;
        }

        this.ensureStyles();
        this.render();
        this.bindEvents();
        this.renderRows();
        this.updateToolbarState();
    }

    getDemoBeams() {
        return [
            {
                id: 'beam-1',
                visible: true,
                name: 'Beam 1',
                machine: 'ProBeam_TR3',
                mode: 'PBS',
                planId: '35402.205803',
                mu: '35402.205803',
                gantry: '80.0',
                couch: '0.0',
                target: 'CTV1',
                iso: 'ISO1',
                x: '1.42',
                y: '-47.90',
                z: '29.02',
                snout: '42.10',
                airMin: '',
                airCax: '',
                rangeShifter: 'NONE'
            },
            {
                id: 'beam-2',
                visible: true,
                name: 'Beam 2',
                machine: 'ProBeam_TR3',
                mode: 'PBS',
                planId: '41302.528675',
                mu: '41302.528675',
                gantry: '270.0',
                couch: '0.0',
                target: 'CTV1',
                iso: 'ISO1',
                x: '1.42',
                y: '-47.90',
                z: '29.02',
                snout: '42.10',
                airMin: '',
                airCax: '',
                rangeShifter: 'NONE'
            }
        ];
    }

    ensureStyles() {
        const styleId = `${this.options.prefix}protonBeamListStyles`;
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .proton-beam-list {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background: #0b0b0b;
                color: #ddd;
                font-size: 12px;
                border: 1px solid #2a2a2a;
                border-radius: 4px;
                overflow: hidden;
            }

            .proton-beam-list-table-wrap {
                flex: 1;
                overflow: auto;
                background: #070707;
            }

            .proton-beam-list-table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                min-width: 1200px;
                font-size: 12px;
            }

            .proton-beam-list-table thead th {
                position: sticky;
                top: 0;
                z-index: 2;
                background: #1a1a1a;
                color: #cfcfcf;
                font-weight: 500;
                border-bottom: 1px solid #333;
                padding: 8px 10px;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .proton-beam-list-table tbody td {
                padding: 8px 10px;
                border-bottom: 1px solid #1f1f1f;
                color: #d9d9d9;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .proton-beam-list-table tbody tr {
                background: #060606;
                cursor: default;
            }

            .proton-beam-list-table tbody tr:hover {
                background: #0f0f0f;
            }

            .proton-beam-list-table tbody tr.is-selected {
                background: rgba(33, 161, 241, 0.18);
                outline: 1px solid rgba(33, 161, 241, 0.35);
                outline-offset: -1px;
            }

            .proton-beam-list-table .col-index {
                width: 60px;
                min-width: 60px;
                text-align: center;
                color: #bdbdbd;
            }

            .proton-beam-list-table .col-eye {
                width: 50px;
                min-width: 50px;
                text-align: center;
            }

            .proton-beam-eye-btn {
                color: #888;
                cursor: pointer;
                user-select: none;
            }

            .proton-beam-eye-btn.is-off {
                color: #4b5563;
            }

            .proton-beam-eye-btn:hover {
                color: #ddd;
            }

            .proton-beam-cell-control {
                width: 100%;
                height: 22px;
                padding: 0 8px;
                background: #0e0e0e;
                border: 1px solid #2a2a2a;
                border-radius: 3px;
                color: #ddd;
                font-size: 12px;
                font-family: inherit;
                outline: none;
            }

            .proton-beam-cell-control:focus {
                border-color: rgba(33, 161, 241, 0.6);
                box-shadow: 0 0 0 2px rgba(33, 161, 241, 0.12);
            }

            .proton-beam-cell-control[readonly] {
                background: transparent;
                border-color: transparent;
                color: #bdbdbd;
                padding: 0;
                height: auto;
            }

            select.proton-beam-cell-control {
                appearance: none;
                background-image:
                    linear-gradient(45deg, transparent 50%, #777 50%),
                    linear-gradient(135deg, #777 50%, transparent 50%);
                background-position:
                    calc(100% - 14px) 8px,
                    calc(100% - 9px) 8px;
                background-size: 5px 5px, 5px 5px;
                background-repeat: no-repeat;
                padding-right: 22px;
            }

            .proton-beam-cell-text {
                width: 100%;
                color: #d9d9d9;
                line-height: 22px;
                height: 22px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .proton-beam-cell-text.is-right {
                text-align: right;
                padding-right: 2px;
            }

            .proton-beam-list-toolbar {
                height: 36px;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 0 10px;
                border-top: 1px solid #2a2a2a;
                background: #1a1a1a;
            }

            .proton-beam-toolbar-btn {
                height: 22px;
                min-width: 58px;
                padding: 0 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                border-radius: 3px;
                border: 1px solid #3a3a3a;
                background: #101010;
                color: #ddd;
                font-size: 12px;
                cursor: pointer;
                user-select: none;
            }

            .proton-beam-toolbar-btn:hover {
                background: #151515;
                border-color: #4a4a4a;
            }

            .proton-beam-toolbar-btn:disabled {
                opacity: 0.45;
                cursor: not-allowed;
            }

            .proton-beam-toolbar-btn i {
                font-size: 12px;
                opacity: 0.95;
            }

            /* 添加射束弹窗 */
            .proton-beam-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.55);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .proton-beam-modal {
                width: 720px;
                max-width: calc(100vw - 120px);
                max-height: 80vh;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 10px;
                box-shadow: 0 8px 26px rgba(0, 0, 0, 0.55);
                color: #ddd;
                font-family: inherit;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .proton-beam-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 18px 10px;
                flex-shrink: 0;
            }

            .proton-beam-modal-title {
                font-size: 16px;
                font-weight: 600;
                color: #eee;
            }

            .proton-beam-modal-close {
                border: none;
                background: transparent;
                color: #9ca3af;
                cursor: pointer;
                width: 28px;
                height: 28px;
                border-radius: 6px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .proton-beam-modal-close:hover {
                background: rgba(255, 255, 255, 0.06);
                color: #e5e7eb;
            }

            .proton-beam-modal-body {
                padding: 0 18px 16px;
                flex: 1;
                min-height: 0;
                overflow: auto;
            }

            .proton-beam-modal-section {
                margin-top: 10px;
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.06);
                position: relative;
            }

            .proton-beam-modal-section-title {
                position: absolute;
                top: 0;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #2a2a2a;
                padding: 0 12px;
                text-align: center;
                color: #bdbdbd;
                font-size: 12px;
                letter-spacing: 0.5px;
                line-height: 18px;
            }

            .proton-beam-modal-grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px 18px;
            }

            .proton-beam-modal-grid-1 {
                display: grid;
                grid-template-columns: 1fr;
                gap: 12px;
            }

            .proton-beam-modal-field {
                display: grid;
                grid-template-columns: 90px 1fr;
                align-items: center;
                gap: 10px;
            }

            .proton-beam-modal-label {
                color: #bdbdbd;
                font-size: 12px;
            }

            .proton-beam-modal-input,
            .proton-beam-modal-select,
            .proton-beam-modal-static {
                height: 30px;
                border-radius: 6px;
                border: 1px solid #1f1f1f;
                background: #1a1a1a;
                color: #e5e7eb;
                padding: 0 10px;
                font-size: 12px;
                outline: none;
            }

            .proton-beam-modal-input:focus,
            .proton-beam-modal-select:focus {
                border-color: rgba(33, 161, 241, 0.7);
                box-shadow: 0 0 0 2px rgba(33, 161, 241, 0.14);
            }

            .proton-beam-modal-static {
                display: flex;
                align-items: center;
                color: #cfcfcf;
                background: #232323;
            }

            .proton-beam-modal-select {
                appearance: none;
                background-image:
                    linear-gradient(45deg, transparent 50%, #777 50%),
                    linear-gradient(135deg, #777 50%, transparent 50%);
                background-position:
                    calc(100% - 14px) 12px,
                    calc(100% - 9px) 12px;
                background-size: 5px 5px, 5px 5px;
                background-repeat: no-repeat;
                padding-right: 22px;
            }

            .proton-beam-modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 14px 18px 18px;
                background: rgba(0, 0, 0, 0.12);
                border-top: 1px solid rgba(255, 255, 255, 0.06);
                flex-shrink: 0;
            }

            .proton-beam-modal-btn {
                min-width: 86px;
                height: 30px;
                border-radius: 6px;
                border: 1px solid #4a4a4a;
                background: #2f2f2f;
                color: #e5e7eb;
                font-size: 12px;
                cursor: pointer;
            }

            .proton-beam-modal-btn:hover {
                background: #383838;
            }

            .proton-beam-modal-btn.primary {
                border-color: #1d84b8;
                background: #1f97cf;
                color: #fff;
            }

            .proton-beam-modal-btn.primary:hover {
                background: #188ec8;
            }
        `;
        document.head.appendChild(style);
    }

    render() {
        this.container.innerHTML = `
            <div class="proton-beam-list">
                <div class="proton-beam-list-table-wrap">
                    <table class="proton-beam-list-table" id="${this.options.prefix}protonBeamTable">
                        <thead>
                            <tr>
                                <th class="col-index">序号</th>
                                <th class="col-eye" style="text-align: center;">
                                    <i class="fas fa-eye proton-beam-eye-btn" data-action="toggle-all-visibility" title="可见性"></i>
                                </th>
                                <th style="width: 110px;">名称</th>
                                <th style="width: 140px;">治疗机</th>
                                <th style="width: 80px;">技术</th>
                                <th style="width: 110px;">MU</th>
                                <th style="width: 70px;">机架[°]</th>
                                <th style="width: 70px;">治疗床</th>
                                <th style="width: 90px;">靶区</th>
                                <th style="width: 90px;">等中心</th>
                                <th style="width: 80px;">X[cm]</th>
                                <th style="width: 80px;">Y[cm]</th>
                                <th style="width: 80px;">Z[cm]</th>
                                <th style="width: 90px;">SNOUT[cm]</th>
                                <th style="width: 90px;">Air MIN[cm]</th>
                                <th style="width: 90px;">Air CAX[cm]</th>
                                <th style="width: 90px;">碰床</th>
                                <th style="width: 120px;">Rangeshifter</th>
                            </tr>
                        </thead>
                        <tbody id="${this.options.prefix}protonBeamTableBody"></tbody>
                    </table>
                </div>
                <div class="proton-beam-list-toolbar">
                    <button class="proton-beam-toolbar-btn" data-action="add" title="添加">
                        添加
                    </button>
                    <button class="proton-beam-toolbar-btn" data-action="edit" title="编辑" disabled>
                        编辑
                    </button>
                    <button class="proton-beam-toolbar-btn" data-action="delete" title="删除" disabled>
                        删除
                    </button>
                    <button class="proton-beam-toolbar-btn" data-action="copy" title="复制" disabled>
                        复制
                    </button>
                    <button class="proton-beam-toolbar-btn" data-action="sort" title="排序">
                        排序
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const tableBody = this.container.querySelector(`#${this.options.prefix}protonBeamTableBody`);
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                if (e.target.closest('input, select, textarea, button')) return;

                const eye = e.target.closest('[data-action="toggle-visibility"]');
                if (eye) {
                    const row = e.target.closest('tr[data-beam-id]');
                    if (!row) return;
                    const beamId = row.getAttribute('data-beam-id');
                    this.toggleBeamVisibility(beamId);
                    return;
                }

                const row = e.target.closest('tr[data-beam-id]');
                if (!row) return;
                const beamId = row.getAttribute('data-beam-id');
                this.selectBeam(beamId);
            });

            tableBody.addEventListener('change', (e) => {
                const control = e.target.closest('[data-field]');
                if (!control) return;
                const row = control.closest('tr[data-beam-id]');
                if (!row) return;
                const beamId = row.getAttribute('data-beam-id');
                const field = control.getAttribute('data-field');
                this.updateBeamField(beamId, field, control.value);
            });

            tableBody.addEventListener('input', (e) => {
                const control = e.target.closest('input[data-field]');
                if (!control) return;
                const row = control.closest('tr[data-beam-id]');
                if (!row) return;
                const beamId = row.getAttribute('data-beam-id');
                const field = control.getAttribute('data-field');
                this.updateBeamField(beamId, field, control.value, { silent: true });
            });
        }

        const table = this.container.querySelector(`#${this.options.prefix}protonBeamTable`);
        if (table) {
            table.addEventListener('click', (e) => {
                const toggleAll = e.target.closest('[data-action="toggle-all-visibility"]');
                if (toggleAll) {
                    this.toggleAllVisibility();
                }
            });
        }

        const toolbar = this.container.querySelector('.proton-beam-list-toolbar');
        if (toolbar) {
            toolbar.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-action]');
                if (!btn || btn.disabled) return;
                const action = btn.getAttribute('data-action');
                this.handleToolbarAction(action);
            });
        }
    }

    updateBeamField(beamId, field, value, extra = {}) {
        const beam = this.beams.find(b => b.id === beamId);
        if (!beam) return;
        beam[field] = value;
        if (!extra.silent) {
            this.options.onChange({ beamId, field, value, beam: { ...beam } });
        }
    }

    toggleBeamVisibility(beamId) {
        const beam = this.beams.find(b => b.id === beamId);
        if (!beam) return;
        beam.visible = !beam.visible;
        this.renderRows();
        this.options.onChange({ beamId, field: 'visible', value: beam.visible, beam: { ...beam } });
    }

    toggleAllVisibility() {
        if (!this.beams.length) return;
        const allVisible = this.beams.every(b => b.visible !== false);
        this.beams.forEach(b => {
            b.visible = !allVisible;
        });
        this.renderRows();
        this.options.onChange({ beamId: null, field: 'visibleAll', value: !allVisible, beams: this.beams.map(b => ({ ...b })) });
    }

    handleToolbarAction(action) {
        const selected = this.getSelectedBeam();
        switch (action) {
            case 'add':
                this.openAddBeamModal();
                break;
            case 'edit':
                if (selected) this.openEditBeamModal(selected);
                break;
            case 'delete':
                if (selected) this.deleteSelectedBeam();
                break;
            case 'copy':
                if (selected) this.copySelectedBeam();
                break;
            case 'sort':
                this.openSortBeamsModal();
                break;
            default:
                break;
        }
    }

    openSortBeamsModal() {
        const overlayId = `${this.options.prefix}protonBeamSortModalOverlay`;
        const existed = document.getElementById(overlayId);
        if (existed) existed.remove();

        const overlay = document.createElement('div');
        overlay.className = 'proton-beam-modal-overlay';
        overlay.id = overlayId;

        // draft: array of beam ids
        const draft = this.beams.map(b => b.id);

        const renderTableRows = (ids) => {
            const rows = ids.map((id) => this.beams.find(b => b.id === id)).filter(Boolean);
            return rows.map(b => `
                <tr>
                    <td style="width: 140px; padding: 8px 10px; border-bottom: 1px solid #333; color:#ddd;">${this.escapeHtml(b.name || '')}</td>
                    <td style="width: 120px; padding: 8px 10px; border-bottom: 1px solid #333; color:#ddd; text-align:left;">${this.escapeHtml(b.gantry ?? '')}</td>
                </tr>
            `).join('');
        };

        overlay.innerHTML = `
            <div class="proton-beam-modal" role="dialog" aria-modal="true" aria-label="射束排序" style="width: 760px; max-width: calc(100vw - 120px);">
                <div class="proton-beam-modal-header">
                    <div class="proton-beam-modal-title">射束排序</div>
                    <button class="proton-beam-modal-close" data-action="close" title="关闭">×</button>
                </div>
                <div class="proton-beam-modal-body" style="padding-top: 10px;">
                    <div style="display:flex; gap: 16px; min-height: 320px;">
                        <div style="flex: 1; border: 1px solid #333; border-radius: 6px; overflow: hidden; background:#1a1a1a;">
                            <table style="width:100%; border-collapse: collapse; table-layout: fixed; font-size: 12px;">
                                <thead>
                                    <tr>
                                        <th style="width: 140px; padding: 8px 10px; text-align:left; background:#242424; border-bottom:1px solid #333; color:#cfcfcf; font-weight:500;">名称</th>
                                        <th style="width: 120px; padding: 8px 10px; text-align:left; background:#242424; border-bottom:1px solid #333; color:#cfcfcf; font-weight:500;">机架[°]</th>
                                    </tr>
                                </thead>
                                <tbody data-role="sort-table-body">
                                    ${renderTableRows(draft)}
                                </tbody>
                            </table>
                        </div>
                        <div style="width: 220px; border-left: 1px solid rgba(255,255,255,0.06); padding-left: 14px;">
                            <div style="color:#22c55e; font-size: 12px; font-weight:600; margin-top: 6px;">排序依据</div>
                            <div style="color:#bdbdbd; font-size: 12px; margin: 8px 0 10px;">按照机架角度</div>
                            <button class="proton-beam-modal-btn" data-action="sort-cw" style="width: 160px; justify-content:center;">顺时针排序</button>
                            <button class="proton-beam-modal-btn" data-action="sort-ccw" style="width: 160px; justify-content:center; margin-top: 10px;">逆时针排序</button>
                        </div>
                    </div>
                </div>
                <div class="proton-beam-modal-footer">
                    <button class="proton-beam-modal-btn" data-action="cancel">取消</button>
                    <button class="proton-beam-modal-btn primary" data-action="confirm">确定</button>
                </div>
            </div>
        `;

        const close = () => overlay.remove();

        const parseAngle = (v) => {
            const n = Number.parseFloat(String(v ?? '').trim());
            return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
        };

        const applyDraftOrder = (ids) => {
            const tbody = overlay.querySelector('[data-role="sort-table-body"]');
            if (!tbody) return;
            tbody.innerHTML = renderTableRows(ids);
        };

        const sortDraft = (dir) => {
            const beamsById = new Map(this.beams.map(b => [b.id, b]));
            draft.sort((a, b) => {
                const aa = parseAngle(beamsById.get(a)?.gantry);
                const bb = parseAngle(beamsById.get(b)?.gantry);
                return dir === 'cw' ? (aa - bb) : (bb - aa);
            });
            applyDraftOrder(draft);
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        overlay.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');

            if (action === 'close' || action === 'cancel') {
                close();
                return;
            }

            if (action === 'sort-cw') {
                sortDraft('cw');
                return;
            }

            if (action === 'sort-ccw') {
                sortDraft('ccw');
                return;
            }

            if (action === 'confirm') {
                const beamsById = new Map(this.beams.map(b => [b.id, b]));
                const nextBeams = draft.map(id => beamsById.get(id)).filter(Boolean);
                if (nextBeams.length === this.beams.length) {
                    this.beams = nextBeams;
                }
                // 选中项保持（id 不变）
                this.renderRows();
                this.updateToolbarState();
                this.options.onSort(this.beams.map(b => ({ ...b })));
                close();
            }
        });

        document.body.appendChild(overlay);
    }

    copySelectedBeam() {
        const selected = this.getSelectedBeam();
        if (!selected) return;

        const id = `beam-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const copied = { ...selected, id };
        copied.name = this.getCopiedBeamName(selected.name || '');

        this.beams.push(copied);
        this.selectedBeamId = copied.id;
        this.renderRows();
        this.updateToolbarState();
        this.options.onCopy({ ...copied });
        this.options.onSelect({ ...copied });
    }

    getCopiedBeamName(originalName) {
        const raw = String(originalName || '').trim() || 'Beam';
        // 复制命名规则：以“原名（n）”递增，优先（1）
        // 同时把“原名（n）”作为同一根名称，避免出现 A（1）（1）这种累积
        const root = raw.replace(/（\d+）$/u, '');
        const existing = new Set(this.beams.map(b => String(b.name || '').trim()));

        let n = 1;
        while (n < 10000) {
            const candidate = `${root}（${n}）`;
            if (!existing.has(candidate)) return candidate;
            n += 1;
        }
        return `${root}（${Date.now()}）`;
    }

    deleteSelectedBeam() {
        const selected = this.getSelectedBeam();
        if (!selected) return;

        // 轻量确认：避免误删
        const ok = window.confirm(`确定要删除射束 "${selected.name || ''}" 吗？`);
        if (!ok) return;

        const idx = this.beams.findIndex(b => b.id === selected.id);
        if (idx < 0) return;

        this.beams.splice(idx, 1);

        const next = this.beams[idx]?.id ?? this.beams[idx - 1]?.id ?? null;
        this.selectedBeamId = next;

        this.renderRows();
        this.updateToolbarState();
        this.options.onDelete({ ...selected });
        const newSelected = this.getSelectedBeam();
        if (newSelected) this.options.onSelect(newSelected);
    }

    getNextBeamNumber() {
        const nums = this.beams
            .map(b => String(b.name || '').match(/Beam\s+(\d+)/i))
            .filter(Boolean)
            .map(m => Number(m[1]))
            .filter(n => Number.isFinite(n));
        const max = nums.length ? Math.max(...nums) : this.beams.length;
        return max + 1;
    }

    getDefaultNewBeamForm() {
        const next = this.getNextBeamNumber();
        return {
            name: `Beam ${next}`,
            machine: this.defaultMachine,
            group: this.defaultGroupName,
            gantry: '270.0',
            couch: '0.0',
            snout: '42.10',
            rangeShifter: 'NONE'
        };
    }

    openAddBeamModal() {
        const overlayId = `${this.options.prefix}protonBeamAddModalOverlay`;
        const existed = document.getElementById(overlayId);
        if (existed) existed.remove();

        const form = this.getDefaultNewBeamForm();

        const overlay = document.createElement('div');
        overlay.className = 'proton-beam-modal-overlay';
        overlay.id = overlayId;

        overlay.innerHTML = `
            <div class="proton-beam-modal" role="dialog" aria-modal="true" aria-label="添加射束">
                <div class="proton-beam-modal-header">
                    <div class="proton-beam-modal-title">添加射束</div>
                    <button class="proton-beam-modal-close" data-action="close" title="关闭">×</button>
                </div>
                <div class="proton-beam-modal-body">
                    <div class="proton-beam-modal-section">
                        <div class="proton-beam-modal-section-title">基本信息</div>
                        <div class="proton-beam-modal-grid-2">
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">名称</div>
                                <input class="proton-beam-modal-input" data-field="name" value="${this.escapeAttr(form.name)}" />
                            </div>
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">治疗机</div>
                                <div class="proton-beam-modal-static" data-field="machine">${this.escapeHtml(form.machine)}</div>
                            </div>
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">射束组</div>
                                <div class="proton-beam-modal-static" data-field="group">${this.escapeHtml(form.group)}</div>
                            </div>
                            <div></div>
                        </div>
                    </div>

                    <div class="proton-beam-modal-section">
                        <div class="proton-beam-modal-section-title">几何</div>
                        <div class="proton-beam-modal-grid-2">
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">机架角[°]</div>
                                <input class="proton-beam-modal-input" data-field="gantry" value="${this.escapeAttr(form.gantry)}" />
                            </div>
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">治疗床[°]</div>
                                <input class="proton-beam-modal-input" data-field="couch" value="${this.escapeAttr(form.couch)}" />
                            </div>
                        </div>
                    </div>

                    <div class="proton-beam-modal-section">
                        <div class="proton-beam-modal-section-title">SNOUT</div>
                        <div class="proton-beam-modal-grid-1">
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">SNOUT[cm]</div>
                                <input class="proton-beam-modal-input" data-field="snout" value="${this.escapeAttr(form.snout)}" />
                            </div>
                        </div>
                    </div>

                    <div class="proton-beam-modal-section">
                        <div class="proton-beam-modal-section-title">Rangeshifter</div>
                        <div class="proton-beam-modal-grid-1">
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">Rangeshifter</div>
                                <select class="proton-beam-modal-select" data-field="rangeShifter">
                                    ${this.rangeShifterOptions.map(opt => `<option value="${this.escapeAttr(opt)}" ${opt === form.rangeShifter ? 'selected' : ''}>${this.escapeHtml(opt)}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="proton-beam-modal-footer">
                    <button class="proton-beam-modal-btn" data-action="cancel">取消</button>
                    <button class="proton-beam-modal-btn primary" data-action="continue">继续添加</button>
                    <button class="proton-beam-modal-btn primary" data-action="confirm">确定</button>
                </div>
            </div>
        `;

        const close = () => overlay.remove();

        const getValue = (field) => {
            const el = overlay.querySelector(`[data-field="${field}"]`);
            if (!el) return '';
            if (el.tagName === 'DIV') return el.textContent || '';
            return el.value ?? '';
        };

        const readForm = () => ({
            name: getValue('name').trim() || form.name,
            machine: this.defaultMachine,
            group: getValue('group').trim() || this.defaultGroupName,
            gantry: getValue('gantry').trim() || '0.0',
            couch: getValue('couch').trim() || '0.0',
            snout: getValue('snout').trim() || '',
            rangeShifter: getValue('rangeShifter') || 'NONE'
        });

        const resetForNext = () => {
            const next = this.getDefaultNewBeamForm();
            overlay.querySelector(`[data-field="name"]`).value = next.name;
            overlay.querySelector(`[data-field="group"]`).textContent = next.group;
            overlay.querySelector(`[data-field="gantry"]`).value = next.gantry;
            overlay.querySelector(`[data-field="couch"]`).value = next.couch;
            overlay.querySelector(`[data-field="snout"]`).value = next.snout;
            overlay.querySelector(`[data-field="rangeShifter"]`).value = next.rangeShifter;
            overlay.querySelector(`[data-field="name"]`)?.focus();
        };

        const createBeamFromForm = (data) => {
            const id = `beam-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const newBeam = {
                id,
                visible: true,
                name: data.name,
                machine: data.machine,
                mode: 'PBS',
                planId: '',
                mu: '',
                gantry: data.gantry,
                couch: data.couch,
                target: 'CTV1',
                iso: 'ISO1',
                x: '1.42',
                y: '-47.90',
                z: '29.02',
                snout: data.snout,
                airMin: '',
                airCax: '',
                collision: '',
                rangeShifter: data.rangeShifter,
                group: data.group
            };
            this.beams.push(newBeam);
            this.selectedBeamId = newBeam.id;
            this.renderRows();
            this.updateToolbarState();
            this.options.onAdd(newBeam);
            this.options.onSelect(newBeam);
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        overlay.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            if (action === 'close' || action === 'cancel') {
                close();
                return;
            }
            if (action === 'confirm') {
                createBeamFromForm(readForm());
                close();
                return;
            }
            if (action === 'continue') {
                createBeamFromForm(readForm());
                resetForNext();
            }
        });

        document.body.appendChild(overlay);
        setTimeout(() => overlay.querySelector('[data-field="name"]')?.focus(), 0);
    }

    openEditBeamModal(beam) {
        const overlayId = `${this.options.prefix}protonBeamEditModalOverlay`;
        const existed = document.getElementById(overlayId);
        if (existed) existed.remove();

        const form = {
            name: beam?.name ?? '',
            machine: beam?.machine ?? this.defaultMachine,
            group: beam?.group ?? this.defaultGroupName,
            gantry: beam?.gantry ?? '0.0',
            couch: beam?.couch ?? '0.0',
            snout: beam?.snout ?? '',
            rangeShifter: beam?.rangeShifter ?? 'NONE'
        };

        const overlay = document.createElement('div');
        overlay.className = 'proton-beam-modal-overlay';
        overlay.id = overlayId;

        overlay.innerHTML = `
            <div class="proton-beam-modal" role="dialog" aria-modal="true" aria-label="编辑射束">
                <div class="proton-beam-modal-header">
                    <div class="proton-beam-modal-title">编辑射束</div>
                    <button class="proton-beam-modal-close" data-action="close" title="关闭">×</button>
                </div>
                <div class="proton-beam-modal-body">
                    <div class="proton-beam-modal-section">
                        <div class="proton-beam-modal-section-title">基本信息</div>
                        <div class="proton-beam-modal-grid-2">
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">名称</div>
                                <input class="proton-beam-modal-input" data-field="name" value="${this.escapeAttr(form.name)}" />
                            </div>
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">治疗机</div>
                                <div class="proton-beam-modal-static" data-field="machine">${this.escapeHtml(form.machine)}</div>
                            </div>
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">射束组</div>
                                <div class="proton-beam-modal-static" data-field="group">${this.escapeHtml(form.group)}</div>
                            </div>
                            <div></div>
                        </div>
                    </div>

                    <div class="proton-beam-modal-section">
                        <div class="proton-beam-modal-section-title">几何</div>
                        <div class="proton-beam-modal-grid-2">
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">机架角[°]</div>
                                <input class="proton-beam-modal-input" data-field="gantry" value="${this.escapeAttr(form.gantry)}" />
                            </div>
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">治疗床[°]</div>
                                <input class="proton-beam-modal-input" data-field="couch" value="${this.escapeAttr(form.couch)}" />
                            </div>
                        </div>
                    </div>

                    <div class="proton-beam-modal-section">
                        <div class="proton-beam-modal-section-title">SNOUT</div>
                        <div class="proton-beam-modal-grid-1">
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">SNOUT[cm]</div>
                                <input class="proton-beam-modal-input" data-field="snout" value="${this.escapeAttr(form.snout)}" />
                            </div>
                        </div>
                    </div>

                    <div class="proton-beam-modal-section">
                        <div class="proton-beam-modal-section-title">Rangeshifter</div>
                        <div class="proton-beam-modal-grid-1">
                            <div class="proton-beam-modal-field">
                                <div class="proton-beam-modal-label">Rangeshifter</div>
                                <select class="proton-beam-modal-select" data-field="rangeShifter">
                                    ${this.rangeShifterOptions.map(opt => `<option value="${this.escapeAttr(opt)}" ${opt === form.rangeShifter ? 'selected' : ''}>${this.escapeHtml(opt)}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="proton-beam-modal-footer">
                    <button class="proton-beam-modal-btn" data-action="cancel">取消</button>
                    <button class="proton-beam-modal-btn primary" data-action="confirm">确定</button>
                </div>
            </div>
        `;

        const close = () => overlay.remove();

        const getValue = (field) => {
            const el = overlay.querySelector(`[data-field="${field}"]`);
            if (!el) return '';
            if (el.tagName === 'DIV') return el.textContent || '';
            return el.value ?? '';
        };

        const readForm = () => ({
            name: getValue('name').trim() || form.name,
            machine: form.machine,
            group: form.group,
            gantry: getValue('gantry').trim() || form.gantry,
            couch: getValue('couch').trim() || form.couch,
            snout: getValue('snout').trim() || form.snout,
            rangeShifter: getValue('rangeShifter') || form.rangeShifter
        });

        const applyEdits = (data) => {
            const target = this.beams.find(b => b.id === beam.id);
            if (!target) return;
            target.name = data.name;
            target.gantry = data.gantry;
            target.couch = data.couch;
            target.snout = data.snout;
            target.rangeShifter = data.rangeShifter;
            // machine/group 维持只读展示
            this.renderRows();
            this.updateToolbarState();
            this.options.onEdit({ ...target });
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        overlay.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            if (action === 'close' || action === 'cancel') {
                close();
                return;
            }
            if (action === 'confirm') {
                applyEdits(readForm());
                close();
            }
        });

        document.body.appendChild(overlay);
        setTimeout(() => overlay.querySelector('[data-field="name"]')?.focus(), 0);
    }

    sortBeamsByName() {
        this.beams.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'en'));
        if (this.selectedBeamId && !this.beams.some(b => b.id === this.selectedBeamId)) {
            this.selectedBeamId = this.beams[0]?.id ?? null;
        }
        this.renderRows();
        this.updateToolbarState();
    }

    getSelectedBeam() {
        return this.beams.find(b => b.id === this.selectedBeamId) || null;
    }

    selectBeam(beamId) {
        if (this.selectedBeamId === beamId) return;
        this.selectedBeamId = beamId;
        this.renderRows();
        this.updateToolbarState();
        const selected = this.getSelectedBeam();
        if (selected) this.options.onSelect(selected);
    }

    setBeams(beams) {
        this.beams = Array.isArray(beams) ? beams : [];
        this.selectedBeamId = this.beams[0]?.id ?? null;
        this.renderRows();
        this.updateToolbarState();
    }

    renderRows() {
        const tbody = this.container.querySelector(`#${this.options.prefix}protonBeamTableBody`);
        if (!tbody) return;

        if (!this.beams.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="18" style="padding: 36px 10px; text-align: center; color: #888;">
                        暂无射束数据
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.beams.map((b, idx) => {
            const selectedClass = b.id === this.selectedBeamId ? 'is-selected' : '';
            const isVisible = b.visible !== false;
            const eyeClass = isVisible ? '' : 'is-off';
            const eyeIcon = isVisible ? 'fa-eye' : 'fa-eye-slash';
            return `
                <tr class="${selectedClass}" data-beam-id="${b.id}">
                    <td class="col-index">${idx + 1}</td>
                    <td class="col-eye">
                        <i class="fas ${eyeIcon} proton-beam-eye-btn ${eyeClass}" data-action="toggle-visibility" title="可见性"></i>
                    </td>
                    <td>${this.renderInputCell('name', b.name)}</td>
                    <td>${this.renderReadonlyCell('machine', b.machine)}</td>
                    <td>${this.renderTextCell(b.mode)}</td>
                    <td>${this.renderTextCell(b.mu, { align: 'right' })}</td>
                    <td>${this.renderInputCell('gantry', b.gantry, { align: 'right' })}</td>
                    <td>${this.renderInputCell('couch', b.couch, { align: 'right' })}</td>
                    <td>${this.renderSelectCell('target', b.target, this.targetOptions)}</td>
                    <td>${this.renderSelectCell('iso', b.iso, this.isoOptions)}</td>
                    <td>${this.renderInputCell('x', b.x, { align: 'right' })}</td>
                    <td>${this.renderInputCell('y', b.y, { align: 'right' })}</td>
                    <td>${this.renderInputCell('z', b.z, { align: 'right' })}</td>
                    <td>${this.renderInputCell('snout', b.snout, { align: 'right' })}</td>
                    <td>${this.renderTextCell(b.airMin, { align: 'right' })}</td>
                    <td>${this.renderTextCell(b.airCax, { align: 'right' })}</td>
                    <td>${this.renderReadonlyCell('collision', b.collision ?? '')}</td>
                    <td>${this.renderSelectCell('rangeShifter', b.rangeShifter, this.rangeShifterOptions)}</td>
                </tr>
            `;
        }).join('');
    }

    renderTextCell(value, extra = {}) {
        const v = value ?? '';
        const rightClass = extra.align === 'right' ? ' is-right' : '';
        return `<div class="proton-beam-cell-text${rightClass}" title="${this.escapeAttr(v)}">${this.escapeHtml(v)}</div>`;
    }

    renderReadonlyCell(field, value) {
        const v = value ?? '';
        return `<input class="proton-beam-cell-control" data-field="${field}" value="${this.escapeAttr(v)}" readonly />`;
    }

    renderInputCell(field, value, extra = {}) {
        const v = value ?? '';
        const align = extra.align ? `style="text-align:${extra.align};"` : '';
        return `<input class="proton-beam-cell-control" data-field="${field}" value="${this.escapeAttr(v)}" ${align} />`;
    }

    renderSelectCell(field, value, options) {
        const v = value ?? '';
        const htmlOptions = (Array.isArray(options) ? options : []).map(opt => {
            const selected = String(opt) === String(v) ? 'selected' : '';
            return `<option value="${this.escapeAttr(opt)}" ${selected}>${this.escapeHtml(opt)}</option>`;
        }).join('');
        return `<select class="proton-beam-cell-control" data-field="${field}">${htmlOptions}</select>`;
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

    updateToolbarState() {
        const hasSelection = Boolean(this.getSelectedBeam());
        this.container.querySelectorAll('.proton-beam-toolbar-btn[data-action="edit"], .proton-beam-toolbar-btn[data-action="delete"], .proton-beam-toolbar-btn[data-action="copy"]').forEach(btn => {
            btn.disabled = !hasSelection;
        });
    }
}

if (typeof window !== 'undefined') {
    window.ProtonBeamListComponentPBS = ProtonBeamListComponentPBS;
}

