# 2D视图组件系列使用说明

## 组件概述

本系列包含三个2D医学影像视图组件，分别对应不同的解剖平面：

1. **CrossSectionView2DComponent** - 2D横截面视图（Axial）
2. **CoronalView2DComponent** - 2D冠状面视图（Coronal）
3. **SagittalView2DComponent** - 2D矢状面视图（Sagittal）

## 组件区别

三个组件的功能完全相同，唯一的区别是默认的视图平面（viewPlane）：

| 组件名称 | 视图平面 | 英文标识 | 中文名称 |
|---------|---------|---------|---------|
| CrossSectionView2DComponent | Axial | Axial | 横截面 |
| CoronalView2DComponent | Coronal | Coronal | 冠状面 |
| SagittalView2DComponent | Sagittal | Sagittal | 矢状面 |

### 视图平面说明

- **Axial（横截面）**：水平切面，从头到脚的横向切片
- **Coronal（冠状面）**：冠状切面，从前到后的纵向切片
- **Sagittal（矢状面）**：矢状切面，从左到右的纵向切片

## 使用方法

### 1. 基本使用

```javascript
// 横截面视图（Axial）
const axialView = new CrossSectionView2DComponent('axial-container', {
    enableToolbar: true,
    showDoseLegend: false
});

// 冠状面视图（Coronal）
const coronalView = new CoronalView2DComponent('coronal-container', {
    enableToolbar: true,
    showDoseLegend: false
});

// 矢状面视图（Sagittal）
const sagittalView = new SagittalView2DComponent('sagittal-container', {
    enableToolbar: true,
    showDoseLegend: false
});
```

### 2. 三视图联动示例

```html
<!-- HTML结构 -->
<div class="three-view-layout">
    <div id="axial-view" class="view-panel"></div>
    <div id="coronal-view" class="view-panel"></div>
    <div id="sagittal-view" class="view-panel"></div>
</div>

<script>
// 创建三个视图
const axialView = new CrossSectionView2DComponent('axial-view', {
    enableToolbar: true,
    showDoseLegend: false
});

const coronalView = new CoronalView2DComponent('coronal-view', {
    enableToolbar: true,
    showDoseLegend: false
});

const sagittalView = new SagittalView2DComponent('sagittal-view', {
    enableToolbar: true,
    showDoseLegend: false
});

// 加载相同的图像数据到三个视图
const imageUrl = '/path/to/medical-image.png';
axialView.loadImageFromURL(imageUrl);
coronalView.loadImageFromURL(imageUrl);
sagittalView.loadImageFromURL(imageUrl);

// 同步层数信息
function syncSliceInfo(currentSlice, totalSlices) {
    axialView.setSliceInfo(currentSlice, totalSlices);
    coronalView.setSliceInfo(currentSlice, totalSlices);
    sagittalView.setSliceInfo(currentSlice, totalSlices);
}

syncSliceInfo(69, 102);
</script>
```

### 3. 图像处理模块使用（不显示剂量线）

```javascript
// 图像处理模块 - 三视图配置
const imageProcessingViews = {
    axial: new CrossSectionView2DComponent('axial-container', {
        enableToolbar: true,
        enableDoseLayer: false,
        showDoseLegend: false
    }),
    coronal: new CoronalView2DComponent('coronal-container', {
        enableToolbar: true,
        enableDoseLayer: false,
        showDoseLegend: false
    }),
    sagittal: new SagittalView2DComponent('sagittal-container', {
        enableToolbar: true,
        enableDoseLayer: false,
        showDoseLegend: false
    })
};
```

### 4. 计划设计模块使用（显示剂量线）

```javascript
// 计划设计模块 - 三视图配置
const planDesignViews = {
    axial: new CrossSectionView2DComponent('axial-container', {
        enableToolbar: true,
        enableDoseLayer: true,
        showDoseLegend: true  // 显示剂量线图例
    }),
    coronal: new CoronalView2DComponent('coronal-container', {
        enableToolbar: true,
        enableDoseLayer: true,
        showDoseLegend: true
    }),
    sagittal: new SagittalView2DComponent('sagittal-container', {
        enableToolbar: true,
        enableDoseLayer: true,
        showDoseLegend: true
    })
};

// 加载剂量数据
planDesignViews.axial.loadDoseData(doseImageData);
planDesignViews.coronal.loadDoseData(doseImageData);
planDesignViews.sagittal.loadDoseData(doseImageData);
```

## 配置选项

所有三个组件支持相同的配置选项：

