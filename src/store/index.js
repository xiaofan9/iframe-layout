import Vuex from "vuex";
import Vue from "vue";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: {},
  },
  getters: {
    userInfo: () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

        return userInfo;
      } catch {
        return {}
      }
    },
    homeUrl: () => {
      try {
        const homeUrl = localStorage.getItem('homeUrl') || '/';

        return homeUrl;
      } catch {
        return '/'
      }
    },
    env: state => {
      return state?.config?.env || ''
    },
    menuList: () => {
      try {
        const menuList = JSON.parse(localStorage.getItem('menuList') || '[]');

        return menuList;
      } catch {
        return []
      }
    }
  },
  mutations: {
    setConfig(state, config = {}) {
      state.config = config;
    }
  },
  actions: {
    handleConfig() {
      
    }
  }
});
