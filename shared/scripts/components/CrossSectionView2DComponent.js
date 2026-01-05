/**
 * 2D横截面视图组件 - 支持多层叠加显示的医学影像组件
 * 功能：
 * - 图像显示层（底层）
 * - 勾画层（ROI轮廓）
 * - 剂量层（剂量分布）
 * - 束斑层（束斑位置）
 * - 交互功能（缩放、平移、窗宽窗位）
 */
class CrossSectionView2DComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        
        this.options = {
            enableToolbar: options.enableToolbar !== false,
            enableLayerControl: options.enableLayerControl !== false,
            ...options
        };

        // 数据存储
        this.imageData = null;           // 原始图像数据（底层）
        this.contours = [];              // 勾画数据（ROI轮廓）
        this.doseData = null;            // 剂量数据
        this.beamSpots = [];             // 束斑数据

        // 渲染相关
        this.canvas = null;
        this.ctx = null;
        this.imageElement = null;        // 图像元素

        // 显示参数
        this.windowWidth = 400;          // 窗宽
        this.windowCenter = 40;          // 窗位
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;

        // 图层可见性
        this.layerVisibility = {
            image: true,
            contours: options.contoursVisible !== false, // 默认显示，可通过选项控制
            dose: true,
            beamSpots: true
        };

        // 勾画相关
        this.contourColors = new Map();   // ROI颜色映射
        this.contourVisibility = new Map(); // ROI可见性映射
        this.contourGroupVisibility = new Map(); // 勾画分组可见性（如靶区/图像处理）
        this.contourGroupLabels = {
            target: '靶区勾画',
            processing: '图像处理',
            other: '其它勾画',
            ...(options.contourGroupLabels || {})
        };
        const contourDefaults = options.contourVisibilityDefaults || { target: true, processing: false, other: true };
        Object.keys(contourDefaults).forEach(key => {
            if (!this.contourGroupLabels[key]) this.contourGroupLabels[key] = key;
        });
        Object.keys(this.contourGroupLabels).forEach(key => {
            this.contourGroupVisibility.set(key, contourDefaults[key] !== undefined ? contourDefaults[key] : true);
        });

        // 剂量相关
        this.doseColorMap = this.createDoseColorMap();
        this.doseOpacity = 0.6;          // 剂量透明度
        this.isodoseLines = [20, 50, 90, 95, 100, 105]; // 等值线百分比（按图片显示）
        
        // 视图信息
        this.currentSlice = 69;          // 当前层数
        this.totalSlices = 102;           // 总层数
        this.viewPlane = 'Axial';         // 视图平面：Axial, Coronal, Sagittal

        // 交互状态
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.isWheelZooming = false;
        this.currentTool = null; // 当前激活的工具：'zoom', 'pan', 'adjust', 'rotate', 'measure', null
        this.rotationAngle = 0; // 旋转角度
        this.showGrid = false; // 是否显示网格
        this.isMaximized = false; // 是否最大化
        this.measurePoints = []; // 测量点

        // 初始化
        if (this.container) {
            this.init();
        }
    }

    init() {
        this.render();
        this.setupCanvas();
        this.bindEvents();
        // 延迟创建默认图像，确保canvas已设置好尺寸和上下文
        setTimeout(() => {
            if (!this.imageData && this.ctx) {
                this.createDefaultImage();
            }
        }, 100);
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="cross-section-view2d-container">
                ${this.options.enableToolbar ? this.renderToolbar() : ''}
                <div class="cross-section-view2d-main">
                    <div class="cross-section-view2d-canvas-wrapper">
                        <canvas id="${this.containerId}-canvas" class="cross-section-view2d-canvas"></canvas>
                        <div class="cross-section-view2d-overlay">
                            <div class="cross-section-view2d-info-bottom-left">
                                <div class="cross-section-view2d-slice-info" id="${this.containerId}-slice-info">
                                    ${this.viewPlane} ${this.currentSlice}/${this.totalSlices}
                                </div>
                            </div>
                            ${this.options.showDoseLegend ? `
                            <div class="cross-section-view2d-dose-legend-overlay">
                                ${this.renderDoseLegend()}
                            </div>
                            ` : ''}
                        </div>
                        <div class="cross-section-view2d-context-menu" id="${this.containerId}-context-menu" style="display: none;">
                            <div class="context-menu-item" data-action="cut">即切</div>
                            <div class="context-menu-item" data-action="copy">复制</div>
                            <div class="context-menu-item" data-action="paste">粘贴</div>
                            <div class="context-menu-divider"></div>
                            <div class="context-menu-item" data-action="select">选中</div>
                            <div class="context-menu-item" data-action="drag">拖动</div>
                            <div class="context-menu-item" data-action="zoom">缩放</div>
                            <div class="context-menu-item" data-action="rotate">旋转</div>
                            <div class="context-menu-divider"></div>
                            <div class="context-menu-item" data-layer="image">
                                <span class="context-menu-checkbox ${this.layerVisibility.image ? 'checked' : ''}"></span>
                                <span>图像</span>
                            </div>
                            <div class="context-menu-item" data-layer="contours">
                                <span class="context-menu-checkbox ${this.layerVisibility.contours ? 'checked' : ''}"></span>
                                <span>勾画</span>
                            </div>
                            <div class="context-menu-item" data-layer="dose">
                                <span class="context-menu-checkbox ${this.layerVisibility.dose ? 'checked' : ''}"></span>
                                <span>剂量</span>
                            </div>
                            <div class="context-menu-item" data-layer="beamSpots">
                                <span class="context-menu-checkbox ${this.layerVisibility.beamSpots ? 'checked' : ''}"></span>
                                <span>束斑</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

renderToolbar() {
        return `
            <div class="cross-section-view2d-toolbar">
                <div class="toolbar-title">2D</div>
                <div class="toolbar-group toolbar-group-right">
                    <button class="toolbar-btn-svg" id="${this.containerId}-zoom" title="缩放" data-active="false">
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
                    <button class="toolbar-btn-svg" id="${this.containerId}-pan" title="移动" data-active="false">
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
                    <button class="toolbar-btn-svg" id="${this.containerId}-adjust" title="灰度值" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-adjust-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle cx="12" cy="12" r="9" stroke="url(#gradient-adjust-${this.containerId})" stroke-width="2" fill="none"/>
                            <path d="M12 3 A9 9 0 0 1 12 21 Z" fill="url(#gradient-adjust-${this.containerId})" opacity="0.3"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-rotate" title="旋转" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-rotate-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <rect x="6" y="8" width="12" height="8" rx="1" stroke="url(#gradient-rotate-${this.containerId})" stroke-width="2" fill="none"/>
                            <path d="M18 8 L18 5 L21 8 L18 11 L18 8" fill="url(#gradient-rotate-${this.containerId})"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-measure" title="测量" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-measure-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <rect x="4" y="3" width="4" height="18" rx="1" stroke="url(#gradient-measure-${this.containerId})" stroke-width="2" fill="none"/>
                            <line x1="8" y1="6" x2="11" y2="6" stroke="url(#gradient-measure-${this.containerId})" stroke-width="2"/>
                            <line x1="8" y1="9" x2="10" y2="9" stroke="url(#gradient-measure-${this.containerId})" stroke-width="2"/>
                            <line x1="8" y1="12" x2="11" y2="12" stroke="url(#gradient-measure-${this.containerId})" stroke-width="2"/>
                            <line x1="8" y1="15" x2="10" y2="15" stroke="url(#gradient-measure-${this.containerId})" stroke-width="2"/>
                            <line x1="8" y1="18" x2="11" y2="18" stroke="url(#gradient-measure-${this.containerId})" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="toolbar-btn-svg" id="${this.containerId}-maximize" title="最大化" data-active="false">
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
                    <button class="toolbar-btn-svg" id="${this.containerId}-grid" title="网格" data-active="false">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="gradient-grid-${this.containerId}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <rect x="4" y="4" width="5" height="5" stroke="url(#gradient-grid-${this.containerId})" stroke-width="1.5" fill="none"/>
                            <rect x="10" y="4" width="5" height="5" stroke="url(#gradient-grid-${this.containerId})" stroke-width="1.5" fill="none"/>
                            <rect x="16" y="4" width="5" height="5" stroke="url(#gradient-grid-${this.containerId})" stroke-width="1.5" fill="none"/>
                            <rect x="4" y="10" width="5" height="5" stroke="url(#gradient-grid-${this.containerId})" stroke-width="1.5" fill="none"/>
                            <rect x="10" y="10" width="5" height="5" stroke="url(#gradient-grid-${this.containerId})" stroke-width="1.5" fill="none"/>
                            <rect x="16" y="10" width="5" height="5" stroke="url(#gradient-grid-${this.containerId})" stroke-width="1.5" fill="none"/>
                            <rect x="4" y="16" width="5" height="5" stroke="url(#gradient-grid-${this.containerId})" stroke-width="1.5" fill="none"/>
                            <rect x="10" y="16" width="5" height="5" stroke="url(#gradient-grid-${this.containerId})" stroke-width="1.5" fill="none"/>
                            <rect x="16" y="16" width="5" height="5" stroke="url(#gradient-grid-${this.containerId})" stroke-width="1.5" fill="none"/>
                        </svg>
                        <svg width="8" height="8" viewBox="0 0 8 8" style="margin-left: 2px;">
                            <polygon points="4,6 2,2 6,2" fill="url(#gradient-grid-${this.containerId})"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    renderDoseLegend() {
        // 等剂量线颜色映射（从高到低）
        const isodoseColors = {
            105: '#FF0000',  // 红色
            100: '#FF6600',  // 橙色
            95: '#FFCC00',   // 黄色
            90: '#00FF00',   // 绿色
            50: '#00CCFF',   // 青色
            20: '#9900FF'    // 紫色
        };

        // 按从高到低排序
        const sortedIsodose = [...this.isodoseLines].sort((a, b) => b - a);

        return `
            <div class="dose-legend-list">
                ${sortedIsodose.map(percentage => {
                    const color = isodoseColors[percentage] || '#FFFFFF';
                    return `
                        <div class="dose-legend-item">
                            <div class="dose-legend-color" style="background-color: ${color};"></div>
                            <div class="dose-legend-label">${percentage}%</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }



    setupCanvas() {
        this.canvas = document.getElementById(`${this.containerId}-canvas`);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        
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

        const rect = wrapper.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // 如果已经有图像数据，重新渲染
        if (this.imageData) {
            this.renderAll();
        }
    }

    bindEvents() {
        if (!this.canvas) return;

        // 工具栏按钮事件
        if (this.options.enableToolbar) {
            const zoomBtn = document.getElementById(`${this.containerId}-zoom`);
            const panBtn = document.getElementById(`${this.containerId}-pan`);
            const adjustBtn = document.getElementById(`${this.containerId}-adjust`);
            const rotateBtn = document.getElementById(`${this.containerId}-rotate`);
            const measureBtn = document.getElementById(`${this.containerId}-measure`);
            const maximizeBtn = document.getElementById(`${this.containerId}-maximize`);
            const gridBtn = document.getElementById(`${this.containerId}-grid`);

            if (zoomBtn) {
                zoomBtn.addEventListener('click', () => this.activateTool('zoom'));
            }
            if (panBtn) {
                panBtn.addEventListener('click', () => this.activateTool('pan'));
            }
            if (adjustBtn) {
                adjustBtn.addEventListener('click', () => this.activateTool('adjust'));
            }
            if (rotateBtn) {
                rotateBtn.addEventListener('click', () => {
                    this.rotationAngle += 90;
                    if (this.rotationAngle >= 360) this.rotationAngle = 0;
                    this.renderAll();
                });
            }
            if (measureBtn) {
                measureBtn.addEventListener('click', () => this.activateTool('measure'));
            }
            if (maximizeBtn) {
                maximizeBtn.addEventListener('click', () => this.toggleMaximize());
            }
            if (gridBtn) {
                gridBtn.addEventListener('click', () => this.toggleGrid());
            }
        }

        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // 只处理左键

            this.isDragging = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };

            if (this.currentTool === 'measure') {
                // 测量工具：记录点击点
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.measurePoints.push({ x, y });
                if (this.measurePoints.length > 2) {
                    this.measurePoints = [];
                }
                this.renderAll();
            } else if (this.currentTool === 'pan') {
                this.canvas.style.cursor = 'grabbing';
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastMousePos.x;
                const dy = e.clientY - this.lastMousePos.y;

                if (this.currentTool === 'pan') {
                    // 移动工具（只有激活时才能拖动）
                    this.panX += dx;
                    this.panY += dy;
                    this.renderAll();
                } else if (this.currentTool === 'adjust') {
                    // 灰度值调整（窗宽窗位）
                    this.windowWidth += dx * 2;
                    this.windowCenter += dy;
                    this.windowWidth = Math.max(10, this.windowWidth);
                    this.renderAll();
                } else if (this.currentTool === 'zoom') {
                    // 缩放工具（拖动缩放）
                    const delta = dy > 0 ? 0.99 : 1.01;
                    this.zoom *= delta;
                    this.zoom = Math.max(0.1, Math.min(10, this.zoom));
                    this.renderAll();
                }

                this.lastMousePos = { x: e.clientX, y: e.clientY };
            } else {
                // 更新鼠标光标
                this.updateCursor();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.updateCursor();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        });

        // 滚轮缩放功能已禁用
        // this.canvas.addEventListener('wheel', (e) => {
        //     e.preventDefault();
        //     const delta = e.deltaY > 0 ? 0.9 : 1.1;
        //     this.zoom *= delta;
        //     if (this.zoom < 0.1) this.zoom = 0.1;
        //     if (this.zoom > 10) this.zoom = 10;
        //     this.updateMetadata();
        //     this.renderAll();
        // });

        // 右键菜单
        const contextMenu = document.getElementById(`${this.containerId}-context-menu`);
        if (contextMenu) {
            // 右键显示菜单
            this.canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                contextMenu.style.display = 'block';
                contextMenu.style.left = e.clientX + 'px';
                contextMenu.style.top = e.clientY + 'px';
            });

            // 点击菜单项
            contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const layer = item.dataset.layer;
                    const action = item.dataset.action;
                    
                    if (layer && this.layerVisibility.hasOwnProperty(layer)) {
                        // 切换图层可见性
                        this.layerVisibility[layer] = !this.layerVisibility[layer];
                        const checkbox = item.querySelector('.context-menu-checkbox');
                        if (checkbox) {
                            checkbox.classList.toggle('checked', this.layerVisibility[layer]);
                        }
                        this.renderAll();
                    } else if (action) {
                        // 执行操作
                        this.handleContextMenuAction(action);
                    }
                    
                    // 隐藏菜单
                    contextMenu.style.display = 'none';
                });
            });

            // 点击其他地方隐藏菜单
            document.addEventListener('click', (e) => {
                if (!contextMenu.contains(e.target) && e.target !== this.canvas) {
                    contextMenu.style.display = 'none';
                }
            });
        }

    }

    /**
     * 创建默认示例图像
     */
    createDefaultImage() {
        if (!this.ctx) return;
        
        // 创建一个简单的灰度图像用于测试显示
        const width = 512;
        const height = 512;
        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;

        // 生成一个简单的示例图像（类似CT扫描的头部横截面）
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                // 计算到中心的距离
                const centerX = width / 2;
                const centerY = height / 2;
                const dx = x - centerX;
                const dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // 创建一个简单的头部轮廓
                let gray = 0;
                if (dist < 200) {
                    // 头部区域
                    gray = 120 + Math.sin(dist / 20) * 30;
                    // 添加一些内部结构
                    if (dist > 100 && dist < 150) {
                        gray = 80; // 较暗的区域
                    }
                    if (dist < 50) {
                        gray = 60; // 中心较暗
                    }
                } else if (dist < 220) {
                    // 边缘骨骼
                    gray = 200;
                } else {
                    // 背景
                    gray = 0;
                }
                
                data[idx] = gray;     // R
                data[idx + 1] = gray; // G
                data[idx + 2] = gray; // B
                data[idx + 3] = 255;  // A
            }
        }

        this.imageData = imageData;
        this.renderAll();
    }

    // ==================== 数据加载方法 ====================

    /**
     * 加载图像数据（底层）
     * @param {ImageData|HTMLImageElement|ImageBitmap} image - 图像数据
     */
    loadImage(image) {
        if (image instanceof ImageData) {
            this.imageData = image;
        } else if (image instanceof HTMLImageElement || image instanceof ImageBitmap) {
            // 转换为ImageData
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = image.width;
            tempCanvas.height = image.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(image, 0, 0);
            this.imageData = tempCtx.getImageData(0, 0, image.width, image.height);
        } else {
            console.warn('不支持的图像格式');
            return;
        }
        this.renderAll();
    }

    /**
     * 从URL加载图像
     * @param {string} url - 图像URL
     */
    loadImageFromURL(url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.loadImage(img);
        };
        img.onerror = () => {
            console.error('图像加载失败:', url);
        };
        img.src = url;
    }

    /**
     * 添加勾画数据
     * @param {string} roiId - ROI ID
     * @param {Array} points - 轮廓点数组 [{x, y}, ...]
     * @param {string} color - 颜色（hex格式，如#FF0000）
     * @param {Object} options - 选项 { visible: boolean }
     */
    addContour(roiId, points, color = '#00FF00', options = {}) {
        this.contours.push({ roiId, points, color });
        this.contourColors.set(roiId, color);
        this.contourVisibility.set(roiId, options.visible !== undefined ? options.visible : true);
        this.renderAll();
    }

    /**
     * 设置ROI可见性
     * @param {string} roiId - ROI ID
     * @param {boolean} visible - 是否可见
     */
    setContourVisibility(roiId, visible) {
        this.contourVisibility.set(roiId, visible);
        this.renderAll();
    }

    /**
     * 按分组切换勾画可见性（如靶区/图像处理）
     */
    setContourGroupVisibility(group, visible) {
        this.contourGroupVisibility.set(group, visible);
        this.renderAll();
    }

    /**
     * 设置ROI颜色
     * @param {string} roiId - ROI ID
     * @param {string} color - 颜色（hex格式）
     */
    setContourColor(roiId, color) {
        this.contourColors.set(roiId, color);
        const contour = this.contours.find(c => c.roiId === roiId);
        if (contour) {
            contour.color = color;
        }
        this.renderAll();
    }

    /**
     * 加载剂量数据
     * @param {ImageData} doseData - 剂量数据（ImageData格式）
     */
    loadDoseData(doseData) {
        this.doseData = doseData;
        this.renderAll();
    }

    /**
     * 添加束斑
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} radius - 半径
     * @param {string} color - 颜色
     */
    addBeamSpot(x, y, radius = 5, color = '#FF0000') {
        this.beamSpots.push({ x, y, radius, color });
        this.renderAll();
    }

    /**
     * 清空束斑
     */
    clearBeamSpots() {
        this.beamSpots = [];
        this.renderAll();
    }

    // ==================== 渲染方法 ====================

    /**
     * 渲染所有图层
     */
    renderAll() {
        if (!this.ctx || !this.canvas) return;

        // 清空画布
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 保存上下文状态
        this.ctx.save();

        // 应用变换（平移、缩放和旋转）
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.ctx.translate(centerX + this.panX, centerY + this.panY);
        this.ctx.rotate(this.rotationAngle * Math.PI / 180);
        this.ctx.scale(this.zoom, this.zoom);

        // 渲染图像层（底层）
        if (this.layerVisibility.image && this.imageData) {
            this.renderImageLayer();
        }

        // 渲染剂量层（仅当启用时）
        if (this.options.enableDoseLayer && this.layerVisibility.dose && this.doseData) {
            this.renderDoseLayer();
        }

        // 渲染勾画层
        if (this.layerVisibility.contours && this.contours.length > 0) {
            this.renderContourLayer();
        }

        // 渲染束斑层（最上层）
        if (this.layerVisibility.beamSpots && this.beamSpots.length > 0) {
            this.renderBeamSpotLayer();
        }

        // 恢复上下文状态
        this.ctx.restore();

        // 渲染网格（在变换之外）
        if (this.showGrid) {
            this.renderGrid();
        }

        // 渲染测量线（在变换之外）
        if (this.measurePoints.length > 0) {
            this.renderMeasurement();
        }
    }

    /**
     * 渲染图像层（底层）
     */
    renderImageLayer() {
        if (!this.imageData) return;

        const imageWidth = this.imageData.width;
        const imageHeight = this.imageData.height;

        // 创建临时canvas用于窗宽窗位处理
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;
        const tempCtx = tempCanvas.getContext('2d');
        const tempImageData = tempCtx.createImageData(imageWidth, imageHeight);

        // 应用窗宽窗位
        const data = this.imageData.data;
        const output = tempImageData.data;
        const min = this.windowCenter - this.windowWidth / 2;
        const max = this.windowCenter + this.windowWidth / 2;
        const range = max - min;

        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i]; // 假设是灰度图
            let normalized = (gray - min) / range;
            normalized = Math.max(0, Math.min(1, normalized));
            const value = Math.round(normalized * 255);
            output[i] = value;
            output[i + 1] = value;
            output[i + 2] = value;
            output[i + 3] = 255;
        }

        tempCtx.putImageData(tempImageData, 0, 0);

        // 绘制图像（居中）
        const offsetX = -imageWidth / 2;
        const offsetY = -imageHeight / 2;
        this.ctx.drawImage(tempCanvas, offsetX, offsetY);
    }

    /**
     * 渲染剂量层
     */
    renderDoseLayer() {
        if (!this.doseData) return;

        const imageWidth = this.doseData.width;
        const imageHeight = this.doseData.height;

        // 创建临时canvas用于剂量渲染
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;
        const tempCtx = tempCanvas.getContext('2d');
        const tempImageData = tempCtx.createImageData(imageWidth, imageHeight);

        const data = this.doseData.data;
        const output = tempImageData.data;

        // 假设剂量数据是单通道，归一化到0-255
        for (let i = 0; i < data.length; i += 4) {
            const doseValue = data[i]; // 假设剂量值在第一个通道
            const color = this.getDoseColor(doseValue);
            output[i] = color.r;
            output[i + 1] = color.g;
            output[i + 2] = color.b;
            output[i + 3] = Math.round(255 * this.doseOpacity);
        }

        tempCtx.putImageData(tempImageData, 0, 0);

        // 绘制剂量（居中，使用透明度）
        this.ctx.globalAlpha = this.doseOpacity;
        const offsetX = -imageWidth / 2;
        const offsetY = -imageHeight / 2;
        this.ctx.drawImage(tempCanvas, offsetX, offsetY);
        this.ctx.globalAlpha = 1.0;

        // 绘制等值线
        this.renderIsodoseLines();
    }

    /**
     * 渲染等值线
     */
    renderIsodoseLines() {
        if (!this.doseData) return;

        const imageWidth = this.doseData.width;
        const imageHeight = this.doseData.height;
        const offsetX = -imageWidth / 2;
        const offsetY = -imageHeight / 2;

        this.isodoseLines.forEach((percentage, index) => {
            const threshold = (percentage / 100) * 255; // 假设最大剂量为255
            const color = this.getDoseColor(threshold);

            this.ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();

            // 简化的等值线绘制（实际应该使用marching squares算法）
            // 这里只是示例
            const radius = (percentage / 100) * Math.min(imageWidth, imageHeight) / 2;
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }

    /**
     * 渲染勾画层
     */
    renderContourLayer() {
        if (!this.imageData) return; // 需要图像数据来确定坐标系
        
        const imageWidth = this.imageData.width;
        const imageHeight = this.imageData.height;
        // 图像坐标系：图像中心在(0,0)，图像从(-imageWidth/2, -imageHeight/2)开始
        const offsetX = -imageWidth / 2;
        const offsetY = -imageHeight / 2;
        
        this.contours.forEach(contour => {
            if (!this.contourVisibility.get(contour.roiId)) return;

            const color = this.contourColors.get(contour.roiId) || contour.color || '#00FF00';
            
            this.ctx.strokeStyle = color;
            this.ctx.fillStyle = color;
            this.ctx.lineWidth = 2;

            if (contour.points && contour.points.length > 0) {
                this.ctx.beginPath();
                contour.points.forEach((point, index) => {
                    // 轮廓点坐标是相对于图像左上角的，需要转换为相对于图像中心的坐标
                    const x = point.x + offsetX;
                    const y = point.y + offsetY;
                    if (index === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                });
                this.ctx.closePath();
                this.ctx.stroke();
            }
        });
    }

    /**
     * 渲染束斑层
     */
    renderBeamSpotLayer() {
        this.beamSpots.forEach(spot => {
            this.ctx.fillStyle = spot.color;
            this.ctx.beginPath();
            this.ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 绘制边框
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    /**
     * 渲染网格
     */
    renderGrid() {
        const gridSize = 50; // 网格间距
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        this.ctx.lineWidth = 1;

        // 绘制垂直线
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // 绘制水平线
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    /**
     * 渲染测量线
     */
    renderMeasurement() {
        if (this.measurePoints.length === 0) return;

        this.ctx.strokeStyle = '#00FF00';
        this.ctx.fillStyle = '#00FF00';
        this.ctx.lineWidth = 2;

        // 绘制测量点
        this.measurePoints.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 如果有两个点，绘制连线和距离
        if (this.measurePoints.length === 2) {
            const p1 = this.measurePoints[0];
            const p2 = this.measurePoints[1];

            // 绘制连线
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();

            // 计算距离
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 显示距离
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = '#00FF00';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            const text = `${distance.toFixed(1)} px`;
            this.ctx.strokeText(text, midX + 10, midY - 10);
            this.ctx.fillText(text, midX + 10, midY - 10);
        }
    }

    // ==================== 工具方法 ====================

    /**
     * 创建剂量颜色映射
     */
    createDoseColorMap() {
        // 典型的剂量颜色映射：从蓝色（低剂量）到红色（高剂量）
        return {
            getColor: (value) => {
                // 归一化到0-1
                const normalized = Math.max(0, Math.min(1, value / 255));
                
                if (normalized < 0.2) {
                    // 蓝色
                    return { r: 0, g: 0, b: Math.round(255 * normalized * 5) };
                } else if (normalized < 0.4) {
                    // 青色
                    const t = (normalized - 0.2) / 0.2;
                    return { r: 0, g: Math.round(255 * t), b: 255 };
                } else if (normalized < 0.6) {
                    // 绿色
                    const t = (normalized - 0.4) / 0.2;
                    return { r: 0, g: 255, b: Math.round(255 * (1 - t)) };
                } else if (normalized < 0.8) {
                    // 黄色
                    const t = (normalized - 0.6) / 0.2;
                    return { r: Math.round(255 * t), g: 255, b: 0 };
                } else {
                    // 红色
                    const t = (normalized - 0.8) / 0.2;
                    return { r: 255, g: Math.round(255 * (1 - t)), b: 0 };
                }
            }
        };
    }

    /**
     * 获取剂量颜色
     */
    getDoseColor(value) {
        return this.doseColorMap.getColor(value);
    }

    /**
     * 适应窗口
     */
    fitToWindow() {
        if (!this.imageData) return;

        const imageWidth = this.imageData.width;
        const imageHeight = this.imageData.height;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        const scaleX = canvasWidth / imageWidth;
        const scaleY = canvasHeight / imageHeight;
        this.zoom = Math.min(scaleX, scaleY) * 0.9; // 留10%边距

        this.panX = 0;
        this.panY = 0;
        this.updateMetadata();
        this.renderAll();
    }

    /**
     * 更新元数据显示
     */
    updateMetadata() {
        const metadataEl = document.getElementById(`${this.containerId}-metadata`);
        if (metadataEl) {
            metadataEl.innerHTML = `
                <div>WW: ${this.windowWidth} | WC: ${this.windowCenter}</div>
                <div>Zoom: ${(this.zoom * 100).toFixed(0)}%</div>
            `;
        }
    }

    /**
     * 设置窗宽窗位
     */
    setWindowLevel(width, center) {
        this.windowWidth = width;
        this.windowCenter = center;
        
        const windowWidthInput = document.getElementById(`${this.containerId}-window-width`);
        const windowCenterInput = document.getElementById(`${this.containerId}-window-center`);
        
        if (windowWidthInput) windowWidthInput.value = width;
        if (windowCenterInput) windowCenterInput.value = center;
        
        this.renderAll();
    }

    /**
     * 设置剂量透明度
     */
    setDoseOpacity(opacity) {
        this.doseOpacity = Math.max(0, Math.min(1, opacity));
        this.renderAll();
    }

    /**
     * 处理右键菜单操作
     */
    handleContextMenuAction(action) {
        switch(action) {
            case 'cut':
                console.log('即切操作');
                break;
            case 'copy':
                console.log('复制操作');
                break;
            case 'paste':
                console.log('粘贴操作');
                break;
            case 'select':
                console.log('选中操作');
                break;
            case 'drag':
                console.log('拖动操作');
                break;
            case 'zoom':
                console.log('缩放操作');
                break;
            case 'rotate':
                console.log('旋转操作');
                break;
        }
    }

    /**
     * 设置当前层数和总层数
     */
    setSliceInfo(current, total) {
        this.currentSlice = current;
        this.totalSlices = total;
        const sliceInfoEl = document.getElementById(`${this.containerId}-slice-info`);
        if (sliceInfoEl) {
            sliceInfoEl.textContent = `${this.viewPlane} ${current}/${total}`;
        }
    }

    /**
     * 设置视图平面
     */
    setViewPlane(plane) {
        this.viewPlane = plane;
        const sliceInfoEl = document.getElementById(`${this.containerId}-slice-info`);
        if (sliceInfoEl) {
            sliceInfoEl.textContent = `${plane} ${this.currentSlice}/${this.totalSlices}`;
        }
        // 更新位面指示器
        this.updatePlaneIndicator(plane);
    }

    /**
     * 更新位面指示器
     */
    updatePlaneIndicator(plane) {
        const indicator = document.getElementById(`${this.containerId}-plane-indicator`);
        if (!indicator) return;

        const arrows = indicator.querySelectorAll('.plane-arrow');
        arrows.forEach(arrow => arrow.classList.remove('active'));

        if (plane === 'Axial') {
            indicator.querySelector('.plane-arrow-axial')?.classList.add('active');
        } else if (plane === 'Coronal') {
            indicator.querySelector('.plane-arrow-coronal')?.classList.add('active');
        } else if (plane === 'Sagittal') {
            indicator.querySelector('.plane-arrow-sagittal')?.classList.add('active');
        }
    }

    /**
     * 激活工具
     */
    activateTool(toolName) {
        // 如果点击的是当前工具，则取消激活
        if (this.currentTool === toolName) {
            this.currentTool = null;
        } else {
            this.currentTool = toolName;
        }

        // 更新工具栏按钮状态
        const tools = ['zoom', 'pan', 'adjust', 'measure'];
        tools.forEach(tool => {
            const btn = document.getElementById(`${this.containerId}-${tool}`);
            if (btn) {
                const isActive = (tool === this.currentTool);
                btn.setAttribute('data-active', isActive);
                btn.style.opacity = isActive ? '1' : '0.6';
            }
        });

        // 更新鼠标光标
        this.updateCursor();

        // 如果切换到其他工具，清空测量点
        if (toolName !== 'measure') {
            this.measurePoints = [];
            this.renderAll();
        }
    }

    /**
     * 更新鼠标光标
     */
    updateCursor() {
        if (!this.canvas) return;

        switch (this.currentTool) {
            case 'zoom':
                this.canvas.style.cursor = 'zoom-in';
                break;
            case 'pan':
                this.canvas.style.cursor = 'grab';
                break;
            case 'adjust':
                this.canvas.style.cursor = 'ns-resize';
                break;
            case 'measure':
                this.canvas.style.cursor = 'crosshair';
                break;
            default:
                this.canvas.style.cursor = 'default';
        }
    }

    /**
     * 切换网格显示
     */
    toggleGrid() {
        this.showGrid = !this.showGrid;
        const gridBtn = document.getElementById(`${this.containerId}-grid`);
        if (gridBtn) {
            gridBtn.setAttribute('data-active', this.showGrid);
            gridBtn.style.opacity = this.showGrid ? '1' : '0.6';
        }
        this.renderAll();
    }

    /**
     * 切换最大化
     */
    toggleMaximize() {
        this.isMaximized = !this.isMaximized;
        const container = this.container;
        const maximizeBtn = document.getElementById(`${this.containerId}-maximize`);
        
        if (this.isMaximized) {
            // 最大化
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.zIndex = '9999';
            container.style.backgroundColor = '#000';
            if (maximizeBtn) {
                maximizeBtn.setAttribute('data-active', 'true');
                maximizeBtn.style.opacity = '1';
            }
        } else {
            // 恢复正常
            container.style.position = '';
            container.style.top = '';
            container.style.left = '';
            container.style.width = '';
            container.style.height = '';
            container.style.zIndex = '';
            container.style.backgroundColor = '';
            if (maximizeBtn) {
                maximizeBtn.setAttribute('data-active', 'false');
                maximizeBtn.style.opacity = '0.6';
            }
        }

        // 重新调整canvas大小
        setTimeout(() => {
            this.resizeCanvas();
            this.renderAll();
        }, 100);
    }
}

// 导出到全局
window.CrossSectionView2DComponent = CrossSectionView2DComponent;

