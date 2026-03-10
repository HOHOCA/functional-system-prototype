/**
 * BEV视图组件 - 射野方向观视图
 * 功能：
 * - 左上角饼图：展示所有射野，选定的射束突出显示
 * - 左下角信息：显示CT、Beam、Energy layer等信息
 * - 主视图：显示ROI、DRR、束斑等
 * - 右上角工具：缩放、平移、全屏
 */
class ProtonBeamEyeViewComponent {
    constructor(containerId, options = {}) {
        // 兼容传入 DOM 元素或字符串 id（组件库预览/业务页面都可能用）
        const resolvedContainer = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        const resolvedId = typeof containerId === 'string'
            ? containerId
            : (resolvedContainer && resolvedContainer.id ? resolvedContainer.id : `bev-${Date.now()}`);

        this.containerId = resolvedId;
        this.container = resolvedContainer;
        
        this.options = {
            onBeamSelect: options.onBeamSelect || (() => {}),
            onControlPointSelect: options.onControlPointSelect || (() => {}),
            getBeamList: options.getBeamList || (() => []),
            getEnergyLayers: options.getEnergyLayers || (() => []),
            getCurrentCT: options.getCurrentCT || (() => null),
            // 顶部工具栏（对齐质子/后装 3D 顶部栏风格）
            showToolbar: true,
            showHeader: true,
            toolbarTitle: 'BEV',
            toolbarContainerId: null, // 若提供，则工具栏渲染到外部容器
            ...options
        };

        // 数据存储
        this.drrImage = null;              // DRR图像
        this.roiContours = [];             // ROI轮廓数据
        this.roi3D = [];                   // ROI 3D数据
        this.beamSpots = [];               // 束斑数据（兼容旧代码）
        this.beamSpotsByLayer = {};        // 按能量层组织的束斑数据
        this.beamList = [];                // 射束列表
        this.energyLayers = [];            // 能量层列表

        // 渲染相关
        this.canvas = null;
        this.ctx = null;
        this.beamDiagramCanvas = null;     // 左上角饼图canvas
        this.beamDiagramCtx = null;

        // 显示参数
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.isFullscreen = false;

        // 当前选中的射束和控制点
        this.selectedBeamId = null;
        this.selectedControlPointIndex = 0;
        this.selectedEnergyLayerIndex = 0;
        this.currentCT = null;
        this.currentBeam = null;

        // 显示状态
        this.displaySettings = {
            show3DContour: true,          // 默认显示3D轮廓
            showContourProjection: false,  // 轮廓投影线
            showDRR: false,                // DRR（默认不显示）
            showCrosshair: true,           // 十字线（默认显示）
            showCrossSectionLine: true,    // 横断面位置线（默认显示）
            showBeamSpots: true,           // 束斑（默认显示）
            showBlock: true,               // Block（默认显示）
            showMLC: true                 // MLC适形轮廓（默认显示）
        };
        
        // 如果options中提供了displaySettings，则合并到默认设置中
        if (options.displaySettings) {
            Object.assign(this.displaySettings, options.displaySettings);
        }

        // 等中心点
        this.isocenter = { x: 0, y: 0 };
        this.isDraggingIso = false;

        // 交互状态
        this.isDragging = false;
        this.isZooming = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.currentMousePos = { x: 0, y: 0 };  // 当前鼠标位置（用于绘制光标）
        this.currentTool = 'pan';          // 当前工具：pan, zoom
        
        // MLC开口编辑状态
        this.mlcOpeningTool = null;        // 'magic-brush', 'shape', null
        this.magicBrushDiameter = 1.0;     // 魔术刷直径（cm）
        this.shapeType = 'square';         // 形状类型：'circle', 'square'
        this.mlcOpeningPath = null;        // MLC开口路径（用于编辑）
        this.isEditingMLCOpening = false;  // 是否正在编辑MLC开口
        this.mlcOpeningStartPos = null;    // 绘制开始位置
        this.mlcOpeningCurrentPath = [];   // 当前绘制的路径点

        // 横断面位置
        this.crossSectionPosition = 0.5;    // 0-1之间

        // 初始化
        if (this.container) {
            this.init();
        }
    }

    init() {
        this.render();
        // 延迟setupCanvas，确保DOM已渲染
        setTimeout(() => {
            this.setupCanvas();
            this.bindEvents();
            this.initSampleData();
            // 立即渲染饼图（不依赖renderAll）
            if (this.beamDiagramCtx && this.beamDiagramCanvas) {
                this.renderBeamDiagram();
            }
            // 再次延迟渲染，确保canvas已正确设置尺寸
            setTimeout(() => {
                this.renderAll();
            }, 50);
        }, 50);
    }

