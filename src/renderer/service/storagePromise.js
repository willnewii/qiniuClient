let get, set
if (typeof window !== "undefined") {
    const storage = require("electron-json-storage")
    get = function (key) {
        return new Promise(function (resolve, reject) {
            storage.get(key, function (error, data) {
                if (error) return reject(error)
                resolve(data)
            })
        })
    }

    set = function (key, params) {
        return new Promise(function (resolve, reject) {
            storage.set(key, params, function (error) {
                if (error) return reject(error)
                resolve()
            })
        })
    }
} else {
    get = () => {}
    set = () => {}
}

export { get, set }
