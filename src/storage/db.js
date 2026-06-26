// db.js — IndexedDB 初始化（使用 idb wrapper）

import { openDB } from 'idb'

const DB_NAME = 'md-viewer'
const DB_VERSION = 1
const STORE_NAME = 'drafts'

let dbPromise = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
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
