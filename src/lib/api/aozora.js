import { searchBooks, getBookDetail } from './aozoraDatabase.js';

export async function fetchBooks(query = '', searchType = 'all') {
	return await searchBooks(query, 50, searchType);
}

export async function fetchBookDetail(bookId) {
	return await getBookDetail(bookId);
}

export async function fetchBookText(cardNumber, fileName) {
	try {
		// サーバーサイドプロキシ経由で青空文庫テキストを取得
		const url = `/api/book-text/${cardNumber}/${fileName}`;
		
		console.log('Fetching text from proxy:', url);
		
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch book text: ${response.status}`);
		}
		
		const text = await response.text();
		
		return text;
	} catch (error) {
		console.error('Error fetching book text:', error);
		
		// フォールバック: デモ用のサンプルテキスト
		return getDemoText(fileName);
	}
}

function getDemoText(fileName) {
	const demoTexts = {
		'1567_ruby_4948': `
走れメロス
太宰治

メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。メロスには政治がわからぬ。メロスは、村の牧人である。笛を吹き、羊と遊んで暮して来た。けれども邪悪に対しては、人一倍に敏感であった。

（青空文庫より）

※GitHubからの取得に失敗したため、デモ用テキストを表示しています。
		`.trim(),
		
		'127_ruby_150': `
羅生門
芥川龍之介

ある日の暮方の事である。一人の下人が、羅生門の下で雨やみを待っていた。

広い門の下には、この男のほかに誰もいない。ただ、所々丹塗の剥げた、大きな円柱に、蟋蟀が一匹とまっている。羅生門が、朱雀大路にある以上は、この男のほかにも、雨やみを待っている人があってもよさそうなものである。

（青空文庫より）

※GitHubからの取得に失敗したため、デモ用テキストを表示しています。
		`.trim(),
		
		'773_ruby_5968': `
こころ
夏目漱石

私はその人を常に先生と呼んでいた。だからここでもただ先生と書くだけで本名は打ち明けない。これは世間を憚かる遠慮というよりも、その方が私にとって自然だからである。

（青空文庫より）

※GitHubからの取得に失敗したため、デモ用テキストを表示しています。
		`.trim()
	};
	
	return demoTexts[fileName] || `
サンプルテキスト

この作品のテキストはまだ読み込まれていません。

※GitHubからの取得に失敗したため、デモ用テキストを表示しています。
実際の作品は青空文庫GitHubリポジトリから取得を試行します。
	`.trim();
}