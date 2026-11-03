// 三维图形
// 公共弹窗：按参数生成长方体、球体、圆柱体，并写入新建或已有 ROI。
// 中心坐标可手填，也可选择当前 POI 列表中的已有点；不在本弹窗新建 POI。
// 选中 POI 后若再改 XYZ，或外部用 setCenter 回写十字线，则取消 POI 选中，坐标保留新值。
// 中心坐标允许落在图像范围外。十字线拖拽时由外部调用 setCenter({ x, y, z })。
// 轴向约定：长沿 X、宽沿 Y、高沿 Z；圆柱半径在 XY 平面、高度沿 Z；球体三向半径相同。
const THREE_D_SHAPE_ROI_TYPES = [
    'ORGAN', 'GTV', 'CTV', 'PTV', 'BODY', 'EXTERNAL',
    'CONTROL', 'AVOIDANCE', 'SUPPORT', 'BOLUS', 'MARKER',
    'CONTRAST_AGENT', 'CAVITY', 'DOSE_REGION', 'FIXATION',
    'IRRAD_VOLUME', 'TREATED_VOLUME', 'REGISTRATION', 'ISOCENTER', 'NONE'
];

const THREE_D_SHAPE_NAMES = {
    box: '长方体',
    sphere: '球体',
    cylinder: '圆柱体'
};

class ThreeDShapeModalComponent {
    constructor(options = {}) {
        const center = options.center || {};
        const size = options.size || {};
        const shapeAlias = {
            box: 'box',
            sphere: 'sphere',
            cylinder: 'cylinder',
            长方体: 'box',
            球体: 'sphere',
            圆柱体: 'cylinder'
        };

        this.options = {
            ...options,
            mountContainer: options.mountContainer || document.body,
            reopenable: !!options.reopenable,
            imageBounds: options.imageBounds || {
                x: { min: -50, max: 50 },
                y: { min: -50, max: 50 },
                z: { min: -50, max: 50 }
            },
            roiList: Array.isArray(options.roiList) ? options.roiList : [],
            poiList: Array.isArray(options.poiList) ? options.poiList : [],
            roiTypes: Array.isArray(options.roiTypes) && options.roiTypes.length
                ? options.roiTypes
                : THREE_D_SHAPE_ROI_TYPES,
            defaultExistingRoi: options.defaultExistingRoi || '',
            color: options.color || '#00e600',
            roiType: options.roiType || 'ORGAN',
            targetMode: options.targetMode === 'existing' ? 'existing' : 'new',
            onConfirm: typeof options.onConfirm === 'function' ? options.onConfirm : null,
            onCancel: typeof options.onCancel === 'function' ? options.onCancel : null,
            onCenterChange: typeof options.onCenterChange === 'function' ? options.onCenterChange : null
        };
        this.shapeType = shapeAlias[options.shapeType] || 'box';
        this.center = {
            x: this._finite(center.x, 0),
            y: this._finite(center.y, 0),
            z: this._finite(center.z, 0)
        };
        this.size = {
            length: this._finite(size.length, 5),
            width: this._finite(size.width, 5),
            height: this._finite(size.height, 5),
            radius: this._finite(size.radius, 5)
        };
        this.selectedPoiId = null;
        this.root = null;
        this.launcher = null;
        this.alert = null;
        this._onKey = null;
        this.ensureStyles();
    }

