import API from '../api/API';

let api;

export default {
    created: function () {
        api = new API(this);
    },
    methods: {
        doRequset(url, param, success, fail) {
            this._request('get', ...arguments);
        },
        doRequsetPost(url, param, success, fail) {
            this._request('post', ...arguments);
        },
        _request(method, url, param, success, fail) {
            api[method](url, param).then((response) => {
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