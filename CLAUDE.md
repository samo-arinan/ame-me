# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

青空文庫リーダーアプリケーション - 縦書き巻物風の読書体験を提供するWebアプリケーション

### 主要機能
1. 青空文庫から作品をダウンロード・表示（テキスト形式、特殊記法対応）
2. 縦書きレイアウトで日本の伝統的な読書体験を再現
3. 巻物のような横スクロールインターフェース（タッチ操作専用）
4. OpenAI APIによる感情分析と連動した雨のビジュアルエフェクト
   - 悲しい場面：雨が強く降る
   - 楽しい場面：雨が弱まり虹が出る
   - 緊張する場面：風を伴う斜めの雨
   - 怒りの場面：雷を伴う激しい雨
5. オフライン対応（ダウンロード済み作品の保存）
6. 文字サイズ調整機能
7. しおり機能（読書位置の保存）

### 対応デバイス
- Android スマートフォン
- iPhone
- iPad
- Androidタブレット

## 技術スタック（2025年6月確定）

- プラットフォーム: Progressive Web App
- フロントエンド: Svelte + SvelteKit（コンパイル時最適化、最小バンドル）
- 縦書き実装: CSS writing-mode: vertical-rl + text-orientation: mixed
- アニメーション: Canvas + Lottie（軽量、PWA最適化）
- データ取得: GitHub API（aozorahack/aozorabunko_text）
- ストレージ: IndexedDB + Service Worker（オフライン対応）
- 感情分析: OpenAI GPT-4.1 nano（コスト効率、高速）
- 状態管理: Svelte Store（内蔵）

## 開発コマンド

プロジェクト初期化後に追加予定

## アーキテクチャ設計メモ（2025年6月更新）

### データ取得・処理システム
- GitHub API: `https://github.com/aozorahack/aozorabunko_text`
- ルビ変換: 《ふりがな》→ `<ruby>漢字<rt>ふりがな</rt></ruby>`
- エンコーディング: UTF-8（変換済み）
- オフライン: Service Worker + IndexedDB

### 感情分析システム（GPT-4.1 nano対応）
- プロンプト: 構造化出力（カンマ区切り）
- 段落単位: 文区切りで500-1000文字
- キャッシュ: 同一テキストの重複API呼び出し防止
- バッチ処理: 100万トークンコンテキストを活用

### 縦書きシステム（モバイル対応）
```css
.reader {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  /* iOS Safari対応 */
}
.reader ruby {
  ruby-position: over;  /* 2025年対応 */
}
```

### 雨エフェクトシステム（PWA最適化）
- Lottie: After Effects → JSON → Canvas
- 階層構造:
  - 背景（空、グラデーション）
  - 雨粒（メインアニメーション）
  - 特殊エフェクト（雷、虹、霧）
- 感情マッピング:
  - 悲しみ(0-10) → 雨量・青み
  - 喜び(0-10) → 虹の出現確率
  - 緊張(0-10) → 風の斜め具合
  - 平穏(0-10) → 霧の濃度
  - 怒り(0-10) → 雷の頻度

### パフォーマンス最適化（2025年基準）
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Canvas: オフスクリーンレンダリング
- Service Worker: アセットキャッシュ戦略
- Lazy Loading: 視界外コンテンツの遅延読み込み
- Image: WebP形式、圧縮最適化
- 雨粒制限: モバイル200個、デスクトップ500個

## 青空文庫データ取得方法（2025年6月調査）

### 1. 青空文庫API（推奨）
- **APIエンドポイント**: `https://www.aozorahack.net/api/v0.1`
- **主要API**:
  - 作品一覧: `GET /books`
  - 作品検索: `GET /books?title=検索語`
  - 作品詳細: `GET /books/{book_id}`
  - 作家一覧: `GET /persons`
- **レスポンス形式**: JSON
- **注意**: 過度なリクエストは避ける（レート制限あり）

### 2. GitHubリポジトリ（テキストファイル直接取得）
- **リポジトリ**: `aozorahack/aozorabunko_text`
- **アクセスURL**: `https://aozorahack.org/aozorabunko_text/cards/{作品番号}/files/{ファイル名}/{ファイル名}.txt`
- **エンコーディング**: Shift_JIS（要変換）
- **注意**: CORSの制限によりブラウザから直接アクセス不可

### 青空文庫テキスト記法
```
ルビ: 漢字《かんじ》 → <ruby>漢字<rt>かんじ</rt></ruby>
傍点: ［＃「文字」に傍点］ → <em class="boten">文字</em>
字下げ: ［＃ここから2字下げ］～［＃ここで字下げ終わり］
改ページ: ［＃改ページ］
```

## 実装上の注意事項

### CORS対策
- テキストファイルの取得にはプロキシサーバーが必要
- SvelteKitのサーバーサイド機能を活用

### 文字エンコーディング
```javascript
// Shift_JISからUTF-8への変換例
const decoder = new TextDecoder('shift_jis');
const text = decoder.decode(buffer);
```

### テスト駆動開発
- Vitestを使用（SvelteKitと相性が良い）
- 青空文庫APIのモック作成推奨
- E2Eテストには実際のAPIを使用（レート制限に注意）

### プロジェクト構造（推奨）
```
src/
├── lib/
│   ├── api/           # 青空文庫API関連
│   ├── parser/        # テキスト記法パーサー
│   ├── stores/        # Svelte Store
│   └── components/    # UIコンポーネント
├── routes/
│   ├── +page.svelte   # トップページ
│   ├── books/         # 作品一覧
│   └── reader/        # リーダー画面
└── app.html
```

### 開発フロー
1. まず横書きで基本機能を実装
2. 縦書きCSS対応を追加
3. PWA機能（Service Worker）を実装
4. 最後に感情分析・雨エフェクトを追加

### データキャッシュ戦略
- 作品メタデータ: 24時間キャッシュ
- テキストデータ: IndexedDBに永続保存
- API呼び出し結果: メモリキャッシュ（セッション中）

## Git管理方針

### コミットの基本ルール
- 機能追加・修正の区切りごとにコミット
- コミットメッセージは日本語で記述
- 従来のコミットメッセージ規約に従う：
  - `feat:` 新機能
  - `fix:` バグ修正  
  - `docs:` ドキュメント
  - `style:` フォーマット修正
  - `refactor:` リファクタリング
  - `test:` テスト追加・修正
  - `chore:` ビルド関連・補助ツール

### 推奨コミットタイミング
- 新規ファイル作成時
- 主要機能の実装完了時
- テストの追加・修正時
- 重要なバグ修正時
- 各作業セッションの終了時

### 注意事項
- WIP（Work In Progress）の場合は明記する
- 破壊的変更がある場合は `BREAKING CHANGE:` を含める
- 関連するIssue番号がある場合は記載する