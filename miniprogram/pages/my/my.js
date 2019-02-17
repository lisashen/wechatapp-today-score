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
  onLoad() {
    this.setData({ ...app.globalData });
  },
  onEditAim() {
    this.setData({ isEditingAim: true });
  },
  bindAimInput(e) {
    this.setData({ aimInput: e.detail.value });
  },
  onChangeAim() {
    const db = wx.cloud.database();
    const { aimInput } = this.data;
    db.collection('user').doc().update({
      data: {
        aim: aimInput,
      },
      success: (res) => {
        console.log(res);
        this.setData({
          aim: aimInput,
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '修改失败',
          icon: 'none',
        });
      },
    });
    this.setData({ isEditingAim: false });
  },
  onEditLabels() {
    this.setData({ isEditingLabels: true });
  },
  onStopEditLabels() {
    this.setData({ isEditingLabels: false });
  },
  onDeleteLabel(e) {
    const db = wx.cloud.database();
    const { labels } = this.data;
    const newLabels = labels.filter(item => item.id != e.currentTarget.id);
    console.log(typeof e.currentTarget.id, newLabels, labels);
    db.collection('user').doc().update({
      data: {
        labels: newLabels,
      },
      success: (res) => {
        console.log(res);
        this.setData({
          labels: newLabels,
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '删除失败',
          icon: 'none',
        });
      },
    });
  },
  onAddLabel() {
    this.setData({ showCustonLabel: true });
  },
  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      weightIndex: e.detail.value,
    });
  },
  bindAddInput(e) {
    this.setData({
      addInputValue: e.detail.value,
    });
  },
  onChangeLabels() {
    this.setData({ isEditingLabels: false });
    const db = wx.cloud.database();
    const _ = db.command;
    const {
      labels, weightIndex, weights, addInputValue,
    } = this.data;
    const newLabelId = labels[labels.length - 1].id + 1;
    const newLabel = { id: newLabelId, description: addInputValue, weight: weights[weightIndex] };
    db.collection('user').doc().update({
      data: {
        labels: _.push(newLabel),
      },
      success: (res) => {
        console.log(res);
        this.setData({
          labels: labels.concat(newLabel),
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '新增失败',
          icon: 'none',
        });
      },
    });
    this.setData({ showCustonLabel: false });
  },
  cancelChangeLabels() {
    this.setData({ showCustonLabel: false });
  },
});
