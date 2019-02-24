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
        const infoData = { aim: aimInput };
        this.updateLocalAndGlobalData(infoData);
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
  onEditSingleLabel(e) {
    console.log(e);
    const editingLabelId = 1 * e.currentTarget.id;
    this.setData({ editingLabelId });
  },
  onStopEditLabels() {
    this.setData({ isEditingLabels: false });
  },
  onFinishEditingLabel(e) {
    const {
      labels, weightIndex, weights, addInputValue, editingLabelId,
    } = this.data;
    if (addInputValue === '' && weights[weightIndex] === labels[editingLabelId].weight) {
      return;
    }
    const newLabel = { id: editingLabelId, description: addInputValue || labels[editingLabelId].description, weight: weights[weightIndex] };
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
        this.updateLocalAndGlobalData(infoData);
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
    this.setData({ isEditingLabels: false, showCustonLabel: false, addInputValue: '' });
  },
  updateUserLabelInDb(newLabels) {
    const db = wx.cloud.database();
    db.collection('user').doc().update({
      data: {
        labels: newLabels,
      },
      success: (res) => {
        const infoData = { labels: newLabels };
        this.updateLocalAndGlobalData(infoData);
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
    this.setData({ showCustonLabel: false });
  },
  updateLocalAndGlobalData(data) {
    this.setData({ ...data });
    Object.assign(app.globalData, data);
  },
});
