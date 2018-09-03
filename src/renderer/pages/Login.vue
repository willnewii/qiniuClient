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
        <h3 class="title">设置七牛云密钥</h3>
        <Form :model="formItem" ref="formItem" :rules="ruleItem" :label-width="150">
            <Form-item label="ACCESS_KEY" prop="access_key">
                <Input v-model="formItem.access_key" placeholder="请填入你的ACCESS_KEY"/>
            </Form-item>
            <Form-item label="SECRET_KEY" prop="secret_key">
                <Input v-model="formItem.secret_key" placeholder="请填入你的SECRET_KEY"/>
            </Form-item>
            <Form-item>
                <Button type="primary" @click="handleSubmit('formItem')">设置</Button>
                <Button type="ghost" @click="handleReset('formItem')" style="margin-left: 8px">重置</Button>
            </Form-item>
            <div style="margin-left: 150px">＊如何获取密钥信息:<a @click="openBrowser">登录七牛云</a>->个人面板->密钥管理
            </div>
        </Form>
    </div>
</template>
<script>
    import {Constants, mixins} from '../service';

    export default {
        mixins: [mixins.base],
        data() {
            return {
                formItem: {
                    access_key: 'AKIDX2MTQBZFVedUAeo2RjqmpjU4TgrrAGiz',
                    secret_key: 'EJCyYv65tWxBE6lEWcVCgy4xe9TaWGqD',
                },
                ruleItem: {
                    access_key: [{required: true, message: 'access_key不能为空', trigger: 'blur'}],
                    secret_key: [{required: true, message: 'secret_key不能为空', trigger: 'blur'}]
                }
            };
        },
        computed: {},
        created: function () {
        },
        methods: {
            handleSubmit(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.validateKey(this.formItem.access_key, this.formItem.secret_key);
                    } else {
                        console.log('表单不能提交');
                    }
                });
            },
            handleReset(name) {
                this.$refs[name].resetFields();
            },
            validateKey(access_key, secret_key) {
                this.$storage.cos.init({access_key: access_key, secret_key: secret_key});
                this.$storage.getBuckets((error, result) => {
                    if (error) {
                        this.$Notice.error({
                            title: '啊哦~',
                            desc: error.message
                        });
                    } else {
                        this.$storage.saveCosKey({
                            access_key: access_key,
                            secret_key: secret_key
                        }, () => {
                            this.$router.push({name: Constants.PageName.main});
                        });
                    }
                    console.log(error, result);
                });
            },
            openBrowser() {
                this.$electron.shell.openExternal('https://portal.qiniu.com/user/key');
            }
        }
    };
</script>