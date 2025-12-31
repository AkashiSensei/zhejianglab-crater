# 节点 CPU 标签批量打标脚本使用说明

## 脚本位置
`backend/hack/label-nodes-cpu.sh`

## 功能说明
该脚本用于为 Kubernetes 集群中的节点批量打 CPU 品牌和型号标签。

## 使用方法

### 1. 基本使用（使用默认配置）

```bash
# 直接运行脚本
bash backend/hack/label-nodes-cpu.sh

# 或者添加执行权限后运行
chmod +x backend/hack/label-nodes-cpu.sh
./backend/hack/label-nodes-cpu.sh
```

### 2. 自定义 CPU 品牌和型号

#### 方法 A: 修改脚本中的变量（推荐）

编辑 `backend/hack/label-nodes-cpu.sh`，修改以下变量：

```bash
# Hygon C86 7381 配置
CPU_BRAND_HYGON_7381="Hygon"
CPU_MODEL_HYGON_7381="C86 7381"

# Hygon C86 7390 配置
CPU_BRAND_HYGON_7390="Hygon"
CPU_MODEL_HYGON_7390="C86 7390"

# Sunway SW3231 配置
CPU_BRAND_SUNWAY="Sunway"
CPU_MODEL_SUNWAY="SW3231"
```

#### 方法 B: 通过环境变量覆盖

```bash
# 设置环境变量后运行脚本
export CPU_BRAND_HYGON_7381="Hygon"
export CPU_MODEL_HYGON_7381="C86 7381"
export CPU_BRAND_HYGON_7390="Hygon"
export CPU_MODEL_HYGON_7390="C86 7390"
export CPU_BRAND_SUNWAY="Sunway"
export CPU_MODEL_SUNWAY="SW3231"

bash backend/hack/label-nodes-cpu.sh
```

### 3. 自定义 Kubeconfig 路径

```bash
# 通过环境变量指定 kubeconfig
export KUBECONFIG="$HOME/.kube/config.zhejiang"
bash backend/hack/label-nodes-cpu.sh

# 或者在脚本中修改 KUBECONFIG 变量
```

## 节点配置

脚本中已配置的节点映射：

| 节点名称 | CPU 类型 | CPU 品牌 | CPU 型号 |
|---------|---------|---------|---------|
| zjlab-10 | HYGON_7381 | Hygon | C86 7381 |
| hg-master | HYGON_7390 | Hygon | C86 7390 |
| hg1-0 | HYGON_7390 | Hygon | C86 7390 |
| hg1-2 | HYGON_7390 | Hygon | C86 7390 |
| hg1-3 | HYGON_7390 | Hygon | C86 7390 |
| hg1-4 | HYGON_7390 | Hygon | C86 7390 |
| hg1-5 | HYGON_7390 | Hygon | C86 7390 |
| zjlab-sw | SUNWAY | Sunway | SW3231 |
| momo-pc | SUNWAY | Sunway | SW3231 |
| wfdz | SUNWAY | Sunway | SW3231 |

## 添加新节点

如果需要添加新节点，编辑脚本中的 `NODE_CPU_MAP` 变量：

```bash
declare -A NODE_CPU_MAP=(
    # 现有节点...
    ["新节点名称"]="CPU类型"  # 添加这一行
)
```

## 标签格式

脚本会为每个节点添加以下标签：
- `crater.raids-lab.io/cpu-brand`: CPU 品牌（如 "Hygon", "Sunway"）
- `crater.raids-lab.io/cpu-model`: CPU 型号（如 "C86 7390", "SW3231"）

## 验证标签

运行脚本后，可以使用以下命令验证标签：

```bash
# 查看单个节点的标签
kubectl --kubeconfig ~/.kube/config.zhejiang get node <节点名称> \
  -o jsonpath='{.metadata.labels.crater\.raids-lab\.io/cpu-brand}'
kubectl --kubeconfig ~/.kube/config.zhejiang get node <节点名称> \
  -o jsonpath='{.metadata.labels.crater\.raids-lab\.io/cpu-model}'

# 查看所有节点的 CPU 相关标签
kubectl --kubeconfig ~/.kube/config.zhejiang get nodes -o json | \
  jq -r '.items[] | "\(.metadata.name): cpu-brand=\(.metadata.labels["crater.raids-lab.io/cpu-brand"] // "N/A"), cpu-model=\(.metadata.labels["crater.raids-lab.io/cpu-model"] // "N/A")"'
```

## 注意事项

1. 脚本使用 `--overwrite` 参数，会覆盖已存在的标签
2. 如果节点不存在，脚本会跳过并继续处理其他节点
3. 确保有足够的权限修改节点标签
4. 建议先在一个测试节点上验证脚本功能

## 故障排查

### 问题：节点不存在
- 检查节点名称是否正确
- 确认节点在集群中：`kubectl get nodes`

### 问题：权限不足
- 确认当前用户有修改节点标签的权限
- 检查 RBAC 配置

### 问题：标签未生效
- 检查标签是否正确添加：`kubectl get node <节点名称> --show-labels`
- 确认标签键名正确：`crater.raids-lab.io/cpu-brand` 和 `crater.raids-lab.io/cpu-model`

