/**
 * 执行计划导出组件
 * 用于导出计划数据，包括普通计划和QA计划
 */
class ExportPlanComponent {
    constructor(options = {}) {
        this.options = {
            prefix: options.prefix || 'exportPlan',
            onClose: options.onClose || null,
            onExport: options.onExport || null,
            ...options
        };
        
        this.modal = null;
        this.currentTab = 'normal'; // 'normal' 或 'qa'
        this.exportData = {
            normal: this.generateMockData('normal'),
            qa: this.generateMockData('qa')
        };
    }
    
    /**
     * 生成模拟数据
     */
    generateMockData(type) {
        if (type === 'normal') {
            return {
                patient: {
                    name: 'Zhangsan1',
                    id: '20212344',
                    checked: true,
                    expanded: true,
                    children: {
                        study: {
                            name: 'CT simulation',
                            id: '20212344',
                            checked: true,
                            expanded: true,
                            children: {
                                image: {
                                    name: 'CT1 2023-10-01 12:00:00',
                                    files: 109,
                                    checked: true,
                                    expanded: true
                                },
                                rtStruct: {
                                    name: 'Srtuct3 2023-10-01 12:00:00',
                                    checked: true,
                                    expanded: true
                                },
                                rtPlan: {
                                    name: 'ARTPlan 2023-10-01 12:00:00',
                                    checked: true,
                                    expanded: true,
                                    children: {
                                        beamSet: {
                                            name: 'Group1 2023-10-01 12:00:00',
                                            checked: true,
                                            expanded: true,
                                            children: {
                                                totalDose: {
                                                    name: 'Total Plan Dose 2023-10-01 12:00:00',
                                                    checked: true
                                                },
                                                allBeamDose: {
                                                    name: 'All individual Beam Dose',
                                                    checked: true,
                                                    expanded: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
        } else {
            // QA计划数据
            return {
                patient: {
                    name: 'Zhangsan1',
                    id: '20212344',
                    checked: true,
                    expanded: true,
                    children: {
                        study: {
                            name: 'CT simulation',
                            id: '20212344',
                            checked: true,
                            expanded: true,
                            children: {
                                artPlan: {
                                    name: 'QAPlan1',
                                    checked: true,
                                    expanded: true,
                                    children: {
                                        image: {
                                            name: 'CT1 2023-10-01 12:00:00',
                                            files: 109,
                                            checked: true
                                        },
                                        rtStruct: {
                                            name: 'Srtuct3 2023-10-01 12:00:00',
                                            checked: true
                                        },
                                        totalDose: {
                                            name: 'Total Plan Dose',
                                            checked: true
                                        },
                                        allBeamDose: {
                                            name: 'All individual Beam Dose',
                                            checked: true,
                                            expanded: true,
                                            children: {
                                                beam1: {
                                                    name: 'Beam1',
                                                    checked: true
                                                },
                                                beam2: {
                                                    name: 'Beam2',
                                                    checked: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
        }
    }
    
    /**
     * 显示弹窗
     */
    show() {
        this.createModal();
        this.bindEvents();
        this.renderTree();
    }
    
    /**
     * 创建弹窗
     */
    createModal() {
        const modalId = `${this.options.prefix}Modal`;
        let modal = document.getElementById(modalId);
        
        if (modal) {
            modal.remove();
        }
        
        const targetContainer = this.options.container || null;
        
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'export-plan-modal';
        // 如果是预览模式，移除模态框遮罩样式，改为内联显示
        if (targetContainer) {
            modal.style.position = 'relative';
            modal.style.display = 'block';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.background = 'transparent';
        }
        modal.innerHTML = `
            <div class="export-plan-overlay"></div>
            <div class="export-plan-content">
                <div class="export-plan-header">
                    <h3>执行计划</h3>
                    <button class="export-plan-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="export-plan-body">
                    <div class="export-plan-tabs">
                        <button class="export-plan-tab active" data-tab="normal">普通计划</button>
                        <button class="export-plan-tab" data-tab="qa">QA计划</button>
                    </div>
                    
                    <div class="export-plan-sections">
                        <!-- 导出文件部分 -->
                        <div class="export-plan-section">
                            <div class="export-plan-section-title">导出文件</div>
                            <div class="export-plan-tree-container" id="${this.options.prefix}TreeContainer">
                                <!-- 动态生成树 -->
                            </div>
                        </div>
                        
                        <!-- 导出地址部分 -->
                        <div class="export-plan-section">
                            <div class="export-plan-section-title">导出地址</div>
                            <div class="export-plan-address-options">
                                <div class="export-plan-radio-group">
                                    <label class="export-plan-radio-label">
                                        <input type="radio" name="${this.options.prefix}ExportAddress" value="remote" checked>
                                        <span>远程节点</span>
                                    </label>
                                    <div class="export-plan-radio-content">
                                        <select class="export-plan-select" id="${this.options.prefix}RemoteNode">
                                            <option value="wuwei">wuwei</option>
                                            <option value="node1">node1</option>
                                            <option value="node2">node2</option>
                                        </select>
                                        <a href="#" class="export-plan-link" id="${this.options.prefix}AddAddress">添加/配置地址</a>
                                    </div>
                                </div>
                                <div class="export-plan-radio-group">
                                    <label class="export-plan-radio-label">
                                        <input type="radio" name="${this.options.prefix}ExportAddress" value="local">
                                        <span>本地共享文件夹</span>
                                    </label>
                                    <div class="export-plan-radio-content">
                                        <div class="export-plan-path-input">
                                            <input type="text" class="export-plan-input" id="${this.options.prefix}LocalPath" 
                                                   value="C:/Users/zhuangxiubin/Downloads" readonly>
                                            <button class="export-plan-browse-btn" id="${this.options.prefix}BrowseBtn">
                                                <i class="fas fa-ellipsis-h"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="export-plan-checkboxes">
                                    <label class="export-plan-checkbox-label">
                                        <input type="checkbox" id="${this.options.prefix}ByPatient">
                                        <span>按患者创建子文件夹</span>
                                    </label>
                                    <label class="export-plan-checkbox-label">
                                        <input type="checkbox" id="${this.options.prefix}ByImage">
                                        <span>按图像创建子文件夹</span>
                                    </label>
                                    <label class="export-plan-checkbox-label">
                                        <input type="checkbox" id="${this.options.prefix}Anonymous">
                                        <span>匿名导出</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 导出格式部分 -->
                        <div class="export-plan-section">
                            <div class="export-plan-section-title">导出格式</div>
                            <div class="export-plan-format-group">
                                <select class="export-plan-select" id="${this.options.prefix}ExportFormat">
                                    <option value="wuwei">wuwei</option>
                                    <option value="dicom">DICOM</option>
                                    <option value="nifti">NIfTI</option>
                                </select>
                                <button class="export-plan-settings-btn" id="${this.options.prefix}FormatSettings">
                                    <i class="fas fa-cog"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="export-plan-footer">
                    <button class="export-plan-btn export-plan-cancel">取消</button>
                    <button class="export-plan-btn export-plan-confirm">确定</button>
                </div>
            </div>
        `;
        
        // 根据是否有容器决定添加到哪
        if (targetContainer) {
            targetContainer.appendChild(modal);
        } else {
            document.body.appendChild(modal);
        }
        this.modal = modal;
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.modal) return;
        
        const closeBtn = this.modal.querySelector('.export-plan-close');
        const cancelBtn = this.modal.querySelector('.export-plan-cancel');
        const confirmBtn = this.modal.querySelector('.export-plan-confirm');
        const overlay = this.modal.querySelector('.export-plan-overlay');
        const tabs = this.modal.querySelectorAll('.export-plan-tab');
        const addAddressLink = document.getElementById(`${this.options.prefix}AddAddress`);
        const browseBtn = document.getElementById(`${this.options.prefix}BrowseBtn`);
        const formatSettingsBtn = document.getElementById(`${this.options.prefix}FormatSettings`);
        
        const closeModal = () => {
            this.hide();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        // 标签切换
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTab = e.target.dataset.tab;
                this.renderTree();
            });
        });
        
        // 导出地址单选按钮切换
        const addressRadios = this.modal.querySelectorAll(`input[name="${this.options.prefix}ExportAddress"]`);
        addressRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateAddressOptions(e.target.value);
            });
        });
        
        // 初始化地址选项显示（默认显示远程节点）
        this.updateAddressOptions('remote');
        
        // 添加/配置地址
        if (addAddressLink) {
            addAddressLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert('打开地址配置对话框');
                // TODO: 实现地址配置功能
            });
        }
        
        // 浏览文件夹
        if (browseBtn) {
            browseBtn.addEventListener('click', () => {
                alert('打开文件夹选择对话框');
                // TODO: 实现文件夹选择功能
            });
        }
        
        // 格式设置
        if (formatSettingsBtn) {
            formatSettingsBtn.addEventListener('click', () => {
                alert('打开格式设置对话框');
                // TODO: 实现格式设置功能
            });
        }
        
        // 确定按钮
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.handleConfirm();
            });
        }
        
        // ESC键关闭
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
    
    /**
     * 更新地址选项显示
     */
    updateAddressOptions(value) {
        const remoteRadio = this.modal.querySelector(`input[value="remote"]`);
        const localRadio = this.modal.querySelector(`input[value="local"]`);
        
        if (!remoteRadio || !localRadio) return;
        
        const remoteGroup = remoteRadio.closest('.export-plan-radio-group');
        const localGroup = localRadio.closest('.export-plan-radio-group');
        const remoteContent = remoteGroup.querySelector('.export-plan-radio-content');
        const localContent = localGroup.querySelector('.export-plan-radio-content');
        
        if (value === 'remote') {
            if (remoteContent) remoteContent.style.display = 'block';
            if (localContent) localContent.style.display = 'none';
        } else {
            if (remoteContent) remoteContent.style.display = 'none';
            if (localContent) localContent.style.display = 'block';
        }
    }
    
    /**
     * 渲染树形结构
     */
    renderTree() {
        const container = document.getElementById(`${this.options.prefix}TreeContainer`);
        if (!container) return;
        
        const data = this.exportData[this.currentTab];
        container.innerHTML = this.buildTreeHTML(data);
        
        // 绑定树节点事件
        this.bindTreeEvents(container);
    }
    
    /**
     * 构建树形HTML
     */
    buildTreeHTML(data, level = 0) {
        let html = '';
        
        for (const [key, item] of Object.entries(data)) {
            const hasChildren = item.children && Object.keys(item.children).length > 0;
            const isExpanded = item.expanded || false;
            const indent = level * 20;
            
            html += `
                <div class="export-plan-tree-item" data-key="${key}" data-level="${level}">
                    <div class="export-plan-tree-item-content" style="padding-left: ${indent}px;">
                        ${hasChildren ? `
                            <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'} export-plan-tree-chevron"></i>
                        ` : '<span class="export-plan-tree-spacer"></span>'}
                        <label class="export-plan-tree-checkbox-label">
                            <input type="checkbox" ${item.checked ? 'checked' : ''} data-key="${key}">
                            <span class="export-plan-tree-text">${this.formatTreeText(key, item)}</span>
                        </label>
                    </div>
                    ${hasChildren && isExpanded ? `
                        <div class="export-plan-tree-children">
                            ${this.buildTreeHTML(item.children, level + 1)}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        return html;
    }
    
    /**
     * 格式化树节点文本
     */
    formatTreeText(key, item) {
        if (key === 'patient') {
            return `${item.name} (Patient ID: ${item.id})`;
        } else if (key === 'study') {
            return `Study: ${item.name} (Study ID: ${item.id})`;
        } else if (key === 'image') {
            return `Image:${item.name}(files:${item.files})`;
        } else if (key === 'rtStruct') {
            return `RTStruct:${item.name}`;
        } else if (key === 'rtPlan') {
            return `RTPlan:${item.name}`;
        } else if (key === 'beamSet') {
            return `BeamSet: ${item.name}`;
        } else if (key === 'totalDose') {
            return `RTDose:${item.name}`;
        } else if (key === 'allBeamDose') {
            return `RTDose:${item.name}`;
        } else if (key === 'artPlan') {
            return `ARTPlan: ${item.name}`;
        } else if (key.startsWith('beam')) {
            return `BeamDose:${item.name}`;
        }
        return item.name || key;
    }
    
    /**
     * 绑定树节点事件
     */
    bindTreeEvents(container) {
        // 展开/折叠
        container.querySelectorAll('.export-plan-tree-chevron').forEach(chevron => {
            chevron.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.export-plan-tree-item');
                const key = item.dataset.key;
                this.toggleExpand(key);
            });
        });
        
        // 复选框
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const key = e.target.dataset.key;
                this.toggleCheck(key, e.target.checked);
            });
        });
    }
    
    /**
     * 切换展开/折叠
     */
    toggleExpand(key, level = 0) {
        const data = this.exportData[this.currentTab];
        // 根据层级查找项目
        let item = null;
        if (level === 0) {
            item = data[key];
        } else {
            // 递归查找
            item = this.findItem(data, key);
        }
        
        if (item) {
            item.expanded = !item.expanded;
            this.renderTree();
        }
    }
    
    /**
     * 切换选中状态
     */
    toggleCheck(key, checked) {
        const data = this.exportData[this.currentTab];
        const item = this.findItem(data, key);
        if (item) {
            item.checked = checked;
            // 如果取消选中，同时取消所有子项
            if (!checked && item.children) {
                this.setChildrenChecked(item.children, false);
            }
            // 如果选中，同时选中所有子项
            if (checked && item.children) {
                this.setChildrenChecked(item.children, true);
            }
            this.renderTree();
        }
    }
    
    /**
     * 设置子项选中状态
     */
    setChildrenChecked(children, checked) {
        for (const [key, item] of Object.entries(children)) {
            item.checked = checked;
            if (item.children) {
                this.setChildrenChecked(item.children, checked);
            }
        }
    }
    
    /**
     * 查找项目（递归查找）
     */
    findItem(data, targetKey, path = '') {
        for (const [key, item] of Object.entries(data)) {
            const currentPath = path ? `${path}.${key}` : key;
            // 检查完整路径或当前key
            if (key === targetKey || currentPath === targetKey) {
                return item;
            }
            if (item.children) {
                const found = this.findItem(item.children, targetKey, currentPath);
                if (found) return found;
            }
        }
        return null;
    }
    
    /**
     * 根据完整路径查找项目
     */
    findItemByPath(data, path) {
        const keys = path.split('.');
        let current = data;
        for (const key of keys) {
            if (current && current[key]) {
                current = current[key];
            } else {
                return null;
            }
        }
        return current;
    }
    
    /**
     * 处理确认
     */
    handleConfirm() {
        const exportAddress = this.modal.querySelector(`input[name="${this.options.prefix}ExportAddress"]:checked`).value;
        const remoteNode = document.getElementById(`${this.options.prefix}RemoteNode`).value;
        const localPath = document.getElementById(`${this.options.prefix}LocalPath`).value;
        const exportFormat = document.getElementById(`${this.options.prefix}ExportFormat`).value;
        const byPatient = document.getElementById(`${this.options.prefix}ByPatient`).checked;
        const byImage = document.getElementById(`${this.options.prefix}ByImage`).checked;
        const anonymous = document.getElementById(`${this.options.prefix}Anonymous`).checked;
        
        const selectedItems = this.getSelectedItems();
        
        const exportConfig = {
            tab: this.currentTab,
            address: exportAddress,
            remoteNode: exportAddress === 'remote' ? remoteNode : null,
            localPath: exportAddress === 'local' ? localPath : null,
            format: exportFormat,
            byPatient,
            byImage,
            anonymous,
            items: selectedItems
        };
        
        console.log('导出配置:', exportConfig);
        
        if (this.options.onExport) {
            this.options.onExport(exportConfig);
        } else {
            alert('导出功能待实现');
        }
        
        this.hide();
    }
    
    /**
     * 获取选中的项目
     */
    getSelectedItems() {
        const data = this.exportData[this.currentTab];
        const selected = [];
        
        const collectChecked = (items, path = '') => {
            for (const [key, item] of Object.entries(items)) {
                const currentPath = path ? `${path}.${key}` : key;
                if (item.checked) {
                    selected.push({
                        key: currentPath,
                        name: item.name || key,
                        type: this.getItemType(key)
                    });
                }
                if (item.children) {
                    collectChecked(item.children, currentPath);
                }
            }
        };
        
        collectChecked(data);
        return selected;
    }
    
    /**
     * 获取项目类型
     */
    getItemType(key) {
        if (key === 'patient') return 'patient';
        if (key === 'study') return 'study';
        if (key === 'image') return 'image';
        if (key === 'rtStruct') return 'rtStruct';
        if (key === 'rtPlan') return 'rtPlan';
        if (key === 'beamSet') return 'beamSet';
        if (key === 'totalDose' || key.startsWith('beam')) return 'rtDose';
        if (key === 'artPlan') return 'artPlan';
        return 'unknown';
    }
    
    /**
     * 隐藏弹窗
     */
    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
        if (this.options.onClose) {
            this.options.onClose();
        }
    }
}

// 导出组件
window.ExportPlanComponent = ExportPlanComponent;

