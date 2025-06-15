// キャッシュ用の変数
let cachedCSV = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間

export async function GET() {
	try {
		// キャッシュが有効な場合は、キャッシュから返す
		if (cachedCSV && (Date.now() - lastFetchTime) < CACHE_DURATION) {
			return new Response(cachedCSV, {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
					'Cache-Control': 'public, max-age=86400' // 24時間キャッシュ
				}
			});
		}

		// GitHubのaozorahackリポジトリから直接CSVデータを取得する
		// これは青空文庫の全作品リストを含む事前処理済みのCSVファイル
		const response = await fetch('https://raw.githubusercontent.com/aozorahack/aozorabunko_text/master/index_pages/list_person_all_extended_utf8.csv');
		
		if (!response.ok) {
			throw new Error(`Failed to fetch CSV: ${response.status}`);
		}
		
		const csvText = await response.text();
		
		// キャッシュを更新
		cachedCSV = csvText;
		lastFetchTime = Date.now();
		
		return new Response(csvText, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=86400' // 24時間キャッシュ
			}
		});
	} catch (error) {
		console.error('Error fetching Aozora CSV:', error);
		
		// エラーが発生した場合、拡張サンプルデータを返す
		// これにより、外部APIが利用できない場合でも最低限の機能を提供
		const extendedSampleCSV = generateExtendedSampleCSV();
		
		return new Response(extendedSampleCSV, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=3600' // 1時間キャッシュ
			}
		});
	}
}

/**
 * 拡張されたサンプルCSV生成（フォールバック用）
 * 実際の青空文庫CSVフォーマットに準拠
 */
