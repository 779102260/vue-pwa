pwa功能：

1. 支持离线使用
2. 支持应用添加到桌面

本`sw.js`主要做以下工作

1. 预缓存主页(index.html)，断网时单页面刷新，route请求将返回已缓存的主页
2. 渐进式缓存GET请求，断网时（或请求失败）时将使用已缓存内容

# 使用步骤

1. vue添加pwa插件

如果创建时没选择pwa，可以添加方式如下

```
vue add @vue/pwa`
```

此插件会添加一些文件

- `src`里增加了`registerServiceWorker.js`
- `public`里增加了`img`文件夹，这里面的图标需要替换成自己项目的图标

pwa插件资料： https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-pwa/README.md

2. 将`sw.js`移入`src`里

3. 在`vue.config.js`里配置pwa插件

```js

module.exports = {
	// ... 其他配置
	pwa: {
	    name: 'xx',
	    themeColor: '#323232',
	    msTileColor: '#f00',
	    workboxPluginMode: 'InjectManifest', // 使用InjectManifest插件
	    workboxOptions: {
	     	swSrc: 'src/sw.js', // sw.js文件位置
	     	swDest: 'service-worker.js', // 生成到dest目录的文件名
	     	importWorkboxFrom: 'local', // 选local
	     	importsDirectory: 'sw' // service worker相关代码集中放在sw文件夹里
	    }
  	}
}
```

# sw.js 配置

1. workbox.precaching.precache(['index.html'])

预缓存`index.html`文件（指根文件）

2. `ISDEV` 当本地开发（不开发sw）时改为true则会去掉sw拦截请求（network比较乱）

3. `CACHE` 缓存的名称

4. `networkOnlyList` 不缓存的请求

5. `cacheFirstList` 缓存优先的请求