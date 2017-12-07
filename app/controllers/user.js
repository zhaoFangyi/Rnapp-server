'use strict'

const mongoose = require('mongoose')
const xss = require('xss');
const uuid = require('uuid')

const sms = require('../service/sms')
const User = require('../models/user')

exports.signup = async function(ctx, next) {
  let phoneNumber = xss(ctx.request.body.phoneNumber.trim())
  console.log(phoneNumber)

  let user = await User.findOne({phoneNumber}).exec()
  console.log(user)

  // let verifyCode = sms.getCode()
  let verifyCode = 1234
  console.log(verifyCode)

  if (!user) {
    let accessToken = uuid.v4()

    user = new User({
      nickname: '小狗宝',
      avatar: 'http://res.cloudinary.com/gougou/image/upload/mooc1.png',
      phoneNumber: xss(phoneNumber),
      verifyCode: verifyCode,
      accessToken: accessToken
    })
  } else {
    user.verifyCode = verifyCode
  }

  try {
    console.log(user)
    user = await user.save()
  }
  catch (e) {
    console.log(e)

    ctx.body = {
      success: false
    };
    return next
  }

  let msg = '您的注册验证码是：' + user.verifyCode + '【朝许夕诺】'
  console.log(msg)

  // try {
  //   sms.send(user.phoneNumber, msg)
  // }
  // catch (e) {
  //   console.log(e)
  //
  //   ctx.body = {
  //     success: false,
  //     err: '短信服务异常'
  //   }
  //
  //   return next
  // }
  ctx.body = {
    success: true
  }
}

exports.verify = async function (ctx, next) {
  let verifyCode = ctx.request.body.verifyCode
  let phoneNumber = xss(ctx.request.body.phoneNumber.trim())

  if (!verifyCode || !phoneNumber) {
    ctx.body = {
      success: false,
      err: '验证没通过'
    }
  }

  let user = await User.findOne({
    phoneNumber: phoneNumber,
    verifyCode: verifyCode
  }).exec()


  if (user) {
    user.verified = true
    user = await user.save()

    ctx.body = {
      success: true,
      data: {
        nickname: user.nickname,
        accessToken: user.accessToken,
        avatar: user.avatar,
        _id: user._id
      }
    }
  }
  else {
    ctx.body = {
      success: false,
      err: '验证未通过'
    }
  }
}

exports.update = async function (ctx, next) {
  let body = ctx.request.body
  let user = ctx.session.user
  console.log(body)
  console.log(user)
  let fields = 'avatar,gender,age,nickname,breed'.split(',')
  console.log(fields)
  fields.forEach(function(field) {
    if (body[field]) {
      user[field] = xss(body[field].trim())
    }
  })

  user = await user.save()
  console.log(user)

  ctx.body = {
    success: true,
    data: {
      nickname: user.nickname,
      accessToken: user.accessToken,
      avatar: user.avatar,
      age: user.age,
      breed: user.breed,
      gender: user.gender,
      _id: user._id
    }
  }
}