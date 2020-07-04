function get(key) {}

function set(key, params) {}

if (process.env.npm_package_name) {
    const storage = require("electron-json-storage")
    get = function get(key) {
        return new Promise(function (resolve, reject) {
            storage.get(key, function (error, data) {
                if (error) return reject(error)
                resolve(data)
            })
        })
    }

    set = function set(key, params) {
        return new Promise(function (resolve, reject) {
            storage.set(key, params, function (error) {
                if (error) return reject(error)
                resolve()
            })
        })
    }
}

export { get, set }
