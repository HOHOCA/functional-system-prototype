// 射束优化设置组件
class BeamOptimizationSettingsComponent {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        if (!this.container) {
            console.error('BeamOptimizationSettingsComponent: container not found');
            return;
        }

        this.options = {
            getBeamList: options.getBeamList || (() => []),
            getROIList: options.getROIList || (() => []),
            getPOIList: options.getPOIList || (() => []),
            onSettingsChange: options.onSettingsChange || (() => {}),
            ...options
        };

        // 射束优化设置数据
        this.beamSettings = new Map();
        
        // 示例数据
        this.initSampleData();
        
        this.render();
    }

    initSampleData() {
        // 示例射束数据
        const beams = [
            {
                id: 1,
                name: 'beam1',
                isocenter: 'ISO1',
                x: 1.00,
                y: 1.00,
                z: 1.00,
                expectedWeight: 60.00,
                actualWeightPercent: 50.00,
                rtv: '自动生成',
                spotSpacing: 0.80,
                layerSpacing: 0.5,
                proximalLayers: 1,
                distalLayers: 1
            },
            {
                id: 2,
                name: 'beam2',
                isocenter: 'ISO1',
                x: 1.00,
                y: 2.00,
                z: 1.00,
                expectedWeight: 40.00,
                actualWeightPercent: 50.00,
                rtv: 'RTV2',
                spotSpacing: 0.50,
                layerSpacing: 0.5,
                proximalLayers: 1,
                distalLayers: 1
            }
        ];

        beams.forEach(beam => {
            this.beamSettings.set(beam.id, beam);
        });
    }

    render() {
        this.container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'beam-optimization-settings-component';
        wrapper.innerHTML = `
            <div class="beam-optimization-table-container">
                <table class="beam-optimization-table" id="beamOptimizationTable">
                    <thead>
                        <tr>
                            <th style="width: 60px;">序号</th>
                            <th style="width: 120px;">名称</th>
                            <th style="width: 100px;">等中心</th>
                            <th style="width: 80px;">X[cm]</th>
                            <th style="width: 80px;">Y[cm]</th>
                            <th style="width: 80px;">Z[cm]</th>
                            <th style="width: 100px;">预期权重</th>
                            <th style="width: 120px;">预期权重百分比</th>
                            <th style="width: 120px;">实际权重百分比</th>
                            <th style="width: 120px;">RTV</th>
                            <th style="width: 100px;">束斑间距</th>
                            <th style="width: 100px;">层间距</th>
                            <th style="width: 100px;">近端层束斑</th>
                            <th style="width: 100px;">远端层束斑</th>
                        </tr>
                    </thead>
                    <tbody id="beamOptimizationTableBody"></tbody>
                </table>
            </div>
        `;
        this.container.appendChild(wrapper);
        this.loadBeamList();
        this.bindEvents();
    }

    bindEvents() {
        // 预期权重输入事件
        const tableBody = this.container.querySelector('#beamOptimizationTableBody');
        if (tableBody) {
            tableBody.addEventListener('input', (e) => {
                if (e.target.classList.contains('expected-weight-input')) {
                    this.handleExpectedWeightChange(e.target);
                } else if (e.target.classList.contains('spot-spacing-input')) {
                    this.handleSpotSpacingChange(e.target);
                } else if (e.target.classList.contains('layer-spacing-input')) {
                    this.handleLayerSpacingChange(e.target);
                } else if (e.target.classList.contains('proximal-layers-input')) {
                    this.handleProximalLayersChange(e.target);
                } else if (e.target.classList.contains('distal-layers-input')) {
                    this.handleDistalLayersChange(e.target);
                }
            });

            // RTV下拉选择事件
            tableBody.addEventListener('change', (e) => {
                if (e.target.classList.contains('rtv-select')) {
                    this.handleRTVChange(e.target);
                }
            });
        }
    }

    loadBeamList() {
        // 从选项获取射束列表，或使用默认数据
        let beams = [];
        if (this.options.getBeamList) {
            beams = this.options.getBeamList();
        }

        // 如果没有提供，使用示例数据
        if (beams.length === 0) {
            beams = Array.from(this.beamSettings.values());
        }

        // 更新射束设置数据
        beams.forEach(beam => {
            if (!this.beamSettings.has(beam.id)) {
                // 如果射束不存在，创建默认设置
                this.beamSettings.set(beam.id, {
                    id: beam.id,
                    name: beam.name || `beam${beam.id}`,
                    isocenter: beam.isocenter || 'ISO1',
                    x: beam.x || 0.00,
                    y: beam.y || 0.00,
                    z: beam.z || 0.00,
                    expectedWeight: 0.00,
                    actualWeightPercent: 0.00,
                    rtv: '自动生成',
                    spotSpacing: 0.5,
                    layerSpacing: 0.5,
                    proximalLayers: 1,
                    distalLayers: 1
                });
            } else {
                // 更新现有射束的名称和等中心信息
                const settings = this.beamSettings.get(beam.id);
                if (beam.name) settings.name = beam.name;
                if (beam.isocenter) settings.isocenter = beam.isocenter;
                if (beam.x !== undefined) settings.x = beam.x;
                if (beam.y !== undefined) settings.y = beam.y;
                if (beam.z !== undefined) settings.z = beam.z;
            }
        });

        this.refreshTable();
    }

    refreshTable() {
        const tableBody = this.container.querySelector('#beamOptimizationTableBody');
        if (!tableBody) return;

        const beams = Array.from(this.beamSettings.values()).sort((a, b) => a.id - b.id);
        
        if (beams.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="14" style="text-align: center; padding: 20px;">暂无射束数据</td></tr>';
            return;
        }

        // 计算预期权重百分比
        this.calculateExpectedWeightPercentages(beams);

        tableBody.innerHTML = beams.map((beam, index) => {
            const expectedWeightPercent = beam.expectedWeightPercent || '';
            return `
            <tr data-beam-id="${beam.id}" class="beam-optimization-row">
                <td>${index + 1}</td>
                <td>${beam.name}</td>
                <td>${beam.isocenter}</td>
                <td>${this.formatNumber(beam.x, 2)}</td>
                <td>${this.formatNumber(beam.y, 2)}</td>
                <td>${this.formatNumber(beam.z, 2)}</td>
                <td>
                    <input type="number" 
                           class="expected-weight-input" 
                           data-beam-id="${beam.id}"
                           value="${this.formatNumber(beam.expectedWeight, 2)}" 
                           min="0" 
                           max="100" 
                           step="0.01"
                           style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; box-sizing: border-box;">
                </td>
                <td>${expectedWeightPercent}</td>
                <td>${this.formatNumber(beam.actualWeightPercent, 2)}%</td>
                <td>
                    <select class="rtv-select" 
                            data-beam-id="${beam.id}"
                            style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; box-sizing: border-box;">
                        ${this.renderRTVOptions(beam.rtv)}
                    </select>
                </td>
                <td>
                    <input type="number" 
                           class="spot-spacing-input" 
                           data-beam-id="${beam.id}"
                           value="${this.formatNumber(beam.spotSpacing, 2)}" 
                           min="0.1" 
                           step="0.01"
                           style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; box-sizing: border-box;">
                </td>
                <td>
                    <input type="number" 
                           class="layer-spacing-input" 
                           data-beam-id="${beam.id}"
                           value="${this.formatNumber(beam.layerSpacing, 2)}" 
                           min="0.1" 
                           step="0.01"
                           style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; box-sizing: border-box;">
                </td>
                <td>
                    <input type="number" 
                           class="proximal-layers-input" 
                           data-beam-id="${beam.id}"
                           value="${beam.proximalLayers}" 
                           min="0" 
                           max="10" 
                           step="1"
                           style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; box-sizing: border-box;">
                </td>
                <td>
                    <input type="number" 
                           class="distal-layers-input" 
                           data-beam-id="${beam.id}"
                           value="${beam.distalLayers}" 
                           min="0" 
                           max="10" 
                           step="1"
                           style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; box-sizing: border-box;">
                </td>
            </tr>
        `;
        }).join('');
    }

    renderRTVOptions(selectedValue) {
        const options = ['<option value="自动生成">自动生成</option>'];
        
        // 从ROI列表获取选项
        if (this.options.getROIList) {
            const roiList = this.options.getROIList();
            roiList.forEach(roi => {
                const selected = roi.name === selectedValue ? 'selected' : '';
                options.push(`<option value="${roi.name}" ${selected}>${roi.name}</option>`);
            });
        }

        return options.join('');
    }

    calculateExpectedWeightPercentages(beams) {
        // 按等中心分组
        const isocenterGroups = new Map();
        beams.forEach(beam => {
            if (!isocenterGroups.has(beam.isocenter)) {
                isocenterGroups.set(beam.isocenter, []);
            }
            isocenterGroups.get(beam.isocenter).push(beam);
        });

        // 计算每个等中心组的百分比
        isocenterGroups.forEach((groupBeams, isocenter) => {
            const totalWeight = groupBeams.reduce((sum, beam) => sum + (beam.expectedWeight || 0), 0);
            
            if (totalWeight === 0) {
                // 如果所有预期权重都为0，百分比为空
                groupBeams.forEach(beam => {
                    beam.expectedWeightPercent = '';
                });
            } else {
                // 计算百分比
                groupBeams.forEach(beam => {
                    const percent = (beam.expectedWeight / totalWeight) * 100;
                    beam.expectedWeightPercent = `${this.formatNumber(percent, 0)}%`;
                });
            }
        });
    }

    handleExpectedWeightChange(input) {
        const beamId = parseInt(input.dataset.beamId, 10);
        const value = parseFloat(input.value) || 0;
        
        // 限制范围 [0.00-100.00]
        const clampedValue = Math.max(0, Math.min(100, value));
        input.value = this.formatNumber(clampedValue, 2);
        
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.expectedWeight = clampedValue;
            this.refreshTable();
            
            if (this.options.onSettingsChange) {
                this.options.onSettingsChange(beamId, 'expectedWeight', clampedValue);
            }
        }
    }

    handleRTVChange(select) {
        const beamId = parseInt(select.dataset.beamId, 10);
        const value = select.value;
        
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.rtv = value;
            
            if (this.options.onSettingsChange) {
                this.options.onSettingsChange(beamId, 'rtv', value);
            }
        }
    }

    handleSpotSpacingChange(input) {
        const beamId = parseInt(input.dataset.beamId, 10);
        const value = parseFloat(input.value) || 0.5;
        
        // 限制最小值
        const clampedValue = Math.max(0.1, value);
        input.value = this.formatNumber(clampedValue, 2);
        
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.spotSpacing = clampedValue;
            
            if (this.options.onSettingsChange) {
                this.options.onSettingsChange(beamId, 'spotSpacing', clampedValue);
            }
        }
    }

    handleLayerSpacingChange(input) {
        const beamId = parseInt(input.dataset.beamId, 10);
        const value = parseFloat(input.value) || 0.5;
        
        // 限制最小值
        const clampedValue = Math.max(0.1, value);
        input.value = this.formatNumber(clampedValue, 2);
        
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.layerSpacing = clampedValue;
            
            if (this.options.onSettingsChange) {
                this.options.onSettingsChange(beamId, 'layerSpacing', clampedValue);
            }
        }
    }

    handleProximalLayersChange(input) {
        const beamId = parseInt(input.dataset.beamId, 10);
        const value = parseInt(input.value, 10) || 1;
        
        // 限制范围 [0-10]
        const clampedValue = Math.max(0, Math.min(10, value));
        input.value = clampedValue;
        
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.proximalLayers = clampedValue;
            
            if (this.options.onSettingsChange) {
                this.options.onSettingsChange(beamId, 'proximalLayers', clampedValue);
            }
        }
    }

    handleDistalLayersChange(input) {
        const beamId = parseInt(input.dataset.beamId, 10);
        const value = parseInt(input.value, 10) || 1;
        
        // 限制范围 [0-10]
        const clampedValue = Math.max(0, Math.min(10, value));
        input.value = clampedValue;
        
        const beam = this.beamSettings.get(beamId);
        if (beam) {
            beam.distalLayers = clampedValue;
            
            if (this.options.onSettingsChange) {
                this.options.onSettingsChange(beamId, 'distalLayers', clampedValue);
            }
        }
    }

    formatNumber(value, decimals) {
        if (value === undefined || value === null || isNaN(value)) {
            return '';
        }
        return Number(value).toFixed(decimals);
    }

    // 公共方法：获取所有射束设置
    getAllSettings() {
        return Array.from(this.beamSettings.values());
    }

    // 公共方法：获取指定射束的设置
    getBeamSettings(beamId) {
        return this.beamSettings.get(beamId);
    }

    // 公共方法：设置射束设置
    setBeamSettings(beamId, settings) {
        const existing = this.beamSettings.get(beamId);
        if (existing) {
            Object.assign(existing, settings);
            this.refreshTable();
        }
    }
}

// 导出到全局
window.BeamOptimizationSettingsComponent = BeamOptimizationSettingsComponent;

