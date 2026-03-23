/**
 * 4DCT-场景列表：12 个基础场景 × 4 时相 = 48 行；行顺序为先全部 MIP（12 行），再 20%、50%、80%。
 */
class FourDCTScenarioListComponent {
    /** 时相列取值顺序（与基础场景做笛卡尔积） */
    static PHASE_LABELS = ['MIP', '20%', '50%', '80%'];

    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            prefix: options.prefix || '',
            groupName: options.groupName != null ? String(options.groupName) : '1',
            positioningUncertainty: options.positioningUncertainty != null ? String(options.positioningUncertainty) : '0.50',
            robustnessResultCount: options.robustnessResultCount != null ? options.robustnessResultCount : null,
            /** 基础场景列表（不含时相），默认 12 条；内部展开为 48 行 */
            scenarios: Array.isArray(options.scenarios) ? options.scenarios : null,
            /** 展开表中的选中行索引（0～47）；默认 3 对应「MIP 块内第 4 个基础场景」 */
            initialIndex: Number.isInteger(options.initialIndex) ? options.initialIndex : 3,
            onScenarioChange: options.onScenarioChange || null,
            ...options
        };

        this._defaultScenarios = FourDCTScenarioListComponent.createDemoScenarios();
        const maxIdx = Math.max(0, this._expandedRowCount() - 1);
        this._currentIndex = Math.max(0, Math.min(maxIdx, this.options.initialIndex));

        this.init();
    }

    _expandedRowCount() {
        return this._getScenarios().length * FourDCTScenarioListComponent.PHASE_LABELS.length;
    }

    /**
     * 将基础场景展开为行：先排完所有 MIP，再 20%、50%、80%（每段内按基础场景顺序）
     */
    _getExpandedRows() {
        const base = this._getScenarios();
        const phases = FourDCTScenarioListComponent.PHASE_LABELS;
        const rows = [];
        phases.forEach((phaseLabel) => {
            base.forEach((s, scenarioIdx) => {
                rows.push({
                    ...s,
                    phase: phaseLabel,
                    scenarioIndex: scenarioIdx,
                    baseIndex: s.index != null ? s.index : scenarioIdx + 1
                });
            });
        });
        return rows;
    }

    static createDemoScenarios() {
        const rows = [
            { rl: 0.5, is: 0.5, pa: 0.5, densityPct: 3.5 },
            { rl: 0.5, is: 0.0, pa: -0.5, densityPct: -3.5 },
            { rl: 0.0, is: 0.5, pa: 0.5, densityPct: 2.8 },
            { rl: 0.5, is: -0.5, pa: 0.0, densityPct: 3.5 },
            { rl: -0.5, is: 0.5, pa: 0.5, densityPct: -2.2 },
            { rl: 0.0, is: 0.0, pa: 0.5, densityPct: 1.9 },
            { rl: 0.5, is: 0.5, pa: -0.5, densityPct: -1.5 },
            { rl: -0.5, is: -0.5, pa: 0.5, densityPct: 2.1 },
            { rl: 0.0, is: -0.5, pa: -0.5, densityPct: -2.9 },
            { rl: -0.5, is: 0.0, pa: 0.0, densityPct: 0.8 },
            { rl: 0.25, is: 0.25, pa: 0.25, densityPct: -0.5 },
            { rl: -0.25, is: -0.25, pa: -0.25, densityPct: 4.0 }
        ];
        return rows.map((r, i) => ({
            index: i + 1,
            rl: r.rl,
            is: r.is,
            pa: r.pa,
            densityPct: r.densityPct
        }));
    }

    _getScenarios() {
        return this.options.scenarios && this.options.scenarios.length
            ? this.options.scenarios
            : this._defaultScenarios;
    }

    _formatAxis(v) {
        const n = Number(v);
        if (Number.isNaN(n)) return '—';
        return n.toFixed(2);
    }

    _formatDensity(v) {
        const n = Number(v);
        if (Number.isNaN(n)) return '—';
        const s = n.toFixed(2);
        return n > 0 ? s : s;
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

    init() {
        this.render();
        this.bindEvents();
    }

    getSelectedScenario() {
        const list = this._getExpandedRows();
        return list[this._currentIndex] || null;
    }

    /** 当前选中的基础场景索引（0～11） */
    getBaseScenarioIndex() {
        const row = this.getSelectedScenario();
        return row ? row.scenarioIndex : -1;
    }

    getScenarioIndex() {
        return this._currentIndex;
    }

    setScenarioIndex(index, silent) {
        const list = this._getExpandedRows();
        if (!list.length) return;
        const i = Math.max(0, Math.min(list.length - 1, index));
        if (i === this._currentIndex) return;
        this._currentIndex = i;
        this.render();
        this.bindEvents();
        if (!silent && typeof this.options.onScenarioChange === 'function') {
            this.options.onScenarioChange(i, this.getSelectedScenario());
        }
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const scenarios = this._getExpandedRows();
        const total = scenarios.length;
        const idx = Math.min(this._currentIndex, Math.max(0, total - 1));
        const current = scenarios[idx];
        const densitySummary = current ? this._formatDensity(current.densityPct) : '—';
        const posU = this._escapeHtml(this.options.positioningUncertainty);
        const robustCount =
            this.options.robustnessResultCount != null
                ? this.options.robustnessResultCount
                : total;
        const groupName = this._escapeHtml(this.options.groupName);
        const prefix = this.options.prefix;

        const tableRows = scenarios
            .map((row, rowIdx) => {
                const selected = rowIdx === idx;
                const num = rowIdx + 1;
                return `
                <tr class="scenario-list-row ${selected ? 'scenario-list-row--selected' : ''}" data-row-index="${rowIdx}" role="button" tabindex="0">
                    <td>${this._escapeHtml(String(num))}</td>
                    <td>${this._escapeHtml(this._formatAxis(row.rl))}</td>
                    <td>${this._escapeHtml(this._formatAxis(row.is))}</td>
                    <td>${this._escapeHtml(this._formatAxis(row.pa))}</td>
                    <td>${this._escapeHtml(this._formatDensity(row.densityPct))}</td>
                    <td>${this._escapeHtml(String(row.phase))}</td>
                </tr>`;
            })
            .join('');

        const navLabel = total > 0 ? `${idx + 1}/${total}` : '0/0';

        container.innerHTML = `
            <div class="scenario-list-card">
                <div class="scenario-list-title">场景列表</div>
                <div class="scenario-list-head">
                    <div class="scenario-list-group">组名：<span class="scenario-list-group-val">${groupName}</span></div>
                    <div class="scenario-list-nav" role="group" aria-label="场景切换">
                        <span class="scenario-list-nav-label">场景：</span>
                        <button type="button" class="scenario-list-nav-btn scenario-list-nav-btn--prev" id="${prefix}scenario-prev" aria-label="上一场景" ${total < 2 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-left" aria-hidden="true"></i>
                        </button>
                        <span class="scenario-list-nav-counter" id="${prefix}scenario-counter">${this._escapeHtml(navLabel)}</span>
                        <button type="button" class="scenario-list-nav-btn scenario-list-nav-btn--next" id="${prefix}scenario-next" aria-label="下一场景" ${total < 2 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-right" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="scenario-list-metrics">
                    <div class="scenario-list-metric">
                        <span class="scenario-list-metric-value">${this._escapeHtml(densitySummary)}%</span>
                        <span class="scenario-list-metric-label">密度不确定性</span>
                    </div>
                    <div class="scenario-list-metric">
                        <span class="scenario-list-metric-value">${posU}</span>
                        <span class="scenario-list-metric-label">摆位不确定性</span>
                    </div>
                    <div class="scenario-list-metric">
                        <span class="scenario-list-metric-value">${this._escapeHtml(String(robustCount))}</span>
                        <span class="scenario-list-metric-label">鲁棒性结果</span>
                    </div>
                </div>
                <div class="scenario-list-table-wrap">
                    <table class="scenario-list-table" role="grid">
                        <thead>
                            <tr>
                                <th scope="col">序号</th>
                                <th scope="col">R-L</th>
                                <th scope="col">I-S</th>
                                <th scope="col">P-A</th>
                                <th scope="col">密度不确定性[%]</th>
                                <th scope="col">时相</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const prev = container.querySelector(`#${this.options.prefix}scenario-prev`);
        const next = container.querySelector(`#${this.options.prefix}scenario-next`);

        if (prev) {
            prev.addEventListener('click', () => this.setScenarioIndex(this._currentIndex - 1));
        }
        if (next) {
            next.addEventListener('click', () => this.setScenarioIndex(this._currentIndex + 1));
        }

        container.querySelectorAll('.scenario-list-row').forEach((tr) => {
            tr.addEventListener('click', () => {
                const i = parseInt(tr.getAttribute('data-row-index'), 10);
                if (!Number.isNaN(i)) this.setScenarioIndex(i);
            });
            tr.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const i = parseInt(tr.getAttribute('data-row-index'), 10);
                    if (!Number.isNaN(i)) this.setScenarioIndex(i);
                }
            });
        });
    }

    setScenarios(scenarios, selectIndex) {
        this.options.scenarios = scenarios;
        const expandedMax = Math.max(0, this._expandedRowCount() - 1);
        if (Number.isInteger(selectIndex)) {
            this._currentIndex = Math.max(0, Math.min(expandedMax, selectIndex));
        } else {
            this._currentIndex = Math.min(this._currentIndex, expandedMax);
        }
        this.render();
        this.bindEvents();
    }

    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

window.FourDCTScenarioListComponent = FourDCTScenarioListComponent;
