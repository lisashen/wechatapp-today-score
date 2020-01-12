// components/component-tag-name.js
Component({
  /**
       * 组件的属性列表
       */
  properties: {
    stepperNum: { // 属性名
      type: Number,
      // value: '',
    },
    inputValue: {
      type: String,
      // value: '',
    },
  },

  /**
       * 组件的初始数据
       */
  data: {
    // label: properties.label,
    // label: this.properties,
  },

  /**
       * 组件的方法列表
       */
  methods: {
    onAddInput(e) {
      const myEventDetail = { value: e.detail.value }; // detail对象，提供给事件监听函数
      const myEventOption = {}; // 触发事件的选项
      this.triggerEvent('bindAddInput', myEventDetail, myEventOption);
    },

    onStepperChange(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value);
      const myEventDetail = { value: e.detail.value }; // detail对象，提供给事件监听函数
      const myEventOption = {}; // 触发事件的选项
      this.triggerEvent('bindPickerChange', myEventDetail, myEventOption);
    },

  },
  options: {
    styleIsolation: 'isolated',
  },
});
