
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/traffic-list",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/traffic-list"
  },
  {
    "renderMode": 2,
    "route": "/traffic"
  },
  {
    "renderMode": 2,
    "route": "/admin"
  },
  {
    "renderMode": 2,
    "route": "/data"
  },
  {
    "renderMode": 2,
    "route": "/monitor"
  },
  {
    "renderMode": 2,
    "route": "/csv"
  },
  {
    "renderMode": 2,
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 14031, hash: '3173b986abb757d8a4296e349d29eaf5f7622cee89207e0b60a33b2c380aa40f', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 996, hash: '1acab19f2d45766a265cea53a8622f0b831d5e8469e73abdac703ea0f1593366', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'admin/index.html': {size: 119215, hash: '562cc9683d2e261f1b74a08515f7bbbda2a80e827a9d05012980aab2fceeecd3', text: () => import('./assets-chunks/admin_index_html.mjs').then(m => m.default)},
    'traffic/index.html': {size: 192551, hash: 'd77a3ee694a764a17ace859528f1492c64e421b9138aec3e5f40eb67bdf07491', text: () => import('./assets-chunks/traffic_index_html.mjs').then(m => m.default)},
    'monitor/index.html': {size: 121415, hash: '989a302bc7ac7a7cc7ede2a87f8a260cda5296f9c9e5a5ad2b7687dd1bc80325', text: () => import('./assets-chunks/monitor_index_html.mjs').then(m => m.default)},
    'traffic-list/index.html': {size: 194278, hash: 'a787fbcfeef9ec0e18cb0da5b824da3ad7dd07d17bf5950a92f077a383e0bdf6', text: () => import('./assets-chunks/traffic-list_index_html.mjs').then(m => m.default)},
    'csv/index.html': {size: 268859, hash: '89d416aa11aa5799b1d01ce4e427535240abe855298bb978cd7fbd86f2a71df9', text: () => import('./assets-chunks/csv_index_html.mjs').then(m => m.default)},
    'data/index.html': {size: 124344, hash: '40cfd1eb9c4bdd6b13b3cf8b4c277ab9766ca80a8d373c63cbb17bce80e6dce8', text: () => import('./assets-chunks/data_index_html.mjs').then(m => m.default)},
    'styles-2AWQCGHR.css': {size: 54876, hash: 'M5yIJrslRtA', text: () => import('./assets-chunks/styles-2AWQCGHR_css.mjs').then(m => m.default)}
  },
};
