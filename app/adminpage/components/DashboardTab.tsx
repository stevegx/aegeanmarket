'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  UserGroupIcon,
  ShoppingCart01Icon,
  MoneyBagIcon,
  Analytics01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import type { AdminStats } from '@/lib/db'
import { STATUS_META, TONE_CLASSES } from './statusMeta'

const GROUP_ACCENT: Record<string, string> = {
  dark: 'border-t-aegean-dark',
  blue: 'border-t-aegean-blue',
  green: 'border-t-aegean-green',
}

interface DashboardTabProps {
  stats: AdminStats
  analyticsUrl?: string
}

function formatDay(date: string) {
  const [, month, day] = date.split('-')
  return `${day}/${month}`
}

export default function DashboardTab({
  stats,
  analyticsUrl,
}: DashboardTabProps) {
  const totalOrders = Object.values(stats.ordersByStatus).reduce(
    (a, b) => a + b,
    0
  )
  const totalRevenue30d = stats.trends.reduce((sum, t) => sum + t.revenue, 0)

  return (
    <div className="w-full flex flex-col gap-6">
      {analyticsUrl && (
        <a
          href={analyticsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between gap-3 rounded-lg bg-gradient-to-r from-aegean-dark to-aegean-blue px-5 py-4 text-aegean-white shadow-sm transition-transform hover:scale-[1.01]"
        >
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} className="size-6" />
            <div>
              <p className="text-base font-bold">Traffic</p>
              <p className="text-sm text-aegean-light">
                View site traffic in Vercel Analytics
              </p>
            </div>
          </div>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="size-6 transition-transform group-hover:translate-x-1"
          />
        </a>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <GroupCard
          accent="dark"
          icon={UserGroupIcon}
          title="Users"
          statsRow={
            <>
              <StatTile label="Registered" value={stats.totalUsers} tone="dark" />
              <StatTile
                label="New today"
                value={stats.newUsersToday}
                tone="green"
                highlight
              />
            </>
          }
        >
          <TrendChart
            data={stats.trends}
            dataKey="newUsers"
            color="var(--color-aegean-dark)"
          />
        </GroupCard>

        <GroupCard
          accent="blue"
          icon={ShoppingCart01Icon}
          title="Orders"
          statsRow={
            <>
              <StatTile label="Total" value={totalOrders} tone="neutral" />
              {(
                Object.keys(STATUS_META) as Array<
                  keyof AdminStats['ordersByStatus']
                >
              ).map((status) => (
                <StatTile
                  key={status}
                  label={STATUS_META[status].label}
                  value={stats.ordersByStatus[status] ?? 0}
                  tone={STATUS_META[status].tone}
                  highlight={status === 'delivered' || status === 'cancelled'}
                />
              ))}
            </>
          }
        >
          <TrendChart
            data={stats.trends}
            dataKey="orders"
            color="var(--color-aegean-blue)"
          />
        </GroupCard>

        <GroupCard
          accent="green"
          icon={MoneyBagIcon}
          title="Revenue"
          statsRow={
            <StatTile
              label="Last 30 days"
              value={`€${totalRevenue30d.toFixed(0)}`}
              tone="green"
              highlight
              wide
            />
          }
        >
          <TrendChart
            data={stats.trends}
            dataKey="revenue"
            color="var(--color-aegean-green)"
            formatValue={(v) => `€${v.toFixed(0)}`}
          />
        </GroupCard>
      </div>
    </div>
  )
}

function GroupCard({
  accent,
  icon,
  title,
  statsRow,
  children,
}: {
  accent: 'dark' | 'blue' | 'green'
  icon: typeof UserGroupIcon
  title: string
  statsRow: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className={cn('h-full w-full border-t-4', GROUP_ACCENT[accent])}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2.5">{statsRow}</div>
        <div className="h-72 w-full">{children}</div>
      </CardContent>
    </Card>
  )
}

function StatTile({
  label,
  value,
  tone = 'neutral',
  highlight,
  wide,
}: {
  label: string
  value: number | string
  tone?: string
  highlight?: boolean
  wide?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center gap-1 rounded-md px-3.5 py-2.5',
        TONE_CLASSES[tone] ?? TONE_CLASSES.neutral,
        wide ? 'w-full' : 'flex-1 min-w-[7rem]'
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </span>
      <span className={cn('font-bold', highlight ? 'text-2xl' : 'text-lg')}>
        {value}
      </span>
    </div>
  )
}

function TrendChart({
  data,
  dataKey,
  color,
  formatValue,
}: {
  data: AdminStats['trends']
  dataKey: 'orders' | 'newUsers' | 'revenue'
  color: string
  formatValue?: (value: number) => string
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fontSize: 12 }}
          interval={4}
        />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} width={34} />
        <Tooltip
          labelFormatter={(label) => formatDay(String(label))}
          formatter={(value) => [
            formatValue ? formatValue(Number(value)) : Number(value),
            '',
          ]}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
