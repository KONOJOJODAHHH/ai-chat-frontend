import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, HeatmapChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    CalendarComponent,
    VisualMapComponent
} from 'echarts/components'

export function useSetupEcharts() {
    use([
        CanvasRenderer,
        PieChart,
        HeatmapChart,
        TitleComponent,
        TooltipComponent,
        LegendComponent,
        CalendarComponent,
        VisualMapComponent
    ])
}
