import API from '../api/API';

let api;
let count = 0;

export default {
    created: function () {
        api = new API(this);
    },
    methods: {
        doRequset(url, param, success, fail) {
            this._request('post', ...arguments);
        },
        doRequsetGet(url, param, success, fail) {
            this._request('get', ...arguments);
        },
        _request(method, url, param, success, fail) {
            api[method](url, param).then((response) => {
                count = 0;
                success(response);
            }).catch((error) => {
                fail && fail(error);
            });
        },
        openBrowser(url) {
            this.$electron.shell.openExternal(url);
        }
    }
};