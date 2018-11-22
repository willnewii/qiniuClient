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
        <h3 class="title">设置云存储密钥</h3>
        <Form :model="formItem" ref="formItem1" :rules="ruleItem" :label-width="150">
            <Form-item label="ACCESS_KEY" prop="access_key">
                <Input v-model="formItem.access_key" placeholder="请填入你的ACCESS_KEY"/>
            </Form-item>
            <Form-item label="SECRET_KEY" prop="secret_key">
                <Input v-model="formItem.secret_key" placeholder="请填入你的SECRET_KEY"/>
            </Form-item>
            <Form-item>
                <Button type="primary" @click="handleSubmit('formItem1')">设置</Button>
                <Button @click="handleReset('formItem1')" style="margin-left: 8px">重置</Button>
            </Form-item>
        </Form>
    </div>
</template>
<script>
    import {Constants, mixins, util} from '../service';
    import brand from '@/cos/brand';

    export default {
        mixins: [mixins.base],
        data() {
            return {
                selectBrand: brand.qiniu,
                formItem: {
                    access_key: 'LTAI8t9Mjerl7PD5',
                    secret_key: '4zeBOV1mVUFZnAGjJmTNTqPE7Zl1xu',
                    region: ''
                },
                ruleItem: {
                    access_key: [{required: true, message: 'access_key不能为空', trigger: 'blur'}],
                    secret_key: [{required: true, message: 'secret_key不能为空', trigger: 'blur'}],
                    region: [{required: false, message: 'region不能为空', trigger: 'blur'}]
                },
                brands: []
            };
        },
        computed: {},
        created: function () {
            Object.keys(brand).forEach((item) => {
                this.brands.push(brand[item]);
            });
        },
        methods: {
            handleSubmit(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.validateKey(this.formItem);
                    } else {
                        console.log('表单不能提交');
                    }
                });
            },
            handleReset(name) {
                this.$refs[name].resetFields();
            },
            validateKey(form) {
                this.$storage.setName(this.selectBrand.key);
                this.$storage.cos.init({access_key: form.access_key, secret_key: form.secret_key, region: form.region});

                //验证key&secret
                this.$storage.getBuckets((error, result) => {
                    if (error) {
                        util.notification({
                            title: this.selectBrand.name,
                            body: error.message
                        });
                    } else {
                        this.$storage.saveCosKey({
                            access_key: form.access_key,
                            secret_key: form.secret_key,
                            region: form.region
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