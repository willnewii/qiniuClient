import API from '../api/API';

let api;

export default {
    created: function () {
        api = new API(this);
    },
    methods: {
        showMessage(option) {
            switch (option.type) {
                case 'error':
                    this.$Message.error(option.message);
                    break;
                default:
                    this.$Message.info(option.message);
            }
        },
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