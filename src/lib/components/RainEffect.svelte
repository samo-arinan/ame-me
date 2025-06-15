<script>
	import { onMount, onDestroy } from 'svelte';
	import { currentEmotion } from '$lib/stores/emotion.js';
	
	export let enabled = true;
	
	let canvas;
	let ctx;
	let animationFrame;
	let raindrops = [];
	let lightning = false;
	let rainbow = false;
	
	const MAX_RAINDROPS = 200;
	
	class Raindrop {
		constructor() {
			this.reset();
		}
		
		reset() {
			this.x = Math.random() * canvas.width;
			this.y = -10;
			this.speed = Math.random() * 5 + 2;
			this.size = Math.random() * 2 + 1;
			this.opacity = Math.random() * 0.5 + 0.3;
		}
		
		update(wind = 0) {
			this.y += this.speed;
			this.x += wind;
			
			if (this.y > canvas.height || this.x < -10 || this.x > canvas.width + 10) {
				this.reset();
			}
		}
		
		draw() {
			ctx.strokeStyle = `rgba(100, 150, 255, ${this.opacity})`;
			ctx.lineWidth = this.size;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x, this.y + this.size * 5);
			ctx.stroke();
		}
	}
	
	function createRaindrops(count) {
		raindrops = [];
		for (let i = 0; i < count; i++) {
			raindrops.push(new Raindrop());
		}
	}
	
	function drawBackground(emotion) {
		const { sadness, joy, tension, calm, anger } = emotion;
		
		// グラデーション背景
		const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
		
		// 感情に基づく色合い
		const darkness = Math.min(sadness + anger + tension, 10) / 10;
		const brightness = Math.min(joy + calm, 10) / 10;
		
		const skyColor = {
			r: Math.floor(135 - darkness * 80 + brightness * 20),
			g: Math.floor(206 - darkness * 100 + brightness * 30),
			b: Math.floor(235 - darkness * 50 + brightness * 20)
		};
		
		gradient.addColorStop(0, `rgb(${skyColor.r}, ${skyColor.g}, ${skyColor.b})`);
		gradient.addColorStop(1, `rgb(${Math.floor(skyColor.r * 0.7)}, ${Math.floor(skyColor.g * 0.7)}, ${Math.floor(skyColor.b * 0.7)})`);
		
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	function drawLightning() {
		if (!lightning) return;
		
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(Math.random() * canvas.width, 0);
		
		let x = Math.random() * canvas.width;
		let y = 0;
		
		for (let i = 0; i < 5; i++) {
			x += (Math.random() - 0.5) * 100;
			y += canvas.height / 5;
			ctx.lineTo(x, y);
		}
		
		ctx.stroke();
		
		// フラッシュ効果
		ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	function drawRainbow() {
		if (!rainbow) return;
		
		const centerX = canvas.width / 2;
		const centerY = canvas.height;
		const radius = canvas.width * 0.8;
		
		const colors = [
			'rgba(255, 0, 0, 0.3)',
			'rgba(255, 165, 0, 0.3)',
			'rgba(255, 255, 0, 0.3)',
			'rgba(0, 255, 0, 0.3)',
			'rgba(0, 0, 255, 0.3)',
			'rgba(75, 0, 130, 0.3)',
			'rgba(238, 130, 238, 0.3)'
		];
		
		colors.forEach((color, i) => {
			ctx.strokeStyle = color;
			ctx.lineWidth = 8;
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius - i * 10, Math.PI, 0);
			ctx.stroke();
		});
	}
	
	function animate() {
		if (!ctx || !enabled) return;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		const emotion = $currentEmotion;
		
		// 背景描画
		drawBackground(emotion);
		
		// 雨の強さと風の計算
		const rainIntensity = Math.min((emotion.sadness + emotion.anger) * 0.1, 1);
		const windStrength = emotion.tension * 0.5;
		const dropCount = Math.floor(MAX_RAINDROPS * rainIntensity);
		
		// 雨粒の数を調整
		if (raindrops.length > dropCount) {
			raindrops = raindrops.slice(0, dropCount);
		} else if (raindrops.length < dropCount) {
			while (raindrops.length < dropCount) {
				raindrops.push(new Raindrop());
			}
		}
		
		// 雨粒の更新と描画
		raindrops.forEach(drop => {
			drop.update(windStrength);
			drop.draw();
		});
		
		// 雷の表示判定
		lightning = emotion.anger > 7 && Math.random() < 0.02;
		if (lightning) {
			drawLightning();
		}
		
		// 虹の表示判定
		rainbow = emotion.joy > 6 && rainIntensity < 0.3;
		if (rainbow) {
			drawRainbow();
		}
		
		animationFrame = requestAnimationFrame(animate);
	}
	
	function resizeCanvas() {
		if (!canvas) return;
		
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		
		// 既存の雨粒をリセット
		raindrops.forEach(drop => drop.reset());
	}
	
	onMount(() => {
		if (!canvas) return;
		
		ctx = canvas.getContext('2d');
		resizeCanvas();
		createRaindrops(MAX_RAINDROPS);
		
		window.addEventListener('resize', resizeCanvas);
		
		if (enabled) {
			animate();
		}
	});
	
	onDestroy(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
		window.removeEventListener('resize', resizeCanvas);
	});
	
	$: if (enabled && ctx) {
		animate();
	} else if (!enabled && animationFrame) {
		cancelAnimationFrame(animationFrame);
		animationFrame = null;
	}
</script>

<canvas
	bind:this={canvas}
	class="rain-canvas"
	class:hidden={!enabled}
></canvas>

<style>
	.rain-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		pointer-events: none;
	}
	
	.hidden {
		display: none;
	}
</style>