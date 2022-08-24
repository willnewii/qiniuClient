/**
 * https://github.com/tkpphr/indexed-db-helper/blob/master/src/ts/main/index.ts
 * 根据数据库中是否包含表名会自动升级数据库
 * @param dbName         数据库名称
 * @param storeNames     表名-arrays
 * @param version        数据库版本号
 */
export async function openDatabase(dbName, storeNames = [], version = undefined) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, version)
    request.onsuccess = event => {
      const db = event.target.result

      let isNeedUpdate = false
      for (let i = 0; i < storeNames.length; i++) {
        if (!db.objectStoreNames.contains(storeNames[i])) {
          isNeedUpdate = true
          break
        }
      }

      function callback(db) {
        if (db) {
          resolve(db)
        } else {
          reject(`can't open ${dbName}`)
        }
      }

      if (isNeedUpdate) {
        const version = db.version + 1
        db.close()
        openDatabase(dbName, storeNames, version).then(db => {
          callback(db)
        })
      } else {
        callback(db)
      }
    }
    request.onerror = e => {
      reject(e)
    }
    request.onblocked = () => {
      reject(`${dbName} is blocked.`)
    }
    request.onupgradeneeded = event => {
      const db = event.target.result
      for (const storeName of storeNames) {
        if (!db.objectStoreNames.contains(storeName)) {
          const objectStore = db.createObjectStore(storeName, {
            keyPath: 'key',
            // autoIncrement: true
          })

          // 创建其他索引 索引名称、索引所在的属性、配置对象（说明该属性是否包含重复的值）。
          objectStore.createIndex('key', 'key', { unique: true })
        }
      }
    }
  })
}

export async function deleteDatabase(dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName)
    request.onsuccess = () => {
      resolve()
    }
    request.onerror = () => {
      reject(`can't delete ${dbName}`)
    }
    request.onblocked = () => {
      reject(`${dbName} is blocked.`)
    }
  })
}

export async function getRecord(db, storeName, key) {
  return new Promise(async (resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const request = transaction.objectStore(storeName).get(key)
    request.onsuccess = event => {
      const record = event.target.result
      if (record) {
        resolve(record)
      } else {
        resolve(undefined)
      }
    }
    request.onerror = () => {
      reject(`can't get ${key} from ${storeName}.`)
    }
  })
}

export async function getRecords(db, storeName, keyword) {
  return new Promise((resolve, reject) => {
    let records = []
    const transaction = db.transaction(storeName, 'readonly')
    transaction.oncomplete = () => resolve(records)
    const request = transaction.objectStore(storeName).openCursor()
    request.onsuccess = event => {
      const cursor = event.target.result
      if (cursor) {
        records.push(cursor.value)
        cursor.continue()
      }
    }
    request.onerror = () => reject(`can't get records from ${storeName}`)
    /*const request = transaction.objectStore(storeName).getAll()
    request.onsuccess = (event) => {
      records = event.target.result
    }*/
  })
}

export async function putRecord(db, storeName, key, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    transaction.oncomplete = () => {
      resolve()
    }
    transaction.onerror = e => reject(e)
    transaction.objectStore(storeName).delete(key)
    transaction.objectStore(storeName).put(value)
  })
}

export async function getRecordCount(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const request = transaction.objectStore(storeName).count()
    request.onsuccess = event => {
      const count = event.target.result
      if (count) {
        resolve(count)
      } else {
        resolve(0)
      }
    }
    request.onerror = () => reject(`can't get record count from ${storeName}.`)
  })
}

export async function addRecord(db, storeName, value, isBatch) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    transaction.oncomplete = () => {
      resolve()
    }
    transaction.onerror = e => reject(e)
    if (Array.isArray(value) && isBatch) {
      for (let i = 0; i < value.length; i++) {
        transaction.objectStore(storeName).add(value[i])
      }
    } else {
      transaction.objectStore(storeName).add(value)
    }
  })
}

export async function deleteRecord(db, storeName, value, isBatch) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    transaction.oncomplete = () => {
      resolve()
    }
    transaction.onerror = e => reject(e)
    if (Array.isArray(value) && isBatch) {
      for (let i = 0; i < value.length; i++) {
        transaction.objectStore(storeName).delete(value[i].key)
      }
    } else {
      transaction.objectStore(storeName).delete(value.key)
    }
  })
}

export async function clearRecord(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    transaction.oncomplete = () => {
      resolve()
    }
    transaction.onerror = e => reject(e)
    transaction.objectStore(storeName).clear()
  })
}
