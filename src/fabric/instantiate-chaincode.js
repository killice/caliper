/**
 * Modifications Copyright 2017 HUAWEI
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// This is an end-to-end test that focuses on exercising all parts of the fabric APIs
// in a happy-path scenario
'use strict';

const e2eUtils = require('./e2eUtils.js');
const commUtils = require('../comm/util');
const commLogger = commUtils.getLogger('instantiate-chaincode.js');

const Client = require('fabric-client');

module.exports.run = function (config_path) {
    Client.addConfigFile(config_path);
    const fabricSettings = Client.getConfigSetting('fabric');
    const policy = fabricSettings['endorsement-policy'];  // TODO: support mulitple policies
    let chaincodes = fabricSettings.chaincodes;
    if(typeof chaincodes === 'undefined' || chaincodes.length === 0) {
        return Promise.resolve();
    }

    return new Promise(function(resolve, reject) {
        commLogger.info('Instantiate chaincode......');
        chaincodes.reduce(function(prev, chaincode){
            return prev.then(() => {
                return e2eUtils.instantiateChaincode(chaincode, policy, false).then(() => {
                    commLogger.info('Instantiated chaincode ' + chaincode.id + ' successfully ');
                    commLogger.info('Sleep 5s...');
                    return commUtils.sleep(5000);
                });
            });
        }, Promise.resolve())
            .then(() => {
                return resolve();
            })
            .catch((err) => {
                commLogger.error('Failed to instantiate chaincodes, ' + (err.stack?err.stack:err));
                return reject(new Error('Fabric: instantiate chaincodes failed'));
            });
    });
};
