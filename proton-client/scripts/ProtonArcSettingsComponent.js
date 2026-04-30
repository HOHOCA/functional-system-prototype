/**
 * 质子-Arc设置：PBS Arc 技术下的射束级 Arc 参数原型表格。
 */
class ProtonArcSettingsComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        this.options = {
            prefix: options.prefix || '',
            getBeamList: options.getBeamList || null,
            onSettingsChange: options.onSettingsChange || (() => {}),
            typeOptions: Array.isArray(options.typeOptions) && options.typeOptions.length ? options.typeOptions : ['Static'],
            ...options
        };

        this.arcSettings = new Map();
        this.initData(options.beams);

        if (!this.container) {
            console.error('ProtonArcSettingsComponent: 容器不存在', containerId);
            return;
        }

        this.ensureStyles();
        this.renderShell();
        this.bindEvents();
        this.loadBeamList();
    }

    initData(beamsOption) {
        const beams = Array.isArray(beamsOption) && beamsOption.length ? beamsOption : this.getDemoBeams();
        beams.forEach((beam) => {
            const id = String(beam.id ?? beam.name);
            this.arcSettings.set(id, this.normalizeBeam(id, beam));
        });
    }

    getDemoBeams() {
        return [
            {
                id: 'beam-arc-1',
                name: 'Beam 1',
                type: 'Static',
                subFieldCount: this.getRandomSubFieldCount()
            },
            {
                id: 'beam-arc-2',
                name: 'Beam 2',
                type: 'Static',
                subFieldCount: this.getRandomSubFieldCount()
            }
        ];
    }

    normalizeBeam(id, beam = {}) {
        const current = this.arcSettings.get(id);
        return {
            id,
            name: beam.name ?? current?.name ?? `Beam ${id}`,
            type: beam.type ?? beam.arcType ?? current?.type ?? 'Static',
            subFieldCount: this.normalizeSubFieldCount(
                beam.subFieldCount ?? beam.subFields ?? beam.spotCount ?? current?.subFieldCount ?? this.getRandomSubFieldCount()
            )
        };
    }

    getRandomSubFieldCount() {
        return Math.floor(Math.random() * 8) + 1;
    }

    normalizeSubFieldCount(value) {
        const n = parseInt(value, 10);
        if (!Number.isFinite(n)) return 1;
        return Math.max(1, n);
    }

    ensureStyles() {
        const styleId = `${this.options.prefix}protonArcSettingsStyles`;
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .proton-arc-settings {
                width: 100%;
                height: 100%;
                min-height: 0;
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
            .proton-arc-settings__wrap {
                flex: 1 1 0;
                min-height: 0;
                overflow: auto;
                background: #070707;
            }
            .proton-arc-settings__table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                min-width: 560px;
                font-size: 12px;
            }
            .proton-arc-settings__table thead th {
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
            .proton-arc-settings__table thead th:last-child,
            .proton-arc-settings__table tbody td:last-child {
                border-right: none;
            }
            .proton-arc-settings__table tbody tr {
                background: #060606;
            }
            .proton-arc-settings__table tbody tr:hover {
                background: #0f0f0f;
            }
            .proton-arc-settings__table tbody td {
                padding: 7px 10px;
                border-bottom: 1px solid #1f1f1f;
                border-right: 1px solid #252525;
                color: #e8e8e8;
                vertical-align: middle;
            }
            .proton-arc-settings__col-index {
                width: 64px;
                color: #bdbdbd;
                text-align: center;
            }
            .proton-arc-settings__col-name {
                color: #6ec8ff;
            }
            .proton-arc-settings__control {
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
            .proton-arc-settings__control:focus {
                border-color: rgba(33, 161, 241, 0.55);
                box-shadow: 0 0 0 2px rgba(33, 161, 241, 0.12);
            }
            select.proton-arc-settings__control {
                appearance: none;
                background-image:
                    linear-gradient(45deg, transparent 50%, #777 50%),
                    linear-gradient(135deg, #777 50%, transparent 50%);
                background-position:
                    calc(100% - 14px) 10px,
                    calc(100% - 9px) 10px;
                background-size: 5px 5px, 5px 5px;
                background-repeat: no-repeat;
                padding-right: 24px;
                cursor: pointer;
            }
            .proton-arc-settings__empty {
                text-align: center;
                padding: 24px;
                color: #888;
            }
        `;
        document.head.appendChild(style);
    }

    renderShell() {
        this.container.innerHTML = `
            <div class="proton-arc-settings">
                <div class="proton-arc-settings__wrap">
                    <table class="proton-arc-settings__table" aria-label="质子Arc设置">
                        <thead>
                            <tr>
                                <th class="proton-arc-settings__col-index">序号</th>
                                <th>名称</th>
                                <th>类型</th>
                                <th>子野数</th>
                            </tr>
                        </thead>
                        <tbody class="proton-arc-settings__body"></tbody>
                    </table>
                </div>
            </div>
        `;
        this.tbody = this.container.querySelector('.proton-arc-settings__body');
    }

    bindEvents() {
        if (!this.tbody) return;
        this.tbody.addEventListener('change', (event) => {
            const target = event.target;
            if (target.classList.contains('pas-type')) this.handleTypeChange(target);
            if (target.classList.contains('pas-sub-field-count')) this.handleSubFieldCountChange(target);
        });
        this.tbody.addEventListener('input', (event) => {
            const target = event.target;
            if (target.classList.contains('pas-sub-field-count')) this.handleSubFieldCountChange(target);
        });
    }

    loadBeamList() {
        if (typeof this.options.getBeamList === 'function') {
            const beams = this.options.getBeamList() || [];
            if (beams.length) {
                const next = new Map();
                beams.forEach((beam) => {
                    const id = String(beam.id ?? beam.name);
                    next.set(id, this.normalizeBeam(id, beam));
                });
                this.arcSettings = next;
            }
        }
        this.refreshTable();
    }

    refreshTable() {
        if (!this.tbody) return;
        const rows = Array.from(this.arcSettings.values());
        if (!rows.length) {
            this.tbody.innerHTML = '<tr><td colspan="4" class="proton-arc-settings__empty">暂无 Arc 设置数据</td></tr>';
            return;
        }

        this.tbody.innerHTML = rows
            .map((beam, index) => {
                return `
                    <tr data-beam-id="${this.escapeAttr(beam.id)}">
                        <td class="proton-arc-settings__col-index">${index + 1}</td>
                        <td class="proton-arc-settings__col-name">${this.escapeHtml(beam.name)}</td>
                        <td>
                            <select class="proton-arc-settings__control pas-type" data-beam-id="${this.escapeAttr(beam.id)}">
                                ${this.renderTypeOptions(beam.type)}
                            </select>
                        </td>
                        <td>
                            <input type="number" class="proton-arc-settings__control pas-sub-field-count"
                                data-beam-id="${this.escapeAttr(beam.id)}"
                                value="${this.escapeAttr(beam.subFieldCount)}" min="1" step="1" />
                        </td>
                    </tr>
                `;
            })
            .join('');
    }

    renderTypeOptions(selected) {
        const selectedValue = String(selected || 'Static');
        return this.options.typeOptions
            .map((type) => {
                const value = String(type);
                return `<option value="${this.escapeAttr(value)}"${value === selectedValue ? ' selected' : ''}>${this.escapeHtml(value)}</option>`;
            })
            .join('');
    }

    handleTypeChange(select) {
        const beam = this.arcSettings.get(select.dataset.beamId);
        if (!beam) return;
        beam.type = select.value;
        this.options.onSettingsChange(beam.id, 'type', beam.type, { ...beam });
    }

    handleSubFieldCountChange(input) {
        const beam = this.arcSettings.get(input.dataset.beamId);
        if (!beam) return;
        const value = this.normalizeSubFieldCount(input.value);
        beam.subFieldCount = value;
        input.value = String(value);
        this.options.onSettingsChange(beam.id, 'subFieldCount', value, { ...beam });
    }

    getAllSettings() {
        return Array.from(this.arcSettings.values()).map((beam) => ({ ...beam }));
    }

    getBeamSettings(beamId) {
        const beam = this.arcSettings.get(String(beamId));
        return beam ? { ...beam } : null;
    }

    setBeamSettings(beamId, settings = {}) {
        const id = String(beamId);
        const current = this.arcSettings.get(id);
        if (!current) return;
        Object.assign(current, settings);
        current.subFieldCount = this.normalizeSubFieldCount(current.subFieldCount);
        this.refreshTable();
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    escapeAttr(value) {
        return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }
}

if (typeof window !== 'undefined') {
    window.ProtonArcSettingsComponent = ProtonArcSettingsComponent;
}
