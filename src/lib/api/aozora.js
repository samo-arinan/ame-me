// 人気作品のサンプルデータ（実際の青空文庫作品）
const SAMPLE_BOOKS = [
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
	},
	{
		'作品ID': '92',
		'作品名': '蜘蛛の糸',
		'姓': '芥川',
		'名': '龍之介',
		'書き出し': 'ある日の事でございます。',
		'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000879/files/92_ruby_164.zip',
		cardNumber: '000879',
		fileName: '92_ruby_164'
	},
	{
		'作品ID': '301',
		'作品名': '人間失格',
		'姓': '太宰',
		'名': '治',
		'書き出し': '恥の多い生涯を送って来ました。',
		'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000035/files/301_ruby_5915.zip',
		cardNumber: '000035',
		fileName: '301_ruby_5915'
	},
	{
		'作品ID': '752',
		'作品名': '坊っちゃん',
		'姓': '夏目',
		'名': '漱石',
		'書き出し': '親譲りの無鉄砲で小供の時から損ばかりしている。',
		'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000148/files/752_ruby_2438.zip',
		cardNumber: '000148',
		fileName: '752_ruby_2438'
	},
	{
		'作品ID': '436',
		'作品名': '檸檬',
		'姓': '梶井',
		'名': '基次郎',
		'書き出し': 'えたいの知れない不吉な塊が私の心を始終圧えつけていた。',
		'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000074/files/436_ruby_19028.zip',
		cardNumber: '000074',
		fileName: '436_ruby_19028'
	},
	{
		'作品ID': '43737',
		'作品名': '銀河鉄道の夜',
		'姓': '宮沢',
		'名': '賢治',
		'書き出し': '「ではみなさんは、そういうふうに川だと言われたり、乳の流れたあとだと言われたりしていたこのぼんやりと白いものがほんとうは何かご承知ですか。」',
		'テキストファイルURL': 'https://www.aozora.gr.jp/cards/000081/files/43737_ruby_17045.zip',
		cardNumber: '000081',
		fileName: '43737_ruby_17045'
	}
];

export async function fetchBooks(query = '') {
	// デモ用：サンプルデータから検索
	if (!query) {
		return SAMPLE_BOOKS;
	}
	
	return SAMPLE_BOOKS.filter(book => 
		book['作品名'].includes(query) || 
		book['姓'].includes(query) || 
		book['名'].includes(query)
	);
}

export async function fetchBookDetail(bookId) {
	// サンプルデータから検索
	return SAMPLE_BOOKS.find(book => book['作品ID'] === bookId) || null;
}

export async function fetchBookText(cardNumber, fileName) {
	try {
		// 青空文庫のGitHubリポジトリから直接取得
		const url = `https://raw.githubusercontent.com/aozorahack/aozorabunko_text/master/cards/${cardNumber}/files/${fileName}/${fileName}.txt`;
		
		console.log('Fetching text from:', url);
		
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch book text: ${response.status}`);
		}
		
		const buffer = await response.arrayBuffer();
		const decoder = new TextDecoder('shift_jis');
		const text = decoder.decode(buffer);
		
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