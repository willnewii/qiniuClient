<style scoped>
    .layout {
        padding: 20%;
    }

    .title {
        width: 100%;

        text-align: center;
        padding: 10px;
    }
</style>
<template>
    <div class="layout">
        <h3 class="title">设置七牛KEY信息</h3>
        <Form :model="formItem" ref="formItem" :rules="ruleItem" :label-width="150">
            <Form-item label="ACCESS_KEY" prop="access_key">
                <Input v-model="formItem.access_key" placeholder="请填入你的ACCESS_KEY"></Input>
            </Form-item>
            <Form-item label="SECRET_KEY" prop="secret_key">
                <Input v-model="formItem.secret_key" placeholder="请填入你的SECRET_KEY"></Input>
            </Form-item>
            <Form-item>
                <Button type="primary" @click="handleSubmit('formItem')">设置</Button>
                <Button type="ghost" @click="handleReset('formItem')" style="margin-left: 8px">重置</Button>
            </Form-item>
        </Form>
    </div>
</template>
<script>
    import * as cloudStorage from '../util/cloudStorage'
    const storage = require('electron-json-storage');

    import api from '../api/API'
    let API;

    export default {
        data () {
            return {
                formItem: {
                    access_key: '',
                    secret_key: ''
                },
                ruleItem: {
                    access_key: [{required: true, message: 'access_key不能为空', trigger: 'blur'}],
                    secret_key: [{required: true, message: 'secret_key不能为空', trigger: 'blur'}]
                },
                spanLeft: 5,
                spanRight: 19
            }
        },
        computed: {
            iconSize () {
                return this.spanLeft === 5 ? 14 : 24;
            }
        },
        created: function () {
            API = new api(this);
        },
        methods: {
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.validateToken(this.formItem.access_key, this.formItem.secret_key)
                    } else {
                        console.log('表单不能提交');
                    }
                })
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            },
            validateToken(access_key, secret_key){
                cloudStorage.init({access_key: access_key, secret_key: secret_key});

                API.get(API.method.getBuckets).then((response) => {
                    storage.set('qiniu_key', {
                        access_key: access_key,
                        secret_key: secret_key
                    }, (error) => {
                        console.log(error);
                        if (!error) {
                            this.$router.push({path: '/'});
                        }
                    });
                }).catch((error) => {
                    console.log(error);
                    this.$Notice.error({
                        title: '抱歉',
                        desc: '七牛key设置失败.请检查你输入的key.' + error.toString()
                    });
                });
            },
            toggleClick () {
                if (this.spanLeft === 5) {
                    this.spanLeft = 2;
                    this.spanRight = 22;
                } else {
                    this.spanLeft = 5;
                    this.spanRight = 19;
                }
            }
        }
    }
</script>