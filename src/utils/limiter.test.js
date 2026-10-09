import { describe, expect, it } from 'vitest'
import { createLimiter, mapLimit } from './limiter.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

describe('limiter', () => {
  it('nunca supera el máximo de tareas simultáneas', async () => {
    let active = 0
    let peak = 0
    const run = createLimiter(3)
    await Promise.all(
      Array.from({ length: 10 }, () =>
        run(async () => {
          active += 1
          peak = Math.max(peak, active)
          await sleep(5)
          active -= 1
        }),
      ),
    )
    expect(peak).toBe(3)
  })

  it('mapLimit conserva el orden de los resultados', async () => {
    const result = await mapLimit([30, 5, 15], 2, async (ms, i) => {
      await sleep(ms)
      return i
    })
    expect(result).toEqual([0, 1, 2])
  })

  it('propaga los errores sin trabar la cola', async () => {
    const run = createLimiter(1)
    const failing = run(async () => {
      throw new Error('boom')
    })
    const after = run(async () => 'ok')
    await expect(failing).rejects.toThrow('boom')
    await expect(after).resolves.toBe('ok')
  })
})
