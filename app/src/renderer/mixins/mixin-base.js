import API from '../api/API';

let api;
let count = 0;

export default {
    created: function () {
        api = new API(this);
    },
    methods: {
        doRequset(url, param, success) {
            api.post(url, param).then((response) => {
                success(response);
            });
        },
        doRequsetGet(url, param, success) {
            api.get(url, param).then((response) => {
                count = 0;
                success(response);
            }).catch((error) => {
                if (error.response.status === 503 && count < 3) {
                    count++;
                    this.doRequsetGet(url, param, success);
                } else {
                    count = 0;
                }
            });
        },
        openBrowser(url) {
            this.$electron.shell.openExternal(url);
        }
    }
};