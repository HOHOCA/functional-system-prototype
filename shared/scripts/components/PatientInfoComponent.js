class PatientInfoComponent {
    constructor(container, patient = null) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.patient = patient || {
            name: 'Zhangguang',
            id: 'Y87342987',
            birthDate: '1967-10-08',
            sex: 'M'
        };
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="patient-info-component">
                <div class="avatar">${(this.patient.name || 'U')[0]}</div>
                <div class="meta">
                    <div class="name">${this.patient.name} (ID:${this.patient.id})</div>
                    <div class="extra">${this.patient.birthDate} ${this.patient.sex}</div>
                </div>
            </div>
        `;
    }
}

window.PatientInfoComponent = PatientInfoComponent;


