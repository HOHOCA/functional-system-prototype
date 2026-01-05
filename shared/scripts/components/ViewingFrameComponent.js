/**
 * 阅片框视图组件 - 支持分层显示的医学影像阅片框
 * 功能：
 * - 底层：CT影像
 * - 中间：ROI勾画
 * - 上层：剂量云图
 * - 最上层：束斑
 */
class ViewingFrameComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        
        this.options = {
            viewLabel: options.viewLabel || '2D',
            showTools: options.showTools !== false,
            defaultImageURL: options.defaultImageURL || null, // 默认图片URL（由调用方提供）
            ...options
        };

        // 数据存储
        this.imageData = null;           // CT影像数据（底层）
        this.imageURL = null;            // 图像URL（如果从URL加载）
        this.loadedImage = null;         // 加载的图像元素
        this.contours = [];              // ROI勾画数据（中间层）
        this.doseData = null;            // 剂量云图数据（上层）
        this.beamSpots = [];             // 束斑数据（最上层）

        // 渲染相关
        this.canvas = null;
        this.ctx = null;

        // 显示参数
        this.windowWidth = 400;          // 窗宽
        this.windowCenter = 40;          // 窗位
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;

        // 图层可见性
        this.layerVisibility = {
            image: true,
            contours: true,
            dose: true,
            beamSpots: true
        };

        // ROI颜色和可见性映射
        this.contourColors = new Map();
        this.contourVisibility = new Map();

        // 剂量相关
        this.doseColorMap = this.createDoseColorMap();
        this.doseOpacity = 0.6;
        this.isodoseLines = [20, 50, 90, 95, 100, 105];

        // 交互状态
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.isWheelZooming = false;

        // 初始化
        if (this.container) {
            this.init();
        }
    }

    init() {
        this.render();
        
        // 延迟设置canvas，确保容器已渲染
        setTimeout(() => {
            this.setupCanvas();
            this.bindEvents();
            
            // 如果有默认图片URL，优先加载
            if (this.options.defaultImageURL) {
                // 再延迟一点确保canvas完全设置好
                setTimeout(() => {
                    this.loadImageFromURL(this.options.defaultImageURL);
                }, 50);
            }
            // 不再创建默认图像，只显示加载的图片
        }, 50);
    }

    render() {
        if (!this.container) {
            console.error('Container not found:', this.containerId);
            return;
        }

        console.log('渲染组件HTML，容器:', this.container);
        this.container.innerHTML = `
            <div class="viewing-frame-container">
                <div class="viewing-frame-content">
                    <canvas id="${this.containerId}-canvas" class="viewing-frame-canvas"></canvas>
                </div>
            </div>
        `;
        console.log('HTML已渲染，Canvas ID:', `${this.containerId}-canvas`);
    }

    renderToolbar() {
        return `
            <div class="viewing-frame-toolbar">
                <button class="viewing-frame-tool-btn" title="缩放" data-tool="zoom">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button class="viewing-frame-tool-btn" title="平移" data-tool="pan">
                    <i class="fas fa-arrows-alt"></i>
                </button>
                <button class="viewing-frame-tool-btn" title="窗宽窗位" data-tool="window">
                    <i class="fas fa-adjust"></i>
                </button>
                <button class="viewing-frame-tool-btn" title="测量" data-tool="measure">
                    <i class="fas fa-ruler"></i>
                </button>
                <button class="viewing-frame-tool-btn" title="重置" data-tool="reset">
                    <i class="fas fa-redo"></i>
                </button>
            </div>
        `;
    }

    setupCanvas() {
        this.canvas = document.getElementById(`${this.containerId}-canvas`);
        if (!this.canvas) {
            console.warn('Canvas not found:', `${this.containerId}-canvas`);
            return;
        }

        const container = this.canvas.parentElement;
        if (!container) {
            console.warn('Canvas parent container not found');
            return;
        }
        
        // 检查容器的显示状态
        const imagePanel = container.closest('.image-panel');
        if (imagePanel) {
            const display = window.getComputedStyle(imagePanel).display;
            if (display === 'none') {
                console.log('面板是隐藏的，延迟设置Canvas');
                setTimeout(() => this.setupCanvas(), 100);
                return;
            }
        }
        
        const rect = container.getBoundingClientRect();
        console.log('setupCanvas - 容器尺寸:', rect.width, 'x', rect.height);
        
        // 确保canvas有有效尺寸
        if (rect.width <= 0 || rect.height <= 0) {
            console.warn('容器尺寸无效，延迟重试');
            setTimeout(() => this.resizeCanvas(), 100);
            return;
        }
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas已设置，尺寸:', this.canvas.width, 'x', this.canvas.height);
        
        // 如果已有图片，立即渲染
        if (this.loadedImage || this.imageData) {
            this.renderAll();
        }
    }

    bindEvents() {
        if (!this.canvas) return;

        // 工具栏按钮
        if (this.options.showTools) {
            const toolButtons = this.container.querySelectorAll('.viewing-frame-tool-btn');
            toolButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tool = btn.getAttribute('data-tool');
                    this.handleToolClick(tool, btn);
                });
            });
        }

        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    handleToolClick(tool, button) {
        // 更新按钮状态（可能在组件外部）
        if (button) {
            // 如果按钮在组件外部，需要找到对应的工具栏
            const toolbar = button.closest('.view-tabs-right') || this.container.querySelector('.viewing-frame-toolbar');
            if (toolbar) {
                const toolButtons = toolbar.querySelectorAll('.view-tool-btn, .viewing-frame-tool-btn');
                toolButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            }
        }

        // 设置当前工具
        this.currentTool = tool;

        switch(tool) {
            case 'zoom':
                this.canvas.style.cursor = 'zoom-in';
                break;
            case 'pan':
                this.canvas.style.cursor = 'grab';
                this.currentTool = 'pan';
                break;
            case 'window':
                this.showWindowLevelDialog();
                break;
            case 'measure':
                this.canvas.style.cursor = 'crosshair';
                break;
            case 'reset':
                this.resetView();
                break;
        }
    }

    handleMouseDown(e) {
        this.isDragging = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const dx = e.clientX - this.lastMousePos.x;
            const dy = e.clientY - this.lastMousePos.y;
            this.panX += dx;
            this.panY += dy;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.renderAll();
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.zoom = Math.max(0.1, Math.min(5.0, this.zoom + delta));
        this.renderAll();
    }

    showWindowLevelDialog() {
        // 窗宽窗位对话框（简化版）
        const width = prompt('请输入窗宽:', this.windowWidth);
        const center = prompt('请输入窗位:', this.windowCenter);
        if (width && center) {
            this.windowWidth = parseFloat(width) || 400;
            this.windowCenter = parseFloat(center) || 40;
            this.renderAll();
        }
    }

    resetView() {
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.renderAll();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        if (!container) return;
        
        // 检查容器的显示状态
        const imagePanel = container.closest('.image-panel');
        if (imagePanel) {
            const display = window.getComputedStyle(imagePanel).display;
            if (display === 'none') {
                console.log('面板是隐藏的，无法调整Canvas尺寸');
                return;
            }
        }
        
        const rect = container.getBoundingClientRect();
        console.log('resizeCanvas - 容器尺寸:', rect.width, 'x', rect.height);
        
        if (rect.width > 0 && rect.height > 0) {
            const oldWidth = this.canvas.width;
            const oldHeight = this.canvas.height;
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            console.log('Canvas尺寸已更新:', oldWidth, 'x', oldHeight, '->', this.canvas.width, 'x', this.canvas.height);
            this.renderAll();
        } else {
            console.warn('容器尺寸无效，延迟重试');
            setTimeout(() => this.resizeCanvas(), 100);
        }
    }

    createDefaultImage() {
        // 创建头部CT轴向切片的模拟图像
        const width = 512;
        const height = 512;
        const imageData = this.ctx.createImageData(width, height);
        const centerX = width / 2;
        const centerY = height / 2;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const dx = x - centerX;
                const dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                let gray = 0;
                
                // 颅骨（高密度，白色，外圈）
                const skullRadius = 220;
                const skullThickness = 15;
                if (dist >= skullRadius && dist <= skullRadius + skullThickness) {
                    gray = 200 + Math.random() * 30; // 颅骨高密度
                }
                // 大脑组织（中等密度，灰色）
                else if (dist < skullRadius) {
                    // 脑实质区域
                    gray = 80 + Math.sin(dist / 20) * 15;
                    
                    // 脑室和CSF（低密度，暗灰色）
                    const ventricleDist = Math.sqrt((dx * 0.8) ** 2 + (dy * 0.6) ** 2);
                    if (ventricleDist < 40) {
                        gray = 20 + Math.random() * 10;
                    }
                    
                    // 鼻窦和眼眶（低密度，黑色）
                    const nasalDist = Math.sqrt((dx * 0.5) ** 2 + (dy * 0.3) ** 2);
                    if (nasalDist < 60 && dy > -50) {
                        gray = 5 + Math.random() * 5;
                    }
                    
                    // 眼眶区域
                    const orbitLeft = Math.sqrt((dx - 80) ** 2 + (dy + 50) ** 2);
                    const orbitRight = Math.sqrt((dx + 80) ** 2 + (dy + 50) ** 2);
                    if (orbitLeft < 45 || orbitRight < 45) {
                        gray = 10 + Math.random() * 10;
                    }
                    
                    // 颞骨岩部（高密度）
                    const petrousLeft = Math.sqrt((dx - 120) ** 2 + (dy - 20) ** 2);
                    const petrousRight = Math.sqrt((dx + 120) ** 2 + (dy - 20) ** 2);
                    if (petrousLeft < 35 || petrousRight < 35) {
                        gray = 180 + Math.random() * 40;
                    }
                    
                    // 小脑区域（后部）
                    if (dy > 50 && dist < 150) {
                        gray = 70 + Math.sin((x + y) / 15) * 10;
                    }
                    
                    // 添加一些随机噪声模拟CT纹理
                    gray += (Math.random() - 0.5) * 8;
                }
                
                gray = Math.max(0, Math.min(255, gray));
                
                imageData.data[idx] = gray;
                imageData.data[idx + 1] = gray;
                imageData.data[idx + 2] = gray;
                imageData.data[idx + 3] = 255;
            }
        }
        
        this.imageData = imageData;
        this.renderAll();
    }

    createDoseColorMap() {
        return {
            20: 'rgba(0, 0, 255, 0.3)',
            50: 'rgba(0, 255, 255, 0.4)',
            90: 'rgba(0, 255, 0, 0.5)',
            95: 'rgba(255, 255, 0, 0.6)',
            100: 'rgba(255, 165, 0, 0.7)',
            105: 'rgba(255, 0, 0, 0.8)'
        };
    }

    /**
     * 渲染所有图层（按层级顺序）
     */
    renderAll() {
        if (!this.ctx || !this.canvas) {
            console.warn('renderAll - Canvas或Context不可用');
            return;
        }

        // 渲染开始

        // 清空画布 - 使用白色背景便于调试
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. 底层：CT影像（直接绘制，不使用变换）
        if (this.layerVisibility.image && (this.imageData || this.loadedImage || this.imageURL)) {
            this.renderImageLayer();
        }

        // 保存上下文状态（用于其他图层）
        this.ctx.save();

        // 应用变换（平移和缩放）- 用于其他图层
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.ctx.translate(centerX + this.panX, centerY + this.panY);
        this.ctx.scale(this.zoom, this.zoom);

        // 2. 中间层：ROI勾画
        if (this.layerVisibility.contours && this.contours.length > 0) {
            this.renderContourLayer();
        }

        // 3. 上层：剂量云图
        if (this.layerVisibility.dose && this.doseData) {
            this.renderDoseLayer();
        }

        // 4. 最上层：束斑
        if (this.layerVisibility.beamSpots && this.beamSpots.length > 0) {
            this.renderBeamSpotLayer();
        }

        // 恢复上下文状态
        this.ctx.restore();
    }

    /**
     * 渲染CT影像层（底层）
     */
    renderImageLayer() {
        if (!this.ctx || !this.canvas) {
            console.warn('renderImageLayer - Canvas或Context不可用');
            return;
        }

        // 优先显示加载的图像（从URL或文件加载）
        if (this.loadedImage && this.loadedImage.complete) {
            const img = this.loadedImage;
            const imgWidth = img.naturalWidth || img.width || 512;
            const imgHeight = img.naturalHeight || img.height || 512;
            
            // 计算自适应尺寸，保持宽高比
            const canvasWidth = this.canvas.width;
            const canvasHeight = this.canvas.height;
            
            console.log('renderImageLayer - 图片尺寸:', imgWidth, 'x', imgHeight);
            console.log('renderImageLayer - Canvas尺寸:', canvasWidth, 'x', canvasHeight);
            
            if (canvasWidth <= 0 || canvasHeight <= 0) {
                console.warn('Canvas尺寸无效，无法绘制图片');
                return;
            }
            
            const scaleX = canvasWidth / imgWidth;
            const scaleY = canvasHeight / imgHeight;
            const scale = Math.min(scaleX, scaleY); // 使用较小的缩放比例以保持宽高比
            
            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;
            
            // 计算居中位置
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            const drawX = centerX - scaledWidth / 2;
            const drawY = centerY - scaledHeight / 2;
            
            console.log('绘制图片 - 位置:', drawX.toFixed(0), ',', drawY.toFixed(0), '尺寸:', scaledWidth.toFixed(0), 'x', scaledHeight.toFixed(0));
            
            // 绘制图像（居中显示，使用自适应尺寸）
            try {
                // 先绘制一个测试矩形确认Canvas工作
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // 绘制图像
                this.ctx.drawImage(
                    img, 
                    drawX, 
                    drawY, 
                    scaledWidth, 
                    scaledHeight
                );
                console.log('✓ 图片绘制成功');
                
                // 绘制边框确认图片位置
                this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(drawX, drawY, scaledWidth, scaledHeight);
            } catch (e) {
                console.error('✗ 绘制图像失败:', e);
                console.error('错误详情:', e.message, e.stack);
            }
            return;
        }

        // 如果图像正在加载，等待加载完成
        if (this.imageURL && !this.loadedImage) {
            console.log('图片正在加载中...');
            return; // 图像还在加载中，等待onload事件
        }

        // 不显示默认ImageData，只显示加载的图片
        // 如果没有图片，不绘制任何内容（保持黑色背景）
        console.warn('没有可用的图片数据');
    }

    /**
     * 渲染ROI勾画层（中间层）
     */
    renderContourLayer() {
        if (!this.ctx) return;
        
        this.contours.forEach(contour => {
            if (!this.contourVisibility.get(contour.name) && this.contourVisibility.get(contour.name) !== undefined) {
                return;
            }
            
            const color = this.contourColors.get(contour.name) || '#ff6b6b';
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            if (contour.points && contour.points.length > 0) {
                // 计算图片在Canvas中的位置和缩放
                const canvasWidth = this.canvas.width;
                const canvasHeight = this.canvas.height;
                const centerX = canvasWidth / 2;
                const centerY = canvasHeight / 2;
                
                // 如果图片已加载，需要根据图片的实际显示尺寸计算坐标
                let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;
                
                if (this.loadedImage && this.loadedImage.complete) {
                    const imgWidth = this.loadedImage.naturalWidth || 512;
                    const imgHeight = this.loadedImage.naturalHeight || 512;
                    const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
                    const scaledWidth = imgWidth * scale;
                    const scaledHeight = imgHeight * scale;
                    offsetX = centerX - scaledWidth / 2;
                    offsetY = centerY - scaledHeight / 2;
                    scaleX = scale;
                    scaleY = scale;
                } else {
                    // 如果没有图片，假设图片尺寸为512x512
                    const scale = Math.min(canvasWidth / 512, canvasHeight / 512);
                    const scaledWidth = 512 * scale;
                    const scaledHeight = 512 * scale;
                    offsetX = centerX - scaledWidth / 2;
                    offsetY = centerY - scaledHeight / 2;
                    scaleX = scale;
                    scaleY = scale;
                }
                
                // 绘制轮廓（将ROI坐标转换为Canvas坐标）
                const firstPoint = contour.points[0];
                const canvasX = offsetX + firstPoint.x * scaleX;
                const canvasY = offsetY + firstPoint.y * scaleY;
                this.ctx.moveTo(canvasX, canvasY);
                
                for (let i = 1; i < contour.points.length; i++) {
                    const point = contour.points[i];
                    const x = offsetX + point.x * scaleX;
                    const y = offsetY + point.y * scaleY;
                    this.ctx.lineTo(x, y);
                }
                this.ctx.closePath();
                this.ctx.stroke();
            }
        });
    }

    /**
     * 渲染剂量云图层（上层）
     */
    renderDoseLayer() {
        if (!this.doseData) return;

        // 简化版剂量渲染：绘制等值线
        this.isodoseLines.forEach(percent => {
            const color = this.doseColorMap[percent] || 'rgba(255, 0, 0, 0.5)';
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1;
            this.ctx.globalAlpha = this.doseOpacity;
            
            // 这里应该根据实际的剂量数据绘制等值线
            // 简化示例：绘制一个圆形等值线
            const radius = 100 * (percent / 100);
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });

        this.ctx.globalAlpha = 1.0;
    }

    /**
     * 渲染束斑层（最上层）
     */
    renderBeamSpotLayer() {
        this.beamSpots.forEach(spot => {
            this.ctx.fillStyle = spot.color || '#00ff00';
            this.ctx.beginPath();
            this.ctx.arc(spot.x - 256, spot.y - 256, spot.radius || 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // ==================== 公共方法 ====================

    /**
     * 设置CT影像
     */
    setImageData(imageData) {
        this.imageData = imageData;
        this.imageURL = null;
        this.loadedImage = null;
        this.renderAll();
    }

    /**
     * 从URL加载图像（无论是否已有图片，都会替换）
     * @param {string} url - 图像URL（可以是data URL、blob URL或普通URL）
     */
    loadImageFromURL(url) {
        if (!url) return;
        
        // 清除所有现有图像数据，确保新图片会替换旧图片
        this.imageData = null;
        this.imageURL = url;
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            console.log('✓ 图片加载成功！');
            console.log('图片尺寸:', img.naturalWidth, 'x', img.naturalHeight);
            console.log('图片URL:', url);
            this.loadedImage = img;
            
            // 确保canvas已设置
            if (!this.ctx || !this.canvas) {
                console.log('设置Canvas...');
                this.setupCanvas();
            }
            
            // 如果canvas尺寸无效，调整尺寸
            if (this.canvas && (this.canvas.width <= 0 || this.canvas.height <= 0)) {
                console.log('Canvas尺寸无效，调整尺寸...', this.canvas.width, 'x', this.canvas.height);
                this.resizeCanvas();
            }
            
            // 多次尝试渲染，确保成功
            const tryRender = () => {
                if (this.ctx && this.canvas && this.canvas.width > 0 && this.canvas.height > 0) {
                    console.log('开始渲染图片，Canvas尺寸:', this.canvas.width, 'x', this.canvas.height);
                    this.renderAll();
                } else {
                    console.log('Canvas未准备好，延迟重试...', {
                        hasCtx: !!this.ctx,
                        hasCanvas: !!this.canvas,
                        canvasWidth: this.canvas?.width,
                        canvasHeight: this.canvas?.height
                    });
                    setTimeout(tryRender, 100);
                }
            };
            
            tryRender();
        };
        
        img.onerror = (error) => {
            console.error('图像加载失败:', url);
            console.error('错误原因: CORS策略阻止或文件不存在');
            console.error('解决方案: 请使用本地HTTP服务器运行，不要直接用file://打开');
            console.error('启动服务器命令: cd /Users/linanan/Desktop/proton && python3 -m http.server 8000');
            console.error('然后访问: http://localhost:8000');
            this.imageURL = null;
            this.loadedImage = null;
        };
        
        img.src = url;
    }

    /**
     * 从文件加载图像
     * @param {File} file - 图像文件
     */
    loadImageFromFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadImageFromURL(e.target.result);
        };
        reader.onerror = (error) => {
            console.error('文件读取失败:', error);
        };
        reader.readAsDataURL(file);
    }

    /**
     * 加载图像（支持ImageData、HTMLImageElement、ImageBitmap或URL）
     * @param {ImageData|HTMLImageElement|ImageBitmap|string} image - 图像数据或URL
     */
    loadImage(image) {
        if (typeof image === 'string') {
            this.loadImageFromURL(image);
        } else if (image instanceof ImageData) {
            this.setImageData(image);
        } else if (image instanceof HTMLImageElement || image instanceof ImageBitmap) {
            this.loadedImage = image;
            this.imageURL = null;
            this.imageData = null;
            this.renderAll();
        } else {
            console.warn('不支持的图像格式');
        }
    }

    /**
     * 添加ROI勾画
     */
    addContour(roiName, points, color) {
        this.contours.push({ name: roiName, points: points });
        this.contourColors.set(roiName, color);
        this.contourVisibility.set(roiName, true);
        this.renderAll();
    }

    /**
     * 设置ROI可见性
     */
    setContourVisibility(roiName, visible) {
        this.contourVisibility.set(roiName, visible);
        this.renderAll();
    }

    /**
     * 设置剂量数据
     */
    setDoseData(doseData) {
        this.doseData = doseData;
        this.renderAll();
    }

    /**
     * 添加束斑
     */
    addBeamSpot(x, y, color = '#00ff00', radius = 3) {
        this.beamSpots.push({ x, y, color, radius });
        this.renderAll();
    }

    /**
     * 设置图层可见性
     */
    setLayerVisibility(layer, visible) {
        if (this.layerVisibility.hasOwnProperty(layer)) {
            this.layerVisibility[layer] = visible;
            this.renderAll();
        }
    }

    /**
     * 设置窗宽窗位
     */
    setWindowLevel(width, center) {
        this.windowWidth = width;
        this.windowCenter = center;
        this.renderAll();
    }

    /**
     * 设置缩放
     */
    setZoom(zoom) {
        this.zoom = Math.max(0.1, Math.min(5.0, zoom));
        this.renderAll();
    }

    /**
     * 重置视图
     */
    resetView() {
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.renderAll();
    }
}

// 导出组件
window.ViewingFrameComponent = ViewingFrameComponent;

