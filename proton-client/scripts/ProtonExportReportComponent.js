/**
 * 质子-导出报告（组件库演示版）
 * - 排版参考：挡块信息.html（A4 容器、标题/副标题、两列信息栅格、分段表格、打印样式）
 * - 信息内容参考：计划报告-MyQA Test MyQA Test.pdf（字段与分段）
 */
class ProtonExportReportComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = options;
        this.rootEl = null;
        this.styleEl = null;
        this.render();
    }

    destroy() {
        if (this.rootEl && this.rootEl.parentNode) this.rootEl.parentNode.removeChild(this.rootEl);
        if (this.styleEl && this.styleEl.parentNode) this.styleEl.parentNode.removeChild(this.styleEl);
        this.rootEl = null;
        this.styleEl = null;
    }

    render() {
        const container = typeof this.containerId === 'string'
            ? document.getElementById(this.containerId)
            : this.containerId;
        if (!container) return;

        container.innerHTML = '';
        container.style.minHeight = '400px';

        const namespace = 'proton-export-report';
        this.styleEl = document.createElement('style');
        this.styleEl.textContent = this.getStyles(namespace);
        document.head.appendChild(this.styleEl);

        this.rootEl = document.createElement('div');
        this.rootEl.className = `${namespace}-shell`;
        this.rootEl.innerHTML = this.getHtml(namespace, this.getSampleData());

        container.appendChild(this.rootEl);
    }

    getImageBasePath() {
        // 组件会在不同页面被复用：组件库(`component-gallery/`) 与质子模块页(`proton-client/modules/`) 的相对路径不同
        // 允许调用方传入 imageBasePath 进行覆盖
        const p = (this.options && this.options.imageBasePath) ? String(this.options.imageBasePath) : '../image';
        return p.endsWith('/') ? p.slice(0, -1) : p;
    }

    getSampleData() {
        // 直接采用 PDF 中的示例数据（MyQA Test）
        return {
            header: {
                title: '计划报告',
                subtitle: '此计划未经审核不能用于临床',
                brand: 'MOZI-PROTON'
            },
            patient: {
                '患者姓名': 'MyQA Test',
                '病例号': 'MyQA Test',
                '性别': 'None',
                '出生日期': '20250115',
                '计划系统': 'MOZI-PROTON 1.0.1.1',
                '治疗技术': 'ProBeam_TR3',
                '计划批准状态': '未审批',
                '工作站': 'DESKTOP-3H7FTHQ 192.168.10.169',
                '治疗机': 'PBS',
                '计划保存时间': '2026-03-13 17:47:12 (YYYY-MM-DD HH:MM:SS)',
                '报告生成时间': '2026-03-17 15:27:07 (YYYY-MM-DD HH:MM:SS)',
                '治疗机保存时间': '2024-08-29 11:17:50 (YYYY-MM-DD HH:MM:SS)',
                '时区': '北京(UTC+8)'
            },
            imageSet: {
                id: '1.2.752.243.1.1.20250115140429435.2160.11482',
                sliceCount: 215,
                thickness: '2.00',
                position: 'Head First-Supine'
            },
            plan: {
                '计划名称': 'test',
                '计划UID': '1.2.276.0.7230010.3.1.4.33.85377636.12940.1773395.232.490',
                '治疗体位': 'HFS',
                'RBE因子': '1.10',
                '计划最大剂量[cGy]': '4141.46',
                '最大剂量点位置[cm]': 'X=-0.84 Y=-5.40 Z=21.64',
                '计划图像': 'CT 1',
                '计划者': 'manteia',
                '计划描述': '',
                '剂量计算算法': 'MC'
            },
            prescription: {
                '目标靶区': '0_CTV_Prostate',
                '总剂量[cGy](RBE)': '4000.00',
                '分次数': '20',
                '分次剂量[cGy](RBE)': '200.00',
                '剂量缩放': '取消归一'
            },
            grid: {
                '网格大小[cm]': '0.20 X 0.20 X 0.20',
                '网格数量': '22603750'
            },
            setup: {
                '标记定位点[cm]': '',
                'Beam 1、Beam 2、Beam 3 等中心点[cm]': 'ISO1: X=-0.63 Y=-4.80 Z=21.14'
            },
            couchShift: {
                '观察方向': '从床尾望向机架方向',
                'Beam 1、Beam 2、Beam 3[cm]': ''
            },
            beams: [
                {
                    index: 1,
                    name: 'Beam 1',
                    machine: 'ProBeam_TR3',
                    technique: 'PBS',
                    radiationType: 'Proton',
                    mu: '3244.880893',
                    gantry: '0.0',
                    couch: '0.0',
                    iso: 'ISO1',
                    isoX: '-0.63',
                    isoY: '-4.80',
                    isoZ: '21.14',
                    snout: '42.10',
                    rangeShifter: 'NONE',
                    airgapMin: '-100000.00',
                    airgapCax: '-100000.00',
                    dose: '64.2',
                    desc: ''
                },
                {
                    index: 2,
                    name: 'Beam 2',
                    machine: 'ProBeam_TR3',
                    technique: 'PBS',
                    radiationType: 'Proton',
                    mu: '3439.264582',
                    gantry: '85.0',
                    couch: '0.0',
                    iso: 'ISO1',
                    isoX: '-0.63',
                    isoY: '-4.80',
                    isoZ: '21.14',
                    snout: '42.10',
                    rangeShifter: 'NONE',
                    airgapMin: '-100000.00',
                    airgapCax: '-100000.00',
                    dose: '68.1',
                    desc: ''
                },
                {
                    index: 3,
                    name: 'Beam 3',
                    machine: 'ProBeam_TR3',
                    technique: 'PBS',
                    radiationType: 'Proton',
                    mu: '3416.683645',
                    gantry: '265.0',
                    couch: '0.0',
                    iso: 'ISO1',
                    isoX: '-0.63',
                    isoY: '-4.80',
                    isoZ: '21.14',
                    snout: '42.10',
                    rangeShifter: 'NONE',
                    airgapMin: '-100000.00',
                    airgapCax: '-100000.00',
                    dose: '67.7',
                    desc: ''
                }
            ],
            roiList: [
                { roi: '0_CTV_Prostate', type: 'CTV', volume: '41.57', density: 'None', missingSlice: '否', overlapPtv: '-' },
                { roi: '0_GTV_Prostate', type: 'GTV', volume: '1.39', density: 'None', missingSlice: '否', overlapPtv: '-' },
                { roi: '3800CTV', type: 'CTV', volume: '38.98', density: 'None', missingSlice: '否', overlapPtv: '-' },
                { roi: 'Artifact', type: 'ORGAN', volume: '0.93', density: 'None', missingSlice: '否', overlapPtv: '是' },
                { roi: 'Bladder', type: 'ORGAN', volume: '224.33', density: 'None', missingSlice: '否', overlapPtv: '-' },
                { roi: 'Body', type: 'ORGAN', volume: '24892.35', density: 'None', missingSlice: '否', overlapPtv: '是' }
            ],
            roiDoseStats: [
                // 示例数值来自计划报告 PDF（用于组件库展示）
                { color: '#ff0000', roi: '0_CTV_Prostate', type: 'CTV', volume: '41.57', dmax: '4141.46', dmin: '3693.79', dmean: '3863.97', d99: '3806.94', d98: '3811.59', d95: '3819.60', d50: '3858.40', d2: '4021.15', d1: '4055.98' },
                { color: '#ff00ff', roi: '0_GTV_Prostate', type: 'GTV', volume: '1.39', dmax: '4141.46', dmin: '3881.90', dmean: '4024.72', d99: '3919.78', d98: '3929.76', d95: '3946.66', d50: '4044.23', d2: '4113.26', d1: '4120.52' },
                { color: '#00ff00', roi: '3800CTV', type: 'CTV', volume: '38.98', dmax: '3966.35', dmin: '3693.79', dmean: '3856.06', d99: '3806.40', d98: '3810.94', d95: '3818.68', d50: '3855.71', d2: '3901.42', d1: '3906.30' },
                { color: '#0000ff', roi: 'Artifact', type: 'ORGAN', volume: '0.93', dmax: '3917.78', dmin: '3795.81', dmean: '3858.68', d99: '3816.76', d98: '3821.97', d95: '3827.76', d50: '3862.26', d2: '3904.11', d1: '3906.97' },
                { color: '#00ffff', roi: 'Barrigel', type: 'NONE', volume: '8.49', dmax: '3899.48', dmin: '662.33', dmean: '2985.12', d99: '923.73', d98: '1037.85', d95: '1285.67', d50: '3277.61', d2: '3821.44', d1: '3838.10' },
                { color: '#0000aa', roi: 'Bladder', type: 'ORGAN', volume: '224.33', dmax: '3785.76', dmin: '0.00', dmean: '405.11', d99: '0.17', d98: '0.33', d95: '0.83', d50: '25.35', d2: '2822.60', d1: '3156.21' },
                { color: '#00aa00', roi: 'Body', type: 'ORGAN', volume: '24892.35', dmax: '4141.46', dmin: '0.00', dmean: '71.15', d99: '0.01', d98: '0.03', d95: '0.07', d50: '0.66', d2: '1304.82', d1: '1640.08' },
                { color: '#aa6600', roi: 'BowelSpace', type: 'ORGAN', volume: '2314.95', dmax: '28.86', dmin: '0.00', dmean: '0.20', d99: '0.01', d98: '0.02', d95: '0.05', d50: '0.52', d2: '1.93', d1: '3.73' }
            ],
            poiDoseStats: [
                { color: '#ffff00', poi: 'CT Origin', x: '0.06', y: '0.00', z: '20.06', dose: '30.03' }
            ],
            sfrtGeometry: {
                'GTV体积[cm³]': '60.25',
                'GTV内缩距离[mm]': '10',
                '小球平均直径[mm]': '30',
                '小球平均球心间距[mm]': '45',
                '小球个数[个]': '20',
                '最大小球体积[mm3]': '1380.00',
                '最小小球体积[mm3]': '600.00',
                '小球总体积/GTV体积[%]': '3.92',
                '小球边缘距离GTV边缘最小距离[mm]': '11',
                '小球边缘距离OAR边缘最小距离[mm]': '185'
            },
            clinicalTargets: [
                { color: '#0000ff', roi: 'Artifact', type: 'ORGAN', goal: 'Dmax≤555.00Gy', predicted: '', actual: 'Dmax=3917.78Gy', pass: 'NO' }
            ],
            beamOptimizationSettings: [
                { index: 1, name: 'Beam 1', rtv: '', spotSpacingCm: '0.8', layerSpacingCm: '0.5', proximalLayerSpots: '1', distalLayerSpots: '1' },
                { index: 2, name: 'Beam 2', rtv: '', spotSpacingCm: '0.8', layerSpacingCm: '0.5', proximalLayerSpots: '1', distalLayerSpots: '1' },
                { index: 3, name: 'Beam 3', rtv: '', spotSpacingCm: '0.8', layerSpacingCm: '0.5', proximalLayerSpots: '1', distalLayerSpots: '1' }
            ],
            energyLayers: [
                {
                    beam: 'Beam 1',
                    summary: { layerTotal: 15, spotTotal: 579, minSpotMu: '2.0001', maxSpotMu: '22.4692' },
                    rows: [
                        { idx: 0, energy: '131.36', mu: '2.6277', spots: '1', min: '2.6277', max: '2.63', scans: '1' },
                        { idx: 1, energy: '128.34', mu: '121.2742', spots: '19', min: '2.8556', max: '10.44', scans: '1' },
                        { idx: 2, energy: '125.28', mu: '274.0945', spots: '40', min: '3.9536', max: '10.03', scans: '1' },
                        { idx: 3, energy: '122.14', mu: '328.7823', spots: '48', min: '4.5738', max: '11.31', scans: '1' },
                        { idx: 4, energy: '118.97', mu: '319.7804', spots: '53', min: '2.0001', max: '22.47', scans: '1' },
                        { idx: 5, energy: '115.73', mu: '332.8050', spots: '55', min: '2.0782', max: '14.66', scans: '1' },
                        { idx: 6, energy: '112.42', mu: '277.0987', spots: '56', min: '2.0335', max: '9.53', scans: '1' },
                        { idx: 7, energy: '109.04', mu: '294.3920', spots: '56', min: '2.0001', max: '12.02', scans: '1' },
                        { idx: 8, energy: '105.58', mu: '275.9224', spots: '55', min: '2.0001', max: '11.31', scans: '1' },
                        { idx: 9, energy: '102.05', mu: '278.1624', spots: '51', min: '2.0001', max: '8.28', scans: '1' },
                        { idx: 10, energy: '98.42', mu: '216.4654', spots: '46', min: '2.0001', max: '6.91', scans: '1' },
                        { idx: 11, energy: '94.68', mu: '207.2102', spots: '38', min: '4.2747', max: '8.21', scans: '1' },
                        { idx: 12, energy: '90.82', mu: '187.0692', spots: '34', min: '4.7851', max: '7.76', scans: '1' },
                        { idx: 13, energy: '86.84', mu: '95.7011', spots: '20', min: '4.7851', max: '4.79', scans: '1' },
                        { idx: 14, energy: '82.71', mu: '33.4954', spots: '7', min: '4.7851', max: '4.79', scans: '1' }
                    ]
                },
                {
                    beam: 'Beam 2',
                    summary: { layerTotal: 18, spotTotal: 575, minSpotMu: '2.0001', maxSpotMu: '16.6431' },
                    rows: [
                        { idx: 0, energy: '193.42', mu: '22.5943', spots: '3', min: '4.3459', max: '9.78', scans: '1' },
                        { idx: 1, energy: '191.11', mu: '52.3255', spots: '8', min: '3.9618', max: '10.50', scans: '1' },
                        { idx: 2, energy: '188.79', mu: '131.1097', spots: '17', min: '4.1065', max: '13.23', scans: '1' },
                        { idx: 3, energy: '186.42', mu: '143.2430', spots: '21', min: '3.2359', max: '11.62', scans: '1' },
                        { idx: 4, energy: '184.08', mu: '191.7476', spots: '30', min: '2.4909', max: '11.23', scans: '1' },
                        { idx: 5, energy: '181.70', mu: '255.3966', spots: '37', min: '3.0293', max: '16.64', scans: '1' },
                        { idx: 6, energy: '179.29', mu: '277.1285', spots: '43', min: '2.8539', max: '15.33', scans: '1' },
                        { idx: 7, energy: '176.85', mu: '280.7766', spots: '45', min: '2.0001', max: '13.65', scans: '1' },
                        { idx: 8, energy: '174.40', mu: '294.9646', spots: '47', min: '2.2389', max: '12.53', scans: '1' },
                        { idx: 9, energy: '171.93', mu: '285.4083', spots: '47', min: '2.0001', max: '12.03', scans: '1' },
                        { idx: 10, energy: '169.46', mu: '289.9327', spots: '48', min: '2.5979', max: '14.14', scans: '1' },
                        { idx: 11, energy: '166.92', mu: '260.1946', spots: '48', min: '2.6199', max: '9.38', scans: '1' },
                        { idx: 12, energy: '164.39', mu: '254.9132', spots: '47', min: '2.7076', max: '8.40', scans: '1' },
                        { idx: 13, energy: '161.80', mu: '235.1894', spots: '44', min: '2.7942', max: '7.44', scans: '1' },
                        { idx: 14, energy: '159.22', mu: '199.1335', spots: '37', min: '3.7378', max: '8.63', scans: '1' },
                        { idx: 15, energy: '156.59', mu: '145.0094', spots: '28', min: '4.6492', max: '6.26', scans: '1' },
                        { idx: 16, energy: '153.91', mu: '81.9304', spots: '17', min: '4.7596', max: '4.97', scans: '1' },
                        { idx: 17, energy: '151.24', mu: '38.2668', spots: '8', min: '4.7593', max: '4.80', scans: '1' }
                    ]
                },
                {
                    beam: 'Beam 3',
                    summary: { layerTotal: 18, spotTotal: 573, minSpotMu: '2.0192', maxSpotMu: '17.4408' },
                    rows: [
                        { idx: 0, energy: '195.70', mu: '12.1182', spots: '2', min: '4.3615', max: '7.76', scans: '1' },
                        { idx: 1, energy: '193.39', mu: '62.4320', spots: '10', min: '5.0207', max: '8.30', scans: '1' },
                        { idx: 2, energy: '191.11', mu: '84.7367', spots: '13', min: '4.7713', max: '9.44', scans: '1' },
                        { idx: 3, energy: '188.76', mu: '143.7808', spots: '22', min: '3.5557', max: '11.74', scans: '1' },
                        { idx: 4, energy: '186.44', mu: '154.2323', spots: '28', min: '2.7363', max: '10.79', scans: '1' },
                        { idx: 5, energy: '184.08', mu: '234.6906', spots: '36', min: '3.1272', max: '13.09', scans: '1' },
                        { idx: 6, energy: '181.67', mu: '265.4761', spots: '42', min: '2.5577', max: '13.15', scans: '1' },
                        { idx: 7, energy: '179.27', mu: '285.0084', spots: '44', min: '2.8593', max: '15.71', scans: '1' }
                    ]
                }
            ],
            energySummary: [
                {
                    beam: 'Beam 1',
                    layerCount: 15,
                    spotCount: 579,
                    minSpotMu: '2.0001',
                    maxSpotMu: '22.4692'
                },
                {
                    beam: 'Beam 2',
                    layerCount: 18,
                    spotCount: 575,
                    minSpotMu: '2.0001',
                    maxSpotMu: '16.6431'
                },
                {
                    beam: 'Beam 3',
                    layerCount: 18,
                    spotCount: 573,
                    minSpotMu: '2.0192',
                    maxSpotMu: '17.4408'
                }
            ],
            warnings: {
                status: 'UNAPPROVED',
                reviewerSign: '',
                approveDate: 'None',
                items: [
                    // 示例：当前无告警则留空行
                    { time: '', message: '', action: '' }
                ]
            },
            footer: {
                pageText: '13 of 13'
            }
        };
    }

    getHtml(ns, data) {
        const imgBase = this.getImageBasePath();
        // 页眉排版：按截图（左右两列各 6 行）固定字段顺序
        const headerLeftKeys = [
            '患者姓名',
            '性别',
            '计划系统',
            '计划批准状态',
            '治疗机',
            '报告生成时间'
        ];
        const headerRightKeys = [
            '病例号',
            '出生日期',
            '治疗技术',
            '工作站',
            '计划保存时间',
            '治疗机保存时间'
        ];
        const headerPatientRows = headerLeftKeys.map((leftKey, idx) => {
            const rightKey = headerRightKeys[idx];
            const leftVal = data.patient[leftKey] ?? '';
            const rightVal = data.patient[rightKey] ?? '';
            const leftIsLong = String(leftVal).length > 28;
            const rightIsLong = String(rightVal).length > 28;
            return `
                <tr>
                    <td class="${ns}-header-label">${this.escapeHtml(leftKey)}</td>
                    <td class="${ns}-header-value${leftIsLong ? ` ${ns}-header-value-long` : ''}" title="${this.escapeAttr(String(leftVal))}">${this.escapeHtml(String(leftVal))}</td>
                    <td class="${ns}-header-label">${this.escapeHtml(rightKey)}</td>
                    <td class="${ns}-header-value${rightIsLong ? ` ${ns}-header-value-long` : ''}" title="${this.escapeAttr(String(rightVal))}">${this.escapeHtml(String(rightVal))}</td>
                </tr>
            `;
        }).join('');

        const roiRows = data.roiList.map(r => `
            <tr>
                <td>${this.escapeHtml(r.roi)}</td>
                <td class="${ns}-center">${this.escapeHtml(r.type)}</td>
                <td class="${ns}-right">${this.escapeHtml(r.volume)}</td>
                <td class="${ns}-center">${this.escapeHtml(r.density)}</td>
                <td class="${ns}-center">${this.escapeHtml(r.missingSlice)}</td>
                <td class="${ns}-center">${this.escapeHtml(r.overlapPtv)}</td>
            </tr>
        `).join('');

        const beamDetailTables = (data.beams || []).map((b) => {
            const rows = [
                ['序号', b.index, '名称', b.name],
                ['治疗机', b.machine, '技术', b.technique],
                ['辐射类型', b.radiationType, 'MU', b.mu],
                ['机架[°]', b.gantry, '治疗床[°]', b.couch],
                ['等中心', b.iso, 'X[cm]', b.isoX],
                ['Y[cm]', b.isoY, 'Z[cm]', b.isoZ],
                ['SNOUT[cm]', b.snout, 'Rangeshifter', b.rangeShifter],
                ['Airgap(Min)[cm]', b.airgapMin, 'Airgap(CAX)[cm]', b.airgapCax],
                ['剂量[cGy]', b.dose, '描述', b.desc]
            ];
            const htmlRows = rows.map(([k1, v1, k2, v2]) => `
                <tr>
                    <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k1))}</td>
                    <td class="${ns}-info-cell">${this.escapeHtml(String(v1 ?? ''))}</td>
                    <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k2))}</td>
                    <td class="${ns}-info-cell">${this.escapeHtml(String(v2 ?? ''))}</td>
                </tr>
            `).join('');

            return `
                <div class="${ns}-table-container ${ns}-beam-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${htmlRows}
                        </tbody>
                    </table>
                </div>
            `;
        }).join('');

        const bevInfoTable = (() => {
            // 演示数据：默认取第一束作为 BEV 信息
            const b = (data.beams && data.beams[0]) ? data.beams[0] : {};
            const rows = [
                ['序号', b.index ?? '', '名称', b.name ?? ''],
                ['治疗机', b.machine ?? '', '技术', b.technique ?? ''],
                ['辐射类型', b.radiationType ?? '', 'MU', b.mu ?? ''],
                ['机架[°]', b.gantry ?? '', '治疗床[°]', b.couch ?? ''],
                ['等中心', b.iso ?? '', 'X[cm]', b.isoX ?? ''],
                ['Y[cm]', b.isoY ?? '', 'Z[cm]', b.isoZ ?? ''],
                ['SNOUT[cm]', b.snout ?? '', 'Rangeshifter', b.rangeShifter ?? ''],
                ['Airgap(Min)[cm]', b.airgapMin ?? '', 'Airgap(CAX)[cm]', b.airgapCax ?? ''],
                ['剂量[cGy]', b.dose ?? '', '描述', b.desc ?? '']
            ];
            const htmlRows = rows.map(([k1, v1, k2, v2]) => `
                <tr>
                    <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k1))}</td>
                    <td class="${ns}-info-cell">${this.escapeHtml(String(v1 ?? ''))}</td>
                    <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k2))}</td>
                    <td class="${ns}-info-cell">${this.escapeHtml(String(v2 ?? ''))}</td>
                </tr>
            `).join('');
            return `
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${htmlRows}
                        </tbody>
                    </table>
                </div>
            `;
        })();

        const energyRows = data.energySummary.map(s => `
            <tr>
                <td>${this.escapeHtml(s.beam)}</td>
                <td class="${ns}-center">${this.escapeHtml(String(s.layerCount))}</td>
                <td class="${ns}-center">${this.escapeHtml(String(s.spotCount))}</td>
                <td class="${ns}-center">${this.escapeHtml(String(s.minSpotMu))}</td>
                <td class="${ns}-center">${this.escapeHtml(String(s.maxSpotMu))}</td>
            </tr>
        `).join('');

        const energyLayerBlocks = (data.energyLayers || []).map(layer => {
            const summary = layer.summary || {};
            const header = `射束：${layer.beam}  能量层总计：${summary.layerTotal ?? ''}  束斑总计：${summary.spotTotal ?? ''}  最小束斑跳数/最大束斑跳数[MU/fx]：${summary.minSpotMu ?? ''}/${summary.maxSpotMu ?? ''}`;
            const bodyRows = (layer.rows || []).map(r => `
                <tr>
                    <td class="${ns}-center">${this.escapeHtml(String(r.idx))}</td>
                    <td class="${ns}-center">${this.escapeHtml(String(r.energy))}</td>
                    <td class="${ns}-center">${this.escapeHtml(String(r.mu))}</td>
                    <td class="${ns}-center">${this.escapeHtml(String(r.spots))}</td>
                    <td class="${ns}-center">${this.escapeHtml(String(r.min))}</td>
                    <td class="${ns}-center">${this.escapeHtml(String(r.max))}</td>
                    <td class="${ns}-center">${this.escapeHtml(String(r.scans))}</td>
                </tr>
            `).join('');
            return `
                <div class="${ns}-energy-block">
                    <div class="${ns}-energy-block-header">${this.escapeHtml(header)}</div>
                    <div class="${ns}-table-container">
                        <table class="${ns}-table ${ns}-energy-table">
                            <thead>
                                <tr>
                                    <th class="${ns}-center" style="width:60px;">序号</th>
                                    <th class="${ns}-center">能量[MeV]</th>
                                    <th class="${ns}-center">MU</th>
                                    <th class="${ns}-center">束斑数量</th>
                                    <th class="${ns}-center">最小束斑跳数[MU/fx]</th>
                                    <th class="${ns}-center">最大束斑跳数[MU/fx]</th>
                                    <th class="${ns}-center">扫描次数</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bodyRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }).join('');

        const kvTable = (obj) => {
            const entries = Object.entries(obj);
            const rows = [];
            for (let i = 0; i < entries.length; i += 2) {
                const [k1, v1] = entries[i] || ['', ''];
                const [k2, v2] = entries[i + 1] || ['', ''];
                const hasRight = Boolean(k2);
                if (!hasRight) {
                    rows.push(`
                        <tr>
                            <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(k1)}</td>
                            <td class="${ns}-info-cell">${this.escapeHtml(String(v1 ?? ''))}</td>
                            <td class="${ns}-info-cell ${ns}-cell-blank" colspan="2"></td>
                        </tr>
                    `);
                } else {
                    rows.push(`
                        <tr>
                            <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(k1)}</td>
                            <td class="${ns}-info-cell">${this.escapeHtml(String(v1 ?? ''))}</td>
                            <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(k2)}</td>
                            <td class="${ns}-info-cell">${this.escapeHtml(String(v2 ?? ''))}</td>
                        </tr>
                    `);
                }
            }
            return rows.join('');
        };

        const roiDoseStatsRows = (data.roiDoseStats || []).map(r => `
            <tr>
                <td class="${ns}-center">
                    <span class="${ns}-roi-color" style="background:${this.escapeAttr(r.color)}"></span>
                </td>
                <td class="${ns}-roi-name">${this.escapeHtml(String(r.roi))}</td>
                <td class="${ns}-center">${this.escapeHtml(String(r.type))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.volume))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.dmax))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.dmin))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.dmean))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d99))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d98))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d95))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d50))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d2))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d1))}</td>
            </tr>
        `).join('');

        const poiDoseStatsRows = (data.poiDoseStats || []).map(p => `
            <tr>
                <td class="${ns}-center">
                    <span class="${ns}-roi-color" style="background:${this.escapeAttr(p.color)}"></span>
                </td>
                <td>${this.escapeHtml(String(p.poi))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(p.x))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(p.y))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(p.z))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(p.dose))}</td>
            </tr>
        `).join('');

        const sfrtGeometryRows = (() => {
            const g = data.sfrtGeometry || {};
            const rows = [
                ['GTV体积[cm³]', g['GTV体积[cm³]'], 'GTV内缩距离[mm]', g['GTV内缩距离[mm]']],
                ['小球平均直径[mm]', g['小球平均直径[mm]'], '小球平均球心间距[mm]', g['小球平均球心间距[mm]']],
                ['小球个数[个]', g['小球个数[个]'], '最大小球体积[mm3]', g['最大小球体积[mm3]']],
                ['最小小球体积[mm3]', g['最小小球体积[mm3]'], '小球总体积/GTV体积[%]', g['小球总体积/GTV体积[%]']],
                ['小球边缘距离GTV边缘最小距离[mm]', g['小球边缘距离GTV边缘最小距离[mm]'], '小球边缘距离OAR边缘最小距离[mm]', g['小球边缘距离OAR边缘最小距离[mm]']]
            ];
            return rows.map(([k1, v1, k2, v2]) => `
                <tr>
                    <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k1))}</td>
                    <td class="${ns}-info-cell">${this.escapeHtml(String(v1 ?? ''))}</td>
                    <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k2))}</td>
                    <td class="${ns}-info-cell">${this.escapeHtml(String(v2 ?? ''))}</td>
                </tr>
            `).join('');
        })();

        const clinicalTargetRows = (data.clinicalTargets || []).map(t => `
            <tr>
                <td class="${ns}-center">
                    <span class="${ns}-roi-color" style="background:${this.escapeAttr(t.color)}"></span>
                </td>
                <td>${this.escapeHtml(String(t.roi))}</td>
                <td class="${ns}-center">${this.escapeHtml(String(t.type))}</td>
                <td>${this.escapeHtml(String(t.goal))}</td>
                <td>${this.escapeHtml(String(t.predicted ?? ''))}</td>
                <td>${this.escapeHtml(String(t.actual ?? ''))}</td>
                <td class="${ns}-center">${this.escapeHtml(String(t.pass ?? ''))}</td>
            </tr>
        `).join('');

        const beamOptimizationTables = (data.beamOptimizationSettings || []).map(s => {
            const rows = [
                ['序号', s.index, '名称', s.name],
                ['RTV', s.rtv, '束斑间距[cm]', s.spotSpacingCm],
                ['层间距[cm]', s.layerSpacingCm, '近端层束斑', s.proximalLayerSpots],
                // 最后一行右侧空白（跨列），匹配截图
                ['远端层束斑', s.distalLayerSpots, '', '']
            ];
            const htmlRows = rows.map(([k1, v1, k2, v2]) => {
                const hasRight = Boolean(k2);
                if (!hasRight) {
                    return `
                        <tr>
                            <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k1))}</td>
                            <td class="${ns}-info-cell">${this.escapeHtml(String(v1 ?? ''))}</td>
                            <td class="${ns}-info-cell ${ns}-cell-blank" colspan="2"></td>
                        </tr>
                    `;
                }
                return `
                    <tr>
                        <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k1))}</td>
                        <td class="${ns}-info-cell">${this.escapeHtml(String(v1 ?? ''))}</td>
                        <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k2))}</td>
                        <td class="${ns}-info-cell">${this.escapeHtml(String(v2 ?? ''))}</td>
                    </tr>
                `;
            }).join('');

            return `
                <div class="${ns}-table-container ${ns}-beam-opt-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${htmlRows}
                        </tbody>
                    </table>
                </div>
            `;
        }).join('');

        const planTableRows = () => {
            // 按截图固定顺序与字段
            const rows = [
                ['计划名称', data.plan['计划名称'], '计划UID', data.plan['计划UID']],
                ['治疗体位', data.plan['治疗体位'], 'RBE因子', data.plan['RBE因子']],
                ['计划最大剂量[cGy]', data.plan['计划最大剂量[cGy]'], '最大剂量点位置[cm]', data.plan['最大剂量点位置[cm]']],
                ['计划图像', data.plan['计划图像'], '计划者', data.plan['计划者']],
                ['计划描述', data.plan['计划描述'], '剂量计算算法', data.plan['剂量计算算法']]
            ];
            return rows.map(([k1, v1, k2, v2]) => `
                <tr>
                    <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k1))}</td>
                    <td class="${ns}-info-cell">${this.escapeHtml(String(v1 ?? ''))}</td>
                    <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k2))}</td>
                    <td class="${ns}-info-cell ${k2 === '计划UID' ? `${ns}-wrap-anywhere` : ''}">${this.escapeHtml(String(v2 ?? ''))}</td>
                </tr>
            `).join('');
        };

        const setupTableRows = () => {
            // 按截图：两行，右侧跨列
            const rows = [
                ['标记定位点[cm]', data.setup['标记定位点[cm]'] ?? ''],
                ['Beam 1、Beam 2、Beam 3 等中心点[cm]', data.setup['Beam 1、Beam 2、Beam 3 等中心点[cm]'] ?? '']
            ];
            return rows.map(([k, v]) => `
                <tr>
                    <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k))}</td>
                    <td class="${ns}-info-cell" colspan="3">${this.escapeHtml(String(v ?? ''))}</td>
                </tr>
            `).join('');
        };

        const couchShiftTableRows = () => {
            // 按截图：两行，右侧跨列
            const rows = [
                ['观察方向', data.couchShift?.['观察方向'] ?? ''],
                ['Beam 1、Beam 2、Beam 3[cm]', data.couchShift?.['Beam 1、Beam 2、Beam 3[cm]'] ?? '']
            ];
            return rows.map(([k, v]) => `
                <tr>
                    <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k))}</td>
                    <td class="${ns}-info-cell" colspan="3">${this.escapeHtml(String(v ?? ''))}</td>
                </tr>
            `).join('');
        };

        return `
            <div class="${ns}-page">
                <div class="${ns}-top-left-logo">
                    <div class="${ns}-logo-text">${this.escapeHtml(data.header.brand)}</div>
                </div>

                <div class="${ns}-header">
                    <div class="${ns}-title">${this.escapeHtml(data.header.title)}</div>
                    <div class="${ns}-subtitle">${this.escapeHtml(data.header.subtitle)}</div>
                </div>

                <div class="${ns}-header-patient">
                    <table class="${ns}-header-table" aria-label="患者与计划页眉信息">
                        <tbody>
                            ${headerPatientRows}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title ${ns}-section-title-first">${this.escapeHtml('图像集信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-image-table">
                        <tbody>
                            <tr>
                                <td class="${ns}-info-cell ${ns}-cell-label">ID</td>
                                <td class="${ns}-info-cell ${ns}-image-id">${this.escapeHtml(data.imageSet.id)}</td>
                                <td class="${ns}-info-cell ${ns}-cell-label">层数</td>
                                <td class="${ns}-info-cell">${this.escapeHtml(String(data.imageSet.sliceCount))}</td>
                            </tr>
                            <tr>
                                <td class="${ns}-info-cell ${ns}-cell-label">厚度(pixel size)</td>
                                <td class="${ns}-info-cell">${this.escapeHtml(data.imageSet.thickness)}</td>
                                <td class="${ns}-info-cell ${ns}-cell-label">扫描体位</td>
                                <td class="${ns}-info-cell">${this.escapeHtml(data.imageSet.position)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('勾画结构信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table">
                        <thead>
                            <tr>
                                <th>ROI</th>
                                <th class="${ns}-center">类型</th>
                                <th class="${ns}-right">体积(cm³)</th>
                                <th class="${ns}-center">指定质量密度</th>
                                <th class="${ns}-center">是否缺层</th>
                                <th class="${ns}-center">是否与PTV重叠</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${roiRows}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('计划信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${planTableRows()}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('处方信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${kvTable(data.prescription)}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('网格信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${kvTable(data.grid)}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('患者设置')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${setupTableRows()}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('移床信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${couchShiftTableRows()}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('射束信息')}</div>
                <div class="${ns}-beam-weight-note">射束权重=单个射束Weight/总射束Weight*1000</div>
                ${beamDetailTables}

                <div class="${ns}-section-title">${this.escapeHtml('射束&剂量信息')}</div>
                <div class="${ns}-beam-dose-images">
                    <img class="${ns}-beam-dose-img" src="${this.escapeAttr(`${imgBase}/质子-Axial.png`)}" alt="射束&剂量信息 - Axial">
                    <img class="${ns}-beam-dose-img" src="${this.escapeAttr(`${imgBase}/质子-Sagittal.png`)}" alt="射束&剂量信息 - Sagittal">
                    <img class="${ns}-beam-dose-img" src="${this.escapeAttr(`${imgBase}/质子-Coronal.png`)}" alt="射束&剂量信息 - Coronal">
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('BEV信息')}</div>
                ${bevInfoTable}
                <div class="${ns}-bev-image-wrap">
                    <img class="${ns}-bev-img" src="${this.escapeAttr(`${imgBase}/质子-BEV.png`)}" alt="BEV信息">
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('3D视图')}</div>
                <div class="${ns}-view3d-wrap">
                    <img class="${ns}-view3d-img" src="${this.escapeAttr(`${imgBase}/质子-3D.png`)}" alt="3D视图">
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('DVH信息')}</div>
                <div class="${ns}-dvh-wrap">
                    <img class="${ns}-dvh-img" src="${this.escapeAttr(`${imgBase}/质子-DVH.png`)}" alt="DVH信息">
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('剂量统计—ROI统计')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-dose-stats-table">
                        <thead>
                            <tr>
                                <th class="${ns}-diagonal-header" style="width:34px;"></th>
                                <th>ROI</th>
                                <th class="${ns}-center">类型</th>
                                <th class="${ns}-right">体积[cm³]</th>
                                <th class="${ns}-right">最大剂量[cGy](RBE)</th>
                                <th class="${ns}-right">最小剂量[cGy](RBE)</th>
                                <th class="${ns}-right">平均剂量[cGy](RBE)</th>
                                <th class="${ns}-right">D99[cGy]</th>
                                <th class="${ns}-right">D98[cGy]</th>
                                <th class="${ns}-right">D95[cGy]</th>
                                <th class="${ns}-right">D50[cGy]</th>
                                <th class="${ns}-right">D2[cGy]</th>
                                <th class="${ns}-right">D1[cGy]</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${roiDoseStatsRows}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('剂量统计—POI统计')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-poi-stats-table">
                        <thead>
                            <tr>
                                <th class="${ns}-diagonal-header" style="width:34px;"></th>
                                <th>POI</th>
                                <th class="${ns}-right">X[cm]</th>
                                <th class="${ns}-right">Y[cm]</th>
                                <th class="${ns}-right">Z[cm]</th>
                                <th class="${ns}-right">剂量[cGy]</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${poiDoseStatsRows}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('SFRT几何参数')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${sfrtGeometryRows}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('临床目标')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-clinical-target-table">
                        <thead>
                            <tr>
                                <th class="${ns}-diagonal-header" style="width:34px;"></th>
                                <th>ROI</th>
                                <th class="${ns}-center">类型</th>
                                <th>临床目标</th>
                                <th>预测值</th>
                                <th>实际值(RBE)</th>
                                <th class="${ns}-center">达到</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clinicalTargetRows}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('射束优化设置信息')}</div>
                ${beamOptimizationTables}

                <div class="${ns}-section-title">${this.escapeHtml('能量层')}</div>
                ${energyLayerBlocks}

                <div class="${ns}-section-title">${this.escapeHtml('错误和警告信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-warnings-table">
                        <thead>
                            <tr>
                                <th style="width: 30%;">时间</th>
                                <th>错误和警告信息</th>
                                <th style="width: 20%;">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(data.warnings.items || []).map(it => `
                                <tr>
                                    <td>${this.escapeHtml(String(it.time ?? ''))}</td>
                                    <td>${this.escapeHtml(String(it.message ?? ''))}</td>
                                    <td>${this.escapeHtml(String(it.action ?? ''))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-approval-block">
                    <div class="${ns}-approval-line">
                        <div class="${ns}-approval-label">计划状态：</div>
                        <div class="${ns}-approval-value">${this.escapeHtml(String(data.warnings.status ?? ''))}</div>
                    </div>
                    <div class="${ns}-approval-line">
                        <div class="${ns}-approval-label">审批人签字：</div>
                        <div class="${ns}-approval-value">${this.escapeHtml(String(data.warnings.reviewerSign ?? ''))}</div>
                    </div>
                    <div class="${ns}-approval-line">
                        <div class="${ns}-approval-label">审批日期：</div>
                        <div class="${ns}-approval-value">${this.escapeHtml(String(data.warnings.approveDate ?? ''))}</div>
                    </div>
                </div>

                <div class="${ns}-footer">
                    <div class="${ns}-footer-left">${this.escapeHtml(this.getFooterLeftText(data))}</div>
                    <div class="${ns}-footer-center">${this.escapeHtml(String(data.footer?.pageText ?? ''))}</div>
                    <div class="${ns}-footer-right"></div>
                </div>
            </div>
        `;
    }

    getFooterLeftText(data) {
        const brand = data?.header?.brand ?? 'MOZI-PROTON';
        const planSystem = String(data?.patient?.['计划系统'] ?? '');
        const timezone = String(data?.patient?.['时区'] ?? '');
        // planSystem 示例："MOZI-PROTON 1.0.1.1"
        const parts = planSystem.split(/\s+/).filter(Boolean);
        const version = parts.length >= 2 ? parts[parts.length - 1] : '';
        const versionText = version ? `${brand} (${version})` : brand;
        const tzText = timezone ? ` 时区：${timezone}` : '';
        return `${versionText}${tzText}`.trim();
    }

    escapeHtml(str) {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    escapeAttr(str) {
        return this.escapeHtml(str).replaceAll('\n', ' ');
    }

    getStyles(ns) {
        // 避免污染全局：所有选择器都带 namespace 前缀
        return `
            .${ns}-shell{
                padding: 12px;
                background: #0a0a0a;
                min-height: 100%;
            }

            .${ns}-page{
                width: 210mm;
                max-width: 210mm;
                margin: 0 auto;
                background: #fff;
                color:#111827;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0,0,0,0.25);
                position: relative;
                font-family: "Microsoft YaHei", Arial, sans-serif;
            }

            .${ns}-top-left-logo{
                position:absolute;
                top:10px;
                left:10px;
            }
            .${ns}-logo-text{
                font-size:14px;
                font-weight:700;
                color:#111827;
                letter-spacing:0.4px;
            }

            .${ns}-header{
                text-align:center;
                margin: 0 0 10px 0;
            }
            .${ns}-title{
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 5px;
            }
            .${ns}-subtitle{
                font-size: 13px;
                color:#374151;
            }

            /* 页眉患者信息（参考截图） */
            .${ns}-header-patient{
                margin: 0 0 10px 0;
                display:flex;
                justify-content:center;
            }
            .${ns}-header-table{
                width: 100%;
                border-collapse: separate;
                border-spacing: 0 6px; /* 行间距 */
                font-size: 12px;
                table-layout: auto;
            }
            .${ns}-header-table td{
                border: none;
                padding: 0;
                vertical-align: middle;
                color:#111827;
                white-space: nowrap;
                overflow: visible;
                text-overflow: clip;
            }
            .${ns}-header-label{
                width: 96px;
                text-align: right;
                padding-right: 18px; /* 标签和值之间留出明显空隙 */
                font-weight: 600;
                color:#111827;
            }
            .${ns}-header-label::after{
                content: "\\00a0"; /* 强制一个不换行空格 */
            }
            .${ns}-header-value{
                text-align: left;
                padding-right: 22px; /* 拉开左右两列间距 */
                font-weight: 400;
                color:#111827;
            }
            .${ns}-header-value-long{
                font-size: 11px;       /* 长字符串（时间等）缩小字号，保证单行展示 */
                letter-spacing: -0.2px;/* 微收紧，避免被挤出 */
            }

            .${ns}-section-title{
                font-weight:700;
                font-size:14px;
                margin: 18px 0 10px 0;
                border-top: none;       /* 默认不显示分割线 */
                padding-top: 0;
            }
            .${ns}-section-title-first{
                border-top: 1px solid #9ca3af; /* 仅第一段保留分割线 */
                padding-top: 12px;
            }

            .${ns}-table-container{
                border: 1px solid #e5e7eb;
                margin-bottom: 14px;
            }
            .${ns}-table{
                width:100%;
                border-collapse: collapse;
                font-size: 12px;
            }
            .${ns}-table th,
            .${ns}-table td{
                border: 1px solid #e5e7eb;
                padding: 8px;
                text-align:left;
                vertical-align: top;
            }
            .${ns}-table th{
                background:#e9ecef;
                font-weight:700;
            }
            .${ns}-center{text-align:center;}
            .${ns}-right{text-align:right;}

            .${ns}-plan-table .${ns}-info-cell{width:25%;}
            .${ns}-info-cell{padding:8px;}
            .${ns}-cell-label{background:#e9ecef; font-weight:700;}
            .${ns}-cell-blank{background:#fff;}
            .${ns}-image-id{
                word-break: break-all;  /* 让长 ID 自动换行（匹配截图） */
                line-height: 1.25;
            }
            .${ns}-wrap-anywhere{
                word-break: break-all; /* 计划UID等长串自动换行 */
                line-height: 1.25;
            }
            /* 图像集信息：四列等宽 */
            .${ns}-image-table{
                table-layout: fixed;
            }
            .${ns}-image-table td{
                width: 25%;
            }

            .${ns}-note{
                padding: 8px 10px;
                font-size: 11px;
                color:#374151;
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
            }

            .${ns}-beam-weight-note{
                font-size: 12px;
                color:#111827;
                margin: 6px 0 8px 0;
            }
            .${ns}-beam-table-container{
                margin-bottom: 12px;
            }

            .${ns}-beam-dose-images{
                display:flex;
                flex-direction: column;
                gap: 12px;
                margin: 8px 0 14px 0;
            }
            .${ns}-beam-dose-img{
                width: 100%;
                height: auto;
                display:block;
                object-fit: contain;
                border: 0;
            }

            .${ns}-bev-image-wrap{
                margin: 8px 0 14px 0;
            }
            .${ns}-bev-img{
                width: 100%;
                height: auto;
                display:block;
                object-fit: contain;
                border: 0;
            }

            .${ns}-view3d-wrap{
                margin: 8px 0 14px 0;
            }
            .${ns}-view3d-img{
                width: 100%;
                height: auto;
                display:block;
                object-fit: contain;
                border: 0;
            }

            .${ns}-dvh-wrap{
                margin: 8px 0 14px 0;
            }
            .${ns}-dvh-img{
                width: 100%;
                height: auto;
                display:block;
                object-fit: contain;
                border: 0;
            }

            /* 剂量统计—ROI统计 */
            .${ns}-dose-stats-table{
                font-size: 11px;
                table-layout: fixed;
            }
            .${ns}-dose-stats-table th,
            .${ns}-dose-stats-table td{
                padding: 6px 6px;
            }
            .${ns}-poi-stats-table{
                font-size: 11px;
                table-layout: fixed;
            }
            .${ns}-poi-stats-table th,
            .${ns}-poi-stats-table td{
                padding: 6px 6px;
            }
            .${ns}-clinical-target-table{
                font-size: 11px;
                table-layout: fixed;
            }
            .${ns}-clinical-target-table th,
            .${ns}-clinical-target-table td{
                padding: 6px 6px;
            }
            .${ns}-beam-opt-table-container{
                margin-bottom: 12px;
            }
            .${ns}-roi-color{
                width: 14px;
                height: 14px;
                display:inline-block;
                border: 1px solid rgba(0,0,0,0.25);
                vertical-align: middle;
            }
            .${ns}-roi-name{
                word-break: break-word;
                white-space: normal;
                line-height: 1.15;
            }
            .${ns}-diagonal-header{
                position: relative;
                background:
                    linear-gradient(to bottom right, transparent 49%, #c9c9c9 49%, #c9c9c9 51%, transparent 51%),
                    #e9ecef;
            }

            /* 能量层：按射束分块（参考截图） */
            .${ns}-energy-block{
                margin: 0 0 14px 0;
            }
            .${ns}-energy-block-header{
                background:#e9ecef;
                border:1px solid #e5e7eb;
                border-bottom:none;
                padding: 8px 8px;
                font-size: 12px;
                font-weight: 700;
                color:#111827;
            }
            .${ns}-energy-table{
                font-size: 11px;
                table-layout: fixed;
            }
            .${ns}-energy-table th,
            .${ns}-energy-table td{
                padding: 6px 6px;
            }

            .${ns}-warnings-table{
                font-size: 12px;
                table-layout: fixed;
            }

            /* 审批信息（无标题，按截图下划线样式） */
            .${ns}-approval-block{
                margin-top: 18px;
                display: grid;
                gap: 14px;
                font-size: 12px; /* 与表格字号一致 */
                line-height: 1.25;
                color: #111827;
            }
            .${ns}-approval-line{
                display: grid;
                grid-template-columns: 120px 1fr;
                align-items: end;
                column-gap: 18px;
            }
            .${ns}-approval-label{
                text-align: left;
                font-weight: 400;
            }
            .${ns}-approval-value{
                border-bottom: 1px solid #111827;
                padding: 0 0 2px 8px;
                min-height: 18px;
                font-weight: 400;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .${ns}-footer{
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:12px;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #bdbdbd;
                font-size: 12px;
                color:#111827;
            }
            .${ns}-footer-left{flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
            .${ns}-footer-center{flex:0 0 auto; white-space:nowrap;}
            .${ns}-footer-right{flex:1; white-space:nowrap;}

            @media print {
                body{ background:#fff !important; }
                .no-print{ display:none !important; }
                .${ns}-shell{ padding:0 !important; background:#fff !important; }
                .${ns}-page{
                    width:100% !important;
                    max-width:none !important;
                    box-shadow:none !important;
                    margin:0 !important;
                    padding: 15px !important;
                }
            }
        `;
    }
}

// 挂到全局，供组件库动态加载后实例化
window.ProtonExportReportComponent = ProtonExportReportComponent;