| 选项名称 | 类型 | 默认值 | 说明 |
|---------|------|--------|------|
| `enableToolbar` | boolean | `true` | 是否显示工具栏 |
| `enableLayerControl` | boolean | `true` | 是否启用图层控制 |
| `enableDoseLayer` | boolean | `false` | 是否启用剂量层渲染 |
| `showDoseLegend` | boolean | `false` | 是否显示剂量线图例 |

## API方法

所有三个组件提供相同的API方法：

### 图像加载
- `loadImage(image)` - 加载图像数据
- `loadImageFromURL(url)` - 从URL加载图像

### 勾画管理
- `addContour(roiId, points, color)` - 添加ROI轮廓
- `setContourVisibility(roiId, visible)` - 设置ROI可见性
- `setContourColor(roiId, color)` - 设置ROI颜色

### 剂量管理
- `loadDoseData(doseData)` - 加载剂量数据
- `setDoseOpacity(opacity)` - 设置剂量透明度

### 束斑管理
- `addBeamSpot(x, y, radius, color)` - 添加束斑
- `clearBeamSpots()` - 清空所有束斑

### 视图控制
- `fitToWindow()` - 适应窗口大小
- `setWindowLevel(width, center)` - 设置窗宽窗位
- `setSliceInfo(current, total)` - 设置层数信息
- `setViewPlane(plane)` - 设置视图平面

## 左下角显示信息

每个组件在左下角显示当前的视图平面和层数信息：

- **CrossSectionView2DComponent**: 显示 "Axial 69/102"
- **CoronalView2DComponent**: 显示 "Coronal 69/102"
- **SagittalView2DComponent**: 显示 "Sagittal 69/102"

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>三视图医学影像查看器</title>
    <style>
        .viewer-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 10px;
            height: 100vh;
            padding: 10px;
        }
        .view-panel {
            border: 1px solid #333;
            background: #000;
        }
        .axial-view {
            grid-column: 1 / 3;
        }
    </style>
</head>
<body>
    <div class="viewer-container">
        <div id="axial-view" class="view-panel axial-view"></div>
        <div id="coronal-view" class="view-panel"></div>
        <div id="sagittal-view" class="view-panel"></div>
    </div>

    <script src="shared/scripts/components/CrossSectionView2DComponent.js"></script>
    <script src="shared/scripts/components/CoronalView2DComponent.js"></script>
    <script src="shared/scripts/components/SagittalView2DComponent.js"></script>
    
    <script>
        // 创建三个视图
        const views = {
            axial: new CrossSectionView2DComponent('axial-view', {
                enableToolbar: true,
                showDoseLegend: false
            }),
            coronal: new CoronalView2DComponent('coronal-view', {
                enableToolbar: true,
                showDoseLegend: false
            }),
            sagittal: new SagittalView2DComponent('sagittal-view', {
                enableToolbar: true,
                showDoseLegend: false
            })
        };

        // 加载图像数据
        const imageUrl = '/path/to/ct-image.png';
        Object.values(views).forEach(view => {
            view.loadImageFromURL(imageUrl);
            view.setSliceInfo(69, 102);
        });

        // 添加ROI轮廓到所有视图
        const roiPoints = [
            {x: 100, y: 100},
            {x: 200, y: 100},
            {x: 200, y: 200},
            {x: 100, y: 200}
        ];
        
        Object.values(views).forEach(view => {
            view.addContour('roi-1', roiPoints, '#00FF00');
        });</script>
</body>
</html>
```

## 注意事项

1. **视图平面一致性**：虽然可以通过 `setViewPlane()` 方法修改视图平面，但建议使用对应的组件类以保持代码清晰
2. **性能优化**：对于不需要剂量显示的场景，建议设置 `enableDoseLayer: false` 和 `showDoseLegend: false`
3. **容器尺寸**：确保每个容器元素都有明确的宽度和高度
4. **数据同步**：在三视图联动场景中，需要手动同步各视图的数据和状态

## 文件位置

- `shared/scripts/components/CrossSectionView2DComponent.js` - 横截面视图组件
- `shared/scripts/components/CoronalView2DComponent.js` - 冠状面视图组件
- `shared/scripts/components/SagittalView2DComponent.js` - 矢状面视图组件
- `shared/scripts/components/CrossSectionView2DComponent_README.md` - 详细API文档

## 更新日志

### v1.1.0 (2025-12-05)
- ✅ 创建三个独立的视图组件（Axial、Coronal、Sagittal）
- ✅ 优化工具栏样式（SVG图标、无边框、右对齐）
- ✅ 移除窗宽窗位显示控件
- ✅ 删除右下角位面指示器
- ✅ 添加剂量线图例配置选项
- ✅ 工具栏高度优化为32px

### v1.0.0
- 初始版本发布