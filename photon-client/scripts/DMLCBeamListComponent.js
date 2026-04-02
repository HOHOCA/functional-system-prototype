/**
 * DMLC 射束列表（光子计划设计）
 * 深色表格 + 分组表头 + 底部操作栏，样式对齐 MOZI Photon 原型截图。
 */
(function (global) {
    if (!global) return;

    class DMLCBeamListComponent {
        constructor(containerId, options = {}) {
            this.containerId = containerId;
            this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
            this.options = {
                prefix: options.prefix || '',
                onSelect: options.onSelect || (() => {}),
                onChange: options.onChange || (() => {}),
                onToolbar: options.onToolbar || (() => {}),
                ...options
            };

            this.beams = Array.isArray(options.beams) ? options.beams : this.getDemoBeams();
            this.selectedBeamId = this.beams[0]?.id ?? null;
            this.energyOptions = options.energyOptions || ['6.0', '10.0', '15.0', '18.0'];
            this.isoOptions = options.isoOptions || ['ISO1', 'ISO2', 'ISO3'];
            this.bolusOptions = options.bolusOptions || ['NONE', 'Bolus1', 'Bolus2'];

            if (!this.container) {
                console.error('DMLCBeamListComponent: 容器不存在', containerId);
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
                    id: 'dmlc-beam-1',
                    visible: true,
                    name: 'Beam 1',
                    machine: 'EdgeSN5427',
                    technique: 'DMLC',
                    energy: '6.0',
                    mu: '0.00',
                    normPoint: '',
                    doseWeight: '1.000',
                    gantry: '0.0',
                    collimator: '0.0',
                    couch: '0.0',
                    isoCenter: 'ISO1',
                    isoX: '-0.52',
                    isoY: '-13.95',
                    isoZ: '-10.17',
                    fieldX: '10.00',
                    x1: '-5.00',
                    x2: '5.00',
                    fieldY: '10.00',
                    y1: '-5.00',
                    y2: '5.00',
                    ssd: '92.23',
                    treatTime: '',
                    bolus: 'NONE',
                    description: ''
                },
                {
                    id: 'dmlc-beam-2',
                    visible: true,
                    name: 'Beam 2',
                    machine: 'EdgeSN5427',
                    technique: 'DMLC',
                    energy: '6.0',
                    mu: '0.00',
                    normPoint: '',
                    doseWeight: '1.000',
                    gantry: '90.0',
                    collimator: '0.0',
                    couch: '0.0',
                    isoCenter: 'ISO1',
                    isoX: '-0.52',
                    isoY: '-13.95',
                    isoZ: '-10.17',
                    fieldX: '10.00',
                    x1: '-5.00',
                    x2: '5.00',
                    fieldY: '10.00',
                    y1: '-5.00',
                    y2: '5.00',
                    ssd: '92.23',
                    treatTime: '',
                    bolus: 'NONE',
                    description: ''
                }
            ];
        }

        ensureStyles() {
            const styleId = `${this.options.prefix}dmlcBeamListStyles`;
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .dmlc-beam-list {
                    width: 100%;
                    height: 100%;
                    min-height: 280px;
                    display: flex;
                    flex-direction: column;
                    background: #000000;
                    color: #e8e8e8;
                    font-size: 12px;
                    border: 1px solid #2a2a2a;
                    border-radius: 4px;
                    overflow: hidden;
                    font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
                }

                .dmlc-beam-list-table-wrap {
                    flex: 1;
                    overflow: auto;
                    background: #050505;
                }

                .dmlc-beam-list-table {
                    border-collapse: separate;
                    border-spacing: 0;
                    min-width: 2400px;
                    width: max-content;
                    table-layout: fixed;
                }

                .dmlc-beam-list-table thead th {
                    background: #141414;
                    color: #c8c8c8;
                    font-weight: 500;
                    border-bottom: 1px solid #333;
                    border-right: 1px solid #252525;
                    padding: 6px 8px;
                    text-align: center;
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 3;
                    box-sizing: border-box;
                }

                .dmlc-beam-list-table thead tr:nth-child(2) th {
                    top: 29px;
                    z-index: 3;
                }

                .dmlc-beam-list-table .dmlc-sticky-col {
                    position: sticky;
                    left: 0;
                    z-index: 4;
                    background: #141414;
                }

                .dmlc-beam-list-table .dmlc-sticky-col-2 {
                    left: 44px;
                }

                .dmlc-beam-list-table .dmlc-sticky-col-3 {
                    left: 94px;
                }

                .dmlc-beam-list-table tbody td.dmlc-sticky-col,
                .dmlc-beam-list-table tbody td.dmlc-sticky-col-2,
                .dmlc-beam-list-table tbody td.dmlc-sticky-col-3 {
                    z-index: 1;
                    background: #0a0a0a;
                }

                .dmlc-beam-list-table tbody tr.is-selected td.dmlc-sticky-col,
                .dmlc-beam-list-table tbody tr.is-selected td.dmlc-sticky-col-2,
                .dmlc-beam-list-table tbody tr.is-selected td.dmlc-sticky-col-3 {
                    background: rgba(58, 172, 222, 0.12);
                }

                .dmlc-beam-list-table tbody td {
                    padding: 4px 6px;
                    border-bottom: 1px solid #1c1c1c;
                    border-right: 1px solid #1c1c1c;
                    vertical-align: middle;
                    background: #0a0a0a;
                }

                .dmlc-beam-list-table tbody tr {
                    cursor: pointer;
                }

                .dmlc-beam-list-table tbody tr:hover td {
                    background: #101010;
                }

                .dmlc-beam-list-table tbody tr:hover td.dmlc-sticky-col,
                .dmlc-beam-list-table tbody tr:hover td.dmlc-sticky-col-2,
                .dmlc-beam-list-table tbody tr:hover td.dmlc-sticky-col-3 {
                    background: #121212;
                }

                .dmlc-beam-list-table tbody tr.is-selected {
                    outline: 2px solid rgba(58, 172, 222, 0.95);
                    outline-offset: -2px;
                }

                .dmlc-beam-list-table tbody tr.is-selected td {
                    background: rgba(58, 172, 222, 0.12);
                }

                .dmlc-beam-list-table .col-index {
                    width: 44px;
                    min-width: 44px;
                    text-align: center;
                    color: #9ca3af;
                }

                .dmlc-beam-list-table .col-eye {
                    width: 50px;
                    min-width: 50px;
                    text-align: center;
                }

                .dmlc-beam-eye-btn {
                    color: #9ca3af;
                    cursor: pointer;
                    user-select: none;
                }

                .dmlc-beam-eye-btn.is-off {
                    color: #4b5563;
                }

                .dmlc-beam-eye-btn:hover {
                    color: #e5e7eb;
                }

                .dmlc-beam-cell-control {
                    width: 100%;
                    min-width: 0;
                    height: 24px;
                    padding: 0 6px;
                    background: #0e0e0e;
                    border: 1px solid #3a3a3a;
                    border-radius: 3px;
                    color: #e5e7eb;
                    font-size: 12px;
                    font-family: inherit;
                    outline: none;
                    box-sizing: border-box;
                }

                .dmlc-beam-cell-control:focus {
                    border-color: rgba(58, 172, 222, 0.75);
                    box-shadow: 0 0 0 1px rgba(58, 172, 222, 0.2);
                }

                span.dmlc-beam-cell-control.dmlc-beam-cell-readonly {
                    display: flex;
                    align-items: center;
                    border-style: solid;
                    min-height: 24px;
                    color: #bdbdbd;
                }

                select.dmlc-beam-cell-control {
                    appearance: none;
                    background-image:
                        linear-gradient(45deg, transparent 50%, #888 50%),
                        linear-gradient(135deg, #888 50%, transparent 50%);
                    background-position: calc(100% - 11px) 9px, calc(100% - 6px) 9px;
                    background-size: 5px 5px, 5px 5px;
                    background-repeat: no-repeat;
                    padding-right: 20px;
                }

                .dmlc-beam-list-toolbar {
                    flex-shrink: 0;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px;
                    border-top: 1px solid #333;
                    background: #121212;
                }

                .dmlc-beam-toolbar-btn {
                    height: 26px;
                    min-width: 72px;
                    padding: 0 10px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 3px;
                    border: 1px solid #404040;
                    background: #1a1a1a;
                    color: #ddd;
                    font-size: 12px;
                    cursor: pointer;
                    user-select: none;
                    white-space: nowrap;
                }

                .dmlc-beam-toolbar-btn:hover {
                    background: #252525;
                    border-color: #505050;
                }

                .dmlc-beam-toolbar-btn:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }
            `;
            document.head.appendChild(style);
        }

        tableId() {
            return `${this.options.prefix}dmlcBeamTable`;
        }

        bodyId() {
            return `${this.options.prefix}dmlcBeamTableBody`;
        }

        render() {
            this.container.innerHTML = `
                <div class="dmlc-beam-list">
                    <div class="dmlc-beam-list-table-wrap">
                        <table class="dmlc-beam-list-table" id="${this.tableId()}">
                            <thead>
                                <tr>
                                    <th class="col-index dmlc-sticky-col" rowspan="2">序号</th>
                                    <th class="col-eye dmlc-sticky-col dmlc-sticky-col-2" rowspan="2">
                                        <i class="fas fa-eye dmlc-beam-eye-btn" data-action="toggle-all-visibility" title="可见性"></i>
                                    </th>
                                    <th class="dmlc-sticky-col dmlc-sticky-col-3" rowspan="2" style="width:100px;min-width:100px;">名称</th>
                                    <th rowspan="2" style="width:120px;">治疗机</th>
                                    <th rowspan="2" style="width:72px;">技术</th>
                                    <th rowspan="2" style="width:80px;">能量[MV]</th>
                                    <th rowspan="2" style="width:72px;">MU</th>
                                    <th rowspan="2" style="width:88px;">归一点[cGy]</th>
                                    <th rowspan="2" style="width:80px;">剂量权重</th>
                                    <th rowspan="2" style="width:72px;">机架[°]</th>
                                    <th rowspan="2" style="width:72px;">准直器[°]</th>
                                    <th rowspan="2" style="width:72px;">治疗床[°]</th>
                                    <th colspan="4">等中心</th>
                                    <th colspan="6">坞门[cm]</th>
                                    <th rowspan="2" style="width:72px;">SSD[cm]</th>
                                    <th rowspan="2" style="width:80px;">治疗时间[s]</th>
                                    <th rowspan="2" style="width:100px;">组织等效物</th>
                                    <th rowspan="2" style="width:140px;">描述</th>
                                </tr>
                                <tr>
                                    <th style="width:88px;">中心点</th>
                                    <th style="width:72px;">X[cm]</th>
                                    <th style="width:72px;">Y[cm]</th>
                                    <th style="width:72px;">Z[cm]</th>
                                    <th style="width:72px;">X JAW 开口</th>
                                    <th style="width:64px;">X1</th>
                                    <th style="width:64px;">X2</th>
                                    <th style="width:72px;">Y JAW 开口</th>
                                    <th style="width:64px;">Y1</th>
                                    <th style="width:64px;">Y2</th>
                                </tr>
                            </thead>
                            <tbody id="${this.bodyId()}"></tbody>
                        </table>
                    </div>
                    <div class="dmlc-beam-list-toolbar">
                        <button type="button" class="dmlc-beam-toolbar-btn" data-action="add-beam">添加射束</button>
                        <button type="button" class="dmlc-beam-toolbar-btn" data-action="edit-beam" disabled>编辑射束</button>
                        <button type="button" class="dmlc-beam-toolbar-btn" data-action="delete" disabled>删除</button>
                        <button type="button" class="dmlc-beam-toolbar-btn" data-action="copy" disabled>复制</button>
                        <button type="button" class="dmlc-beam-toolbar-btn" data-action="sort">射束排序</button>
                        <button type="button" class="dmlc-beam-toolbar-btn" data-action="cancel-distribution">取消分野</button>
                        <button type="button" class="dmlc-beam-toolbar-btn" data-action="add-setup">添加摆位野</button>
                        <button type="button" class="dmlc-beam-toolbar-btn" data-action="add-opposing">添加对等野</button>
                        <button type="button" class="dmlc-beam-toolbar-btn" data-action="load-template">加载射束模板</button>
                        <button type="button" class="dmlc-beam-toolbar-btn" data-action="create-template">创建射束模板</button>
                    </div>
                </div>
            `;
        }

        bindEvents() {
            const tableBody = this.container.querySelector(`#${this.bodyId()}`);
            if (tableBody) {
                tableBody.addEventListener('click', (e) => {
                    if (e.target.closest('input, select, textarea, button')) return;

                    const eye = e.target.closest('[data-action="toggle-visibility"]');
                    if (eye) {
                        const row = e.target.closest('tr[data-beam-id]');
                        if (!row) return;
                        this.toggleBeamVisibility(row.getAttribute('data-beam-id'));
                        return;
                    }

                    const row = e.target.closest('tr[data-beam-id]');
                    if (!row) return;
                    this.selectBeam(row.getAttribute('data-beam-id'));
                });

                const onField = (beamId, field, value, silent) => {
                    const beam = this.beams.find(b => b.id === beamId);
                    if (!beam) return;
                    beam[field] = value;
                    if (!silent) this.options.onChange({ beamId, field, value, beam: { ...beam } });
                };

                tableBody.addEventListener('change', (e) => {
                    const control = e.target.closest('[data-field]');
                    if (!control) return;
                    const row = control.closest('tr[data-beam-id]');
                    if (!row) return;
                    onField(row.getAttribute('data-beam-id'), control.getAttribute('data-field'), control.value, false);
                });

                tableBody.addEventListener('input', (e) => {
                    const control = e.target.closest('input[data-field]');
                    if (!control) return;
                    const row = control.closest('tr[data-beam-id]');
                    if (!row) return;
                    onField(row.getAttribute('data-beam-id'), control.getAttribute('data-field'), control.value, true);
                });
            }

            const table = this.container.querySelector(`#${this.tableId()}`);
            if (table) {
                table.addEventListener('click', (e) => {
                    const t = e.target.closest('[data-action="toggle-all-visibility"]');
                    if (t) this.toggleAllVisibility();
                });
            }

            const toolbar = this.container.querySelector('.dmlc-beam-list-toolbar');
            if (toolbar) {
                toolbar.addEventListener('click', (e) => {
                    const btn = e.target.closest('button[data-action]');
                    if (!btn || btn.disabled) return;
                    this.handleToolbar(btn.getAttribute('data-action'));
                });
            }
        }

        energySelectHtml(beam) {
            return this.energyOptions
                .map((v) => `<option value="${v}" ${beam.energy === v ? 'selected' : ''}>${v}</option>`)
                .join('');
        }

        isoSelectHtml(beam) {
            return this.isoOptions
                .map((v) => `<option value="${v}" ${beam.isoCenter === v ? 'selected' : ''}>${v}</option>`)
                .join('');
        }

        bolusSelectHtml(beam) {
            return this.bolusOptions
                .map((v) => `<option value="${v}" ${beam.bolus === v ? 'selected' : ''}>${v}</option>`)
                .join('');
        }

        renderRows() {
            const tbody = this.container.querySelector(`#${this.bodyId()}`);
            if (!tbody) return;

            tbody.innerHTML = this.beams
                .map((beam, index) => {
                    const sel = this.selectedBeamId === beam.id ? 'is-selected' : '';
                    const eyeClass = beam.visible ? 'dmlc-beam-eye-btn' : 'dmlc-beam-eye-btn is-off';
                    const icon = beam.visible ? 'fa-eye' : 'fa-eye-slash';
                    return `
                        <tr data-beam-id="${beam.id}" class="${sel}">
                            <td class="col-index dmlc-sticky-col">${index + 1}</td>
                            <td class="col-eye dmlc-sticky-col dmlc-sticky-col-2">
                                <i class="fas ${icon} ${eyeClass}" data-action="toggle-visibility" title="可见性"></i>
                            </td>
                            <td class="dmlc-sticky-col dmlc-sticky-col-3">
                                <input class="dmlc-beam-cell-control" data-field="name" value="${this.esc(beam.name)}" />
                            </td>
                            <td><span class="dmlc-beam-cell-control" style="display:flex;align-items:center;border-style:solid;">${this.esc(beam.machine)}</span></td>
                            <td><span class="dmlc-beam-cell-control" style="display:flex;align-items:center;border-style:solid;">${this.esc(beam.technique)}</span></td>
                            <td>
                                <select class="dmlc-beam-cell-control" data-field="energy">${this.energySelectHtml(beam)}</select>
                            </td>
                            <td><input class="dmlc-beam-cell-control" data-field="mu" value="${this.esc(beam.mu)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="normPoint" value="${this.esc(beam.normPoint)}" placeholder="" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="doseWeight" value="${this.esc(beam.doseWeight)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="gantry" value="${this.esc(beam.gantry)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="collimator" value="${this.esc(beam.collimator)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="couch" value="${this.esc(beam.couch)}" /></td>
                            <td><select class="dmlc-beam-cell-control" data-field="isoCenter">${this.isoSelectHtml(beam)}</select></td>
                            <td><input class="dmlc-beam-cell-control" data-field="isoX" value="${this.esc(beam.isoX)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="isoY" value="${this.esc(beam.isoY)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="isoZ" value="${this.esc(beam.isoZ)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="fieldX" value="${this.esc(beam.fieldX)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="x1" value="${this.esc(beam.x1)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="x2" value="${this.esc(beam.x2)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="fieldY" value="${this.esc(beam.fieldY)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="y1" value="${this.esc(beam.y1)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="y2" value="${this.esc(beam.y2)}" /></td>
                            <td><input class="dmlc-beam-cell-control" data-field="ssd" value="${this.esc(beam.ssd)}" /></td>
                            <td><span class="dmlc-beam-cell-control dmlc-beam-cell-readonly" title="治疗时间[s]">${this.esc(beam.treatTime)}</span></td>
                            <td><select class="dmlc-beam-cell-control" data-field="bolus">${this.bolusSelectHtml(beam)}</select></td>
                            <td><input class="dmlc-beam-cell-control" data-field="description" value="${this.esc(beam.description)}" /></td>
                        </tr>
                    `;
                })
                .join('');
        }

        esc(s) {
            if (s == null) return '';
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        selectBeam(beamId) {
            if (this.selectedBeamId === beamId) return;
            this.selectedBeamId = beamId;
            this.renderRows();
            const beam = this.beams.find((b) => b.id === beamId);
            this.options.onSelect(beam);
            this.updateToolbarState();
        }

        toggleBeamVisibility(beamId) {
            const beam = this.beams.find((b) => b.id === beamId);
            if (!beam) return;
            beam.visible = !beam.visible;
            this.renderRows();
            this.options.onChange({ beamId, field: 'visible', value: beam.visible, beam: { ...beam } });
        }

        toggleAllVisibility() {
            const anyOn = this.beams.some((b) => b.visible);
            this.beams.forEach((b) => {
                b.visible = !anyOn;
            });
            this.renderRows();
            this.options.onChange({ field: 'visible', value: !anyOn, all: true });
        }

        updateToolbarState() {
            const hasSel = !!this.selectedBeamId;
            const toolbar = this.container.querySelector('.dmlc-beam-list-toolbar');
            if (!toolbar) return;
            toolbar.querySelector('[data-action="edit-beam"]').disabled = !hasSel;
            toolbar.querySelector('[data-action="delete"]').disabled = !hasSel;
            toolbar.querySelector('[data-action="copy"]').disabled = !hasSel;
        }

        handleToolbar(action) {
            this.options.onToolbar({ action, selectedId: this.selectedBeamId, beams: this.beams });

            if (action === 'add-beam') {
                const n = this.beams.length + 1;
                const id = `dmlc-beam-${Date.now()}`;
                const template = this.beams[this.beams.length - 1] || this.getDemoBeams()[0];
                this.beams.push({
                    ...template,
                    id,
                    name: `Beam ${n}`,
                    visible: true
                });
                this.selectedBeamId = id;
                this.renderRows();
                this.updateToolbarState();
                this.options.onSelect(this.beams[this.beams.length - 1]);
                return;
            }

            if (action === 'delete' && this.selectedBeamId) {
                this.beams = this.beams.filter((b) => b.id !== this.selectedBeamId);
                this.selectedBeamId = this.beams[0]?.id ?? null;
                this.renderRows();
                this.updateToolbarState();
                this.options.onSelect(this.beams.find((b) => b.id === this.selectedBeamId) || null);
                return;
            }

            if (action === 'copy' && this.selectedBeamId) {
                const src = this.beams.find((b) => b.id === this.selectedBeamId);
                if (!src) return;
                const id = `dmlc-beam-${Date.now()}`;
                const copy = { ...src, id, name: `${src.name} 副本` };
                const idx = this.beams.findIndex((b) => b.id === this.selectedBeamId);
                this.beams.splice(idx + 1, 0, copy);
                this.selectedBeamId = id;
                this.renderRows();
                this.updateToolbarState();
            }
        }

        destroy() {
            const styleId = `${this.options.prefix}dmlcBeamListStyles`;
            const st = document.getElementById(styleId);
            if (st) st.remove();
            if (this.container) this.container.innerHTML = '';
        }
    }

    global.DMLCBeamListComponent = DMLCBeamListComponent;
})(typeof window !== 'undefined' ? window : undefined);
