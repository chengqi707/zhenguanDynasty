// P0 回归：只使用内存中的微信 API 和数据库，不调用真实支付或云环境。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');
const plain = value => JSON.parse(JSON.stringify(value));

function createEnv() {
  const env = {
    storage: new Map(), calls: [], toasts: [], queries: [], writes: [], pages: [],
    tables: {}, openid: 'current_user', failStorage: false, failDatabase: false, receiptsEnabled: false,
    paymentCalls: 0, modalCalls: 0,
    cloudHandler: name => name === 'checkPurchase' ? { code: 0, purchased: {} } :
      { code: -1, message: '支付暂未开通，请稍后再试' },
    payHandler: options => options.success({}),
    modalHandler: options => options.success({ confirm: true })
  };
  const app = { globalData: { openid: env.openid, noAds: false }, saveSettings() {} };
  const wx = {
    getStorageSync: key => env.storage.has(key) ? plain(env.storage.get(key)) : '',
    setStorageSync: (key, value) => {
      if (env.failStorage) throw new Error('模拟存储失败');
      env.storage.set(key, plain(value));
    },
    removeStorageSync: key => env.storage.delete(key),
    showToast: value => env.toasts.push(value),
    reportEvent() {},
    showModal: options => { env.modalCalls++; queueMicrotask(() => env.modalHandler(options)); },
    requestPayment: options => { env.paymentCalls++; queueMicrotask(() => env.payHandler(options)); },
    cloud: {
      callFunction: options => {
        env.calls.push({ name: options.name, data: plain(options.data || {}) });
        Promise.resolve().then(() => env.cloudHandler(options.name, options.data || {})).then(
          result => options.success && options.success({ result }),
          error => options.fail && options.fail(error)
        );
      }
    }
  };
  const db = {
    serverDate: () => '服务端时间',
    collection(name) {
      const rows = env.tables[name] || (env.tables[name] = []);
      const makeQuery = (query = {}, max = Infinity) => ({
        where: value => makeQuery(value, max),
        limit: value => makeQuery(query, value),
        orderBy: () => makeQuery(query, max),
        async get() {
          if (env.failDatabase) throw new Error('模拟数据库故障');
          env.queries.push({ name, query: plain(query) });
          return { data: plain(rows.filter(row => Object.entries(query).every(([k, v]) => row[k] === v)).slice(0, max)) };
        },
        async add({ data }) {
          env.writes.push({ name, operation: 'add' });
          rows.push({ _id: name + rows.length, ...plain(data) });
        },
        doc(id) {
          return {
            async update({ data }) {
              env.writes.push({ name, operation: 'update' });
              Object.assign(rows.find(row => row._id === id), plain(data));
            }
          };
        }
      });
      return makeQuery();
    }
  };
  const sdk = { init() {}, getWXContext: () => ({ OPENID: env.openid }), database: () => db };
  const context = vm.createContext({
    console: { log() {}, warn() {}, error() {} }, wx, getApp: () => app,
    process: { env: { get PAYMENT_RECEIPTS_ENABLED() { return env.receiptsEnabled ? 'true' : undefined; } } },
    Page(page) {
      page.setData = values => Object.assign(page.data, values);
      env.pages.push(page);
    },
    App(value) { env.appDefinition = value; }
  });
  const cache = new Map();
  env.load = name => {
    const filename = path.resolve(ROOT, name);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const requireLocal = id => {
      if (id === 'wx-server-sdk') return sdk;
      if (!id.startsWith('.')) throw new Error('不允许外部依赖：' + id);
      const resolved = path.resolve(path.dirname(filename), id);
      return env.load(path.extname(resolved) ? resolved : resolved + '.js');
    };
    const source = fs.readFileSync(filename, 'utf8');
    vm.runInContext('(function(require, module, exports) {\n' + source + '\n})', context, { filename })(
      requireLocal, module, module.exports
    );
    return module.exports;
  };
  env.app = app;
  env.wx = wx;
  env.clearModules = () => cache.clear();
  return env;
}

