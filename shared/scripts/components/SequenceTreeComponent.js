// 序列树组件 - 可复用的序列树组件
class SequenceTreeComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            prefix: options.prefix || '',
            onSequenceSelect: options.onSequenceSelect || null,
            onFileSelect: options.onFileSelect || null,
            showFileInfo: options.showFileInfo === true,
            ...options
        };
        this.init();
    }

    init() {
        this.render();
        // bindEvents会在render中的generateSequenceTree后调用
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="sequence-tree-container">
                <div class="sequence-tree-wrapper">
                    <div class="file-tree" id="${this.options.prefix}sequenceTree">
                    <!-- 序列树将通过JavaScript动态生成 -->
                    </div>
                    
                    ${this.options.showFileInfo ? `
                <!-- 文件信息显示 - 吸附在底部 -->
                <div class="file-info-display">
                    <div class="file-info-header">文件信息</div>
                    <div class="file-info-content" id="${this.options.prefix}fileInfoContent">
                        <div class="info-item">
                            <span class="info-label">图像模态:</span>
                            <span class="info-value">CT</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">图像层数:</span>
                            <span class="info-value">102</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">拍摄日期:</span>
                            <span class="info-value">2019.01.03</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">拍摄时间:</span>
                            <span class="info-value">17:02:12</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">层厚:</span>
                            <span class="info-value">2.5mm</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">像素间距:</span>
                            <span class="info-value">0.98×0.98</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">图像尺寸:</span>
                            <span class="info-value">512×512</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">窗宽:</span>
                            <span class="info-value">400</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">窗位:</span>
                            <span class="info-value">40</span>
                        </div>
                    </div>
                </div>
                    ` : ''}
                </div>
            </div>
        `;

        // 生成序列树
        this.generateSequenceTree();
    }

    generateSequenceTree() {
        const treeContainer = document.getElementById(`${this.options.prefix}sequenceTree`);
        if (!treeContainer) return;

        // 如果已经有保存的数据，使用保存的数据；否则创建新数据
        let sequenceData;
        if (this.sequenceData && this.sequenceData["Study 6202"]) {
            // 使用已保存的数据（可能已被修改）
            sequenceData = { "Study 6202": this.sequenceData["Study 6202"] };
        } else {
            // 按截图示例的患者树结构
            sequenceData = {
                "Study 6202": {
                    type: "study",
                    children: {
                        "CT1 2025-10-01": {
                            type: "imageGroup",
                            modality: "ct",
                            children: {
                                "RTStruct1": {
                                    type: "rtstruct",
                                    children: {
                                        "PlanA": { type: "plan" },
                                        "PlanB": { type: "plan" }
                                    }
                                },
                                "RTStruct2": {
                                    type: "rtstruct",
                                    children: {
                                        "QAPlan C": { type: "plan" },
                                        "QAPlan D": { type: "plan" }
                                    }
                                }
                            }
                        },
                        "CT2 2025-10-01": {
                            type: "imageGroup",
                            modality: "ct",
                            children: {
                                "RTStruct1": {
                                    type: "rtstruct",
                                    children: {
                                        "Plan E": { type: "plan" }
                                    }
                                }
                            }
                        },
                        "PTCT3 2019-01-14": {
                            type: "imageGroup",
                            modality: "pt",
                            children: {
                                "PT1 2019-01-14": { type: "file", icon: "lungs" },
                                "CT1 2019-01-14": { type: "file", icon: "file" }
                            }
                        },
                        "4DCT3 2019-01-14": {
                            type: "imageGroup",
                            modality: "ct",
                            children: {
                                "CT1 2019-01-14": { type: "file", icon: "lungs" },
                                "CT2 2019-01-14": { type: "file", icon: "lungs" },
                                "CT3 2019-01-14": { type: "file", icon: "lungs" },
                                "CT4 2019-01-14": { type: "file", icon: "lungs" },
                                "CT5 2019-01-14": { type: "file", icon: "lungs" },
                                "CT6 2019-01-14": { type: "file", icon: "lungs" },
                                "CT7 2019-01-14": { type: "file", icon: "lungs" },
                                "CT8 2019-01-14": { type: "file", icon: "lungs" },
                                "CT9 2019-01-14": { type: "file", icon: "lungs" }
                            }
                        }
                    }
                }
            };
            // 保存序列树数据以便后续操作使用
            this.sequenceData = { "Study 6202": sequenceData["Study 6202"] };
        }

        treeContainer.innerHTML = this.buildTreeHTML(sequenceData);
        
        // 重新绑定事件（因为树结构已重新生成）
        // 重置事件绑定标记，确保事件能重新绑定
        if (treeContainer.dataset.eventsBound === 'true') {
            treeContainer.dataset.eventsBound = 'false';
        }
        this.bindEvents();
    }

    buildTreeHTML(data, level = 0, parentCounters = null) {
        let html = '';
        const entries = Array.isArray(data) ? data : Object.entries(data);
        // 记录需要编号的节点计数（rtstruct/plan）- 从1开始
        const counters = parentCounters ? { ...parentCounters } : { rtstruct: 0, plan: 0 };
        
        for (const [name, content] of entries) {
            const hasChildren = typeof content === 'object' && content.children && Object.keys(content.children).length > 0;
            const isFileLike = ['file', 'struct', 'dose', 'image'].includes(content.type);
            
            // 自动编号：rtstruct/plan/group 按同级顺序生成 2 位编号（从01开始）
            const displayName = this.getDisplayName(name, content, counters);
            
            if (isFileLike) {
                const iconClass = this.getIconClass(content.icon || content.type || 'file', content.modality);
                const isStruct = content.type === 'struct';
                html += `
                    <div class="tree-item file-item level-${level + 1} ${isStruct ? 'struct-item' : ''}" 
                         data-file="${displayName}" 
                         data-type="${content.type || 'file'}"
                         ${isStruct ? 'data-struct="true"' : ''}>
                        <i class="${iconClass} type-icon"></i>
                        <span class="file-name">${displayName}</span>
                    </div>
                `;
            } else if (hasChildren || content.type === 'imageGroup' || content.type === 'study' || content.type === 'rtstruct' || content.type === 'plan' || content.type === 'group') {
                const folderIconClass = this.getFolderIconClass(content, level);
                // 传递计数器给子节点，但子层级会重置同级计数
                const children = hasChildren ? this.buildTreeHTML(content.children, level + 1, null) : '';
                const chevron = hasChildren ? '<i class="fas fa-chevron-down chevron-icon"></i>' : '<span class="chevron-placeholder"></span>';
                html += `
                    <div class="tree-item folder-item level-${level + 1}" data-folder="${displayName}">
                        ${chevron}
                        <i class="${folderIconClass} type-icon"></i>
                        <span class="folder-name">${displayName}</span>
                    </div>
                    ${children ? `<div class="folder-children" style="display: block;">${children}</div>` : ''}
                `;
            }
        }
        
        return html;
    }

    // 节点显示名（含自动编号）
    getDisplayName(name, content, counters) {
        // RTStruct和Plan已经有编号（如RTStruct1、PlanA），不需要自动编号
        return name;
    }

    // 根据图标类型/模态获取对应的CSS类
    getIconClass(iconType, modality) {
        const iconMap = {
            'lungs': 'fas fa-lungs',
            'file': 'fas fa-file-alt',
            'cube': 'fas fa-cube',
            'radiation': 'fas fa-radiation',
            'target': 'fas fa-bullseye',
            'ct': 'fas fa-layer-group',
            'pt': 'fas fa-radiation',
            'mr': 'fas fa-brain',
            'plan': 'fas fa-clipboard-check',
            'group': 'fas fa-folder-open',
            'dose': 'fas fa-radiation',
            'default': 'fas fa-file-alt'
        };
        // 所有图像模态的文件节点统一使用lungs图标
        if (modality && ['ct', 'pt', 'mr'].includes(modality) && iconType === 'file') {
            return 'fas fa-lungs';
        }
        if (modality && iconMap[modality]) return iconMap[modality];
        return iconMap[iconType] || iconMap['default'];
    }

    // 根据节点类型获取文件夹图标
    getFolderIconClass(content, level) {
        if (content.type === 'study' || level === 0) {
            return 'fas fa-folder';
        } else if (content.type === 'imageGroup') {
            // PTCT和4DCT都使用layer-group图标表示集合，只有MR使用brain图标
            return content.modality === 'mr' ? 'fas fa-brain' :
                   'fas fa-layer-group';
        } else if (content.type === 'rtstruct') {
            return 'fas fa-cube';
        } else if (content.type === 'plan') {
            return 'fas fa-clipboard-check';
        } else if (content.type === 'group') {
            return 'fas fa-bullseye';
        }
        return 'fas fa-folder';
    }

    bindEvents() {
        const treeContainer = document.getElementById(`${this.options.prefix}sequenceTree`);
        if (!treeContainer) return;

        // 文件夹展开/收起
        const folderItems = treeContainer.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            // 箭头点击事件 - 只展开/折叠，不触发选择
            const chevronIcon = item.querySelector('.chevron-icon');
            if (chevronIcon) {
                chevronIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    const childrenContainer = item.nextElementSibling;
                    const hasChildren = childrenContainer && childrenContainer.classList.contains('folder-children');
                    
                    if (hasChildren) {
                        const isExpanded = childrenContainer.style.display !== 'none';
                        
                        if (isExpanded) {
                            childrenContainer.style.display = 'none';
                            chevronIcon.className = 'fas fa-chevron-right chevron-icon';
                        } else {
                            childrenContainer.style.display = 'block';
                            chevronIcon.className = 'fas fa-chevron-down chevron-icon';
                        }
                    }
                });
            }
            
            // 文件夹名称点击事件 - 只选择，不展开/折叠
            const folderName = item.querySelector('.folder-name');
            if (folderName) {
                folderName.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // 序列选择
                    // 移除其他序列的选中状态
                    folderItems.forEach(fi => fi.classList.remove('selected'));
                    
                    // 添加当前序列的选中状态
                    item.classList.add('selected');
                    
                    // 触发回调
                    if (this.options.onSequenceSelect) {
                        const sequenceName = item.getAttribute('data-folder');
                        this.options.onSequenceSelect(sequenceName, item);
                    }
                });
            }
        });

        // 文件选择
        const fileItems = treeContainer.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // 移除其他文件的选中状态
                fileItems.forEach(fi => fi.classList.remove('selected'));
                
                // 添加当前文件的选中状态
                item.classList.add('selected');
                
                // 触发回调
                if (this.options.onFileSelect) {
                    const fileName = item.getAttribute('data-file');
                    this.options.onFileSelect(fileName, item);
                }
            });
            
            // 右键菜单 - 仅对struct类型的项显示
            if (item.getAttribute('data-struct') === 'true') {
                item.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showContextMenu(e, item);
                });
            }
        });
        
        // 点击其他地方时隐藏右键菜单
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }
    
    // 显示右键菜单
    showContextMenu(e, item) {
        // 隐藏之前的菜单
        this.hideContextMenu();
        
        const menuId = `${this.options.prefix}contextMenu`;
        let menu = document.getElementById(menuId);
        
        if (!menu) {
            // 创建右键菜单
            menu = document.createElement('div');
            menu.id = menuId;
            menu.className = 'sequence-tree-context-menu';
            menu.innerHTML = `
                <div class="context-menu-item" data-action="copy-sketch">
                    <span>复制勾画</span>
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="delete-sketch">
                    <span>删除勾画</span>
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="migrate-sketch">
                    <span>迁移勾画</span>
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="modify-sketch">
                    <span>修改勾画</span>
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="new-sketch">
                    <span>新建勾画</span>
                </div>
            `;
            
            document.body.appendChild(menu);
            
            // 绑定菜单项点击事件
            menu.querySelectorAll('.context-menu-item').forEach(menuItem => {
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = menuItem.getAttribute('data-action');
                    this.handleContextMenuAction(action, item);
                    this.hideContextMenu();
                });
            });
        }
        
        // 设置菜单位置
        menu.style.display = 'block';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        
        // 保存当前选中的项
        this.contextMenuTarget = item;
    }
    
    // 隐藏右键菜单
    hideContextMenu() {
        const menuId = `${this.options.prefix}contextMenu`;
        const menu = document.getElementById(menuId);
        if (menu) {
            menu.style.display = 'none';
        }
        this.contextMenuTarget = null;
    }
    
    // 处理右键菜单操作
    handleContextMenuAction(action, item) {
        const structName = item.getAttribute('data-file');
        const structType = item.getAttribute('data-type');
        
        console.log('右键菜单操作:', action, '目标:', structName);
        
        // 触发回调（如果提供了）
        if (this.options.onContextMenuAction) {
            this.options.onContextMenuAction(action, structName, item);
        }
        
        // 根据不同的操作执行相应的逻辑
        switch(action) {
            case 'copy-sketch':
                console.log('复制勾画:', structName);
                // TODO: 实现复制勾画逻辑
                break;
            case 'delete-sketch':
                console.log('删除勾画:', structName);
                // TODO: 实现删除勾画逻辑
                if (confirm(`确定要删除勾画 "${structName}" 吗？`)) {
                    // 删除操作
                }
                break;
            case 'migrate-sketch':
                console.log('迁移勾画:', structName);
                this.showMigrateSketchModal(item, structName);
                break;
            case 'modify-sketch':
                console.log('修改勾画:', structName);
                // TODO: 实现修改勾画逻辑
                break;
            case 'new-sketch':
                console.log('新建勾画');
                // TODO: 实现新建勾画逻辑
                break;
        }
    }

    // 获取当前选中的文件
    getSelectedFile() {
        const treeContainer = document.getElementById(`${this.options.prefix}sequenceTree`);
        if (!treeContainer) return null;
        
        const selectedFile = treeContainer.querySelector('.file-item.selected');
        return selectedFile ? selectedFile.getAttribute('data-file') : null;
    }

    // 获取当前选中的序列
    getSelectedSequence() {
        const treeContainer = document.getElementById(`${this.options.prefix}sequenceTree`);
        if (!treeContainer) return null;
        
        const selectedSequence = treeContainer.querySelector('.folder-item.selected');
        return selectedSequence ? selectedSequence.getAttribute('data-folder') : null;
    }

    // 设置文件为选中状态
    setSelectedFile(fileName) {
        const treeContainer = document.getElementById(`${this.options.prefix}sequenceTree`);
        if (!treeContainer) return;
        
        const fileItems = treeContainer.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            item.classList.remove('selected');
            if (item.getAttribute('data-file') === fileName) {
                item.classList.add('selected');
            }
        });
    }

    // 设置序列为选中状态
    setSelectedSequence(sequenceName) {
        const treeContainer = document.getElementById(`${this.options.prefix}sequenceTree`);
        if (!treeContainer) return;
        
        const folderItems = treeContainer.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            item.classList.remove('selected');
            if (item.getAttribute('data-folder') === sequenceName) {
                item.classList.add('selected');
            }
        });
    }

    // 更新文件信息
    updateFileInfo(fileInfo) {
        if (!this.options.showFileInfo) return;
        
        const fileInfoContent = document.getElementById(`${this.options.prefix}fileInfoContent`);
        if (!fileInfoContent) return;

        // 更新文件信息显示
        const infoItems = fileInfoContent.querySelectorAll('.info-item');
        infoItems.forEach(item => {
            const label = item.querySelector('.info-label').textContent;
            const valueElement = item.querySelector('.info-value');
            
            if (fileInfo[label]) {
                valueElement.textContent = fileInfo[label];
            }
        });
    }

    // 显示迁移勾画弹窗
    showMigrateSketchModal(item, structName) {
        console.log('showMigrateSketchModal called', item, structName);
        
        // 获取当前struct所在的影像组
        const currentImageGroup = this.getImageGroupForStruct(item);
        console.log('currentImageGroup:', currentImageGroup);
        
        // 获取所有影像组列表
        const imageGroupList = this.getAllImageGroups();
        console.log('imageGroupList:', imageGroupList);
        
        if (!currentImageGroup || !imageGroupList || imageGroupList.length === 0) {
            console.error('无法获取影像组信息', { currentImageGroup, imageGroupList });
            alert('无法获取影像组信息');
            return;
        }
        
        // 创建弹窗
        const modalId = `${this.options.prefix}migrateSketchModal`;
        let modal = document.getElementById(modalId);
        
        if (modal) {
            modal.remove();
        }
        
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'migrate-sketch-modal';
        modal.style.display = 'block'; // 确保显示
        modal.style.zIndex = '10000'; // 确保在最上层
        modal.innerHTML = `
            <div class="migrate-sketch-overlay"></div>
            <div class="migrate-sketch-content">
                <div class="migrate-sketch-header">
                    <h3>迁移勾画</h3>
                    <button class="migrate-sketch-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="migrate-sketch-body">
                    <div class="migrate-sketch-form-group">
                        <label class="migrate-sketch-label">影像组:</label>
                        <select class="migrate-sketch-select" id="${this.options.prefix}migrateImageGroup">
                            ${imageGroupList.map(group => 
                                `<option value="${group}" ${group === currentImageGroup ? 'selected' : ''}>${group}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="migrate-sketch-form-group">
                        <label class="migrate-sketch-label">迁移至:</label>
                        <select class="migrate-sketch-select" id="${this.options.prefix}migrateTargetImage">
                            <option value="">请选择图像</option>
                        </select>
                    </div>
                </div>
                <div class="migrate-sketch-footer">
                    <button class="migrate-sketch-btn migrate-sketch-cancel">取消</button>
                    <button class="migrate-sketch-btn migrate-sketch-confirm">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('Modal created and appended to body', modal);
        
        // 初始化图像列表（根据当前选中的影像组）
        this.updateImageListForGroup(currentImageGroup, `${this.options.prefix}migrateTargetImage`);
        
        // 绑定事件
        const closeBtn = modal.querySelector('.migrate-sketch-close');
        const cancelBtn = modal.querySelector('.migrate-sketch-cancel');
        const confirmBtn = modal.querySelector('.migrate-sketch-confirm');
        const overlay = modal.querySelector('.migrate-sketch-overlay');
        const imageGroupSelect = document.getElementById(`${this.options.prefix}migrateImageGroup`);
        const targetImageSelect = document.getElementById(`${this.options.prefix}migrateTargetImage`);
        
        // 影像组选择变化时，更新图像列表
        imageGroupSelect.addEventListener('change', (e) => {
            const selectedGroup = e.target.value;
            this.updateImageListForGroup(selectedGroup, `${this.options.prefix}migrateTargetImage`);
        });
        
        const closeModal = () => {
            modal.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        confirmBtn.addEventListener('click', () => {
            const selectedImageGroup = imageGroupSelect.value;
            const targetImage = targetImageSelect.value;
            
            if (!selectedImageGroup) {
                alert('请选择影像组');
                return;
            }
            
            if (!targetImage) {
                alert('请选择要迁移到的图像');
                return;
            }
            
            // 执行迁移操作
            this.migrateSketchToImage(structName, selectedImageGroup, targetImage);
            closeModal();
        });
        
        // ESC键关闭
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
    
    // 获取所有影像组列表
    getAllImageGroups() {
        if (!this.sequenceData) {
            this.generateSequenceTree();
        }
        
        const imageGroups = [];
        const findImageGroups = (data) => {
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'object' && !value.type) {
                    // 检查是否是影像组（包含CT、能谱、MR、PT等关键词）
                    if (key.includes('CT') || key.includes('能谱') || key.includes('MR') || key.includes('PT') || key.includes('CBCT')) {
                        imageGroups.push(key);
                    }
                    // 递归查找
                    findImageGroups(value);
                }
            }
        };
        
        const studyData = this.sequenceData["Study 39478"];
        findImageGroups(studyData);
        return imageGroups;
    }
    
    // 更新图像列表（根据选中的影像组）
    updateImageListForGroup(imageGroup, selectId) {
        const imageList = this.getImageListForGroup(imageGroup);
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // 清空并重新填充选项
        select.innerHTML = '<option value="">请选择图像</option>';
        imageList.forEach(image => {
            const option = document.createElement('option');
            option.value = image;
            option.textContent = image;
            select.appendChild(option);
        });
    }
    
    // 获取struct所在的影像组
    getImageGroupForStruct(structItem) {
        // 向上查找，找到影像组（能谱CT1 2019-01-14这样的节点）
        let current = structItem.parentElement; // folder-children
        let foundFirstFolder = false;
        
        while (current) {
            // 查找folder-item
            const folderItem = current.previousElementSibling;
            if (folderItem && folderItem.classList.contains('folder-item')) {
                const folderName = folderItem.querySelector('.folder-name');
                if (folderName) {
                    const name = folderName.textContent;
                    if (!foundFirstFolder) {
                        // 第一个找到的是直接父文件夹（如80kVp），跳过
                        foundFirstFolder = true;
                        current = folderItem.parentElement; // 继续向上查找
                        continue;
                    } else {
                        // 第二个找到的是影像组（如能谱CT1 2019-01-14）
                        if (name.includes('CT') || name.includes('能谱') || name.includes('MR') || name.includes('PT')) {
                            return name;
                        }
                    }
                }
            }
            // 继续向上查找
            if (current.previousElementSibling && current.previousElementSibling.classList.contains('folder-item')) {
                current = current.previousElementSibling.parentElement;
            } else {
                current = current.parentElement;
            }
        }
        
        // 如果DOM查找失败，从数据中查找
        if (!this.sequenceData) {
            this.generateSequenceTree();
        }
        
        const structName = structItem.getAttribute('data-file');
        const findGroupForStruct = (data, targetStruct) => {
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'object' && !value.type) {
                    // 检查子节点
                    for (const [childKey, childValue] of Object.entries(value)) {
                        if (typeof childValue === 'object' && !childValue.type) {
                            // 检查更深层的节点
                            for (const [grandChildKey, grandChildValue] of Object.entries(childValue)) {
                                if (grandChildValue && grandChildValue.type === 'struct' && grandChildKey === targetStruct) {
                                    return key; // 返回影像组名称
                                }
                            }
                        }
                    }
                    // 递归查找
                    const result = findGroupForStruct(value, targetStruct);
                    if (result) return result;
                }
            }
            return null;
        };
        
        const studyData = this.sequenceData["Study 39478"];
        const result = findGroupForStruct(studyData, structName);
        return result || '能谱CT1 2019-01-14'; // 默认返回能谱CT1
    }
    
    // 获取影像组下的所有图像列表
    getImageListForGroup(imageGroup) {
        // 从序列树数据中获取该影像组下的所有图像
        if (!this.sequenceData) {
            // 如果没有保存，重新生成数据
            this.generateSequenceTree();
        }
        
        // 从保存的数据中查找
        const findImagesInGroup = (data, targetGroup) => {
            for (const [key, value] of Object.entries(data)) {
                if (key === targetGroup) {
                    // 找到目标组，返回所有子节点（图像）
                    const images = [];
                    for (const [childKey, childValue] of Object.entries(value)) {
                        // 如果是文件类型，直接添加
                        if (childValue && childValue.type === 'file') {
                            images.push(childKey);
                        } else if (typeof childValue === 'object' && !childValue.type) {
                            // 如果是文件夹（如80kVp），也添加
                            images.push(childKey);
                        }
                    }
                    return images;
                } else if (typeof value === 'object' && !value.type) {
                    // 递归查找
                    const result = findImagesInGroup(value, targetGroup);
                    if (result) return result;
                }
            }
            return null;
        };
        
        // 从Study开始查找
        const studyData = this.sequenceData["Study 39478"];
        return findImagesInGroup(studyData, imageGroup) || [];
    }
    
    // 执行迁移操作
    migrateSketchToImage(structName, imageGroup, targetImage) {
        console.log('迁移勾画:', structName, '到', imageGroup, '->', targetImage);
        
        // 更新序列树数据
        if (!this.sequenceData) {
            this.generateSequenceTree();
        }
        
        // 在目标图像下添加struct
        const addStructToImage = (data, targetGroup, targetImg) => {
            for (const [key, value] of Object.entries(data)) {
                if (key === targetGroup) {
                    // 找到目标组
                    if (value[targetImg]) {
                        // 如果目标图像存在
                        if (typeof value[targetImg] === 'object' && !value[targetImg].type) {
                            // 如果已经是文件夹，直接添加struct（如果不存在）
                            if (!value[targetImg][structName]) {
                                value[targetImg][structName] = { 
                                    type: "struct", 
                                    size: "2.3MB", 
                                    date: new Date().toISOString().split('T')[0].replace(/-/g, '-'), 
                                    icon: "cube" 
                                };
                                console.log('已在文件夹下添加struct:', structName);
                                return true;
                            } else {
                                console.log('struct已存在，跳过');
                                return true;
                            }
                        } else {
                            // 如果是文件，需要转换为文件夹结构，并在文件夹下添加struct
                            const originalFile = value[targetImg];
                            // 将文件转换为文件夹，文件夹下包含struct
                            value[targetImg] = {
                                [structName]: { 
                                    type: "struct", 
                                    size: "2.3MB", 
                                    date: new Date().toISOString().split('T')[0].replace(/-/g, '-'), 
                                    icon: "cube" 
                                }
                            };
                            console.log('已将文件转换为文件夹并添加struct:', structName);
                            return true;
                        }
                    } else {
                        console.error('目标图像不存在:', targetImg);
                        return false;
                    }
                } else if (typeof value === 'object' && !value.type) {
                    // 递归查找
                    if (addStructToImage(value, targetGroup, targetImg)) {
                        return true;
                    }
                }
            }
            return false;
        };
        
        // 更新数据
        const studyData = this.sequenceData["Study 39478"];
        if (addStructToImage(studyData, imageGroup, targetImage)) {
            console.log('迁移成功，重新生成树');
            // 重新生成树
            this.generateSequenceTree();
            
            // 触发回调
            if (this.options.onSketchMigrated) {
                this.options.onSketchMigrated(structName, imageGroup, targetImage);
            }
        } else {
            console.error('迁移失败：无法找到目标图像', { imageGroup, targetImage });
            alert('迁移失败：无法找到目标图像');
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
window.SequenceTreeComponent = SequenceTreeComponent;
