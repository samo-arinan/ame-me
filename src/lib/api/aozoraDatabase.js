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
	
	loadingPromise = fetchAndParseCSV();
	cachedBooks = await loadingPromise;
	loadingPromise = null;
	
	return cachedBooks;
}

/**
 * 青空文庫の公式CSVファイルを取得・パース
 */
async function fetchAndParseCSV() {
	try {
		console.log('Loading Aozora Bunko database...');
		
		// プロキシ経由でCSVを取得（CORS回避）
		const response = await fetch('/api/aozora-csv');
		if (!response.ok) {
			throw new Error(`Failed to fetch CSV: ${response.status}`);
		}
		
		const csvText = await response.text();
		const books = parseCSV(csvText);
		
		console.log(`Loaded ${books.length} books from Aozora Bunko database`);
		return books;
	} catch (error) {
		console.error('Failed to load Aozora database:', error);
		
		// フォールバック: 人気作品のサンプルデータ
		return getSampleBooks();
	}
}

/**
 * CSVテキストをパースして作品データに変換
 */
function parseCSV(csvText) {
	const lines = csvText.split('\n');
	const headers = lines[0].split('\t'); // TSV形式
	const books = [];
	
	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split('\t');
		if (values.length < headers.length) continue;
		
		const book = {};
		headers.forEach((header, index) => {
			book[header.trim()] = values[index]?.trim() || '';
		});
		
		// 必要なフィールドが存在する場合のみ追加
		if (book['作品名'] && book['姓']) {
			books.push(formatBookData(book));
		}
	}
	
	return books;
}

/**
 * CSVデータを統一フォーマットに変換
 */
function formatBookData(csvBook) {
	return {
		'作品ID': csvBook['作品ID'] || csvBook['図書カードNo.'],
		'作品名': csvBook['作品名'],
		'姓': csvBook['姓'],
		'名': csvBook['名'] || '',
		'書き出し': csvBook['書き出し'] || '',
		'文字遣い種別': csvBook['文字遣い種別'],
		'公開日': csvBook['公開日'],
		'テキストファイルURL': csvBook['テキストファイルURL'],
		cardNumber: extractCardNumber(csvBook['テキストファイルURL']),
		fileName: extractFileName(csvBook['テキストファイルURL'])
	};
}

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
export async function searchBooks(query = '', limit = 50) {
	const allBooks = await loadAozoraDatabase();
	
	if (!query) {
		return allBooks.slice(0, limit);
	}
	
	const results = allBooks.filter(book => 
		book['作品名'].includes(query) || 
		book['姓'].includes(query) || 
		book['名'].includes(query)
	);
	
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
 * フォールバック用サンプルデータ
 */
function getSampleBooks() {
	return [
		{
			'作品ID': '1567',
			'作品名': '走れメロス',
			'姓': '太宰',
			'名': '治',
			'書き出し': 'メロスは激怒した。',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000035/files/1567_ruby_4948.zip',
			cardNumber: '000035',
			fileName: '1567_ruby_4948'
		},
		{
			'作品ID': '456',
			'作品名': '羅生門',
			'姓': '芥川',
			'名': '龍之介',
			'書き出し': 'ある日の暮方の事である。',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000879/files/127_ruby_150.zip',
			cardNumber: '000879',
			fileName: '127_ruby_150'
		},
		{
			'作品ID': '773',
			'作品名': 'こころ',
			'姓': '夏目',
			'名': '漱石',
			'書き出し': '私はその人を常に先生と呼んでいた。',
			'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000148/files/773_ruby_5968.zip',
			cardNumber: '000148',
			fileName: '773_ruby_5968'
		}
	];
}