/**
 * 光子-射束优化设置（光子项目）
 * 深色表格：可见性列（眼睛）可点击切换单行/表头全部；坞门限制列为复选框（含表头全选）；其余列为纯展示。
 */
(function (global) {
    if (!global) return;

    class PhotonProtonBeamOptimizationSettingsComponent {
        constructor(containerId, options = {}) {
            this.containerId = containerId;
            this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
            this.options = {
                prefix: options.prefix || '',
                onSelect: options.onSelect || (() => {}),
                onChange: options.onChange || (() => {}),
                ...options
            };

            this.beams = Array.isArray(options.beams) ? options.beams : this.getDemoBeams();
            this.selectedBeamId = this.beams[0]?.id ?? null;

            if (!this.container) {
                console.error('PhotonProtonBeamOptimizationSettingsComponent: 容器不存在', containerId);
                return;
            }

            this.ensureStyles();
            this.render();
            this.bindEvents();
            this.renderRows();
        }

        getDemoBeams() {
            const rows = [];
            for (let i = 1; i <= 9; i++) {
                rows.push({
                    id: `ppb-opt-beam-${i}`,
                    visible: true,
                    name: `Beam ${i}`,
                    energy: '6.0',
                    gantry: '0.0',
                    collimator: '0.0',
                    couch: '0.0',
                    gatingLimit: false,
                    x1: '-5.00',
                    x2: '5.00',
                    y1: '-5.00',
                    y2: '5.00'
                });
            }
            return rows;
        }

        ensureStyles() {
            const styleId = `${this.options.prefix}ppbOptSettingsStyles`;
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .ppb-opt-settings {
                    width: 100%;
                    height: 100%;
                    min-height: 280px;
                    display: flex;
                    flex-direction: column;
                    background: #141414;
                    color: #e8e8e8;
                    font-size: 12px;
                    border: 1px solid #2a2a2a;
                    border-radius: 4px;
                    overflow: hidden;
                    font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
                }
                .ppb-opt-settings__wrap {
                    flex: 1;
                    overflow: auto;
                    background: #0d0d0d;
                }
                .ppb-opt-settings__table {
                    border-collapse: separate;
                    border-spacing: 0;
                    min-width: 920px;
                    width: max-content;
                    table-layout: fixed;
                }
                .ppb-opt-settings__table thead th {
                    background: #141414;
                    color: #c8c8c8;
                    font-weight: 500;
                    border-bottom: 1px solid #333;
                    border-right: 1px solid #252525;
                    padding: 8px 8px;
                    text-align: center;
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 3;
                    box-sizing: border-box;
                }
                .ppb-opt-settings__table .ppb-sticky-col {
                    position: sticky;
                    left: 0;
                    z-index: 4;
                    background: #141414;
                }
                .ppb-opt-settings__table .ppb-sticky-col-2 { left: 44px; }
                .ppb-opt-settings__table .ppb-sticky-col-3 { left: 94px; }
                .ppb-opt-settings__table tbody td.ppb-sticky-col,
                .ppb-opt-settings__table tbody td.ppb-sticky-col-2,
                .ppb-opt-settings__table tbody td.ppb-sticky-col-3 {
                    z-index: 1;
                    background: #0a0a0a;
                }
                .ppb-opt-settings__table tbody tr.is-selected td.ppb-sticky-col,
                .ppb-opt-settings__table tbody tr.is-selected td.ppb-sticky-col-2,
                .ppb-opt-settings__table tbody tr.is-selected td.ppb-sticky-col-3 {
                    background: rgba(58, 130, 200, 0.14);
                }
                .ppb-opt-settings__table tbody td {
                    padding: 4px 6px;
                    border-bottom: 1px solid #1c1c1c;
                    border-right: 1px solid #1c1c1c;
                    vertical-align: middle;
                    background: #0a0a0a;
                }
                .ppb-opt-settings__table tbody tr { cursor: pointer; }
                .ppb-opt-settings__table tbody tr:hover td { background: #101010; }
                .ppb-opt-settings__table tbody tr:hover td.ppb-sticky-col,
                .ppb-opt-settings__table tbody tr:hover td.ppb-sticky-col-2,
                .ppb-opt-settings__table tbody tr:hover td.ppb-sticky-col-3 {
                    background: #121212;
                }
                .ppb-opt-settings__table tbody tr.is-selected td {
                    background: rgba(58, 130, 200, 0.14);
                }
                .ppb-opt-settings__col-index {
                    width: 44px;
                    min-width: 44px;
                    text-align: center;
                    color: #9ca3af;
                }
                .ppb-opt-settings__col-eye {
                    width: 50px;
                    min-width: 50px;
                    text-align: center;
                }
                .ppb-opt-settings__col-name { width: 100px; min-width: 100px; text-align: left; }
                .ppb-opt-settings__table thead th.ppb-opt-settings__col-name { text-align: center; }
                .ppb-opt-settings__col-num { width: 72px; min-width: 72px; text-align: center; }
                .ppb-opt-settings__col-gating {
                    width: 100px;
                    min-width: 100px;
                    text-align: center;
                }
                .ppb-opt-settings__gating-head {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    color: #c8c8c8;
                    user-select: none;
                    cursor: pointer;
                }
                .ppb-opt-settings__gating-head input[type="checkbox"] {
                    width: 14px;
                    height: 14px;
                    margin: 0;
                    cursor: pointer;
                    accent-color: #3a82c8;
                    flex-shrink: 0;
                }
                .ppb-opt-settings__gating-cell input[type="checkbox"] {
                    width: 14px;
                    height: 14px;
                    margin: 0;
                    cursor: pointer;
                    accent-color: #3a82c8;
                    vertical-align: middle;
                }
                .ppb-opt-eye {
                    color: #9ca3af;
                    cursor: pointer;
                    user-select: none;
                }
                .ppb-opt-eye.is-off { color: #4b5563; }
                .ppb-opt-eye:hover { color: #e5e7eb; }
                .ppb-opt-cell {
                    display: block;
                    min-height: 24px;
                    line-height: 24px;
                    padding: 0 6px;
                    color: #e5e7eb;
                    font-size: 12px;
                    text-align: center;
                    box-sizing: border-box;
                }
                .ppb-opt-cell--name { text-align: left; }
            `;
            document.head.appendChild(style);
        }

        tableId() {
            return `${this.options.prefix}ppbOptTable`;
        }

        bodyId() {
            return `${this.options.prefix}ppbOptTableBody`;
        }

        render() {
            this.container.innerHTML = `
                <div class="ppb-opt-settings">
                    <div class="ppb-opt-settings__wrap">
                        <table class="ppb-opt-settings__table" id="${this.tableId()}">
                            <thead>
                                <tr>
                                    <th class="ppb-opt-settings__col-index ppb-sticky-col">序号</th>
                                    <th class="ppb-opt-settings__col-eye ppb-sticky-col ppb-sticky-col-2">
                                        <i class="fas fa-eye ppb-opt-eye" data-action="toggle-all-visibility" title="全部显示/隐藏"></i>
                                    </th>
                                    <th class="ppb-opt-settings__col-name ppb-sticky-col ppb-sticky-col-3">名称</th>
                                    <th class="ppb-opt-settings__col-num">能量[MV]</th>
                                    <th class="ppb-opt-settings__col-num">机架[°]</th>
                                    <th class="ppb-opt-settings__col-num">准直器[°]</th>
                                    <th class="ppb-opt-settings__col-num">治疗床[°]</th>
                                    <th class="ppb-opt-settings__col-gating">
                                        <label class="ppb-opt-settings__gating-head">
                                            <input type="checkbox" data-action="gating-select-all" title="全选坞门限制" />
                                            <span>坞门限制</span>
                                        </label>
                                    </th>
                                    <th class="ppb-opt-settings__col-num">X1[cm]</th>
                                    <th class="ppb-opt-settings__col-num">X2[cm]</th>
                                    <th class="ppb-opt-settings__col-num">Y1[cm]</th>
                                    <th class="ppb-opt-settings__col-num">Y2[cm]</th>
                                </tr>
                            </thead>
                            <tbody id="${this.bodyId()}"></tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        bindEvents() {
            const tableBody = this.container.querySelector(`#${this.bodyId()}`);
            if (tableBody) {
                tableBody.addEventListener('click', (e) => {
                    if (e.target.matches?.('input[type="checkbox"][data-field="gatingLimit"]')) return;

                    const eye = e.target.closest('[data-action="toggle-visibility"]');
                    if (eye) {
                        e.stopPropagation();
                        const row = eye.closest('tr[data-beam-id]');
                        if (row) this.toggleBeamVisibility(row.getAttribute('data-beam-id'));
                        return;
                    }

                    const row = e.target.closest('tr[data-beam-id]');
                    if (row) this.selectBeam(row.getAttribute('data-beam-id'));
                });

                tableBody.addEventListener('change', (e) => {
                    if (!e.target.matches?.('input[type="checkbox"][data-field="gatingLimit"]')) return;
                    const row = e.target.closest('tr[data-beam-id]');
                    if (row) this.setGating(row.getAttribute('data-beam-id'), e.target.checked);
                });
            }

            const table = this.container.querySelector(`#${this.tableId()}`);
            if (table) {
                table.addEventListener('click', (e) => {
                    const t = e.target.closest('[data-action="toggle-all-visibility"]');
                    if (t) this.toggleAllVisibility();
                });

                table.addEventListener('change', (e) => {
                    if (!e.target.matches?.('[data-action="gating-select-all"]')) return;
                    const checked = e.target.checked;
                    this.beams.forEach((b) => {
                        b.gatingLimit = checked;
                    });
                    this.renderRows();
                    this.options.onChange({ field: 'gatingLimit', value: checked, all: true });
                });
            }
        }

        setGating(beamId, checked) {
            const beam = this.beams.find((b) => b.id === beamId);
            if (!beam) return;
            beam.gatingLimit = !!checked;
            this.syncHeaderGatingCheckbox();
            this.options.onChange({ beamId, field: 'gatingLimit', value: beam.gatingLimit, beam: { ...beam } });
        }

        syncHeaderGatingCheckbox() {
            const cb = this.container.querySelector('[data-action="gating-select-all"]');
            if (!cb || !this.beams.length) return;
            const allOn = this.beams.every((b) => b.gatingLimit);
            const noneOn = this.beams.every((b) => !b.gatingLimit);
            cb.checked = allOn;
            cb.indeterminate = !allOn && !noneOn;
        }

        renderRows() {
            const tbody = this.container.querySelector(`#${this.bodyId()}`);
            if (!tbody) return;

            tbody.innerHTML = this.beams
                .map((beam, index) => {
                    const sel = this.selectedBeamId === beam.id ? 'is-selected' : '';
                    const eyeClass = beam.visible ? 'ppb-opt-eye' : 'ppb-opt-eye is-off';
                    const icon = beam.visible ? 'fa-eye' : 'fa-eye-slash';
                    const gatingChecked = beam.gatingLimit ? 'checked' : '';
                    return `
                        <tr data-beam-id="${beam.id}" class="${sel}">
                            <td class="ppb-opt-settings__col-index ppb-sticky-col">${index + 1}</td>
                            <td class="ppb-opt-settings__col-eye ppb-sticky-col ppb-sticky-col-2">
                                <i class="fas ${icon} ${eyeClass}" data-action="toggle-visibility" title="显示/隐藏"></i>
                            </td>
                            <td class="ppb-opt-settings__col-name ppb-sticky-col ppb-sticky-col-3">
                                <span class="ppb-opt-cell ppb-opt-cell--name">${this.esc(beam.name)}</span>
                            </td>
                            <td><span class="ppb-opt-cell">${this.esc(beam.energy)}</span></td>
                            <td><span class="ppb-opt-cell">${this.esc(beam.gantry)}</span></td>
                            <td><span class="ppb-opt-cell">${this.esc(beam.collimator)}</span></td>
                            <td><span class="ppb-opt-cell">${this.esc(beam.couch)}</span></td>
                            <td class="ppb-opt-settings__col-gating ppb-opt-settings__gating-cell">
                                <input type="checkbox" data-field="gatingLimit" ${gatingChecked} />
                            </td>
                            <td><span class="ppb-opt-cell">${this.esc(beam.x1)}</span></td>
                            <td><span class="ppb-opt-cell">${this.esc(beam.x2)}</span></td>
                            <td><span class="ppb-opt-cell">${this.esc(beam.y1)}</span></td>
                            <td><span class="ppb-opt-cell">${this.esc(beam.y2)}</span></td>
                        </tr>
                    `;
                })
                .join('');

            this.syncHeaderGatingCheckbox();
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

        destroy() {
            const styleId = `${this.options.prefix}ppbOptSettingsStyles`;
            const st = document.getElementById(styleId);
            if (st) st.remove();
            if (this.container) this.container.innerHTML = '';
        }
    }

    global.PhotonProtonBeamOptimizationSettingsComponent = PhotonProtonBeamOptimizationSettingsComponent;
})(typeof window !== 'undefined' ? window : undefined);
