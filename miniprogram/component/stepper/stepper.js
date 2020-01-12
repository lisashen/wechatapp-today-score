Component({
  properties: {
    stepperNum: { // 属性名
      type: Number,
    //   value: '',
    },
  },
  data: {
    // 这里是一些组件内部数据
    // input默认是1
    num: 1,
    // 使用data数据对象设置样式名
    minusStatus: 'disabled',
  },
  methods: {
    // 这里放置自定义方法
    /* 点击减号 */
    bindMinus() {
      let { num } = this.data;
      // 如果大于1时，才可以减
      if (num > 1) {
        num -= 1;
      }
      // 只有大于一件的时候，才能normal状态，否则disable状态
      const minusStatus = num <= 1 ? 'disabled' : 'normal';
      // 将数值与状态写回
      this.setData({
        num,
        minusStatus,
      });
      this.triggerEvent('bindStepperChange', { value: num }, {});
    },
    /* 点击加号 */
    bindPlus() {
      let { num } = this.data;
      console.log(typeof num);
      // 不作过多考虑自增1
      num += 1;
      // 只有大于一件的时候，才能normal状态，否则disable状态
      const minusStatus = num < 1 ? 'disabled' : 'normal';
      // 将数值与状态写回
      this.setData({
        num,
        minusStatus,
      });
      this.triggerEvent('bindStepperChange', { value: num }, {});
    },
    /* 输入框事件 */
    bindManual(e) {
      const num = e.detail.value * 1;
      console.log('manual', typeof num);
      // 将数值与状态写回
      this.setData({
        num,
      });
      this.triggerEvent('bindStepperChange', { value: num }, {});
    },
  },
});
