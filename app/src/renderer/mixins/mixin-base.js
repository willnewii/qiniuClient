import API from '../api/API'

let api;

export default {
    created: function () {
        api = new API(this);
    },
    methods: {
        doRequset(url, param, success){
            api.post(url, param).then((response) => {
                success(response);
            });
        },
        doRequsetGet(url, param, success){
            api.get(url, param).then((response) => {
                success(response);
            });
        },
        openBrowser(url){
            this.$electron.shell.openExternal(url);
        }
    }
}