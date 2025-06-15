export async function GET({ params }) {
	const { cardNumber, fileName } = params;
	
	try {
		const url = `https://raw.githubusercontent.com/aozorahack/aozorabunko_text/master/cards/${cardNumber}/files/${fileName}/${fileName}.txt`;
		const response = await fetch(url);
		
		if (!response.ok) {
			return new Response('File not found', { status: 404 });
		}
		
		const buffer = await response.arrayBuffer();
		const decoder = new TextDecoder('shift_jis');
		const text = decoder.decode(buffer);
		
		return new Response(text, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	} catch (error) {
		console.error('Error fetching text:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}