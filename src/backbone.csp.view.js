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

    delegateEvents(events) {
        if (!(events || (events = _.result(this, 'events')))) return this;
        this.undelegateEvents();

        for (let key in events) {
            let listeners = _.isArray(events[key]) ? events[key] : [events[key]],
                method = _.bind(this[key], this),
                channels = [];

            for (let [index, listener] of listeners.entries()) {
                let $el = this.$el,
                    match = listener.match(delegateEventSplitter),
                    eventName = match[1],
                    selector = match[2];

                eventName += '.delegateEvents' + this.cid;

                if (selector !== '') {
                    $el = $el.find(selector);
                }

                channels.push(this.listen($el, eventName, selector));
            }

            method(...channels);
        }

        return this;
    }

    undelegateEvents() {
        // close channel
        
        super();
    }

}

export default View;
