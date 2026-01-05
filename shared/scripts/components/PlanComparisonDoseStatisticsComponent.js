// 两个计划对比的剂量统计组件
class PlanComparisonDoseStatisticsComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            plan1Name: options.plan1Name || 'plan1',
            plan2Name: options.plan2Name || 'plan2',
            onExport: options.onExport || null,
            getGlobalStats: options.getGlobalStats || null,
            getRoiStats: options.getRoiStats || null,
            getPoiStats: options.getPoiStats || null,
            ...options
        };
        this.currentStatsType = 'global'; // 'global', 'roi', 'poi'
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
            <div class="plan-comparison-dose-statistics-component">
                <!-- 统计类型选择 -->
                <div class="dose-stats-type-selector">
                    <label class="dose-stats-radio">
                        <input type="radio" name="comparisonDoseStatsType" value="global" checked>
                        <span>全局统计</span>
                    </label>
                    <label class="dose-stats-radio">
                        <input type="radio" name="comparisonDoseStatsType" value="roi">
                        <span>ROI统计</span>
                    </label>
                    <label class="dose-stats-radio">
                        <input type="radio" name="comparisonDoseStatsType" value="poi">
                        <span>POI统计</span>
                    </label>
                </div>

                <!-- 全局统计表格 -->
                <div class="dose-stats-content-item active" id="comparisonGlobalStatsContent">
                    <div class="dose-stats-table-wrapper">
                        <table class="dose-stats-table" id="comparisonGlobalStatsTable">
                            <thead>
                                <tr>
                                    <th>显示</th>
                                    <th>颜色</th>
                                    <th>统计项</th>
                                    <th>相对剂量百分比[%]</th>
                                    <th>目标剂量[cGy]</th>
                                    <th>剂量[cGy]</th>
                                    <th>X[cm]</th>
                                    <th>Y[cm]</th>
                                    <th>Z[cm]</th>
                                </tr>
                            </thead>
                            <tbody id="comparisonGlobalStatsTableBody">
                                <!-- 动态生成 -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- ROI统计表格 -->
                <div class="dose-stats-content-item" id="comparisonRoiStatsContent">
                    <div class="dose-stats-table-wrapper">
                        <table class="dose-stats-table" id="comparisonRoiStatsTable">
                            <thead>
                                <tr>
                                    <th>颜色</th>
                                    <th>ROI</th>
                                    <th>类型</th>
                                    <th>体积[cm³]</th>
                                    <th>统计项</th>
                                    <th>最小剂量[cGy]</th>
                                    <th>最大剂量[cGy]</th>
                                </tr>
                            </thead>
                            <tbody id="comparisonRoiStatsTableBody">
                                <!-- 动态生成 -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- POI统计表格 -->
                <div class="dose-stats-content-item" id="comparisonPoiStatsContent">
                    <div class="dose-stats-table-wrapper">
                        <table class="dose-stats-table" id="comparisonPoiStatsTable">
                            <thead>
                                <tr>
                                    <th>颜色</th>
                                    <th>POI</th>
                                    <th>统计项</th>
                                    <th>剂量[cGy]</th>
                                    <th>X[cm]</th>
                                    <th>Y[cm]</th>
                                    <th>Z[cm]</th>
                                </tr>
                            </thead>
                            <tbody id="comparisonPoiStatsTableBody">
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
        const radioButtons = document.querySelectorAll(`#${this.containerId} input[name="comparisonDoseStatsType"]`);
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
        const targetContent = document.getElementById(`comparison${type.charAt(0).toUpperCase() + type.slice(1)}StatsContent`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    loadData() {
        // 加载全局统计
        if (this.options.getGlobalStats) {
            this.globalStats = this.options.getGlobalStats();
        } else {
            this.globalStats = this.getDefaultGlobalStats();
        }

        // 加载ROI统计
        if (this.options.getRoiStats) {
            this.roiStats = this.options.getRoiStats();
        } else {
            this.roiStats = this.getDefaultRoiStats();
        }

        // 加载POI统计
        if (this.options.getPoiStats) {
            this.poiStats = this.options.getPoiStats();
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
        const tbody = document.getElementById('comparisonGlobalStatsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.globalStats.forEach(stat => {
            const row = document.createElement('tr');
            row.className = 'dose-stats-row';
            row.dataset.visible = stat.visible !== false ? 'true' : 'false';
            row.dataset.plan = stat.plan || 'plan1';
            
            const visibilityIcon = stat.visible !== false ? 'fa-eye' : 'fa-eye-slash';
            const visibilityClass = stat.visible !== false ? 'visible' : 'hidden';

            row.innerHTML = `
                <td>
                    <i class="fas ${visibilityIcon} dose-stats-visibility-toggle ${visibilityClass}" 
                       data-stat-id="${stat.id || ''}" 
                       data-plan="${stat.plan || 'plan1'}"
                       title="点击切换显隐"></i>
                </td>
                <td>
                    <div class="dose-stats-color" style="background-color: ${stat.color || '#ff0000'};"></div>
                </td>
                <td>${stat.statisticItem || ''}</td>
                <td>${this.formatNumber(stat.relativeDosePercentage)}</td>
                <td>${this.formatNumber(stat.targetDose)}</td>
                <td>${this.formatNumber(stat.dose)}</td>
                <td>${this.formatNumber(stat.x)}</td>
                <td>${this.formatNumber(stat.y)}</td>
                <td>${this.formatNumber(stat.z)}</td>
            `;

            tbody.appendChild(row);
        });

        // 绑定显隐切换事件
        const visibilityToggles = tbody.querySelectorAll('.dose-stats-visibility-toggle');
        visibilityToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const statId = toggle.dataset.statId;
                const plan = toggle.dataset.plan;
                this.toggleVisibility(statId, plan);
            });
        });
    }

    renderRoiStats() {
        const tbody = document.getElementById('comparisonRoiStatsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // 按ROI名称分组，确保相同名称的ROI只显示一行
        const roiMap = new Map();
        
        this.roiStats.forEach(roi => {
            const roiName = roi.name || '';
            if (!roiMap.has(roiName)) {
                roiMap.set(roiName, {
                    name: roiName,
                    type: roi.type || '',
                    color: roi.color || '#ff0000',
                    volume: roi.volume || 0,
                    plan1: roi.plan1 || null,
                    plan2: roi.plan2 || null
                });
            } else {
                // 如果已存在，合并数据
                const existing = roiMap.get(roiName);
                if (roi.plan1) existing.plan1 = roi.plan1;
                if (roi.plan2) existing.plan2 = roi.plan2;
            }
        });

        // 渲染每个ROI，每个ROI显示两行：plan1和plan2，但如果某个计划没有数据，该行显示为空
        roiMap.forEach(roi => {
            // 第一行：plan1的数据（如果存在）
            const plan1Data = roi.plan1 || {};
            const row1 = document.createElement('tr');
            row1.className = 'dose-stats-row';
            row1.dataset.roi = roi.name;
            row1.dataset.plan = 'plan1';
            
            row1.innerHTML = `
                <td>
                    <div class="dose-stats-color" style="background-color: ${roi.color};"></div>
                </td>
                <td>${roi.name}</td>
                <td>${roi.type}</td>
                <td>${this.formatNumber(roi.volume)}</td>
                <td>${roi.plan1 ? this.options.plan1Name : ''}</td>
                <td>${roi.plan1 ? this.formatNumber(plan1Data.minDose) : ''}</td>
                <td>${roi.plan1 ? this.formatNumber(plan1Data.maxDose) : ''}</td>
            `;

            tbody.appendChild(row1);

            // 第二行：plan2的数据（如果存在），但ROI名称、类型、体积列为空
            const plan2Data = roi.plan2 || {};
            const row2 = document.createElement('tr');
            row2.className = 'dose-stats-row';
            row2.dataset.roi = roi.name;
            row2.dataset.plan = 'plan2';
            
            row2.innerHTML = `
                <td>
                    <div class="dose-stats-color" style="background-color: ${roi.color};"></div>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td>${roi.plan2 ? this.options.plan2Name : ''}</td>
                <td>${roi.plan2 ? this.formatNumber(plan2Data.minDose) : ''}</td>
                <td>${roi.plan2 ? this.formatNumber(plan2Data.maxDose) : ''}</td>
            `;

            tbody.appendChild(row2);
        });
    }

    renderPoiStats() {
        const tbody = document.getElementById('comparisonPoiStatsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.poiStats.forEach(poi => {
            // 为每个POI生成两行：plan1和plan2
            ['plan1', 'plan2'].forEach(plan => {
                const planData = poi[plan] || {};
                const row = document.createElement('tr');
                row.className = 'dose-stats-row';
                row.dataset.poi = poi.name || '';
                row.dataset.plan = plan;
                
                row.innerHTML = `
                    <td>
                        <div class="dose-stats-color" style="background-color: ${poi.color || '#ff0000'};"></div>
                    </td>
                    <td>${poi.name || ''}</td>
                    <td>${plan === 'plan1' ? this.options.plan1Name : this.options.plan2Name}</td>
                    <td>${this.formatNumber(planData.dose)}</td>
                    <td>${this.formatNumber(planData.x)}</td>
                    <td>${this.formatNumber(planData.y)}</td>
                    <td>${this.formatNumber(planData.z)}</td>
                `;

                tbody.appendChild(row);
            });
        });
    }

    toggleVisibility(statId, plan) {
        const stat = this.globalStats.find(s => (s.id || '') === statId && (s.plan || 'plan1') === plan);
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
                comparisonMode: 'plan'
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
                '统计项': stat.statisticItem || '',
                '相对剂量百分比[%]': this.formatNumber(stat.relativeDosePercentage),
                '目标剂量[cGy]': this.formatNumber(stat.targetDose),
                '剂量[cGy]': this.formatNumber(stat.dose),
                'X[cm]': this.formatNumber(stat.x),
                'Y[cm]': this.formatNumber(stat.y),
                'Z[cm]': this.formatNumber(stat.z)
            })),
            roiStats: this.roiStats.map(roi => {
                const plan1Data = roi.plan1 || {};
                const plan2Data = roi.plan2 || {};
                return {
                    '颜色': roi.color || '#ff0000',
                    'ROI': roi.name || '',
                    '类型': roi.type || '',
                    '体积[cm³]': this.formatNumber(roi.volume),
                    [`${this.options.plan1Name}最小剂量[cGy]`]: this.formatNumber(plan1Data.minDose),
                    [`${this.options.plan1Name}最大剂量[cGy]`]: this.formatNumber(plan1Data.maxDose),
                    [`${this.options.plan2Name}最小剂量[cGy]`]: this.formatNumber(plan2Data.minDose),
                    [`${this.options.plan2Name}最大剂量[cGy]`]: this.formatNumber(plan2Data.maxDose)
                };
            }),
            poiStats: this.poiStats.map(poi => {
                const plan1Data = poi.plan1 || {};
                const plan2Data = poi.plan2 || {};
                return {
                    '颜色': poi.color || '#ff0000',
                    'POI': poi.name || '',
                    [`${this.options.plan1Name}剂量[cGy]`]: this.formatNumber(plan1Data.dose),
                    [`${this.options.plan1Name}X[cm]`]: this.formatNumber(plan1Data.x),
                    [`${this.options.plan1Name}Y[cm]`]: this.formatNumber(plan1Data.y),
                    [`${this.options.plan1Name}Z[cm]`]: this.formatNumber(plan1Data.z),
                    [`${this.options.plan2Name}剂量[cGy]`]: this.formatNumber(plan2Data.dose),
                    [`${this.options.plan2Name}X[cm]`]: this.formatNumber(plan2Data.x),
                    [`${this.options.plan2Name}Y[cm]`]: this.formatNumber(plan2Data.y),
                    [`${this.options.plan2Name}Z[cm]`]: this.formatNumber(plan2Data.z)
                };
            })
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
        const plan1Name = this.options.plan1Name || 'Plan1';
        const plan2Name = this.options.plan2Name || 'Plan2';

        return `Dose-${plan1Name} vs ${plan2Name}-${patientId}-${patientName}-${timestamp}`;
    }

    // 默认数据（用于测试）
    getDefaultGlobalStats() {
        return [
            {
                id: 'maxDose1',
                plan: 'plan1',
                visible: true,
                color: '#ff0000',
                statisticItem: `${this.options.plan1Name}最大剂量`,
                relativeDosePercentage: 107.09,
                targetDose: 6996.00,
                dose: 7492.19,
                x: -1.35,
                y: 2.70,
                z: 24.53
            },
            {
                id: 'maxDose2',
                plan: 'plan2',
                visible: true,
                color: '#ff8800',
                statisticItem: `${this.options.plan2Name}最大剂量`,
                relativeDosePercentage: 107.09,
                targetDose: 6996.00,
                dose: 7492.19,
                x: -1.35,
                y: 2.70,
                z: 24.53
            }
        ];
    }

    getDefaultRoiStats() {
        return [
            {
                name: 'CTV',
                type: 'CTV',
                color: '#0000ff',
                volume: 695.84,
                plan1: {
                    minDose: 4368.09,
                    maxDose: 4708.15
                },
                plan2: {
                    minDose: 0.00,
                    maxDose: 4778.35
                }
            },
            {
                name: 'ptv_new',
                type: 'PTV',
                color: '#00ff00',
                volume: 1481.99,
                plan1: {
                    minDose: 0.00,
                    maxDose: 4778.35
                },
                plan2: {
                    minDose: 0.00,
                    maxDose: 0.00
                }
            },
            {
                name: 'AdrenalGlan...',
                type: 'ORGAN',
                color: '#ff69b4',
                volume: 0.00,
                plan1: {
                    minDose: 0.00,
                    maxDose: 0.00
                },
                plan2: {
                    minDose: 1180.33,
                    maxDose: 4620.39
                }
            },
            {
                name: 'Body',
                type: 'BODY',
                color: '#ffff00',
                volume: 17695.10,
                plan1: {
                    minDose: 0.00,
                    maxDose: 4778.35
                },
                plan2: {
                    minDose: 1230.79,
                    maxDose: 4602.84
                }
            },
            {
                name: 'Bone_Pubic',
                type: 'ORGAN',
                color: '#ff69b4',
                volume: 65.43,
                plan1: {
                    minDose: 710.28,
                    maxDose: 4589.68
                },
                plan2: {
                    minDose: 147.27,
                    maxDose: 4760.80
                }
            },
            {
                name: 'bladder_min...',
                type: 'ORGAN',
                color: '#9370db',
                volume: 247.68,
                plan1: {
                    minDose: 1180.33,
                    maxDose: 4550.19
                },
                plan2: {
                    minDose: 1180.33,
                    maxDose: 4550.19
                }
            }
        ];
    }

    getDefaultPoiStats() {
        return [
            {
                name: 'Point1',
                color: '#ff0000',
                plan1: {
                    dose: 15576.95,
                    x: 11.40,
                    y: -0.25,
                    z: 23.03
                },
                plan2: {
                    dose: 15576.95,
                    x: 11.40,
                    y: -0.25,
                    z: 23.03
                }
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
    module.exports = PlanComparisonDoseStatisticsComponent;
} else {
    window.PlanComparisonDoseStatisticsComponent = PlanComparisonDoseStatisticsComponent;
}

