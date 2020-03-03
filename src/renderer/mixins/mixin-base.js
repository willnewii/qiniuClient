export default {
    methods: {
        openBrowser(url) {
            this.$electron.shell.openExternal(url);
        }
    }
};
