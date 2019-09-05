'use strict';

const PrometheusServer = require('./lib/server');

class AppBootHook {
  constructor (agent) {
    this.agent = agent;
    this.agent.messenger.on('egg_prometheus_config_action_to_agent', () => {
      this.agent.messenger.sendToApp('egg_prometheus_config_action_to_app', this.agent.config.prometheus);
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
