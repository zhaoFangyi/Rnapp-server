'use strict'

const qiniu = require('qiniu')
const cloudinary = require('cloudinary')
const Promise = require('bluebird')
const sha1 = require('sha1')
const uuid = require('uuid')
const config = require('../../config/config')


qiniu.conf.ACCESS_KEY = config.qiniu.AK
qiniu.conf.SECRET_KEY = config.qiniu.SK

let accessKey = config.qiniu.AK
let secretKey = config.qiniu.SK
let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

let bucket = 'gougouavatar'

function uptoken(bucket, key) {
  let options = {
    scope: bucket + ":" + key
  }
  let putPolicy = new qiniu.rs.PutPolicy(options)
  return putPolicy.uploadToken(mac)
  // let putPolicy = new qiniu.rs.PutPolicy(bucket + ':' + key)
  // return putPolicy.token()
}

exports.getQiniuToken = function(key) {
  let token = uptoken(bucket, key)
  return token
}

exports.saveToQiniu = function(url, key) {
  let client = new qiniu.rs.Client()

  return new Promise(function(resolve, reject) {
    client.fetch(url, 'gougouvideo', key, function(err, ret) {
      if (!err) {
        resolve(ret)
      }
      else {
        reject(err)
      }
    })
  })
}

exports.uploadToCloudinary = function(url) {
  return new Promise(function(resolve, reject) {
    cloudinary.uploader.upload(url, function(result) {
      if (result && result.public_id) {
        resolve(result)
      }
      else {
        reject(result)
      }
    }, {
      resource_type: 'video',
      folder: 'video'
    })
  })
}


exports.getCloudinaryToken = function(body) {
  let type = body
  let timestamp = body.timestamp
  let folder
  let tags

  if (type === 'avatar') {
    folder = 'avatar'
    tags = 'app,avatar'
  }
  else if (type === 'video') {
    folder = 'video'
    tags = 'app,video'
  }
  else if (type === 'audio') {
    folder = 'audio'
    tags = 'app,audio'
  }

  // data.data
  let signature = 'folder=' + folder + '&tags=' + tags + '&timestamp=' + timestamp + config.cloudinary.api_secret
  let key = uuid.v4()

  signature = sha1(signature)

  return {
    key: key,
    token: signature
  }
}

