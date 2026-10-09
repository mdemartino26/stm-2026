import { PERIODS } from '../../../config/constants.js'
import { ChipGroup, FilterChip } from '../../ui'

/** Chips para elegir el período del ranking (7 días, 1 mes, …, siempre). */
export default function PeriodFilter({ value, onChange }) {
  return (
    <ChipGroup label="Período">
      {PERIODS.map((period) => (
        <FilterChip key={period.value} selected={period.value === value} onClick={() => onChange(period.value)}>
          {period.label}
        </FilterChip>
      ))}
    </ChipGroup>
  )
}
