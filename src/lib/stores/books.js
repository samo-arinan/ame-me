import { writable } from 'svelte/store';

export const books = writable([]);
export const selectedBook = writable(null);
export const downloadedBooks = writable([]);