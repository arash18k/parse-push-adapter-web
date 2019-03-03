'use strict';

import Parse from 'parse';
import log from 'npmlog';
import APNS from './APNS';
import GCM from './GCM';
import { classifyInstallations } from './PushAdapterUtils';

const LOG_PREFIX = 'parse-push-adapter-web';

export default class ParsePushAdapterWeb {

  supportsPushTracking = true;

  constructor(pushConfig = {}) {
    log.verbose('Push Adapter intializing...');
    this.validPushTypes = ['ios', 'osx', 'tvos', 'android', 'fcm', 'chrome', 'firefox'];
    this.senderMap = {};
    // used in PushController for Dashboard Features
    this.feature = {
      immediatePush: true
    };
    let pushTypes = Object.keys(pushConfig);

    for (let pushType of pushTypes) {
      // Ignore adapter key
      if (pushType == "adapter")
        continue;
      if (this.validPushTypes.indexOf(pushType) < 0) {
        throw new Parse.Error(
          Parse.Error.PUSH_MISCONFIGURED,
          'Push to ' + pushType + ' is not supported');
      }
      switch (pushType) {
        case 'ios':
        case 'tvos':
        case 'osx':
          this.senderMap[pushType] = new APNS(pushConfig[pushType]);
          break;
        case 'android':
        case 'fcm':
          this.senderMap[pushType] = new GCM(pushConfig[pushType]);
        case 'firefox':
        case 'chrome':
          this.senderMap[pushType] = new GCM(pushConfig[pushType]);
          break;
      }
    }
  }

  getValidPushTypes() {
    return this.validPushTypes;
  }

  static classifyInstallations(installations, validTypes) {
    return classifyInstallations(installations, validTypes)
  }

  send(data, installations) {
    log.verbose(JSON.stringify(installations));
    let deviceMap = classifyInstallations(installations, this.validPushTypes);
    let sendPromises = [];
    for (let pushType in deviceMap) {
      let sender = this.senderMap[pushType];
      let devices = deviceMap[pushType];

      if(Array.isArray(devices) && devices.length > 0) {
        if (!sender) {
          log.verbose(LOG_PREFIX, `Can not find sender for push type ${pushType}, ${data}`)
          let results = devices.map((device) => {
            return Promise.resolve({
              device,
              transmitted: false,
              response: {'error': `Can not find sender for push type ${pushType}, ${data}`}
            })
          });
          sendPromises.push(Promise.all(results));
        } else {
          sendPromises.push(sender.send(data, devices));
        }
      }
    }
    return Promise.all(sendPromises).then((promises) => {
      // flatten all
      return [].concat.apply([], promises);
    })
  }
}
