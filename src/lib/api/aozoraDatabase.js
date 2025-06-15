// 青空文庫の全作品データベース管理

let cachedBooks = null;
let loadingPromise = null;

/**
 * 青空文庫の全作品データを取得・キャッシュ
 */
export async function loadAozoraDatabase() {
	if (cachedBooks) {
		return cachedBooks;
	}
	
	if (loadingPromise) {
		return loadingPromise;
	}
	
	// 静的データを使用する
	// 将来的にはAPI経由で最新データを取得する実装に置き換える
	cachedBooks = getStaticDatabase();
	console.log(`Loaded ${cachedBooks.length} books from static database`);
	
	return cachedBooks;
}

// 以下の関数は静的データを使用するため一時的にコメントアウト
// 将来的にAPI経由で動的データを取得する際に再利用できる

/**
 * URLからカード番号を抽出
 */
function extractCardNumber(url) {
	if (!url) return null;
	const match = url.match(/\/cards\/(\d+)\//);
	return match ? match[1] : null;
}

/**
 * URLからファイル名を抽出
 */
function extractFileName(url) {
	if (!url) return null;
	const match = url.match(/\/files\/([^\/]+)\.zip/);
	return match ? match[1] : null;
}

/**
 * 作品検索
 */
export async function searchBooks(query = '', limit = 50, searchType = 'all') {
	const allBooks = await loadAozoraDatabase();
	
	if (!query) {
		return allBooks.slice(0, limit);
	}
	
	let results;
	if (searchType === 'title') {
		results = allBooks.filter(book => 
			book['作品名'].includes(query)
		);
	} else if (searchType === 'author') {
		results = allBooks.filter(book => {
			// 姓名を結合した完全な名前でも検索できるようにする
			const fullName = book['姓'] + (book['名'] || '');
			const fullNameWithSpace = book['姓'] + ' ' + (book['名'] || '');
			return book['姓'].includes(query) || 
				book['名'].includes(query) ||
				fullName.includes(query) ||
				fullNameWithSpace.includes(query);
		});
	} else {
		// searchType === 'all'
		results = allBooks.filter(book => {
			// 姓名を結合した完全な名前でも検索できるようにする
			const fullName = book['姓'] + (book['名'] || '');
			const fullNameWithSpace = book['姓'] + ' ' + (book['名'] || '');
			return book['作品名'].includes(query) || 
				book['姓'].includes(query) || 
				book['名'].includes(query) ||
				fullName.includes(query) ||
				fullNameWithSpace.includes(query);
		});
	}
	
	return results.slice(0, limit);
}

/**
 * 作品詳細取得
 */
export async function getBookDetail(bookId) {
	const allBooks = await loadAozoraDatabase();
	return allBooks.find(book => book['作品ID'] === bookId) || null;
}

/**
 * 静的データベース - Netlifyデプロイ用
 */
function getStaticDatabase() {
	const books = [
		{
			'作品ID': '1567',
			'作品名': '走れメロス',
			'姓': '太宰',
			'名': '治',
			'書き出し': 'メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000035/files/1567_ruby_4948.zip',
			cardNumber: '000035',
			fileName: '1567_ruby_4948'
		},
		{
			'作品ID': '456',
			'作品名': '羅生門',
			'姓': '芥川',
			'名': '龍之介',
			'書き出し': 'ある日の暮方の事である。一人の下人が、羅生門の下で雨やみを待っていた。',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000879/files/127_ruby_150.zip',
			cardNumber: '000879',
			fileName: '127_ruby_150'
		},
		{
			'作品ID': '773',
			'作品名': 'こころ',
			'姓': '夏目',
			'名': '漱石',
			'書き出し': '私はその人を常に先生と呼んでいた。だからここでもただ先生と書くだけで本名は打ち明けない。',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000148/files/773_ruby_5968.zip',
			cardNumber: '000148',
			fileName: '773_ruby_5968'
		},
		{
			'作品ID': '43754',
			'作品名': '銀河鉄道の夜',
			'姓': '宮沢',
			'名': '賢治',
			'書き出し': '「ではみなさんは、そういうふうに川だと云われたり、乳の流れたあとだと云われたりしていたこのぼんやりと白いものがほんとうは何かご承知ですか。」',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000081/files/43737_ruby_17659.zip',
			cardNumber: '000081',
			fileName: '43737_ruby_17659'
		},
		{
			'作品ID': '3343',
			'作品名': '火星兵団',
			'姓': '海野',
			'名': '十三',
			'書き出し': '昭和十五年の春のことであった。地球の科学界に一大センセーションを巻き起こした事件がある。',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000160/files/3343_ruby_48953.zip',
			cardNumber: '000160',
			fileName: '3343_ruby_48953'
		},
		{
			'作品ID': '1091',
			'作品名': '蜘蛛の糸',
			'姓': '芥川',
			'名': '龍之介',
			'書き出し': 'ある日の事でございます。お釈迦様は極楽の蓮池のふちを、独りでぶらぶら御歩きになっていらっしゃいました。',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000879/files/1091_ruby_954.zip',
			cardNumber: '000879',
			fileName: '1091_ruby_954'
		},
		{
			'作品ID': '394',
			'作品名': '十三夜',
			'姓': '樋口',
			'名': '一葉',
			'書き出し': '「どうぞ今夜はお帰りなさいませ」と、おせきは泣きながらお関の袖を引く。',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000064/files/394_ruby_4531.zip',
			cardNumber: '000064',
			fileName: '386_ruby_15290'
		},
		{
			'作品ID': '392',
			'作品名': 'たけくらべ',
			'姓': '樋口',
			'名': '一葉',
			'書き出し': '廻れば大門の見返り柳いと長けれど、お歯ぐろ溝に燈火うつる三階の騒ぎも手に取る如く、明けくれなしの車の往来にはかり知られぬ全盛をうらなひて、大音寺前と名は仏くさけれど、さればとて今さら如何はあらん繁華の巷とこそ言ふべけれ。',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000064/files/392_ruby_4448.zip',
			cardNumber: '000064',
			fileName: '389_ruby_15296'
		}
	];

	// カード番号とファイル名を自動設定
	return books.map(book => {
		if (!book.cardNumber) {
			const cardMatch = book['テキストファイルURL'].match(/\/cards\/(\d+)\//);
			book.cardNumber = cardMatch ? cardMatch[1] : '000000';
		}
		if (!book.fileName) {
			const fileMatch = book['テキストファイルURL'].match(/\/files\/([^\/]+)\.zip/);
			book.fileName = fileMatch ? fileMatch[1] : book['作品ID'] + '_ruby_0000';
		}
		return book;
	});
}

/**
 * フォールバック用サンプルデータ（後方互換性のため）
 */
function getSampleBooks() {
	return getStaticDatabase().slice(0, 3);
}