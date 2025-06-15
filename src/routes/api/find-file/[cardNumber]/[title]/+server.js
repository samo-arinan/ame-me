export async function GET({ params }) {
	const { cardNumber, title } = params;
	
	try {
		// GitHubからカードの全ファイル一覧を取得
		const url = `https://api.github.com/repos/aozorahack/aozorabunko_text/contents/cards/${cardNumber}/files`;
		
		console.log('Searching for title:', title, 'in card:', cardNumber);
		
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch file list: ${response.status}`);
		}
		
		const files = await response.json();
		const fileNames = files.map(file => file.name);
		
		// 各ファイルの内容をチェックして、タイトルが一致するものを探す
		for (const fileName of fileNames) {
			try {
				const textUrl = `https://raw.githubusercontent.com/aozorahack/aozorabunko_text/master/cards/${cardNumber}/files/${fileName}/${fileName}.txt`;
				const textResponse = await fetch(textUrl);
				
				if (textResponse.ok) {
					const buffer = await textResponse.arrayBuffer();
					const decoder = new TextDecoder('shift_jis');
					const text = decoder.decode(buffer);
					
					// テキストの最初の20行でタイトルをチェック
					const lines = text.split('\n').slice(0, 20);
					const titleMatches = lines.some(line => 
						line.trim() === title || 
						line.trim().includes(title) ||
						title.includes(line.trim())
					);
					
					if (titleMatches) {
						console.log(`Found matching file: ${fileName} for title: ${title}`);
						return new Response(JSON.stringify({ 
							fileName,
							cardNumber,
							found: true 
						}), {
							headers: {
								'Content-Type': 'application/json',
								'Access-Control-Allow-Origin': '*'
							}
						});
					}
				}
			} catch (error) {
				// ファイル読み込みエラーは無視して次のファイルを試行
				continue;
			}
		}
		
		// 見つからない場合
		return new Response(JSON.stringify({ 
			fileName: null,
			cardNumber,
			found: false 
		}), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		
	} catch (error) {
		console.error('Error searching for file:', error);
		
		return new Response(JSON.stringify({ 
			fileName: null,
			cardNumber,
			found: false,
			error: error.message 
		}), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}