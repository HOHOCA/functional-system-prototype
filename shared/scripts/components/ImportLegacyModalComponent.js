class ImportLegacyModalComponent {
    constructor(options = {}) {
        this.options = {
            mountContainer: document.body,
            defaultTab: 'remote',
            ...options
        };
        this.root = null;
        this.activeTab = this.options.defaultTab;
        this.remoteState = null;
        this.localState = null;
        this.externalState = {
            selectedNode: '',
            searchValue: '',
            patients: [],
            patientTrees: {}
        };
        this.existsModalRoot = null;
        this.resultModalRoot = null;
        this.pendingExistsPatient = null;
        this.ensureStyles();
    }

    getSystemExistingImages() {
        return [{
            patientId: '24112002',
            patientName: 'demo',
            ctUid: '2.16.840.1.113662.2.2.3.8.1.3081232920250331163904.3'
        }];
    }

    getSystemExistingPatientIds() {
        return this.getSystemExistingImages().map((image) => image.patientId);
    }

    extractCtUid(label) {
        const match = String(label || '').match(/^CT:\s*(.+?)(?:\(files:|$)/);
        return match ? match[1].trim() : '';
    }

    parsePatientRoot(label) {
        const match = String(label || '').match(/Patient name:\s*(.+?)\(Patient ID:\s*([^)]+)\)/);
        if (!match) return null;
        return { patientName: match[1].trim(), patientId: match[2].trim() };
    }

    isDuplicateCtImage(patientId, ctUid) {
        return this.getSystemExistingImages().some(
            (image) => image.patientId === patientId && image.ctUid === ctUid
        );
    }

    ensureStyles() {
        if (document.getElementById('import-legacy-modal-component-styles')) return;
        const style = document.createElement('style');
        style.id = 'import-legacy-modal-component-styles';
        style.textContent = `
            .ilmc-wrap { width: 100%; height: 100%; min-height: 620px; display: flex; align-items: center; justify-content: center; background: #111; padding: 16px; box-sizing: border-box; }
            .ilmc-wrap.overlay { background: rgba(0, 0, 0, 0.55); }
            .ilmc-modal { width: min(1100px, 100%); height: min(680px, 100%); background: #2a2a2a; border: 1px solid #404040; border-radius: 8px; color: #ddd; box-shadow: 0 12px 36px rgba(0,0,0,0.55); display: flex; flex-direction: column; overflow: hidden; }
            .ilmc-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 12px; flex-shrink: 0; }
            .ilmc-title { margin: 0; font-size: 16px; font-weight: 500; color: #fff; }
            .ilmc-close { background: none; border: none; color: #aaa; font-size: 18px; line-height: 1; cursor: pointer; padding: 4px; }
            .ilmc-close:hover { color: #fff; }
            .ilmc-tabs { display: flex; border-bottom: 1px solid #404040; padding: 0 20px; flex-shrink: 0; }
            .ilmc-tab { padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent; color: #ddd; font-size: 14px; transition: all 0.2s ease; margin-bottom: -1px; }
            .ilmc-tab.active { color: #3AACDE; border-bottom-color: #3AACDE; }
            .ilmc-tab:hover { color: #fff; }
            .ilmc-body { flex: 1; display: flex; flex-direction: column; padding: 16px 20px; overflow: hidden; min-height: 0; }
            .ilmc-toolbar { flex-shrink: 0; margin-bottom: 16px; }
            .ilmc-search-row { display: flex; align-items: center; gap: 10px; }
            .ilmc-search-box { flex: 1; }
            .ilmc-search-box input { width: 100%; box-sizing: border-box; height: 36px; padding: 0 12px 0 35px; background-color: #1a1a1a; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: 12px center; background-size: 16px; border: 1px solid #404040; border-radius: 4px; color: #e6e6e6; font-size: 13px; }
            .ilmc-search-box input:focus { outline: none; border-color: #3AACDE; background-color: #262626; box-shadow: 0 0 0 3px rgba(33, 143, 191, 0.15); }
            .ilmc-search-box input:disabled { background-color: #252525; color: #666; border-color: #353535; cursor: not-allowed; box-shadow: none; opacity: 0.75; }
            .ilmc-refresh-btn { width: 32px; height: 32px; background: #2f2f2f; border: 1px solid #444; border-radius: 4px; color: #e6e6e6; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background-color 0.2s ease; }
            .ilmc-refresh-btn:hover:not(:disabled) { background: #333; border-color: #3AACDE; }
            .ilmc-refresh-btn:disabled { opacity: 0.45; cursor: not-allowed; color: #666; }
            .ilmc-refresh-btn svg { width: 16px; height: 16px; }
            .ilmc-folder-row { display: flex; align-items: center; gap: 10px; }
            .ilmc-folder-label { color: #ddd; font-size: 14px; white-space: nowrap; }
            .ilmc-folder-input-wrap { flex: 1; display: flex; align-items: stretch; }
            .ilmc-folder-input-wrap input { flex: 1; padding: 8px 12px; background: #1a1a1a; border: 1px solid #404040; border-right: none; border-radius: 4px 0 0 4px; color: #fff; font-size: 13px; }
            .ilmc-folder-input-wrap input:focus { outline: none; border-color: #3AACDE; }
            .ilmc-folder-browse { width: 36px; background: #404040; border: 1px solid #555; border-radius: 0 4px 4px 0; color: #fff; cursor: pointer; font-size: 16px; letter-spacing: 1px; }
            .ilmc-folder-browse:hover { background: #555; }
            .ilmc-external-row { display: flex; align-items: center; gap: 10px; }
            .ilmc-node-select { flex: 1; min-width: 0; }
            .ilmc-node-select select { width: 100%; height: 36px; box-sizing: border-box; padding: 0 32px 0 12px; background-color: #1a1a1a; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; background-size: 12px; border: 1px solid #404040; border-radius: 4px; color: #e6e6e6; font-size: 13px; appearance: none; cursor: pointer; }
            .ilmc-node-select select:focus { outline: none; border-color: #3AACDE; background-color: #262626; box-shadow: 0 0 0 3px rgba(33, 143, 191, 0.15); }
            .ilmc-node-select select option { background-color: #2a2a2a; color: #e6e6e6; }
            .ilmc-external-row .ilmc-search-box { flex: 1; min-width: 0; }
            .ilmc-required { color: #E74C3C; margin-right: 2px; }
            .ilmc-panels { flex: 1; display: flex; gap: 16px; min-height: 0; }
            .ilmc-panel { flex: 1; background: #1e1e1e; border: 1px solid #404040; border-radius: 4px; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
            .ilmc-panel-header { background: #1a1a1a; padding: 10px 14px; border-bottom: 1px solid #404040; font-size: 14px; color: #fff; font-weight: 500; flex-shrink: 0; display: flex; align-items: center; gap: 8px; }
            .ilmc-panel-content { flex: 1; overflow-y: auto; padding: 8px 10px; }
            .ilmc-patient-item { display: flex; align-items: center; padding: 6px 8px; border-bottom: 1px solid #2a2a2a; cursor: pointer; transition: background 0.2s; }
            .ilmc-patient-item:hover { background: #2a2a2a; }
            .ilmc-patient-item.selected { background: #2a3f4f; border-left: 3px solid #3AACDE; }
            .ilmc-tree-item { display: flex; align-items: center; padding: 2px 0; min-width: 0; }
            .ilmc-tree-text { flex: 1; color: #fff; font-size: 13px; line-height: 1.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
            .ilmc-checkbox { display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0; }
            .ilmc-checkbox input { display: none; }
            .ilmc-checkmark { width: 16px; height: 16px; background: #2a2a2a; border: 1px solid #404040; border-radius: 3px; margin-right: 8px; position: relative; transition: all 0.2s; flex-shrink: 0; }
            .ilmc-checkbox input:checked + .ilmc-checkmark { background: #3AACDE; border-color: #3AACDE; }
            .ilmc-checkbox input:checked + .ilmc-checkmark::after { content: ''; position: absolute; left: 4px; top: 1px; width: 6px; height: 10px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }
            .ilmc-footer { flex-shrink: 0; padding: 12px 20px 16px; display: flex; align-items: center; justify-content: flex-end; gap: 16px; border-top: 1px solid #404040; }
            .ilmc-footer-options { margin-right: auto; }
            .ilmc-auto-delete { display: flex; align-items: center; cursor: pointer; color: #ddd; font-size: 13px; }
            .ilmc-btn { min-width: 80px; height: 32px; border-radius: 4px; border: 1px solid #575757; background: #3f3f3f; color: #d2d2d2; cursor: pointer; font-size: 13px; }
            .ilmc-btn.primary { border-color: #3AACDE; background: #3AACDE; color: #fff; }
            .ilmc-btn.primary:hover { background: #218FBF; border-color: #218FBF; }
            .ilmc-btn:hover { background: #4a4a4a; }
            .ilmc-hidden { display: none !important; }
            .ilmc-exists-mask { position: absolute; inset: 0; z-index: 20; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.55); padding: 16px; box-sizing: border-box; }
            .ilmc-exists-modal { width: min(480px, 100%); background: linear-gradient(180deg, #333 0%, #2b2b2b 100%); border: 1px solid #3a3a3a; border-radius: 8px; color: #e6e6e6; box-shadow: 0 12px 36px rgba(0,0,0,0.55); display: flex; flex-direction: column; }
            .ilmc-exists-header { padding: 14px 20px 12px; display: flex; align-items: center; justify-content: space-between; }
            .ilmc-exists-title { margin: 0; font-size: 16px; font-weight: 500; color: #d7d7d7; }
            .ilmc-exists-close { background: none; border: none; color: #8a8a8a; font-size: 18px; cursor: pointer; padding: 4px; }
            .ilmc-exists-close:hover { color: #fff; }
            .ilmc-exists-body { padding: 8px 20px 16px; }
            .ilmc-exists-msg { color: #d0d0d0; font-size: 13px; line-height: 1.7; margin-bottom: 16px; }
            .ilmc-exists-option { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; cursor: pointer; font-size: 13px; color: #ddd; }
            .ilmc-exists-option input { accent-color: #3AACDE; }
            .ilmc-exists-new-wrap { margin-top: 12px; padding-top: 12px; border-top: 1px solid #3b3b3b; }
            .ilmc-exists-new-row { display: flex; align-items: center; gap: 10px; }
            .ilmc-exists-new-label { color: #ddd; font-size: 13px; white-space: nowrap; }
            .ilmc-exists-new-input { flex: 1; height: 32px; padding: 0 10px; background: #1a1a1a; border: 1px solid #404040; border-radius: 4px; color: #e6e6e6; font-size: 13px; }
            .ilmc-exists-new-input:focus { outline: none; border-color: #3AACDE; }
            .ilmc-exists-error { margin-top: 8px; color: #E74C3C; font-size: 12px; }
            .ilmc-exists-divider { height: 1px; background: #3b3b3b; }
            .ilmc-exists-footer { padding: 14px 20px 18px; display: flex; justify-content: flex-end; gap: 16px; }
            .ilmc-success-toast { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); z-index: 30; padding: 10px 20px; background: rgba(42, 63, 79, 0.95); border: 1px solid #3AACDE; border-radius: 4px; color: #fff; font-size: 13px; box-shadow: 0 4px 16px rgba(0,0,0,0.35); pointer-events: none; }
            .ilmc-result-modal { width: min(720px, 100%); height: min(560px, 90vh); max-height: min(560px, 90vh); overflow: hidden; }
            .ilmc-result-modal > .ilmc-exists-header,
            .ilmc-result-modal > .ilmc-result-stats,
            .ilmc-result-modal > .ilmc-exists-divider,
            .ilmc-result-modal > .ilmc-exists-footer { flex-shrink: 0; }
            .ilmc-result-stats { display: flex; align-items: center; gap: 24px; padding: 10px 20px; background: #1e1e1e; border-bottom: 1px solid #3b3b3b; flex-shrink: 0; font-size: 13px; color: #d0d0d0; }
            .ilmc-result-stat { display: flex; align-items: center; gap: 6px; }
            .ilmc-result-stat-icon { width: 16px; height: 16px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; }
            .ilmc-result-stat-icon.success { background: #52c41a; }
            .ilmc-result-stat-icon.fail { background: #E74C3C; }
            .ilmc-result-body { flex: 1 1 auto; overflow-y: auto; overflow-x: hidden; padding: 8px 0; min-height: 0; }
            .ilmc-result-row { display: flex; align-items: center; gap: 6px; min-height: 32px; padding: 4px 20px 4px 0; box-sizing: border-box; }
            .ilmc-result-row:hover { background: #2a2a2a; }
            .ilmc-result-toggle { width: 16px; height: 16px; border: none; background: none; cursor: pointer; flex-shrink: 0; position: relative; padding: 0; }
            .ilmc-result-toggle::before { content: ''; position: absolute; left: 4px; top: 5px; border: 5px solid transparent; border-left-color: #888; border-right-width: 0; transition: transform 0.15s ease; }
            .ilmc-result-toggle.expanded::before { transform: rotate(90deg); top: 3px; left: 3px; }
            .ilmc-result-toggle-spacer { width: 16px; flex-shrink: 0; }
            .ilmc-result-label { flex: 1; font-size: 13px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
            .ilmc-result-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; max-width: 55%; }
            .ilmc-result-error { color: #E74C3C; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px; }
            .ilmc-result-icon { width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0; }
            .ilmc-result-icon.success { background: #52c41a; }
            .ilmc-result-icon.fail { background: #E74C3C; }
        `;
        document.head.appendChild(style);
    }

    buildRemotePatientTree(patient) {
        return [
            {
                label: `Patient name: ${patient.name}(Patient ID: ${patient.id})`,
                checked: true,
                children: [
                    {
                        label: `Study ID:${patient.studyId}`,
                        checked: true,
                        children: [
                            {
                                label: `CT: ${patient.ctUid}`,
                                checked: true,
                                children: [
                                    {
                                        label: `RTSTRUCT: ${patient.rtstructUid}`,
                                        checked: true,
                                        children: [
                                            {
                                                label: `RTPLAN: ${patient.rtplanUid}`,
                                                checked: true,
                                                children: [
                                                    { label: `RTDOSE: ${patient.rtdoseUid}`, checked: true }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];
    }

    getCtSeries(patient) {
        if (patient.ctSeries?.length) return patient.ctSeries;
        return [{ uid: patient.ctUid, files: patient.ctFiles }];
    }

    buildRtChildren(patient) {
        if (!patient.rtstructUid) return [];
        return [{
            label: `RTSTRUCT: ${patient.rtstructUid}(fil...`,
            checked: true,
            children: [{
                label: `RTPLAN: ${patient.rtplanUid}...`,
                checked: true,
                children: [{ label: `RTDOSE: ${patient.rtdoseUid}...`, checked: true }]
            }]
        }];
    }

    buildLocalPatientTree(patient) {
        const ctSeries = this.getCtSeries(patient);
        const ctNodes = ctSeries.map((ct, index) => ({
            label: `CT: ${ct.uid}(files: ${ct.files})`,
            checked: true,
            children: index === 0 ? this.buildRtChildren(patient) : []
        }));
        return [{
            label: `Patient name: ${patient.name}(Patient ID: ${patient.id})`,
            checked: true,
            children: [{
                label: `Study ID: ${patient.studyId}`,
                checked: true,
                children: ctNodes
            }]
        }];
    }

    getRemotePatientCatalog() {
        return [
            {
                id: 'MT26030001',
                name: 'anoy',
                studyId: '3395',
                ctUid: '1.3.46.670589.33.1.63888082262173640300002.538114401851262619',
                rtstructUid: '1.3.6.1.4.1.2452.6.1272797299.1269038452.571723431.351',
                rtplanUid: '1.3.6.1.4.1.2452.6.3267932988.1172097940.3467057806.3',
                rtdoseUid: '1.3.6.1.4.1.2452.6.704066425.1299661310.552896153'
            }
        ];
    }

    getLocalPatientCatalog() {
        return [
            {
                id: '24112001',
                name: 'test',
                studyId: '',
                ctUid: '2.16.840.1.113662.2.2.3.8.1.3081232920250331163904.2',
                ctFiles: 88,
                rtstructUid: '2.16.840.1.113662.2.2.3.5.1.3081232920250331163904.1',
                rtplanUid: '1.2.276.0.7230010.3.1.4.2661423673.8480.1777342383.92',
                rtdoseUid: '1.2.276.0.7230010.3.1.4.2661423673.8480.177734453'
            },
            {
                id: '24112002',
                name: 'demo',
                studyId: '88201',
                ctSeries: [
                    {
                        uid: '2.16.840.1.113662.2.2.3.8.1.3081232920250331163904.3',
                        files: 64
                    },
                    {
                        uid: '2.16.840.1.113662.2.2.3.8.1.3081232920250331163904.4',
                        files: 72
                    },
                    {
                        uid: '2.16.840.1.113662.2.2.3.8.1.3081232920250331163904.5',
                        files: 56
                    }
                ],
                rtstructUid: '2.16.840.1.113662.2.2.3.5.1.3081232920250331163904.2',
                rtplanUid: '1.2.276.0.7230010.3.1.4.2661423673.8480.1777342383.93',
                rtdoseUid: '1.2.276.0.7230010.3.1.4.2661423673.8480.177734453.94'
            }
        ];
    }

    buildPatientTrees(catalog, builder) {
        const patientTrees = {};
        catalog.forEach((patient) => {
            patientTrees[patient.id] = builder(patient);
        });
        return patientTrees;
    }

    buildTreeForCheckedPatients(patients, patientTrees) {
        return patients
            .filter((patient) => patient.checked)
            .flatMap((patient) => patientTrees[patient.id] || []);
    }

    ensureRemoteState() {
        if (this.remoteState) return;
        const catalog = this.getRemotePatientCatalog();
        this.remoteState = {
            patients: catalog.map((patient) => ({
                id: patient.id,
                name: patient.name,
                checked: false,
                selected: false
            })),
            patientTrees: this.buildPatientTrees(catalog, (patient) => this.buildRemotePatientTree(patient))
        };
    }

    ensureLocalState() {
        if (this.localState) return;
        const catalog = this.getLocalPatientCatalog();
        this.localState = {
            folderPath: 'C:/Users/MANTEIA/Desktop/Export_24112001_20260602153222',
            patients: catalog.map((patient) => ({
                id: patient.id,
                name: patient.name,
                checked: false,
                selected: false
            })),
            patientTrees: this.buildPatientTrees(catalog, (patient) => this.buildLocalPatientTree(patient))
        };
    }

    getRemoteData() {
        this.ensureRemoteState();
        return {
            patients: this.remoteState.patients,
            tree: this.buildTreeForCheckedPatients(this.remoteState.patients, this.remoteState.patientTrees)
        };
    }

    getLocalData() {
        this.ensureLocalState();
        return {
            folderPath: this.localState.folderPath,
            patients: this.localState.patients,
            tree: this.buildTreeForCheckedPatients(this.localState.patients, this.localState.patientTrees)
        };
    }

    buildExternalDicomTree(patient) {
        return [
            {
                label: `Patient name: ${patient.name}(Patient ID: ${patient.id})`,
                checked: true,
                children: [
                    {
                        label: `Study ID: ${patient.studyId}`,
                        checked: true,
                        children: [
                            {
                                label: `CT: ${patient.ctUid}(files: ${patient.ctFiles})`,
                                checked: true,
                                children: [
                                    {
                                        label: `RTSTRUCT: ${patient.rtstructUid}(files: 1)`,
                                        checked: true,
                                        children: [
                                            {
                                                label: `RTPLAN: ${patient.rtplanUid}(files: 1)`,
                                                checked: true,
                                                children: [
                                                    { label: `RTDOSE: ${patient.rtdoseUid}(files: 1)`, checked: true }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];
    }

    getExternalDicomMockCatalog() {
        return [
            {
                patient: {
                    id: '2359388',
                    name: 'Zhu^Yongbai',
                    studyId: '34972',
                    ctUid: '1.2.840.113704.1.111.4732.1531709868.9',
                    ctFiles: 146,
                    rtstructUid: '1.2.246.352.71.4.957382915.220211.20180723082035',
                    rtplanUid: '1.2.840.113704.1.111.4732.1531709870.1',
                    rtdoseUid: '1.2.840.113704.1.111.4732.1531709871.1'
                }
            },
            {
                patient: {
                    id: '2359001',
                    name: 'Zhang^San',
                    studyId: '35001',
                    ctUid: '1.2.840.113704.1.111.4732.1531709800.1',
                    ctFiles: 120,
                    rtstructUid: '1.2.246.352.71.4.957382915.220211.20180723082036',
                    rtplanUid: '1.2.840.113704.1.111.4732.1531709872.1',
                    rtdoseUid: '1.2.840.113704.1.111.4732.1531709873.1'
                }
            },
            {
                patient: {
                    id: '1204588',
                    name: 'Wang^Wu',
                    studyId: '35888',
                    ctUid: '1.2.840.113704.1.111.4732.1531709900.1',
                    ctFiles: 98,
                    rtstructUid: '1.2.246.352.71.4.957382915.220211.20180723082037',
                    rtplanUid: '1.2.840.113704.1.111.4732.1531709874.1',
                    rtdoseUid: '1.2.840.113704.1.111.4732.1531709875.1'
                }
            }
        ];
    }

    buildFallbackExternalResults(keyword) {
        return [{
            patient: {
                id: keyword,
                name: 'Zhu^Yongbai',
                studyId: '34972',
                ctUid: '1.2.840.113704.1.111.4732.1531709868.9',
                ctFiles: 146,
                rtstructUid: '1.2.246.352.71.4.957382915.220211.20180723082035',
                rtplanUid: '1.2.840.113704.1.111.4732.1531709870.1',
                rtdoseUid: '1.2.840.113704.1.111.4732.1531709871.1'
            }
        }];
    }

    searchExternalDicom(query) {
        const keyword = String(query || '').trim();
        if (!this.externalState.selectedNode || !keyword || !/\d/.test(keyword)) {
            return { patients: [], patientTrees: {} };
        }

        let matched = this.getExternalDicomMockCatalog().filter((item) => item.patient.id === keyword);

        if (!matched.length) {
            matched = this.buildFallbackExternalResults(keyword);
        }

        const patients = matched.map((item) => ({
            id: item.patient.id,
            name: item.patient.name,
            checked: false,
            selected: false
        }));
        const patientTrees = {};
        matched.forEach((item) => {
            patientTrees[item.patient.id] = this.buildExternalDicomTree(item.patient);
        });

        return { patients, patientTrees };
    }

    getExternalDicomData() {
        return {
            searchValue: this.externalState.searchValue,
            selectedNode: this.externalState.selectedNode,
            patients: this.externalState.patients,
            tree: this.buildTreeForCheckedPatients(this.externalState.patients, this.externalState.patientTrees)
        };
    }

    handleExternalSearch(value) {
        this.externalState.searchValue = String(value || '').trim();
        const result = this.searchExternalDicom(this.externalState.searchValue);
        this.externalState.patients = result.patients;
        this.externalState.patientTrees = result.patientTrees;
        this.updatePanels();
    }

    clearExternalResults() {
        this.externalState.patients = [];
        this.externalState.patientTrees = {};
        this.updatePanels();
    }

    resetExternalSearch() {
        this.externalState.searchValue = '';
        this.clearExternalResults();
        this.updateExternalSearchInput();
    }

    updateExternalSearchInput() {
        if (!this.root || this.activeTab !== 'external') return;
        const enabled = !!this.externalState.selectedNode;
        const input = this.root.querySelector('.ilmc-external-search-input');
        const refreshBtn = this.root.querySelector('.ilmc-external-toolbar .ilmc-refresh-btn');
        if (input) {
            input.disabled = !enabled;
            input.value = enabled ? this.externalState.searchValue : '';
        }
        if (refreshBtn) refreshBtn.disabled = !enabled;
    }

    getActivePatientState() {
        switch (this.activeTab) {
            case 'local':
                this.ensureLocalState();
                return this.localState;
            case 'external':
                return this.externalState;
            default:
                this.ensureRemoteState();
                return this.remoteState;
        }
    }

    handlePatientCheckboxChange(checkbox) {
        const item = checkbox.closest('.ilmc-patient-item');
        const patientId = item?.dataset.patientId;
        if (!patientId) return;

        const state = this.getActivePatientState();
        const patient = state.patients.find((p) => p.id === patientId);
        if (!patient) return;

        patient.checked = checkbox.checked;
        this.updateDataTreePanel();
    }

    updateDataTreePanel() {
        if (!this.root) return;
        const data = this.getTabData();
        const dataTree = this.root.querySelector('.ilmc-data-tree');
        if (dataTree) dataTree.innerHTML = this.renderTree(data.tree);
    }

    updatePanels() {
        if (!this.root) return;
        const data = this.getTabData();
        const patientList = this.root.querySelector('.ilmc-patient-list');
        const dataTree = this.root.querySelector('.ilmc-data-tree');
        if (patientList) patientList.innerHTML = this.renderPatients(data.patients);
        if (dataTree) dataTree.innerHTML = this.renderTree(data.tree);
    }

    getTabData() {
        switch (this.activeTab) {
            case 'local':
                return this.getLocalData();
            case 'external':
                return this.getExternalDicomData();
            default:
                return this.getRemoteData();
        }
    }

    getRemoteNodeOptions() {
        return [
            { value: 'remote-node-1', label: '远程节点0000000001' },
            { value: 'remote-node-2', label: '远程节点0000000002' },
            { value: 'remote-node-3', label: '远程节点0000000003' }
        ];
    }

    renderRemoteNodeSelect() {
        const selectedNode = this.externalState.selectedNode || '';
        const placeholderSelected = selectedNode ? '' : 'selected';
        const options = this.getRemoteNodeOptions()
            .map((node) => {
                const selected = selectedNode === node.value ? 'selected' : '';
                return `<option value="${node.value}" ${selected}>${node.label}</option>`;
            })
            .join('');
        return `<select class="ilmc-remote-node-select"><option value="" ${placeholderSelected}>请选择远程节点</option>${options}</select>`;
    }

    renderRefreshButton(disabled = false) {
        const disabledAttr = disabled ? 'disabled' : '';
        return `<button type="button" class="ilmc-refresh-btn" title="刷新" ${disabledAttr}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
            </svg>
        </button>`;
    }

    renderPanelHeader(label, required = false) {
        const prefix = required ? '<span class="ilmc-required">*</span>' : '';
        return `<div class="ilmc-panel-header">${prefix}${label}</div>`;
    }

    renderCheckbox(checked, extraClass = '') {
        const checkedAttr = checked ? 'checked' : '';
        const classAttr = extraClass ? ` class="${extraClass}"` : '';
        return `<label class="ilmc-checkbox"><input type="checkbox"${classAttr} ${checkedAttr}><span class="ilmc-checkmark"></span></label>`;
    }

    renderPatients(patients) {
        return patients.map((p) => {
            const selectedClass = p.selected ? ' selected' : '';
            return `<div class="ilmc-patient-item${selectedClass}" data-patient-id="${p.id}">
                ${this.renderCheckbox(p.checked, 'ilmc-patient-checkbox')}
                <span class="ilmc-tree-text">${p.id}&nbsp;&nbsp;${p.name}</span>
            </div>`;
        }).join('');
    }

    renderTree(nodes, depth = 0, context = { patientId: '', patientName: '' }) {
        if (!nodes || !nodes.length) return '';
        const indent = depth * 24;
        return nodes.map((node) => {
            const patientRoot = this.parsePatientRoot(node.label);
            const nextContext = patientRoot || context;
            const isCt = /^CT:\s*/.test(node.label);
            const ctUid = isCt ? this.extractCtUid(node.label) : '';
            const dataAttrs = isCt
                ? ` data-tree-type="ct" data-patient-id="${nextContext.patientId}" data-patient-name="${nextContext.patientName}" data-ct-uid="${ctUid}"`
                : ' data-tree-type="other"';
            const row = `<div class="ilmc-tree-item"${dataAttrs} style="padding-left:${indent}px">
                ${this.renderCheckbox(node.checked, 'ilmc-tree-checkbox')}
                <span class="ilmc-tree-text" title="${node.label}">${node.label}</span>
            </div>`;
            const children = node.children ? this.renderTree(node.children, depth + 1, nextContext) : '';
            return row + children;
        }).join('');
    }

    renderContent() {
        const isRemote = this.activeTab === 'remote';
        const isLocal = this.activeTab === 'local';
        const isExternal = this.activeTab === 'external';
        const data = this.getTabData();

        const remoteToolbar = `
            <div class="ilmc-toolbar ilmc-remote-toolbar">
                <div class="ilmc-search-row">
                    <div class="ilmc-search-box">
                        <input type="text" placeholder="请输入患者姓名或ID，点击搜索图标或按下回车键开始搜索">
                    </div>
                    ${this.renderRefreshButton()}
                </div>
            </div>`;

        const localToolbar = `
            <div class="ilmc-toolbar ilmc-local-toolbar">
                <div class="ilmc-folder-row">
                    <span class="ilmc-folder-label">检索文件夹</span>
                    <div class="ilmc-folder-input-wrap">
                        <input type="text" value="${data.folderPath || ''}" readonly>
                        <button type="button" class="ilmc-folder-browse">...</button>
                    </div>
                </div>
            </div>`;

        const externalSearchEnabled = !!data.selectedNode;
        const externalSearchValue = externalSearchEnabled ? (data.searchValue || '') : '';
        const externalSearchDisabled = externalSearchEnabled ? '' : 'disabled';
        const externalToolbar = `
            <div class="ilmc-toolbar ilmc-external-toolbar">
                <div class="ilmc-external-row">
                    <div class="ilmc-node-select">
                        ${this.renderRemoteNodeSelect()}
                    </div>
                    <div class="ilmc-search-box">
                        <input type="text" class="ilmc-external-search-input" value="${externalSearchValue}" placeholder="请输入患者ID，点击搜索图标或按下回车键开始搜索" ${externalSearchDisabled}>
                    </div>
                    ${this.renderRefreshButton(!externalSearchEnabled)}
                </div>
            </div>`;

        const autoDeleteOption = isRemote
            ? `<div class="ilmc-footer-options">
                <label class="ilmc-auto-delete ilmc-checkbox">
                    <input type="checkbox" checked>
                    <span class="ilmc-checkmark"></span>
                    自动删除导入成功数据
                </label>
            </div>`
            : '';

        return `
            <div class="ilmc-remote-toolbar-wrap${isRemote ? '' : ' ilmc-hidden'}">${remoteToolbar}</div>
            <div class="ilmc-local-toolbar-wrap${isLocal ? '' : ' ilmc-hidden'}">${localToolbar}</div>
            <div class="ilmc-external-toolbar-wrap${isExternal ? '' : ' ilmc-hidden'}">${externalToolbar}</div>
            <div class="ilmc-panels">
                <div class="ilmc-panel">
                    ${this.renderPanelHeader('患者列表', isExternal)}
                    <div class="ilmc-panel-content ilmc-patient-list">
                        ${this.renderPatients(data.patients)}
                    </div>
                </div>
                <div class="ilmc-panel">
                    ${this.renderPanelHeader('数据列表', isExternal)}
                    <div class="ilmc-panel-content ilmc-data-tree">
                        ${this.renderTree(data.tree)}
                    </div>
                </div>
            </div>
            <div class="ilmc-footer">
                ${autoDeleteOption}
                <button type="button" class="ilmc-btn ilmc-cancel-btn">取消</button>
                <button type="button" class="ilmc-btn primary ilmc-import-btn">导入</button>
            </div>`;
    }

    getCheckedPatients() {
        const state = this.getActivePatientState();
        if (!state || !state.patients) return [];
        return state.patients.filter((patient) => patient.checked);
    }

    getCheckedTreeItemsFromDom() {
        if (!this.root) return [];
        return Array.from(this.root.querySelectorAll('.ilmc-data-tree .ilmc-tree-checkbox:checked'))
            .map((checkbox) => {
                const row = checkbox.closest('.ilmc-tree-item');
                if (!row || row.dataset.treeType !== 'ct') return null;
                return {
                    type: 'ct',
                    patientId: row.dataset.patientId || '',
                    patientName: row.dataset.patientName || '',
                    ctUid: row.dataset.ctUid || '',
                    label: row.querySelector('.ilmc-tree-text')?.textContent?.trim() || ''
                };
            })
            .filter(Boolean);
    }

    classifyImportItems(ctItems) {
        const importable = [];
        const skipped = [];
        ctItems.forEach((item) => {
            if (this.isDuplicateCtImage(item.patientId, item.ctUid)) {
                skipped.push(item);
            } else {
                importable.push(item);
            }
        });
        return { importable, skipped };
    }

    isExistingPatientId(patientId) {
        const normalizedId = String(patientId || '').trim();
        if (!normalizedId) return false;
        return this.getSystemExistingPatientIds().includes(normalizedId);
    }

    showImportSuccessToast(message) {
        const container = this.options.mountContainer || document.body;
        const toast = document.createElement('div');
        toast.className = 'ilmc-success-toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    finishImportSuccess(message) {
        this.hideExistsModal();
        this.hideResultModal();
        this.hide();
        this.showImportSuccessToast(message);
    }

    getResultNodeType(label) {
        if (/^CT:\s*/.test(label)) return 'ct';
        if (/^RTSTRUCT:/.test(label)) return 'rtstruct';
        if (/^RTPLAN:/.test(label)) return 'rtplan';
        if (/^RTDOSE:/.test(label)) return 'rtdose';
        if (/^Study ID:/.test(label)) return 'study';
        if (/^Patient name:/.test(label)) return 'patient';
        return 'other';
    }

    isResultStatusNode(nodeType) {
        return nodeType === 'ct' || nodeType === 'rtstruct' || nodeType === 'rtplan' || nodeType === 'rtdose';
    }

    buildResultChildNodes(nodes, parentImported) {
        if (!nodes?.length) return [];
        return nodes.map((node) => {
            const nodeType = this.getResultNodeType(node.label);
            const showStatus = this.isResultStatusNode(nodeType);
            const imported = parentImported;
            return {
                label: node.label,
                nodeType,
                showStatus,
                status: showStatus ? (imported ? 'success' : 'fail') : null,
                error: '',
                expanded: true,
                children: this.buildResultChildNodes(node.children, imported)
            };
        });
    }

    buildResultNodeFromSource(node, context, checkedCtUids) {
        const patientRoot = this.parsePatientRoot(node.label);
        const nextContext = patientRoot || context;
        const nodeType = this.getResultNodeType(node.label);

        if (nodeType === 'ct') {
            const ctUid = this.extractCtUid(node.label);
            if (!checkedCtUids.has(ctUid)) return null;

            const isDuplicate = this.isDuplicateCtImage(nextContext.patientId, ctUid);
            const imported = !isDuplicate;

            return {
                label: node.label,
                nodeType: 'ct',
                showStatus: true,
                status: imported ? 'success' : 'fail',
                error: isDuplicate ? '图像重复' : '',
                expanded: true,
                children: this.buildResultChildNodes(node.children, imported)
            };
        }

        const children = (node.children || [])
            .map((child) => this.buildResultNodeFromSource(child, nextContext, checkedCtUids))
            .filter(Boolean);
        if (!children.length) return null;

        return {
            label: node.label,
            nodeType,
            showStatus: false,
            status: null,
            expanded: true,
            children
        };
    }

    buildImportResultTree(checkedCtUids) {
        const data = this.getTabData();
        return (data.tree || [])
            .map((node) => this.buildResultNodeFromSource(node, { patientId: '', patientName: '' }, checkedCtUids))
            .filter(Boolean);
    }

    countResultItems(nodes) {
        let success = 0;
        let fail = 0;
        const walk = (list) => {
            list.forEach((node) => {
                if (node.showStatus) {
                    if (node.status === 'success') success += 1;
                    else fail += 1;
                }
                if (node.children?.length) walk(node.children);
            });
        };
        walk(nodes);
        return { success, fail };
    }

    renderResultStatusIcon(status) {
        return status === 'success'
            ? '<span class="ilmc-result-icon success" aria-label="成功">✓</span>'
            : '<span class="ilmc-result-icon fail" aria-label="失败">✕</span>';
    }

    renderResultTree(nodes, depth = 0) {
        if (!nodes?.length) return '';
        return nodes.map((node) => {
            const hasChildren = !!node.children?.length;
            const expanded = node.expanded !== false;
            const indent = depth * 20;
            const toggle = hasChildren
                ? `<button type="button" class="ilmc-result-toggle${expanded ? ' expanded' : ''}" aria-label="展开/收起"></button>`
                : '<span class="ilmc-result-toggle-spacer"></span>';
            const errorHtml = node.showStatus && node.error
                ? `<span class="ilmc-result-error" title="${node.error}">${node.error}</span>`
                : '';
            const statusHtml = node.showStatus
                ? this.renderResultStatusIcon(node.status)
                : '';
            const childrenHtml = hasChildren && expanded
                ? `<div class="ilmc-result-children">${this.renderResultTree(node.children, depth + 1)}</div>`
                : '';

            return `<div class="ilmc-result-node">
                <div class="ilmc-result-row" style="padding-left:${indent}px">
                    ${toggle}
                    <span class="ilmc-result-label" title="${node.label}">${node.label}</span>
                    <div class="ilmc-result-meta">
                        ${errorHtml}
                        ${statusHtml}
                    </div>
                </div>
                ${childrenHtml}
            </div>`;
        }).join('');
    }

    hideResultModal() {
        if (!this.resultModalRoot) return;
        this.resultModalRoot.remove();
        this.resultModalRoot = null;
    }

    bindResultModalEvents() {
        if (!this.resultModalRoot) return;
        const close = () => this.hideResultModal();
        this.resultModalRoot.querySelector('.ilmc-exists-close')?.addEventListener('click', close);
        this.resultModalRoot.querySelector('.ilmc-result-confirm-btn')?.addEventListener('click', close);
        this.resultModalRoot.addEventListener('click', (e) => {
            const toggle = e.target.closest('.ilmc-result-toggle');
            if (!toggle) return;
            toggle.classList.toggle('expanded');
            const children = toggle.closest('.ilmc-result-node')?.querySelector(':scope > .ilmc-result-children');
            if (children) children.classList.toggle('ilmc-hidden');
        });
    }

    showImportResultModal(resultTree) {
        this.hideResultModal();
        const { success, fail } = this.countResultItems(resultTree);
        const mountContainer = this.options.mountContainer || document.body;
        this.resultModalRoot = document.createElement('div');
        this.resultModalRoot.className = 'ilmc-exists-mask';
        if (mountContainer === document.body) {
            this.resultModalRoot.style.cssText = 'position:fixed;inset:0;z-index:10001;';
        }
        this.resultModalRoot.innerHTML = `
            <div class="ilmc-exists-modal ilmc-result-modal" role="dialog" aria-modal="true" aria-label="导入结果">
                <div class="ilmc-exists-header">
                    <h3 class="ilmc-exists-title">导入结果</h3>
                    <button type="button" class="ilmc-exists-close" aria-label="关闭">×</button>
                </div>
                <div class="ilmc-result-stats">
                    <div class="ilmc-result-stat">
                        <span class="ilmc-result-stat-icon success">✓</span>
                        <span>导入成功：${success}</span>
                    </div>
                    <div class="ilmc-result-stat">
                        <span class="ilmc-result-stat-icon fail">✕</span>
                        <span>导入失败：${fail}</span>
                    </div>
                </div>
                <div class="ilmc-result-body">
                    ${this.renderResultTree(resultTree)}
                </div>
                <div class="ilmc-exists-divider"></div>
                <div class="ilmc-exists-footer">
                    <button type="button" class="ilmc-btn primary ilmc-result-confirm-btn">确定</button>
                </div>
            </div>
        `;
        mountContainer.appendChild(this.resultModalRoot);
        this.bindResultModalEvents();
    }

    finishBatchImport(checkedItems) {
        this.hideExistsModal();
        const checkedCtUids = new Set(checkedItems.map((item) => item.ctUid));
        const resultTree = this.buildImportResultTree(checkedCtUids);
        this.hide();
        this.showImportResultModal(resultTree);
    }

    handleImportClick() {
        const checkedPatients = this.getCheckedPatients();
        if (!checkedPatients.length) {
            window.alert('请至少选择一个患者');
            return;
        }

        const checkedItems = this.getCheckedTreeItemsFromDom();
        if (!checkedItems.length) {
            window.alert('请至少选择一条图像数据');
            return;
        }

        const { importable, skipped } = this.classifyImportItems(checkedItems);

        if (!importable.length && !skipped.length) {
            window.alert('请至少选择一条图像数据');
            return;
        }

        if (!importable.length && skipped.length) {
            if (skipped.length === 1 && checkedItems.length === 1) {
                this.showExistsModal(skipped[0]);
                return;
            }
        }

        this.finishBatchImport(checkedItems);
    }

    updateExistsModalMode() {
        if (!this.existsModalRoot) return;
        const mode = this.existsModalRoot.querySelector('input[name="ilmc-import-mode"]:checked')?.value;
        const newWrap = this.existsModalRoot.querySelector('.ilmc-exists-new-wrap');
        const errorEl = this.existsModalRoot.querySelector('.ilmc-exists-error');
        if (newWrap) newWrap.classList.toggle('ilmc-hidden', mode !== 'new');
        if (errorEl) errorEl.classList.add('ilmc-hidden');
    }

    hideExistsModal() {
        if (!this.existsModalRoot) return;
        this.existsModalRoot.remove();
        this.existsModalRoot = null;
        this.pendingExistsPatient = null;
    }

    handleExistsConfirm() {
        if (!this.existsModalRoot || !this.pendingExistsPatient) return;
        const mode = this.existsModalRoot.querySelector('input[name="ilmc-import-mode"]:checked')?.value;
        const errorEl = this.existsModalRoot.querySelector('.ilmc-exists-error');

        if (mode === 'merge') {
            const { patientId, patientName } = this.pendingExistsPatient;
            this.finishImportSuccess(`已将导入数据合并到患者 ${patientId} ${patientName}`);
            return;
        }

        const newIdInput = this.existsModalRoot.querySelector('.ilmc-exists-new-input');
        const newId = String(newIdInput?.value || '').trim();
        if (!newId) {
            if (errorEl) {
                errorEl.textContent = '请输入患者ID';
                errorEl.classList.remove('ilmc-hidden');
            }
            return;
        }
        if (this.isExistingPatientId(newId)) {
            if (errorEl) {
                errorEl.textContent = `患者ID ${newId} 已存在，请重新输入`;
                errorEl.classList.remove('ilmc-hidden');
            }
            return;
        }

        this.finishImportSuccess(`已新建患者 ${newId} 并导入`);
    }

    formatExistsMessage(item) {
        const patientLabel = item.patientName
            ? `${item.patientName}（${item.patientId}）`
            : item.patientId;
        return `所选图像与患者 ${patientLabel} 中已有图像重复，请选择导入方式。`;
    }

    showExistsModal(item) {
        this.hideExistsModal();
        this.pendingExistsPatient = item;
        this.existsModalRoot = document.createElement('div');
        this.existsModalRoot.className = 'ilmc-exists-mask';
        this.existsModalRoot.innerHTML = `
            <div class="ilmc-exists-modal" role="dialog" aria-modal="true" aria-label="图像重复提示">
                <div class="ilmc-exists-header">
                    <h3 class="ilmc-exists-title">图像重复</h3>
                    <button type="button" class="ilmc-exists-close" aria-label="关闭">×</button>
                </div>
                <div class="ilmc-exists-body">
                    <div class="ilmc-exists-msg">${this.formatExistsMessage(item)}</div>
                    <label class="ilmc-exists-option">
                        <input type="radio" name="ilmc-import-mode" value="merge" checked>
                        <span>合并到已存在的患者中</span>
                    </label>
                    <label class="ilmc-exists-option">
                        <input type="radio" name="ilmc-import-mode" value="new">
                        <span>新建患者</span>
                    </label>
                    <div class="ilmc-exists-new-wrap ilmc-hidden">
                        <div class="ilmc-exists-new-row">
                            <span class="ilmc-exists-new-label">患者ID</span>
                            <input type="text" class="ilmc-exists-new-input" placeholder="请输入患者ID">
                        </div>
                        <div class="ilmc-exists-error ilmc-hidden"></div>
                    </div>
                </div>
                <div class="ilmc-exists-divider"></div>
                <div class="ilmc-exists-footer">
                    <button type="button" class="ilmc-btn ilmc-exists-cancel-btn">取消</button>
                    <button type="button" class="ilmc-btn primary ilmc-exists-confirm-btn">确定</button>
                </div>
            </div>
        `;

        this.root.appendChild(this.existsModalRoot);
        this.existsModalRoot.addEventListener('click', (e) => {
            if (e.target.closest('.ilmc-exists-close') || e.target.closest('.ilmc-exists-cancel-btn')) {
                this.hideExistsModal();
            }
        });
        this.existsModalRoot.addEventListener('change', (e) => {
            if (e.target.matches('input[name="ilmc-import-mode"]')) {
                this.updateExistsModalMode();
            }
        });
        this.existsModalRoot.querySelector('.ilmc-exists-confirm-btn')
            ?.addEventListener('click', () => this.handleExistsConfirm());
    }

    bindEvents() {
        if (!this.root) return;

        this.root.addEventListener('click', (e) => {
            if (e.target.closest('.ilmc-import-btn')) {
                this.handleImportClick();
                return;
            }
            if (e.target.closest('.ilmc-close') || e.target.closest('.ilmc-cancel-btn')) {
                this.hide();
                return;
            }
            const tab = e.target.closest('.ilmc-tab');
            if (tab) {
                const tabType = tab.getAttribute('data-tab');
                if (tabType && tabType !== this.activeTab) {
                    this.activeTab = tabType;
                    this.updateBody();
                }
                return;
            }
            if (this.activeTab === 'external' && e.target.closest('.ilmc-external-toolbar .ilmc-refresh-btn:not(:disabled)')) {
                const input = this.root.querySelector('.ilmc-external-search-input');
                if (input) this.handleExternalSearch(input.value);
            }
        });

        this.root.addEventListener('input', (e) => {
            if (!e.target.matches('.ilmc-external-search-input')) return;
            this.externalState.searchValue = e.target.value;
        });

        this.root.addEventListener('change', (e) => {
            if (e.target.matches('.ilmc-patient-checkbox')) {
                this.handlePatientCheckboxChange(e.target);
                return;
            }
            if (!e.target.matches('.ilmc-remote-node-select')) return;
            const input = this.root.querySelector('.ilmc-external-search-input');
            if (input) this.externalState.searchValue = input.value;
            this.externalState.selectedNode = e.target.value;
            if (!this.externalState.selectedNode) {
                this.resetExternalSearch();
                return;
            }
            this.clearExternalResults();
            this.updateExternalSearchInput();
        });

        this.root.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' || !e.target.matches('.ilmc-external-search-input:not(:disabled)')) return;
            e.preventDefault();
            this.handleExternalSearch(e.target.value);
        });
    }

    updateBody() {
        if (!this.root) return;

        this.root.querySelectorAll('.ilmc-tab').forEach((tab) => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === this.activeTab);
        });

        const bodyEl = this.root.querySelector('.ilmc-body');
        if (bodyEl) {
            bodyEl.innerHTML = this.renderContent();
        }
    }

    show() {
        if (this.root) return;

        this.root = document.createElement('div');
        const mountContainer = this.options.mountContainer || document.body;
        this.root.className = mountContainer === document.body ? 'ilmc-wrap overlay' : 'ilmc-wrap';
        if (mountContainer === document.body) {
            this.root.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.55);';
        } else {
            this.root.style.position = 'relative';
        }
        this.root.innerHTML = `
            <div class="ilmc-modal" role="dialog" aria-modal="false" aria-label="导入（旧版）">
                <div class="ilmc-header">
                    <h3 class="ilmc-title">导入</h3>
                    <button type="button" class="ilmc-close" aria-label="关闭">×</button>
                </div>
                <div class="ilmc-tabs">
                    <div class="ilmc-tab${this.activeTab === 'remote' ? ' active' : ''}" data-tab="remote">远程节点导入</div>
                    <div class="ilmc-tab${this.activeTab === 'local' ? ' active' : ''}" data-tab="local">本地导入</div>
                    <div class="ilmc-tab${this.activeTab === 'external' ? ' active' : ''}" data-tab="external">外部DICOM Query</div>
                </div>
                <div class="ilmc-body">
                    ${this.renderContent()}
                </div>
            </div>
        `;

        mountContainer.appendChild(this.root);
        this.bindEvents();
    }

    hide() {
        this.hideExistsModal();
        this.hideResultModal();
        if (!this.root) return;
        this.root.remove();
        this.root = null;
    }

    destroy() {
        this.hide();
    }
}

if (typeof window !== 'undefined') {
    window.ImportLegacyModalComponent = ImportLegacyModalComponent;
}
