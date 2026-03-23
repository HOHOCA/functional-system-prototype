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
            /** 是否显示顶部过滤区（ROI 下拉 + V/D 数值过滤）；计划评估等场景可设为 false */
            showFilter: true,
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

        // 当前计划 ROI（用于模板匹配；真实项目应由外部传入）
        this.planRois = Array.isArray(options.rois) && options.rois.length ? options.rois : [
            { id: 'roi-hrctv', name: 'HRCTV', type: 'PTV', color: '#ff00ff' },
            { id: 'roi-bladder', name: 'Bladder', type: 'ORGAN', color: '#00ffff' },
            { id: 'roi-rectum', name: 'Rectum', type: 'ORGAN', color: '#00ff00' },
            // 晶格靶区场景示例（用于验证“固定匹配不可编辑”的界面）
            { id: 'roi-lattice-total', name: 'Lattice_Total', type: 'PTV', color: '#fbbf24' },
            { id: 'roi-lattice-ball-01', name: 'Lattice_Ball_01', type: 'PTV', color: '#f59e0b' },
            { id: 'roi-lattice-ball-02', name: 'Lattice_Ball_02', type: 'PTV', color: '#f59e0b' }
        ];

        // 模板列表（演示用：内存 mock；真实项目应来自系统设置/后端）
        // templateType:
        // - organ-limit: 系统维护的器官限量模板（此处不可删除）
        // - clinical-target: 由临床目标视图创建的模板（可删除）
        this.templates = [
            {
                id: 'ct-tpl-organ-demo',
                name: '器官限量模板-示例',
                templateType: 'organ-limit',
                isLattice: false,
                roiEntries: [
                    {
                        roiName: 'Bladder',
                        roiType: 'ORGAN',
                        targets: [
                            { type: 'ORGAN', clinicalGoal: 'Dmax≤420.00cGy' }
                        ]
                    },
                    {
                        roiName: 'Rectum',
                        roiType: 'ORGAN',
                        targets: [
                            { type: 'ORGAN', clinicalGoal: 'Dmax≤420.00cGy' }
                        ]
                    }
                ]
            },
            {
                id: 'ct-tpl-organ-lattice-demo',
                name: '器官限量模板-晶格靶区示例',
                templateType: 'organ-limit',
                isLattice: true,
                // 注意：模板结构中与晶格靶区有关的结构（如小球/总勾画）在匹配界面不展示
                roiEntries: [
                    { roiName: 'Bladder', roiType: 'ORGAN', targets: [{ type: 'ORGAN', clinicalGoal: 'Dmax≤420.00cGy' }] },
                    { roiName: 'Rectum', roiType: 'ORGAN', targets: [{ type: 'ORGAN', clinicalGoal: 'Dmax≤420.00cGy' }] },
                    // 晶格相关（用于验证过滤规则）：不在匹配界面显示
                    { roiName: 'Lattice_Total', roiType: 'PTV', targets: [{ type: 'PTV', clinicalGoal: 'Dmax>600.00cGy' }], _lattice: true },
                    { roiName: 'Lattice_Ball_01', roiType: 'PTV', targets: [{ type: 'PTV', clinicalGoal: 'Dmean(95-100)>110%' }], _lattice: true }
                ]
            },
            {
                id: 'ct-tpl-user-demo',
                name: '临床目标模板-示例',
                templateType: 'clinical-target',
                isLattice: false,
                roiEntries: [
                    {
                        roiName: 'HRCTV',
                        roiType: 'PTV',
                        targets: [
                            { type: 'PTV', clinicalGoal: 'Dmax>600.00cGy' }
                        ]
                    }
                ]
            }
        ];

        this._ctModalStylesInjected = false;

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
        const filterBlock = this.options.showFilter
            ? `
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
                </div>`
            : '';

        this.container.innerHTML = `
            <div class="clinical-target-component">
                ${filterBlock}

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
                    <button class="clinical-target-toolbar-btn" id="${this.options.prefix}addBtn" title="添加目标">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="clinical-target-toolbar-btn" id="${this.options.prefix}editBtn" title="编辑目标" disabled>
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="clinical-target-toolbar-btn" id="${this.options.prefix}deleteBtn" title="删除" disabled>
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="clinical-target-toolbar-btn" id="${this.options.prefix}loadTemplateBtn" title="加载模板">
                        <i class="fas fa-folder-open"></i>
                    </button>
                    <button class="clinical-target-toolbar-btn" id="${this.options.prefix}createTemplateBtn" title="创建模板" disabled>
                        <i class="fas fa-save"></i>
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

        // 加载模板按钮
        const loadTemplateBtn = document.getElementById(`${this.options.prefix}loadTemplateBtn`);
        if (loadTemplateBtn) {
            loadTemplateBtn.addEventListener('click', () => this.openLoadTemplateModal());
        }

        // 创建模板按钮
        const createTemplateBtn = document.getElementById(`${this.options.prefix}createTemplateBtn`);
        if (createTemplateBtn) {
            createTemplateBtn.addEventListener('click', () => this.openCreateTemplateModal());
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

        const createTemplateBtn = document.getElementById(`${this.options.prefix}createTemplateBtn`);
        if (createTemplateBtn) {
            createTemplateBtn.disabled = !this.targets || this.targets.length === 0;
        }
    }

    openCreateTemplateModal() {
        this.ensureModalStyles();
        if (!this.targets || this.targets.length === 0) {
            return;
        }

        const snapshotTargets = this.targets.map(t => ({
            roi: t.roi,
            type: t.type,
            clinicalGoal: t.clinicalGoal
        }));

        const backdrop = document.createElement('div');
        backdrop.className = 'ct-modal-backdrop';
        backdrop.innerHTML = `
            <div class="ct-modal" style="min-width:720px; height:420px;">
                <div class="ct-modal-header">
                    <span>创建模板</span>
                    <button class="ct-icon-btn" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="ct-modal-body" style="display:flex; flex-direction:column; overflow:hidden;">
                    <div style="flex-shrink:0; display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                        <span style="font-size:12px; color:#ddd; white-space:nowrap;">模板名称：</span>
                        <input type="text" id="ctTemplateNameInput" maxlength="32"
                               style="width:260px; background:#111;border:1px solid #333;border-radius:4px;color:#ddd;padding:6px 8px;font-size:12px;">
                        <span id="ctTemplateNameTip" style="font-size:11px; color:#f87171; display:none;">模板名称已存在，请重新命名</span>
                    </div>
                    <div style="flex:1; min-height:0; border:1px solid #333; border-radius:4px; overflow:auto;">
                        <table class="ct-table" style="border:none;">
                            <thead>
                                <tr>
                                    <th style="width:160px;">ROI</th>
                                    <th>临床目标</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${snapshotTargets.map((t, idx) => `
                                    <tr>
                                        <td>${idx === 0 || snapshotTargets[idx - 1].roi !== t.roi ? t.roi : ''}</td>
                                        <td>${t.clinicalGoal || ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="ct-modal-footer">
                    <button class="ct-btn" data-role="cancel">取消</button>
                    <button class="ct-btn" data-role="ok" disabled>确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const nameInput = backdrop.querySelector('#ctTemplateNameInput');
        const tip = backdrop.querySelector('#ctTemplateNameTip');
        const okBtn = backdrop.querySelector('[data-role="ok"]');

        const isNameDuplicate = (name) => {
            return this.templates.some(t => t.templateType === 'clinical-target' && t.name === name);
        };

        const refreshOkState = () => {
            const raw = (nameInput.value || '').trim();
            const name = raw.length > 32 ? raw.slice(0, 32) : raw;
            if (name !== raw) nameInput.value = name;

            const valid = !!name && !isNameDuplicate(name);
            okBtn.disabled = !valid;
            tip.style.display = (!!name && isNameDuplicate(name)) ? 'inline' : 'none';
        };

        nameInput.addEventListener('input', refreshOkState);
        refreshOkState();

        const close = () => backdrop.remove();
        backdrop.querySelector('[data-role="cancel"]').addEventListener('click', close);
        const closeBtn = backdrop.querySelector('[data-role="close"]');
        if (closeBtn) closeBtn.addEventListener('click', close);
        okBtn.addEventListener('click', () => {
            const name = (nameInput.value || '').trim();
            if (!name) return;
            if (isNameDuplicate(name)) {
                refreshOkState();
                return;
            }

            // 生成模板 ROI 结构（按 ROI 聚合）
            const roiMap = new Map();
            snapshotTargets.forEach(t => {
                if (!roiMap.has(t.roi)) {
                    roiMap.set(t.roi, { roiName: t.roi, roiType: t.type || '', targets: [] });
                }
                roiMap.get(t.roi).targets.push({ type: t.type || '', clinicalGoal: t.clinicalGoal || '' });
            });

            this.templates.push({
                id: `ct-tpl-${Date.now()}`,
                name,
                templateType: 'clinical-target',
                isLattice: false,
                roiEntries: Array.from(roiMap.values())
            });

            close();
        });
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

    ensureModalStyles() {
        if (this._ctModalStylesInjected) return;
        this._ctModalStylesInjected = true;
        const style = document.createElement('style');
        style.textContent = `
            .ct-modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .ct-modal {
                background: #1a1a1a;
                border-radius: 6px;
                min-width: 420px;
                max-width: 760px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 16px rgba(0,0,0,0.6);
                border: 1px solid #333;
            }
            .ct-modal-header {
                flex-shrink: 0;
                padding: 10px 14px;
                border-bottom: 1px solid #333;
                background: #242424;
                font-weight: 500;
                font-size: 13px;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .ct-icon-btn {
                min-width: 26px;
                width: 26px;
                height: 26px;
                padding: 0;
                background: transparent;
                border: none;
                border-radius: 4px;
                color: #bbb;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .ct-icon-btn:hover {
                background: rgba(255, 255, 255, 0.08);
                color: #fff;
            }
            .ct-icon-btn svg {
                width: 14px;
                height: 14px;
                display: block;
                fill: currentColor;
            }
            .ct-modal-body {
                flex: 1;
                min-height: 0;
                padding: 10px 14px;
                overflow: auto;
            }
            .ct-modal-footer {
                flex-shrink: 0;
                padding: 8px 14px;
                border-top: 1px solid #333;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 8px;
            }
            .ct-btn {
                background: #252525;
                border: 1px solid #333;
                border-radius: 4px;
                color: #ddd;
                padding: 6px 10px;
                font-size: 12px;
                cursor: pointer;
            }
            .ct-btn:hover {
                border-color: #555;
                background: #2a2a2a;
            }
            .ct-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .ct-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
            }
            .ct-table thead {
                background: #2a2a2a;
                position: sticky;
                top: 0;
                z-index: 1;
            }
            .ct-table th, .ct-table td {
                padding: 8px 6px;
                color: #ddd;
                border-bottom: 1px solid #2a2a2a;
                border-right: 1px solid #2a2a2a;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .ct-table th:last-child, .ct-table td:last-child { border-right: none; }
        `;
        document.head.appendChild(style);
    }

    showAlert(message) {
        this.ensureModalStyles();
        const backdrop = document.createElement('div');
        backdrop.className = 'ct-modal-backdrop';
        backdrop.innerHTML = `
            <div class="ct-modal" style="min-width:320px; max-width:420px;">
                <div class="ct-modal-header">
                    <span>提示</span>
                    <button class="ct-icon-btn" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="ct-modal-body" style="font-size:12px; color:#ddd;">${message}</div>
                <div class="ct-modal-footer">
                    <button class="ct-btn" data-role="ok">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);
        const close = () => backdrop.remove();
        backdrop.querySelector('[data-role="ok"]').addEventListener('click', close);
        const closeBtn = backdrop.querySelector('[data-role="close"]');
        if (closeBtn) closeBtn.addEventListener('click', close);
    }

    showConfirm(message, onOk) {
        this.ensureModalStyles();
        const backdrop = document.createElement('div');
        backdrop.className = 'ct-modal-backdrop';
        backdrop.innerHTML = `
            <div class="ct-modal" style="min-width:320px; max-width:440px;">
                <div class="ct-modal-header">
                    <span>确认</span>
                    <button class="ct-icon-btn" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="ct-modal-body" style="font-size:12px; color:#ddd;">${message}</div>
                <div class="ct-modal-footer">
                    <button class="ct-btn" data-role="cancel">取消</button>
                    <button class="ct-btn" data-role="ok">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);
        const close = () => backdrop.remove();
        backdrop.querySelector('[data-role="cancel"]').addEventListener('click', close);
        backdrop.querySelector('[data-role="ok"]').addEventListener('click', () => {
            close();
            if (typeof onOk === 'function') onOk();
        });
        const closeBtn = backdrop.querySelector('[data-role="close"]');
        if (closeBtn) closeBtn.addEventListener('click', close);
    }

    normalizeRoiName(name) {
        return String(name || '')
            .toLowerCase()
            .replace(/[\s\-_]/g, '');
    }

    isLatticeRoiName(name) {
        const upper = String(name || '').toUpperCase();
        return upper.includes('LATTICE');
    }

    isSFRTEntryName(name) {
        const upper = String(name || '').toUpperCase();
        return upper.includes('SFRT');
    }

    openLoadTemplateModal() {
        this.ensureModalStyles();
        if (!this.templates || !this.templates.length) {
            this.showAlert('当前没有可用的模板。');
            return;
        }

        let selectedTemplate = this.templates[0];

        const buildPreviewRows = (tpl) => {
            const rows = [];
            (tpl.roiEntries || []).forEach(entry => {
                (entry.targets || []).forEach((t, idx) => {
                    rows.push(`
                        <tr>
                            <td>${idx === 0 ? entry.roiName : ''}</td>
                            <td>${t.clinicalGoal || ''}</td>
                        </tr>
                    `);
                });
            });
            return rows.join('') || `
                <tr><td colspan="2" style="text-align:center; padding:24px; color:#888;">模板为空</td></tr>
            `;
        };

        const backdrop = document.createElement('div');
        backdrop.className = 'ct-modal-backdrop';
        backdrop.innerHTML = `
            <div class="ct-modal" style="min-width:760px; height:420px;">
                <div class="ct-modal-header">
                    <span>加载模板</span>
                    <button class="ct-icon-btn" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="ct-modal-body" style="display:flex; flex-direction:column; overflow:hidden;">
                    <div style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div style="display:flex; align-items:center; gap:8px; flex:1;">
                            <span style="font-size:12px; color:#ddd; white-space:nowrap;">选择模板：</span>
                            <div class="clinical-target-dropdown" id="ctTemplateDropdown" style="width:260px;">
                                <div class="clinical-target-dropdown-trigger" id="ctTemplateDropdownTrigger">
                                    <span class="clinical-target-dropdown-text">${selectedTemplate.name}</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="clinical-target-dropdown-menu" id="ctTemplateDropdownMenu" style="display:none;">
                                    <input type="text"
                                           class="clinical-target-dropdown-search"
                                           id="ctTemplateSearch"
                                           placeholder="查找选项"
                                           style="width: 100%; padding: 6px 8px; border: none; border-bottom: 1px solid #333; background: #2a2a2a; color: #ddd; font-size: 12px; box-sizing: border-box;">
                                    <div class="clinical-target-dropdown-options" id="ctTemplateOptions"></div>
                                </div>
                            </div>
                        </div>
                        <button class="ct-btn" id="ctDeleteTemplateBtn">删除模板</button>
                    </div>
                    <div style="flex:1; min-height:0; border:1px solid #333; border-radius:4px; overflow:auto;">
                        <table class="ct-table" style="border:none;">
                            <thead>
                                <tr>
                                    <th style="width:160px;">ROI</th>
                                    <th>临床目标</th>
                                </tr>
                            </thead>
                            <tbody id="ctTemplatePreviewBody">${buildPreviewRows(selectedTemplate)}</tbody>
                        </table>
                    </div>
                </div>
                <div class="ct-modal-footer">
                    <span id="ctTemplateHint" style="flex:1; align-items:center; display:flex; font-size:11px; color:#9ca3af;"></span>
                    <button class="ct-btn" data-role="cancel">取消</button>
                    <button class="ct-btn" data-role="next">下一步</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const deleteBtn = backdrop.querySelector('#ctDeleteTemplateBtn');
        const tbody = backdrop.querySelector('#ctTemplatePreviewBody');
        const hint = backdrop.querySelector('#ctTemplateHint');
        const trigger = backdrop.querySelector('#ctTemplateDropdownTrigger');
        const menu = backdrop.querySelector('#ctTemplateDropdownMenu');
        const searchInput = backdrop.querySelector('#ctTemplateSearch');
        const optionsContainer = backdrop.querySelector('#ctTemplateOptions');

        const organLimitTemplates = () => this.templates.filter(t => t.templateType === 'organ-limit');
        const clinicalTargetTemplates = () => this.templates.filter(t => t.templateType === 'clinical-target');

        const refreshPreviewAndDeleteState = () => {
            tbody.innerHTML = buildPreviewRows(selectedTemplate);
            trigger.querySelector('.clinical-target-dropdown-text').textContent = selectedTemplate.name;
            deleteBtn.disabled = selectedTemplate.templateType !== 'clinical-target';
            hint.textContent = '';
        };

        const renderDropdownOptions = (keyword = '') => {
            const kw = keyword.trim().toLowerCase();
            const matchFilter = (t) => !kw || t.name.toLowerCase().includes(kw);

            const organList = organLimitTemplates().filter(matchFilter);
            const ctList = clinicalTargetTemplates().filter(matchFilter);

            let html = '';
            if (organList.length) {
                html += `<div style="padding:6px 12px;font-size:11px;color:#9ca3af;">器官限量模板</div>`;
                html += organList.map(t => `
                    <div class="clinical-target-dropdown-option" data-template-id="${t.id}">
                        ${t.name}
                    </div>
                `).join('');
            }
            if (ctList.length) {
                html += `<div style="padding:6px 12px;font-size:11px;color:#9ca3af;">临床目标模板</div>`;
                html += ctList.map(t => `
                    <div class="clinical-target-dropdown-option" data-template-id="${t.id}">
                        ${t.name}
                    </div>
                `).join('');
            }
            if (!html) {
                html = `<div style="padding:8px 12px;font-size:12px;color:#6b7280;">无匹配模板</div>`;
            }
            optionsContainer.innerHTML = html;
        };

        renderDropdownOptions();
        refreshPreviewAndDeleteState();

        trigger.addEventListener('click', () => {
            const visible = menu.style.display !== 'none';
            menu.style.display = visible ? 'none' : 'flex';
            if (!visible) {
                searchInput.value = '';
                renderDropdownOptions('');
                searchInput.focus();
            }
        });

        searchInput.addEventListener('input', () => {
            renderDropdownOptions(searchInput.value || '');
        });

        optionsContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.clinical-target-dropdown-option[data-template-id]');
            if (!item) return;
            const id = item.getAttribute('data-template-id');
            const tpl = this.templates.find(t => t.id === id);
            if (!tpl) return;
            selectedTemplate = tpl;
            menu.style.display = 'none';
            refreshPreviewAndDeleteState();
        });

        document.addEventListener('click', (e) => {
            if (!backdrop.contains(e.target)) return;
            const inDropdown = e.target.closest('#ctTemplateDropdown');
            if (!inDropdown) menu.style.display = 'none';
        });

        deleteBtn.addEventListener('click', () => {
            if (!selectedTemplate || selectedTemplate.templateType !== 'clinical-target') return;
            this.showConfirm(`是否删除模板：${selectedTemplate.name}？`, () => {
                this.templates = this.templates.filter(t => t.id !== selectedTemplate.id);
                if (!this.templates.length) {
                    backdrop.remove();
                    return;
                }
                selectedTemplate = this.templates[0];
                renderDropdownOptions(searchInput.value || '');
                refreshPreviewAndDeleteState();
            });
        });

        const close = () => backdrop.remove();
        backdrop.querySelector('[data-role="cancel"]').addEventListener('click', close);
        const closeBtn = backdrop.querySelector('[data-role="close"]');
        if (closeBtn) closeBtn.addEventListener('click', close);
        backdrop.querySelector('[data-role="next"]').addEventListener('click', () => {
            close();
            this.openTemplateMappingModal(selectedTemplate);
        });
    }

    openTemplateMappingModal(template) {
        this.ensureModalStyles();
        const allPlanRois = (this.planRois || []).slice();
        const allTemplateEntries = (template && template.roiEntries) ? template.roiEntries.slice() : [];

        // SFRT/晶格靶区模板：模板结构下不显示 SFRT/晶格相关结构（但整体仍支持选择匹配）
        const templateEntries = template && template.isLattice
            ? allTemplateEntries.filter(e =>
                !this.isSFRTEntryName(e.roiName) &&
                !this.isLatticeRoiName(e.roiName) &&
                !e._lattice
            )
            : allTemplateEntries;

        const planRois = allPlanRois;

        const autoMatchPlanRoi = (tplEntry) => {
            return planRois.find(r => r.name === tplEntry.roiName && r.type === tplEntry.roiType)
                || planRois.find(r => this.normalizeRoiName(r.name) === this.normalizeRoiName(tplEntry.roiName))
                || null;
        };

        const backdrop = document.createElement('div');
        backdrop.className = 'ct-modal-backdrop';

        const buildRows = () => {
            if (template && template.isLattice) {
                // 晶格靶区模板：匹配界面不展示任何 Lattice 相关结构（两侧均隐藏）
                // 仅展示模板中“非晶格/SFRT”的 ROI，并让用户选择映射到计划中“非晶格”的 ROI
                const nonLatticePlanRois = planRois.filter(r => !this.isLatticeRoiName(r.name));

                const rows = templateEntries.map(entry => {
                    const auto = autoMatchPlanRoi(entry);
                    const autoId = auto ? auto.id : '';

                    return `
                        <tr data-template-roi="${entry.roiName}">
                            <td>${entry.roiName}</td>
                            <td>
                                <select data-role="plan-roi-select" style="width:100%; background:#111;border:1px solid #333;border-radius:4px;color:#ddd;padding:3px 6px;font-size:12px;">
                                    <option value="">none</option>
                                    ${nonLatticePlanRois.map(r => `
                                        <option value="${r.id}" ${r.id === autoId ? 'selected' : ''}>
                                            ${r.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </td>
                        </tr>
                    `;
                }).join('');

                return rows || `<tr><td colspan="2" style="text-align:center; padding:24px; color:#888;">无可匹配结构</td></tr>`;
            }

            // 普通模板：模板结构 -> 计划结构（可选）
            return templateEntries.map(entry => {
                const auto = autoMatchPlanRoi(entry);
                const autoId = auto ? auto.id : '';
                return `
                    <tr data-template-roi="${entry.roiName}">
                        <td>${entry.roiName}</td>
                        <td>
                            <select data-role="plan-roi-select" style="width:100%; background:#111;border:1px solid #333;border-radius:4px;color:#ddd;padding:3px 6px;font-size:12px;">
                                <option value="">none</option>
                                ${planRois.map(r => `
                                    <option value="${r.id}" ${r.id === autoId ? 'selected' : ''}>
                                        ${r.name}
                                    </option>
                                `).join('')}
                            </select>
                        </td>
                    </tr>
                `;
            }).join('');
        };

        backdrop.innerHTML = `
            <div class="ct-modal" style="min-width:560px; height:420px;">
                <div class="ct-modal-header">
                    <span>加载模板</span>
                    <button class="ct-icon-btn" type="button" data-role="close" aria-label="关闭">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="ct-modal-body" style="display:flex; flex-direction:column; overflow:hidden;">
                    ${template.isLattice ? `
                        <div style="flex-shrink:0; margin-bottom:8px; font-size:11px; color:#fbbf24;">
                            当前模板包含晶格靶区，将应用到所有小球和总勾画，此处不显示模板结构中的晶格靶区。
                        </div>
                    ` : ''}
                    <div style="flex:1; min-height:0; border:1px solid #333; border-radius:4px; overflow:auto;">
                        <table class="ct-table" style="border:none;">
                            <thead>
                                <tr>
                                    <th style="width:220px;">${template.isLattice ? '计划结构' : '模板结构'}</th>
                                    <th style="width:220px;">${template.isLattice ? '模板结构' : '计划结构'}</th>
                                </tr>
                            </thead>
                            <tbody id="ctTemplateMapBody">${buildRows()}</tbody>
                        </table>
                    </div>
                </div>
                <div class="ct-modal-footer">
                    <button class="ct-btn" data-role="cancel">取消</button>
                    <button class="ct-btn" data-role="ok">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const tbody = backdrop.querySelector('#ctTemplateMapBody');
        const close = () => backdrop.remove();
        backdrop.querySelector('[data-role="cancel"]').addEventListener('click', close);
        const closeBtn = backdrop.querySelector('[data-role="close"]');
        if (closeBtn) closeBtn.addEventListener('click', close);
        backdrop.querySelector('[data-role="ok"]').addEventListener('click', () => {
            const mapping = {};
            if (template && template.isLattice) {
                // 晶格靶区模板：模板结构 -> 计划结构（可选，且计划侧不含 Lattice）
                templateEntries.forEach(entry => {
                    const row = tbody.querySelector(`tr[data-template-roi="${entry.roiName}"]`);
                    if (!row) return;
                    const select = row.querySelector('select[data-role="plan-roi-select"]');
                    const planId = select ? select.value : '';
                    if (!planId) return;
                    const plan = planRois.find(r => r.id === planId);
                    if (plan) mapping[entry.roiName] = plan;
                });
            } else {
                templateEntries.forEach(entry => {
                    const row = tbody.querySelector(`tr[data-template-roi="${entry.roiName}"]`);
                    if (!row) return;
                    const select = row.querySelector('select[data-role="plan-roi-select"]');
                    const planId = select ? select.value : '';
                    if (!planId) return;
                    const plan = planRois.find(r => r.id === planId);
                    if (plan) mapping[entry.roiName] = plan;
                });
            }
            this.applyTemplateToTargets(template, mapping);
            close();
            this.renderTargets();
            this.updateToolbarButtons();
        });
    }

    applyTemplateToTargets(template, mapping) {
        if (!template || !mapping) return;
        const now = Date.now();

        (template.roiEntries || []).forEach(entry => {
            const planRoi = mapping[entry.roiName];
            if (!planRoi) return; // 未匹配：按需求略过

            (entry.targets || []).forEach((tplTarget, idx) => {
                const roiName = planRoi.name;
                const type = tplTarget.type || planRoi.type || entry.roiType || '';
                const clinicalGoal = tplTarget.clinicalGoal || '';

                // 覆盖规则：ROI + 类型 + 临床目标完全一致则覆盖，否则新增
                const existing = this.targets.find(t =>
                    t.roi === roiName &&
                    t.type === type &&
                    t.clinicalGoal === clinicalGoal
                );

                if (existing) {
                    existing.color = planRoi.color || existing.color;
                    // 预测剂量不保存：此原型不实现预测剂量列
                } else {
                    this.targets.push({
                        id: `tpl-${template.id}-${now}-${idx}-${Math.random().toString(16).slice(2)}`,
                        color: planRoi.color || '#888',
                        roi: roiName,
                        type,
                        clinicalGoal,
                        actualValue: '',
                        achieved: ''
                    });
                }
            });
        });
    }
}
