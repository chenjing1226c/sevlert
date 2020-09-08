var express = require('express');
var router = express.Router();
const md5= require('blueimp-md5')
const UserModel=require('../db/models').UserModel
const filter={password:0}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// //注册路由
// router.post('/register',function (req,res) {
//   const {username,password}=req.body
//   if(username ==='admin'){
//      res.send({code:1,msg:'用户已经存在'})
//   }else{
//     res.send({code:0,data:{id:'abc123',username,password}})
//
//   }
// })
//注册的路由
router.post('/register',function(req,res){
  const {username, password, type} = req.body
  UserModel.findOne({username}, function (err, user) {
// 3.1. 如果存在, 返回一个提示响应数据: 此用户已存在
    if(user) {
      res.send({code: 1, msg: '此用户已存在'}) // code 是数据是否是正常数据的标识
    } else {
// 2.2. 如果不存在, 将提交的 user 保存到数据库
      new UserModel({username, password:md5(password), type}).save(function (err, user) {
// 生成一个 cookie(userid: user._id), 并交给浏览器保存
        res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7}) // 持久化 cookie, 浏览器会保存在本地文件
// 3.2. 保存成功, 返回成功的响应数据: user
        res.send({code: 0, data: {_id: user._id, username, type}}) // 返回的数据中不要携带 pwd
      })
    }
  })
})
// 登陆路由
router.post('/login', function (req, res) {
// 1. 获取请求参数数据(username, password)
  const {username, password} = req.body
// 2. 处理数据: 根据 username 和 password 去数据库查询得到 user
  UserModel.findOne({username, password: md5(password)}, filter, function (err, user)
  {
// 3. 返回响应数据
// 3.1. 如果 user 没有值, 返回一个错误的提示: 用户名或密码错误
    if(!user) {
      res.send({code: 1, msg: '用户名或密码错误'})
    } else {
// 生成一个 cookie(userid: user._id), 并交给浏览器保存
      res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7})
// 3.2. 如果 user 有值, 返回 user
      res.send({code: 0, data: user}) // user 中没有 pwd
    }
  })
})

module.exports = router;
