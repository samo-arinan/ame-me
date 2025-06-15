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
			metadata.content = lines.slice(i + 1).join('\n');
			break;
		}
	}
	
	if (!metadata.content) {
		metadata.content = text;
	}
	
	return metadata;
}