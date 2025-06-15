export async function GET({ params }) {
	const { cardNumber, fileName } = params;
	
	try {
		// まず指定されたファイル名で試行
		let actualFileName = fileName;
		let url = `https://raw.githubusercontent.com/aozorahack/aozorabunko_text/master/cards/${cardNumber}/files/${fileName}/${fileName}.txt`;
		
		console.log('Fetching text from:', url);
		
		let response = await fetch(url);
		
		// 404の場合、GitHubから実際のファイル名を検索
		if (!response.ok && response.status === 404) {
			console.log('File not found, searching for actual filename...');
			
			// 作品IDからファイル名を推測して検索
			const workId = fileName.split('_')[0]; // 例: 3343_ruby_48953 -> 3343
			const actualFileNames = await findActualFileName(cardNumber, workId);
			
			if (actualFileNames.length > 0) {
				actualFileName = actualFileNames[0];
				url = `https://raw.githubusercontent.com/aozorahack/aozorabunko_text/master/cards/${cardNumber}/files/${actualFileName}/${actualFileName}.txt`;
				console.log('Trying with actual filename:', url);
				response = await fetch(url);
			}
		}
		
		if (!response.ok) {
			throw new Error(`Failed to fetch book text: ${response.status}`);
		}
		
		const buffer = await response.arrayBuffer();
		const decoder = new TextDecoder('shift_jis');
		const text = decoder.decode(buffer);
		
		return new Response(text, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('Error fetching book text:', error);
		
		// フォールバック: デモ用のサンプルテキスト
		const demoText = getDemoText(fileName);
		
		return new Response(demoText, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}
}

// GitHubから実際のファイル名を検索
async function findActualFileName(cardNumber, workId) {
	try {
		// 既知の問題のあるファイル名マッピング
		const knownMappings = {
			'000064_394': '386_ruby_15290', // 樋口一葉「十三夜」
			'000064_122': '392_ruby_15302', // 樋口一葉「十三夜」（別の可能性）
			'000064_392': '389_ruby_15296', // 樋口一葉「たけくらべ」（推測）
		};
		
		const mappingKey = `${cardNumber}_${workId}`;
		if (knownMappings[mappingKey]) {
			console.log(`Using known mapping for ${mappingKey}: ${knownMappings[mappingKey]}`);
			return [knownMappings[mappingKey]];
		}
		
		const url = `https://api.github.com/repos/aozorahack/aozorabunko_text/contents/cards/${cardNumber}/files`;
		const response = await fetch(url);
		
		if (!response.ok) {
			return [];
		}
		
		const files = await response.json();
		const matchingFiles = files
			.map(file => file.name)
			.filter(name => name.startsWith(workId + '_'));
		
		console.log(`Found matching files for work ID ${workId}:`, matchingFiles);
		return matchingFiles;
	} catch (error) {
		console.error('Error searching for actual filename:', error);
		return [];
	}
}

function getDemoText(fileName) {
	const demoTexts = {
		'1567_ruby_4948': `走れメロス
太宰治

メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。メロスには政治がわからぬ。メロスは、村の牧人である。笛を吹き、羊と遊んで暮して来た。けれども邪悪に対しては、人一倍に敏感であった。

（青空文庫より）

※GitHubからの取得に失敗したため、デモ用テキストを表示しています。`,
		
		'127_ruby_150': `羅生門
芥川龍之介

ある日の暮方の事である。一人の下人が、羅生門の下で雨やみを待っていた。

広い門の下には、この男のほかに誰もいない。ただ、所々丹塗の剥げた、大きな円柱に、蟋蟀が一匹とまっている。羅生門が、朱雀大路にある以上は、この男のほかにも、雨やみを待っている人があってもよさそうなものである。

（青空文庫より）

※GitHubからの取得に失敗したため、デモ用テキストを表示しています。`,
		
		'773_ruby_5968': `こころ
夏目漱石

私はその人を常に先生と呼んでいた。だからここでもただ先生と書くだけで本名は打ち明けない。これは世間を憚かる遠慮というよりも、その方が私にとって自然だからである。

（青空文庫より）

※GitHubからの取得に失敗したため、デモ用テキストを表示しています。`
	};
	
	return demoTexts[fileName] || `サンプルテキスト

この作品のテキストはまだ読み込まれていません。

※GitHubからの取得に失敗したため、デモ用テキストを表示しています。
実際の作品は青空文庫GitHubリポジトリから取得を試行します。`;
}