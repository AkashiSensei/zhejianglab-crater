/**
 * Copyright 2025 RAIDS Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// i18n-processed-v1.1.0
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { t } from 'i18next'
import { useAtom } from 'jotai'
import { FileCogIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import {
  SCHEDULER_ALGORITHMS,
  type SchedulerAlgorithm,
  globalSettings,
  normalizeScheduler,
} from '@/utils/store'

type SchedulerOption = {
  value: SchedulerAlgorithm
  title: string
  scene?: string
  problem?: string
}

function schedulerOptions(t: (key: string) => string): SchedulerOption[] {
  return [
    {
      value: 'volcano',
      title: t('systemSetting.scheduler.volcano'),
    },
    {
      value: 'colocate',
      title: 'DeepShare',
      scene: 'GPU 训练任务公平共享场景',
      problem: '解决多租户 GPU 集群中训练任务的配额僵化与资源浪费问题',
    },
    {
      value: 'sparse',
      title: 'Sparse',
      scene: '深度推荐任务混部调度场景',
      problem: '解决推荐模型混部时稀疏 / 稠密算子间的资源争用与性能干扰',
    },
    {
      value: 'jiagu',
      title: 'JIAGU',
      scene: 'Serverless 任务弹性伸缩场景',
      problem: '解决 Serverless 函数实例频繁冷启动带来的高延迟与资源开销',
    },
    {
      value: 'drift',
      title: 'DRIFT',
      scene: 'GPU 共享任务碎片治理场景',
      problem: '解决异构集群中 GPU 共享导致的资源碎片化与利用率低下',
    },
    {
      value: 'moarks',
      title: 'Moarks',
      scene: '多智能体推理任务跨集群编排场景',
      problem: '解决多 Agent 推理应用在异构跨集群环境下的端到端调度',
    },
  ]
}

export const Route = createFileRoute('/admin/more/')({
  component: RouteComponent,
  loader: () => ({ crumb: t('systemSetting.scheduler.title') }),
})

function RouteComponent() {
  const { t } = useTranslation()

  // Moved Zod schema to component
  const formSchema = z.object({
    scheduler: z.enum(SCHEDULER_ALGORITHMS, {
      invalid_type_error: t('systemSetting.scheduler.invalidType'),
      required_error: t('systemSetting.scheduler.required'),
    }),
  })

  type FormSchema = z.infer<typeof formSchema>

  const [settings, setSettings] = useAtom(globalSettings)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { scheduler: normalizeScheduler(String(settings.scheduler)) },
  })

  const handleSubmit = (values: FormSchema) => {
    toast.success(t('systemSetting.toast.success'))
    setSettings((prev) => ({ ...prev, ...values }))
    window.location.reload()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('systemSetting.scheduler.title')}</CardTitle>
        <CardDescription>{t('systemSetting.scheduler.description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="scheduler"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(v) =>
                        field.onChange(v as (typeof SCHEDULER_ALGORITHMS)[number])
                      }
                      className="grid gap-3"
                    >
                      {schedulerOptions(t).map((opt) => {
                        const id = `scheduler-${opt.value}`
                        return (
                          <label
                            key={opt.value}
                            htmlFor={id}
                            className="hover:bg-muted/40 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors"
                          >
                            <RadioGroupItem id={id} value={opt.value} className="mt-1" />
                            <div className="min-w-0">
                              <div className="text-sm font-semibold tracking-tight sm:text-base">
                                {opt.title}
                              </div>
                              {opt.scene && opt.problem && (
                                <div className="mt-1 space-y-1">
                                  <div className="text-foreground text-sm font-medium">
                                    {opt.scene}
                                  </div>
                                  <div className="text-muted-foreground text-sm">{opt.problem}</div>
                                </div>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="px-6 py-4">
            <Button type="submit">
              <FileCogIcon />
              {t('systemSetting.scheduler.submit')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
