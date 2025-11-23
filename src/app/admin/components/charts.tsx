'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import { Pie, PieChart, Cell } from 'recharts';

const paymentMethodData = [
  { method: 'Cash', value: 45, fill: 'hsl(var(--chart-1))' },
  { method: 'QRIS', value: 55, fill: 'hsl(var(--chart-2))' },
];

const cashflowData = [
    { type: 'initial_capital', value: 25, fill: 'hsl(var(--chart-1))' },
    { type: 'purchase_stock', value: 40, fill: 'hsl(var(--chart-4))' },
    { type: 'sales', value: 35, fill: 'hsl(var(--chart-2))' },
]

const paymentMethodChartConfig = {
  value: {
    label: 'Transaksi',
  },
  Cash: {
    label: 'Cash',
    color: 'hsl(var(--chart-1))',
  },
  QRIS: {
    label: 'QRIS',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const cashflowChartConfig = {
    value: {
        label: 'Nilai'
    },
    initial_capital: {
        label: 'Initial Capital',
        color: 'hsl(var(--chart-1))'
    },
    purchase_stock: {
        label: 'Purchase Stock',
        color: 'hsl(var(--chart-4))'
    },
    sales: {
        label: 'Sales',
        color: 'hsl(var(--chart-2))'
    }
} satisfies ChartConfig;

export function AdminDonutChart({ type }: { type: 'paymentMethod' | 'cashflow' }) {
    
  const { data, config } = useMemo(() => {
    if (type === 'paymentMethod') {
      return { data: paymentMethodData, config: paymentMethodChartConfig };
    }
    return { data: cashflowData, config: cashflowChartConfig };
  }, [type]);

  const id = `donut-chart-${type}`;
  const totalValue = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);


  return (
    <div className="flex items-center justify-center">
      <ChartContainer
        id={id}
        config={config}
        className="mx-auto aspect-square h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey={type === 'paymentMethod' ? 'method' : 'type'}
            innerRadius={60}
            strokeWidth={5}
          >
             <Cell key="total" fill="var(--color-total)" />
             {data.map((entry) => (
                <Cell key={entry[type === 'paymentMethod' ? 'method' : 'type']} fill={entry.fill} />
             ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
