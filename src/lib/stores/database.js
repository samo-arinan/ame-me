import { openDB } from 'idb';

const DB_NAME = 'AozoraReader';
const DB_VERSION = 1;

let db = null;

export async function initDB() {
	if (db) return db;
	
	db = await openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// 書籍データストア
			if (!db.objectStoreNames.contains('books')) {
				const bookStore = db.createObjectStore('books', { keyPath: 'id' });
				bookStore.createIndex('title', 'title');
				bookStore.createIndex('author', 'author');
			}
			
			// 読書位置ストア
			if (!db.objectStoreNames.contains('positions')) {
				const positionStore = db.createObjectStore('positions', { keyPath: 'bookId' });
			}
			
			// しおりストア
			if (!db.objectStoreNames.contains('bookmarks')) {
				const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id', autoIncrement: true });
				bookmarkStore.createIndex('bookId', 'bookId');
			}
		}
	});
	
	return db;
}

export async function saveBook(bookId, bookData, textContent) {
	const database = await initDB();
	
	const bookRecord = {
		id: bookId,
		title: bookData.title,
		author: bookData.authors?.[0]?.full_name || '作者不明',
		textContent,
		downloadedAt: new Date().toISOString(),
		...bookData
	};
	
	await database.put('books', bookRecord);
	return bookRecord;
}

export async function getBook(bookId) {
	const database = await initDB();
	return await database.get('books', bookId);
}

export async function getAllBooks() {
	const database = await initDB();
	return await database.getAll('books');
}

export async function deleteBook(bookId) {
	const database = await initDB();
	await database.delete('books', bookId);
}

export async function savePosition(bookId, position) {
	const database = await initDB();
	await database.put('positions', { bookId, position });
}

export async function getPosition(bookId) {
	const database = await initDB();
	const result = await database.get('positions', bookId);
	return result?.position || 0;
}

export async function addBookmark(bookId, position, note = '') {
	const database = await initDB();
	const bookmark = {
		bookId,
		position,
		note,
		createdAt: new Date().toISOString()
	};
	return await database.add('bookmarks', bookmark);
}

export async function getBookmarks(bookId) {
	const database = await initDB();
	return await database.getAllFromIndex('bookmarks', 'bookId', bookId);
}

export async function deleteBookmark(bookmarkId) {
	const database = await initDB();
	await database.delete('bookmarks', bookmarkId);
}