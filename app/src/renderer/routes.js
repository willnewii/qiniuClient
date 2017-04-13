export default [
    {
        path: '/',
        name: 'main',
        component: require('components/Main.vue')
    },
    {
        path: '/login',
        name: 'login',
        component: require('components/SetToken.vue')
    },
    {
        path: '/tray',
        name: 'tray',
        component: require('components/Tray.vue')
    }
]
