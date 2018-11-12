const Koa = require('koa'); // фреймворк коа
const axios = require('axios'); // для запросов
const Router = require('koa-router'); // для маршрутов в данном случае /
const cors = require('@koa/cors'); // для заголовков корс
const koaBody = require('koa-body'); // для получения параметров запроса
const app = new Koa();

var router = new Router();

router.get('/', koaBody(), async (ctx, next) => { // get('/') - адрес по которому обращаться
  const { query } = ctx.request;
  const data = await axios.get('https://api.rasp.yandex.net/v3.0/schedule/', {
    params: query,
  }).catch(function (error) {
      console.warn(error.response);
  });
  ctx.body = data.data;
});

app
  .use(koaBody())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000); // порт 3000