<template>
  <!-- 左侧导航菜单 start -->
  <nav
    class="sidebar sidebar-offcanvas"
    id="sidebar"
  >
    <div class="navbar-brand">
      <div class="logo-box" @click="toHome" style="cursor: pointer;">
        <img src="~@/assets/image/logo.svg" title="回到首页"/>
      </div>
      <div class="center-txt system-name" title="回到首页" @click="toHome" style="cursor: pointer;">iframe-layout</div>
    </div>
    <el-scrollbar>
      <ul class="nav">
        <li
          class="nav-item"
          v-for="(item, index) of menus"
          :key="`item-${index}`"
        >
          <a
            class="nav-link"
            :class="item.open ? '' : 'collapsed'"
            :aria-expanded="item.open"
            @click="openMenu(item, index)"
          >
            <i class="menuicon icon icon-management"></i>
            <span class="menu-title">{{item.menuName}}</span>
            <i class="menu-arrow-more icon icon-down"></i>
          </a>
          <div
            class="collapse"
            :class="item.open ?'show':''"
          >
            <ul class="nav flex-column sub-menu">
              <li
                class="nav-item"
                v-for="(subItem, subIndex) of item.childrens"
                :key="`sub-item-${subIndex}`"
                :class="subItem.active ? 'active' :'' "
              >
                <a
                  class="nav-link"
                  @click="to(item, subItem, false,true)"
                >{{subItem.menuName}}</a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </el-scrollbar>
  </nav>
  <!-- 左侧导航菜单 end -->
</template>

<script>
import { isObject } from "lodash";
import localforage from "localforage";
import { resolve } from "@/util/util";

