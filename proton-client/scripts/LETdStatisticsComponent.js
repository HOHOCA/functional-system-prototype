// LETd统计组件（质子）
// - 复用 shared/styles/styles.css 中 .dose-stats-* 样式体系
// - 提供「全部统计 / ROI统计」两张表，并支持外部更新数据
class LETdStatisticsComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            getGlobalStats: options.getGlobalStats || null,
            getRoiStats: options.getRoiStats || null,
            ...options
        };

        this.currentStatsType = 'global'; // 'global' | 'roi'
        this.globalStats = [];
        this.roiStats = [];

        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.loadData();
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const radioName = `letdStatsType-${this.containerId}`;

        container.innerHTML = `
            <div class="dose-statistics-component">
                <div class="dose-stats-type-selector">
                    <label class="dose-stats-radio">
                        <input type="radio" name="${radioName}" value="global" checked>
                        <span>全部统计</span>
                    </label>
                    <label class="dose-stats-radio">
                        <input type="radio" name="${radioName}" value="roi">
                        <span>ROI统计</span>
                    </label>
                </div>

                <div class="dose-stats-content-item active" id="${this.containerId}-globalStatsContent">
                    <div class="dose-stats-table-wrapper">
                        <table class="dose-stats-table" id="${this.containerId}-globalStatsTable">
                            <thead>
                                <tr>
                                    <th>显示</th>
                                    <th>颜色</th>
                                    <th>统计项</th>
                                    <th>LETd[keV/μm]</th>
                                    <th>X[cm]</th>
                                    <th>Y[cm]</th>
                                    <th>Z[cm]</th>
                                </tr>
                            </thead>
                            <tbody id="${this.containerId}-globalStatsTableBody"></tbody>
                        </table>
                    </div>
                </div>

                <div class="dose-stats-content-item" id="${this.containerId}-roiStatsContent">
                    <div class="dose-stats-table-wrapper">
                        <table class="dose-stats-table" id="${this.containerId}-roiStatsTable">
                            <thead>
                                <tr>
                                    <th>颜色</th>
                                    <th>ROI</th>
                                    <th>体积[cm³]</th>
                                    <th>最小LETd[keV/μm]</th>
                                    <th>最大LETd[keV/μm]</th>
                                    <th>平均LETd[keV/μm]</th>
                                </tr>
                            </thead>
                            <tbody id="${this.containerId}-roiStatsTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const radios = container.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.switchStatsType(e.target.value);
            });
        });
    }

    switchStatsType(type) {
        this.currentStatsType = type;

        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.querySelectorAll('.dose-stats-content-item').forEach(el => el.classList.remove('active'));

        const targetId = type === 'roi' ? `${this.containerId}-roiStatsContent` : `${this.containerId}-globalStatsContent`;
        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');
    }

    loadData() {
        if (this.options.getGlobalStats) {
            const stats = this.options.getGlobalStats();
            this.globalStats = (stats && stats.length > 0) ? stats : this.getDefaultGlobalStats();
        } else {
            this.globalStats = this.getDefaultGlobalStats();
        }

        if (this.options.getRoiStats) {
            const stats = this.options.getRoiStats();
            this.roiStats = (stats && stats.length > 0) ? stats : this.getDefaultRoiStats();
        } else {
            this.roiStats = this.getDefaultRoiStats();
        }

        this.renderTables();
    }

    renderTables() {
        this.renderGlobalStats();
        this.renderRoiStats();
    }

    renderGlobalStats() {
        const tbody = document.getElementById(`${this.containerId}-globalStatsTableBody`);
        if (!tbody) return;
        tbody.innerHTML = '';

        this.globalStats.forEach((stat, index) => {
            const row = document.createElement('tr');
            row.className = 'dose-stats-row';
            if (index % 2 === 1) row.classList.add('dose-stats-row-alt');

            const visible = stat.visible !== false;
            const visibilityIcon = visible ? 'fa-eye' : 'fa-eye-slash';
            const visibilityClass = visible ? 'visible' : 'hidden';

            row.innerHTML = `
                <td>
                    <i class="fas ${visibilityIcon} dose-stats-visibility-toggle ${visibilityClass}"
                       data-stat-id="${stat.id || ''}"
                       title="点击切换显隐"></i>
                </td>
                <td><div class="dose-stats-color" style="background-color: ${stat.color || '#ff00ff'};"></div></td>
                <td>${stat.statisticItem || ''}</td>
                <td>${this.formatNumber(stat.letd)}</td>
                <td>${this.formatNumber(stat.x)}</td>
                <td>${this.formatNumber(stat.y)}</td>
                <td>${this.formatNumber(stat.z)}</td>
            `;

            tbody.appendChild(row);
        });

        // 显隐切换
        tbody.querySelectorAll('.dose-stats-visibility-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const statId = toggle.dataset.statId;
                this.toggleVisibility(statId);
            });
        });
    }

    renderRoiStats() {
        const tbody = document.getElementById(`${this.containerId}-roiStatsTableBody`);
        if (!tbody) return;
        tbody.innerHTML = '';

        this.roiStats.forEach((roi, index) => {
            const row = document.createElement('tr');
            row.className = 'dose-stats-row';
            if (index % 2 === 1) row.classList.add('dose-stats-row-alt');

            row.innerHTML = `
                <td><div class="dose-stats-color" style="background-color: ${roi.color || '#00ff00'};"></div></td>
                <td>${roi.name || ''}</td>
                <td>${this.formatNumber(roi.volume)}</td>
                <td>${this.formatNumber(roi.minLetd)}</td>
                <td>${this.formatNumber(roi.maxLetd)}</td>
                <td>${this.formatNumber(roi.avgLetd)}</td>
            `;

            tbody.appendChild(row);
        });
    }

    toggleVisibility(statId) {
        const stat = this.globalStats.find(s => (s.id || '') === statId);
        if (!stat) return;
        stat.visible = !stat.visible;
        this.renderGlobalStats();
    }

    formatNumber(value) {
        if (value === null || value === undefined || value === '') return '';
        const num = Number(value);
        if (Number.isNaN(num)) return '';
        return num.toFixed(2);
    }

    // 外部更新
    updateGlobalStats(stats) {
        this.globalStats = stats || [];
        this.renderGlobalStats();
    }

    updateRoiStats(stats) {
        this.roiStats = stats || [];
        this.renderRoiStats();
    }

    hasLetdData() {
        return (this.globalStats && this.globalStats.length > 0) || (this.roiStats && this.roiStats.length > 0);
    }

    // 默认示例数据（用于组件库预览）
    getDefaultGlobalStats() {
        return [
            {
                id: 'maxLetd',
                visible: true,
                color: '#ff00ff',
                statisticItem: '最大点',
                letd: 9.30,
                x: 2.95,
                y: -42.50,
                z: 34.70
            }
        ];
    }

    getDefaultRoiStats() {
        return [
            { name: 'ROI', color: '#c07050', volume: 15.96, minLetd: 0.00, maxLetd: 5.80, avgLetd: 1.12 },
            { name: 'Body', color: '#00ff00', volume: 24704.08, minLetd: 0.00, maxLetd: 9.30, avgLetd: 0.40 },
            { name: 'BrachialPlexus_L', color: '#3AACDE', volume: 16.03, minLetd: 0.00, maxLetd: 5.34, avgLetd: 2.60 },
            { name: 'BrachialPlexus_R', color: '#ff0000', volume: 17.38, minLetd: 1.46, maxLetd: 3.08, avgLetd: 2.34 },
            { name: 'Brain', color: '#8888ff', volume: 1425.26, minLetd: 0.00, maxLetd: 6.09, avgLetd: 0.08 },
            { name: 'BrainStem', color: '#aa0000', volume: 25.78, minLetd: 0.00, maxLetd: 4.69, avgLetd: 0.49 },
            { name: 'CTV1', color: '#ff6666', volume: 428.51, minLetd: 0.00, maxLetd: 5.63, avgLetd: 2.63 }
        ];
    }
}

if (typeof window !== 'undefined') {
    window.LETdStatisticsComponent = LETdStatisticsComponent;
}

