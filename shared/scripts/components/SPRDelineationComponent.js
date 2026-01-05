// SPR勾画组件
class SPRDelineationComponent {
    constructor(options = {}) {
        this.options = {
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null,
            getROIList: options.getROIList || null,
            getSPRMinMax: options.getSPRMinMax || null,
            getSPRValue: options.getSPRValue || null,
            onSPRPreview: options.onSPRPreview || null,
            ...options
        };
        
        this.modal = null;
        this.minValue = 0;
        this.maxValue = 300;
        this.lowerValue = 100;
        this.upperValue = 200;
        this.selectedRange = 'select-range'; // 'entire-structure' or 'select-range'
        this.targetStructure = 'new'; // 'new' or 'existing'
        this.newStructureName = '';
        this.newStructureColor = '#00ff00';
        this.newStructureType = 'BODY';
        this.existingStructureName = '';
        this.isPicking = false;
        this.pickingTarget = null; // 'min' or 'max' or 'lower' or 'upper'
        this.previewCanvas = null;
        this.previewContext = null;
        
        this.init();
    }
    
    init() {
        this.createModal();
        this.bindEvents();
    }
    
    createModal() {
        // 创建模态窗口
        this.modal = document.createElement('div');
        this.modal.className = 'spr-delineation-modal';
        this.modal.innerHTML = `
            <div class="spr-delineation-modal-content">
                <div class="spr-delineation-modal-header">
                    <h3>SPR 勾画</h3>
                    <button class="spr-delineation-close-btn" id="sprDelineationCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="spr-delineation-modal-body">
                    <!-- SPR区间设置 -->
                    <div class="spr-interval-section">
                        <div class="spr-section-title">
                            <span>SPR 区间</span>
                            <i class="fas fa-eye-dropper spr-picker-icon" id="sprPickerIcon" title="吸值，在视图中吸取 SPR 值"></i>
                        </div>
                        
                        <div class="spr-interval-inputs">
                            <div class="spr-interval-input-group">
                                <label>下限</label>
                                <input type="number" 
                                       class="spr-interval-input spr-lower-input" 
                                       id="sprLowerInput"
                                       value="${this.lowerValue}"
                                       min="${this.minValue}"
                                       max="${this.maxValue}"
                                       step="1">
                                <span class="spr-picker-trigger" data-target="lower">
                                    <i class="fas fa-eye-dropper"></i>
                                </span>
                            </div>
                            <div class="spr-interval-input-group">
                                <label>上限</label>
                                <input type="number" 
                                       class="spr-interval-input spr-upper-input" 
                                       id="sprUpperInput"
                                       value="${this.upperValue}"
                                       min="${this.minValue}"
                                       max="${this.maxValue}"
                                       step="1">
                                <span class="spr-picker-trigger" data-target="upper">
                                    <i class="fas fa-eye-dropper"></i>
                                </span>
                            </div>
                        </div>
                        
                        <div class="spr-slider-container">
                            <div class="spr-slider-track" id="sprSliderTrack">
                                <div class="spr-slider-handle spr-slider-handle-lower" 
                                     id="sprSliderHandleLower"
                                     data-target="lower"
                                     style="left: ${(this.lowerValue / this.maxValue) * 100}%"></div>
                                <div class="spr-slider-handle spr-slider-handle-upper" 
                                     id="sprSliderHandleUpper"
                                     data-target="upper"
                                     style="left: ${(this.upperValue / this.maxValue) * 100}%"></div>
                                <div class="spr-slider-range" 
                                     id="sprSliderRange"
                                     style="left: ${(this.lowerValue / this.maxValue) * 100}%; width: ${((this.upperValue - this.lowerValue) / this.maxValue) * 100}%"></div>
                            </div>
                            <div class="spr-slider-labels">
                                <span>${this.minValue}</span>
                                <span>${this.maxValue}</span>
                            </div>
                        </div>
                        
                        <div class="spr-range-select-text">选择范围</div>
                    </div>
                    
                    <!-- 范围选择 -->
                    <div class="spr-range-selection-section">
                        <div class="spr-radio-group">
                            <label class="spr-radio-label">
                                <input type="radio" 
                                       name="sprRangeSelection" 
                                       value="entire-structure"
                                       id="sprRangeEntireStructure">
                                <span>整个结构</span>
                            </label>
                            <label class="spr-radio-label">
                                <input type="radio" 
                                       name="sprRangeSelection" 
                                       value="select-range"
                                       id="sprRangeSelectRange"
                                       checked>
                                <span>选择范围</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- 目标结构选择 -->
                    <div class="spr-target-structure-section">
                        <div class="spr-section-title">目标结构</div>
                        
                        <div class="spr-radio-group">
                            <label class="spr-radio-label">
                                <input type="radio" 
                                       name="sprTargetStructure" 
                                       value="new"
                                       id="sprTargetNew"
                                       checked>
                                <span>新建结构</span>
                            </label>
                            <label class="spr-radio-label">
                                <input type="radio" 
                                       name="sprTargetStructure" 
                                       value="existing"
                                       id="sprTargetExisting">
                                <span>已有结构</span>
                            </label>
                        </div>
                        
                        <!-- 新建结构 -->
                        <div class="spr-new-structure-form" id="sprNewStructureForm">
                            <div class="spr-form-group">
                                <input type="text" 
                                       class="spr-structure-name-input" 
                                       id="sprStructureNameInput"
                                       placeholder="请输入内容">
                                <div class="spr-color-picker" id="sprColorPicker">
                                    <div class="spr-color-preview" style="background-color: ${this.newStructureColor}"></div>
                                </div>
                                <select class="spr-structure-type-select" id="sprStructureTypeSelect">
                                    <option value="BODY" selected>BODY</option>
                                    <option value="CTV">CTV</option>
                                    <option value="PTV">PTV</option>
                                    <option value="GTV">GTV</option>
                                    <option value="OAR">OAR</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- 已有结构 -->
                        <div class="spr-existing-structure-form" id="sprExistingStructureForm" style="display: none;">
                            <select class="spr-existing-structure-select" id="sprExistingStructureSelect">
                                <option value="">请选择ROI</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="spr-delineation-modal-footer">
                    <button class="spr-btn spr-btn-cancel" id="sprDelineationCancelBtn">取消</button>
                    <button class="spr-btn spr-btn-confirm" id="sprDelineationConfirmBtn">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.injectStyles();
    }
    
    injectStyles() {
        if (document.getElementById('spr-delineation-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'spr-delineation-styles';
        styles.textContent = `
            .spr-delineation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            
            .spr-delineation-modal-content {
                background: #2d2d2d;
                border-radius: 8px;
                width: 600px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            }
            
            .spr-delineation-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #404040;
            }
            
