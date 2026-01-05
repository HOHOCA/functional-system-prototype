// 组件展示页面主逻辑 - 树状结构版本
class ComponentGallery {
    constructor() {
        this.componentsConfig = COMPONENTS_CONFIG;
        this.projects = PROJECTS;
        this.currentComponent = null;
        this.searchKeyword = '';
        this.componentInstances = new Map();
        this.scriptPromises = new Map(); // 缓存脚本加载，避免重复加载
        // 默认展开所有项目分类
        this.expandedProjects = new Set(Object.keys(this.componentsConfig));
        this.init();
    }
    
    init() {
        this.renderComponentTree();
        this.bindEvents();
        
        // 默认选择第一个组件
        const firstProject = Object.keys(this.componentsConfig)[0];
        if (firstProject && this.componentsConfig[firstProject].length > 0) {
            this.selectComponent(this.componentsConfig[firstProject][0].id, firstProject);
        }
    }
    
    // 渲染组件树
    renderComponentTree() {
        const treeContainer = document.getElementById('componentTree');
        if (!treeContainer) return;
        
        let html = '';
        
        Object.keys(this.componentsConfig).forEach(projectKey => {
            const project = this.projects[projectKey];
            const components = this.getFilteredComponents(projectKey);
            
            if (components.length === 0 && this.searchKeyword) {
                return; // 搜索时跳过空项目
            }
            
            const isExpanded = this.expandedProjects.has(projectKey);
            html += `
                <div class="tree-project ${isExpanded ? 'expanded' : ''}" data-project="${projectKey}">
                    <div class="tree-project-header">
                        <i class="fas fa-chevron-right tree-project-icon"></i>
                        <div class="tree-project-label">
                            <i class="${project.icon}" style="color: ${project.color}"></i>
                            <span>${project.name}</span>
                        </div>
                        <span class="tree-project-count">${components.length}</span>
                    </div>
                    <div class="tree-component-list">
                        ${components.map(component => `
                            <div class="tree-component-item" data-component-id="${component.id}" data-project="${projectKey}">
                                <i class="fas fa-cube tree-component-item-icon"></i>
                                <div>
                                    <div class="tree-component-item-name">${component.displayName}</div>
                                    ${component.description ? `<div class="tree-component-item-desc">${component.description}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        if (!html && this.searchKeyword) {
            html = `
                <div style="padding: 20px; text-align: center; color: #6b7280;">
                    <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 8px; opacity: 0.5;"></i>
                    <p>没有找到匹配的组件</p>
                </div>
            `;
        }
        
        treeContainer.innerHTML = html;
    }
    
    // 获取过滤后的组件列表
    getFilteredComponents(projectKey) {
        let components = this.componentsConfig[projectKey] || [];
        
        // 按搜索关键词过滤
        if (this.searchKeyword) {
            const keyword = this.searchKeyword.toLowerCase();
            components = components.filter(c => 
                c.displayName.toLowerCase().includes(keyword) ||
                c.name.toLowerCase().includes(keyword) ||
                (c.description && c.description.toLowerCase().includes(keyword))
            );
        }
        
        return components;
    }
    
    // 切换项目展开/折叠
    toggleProject(projectKey) {
        if (this.expandedProjects.has(projectKey)) {
            this.expandedProjects.delete(projectKey);
        } else {
            this.expandedProjects.add(projectKey);
        }
        this.renderComponentTree();
    }
    
    // 选择组件
    selectComponent(componentId, projectKey) {
        // 查找组件
        let component = null;
        let foundProject = projectKey;
        
        if (projectKey) {
            component = this.componentsConfig[projectKey]?.find(c => c.id === componentId);
        } else {
            // 如果没有指定项目，遍历所有项目查找
            for (const key of Object.keys(this.componentsConfig)) {
                component = this.componentsConfig[key].find(c => c.id === componentId);
                if (component) {
                    foundProject = key;
                    break;
                }
            }
        }
        
        if (!component) return;
        
        this.currentComponent = component;
        this.currentProject = foundProject;
        
        // 确保所属项目是展开的
        if (!this.expandedProjects.has(foundProject)) {
            this.expandedProjects.add(foundProject);
            this.renderComponentTree();
        }
        
        // 更新选中状态
        document.querySelectorAll('.tree-component-item').forEach(item => {
            item.classList.toggle('active', 
                item.dataset.componentId === componentId && 
                item.dataset.project === foundProject
            );
        });
        
        // 渲染组件详情
        this.renderComponentDetail(component, foundProject);
    }
    
    // 渲染组件详情
    renderComponentDetail(component, projectKey) {
        const detailContainer = document.getElementById('componentDetail');
        if (!detailContainer) return;
        
        const project = this.projects[projectKey];
        detailContainer.innerHTML = `
            <div class="detail-content">
                <!-- 头部信息 -->
                <div class="detail-header">
                    <h1 class="detail-title">${component.displayName}</h1>
                    <p class="detail-subtitle">${component.description || ''}</p><div class="detail-meta">
                        <div class="detail-meta-item">
                            <i class="${project.icon}" style="color: ${project.color}"></i>
                            <span>项目：</span>
                            <strong>${project.name}</strong>
                        </div>
                        <div class="detail-meta-item">
                            <i class="fas fa-code"></i>
                            <span>类名：</span>
                            <strong>${component.className}</strong>
                        </div>
                        ${component.dependencies ? `
                        <div class="detail-meta-item">
                            <i class="fas fa-puzzle-piece"></i>
                            <span>依赖：</span>
                            <strong>${component.dependencies.join(', ')}</strong>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- 组件预览 -->
                <div class="detail-preview">
                    <div class="detail-preview-header">
                        <h2 class="detail-preview-title">实时预览</h2>
                        <div class="detail-preview-actions">
                            <button class="preview-action-btn" onclick="gallery.refreshPreview()">
                                <i class="fas fa-sync-alt"></i>
                                <span>刷新</span>
                            </button>
                            <button class="preview-action-btn" onclick="gallery.toggleFullscreen()">
                                <i class="fas fa-expand"></i>
                                <span>全屏</span>
                            </button>
                        </div>
                    </div><div class="detail-preview-container" id="componentPreview">
                        <!-- 组件实例将在这里渲染 -->
                    </div>
                </div>
                
                <!-- 组件信息 -->
                <div class="detail-info">
                    <div class="info-section">
                        <h3 class="info-section-title">
                            <i class="fas fa-info-circle"></i>
                            组件信息
                        </h3>
                        <div class="info-section-content">
                            <ul class="info-list">
                                <li>文件路径：${component.filePath}</li>
                                <li>类名：${component.className}</li>
                                <li>所属项目：${project.name}</li>
                                ${component.dependencies ? `<li>依赖：${component.dependencies.join(', ')}</li>` : ''}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 延迟加载组件实例
        setTimeout(() => this.loadComponentInstance(component), 100);
    }
    
    // 加载组件实例
    async loadComponentInstance(component) {
        const previewContainer = document.getElementById('componentPreview');
        if (!previewContainer) return;
        
        // 根据组件配置添加布局类
        if (component.layout === 'sidebar') {
            previewContainer.classList.add('sidebar-layout');
        } else {
            previewContainer.classList.remove('sidebar-layout');
        }
        
        // 清理之前的实例
        if (this.componentInstances.has(component.id)) {
            const oldInstance = this.componentInstances.get(component.id);
            if (oldInstance && typeof oldInstance.destroy === 'function') {
                oldInstance.destroy();
            }
            this.componentInstances.delete(component.id);
        }
        
        // 清空容器
        previewContainer.innerHTML = '';
        
        // 创建组件容器
        const componentContainer = document.createElement('div');
        componentContainer.id = `preview-${component.id}`;
        componentContainer.style.width = '100%';
        componentContainer.style.height = '100%';
        componentContainer.style.minHeight = '400px';
        previewContainer.appendChild(componentContainer);

        // 如果有独立文件路径，先按需加载（若全局已存在则跳过）
        try {
            if (component.filePath && typeof window[component.className] === 'undefined') {
                await this.loadScriptIfNeeded(component.filePath);
            }
        } catch (error) {
            console.error('加载组件脚本失败:', error);
            componentContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ef4444;">
                    <div style="text-align: center;">
                        <i class="fas fa-times-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
                        <p>组件脚本加载失败</p>
                        <p style="font-size: 12px; margin-top: 8px;">${error.message}</p>
                    </div>
                </div>
            `;
            return;
        }
        
        try {
            let instance = null;
            
            switch (component.className) {
                case 'BrachyView3DComponent':
                    if (typeof BrachyView3DComponent !== 'undefined') {
                        instance = new BrachyView3DComponent(componentContainer.id, {
                            enableToolbar: true,
                            enableRightClick: true
                        });
                    }
                    break;
                case 'CrossSectionView2DComponent':
                    if (typeof CrossSectionView2DComponent !== 'undefined') {
                        instance = new CrossSectionView2DComponent(componentContainer.id, {
                            enableToolbar: true,
                            enableLayerControl: true,
                            showDoseLegend: true,
                            contoursVisible: true  // 组件库预览：显示轮廓
                        });
                        
                        // 添加示例轮廓数据用于演示
                        setTimeout(() => {
                            if (!instance || !instance.imageData) {
                                setTimeout(arguments.callee, 100);
                                return;
                            }
                            
                            const imageWidth = instance.imageData.width;
                            const imageHeight = instance.imageData.height;
                            const centerX = imageWidth / 2;
                            const centerY = imageHeight / 2;
                            const radius = Math.min(imageWidth, imageHeight) * 0.15;
                            
                            // 添加轮廓1（黄色）
                            const contour1Points = [];
                            for (let i = 0; i < 8; i++) {
                                const angle = (i / 8) * Math.PI * 2;
                                contour1Points.push({
                                    x: centerX + radius * Math.cos(angle),
                                    y: centerY + radius * Math.sin(angle)
                                });
                            }
                            instance.addContour('demo-roi-1', contour1Points, '#FFFF00');
                            
                            // 添加轮廓2（绿色）
                            const contour2Points = [];
                            for (let i = 0; i < 8; i++) {
                                const angle = (i / 8) * Math.PI * 2;
                                contour2Points.push({
                                    x: centerX + radius * 1.5 * Math.cos(angle),
                                    y: centerY + radius * 1.5 * Math.sin(angle)
                                });
                            }
                            instance.addContour('demo-roi-2', contour2Points, '#00FF00');
                        }, 300);
                    }
                    break;

                case 'View3DComponent':
                    if (typeof View3DComponent !== 'undefined') {
                        instance = new View3DComponent(componentContainer.id, {
                            enableToolbar: true,
                            enableRightClick: true
                        });
                    }
                    break;
                    
                case 'CoronalView2DComponent':
                    if (typeof CoronalView2DComponent !== 'undefined') {
                        instance = new CoronalView2DComponent(componentContainer.id, {
                            enableToolbar: true,
                            enableLayerControl: true,
                            showDoseLegend: true,
                            contoursVisible: true  // 组件库预览：显示轮廓
                        });
                        
                        // 添加示例轮廓数据用于演示
                        setTimeout(() => {
                            if (!instance || !instance.imageData) {
                                setTimeout(arguments.callee, 100);
                                return;
                            }
                            
                            const imageWidth = instance.imageData.width;
                            const imageHeight = instance.imageData.height;
                            const centerX = imageWidth / 2;
                            const centerY = imageHeight / 2;
                            const radius = Math.min(imageWidth, imageHeight) * 0.15;
                            
                            // 添加轮廓1（黄色）
                            const contour1Points = [];
                            for (let i = 0; i < 8; i++) {
                                const angle = (i / 8) * Math.PI * 2;
                                contour1Points.push({
                                    x: centerX + radius * Math.cos(angle),
                                    y: centerY + radius * Math.sin(angle)
                                });
                            }
                            instance.addContour('demo-roi-1', contour1Points, '#FFFF00');
                            
                            // 添加轮廓2（绿色）
                            const contour2Points = [];
                            for (let i = 0; i < 8; i++) {
                                const angle = (i / 8) * Math.PI * 2;
                                contour2Points.push({
                                    x: centerX + radius * 1.5 * Math.cos(angle),
                                    y: centerY + radius * 1.5 * Math.sin(angle)
                                });
                            }
                            instance.addContour('demo-roi-2', contour2Points, '#00FF00');
                        }, 300);
                    }
                    break;
                    
                case 'SagittalView2DComponent':
                    if (typeof SagittalView2DComponent !== 'undefined') {
                        instance = new SagittalView2DComponent(componentContainer.id, {
                            enableToolbar: true,
                            enableLayerControl: true,
                            showDoseLegend: true,
                            contoursVisible: true  // 组件库预览：显示轮廓
                        });
                        
                        // 添加示例轮廓数据用于演示
                        setTimeout(() => {
                            if (!instance || !instance.imageData) {
                                setTimeout(arguments.callee, 100);
                                return;
                            }
                            
                            const imageWidth = instance.imageData.width;
                            const imageHeight = instance.imageData.height;
                            const centerX = imageWidth / 2;
                            const centerY = imageHeight / 2;
                            const radius = Math.min(imageWidth, imageHeight) * 0.15;
                            
                            // 添加轮廓1（黄色）
                            const contour1Points = [];
                            for (let i = 0; i < 8; i++) {
                                const angle = (i / 8) * Math.PI * 2;
                                contour1Points.push({
                                    x: centerX + radius * Math.cos(angle),
                                    y: centerY + radius * Math.sin(angle)
                                });
                            }
                            instance.addContour('demo-roi-1', contour1Points, '#FFFF00');
                            
                            // 添加轮廓2（绿色）
                            const contour2Points = [];
                            for (let i = 0; i < 8; i++) {
                                const angle = (i / 8) * Math.PI * 2;
                                contour2Points.push({
                                    x: centerX + radius * 1.5 * Math.cos(angle),
                                    y: centerY + radius * 1.5 * Math.sin(angle)
                                });
                            }
                            instance.addContour('demo-roi-2', contour2Points, '#00FF00');
                        }, 300);
                    }
                    break;
                    
                case 'DVHComponent':
                    if (typeof DVHComponent !== 'undefined') {
                        instance = new DVHComponent(componentContainer, {
                            enableToolbar: true,
                            enableContextMenu: true
                        });
                    }
                    break;
                    
                case 'View3DComponent':
                    if (typeof View3DComponent !== 'undefined') {
                        instance = new View3DComponent(componentContainer, {
                            enableToolbar: true,
                            showBeams: true,
                            showROIs: true
                        });
                    }
                    break;
                    
                case 'PatientInfoComponent':
                    if (typeof PatientInfoComponent !== 'undefined') {
                        instance = new PatientInfoComponent(componentContainer);instance.render();
                    }
                    break;
                    
                case 'ROIComponent':
                    if (typeof ROIComponent !== 'undefined') {
                        instance = new ROIComponent(componentContainer.id, {
                            prefix: 'preview-'
                        });
                    }
                    break;
                    
                case 'POIComponent':
                    if (typeof POIComponent !== 'undefined') {
                        instance = new POIComponent(componentContainer.id, {
                            prefix: 'preview-'
                        });
                    }
                    break;
                    
                case 'DoseStatisticsComponent':
                    if (typeof DoseStatisticsComponent !== 'undefined') {
                        instance = new DoseStatisticsComponent(componentContainer.id, {
                            showDoseType: true
                        });
                    }
                    break;
                    
                case 'PatientManagementComponent':
                    if (typeof PatientManagementComponent !== 'undefined') {
                        instance = new PatientManagementComponent(componentContainer);
                        instance.render();
                    }
                    break;
                    
                case 'BeamEyeViewComponent':
                    if (typeof BeamEyeViewComponent !== 'undefined') {
                        instance = new BeamEyeViewComponent(componentContainer, {
                            onBeamSelect: (beamId) => console.log('Selected beam:', beamId)
                        });
                    }
                    break;
                    
                case 'ModuleToolbarComponent':
                    if (typeof ModuleToolbarComponent !== 'undefined') {
                        const sampleTools = [
                            { id: 'image-fusion', icon: 'fas fa-layer-group', label: '图像融合', category: '常规' },
                            { id: 'move', icon: 'fas fa-arrows-alt', label: '移动', category: '常规' },
                            { id: 'rotate', icon: 'fas fa-redo', label: '旋转', category: '常规' },
                            { id: 'center-align', icon: 'fas fa-crosshairs', label: '中心对齐', category: '常规' },
                            { id: 'auto-align', icon: 'fas fa-magic', label: '自动对齐', category: '常规' },
                            { id: 'roi-poi-reg', icon: 'fas fa-cube', label: 'ROI/POI配准', category: '常规' },
                            { id: 'grayscale-reg', icon: 'fas fa-adjust', label: '灰度配准', category: '常规' },
                            { id: 'boundary-reg', icon: 'fas fa-vector-square', label: '边框配准', category: '常规' },
                            { id: 'deform-reg', icon: 'fas fa-wave-square', label: '形变配准', category: '常规' },
                            { id: 'roi-deform-reg', icon: 'fas fa-project-diagram', label: 'ROI形变配准', category: '常规' },
                            { id: 'deform-review', icon: 'fas fa-user-check', label: '形变审查', category: '审核' },
                            { id: 'dir-visual', icon: 'fas fa-network-wired', label: 'DIR可视化', category: '审核' },
                            { id: 'reset-reg', icon: 'fas fa-sync-alt', label: '重置配准', category: '常规' },
                            { id: 'save-reg', icon: 'fas fa-save', label: '保存配准', category: '常规' }
                        ];
                        instance = new ModuleToolbarComponent(componentContainer, {
                            tools: sampleTools,
                            categories: ['常规', 'QA', '审核'],
                            moduleId: 'component-gallery-demo',
                            onToolClick: (toolId) => console.log('Tool clicked:', toolId)
                        });
                    }
                    break;
                    
                case 'SequenceTreeComponent':
                    if (typeof SequenceTreeComponent !== 'undefined') {
                        instance = new SequenceTreeComponent(componentContainer.id, {
                            showFileInfo: false, // 组件库预览不展示文件信息面板
                            onSequenceSelect: (name) => console.log('Sequence selected:', name),
                            onFileSelect: (file) => console.log('File selected:', file),
                            onContextMenuAction: (action, file) => console.log('Context action:', action, file)
                        });
                    }
                    break;
                    
                case 'RegistrationComponent':
                    if (typeof RegistrationComponent !== 'undefined') {
                        instance = new RegistrationComponent(componentContainer.id, {
                            prefix: 'preview-',
                            onRegistrationSelect: (registrationId, element) => console.log('Registration selected:', registrationId),
                            showFileInfo: false
                        });
                    }
                    break;
                    
                case 'DOSEComponent':
                    if (typeof DOSEComponent !== 'undefined') {
                        instance = new DOSEComponent(componentContainer.id, {
                            prefix: 'preview-'
                        });
                    }
                    break;
                    
                case 'PatientOverviewComponent':
                    if (typeof PatientOverviewComponent !== 'undefined') {
                        instance = new PatientOverviewComponent(componentContainer.id, {
                            patient: {
                                name: 'Dong, Wuping',
                                id: '0000576304',
                                birthDate: '19730307',
                                gender: 'M'
                            }
                        });
                    }
                    break;
                    
                case 'ViewingFrameComponent':
                    if (typeof ViewingFrameComponent !== 'undefined') {
                        instance = new ViewingFrameComponent(componentContainer.id, {
                            enableToolbar: true,
                            showTools: true
                        });
                    }
                    break;
                    
                case 'EnergyLayerViewComponent':
                    if (typeof EnergyLayerViewComponent !== 'undefined') {
                        instance = new EnergyLayerViewComponent(componentContainer, {
                            onBeamSelect: (beamId) => console.log('Beam selected:', beamId),
                            onLayerSelect: (layerId) => console.log('Layer selected:', layerId)
                        });
                    }
                    break;
                    
                case 'PlanComparisonDoseStatisticsComponent':
                    if (typeof PlanComparisonDoseStatisticsComponent !== 'undefined') {
                        instance = new PlanComparisonDoseStatisticsComponent(componentContainer.id, {
                            plan1Name: 'Plan 1',
                            plan2Name: 'Plan 2'
                        });
                    }
                    break;
                    
                case 'SpectralCTAnalysisComponent':
                    if (typeof SpectralCTAnalysisComponent !== 'undefined') {
                        instance = new SpectralCTAnalysisComponent({
                            container: componentContainer, // 传入容器，让组件直接渲染到预览区域
                            getCurrentGroup: () => ({ id: 'group-1', name: '当前影像组' }),
                            getEnergyChoices: () => [
                                { id: 'high-140', label: '140kVp' },
                                { id: 'low-80', label: '80kVp' }
                            ]
                        });
                        // SpectralCTAnalysisComponent 需要手动调用 open
                        if (instance && typeof instance.open === 'function') {
                            setTimeout(() => instance.open(), 100);
                        }
                    }
                    break;
                    
                case 'ExportPlanComponent':
                    if (typeof ExportPlanComponent !== 'undefined') {
                        instance = new ExportPlanComponent({
                            container: componentContainer, // 传入容器，让组件直接渲染到预览区域
                            prefix: 'preview-',
                            onExport: (data) => console.log('Export data:', data)
                        });
                        // ExportPlanComponent 需要手动调用 show
                        if (instance && typeof instance.show === 'function') {
                            setTimeout(() => instance.show(), 100);
                        }
                    }
                    break;
                    
                case 'ChannelListComponent':
                    if (typeof ChannelListComponent !== 'undefined') {
                        instance = new ChannelListComponent(componentContainer.id, {
                            prefix: 'preview-',
                            onChannelSelect: (channel) => console.log('Channel selected:', channel),
                            onChannelChange: (channel, field, value) => console.log('Channel changed:', channel, field, value),
                            onChannelDelete: (channel) => console.log('Channel deleted:', channel),
                            onChannelAdd: (channel) => console.log('Channel added:', channel),
                            onExport: (channels) => console.log('Channels exported:', channels),
                            onImport: (channels) => console.log('Channels imported:', channels)
                        });
                    }
                    break;
                    
                case 'ChannelListBII2Component':
                    if (typeof ChannelListBII2Component !== 'undefined') {
                        instance = new ChannelListBII2Component(componentContainer.id, {
                            prefix: 'preview-',
                            onChannelSelect: (channel) => console.log('Channel selected:', channel),
                            onChannelChange: (channel, field, value) => console.log('Channel changed:', channel, field, value),
                            onChannelDelete: (channel) => console.log('Channel deleted:', channel),
                            onChannelAdd: (channel) => console.log('Channel added:', channel),
                            onExport: (channels) => console.log('Channels exported:', channels),
                            onImport: (channels) => console.log('Channels imported:', channels)
                        });
                    }
                    break;
                    
                case 'DwellControlComponent':
                    if (typeof DwellControlComponent !== 'undefined') {
                        instance = new DwellControlComponent(componentContainer.id, {
                            prefix: 'preview-',
                            onDwellPointSelect: (point) => console.log('Dwell point selected:', point),
                            onDwellPointChange: (point, field, value) => console.log('Dwell point changed:', point, field, value),
                            onDwellPointLockToggle: (point, locked) => console.log('Dwell point lock toggled:', point, locked)
                        });
                    }
                    break;
                    
                case 'ModelReconstructionComponent':
                    if (typeof ModelReconstructionComponent !== 'undefined') {
                        instance = new ModelReconstructionComponent(componentContainer.id, {
                            prefix: 'preview-',
                            onReconstruct: (data) => console.log('Model reconstruction:', data)
                        });
                    }
                    break;
                    
                case 'ClinicalTargetComponent':
                    if (typeof ClinicalTargetComponent !== 'undefined') {
                        instance = new ClinicalTargetComponent(componentContainer.id, {
                            prefix: 'preview-',
                            onTargetSelect: (target) => console.log('Clinical target selected:', target),
                            onTargetAdd: () => console.log('Add clinical target'),
                            onTargetEdit: (target) => console.log('Edit clinical target:', target),
                            onTargetDelete: (target) => console.log('Delete clinical target:', target),
                            onTargetExport: (targets) => console.log('Export clinical targets:', targets),
                            onTargetImport: () => console.log('Import clinical targets')
                        });
                    }
                    break;
                    
                default:
                    componentContainer.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6b7280;">
                            <div style="text-align: center;">
                                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                                <p>该组件暂未加载或不支持预览</p>
                                <p style="font-size: 12px; margin-top: 8px;">组件类：${component.className}</p>
                            </div>
                        </div>
                    `;}
            
            if (instance) {
                this.componentInstances.set(component.id, instance);
            }
            
        } catch (error) {
            console.error('加载组件失败:', error);
            componentContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ef4444;">
                    <div style="text-align: center;">
                        <i class="fas fa-times-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
                        <p>组件加载失败</p>
                        <p style="font-size: 12px; margin-top: 8px;">${error.message}</p>
                    </div>
                </div>
            `;
        }
    }

    // 按需加载组件脚本（同一路径只加载一次）
    loadScriptIfNeeded(url) {
        if (this.scriptPromises.has(url)) {
            return this.scriptPromises.get(url);
        }

        if (!url) {
            const resolved = Promise.resolve();
            this.scriptPromises.set(url, resolved);
            return resolved;
        }

        // 规范化目标路径用于去重
        const targetPath = new URL(url, window.location.href).pathname;

        // 如果页面上已有该脚本，直接返回
        const existed = Array.from(document.scripts).some(s => {
            if (!s.src) return false;
            const existingPath = new URL(s.src, window.location.href).pathname;
            return existingPath === targetPath;
        });
        if (existed) {
            const resolved = Promise.resolve();
            this.scriptPromises.set(url, resolved);
            return resolved;
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`无法加载脚本: ${url}`));
            document.body.appendChild(script);
        });

        this.scriptPromises.set(url, promise);
        return promise;
    }
    
    // 刷新预览
    refreshPreview() {
        if (this.currentComponent) {
            this.loadComponentInstance(this.currentComponent);
        }
    }
    
    // 切换全屏
    toggleFullscreen() {
        const previewContainer = document.querySelector('.detail-preview-container');
        if (!previewContainer) return;
        
        if (!document.fullscreenElement) {
            previewContainer.requestFullscreen().catch(err => {
                console.error('无法进入全屏:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    // 绑定事件
    bindEvents() {
        // 搜索
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchKeyword = e.target.value.trim();
                // 搜索时展开所有项目
                if (this.searchKeyword) {
                    Object.keys(this.projects).forEach(key => {
                        this.expandedProjects.add(key);
                    });
                }
                this.renderComponentTree();
            });
        }
        
        // 树节点点击事件（使用事件委托）
        const treeContainer = document.getElementById('componentTree');
        if (treeContainer) {
            treeContainer.addEventListener('click', (e) => {
                // 项目头部点击
                const projectHeader = e.target.closest('.tree-project-header');
                if (projectHeader) {
                    const project = projectHeader.closest('.tree-project');
                    const projectKey = project.dataset.project;
                    this.toggleProject(projectKey);
                    return;
                }
                
                // 组件项点击
                const componentItem = e.target.closest('.tree-component-item');
                if (componentItem) {
                    const componentId = componentItem.dataset.componentId;
                    const projectKey = componentItem.dataset.project;
                    this.selectComponent(componentId, projectKey);
                    return;
                }
            });
        }
    }
}

// 初始化
let gallery;
document.addEventListener('DOMContentLoaded', () => {
    gallery = new ComponentGallery();
});