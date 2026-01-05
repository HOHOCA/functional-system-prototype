// 创建QA计划组件
class CreateQaPlanComponent {
    constructor(options = {}) {
        this.options = {
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null,
            getTreatmentPlan: options.getTreatmentPlan || null,
            getPoiList: options.getPoiList || null,
            getRoiList: options.getRoiList || null,
            ...options
        };
        this.modal = null;
    }

    // 显示弹窗
    show() {
        // 获取治疗计划信息（模拟数据，实际应从后端获取）
        const treatmentPlan = this.getTreatmentPlanData();
        const poiList = this.getPoiListData();
        const roiList = this.getRoiListData();

        // 创建模态框
        this.modal = document.createElement('div');
        this.modal.className = 'create-qa-plan-modal';
        this.modal.innerHTML = `
            <div class="create-qa-plan-overlay"></div>
            <div class="create-qa-plan-content">
                <div class="create-qa-plan-header">
                    <h3>创建QA计划</h3>
                    <button class="create-qa-plan-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="create-qa-plan-body">
                    <!-- 治疗计划信息（只读） -->
                    <div class="create-qa-plan-section">
                        <div class="create-qa-plan-section-title">治疗计划</div>
                        <div class="create-qa-plan-info-grid">
                            <div class="create-qa-plan-info-item">
                                <span class="create-qa-plan-info-label">计划名称:</span>
                                <span class="create-qa-plan-info-value">${treatmentPlan.planName}</span>
                            </div>
                            <div class="create-qa-plan-info-item">
                                <span class="create-qa-plan-info-label">计划影像:</span>
                                <span class="create-qa-plan-info-value">${treatmentPlan.planImage}</span>
                            </div>
                            <div class="create-qa-plan-info-item">
                                <span class="create-qa-plan-info-label">患者体位:</span>
                                <span class="create-qa-plan-info-value">${treatmentPlan.patientPosition}</span>
                            </div>
                            <div class="create-qa-plan-info-item">
                                <span class="create-qa-plan-info-label">治疗机:</span>
                                <span class="create-qa-plan-info-value">${treatmentPlan.treatmentMachine}</span>
                            </div>
                            <div class="create-qa-plan-info-item">
                                <span class="create-qa-plan-info-label">计划者:</span>
                                <span class="create-qa-plan-info-value">${treatmentPlan.planner}</span>
                            </div>
                            <div class="create-qa-plan-info-item">
                                <span class="create-qa-plan-info-label">剂量网格(cm):</span>
                                <span class="create-qa-plan-info-value">Right-Left: ${treatmentPlan.doseGrid.rl}, Inf-Sup: ${treatmentPlan.doseGrid.is}, Post-Ant: ${treatmentPlan.doseGrid.pa}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 主要内容区域 -->
                    <div class="create-qa-plan-main-content">
                        <!-- 左侧列 -->
                        <div class="create-qa-plan-left-column">
                            <!-- QA计划 -->
                            <div class="create-qa-plan-section">
                                <div class="create-qa-plan-section-title">QA计划</div>
                                <div class="create-qa-plan-form-group">
                                    <label class="create-qa-plan-label">计划名称:</label>
                                    <input type="text" 
                                           class="create-qa-plan-input" 
                                           id="qaPlanName"
                                           placeholder="请输入QA计划名称">
                                </div>
                                <div class="create-qa-plan-form-group">
                                    <label class="create-qa-plan-label">计划模体:</label>
                                    <select class="create-qa-plan-select" id="qaPlanPhantom">
                                        <option value="">请选择模体</option>
                                        <option value="phantom1">模体1</option>
                                        <option value="phantom2">模体2</option>
                                        <option value="phantom3">模体3</option>
                                    </select>
                                </div>
                            </div>

                            <!-- 等中心点设置 -->
                            <div class="create-qa-plan-section">
                                <div class="create-qa-plan-section-title">等中心点设置</div>
                                <div class="create-qa-plan-form-group">
                                    <label class="create-qa-plan-label">模体参考点:</label>
                                    <div class="create-qa-plan-radio-group">
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="phantomReferencePoint" 
                                                   id="phantomRefPoi" 
                                                   value="poi" 
                                                   checked>
                                            <label for="phantomRefPoi">POI</label>
                                            <select class="create-qa-plan-select-small" id="phantomRefPoiSelect">
                                                ${this.generateSelectOptions(poiList, 'POI1')}
                                            </select>
                                        </div>
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="phantomReferencePoint" 
                                                   id="phantomRefRoi" 
                                                   value="roi">
                                            <label for="phantomRefRoi">ROI中心点</label>
                                            <select class="create-qa-plan-select-small" id="phantomRefRoiSelect">
                                                ${this.generateSelectOptions(roiList, 'PTV')}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="create-qa-plan-form-group">
                                    <label class="create-qa-plan-label">计划匹配点:</label>
                                    <div class="create-qa-plan-radio-group">
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="planMatchingPoint" 
                                                   id="planMatchPoi" 
                                                   value="poi" 
                                                   checked>
                                            <label for="planMatchPoi">POI</label>
                                            <select class="create-qa-plan-select-small" id="planMatchPoiSelect">
                                                ${this.generateSelectOptions(poiList, 'POI1')}
                                            </select>
                                        </div>
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="planMatchingPoint" 
                                                   id="planMatchRoi" 
                                                   value="roi">
                                            <label for="planMatchRoi">ROI中心点</label>
                                            <select class="create-qa-plan-select-small" id="planMatchRoiSelect">
                                                ${this.generateSelectOptions(roiList, 'PTV')}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 剂量网格 -->
                            <div class="create-qa-plan-section">
                                <div class="create-qa-plan-section-title">剂量网格</div>
                                <div class="create-qa-plan-form-group">
                                    <div class="create-qa-plan-radio-group">
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="doseGrid" 
                                                   id="doseGridConsistent" 
                                                   value="consistent" 
                                                   checked>
                                            <label for="doseGridConsistent">与治疗计划保持一致</label>
                                        </div>
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="doseGrid" 
                                                   id="doseGridReset" 
                                                   value="reset">
                                            <label for="doseGridReset">重新设置(cm)</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="create-qa-plan-form-group" id="doseGridInputsGroup" style="display: none;">
                                    <div class="create-qa-plan-input-row">
                                        <label class="create-qa-plan-label-small">Right-Left:</label>
                                        <input type="number" 
                                               class="create-qa-plan-input-small" 
                                               id="doseGridRl"
                                               value="0.30"
                                               step="0.01"
                                               min="0">
                                        <span class="create-qa-plan-unit">cm</span>
                                    </div>
                                    <div class="create-qa-plan-input-row">
                                        <label class="create-qa-plan-label-small">Inf-Sup:</label>
                                        <input type="number" 
                                               class="create-qa-plan-input-small" 
                                               id="doseGridIs"
                                               value="0.30"
                                               step="0.01"
                                               min="0">
                                        <span class="create-qa-plan-unit">cm</span>
                                    </div>
                                    <div class="create-qa-plan-input-row">
                                        <label class="create-qa-plan-label-small">Post-Ant:</label>
                                        <input type="number" 
                                               class="create-qa-plan-input-small" 
                                               id="doseGridPa"
                                               value="0.30"
                                               step="0.01"
                                               min="0">
                                        <span class="create-qa-plan-unit">cm</span>
                                    </div>
                                    <div class="create-qa-plan-checkbox-item">
                                        <input type="checkbox" 
                                               id="uniformGridSize" 
                                               checked>
                                        <label for="uniformGridSize">统一网格大小</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 右侧列 -->
                        <div class="create-qa-plan-right-column">
                            <!-- 角度设置 -->
                            <div class="create-qa-plan-section">
                                <div class="create-qa-plan-section-title">角度设置</div>
                                
                                <!-- 机架角度 -->
                                <div class="create-qa-plan-form-group">
                                    <label class="create-qa-plan-label">机架角度:</label>
                                    <div class="create-qa-plan-radio-group">
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="gantryAngle" 
                                                   id="gantryAngleConsistent" 
                                                   value="consistent" 
                                                   checked>
                                            <label for="gantryAngleConsistent">与治疗计划保持一致</label>
                                        </div>
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="gantryAngle" 
                                                   id="gantryAngleFold" 
                                                   value="fold">
                                            <label for="gantryAngleFold">全部折叠到</label>
                                            <input type="number" 
                                                   class="create-qa-plan-input-inline" 
                                                   id="gantryAngleValue"
                                                   value="0.0"
                                                   step="0.1"
                                                   disabled>
                                            <span class="create-qa-plan-unit-inline">度</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- 准直器角度 -->
                                <div class="create-qa-plan-form-group">
                                    <label class="create-qa-plan-label">准直器角度:</label>
                                    <div class="create-qa-plan-radio-group">
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="collimatorAngle" 
                                                   id="collimatorAngleConsistent" 
                                                   value="consistent" 
                                                   checked>
                                            <label for="collimatorAngleConsistent">与治疗计划一致</label>
                                        </div>
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="collimatorAngle" 
                                                   id="collimatorAngleFold" 
                                                   value="fold">
                                            <label for="collimatorAngleFold">全部折叠到</label>
                                            <input type="number" 
                                                   class="create-qa-plan-input-inline" 
                                                   id="collimatorAngleValue"
                                                   value="270.0"
                                                   step="0.1"
                                                   disabled>
                                            <span class="create-qa-plan-unit-inline">度</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- 治疗床角度 -->
                                <div class="create-qa-plan-form-group">
                                    <label class="create-qa-plan-label">治疗床角度:</label>
                                    <div class="create-qa-plan-radio-group">
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="couchAngle" 
                                                   id="couchAngleConsistent" 
                                                   value="consistent" 
                                                   checked>
                                            <label for="couchAngleConsistent">与治疗计划保持一致</label>
                                        </div>
                                        <div class="create-qa-plan-radio-item">
                                            <input type="radio" 
                                                   name="couchAngle" 
                                                   id="couchAngleFold" 
                                                   value="fold">
                                            <label for="couchAngleFold">全部折叠到</label>
                                            <input type="number" 
                                                   class="create-qa-plan-input-inline" 
                                                   id="couchAngleValue"
                                                   value="265.0"
                                                   step="0.1"
                                                   disabled>
                                            <span class="create-qa-plan-unit-inline">度</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- 分次数 -->
                                <div class="create-qa-plan-form-group">
                                    <label class="create-qa-plan-label">分次数:</label>
                                    <input type="number" 
                                           class="create-qa-plan-input" 
                                           id="fractions"
                                           value="1"
                                           min="1"
                                           step="1">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="create-qa-plan-footer">
                    <button class="create-qa-plan-btn create-qa-plan-btn-cancel">取消</button>
                    <button class="create-qa-plan-btn create-qa-plan-btn-confirm">确定</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        const overlay = this.modal.querySelector('.create-qa-plan-overlay');
        const closeBtn = this.modal.querySelector('.create-qa-plan-close');
        const cancelBtn = this.modal.querySelector('.create-qa-plan-btn-cancel');
        const confirmBtn = this.modal.querySelector('.create-qa-plan-btn-confirm');

        const closeModal = () => {
            this.hide();
            if (this.options.onCancel) {
                this.options.onCancel();
            }
        };

        overlay.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // 剂量网格单选切换
        const doseGridConsistent = this.modal.querySelector('#doseGridConsistent');
        const doseGridReset = this.modal.querySelector('#doseGridReset');
        const doseGridInputsGroup = this.modal.querySelector('#doseGridInputsGroup');
        const uniformGridSize = this.modal.querySelector('#uniformGridSize');

        doseGridConsistent.addEventListener('change', () => {
            doseGridInputsGroup.style.display = 'none';
        });

        doseGridReset.addEventListener('change', () => {
            doseGridInputsGroup.style.display = 'block';
        });

        // 统一网格大小复选框
        uniformGridSize.addEventListener('change', (e) => {
            if (e.target.checked) {
                const rlValue = this.modal.querySelector('#doseGridRl').value;
                this.modal.querySelector('#doseGridIs').value = rlValue;
                this.modal.querySelector('#doseGridPa').value = rlValue;
            }
        });

        // Right-Left输入框变化时，如果勾选了统一网格大小，同步更新其他两个
        this.modal.querySelector('#doseGridRl').addEventListener('input', (e) => {
            if (uniformGridSize.checked) {
                this.modal.querySelector('#doseGridIs').value = e.target.value;
                this.modal.querySelector('#doseGridPa').value = e.target.value;
            }
        });

        // 角度设置单选切换
        this.setupAngleRadioToggle('gantryAngle', 'gantryAngleValue');
        this.setupAngleRadioToggle('collimatorAngle', 'collimatorAngleValue');
        this.setupAngleRadioToggle('couchAngle', 'couchAngleValue');

        // 确定按钮
        confirmBtn.addEventListener('click', () => {
            const formData = this.getFormData();
            if (this.validateForm(formData)) {
                this.hide();
                if (this.options.onConfirm) {
                    this.options.onConfirm(formData);
                }
            }
        });
    }

    // 设置角度单选切换
    setupAngleRadioToggle(radioName, inputId) {
        const consistentRadio = this.modal.querySelector(`#${radioName}Consistent`);
        const foldRadio = this.modal.querySelector(`#${radioName}Fold`);
        const valueInput = this.modal.querySelector(`#${inputId}`);

        consistentRadio.addEventListener('change', () => {
            valueInput.disabled = true;
        });

        foldRadio.addEventListener('change', () => {
            valueInput.disabled = false;
        });
    }

