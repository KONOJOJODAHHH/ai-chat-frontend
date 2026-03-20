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
  startDate.setDate(endDate.getDate() - 364)

  const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const endStr = formatDate(endDate)
  const startStr = formatDate(startDate)

  const dataMap = new Map<string, number>()
  props.data.forEach(item => dataMap.set(item.date, item.count))

  const heatmapData: [string, number][] = []
  const current = new Date(startDate)
  while (current <= endDate) {
    const dStr = formatDate(current)
    heatmapData.push([dStr, dataMap.get(dStr) || 0])
    current.setDate(current.getDate() + 1)
  }

  const maxVal = Math.max(...heatmapData.map(d => d[1]), 4)
  const th1 = Math.max(1, maxVal * 0.25)
  const th2 = Math.max(2, maxVal * 0.5)
  const th3 = Math.max(3, maxVal * 0.75)

  return {
    tooltip: {
      appendToBody: true,
      position: 'top',
      backgroundColor: 'rgba(15, 15, 18, 0.92)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      padding: [8, 12],
      borderRadius: 8,
      textStyle: {
        color: '#e8eaf0',
        fontSize: 12,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      formatter: (p: any) => {
        const count = p.data[1]
        const date = p.data[0]
        return `
          <div style="font-weight:700;margin-bottom:3px;color:#fff;font-size:13px;">
            ${count === 0 ? '无会话' : `${count} 条会话`}
          </div>
          <div style="color:rgba(255,255,255,0.4);font-size:11px;">${date}</div>`
      }
    },
    visualMap: {
      min: 0,
      max: maxVal,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'right',
      bottom: 0,
      itemWidth: 11,
      itemHeight: 11,
      itemGap: 5,
      textGap: 6,
      pieces: [
        { min: th3, color: '#3b82f6' },
        { min: th2, max: th3, color: '#60a5fa' },
        { min: th1, max: th2, color: '#93c5fd' },
        { min: 1, max: th1, color: '#bfdbfe' },
        { value: 0, color: 'rgba(255, 255, 255, 0.05)' }
      ],
      showLabel: false,
      text: ['多', '少'],
      textStyle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
      }
    },
    calendar: {
      top: 25,
      left: 28,
      right: 15,
      bottom: 40,
      cellSize: ['auto', 13],
      range: [startStr, endStr],
      itemStyle: {
        color: 'transparent',
        borderWidth: 0
      },
      splitLine: { show: false },
      yearLabel: { show: false },
      monthLabel: {
        nameMap: 'ZH',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        margin: 10
      },
      dayLabel: {
        firstDay: 1,
        nameMap: 'ZH',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        show: true,
      }
    },
    series: {
      type: 'custom',
      coordinateSystem: 'calendar',
      renderItem: function (params: any, api: any) {
        const cellPoint = api.coord(api.value(0));
        if (!cellPoint || isNaN(cellPoint[0]) || isNaN(cellPoint[1])) {
          return;
        }
        const cellWidth = params.coordSys.cellWidth;
        const cellHeight = params.coordSys.cellHeight;
        
        const width = Math.max(1, cellWidth - 2.5);
        const height = Math.max(1, cellHeight - 2.5);
        
        const style = api.style();
        // 强制确保如果匹配不到颜色（或被映射为透明）时兜底为灰色
        if (!style.fill || style.fill === '#000' || style.fill === 'transparent') {
          style.fill = 'rgba(255, 255, 255, 0.05)';
        }

        return {
          type: 'rect',
          style: style,
          shape: {
            x: cellPoint[0] - width / 2,
            y: cellPoint[1] - height / 2,
            width: width,
            height: height,
            r: 3
          }
        };
      },
      data: heatmapData,
      emphasis: {
        itemStyle: {
          shadowBlur: 8,
          shadowColor: 'rgba(59, 130, 246, 0.5)',
        }
      }
    }
  }
})
</script>

<style scoped>
.heatmap-container {
  width: 100%;
  min-height: 195px;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>
