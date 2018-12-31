<template>
<div class="">
  <h1>Operation</h1>
  {{ operation.date }}
  {{ operation.name }}
  {{ operation.amount }}
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Bankster from '../http/bankster';

@Component({
  data: () => {
    return {
      operation: {},
    };
  },

  mounted() {
    const token = localStorage.accessToken;

    Bankster.GetOperation(token, this.$route.params.id)
      .then((operation: any) => {
	this.$data.operation = operation;
      })
      .catch((err: any) => { console.log(err); });
  },
})
export default class Operation extends Vue {
}
</script>

<style scoped>
</style>