    ensureStyles() {
        let style = document.getElementById('three-d-shape-modal-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'three-d-shape-modal-styles';
            document.head.appendChild(style);
        }
        style.textContent = `
            .s3d-wrap {
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                padding: 20px 16px;
                font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
            }
            .s3d-dialog, .s3d-dialog * { box-sizing: border-box; }
            .s3d-dialog {
                width: min(500px, 100%);
                background: #1b1b1b;
                border: 1px solid #2c2c2c;
                border-radius: 4px;
                color: #ececec;
                box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
            }
            .s3d-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 14px 12px 4px 20px;
            }
            .s3d-title {
                margin: 0;
                font-size: 16px;
                font-weight: 500;
                color: #f2f2f2;
                letter-spacing: 0.2px;
            }
            .s3d-close {
                width: 32px;
                height: 32px;
                border: none;
                background: transparent;
                color: #c8c8c8;
                cursor: pointer;
                border-radius: 4px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .s3d-close:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
            .s3d-body { padding: 8px 28px 6px; }
            .s3d-type-row {
                display: grid;
                grid-template-columns: auto minmax(0, 1fr);
                align-items: center;
                column-gap: 14px;
            }
            .s3d-poi-row { margin: 0 0 12px; }
            .s3d-section-title {
                margin: 18px 0 12px;
                text-align: center;
                color: #8f8f8f;
                font-size: 13px;
                font-weight: 400;
            }
            .s3d-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                column-gap: 36px;
                row-gap: 12px;
            }
            .s3d-grid.is-hidden { display: none; }
            .s3d-metric {
                display: grid;
                grid-template-columns: 52px minmax(0, 1fr) 22px;
                align-items: center;
                column-gap: 6px;
            }
            .s3d-label {
                color: #f0f0f0;
                font-size: 14px;
                white-space: nowrap;
                text-align: left;
            }
            .s3d-req { color: #ff3b30; margin-left: 2px; }
            .s3d-unit { color: #d2d2d2; font-size: 13px; }
            .s3d-dialog button,
            .s3d-dialog input,
            .s3d-dialog select { font-family: inherit; }
            .s3d-input,
            .s3d-select {
                height: 32px;
                border: 1px solid #3a3a3a;
                border-radius: 2px;
                background: #2a2a2a;
                color: #f3f3f3;
                font-size: 14px;
                padding: 0 8px;
                outline: none;
                width: 100%;
            }
            .s3d-input::placeholder { color: #6d6d6d; }
            .s3d-input:focus,
            .s3d-select:focus {
                border-color: #2b9fff;
                box-shadow: 0 0 0 1px #2b9fff;
            }
            .s3d-select[data-field="shapeType"] {
                border-color: #2b9fff;
                box-shadow: 0 0 0 1px #2b9fff;
            }
            .s3d-input.is-locked,
            .s3d-select.is-locked {
                color: #6e6e6e;
                background-color: #232323;
                border-color: #333;
                box-shadow: none;
                pointer-events: none;
                cursor: not-allowed;
            }
            .s3d-input.is-invalid,
            .s3d-select.is-invalid { border-color: #ff4d4f; box-shadow: none; }
            .s3d-select {
                appearance: none;
                -webkit-appearance: none;
                color-scheme: dark;
                padding-right: 28px;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.2 L6 6.2 L11 1.2' fill='none' stroke='%23c8c8c8' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 10px center;
                cursor: pointer;
            }
            .s3d-select.is-locked {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.2 L6 6.2 L11 1.2' fill='none' stroke='%236e6e6e' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            }
            .s3d-radio {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                color: #f2f2f2;
                font-size: 14px;
                cursor: pointer;
                user-select: none;
            }
            .s3d-radio input {
                appearance: none;
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                margin: 0;
                border: 2px solid #8d8d8d;
                border-radius: 50%;
                background: transparent;
                display: grid;
                place-items: center;
                cursor: pointer;
                flex: 0 0 auto;
            }
            .s3d-radio input:checked { border-color: #2b9fff; }
            .s3d-radio input:checked::after {
                content: "";
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #2b9fff;
            }
            .s3d-target-fields {
                margin: 8px 0 14px;
                padding-left: 24px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .s3d-color-row {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .s3d-swatch {
                position: relative;
                width: 18px;
                height: 18px;
                border-radius: 2px;
                border: 1px solid rgba(255, 255, 255, 0.28);
                flex: 0 0 auto;
                cursor: pointer;
            }
            .s3d-swatch input[type="color"] {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                cursor: pointer;
                border: none;
                padding: 0;
            }
            .s3d-target-fields.is-disabled .s3d-swatch {
                opacity: 0.4;
                pointer-events: none;
            }
            .s3d-roi-type { width: 196px; flex: 0 0 auto; }
            .s3d-footer {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 6px;
                padding: 10px 16px 16px;
            }
            .s3d-btn-cancel {
                height: 32px;
                padding: 0 16px;
                border: none;
                background: transparent;
                color: #d6d6d6;
                font-size: 14px;
                cursor: pointer;
            }
            .s3d-btn-cancel:hover { color: #fff; }
            .s3d-btn-ok {
                height: 32px;
                min-width: 76px;
                padding: 0 18px;
                border: none;
                border-radius: 4px;
                background: #1f8fe6;
                color: #fff;
                font-size: 14px;
                cursor: pointer;
            }
            .s3d-btn-ok:hover { background: #3aa3f2; }
            .s3d-alert-mask {
                position: absolute;
                inset: 0;
                z-index: 3;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.45);
                padding: 16px;
            }
            .s3d-alert {
                width: min(420px, 100%);
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 4px;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
                color: #e6e6e6;
            }
            .s3d-alert-title {
                margin: 0;
                padding: 14px 18px 0;
                font-size: 16px;
                font-weight: 500;
                color: #f0f0f0;
            }
            .s3d-alert-body {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 16px 18px 8px;
                color: #d0d0d0;
                font-size: 14px;
                line-height: 1.6;
            }
            .s3d-alert-actions {
                display: flex;
                justify-content: flex-end;
                padding: 8px 16px 16px;
            }
            .s3d-launcher {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .s3d-launcher-btn {
                height: 36px;
                padding: 0 18px;
                border: none;
                border-radius: 4px;
                background: #1f8fe6;
                color: #fff;
                font-size: 14px;
                cursor: pointer;
            }
            .s3d-launcher-btn:hover { background: #3aa3f2; }
        `;
    }

