// 优化设置弹窗组件
class OptimizationSettingsModalComponent {
    constructor() {
        this.modal = null;
        this.settings = {
            maxIterations: 100,
            maxIterationTime: 40,
            stopThreshold: 3, // 存储为数字，显示为 1e-3
            minBeamletMU: 2.0,
            maxBeamletMU: 100.0
        };
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.modal = document.createElement('div');
        this.modal.className = 'optimization-settings-modal-mask';
        this.modal.innerHTML = `
            <div class="optimization-settings-modal">
                <div class="optimization-settings-modal-header">
                    <h2>优化设置</h2>
                    <button class="optimization-settings-modal-close" id="optimizationSettingsModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="optimization-settings-modal-body">
                    <div class="optimization-settings-form">
                        <div class="optimization-settings-form-group">
                            <label class="optimization-settings-label" 
                                   data-tooltip="最大beamlet优化迭代次数，如果提前达到目标或达到最大迭代次数则停止优化">
                                最大迭代次数
                            </label>
                            <input type="number" 
                                   id="maxIterationsInput" 
                                   class="optimization-settings-input" 
                                   value="${this.settings.maxIterations}" 
                                   min="50" 
                                   max="2000" 
                                   step="1">
                        </div>
                        
                        <div class="optimization-settings-form-group">
                            <label class="optimization-settings-label" 
                                   data-tooltip="最大beamlet优化迭代时间，如果提前达到目标或达到最大迭代时间则停止优化">
                                最大迭代时间
                            </label>
                            <div class="optimization-settings-input-wrapper">
                                <input type="number" 
                                       id="maxIterationTimeInput" 
                                       class="optimization-settings-input" 
                                       value="${this.settings.maxIterationTime}" 
                                       min="10" 
                                       max="120" 
                                       step="1">
                                <span class="optimization-settings-unit">min</span>
                            </div>
                        </div>
                        
                        <div class="optimization-settings-form-group">
                            <label class="optimization-settings-label" 
                                   data-tooltip="达到阈值后，优化停止">
                                优化停止阈值
                            </label>
                            <input type="number" 
                                   id="stopThresholdInput" 
                                   class="optimization-settings-input" 
                                   value="${typeof this.settings.stopThreshold === 'string' && this.settings.stopThreshold.startsWith('1e-') ? parseInt(this.settings.stopThreshold.replace('1e-', ''), 10) || 3 : (typeof this.settings.stopThreshold === 'number' ? this.settings.stopThreshold : 3)}" 
                                   min="1" 
                                   max="20" 
                                   step="1">
                        </div>
                        
                        <div class="optimization-settings-form-group">
                            <label class="optimization-settings-label" 
                                   data-tooltip="用于限制加速器的出束情况，根据优化期间允许的分次量定义最小束斑 MU 的约束">
                                束斑最小MU
                            </label>
                            <div class="optimization-settings-input-wrapper">
                                <input type="number" 
                                       id="minBeamletMUInput" 
                                       class="optimization-settings-input" 
                                       value="${this.settings.minBeamletMU}" 
                                       min="0.1" 
                                       max="100.0" 
                                       step="0.1">
                                <span class="optimization-settings-unit">MU</span>
                            </div>
                        </div>
                        
                        <div class="optimization-settings-form-group">
                            <label class="optimization-settings-label" 
                                   data-tooltip="用于限制加速器的出束情况，根据优化期间允许的分次量定义最大束斑 MU 的约束">
                                束斑最大MU
                            </label>
                            <div class="optimization-settings-input-wrapper">
                                <input type="number" 
                                       id="maxBeamletMUInput" 
                                       class="optimization-settings-input" 
                                       value="${this.settings.maxBeamletMU}" 
                                       min="0.1" 
                                       max="100.0" 
                                       step="0.1">
                                <span class="optimization-settings-unit">MU</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="optimization-settings-modal-footer">
                    <button class="btn btn-secondary" id="optimizationSettingsCancelBtn">取消</button>
                    <button class="btn btn-primary" id="optimizationSettingsConfirmBtn">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    bindEvents() {
        // 关闭按钮
        const closeBtn = this.modal.querySelector('#optimizationSettingsModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // 点击遮罩层关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // 取消按钮
        const cancelBtn = this.modal.querySelector('#optimizationSettingsCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // 确定按钮
        const confirmBtn = this.modal.querySelector('#optimizationSettingsConfirmBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.handleConfirm();
            });
        }

        // 输入框实时验证
        const inputs = this.modal.querySelectorAll('.optimization-settings-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
                // 如果是优化停止阈值输入框，失去焦点时显示为科学计数法格式
                if (input.id === 'stopThresholdInput') {
                    this.formatStopThresholdOnBlur(input);
                }
            });
            input.addEventListener('focus', () => {
                // 如果是优化停止阈值输入框，获得焦点时切换为数字格式
                if (input.id === 'stopThresholdInput') {
                    this.parseStopThresholdOnFocus(input);
                }
            });
            input.addEventListener('input', () => {
                this.clearFieldError(input);
                // 如果是优化停止阈值输入框，更新显示
                if (input.id === 'stopThresholdInput') {
                    this.updateStopThresholdDisplay(input.value);
                }
            });
        });

        // 初始化tooltip
        this.initTooltips();
    }

    updateStopThresholdDisplay(value) {
        // 不再需要更新单位显示，因为已经移除了单位标签
    }

    formatStopThresholdOnBlur(input) {
        // 失去焦点时，将输入框显示为科学计数法格式
        const value = input.value.trim();
        if (!value) return;
        
        // 如果已经是科学计数法格式，不需要转换
        if (value.startsWith('1e-')) {
            return;
        }
        
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 20) {
            input.type = 'text';
            input.value = `1e-${numValue}`;
            this.updateStopThresholdDisplay(numValue);
        }
    }

    parseStopThresholdOnFocus(input) {
        // 获得焦点时，将输入框切换为数字格式以便编辑
        const value = input.value.trim();
        
        // 如果是科学计数法格式，提取数字
        if (value.startsWith('1e-')) {
            const numValue = parseInt(value.replace('1e-', ''), 10);
            if (!isNaN(numValue) && numValue >= 1 && numValue <= 20) {
                input.type = 'number';
                input.value = numValue;
                this.updateStopThresholdDisplay(numValue);
            }
        } else {
            // 如果不是科学计数法格式，确保是数字类型
            input.type = 'number';
        }
    }

    initTooltips() {
        const labels = this.modal.querySelectorAll('.optimization-settings-label[data-tooltip]');
        labels.forEach(label => {
            const tooltipText = label.getAttribute('data-tooltip');
            if (!tooltipText) return;

            // 创建tooltip元素
            const tooltip = document.createElement('div');
            tooltip.className = 'optimization-settings-tooltip';
            tooltip.textContent = tooltipText;
            document.body.appendChild(tooltip);

            // 鼠标进入事件
            label.addEventListener('mouseenter', (e) => {
                const rect = label.getBoundingClientRect();
                tooltip.style.display = 'block';
                tooltip.style.left = rect.left + 'px';
                tooltip.style.top = (rect.bottom + 8) + 'px';
                
                // 调整位置，确保不超出屏幕
                setTimeout(() => {
                    const tooltipRect = tooltip.getBoundingClientRect();
                    if (tooltipRect.right > window.innerWidth) {
                        tooltip.style.left = (window.innerWidth - tooltipRect.width - 10) + 'px';
                    }
                    if (tooltipRect.bottom > window.innerHeight) {
                        tooltip.style.top = (rect.top - tooltipRect.height - 8) + 'px';
                    }
                }, 0);
            });

            // 鼠标离开事件
            label.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });

            // 存储tooltip引用，以便清理
            label._tooltip = tooltip;
        });
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldId = input.id;
        
        // 清除之前的错误状态
        this.clearFieldError(input);
        
        // 验证是否为空
        if (!value) {
            this.showFieldError(input, '此项不能为空');
            return false;
        }
        
        // 数值字段验证
        if (input.type === 'number') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                this.showFieldError(input, '请输入有效的数值');
                return false;
            }
            
            // 检查范围
            const min = parseFloat(input.min);
            const max = parseFloat(input.max);
            if (numValue < min || numValue > max) {
                this.showFieldError(input, `数值范围应在 ${min} 到 ${max} 之间`);
                return false;
            }
        }
        
        return true;
    }

    validateAll() {
        const inputs = this.modal.querySelectorAll('.optimization-settings-input');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        // 验证束斑MU的关系
        if (isValid) {
            const minMU = parseFloat(this.modal.querySelector('#minBeamletMUInput').value);
            const maxMU = parseFloat(this.modal.querySelector('#maxBeamletMUInput').value);
            
            if (minMU === maxMU) {
                this.showFieldError(this.modal.querySelector('#maxBeamletMUInput'), '最大 MU 和最小 MU 不能一致');
                isValid = false;
            } else if (maxMU <= minMU) {
                this.showFieldError(this.modal.querySelector('#maxBeamletMUInput'), '最大 MU 必须大于最小 MU');
                isValid = false;
            }
        }
        
        return isValid;
    }

    showFieldError(input, message) {
        input.classList.add('error');
        // 清除之前的错误信息
        const formGroup = input.closest('.optimization-settings-form-group');
        if (formGroup) {
            const existingError = formGroup.querySelector('.optimization-settings-error');
            if (existingError) {
                existingError.remove();
            }
            const errorDiv = document.createElement('div');
            errorDiv.className = 'optimization-settings-error';
            errorDiv.textContent = message;
            // 插入到输入框下方（在form-group中）
            formGroup.appendChild(errorDiv);
        } else {
            // 如果没有form-group，则插入到父节点
            const existingError = input.parentNode.querySelector('.optimization-settings-error');
            if (existingError) {
                existingError.remove();
            }
            const errorDiv = document.createElement('div');
            errorDiv.className = 'optimization-settings-error';
            errorDiv.textContent = message;
            input.parentNode.appendChild(errorDiv);
        }
    }

    clearFieldError(input) {
        input.classList.remove('error');
        // 查找错误信息（可能在父节点中）
        const formGroup = input.closest('.optimization-settings-form-group');
        if (formGroup) {
            const errorDiv = formGroup.querySelector('.optimization-settings-error');
            if (errorDiv) {
                errorDiv.remove();
            }
        }
    }

    handleConfirm() {
        // 清除所有错误
        const inputs = this.modal.querySelectorAll('.optimization-settings-input');
        inputs.forEach(input => {
            this.clearFieldError(input);
        });
        
        // 验证所有字段
        if (!this.validateAll()) {
            return;
        }
        
        // 收集设置值
        const stopThresholdInput = this.modal.querySelector('#stopThresholdInput');
        let stopThresholdValue = 3;
        let stopThresholdFormatted = '1e-3';
        
        // 处理优化停止阈值：可能是数字或科学计数法格式
        if (stopThresholdInput) {
            const value = stopThresholdInput.value.trim();
            if (value.startsWith('1e-')) {
                stopThresholdValue = parseInt(value.replace('1e-', ''), 10) || 3;
            } else {
                stopThresholdValue = parseInt(value, 10) || 3;
            }
            stopThresholdFormatted = `1e-${stopThresholdValue}`;
        }
        
        const settings = {
            maxIterations: parseInt(this.modal.querySelector('#maxIterationsInput').value, 10),
            maxIterationTime: parseInt(this.modal.querySelector('#maxIterationTimeInput').value, 10),
            stopThreshold: stopThresholdFormatted,
            minBeamletMU: parseFloat(this.modal.querySelector('#minBeamletMUInput').value),
            maxBeamletMU: parseFloat(this.modal.querySelector('#maxBeamletMUInput').value)
        };
        
        // 格式化束斑MU（保留1位小数）
        settings.minBeamletMU = parseFloat(settings.minBeamletMU.toFixed(1));
        settings.maxBeamletMU = parseFloat(settings.maxBeamletMU.toFixed(1));
        
        // 更新输入框显示为科学计数法格式
        if (stopThresholdInput) {
            stopThresholdInput.type = 'text';
            stopThresholdInput.value = stopThresholdFormatted;
            // 更新单位显示
            this.updateStopThresholdDisplay(stopThresholdValue);
        }
        
        // 更新内部设置值（存储为科学计数法格式）
        this.settings.stopThreshold = stopThresholdFormatted;
        
        console.log('优化设置已保存:', settings);
        
        // 触发设置保存事件
        window.dispatchEvent(new CustomEvent('optimization-settings-saved', {
            detail: settings
        }));
        
        this.close();
    }

    show() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            // 重置为默认值
            this.modal.querySelector('#maxIterationsInput').value = this.settings.maxIterations;
            this.modal.querySelector('#maxIterationTimeInput').value = this.settings.maxIterationTime;
            
            // 优化停止阈值：从 1e-3 格式提取数字，或使用默认值
            const stopThresholdInput = this.modal.querySelector('#stopThresholdInput');
            let stopThresholdValue = 3;
            
            if (typeof this.settings.stopThreshold === 'string' && this.settings.stopThreshold.startsWith('1e-')) {
                stopThresholdValue = parseInt(this.settings.stopThreshold.replace('1e-', ''), 10) || 3;
                // 如果当前是文本格式，切换为数字输入
                stopThresholdInput.type = 'number';
            } else if (typeof this.settings.stopThreshold === 'number') {
                stopThresholdValue = this.settings.stopThreshold;
                stopThresholdInput.type = 'number';
            } else {
                stopThresholdValue = 3;
                stopThresholdInput.type = 'number';
            }
            
            stopThresholdInput.value = stopThresholdValue;
            this.updateStopThresholdDisplay(stopThresholdValue);
            
            this.modal.querySelector('#minBeamletMUInput').value = this.settings.minBeamletMU;
            this.modal.querySelector('#maxBeamletMUInput').value = this.settings.maxBeamletMU;
            // 清除所有错误
            const inputs = this.modal.querySelectorAll('.optimization-settings-input');
            inputs.forEach(input => {
                this.clearFieldError(input);
            });
        }
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    destroy() {
        // 清理tooltip
        if (this.modal) {
            const labels = this.modal.querySelectorAll('.optimization-settings-label[data-tooltip]');
            labels.forEach(label => {
                if (label._tooltip && label._tooltip.parentNode) {
                    label._tooltip.parentNode.removeChild(label._tooltip);
                }
            });
        }

        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}

// 导出到全局
window.OptimizationSettingsModalComponent = OptimizationSettingsModalComponent;

