<script>
	import { apiKey, emotionAnalysisEnabled } from '$lib/stores/emotion.js';
	
	let showSettings = false;
	let tempApiKey = $apiKey;
	
	function saveSettings() {
		apiKey.set(tempApiKey);
		emotionAnalysisEnabled.set(!!tempApiKey);
		showSettings = false;
		
		// ローカルストレージに保存
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('openai-api-key', tempApiKey);
		}
	}
	
	function loadSettings() {
		if (typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem('openai-api-key');
			if (saved) {
				tempApiKey = saved;
				apiKey.set(saved);
				emotionAnalysisEnabled.set(true);
			}
		}
	}
	
	// コンポーネント初期化時に設定を読み込み
	loadSettings();
</script>

<button class="settings-toggle" on:click={() => showSettings = !showSettings}>
	設定
</button>

{#if showSettings}
	<div class="settings-overlay" on:click={() => showSettings = false}>
		<div class="settings-modal" on:click|stopPropagation>
			<h2>設定</h2>
			
			<div class="setting-group">
				<label for="api-key">OpenAI API Key</label>
				<input
					id="api-key"
					type="password"
					bind:value={tempApiKey}
					placeholder="sk-..."
				/>
				<p class="setting-description">
					感情分析機能を使用するには、OpenAI API キーが必要です。<br>
					キーはブラウザにのみ保存され、外部に送信されません。
				</p>
			</div>
			
			<div class="setting-actions">
				<button on:click={() => showSettings = false}>キャンセル</button>
				<button class="primary" on:click={saveSettings}>保存</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.settings-toggle {
		position: fixed;
		top: 1rem;
		right: 1rem;
		padding: 0.5rem 1rem;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		z-index: 1000;
	}
	
	.settings-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
	}
	
	.settings-modal {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		max-width: 400px;
		width: 90%;
		max-height: 80%;
		overflow-y: auto;
	}
	
	.setting-group {
		margin-bottom: 1.5rem;
	}
	
	.setting-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
	}
	
	.setting-group input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-family: monospace;
	}
	
	.setting-description {
		margin-top: 0.5rem;
		font-size: 0.9em;
		color: #666;
		line-height: 1.4;
	}
	
	.setting-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}
	
	.setting-actions button {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
	}
	
	.setting-actions button.primary {
		background: #007bff;
		color: white;
		border-color: #007bff;
	}
</style>