    _finite(value, fallback) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    _mount() {
        return this.options.mountContainer || document.body;
    }

    _escape(value) {
        return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

    _fmt(value) {
        return this._finite(value, 0).toFixed(1);
    }

    show() {
        if (this.launcher) {
            this.launcher.remove();
            this.launcher = null;
        }
        if (this.root) return;
        this._render();
        this._bind();
        this._bindKey();
        const typeSelect = this.root.querySelector('[data-field="shapeType"]');
        if (typeSelect) typeSelect.focus();
    }

    hide() {
        this._unbindKey();
        if (this.root) {
            this.root.remove();
            this.root = null;
        }
        this.alert = null;
        if (this.options.reopenable) this._showLauncher();
    }

    destroy() {
        this._unbindKey();
        if (this.root) this.root.remove();
        this.root = null;
        this.alert = null;
        if (this.launcher) this.launcher.remove();
        this.launcher = null;
    }

    setCenter(center = {}) {
        let changed = false;
        ['x', 'y', 'z'].forEach((axis) => {
            if (center[axis] == null || !Number.isFinite(Number(center[axis]))) return;
            const value = Math.round(Number(center[axis]) * 10) / 10;
            if (Math.abs(value - this.center[axis]) > 0.001) changed = true;
            this.center[axis] = value;
            const input = this.root?.querySelector(`[data-axis="${axis}"]`);
            if (input && document.activeElement !== input) {
                input.value = value.toFixed(1);
                input.classList.remove('is-invalid');
            }
        });
        if (changed) this._clearPoiSelection();
    }

    setPoiList(list) {
        this.options.poiList = Array.isArray(list) ? list : [];
        this._fillPoiOptions();
        if (this.selectedPoiId && !this._findPoi(this.selectedPoiId)) this._clearPoiSelection();
    }

    setRoiList(list) {
        this.options.roiList = Array.isArray(list) ? list : [];
        this._fillExistingOptions();
    }

    _showLauncher() {
        const mount = this._mount();
        if (!mount || this.launcher) return;
        this.launcher = document.createElement('div');
        this.launcher.className = 's3d-launcher';
        this.launcher.innerHTML = `<button type="button" class="s3d-launcher-btn">打开三维图形</button>`;
        mount.appendChild(this.launcher);
        this.launcher.querySelector('button').addEventListener('click', () => this.show());
    }

    _applyWrapLayout() {
        const mount = this._mount();
        const pos = window.getComputedStyle(mount).position;
        if (pos === 'static') mount.style.position = 'relative';
        if (mount === document.body) {
            this.root.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.55);';
        } else {
            this.root.style.cssText = 'position:absolute;inset:0;z-index:20;background:rgba(0,0,0,0.28);';
        }
    }

