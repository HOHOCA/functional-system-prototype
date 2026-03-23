/**
 * 场景列表 — 鲁棒性场景明细表：组名、场景分页、汇总指标、R-L/I-S/P-A 与密度不确定性表格
 */
class ScenarioListComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            prefix: options.prefix || '',
            groupName: options.groupName != null ? String(options.groupName) : '1',
            /** 摆位不确定性（汇总区展示，可与业务约定为组级或当前场景） */
            positioningUncertainty: options.positioningUncertainty != null ? String(options.positioningUncertainty) : '0.50',
            /** 鲁棒性结果数量（通常为场景总数） */
            robustnessResultCount: options.robustnessResultCount != null ? options.robustnessResultCount : null,
            scenarios: Array.isArray(options.scenarios) ? options.scenarios : null,
            /** 初始选中场景索引（0-based） */
            initialIndex: Number.isInteger(options.initialIndex) ? options.initialIndex : 3,
            onScenarioChange: options.onScenarioChange || null,
            ...options
        };

        this._defaultScenarios = ScenarioListComponent.createDemoScenarios();
        this._currentIndex = Math.max(
            0,
            Math.min(
                this._getScenarios().length - 1,
                this.options.initialIndex
            )
        );

        this.init();
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
        const list = this._getScenarios();
        return list[this._currentIndex] || null;
    }

    getScenarioIndex() {
        return this._currentIndex;
    }

    setScenarioIndex(index, silent) {
        const list = this._getScenarios();
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

        const scenarios = this._getScenarios();
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
                const num = row.index != null ? row.index : rowIdx + 1;
                return `
                <tr class="scenario-list-row ${selected ? 'scenario-list-row--selected' : ''}" data-row-index="${rowIdx}" role="button" tabindex="0">
                    <td>${this._escapeHtml(String(num))}</td>
                    <td>${this._escapeHtml(this._formatAxis(row.rl))}</td>
                    <td>${this._escapeHtml(this._formatAxis(row.is))}</td>
                    <td>${this._escapeHtml(this._formatAxis(row.pa))}</td>
                    <td>${this._escapeHtml(this._formatDensity(row.densityPct))}</td>
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
        if (Number.isInteger(selectIndex)) {
            this._currentIndex = selectIndex;
        } else {
            this._currentIndex = Math.min(this._currentIndex, Math.max(0, scenarios.length - 1));
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

window.ScenarioListComponent = ScenarioListComponent;
