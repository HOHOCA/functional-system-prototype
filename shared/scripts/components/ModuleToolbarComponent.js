/**
 * 模块工具栏组件 - 可复用的工具栏组件（完整版）
 * 功能：
 * - 支持固定模式和悬浮模式
 * - 工具分类和拖动排序
 * - 常用工具管理
 * - 布局方向切换（横向/纵向）
 * - 数据持久化
 */
class ModuleToolbarComponent {
    constructor(containerId, options = {}) {
        // 处理 containerId：确保始终是字符串
        if (typeof containerId === 'string') {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
        } else if (containerId && containerId.nodeType) {
            // 如果是 DOM 元素
            this.container = containerId;
            // 如果元素没有 id，生成一个唯一的 id
            if (!containerId.id) {
                const uniqueId = `module-toolbar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                containerId.id = uniqueId;
            }
            this.containerId = containerId.id;
        } else {
            // 无效的参数
            console.error('ModuleToolbarComponent: containerId 必须是字符串或 DOM 元素');
            return;
        }
        
        // 默认配置
        this.options = {
            // 工具配置：支持分类
            // tools: [
            //   { id: 'tool1', icon: 'fas fa-icon', label: '工具1', category: '常规', visible: true },
            //   ...
            // ]
            tools: options.tools || [],
            
            // 工具分类配置：每个模块定义自己的分类
            categories: options.categories || ['常规', 'QA', '审核'],
            
            // 当前模块标识（用于数据持久化）
            moduleId: options.moduleId || 'default',
            
            // 当前账号标识（用于数据持久化，跟随账号存储）
            accountId: options.accountId || null,
            
            // 自定义存储接口（可选）
            // 如果提供，将使用此接口进行存储/读取，否则使用默认的localStorage
            // 接口格式：{ save: (key, data) => Promise, load: (key) => Promise }
            storageInterface: options.storageInterface || null,
            
            // 回调函数
            onToolClick: options.onToolClick || null,
            
            // 左侧栏宽度（用于计算默认位置）
            leftSidebarWidth: options.leftSidebarWidth || 350,
            
            // 顶部栏高度（用于计算默认位置）
            topBarHeight: options.topBarHeight || 60,
            
            ...options
        };

        // 组件状态
        this.state = {
            mode: 'fixed', // 'fixed' | 'floating'
            layout: 'horizontal', // 'horizontal' | 'vertical'
            position: { x: 0, y: 0 }, // 悬浮模式位置
            toolOrder: [], // 工具顺序
            toolVisibility: {}, // 工具可见性 {toolId: true/false}
            categories: {} // 分类工具映射
        };

        // 拖拽相关
        this.dragState = {
            isDraggingTool: false,
            isDraggingToolbar: false,
            draggedTool: null,
            dragStartPos: null,
            dragTarget: null
        };

        // DOM 引用
        this.elements = {
            fixedContainer: null,
            floatingContainer: null,
            toolbar: null,
            header: null,
            content: null
        };

        // 初始化（异步加载配置）
        if (this.container) {
            this.loadConfig().then(() => {
                this.init();
                this.bindWindowResize();
            }).catch(() => {
                // 即使加载失败也继续初始化
                this.init();
                this.bindWindowResize();
            });
        }
    }

    /**
     * 初始化组件
     */
    init() {
        // 处理工具数据：按分类组织
        this.organizeTools();
        
        // 渲染组件
        this.render();
        
        // 绑定事件
        this.bindEvents();
        
        // 应用模式
        this.applyMode();
    }

    /**
     * 组织工具数据：按分类分组
     */
    organizeTools() {
        const categories = {};
        const toolOrder = [];
        
        // 初始化分类
        this.options.categories.forEach(cat => {
            categories[cat] = [];
        });

        // 按配置的顺序组织工具
        const allTools = [...this.options.tools];
        
        // 如果存在保存的工具顺序，使用它
        if (this.state.toolOrder.length > 0) {
            const orderMap = new Map();
            this.state.toolOrder.forEach((toolId, index) => {
                orderMap.set(toolId, index);
            });
            
            allTools.sort((a, b) => {
                const orderA = orderMap.get(a.id) ?? Infinity;
                const orderB = orderMap.get(b.id) ?? Infinity;
                return orderA - orderB;
            });
        }

        // 按分类分组
        allTools.forEach(tool => {
            const category = tool.category || '常规';
            const visible = this.state.toolVisibility[tool.id] !== undefined 
                ? this.state.toolVisibility[tool.id] 
                : (tool.visible !== false);
            
            if (!categories[category]) {
                categories[category] = [];
            }
            
            if (visible) {
                categories[category].push(tool);
                toolOrder.push(tool.id);
            }
        });

        this.state.categories = categories;
        this.state.toolOrder = toolOrder;
    }

    /**
     * 渲染组件
     */
    render() {
        if (!this.container) return;

        // 创建固定模式容器
        this.createFixedContainer();
        
        // 创建悬浮模式容器
        this.createFloatingContainer();
    }

    /**
     * 创建固定模式容器
     */
    createFixedContainer() {
        const fixedContainer = document.createElement('div');
        fixedContainer.className = 'module-toolbar-fixed-container';
        fixedContainer.id = `${this.containerId}-fixed`;
        
        const toolbar = document.createElement('div');
        toolbar.className = 'module-toolbar module-toolbar-fixed';
        
        const content = document.createElement('div');
        content.className = 'module-toolbar-content module-toolbar-horizontal';
        
        // 渲染工具按钮（固定模式也显示分隔符，使用垂直分隔线）
        content.innerHTML = this.renderTools(true);
        
        // 右侧控制按钮区域
        const controls = document.createElement('div');
        controls.className = 'module-toolbar-controls';
        controls.innerHTML = `
            <button class="module-toolbar-control-btn" id="${this.containerId}-more-btn" title="其他工具">
                <i class="fas fa-ellipsis-h"></i>
            </button>
            <button class="module-toolbar-control-btn" id="${this.containerId}-float-btn" title="切换到悬浮模式">
                <i class="fas fa-window-restore"></i>
            </button>
        `;
        
        toolbar.appendChild(content);
        toolbar.appendChild(controls);
        fixedContainer.appendChild(toolbar);
        
        this.container.appendChild(fixedContainer);
        this.elements.fixedContainer = fixedContainer;
        this.elements.toolbar = toolbar;
        this.elements.content = content;
    }

    /**
     * 创建悬浮模式容器
     */
    createFloatingContainer() {
        const floatingContainer = document.createElement('div');
        floatingContainer.className = 'module-toolbar-floating-container';
        floatingContainer.id = `${this.containerId}-floating`;
        floatingContainer.style.display = 'none';
        
        // 标题栏（可拖动）
        const header = document.createElement('div');
        header.className = 'module-toolbar-header';
        // 纵向模式时隐藏标题文字
        const titleText = this.state.layout === 'vertical' ? '' : '工具栏';
        header.innerHTML = `
            <span class="module-toolbar-title" ${titleText ? '' : 'style="display: none;"'}>${titleText}</span>
            <div class="module-toolbar-header-controls">
                <button class="module-toolbar-header-btn" id="${this.containerId}-floating-more-btn" title="其他工具">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
                <button class="module-toolbar-header-btn" id="${this.containerId}-layout-btn" title="切换方向">
                    <i class="fas fa-${this.state.layout === 'horizontal' ? 'arrows-alt-v' : 'arrows-alt-h'}"></i>
                </button>
                <button class="module-toolbar-header-btn" id="${this.containerId}-close-btn" title="切换到固定模式">
                    <i class="fas fa-window-maximize"></i>
                </button>
            </div>
        `;
        
        // 内容区域
        const content = document.createElement('div');
        content.className = `module-toolbar-content module-toolbar-${this.state.layout}`;
        content.innerHTML = this.renderTools(true); // true 表示悬浮模式，需要分隔符
        
        floatingContainer.appendChild(header);
        floatingContainer.appendChild(content);
        
        // 初始化布局类名
        if (this.state.layout === 'vertical') {
            floatingContainer.classList.add('layout-vertical');
        } else {
            floatingContainer.classList.add('layout-horizontal');
        }
        
        document.body.appendChild(floatingContainer);
        this.elements.floatingContainer = floatingContainer;
        this.elements.header = header;
    }

    /**
     * 渲染工具按钮
     * @param {boolean} showSeparator - 是否显示分类分隔符（悬浮模式）
     */
    renderTools(showSeparator = false) {
        let html = '';
        const categories = this.state.categories;
        const categoryKeys = Object.keys(categories).filter(cat => categories[cat] && categories[cat].length > 0);
        
        // 判断是否隐藏标签（悬浮模式纵向时）
        const hideLabel = this.state.mode === 'floating' && this.state.layout === 'vertical';
        
        // 根据布局方向决定分隔符样式
        const isVerticalLayout = this.state.mode === 'floating' && this.state.layout === 'vertical';
        
        categoryKeys.forEach((categoryName, catIndex) => {
            const tools = categories[categoryName];
            
            // 渲染分类工具
            tools.forEach(tool => {
                // 支持自定义 SVG/HTML 图标（如果 icon 以 < 开头，则直接使用 HTML）
                const iconHTML = tool.icon && tool.icon.trim().startsWith('<') 
                    ? tool.icon 
                    : `<i class="${tool.icon}"></i>`;
                
                html += `
                    <button class="module-tool-btn" 
                            data-tool="${tool.id}" 
                            data-category="${categoryName}"
                            draggable="true"
                            title="${tool.tooltip || tool.label}">
                        ${iconHTML}
                        ${hideLabel ? '' : `<span class="module-tool-label">${tool.label}</span>`}
                    </button>
                `;
            });
            
            // 分类之间添加分隔符（固定模式和悬浮模式都显示）
            // 只在不是最后一个分类时添加分隔符
            if (showSeparator && catIndex < categoryKeys.length - 1) {
                html += `<div class="module-toolbar-separator">${isVerticalLayout ? '——' : ''}</div>`;
            }
        });
        
        return html;
    }

    /**
     * 获取隐藏的工具（未勾选的工具）
     */
    getHiddenTools() {
        return this.options.tools.filter(tool => {
            const visible = this.state.toolVisibility[tool.id] !== undefined 
                ? this.state.toolVisibility[tool.id] 
                : (tool.visible !== false);
            return !visible;
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 固定模式：切换到悬浮模式按钮
        const floatBtn = document.getElementById(`${this.containerId}-float-btn`);
        if (floatBtn) {
            floatBtn.addEventListener('click', () => this.switchToFloating());
        }
        
        // 悬浮模式：关闭按钮（切换回固定模式）
        const closeBtn = document.getElementById(`${this.containerId}-close-btn`);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.switchToFixed());
        }
        
        // 悬浮模式：布局方向切换按钮
        const layoutBtn = document.getElementById(`${this.containerId}-layout-btn`);
        if (layoutBtn) {
            layoutBtn.addEventListener('click', () => this.toggleLayout());
        }
        
        // 工具按钮点击事件
        this.bindToolClickEvents();
        
        // 工具按钮拖动事件
        this.bindToolDragEvents();
        
        // 悬浮工具栏拖动事件
        this.bindToolbarDragEvents();
        
        // "其他工具"按钮事件
        this.bindMoreToolsEvents();
    }

    /**
     * 绑定工具点击事件
     */
    bindToolClickEvents() {
        const containers = [
            this.elements.fixedContainer,
            this.elements.floatingContainer
        ].filter(Boolean);
        
        containers.forEach(container => {
            const buttons = container?.querySelectorAll('.module-tool-btn:not(.module-tool-btn-more)');
            buttons?.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const toolId = btn.getAttribute('data-tool');
                    
                    if (this.options.onToolClick) {
                        this.options.onToolClick(toolId);
                    }
                    
                    // 切换激活状态
                    const allButtons = container.querySelectorAll('.module-tool-btn');
                    allButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        });
    }

    /**
     * 绑定工具拖动事件
     */
    bindToolDragEvents() {
        const containers = [
            this.elements.fixedContainer,
            this.elements.floatingContainer
        ].filter(Boolean);
        
        containers.forEach(container => {
            const buttons = container?.querySelectorAll('.module-tool-btn[draggable="true"]');
            buttons?.forEach(btn => {
                // 拖动开始
                btn.addEventListener('dragstart', (e) => {
                    this.handleToolDragStart(e, btn);
                });
                
                // 拖动经过
                btn.addEventListener('dragover', (e) => {
                    this.handleToolDragOver(e, btn);
                });
                
                // 拖动进入
                btn.addEventListener('dragenter', (e) => {
                    this.handleToolDragEnter(e, btn);
                });
                
                // 拖动离开
                btn.addEventListener('dragleave', (e) => {
                    this.handleToolDragLeave(e, btn);
                });
                
                // 放下
                btn.addEventListener('drop', (e) => {
                    this.handleToolDrop(e, btn);
                });
                
                // 拖动结束
                btn.addEventListener('dragend', (e) => {
                    this.handleToolDragEnd(e, btn);
                });
            });
        });
    }

    /**
     * 工具拖动开始
     */
    handleToolDragStart(e, btn) {
        const toolId = btn.getAttribute('data-tool');
        const category = btn.getAttribute('data-category');
        
        this.dragState.isDraggingTool = true;
        this.dragState.draggedTool = { id: toolId, category };
        
        btn.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', btn.outerHTML);
        
        // 视觉反馈：透明度降低并旋转5度
        btn.style.opacity = '0.5';
        btn.style.transform = 'rotate(5deg)';
    }

    /**
     * 工具拖动经过
     */
    handleToolDragOver(e, btn) {
        if (!this.dragState.isDraggingTool) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const targetCategory = btn.getAttribute('data-category');
        const draggedCategory = this.dragState.draggedTool?.category;
        
        // 只能在同一类别内拖动
        if (targetCategory !== draggedCategory) {
            e.dataTransfer.dropEffect = 'none';
            return;
        }
    }

    /**
     * 工具拖动进入
     */
    handleToolDragEnter(e, btn) {
        if (!this.dragState.isDraggingTool) return;
        
        e.preventDefault();
        
        const targetCategory = btn.getAttribute('data-category');
        const draggedCategory = this.dragState.draggedTool?.category;
        
        if (targetCategory === draggedCategory) {
            btn.classList.add('drag-over');
        } else {
            btn.classList.add('drag-forbidden');
        }
    }

    /**
     * 工具拖动离开
     */
    handleToolDragLeave(e, btn) {
        btn.classList.remove('drag-over', 'drag-forbidden');
    }

    /**
     * 工具放下
     */
    handleToolDrop(e, btn) {
        if (!this.dragState.isDraggingTool) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const draggedId = this.dragState.draggedTool.id;
        const targetId = btn.getAttribute('data-tool');
        const targetCategory = btn.getAttribute('data-category');
        const draggedCategory = this.dragState.draggedTool.category;
        
        // 只能在同一类别内拖动
        if (targetCategory !== draggedCategory) {
            return;
        }
        
        // 更新工具顺序
        this.reorderTools(draggedId, targetId, targetCategory);
        
        // 重新渲染
        this.refreshToolbar();
    }

    /**
     * 工具拖动结束
     */
    handleToolDragEnd(e, btn) {
        btn.classList.remove('dragging', 'drag-over', 'drag-forbidden');
        btn.style.opacity = '';
        btn.style.transform = '';
        
        // 清理所有拖动状态
        const allButtons = document.querySelectorAll('.module-tool-btn');
        allButtons.forEach(b => {
            b.classList.remove('drag-over', 'drag-forbidden');
        });
        
        this.dragState.isDraggingTool = false;
        this.dragState.draggedTool = null;
    }

    /**
     * 重新排序工具
     */
    reorderTools(draggedId, targetId, category) {
        const categoryTools = [...this.state.categories[category]];
        const draggedIndex = categoryTools.findIndex(t => t.id === draggedId);
        const targetIndex = categoryTools.findIndex(t => t.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        // 移除被拖动的工具
        const [draggedTool] = categoryTools.splice(draggedIndex, 1);
        
        // 插入到目标位置
        categoryTools.splice(targetIndex, 0, draggedTool);
        
        // 更新分类工具
        this.state.categories[category] = categoryTools;
        
        // 更新全局工具顺序
        this.updateGlobalToolOrder();
        
        // 保存配置
        this.saveConfig();
    }

    /**
     * 更新全局工具顺序
     */
    updateGlobalToolOrder() {
        const order = [];
        Object.values(this.state.categories).forEach(categoryTools => {
            categoryTools.forEach(tool => {
                order.push(tool.id);
            });
        });
        this.state.toolOrder = order;
    }

    /**
     * 绑定悬浮工具栏拖动事件
     */
    bindToolbarDragEvents() {
        if (!this.elements.header) return;
        
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        this.elements.header.addEventListener('mousedown', (e) => {
            if (this.state.mode !== 'floating') return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = this.elements.floatingContainer.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            this.dragState.isDraggingToolbar = true;
            this.elements.floatingContainer.classList.add('dragging');
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            e.preventDefault();
        });
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newX = initialX + deltaX;
            let newY = initialY + deltaY;
            
            // 边界限制：确保工具栏不会完全移出屏幕
            const containerRect = this.elements.floatingContainer.getBoundingClientRect();
            const maxX = window.innerWidth - containerRect.width;
            const maxY = window.innerHeight - containerRect.height;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            this.elements.floatingContainer.style.left = `${newX}px`;
            this.elements.floatingContainer.style.top = `${newY}px`;
            
            this.state.position = { x: newX, y: newY };
        };
        
        const handleMouseUp = () => {
            isDragging = false;
            this.dragState.isDraggingToolbar = false;
            this.elements.floatingContainer?.classList.remove('dragging');
            
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // 保存位置
            this.saveConfig();
        };
    }

    /**
     * 绑定"其他工具"按钮事件
     */
    bindMoreToolsEvents() {
        // 固定模式的"其他工具"按钮（在控制按钮区域）
        const fixedMoreBtn = document.getElementById(`${this.containerId}-more-btn`);
        if (fixedMoreBtn) {
            fixedMoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showMoreToolsMenu(fixedMoreBtn);
            });
        }
        
        // 悬浮模式的"其他工具"按钮（在标题栏）
        const floatingMoreBtn = document.getElementById(`${this.containerId}-floating-more-btn`);
        if (floatingMoreBtn) {
            floatingMoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showMoreToolsMenu(floatingMoreBtn);
            });
        }
    }

    /**
     * 显示"其他工具"菜单
     */
    showMoreToolsMenu(triggerBtn) {
        // 移除已存在的菜单
        const existingMenu = document.getElementById(`${this.containerId}-more-menu`);
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        const hiddenTools = this.getHiddenTools();
        // 即使没有隐藏工具，也显示菜单（用于访问自定义常用工具）
        
        // 创建菜单
        const menu = document.createElement('div');
        menu.className = 'module-toolbar-more-menu';
        menu.id = `${this.containerId}-more-menu`;
        
        // 添加"自定义常用工具"按钮
        menu.innerHTML = `
            <div class="module-toolbar-more-header">
                <button class="module-toolbar-custom-btn" id="${this.containerId}-custom-btn">
                    <i class="fas fa-cog"></i> 自定义常用工具
                </button>
            </div>
            <div class="module-toolbar-more-content">
                ${hiddenTools.length > 0 ? hiddenTools.map(tool => {
                    const iconHTML = tool.icon && tool.icon.trim().startsWith('<') 
                        ? tool.icon 
                        : `<i class="${tool.icon}"></i>`;
                    return `
                    <button class="module-toolbar-more-item" data-tool="${tool.id}" title="${tool.tooltip || tool.label}">
                        ${iconHTML}
                        <span>${tool.label}</span>
                    </button>
                `;
                }).join('') : '<div class="module-toolbar-more-empty">暂无隐藏工具</div>'}
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // 定位菜单（智能定位，避免超出屏幕）
        this.positionMoreMenu(menu, triggerBtn);
        
        // 绑定菜单事件
        menu.querySelectorAll('.module-toolbar-more-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const toolId = item.getAttribute('data-tool');
                if (this.options.onToolClick) {
                    this.options.onToolClick(toolId);
                }
                menu.remove();
            });
        });
        
