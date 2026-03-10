# 2D阅片框组件工具栏更新说明

## 📅 更新日期
2025-12-05

## 🎯 更新内容

### 1. 工具栏图标更新

所有工具图标已更新为青蓝色渐变SVG图标，采用现代化设计风格。

#### 七大工具：

| 图标 | 工具名称 | 功能描述 | 快捷操作 |
|------|---------|---------|---------|
| 🔍 | **缩放** | 放大缩小图像 | 激活后拖动鼠标上下缩放，滚轮也可缩放 |
| ✋ | **移动** | 平移图像 | 激活后拖动鼠标移动图像 |
| 🌓 | **灰度值** | 调整窗宽窗位 | 激活后左右拖动调窗宽，上下拖动调窗位 |
| 🔄 | **旋转** | 旋转图像 | 点击按钮旋转90度 |
| 📏 | **测量** | 距离测量 | 激活后点击两个点测量距离 |
| ⛶ | **最大化** | 全屏显示 | 点击全屏，再次点击恢复 |
| ⊞ | **网格** | 辅助网格 | 切换网格线显示/隐藏 |

### 2. SVG图标样式

所有图标采用统一的渐变色：
- 起始色：`#00d4ff` (青蓝色)
- 结束色：`#0099cc` (深蓝色)
- 渐变方向：从左上到右下

### 3. 交互状态

- **未激活状态**：不透明度 0.6
- **激活状态**：不透明度 1.0，高亮显示
- **悬停效果**：自动处理的CSS过渡效果

### 4. 新增功能

#### 4.1 工具切换系统
```javascript
// 激活工具
view.activateTool('zoom');    // 激活缩放工具
view.activateTool('pan');      // 激活移动工具
view.activateTool('adjust');   // 激活灰度值工具
view.activateTool('measure');  // 激活测量工具
```

#### 4.2 旋转功能
```javascript
// 每次点击旋转90度
rotationAngle += 90;  // 0° → 90° → 180° → 270° → 0°
```

#### 4.3 网格显示
```javascript
// 切换网格
view.toggleGrid();
view.showGrid = true;  // 显示网格
view.showGrid = false; // 隐藏网格
```

#### 4.4 最大化功能
```javascript
// 切换全屏
view.toggleMaximize();
view.isMaximized = true;  // 全屏显示
view.isMaximized = false; // 恢复正常
```

#### 4.5 测量功能
```javascript
// 测量点数组
view.measurePoints = [];  // 清空测量点
// 点击canvas自动添加测量点
// 两个点时自动计算并显示距离
```

### 5. 鼠标光标样式

根据当前工具自动切换光标：
- **缩放工具**：`zoom-in`
- **移动工具**：`grab` / `grabbing`
- **灰度值工具**：`ns-resize`
- **测量工具**：`crosshair`
- **默认**：`default`

## 📦 更新的文件

1. `CrossSectionView2DComponent.js` - 横截面视图组件
2. `CoronalView2DComponent.js` - 冠状面视图组件
3. `SagittalView2DComponent.js` - 矢状面视图组件

## 🎨 视觉效果

### 工具栏布局
```
[2D] -------------------------------------------- [🔍][✋][🌓][🔄][📏][⛶][⊞▼]
```

- 左侧：标题 "2D"
- 右侧：七个工具按钮，水平排列

### 网格效果
- 网格颜色：`rgba(0, 212, 255, 0.2)` (半透明青蓝色)
- 网格间距：50px
- 网格线宽：1px

### 测量显示
- 测量点：绿色实心圆，半径4px
- 测量线：绿色实线，线宽2px
- 距离文本：绿色文字，带黑色描边，显示在连线中点上方

## 🔧 使用示例

### 基本使用
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="shared/styles/styles_plan_view_2d.css">
</head>
<body>
    <div id="viewer" style="width: 800px; height: 600px;"></div>
    
    <script src="shared/scripts/components/CrossSectionView2DComponent.js"></script>
    <script>
        const view = new CrossSectionView2DComponent('viewer', {
            enableToolbar: true,
            showDoseLegend: false
        });
        
        // 设置层数信息
        view.setSliceInfo(69, 102);
        
        // 加载图像
        view.loadImageFromURL('/path/to/image.png');
    </script>
</body>
</html>
```

### 高级功能
```javascript
// 1. 激活测量工具
view.activateTool('measure');

// 2. 显示网格
view.toggleGrid();

// 3. 旋转图像
view.rotationAngle = 90;
view.renderAll();

// 4. 全屏显示
view.toggleMaximize();

// 5. 调整窗宽窗位
view.setWindowLevel(400, 40);
```

## 🎯 测试页面

创建了测试页面 `test-2d-tools.html`，可以直接在浏览器中打开测试所有新功能。

测试页面包含：
- 四个2D视图（Axial、Coronal、Sagittal、Plan）
- 详细的工具说明
- 使用提示

## 🐛 已知问题

无

## 📝 注意事项

1. **工具互斥性**：同一时间只能激活一个工具（测量、缩放、移动、灰度值）
2. **旋转叠加**：旋转是叠加效果，会与缩放和平移组合
3. **网格独立**：网格显示不影响其他工具的使用
4. **最大化限制**：最大化时建议先关闭其他全屏元素，避免冲突
5. **测量精度**：测量结果单位为像素(px)，需要根据实际像素间距转换为物理单位

## 🔄 兼容性

- ✅ 完全向后兼容
- ✅ 所有原有API保持不变
- ✅ 新增功能为可选特性

## 📞 支持

如有问题或建议，请参考：
- 组件文档：`2DViewComponents_README.md`
- 详细API文档：`CrossSectionView2DComponent_README.md`

---

**版本**: v1.2.0  
**作者**: Manteia Development Team  
**更新时间**: 2025-12-05
