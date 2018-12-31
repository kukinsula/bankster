<template>
<div class="">
  <h1>Mes informations</h1>
  <ul>
    <li>UUID {{ uuid }}</li>
    <li>Prénom {{ firstName }}</li>
    <li>Nom {{ firstName }}</li>
    <li>Email {{ email }}</li>
  </ul>

  <h2>Mes comptes</h2>
  <ul>
    <li v-for="account in accounts">
      <router-link v-bind:to="{ name: 'account', params: { id: account.uuid } }">
	{{ account.name }}
      </router-link>
    </li>
  </ul>

  <h2>Mes catégories</h2>
  <ul>
    <li v-for="category in categories">
      <router-link v-bind:to="{ name: 'category', params: { id: category.uuid } }">
	{{ category.name }}
      </router-link>
    </li>
  </ul>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Bankster from '../http/bankster';

@Component({
  data: () => {
    return {
      uuid: '',
      firstName: '',
      lastName: '',
      email: '',
      accounts: [],
      categories: [],
    };
  },

  mounted() {
    Bankster.Me(localStorage.accessToken)
      .then((me: any) => {
	this.$data.uuid = me.uuid;
	this.$data.firstName = me.firstName;
	this.$data.lastName = me.firstName;
	this.$data.email = me.email;
	this.$data.accounts = me.accounts;
	this.$data.categories = me.categories;
      })
      .catch((err: any) => { console.log(err); });
  },

  methods: {},
})
export default class Login extends Vue {
}
</script>

<style scoped>
</style>
