/**
 * 4DCT-鲁棒性评估DVH组件
 * 在 DVH 基础上扩展：
 * - 共 48 个场景：4 个时相（MIP/20%/50%/80%），每个时相下 12 个场景；悬浮提示场景序号 1～48（按时相→该时相内场景展开）
 * - 其他曲线透明度控制（MIP 时相下场景 1 为基准线，固定不透明）
 * - 时相多选过滤
 */
class FourDCTRobustnessEvaluationDVHComponent extends DVHComponent {
    init() {
        this.phaseLabels = ['MIP', '20%', '50%', '80%'];
        /** 单个时相下的场景个数（4×12=48 总场景） */
        this.scenariosPerPhase = 12;
        this.selectedPhases = new Set(this.phaseLabels);
        this.otherScenariosOpacity = 60;

        this.render();
        this.setupCanvas();
        this.bindEvents();
        this.loadSampleData();
        this.draw();
    }

    renderToolbar() {
        if (!this.options.enableToolbar || !this.options.showToolbar) return '';

        const titleHtml = this.options.showHeader
            ? `<div class="toolbar-title">${this.options.toolbarTitle || 'DVH'}</div>`
            : '';

        const phaseChecks = this.phaseLabels.map((phase) => `
            <label class="dvh-4d-phase-item">
                <input type="checkbox" class="dvh-4d-phase-checkbox" data-phase="${phase}" checked />
                <span>${phase}</span>
            </label>
        `).join('');

        return `
            <div class="dvh-toolbar cross-section-view2d-toolbar" data-dvh-toolbar="${this.containerId}">
                ${titleHtml}
                <div class="dvh-4d-controls">
                    <div class="dvh-4d-opacity-group">
                        <span class="dvh-4d-label">不透明度</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value="${this.otherScenariosOpacity}"
                            class="dvh-4d-opacity-slider"
                            id="${this.containerId}-other-opacity"
                            aria-label="其他场景透明度"
                        />
                        <span class="dvh-4d-opacity-value" id="${this.containerId}-other-opacity-value">${this.otherScenariosOpacity}%</span>
                    </div>
                    <div class="dvh-4d-phase-group" id="${this.containerId}-phase-group">
                        <span class="dvh-4d-label">时相</span>
                        <div class="dvh-4d-phase-dropdown" id="${this.containerId}-phase-dropdown">
                            <button
                                type="button"
                                class="dvh-4d-phase-trigger"
                                id="${this.containerId}-phase-trigger"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                <span id="${this.containerId}-phase-trigger-text">已选 ${this.phaseLabels.length} 项</span>
                                <i class="fas fa-chevron-down" aria-hidden="true"></i>
                            </button>
                            <div class="dvh-4d-phase-menu" id="${this.containerId}-phase-menu" style="display:none;">
                                <div class="dvh-4d-phase-actions">
                                    <button type="button" class="dvh-4d-phase-action-btn" id="${this.containerId}-phase-select-all">全选</button>
                                    <button type="button" class="dvh-4d-phase-action-btn" id="${this.containerId}-phase-clear-all">取消全选</button>
                                </div>
                                ${phaseChecks}
                            </div>
                        </div>
                    </div>
                </div>
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

    renderToolbarButtonsOnly() {
        return super.renderToolbarButtonsOnly();
    }

    bindEvents() {
        super.bindEvents();

        const opacitySlider = document.getElementById(`${this.containerId}-other-opacity`);
        const opacityValue = document.getElementById(`${this.containerId}-other-opacity-value`);
        if (opacitySlider) {
            opacitySlider.addEventListener('input', () => {
                const value = Number(opacitySlider.value);
                this.otherScenariosOpacity = Number.isNaN(value) ? 0 : Math.max(0, Math.min(100, value));
                if (opacityValue) {
                    opacityValue.textContent = `${this.otherScenariosOpacity}%`;
                }
                this.draw();
            });
        }

        const phaseGroup = document.getElementById(`${this.containerId}-phase-group`);
        if (phaseGroup) {
            const dropdown = document.getElementById(`${this.containerId}-phase-dropdown`);
            const trigger = document.getElementById(`${this.containerId}-phase-trigger`);
            const triggerText = document.getElementById(`${this.containerId}-phase-trigger-text`);
            const menu = document.getElementById(`${this.containerId}-phase-menu`);

            const updateTriggerText = () => {
                if (!triggerText) return;
                const count = this.selectedPhases.size;
                triggerText.textContent = count === 0 ? '未选择' : `已选 ${count} 项`;
            };

            const closeMenu = () => {
                if (!menu || !trigger) return;
                menu.style.display = 'none';
                trigger.setAttribute('aria-expanded', 'false');
            };

            const openMenu = () => {
                if (!menu || !trigger) return;
                menu.style.display = 'block';
                trigger.setAttribute('aria-expanded', 'true');
            };

            if (trigger && menu && dropdown) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (menu.style.display === 'none') {
                        openMenu();
                    } else {
                        closeMenu();
                    }
                });

                // 避免点击下拉菜单内部触发关闭
                menu.addEventListener('click', (e) => {
                    e.stopPropagation();
                });

                if (!this._phaseDropdownDocClickHandler) {
                    this._phaseDropdownDocClickHandler = (e) => {
                        if (!dropdown.contains(e.target)) {
                            closeMenu();
                        }
                    };
                    document.addEventListener('click', this._phaseDropdownDocClickHandler);
                }
            }

            const checkboxes = phaseGroup.querySelectorAll('.dvh-4d-phase-checkbox');
            const selectAllBtn = document.getElementById(`${this.containerId}-phase-select-all`);
            const clearAllBtn = document.getElementById(`${this.containerId}-phase-clear-all`);

            const syncPhaseSelectionToUI = () => {
                checkboxes.forEach((checkbox) => {
                    const phase = checkbox.dataset.phase;
                    checkbox.checked = !!phase && this.selectedPhases.has(phase);
                });
                updateTriggerText();
            };

            const applyPhaseFilterChange = () => {
                if (this.hoveredCurve && !this.isCurveDrawable(this.hoveredCurve)) {
                    this.hoveredCurve = null;
                    this.crosshairPos = null;
                    if (this.tooltip) this.tooltip.style.display = 'none';
                }
                if (this.selectedCurve && !this.isCurveDrawable(this.selectedCurve)) {
                    this.selectedCurve = null;
                }
                this.draw();
            };

            if (selectAllBtn) {
                selectAllBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectedPhases = new Set(this.phaseLabels);
                    syncPhaseSelectionToUI();
                    applyPhaseFilterChange();
                });
            }

            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectedPhases.clear();
                    syncPhaseSelectionToUI();
                    applyPhaseFilterChange();
                });
            }

            checkboxes.forEach((checkbox) => {
                checkbox.addEventListener('change', () => {
                    const phase = checkbox.dataset.phase;
                    if (!phase) return;
                    if (checkbox.checked) {
                        this.selectedPhases.add(phase);
                    } else {
                        this.selectedPhases.delete(phase);
                    }
                    updateTriggerText();
                    applyPhaseFilterChange();
                });
            });

            updateTriggerText();
        }
    }

    loadSampleData() {
        const baseRois = [
            { roiId: 'ptv', roiName: 'PTV', color: '#FF0000', steepness: 0.85, dropPoint: 4200, smooth: true },
            { roiId: 'roi1', roiName: 'ROI-1', color: '#FF00FF', steepness: 0.08, dropPoint: 500 },
            { roiId: 'roi2', roiName: 'ROI-2', color: '#0080FF', steepness: 0.12, dropPoint: 600 },
            { roiId: 'roi3', roiName: 'ROI-3', color: '#00FFFF', steepness: 0.15, dropPoint: 700 },
            { roiId: 'roi4', roiName: 'ROI-4', color: '#00FF00', steepness: 0.18, dropPoint: 800 },
            { roiId: 'roi5', roiName: 'ROI-5', color: '#FFFF00', steepness: 0.20, dropPoint: 900 },
            { roiId: 'roi6', roiName: 'ROI-6', color: '#FF8000', steepness: 0.22, dropPoint: 1000 }
        ];

        const expanded = [];
        for (let phaseIndex = 1; phaseIndex <= this.phaseLabels.length; phaseIndex++) {
            const phaseLabel = this.phaseLabels[phaseIndex - 1];
            for (let scenarioIndex = 1; scenarioIndex <= this.scenariosPerPhase; scenarioIndex++) {
                baseRois.forEach((base) => {
                    const sceneDisplayIndex =
                        (phaseIndex - 1) * this.scenariosPerPhase + scenarioIndex;
                    expanded.push({
                        roiId: `${base.roiId}-p${phaseIndex}-s${scenarioIndex}`,
                        roiBaseId: base.roiId,
                        roiName: base.roiName,
                        color: base.color,
                        visible: true,
                        scenarioIndex,
                        phaseIndex,
                        phaseLabel,
                        sceneDisplayIndex,
                        points: this.generateScenarioPhaseDVH(base, scenarioIndex, phaseIndex)
                    });
                });
            }
        }

        this.dvhData = expanded;
    }

    generateScenarioPhaseDVH(base, scenarioIndex, phaseIndex) {
        // scenarioIndex：该时相下 12 场景之一；phaseIndex：时相。用于微调曲线形状作演示区分
        const scenarioDelta = scenarioIndex - 1;
        const phaseDelta = phaseIndex - 1;

        const steepness = base.steepness * (1 + scenarioDelta * 0.004 - phaseDelta * 0.006);
        const dropPoint = base.dropPoint + scenarioDelta * 20 + phaseDelta * 35;
        const points = this.generateCumulativeDVH(100, 6000, steepness, dropPoint, !!base.smooth);

        const amp = 0.25 + scenarioDelta * 0.01 + phaseDelta * 0.04;
        const volumeOffset = scenarioDelta * 0.15 - phaseDelta * 0.25;
        const doseShift = scenarioDelta * 6 + phaseDelta * 10;
        const phaseRad = phaseDelta * 0.65;

        return points.map((p) => {
            const shiftedDose = Math.max(0, Math.min(6000, p.dose + doseShift));
            const wave = Math.sin((p.dose / 6000) * Math.PI * 2 + phaseRad) * amp;
            const volume = Math.max(0, Math.min(100, p.volume + wave + volumeOffset));
            return {
                dose: shiftedDose,
                volume,
                volumeAbsolute: volume * 0.1
            };
        });
    }

    isCurveDrawable(curve) {
        if (!curve || !curve.visible) return false;
        if (!this.selectedPhases.has(curve.phaseLabel)) return false;
        if (this.getCurveAlpha(curve) <= 0) return false;
        return true;
    }

    getCurveAlpha(curve) {
        if (curve.scenarioIndex === 1 && curve.phaseIndex === 1) {
            return 1;
        }
        return Math.max(0, Math.min(1, this.otherScenariosOpacity / 100));
    }

    /**
     * 全局场景序号 1～48。优先从 roiId（…-p{时相}-s{该时相内场景}）解析，避免仅依赖 phaseLabel 匹配失败时误用错误的 phaseIndex。
     */
    getGlobalSceneNumber(curve) {
        if (!curve) return '';
        const perPhase = this.scenariosPerPhase ?? 12;
        const numPhases = this.phaseLabels ? this.phaseLabels.length : 4;

        const id = String(curve.roiId || '');
        const parsed = id.match(/-p(\d+)-s(\d+)$/);
        if (parsed) {
            const p = parseInt(parsed[1], 10);
            const s = parseInt(parsed[2], 10);
            if (p >= 1 && s >= 1 && p <= numPhases && s <= perPhase) {
                return (p - 1) * perPhase + s;
            }
        }

        if (curve.sceneDisplayIndex != null && curve.phaseIndex != null && curve.phaseLabel != null) {
            const labelSlot = this.phaseLabels.indexOf(String(curve.phaseLabel).trim());
            if (labelSlot === curve.phaseIndex - 1) {
                return curve.sceneDisplayIndex;
            }
        }

        if (curve.scenarioIndex == null) {
            return curve.sceneDisplayIndex != null ? curve.sceneDisplayIndex : '';
        }
        let phaseSlot = this.phaseLabels.indexOf(String(curve.phaseLabel || '').trim());
        if (phaseSlot < 0 && curve.phaseIndex != null && curve.phaseIndex >= 1) {
            phaseSlot = curve.phaseIndex - 1;
        }
        if (phaseSlot < 0) {
            return curve.sceneDisplayIndex != null ? curve.sceneDisplayIndex : '';
        }
        return phaseSlot * perPhase + curve.scenarioIndex;
    }

    findCurveAtPosition(x, y, threshold = 10) {
        for (let i = this.dvhData.length - 1; i >= 0; i--) {
            const curve = this.dvhData[i];
            if (!this.isCurveDrawable(curve)) continue;

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

    drawCurves() {
        const ctx = this.ctx;

        this.dvhData.forEach(curve => {
            if (!this.isCurveDrawable(curve) || !curve.points || curve.points.length === 0) return;

            const isHovered = this.hoveredCurve === curve;
            const isSelected = this.selectedCurve === curve;

            let lineWidth = this.settings.lineWidth;
            if (this.settings.thickLineEnabled) lineWidth += 1;
            if (isHovered || isSelected) lineWidth += 1;

            ctx.save();
            ctx.globalAlpha = this.getCurveAlpha(curve);
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
            ctx.restore();
        });
    }

    showTooltip(curve, point, screenX, screenY) {
        if (!this.tooltip) return;

        const dose = point.dose.toFixed(2);
        const volume = point.volume.toFixed(2);
        const volumeAbs = point.volumeAbsolute ? point.volumeAbsolute.toFixed(2) : '0.00';
        const globalSceneNo = this.getGlobalSceneNumber(curve);
        const scenarioText = `场景: ${globalSceneNo}  时相: ${curve.phaseLabel}`;

        this.tooltip.innerHTML = `
            <div class="dvh-tooltip-header">
                <div class="dvh-tooltip-color-line" style="background: ${curve.color};"></div>
                <span class="dvh-tooltip-roi-name">${curve.roiName}</span>
            </div>
            <div class="dvh-tooltip-content">
                <div class="dvh-tooltip-row">${scenarioText}</div>
                <div class="dvh-tooltip-row">V: ${volume}% (${volumeAbs}cm³)</div>
                <div class="dvh-tooltip-row">D: ${dose}cGy</div>
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
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.FourDCTRobustnessEvaluationDVHComponent = FourDCTRobustnessEvaluationDVHComponent;
}

