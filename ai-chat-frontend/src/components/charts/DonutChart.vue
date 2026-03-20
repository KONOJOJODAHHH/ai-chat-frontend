<template>
  <div class="chart-container" :style="{ height: height }">
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSetupEcharts } from './setupEcharts'
import VChart from 'vue-echarts'

const props = withDefaults(defineProps<{
  data: Array<{ name: string; count: number }>
  height?: string
}>(), {
  height: '280px'
})

useSetupEcharts()

const chartOption = computed(() => {
  const chartData = props.data.map(item => ({
    name: item.name,
    value: item.count
  }))

  const total = props.data.reduce((s, d) => s + d.count, 0)

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 15, 18, 0.92)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      textStyle: {
        color: '#e8eaf0',
        fontSize: 13,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      padding: [10, 14],
      borderRadius: 10,
      formatter: (params: any) => {
        return `
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${params.color};flex-shrink:0;"></span>
            <span style="color:rgba(255,255,255,0.55);font-size:12px;">${params.name}</span>
          </div>
          <div style="padding-left:14px;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.02em;">
            ${params.value.toLocaleString()}
            <span style="font-size:12px;font-weight:400;color:rgba(255,255,255,0.4);margin-left:4px;">${params.percent}%</span>
          </div>`
      }
    },
    legend: {
      orient: 'vertical',
      right: '4%',
      top: 'middle',
      icon: 'circle',
      itemWidth: 7,
      itemHeight: 7,
      itemGap: 13,
      formatter: (name: string) => {
        const item = props.data.find(d => d.name === name)
        const pct = total > 0 ? Math.round(((item?.count || 0) / total) * 100) : 0
        return `{nm|${name}}{pc|${pct}%}`
      },
      textStyle: {
        rich: {
          nm: {
            color: 'rgba(255,255,255,0.55)',
            fontSize: 12,
            width: 88,
            overflow: 'truncate',
          },
          pc: {
            color: 'rgba(255,255,255,0.85)',
            fontSize: 12,
            fontWeight: 700,
            align: 'right',
            width: 34,
          }
        }
      }
    },
    color: [
      '#7eb8fc',
      '#a78bfa',
      '#f9a8d4',
      '#6ee7b7',
      '#fcd34d',
      '#93c5fd',
      '#fca5a5',
    ],
    series: [
      {
        name: '调用分布',
        type: 'pie',
        radius: ['50%', '76%'],
        center: ['36%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: 'rgba(10,10,12,0.85)',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 5,
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            formatter: '{b}'
          },
          itemStyle: {
            shadowBlur: 14,
            shadowColor: 'rgba(0,0,0,0.45)',
          }
        },
        labelLine: { show: false },
        data: chartData,
        animationType: 'scale',
        animationEasing: 'cubicOut',
      }
    ]
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  min-height: 240px;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>
