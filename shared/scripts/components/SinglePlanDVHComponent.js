/**
 * 单个计划 DVH
 * 在 DVHComponent 基础上增加 ROI 查询栏：覆盖体积占比 / 覆盖体积 / 剂量
 */
class SinglePlanDVHComponent extends DVHComponent {
    constructor(containerId, options = {}) {
        super(containerId, {
            toolbarTitle: options.toolbarTitle || 'DVH',
            ...options
        });
    }

    init() {
        this.queryState = {
            roiId: null,
            volumePercent: '',
            volumeAbs: '',
            dose: '',
            syncing: false
        };
        this.render();
        this.setupCanvas();
        this.bindEvents();
        this.loadSampleData();
        this.syncQueryRoiOptions();
        this.draw();
    }

    renderChromeBeforeCanvas() {
        const id = this.containerId;
        return `
            <div class="dvh-query-bar" data-dvh-query="${id}">
                <div class="dvh-query-roi">
                    <select class="dvh-query-select" id="${id}-query-roi" aria-label="ROI"></select>
                    <i class="fas fa-chevron-down dvh-query-roi-caret" aria-hidden="true"></i>
                </div>
                <label class="dvh-query-field">
                    <span class="dvh-query-label">覆盖体积占比</span>
                    <span class="dvh-query-input-wrap">
                        <input type="number" class="dvh-query-input" id="${id}-query-vol-pct"
                            min="1" max="100" step="0.1" placeholder="[1-100]" />
                        <span class="dvh-query-unit">%</span>
                    </span>
                </label>
                <label class="dvh-query-field">
                    <span class="dvh-query-label">覆盖体积</span>
                    <span class="dvh-query-input-wrap">
                        <input type="number" class="dvh-query-input" id="${id}-query-vol-abs"
                            min="0.01" max="50000" step="0.01" placeholder="[0.01-50000]" />
                        <span class="dvh-query-unit">cm³</span>
                    </span>
                </label>
                <label class="dvh-query-field">
                    <span class="dvh-query-label">剂量</span>
                    <span class="dvh-query-input-wrap">
                        <input type="number" class="dvh-query-input" id="${id}-query-dose"
                            min="1" max="15000" step="1" placeholder="1-15000" />
                        <span class="dvh-query-unit">cGy</span>
                    </span>
                </label>
            </div>
        `;
    }

