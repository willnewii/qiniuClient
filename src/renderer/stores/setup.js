import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
    // 开启数据缓存
    persist: {
        enabled: true
    },
    state: () => {
        return {
            tagslist: [
                {
                    title: '首页',
                    key: 'home',
                    closable: false
                }
            ]
        };
    },
    actions: {
        changeTagList(obj) {
            const key = this.tagslist.find(item => {
                return item.key == obj.key;
            });
            if (!key) {
                this.tagslist.push(obj);
            }
        },
        deleteTagList(k) {
            const key = this.tagslist.findIndex(item => {
                return item.key == k;
            });
            this.tagslist.splice(key, 1);
        }
    },
    getters: {}
});
