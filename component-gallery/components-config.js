// 组件配置 - 按项目分类
const COMPONENTS_CONFIG = {
    // 公共组件
    shared: [
        {
            id: 'cross-section-view-2d',
            name: 'CrossSectionView2D',
            displayName: '2D横截面视图',
            description: '支持多层叠加显示的医学影像组件',
            className: 'CrossSectionView2DComponent',
            filePath: '../shared/scripts/components/CrossSectionView2DComponent.js'
        },
        {
            id: 'coronal-view-2d',
            name: 'CoronalView2D',
            displayName: '2D冠状面视图',
            description: '冠状面医学影像组件',
            className: 'CoronalView2DComponent',
            filePath: '../shared/scripts/components/CoronalView2DComponent.js'
        },
        {
            id: 'sagittal-view-2d',
            name: 'SagittalView2D',
            displayName: '2D矢状面视图',
            description: '矢状面医学影像组件',
            className: 'SagittalView2DComponent',
            filePath: '../shared/scripts/components/SagittalView2DComponent.js'
        },
        {
            id: 'dvh',
            name: 'DVH',
            displayName: 'DVH',
            description: 'DVH曲线显示，支持积分/微分模式',
            className: 'DVHComponent',
            filePath: '../shared/scripts/components/DVHComponent.js'
        },
        {
            id: 'roi',
            name: 'ROI',
            displayName: 'ROI列表',
            description: 'ROI列表组件',
            className: 'ROIComponent',
            layout: 'sidebar', // 标记为侧边栏布局
            filePath: '../shared/scripts/components/ROIComponent.js'
        },
        {
            id: 'poi',
            name: 'POI',
            displayName: 'POI列表',
            description: 'POI管理组件',
            className: 'POIComponent',
            layout: 'sidebar', // 标记为侧边栏布局
            filePath: '../shared/scripts/components/POIComponent.js'
        },
        {
            id: 'robust-list',
            name: 'RobustList',
            displayName: 'ROBUST列表',
            description: '鲁棒性组列表，支持搜索与组操作',
            className: 'RobustListComponent',
            layout: 'sidebar',
            filePath: '../shared/scripts/components/RobustListComponent.js'
        },
        {
            id: 'scenario-list',
            name: 'ScenarioList',
            displayName: '场景列表',
            description: '鲁棒性场景明细：组名、场景切换、汇总指标与 R-L/I-S/P-A 表格',
            className: 'ScenarioListComponent',
            filePath: '../shared/scripts/components/ScenarioListComponent.js'
        },
        {
            id: 'four-dct-scenario-list',
            name: 'FourDCTScenarioList',
            displayName: '4DCT-场景列表',
            description: '4DCT 场景列表',
            className: 'FourDCTScenarioListComponent',
            filePath: '../shared/scripts/components/FourDCTScenarioListComponent.js'
        },
        {
            id: 'four-dct-robustness-evaluation-dvh',
            name: 'FourDCTRobustnessEvaluationDVH',
            displayName: '4DCT-鲁棒性评估DVH',
            description: '4DCT 鲁棒性评估 DVH 组件',
            className: 'FourDCTRobustnessEvaluationDVHComponent',
            filePath: '../shared/scripts/components/FourDCTRobustnessEvaluationDVHComponent.js'
        },
        {
            id: 'dose-statistics',
            name: 'DoseStatistics',
            displayName: '剂量统计',
            description: '剂量统计组件',
            className: 'DoseStatisticsComponent',
            filePath: '../shared/scripts/components/DoseStatisticsComponent.js'
        },
        {
            id: 'plan-comparison',
            name: 'PlanComparison',
            displayName: '计划对比',
            description: '多计划剂量统计对比',
            className: 'PlanComparisonDoseStatisticsComponent',
            filePath: '../shared/scripts/components/PlanComparisonDoseStatisticsComponent.js'
        },
        {
            id: 'dose',
            name: 'DOSE',
            displayName: 'DOSE',
            description: '剂量分布显示',
            className: 'DOSEComponent',
            layout: 'sidebar', // 标记为侧边栏布局
            filePath: '../shared/scripts/components/DOSEComponent.js'
        },
        {
            id: 'sequence-tree',
            name: 'SequenceTree',
            displayName: '序列树',
            description: '治疗序列树形结构',
            className: 'SequenceTreeComponent',
            layout: 'sidebar', // 采用与ROI相同的侧边栏布局
            filePath: '../shared/scripts/components/SequenceTreeComponent.js'
        },
        {
            id: 'registration',
            name: 'Registration',
            displayName: 'REG',
            description: '图像配准组件',
            className: 'RegistrationComponent',
            layout: 'sidebar', // 标记为侧边栏布局
            filePath: '../shared/scripts/components/RegistrationComponent.js'
        },
        {
            id: 'clinical-target',
            name: 'ClinicalTarget',
            displayName: '临床目标',
            description: '临床目标组件，支持临床目标管理和状态显示',
            className: 'ClinicalTargetComponent',
            filePath: '../shared/scripts/components/ClinicalTargetComponent.js'
        },
        {
            id: 'settings-data-transfer',
            name: 'SettingsDataTransfer',
            displayName: '系统设置 - 数据传输',
            description: '系统设置中的数据传输设置面板（Feature Panel）',
            className: 'DataTransferSettingsComponent',
            filePath: '../shared/scripts/components/settings/DataTransferSettingsComponent.js'
        },
        {
            id: 'settings-drawing-template',
            name: 'SettingsDrawingTemplate',
            displayName: '系统设置 - 勾画模板',
            description: '系统设置中的勾画模板设置面板（Feature Panel）',
            className: 'DrawingTemplateSettingsComponent',
            filePath: '../shared/scripts/components/settings/DrawingTemplateSettingsComponent.js'
        },
        {
            id: 'settings-organ-limit-template',
            name: 'SettingsOrganLimitTemplate',
            displayName: '系统设置 - 器官限量模板',
            description: '系统设置中的器官限量模板设置面板（Feature Panel）',
            className: 'OrganLimitTemplateSettingsComponent',
            filePath: '../shared/scripts/components/settings/OrganLimitTemplateSettingsComponent.js'
        },
        {
            id: 'module-toolbar',
            name: 'ModuleToolbar',
            displayName: '模块工具栏',
            description: '可复用的模块工具栏组件',
            className: 'ModuleToolbarComponent',
            filePath: '../shared/scripts/components/ModuleToolbarComponent.js'
        },
        {
            id: 'patient-overview',
            name: 'PatientOverview',
            displayName: '患者概览',
            description: '患者基本信息展示组件，可在多个模块复用',
            className: 'PatientOverviewComponent',
            filePath: '../shared/scripts/components/PatientOverviewComponent.js'
        },
        {
            id: 'optimization-constraints',
            name: 'OptimizationConstraints',
            displayName: '优化约束列表',
            description: '计划优化模块中的优化约束列表视图组件（公共组件）',
            className: 'OptimizationConstraintsComponent',
            filePath: '../shared/scripts/components/OptimizationConstraintsComponent.js'
        },
        {
            id: 'prompt-rich-text-modal',
            name: 'PromptRichTextModal',
            displayName: '提示-富文本类',
            description: '提示弹窗：富文本内容展示（多行/表格）',
            className: 'PromptRichTextModalComponent',
            filePath: '../shared/scripts/components/PromptRichTextModalComponent.js'
        },
        {
            id: 'prompt-simple-confirm-cancel-modal',
            name: 'PromptSimpleConfirmCancelModal',
            displayName: '提示-简单文本（取消/确定）',
            description: '提示弹窗：简单文本，操作按钮为取消与确定',
            className: 'PromptSimpleConfirmCancelModalComponent',
            filePath: '../shared/scripts/components/PromptSimpleConfirmCancelModalComponent.js'
        },
        {
            id: 'prompt-progress-modal',
            name: 'PromptProgressModal',
            displayName: '提示-进度条类',
            description: '提示弹窗：展示进行中状态与进度条',
            className: 'PromptProgressModalComponent',
            filePath: '../shared/scripts/components/PromptProgressModalComponent.js'
        },
        {
            id: 'prompt-simple-confirm-modal',
            name: 'PromptSimpleConfirmModal',
            displayName: '提示-简单文本（仅确定）',
            description: '提示弹窗：简单文本，仅单个确定按钮',
            className: 'PromptSimpleConfirmModalComponent',
            filePath: '../shared/scripts/components/PromptSimpleConfirmModalComponent.js'
        },
        {
            id: 'error-modal',
            name: 'ErrorModal',
            displayName: '错误类弹窗',
            description: '错误提示弹窗，包含错误图标与说明文本',
            className: 'ErrorModalComponent',
            filePath: '../shared/scripts/components/ErrorModalComponent.js'
        },
        {
            id: 'warning-delete-modal',
            name: 'WarningDeleteModal',
            displayName: '警告-删除类',
            description: '警告弹窗：删除确认（取消/删除）',
            className: 'WarningDeleteModalComponent',
            filePath: '../shared/scripts/components/WarningDeleteModalComponent.js'
        },
        {
            id: 'warning-rich-text-modal',
            name: 'WarningRichTextModal',
            displayName: '警告-富文本类',
            description: '警告弹窗：富文本/表格内容，支持忽略操作',
            className: 'WarningRichTextModalComponent',
            filePath: '../shared/scripts/components/WarningRichTextModalComponent.js'
        },
        {
            id: 'plan-library',
            name: 'PlanLibrary',
            displayName: '计划库',
            description: '生成计划库弹窗：侧栏计划/射束表单；主区 #planLibraryCenterRoot 为空容器，待接入布局',
            className: 'PlanLibraryComponent',
            filePath: '../shared/scripts/components/PlanLibraryComponent.js'
        }
    ],
    
    // 后装特有组件
    brachy: [
        {
            id: 'brachy-view-3d',
            name: 'BrachyView3D',
            displayName: '后装-3D重建视图',
            description: '使用Three.js的三维重建视图（后装）',
            className: 'BrachyView3DComponent',
            filePath: '../brachy-client/scripts/BrachyView3DComponent.js',
            dependencies: ['Three.js']
        },
        {
            id: 'channel-list',
            name: 'ChannelList',
            displayName: '通道列表',
            description: '后装治疗通道列表组件，支持通道管理和驻留位置配置',
            className: 'ChannelListComponent',
            filePath: '../brachy-client/scripts/ChannelListComponent.js'
        },
        {
            id: 'channel-list-b-ii-2',
            name: 'ChannelListBII2',
            displayName: '通道列表-B-II-2型',
            description: '后装治疗通道列表组件-B-II-2型，支持通道管理和驻留位置配置',
            className: 'ChannelListBII2Component',
            filePath: '../brachy-client/scripts/ChannelListBII2Component.js'
        },
        {
            id: 'dwell-control',
            name: 'DwellControl',
            displayName: '驻留控制',
            description: '后装治疗驻留控制组件，支持驻留点管理和时间配置',
            className: 'DwellControlComponent',
            filePath: '../brachy-client/scripts/DwellControlComponent.js'
        }
    ],
    
    // 质子特有组件
    proton: [
        {
            id: 'proton-create-plan',
            name: 'ProtonCreatePlan',
            displayName: '质子-新建计划',
            description: '新建计划弹窗：计划基本信息 + 射束组信息 + 目标剂量/靶区',
            className: 'ProtonCreatePlanComponent',
            filePath: '../proton-client/scripts/ProtonCreatePlanComponent.js?v=2'
        },
        {
            id: 'proton-energy-layer-pbs',
            name: 'ProtonEnergyLayerPBS',
            displayName: '质子-能量层-PBS',
            description: '某个射束内的能量层明细（只读深色表格：能量/MU/权重/束斑/束斑跳数/扫描次数）',
            className: 'ProtonEnergyLayerListComponentPBS',
            filePath: '../proton-client/scripts/ProtonEnergyLayerListComponentPBS.js'
        },
        {
            id: 'proton-beam-list',
            name: 'ProtonBeamListPBS',
            displayName: '质子-射束列表-PBS',
            description: '射束列表（深色表格、行选择、底部操作栏：添加/编辑/删除/复制/排序）',
            className: 'ProtonBeamListComponentPBS',
            filePath: '../proton-client/scripts/ProtonBeamListComponentPBS.js'
        },
        {
            id: 'proton-beam-optimization-settings',
            name: 'ProtonBeamOptimizationSettings',
            displayName: '质子-射束优化设置',
            description: '质子计划优化：射束权重/RTV/束斑与层间距/近远端层束斑等（深色表格，与截图一致）',
            className: 'ProtonBeamOptimizationSettingsComponent',
            filePath: '../proton-client/scripts/ProtonBeamOptimizationSettingsComponent.js'
        },
        {
            id: 'let',
            name: 'LET',
            displayName: 'LET',
            description: 'LET 视图（复用 2D 横截面视图样式）',
            className: 'LETComponent',
            filePath: '../proton-client/scripts/LETComponent.js?v=1'
        },
        {
            id: 'letd-vh',
            name: 'LETdVH',
            displayName: 'LETdVH',
            description: 'LETd-体积直方图',
            className: 'LETdVHComponent',
            filePath: '../proton-client/scripts/LETdVHComponent.js'
        },
        {
            id: 'letd-statistics',
            name: 'LETdStatistics',
            displayName: 'LETd统计',
            description: 'LETd 全部统计与 ROI 统计表格',
            className: 'LETdStatisticsComponent',
            filePath: '../proton-client/scripts/LETdStatisticsComponent.js?v=1'
        },
        {
            id: 'proton-view-3d',
            name: 'ProtonView3D',
            displayName: '质子-3D重建视图',
            description: '使用Three.js的三维重建视图（质子）',
            className: 'ProtonView3DComponent',
            filePath: '../proton-client/scripts/ProtonView3DComponent.js',
            dependencies: ['Three.js']
        },
        {
            id: 'proton-beam-eye-view',
            name: 'ProtonBeamEyeView',
            displayName: '质子-射束眼视图(BEV)',
            description: '射野方向观视图（质子）',
            className: 'ProtonBeamEyeViewComponent',
            filePath: '../proton-client/scripts/ProtonBeamEyeViewComponent.js'
        },
        {
            id: 'proton-export-report',
            name: 'ProtonExportReport',
            displayName: '质子-导出报告',
            description: '计划报告导出预览',
            className: 'ProtonExportReportComponent',
            filePath: '../proton-client/scripts/ProtonExportReportComponent.js?v=3'
        },
        {
            id: 'create-robustness-evaluation',
            name: 'CreateRobustnessEvaluation',
            displayName: '创建鲁棒性评估',
            description: '创建鲁棒性评估弹窗：组名、场景生成、场景列表编辑与开始评估',
            className: 'CreateRobustnessEvaluationComponent',
            filePath: '../proton-client/scripts/CreateRobustnessEvaluationComponent.js'
        }
    ],

    // 光子组件
    photon: [
        {
            id: 'dmlc-beam-list',
            name: 'DMLCBeamList',
            displayName: 'DMLC-射束列表',
            description: '光子 DMLC 射束参数表格：分组表头、可编辑单元格与底部工具栏',
            className: 'DMLCBeamListComponent',
            filePath: '../photon-client/scripts/DMLCBeamListComponent.js'
        },
        {
            id: 'photon-view-3d',
            name: 'PhotonView3D',
            displayName: '光子-3D重建视图',
            description: '使用 Three.js 的三维重建视图（光子）',
            className: 'PhotonView3DComponent',
            filePath: '../photon-client/scripts/PhotonView3DComponent.js',
            dependencies: ['Three.js']
        },
        {
            id: 'photon-bev',
            name: 'PhotonBeamEyeView',
            displayName: '光子-BEV',
            description: '光子射束眼视图：DRR 示意、射野框与十字线；工具含 DRR 设置（占位）、缩放、移动、测量、最大化',
            className: 'PhotonBeamEyeViewComponent',
            filePath: '../photon-client/scripts/PhotonBeamEyeViewComponent.js'
        },
        {
            id: 'photon-beam-optimization-settings',
            name: 'PhotonBeamOptimizationSettings',
            displayName: '光子-射束优化设置',
            description: '光子射束优化参数表：数值列为展示；可见性列与坞门限制列可点击（表头为全部切换/全选）',
            className: 'PhotonProtonBeamOptimizationSettingsComponent',
            filePath: '../photon-client/scripts/PhotonProtonBeamOptimizationSettingsComponent.js'
        }
    ]
};

// 项目配置
const PROJECTS = {
    shared: { name: '公共组件', icon: 'fa-cube', color: '#21a1f1' },
    brachy: { name: '后装组件', icon: 'fa-radiation', color: '#10b981' },
    proton: { name: '质子组件', icon: 'fa-atom', color: '#f59e0b' },
    photon: { name: '光子组件', icon: 'fa-radiation', color: '#ef4444' }
};