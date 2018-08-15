const storage = require('electron-json-storage');

export function get(key) {
    return new Promise(function (resolve, reject) {
        storage.get(key, function (error, data) {
            if (error) return reject(error);
            resolve(data);
        });
    });
}

export function set(key, params) {
    return new Promise(function (resolve, reject) {
        storage.set(key, params, function (error) {
            if (error) return reject(error);
            resolve();
        });
    });
}