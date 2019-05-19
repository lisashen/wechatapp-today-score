const app = getApp();

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    score: 0,
    detail: [],
    aim: 0,
    labels: [],
    weights: [1, 2, 3, 4, 5, 6, 7],
    weightIndex: 0,
    isEditingAim: false,
  },
  onShow() {
    this.setData({ ...app.globalData });
    this.onQueryToday();
  },
  onQueryToday() {
    const db = wx.cloud.database();
    // 查询当前用户所有的 counters
    db.collection('daily').where({
      // _openid: this.data.openid
    }).get({
      success: (res) => {
        // this.setData({
        //   queryResult: JSON.stringify(res.data, null, 2)
        // })
        // const r = JSON.stringify(res.data, null, 2);
        const r = res.data;
        if (r) {
          this.setData({
            history: r,
          });
        }
        console.log('[数据库] [查询记录] 成功: ', r);
      },
      fail: (err) => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败',
        });
        console.error('[数据库] [查询记录] 失败：', err);
      },
    });
  },
});
