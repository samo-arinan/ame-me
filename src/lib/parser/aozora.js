export function parseAozoraText(text) {
	if (!text) return '';
	
	let parsed = text;
	
	// ルビ変換: 漢字《かんじ》 → <ruby>漢字<rt>かんじ</rt></ruby>
	parsed = parsed.replace(/([一-龠々]+)《([^》]+)》/g, '<ruby>$1<rt>$2</rt></ruby>');
	
	// 傍点: ［＃「文字」に傍点］
	parsed = parsed.replace(/［＃「([^」]+)」に傍点］/g, '<em class="boten">$1</em>');
	
	// 字下げ開始と終了
	parsed = parsed.replace(/［＃ここから(\d+)字下げ］/g, '<div class="indent-$1">');
	parsed = parsed.replace(/［＃ここで字下げ終わり］/g, '</div>');
	
	// 改ページ
	parsed = parsed.replace(/［＃改ページ］/g, '<div class="page-break"></div>');
	
	// 改行をbrタグに変換
	parsed = parsed.replace(/\n/g, '<br>');
	
	return parsed;
}

export function extractMetadata(text) {
	const lines = text.split('\n');
	const metadata = {
		title: '',
		author: '',
		content: ''
	};
	
	// 最初の数行からタイトルと著者を抽出
	for (let i = 0; i < Math.min(10, lines.length); i++) {
		const line = lines[i].trim();
		if (line && !metadata.title) {
			metadata.title = line;
		} else if (line && !metadata.author && line.length < 50) {
			metadata.author = line;
			break;
		}
	}
	
	// 実際の本文を抽出（青空文庫の構造に対応）
	let contentStartIndex = -1;
	
	// 説明部分の終了を示すマーカーを探す
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		// 説明部分が終わった後の空行から本文開始
		if (line.includes('-------') && i > 5) {
			// 次の空行以降から本文開始
			for (let j = i + 1; j < lines.length; j++) {
				if (lines[j].trim() === '') {
					contentStartIndex = j + 1;
					break;
				}
			}
			break;
		}
	}
	
	// マーカーが見つからない場合は、著者行以降の最初の実質的な内容から開始
	if (contentStartIndex === -1) {
		for (let i = 3; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line && !line.includes('【') && !line.includes('-------') && !line.includes('《》') && !line.includes('｜：')) {
				contentStartIndex = i;
				break;
			}
		}
	}
	
	if (contentStartIndex !== -1) {
		metadata.content = lines.slice(contentStartIndex).join('\n');
	} else {
		metadata.content = text;
	}
	
	return metadata;
}