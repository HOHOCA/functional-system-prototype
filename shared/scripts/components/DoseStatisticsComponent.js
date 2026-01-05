// 剂量统计组件
class DoseStatisticsComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            showDoseType: options.showDoseType || false, // 是否显示剂量类型列（计划优化模块）
            onExport: options.onExport || null,
            getGlobalStats: options.getGlobalStats || null,
            getRoiStats: options.getRoiStats || null,
            getPoiStats: options.getPoiStats || null,
            ...options
        };
        this.currentStatsType = 'roi'; // 'roi', 'poi' (移除'global')
        this.globalStats = [];
        this.roiStats = [];
        this.poiStats = [];
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

        container.innerHTML = `
            <div class="dose-statistics-component">
                <!-- 统计类型选择 -->
                <div class="dose-stats-type-selector">
                    <label class="dose-stats-radio">
                        <input type="radio" name="doseStatsType" value="roi" checked>
                        <span>ROI统计</span>
                    </label>
                    <label class="dose-stats-radio">
                        <input type="radio" name="doseStatsType" value="poi">
                        <span>POI统计</span>
                    </label>
                </div>

                <!-- ROI统计表格 -->
                <div class="dose-stats-content-item active" id="roiStatsContent">
                    <div class="dose-stats-table-wrapper">
                        <table class="dose-stats-table" id="roiStatsTable">
                            <thead>
                                <tr>
                                    <th>颜色</th>
                                    <th>ROI</th>
                                    <th>体积[cm³]</th>
                                    <th>最小剂量[cGy]</th>
                                    <th>最大剂量[cGy]</th>
                                    <th>平均剂量[cGy]</th>
                                    <th>D100(cGy)</th>
                                    <th>D90[cGy]</th>
                                    <th>V100[%]</th>
                                    <th>V90[%]</th>
                                    <th>D0.1cc[cGy]</th>
                                    <th>D1cc[cGy]</th>
                                    <th>D2cc[cGy]</th>
                                    <th>目标剂量[cGy]</th>
                                    <th>目标剂量覆盖体积[cm³]</th>
                                    <th>目标剂量覆盖体积占比[%]</th>
                                </tr>
                            </thead>
                            <tbody id="roiStatsTableBody">
                                <!-- 动态生成 -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- POI统计表格 -->
                <div class="dose-stats-content-item" id="poiStatsContent">
                    <div class="dose-stats-table-wrapper">
                        <table class="dose-stats-table" id="poiStatsTable">
                            <thead>
                                <tr>
                                    <th>颜色</th>
                                    <th>POI</th>
                                    <th>剂量[cGy]</th>
                                    <th>X[cm]</th>
                                    <th>Y[cm]</th>
                                    <th>Z[cm]</th>
                                </tr>
                            </thead>
                            <tbody id="poiStatsTableBody">
                                <!-- 动态生成 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 统计类型切换
        const radioButtons = document.querySelectorAll(`#${this.containerId} input[name="doseStatsType"]`);
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.switchStatsType(e.target.value);
            });
        });
    }

    switchStatsType(type) {
        this.currentStatsType = type;
        
        // 隐藏所有内容
        const contents = document.querySelectorAll(`#${this.containerId} .dose-stats-content-item`);
        contents.forEach(content => {
            content.classList.remove('active');
        });

        // 显示对应内容
        const targetContent = document.getElementById(`${type}StatsContent`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    loadData() {
        // 加载全局统计
        if (this.options.getGlobalStats) {
            const stats = this.options.getGlobalStats();
            this.globalStats = (stats && stats.length > 0) ? stats : this.getDefaultGlobalStats();
        } else {
            this.globalStats = this.getDefaultGlobalStats();
        }

        // 加载ROI统计
        if (this.options.getRoiStats) {
            const stats = this.options.getRoiStats();
            this.roiStats = (stats && stats.length > 0) ? stats : this.getDefaultRoiStats();
        } else {
            this.roiStats = this.getDefaultRoiStats();
        }

        // 加载POI统计
        if (this.options.getPoiStats) {
            const stats = this.options.getPoiStats();
            this.poiStats = (stats && stats.length > 0) ? stats : this.getDefaultPoiStats();
        } else {
            this.poiStats = this.getDefaultPoiStats();
        }

        this.renderTables();
    }

    renderTables() {
        this.renderGlobalStats();
        this.renderRoiStats();
        this.renderPoiStats();
    }

    renderGlobalStats() {
        const tbody = document.getElementById('globalStatsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.globalStats.forEach(stat => {
            const row = document.createElement('tr');
            row.className = 'dose-stats-row';
            row.dataset.visible = stat.visible !== false ? 'true' : 'false';
            
            const visibilityIcon = stat.visible !== false ? 'fa-eye' : 'fa-eye-slash';
            const visibilityClass = stat.visible !== false ? 'visible' : 'hidden';

            row.innerHTML = `
                <td>
                    <i class="fas ${visibilityIcon} dose-stats-visibility-toggle ${visibilityClass}" 
                       data-stat-id="${stat.id || ''}" 
                       title="点击切换显隐"></i>
                </td>
                <td>
                    <div class="dose-stats-color" style="background-color: ${stat.color || '#ff0000'};"></div>
                </td>
                <td>${stat.statisticItem || '最大剂量点'}</td>
                <td>${this.formatNumber(stat.relativeDosePercentage)}</td>
                <td>${this.formatNumber(stat.targetDose)}</td>
                <td>${this.formatNumber(stat.dose)}</td>
                <td>${this.formatNumber(stat.x)}</td>
                <td>${this.formatNumber(stat.y)}</td>
                <td>${this.formatNumber(stat.z)}</td>
                ${this.options.showDoseType ? '<td>Plan</td>' : ''}
            `;

            tbody.appendChild(row);
        });

        // 绑定显隐切换事件
        const visibilityToggles = tbody.querySelectorAll('.dose-stats-visibility-toggle');
        visibilityToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const statId = toggle.dataset.statId;
                this.toggleVisibility(statId);
            });
        });
    }

    renderRoiStats() {
        const tbody = document.getElementById('roiStatsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.roiStats.forEach((roi, index) => {
            const row = document.createElement('tr');
            row.className = 'dose-stats-row';
            // 交替行颜色
            if (index % 2 === 1) {
                row.classList.add('dose-stats-row-alt');
            }
            
            row.innerHTML = `
                <td>
                    <div class="dose-stats-color" style="background-color: ${roi.color || '#ff0000'};"></div>
                </td>
                <td>${roi.name || ''}</td>
                <td>${this.formatNumber(roi.volume)}</td>
                <td>${this.formatNumber(roi.minDose)}</td>
                <td>${this.formatNumber(roi.maxDose)}</td>
                <td>${this.formatNumber(roi.avgDose)}</td>
                <td>${this.formatNumber(roi.d100) || ''}</td>
                <td>${this.formatNumber(roi.d90) || ''}</td>
                <td>${this.formatNumber(roi.v100) || ''}</td>
                <td>${this.formatNumber(roi.v90) || ''}</td>
                <td>${this.formatNumber(roi.d01cc) || ''}</td>
                <td>${this.formatNumber(roi.d1cc) || ''}</td>
                <td>${this.formatNumber(roi.d2cc) || ''}</td>
                <td>${this.formatNumber(roi.targetDose) || ''}</td>
                <td>${this.formatNumber(roi.targetDoseCoverageVolume) || ''}</td>
                <td>${this.formatNumber(roi.targetDoseCoverageRatio) || ''}</td>
            `;

            tbody.appendChild(row);
        });
    }

    renderPoiStats() {
        const tbody = document.getElementById('poiStatsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.poiStats.forEach((poi, index) => {
            const row = document.createElement('tr');
            row.className = 'dose-stats-row';
            // 交替行颜色
            if (index % 2 === 1) {
                row.classList.add('dose-stats-row-alt');
            }
            
            row.innerHTML = `
                <td>
                    <div class="dose-stats-color" style="background-color: ${poi.color || '#ff0000'};"></div>
                </td>
                <td>${poi.name || ''}</td>
                <td>${this.formatNumber(poi.dose)}</td>
                <td>${this.formatNumber(poi.x)}</td>
                <td>${this.formatNumber(poi.y)}</td>
                <td>${this.formatNumber(poi.z)}</td>
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
        return parseFloat(value).toFixed(2);
    }

    // 导出剂量统计
    exportToExcel(planInfo = {}) {
        if (this.options.onExport) {
            this.options.onExport({
                globalStats: this.globalStats,
                roiStats: this.roiStats,
                poiStats: this.poiStats,
                planInfo: planInfo,
                showDoseType: this.options.showDoseType
            });
        } else {
            // 默认导出逻辑
            this.defaultExportToExcel(planInfo);
        }
    }

    defaultExportToExcel(planInfo) {
        // 生成文件名
        const fileName = this.generateFileName(planInfo);
        
        // 创建Excel数据
        const excelData = {
            globalStats: this.globalStats.map(stat => ({
                '显示': stat.visible !== false ? '是' : '否',
                '颜色': stat.color || '#ff0000',
                '统计项': stat.statisticItem || '最大剂量点',
                '相对剂量百分比[%]': this.formatNumber(stat.relativeDosePercentage),
                '目标剂量[cGy]': this.formatNumber(stat.targetDose),
                '剂量[cGy]': this.formatNumber(stat.dose),
                'X[cm]': this.formatNumber(stat.x),
                'Y[cm]': this.formatNumber(stat.y),
                'Z[cm]': this.formatNumber(stat.z)
            })),
            roiStats: this.roiStats.map(roi => ({
                '颜色': roi.color || '#ff0000',
                'ROI': roi.name || '',
                '体积[cm³]': this.formatNumber(roi.volume),
                '最小剂量[cGy]': this.formatNumber(roi.minDose),
                '最大剂量[cGy]': this.formatNumber(roi.maxDose),
                '平均剂量[cGy]': this.formatNumber(roi.avgDose),
                'D100(cGy)': this.formatNumber(roi.d100) || '',
                'D90[cGy]': this.formatNumber(roi.d90) || '',
                'V100[%]': this.formatNumber(roi.v100) || '',
                'V90[%]': this.formatNumber(roi.v90) || '',
                'D0.1cc[cGy]': this.formatNumber(roi.d01cc) || '',
                'D1cc[cGy]': this.formatNumber(roi.d1cc) || '',
                'D2cc[cGy]': this.formatNumber(roi.d2cc) || '',
                '目标剂量[cGy]': this.formatNumber(roi.targetDose) || '',
                '目标剂量覆盖体积[cm³]': this.formatNumber(roi.targetDoseCoverageVolume) || '',
                '目标剂量覆盖体积占比[%]': this.formatNumber(roi.targetDoseCoverageRatio) || ''
            })),
            poiStats: this.poiStats.map(poi => ({
                '颜色': poi.color || '#ff0000',
                'POI': poi.name || '',
                '剂量[cGy]': this.formatNumber(poi.dose),
                'X[cm]': this.formatNumber(poi.x),
                'Y[cm]': this.formatNumber(poi.y),
                'Z[cm]': this.formatNumber(poi.z)
            }))
        };

        // 这里应该调用实际的Excel导出库
        console.log('导出Excel:', fileName, excelData);
        alert(`导出功能需要集成Excel导出库\n文件名: ${fileName}\n包含 ${excelData.globalStats.length} 条全局统计\n${excelData.roiStats.length} 条ROI统计\n${excelData.poiStats.length} 条POI统计`);
    }

    generateFileName(planInfo) {
        const now = new Date();
        const timestamp = now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');

        const patientId = planInfo.patientId || '';
        const patientName = planInfo.patientName || '';

        if (planInfo.comparisonMode === 'plan') {
            // 计划对比
            const plan1Name = planInfo.plan1Name || 'Plan1';
            const plan2Name = planInfo.plan2Name || 'Plan2';
            return `Dose-${plan1Name} vs ${plan2Name}-${patientId}-${patientName}-${timestamp}`;
        } else if (planInfo.comparisonMode === 'beamGroup') {
            // 射束组对比
            const plan1Name = planInfo.plan1Name || 'Plan1';
            const group1Name = planInfo.group1Name || 'Group1';
            const plan2Name = planInfo.plan2Name || 'Plan2';
            const group2Name = planInfo.group2Name || 'Group2';
            return `Dose-${plan1Name}-${group1Name} vs ${plan2Name}-${group2Name}-${patientId}-${patientName}-${timestamp}`;
        } else {
            // 单个计划
            const planName = planInfo.planName || 'Plan';
            return `Dose-${planName}-${patientId}-${patientName}-${timestamp}`;
        }
    }

    // 默认数据（用于测试）
    getDefaultGlobalStats() {
        return [
            {
                id: 'maxDose1',
                visible: true,
                color: '#ff0000',
                statisticItem: '最大剂量点',
                relativeDosePercentage: 112.31,
                targetDose: 4500.00,
                dose: 5054.15,
                x: 4.34,
                y: -1.97,
                z: 0.00
            }
        ];
    }

    getDefaultRoiStats() {
        return [
            {
                name: 'HRCTV',
                color: '#ff00ff',
                volume: 65.39,
                minDose: 377.43,
                maxDose: 650.00,
                avgDose: 600.00,
                d100: 550.00,
                d90: 580.00,
                v100: 95.50,
                v90: 98.20,
                d01cc: 620.00,
                d1cc: 610.00,
                d2cc: 605.00,
                targetDose: 600.00,
                targetDoseCoverageVolume: 63.63,
                targetDoseCoverageRatio: 97.30
            },
            {
                name: 'Bladder',
                color: '#00ced1',
                volume: 166.00,
                minDose: 64.87,
                maxDose: 450.00,
                avgDose: 200.00,
                d100: 100.00,
                d90: 150.00,
                v100: 50.00,
                v90: 70.00,
                d01cc: 400.00,
                d1cc: 380.00,
                d2cc: 350.00,
                targetDose: null,
                targetDoseCoverageVolume: null,
                targetDoseCoverageRatio: null
            },
            {
                name: 'BladderRing',
                color: '#ff0000',
                volume: 45.23,
                minDose: 120.50,
                maxDose: 420.00,
                avgDose: 250.00,
                d100: 150.00,
                d90: 200.00,
                v100: 60.00,
                v90: 75.00,
                d01cc: 400.00,
                d1cc: 390.00,
                d2cc: 370.00,
                targetDose: null,
                targetDoseCoverageVolume: null,
                targetDoseCoverageRatio: null
            },
            {
                name: 'BladderRing0',
                color: '#ff0000',
                volume: 42.15,
                minDose: 115.30,
                maxDose: 410.00,
                avgDose: 245.00,
                d100: 145.00,
                d90: 195.00,
                v100: 58.00,
                v90: 73.00,
                d01cc: 395.00,
                d1cc: 385.00,
                d2cc: 365.00,
                targetDose: null,
                targetDoseCoverageVolume: null,
                targetDoseCoverageRatio: null
            },
            {
                name: 'Rectum',
                color: '#228b22',
                volume: 78.50,
                minDose: 85.20,
                maxDose: 380.00,
                avgDose: 180.00,
                d100: 90.00,
                d90: 140.00,
                v100: 45.00,
                v90: 65.00,
                d01cc: 360.00,
                d1cc: 350.00,
                d2cc: 330.00,
                targetDose: null,
                targetDoseCoverageVolume: null,
                targetDoseCoverageRatio: null
            },
            {
                name: 'RectumRing',
                color: '#ff0000',
                volume: 38.90,
                minDose: 95.60,
                maxDose: 370.00,
                avgDose: 190.00,
                d100: 100.00,
                d90: 150.00,
                v100: 50.00,
                v90: 68.00,
                d01cc: 355.00,
                d1cc: 345.00,
                d2cc: 325.00,
                targetDose: null,
                targetDoseCoverageVolume: null,
                targetDoseCoverageRatio: null
            },
            {
                name: 'Sagmoid',
                color: '#ff0000',
                volume: 125.80,
                minDose: 72.40,
                maxDose: 320.00,
                avgDose: 160.00,
                d100: 80.00,
                d90: 120.00,
                v100: 40.00,
                v90: 60.00,
                d01cc: 310.00,
                d1cc: 300.00,
                d2cc: 280.00,
                targetDose: null,
                targetDoseCoverageVolume: null,
                targetDoseCoverageRatio: null
            },
            {
                name: 'SagmoidRing',
                color: '#ff0000',
                volume: 35.60,
                minDose: 88.30,
                maxDose: 310.00,
                avgDose: 170.00,
                d100: 95.00,
                d90: 140.00,
                v100: 48.00,
                v90: 66.00,
                d01cc: 305.00,
                d1cc: 295.00,
                d2cc: 275.00,
                targetDose: null,
                targetDoseCoverageVolume: null,
                targetDoseCoverageRatio: null
            },
            {
                name: 'Skin',
                color: '#ffa500',
                volume: 245.30,
                minDose: 45.20,
                maxDose: 280.00,
                avgDose: 120.00,
                d100: 50.00,
                d90: 80.00,
                v100: 30.00,
                v90: 50.00,
                d01cc: 270.00,
                d1cc: 260.00,
                d2cc: 240.00,
                targetDose: null,
                targetDoseCoverageVolume: null,
                targetDoseCoverageRatio: null
            }
        ];
    }

    getDefaultPoiStats() {
        return [
            {
                name: 'Point1',
                color: '#ff0000',
                dose: 480.73,
                x: -1.76,
                y: -60.65,
                z: 17.54
            },
            {
                name: 'Point2',
                color: '#ff0000',
                dose: 218.29,
                x: -3.73,
                y: -60.65,
                z: 20.33
            }
        ];
    }

    // 更新数据
    updateGlobalStats(stats) {
        this.globalStats = stats || [];
        this.renderGlobalStats();
    }

    updateRoiStats(stats) {
        this.roiStats = stats || [];
        this.renderRoiStats();
    }

    updatePoiStats(stats) {
        this.poiStats = stats || [];
        this.renderPoiStats();
    }

    // 检查是否有剂量数据
    hasDoseData() {
        return this.globalStats.length > 0 || 
               this.roiStats.length > 0 || 
               this.poiStats.length > 0;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoseStatisticsComponent;
} else {
    window.DoseStatisticsComponent = DoseStatisticsComponent;
}

