(function () {
    const USER = 'manteia';
    const MODELS = ['ProBeam', 'Hitachi', 'IBA', 'Mevion S250i', 'P-Cure'];
    const MATERIALS = {
        Water: { density: '1.2', excitation: '75.00', z: '1, 8', w: '0.1119, 0.8881' },
        PMMA: { density: '1.190', excitation: '74.00', z: '1, 6, 8', w: '0.0805, 0.5998, 0.3196' },
        Lexan: { density: '1.200', excitation: '73.10', z: '1, 6, 8', w: '0.0555, 0.7558, 0.1888' },
        '聚乙烯': { density: '0.940', excitation: '57.40', z: '1, 6', w: '0.1437, 0.8563' },
        'ABT树脂': { density: '1.001', excitation: '65.83', z: '1, 6, 7, 8', w: '0.03, 0.82, 0.075, 0.02' }
    };
    const MATERIAL_NAMES = Object.keys(MATERIALS);
    const NAME_RE = /^[A-Za-z0-9_\-(). ]{1,32}$/;
    const SNOUT_NAME_RE = /^[A-Za-z0-9_\-() ]{1,20}$/;

    const SPOT_SAMPLE = [
        ['70.00', '12.40', '12.10', '0.004', '0.004'],
        ['150.00', '8.20', '8.00', '0.003', '0.003'],
        ['230.00', '6.10', '5.90', '0.002', '0.002']
    ];
    const BRAGG_SAMPLE = [
        ['70.00', '4.1', '0.18'],
        ['150.00', '15.8', '0.22'],
        ['230.00', '32.4', '0.26']
    ];
    const DOSE_SAMPLE = [
        ['70.00', '2.00', '1.000'],
        ['150.00', '5.00', '1.000'],
        ['230.00', '10.00', '1.000']
    ];

    function probeamSnout() {
        return [{ name: 'S1', shape: '方形', min: '2.00', max: '42.10', inX: '', inY: '', outX: '', outY: '', cx: '', cy: '' }];
    }

    function probeamShifters() {
        return [
            { id: 'RS37mm', type: 'binary', material: 'Water', density: '1.2', wet: '5.70', thick: '3.00' },
            { id: 'RS34mm', type: 'binary', material: 'Water', density: '1.2', wet: '3.40', thick: '3.00' },
            { id: 'RS23mm', type: 'binary', material: 'Water', density: '1.2', wet: '2.30', thick: '3.00' }
        ];
    }

    function beamQuality(filled) {
        return {
            technique: 'Pencil Beam Scanning',
            delivery: filled ? '扫描束--调制扫描' : '',
            tankL: filled ? '48' : '',
            tankW: filled ? '48' : '',
            tankH: filled ? '41' : '',
            energyMin: filled ? '70.00' : '',
            energyMax: filled ? '230.00' : '',
            rangeMin: filled ? '4.0' : '',
            rangeMax: filled ? '32.0' : '',
            energyStep: filled ? '0.1' : '',
            fieldX: filled ? '30.0' : '',
            fieldY: filled ? '40.0' : '',
            posAcc: filled ? '0.10' : '',
            spotMin: filled ? '0.10' : '',
            spotMax: filled ? '2.00' : '',
            layerMin: filled ? '0.20' : '',
            layerMax: filled ? '1.00' : '',
            spotRows: filled ? SPOT_SAMPLE.map((r) => r.slice()) : [],
            braggRows: filled ? BRAGG_SAMPLE.map((r) => r.slice()) : [],
            doseRows: filled ? DOSE_SAMPLE.map((r) => r.slice()) : [],
            discrete: filled ? ['70.0', '100.0', '130.0', '160.0', '190.0', '230.0'] : []
        };
    }

    function baseMachine(partial) {
        return Object.assign({
            particle: 'Proton',
            doseType: 'RBE',
            pbs: true,
            comment: '',
            version: '',
            accel: '',
            model: '',
            code: '',
            gantryType: '',
            gantryStart: '',
            gantryStop: '',
            gantryAngle: '',
            couchRotStart: '',
            couchRotStop: '',
            couchPitchStart: '',
            couchPitchStop: '',
            couchRollStart: '',
            couchRollStop: '',
            isoMax: '',
            generalSaved: false,
            hasBeam: false,
            snouts: [],
            shifters: [],
            selectors: [],
            nozzles: [],
            mlc: [],
            blocks: [],
            beam: null,
            savedBy: '',
            savedAt: '',
            commissionedBy: '',
            commissionedAt: '',
            fit: ''
        }, partial);
    }

    const machines = [
        baseMachine({
            id: 'g2',
            name: 'G2',
            group: 'commissioned',
            code: '00000006',
            model: 'ProBeam',
            version: '4.2',
            accel: 'Cyclotron',
            comment: 'room-g2',
            commissionedBy: 'mpsadmin',
            commissionedAt: '2026-06-12 20:38:43',
            fit: 'Single Gaussian fitting',
            generalSaved: true,
            hasBeam: true,
            gantryType: 'Gantry',
            gantryStart: '0.0',
            gantryStop: '359.9',
            couchRotStart: '0.0',
            couchRotStop: '360.0',
            couchPitchStart: '0.0',
            couchPitchStop: '360.0',
            couchRollStart: '0.0',
            couchRollStop: '360.0',
            isoMax: '10',
            snouts: probeamSnout(),
            shifters: probeamShifters(),
            beam: beamQuality(true)
        }),
        baseMachine({
            id: 'g1',
            name: 'G1',
            group: 'commissioned',
            code: '00000005',
            model: 'ProBeam',
            version: '4.2',
            accel: 'Cyclotron',
            comment: 'room-g1',
            commissionedBy: 'mpsadmin',
            commissionedAt: '2026-06-12 20:09:32',
            fit: 'Single Gaussian fitting',
            generalSaved: true,
            hasBeam: true,
            gantryType: 'Gantry',
            gantryStart: '0.0',
            gantryStop: '359.9',
            couchRotStart: '0.0',
            couchRotStop: '360.0',
            couchPitchStart: '0.0',
            couchPitchStop: '360.0',
            couchRollStart: '0.0',
            couchRollStop: '360.0',
            isoMax: '10',
            snouts: probeamSnout(),
            shifters: probeamShifters(),
            beam: beamQuality(true)
        }),
        baseMachine({
            id: 'gtr3',
            name: 'GTR3',
            group: 'commissioned',
            code: '00000008',
            model: 'Hitachi',
            version: '1.0',
            accel: 'Synchrotron',
            comment: 'hitachi-room',
            commissionedBy: 'mpsadmin',
            commissionedAt: '2026-06-09 17:36:11',
            fit: 'Single Gaussian fitting',
            generalSaved: true,
            hasBeam: true,
            gantryType: 'Gantry',
            gantryStart: '0.0',
            gantryStop: '180.0',
            couchRotStart: '0.0',
            couchRotStop: '360.0',
            couchPitchStart: '0.0',
            couchPitchStop: '0.0',
            couchRollStart: '0.0',
            couchRollStop: '0.0',
            isoMax: '8',
            snouts: [{ name: 'S1', shape: '方形', min: '5.00', max: '40.00', inX: '20.00', inY: '20.00', outX: '25.00', outY: '25.00', cx: '0.00', cy: '0.00' }],
            shifters: [{ id: 'RS50mm', type: 'binary', material: 'PMMA', density: '1.190', wet: '5.80', thick: '5.00' }],
            blocks: [{ diameter: '8.00', thick: '2.00', material: 'Lexan', density: '1.200', excitation: '73.10', z: '1, 6, 8', w: '0.0555, 0.7558, 0.1888' }],
            beam: beamQuality(true)
        }),
        baseMachine({
            id: 'mevion',
            name: 'Test_Mevion',
            group: 'commissioned',
            code: '00000009',
            model: 'Mevion S250i',
            version: 'S250i',
            accel: 'Synchrocyclotron',
            comment: 'mevion-test',
            commissionedBy: 'mpsadmin',
            commissionedAt: '2026-04-20 17:36:11',
            fit: 'Single Gaussian fitting',
            generalSaved: true,
            hasBeam: true,
            gantryType: 'Gantry',
            gantryStart: '0.0',
            gantryStop: '359.9',
            couchRotStart: '0.0',
            couchRotStop: '180.0',
            couchPitchStart: '0.0',
            couchPitchStop: '0.0',
            couchRollStart: '0.0',
            couchRollStop: '0.0',
            isoMax: '4',
            snouts: [{ name: 'S1', shape: '圆形', min: '10.00', max: '30.00', inX: '14.00', inY: '', outX: '18.00', outY: '', cx: '0.00', cy: '0.00' }],
            selectors: [
                { id: 'ES01', type: 'binary', material: 'Lexan', density: '1.200', thick: '0.18', ref: '34.60', wet: '0.21' },
                { id: 'ES02', type: 'binary', material: 'Lexan', density: '1.200', thick: '0.36', ref: '32.96', wet: '0.42' },
                { id: 'ES03', type: 'binary', material: 'Lexan', density: '1.200', thick: '1.44', ref: '30.72', wet: '1.68' }
            ],
            nozzles: [
                { id: 'Source', type: 'window', material: 'Lexan', density: '1.200', thick: '0.05', ref: '40.00', wet: '0.06' },
                { id: 'Patient', type: 'window', material: 'Lexan', density: '1.200', thick: '0.02', ref: '8.00', wet: '0.02' }
            ],
            mlc: [
                { center: '-10.00000', width: '0.50', material: '钨' },
                { center: '-9.50000', width: '0.50', material: '钨' },
                { center: '-9.00000', width: '0.50', material: '钨' }
            ],
            beam: beamQuality(true)
        }),
        baseMachine({
            id: 'tp3',
            name: 'Test_ProbeamTR3',
            group: 'commissioned',
            code: '00000011',
            model: 'ProBeam',
            version: '4.3MR3',
            accel: 'Cyclotron',
            comment: 'test',
            commissionedBy: 'mpsadmin',
            commissionedAt: '2026-04-20 16:20:08',
            fit: 'Single Gaussian fitting',
            generalSaved: true,
            hasBeam: true,
            gantryType: 'Gantry',
            gantryStart: '0.0',
            gantryStop: '359.9',
            couchRotStart: '0.0',
            couchRotStop: '360.0',
            couchPitchStart: '3.0',
            couchPitchStop: '357.0',
            couchRollStart: '3.0',
            couchRollStop: '357.0',
            isoMax: '10',
            snouts: probeamSnout(),
            shifters: probeamShifters(),
            beam: beamQuality(true)
        }),
        baseMachine({
            id: 'tr3',
            name: 'ProBeam_TR3',
            group: 'commissioned',
            code: '00000010',
            model: 'ProBeam',
            version: '4.3MR3',
            accel: 'Cyclotron',
            comment: 'shandongshengzhong',
            commissionedBy: 'mpsadmin',
            commissionedAt: '2025-04-23 11:17:50',
            fit: 'Single Gaussian fitting',
            generalSaved: true,
            hasBeam: true,
            gantryType: 'Gantry',
            gantryStart: '0.0',
            gantryStop: '359.9',
            couchRotStart: '0.0',
            couchRotStop: '360.0',
            couchPitchStart: '3.0',
            couchPitchStop: '357.0',
            couchRollStart: '3.0',
            couchRollStop: '357.0',
            isoMax: '10',
            snouts: probeamSnout(),
            shifters: probeamShifters(),
            beam: beamQuality(true)
        }),
        baseMachine({
            id: 'pcure',
            name: 'PCure_01',
            group: 'commissioned',
            code: '00000012',
            model: 'P-Cure',
            version: '1.0',
            accel: 'Synchrotron',
            comment: 'pcure-chair',
            commissionedBy: 'mpsadmin',
            commissionedAt: '2026-11-10 15:40:00',
            fit: 'Single Gaussian fitting',
            generalSaved: true,
            hasBeam: true,
            gantryType: 'Fixed',
            gantryAngle: '90.0',
            couchRotStart: '0.0',
            couchRotStop: '360.0',
            couchPitchStart: '0.0',
            couchPitchStop: '90.0',
            couchRollStart: '-90.0',
            couchRollStop: '90.0',
            isoMax: '10',
            snouts: probeamSnout(),
            shifters: probeamShifters(),
            beam: beamQuality(true)
        }),
        baseMachine({
            id: 'new1',
            name: 'new machine',
            group: 'uncommissioned',
            hasBeam: true,
            beam: beamQuality(false),
            pbs: true
        })
    ];

    const collapsed = new Set();
    let selectedId = 'tr3';
    let selectedKind = 'machine';
    let editing = false;
    let draft = null;
    let machineTab = 'general';
    let beamTab = 'bgeneral';
    let activeObj = 'snout';
    let rowSel = { snout: -1, shifter: -1, selector: -1, nozzle: -1, mlc: -1, block: -1 };
    let confirmCb = null;
    let authCb = null;
    let toastTimer = null;
    let seq = 20;

    const $ = (id) => document.getElementById(id);

    function clone(v) {
        return JSON.parse(JSON.stringify(v));
    }

    function nowText() {
        const d = new Date();
        const p = (n) => String(n).padStart(2, '0');
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    }

    function toast(text) {
        const el = $('toast');
        el.textContent = text;
        el.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
    }

    function findMachine(id) {
        return machines.find((m) => m.id === id) || null;
    }

    function view() {
        return editing && draft ? draft : findMachine(selectedId);
    }

    function profile(model) {
        const p = {
            snout: true,
            shifter: model !== 'Mevion S250i',
            selector: model === 'Mevion S250i',
            nozzle: model === 'Mevion S250i',
            mlc: model === 'Mevion S250i',
            block: model === 'Hitachi',
            discrete: model === 'Mevion S250i'
        };
        if (!model) {
            p.shifter = true;
            p.selector = false;
            p.nozzle = false;
            p.mlc = false;
            p.block = false;
            p.discrete = false;
        }
        return p;
    }

    function isPcure(model) {
        return model === 'P-Cure';
    }

    function updateGeometryLayout(model) {
        const pc = isPcure(model);
        $('gantryRangeRow').hidden = pc;
        $('gantrySingleRow').hidden = !pc;
        $('supportTitle').textContent = pc ? '座椅范围' : '治疗床范围';
        $('rollName').textContent = pc ? '侧倾角度范围' : '翻滚角度范围';
    }

    function sorted(group) {
        const list = machines.filter((m) => m.group === group);
        if (group === 'commissioned') {
            return list.slice().sort((a, b) => (b.commissionedAt || '').localeCompare(a.commissionedAt || ''));
        }
        return list;
    }

    function machineLabel(m) {
        if (m.group === 'commissioned' && m.commissionedAt) return m.name + ' [' + m.commissionedAt + ']';
        return m.name;
    }

    function renderTree() {
        const root = $('machineTree');
        const scroll = root.scrollTop;
        root.innerHTML = '';
        const groups = [
            ['commissioned', 'Commissioned 机器'],
            ['uncommissioned', 'Uncommissioned 机器'],
            ['deprecated', '弃用的机器']
        ];
        groups.forEach(([gid, label]) => {
            const wrap = document.createElement('div');
            const hd = document.createElement('div');
            hd.className = 'tree-group-hd';
            hd.dataset.group = gid;
            const open = !collapsed.has('g:' + gid);
            hd.innerHTML = '<span class="chev' + (open ? ' open' : '') + '"></span><span class="pc-icon"></span>';
            const span = document.createElement('span');
            span.className = 'tree-label';
            span.textContent = label;
            hd.appendChild(span);
            wrap.appendChild(hd);

            const children = document.createElement('div');
            children.className = 'tree-children' + (open ? '' : ' collapsed');
            sorted(gid).forEach((m) => {
                const row = document.createElement('div');
                row.className = 'tree-machine' + (selectedKind === 'machine' && selectedId === m.id ? ' active' : '');
                row.dataset.id = m.id;
                const mOpen = !collapsed.has('m:' + m.id);
                row.innerHTML = '<span class="chev' + (m.hasBeam ? (mOpen ? ' open' : '') : '') + '" data-fold="1"></span>';
                if (!m.hasBeam) row.querySelector('.chev').style.visibility = 'hidden';
                const name = document.createElement('span');
                name.className = 'tree-label';
                name.textContent = machineLabel(m);
                name.title = machineLabel(m);
                row.appendChild(name);
                children.appendChild(row);
                if (m.hasBeam) {
                    const pbsWrap = document.createElement('div');
                    pbsWrap.className = 'tree-pbs-wrap' + (mOpen ? '' : ' collapsed');
                    const pbs = document.createElement('div');
                    pbs.className = 'tree-pbs' + (selectedKind === 'pbs' && selectedId === m.id ? ' active' : '');
                    pbs.dataset.id = m.id;
                    pbs.dataset.kind = 'pbs';
                    pbs.textContent = 'PBS';
                    pbsWrap.appendChild(pbs);
                    children.appendChild(pbsWrap);
                }
            });
            wrap.appendChild(children);
            root.appendChild(wrap);
        });
        root.scrollTop = scroll;
    }

    function setInput(id, value, editable) {
        const el = $(id);
        if (!el) return;
        if (el.tagName === 'SELECT') el.value = value || '';
        else if (el.type === 'checkbox') el.checked = !!value;
        else el.value = value == null ? '' : value;
        const lock = !editable;
        if (el.type === 'checkbox' || el.tagName === 'SELECT') el.disabled = lock;
        else if (id === 'fParticle' || id === 'fBy' || id === 'fTime' || id === 'fFit' || id === 'fDose') el.readOnly = true;
        else el.readOnly = lock;
        el.classList.remove('invalid');
    }

    function actorFields(m) {
        if (m.group === 'commissioned') return ['批准人', '调试完成时间', m.commissionedBy || '', m.commissionedAt || ''];
        if (!m.generalSaved) return ['批准人', '调试完成时间', '', ''];
        return ['保存人', '保存时间', m.savedBy || '', m.savedAt || ''];
    }

    function fillMachineForm() {
        const m = view();
        const canEdit = editing && m && m.group === 'uncommissioned';
        const geomOpen = canEdit && m.generalSaved;
        if (!m) return;
        setInput('fCode', m.code, canEdit);
        setInput('fName', m.name, canEdit);
        setInput('fModel', m.model, canEdit);
        setInput('fVersion', m.version, canEdit);
        setInput('fParticle', 'Proton', false);
        setInput('fAccel', m.accel, canEdit);
        setInput('fComment', m.comment, canEdit);
        const actor = actorFields(m);
        $('fByLabel').textContent = actor[0];
        $('fTimeLabel').textContent = actor[1];
        setInput('fBy', actor[2], false);
        setInput('fTime', actor[3], false);
        setInput('fFit', m.group === 'commissioned' ? (m.fit || 'Single Gaussian fitting') : '', false);
        setInput('fDose', 'RBE', false);
        setInput('fPbs', m.pbs !== false, canEdit);

        setInput('fGantryType', m.gantryType, geomOpen);
        setInput('fGantryAngle', m.gantryAngle, geomOpen);
        ['fGantryStart', 'fGantryStop', 'fCouchRotStart', 'fCouchRotStop', 'fCouchPitchStart', 'fCouchPitchStop', 'fCouchRollStart', 'fCouchRollStop', 'fIsoMax'].forEach((id) => {
            const key = {
                fGantryStart: 'gantryStart',
                fGantryStop: 'gantryStop',
                fCouchRotStart: 'couchRotStart',
                fCouchRotStop: 'couchRotStop',
                fCouchPitchStart: 'couchPitchStart',
                fCouchPitchStop: 'couchPitchStop',
                fCouchRollStart: 'couchRollStart',
                fCouchRollStop: 'couchRollStop',
                fIsoMax: 'isoMax'
            }[id];
            setInput(id, m[key], geomOpen);
        });
        updateGeometryLayout(m.model);

        const locked = !(m.generalSaved);
        $('geomLock').hidden = !locked;
        $('objLock').hidden = !locked;
        $('mlcLock').hidden = !locked;
        $('blockLock').hidden = !locked;
    }

    function markInvalid(id) {
        const el = $(id);
        if (el) el.classList.add('invalid');
    }

    function optionList(values, current) {
        return values.map((v) => {
            const o = document.createElement('option');
            o.value = v;
            o.textContent = v;
            if (v === current) o.selected = true;
            return o;
        });
    }

    function cellInput(value, opts) {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.value = value == null ? '' : value;
        input.disabled = !opts.enabled;
        if (opts.placeholder) input.placeholder = opts.placeholder;
        if (opts.maxLength) input.maxLength = opts.maxLength;
        input.dataset.field = opts.field;
        if (opts.markY) input.dataset.y = '1';
        td.appendChild(input);
        return td;
    }

    function cellSelect(value, values, opts) {
        const td = document.createElement('td');
        const sel = document.createElement('select');
        optionList(values, value).forEach((o) => sel.appendChild(o));
        sel.disabled = !opts.enabled;
        sel.dataset.field = opts.field;
        td.appendChild(sel);
        return td;
    }

    function bindRow(tr, row, kind) {
        tr.addEventListener('mousedown', () => {
            rowSel[kind] = Number(tr.dataset.index);
            tr.parentElement.querySelectorAll('tr').forEach((item) => {
                item.classList.toggle('selected', item === tr);
            });
        });
        tr.querySelectorAll('input, select').forEach((el) => {
            const write = () => {
                if (!draft) return;
                row[el.dataset.field] = el.value;
            };
            el.addEventListener('input', () => {
                write();
                if (el.dataset.field === 'material' && MATERIALS[el.value]) {
                    const mat = MATERIALS[el.value];
                    row.density = mat.density;
                    const dens = tr.querySelector('[data-field="density"]');
                    if (dens) dens.value = mat.density;
                    if ('excitation' in row) {
                        row.excitation = mat.excitation;
                        row.z = mat.z;
                        row.w = mat.w;
                        const map = { excitation: mat.excitation, z: mat.z, w: mat.w };
                        Object.keys(map).forEach((key) => {
                            const node = tr.querySelector('[data-field="' + key + '"]');
                            if (node) node.value = map[key];
                        });
                    }
                }
            });
            el.addEventListener('change', () => {
                write();
                if (kind === 'snout' && el.dataset.field === 'shape') {
                    const circular = row.shape === '圆形';
                    if (circular) {
                        row.inY = '';
                        row.outY = '';
                    }
                    tr.querySelectorAll('[data-y]').forEach((inp) => {
                        inp.disabled = circular || !objectsEditable();
                        if (circular) inp.value = '';
                    });
                }
            });
        });
    }

    function renderSimpleRows(body, rows, kind, columns, enabled) {
        body.innerHTML = '';
        rows.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.dataset.index = String(index);
            if (rowSel[kind] === index) tr.className = 'selected';
            columns.forEach((col) => {
                if (col.type === 'select') tr.appendChild(cellSelect(row[col.field], col.values, { enabled, field: col.field }));
                else tr.appendChild(cellInput(row[col.field], { enabled, field: col.field, placeholder: col.placeholder, maxLength: col.maxLength, markY: col.markY }));
            });
            if (kind === 'snout' && row.shape === '圆形') {
                tr.querySelectorAll('[data-y]').forEach((input) => {
                    input.disabled = true;
                    input.value = '';
                });
            }
            bindRow(tr, row, kind);
            body.appendChild(tr);
        });
    }

    function objectsEditable() {
        const m = view();
        return editing && m && m.group === 'uncommissioned' && m.generalSaved;
    }

    function renderObjectTables() {
        const m = view();
        if (!m) return;
        const enabled = objectsEditable();
        const snoutCols = [
            { field: 'name', maxLength: 20 },
            { field: 'shape', type: 'select', values: ['方形', '圆形'] },
            { field: 'min', placeholder: '[0.00 ~ 100.00]' },
            { field: 'max', placeholder: '[0.00 ~ 100.00]' },
            { field: 'inX', placeholder: '[0.00 ~ 100.00]' },
            { field: 'inY', placeholder: '[0.00 ~ 100.00]', markY: true },
            { field: 'outX', placeholder: '[0.00 ~ 100.00]' },
            { field: 'outY', placeholder: '[0.00 ~ 100.00]', markY: true },
            { field: 'cx', placeholder: '[-100.00 ~ 100.00]' },
            { field: 'cy', placeholder: '[-100.00 ~ 100.00]' }
        ];
        renderSimpleRows($('snoutBody'), m.snouts || [], 'snout', snoutCols, enabled);
        renderSimpleRows($('shifterBody'), m.shifters || [], 'shifter', [
            { field: 'id', maxLength: 20 },
            { field: 'type', type: 'select', values: ['binary', 'analog'] },
            { field: 'material', type: 'select', values: MATERIAL_NAMES },
            { field: 'density' },
            { field: 'wet' },
            { field: 'thick' }
        ], enabled);
        renderSimpleRows($('selectorBody'), m.selectors || [], 'selector', [
            { field: 'id', maxLength: 20 },
            { field: 'type', type: 'select', values: ['binary', 'analog'] },
            { field: 'material', type: 'select', values: MATERIAL_NAMES },
            { field: 'density' },
            { field: 'thick' },
            { field: 'ref' },
            { field: 'wet' }
        ], enabled);
        renderSimpleRows($('nozzleBody'), m.nozzles || [], 'nozzle', [
            { field: 'id', maxLength: 20 },
            { field: 'type', type: 'select', values: ['window'] },
            { field: 'material', type: 'select', values: MATERIAL_NAMES },
            { field: 'density' },
            { field: 'thick' },
            { field: 'ref' },
            { field: 'wet' }
        ], enabled);
        renderSimpleRows($('mlcBody'), m.mlc || [], 'mlc', [
            { field: 'center' },
            { field: 'width' },
            { field: 'material', type: 'select', values: ['钨', '铜'] }
        ], enabled);
        renderSimpleRows($('blockBody'), m.blocks || [], 'block', [
            { field: 'diameter' },
            { field: 'thick' },
            { field: 'material', type: 'select', values: MATERIAL_NAMES },
            { field: 'density' },
            { field: 'excitation' },
            { field: 'z' },
            { field: 'w' }
        ], enabled);

        const structural = enabled;
        ['objAddBtn', 'objDelBtn', 'mlcAddBtn', 'mlcDelBtn', 'blockAddBtn', 'blockDelBtn'].forEach((id) => {
            $(id).disabled = !structural;
        });
        document.querySelectorAll('.obj-tab').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.obj === activeObj);
        });
    }

    function updateVisibility() {
        const m = view();
        const p = profile(m && m.model);
        $('sec-shifter').hidden = !p.shifter;
        $('sec-selector').hidden = !p.selector;
        $('sec-nozzle').hidden = !p.nozzle;
        document.querySelector('#machineTabs [data-tab="mlc"]').hidden = !p.mlc;
        document.querySelector('#machineTabs [data-tab="block"]').hidden = !p.block;
        document.querySelector('#beamTabs [data-btab="discrete"]').hidden = !p.discrete;
        const visibleObjs = ['snout', 'shifter', 'selector', 'nozzle'].filter((k) => {
            if (k === 'snout') return true;
            if (k === 'shifter') return p.shifter;
            if (k === 'selector') return p.selector;
            return p.nozzle;
        });
        if (visibleObjs.indexOf(activeObj) < 0) activeObj = visibleObjs[0];
        if (machineTab === 'mlc' && !p.mlc) machineTab = 'general';
        if (machineTab === 'block' && !p.block) machineTab = 'general';
        if (beamTab === 'discrete' && !p.discrete) beamTab = 'bgeneral';
        document.querySelectorAll('#machineTabs .acc-subtab').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === machineTab);
        });
        ['general', 'geom', 'beamobj', 'mlc', 'block'].forEach((tab) => {
            $('tab-' + tab).hidden = machineTab !== tab;
        });
        document.querySelectorAll('#beamTabs .acc-subtab').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.btab === beamTab);
        });
        ['bgeneral', 'spot', 'bragg', 'dose', 'discrete'].forEach((tab) => {
            $('btab-' + tab).hidden = beamTab !== tab;
        });
    }

    function textLine(label, value) {
        const lab = document.createElement('div');
        lab.textContent = label;
        const val = document.createElement('div');
        val.textContent = value || '—';
        return [lab, val];
    }

    function renderBeamGeneral() {
        const m = view();
        const host = $('beamGeneral');
        host.innerHTML = '';
        if (!m || !m.beam) {
            host.textContent = '暂无射束质量参数';
            return;
        }
        const b = m.beam;
        const canEdit = editing && m.group === 'uncommissioned';
        const rows = [
            ['机器名称', m.name, true],
            ['治疗技术', b.technique || 'Pencil Beam Scanning', true],
            ['粒子种类', 'Proton', true]
        ];
        rows.forEach((r) => {
            textLine(r[0], r[1]).forEach((n) => host.appendChild(n));
        });

        function addPair(label, nodes) {
            const lab = document.createElement('div');
            lab.textContent = label;
            const box = document.createElement('div');
            box.className = 'pair';
            nodes.forEach((n) => box.appendChild(n));
            host.appendChild(lab);
            host.appendChild(box);
        }

        function num(field, width) {
            const input = document.createElement('input');
            input.className = 'num-input';
            if (width) input.style.width = width;
            input.value = b[field] || '';
            input.disabled = !canEdit;
            input.addEventListener('input', () => { if (draft && draft.beam) draft.beam[field] = input.value; });
            return input;
        }

        const tank = document.createElement('div');
        tank.className = 'pair';
        [['长', 'tankL'], ['宽', 'tankW'], ['高', 'tankH']].forEach(([name, key]) => {
            const s = document.createElement('span');
            s.textContent = name;
            tank.appendChild(s);
            tank.appendChild(num(key));
            const u = document.createElement('span');
            u.className = 'unit';
            u.textContent = 'cm';
            tank.appendChild(u);
        });
        const tankLab = document.createElement('div');
        tankLab.textContent = '水箱尺寸';
        host.appendChild(tankLab);
        host.appendChild(tank);

        const delivery = document.createElement('input');
        delivery.className = 'acc-input';
        delivery.style.width = '280px';
        delivery.maxLength = 32;
        delivery.value = b.delivery || '';
        delivery.disabled = !canEdit;
        delivery.addEventListener('input', () => { if (draft && draft.beam) draft.beam.delivery = delivery.value; });
        const dLab = document.createElement('div');
        dLab.textContent = '束流配送方式';
        host.appendChild(dLab);
        host.appendChild(delivery);

        addPair('能量范围[MeV]', [num('energyMin'), spanUnit('—'), num('energyMax')]);
        addPair('射程范围[cm]', [num('rangeMin'), spanUnit('—'), num('rangeMax')]);
        addPair('能量调节步长[MeV]', [num('energyStep')]);
        addPair('辐照野范围[cm]', [spanUnit('X'), num('fieldX'), spanUnit('Y'), num('fieldY')]);
        addPair('束流位置精度[cm]', [num('posAcc')]);
        addPair('束斑间距范围[cm]', [num('spotMin'), spanUnit('—'), num('spotMax')]);
        addPair('层间距范围[cm]', [num('layerMin'), spanUnit('—'), num('layerMax')]);

        const snoutText = (m.snouts || []).map((s) => s.name).filter(Boolean).join('、') || '—';
        const shiftText = (m.shifters || []).map((s) => s.id).filter(Boolean).join('、') || '—';
        textLine('Snout', snoutText).forEach((n) => host.appendChild(n));
        textLine('Range Shifter', shiftText).forEach((n) => host.appendChild(n));

        function spanUnit(t) {
            const s = document.createElement('span');
            s.className = 'unit';
            s.textContent = t;
            return s;
        }
    }

    function renderMeasureTable(hostId, headers, rows, emptyText) {
        const host = $(hostId);
        host.innerHTML = '';
        if (!rows || !rows.length) {
            const p = document.createElement('div');
            p.className = 'empty-line';
            p.textContent = emptyText;
            host.appendChild(p);
            return;
        }
        const wrap = document.createElement('div');
        wrap.className = 'table-wrap';
        const table = document.createElement('table');
        table.className = 'acc-table';
        const thead = document.createElement('thead');
        const hr = document.createElement('tr');
        headers.forEach((h) => {
            const th = document.createElement('th');
            th.textContent = h;
            hr.appendChild(th);
        });
        thead.appendChild(hr);
        table.appendChild(thead);
        const tb = document.createElement('tbody');
        rows.forEach((row) => {
            const tr = document.createElement('tr');
            row.forEach((cell) => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.value = cell;
                input.readOnly = true;
                td.appendChild(input);
                tr.appendChild(td);
            });
            tb.appendChild(tr);
        });
        table.appendChild(tb);
        wrap.appendChild(table);
        host.appendChild(wrap);
        const note = document.createElement('div');
        note.className = 'mini-note';
        note.textContent = 'Commission 完成后展示拟合结果，此处为只读。';
        host.appendChild(note);
    }

    function renderBeamTables() {
        const m = view();
        const b = m && m.beam;
        renderMeasureTable('btab-spot', ['能量[MeV]', '束斑尺寸 X[mm]', '束斑尺寸 Y[mm]', '发散角 X', '发散角 Y'], b && b.spotRows, '暂无束斑参数。完成 Commission 后显示。');
        renderMeasureTable('btab-bragg', ['能量[MeV]', '峰位[cm]', '峰宽[cm]'], b && b.braggRows, '暂无布拉格峰数据。完成 Commission 后显示。');
        renderMeasureTable('btab-dose', ['能量[MeV]', '标定深度[cm]', '剂量/MU'], b && b.doseRows, '暂无绝对剂量数据。完成 Commission 后显示。');
        const discreteHost = $('btab-discrete');
        discreteHost.innerHTML = '';
        const values = (b && b.discrete) || [];
        if (!values.length) {
            const p = document.createElement('div');
            p.className = 'empty-line';
            p.textContent = '暂无离散能量。';
            discreteHost.appendChild(p);
        } else {
            renderMeasureTable('btab-discrete', ['能量[MeV]'], values.map((v) => [v]), '');
        }
    }

    function updateChrome() {
        const m = findMachine(selectedId);
        const showMachine = !!(m && selectedKind === 'machine');
        const showBeam = !!(m && selectedKind === 'pbs' && m.hasBeam);
        $('machinePane').hidden = !showMachine;
        $('beamPane').hidden = !showBeam;
        $('emptyPane').hidden = !!(showMachine || showBeam);
        $('paneTitle').textContent = showBeam ? '射束质量参数' : '加速器';
        const canEdit = m && m.group === 'uncommissioned';
        $('editBtn').hidden = !canEdit || editing;
        $('saveBtn').hidden = !editing;
        $('cancelEditBtn').hidden = !editing;
        if (showMachine || showBeam) {
            updateVisibility();
            fillMachineForm();
            renderObjectTables();
            renderBeamGeneral();
            renderBeamTables();
            updateVisibility();
        }
    }

    function paint() {
        renderTree();
        updateChrome();
    }

    function select(id, kind) {
        if (id === selectedId && kind === selectedKind) return true;
        if (editing) {
            askConfirm('未保存的修改', '当前修改尚未保存，切换后将放弃这些修改。', '', () => {
                editing = false;
                draft = null;
                selectedId = id;
                selectedKind = kind;
                rowSel = { snout: -1, shifter: -1, selector: -1, nozzle: -1, mlc: -1, block: -1 };
                paint();
            });
            return false;
        }
        selectedId = id;
        selectedKind = kind;
        rowSel = { snout: -1, shifter: -1, selector: -1, nozzle: -1, mlc: -1, block: -1 };
        paint();
        return true;
    }

    function beginEdit() {
        const m = findMachine(selectedId);
        if (!m || m.group !== 'uncommissioned') return;
        draft = clone(m);
        if (!draft.code) draft.code = nextCode();
        if (!draft.beam) draft.beam = beamQuality(false);
        editing = true;
        paint();
    }

    function cancelEdit() {
        editing = false;
        draft = null;
        paint();
    }

    function readFormIntoDraft() {
        if (!draft) return;
        draft.code = $('fCode').value.trim();
        draft.name = $('fName').value.trim();
        draft.model = $('fModel').value;
        draft.version = $('fVersion').value.trim();
        draft.accel = $('fAccel').value.trim();
        draft.comment = $('fComment').value.trim();
        draft.pbs = $('fPbs').checked;
        draft.gantryType = $('fGantryType').value.trim();
        draft.gantryAngle = $('fGantryAngle').value.trim();
        draft.gantryStart = $('fGantryStart').value.trim();
        draft.gantryStop = $('fGantryStop').value.trim();
        draft.couchRotStart = $('fCouchRotStart').value.trim();
        draft.couchRotStop = $('fCouchRotStop').value.trim();
        draft.couchPitchStart = $('fCouchPitchStart').value.trim();
        draft.couchPitchStop = $('fCouchPitchStop').value.trim();
        draft.couchRollStart = $('fCouchRollStart').value.trim();
        draft.couchRollStop = $('fCouchRollStop').value.trim();
        draft.isoMax = $('fIsoMax').value.trim();
    }

    function validName(value, max) {
        if (!value || value.length > (max || 32)) return false;
        return NAME_RE.test(value);
    }

    function validAngle(value, min, max, required) {
        if (value === '' || value == null) return !required;
        if (!/^-?\d+(\.\d)?$/.test(String(value).trim())) return false;
        const n = Number(value);
        return n >= min && n <= max;
    }

    function validDeg(value, required) {
        return validAngle(value, 0, 360, required);
    }

    function formatDeg(value) {
        return Number(value).toFixed(1);
    }

    function inRange(value, min, max, digits, required) {
        if (value === '' || value == null) return !required;
        const re = digits === 2 ? /^-?\d+(\.\d{1,2})?$/ : /^-?\d+(\.\d+)?$/;
        if (!re.test(String(value))) return false;
        const n = Number(value);
        return n >= min && n <= max;
    }

    function saveEdit() {
        readFormIntoDraft();
        document.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
        const d = draft;
        let ok = true;
        const invalidIds = [];
        function bad(id, message) {
            invalidIds.push(id);
            markInvalid(id);
            if (ok) toast(message);
            ok = false;
        }
        function showInvalid(tab) {
            machineTab = tab;
            selectedKind = 'machine';
            paint();
            invalidIds.forEach(markInvalid);
        }
        if (!/^\d{1,16}$/.test(d.code)) bad('fCode', '编号须为不超过 16 位的数字');
        if (!validName(d.name)) bad('fName', '机器名称必填，仅支持英文字母、数字和字符，最长 32 位');
        if (MODELS.indexOf(d.model) < 0) bad('fModel', '请选择治疗机型号');
        if (!validName(d.version)) bad('fVersion', '治疗机发布版本必填，仅支持英文字母、数字和字符，最长 32 位');
        if (!validName(d.accel)) bad('fAccel', '加速模式必填，仅支持英文字母、数字和字符，最长 32 位');
        if (d.comment && !NAME_RE.test(d.comment)) bad('fComment', '备注仅支持英文字母、数字和字符，最长 32 位');
        const dup = machines.some((m) => m.id !== d.id && m.name === d.name);
        if (dup) bad('fName', '机器名称已存在');
        if (!ok) {
            showInvalid('general');
            return;
        }

        if (!d.generalSaved) {
            d.generalSaved = true;
            d.savedBy = USER;
            d.savedAt = nowText();
            if (!d.gantryType) d.gantryType = '';
            if (isPcure(d.model)) {
                if (!d.gantryAngle) d.gantryAngle = '';
            } else {
                if (!d.gantryStart) d.gantryStart = '0.0';
                if (!d.gantryStop) d.gantryStop = '360.0';
                if (!d.couchPitchStart) d.couchPitchStart = '0.0';
                if (!d.couchPitchStop) d.couchPitchStop = '0.0';
                if (!d.couchRollStart) d.couchRollStart = '0.0';
                if (!d.couchRollStop) d.couchRollStop = '0.0';
            }
            if (!d.isoMax) d.isoMax = '10';
            commitDraft('通用信息已保存，可继续编辑几何参数和射束对象');
            return;
        }

        if (!validName(d.gantryType)) bad('fGantryType', '机架类型必填，仅支持英文字母、数字和字符，最长 32 位');
        if (isPcure(d.model)) {
            if (!validAngle(d.gantryAngle, 0, 360, true)) bad('fGantryAngle', '机架角度只配置一个角度，须在 0.0 到 360.0 之间，保留一位小数');
            if (!validAngle(d.couchRotStart, 0, 360, true)) bad('fCouchRotStart', '座椅旋转起始角须在 0.0 到 360.0 之间，保留一位小数');
            if (!validAngle(d.couchRotStop, 0, 360, true)) bad('fCouchRotStop', '座椅旋转终止角须在 0.0 到 360.0 之间，保留一位小数');
            if (!validAngle(d.couchPitchStart, 0, 90, true)) bad('fCouchPitchStart', '座椅俯仰起始角须在 0.0 到 90.0 之间，保留一位小数');
            if (!validAngle(d.couchPitchStop, 0, 90, true)) bad('fCouchPitchStop', '座椅俯仰终止角须在 0.0 到 90.0 之间，保留一位小数');
            if (!validAngle(d.couchRollStart, -90, 90, true)) bad('fCouchRollStart', '座椅侧倾起始角须在 -90.0 到 90.0 之间，保留一位小数');
            if (!validAngle(d.couchRollStop, -90, 90, true)) bad('fCouchRollStop', '座椅侧倾终止角须在 -90.0 到 90.0 之间，保留一位小数');
        } else {
            [['fGantryStart', d.gantryStart], ['fGantryStop', d.gantryStop], ['fCouchRotStart', d.couchRotStart], ['fCouchRotStop', d.couchRotStop], ['fCouchPitchStart', d.couchPitchStart], ['fCouchPitchStop', d.couchPitchStop], ['fCouchRollStart', d.couchRollStart], ['fCouchRollStop', d.couchRollStop]].forEach(([id, value]) => {
                if (!validDeg(value, true)) bad(id, '角度须在 0.0 到 360.0 之间，保留一位小数');
            });
        }
        if (!/^\d+$/.test(d.isoMax) || Number(d.isoMax) < 1) bad('fIsoMax', '等中心点最大数量须为不小于 1 的整数');
        if (!ok) {
            showInvalid('geom');
            return;
        }
        if (isPcure(d.model)) {
            d.gantryAngle = formatDeg(d.gantryAngle);
        } else {
            d.gantryStart = formatDeg(d.gantryStart);
            d.gantryStop = formatDeg(d.gantryStop);
        }
        d.couchRotStart = formatDeg(d.couchRotStart);
        d.couchRotStop = formatDeg(d.couchRotStop);
        d.couchPitchStart = formatDeg(d.couchPitchStart);
        d.couchPitchStop = formatDeg(d.couchPitchStop);
        d.couchRollStart = formatDeg(d.couchRollStart);
        d.couchRollStop = formatDeg(d.couchRollStop);

        if (!validateObjects(d, true)) {
            machineTab = 'beamobj';
            selectedKind = 'machine';
            paint();
            return;
        }
        d.savedBy = USER;
        d.savedAt = nowText();
        commitDraft('已保存');
    }

    function validateObjects(d, toastOnFail) {
        const p = profile(d.model);
        let message = '';
        function fail(text) {
            if (!message) message = text;
        }
        (d.snouts || []).forEach((row) => {
            if (!SNOUT_NAME_RE.test(row.name || '')) fail('Snout 名称必填，支持字母、数字、- _ () 和空格，最长 20 位');
            if (!inRange(row.min, 0, 100, 2, true) || !inRange(row.max, 0, 100, 2, true)) fail('Snout 位置须在 0.00 到 100.00 之间');
            else if (Number(row.min) > Number(row.max)) fail('最大位置不能小于最小位置');
            ['inX', 'outX', 'cx', 'cy'].forEach((key) => {
                const limit = key === 'cx' || key === 'cy' ? [-100, 100] : [0, 100];
                if (!inRange(row[key], limit[0], limit[1], 2, false)) fail('喷嘴尺寸超出允许范围');
            });
            if (row.shape !== '圆形') {
                if (!inRange(row.inY, 0, 100, 2, false) || !inRange(row.outY, 0, 100, 2, false)) fail('喷嘴尺寸超出允许范围');
            }
        });
        if (p.shifter) {
            (d.shifters || []).forEach((row) => {
                if (!SNOUT_NAME_RE.test(row.id || '')) fail('射程位移器 ID 必填，最长 20 位');
                if (!inRange(row.density, 0, 100, 2, true)) fail('质量密度须在 0.00 到 100.00 之间');
                if (!inRange(row.wet, 0, 200, 2, true)) fail('等效水厚度须在 0.00 到 200.00 之间');
                if (!inRange(row.thick, 0, 100, 2, false)) fail('物理厚度超出允许范围');
            });
        }
        if (message && toastOnFail) toast(message);
        return !message;
    }

    function commitDraft(message) {
        const idx = machines.findIndex((m) => m.id === draft.id);
        if (idx >= 0) machines[idx] = clone(draft);
        editing = false;
        draft = null;
        toast(message);
        paint();
    }

    function nextCode() {
        let max = 10;
        machines.forEach((m) => {
            const n = parseInt(m.code, 10);
            if (!isNaN(n)) max = Math.max(max, n);
        });
        return String(max + 1).padStart(8, '0');
    }

    function uniqueName(base) {
        let name = base;
        let i = 2;
        const exists = (n) => machines.some((m) => m.name === n);
        while (exists(name)) {
            name = base + i;
            i += 1;
        }
        return name;
    }

    function createMachine() {
        const id = 'm' + (++seq);
        const m = baseMachine({
            id: id,
            name: uniqueName('new machine'),
            group: 'uncommissioned',
            code: nextCode(),
            pbs: true
        });
        machines.push(m);
        selectedId = id;
        selectedKind = 'machine';
        machineTab = 'general';
        editing = false;
        draft = null;
        paint();
        beginEdit();
    }

    function copyMachine(id) {
        const src = findMachine(id);
        if (!src) return;
        const m = clone(src);
        m.id = 'm' + (++seq);
        m.name = uniqueName(src.name + '_copy');
        m.group = 'uncommissioned';
        m.code = nextCode();
        m.commissionedAt = '';
        m.commissionedBy = '';
        m.fit = '';
        m.savedBy = USER;
        m.savedAt = nowText();
        m.generalSaved = true;
        machines.push(m);
        selectedId = m.id;
        selectedKind = 'machine';
        editing = false;
        draft = null;
        toast('已复制到 Uncommissioned 机器');
        paint();
    }

    function deleteMachine(id) {
        const m = findMachine(id);
        if (!m) return;
        const idx = machines.findIndex((item) => item.id === id);
        machines.splice(idx, 1);
        if (selectedId === id) {
            selectedId = machines.length ? machines[0].id : '';
            selectedKind = 'machine';
            editing = false;
            draft = null;
        }
        toast('已删除');
        paint();
    }

    function deprecateMachine(id) {
        const m = findMachine(id);
        if (!m) return;
        m.group = 'deprecated';
        m.savedBy = USER;
        m.savedAt = nowText();
        m.fit = '';
        toast(m.name + ' 已弃用');
        paint();
    }

    function createBeam(id) {
        const m = findMachine(id);
        if (!m || m.hasBeam) return;
        m.hasBeam = true;
        m.beam = beamQuality(false);
        m.beam.delivery = '扫描束--调制扫描';
        selectedId = id;
        selectedKind = 'pbs';
        paint();
    }

    function completenessError(m) {
        if (!m.generalSaved) return '参数信息不完整，请补充后再调试';
        if (!m.code || !m.name || !m.model || !m.version || !m.accel) return '参数信息不完整，请补充后再调试';
        if (!m.gantryType) return '参数信息不完整，请补充后再调试';
        if (isPcure(m.model)) {
            if (!validAngle(m.gantryAngle, 0, 360, true)) return '参数信息不完整，请补充后再调试';
            if (!validAngle(m.couchRotStart, 0, 360, true) || !validAngle(m.couchRotStop, 0, 360, true)) return '参数信息不完整，请补充后再调试';
            if (!validAngle(m.couchPitchStart, 0, 90, true) || !validAngle(m.couchPitchStop, 0, 90, true)) return '参数信息不完整，请补充后再调试';
            if (!validAngle(m.couchRollStart, -90, 90, true) || !validAngle(m.couchRollStop, -90, 90, true)) return '参数信息不完整，请补充后再调试';
        } else if (!validDeg(m.gantryStart, true) || !validDeg(m.gantryStop, true) || !validDeg(m.couchRotStart, true) || !validDeg(m.couchRotStop, true)) {
            return '参数信息不完整，请补充后再调试';
        }
        if (!m.isoMax) return '参数信息不完整，请补充后再调试';
        if (!m.snouts || !m.snouts.length) return '参数信息不完整，请补充后再调试';
        if (!validateObjects(m, false)) return '参数信息不符合实际逻辑，请修改后调试';
        if (!m.hasBeam || !m.beam) return '参数信息不完整，请补充后再调试';
        const b = m.beam;
        const need = ['delivery', 'energyMin', 'energyMax', 'rangeMin', 'rangeMax', 'energyStep', 'fieldX', 'fieldY', 'posAcc', 'spotMin', 'spotMax', 'layerMin', 'layerMax'];
        if (need.some((k) => !b[k])) return '参数信息不完整，请补充后再调试';
        if (Number(b.energyMin) >= Number(b.energyMax)) return '参数信息不符合实际逻辑，请修改后调试';
        if (Number(b.rangeMin) >= Number(b.rangeMax)) return '参数信息不符合实际逻辑，请修改后调试';
        if (Number(b.spotMin) > Number(b.spotMax) || Number(b.layerMin) > Number(b.layerMax)) return '参数信息不符合实际逻辑，请修改后调试';
        if (Number(b.energyStep) > 0.1) return '能量调节步长须小于或等于 0.1 MeV';
        return '';
    }

    function finishCommission() {
        const m = findMachine(selectedId);
        if (!m) return;
        const stamp = nowText();
        m.group = 'commissioned';
        m.commissionedBy = $('authUser').value.trim() || USER;
        m.commissionedAt = stamp;
        m.fit = 'Single Gaussian fitting';
        if (m.beam) {
            if (!m.beam.spotRows.length) m.beam.spotRows = SPOT_SAMPLE.map((r) => r.slice());
            if (!m.beam.braggRows.length) m.beam.braggRows = BRAGG_SAMPLE.map((r) => r.slice());
            if (!m.beam.doseRows.length) m.beam.doseRows = DOSE_SAMPLE.map((r) => r.slice());
        }
        editing = false;
        draft = null;
        selectedKind = 'machine';
        toast('Commission 成功');
        paint();
    }

    function openCommission() {
        if (editing) {
            toast('请先保存当前修改');
            return;
        }
        const m = findMachine(selectedId);
        const err = completenessError(m);
        if (err) {
            toast(err);
            return;
        }
        $('pathIdd').value = '';
        $('pathSpot').value = '';
        $('pathClinic').value = '';
        showMask('commMask');
    }

    function showMask(id) { $(id).classList.add('show'); }
    function hideMask(id) { $(id).classList.remove('show'); }

    function askConfirm(title, text, warn, cb) {
        $('confirmTitle').textContent = title;
        $('confirmText').textContent = text;
        $('confirmWarn').textContent = warn || '';
        confirmCb = cb;
        showMask('confirmMask');
    }

    function askAuth(title, cb) {
        $('authTitle').textContent = title;
        $('authUser').value = USER;
        $('authPwd').value = '';
        authCb = cb;
        showMask('authMask');
    }

    function openMenu(x, y, items) {
        const menu = $('ctxMenu');
        menu.innerHTML = '';
        items.forEach((item) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = item.label;
            btn.disabled = !!item.disabled;
            btn.addEventListener('click', () => {
                menu.hidden = true;
                item.run();
            });
            menu.appendChild(btn);
        });
        menu.hidden = false;
        const rect = menu.getBoundingClientRect();
        const left = Math.min(x, window.innerWidth - rect.width - 8);
        const top = Math.min(y, window.innerHeight - rect.height - 8);
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    function onTreeContext(e) {
        const groupHd = e.target.closest('.tree-group-hd');
        const machineRow = e.target.closest('.tree-machine');
        const pbsRow = e.target.closest('.tree-pbs');
        if (!groupHd && !machineRow && !pbsRow) return;
        e.preventDefault();
        if (pbsRow) return;
        if (groupHd && !machineRow) {
            const gid = groupHd.dataset.group;
            if (gid !== 'uncommissioned') return;
            openMenu(e.clientX, e.clientY, [{ label: '新建加速器', run: createMachine }]);
            return;
        }
        const id = machineRow.dataset.id;
        const m = findMachine(id);
        if (!m) return;
        if (!select(id, 'machine')) return;
        if (m.group === 'commissioned') {
            openMenu(e.clientX, e.clientY, [
                { label: '复制', run: () => copyMachine(id) },
                {
                    label: '弃用',
                    run: () => askConfirm('弃用加速器', '确定要删除 ' + m.name + ' 吗？', '删除后将无法恢复！', () => {
                        askAuth('弃用需要管理员权限', () => deprecateMachine(id));
                    })
                }
            ]);
        } else if (m.group === 'uncommissioned') {
            openMenu(e.clientX, e.clientY, [
                {
                    label: '删除',
                    run: () => askConfirm('删除加速器', '确定要永久删除 ' + m.name + ' 吗？', '删除后将无法恢复！', () => deleteMachine(id))
                },
                { label: '新建射束质量参数', disabled: m.hasBeam, run: () => createBeam(id) },
                { label: 'Commission', run: () => { selectedId = id; openCommission(); } }
            ]);
        } else {
            openMenu(e.clientX, e.clientY, [
                {
                    label: '永久删除',
                    run: () => askConfirm('永久删除', '确定要永久删除 ' + m.name + ' 吗？', '删除后将无法恢复！', () => {
                        askAuth('永久删除需要管理员权限', () => deleteMachine(id));
                    })
                }
            ]);
        }
    }

    function addObjectRow() {
        if (!objectsEditable()) return;
        const m = draft;
        if (activeObj === 'snout') {
            m.snouts.push({ name: '', shape: '方形', min: '0.00', max: '0.00', inX: '', inY: '', outX: '', outY: '', cx: '0.00', cy: '0.00' });
            rowSel.snout = m.snouts.length - 1;
        } else if (activeObj === 'shifter') {
            m.shifters.push({ id: '', type: 'binary', material: 'Water', density: '1.2', wet: '0.00', thick: '0.00' });
            rowSel.shifter = m.shifters.length - 1;
        } else if (activeObj === 'selector') {
            m.selectors.push({ id: '', type: 'binary', material: 'Lexan', density: '1.200', thick: '0.01', ref: '0.00', wet: '0.00' });
            rowSel.selector = m.selectors.length - 1;
        } else if (activeObj === 'nozzle') {
            m.nozzles.push({ id: '', type: 'window', material: 'Lexan', density: '1.200', thick: '0.01', ref: '0.00', wet: '0.00' });
            rowSel.nozzle = m.nozzles.length - 1;
        }
        renderObjectTables();
    }

    function deleteObjectRow() {
        if (!objectsEditable()) return;
        const m = draft;
        const key = activeObj === 'snout' ? 'snouts' : activeObj === 'shifter' ? 'shifters' : activeObj === 'selector' ? 'selectors' : 'nozzles';
        const idx = rowSel[activeObj];
        const row = m[key][idx];
        if (!row) {
            toast('请先选中一行');
            return;
        }
        const label = row.name || row.id || '该行';
        const noun = activeObj === 'shifter' ? '射程位移器 ' : '';
        askConfirm('删除', '是否删除' + noun + label, '', () => {
            m[key].splice(idx, 1);
            rowSel[activeObj] = Math.min(idx, m[key].length - 1);
            renderObjectTables();
        });
    }

    function addLeaf(kind) {
        if (!objectsEditable()) return;
        if (kind === 'mlc') {
            draft.mlc.push({ center: '0.00000', width: '0.50', material: '钨' });
            rowSel.mlc = draft.mlc.length - 1;
        } else {
            const mat = MATERIALS.Lexan;
            draft.blocks.push({ diameter: '0.00', thick: '0.01', material: 'Lexan', density: mat.density, excitation: mat.excitation, z: mat.z, w: mat.w });
            rowSel.block = draft.blocks.length - 1;
        }
        renderObjectTables();
    }

    function deleteLeaf(kind) {
        if (!objectsEditable()) return;
        const key = kind === 'mlc' ? 'mlc' : 'blocks';
        const idx = rowSel[kind];
        if (idx < 0 || !draft[key][idx]) {
            toast('请先选中一行');
            return;
        }
        askConfirm('删除', '是否删除选中行？', '', () => {
            draft[key].splice(idx, 1);
            rowSel[kind] = Math.min(idx, draft[key].length - 1);
            renderObjectTables();
        });
    }

    const CT_TEXT_RE = /^[\x20-\x7E]{1,32}$/;
    const ctCollapsed = new Set();
    let ctSeq = 10;
    let selectedCtId = 'ge';
    let ctEditing = false;
    let ctDraft = null;
    let ctRowSel = { electron: -1, mass: -1 };
    let ctChanged = false;
    let restartLeave = null;
    let ctDupToast = '';

    function ctPairs(list) {
        return list.map(([hu, val]) => ({ hu: hu, val: val }));
    }

    function geElectron() {
        return ctPairs([
            ['-1000', '0'], ['-808', '0.2'], ['-483', '0.5'], ['-70', '0.96'], ['-35', '0.99'],
            ['0', '1'], ['44.5', '1.06'], ['47', '1.07'], ['100', '1.1'], ['236', '1.16'],
            ['1000', '1.6'], ['3000', '2.8'], ['6000', '4.2'], ['10000', '6'], ['15000', '8']
        ]);
    }

    function geMass() {
        return ctPairs([
            ['-1000', '0.001'], ['-992', '0.001'], ['-976', '0.001'], ['-480', '0.5'], ['-96', '0.95'],
            ['0', '1'], ['48', '1.05'], ['128', '1.1'], ['528', '1.334'], ['976', '1.603'],
            ['2000', '2.6'], ['4000', '4.4'], ['6000', '6.2'], ['8000', '8']
        ]);
    }

    function shortCurve() {
        return {
            electron: ctPairs([['-1000', '0'], ['0', '1'], ['1000', '1.5']]),
            mass: ctPairs([['-1000', '0.001'], ['0', '1'], ['1000', '1.5']])
        };
    }

    const ctMachines = [
        {
            id: 'nm1', name: 'new Machine 1', manufacturer: 'GE MEDICAL SYSTEMS', approver: 'mpsadmin',
            approvedAt: '2026-09-28 09:40:18', group: 'commissioned', cavityOn: true, cavityHu: '-800.00',
            electron: geElectron(), mass: geMass()
        },
        {
            id: 'somatom', name: 'SOMATOM go.Open Pro', manufacturer: 'SIEMENS', approver: 'mpsadmin',
            approvedAt: '2026-09-28 09:12:06', group: 'commissioned', cavityOn: true, cavityHu: '-800.00',
            electron: geElectron(), mass: geMass()
        },
        {
            id: 'ge', name: 'GE MEDICAL SYSTEMS', manufacturer: 'GE MEDICAL SYSTEMS', approver: 'mpsadmin',
            approvedAt: '2021-03-29 09:50:28', group: 'commissioned', cavityOn: true, cavityHu: '-800.00',
            electron: geElectron(), mass: geMass()
        },
        {
            id: 'tpl', name: 'Default template', manufacturer: 'Manteia', approver: '',
            approvedAt: '', group: 'uncommissioned', cavityOn: true, cavityHu: '-800.00',
            electron: shortCurve().electron, mass: shortCurve().mass
        },
        {
            id: 'ctnew', name: 'new Machine', manufacturer: '', approver: '',
            approvedAt: '', group: 'uncommissioned', cavityOn: true, cavityHu: '-800.00',
            electron: [], mass: []
        },
        {
            id: 'tplcopy', name: 'Default template_copy', manufacturer: 'Manteia', approver: '',
            approvedAt: '', group: 'uncommissioned', cavityOn: true, cavityHu: '-800.00',
            electron: shortCurve().electron, mass: shortCurve().mass
        }
    ];

    function ctFind(id) {
        return ctMachines.find((m) => m.id === id) || null;
    }

    function ctView() {
        return ctEditing && ctDraft ? ctDraft : ctFind(selectedCtId);
    }

    function ctSorted(group) {
        const list = ctMachines.filter((m) => m.group === group);
        if (group === 'commissioned') {
            return list.slice().sort((a, b) => (b.approvedAt || '').localeCompare(a.approvedAt || ''));
        }
        return list;
    }

    function ctLabel(m) {
        if (m.group === 'commissioned' && m.approvedAt) return m.name + ' [' + m.approvedAt + ']';
        return m.name;
    }

    function escAttr(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    function decOk(text, maxDec) {
        return new RegExp('^-?\\d+(\\.\\d{1,' + maxDec + '})?$').test(String(text).trim());
    }

    function ctNameTaken(name, selfId) {
        return ctMachines.some((m) => m.id !== selfId && m.group !== 'deprecated' && m.name === name);
    }

    function nextCtName(base) {
        if (!ctNameTaken(base, '')) return base;
        let i = 2;
        while (ctNameTaken(base + ' ' + i, '')) i += 1;
        return base + ' ' + i;
    }

    function copyCtName(name) {
        let n = name + '_copy';
        let i = 2;
        while (ctNameTaken(n, '')) {
            n = name + '_copy' + i;
            i += 1;
        }
        return n;
    }

    function renderCtTree() {
        const root = $('ctTree');
        if (!root) return;
        const scroll = root.scrollTop;
        root.innerHTML = '';
        [
            ['commissioned', '已审批的机器'],
            ['uncommissioned', '未审批的机器'],
            ['deprecated', '弃用的机器']
        ].forEach(([gid, label]) => {
            const wrap = document.createElement('div');
            const hd = document.createElement('div');
            hd.className = 'tree-group-hd';
            hd.dataset.group = gid;
            const open = !ctCollapsed.has(gid);
            hd.innerHTML = '<span class="chev' + (open ? ' open' : '') + '"></span><span class="pc-icon"></span>';
            const span = document.createElement('span');
            span.className = 'tree-label';
            span.textContent = label;
            hd.appendChild(span);
            wrap.appendChild(hd);
            const children = document.createElement('div');
            children.className = 'tree-children' + (open ? '' : ' collapsed');
            ctSorted(gid).forEach((m) => {
                const row = document.createElement('div');
                row.className = 'tree-machine' + (selectedCtId === m.id ? ' active' : '');
                row.dataset.id = m.id;
                row.innerHTML = '<span class="chev" style="visibility:hidden"></span><span class="ct-doc"></span>';
                const name = document.createElement('span');
                name.className = 'tree-label';
                name.textContent = ctLabel(m);
                name.title = ctLabel(m);
                row.appendChild(name);
                if (ctEditing && selectedCtId === m.id) {
                    const tag = document.createElement('span');
                    tag.className = 'ct-edit-tag';
                    tag.textContent = '编辑';
                    row.appendChild(tag);
                }
                children.appendChild(row);
            });
            wrap.appendChild(children);
            root.appendChild(wrap);
        });
        root.scrollTop = scroll;
    }

    function renderPairBody(bodyId, rows, which) {
        const body = $(bodyId);
        const phVal = which === 'electron' ? '[0.000, 20.000]' : '[0.000, 25.000]';
        body.innerHTML = rows.map((r, i) => {
            const active = ctRowSel[which] === i ? ' class="active"' : '';
            if (!ctEditing) {
                return '<tr data-idx="' + i + '"' + active + '><td><span class="cell">' + escAttr(r.hu) + '</span></td><td><span class="cell">' + escAttr(r.val) + '</span></td></tr>';
            }
            return '<tr data-idx="' + i + '"' + active + '>'
                + '<td><input data-field="hu" value="' + escAttr(r.hu) + '" placeholder="[-1050.00, 20000.00]"></td>'
                + '<td><input data-field="val" value="' + escAttr(r.val) + '" placeholder="' + phVal + '"></td>'
                + '</tr>';
        }).join('');
    }

    function chartPoints(rows) {
        return rows.map((r) => [Number(r.hu), Number(r.val)])
            .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))
            .sort((a, b) => a[0] - b[0]);
    }

    function niceStep(rough) {
        if (!(rough > 0)) return 1;
        const pow = Math.pow(10, Math.floor(Math.log10(rough)));
        const n = rough / pow;
        const f = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
        return f * pow;
    }

    function niceSpan(min, max) {
        if (min === max) {
            min -= 1;
            max += 1;
        }
        const step = niceStep((max - min) / 5);
        const lo = Math.floor(min / step) * step;
        let hi = Math.ceil(max / step) * step;
        if (hi === lo) hi = lo + step;
        return [lo, hi];
    }

    function tickLabel(v) {
        const a = Math.abs(v);
        if (a >= 100) return String(Math.round(v));
        if (a >= 10) return String(Math.round(v * 10) / 10);
        return String(Math.round(v * 100) / 100);
    }

    function drawChart(canvasId, pts, title, yName) {
        const canvas = $(canvasId);
        if (!canvas) return;
        const parent = canvas.parentElement;
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        if (w < 20 || h < 20) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#141414';
        ctx.fillRect(0, 0, w, h);

        const pad = { l: 58, r: 16, t: 28, b: 36 };
        const plotW = Math.max(10, w - pad.l - pad.r);
        const plotH = Math.max(10, h - pad.t - pad.b);
        let xMin = 0;
        let xMax = 1000;
        let yMin = -1;
        let yMax = 2;
        if (pts.length) {
            const xs = pts.map((p) => p[0]);
            const ys = pts.map((p) => p[1]);
            let loX = Math.min.apply(null, xs.concat([0]));
            let hiX = Math.max.apply(null, xs);
            let loY = Math.min.apply(null, ys.concat([0]));
            let hiY = Math.max.apply(null, ys);
            const yPad = Math.max(0.5, (hiY - loY) * 0.2);
            loY -= yPad;
            hiY += yPad;
            const xsSpan = niceSpan(loX, hiX);
            const ysSpan = niceSpan(loY, hiY);
            xMin = xsSpan[0];
            xMax = xsSpan[1];
            yMin = ysSpan[0];
            yMax = ysSpan[1];
        }

        ctx.font = '11px "Microsoft YaHei", sans-serif';
        ctx.strokeStyle = '#303030';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#8a8a8a';
        for (let i = 0; i <= 5; i += 1) {
            const y = pad.t + plotH - (plotH * i) / 5;
            const x = pad.l + (plotW * i) / 5;
            ctx.beginPath();
            ctx.moveTo(pad.l, y);
            ctx.lineTo(pad.l + plotW, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, pad.t);
            ctx.lineTo(x, pad.t + plotH);
            ctx.stroke();
            const yv = yMin + ((yMax - yMin) * i) / 5;
            const xv = xMin + ((xMax - xMin) * i) / 5;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(tickLabel(yv), pad.l - 6, y);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(tickLabel(xv), x, pad.t + plotH + 6);
        }

        ctx.strokeStyle = '#6a6a6a';
        ctx.beginPath();
        ctx.moveTo(pad.l, pad.t);
        ctx.lineTo(pad.l, pad.t + plotH);
        ctx.lineTo(pad.l + plotW, pad.t + plotH);
        ctx.stroke();

        if (xMin < 0 && xMax > 0) {
            const zx = pad.l + ((0 - xMin) / (xMax - xMin)) * plotW;
            ctx.strokeStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(zx, pad.t);
            ctx.lineTo(zx, pad.t + plotH);
            ctx.stroke();
        }

        ctx.fillStyle = '#d5d5d5';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.fillText(title, pad.l + plotW / 2, 6);

        ctx.save();
        ctx.translate(14, pad.t + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#9a9a9a';
        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(yName, 0, 0);
        ctx.restore();

        ctx.fillStyle = '#9a9a9a';
        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('HU', w - 8, h - 6);

        if (!pts.length) return;
        ctx.beginPath();
        ctx.strokeStyle = '#3ec6ef';
        ctx.lineWidth = 1.6;
        pts.forEach((p, i) => {
            const x = pad.l + ((p[0] - xMin) / (xMax - xMin)) * plotW;
            const y = pad.t + plotH - ((p[1] - yMin) / (yMax - yMin)) * plotH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    function drawCtCharts() {
        const m = ctView();
        if (!m || $('panel-ct') && !$('panel-ct').classList.contains('active')) return;
        drawChart('ctElectronCanvas', chartPoints(m.electron), 'HU转相对电子密度', '相对电子密度');
        drawChart('ctMassCanvas', chartPoints(m.mass), 'HU转质量密度', '质量密度(g/cm³)');
    }

    function renderCtDetail() {
        const m = ctView();
        const empty = $('ctEmpty');
        const detail = $('ctDetail');
        if (!m) {
            empty.hidden = false;
            detail.hidden = true;
            return;
        }
        empty.hidden = true;
        detail.hidden = false;
        $('ctName').value = m.name || '';
        $('ctMaker').value = m.manufacturer || '';
        $('ctBy').value = m.approver || '';
        $('ctAt').value = m.approvedAt || '';
        $('ctCavityOn').checked = !!m.cavityOn;
        $('ctCavity').value = m.cavityHu || '';
        const lock = !ctEditing;
        $('ctName').readOnly = lock;
        $('ctMaker').readOnly = lock;
        $('ctBy').readOnly = true;
        $('ctAt').readOnly = true;
        $('ctCavityOn').disabled = lock;
        $('ctCavity').readOnly = lock || !m.cavityOn;
        $('ctEditBtn').hidden = !(m.group === 'uncommissioned' && !ctEditing);
        $('ctSaveBtn').hidden = !ctEditing;
        $('ctElecAdd').disabled = lock;
        $('ctElecDel').disabled = lock;
        $('ctMassAdd').disabled = lock;
        $('ctMassDel').disabled = lock;
        ['ctName', 'ctMaker', 'ctCavity'].forEach((id) => $(id).classList.remove('invalid'));
        renderPairBody('ctElectronBody', m.electron, 'electron');
        renderPairBody('ctMassBody', m.mass, 'mass');
        requestAnimationFrame(drawCtCharts);
    }

    function renderCt() {
        renderCtTree();
        renderCtDetail();
    }

    function selectCt(id) {
        if (id === selectedCtId) return true;
        if (ctEditing) {
            askConfirm('未保存的修改', '当前修改尚未保存，切换后将放弃这些修改。', '', () => {
                ctEditing = false;
                ctDraft = null;
                selectedCtId = id;
                ctRowSel = { electron: -1, mass: -1 };
                renderCt();
            });
            return false;
        }
        selectedCtId = id;
        ctRowSel = { electron: -1, mass: -1 };
        renderCt();
        return true;
    }

    function markCtDup(which) {
        if (!ctDraft) return false;
        const rows = ctDraft[which];
        const counts = {};
        rows.forEach((r) => {
            if (!decOk(r.hu, 2)) return;
            const key = String(Number(r.hu));
            counts[key] = (counts[key] || 0) + 1;
        });
        const body = $(which === 'electron' ? 'ctElectronBody' : 'ctMassBody');
        let dup = false;
        body.querySelectorAll('input[data-field="hu"]').forEach((input) => {
            const bad = decOk(input.value, 2) && counts[String(Number(input.value))] > 1;
            input.classList.toggle('invalid', bad);
            if (bad) dup = true;
        });
        if (dup && ctDupToast !== which) {
            ctDupToast = which;
            toast('存在相同的数值关系');
        }
        if (!dup && ctDupToast === which) ctDupToast = '';
        return dup;
    }

    function onCtCell(which, e) {
        if (!ctDraft || e.target.tagName !== 'INPUT') return;
        const tr = e.target.closest('tr');
        if (!tr) return;
        const idx = Number(tr.dataset.idx);
        const row = ctDraft[which][idx];
        if (!row) return;
        row[e.target.dataset.field] = e.target.value;
        markCtDup(which);
        drawCtCharts();
    }

    function selectCtRow(which, idx) {
        ctRowSel[which] = idx;
        const body = $(which === 'electron' ? 'ctElectronBody' : 'ctMassBody');
        body.querySelectorAll('tr').forEach((tr, i) => tr.classList.toggle('active', i === idx));
    }

    function addCtRow(which) {
        if (!ctEditing || !ctDraft) return;
        ctDraft[which].push({ hu: '', val: '' });
        ctRowSel[which] = ctDraft[which].length - 1;
        renderCtDetail();
        const body = $(which === 'electron' ? 'ctElectronBody' : 'ctMassBody');
        const input = body.querySelector('tr:last-child input');
        if (input) input.focus();
    }

    function deleteCtRow(which) {
        if (!ctEditing || !ctDraft) return;
        const idx = ctRowSel[which];
        if (idx < 0 || !ctDraft[which][idx]) {
            toast(which === 'electron' ? '请选择一行相对电子密度删除' : '请选择一行质量密度删除');
            return;
        }
        ctDraft[which].splice(idx, 1);
        ctRowSel[which] = -1;
        renderCtDetail();
    }

    function rowError(which, rows) {
        const label = which === 'electron' ? '相对电子密度' : '质量密度';
        const maxV = which === 'electron' ? 20 : 25;
        const seen = new Set();
        for (let i = 0; i < rows.length; i += 1) {
            const r = rows[i];
            if (String(r.hu).trim() === '' || String(r.val).trim() === '') return 'HU/' + label + '不能为空';
            const hu = Number(r.hu);
            if (!decOk(r.hu, 2) || hu < -1050 || hu > 20000) return 'HU须在 -1050.00 到 20000.00 之间，保留有效小数';
            const val = Number(r.val);
            if (!decOk(r.val, 3) || val < 0 || val > maxV) {
                return label + '须在 0.000 到 ' + maxV.toFixed(3) + ' 之间，保留有效小数';
            }
            const key = String(hu);
            if (seen.has(key)) return '存在相同的数值关系';
            seen.add(key);
        }
        return '';
    }

    function cavityError(text) {
        if (!decOk(text, 2)) return '填充空腔HU须在 -1050.00 到 20000.00 之间';
        const n = Number(text);
        if (n < -1050 || n > 20000) return '填充空腔HU须在 -1050.00 到 20000.00 之间';
        return '';
    }

    function beginCtEdit() {
        const m = ctFind(selectedCtId);
        if (!m || m.group !== 'uncommissioned') return;
        ctDraft = clone(m);
        ctEditing = true;
        ctRowSel = { electron: -1, mass: -1 };
        renderCt();
    }

    function saveCtEdit() {
        if (!ctDraft) return;
        const name = $('ctName').value.trim();
        const maker = $('ctMaker').value.trim();
        ctDraft.name = $('ctName').value;
        ctDraft.manufacturer = $('ctMaker').value;
        if (!name) {
            $('ctName').classList.add('invalid');
            toast('请填写名称');
            return;
        }
        if (!CT_TEXT_RE.test(name)) {
            $('ctName').classList.add('invalid');
            toast('名称只允许英文字母、数字和字符，最长32个字符');
            return;
        }
        if (ctNameTaken(name, ctDraft.id)) {
            $('ctName').classList.add('invalid');
            toast('名称已存在');
            return;
        }
        if (maker && !CT_TEXT_RE.test(maker)) {
            $('ctMaker').classList.add('invalid');
            toast('生产商只允许英文字母、数字和字符，最长32个字符');
            return;
        }
        if (ctDraft.cavityOn) {
            const err = cavityError(String($('ctCavity').value).trim());
            if (err) {
                $('ctCavity').classList.add('invalid');
                toast(err);
                return;
            }
            ctDraft.cavityHu = Number($('ctCavity').value).toFixed(2);
        }
        const elecErr = rowError('electron', ctDraft.electron);
        if (elecErr) {
            toast(elecErr);
            markCtDup('electron');
            return;
        }
        const massErr = rowError('mass', ctDraft.mass);
        if (massErr) {
            toast(massErr);
            markCtDup('mass');
            return;
        }
        const sortRows = (rows) => rows.slice().sort((a, b) => Number(a.hu) - Number(b.hu));
        const target = ctFind(ctDraft.id);
        target.name = name;
        target.manufacturer = maker;
        target.cavityOn = !!ctDraft.cavityOn;
        target.cavityHu = ctDraft.cavityHu;
        target.electron = sortRows(ctDraft.electron);
        target.mass = sortRows(ctDraft.mass);
        ctEditing = false;
        ctDraft = null;
        ctChanged = true;
        renderCt();
        toast('已保存');
    }

    function ctHuSpan(rows) {
        const xs = rows.map((r) => Number(r.hu));
        return [Math.min.apply(null, xs), Math.max.apply(null, xs)];
    }

    function ctReadyError(m) {
        if (!m.name || !m.name.trim()) return '请填写名称';
        if (!m.manufacturer || !m.manufacturer.trim()) return '请填写生产商';
        if (m.cavityOn && cavityError(m.cavityHu)) return cavityError(m.cavityHu);
        if (!m.electron.length) return '请填写相对电子密度对照表';
        if (!m.mass.length) return '请填写质量密度对照表';
        const elecErr = rowError('electron', m.electron);
        if (elecErr) return elecErr;
        const massErr = rowError('mass', m.mass);
        if (massErr) return massErr;
        const elec = ctHuSpan(m.electron);
        const mass = ctHuSpan(m.mass);
        const overlap = elec[0] <= mass[1] && mass[0] <= elec[1];
        if (!overlap) {
            return '质量密度对应的HU值范围为' + mass[0] + '~' + mass[1]
                + '，相对电子密度对应的HU范围为' + elec[0] + '~' + elec[1] + '，HU范围不重叠';
        }
        return '';
    }

    function finishCtCommission() {
        const m = ctFind(selectedCtId);
        if (!m) return;
        m.group = 'commissioned';
        m.approver = $('authUser').value.trim() || USER;
        m.approvedAt = nowText();
        ctChanged = true;
        renderCt();
        toast('Commission 成功');
    }

    function commissionCt(id) {
        const m = ctFind(id);
        if (!m) return;
        if (ctEditing) {
            toast('请先保存当前修改');
            return;
        }
        const err = ctReadyError(m);
        if (err) {
            toast(err);
            return;
        }
        askAuth('Commission 需要管理员权限', finishCtCommission);
    }

    function createCt() {
        if (ctEditing) {
            toast('请先保存当前修改');
            return;
        }
        const id = 'ct' + (ctSeq += 1);
        ctMachines.push({
            id: id,
            name: nextCtName('new machine'),
            manufacturer: '',
            approver: '',
            approvedAt: '',
            group: 'uncommissioned',
            cavityOn: true,
            cavityHu: '-800.00',
            electron: [],
            mass: []
        });
        selectedCtId = id;
        ctChanged = true;
        renderCt();
        toast('已创建 ' + ctFind(id).name);
    }

    function copyCt(id) {
        const m = ctFind(id);
        if (!m) return;
        if (ctEditing) {
            toast('请先保存当前修改');
            return;
        }
        const nid = 'ct' + (ctSeq += 1);
        const copy = clone(m);
        copy.id = nid;
        copy.name = copyCtName(m.name);
        copy.group = 'uncommissioned';
        copy.approver = '';
        copy.approvedAt = '';
        ctMachines.push(copy);
        selectedCtId = nid;
        ctChanged = true;
        renderCt();
        toast('已复制到未审批的机器');
    }

    function deleteCt(id) {
        const idx = ctMachines.findIndex((m) => m.id === id);
        if (idx < 0) return;
        ctMachines.splice(idx, 1);
        if (selectedCtId === id) {
            const next = ctMachines.find((m) => m.group === 'uncommissioned') || ctMachines[0];
            selectedCtId = next ? next.id : '';
        }
        ctChanged = true;
        renderCt();
        toast('已删除');
    }

    function deprecateCt(id) {
        const m = ctFind(id);
        if (!m) return;
        m.group = 'deprecated';
        ctChanged = true;
        renderCt();
        toast(m.name + ' 已弃用');
    }

    function onCtContext(e) {
        const groupHd = e.target.closest('.tree-group-hd');
        const machineRow = e.target.closest('.tree-machine');
        if (!groupHd && !machineRow) return;
        e.preventDefault();
        if (groupHd && !machineRow) {
            if (groupHd.dataset.group !== 'uncommissioned') return;
            openMenu(e.clientX, e.clientY, [{ label: '创建新机器', run: createCt }]);
            return;
        }
        const id = machineRow.dataset.id;
        const m = ctFind(id);
        if (!m) return;
        if (!selectCt(id)) return;
        if (m.group === 'commissioned') {
            openMenu(e.clientX, e.clientY, [
                { label: '复制', run: () => copyCt(id) },
                {
                    label: '弃用',
                    run: () => askConfirm('弃用CT', '确定要丢弃 ' + m.name + ' 吗？', '丢弃后将无法恢复！', () => {
                        askAuth('弃用需要管理员权限', () => deprecateCt(id));
                    })
                }
            ]);
        } else if (m.group === 'uncommissioned') {
            openMenu(e.clientX, e.clientY, [
                {
                    label: '删除',
                    run: () => askConfirm('删除CT', '确定要删除 ' + m.name + ' 吗？', '删除后将无法恢复！', () => deleteCt(id))
                },
                { label: 'Commission', run: () => commissionCt(id) }
            ]);
        } else {
            openMenu(e.clientX, e.clientY, [
                { label: '复制', run: () => copyCt(id) }
            ]);
        }
    }

    function bindCtTable(bodyId, which) {
        const body = $(bodyId);
        body.addEventListener('mousedown', (e) => {
            const tr = e.target.closest('tr');
            if (!tr) return;
            selectCtRow(which, Number(tr.dataset.idx));
        });
        body.addEventListener('input', (e) => onCtCell(which, e));
    }

    function initCt() {
        $('ctTree').addEventListener('click', (e) => {
            const machineRow = e.target.closest('.tree-machine');
            const groupHd = e.target.closest('.tree-group-hd');
            if (machineRow) {
                selectCt(machineRow.dataset.id);
                return;
            }
            if (groupHd) {
                const gid = groupHd.dataset.group;
                if (ctCollapsed.has(gid)) ctCollapsed.delete(gid);
                else ctCollapsed.add(gid);
                renderCtTree();
            }
        });
        $('ctTree').addEventListener('contextmenu', onCtContext);
        $('ctEditBtn').addEventListener('click', beginCtEdit);
        $('ctSaveBtn').addEventListener('click', saveCtEdit);
        $('ctElecAdd').addEventListener('click', () => addCtRow('electron'));
        $('ctElecDel').addEventListener('click', () => deleteCtRow('electron'));
        $('ctMassAdd').addEventListener('click', () => addCtRow('mass'));
        $('ctMassDel').addEventListener('click', () => deleteCtRow('mass'));
        bindCtTable('ctElectronBody', 'electron');
        bindCtTable('ctMassBody', 'mass');
        $('ctName').addEventListener('input', () => {
            if (ctDraft) ctDraft.name = $('ctName').value;
            $('ctName').classList.remove('invalid');
        });
        $('ctMaker').addEventListener('input', () => {
            if (ctDraft) ctDraft.manufacturer = $('ctMaker').value;
            $('ctMaker').classList.remove('invalid');
        });
        $('ctCavityOn').addEventListener('change', () => {
            if (!ctDraft) return;
            ctDraft.cavityOn = $('ctCavityOn').checked;
            $('ctCavity').readOnly = !ctDraft.cavityOn;
            if (ctDraft.cavityOn && !String($('ctCavity').value).trim()) {
                ctDraft.cavityHu = '-800.00';
                $('ctCavity').value = '-800.00';
            }
        });
        $('ctCavity').addEventListener('input', () => $('ctCavity').classList.remove('invalid'));
        $('ctCavity').addEventListener('blur', () => {
            if (!ctDraft || !ctDraft.cavityOn) return;
            const raw = String($('ctCavity').value).trim();
            if (!raw) {
                $('ctCavity').value = ctDraft.cavityHu;
                return;
            }
            const err = cavityError(raw);
            if (err) {
                toast(err);
                $('ctCavity').value = ctDraft.cavityHu;
                return;
            }
            ctDraft.cavityHu = Number(raw).toFixed(2);
            $('ctCavity').value = ctDraft.cavityHu;
        });
        window.addEventListener('resize', drawCtCharts);
        renderCt();
    }

    function leavePhysics() {
        if (window.history.length > 1) window.history.back();
        else window.location.href = '../index.html';
    }

    function closePhysics() {
        if (ctEditing) {
            askConfirm('未保存的修改', '当前修改尚未保存，退出后将放弃这些修改。', '', () => {
                ctEditing = false;
                ctDraft = null;
                closePhysics();
            });
            return;
        }
        if (ctChanged) {
            restartLeave = leavePhysics;
            showMask('restartMask');
            return;
        }
        askConfirm('退出', '确定退出物理模块？', '', leavePhysics);
    }

    function bind() {
        $('topTabs').addEventListener('click', (e) => {
            const btn = e.target.closest('.pm-tab');
            if (!btn) return;
            const go = () => {
                document.querySelectorAll('.pm-tab').forEach((t) => t.classList.toggle('active', t === btn));
                document.querySelectorAll('.pm-panel').forEach((p) => p.classList.remove('active'));
                $('panel-' + btn.dataset.tab).classList.add('active');
                if (btn.dataset.tab === 'ct') requestAnimationFrame(drawCtCharts);
            };
            if (ctEditing && btn.dataset.tab !== 'ct') {
                askConfirm('未保存的修改', '当前修改尚未保存，切换后将放弃这些修改。', '', () => {
                    ctEditing = false;
                    ctDraft = null;
                    renderCt();
                    go();
                });
                return;
            }
            go();
        });

        $('machineTree').addEventListener('click', (e) => {
            const groupHd = e.target.closest('.tree-group-hd');
            const machineRow = e.target.closest('.tree-machine');
            const pbsRow = e.target.closest('.tree-pbs');
            if (pbsRow) {
                select(pbsRow.dataset.id, 'pbs');
                return;
            }
            if (machineRow) {
                if (e.target.closest('[data-fold]')) {
                    const key = 'm:' + machineRow.dataset.id;
                    if (collapsed.has(key)) collapsed.delete(key);
                    else collapsed.add(key);
                    renderTree();
                    return;
                }
                select(machineRow.dataset.id, 'machine');
                return;
            }
            if (groupHd) {
                const key = 'g:' + groupHd.dataset.group;
                if (collapsed.has(key)) collapsed.delete(key);
                else collapsed.add(key);
                renderTree();
            }
        });
        $('machineTree').addEventListener('contextmenu', onTreeContext);

        $('machineTabs').addEventListener('click', (e) => {
            const btn = e.target.closest('.acc-subtab');
            if (!btn || btn.hidden) return;
            machineTab = btn.dataset.tab;
            updateVisibility();
        });
        $('beamTabs').addEventListener('click', (e) => {
            const btn = e.target.closest('.acc-subtab');
            if (!btn || btn.hidden) return;
            beamTab = btn.dataset.btab;
            updateVisibility();
        });
        document.querySelectorAll('.obj-tab').forEach((btn) => {
            btn.addEventListener('click', () => {
                activeObj = btn.dataset.obj;
                renderObjectTables();
            });
        });

        $('editBtn').addEventListener('click', beginEdit);
        $('cancelEditBtn').addEventListener('click', cancelEdit);
        $('saveBtn').addEventListener('click', saveEdit);
        $('objAddBtn').addEventListener('click', addObjectRow);
        $('objDelBtn').addEventListener('click', deleteObjectRow);
        $('mlcAddBtn').addEventListener('click', () => addLeaf('mlc'));
        $('mlcDelBtn').addEventListener('click', () => deleteLeaf('mlc'));
        $('blockAddBtn').addEventListener('click', () => addLeaf('block'));
        $('blockDelBtn').addEventListener('click', () => deleteLeaf('block'));

        $('fModel').addEventListener('change', () => {
            if (!draft) return;
            draft.model = $('fModel').value;
            updateVisibility();
            updateGeometryLayout(draft.model);
            renderObjectTables();
        });

        $('confirmOk').addEventListener('click', () => {
            hideMask('confirmMask');
            const cb = confirmCb;
            confirmCb = null;
            if (cb) cb();
        });
        $('authOk').addEventListener('click', () => {
            const user = $('authUser').value.trim();
            const pwd = $('authPwd').value;
            if (!user || !pwd) {
                toast('请输入账号和密码');
                return;
            }
            hideMask('authMask');
            const cb = authCb;
            authCb = null;
            if (cb) cb();
        });
        $('commOk').addEventListener('click', () => {
            if (!$('pathIdd').value.trim() || !$('pathSpot').value.trim() || !$('pathClinic').value.trim()) {
                toast('三个数据目录都需要填写');
                return;
            }
            hideMask('commMask');
            askAuth('Commission 需要管理员权限', finishCommission);
        });
        document.querySelectorAll('[data-pick]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.pick;
                const folder = id === 'pathIdd' ? 'IDD' : id === 'pathSpot' ? 'Spot' : 'Clinical';
                $(id).value = 'D:\\Commission\\' + (findMachine(selectedId) ? findMachine(selectedId).name : 'machine') + '\\' + folder;
            });
        });
        document.querySelectorAll('[data-close]').forEach((btn) => {
            btn.addEventListener('click', () => hideMask(btn.dataset.close));
        });

        $('userBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            $('userMenu').hidden = !$('userMenu').hidden;
        });
        $('logoutBtn').addEventListener('click', () => {
            window.location.href = '../index.html';
        });
        $('closeBtn').addEventListener('click', closePhysics);
        $('restartLater').addEventListener('click', () => {
            hideMask('restartMask');
            const fn = restartLeave;
            restartLeave = null;
            if (fn) fn();
        });
        $('restartNow').addEventListener('click', () => {
            hideMask('restartMask');
            const fn = restartLeave;
            restartLeave = null;
            toast('客户端即将重启');
            if (fn) setTimeout(fn, 400);
        });
        $('minBtn').addEventListener('click', () => toast('物理模块已最小化到任务栏'));
        $('maxBtn').addEventListener('click', () => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
            else document.exitFullscreen?.();
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#ctxMenu')) $('ctxMenu').hidden = true;
            if (!e.target.closest('#userBtn') && !e.target.closest('#userMenu')) $('userMenu').hidden = true;
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                $('ctxMenu').hidden = true;
                $('userMenu').hidden = true;
                ['confirmMask', 'authMask', 'commMask', 'restartMask'].forEach(hideMask);
            }
        });
    }

    initCt();
    bind();
    paint();
})();
