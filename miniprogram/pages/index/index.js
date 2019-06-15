// index.js
import { formatDate, updateLocalAndGlobalData } from '../../util/common';

const app = getApp();
const CUSTOM_ITEM_ID = 0;

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
    customItemId: CUSTOM_ITEM_ID,
  },

  onLoad() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      });
      return;
    }

    // 获取用户信息
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (r) => {
              const infoData = {
                avatarUrl: r.userInfo.avatarUrl,
                userInfo: r.userInfo,
              };
              updateLocalAndGlobalData(this, app, infoData);
            },
          });
        }
      },
    });
    this.onQueryToday();
  },
  onShow() {
    // 深比较or直接赋值or用一个是否更新过的标志位？
    const { aim, labels } = app.globalData;
    if (labels !== undefined && aim !== undefined) {
      this.setData({ aim, labels });
    }
  },
  onGetUserInfo(e) {
    if (!this.logged && e.detail.userInfo) {
      const infoData = {
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
      };
      updateLocalAndGlobalData(this, app, infoData);
    }
  },
  onGetOpenid() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: (res) => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
        app.globalData.openid = res.result.openid;
        wx.navigateTo({
          url: '../userConsole/userConsole',
        });
      },
      fail: (err) => {
        console.error('[云函数] [login] 调用失败', err);
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        });
      },
    });
  },
  onQueryToday() {
    const date = formatDate(new Date());
    const db = wx.cloud.database();
    // 查询当前用户所有的 counters
    db.collection('daily').where({
      // _openid: this.data.openid
      date,
    }).get({
      success: (res) => {
        // this.setData({
        //   queryResult: JSON.stringify(res.data, null, 2)
        // })
        // const r = JSON.stringify(res.data, null, 2);
        const r = res.data[0];
        if (r) {
          this.setData({
            todayId: r._id,
            score: r.score,
            detail: r.detail,
          });
        }
        Object.assign(app.globalData, {
          todayId: r._id,
          score: r.score,
        });
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
    db.collection('user').where({
    }).get({
      success: (res) => {
        const r = res.data[0];
        if (r) {
          const infoData = {
            userId: r._id,
            aim: r.aim,
            labels: r.labels,
          };
          updateLocalAndGlobalData(this, app, infoData);
        } else {
          this.onSetUser(1);
        }
        console.log('[user] [查询记录] 成功: ', r);
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
  addNewItem() {
    const date = formatDate(new Date());
    const db = wx.cloud.database();
    const {
      todayId, score, detail, weightIndex, weights, addInputValue, checkedNewItemId, labels, aim,
    } = this.data;
    let newItem;
    if (checkedNewItemId !== CUSTOM_ITEM_ID) {
      const a = labels.filter(item => item.id === checkedNewItemId);
      const { description, weight } = labels.filter(item => item.id === checkedNewItemId)[0];
      newItem = { description, weight };
    } else {
      newItem = { description: addInputValue, weight: weights[weightIndex] };
    }
    if (todayId) {
      detail.push(newItem);
      const newScore = score + newItem.weight;
      db.collection('daily').doc(todayId).update({
        data: {
          score: newScore,
          detail,
          ispass: newScore >= aim,
        },
        success: (res) => {
          console.log(res);
          this.setData({
            score: newScore,
            detail,
          });
          Object.assign(app.globalData, { score: newScore });
        },
        fail: (err) => {
          console.error('[数据库] [更新记录] 失败：', err);
        },
      });
    } else {
      db.collection('daily').add({
        data: {
          date,
          ispass: newItem.weight >= aim,
          score: newItem.weight,
          detail: [newItem],
        },
        success: (res) => {
          // 在返回结果中会包含新创建的记录的 _id
          console.log(res);
          this.setData({
            todayId: res._id,
            score: newItem.weight,
            detail: [newItem],
          });
          Object.assign(app.globalData, { score: newItem.weigh });
          wx.showToast({
            title: '新增记录成功',
          });
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id);
        },
        fail: (err) => {
          wx.showToast({
            icon: 'none',
            title: '新增记录失败',
          });
          console.error('[数据库] [新增记录] 失败：', err);
        },
      });
    }
    this.closeAddModal();
    if (checkedNewItemId === CUSTOM_ITEM_ID) {
      this.setData({
        addInputValue: '',
        weightIndex: 0,
      });
    }
  },
  onSetUser(aim) {
    const db = wx.cloud.database();
    db.collection('user').add({
      data: {
        aim,
        labels: [],
      },
      success: (res) => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log(res);
        this.setData({
          userId: res._id,
          aim,
        });
        wx.showToast({
          title: '新增记录成功',
        });
        console.log('[user] [新增记录] 成功，记录 _id: ', res._id);
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
  radioChange(e) {
    const checkedNewItemId = 1 * e.target.dataset.value;
    this.setData({
      showCustonLabel: checkedNewItemId === CUSTOM_ITEM_ID,
      checkedNewItemId,
    });
  },
  bindPickerChange(e) { // todo
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      weightIndex: e.detail.value,
    });
  },
  bindAddInput(e) { // todo
    this.setData({
      addInputValue: e.detail.value,
    });
  },
  openAddModal() {
    this.setData({ showAddModal: true });
  },
  closeAddModal() {
    this.setData({
      showAddModal: false,
      checkedNewItemId: null,
      showCustonLabel: false,
      weightIndex: 0,
      addInputValue: '',
    });
  },
  onEditDetails() {
    this.setData({ isEditingDetails: true });
  },
  onDeleteDetail(e) {
    const db = wx.cloud.database();
    const { detail, score, aim } = this.data;
    const deletedId = 1 * e.currentTarget.id;
    const newScore = score - detail[deletedId].weight;
    detail.splice(deletedId, 1);
    db.collection('daily').doc().update({
      data: {
        detail,
        ispass: newScore >= aim,
        score: newScore,
      },
      success: (res) => {
        console.log(res);
        const infoData = { detail, score: newScore };
        this.setData(infoData);
      },
      fail: (err) => {
        wx.showToast({
          title: '删除失败',
          icon: 'none',
        });
      },
    });
  },
  onFinishEditDetails() {
    this.setData({ isEditingDetails: false });
  },
  onHide() {
    this.setData({
      isEditingDetails: false,
      weightIndex: 0,
      addInputValue: '',
      showAddModal: false,
      checkedNewItemId: null,
      showCustonLabel: false,
    });
  },
});