    _roiTypeOptions() {
        const types = this.options.roiTypes.slice();
        if (!types.includes(this.options.roiType)) types.unshift(this.options.roiType);
        return types.map((type) => {
            const selected = type === this.options.roiType ? ' selected' : '';
            return `<option value="${this._escape(type)}"${selected}>${this._escape(type)}</option>`;
        }).join('');
    }

    _render() {
        const shape = this.shapeType;
        this.root = document.createElement('div');
        this.root.className = 's3d-wrap';
        this.root.setAttribute('role', 'presentation');
        this.root.innerHTML = `
            <div class="s3d-dialog" role="dialog" aria-modal="true" aria-labelledby="s3d-title" data-component="three-d-shape">
                <div class="s3d-header">
                    <h3 class="s3d-title" id="s3d-title">三维图形</h3>
                    <button type="button" class="s3d-close" data-action="close" aria-label="关闭">
                        <span class="mozi-ui-icon mozi-ui-icon-close-x" aria-hidden="true"></span>
                    </button>
                </div>
                <div class="s3d-body">
                    <div class="s3d-type-row">
                        <span class="s3d-label">类型<span class="s3d-req">*</span></span>
                        <select class="s3d-select" data-field="shapeType" aria-label="类型">
                            <option value="box"${shape === 'box' ? ' selected' : ''}>长方体</option>
                            <option value="cylinder"${shape === 'cylinder' ? ' selected' : ''}>圆柱体</option>
                            <option value="sphere"${shape === 'sphere' ? ' selected' : ''}>球体</option>
                        </select>
                    </div>

                    <div class="s3d-section-title">中心坐标</div>
                    <div class="s3d-type-row s3d-poi-row">
                        <span class="s3d-label">POI</span>
                        <select class="s3d-select" data-field="centerPoi" aria-label="POI">
                            <option value="">请选择POI</option>
                        </select>
                    </div>
                    <div class="s3d-grid">
                        ${this._metricHtml('X', 'x', this.center.x, true)}
                        ${this._metricHtml('Y', 'y', this.center.y, true)}
                        ${this._metricHtml('Z', 'z', this.center.z, true)}
                    </div>

                    <div class="s3d-section-title">尺寸参数</div>
                    <div class="s3d-grid${shape === 'box' ? '' : ' is-hidden'}" data-size-panel="box">
                        ${this._metricHtml('长', 'length', this.size.length, false)}
                        ${this._metricHtml('宽', 'width', this.size.width, false)}
                        ${this._metricHtml('高', 'height', this.size.height, false)}
                    </div>
                    <div class="s3d-grid${shape === 'sphere' ? '' : ' is-hidden'}" data-size-panel="sphere">
                        ${this._metricHtml('半径', 'radius', this.size.radius, false)}
                    </div>
                    <div class="s3d-grid${shape === 'cylinder' ? '' : ' is-hidden'}" data-size-panel="cylinder">
                        ${this._metricHtml('半径', 'radius', this.size.radius, false)}
                        ${this._metricHtml('高度', 'height', this.size.height, false)}
                    </div>

                    <div class="s3d-section-title">目标结构</div>
                    <label class="s3d-radio">
                        <input type="radio" name="s3d-target" value="new"${this.options.targetMode === 'new' ? ' checked' : ''}>
                        <span>新建结构<span class="s3d-req">*</span></span>
                    </label>
                    <div class="s3d-target-fields" data-target="new">
                        <input type="text" class="s3d-input" data-field="roiName" maxlength="50" placeholder="请输入结构名称" autocomplete="off" spellcheck="false">
                        <div class="s3d-color-row">
                            <label class="s3d-swatch" style="background:${this._escape(this.options.color)}" title="选择颜色">
                                <input type="color" data-field="roiColor" value="${this._colorValue(this.options.color)}" aria-label="颜色">
                            </label>
                            <select class="s3d-select s3d-roi-type" data-field="roiType" aria-label="ROI类型">
                                ${this._roiTypeOptions()}
                            </select>
                        </div>
                    </div>
                    <label class="s3d-radio">
                        <input type="radio" name="s3d-target" value="existing"${this.options.targetMode === 'existing' ? ' checked' : ''}>
                        <span>已有结构<span class="s3d-req">*</span></span>
                    </label>
                    <div class="s3d-target-fields" data-target="existing">
                        <select class="s3d-select" data-field="existingRoi" aria-label="已有结构">
                            <option value="">请选择结构</option>
                        </select>
                    </div>
                </div>
                <div class="s3d-footer">
                    <button type="button" class="s3d-btn-cancel" data-action="cancel">取消</button>
                    <button type="button" class="s3d-btn-ok" data-action="confirm">确定</button>
                </div>
            </div>
        `;
        this._mount().appendChild(this.root);
        this._applyWrapLayout();
        this._fillExistingOptions();
        this._fillPoiOptions();
        this._syncTargetMode();
    }

