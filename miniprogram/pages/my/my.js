import { updateLocalAndGlobalData } from '../../util/common';

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
  },
  onEditAim() {
    this.setData({ isEditingAim: true });
  },
  bindAimInput(e) {
    this.setData({ aimInput: e.detail.value });
  },
  onChangeAim() {
    const db = wx.cloud.database();
    const { aimInput, todayId, score } = this.data;
    if (aimInput) {
      db.collection('user').doc().update({
        data: {
          aim: aimInput,
        },
        success: (res) => {
          console.log(res);
          const infoData = { aim: aimInput };
          updateLocalAndGlobalData(this, app, infoData);
          if (todayId) {
            db.collection('daily').doc(todayId).update({
              data: {
                ispass: score >= aimInput,
              },
              fail: (err) => {
                console.error('[数据库] [更新记录] 失败：', err);
              },
            });
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '修改失败',
            icon: 'none',
          });
        },
      });
    }
    this.setData({ isEditingAim: false });
  },
  onEditLabels() {
    this.setData({ isEditingLabels: true });
  },
  onEditSingleLabel(e) {
    if (!this.data.isEditingLabels) return;
    console.log(e);
    const editingLabelId = 1 * e.currentTarget.id;
    this.setData({ editingLabelId });
  },
  onStopEditLabels() {
    this.setData({ isEditingLabels: false });
  },
  onFinishEditingLabel() {
    const {
      labels, weightIndex, weights, addInputValue, editingLabelId,
    } = this.data;
    const lastLabel = labels.filter(label => (label.id === editingLabelId));
    const lastWeight = lastLabel.weight;
    const lastDescription = lastLabel.description;
    if (addInputValue === '' && weights[weightIndex] === lastWeight) {
      return;
    }
    const newLabel = { id: editingLabelId, description: addInputValue || lastDescription, weight: weights[weightIndex] };
    const newLabels = labels.map(label => (label.id === editingLabelId ? newLabel : label));
    this.updateUserLabelInDb(newLabels);
    this.setData({ editingLabelId: null });
  },
  onDeleteLabel(e) {
    const db = wx.cloud.database();
    const { labels } = this.data;
    const newLabels = labels.filter(item => item.id != e.currentTarget.id);
    db.collection('user').doc().update({
      data: {
        labels: newLabels,
      },
      success: (res) => {
        console.log(res);
        const infoData = { labels: newLabels };
        updateLocalAndGlobalData(this, app, infoData);
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
    const {
      labels, weightIndex, weights, addInputValue,
    } = this.data;
    const newLabelId = labels[labels.length - 1].id + 1;
    const newLabel = { id: newLabelId, description: addInputValue, weight: weights[weightIndex] };
    const newLabels = labels.concat(newLabel);
    this.updateUserLabelInDb(newLabels);
    this.setData({
      isEditingLabels: false, showCustonLabel: false, addInputValue: '', editingLabelId: null,
    });
  },
  updateUserLabelInDb(newLabels) {
    const db = wx.cloud.database();
    db.collection('user').doc().update({
      data: {
        labels: newLabels,
      },
      success: (res) => {
        const infoData = { labels: newLabels };
        updateLocalAndGlobalData(this, app, infoData);
      },
      fail: (err) => {
        wx.showToast({
          title: '新增失败',
          icon: 'none',
        });
      },
    });
  },
  cancelChangeLabels() {
    this.setData({ showCustonLabel: false, editingLabelId: null });
  },
  onHide() {
    this.setData({
      isEditingAim: false,
      editingLabelId: null,
      isEditingLabels: false,
      weightIndex: 0,
      showCustonLabel: false,
    });
  },
});
