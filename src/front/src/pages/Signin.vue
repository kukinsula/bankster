<template>
  <div class="">
    <h1>Connexion</h1>
    <div>
      <input v-model=email placeholder='Email'></br>
      <input v-model=password placeholder='Mot de passe'></br>
      <button v-on:click="Signin">Connexion</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Bankster from '../http/bankster';

@Component({
  data: () => {
    return {
      email: '',
      password: '',
    };
  },

  mounted: () => {
    // if (localStorage.accessToken != undefined) {
    //   console.log('Access Token present', localStorage.accessToken);
    // }
  },

  methods: {
    Signin() {
      Bankster.Signin(this.$data.email, this.$data.password)
	.then((token: string) => {
	  localStorage.accessToken = token;

	  this.$router.push('home');
	})
	.catch((error: any) => { console.log(error); });
    },
  },
})
export default class Signin extends Vue {
}
</script>

<style scoped>
</style>
