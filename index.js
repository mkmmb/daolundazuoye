import mqtt from'../utils/mqtt.js';

const aliyunOpt = require('../utils/aliyun/aliyun_connect.js');

let that = null;
Page({
    data:{
      client:null,//记录重连的次数
      reconnectCounts:0,//MQTT连接的配置
      options:{
        protocolVersion: 4, //MQTT连接协议版本
        clean: false,
        reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
        connectTimeout: 30 * 1000, //1000毫秒，两次重新连接之间的间隔
        resubscribe: true, //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
        clientId: '',
        password: '',
        username: '',
      },
      gopage1:function(){
        wx.navigateTo({
          url: '/page1/page1',
        })
      },
      aliyunInfo: {
        productKey: 'hecrRAFxu4b',
        deviceSecret: 'f9af30c2d8eb72e9b482d1529f0d1448', 
        regionId: 'cn-shanghai', 
        pubTopic: '/hecrRAFxu4b/WeiXinDuan/user/WeiXinDuan', 
        subTopic: '/a1qNrNN1l9s/weixin/user/get', 
      },


    },
onLoad:function(){
  that = this;
      let clientOpt = aliyunOpt.getAliyunIotMqttClient({
        productKey: that.data.aliyunInfo.productKey,
        deviceName: that.data.aliyunInfo.deviceName,
        deviceSecret: that.data.aliyunInfo.deviceSecret,
        regionId: that.data.aliyunInfo.regionId,
        port: that.data.aliyunInfo.port,
      });
      console.log("get data:" + JSON.stringify(clientOpt));
      let host = 'wxs://' + clientOpt.host;
      console.log("get data:" + JSON.stringify(clientOpt));
      this.setData({
        'options.clientId': clientOpt.clientId,
        'options.password': clientOpt.password,
        'options.username': clientOpt.username,
      })
      console.log("this.data.options host:" + host);
      console.log("this.data.options data:" + JSON.stringify(this.data.options));

      this.data.client = mqtt.connect(host, this.data.options);
      this.data.client.on('connect', function (connack) {
        wx.showToast({
          title: '连接成功'
        })
      })

      that.data.client.on("message", function (topic, payload) {
        console.log(" 收到 topic:" + topic + " , payload :" + payload)
        wx.showModal({
          content: " 收到topic:[" + topic + "], payload :[" + payload + "]",
          showCancel: false,
        });
      })
      //服务器连接异常的回调
      that.data.client.on("error", function (error) {
        console.log(" 服务器 error 的回调" + error)

      })
      //服务器重连连接异常的回调
      that.data.client.on("reconnect", function () {
        console.log(" 服务器 reconnect的回调")

      })
      //服务器连接异常的回调
      that.data.client.on("offline", function (errr) {
        console.log(" 服务器offline的回调")
      })
    },
    //发送信息，开
    TurnOnLight() {
      that.sendCommond('set', 1);
    },
    //发送信息，关
    TurnOffLight() {
      that.sendCommond('set', 0);
    },
    sendCommond(cmd, data) {
      let sendData = {
        cmd: cmd,
        data: data,
      };
      if (this.data.client && this.data.client.connected) {
        this.data.client.publish(this.data.aliyunInfo.pubTopic, JSON.stringify(sendData));
  
      } else {
        wx.showToast({
          title: '请先连接服务器',
          icon: 'none',
          duration: 2000
        })
      }
    },
})