    _metricHtml(label, key, value, signed) {
        const attr = signed
            ? `data-axis="${key}" data-signed="1"`
            : `data-size-key="${key}"`;
        return `
            <label class="s3d-metric">
                <span class="s3d-label">${label}<span class="s3d-req">*</span></span>
                <input type="text" class="s3d-input" inputmode="decimal" autocomplete="off" ${attr} value="${this._fmt(value)}" aria-label="${label}">
                <span class="s3d-unit">cm</span>
            </label>
        `;
    }

    _colorValue(color) {
        const text = String(color || '').trim();
        return /^#[0-9a-fA-F]{6}$/.test(text) ? text : '#00e600';
    }

    _fillExistingOptions() {
        const select = this.root?.querySelector('[data-field="existingRoi"]');
        if (!select) return;
        const previous = select.value;
        const preferred = previous || this.options.defaultExistingRoi || '';
        const options = ['<option value="">请选择结构</option>'];
        this.options.roiList.forEach((roi, index) => {
            const id = roi.id != null && roi.id !== '' ? String(roi.id) : String(roi.name || index);
            const name = roi.name || id;
            options.push(`<option value="${this._escape(id)}">${this._escape(name)}</option>`);
        });
        select.innerHTML = options.join('');
        const match = this.options.roiList.find((roi, index) => {
            const id = roi.id != null && roi.id !== '' ? String(roi.id) : String(roi.name || index);
            return id === String(preferred) || String(roi.name) === String(preferred);
        });
        if (match) {
            const id = match.id != null && match.id !== '' ? String(match.id) : String(match.name);
            select.value = id;
        }
    }

    _poiId(poi, index) {
        if (!poi) return '';
        if (poi.id != null && poi.id !== '') return String(poi.id);
        return String(poi.name || index);
    }

    _poiCenter(poi) {
        const source = poi.center && typeof poi.center === 'object' ? poi.center : poi;
        return {
            x: Math.round(this._finite(source.x, 0) * 10) / 10,
            y: Math.round(this._finite(source.y, 0) * 10) / 10,
            z: Math.round(this._finite(source.z, 0) * 10) / 10
        };
    }

    _findPoi(id) {
        if (!id) return null;
        return this.options.poiList.find((poi, index) => this._poiId(poi, index) === String(id)) || null;
    }

