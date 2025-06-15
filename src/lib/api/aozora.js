const API_BASE = 'https://www.aozorahack.net/api/v0.1';

export async function fetchBooks(query = '') {
	try {
		const url = query ? `${API_BASE}/books?title=${encodeURIComponent(query)}` : `${API_BASE}/books`;
		const response = await fetch(url);
		if (!response.ok) throw new Error('Failed to fetch books');
		return await response.json();
	} catch (error) {
		console.error('Error fetching books:', error);
		return [];
	}
}

export async function fetchBookDetail(bookId) {
	try {
		const response = await fetch(`${API_BASE}/books/${bookId}`);
		if (!response.ok) throw new Error('Failed to fetch book detail');
		return await response.json();
	} catch (error) {
		console.error('Error fetching book detail:', error);
		return null;
	}
}

export async function fetchBookText(cardNumber, fileName) {
	try {
		const response = await fetch(`/api/aozora-text/${cardNumber}/${fileName}`);
		if (!response.ok) throw new Error('Failed to fetch book text');
		return await response.text();
	} catch (error) {
		console.error('Error fetching book text:', error);
		return null;
	}
}