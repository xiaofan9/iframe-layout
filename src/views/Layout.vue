<template>
  <div
    class="iframe-layout"
    id="app"
  >
    <!-- <div
      class="v-modal"
      tabindex="0"
      :style="{'z-index': 2000}"
      v-if="isModal > 0"
    ></div> -->
    <!-- 左侧导航菜单 start -->
    <LayoutLeft
      @setUrl="setIframeUrl"
      ref="menu"
    ></LayoutLeft>
    <!-- 左侧导航菜单 end -->
    <!-- 顶部导航条 start -->
    <LayoutTop @setUrl="setIframeUrl" :style="{'z-index': isModal ? 0 : 1}"></LayoutTop>
    <!-- 顶部导航条 end -->
    <div class="container-scroller" :style="{'z-index': isModal ? 2000 : 0}">
      <iframe
        id="mainFrame"
        v-if="isShowFrame"
        name="mainFrame"
        :src="src"
        height="100%"
        marginwidth="0"
        marginheight="0"
        frameborder="0"
        scrolling="no"
        width="100%"
      ></iframe>
    </div>
    <el-dialog
      :visible.sync="dialogOpts.visible"
      :width="dialogOpts.width"
      :title="dialogOpts.title"
      :append-to-body="dialogOpts.appendToBody"
      :modal-append-to-body="dialogOpts.modalAppendToBody"
      :custom-class="dialogOpts.customClass"
    >
      <render-node
        v-if="dialogOpts.slot"
        :nodeList="dialogOpts.slot"
      ></render-node>
      <template
        slot="footer"
        v-if="dialogOpts.slotFooter"
      >
        <render-node :nodeList="dialogOpts.slotFooter"></render-node>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import LayoutLeft from "@/components/LayoutLeft";
import LayoutTop from "@/components/LayoutTop";
import localforage from "localforage";
import permission from "@/helpers/permission";
import RenderNode from "@/components/RenderDialogNode";
import { resolve } from "@/util/util";

export default {
  data() {
    return {
      src: "",
      isModal: 0,
      isShowFrame: true,
      dialogOpts: {
        visible: false
      },
      menu: null
    };
  },
  components: {
    LayoutLeft,
    LayoutTop,
    RenderNode
  },
  methods: {
    setModal(isModal) {
      const close = () => {
        setTimeout(() => {
          this.isModal--;

          if (this.isModal < 0) {
            this.isModal = 0;
          }
        }, 100);
      };

      console.log('isModal', isModal);

      if (isModal) {
        this.isModal++;
      } else {
        close();

        return;
      }

      return {
        close
      };
    },
    setIframeUrl(menu) {
      let src = menu.url;

      if (!src) {
        console.error(src, "src 不存在");
        this.$router.push("/unknow");

        return;
      }

      if(menu.query) {
        src += '?' + menu.query;
      }

      this.isShowFrame = false;

      this.$nextTick(() => {
        this.isShowFrame = true;

        this.src = src.trim();

        console.log(src, 'src');

        this.isModal = 0;

        this.setFrameAppPos();
      });
    },
    setRouter() {
      try {
        if (this.$store.state.noSkip) {
          this.$store.state.noSkip = false;

          return;
        }

        const path = location.hash.slice(2);

        const menu = this.menu;

        this.$nextTick(async () => {
          const tmpPath = path.split('?')[0];

          if (this.isMenuRouter(tmpPath)) {
            menu.to(path);
          } else {
            const historyHref =
              (await localforage.getItem("history-href")) || [];

            const href = historyHref.find(href => {
              const tmpArr = href.split("#/");
              const hash = tmpArr[tmpArr.length - 1];

              console.log(hash, path);

              return hash === path;
            });

            if (href) {
              menu.to(null, {
                path,
                url: href
              });
            } else {
              const isAdmin = location.hash.includes("#/admin/");

              const config = this.$store.state.config;

              return {
                path,
                url: resolve(
                  location.origin,
                  isAdmin ? config.portalPath : config.dmpPath,
                  isAdmin ? "admin.html#" : "index.html#",
                  path
                )
              };
            }
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
  },
  mounted() {
    this.$router.beforeEach(async (to, from, next) => {
      await permission(to, from, next);

      if (
        !(to.path === "/404" || to.path === "/unknow") &&
        to.path !== from.path
      ) {
        console.log("???", to.path);
        await this.setRouter(next);

        localStorage.setItem("prevRouterPath", from.path);
        localStorage.setItem("prevRouterQuery", JSON.stringify(from.query));
      }
    });

    //解决IE下路由跳转页面不刷新的问题
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
      window.addEventListener(
        "hashchange",
        () => {
          let currentPath = window.location.hash.slice(1);
          if (this.$route.path !== currentPath) {
            this.$router.push(currentPath);
          }
        },
        false
      );
    }

    if (!this.menu) {
      this.menu = this.$refs["menu"];
    }

    window.setModal = this.setModal;

    // if (window.history && window.history.pushState) {
    //   window.addEventListener("popstate", this.setRouter(), false);
    // }

    window.setDialog = opts => {
      console.log(opts, 'opts');
      this.dialogOpts = opts;
    };

    window.loading = this.$loading.bind(this);

    window.routerGo = t => this.$router.go(t);
  },
  watch: {
    "dialogOpts.visible": {
      deep: true,
      handler(newVal) {
        if (newVal) {
          if (!newVal) {
            const iframe = document.querySelector("#mainFrame");

            const win = iframe.contentWindow;

            win.setDialog(false);
          }
        }
      }
    }
  }
};
</script>

<style scoped lang='scss'>
/*侧边栏样式开始*/
.iframe-layout {
  /deep/ {
    .sidebar {
      width: 220px !important;
      .system-name {
        font-size: 18px !important;
        line-height: 1;
      }
      .icon-management {
        display: none;
      }
      .logo-box {
        width: 80px;
        height: initial;
        margin: 39px auto 13px auto;
        padding: 0;
        text-align: center;
        background-color: transparent;
      }
      .navbar-brand {
        min-height: 155px;
        margin-bottom: 0px;
      }
      .navbar-brand .system-name {
        font-weight: 200;
      }
      .nav .nav-item .nav-link .menu-title {
        font-size: 14px;
      }
      a.nav-link {
        padding-left: 20px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        height: 56px;
        line-height: 56px;
      }
      a.nav-link:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.25);
      }
      ul.sub-menu a.nav-link:hover {
        background: transparent;
      }
      .nav-link:hover .icon:before {
        color: #fff !important;
      }

      .nav .nav-item .nav-link[aria-expanded="true"] .menu-arrow-more {
        transform: rotate(180deg);
        -webkit-transform: rotate(180deg);
        -moz-transform: rotate(180deg);
        -ms-transform: rotate(180deg);
      }
      .nav-link .icon:before {
        color: #909399;
        font-size: 12px;
      }

      .logo-box img {
        width: 80px;
        -webkit-transform: scale(1);
        transform: scale(1);
      }
      .nav .nav-item .nav-link .menu-title {
        font-size: 14px;
      }
      .nav.sub-menu .nav-item .nav-link {
        padding-left: 10px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        height: 50px;
        line-height: 50px;
        margin-left: 34px;
      }
      .nav.sub-menu .nav-item.active a.nav-link {
        color: #ffffff;
      }
      .nav.sub-menu .nav-item .nav-link:before {
        width: 4px;
        height: 4px;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }

  .container-scroller {
    left: 0;
    position: fixed;
    bottom: 0;
    overflow: hidden;
    top: 0;
    right: 0;
  }
}
</style>
