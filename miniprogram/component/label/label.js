// components/component-tag-name.js
Component({
  /**
     * 组件的属性列表
     */
  properties: {
    label: { // 属性名
      type: String,
      value: '',
    },
    isChecked: { // 属性名
      type: Boolean,
      value: '',
    },
    weight: { // 属性名
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


  },
  options: {
    styleIsolation: 'isolated',
  },
});