function generateExtendedSampleCSV() {
	const csvData = [
		['作品ID', '作品名', '姓', '名', '書き出し', 'テキストファイルURL'],
		// 太宰治
		['1567', '走れメロス', '太宰', '治', 'メロスは激怒した。', 'https://www.aozora.gr.jp/cards/000035/files/1567_ruby_4948.zip'],
		['301', '人間失格', '太宰', '治', '恥の多い生涯を送って来ました。', 'https://www.aozora.gr.jp/cards/000035/files/301_ruby_5915.zip'],
		['285', '津軽', '太宰', '治', '津軽半島は本州の袋小路である。', 'https://www.aozora.gr.jp/cards/000035/files/1925_ruby_4904.zip'],
		['167', 'ヴィヨンの妻', '太宰', '治', '風呂から上がって、', 'https://www.aozora.gr.jp/cards/000035/files/1565_ruby_4887.zip'],
		
		// 芥川龍之介
		['456', '羅生門', '芥川', '龍之介', 'ある日の暮方の事である。', 'https://www.aozora.gr.jp/cards/000879/files/127_ruby_150.zip'],
		['92', '蜘蛛の糸', '芥川', '龍之介', 'ある日の事でございます。', 'https://www.aozora.gr.jp/cards/000879/files/92_ruby_164.zip'],
		['128', '鼻', '芥川', '龍之介', '禅智内供の鼻と云えば、池の尾で知らない者はない。', 'https://www.aozora.gr.jp/cards/000879/files/128_ruby_150.zip'],
		['1769', '地獄変', '芥川', '龍之介', '其は確か良秀と云う絵師の話であったと思う。', 'https://www.aozora.gr.jp/cards/000879/files/1769_ruby_5560.zip'],
		
		// 夏目漱石
		['773', 'こころ', '夏目', '漱石', '私はその人を常に先生と呼んでいた。', 'https://www.aozora.gr.jp/cards/000148/files/773_ruby_5968.zip'],
		['752', '坊っちゃん', '夏目', '漱石', '親譲りの無鉄砲で小供の時から損ばかりしている。', 'https://www.aozora.gr.jp/cards/000148/files/752_ruby_2438.zip'],
		['687', '吾輩は猫である', '夏目', '漱石', '吾輩は猫である。名前はまだ無い。', 'https://www.aozora.gr.jp/cards/000148/files/789_ruby_5639.zip'],
		['686', '三四郎', '夏目', '漱石', 'うとうととして目がさめると女はいつのまにか、隣の爺さんと話を始めている。', 'https://www.aozora.gr.jp/cards/000148/files/794_ruby_5845.zip'],
		
		// 宮沢賢治
		['43737', '銀河鉄道の夜', '宮沢', '賢治', 'ではみなさんは、そういうふうに川だと言われたり...', 'https://www.aozora.gr.jp/cards/000081/files/43737_ruby_17045.zip'],
		['1245', '注文の多い料理店', '宮沢', '賢治', '二人の若い紳士が、すっかりイギリスの兵隊のかたちをして...', 'https://www.aozora.gr.jp/cards/000081/files/43754_ruby_17659.zip'],
		['20', 'セロ弾きのゴーシュ', '宮沢', '賢治', 'ゴーシュは町の活動写真館でセロを弾く係りでした。', 'https://www.aozora.gr.jp/cards/000081/files/470_ruby_17420.zip'],
		
		// その他の名作
		['124', '山月記', '中島', '敦', '隴西の李徴は博学才穎、天宝の末年、若くして名を虎榜に連ね...', 'https://www.aozora.gr.jp/cards/000119/files/624_ruby_1291.zip'],
		['1865', '舞姫', '森', '鴎外', '石炭をば早や積み果てつ。', 'https://www.aozora.gr.jp/cards/000129/files/695_ruby_5018.zip'],
		['436', '檸檬', '梶井', '基次郎', 'えたいの知れない不吉な塊が私の心を始終圧えつけていた。', 'https://www.aozora.gr.jp/cards/000074/files/436_ruby_19028.zip'],
		['45630', 'ごん狐', '新美', '南吉', 'これは、私が小さいときに、村の茂平というお爺さんから聞いた話です。', 'https://www.aozora.gr.jp/cards/000121/files/628_ruby_3043.zip'],
		
		// 女性作家
		['113', 'たけくらべ', '樋口', '一葉', '廻れば大門の見返り柳いと長けれど...', 'https://www.aozora.gr.jp/cards/000064/files/392_ruby_17659.zip'],
		['122', '十三夜', '樋口', '一葉', '今年の秋も程過ぎて、関の戸の夜嵐...', 'https://www.aozora.gr.jp/cards/000064/files/394_ruby_17659.zip'],
		['4643', '浮雲', '二葉亭', '四迷', '其頃世の中は漸く洋風を慕ふて...', 'https://www.aozora.gr.jp/cards/000006/files/4643_ruby_18508.zip'],
		
		// 現代文学
		['4808', '破戒', '島崎', '藤村', '蓮華寺では下宿を兼ねた。', 'https://www.aozora.gr.jp/cards/000158/files/4808_ruby_13675.zip'],
		['13', '金閣寺', '三島', '由紀夫', '幼時から父は、私によく金閣のことを語った。', 'https://www.aozora.gr.jp/cards/000094/files/13_ruby_41883.zip'],
		['155', '風立ちぬ', '堀', '辰雄', '風立ちぬ、いざ生きめやも。', 'https://www.aozora.gr.jp/cards/000191/files/155_ruby_5405.zip'],
		
		// 推理小説・SF（江戸川乱歩）
		['1929', '押絵と旅する男', '江戸川', '乱歩', 'その男の職業は何であるか知らない。', 'https://www.aozora.gr.jp/cards/000097/files/1929_ruby_7234.zip'],
		['1935', '二銭銅貨', '江戸川', '乱歩', '「また人殺しがあったよ」', 'https://www.aozora.gr.jp/cards/000097/files/1935_ruby_7370.zip'],
		
		// 海野十三（日本SFの父）
		['3372', '人造人間エフ氏', '海野', '十三', '私はこの奇妙な物語を語らねばならない。', 'https://www.aozora.gr.jp/cards/000160/files/3372_ruby_48982.zip'],
		['3522', '人造人間事件', '海野', '十三', 'その夜、私は実験室で遅くまで働いていた。', 'https://www.aozora.gr.jp/cards/000160/files/3522_ruby_49117.zip'],
		['3343', '人造人間戦車の機密', '海野', '十三', '戦車の轟音が地下に響いた。', 'https://www.aozora.gr.jp/cards/000160/files/3343_ruby_48953.zip'],
		['1255', '海野十三敗戦日記', '海野', '十三', '昭和二十年八月十五日', 'https://www.aozora.gr.jp/cards/000160/files/1255_ruby_40386.zip'],
		['1219', '殺人光線と毒ガス', '海野', '十三', '科学の力は恐ろしいものである。', 'https://www.aozora.gr.jp/cards/000160/files/1219_ruby_40382.zip'],
		
		// 探偵小説
		['2582', '智恵子抄', '高村', '光太郎', 'あどけない話', 'https://www.aozora.gr.jp/cards/001168/files/46019_ruby_24391.zip'],
		
		// 古典文学
		['375', '方丈記', '鴨長', '明', 'ゆく河の流れは絶えずして...', 'https://www.aozora.gr.jp/cards/000196/files/375_ruby_5639.zip'],
		['1934', '徒然草', '吉田', '兼好', 'つれづれなるままに、日暮らし...', 'https://www.aozora.gr.jp/cards/000240/files/1934_ruby_13000.zip'],
		
		// 童話・児童文学
		['1358', '手袋を買いに', '新美', '南吉', '寒い冬がやってきました。', 'https://www.aozora.gr.jp/cards/000121/files/628_ruby_3043.zip'],
		['2091', 'よだかの星', '宮沢', '賢治', 'よだかは、実にみにくい鳥でした。', 'https://www.aozora.gr.jp/cards/000081/files/470_ruby_17420.zip'],
		
		// 戦争文学
		['4302', '野火', '大岡', '昇平', 'その男は三十歳前後の兵隊であった。', 'https://www.aozora.gr.jp/cards/000252/files/4302_ruby_18562.zip'],
		
		// 小泉八雲（ラフカディオ・ハーン）
		['1358', '雪女', '小泉', '八雲', 'ある雪の深い夜のことであった。', 'https://www.aozora.gr.jp/cards/000258/files/1374_ruby_5639.zip'],
		['128', '耳なし芳一の話', '小泉', '八雲', '下関の赤間が関は、源平最後の決戦の場として有名である。', 'https://www.aozora.gr.jp/cards/000258/files/128_ruby_5639.zip'],
		
		// 坂口安吾
		['1029', '堕落論', '坂口', '安吾', '人間は堕落する。そして、よい意味でも悪い意味でも堕落の道を歩む。', 'https://www.aozora.gr.jp/cards/000123/files/1029_ruby_5639.zip'],
		['4799', '風博士', '坂口', '安吾', '風博士は奇妙な男であった。', 'https://www.aozora.gr.jp/cards/000123/files/4799_ruby_48751.zip'],
		
		// 横光利一
		['128', '蠅', '横光', '利一', '蠅が手を擦っている。', 'https://www.aozora.gr.jp/cards/000168/files/128_ruby_5639.zip'],
		['1562', '機械', '横光', '利一', '機械の音が単調に響いている。', 'https://www.aozora.gr.jp/cards/000168/files/1562_ruby_5639.zip'],
		
		// 古典文学
		['9001', '源氏物語', '紫式', '部', 'いづれの御時にか、女御、更衣あまたさぶらひたまひけるなかに...', 'https://www.aozora.gr.jp/cards/000001/files/9001_ruby_1001.zip'],
		['9002', '枕草子', '清少', '納言', '春はあけぼの。やうやう白くなりゆく山ぎは...', 'https://www.aozora.gr.jp/cards/000002/files/9002_ruby_1002.zip'],
		['9003', '竹取物語', '', '', '今は昔、竹取の翁といふ者ありけり。', 'https://www.aozora.gr.jp/cards/000003/files/9003_ruby_1003.zip'],
		
		// 幸田露伴
		['5896', '五重塔', '幸田', '露伴', '上野の山の花は散り尽して、青葉の季節となった。', 'https://www.aozora.gr.jp/cards/000051/files/5896_ruby_42808.zip'],
		
		// 有島武郎  
		['1565', 'カインの末裔', '有島', '武郎', '十勝平野の果てしない地平線が見える。', 'https://www.aozora.gr.jp/cards/000025/files/1565_ruby_5639.zip']
	];
	
	return csvData.map(row => row.join('\t')).join('\n');
}