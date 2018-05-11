/**
 * @file index.js
 * @author mj(zoumiaojiang@gmail.com)
 * @author zhangzhiqiang37(zhiqiangzhang37@163.com)
 */

<template>
    <div
        class="mip-video"
        :style="{
            width: computedWidth,
        }"
    >
        <div
            class="mip-video-inner"
            :style="{
                height: wrapperHeight,
                paddingBottom: computedHeightWidthRatio
            }"
        >
            <video
                v-if="renderInView"
                :ads="ads"
                :src="src"
                :controls="ctl"
                :loop="loop"
                :autoplay="autoplay"
                :autobuffer="autobuffer"
                :crossorigin="crossorigin"
                :height="height"
                :muted="muted"
                :preload="preload"
                :poster="poster"
                width="100%"
            >
                <slot></slot>
                Your browser does not support the video tag.
            </video>
            <div
                v-else
                class="mip-video-poster"
                @click="sendVideoMessage"
            >
                <img v-if="poster" :src="poster">
                <span class="mip-video-playbtn"></span>
            </div>
        </div>
    </div>
</template>

<script>
import util from '../../util';
const httpsReg = /^https:|^\/\//;
const windowInIframe = util.viewer.isIframed;

export default {
    props: {
        layout: {
            default() {
                return 'responsive';
            },
            type: String
        },
        ads: String,
        src: String,
        controls: String,
        loop: String,
        autoplay: String,
        autobuffer: String,
        crossorigin: String,
        height: [Number, String],
        muted: String,
        preload: String,
        poster: String,
        width: [Number, String],
        // 高/宽比例，用于占位，如宽50px，高100px，heightWidthRatio就是50/100=50%
        heightWidthRatio: String
    },

    computed: {
        renderInView() {
            // if window is https
            let windowProHttps = !!window.location.protocol.match(httpsReg);
            // if video source is https
            let sourceIsHttps = true;
            let defaultSlots = this.$slots.default;

            if (!defaultSlots) {
                sourceIsHttps = false;
            }
            else {
                defaultSlots.forEach(function (node) {
                    if (!node.data.attrs.src.match(httpsReg)) {
                        sourceIsHttps = false;
                    }
                });
            }

            let videoProHttps = (this.src && this.src.match(httpsReg))
                                || (defaultSlots && sourceIsHttps);

            // page ishttps         + video is https    = renderInView
            // page ishttps(in iframe) + video is http    = renderPlayElsewhere
            // page ishttps(else)   + video is http     = renderInView（not mip）
            // page ishttp          + random video      = renderInView
            // page not iframe || video src is https ||  video http + page http
            if (
                !windowInIframe
                || videoProHttps
                || (windowInIframe && !videoProHttps && !windowProHttps)
            ) {
                return true;
            }

        },

        // autoplay 未设置，强行设置controls属性
        ctl() {
            return this.autoplay === undefined ? true : this.controls;
        },

        wrapperHeight() {
            return this.height
                ? this.height
                : (this.heightWidthRatio ? 0 : '');
        },

        computedHeightWidthRatio() {
            if (!this.height) {
                return this.heightWidthRatio;
            }
        },

        computedWidth() {
            // 宽度支持写百分比等，纯数字认为是像素单位
            let width = this.width;
            return /^\d+$/.test(width) ? `${width}px` : width;
        }
    },

    methods: {
        sendVideoMessage() {
            // make sourceList, send to outer iframe
            let urlSrc;
            let sourceList = [];
            let defaultSlots = this.$slots.default;

            if (defaultSlots) {
                defaultSlots.forEach(function (node) {
                    sourceList.push({[node.data.attrs.type]: node.data.attrs.src});
                });
            }

            if (!sourceList.length) {
                urlSrc = this.src;
            }
            else {
                urlSrc = JSON.stringify([this.src, sourceList]);
            }

            if (windowInIframe) {
                // mip_video_jump is written outside iframe
                util.viewer.sendMessage('mip_video_jump', {
                    poster: util.parseCacheUrl(this.poster),
                    src: urlSrc
                });
            }

        }
    }
};
</script>

<style lang="less">
@import '../../styles/variable.less';

mip-video {
    background: #000;
    font-size: 0;
    .mip-video {
        display: inline-block;
    }
    .mip-video-inner {
        background: @placeholder-bg;
        position: relative;
    }
    .mip-video-playbtn {
        display: inline-block;
        width: 60px;
        height: 60px;
        border: 4px solid white;
        border-radius: 100%;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.3);
        -webkit-tap-highlight-color: rbga(0, 0, 0, 0.3);
        tap-highlight-color: rbga(0, 0, 0, 0.3);
        &:before {
            content: '';
            position: absolute;
            width: 1px;
            height: 1px;
            border-style: solid;
            border-width: 16px 0 16px 26px;
            border-color: transparent transparent transparent white;
            left: 20px;
            top: 14px;
        }
    }
    .mip-video-poster {
        height: 100%;
        img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }
}
</style>