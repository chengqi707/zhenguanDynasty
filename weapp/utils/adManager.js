// 广告管理器 - 封装微信广告 API

const app = getApp();

// 激励视频广告位 ID（占位，配置后 app.js onLaunch 才会初始化广告）
const AD_UNIT_ID = '';

let rewardedVideoAd = null;
let bannerAd = null;

// 激励视频广告
function initRewardedAd(adUnitId) {
  if (!wx.createRewardedVideoAd) {
    console.warn('当前版本不支持激励视频广告');
    return null;
  }
  rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: adUnitId || AD_UNIT_ID });
  
  rewardedVideoAd.onLoad(() => {
    console.log('激励视频广告加载成功');
  });
  
  rewardedVideoAd.onError((err) => {
    console.error('激励视频广告错误', err);
  });
  
  return rewardedVideoAd;
}

function showRewardedAd(options = {}) {
  return new Promise((resolve, reject) => {
    if (app.globalData.noAds) {
      resolve({ isEnded: true, noAds: true });
      return;
    }
    
    if (!rewardedVideoAd) {
      // 未配置广告位时走友好提示回退（由调用方 catch 后 toast），不报错
      console.warn('广告未初始化（未配置广告位 ID）');
      reject(new Error('广告未初始化'));
      return;
    }
    
    const onClose = (res) => {
      rewardedVideoAd.offClose(onClose);
      if (res && res.isEnded) {
        resolve({ isEnded: true });
      } else {
        reject(new Error('广告未完整观看'));
      }
    };
    
    rewardedVideoAd.onClose(onClose);
    rewardedVideoAd.show().catch(() => {
      rewardedVideoAd.load().then(() => rewardedVideoAd.show()).catch(reject);
    });
  });
}

// Banner 广告
function initBannerAd(adUnitId, style = {}) {
  if (!wx.createBannerAd) {
    console.warn('当前版本不支持 Banner 广告');
    return null;
  }
  
  const systemInfo = wx.getSystemInfoSync();
  bannerAd = wx.createBannerAd({
    adUnitId,
    style: {
      left: 0,
      top: systemInfo.windowHeight - 100,
      width: systemInfo.windowWidth,
      ...style
    }
  });
  
  bannerAd.onError((err) => {
    console.error('Banner 广告错误', err);
  });
  
  return bannerAd;
}

function showBannerAd() {
  if (app.globalData.noAds || !bannerAd) return;
  bannerAd.show().catch(console.error);
}

function hideBannerAd() {
  if (!bannerAd) return;
  bannerAd.hide();
}

function destroyBannerAd() {
  if (!bannerAd) return;
  bannerAd.destroy();
  bannerAd = null;
}

module.exports = {
  AD_UNIT_ID,
  initRewardedAd,
  showRewardedAd,
  initBannerAd,
  showBannerAd,
  hideBannerAd,
  destroyBannerAd
};