    // 获取表单数据
    getFormData() {
        const phantomRefPoint = this.modal.querySelector('input[name="phantomReferencePoint"]:checked').value;
        const planMatchPoint = this.modal.querySelector('input[name="planMatchingPoint"]:checked').value;
        const doseGridMode = this.modal.querySelector('input[name="doseGrid"]:checked').value;
        const gantryAngleMode = this.modal.querySelector('input[name="gantryAngle"]:checked').value;
        const collimatorAngleMode = this.modal.querySelector('input[name="collimatorAngle"]:checked').value;
        const couchAngleMode = this.modal.querySelector('input[name="couchAngle"]:checked').value;

        return {
            planName: this.modal.querySelector('#qaPlanName').value.trim(),
            phantom: this.modal.querySelector('#qaPlanPhantom').value,
            phantomReferencePoint: {
                type: phantomRefPoint,
                value: phantomRefPoint === 'poi' 
                    ? this.modal.querySelector('#phantomRefPoiSelect').value
                    : this.modal.querySelector('#phantomRefRoiSelect').value
            },
            planMatchingPoint: {
                type: planMatchPoint,
                value: planMatchPoint === 'poi'
                    ? this.modal.querySelector('#planMatchPoiSelect').value
                    : this.modal.querySelector('#planMatchRoiSelect').value
            },
            doseGrid: {
                mode: doseGridMode,
                rl: doseGridMode === 'reset' ? parseFloat(this.modal.querySelector('#doseGridRl').value) : null,
                is: doseGridMode === 'reset' ? parseFloat(this.modal.querySelector('#doseGridIs').value) : null,
                pa: doseGridMode === 'reset' ? parseFloat(this.modal.querySelector('#doseGridPa').value) : null,
                uniform: doseGridMode === 'reset' ? this.modal.querySelector('#uniformGridSize').checked : false
            },
            gantryAngle: {
                mode: gantryAngleMode,
                value: gantryAngleMode === 'fold' ? parseFloat(this.modal.querySelector('#gantryAngleValue').value) : null
            },
            collimatorAngle: {
                mode: collimatorAngleMode,
                value: collimatorAngleMode === 'fold' ? parseFloat(this.modal.querySelector('#collimatorAngleValue').value) : null
            },
            couchAngle: {
                mode: couchAngleMode,
                value: couchAngleMode === 'fold' ? parseFloat(this.modal.querySelector('#couchAngleValue').value) : null
            },
            fractions: parseInt(this.modal.querySelector('#fractions').value) || 1
        };
    }

