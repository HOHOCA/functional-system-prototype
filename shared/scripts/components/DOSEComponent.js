class DOSEComponent {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            prefix: options.prefix || '',
            onDoseTypeChange: options.onDoseTypeChange || null,
            onDoseSourceChange: options.onDoseSourceChange || null,
            onGlobalVisibilityToggle: options.onGlobalVisibilityToggle || null,
            onFillToggle: options.onFillToggle || null,
            onBoldToggle: options.onBoldToggle || null,
            ...options
        };
        
        // 初始化数据
        this.referencePercent = 100.00;
        this.referenceDose = 600.00; // cGy - 100%对应的剂量值
        this.currentMax = 84226.98;
        this.doseTemplate = '';
        
        // 下拉框状态
        this.doseType = 'physical'; // 'physical' 或 'biological'
        this.doseSource = 'planned'; // 'planned', 'base', 'group+base', 'joint', 'beamGroup', 'beam'
        
        // 操作按钮状态
        this.globalVisible = true; // 全局等剂量线显示状态
        this.fillEnabled = true; // 填充状态，默认打开
        this.boldEnabled = false; // 加粗状态
        
        // 选中的剂量等级索引
        this.selectedLevelIndex = null;
        
        // 剂量等级数据
        this.doseLevels = [
            { percent: 110.00, cgy: 660.00, color: '#ff00ff', visible: true }, // 品红色
            { percent: 105.00, cgy: 630.00, color: '#8b0000', visible: true }, // 深红色
            { percent: 100.00, cgy: 600.00, color: '#ff0000', visible: true }, // 红色
            { percent: 95.00, cgy: 570.00, color: '#ff8c00', visible: true },  // 橙色
            { percent: 85.00, cgy: 510.00, color: '#ffff00', visible: true },  // 黄色
            { percent: 60.00, cgy: 360.00, color: '#00ff00', visible: true },  // 绿色
            { percent: 40.00, cgy: 240.00, color: '#00ffff', visible: true },  // 青色
            { percent: 20.00, cgy: 120.00, color: '#0000ff', visible: true }   // 蓝色
        ];
        
        // 射束组和射束数据（示例数据，实际应从外部获取）
        this.beamGroups = [
            { id: 'group1', name: 'Group1', hasDose: true },
            { id: 'group2', name: 'Group2', hasDose: true }
        ];
        this.beams = [
            { id: 'beam1', groupId: 'group1', name: 'Group1-Beam1', hasDose: true },
            { id: 'beam2', groupId: 'group1', name: 'Group1-Beam2', hasDose: true },
            { id: 'beam3', groupId: 'group2', name: 'Group2-Beam1', hasDose: true }
        ];
        this.hasBasePlan = false; // 是否有基底计划
        this.hasJointOptimization = false; // 是否有共同优化
        this.isMultiBeamGroup = this.beamGroups.length > 1; // 是否多射束组计划
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        if (!this.container) return;
        
        // 生成射束组选项
        const beamGroupOptions = this.isMultiBeamGroup 
            ? this.beamGroups.filter(g => g.hasDose).map(g => 
                `<option value="beamGroup:${g.id}">${g.name}</option>`
            ).join('')
            : '';
        
        // 生成射束选项
        const beamOptions = this.beams.filter(b => b.hasDose).map(b => 
            `<option value="beam:${b.id}">${b.name}</option>`
        ).join('');
        
        this.container.innerHTML = `
            <div class="dose-panel-container">
                <!-- 顶部下拉菜单区域 -->
                <div class="dose-header-section">
                    <div class="dose-dropdown-group">
                        <select class="dose-dropdown" id="${this.options.prefix}doseTypeDropdown">
                            <option value="physical" ${this.doseType === 'physical' ? 'selected' : ''}>物理剂量</option>
                            <option value="biological" ${this.doseType === 'biological' ? 'selected' : ''}>生物剂量</option>
                        </select>
                        <select class="dose-dropdown" id="${this.options.prefix}doseSourceDropdown">
                            <option value="planned" ${this.doseSource === 'planned' ? 'selected' : ''}>计划剂量</option>
                            ${this.hasBasePlan ? `<option value="base" ${this.doseSource === 'base' ? 'selected' : ''}>基底剂量</option>` : ''}
                            ${this.hasBasePlan ? `<option value="group+base" ${this.doseSource === 'group+base' ? 'selected' : ''}>射束组+基底剂量</option>` : ''}
                            ${this.hasJointOptimization ? `<option value="joint" ${this.doseSource === 'joint' ? 'selected' : ''}>共同优化剂量</option>` : ''}
                            ${beamGroupOptions}
                            ${beamOptions}
                        </select>
                    </div>
                </div>
                
                <!-- 参考值区域 -->
                <div class="dose-reference-section">
                    <div class="dose-reference-row">
                        <label class="dose-label">参考值：</label>
                        <div class="dose-reference-inputs">
                            <input type="number" class="dose-input dose-percent-input" 
                                   id="${this.options.prefix}doseReferencePercent" 
                                   value="${this.referencePercent.toFixed(2)}" step="0.01">
                            <span class="dose-unit">%</span>
                            <span class="dose-equals">=</span>
                            <input type="number" class="dose-input dose-cgy-input" 
                                   id="${this.options.prefix}doseReferenceCgy" 
                                   value="${this.referenceDose.toFixed(2)}" step="0.01">
                            <span class="dose-unit">cGy</span>
                        </div>
                    </div>
                    <div class="dose-current-max-row">
                        <label class="dose-label">当前最大值：</label>
                        <input type="number" class="dose-input dose-max-input" 
                               id="${this.options.prefix}doseCurrentMax" 
                               value="${this.currentMax.toFixed(2)}" step="0.01">
                    </div>
                </div>
                
                <!-- 剂量模板区域 -->
                <div class="dose-template-section">
                    <label class="dose-label">剂量模板：</label>
                    <div class="dose-template-input-group">
                        <input type="text" class="dose-input dose-template-input" 
                               id="${this.options.prefix}doseTemplate" 
                               value="${this.doseTemplate}" 
                               placeholder="选择或输入模板名称">
                        <i class="fas fa-chevron-down dose-template-dropdown-icon"></i>
                        <button class="dose-template-save-btn" id="${this.options.prefix}doseTemplateSave" title="保存模板">
                            <i class="fas fa-save"></i>
                        </button>
                    </div>
                </div>
                
                <!-- 操作按钮区域 -->
                <div class="dose-actions-section">
                    <button class="dose-action-btn" 
                            id="${this.options.prefix}doseFill" 
                            title="填充">
                        <i class="fas fa-fill-drip"></i>
                    </button>
                    <button class="dose-action-btn ${this.boldEnabled ? 'active' : ''}" 
                            id="${this.options.prefix}doseBold" 
                            title="加粗">
                        <i class="fas fa-bold"></i>
                    </button>
                    <button class="dose-action-btn" 
                            id="${this.options.prefix}doseActionAdd" 
                            title="添加">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="dose-action-btn" 
                            id="${this.options.prefix}doseActionDelete" 
                            title="删除"
                            ${this.selectedLevelIndex === null ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <!-- 剂量等级表格 -->
                <div class="dose-levels-section">
                    <table class="dose-levels-table">
                        <thead>
                            <tr>
                                <th class="dose-visibility-header">
                                    <i class="fas fa-eye"></i>
                                </th>
                                <th>颜色</th>
                                <th>剂量[%]</th>
                                <th>剂量[cGy]</th>
                            </tr>
                        </thead>
                        <tbody id="${this.options.prefix}doseLevelsTableBody">
                            ${this.doseLevels.map((level, index) => `
                                <tr class="dose-level-row ${this.selectedLevelIndex === index ? 'selected' : ''}" 
                                    data-index="${index}">
                                    <td class="dose-visibility-cell">
                                        <i class="fas ${level.visible ? 'fa-eye dose-visibility-icon visible' : 'fa-eye-slash dose-visibility-icon'}" 
                                           data-index="${index}"></i>
                                    </td>
                                    <td class="dose-color-cell">
                                        <div class="dose-color-box" style="background-color: ${level.color};"></div>
                                    </td>
                                    <td class="dose-percent-cell">
                                        <input type="number" class="dose-level-input dose-level-percent" 
                                               value="${level.percent.toFixed(2)}" 
                                               step="0.01" 
                                               data-index="${index}">
                                    </td>
                                    <td class="dose-cgy-cell">
                                        <input type="number" class="dose-level-input dose-level-cgy" 
                                               value="${level.cgy.toFixed(2)}" 
                                               step="0.01" 
                                               data-index="${index}">
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 下拉框1：剂量类型
        const doseTypeDropdown = document.getElementById(`${this.options.prefix}doseTypeDropdown`);
        if (doseTypeDropdown) {
            doseTypeDropdown.addEventListener('change', (e) => {
                this.doseType = e.target.value;
                if (this.options.onDoseTypeChange) {
                    this.options.onDoseTypeChange(this.doseType);
                }
            });
        }
        
        // 下拉框2：剂量来源
        const doseSourceDropdown = document.getElementById(`${this.options.prefix}doseSourceDropdown`);
        if (doseSourceDropdown) {
            doseSourceDropdown.addEventListener('change', (e) => {
                this.doseSource = e.target.value;
                if (this.options.onDoseSourceChange) {
                    this.options.onDoseSourceChange(this.doseSource);
                }
            });
        }
        
        // 参考值输入框事件
        const referencePercentInput = document.getElementById(`${this.options.prefix}doseReferencePercent`);
        const referenceCgyInput = document.getElementById(`${this.options.prefix}doseReferenceCgy`);
        
        if (referencePercentInput && referenceCgyInput) {
            // 百分比变化时，更新cGy值
            referencePercentInput.addEventListener('input', (e) => {
                const percent = parseFloat(e.target.value) || 0;
                this.referencePercent = percent;
                // 根据百分比和参考剂量值计算cGy
                const cgy = (percent / 100) * this.referenceDose;
                referenceCgyInput.value = cgy.toFixed(2);
                this.updateDoseLevels();
            });
            
            // cGy变化时，如果当前百分比是100%，则更新参考剂量值
            referenceCgyInput.addEventListener('input', (e) => {
                const cgy = parseFloat(e.target.value) || 0;
                // 如果当前百分比是100%，则更新参考剂量值
                if (Math.abs(this.referencePercent - 100) < 0.01) {
                    this.referenceDose = cgy;
                    this.updateDoseLevels();
                } else {
                    // 否则根据cGy和当前百分比反推参考剂量值
                    this.referenceDose = (cgy / this.referencePercent) * 100;
                    this.updateDoseLevels();
                }
            });
        }
        
        // 操作按钮事件
        // 填充
        const fillBtn = document.getElementById(`${this.options.prefix}doseFill`);
        if (fillBtn) {
            fillBtn.addEventListener('click', () => {
                this.fillEnabled = !this.fillEnabled;
                this.render();
                this.bindEvents();
                if (this.options.onFillToggle) {
                    this.options.onFillToggle(this.fillEnabled);
                }
            });
        }
        
        // 加粗
        const boldBtn = document.getElementById(`${this.options.prefix}doseBold`);
        if (boldBtn) {
            boldBtn.addEventListener('click', () => {
                this.boldEnabled = !this.boldEnabled;
                this.render();
                this.bindEvents();
                if (this.options.onBoldToggle) {
                    this.options.onBoldToggle(this.boldEnabled);
                }
            });
        }
        
        // 添加
        const addBtn = document.getElementById(`${this.options.prefix}doseActionAdd`);
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addDoseLevel());
        }
        
        // 删除
        const deleteBtn = document.getElementById(`${this.options.prefix}doseActionDelete`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSelectedLevel());
        }
        
        // 剂量等级表格事件
        const tableBody = document.getElementById(`${this.options.prefix}doseLevelsTableBody`);
        if (tableBody) {
            // 行选择
            tableBody.addEventListener('click', (e) => {
                const row = e.target.closest('.dose-level-row');
                if (row) {
                    const index = parseInt(row.dataset.index);
                    this.selectLevel(index);
                }
            });
            
            // 可见性切换
            tableBody.addEventListener('click', (e) => {
                if (e.target.classList.contains('dose-visibility-icon')) {
                    e.stopPropagation();
                    const index = parseInt(e.target.dataset.index);
                    this.toggleLevelVisibility(index);
                }
            });
            
            // 百分比输入变化
            tableBody.addEventListener('input', (e) => {
                if (e.target.classList.contains('dose-level-percent')) {
                    const index = parseInt(e.target.dataset.index);
                    const percent = parseFloat(e.target.value) || 0;
                    this.updateLevelPercent(index, percent);
                }
            });
            
            // cGy输入变化
            tableBody.addEventListener('input', (e) => {
                if (e.target.classList.contains('dose-level-cgy')) {
                    const index = parseInt(e.target.dataset.index);
                    const cgy = parseFloat(e.target.value) || 0;
                    this.updateLevelCgy(index, cgy);
                }
            });
        }
        
        // 模板保存按钮
        const saveBtn = document.getElementById(`${this.options.prefix}doseTemplateSave`);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveTemplate());
        }
    }

    selectLevel(index) {
        this.selectedLevelIndex = index;
        this.render();
        this.bindEvents();
    }

    updateDoseLevels() {
        // 根据参考值更新所有剂量等级的cGy值
        this.doseLevels.forEach((level, index) => {
            const cgy = (level.percent / 100) * this.referenceDose;
            level.cgy = cgy;
            
            const row = document.querySelector(`.dose-level-row[data-index="${index}"]`);
            if (row) {
                const cgyInput = row.querySelector('.dose-level-cgy');
                if (cgyInput) {
                    cgyInput.value = cgy.toFixed(2);
                }
            }
        });
    }

    toggleLevelVisibility(index) {
        if (this.doseLevels[index]) {
            const icon = document.querySelector(`.dose-visibility-icon[data-index="${index}"]`);
            if (icon) {
                const isVisible = icon.classList.contains('visible');
                
                if (isVisible) {
                    icon.classList.remove('visible');
                    icon.className = 'fas fa-eye-slash dose-visibility-icon';
                    this.doseLevels[index].visible = false;
                } else {
                    icon.classList.add('visible');
                    icon.className = 'fas fa-eye dose-visibility-icon visible';
                    this.doseLevels[index].visible = true;
                }
            }
        }
    }

    updateLevelPercent(index, percent) {
        if (this.doseLevels[index]) {
            this.doseLevels[index].percent = percent;
            const cgy = (percent / 100) * this.referenceDose;
            this.doseLevels[index].cgy = cgy;
            
            const row = document.querySelector(`.dose-level-row[data-index="${index}"]`);
            if (row) {
                const cgyInput = row.querySelector('.dose-level-cgy');
                if (cgyInput) {
                    cgyInput.value = cgy.toFixed(2);
                }
            }
        }
    }

    updateLevelCgy(index, cgy) {
        if (this.doseLevels[index]) {
            this.doseLevels[index].cgy = cgy;
            const percent = (cgy / this.referenceDose) * 100;
            this.doseLevels[index].percent = percent;
            
            const row = document.querySelector(`.dose-level-row[data-index="${index}"]`);
            if (row) {
                const percentInput = row.querySelector('.dose-level-percent');
                if (percentInput) {
                    percentInput.value = percent.toFixed(2);
                }
            }
        }
    }

    addDoseLevel() {
        // 生成随机颜色
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        
        const newLevel = {
            percent: 50.00,
            cgy: (50.00 / 100) * this.referenceDose,
            color: randomColor,
            visible: true
        };
        
        // 添加到列表最上方
        this.doseLevels.unshift(newLevel);
        this.selectedLevelIndex = 0;
        this.render();
        this.bindEvents();
    }

    deleteSelectedLevel() {
        if (this.selectedLevelIndex !== null && this.doseLevels.length > 1) {
            this.doseLevels.splice(this.selectedLevelIndex, 1);
            this.selectedLevelIndex = null;
            this.render();
            this.bindEvents();
        }
    }

    saveTemplate() {
        const templateInput = document.getElementById(`${this.options.prefix}doseTemplate`);
        if (templateInput) {
            this.doseTemplate = templateInput.value;
            console.log('保存剂量模板:', this.doseTemplate, this.doseLevels);
            // 这里可以添加实际的保存逻辑
        }
    }
    
    // 公共方法：设置射束组和射束数据
    setBeamGroups(groups) {
        this.beamGroups = groups;
        this.isMultiBeamGroup = groups.length > 1;
        this.render();
        this.bindEvents();
    }
    
    setBeams(beams) {
        this.beams = beams;
        this.render();
        this.bindEvents();
    }
    
    setHasBasePlan(hasBasePlan) {
        this.hasBasePlan = hasBasePlan;
        this.render();
        this.bindEvents();
    }
    
    setHasJointOptimization(hasJointOptimization) {
        this.hasJointOptimization = hasJointOptimization;
        this.render();
        this.bindEvents();
    }
}

window.DOSEComponent = DOSEComponent;
