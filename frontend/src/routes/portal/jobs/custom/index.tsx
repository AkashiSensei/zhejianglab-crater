import { createFileRoute } from '@tanstack/react-router'
import { t } from 'i18next'

import VolcanoOverview from '@/components/job/overview/custom-jobs'

export const Route = createFileRoute('/portal/jobs/custom/')({
  loader: () => {
    return {
      crumb: t('navigation.customJobs'),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  // 临时策略：始终展示 Volcano/BASE 作业视图，避免切换调度算法后
  // Colocate(EMIAS) 分支触发 aijobs 路由缺失导致页面报错
  return <VolcanoOverview />
}
