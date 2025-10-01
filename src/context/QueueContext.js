// src/context/QueueContext.js
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useSQLiteContext } from 'expo-sqlite'

// --- types & constants ---
const STORAGE_KEY = 'watelec.queue.v2' // bump for safety if you had v1
const QueueContext = createContext(null)
const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

function now() {
  return Date.now()
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROCESSING':
      return { ...state, processing: action.processing }
    case 'SET_ITEMS':
      return { ...state, items: action.items }
    default:
      return state
  }
}

async function loadAll(db) {
  const rows = await db.getAllAsync(
    `SELECT id, kind, payload, status, tries, created_at, updated_at
     FROM queued_items
     ORDER BY created_at ASC`
  )
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    payload: JSON.parse(r.payload),
    status: r.status,
    tries: r.tries,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}

export function QueueProvider({ children }) {
  const db = useSQLiteContext()
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    processing: false,
  })

  // initial load
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await loadAll(db)
        if (!cancelled) dispatch({ type: 'SET_ITEMS', items })
      } catch (e) {
        console.warn('Queue initial load failed', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [db])

  // helpers
  const refresh = useCallback(async () => {
    const items = await loadAll(db)
    dispatch({ type: 'SET_ITEMS', items })
  }, [db])

  const enqueue = useCallback(
    async (item) => {
      // item: { id, kind, payload, status='pending', tries=0 }
      const t = now()
      //const { id, kind, payload, status = 'pending', tries = 0 } = item
      const { kind, payload, status = 'pending', tries = 0 } = item
      const id = item.id ?? makeId()
      await db.runAsync(
        `INSERT OR REPLACE INTO queued_items (id, kind, payload, status, tries, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id,
        kind,
        JSON.stringify(payload),
        status,
        tries,
        t,
        t
      )
      await refresh()
    },
    [db, refresh]
  )

  const remove = useCallback(
    async (id) => {
      await db.runAsync(`DELETE FROM queued_items WHERE id = ?`, id)
      await refresh()
    },
    [db, refresh]
  )

  const setStatus = useCallback(
    async (id, status, triesDelta = 0) => {
      await db.runAsync(
        `UPDATE queued_items
       SET status = ?, tries = tries  ?, updated_at = ?
       WHERE id = ?`,
        status,
        triesDelta,
        now(),
        id
      )
      await refresh()
    },
    [db, refresh]
  )

  const retry = useCallback(
    async (id) => {
      await setStatus(id, 'pending', 1)
    },
    [setStatus]
  )

  const retryAll = useCallback(async () => {
    await db.runAsync(
      `UPDATE queued_items
       SET status = 'pending', tries = tries  1, updated_at = ? 
       WHERE status = 'failed'`,
      now()
    )
    await refresh()
  }, [db, refresh])

  const update = useCallback(
    async (id, newPayload) => {
      // merge with existing payload
      const row = await db.getFirstAsync(
        `SELECT payload FROM queued_items WHERE id = ?`,
        id
      )
      const prev = row?.payload ? JSON.parse(row.payload) : {}
      const merged = { ...prev, ...newPayload }
      await db.runAsync(
        `UPDATE queued_items SET payload = ?, updated_at = ? WHERE id = ?`,
        JSON.stringify(merged),
        now(),
        id
      )
      await refresh()
      return true
    },
    [db, refresh]
  )

  // (optional) connectivity awareness (keeps your current behavior)
  useEffect(() => {
    const unsub = NetInfo.addEventListener(() => {
      // you can trigger processing here if online
    })
    return () => unsub()
  }, [])

  const value = useMemo(
    () => ({
      items: state.items,
      processing: state.processing,
      enqueue,
      remove,
      retry,
      retryAll,
      update,
      refresh,
    }),
    //[state.items, state.processing, enqueue, remove, retry, retryAll, refresh]
    [
      state.items,
      state.processing,
      enqueue,
      remove,
      retry,
      retryAll,
      update,
      refresh,
    ]
  )

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
}

export const useQueue = () => useContext(QueueContext)
