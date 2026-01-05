/**
 * 光谱直方图组件
 * 用于显示ROI在能谱CT图像上的直方图分析
 */
class SpectralHistogramComponent {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'spectralHistogramContainer',
            prefix: options.prefix || 'spectralHistogram',
            ...options
        };
        
        this.modal = null;
        this.canvas = null;
        this.ctx = null;
        this.selectedRoi = null;
        this.selectedImage = null;
        this.histogramData = null;
        
        // 默认ROI列表
        this.roiList = ['PTV', 'GTV', 'CTV', 'OAR1', 'OAR2'];
        
        // 默认图像列表（能谱CT影像组）
        this.imageList = ['Iodine', 'Water', 'Calcium', 'HU'];
        
        // 当前图像类型和参数
        this.currentImageType = 'HU';
        this.xAxisLabel = 'HU值';
        this.xAxisMin = 0;
        this.xAxisMax = 4000;
    }
    
    /**
     * 显示光谱直方图弹窗
     */
    show() {
        this.createModal();
        this.setupCanvas();
        this.bindEvents();
        this.loadDefaultData();
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
        modal.className = 'spectral-histogram-modal';
        modal.style.display = 'block';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="spectral-histogram-overlay"></div>
            <div class="spectral-histogram-content">
                <div class="spectral-histogram-header">
                    <h3>光谱直方图</h3>
                    <button class="spectral-histogram-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="spectral-histogram-body">
                    <div class="spectral-histogram-controls">
                        <div class="spectral-histogram-form-group">
                            <label class="spectral-histogram-label">ROI:</label>
                            <select class="spectral-histogram-select" id="${this.options.prefix}RoiSelect">
                                ${this.roiList.map(roi => 
                                    `<option value="${roi}" ${roi === 'PTV' ? 'selected' : ''}>${roi}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="spectral-histogram-form-group">
                            <label class="spectral-histogram-label">图像:</label>
                            <select class="spectral-histogram-select" id="${this.options.prefix}ImageSelect">
                                ${this.imageList.map(img => 
                                    `<option value="${img}" ${img === 'Iodine' ? 'selected' : ''}>${img}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="spectral-histogram-chart">
                        <canvas id="${this.options.prefix}Canvas" width="800" height="400"></canvas>
                    </div>
                </div>
                <div class="spectral-histogram-footer">
                    <button class="spectral-histogram-btn spectral-histogram-cancel">取消</button>
                    <button class="spectral-histogram-btn spectral-histogram-export">导出</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
    }
    
    /**
     * 设置Canvas
     */
    setupCanvas() {
        this.canvas = document.getElementById(`${this.options.prefix}Canvas`);
        if (!this.canvas) {
            console.error('Canvas元素未找到');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // 设置Canvas尺寸
        const container = this.canvas.parentElement;
        if (container) {
            const rect = container.getBoundingClientRect();
            this.canvas.width = rect.width || 800;
            this.canvas.height = rect.height || 400;
        }
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.modal) return;
        
        const closeBtn = this.modal.querySelector('.spectral-histogram-close');
        const cancelBtn = this.modal.querySelector('.spectral-histogram-cancel');
        const exportBtn = this.modal.querySelector('.spectral-histogram-export');
        const overlay = this.modal.querySelector('.spectral-histogram-overlay');
        const roiSelect = document.getElementById(`${this.options.prefix}RoiSelect`);
        const imageSelect = document.getElementById(`${this.options.prefix}ImageSelect`);
        
        const closeModal = () => {
            this.hide();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        exportBtn.addEventListener('click', () => {
            this.exportHistogram();
        });
        
        // ROI选择变化
        roiSelect.addEventListener('change', (e) => {
            this.selectedRoi = e.target.value;
            this.updateHistogram();
        });
        
        // 图像选择变化
        imageSelect.addEventListener('change', (e) => {
            this.selectedImage = e.target.value;
            this.updateImageParameters(e.target.value);
            this.updateHistogram();
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
    
    /**
     * 更新图像参数（根据选择的图像类型）
     */
    updateImageParameters(imageType) {
        this.currentImageType = imageType;
        
        switch(imageType) {
            case 'Iodine':
                this.xAxisLabel = '碘浓度 (mg/ml)';
                this.xAxisMin = 40;
                this.xAxisMax = 180;
                break;
            case 'Water':
                this.xAxisLabel = '水浓度 (mg/ml)';
                this.xAxisMin = 0;
                this.xAxisMax = 1200;
                break;
            case 'Calcium':
                this.xAxisLabel = '钙浓度 (mg/ml)';
                this.xAxisMin = 0;
                this.xAxisMax = 500;
                break;
            case 'HU':
            default:
                this.xAxisLabel = 'HU值';
                // 从当前图像获取最大值和最小值
                // 这里应该从实际的图像数据中获取，目前使用默认值
                // TODO: 从当前能谱CT图像获取实际的HU值范围
                this.xAxisMin = this.getImageMinValue() || 0;
                this.xAxisMax = this.getImageMaxValue() || 4000;
                break;
        }
    }
    
    /**
     * 获取当前图像的最小值
     * 应该从实际的图像数据中获取
     */
    getImageMinValue() {
        // TODO: 从当前能谱CT图像获取最小值
        // 这里返回null，使用默认值
        return null;
    }
    
    /**
     * 获取当前图像的最大值
     * 应该从实际的图像数据中获取
     */
    getImageMaxValue() {
        // TODO: 从当前能谱CT图像获取最大值
        // 这里返回null，使用默认值
        return null;
    }
    
    /**
     * 加载默认数据
     */
    loadDefaultData() {
        this.selectedRoi = 'PTV';
        this.selectedImage = 'Iodine';
        this.updateImageParameters('Iodine');
        this.updateHistogram();
    }
    
    /**
     * 更新直方图
     */
    updateHistogram() {
        if (!this.canvas || !this.ctx) return;
        
        // 生成模拟数据
        this.histogramData = this.generateMockHistogramData();
        
        // 绘制直方图
        this.drawHistogram();
    }
    
    /**
     * 生成模拟直方图数据
     */
    generateMockHistogramData() {
        const data = [];
        const bins = this.xAxisMax - this.xAxisMin;
        const binSize = bins / 20; // 20个区间
        
        for (let i = 0; i < 20; i++) {
            const x = this.xAxisMin + i * binSize;
            // 生成随机体素数（模拟数据）
            const voxels = Math.floor(Math.random() * 400) + 20;
            data.push({ x, voxels });
        }
        
        return data;
    }
    
    /**
     * 绘制直方图
     */
    drawHistogram() {
        if (!this.ctx || !this.histogramData || this.histogramData.length === 0) return;
        
        const canvas = this.canvas;
        const ctx = this.ctx;
        const padding = { top: 40, right: 40, bottom: 60, left: 80 };
        const chartWidth = canvas.width - padding.left - padding.right;
        const chartHeight = canvas.height - padding.top - padding.bottom;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置背景
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格
        this.drawGrid(ctx, padding, chartWidth, chartHeight);
        
        // 绘制坐标轴
        this.drawAxes(ctx, padding, chartWidth, chartHeight);
        
        // 绘制直方图
        this.drawBars(ctx, padding, chartWidth, chartHeight);
    }
    
    /**
     * 绘制网格
     */
    drawGrid(ctx, padding, chartWidth, chartHeight) {
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        
        // 垂直网格线
        const xTicks = 15;
        for (let i = 0; i <= xTicks; i++) {
            const x = padding.left + (i / xTicks) * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + chartHeight);
            ctx.stroke();
        }
        
        // 水平网格线
        const yTicks = 8;
        for (let i = 0; i <= yTicks; i++) {
            const y = padding.top + (i / yTicks) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
        }
    }
    
    /**
     * 绘制坐标轴
     */
    drawAxes(ctx, padding, chartWidth, chartHeight) {
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartHeight);
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.stroke();
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.stroke();
        
        // X轴标签
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(this.xAxisLabel, padding.left + chartWidth / 2, padding.top + chartHeight + 20);
        
        // X轴刻度
        const xTicks = 15;
        for (let i = 0; i <= xTicks; i++) {
            const x = padding.left + (i / xTicks) * chartWidth;
            const value = this.xAxisMin + (this.xAxisMax - this.xAxisMin) * (i / xTicks);
            ctx.fillText(Math.round(value).toString(), x, padding.top + chartHeight + 5);
        }
        
        // Y轴标签
        ctx.save();
        ctx.translate(20, padding.top + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('体素个数', 0, 0);
        ctx.restore();
        
        // Y轴刻度
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const yTicks = 8;
        const maxVoxels = Math.max(...this.histogramData.map(d => d.voxels));
        for (let i = 0; i <= yTicks; i++) {
            const y = padding.top + chartHeight - (i / yTicks) * chartHeight;
            const value = Math.round((maxVoxels * i) / yTicks);
            ctx.fillText(value.toString(), padding.left - 10, y);
        }
    }
    
    /**
     * 绘制直方图柱状图
     */
    drawBars(ctx, padding, chartWidth, chartHeight) {
        if (!this.histogramData || this.histogramData.length === 0) return;
        
        const maxVoxels = Math.max(...this.histogramData.map(d => d.voxels));
        const barWidth = chartWidth / this.histogramData.length;
        
        ctx.fillStyle = '#00bcd4'; // 青色
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 1;
        
        this.histogramData.forEach((data, index) => {
            const x = padding.left + index * barWidth;
            const barHeight = (data.voxels / maxVoxels) * chartHeight;
            const y = padding.top + chartHeight - barHeight;
            
            // 绘制柱状图
            ctx.fillRect(x, y, barWidth - 2, barHeight);
            ctx.strokeRect(x, y, barWidth - 2, barHeight);
        });
    }
    
    /**
     * 导出直方图
     */
    exportHistogram() {
        if (!this.canvas) {
            alert('无法导出：Canvas未初始化');
            return;
        }
        
        // 创建下载链接
        this.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `光谱直方图_${this.selectedRoi}_${this.selectedImage}_${new Date().getTime()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    
    /**
     * 隐藏弹窗
     */
    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
    
    /**
     * 设置ROI列表
     */
    setRoiList(roiList) {
        this.roiList = roiList;
    }
    
    /**
     * 设置图像列表
     */
    setImageList(imageList) {
        this.imageList = imageList;
    }
}

// 导出组件
window.SpectralHistogramComponent = SpectralHistogramComponent;

