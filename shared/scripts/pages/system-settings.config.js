// 系统设置页配置：左侧菜单 -> 面板组件映射
// 约定：tabId 对应面板容器 id 为 `panel-${tabId}`
window.SYSTEM_SETTINGS_CONFIG = [
  { tabId: 'data-transfer', label: '数据传输设置', title: '数据传输设置', iconClass: 'fa-solid fa-right-left', component: 'DataTransferSettingsComponent' },
  { tabId: 'drawing-template', label: '勾画模版设置', title: '勾画模版设置', iconClass: 'fa-solid fa-ruler-combined', component: 'DrawingTemplateSettingsComponent' },
  { tabId: 'model-roi', label: '模型和ROI设置', title: '模型和ROI设置', iconClass: 'fa-solid fa-cube', component: 'PlaceholderSettingsComponent' },
  { tabId: 'drawing-priority', label: '勾画优先级设置', title: '勾画优先级设置', iconClass: 'fa-solid fa-magnifying-glass', component: 'PlaceholderSettingsComponent' },
  { tabId: 'postprocess-rules', label: '后处理规则设置', title: '后处理规则设置', iconClass: 'fa-solid fa-table-cells', component: 'PlaceholderSettingsComponent' },
  { tabId: 'image-grouping', label: '图像归组设置', title: '图像归组设置', iconClass: 'fa-solid fa-object-group', component: 'PlaceholderSettingsComponent' },
  { tabId: 'organ-limit-template', label: '器官限量模版设置', title: '器官限量模版设置', iconClass: 'fa-solid fa-file-contract', component: 'OrganLimitTemplateSettingsComponent' },
  { tabId: 'model', label: '模型设置', title: '模型设置', iconClass: 'fa-solid fa-tag', component: 'PlaceholderSettingsComponent' },
  { tabId: 'machine', label: '机器设置', title: '机器设置', iconClass: 'fa-solid fa-arrows-up-down', component: 'PlaceholderSettingsComponent' },
  { tabId: 'report-template', label: '报告模版设置', title: '报告模版设置', iconClass: 'fa-solid fa-file-lines', component: 'PlaceholderSettingsComponent' },
  { tabId: 'dose-calc', label: '剂量计算设置', title: '剂量计算设置', iconClass: 'fa-solid fa-square-xmark', component: 'PlaceholderSettingsComponent' },
  { tabId: 'plan-optimization', label: '计划优化设置', title: '计划优化设置', iconClass: 'fa-solid fa-arrows-rotate', component: 'PlaceholderSettingsComponent' }
];

