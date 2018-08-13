import * as Constants from './service/constants';

export default [
    {
        path: '/',
        name: 'main',
        components: require('pages/Main.vue'),
        children: [
            {
                path: Constants.PageName.bucketPage,
                name: Constants.PageName.bucketPage,
                components: require('pages/bucketPage.vue')
            },
            {
                path: Constants.PageName.setup,
                name: Constants.PageName.setup,
                components: require('pages/Setup.vue')
            }
        ]
    },
    {
        path: '/' + Constants.PageName.login,
        name: Constants.PageName.login,
        components: require('pages/Login.vue')
    },
    {
        path: '/' + Constants.PageName.tray,
        name: Constants.PageName.tray,
        components: require('pages/Tray.vue')
    }
];
