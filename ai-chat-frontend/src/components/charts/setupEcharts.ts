import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, HeatmapChart, CustomChart } from 'echarts/charts'
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
        CustomChart,
        TitleComponent,
        TooltipComponent,
        LegendComponent,
        CalendarComponent,
        VisualMapComponent
    ])
}
