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
import { atom } from 'jotai'
import { atomWithStorage, useResetAtom } from 'jotai/utils'

import { IUserAttributes } from '@/services/api/admin/user'
import { IBackendVersionInfo, IUserContext } from '@/services/api/auth'

/**
 * LocalStorage and Jotai Keys
 */
const LAST_VIEW_KEY = 'last_view'
const SETTINGS_KEY = 'settings'
const PRIVACY_ACCEPTED_KEY = 'privacy_accepted' // 新增：隐私政策同意状态

export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const VITE_UI_THEME_KEY = 'vite_ui_theme'

/**
 * Navigation BreadCrumb
 */
export type BreadCrumbItem = {
  href: string
  label: string
  back?: boolean
}

export const atomBreadcrumb = atom([] as BreadCrumbItem[])

export const atomFixedLayout = atom(false)

/**
 * User Context
 */
export type UserInfo = IUserAttributes & {
  space: string
}

export const atomUserInfo = atom<UserInfo>()
export const atomUserContext = atom<IUserContext>()
export const atomBackendVersion = atom<IBackendVersionInfo>()

/**
 * Remember the last view.
 * Will not be cleared when logout.
 */
export const globalLastView = atomWithStorage(LAST_VIEW_KEY, '', undefined, {
  getOnInit: true,
})

/** 与 Volcano（BASE）共用 vcjobs / context quota 的调度选项；jiagu / moarks / drift 暂与 BASE 等价 */
export const SCHEDULER_ALGORITHMS = [
  'volcano',
  'colocate',
  'sparse',
  'jiagu',
  'moarks',
  'drift',
] as const

export type SchedulerAlgorithm = (typeof SCHEDULER_ALGORITHMS)[number]

export function normalizeScheduler(s: string): SchedulerAlgorithm {
  if ((SCHEDULER_ALGORITHMS as readonly string[]).includes(s)) {
    return s as SchedulerAlgorithm
  }
  return 'volcano'
}

/** 是否与 Volcano（BASE）共用 vcjobs / context quota（含暂映射到 BASE 的 jiagu / moarks / drift） */
export function schedulerUsesVolcanoBackend(s: string): boolean {
  const n = normalizeScheduler(s)
  return n === 'volcano' || n === 'jiagu' || n === 'moarks' || n === 'drift'
}

export const globalSettings = atomWithStorage(
  SETTINGS_KEY,
  {
    scheduler: 'volcano' as SchedulerAlgorithm,
    hideUsername: false,
  },
  undefined,
  {
    getOnInit: true,
  }
)

/**
 * 是否已在当前浏览器同意隐私政策
 * true 表示用户已在本设备上确认过，登录页可默认勾选
 */
export const atomPrivacyAccepted = atomWithStorage<boolean>(
  PRIVACY_ACCEPTED_KEY,
  false,
  undefined,
  {
    getOnInit: true,
  }
)

export const globalJobUrl = atom((get) => {
  const scheduler = normalizeScheduler(String(get(globalSettings).scheduler))
  switch (scheduler) {
    case 'volcano':
    case 'jiagu':
    case 'moarks':
    case 'drift':
      return 'vcjobs'
    case 'colocate':
      return 'aijobs'
    case 'sparse':
      return 'spjobs'
    default:
      return 'vcjobs'
  }
})

export const globalHideUsername = atom((get) => {
  const hideUsername = get(globalSettings).hideUsername
  return hideUsername
})

/**
 * Reset all states
 */
export const useResetStore = () => {
  const resetSettings = useResetAtom(globalSettings)

  const resetAll = () => {
    // Jotai
    resetSettings()
  }

  return { resetAll }
}
