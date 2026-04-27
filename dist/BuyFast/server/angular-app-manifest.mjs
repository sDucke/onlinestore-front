
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
  },
  {
    "renderMode": 1,
    "route": "/producto/*"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 4886, hash: '703ba44526366a518c4551781db79ccce6f2692b822cad2c0ff7aa8f29092b8a', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 945, hash: 'a5f6c48c050db2cc21ec899481000e0a3630646fdfe11960af02fd416d4f8bb5', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 15921, hash: 'd08463fd3c9b23546b487524c2c5c0c54e8f7cbfb6e6ec1752c5e0896859f8e7', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'configurar-producto/index.html': {size: 17468, hash: 'c711c015923fdb5e8b36f05f570a3c86f7bbe6b88f8d78bda007dc1b383dfb2f', text: () => import('./assets-chunks/configurar-producto_index_html.mjs').then(m => m.default)},
    'publicar/index.html': {size: 15677, hash: '23b48ad92d19aa55caaf1736d0cae7d767d22ab1f27e1cc174625c9659d8d227', text: () => import('./assets-chunks/publicar_index_html.mjs').then(m => m.default)},
    'disenos/index.html': {size: 11211, hash: '8ee73b98db7a91d7064b14f0e4a2fce79f8b79689bb4a7d78ba83d037c08951e', text: () => import('./assets-chunks/disenos_index_html.mjs').then(m => m.default)},
    'styles-JFLXUV23.css': {size: 11732, hash: '8Qf2OSEsJcE', text: () => import('./assets-chunks/styles-JFLXUV23_css.mjs').then(m => m.default)}
  },
};
