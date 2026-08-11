(function () {
    const MACHINE_DATA = {
        XHDR30: {
            code: '00000002',
            name: 'XHDR30',
            remark: 'shandongshengzhong',
            saver: 'manteia',
            saveDate: '2025-06-17 10:25:14',
            channels: '12',
            channelContinuous: true,
            steps: ['2.5', '3.0', '5.0'],
            maxPoints: '48',
            minTime: '0.1',
            maxTime: '999.9',
            sourceLength: '850.0',
            genPassword: true,
            pwdDigit: true,
            pwdLetter: true,
            pwdLen: '6'
        },
        XHDR18: {
            code: '00000001',
            name: 'XHDR18',
            remark: '',
            saver: 'manteia',
            saveDate: '2025-12-03 09:43:06',
            channels: '12',
            channelContinuous: true,
            steps: ['2.5', '5.0'],
            maxPoints: '48',
            minTime: '0.1',
            maxTime: '999.9',
            sourceLength: '850.0',
            genPassword: false,
            pwdDigit: true,
            pwdLetter: true,
            pwdLen: '6'
        }
    };

    const TG43_GR = [
        [0, 0.985],
        [0.5, 0.9965],
        [1, 1],
        [1.5, 1.0017],
        [2, 1.0037],
        [2.5, 0.995],
        [3, 0.98],
        [4, 0.95],
        [5, 0.92],
        [6, 0.89],
        [8, 0.84],
        [10, 0.8],
        [12, 0.76],
        [15, 0.72]
    ];

    const TG43_F_R = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
    const TG43_F_THETA = [0, 5, 10, 15, 20];
    const TG43_F = [
        [0.709, 0.649, 0.62, 0.61, 0.605, 0.6, 0.598, 0.596, 0.595],
        [0.75, 0.72, 0.7, 0.69, 0.685, 0.68, 0.678, 0.676, 0.675],
        [0.82, 0.8, 0.78, 0.77, 0.765, 0.76, 0.758, 0.756, 0.755],
        [0.88, 0.86, 0.85, 0.84, 0.835, 0.83, 0.828, 0.826, 0.825],
        [0.93, 0.91, 0.9, 0.895, 0.89, 0.888, 0.886, 0.885, 0.884]
    ];

    const SOURCE_DATA = {
        'src-xhs-c': {
            name: 'XHS-Ir192-1',
            manufacturer: 'Nucletron B.V.',
            model: '',
            calibrateDate: '2025-04-28 21:21:00',
            isotope: 'Ir192',
            sourceType: 'LINE',
            airKerma: '4.0700',
            calibrateActivity: '11.3735',
            todayActivity: '0.1391',
            todayUpdate: '2026-08-11 00:00:00',
            halfLife: '73.8',
            doseRate: '1.109',
            status: 'commissioned',
            deprecated: false,
            defaultTg43: true,
            defaultTg186: true,
            supportTg186: false
        },
        'src-xhs-u': {
            name: 'XHS-Ir192-1',
            manufacturer: 'Nucletron B.V.',
            model: '',
            calibrateDate: '2025-04-28 21:21:00',
            isotope: 'Ir192',
            sourceType: 'LINE',
            airKerma: '4.0700',
            calibrateActivity: '11.3735',
            todayActivity: '0.1391',
            todayUpdate: '2026-08-11 00:00:00',
            halfLife: '73.8',
            doseRate: '1.109',
            status: 'uncommissioned',
            deprecated: false,
            defaultTg43: true,
            defaultTg186: true,
            supportTg186: false
        },
        'src-rexi': {
            name: 'Rexisource Ir192',
            manufacturer: 'Nucletron B.V.',
            model: '',
            calibrateDate: '2025-05-01 10:00:00',
            isotope: 'Ir192',
            sourceType: 'LINE',
            airKerma: '4.0700',
            calibrateActivity: '10.5000',
            todayActivity: '0.1200',
            todayUpdate: '2026-08-11 00:00:00',
            halfLife: '73.8',
            doseRate: '1.109',
            status: 'uncommissioned',
            deprecated: false,
            defaultTg43: true,
            defaultTg186: true,
            supportTg186: false
        },
        'src-xhs-d': {
            name: 'XHS-Ir192-1-1',
            manufacturer: 'Nucletron B.V.',
            model: '',
            calibrateDate: '2025-04-28 21:21:00',
            isotope: 'Ir192',
            sourceType: 'LINE',
            airKerma: '4.0700',
            calibrateActivity: '11.3735',
            todayActivity: '0.1391',
            todayUpdate: '2026-08-11 00:00:00',
            halfLife: '73.8',
            deprecateDate: '2025-08-14 14:31:41',
            doseRate: '1.109',
            status: 'uncommissioned',
            deprecated: true,
            defaultTg43: true,
            defaultTg186: true,
            supportTg186: false
        }
    };

    let selectedSourceId = null;
    let sourceEditing = false;

    const APPLICATORS = [
        {
            id: 'app-1',
            name: '宫颈穹窿管11AT',
            remark: '',
            executor: 'manteia',
            saveTime: '2025-08-19 16:51:44',
            usedInPlan: true,
            params: [
                ['后端长度', '132.5 mm'],
                ['前端圆穹曲率角度', '10°'],
                ['前端圆穹曲率半径', '200.0 mm'],
                ['中部段长度', '38.8 mm'],
                ['中部端直径', '6.0 mm'],
                ['前端直径', '4.0 mm'],
                ['前端段长度', '36.8 mm'],
                ['探测长度', '15.9 mm'],
                ['前端弯曲角度', '60°'],
                ['中轴长度', '38.6 mm']
            ],
            shape: 'curved'
        },
        {
            id: 'app-2',
            name: '宫颈穹窿管55',
            remark: '',
            executor: 'manteia',
            saveTime: '2025-08-12 11:20:03',
            usedInPlan: false,
            params: [
                ['后端长度', '140.0 mm'],
                ['前端圆穹曲率角度', '12°'],
                ['前端圆穹曲率半径', '180.0 mm'],
                ['中部段长度', '40.0 mm'],
                ['中部端直径', '6.0 mm'],
                ['前端直径', '4.0 mm'],
                ['前端段长度', '38.0 mm'],
                ['探测长度', '16.0 mm']
            ],
            shape: 'curved'
        },
        {
            id: 'app-3',
            name: '高源直腔管55',
            remark: '',
            executor: 'manteia',
            saveTime: '2025-07-30 09:14:22',
            usedInPlan: true,
            params: [
                ['后端长度', '150.0 mm'],
                ['中部端直径', '5.0 mm'],
                ['前端直径', '4.0 mm'],
                ['中轴长度', '55.0 mm'],
                ['探测长度', '18.0 mm']
            ],
            shape: 'straight'
        },
        {
            id: 'app-4',
            name: '插植针测试',
            remark: '测试',
            executor: 'manteia',
            saveTime: '2025-07-18 15:40:11',
            usedInPlan: false,
            params: [
                ['长度', '200.0 mm'],
                ['截面直径', '1.5 mm'],
                ['探测长度', '10.0 mm']
            ],
            shape: 'needle'
        },
        {
            id: 'app-5',
            name: '穹窿管标准型',
            remark: '',
            executor: 'manteia',
            saveTime: '2025-06-02 10:08:55',
            usedInPlan: true,
            params: [
                ['后端长度', '128.0 mm'],
                ['前端圆穹曲率角度', '10°'],
                ['前端圆穹曲率半径', '210.0 mm'],
                ['中部段长度', '36.0 mm'],
                ['中部端直径', '6.0 mm'],
                ['前端直径', '4.0 mm']
            ],
            shape: 'curved'
        }
    ];

    const LOCATOR_TYPE_CONFIG = {
        A1: {
            group: 'A',
            defaultName: 'A1型定位器',
            sizes: [
                ['总长 L', '150 mm'],
                ['外径 φ', '27 mm'],
                ['球冠半径 SR', '13.5 mm']
            ]
        },
        A2: {
            group: 'A',
            defaultName: 'A2型定位器',
            sizes: [
                ['总长 L', '120 mm'],
                ['外径 D', '27 mm'],
                ['直筒段长度 H1', '65 mm'],
                ['锥面夹角 C', '176.6°'],
                ['端头宽度 WT', '13.00 mm'],
                ['端头长度 WS', '19.00 mm'],
                ['上段锥台高度 Ht1', '25.50 mm'],
                ['下段锥台高度 Ht2', '29.50 mm'],
                ['中部截面长度 WM', '24.80 mm'],
                ['中部截面宽度 WL', '22.60 mm']
            ]
        },
        A3: {
            group: 'A',
            defaultName: 'A3型定位器',
            sizes: [
                ['总长 L', '120 mm'],
                ['主体外径 D', '27 mm'],
                ['平直圆柱段长度 L1', '95 mm'],
                ['过渡段轴向长度 H', '22 mm'],
                ['端头宽度 WT', '14 mm'],
                ['端头长度 WS', '3 mm'],
                ['端头厚度 WH', '6 mm'],
                ['偏心距 E', '9.8 mm']
            ]
        },
        A4: {
            group: 'A',
            defaultName: 'A4型定位器',
            sizes: [
                ['总长 L', '120 mm'],
                ['主体外径 D', '33 mm'],
                ['平直圆柱段长度 L1', '35 mm'],
                ['锥面夹角 C', '172.5°'],
                ['过渡段轴向尺寸 W1', '11.3 mm'],
                ['截面径向尺寸 W2', '32.3 mm'],
                ['锥段轴向长度 Ht', '73.7 mm']
            ]
        },
        'B-I-1': {
            group: 'B',
            defaultName: 'B-I-1型定位器',
            sizes: []
        },
        'B-II-2': {
            group: 'B',
            defaultName: 'B-II-2型定位器',
            sizes: []
        }
    };

    const LOCATORS = [
        {
            id: 'loc-1',
            name: 'B-I-1型定位器',
            remark: '',
            executor: 'manteia',
            saveTime: '2025-08-01 13:22:10',
            usedInPlan: false,
            type: 'B-I-1',
            needles: '插植针测试',
            channels: '直路通道0座（直径20）',
            shape: 'cylinder'
        },
        {
            id: 'loc-2',
            name: 'A1型定位器',
            remark: '',
            executor: 'manteia',
            saveTime: '2025-07-21 16:05:44',
            usedInPlan: true,
            type: 'A1',
            sizes: LOCATOR_TYPE_CONFIG.A1.sizes,
            shape: 'cylinder'
        },
        {
            id: 'loc-3',
            name: 'B-II-2型定位器',
            remark: '',
            executor: 'manteia',
            saveTime: '2025-06-15 09:33:18',
            usedInPlan: false,
            type: 'B-II-2',
            needles: '高源直腔管55',
            channels: '直路通道1座（直径18）',
            shape: 'cylinder'
        }
    ];

    let selectedApplicatorId = APPLICATORS[0].id;
    let selectedLocatorId = LOCATORS[0].id;

    function $(sel, root) {
        return (root || document).querySelector(sel);
    }

    function $all(sel, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(sel));
    }

    function closePage() {
        if (window.history && window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '../index.html';
        }
    }

    function showModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('show');
    }

    function hideModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
    }

    function initTabs() {
        const tabs = $all('.pm-tab');
        tabs.forEach((tab) => {
            tab.addEventListener('click', function () {
                const tabId = this.getAttribute('data-tab');
                tabs.forEach((t) => t.classList.toggle('active', t === this));
                $all('.pm-panel').forEach((panel) => {
                    panel.classList.toggle('active', panel.id === 'panel-' + tabId);
                });
                if (tabId === 'applicator') drawApplicatorPreview();
                if (tabId === 'locator') drawLocatorPreview();
                if (tabId === 'ct' && typeof refreshCtView === 'function') refreshCtView();
            });
        });
    }

    function showMachinePanel() {
        $('#machineForm').hidden = false;
        $('#sourceForm').hidden = true;
        selectedSourceId = null;
        sourceEditing = false;
    }

    function showSourcePanel() {
        $('#machineForm').hidden = true;
        $('#sourceForm').hidden = false;
    }

    function fillMachineForm(data, status) {
        showMachinePanel();
        $('#mfCode').value = data.code;
        $('#mfName').value = data.name;
        $('#mfRemark').value = data.remark;
        $('#mfSaver').value = data.saver;
        $('#mfSaveDate').value = data.saveDate;
        $('#mfChannels').value = data.channels;
        $('#mfChannelContinuous').checked = !!data.channelContinuous;
        $('#mfMaxPoints').value = data.maxPoints;
        $('#mfMinTime').value = data.minTime;
        $('#mfMaxTime').value = data.maxTime;
        $('#mfSourceLength').value = data.sourceLength;
        $('#mfGenPassword').checked = !!data.genPassword;
        $('#mfPwdDigit').checked = !!data.pwdDigit;
        $('#mfPwdLetter').checked = !!data.pwdLetter;
        $('#mfPwdLen').value = data.pwdLen || '6';
        syncDicomPasswordOptions();
        renderStepList(data.steps && data.steps.length ? data.steps : ['2.5']);

        const canEdit = status === 'uncommissioned';
        const saveBtn = $('#mfSaveBtn');
        if (saveBtn) saveBtn.hidden = !canEdit;
        [
            'mfCode', 'mfName', 'mfRemark', 'mfChannels', 'mfChannelContinuous',
            'mfMaxPoints', 'mfMinTime', 'mfMaxTime', 'mfSourceLength',
            'mfGenPassword', 'mfPwdDigit', 'mfPwdLetter', 'mfPwdLen'
        ].forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (id === 'mfCode' || id === 'mfName' || id === 'mfRemark' || id === 'mfChannels' ||
                id === 'mfMaxPoints' || id === 'mfMinTime' || id === 'mfMaxTime' || id === 'mfSourceLength' || id === 'mfPwdLen') {
                el.readOnly = !canEdit;
            } else {
                el.disabled = !canEdit;
            }
        });
        $all('.pm-step-item input', $('#mfStepList')).forEach((input) => {
            input.readOnly = !canEdit;
        });
        $all('.pm-step-btn', $('#mfStepBox')).forEach((btn) => {
            btn.disabled = !canEdit || (btn.classList.contains('add') && $all('.pm-step-item', $('#mfStepList')).length >= STEP_MAX_COUNT);
        });
        if (canEdit) syncDicomPasswordOptions();
    }

    function syncDicomPasswordOptions() {
        const enabled = $('#mfGenPassword') && $('#mfGenPassword').checked;
        const options = $('#mfPwdOptions');
        if (!options) return;
        options.classList.toggle('is-disabled', !enabled);
        ['mfPwdDigit', 'mfPwdLetter', 'mfPwdLen'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.disabled = !enabled;
        });
    }

    const STEP_DEFAULT = '2.5';
    const STEP_MAX_COUNT = 10;
    const STEP_MIN = 0.1;
    const STEP_MAX = 99.9;
    const STEP_PLACEHOLDER = '0.1～99.9';

    function formatStepValue(num) {
        return (Math.round(num * 10) / 10).toFixed(1);
    }

    function syncStepAddButton() {
        const addBtn = $('#mfStepAdd');
        if (!addBtn) return;
        const count = $all('.pm-step-item', $('#mfStepList')).length;
        addBtn.disabled = count >= STEP_MAX_COUNT;
    }

    function createStepItem(value) {
        const row = document.createElement('div');
        row.className = 'pm-step-item';

        const input = document.createElement('input');
        input.className = 'pm-input';
        input.type = 'text';
        input.value = value || STEP_DEFAULT;
        input.placeholder = STEP_PLACEHOLDER;
        input.setAttribute('data-last-valid', input.value);

        input.addEventListener('focus', function () {
            if (!this.value.trim()) this.placeholder = STEP_PLACEHOLDER;
        });

        input.addEventListener('blur', function () {
            const raw = this.value.trim();
            if (!raw) {
                this.value = STEP_DEFAULT;
                this.setAttribute('data-last-valid', STEP_DEFAULT);
                return;
            }
            const num = Number(raw);
            if (!Number.isFinite(num) || num < STEP_MIN || num > STEP_MAX) {
                this.value = this.getAttribute('data-last-valid') || STEP_DEFAULT;
                return;
            }
            const formatted = formatStepValue(num);
            this.value = formatted;
            this.setAttribute('data-last-valid', formatted);
        });

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'pm-step-btn remove';
        removeBtn.title = '删除';
        removeBtn.innerHTML = '<i class="fas fa-minus"></i>';
        removeBtn.addEventListener('click', function () {
            row.remove();
            syncStepAddButton();
        });

        row.appendChild(input);
        row.appendChild(removeBtn);
        return row;
    }

    function renderStepList(steps) {
        const list = $('#mfStepList');
        if (!list) return;
        list.innerHTML = '';
        (steps || [STEP_DEFAULT]).slice(0, STEP_MAX_COUNT).forEach((step) => {
            list.appendChild(createStepItem(String(step)));
        });
        syncStepAddButton();
    }

    function setTreeActive(item) {
        $all('.pm-tree-item', $('#machineTree')).forEach((el) => el.classList.remove('active'));
        if (item) item.classList.add('active');
    }

    function renderSourceAttrs(data) {
        const fields = [
            ['放射源名称', data.name, 'name', false],
            ['制造商', data.manufacturer, 'manufacturer', false],
            ['放射源型号规格', data.model || '', 'model', false],
            ['校准日期', data.calibrateDate, 'calibrateDate', false],
            ['同位素', data.isotope, 'isotope', false],
            ['放射源类型', data.sourceType, null, true],
            ['空气比释动能率常数', data.airKerma, 'airKerma', false],
            ['校准日期源活度', data.calibrateActivity, 'calibrateActivity', false, 'Ci'],
            ['今日源活度', data.todayActivity, null, true, 'Ci'],
            ['今日源活度更新日期', data.todayUpdate, null, true],
            ['半衰期[天]', data.halfLife, 'halfLife', false]
        ];
        if (data.deprecated && data.deprecateDate) {
            fields.push(['弃用日期', data.deprecateDate, null, true]);
        }

        const editable = sourceEditing && data.status === 'uncommissioned' && !data.deprecated;
        $('#srcAttrGrid').innerHTML = fields.map(([label, value, key, readonly, unit]) => {
            const canEdit = editable && key && !readonly;
            const unitHtml = unit ? `<span class="unit">${unit}</span>` : '';
            if (canEdit) {
                return `
                    <div class="pm-source-field">
                        <label>${label}</label>
                        <div style="display:flex;align-items:center;gap:4px;">
                            <input class="pm-input" data-src-field="${key}" type="text" value="${value}">
                            ${unitHtml}
                        </div>
                    </div>
                `;
            }
            return `
                <div class="pm-source-field">
                    <label>${label}</label>
                    <div class="pm-source-text">${value || ''}${unit ? ' ' + unit : ''}</div>
                </div>
            `;
        }).join('');
    }

    function renderTg43Tables() {
        const grBody = $('#srcGrTable tbody');
        grBody.innerHTML = TG43_GR.map(([r, g]) => `<tr><td>${r}</td><td>${g}</td></tr>`).join('');

        const fHead = $('#srcFTable thead');
        const fBody = $('#srcFTable tbody');
        fHead.innerHTML = `<tr><th>θ\\r(cm)</th>${TG43_F_R.map((r) => `<th>${r}</th>`).join('')}</tr>`;
        fBody.innerHTML = TG43_F_THETA.map((theta, i) => `
            <tr>
                <td>θ=${theta}°</td>
                ${TG43_F[i].map((v) => `<td>${v}</td>`).join('')}
            </tr>
        `).join('');
    }

    function drawGrChart() {
        const canvas = $('#srcGrCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, w, h);

        const pad = { l: 36, r: 12, t: 12, b: 28 };
        const plotW = w - pad.l - pad.r;
        const plotH = h - pad.t - pad.b;
        const xMax = 15;
        const yMin = 0.7;
        const yMax = 1.0;

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 6; i++) {
            const y = pad.t + (plotH * i) / 6;
            ctx.beginPath();
            ctx.moveTo(pad.l, y);
            ctx.lineTo(pad.l + plotW, y);
            ctx.stroke();
        }
        for (let i = 0; i <= 5; i++) {
            const x = pad.l + (plotW * i) / 5;
            ctx.beginPath();
            ctx.moveTo(x, pad.t);
            ctx.lineTo(x, pad.t + plotH);
            ctx.stroke();
        }

        ctx.strokeStyle = '#e53935';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        TG43_GR.forEach(([r, g], idx) => {
            const x = pad.l + (r / xMax) * plotW;
            const y = pad.t + ((yMax - g) / (yMax - yMin)) * plotH;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.fillText('r(cm)', w / 2 - 10, h - 8);
        ctx.fillText('1.0', 8, pad.t + 4);
        ctx.fillText('0.7', 8, pad.t + plotH);
    }

    function drawFChart() {
        const canvas = $('#srcFCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, w, h);

        const pad = { l: 28, r: 10, t: 10, b: 24 };
        const plotW = w - pad.l - pad.r;
        const plotH = h - pad.t - pad.b;
        const xMax = 175;
        const yMin = 0.5;
        const yMax = 0.95;

        ctx.strokeStyle = '#333';
        for (let i = 0; i <= 4; i++) {
            const y = pad.t + (plotH * i) / 4;
            ctx.beginPath();
            ctx.moveTo(pad.l, y);
            ctx.lineTo(pad.l + plotW, y);
            ctx.stroke();
        }

        ctx.strokeStyle = '#e53935';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let a = 0; a <= 175; a += 5) {
            const idx = Math.min(Math.floor(a / 5), TG43_F.length - 1);
            const v = TG43_F[Math.min(idx, TG43_F.length - 1)][2];
            const factor = 0.75 + 0.2 * Math.cos((a * Math.PI) / 180);
            const yVal = Math.min(yMax, Math.max(yMin, v * factor));
            const x = pad.l + (a / xMax) * plotW;
            const y = pad.t + ((yMax - yVal) / (yMax - yMin)) * plotH;
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.lineTo(pad.l + plotW, pad.t + plotH);
        ctx.lineTo(pad.l, pad.t + plotH);
        ctx.closePath();
        ctx.fillStyle = 'rgba(229, 57, 53, 0.25)';
        ctx.fill();

        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.fillText('θ(°)', w / 2 - 8, h - 6);
    }

    function fillSourceForm(sourceId) {
        const data = SOURCE_DATA[sourceId];
        if (!data) return;
        selectedSourceId = sourceId;
        showSourcePanel();

        const canEditBtn = data.status === 'uncommissioned' && !data.deprecated;
        $('#srcEditBtn').hidden = !canEditBtn;
        $('#srcUpdateModelBtn').hidden = !canEditBtn;
        $('#srcEditBtn').textContent = sourceEditing ? '保存' : '编辑';
        $('#srcUpdateModelBtn').disabled = !sourceEditing;

        renderSourceAttrs(data);
        $('#srcDoseRate').value = data.doseRate;
        $('#srcDoseRate').readOnly = true;
        $('#srcTg43Warn').hidden = !data.defaultTg43;
        $('#srcTg186Warn').hidden = !data.defaultTg186;
        $('#srcTg186').checked = !!data.supportTg186;

        renderTg43Tables();
        drawGrChart();
        drawFChart();
    }

    function hideContextMenu() {
        const menu = $('#pmContextMenu');
        if (menu) {
            menu.hidden = true;
            menu.innerHTML = '';
        }
    }

    function showContextMenu(x, y, items) {
        const menu = $('#pmContextMenu');
        if (!menu) return;
        menu.innerHTML = items.map((it) => (
            `<button type="button" data-action="${it.action}">${it.label}</button>`
        )).join('');
        menu.hidden = false;
        const mw = menu.offsetWidth || 140;
        const mh = menu.offsetHeight || 80;
        menu.style.left = Math.min(x, window.innerWidth - mw - 8) + 'px';
        menu.style.top = Math.min(y, window.innerHeight - mh - 8) + 'px';
    }

    let menuTarget = null;

    function initMachineTree() {
        const tree = $('#machineTree');

        tree.addEventListener('click', function (e) {
            hideContextMenu();
            const item = e.target.closest('.pm-tree-item');
            if (!item) return;

            const sourceId = item.getAttribute('data-source');
            const machineId = item.getAttribute('data-machine');
            const status = item.getAttribute('data-status');

            if (sourceId && SOURCE_DATA[sourceId]) {
                setTreeActive(item);
                sourceEditing = false;
                fillSourceForm(sourceId);
                return;
            }

            if (machineId && MACHINE_DATA[machineId]) {
                setTreeActive(item);
                fillMachineForm(MACHINE_DATA[machineId], status);
            }
        });

        tree.addEventListener('contextmenu', function (e) {
            const item = e.target.closest('.pm-tree-item');
            if (!item) return;
            e.preventDefault();

            const sourceId = item.getAttribute('data-source');
            const machineId = item.getAttribute('data-machine');
            const status = item.getAttribute('data-status');
            const parent = item.getAttribute('data-machine-parent');

            if (machineId && status === 'uncommissioned') {
                setTreeActive(item);
                fillMachineForm(MACHINE_DATA[machineId], status);
                showContextMenu(e.clientX, e.clientY, [
                    { action: 'add-source', label: '添加放射源' },
                    { action: 'commission', label: 'Commission' },
                    { action: 'delete-machine', label: '删除' }
                ]);
                menuTarget = { type: 'machine', id: machineId, status: status };
                return;
            }

            if (machineId && status === 'commissioned') {
                setTreeActive(item);
                fillMachineForm(MACHINE_DATA[machineId], status);
                showContextMenu(e.clientX, e.clientY, [
                    { action: 'uncommission', label: 'Uncommission' },
                    { action: 'deprecate-machine', label: '弃用' }
                ]);
                menuTarget = { type: 'machine', id: machineId, status: status };
                return;
            }

            if (sourceId && SOURCE_DATA[sourceId]) {
                setTreeActive(item);
                sourceEditing = false;
                fillSourceForm(sourceId);
                const src = SOURCE_DATA[sourceId];
                if (src.deprecated) return;
                if (src.status === 'uncommissioned') {
                    showContextMenu(e.clientX, e.clientY, [
                        { action: 'add-source', label: '添加放射源' },
                        { action: 'copy-source', label: '复制' },
                        { action: 'deprecate-source', label: '弃用' }
                    ]);
                    menuTarget = { type: 'source', id: sourceId, parent: parent, status: src.status };
                } else if (src.status === 'commissioned') {
                    showContextMenu(e.clientX, e.clientY, [
                        { action: 'deprecate-source', label: '弃用' },
                        { action: 'uncommission', label: 'Uncommission' }
                    ]);
                    menuTarget = { type: 'source', id: sourceId, parent: parent, status: src.status };
                }
            }
        });

        document.addEventListener('click', hideContextMenu);
        window.addEventListener('blur', hideContextMenu);

        const menu = $('#pmContextMenu');
        if (menu) {
            menu.addEventListener('click', function (e) {
                const btn = e.target.closest('button[data-action]');
                if (!btn) return;
                const action = btn.getAttribute('data-action');
                hideContextMenu();
                handleContextAction(action);
            });
        }

        $('#mfStepAdd').addEventListener('click', function () {
            if (this.disabled) return;
            const list = $('#mfStepList');
            const item = createStepItem(STEP_DEFAULT);
            list.appendChild(item);
            syncStepAddButton();
            item.querySelector('input').focus();
        });

        const genPwd = $('#mfGenPassword');
        if (genPwd) {
            genPwd.addEventListener('change', syncDicomPasswordOptions);
        }

        $('#srcEditBtn').addEventListener('click', function () {
            if (!selectedSourceId) return;
            const data = SOURCE_DATA[selectedSourceId];
            if (!data || data.deprecated || data.status !== 'uncommissioned') return;
            if (!sourceEditing) {
                sourceEditing = true;
                fillSourceForm(selectedSourceId);
                return;
            }
            $all('[data-src-field]', $('#srcAttrGrid')).forEach((input) => {
                const key = input.getAttribute('data-src-field');
                if (key) data[key] = input.value;
            });
            sourceEditing = false;
            fillSourceForm(selectedSourceId);
            alert('保存成功');
        });

        $('#srcUpdateModelBtn').addEventListener('click', function () {
            if (this.disabled) return;
            alert('请选择本地算法文件以更新建模数据（原型示意）');
        });

        $('#srcExportBtn').addEventListener('click', function () {
            alert('导出放射源衰减报告（原型示意）');
        });

        fillMachineForm(MACHINE_DATA.XHDR30, 'commissioned');
    }

    function handleContextAction(action) {
        if (!menuTarget) return;
        if (action === 'add-source') {
            alert('已添加放射源 New Rexisource（原型示意）');
        } else if (action === 'commission') {
            alert('Commission 成功（原型示意）');
        } else if (action === 'delete-machine') {
            if (confirm('确认删除该机器及其放射源？')) alert('已删除（原型示意）');
        } else if (action === 'uncommission') {
            alert('Uncommission 成功（原型示意）');
        } else if (action === 'deprecate-machine' || action === 'deprecate-source') {
            if (confirm('确认弃用？')) alert('已弃用（原型示意）');
        } else if (action === 'copy-source') {
            alert('复制成功（原型示意）');
        }
        menuTarget = null;
    }

    function renderApplicatorTable() {
        const tbody = $('#applicatorTable tbody');
        tbody.innerHTML = APPLICATORS.map((item) => `
            <tr data-id="${item.id}" class="${item.id === selectedApplicatorId ? 'active' : ''}">
                <td>${item.name}</td>
                <td>${item.remark || ''}</td>
                <td>${item.executor}</td>
                <td>${item.saveTime}</td>
            </tr>
        `).join('');
    }

    function renderApplicatorDetail() {
        const item = APPLICATORS.find((a) => a.id === selectedApplicatorId) || APPLICATORS[0];
        $('#appDetailName').textContent = item.name;
        $('#appDetailUsed').textContent = '是否被计划使用：' + (item.usedInPlan ? '是' : '否');
        $('#appViewPlansBtn').style.display = item.usedInPlan ? '' : 'none';
        $('#appParams').innerHTML = item.params.map(([label, value]) => `
            <div class="pm-param">${label}：<span>${value}</span></div>
        `).join('');
        drawApplicatorPreview();
    }

    function initApplicator() {
        renderApplicatorTable();
        renderApplicatorDetail();

        $('#applicatorTable tbody').addEventListener('click', function (e) {
            const tr = e.target.closest('tr[data-id]');
            if (!tr) return;
            selectedApplicatorId = tr.getAttribute('data-id');
            renderApplicatorTable();
            renderApplicatorDetail();
        });

        $('#appViewPlansBtn').addEventListener('click', function () {
            openPlanListModal('使用该施源器的计划列表');
        });
    }

    function renderLocatorTable() {
        const tbody = $('#locatorTable tbody');
        tbody.innerHTML = LOCATORS.map((item) => `
            <tr data-id="${item.id}" class="${item.id === selectedLocatorId ? 'active' : ''}">
                <td>${item.name}</td>
                <td>${item.remark || ''}</td>
                <td>${item.executor}</td>
                <td>${item.saveTime}</td>
            </tr>
        `).join('');
    }

    function isTypeALocator(item) {
        if (!item) return false;
        if (item.type && LOCATOR_TYPE_CONFIG[item.type]) {
            return LOCATOR_TYPE_CONFIG[item.type].group === 'A';
        }
        return /^A\d型/.test(item.name || '') || /^A型/.test(item.name || '');
    }

    function openPlanListModal(title) {
        const titleEl = $('#planListModalTitle');
        if (titleEl) titleEl.textContent = title;
        showModal('planListModal');
    }

    function renderLocatorDetail() {
        const item = LOCATORS.find((a) => a.id === selectedLocatorId) || LOCATORS[0];
        $('#locDetailName').textContent = item.name;
        $('#locDetailUsed').textContent = '是否被计划使用：' + (item.usedInPlan ? '是' : '否');
        $('#locViewPlansBtn').style.display = item.usedInPlan ? '' : 'none';
        let html = '';
        if (isTypeALocator(item)) {
            const sizes = item.sizes || (LOCATOR_TYPE_CONFIG[item.type] && LOCATOR_TYPE_CONFIG[item.type].sizes) || [];
            html = sizes.map(([label, value]) => (
                `<div>${label}：<strong>${value}</strong></div>`
            )).join('');
        } else {
            html = `
                <div>可用源导针：<strong>${item.needles || '-'}</strong></div>
                <div>可用管状通道数：<strong>${item.channels || '-'}</strong></div>
            `;
        }
        $('#locInfoLines').innerHTML = html;
        drawLocatorPreview();
    }

    function initLocator() {
        renderLocatorTable();
        renderLocatorDetail();

        $('#locatorTable tbody').addEventListener('click', function (e) {
            const tr = e.target.closest('tr[data-id]');
            if (!tr) return;
            selectedLocatorId = tr.getAttribute('data-id');
            renderLocatorTable();
            renderLocatorDetail();
        });

        function renderAddLocatorSizes(type) {
            const config = LOCATOR_TYPE_CONFIG[type] || LOCATOR_TYPE_CONFIG.A1;
            const block = $('#addLocSizeBlock');
            const isTypeA = config.group === 'A';
            block.hidden = !isTypeA;
            if (!isTypeA) {
                block.innerHTML = '';
                return;
            }
            block.innerHTML = config.sizes.map(([label, value]) => `
                <div class="pm-form-row pm-loc-size-row">
                    <span class="pm-form-label">${label}</span>
                    <div class="pm-form-field">
                        <span class="pm-loc-size-value">${value}</span>
                    </div>
                </div>
            `).join('');
        }

        function syncAddLocatorFormByType() {
            const type = $('#addLocType').value;
            const config = LOCATOR_TYPE_CONFIG[type] || LOCATOR_TYPE_CONFIG.A1;
            const isTypeA = config.group === 'A';
            $('#addLocName').value = config.defaultName;
            renderAddLocatorSizes(type);
            $all('.pm-loc-extra-field').forEach((row) => {
                row.hidden = isTypeA;
            });
            if (isTypeA) {
                $('#addLocNeedle').value = '';
                $('#addLocTube').value = '';
            }
        }

        $('#locViewPlansBtn').addEventListener('click', function () {
            openPlanListModal('使用该定位器的计划列表');
        });

        document.querySelector('[data-action="loc-add"]').addEventListener('click', function () {
            $('#addLocType').value = 'A1';
            $('#addLocRemark').value = '';
            $('#addLocNeedle').value = '';
            $('#addLocTube').value = '';
            syncAddLocatorFormByType();
            showModal('addLocatorModal');
        });

        $('#addLocType').addEventListener('change', function () {
            syncAddLocatorFormByType();
        });

        $('#addLocConfirmBtn').addEventListener('click', function () {
            const type = $('#addLocType').value;
            const config = LOCATOR_TYPE_CONFIG[type] || LOCATOR_TYPE_CONFIG.A1;
            const isTypeA = config.group === 'A';
            const name = ($('#addLocName').value || '').trim() || config.defaultName;
            const remark = ($('#addLocRemark').value || '').trim();
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const saveTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
            const needle = $('#addLocNeedle').value;
            const tube = $('#addLocTube').value;
            const newItem = {
                id: 'loc-' + Date.now(),
                name: name,
                remark: remark,
                executor: 'manteia',
                saveTime: saveTime,
                usedInPlan: false,
                type: type,
                sizes: isTypeA ? config.sizes.slice() : undefined,
                needles: isTypeA ? undefined : (needle || undefined),
                channels: isTypeA ? undefined : (tube || undefined),
                shape: 'cylinder'
            };
            LOCATORS.unshift(newItem);
            selectedLocatorId = newItem.id;
            hideModal('addLocatorModal');
            renderLocatorTable();
            renderLocatorDetail();
        });
    }

    function drawApplicatorPreview() {
        const canvas = $('#appCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, w, h);

        const item = APPLICATORS.find((a) => a.id === selectedApplicatorId) || APPLICATORS[0];
        const grad = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.7);
        grad.addColorStop(0, '#d8d8d8');
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(1, '#9a9a9a');
        ctx.strokeStyle = grad;
        ctx.lineWidth = item.shape === 'needle' ? 3 : 8;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255,255,255,0.35)';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        if (item.shape === 'straight' || item.shape === 'needle') {
            ctx.moveTo(w * 0.18, h * 0.55);
            ctx.lineTo(w * 0.82, h * 0.45);
        } else {
            ctx.moveTo(w * 0.12, h * 0.62);
            ctx.bezierCurveTo(w * 0.35, h * 0.62, w * 0.55, h * 0.55, w * 0.72, h * 0.38);
            ctx.quadraticCurveTo(w * 0.82, h * 0.28, w * 0.88, h * 0.42);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#cfcfcf';
        ctx.beginPath();
        ctx.arc(w * 0.12, h * 0.62, item.shape === 'needle' ? 3 : 6, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawLocatorPreview() {
        const canvas = $('#locCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, w, h);

        const cx = w * 0.5;
        const top = h * 0.18;
        const bodyH = h * 0.55;
        const r = 42;

        const bodyGrad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
        bodyGrad.addColorStop(0, '#6a6a6a');
        bodyGrad.addColorStop(0.45, '#d0d0d0');
        bodyGrad.addColorStop(1, '#5a5a5a');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(cx - r, top + 20);
        ctx.lineTo(cx - r, top + bodyH);
        ctx.quadraticCurveTo(cx, top + bodyH + 18, cx + r, top + bodyH);
        ctx.lineTo(cx + r, top + 20);
        ctx.quadraticCurveTo(cx, top + 4, cx - r, top + 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#8a8a8a';
        ctx.beginPath();
        ctx.ellipse(cx, top + 20, r, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a4a4a';
        [[-16, -4], [0, -8], [16, -4], [-10, 8], [10, 8]].forEach(([dx, dy]) => {
            ctx.beginPath();
            ctx.ellipse(cx + dx, top + 20 + dy, 4, 2.2, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#b8b8b8';
        ctx.beginPath();
        ctx.ellipse(cx, top + bodyH + 4, r + 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7a7a7a';
        ctx.beginPath();
        ctx.ellipse(cx, top + bodyH + 4, r - 6, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    function initModals() {
        $all('[data-close]').forEach((btn) => {
            btn.addEventListener('click', function () {
                hideModal(this.getAttribute('data-close'));
            });
        });

        $all('.pm-modal-mask').forEach((mask) => {
            mask.addEventListener('click', function (e) {
                if (e.target === mask) hideModal(mask.id);
            });
        });
    }

    function initWindowControls() {
        $('#pmCloseBtn').addEventListener('click', closePage);
        $('#pmMinimizeBtn').addEventListener('click', closePage);
    }

    const CT_MATERIALS_OPTIONS = [
        'Water', 'Cartilage', 'CorticalBone', 'DryAir', 'LungICRP', 'TissueICRU',
        'Adipose', 'Blood', 'Brain', 'Liver', 'Muscle', 'Skin', 'SoftTissue',
        'SpinalCord', 'Spleen', 'Thyroid', 'Titanium'
    ];

    const CT_DATA = {
        'ct-ge': {
            name: 'GE MEDICAL SYSTEMS',
            manufacturer: 'GE MEDICAL SYSTEMS',
            executor: 'mpadmin',
            commissionData: '2021-03-29 09:50:28',
            status: 'commissioned',
            electron: [
                [-1050, 0], [-1000, 0], [-808, 0.2], [-483, 0.5], [-70, 0.96],
                [-35, 0.99], [0, 1], [44.5, 1.06], [47, 1.07], [100, 1.1]
            ],
            mass: [
                [-1000, 0.001], [-992, 0.001], [-976, 0.001], [-480, 0.5], [-96, 0.95],
                [0, 1], [48, 1.05], [128, 1.1], [528, 1.334], [976, 1.603]
            ],
            materials: [
                ['Water', 0, 0],
                ['Cartilage', 612, 612],
                ['CorticalBone', 2000, 2000],
                ['DryAir', -875, -875],
                ['LungICRP', -370, -370],
                ['TissueICRU', 257, 257]
            ]
        },
        'ct-default': {
            name: 'Default template',
            manufacturer: 'Manteia',
            executor: 'mpadmin',
            commissionData: '2021-03-29 09:50:28',
            status: 'commissioned',
            electron: [
                [-1050, 0], [-1000, 0], [-808, 0.2], [-483, 0.5], [-70, 0.96],
                [-35, 0.99], [0, 1], [44.5, 1.06], [47, 1.07], [100, 1.1]
            ],
            mass: [
                [-1000, 0], [0, 1], [800, 1.75]
            ],
            materials: [
                ['Water', 0, 0],
                ['Cartilage', 612, 612],
                ['CorticalBone', 2000, 2000],
                ['DryAir', -875, -875],
                ['LungICRP', -370, -370],
                ['TissueICRU', 257, 257]
            ]
        },
        'ct-new': {
            name: 'new Machine',
            manufacturer: '',
            executor: '',
            commissionData: '',
            status: 'uncommissioned',
            electron: [],
            mass: [],
            materials: []
        }
    };

    let selectedCtId = 'ct-ge';
    let ctEditing = false;
    let ctSelectedRow = { electron: -1, mass: -1, material: -1 };
    let ctModalState = null;
    let ctMenuTarget = null;

    function fmt4(n) {
        const num = Number(n);
        if (!Number.isFinite(num)) return '0.0000';
        return num.toFixed(4);
    }

    function drawCtChart(canvasId, points, yLabel) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, w, h);

        const pad = { l: 40, r: 16, t: 12, b: 28 };
        const plotW = w - pad.l - pad.r;
        const plotH = h - pad.t - pad.b;

        let xMin = 0;
        let xMax = 15000;
        let yMin = canvasId.indexOf('Mass') >= 0 ? -5 : -10;
        let yMax = canvasId.indexOf('Mass') >= 0 ? 15 : 15;

        if (points && points.length) {
            const xs = points.map((p) => p[0]);
            const ys = points.map((p) => p[1]);
            xMin = Math.min.apply(null, xs);
            xMax = Math.max.apply(null, xs);
            if (xMax === xMin) {
                xMin -= 100;
                xMax += 100;
            }
            const yPad = Math.max(0.5, (Math.max.apply(null, ys) - Math.min.apply(null, ys)) * 0.2);
            yMin = Math.min.apply(null, ys) - yPad;
            yMax = Math.max.apply(null, ys) + yPad;
        }

        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = pad.t + (plotH * i) / 5;
            const x = pad.l + (plotW * i) / 5;
            ctx.beginPath();
            ctx.moveTo(pad.l, y);
            ctx.lineTo(pad.l + plotW, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, pad.t);
            ctx.lineTo(x, pad.t + plotH);
            ctx.stroke();
        }

        ctx.strokeStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(pad.l, pad.t);
        ctx.lineTo(pad.l, pad.t + plotH);
        ctx.lineTo(pad.l + plotW, pad.t + plotH);
        ctx.stroke();

        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.fillText(String(Math.round(yMax)), 4, pad.t + 8);
        ctx.fillText(String(Math.round(yMin)), 4, pad.t + plotH);
        ctx.fillText(String(Math.round(xMin)), pad.l, h - 8);
        ctx.fillText(String(Math.round(xMax)), pad.l + plotW - 28, h - 8);

        if (!points || !points.length) return;

        const sorted = points.slice().sort((a, b) => a[0] - b[0]);
        ctx.strokeStyle = '#5eb8e8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        sorted.forEach((p, idx) => {
            const x = pad.l + ((p[0] - xMin) / (xMax - xMin)) * plotW;
            const y = pad.t + ((yMax - p[1]) / (yMax - yMin)) * plotH;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    function renderCtPairTable(tableId, rows, key) {
        const tbody = document.querySelector('#' + tableId + ' tbody');
        if (!tbody) return;
        tbody.innerHTML = rows.map((row, idx) => `
            <tr data-idx="${idx}" class="${ctSelectedRow[key] === idx ? 'active' : ''}">
                <td>${fmt4(row[0])}</td>
                <td>${fmt4(row[1])}</td>
            </tr>
        `).join('');
    }

    function renderCtMaterialTable(rows) {
        const tbody = document.querySelector('#ctMaterialTable tbody');
        if (!tbody) return;
        tbody.innerHTML = rows.map((row, idx) => `
            <tr data-idx="${idx}" class="${ctSelectedRow.material === idx ? 'active' : ''}">
                <td>${row[0]}</td>
                <td>
                    <div class="pm-ct-hu-range">
                        <input class="pm-input" type="text" value="${fmt4(row[1])}" ${ctEditing ? '' : 'readonly'}>
                        <span>-</span>
                        <input class="pm-input" type="text" value="${fmt4(row[2])}" ${ctEditing ? '' : 'readonly'}>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function syncCtActionButtons() {
        const editable = ctEditing;
        $all('.pm-ct-table-actions').forEach((bar) => {
            bar.classList.toggle('is-disabled', !editable);
        });
    }

    function refreshCtView() {
        const data = CT_DATA[selectedCtId];
        if (!data) return;

        $('#ctName').value = data.name || '';
        $('#ctManufacturer').value = data.manufacturer || '';
        $('#ctExecutor').value = data.executor || '';
        $('#ctCommissionData').value = data.commissionData || '';

        const canEdit = data.status === 'uncommissioned';
        const editBtn = $('#ctEditBtn');
        editBtn.hidden = !canEdit;
        editBtn.textContent = ctEditing ? '保存' : '编辑';

        ['ctName', 'ctManufacturer'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.readOnly = !(ctEditing && canEdit);
        });
        $('#ctExecutor').readOnly = true;
        $('#ctCommissionData').readOnly = true;

        renderCtPairTable('ctElectronTable', data.electron, 'electron');
        renderCtPairTable('ctMassTable', data.mass, 'mass');
        renderCtMaterialTable(data.materials);
        syncCtActionButtons();
        drawCtChart('ctElectronCanvas', data.electron, '相对电子密度');
        drawCtChart('ctMassCanvas', data.mass, '质量密度');
    }

    function openCtRowModal(mode, tableKey) {
        const data = CT_DATA[selectedCtId];
        if (!data) return;
        const isMaterial = tableKey === 'material';
        const titleMap = { add: '添加', edit: '编辑' };
        $('#ctRowModalTitle').textContent = titleMap[mode] || '编辑';
        const body = $('#ctRowModalBody');

        if (isMaterial) {
            const row = mode === 'edit' ? data.materials[ctSelectedRow.material] : ['Water', 0, 0];
            body.innerHTML = `
                <div class="pm-form-row">
                    <label class="pm-form-label">材料</label>
                    <div class="pm-form-field">
                        <input class="pm-input" id="ctModalMaterial" list="ctMaterialList" value="${row[0]}">
                        <datalist id="ctMaterialList">
                            ${CT_MATERIALS_OPTIONS.map((m) => `<option value="${m}"></option>`).join('')}
                        </datalist>
                    </div>
                </div>
                <div class="pm-form-row">
                    <label class="pm-form-label">HU最小值</label>
                    <div class="pm-form-field"><input class="pm-input" id="ctModalHuMin" type="text" value="${fmt4(row[1])}"></div>
                </div>
                <div class="pm-form-row">
                    <label class="pm-form-label">HU最大值</label>
                    <div class="pm-form-field"><input class="pm-input" id="ctModalHuMax" type="text" value="${fmt4(row[2])}"></div>
                </div>
            `;
        } else {
            const list = tableKey === 'electron' ? data.electron : data.mass;
            const row = mode === 'edit' ? list[ctSelectedRow[tableKey]] : [0, 0];
            const secondLabel = tableKey === 'electron' ? '电子密度' : '质量密度';
            body.innerHTML = `
                <div class="pm-form-row">
                    <label class="pm-form-label">HU</label>
                    <div class="pm-form-field"><input class="pm-input" id="ctModalHu" type="text" value="${fmt4(row[0])}"></div>
                </div>
                <div class="pm-form-row">
                    <label class="pm-form-label">${secondLabel}</label>
                    <div class="pm-form-field"><input class="pm-input" id="ctModalVal" type="text" value="${fmt4(row[1])}"></div>
                </div>
            `;
        }

        ctModalState = { mode: mode, tableKey: tableKey };
        showModal('ctRowModal');
    }

    function initCtConfig() {
        const tree = $('#ctTree');
        if (!tree) return;

        tree.addEventListener('click', function (e) {
            hideContextMenu();
            const item = e.target.closest('.pm-tree-item[data-ct]');
            if (!item) return;
            selectedCtId = item.getAttribute('data-ct');
            ctEditing = false;
            ctSelectedRow = { electron: -1, mass: -1, material: -1 };
            $all('.pm-tree-item', tree).forEach((el) => el.classList.remove('active'));
            item.classList.add('active');
            refreshCtView();
        });

        tree.addEventListener('contextmenu', function (e) {
            const item = e.target.closest('.pm-tree-item[data-ct]');
            const group = e.target.closest('[data-ct-group="uncommissioned"]');
            e.preventDefault();

            if (group && !item) {
                showContextMenu(e.clientX, e.clientY, [
                    { action: 'ct-create', label: 'Create new machine' }
                ]);
                ctMenuTarget = { type: 'group' };
                return;
            }
            if (!item) return;

            const id = item.getAttribute('data-ct');
            const status = item.getAttribute('data-status');
            selectedCtId = id;
            ctEditing = false;
            $all('.pm-tree-item', tree).forEach((el) => el.classList.remove('active'));
            item.classList.add('active');
            refreshCtView();

            if (status === 'commissioned') {
                showContextMenu(e.clientX, e.clientY, [
                    { action: 'ct-copy', label: '复制' },
                    { action: 'ct-deprecate', label: '弃用' }
                ]);
                ctMenuTarget = { type: 'machine', id: id, status: status };
            } else if (status === 'uncommissioned') {
                showContextMenu(e.clientX, e.clientY, [
                    { action: 'ct-commission', label: 'Commission' },
                    { action: 'ct-delete', label: '删除' }
                ]);
                ctMenuTarget = { type: 'machine', id: id, status: status };
            }
        });

        const menu = $('#pmContextMenu');
        if (menu) {
            menu.addEventListener('click', function (e) {
                const btn = e.target.closest('button[data-action]');
                if (!btn || !ctMenuTarget) return;
                const action = btn.getAttribute('data-action');
                if (!String(action).startsWith('ct-')) return;
                hideContextMenu();
                if (action === 'ct-create') {
                    alert('已创建 new Machine（原型示意）');
                } else if (action === 'ct-copy') {
                    alert('已复制到 Uncommissioned 机器（原型示意）');
                } else if (action === 'ct-deprecate') {
                    if (confirm('确定要弃用吗？弃用后将无法恢复！')) alert('已弃用（原型示意）');
                } else if (action === 'ct-commission') {
                    alert('Commission 成功（原型示意）');
                } else if (action === 'ct-delete') {
                    if (confirm('确定要删除吗？删除后将无法恢复！')) alert('已删除（原型示意）');
                }
                ctMenuTarget = null;
            });
        }

        $('#ctEditBtn').addEventListener('click', function () {
            const data = CT_DATA[selectedCtId];
            if (!data || data.status !== 'uncommissioned') return;
            if (!ctEditing) {
                ctEditing = true;
                refreshCtView();
                return;
            }
            data.name = $('#ctName').value.trim() || data.name;
            data.manufacturer = $('#ctManufacturer').value.trim();
            ctEditing = false;
            const treeItem = document.querySelector('#ctTree .pm-tree-item[data-ct="' + selectedCtId + '"] span');
            if (treeItem) treeItem.textContent = data.name;
            refreshCtView();
            alert('保存成功');
        });

        ['ctElectronTable', 'ctMassTable', 'ctMaterialTable'].forEach((tableId) => {
            const key = tableId === 'ctElectronTable' ? 'electron' : (tableId === 'ctMassTable' ? 'mass' : 'material');
            const tbody = document.querySelector('#' + tableId + ' tbody');
            if (!tbody) return;
            tbody.addEventListener('click', function (e) {
                const tr = e.target.closest('tr[data-idx]');
                if (!tr) return;
                ctSelectedRow[key] = Number(tr.getAttribute('data-idx'));
                refreshCtView();
            });
        });

        $all('.pm-ct-table-actions').forEach((bar) => {
            bar.addEventListener('click', function (e) {
                if (!ctEditing) return;
                const btn = e.target.closest('[data-ct-act]');
                if (!btn) return;
                const act = btn.getAttribute('data-ct-act');
                const tableKey = bar.getAttribute('data-table');
                const data = CT_DATA[selectedCtId];
                const list = data[tableKey === 'electron' ? 'electron' : (tableKey === 'mass' ? 'mass' : 'materials')];
                const selected = ctSelectedRow[tableKey];

                if (act === 'add') {
                    openCtRowModal('add', tableKey);
                    return;
                }
                if (act === 'edit') {
                    if (selected < 0 || !list[selected]) {
                        alert(tableKey === 'material' ? '请选择一行材料编辑' : (tableKey === 'electron' ? '请选择一行电子密度编辑' : '请选择一行质量密度编辑'));
                        return;
                    }
                    openCtRowModal('edit', tableKey);
                    return;
                }
                if (act === 'delete') {
                    if (selected < 0 || !list[selected]) {
                        alert(tableKey === 'material' ? '请选择一行材料删除' : (tableKey === 'electron' ? '请选择一行电子密度删除' : '请选择一行质量密度删除'));
                        return;
                    }
                    list.splice(selected, 1);
                    ctSelectedRow[tableKey] = -1;
                    refreshCtView();
                }
            });
        });

        $('#ctRowConfirmBtn').addEventListener('click', function () {
            if (!ctModalState) return;
            const data = CT_DATA[selectedCtId];
            const { mode, tableKey } = ctModalState;

            if (tableKey === 'material') {
                const name = ($('#ctModalMaterial').value || '').trim();
                const min = Number($('#ctModalHuMin').value);
                const max = Number($('#ctModalHuMax').value);
                if (!name) {
                    alert('请填写材料名');
                    return;
                }
                if (!Number.isFinite(min) || !Number.isFinite(max)) {
                    alert('请填写有效的 HU 值');
                    return;
                }
                if (min > max) {
                    alert('材料最小HU值不允许超过最大值');
                    return;
                }
                const dup = data.materials.some((row, idx) => row[0] === name && !(mode === 'edit' && idx === ctSelectedRow.material));
                if (dup) {
                    alert('材料名已存在不允许重复');
                    return;
                }
                if (mode === 'edit') data.materials[ctSelectedRow.material] = [name, min, max];
                else data.materials.push([name, min, max]);
            } else {
                const hu = Number($('#ctModalHu').value);
                const val = Number($('#ctModalVal').value);
                if (!Number.isFinite(hu) || !Number.isFinite(val)) {
                    alert('请填写有效数值');
                    return;
                }
                const list = tableKey === 'electron' ? data.electron : data.mass;
                if (mode === 'edit') list[ctSelectedRow[tableKey]] = [hu, val];
                else list.push([hu, val]);
                list.sort((a, b) => a[0] - b[0]);
            }

            hideModal('ctRowModal');
            ctModalState = null;
            refreshCtView();
        });

        refreshCtView();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initTabs();
        initMachineTree();
        initApplicator();
        initLocator();
        initCtConfig();
        initModals();
        initWindowControls();
        drawApplicatorPreview();
        drawLocatorPreview();
    });
})();

