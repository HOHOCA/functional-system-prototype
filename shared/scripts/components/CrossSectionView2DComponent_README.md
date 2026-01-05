# CrossSectionView2DComponent 使用说明

## 组件概述

`CrossSectionView2DComponent` 是一个支持多层叠加显示的医学影像2D横截面视图组件。

## 主要功能

- **图像显示层**：底层医学影像显示
- **勾画层**：ROI轮廓显示
- **剂量层**：剂量分布显示（可选）
- **束斑层**：束斑位置显示
- **交互功能**：缩放、平移、窗宽窗位调整

## 配置选项

### 构造函数参数

```javascript
new CrossSectionView2DComponent(containerId, options)
```

#### 参数说明

- `containerId` (string|HTMLElement): 容器ID或DOM元素
- `options` (Object): 配置选项对象

#### 可用配置选项

| 选项名称 | 类型 | 默认值 | 说明 |
|---------|------|--------|------|
| `enableToolbar` | boolean | `true` | 是否显示工具栏 |
| `enableLayerControl` | boolean | `true` | 是否启用图层控制 |
| `enableDoseLayer` | boolean | `false` | 是否启用剂量层渲染 |
| `showDoseLegend` | boolean | `false` | 是否显示剂量线图例 |

## 剂量线图例配置

### 使用场景

- **图像处理模块**：不显示剂量线图例（`showDoseLegend: false`）
- **计划设计模块**：显示剂量线图例（`showDoseLegend: true`）

### 配置示例

#### 1. 图像处理模块（不显示剂量线）

```javascript
// 图像处理模块 - 不显示剂量线图例
const imageViewer = new CrossSectionView2DComponent('image-container', {
    enableToolbar: true,
    enableLayerControl: true,
    enableDoseLayer: false,    // 不启用剂量层
    showDoseLegend: false       // 不显示剂量线图例
});
```

#### 2. 计划设计模块（显示剂量线）

```javascript
// 计划设计模块 - 显示剂量线图例
const planViewer = new CrossSectionView2DComponent('plan-container', {
    enableToolbar: true,
    enableLayerControl: true,
    enableDoseLayer: true,      // 启用剂量层
    showDoseLegend: true        // 显示剂量线图例
});
```

### 剂量线图例说明

当 `showDoseLegend: true` 时，组件会在右侧显示剂量线图例面板，包含：

- **标题**："剂量线"
- **颜色映射**：
  - 105% - 红色 (#FF0000)
  - 100% - 橙色 (#FF6600)
  - 95% - 黄色 (#FFCC00)
  - 90% - 绿色 (#00FF00)
  - 50% - 青色 (#00CCFF)
  - 20% - 紫色 (#9900FF)

### 剂量线配置

可以通过修改 `isodoseLines` 数组来自定义显示的等剂量线：

```javascript
const viewer = new CrossSectionView2DComponent('container', {
    showDoseLegend: true
});

// 自定义等剂量线百分比
viewer.isodoseLines = [20, 50, 80, 90, 95, 100, 105, 110];
```

## 完整使用示例

### 图像处理模块示例

```html
<!-- HTML -->
<div id="image-processing-view" style="width: 100%; height: 600px;"></div>

<script>
// JavaScript
const imageViewer = new CrossSectionView2DComponent('image-processing-view', {
    enableToolbar: true,
    enableLayerControl: true,
    enableDoseLayer: false,
    showDoseLegend: false
});

// 加载图像
imageViewer.loadImageFromURL('/path/to/ct-image.png');

// 添加ROI轮廓
imageViewer.addContour('roi-1', [
    {x: 100, y: 100},
    {x: 200, y: 100},
    {x: 200, y: 200},
    {x: 100, y: 200}
], '#00FF00');
</script>
```

### 计划设计模块示例

```html
<!-- HTML -->
<div id="plan-design-view" style="width: 100%; height: 600px;"></div>

<script>
// JavaScript
const planViewer = new CrossSectionView2DComponent('plan-design-view', {
    enableToolbar: true,
    enableLayerControl: true,
    enableDoseLayer: true,
    showDoseLegend: true  // 显示剂量线图例
});

// 加载图像
planViewer.loadImageFromURL('/path/to/ct-image.png');

// 加载剂量数据
planViewer.loadDoseData(doseImageData);

// 添加束斑
planViewer.addBeamSpot(256, 256, 5, '#FF0000');
</script>
```

## API 方法

### 图像加载

- `loadImage(image)` - 加载图像数据
- `loadImageFromURL(url)` - 从URL加载图像

### 勾画管理

- `addContour(roiId, points, color)` - 添加ROI轮廓
- `setContourVisibility(roiId, visible)` - 设置ROI可见性
- `setContourColor(roiId, color)` - 设置ROI颜色

### 剂量管理

- `loadDoseData(doseData)` - 加载剂量数据
- `setDoseOpacity(opacity)` - 设置剂量透明度（0-1）

### 束斑管理

- `addBeamSpot(x, y, radius, color)` - 添加束斑
- `clearBeamSpots()` - 清空所有束斑

### 视图控制

- `fitToWindow()` - 适应窗口大小
- `setWindowLevel(width, center)` - 设置窗宽窗位
- `setSliceInfo(current, total)` - 设置层数信息
- `setViewPlane(plane)` - 设置视图平面（'Axial', 'Coronal', 'Sagittal'）

## 注意事项

1. **剂量层渲染**：只有当 `enableDoseLayer: true` 且加载了剂量数据时，剂量层才会显示
2. **剂量线图例**：只有当 `showDoseLegend: true` 时，右侧剂量线图例面板才会显示
3. **性能优化**：对于不需要剂量显示的模块，建议设置 `enableDoseLayer: false` 和 `showDoseLegend: false` 以提高性能
4. **容器尺寸**：确保容器元素有明确的宽度和高度，否则组件可能无法正常显示

## 样式定制

组件使用以下CSS类名，可以通过覆盖这些类来自定义样式：

- `.cross-section-view2d-container` - 主容器
- `.cross-section-view2d-toolbar` - 工具栏
- `.cross-section-view2d-canvas` - 画布
- `.cross-section-view2d-dose-legend` - 剂量线图例面板
- `.dose-legend-title` - 图例标题
- `.dose-legend-item` - 图例项
- `.dose-legend-color` - 颜色块
- `.dose-legend-label` - 标签文本

## 更新日志

### v1.1.0 (2025-12-05)
- ✅ 优化工具栏：标题改为"2D"，按钮使用SVG图标
- ✅ 移除窗宽窗位显示控件
- ✅ 调整工具栏高度，使其更紧凑（32px）
- ✅ 删除右下角位面指示器
- ✅ 添加剂量线图例配置选项说明

### v1.0.0
- 初始版本发布