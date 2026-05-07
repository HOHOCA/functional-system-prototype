/**
 * 后装-导出报告-普通计划（组件库演示版）
 * - 基于：ProtonExportReportComponent（A4 容器、标题/副标题、两列信息栅格、分段表格、打印样式）
 * - 说明：当前为组件库展示用的静态示例数据；后续接入真实后装计划数据时可复用同一排版结构
 */
class BrachyExportReportNormalPlanComponent {
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

        const namespace = 'brachy-export-report-normal-plan';
        this.styleEl = document.createElement('style');
        this.styleEl.textContent = this.getStyles(namespace);
        document.head.appendChild(this.styleEl);

        this.rootEl = document.createElement('div');
        this.rootEl.className = `${namespace}-shell`;
        this.rootEl.innerHTML = this.getHtml(namespace, this.getSampleData());

        container.appendChild(this.rootEl);
    }

    getImageBasePath() {
        // 组件会在不同页面被复用：组件库(`component-gallery/`) 与后装模块页(`brachy-client/modules/`) 的相对路径不同
        // 允许调用方传入 imageBasePath 进行覆盖
        const p = (this.options && this.options.imageBasePath) ? String(this.options.imageBasePath) : '../image';
        return p.endsWith('/') ? p.slice(0, -1) : p;
    }

    getSampleData() {
        // 示例数据：沿用报告字段结构，用于后装普通计划导出报告预览（组件库展示）
        return {
            header: {
                title: '计划报告',
                subtitle: '此计划未经审核不能用于临床',
                brand: 'MOZI-BRACHY'
            },
            patient: {
                // 组件库静态示例值：对齐产品截图中的字段与格式
                '患者姓名': '三管患者示例',
                '病例号': '24103002',
                '性别': 'F',
                '出生日期': '19700101',
                '计划系统': 'MOZI-BRACHY 1.0.0.0',
                '工作站': 'PC-202403131255 192.168.10.158',
                '治疗机': 'XHDR30',
                '计划保存时间': '2025-05-21 10:44:10 (YYYY-MM-DD HH:MM:SS)',
                '报告生成时间': '2025-05-21 11:53:27 (YYYY-MM-DD HH:MM:SS)',
                '治疗机保存时间': '2025-05-16 17:45:51 (YYYY-MM-DD HH:MM:SS)',
                '时区': '北京(UTC+8)'
            },
            radiationSource: {
                sourceInfoRows: [
                    ['放射源', 'XHS-Ir192-1', '空气比释动能率常数[cGycm^-2/mCi]', '4.07']
                ],
                calibrationInfoRows: [
                    ['校准日期', '2025-04-16 10:44:06', '空气比释动能强度', '43.789944'],
                    ['表观源活度[Ci]', '10.7592', '', '']
                ],
                treatmentInfoRows: [
                    ['治疗日期', '2025-05-21 11:53:27', '空气比释动能强度[mGym^2/h]', '31.511649'],
                    ['表观源活度[Ci]', '7.742420', '校准日和治疗日间隔[天]', '35.05'],
                    ['衰减因子', '0.7196', '', '']
                ]
            },
            imageSet: {
                id: '1.2.752.243.1.1.20250115140429435.2160.11482',
                sliceCount: 215,
                thickness: '2.00',
                position: 'Head First-Supine'
            },
            plan: {
                '计划名称': 'test0521',
                '治疗体位': 'HFS',
                '计划最大剂量[cGy]': '75655.56',
                '最大剂量点位置[cm]': 'X=0.42 Y=-56.15 Z=18.32',
                '计划图像': 'CT 3',
                '计划者': 'manteia',
                '计划描述': ''
            },
            prescription: {
                '目标靶区': 'HRCTV',
                '总剂量[cGy]': '600.00',
                '分次数': '1',
                '分次剂量[cGy]': '600.00',
                '计划归一': '取消归一'
            },
            applicators: [
                { index: 1, name: 'NONE', channel: 1, dwellStepMm: '2.5', sourceLengthMm: '850.0', offsetMm: '12.00' },
                { index: 2, name: 'NONE', channel: 2, dwellStepMm: '2.5', sourceLengthMm: '850.0', offsetMm: '12.00' },
                { index: 3, name: 'NONE', channel: 3, dwellStepMm: '2.5', sourceLengthMm: '850.0', offsetMm: '12.00' }
            ],
            dwellPosition: {
                // 渲染为多张表（截图样式）：表头相同，每张表只显示一行
                tables: (() => {
                    const headers = [
                        '序号（通道）',
                        '名称',
                        '出源长度[mm]',
                        ...Array.from({ length: 21 }, (_, i) => String(i + 1))
                    ];
                    const headersCh2 = [
                        '序号（通道）',
                        '名称',
                        '出源长度[mm]',
                        ...Array.from({ length: 16 }, (_, i) => String(i + 1))
                    ];
                    const headersCh3 = [
                        '序号（通道）',
                        '名称',
                        '出源长度[mm]',
                        ...Array.from({ length: 35 }, (_, i) => String(i + 1))
                    ];
                    const mkRow = (idText, name, len, patternMod) => ([
                        idText,
                        name,
                        len,
                        ...Array.from({ length: 20 }, (_, i) => (i % patternMod === 0 ? 'A' : '')),
                        'A'
                    ]);
                    const mkRowWithCount = (idText, name, len, count, patternMod) => ([
                        idText,
                        name,
                        len,
                        ...Array.from({ length: Math.max(0, count - 1) }, (_, i) => (i % patternMod === 0 ? 'A' : '')),
                        'A'
                    ]);
                    return [
                        { headers, row: mkRow('1(1)', 'NONE', '1200.0', 4) },
                        {
                            // 仅通道2裁剪右侧多余列（17~21）
                            headers: headersCh2,
                            row: (() => {
                                const full = mkRow('2(2)', 'NONE', '1300.0', 3);
                                const sliced = full.slice(0, 3 + 16);
                                // 保证最后一列一定为 A
                                sliced[sliced.length - 1] = 'A';
                                return sliced;
                            })()
                        },
                        {
                            headers: headersCh3,
                            row: mkRowWithCount('3(3)', 'NONE', '1200.0', 35, 5),
                            autoWrap: true
                        }
                    ];
                })()
            },
            dwell: {
                totalTreatmentTimeS: '10777.8',
                applicators: [
                    {
                        line: '施源器1，NONE，通道1',
                        totalDwellCount: '17',
                        totalTimeS: '9461.7',
                        points: [
                            { posMm: '850.0', xCm: '0.51', yCm: '-54.82', zCm: '17.87', timeS: '999.9' },
                            { posMm: '847.5', xCm: '0.48', yCm: '-55.07', zCm: '17.90', timeS: '999.9' },
                            { posMm: '845.0', xCm: '0.45', yCm: '-55.31', zCm: '17.93', timeS: '999.9' },
                            { posMm: '842.5', xCm: '0.42', yCm: '-55.56', zCm: '17.97', timeS: '999.9' },
                            { posMm: '840.0', xCm: '0.39', yCm: '-55.80', zCm: '18.00', timeS: '999.9' },
                            { posMm: '837.5', xCm: '0.37', yCm: '-56.05', zCm: '18.03', timeS: '506.5' },
                            { posMm: '835.0', xCm: '0.34', yCm: '-56.30', zCm: '18.07', timeS: '0.0' },
                            { posMm: '832.5', xCm: '0.31', yCm: '-56.54', zCm: '18.10', timeS: '0.0' },
                            { posMm: '830.0', xCm: '0.28', yCm: '-56.79', zCm: '18.13', timeS: '0.0' },
                            { posMm: '827.5', xCm: '0.25', yCm: '-57.04', zCm: '18.17', timeS: '0.0' },
                            { posMm: '825.0', xCm: '0.22', yCm: '-57.28', zCm: '18.20', timeS: '0.0' },
                            { posMm: '822.5', xCm: '0.20', yCm: '-57.53', zCm: '18.24', timeS: '0.0' },
                            { posMm: '820.0', xCm: '0.17', yCm: '-57.77', zCm: '18.27', timeS: '0.0' },
                            { posMm: '817.5', xCm: '0.14', yCm: '-58.02', zCm: '18.30', timeS: '0.0' },
                            { posMm: '815.0', xCm: '0.11', yCm: '-58.27', zCm: '18.34', timeS: '122.8' },
                            { posMm: '812.5', xCm: '0.08', yCm: '-58.51', zCm: '18.37', timeS: '981.6' },
                            { posMm: '810.0', xCm: '0.05', yCm: '-58.76', zCm: '18.40', timeS: '999.9' },
                            { posMm: '807.5', xCm: '0.03', yCm: '-59.00', zCm: '18.44', timeS: '654.7' },
                            { posMm: '805.0', xCm: '-0.00', yCm: '-59.25', zCm: '18.47', timeS: '78.0' },
                            { posMm: '802.5', xCm: '-0.03', yCm: '-59.50', zCm: '18.50', timeS: '0.1' },
                            { posMm: '800.0', xCm: '-0.06', yCm: '-59.74', zCm: '18.54', timeS: '0.0' },
                            { posMm: '797.5', xCm: '-0.08', yCm: '-59.99', zCm: '18.57', timeS: '0.0' },
                            { posMm: '795.0', xCm: '-0.11', yCm: '-60.24', zCm: '18.60', timeS: '0.0' },
                            { posMm: '792.5', xCm: '-0.13', yCm: '-60.48', zCm: '18.64', timeS: '0.0' },
                            { posMm: '790.0', xCm: '-0.15', yCm: '-60.73', zCm: '18.67', timeS: '0.1' },
                            { posMm: '787.5', xCm: '-0.17', yCm: '-60.98', zCm: '18.70', timeS: '250.1' },
                            { posMm: '785.0', xCm: '-0.18', yCm: '-61.22', zCm: '18.73', timeS: '254.3' },
                            { posMm: '782.5', xCm: '-0.20', yCm: '-61.47', zCm: '18.76', timeS: '337.6' },
                            { posMm: '780.0', xCm: '-0.21', yCm: '-61.72', zCm: '18.79', timeS: '276.5' }
                        ]
                    },
                    {
                        line: '施源器2，NONE，通道2',
                        totalDwellCount: '18',
                        totalTimeS: '1920.0',
                        points: [
                            { posMm: '850.0', xCm: '0.46', yCm: '-55.02', zCm: '17.75', timeS: '0.0' },
                            { posMm: '847.5', xCm: '0.43', yCm: '-55.27', zCm: '17.78', timeS: '120.0' },
                            { posMm: '845.0', xCm: '0.41', yCm: '-55.51', zCm: '17.82', timeS: '240.0' },
                            { posMm: '842.5', xCm: '0.38', yCm: '-55.76', zCm: '17.86', timeS: '300.0' },
                            { posMm: '840.0', xCm: '0.35', yCm: '-56.00', zCm: '17.89', timeS: '180.0' },
                            { posMm: '837.5', xCm: '0.32', yCm: '-56.24', zCm: '17.93', timeS: '0.0' },
                            { posMm: '835.0', xCm: '0.30', yCm: '-56.49', zCm: '17.96', timeS: '0.0' },
                            { posMm: '832.5', xCm: '0.27', yCm: '-56.73', zCm: '18.00', timeS: '0.0' },
                            { posMm: '830.0', xCm: '0.24', yCm: '-56.98', zCm: '18.04', timeS: '0.0' },
                            { posMm: '827.5', xCm: '0.21', yCm: '-57.22', zCm: '18.07', timeS: '60.0' },
                            { posMm: '825.0', xCm: '0.19', yCm: '-57.46', zCm: '18.11', timeS: '80.0' },
                            { posMm: '822.5', xCm: '0.16', yCm: '-57.71', zCm: '18.14', timeS: '90.0' },
                            { posMm: '820.0', xCm: '0.13', yCm: '-57.95', zCm: '18.18', timeS: '110.0' },
                            { posMm: '817.5', xCm: '0.11', yCm: '-58.20', zCm: '18.22', timeS: '140.0' },
                            { posMm: '815.0', xCm: '0.08', yCm: '-58.44', zCm: '18.25', timeS: '160.0' },
                            { posMm: '812.5', xCm: '0.05', yCm: '-58.69', zCm: '18.29', timeS: '220.0' },
                            { posMm: '810.0', xCm: '0.02', yCm: '-58.93', zCm: '18.33', timeS: '0.0' },
                            { posMm: '807.5', xCm: '-0.01', yCm: '-59.17', zCm: '18.36', timeS: '0.0' }
                        ]
                    },
                    {
                        line: '施源器3，NONE，通道3',
                        totalDwellCount: '16',
                        totalTimeS: '1316.1',
                        points: [
                            { posMm: '850.0', xCm: '0.41', yCm: '-55.12', zCm: '17.65', timeS: '0.0' },
                            { posMm: '847.5', xCm: '0.38', yCm: '-55.36', zCm: '17.69', timeS: '0.0' },
                            { posMm: '845.0', xCm: '0.35', yCm: '-55.61', zCm: '17.72', timeS: '120.0' },
                            { posMm: '842.5', xCm: '0.32', yCm: '-55.85', zCm: '17.76', timeS: '240.0' },
                            { posMm: '840.0', xCm: '0.29', yCm: '-56.10', zCm: '17.79', timeS: '300.0' },
                            { posMm: '837.5', xCm: '0.26', yCm: '-56.34', zCm: '17.83', timeS: '180.0' },
                            { posMm: '835.0', xCm: '0.24', yCm: '-56.58', zCm: '17.87', timeS: '0.0' },
                            { posMm: '832.5', xCm: '0.21', yCm: '-56.83', zCm: '17.90', timeS: '0.0' },
                            { posMm: '830.0', xCm: '0.18', yCm: '-57.07', zCm: '17.94', timeS: '0.0' },
                            { posMm: '827.5', xCm: '0.15', yCm: '-57.31', zCm: '17.98', timeS: '0.0' },
                            { posMm: '825.0', xCm: '0.12', yCm: '-57.56', zCm: '18.01', timeS: '60.0' },
                            { posMm: '822.5', xCm: '0.10', yCm: '-57.80', zCm: '18.05', timeS: '80.0' },
                            { posMm: '820.0', xCm: '0.07', yCm: '-58.05', zCm: '18.09', timeS: '90.0' },
                            { posMm: '817.5', xCm: '0.04', yCm: '-58.29', zCm: '18.12', timeS: '110.0' },
                            { posMm: '815.0', xCm: '0.01', yCm: '-58.54', zCm: '18.16', timeS: '136.1' },
                            { posMm: '812.5', xCm: '-0.02', yCm: '-58.78', zCm: '18.20', timeS: '0.0' }
                        ]
                    }
                ]
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
                    machine: 'ProBeam',
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
                {
                    color: '#ff00ff',
                    roi: 'HRCTV',
                    type: 'PTV',
                    volume: '63.96',
                    dmin: '373.74',
                    dmax: '6000.00',
                    dmean: '1346.73',
                    d100: '373.74',
                    d90: '681.57',
                    v100: '95.85',
                    v90: '98.54',
                    d0_1cc: '5999.74',
                    d1cc: '5699.31',
                    d2cc: '4879.35'
                },
                {
                    color: '#0ea5a4',
                    roi: 'Bladder',
                    type: 'ORGAN',
                    volume: '166.00',
                    dmin: '65.73',
                    dmax: '871.46',
                    dmean: '203.25',
                    d100: '65.73',
                    d90: '100.47',
                    v100: '1.12',
                    v90: '2.17',
                    d0_1cc: '804.63',
                    d1cc: '655.63',
                    d2cc: '593.95'
                },
                {
                    color: '#ff0000',
                    roi: 'Bladder Ring',
                    type: 'ORGAN',
                    volume: '52.03',
                    dmin: '65.73',
                    dmax: '871.46',
                    dmean: '210.21',
                    d100: '65.73',
                    d90: '88.48',
                    v100: '3.58',
                    v90: '6.54',
                    d0_1cc: '804.64',
                    d1cc: '655.67',
                    d2cc: '593.84'
                },
                {
                    color: '#ff0000',
                    roi: 'Bladder Ring0',
                    type: 'ORGAN',
                    volume: '52.03',
                    dmin: '65.73',
                    dmax: '871.46',
                    dmean: '210.21',
                    d100: '65.73',
                    d90: '88.48',
                    v100: '3.58',
                    v90: '6.54',
                    d0_1cc: '804.64',
                    d1cc: '655.67',
                    d2cc: '593.84'
                },
                {
                    color: '#008000',
                    roi: 'Rectum',
                    type: 'ORGAN',
                    volume: '30.76',
                    dmin: '141.00',
                    dmax: '885.01',
                    dmean: '315.69',
                    d100: '141.00',
                    d90: '200.79',
                    v100: '1.61',
                    v90: '3.33',
                    d0_1cc: '737.03',
                    d1cc: '541.86',
                    d2cc: '490.43'
                },
                {
                    color: '#ff0000',
                    roi: 'Rectum Ring',
                    type: 'ORGAN',
                    volume: '21.78',
                    dmin: '141.00',
                    dmax: '885.01',
                    dmean: '318.32',
                    d100: '141.00',
                    d90: '193.62',
                    v100: '2.27',
                    v90: '4.57',
                    d0_1cc: '737.05',
                    d1cc: '539.57',
                    d2cc: '484.68'
                },
                {
                    color: '#ff0000',
                    roi: 'Sagmoid',
                    type: 'ORGAN',
                    volume: '67.43',
                    dmin: '121.90',
                    dmax: '781.80',
                    dmean: '297.34',
                    d100: '121.90',
                    d90: '187.51',
                    v100: '0.95',
                    v90: '2.55',
                    d0_1cc: '676.96',
                    d1cc: '574.63',
                    d2cc: '529.23'
                },
                {
                    color: '#ff0000',
                    roi: 'SagmoidRing',
                    type: 'ORGAN',
                    volume: '55.30',
                    dmin: '121.90',
                    dmax: '781.80',
                    dmean: '297.96',
                    d100: '121.90',
                    d90: '184.14',
                    v100: '1.15',
                    v90: '3.08',
                    d0_1cc: '677.03',
                    d1cc: '574.58',
                    d2cc: '528.52'
                }
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
                { roi: 'Bladder', type: 'ORGAN', goal: 'D2[cm³]≤480.00cGy', actual: 'D2.00[cm³]=593.95cGy', pass: 'NO' },
                { roi: 'HRCTV', type: 'PTV', goal: 'D90.00%≥600.00cGy', actual: 'D90.00%=681.57cGy', pass: 'YES' },
                { roi: 'Rectum', type: 'ORGAN', goal: 'D2[cm³]≤420.00cGy', actual: 'D2.00[cm³]=490.43cGy', pass: 'NO' }
            ],
            beamOptimizationSettings: [
                { index: 1, name: 'Beam 1', rtv: '', spotSpacingCm: '0.8', layerSpacingCm: '0.5', proximalLayerSpots: '1', distalLayerSpots: '1' }
            ],
            energyLayers: [],
            energySummary: [
                { beam: 'Beam 1', layerCount: 15, spotCount: 579, minSpotMu: '2.0001', maxSpotMu: '22.4692' }
            ],
            warnings: {
                status: 'UNAPPROVED',
                reviewerSign: 'None',
                approveDate: 'None',
                auditorSign: '',
                auditDate: '',
                treatmentPassword: '',
                items: [
                    {
                        message: '通道号重复或不连续',
                        impact: '放射源传输路径错误，可能导致卡源、剂量分布偏移或正常组织损伤'
                    },
                    {
                        message: '剂量计算基于YYYY-MM-DD的源活度（距今已X天）',
                        impact: '实际剂量低于计划值'
                    },
                    {
                        message: '当前计划剂量未基于最新的设计方案',
                        impact: '显示剂量与设计方案存在偏差'
                    }
                ]
            },
            footer: {
                pageText: '1 of 1'
            }
        };
    }

    getHtml(ns, data) {
        const imgBase = this.getImageBasePath();
        const headerLeftKeys = [
            '患者姓名',
            '性别',
            '计划系统',
            '治疗机',
            '报告生成时间'
        ];
        const headerRightKeys = [
            '病例号',
            '出生日期',
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

        const formatDurationS = (raw) => {
            const s = Number(raw);
            if (!Number.isFinite(s)) return '';
            const totalS = Math.round(s);
            const min = Math.floor(totalS / 60);
            const sec = totalS % 60;
            return `${totalS}s (${min} min ${sec} s)`;
        };

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

        const rows4ColTable = (rows) => {
            return (rows || []).map(([k1, v1, k2, v2]) => {
                const hasRight = Boolean(k2);
                if (!hasRight) {
                    return `
                        <tr>
                            <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k1 ?? ''))}</td>
                            <td class="${ns}-info-cell">${this.escapeHtml(String(v1 ?? ''))}</td>
                            <td class="${ns}-info-cell ${ns}-cell-blank" colspan="2"></td>
                        </tr>
                    `;
                }
                return `
                    <tr>
                        <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k1 ?? ''))}</td>
                        <td class="${ns}-info-cell">${this.escapeHtml(String(v1 ?? ''))}</td>
                        <td class="${ns}-info-cell ${ns}-cell-label">${this.escapeHtml(String(k2 ?? ''))}</td>
                        <td class="${ns}-info-cell">${this.escapeHtml(String(v2 ?? ''))}</td>
                    </tr>
                `;
            }).join('');
        };

        const roiDoseStatsRows = (data.roiDoseStats || []).map(r => `
            <tr>
                <td class="${ns}-center">
                    <span class="${ns}-roi-color" style="background:${this.escapeAttr(r.color)}"></span>
                </td>
                <td class="${ns}-roi-name">${this.escapeHtml(String(r.roi))}</td>
                <td class="${ns}-center">${this.escapeHtml(String(r.type))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.volume))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.dmin))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.dmax))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.dmean))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d100))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d90))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.v100))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.v90))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d0_1cc))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d1cc))}</td>
                <td class="${ns}-right">${this.escapeHtml(String(r.d2cc))}</td>
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

        const clinicalTargetRows = (data.clinicalTargets || []).map(t => `
            <tr>
                <td>${this.escapeHtml(String(t.roi))}</td>
                <td class="${ns}-center">${this.escapeHtml(String(t.type))}</td>
                <td>${this.escapeHtml(String(t.goal))}</td>
                <td>${this.escapeHtml(String(t.actual ?? ''))}</td>
                <td class="${ns}-center">${this.escapeHtml(String(t.pass ?? ''))}</td>
            </tr>
        `).join('');

        const planTableRows = () => {
            const rows = [
                ['计划名称', data.plan['计划名称'], '治疗体位', data.plan['治疗体位']],
                ['计划最大剂量[cGy]', data.plan['计划最大剂量[cGy]'], '最大剂量点位置[cm]', data.plan['最大剂量点位置[cm]']],
                ['计划图像', data.plan['计划图像'], '计划者', data.plan['计划者']],
                ['计划描述', data.plan['计划描述'], '', '']
            ];
            return rows4ColTable(rows);
        };

        const renderDwellPositionTable = (tbl) => {
            const headers = Array.isArray(tbl?.headers) ? tbl.headers : [];
            const row = Array.isArray(tbl?.row) ? tbl.row : [];
            const baseHeaders = headers.slice(0, 3);
            const baseValues = row.slice(0, 3);
            const indexHeaders = headers.slice(3);
            const indexValues = row.slice(3);

            const baseWidths = [88, 52, 92];
            const indexColWidth = 23;
            const pageContentWidth = 754;
            const availableForIndex = pageContentWidth - baseWidths.reduce((sum, w) => sum + w, 0);
            const autoChunkSize = Math.max(1, Math.floor(availableForIndex / indexColWidth));
            const chunkSize = tbl?.autoWrap ? autoChunkSize : indexHeaders.length;
            const chunks = [];
            for (let i = 0; i < indexHeaders.length; i += chunkSize) {
                chunks.push({
                    headers: indexHeaders.slice(i, i + chunkSize),
                    values: indexValues.slice(i, i + chunkSize)
                });
            }
            const maxIndexCols = Math.max(1, ...chunks.map(chunk => chunk.headers.length));
            const colgroup = [
                `<col style="width:${baseWidths[0]}px">`,
                `<col style="width:${baseWidths[1]}px">`,
                `<col style="width:${baseWidths[2]}px">`,
                ...Array.from({ length: maxIndexCols }, () => `<col style="width:${indexColWidth}px">`)
            ].join('');

            const simpleHeaderRows = `
                <tr>
                    ${headers.map(h => `<th>${this.escapeHtml(String(h))}</th>`).join('')}
                </tr>
            `;
            const simpleBodyRows = `
                <tr>
                    ${row.map(v => `<td>${this.escapeHtml(String(v))}</td>`).join('')}
                </tr>
            `;

            const wrappedRows = (() => {
                const rowspan = Math.max(1, chunks.length * 2 - 1);
                return chunks.map((chunk, idx) => {
                    if (idx === 0) {
                        return `
                            <tr>
                                ${baseHeaders.map(h => `<th>${this.escapeHtml(String(h))}</th>`).join('')}
                                ${chunk.headers.map(h => `<th>${this.escapeHtml(String(h))}</th>`).join('')}
                            </tr>
                            <tr>
                                ${baseValues.map(v => `<td rowspan="${rowspan}">${this.escapeHtml(String(v))}</td>`).join('')}
                                ${chunk.values.map(v => `<td>${this.escapeHtml(String(v))}</td>`).join('')}
                            </tr>
                        `;
                    }
                    return `
                        <tr>
                            ${chunk.headers.map(h => `<th>${this.escapeHtml(String(h))}</th>`).join('')}
                        </tr>
                        <tr>
                            ${chunk.values.map(v => `<td>${this.escapeHtml(String(v))}</td>`).join('')}
                        </tr>
                    `;
                }).join('');
            })();

            return `
                <div class="${ns}-dwell-position-wrap" aria-label="驻留位置表格">
                    <table class="${ns}-table ${ns}-dwell-position-table">
                        <colgroup>${colgroup}</colgroup>
                        ${tbl?.autoWrap ? `
                        <tbody>
                            ${wrappedRows}
                        </tbody>
                        ` : `
                        <thead>
                            ${simpleHeaderRows}
                        </thead>
                        <tbody>
                            ${simpleBodyRows}
                        </tbody>
                        `}
                    </table>
                </div>
            `;
        };

        const setupTableRows = () => {
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

                <div class="${ns}-section-title ${ns}-section-title-first">${this.escapeHtml('放射源信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${rows4ColTable(data.radiationSource?.sourceInfoRows)}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('放射源校准日信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${rows4ColTable(data.radiationSource?.calibrationInfoRows)}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('放射源治疗日信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${rows4ColTable(data.radiationSource?.treatmentInfoRows)}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('图像集信息')}</div>
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
                            ${rows4ColTable([
                                ['目标靶区', data.prescription?.['目标靶区'] ?? '', '总剂量[cGy]', data.prescription?.['总剂量[cGy]'] ?? ''],
                                ['分次数', data.prescription?.['分次数'] ?? '', '分次剂量[cGy]', data.prescription?.['分次剂量[cGy]'] ?? ''],
                                ['计划归一', data.prescription?.['计划归一'] ?? '', '', '']
                            ])}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('施源器信息')}</div>
                ${(data.applicators || []).map(a => `
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-plan-table">
                        <tbody>
                            ${rows4ColTable([
                                ['序号', a.index ?? '', '名称', a.name ?? ''],
                                ['通道', a.channel ?? '', '驻留步长[mm]', a.dwellStepMm ?? ''],
                                ['出源长度[mm]', a.sourceLengthMm ?? '', '偏移[mm]', a.offsetMm ?? '']
                            ])}
                        </tbody>
                    </table>
                </div>
                `).join('')}

                <div class="${ns}-section-title">${this.escapeHtml('驻留位置')}</div>
                ${(Array.isArray(data.dwellPosition?.tables) ? data.dwellPosition.tables : []).map(tbl => renderDwellPositionTable(tbl)).join('')}

                <div class="${ns}-section-title">${this.escapeHtml('驻留点&驻留时间')}</div>
                <div class="${ns}-dwell-summary">
                    <div class="${ns}-dwell-summary-line">
                        <span class="${ns}-dwell-summary-label">总治疗时间：</span>
                        <span class="${ns}-dwell-summary-value">${this.escapeHtml(formatDurationS(data.dwell?.totalTreatmentTimeS))}</span>
                    </div>
                </div>

                ${(Array.isArray(data.dwell?.applicators) ? data.dwell.applicators : []).map(app => {
                    const rawPts = Array.isArray(app.points) ? app.points : [];
                    // 规则：如果最后一个点 time=0，则不显示该点；裁剪末尾连续的 0 时间点
                    const pts = (() => {
                        const out = rawPts.slice();
                        while (out.length > 0) {
                            const last = out[out.length - 1];
                            const t = Number.parseFloat(String(last?.timeS ?? ''));
                            if (Number.isFinite(t) && t > 0) break;
                            out.pop();
                        }
                        return out;
                    })();
                    const half = Math.ceil(pts.length / 2);
                    const left = pts.slice(0, half);
                    const right = pts.slice(half);
                    const rowCount = Math.max(left.length, right.length);
                    const cell = (v, cls = '') => `<td class="${cls}">${this.escapeHtml(String(v ?? ''))}</td>`;
                    const center = `${ns}-center`;
                    const split = `${ns}-dwell-split-right`;
                    let rowsHtml = '';
                    for (let i = 0; i < rowCount; i++) {
                        const l = left[i] || {};
                        const r = right[i] || {};
                        rowsHtml += `
                            <tr>
                                ${cell(l.posMm)}
                                ${cell(l.xCm, center)}
                                ${cell(l.yCm, center)}
                                ${cell(l.zCm, center)}
                                ${cell(l.timeS, `${center} ${split}`)}
                                ${cell(r.posMm)}
                                ${cell(r.xCm, center)}
                                ${cell(r.yCm, center)}
                                ${cell(r.zCm, center)}
                                ${cell(r.timeS, center)}
                            </tr>
                        `;
                    }

                    return `
                        <div class="${ns}-dwell-applicator-title">${this.escapeHtml(String(app.line ?? ''))}</div>
                        <div class="${ns}-table-container">
                            <table class="${ns}-table ${ns}-plan-table ${ns}-dwell-stats-table">
                                <tbody>
                                    ${rows4ColTable([
                                        ['总驻留点数量[个]', app.totalDwellCount ?? '', '总治疗时间', formatDurationS(app.totalTimeS)]
                                    ])}
                                </tbody>
                            </table>
                        </div>
                        <div class="${ns}-table-container">
                            <table class="${ns}-table ${ns}-dwell-points-table">
                                <thead>
                                    <tr>
                                        <th>位置[mm]</th>
                                        <th class="${ns}-center">X[cm]</th>
                                        <th class="${ns}-center">Y[cm]</th>
                                        <th class="${ns}-center">Z[cm]</th>
                                        <th class="${ns}-center ${ns}-dwell-split-right">时间[s]</th>
                                        <th>位置[mm]</th>
                                        <th class="${ns}-center">X[cm]</th>
                                        <th class="${ns}-center">Y[cm]</th>
                                        <th class="${ns}-center">Z[cm]</th>
                                        <th class="${ns}-center">时间[s]</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </div>
                    `;
                }).join('')}

                <div class="${ns}-section-title">${this.escapeHtml('剂量信息')}</div>
                <div class="${ns}-beam-dose-images">
                    <img class="${ns}-beam-dose-img" src="${this.escapeAttr(`${imgBase}/后装-Axial.jpg`)}" alt="剂量信息 - Axial">
                    <img class="${ns}-beam-dose-img" src="${this.escapeAttr(`${imgBase}/后装-sagittal.jpg`)}" alt="剂量信息 - Sagittal">
                    <img class="${ns}-beam-dose-img" src="${this.escapeAttr(`${imgBase}/后装-Coronal.jpg`)}" alt="剂量信息 - Coronal">
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('3D视图')}</div>
                <div class="${ns}-view3d-wrap">
                    <img class="${ns}-view3d-img" src="${this.escapeAttr(`${imgBase}/后装-3D.jpg`)}" alt="3D视图">
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
                                <th class="${ns}-right">最小剂量[cGy]</th>
                                <th class="${ns}-right">最大剂量[cGy]</th>
                                <th class="${ns}-right">平均剂量[cGy](RBE)</th>
                                <th class="${ns}-right">D100[cGy]</th>
                                <th class="${ns}-right">D90[cGy]</th>
                                <th class="${ns}-right">V100[%]</th>
                                <th class="${ns}-right">V90[%]</th>
                                <th class="${ns}-right">D0.1cc<br>[cGy]</th>
                                <th class="${ns}-right">D1cc<br>[cGy]</th>
                                <th class="${ns}-right">D2cc<br>[cGy]</th>
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

                <div class="${ns}-section-title">${this.escapeHtml('临床目标')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-clinical-target-table">
                        <thead>
                            <tr>
                                <th>ROI</th>
                                <th class="${ns}-center">类型</th>
                                <th>临床目标</th>
                                <th>实际值</th>
                                <th class="${ns}-center">达到</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clinicalTargetRows}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-section-title">${this.escapeHtml('错误和警告信息')}</div>
                <div class="${ns}-table-container">
                    <table class="${ns}-table ${ns}-warnings-table">
                        <thead>
                            <tr>
                                <th>错误和警告信息</th>
                                <th>影响范围</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(data.warnings.items || []).map(it => `
                                <tr>
                                    <td>${this.escapeHtml(String(it.message ?? ''))}</td>
                                    <td>${this.escapeHtml(String(it.impact ?? ''))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="${ns}-approval-block">
                    <div class="${ns}-approval-col">
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
                    <div class="${ns}-approval-col">
                        <div class="${ns}-approval-line">
                            <div class="${ns}-approval-label">审核人签字：</div>
                            <div class="${ns}-approval-value">${this.escapeHtml(String(data.warnings.auditorSign ?? ''))}</div>
                        </div>
                        <div class="${ns}-approval-line">
                            <div class="${ns}-approval-label">审核日期：</div>
                            <div class="${ns}-approval-value">${this.escapeHtml(String(data.warnings.auditDate ?? ''))}</div>
                        </div>
                        <div class="${ns}-approval-line">
                            <div class="${ns}-approval-label">治疗密码：</div>
                            <div class="${ns}-approval-value">${this.escapeHtml(String(data.warnings.treatmentPassword ?? ''))}</div>
                        </div>
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
        const brand = data?.header?.brand ?? 'MOZI-BRACHY';
        const planSystem = String(data?.patient?.['计划系统'] ?? '');
        const timezone = String(data?.patient?.['时区'] ?? '');
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

            .${ns}-header-patient{
                margin: 0 0 10px 0;
                display:flex;
                justify-content:center;
            }
            .${ns}-header-table{
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
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
                padding-right: 16px;
                font-weight: 600;
                color:#111827;
            }
            .${ns}-header-label::after{
                content: "\\00a0";
            }
            .${ns}-header-value{
                text-align: left;
                padding-right: 18px;
                font-weight: 400;
                color:#111827;
            }
            .${ns}-header-value-long{
                font-size: 11px;
                letter-spacing: -0.2px;
            }

            .${ns}-section-title{
                font-weight:700;
                font-size:14px;
                margin: 18px 0 10px 0;
                border-top: none;
                padding-top: 0;
            }
            .${ns}-section-title-first{
                border-top: 1px solid #9ca3af;
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
                word-break: break-all;
                line-height: 1.25;
            }
            .${ns}-wrap-anywhere{
                word-break: break-all;
                line-height: 1.25;
            }
            .${ns}-image-table{
                table-layout: fixed;
            }
            .${ns}-image-table td{
                width: 25%;
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

            .${ns}-bev-image-wrap{ margin: 8px 0 14px 0; }
            .${ns}-bev-img{
                width: 100%;
                height: auto;
                display:block;
                object-fit: contain;
                border: 0;
            }

            .${ns}-view3d-wrap{ margin: 8px 0 14px 0; }
            .${ns}-view3d-img{
                width: 100%;
                height: auto;
                display:block;
                object-fit: contain;
                border: 0;
            }

            .${ns}-dvh-wrap{ margin: 8px 0 14px 0; }
            .${ns}-dvh-img{
                width: 100%;
                height: auto;
                display:block;
                object-fit: contain;
                border: 0;
            }

            .${ns}-dwell-placeholder{
                border: 1px dashed #9ca3af;
                background: #f3f4f6;
                color:#111827;
                padding: 16px;
                margin: 8px 0 14px 0;
                min-height: 140px;
                display:flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align:center;
                gap: 6px;
            }
            .${ns}-dwell-placeholder-title{
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 0.2px;
            }
            .${ns}-dwell-placeholder-desc{
                font-size: 12px;
                color:#374151;
            }

            .${ns}-dwell-position-wrap{
                margin: 8px 0 14px 0;
                background: transparent;
            }
            .${ns}-dwell-position-table{
                width: auto;
                border-collapse: collapse;
                font-size: 12px;
                table-layout: fixed;
                display: inline-table;
            }
            .${ns}-dwell-position-table th,
            .${ns}-dwell-position-table td{
                border: 1px solid #e5e7eb;
                padding: 4px 4px;
                text-align: center;
                white-space: normal;
                word-break: break-word;
                overflow-wrap: anywhere;
                line-height: 1.15;
            }
            .${ns}-dwell-position-table th:nth-child(n+4),
            .${ns}-dwell-position-table td:nth-child(n+4){
                width: 23px;
                min-width: 23px;
                max-width: 23px;
                padding-left: 0;
                padding-right: 0;
            }
            .${ns}-dwell-position-table th:nth-child(-n+3),
            .${ns}-dwell-position-table td:nth-child(-n+3){
                white-space: nowrap;
                word-break: normal;
                overflow-wrap: normal;
                padding-left: 4px;
                padding-right: 4px;
            }
            .${ns}-dwell-position-table th:nth-child(-n+3){
                font-size: 11px;
            }
            .${ns}-dwell-position-table th{
                background:#e9ecef;
                font-weight:700;
            }

            .${ns}-dwell-summary{
                margin: 6px 0 10px 0;
                font-size: 12px;
                color:#111827;
                line-height: 1.25;
            }
            .${ns}-dwell-summary-line{
                display:flex;
                align-items: baseline;
                gap: 6px;
            }
            .${ns}-dwell-summary-label{
                font-weight: 700;
            }
            .${ns}-dwell-summary-value{
                font-weight: 700;
            }

            .${ns}-dwell-applicator-title{
                margin: 12px 0 6px 0;
                font-size: 12px;
                font-weight: 700;
                color:#111827;
            }

            .${ns}-dwell-points-table{
                font-size: 11px;
                table-layout: fixed;
            }
            .${ns}-dwell-points-table th,
            .${ns}-dwell-points-table td{
                padding: 6px 6px;
            }
            .${ns}-dwell-split-right{
                border-right: 2px solid #9ca3af !important;
            }

            .${ns}-dose-stats-table{
                font-size: 11px;
                table-layout: fixed;
            }
            .${ns}-dose-stats-table th{
                white-space: normal;
                word-break: break-word;
                overflow-wrap: anywhere;
                line-height: 1.15;
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

            .${ns}-warnings-table{
                font-size: 12px;
                table-layout: fixed;
            }
            .${ns}-warnings-table th,
            .${ns}-warnings-table td{
                vertical-align: top;
            }
            .${ns}-warnings-table td{
                white-space: normal;
                word-break: break-word;
                overflow-wrap: anywhere;
                line-height: 1.25;
            }

            .${ns}-approval-block{
                margin-top: 18px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                column-gap: 36px;
                row-gap: 14px;
                font-size: 12px;
                line-height: 1.25;
                color: #111827;
            }
            .${ns}-approval-col{
                display: grid;
                gap: 10px;
                align-content: start;
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
window.BrachyExportReportNormalPlanComponent = BrachyExportReportNormalPlanComponent;

