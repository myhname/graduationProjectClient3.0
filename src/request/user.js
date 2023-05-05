import service from "./index";

//?代表要赋值，没有就null
//返回值 rmg {code type object}

// 登录：请求数据类型UserBean {UUID~ name~ password? account?}
//rmg: 401 String Error; 403 String Error；200 Token token(从token中可以解析得到uuid，这个得留下来)
function login(data){
    return service({
        url:"/user/login",
        method:"post",
        data
    })
}

//注册：请求数据类型UserBean {UUID~ name? password? account?}
//rmg: 401 String Error; 200 Token token(从token中可以解析得到uuid，这个得留下来)
function register(data){
    return service({
        url:"/user/register",
        method:"post",
        data
    })
}

//删除
//rmg：401 String Error; 200 String success
function deleteUser(uid){
    return service({
        url:"/user/deleteUser/" + uid,
        method:"delete"
    })
}

//修改密码: 请求数据类型String newPassword
//rmg: 401 String ERROR; 200 String Success
function changePassword(uid,data){
    return service({
        url:"/user/changePassword/" + uid,
        method:"patch",
        data
    })
}

//获取文档列表
//rmg: 406 Strig ERROR; 200 List of DocView List<DocView> 
function getDocList(uid){
    return service({
        url:"/user/docList/" + uid,
        method:"get"
    })
}

//修改权限：请求数据类型 PermissionBean{docUID?,userUID?,permissionType?}
//rmg: 403 String ERROR; 200 String Success
function addPermission(uid,data){
    return service({
        url:"/user/addPermission/" + uid,
        method:"post",
        data
    })
}

function addCommend(data){
    return service({
        url:"/user/addCommends",
        method:"post",
        data
    })
}

function deleteCommend(userUID,docUID,data){
    return service({
        url:"/user/deleteCommends/" + userUID + "/" + docUID,
        method:"post",
        data
    })
}

export {login,register,deleteUser,changePassword,getDocList,addPermission,addCommend,deleteCommend}
