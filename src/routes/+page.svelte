<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	onMount(() => {
		// 自動的に作品一覧へリダイレクト
		goto('/books');
	});
</script>

<div class="container">
	<h1>青空文庫リーダー</h1>
	<p>読み込み中...</p>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
	}
</style>