const receipt = (productId = 'remove_ads') => ({
  verified: true, productId, orderId: 'ORDER_1', transactionId: 'TRANSACTION_1'
});
const orderParams = productId => ({
  code: 0, productId, orderId: 'ORDER_1', timeStamp: '1234567890', nonceStr: 'nonce',
  package: 'prepay_id=test', signType: 'RSA', paySign: 'test-sign'
});
function enablePayment(env, confirm = data => ({ code: 0, ...receipt(data.productId) })) {
  env.cloudHandler = (name, data) => {
    if (name === 'checkPurchase') return { code: 0, purchased: {} };
    if (name === 'createOrder') return orderParams(data.productId);
    if (name === 'confirmPayment') return confirm(data);
    throw new Error('未知云函数');
  };
}
function seedVerifiedOrder(env, changes = {}) {
  env.receiptsEnabled = true;
  env.tables.orders = [{
    _id: 'order', _openid: env.openid, orderId: 'ORDER_1', productId: 'remove_ads',
    status: 'paid', paymentVerified: true, transactionId: 'TRANSACTION_1', amount: 600, amountPaid: 600,
    ...changes
  }];
  env.tables.user_purchases = [{
    _openid: env.openid, productId: 'remove_ads', orderId: 'ORDER_1',
    paymentVerified: true, transactionId: 'TRANSACTION_1'
  }];
}

test('云不可用、游客、查单或下单故障均不调起支付、不发去广告权益', async t => {
  for (const kind of ['无云支持', '游客', '查单失败', '下单失败']) {
    await t.test(kind, async () => {
      const env = createEnv();
      if (kind === '无云支持') env.wx.cloud = null;
      if (kind === '游客') env.app.globalData.openid = null;
      if (kind === '查单失败') env.cloudHandler = () => { throw new Error('断网'); };
      if (kind === '下单失败') env.cloudHandler = name => {
        if (name === 'checkPurchase') return { code: 0, purchased: {} };
        throw new Error('断网');
      };
      await assert.rejects(env.load('weapp/utils/payment.js').purchase('removeAds'));
      assert.equal(env.paymentCalls, 0);
      assert.equal(env.app.globalData.noAds, false);
    });
  }
});

test('缺失、错误、残缺及模拟订单都不能作为支付成功', async t => {
  const cases = [undefined, {}, { code: -1, message: '支付未开通' },
    { ...orderParams('remove_ads'), simulated: true },
    { ...orderParams('remove_ads'), paySign: '' }, orderParams('lijing')];
  for (const [i, order] of cases.entries()) {
    await t.test('无效订单 ' + i, async () => {
      const env = createEnv();
      env.cloudHandler = name => name === 'checkPurchase' ? { code: 0, purchased: {} } : order;
      await assert.rejects(env.load('weapp/utils/payment.js').purchase('removeAds'));
      assert.equal(env.paymentCalls, 0);
      assert.equal(env.app.globalData.noAds, false);
    });
  }
});

test('加成包也必须经过云支付，不存在本地免费购买旁路', async () => {
  const env = createEnv();
  await assert.rejects(env.load('weapp/utils/payment.js').purchase('cycleBoost'), /支付暂未开通/);
  assert.equal(env.calls.at(-1).name, 'createOrder');
  assert.equal(env.calls.at(-1).data.productId, 'cycle_boost');
  assert.equal(env.paymentCalls, 0);
});

test('客户端支付回调成功后仍须等待正确的服务端核验凭证', async t => {
  const cases = [undefined, { code: -1 }, { code: 0 }, { code: 0, ...receipt('lijing') },
    { code: 0, ...receipt(), orderId: 'OTHER_ORDER' }, { code: 0, ...receipt(), simulated: true }];
  for (const [i, result] of cases.entries()) {
    await t.test('无效凭证 ' + i, async () => {
      const env = createEnv();
      enablePayment(env, () => result);
      await assert.rejects(env.load('weapp/utils/payment.js').purchase('removeAds'), /尚未核验/);
      assert.equal(env.app.globalData.noAds, false);
      assert.equal(env.paymentCalls, 1);
      assert.equal(env.storage.get('lyg_pending_payments').remove_ads, 'ORDER_1');
    });
  }
});

test('核验失败后跨模块重载只重试原订单，不再次支付', async () => {
  const env = createEnv();
  enablePayment(env, () => { throw new Error('核验断网'); });
  await assert.rejects(env.load('weapp/utils/payment.js').purchase('removeAds'), /尚未核验/);
  env.clearModules();
  enablePayment(env);
  const result = await env.load('weapp/utils/payment.js').purchase('removeAds');
  assert.equal(result.verified, true);
  assert.equal(env.paymentCalls, 1);
  assert.equal(env.calls.filter(c => c.name === 'createOrder').length, 1);
  assert.deepEqual(env.storage.get('lyg_pending_payments'), {});
});

