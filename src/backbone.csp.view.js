import csp from './csp/csp';

let delegateEventSplitter = /^(\S+)\s*(.*)$/;

class View extends Backbone.View {

    constructor() {
        this._eventListeners = [];
        this._listenChannels = [];

        super();
    }

    listen(el, event) {
        let ch = csp.chan(),
            callback = e => csp.putAsync(ch, e);

        el = Array.isArray(el) ? el : [el];

        for (let i=0, len=el.length; i < len; i++) {
            el[i].addEventListener(event, callback);
            this._eventListeners.push({el: el[i], event: event, callback: callback});
        }

        this._listenChannels.push(ch);

        return ch;
    }

    // Set callbacks, where `this.events` is a Map of
    //
    // *[[callbackFunction, [event selectors]]]*
    //
    //     new Map([
    //         ['edit',      'mousedown .title'],
    //         [this.save,   'click .button'],
    //         [this.log,    ['mousedown .title', 'click .button']],
    //     ])
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly
    // and will be passed the event channels as arguments.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents(map) {
        if (!(map || (map = _.result(this, 'events')))) return this;
        if (!(map instanceof Map)) return super(...arguments);

        this.undelegateEvents();

        map.forEach(function (events, method) {
            let channels = [];

            method = typeof method === 'string' ? this[method].bind(this) : method.bind(this);
            events = Array.isArray(events) ? events : [events];

            for (let [index, event] of events.entries()) {
                let el = this.el,
                    match = event.match(delegateEventSplitter),
                    eventName = match[1],
                    selector = match[2];

                if (selector !== '') {
                    el = el.querySelectorAll(selector);
                }

                channels.push(this.listen(el, eventName));
            }

            method(...channels);
        }, this);

        return this;
    }

    undelegateEvents() {
        for (let i=0, len=this._eventListeners.length; i < len; i++) {
            let listener = this._eventListeners[i];
            listener.el.removeEventListener(listener.event, listener.callback);
        }
        this._eventListeners = [];

        for (let i=0, len=this._listenChannels.length; i < len; i++) {
            this._listenChannels[i].close();
        }
        this._listenChannels = [];

        return super();
    }

}

export default View;
