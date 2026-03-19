import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CounterState {
  counters: Record<string, number>
  getNext: (shortCode: string, year: number) => number
  peek: (shortCode: string, year: number) => number
  setCounter: (shortCode: string, year: number, value: number) => void
}

function counterKey(shortCode: string, year: number): string {
  return `${shortCode}-${year}`
}

export const useCounterStore = create<CounterState>()(
  persist(
    (set, get) => ({
      counters: {},
      peek: (shortCode, year) => {
        const key = counterKey(shortCode, year)
        return (get().counters[key] ?? 0) + 1
      },
      getNext: (shortCode, year) => {
        const key = counterKey(shortCode, year)
        const current = get().counters[key] ?? 0
        const next = current + 1
        set((state) => ({
          counters: { ...state.counters, [key]: next },
        }))
        return next
      },
      setCounter: (shortCode, year, value) => {
        const key = counterKey(shortCode, year)
        set((state) => ({
          counters: { ...state.counters, [key]: value },
        }))
      },
    }),
    {
      name: 'amanthos-invoice-counters',
    },
  ),
)
