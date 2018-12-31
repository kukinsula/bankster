<template>
<div id="app">
  <router-view></router-view>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VueRouter from 'vue-router';

import Signin from './pages/Signin.vue';
import Home from './pages/Home.vue';
import Account from './pages/Account.vue';
import Category from './pages/Category.vue';
import Operation from './pages/Operation.vue';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      name: 'home',
      path: '/home',
      component: Home,
    },

    {
      name: 'signin',
      path: '/signin',
      component: Signin,
    },

    {
      name: 'account',
      path: '/account/:id',
      component: Account,
    },

    {
      name: 'category',
      path: '/category/:id',
      component: Category,
    },

    {
      name: 'operation',
      path: '/operation/:id',
      component: Operation,
    },
  ],
});

@Component({
  router,
})
export default class App extends Vue {}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
