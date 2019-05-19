// components/component-tag-name.js
Component({
  /**
       * 组件的属性列表
       */
  properties: {
    weightIndex: { // 属性名
      type: Number,
      value: '',
    },
    weights: { // 属性名
      type: Array,
      value: [1, 2, 3, 4, 5, 6, 7],
    },
    inputValue: {
      type: String,
      value: '',
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

    onPickerChange(e) {
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
