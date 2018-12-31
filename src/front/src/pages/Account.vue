<template>
<div class="">
  <h1>{{ account.name }}</h1>

  <canvas id="account-chart"></canvas>

  <table>
    <thead>
      <tr>
        <th v-for="column in columns">
          {{ column }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="operation in account.operations">
        <td v-for="column in columns">
	  <router-link v-bind:to="{ name: 'operation', params: { id: operation.uuid } }">
            {{ operation[column] }}
	  </router-link>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Chart from 'chart.js';

import Bankster from '../http/bankster';

@Component({
  data: () => {
    return {
      columns: ['date', 'name', 'amount'],
      account: {},
      chartData: {},
    };
  },

  mounted() {
    const token = localStorage.accessToken;

    Bankster.GetAccount(token, this.$route.params.id)
      .then((account: any) => {
	this.$data.account = account;

	let dates: any[] = [];
	let amounts: any[] = [];

	account.operations.forEach((operation: any) => {
	  console.log('operation', operation.date, operation.amount);

	  dates.push(operation.date);
	  amounts.push(operation.amount);
	});

	let id = 'account-chart';
	this.$data.chartData = {
	  type: 'line',
	  data: {
	    labels: dates, // ['A', 'B', 'C'],
	    datasets: [
	      {
		label: 'Opérations',
		data: amounts, // [-4, -5, -6],
		borderWidth: 3
	      },
	    ],
	  },

	  options: {
	    responsive: true,
	    lineTension: 1,
	    scales: {
	      yAxes: [{
		ticks: {
		  beginAtZero: true,
		  padding: 25,
		}
	      }]
	    },
	  },
	};

	this.createChart(id, this.$data.chartData);

	// const ctx = document.getElementById(id);

	// if (ctx === null)
	//   throw new Error(`Element ${id} no found`);

	// const myChart = new Chart(ctx as any, {
	//   type: data.type,
	//   data: data.data,
	//   options: data.options,
	// });

	return Bankster.SearchByCategory(token, this.$route.params.id);
      })
      .then((result: any) => {
	console.log('RESULT', result);
      })
      .catch((err: any) => { console.log(err); });
  },

  methods: {
    createChart(id, data): void {
      const ctx = document.getElementById(id);

      if (ctx === null) {
	throw new Error(`Element ${id} no found`);
      }

      const myChart = new Chart(ctx as any, {
	type: data.type,
	data: data.data,
	options: data.options,
      });
    },
  },
})
export default class Account extends Vue {
}
</script>

<style scoped>
</style>
