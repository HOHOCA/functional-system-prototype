/**
 * 文件信息组件（公共）
 * 展示序列/文件元数据；CT 扫描设备旁可打开「图像属性」弹窗。
 *
 * 用法：
 *   new FileInfoComponent('fileInfo', { type: 'CT' });
 *   fileInfoComponent.setType('RTSTRUCT');
 *   fileInfoComponent.setFields([...]);
 */
class FileInfoComponent {
    static DEFAULT_DATA = {
        CT: {
            title: '文件信息',
            fields: [
                { label: '数据类型', value: 'CT' },
                { label: '扫描设备', value: 'GE MEDICAL SYSTEMS', editable: true },
                { label: '患者摆位', value: 'Head First-Prone' },
                { label: '图像层数', value: '185' },
                { label: '拍摄时间', value: '2025-10-01 10:00:00' },
                { label: '序列号', value: '3' },
                { label: '序列ID', value: '1.2.586.698.5588456.636851.5' },
                { label: '序列描述', value: 'CT SIMoooooooooooooooo' },
                { label: '检查描述', value: 'xxxxx' }
            ]
        },
        RTSTRUCT: {
            title: '文件信息',
            fields: [
                { label: '数据类型', value: 'RTStruct' },
                { label: '创建者', value: 'xxxx' },
                { label: '创建时间', value: '2025-10-01 10:00:00' },
                { label: '序列号', value: '3' },
                { label: '序列ID', value: '1.2.586.698.5588456.636851.5' },
                { label: '序列描述', value: 'CT SIMoooooooooooooooo' },
                { label: '检查描述', value: 'xxxxx' },
                { label: '审批人', value: 'NONE' },
                { label: '审批时间', value: '2025-10-01 10:00:00' }
            ]
        },
        RTPLAN: {
            title: '文件信息',
            fields: [
                { label: '数据类型', value: 'RTPlan' },
                { label: '计划名称', value: 'Pelvis4ARC' },
                { label: '计划描述', value: 'xxxxxx' },
                { label: '治疗机器', value: 'Halycen' },
                { label: '辐射类型', value: 'PHOTON' },
                { label: '治疗技术', value: 'mARC' },
                { label: '剂型处方', value: '靶区_PTV，总剂量-5040，分次数-28' },
                { label: '审批人', value: 'xxxx' },
                { label: '审批时间', value: '2025-10-01 10:00:00' }
            ]
        }
    };

    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = Object.assign({
            prefix: '',
            title: '文件信息',
            type: 'CT',
            dataMap: null,
            showModal: true,
            ctImageLabel: 'CT 65',
            onConfirm: null
        }, options);

        this.dataMap = Object.assign({}, FileInfoComponent.DEFAULT_DATA, this.options.dataMap || {});
        this.currentType = this.options.type;
        this.fields = null;
        this.modalId = `${this.options.prefix}imagePropertiesModal`;
        this.uid = `${this.options.prefix}fileInfo_${Math.random().toString(36).slice(2, 8)}`;

