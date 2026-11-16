/**
 * 计划设计-患者概览
 * 对齐蓝湖「计划设计 / 侧边栏患者信息」：搜索、患者、计划/处方、治疗机/技术、物理剂量与计划剂量
 */
class PlanDesignPatientOverviewComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            iconBasePath: (options.iconBasePath || '../../shared/assets/plan-design-overview').replace(/\/$/, ''),
            avatar: options.avatar || '',
            searchPlaceholder: options.searchPlaceholder || '按下回车搜索所有患者和ID',
            doseTypeOptions: options.doseTypeOptions || [
                { value: 'physical', label: '物理剂量' },
                { value: 'biological', label: '生物剂量' }
            ],
            doseSourceOptions: options.doseSourceOptions || [
                { value: 'planned', label: '计划剂量' }
            ],
            onSearch: options.onSearch || null,
            onPlanChange: options.onPlanChange || null,
            onDoseTypeChange: options.onDoseTypeChange || null,
            onDoseSourceChange: options.onDoseSourceChange || null,
            ...options
        };
        const sharedPatient = window.CurrentPatient && typeof CurrentPatient.get === 'function' && options.syncCurrentPatient !== false
            ? CurrentPatient.get()
            : null;
        this.patient = this.normalizePatient(sharedPatient || options.patient || {});
        this.plans = (Array.isArray(options.plans) && options.plans.length
            ? options.plans
            : this.defaultPlans(options.product)
        ).map((plan) => this.normalizePlan(plan));
        this.plan = this.normalizePlan(options.plan || this.plans[0] || {});
        this.doseType = options.doseType || 'physical';
        this.doseSource = options.doseSource || 'planned';
        this.searchKeyword = options.searchKeyword || '';
        this.injectStyles();
        this.render();
        if (window.CurrentPatient && typeof CurrentPatient.subscribe === 'function' && options.syncCurrentPatient !== false) {
            CurrentPatient.subscribe((patient) => this.setPatient(patient));
        }
    }

    defaultPlans(product) {
        if (product === 'proton') {
            return [
                { id: 'plan-pbs', name: 'Plan1', machine: 'ProBeam', technique: 'PBS', totalDose: 6000, fractions: 30, fractionDose: 200 },
                { id: 'plan-pbsarc', name: 'Plan2', machine: 'ProBeam', technique: 'PBSArc', totalDose: 6000, fractions: 20, fractionDose: 300 }
            ];
        }
        if (product === 'brachy') {
            return [
                { id: 'plan-a', name: 'PlanA', machine: 'XHDR30', technique: 'HDR', totalDose: 3000, fractions: 3, fractionDose: 1000 },
                { id: 'plan-b', name: 'PlanB', machine: 'XHDR30', technique: 'HDR', totalDose: 2800, fractions: 4, fractionDose: 700 }
            ];
        }
        return [
            { id: 'plan-dmlc', name: 'Plan1', machine: 'TrueBeamSN3304', technique: 'DMLC', totalDose: 6000, fractions: 30, fractionDose: 200 },
            { id: 'plan-smlc', name: 'Plan2', machine: 'TrueBeamSN3304', technique: 'SMLC', totalDose: 5000, fractions: 25, fractionDose: 200 },
            { id: 'plan-vmat', name: 'Plan3', machine: 'TrueBeamSN3304', technique: 'VMAT', totalDose: 6000, fractions: 30, fractionDose: 200 }
        ];
    }

    injectStyles() {
        let style = document.getElementById('plan-design-patient-overview-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'plan-design-patient-overview-style';
            document.head.appendChild(style);
        }
        style.textContent = `
            .pdpo-card {
                width: 100%;
                max-width: 100%;
                height: 100%;
                min-height: 182px;
                box-sizing: border-box;
                padding: 5px 7px 8px;
                background: #232323;
                border: 1px solid rgba(55, 55, 55, 0.75);
                font-family: "FZLTZHK--GBK1-0", "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
                color: #eeeeee;
                display: flex;
                flex-direction: column;
                overflow: visible;
            }
            .pdpo-search {
                display: flex;
                align-items: center;
                gap: 8px;
                height: 24px;
                padding: 0 8px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(55, 55, 55, 0.5);
                border-radius: 4px;
                box-sizing: border-box;
                flex-shrink: 0;
            }
            .pdpo-search-icon {
                width: 14px;
                height: 14px;
                flex-shrink: 0;
                display: block;
            }
            .pdpo-search-input {
                flex: 1;
                min-width: 0;
                height: 16px;
                border: 0;
                outline: none;
                background: transparent;
                color: #eeeeee;
                font-size: 12px;
                line-height: 16px;
                font-family: inherit;
            }
            .pdpo-search-input::placeholder {
                color: #eeeeee;
            }
            .pdpo-patient {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 8px;
                min-height: 42px;
            }
            .pdpo-avatar {
                width: 42px;
                height: 42px;
                border-radius: 50%;
                object-fit: cover;
                flex-shrink: 0;
                display: block;
                background: rgba(0, 0, 0, 0.45);
            }
            .pdpo-patient-meta {
                min-width: 0;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .pdpo-name-row {
                display: flex;
                align-items: baseline;
                gap: 8px;
                min-width: 0;
            }
            .pdpo-name {
                font-size: 14px;
                line-height: 19px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .pdpo-id {
                font-size: 14px;
                line-height: 19px;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .pdpo-sub {
                display: flex;
                gap: 12px;
                font-size: 12px;
                line-height: 16px;
                color: #eeeeee;
            }
            .pdpo-divider {
                height: 1px;
                margin: 8px 0 0 50px;
                background: rgba(238, 238, 238, 0.06);
            }
            .pdpo-plan-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 8px;
                min-height: 16px;
                padding-left: 26px;
            }
            .pdpo-plan-icon,
            .pdpo-dose-icon {
                width: 16px;
                height: 16px;
                flex-shrink: 0;
                display: block;
            }
            .pdpo-dose-icon {
                width: 19px;
                height: 20px;
            }
            .pdpo-plan-name,
            .pdpo-prescription,
            .pdpo-machine {
                font-size: 12px;
                line-height: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .pdpo-plan-name {
                max-width: 101px;
                flex-shrink: 0;
            }
            .pdpo-prescription {
                flex: 1;
                min-width: 0;
            }
            .pdpo-plan-select {
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                border: 0;
                background: transparent;
                color: #eeeeee;
                font-size: 12px;
                line-height: 16px;
                font-family: inherit;
                cursor: pointer;
                outline: none;
                padding: 0;
                margin: 0;
                max-width: 101px;
                color-scheme: dark;
            }
            .pdpo-plan-select::-ms-expand {
                display: none;
            }
            .pdpo-plan-select option {
                background: #232323;
                color: #eeeeee;
            }
            .pdpo-chevron {
                width: 12px;
                height: 12px;
                flex-shrink: 0;
                display: block;
                transition: transform 0.15s ease;
            }
            .pdpo-machine-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                margin-top: 2px;
                padding-left: 50px;
                padding-right: 8px;
                box-sizing: border-box;
            }
            .pdpo-technique {
                flex-shrink: 0;
                height: 19px;
                min-width: 64px;
                padding: 0 5px;
                box-sizing: border-box;
                background: rgba(238, 238, 238, 0.1);
                border-radius: 2px;
                color: #249bd9;
                font-size: 12px;
                line-height: 19px;
                text-align: center;
            }
            .pdpo-dose-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 10px;
                padding-left: 23px;
                position: relative;
                z-index: 2;
            }
            /* 对齐 UI样式/蓝湖：关闭态 trigger + 展开态菜单 */
            .pdpo-dose-dropdown {
                position: relative;
                height: 22px;
                box-sizing: border-box;
            }
            .pdpo-dose-dropdown.is-type {
                width: 110px;
                flex-shrink: 0;
            }
            .pdpo-dose-dropdown.is-source {
                width: 158px;
                flex: 1;
                min-width: 0;
            }
            .pdpo-dose-trigger {
                appearance: none;
                -webkit-appearance: none;
                display: flex;
                align-items: center;
                width: 100%;
                height: 22px;
                padding: 0 6px 0 8px;
                box-sizing: border-box;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(55, 55, 55, 0.5);
                border-radius: 2px;
                color: #eeeeee;
                font-size: 12px;
                line-height: 16px;
                font-family: inherit;
                cursor: pointer;
                outline: none;
                gap: 4px;
            }
            .pdpo-dose-trigger:hover,
            .pdpo-dose-dropdown.is-open .pdpo-dose-trigger {
                border-color: #249BD9;
            }
            .pdpo-dose-label {
                flex: 1;
                min-width: 0;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .pdpo-dose-dropdown.is-open .pdpo-chevron {
                transform: rotate(180deg);
            }
            .pdpo-dose-menu {
                display: none;
                position: absolute;
                top: calc(100% + 2px);
                left: 0;
                right: 0;
                z-index: 1000;
                max-height: 180px;
                overflow-y: auto;
                overflow-x: hidden;
                background: #232323;
                border: 1px solid rgba(55, 55, 55, 0.75);
                border-radius: 2px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
                padding: 2px 0;
                box-sizing: border-box;
            }
            .pdpo-dose-dropdown.is-open .pdpo-dose-menu {
                display: block;
            }
            .pdpo-dose-option {
                padding: 5px 8px;
                color: #eeeeee;
                font-size: 12px;
                line-height: 16px;
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .pdpo-dose-option:hover {
                background: rgba(238, 238, 238, 0.1);
            }
            .pdpo-dose-option.is-selected {
                background: rgba(36, 155, 217, 0.26);
                color: #eeeeee;
            }
            .pdpo-dose-menu::-webkit-scrollbar {
                width: 6px;
            }
            .pdpo-dose-menu::-webkit-scrollbar-thumb {
                background: #555555;
                border-radius: 3px;
            }
        `;
    }

    iconSrc(name) {
        return `${this.options.iconBasePath}/${name}`;
    }

    getAvatarSrc() {
        if (this.options.avatar) return this.options.avatar;
        return this.iconSrc('avatar.png');
    }

    escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    normalizePatient(patient) {
        return {
            name: patient.name || '--',
            id: patient.id || '--',
            birthDate: patient.birthDate || '',
            gender: patient.gender || ''
        };
    }

    normalizePlan(plan) {
        const totalDose = plan.totalDose != null ? plan.totalDose : 6000;
        const fractions = plan.fractions != null ? plan.fractions : 30;
        const fractionDose = plan.fractionDose != null ? plan.fractionDose : 200;
        return {
            id: plan.id || plan.name || 'plan',
            name: plan.name || 'Plan',
            machine: plan.machine || '--',
            technique: plan.technique || '--',
            totalDose,
            fractions,
            fractionDose,
            prescription: plan.prescription || `${totalDose}cGy [${fractions}*${fractionDose}cGy]`
        };
    }

    setPatient(patient) {
        this.patient = this.normalizePatient(patient || {});
        this.render();
    }

    setPlan(plan) {
        this.plan = this.normalizePlan(plan || {});
        if (!this.plans.some((item) => item.id === this.plan.id)) {
            this.plans = [this.plan, ...this.plans];
        }
        this.render();
    }

    bindEvents() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const searchInput = container.querySelector('.pdpo-search-input');
        if (searchInput) {
            searchInput.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter') return;
                this.searchKeyword = searchInput.value.trim();
                if (typeof this.options.onSearch === 'function') {
                    this.options.onSearch(this.searchKeyword);
                }
            });
        }

        const planSelect = container.querySelector('.pdpo-plan-select');
        if (planSelect) {
            planSelect.addEventListener('change', () => {
                const next = this.plans.find((item) => item.id === planSelect.value);
                if (!next) return;
                this.plan = next;
                const prescription = container.querySelector('.pdpo-prescription');
                const machine = container.querySelector('.pdpo-machine');
                const technique = container.querySelector('.pdpo-technique');
                if (prescription) prescription.textContent = next.prescription;
                if (machine) machine.textContent = next.machine;
                if (technique) technique.textContent = next.technique;
                if (typeof this.options.onPlanChange === 'function') {
                    this.options.onPlanChange(next);
                }
            });
            const planChevron = container.querySelector('.pdpo-plan-row .pdpo-chevron');
            if (planChevron) {
                planChevron.style.cursor = 'pointer';
                planChevron.addEventListener('click', () => {
                    if (typeof planSelect.showPicker === 'function') {
                        planSelect.showPicker();
                    } else {
                        planSelect.focus();
                    }
                });
            }
        }

        this.bindDoseDropdowns(container);
    }

    getOptionLabel(items, selectedValue) {
        const found = (items || []).find((item) => {
            const value = item.value != null ? item.value : item.id;
            return String(value) === String(selectedValue);
        });
        if (!found) return String(selectedValue || '');
        return found.label != null ? found.label : found.name;
    }

    renderDoseMenuOptions(items, selectedValue) {
        return (items || []).map((item) => {
            const value = item.value != null ? item.value : item.id;
            const label = item.label != null ? item.label : item.name;
            const selected = String(value) === String(selectedValue) ? ' is-selected' : '';
            return `<div class="pdpo-dose-option${selected}" data-value="${this.escapeHtml(value)}" role="option">${this.escapeHtml(label)}</div>`;
        }).join('');
    }

    renderDoseDropdown(kindClass, field, title, items, selectedValue, chevronIcon) {
        const label = this.getOptionLabel(items, selectedValue);
        return `
            <div class="pdpo-dose-dropdown ${kindClass}" data-field="${this.escapeHtml(field)}">
                <button type="button" class="pdpo-dose-trigger" title="${this.escapeHtml(title)}" aria-haspopup="listbox" aria-expanded="false">
                    <span class="pdpo-dose-label">${this.escapeHtml(label)}</span>
                    <img class="pdpo-chevron" src="${chevronIcon}" alt="">
                </button>
                <div class="pdpo-dose-menu" role="listbox">
                    ${this.renderDoseMenuOptions(items, selectedValue)}
                </div>
            </div>
        `;
    }

    bindDoseDropdowns(container) {
        if (this._doseOutsideClick) {
            document.removeEventListener('click', this._doseOutsideClick);
            this._doseOutsideClick = null;
        }

        const closeAll = () => {
            container.querySelectorAll('.pdpo-dose-dropdown.is-open').forEach((el) => {
                el.classList.remove('is-open');
                const trigger = el.querySelector('.pdpo-dose-trigger');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        };

        container.querySelectorAll('.pdpo-dose-dropdown').forEach((dropdown) => {
            const trigger = dropdown.querySelector('.pdpo-dose-trigger');
            const labelEl = dropdown.querySelector('.pdpo-dose-label');
            if (!trigger || !labelEl) return;

            trigger.addEventListener('click', (event) => {
                event.stopPropagation();
                const wasOpen = dropdown.classList.contains('is-open');
                closeAll();
                if (!wasOpen) {
                    dropdown.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });

            dropdown.querySelectorAll('.pdpo-dose-option').forEach((option) => {
                option.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const value = option.getAttribute('data-value');
                    const field = dropdown.getAttribute('data-field');
                    dropdown.querySelectorAll('.pdpo-dose-option').forEach((el) => {
                        el.classList.toggle('is-selected', el === option);
                    });
                    labelEl.textContent = option.textContent;
                    if (field === 'doseType') {
                        this.doseType = value;
                        if (typeof this.options.onDoseTypeChange === 'function') {
                            this.options.onDoseTypeChange(this.doseType);
                        }
                    } else if (field === 'doseSource') {
                        this.doseSource = value;
                        if (typeof this.options.onDoseSourceChange === 'function') {
                            this.options.onDoseSourceChange(this.doseSource);
                        }
                    }
                    closeAll();
                });
            });
        });

        this._doseOutsideClick = (event) => {
            if (!container.contains(event.target)) closeAll();
        };
        document.addEventListener('click', this._doseOutsideClick);
    }

    renderOptions(items, selectedValue) {
        return items.map((item) => {
            const value = item.value != null ? item.value : item.id;
            const label = item.label != null ? item.label : item.name;
            const selected = String(value) === String(selectedValue) ? ' selected' : '';
            return `<option value="${this.escapeHtml(value)}"${selected}>${this.escapeHtml(label)}</option>`;
        }).join('');
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.style.width = '100%';
        container.style.height = '100%';
        container.style.display = 'flex';
        container.style.minHeight = '0';

        const { name, id, birthDate, gender } = this.patient;
        const plan = this.plan;
        const avatarSrc = this.getAvatarSrc();
        const searchIcon = this.iconSrc('search.png');
        const planIcon = this.iconSrc('plan.png');
        const doseIcon = this.iconSrc('dose.png');
        const chevronIcon = this.iconSrc('chevron.png');
        const planOptions = this.plans.map((item) => ({
            value: item.id,
            label: item.name
        }));

        container.innerHTML = `
            <div class="pdpo-card">
                <div class="pdpo-search">
                    <img class="pdpo-search-icon" src="${searchIcon}" alt="">
                    <input class="pdpo-search-input" type="text" value="${this.escapeHtml(this.searchKeyword)}" placeholder="${this.escapeHtml(this.options.searchPlaceholder)}">
                </div>
                <div class="pdpo-patient">
                    <img class="pdpo-avatar" src="${avatarSrc}" alt="">
                    <div class="pdpo-patient-meta">
                        <div class="pdpo-name-row">
                            <span class="pdpo-name">${this.escapeHtml(name)}</span>
                            <span class="pdpo-id">(ID:${this.escapeHtml(id)})</span>
                        </div>
                        <div class="pdpo-sub">
                            <span>${this.escapeHtml(birthDate || '--')}</span>
                            <span>${this.escapeHtml(gender || '')}</span>
                        </div>
                    </div>
                </div>
                <div class="pdpo-divider"></div>
                <div class="pdpo-plan-row">
                    <img class="pdpo-plan-icon" src="${planIcon}" alt="">
                    <select class="pdpo-plan-select" title="计划">
                        ${this.renderOptions(planOptions, plan.id)}
                    </select>
                    <span class="pdpo-prescription">${this.escapeHtml(plan.prescription)}</span>
                    <img class="pdpo-chevron" src="${chevronIcon}" alt="">
                </div>
                <div class="pdpo-machine-row">
                    <span class="pdpo-machine">${this.escapeHtml(plan.machine)}</span>
                    <span class="pdpo-technique">${this.escapeHtml(plan.technique)}</span>
                </div>
                <div class="pdpo-divider"></div>
                <div class="pdpo-dose-row">
                    <img class="pdpo-dose-icon" src="${doseIcon}" alt="">
                    ${this.renderDoseDropdown('is-type', 'doseType', '剂量类型', this.options.doseTypeOptions, this.doseType, chevronIcon)}
                    ${this.renderDoseDropdown('is-source', 'doseSource', '剂量来源', this.options.doseSourceOptions, this.doseSource, chevronIcon)}
                </div>
            </div>
        `;

        this.bindEvents();
    }
}

window.PlanDesignPatientOverviewComponent = PlanDesignPatientOverviewComponent;
