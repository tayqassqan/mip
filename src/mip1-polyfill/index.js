/**
 * @file mip1-polyfill MIP2 兼容 MIP1 的方式之一
 * @author sekiyika(pengxing@baidu.com)
 */

'use strict';

import util from '../util';
import viewer from '../util/viewer';
import viewport from '../util/viewport';
import templates from '../util/templates';

// 将 jquery 配置为远程的，需要时才引入
window.require.config({
    paths:{
        'searchbox/openjs/aio': '//m.baidu.com/static/searchbox/openjs/aio.js?v=201606',
        jquery: '//mipcache.bdstatic.com/static/v1/deps/jquery'
    }
});

window.define('util', () => util);
window.define('viewer', () => viewer);
window.define('viewport', () => viewport);
window.define('templates', () => templates);
window.define('customStorage', () => util.customStorage);
window.define('fetch-jsonp', () => window.fetchJsonp);
window.define('zepto', () => window.$);


// customElement
// naboo
// fixed-element
// performance