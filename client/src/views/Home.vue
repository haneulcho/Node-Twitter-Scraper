<template>
<v-app min-width="1340">
	<v-content style="background-color:#1f272b">
		<v-container fluid style="padding-bottom:80px">
			<SearchForm/>
		</v-container>
		<Footer/>
	</v-content>
</v-app>
</template>

<script>
import SearchForm from '@/components/SearchForm.vue'
import Footer from '@/components/Footer.vue'
export default {
	components: {
		SearchForm, Footer
	}
};
</script>
