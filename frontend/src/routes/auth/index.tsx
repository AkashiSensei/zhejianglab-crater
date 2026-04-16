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
import { createFileRoute, redirect } from '@tanstack/react-router'

import NotFound from '@/components/placeholder/not-found'

import { AuthMode } from '@/services/api/auth'

import { LoginForm } from './-components/login-form'

export const Route = createFileRoute('/auth/')({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || undefined,
    token: (search.token as string) || undefined,
  }),
  beforeLoad: ({ context, search }) => {
    // Redirect if already authenticated
    if (context.auth.isAuthenticated && !!search.redirect) {
      throw redirect({ to: search.redirect })
    }
  },
  // 验收定制版：仅启用普通登录，不再请求认证模式接口
  loader: async () => ({ authMode: AuthMode.NORMAL }),
  component: LoginPage,
  notFoundComponent: () => <NotFound />,
})

function LoginPage() {
  const searchParams = Route.useSearch()
  const auth = Route.useRouteContext().auth
  const { authMode } = Route.useLoaderData()

  return (
    <div className="bg-background flex min-h-screen w-full items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-6xl flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col items-center space-y-8">
          <div className="w-full max-w-[min(100%,90rem)] text-center">
            <div className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
              <h1 className="text-foreground inline-block px-2 text-2xl font-semibold tracking-tight whitespace-nowrap sm:text-3xl md:text-4xl">
                异构云资源的混合调度与智能运维技术课题
              </h1>
            </div>
            <p className="text-muted-foreground mt-3 text-center text-xl font-medium tracking-tight sm:text-2xl md:text-3xl">
              课题编号： 2022YFB4502003
            </p>
          </div>
          <div className="mx-auto w-full max-w-[350px] space-y-6">
            <p className="text-muted-foreground text-center text-sm">请输入您的账号和密码</p>
            <LoginForm searchParams={searchParams} login={auth.login} authMode={authMode} />
          </div>
        </div>
      </div>
    </div>
  )
}
