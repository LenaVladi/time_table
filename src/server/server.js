const Koa = require('koa'); // ��������� ���
const axios = require('axios'); // ��� ��������
const Router = require('koa-router'); // ��� ��������� � ������ ������ /
const cors = require('@koa/cors'); // ��� ���������� ����
const koaBody = require('koa-body'); // ��� ��������� ���������� �������
const app = new Koa();

var router = new Router();

router.get('/', koaBody(), async (ctx, next) => { // get('/') - ����� �� �������� ����������
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

app.listen(3000); // ���� 3000