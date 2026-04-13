import { ref, computed, watch, onMounted } from "vue";
const svgCache = /* @__PURE__ */ new Map();
function useSvgIcon(getName, getSvg, getColor, dir = "/static/svg") {
  const svgRaw = ref("");
  const svgHtml = computed(() => {
    if (!svgRaw.value) return "";
    const color = getColor();
    if (!color) return svgRaw.value;
    return svgRaw.value.replace(/currentColor/g, color);
  });
  const svgDataUri = computed(() => {
    if (!svgRaw.value) return "";
    let svg = svgRaw.value;
    const color = getColor();
    if (color) svg = svg.replace(/currentColor/g, color);
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  });
  async function reload() {
    const inlineSvg = getSvg();
    if (inlineSvg) {
      svgRaw.value = inlineSvg;
      return;
    }
    const name = getName();
    if (!name) {
      svgRaw.value = "";
      return;
    }
    const cached = svgCache.get(name);
    if (cached) {
      svgRaw.value = cached;
      return;
    }
    const path = `${dir}/${name}.svg`;
    try {
      const text = await readSvgFile(path);
      const match = text.match(/<svg[\s\S]*?<\/svg>/i);
      if (match) {
        svgCache.set(name, match[0]);
        svgRaw.value = match[0];
      }
    } catch (e) {
      console.warn(`[useSvgIcon] Failed to load: ${name}`, e);
    }
  }
  onMounted(reload);
  watch(getName, reload);
  watch(getSvg, reload);
  return { svgRaw, svgHtml, svgDataUri, reload };
}
function readSvgFile(path) {
  return new Promise((resolve, reject) => {
    try {
      if (typeof plus !== "undefined" && plus.io) {
        ;
        plus.io.resolveLocalFileSystemURL(
          `_www/${path}`,
          (entry) => entry.file((file) => {
            const reader = new plus.io.FileReader();
            reader.onloadend = (evt) => resolve(evt.target.result);
            reader.onerror = (err) => reject(err);
            reader.readAsText(file, "utf-8");
          }),
          (err) => reject(err)
        );
        return;
      }
    } catch {
    }
    try {
      if (typeof uni !== "undefined" && uni.getFileSystemManager) {
        const fs = uni.getFileSystemManager();
        fs.readFile({
          filePath: path,
          encoding: "binary",
          success: (res) => resolve(res.data),
          fail: reject
        });
        return;
      }
    } catch {
    }
    if (typeof fetch !== "undefined") {
      fetch(path).then((r) => r.text()).then(resolve).catch(reject);
    } else {
      reject(new Error("[useSvgIcon] No file reader available"));
    }
  });
}
function preloadSvgIcons(icons) {
  for (const [name, svg] of Object.entries(icons)) {
    svgCache.set(name, svg);
  }
}
function clearSvgIconCache() {
  svgCache.clear();
}
export {
  clearSvgIconCache,
  preloadSvgIcons,
  useSvgIcon
};
