<template>
  <!-- 顶部导航条 start -->
  <div class="layout-top d-flex">
    <div
      v-if="paths.length >= 3 || showBack"
      @click="back"
      class="back"
    >
      <i class="back-icon"></i> <span>返回</span>
    </div>
    <el-breadcrumb
      separator="-"
      class="path"
    >
      <el-breadcrumb-item
        :key="index"
        v-for="(path, index) in paths"
        @click.native="clickRouter(path, index)"
        :style="getClickSty(path)"
      >
        {{ path.menuName }}
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="nav-profile">
      <div class="nav-profile-text">您好，{{userInfo.nickname}}</div>
      <div class="nav-action-quit"><a @click="logout">退出</a></div>
    </div>
  </div>
  <!-- 顶部导航条 end -->
</template>

<script>
export default {
  data() {
    return {
      paths: [],
      showBack: false
    };
  },
  computed: {
    menus() {
      return this.$store.state.menu;
    },
    userInfo() {
      return this.$store.state.userInfo;
    }
  },
  methods: {
    getClickSty(path) {
      if (path.url || path.path) {
        return {
          cursor: "pointer"
        };
      }

      return {
        cursor: "default"
      };
    },
    logout() {
      this.$confirm("是否退出系统, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let pro = Promise.resolve();
        const env = this.$store.state.env;

        // 域名环境，主动调用退出登录
        if (env !== "test") {
          // pro = logout();
        }

        pro.finally(() => {
          this.$store.dispatch("logout");
        });
      });
    },
    setTitle(paths) {
      let menu = {};
      let subMenu;
      for (let menu_ of this.menus) {
        if (paths[0].menuName === menu_.menuName) {
          menu = menu_;

          for (let subItem of menu["childrens"] || []) {
            if (paths[1].menuName === subItem.menuName) {
              subMenu = subItem;

              if(!(menu_.open && subMenu.active)) {
                for (let i = 0; i < this.menus.length; i++) {
                  const menu = this.menus[i];

                  menu["childrens"].forEach(item => {
                    this.$set(item, "active", false);
                  });

                  this.$set(menu, "open", false);
                }

                this.$set(menu_, 'open', true);
                this.$set(subMenu, 'active', true);
              }

              console.log(menu_, subMenu, 'subMenu');
              break;
            }
          }

          break;
        }
      }

      if (menu["childrens"] && Array.isArray(menu["childrens"]) && subMenu) {
        const menus = paths.filter((menu, idx) => idx >= 2);

        this.paths = [menu, subMenu, ...menus];

        this.showBack = false;
      } else {
        this.paths = paths;

        this.showBack = true;
      }
    },
    back() {
      this.showBack = false;

      history.go(-1);
    },
    clickRouter(menu, idx) {
      console.log(menu, 111);

      if(idx === 0) {
        try {
          menu.url = menu.childrens[0].url;
        } catch(e) {
          const url = menu.url;

          if(url) {
            const tmpList = (menu.url || '').split("#");
            menu.path = tmpList[tmpList.length - 1];
          }

          menu.url = '';
        }
      }

      if (menu.url || menu.path) {
        let tmpPath;

        if (idx === 0) {
          const tmpList = (menu.url || '').split("#");

          tmpPath = (tmpList[tmpList.length - 1] || menu.path || '').trim();
        } else {
          const tmpList = menu.url.split("#");

          tmpPath = (tmpList[tmpList.length - 1] || menu.path || '').trim();
        }

        if (idx >= 2) {
          window.insideTo(null, menu);
        } else {
          window.insideTo(tmpPath);
        }
      }
    }
  },
  created() {
    window.setTitle = paths => {
      this.setTitle(paths);

      console.log("paths", paths);
    };
    window.logout = () => this.$store.dispatch("logout");
  }
};
</script>

<style lang="scss">
.layout-top {
  z-index: 1;
  display: flex;
  align-items: center;
  padding-left: 20px;
  height: 72px;
  background: #fff;
  .back {
    padding-right: 16px;
    margin-right: 16px;
    height: 22px;
    border-right: 1px solid #ebebeb;
    color: #265293;
    cursor: pointer;
    line-height: 20px;
    &:hover {
      color: #5c7dae;
    }
    .back-icon {
      background: url(~@/assets/icon/back-icon.png) no-repeat center;
      width: 12px;
      height: 16px;
      display: inline-block;
      text-align: center;
      margin-right: 4px;
      vertical-align: middle;
    }
    span {
      font-size: 16px;
      display: inline-block;
      vertical-align: middle;
      line-height: 22px;
    }
  }
  .path {
    .el-breadcrumb__item {
      font-size: 20px;
      .el-breadcrumb__inner {
        font-weight: normal;
      }
      &:last-of-type .el-breadcrumb__inner,
      &:last-of-type .el-breadcrumb__inner a {
        font-weight: 700;
        color: #272727;
      }
    }

    .el-breadcrumb__item:last-of-type .el-breadcrumb__separator {
      display: none;
    }
    .el-breadcrumb__separator {
      margin: 0 9px;
      font-weight: 700;
      color: #c0c4cc;
    }
  }
}
</style>

