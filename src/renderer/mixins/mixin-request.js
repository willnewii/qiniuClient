import API from '../api/API';

let api;

export default {
    methods: {
        doRequset(url, param, success, fail) {
            this._request('get', ...arguments);
        },
        doRequsetPost(url, param, success, fail) {
            this._request('post', ...arguments);
        },
        _request(method, url, param, success, fail) {
            if (!api) {
                api = new API(this);
            }
            api[method](url, param).then((response) => {
                success(response);
            }).catch((error) => {
                fail && fail(error);
            });
        },
    }
};
