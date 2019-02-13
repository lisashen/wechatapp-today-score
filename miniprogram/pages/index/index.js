//index.js
import { formatDate } from '../../util/common'
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    score:0,
    detail:[],
    aim:0,
    labels:[],
    weights: [1,2,3,4,5,6,7],
    weightIndex: 0
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
    this.onQueryToday();
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  onQueryToday: function() {
    const date = formatDate(new Date());
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('daily').where({
      // _openid: this.data.openid
      date,
    }).get({
      success: res => {
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
          })
        }
        console.log('[数据库] [查询记录] 成功: ', r)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
    db.collection('user').where({
    }).get({
      success: res => {
        const r = res.data[0];
        if (r) {
          this.setData({
            userId: r._id,
            aim: r.aim,
            labels: r.labels,
          })
        } else {
          this.onSetUser(1);
        }
        console.log('[user] [查询记录] 成功: ', r)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  addNewItem: function () {
    const date = formatDate(new Date());
    const db = wx.cloud.database()
    const { todayId, score, detail, weightIndex, weights, addInputValue } =this.data;
    if(addInputValue){
      const newItem = { description:addInputValue, weight:  weights[weightIndex] };
      if (todayId) {
        console.log
        detail.push(newItem);
        db.collection('daily').doc(todayId).update({
          data: {
            score: score+1,
            detail,
          },
          success: res => {
            console.log(res)
            this.setData({
              score: score+1,
              detail,
            })
          },
          fail: err => {
            icon: 'none',
            console.error('[数据库] [更新记录] 失败：', err)
          }
        })
      } else {
        db.collection('daily').add({
          data: {
            date,
            ispass: false,
            score: 1,
            detail: [newItem],
          },
          success: res => {
            // 在返回结果中会包含新创建的记录的 _id
            console.log(res)
            this.setData({
              todayId: res._id,
              score: 1,
              detail: [newItem],
            })
            wx.showToast({
              title: '新增记录成功',
            })
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '新增记录失败'
            })
            console.error('[数据库] [新增记录] 失败：', err)
          }
        })
      }
      this.closeAddModal();
      this.setData({
        addInputValue:'',
        weightIndex:0,
      })
    }
    
  },
  onSetUser: function (aim) {
    const db = wx.cloud.database();
    db.collection('user').add({
      data: {
        aim: aim,
        labels: [],
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log(res)
        this.setData({
          userId: res._id,
          aim,
        })
        wx.showToast({
          title: '新增记录成功',
        })
        console.log('[user] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  radioChange :function (e) {
    this.setData({
      showCustonLabel: e.detail.value === '0'
    })
  },
  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      weightIndex: e.detail.value
    })
  },
  bindAddInput(e) {
    this.setData({
      addInputValue: e.detail.value
    })
  },
  openAddModal: function () {
    this.setData({showAddModal: true})
  },
  closeAddModal: function () {
    this.setData({showAddModal: false})
  }
})