        this.injectStyles();
        this.ensureModal();
        this.render();
        this.setType(this.currentType);
    }

    injectStyles() {
        if (document.getElementById('file-info-component-style')) return;
        const style = document.createElement('style');
        style.id = 'file-info-component-style';
        style.textContent = `

            .mozi-ui-icon-close-x { width: 12px; height: 12px; pointer-events: none; }
            .file-info-component {
                display: flex;
                flex-direction: column;
                min-height: 0;
                box-sizing: border-box;
            }
            .file-info-component .file-info-title {
                color: #ffffff;
                font-size: 14px;
                margin: 0 0 10px 0;
                font-weight: 600;
            }
            .file-info-component .info-grid {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .file-info-component .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 4px 0;
                gap: 12px;
            }
            .file-info-component .info-item .label {
                color: #888888;
                font-size: 12px;
                flex-shrink: 0;
            }
            .file-info-component .info-item .value {
                color: #ffffff;
                font-size: 12px;
                font-weight: 400;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
                min-width: 0;
                text-align: right;
                word-break: break-all;
            }
            .file-info-component .edit-icon-btn {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0;
                width: 18px;
                height: 18px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .file-info-component .edit-icon-btn .mozi-ui-icon-edit-props,
            .file-info-component .edit-icon-btn .mozi-ui-icon-ch-edit {
                width: 14px;
                height: 14px;
            }
            .file-info-component .edit-icon-btn:hover {
                opacity: 0.85;
            }
        `;
        document.head.appendChild(style);
    }

    getContainer() {
        return document.getElementById(this.containerId);
    }

    render() {
        const container = this.getContainer();
        if (!container) return;

        container.classList.add('file-info', 'file-info-component');
        container.innerHTML = `
            <h4 class="file-info-title">${this.options.title}</h4>
            <div class="info-grid" id="${this.uid}_grid"></div>
        `;
    }

    setType(type) {
        this.currentType = type;
        const pack = this.dataMap[type];
        if (!pack) return;
        this.options.title = pack.title || this.options.title;
        const titleEl = this.getContainer()?.querySelector('.file-info-title');
        if (titleEl) titleEl.textContent = this.options.title;
        this.setFields(pack.fields || []);
    }

    setFields(fields) {
        this.fields = Array.isArray(fields) ? fields : [];
        const grid = document.getElementById(`${this.uid}_grid`);
        if (!grid) return;

        grid.innerHTML = this.fields.map((field, index) => {
            const label = field.label || '';
            const value = field.value == null ? '' : String(field.value);
            if (field.editable) {
                return `
                    <div class="info-item">
                        <span class="label">${label}</span>
                        <span class="value">
                            <span data-role="editable-value">${value}</span>
                            <button type="button" class="edit-icon-btn" data-role="edit-props" data-field-index="${index}" title="更改图像属性">
                                <span class="mozi-ui-icon mozi-ui-icon-edit-props" aria-hidden="true"></span>
                            </button>
                        </span>
                    </div>
                `;
            }
            return `
                <div class="info-item">
                    <span class="label">${label}</span>
                    <span class="value">${value}</span>
                </div>
            `;
        }).join('');

        grid.querySelectorAll('[data-role="edit-props"]').forEach((btn) => {
            btn.addEventListener('click', () => this.openImageProperties());
        });
    }

    ensureModal() {
        if (!this.options.showModal) return;
        if (document.getElementById(this.modalId)) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = this.modalId;
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-dialog image-properties-dialog">
                <div class="modal-header">
                    <h3>图像属性</h3>
                    <button type="button" class="modal-close" data-role="close" title="关闭" aria-label="关闭"><span class="mozi-ui-icon mozi-ui-icon-close-x" aria-hidden="true"></span></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>CT图像</label>
                        <input type="text" data-role="ct-image" value="${this.options.ctImageLabel}" readonly class="form-input readonly">
                    </div>
                    <div class="form-group">
                        <label>扫描设备</label>
                        <select class="form-input" data-role="scan-device">
                            <option>GE MEDICAL SYSTEMS</option>
                            <option>SIEMENS</option>
                            <option>PHILIPS</option>
                        </select>
                        <p class="form-hint">根据DICOM数据中指定字段自动匹配扫描设备</p>
                    </div>
                    <div class="chart-section">
                        <h4>电子密度对照表</h4>
                        <p class="chart-subtitle">CT转电子密度</p>
                        <div class="chart-placeholder">
                            <canvas data-role="density-chart" width="600" height="300"></canvas>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-role="cancel">取消</button>
                    <button type="button" class="btn btn-primary" data-role="confirm">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const close = () => { modal.style.display = 'none'; };
        modal.querySelector('[data-role="close"]').addEventListener('click', close);
        modal.querySelector('[data-role="cancel"]').addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
        modal.querySelector('[data-role="confirm"]').addEventListener('click', () => {
            const select = modal.querySelector('[data-role="scan-device"]');
            const device = select ? select.value : '';
            const valueEl = this.getContainer()?.querySelector('[data-role="editable-value"]');
            if (valueEl && device) valueEl.textContent = device;
            if (typeof this.options.onConfirm === 'function') {
                this.options.onConfirm({ scanDevice: device });
            }
            close();
        });
    }

    openImageProperties() {
        if (!this.options.showModal) return;
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const valueEl = this.getContainer()?.querySelector('[data-role="editable-value"]');
        const select = modal.querySelector('[data-role="scan-device"]');
        if (select && valueEl) {
            const current = valueEl.textContent.trim();
            const opts = [...select.options];
            const match = opts.find((o) => o.value === current || o.textContent.trim() === current);
            if (match) select.value = match.value;
        }

        modal.style.display = 'flex';
        this.drawChart();
    }

    drawChart() {
        const modal = document.getElementById(this.modalId);
        const canvas = modal && modal.querySelector('[data-role="density-chart"]');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            const y = (height / 10) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.strokeStyle = '#249BD9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const points = [
            { x: 0, y: 0.5 },
            { x: 0.2, y: 0.45 },
            { x: 0.4, y: 0.4 },
            { x: 0.6, y: 0.35 },
            { x: 0.8, y: 0.3 },
            { x: 1, y: 0.25 }
        ];
        points.forEach((point, index) => {
            const x = point.x * width;
            const y = point.y * height;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }
}

window.FileInfoComponent = FileInfoComponent;
