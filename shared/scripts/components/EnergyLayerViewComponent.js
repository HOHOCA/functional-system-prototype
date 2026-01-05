// 能量层视图组件
class EnergyLayerViewComponent {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        if (!this.container) {
            console.error('EnergyLayerViewComponent: container not found');
            return;
        }

        this.options = {
            onBeamSelect: options.onBeamSelect || (() => {}),
            onLayerSelect: options.onLayerSelect || (() => {}),
            onLayerDelete: options.onLayerDelete || (() => {}),
            onLayerAdd: options.onLayerAdd || (() => {}),
            getBeamList: options.getBeamList || (() => []),
            ...options
        };

        // 当前选中的射束
        this.selectedBeamId = null;
        
        // 当前选中的能量层ID
        this.selectedLayerId = null;
        
        // 能量层数据（按射束ID组织）
        this.energyLayers = new Map();
        
        // 示例数据
        this.initSampleData();
        
        this.render();
    }

    initSampleData() {
        // 示例射束数据
        const beam1 = {
            id: 1,
            name: 'Beam 1',
            energyLayers: [
                {
                    id: 1,
                    sequence: 1,
                    energy: 94.3,
                    weight: 0.15,
                    mu: 994.9898,
                    spotCount: 20,
                    minSpotMeterset: 43.9094,
                    maxSpotMeterset: 26.0998,
                    paintings: 1
                },
                {
                    id: 2,
                    sequence: 2,
                    energy: 91.5,
                    weight: 0.12,
                    mu: 994.9788,
                    spotCount: 76,
                    minSpotMeterset: 38.1687,
                    maxSpotMeterset: 25.5432,
                    paintings: 1
                },
                {
                    id: 3,
                    sequence: 3,
                    energy: 88.7,
                    weight: 0.10,
                    mu: 850.1234,
                    spotCount: 45,
                    minSpotMeterset: 35.2345,
                    maxSpotMeterset: 22.9876,
                    paintings: 1
                }
            ]
        };

        const beam2 = {
            id: 2,
            name: 'Beam 2',
            energyLayers: [
                {
                    id: 4,
                    sequence: 1,
                    energy: 92.1,
                    weight: 0.18,
                    mu: 1100.5678,
                    spotCount: 30,
                    minSpotMeterset: 40.1234,
                    maxSpotMeterset: 28.5678,
                    paintings: 1
                },
                {
                    id: 5,
                    sequence: 2,
                    energy: 89.3,
                    weight: 0.14,
                    mu: 980.9012,
                    spotCount: 55,
                    minSpotMeterset: 36.7890,
                    maxSpotMeterset: 24.3456,
                    paintings: 1
                }
            ]
        };

        this.energyLayers.set(1, beam1.energyLayers);
        this.energyLayers.set(2, beam2.energyLayers);
    }

    render() {
        this.container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'energy-layer-view-component';
        wrapper.innerHTML = `
            <div class="energy-layer-header">
                <div class="beam-selector-section">
                    <label class="beam-label">射束</label>
                    <select id="energyLayerBeamSelect" class="beam-select">
                        <option value="">请选择射束</option>
                    </select>
                </div>
                <div class="beam-statistics">
                    <span class="stat-item">
                        <span class="stat-label">能量层总计:</span>
                        <span class="stat-value" id="totalEnergyLayers">0</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-label">束斑总计:</span>
                        <span class="stat-value" id="totalSpotCount">0</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-label">最小束斑跳数/最大束斑跳数[MU/fx]:</span>
                        <span class="stat-value" id="minMaxSpotMeterset">- / -</span>
                    </span>
                </div>
            </div>
            <div class="energy-layer-table-container">
                <table class="energy-layer-table" id="energyLayerTable">
                    <thead>
                        <tr>
                            <th style="width: 80px;">序号</th>
                            <th style="width: 120px;">能量[MeV]</th>
                            <th style="width: 100px;">权重</th>
                            <th style="width: 120px;">MU</th>
                            <th style="width: 100px;">束斑数量</th>
                            <th style="width: 150px;">最小束斑跳数 [MU/fx]</th>
                            <th style="width: 150px;">最大束斑跳数 [MU/fx]</th>
                            <th style="width: 100px;">扫描次数</th>
                        </tr>
                    </thead>
                    <tbody id="energyLayerTableBody"></tbody>
                </table>
            </div>
            <div class="energy-layer-actions">
                <div class="action-group">
                    <button class="action-btn" id="addEnergyLayerBtn" data-action="add">
                        <i class="fas fa-plus"></i> 添加能量层
                    </button>
                    <button class="action-btn" id="deleteEnergyLayerBtn" data-action="delete">
                        <i class="fas fa-trash"></i> 删除能量层
                    </button>
                </div>
            </div>
        `;
        this.container.appendChild(wrapper);
        this.bindEvents();
        this.loadBeamList();
    }

    bindEvents() {
        // 射束选择
        const beamSelect = this.container.querySelector('#energyLayerBeamSelect');
        if (beamSelect) {
            beamSelect.addEventListener('change', (e) => {
                const beamId = e.target.value ? parseInt(e.target.value, 10) : null;
                this.selectBeam(beamId);
            });
        }

        // 行点击事件（选中行并与BEV同步）
        const tableBody = this.container.querySelector('#energyLayerTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const row = e.target.closest('tr[data-layer-id]');
                if (row) {
                    const layerId = parseInt(row.dataset.layerId, 10);
                    this.selectLayer(layerId);
                }
            });
        }

        // 操作按钮
        const addBtn = this.container.querySelector('#addEnergyLayerBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.handleAddLayer();
            });
        }

        const deleteBtn = this.container.querySelector('#deleteEnergyLayerBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDeleteLayers();
            });
        }
    }

    loadBeamList() {
        const beamSelect = this.container.querySelector('#energyLayerBeamSelect');
        if (!beamSelect) return;

        // 从选项获取射束列表，或使用默认数据
        let beams = [];
        if (this.options.getBeamList) {
            beams = this.options.getBeamList();
        }

        // 如果没有提供，使用示例数据
        if (beams.length === 0) {
            beams = [
                { id: 1, name: 'Beam 1' },
                { id: 2, name: 'Beam 2' }
            ];
        }

        beamSelect.innerHTML = '<option value="">请选择射束</option>';
        beams.forEach(beam => {
            const option = document.createElement('option');
            option.value = beam.id;
            option.textContent = beam.name;
            beamSelect.appendChild(option);
        });
    }

    selectBeam(beamId) {
        this.selectedBeamId = beamId;
        this.selectedLayerId = null; // 切换射束时清除选中状态
        this.refreshTable();
        this.updateStatistics();
        
        if (this.options.onBeamSelect) {
            this.options.onBeamSelect(beamId);
        }
    }

    selectLayer(layerId) {
        // 如果点击的是已选中的行，则取消选中
        if (this.selectedLayerId === layerId) {
            this.selectedLayerId = null;
            const tableBody = this.container.querySelector('#energyLayerTableBody');
            if (tableBody) {
                tableBody.querySelectorAll('tr').forEach(row => {
                    row.classList.remove('selected');
                });
            }
            return;
        }

        // 设置新的选中状态
        this.selectedLayerId = layerId;
        
        // 移除之前的选中状态
        const tableBody = this.container.querySelector('#energyLayerTableBody');
        if (tableBody) {
            tableBody.querySelectorAll('tr').forEach(row => {
                row.classList.remove('selected');
            });
            
            // 添加新的选中状态
            const row = tableBody.querySelector(`tr[data-layer-id="${layerId}"]`);
            if (row) {
                row.classList.add('selected');
                
                // 通知BEV视图
                if (this.options.onLayerSelect) {
                    const layers = this.energyLayers.get(this.selectedBeamId) || [];
                    const layer = layers.find(l => l.id === layerId);
                    if (layer) {
                        this.options.onLayerSelect(layer, this.selectedBeamId);
                    }
                }
            }
        }
    }

    refreshTable() {
        const tableBody = this.container.querySelector('#energyLayerTableBody');
        if (!tableBody) return;

        if (!this.selectedBeamId) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">请先选择射束</td></tr>';
            return;
        }

        const layers = this.energyLayers.get(this.selectedBeamId) || [];
        
        if (layers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">该射束暂无能量层数据</td></tr>';
            return;
        }

        tableBody.innerHTML = layers.map(layer => {
            const isSelected = this.selectedLayerId === layer.id ? 'selected' : '';
            return `
            <tr data-layer-id="${layer.id}" class="energy-layer-row ${isSelected}">
                <td>${layer.sequence}</td>
                <td>${this.formatNumber(layer.energy, 2)}</td>
                <td>${layer.weight !== undefined && layer.weight !== null ? this.formatNumber(layer.weight, 2) : ''}</td>
                <td>${this.formatNumber(layer.mu, 4)}</td>
                <td>${layer.spotCount}</td>
                <td>${layer.minSpotMeterset !== undefined && layer.minSpotMeterset !== null ? this.formatNumber(layer.minSpotMeterset, 4) : ''}</td>
                <td>${layer.maxSpotMeterset !== undefined && layer.maxSpotMeterset !== null ? this.formatNumber(layer.maxSpotMeterset, 4) : ''}</td>
                <td>${layer.paintings || 1}</td>
            </tr>
        `;
        }).join('');
    }

    updateStatistics() {
        if (!this.selectedBeamId) {
            this.setStatistics(0, 0, null, null);
            return;
        }

        const layers = this.energyLayers.get(this.selectedBeamId) || [];
        
        // 计算统计信息
        const totalLayers = layers.length;
        const totalSpots = layers.reduce((sum, layer) => sum + (layer.spotCount || 0), 0);
        
        // 找出最小和最大束斑跳数
        let minMeterset = null;
        let maxMeterset = null;
        
        layers.forEach(layer => {
            if (layer.minSpotMeterset !== undefined && layer.minSpotMeterset !== null) {
                if (minMeterset === null || layer.minSpotMeterset < minMeterset) {
                    minMeterset = layer.minSpotMeterset;
                }
            }
            if (layer.maxSpotMeterset !== undefined && layer.maxSpotMeterset !== null) {
                if (maxMeterset === null || layer.maxSpotMeterset > maxMeterset) {
                    maxMeterset = layer.maxSpotMeterset;
                }
            }
        });

        this.setStatistics(totalLayers, totalSpots, minMeterset, maxMeterset);
    }

    setStatistics(totalLayers, totalSpots, minMeterset, maxMeterset) {
        const totalLayersEl = this.container.querySelector('#totalEnergyLayers');
        const totalSpotsEl = this.container.querySelector('#totalSpotCount');
        const minMaxEl = this.container.querySelector('#minMaxSpotMeterset');

        if (totalLayersEl) {
            totalLayersEl.textContent = totalLayers;
        }
        if (totalSpotsEl) {
            totalSpotsEl.textContent = totalSpots;
        }
        if (minMaxEl) {
            if (minMeterset !== null && maxMeterset !== null) {
                minMaxEl.textContent = `${this.formatNumber(minMeterset, 4)}/${this.formatNumber(maxMeterset, 4)}`;
            } else if (minMeterset !== null) {
                minMaxEl.textContent = `${this.formatNumber(minMeterset, 4)}/-`;
            } else if (maxMeterset !== null) {
                minMaxEl.textContent = `-/${this.formatNumber(maxMeterset, 4)}`;
            } else {
                minMaxEl.textContent = '- / -';
            }
        }
    }

    formatNumber(value, decimals) {
        if (value === undefined || value === null || isNaN(value)) {
            return '';
        }
        return Number(value).toFixed(decimals);
    }

    handleAddLayer() {
        if (!this.selectedBeamId) {
            alert('请先选择射束');
            return;
        }

        if (this.options.onLayerAdd) {
            this.options.onLayerAdd(this.selectedBeamId);
        } else {
            // 默认行为：添加一个示例能量层
            this.addSampleLayer();
        }
    }

    addSampleLayer() {
        if (!this.selectedBeamId) return;

        const layers = this.energyLayers.get(this.selectedBeamId) || [];
        const maxSequence = layers.length > 0 ? Math.max(...layers.map(l => l.sequence)) : 0;
        const maxId = layers.length > 0 ? Math.max(...layers.map(l => l.id)) : 0;

        const newLayer = {
            id: maxId + 1,
            sequence: maxSequence + 1,
            energy: 90.0,
            weight: 0.10,
            mu: 500.0,
            spotCount: 25,
            minSpotMeterset: 20.0,
            maxSpotMeterset: 30.0,
            paintings: 1
        };

        layers.push(newLayer);
        this.energyLayers.set(this.selectedBeamId, layers);
        this.refreshTable();
        this.updateStatistics();
    }

    handleDeleteLayers() {
        if (!this.selectedBeamId) {
            alert('请先选择射束');
            return;
        }

        // 检查是否有选中的能量层
        if (!this.selectedLayerId) {
            alert('请先选择要删除的能量层');
            return;
        }

        // 获取能量层信息
        const layers = this.energyLayers.get(this.selectedBeamId) || [];
        const layer = layers.find(l => l.id === this.selectedLayerId);
        
        if (!layer) {
            alert('未找到要删除的能量层');
            return;
        }

        // 构建能量层名称（使用能量值）
        const layerName = `${this.formatNumber(layer.energy, 2)} MeV`;
        
        // 显示确认弹窗
        if (confirm(`是否删除能量层[${layerName}]？`)) {
            const layerIdToDelete = this.selectedLayerId;
            // 清除选中状态
            this.selectedLayerId = null;
            
            if (this.options.onLayerDelete) {
                this.options.onLayerDelete([layerIdToDelete], this.selectedBeamId);
            } else {
                // 默认行为：删除选中的能量层
                this.deleteLayers([layerIdToDelete]);
            }
        }
    }

    deleteLayers(layerIds) {
        if (!this.selectedBeamId) return;

        const layers = this.energyLayers.get(this.selectedBeamId) || [];
        const remainingLayers = layers.filter(layer => !layerIds.includes(layer.id));
        
        // 重新排序序号（自动向上补位）
        remainingLayers.forEach((layer, index) => {
            layer.sequence = index + 1;
        });

        // 如果删除的是当前选中的能量层，清除选中状态
        if (this.selectedLayerId && layerIds.includes(this.selectedLayerId)) {
            this.selectedLayerId = null;
        }

        this.energyLayers.set(this.selectedBeamId, remainingLayers);
        this.refreshTable();
        this.updateStatistics();
    }

    // 公共方法：设置能量层数据
    setEnergyLayers(beamId, layers) {
        this.energyLayers.set(beamId, layers);
        if (this.selectedBeamId === beamId) {
            this.refreshTable();
            this.updateStatistics();
        }
    }

    // 公共方法：获取当前选中的能量层
    getSelectedLayers() {
        if (!this.selectedBeamId || !this.selectedLayerId) return [];
        
        const layers = this.energyLayers.get(this.selectedBeamId) || [];
        const layer = layers.find(l => l.id === this.selectedLayerId);
        return layer ? [layer] : [];
    }
}

// 导出到全局
window.EnergyLayerViewComponent = EnergyLayerViewComponent;

