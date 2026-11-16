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

    static EYE_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAOCAYAAADwikbvAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAD6ADAAQAAAABAAAADgAAAAA6VvK5AAABSklEQVQoFcWQPUvDYBSF82WhU0iGENwEXcTBpT+g0m5ubg4OTnZy1EFwcXJwdlIoOItDBxGchLroH3DTRUggiUGqMR8+NzYlxe69cN57z73nvDdvFGVeoc5aHEXRSpZlu8zWwQ8Ypml66TjOe10/ZS6KQg+C4ADBMWjUhdShqqr7lmX1q/7EjHEhDMMBuTsefpPv4E1MG9SV9ty27Z5oNDkk2HhRM45odcCjpmk3mLeoCyCxh/ZIivI2SBvjvTTGcUV+A4fCMcv7e2hawomU3nK5Oc9z5683+2QuS6rNIjKAXW7mxgbbn2isyYQY0etwext8wF/h1+Tq3QPevVkRxfO8RV3XHxAsAYkvcAuaQN5f/Z9hkiRd13U/J2aGShzHDoNTtu1Ap2bwBJwxPxEj9T+B9BTf91tcsA1WoSmf/GwYRt80zZdSMPfjF6kgfYYGf2ugAAAAAElFTkSuQmCC";

    eyeImg(extraClass, visible, title, extraAttrs = '') {
        return `<img class="${extraClass}${visible ? ' visible' : ''}" src="${DOSEComponent.EYE_SRC}" alt="" title="${title}" draggable="false" ${extraAttrs}>`;
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="dose-panel-container">
                <!-- 参考值区域 -->
                <div class="dose-reference-section">
                    <div class="dose-reference-row">
                        <label class="dose-label">参考值</label>
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
                        <label class="dose-label dose-label-wide">当前最大值</label>
                        <div class="dose-max-input-wrap">
                            <input type="number" class="dose-input dose-max-input" 
                                   id="${this.options.prefix}doseCurrentMax" 
                                   value="${this.currentMax.toFixed(2)}" step="0.01">
                            <span class="dose-unit">cGy</span>
                        </div>
                    </div>
                </div>
                
                <!-- 剂量模板区域 -->
                <div class="dose-template-section">
                    <label class="dose-label">剂量模板</label>
                    <div class="dose-template-input-group">
                        <input type="text" class="dose-input dose-template-input" 
                               id="${this.options.prefix}doseTemplate" 
                               value="${this.doseTemplate}" 
                               placeholder="默认">
                        <i class="fas fa-chevron-down dose-template-dropdown-icon"></i>
                        <button class="dose-template-save-btn" id="${this.options.prefix}doseTemplateSave" title="保存模板">
                            <i class="fas fa-save"></i>
                        </button>
                    </div>
                </div>
                
                <!-- 剂量等级表格 -->
                <div class="dose-levels-section">
                    <table class="dose-levels-table">
                        <thead>
                            <tr>
                                <th class="dose-visibility-header" title="全部显示/全部隐藏">
                                    ${this.eyeImg('dose-header-visibility', this.doseLevels.every(level => level.visible), '全部显示/全部隐藏')}
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
                                        ${this.eyeImg('dose-visibility-icon', level.visible, '显隐', `data-index="${index}"`)}
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

                <!-- 操作按钮区域（ICON：填充 / 加粗 / 添加 / 删除 / 剂量转勾画） -->
                <div class="dose-actions-section">
                    <button class="dose-action-btn dose-tool-fill ${this.fillEnabled ? 'active' : ''}" 
                            id="${this.options.prefix}doseFill" 
                            title="填充"
                            type="button">
                        <i class="dose-tool-icon"></i>
                    </button>
                    <button class="dose-action-btn dose-tool-bold ${this.boldEnabled ? 'active' : ''}" 
                            id="${this.options.prefix}doseBold" 
                            title="加粗"
                            type="button">
                        <i class="dose-tool-icon"></i>
                    </button>
                    <button class="dose-action-btn dose-tool-add" 
                            id="${this.options.prefix}doseActionAdd" 
                            title="添加"
                            type="button">
                        <i class="dose-tool-icon"></i>
                    </button>
                    <button class="dose-action-btn dose-tool-delete" 
                            id="${this.options.prefix}doseActionDelete" 
                            title="删除"
                            type="button"
                            ${this.selectedLevelIndex === null ? 'disabled' : ''}>
                        <i class="dose-tool-icon"></i>
                    </button>
                    <button class="dose-action-btn dose-tool-to-roi" 
                            id="${this.options.prefix}doseActionToRoi" 
                            title="将指定的剂量线转勾画结构"
                            type="button">
                        <i class="dose-tool-icon"></i>
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents() {
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

        // 剂量转勾画
        const toRoiBtn = document.getElementById(`${this.options.prefix}doseActionToRoi`);
        if (toRoiBtn) {
            toRoiBtn.addEventListener('click', () => {
                this.showDoseToRoiModal();
            });
        }
        
        // 表头小眼睛：全部显示 / 全部隐藏
        const headerEye = this.container.querySelector('.dose-visibility-header');
        if (headerEye) {
            headerEye.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleAllLevelsVisibility();
            });
        }

        // 剂量等级表格事件
        const tableBody = document.getElementById(`${this.options.prefix}doseLevelsTableBody`);
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const visIcon = e.target.closest('.dose-visibility-icon');
                if (visIcon) {
                    e.stopPropagation();
                    const index = parseInt(visIcon.dataset.index, 10);
                    this.toggleLevelVisibility(index);
                    return;
                }

                const row = e.target.closest('.dose-level-row');
                if (row) {
                    this.selectLevel(parseInt(row.dataset.index, 10));
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

    getSelectedLevel() {
        if (this.selectedLevelIndex == null) return null;
        return this.doseLevels[this.selectedLevelIndex] || null;
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
        if (!this.doseLevels[index]) return;
        this.doseLevels[index].visible = !this.doseLevels[index].visible;
        this.render();
        this.bindEvents();
        if (this.options.onLevelVisibilityToggle) {
            this.options.onLevelVisibilityToggle(index, this.doseLevels[index].visible);
        }
    }

    toggleAllLevelsVisibility() {
        const allVisible = this.doseLevels.every(level => level.visible);
        this.doseLevels.forEach(level => {
            level.visible = !allVisible;
        });
        this.render();
        this.bindEvents();
        if (this.options.onGlobalVisibilityToggle) {
            this.options.onGlobalVisibilityToggle(!allVisible);
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

    /** 剂量线转勾画弹窗 */
    showDoseToRoiModal() {
        const existing = document.getElementById('doseToRoiModalMask');
        if (existing) existing.remove();

        const level = this.getSelectedLevel();
        const doseMin = 10.00;
        const doseMax = 15000.00;
        const initialDose = level ? Number(level.cgy).toFixed(2) : '';
        const initialColor = level ? level.color : '#ff0000';
        const roiOptions = (this.options.roiList || [
            { id: 'Body', name: 'Body' },
            { id: 'PTV', name: 'PTV' },
            { id: 'CTV', name: 'CTV' },
            { id: 'Bladder', name: 'Bladder' },
            { id: 'Rectum', name: 'Rectum' }
        ]).map(r => `<option value="${r.id}">${r.name}</option>`).join('');

        const doseLabel = initialDose !== '' ? `等剂量线${initialDose}` : '等剂量线';
        const isoOption = `<option value="__isodose__" class="dose-to-roi-iso-opt">${doseLabel}</option>`;

        const mask = document.createElement('div');
        mask.id = 'doseToRoiModalMask';
        mask.className = 'dose-to-roi-modal-mask';
        mask.innerHTML = `
            <div class="dose-to-roi-modal" role="dialog" aria-labelledby="doseToRoiTitle">
                <div class="dose-to-roi-header">
                    <span id="doseToRoiTitle">剂量线转勾画</span>
                    <button type="button" class="dose-to-roi-close" aria-label="关闭">&times;</button>
                </div>
                <div class="dose-to-roi-body">
                    <div class="dose-to-roi-row">
                        <label class="dose-to-roi-label">剂量线</label>
                        <div class="dose-to-roi-field-inline">
                            <label class="dose-to-roi-color-wrap" title="选择颜色">
                                <span class="dose-to-roi-color-swatch" id="doseToRoiColorSwatch" style="background:${initialColor}"></span>
                                <input type="color" id="doseToRoiColor" value="${initialColor}" class="dose-to-roi-color-input">
                            </label>
                            <input type="number" class="dose-to-roi-input" id="doseToRoiDose"
                                   value="${initialDose}"
                                   placeholder="[${doseMin.toFixed(2)} ~ ${doseMax.toFixed(2)}]"
                                   min="${doseMin}" max="${doseMax}" step="0.01">
                            <span class="dose-to-roi-unit">cGy</span>
                        </div>
                    </div>
                    <div class="dose-to-roi-row dose-to-roi-row-crop">
                        <div class="dose-to-roi-crop-block">
                            <div class="dose-to-roi-divider" aria-hidden="true"></div>
                            <label class="dose-to-roi-check">
                                <input type="checkbox" id="doseToRoiCrop">
                                <i class="dose-to-roi-check-ui" aria-hidden="true"></i>
                                <span>裁切</span>
                            </label>
                            <div class="dose-to-roi-row dose-to-roi-row-nested" id="doseToRoiMainRow">
                                <label class="dose-to-roi-label">主结构</label>
                                <select class="dose-to-roi-select" id="doseToRoiMainRoi" disabled>
                                    <option value="">请选择</option>
                                    ${isoOption}
                                    ${roiOptions}
                                </select>
                            </div>
                            <div class="dose-to-roi-radios" id="doseToRoiCropRadios">
                                <label class="dose-to-roi-radio">
                                    <input type="radio" name="doseToRoiCropType" value="overlap" disabled checked>
                                    <i class="dose-to-roi-radio-ui" aria-hidden="true"></i>
                                    <span>移除重叠部分</span>
                                </label>
                                <label class="dose-to-roi-radio">
                                    <input type="radio" name="doseToRoiCropType" value="extend" disabled>
                                    <i class="dose-to-roi-radio-ui" aria-hidden="true"></i>
                                    <span>移除外延部分</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="dose-to-roi-row" id="doseToRoiSubRow">
                        <label class="dose-to-roi-label">副结构</label>
                        <select class="dose-to-roi-select" id="doseToRoiSubRoi" disabled>
                            <option value="">请选择</option>
                            ${isoOption}
                            ${roiOptions}
                        </select>
                    </div>
                    <div class="dose-to-roi-row" id="doseToRoiMarginRow">
                        <label class="dose-to-roi-label">主副结构边缘间距</label>
                        <div class="dose-to-roi-field-inline">
                            <input type="number" class="dose-to-roi-input dose-to-roi-input-sm"
                                   id="doseToRoiMargin" value="0.5" min="0" max="5" step="0.1" disabled>
                            <span class="dose-to-roi-unit">cm</span>
                        </div>
                    </div>
                    <div class="dose-to-roi-divider" aria-hidden="true"></div>
                    <div class="dose-to-roi-row">
                        <label class="dose-to-roi-check dose-to-roi-derived">
                            <input type="checkbox" id="doseToRoiDerived" checked>
                            <i class="dose-to-roi-check-ui" aria-hidden="true"></i>
                            <span>视为衍生ROI</span>
                        </label>
                    </div>
                </div>
                <div class="dose-to-roi-footer">
                    <button type="button" class="dose-to-roi-btn dose-to-roi-btn-cancel" id="doseToRoiCancel">取消</button>
                    <button type="button" class="dose-to-roi-btn dose-to-roi-btn-ok" id="doseToRoiConfirm">确定</button>
                </div>
            </div>
        `;

        document.body.appendChild(mask);
        this.bindDoseToRoiModal(mask, level);
    }

    bindDoseToRoiModal(mask, level) {
        const close = () => mask.remove();
        const cropCb = mask.querySelector('#doseToRoiCrop');
        const radios = mask.querySelectorAll('input[name="doseToRoiCropType"]');
        const mainRoi = mask.querySelector('#doseToRoiMainRoi');
        const subRoi = mask.querySelector('#doseToRoiSubRoi');
        const margin = mask.querySelector('#doseToRoiMargin');
        const doseInput = mask.querySelector('#doseToRoiDose');
        const colorInput = mask.querySelector('#doseToRoiColor');
        const swatch = mask.querySelector('#doseToRoiColorSwatch');

        const formatIsoLabel = (raw) => {
            const n = parseFloat(raw);
            if (Number.isNaN(n)) return '等剂量线';
            return `等剂量线${Number(n).toFixed(2)}`;
        };

        const setSelectValue = (sel, value) => {
            // disabled 状态下直接赋值可能不生效，临时解除再设
            const wasDisabled = sel.disabled;
            sel.disabled = false;
            sel.value = value;
            const opt = [...sel.options].find(o => o.value === value);
            if (opt) opt.selected = true;
            sel.disabled = wasDisabled;
        };

        const syncIsoOptions = () => {
            const raw = String(doseInput.value || '').trim();
            const hasDose = raw !== '' && !Number.isNaN(parseFloat(raw));
            const label = hasDose ? formatIsoLabel(raw) : '等剂量线';

            mask.querySelectorAll('.dose-to-roi-iso-opt').forEach(opt => {
                opt.textContent = label;
                opt.hidden = !hasDose;
                // 不用 option.disabled，避免设值失败
            });

            if (!hasDose) {
                setSelectValue(mainRoi, '');
                setSelectValue(subRoi, '');
            } else {
                // 有剂量时主结构立即默认「等剂量线xxx」（不依赖裁切勾选）
                if (mainRoi.value === '' || mainRoi.value === '__isodose__') {
                    setSelectValue(mainRoi, '__isodose__');
                }
                if (subRoi.value === '__isodose__') {
                    setSelectValue(subRoi, '__isodose__');
                }
            }
        };

        syncIsoOptions();
        doseInput.addEventListener('input', syncIsoOptions);
        doseInput.addEventListener('change', syncIsoOptions);

        const syncCropEnabled = () => {
            const on = cropCb.checked;
            radios.forEach(r => { r.disabled = !on; });
            mainRoi.disabled = !on;
            subRoi.disabled = !on;
            margin.disabled = !on;
            mask.querySelector('#doseToRoiCropRadios').classList.toggle('disabled', !on);
            mainRoi.classList.toggle('disabled', !on);
            subRoi.classList.toggle('disabled', !on);
            margin.classList.toggle('disabled', !on);
            mask.querySelector('#doseToRoiMainRow').classList.toggle('disabled', !on);
            mask.querySelector('#doseToRoiSubRow').classList.toggle('disabled', !on);
            mask.querySelector('#doseToRoiMarginRow').classList.toggle('disabled', !on);
            // 勾选裁切时再同步一次，确保主结构显示正确
            syncIsoOptions();
        };
        cropCb.addEventListener('change', syncCropEnabled);
        syncCropEnabled();

        colorInput.addEventListener('input', () => {
            swatch.style.background = colorInput.value;
        });

        mask.querySelector('.dose-to-roi-close').addEventListener('click', close);
        mask.querySelector('#doseToRoiCancel').addEventListener('click', close);
        mask.addEventListener('click', (e) => {
            if (e.target === mask) close();
        });

        mask.querySelector('#doseToRoiConfirm').addEventListener('click', () => {
            const doseVal = parseFloat(doseInput.value);
            if (Number.isNaN(doseVal) || doseVal < 10 || doseVal > 15000) {
                alert('请输入有效的剂量线值（10.00 ~ 15000.00 cGy）');
                return;
            }
            if (cropCb.checked && !mainRoi.value) {
                alert('勾选裁切时请选择主结构');
                return;
            }
            if (cropCb.checked && !subRoi.value) {
                alert('勾选裁切时请选择副结构');
                return;
            }
            const payload = {
                doseCgy: doseVal,
                color: colorInput.value,
                crop: cropCb.checked,
                cropType: cropCb.checked
                    ? (mask.querySelector('input[name="doseToRoiCropType"]:checked') || {}).value
                    : null,
                mainRoiId: cropCb.checked ? mainRoi.value : null,
                subRoiId: cropCb.checked ? subRoi.value : null,
                marginCm: cropCb.checked ? parseFloat(margin.value) || 0.5 : null,
                asDerivedRoi: mask.querySelector('#doseToRoiDerived').checked,
                sourceLevelIndex: this.selectedLevelIndex,
                sourceLevel: level || null
            };
            if (typeof this.options.onDoseToRoi === 'function') {
                this.options.onDoseToRoi(payload);
            } else {
                console.log('剂量线转勾画确认', payload);
            }
            close();
        });
    }
}

window.DOSEComponent = DOSEComponent;
