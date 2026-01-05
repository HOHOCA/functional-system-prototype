/**
 * DVH (Dose Volume Histogram) Component
 * 剂量体积直方图组件
 * 
 * 功能：
 * - 显示积分/微分DVH曲线
 * - 鼠标悬停显示十字线和信息
 * - 框选放大功能
 * - 曲线显隐控制
 * - 设置面板（积分/微分、相对/绝对体积）
 */

class DVHComponent {
    constructor(containerId, options = {}) {
        // 处理 containerId：可能是字符串ID或DOM元素
        if (typeof containerId === 'string') {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
        } else {
            // 如果传入的是DOM元素，使用其id或生成唯一id
            this.container = containerId;
            this.containerId = containerId.id || `dvh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            if (!containerId.id) {
                containerId.id = this.containerId;
            }
        }
        
        if (!this.container) {
            console.error('DVH容器未找到:', containerId);
            return;
        }

        this.options = {
            width: options.width || 800,
            height: options.height || 600,
            enableToolbar: options.enableToolbar !== false,
            enableContextMenu: options.enableContextMenu !== false,
            onCurveClick: options.onCurveClick || null,
            // 布局/标题栏控制（方案B：工具栏外置）
            showToolbar: options.showToolbar !== false,
            showHeader: options.showHeader !== false,
            toolbarTitle: options.toolbarTitle || 'DVH',
            toolbarContainerId: options.toolbarContainerId || null, // 若提供，则工具栏渲染到外部容器
            ...options
        };

        // 数据
        this.dvhData = [];  // DVH曲线数据 [{roiId, roiName, color, points: [{dose, volume}]}]
        this.constraintPoints = [];  // 优化约束点
        
        // 显示设置
        this.settings = {
            curveType: 'cumulative',  // 'cumulative' | 'differential'
            volumeType: 'relative',   // 'relative' | 'absolute'
            lineWidth: 1,             // 基础线宽
            thickLineEnabled: false   // 线条加粗
        };

        // 交互状态
        this.zoom = {
            active: false,
            xMin: null,
            xMax: null,
            yMin: null,
            yMax: null
        };
        this.hoveredCurve = null;
        this.selectedCurve = null;
        this.isMaximized = false;

        // 框选状态
        this.isSelecting = false;
        this.selectionStart = null;
        this.selectionEnd = null;

        // Canvas相关
        this.canvas = null;
        this.ctx = null;
        this.tooltip = null;

        // 鼠标位置
        this.mousePos = { x: 0, y: 0 };
        this.crosshairPos = null;

        this.init();
    }

    init() {
        this.render();
        this.setupCanvas();
        this.bindEvents();
        this.loadSampleData();
        this.draw();
    }

    render() {
        // 如果指定外部工具栏容器，则不在内部渲染工具栏
        const internalToolbar = (this.options.enableToolbar && this.options.showToolbar && !this.options.toolbarContainerId)
            ? this.renderToolbar()
            : '';

        const contextMenuHTML = this.options.enableContextMenu ? `
            <div class="dvh-context-menu" id="${this.containerId}-context-menu" style="display: none;">
                <div class="context-menu-item" data-action="zoom-out">
                    <i class="fas fa-search-minus"></i>
                    <span>缩小</span>
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="toggle-thick-line">
                    <i class="fas fa-chart-line"></i>
                    <span>线条加粗</span>
                    <i class="fas fa-check" style="margin-left: auto;"></i>
                </div>
            </div>
        ` : '';

        this.container.innerHTML = `
            <div class="dvh-wrapper">
                ${internalToolbar}
                <div class="dvh-canvas-container">
                    <canvas class="dvh-canvas"></canvas>
                </div>
                <div class="dvh-tooltip" id="${this.containerId}-tooltip" style="display: none;"></div>
                ${contextMenuHTML}
            </div>
        `;

        // 如果指定外部工具栏容器，渲染到该容器
        if (this.options.enableToolbar && this.options.showToolbar && this.options.toolbarContainerId) {
            this.mountToolbarExternally();
        }

        this.canvas = this.container.querySelector('.dvh-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.tooltip = document.getElementById(`${this.containerId}-tooltip`);
    }

    renderToolbar() {
        if (!this.options.enableToolbar || !this.options.showToolbar) return '';

        const titleHtml = this.options.showHeader
            ? `<div class="toolbar-title">${this.options.toolbarTitle || 'DVH'}</div>`
            : '';

        return `
            <div class="dvh-toolbar cross-section-view2d-toolbar" data-dvh-toolbar="${this.containerId}">
                ${titleHtml}
                <div class="toolbar-group toolbar-group-right">
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
                </div>
            </div>
        `;
    }

    mountToolbarExternally() {
        const external = document.getElementById(this.options.toolbarContainerId);
        if (!external) {
            console.warn('DVHComponent: toolbarContainerId not found:', this.options.toolbarContainerId);
            // 如果外部容器不存在，回退到内部渲染
            const wrapper = this.container.querySelector('.dvh-wrapper');
            if (wrapper && !wrapper.querySelector('[data-dvh-toolbar]')) {
                wrapper.insertAdjacentHTML('afterbegin', this.renderToolbar());
            }
            return;
        }
        // 渲染到外部容器时，只渲染工具按钮组（不含标题栏）
        const toolbarHtml = this.renderToolbarButtonsOnly();
        external.innerHTML = toolbarHtml;
    }

    renderToolbarButtonsOnly() {
        if (!this.options.enableToolbar || !this.options.showToolbar) return '';

        return `
            <div class="dvh-toolbar cross-section-view2d-toolbar" data-dvh-toolbar="${this.containerId}" style="background: transparent; border: none; padding: 0; height: auto;">
                <div class="toolbar-group toolbar-group-right">
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
                </div>
            </div>
        `;
    }

    setupCanvas() {
        const container = this.container.querySelector('.dvh-canvas-container');
        if (!container) return;

        // 使用getBoundingClientRect获取准确尺寸，而不是clientWidth/clientHeight
        const rect = container.getBoundingClientRect();
        const width = rect.width > 0 ? rect.width : this.options.width;
        const height = rect.height > 0 ? rect.height : this.options.height;

        // 确保canvas尺寸大于0
        if (width > 0 && height > 0) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
        }

        // 监听窗口大小变化
        if (!this.resizeHandler) {
            this.resizeHandler = () => {
                this.setupCanvas();
                this.draw();
            };
            window.addEventListener('resize', this.resizeHandler);
        }
    }

    bindEvents() {
        // 工具栏按钮
        const maximizeBtn = document.getElementById(`${this.containerId}-maximize`);
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                this.toggleMaximize();
            });
        }

        // Canvas鼠标事件
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));

        // 右键菜单
        if (this.options.enableContextMenu) {
            this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
            
            const menu = document.getElementById(`${this.containerId}-context-menu`);
            if (menu) {
                menu.querySelectorAll('.context-menu-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const action = item.dataset.action;
                        this.handleContextAction(action);
                        menu.style.display = 'none';
                    });
                });

                document.addEventListener('click', (e) => {
                    if (!menu.contains(e.target)) {
                        menu.style.display = 'none';
                    }
                });
            }
        }

        // ESC键退出最大化/缩放
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isMaximized) {
                    this.toggleMaximize();
                } else if (this.zoom.active) {
                    this.resetZoom();
                }
            }
        });
    }


    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 检查是否在绘图区域内
        const padding = this.getChartPadding();
        if (x >= padding.left && x <= this.canvas.width - padding.right &&
            y >= padding.top && y <= this.canvas.height - padding.bottom) {
            
            this.isSelecting = true;
            this.selectionStart = { x, y };
            this.selectionEnd = { x, y };
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.mousePos = { x, y };

        if (this.isSelecting && this.selectionStart) {
            // 框选中
            this.selectionEnd = { x, y };
            this.draw();
        } else {
            // 检测鼠标是否悬停在曲线上
            this.updateHoveredCurve(x, y);
            this.draw();
        }
    }

    handleMouseUp(e) {
        if (this.isSelecting && this.selectionStart && this.selectionEnd) {
            const dx = Math.abs(this.selectionEnd.x - this.selectionStart.x);
            const dy = Math.abs(this.selectionEnd.y - this.selectionStart.y);

            // 如果框选区域足够大，执行缩放
            if (dx > 10 && dy > 10) {
                this.zoomToSelection();
            }
        }

        this.isSelecting = false;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.draw();
    }

    handleMouseLeave(e) {
        this.isSelecting = false;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.hoveredCurve = null;
        this.crosshairPos = null;
        
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
        
        this.draw();
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const padding = this.getChartPadding();
        
        // 检查是否点击在绘图区域内
        if (x < padding.left || x > this.canvas.width - padding.right ||
            y < padding.top || y > this.canvas.height - padding.bottom) {
            // 点击在区域外，取消选中
            this.selectedCurve = null;
            this.draw();
            return;
        }

        // 检查是否点击在曲线上
        const curve = this.findCurveAtPosition(x, y);
        if (curve) {
            this.selectedCurve = curve;
            if (this.options.onCurveClick) {
                this.options.onCurveClick(curve);
            }
        } else {
            this.selectedCurve = null;
        }
        
        this.draw();
    }

    handleContextMenu(e) {
        e.preventDefault();
        
        const menu = document.getElementById(`${this.containerId}-context-menu`);
        if (!menu) return;

        menu.style.display = 'block';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';

        // 更新菜单项状态
        const zoomOutItem = menu.querySelector('[data-action="zoom-out"]');
        if (zoomOutItem) {
            if (this.zoom.active) {
                zoomOutItem.classList.remove('disabled');
            } else {
                zoomOutItem.classList.add('disabled');
            }
        }

        const thickLineItem = menu.querySelector('[data-action="toggle-thick-line"]');
        if (thickLineItem) {
            const checkIcon = thickLineItem.querySelector('.fa-check');
            if (checkIcon) {
                checkIcon.style.display = this.settings.thickLineEnabled ? 'inline' : 'none';
            }
        }
    }

    handleContextAction(action) {
        switch (action) {
            case 'zoom-out':
                if (this.zoom.active) {
                    this.resetZoom();
                }
                break;
            case 'toggle-thick-line':
                this.settings.thickLineEnabled = !this.settings.thickLineEnabled;
                this.draw();
                break;
        }
    }

    updateHoveredCurve(x, y) {
        const padding = this.getChartPadding();
        
        // 检查是否在绘图区域内
        if (x < padding.left || x > this.canvas.width - padding.right ||
            y < padding.top || y > this.canvas.height - padding.bottom) {
            this.hoveredCurve = null;
            this.crosshairPos = null;
            if (this.tooltip) {
                this.tooltip.style.display = 'none';
            }
            return;
        }

        const curve = this.findCurveAtPosition(x, y, 10);
        this.hoveredCurve = curve;

        if (curve) {
            // 找到曲线上最近的点
            const chartPoint = this.screenToChart(x, y);
            const nearestPoint = this.findNearestPointOnCurve(curve, chartPoint.dose);
            
            if (nearestPoint) {
                this.crosshairPos = nearestPoint;
                this.showTooltip(curve, nearestPoint, x, y);
            }
        } else {
            this.crosshairPos = null;
            if (this.tooltip) {
                this.tooltip.style.display = 'none';
            }
        }
    }

    findCurveAtPosition(x, y, threshold = 8) {
        for (let i = this.dvhData.length - 1; i >= 0; i--) {
            const curve = this.dvhData[i];
            if (!curve.visible) continue;

            for (let j = 0; j < curve.points.length - 1; j++) {
                const p1 = curve.points[j];
                const p2 = curve.points[j + 1];
                
                const screen1 = this.chartToScreen(p1.dose, p1.volume);
                const screen2 = this.chartToScreen(p2.dose, p2.volume);
                
                const dist = this.distanceToLineSegment(x, y, screen1.x, screen1.y, screen2.x, screen2.y);
                
                if (dist < threshold) {
                    return curve;
                }
            }
        }
        return null;
    }

    findNearestPointOnCurve(curve, targetDose) {
        let nearest = null;
        let minDiff = Infinity;

        for (const point of curve.points) {
            const diff = Math.abs(point.dose - targetDose);
            if (diff < minDiff) {
                minDiff = diff;
                nearest = point;
            }
        }

        return nearest;
    }

    distanceToLineSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        
        if (lengthSquared === 0) {
            return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        }
        
        let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
        t = Math.max(0, Math.min(1, t));
        
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        
        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
    }

    showTooltip(curve, point, screenX, screenY) {
        if (!this.tooltip) return;

        const dose = point.dose.toFixed(2);
        const volume = point.volume.toFixed(2);
        const volumeAbs = point.volumeAbsolute ? point.volumeAbsolute.toFixed(2) : '0.00';

        // 复刻截图样式：深灰色背景，顶部带颜色线的ROI名称，下面是V和D数据
        this.tooltip.innerHTML = `
            <div class="dvh-tooltip-header">
                <div class="dvh-tooltip-color-line" style="background: ${curve.color};"></div>
                <span class="dvh-tooltip-roi-name">${curve.roiName}</span>
            </div>
            <div class="dvh-tooltip-content">
                <div class="dvh-tooltip-row">V: ${volume}% (${volumeAbs}cm³)</div>
                <div class="dvh-tooltip-row">D: ${dose}cGy</div>
            </div>
        `;

        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (screenX + 15) + 'px';
        this.tooltip.style.top = (screenY - 10) + 'px';

        // 确保tooltip不超出容器边界
        const rect = this.tooltip.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        if (rect.right > containerRect.right) {
            this.tooltip.style.left = (screenX - rect.width - 15) + 'px';
        }
        if (rect.bottom > containerRect.bottom) {
            this.tooltip.style.top = (screenY - rect.height - 10) + 'px';
        }
    }

    zoomToSelection() {
        if (!this.selectionStart || !this.selectionEnd) return;

        const start = this.screenToChart(this.selectionStart.x, this.selectionStart.y);
        const end = this.screenToChart(this.selectionEnd.x, this.selectionEnd.y);

        this.zoom.active = true;
        this.zoom.xMin = Math.min(start.dose, end.dose);
        this.zoom.xMax = Math.max(start.dose, end.dose);
        this.zoom.yMin = Math.min(start.volume, end.volume);
        this.zoom.yMax = Math.max(start.volume, end.volume);

        this.draw();
    }

    resetZoom() {
        this.zoom.active = false;
        this.zoom.xMin = null;
        this.zoom.xMax = null;
        this.zoom.yMin = null;
        this.zoom.yMax = null;
        this.draw();
    }

    toggleMaximize() {
        this.isMaximized = !this.isMaximized;
        const wrapper = this.container.querySelector('.dvh-wrapper');
        const btn = document.getElementById(`${this.containerId}-maximize`);
        
        if (this.isMaximized) {
            // 全屏模式
            wrapper.classList.add('maximized');
            if (btn) {
                btn.setAttribute('data-active', 'true');
                btn.style.opacity = '1';
            }
        } else {
            // 退出全屏模式
            wrapper.classList.remove('maximized');
            if (btn) {
                btn.setAttribute('data-active', 'false');
                btn.style.opacity = '0.6';
            }
        }

        // 延迟执行以确保DOM更新完成，给足够时间让CSS过渡完成
        setTimeout(() => {
            this.setupCanvas();
            this.draw();
        }, 200);
    }


    // ==================== 绘图方法 ====================

    draw() {
        if (!this.ctx) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // 清空画布
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, width, height);

        const padding = this.getChartPadding();

        // 绘制网格和坐标轴
        this.drawGrid(padding);
        this.drawAxes(padding);

        // 绘制DVH曲线
        this.drawCurves(padding);

        // 绘制优化约束点
        this.drawConstraintPoints(padding);

        // 绘制框选矩形
        if (this.isSelecting && this.selectionStart && this.selectionEnd) {
            this.drawSelectionBox();
        }

        // 绘制十字线
        if (this.crosshairPos && !this.isSelecting) {
            this.drawCrosshair(padding);
        }
    }

    getChartPadding() {
        return {
            top: 40,
            right: 40,
            bottom: 60,
            left: 80
        };
    }

    getDataRange() {
        if (this.zoom.active) {
            return {
                xMin: this.zoom.xMin,
                xMax: this.zoom.xMax,
                yMin: this.zoom.yMin,
                yMax: this.zoom.yMax
            };
        }

        // 固定坐标轴范围以匹配截图
        const xMin = 0;
        const xMax = 6000;
        const yMin = 0;
        const yMax = this.settings.volumeType === 'relative' ? 100 : 100;

        return { xMin, xMax, yMin, yMax };
    }

    chartToScreen(dose, volume) {
        const padding = this.getChartPadding();
        const range = this.getDataRange();

        const chartWidth = this.canvas.width - padding.left - padding.right;
        const chartHeight = this.canvas.height - padding.top - padding.bottom;

        const x = padding.left + (dose - range.xMin) / (range.xMax - range.xMin) * chartWidth;
        const y = this.canvas.height - padding.bottom - (volume - range.yMin) / (range.yMax - range.yMin) * chartHeight;

        return { x, y };
    }

    screenToChart(x, y) {
        const padding = this.getChartPadding();
        const range = this.getDataRange();

        const chartWidth = this.canvas.width - padding.left - padding.right;
        const chartHeight = this.canvas.height - padding.top - padding.bottom;

        const dose = range.xMin + (x - padding.left) / chartWidth * (range.xMax - range.xMin);
        const volume = range.yMin + (this.canvas.height - padding.bottom - y) / chartHeight * (range.yMax - range.yMin);

        return { dose, volume };
    }

    drawGrid(padding) {
        const ctx = this.ctx;
        const range = this.getDataRange();

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        const chartWidth = this.canvas.width - padding.left - padding.right;
        const chartHeight = this.canvas.height - padding.top - padding.bottom;

        // 垂直网格线（X轴：每1000 cGy一条线，共6条）
        const xSteps = [0, 1000, 2000, 3000, 4000, 5000, 6000];
        xSteps.forEach(dose => {
            const x = padding.left + (dose - range.xMin) / (range.xMax - range.xMin) * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, this.canvas.height - padding.bottom);
            ctx.stroke();
        });

        // 水平网格线（Y轴：每20%一条线，共5条）
        const ySteps = [0, 20, 40, 60, 80, 100];
        ySteps.forEach(volume => {
            const y = this.canvas.height - padding.bottom - (volume - range.yMin) / (range.yMax - range.yMin) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(this.canvas.width - padding.right, y);
            ctx.stroke();
        });
    }

    drawAxes(padding) {
        const ctx = this.ctx;
        const range = this.getDataRange();

        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ccc';
        ctx.font = '12px Arial';

        // X轴
        ctx.beginPath();
        ctx.moveTo(padding.left, this.canvas.height - padding.bottom);
        ctx.lineTo(this.canvas.width - padding.right, this.canvas.height - padding.bottom);
        ctx.stroke();

        // Y轴
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, this.canvas.height - padding.bottom);
        ctx.stroke();

        // X轴标签（刻度：0, 1000, 2000, 3000, 4000, 5000, 6000）
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const xSteps = [0, 1000, 2000, 3000, 4000, 5000, 6000];
        xSteps.forEach(dose => {
            const x = padding.left + (dose - range.xMin) / (range.xMax - range.xMin) * (this.canvas.width - padding.left - padding.right);
            ctx.fillText(dose.toString(), x, this.canvas.height - padding.bottom + 10);
        });

        // X轴标题
        ctx.fillText('Dose [cGy]', this.canvas.width / 2, this.canvas.height - 20);

        // Y轴标签（刻度：0, 20, 40, 60, 80, 100）
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const ySteps = [0, 20, 40, 60, 80, 100];
        ySteps.forEach(volume => {
            const y = this.canvas.height - padding.bottom - (volume - range.yMin) / (range.yMax - range.yMin) * (this.canvas.height - padding.top - padding.bottom);
            ctx.fillText(volume.toString(), padding.left - 10, y);
        });

        // Y轴标题
        ctx.save();
        ctx.translate(20, this.canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        const yLabel = this.settings.volumeType === 'relative' ? 'Volume [%]' : 'Volume [cm³]';
        ctx.fillText(yLabel, 0, 0);
        ctx.restore();
    }

    drawCurves(padding) {
        const ctx = this.ctx;

        this.dvhData.forEach(curve => {
            if (!curve.visible || !curve.points || curve.points.length === 0) return;

            const isHovered = this.hoveredCurve === curve;
            const isSelected = this.selectedCurve === curve;

            // 计算线宽
            let lineWidth = this.settings.lineWidth;
            if (this.settings.thickLineEnabled) {
                lineWidth += 1;
            }
            if (isHovered || isSelected) {
                lineWidth += 1;
            }

            ctx.strokeStyle = curve.color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();

            let isFirst = true;
            curve.points.forEach(point => {
                const screen = this.chartToScreen(point.dose, point.volume);
                
                if (isFirst) {
                    ctx.moveTo(screen.x, screen.y);
                    isFirst = false;
                } else {
                    ctx.lineTo(screen.x, screen.y);
                }
            });

            ctx.stroke();
        });
    }

    drawConstraintPoints(padding) {
        // TODO: 绘制优化约束点（箭头）
        this.constraintPoints.forEach(point => {
            const screen = this.chartToScreen(point.dose, point.volume);
            this.drawArrow(screen.x, screen.y, point.color);
        });
    }

    drawArrow(x, y, color) {
        const ctx = this.ctx;
        const size = 8;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - size, y - size);
        ctx.lineTo(x + size, y - size);
        ctx.closePath();
        ctx.fill();
    }

    drawSelectionBox() {
        if (!this.selectionStart || !this.selectionEnd) return;

        const ctx = this.ctx;
        const x1 = this.selectionStart.x;
        const y1 = this.selectionStart.y;
        const x2 = this.selectionEnd.x;
        const y2 = this.selectionEnd.y;

        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
            Math.min(x1, x2),
            Math.min(y1, y2),
            Math.abs(x2 - x1),
            Math.abs(y2 - y1)
        );
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(0, 170, 255, 0.1)';
        ctx.fillRect(
            Math.min(x1, x2),
            Math.min(y1, y2),
            Math.abs(x2 - x1),
            Math.abs(y2 - y1)
        );
    }

    drawCrosshair(padding) {
        if (!this.crosshairPos) return;

        const ctx = this.ctx;
        const screen = this.chartToScreen(this.crosshairPos.dose, this.crosshairPos.volume);

        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // 垂直线
        ctx.beginPath();
        ctx.moveTo(screen.x, padding.top);
        ctx.lineTo(screen.x, this.canvas.height - padding.bottom);
        ctx.stroke();

        // 水平线
        ctx.beginPath();
        ctx.moveTo(padding.left, screen.y);
        ctx.lineTo(this.canvas.width - padding.right, screen.y);
        ctx.stroke();

        ctx.setLineDash([]);

        // 绘制交点
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // ==================== 数据方法 ====================

    loadSampleData() {
        // 示例数据 - 复刻截图中的曲线
        this.dvhData = [
            // 主要的红色曲线 - 从100%开始，缓慢平滑下降，最后不连接到0
            {
                roiId: 'ptv',
                roiName: 'PTV',
                color: '#FF0000',
                visible: true,
                points: this.generateCumulativeDVH(100, 6000, 0.85, 4200, true) // 最后一个参数表示平滑曲线
            },
            // 快速下降的曲线 - 紫色
            {
                roiId: 'roi1',
                roiName: 'ROI-1',
                color: '#FF00FF',
                visible: true,
                points: this.generateCumulativeDVH(100, 6000, 0.08, 500)
            },
            // 快速下降的曲线 - 蓝色
            {
                roiId: 'roi2',
                roiName: 'ROI-2',
                color: '#0080FF',
                visible: true,
                points: this.generateCumulativeDVH(100, 6000, 0.12, 600)
            },
            // 快速下降的曲线 - 青色
            {
                roiId: 'roi3',
                roiName: 'ROI-3',
                color: '#00FFFF',
                visible: true,
                points: this.generateCumulativeDVH(100, 6000, 0.15, 700)
            },
            // 快速下降的曲线 - 绿色
            {
                roiId: 'roi4',
                roiName: 'ROI-4',
                color: '#00FF00',
                visible: true,
                points: this.generateCumulativeDVH(100, 6000, 0.18, 800)
            },
            // 快速下降的曲线 - 黄色
            {
                roiId: 'roi5',
                roiName: 'ROI-5',
                color: '#FFFF00',
                visible: true,
                points: this.generateCumulativeDVH(100, 6000, 0.20, 900)
            },
            // 快速下降的曲线 - 橙色
            {
                roiId: 'roi6',
                roiName: 'ROI-6',
                color: '#FF8000',
                visible: true,
                points: this.generateCumulativeDVH(100, 6000, 0.22, 1000)
            }
        ];
    }

    generateCumulativeDVH(maxVolume, maxDose, steepness, dropPoint, smoothTransition = false) {
        const points = [];
        const numPoints = 300; // 增加点数以获得更平滑的曲线

        // 确保所有曲线从同一个起点开始：(0, maxVolume)
        // 首先添加起点
        points.push({
            dose: 0,
            volume: maxVolume,
            volumeAbsolute: maxVolume * 10 / 100
        });

        // 如果提供了dropPoint，使用它来控制曲线下降位置
        if (dropPoint !== undefined) {
            if (smoothTransition) {
                // 平滑过渡模式：使用单一的平滑函数，确保整个曲线没有拐点
                // 使用改进的 Gompertz 函数或平滑的指数函数
                for (let i = 1; i < numPoints; i++) {
                    const dose = (i / numPoints) * maxDose;
                    
                    // 使用 smooth sigmoid 函数的变体，确保整个曲线都平滑
                    // 通过调整参数，让曲线从起点开始缓慢下降，然后逐渐加速，但不会有突变
                    
                    // 归一化剂量 (0-1)
                    const normalizedDose = dose / maxDose;
                    
                    // 使用双曲正切函数 (tanh) 的变体，它在整个范围内都是平滑的
                    // 调整参数让下降更平缓
                    const k = 3.5; // 控制下降速度，值越大下降越快
                    const x0 = 0.65; // 控制下降位置，在65%的位置开始明显下降
                    
                    // 使用平滑的 S 型曲线（基于 tanh）
                    const tanhValue = Math.tanh(k * (normalizedDose - x0));
                    // 将 tanh 的 (-1, 1) 范围映射到 (maxVolume, minVolume)
                    const minVolume = maxVolume * 0.02;
                    const volume = minVolume + (maxVolume - minVolume) * (1 - tanhValue) / 2;
                    
                    // 确保体积在合理范围内
                    const finalVolume = Math.max(minVolume, Math.min(maxVolume, volume));
                    
                    points.push({
                        dose: dose,
                        volume: finalVolume,
                        volumeAbsolute: finalVolume * 10 / 100
                    });
                }
                
                // 最后一点：平滑结束
                const lastVolume = points[points.length - 1].volume;
                points.push({
                    dose: maxDose,
                    volume: lastVolume,
                    volumeAbsolute: lastVolume * 10 / 100
                });
            } else {
                // 原始方法：快速下降的曲线
                for (let i = 1; i <= numPoints; i++) {
                    const dose = (i / numPoints) * maxDose;
                    const normalizedDose = (dose - dropPoint) / (dropPoint * steepness);
                    const volume = maxVolume / (1 + Math.exp(normalizedDose));
                    
                    points.push({
                        dose: dose,
                        volume: Math.max(0, volume),
                        volumeAbsolute: volume * 10 / 100
                    });
                }
            }
        } else {
            // 旧的方法（向后兼容）
            for (let i = 1; i <= numPoints; i++) {
                const dose = (i / numPoints) * maxDose;
                const volume = maxVolume / (1 + Math.exp((dose - maxDose * steepness) / (maxDose * 0.1)));
                
                points.push({
                    dose: dose,
                    volume: volume,
                    volumeAbsolute: volume * 10 / 100
                });
            }
        }

        return points;
    }

    setDVHData(data) {
        this.dvhData = data;
        this.draw();
    }

    setConstraintPoints(points) {
        this.constraintPoints = points;
        this.draw();
    }

    setCurveVisibility(roiId, visible) {
        const curve = this.dvhData.find(c => c.roiId === roiId);
        if (curve) {
            curve.visible = visible;
            this.draw();
        }
    }

    destroy() {
        // 清理事件监听器
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        this.canvas = null;
        this.ctx = null;
        this.container = null;
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.DVHComponent = DVHComponent;
}