    // 验证表单
    validateForm(formData) {
        if (!formData.planName) {
            alert('请输入QA计划名称');
            return false;
        }
        if (!formData.phantom) {
            alert('请选择计划模体');
            return false;
        }
        return true;
    }

    // 隐藏弹窗
    hide() {
        if (this.modal && this.modal.parentNode) {
            document.body.removeChild(this.modal);
            this.modal = null;
        }
    }

    // 生成下拉选项
    generateSelectOptions(list, defaultValue) {
        if (!list || list.length === 0) {
            return `<option value="${defaultValue}">${defaultValue}</option>`;
        }
        return list.map(item => {
            const value = typeof item === 'string' ? item : item.value || item.name;
            const label = typeof item === 'string' ? item : item.label || item.name || value;
            const selected = value === defaultValue ? 'selected' : '';
            return `<option value="${value}" ${selected}>${label}</option>`;
        }).join('');
    }

    // 获取治疗计划数据（模拟）
    getTreatmentPlanData() {
        if (this.options.getTreatmentPlan) {
            return this.options.getTreatmentPlan();
        }
        return {
            planName: 'DCA-HA-0408',
            planImage: 'CT 1',
            patientPosition: 'HFS',
            treatmentMachine: 'Halcyon_1122',
            planner: 'zhuangxiubin',
            doseGrid: {
                rl: '0.30',
                is: '0.30',
                pa: '0.30'
            }
        };
    }

    // 获取POI列表（模拟）
    getPoiListData() {
        if (this.options.getPoiList) {
            return this.options.getPoiList();
        }
        return ['POI1', 'POI2', 'POI3'];
    }

    // 获取ROI列表（模拟）
    getRoiListData() {
        if (this.options.getRoiList) {
            return this.options.getRoiList();
        }
        return ['PTV', 'OAR1', 'OAR2'];
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CreateQaPlanComponent;
} else {
    window.CreateQaPlanComponent = CreateQaPlanComponent;
}

