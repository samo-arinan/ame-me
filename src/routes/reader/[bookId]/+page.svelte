<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fetchBookDetail, fetchBookText } from '$lib/api/aozora.js';
	import { parseAozoraText, extractMetadata } from '$lib/parser/aozora.js';
	import { currentPosition, fontSize } from '$lib/stores/reader.js';
	import { analyzeEmotion, createEmotionCache } from '$lib/api/emotion.js';
	import { currentEmotion, apiKey, emotionAnalysisEnabled } from '$lib/stores/emotion.js';
	import RainEffect from '$lib/components/RainEffect.svelte';
	import Settings from '$lib/components/Settings.svelte';
	
	let book = null;
	let bookText = '';
	let parsedText = '';
	let loading = true;
	let error = null;
	let readerContainer;
	let emotionCache = createEmotionCache();
	let currentParagraph = '';
	
	$: bookId = $page.params.bookId;
	
	onMount(async () => {
		try {
			loading = true;
			
			// 書籍詳細を取得
			book = await fetchBookDetail(bookId);
			if (!book) {
				throw new Error('書籍が見つかりません');
			}
			
			// テキストファイルのパスを構築
			const cardNumber = book.cardNumber;
			const fileName = book.fileName;
			
			if (!cardNumber || !fileName) {
				throw new Error('テキストファイル情報が見つかりません');
			}
			
			// テキストを取得
			bookText = await fetchBookText(cardNumber, fileName);
			if (!bookText) {
				throw new Error('テキストの読み込みに失敗しました');
			}
			
			console.log('取得したテキスト長:', bookText.length);
			console.log('テキストの最初の300文字:', bookText.substring(0, 300));
			console.log('テキストの最後の300文字:', bookText.substring(bookText.length - 300));
			
			// メタデータ抽出とパース
			const metadata = extractMetadata(bookText);
			parsedText = parseAozoraText(metadata.content);
			
			console.log('パース後テキスト長:', parsedText.length);
			console.log('パース後の最初の300文字:', parsedText.substring(0, 300));
			
		} catch (err) {
			error = err.message;
			console.error(err);
		} finally {
			loading = false;
		}
	});
	
	function adjustFontSize(delta) {
		fontSize.update(size => Math.max(12, Math.min(24, size + delta)));
	}
	
	function handleScroll() {
		if (readerContainer) {
			const scrollPercent = readerContainer.scrollLeft / (readerContainer.scrollWidth - readerContainer.clientWidth);
			currentPosition.set(scrollPercent);
			
			// 現在の表示位置のテキストを取得して感情分析
			if ($emotionAnalysisEnabled && $apiKey) {
				analyzeCurrentParagraph();
			}
		}
	}
	
	async function analyzeCurrentParagraph() {
		if (!bookText || !$apiKey) return;
		
		// 現在の位置から前後のテキストを取得（簡易実装）
		const textLength = bookText.length;
		const currentPos = Math.floor(textLength * $currentPosition);
		const paragraphStart = Math.max(0, currentPos - 500);
		const paragraphEnd = Math.min(textLength, currentPos + 500);
		const paragraph = bookText.slice(paragraphStart, paragraphEnd);
		
		// 段落が変わった場合のみ分析実行
		if (paragraph === currentParagraph) return;
		currentParagraph = paragraph;
		
		// キャッシュから取得試行
		if (emotionCache.has(paragraph)) {
			currentEmotion.set(emotionCache.get(paragraph));
			return;
		}
		
		// 感情分析実行
		try {
			const emotion = await analyzeEmotion(paragraph, $apiKey);
			if (emotion) {
				emotionCache.set(paragraph, emotion);
				currentEmotion.set(emotion);
			}
		} catch (error) {
			console.error('感情分析エラー:', error);
		}
	}
</script>

<RainEffect enabled={$emotionAnalysisEnabled} />
<Settings />

<div class="reader-wrapper">
	{#if loading}
		<div class="loading">読み込み中...</div>
	{:else if error}
		<div class="error">
			<h2>エラーが発生しました</h2>
			<p>{error}</p>
			<a href="/books">作品一覧に戻る</a>
		</div>
	{:else}
		<div class="controls">
			<button on:click={() => history.back()}>← 戻る</button>
			<div class="font-controls">
				<button on:click={() => adjustFontSize(-2)}>A-</button>
				<span>文字サイズ: {$fontSize}px</span>
				<button on:click={() => adjustFontSize(2)}>A+</button>
			</div>
		</div>
		
		<div 
			class="reader-container vertical-text"
			bind:this={readerContainer}
			on:scroll={handleScroll}
			style="font-size: {$fontSize}px;"
		>
			<div class="book-content">
				{#if book}
					<h1 class="book-title">{book['作品名']}</h1>
					<p class="book-author">著者: {book['姓']} {book['名'] || ''}</p>
				{/if}
				<div class="text-content">
					{@html parsedText}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.reader-wrapper {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
	
	.loading, .error {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
	}
	
	.error {
		flex-direction: column;
	}
	
	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: #f8f9fa;
		border-bottom: 1px solid #dee2e6;
		position: sticky;
		top: 0;
		z-index: 10;
	}
	
	.font-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.font-controls button {
		padding: 0.25rem 0.5rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 3px;
		cursor: pointer;
	}
	
	.reader-container {
		flex: 1;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 2rem;
		background: #fefefe;
		direction: rtl; /* 右から左に読む */
	}
	
	.book-content {
		direction: ltr; /* テキスト自体は通常の方向 */
		height: 100%;
		width: max-content;
		padding: 2rem;
		line-height: 2;
		letter-spacing: 0.1em;
	}
	
	.book-title {
		font-size: 1.5em;
		margin-bottom: 1rem;
		font-weight: bold;
	}
	
	.book-author {
		margin-bottom: 2rem;
		color: #666;
	}
	
	.text-content {
		max-width: none;
		columns: auto;
		column-gap: 3rem;
		column-fill: auto;
	}
	
	/* モバイル対応 */
	@media (max-width: 768px) {
		.controls {
			padding: 0.5rem;
		}
		
		.font-controls span {
			display: none;
		}
		
		.reader-container {
			padding: 1rem;
		}
		
		.book-content {
			padding: 1rem;
		}
	}
	
	/* タッチデバイス用のスクロール改善 */
	@media (hover: none) and (pointer: coarse) {
		.reader-container {
			-webkit-overflow-scrolling: touch;
			scroll-behavior: smooth;
		}
	}
</style>