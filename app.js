'use strict';

const PrometheusWorker = require('./lib/worker');
const rpcClientMetrics = require('./lib/metrics/rpc_client');
const rpcServerMetrics = require('./lib/metrics/rpc_server');
const httpServerMetrics = require('./lib/metrics/http_server');

class AppBootHook {
  constructor (app) {
    this.app = app;
    if (app.config.prometheus.enableDefaultMetrics === true) {
      rpcClientMetrics(app);
      rpcServerMetrics(app);
      httpServerMetrics(app);
    }

    this.app.messenger.once('prometheus:Config', (config) => {
      this.app.config.prometheus = Object.assign({}, this.app.config.prometheus, config);
      this.worker = new PrometheusWorker(this.app);
      this.worker.ready();
    });

    this.app.messenger.once('egg-ready', () => {
      this.app.messenger.sendToAgent('prometheus:Config');
    });
  }

  async beforeClose () {
    this.worker && await this.worker.close();
  }
}

module.exports = AppBootHook;
