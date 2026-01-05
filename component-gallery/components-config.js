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
            displayName: '剂量体积直方图',
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
            id: 'spectral-ct-analysis',
            name: 'SpectralCTAnalysis',
            displayName: '能谱CT分析',
            description: '能谱CT图像分析',
            className: 'SpectralCTAnalysisComponent',
            filePath: '../shared/scripts/components/SpectralCTAnalysisComponent.js'
        },
        {
            id: 'export-plan',
            name: 'ExportPlan',
            displayName: '导出计划',
            description: '计划导出组件',
            className: 'ExportPlanComponent',
            filePath: '../shared/scripts/components/ExportPlanComponent.js'
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
        }
    ],
    
    // 后装特有组件
    brachy: [
        {
            id: 'view-3d',
            name: 'View3D',
            displayName: '3D重建视图',
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
            id: 'view-3d',
            name: 'View3D',
            displayName: '3D重建视图',
            description: '使用Three.js的三维重建视图',
            className: 'View3DComponent',
            filePath: '../proton-client/scripts/View3DComponent.js',
            dependencies: ['Three.js']
        },
        {
            id: 'beam-eye-view',
            name: 'BeamEyeView',
            displayName: '射束眼视图(BEV)',
            description: '射野方向观视图',
            className: 'BeamEyeViewComponent',
            filePath: '../proton-client/scripts/BeamEyeViewComponent.js'
        },
        {
            id: 'viewing-frame',
            name: 'ViewingFrame',
            displayName: '观察框架',
            description: '多视图观察框架',
            className: 'ViewingFrameComponent',
            filePath: '../proton-client/scripts/ViewingFrameComponent.js'
        },
        {
            id: 'energy-layer-view',
            name: 'EnergyLayerView',
            displayName: '能量层视图',
            description: '能量层可视化',
            className: 'EnergyLayerViewComponent',
            filePath: '../proton-client/scripts/EnergyLayerViewComponent.js'
        }
    ]
};

// 项目配置
const PROJECTS = {
    shared: { name: '公共组件', icon: 'fa-cube', color: '#21a1f1' },
    brachy: { name: '后装组件', icon: 'fa-radiation', color: '#10b981' },
    proton: { name: '质子组件', icon: 'fa-atom', color: '#f59e0b' }
};