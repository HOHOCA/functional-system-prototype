/**
 * 能谱线性分析组件
 * 用于显示能谱CT图像的线性分析，包括图像显示和距离-数值曲线图
 * 操作方式参照线剂量分布组件
 */
class SpectralLinearAnalysisComponent {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'spectralLinearAnalysisContainer',
            prefix: options.prefix || 'spectralLinearAnalysis',
            getCrosshairPosition: options.getCrosshairPosition || (() => ({ x: 0, y: 0 })),
            getCurrentSlice: options.getCurrentSlice || (() => ({ plane: 'Axial', slice: 71, total: 141 })),
            onClose: options.onClose || null,
            onExport: options.onExport || null,
            ...options
        };
        
        this.modal = null;
        this.imageCanvas = null;
        this.imageCtx = null;
        this.graphCanvas = null;
        this.graphCtx = null;
        this.selectedImage = null;
        this.selectedVariable = null;
        this.analysisLines = []; // 分析线列表
        this.currentView = 'Axial'; // 当前视图：Axial, Sagittal, Coronal
        this.isDrawing = false; // 是否正在绘制
        this.startPoint = null; // 绘制起点
        this.currentLine = null; // 当前正在绘制的线
        this.maxLines = 10; // 最大分析线数量
        
        // 默认图像列表
        this.imageList = ['Iodine no Water', 'Water', 'Calcium', 'HU'];
        
        // 默认变量列表
        this.variableList = ['碘', '水', '钙', 'HU'];
    }
    
    /**
     * 获取默认颜色
     */
    generateRandomColor() {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        return colors[this.analysisLines.length % colors.length];
    }
    
    /**
     * 显示能谱线性分析弹窗
     */
    show() {
        this.createModal();
        this.initCanvases();
        this.bindEvents();
        this.loadDefaultData();
        // 默认添加一条分析线
        this.addDefaultLine();
        this.render();
    }
    
    /**
     * 创建弹窗
     */
    createModal() {
        const modalId = `${this.options.prefix}Modal`;
        let modal = document.getElementById(modalId);
        
        if (modal) {
            modal.remove();
        }
        
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'spectral-linear-analysis-modal';
        modal.innerHTML = `
            <div class="spectral-linear-analysis-overlay"></div>
            <div class="spectral-linear-analysis-content">
                <div class="spectral-linear-analysis-header">
                    <h3>能谱线性分析</h3>
                    <div class="spectral-linear-analysis-controls">
                        <div class="spectral-linear-analysis-form-group">
                            <label class="spectral-linear-analysis-label">图像:</label>
                            <select class="spectral-linear-analysis-select" id="${this.options.prefix}ImageSelect">
                                ${this.imageList.map(img => 
                                    `<option value="${img}" ${img === 'Iodine no Water' ? 'selected' : ''}>${img}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="spectral-linear-analysis-form-group">
                            <label class="spectral-linear-analysis-label">变量1:</label>
                            <select class="spectral-linear-analysis-select" id="${this.options.prefix}VariableSelect">
                                ${this.variableList.map(v => 
                                    `<option value="${v}" ${v === '碘' ? 'selected' : ''}>${v}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <button class="spectral-linear-analysis-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="spectral-linear-analysis-body">
                    <div class="spectral-linear-analysis-left-panel">
                        <button class="spectral-linear-analysis-add-btn" id="${this.options.prefix}AddBtn">
                            <i class="fas fa-plus"></i>
                            <span>添加</span>
                        </button>
                        <div class="spectral-linear-analysis-table-container">
                            <table class="spectral-linear-analysis-table">
                                <thead>
                                    <tr>
                                        <th>序号</th>
                                        <th>显隐</th>
                                        <th>颜色</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody id="${this.options.prefix}TableBody">
                                    <!-- 动态生成 -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="spectral-linear-analysis-center-panel">
                        <div class="spectral-linear-analysis-view-tabs">
                            <button class="spectral-linear-analysis-tab active" data-view="Axial">Axial</button>
                            <button class="spectral-linear-analysis-tab" data-view="Sagittal">Sagittal</button>
                            <button class="spectral-linear-analysis-tab" data-view="Coronal">Coronal</button>
                            <div class="spectral-linear-analysis-view-tools">
                                <button class="spectral-linear-analysis-tool-btn" title="窗宽窗位">
                                    <i class="fas fa-adjust"></i>
                                </button>
                                <button class="spectral-linear-analysis-tool-btn" title="移动">
                                    <i class="fas fa-arrows-alt"></i>
                                </button>
                                <button class="spectral-linear-analysis-tool-btn" title="放大缩小">
                                    <i class="fas fa-search-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="spectral-linear-analysis-image-container">
                            <canvas id="${this.options.prefix}ImageCanvas" class="spectral-linear-analysis-canvas"></canvas>
                            <div class="spectral-linear-analysis-slice-info">Axial 71/141</div>
                        </div>
                    </div>
                    <div class="spectral-linear-analysis-right-panel">
                        <div class="spectral-linear-analysis-graph-header">
                            <div class="spectral-linear-analysis-line-colors" id="${this.options.prefix}LineColors">
                                <!-- 显示的分析线颜色 -->
                            </div>
                        </div>
                        <div class="spectral-linear-analysis-graph-container">
                            <canvas id="${this.options.prefix}GraphCanvas" class="spectral-linear-analysis-graph-canvas"></canvas>
                        </div>
                    </div>
                </div>
                <div class="spectral-linear-analysis-footer">
                    <button class="spectral-linear-analysis-btn spectral-linear-analysis-cancel">取消</button>
                    <button class="spectral-linear-analysis-btn spectral-linear-analysis-export">导出</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
    }
    
    /**
     * 初始化Canvas
     */
    initCanvases() {
        // 图像Canvas
        const imageCanvas = document.getElementById(`${this.options.prefix}ImageCanvas`);
        if (imageCanvas) {
            const container = imageCanvas.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                imageCanvas.width = rect.width || 600;
                imageCanvas.height = rect.height || 600;
            }
            this.imageCanvas = imageCanvas;
            this.imageCtx = imageCanvas.getContext('2d');
        }
        
        // 图表Canvas
        const graphCanvas = document.getElementById(`${this.options.prefix}GraphCanvas`);
        if (graphCanvas) {
            const container = graphCanvas.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                graphCanvas.width = rect.width || 400;
                graphCanvas.height = rect.height || 600;
            }
            this.graphCanvas = graphCanvas;
            this.graphCtx = graphCanvas.getContext('2d');
        }
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.modal) return;
        
        const closeBtn = this.modal.querySelector('.spectral-linear-analysis-close');
        const cancelBtn = this.modal.querySelector('.spectral-linear-analysis-cancel');
        const exportBtn = this.modal.querySelector('.spectral-linear-analysis-export');
        const overlay = this.modal.querySelector('.spectral-linear-analysis-overlay');
        const imageSelect = document.getElementById(`${this.options.prefix}ImageSelect`);
        const variableSelect = document.getElementById(`${this.options.prefix}VariableSelect`);
        const addBtn = document.getElementById(`${this.options.prefix}AddBtn`);
        const viewTabs = this.modal.querySelectorAll('.spectral-linear-analysis-tab');
        
        const closeModal = () => {
            this.hide();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        exportBtn.addEventListener('click', () => {
            this.handleExport();
        });
        
        // 图像选择变化
        imageSelect.addEventListener('change', (e) => {
            this.selectedImage = e.target.value;
            this.render();
        });
        
        // 变量选择变化
        variableSelect.addEventListener('change', (e) => {
            this.selectedVariable = e.target.value;
            this.render();
        });
        
        // 视图切换
        viewTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                viewTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                this.updateSliceInfo();
                this.render();
            });
        });
        
        // 添加按钮
        addBtn.addEventListener('click', () => {
            this.startDrawing();
        });
        
        // 图像Canvas事件
        if (this.imageCanvas) {
            this.imageCanvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
            this.imageCanvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
            this.imageCanvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
        }
        
        // ESC键关闭
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
    
    /**
     * 添加默认分析线
     */
    addDefaultLine() {
        const crosshair = this.options.getCrosshairPosition();
        const defaultLine = {
            id: Date.now(),
            sequence: 1,
            visible: true,
            color: this.generateRandomColor(),
            plane: this.currentView,
            startX: crosshair.x || 100,
            startY: crosshair.y || 100,
            endX: (crosshair.x || 100) + 10,
            endY: crosshair.y || 100,
            angle: 0,
            length: 10
        };
        
        this.analysisLines.push(defaultLine);
        this.updateLineSequences();
        this.renderLines();
        this.render();
    }
    
    /**
     * 开始绘制
     */
    startDrawing() {
        if (this.analysisLines.length >= this.maxLines) {
            alert(`最多只能添加${this.maxLines}条分析线`);
            return;
        }
        
        // 先创建一条新的分析线并添加到列表
        const newLine = {
            id: Date.now(),
            sequence: this.analysisLines.length + 1,
            visible: true,
            color: this.generateRandomColor(),
            plane: this.currentView,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            angle: 0,
            length: 0
        };
        
        this.analysisLines.push(newLine);
        this.updateLineSequences();
        this.renderLines();
        
        // 设置当前正在绘制的线
        this.currentLine = newLine;
        this.isDrawing = true;
        
        if (this.imageCanvas) {
            this.imageCanvas.style.cursor = 'crosshair';
        }
    }
    
    /**
     * 处理Canvas鼠标按下
     */
    handleCanvasMouseDown(e) {
        if (!this.isDrawing || !this.currentLine) return;
        
        const rect = this.imageCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.startPoint = { x, y };
        
        // 更新当前正在绘制的线的起点
        this.currentLine.startX = x;
        this.currentLine.startY = y;
        this.currentLine.endX = x;
        this.currentLine.endY = y;
    }
    
    /**
     * 处理Canvas鼠标移动
     */
    handleCanvasMouseMove(e) {
        if (!this.isDrawing || !this.startPoint) return;
        
        const rect = this.imageCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.currentLine) {
            this.currentLine.endX = x;
            this.currentLine.endY = y;
            
            // 计算角度和长度
            const dx = x - this.startPoint.x;
            const dy = y - this.startPoint.y;
            this.currentLine.length = Math.sqrt(dx * dx + dy * dy);
            this.currentLine.angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // 实时绘制预览
            this.renderImage();
            this.drawLinePreview(this.currentLine);
        }
    }
    
    /**
     * 处理Canvas鼠标释放
     */
    handleCanvasMouseUp(e) {
        if (!this.isDrawing || !this.startPoint || !this.currentLine) return;
        
        // 完成绘制
        this.updateLineSequences();
        this.renderLines();
        this.render();
        
        // 重置状态
        this.isDrawing = false;
        this.startPoint = null;
        this.currentLine = null;
        
        if (this.imageCanvas) {
            this.imageCanvas.style.cursor = 'default';
        }
        
        // 重新渲染
        this.renderImage();
    }
    
    /**
     * 绘制线条预览
     */
    drawLinePreview(line) {
        if (!this.imageCanvas || !this.imageCtx) return;
        
        this.imageCtx.strokeStyle = line.color;
        this.imageCtx.lineWidth = 2;
        this.imageCtx.setLineDash([5, 5]);
        this.imageCtx.beginPath();
        this.imageCtx.moveTo(line.startX, line.startY);
        this.imageCtx.lineTo(line.endX, line.endY);
        this.imageCtx.stroke();
        this.imageCtx.setLineDash([]);
    }
    
    /**
     * 加载默认数据
     */
    loadDefaultData() {
        this.selectedImage = 'Iodine no Water';
        this.selectedVariable = '碘';
        this.updateSliceInfo();
    }
    
    /**
     * 更新切片信息
     */
    updateSliceInfo() {
        const sliceInfo = this.options.getCurrentSlice();
        const sliceInfoEl = this.modal.querySelector('.spectral-linear-analysis-slice-info');
        if (sliceInfoEl) {
            sliceInfoEl.textContent = `${this.currentView} ${sliceInfo.slice}/${sliceInfo.total}`;
        }
    }
    
    /**
     * 渲染线条列表
     */
    renderLines() {
        const tbody = document.getElementById(`${this.options.prefix}TableBody`);
        if (!tbody) return;
        
        tbody.innerHTML = this.analysisLines.map((line, index) => `
            <tr class="spectral-linear-analysis-table-row ${index === 0 ? 'selected' : ''}" data-line-id="${line.id}">
                <td>${line.sequence}</td>
                <td>
                    <div class="spectral-linear-analysis-visibility-toggle ${line.visible ? 'visible' : ''}" data-line-id="${line.id}">
                        <i class="fas fa-circle"></i>
                    </div>
                </td>
                <td>
                    <div class="spectral-linear-analysis-color-indicator" style="background: ${line.color};"></div>
                </td>
                <td>
                    <button class="spectral-linear-analysis-delete-btn" data-line-id="${line.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // 绑定事件
        tbody.querySelectorAll('.spectral-linear-analysis-visibility-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const lineId = parseInt(toggle.getAttribute('data-line-id'));
                this.toggleLineVisibility(lineId);
            });
        });
        
        tbody.querySelectorAll('.spectral-linear-analysis-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const lineId = parseInt(btn.getAttribute('data-line-id'));
                this.deleteLine(lineId);
            });
        });
        
        tbody.querySelectorAll('.spectral-linear-analysis-table-row').forEach(row => {
            row.addEventListener('click', () => {
                const lineId = parseInt(row.getAttribute('data-line-id'));
                this.selectLine(lineId);
            });
        });
    }
    
    /**
     * 切换线条显隐
     */
    toggleLineVisibility(lineId) {
        const line = this.analysisLines.find(l => l.id === lineId);
        if (line) {
            line.visible = !line.visible;
            this.renderLines();
            this.render();
        }
    }
    
    /**
     * 删除线条
     */
    deleteLine(lineId) {
        this.analysisLines = this.analysisLines.filter(l => l.id !== lineId);
        this.updateLineSequences();
        this.renderLines();
        this.render();
    }
    
    /**
     * 选择线条
     */
    selectLine(lineId) {
        const line = this.analysisLines.find(l => l.id === lineId);
        if (line) {
            document.querySelectorAll('.spectral-linear-analysis-table-row').forEach(row => {
                row.classList.remove('selected');
            });
            document.querySelector(`[data-line-id="${lineId}"]`)?.classList.add('selected');
        }
    }
    
    /**
     * 更新线条序号
     */
    updateLineSequences() {
        this.analysisLines.forEach((line, index) => {
            line.sequence = index + 1;
        });
    }
    
    /**
     * 渲染所有内容
     */
    render() {
        this.renderImage();
        this.renderGraph();
        this.updateLineColors();
    }
    
    /**
     * 渲染图像
     */
    renderImage() {
        if (!this.imageCanvas || !this.imageCtx) return;
        
        const ctx = this.imageCtx;
        const canvas = this.imageCanvas;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制背景（模拟医学图像）
        this.drawBackground(ctx, canvas);
        
        // 绘制当前视图的分析线
        const planeLines = this.analysisLines.filter(line => line.plane === this.currentView && line.visible);
        planeLines.forEach(line => {
            this.drawLine(line, ctx);
        });
    }
    
    /**
     * 绘制背景
     */
    drawBackground(ctx, canvas) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制一些模拟的解剖结构
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width * 0.3, canvas.height * 0.4, 0, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    /**
     * 绘制线条
     */
    drawLine(line, ctx) {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(line.startX, line.startY);
        ctx.lineTo(line.endX, line.endY);
        ctx.stroke();
    }
    
    /**
     * 渲染图表
     */
    renderGraph() {
        if (!this.graphCanvas || !this.graphCtx) return;
        
        const ctx = this.graphCtx;
        const canvas = this.graphCanvas;
        const padding = 40;
        const graphWidth = canvas.width - padding * 2;
        const graphHeight = canvas.height - padding * 2;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制背景
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格和坐标轴
        this.drawGraphGrid(ctx, canvas, padding, graphWidth, graphHeight);
        
        // 绘制可见的分析线
        const visibleLines = this.analysisLines.filter(line => line.visible && line.plane === this.currentView);
        visibleLines.forEach(line => {
            this.drawGraphLine(line, ctx, padding, graphWidth, graphHeight, canvas.height);
        });
    }
    
    /**
     * 绘制图表网格和坐标轴
     */
    drawGraphGrid(ctx, canvas, padding, graphWidth, graphHeight) {
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        
        // 垂直网格线
        const xTicks = 5;
        for (let i = 0; i <= xTicks; i++) {
            const x = padding + (i / xTicks) * graphWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + graphHeight);
            ctx.stroke();
        }
        
        // 水平网格线
        const yTicks = 6;
        for (let i = 0; i <= yTicks; i++) {
            const y = padding + (i / yTicks) * graphHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + graphWidth, y);
            ctx.stroke();
        }
        
        // 绘制坐标轴
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(padding, padding + graphHeight);
        ctx.lineTo(padding + graphWidth, padding + graphHeight);
        ctx.stroke();
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + graphHeight);
        ctx.stroke();
        
        // X轴标签
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Distance [cm]', padding + graphWidth / 2, padding + graphHeight + 20);
        
        // X轴刻度
        for (let i = 0; i <= xTicks; i++) {
            const x = padding + (i / xTicks) * graphWidth;
            const value = i * 5; // 0, 5, 10, 15, 20, 25
            ctx.fillText(value.toString(), x, padding + graphHeight + 5);
        }
        
        // Y轴刻度
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= yTicks; i++) {
            const y = padding + graphHeight - (i / yTicks) * graphHeight;
            const value = i * 1000; // 0, 1000, 2000, 3000, 4000, 5000, 6000
            ctx.fillText(value.toString(), padding - 10, y);
        }
    }
    
    /**
     * 绘制图表中的折线
     */
    drawGraphLine(line, ctx, padding, graphWidth, graphHeight, canvasHeight) {
        // 根据线条长度生成数据点
        const points = 100;
        const maxValue = 6000;
        const xMax = 25;
        
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // 模拟数据：根据线条长度生成峰值曲线
        const peakX = (line.length / 100) * xMax; // 根据线条长度确定峰值位置
        const peakY = maxValue * 0.9; // 峰值
        
        for (let i = 0; i <= points; i++) {
            const x = padding + (i / points) * graphWidth;
            const t = i / points;
            const distance = t * xMax;
            
            // 模拟高斯分布曲线
            const value = peakY * Math.exp(-Math.pow((distance - peakX) / 5, 2));
            const y = (canvasHeight - padding) - (value / maxValue) * graphHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }
    
    /**
     * 更新线条颜色显示
     */
    updateLineColors() {
        const container = document.getElementById(`${this.options.prefix}LineColors`);
        if (!container) return;
        
        const visibleLines = this.analysisLines.filter(line => line.visible && line.plane === this.currentView);
        container.innerHTML = visibleLines.map(line => `
            <div class="spectral-linear-analysis-color-item">
                <div class="spectral-linear-analysis-color-dot" style="background: ${line.color};"></div>
                <span>Line ${line.sequence}</span>
            </div>
        `).join('');
    }
    
    /**
     * 处理导出
     */
    handleExport() {
        if (this.options.onExport) {
            this.options.onExport(this.analysisLines, this.currentView);
        } else {
            this.exportToCSV();
        }
    }
    
    /**
     * 导出为CSV
     */
    exportToCSV() {
        const visibleLines = this.analysisLines.filter(line => line.visible && line.plane === this.currentView);
        if (visibleLines.length === 0) {
            alert('没有可导出的分析线');
            return;
        }
        
        // 生成CSV内容
        let csv = '序号,起点X,起点Y,终点X,终点Y,角度,长度,颜色\n';
        visibleLines.forEach(line => {
            csv += `${line.sequence},${line.startX},${line.startY},${line.endX},${line.endY},${line.angle},${line.length},${line.color}\n`;
        });
        
        // 创建下载链接
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `spectral_linear_analysis_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * 隐藏弹窗
     */
    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
        if (this.options.onClose) {
            this.options.onClose();
        }
    }
    
    /**
     * 设置图像列表
     */
    setImageList(imageList) {
        this.imageList = imageList;
    }
    
    /**
     * 设置变量列表
     */
    setVariableList(variableList) {
        this.variableList = variableList;
    }
}

// 导出组件
window.SpectralLinearAnalysisComponent = SpectralLinearAnalysisComponent;
