import { formatDate, updateLocalAndGlobalData } from '../../util/common';

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
    isEditingAim: false,
    currentTab: 0,
  },
  onShow() {
    this.setData({ ...app.globalData });
    this.onQueryToday();
  },
  swiperTab(e) {
    const that = this;
    that.setData({
      currentTab: e.detail.current,
    });
  },
  // 点击切换
  clickTab(e) {
    const that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return;
    }
    that.setData({
      currentTab: e.target.dataset.current,
    });
  },

  onQueryToday() {
    const db = wx.cloud.database();
    // 查询当前用户所有的 counters
    db.collection('daily').where({
      // _openid: this.data.openid
    }).orderBy('date', 'desc').get({
      success: (res) => {
        // this.setData({
        //   queryResult: JSON.stringify(res.data, null, 2)
        // })
        // const r = JSON.stringify(res.data, null, 2);
        const r = res.data;
        if (r) {
          const sum = r.reduce((s, item) => s + item.score, 0);
          this.setData({
            history: r,
            sum,
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
    // todo: 抽取
    db.collection('spend').where({
      // _openid: this.data.openid
    }).orderBy('date', 'desc').get({
      success: (res) => {
        // this.setData({
        //   queryResult: JSON.stringify(res.data, null, 2)
        // })
        // const r = JSON.stringify(res.data, null, 2);
        const r = res.data;
        if (r) {
          const sum = r.reduce((s, item) => s + item.score, 0);
          this.setData({
            spendItems: r,
            spend: sum,
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
  addSpend() {
    const date = formatDate(new Date());
    const db = wx.cloud.database();
    const {
      score, addInputValue, spendItems,
    } = this.data;
    // const newItem = {
    //   date,
    //   score,
    //   content: addInputValue,
    // };
    const newItem = {
      date,
      score: 6,
      content: 'sss',
    };
    db.collection('spend').add({
      data: newItem,
      success: (res) => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log(res);
        this.setData({
          spendItems: [...spendItems, newItem],
        });
        Object.assign(app.globalData, { score: newItem.weigh });
        wx.showToast({
          title: '新增记录成功',
        });
      },
      fail: (err) => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败',
        });
        console.error('[数据库] [新增记录] 失败：', err);
      },
    });
  },
});
