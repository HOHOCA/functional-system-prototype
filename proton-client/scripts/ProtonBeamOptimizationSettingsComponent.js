/**
 * 质子-射束优化设置：深色表格，可编辑预期权重/间距/层束斑，RTV 下拉，只读坐标与实际权重百分比。
 */
class ProtonBeamOptimizationSettingsComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        this.options = {
            prefix: options.prefix || '',
            getBeamList: options.getBeamList || null,
            getROIList: options.getROIList || null,
            onSettingsChange: options.onSettingsChange || (() => {}),
            rtvExtraOptions: options.rtvExtraOptions || [],
            ...options
        };

        this.beamSettings = new Map();
        this.initData(options.beams);

        if (!this.container) {
            console.error('ProtonBeamOptimizationSettingsComponent: 容器不存在', containerId);
            return;
        }

        this.ensureStyles();
        this.renderShell();
        this.bindEvents();
        this.loadBeamList();
    }

    initData(beamsOption) {
        if (Array.isArray(beamsOption) && beamsOption.length) {
            beamsOption.forEach((b) => {
                const id = String(b.id ?? b.name);
                this.beamSettings.set(id, this.normalizeBeam(id, b));
            });
            return;
        }
        this.getDemoBeams().forEach((b) => {
            this.beamSettings.set(b.id, b);
        });
    }

    getDemoBeams() {
        return [
            {
                id: 'beam-1',
                name: 'Beam 1',
                isocenter: 'ISO1',
                x: 1.42,
                y: -47.9,
                z: 29.02,
                expectedWeight: 0,
                actualWeightPercent: 46.15,
                rtv: '自动生成',
                spotSpacing: 0.8,
                layerSpacing: 0.5,
                proximalLayers: 1,
                distalLayers: 1
            },
            {
                id: 'beam-2',
                name: 'Beam 2',
                isocenter: 'ISO1',
                x: 1.42,
                y: -47.9,
                z: 29.02,
                expectedWeight: 0,
                actualWeightPercent: 53.85,
                rtv: '自动生成',
                spotSpacing: 0.8,
                layerSpacing: 0.5,
                proximalLayers: 1,
                distalLayers: 1
            }
        ];
    }

    normalizeBeam(id, b) {
        return {
            id,
            name: b.name ?? `Beam ${id}`,
            isocenter: b.isocenter ?? 'ISO1',
            x: b.x ?? 0,
            y: b.y ?? 0,
            z: b.z ?? 0,
            expectedWeight: b.expectedWeight ?? 0,
            actualWeightPercent: b.actualWeightPercent ?? 0,
            rtv: b.rtv ?? '自动生成',
            spotSpacing: b.spotSpacing ?? 0.8,
            layerSpacing: b.layerSpacing ?? 0.5,
            proximalLayers: b.proximalLayers ?? 1,
            distalLayers: b.distalLayers ?? 1
        };
    }

    ensureStyles() {
        const styleId = `${this.options.prefix}protonBeamOptSettingsStyles`;
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .proton-beam-opt-settings {
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
                font-family: inherit;
            }
            .proton-beam-opt-settings__wrap {
                flex: 1;
                overflow: auto;
                background: #070707;
            }
            .proton-beam-opt-settings__table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                min-width: 1400px;
                font-size: 12px;
            }
            .proton-beam-opt-settings__table thead th {
                position: sticky;
                top: 0;
                z-index: 2;
                background: #1a1a1a;
                color: #cfcfcf;
                font-weight: 500;
                border-bottom: 1px solid #333;
                border-right: 1px solid #2a2a2a;
                padding: 8px 10px;
                text-align: left;
                white-space: nowrap;
            }
            .proton-beam-opt-settings__table thead th:last-child {
                border-right: none;
            }
            .proton-beam-opt-settings__table tbody td {
                padding: 6px 10px;
                border-bottom: 1px solid #1f1f1f;
                border-right: 1px solid #252525;
                color: #e8e8e8;
                vertical-align: middle;
            }
            .proton-beam-opt-settings__table tbody td:last-child {
                border-right: none;
            }
            .proton-beam-opt-settings__table tbody tr {
                background: #060606;
            }
            .proton-beam-opt-settings__table tbody tr:hover {
                background: #0c0c0c;
            }
            .proton-beam-opt-settings__col-idx { width: 48px; color: #f0f0f0; }
            .proton-beam-opt-settings__col-name { color: #6ec8ff; }
            .proton-beam-opt-settings__col-iso { color: #e8a84a; }
            .proton-beam-opt-settings__col-num { color: #e8e8e8; }
            .proton-beam-opt-settings__col-distal { min-width: 120px; }
            .proton-beam-opt-settings__input {
                width: 100%;
                height: 26px;
                padding: 0 8px;
                box-sizing: border-box;
                background: #0e0e0e;
                border: 1px solid #2a2a2a;
                border-radius: 3px;
                color: #ddd;
                font-size: 12px;
                font-family: inherit;
                outline: none;
            }
            .proton-beam-opt-settings__input:focus {
                border-color: rgba(33, 161, 241, 0.55);
                box-shadow: 0 0 0 2px rgba(33, 161, 241, 0.12);
            }
            .proton-beam-opt-settings__input--wide {
                min-width: 72px;
            }
            .proton-beam-opt-settings__select {
                width: 100%;
                height: 26px;
                padding: 0 6px;
                box-sizing: border-box;
                background: #0e0e0e;
                border: 1px solid #2a2a2a;
                border-radius: 3px;
                color: #ddd;
                font-size: 12px;
                font-family: inherit;
                outline: none;
                cursor: pointer;
            }
            .proton-beam-opt-settings__select:focus {
                border-color: rgba(33, 161, 241, 0.55);
            }
        `;
        document.head.appendChild(style);
    }

    renderShell() {
        this.container.innerHTML = `
            <div class="proton-beam-opt-settings">
                <div class="proton-beam-opt-settings__wrap">
                    <table class="proton-beam-opt-settings__table" aria-label="质子射束优化设置">
                        <thead>
                            <tr>
                                <th class="proton-beam-opt-settings__col-idx">序号</th>
                                <th>名称</th>
                                <th>等中心</th>
                                <th>X [cm]</th>
                                <th>Y [cm]</th>
                                <th>Z [cm]</th>
                                <th>预期权重</th>
                                <th>预期权重百分比</th>
                                <th>实际权重百分比</th>
                                <th>RTV</th>
                                <th>束斑间距 [cm]</th>
                                <th>层间距 [cm]</th>
                                <th>近端层束斑</th>
                                <th>远端层束斑</th>
                            </tr>
                        </thead>
                        <tbody class="proton-beam-opt-settings__body"></tbody>
                    </table>
                </div>
            </div>
        `;
        this.tbody = this.container.querySelector('.proton-beam-opt-settings__body');
    }

    bindEvents() {
        if (!this.tbody) return;
        this.tbody.addEventListener('input', (e) => {
            const t = e.target;
            if (t.classList.contains('pbo-expected-weight')) this.handleExpectedWeightChange(t);
            else if (t.classList.contains('pbo-spot-spacing')) this.handleSpotSpacingChange(t);
            else if (t.classList.contains('pbo-layer-spacing')) this.handleLayerSpacingChange(t);
            else if (t.classList.contains('pbo-proximal')) this.handleProximalChange(t);
            else if (t.classList.contains('pbo-distal')) this.handleDistalChange(t);
        });
        this.tbody.addEventListener('change', (e) => {
            if (e.target.classList.contains('pbo-rtv')) this.handleRtvChange(e.target);
        });
    }

    loadBeamList() {
        let beams = [];
        if (typeof this.options.getBeamList === 'function') {
            beams = this.options.getBeamList() || [];
        }
        if (beams.length) {
            this.beamSettings.clear();
            beams.forEach((b) => {
                const id = String(b.id ?? b.name);
                this.beamSettings.set(id, this.normalizeBeam(id, b));
            });
        }
        this.refreshTable();
    }

    refreshTable() {
        if (!this.tbody) return;
        const beams = Array.from(this.beamSettings.values()).sort((a, b) => {
            const na = parseInt(String(a.id).replace(/\D/g, ''), 10);
            const nb = parseInt(String(b.id).replace(/\D/g, ''), 10);
            if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
            return String(a.id).localeCompare(String(b.id));
        });

        if (beams.length === 0) {
            this.tbody.innerHTML =
                '<tr><td colspan="14" style="text-align:center;padding:24px;color:#888;">暂无射束数据</td></tr>';
            return;
        }

        this.calculateExpectedWeightPercentages(beams);

        this.tbody.innerHTML = beams
            .map((beam, index) => {
                const expPct = beam.expectedWeightPercent === undefined ? '' : beam.expectedWeightPercent;
                return `
                <tr data-beam-id="${this.escapeAttr(beam.id)}">
                    <td class="proton-beam-opt-settings__col-idx">${index + 1}</td>
                    <td class="proton-beam-opt-settings__col-name">${this.escapeHtml(beam.name)}</td>
                    <td class="proton-beam-opt-settings__col-iso">${this.escapeHtml(beam.isocenter)}</td>
                    <td class="proton-beam-opt-settings__col-num">${this.formatNumber(beam.x, 2)}</td>
                    <td class="proton-beam-opt-settings__col-num">${this.formatNumber(beam.y, 2)}</td>
                    <td class="proton-beam-opt-settings__col-num">${this.formatNumber(beam.z, 2)}</td>
                    <td>
                        <input type="number" class="proton-beam-opt-settings__input pbo-expected-weight"
                            data-beam-id="${this.escapeAttr(beam.id)}"
                            value="${this.formatNumber(beam.expectedWeight, 2)}" min="0" max="100" step="0.01" />
                    </td>
                    <td class="proton-beam-opt-settings__col-num">${expPct}</td>
                    <td class="proton-beam-opt-settings__col-num">${this.formatNumber(beam.actualWeightPercent, 2)}</td>
                    <td>
                        <select class="proton-beam-opt-settings__select pbo-rtv" data-beam-id="${this.escapeAttr(beam.id)}">
                            ${this.renderRtvOptions(beam.rtv)}
                        </select>
                    </td>
                    <td>
                        <input type="number" class="proton-beam-opt-settings__input pbo-spot-spacing"
                            data-beam-id="${this.escapeAttr(beam.id)}"
                            value="${this.formatNumber(beam.spotSpacing, 2)}" min="0.1" step="0.01" />
                    </td>
                    <td>
                        <input type="number" class="proton-beam-opt-settings__input pbo-layer-spacing"
                            data-beam-id="${this.escapeAttr(beam.id)}"
                            value="${this.formatNumber(beam.layerSpacing, 2)}" min="0.1" step="0.01" />
                    </td>
                    <td>
                        <input type="number" class="proton-beam-opt-settings__input pbo-proximal"
                            data-beam-id="${this.escapeAttr(beam.id)}"
                            value="${beam.proximalLayers}" min="0" max="99" step="1" />
                    </td>
                    <td class="proton-beam-opt-settings__col-distal">
                        <input type="number" class="proton-beam-opt-settings__input proton-beam-opt-settings__input--wide pbo-distal"
                            data-beam-id="${this.escapeAttr(beam.id)}"
                            value="${beam.distalLayers}" min="0" max="99" step="1" />
                    </td>
                </tr>`;
            })
            .join('');
    }

    renderRtvOptions(selected) {
        const rows = [{ v: '自动生成', l: '自动生成' }];
        const extras = [...(this.options.rtvExtraOptions || [])];
        if (typeof this.options.getROIList === 'function') {
            (this.options.getROIList() || []).forEach((roi) => {
                const name = typeof roi === 'string' ? roi : roi.name || '';
                if (name && name !== '自动生成') extras.push(name);
            });
        }
        const seen = new Set(rows.map((r) => r.v));
        extras.forEach((name) => {
            if (seen.has(name)) return;
            seen.add(name);
            rows.push({ v: name, l: name });
        });
        const sel = String(selected);
        if (sel && !seen.has(sel)) {
            seen.add(sel);
            rows.push({ v: sel, l: sel });
        }
        return rows
            .map(
                (o) =>
                    `<option value="${this.escapeAttr(o.v)}"${o.v === sel ? ' selected' : ''}>${this.escapeHtml(
                        o.l
                    )}</option>`
            )
            .join('');
    }

    calculateExpectedWeightPercentages(beams) {
        const groups = new Map();
        beams.forEach((b) => {
            const k = b.isocenter || 'default';
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k).push(b);
        });
        groups.forEach((group) => {
            const total = group.reduce((s, b) => s + (Number(b.expectedWeight) || 0), 0);
            if (total <= 0) {
                group.forEach((b) => {
                    b.expectedWeightPercent = '';
                });
            } else {
                group.forEach((b) => {
                    const p = ((Number(b.expectedWeight) || 0) / total) * 100;
                    b.expectedWeightPercent = `${this.formatNumber(p, 2)}%`;
                });
            }
        });
    }

    handleExpectedWeightChange(input) {
        const beamId = input.dataset.beamId;
        let v = parseFloat(input.value);
        if (isNaN(v)) v = 0;
        v = Math.max(0, Math.min(100, v));
        input.value = this.formatNumber(v, 2);
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.expectedWeight = v;
            this.refreshTable();
            this.options.onSettingsChange(beamId, 'expectedWeight', v);
        }
    }

    handleRtvChange(select) {
        const beamId = select.dataset.beamId;
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.rtv = select.value;
            this.options.onSettingsChange(beamId, 'rtv', select.value);
        }
    }

    handleSpotSpacingChange(input) {
        const beamId = input.dataset.beamId;
        let v = parseFloat(input.value) || 0.1;
        v = Math.max(0.1, v);
        input.value = this.formatNumber(v, 2);
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.spotSpacing = v;
            this.options.onSettingsChange(beamId, 'spotSpacing', v);
        }
    }

    handleLayerSpacingChange(input) {
        const beamId = input.dataset.beamId;
        let v = parseFloat(input.value) || 0.1;
        v = Math.max(0.1, v);
        input.value = this.formatNumber(v, 2);
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.layerSpacing = v;
            this.options.onSettingsChange(beamId, 'layerSpacing', v);
        }
    }

    handleProximalChange(input) {
        const beamId = input.dataset.beamId;
        let v = parseInt(input.value, 10);
        if (isNaN(v)) v = 0;
        v = Math.max(0, Math.min(99, v));
        input.value = String(v);
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.proximalLayers = v;
            this.options.onSettingsChange(beamId, 'proximalLayers', v);
        }
    }

    handleDistalChange(input) {
        const beamId = input.dataset.beamId;
        let v = parseInt(input.value, 10);
        if (isNaN(v)) v = 0;
        v = Math.max(0, Math.min(99, v));
        input.value = String(v);
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.distalLayers = v;
            this.options.onSettingsChange(beamId, 'distalLayers', v);
        }
    }

    formatNumber(value, decimals) {
        if (value === undefined || value === null || Number.isNaN(Number(value))) return '';
        return Number(value).toFixed(decimals);
    }

    escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    escapeAttr(s) {
        return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    getAllSettings() {
        return Array.from(this.beamSettings.values());
    }

    getBeamSettings(beamId) {
        return this.beamSettings.get(String(beamId));
    }

    setBeamSettings(beamId, settings) {
        const id = String(beamId);
        const cur = this.beamSettings.get(id);
        if (cur) {
            Object.assign(cur, settings);
            this.refreshTable();
        }
    }
}

if (typeof window !== 'undefined') {
    window.ProtonBeamOptimizationSettingsComponent = ProtonBeamOptimizationSettingsComponent;
}
