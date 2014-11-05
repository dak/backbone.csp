import csp from './csp/csp';

let delegateEventSplitter = /^(\S+)\s*(.*)$/;

class View extends Backbone.View {

    constructor() {
        super();
    }

    listen($el, event, selector) {
        var ch = csp.chan();

        $el.on(event, selector, (e) => csp.putAsync(ch, e));

        return ch;
    }

    // Set callbacks, where `this.events` is a Map of
    //
    // *[[callbackFunction, [event selectors]]]*
    //
    //     new Map([
    //       ['edit',      'mousedown .title'],
    //       [this.save,   'click .button'],
    //       [this.log,    ['mousedown .title', 'click .button']],
    //     ])
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly
    // and will be passed the event channels as arguments.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents(map) {
        if (!(map || (map = _.result(this, 'events')))) return this;
        this.undelegateEvents();

        map.forEach(function (events, method) {
            let channels = [];

            method = _.isString(method) ? _.bind(this[method], this) : _.bind(method, this);
            events = _.isArray(events) ? events : [events];

            for (let [index, event] of events.entries()) {
                let $el = this.$el,
                    match = event.match(delegateEventSplitter),
                    eventName = match[1],
                    selector = match[2];

                eventName += '.delegateEvents' + this.cid;

                if (selector !== '') {
                    $el = $el.find(selector);
                }

                channels.push(this.listen($el, eventName, selector));
            }

            method(...channels);
        }, this);

        return this;
    }

    undelegateEvents() {
        // close channel

        super();
    }

}

export default View;
