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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  SCHEDULER_ALGORITHMS,
  type SchedulerAlgorithm,
  globalSettings,
  normalizeScheduler,
} from '@/utils/store'

function schedulerOptionLabel(value: SchedulerAlgorithm, t: (key: string) => string): string {
  switch (value) {
    case 'volcano':
      return t('systemSetting.scheduler.volcano')
    case 'colocate':
      return 'DEEPSHARE'
    case 'sparse':
      return 'SPARSE'
    case 'jiagu':
      return 'JIAGU'
    case 'moarks':
      return 'MOARKS'
    case 'drift':
      return 'DRIFT'
  }
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="">
                        <SelectValue placeholder={t('systemSetting.scheduler.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHEDULER_ALGORITHMS.map((value) => (
                          <SelectItem key={value} value={value}>
                            {schedulerOptionLabel(value, t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