export default {
  data() {
    return {
      menus: this.$store.state.menu,
      log: console.log
    };
  },
  methods: {
    toHome() {
      location.href = this.$store.getters.homeUrl;
    },
    openMenu(menu, idx) {
      console.log(menu, 'menu123');

      const flag = !menu.open;

      const activeMenu = this.menus.find(menu => menu.childrens.find(subMenu => subMenu.active)) || {};

      this.menus.forEach((item, index) => {
        if (index !== idx && activeMenu.id !== item.id) {
          item.open = false;
        }
      });

      //如果是打开菜单，自动跳转到第一条
      // if (flag && menu.childrens) {
      //   const subMenu = menu.childrens[0];

      //   if (subMenu) {
      //     this.to(menu, subMenu);
      //   }
      // }

      this.$nextTick(() => {
        this.$set(menu, 'open', flag);
      });
    },
    // 跳转菜单之前处理逻辑
    to(menu, subMenu, noSkip, isMenuClicked) {
      let path, query = '';

      // 当菜单是个字符串，表示是出入
      if (typeof menu === "string") {
        path = menu;
        
        const tmpPath = path.split('?');
        const path_ = resolve("/", tmpPath[0]);

        if(tmpPath.length > 1) {
          query = tmpPath.filter((p, i) => i !== 0).join('?');
        }

        for (let menu_ of this.menus) {
          const subMenu_ = menu_["childrens"].find(subMenu => {
            const pathList = (subMenu.url || "").split("#");

            return (
              resolve("/", subMenu.path) === path_ ||
              resolve("/", pathList[pathList.length - 1]).trim() === path_
            );
          });

          if (subMenu_) {
            menu = menu_;
            subMenu = subMenu_;

            // 重写path，防止path 和url 带过来的 path 不对应的问题
            const pathList = (subMenu.url || "").split("#");

            path = resolve("/", pathList[pathList.length - 1]).trim();

            break;
          }
        }
      }

      if (!subMenu) {
        console.log(subMenu, "不存在subMenu");
        this.$router.push("/unknow");

        return;
      }

      if (!path) {
        path = subMenu.path || "";
      }
      if (isMenuClicked) {
        localStorage.setItem("menuClicked", 1);
      }
      const equal = location.hash.slice(2) === path;

      // 相同的路由就不进行 hash 处理
      if (!equal) {
        const pathList = (subMenu.url || "").split("#");

        path = (pathList[pathList.length - 1] || path).trim();

        if(query) {
          path += '?' + query;
        }
      }

      this.setMenu(menu, subMenu);

      this.$router.push(resolve("/", path));

      // 路由替换，iframe 会产生一个跳转记录
      console.log('path && query', path, query);

      if (!noSkip) {
        this.$emit("setUrl", { ...subMenu, path, query });
      } else {
        this.setFrameAppPos(true);
      }
    },
    // 设置选中菜单
    setMenu(menu, subMenu) {
      if (isObject(subMenu) && isObject(menu)) {
        for (let i = 0; i < this.menus.length; i++) {
          const menu = this.menus[i];

          menu["childrens"].forEach(item => {
            this.$set(item, "active", false);
          });

          this.$set(menu, "open", false);
        }
        this.$set(subMenu, "active", true);
        this.$set(menu, "open", true);

        this.$nextTick(() => {
          // 设置标题
          window.setTitle([menu, subMenu]);
        });
      }
    },
    async getHistoryHref(path) {
      const historyHref = (await localforage.getItem("history-href")) || [];

      if (historyHref.length) {
        let url = historyHref[historyHref.length - 1];

        if (url) {
          let tmpArr = url.split("#/");

          if (!(path && path !== tmpArr[tmpArr.length - 1])) {
            return {
              path: tmpArr[tmpArr.length - 1],
              url
            };
          }
        }
      }

      const isAdmin = location.hash.includes("#/admin/");

      const config = this.$store.state.config;

      console.log(
        resolve(
          location.origin,
          isAdmin ? config.portalPath : config.dmpPath,
          isAdmin ? "admin.html#" : "index.html#",
          path
        )
      );

      return {
        path,
        url: resolve(
          location.origin,
          isAdmin ? config.portalPath : config.dmpPath,
          isAdmin ? "admin.html#" : "index.html#",
          path
        )
      };
    },
    // 刷新页面时，会进入
    async init() {
      const path_ = resolve(location.hash.slice(2));
      const tmpPath = path_.split('?')[0];

      console.log(tmpPath, 'tmpPath','isMenuRouter', this.isMenuRouter(tmpPath));

      let path, subMenu;

      if (this.isMenuRouter(tmpPath)) {
        path = path_;
      } else if (!path_ && this.menus[0]) {
        path = this.menus[0]["childrens"][0].path;
      } else {
        const menuUrl = localStorage.getItem('menuUrl') || '';

        const menuKeyList = {
          
        };

        let menuName;

        for(let key of Object.keys(menuKeyList)) {
          if(menuUrl.includes(key)) {
            menuName = menuKeyList[key];

            break;
          }
        }

        console.log('menuName', menuName);

        if(menuName) {
          for (let menu of this.menus) {
            if(menu.menuName === menuName) {
              path = menu["childrens"][0].path;

              break;
            }
          }
        } else {
          let tmp = await this.getHistoryHref(path_);

          if (tmp) {
            subMenu = {
              ...tmp,
              ...subMenu
            };
          }
        }
      }

      // 删除存储
      localforage.removeItem("history-href");
      localStorage.removeItem('menuUrl');

      if (subMenu) {
        this.to(null, subMenu);
      } else if (path) {
        this.to(path);
      } else {
        this.$router.push("/unknow");
      }

      // 非菜单路由必须调用该函数
      window.toRouter = async path => {
        const iframe = document.querySelector("#mainFrame");

        const win = iframe.contentWindow;

        if (path === "/unknow" || path === "/404") {
          this.$router.push(path);

          return;
        }

        if (path !== location.hash.slice(2)) {
          if (win) {
            const href = win.location.href;

            if (href.includes("about:blank")) {
              return;
            }

            this.isReplace = true;

            const historyHref =
              (await localforage.getItem("history-href")) || [];

            const idx = historyHref.findIndex(href_ => href === href_);

            if (idx >= 0) {
              historyHref.splice(idx, 1);
            }

            historyHref.push(href);

            localforage.setItem("history-href", historyHref);

            console.log("设置完成！", historyHref);

            this.$store.state.noSkip = true;

            this.to(
              null,
              {
                path,
                url: href
              },
              true
            );
          }
        }
      };

      window.insideTo = (menu, subMenu, noSkip) =>
        this.to(menu, subMenu, noSkip);
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss">
.el-scrollbar {
  &__view {
    height: calc(100vh - 194px);
  }
}
</style>