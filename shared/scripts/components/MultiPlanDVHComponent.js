/**
 * 多个计划 DVH
 * 在单个计划 DVH 基础上增加计划图例，并按计划线型叠加曲线
 */
class MultiPlanDVHComponent extends SinglePlanDVHComponent {
    constructor(containerId, options = {}) {
        super(containerId, {
            toolbarTitle: options.toolbarTitle || 'DVH',
            ...options
        });
    }

    init() {
        this.planMeta = [
            { planId: 'plan1', planName: 'Plan1', lineDash: [], colorHint: 'rgba(238,238,238,0.9)' },
            { planId: 'plan2', planName: 'Plan2', lineDash: [6, 4], colorHint: 'rgba(238,238,238,0.9)' },
            { planId: 'plan3', planName: 'Plan3', lineDash: [2, 4], colorHint: 'rgba(238,238,238,0.9)' }
        ];
        this.visiblePlans = new Set(this.planMeta.map((p) => p.planId));
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
        const legend = this.planMeta.map((plan) => {
            const dashClass = plan.lineDash.length === 0
                ? 'solid'
                : (plan.lineDash[0] >= 5 ? 'dashed' : 'dotted');
            return `
                <button type="button" class="dvh-plan-legend-item" data-plan-id="${plan.planId}"
                    aria-pressed="true" title="切换 ${plan.planName} 显隐">
                    <span class="dvh-plan-legend-name">${plan.planName}</span>
                    <span class="dvh-plan-legend-line dvh-plan-legend-line--${dashClass}"></span>
                </button>
            `;
        }).join('');

        return `
            <div class="dvh-plan-legend" id="${id}-plan-legend">${legend}</div>
            ${super.renderChromeBeforeCanvas()}
        `;
    }

    bindChromeEvents() {
        super.bindChromeEvents();

        const legend = document.getElementById(`${this.containerId}-plan-legend`);
        if (!legend) return;

        legend.querySelectorAll('.dvh-plan-legend-item').forEach((btn) => {
            btn.addEventListener('click', () => {
                const planId = btn.dataset.planId;
                if (!planId) return;

                if (this.visiblePlans.has(planId)) {
                    this.visiblePlans.delete(planId);
                    btn.setAttribute('aria-pressed', 'false');
                    btn.classList.add('is-hidden');
                } else {
                    this.visiblePlans.add(planId);
                    btn.setAttribute('aria-pressed', 'true');
                    btn.classList.remove('is-hidden');
                }

                this.applyPlanVisibility();
                this.draw();
            });
        });
    }

    applyPlanVisibility() {
        this.dvhData.forEach((curve) => {
            if (!curve.planId) return;
            curve.visible = this.visiblePlans.has(curve.planId);
        });
    }

    getQueryRoiList() {
        const seen = new Set();
        const list = [];
        this.dvhData.forEach((curve) => {
            if (!curve || !curve.roiId || seen.has(curve.roiId)) return;
            // 多计划下按 ROI 去重，不按计划拆
            seen.add(curve.roiId);
            list.push({ roiId: curve.roiId, roiName: curve.roiName || curve.roiId });
        });
        return list;
    }

    getSelectedQueryCurve() {
        const roiId = this.queryState.roiId;
        if (!roiId) return null;
        // 优先取当前可见的第一个计划曲线
        return this.dvhData.find((c) =>
            c.roiId === roiId && c.visible !== false && this.visiblePlans.has(c.planId)
        ) || this.dvhData.find((c) => c.roiId === roiId) || null;
    }

    loadSampleData() {
        const rois = [
            { roiId: 'lens_r', roiName: 'Lens_R', color: '#7EC8E3', steepness: 0.1, drop: 450 },
            { roiId: 'ptv', roiName: 'PTV', color: '#FF0000', steepness: 0.85, drop: 4200, smooth: true },
            { roiId: 'roi1', roiName: 'ROI-1', color: '#FF00FF', steepness: 0.08, drop: 500 },
            { roiId: 'roi2', roiName: 'ROI-2', color: '#0080FF', steepness: 0.12, drop: 600 },
            { roiId: 'roi3', roiName: 'ROI-3', color: '#00FFFF', steepness: 0.15, drop: 700 }
        ];

        const doseShifts = {
            plan1: 1.0,
            plan2: 0.92,
            plan3: 1.08
        };

        this.dvhData = [];
        this.planMeta.forEach((plan) => {
            const shift = doseShifts[plan.planId] || 1;
            rois.forEach((roi) => {
                const points = this.generateCumulativeDVH(
                    100,
                    6000,
                    roi.steepness,
                    Math.round(roi.drop * shift),
                    !!roi.smooth
                ).map((p) => ({
                    ...p,
                    dose: p.dose * shift
                }));

                this.dvhData.push({
                    roiId: roi.roiId,
                    roiName: roi.roiName,
                    color: roi.color,
                    visible: true,
                    planId: plan.planId,
                    planName: plan.planName,
                    lineDash: plan.lineDash.slice(),
                    points
                });
            });
        });

        this.applyPlanVisibility();
    }

    setDVHData(data) {
        // 允许外部传入已带 planId / lineDash 的曲线
        this.dvhData = (data || []).map((curve) => {
            const meta = this.planMeta.find((p) => p.planId === curve.planId);
            return {
                ...curve,
                lineDash: curve.lineDash || (meta ? meta.lineDash.slice() : []),
                planName: curve.planName || (meta ? meta.planName : curve.planId)
            };
        });
        this.applyPlanVisibility();
        this.syncQueryRoiOptions();
        this.draw();
    }
}

if (typeof window !== 'undefined') {
    window.MultiPlanDVHComponent = MultiPlanDVHComponent;
}
