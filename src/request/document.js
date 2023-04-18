import service from "./index";

//新建：新建，上传，打开 or 新建，更新 请求数据类型DocumentBean{docUID, title?,format?,authorUID?}
//rmg: 200 DocumentUID docUID
function newDocument(uid,data){
    return service({
        url:"/document/new/" + uid,
        method:"post",
        data
    })
}

//上传文档内容 请求数据类型List<String>
//rmg: 200 String Success
function newContent(docUID,data){
    return service({
        url:"/document/newContent/" + docUID,
        method:"post",
        data
    })
}

//重命名: 请求数据类型：string newTitle
//rmg: 200 String Success
function updateTitle(docUID,data){
    return service({
        url:"/document/updateTitle/" + docUID,
        method:"patch",
        data
    })
}

//修改文档描述: 请求数据类型：string newTitle
//rmg: 200 String Success
function updateDescription(docUID,data){
    return service({
        url:"/document/updateDesc/" + docUID,
        method:"patch",
        data
    })
}

//打开文档
//rmg: 200 DocumentContent document
function openDocument(docUID) {
    return service({
        url:"/document/open/" + docUID,
        method:"get"
    })
}

//保存
//rmg: 403 String ERROR; 200 String Succuss
function saveDocument(docUID) {
    return service({
        url:"/document/save/" + docUID,
        method:"post"
    })
}

//关闭
//rmg: 200 String Success
function closeDocument(docUID) {
    return service({
        url:"/document/close/" + docUID,
        method:"post"
    })
}

//更新-这个走websocket

//测试
function test(data){
    return service({
        url:"/document/test",
        method:"post",
        data
    })
}

export {newDocument,newContent,updateTitle,updateDescription,openDocument,saveDocument,closeDocument,test}