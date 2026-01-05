/**
 * BEV视图组件 - 射野方向观视图
 * 功能：
 * - 左上角饼图：展示所有射野，选定的射束突出显示
 * - 左下角信息：显示CT、Beam、Energy layer等信息
 * - 主视图：显示ROI、DRR、束斑等
 * - 右上角工具：缩放、平移、全屏
 */
class BeamEyeViewComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        
        this.options = {
            onBeamSelect: options.onBeamSelect || (() => {}),
            onControlPointSelect: options.onControlPointSelect || (() => {}),
            getBeamList: options.getBeamList || (() => []),
            getEnergyLayers: options.getEnergyLayers || (() => []),
            getCurrentCT: options.getCurrentCT || (() => null),
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
            showBeamSpots: true            // 束斑（默认显示）
        };

        // 等中心点
        this.isocenter = { x: 0, y: 0 };
        this.isDraggingIso = false;

        // 交互状态
        this.isDragging = false;
        this.isZooming = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.currentTool = 'pan';          // 当前工具：pan, zoom

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

        this.container.innerHTML = `
            <div class="bev-view-container">
                <div class="bev-view-main">
                    <div class="bev-view-canvas-wrapper">
                        <!-- 左上角饼图 -->
                        <canvas id="${this.containerId}-beam-diagram" class="bev-view-beam-diagram"></canvas>
                        
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
                        </div>
                    </div>
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

        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

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
            if (this.isDraggingIso) {
                const rect = this.canvas.getBoundingClientRect();
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
                // 检查鼠标是否在等中心点附近
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
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

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isDraggingIso = false;
            this.isZooming = false;
            this.canvas.style.cursor = 'default';
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
        this.beamList = this.options.getBeamList() || [
            { id: 1, name: 'beam1', angle: 0, color: '#FF0000' },
            { id: 2, name: 'beam2', angle: 72, color: '#00FF00' },
            { id: 3, name: 'beam3', angle: 144, color: '#0000FF' },
            { id: 4, name: 'beam4', angle: 216, color: '#FFFF00' },
            { id: 5, name: 'beam5', angle: 288, color: '#FF00FF' }
        ];

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

        // 渲染束斑
        if (this.displaySettings.showBeamSpots) {
            this.renderBeamSpots();
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
window.BeamEyeViewComponent = BeamEyeViewComponent;