test('取消支付清除待核验订单，支付异常则保留订单等待核验', async t => {
  for (const cancelled of [true, false]) {
    await t.test(cancelled ? '取消' : '支付异常', async () => {
      const env = createEnv();
      enablePayment(env);
      env.payHandler = options => options.fail({ errMsg: cancelled ? 'requestPayment:fail cancel' : 'network error' });
      await assert.rejects(env.load('weapp/utils/payment.js').purchase('removeAds'), cancelled ? /取消/ : /尚未核验/);
      assert.equal(!!env.storage.get('lyg_pending_payments').remove_ads, !cancelled);
      assert.equal(env.calls.filter(c => c.name === 'confirmPayment').length, 0);
    });
  }
});

test('同商品并发购买只允许一次支付', async () => {
  const env = createEnv();
  enablePayment(env);
  const pay = env.load('weapp/utils/payment.js');
  const first = pay.purchase('removeAds');
  await assert.rejects(pay.purchase('removeAds'), /请勿重复操作/);
  assert.equal((await first).verified, true);
  assert.equal(env.paymentCalls, 1);
});

test('购买只发送商品编号；持久化订单失败时不调起支付', async () => {
  const env = createEnv();
  enablePayment(env);
  env.failStorage = true;
  await assert.rejects(env.load('weapp/utils/payment.js').purchase('lijing'), /保存支付订单失败/);
  assert.deepEqual(env.calls.find(c => c.name === 'createOrder').data, { productId: 'lijing' });
  assert.equal(env.paymentCalls, 0);
});

test('恢复已核验权益不新建订单，旧版购买标记不能恢复去广告', async () => {
  const env = createEnv();
  const pay = env.load('weapp/utils/payment.js');
  env.cloudHandler = () => ({ code: 0, hasPurchased: true });
  assert.equal(await pay.checkPurchaseStatus(), false);
  env.cloudHandler = () => ({ code: 0, purchased: { remove_ads: receipt() } });
  const result = await pay.purchase('removeAds');
  assert.equal(result.restored, true);
  assert.equal(await pay.checkPurchaseStatus(), true);
  assert.equal(env.paymentCalls, 0);
  assert.equal(env.calls.some(c => c.name === 'createOrder'), false);
});

test('加成和领取标记一次写入，重复回调及重启后不叠加', () => {
  const env = createEnv();
  let saves = env.load('weapp/utils/saveManager.js');
  const cycle = saves.getCycleData();
  cycle.permanentBonus = { stability: 10, ability: 4 };
  saves.saveCycleData(cycle);
  assert.equal(saves.applyVerifiedPurchase(receipt('cycle_boost')), true);
  assert.equal(saves.applyVerifiedPurchase(receipt('cycle_boost')), false);
  env.clearModules();
  saves = env.load('weapp/utils/saveManager.js');
  assert.equal(saves.applyVerifiedPurchase({ ...receipt('cycle_boost'), orderId: 'SECOND_ORDER' }), false);
  assert.deepEqual(plain(saves.getCycleData().permanentBonus), { stability: 15, ability: 7 });
});

test('权益保存失败可安全重试，未经核验或模拟凭证不能发权益', () => {
  const env = createEnv();
  const saves = env.load('weapp/utils/saveManager.js');
  for (const invalid of [{}, { ...receipt('cycle_boost'), simulated: true }, { ...receipt('cycle_boost'), verified: false }]) {
    assert.throws(() => saves.applyVerifiedPurchase(invalid), /尚未通过核验/);
  }
  env.failStorage = true;
  assert.throws(() => saves.applyVerifiedPurchase(receipt('cycle_boost')), /保存失败/);
  assert.equal(env.storage.has('lyg_cycle'), false);
  env.failStorage = false;
  saves.applyVerifiedPurchase(receipt('cycle_boost'));
  assert.deepEqual(plain(saves.getCycleData().permanentBonus), { stability: 5, ability: 3 });
});

