# 组件展示系统 (Component Gallery)

这是一个用于展示和测试所有共享组件的独立页面系统。

## 功能特性

- **列表详情模式**：左侧组件列表，右侧详细信息和实时预览
- **分类筛选**：按功能分类浏览组件（医学影像、数据分析、治疗计划等）
- **搜索功能**：快速查找需要的组件
- **实时预览**：每个组件都可以实时加载和交互
- **代码示例**：提供使用示例代码
- **功能说明**：详细的功能特性列表

## 目录结构

```
component-gallery/
├── index.html# 主页面
├── gallery.css             # 样式文件
├── gallery.js              # 主逻辑
├── components-config.js    # 组件配置数据
└── README.md              # 说明文档
```

## 使用方法

### 1. 直接打开

在浏览器中打开 `component-gallery/index.html` 即可。

### 2. 通过HTTP服务器

推荐使用HTTP服务器运行，以避免跨域问题：

```bash
# 使用Python
python -m http.server 8000

# 使用Node.js (http-server)
npx http-server

# 使用VS Code Live Server插件
右键 index.html -> Open with Live Server
```

然后访问：`http://localhost:8000/component-gallery/`

## 组件分类

### 医学影像 (Visualization)
- 2D横截面视图
- 3D重建视图
- 射束眼视图(BEV)
- 能量层视图
- 能谱CT分析
- 等...

### 数据分析 (Analysis)
- 剂量体积直方图(DVH)
- 剂量统计
- 线剂量分布
- 计划对比
- 等...

### 治疗计划 (Planning)
- 射束列表管理
- ROI管理
- POI管理
- 剂量显示
- 等中心管理
- 等...

### 患者管理 (Management)
- 患者管理
- 患者信息
- 图像配准
- 等...

### 优化设置 (Optimization)
- 优化约束
- 优化设置
- 鲁棒性分析
- 等...

### 其他 (Other)
- 设置弹窗
- 导出计划
- QA计划创建
- 等...

## 添加新组件

要添加新组件到展示系统，需要：

### 1. 在 `components-config.js` 中添加配置

```javascript
{
    id: 'your-component-id',
    name: 'YourComponent',
    displayName: '组件显示名称',
    category: 'visualization', // 或其他分类
    description: '组件描述',
    features: [
        '功能1',
        '功能2',
        '功能3'
    ],
    className: 'YourComponentClass',
    filePath: '../shared/scripts/components/YourComponent.js',
    usage: `const component = new YourComponentClass('container-id', {
    option1: value1
});`
}
```

### 2. 在 `index.html` 中引入组件脚本

```html
<script src="../shared/scripts/components/YourComponent.js"></script>
```

### 3. 在 `gallery.js` 中添加实例化逻辑

在 `loadComponentInstance` 方法的 switch 语句中添加：

```javascript
case 'YourComponentClass':
    if (typeof YourComponentClass !== 'undefined') {
        instance = new YourComponentClass(componentContainer, {
            // 配置选项
        });
    }
    break;
```

## 支持的组件

目前已配置 **36个组件**：

- ✅ CrossSectionView2D - 2D横截面视图
- ✅ DVH - 剂量体积直方图
- ✅ View3D - 3D重建视图
- ✅ BeamEyeView - 射束眼视图
- ✅ BeamList - 射束列表
- ✅ ROI - ROI管理
- ✅ POI - POI管理
- ✅ DoseStatistics - 剂量统计
- ✅ PatientManagement - 患者管理
- ✅ PatientInfo - 患者信息
- ... 以及更多

## 技术栈

- 纯JavaScript（无框架依赖）
- CSS3（现代化暗色主题）
- Font Awesome 图标
- 各组件自身的依赖（如Three.js用于3D视图）

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 注意事项

1. **组件依赖**：某些组件需要额外的库（如Three.js），确保已正确引入
2. **样式冲突**：组件展示页面使用独立的样式，避免与组件自身样式冲突
3. **实例管理**：切换组件时会自动清理之前的实例，避免内存泄漏
4. **跨域问题**：建议使用HTTP服务器运行，避免本地文件跨域限制

## 未来计划

- [ ] 添加组件参数配置面板
- [ ] 支持组件状态保存和恢复
- [ ] 添加组件性能监控
- [ ] 支持组件截图和导出
- [ ] 添加组件对比功能
- [ ] 支持自定义主题

## 贡献

如果要添加新组件或改进现有功能，请：

1. 更新 `components-config.js` 配置
2. 在 `gallery.js` 中添加实例化逻辑
3. 测试组件在展示页面中的表现
4. 更新本 README 文档

## 许可

与主项目保持一致