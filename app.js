'use strict';

const PrometheusWorker = require('./lib/worker');
const rpcClientMetrics = require('./lib/metrics/rpc_client');
const rpcServerMetrics = require('./lib/metrics/rpc_server');
const httpServerMetrics = require('./lib/metrics/http_server');

class AppBootHook {
  constructor (app) {
    this.app = app;
    rpcClientMetrics(app);
    rpcServerMetrics(app);
    httpServerMetrics(app);

    this.app.messenger.once('egg_prometheus_config_action_to_app', (config) => {
      this.app.config.prometheus = Object.assign({}, this.app.config.prometheus, config);
      this.worker = new PrometheusWorker(this.app);
      this.worker.ready();
    });

    this.app.messenger.once('egg-ready', () => {
      this.app.messenger.sendToAgent('egg_prometheus_config_action_to_agent');
    });
  }

  async beforeClose () {
    this.worker && await this.worker.close();
  }
}

module.exports = AppBootHook;
