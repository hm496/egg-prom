'use strict';

const PrometheusServer = require('./lib/server');

class AppBootHook {
  constructor (agent) {
    this.agent = agent;
    this.agent.messenger.on('prometheus:Config', () => {
      this.agent.messenger.sendToApp('prometheus:Config', this.agent.config.prometheus);
    });
  }

  async willReady () {
    this.server = new PrometheusServer(this.agent);
    await this.server.ready();
  }

  async beforeClose () {
    await this.server.close();
  }
}

module.exports = AppBootHook;
