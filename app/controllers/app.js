'use strict'

const mongoose = require('mongoose')
const User = mongoose.model('User')
const robot = require('../service/robot')
const uuid = require('uuid')

exports.signature =  async function(ctx, next) {
  console.log(ctx.request.body)
  let body = ctx.request.body
  let cloud = body.cloud
  let token, key
  if (cloud === 'qiniu') {
    key = uuid.v4() + '.jpeg'
    token = robot.getQiniuToken(key)
  }else {
    token = robot.getCloudinaryToken(key)
  }

  ctx.body = {
    success: true,
    data: {
      token,
      key
    }
  }
}
exports.hasBody = async function(ctx, next) {
  var body = ctx.request.body || {}

  if (Object.keys(body).length === 0) {
    ctx.body = {
      success: false,
      err: '是不是漏掉什么了'
    }
  }

  next()
}

exports.hasToken =  async function(ctx, next) {
  let accessToken = ctx.query.accessToken

  if (!accessToken) {
    console.log('this is no access')
    accessToken = (ctx.request.body.accessToken)
    console.log(accessToken)
  }
  if (!accessToken) {
    ctx.body = {
      success: false,
      err: '钥匙丢了'
    }
  }

  let user = await User.findOne({
    accessToken: accessToken
  })
    .exec()

  if (!user) {
    ctx.body = {
      success: false,
      err: '用户没登陆'
    }
  }

  ctx.session = ctx.session || {}
  ctx.session.user = user

  await next()
}

