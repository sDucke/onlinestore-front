
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
    'index.csr.html': {size: 3505, hash: 'd0e11bd3a3d408316e190f7937561da9c75b20edfd4e2a6308c4732a3effb0da', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 945, hash: 'e895fe3c0aa8222b64d56a6fd5cedd27a81ebf73a5c5cb70bd0c2a4ccb1115d2', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'publicar/index.html': {size: 14222, hash: '19d81330473eca2f9477a1381f12f1121666dbdfa35954af3341cbdc9b093e31', text: () => import('./assets-chunks/publicar_index_html.mjs').then(m => m.default)},
    'disenos/index.html': {size: 9728, hash: 'b421cb8370fa0887e450d8041c268f73f312c6990302fab968300d47d6083977', text: () => import('./assets-chunks/disenos_index_html.mjs').then(m => m.default)},
    'configurar-producto/index.html': {size: 16013, hash: 'c15e3239294647b631fcc689c388d59c70bfe329f1cd7baf81de02f03dcd430c', text: () => import('./assets-chunks/configurar-producto_index_html.mjs').then(m => m.default)},
    'index.html': {size: 14466, hash: 'bdf469f3bbe52acb8f749d5a93b3e000ca8ce5abc67e1317105e8ff7ea8d40b3', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-KCW5LW4X.css': {size: 9165, hash: 'Gnb6eLZzLCE', text: () => import('./assets-chunks/styles-KCW5LW4X_css.mjs').then(m => m.default)}
  },
};
