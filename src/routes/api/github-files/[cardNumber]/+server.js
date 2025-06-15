export async function GET({ params }) {
	const { cardNumber } = params;
	
	try {
		// GitHubからカードの実際のファイル一覧を取得
		const url = `https://api.github.com/repos/aozorahack/aozorabunko_text/contents/cards/${cardNumber}/files`;
		
		console.log('Fetching file list from:', url);
		
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch file list: ${response.status}`);
		}
		
		const files = await response.json();
		
		// ファイル名の一覧を返す
		const fileNames = files.map(file => file.name);
		
		return new Response(JSON.stringify(fileNames), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('Error fetching file list:', error);
		
		return new Response(JSON.stringify([]), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}