'use strict'

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const db = 'mongodb://localhost/zhaofy-app'

mongoose.Promise = require('bluebird')

mongoose.connect(db, {useMongoClient: true})

mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + db);
})
mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
})
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected')
})

// const models_path = path.join(__dirname, '/app/models')
// require('./app/models/user')
// 模型文件加载和初始化
// const walk = function (modelPath) {
//   console.log(modelPath);
//   fs.readdirSync(modelPath)
//     .forEach(file => {
//       let filePath = path.join(modelPath, '/' + file)
//       let stat = fs.statSync(filePath)
//
//       if (stat.isFile()) {
//         if (/(.*)\.(js|coffee)/.test(file)) {
//           require(filePath)
//         }
//       } else if (stat.isDirectory()){
//         walk(filePath)
//       }
//     })
// }
// walk(models_path)

const Koa = require('koa');
const logger = require('koa-logger');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const app =new Koa();

app.keys = ['zhaofy'];
// middleware 中间件
app.use(logger());
const CONFIG = {
  key: 'koa:sess',
  maxAge: 86400000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
};
app.use(session(CONFIG, app));
app.use(bodyParser());

var router = require('./config/routes');

app.use(router.routes()).use(router.allowedMethods())

// app.use(async ctx => {
//   ctx.body = 'Hello World';
// });

app.listen(3000);
console.log('Listening: 3000');