<style scoped>

</style>
<template>
    <div>
        <div>上传记录</div>
        <div></div>
        <div>{{logs}}</div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import * as types from '../vuex/mutation-types'
    import * as util from '../util/util'
    import qiniu from 'qiniu'
    import storage from 'electron-json-storage'

    let ipc;
    export default {
        name: 'tray-page',
        data(){
            return {
                files: [],
                logs: [],
                current: 1,
            }
        },
        computed: {
            ...mapGetters({
                bucket_name: types.APP.setup_bucket_name,
                bucket_dir: types.APP.setup_bucket_dir,
            })
        },
        created(){
            this[types.APP.app_a_setup_init]();
            ipc = this.$electron.ipcRenderer;

            storage.get(types.APP.qiniu_key, (error, data) => {
                if (!error) {
                    if (data.access_key && data.secret_key) {
                        qiniu.conf.ACCESS_KEY = data.access_key;
                        qiniu.conf.SECRET_KEY = data.secret_key;
                    } else {
                    }
                }
            });

            ipc.on('upload-Files', (event, files) => {
                console.log(files);
                this.files = files;

                this.doUploadFile();
            });

            ipc.on('log', (event, log) => {
                console.log(log);
            })
        },
        methods: {
            ...mapActions([
                types.APP.app_a_setup_init,
            ]),
            updateStatus(title){
                ipc.send('upload-tray-title', title);
            },
            sendNotify(){
                ipc.send('show-Notifier', {
                    title: 'qiniu-client',
                    message: '上传完成  (＾－＾)V',
                    icon: 'notify-success.png'
                });
            },
            doUploadFile(){
                if (this.current > this.files.length) {
                    this.updateStatus('');
                    this.current = 1;
                    this.sendNotify();
                } else {
                    this.updateStatus(`${this.current}/${this.files.length}`);
                    this.uploadFile(this.files[this.current - 1]);
                }
            },
            uploadFile(filePath){
                let key = this.bucket_dir + '/' + util.getName(filePath);
                let uptoken = new qiniu.rs.PutPolicy(this.bucket_name + ":" + key).token();
                let extra = new qiniu.io.PutExtra();

                let log = {
                    path: filePath,
                    key: key
                };
                try {
                    qiniu.io.putFile(uptoken, key, filePath, extra, (err, ret, res) => {
                        this.handleResult(log, err);
                    });
                } catch (err) {
                    this.handleResult(log, err);
                }
            },
            handleResult(log, err){
                window.error = err;
                if (!err) {//ret.key
                    log.code = 0;
                } else {
                    console.log(err);
                    log.code = err.statusCode;
                    log.error = err.body;
                }
                this.logs.push(log);
                this.current = this.current + 1;
                this.doUploadFile();
            }
        }
    }
</script>

