# 组件加载说明

## 当前状态

目前组件展示系统已经配置了24个公共组件，但并非所有组件都能立即预览。

## 为什么有些组件显示"暂未加载或不支持预览"？

这是正常的，原因如下：

### 1. 组件需要特定的初始化方式

每个组件的构造函数和初始化方式都不同。目前在 `gallery.js` 中只实现了以下10个组件的实例化逻辑：

✅ **已支持预览的组件：**
- CrossSectionView2D - 2D横截面视图
- DVH - 剂量体积直方图
- View3D - 3D重建视图
- BeamEyeView - 射束眼视图
- BeamList - 射束列表
- ROI - ROI管理
- POI - POI管理
- DoseStatistics - 剂量统计
- PatientManagement - 患者管理
- PatientInfo - 患者信息

⚠️ **暂不支持预览的组件：**
- ViewingFrame - 观察框架
- PlanDesignView2D - 计划设计2D视图
- EnergyLayerView - 能量层视图
- LineDoseDistribution - 线剂量分布
- PlanComparison - 计划对比
- DOSE - 剂量显示
- ISO - 等中心管理
- LET - LET显示
- SequenceTree - 序列树
- Registration - 配准
- OptimizationConstraints - 优化约束
- Robust - 鲁棒性分析
- SpectralCTAnalysis - 能谱CT分析
- ExportPlan - 导出计划

### 2. 如何添加新组件的预览支持？

要让一个组件支持预览，需要在 `gallery.js` 的 `loadComponentInstance` 方法中添加对应的 case：

```javascript
case 'YourComponentClassName':
    if (typeof YourComponentClassName !== 'undefined') {
        instance = new YourComponentClassName(componentContainer, {
            // 组件所需的配置选项
        });
        // 如果组件需要手动调用render
        // instance.render();
    }
    break;
```

### 3. 为什么不一次性添加所有组件？

因为：
1. **每个组件的初始化参数不同** - 需要查看每个组件的源码才能知道正确的初始化方式
2. **有些组件可能需要特定的数据** - 比如需要ROI列表、患者数据等
3. **有些组件可能有依赖关系** - 需要先初始化其他组件
4. **避免错误** - 错误的初始化可能导致整个页面崩溃

## 建议的使用方式

### 方案1：按需添加（推荐）
当你需要查看某个特定组件时，再添加它的实例化逻辑。这样可以确保每个组件都能正确初始化。

### 方案2：查看组件信息
即使组件无法预览，你仍然可以：
- 查看组件的基本信息（类名、文件路径、所属项目）
- 了解组件的用途和描述
- 知道组件在哪个文件中

### 方案3：直接查看源码
对于无法预览的组件，可以直接打开对应的源文件查看实现细节。

## 快速添加组件预览的步骤

1. 打开 `gallery.js`
2. 找到 `loadComponentInstance` 方法中的 switch 语句
3. 在 default 之前添加新的 case
4. 参考已有组件的实例化方式
5. 刷新页面测试

## 示例：添加一个新组件

```javascript
case 'DOSEComponent':
    if (typeof DOSEComponent !== 'undefined') {
        instance = new DOSEComponent(componentContainer.id, {
            // 根据组件源码确定需要的配置
        });}
    break;
```

## 总结

- ✅ 组件展示系统的框架已经完成
- ✅ 10个核心组件已经可以预览
- ⚠️ 其他组件需要根据实际需求逐步添加
- 📝 所有组件的基本信息都已配置完成

这是一个**渐进式**的展示系统，可以根据需要不断完善！