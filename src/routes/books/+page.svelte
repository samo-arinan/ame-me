<script>
	import { onMount } from 'svelte';
	import { books } from '$lib/stores/books.js';
	import { fetchBooks } from '$lib/api/aozora.js';
	
	let searchQuery = '';
	let loading = false;
	
	onMount(async () => {
		loading = true;
		const bookList = await fetchBooks();
		books.set(bookList);
		loading = false;
	});
	
	async function search() {
		loading = true;
		const bookList = await fetchBooks(searchQuery);
		books.set(bookList);
		loading = false;
	}
</script>

<div class="container">
	<h1>作品一覧</h1>
	
	<div class="search">
		<input 
			type="text" 
			bind:value={searchQuery}
			placeholder="作品を検索..."
			on:keydown={(e) => e.key === 'Enter' && search()}
		/>
		<button on:click={search}>検索</button>
	</div>
	
	{#if loading}
		<p>読み込み中...</p>
	{:else if $books.length === 0}
		<p>作品が見つかりませんでした</p>
	{:else}
		<div class="book-list">
			{#each $books as book}
				<a href="/reader/{book.book_id}" class="book-item">
					<h3>{book.title}</h3>
					<p>{book.authors?.[0]?.full_name || '作者不明'}</p>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
	}
	
	.search {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}
	
	.search input {
		flex: 1;
		padding: 0.5rem;
		font-size: 1rem;
	}
	
	.search button {
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		cursor: pointer;
	}
	
	.book-list {
		display: grid;
		gap: 1rem;
	}
	
	.book-item {
		display: block;
		padding: 1rem;
		border: 1px solid #ddd;
		text-decoration: none;
		color: inherit;
		transition: background 0.2s;
	}
	
	.book-item:hover {
		background: #f5f5f5;
	}
	
	.book-item h3 {
		margin: 0 0 0.5rem 0;
	}
	
	.book-item p {
		margin: 0;
		color: #666;
	}
</style>