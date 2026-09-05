// db.js — IndexedDB 初始化（使用 idb wrapper）

import { openDB } from 'idb'

const DB_NAME = 'md-viewer'
const DB_VERSION = 2
const STORE_NAME = 'drafts'
const HISTORY_STORE = 'history'
const MAX_HISTORY = 50

let dbPromise = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
        if (oldVersion < 2 && !db.objectStoreNames.contains(HISTORY_STORE)) {
          db.createObjectStore(HISTORY_STORE, { keyPath: 'id' })
        }
      }
    })
  }
  return dbPromise
}

const DOC_ID = 'default'

/** 读取草稿 */
export async function loadDraft() {
  try {
    const db = await getDB()
    const doc = await db.get(STORE_NAME, DOC_ID)
    return doc?.content ?? ''
  } catch (e) {
    console.error('IndexedDB 读取失败:', e)
    return ''
  }
}

/** 写入草稿 */
export async function saveDraft(content) {
  try {
    const db = await getDB()
    await db.put(STORE_NAME, {
      id: DOC_ID,
      content,
      updatedAt: Date.now()
    })
    return true
  } catch (e) {
    console.error('IndexedDB 写入失败:', e)
    return false
  }
}

// ---- 历史记录 ----

let historySeq = 0

/**
 * 新增一条历史快照，超出上限时淘汰最旧的
 * @param {string} content
 * @returns {Promise<{ id: number, content: string, updatedAt: number }>}
 */
export async function addHistory(content) {
  const db = await getDB()
  const now = Date.now()
  const entry = {
    id: now * 1000 + (historySeq = (historySeq + 1) % 1000),
    content,
    updatedAt: now
  }
  await db.put(HISTORY_STORE, entry)
  const count = await db.count(HISTORY_STORE)
  if (count > MAX_HISTORY) {
    const keys = await db.getAllKeys(HISTORY_STORE)
    const overflow = keys.slice(0, count - MAX_HISTORY)
    await Promise.all(overflow.map((k) => db.delete(HISTORY_STORE, k)))
  }
  return entry
}

/** 按时间倒序返回全部历史 */
export async function listHistory() {
  const db = await getDB()
  const all = await db.getAll(HISTORY_STORE)
  return all.sort((a, b) => b.id - a.id)
}

/** 删除单条历史 */
export async function deleteHistory(id) {
  const db = await getDB()
  await db.delete(HISTORY_STORE, id)
}

/** 清空全部历史 */
export async function clearHistory() {
  const db = await getDB()
  await db.clear(HISTORY_STORE)
}
