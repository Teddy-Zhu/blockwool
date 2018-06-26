import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Task from '@/components/NewTask'
import Login from '@/components/Login'

import cookie from '../utils/cookie';
import store from '../vuex';
import storage from '../utils/storage'

Vue.use(Router)
const router = new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({y: 0}),
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/task',
      name: 'task',
      component: Task
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})
router.beforeEach((to, from, next) => {
  console.log('ss')
  if (to.path.indexOf('/login') >= 0 || !cookie.getCookie('pwd')) {
    to.params.first = true;
    next();
  } else {
    if (storage.getSession('taskIds')) {
      to.params.first = false;
      let password = cookie.getCookie('pwd')
      if (password) {
        if (!store.state.init) {
          store.dispatch('init', {password}).then(() => {
            next()
          }).catch((e) => {
            console.error(e)
            cookie.delCookie('pwd')
            next('/login')
          })
        } else {
          next();
        }
      }
    } else {
      to.params.first = true;
      next('/login')
    }
  }


})

export default router;
