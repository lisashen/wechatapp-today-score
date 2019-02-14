// pages/userConsole/userConsole.js
Page({

  data: {
    openid: '',
  },

  onLoad(options) {
    this.setData({
      openid: getApp().globalData.openid,
    });
  },
});
