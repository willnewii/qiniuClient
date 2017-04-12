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
    }
]