            .spr-delineation-modal-header h3 {
                margin: 0;
                color: #ffffff;
                font-size: 16px;
                font-weight: 500;
            }
            
            .spr-delineation-close-btn {
                background: transparent;
                border: none;
                color: #cccccc;
                cursor: pointer;
                font-size: 18px;
                padding: 5px 10px;
                transition: color 0.3s;
            }
            
            .spr-delineation-close-btn:hover {
                color: #ffffff;
            }
            
            .spr-delineation-modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .spr-section-title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
                color: #ffffff;
                font-size: 14px;
                font-weight: 500;
            }
            
            .spr-picker-icon {
                font-size: 16px;
                color: #666666;
                cursor: not-allowed;
                transition: color 0.3s;
            }
            
            .spr-picker-icon.active {
                color: #00aaff;
                cursor: pointer;
            }
            
            .spr-interval-inputs {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .spr-interval-input-group {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .spr-interval-input-group label {
                color: #cccccc;
                font-size: 12px;
            }
            
            .spr-interval-input-group {
                position: relative;
            }
            
            .spr-interval-input {
                background: #1a1a1a;
                border: 1px solid #404040;
                border-radius: 4px;
                color: #ffffff;
                padding: 8px 35px 8px 12px;
                font-size: 14px;
                width: 100%;
                box-sizing: border-box;
            }
            
            .spr-interval-input:focus {
                outline: none;
                border-color: #00aaff;
            }
            
            .spr-interval-input.error {
                border-color: #ff0000;
            }
            
            .spr-picker-trigger {
                position: absolute;
                right: 8px;
                top: 28px;
                color: #666666;
                cursor: not-allowed;
                font-size: 14px;
                transition: color 0.3s;
            }
            
            .spr-picker-trigger.active {
                color: #00aaff;
                cursor: pointer;
            }
            
            .spr-interval-input-group.active .spr-picker-trigger {
                color: #00aaff;
                cursor: pointer;
            }
            
            .spr-slider-container {
                margin-bottom: 10px;
            }
            
            .spr-slider-track {
                position: relative;
                height: 6px;
                background: #404040;
                border-radius: 3px;
                margin: 20px 0;
                cursor: pointer;
            }
            
            .spr-slider-range {
                position: absolute;
                height: 100%;
                background: #00aaff;
                border-radius: 3px;
                pointer-events: none;
            }
            
            .spr-slider-handle {
                position: absolute;
                width: 16px;
                height: 16px;
                background: #ffffff;
                border: 2px solid #00aaff;
                border-radius: 50%;
                cursor: grab;
                transform: translateX(-50%);
                top: -5px;
                transition: all 0.2s;
            }
            
            .spr-slider-handle:hover {
                transform: translateX(-50%) scale(1.2);
            }
            
            .spr-slider-handle:active {
                cursor: grabbing;
            }
            
            .spr-slider-labels {
                display: flex;
                justify-content: space-between;
                color: #cccccc;
                font-size: 12px;
                margin-top: 5px;
            }
            
            .spr-range-select-text {
                color: #888888;
                font-size: 12px;
                margin-top: 5px;
            }
            
            .spr-range-selection-section,
            .spr-target-structure-section {
                margin-top: 25px;
                padding-top: 25px;
                border-top: 1px solid #404040;
            }
            
            .spr-radio-group {
                display: flex;
                gap: 20px;
                margin-bottom: 15px;
            }
            
            .spr-radio-label {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #cccccc;
                font-size: 14px;
                cursor: pointer;
            }
            
            .spr-radio-label input[type="radio"] {
                margin: 0;
                cursor: pointer;
            }
            
            .spr-new-structure-form,
            .spr-existing-structure-form {
                margin-top: 15px;
            }
            
            .spr-form-group {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .spr-structure-name-input {
                flex: 1;
                background: #1a1a1a;
                border: 1px solid #404040;
                border-radius: 4px;
                color: #ffffff;
                padding: 8px 12px;
                font-size: 14px;
            }
            
            .spr-structure-name-input:focus {
                outline: none;
                border-color: #00aaff;
            }
            
            .spr-structure-name-input.error {
                border-color: #ff0000;
            }
            
            .spr-color-picker {
                width: 40px;
                height: 40px;
                border: 1px solid #404040;
                border-radius: 4px;
                cursor: pointer;
                overflow: hidden;
            }
            
            .spr-color-preview {
                width: 100%;
                height: 100%;
            }
            
            .spr-structure-type-select,
            .spr-existing-structure-select {
                background: #1a1a1a;
                border: 1px solid #404040;
                border-radius: 4px;
                color: #ffffff;
                padding: 8px 12px;
                font-size: 14px;
                cursor: pointer;
                min-width: 120px;
            }
            
            .spr-structure-type-select:focus,
            .spr-existing-structure-select:focus {
                outline: none;
                border-color: #00aaff;
            }
            
            .spr-delineation-modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 20px;
                border-top: 1px solid #404040;
            }
            
            .spr-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .spr-btn-cancel {
                background: #ffffff;
                color: #333333;
            }
            
            .spr-btn-cancel:hover {
                background: #f0f0f0;
            }
            
            .spr-btn-confirm {
                background: #0066cc;
                color: #ffffff;
            }
            
            .spr-btn-confirm:hover {
                background: #0088ff;
            }
            
            .spr-btn-confirm:disabled {
                background: #404040;
                color: #666666;
                cursor: not-allowed;
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    bindEvents() {
        // 关闭按钮
        const closeBtn = this.modal.querySelector('#sprDelineationCloseBtn');
        closeBtn.addEventListener('click', () => this.close());
        
        // 取消按钮
        const cancelBtn = this.modal.querySelector('#sprDelineationCancelBtn');
        cancelBtn.addEventListener('click', () => this.close());
        
        // 确定按钮
        const confirmBtn = this.modal.querySelector('#sprDelineationConfirmBtn');
        confirmBtn.addEventListener('click', () => this.handleConfirm());
        
        // 区间输入框
        const lowerInput = this.modal.querySelector('#sprLowerInput');
        const upperInput = this.modal.querySelector('#sprUpperInput');
        
        lowerInput.addEventListener('input', (e) => {
            this.handleLowerInputChange(e.target.value);
        });
        
        upperInput.addEventListener('input', (e) => {
            this.handleUpperInputChange(e.target.value);
        });
        
        lowerInput.addEventListener('focus', () => {
            this.activatePicker('lower');
        });
        
        upperInput.addEventListener('focus', () => {
            this.activatePicker('upper');
        });
        
        lowerInput.addEventListener('blur', () => {
            this.deactivatePicker();
        });
        
        upperInput.addEventListener('blur', () => {
            this.deactivatePicker();
        });
        
        // 吸取图标
        const pickerTriggers = this.modal.querySelectorAll('.spr-picker-trigger');
        pickerTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = trigger.getAttribute('data-target');
                this.startPicking(target);
            });
        });
        
        // 滑块
        this.setupSlider();
        
        // 范围选择单选框
        const rangeRadios = this.modal.querySelectorAll('input[name="sprRangeSelection"]');
        rangeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.selectedRange = radio.value;
                this.updateRangeSelection();
            });
        });
        
        // 目标结构选择单选框
        const targetRadios = this.modal.querySelectorAll('input[name="sprTargetStructure"]');
        targetRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.targetStructure = radio.value;
                this.updateTargetStructureForm();
            });
        });
        
        // 结构名称输入
        const nameInput = this.modal.querySelector('#sprStructureNameInput');
        nameInput.addEventListener('input', (e) => {
            this.newStructureName = e.target.value;
            this.validateForm();
        });
        
        // 颜色选择器
        const colorPicker = this.modal.querySelector('#sprColorPicker');
        colorPicker.addEventListener('click', () => {
            this.showColorPicker(colorPicker);
        });
        
        // 已有结构下拉
        const existingSelect = this.modal.querySelector('#sprExistingStructureSelect');
        existingSelect.addEventListener('change', (e) => {
            this.existingStructureName = e.target.value;
            this.validateForm();
        });
        
        // 点击模态外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // 初始化
        this.loadROIList();
        this.updateSPRRange();
        this.updateRangeSelection();
        this.updateTargetStructureForm();
    }
    
    setupSlider() {
        const track = this.modal.querySelector('#sprSliderTrack');
        const lowerHandle = this.modal.querySelector('#sprSliderHandleLower');
        const upperHandle = this.modal.querySelector('#sprSliderHandleUpper');
        const range = this.modal.querySelector('#sprSliderRange');
        
        let isDragging = false;
        let dragHandle = null;
        
        const updateSlider = (clientX) => {
            const rect = track.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const value = Math.round(this.minValue + percent * (this.maxValue - this.minValue));
            
            if (dragHandle === 'lower') {
                if (value <= this.upperValue) {
                    this.lowerValue = value;
                }
            } else if (dragHandle === 'upper') {
                if (value >= this.lowerValue) {
                    this.upperValue = value;
                }
            }
            
            this.updateSliderPositions();
            this.updateInputs();
            this.updatePickerActivation();
        };
        
        const handleMouseDown = (e, handle) => {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            dragHandle = handle;
            this.activatePicker(handle);
        };
        
        lowerHandle.addEventListener('mousedown', (e) => handleMouseDown(e, 'lower'));
        upperHandle.addEventListener('mousedown', (e) => handleMouseDown(e, 'upper'));
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateSlider(e.clientX);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragHandle = null;
                this.deactivatePicker();
            }
        });
        
        track.addEventListener('click', (e) => {
            if (!isDragging) {
                const rect = track.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percent = clickX / rect.width;
                const value = Math.round(this.minValue + percent * (this.maxValue - this.minValue));
                
                const lowerDist = Math.abs(value - this.lowerValue);
                const upperDist = Math.abs(value - this.upperValue);
                
                if (lowerDist < upperDist) {
                    if (value <= this.upperValue) {
                        this.lowerValue = value;
                    }
                } else {
                    if (value >= this.lowerValue) {
                        this.upperValue = value;
                    }
                }
                
                this.updateSliderPositions();
                this.updateInputs();
            }
        });
    }
    
    updateSliderPositions() {
        const lowerHandle = this.modal.querySelector('#sprSliderHandleLower');
        const upperHandle = this.modal.querySelector('#sprSliderHandleUpper');
        const range = this.modal.querySelector('#sprSliderRange');
        
        const lowerPercent = ((this.lowerValue - this.minValue) / (this.maxValue - this.minValue)) * 100;
        const upperPercent = ((this.upperValue - this.minValue) / (this.maxValue - this.minValue)) * 100;
        
        lowerHandle.style.left = lowerPercent + '%';
        upperHandle.style.left = upperPercent + '%';
        range.style.left = lowerPercent + '%';
        range.style.width = (upperPercent - lowerPercent) + '%';
    }
    
    updateInputs() {
        const lowerInput = this.modal.querySelector('#sprLowerInput');
        const upperInput = this.modal.querySelector('#sprUpperInput');
        
        lowerInput.value = this.lowerValue;
        upperInput.value = this.upperValue;
        
        // 更新预览
        this.updatePreview();
    }
    
    handleLowerInputChange(value) {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
            if (numValue >= this.minValue && numValue <= this.maxValue && numValue <= this.upperValue) {
                this.lowerValue = numValue;
                this.updateSliderPositions();
                this.updatePreview();
            }
        }
        this.validateForm();
    }
    
    handleUpperInputChange(value) {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
            if (numValue >= this.minValue && numValue <= this.maxValue && numValue >= this.lowerValue) {
                this.upperValue = numValue;
                this.updateSliderPositions();
                this.updatePreview();
            }
        }
        this.validateForm();
    }
    
    activatePicker(target) {
        this.pickingTarget = target;
        const pickerIcon = this.modal.querySelector('#sprPickerIcon');
        const pickerTriggers = this.modal.querySelectorAll('.spr-picker-trigger');
        
        pickerIcon.classList.add('active');
        pickerTriggers.forEach(trigger => {
            if (trigger.getAttribute('data-target') === target) {
                trigger.classList.add('active');
            }
        });
    }
    
    deactivatePicker() {
        if (!this.isPicking) {
            this.pickingTarget = null;
            const pickerIcon = this.modal.querySelector('#sprPickerIcon');
            const pickerTriggers = this.modal.querySelectorAll('.spr-picker-trigger');
            
            pickerIcon.classList.remove('active');
            pickerTriggers.forEach(trigger => {
                trigger.classList.remove('active');
            });
        }
    }
    
    startPicking(target) {
        if (!this.pickingTarget) return;
        
        this.isPicking = true;
        this.pickingTarget = target;
        
        // 通知2D视图进入吸取模式
        if (this.options.onSPRPreview) {
            this.options.onSPRPreview({
                mode: 'picking',
                target: target,
                onPick: (value) => {
                    this.handlePickValue(target, value);
                },
                onCancel: () => {
                    this.cancelPicking();
                }
            });
        }
    }
    
    handlePickValue(target, value) {
        if (target === 'lower') {
            this.lowerValue = Math.round(value);
            const lowerInput = this.modal.querySelector('#sprLowerInput');
            lowerInput.value = this.lowerValue;
        } else if (target === 'upper') {
            this.upperValue = Math.round(value);
            const upperInput = this.modal.querySelector('#sprUpperInput');
            upperInput.value = this.upperValue;
        }
        
        this.updateSliderPositions();
        this.updatePreview();
        this.cancelPicking();
    }
    
    cancelPicking() {
        this.isPicking = false;
        this.pickingTarget = null;
        this.deactivatePicker();
    }
    
    updateRangeSelection() {
        // 根据选择更新UI（如果需要显示选择框等）
    }
    
    updateTargetStructureForm() {
        const newForm = this.modal.querySelector('#sprNewStructureForm');
        const existingForm = this.modal.querySelector('#sprExistingStructureForm');
        
        if (this.targetStructure === 'new') {
            newForm.style.display = 'block';
            existingForm.style.display = 'none';
        } else {
            newForm.style.display = 'none';
            existingForm.style.display = 'block';
        }
        
        this.validateForm();
    }
    
    loadROIList() {
        if (this.options.getROIList) {
            const roiList = this.options.getROIList();
            const existingSelect = this.modal.querySelector('#sprExistingStructureSelect');
            
            existingSelect.innerHTML = '<option value="">请选择ROI</option>';
            roiList.forEach(roi => {
                const option = document.createElement('option');
                option.value = roi.name;
                option.textContent = roi.name;
                existingSelect.appendChild(option);
            });
        }
    }
    
    updateSPRRange() {
        if (this.options.getSPRMinMax) {
            const range = this.options.getSPRMinMax();
            this.minValue = range.min || 0;
            this.maxValue = range.max || 300;
            
            // 更新输入框范围
            const lowerInput = this.modal.querySelector('#sprLowerInput');
            const upperInput = this.modal.querySelector('#sprUpperInput');
            lowerInput.min = this.minValue;
            lowerInput.max = this.maxValue;
            upperInput.min = this.minValue;
            upperInput.max = this.maxValue;
            
            // 更新滑块标签
            const labels = this.modal.querySelectorAll('.spr-slider-labels span');
            labels[0].textContent = this.minValue;
            labels[1].textContent = this.maxValue;
        }
    }
    
    showColorPicker(trigger) {
        // 创建颜色选择器（简化版，使用input type="color"）
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = this.newStructureColor;
        colorInput.style.position = 'absolute';
        colorInput.style.opacity = '0';
        colorInput.style.width = '0';
        colorInput.style.height = '0';
        
        colorInput.addEventListener('change', (e) => {
            this.newStructureColor = e.target.value;
            const preview = trigger.querySelector('.spr-color-preview');
            preview.style.backgroundColor = this.newStructureColor;
        });
        
        document.body.appendChild(colorInput);
        colorInput.click();
        document.body.removeChild(colorInput);
    }
    
    updatePreview() {
        // 更新2D视图预览
        if (this.options.onSPRPreview) {
            this.options.onSPRPreview({
                mode: 'preview',
                lower: this.lowerValue,
                upper: this.upperValue,
                range: this.selectedRange
            });
        }
    }
    
    validateForm() {
        const confirmBtn = this.modal.querySelector('#sprDelineationConfirmBtn');
        let isValid = true;
        let errorMessage = '';
        
        // 验证SPR区间
        if (this.lowerValue >= this.upperValue) {
            isValid = false;
            errorMessage = '下限必须小于上限';
        }
        
        if (this.lowerValue < this.minValue || this.lowerValue > this.maxValue) {
            isValid = false;
            errorMessage = '下限超出有效范围';
        }
        
        if (this.upperValue < this.minValue || this.upperValue > this.maxValue) {
            isValid = false;
            errorMessage = '上限超出有效范围';
        }
        
        // 验证结构名称
        if (this.targetStructure === 'new') {
            if (!this.newStructureName || this.newStructureName.trim() === '') {
                isValid = false;
                errorMessage = '结构名称不能为空';
            } else {
                // 检查重名
                if (this.options.getROIList) {
                    const roiList = this.options.getROIList();
                    const isDuplicate = roiList.some(roi => roi.name === this.newStructureName.trim());
                    if (isDuplicate) {
                        isValid = false;
                        errorMessage = '结构名称已存在';
                        const nameInput = this.modal.querySelector('#sprStructureNameInput');
                        nameInput.classList.add('error');
                    } else {
                        const nameInput = this.modal.querySelector('#sprStructureNameInput');
                        nameInput.classList.remove('error');
                    }
                }
                
                // 验证名称规范（字母数字和特殊字符，最大64字符）
                const nameRegex = /^[\w\s\-_]{1,64}$/;
                if (!nameRegex.test(this.newStructureName.trim())) {
                    isValid = false;
                    errorMessage = '结构名称格式不正确';
                    const nameInput = this.modal.querySelector('#sprStructureNameInput');
                    nameInput.classList.add('error');
                }
            }
        } else {
            if (!this.existingStructureName) {
                isValid = false;
                errorMessage = '请选择已有结构';
            }
        }
        
        confirmBtn.disabled = !isValid;
        
        return isValid;
    }
    
    handleConfirm() {
        if (!this.validateForm()) {
            return;
        }
        
        const result = {
            lower: this.lowerValue,
            upper: this.upperValue,
            range: this.selectedRange,
            targetStructure: this.targetStructure,
            newStructureName: this.newStructureName.trim(),
            newStructureColor: this.newStructureColor,
            newStructureType: this.newStructureType,
            existingStructureName: this.existingStructureName
        };
        
        if (this.options.onConfirm) {
            this.options.onConfirm(result);
        }
        
        this.close();
    }
    
    show() {
        console.log('SPRDelineationComponent.show() called');
        if (!this.modal) {
            console.error('Modal not created');
            return;
        }
        this.modal.style.display = 'flex';
        console.log('Modal display set to flex');
        this.updateSPRRange();
        this.loadROIList();
        this.validateForm();
    }
    
    close() {
        this.modal.style.display = 'none';
        this.cancelPicking();
        if (this.options.onCancel) {
            this.options.onCancel();
        }
    }
    
    destroy() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}

// 导出到全局
window.SPRDelineationComponent = SPRDelineationComponent;