test('商铺连续点击及重复购买不会重复支付或领取；恢复不记新购买', async () => {
  const env = createEnv();
  enablePayment(env);
  env.load('weapp/pages/shop/shop.js');
  const shop = env.pages[0];
  shop.onLoad();
  const event = { currentTarget: { dataset: { id: 'cycleBoost' } } };
  const first = shop.purchaseItem(event);
  await shop.purchaseItem(event);
  await first;
  await shop.purchaseItem(event);
  assert.equal(env.modalCalls, 1);
  assert.equal(env.paymentCalls, 1);
  assert.equal(shop.data.purchasingId, '');
  assert.equal(shop.data.products.find(p => p.id === 'cycleBoost').purchased, true);
  env.cloudHandler = () => ({ code: 0, purchased: { cycle_boost: receipt('cycle_boost') } });
  await shop.restorePurchases();
  await shop.restorePurchases();
  assert.deepEqual(plain(env.load('weapp/utils/saveManager.js').getCycleData().permanentBonus), { stability: 5, ability: 3 });
  assert.equal(env.storage.get('lyg_logs').filter(log => log.event === 'purchase').length, 1);
});

test('商铺支付失败或取消后解锁按钮，不发任何加成', async () => {
  const env = createEnv();
  env.load('weapp/pages/shop/shop.js');
  const shop = env.pages[0];
  shop.onLoad();
  const event = { currentTarget: { dataset: { id: 'cycleBoost' } } };
  await shop.purchaseItem(event);
  assert.equal(shop.data.purchasingId, '');
  assert.deepEqual(plain(env.load('weapp/utils/saveManager.js').getCycleData().permanentBonus), { stability: 0, ability: 0 });
  env.modalHandler = options => options.success({ confirm: false });
  const count = env.calls.length;
  await shop.purchaseItem(event);
  assert.equal(env.calls.length, count);
  assert.equal(shop.data.purchasingId, '');
});

test('启动不信任旧设置中的模拟去广告标记，保留音效设置', () => {
  const env = createEnv();
  env.storage.set('lyg_settings', { noAds: true, sound: false, bgm: true });
  env.load('weapp/app.js');
  env.appDefinition.loadSettings();
  assert.equal(env.appDefinition.globalData.noAds, false);
  assert.equal(env.appDefinition.globalData.soundEnabled, false);
  assert.equal(env.appDefinition.globalData.bgmEnabled, true);
});

test('伪造其他用户 openid 不能读取或覆盖其存档，自己的存档可正常增改读', async () => {
  const env = createEnv();
  env.tables.game_saves = [{ _id: 'victim', _openid: 'other_user', slotId: 'main', saveData: { day: 12 } }];
  const save = env.load('weapp/cloudfunctions/saveGame/index.js').main;
  const load = env.load('weapp/cloudfunctions/loadGame/index.js').main;
  assert.equal((await load({ openid: 'other_user' })).data, null);
  assert.equal((await save({ openid: 'other_user', saveData: { day: 1 } })).code, 0);
  assert.equal(env.tables.game_saves[0].saveData.day, 12);
  assert.equal((await load({ openid: 'other_user' })).data.day, 1);
  await save({ openid: 'other_user', saveData: { day: 2 } });
  assert.equal((await load({})).data.day, 2);
  assert.equal(env.tables.game_saves.length, 2);
  assert.equal(env.queries.every(q => q.query._openid === 'current_user'), true);
});

test('缺失可信身份时所有用户云接口拒绝请求且不访问数据库', async () => {
  for (const name of ['saveGame', 'loadGame', 'createOrder', 'confirmPayment', 'checkPurchase']) {
    const env = createEnv();
    env.openid = undefined;
    const result = await env.load('weapp/cloudfunctions/' + name + '/index.js').main({
      openid: 'forged', saveData: { day: 1 }, productId: 'remove_ads', orderId: 'ORDER_1'
    });
    assert.equal(result.code, -1, name);
    assert.equal(env.queries.length, 0, name);
    assert.equal(env.writes.length, 0, name);
  }
});