        // 自定义常用工具按钮
        const customBtn = document.getElementById(`${this.containerId}-custom-btn`);
        if (customBtn) {
            customBtn.addEventListener('click', () => {
                menu.remove();
                this.showCustomToolsDialog();
            });
        }
        
        // 点击外部关闭菜单
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== triggerBtn) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }

    /**
     * 定位"其他工具"菜单
     */
    positionMoreMenu(menu, triggerBtn) {
        const btnRect = triggerBtn.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        
        let top = btnRect.bottom + 5;
        let left = btnRect.left;
        
        // 检查右边界
        if (left + menuRect.width > window.innerWidth) {
            left = window.innerWidth - menuRect.width - 10;
        }
        
        // 检查下边界
        if (top + menuRect.height > window.innerHeight) {
            top = btnRect.top - menuRect.height - 5;
        }
        
        // 检查左边界
        if (left < 0) {
            left = 10;
        }
        
        // 检查上边界
        if (top < 0) {
            top = 10;
        }
        
        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
    }

    /**
     * 显示"自定义常用工具"配置弹窗
     */
    showCustomToolsDialog() {
        // 移除已存在的弹窗
        const existingDialog = document.getElementById(`${this.containerId}-custom-dialog`);
        if (existingDialog) {
            existingDialog.remove();
        }
        
        // 创建弹窗
        const dialog = document.createElement('div');
        dialog.className = 'module-toolbar-custom-dialog';
        dialog.id = `${this.containerId}-custom-dialog`;
        
        // 按分类组织工具
        const toolsByCategory = {};
        this.options.categories.forEach(cat => {
            toolsByCategory[cat] = this.options.tools.filter(t => (t.category || '常规') === cat);
        });
        
        // 构建弹窗内容
        let contentHtml = '';
        Object.keys(toolsByCategory).forEach(categoryName => {
            const tools = toolsByCategory[categoryName];
            if (tools.length === 0) return;
            
            contentHtml += `
                <div class="module-toolbar-custom-category">
                    <div class="module-toolbar-custom-category-title">${categoryName}</div>
                    <div class="module-toolbar-custom-tools">
                        ${tools.map(tool => {
                            const isVisible = this.state.toolVisibility[tool.id] !== undefined 
                                ? this.state.toolVisibility[tool.id] 
                                : (tool.visible !== false);
                            
                            const iconHTML = tool.icon && tool.icon.trim().startsWith('<') 
                                ? tool.icon 
                                : `<i class="${tool.icon}"></i>`;
                            return `
                                <div class="module-toolbar-custom-tool-item ${isVisible ? 'checked' : ''}" 
                                     data-tool="${tool.id}">
                                    <label>
                                        <input type="checkbox" ${isVisible ? 'checked' : ''} 
                                               data-tool="${tool.id}">
                                        ${iconHTML}
                                        <span>${tool.label}</span>
                                    </label>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });
        
        dialog.innerHTML = `
            <div class="module-toolbar-custom-dialog-content">
                <div class="module-toolbar-custom-dialog-header">
                    <h3>自定义常用工具</h3>
                    <label class="module-toolbar-custom-select-all">
                        <input type="checkbox" id="${this.containerId}-select-all">
                        <span>全选</span>
                    </label>
                </div>
                <div class="module-toolbar-custom-dialog-body">
                    ${contentHtml}
                </div>
                <div class="module-toolbar-custom-dialog-footer">
                    <button class="module-toolbar-custom-reset" id="${this.containerId}-reset-btn">还原设置</button>
                    <div>
                        <button class="module-toolbar-custom-cancel" id="${this.containerId}-cancel-btn">取消</button>
                        <button class="module-toolbar-custom-confirm" id="${this.containerId}-confirm-btn">保存</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 绑定事件
        this.bindCustomDialogEvents(dialog);
    }

    /**
     * 绑定自定义工具弹窗事件
     */
    bindCustomDialogEvents(dialog) {
        // 全选/取消全选
        const selectAll = document.getElementById(`${this.containerId}-select-all`);
        const selectAllId = `${this.containerId}-select-all`;
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = dialog.querySelectorAll(`input[type="checkbox"]:not(#${selectAllId})`);
                checkboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                    const item = cb.closest('.module-toolbar-custom-tool-item');
                    if (item) {
                        item.classList.toggle('checked', e.target.checked);
                    }
                });
            });
        }
        
        // 单个工具勾选
        dialog.querySelectorAll(`input[type="checkbox"]:not(#${selectAllId})`).forEach(cb => {
            cb.addEventListener('change', (e) => {
                const item = e.target.closest('.module-toolbar-custom-tool-item');
                if (item) {
                    item.classList.toggle('checked', e.target.checked);
                }
                
                // 更新全选状态
                const allChecked = Array.from(dialog.querySelectorAll(`input[type="checkbox"]:not(#${selectAllId})`))
                    .every(cb => cb.checked);
                if (selectAll) {
                    selectAll.checked = allChecked;
                }
            });
        });
        
        // 初始化全选复选框状态（检查所有复选框是否都已选中）
        const allCheckboxes = dialog.querySelectorAll(`input[type="checkbox"]:not(#${selectAllId})`);
        const allChecked = allCheckboxes.length > 0 && Array.from(allCheckboxes).every(cb => cb.checked);
        if (selectAll) {
            selectAll.checked = allChecked;
        }
        
        // 取消按钮
        const cancelBtn = document.getElementById(`${this.containerId}-cancel-btn`);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                dialog.remove();
            });
        }
        
        // 还原设置按钮
        const resetBtn = document.getElementById(`${this.containerId}-reset-btn`);
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                // 重置为初始配置
                this.state.toolVisibility = {};
                this.bindCustomDialogEvents(dialog); // 重新绑定以更新状态
                dialog.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    const toolId = cb.getAttribute('data-tool');
                    const tool = this.options.tools.find(t => t.id === toolId);
                    cb.checked = tool?.visible !== false;
                    const item = cb.closest('.module-toolbar-custom-tool-item');
                    if (item) {
                        item.classList.toggle('checked', cb.checked);
                    }
                });
                
                // 更新全选状态
                const allChecked = Array.from(dialog.querySelectorAll(`input[type="checkbox"]:not(#${selectAllId})`))
                    .every(cb => cb.checked);
                if (selectAll) {
                    selectAll.checked = allChecked;
                }
            });
        }
        
        // 保存按钮
        const confirmBtn = document.getElementById(`${this.containerId}-confirm-btn`);
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                // 保存旧的可视性配置（用于比较）
                const oldVisibility = {...this.state.toolVisibility};
                
                // 收集勾选状态
                const newVisibility = {};
                dialog.querySelectorAll(`input[type="checkbox"]:not(#${selectAllId})`).forEach(cb => {
                    const toolId = cb.getAttribute('data-tool');
                    newVisibility[toolId] = cb.checked;
                });
                
                // 记录新添加的工具（从隐藏变为显示）
                const newTools = [];
                Object.keys(newVisibility).forEach(toolId => {
                    // 检查旧状态：如果之前未定义，默认为true（因为visible !== false）
                    const oldWasVisible = oldVisibility[toolId] !== undefined 
                        ? oldVisibility[toolId] 
                        : (this.options.tools.find(t => t.id === toolId)?.visible !== false);
                    const isNowVisible = newVisibility[toolId];
                    
                    // 如果之前是隐藏的，现在变为显示，则记录为新添加的工具
                    if (!oldWasVisible && isNowVisible) {
                        newTools.push(toolId);
                    }
                });
                
                // 更新可见性配置
                this.state.toolVisibility = newVisibility;
                
                // 重新组织工具（新添加的工具放在最后）
                this.organizeTools();
                
                // 将新添加的工具移动到工具栏最后面
                if (newTools.length > 0) {
                    newTools.forEach(toolId => {
                        const tool = this.options.tools.find(t => t.id === toolId);
                        if (tool) {
                            const category = tool.category || '常规';
                            const categoryTools = this.state.categories[category] || [];
                            
                            // 从当前位置移除
                            const index = categoryTools.findIndex(t => t.id === toolId);
                            if (index > -1) {
                                categoryTools.splice(index, 1);
                            }
                            
                            // 添加到末尾
                            categoryTools.push(tool);
                            this.state.categories[category] = categoryTools;
                        }
                    });
                    
                    // 更新全局工具顺序
                    this.updateGlobalToolOrder();
                }
                
                // 刷新工具栏
                this.refreshToolbar();
                
                // 保存配置
                this.saveConfig();
                
                // 关闭弹窗
                dialog.remove();
            });
        }
    }

    /**
     * 切换到悬浮模式
     */
    switchToFloating() {
        this.state.mode = 'floating';
        
        // 设置默认位置（左上角）
        const defaultX = this.options.leftSidebarWidth + 10;
        const defaultY = this.options.topBarHeight + 10;
        
        if (!this.state.position.x && !this.state.position.y) {
            this.state.position = { x: defaultX, y: defaultY };
        }
        
        this.applyMode();
    }

    /**
     * 切换到固定模式
     */
    switchToFixed() {
        this.state.mode = 'fixed';
        this.applyMode();
    }

    /**
     * 切换布局方向（仅悬浮模式）
     */
    toggleLayout() {
        if (this.state.mode !== 'floating') return;
        
        this.state.layout = this.state.layout === 'horizontal' ? 'vertical' : 'horizontal';
        
        // 更新按钮图标
        const layoutBtn = document.getElementById(`${this.containerId}-layout-btn`);
        if (layoutBtn) {
            const icon = layoutBtn.querySelector('i');
            if (icon) {
                icon.className = `fas fa-${this.state.layout === 'horizontal' ? 'arrows-alt-v' : 'arrows-alt-h'}`;
            }
        }
        
        // 更新内容区域类名并重新渲染工具（以更新分隔符）
        if (this.elements.floatingContainer) {
            const content = this.elements.floatingContainer.querySelector('.module-toolbar-content');
            const header = this.elements.floatingContainer.querySelector('.module-toolbar-header');
            const title = header ? header.querySelector('.module-toolbar-title') : null;
            
            // 更新容器类名以支持CSS选择器
            if (this.state.layout === 'vertical') {
                this.elements.floatingContainer.classList.add('layout-vertical');
                this.elements.floatingContainer.classList.remove('layout-horizontal');
            } else {
                this.elements.floatingContainer.classList.add('layout-horizontal');
                this.elements.floatingContainer.classList.remove('layout-vertical');
            }
            
            if (content) {
                content.className = `module-toolbar-content module-toolbar-${this.state.layout}`;
                content.innerHTML = this.renderTools(true); // 重新渲染以更新分隔符
                this.bindToolClickEvents();
                this.bindToolDragEvents();
                this.bindMoreToolsEvents();
            }
            
            // 更新标题显示（纵向时隐藏标题文字）
            if (title) {
                if (this.state.layout === 'vertical') {
                    title.style.display = 'none';
                } else {
                    title.style.display = '';
                    title.textContent = '工具栏';
                }
            }
        }
        
        // 应用尺寸限制
        this.applySizeConstraints();
        
        // 保存配置
        this.saveConfig();
    }

    /**
     * 应用模式
     */
    applyMode() {
        if (this.state.mode === 'floating') {
            // 显示悬浮容器，隐藏固定容器
            if (this.elements.fixedContainer) {
                this.elements.fixedContainer.style.display = 'none';
            }
            
            if (this.elements.floatingContainer) {
                this.elements.floatingContainer.style.display = 'block';
                
                // 设置位置
                this.elements.floatingContainer.style.left = `${this.state.position.x}px`;
                this.elements.floatingContainer.style.top = `${this.state.position.y}px`;
                
                // 应用尺寸限制
                this.applySizeConstraints();
            }
        } else {
            // 显示固定容器，隐藏悬浮容器
            if (this.elements.fixedContainer) {
                this.elements.fixedContainer.style.display = 'block';
            }
            
            if (this.elements.floatingContainer) {
                this.elements.floatingContainer.style.display = 'none';
            }
        }
        
        // 保存配置
        this.saveConfig();
    }

    /**
     * 应用尺寸限制（悬浮模式）
     */
    applySizeConstraints() {
        if (!this.elements.floatingContainer || this.state.mode !== 'floating') return;
        
        const container = this.elements.floatingContainer;
        const content = container.querySelector('.module-toolbar-content');
        if (!content) return;
        
        if (this.state.layout === 'horizontal') {
            // 横向：最大宽度为左侧栏右侧到屏幕右侧
            const maxWidth = window.innerWidth - this.options.leftSidebarWidth - 20;
            container.style.maxWidth = `${maxWidth}px`;
            container.style.width = 'auto';
            
            // 确保工具栏不超出屏幕
            const containerRect = container.getBoundingClientRect();
            if (containerRect.right > window.innerWidth) {
                container.style.left = `${window.innerWidth - containerRect.width - 10}px`;
                this.state.position.x = parseInt(container.style.left);
            }
            if (containerRect.left < this.options.leftSidebarWidth) {
                container.style.left = `${this.options.leftSidebarWidth + 10}px`;
                this.state.position.x = parseInt(container.style.left);
            }
        } else {
            // 纵向：最大高度为顶部栏下方到屏幕下方
            const maxHeight = window.innerHeight - this.options.topBarHeight - 20;
            container.style.maxHeight = `${maxHeight}px`;
            container.style.width = 'auto';
            
            // 确保工具栏不超出屏幕
            const containerRect = container.getBoundingClientRect();
            if (containerRect.bottom > window.innerHeight) {
                container.style.top = `${window.innerHeight - containerRect.height - 10}px`;
                this.state.position.y = parseInt(container.style.top);
            }
            if (containerRect.top < this.options.topBarHeight) {
                container.style.top = `${this.options.topBarHeight + 10}px`;
                this.state.position.y = parseInt(container.style.top);
            }
        }
    }

    /**
     * 绑定窗口大小改变事件
     */
    bindWindowResize() {
        this.handleWindowResize = () => {
            if (this.state.mode === 'floating') {
                this.applySizeConstraints();
            }
        };
        
        window.addEventListener('resize', this.handleWindowResize);
    }

    /**
     * 刷新工具栏（重新渲染工具）
     */
    refreshToolbar() {
        // 重新组织工具
        this.organizeTools();
        
        // 更新固定模式内容
        if (this.elements.content) {
            this.elements.content.className = 'module-toolbar-content module-toolbar-horizontal';
            this.elements.content.innerHTML = this.renderTools(true); // 固定模式也显示分隔符
            this.bindToolClickEvents();
            this.bindToolDragEvents();
            this.bindMoreToolsEvents(); // 重新绑定"其他工具"按钮
        }
        
        // 更新悬浮模式内容
        if (this.elements.floatingContainer) {
            const floatingContent = this.elements.floatingContainer.querySelector('.module-toolbar-content');
            const header = this.elements.floatingContainer.querySelector('.module-toolbar-header');
            const title = header ? header.querySelector('.module-toolbar-title') : null;
            
            // 更新布局类名
            if (this.state.layout === 'vertical') {
                this.elements.floatingContainer.classList.add('layout-vertical');
                this.elements.floatingContainer.classList.remove('layout-horizontal');
            } else {
                this.elements.floatingContainer.classList.add('layout-horizontal');
                this.elements.floatingContainer.classList.remove('layout-vertical');
            }
            
            if (floatingContent) {
                floatingContent.className = `module-toolbar-content module-toolbar-${this.state.layout}`;
                floatingContent.innerHTML = this.renderTools(true);
                this.bindToolClickEvents();
                this.bindToolDragEvents();
                this.bindMoreToolsEvents();
            }
            
            // 更新标题显示
            if (title) {
                if (this.state.layout === 'vertical') {
                    title.style.display = 'none';
                } else {
                    title.style.display = '';
                    title.textContent = '工具栏';
                }
            }
        }
        
        // 重新应用尺寸限制
        this.applySizeConstraints();
    }

    /**
     * 获取存储键名
     */
    getStorageKey() {
        // 如果有账号ID，使用账号+模块ID作为键名（跟随账号存储）
        if (this.options.accountId) {
            return `module-toolbar-${this.options.accountId}-${this.options.moduleId}`;
        }
        // 否则使用模块ID（临时存储，用于未登录状态）
        return `module-toolbar-${this.options.moduleId}`;
    }

    /**
     * 加载配置（从存储）
     */
    async loadConfig() {
        try {
            const storageKey = this.getStorageKey();
            let saved = null;
            
            // 使用自定义存储接口或默认localStorage
            if (this.options.storageInterface && this.options.storageInterface.load) {
                try {
                    saved = await this.options.storageInterface.load(storageKey);
                } catch (e) {
                    console.warn('使用自定义存储接口加载失败，回退到localStorage:', e);
                    saved = localStorage.getItem(storageKey);
                }
            } else {
                saved = localStorage.getItem(storageKey);
            }
            
            if (saved) {
                const config = typeof saved === 'string' ? JSON.parse(saved) : saved;
                
                if (config.mode) this.state.mode = config.mode;
                if (config.layout) this.state.layout = config.layout;
                if (config.position) this.state.position = config.position;
                if (config.toolOrder) this.state.toolOrder = config.toolOrder;
                if (config.toolVisibility) this.state.toolVisibility = config.toolVisibility;
            }
        } catch (e) {
            console.warn('加载工具栏配置失败:', e);
        }
    }

    /**
     * 保存配置（到存储）
     */
    async saveConfig() {
        try {
            const storageKey = this.getStorageKey();
            const config = {
                mode: this.state.mode,
                layout: this.state.layout,
                position: this.state.position,
                toolOrder: this.state.toolOrder,
                toolVisibility: this.state.toolVisibility
            };
            
            // 使用自定义存储接口或默认localStorage
            if (this.options.storageInterface && this.options.storageInterface.save) {
                try {
                    await this.options.storageInterface.save(storageKey, config);
                } catch (e) {
                    console.warn('使用自定义存储接口保存失败，回退到localStorage:', e);
                    localStorage.setItem(storageKey, JSON.stringify(config));
                }
            } else {
                localStorage.setItem(storageKey, JSON.stringify(config));
            }
        } catch (e) {
            console.warn('保存工具栏配置失败:', e);
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 移除窗口大小改变事件监听
        if (this.handleWindowResize) {
            window.removeEventListener('resize', this.handleWindowResize);
        }
        
        // 移除DOM元素
        if (this.elements.fixedContainer) {
            this.elements.fixedContainer.remove();
        }
        
        if (this.elements.floatingContainer) {
            this.elements.floatingContainer.remove();
        }
        
        // 移除弹窗和菜单
        const moreMenu = document.getElementById(`${this.containerId}-more-menu`);
        if (moreMenu) moreMenu.remove();
        
        const customDialog = document.getElementById(`${this.containerId}-custom-dialog`);
        if (customDialog) customDialog.remove();
    }
}

// 导出组件
if (typeof window !== 'undefined') {
    window.ModuleToolbarComponent = ModuleToolbarComponent;
}