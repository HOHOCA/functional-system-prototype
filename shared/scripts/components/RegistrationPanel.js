/**
 * 配准面板组件
 * 用于显示配准相关的设置和操作
 */
class RegistrationPanel {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showMainSequence: true,
            showSubSequence: true,
            enableAddRemove: true,
            ...options
        };
        this.subSequenceCount = 0;
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.render();
        this.bindEvents();
    }

    /**
     * 渲染配准面板
     */
    render() {
        this.container.innerHTML = `
            ${this.options.showMainSequence ? this.renderMainSequence() : ''}
            ${this.options.showSubSequence ? this.renderSubSequenceSettings() : ''}
        `;
    }

    /**
     * 渲染主序列
     */
    renderMainSequence() {
        return `
            <div class="main-sequence">
                <div class="sequence-tabs">
                    <div class="sequence-tab active">主序列</div>
                    <div class="sequence-tab">CT 23</div>
                </div>
                
                <div class="sequence-content">
                    <div class="ct-thumbnail">
                        <div class="ct-image">
                            <div class="ct-placeholder">CT</div>
                        </div>
                        <div class="ct-label">CT 32</div>
                    </div>
                    
                    <div class="sequence-details">
                        <div class="detail-item">CT 1: 2019-03-05 12:2...</div>
                        <div class="detail-item">Struct 1: 2019-03-05 12:2...</div>
                        <div class="detail-item">Plan 1: 26346326367</div>
                        <div class="detail-item">Dose 1: thorax ce 3.0</div>
                    </div>
                    
                    <div class="input-group">
                        <label>照射类型</label>
                        <input type="text" placeholder="请输入电子密度">
                    </div>
                    
                    <div class="input-group">
                        <label>实际治疗/计划照射次数</label>
                        <div class="treatment-count">
                            <input type="number" value="28">
                            <span>/</span>
                            <input type="number" value="36">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染次序列设置
     */
    renderSubSequenceSettings() {
        return `
            <div class="sub-sequence-settings">
                <div class="settings-header">
                    <h4>次序列设置</h4>
                    <div class="settings-actions">
                        <button class="btn-add"><i class="fas fa-plus"></i></button>
                        <button class="btn-delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                
                <div class="sub-sequence-list">
                    ${this.renderSubSequenceItem(1)}
                    ${this.renderSubSequenceItem(2)}
                </div>
            </div>
        `;
    }

    /**
     * 渲染次序列项目
     */
    renderSubSequenceItem(index) {
        return `
            <div class="sub-sequence-item" data-index="${index}">
                <div class="sub-sequence-header">
                    <span>次序列-${index} | CT 23</span>
                </div>
                
                <div class="sub-sequence-content">
                    <div class="ct-thumbnail">
                        <div class="ct-image">
                            <div class="ct-placeholder">CT</div>
                        </div>
                        <div class="ct-label">CT 32</div>
                    </div>
                    
                    <div class="dropdown-group">
                        <select>
                            <option>请选择CT</option>
                        </select>
                        <select>
                            <option>请选择Struct</option>
                        </select>
                        <select>
                            <option>请选择Plan</option>
                        </select>
                        <select>
                            <option>请选择Dose</option>
                        </select>
                    </div>
                    
                    <div class="input-group">
                        <label>照射类型</label>
                        <input type="text" value="Zhang Guangming">
                    </div>
                    
                    <div class="input-group">
                        <label>实际治疗/计划照射次数</label>
                        <div class="treatment-count">
                            <input type="number" value="28">
                            <span>/</span>
                            <input type="number" value="36">
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <label>配准记录</label>
                        <input type="text" value="Zhang Guangming">
                    </div>
                    
                    ${index === 1 ? '<button class="btn-registration">去配准</button>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 主序列标签切换
        this.container.querySelectorAll('.sequence-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleSequenceTabClick(e.target);
            });
        });

        // 添加次序列
        const addBtn = this.container.querySelector('.btn-add');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addSubSequence();
            });
        }

        // 删除次序列
        const deleteBtn = this.container.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteSubSequence();
            });
        }

        // 去配准按钮
        this.container.querySelectorAll('.btn-registration').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleRegistrationClick(e.target);
            });
        });

        // 输入框变化
        this.container.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleInputChange(e.target);
            });
        });
    }

    /**
     * 处理序列标签点击
     */
    handleSequenceTabClick(tab) {
        // 移除所有active类
        this.container.querySelectorAll('.sequence-tab').forEach(t => {
            t.classList.remove('active');
        });
        
        // 添加active类到当前项
        tab.classList.add('active');
        
        // 触发自定义事件
        const event = new CustomEvent('sequenceTabChanged', {
            detail: {
                tabName: tab.textContent
            }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * 添加次序列
     */
    addSubSequence() {
        this.subSequenceCount++;
        const subSequenceList = this.container.querySelector('.sub-sequence-list');
        const newItem = this.createSubSequenceElement(this.subSequenceCount);
        subSequenceList.appendChild(newItem);
        
        // 绑定新元素的事件
        this.bindSubSequenceEvents(newItem);
        
        // 触发自定义事件
        const event = new CustomEvent('subSequenceAdded', {
            detail: {
                index: this.subSequenceCount
            }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * 删除次序列
     */
    deleteSubSequence() {
        const subSequenceItems = this.container.querySelectorAll('.sub-sequence-item');
        if (subSequenceItems.length > 0) {
            const lastItem = subSequenceItems[subSequenceItems.length - 1];
            lastItem.remove();
            this.subSequenceCount--;
            
            // 触发自定义事件
            const event = new CustomEvent('subSequenceDeleted', {
                detail: {
                    remainingCount: this.subSequenceCount
                }
            });
            this.container.dispatchEvent(event);
        }
    }

    /**
     * 创建次序列元素
     */
    createSubSequenceElement(index) {
        const div = document.createElement('div');
        div.className = 'sub-sequence-item';
        div.setAttribute('data-index', index);
        div.innerHTML = this.renderSubSequenceItem(index);
        return div;
    }

    /**
     * 绑定次序列事件
     */
    bindSubSequenceEvents(element) {
        const registrationBtn = element.querySelector('.btn-registration');
        if (registrationBtn) {
            registrationBtn.addEventListener('click', (e) => {
                this.handleRegistrationClick(e.target);
            });
        }

        element.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleInputChange(e.target);
            });
        });
    }

    /**
     * 处理配准按钮点击
     */
    handleRegistrationClick(button) {
        const subSequenceItem = button.closest('.sub-sequence-item');
        const index = subSequenceItem.getAttribute('data-index');
        
        // 触发自定义事件
        const event = new CustomEvent('registrationRequested', {
            detail: {
                subSequenceIndex: index,
                element: subSequenceItem
            }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * 处理输入框变化
     */
    handleInputChange(input) {
        const subSequenceItem = input.closest('.sub-sequence-item');
        const fieldName = input.previousElementSibling ? input.previousElementSibling.textContent : 'unknown';
        
        // 触发自定义事件
        const event = new CustomEvent('registrationDataChanged', {
            detail: {
                fieldName: fieldName,
                value: input.value,
                element: subSequenceItem
            }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * 获取配准数据
     */
    getRegistrationData() {
        const data = {
            mainSequence: this.getMainSequenceData(),
            subSequences: this.getSubSequencesData()
        };
        return data;
    }

    /**
     * 获取主序列数据
     */
    getMainSequenceData() {
        const mainSequence = this.container.querySelector('.main-sequence');
        if (!mainSequence) return null;
        
        return {
            irradiationType: mainSequence.querySelector('input[placeholder="请输入电子密度"]')?.value || '',
            actualTreatment: mainSequence.querySelector('.treatment-count input:first-child')?.value || '',
            plannedTreatment: mainSequence.querySelector('.treatment-count input:last-child')?.value || ''
        };
    }

    /**
     * 获取次序列数据
     */
    getSubSequencesData() {
        const subSequenceItems = this.container.querySelectorAll('.sub-sequence-item');
        return Array.from(subSequenceItems).map((item, index) => {
            return {
                index: index + 1,
                ct: item.querySelector('select:nth-child(1)')?.value || '',
                struct: item.querySelector('select:nth-child(2)')?.value || '',
                plan: item.querySelector('select:nth-child(3)')?.value || '',
                dose: item.querySelector('select:nth-child(4)')?.value || '',
                irradiationType: item.querySelector('input[type="text"]:nth-of-type(1)')?.value || '',
                actualTreatment: item.querySelector('.treatment-count input:first-child')?.value || '',
                plannedTreatment: item.querySelector('.treatment-count input:last-child')?.value || '',
                registrationRecord: item.querySelector('input[type="text"]:nth-of-type(2)')?.value || ''
            };
        });
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.container.innerHTML = '';
        this.subSequenceCount = 0;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegistrationPanel;
} else {
    window.RegistrationPanel = RegistrationPanel;
}
