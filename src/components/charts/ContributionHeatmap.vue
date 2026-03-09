<template>
  <div class="heatmap-container" :style="{ height: height }">
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSetupEcharts } from './setupEcharts'
import VChart from 'vue-echarts'

const props = withDefaults(defineProps<{
  data: Array<{ date: string; count: number }>
  height?: string
}>(), {
  height: '220px'
})

useSetupEcharts()

const chartOption = computed(() => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 364) // Past 365 days

  const endStr = endDate.toISOString().split('T')[0]
  const startStr = startDate.toISOString().split('T')[0]

  // Create a map of provided data
  const dataMap = new Map()
  props.data.forEach(item => {
    dataMap.set(item.date, item.count)
  })

  // Fill in the 365 days array
  const heatmapData = []
  let current = new Date(startDate)
  while (current <= endDate) {
    const dStr = current.toISOString().split('T')[0]
    heatmapData.push([dStr, dataMap.get(dStr) || 0])
    current.setDate(current.getDate() + 1)
  }

  return {
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(20, 20, 20, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      padding: [8, 12],
      borderRadius: 8,
      textStyle: {
        color: '#f3f4f6',
        fontSize: 12,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      formatter: function (p: any) {
        const count = p.data[1]
        const date = p.data[0]
        return `
          <div style="font-weight: 600; margin-bottom: 4px; color: #fff;">
            ${count === 0 ? 'No activity' : `${count} messages`}
          </div>
          <div style="color: rgba(255,255,255,0.5); font-size: 11px;">
            ${date}
          </div>
        `
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.map(d => d[1]), 10),
      type: 'piecewise',
      orient: 'horizontal',
      left: 'right',
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 6,
      textGap: 8,
      pieces: [
        { min: 40, color: '#10b981' }, // emerald-500
        { min: 20, max: 39, color: '#34d399' }, // emerald-400
        { min: 10, max: 19, color: '#6ee7b7' }, // emerald-300
        { min: 1, max: 9, color: '#a7f3d0' },  // emerald-200
        { max: 0, color: 'rgba(255, 255, 255, 0.05)' } // empty base
      ],
      showLabel: false,
      text: ['More', 'Less'],
      textStyle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12
      }
    },
    calendar: {
      top: 30,
      left: 30,
      right: 20,
      cellSize: ['auto', 14],
      range: [startStr, endStr],
      itemStyle: {
        borderWidth: 3,
        borderColor: 'transparent',
        borderRadius: 4
      },
      splitLine: { show: false },
      yearLabel: { show: false },
      monthLabel: {
        nameMap: 'ZH',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12
      },
      dayLabel: {
        firstDay: 1,
        nameMap: 'ZH',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12
      }
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: heatmapData,
      itemStyle: {
        borderRadius: 2
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.5)',
          borderColor: 'rgba(255,255,255,0.8)',
          borderWidth: 1
        }
      }
    }
  }
})
</script>

<style scoped>
.heatmap-container {
  width: 100%;
  min-height: 220px;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>
