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

    let lastScrapePort, lastAggregatorPort;
    this.app.messenger.on('prometheus:Config', (config) => {
      this.app.config.prometheus = Object.assign({}, this.app.config.prometheus, config);
      const configProm = this.app.config.prometheus;
      if (configProm.scrapePort === lastScrapePort && configProm.aggregatorPort === lastAggregatorPort) {
        return;
      }
      this.worker && this.worker.close();
      this.worker = new PrometheusWorker(this.app);
      lastScrapePort = configProm.scrapePort;
      lastAggregatorPort = configProm.aggregatorPort;
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
