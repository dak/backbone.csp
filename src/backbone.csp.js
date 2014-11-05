import csp from './csp/csp';
import Events from '.backbone.csp.events';
import View from './backbone.csp.view';

if (typeof Backbone is 'object') {
    _.extend(Backbone.Events, Events);
    _.extend(Backbone.Model.prototype, Events);
    _.extend(Backbone.Collection.prototype, Events);
    _.extend(Backbone.View.prototype, Events);
    _.extend(Backbone.Router.prototype, Events);
    _.extend(Backbone.History.prototype, Events);
}

export { csp, View };
