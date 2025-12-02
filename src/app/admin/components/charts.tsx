
'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import { Pie, PieChart, Cell } from 'recharts';


const paymentMethodChartConfig = {
  value: {
    label: 'Transaksi',
  },
  cash: {
    label: 'Cash/COD',
    color: 'hsl(var(--chart-1))',
  },
  qris: {
    label: 'QRIS',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const cashflowChartConfig = {
    value: {
        label: 'Nilai'
    },
    sales: {
        label: 'Uang Masuk (Penjualan)',
        color: 'hsl(var(--chart-2))'
    },
    purchase: {
        label: 'Uang Keluar (Pembelian)',
        color: 'hsl(var(--chart-4))'
    }
} satisfies ChartConfig;

interface ChartProps {
    type: 'paymentMethod' | 'cashflow';
    data: Record<string, number>;
}

export function AdminDonutChart({ type, data: chartData }: ChartProps) {
    
  const { data, config } = useMemo(() => {
    if (type === 'paymentMethod') {
      return { 
          data: [
            { method: 'cash', value: chartData.cash || 0, fill: 'hsl(var(--chart-1))' },
            { method: 'qris', value: chartData.qris || 0, fill: 'hsl(var(--chart-2))' },
          ], 
          config: paymentMethodChartConfig 
      };
    }
    // cashflow
    return { 
        data: [
            { flow: 'sales', value: chartData.sales || 0, fill: 'hsl(var(--chart-2))' },
            { flow: 'purchase', value: chartData.purchase || 0, fill: 'hsl(var(--chart-4))' },
        ], 
        config: cashflowChartConfig 
    };
  }, [type, chartData]);

  const id = `donut-chart-${type}`;

  // Don't render chart if all data points are zero
  const totalValue = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);
  if(totalValue === 0) {
      return (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
              Tidak ada data untuk ditampilkan.
          </div>
      )
  }

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
            nameKey={type === 'paymentMethod' ? 'method' : 'flow'}
            innerRadius={60}
            strokeWidth={5}
          >
             {data.map((entry) => (
                <Cell key={entry[type === 'paymentMethod' ? 'method' : 'flow']} fill={entry.fill} />
             ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
