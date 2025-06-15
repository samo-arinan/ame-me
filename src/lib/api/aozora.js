const API_BASE = 'https://api.bungomail.com/v0';

export async function fetchBooks(query = '') {
	try {
		const url = query ? `${API_BASE}/books?作品名=/${encodeURIComponent(query)}/&limit=20` : `${API_BASE}/books?limit=20`;
		const response = await fetch(url);
		if (!response.ok) throw new Error('Failed to fetch books');
		const data = await response.json();
		return data.books || [];
	} catch (error) {
		console.error('Error fetching books:', error);
		return [];
	}
}

export async function fetchBookDetail(bookId) {
	try {
		const response = await fetch(`${API_BASE}/books?作品ID=${bookId}`);
		if (!response.ok) throw new Error('Failed to fetch book detail');
		const data = await response.json();
		return data.books?.[0] || null;
	} catch (error) {
		console.error('Error fetching book detail:', error);
		return null;
	}
}

export async function fetchBookText(cardNumber, fileName) {
	try {
		// 直接GitHubから取得
		const url = `https://raw.githubusercontent.com/aozorahack/aozorabunko_text/master/cards/${cardNumber}/files/${fileName}/${fileName}.txt`;
		const response = await fetch(url);
		if (!response.ok) throw new Error('Failed to fetch book text');
		
		const buffer = await response.arrayBuffer();
		const decoder = new TextDecoder('shift_jis');
		const text = decoder.decode(buffer);
		
		return text;
	} catch (error) {
		console.error('Error fetching book text:', error);
		return null;
	}
}