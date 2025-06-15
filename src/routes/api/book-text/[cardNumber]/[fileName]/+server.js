export async function GET({ params }) {
	const { cardNumber, fileName } = params;
	
	try {
		console.log(`Starting comprehensive file search for: ${cardNumber}/${fileName}`);
		
		// 段階的フォールバック機能
		const result = await findAozoraTextWithFallback(cardNumber, fileName);
		
		if (result.success) {
			console.log(`✅ Successfully found file using pattern: ${result.pattern}`);
			return new Response(result.text, {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
					'Access-Control-Allow-Origin': '*',
					'X-File-Pattern': result.pattern // デバッグ用
				}
			});
		} else {
			console.log(`❌ All patterns failed for: ${cardNumber}/${fileName}`);
			console.log(`Available files: ${result.availableFiles?.slice(0, 5).join(', ')}...`);
			
			throw new Error(`Failed to find file after trying all patterns`);
		}
		
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

// 段階的フォールバック機能 - 複数のパターンを順次試行
async function findAozoraTextWithFallback(cardNumber, fileName) {
	const workId = fileName.split('_')[0];
	const patterns = [];
	
	// パターン1: 元のファイル名そのまま
	patterns.push({
		name: 'original',
		url: `https://raw.githubusercontent.com/aozorahack/aozorabunko_text/master/cards/${cardNumber}/files/${fileName}/${fileName}.txt`,
		fileName: fileName
	});
	
	// パターン2: 既知のマッピング
	const knownMappings = {
		'000064_394': '386_ruby_15290', // 樋口一葉「十三夜」
		'000064_122': '392_ruby_15302', // 樋口一葉「十三夜」（別の可能性）
		'000064_392': '389_ruby_15296', // 樋口一葉「たけくらべ」
		'000081_43737': '43733_ruby_17836', // 宮沢賢治「銀河鉄道の夜」（推測）
		'000035_1925': '1047_ruby_20129', // 太宰治「津軽」（推測）
	};
	
	const mappingKey = `${cardNumber}_${workId}`;
	if (knownMappings[mappingKey]) {
		const mappedFileName = knownMappings[mappingKey];
		patterns.push({
			name: 'known_mapping',
			url: `https://raw.githubusercontent.com/aozorahack/aozorabunko_text/master/cards/${cardNumber}/files/${mappedFileName}/${mappedFileName}.txt`,
			fileName: mappedFileName
		});
	}
	
	// パターン3〜N: GitHub APIで類似ファイルを検索
	try {
		const similarFiles = await findSimilarFiles(cardNumber, workId);
		for (const similarFile of similarFiles) {
			patterns.push({
				name: 'similar_file',
				url: `https://raw.githubusercontent.com/aozorahack/aozorabunko_text/master/cards/${cardNumber}/files/${similarFile}/${similarFile}.txt`,
				fileName: similarFile
			});
		}
	} catch (error) {
		console.log('Failed to get similar files from GitHub API:', error);
	}
	
	// 各パターンを順次試行
	for (const pattern of patterns) {
		try {
			console.log(`🔍 Trying pattern ${pattern.name}: ${pattern.fileName}`);
			
			const response = await fetch(pattern.url);
			
			if (response.ok) {
				const buffer = await response.arrayBuffer();
				const decoder = new TextDecoder('shift_jis');
				const text = decoder.decode(buffer);
				
				return {
					success: true,
					text: text,
					pattern: pattern.name,
					fileName: pattern.fileName
				};
			} else {
				console.log(`❌ Pattern ${pattern.name} failed: ${response.status}`);
			}
		} catch (error) {
			console.log(`❌ Pattern ${pattern.name} error:`, error.message);
		}
	}
	
	// すべて失敗した場合、利用可能なファイル一覧を返す
	try {
		const availableFiles = await getAllAvailableFiles(cardNumber);
		return {
			success: false,
			availableFiles: availableFiles
		};
	} catch (error) {
		return {
			success: false,
			availableFiles: []
		};
	}
}

// GitHub APIで類似ファイルを検索
async function findSimilarFiles(cardNumber, workId) {
	try {
		const url = `https://api.github.com/repos/aozorahack/aozorabunko_text/contents/cards/${cardNumber}/files`;
		const response = await fetch(url);
		
		if (!response.ok) {
			return [];
		}
		
		const files = await response.json();
		const fileNames = files.map(file => file.name);
		
		// 複数の類似性検索を実行
		const similarFiles = [];
		
		// 1. 作品IDで始まるファイル
		similarFiles.push(...fileNames.filter(name => name.startsWith(workId + '_')));
		
		// 2. 作品IDを含むファイル
		similarFiles.push(...fileNames.filter(name => name.includes(workId) && !name.startsWith(workId + '_')));
		
		// 3. 類似した番号のファイル（±10以内）
		const baseNum = parseInt(workId);
		if (!isNaN(baseNum)) {
			for (let i = baseNum - 10; i <= baseNum + 10; i++) {
				similarFiles.push(...fileNames.filter(name => name.startsWith(i + '_')));
			}
		}
		
		// 重複を除去して返す
		return [...new Set(similarFiles)];
	} catch (error) {
		console.error('Error finding similar files:', error);
		return [];
	}
}

// 利用可能なすべてのファイルを取得
async function getAllAvailableFiles(cardNumber) {
	try {
		const url = `https://api.github.com/repos/aozorahack/aozorabunko_text/contents/cards/${cardNumber}/files`;
		const response = await fetch(url);
		
		if (!response.ok) {
			return [];
		}
		
		const files = await response.json();
		return files.map(file => file.name);
	} catch (error) {
		console.error('Error getting available files:', error);
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