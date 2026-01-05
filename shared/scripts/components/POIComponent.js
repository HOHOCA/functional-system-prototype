// POI组件 - 可复用的POI面板组件
class POIComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            prefix: options.prefix || '',
            onPOISelect: options.onPOISelect || null,
            onToolClick: options.onToolClick || null,
            ...options
        };
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        // 初始化表头眼睛图标状态
        setTimeout(() => {
            this.updateHeaderEyeIcon();
        }, 100);
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="poi-panel-container">
            <div class="poi-struct-header">
                <div class="struct-info">
                    <i class="fas fa-eye"></i>
                    <span class="struct-name">CT1 RTStruct1 2024-06-06 12:00:00</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            
            <div class="poi-list-section">
                <div class="poi-tree">
                            <div class="poi-item" data-poi="ISO">
                                <i class="fas fa-eye poi-visibility visible"></i>
                                <div class="poi-color" style="background: #ff6b6b;"></div>
                                <span class="poi-name">ISO</span>
                                <i class="fas fa-crosshairs poi-type-icon"></i>
                            </div>
                            <div class="poi-item" data-poi="Laser">
                                <i class="fas fa-eye poi-visibility visible"></i>
                                <div class="poi-color" style="background: #4ecdc4;"></div>
                                <span class="poi-name">Laser</span>
                                <i class="fas fa-crosshairs poi-type-icon"></i>
                            </div>
                            <div class="poi-item" data-poi="Marker1">
                                <i class="fas fa-eye poi-visibility visible"></i>
                                <div class="poi-color" style="background: #45b7d1;"></div>
                                <span class="poi-name">Marker1</span>
                                <i class="fas fa-map-marker-alt poi-type-icon"></i>
                            </div>
                            <div class="poi-item" data-poi="Control1">
                                <i class="fas fa-eye poi-visibility visible"></i>
                                <div class="poi-color" style="background: #96ceb4;"></div>
                                <span class="poi-name">Control1</span>
                                <i class="fas fa-map-marker-alt poi-type-icon"></i>
                            </div>
                            <div class="poi-item" data-poi="Registration1">
                                <i class="fas fa-eye poi-visibility visible"></i>
                                <div class="poi-color" style="background: #feca57;"></div>
                                <span class="poi-name">Registration1</span>
                                <i class="fas fa-map-marker-alt poi-type-icon"></i>
                    </div>
                </div>
            </div>
            
            <div class="poi-toolbar-section">
                <div class="poi-toolbar">
                    <button class="poi-tool-btn" id="${this.options.prefix}poi-visibility-btn" title="全局显隐">
                        <i class="far fa-eye"></i>
                    </button>
                    <button class="poi-tool-btn" id="${this.options.prefix}poi-add-btn" title="新建点">
                        <i class="fas fa-crosshairs"></i>
                    </button>
                    <button class="poi-tool-btn" id="${this.options.prefix}poi-delete-btn" title="删除点">
                        <i class="far fa-trash-alt"></i>
                    </button>
                    <button class="poi-tool-btn" id="${this.options.prefix}poi-move-btn" title="移动点">
                        <i class="fas fa-arrows-alt"></i>
                    </button>
                </div>
            </div>
            
            <div class="poi-info-section">
                <div class="poi-properties-form">
                    <div class="poi-property-item">
                        <label class="poi-property-label">名称:</label>
                        <div class="poi-property-input">
                            <div class="poi-name-input">
                                <div class="poi-color-indicator" style="background: #feca57;"></div>
                                <input type="text" class="poi-text-input" value="Laser">
                            </div>
                            <button class="poi-edit-btn" title="编辑">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="poi-property-item">
                        <label class="poi-property-label">层次:</label>
                        <div class="poi-readonly-text">49</div>
                    </div>
                    
                    <div class="poi-property-item">
                        <label class="poi-property-label">类型:</label>
                        <select class="poi-select">
                            <option value="INIT_LASER_ISO" selected>INIT_LASER_ISO</option>
                            <option value="ISO">ISO</option>
                            <option value="Marker">Marker</option>
                            <option value="Control">Control</option>
                            <option value="Registration">Registration</option>
                        </select>
                    </div>
                    
                    <div class="poi-property-item">
                        <label class="poi-property-label">ROI中心:</label>
                        <select class="poi-select">
                            <option value="">请选择ROI</option>
                        </select>
                    </div>
                    
                    <div class="poi-property-item">
                        <label class="poi-property-label">坐标:</label>
                        <div class="poi-coordinates">
                            <div class="poi-coord-item">
                                <span class="poi-coord-label">X:</span>
                                <input type="text" class="poi-coord-input" value="0.04">
                                <span class="poi-coord-unit">cm</span>
                            </div>
                            <div class="poi-coord-item">
                                <span class="poi-coord-label">Y:</span>
                                <input type="text" class="poi-coord-input" value="-128.00">
                                <span class="poi-coord-unit">cm</span>
                                <button class="poi-edit-btn" title="编辑">
                                    <i class="fas fa-pencil-alt"></i>
                                </button>
                            </div>
                            <div class="poi-coord-item">
                                <span class="poi-coord-label">Z:</span>
                                <input type="text" class="poi-coord-input" value="-5.59">
                                <span class="poi-coord-unit">cm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        `;
    }

    bindEvents() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // POI项目选择
        const poiItems = container.querySelectorAll('.poi-item');
        poiItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // 移除其他项目的active状态
                poiItems.forEach(pi => pi.classList.remove('active'));
                
                // 添加当前项目的active状态
                item.classList.add('active');
                
                // 触发回调
                if (this.options.onPOISelect) {
                    const poiName = item.getAttribute('data-poi');
                    this.options.onPOISelect(poiName, item);
                }
            });
        });

        // 表头眼睛图标点击事件（全部显示/隐藏）
        const structHeader = container.querySelector('.poi-struct-header');
        if (structHeader) {
            const headerEyeIcon = structHeader.querySelector('.fa-eye');
            if (headerEyeIcon) {
                headerEyeIcon.style.cursor = 'pointer';
                headerEyeIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleAllPOIVisibility();
                });
            }
        }

        // POI可见性切换
        const visibilityIcons = container.querySelectorAll('.poi-visibility');
        visibilityIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = icon.classList.contains('visible');
                
                if (isVisible) {
                    icon.classList.remove('visible');
                    icon.className = 'fas fa-eye-slash poi-visibility';
                } else {
                    icon.classList.add('visible');
                    icon.className = 'fas fa-eye poi-visibility visible';
                }
                
                // 更新表头眼睛图标状态
                this.updateHeaderEyeIcon();
            });
        });

        // 工具栏按钮点击
        const toolButtons = container.querySelectorAll('.poi-tool-btn');
        toolButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const buttonId = button.id;
                
                // 处理新建POI按钮
                if (buttonId === `${this.options.prefix}poi-add-btn`) {
                    this.showNewPOIModal();
                    return;
                }
                
                // 触发回调
                if (this.options.onToolClick) {
                    this.options.onToolClick(buttonId, button);
                }
            });
        });
    }

    // 获取当前选中的POI
    getSelectedPOI() {
        const container = document.getElementById(this.containerId);
        const activeItem = container.querySelector('.poi-item.active');
        return activeItem ? activeItem.getAttribute('data-poi') : null;
    }

    // 设置POI为选中状态
    setSelectedPOI(poiName) {
        const container = document.getElementById(this.containerId);
        const poiItems = container.querySelectorAll('.poi-item');
        poiItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-poi') === poiName) {
                item.classList.add('active');
            }
        });
    }

    // 显示新建POI模态窗口
    showNewPOIModal(mousePos = { x: 0, y: 0, z: 0 }) {
        const modal = document.createElement('div');
        modal.className = 'new-poi-modal-mask';
        modal.innerHTML = `
            <div class="new-poi-modal">
                <div class="modal-header">
                    <span>新建POI</span>
                    <button class="close-btn" aria-label="close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <label class="form-label required">名称</label>
                        <input type="text" id="new-poi-name" class="form-input" placeholder="请输入名称" maxlength="64">
                        <div class="form-hint" id="name-hint"></div>
                    </div>
                    
                    <div class="form-row">
                        <label class="form-label required">颜色</label>
                        <div class="color-picker-wrapper">
                            <div class="color-preview" id="new-poi-color-preview" style="background: #ff6b6b;"></div>
                            <button class="color-picker-btn" id="new-poi-color-picker">选择颜色</button>
                        </div>
                        <div class="form-hint" id="color-hint"></div>
                    </div>
                    
                    <div class="form-row">
                        <label class="form-label">类型</label>
                        <select id="new-poi-type" class="form-input">
                            <option value="UNDEFINED" selected>UNDEFINED</option>
                            <option value="ISO">ISO</option>
                            <option value="Marker">Marker</option>
                            <option value="Control">Control</option>
                            <option value="Registration">Registration</option>
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <label class="form-label">ROI中心</label>
                        <select id="new-poi-roi-center" class="form-input">
                            <option value="">请选择ROI</option>
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <label class="form-label required">XYZ坐标</label>
                        <div class="coord-inputs">
                            <div class="coord-item">
                                <label>X:</label>
                                <input type="number" id="new-poi-x" class="coord-input" value="${mousePos.x.toFixed(2)}" step="0.01">
                            </div>
                            <div class="coord-item">
                                <label>Y:</label>
                                <input type="number" id="new-poi-y" class="coord-input" value="${mousePos.y.toFixed(2)}" step="0.01">
                            </div>
                            <div class="coord-item">
                                <label>Z:</label>
                                <input type="number" id="new-poi-z" class="coord-input" value="${mousePos.z.toFixed(2)}" step="0.01">
                            </div>
                        </div>
                        <div class="form-hint" id="coord-hint"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="new-poi-cancel">取消</button>
                    <button class="btn btn-primary" id="new-poi-confirm">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.injectNewPOIStyles();
        this.initNewPOIModal(modal, mousePos);
    }

    // 初始化新建POI模态窗口
    initNewPOIModal(modal, mousePos) {
        const container = document.getElementById(this.containerId);
        const colorPicker = modal.querySelector('#new-poi-color-picker');
        const colorPreview = modal.querySelector('#new-poi-color-preview');
        const roiCenterSelect = modal.querySelector('#new-poi-roi-center');
        const xInput = modal.querySelector('#new-poi-x');
        const yInput = modal.querySelector('#new-poi-y');
        const zInput = modal.querySelector('#new-poi-z');
        const nameInput = modal.querySelector('#new-poi-name');
        const confirmBtn = modal.querySelector('#new-poi-confirm');
        const cancelBtn = modal.querySelector('#new-poi-cancel');
        const closeBtn = modal.querySelector('.close-btn');

        let selectedColor = '#ff6b6b';
        let coordRanges = { x: { min: -1000, max: 1000 }, y: { min: -1000, max: 1000 }, z: { min: -1000, max: 1000 } };

        // 获取ROI列表（从当前ROI组件或全局状态）
        this.loadROIList(roiCenterSelect);

        // 颜色选择器
        colorPicker.addEventListener('click', () => {
            this.showColorPicker(colorPreview, (color) => {
                selectedColor = color;
                colorPreview.style.background = color;
                modal.querySelector('#color-hint').textContent = '';
            });
        });

        // ROI中心选择
        roiCenterSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                // 获取ROI中心坐标（这里需要从ROI组件获取，暂时使用示例）
                const roiCenter = this.getROICenter(e.target.value);
                if (roiCenter) {
                    xInput.value = roiCenter.x.toFixed(2);
                    yInput.value = roiCenter.y.toFixed(2);
                    zInput.value = roiCenter.z.toFixed(2);
                }
            }
        });

        // 坐标输入时清空ROI选择
        [xInput, yInput, zInput].forEach(input => {
            input.addEventListener('input', () => {
                if (roiCenterSelect.value) {
                    roiCenterSelect.value = '';
                }
                this.validateCoordinate(input, coordRanges);
            });
        });

        // 名称验证
        nameInput.addEventListener('input', () => {
            this.validateName(nameInput);
        });

        // 确认按钮
        confirmBtn.addEventListener('click', () => {
            if (this.validateForm(nameInput, colorPreview, xInput, yInput, zInput, coordRanges)) {
                const poiData = {
                    name: nameInput.value.trim(),
                    color: selectedColor,
                    type: modal.querySelector('#new-poi-type').value,
                    x: parseFloat(xInput.value),
                    y: parseFloat(yInput.value),
                    z: parseFloat(zInput.value)
                };
                this.addPOI(poiData);
                this.closeModal(modal);
            }
        });

        // 取消按钮
        cancelBtn.addEventListener('click', () => this.closeModal(modal));
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    // 加载ROI列表
    loadROIList(selectElement) {
        // 这里需要从ROI组件获取ROI列表，暂时使用示例数据
        const roiList = this.options.getROIList ? this.options.getROIList() : [];
        roiList.forEach(roi => {
            const option = document.createElement('option');
            option.value = roi.name;
            option.textContent = roi.name;
            selectElement.appendChild(option);
        });
    }

    // 获取ROI中心坐标
    getROICenter(roiName) {
        // 这里需要从ROI组件获取ROI中心坐标，暂时返回示例
        if (this.options.getROICenter) {
            return this.options.getROICenter(roiName);
        }
        return null;
    }

    // 显示颜色选择器
    showColorPicker(colorPreview, callback) {
        // 创建简单的颜色选择器
        const colorPicker = document.createElement('div');
        colorPicker.className = 'simple-color-picker';
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff6348', '#ffa502', '#2ed573', '#1e90ff', '#ff4757', '#c44569', '#f8b500'];
        
        colors.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.background = color;
            colorItem.addEventListener('click', () => {
                callback(color);
                document.body.removeChild(colorPicker);
            });
            colorPicker.appendChild(colorItem);
        });

        const rect = colorPreview.getBoundingClientRect();
        colorPicker.style.position = 'fixed';
        colorPicker.style.left = rect.left + 'px';
        colorPicker.style.top = (rect.bottom + 5) + 'px';
        colorPicker.style.zIndex = '10001';
        
        document.body.appendChild(colorPicker);
        
        // 点击外部关闭
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (!colorPicker.contains(e.target) && e.target !== colorPreview && e.target !== colorPreview.parentElement) {
                    document.body.removeChild(colorPicker);
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 100);
    }

    // 验证名称
    validateName(input) {
        const hint = document.getElementById('name-hint');
        const value = input.value.trim();
        if (!value) {
            hint.textContent = '名称不能为空';
            input.classList.add('error');
            return false;
        }
        if (value.length > 64) {
            hint.textContent = '名称不能超过64个字符';
            input.classList.add('error');
            return false;
        }
        hint.textContent = '';
        input.classList.remove('error');
        return true;
    }

    // 验证坐标
    validateCoordinate(input, ranges) {
        const hint = document.getElementById('coord-hint');
        const value = parseFloat(input.value);
        const axis = input.id.replace('new-poi-', '').toUpperCase();
        const range = ranges[input.id.replace('new-poi-', '')];
        
        if (isNaN(value)) {
            hint.textContent = `${axis}坐标必须为数字`;
            input.classList.add('error');
            return false;
        }
        if (value < range.min || value > range.max) {
            hint.textContent = `${axis}坐标范围: ${range.min} ~ ${range.max}`;
            input.classList.add('error');
            return false;
        }
        hint.textContent = '';
        input.classList.remove('error');
        return true;
    }

    // 验证表单
    validateForm(nameInput, colorPreview, xInput, yInput, zInput, ranges) {
        let valid = true;
        if (!this.validateName(nameInput)) valid = false;
        if (!colorPreview.style.background || colorPreview.style.background === 'transparent') {
            document.getElementById('color-hint').textContent = '请选择颜色';
            valid = false;
        }
        if (!this.validateCoordinate(xInput, ranges)) valid = false;
        if (!this.validateCoordinate(yInput, ranges)) valid = false;
        if (!this.validateCoordinate(zInput, ranges)) valid = false;
        return valid;
    }

    // 添加POI到列表
    addPOI(poiData) {
        const container = document.getElementById(this.containerId);
        const poiTree = container.querySelector('.poi-tree');
        
        const poiItem = document.createElement('div');
        poiItem.className = 'poi-item';
        poiItem.setAttribute('data-poi', poiData.name);
        
        const typeIcon = poiData.type === 'ISO' || poiData.type === 'UNDEFINED' 
            ? 'fa-crosshairs' : 'fa-map-marker-alt';
        
        poiItem.innerHTML = `
            <i class="fas fa-eye poi-visibility visible"></i>
            <div class="poi-color" style="background: ${poiData.color};"></div>
            <span class="poi-name">${poiData.name}</span>
            <i class="fas ${typeIcon} poi-type-icon"></i>
        `;
        
        poiTree.appendChild(poiItem);
        
        // 绑定事件
        this.bindPOIItemEvents(poiItem);
        
        // 触发回调
        if (this.options.onPOIAdded) {
            this.options.onPOIAdded(poiData);
        }
    }

    // 绑定POI项事件
    bindPOIItemEvents(poiItem) {
        const container = document.getElementById(this.containerId);
        const poiItems = container.querySelectorAll('.poi-item');
        
        poiItem.addEventListener('click', (e) => {
            e.stopPropagation();
            poiItems.forEach(pi => pi.classList.remove('active'));
            poiItem.classList.add('active');
            
            if (this.options.onPOISelect) {
                const poiName = poiItem.getAttribute('data-poi');
                this.options.onPOISelect(poiName, poiItem);
            }
        });

        const visibilityIcon = poiItem.querySelector('.poi-visibility');
        if (visibilityIcon) {
            visibilityIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = visibilityIcon.classList.contains('visible');
                if (isVisible) {
                    visibilityIcon.classList.remove('visible');
                    visibilityIcon.className = 'fas fa-eye-slash poi-visibility';
                } else {
                    visibilityIcon.classList.add('visible');
                    visibilityIcon.className = 'fas fa-eye poi-visibility visible';
                }
            });
        }
    }

    // 关闭模态窗口
    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }

    // 注入新建POI模态窗口样式
    injectNewPOIStyles() {
        if (document.getElementById('new-poi-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'new-poi-modal-styles';
        style.textContent = `
            .new-poi-modal-mask {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .new-poi-modal {
                width: 480px;
                background: #2b2b2b;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            .new-poi-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: #333;
                border-bottom: 1px solid #444;
                color: #fff;
            }
            .new-poi-modal .close-btn {
                background: transparent;
                border: 0;
                color: #fff;
                font-size: 20px;
                cursor: pointer;
            }
            .new-poi-modal .modal-body {
                padding: 16px;
                color: #e5e7eb;
            }
            .new-poi-modal .form-row {
                margin-bottom: 16px;
            }
            .new-poi-modal .form-label {
                display: block;
                margin-bottom: 6px;
                color: #cbd5e1;
                font-size: 13px;
            }
            .new-poi-modal .form-label.required::after {
                content: ' *';
                color: #ef4444;
            }
            .new-poi-modal .form-input {
                width: 100%;
                background: #1f1f1f;
                border: 1px solid #3a3a3a;
                color: #e5e7eb;
                border-radius: 4px;
                padding: 6px 10px;
                box-sizing: border-box;
            }
            .new-poi-modal .form-input.error {
                border-color: #ef4444;
            }
            .new-poi-modal .form-input:focus {
                outline: none;
                border-color: #21a1f1;
            }
            .new-poi-modal .color-picker-wrapper {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .new-poi-modal .color-preview {
                width: 32px;
                height: 32px;
                border-radius: 4px;
                border: 1px solid #3a3a3a;
                cursor: pointer;
            }
            .new-poi-modal .color-picker-btn {
                background: #1f1f1f;
                border: 1px solid #3a3a3a;
                color: #e5e7eb;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
            }
            .new-poi-modal .coord-inputs {
                display: flex;
                gap: 10px;
            }
            .new-poi-modal .coord-item {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .new-poi-modal .coord-item label {
                color: #cbd5e1;
                font-size: 13px;
            }
            .new-poi-modal .coord-input {
                flex: 1;
                background: #1f1f1f;
                border: 1px solid #3a3a3a;
                color: #e5e7eb;
                border-radius: 4px;
                padding: 6px;
            }
            .new-poi-modal .coord-input.error {
                border-color: #ef4444;
            }
            .new-poi-modal .form-hint {
                margin-top: 4px;
                font-size: 12px;
                color: #ef4444;
                min-height: 16px;
            }
            .new-poi-modal .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 12px 16px;
                border-top: 1px solid #3a3a3a;
                background: #2f2f2f;
            }
            .new-poi-modal .btn {
                min-width: 86px;
                border: 0;
                border-radius: 4px;
                padding: 8px 12px;
                cursor: pointer;
            }
            .new-poi-modal .btn-primary {
                background: #21a1f1;
                color: #0b0b0b;
            }
            .new-poi-modal .btn-secondary {
                background: #4b5563;
                color: #e5e7eb;
            }
            .simple-color-picker {
                display: grid;
                grid-template-columns: repeat(4, 32px);
                gap: 4px;
                padding: 8px;
                background: #2b2b2b;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            .simple-color-picker .color-item {
                width: 32px;
                height: 32px;
                border-radius: 4px;
                cursor: pointer;
                border: 1px solid #3a3a3a;
            }
            .simple-color-picker .color-item:hover {
                border-color: #21a1f1;
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }

    // 切换所有POI的可见性
    toggleAllPOIVisibility() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        const visibilityIcons = container.querySelectorAll('.poi-visibility');
        if (visibilityIcons.length === 0) return;
        
        // 检查是否所有POI都可见
        const allVisible = Array.from(visibilityIcons).every(icon => {
            return icon.classList.contains('visible');
        });
        
        // 切换所有POI的可见性
        visibilityIcons.forEach(icon => {
            if (allVisible) {
                // 全部隐藏
                icon.classList.remove('visible');
                icon.className = 'fas fa-eye-slash poi-visibility';
            } else {
                // 全部显示
                icon.classList.add('visible');
                icon.className = 'fas fa-eye poi-visibility visible';
            }
        });
        
        // 更新表头眼睛图标
        this.updateHeaderEyeIcon();
    }
    
    // 更新表头眼睛图标状态
    updateHeaderEyeIcon() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        const structHeader = container.querySelector('.poi-struct-header');
        if (!structHeader) return;
        
        const headerEyeIcon = structHeader.querySelector('.fa-eye, .fa-eye-slash');
        if (!headerEyeIcon) return;
        
        const visibilityIcons = container.querySelectorAll('.poi-visibility');
        if (visibilityIcons.length === 0) {
            // 没有POI时，显示默认的眼睛图标
            headerEyeIcon.className = 'fas fa-eye';
            headerEyeIcon.style.color = '#888';
            return;
        }
        
        // 检查是否所有POI都可见
        const allVisible = Array.from(visibilityIcons).every(icon => {
            return icon.classList.contains('visible');
        });
        
        if (allVisible) {
            headerEyeIcon.className = 'fas fa-eye';
            headerEyeIcon.style.color = '#3AACDE';
        } else {
            headerEyeIcon.className = 'fas fa-eye-slash';
            headerEyeIcon.style.color = '#888';
        }
    }

    // 销毁组件
    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

// 导出组件
window.POIComponent = POIComponent;
