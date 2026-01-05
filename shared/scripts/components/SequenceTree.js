/**
 * 序列树组件
 * 用于显示医疗文件的层级结构
 */
class SequenceTree {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showFileInfo: true,
            enableSelection: true,
            enableExpandCollapse: true,
            ...options
        };
        this.selectedItem = null;
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
     * 渲染序列树
     */
    render() {
        const treeData = this.getTreeData();
        this.container.innerHTML = this.generateTreeHTML(treeData);
    }

    /**
     * 获取树形数据
     */
    getTreeData() {
        return [
            {
                id: 'study',
                name: 'Study 39478',
                type: 'study',
                expanded: true,
                children: [
                    // 4DCT图像组
                    {
                        id: '4dct-group',
                        name: '4DCT1 2019-01-14',
                        type: 'image-group',
                        expanded: true,
                        children: [
                            { id: '4dct-1', name: 'CT1 0%', type: '4dct-frame' },
                            { id: '4dct-2', name: 'CT2 10%', type: '4dct-frame' },
                            { id: '4dct-3', name: 'CT3 20%', type: '4dct-frame' },
                            { id: '4dct-4', name: 'CT4 30%', type: '4dct-frame' },
                            { id: '4dct-5', name: 'CT5 40%', type: '4dct-frame' },
                            { id: '4dct-6', name: 'CT6 50%', type: '4dct-frame' },
                            { id: '4dct-7', name: 'CT7 60%', type: '4dct-frame' },
                            { id: '4dct-8', name: 'CT8 70%', type: '4dct-frame' },
                            { id: '4dct-9', name: 'CT9 80%', type: '4dct-frame' },
                            { id: '4dct-10', name: 'CT10 90%', type: '4dct-frame' },
                            {
                                id: '4dct-struct',
                                name: '4DStruct1',
                                type: '4dct-struct',
                                expanded: false
                            }
                        ]
                    },
                    // PTCT图像组
                    {
                        id: 'ptct-group',
                        name: 'PTCT1 2019-01-14',
                        type: 'image-group',
                        expanded: true,
                        children: [
                            { id: 'ptct-ct', name: 'CT1 2019-01-14', type: 'ptct-ct' },
                            { id: 'ptct-pt', name: 'PT1 2019-01-14', type: 'ptct-pt' }
                        ]
                    },
                    // 普通CT
                    {
                        id: 'ct1',
                        name: 'CT2 2019-09-15',
                        type: 'image',
                        expanded: false
                    },
                    // CBCT
                    {
                        id: 'cbct1',
                        name: 'CBCT1 2019-01-14',
                        type: 'image',
                        expanded: false
                    },
                    // MR
                    {
                        id: 'mr1',
                        name: 'MR1 2019-01-14',
                        type: 'image',
                        expanded: false
                    },
                    // 能谱CT
                    {
                        id: 'spectral-ct',
                        name: '能谱CT1 2019-01-14',
                        type: 'image',
                        expanded: true,
                        children: [
                            { id: '80kvp', name: '80kVp', type: 'scan' },
                            { id: '140kvp', name: '140kVp', type: 'scan' },
                            { id: 'spr', name: 'SPR', type: 'scan' },
                            { id: 'vmi', name: 'VMI 70keV', type: 'scan' },
                            { id: 'zeffective', name: 'ZEffective', type: 'scan' },
                            { id: 'vnc', name: 'VNC[HU]', type: 'scan' },
                            { id: 'electron', name: 'ElectronDensity', type: 'scan' }
                        ]
                    },
                    // SPECT图像
                    {
                        id: 'spect1',
                        name: 'SPECT 1 2019-02-10',
                        type: 'spect',
                        expanded: false
                    },
                    // US图像
                    {
                        id: 'us1',
                        name: 'US 1 2019-03-15',
                        type: 'ultrasound',
                        expanded: false
                    },
                    // 新增CT序列
                    {
                        id: 'ct2-2025-10-01',
                        name: 'CT2 2025-10-01',
                        type: 'image',
                        expanded: true,
                        children: [
                            {
                                id: 'rtstruct1-new',
                                name: 'RTStruct1',
                                type: 'rtstruct',
                                expanded: true,
                                children: [
                                    {
                                        id: 'plan-e',
                                        name: 'Plan E',
                                        type: 'plan',
                                        expanded: true,
                                        children: [
                                            {
                                                id: 'group1',
                                                name: 'Group1',
                                                type: 'beam-group',
                                                expanded: true,
                                                children: [
                                                    { id: 'bed-dose-1', name: 'BED Dose', type: 'dose' },
                                                    { id: 'reference-dose-1', name: 'Refrence Dose', type: 'dose' }
                                                ]
                                            },
                                            {
                                                id: 'group2',
                                                name: 'Group2',
                                                type: 'beam-group',
                                                expanded: true,
                                                children: [
                                                    { id: 'bed-dose-2', name: 'BED Dose', type: 'dose' },
                                                    { id: 'reference-dose-2', name: 'Refrence Dose', type: 'dose' }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                ]
            }
        ];
    }

    /**
     * 生成树形HTML
     */
    generateTreeHTML(data, level = 0) {
        let html = '<ul class="tree-list">';
        
        data.forEach(item => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = item.expanded;
            const iconClass = this.getIconClass(item.type);
            const chevronClass = hasChildren ? (isExpanded ? 'fa-chevron-down' : 'fa-chevron-right') : '';
            const itemClass = `tree-item ${isExpanded ? 'expanded' : 'collapsed'} level-${level + 1}`;
            
            // 生成状态图标
            let statusIcons = '';
            if (item.approved) {
                statusIcons += `<i class="fas fa-lock status-icon approved" title="审批人: ${item.approvedBy}, 审批时间: ${item.approvedTime}"></i>`;
            }
            if (item.external) {
                statusIcons += `<i class="fas fa-external-link-alt status-icon external" title="外部导入"></i>`;
            }
            
            html += `
                <li class="${itemClass}" data-id="${item.id}" data-type="${item.type}">
                    ${hasChildren ? `<i class="fas ${chevronClass} chevron-icon"></i>` : ''}
                    <i class="fas ${iconClass} type-icon"></i>
                    <span class="item-name">${item.name}</span>
                    ${statusIcons}
                </li>
            `;
            
            if (hasChildren && isExpanded) {
                html += this.generateTreeHTML(item.children, level + 1);
            }
        });
        
        html += '</ul>';
        return html;
    }

    /**
     * 获取图标类名
     */
    getIconClass(type) {
        const iconMap = {
            'study': 'fa-folder-open',
            'image-group': 'fa-layer-group',
            'image': 'fa-file-image',
            '4dct-frame': 'fa-lungs',
            '4dct-struct': 'fa-circle-double',
            'ptct-ct': 'fa-file-image',
            'ptct-pt': 'fa-lungs',
            'rtstruct': 'fa-draw-polygon',
            'plan': 'fa-radiation',
            'beam-group': 'fa-bullseye',
            'qa-plan': 'fa-clipboard-check',
            'dose': 'fa-radiation-alt',
            'predicted-dose': 'fa-crystal-ball',
            'bed-dose': 'fa-dna',
            'accumulated-dose': 'fa-layer-group',
            'reference-dose': 'fa-bookmark',
            'scan': 'fa-lungs'
        };
        return iconMap[type] || 'fa-file-alt';
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const treeItems = this.container.querySelectorAll('.tree-item');
        
        treeItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleItemClick(item);
            });
            
            // 添加双击事件支持
            item.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.handle4DCTDoubleClick(item);
            });
        });
    }

    /**
     * 处理项目点击
     */
    handleItemClick(item) {
        if (this.options.enableSelection) {
            this.selectItem(item);
        }
        
        if (this.options.enableExpandCollapse) {
            this.toggleExpand(item);
        }
        
        this.onItemSelected(item);
    }

    /**
     * 选择项目
     */
    selectItem(item) {
        // 移除其他选中项
        this.container.querySelectorAll('.tree-item').forEach(treeItem => {
            treeItem.classList.remove('selected');
        });
        
        // 选中当前项
        item.classList.add('selected');
        this.selectedItem = item;
    }

    /**
     * 切换展开/折叠
     */
    toggleExpand(item) {
        const hasChildren = item.querySelector('.chevron-icon');
        if (!hasChildren) return;
        
        const isExpanded = item.classList.contains('expanded');
        const chevronIcon = item.querySelector('.chevron-icon');
        
        if (isExpanded) {
            // 折叠
            item.classList.remove('expanded');
            item.classList.add('collapsed');
            chevronIcon.classList.remove('fa-chevron-down');
            chevronIcon.classList.add('fa-chevron-right');
            
            // 隐藏子项
            this.hideChildren(item);
        } else {
            // 展开
            item.classList.remove('collapsed');
            item.classList.add('expanded');
            chevronIcon.classList.remove('fa-chevron-right');
            chevronIcon.classList.add('fa-chevron-down');
            
            // 显示子项
            this.showChildren(item);
        }
    }

    /**
     * 隐藏子项
     */
    hideChildren(parentItem) {
        const parentLevel = parseInt(parentItem.className.match(/level-(\d+)/)[1]);
        let nextItem = parentItem.nextElementSibling;
        
        while (nextItem && nextItem.classList.contains('tree-item')) {
            const itemLevel = parseInt(nextItem.className.match(/level-(\d+)/)[1]);
            
            if (itemLevel <= parentLevel) {
                break;
            }
            
            if (itemLevel === parentLevel + 1) {
                nextItem.style.display = 'none';
            }
            
            nextItem = nextItem.nextElementSibling;
        }
    }

    /**
     * 显示子项
     */
    showChildren(parentItem) {
        const parentLevel = parseInt(parentItem.className.match(/level-(\d+)/)[1]);
        let nextItem = parentItem.nextElementSibling;
        
        while (nextItem && nextItem.classList.contains('tree-item')) {
            const itemLevel = parseInt(nextItem.className.match(/level-(\d+)/)[1]);
            
            if (itemLevel <= parentLevel) {
                break;
            }
            
            if (itemLevel === parentLevel + 1) {
                nextItem.style.display = 'block';
            }
            
            nextItem = nextItem.nextElementSibling;
        }
    }

    /**
     * 项目选择回调
     */
    onItemSelected(item) {
        const itemName = item.querySelector('span').textContent;
        const itemId = item.getAttribute('data-id');
        const itemType = item.getAttribute('data-type');
        
        // 根据文件类型更新文件信息显示
        if (typeof window.updateFileInfoDisplay === 'function') {
            let fileInfoType = 'image';
            
            // 判断文件类型
            if (itemType === 'rtstruct' || itemType === '4dct-struct') {
                fileInfoType = 'struct';
            } else if (itemType === 'plan') {
                fileInfoType = 'plan';
            } else if (itemType === 'image' || itemType === 'scan' || 
                       itemType === '4dct-frame' || itemType === 'ptct-ct' || 
                       itemType === 'ptct-pt' || itemType === 'spect' || 
                       itemType === 'ultrasound') {
                fileInfoType = 'image';
            }
            
            window.updateFileInfoDisplay(fileInfoType);
        }
        
        // 触发自定义事件
        const event = new CustomEvent('sequenceTreeItemSelected', {
            detail: {
                id: itemId,
                name: itemName,
                type: itemType,
                element: item
            }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * 获取选中的项目
     */
    getSelectedItem() {
        return this.selectedItem;
    }

    /**
     * 展开所有项目
     */
    expandAll() {
        this.container.querySelectorAll('.tree-item').forEach(item => {
            if (item.querySelector('.fa-chevron-right')) {
                this.toggleExpand(item);
            }
        });
    }

    /**
     * 折叠所有项目
     */
    collapseAll() {
        this.container.querySelectorAll('.tree-item').forEach(item => {
            if (item.querySelector('.fa-chevron-down')) {
                this.toggleExpand(item);
            }
        });
    }

    /**
     * 处理4DCT双击事件
     */
    handle4DCTDoubleClick(item) {
        if (item.getAttribute('data-type') === 'image-group' && 
            item.querySelector('span').textContent.includes('4DCT')) {
            // 触发4D播放器事件
            const event = new CustomEvent('4DPlayerRequested', {
                detail: {
                    groupId: item.getAttribute('data-id'),
                    groupName: item.querySelector('span').textContent
                }
            });
            this.container.dispatchEvent(event);
        }
    }

    /**
     * 处理PTCT切换事件
     */
    handlePTCTToggle(item, showPT) {
        if (item.getAttribute('data-type') === 'image-group' && 
            item.querySelector('span').textContent.includes('PTCT')) {
            const ptctItems = item.parentElement.querySelectorAll('[data-type="ptct-pt"], [data-type="ptct-ct"]');
            ptctItems.forEach(child => {
                if (showPT && child.getAttribute('data-type') === 'ptct-pt') {
                    child.style.display = 'block';
                } else if (!showPT && child.getAttribute('data-type') === 'ptct-ct') {
                    child.style.display = 'block';
                } else {
                    child.style.display = 'none';
                }
            });
        }
    }

    /**
     * 获取4DCT帧数据
     */
    get4DCTFrames(groupId) {
        const groupItem = this.container.querySelector(`[data-id="${groupId}"]`);
        if (!groupItem) return [];
        
        const frames = [];
        const frameItems = groupItem.parentElement.querySelectorAll('[data-type="4dct-frame"]');
        frameItems.forEach((frame, index) => {
            frames.push({
                index: index + 1,
                name: frame.querySelector('span').textContent,
                element: frame
            });
        });
        return frames;
    }

    /**
     * 获取PTCT子项
     */
    getPTCTItems(groupId) {
        const groupItem = this.container.querySelector(`[data-id="${groupId}"]`);
        if (!groupItem) return { ct: null, pt: null };
        
        const ctItem = groupItem.parentElement.querySelector('[data-type="ptct-ct"]');
        const ptItem = groupItem.parentElement.querySelector('[data-type="ptct-pt"]');
        
        return {
            ct: ctItem ? {
                name: ctItem.querySelector('span').textContent,
                element: ctItem
            } : null,
            pt: ptItem ? {
                name: ptItem.querySelector('span').textContent,
                element: ptItem
            } : null
        };
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.container.innerHTML = '';
        this.selectedItem = null;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SequenceTree;
} else {
    window.SequenceTree = SequenceTree;
}
