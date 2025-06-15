const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function analyzeEmotion(text, apiKey) {
	if (!apiKey || !text) return null;
	
	const prompt = `以下のテキストの感情を分析して、0-10の数値で返してください。カンマ区切りで返してください。
形式: 悲しみ,喜び,緊張,平穏,怒り

テキスト: ${text.slice(0, 1000)}`;

	try {
		const response = await fetch(OPENAI_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'system',
						content: 'あなたは感情分析の専門家です。テキストから感情を数値で分析してください。'
					},
					{
						role: 'user',
						content: prompt
					}
				],
				max_tokens: 50,
				temperature: 0.3
			})
		});
		
		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.status}`);
		}
		
		const data = await response.json();
		const emotionText = data.choices[0]?.message?.content?.trim();
		
		if (!emotionText) return null;
		
		const emotions = emotionText.split(',').map(v => parseFloat(v.trim()));
		
		if (emotions.length !== 5 || emotions.some(isNaN)) {
			console.warn('Invalid emotion analysis result:', emotionText);
			return null;
		}
		
		return {
			sadness: emotions[0],
			joy: emotions[1],
			tension: emotions[2],
			calm: emotions[3],
			anger: emotions[4]
		};
		
	} catch (error) {
		console.error('Emotion analysis error:', error);
		return null;
	}
}

export function createEmotionCache() {
	const cache = new Map();
	
	return {
		get: (text) => cache.get(text),
		set: (text, emotion) => cache.set(text, emotion),
		has: (text) => cache.has(text),
		clear: () => cache.clear()
	};
}