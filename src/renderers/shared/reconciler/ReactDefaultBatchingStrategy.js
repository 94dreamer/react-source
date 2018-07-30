/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultBatchingStrategy
 */

'use strict';

var ReactUpdates = require('ReactUpdates');
var Transaction = require('Transaction');

var emptyFunction = require('emptyFunction'); // 输出一个空函数

var RESET_BATCHED_UPDATES = {   // 事务的钩子在这里
  initialize: emptyFunction,
  close: function() {
    // isBatchingUpdates设置为false，标识着结束批量更新策略
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  },
};

var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  // 执行更新
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates), 
};

var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

function ReactDefaultBatchingStrategyTransaction() {
  this.reinitializeTransaction();   // 初始化事务
}

Object.assign(
  ReactDefaultBatchingStrategyTransaction.prototype,
  Transaction.Mixin,
  {
    getTransactionWrappers: function() {
      return TRANSACTION_WRAPPERS;
    },
  }
);

var transaction = new ReactDefaultBatchingStrategyTransaction();

var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,   
  // 谁在维护它？batchedUpdates  
  //batchedUpdates 被谁调用  ReactMount.js ReactEventListener.js

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function(callback, a, b, c, d, e) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;
    // 调用一次就编程批量更新了

    // The code is written this way to avoid extra allocations
    // 第一次进来是false,调用事务
    if (alreadyBatchingUpdates) {
      callback(a, b, c, d, e);
    } else {
      // ？？？
      transaction.perform(callback, null, a, b, c, d, e); 
      //进入事务 执行 事件回调 或者 生命周期函数
      //它的前后钩子在哪
    }
  },
};

module.exports = ReactDefaultBatchingStrategy;
