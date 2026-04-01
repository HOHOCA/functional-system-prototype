/**
 * Proton Energy Layer List Component (PBS)
 * - 只读展示：某个射束内的能量层表格（原型数据可对齐产品截图）
 *
 * Columns:
 * 1) 序号（0 起，与截图一致）
 * 2) 能量[MeV]
 * 3) MU
 * 4) 权重[%]（展示为 0.02 形式）
 * 5) 束斑数量（强调色）
 * 6) 最小束斑跳数[MU/fx]
 * 7) 最大束斑跳数[MU/fx]
 * 8) 扫描次数
 */
(function (global) {
    if (!global) return;

    /** 截图中表格前 8 行（序号 0–7） */
    const DEMO_LAYERS_FROM_SCREENSHOT = [
        { index: 0, energyMeV: 174.42, mu: 7.6302, weightPercent: 0.02, spotCount: 1, minSpotJump: 7.6302, maxSpotJump: 7.6302, scanCount: 1 },
        { index: 1, energyMeV: 171.95, mu: 15.9167, weightPercent: 0.04, spotCount: 2, minSpotJump: 7.8096, maxSpotJump: 8.1071, scanCount: 1 },
        { index: 2, energyMeV: 169.43, mu: 15.6492, weightPercent: 0.04, spotCount: 2, minSpotJump: 7.7730, maxSpotJump: 7.8762, scanCount: 1 },
        { index: 3, energyMeV: 166.92, mu: 40.4931, weightPercent: 0.11, spotCount: 4, minSpotJump: 6.9754, maxSpotJump: 15.8094, scanCount: 1 },
        { index: 4, energyMeV: 164.39, mu: 57.9033, weightPercent: 0.16, spotCount: 7, minSpotJump: 6.0177, maxSpotJump: 10.6621, scanCount: 1 },
        { index: 5, energyMeV: 161.82, mu: 69.4574, weightPercent: 0.20, spotCount: 8, minSpotJump: 4.4249, maxSpotJump: 13.3646, scanCount: 1 },
        { index: 6, energyMeV: 159.22, mu: 129.3881, weightPercent: 0.37, spotCount: 14, minSpotJump: 5.9624, maxSpotJump: 16.2839, scanCount: 1 },
        { index: 7, energyMeV: 156.59, mu: 211.5749, weightPercent: 0.60, spotCount: 18, minSpotJump: 5.1874, maxSpotJump: 35.8997, scanCount: 1 }
    ];

    /** 截图顶部汇总（与整束统计一致；表格仅展示前若干行） */
    const DEMO_SUMMARY_FROM_SCREENSHOT = {
        energyLayerTotal: 35,
        spotCountTotal: 3402,
        minSpotMu: 2.0001,
        maxSpotMu: 124.9409
    };

    /** 前 8 行与截图一致；第 9–35 行为原型补轨，与「能量层总计: 35」一致 */
    function buildDemoLayers35() {
        const out = DEMO_LAYERS_FROM_SCREENSHOT.map(row => ({ ...row }));
        const lastShot = out[out.length - 1];
        let lastEnergy = lastShot.energyMeV;
        for (let i = 8; i < 35; i++) {
            const step = i - 7;
            lastEnergy = Number((lastEnergy - 2.18 - (step % 4) * 0.07).toFixed(2));
            const mu = Number((195.0 - step * 4.85 + (step % 3) * 0.02).toFixed(4));
            const weightPercent = Number(Math.min(5.99, 0.62 + step * 0.155).toFixed(2));
            const spotCount = Math.max(1, 20 + step * 11 + (step % 6) * 3);
            const minSpotJump = Number((2.8 + (step % 9) * 0.42 + step * 0.03).toFixed(4));
            const maxSpotJump = Number((minSpotJump + 12 + (step % 13) * 1.1).toFixed(4));
            out.push({
                index: i,
                energyMeV: lastEnergy,
                mu,
                weightPercent,
                spotCount,
                minSpotJump,
                maxSpotJump,
                scanCount: 1
            });
        }
        return out;
    }

    const DEMO_LAYERS_DEFAULT = buildDemoLayers35();

    class ProtonEnergyLayerListComponentPBS {
        constructor(containerId, options = {}) {
            this.containerId = containerId;
            this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;

            // 注意：末尾 ...options 可能传入 layers: undefined，会覆盖前面的默认数组，导致 tbody 为空。
            this.options = {
                prefix: options.prefix || '',
                beamName: options.beamName || 'Beam 1',
                beamOptions: Array.isArray(options.beamOptions) ? options.beamOptions : ['Beam 1', 'Beam 2'],
                summary: options.summary != null ? options.summary : { ...DEMO_SUMMARY_FROM_SCREENSHOT },
                layers: Array.isArray(options.layers) ? options.layers : DEMO_LAYERS_DEFAULT.slice(),
                onBeamChange: typeof options.onBeamChange === 'function' ? options.onBeamChange : null,
                ...options
            };
            if (!Array.isArray(this.options.layers)) {
                this.options.layers = DEMO_LAYERS_DEFAULT.slice();
            }
            if (this.options.summary == null || typeof this.options.summary !== 'object') {
                this.options.summary = { ...DEMO_SUMMARY_FROM_SCREENSHOT };
            }

            if (!this.container) {
                // eslint-disable-next-line no-console
                console.error('ProtonEnergyLayerListComponentPBS: 容器不存在', containerId);
                return;
            }

            this.ensureStyles();
            this.render();
            this.bindToolbar();
            this.renderRows();
        }

        setBeam({ beamName, beamOptions, layers, summary } = {}) {
            if (typeof beamName === 'string') this.options.beamName = beamName;
            if (Array.isArray(beamOptions)) this.options.beamOptions = beamOptions;
            if (Array.isArray(layers)) this.options.layers = layers;
            if (summary != null) this.options.summary = summary;
            this.syncBeamSelect();
            this.renderSummary();
            this.renderRows();
        }

        setLayers(layers) {
            this.options.layers = Array.isArray(layers) ? layers : [];
            this.renderRows();
        }

        ensureStyles() {
            const styleId = `${this.options.prefix}protonEnergyLayerListStyles`;
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .proton-energy-layer-list {
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

                .pel-toolbar {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px 24px;
                    padding: 8px 10px;
                    background: #141414;
                    border-bottom: 1px solid #2a2a2a;
                    flex-shrink: 0;
                }

                .pel-toolbar-beam {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #cfcfcf;
                }

                .pel-toolbar-beam label {
                    white-space: nowrap;
                    color: #9ca3af;
                }

                .pel-beam-select {
                    min-width: 120px;
                    height: 24px;
                    padding: 0 22px 0 8px;
                    border-radius: 3px;
                    border: 1px solid #3a3a3a;
                    background: #0e0e0e;
                    color: #e5e7eb;
                    font-size: 12px;
                    font-family: inherit;
                    appearance: none;
                    background-image:
                        linear-gradient(45deg, transparent 50%, #777 50%),
                        linear-gradient(135deg, #777 50%, transparent 50%);
                    background-position:
                        calc(100% - 11px) 9px,
                        calc(100% - 6px) 9px;
                    background-size: 5px 5px, 5px 5px;
                    background-repeat: no-repeat;
                    outline: none;
                }

                .pel-beam-select:focus {
                    border-color: rgba(74, 158, 255, 0.55);
                }

                .pel-toolbar-stats {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 20px;
                    color: #cfcfcf;
                }

                .pel-toolbar-stats span {
                    white-space: nowrap;
                }

                .pel-toolbar-stats strong {
                    font-weight: 600;
                    color: #e5e7eb;
                }

                .proton-energy-layer-list-table-wrap {
                    flex: 1;
                    overflow: auto;
                    background: #070707;
                }

                .proton-energy-layer-list-table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    min-width: 1100px;
                    font-size: 12px;
                }

                .proton-energy-layer-list-table thead th {
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

                .proton-energy-layer-list-table tbody td {
                    padding: 8px 10px;
                    border-bottom: 1px solid #1f1f1f;
                    color: #d9d9d9;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .proton-energy-layer-list-table tbody tr {
                    background: #060606;
                }

                .proton-energy-layer-list-table tbody tr:hover {
                    background: #0f0f0f;
                }

                .pel-col-index {
                    width: 56px;
                    min-width: 56px;
                    text-align: left;
                    color: #bdbdbd;
                }

                .pel-num {
                    text-align: left;
                }

                .pel-spot {
                    color: #4a9eff;
                    font-weight: 500;
                }

                .pel-empty {
                    padding: 36px 10px;
                    text-align: center;
                    color: #888;
                }
            `;
            document.head.appendChild(style);
        }

        render() {
            const sum = this.options.summary || DEMO_SUMMARY_FROM_SCREENSHOT;
            const beamOpts = this.options.beamOptions;
            const sel = (beamOpts || [])
                .map(b => {
                    const selected = String(b) === String(this.options.beamName) ? ' selected' : '';
                    return `<option value="${this.escapeAttr(b)}"${selected}>${this.escapeHtml(b)}</option>`;
                })
                .join('');

            this.container.innerHTML = `
                <div class="proton-energy-layer-list">
                    <div class="pel-toolbar">
                        <div class="pel-toolbar-beam">
                            <label for="${this.options.prefix}pelBeamSelect">射束</label>
                            <select id="${this.options.prefix}pelBeamSelect" class="pel-beam-select" aria-label="射束" title="射束">
                                ${sel}
                            </select>
                        </div>
                        <div class="pel-toolbar-stats" data-role="pel-summary-stats">
                            <span>能量层总计: <strong data-role="pel-stat-layers">${this.escapeHtml(sum.energyLayerTotal)}</strong></span>
                            <span>束斑数量总计: <strong data-role="pel-stat-spots">${this.escapeHtml(sum.spotCountTotal)}</strong></span>
                            <span>最小束斑跳数/最大束斑跳数: <strong data-role="pel-stat-minmax">${this.escapeHtml(`${sum.minSpotMu}/${sum.maxSpotMu}`)}</strong></span>
                        </div>
                    </div>
                    <div class="proton-energy-layer-list-table-wrap">
                        <table class="proton-energy-layer-list-table" id="${this.options.prefix}protonEnergyLayerTable">
                            <thead>
                                <tr>
                                    <th class="pel-col-index">序号</th>
                                    <th style="width: 110px;">能量[MeV]</th>
                                    <th style="width: 110px;">MU</th>
                                    <th style="width: 90px;">权重[%]</th>
                                    <th style="width: 100px;">束斑数量</th>
                                    <th style="width: 170px;">最小束斑跳数[MU/fx]</th>
                                    <th style="width: 170px;">最大束斑跳数[MU/fx]</th>
                                    <th style="width: 100px;">扫描次数</th>
                                </tr>
                            </thead>
                            <tbody id="${this.options.prefix}protonEnergyLayerTableBody"></tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        bindToolbar() {
            const sel = this.container.querySelector(`#${this.options.prefix}pelBeamSelect`);
            if (!sel) return;
            sel.addEventListener('change', () => {
                this.options.beamName = sel.value;
                if (this.options.onBeamChange) {
                    this.options.onBeamChange(sel.value);
                }
            });
        }

        syncBeamSelect() {
            const sel = this.container.querySelector(`#${this.options.prefix}pelBeamSelect`);
            if (!sel) return;
            const html = (this.options.beamOptions || [])
                .map(b => {
                    const selected = String(b) === String(this.options.beamName) ? ' selected' : '';
                    return `<option value="${this.escapeAttr(b)}"${selected}>${this.escapeHtml(b)}</option>`;
                })
                .join('');
            sel.innerHTML = html;
        }

        renderSummary() {
            const sum = this.options.summary || {};
            const layersEl = this.container.querySelector('[data-role="pel-stat-layers"]');
            const spotsEl = this.container.querySelector('[data-role="pel-stat-spots"]');
            const minmaxEl = this.container.querySelector('[data-role="pel-stat-minmax"]');
            if (layersEl) layersEl.textContent = sum.energyLayerTotal ?? '';
            if (spotsEl) spotsEl.textContent = sum.spotCountTotal ?? '';
            if (minmaxEl) minmaxEl.textContent = `${sum.minSpotMu ?? ''}/${sum.maxSpotMu ?? ''}`;
        }

        renderRows() {
            const tbody = this.container.querySelector(`#${this.options.prefix}protonEnergyLayerTableBody`);
            if (!tbody) return;

            const layers = Array.isArray(this.options.layers) ? this.options.layers : [];
            if (!layers.length) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="pel-empty">暂无能量层数据</td>
                    </tr>
                `;
                return;
            }

            const fmt = (v, digits = 4) => {
                const n = typeof v === 'number' ? v : Number.parseFloat(String(v ?? '').trim());
                if (!Number.isFinite(n)) return String(v ?? '');
                return n.toFixed(digits);
            };

            const fmtWeight = (v) => {
                const n = typeof v === 'number' ? v : Number.parseFloat(String(v ?? '').trim());
                if (!Number.isFinite(n)) return String(v ?? '');
                return n.toFixed(2);
            };

            tbody.innerHTML = layers
                .map((l, i) => {
                    const idx = l.index != null ? l.index : (l.rowIndex != null ? l.rowIndex : i);
                    return `
                    <tr>
                        <td class="pel-col-index">${idx != null ? idx : ''}</td>
                        <td class="pel-num" title="${this.escapeAttr(l.energyMeV)}">${this.escapeHtml(fmt(l.energyMeV, 2))}</td>
                        <td class="pel-num" title="${this.escapeAttr(l.mu)}">${this.escapeHtml(fmt(l.mu, 4))}</td>
                        <td class="pel-num" title="${this.escapeAttr(l.weightPercent)}">${this.escapeHtml(fmtWeight(l.weightPercent))}</td>
                        <td class="pel-num pel-spot" title="${this.escapeAttr(l.spotCount)}">${this.escapeHtml(l.spotCount ?? '')}</td>
                        <td class="pel-num" title="${this.escapeAttr(l.minSpotJump)}">${this.escapeHtml(fmt(l.minSpotJump, 4))}</td>
                        <td class="pel-num" title="${this.escapeAttr(l.maxSpotJump)}">${this.escapeHtml(fmt(l.maxSpotJump, 4))}</td>
                        <td class="pel-num" title="${this.escapeAttr(l.scanCount)}">${this.escapeHtml(l.scanCount ?? '')}</td>
                    </tr>
                `;
                })
                .join('');
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

    global.ProtonEnergyLayerListComponentPBS = ProtonEnergyLayerListComponentPBS;
})(typeof window !== 'undefined' ? window : undefined);