    _fillPoiOptions() {
        const select = this.root?.querySelector('[data-field="centerPoi"]');
        if (!select) return;
        const preferred = this.selectedPoiId || '';
        const options = ['<option value="">请选择POI</option>'];
        this.options.poiList.forEach((poi, index) => {
            const id = this._poiId(poi, index);
            const name = poi.name || id;
            options.push(`<option value="${this._escape(id)}">${this._escape(name)}</option>`);
        });
        select.innerHTML = options.join('');
        select.value = this._findPoi(preferred) ? String(preferred) : '';
        if (!select.value) this.selectedPoiId = null;
    }

    _clearPoiSelection() {
        this.selectedPoiId = null;
        const select = this.root?.querySelector('[data-field="centerPoi"]');
        if (select && select.value) select.value = '';
    }

    _applyPoi(poi, id) {
        const center = this._poiCenter(poi);
        this.selectedPoiId = id;
        this.center = center;
        ['x', 'y', 'z'].forEach((axis) => {
            const input = this.root.querySelector(`[data-axis="${axis}"]`);
            if (!input) return;
            input.value = center[axis].toFixed(1);
            input.classList.remove('is-invalid');
        });
        if (typeof this.options.onCenterChange === 'function') {
            this.options.onCenterChange({ ...this.center });
        }
    }

