/**
 * 计划库生成完成后的结果界面（全屏 / 嵌入式）：筛选区「治疗机」多选；临床目标项可勾选，滑块左右为演示用随机边界（约目标值 ±30% 包络内），中间为当前值；计划列表规则同前。
 */
class PlanLibraryGeneratedModalComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            onClose: null,
            /** @type {null|{ beams?: Array<{machine?:string,technique?:string,radiationType?:string}>, activeBeamIndex?: number }} */
            planLibraryData: null,
            ...options
        };
        this.root = null;
        this._railSubInstances = { roi: null, poi: null, dose: null };
        /** @type {Set<string>} */
        this._selectedMachines = new Set();
        /** @type {string[]} */
        this._machineFilterOrder = [];
        this._machinePanelBoundDocClose = null;
        this._machinePanelDocListenerAttached = false;
        /** 按射束索引缓存分数，避免筛选刷新时重算随机分 */
        this._planScoresByBeamIndex = new Map();
        /** 演示用：每个(计划/射束)在每个临床目标下的“达成值” */
        this._goalMetricByBeamGoalKey = new Map();
        /** 临床目标开关与阈值 */
        this._goalEnabledById = new Map();
        this._goalThresholdById = new Map();
        this._goalOpById = new Map();
        this._goalTargetById = new Map();
        this._goalBoundMinById = new Map();
        this._goalBoundMaxById = new Map();
        /** 3D/BEV/DVH/剂量统计/临床目标/射束列表/三视图 等子组件实例 */
        this._mainAreaInstances = {};
        /** @type {null|'PROTON'|'PHOTON'} */
        this._mainRadMode = null;
        this.ensureStyles();
    }

    escapeHtml(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    escapeAttr(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    /**
     * 计划显示名：计划类型_射束数量F_加速器名称；射束数量为当前「计划和射束信息」卡片总数。
     * 重名时依次追加全角括号序号（1）（2）…
     */
    /** @param {unknown} beams */
    static uniqueMachinesFromBeams(beams) {
        if (!Array.isArray(beams)) return [];
        const seen = new Set();
        const out = [];
        for (const b of beams) {
            const m = String(b?.machine ?? '').trim();
            if (m && !seen.has(m)) {
                seen.add(m);
                out.push(m);
            }
        }
        return out;
    }

    static buildPlanEntryDisplayNames(beams) {
        if (!Array.isArray(beams) || beams.length === 0) return [];
        const n = beams.length;
        const bases = beams.map((b) => {
            const tech = String(b?.technique ?? '').trim() || 'Unknown';
            const mach = String(b?.machine ?? '')
                .trim()
                .replace(/\s+/g, '_')
                .replace(/_+/g, '_');
            const machinePart = mach || 'Unknown';
            return `${tech}_${n}F_${machinePart}`;
        });
        const seen = new Map();
        return bases.map((base) => {
            const c = seen.get(base) ?? 0;
            seen.set(base, c + 1);
            if (c === 0) return base;
            return `${base}（${c}）`;
        });
    }

    /** 0–100 整数；每次打开结果窗为每条射束生成一次随机分，筛选刷新时同射束索引分数不变 */
    static randomPlanScore() {
        return Math.floor(Math.random() * 101);
    }

    /**
     * 分档配色：≥75 绿（优），45–74 黄（中），&lt;45 红（偏低）
     */
    static planScoreColorClass(score) {
        const s = Number(score);
        if (!Number.isFinite(s)) return 'plg-plan-score--mid';
        if (s >= 75) return 'plg-plan-score--high';
        if (s >= 45) return 'plg-plan-score--mid';
        return 'plg-plan-score--low';
    }

    setMachinePanelOpen(open) {
        const panel = this.root?.querySelector('[data-plg-ms-panel]');
        const trigger = this.root?.querySelector('[data-plg-ms-trigger]');
        if (!open) {
            if (this._machinePanelDocListenerAttached && this._machinePanelBoundDocClose) {
                document.removeEventListener('mousedown', this._machinePanelBoundDocClose, true);
                this._machinePanelDocListenerAttached = false;
            }
            panel?.setAttribute('hidden', '');
            trigger?.setAttribute('aria-expanded', 'false');
            return;
        }
        if (!panel || !trigger) return;
        panel.removeAttribute('hidden');
        trigger.setAttribute('aria-expanded', 'true');
        if (!this._machinePanelDocListenerAttached && this._machinePanelBoundDocClose) {
            document.addEventListener('mousedown', this._machinePanelBoundDocClose, true);
            this._machinePanelDocListenerAttached = true;
        }
    }

    refreshMachineFilterDisplay() {
        const order = this._machineFilterOrder.length
            ? this._machineFilterOrder
            : PlanLibraryGeneratedModalComponent.uniqueMachinesFromBeams(this.options.planLibraryData?.beams);
        const list = order.length ? order : ['HalcyonSN1057'];
        const sel = list.filter((m) => this._selectedMachines.has(m));
        const textEl = this.root?.querySelector('#plgMachineMsText');
        const badgeEl = this.root?.querySelector('#plgMachineMsBadge');
        if (!textEl || !badgeEl) return;
        if (sel.length === 0) {
            textEl.textContent = '请选择加速器';
            badgeEl.textContent = '+0';
            badgeEl.classList.remove('is-visible');
            return;
        }
        textEl.textContent = sel[0];
        const notShown = sel.length - 1;
        if (notShown > 0) {
            badgeEl.textContent = `+${notShown}`;
            badgeEl.classList.add('is-visible');
        } else {
            badgeEl.classList.remove('is-visible');
        }
        this.root?.querySelectorAll('.plg-machine-ms-option input[type="checkbox"]').forEach((inp) => {
            if (!(inp instanceof HTMLInputElement)) return;
            inp.checked = this._selectedMachines.has(inp.value);
        });
    }

    renderMachineFilterUI() {
        const mount = this.root?.querySelector('#plgMachineFilterMount');
        if (!mount) return;
        let machines = PlanLibraryGeneratedModalComponent.uniqueMachinesFromBeams(this.options.planLibraryData?.beams);
        if (machines.length === 0) machines = ['HalcyonSN1057'];
        this._machineFilterOrder = [...machines];
        this._selectedMachines = new Set(machines);

        const opts = machines
            .map(
                (m) => `
            <label class="plg-machine-ms-option">
                <input type="checkbox" checked value="${this.escapeAttr(m)}" />
                <span>${this.escapeHtml(m)}</span>
            </label>`
            )
            .join('');

        mount.innerHTML = `
            <span class="plg-label plg-label--inline">治疗机</span>
            <div class="plg-machine-ms" id="plgMachineMultiRoot">
                <button type="button" class="plg-machine-ms-trigger" data-plg-ms-trigger aria-haspopup="listbox" aria-expanded="false" aria-label="治疗机（多选）">
                    <span class="plg-machine-ms-text" id="plgMachineMsText"></span>
                    <span class="plg-machine-ms-badge" id="plgMachineMsBadge" aria-hidden="true">+0</span>
                    <span class="plg-machine-ms-chev" aria-hidden="true">▼</span>
                </button>
                <div class="plg-machine-ms-panel" data-plg-ms-panel hidden role="listbox" aria-label="加速器多选">
                    ${opts}
                </div>
            </div>
        `;

        const self = this;
        this._machinePanelBoundDocClose = function plgMsDocClose(e) {
            if (!self.root) return;
            const box = self.root.querySelector('#plgMachineMultiRoot');
            if (box && e.target instanceof Node && box.contains(e.target)) return;
            self.setMachinePanelOpen(false);
        };

        const trigger = mount.querySelector('[data-plg-ms-trigger]');
        const panel = mount.querySelector('[data-plg-ms-panel]');
        trigger?.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = panel?.hasAttribute('hidden');
            this.setMachinePanelOpen(!!isHidden);
        });
        panel?.addEventListener('change', (e) => {
            const t = e.target;
            if (!(t instanceof HTMLInputElement) || t.type !== 'checkbox') return;
            const v = t.value;
            if (t.checked) this._selectedMachines.add(v);
            else this._selectedMachines.delete(v);
            this.refreshMachineFilterDisplay();
            this.renderGeneratedPlanList();
        });
        panel?.addEventListener('mousedown', (e) => e.stopPropagation());

        this.refreshMachineFilterDisplay();
    }

    _getOrCreatePlanScore(beamIndex) {
        if (!this._planScoresByBeamIndex.has(beamIndex)) {
            this._planScoresByBeamIndex.set(beamIndex, PlanLibraryGeneratedModalComponent.randomPlanScore());
        }
        return this._planScoresByBeamIndex.get(beamIndex);
    }

    /**
     * 演示用：以临床目标数值 T 为中心，在约 [0.7T, 1.3T] 包络内随机取左右端点，再随机初始滑块位置。
     */
    static randomClinicalGoalSliderBounds(target) {
        const T = Number(target);
        if (!Number.isFinite(T) || T <= 0) return { min: 0, max: 100, val: 50 };
        const lo = T * (0.7 + Math.random() * 0.22);
        const hi = T * (1.08 + Math.random() * 0.22);
        let min = Math.min(lo, hi);
        let max = Math.max(lo, hi);
        if (max - min < T * 0.06) {
            min = T * 0.7;
            max = T * 1.3;
        }
        const val = min + Math.random() * (max - min);
        return { min, max, val };
    }

    formatClinicalGoalValue(n) {
        const x = Number(n);
        if (!Number.isFinite(x)) return '0.00';
        return x.toFixed(2);
    }

    _computeGoalThreshold(item, rangeValue01) {
        const minB = Number(item.getAttribute('data-plg-bound-min'));
        const maxB = Number(item.getAttribute('data-plg-bound-max'));
        const op = String(item.getAttribute('data-plg-op') ?? '<=');
        const p = Math.min(1, Math.max(0, Number(rangeValue01)));
        if (!Number.isFinite(minB) || !Number.isFinite(maxB) || maxB <= minB) return 0;
        const span = maxB - minB;
        // 期望交互：拖到最小(左) => 最宽松(全部满足)；拖到最大(右) => 最严格(仅少数满足)
        // - 对于 >= ：阈值越大越严格（常规正向映射）
        // - 对于 <= ：阈值越小越严格（反向映射）
        if (op.includes('>')) return minB + p * span;
        return maxB - p * span;
    }

    syncClinicalGoalSlider(item) {
        const range = item.querySelector('.plg-goal-range');
        const cur = item.querySelector('.plg-goal-vcur');
        if (!(range instanceof HTMLInputElement) || !cur) return;
        const p = Number(range.value) / 100;
        const thr = this._computeGoalThreshold(item, p);
        cur.textContent = this.formatClinicalGoalValue(thr);
        cur.style.left = '50%';
        const goalId = String(item.getAttribute('data-plg-goal-id') ?? '').trim();
        if (goalId) this._goalThresholdById.set(goalId, thr);
    }

    _beamGoalKey(beamIndex, goalId) {
        return `${beamIndex}::${goalId}`;
    }

    /**
     * 演示用：生成并缓存每个计划在每个目标下的“达成值”
     * - 对于 <= 类目标：值越小越好；对于 >= 类目标：值越大越好
     * - 分布刻意覆盖“达标/临界/不达标”，方便拖动阈值时列表变化明显
     */
    _getOrCreateGoalMetric(beamIndex, goalId) {
        const key = this._beamGoalKey(beamIndex, goalId);
        if (this._goalMetricByBeamGoalKey.has(key)) return this._goalMetricByBeamGoalKey.get(key);
        const target = Number(this._goalTargetById.get(goalId));
        const op = String(this._goalOpById.get(goalId) ?? '<=');
        const bmin = Number(this._goalBoundMinById.get(goalId));
        const bmax = Number(this._goalBoundMaxById.get(goalId));
        const T = Number.isFinite(target) && target > 0 ? target : 100;
        const r = Math.random();
        // 三段分布：大约 45% 明显达标，35% 临界，20% 明显不达标
        let metric;
        if (op.includes('>')) {
            if (r < 0.45) metric = T * (1.05 + Math.random() * 0.35); // 达标（高于阈值）
            else if (r < 0.8) metric = T * (0.9 + Math.random() * 0.25); // 临界
            else metric = T * (0.55 + Math.random() * 0.3); // 不达标
        } else {
            if (r < 0.45) metric = T * (0.55 + Math.random() * 0.3); // 达标（低于阈值）
            else if (r < 0.8) metric = T * (0.9 + Math.random() * 0.25); // 临界
            else metric = T * (1.05 + Math.random() * 0.35); // 不达标
        }
        // 关键：保证“最宽松端(滑块最左)”时不会因为演示值越界而误过滤
        if (Number.isFinite(bmin) && Number.isFinite(bmax) && bmax > bmin) {
            metric = Math.min(bmax, Math.max(bmin, metric));
        }
        this._goalMetricByBeamGoalKey.set(key, metric);
        return metric;
    }

    _beamMeetsAllEnabledGoals(beamIndex) {
        for (const [goalId, enabled] of this._goalEnabledById.entries()) {
            if (!enabled) continue;
            const op = String(this._goalOpById.get(goalId) ?? '<=');
            const thr = Number(this._goalThresholdById.get(goalId));
            const metric = Number(this._getOrCreateGoalMetric(beamIndex, goalId));
            if (!Number.isFinite(thr) || !Number.isFinite(metric)) continue;
            const ok = op.includes('>') ? metric >= thr : metric <= thr;
            if (!ok) return false;
        }
        return true;
    }

    initClinicalGoalFilters() {
        const items = this.root?.querySelectorAll('.plg-goal-item[data-plg-target]');
        if (!items?.length) return;
        items.forEach((item) => {
            const goalId = String(item.getAttribute('data-plg-goal-id') ?? '').trim();
            const op = String(item.getAttribute('data-plg-op') ?? '<=').trim() || '<=';
            const target = Number(item.getAttribute('data-plg-target'));
            if (goalId) {
                this._goalOpById.set(goalId, op);
                this._goalTargetById.set(goalId, target);
            }
            const { min, max } = PlanLibraryGeneratedModalComponent.randomClinicalGoalSliderBounds(target);
            const range = item.querySelector('.plg-goal-range');
            const vmin = item.querySelector('.plg-goal-vmin');
            const vmax = item.querySelector('.plg-goal-vmax');
            if (!(range instanceof HTMLInputElement) || !vmin || !vmax) return;
            // 滑块表示“严格度”：0(最宽松) → 100(最严格)
            item.setAttribute('data-plg-bound-min', String(min));
            item.setAttribute('data-plg-bound-max', String(max));
            if (goalId) {
                this._goalBoundMinById.set(goalId, min);
                this._goalBoundMaxById.set(goalId, max);
            }
            range.min = '0';
            range.max = '100';
            range.step = '1';
            range.value = String(Math.floor(20 + Math.random() * 30)); // 默认偏宽松，便于演示逐步收紧
            vmin.textContent = this.formatClinicalGoalValue(min);
            vmax.textContent = this.formatClinicalGoalValue(max);
            this.syncClinicalGoalSlider(item);
            range.addEventListener('input', () => {
                this.syncClinicalGoalSlider(item);
                this.renderGeneratedPlanList();
            });
            const cb = item.querySelector('.plg-goal-line input[type="checkbox"]');
            if (cb instanceof HTMLInputElement) {
                const syncDis = () => {
                    const on = cb.checked;
                    item.classList.toggle('is-goal-off', !on);
                    range.disabled = !on;
                    range.setAttribute('aria-disabled', on ? 'false' : 'true');
                    if (goalId) this._goalEnabledById.set(goalId, on);
                    this.renderGeneratedPlanList();
                };
                if (goalId) this._goalEnabledById.set(goalId, cb.checked);
                syncDis();
                cb.addEventListener('change', syncDis);
            }
        });
    }

    renderGeneratedPlanList() {
        const root = this.root?.querySelector('#plgGeneratedPlanListRoot');
        if (!root) return;
        const data = this.options.planLibraryData;
        const beams = data?.beams;
        if (!Array.isArray(beams) || beams.length === 0) {
            root.innerHTML = `<div class="plg-plan-empty">${this.escapeHtml('暂无计划（请在上一步添加「计划和射束信息」）')}</div>`;
            return;
        }
        const names = PlanLibraryGeneratedModalComponent.buildPlanEntryDisplayNames(beams);
        const visible = beams
            .map((b, i) => ({ b, i }))
            .filter(({ b }) => this._selectedMachines.has(String(b.machine ?? '').trim()))
            .filter(({ i }) => this._beamMeetsAllEnabledGoals(i));

        if (visible.length === 0) {
            const msg = this._selectedMachines.size === 0 ? '请至少选择一台治疗机' : '无满足当前筛选条件的计划';
            root.innerHTML = `<div class="plg-plan-empty">${this.escapeHtml(msg)}</div>`;
            return;
        }

        const origActive = Number.isFinite(Number(data?.activeBeamIndex)) ? Number(data.activeBeamIndex) : 0;
        let activeInList = visible.findIndex(({ i }) => i === origActive);
        if (activeInList < 0) activeInList = 0;

        root.innerHTML = visible
            .map(({ i }, visIdx) => {
                const name = names[i];
                const score = this._getOrCreatePlanScore(i);
                const tier = PlanLibraryGeneratedModalComponent.planScoreColorClass(score);
                const on = visIdx === activeInList;
                return `
            <div class="plg-plan-item ${on ? 'is-active' : ''}" role="option" aria-selected="${on ? 'true' : 'false'}" data-plg-plan-index="${i}">
                <span class="plg-plan-name">${this.escapeHtml(name)}</span>
                <span class="plg-plan-score ${tier}">${score}分</span>
            </div>`;
            })
            .join('');
    }

    ensureStyles() {
        const sid = 'plan-library-generated-modal-styles-v14';
        if (document.getElementById(sid)) return;
        document.getElementById('plan-library-generated-modal-styles-v1')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v2')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v3')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v4')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v5')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v6')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v7')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v8')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v9')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v10')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v11')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v12')?.remove();
        document.getElementById('plan-library-generated-modal-styles-v13')?.remove();
        const style = document.createElement('style');
        style.id = sid;
        style.textContent = `
            .plg-mask{
                font-family: 'Microsoft YaHei','PingFang SC',-apple-system,sans-serif;
                font-size: 12px;
                color: #ccc;
                background: rgba(0,0,0,0.75);
                display: flex;
                align-items: stretch;
                justify-content: stretch;
                box-sizing: border-box;
            }
            .plg-mask.embedded{ position: absolute; inset: 0; z-index: 10075; }
            .plg-mask.fixed{ position: fixed; inset: 0; z-index: 100000; }
            .plg-dialog{
                flex: 1;
                margin: 6px;
                min-height: 0;
                min-width: 0;
                background: #1a1a1a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 12px 40px rgba(0,0,0,0.45);
            }
            .plg-head{
                height: 40px;
                flex-shrink: 0;
                padding: 0 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #222;
                border-bottom: 1px solid #333;
            }
            .plg-head h2{ margin: 0; font-size: 15px; font-weight: 500; color: #f2f2f2; }
            .plg-close{
                border: none;
                background: transparent;
                color: #9a9a9a;
                width: 28px;
                height: 28px;
                border-radius: 4px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .plg-close:hover{ background: rgba(255,255,255,0.08); color: #fff; }
            .plg-body{
                flex: 1;
                min-height: 0;
                display: flex;
                flex-direction: row;
            }
            .plg-sidebar-wrap{
                display: flex;
                flex-direction: row;
                width: 304px;
                flex-shrink: 0;
                min-height: 0;
                border-right: 1px solid #333;
            }
            .plg-rail{
                width: 36px;
                flex-shrink: 0;
                background: #1e1e1e;
                border-right: 1px solid #333;
                display: flex;
                flex-direction: column;
                padding: 8px 0;
                gap: 4px;
                align-items: stretch;
            }
            .plg-rail-tab{
                writing-mode: vertical-rl;
                text-orientation: mixed;
                transform: matrix(-1, 0, 0, -1, 0, 0) rotate(180deg);
                font-size: 11px;
                color: #888;
                padding: 10px 4px;
                border-radius: 3px;
                cursor: pointer;
                letter-spacing: 0.02em;
                border: none;
                background: transparent;
                font: inherit;
                width: 100%;
                box-sizing: border-box;
                text-align: center;
            }
            .plg-rail-tab.is-active{
                background: rgba(58,172,222,0.18);
                color: #3aacde;
                font-weight: 500;
            }
            .plg-sidebar{
                flex: 1;
                min-width: 0;
                min-height: 0;
                background: #1f1f1f;
                display: flex;
                flex-direction: column;
            }
            .plg-sidebar-scroll{
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                flex-direction: column;
                overflow-x: hidden;
                overflow-y: auto;
                padding: 10px 12px 8px;
            }
            .plg-sidebar-scroll:has(#plg-panel-plan.is-active){
                overflow-y: hidden;
            }
            .plg-sidebar-panel{ display: none; }
            .plg-sidebar-panel.is-active{
                flex: 1 1 auto;
                min-height: 0;
                display: block;
                overflow: visible;
            }
            .plg-sidebar-panel[data-plg-panel="roi"].is-active,
            .plg-sidebar-panel[data-plg-panel="poi"].is-active,
            .plg-sidebar-panel[data-plg-panel="dose"].is-active{
                display: flex;
                flex-direction: column;
                overflow: visible;
            }
            .plg-sidebar-panel[data-plg-panel="roi"] .plg-sub-mount,
            .plg-sidebar-panel[data-plg-panel="poi"] .plg-sub-mount,
            .plg-sidebar-panel[data-plg-panel="dose"] .plg-sub-mount{
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                flex-direction: column;
                overflow: visible;
            }
            .plg-sidebar-panel[data-plg-panel="roi"] .roi-panel-container,
            .plg-sidebar-panel[data-plg-panel="poi"] .poi-panel-container{
                flex: 1 1 auto;
                min-height: 100%;
                max-height: none;
                overflow: visible;
            }
            .plg-sidebar-panel[data-plg-panel="dose"] .dose-panel-container{
                flex: 1 1 auto;
                min-height: 100%;
                max-height: none;
                overflow: visible;
            }
            .plg-sidebar-panel[data-plg-panel="roi"] .roi-list-section,
            .plg-sidebar-panel[data-plg-panel="poi"] .poi-list-section{
                flex: 0 0 auto;
                flex-grow: 0;
                min-height: 0;
                max-height: none;
                overflow: visible;
            }
            .plg-sidebar-panel[data-plg-panel="roi"] .roi-info-section,
            .plg-sidebar-panel[data-plg-panel="poi"] .poi-info-section{
                max-height: none;
                overflow: visible;
            }
            .plg-sidebar-panel[data-plg-panel="dose"] .dose-levels-section{
                flex: 0 0 auto;
                overflow: visible;
            }
            .plg-sidebar-panel[data-plg-panel="plan"].is-active{
                display: flex;
                flex-direction: column;
                flex: 1 1 auto;
                min-height: 0;
                overflow: hidden;
            }
            .plg-plan-split{
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                flex-direction: column;
                gap: 1px;
                background: #333;
            }
            .plg-plan-split-top,
            .plg-plan-split-bottom{
                flex: 1 1 0;
                min-height: 0;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: #1f1f1f;
            }
            .plg-plan-split-scroll{
                flex: 1;
                min-height: 0;
                overflow: hidden;
            }
            .plg-plan-split-scroll--static{
                display: flex;
                flex-direction: column;
            }
            .plg-sub-mount{ min-height: 80px; }
            .plg-sub-placeholder{
                padding: 12px 8px;
                color: #888;
                font-size: 12px;
                line-height: 1.5;
            }
            .plg-sec-title{
                padding: 10px 12px 6px;
                font-size: 13px;
                font-weight: 500;
                color: #e0e0e0;
            }
            .plg-filter-block{
                padding: 0 12px 12px;
                display: flex;
                flex-direction: column;
                min-height: 0;
            }
            .plg-row{ margin-bottom: 10px; }
            .plg-label{ display: block; color: #888; font-size: 11px; margin-bottom: 4px; }
            .plg-row--machine{
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
            }
            .plg-label--inline{
                display: block;
                flex-shrink: 0;
                width: 44px;
                margin-bottom: 0;
                line-height: 28px;
                color: #888;
                font-size: 11px;
            }
            .plg-machine-ms{
                flex: 1;
                min-width: 0;
                position: relative;
            }
            .plg-machine-ms-trigger{
                display: flex;
                align-items: center;
                gap: 6px;
                min-height: 28px;
                padding: 4px 8px;
                border-radius: 3px;
                border: 1px solid #454545;
                background: #262626;
                cursor: pointer;
                box-sizing: border-box;
                font-family: inherit;
                width: 100%;
                text-align: left;
            }
            .plg-machine-ms-trigger:hover{ border-color: #555; }
            .plg-machine-ms-trigger:focus{
                outline: none;
                border-color: #3aacde;
                box-shadow: 0 0 0 1px rgba(58,172,222,0.25);
            }
            .plg-machine-ms-text{
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #ddd;
                font-size: 11px;
            }
            .plg-machine-ms-badge{
                flex-shrink: 0;
                padding: 1px 5px;
                border-radius: 3px;
                background: #2a4a6a;
                color: #7eb8e8;
                font-size: 10px;
                line-height: 1.4;
                display: none;
            }
            .plg-machine-ms-badge.is-visible{ display: inline-block; }
            .plg-machine-ms-chev{
                flex-shrink: 0;
                color: #888;
                font-size: 9px;
                transform: scaleY(0.85);
            }
            .plg-machine-ms-panel{
                position: absolute;
                left: 0;
                right: 0;
                top: calc(100% + 2px);
                z-index: 20;
                max-height: 200px;
                overflow: auto;
                padding: 6px 0;
                border-radius: 3px;
                border: 1px solid #454545;
                background: #2a2a2a;
                box-shadow: 0 8px 20px rgba(0,0,0,0.45);
            }
            .plg-machine-ms-panel[hidden]{ display: none !important; }
            .plg-machine-ms-option{
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 10px;
                font-size: 11px;
                color: #ddd;
                cursor: pointer;
            }
            .plg-machine-ms-option:hover{ background: rgba(255,255,255,0.06); }
            .plg-machine-ms-option input{ flex-shrink: 0; }
            .plg-control{
                flex: 1;
                min-width: 0;
                padding: 5px 8px;
                border-radius: 3px;
                border: 1px solid #454545;
                background: #262626;
                color: #ddd;
                font-size: 11px;
                font-family: inherit;
            }
            .plg-goal-item{
                margin-top: 10px;
                padding: 8px;
                border-radius: 4px;
                background: #252525;
                border: 1px solid #383838;
            }
            .plg-goal-scroll{
                flex: 1 1 auto;
                min-height: 0;
                overflow-x: hidden;
                overflow-y: auto;
                padding-right: 2px;
            }
            .plg-goal-line{
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 11px;
                color: #bbb;
                line-height: 1.4;
            }
            .plg-goal-line input{ margin-top: 2px; flex-shrink: 0; cursor: pointer; }
            .plg-swatch{ width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; margin-top: 2px; border: 1px solid rgba(255,255,255,0.2); }
            .plg-goal-item.is-goal-off .plg-goal-slider{
                opacity: 0.42;
                pointer-events: none;
            }
            .plg-goal-slider{ margin-top: 8px; padding: 0 2px 4px; }
            .plg-goal-track-wrap{
                position: relative;
                height: 22px;
                display: flex;
                align-items: center;
            }
            .plg-goal-range{
                width: 100%;
                height: 20px;
                margin: 0;
                padding: 0;
                background: transparent;
                cursor: pointer;
                -webkit-appearance: none;
                appearance: none;
            }
            .plg-goal-range:disabled{ cursor: not-allowed; }
            .plg-goal-range::-webkit-slider-runnable-track{
                height: 2px;
                background: #4a7a92;
                border-radius: 1px;
            }
            .plg-goal-range::-webkit-slider-thumb{
                -webkit-appearance: none;
                width: 12px;
                height: 12px;
                margin-top: -5px;
                border-radius: 50%;
                background: #7ec8ea;
                border: 1px solid rgba(255,255,255,0.35);
                box-shadow: 0 0 0 1px rgba(0,0,0,0.3);
            }
            .plg-goal-range::-moz-range-track{
                height: 2px;
                background: #4a7a92;
                border-radius: 1px;
            }
            .plg-goal-range::-moz-range-thumb{
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #7ec8ea;
                border: 1px solid rgba(255,255,255,0.35);
            }
            .plg-goal-scale{
                position: relative;
                height: 16px;
                margin-top: 2px;
                font-size: 9px;
                line-height: 1.2;
            }
            .plg-goal-vmin{
                position: absolute;
                left: 0;
                top: 0;
                color: #888;
            }
            .plg-goal-vmax{
                position: absolute;
                right: 0;
                top: 0;
                color: #888;
            }
            .plg-goal-vcur{
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                color: #7ec8ea;
                font-weight: 500;
                white-space: nowrap;
                text-align: center;
            }
            .plg-plan-head{
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 12px 6px;
            }
            .plg-plan-list-scroll{
                flex: 1 1 auto;
                min-height: 0;
                overflow-x: hidden;
                overflow-y: auto;
            }
            .plg-plan-head span{ font-size: 13px; font-weight: 500; color: #e0e0e0; }
            .plg-plan-head button{
                border: none;
                background: transparent;
                color: #3aacde;
                cursor: pointer;
                padding: 4px;
            }
            .plg-plan-item{
                margin: 4px 8px;
                padding: 10px 10px;
                border-radius: 4px;
                border: 1px solid #383838;
                background: #242424;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
            }
            .plg-plan-item.is-active{
                border-color: #2a7fad;
                background: rgba(58,172,222,0.12);
                box-shadow: inset 0 0 0 1px rgba(58,172,222,0.25);
            }
            .plg-plan-name{ color: #ddd; font-size: 12px; flex: 1; min-width: 0; word-break: break-all; }
            .plg-plan-score{
                font-size: 12px;
                flex-shrink: 0;
                font-weight: 600;
                letter-spacing: 0.02em;
            }
            .plg-plan-score--high{ color: #5cb85c; }
            .plg-plan-score--mid{ color: #e8c547; }
            .plg-plan-score--low{ color: #d9534f; }
            .plg-plan-empty{
                padding: 16px 12px;
                color: #777;
                font-size: 12px;
                line-height: 1.5;
            }
            #plgGeneratedPlanListRoot{ min-height: 0; }
            .plg-main{
                flex: 1;
                min-width: 0;
                min-height: 0;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
                padding: 1px;
                background: #333;
            }
            .plg-main-grid{
                flex: 1;
                min-height: 0;
                min-width: 0;
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
                gap: 1px;
                background: #333;
            }
            .plg-main-cell{
                min-width: 0;
                min-height: 0;
                background: #161616;
                overflow: auto;
            }
            .plg-pane{
                height: 100%;
                display: flex;
                flex-direction: column;
                min-height: 0;
                min-width: 0;
            }
            /* 参考 plc-bottom-tabs 视觉：下划线式 tab */
            .plg-pane-tabs{
                flex-shrink: 0;
                display: flex;
                gap: 0;
                align-items: stretch;
                border-bottom: 1px solid #2c2c2c;
                background: #1a1a1a;
            }
            .plg-pane-tabs-spacer{ flex: 1 1 auto; }
            .plg-pane-tabs-tools{
                display: none;
                align-items: center;
                padding: 0 8px;
                gap: 6px;
            }
            .plg-pane-tabs-tools.is-visible{ display: flex; }
            .plg-pane-tabs-tools .dvh-toolbar{
                background: transparent !important;
                border: none !important;
                padding: 0 !important;
                height: auto !important;
            }
            .plg-pane-tabs-tools .toolbar-btn-svg{
                width: 28px;
                height: 28px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }
            .plg-pane-tab{
                padding: 8px 14px;
                border: none;
                background: transparent;
                color: #888;
                cursor: pointer;
                font-size: 12px;
                font-family: inherit;
                border-bottom: 2px solid transparent;
                margin-bottom: -1px;
            }
            .plg-pane-tab:hover{ color: #ccc; }
            .plg-pane-tab.is-active{
                color: #f2f2f2;
                border-bottom-color: #33addf;
                font-weight: 500;
            }
            .plg-pane-body{
                flex: 1 1 auto;
                min-height: 0;
                min-width: 0;
                overflow: hidden;
            }
            .plg-pane-panel{
                display: none;
                height: 100%;
                min-height: 0;
                min-width: 0;
            }
            .plg-pane-panel.is-active{
                display: flex;
                flex-direction: column;
                min-height: 0;
            }
            .plg-pane-mount{
                flex: 1 1 auto;
                height: 100%;
                min-height: 0;
                min-width: 0;
                overflow: hidden;
            }
            /* 生成结果窗内射束列表：仅展示，不可编辑 */
            .plg-beamlist-readonly input,
            .plg-beamlist-readonly select,
            .plg-beamlist-readonly textarea{
                pointer-events: none !important;
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                color: #ddd !important;
                padding: 0 !important;
                margin: 0 !important;
                font: inherit !important;
                outline: none !important;
            }
            .plg-beamlist-readonly select{
                -webkit-appearance: none !important;
                appearance: none !important;
                background-image: none !important;
            }
            .plg-beamlist-readonly button{
                pointer-events: none !important;
            }
            .plg-beamlist-readonly .dmlc-beam-list-toolbar,
            .plg-beamlist-readonly .proton-beam-list-toolbar{
                display: none !important;
            }
            .plg-main-cell--sw{
                display: flex;
                flex-direction: column;
                padding: 0;
                overflow: hidden;
            }
            .plg-split-h{
                flex: 1;
                min-height: 0;
                min-width: 0;
                display: flex;
                flex-direction: row;
                gap: 1px;
                background: #333;
            }
            .plg-split-cell{
                flex: 1;
                min-width: 0;
                min-height: 0;
                background: #161616;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    _switchQuadTab(which, key) {
        if (!this.root || !key) return;
        if (which === 'ne') {
            const tools = this.root.querySelector('#plgNETabTools');
            if (tools) {
                const on = key === 'dvh' || key === '3d' || key === 'bev';
                tools.classList.toggle('is-visible', on);
                if (!on) tools.innerHTML = '';
            }
        }
        const tabs = [...this.root.querySelectorAll(`[data-plg-${which}-tab]`)];
        const panels = [...this.root.querySelectorAll(`[data-plg-${which}-panel]`)];
        tabs.forEach((b) => {
            const on = b.getAttribute(`data-plg-${which}-tab`) === key;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-selected', on ? 'true' : 'false');
            b.tabIndex = on ? 0 : -1;
        });
        panels.forEach((p) => {
            const on = p.getAttribute(`data-plg-${which}-panel`) === key;
            p.classList.toggle('is-active', on);
            p.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
        // tab 切换时确保右侧工具区与当前 tab 对齐（部分组件把工具栏外置一次性渲染）
        if (which === 'ne') {
            this._mainAreaInstances[`ne:${key}`]?.mountToolbarExternally?.();
        }
        this._ensureQuadTabInstance(which, key);
    }

    _ensureQuadTabInstance(which, key) {
        if (!this.root) return;
        const instKey = `${which}:${key}`;
        if (this._mainAreaInstances[instKey]) return;

        if (which === 'ne') {
            if (key === '3d') {
                const el = this.root.querySelector('#plgNE3DMount');
                if (!el) return;
                el.innerHTML = '';
                const isPhoton = this._mainRadMode === 'PHOTON';
                const Ctor = isPhoton ? window.PhotonView3DComponent : window.ProtonView3DComponent;
                if (typeof Ctor === 'function') {
                    this._mainAreaInstances[instKey] = new Ctor('plgNE3DMount', {
                        showHeader: false,
                        showToolbar: true,
                        toolbarTitle: '3D',
                        toolbarContainerId: 'plgNETabTools'
                    });
                } else {
                    el.innerHTML = `<div class="plg-sub-placeholder">3D（组件未加载）</div>`;
                }
            } else if (key === 'bev') {
                const el = this.root.querySelector('#plgNEBEVMount');
                if (!el) return;
                el.innerHTML = '';
                const isPhoton = this._mainRadMode === 'PHOTON';
                const Ctor = isPhoton ? window.PhotonBeamEyeViewComponent : window.ProtonBeamEyeViewComponent;
                if (typeof Ctor === 'function') {
                    this._mainAreaInstances[instKey] = new Ctor('plgNEBEVMount', {
                        showHeader: false,
                        showToolbar: true,
                        toolbarTitle: 'BEV',
                        toolbarContainerId: 'plgNETabTools'
                    });
                } else {
                    el.innerHTML = `<div class="plg-sub-placeholder">BEV（组件未加载）</div>`;
                }
            } else if (key === 'dvh') {
                const el = this.root.querySelector('#plgNEDVHMount');
                if (el && typeof window.DVHComponent === 'function') {
                    this._mainAreaInstances[instKey] = new window.DVHComponent(el, {
                        showHeader: false,
                        showToolbar: true,
                        toolbarContainerId: 'plgNETabTools',
                        width: 320,
                        height: 260
                    });
                }
            }
            return;
        }

        if (which === 'se') {
            if (key === 'stats') {
                const el = this.root.querySelector('#plgSEDoseStatsMount');
                if (el && typeof window.DoseStatisticsComponent === 'function') {
                    if (!el.id) el.id = `plg-dose-stats-${Date.now()}`;
                    this._mainAreaInstances[instKey] = new window.DoseStatisticsComponent(el.id, {});
                }
            } else if (key === 'goals') {
                const el = this.root.querySelector('#plgSEClinicalTargetMount');
                const CT =
                    (typeof globalThis !== 'undefined' && typeof globalThis.ClinicalTargetComponent === 'function' && globalThis.ClinicalTargetComponent) ||
                    (typeof window !== 'undefined' && typeof window.ClinicalTargetComponent === 'function' && window.ClinicalTargetComponent);
                if (el && CT) {
                    el.innerHTML = '';
                    this._mainAreaInstances[instKey] = new CT(el, { showFilter: true });
                } else if (el) {
                    el.innerHTML = `<div class="plg-sub-placeholder">临床目标（组件未加载）</div>`;
                }
            } else if (key === 'beams') {
                const el = this.root.querySelector('#plgSEBeamListMount');
                if (!el) return;
                el.innerHTML = '';
                el.classList.add('plg-beamlist-readonly');
                const isPhoton = this._mainRadMode === 'PHOTON';
                const Ctor = isPhoton ? window.DMLCBeamListComponent : window.ProtonBeamListComponentPBS;
                if (typeof Ctor === 'function') {
                    this._mainAreaInstances[instKey] = new Ctor(el, {});
                } else {
                    el.innerHTML = `<div class="plg-sub-placeholder">射束列表（组件未加载）</div>`;
                }
            }
        }
    }

    _inferRadModeFromBeam(beam) {
        const rt = String(beam?.radiationType ?? '').toLowerCase();
        const tech = String(beam?.technique ?? '').toLowerCase();
        const mach = String(beam?.machine ?? '').toLowerCase();
        if (rt.includes('photon')) return 'PHOTON';
        if (rt.includes('proton')) return 'PROTON';
        // 兜底：pbs / probeam -> proton；dmlc / edge / synergy -> photon
        if (tech.includes('pbs') || mach.includes('probeam')) return 'PROTON';
        if (tech.includes('dmlc') || mach.includes('edge') || mach.includes('synergy') || mach.includes('elekta')) return 'PHOTON';
        return 'PROTON';
    }

    _destroyMainInstancesByPrefix(prefix) {
        Object.keys(this._mainAreaInstances || {}).forEach((k) => {
            if (!k.startsWith(prefix)) return;
            const inst = this._mainAreaInstances[k];
            try {
                if (inst && typeof inst.destroy === 'function') inst.destroy();
            } catch (e) {
                /* noop */
            }
            delete this._mainAreaInstances[k];
        });
    }

    applySelectionToMainArea(beamIndex) {
        const beams = this.options.planLibraryData?.beams;
        const beam = Array.isArray(beams) ? beams[beamIndex] : null;
        const nextMode = this._inferRadModeFromBeam(beam);
        if (nextMode !== this._mainRadMode) {
            this._mainRadMode = nextMode;
            // 切换模式时销毁右上(3d/bev)与右下(beams)现有实例并清空 mount
            this._destroyMainInstancesByPrefix('ne:');
            this._destroyMainInstancesByPrefix('se:beams');
            this.root?.querySelector('#plgNE3DMount') && (this.root.querySelector('#plgNE3DMount').innerHTML = '');
            this.root?.querySelector('#plgNEBEVMount') && (this.root.querySelector('#plgNEBEVMount').innerHTML = '');
            this.root?.querySelector('#plgSEBeamListMount') && (this.root.querySelector('#plgSEBeamListMount').innerHTML = '');
        }

        // 如果当前 tab 面板已激活，确保实例存在（实现“选中计划就切换组件”）
        const neActive = this.root?.querySelector('.plg-pane-panel.is-active[data-plg-ne-panel]')?.getAttribute('data-plg-ne-panel');
        if (neActive) this._ensureQuadTabInstance('ne', neActive);
        const seActive = this.root?.querySelector('.plg-pane-panel.is-active[data-plg-se-panel]')?.getAttribute('data-plg-se-panel');
        if (seActive) this._ensureQuadTabInstance('se', seActive);
    }

    initMainAreaTabs() {
        if (!this.root) return;
        this.root.querySelectorAll('[data-plg-ne-tab]').forEach((btn) => {
            btn.addEventListener('click', () => this._switchQuadTab('ne', btn.getAttribute('data-plg-ne-tab')));
        });
        this.root.querySelectorAll('[data-plg-se-tab]').forEach((btn) => {
            btn.addEventListener('click', () => this._switchQuadTab('se', btn.getAttribute('data-plg-se-tab')));
        });
        this._switchQuadTab('ne', '3d');
        this._switchQuadTab('se', 'stats');
    }

    initMainArea2DViews() {
        if (!this.root) return;
        const nw = this.root.querySelector('#plgQuadNW');
        const swl = this.root.querySelector('#plgQuadSWL');
        const swr = this.root.querySelector('#plgQuadSWR');
        if (nw && typeof window.CrossSectionView2DComponent === 'function') {
            if (!nw.id) nw.id = 'plgAxial2D';
            this._mainAreaInstances['2d:axial'] = new window.CrossSectionView2DComponent(nw.id, { enableToolbar: true, showDoseLegend: false });
        }
        if (swl && typeof window.CoronalView2DComponent === 'function') {
            if (!swl.id) swl.id = 'plgCoronal2D';
            this._mainAreaInstances['2d:coronal'] = new window.CoronalView2DComponent(swl.id, { enableToolbar: true, showDoseLegend: false });
        }
        if (swr && typeof window.SagittalView2DComponent === 'function') {
            if (!swr.id) swr.id = 'plgSagittal2D';
            this._mainAreaInstances['2d:sagittal'] = new window.SagittalView2DComponent(swr.id, { enableToolbar: true, showDoseLegend: false });
        }
    }

    show() {
        if (this.root) return;
        const mc = this.options.mountContainer || document.body;
        if (mc !== document.body) {
            const pos = window.getComputedStyle(mc).position;
            if (pos === 'static') mc.style.position = 'relative';
        }

        this._planScoresByBeamIndex = new Map();
        this._goalMetricByBeamGoalKey = new Map();
        this._goalEnabledById = new Map();
        this._goalThresholdById = new Map();
        this._goalOpById = new Map();
        this._goalTargetById = new Map();
        this._goalBoundMinById = new Map();
        this._goalBoundMaxById = new Map();
        this._mainAreaInstances = {};
        this._mainRadMode = null;

        this.root = document.createElement('div');
        this.root.className = `plg-mask ${mc === document.body ? 'fixed' : 'embedded'}`;
        this.root.setAttribute('role', 'dialog');
        this.root.setAttribute('aria-modal', 'true');
        this.root.setAttribute('aria-label', '生成计划库结果');

        this.root.innerHTML = `
            <div class="plg-dialog">
                <div class="plg-head">
                    <h2>生成计划库</h2>
                    <button type="button" class="plg-close" data-plg-close aria-label="关闭"><i class="fas fa-times"></i></button>
                </div>
                <div class="plg-body">
                    <div class="plg-sidebar-wrap">
                        <aside class="plg-rail" role="tablist" aria-label="侧栏页签">
                            <button type="button" class="plg-rail-tab is-active" role="tab" id="plg-tab-plan" data-plg-panel="plan" aria-selected="true" aria-controls="plg-panel-plan" tabindex="0">计划</button>
                            <button type="button" class="plg-rail-tab" role="tab" id="plg-tab-roi" data-plg-panel="roi" aria-selected="false" aria-controls="plg-panel-roi" tabindex="-1">ROIs</button>
                            <button type="button" class="plg-rail-tab" role="tab" id="plg-tab-poi" data-plg-panel="poi" aria-selected="false" aria-controls="plg-panel-poi" tabindex="-1">POIs</button>
                            <button type="button" class="plg-rail-tab" role="tab" id="plg-tab-dose" data-plg-panel="dose" aria-selected="false" aria-controls="plg-panel-dose" tabindex="-1">Isodoses</button>
                        </aside>
                        <aside class="plg-sidebar" data-plg-sidebar-tab="plan">
                            <div class="plg-sidebar-scroll">
                                <div class="plg-sidebar-panel is-active" data-plg-panel="plan" id="plg-panel-plan" role="tabpanel" aria-labelledby="plg-tab-plan" aria-hidden="false">
                                    <div class="plg-plan-split" aria-label="计划页上下等分">
                                        <div class="plg-plan-split-top" aria-label="筛选条件">
                                            <div class="plg-plan-split-scroll plg-plan-split-scroll--static">
                                                <div class="plg-sec-title">筛选条件</div>
                                                <div class="plg-filter-block">
                                                    <div class="plg-row plg-row--machine" id="plgMachineFilterMount"></div>
                                                    <div class="plg-label" style="margin-top:12px">临床目标达成情况筛选</div>
                                                    <div class="plg-goal-scroll" aria-label="临床目标列表（可滚动）">
                                                        <div class="plg-goal-item" data-plg-goal-id="body_max" data-plg-op="<=" data-plg-target="6600">
                                                            <label class="plg-goal-line">
                                                                <input type="checkbox" checked />
                                                                <span class="plg-swatch" style="background:#5a9a6a"></span>
                                                                <span>body Max Dose &lt;= 6600.00 cGy</span>
                                                            </label>
                                                            <div class="plg-goal-slider">
                                                                <div class="plg-goal-track-wrap">
                                                                    <input type="range" class="plg-goal-range" aria-label="body Max Dose 筛选范围（cGy）" />
                                                                </div>
                                                                <div class="plg-goal-scale">
                                                                    <span class="plg-goal-vmin" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vcur" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vmax" aria-hidden="true"></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="plg-goal-item" data-plg-goal-id="ptv_d90" data-plg-op=">=" data-plg-target="6000">
                                                            <label class="plg-goal-line">
                                                                <input type="checkbox" checked />
                                                                <span class="plg-swatch" style="background:#c75c5c"></span>
                                                                <span>ptv D90.0% &gt;= 6000.00 cGy</span>
                                                            </label>
                                                            <div class="plg-goal-slider">
                                                                <div class="plg-goal-track-wrap">
                                                                    <input type="range" class="plg-goal-range" aria-label="ptv D90.0% 筛选范围（cGy）" />
                                                                </div>
                                                                <div class="plg-goal-scale">
                                                                    <span class="plg-goal-vmin" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vcur" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vmax" aria-hidden="true"></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="plg-goal-item" data-plg-goal-id="lung_v20" data-plg-op="<=" data-plg-target="20">
                                                            <label class="plg-goal-line">
                                                                <input type="checkbox" checked />
                                                                <span class="plg-swatch" style="background:#3aacde"></span>
                                                                <span>lung V20 &lt;= 20.00 %</span>
                                                            </label>
                                                            <div class="plg-goal-slider">
                                                                <div class="plg-goal-track-wrap">
                                                                    <input type="range" class="plg-goal-range" aria-label="lung V20 筛选范围（%）" />
                                                                </div>
                                                                <div class="plg-goal-scale">
                                                                    <span class="plg-goal-vmin" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vcur" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vmax" aria-hidden="true"></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="plg-goal-item" data-plg-goal-id="heart_mean" data-plg-op="<=" data-plg-target="1200">
                                                            <label class="plg-goal-line">
                                                                <input type="checkbox" checked />
                                                                <span class="plg-swatch" style="background:#e8c547"></span>
                                                                <span>heart Mean Dose &lt;= 1200.00 cGy</span>
                                                            </label>
                                                            <div class="plg-goal-slider">
                                                                <div class="plg-goal-track-wrap">
                                                                    <input type="range" class="plg-goal-range" aria-label="heart Mean Dose 筛选范围（cGy）" />
                                                                </div>
                                                                <div class="plg-goal-scale">
                                                                    <span class="plg-goal-vmin" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vcur" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vmax" aria-hidden="true"></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="plg-goal-item" data-plg-goal-id="spinal_max" data-plg-op="<=" data-plg-target="4500">
                                                            <label class="plg-goal-line">
                                                                <input type="checkbox" checked />
                                                                <span class="plg-swatch" style="background:#b58ad7"></span>
                                                                <span>spinal cord Max Dose &lt;= 4500.00 cGy</span>
                                                            </label>
                                                            <div class="plg-goal-slider">
                                                                <div class="plg-goal-track-wrap">
                                                                    <input type="range" class="plg-goal-range" aria-label="spinal cord Max Dose 筛选范围（cGy）" />
                                                                </div>
                                                                <div class="plg-goal-scale">
                                                                    <span class="plg-goal-vmin" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vcur" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vmax" aria-hidden="true"></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="plg-goal-item" data-plg-goal-id="kidney_mean" data-plg-op="<=" data-plg-target="1500">
                                                            <label class="plg-goal-line">
                                                                <input type="checkbox" checked />
                                                                <span class="plg-swatch" style="background:#5cb85c"></span>
                                                                <span>kidney Mean Dose &lt;= 1500.00 cGy</span>
                                                            </label>
                                                            <div class="plg-goal-slider">
                                                                <div class="plg-goal-track-wrap">
                                                                    <input type="range" class="plg-goal-range" aria-label="kidney Mean Dose 筛选范围（cGy）" />
                                                                </div>
                                                                <div class="plg-goal-scale">
                                                                    <span class="plg-goal-vmin" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vcur" aria-hidden="true"></span>
                                                                    <span class="plg-goal-vmax" aria-hidden="true"></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="plg-plan-split-bottom" aria-label="计划列表">
                                            <div class="plg-plan-split-scroll plg-plan-split-scroll--static">
                                                <div class="plg-plan-head">
                                                    <span>计划列表</span>
                                                    <button type="button" title="复制计划" aria-label="复制计划" data-plg-copy-plan><i class="fas fa-copy"></i></button>
                                                </div>
                                                <div class="plg-plan-list-scroll" aria-label="计划条目列表（可滚动）">
                                                    <div id="plgGeneratedPlanListRoot"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="plg-sidebar-panel" data-plg-panel="roi" id="plg-panel-roi" role="tabpanel" aria-labelledby="plg-tab-roi" aria-hidden="true">
                                    <div id="plgSidebarRoiRoot" class="plg-sub-mount"></div>
                                </div>
                                <div class="plg-sidebar-panel" data-plg-panel="poi" id="plg-panel-poi" role="tabpanel" aria-labelledby="plg-tab-poi" aria-hidden="true">
                                    <div id="plgSidebarPoiRoot" class="plg-sub-mount"></div>
                                </div>
                                <div class="plg-sidebar-panel" data-plg-panel="dose" id="plg-panel-dose" role="tabpanel" aria-labelledby="plg-tab-dose" aria-hidden="true">
                                    <div id="plgSidebarDoseRoot" class="plg-sub-mount"></div>
                                </div>
                            </div>
                        </aside>
                    </div>
                    <main class="plg-main" id="plgGeneratedMain">
                        <div class="plg-main-grid" role="group" aria-label="主区四象限">
                            <div class="plg-main-cell" id="plgQuadNW" aria-label="左上"></div>
                            <div class="plg-main-cell" id="plgQuadNE" aria-label="右上">
                                <div class="plg-pane" data-plg-pane="ne">
                                    <div class="plg-pane-tabs" role="tablist" aria-label="右上视图切换">
                                        <button type="button" class="plg-pane-tab is-active" data-plg-ne-tab="3d" role="tab" aria-selected="true" tabindex="0">3D</button>
                                        <button type="button" class="plg-pane-tab" data-plg-ne-tab="bev" role="tab" aria-selected="false" tabindex="-1">BEV</button>
                                        <button type="button" class="plg-pane-tab" data-plg-ne-tab="dvh" role="tab" aria-selected="false" tabindex="-1">DVH</button>
                                        <div class="plg-pane-tabs-spacer" aria-hidden="true"></div>
                                        <div class="plg-pane-tabs-tools" id="plgNETabTools" aria-label="右上工具区"></div>
                                    </div>
                                    <div class="plg-pane-body">
                                        <div class="plg-pane-panel is-active" data-plg-ne-panel="3d" role="tabpanel" aria-hidden="false">
                                            <div class="plg-pane-mount" id="plgNE3DMount"></div>
                                        </div>
                                        <div class="plg-pane-panel" data-plg-ne-panel="bev" role="tabpanel" aria-hidden="true">
                                            <div class="plg-pane-mount" id="plgNEBEVMount"></div>
                                        </div>
                                        <div class="plg-pane-panel" data-plg-ne-panel="dvh" role="tabpanel" aria-hidden="true">
                                            <div class="plg-pane-mount" id="plgNEDVHMount"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="plg-main-cell plg-main-cell--sw" id="plgQuadSW" aria-label="左下">
                                <div class="plg-split-h">
                                    <div class="plg-split-cell" id="plgQuadSWL" aria-label="左下左半"></div>
                                    <div class="plg-split-cell" id="plgQuadSWR" aria-label="左下右半"></div>
                                </div>
                            </div>
                            <div class="plg-main-cell" id="plgQuadSE" aria-label="右下">
                                <div class="plg-pane" data-plg-pane="se">
                                    <div class="plg-pane-tabs" role="tablist" aria-label="右下视图切换">
                                        <button type="button" class="plg-pane-tab is-active" data-plg-se-tab="stats" role="tab" aria-selected="true" tabindex="0">剂量统计</button>
                                        <button type="button" class="plg-pane-tab" data-plg-se-tab="goals" role="tab" aria-selected="false" tabindex="-1">临床目标</button>
                                        <button type="button" class="plg-pane-tab" data-plg-se-tab="beams" role="tab" aria-selected="false" tabindex="-1">射束列表</button>
                                    </div>
                                    <div class="plg-pane-body">
                                        <div class="plg-pane-panel is-active" data-plg-se-panel="stats" role="tabpanel" aria-hidden="false">
                                            <div class="plg-pane-mount" id="plgSEDoseStatsMount"></div>
                                        </div>
                                        <div class="plg-pane-panel" data-plg-se-panel="goals" role="tabpanel" aria-hidden="true">
                                            <div class="plg-pane-mount" id="plgSEClinicalTargetMount"></div>
                                        </div>
                                        <div class="plg-pane-panel" data-plg-se-panel="beams" role="tabpanel" aria-hidden="true">
                                            <div class="plg-pane-mount" id="plgSEBeamListMount"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        `;

        mc.appendChild(this.root);
        this.initClinicalGoalFilters();
        this.renderMachineFilterUI();
        this.renderGeneratedPlanList();
        this.initMainAreaTabs();
        this.initMainArea2DViews();
        // 默认用当前 activeBeamIndex 决定质子/光子
        const initActive = Number.isFinite(Number(this.options.planLibraryData?.activeBeamIndex)) ? Number(this.options.planLibraryData.activeBeamIndex) : 0;
        this.applySelectionToMainArea(initActive);
        this.root.querySelector('#plgGeneratedPlanListRoot')?.addEventListener('click', (e) => {
            const item = e.target.closest('.plg-plan-item[data-plg-plan-index]');
            if (!item || !this.root?.contains(item)) return;
            this.root.querySelectorAll('#plgGeneratedPlanListRoot .plg-plan-item').forEach((el) => {
                const on = el === item;
                el.classList.toggle('is-active', on);
                el.setAttribute('aria-selected', on ? 'true' : 'false');
            });
            const idx = Number(item.getAttribute('data-plg-plan-index'));
            if (Number.isFinite(idx) && this.options.planLibraryData) {
                this.options.planLibraryData.activeBeamIndex = idx;
                this.applySelectionToMainArea(idx);
            }
        });
        this.root.querySelector('[data-plg-copy-plan]')?.addEventListener('click', () => {
            const row = this.root?.querySelector('#plgGeneratedPlanListRoot .plg-plan-item.is-active');
            const nameEl = row?.querySelector('.plg-plan-name');
            const text = nameEl?.textContent?.trim() ?? '';
            if (!text) return;
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                navigator.clipboard.writeText(text).catch(() => {});
            }
        });
        this.root.querySelector('[data-plg-close]')?.addEventListener('click', () => this.hide());
        this.bindPlgRailEvents();
    }

    bindPlgRailEvents() {
        const rail = this.root?.querySelector('.plg-rail');
        rail?.addEventListener('click', (e) => {
            const tab = e.target.closest('.plg-rail-tab[data-plg-panel]');
            if (!tab || !this.root?.contains(tab)) return;
            const key = tab.getAttribute('data-plg-panel');
            if (key) this.switchPlgRailPanel(key);
        });
        rail?.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            const tabs = [...(this.root?.querySelectorAll('.plg-rail-tab[data-plg-panel]') ?? [])];
            const i = tabs.indexOf(document.activeElement);
            if (i < 0) return;
            e.preventDefault();
            const next = e.key === 'ArrowDown' ? Math.min(i + 1, tabs.length - 1) : Math.max(i - 1, 0);
            const t = tabs[next];
            t?.focus();
            const key = t?.getAttribute('data-plg-panel');
            if (key) this.switchPlgRailPanel(key);
        });
    }

    switchPlgRailPanel(panelKey) {
        if (!this.root) return;
        const keys = ['plan', 'roi', 'poi', 'dose'];
        if (!keys.includes(panelKey)) return;
        this.root.querySelectorAll('.plg-rail-tab[data-plg-panel]').forEach((t) => {
            const on = t.getAttribute('data-plg-panel') === panelKey;
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
            t.tabIndex = on ? 0 : -1;
        });
        this.root.querySelectorAll('.plg-sidebar-panel[data-plg-panel]').forEach((p) => {
            const on = p.getAttribute('data-plg-panel') === panelKey;
            p.classList.toggle('is-active', on);
            p.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
        this.root.querySelector('.plg-sidebar')?.setAttribute('data-plg-sidebar-tab', panelKey);
        if (panelKey === 'roi') this.ensurePlgRailRoi();
        else if (panelKey === 'poi') this.ensurePlgRailPoi();
        else if (panelKey === 'dose') this.ensurePlgRailDose();
    }

    ensurePlgRailRoi() {
        if (this._railSubInstances.roi) return;
        const mount = document.getElementById('plgSidebarRoiRoot');
        if (!mount) return;
        if (typeof window.ROIComponent === 'undefined') {
            if (!mount.querySelector('.plg-sub-placeholder')) {
                mount.innerHTML = `<div class="plg-sub-placeholder">${this.escapeHtml('ROI 组件未加载。请在页面中先引入 ROIComponent.js。')}</div>`;
            }
            return;
        }
        this._railSubInstances.roi = new window.ROIComponent('plgSidebarRoiRoot', { prefix: 'plgGenRoi-' });
    }

    ensurePlgRailPoi() {
        if (this._railSubInstances.poi) return;
        const mount = document.getElementById('plgSidebarPoiRoot');
        if (!mount) return;
        if (typeof window.POIComponent === 'undefined') {
            if (!mount.querySelector('.plg-sub-placeholder')) {
                mount.innerHTML = `<div class="plg-sub-placeholder">${this.escapeHtml('POI 组件未加载。请在页面中先引入 POIComponent.js。')}</div>`;
            }
            return;
        }
        this._railSubInstances.poi = new window.POIComponent('plgSidebarPoiRoot', { prefix: 'plgGenPoi-' });
    }

    ensurePlgRailDose() {
        if (this._railSubInstances.dose) return;
        const mount = document.getElementById('plgSidebarDoseRoot');
        if (!mount) return;
        if (typeof window.DOSEComponent === 'undefined') {
            if (!mount.querySelector('.plg-sub-placeholder')) {
                mount.innerHTML = `<div class="plg-sub-placeholder">${this.escapeHtml('等剂量线组件未加载。请在页面中先引入 DOSEComponent.js。')}</div>`;
            }
            return;
        }
        this._railSubInstances.dose = new window.DOSEComponent('plgSidebarDoseRoot', { prefix: 'plgGenDose-' });
    }

    disposePlgRailSubInstances() {
        try {
            this._railSubInstances.roi?.destroy?.();
        } catch (e) {
            /* noop */
        }
        try {
            this._railSubInstances.poi?.destroy?.();
        } catch (e) {
            /* noop */
        }
        try {
            this._railSubInstances.dose?.destroy?.();
        } catch (e) {
            /* noop */
        }
        this._railSubInstances = { roi: null, poi: null, dose: null };
    }

    hide() {
        if (!this.root) return;
        this.setMachinePanelOpen(false);
        Object.values(this._mainAreaInstances || {}).forEach((inst) => {
            try {
                if (inst && typeof inst.destroy === 'function') inst.destroy();
            } catch (e) {
                /* noop */
            }
        });
        this._mainAreaInstances = {};
        this.disposePlgRailSubInstances();
        this.root.remove();
        this.root = null;
        if (typeof this.options.onClose === 'function') this.options.onClose();
    }

    destroy() {
        this.hide();
    }
}

if (typeof window !== 'undefined') {
    window.PlanLibraryGeneratedModalComponent = PlanLibraryGeneratedModalComponent;
}