    bindChromeEvents() {
        const roiSelect = document.getElementById(`${this.containerId}-query-roi`);
        const volPct = document.getElementById(`${this.containerId}-query-vol-pct`);
        const volAbs = document.getElementById(`${this.containerId}-query-vol-abs`);
        const dose = document.getElementById(`${this.containerId}-query-dose`);

        if (roiSelect) {
            roiSelect.addEventListener('change', () => {
                this.queryState.roiId = roiSelect.value;
                this.clearQueryInputs();
            });
        }

        if (volPct) {
            volPct.addEventListener('change', () => this.handleQueryFromVolumePercent(volPct.value));
            volPct.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.handleQueryFromVolumePercent(volPct.value);
            });
        }

        if (volAbs) {
            volAbs.addEventListener('change', () => this.handleQueryFromVolumeAbs(volAbs.value));
            volAbs.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.handleQueryFromVolumeAbs(volAbs.value);
            });
        }

        if (dose) {
            dose.addEventListener('change', () => this.handleQueryFromDose(dose.value));
            dose.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.handleQueryFromDose(dose.value);
            });
        }
    }

    loadSampleData() {
        super.loadSampleData();
        // 设计稿默认 ROI：Lens_R
        this.dvhData.unshift({
            roiId: 'lens_r',
            roiName: 'Lens_R',
            color: '#7EC8E3',
            visible: true,
            points: this.generateCumulativeDVH(100, 6000, 0.1, 450)
        });
    }

    setDVHData(data) {
        super.setDVHData(data);
        this.syncQueryRoiOptions();
    }

    getQueryRoiList() {
        const seen = new Set();
        const list = [];
        this.dvhData.forEach((curve) => {
            if (!curve || !curve.roiId || seen.has(curve.roiId)) return;
            seen.add(curve.roiId);
            list.push({ roiId: curve.roiId, roiName: curve.roiName || curve.roiId });
        });
        return list;
    }

    syncQueryRoiOptions() {
        const select = document.getElementById(`${this.containerId}-query-roi`);
        if (!select) return;

        const rois = this.getQueryRoiList();
        const preferred = this.queryState.roiId || 'lens_r';
        const hasPreferred = rois.some((r) => r.roiId === preferred);
        this.queryState.roiId = hasPreferred ? preferred : (rois[0] ? rois[0].roiId : null);

        select.innerHTML = rois.map((r) =>
            `<option value="${r.roiId}" ${r.roiId === this.queryState.roiId ? 'selected' : ''}>${r.roiName}</option>`
        ).join('');
    }

    getSelectedQueryCurve() {
        const roiId = this.queryState.roiId;
        if (!roiId) return null;
        return this.dvhData.find((c) => c.roiId === roiId && c.visible !== false) || null;
    }

    clearQueryInputs() {
        this.queryState.volumePercent = '';
        this.queryState.volumeAbs = '';
        this.queryState.dose = '';
        this.writeQueryInputs();
    }

    writeQueryInputs() {
        this.queryState.syncing = true;
        const volPct = document.getElementById(`${this.containerId}-query-vol-pct`);
        const volAbs = document.getElementById(`${this.containerId}-query-vol-abs`);
        const dose = document.getElementById(`${this.containerId}-query-dose`);
        if (volPct) volPct.value = this.queryState.volumePercent;
        if (volAbs) volAbs.value = this.queryState.volumeAbs;
        if (dose) dose.value = this.queryState.dose;
        this.queryState.syncing = false;
    }

    interpolateDoseAtVolume(curve, volumePercent) {
        if (!curve || !curve.points || curve.points.length === 0) return null;
        const points = curve.points;
        // 积分 DVH：体积随剂量下降，按体积插值找剂量
        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i];
            const b = points[i + 1];
            const minV = Math.min(a.volume, b.volume);
            const maxV = Math.max(a.volume, b.volume);
            if (volumePercent < minV || volumePercent > maxV) continue;
            if (Math.abs(a.volume - b.volume) < 1e-6) return a.dose;
            const t = (volumePercent - a.volume) / (b.volume - a.volume);
            return a.dose + t * (b.dose - a.dose);
        }
        return null;
    }

    interpolateVolumeAtDose(curve, dose) {
        if (!curve || !curve.points || curve.points.length === 0) return null;
        const points = curve.points;
        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i];
            const b = points[i + 1];
            const minD = Math.min(a.dose, b.dose);
            const maxD = Math.max(a.dose, b.dose);
            if (dose < minD || dose > maxD) continue;
            if (Math.abs(a.dose - b.dose) < 1e-6) {
                return { volume: a.volume, volumeAbsolute: a.volumeAbsolute };
            }
            const t = (dose - a.dose) / (b.dose - a.dose);
            const volume = a.volume + t * (b.volume - a.volume);
            const volumeAbsolute = (a.volumeAbsolute || 0) + t * ((b.volumeAbsolute || 0) - (a.volumeAbsolute || 0));
            return { volume, volumeAbsolute };
        }
        return null;
    }

    handleQueryFromVolumePercent(raw) {
        if (this.queryState.syncing) return;
        const value = parseFloat(raw);
        if (!Number.isFinite(value) || value < 1 || value > 100) return;

        const curve = this.getSelectedQueryCurve();
        const dose = this.interpolateDoseAtVolume(curve, value);
        if (dose == null) return;

        const abs = curve && curve.points[0]
            ? (value / 100) * ((curve.points[0].volumeAbsolute || 0) / (curve.points[0].volume || 1) * 100)
            : value;
        // 用曲线上最近点的绝对体积比例更稳妥
        const nearest = this.findNearestPointOnCurve(curve, dose);
        this.queryState.volumePercent = value.toFixed(1);
        this.queryState.volumeAbs = nearest && nearest.volumeAbsolute != null
            ? Number(nearest.volumeAbsolute).toFixed(2)
            : abs.toFixed(2);
        this.queryState.dose = dose.toFixed(0);
        this.writeQueryInputs();
        this.highlightQueryPoint(curve, nearest || { dose, volume: value, volumeAbsolute: abs });
    }

    handleQueryFromVolumeAbs(raw) {
        if (this.queryState.syncing) return;
        const value = parseFloat(raw);
        if (!Number.isFinite(value) || value < 0.01 || value > 50000) return;

        const curve = this.getSelectedQueryCurve();
        if (!curve || !curve.points || !curve.points[0]) return;

        const ref = curve.points[0];
        const totalAbs = ref.volume > 0
            ? (ref.volumeAbsolute || 0) / (ref.volume / 100)
            : (ref.volumeAbsolute || 0);
        if (!(totalAbs > 0)) return;

        const volumePercent = (value / totalAbs) * 100;
        this.handleQueryFromVolumePercent(String(volumePercent));
        this.queryState.volumeAbs = value.toFixed(2);
        this.writeQueryInputs();
    }

    handleQueryFromDose(raw) {
        if (this.queryState.syncing) return;
        const value = parseFloat(raw);
        if (!Number.isFinite(value) || value < 1 || value > 15000) return;

        const curve = this.getSelectedQueryCurve();
        const hit = this.interpolateVolumeAtDose(curve, value);
        if (!hit) return;

        this.queryState.dose = value.toFixed(0);
        this.queryState.volumePercent = hit.volume.toFixed(1);
        this.queryState.volumeAbs = (hit.volumeAbsolute != null ? hit.volumeAbsolute : hit.volume).toFixed(2);
        this.writeQueryInputs();
        this.highlightQueryPoint(curve, {
            dose: value,
            volume: hit.volume,
            volumeAbsolute: hit.volumeAbsolute
        });
    }

    highlightQueryPoint(curve, point) {
        if (!curve || !point) return;
        this.hoveredCurve = curve;
        this.crosshairPos = point;
        const screen = this.chartToScreen(point.dose, point.volume);
        this.showTooltip(curve, point, screen.x, screen.y);
        this.draw();
    }
}

if (typeof window !== 'undefined') {
    window.SinglePlanDVHComponent = SinglePlanDVHComponent;
}
