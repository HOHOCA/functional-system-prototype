/**
 * 患者概览组件
 * 顶栏 56px 内两行信息，贴齐容器四周无外间距。
 */
class PatientOverviewComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        const shared = window.CurrentPatient && typeof CurrentPatient.get === 'function'
            ? CurrentPatient.get()
            : (options.patient || {});
        this.patient = this.normalizePatient(shared);
        this.injectStyles();
        this.render();
        if (window.CurrentPatient && typeof CurrentPatient.subscribe === 'function') {
            CurrentPatient.subscribe((patient) => this.setPatient(patient));
        }
    }

    injectStyles() {
        if (document.getElementById('patient-overview-component-style')) return;
        const style = document.createElement('style');
        style.id = 'patient-overview-component-style';
        style.textContent = `
            .patient-overview {
                padding: 0 !important;
                background: #2b2b2b !important;
                border-right-color: #373737 !important;
                box-sizing: border-box;
                align-items: stretch !important;
                justify-content: stretch !important;
            }
            .patient-overview-host {
                width: 100%;
                height: 100%;
                min-height: 0;
                display: flex;
                align-items: stretch;
                box-sizing: border-box;
            }
            .patient-overview-card {
                background: #2b2b2b;
                border-radius: 0;
                padding: 0 10px;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .patient-overview-name {
                font-size: 13px;
                font-weight: 400;
                color: #eeeeee;
                margin: 0;
                line-height: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .patient-overview-info {
                font-size: 12px;
                color: #d4d4d4;
                margin: 2px 0 0 0;
                line-height: 15px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `;
        document.head.appendChild(style);
    }

    formatBirthDate(value) {
        const digits = String(value || '').replace(/\D/g, '');
        if (digits.length === 8) {
            return digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6, 8);
        }
        return String(value || '').trim();
    }

    normalizePatient(patient) {
        return {
            name: patient.name || '--',
            id: patient.id || '--',
            birthDate: this.formatBirthDate(patient.birthDate),
            gender: patient.gender || '',
            machine: patient.machine || ''
        };
    }

    setPatient(patient) {
        this.patient = this.normalizePatient(patient || {});
        this.render();
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.classList.add('patient-overview-host');

        const { name, id, birthDate, gender, machine } = this.patient;
        const meta = [birthDate, gender, machine].filter(Boolean).join('　');
        container.innerHTML = `
            <div class="patient-overview-card">
                <div class="patient-overview-name">${name}　(ID:${id})</div>
                <div class="patient-overview-info">${meta}</div>
            </div>
        `;
    }
}

window.PatientOverviewComponent = PatientOverviewComponent;
