<template>
	<!-- #ifdef MP -->
	<view class="tt-svg" :style="style" @click="$emit('click')" />
	<!-- #endif -->
	<!-- #ifndef MP -->
	<view class="tt-svg" v-html="svgHtml" :style="style" @click="$emit('click')" />
	<!-- #endif -->
</template>

<script>
const SVG_FILE_PATH = '/static/svg';

export default {
	name: 'TtSvg',
	options: {
		virtualHost: true
	},
	props: {
		name: {
			type: String,
			default: '',
			required: true
		},
		color: {
			type: String,
			default: '',
		},
		size: {
			type: [Number, String, Array],
			default: 42
		},
		width: {
			type: [String, Number],
			default: 40
		},
		height: {
			type: [String, Number],
			default: 40
		},
		unit: {
			type: String,
			default: 'rpx'
		},
		watch: {
			type: Boolean,
			default: process.env.NODE_ENV === 'development'
		},
	},
	data() {
		return {
			svgHtml: '',
		};
	},
	computed: {
		style() {
			const { size, unit, svgHtml } = this;
			let { width, height } = this;
			if (size) {
				if (Object.prototype.toString.call(size) === '[object Array]') {
					[width = width, height = height] = size;
				} else {
					[width, height] = [size, size];
				}
			}
			let res = `width:${width}${unit};height:${height}${unit};`;
			// #ifdef MP
			res += `background-image:url("data:image/svg+xml,${encodeURIComponent(svgHtml)}");`;
			// #endif
			return res;
		},
	},
	created() {
		this.getSvgHtml();
		if (this.watch) {
			this.$watch('$props', () => this.getSvgHtml(), { deep: true })
		}
	},
	methods: {
		async getSvgHtml() {
			const ctx = await this.fileReader(this.name);
			const regex = /<svg[\s\S]*?<\/svg>/i;
			const matches = ctx.match(regex);
			if (!matches) {
				console.warn(`No SVG found in ${this.name}.svg`);
				return;
			}
			let [html] = matches;
			this.svgHtml = this.setSvgColor(html);
		},
		fileReader(name) {
			const path = `${SVG_FILE_PATH}/${name}.svg`;
			return new Promise((resolve, reject) => {
				// #ifdef APP-PLUS
				plus.io.resolveLocalFileSystemURL(
					`_www/${path}`,
					entry => entry.file((file) => {
						const fileReader = new plus.io.FileReader();
						fileReader.onloadend = (evt) => resolve(evt.target.result);
						fileReader.onerror = (error) => reject(error);
						fileReader.readAsText(file, 'utf-8');
					}),
					error => reject(error)
				);
				// #endif
				// #ifdef MP
				const fs = uni.getFileSystemManager();
				fs.readFile({
					filePath: path,
					encoding: 'binary',
					success: (res) => resolve(res.data),
					fail: reject,
				});
				// #endif
				// #ifndef APP-PLUS  || MP
				fetch(path)
					.then(res => res.text())
					.then(ctx => resolve(ctx))
					.catch(err => reject(err))
				// #endif
			})
		},
		setSvgColor(html) {
			if (!this.color) return html;
			return html.replace(/(fill|stroke)="(?!none)[^"]*"/g, (match, p1, p2) => {
				return `${p1}="${p2 === 'none' ? 'none' : this.color}"`
			})
		}
	},
}
</script>

<style scoped>
/* #ifndef MP */
:deep(svg) {
	width: 100% !important;
	height: 100% !important;
}
/* #endif */
/* #ifdef MP */
.tt-svg {
	background-repeat: no-repeat;
	background-size: contain;
}
/* #endif */
</style>
