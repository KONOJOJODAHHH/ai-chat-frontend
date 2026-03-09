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

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(20, 20, 20, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#f3f4f6',
        fontSize: 13,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      padding: [12, 16],
      borderRadius: 12,
      backdropFilter: 'blur(10px)',
      formatter: (params: any) => {
        return `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display:inline-block;margin-right:4px;border-radius:50%;width:8px;height:8px;background-color:${params.color};"></span>
            <span style="font-weight: 500">${params.name}</span>
          </div>
          <div style="margin-top: 6px; font-weight: 700; font-size: 15px; color: #fff;">
            ${params.value} 次 <span style="font-size: 12px; color: rgba(255,255,255,0.5); font-weight: normal;">(${params.percent}%)</span>
          </div>
        `
      }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'middle',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 16,
      textStyle: {
        rich: {
          name: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 13,
            width: 100
          },
          value: {
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            align: 'right'
          }
        }
      }
    },
    color: [
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#3b82f6', // Blue
      '#ef4444'  // Red
    ],
    series: [
      {
        name: '模型调用',
        type: 'pie',
        radius: ['55%', '85%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 14,
          borderColor: '#111111',
          borderWidth: 3
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          scaleSize: 8,
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff',
            formatter: '{b}'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx: number) {
          return Math.random() * 200;
        }
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
