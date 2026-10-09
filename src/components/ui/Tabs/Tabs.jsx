import { createContext, useContext, useId, useRef } from 'react'
import { cn } from '../../../utils/cn.js'
import Text from '../Text/Text.jsx'
import styles from './Tabs.module.css'

const TabsContext = createContext(null)

/**
 * Pestañas primarias de M3 (48dp) con su contenido. Un solo componente maneja las pestañas y los paneles:
 *
 *   <Tabs label="Afinar la playlist" value={tab} onChange={setTab}
 *         tabs={[{ value: 'moods', label: 'Moods', badge: '2/4' }, { value: 'genres', label: 'Géneros' }]}>
 *     <TabPanel value="moods">…</TabPanel>
 *     <TabPanel value="genres">…</TabPanel>
 *   </Tabs>
 *
 * Teclado: flechas izquierda/derecha, Inicio y Fin cambian de pestaña (activación automática).
 * Solo se dibuja el panel de la pestaña activa.
 */
export default function Tabs({ label, tabs, value, onChange, children, className }) {
  const baseId = useId()
  const listRef = useRef(null)

  const move = (event, index) => {
    const lastIndex = tabs.length - 1
    const next =
      event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? lastIndex
      : null
    if (next === null) return
    event.preventDefault()
    onChange(tabs[next].value)
    listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus()
  }

  return (
    <TabsContext.Provider value={{ baseId, value }}>
      <div className={cn(styles.tabs, className)}>
        <div ref={listRef} role="tablist" aria-label={label} className={styles.list}>
          {tabs.map((tab, index) => {
            const selected = tab.value === value
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.value}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${tab.value}`}
                tabIndex={selected ? 0 : -1}
                className={cn(styles.tab, selected && styles.selected)}
                onClick={() => onChange(tab.value)}
                onKeyDown={(event) => move(event, index)}
              >
                <span className={styles.label}>
                  <Text variant="title-small">{tab.label}</Text>
                  {tab.badge != null && (
                    <Text variant="label-small" className={styles.badge}>
                      {tab.badge}
                    </Text>
                  )}
                </span>
                <span className={styles.indicator} aria-hidden="true" />
              </button>
            )
          })}
        </div>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

/** Contenido de una pestaña. Se dibuja solo cuando su pestaña está activa. */
export function TabPanel({ value, children, className }) {
  const context = useContext(TabsContext)
  if (!context || context.value !== value) return null
  return (
    <div
      role="tabpanel"
      id={`${context.baseId}-panel-${value}`}
      aria-labelledby={`${context.baseId}-tab-${value}`}
      className={cn(styles.panel, className)}
    >
      {children}
    </div>
  )
}
