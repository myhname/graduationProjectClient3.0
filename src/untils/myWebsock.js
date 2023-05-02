import emitter from './eventBus'

export default class SocketService {
    static instance = null;
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService();
        }
        return this.instance;
    }
    // 和服务端连接的socket对象
    ws = null;
    // 存储回调函数
    callBackMapping = {};
    // 标识是否连接成功
    connected = false;
    // 记录重试的次数
    sendRetryCount = 0;
    // 重新连接尝试的次数
    connectRetryCount = 0;
    //  定义连接服务器的方法
    connect() {
        // 连接服务器
        if (!window.WebSocket) {
            return console.log('您的浏览器不支持WebSocket');
        }
        // let token = $.cookie('123');
        // let token = '4E6EF539AAF119D82AC4C2BC84FBA21F';
        let url = 'ws://127.0.0.1:3000/my-websocket';

        //这里取个巧，干脆不设置请求头了
        //this.ws = new WebSocket(url, 'echo-protocol');
        this.ws = new WebSocket(url);
        // 连接成功的事件
        this.ws.onopen = () => {
            console.log('连接服务端成功了');
            emitter.emit('sendConnectionMSG', true)
            this.connected = true;
            // 重置重新连接的次数
            this.connectRetryCount = 3;
            // 这个打开文章时候发，之后改！
            // 我需要发送一个初始信息，来表明是在编辑那一篇文章，如果没有用户和当前文章直接禁止建立连接
            let message = {
                userUID: localStorage.getItem('userUID'),
                docUID: localStorage.getItem('currDocUID'),
                changeType: "startEditor",
                startLine: 0,
                newContent: ['0'],
                removedNumbers: 0
            }
            // 第一次建立连接时候需要发送新的请求
            this.ws.send(JSON.stringify(message))
        };
        // 1.连接服务端失败
        // 2.当连接成功之后, 服务器关闭的情况
        this.ws.onclose = () => {
            console.log('连接服务端失败');
            emitter.emit('sendConnectionMSG', false)
            this.connected = false;
            this.connectRetryCount++;
            setTimeout(() => {
                this.connect();
            }, 500 * this.connectRetryCount);
        };
        // 得到服务端发送过来的数据
        this.ws.onmessage = msg => {
            let data = msg.data.toString()
            // data.subString()
            console.log("websocket.js中接收到了信息：")
            console.log(JSON.parse(data))
            emitter.emit('sendWebSocketReceiveData', data)
        };
    }
    // 回调函数的注册
    registerCallBack(socketType, callBack) {
        this.callBackMapping[socketType] = callBack;
    }
    // 取消某一个回调函数
    unRegisterCallBack(socketType) {
        this.callBackMapping[socketType] = null;
    }
    // 发送数据的方法
    send(data) {
        // 判断此时此刻有没有连接成功
        if (this.connected) {
            this.sendRetryCount = 0;
            try {
                this.ws.send(JSON.stringify(data));
            } catch (e) {
                this.ws.send(data);
            }
        } else {
            this.sendRetryCount++;
            setTimeout(() => {
                this.send(data);
            }, this.sendRetryCount * 500);
        }
    }
    close() {
        this.connected = false;
        this.ws.close()
        // 主动断开连接后不再自动重连
        this.ws.onclose = ()=>{}
        console.log("连接已断开")
        emitter.emit('sendConnectionMSG', false)
    }
    // receive(){
    //     let data;
    //     this.ws.onmessage = (msg) =>{
    //         data = msg.data
    //         console.log("websocket.js中接收到了信息：" + data)
    //         emitter.emit('sendWebSocketReceiveData', data)
    //     }
    // }
}