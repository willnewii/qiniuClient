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
        <Tabs type="card" @on-click="onTabClick">
            <TabPane v-for="(item,index) in brands" :name="item.key" :label="item.name">
                <h3 class="title">设置{{item.name}}密钥</h3>
                <Form :model="formItem" :ref="item.key" :rules="ruleItem" :label-width="150">
                    <Form-item label="ACCESS_KEY" prop="access_key">
                        <Input v-model="formItem.access_key" placeholder="请填入你的ACCESS_KEY"/>
                    </Form-item>
                    <Form-item label="SECRET_KEY" prop="secret_key">
                        <Input v-model="formItem.secret_key" placeholder="请填入你的SECRET_KEY"/>
                    </Form-item>
                    <Form-item>
                        <Button type="primary" @click="handleSubmit(item.key)">设置</Button>
                        <Button @click="handleReset(item.key)" style="margin-left: 8px">重置</Button>
                    </Form-item>
                    <div v-if="item.key === brands[0].key" style="margin-left: 150px">＊如何获取密钥信息:登录<a
                            @click="openBrowser('https://portal.qiniu.com/user/key')">{{item.name}}</a>->个人面板->密钥管理
                    </div>
                    <div v-else-if="item.key === brands[1].key" style="margin-left: 150px">＊如何获取密钥信息:登录<a
                            @click="openBrowser('https://console.cloud.tencent.com/cos5')">{{item.name}}</a>->密钥管理
                    </div>
                </Form>
            </TabPane>
        </Tabs>
    </div>
</template>
<script>
    import {Constants, mixins} from '../service';
    import brand from '@/cos/brand';

    export default {
        mixins: [mixins.base],
        data() {
            return {
                cos_key: brand.qiniu.key,
                formItem: {
                    access_key: '',
                    secret_key: '',
                },
                ruleItem: {
                    access_key: [{required: true, message: 'access_key不能为空', trigger: 'blur'}],
                    secret_key: [{required: true, message: 'secret_key不能为空', trigger: 'blur'}]
                },
                brands: [brand.qiniu, brand.tencent]
            };
        },
        computed: {},
        created: function () {
        },
        methods: {
            onTabClick(name) {
                this.cos_key = name;
                this.handleReset(name);
            },
            handleSubmit(name) {
                this.$refs[name][0].validate((valid) => {
                    if (valid) {
                        this.validateKey(this.formItem.access_key, this.formItem.secret_key);
                    } else {
                        console.log('表单不能提交');
                    }
                });
            },
            handleReset(name) {
                this.$refs[name][0].resetFields();
            },
            validateKey(access_key, secret_key) {
                this.$storage.setName(this.cos_key);
                this.$storage.cos.init({access_key: access_key, secret_key: secret_key});
                //验证key&secret
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
                    console.log(error);
                });
            },
            openBrowser(url) {
                this.$electron.shell.openExternal(url);
            }
        }
    };
</script>