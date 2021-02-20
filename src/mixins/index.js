import store from "@/store";
import { resolve } from "@/util/util";

export default {
  methods: {
    isMenuRouter(path) {
      let isExist = false;

      const path_ = resolve("/", path);

      for (let menu of store.state.menu) {
        menu["childrens"].forEach(subMenu => {
          const pathList = (subMenu.url || "").split("#");

          // console.log(
          //   pathList,
          //   resolve("/", pathList[pathList.length - 1]).trim(),
          //   path_,
          //   subMenu.path
          // );

          if (
            resolve("/", subMenu.path) === path_ ||
            resolve("/", pathList[pathList.length - 1]).trim() === path_
          ) {
            isExist = true;
          }
        });
      }

      return isExist;
    },
    setFrameAppPos(isOther) {
      let frame = document.querySelector("#mainFrame");

      if(isOther) {
        console.log('other');
        setStyle();
      } else {
        this.$nextTick(() => {
          frame = document.querySelector("#mainFrame");

          const win = frame.contentWindow;

          win.onload = setStyle;
        });
      }

      function setStyle() {
        console.log('触发样式更新');

        const style = document.createElement("style");
        
        style.innerHTML = `.container-scroller { 
            position: absolute!important; 
            z-index: 0 
          }

          body {
            background-color: inherit;
          }

          body > #app { 
            overflow: hidden;
            position: absolute;
            top: 71px;
            left: 220px;
            bottom: 0;
            right: 0;
            width: auto;
            height: auto;
          }`;
        frame.contentDocument.body.appendChild(style);
      }
    }
  }
};
