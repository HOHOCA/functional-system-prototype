// 设置弹窗组件
class SettingsModalComponent {
    constructor() {
        this.modal = null;
        this.currentCategory = 'algorithm'; // 默认选中算法设置
        this.currentItem = 'config-items'; // 默认选中配置项设置
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.modal = document.createElement('div');
        this.modal.className = 'settings-modal-mask';
        this.modal.innerHTML = `
            <div class="settings-modal">
                <div class="settings-modal-header">
                    <h2>设置</h2>
                    <button class="settings-modal-close" id="settingsModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="settings-modal-body">
                    <div class="settings-sidebar">
                        <div class="settings-category" data-category="general">
                            <div class="category-header">
                                <span>通用</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="category-items">
                                <div class="category-item" data-item="language">语言&外观</div>
                            </div>
                        </div>
                        <div class="settings-category" data-category="system">
                            <div class="category-header">
                                <span>系统设置</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="category-items">
                                <div class="category-item" data-item="data-transfer">数据传输设置</div>
                                <div class="category-item" data-item="business-config">业务配置项设置</div>
                                <div class="category-item" data-item="machine">机器设置</div>
                            </div>
                        </div>
                        <div class="settings-category expanded" data-category="algorithm">
                            <div class="category-header">
                                <span>算法设置</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="category-items">
                                <div class="category-item" data-item="algorithm-management">算法管理</div>
                                <div class="category-item active" data-item="config-items">配置项设置</div>
                            </div>
                        </div>
                        <div class="settings-category" data-category="drawing">
                            <div class="category-header">
                                <span>勾画设置</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="category-items">
                                <div class="category-item" data-item="label-library">标签库设置</div>
                            </div>
                        </div>
                        <div class="settings-category" data-category="inspection">
                            <div class="category-header">
                                <span>检查设置</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="category-items">
                                <div class="category-item" data-item="inspection-default">检查默认设置</div>
                            </div>
                        </div>
                        <div class="settings-category" data-category="template">
                            <div class="category-header">
                                <span>模板设置</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="category-items">
                                <div class="category-item" data-item="clinical-target">临床目标模板</div>
                                <div class="category-item" data-item="report">报告模板</div>
                                <div class="category-item" data-item="organ-limit">器官限量模板</div>
                            </div>
                        </div>
                    </div>
                    <div class="settings-content">
                        <div class="settings-content-header">
                            <h3 id="settingsContentTitle">算法配置项</h3>
                        </div>
                        <div class="settings-content-body" id="settingsContentBody">
                            ${this.renderConfigItemsContent()}
                        </div>
                    </div>
                </div>
                <div class="settings-modal-footer">
                    <button class="btn btn-secondary" id="settingsCancelBtn">取消</button>
                    <button class="btn btn-primary" id="settingsConfirmBtn">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    renderConfigItemsContent() {
        return `
            <div class="settings-section">
                <div class="settings-section-title">剂量计算不确定性</div>
                <div class="settings-radio-group">
                    <label class="settings-radio-label">
                        <input type="radio" name="dose-uncertainty" value="uncertainty" checked>
                        <span class="radio-label-text">不确定度设置:</span>
                        <input type="text" class="settings-input" value="0~100.00" readonly>
                        <span class="input-unit">%</span>
                    </label>
                    <label class="settings-radio-label">
                        <input type="radio" name="dose-uncertainty" value="particle-count">
                        <span class="radio-label-text">剂量计算粒子数:</span>
                        <input type="text" class="settings-input" value="0~10E.00" readonly>
                    </label>
                </div>
            </div>
        `;
    }

    renderLanguageContent() {
        return `
            <div class="settings-section">
                <div class="settings-section-title">语言设置</div>
                <div class="settings-form-group">
                    <label class="settings-label">界面语言</label>
                    <select class="settings-select">
                        <option value="zh-CN" selected>简体中文</option>
                        <option value="en-US">English</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderDataTransferContent() {
        return `
            <div class="settings-section">
                <div class="settings-section-title">数据传输设置</div>
                <div class="settings-form-group">
                    <label class="settings-label">传输协议</label>
                    <select class="settings-select">
                        <option value="dicom">DICOM</option>
                        <option value="http">HTTP</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderBusinessConfigContent() {
        return `
            <div class="settings-section">
                <div class="settings-section-title">业务配置项设置</div>
                <div class="settings-form-group">
                    <label class="settings-label">配置项内容</label>
                    <textarea class="settings-textarea" rows="5"></textarea>
                </div>
            </div>
        `;
    }

    renderMachineContent() {
        return `
            <div class="settings-section">
                <div class="settings-section-title">机器设置</div>
                <div class="settings-form-group">
                    <label class="settings-label">机器类型</label>
                    <select class="settings-select">
                        <option value="proton">质子治疗机</option>
                        <option value="photon">光子治疗机</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderAlgorithmManagementContent() {
        return `
            <div class="settings-section">
                <div class="settings-section-title">算法管理</div>
                <div class="settings-form-group">
                    <label class="settings-label">算法列表</label>
                    <div class="settings-list">
                        <div class="settings-list-item">算法1</div>
                        <div class="settings-list-item">算法2</div>
                        <div class="settings-list-item">算法3</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLabelLibraryContent() {
        return `
            <div class="settings-section">
                <div class="settings-section-title">标签库设置</div>
                <div class="settings-form-group">
                    <label class="settings-label">标签列表</label>
                    <div class="settings-list">
                        <div class="settings-list-item">标签1</div>
                        <div class="settings-list-item">标签2</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderInspectionDefaultContent() {
        return `
            <div class="settings-section">
                <div class="settings-section-title">检查默认设置</div>
                <div class="settings-form-group">
                    <label class="settings-label">默认检查项</label>
                    <div class="settings-checkbox-group">
                        <label><input type="checkbox" checked> 检查项1</label>
                        <label><input type="checkbox" checked> 检查项2</label>
                        <label><input type="checkbox"> 检查项3</label>
                    </div>
                </div>
            </div>
        `;
    }

    renderTemplateContent(templateType) {
        const titles = {
            'clinical-target': '临床目标模板',
            'report': '报告模板',
            'organ-limit': '器官限量模板'
        };
        return `
            <div class="settings-section">
                <div class="settings-section-title">${titles[templateType] || '模板设置'}</div>
                <div class="settings-form-group">
                    <label class="settings-label">模板列表</label>
                    <div class="settings-list">
                        <div class="settings-list-item">模板1</div>
                        <div class="settings-list-item">模板2</div>
                    </div>
                </div>
            </div>
        `;
    }

    getContentForItem(category, item) {
        const contentMap = {
            'general': {
                'language': this.renderLanguageContent()
            },
            'system': {
                'data-transfer': this.renderDataTransferContent(),
                'business-config': this.renderBusinessConfigContent(),
                'machine': this.renderMachineContent()
            },
            'algorithm': {
                'algorithm-management': this.renderAlgorithmManagementContent(),
                'config-items': this.renderConfigItemsContent()
            },
            'drawing': {
                'label-library': this.renderLabelLibraryContent()
            },
            'inspection': {
                'inspection-default': this.renderInspectionDefaultContent()
            },
            'template': {
                'clinical-target': this.renderTemplateContent('clinical-target'),
                'report': this.renderTemplateContent('report'),
                'organ-limit': this.renderTemplateContent('organ-limit')
            }
        };

        const titles = {
            'language': '语言&外观',
            'data-transfer': '数据传输设置',
            'business-config': '业务配置项设置',
            'machine': '机器设置',
            'algorithm-management': '算法管理',
            'config-items': '算法配置项',
            'label-library': '标签库设置',
            'inspection-default': '检查默认设置',
            'clinical-target': '临床目标模板',
            'report': '报告模板',
            'organ-limit': '器官限量模板'
        };

        return {
            title: titles[item] || '设置',
            content: contentMap[category]?.[item] || '<div class="settings-section">内容待实现</div>'
        };
    }

    bindEvents() {
        // 关闭按钮
        const closeBtn = this.modal.querySelector('#settingsModalClose');
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

        // 分类展开/收起
        const categoryHeaders = this.modal.querySelectorAll('.category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const category = header.closest('.settings-category');
                category.classList.toggle('expanded');
            });
        });

        // 分类项点击
        const categoryItems = this.modal.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // 移除其他项的active状态
                categoryItems.forEach(i => i.classList.remove('active'));
                // 添加当前项的active状态
                item.classList.add('active');

                const category = item.closest('.settings-category');
                const categoryName = category.dataset.category;
                const itemName = item.dataset.item;

                this.currentCategory = categoryName;
                this.currentItem = itemName;

                // 展开父分类
                category.classList.add('expanded');

                // 更新内容
                this.updateContent(categoryName, itemName);
            });
        });

        // 取消按钮
        const cancelBtn = this.modal.querySelector('#settingsCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // 确定按钮
        const confirmBtn = this.modal.querySelector('#settingsConfirmBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.save();
            });
        }
    }

    updateContent(category, item) {
        const { title, content } = this.getContentForItem(category, item);
        const titleEl = this.modal.querySelector('#settingsContentTitle');
        const contentEl = this.modal.querySelector('#settingsContentBody');

        if (titleEl) {
            titleEl.textContent = title;
        }
        if (contentEl) {
            contentEl.innerHTML = content;
        }
    }

    save() {
        // 保存设置逻辑
        console.log('保存设置');
        this.close();
    }

    show() {
        if (this.modal) {
            this.modal.style.display = 'flex';
        }
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    destroy() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}

// 导出到全局
window.SettingsModalComponent = SettingsModalComponent;

