import { writable } from 'svelte/store';

export const currentPosition = writable(0);
export const fontSize = writable(16);
export const bookmarks = writable([]);