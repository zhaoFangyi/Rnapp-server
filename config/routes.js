'use strict'

var Router = require('koa-router');
var User = require('../app/controllers/user');
var App = require('../app/controllers/app');
const router = new Router({prefix: '/api'});


router.post('/u/signup', User.signup)
// router.post('/u/signup', App.hasBody, async function (ctx) {
//   ctx.body = 1
// })
router.post('/u/verify',  User.verify)
router.post('/u/update', App.hasToken, User.update)
// app
router.post('/signature', App.signature)

module.exports = router;
