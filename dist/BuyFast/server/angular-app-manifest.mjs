
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
    'index.csr.html': {size: 3505, hash: '5805db6730d750b4965a37081ff8fab4c5d803b719e49f741580d9d62b194e2e', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 945, hash: 'd9f65fb1503b7e6825458d28d3f1cb7754424145092b1103813d5cc729c565fb', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'publicar/index.html': {size: 7809, hash: '999cdc9d9163518313c11f3ab18cf9d9eaf7160465ee526fd102c23021172b4e', text: () => import('./assets-chunks/publicar_index_html.mjs').then(m => m.default)},
    'index.html': {size: 13345, hash: '4fe9ef8293d076451882dd44a89e42cfe2df2587a648e94db5143b1178eec947', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'configurar-producto/index.html': {size: 13084, hash: '0be59827cfe04ad5aa7455dc11fcaf9cfb38b40538f81c2d37e8fb9834642ef0', text: () => import('./assets-chunks/configurar-producto_index_html.mjs').then(m => m.default)},
    'disenos/index.html': {size: 7670, hash: 'c05a93f29a7901536009e6ec0dd0b3e37d516e8e737f69b2120bcddc7e4721f7', text: () => import('./assets-chunks/disenos_index_html.mjs').then(m => m.default)},
    'styles-RGVZQNWG.css': {size: 9137, hash: 'Vk4uB0u+TIE', text: () => import('./assets-chunks/styles-RGVZQNWG_css.mjs').then(m => m.default)}
  },
};
