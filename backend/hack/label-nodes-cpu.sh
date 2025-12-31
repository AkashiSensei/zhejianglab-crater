#!/bin/bash
# 为集群节点打 CPU 品牌和型号标签的脚本
# 
# 使用方法:
#   1. 修改下面的 CPU_BRAND 和 CPU_MODEL 变量
#   2. 运行: bash backend/hack/label-nodes-cpu.sh
#   3. 或者: chmod +x backend/hack/label-nodes-cpu.sh && ./backend/hack/label-nodes-cpu.sh

# 注意: 不使用 set -e，因为我们需要处理预期的错误（如标签不存在）
# 只在关键错误时手动退出
set -u  # 只检查未定义的变量

# =============================================================================
# 配置区域 - 请根据实际情况修改以下变量
# =============================================================================

# Kubeconfig 文件路径
KUBECONFIG="${KUBECONFIG:-$HOME/.kube/config.zhejiang}"

# CPU 品牌和型号配置
# 格式: CPU_BRAND_<类型>="品牌名称"
#       CPU_MODEL_<类型>="型号名称"
#
# 示例:
#   CPU_BRAND_HYGON_7381="Hygon"
#   CPU_MODEL_HYGON_7381="C86 7381"
#
#   CPU_BRAND_HYGON_7390="Hygon"
#   CPU_MODEL_HYGON_7390="C86 7390"
#
#   CPU_BRAND_SUNWAY="Sunway"
#   CPU_MODEL_SUNWAY="SW3231"

# Hygon C86 7381 配置
CPU_BRAND_HYGON_7381="${CPU_BRAND_HYGON_7381:-Hygon}"
CPU_MODEL_HYGON_7381="${CPU_MODEL_HYGON_7381:-C86-7381}"

# Hygon C86 7390 配置
CPU_BRAND_HYGON_7390="${CPU_BRAND_HYGON_7390:-Hygon}"
CPU_MODEL_HYGON_7390="${CPU_MODEL_HYGON_7390:-C86-7390}"

# Sunway SW3231 配置
CPU_BRAND_SUNWAY="${CPU_BRAND_SUNWAY:-Sunway}"
CPU_MODEL_SUNWAY="${CPU_MODEL_SUNWAY:-SW3231}"

# =============================================================================
# 节点配置 - 节点名称和对应的 CPU 类型
# =============================================================================

# 定义节点和对应的 CPU 类型映射
# 格式: 节点名称:CPU类型
declare -A NODE_CPU_MAP=(
    # Hygon C86 7381 节点
    ["zjlab-10"]="HYGON_7381"
    
    # Hygon C86 7390 节点
    ["hg-master"]="HYGON_7390"
    ["hg1-0"]="HYGON_7390"
    ["hg1-2"]="HYGON_7390"
    ["hg1-3"]="HYGON_7390"
    ["hg1-4"]="HYGON_7390"
    ["hg1-5"]="HYGON_7390"
    
    # Sunway SW3231 节点
    ["zjlab-sw"]="SUNWAY"
    ["momo-pc"]="SUNWAY"
    ["wfdz"]="SUNWAY"
)

# =============================================================================
# 脚本主体
# =============================================================================

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 kubectl 是否可用
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        error "kubectl 命令未找到，请先安装 kubectl"
        return 1
    fi
    
    if [ ! -f "$KUBECONFIG" ]; then
        error "Kubeconfig 文件不存在: $KUBECONFIG"
        return 1
    fi
    
    info "使用 Kubeconfig: $KUBECONFIG"
    return 0
}

# 检查节点是否存在
check_node_exists() {
    local node_name=$1
    if ! kubectl --kubeconfig "$KUBECONFIG" get node "$node_name" &> /dev/null; then
        warning "节点 $node_name 不存在，跳过"
        return 1
    fi
    return 0
}

# 为节点打标签
label_node() {
    local node_name=$1
    local cpu_type=$2
    local cpu_brand_var="CPU_BRAND_${cpu_type}"
    local cpu_model_var="CPU_MODEL_${cpu_type}"
    
    # 获取品牌和型号
    local cpu_brand="${!cpu_brand_var}"
    local cpu_model="${!cpu_model_var}"
    
    if [ -z "$cpu_brand" ] || [ -z "$cpu_model" ]; then
        error "节点 $node_name: CPU 类型 $cpu_type 的配置不完整"
        return 1
    fi
    
    info "为节点 $node_name 打标签: CPU品牌=$cpu_brand, CPU型号=$cpu_model"
    
    # 执行打标签命令（显示错误输出以便调试）
    local kubectl_output
    kubectl_output=$(kubectl --kubeconfig "$KUBECONFIG" label nodes "$node_name" \
        "crater.raids-lab.io/cpu-brand=$cpu_brand" \
        "crater.raids-lab.io/cpu-model=$cpu_model" \
        --overwrite 2>&1)
    local kubectl_exit_code=$?
    
    if [ $kubectl_exit_code -eq 0 ]; then
        success "节点 $node_name 标签已更新: $cpu_brand $cpu_model"
        return 0
    else
        error "节点 $node_name 标签更新失败: $kubectl_output"
        return 1
    fi
}

# 验证标签
verify_labels() {
    local node_name=$1
    local cpu_brand=$(kubectl --kubeconfig "$KUBECONFIG" get node "$node_name" \
        -o jsonpath='{.metadata.labels.crater\.raids-lab\.io/cpu-brand}' 2>/dev/null || echo "")
    local cpu_model=$(kubectl --kubeconfig "$KUBECONFIG" get node "$node_name" \
        -o jsonpath='{.metadata.labels.crater\.raids-lab\.io/cpu-model}' 2>/dev/null || echo "")
    
    if [ -n "$cpu_brand" ] && [ -n "$cpu_model" ]; then
        info "节点 $node_name 当前标签: cpu-brand=$cpu_brand, cpu-model=$cpu_model"
        return 0
    else
        warning "节点 $node_name 标签未找到或为空"
        return 1
    fi
}

# 主函数
main() {
    echo "=========================================="
    echo "  集群节点 CPU 标签批量打标脚本"
    echo "=========================================="
    echo ""
    
    if ! check_kubectl; then
        error "初始化失败，退出脚本"
        return 1
    fi
    
    local success_count=0
    local fail_count=0
    local skip_count=0
    
    # 遍历所有节点
    for node_name in "${!NODE_CPU_MAP[@]}"; do
        cpu_type="${NODE_CPU_MAP[$node_name]}"
        
        echo ""
        echo "处理节点: $node_name (CPU类型: $cpu_type)"
        
        # 检查节点是否存在
        if ! check_node_exists "$node_name"; then
            skip_count=$((skip_count + 1))
            continue
        fi
        
        # 显示当前标签（忽略错误，因为标签可能不存在）
        verify_labels "$node_name" || true
        
        # 打标签
        if label_node "$node_name" "$cpu_type"; then
            success_count=$((success_count + 1))
        else
            fail_count=$((fail_count + 1))
        fi
        
        # 验证新标签（忽略错误）
        verify_labels "$node_name" || true
    done
    
    echo ""
    echo "=========================================="
    echo "  执行完成"
    echo "=========================================="
    echo "成功: $success_count 个节点"
    echo "失败: $fail_count 个节点"
    echo "跳过: $skip_count 个节点"
    echo ""
}

# 如果直接运行脚本，执行主函数
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

