<template>
<v-layout justify-center>
	<v-card class="mx-auto ma-5" max-width="1340">
		<v-card-title>
			검색 결과: 총 <span class="total_count">{{ list.length }}</span>건 <v-btn @click="downloadCsv" depressed color="primary" class="ml-5"><v-icon>save_alt</v-icon>csv 파일 다운로드</v-btn>
			<v-spacer></v-spacer><v-spacer></v-spacer><v-spacer></v-spacer><v-spacer></v-spacer><v-spacer></v-spacer><v-spacer></v-spacer>
			<v-text-field v-model="search" append-icon="search" label="결과 내 재검색" class="d-block" single-line hide-details></v-text-field>
		</v-card-title>
		<v-data-table :headers="headers" :items="list" :sort-by="['timestamp']" :sort-desc="[true]" :search="search" :items-per-page="20" fixed-header multi-sort class="elevation-1 outlined mx-auto" max-width="1340">
			<template v-slot:body="{items}">
				<tr v-for="item in items" :key="item.name" @click="goToTwitter(item)">
					<td class="caption">{{ item.timestamp }}</td>
					<td class="caption">{{ item.user_id }}</td>
					<td class="caption"><v-avatar><img :src="item.user_img"></v-avatar><br>{{ item.user_name }}</td>
					<td class="caption">{{ item.hashtag }}</td>
					<td class="caption">{{ item.text }}</td>
					<td class="caption">{{ item.retweets }}</td>
					<td class="caption">{{ item.likes }}</td>
				</tr>
			</template>
		</v-data-table>
	</v-card>
</v-layout>
</template>

<script>
export default {
	name: 'ListTable',
	props: ['list'],
	data: () => ({
		search: '',
		headers: [
			{ text: '작성일', align: 'center', value: 'timestamp', width: '160px' },
			{ text: '아이디', align: 'center', value: 'user_id' },
			{ text: '이름', align: 'center', value: 'user_name', sortable: false, width: '100px' },
			{ text: '해시태그', align: 'center', value: 'hashtag', sortable: false, width: '180px' },
			{ text: '내용', align: 'center', value: 'text', sortable: false },
			{ text: '리트윗', align: 'center', value: 'retweets', width: '110px' },
			{ text: '좋아요', align: 'center', value: 'likes', width: '110px' }
		]
	}),
	methods: {
		downloadCsv () {
			window.location.assign('http://localhost:3000/download')
			// window.location.assign('https://twit-search-scraper.herokuapp.com/download')
		},
		goToTwitter (item) {
			window.open('https://twitter.com/' + item.user_id + '/status/' + item.id, '_blank')
		}
	}
};
</script>

<style scoped>
	.total_count {margin-left:5px;font-size:30px;vertical-align:middle;color:#E53935}
	td.caption {height:80px;border-bottom:1px solid #ececec}
	tr:hover td.caption {background-color:#eee;cursor:pointer}
	td.caption:nth-child(odd) {background-color:#f9f9f9}
</style>
