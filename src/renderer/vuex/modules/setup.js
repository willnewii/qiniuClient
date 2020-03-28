/**
 * Created by zhangweiwei on 2018/08/15.
 */
import {util, storagePromise, Constants} from '@/service';
import * as types from '@/vuex/mutation-types';

const defaultImageStyle = '?imageView2/1/w/100/h/100/format/webp/q/10';

function setAppSetup(app) {
    storagePromise.set(Constants.Key.configuration, app);
}

// 默认设置
const setup = {
    paging: true,                                           //是否开启分页
    https: false,                                           //是否支持Https
    showMenuBar: false,                                     //是否显示菜单栏(win&Linux)
    deleteNoAsk: false,                                     //文件删除前是否弹出对话框
    uploadNoAsk: true,                                      //文件上传时是否弹出对话框
    isOverwrite: true,                                      //上传时是否直接覆盖文件
    copyType: 'url',                                        //默认复制类型
    showType: 1,                                            //默认显示类型
    brand: '',                                              //托盘上传的 服务商/bucket/自定义路径
    bucket_name: '',
    bucket_dir: '',
    customedomain: {},                                      //名称有歧义.保存最近选择的域名
    imagestyle: defaultImageStyle,                          //Grid时,提供了图片预览,可以设置的预览图片的压缩方式
    downloaddir: '',                                        //设置文件的下载路径
    privatebucket: [],                                      //七牛私有空间不能通过api获取,只能用户手动标记
    expiresTime: 3600,                                      //私有空间,过期时间默认1小时
    theme: 'auto',
    recent: {                                               //最近使用的bucketname
        uuid: '',
        bucket: ''
    }
};

const mutations = {
    [types.setup.customedomain](state, value) {
        if (!state.setup.customedomain) {
            state.setup.customedomain = {};
        }
        state.setup.customedomain = Object.assign(state.setup.customedomain, value);
        setAppSetup(state.setup);
    },
    [types.setup.savedir](state, value) {
        state.setup.bucket_name = value[0];
        state.setup.bucket_dir = value[1];
        state.setup.brand = value[2];

        setAppSetup(state.setup);
    },
    [types.setup.deadline](state, value) {
        state.setup.expiresTime = value;
        setAppSetup(state.setup);
    },
    [types.setup.init](state, value) {
        state.setup = value;
    },
};
const mutationsKeys = [types.setup.privatebucket, types.setup.isOverwrite, types.setup.downloaddir, types.setup.paging, types.setup.showMenuBar,types.setup.https, types.setup.deleteNoAsk, types.setup.copyType, types.setup.showType, types.setup.imagestyle, types.setup.theme, types.setup.recent];
mutationsKeys.forEach((key) => {
    mutations[key] = function (state, value) {
        state.setup[key] = value;
        setAppSetup(state.setup);
    };
});

const actions = {
    async [types.setup.init](context, callback) {
        let app = await storagePromise.get(Constants.Key.configuration);
        if (!util.isEmptyObject(app)) {
            context.commit(types.setup.init, app);
            callback && callback();
        }
    },
};
const actionsKey = [types.setup.a_isOverwrite, types.setup.a_deadline, types.setup.a_privatebucket, types.setup.a_imagestyle, types.setup.a_paging, types.setup.a_showMenuBar,types.setup.a_https, types.setup.a_deleteNoAsk, types.setup.a_uploadNoAsk, types.setup.a_downloaddir, types.setup.a_copyType, types.setup.a_showType, types.setup.a_savedir, types.setup.a_customedomain, types.setup.a_theme, types.setup.a_recent];
actionsKey.forEach((key) => {
    actions[key] = function (context, value) {
        context.commit(key.substring(2, key.length), value);
    };
});

const getters = {
    [types.setup.deadline](state) {
        return ('expiresTime' in state.setup) ? state.setup.expiresTime : 3600;
    }
};
const gettersKeys = [types.setup.isOverwrite, types.setup.privatebucket, types.setup.downloaddir, types.setup.imagestyle, types.setup.showMenuBar,types.setup.https, types.setup.paging, types.setup.deleteNoAsk, types.setup.uploadNoAsk, types.setup.copyType, types.setup.showType, types.setup.brand, types.setup.bucket_name, types.setup.bucket_dir, types.setup.customedomain, types.setup.theme, types.setup.recent];
gettersKeys.forEach((key) => {
    getters[key] = function (state) {
        return (key in state.setup) ? state.setup[key] : setup[key];
    };
});

export default {
    state: {
        setup: setup
    },
    mutations: mutations,
    actions: actions,
    getters: getters
};
