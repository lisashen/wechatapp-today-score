// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        traceUser: true,
        // dev: {
        //   database: 'production-213e56',
        //   functions: 'production-213e56',
        //   storage: 'production-213e56',
        // },
        dev: 'production-213e56',
      });
    }

    this.globalData = {};
  },
});
