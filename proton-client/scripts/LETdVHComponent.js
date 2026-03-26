/**
 * LETdVH Component
 * 说明：
 * - 复用 DVHComponent 的交互与绘制框架（曲线/十字线/框选缩放/最大化/右键菜单）
 * - 仅替换：横坐标（LETd）刻度/标题、tooltip 文案、示例数据 x 范围
 */
class LETdVHComponent extends DVHComponent {
    constructor(containerId, options = {}) {
        super(containerId, {
            toolbarTitle: options.toolbarTitle || 'LETdVH',
            ...options
        });
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

        const xMin = 0;
        const xMax = 10;
        const yMin = 0;
        const yMax = this.settings.volumeType === 'relative' ? 100 : 100;
        return { xMin, xMax, yMin, yMax };
    }

    drawGrid(padding) {
        const ctx = this.ctx;
        const range = this.getDataRange();

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        const chartWidth = this.canvas.width - padding.left - padding.right;
        const chartHeight = this.canvas.height - padding.top - padding.bottom;

        // 垂直网格线（X轴：每2 keV/μm 一条线）
        const xSteps = [0, 2, 4, 6, 8, 10];
        xSteps.forEach(letd => {
            const x = padding.left + (letd - range.xMin) / (range.xMax - range.xMin) * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, this.canvas.height - padding.bottom);
            ctx.stroke();
        });

        // 水平网格线（Y轴：每20%一条线）
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

        // X轴刻度（0,2,4,6,8,10）
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const xSteps = [0, 2, 4, 6, 8, 10];
        xSteps.forEach(letd => {
            const x = padding.left + (letd - range.xMin) / (range.xMax - range.xMin) * (this.canvas.width - padding.left - padding.right);
            ctx.fillText(letd.toString(), x, this.canvas.height - padding.bottom + 10);
        });

        // X轴标题
        ctx.fillText('LETd [keV/μm]', this.canvas.width / 2, this.canvas.height - 20);

        // Y轴刻度
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const ySteps = [0, 20, 40, 60, 80, 100];
        ySteps.forEach(volume => {
            const y = this.canvas.height - padding.bottom - (volume - range.yMin) / (range.yMax - range.yMin) * (this.canvas.height - padding.top - padding.bottom);
            ctx.fillText(volume.toString(), padding.left - 10, y);
        });

        // Y轴标题（沿用 DVH 逻辑：相对/绝对体积）
        ctx.save();
        ctx.translate(20, this.canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        const yLabel = this.settings.volumeType === 'relative' ? 'Volume [%]' : 'Volume [cm³]';
        ctx.fillText(yLabel, 0, 0);
        ctx.restore();
    }

    showTooltip(curve, point, screenX, screenY) {
        if (!this.tooltip) return;

        const letd = point.dose.toFixed(2);
        const volume = point.volume.toFixed(2);
        const volumeAbs = point.volumeAbsolute ? point.volumeAbsolute.toFixed(2) : '0.00';

        this.tooltip.innerHTML = `
            <div class="dvh-tooltip-header">
                <div class="dvh-tooltip-color-line" style="background: ${curve.color};"></div>
                <span class="dvh-tooltip-roi-name">${curve.roiName}</span>
            </div>
            <div class="dvh-tooltip-content">
                <div class="dvh-tooltip-row">V: ${volume}% (${volumeAbs}cm³)</div>
                <div class="dvh-tooltip-row">LETd: ${letd}keV/μm</div>
            </div>
        `;

        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (screenX + 15) + 'px';
        this.tooltip.style.top = (screenY - 10) + 'px';

        const rect = this.tooltip.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        if (rect.right > containerRect.right) {
            this.tooltip.style.left = (screenX - rect.width - 15) + 'px';
        }
        if (rect.bottom > containerRect.bottom) {
            this.tooltip.style.top = (screenY - rect.height - 10) + 'px';
        }
    }

    loadSampleData() {
        // 复刻 DVHComponent 的示例曲线形态，但将 x 范围缩放到 0~10（LETd）
        this.dvhData = [
            {
                roiId: 'planerEar_L',
                roiName: 'planerEar_L',
                color: '#FF66FF',
                visible: true,
                points: this.generateCumulativeDVH(100, 10, 0.22, 4.6, true)
            },
            {
                roiId: 'roi1',
                roiName: 'ROI-1',
                color: '#FF0000',
                visible: true,
                points: this.generateCumulativeDVH(100, 10, 0.08, 1.2)
            },
            {
                roiId: 'roi2',
                roiName: 'ROI-2',
                color: '#0080FF',
                visible: true,
                points: this.generateCumulativeDVH(100, 10, 0.12, 1.6)
            },
            {
                roiId: 'roi3',
                roiName: 'ROI-3',
                color: '#00FFFF',
                visible: true,
                points: this.generateCumulativeDVH(100, 10, 0.15, 1.8)
            },
            {
                roiId: 'roi4',
                roiName: 'ROI-4',
                color: '#00FF00',
                visible: true,
                points: this.generateCumulativeDVH(100, 10, 0.18, 2.0)
            },
            {
                roiId: 'roi5',
                roiName: 'ROI-5',
                color: '#FFFF00',
                visible: true,
                points: this.generateCumulativeDVH(100, 10, 0.20, 2.2)
            },
            {
                roiId: 'roi6',
                roiName: 'ROI-6',
                color: '#FF8000',
                visible: true,
                points: this.generateCumulativeDVH(100, 10, 0.22, 2.4)
            }
        ];
    }
}

if (typeof window !== 'undefined') {
    window.LETdVHComponent = LETdVHComponent;
}

