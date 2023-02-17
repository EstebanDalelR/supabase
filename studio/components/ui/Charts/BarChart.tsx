import { useState } from 'react'
import {
  BarChart as RechartBarChart,
  XAxis,
  Tooltip,
  Bar,
  Cell,
} from 'recharts'
import dayjs from 'dayjs'
import { CHART_COLORS, DateTimeFormats } from 'components/ui/Charts/Charts.constants'
import ChartHeader from './ChartHeader'
import { Datum, CommonChartProps } from './Charts.types'
import utc from 'dayjs/plugin/utc'
import ChartNoData from './NoDataPlaceholder'
import { numberFormatter, useChartSize } from './Charts.utils'
dayjs.extend(utc)

export interface BarChartProps<D = Datum> extends CommonChartProps<D> {
  yAxisKey: string
  xAxisKey: string
  format?: string
  customDateFormat?: string
  displayDateInUtc?: boolean
  onDatumClick?: (datum: Datum) => void
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  yAxisKey,
  xAxisKey,
  format,
  customDateFormat = DateTimeFormats.FULL,
  title,
  highlightedValue,
  highlightedLabel,
  displayDateInUtc,
  minimalHeader,
  className = '',
  size = 'normal',
  onDatumClick,
}) => {
  const { Container } = useChartSize(size)
  const [focusDataIndex, setFocusDataIndex] = useState<number | null>(null)

  if (data.length === 0) return <ChartNoData className={className} />

  const day = (value: number | string) => (displayDateInUtc ? dayjs(value).utc() : dayjs(value))
  const resolvedHighlightedLabel =
    (focusDataIndex !== null &&
      data &&
      data[focusDataIndex] &&
      day(data[focusDataIndex][xAxisKey]).format(customDateFormat)) ||
    highlightedLabel

  const resolvedHighlightedValue =
    (focusDataIndex !== null ? data[focusDataIndex]?.[yAxisKey] : null) || highlightedValue

  return (
    <div className={['flex flex-col gap-3', className].join(' ')}>
      <ChartHeader
        title={title}
        format={format}
        customDateFormat={customDateFormat}
        highlightedValue={
          typeof resolvedHighlightedValue === 'number'
            ? numberFormatter(resolvedHighlightedValue)
            : resolvedHighlightedValue
        }
        highlightedLabel={resolvedHighlightedLabel}
        minimalHeader={minimalHeader}
      />
      <Container>
        <RechartBarChart
          data={data}
          margin={{
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          }}
          className="overflow-visible"
          //   mouse hover focusing logic
          onMouseMove={(e: any) => {
            if (e.activeTooltipIndex !== focusDataIndex) {
              setFocusDataIndex(e.activeTooltipIndex)
            }
          }}
          onMouseLeave={() => setFocusDataIndex(null)}
        >
          <XAxis
            dataKey={xAxisKey}
            interval={data.length - 2}
            angle={0}
            // hide the tick
            tick={{ fontSize: '0px' }}
            // color the axis
            axisLine={{ stroke: CHART_COLORS.AXIS }}
            tickLine={{ stroke: CHART_COLORS.AXIS }}
          />
          <Tooltip content={() => null} />
          <Bar
            dataKey={yAxisKey}
            fill={CHART_COLORS.GREEN_1}
            animationDuration={300}
            // max bar size required to prevent bars from expanding to max width.
            maxBarSize={48}
          >
            {data?.map((_entry: Datum, index: any) => (
              <Cell
                key={`cell-${index}`}
                className={`transition-all duration-300 ${onDatumClick ? 'cursor-pointer' : ''}`}
                fill={
                  focusDataIndex === index || focusDataIndex === null
                    ? CHART_COLORS.GREEN_1
                    : CHART_COLORS.GREEN_2
                }
                enableBackground={12}
              />
            ))}
          </Bar>
        </RechartBarChart>
      </Container>
      {data && (
        <div className="text-scale-900 -mt-5 flex items-center justify-between text-xs">
          <span>{dayjs(data[0][xAxisKey]).format(customDateFormat)}</span>
          <span>{dayjs(data[data?.length - 1]?.[xAxisKey]).format(customDateFormat)}</span>
        </div>
      )}
    </div>
  )
}
export default BarChart