test('云存档拒绝查询对象注入和无效数据，数据库故障返回中文失败', async () => {
  const env = createEnv();
  const save = env.load('weapp/cloudfunctions/saveGame/index.js').main;
  const load = env.load('weapp/cloudfunctions/loadGame/index.js').main;
  for (const slotId of [{ $ne: '' }, '', 'x'.repeat(33)]) {
    assert.equal((await save({ slotId, saveData: { day: 1 } })).code, -1);
    assert.equal((await load({ slotId })).code, -1);
  }
  for (const saveData of [null, [], 'invalid']) assert.equal((await save({ saveData })).code, -1);
  assert.equal(env.queries.length, 0);
  env.failDatabase = true;
  assert.match((await save({ saveData: { day: 1 } })).message, /保存失败/);
  assert.match((await load({})).message, /读取失败/);
});

test('客户端云存档请求不再传入用户身份', async () => {
  const env = createEnv();
  env.cloudHandler = () => ({ code: 0 });
  const manager = env.load('weapp/utils/cloudManager.js');
  await manager.saveToCloud({ day: 1 });
  await manager.loadFromCloud();
  assert.equal(env.calls.every(c => !Object.hasOwn(c.data, 'openid')), true);
});

test('未配置支付时下单与伪造回调明确失败，不生成订单或权益', async () => {
  const env = createEnv();
  const create = env.load('weapp/cloudfunctions/createOrder/index.js').main;
  const callback = env.load('weapp/cloudfunctions/paymentCallback/index.js').main;
  assert.equal((await create({ productId: 'remove_ads', price: 0, openid: 'forged' })).reason, 'PAYMENT_NOT_CONFIGURED');
  assert.equal((await create({ productId: { $ne: '' } })).code, -1);
  assert.equal((await callback({ userInfo: { openId: 'forged' }, paymentVerified: true })).code, -1);
  assert.equal((await callback(null)).code, -1);
  assert.equal(env.writes.length, 0);
});

test('未付款、旧版伪成功、金额不符或其他用户订单均不能被客户端确认', async t => {
  for (const change of [
    { status: 'unpaid' }, { paymentVerified: false }, { amountPaid: 1 },
    { _openid: 'other_user' }, { transactionId: '' }, { amount: 0, amountPaid: 0 }
  ]) {
    await t.test(JSON.stringify(change), async () => {
      const env = createEnv();
      seedVerifiedOrder(env, change);
      const confirm = env.load('weapp/cloudfunctions/confirmPayment/index.js').main;
      const result = await confirm({ ...receipt(), openid: 'other_user', paymentVerified: true });
      assert.equal(result.code, -1);
      assert.equal(env.writes.length, 0);
    });
  }
});

test('已核验订单及匹配权益可重复确认，确认接口始终只读', async () => {
  const env = createEnv();
  seedVerifiedOrder(env);
  const confirm = env.load('weapp/cloudfunctions/confirmPayment/index.js').main;
  for (let i = 0; i < 2; i++) assert.equal((await confirm(receipt())).verified, true);
  env.tables.user_purchases[0].transactionId = 'WRONG_TRANSACTION';
  assert.equal((await confirm(receipt())).code, -1);
  assert.equal(env.writes.length, 0);
});

test('支付服务默认关闭时，即使数据库存在伪造核验标记也不能恢复权益', async () => {
  const env = createEnv();
  seedVerifiedOrder(env);
  env.receiptsEnabled = false;
  const confirm = env.load('weapp/cloudfunctions/confirmPayment/index.js').main;
  const check = env.load('weapp/cloudfunctions/checkPurchase/index.js').main;
  assert.equal((await confirm(receipt())).reason, 'PAYMENT_NOT_CONFIGURED');
  assert.equal((await check({})).hasPurchased, false);
  assert.equal(env.queries.length, 0);
  assert.equal(env.writes.length, 0);
});

test('恢复购买只认可当前用户、匹配订单与金额的可信凭证', async () => {
  const env = createEnv();
  seedVerifiedOrder(env);
  const check = env.load('weapp/cloudfunctions/checkPurchase/index.js').main;
  assert.equal((await check({ openid: 'other_user' })).purchased.remove_ads.verified, true);
  env.tables.orders[0].amountPaid = 100;
  assert.equal((await check({})).hasPurchased, false);
  env.tables.orders[0].amountPaid = 600;
  env.tables.user_purchases[0].paymentVerified = false;
  assert.equal((await check({})).hasPurchased, false);
  assert.equal((await check({ productId: { $ne: '' } })).code, -1);
  assert.equal(env.queries.every(q => q.query._openid === env.openid), true);
  assert.equal(env.writes.length, 0);
});
