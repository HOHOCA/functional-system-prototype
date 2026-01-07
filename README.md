# 放射治疗计划系统原型示例

## 项目简介
本项目是多个放射治疗计划系统的高保真原型示例，采用共享组件库架构，支持不同治疗模式的计划系统。

## 产品线

### 🔵 质子治疗计划系统 (MOZI-PROTON)
**路径**: `proton-client/`
- PBS (Pencil Beam Scanning) 笔形束扫描
- 能量层优化
- Range Shifter 配置
- LET (线性能量传递) 分析
- 鲁棒性评估

📖 [查看详细文档](./proton-client/README.md)

### 🟢 后装治疗计划系统 (MOZI-BRACHY)
**路径**: `brachy-client/`
- 施源器管理（针道、球囊、模板等）
- 源活度配置
- 驻留时间优化
- 驻留位置优化
- 分次计划与累积剂量

📖 [查看详细文档](./brachy-client/README.md)

### 🔴 光子治疗计划系统 (MOZI)
**状态**: 规划中

### 🟡 放疗工坊 (RTFactory)
**状态**: 规划中

### 🟣 组件画廊 (Component Gallery)
**路径**: `component-gallery/`
- 组件列表展示与搜索
- 分类筛选（医学影像、数据分析、治疗计划等）
- 实时预览与交互测试
- 代码示例与功能说明

📖 [查看详细文档](./component-gallery/README.md)

---

## 项目架构

```
原型示例/
├── proton-client/           # 质子治疗系统
│   ├── index.html          # 入口文件
│   ├── modules/            # 质子特有模块
│   ├── styles/             # 质子特有样式（如需）
│   ├── scripts/            # 质子特有脚本（如需）
│   └── README.md
│
├── brachy-client/          # 后装治疗系统
│   ├── index.html          # 入口文件
│   ├── modules/            # 后装特有模块
│   ├── styles/             # 后装特有样式（如需）
│   ├── scripts/            # 后装特有脚本（如需）
│   └── README.md
│
├── shared/                  # 共享资源库
│   ├── scripts/
│   │   └── components/     # 通用组件 (35+ 组件)
│   │       ├── PatientManagementComponent.js  # 患者管理组件
│   │       ├── ROIComponent.js
│   │       ├── POIComponent.js
│   │       ├── DVHComponent.js
│   │       ├── SequenceTree.js
│   │       └── ...
│   ├── styles/             # 通用样式
│   │   ├── styles.css
│   │   ├── patient-management.css  # 患者管理样式
│   │   ├── styles_dvh.css
│   │   └── ...
│   └── assets/             # 通用资源
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── component-gallery/      # 组件展示系统
│   ├── index.html          # 组件画廊入口
│   ├── gallery.css
│   ├── gallery.js
│   ├── components-config.js
│   └── README.md
│
├── index.html              # 产品导航入口（选择不同产品线）
└── README.md               # 本文件
```

---

## 通用功能模块
所有产品线共享以下核心模块：

### 🩺 患者管理
**组件文件**: `shared/scripts/components/PatientManagementComponent.js`  
**样式文件**: `shared/styles/patient-management.css`

**功能特性**:
- ✅ 患者列表展示与搜索
- ✅ 表格排序（按ID、姓名、时间等）
- ✅ 分页功能
- ✅ 患者详情展示
- ✅ 患者树形结构浏览
- ✅ 患者信息导入/导出
- ✅ 底部操作按钮（导入、导出、删除、编辑、打开）

**使用示例**:
- 质子系统: `proton-client/modules/patient-management-module.html`
- 后装系统: `brachy-client/modules/patient-management-module.html`

📖 [查看详细文档](./shared/scripts/components/PatientManagement-README.md)

### 🖼️ 图像处理
- CT/MR 图像融合
- 图像配准（刚性/形变）
- 能谱CT分析
- 虚拟单能影像

### ✏️ 靶区勾画
- ROI (感兴趣区域) 管理
- POI (兴趣点) 标记
- 多种勾画工具（画刷、画笔、图形、HU值勾画等）
- 轮廓编辑（外扩/内缩、组合公式等）

### 📊 剂量评估
- DVH (剂量体积直方图)
- 剂量统计
- 三视图剂量分布
- 3D 剂量显示

---

## 技术栈
- **前端框架**: 原生 JavaScript
- **3D可视化**: Three.js
- **图标库**: Font Awesome 6.0
- **UI风格**: 深色主题专业医疗软件界面

---

## 使用指南

### 快速开始

**方式一：通过导航页面（推荐）**
```bash
# 在浏览器中打开根目录入口，选择要使用的产品线
open index.html
```

**方式二：直接访问产品线**
```bash
# 质子系统
open proton-client/index.html

# 后装系统
open brachy-client/index.html

# 组件画廊
open component-gallery/index.html
```

### 开发指南

#### 1. 添加新产品线
```bash
# 复制现有产品线作为模板
cp -r proton-client/ mozi-client/

# 修改产品标识
# 编辑 mozi-client/index.html
# - 修改 <title>
# - 修改 logo 文本
# - 调整模块配置
```

#### 2. 添加共享组件
所有产品通用的组件放在 `shared/scripts/components/`：
```javascript
// shared/scripts/components/NewComponent.js
function NewComponent() {
    // 组件逻辑
}
```

#### 3. 添加产品特有组件
某个产品独有的组件放在对应产品的 `scripts/` 目录：
```javascript
// proton-client/scripts/ProtonSpecificComponent.js
function ProtonSpecificComponent() {
    // 质子特有逻辑
}
```

---

## 组件分类策略

### ✅ 共享组件（在 shared/ 中）
- 患者管理相关：PatientInfoComponent
- 图像处理相关：SequenceTree, RegistrationComponent
- 靶区勾画相关：ROIComponent, POIComponent
- 视图相关：View3DComponent, CrossSectionView2DComponent
- 评估相关：DVHComponent, DoseStatisticsComponent

### 🔄 可能需要差异化的组件（根据实际情况调整）
- 计划设计：不同治疗模式差异较大
- 射束列表：质子PBS vs 后装源管理
- 优化设置：优化算法和参数不同

### ⚠️ 差异化处理原则
1. **初期**：所有组件都放在 shared/，快速构建原型
2. **发现差异**：某组件在不同产品中差异明显时再拆分
3. **拆分方式**：
   - 方案A：在共享组件中支持变体（推荐）
   - 方案B：复制到各产品的 scripts/ 目录独立维护

---

## 维护说明

### 更新共享组件
修改 `shared/` 中的组件会影响所有产品线，请谨慎测试。

### 添加产品特有功能
在对应产品的目录下添加，不影响其他产品。

### 路径引用规则
- 产品入口 → 共享资源：`../shared/`
- 产品模块 → 共享资源：`../../shared/`
- 共享组件路径：`shared/scripts/components/`（不是 `shared/components/`）
