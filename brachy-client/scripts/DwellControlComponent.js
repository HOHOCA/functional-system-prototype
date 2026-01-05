/**
 * 驻留控制组件 - 后装治疗计划系统
 * 功能：
 * - 显示驻留点信息（位置、时间、坐标、时间权重）
 * - 分组显示（按施源器、通道分组）
 * - 行锁定/解锁功能
 * - 表头锁图标控制全部锁定/解锁
 * - 数据编辑功能
 */
class DwellControlComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        
        this.options = {
            prefix: options.prefix || '',
            onDwellPointSelect: options.onDwellPointSelect || (() => {}),
            onDwellPointChange: options.onDwellPointChange || (() => {}),
            onDwellPointLockToggle: options.onDwellPointLockToggle || (() => {}),
            ...options
        };

        // 驻留点数据（按分组组织）
        this.dwellGroups = []; // [{id, name, channel, expanded, points: []}]
        this.selectedDwellPointId = null;
        
        // 锁定状态管理
        this.dwellPointLocked = new Map(); // pointId -> locked (boolean)
        this.groupLocked = new Map(); // groupId -> locked (boolean)

        // 初始化
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('DwellControlComponent: 容器不存在', this.containerId);
            return;
        }
        
        this.render();
        this.bindEvents();
        this.loadDwellData();
    }

    render() {
        this.container.innerHTML = `
            <div class="dwell-control-list-component">
                <!-- 驻留控制列表表格 -->
                <div class="dwell-control-table-container">
                    <table class="dwell-control-table" id="${this.options.prefix}dwellControlTable">
                        <thead>
                            <tr>
                                <th style="width: 30px; min-width: 30px; text-align: center;">
                                    <i class="fas fa-lock" style="color: #888; cursor: pointer;" title="锁定"></i>
                                </th>
                                <th style="width: 70px; min-width: 70px;">位置[mm]</th>
                                <th style="width: 70px; min-width: 70px;">时间[S]</th>
                                <th style="width: 50px; min-width: 50px;">X[cm]</th>
                                <th style="width: 50px; min-width: 50px;">Y[cm]</th>
                                <th style="width: 50px; min-width: 50px;">Z[cm]</th>
                                <th>时间权重</th>
                            </tr>
                        </thead>
                        <tbody id="${this.options.prefix}dwellControlTableBody">
                            <!-- 驻留点数据将通过JavaScript动态加载 -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 表头锁图标点击事件（全部锁定/解锁）
        const table = document.getElementById(`${this.options.prefix}dwellControlTable`);
        if (table) {
            table.addEventListener('click', (e) => {
                const clickedElement = e.target;
                const headerLockTh = clickedElement.closest('thead th:first-child');
                
                if (headerLockTh && (clickedElement.classList.contains('fa-lock') || 
                                      clickedElement.classList.contains('fa-unlock') ||
                                      clickedElement.classList.contains('fas') ||
                                      clickedElement.tagName === 'I')) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.toggleAllLock();
                    return;
                }
            });
        }

        // 表格行点击事件（事件委托）
        const tableBody = document.getElementById(`${this.options.prefix}dwellControlTableBody`);
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                // 分组锁图标点击
                if (e.target.classList.contains('group-lock-icon')) {
                    e.stopPropagation();
                    const groupRow = e.target.closest('.dwell-group-row');
                    const groupId = groupRow?.dataset.groupId;
                    if (groupId) {
                        this.toggleGroupLock(groupId);
                    }
                    return;
                }

                // 分组行点击（展开/折叠）- 但排除锁图标点击
                if (e.target.closest('.dwell-group-row') && !e.target.classList.contains('group-lock-icon')) {
                    const groupRow = e.target.closest('.dwell-group-row');
                    const groupId = groupRow.dataset.groupId;
                    if (groupId) {
                        this.toggleGroup(groupId);
                    }
                    return;
                }

                // 数据行点击（选择）
                const row = e.target.closest('tr[data-point-id]');
                if (row && row.dataset.pointId) {
                    this.selectDwellPoint(row.dataset.pointId);
                }

                // 锁图标点击
                if (e.target.classList.contains('dwell-lock-icon')) {
                    e.stopPropagation();
                    const pointId = e.target.closest('tr[data-point-id]')?.dataset.pointId;
                    if (pointId) {
                        this.toggleLock(pointId);
                    }
                }
            });

            // 输入框变化事件（只处理时间字段）
            tableBody.addEventListener('change', (e) => {
                if (e.target.classList.contains('dwell-input') && e.target.name === 'time') {
                    const pointId = e.target.closest('tr[data-point-id]')?.dataset.pointId;
                    const fieldName = e.target.name;
                    const value = e.target.value;
                    if (pointId) {
                        this.updateDwellPointField(pointId, fieldName, value);
                    }
                }
            });
        }
    }

    loadDwellData() {
        // 模拟数据 - 实际应用中应该从后端或数据源加载
        this.dwellGroups = [
            {
                id: 'group1',
                name: '施源器1',
                channelName: 'NONE',
                channel: 1,
                expanded: true, // 默认展开
                points: [
                    { id: 'p1-1', position: 1130.0, time: 100.6, x: 0.68, y: -53.75, z: 17.75 },
                    { id: 'p1-2', position: 1127.5, time: 67.6, x: 0.65, y: -53.70, z: 17.70 },
                    { id: 'p1-3', position: 1125.0, time: 0.0, x: 0.62, y: -53.65, z: 17.65 },
                    { id: 'p1-4', position: 1122.5, time: 20.0, x: 0.59, y: -53.60, z: 17.60 }
                ]
            },
            {
                id: 'group2',
                name: '施源器2',
                channelName: 'NONE',
                channel: 2,
                expanded: true, // 默认展开
                points: [
                    { id: 'p2-1', position: 1130.0, time: 41.4, x: 0.70, y: -53.80, z: 17.80 },
                    { id: 'p2-2', position: 1127.5, time: 0.0, x: 0.67, y: -53.75, z: 17.75 },
                    { id: 'p2-3', position: 1125.0, time: 100.3, x: 0.64, y: -53.70, z: 17.70 }
                ]
            },
            {
                id: 'group3',
                name: '施源器3',
                channelName: 'NONE',
                channel: 3,
                expanded: true, // 默认展开
                points: [
                    { id: 'p3-1', position: 1130.0, time: 100.6, x: 0.68, y: -53.75, z: 17.75 },
                    { id: 'p3-2', position: 1127.5, time: 67.6, x: 0.65, y: -53.70, z: 17.70 },
                    { id: 'p3-3', position: 1125.0, time: 0.0, x: 0.62, y: -53.65, z: 17.65 },
                    { id: 'p3-4', position: 1122.5, time: 20.0, x: 0.59, y: -53.60, z: 17.60 },
                    { id: 'p3-5', position: 1120.0, time: 41.4, x: 0.56, y: -53.55, z: 17.55 },
                    { id: 'p3-6', position: 1117.5, time: 0.0, x: 0.53, y: -53.50, z: 17.50 }
                ]
            }
        ];

        // 初始化锁定状态（默认全部解锁）
        this.dwellGroups.forEach(group => {
            // 初始化分组锁定状态
            if (!this.groupLocked.has(group.id)) {
                this.groupLocked.set(group.id, false);
            }
            // 初始化驻留点锁定状态
            group.points.forEach(point => {
                if (!this.dwellPointLocked.has(point.id)) {
                    this.dwellPointLocked.set(point.id, false);
                }
            });
        });

        this.renderDwellData();
        this.updateHeaderLockIcon();
    }

    // 计算最大时间值（用于时间权重条形图的比例计算）
    getMaxTime() {
        let maxTime = 0;
        this.dwellGroups.forEach(group => {
            group.points.forEach(point => {
                if (point.time > maxTime) {
                    maxTime = point.time;
                }
            });
        });
        return maxTime || 100; // 如果没有数据，默认100作为最大值
    }

    renderDwellData() {
        const tbody = document.getElementById(`${this.options.prefix}dwellControlTableBody`);
        if (!tbody) return;

        if (this.dwellGroups.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #888;">
                        暂无驻留点数据
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        this.dwellGroups.forEach(group => {
            const isGroupLocked = this.groupLocked.get(group.id) === true;
            // 分组行
            html += `
                <tr class="dwell-group-row" data-group-id="${group.id}">
                    <td style="text-align: center; width: 30px; min-width: 30px;">
                        <i class="fas ${isGroupLocked ? 'fa-lock' : 'fa-unlock'} group-lock-icon" 
                           style="color: ${isGroupLocked ? '#f59e0b' : '#888'}; cursor: pointer;" 
                           title="${isGroupLocked ? '解锁' : '锁定'}"></i>
                    </td>
                    <td colspan="6" style="padding: 8px 12px; background: #252525; cursor: pointer;">
                        <i class="fas fa-chevron-${group.expanded ? 'down' : 'right'}" style="margin-right: 8px; color: #888;"></i>
                        <span style="color: #ddd; font-weight: 500;">${group.name}, ${group.channelName}, 通道${group.channel}</span>
                    </td>
                </tr>
            `;

            // 分组下的数据行
            if (group.expanded) {
                const maxTime = this.getMaxTime();
                group.points.forEach(point => {
                    const isSelected = this.selectedDwellPointId === point.id;
                    const isLocked = this.dwellPointLocked.get(point.id) === true;
                    
                    // 计算时间权重条形图的宽度（百分比）
                    const timeWeightPercent = maxTime > 0 ? (point.time / maxTime) * 100 : 0;
                    
                    html += `
                        <tr data-point-id="${point.id}" class="dwell-data-row ${isSelected ? 'selected' : ''}">
                            <td style="text-align: center; width: 30px; min-width: 30px;">
                                <i class="fas ${isLocked ? 'fa-lock' : 'fa-unlock'} dwell-lock-icon" 
                                   style="color: ${isLocked ? '#f59e0b' : '#888'}; cursor: pointer;" 
                                   title="${isLocked ? '解锁' : '锁定'}"></i>
                            </td>
                            <td style="color: #ccc;">${point.position.toFixed(1)}</td>
                            <td>
                                <input type="number" 
                                       class="dwell-input dwell-number-input" 
                                       name="time" 
                                       value="${point.time.toFixed(1)}" 
                                       step="0.1"
                                       ${isLocked ? 'disabled' : ''}
                                       style="width: 100%; background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 6px; height: 28px; box-sizing: border-box;">
                            </td>
                            <td style="color: #ccc;">${point.x.toFixed(2)}</td>
                            <td style="color: #ccc;">${point.y.toFixed(2)}</td>
                            <td style="color: #ccc;">${point.z.toFixed(2)}</td>
                            <td style="padding: 4px 6px;">
                                ${point.time > 0 ? `
                                    <div style="width: 100%; height: 20px; background: #1a1a1a; border-radius: 2px; position: relative; overflow: hidden;">
                                        <div style="width: ${timeWeightPercent}%; height: 100%; background: #f44336; border-radius: 2px;"></div>
                                    </div>
                                ` : ''}
                            </td>
                        </tr>
                    `;
                });
            }
        });

        tbody.innerHTML = html;
    }

    toggleGroup(groupId) {
        const group = this.dwellGroups.find(g => g.id === groupId);
        if (!group) return;

        group.expanded = !group.expanded;
        this.renderDwellData();
    }

    toggleGroupLock(groupId) {
        const group = this.dwellGroups.find(g => g.id === groupId);
        if (!group) return;

        const currentLocked = this.groupLocked.get(groupId) === true;
        const newLocked = !currentLocked;
        this.groupLocked.set(groupId, newLocked);
        
        // 如果锁定分组，同时锁定该分组下的所有驻留点
        if (newLocked) {
            group.points.forEach(point => {
                this.dwellPointLocked.set(point.id, true);
            });
        } else {
            // 如果解锁分组，解锁该分组下的所有驻留点
            group.points.forEach(point => {
                this.dwellPointLocked.set(point.id, false);
            });
        }
        
        this.renderDwellData();
        this.updateHeaderLockIcon();
        
        // 如果有选中的点，恢复选中状态
        if (this.selectedDwellPointId) {
            this.selectDwellPoint(this.selectedDwellPointId);
        }
    }

    selectDwellPoint(pointId) {
        // 移除之前的选中状态
        const prevSelected = document.querySelector(`tr[data-point-id="${this.selectedDwellPointId}"]`);
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // 设置新的选中状态
        this.selectedDwellPointId = pointId;
        const selectedRow = document.querySelector(`tr[data-point-id="${pointId}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }

        // 触发回调
        const point = this.findDwellPoint(pointId);
        if (point) {
            this.options.onDwellPointSelect(point);
        }
    }

    findDwellPoint(pointId) {
        for (const group of this.dwellGroups) {
            const point = group.points.find(p => p.id === pointId);
            if (point) return { ...point, groupId: group.id, groupName: group.name };
        }
        return null;
    }

    toggleLock(pointId) {
        const point = this.findDwellPoint(pointId);
        if (!point) return;

        const currentLocked = this.dwellPointLocked.get(pointId) === true;
        const newLocked = !currentLocked;
        this.dwellPointLocked.set(pointId, newLocked);
        
        this.renderDwellData();
        this.selectDwellPoint(pointId); // 恢复选中状态
        this.updateHeaderLockIcon(); // 更新表头锁图标
        
        // 触发回调
        if (this.options.onDwellPointLockToggle) {
            this.options.onDwellPointLockToggle(point, newLocked);
        }
    }

    toggleAllLock() {
        // 获取所有驻留点
        const allPoints = [];
        this.dwellGroups.forEach(group => {
            group.points.forEach(point => {
                allPoints.push(point.id);
            });
        });

        if (allPoints.length === 0) return;

        // 检查是否所有点都锁定
        const allLocked = allPoints.every(pointId => {
            return this.dwellPointLocked.get(pointId) === true;
        });

        // 切换所有点的锁定状态
        const newLocked = !allLocked;
        allPoints.forEach(pointId => {
            this.dwellPointLocked.set(pointId, newLocked);
        });

        // 同时切换所有分组的锁定状态
        this.dwellGroups.forEach(group => {
            this.groupLocked.set(group.id, newLocked);
        });

        // 重新渲染
        this.renderDwellData();
        this.updateHeaderLockIcon();

        // 如果有选中的点，恢复选中状态
        if (this.selectedDwellPointId) {
            this.selectDwellPoint(this.selectedDwellPointId);
        }
    }

    updateHeaderLockIcon() {
        // 更新表头锁图标状态
        const headerTh = document.querySelector(`#${this.options.prefix}dwellControlTable thead th:first-child`);
        if (!headerTh) return;

        const headerLockIcon = headerTh.querySelector('.fa-lock, .fa-unlock, .fas');
        if (!headerLockIcon) return;

        // 获取所有驻留点
        const allPoints = [];
        this.dwellGroups.forEach(group => {
            group.points.forEach(point => {
                allPoints.push(point.id);
            });
        });

        if (allPoints.length === 0) {
            // 没有点时，显示默认的解锁图标
            headerLockIcon.className = 'fas fa-unlock';
            headerLockIcon.style.color = '#888';
            return;
        }

        // 检查是否所有点都锁定
        const allLocked = allPoints.every(pointId => {
            return this.dwellPointLocked.get(pointId) === true;
        });

        if (allLocked) {
            headerLockIcon.className = 'fas fa-lock';
            headerLockIcon.style.color = '#f59e0b';
        } else {
            headerLockIcon.className = 'fas fa-unlock';
            headerLockIcon.style.color = '#888';
        }
    }

    updateDwellPointField(pointId, fieldName, value) {
        const point = this.findDwellPoint(pointId);
        if (!point) return;

        // 检查是否锁定
        const isLocked = this.dwellPointLocked.get(pointId) === true;
        if (isLocked) {
            return; // 锁定状态下不允许修改
        }

        // 更新字段值（只允许更新时间）
        if (fieldName === 'time') {
            point.time = parseFloat(value) || 0;
        }
        // X、Y、Z 字段不可编辑，不处理

        // 更新数据源
        const group = this.dwellGroups.find(g => g.id === point.groupId);
        if (group) {
            const pointIndex = group.points.findIndex(p => p.id === pointId);
            if (pointIndex !== -1) {
                Object.assign(group.points[pointIndex], point);
            }
        }

        // 如果时间改变，重新渲染以更新时间权重条形图
        if (fieldName === 'time') {
            this.renderDwellData();
            if (this.selectedDwellPointId === pointId) {
                this.selectDwellPoint(pointId); // 恢复选中状态
            }
        }

        this.options.onDwellPointChange(point, fieldName, value);
    }

    // 公共方法：获取选中的驻留点
    getSelectedDwellPoint() {
        return this.findDwellPoint(this.selectedDwellPointId);
    }

    // 公共方法：获取所有驻留点数据
    getDwellGroups() {
        return this.dwellGroups;
    }

    // 公共方法：设置驻留点数据
    setDwellGroups(groups) {
        this.dwellGroups = groups;
        
        // 初始化锁定状态
        this.dwellGroups.forEach(group => {
            // 初始化分组锁定状态
            if (!this.groupLocked.has(group.id)) {
                this.groupLocked.set(group.id, false);
            }
            // 初始化驻留点锁定状态
            group.points.forEach(point => {
                if (!this.dwellPointLocked.has(point.id)) {
                    this.dwellPointLocked.set(point.id, false);
                }
            });
        });
        
        this.renderDwellData();
        this.updateHeaderLockIcon();
    }

    // 公共方法：更新驻留点
    updateDwellPoint(pointId, updates) {
        const point = this.findDwellPoint(pointId);
        if (point) {
            Object.assign(point, updates);
            
            // 更新数据源
            const group = this.dwellGroups.find(g => g.id === point.groupId);
            if (group) {
                const pointIndex = group.points.findIndex(p => p.id === pointId);
                if (pointIndex !== -1) {
                    Object.assign(group.points[pointIndex], updates);
                }
            }
            
            this.renderDwellData();
            if (this.selectedDwellPointId === pointId) {
                this.selectDwellPoint(pointId); // 恢复选中状态
            }
        }
    }
}
