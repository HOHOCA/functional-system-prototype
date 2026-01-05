/**
 * 患者概览组件
 * 用于在多个模块内复用患者基本信息展示
 */
class PatientOverviewComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.patient = this.normalizePatient(options.patient || {});
        this.injectStyles();
        this.render();
    }

    // 注入一次样式，避免重复定义
    injectStyles() {
        if (document.getElementById('patient-overview-component-style')) return;
        const style = document.createElement('style');
        style.id = 'patient-overview-component-style';
        style.textContent = `
            .patient-overview-card {
                background: #3a3a3a;
                border-radius: 8px;
                padding: 12px 16px;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
                box-sizing: border-box;
            }
            .patient-overview-name {
                font-size: 15px;
                font-weight: 600;
                color: #ffffff;
                margin: 0 0 6px 0;
                line-height: 1.2;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .patient-overview-info {
                font-size: 13px;
                color: #cccccc;
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `;
        document.head.appendChild(style);
    }

    // 规范化患者数据
    normalizePatient(patient) {
        return {
            name: patient.name || '--',
            id: patient.id || '--',
            birthDate: (patient.birthDate || '').replace(/-/g, ''),
            gender: patient.gender || ''
        };
    }

    // 设置患者信息并刷新 UI
    setPatient(patient) {
        this.patient = this.normalizePatient(patient || {});
        this.render();
    }

    // 渲染组件
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // 让容器自身占满可用空间，便于内部卡片铺满区域
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.display = 'flex';

        const { name, id, birthDate, gender } = this.patient;
        container.innerHTML = `
            <div class="patient-overview-card">
                <div class="patient-overview-name">${name} (ID:${id})</div>
                <div class="patient-overview-info">${birthDate} ${gender}</div>
            </div>
        `;
    }
}

// 导出到全局，便于直接使用
window.PatientOverviewComponent = PatientOverviewComponent;

