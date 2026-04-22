
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/publicar"
  },
  {
    "renderMode": 2,
    "route": "/configurar-producto"
  },
  {
    "renderMode": 2,
    "route": "/disenos"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 4886, hash: 'cb1b26ddbfe922a1dc12f73a42d41860fa40d3384a279e39722b7159bc4c6fa0', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 945, hash: '4dc0c523a85619fd5643ad8d82c5b798f75edbfbbca98177f40ce35e9c9a8a5f', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 14714, hash: '5fbe0178f0658435905c123262e1b4f2a21e0f512ac05f7bf1b88460b0ceaefd', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'disenos/index.html': {size: 9996, hash: '39d917a76e61ef90858fa32f80d79d3c883a03c171aab80e8a4f80cb4508651a', text: () => import('./assets-chunks/disenos_index_html.mjs').then(m => m.default)},
    'publicar/index.html': {size: 15016, hash: 'f5491962e4559b5f119b1d04e30b120bd14cd8bc1e9b7b458329fea5aecf38ef', text: () => import('./assets-chunks/publicar_index_html.mjs').then(m => m.default)},
    'configurar-producto/index.html': {size: 15410, hash: '005edb87ad332e64f21e8cf3be9c919d7f80fa5229ce0aa10c75c2c8486a2fc5', text: () => import('./assets-chunks/configurar-producto_index_html.mjs').then(m => m.default)},
    'styles-JFLXUV23.css': {size: 11732, hash: '8Qf2OSEsJcE', text: () => import('./assets-chunks/styles-JFLXUV23_css.mjs').then(m => m.default)}
  },
};
