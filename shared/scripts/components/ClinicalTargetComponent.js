/**
 * 临床目标组件 - 公共组件
 * 功能：
 * - 显示临床目标列表（颜色、ROI、类型、临床目标、实际值、达到状态）
 * - 顶部过滤区域（下拉菜单和输入框）
 * - 行选择功能
 * - 底部操作栏（添加、编辑、删除、导出、导入）
 */
class ClinicalTargetComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        
        this.options = {
            prefix: options.prefix || '',
            onTargetSelect: options.onTargetSelect || (() => {}),
            onTargetAdd: options.onTargetAdd || (() => {}),
            onTargetEdit: options.onTargetEdit || (() => {}),
            onTargetDelete: options.onTargetDelete || (() => {}),
            onTargetExport: options.onTargetExport || (() => {}),
            onTargetImport: options.onTargetImport || (() => {}),
            ...options
        };

        // 临床目标数据
        this.targets = [];
        this.selectedTargetId = null;

        // ROI选项列表
        this.roiOptions = [
            'HRCTV',
            'Bladder',
            'BladderRing',
            'BladderRing0',
            'Rectum',
            'RectumRing',
            'Sagmoid'
        ];

        // 下拉菜单状态
        this.dropdownOpen = false;
        this.filteredRoiOptions = [...this.roiOptions];
        this.selectedRoi = '';

        // 初始化
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('ClinicalTargetComponent: 容器不存在', this.containerId);
            return;
        }
        
        this.render();
        this.bindEvents();
        this.loadTargets();
        this.renderRoiOptions();
    }

    render() {
        this.container.innerHTML = `
            <div class="clinical-target-component">
                <!-- 过滤区域 -->
                <div class="clinical-target-filter">
                    <div class="clinical-target-dropdown" id="${this.options.prefix}roiDropdown">
                        <div class="clinical-target-dropdown-trigger" id="${this.options.prefix}roiDropdownTrigger">
                            <span class="clinical-target-dropdown-text">${this.selectedRoi || '请选择'}</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="clinical-target-dropdown-menu" id="${this.options.prefix}roiDropdownMenu" style="display: none;">
                            <input type="text" 
                                   class="clinical-target-dropdown-search" 
                                   id="${this.options.prefix}roiDropdownSearch"
                                   placeholder="查找选项"
                                   style="width: 100%; padding: 6px 8px; border: none; border-bottom: 1px solid #333; background: #2a2a2a; color: #ddd; font-size: 12px; box-sizing: border-box;">
                            <div class="clinical-target-dropdown-options" id="${this.options.prefix}roiDropdownOptions">
                                <!-- 选项将通过JavaScript动态加载 -->
                            </div>
                        </div>
                    </div>
                    <div class="clinical-target-input-group">
                        <input type="number" 
                               class="clinical-target-input clinical-target-number-input" 
                               id="${this.options.prefix}filterVPercent" 
                               placeholder="V [0.01 ~ 100.00] %"
                               min="0.01" 
                               max="100.00" 
                               step="0.01"
                               style="background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 8px; height: 28px; font-size: 12px; width: 150px;">
                        <input type="number" 
                               class="clinical-target-input clinical-target-number-input" 
                               id="${this.options.prefix}filterVVolume" 
                               placeholder="V [0.00 ~ 500...] cm³"
                               min="0.00" 
                               step="0.01"
                               style="background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 8px; height: 28px; font-size: 12px; width: 150px;">
                        <input type="number" 
                               class="clinical-target-input clinical-target-number-input" 
                               id="${this.options.prefix}filterDPercent" 
                               placeholder="D [1.00 ~ 100.00] %"
                               min="1.00" 
                               max="100.00" 
                               step="0.01"
                               style="background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 8px; height: 28px; font-size: 12px; width: 150px;">
                        <input type="number" 
                               class="clinical-target-input clinical-target-number-input" 
                               id="${this.options.prefix}filterDDose" 
                               placeholder="D [1.00 ~ 15000...] cGy"
                               min="1.00" 
                               step="0.01"
                               style="background: #111; border: 1px solid #333; border-radius: 4px; color: #ddd; padding: 4px 8px; height: 28px; font-size: 12px; width: 150px;">
                    </div>
                </div>

                <!-- 临床目标表格 -->
                <div class="clinical-target-table-container">
                    <table class="clinical-target-table" id="${this.options.prefix}clinicalTargetTable">
                        <thead>
                            <tr>
                                <th style="width: 60px;">颜色</th>
                                <th style="width: 120px;">ROI</th>
                                <th style="width: 100px;">类型</th>
                                <th style="width: 180px;">临床目标</th>
                                <th style="width: 180px;">实际值</th>
                                <th style="width: 80px;">达到</th>
                            </tr>
                        </thead>
                        <tbody id="${this.options.prefix}clinicalTargetTableBody">
                            <!-- 数据将通过JavaScript动态加载 -->
                        </tbody>
                    </table>
                </div>

                <!-- 底部操作栏 -->
                <div class="clinical-target-toolbar">
                    <button class="clinical-target-toolbar-btn" id="${this.options.prefix}addBtn" title="添加">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="clinical-target-toolbar-btn" id="${this.options.prefix}editBtn" title="编辑" disabled>
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="clinical-target-toolbar-btn" id="${this.options.prefix}deleteBtn" title="删除" disabled>
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="clinical-target-toolbar-btn" id="${this.options.prefix}exportBtn" title="导出">
                        <i class="fas fa-file-export"></i>
                    </button>
                    <button class="clinical-target-toolbar-btn" id="${this.options.prefix}importBtn" title="导入">
                        <i class="fas fa-file-import"></i>
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 下拉菜单触发
        const dropdownTrigger = document.getElementById(`${this.options.prefix}roiDropdownTrigger`);
        const dropdownMenu = document.getElementById(`${this.options.prefix}roiDropdownMenu`);
        const dropdownSearch = document.getElementById(`${this.options.prefix}roiDropdownSearch`);
        
        if (dropdownTrigger && dropdownMenu) {
            dropdownTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });

            // 搜索框输入事件
            if (dropdownSearch) {
                dropdownSearch.addEventListener('input', (e) => {
                    this.filterRoiOptions(e.target.value);
                });
            }

            // 点击外部关闭下拉菜单
            document.addEventListener('click', (e) => {
                const dropdown = document.getElementById(`${this.options.prefix}roiDropdown`);
                if (dropdown && !dropdown.contains(e.target)) {
                    this.closeDropdown();
                }
            });
        }

        // 添加按钮
        const addBtn = document.getElementById(`${this.options.prefix}addBtn`);
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addTarget();
            });
        }

        // 编辑按钮
        const editBtn = document.getElementById(`${this.options.prefix}editBtn`);
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (this.selectedTargetId) {
                    this.editTarget(this.selectedTargetId);
                }
            });
        }

        // 删除按钮
        const deleteBtn = document.getElementById(`${this.options.prefix}deleteBtn`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (this.selectedTargetId) {
                    this.deleteTarget(this.selectedTargetId);
                }
            });
        }

        // 导出按钮
        const exportBtn = document.getElementById(`${this.options.prefix}exportBtn`);
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportTargets();
            });
        }

        // 导入按钮
        const importBtn = document.getElementById(`${this.options.prefix}importBtn`);
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importTargets();
            });
        }

        // 表格行点击事件（事件委托）
        const tableBody = document.getElementById(`${this.options.prefix}clinicalTargetTableBody`);
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const row = e.target.closest('tr[data-target-id]');
                if (row && row.dataset.targetId) {
                    this.selectTarget(row.dataset.targetId);
                }
            });
        }
    }

    renderRoiOptions() {
        const optionsContainer = document.getElementById(`${this.options.prefix}roiDropdownOptions`);
        if (!optionsContainer) return;

        optionsContainer.innerHTML = this.filteredRoiOptions.map(roi => `
            <div class="clinical-target-dropdown-option" data-roi="${roi}">
                ${roi}
            </div>
        `).join('');

        // 选项点击事件
        optionsContainer.querySelectorAll('.clinical-target-dropdown-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const roi = e.target.dataset.roi;
                this.selectRoi(roi);
            });
        });
    }

    filterRoiOptions(searchText) {
        const searchLower = searchText.toLowerCase();
        this.filteredRoiOptions = this.roiOptions.filter(roi => 
            roi.toLowerCase().includes(searchLower)
        );
        this.renderRoiOptions();
    }

    selectRoi(roi) {
        this.selectedRoi = roi;
        const trigger = document.getElementById(`${this.options.prefix}roiDropdownTrigger`);
        if (trigger) {
            const textSpan = trigger.querySelector('.clinical-target-dropdown-text');
            if (textSpan) {
                textSpan.textContent = roi;
            }
        }
        this.closeDropdown();
    }

    toggleDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
        const dropdownMenu = document.getElementById(`${this.options.prefix}roiDropdownMenu`);
        const dropdownSearch = document.getElementById(`${this.options.prefix}roiDropdownSearch`);
        
        if (dropdownMenu) {
            dropdownMenu.style.display = this.dropdownOpen ? 'block' : 'none';
            
            if (this.dropdownOpen && dropdownSearch) {
                dropdownSearch.value = '';
                this.filteredRoiOptions = [...this.roiOptions];
                this.renderRoiOptions();
                setTimeout(() => dropdownSearch.focus(), 10);
            }
        }
    }

    closeDropdown() {
        this.dropdownOpen = false;
        const dropdownMenu = document.getElementById(`${this.options.prefix}roiDropdownMenu`);
        if (dropdownMenu) {
            dropdownMenu.style.display = 'none';
        }
    }

    loadTargets() {
        // 模拟数据 - 实际应用中应该从后端或数据源加载
        this.targets = [
            {
                id: 't1',
                color: '#ff00ff',
                roi: 'HRCTV',
                type: 'PTV',
                clinicalGoal: 'Dmax>600.00cGy',
                actualValue: 'Dmax=58238.66cGy',
                achieved: true
            },
            {
                id: 't2',
                color: '#00ffff',
                roi: 'Bladder',
                type: 'ORGAN',
                clinicalGoal: 'Dmax≤420.00cGy',
                actualValue: 'Dmax=868.78cGy',
                achieved: false
            },
            {
                id: 't3',
                color: '#00ff00',
                roi: 'Rectum',
                type: 'ORGAN',
                clinicalGoal: 'Dmax≤420.00cGy',
                actualValue: 'Dmax=686.97cGy',
                achieved: false
            }
        ];

        this.renderTargets();
        this.updateToolbarButtons();
    }

    renderTargets() {
        const tbody = document.getElementById(`${this.options.prefix}clinicalTargetTableBody`);
        if (!tbody) return;

        if (this.targets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #888;">
                        暂无临床目标数据，点击"添加"按钮创建新目标
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.targets.map(target => {
            const isSelected = this.selectedTargetId === target.id;
            return `
                <tr data-target-id="${target.id}" class="${isSelected ? 'selected' : ''}">
                    <td style="text-align: center;">
                        <div style="width: 16px; height: 16px; background: ${target.color}; border-radius: 2px; margin: 0 auto;"></div>
                    </td>
                    <td>${target.roi}</td>
                    <td>${target.type}</td>
                    <td>${target.clinicalGoal}</td>
                    <td>${target.actualValue}</td>
                    <td style="text-align: center; color: ${target.achieved ? '#4caf50' : '#f44336'};">
                        ${target.achieved ? 'YES' : 'NO'}
                    </td>
                </tr>
            `;
        }).join('');
    }

    selectTarget(targetId) {
        // 移除之前的选中状态
        const prevSelected = document.querySelector(`tr[data-target-id="${this.selectedTargetId}"]`);
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // 设置新的选中状态
        this.selectedTargetId = targetId;
        const selectedRow = document.querySelector(`tr[data-target-id="${targetId}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }

        // 更新工具栏按钮状态
        this.updateToolbarButtons();

        // 触发回调
        const target = this.targets.find(t => t.id === targetId);
        if (target) {
            this.options.onTargetSelect(target);
        }
    }

    addTarget() {
        // TODO: 打开添加弹窗
        console.log('添加临床目标');
        if (this.options.onTargetAdd) {
            this.options.onTargetAdd();
        }
    }

    editTarget(targetId) {
        // TODO: 打开编辑弹窗
        console.log('编辑临床目标:', targetId);
        const target = this.targets.find(t => t.id === targetId);
        if (target && this.options.onTargetEdit) {
            this.options.onTargetEdit(target);
        }
    }

    deleteTarget(targetId) {
        const target = this.targets.find(t => t.id === targetId);
        if (!target) return;

        if (confirm(`确定要删除临床目标"${target.roi}"吗？`)) {
            this.targets = this.targets.filter(t => t.id !== targetId);
            
            if (this.selectedTargetId === targetId) {
                this.selectedTargetId = null;
            }

            this.renderTargets();
            this.updateToolbarButtons();
            this.options.onTargetDelete(target);
        }
    }

    exportTargets() {
        // TODO: 打开导出弹窗或直接导出
        console.log('导出临床目标');
        if (this.options.onTargetExport) {
            this.options.onTargetExport(this.targets);
        }
    }

    importTargets() {
        // TODO: 打开导入弹窗
        console.log('导入临床目标');
        if (this.options.onTargetImport) {
            this.options.onTargetImport();
        }
    }

    updateToolbarButtons() {
        const hasSelected = !!this.selectedTargetId;
        
        const editBtn = document.getElementById(`${this.options.prefix}editBtn`);
        if (editBtn) {
            editBtn.disabled = !hasSelected;
        }
        
        const deleteBtn = document.getElementById(`${this.options.prefix}deleteBtn`);
        if (deleteBtn) {
            deleteBtn.disabled = !hasSelected;
        }
    }

    // 公共方法：获取选中的临床目标
    getSelectedTarget() {
        return this.targets.find(t => t.id === this.selectedTargetId) || null;
    }

    // 公共方法：获取所有临床目标
    getTargets() {
        return this.targets;
    }

    // 公共方法：设置临床目标数据
    setTargets(targets) {
        this.targets = targets;
        this.renderTargets();
        this.updateToolbarButtons();
    }

    // 公共方法：更新临床目标
    updateTarget(targetId, updates) {
        const target = this.targets.find(t => t.id === targetId);
        if (target) {
            Object.assign(target, updates);
            this.renderTargets();
            if (this.selectedTargetId === targetId) {
                this.selectTarget(targetId); // 恢复选中状态
            }
        }
    }
}