    _bind() {
        this.root.querySelector('[data-action="close"]').addEventListener('click', () => this._cancel());
        this.root.querySelector('[data-action="cancel"]').addEventListener('click', () => this._cancel());
        this.root.querySelector('[data-action="confirm"]').addEventListener('click', () => this._confirm());

        this.root.querySelector('[data-field="shapeType"]').addEventListener('change', (event) => {
            this.shapeType = event.target.value;
            this.root.querySelectorAll('[data-size-panel]').forEach((panel) => {
                panel.classList.toggle('is-hidden', panel.dataset.sizePanel !== this.shapeType);
            });
        });

        this.root.querySelectorAll('input[name="s3d-target"]').forEach((radio) => {
            radio.addEventListener('change', () => this._syncTargetMode());
        });

        this.root.querySelectorAll('[data-axis], [data-size-key]').forEach((input) => {
            const signed = input.dataset.signed === '1';
            input.addEventListener('input', () => {
                const next = this._sanitizeNumeric(input.value, signed);
                if (next !== input.value) input.value = next;
                input.classList.remove('is-invalid');
                if (input.dataset.axis) this._clearPoiSelection();
            });
            input.addEventListener('blur', () => {
                const parsed = this._parseDecimal(input.value);
                if (!parsed.ok) return;
                input.value = parsed.value.toFixed(1);
                if (input.dataset.axis) {
                    this.center[input.dataset.axis] = parsed.value;
                    if (typeof this.options.onCenterChange === 'function') {
                        this.options.onCenterChange({ ...this.center });
                    }
                }
            });
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this._confirm();
                }
            });
        });

        const nameInput = this.root.querySelector('[data-field="roiName"]');
        nameInput.addEventListener('input', () => nameInput.classList.remove('is-invalid'));
        nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this._confirm();
            }
        });

        const colorInput = this.root.querySelector('[data-field="roiColor"]');
        colorInput.addEventListener('input', () => {
            colorInput.parentElement.style.background = colorInput.value;
        });

        this.root.querySelector('[data-field="existingRoi"]').addEventListener('change', (event) => {
            event.target.classList.remove('is-invalid');
        });

        this.root.querySelector('[data-field="centerPoi"]').addEventListener('change', (event) => {
            const poi = this._findPoi(event.target.value);
            if (!poi) {
                this.selectedPoiId = null;
                return;
            }
            this._applyPoi(poi, event.target.value);
        });
    }

    _lockField(selector, locked) {
        const el = this.root.querySelector(selector);
        if (!el) return;
        el.classList.toggle('is-locked', locked);
        el.tabIndex = locked ? -1 : 0;
        el.setAttribute('aria-disabled', locked ? 'true' : 'false');
    }

    _syncTargetMode() {
        if (!this.root) return;
        const mode = this.root.querySelector('input[name="s3d-target"]:checked')?.value || 'new';
        const isNew = mode === 'new';
        this._lockField('[data-field="roiName"]', !isNew);
        this._lockField('[data-field="roiColor"]', !isNew);
        this._lockField('[data-field="roiType"]', !isNew);
        this.root.querySelector('[data-target="new"]').classList.toggle('is-disabled', !isNew);
        this._lockField('[data-field="existingRoi"]', isNew);
    }

    _bindKey() {
        this._unbindKey();
        this._onKey = (event) => {
            if (event.key !== 'Escape') return;
            if (this.alert) {
                this._hideWarning();
                return;
            }
            this._cancel();
        };
        document.addEventListener('keydown', this._onKey);
    }

    _unbindKey() {
        if (!this._onKey) return;
        document.removeEventListener('keydown', this._onKey);
        this._onKey = null;
    }

    _cancel() {
        this.hide();
        if (typeof this.options.onCancel === 'function') this.options.onCancel();
    }

    _confirm() {
        const result = this._collect();
        if (!result.ok) {
            this._warn(result.message);
            if (result.focus) result.focus.focus();
            return;
        }
        const payload = result.value;
        this.hide();
        if (typeof this.options.onConfirm === 'function') this.options.onConfirm(payload);
    }

    _collect() {
        this.root.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
        const shapeType = this.root.querySelector('[data-field="shapeType"]').value;
        const center = {};
        for (const axis of ['x', 'y', 'z']) {
            const input = this.root.querySelector(`[data-axis="${axis}"]`);
            const parsed = this._parseDecimal(input.value);
            if (!parsed.ok) {
                input.classList.add('is-invalid');
                return { ok: false, message: `请填写${axis.toUpperCase()}坐标`, focus: input };
            }
            center[axis] = parsed.value;
            input.value = parsed.value.toFixed(1);
        }

        const sizeSpec = {
            box: [
                { key: 'length', label: '长' },
                { key: 'width', label: '宽' },
                { key: 'height', label: '高' }
            ],
            sphere: [{ key: 'radius', label: '半径' }],
            cylinder: [
                { key: 'radius', label: '半径' },
                { key: 'height', label: '高度' }
            ]
        }[shapeType];
        const panel = this.root.querySelector(`[data-size-panel="${shapeType}"]`);
        const size = {};
        for (const spec of sizeSpec) {
            const input = panel.querySelector(`[data-size-key="${spec.key}"]`);
            const parsed = this._parseDecimal(input.value);
            if (!parsed.ok) {
                input.classList.add('is-invalid');
                return { ok: false, message: `请填写${spec.label}`, focus: input };
            }
            if (parsed.value < 0 || parsed.value > 50) {
                input.classList.add('is-invalid');
                return { ok: false, message: `${spec.label}的可输入范围为 0.0～50.0 cm`, focus: input };
            }
            size[spec.key] = parsed.value;
            input.value = parsed.value.toFixed(1);
        }

        const mode = this.root.querySelector('input[name="s3d-target"]:checked')?.value || 'new';
        const target = { mode, name: '', color: '', roiType: '', roiId: '', roiName: '' };
        if (mode === 'new') {
            const nameInput = this.root.querySelector('[data-field="roiName"]');
            const name = nameInput.value.trim();
            if (!name) {
                nameInput.classList.add('is-invalid');
                return { ok: false, message: '请输入结构名称', focus: nameInput };
            }
            if (name.length > 50) {
                nameInput.classList.add('is-invalid');
                return { ok: false, message: '结构名称不能超过50个字符', focus: nameInput };
            }
            const duplicated = this.options.roiList.some((roi) => String(roi.name || '').trim() === name);
            if (duplicated) {
                nameInput.classList.add('is-invalid');
                return { ok: false, message: '结构名称已存在', focus: nameInput };
            }
            target.name = name;
            target.color = this.root.querySelector('[data-field="roiColor"]').value;
            target.roiType = this.root.querySelector('[data-field="roiType"]').value;
        } else {
            const select = this.root.querySelector('[data-field="existingRoi"]');
            const roi = this.options.roiList.find((item, index) => {
                const id = item.id != null && item.id !== '' ? String(item.id) : String(item.name || index);
                return id === select.value;
            });
            if (!roi) {
                select.classList.add('is-invalid');
                return { ok: false, message: '请选择结构', focus: select };
            }
            target.roiId = select.value;
            target.roiName = roi.name || '';
            target.color = roi.color || '';
            target.roiType = roi.type || '';
        }

        this.center = center;
        const poi = this._findPoi(this.selectedPoiId);
        const half = this._halfExtents(shapeType, size);
        const clipped = ['x', 'y', 'z'].some((axis) => {
            const bound = this._bound(axis);
            if (!bound) return false;
            return center[axis] - half[axis] < bound.min || center[axis] + half[axis] > bound.max;
        });

        return {
            ok: true,
            value: {
                shapeType,
                shapeName: THREE_D_SHAPE_NAMES[shapeType],
                center,
                centerPoi: poi ? { id: this.selectedPoiId, name: poi.name || '' } : null,
                size,
                target,
                replaceExisting: mode === 'existing',
                clipped
            }
        };
    }

    _halfExtents(shapeType, size) {
        if (shapeType === 'sphere') {
            return { x: size.radius, y: size.radius, z: size.radius };
        }
        if (shapeType === 'cylinder') {
            return { x: size.radius, y: size.radius, z: size.height / 2 };
        }
        return { x: size.length / 2, y: size.width / 2, z: size.height / 2 };
    }

    _bound(axis) {
        const bound = this.options.imageBounds?.[axis];
        if (!bound) return null;
        const min = Number(bound.min);
        const max = Number(bound.max);
        if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
        return { min, max };
    }

    _parseDecimal(raw) {
        const text = String(raw ?? '').trim();
        if (!text || text === '-' || text === '.' || text === '-.') return { ok: false };
        if (!/^-?\d+(\.\d+)?$/.test(text)) return { ok: false };
        const value = Math.round(Number(text) * 10) / 10;
        if (!Number.isFinite(value)) return { ok: false };
        return { ok: true, value };
    }

    _sanitizeNumeric(raw, signed) {
        let value = String(raw ?? '');
        value = signed ? value.replace(/[^\d.\-]/g, '') : value.replace(/[^\d.]/g, '');
        const negative = signed && value.startsWith('-');
        value = value.replace(/-/g, '');
        const parts = value.split('.');
        value = parts[0] + (parts.length > 1 ? `.${parts.slice(1).join('')}` : '');
        return (negative ? '-' : '') + value;
    }

    _warn(message) {
        this._hideWarning();
        this.alert = document.createElement('div');
        this.alert.className = 's3d-alert-mask';
        this.alert.innerHTML = `
            <div class="s3d-alert" role="alertdialog" aria-modal="true" aria-label="警告">
                <h3 class="s3d-alert-title">警告</h3>
                <div class="s3d-alert-body">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="#E74C3C" stroke-width="2"></circle>
                        <path d="M12 7v6" stroke="#E74C3C" stroke-width="2" stroke-linecap="round"></path>
                        <circle cx="12" cy="16.5" r="1" fill="#E74C3C"></circle>
                    </svg>
                    <div data-alert-message></div>
                </div>
                <div class="s3d-alert-actions">
                    <button type="button" class="s3d-btn-ok" data-alert-ok>确定</button>
                </div>
            </div>
        `;
        this.alert.querySelector('[data-alert-message]').textContent = message;
        this.root.appendChild(this.alert);
        const close = () => this._hideWarning();
        this.alert.querySelector('[data-alert-ok]').addEventListener('click', close);
        this.alert.addEventListener('click', (event) => {
            if (event.target === this.alert) close();
        });
        this.alert.querySelector('[data-alert-ok]').focus();
    }

    _hideWarning() {
        if (!this.alert) return;
        this.alert.remove();
        this.alert = null;
    }
}

if (typeof window !== 'undefined') {
    window.ThreeDShapeModalComponent = ThreeDShapeModalComponent;
}
