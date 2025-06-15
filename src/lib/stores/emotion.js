import { writable } from 'svelte/store';

export const currentEmotion = writable({
	sadness: 0,
	joy: 0,
	tension: 0,
	calm: 5,
	anger: 0
});

export const apiKey = writable('');
export const emotionAnalysisEnabled = writable(false);