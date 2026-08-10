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
            pwdLen: '5'
        },
        XHDR18: {
            code: '00000005',
            name: 'XHDR18',
            remark: '',
            saver: 'manteia',
            saveDate: '2025-03-11 14:02:08',
            channels: '18',
            channelContinuous: true,
            steps: ['2.5', '5.0'],
            maxPoints: '48',
            minTime: '0.1',
            maxTime: '999.9',
            sourceLength: '900.0',
            genPassword: false,
            pwdDigit: true,
            pwdLetter: false,
            pwdLen: '5'
        }
    };

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
            });
        });
    }

    function fillMachineForm(data) {
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
        $('#mfPwdLen').value = data.pwdLen;

        const list = $('#mfStepList');
        list.innerHTML = '';
        (data.steps || []).forEach((step) => {
            const input = document.createElement('input');
            input.className = 'pm-input sm';
            input.type = 'text';
            input.value = step;
            list.appendChild(input);
        });
    }

    function initMachineTree() {
        const tree = $('#machineTree');
        tree.addEventListener('click', function (e) {
            const item = e.target.closest('.pm-tree-item');
            if (!item || item.classList.contains('disabled') || item.classList.contains('child')) return;
            const machineId = item.getAttribute('data-machine');
            if (!machineId || !MACHINE_DATA[machineId]) return;
            $all('.pm-tree-item[data-machine]', tree).forEach((el) => el.classList.remove('active'));
            item.classList.add('active');
            fillMachineForm(MACHINE_DATA[machineId]);
        });

        $('#mfStepAdd').addEventListener('click', function () {
            const input = document.createElement('input');
            input.className = 'pm-input sm';
            input.type = 'text';
            input.value = '2.5';
            $('#mfStepList').appendChild(input);
            input.focus();
        });
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

    document.addEventListener('DOMContentLoaded', function () {
        initTabs();
        initMachineTree();
        initApplicator();
        initLocator();
        initModals();
        initWindowControls();
        drawApplicatorPreview();
        drawLocatorPreview();
    });
})();
