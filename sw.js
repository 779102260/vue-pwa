/* eslint-disable no-undef */
// pwa插件要求必须使用这个插件
// 实际上，这里workbox插件用的并不多，主要用于注册sw，其他功能由自己实现

workbox.precaching.precache(['index.html'])

const ISDEV = false
const CACHE = 'DW'
// 不缓存的请求url（包含即可）
const networkOnlyList = ['service-worker.js']
// 优先读取缓存列表 （对于静态资源而言，此部分由http cache完成速度更快）
const cacheFirstList = []
/**
 * 请求是否不需要缓存
 * @param {Object} request 请求体
 */
function isNetworkOnly(request) {
  // 非get请求不缓存
  if (request.method !== 'GET') {
    return true
  }
  // 不缓存列表
  for (const key of networkOnlyList) {
    if (request.url.indexOf(key) !== -1) {
      return true
    }
  }
  return false
}

/**
 * 判断是否是优先读取缓存的请求
 * @param {Object} request 请求体
 */
function isCacheFirst(request) {
  for (const key of cacheFirstList) {
    if (request.url.indexOf(key) !== -1) {
      return true
    }
  }
}

// 请求拦截
if (!ISDEV) {
  self.addEventListener('fetch', function(event) {
    const request = event.request

    // 不缓存
    if (isNetworkOnly(request)) {
      event.respondWith(networkModel(request))
      return
    }
    // 缓存优先
    if (isCacheFirst(request)) {
      event.respondWith(cacheFirstModel(request))
      return
    }
    // 网络优先
    event.respondWith(networkFisrtModel(request))
  })
}

/**
 * 网络优先，先请求，失败读取缓存（适用于get接口）
 * @param {*} request 请求体
 */
function networkFisrtModel(request) {
  return fetchAndCache(request).catch(function(err) {
    return getCache(request).then(res => {
      return res || err
    })
  })
}

/**
 * 缓存优先，先读取缓存，没有再请求（适用于不变的静态资源）
 * @param {Object} request 请求体
 */
function cacheFirstModel(request) {
  return getCache(request).then(res => {
    return res || fetchAndCache(request)
  })
}

/**
 * 仅网络（适用于post等接口，以及不缓存的请求）
 * @param {Object} request 请求体
 */
function networkModel(request) {
  return fetch(request)
}

/**
 * 发送请求
 * @param {Object} request 请求体
 */
function fetchAndCache(request) {
  return fetch(request).then(responese => {
    const responeseClone = responese.clone() // 复制一份响应数据
    storeCache(request, responeseClone)
    return responese
  })
}

/**
 * 缓存响应
 * @param {Object} request 请求体
 * @param {Object} responese 响应体
 */
function storeCache(request, responese) {
  caches
    .open(CACHE)
    .then(cache => {
      responese.swTime = new Date()
      return cache.put(request, responese)
    })
    .catch(err => {})
}

/**
 * 获取缓存
 * @param {Object} request 请求体
 */
function getCache(request) {
  if (isVueRoute(request)) {
    return getCache('index.html')
  }
  return caches
    .match(request)
    .then(res => {
      return res
    })
    .catch(err => {
      return undefined
    })
}

/**
 * 判断是不是路由请求
 * @param {Object} request
 */
function isVueRoute(request) {
  return request && request.mode === 'navigate'
}