    render() {
        if (!this.container) return;

        const internalToolbar = (this.options.showToolbar && !this.options.toolbarContainerId)
            ? this.renderToolbar()
            : '';

        this.container.innerHTML = `
            <div class="bev-view-container">
                ${internalToolbar}
                <div class="bev-view-main">
                    <div class="bev-view-canvas-wrapper">
                        <!-- 左上角饼图（射束切换圆环） -->
                        <canvas id="${this.containerId}-beam-diagram" class="bev-view-beam-diagram"></canvas>
                        
                        <!-- 右上角工具按钮（与新质子一致） -->
                        <div class="bev-view-tools" style="${this.options.showToolbar ? 'display:none;' : ''}">
                            <button class="bev-view-tool-btn" data-tool="zoom" title="缩放"><i class="fas fa-search-plus"></i></button>
                            <button class="bev-view-tool-btn" data-tool="pan" title="平移"><i class="fas fa-arrows-alt"></i></button>
                            <button class="bev-view-tool-btn" data-tool="maximize" title="全屏"><i class="fas fa-expand"></i></button>
                        </div>
                        
                        <!-- 主视图canvas -->
                        <canvas id="${this.containerId}-canvas" class="bev-view-canvas"></canvas>
                        
                        <!-- 左下角信息显示 -->
                        <div class="bev-view-info-bottom-left">
                            <div class="bev-view-info-item">
                                <span class="bev-view-info-label">CT:</span>
                                <span class="bev-view-info-value" id="${this.containerId}-ct-info">CT 8</span>
                            </div>
                            <div class="bev-view-info-item">
                                <span class="bev-view-info-label">Beam:</span>
                                <span class="bev-view-info-value" id="${this.containerId}-beam-info">beam3</span>
                            </div>
                            <div class="bev-view-info-item">
                                <span class="bev-view-info-label">Energy layer:</span>
                                <span class="bev-view-info-value" id="${this.containerId}-energy-layer-info">7/13</span>
                                <span class="bev-view-info-value" id="${this.containerId}-energy-value" style="margin-left: 8px; color: #cccccc;">94.30MeV</span>
                            </div>
                        </div>
                        
                        <!-- 右键菜单 -->
                        <div class="bev-view-context-menu" id="${this.containerId}-context-menu" style="display: none;">
                            <div class="context-menu-item ${this.displaySettings.show3DContour ? 'checked' : ''}" data-action="toggle-3d-contour">
                                <span class="context-menu-checkbox ${this.displaySettings.show3DContour ? 'checked' : ''}"></span>
                                <span>显示3D轮廓</span>
                            </div>
                            <div class="context-menu-item ${this.displaySettings.showContourProjection ? 'checked' : ''}" data-action="toggle-contour-projection">
                                <span class="context-menu-checkbox ${this.displaySettings.showContourProjection ? 'checked' : ''}"></span>
                                <span>显示轮廓投影线</span>
                            </div>
                            <div class="context-menu-divider"></div>
                            <div class="context-menu-item ${this.displaySettings.showDRR ? 'checked' : ''}" data-action="toggle-drr">
                                <span class="context-menu-checkbox ${this.displaySettings.showDRR ? 'checked' : ''}"></span>
                                <span>显示DRR</span>
                            </div>
                            <div class="context-menu-divider"></div>
                            <div class="context-menu-item ${this.displaySettings.showCrosshair ? 'checked' : ''}" data-action="toggle-crosshair">
                                <span class="context-menu-checkbox ${this.displaySettings.showCrosshair ? 'checked' : ''}"></span>
                                <span>十字线</span>
                            </div>
                            <div class="context-menu-item ${this.displaySettings.showCrossSectionLine ? 'checked' : ''}" data-action="toggle-cross-section-line">
                                <span class="context-menu-checkbox ${this.displaySettings.showCrossSectionLine ? 'checked' : ''}"></span>
                                <span>横截面位置线</span>
                            </div>
                            <div class="context-menu-item ${this.displaySettings.showBeamSpots ? 'checked' : ''}" data-action="toggle-beam-spots">
                                <span class="context-menu-checkbox ${this.displaySettings.showBeamSpots ? 'checked' : ''}"></span>
                                <span>束斑</span>
                            </div>
                            <div class="context-menu-divider"></div>
                            <div class="context-menu-item ${this.displaySettings.showBlock ? 'checked' : ''}" data-action="toggle-block">
                                <span class="context-menu-checkbox ${this.displaySettings.showBlock ? 'checked' : ''}"></span>
                                <span>Block</span>
                            </div>
                            <div class="context-menu-item ${this.displaySettings.showMLC ? 'checked' : ''}" data-action="toggle-mlc">
                                <span class="context-menu-checkbox ${this.displaySettings.showMLC ? 'checked' : ''}"></span>
                                <span>MLC适形轮廓</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 如果指定外部工具栏容器，渲染到该容器
        if (this.options.showToolbar && this.options.toolbarContainerId) {
            this.mountToolbarExternally();
        }
    }

    renderToolbar() {
        if (!this.options.showToolbar) return '';

        const titleHtml = this.options.showHeader
            ? `<div class="toolbar-title">${this.options.toolbarTitle || 'BEV'}</div>`
            : '';

        return `
            <div class="cross-section-view2d-toolbar" data-bev-toolbar="${this.containerId}">
                ${titleHtml}
                <div class="toolbar-group toolbar-group-right">
                    <button class="toolbar-btn-svg" id="${this.containerId}-zoom" title="缩放" data-active="${this.currentTool === 'zoom'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-zoom-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle cx="10" cy="10" r="7" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" fill="none"/>
                            <line x1="15" y1="15" x2="21" y2="21" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                            <line x1="7" y1="10" x2="13" y2="10" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                            <line x1="10" y1="7" x2="10" y2="13" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-pan" title="平移" data-active="${this.currentTool === 'pan'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-pan-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M9 6 C9 4 10 3 11 3 C12 3 13 4 13 6 L13 11 L14.5 9.5 C15.5 8.5 17 8.5 17.5 9.5 C18 10.5 18 11.5 17 12.5 L13.5 17 C12.5 18.5 11 19 9 19 L6 19 C4.5 19 3 17.5 3 16 L3 12 C3 10.5 4 9.5 5 9.5 C6 9.5 7 10 7 11 L7 6 C7 4 8 3 9 3 C9 3 9 4 9 6 Z" stroke="url(#gradient-pan-${this.containerId})" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-maximize" title="全屏" data-active="${this.isFullscreen}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-maximize-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M3 3 L3 9 M3 3 L9 3" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 3 L21 9 M21 3 L15 3" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 21 L3 15 M3 21 L9 21" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 21 L21 15 M21 21 L15 21" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    mountToolbarExternally() {
        const external = document.getElementById(this.options.toolbarContainerId);
        if (!external) {
            console.warn('ProtonBeamEyeViewComponent: toolbarContainerId not found:', this.options.toolbarContainerId);
            return;
        }
        external.innerHTML = this.renderToolbarButtonsOnly();
    }

    renderToolbarButtonsOnly() {
        if (!this.options.showToolbar) return '';
        return `
            <div class="cross-section-view2d-toolbar" data-bev-toolbar="${this.containerId}" style="background: transparent; border: none; padding: 0; height: auto;">
                <div class="toolbar-group toolbar-group-right">
                    <button class="toolbar-btn-svg" id="${this.containerId}-zoom" title="缩放" data-active="${this.currentTool === 'zoom'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-zoom-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle cx="10" cy="10" r="7" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" fill="none"/>
                            <line x1="15" y1="15" x2="21" y2="21" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                            <line x1="7" y1="10" x2="13" y2="10" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                            <line x1="10" y1="7" x2="10" y2="13" stroke="url(#gradient-zoom-${this.containerId})" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-pan" title="平移" data-active="${this.currentTool === 'pan'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-pan-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M9 6 C9 4 10 3 11 3 C12 3 13 4 13 6 L13 11 L14.5 9.5 C15.5 8.5 17 8.5 17.5 9.5 C18 10.5 18 11.5 17 12.5 L13.5 17 C12.5 18.5 11 19 9 19 L6 19 C4.5 19 3 17.5 3 16 L3 12 C3 10.5 4 9.5 5 9.5 C6 9.5 7 10 7 11 L7 6 C7 4 8 3 9 3 C9 3 9 4 9 6 Z" stroke="url(#gradient-pan-${this.containerId})" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-maximize" title="全屏" data-active="${this.isFullscreen}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-maximize-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M3 3 L3 9 M3 3 L9 3" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 3 L21 9 M21 3 L15 3" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 21 L3 15 M3 21 L9 21" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 21 L21 15 M21 21 L15 21" stroke="url(#gradient-maximize-${this.containerId})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    setupCanvas() {
        // 主canvas
        this.canvas = document.getElementById(`${this.containerId}-canvas`);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        
        // 左上角饼图canvas
        this.beamDiagramCanvas = document.getElementById(`${this.containerId}-beam-diagram`);
        if (this.beamDiagramCanvas) {
            this.beamDiagramCtx = this.beamDiagramCanvas.getContext('2d');
        }
        
        // 设置画布尺寸
        this.resizeCanvas();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.renderAll();
        });
    }

    resizeCanvas() {
        if (!this.canvas || !this.container) return;

        const wrapper = this.canvas.parentElement;
        if (!wrapper) return;

        // 获取容器尺寸，如果容器不可见则使用offsetWidth/offsetHeight
        const rect = wrapper.getBoundingClientRect();
        let width = rect.width;
        let height = rect.height;
        
        // 如果容器不可见（宽度或高度为0），尝试使用offsetWidth/offsetHeight
        if (width === 0 || height === 0) {
            width = wrapper.offsetWidth || this.container.offsetWidth || 800;
            height = wrapper.offsetHeight || this.container.offsetHeight || 600;
        }
        
        // 确保有最小尺寸
        if (width === 0) width = 800;
        if (height === 0) height = 600;
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        // 设置左上角饼图canvas尺寸（固定大小）
        if (this.beamDiagramCanvas) {
            this.beamDiagramCanvas.width = 120;
            this.beamDiagramCanvas.height = 120;
            this.beamDiagramCanvas.style.width = '120px';
            this.beamDiagramCanvas.style.height = '120px';
            this.beamDiagramCanvas.style.position = 'absolute';
            this.beamDiagramCanvas.style.top = '10px';
            this.beamDiagramCanvas.style.left = '10px';
            this.beamDiagramCanvas.style.zIndex = '100';
            this.beamDiagramCanvas.style.backgroundColor = 'transparent';
            // 确保canvas可见
            this.beamDiagramCanvas.style.display = 'block';
        }
    }

    bindEvents() {
        if (!this.canvas) return;

        // 顶部栏工具按钮（优先）
        const zoomBtn = document.getElementById(`${this.containerId}-zoom`);
        const panBtn = document.getElementById(`${this.containerId}-pan`);
        const maximizeBtn = document.getElementById(`${this.containerId}-maximize`);

        if (zoomBtn) zoomBtn.addEventListener('click', () => this.setTool('zoom'));
        if (panBtn) panBtn.addEventListener('click', () => this.setTool('pan'));
        if (maximizeBtn) maximizeBtn.addEventListener('click', () => this.toggleFullscreen());

        // 兼容旧的右上角工具按钮（当 showToolbar=false 时仍可用）
        const toolBtns = this.container.querySelectorAll('.bev-view-tool-btn');
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                if (tool === 'maximize') return this.toggleFullscreen();
                if (tool === 'zoom' || tool === 'pan') return this.setTool(tool);
            });
        });

        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 如果正在编辑MLC开口，处理MLC编辑逻辑
            if (this.isEditingMLCOpening && this.mlcOpeningTool) {
                // 检查当前射束的mlc状态是否为static（魔术刷前置条件）
                if (this.mlcOpeningTool === 'magic-brush') {
                    if (!this.currentBeam || this.currentBeam.mlc !== 'static') {
                        console.warn('魔术刷只能在mlc状态为static时使用');
                        return;
                    }
                }
                
                // 检查是否在射野活动区域内（形状工具）
                if (this.mlcOpeningTool === 'shape') {
                    if (!this.isPointInFieldArea(x, y)) {
                        // 在射野活动区域外，不允许绘制
                        return;
                    }
                }
                
                // 开始编辑
                this.mlcOpeningStartPos = { x, y };
                this.mlcOpeningCurrentPath = [{ x, y }];
                this.isDragging = true;
                return;
            }

            // 检查是否点击等中心点
            const isoScreenX = this.canvas.width / 2 + this.panX + this.isocenter.x * this.zoom;
            const isoScreenY = this.canvas.height / 2 + this.panY + this.isocenter.y * this.zoom;
            const dist = Math.sqrt((x - isoScreenX) ** 2 + (y - isoScreenY) ** 2);
            
            if (dist < 10) {
                this.isDraggingIso = true;
                this.canvas.style.cursor = 'move';
            } else if (this.currentTool === 'pan') {
                this.isDragging = true;
                this.canvas.style.cursor = 'grabbing';
            } else if (this.currentTool === 'zoom') {
                this.isZooming = true;
            }

            this.lastMousePos = { x: e.clientX, y: e.clientY };
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 如果正在编辑MLC开口，处理MLC编辑逻辑
            if (this.isEditingMLCOpening && this.mlcOpeningTool) {
                if (this.isDragging && this.mlcOpeningStartPos) {
                    // 正在拖动，更新路径
                    if (this.mlcOpeningTool === 'magic-brush') {
                        // 魔术刷：添加路径点
                        this.mlcOpeningCurrentPath.push({ x, y });
                    } else if (this.mlcOpeningTool === 'shape') {
                        // 形状工具：更新预览
                        // 预览会在renderAll中绘制
                    }
                    this.renderAll();
                } else {
                    // 鼠标移动，更新光标状态
                    if (this.mlcOpeningTool === 'magic-brush') {
                        // 判断光标状态
                        let cursorState = 'circle';
                        if (this.isPointInMLCRange(x, y)) {
                            if (this.isPointInMLCOpening(x, y)) {
                                cursorState = '+';
                            } else {
                                cursorState = '-';
                            }
                        }
                        // 光标状态会在renderAll中绘制
                    } else if (this.mlcOpeningTool === 'shape') {
                        // 形状工具：检查是否在射野活动区域外
                        if (!this.isPointInFieldArea(x, y)) {
                            this.canvas.style.cursor = 'not-allowed';
                        } else {
                            this.canvas.style.cursor = 'crosshair';
                        }
                    }
                    this.renderAll();
                }
                return;
            }
            
            if (this.isDraggingIso) {
                const dx = e.clientX - this.lastMousePos.x;
                const dy = e.clientY - this.lastMousePos.y;
                this.isocenter.x += dx / this.zoom;
                this.isocenter.y += dy / this.zoom;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.renderAll();
            } else if (this.isDragging) {
                const dx = e.clientX - this.lastMousePos.x;
                const dy = e.clientY - this.lastMousePos.y;
                this.panX += dx;
                this.panY += dy;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.renderAll();
            } else if (this.isZooming) {
                const dy = e.clientY - this.lastMousePos.y;
                const delta = dy > 0 ? 0.95 : 1.05;
                this.zoom *= delta;
                if (this.zoom < 0.1) this.zoom = 0.1;
                if (this.zoom > 10) this.zoom = 10;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.renderAll();
            } else {
                // 更新当前鼠标位置（用于绘制光标）
                this.currentMousePos = { x, y };
                
                // 检查鼠标是否在等中心点附近
                const isoScreenX = this.canvas.width / 2 + this.panX + this.isocenter.x * this.zoom;
                const isoScreenY = this.canvas.height / 2 + this.panY + this.isocenter.y * this.zoom;
                const dist = Math.sqrt((x - isoScreenX) ** 2 + (y - isoScreenY) ** 2);
                
                if (dist < 10) {
                    this.canvas.style.cursor = 'move';
                } else {
                    this.canvas.style.cursor = this.currentTool === 'pan' ? 'grab' : 'default';
                }
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            // 如果正在编辑MLC开口，完成编辑
            if (this.isEditingMLCOpening && this.mlcOpeningTool && this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (this.mlcOpeningTool === 'magic-brush') {
                    // 魔术刷：完成路径，更新MLC开口
                    if (this.mlcOpeningCurrentPath.length > 0) {
                        // TODO: 根据路径更新MLC开口
                        console.log('魔术刷路径完成:', this.mlcOpeningCurrentPath);
                    }
                } else if (this.mlcOpeningTool === 'shape' && this.mlcOpeningStartPos) {
                    // 形状工具：完成绘制，创建开口
                    // TODO: 根据形状创建MLC开口
                    console.log('形状绘制完成:', {
                        type: this.shapeType,
                        start: this.mlcOpeningStartPos,
                        end: { x, y }
                    });
                }
                
                this.mlcOpeningStartPos = null;
                this.mlcOpeningCurrentPath = [];
            }
            
            this.isDragging = false;
            this.isDraggingIso = false;
            this.isZooming = false;
            this.canvas.style.cursor = this.isEditingMLCOpening ? 'crosshair' : 'default';
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.isDraggingIso = false;
            this.isZooming = false;
            this.canvas.style.cursor = 'default';
        });

        // 滚轮缩放
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom *= delta;
            if (this.zoom < 0.1) this.zoom = 0.1;
            if (this.zoom > 10) this.zoom = 10;
            this.renderAll();
        });

        // 右键菜单
        const contextMenu = document.getElementById(`${this.containerId}-context-menu`);
        if (contextMenu) {
            this.canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                contextMenu.style.display = 'block';
                contextMenu.style.left = e.clientX + 'px';
                contextMenu.style.top = e.clientY + 'px';
            });

            contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const action = item.dataset.action;
                    this.handleContextMenuAction(action);
                    contextMenu.style.display = 'none';
                });
            });

            document.addEventListener('click', (e) => {
                if (!contextMenu.contains(e.target) && e.target !== this.canvas) {
                    contextMenu.style.display = 'none';
                }
            });
        }

        // 左上角饼图点击事件
        if (this.beamDiagramCanvas) {
            this.beamDiagramCanvas.addEventListener('click', (e) => {
                const rect = this.beamDiagramCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = this.beamDiagramCanvas.width / 2;
                const centerY = this.beamDiagramCanvas.height / 2;
                const dx = x - centerX;
                const dy = y - centerY;
                const angle = Math.atan2(dy, dx);
                const beamIndex = this.getBeamIndexFromAngle(angle);
                if (beamIndex !== null && this.beamList[beamIndex]) {
                    this.selectBeam(this.beamList[beamIndex].id);
                }
            });
        }

        // 键盘事件 - 上下键切换能量层
        this.handleKeyDown = (e) => {
            // 只有当BEV视图可见时才响应键盘事件
            if (!this.container || this.container.offsetParent === null) {
                return;
            }

            const totalLayers = this.energyLayers.length || 13;

            if (e.key === 'ArrowUp') {
                // 上键：切换到上一层
                e.preventDefault();
                const newLayer = this.selectedEnergyLayerIndex - 1;
                if (newLayer >= 0) {
                    this.setEnergyLayer(newLayer);
                }
            } else if (e.key === 'ArrowDown') {
                // 下键：切换到下一层
                e.preventDefault();
                const newLayer = this.selectedEnergyLayerIndex + 1;
                if (newLayer < totalLayers) {
                    this.setEnergyLayer(newLayer);
                }
            }
        };

        // 添加键盘事件监听
        document.addEventListener('keydown', this.handleKeyDown);

        // 确保Canvas可以获得焦点（用于键盘事件）
        this.canvas.setAttribute('tabindex', '0');
        
        // 当鼠标进入Canvas时自动获得焦点
        this.canvas.addEventListener('mouseenter', () => {
            this.canvas.focus();
        });
    }

    setTool(tool) {
        if (tool !== 'zoom' && tool !== 'pan') return;
        this.currentTool = tool;
        this.canvas.style.cursor = tool === 'pan' ? 'grab' : 'zoom-in';

        const zoomBtn = document.getElementById(`${this.containerId}-zoom`);
        const panBtn = document.getElementById(`${this.containerId}-pan`);
        if (zoomBtn) zoomBtn.setAttribute('data-active', tool === 'zoom');
        if (panBtn) panBtn.setAttribute('data-active', tool === 'pan');

        // 同步旧按钮的 active 样式（若存在）
        const toolBtns = this.container.querySelectorAll('.bev-view-tool-btn');
        toolBtns.forEach(b => b.classList.remove('active'));
        const legacyBtn = this.container.querySelector(`.bev-view-tool-btn[data-tool="${tool}"]`);
        if (legacyBtn) legacyBtn.classList.add('active');
    }

    handleContextMenuAction(action) {
        switch(action) {
            case 'toggle-3d-contour':
                if (!this.displaySettings.show3DContour) {
                    this.displaySettings.show3DContour = true;
                    this.displaySettings.showContourProjection = false;
                }
                this.updateContextMenu();
                this.renderAll();
                break;
            case 'toggle-contour-projection':
                if (!this.displaySettings.showContourProjection) {
                    this.displaySettings.showContourProjection = true;
                    this.displaySettings.show3DContour = false;
                }
                this.updateContextMenu();
                this.renderAll();
                break;
            case 'toggle-drr':
                this.displaySettings.showDRR = !this.displaySettings.showDRR;
                this.updateContextMenu();
                this.renderAll();
                break;
            case 'toggle-crosshair':
                this.displaySettings.showCrosshair = !this.displaySettings.showCrosshair;
                this.updateContextMenu();
                this.renderAll();
                break;
            case 'toggle-cross-section-line':
                this.displaySettings.showCrossSectionLine = !this.displaySettings.showCrossSectionLine;
                this.updateContextMenu();
                this.renderAll();
                break;
            case 'toggle-beam-spots':
                this.displaySettings.showBeamSpots = !this.displaySettings.showBeamSpots;
                this.updateContextMenu();
                this.renderAll();
                break;
            case 'toggle-block':
                this.displaySettings.showBlock = !this.displaySettings.showBlock;
                this.updateContextMenu();
                this.renderAll();
                break;
            case 'toggle-mlc':
                this.displaySettings.showMLC = !this.displaySettings.showMLC;
                this.updateContextMenu();
                this.renderAll();
                break;
        }
    }

    updateContextMenu() {
        const menu = document.getElementById(`${this.containerId}-context-menu`);
        if (!menu) return;

        const items = menu.querySelectorAll('.context-menu-item');
        items.forEach(item => {
            const action = item.dataset.action;
            const checkbox = item.querySelector('.context-menu-checkbox');
            
            if (action === 'toggle-3d-contour') {
                item.classList.toggle('checked', this.displaySettings.show3DContour);
                if (checkbox) checkbox.classList.toggle('checked', this.displaySettings.show3DContour);
            } else if (action === 'toggle-contour-projection') {
                item.classList.toggle('checked', this.displaySettings.showContourProjection);
                if (checkbox) checkbox.classList.toggle('checked', this.displaySettings.showContourProjection);
            } else if (action === 'toggle-drr') {
                item.classList.toggle('checked', this.displaySettings.showDRR);
                if (checkbox) checkbox.classList.toggle('checked', this.displaySettings.showDRR);
            } else if (action === 'toggle-crosshair') {
                item.classList.toggle('checked', this.displaySettings.showCrosshair);
                if (checkbox) checkbox.classList.toggle('checked', this.displaySettings.showCrosshair);
            } else if (action === 'toggle-cross-section-line') {
                item.classList.toggle('checked', this.displaySettings.showCrossSectionLine);
                if (checkbox) checkbox.classList.toggle('checked', this.displaySettings.showCrossSectionLine);
            } else if (action === 'toggle-beam-spots') {
                item.classList.toggle('checked', this.displaySettings.showBeamSpots);
                if (checkbox) checkbox.classList.toggle('checked', this.displaySettings.showBeamSpots);
            } else if (action === 'toggle-block') {
                item.classList.toggle('checked', this.displaySettings.showBlock);
                if (checkbox) checkbox.classList.toggle('checked', this.displaySettings.showBlock);
            } else if (action === 'toggle-mlc') {
                item.classList.toggle('checked', this.displaySettings.showMLC);
                if (checkbox) checkbox.classList.toggle('checked', this.displaySettings.showMLC);
            }
        });
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        this.resizeCanvas();
        this.renderAll();
    }

    getBeamIndexFromAngle(angle) {
        if (this.beamList.length === 0) return null;
        
        // 将角度转换为0-2π范围
        const normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2));
        const angleStep = (2 * Math.PI) / this.beamList.length;
        
        // 计算点击的是哪个扇形区域
        const index = Math.floor((normalizedAngle + Math.PI / 2) / angleStep);
        return index < this.beamList.length ? index : null;
    }

    // ==================== 数据加载方法 ====================

    initSampleData() {
        // 初始化示例数据
        const beamsFromOptions = (typeof this.options.getBeamList === 'function')
            ? this.options.getBeamList()
            : null;
        this.beamList = (Array.isArray(beamsFromOptions) && beamsFromOptions.length > 0)
            ? beamsFromOptions
            : [
                { id: 1, name: 'Beam 1', angle: 0, color: '#FF0000', mlc: 'none' },
                { id: 2, name: 'Beam 2', angle: 120, color: '#00FF00', mlc: 'none' },
                { id: 3, name: 'Beam 3', angle: 240, color: '#0000FF', mlc: 'none' }
            ];

        // 更新下拉菜单
        if (this.beamList.length > 0) {
            this.selectedBeamId = this.beamList[0].id;
            this.currentBeam = this.beamList[0];
        }

        // 示例ROI轮廓（使用绿色，参考图片）
        this.roiContours = [
            {
                roiId: 'roi1',
                name: 'GTV',
                points: this.generateCirclePoints(0, 0, 100),
                color: '#00FF00' // 绿色轮廓
            }
        ];

        // 示例束斑 - 为每个能量层生成不同的束斑分布
        this.generateBeamSpotsForAllLayers();

        // 更新信息显示
        this.updateInfoDisplay();
    }

    generateCirclePoints(cx, cy, radius, segments = 64) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push({
                x: cx + radius * Math.cos(angle),
                y: cy + radius * Math.sin(angle)
            });
        }
        return points;
    }

    /**
     * 为所有能量层生成束斑数据
     * 每个能量层有不同的束斑数量、位置、大小
     */
    generateBeamSpotsForAllLayers() {
        const totalLayers = this.energyLayers.length || 13;
        this.beamSpotsByLayer = {};
        
        // 为每个能量层生成不同的束斑分布
        for (let layer = 0; layer < totalLayers; layer++) {
            this.beamSpotsByLayer[layer] = this.generateRealisticBeamSpotsForLayer(layer, totalLayers);
        }
        
        // 保持向后兼容：beamSpots指向第一层
        this.beamSpots = this.beamSpotsByLayer[0] || [];
    }

    /**
     * 为特定能量层生成真实的束斑分布模式
     * 每层的束斑数量、位置、大小都不同
     * @param {number} layerIndex - 能量层索引
     * @param {number} totalLayers - 总能量层数
     */
    generateRealisticBeamSpotsForLayer(layerIndex, totalLayers) {
        const spots = [];
        const centerX = 0;
        const centerY = 0;
        
        // 根据能量层调整参数，模拟不同能量层的束斑特性
        // 能量层越高，束斑越少但范围越大
        const layerRatio = layerIndex / Math.max(totalLayers - 1, 1);
        
        // 定义束斑分布的外轮廓（每层大小不同）
        const baseWidth = 120;
        const baseHeight = 140;
        const contourWidth = baseWidth * (0.7 + layerRatio * 0.6); // 70% - 130%
        const contourHeight = baseHeight * (0.7 + layerRatio * 0.6);
        
        // 束斑间距和大小随能量层变化
        const gridSpacing = 8 + layerIndex * 1.5; // 能量层越高，间距越大
        const spotRadius = 2.0 + layerIndex * 0.3; // 能量层越高，束斑越大
        
        // 使用层索引作为随机种子，确保每层的分布固定但不同
        const random = (seed) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };
        
        // 创建不规则轮廓形状（每层形状略有不同）
        const isInsideContour = (x, y, seed) => {
            const nx = x / (contourWidth / 2);
            const ny = y / (contourHeight / 2);
            const distFromCenter = Math.sqrt(nx * nx + ny * ny);
            
            // 根据y坐标调整半径（上宽下窄）
            let radiusAtY;
            const variation = random(seed) * 0.2 - 0.1; // -0.1 到 0.1
            
            if (ny < -0.3) {
                // 上部：较宽
                radiusAtY = 0.85 + 0.15 * Math.cos(nx * 3 + layerIndex) + variation;
            } else if (ny < 0.3) {
                // 中部：逐渐变窄
                radiusAtY = 0.85 - (ny + 0.3) * 0.5 + variation;
            } else {
                // 下部：较窄
                radiusAtY = 0.45 + 0.15 * Math.sin(nx * 4 + layerIndex) + variation;
            }
            
            return distFromCenter < radiusAtY;
        };
        
        // 在网格上生成束斑
        let spotIndex = 0;
        for (let y = -contourHeight / 2; y <= contourHeight / 2; y += gridSpacing) {
            for (let x = -contourWidth / 2; x <= contourWidth / 2; x += gridSpacing) {
                spotIndex++;
                
                // 使用确定性的"随机"扰动（基于层索引和位置）
                const seed1 = layerIndex * 1000 + spotIndex;
                const seed2 = layerIndex * 2000 + spotIndex;
                const jitterX = (random(seed1) - 0.5) * 3;
                const jitterY = (random(seed2) - 0.5) * 3;
                const spotX = x + jitterX;
                const spotY = y + jitterY;
                
                // 只保留轮廓内的束斑
                if (isInsideContour(spotX, spotY, seed1)) {
                    // 计算束斑大小（外围较小，内部较大）
                    const distFromCenter = Math.sqrt(spotX * spotX + spotY * spotY);
                    const maxDist = Math.sqrt(contourWidth * contourWidth + contourHeight * contourHeight) / 2;
                    const normalizedDist = distFromCenter / maxDist;
                    
                    // 外围的束斑较小，内部的束斑较大
                    let radius = spotRadius;
                    let weight = 1.0;
                    
                    if (normalizedDist > 0.7) {
                        // 外围：较小
                        radius = spotRadius * 0.6;
                        weight = 0.6;
                    } else if (normalizedDist > 0.4) {
                        // 中部：中等
                        radius = spotRadius * 0.8;
                        weight = 0.8;
                    } else {
                        // 中心：较大
                        radius = spotRadius * 1.2;
                        weight = 1.2;
                    }
                    
                    spots.push({
                        x: spotX,
                        y: spotY,
                        radius: radius,
                        weight: weight,
                        energyLayer: layerIndex
                    });
                }
            }
        }
        
        return spots;
    }

    selectBeam(beamId) {
        this.selectedBeamId = beamId;
        const beam = this.beamList.find(b => b.id === beamId);
        if (beam) {
            this.currentBeam = beam;
            this.updateInfoDisplay();
        }
        this.options.onBeamSelect(beamId);
        // 更新饼图显示
        this.renderBeamDiagram();
        this.renderAll();
    }

    setEnergyLayer(index) {
        this.selectedEnergyLayerIndex = index;
        const totalLayers = this.energyLayers.length || 13;
        this.updateInfoDisplay();
        this.renderAll();
    }

    setCurrentCT(ctInfo) {
        this.currentCT = ctInfo;
        this.updateInfoDisplay();
    }

    updateInfoDisplay() {
        // 更新CT信息
        const ctInfoEl = document.getElementById(`${this.containerId}-ct-info`);
        if (ctInfoEl) {
            ctInfoEl.textContent = this.currentCT || 'CT 8';
        }

        // 更新Beam信息
        const beamInfoEl = document.getElementById(`${this.containerId}-beam-info`);
        if (beamInfoEl) {
            beamInfoEl.textContent = this.currentBeam ? this.currentBeam.name : 'beam3';
        }

        // 更新Energy layer信息
        const energyLayerInfoEl = document.getElementById(`${this.containerId}-energy-layer-info`);
        if (energyLayerInfoEl) {
            const totalLayers = this.energyLayers.length || 13;
            energyLayerInfoEl.textContent = `${this.selectedEnergyLayerIndex + 1}/${totalLayers}`;
        }
        
        // 更新能量值信息
        const energyValueEl = document.getElementById(`${this.containerId}-energy-value`);
        if (energyValueEl) {
            // 从能量层数据中获取当前能量层的能量值
            let energyValue = '';
            if (this.energyLayers && this.energyLayers.length > 0) {
                const currentLayer = this.energyLayers[this.selectedEnergyLayerIndex];
                if (currentLayer) {
                    // 如果能量层对象有energy属性，使用它；否则使用energyValue或mev属性
                    energyValue = currentLayer.energy || currentLayer.energyValue || currentLayer.mev || '';
                    // 如果能量值是数字，格式化为两位小数并添加MeV单位
                    if (typeof energyValue === 'number') {
                        energyValue = energyValue.toFixed(2) + 'MeV';
                    } else if (energyValue && !energyValue.toString().toUpperCase().includes('MEV')) {
                        // 如果已经有值但没有单位，添加MeV
                        energyValue = energyValue + 'MeV';
                    }
                }
            }
            // 如果没有能量值，使用默认值或空字符串
            if (!energyValue) {
                energyValue = '94.30MeV'; // 默认值
            }
            energyValueEl.textContent = energyValue;
        }
    }

    setCrossSectionPosition(position) {
        this.crossSectionPosition = Math.max(0, Math.min(1, position));
        this.renderAll();
    }

    // ==================== 渲染方法 ====================

    renderAll() {
        if (!this.ctx || !this.canvas) return;

        // 清空画布
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 保存上下文状态
        this.ctx.save();

        // 应用变换（平移和缩放）
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.ctx.translate(centerX + this.panX, centerY + this.panY);
        this.ctx.scale(this.zoom, this.zoom);

        // 渲染DRR（底层）
        if (this.displaySettings.showDRR && this.drrImage) {
            this.renderDRR();
        }

        // 渲染ROI
        if (this.displaySettings.show3DContour) {
            this.render3DContours();
        } else if (this.displaySettings.showContourProjection) {
            this.renderContourProjections();
        }

        // 渲染横断面位置线
        if (this.displaySettings.showCrossSectionLine) {
            this.renderCrossSectionLine();
        }

        // 渲染Block（在束斑之前，这样束斑不会被遮挡）
        if (this.displaySettings.showBlock) {
            this.renderBlock();
        }

        // 渲染束斑（在block之后，确保束斑显示在block挖空区域上方）
        if (this.displaySettings.showBeamSpots) {
            this.renderBeamSpots();
        }

        // 渲染MLC适形轮廓（在束斑之后）
        if (this.displaySettings.showMLC) {
            this.renderMLC();
        }

        // 恢复上下文状态
        this.ctx.restore();

        // 渲染十字线（在变换之后，使用屏幕坐标）
        if (this.displaySettings.showCrosshair) {
            this.renderCrosshair();
        }

        // 渲染等中心点
        this.renderIsocenter();

        // 渲染左上角饼图
        this.renderBeamDiagram();
        
        // 渲染MLC开口编辑工具的光标和预览（在最后，使用屏幕坐标）
        if (this.isEditingMLCOpening && this.mlcOpeningTool) {
            this.renderMLCOpeningTool();
        }
    }
    
    /**
     * 渲染MLC开口编辑工具的光标和预览
     */
    renderMLCOpeningTool() {
        if (!this.canvas) return;
        
        // 使用当前鼠标位置
        const mouseX = this.currentMousePos.x;
        const mouseY = this.currentMousePos.y;
        
        if (this.mlcOpeningTool === 'magic-brush') {
            // 判断光标状态
            let cursorState = 'circle';
            if (this.isPointInMLCRange(mouseX, mouseY)) {
                if (this.isPointInMLCOpening(mouseX, mouseY)) {
                    cursorState = '+';
                } else {
                    cursorState = '-';
                }
            }
            
            // 绘制魔术刷光标
            this.renderMagicBrushCursor(mouseX, mouseY, cursorState);
            
            // 如果正在拖动，绘制路径预览
            if (this.isDragging && this.mlcOpeningCurrentPath.length > 0) {
                this.ctx.save();
                this.ctx.strokeStyle = '#00FFFF';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.mlcOpeningCurrentPath.forEach((point, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.stroke();
                this.ctx.restore();
            }
        } else if (this.mlcOpeningTool === 'shape') {
            // 如果正在拖动，绘制形状预览
            if (this.isDragging && this.mlcOpeningStartPos) {
                this.renderShapePreview(
                    this.mlcOpeningStartPos.x,
                    this.mlcOpeningStartPos.y,
                    mouseX,
                    mouseY
                );
            }
        }
    }

    renderDRR() {
        if (!this.drrImage) return;

        // 这里应该绘制DRR图像
        // 暂时用占位符
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(-200, -200, 400, 400);
    }

    render3DContours() {
        this.roiContours.forEach(roi => {
            this.ctx.strokeStyle = roi.color;
            this.ctx.fillStyle = roi.color + '40'; // 添加透明度
            this.ctx.lineWidth = 2;

            if (roi.points && roi.points.length > 0) {
                this.ctx.beginPath();
                roi.points.forEach((point, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }
        });
    }

    renderContourProjections() {
        this.roiContours.forEach(roi => {
            this.ctx.strokeStyle = roi.color;
            this.ctx.lineWidth = 2;

            if (roi.points && roi.points.length > 0) {
                this.ctx.beginPath();
                roi.points.forEach((point, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.closePath();
                this.ctx.stroke();
            }
        });
    }

    renderBeamSpots() {
        const currentLayer = this.selectedEnergyLayerIndex;
        
        // 获取当前能量层的束斑
        const currentLayerSpots = this.beamSpotsByLayer[currentLayer] || [];
        
        // 只渲染当前能量层的束斑
        currentLayerSpots.forEach(spot => {
            // 当前层的束斑：根据权重显示大小
            const radius = spot.radius * (1 + spot.weight * 0.3);
            
            // 使用绿色束斑（参考图片）
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(spot.x, spot.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 绘制边框（较细的绿色边框）
            this.ctx.strokeStyle = 'rgba(0, 255, 0, 1.0)';
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
        });
    }

    renderBlock() {
        // Block显示 - 蒙板样式，中间挖空
        // 根据当前射束和等中心点计算Block位置和大小
        
        if (!this.currentBeam) return;
        
        // 获取当前射束的mlc类型
        const mlcType = this.currentBeam.mlc || 'none';
        
        // 获取canvas尺寸（在变换坐标系中）
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // 等中心点在变换后的坐标原点
        const centerX = 0;
        const centerY = 0;
        
        // Block尺寸（可以根据实际配置调整）
        const blockWidth = 400;  // Block宽度（像素）
        const blockHeight = 400; // Block高度（像素）
        
        // 计算Block矩形位置（以等中心点为中心）
        const blockLeft = centerX - blockWidth / 2;
        const blockTop = centerY - blockHeight / 2;
        
        // 保存当前上下文状态
        this.ctx.save();
        
        // 设置蒙板颜色（深灰色半透明）
        const maskColor = 'rgba(60, 60, 60, 0.6)';
        
        // 创建蒙板：先绘制一个大的不规则形状覆盖整个可见区域
        // 然后使用destination-out模式挖空中间区域
        
        // 第一步：绘制外层的遮罩形状（不规则的大形状，类似患者轮廓）
        this.ctx.fillStyle = maskColor;
        this.ctx.beginPath();
        
        // 生成外层遮罩形状（覆盖大部分区域的不规则形状）
        const outerShape = this.generateOuterBlockShape(-canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight);
        this.ctx.moveTo(outerShape[0].x, outerShape[0].y);
        for (let i = 1; i < outerShape.length; i++) {
            this.ctx.lineTo(outerShape[i].x, outerShape[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        // 第二步：使用destination-out模式挖空中间区域（适形ROI）
        this.ctx.globalCompositeOperation = 'destination-out';
        
        // 获取ROI轮廓数据，用于生成挖空区域
        const roiContours = this.roiContours || [];
        
        // 优先使用ROI轮廓来生成挖空区域
        if (roiContours.length > 0) {
            // 使用第一个ROI的轮廓（通常是目标ROI）
            const targetROI = roiContours[0];
            if (targetROI && targetROI.points && targetROI.points.length > 0) {
                // 使用ROI轮廓点来挖空
                this.ctx.beginPath();
                const roiPoints = targetROI.points;
                if (roiPoints.length > 0) {
                    this.ctx.moveTo(roiPoints[0].x, roiPoints[0].y);
                    for (let i = 1; i < roiPoints.length; i++) {
                        this.ctx.lineTo(roiPoints[i].x, roiPoints[i].y);
                    }
                    this.ctx.closePath();
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    this.ctx.fill();
                }
            } else {
                // 如果没有ROI轮廓点，使用默认形状
                this.generateDefaultHoleShape(blockLeft, blockTop, blockWidth, blockHeight, mlcType);
            }
        } else {
            // 如果没有ROI数据，根据mlc类型生成默认挖空形状
            this.generateDefaultHoleShape(blockLeft, blockTop, blockWidth, blockHeight, mlcType);
        }
        
        // 恢复合成模式
        this.ctx.globalCompositeOperation = 'source-over';
        
        // 绘制block边界线（挖空区域的边界，使用ROI轮廓）
        if (mlcType !== 'none') {
            this.ctx.strokeStyle = '#888888';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            
            const roiContours = this.roiContours || [];
            if (roiContours.length > 0) {
                const targetROI = roiContours[0];
                if (targetROI && targetROI.points && targetROI.points.length > 0) {
                    // 绘制ROI轮廓边界
                    const roiPoints = targetROI.points;
                    this.ctx.beginPath();
                    if (roiPoints.length > 0) {
                        this.ctx.moveTo(roiPoints[0].x, roiPoints[0].y);
                        for (let i = 1; i < roiPoints.length; i++) {
                            this.ctx.lineTo(roiPoints[i].x, roiPoints[i].y);
                        }
                        this.ctx.closePath();
                        this.ctx.stroke();
                    }
                } else {
                    // 如果没有ROI轮廓，使用默认形状边界
                    this.drawDefaultHoleBoundary(blockLeft, blockTop, blockWidth, blockHeight, mlcType);
                }
            } else {
                // 如果没有ROI数据，使用默认形状边界
                this.drawDefaultHoleBoundary(blockLeft, blockTop, blockWidth, blockHeight, mlcType);
            }
            this.ctx.setLineDash([]);
        }
        
        // 恢复上下文状态
        this.ctx.restore();
    }
    
    generateOuterBlockShape(left, top, width, height) {
        // 生成外层遮罩形状（方形轮廓）
        // 返回方形的四个角点
        const canvasWidth = width;
        const canvasHeight = height;
        
        // 方形覆盖整个canvas区域
        return [
            { x: -canvasWidth / 2, y: -canvasHeight / 2 },  // 左上
            { x: canvasWidth / 2, y: -canvasHeight / 2 },   // 右上
            { x: canvasWidth / 2, y: canvasHeight / 2 },   // 右下
            { x: -canvasWidth / 2, y: canvasHeight / 2 }   // 左下
        ];
    }
    
    generateDefaultHoleShape(left, top, width, height, mlcType) {
        // 生成默认的挖空形状（当没有ROI数据时使用）
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const beamId = this.currentBeam ? this.currentBeam.id : 1;
        const shapeSeed = beamId;
        
        if (mlcType === 'none') {
            // none类型：显示一个简单的矩形挖空
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.fillRect(left, top, width, height);
        } else {
            // dynamic或static类型：生成不规则的挖空形状
            this.ctx.beginPath();
            const points = this.generateBlockShape(left, top, width, height, shapeSeed, mlcType);
            
            this.ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                this.ctx.lineTo(points[i].x, points[i].y);
            }
            this.ctx.closePath();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.fill();
        }
    }
    
    drawDefaultHoleBoundary(left, top, width, height, mlcType) {
        // 绘制默认挖空形状的边界
        const beamId = this.currentBeam ? this.currentBeam.id : 1;
        const shapeSeed = beamId;
        const points = this.generateBlockShape(left, top, width, height, shapeSeed, mlcType);
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    generateBlockShape(left, top, width, height, seed, mlcType) {
        // 生成不规则的mlc形状点集（用于默认形状）
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const points = [];
        const numPoints = 20; // 多边形点数
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            let radius;
            
            if (mlcType === 'dynamic') {
                // Dynamic模式：更复杂的形状变化
                const wave1 = Math.sin(angle * 2 + seed * 0.5) * 0.15;
                const wave2 = Math.cos(angle * 3 + seed * 0.3) * 0.1;
                radius = 0.4 + wave1 + wave2;
            } else if (mlcType === 'static') {
                // Static模式：相对固定的形状
                const pattern = Math.sin(angle * 2.5 + seed * 0.2) * 0.2;
                radius = 0.5 + pattern;
            } else {
                // 默认模式：椭圆形
                const a = width / 2;
                const b = height / 2;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                radius = Math.sqrt((a * cos) ** 2 + (b * sin) ** 2) / Math.max(a, b);
            }
            
            // 确保半径在合理范围内
            radius = Math.max(0.2, Math.min(0.8, radius));
            
            const x = centerX + Math.cos(angle) * (width / 2) * radius;
            const y = centerY + Math.sin(angle) * (height / 2) * radius;
            
            points.push({ x, y });
        }
        
        return points;
    }

    /**
     * 渲染MLC适形轮廓
     * 根据当前能量层显示不同的适形轮廓，基于ROI轮廓进行外扩
     * 参照参考图片：MLC开口形状应该适形于ROI形状
     */
    renderMLC() {
        if (!this.roiContours || this.roiContours.length === 0) {
            return;
        }

        // 获取当前能量层索引和总层数
        const currentLayer = this.selectedEnergyLayerIndex;
        const totalLayers = this.energyLayers.length || 13;
        
        // 计算当前能量层的外扩距离
        // 能量层越高，外扩越大（模拟不同能量层的适形需求）
        // 根据参考图片，外扩距离应该较小，使MLC开口更贴合ROI形状
        const layerRatio = totalLayers > 1 ? currentLayer / (totalLayers - 1) : 0;
        // 外扩距离范围：2-15像素（减小外扩距离，使MLC开口更贴合ROI）
        const expansionDistance = 2 + layerRatio * 13;
        
        // 保存上下文状态
        this.ctx.save();
        
        // 获取目标ROI（通常使用第一个ROI作为目标靶区）
        const targetROI = this.roiContours[0];
        if (!targetROI || !targetROI.points || targetROI.points.length === 0) {
            this.ctx.restore();
            return;
        }
        
        // 生成外扩后的MLC轮廓点（适形ROI形状）
        const mlcPoints = this.expandContour(targetROI.points, expansionDistance);
        
        // 绘制MLC适形轮廓（参照参考图片样式）
        // 使用更明显的颜色和线条，使其清晰可见
        this.ctx.strokeStyle = '#00FFFF'; // 青色轮廓线（与参考图片中的网格颜色形成对比）
        this.ctx.lineWidth = 2.5; // 稍微加粗线条
        this.ctx.setLineDash([]); // 实线
        
        // 绘制MLC开口轮廓
        this.ctx.beginPath();
        if (mlcPoints.length > 0) {
            // 使用平滑曲线连接点，使轮廓更自然
            this.ctx.moveTo(mlcPoints[0].x, mlcPoints[0].y);
            for (let i = 1; i < mlcPoints.length; i++) {
                // 使用二次贝塞尔曲线使轮廓更平滑
                if (i < mlcPoints.length - 1) {
                    const current = mlcPoints[i];
                    const next = mlcPoints[i + 1];
                    const cpX = (current.x + next.x) / 2;
                    const cpY = (current.y + next.y) / 2;
                    this.ctx.quadraticCurveTo(current.x, current.y, cpX, cpY);
                } else {
                    this.ctx.lineTo(mlcPoints[i].x, mlcPoints[i].y);
                }
            }
            this.ctx.closePath();
        }
        this.ctx.stroke();
        
        // 可选：绘制MLC开口的填充（半透明，用于显示开口区域）
        // 根据参考图片，MLC开口应该是透明的，所以不填充
        
        // 恢复上下文状态
        this.ctx.restore();
    }

    /**
     * 扩展轮廓点（外扩）
     * 优化算法，使MLC开口更精确地适形不规则ROI形状
     * @param {Array} points - 原始轮廓点数组
     * @param {number} distance - 外扩距离（像素）
     * @returns {Array} 扩展后的轮廓点数组
     */
    expandContour(points, distance) {
        if (!points || points.length < 3) {
            return points;
        }
        
        const expandedPoints = [];
        const numPoints = points.length;
        
        // 计算轮廓中心点（用于判断外法线方向）
        let centerX = 0;
        let centerY = 0;
        points.forEach(p => {
            centerX += p.x;
            centerY += p.y;
        });
        centerX /= points.length;
        centerY /= points.length;
        
        for (let i = 0; i < numPoints; i++) {
            const prevIndex = (i - 1 + numPoints) % numPoints;
            const nextIndex = (i + 1) % numPoints;
            
            const current = points[i];
            const prev = points[prevIndex];
            const next = points[nextIndex];
            
            // 计算前一个点到当前点的向量
            const v1 = {
                x: current.x - prev.x,
                y: current.y - prev.y
            };
            const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
            
            // 计算当前点到下一个点的向量
            const v2 = {
                x: next.x - current.x,
                y: next.y - current.y
            };
            const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
            
            // 计算切向量（两个方向向量的平均）
            let tangent = { x: 0, y: 0 };
            if (len1 > 0 && len2 > 0) {
                tangent = {
                    x: (v1.x / len1 + v2.x / len2) / 2,
                    y: (v1.y / len1 + v2.y / len2) / 2
                };
            } else if (len1 > 0) {
                tangent = { x: v1.x / len1, y: v1.y / len1 };
            } else if (len2 > 0) {
                tangent = { x: v2.x / len2, y: v2.y / len2 };
            }
            
            // 归一化切向量
            const tangentLen = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
            if (tangentLen > 0) {
                tangent.x /= tangentLen;
                tangent.y /= tangentLen;
            }
            
            // 计算外法线（垂直于切向量，逆时针旋转90度）
            let outwardNormal = {
                x: -tangent.y,
                y: tangent.x
            };
            
            // 确保外法线指向轮廓外部
            // 计算从当前点到中心的向量
            const toCenter = {
                x: centerX - current.x,
                y: centerY - current.y
            };
            const toCenterLen = Math.sqrt(toCenter.x * toCenter.x + toCenter.y * toCenter.y);
            
            if (toCenterLen > 0) {
                // 计算外法线与到中心向量的点积
                const dot = outwardNormal.x * toCenter.x + outwardNormal.y * toCenter.y;
                
                // 如果点积为正，说明外法线指向中心，需要反转
                if (dot > 0) {
                    outwardNormal = {
                        x: -outwardNormal.x,
                        y: -outwardNormal.y
                    };
                }
            }
            
            // 沿外法线方向外扩
            expandedPoints.push({
                x: current.x + outwardNormal.x * distance,
                y: current.y + outwardNormal.y * distance
            });
        }
        
        return expandedPoints;
    }

    renderCrossSectionLine() {
        // 横断面位置线（横线）
        const y = (this.crossSectionPosition - 0.5) * this.canvas.height / this.zoom;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(-this.canvas.width, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    renderCrosshair() {
        // 十字线（橙色，带刻度）
        const centerX = this.canvas.width / 2 + this.panX + this.isocenter.x * this.zoom;
        const centerY = this.canvas.height / 2 + this.panY + this.isocenter.y * this.zoom;

        this.ctx.strokeStyle = '#FFA500'; // 橙色
        this.ctx.lineWidth = 1;

        // 水平线
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        this.ctx.lineTo(this.canvas.width, centerY);
        this.ctx.stroke();

        // 垂直线
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, this.canvas.height);
        this.ctx.stroke();

        // 绘制刻度
        const tickLength = 5;
        const tickSpacing = 50;
        
        // 水平线刻度
        for (let x = centerX % tickSpacing; x < this.canvas.width; x += tickSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, centerY - tickLength);
            this.ctx.lineTo(x, centerY + tickLength);
            this.ctx.stroke();
        }

        // 垂直线刻度
        for (let y = centerY % tickSpacing; y < this.canvas.height; y += tickSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - tickLength, y);
            this.ctx.lineTo(centerX + tickLength, y);
            this.ctx.stroke();
        }

        // 绘制方位标记
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // H (Head) - 顶部
        this.ctx.fillText('H', centerX, 20);

        // R (Right) - 左侧
        this.ctx.fillText('R', 20, centerY);

        // L (Left) - 右侧
        this.ctx.fillText('L', this.canvas.width - 20, centerY);

        // 底部可以添加 F (Foot)，但根据图片只显示了 H, R, L
    }

    renderIsocenter() {
        const centerX = this.canvas.width / 2 + this.panX + this.isocenter.x * this.zoom;
        const centerY = this.canvas.height / 2 + this.panY + this.isocenter.y * this.zoom;

        // 等中心点：正常状态为黄色圆圈，可拖动状态下为红色圆圈
        const color = this.isDraggingIso ? '#FF0000' : '#FFFF00';
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // 绘制外圈
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    renderBeamDiagram() {
        if (!this.beamDiagramCtx || !this.beamDiagramCanvas) {
            console.warn('饼图canvas未初始化');
            return;
        }

        const ctx = this.beamDiagramCtx;
        const canvas = this.beamDiagramCanvas;
        
        // 确保canvas尺寸正确
        if (canvas.width === 0 || canvas.height === 0) {
            canvas.width = 120;
            canvas.height = 120;
        }
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const outerRadius = 50;  // 外圆半径
        const innerRadius = 30;  // 内圆半径（形成圆环）
        const beamCount = this.beamList.length;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (beamCount === 0) {
            // 如果没有射束，绘制一个占位圆环
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
            ctx.stroke();
            return;
        }

        // 计算每个射束的角度范围（360度平均分配）
        const angleStep = (2 * Math.PI) / beamCount;

        // 绘制射束圆环分段 - 确保分段数量与射束列表一致
        this.beamList.forEach((beam, index) => {
            const startAngle = index * angleStep - Math.PI / 2;
            const endAngle = (index + 1) * angleStep - Math.PI / 2;
            const isSelected = beam.id === this.selectedBeamId;
            
            // 绘制圆环分段（使用arc绘制）
            ctx.beginPath();
            // 外圆弧
            ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            // 内圆弧（反向）
            ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            ctx.closePath();
            
            // 填充颜色 - 参照图片样式，提高对比度使其更明显
            if (isSelected) {
                // 选中的射束：浅蓝色/淡紫色
                ctx.fillStyle = '#7CB9E8'; // 浅蓝色，类似图片中的浅蓝色
            } else {
                // 未选中的射束：深灰色/深蓝色（提高亮度使其可见）
                ctx.fillStyle = '#4A4A5A'; // 深蓝灰色，进一步提高亮度
            }
            ctx.fill();
            
            // 绘制分段边界（内外边缘）- 使用更明显的颜色
            ctx.strokeStyle = isSelected ? '#7CB9E8' : '#5A5A6A';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        // 绘制所有分段之间的分隔线（从内圆到外圆的径向线）
        // 为每个分段绘制分隔线，包括最后一个分段（形成完整的分隔）
        this.beamList.forEach((beam, index) => {
            const endAngle = (index + 1) * angleStep - Math.PI / 2;
            ctx.strokeStyle = '#888888'; // 使用更亮的灰色，确保可见
            ctx.lineWidth = 2; // 更粗的线条
            ctx.beginPath();
            const innerX = centerX + innerRadius * Math.cos(endAngle);
            const innerY = centerY + innerRadius * Math.sin(endAngle);
            const outerX = centerX + outerRadius * Math.cos(endAngle);
            const outerY = centerY + outerRadius * Math.sin(endAngle);
            ctx.moveTo(innerX, innerY);
            ctx.lineTo(outerX, outerY);
            ctx.stroke();
        });

        // 绘制外圈边界（统一的外边缘）- 使用更明显的颜色
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制内圈边界（统一的内边缘）- 使用更明显的颜色
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // ==================== 公共方法 ====================

    loadDRR(image) {
        this.drrImage = image;
        this.renderAll();
    }

    loadDRRFromURL(url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.loadDRR(img);
        };
        img.onerror = () => {
            console.error('DRR图像加载失败:', url);
        };
        img.src = url;
    }

    addROIContour(roiId, points, color = '#00FF00') {
        this.roiContours.push({ roiId, points, color });
        this.renderAll();
    }

    setBeamList(beams) {
        this.beamList = beams;
        
        // 如果当前选中的射束还在列表中，更新其数据
        if (this.selectedBeamId) {
            const updatedBeam = beams.find(b => b.id === this.selectedBeamId);
            if (updatedBeam) {
                this.currentBeam = updatedBeam;
            }
        }
        
        if (beams.length > 0 && !this.selectedBeamId) {
            this.selectedBeamId = beams[0].id;
            this.currentBeam = beams[0];
            this.updateInfoDisplay();
        }
        // 更新饼图
        this.renderBeamDiagram();
        this.renderAll();
    }

    setEnergyLayers(layers) {
        this.energyLayers = layers;
        // 确保索引在有效范围内
        if (this.selectedEnergyLayerIndex >= layers.length) {
            this.selectedEnergyLayerIndex = layers.length > 0 ? layers.length - 1 : 0;
        }
        // 重新生成所有能量层的束斑数据
        this.generateBeamSpotsForAllLayers();
        this.updateInfoDisplay();
        this.renderAll();
    }

    setBeamSpots(spots) {
        this.beamSpots = spots;
        this.renderAll();
    }

    // ==================== MLC开口编辑方法 ====================
    
    /**
     * 设置MLC开口编辑工具
     * @param {string} tool - 'magic-brush', 'shape', null
     */
    setMLCOpeningTool(tool) {
        this.mlcOpeningTool = tool;
        this.isEditingMLCOpening = tool !== null;
        
        // 更新光标样式
        if (tool === 'magic-brush' || tool === 'shape') {
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.canvas.style.cursor = 'default';
        }
        
        this.renderAll();
    }
    
    /**
     * 设置魔术刷直径
     * @param {number} diameter - 直径（cm）
     */
    setMagicBrushDiameter(diameter) {
        this.magicBrushDiameter = diameter;
        this.renderAll();
    }
    
    /**
     * 设置形状类型
     * @param {string} shapeType - 'circle' 或 'square'
     */
    setShapeType(shapeType) {
        this.shapeType = shapeType;
    }
    
    /**
     * 重置MLC开口
     */
    resetMLCOpening() {
        this.mlcOpeningPath = null;
        this.mlcOpeningCurrentPath = [];
        this.renderAll();
    }
    
    /**
     * 检查点是否在MLC开口内
     * @param {number} x - 画布坐标x
     * @param {number} y - 画布坐标y
     * @returns {boolean}
     */
    isPointInMLCOpening(x, y) {
        // TODO: 实现点是否在MLC开口内的判断
        // 这里需要根据实际的MLC开口路径来判断
        return false;
    }
    
    /**
     * 检查点是否在MLC范围内
     * @param {number} x - 画布坐标x
     * @param {number} y - 画布坐标y
     * @returns {boolean}
     */
    isPointInMLCRange(x, y) {
        // TODO: 实现点是否在MLC范围内的判断
        // 这里需要根据实际的MLC范围来判断
        return true;
    }
    
    /**
     * 检查点是否在射野活动区域内
     * @param {number} x - 画布坐标x
     * @param {number} y - 画布坐标y
     * @returns {boolean}
     */
    isPointInFieldArea(x, y) {
        // TODO: 实现点是否在射野活动区域内的判断
        // 这里需要根据实际的射野范围来判断
        return true;
    }
    
    /**
     * 绘制魔术刷光标
     * @param {number} x - 画布坐标x
     * @param {number} y - 画布坐标y
     * @param {string} state - '+', '-', 'circle'
     */
    renderMagicBrushCursor(x, y, state) {
        this.ctx.save();
        
        // 将直径从cm转换为像素（假设1cm = 10像素，可根据实际缩放调整）
        const radius = (this.magicBrushDiameter * 10) / this.zoom;
        
        // 绘制圆形虚线
        this.ctx.strokeStyle = '#00FFFF';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 根据状态绘制+或-号
        if (state === '+' || state === '-') {
            this.ctx.strokeStyle = '#00FFFF';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([]);
            this.ctx.beginPath();
            
            if (state === '+') {
                // 绘制+号
                this.ctx.moveTo(x - radius * 0.3, y);
                this.ctx.lineTo(x + radius * 0.3, y);
                this.ctx.moveTo(x, y - radius * 0.3);
                this.ctx.lineTo(x, y + radius * 0.3);
            } else {
                // 绘制-号
                this.ctx.moveTo(x - radius * 0.3, y);
                this.ctx.lineTo(x + radius * 0.3, y);
            }
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    /**
     * 绘制形状预览
     * @param {number} startX - 起始x坐标
     * @param {number} startY - 起始y坐标
     * @param {number} endX - 结束x坐标
     * @param {number} endY - 结束y坐标
     */
    renderShapePreview(startX, startY, endX, endY) {
        this.ctx.save();
        this.ctx.strokeStyle = '#00FFFF';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        
        if (this.shapeType === 'circle') {
            const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
            this.ctx.beginPath();
            this.ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            // 方形
            const width = endX - startX;
            const height = endY - startY;
            this.ctx.fillRect(startX, startY, width, height);
            this.ctx.strokeRect(startX, startY, width, height);
        }
        
        this.ctx.restore();
    }
    
    /**
     * 销毁组件，清理事件监听器
     */
    destroy() {
        // 移除键盘事件监听
        if (this.handleKeyDown) {
            document.removeEventListener('keydown', this.handleKeyDown);
        }

        // 清理其他引用
        this.canvas = null;
        this.ctx = null;
        this.beamDiagramCanvas = null;
        this.beamDiagramCtx = null;
        this.container = null;
    }
}

// 导出到全局
window.ProtonBeamEyeViewComponent = ProtonBeamEyeViewComponent;

