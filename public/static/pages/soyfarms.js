
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35739/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const context = {
      subscribe: null,
      addNotification: null,
      removeNotification: null,
      clearNotifications: null,
    };

    const getNotificationsContext = () => getContext(context);

    /* node_modules\svelte-notifications\src\components\Notification.svelte generated by Svelte v3.44.2 */

    function create_fragment$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*item*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: {
    				notification: /*notification*/ ctx[1],
    				withoutStyles: /*withoutStyles*/ ctx[2],
    				onRemove: /*removeNotificationHandler*/ ctx[3]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*notification*/ 2) switch_instance_changes.notification = /*notification*/ ctx[1];
    			if (dirty & /*withoutStyles*/ 4) switch_instance_changes.withoutStyles = /*withoutStyles*/ ctx[2];

    			if (switch_value !== (switch_value = /*item*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Notification', slots, []);
    	let { item } = $$props;
    	let { notification = {} } = $$props;
    	let { withoutStyles = false } = $$props;
    	const { removeNotification } = getNotificationsContext();
    	const { id, removeAfter } = notification;
    	const removeNotificationHandler = () => removeNotification(id);
    	let timeout = null;

    	if (removeAfter) {
    		timeout = setTimeout(removeNotificationHandler, removeAfter);
    	}

    	onDestroy(() => {
    		if (removeAfter && timeout) clearTimeout(timeout);
    	});

    	const writable_props = ['item', 'notification', 'withoutStyles'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Notification> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('notification' in $$props) $$invalidate(1, notification = $$props.notification);
    		if ('withoutStyles' in $$props) $$invalidate(2, withoutStyles = $$props.withoutStyles);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		getNotificationsContext,
    		item,
    		notification,
    		withoutStyles,
    		removeNotification,
    		id,
    		removeAfter,
    		removeNotificationHandler,
    		timeout
    	});

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('notification' in $$props) $$invalidate(1, notification = $$props.notification);
    		if ('withoutStyles' in $$props) $$invalidate(2, withoutStyles = $$props.withoutStyles);
    		if ('timeout' in $$props) timeout = $$props.timeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [item, notification, withoutStyles, removeNotificationHandler];
    }

    class Notification extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			item: 0,
    			notification: 1,
    			withoutStyles: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notification",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !('item' in props)) {
    			console.warn("<Notification> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notification() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notification(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withoutStyles() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withoutStyles(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules\svelte-notifications\src\components\DefaultNotification.svelte generated by Svelte v3.44.2 */
    const file$3 = "node_modules\\svelte-notifications\\src\\components\\DefaultNotification.svelte";

    // (103:10) {text}
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*text*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(103:10) {text}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let button;
    	let t1;
    	let div1_intro;
    	let div1_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t0 = space();
    			button = element("button");
    			t1 = text("×");
    			attr_dev(div0, "class", "" + (null_to_empty(/*getClass*/ ctx[2]('content')) + " svelte-2oyqkv"));
    			add_location(div0, file$3, 101, 2, 2236);
    			attr_dev(button, "class", "" + (null_to_empty(/*getClass*/ ctx[2]('button')) + " svelte-2oyqkv"));
    			attr_dev(button, "aria-label", "delete notification");
    			add_location(button, file$3, 104, 2, 2305);
    			attr_dev(div1, "class", "" + (null_to_empty(/*getClass*/ ctx[2]()) + " svelte-2oyqkv"));
    			attr_dev(div1, "role", "status");
    			attr_dev(div1, "aria-live", "polite");
    			add_location(div1, file$3, 94, 0, 2148);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div0, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, button);
    			append_dev(button, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*onRemove*/ ctx[0])) /*onRemove*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				div1_intro = create_in_transition(div1, fade, {});
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (detaching && div1_outro) div1_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DefaultNotification', slots, ['default']);
    	let { notification = {} } = $$props;
    	let { withoutStyles = false } = $$props;
    	let { onRemove = null } = $$props;
    	const { text, type } = notification;

    	const getClass = suffix => {
    		const defaultSuffix = suffix ? `-${suffix}` : '';
    		const defaultNotificationClass = ` default-notification-style${defaultSuffix}`;
    		const defaultNotificationType = type && !suffix ? ` default-notification-${type}` : '';
    		return `notification${defaultSuffix}${withoutStyles ? '' : defaultNotificationClass}${defaultNotificationType}`;
    	};

    	const writable_props = ['notification', 'withoutStyles', 'onRemove'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DefaultNotification> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('notification' in $$props) $$invalidate(3, notification = $$props.notification);
    		if ('withoutStyles' in $$props) $$invalidate(4, withoutStyles = $$props.withoutStyles);
    		if ('onRemove' in $$props) $$invalidate(0, onRemove = $$props.onRemove);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		notification,
    		withoutStyles,
    		onRemove,
    		text,
    		type,
    		getClass
    	});

    	$$self.$inject_state = $$props => {
    		if ('notification' in $$props) $$invalidate(3, notification = $$props.notification);
    		if ('withoutStyles' in $$props) $$invalidate(4, withoutStyles = $$props.withoutStyles);
    		if ('onRemove' in $$props) $$invalidate(0, onRemove = $$props.onRemove);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onRemove, text, getClass, notification, withoutStyles, $$scope, slots];
    }

    class DefaultNotification extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			notification: 3,
    			withoutStyles: 4,
    			onRemove: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DefaultNotification",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get notification() {
    		throw new Error("<DefaultNotification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notification(value) {
    		throw new Error("<DefaultNotification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withoutStyles() {
    		throw new Error("<DefaultNotification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withoutStyles(value) {
    		throw new Error("<DefaultNotification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onRemove() {
    		throw new Error("<DefaultNotification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onRemove(value) {
    		throw new Error("<DefaultNotification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const positions = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ];

    const addNotification = (notification, store) => {
      if (!notification) return;

      const { update } = store;
      const safeNotification = {
        id: `${new Date().getTime()}-${Math.floor(Math.random() * 9999)}`,
        position: 'bottom-center',
        text: '',
        ...notification,
      };

      if (!safeNotification.text || typeof safeNotification.text !== 'string') return;
      if (!positions.includes(notification.position)) return;

      update((notifications) => {
        if (safeNotification.position.includes('top-')) {
          return [safeNotification, ...notifications];
        }

        return [...notifications, safeNotification];
      });
    };

    const removeNotification = (notificationId, { update }) => {
      if (!notificationId) return;

      update((notifications) => notifications.filter(({ id }) => id !== notificationId));
    };

    const clearNotifications = (store) => store.set([]);

    const createStore = () => {
      const store = writable([]);

      return {
        subscribe: store.subscribe,
        addNotification: (notification) => addNotification(notification, store),
        removeNotification: (notificationId) => removeNotification(notificationId, store),
        clearNotifications: () => clearNotifications(store),
      };
    };

    var store = createStore();

    /* node_modules\svelte-notifications\src\components\Notifications.svelte generated by Svelte v3.44.2 */
    const file$2 = "node_modules\\svelte-notifications\\src\\components\\Notifications.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (71:8) {#if notification.position === position}
    function create_if_block$2(ctx) {
    	let notification;
    	let current;

    	notification = new Notification({
    			props: {
    				notification: /*notification*/ ctx[9],
    				withoutStyles: /*withoutStyles*/ ctx[1],
    				item: /*item*/ ctx[0] || DefaultNotification
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(notification.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notification, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notification_changes = {};
    			if (dirty & /*$store*/ 4) notification_changes.notification = /*notification*/ ctx[9];
    			if (dirty & /*withoutStyles*/ 2) notification_changes.withoutStyles = /*withoutStyles*/ ctx[1];
    			if (dirty & /*item*/ 1) notification_changes.item = /*item*/ ctx[0] || DefaultNotification;
    			notification.$set(notification_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notification.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notification.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notification, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(71:8) {#if notification.position === position}",
    		ctx
    	});

    	return block;
    }

    // (70:6) {#each $store as notification (notification.id)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*notification*/ ctx[9].position === /*position*/ ctx[6] && create_if_block$2(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*notification*/ ctx[9].position === /*position*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$store*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(70:6) {#each $store as notification (notification.id)}",
    		ctx
    	});

    	return block;
    }

    // (68:2) {#each positions as position}
    function create_each_block$1(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let current;
    	let each_value_1 = /*$store*/ ctx[2];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*notification*/ ctx[9].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "" + (null_to_empty(/*getClass*/ ctx[3](/*position*/ ctx[6])) + " svelte-t0tmtn"));
    			add_location(div, file$2, 68, 4, 1451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$store, withoutStyles, item, DefaultNotification, positions*/ 7) {
    				each_value_1 = /*$store*/ ctx[2];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1, t, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(68:2) {#each positions as position}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let each_value = positions;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "notifications");
    			add_location(div, file$2, 66, 0, 1387);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*getClass, positions, $store, withoutStyles, item, DefaultNotification*/ 15) {
    				each_value = positions;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $store;
    	validate_store(store, 'store');
    	component_subscribe($$self, store, $$value => $$invalidate(2, $store = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Notifications', slots, ['default']);
    	let { item = null } = $$props;
    	let { withoutStyles = false } = $$props;

    	const getClass = (position = '') => {
    		const defaultPositionClass = ` default-position-style-${position}`;
    		return `position-${position}${withoutStyles ? '' : defaultPositionClass}`;
    	};

    	setContext(context, store);
    	const writable_props = ['item', 'withoutStyles'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Notifications> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('withoutStyles' in $$props) $$invalidate(1, withoutStyles = $$props.withoutStyles);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		Notification,
    		DefaultNotification,
    		context,
    		store,
    		positions,
    		item,
    		withoutStyles,
    		getClass,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('withoutStyles' in $$props) $$invalidate(1, withoutStyles = $$props.withoutStyles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [item, withoutStyles, $store, getClass, $$scope, slots];
    }

    class Notifications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { item: 0, withoutStyles: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notifications",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get item() {
    		throw new Error("<Notifications>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Notifications>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withoutStyles() {
    		throw new Error("<Notifications>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withoutStyles(value) {
    		throw new Error("<Notifications>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\soyfarms.svelte generated by Svelte v3.44.2 */

    const { console: console_1$1 } = globals;
    const file$1 = "src\\pages\\soyfarms.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[24] = list;
    	child_ctx[25] = i;
    	return child_ctx;
    }

    // (278:0) {:else}
    function create_else_block$1(ctx) {
    	let table;
    	let each_value = /*farms*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "w-full bg-white shadow-1 mt-1 border");
    			add_location(table, file$1, 278, 4, 12000);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*farms, format, withdrawRewards, withdraw, withdrawAmount, maxWithdraw, deposit, depositAmount, maxDeposit, approve, unlimited, ethers, approveout, approvein*/ 4094) {
    				each_value = /*farms*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(278:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (274:0) {#if !connected}
    function create_if_block$1(ctx) {
    	let div;
    	let t0;
    	let br;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Connect wallet first or change to a supported blockchain,");
    			br = element("br");
    			t1 = text("the website uses wallet connection to connect to the blockchain");
    			add_location(br, file$1, 275, 65, 11906);
    			set_style(div, "background", "#eee");
    			set_style(div, "padding", "1rem");
    			set_style(div, "border", "1px solid #aaa");
    			set_style(div, "border-radius", ".5rem");
    			add_location(div, file$1, 274, 4, 11755);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(274:0) {#if !connected}",
    		ctx
    	});

    	return block;
    }

    // (281:8) {#if !t.disabled}
    function create_if_block_1$1(ctx) {
    	let tr7;
    	let td13;
    	let input0;
    	let input0_id_value;
    	let t0;
    	let table2;
    	let label;
    	let tr0;
    	let td0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t1;
    	let td1;
    	let span0;
    	let t3;
    	let t4_value = /*t*/ ctx[23].token.toUpperCase() + "";
    	let t4;
    	let t5;
    	let span1;
    	let t7;
    	let t8;
    	let br0;
    	let t9;
    	let span2;
    	let t10_value = /*t*/ ctx[23].platform + "";
    	let t10;
    	let t11;
    	let t12;
    	let td2;
    	let t13_value = format(/*t*/ ctx[23].soy_balance) + "";
    	let t13;
    	let br1;
    	let t14;
    	let t15;
    	let label_for_value;
    	let t16;
    	let tr6;
    	let td12;
    	let div6;
    	let table1;
    	let tr1;
    	let td3;
    	let div0;
    	let t17;
    	let span3;
    	let t18_value = /*t*/ ctx[23].token + "";
    	let t18;
    	let t19;
    	let input1;
    	let input1_placeholder_value;
    	let t20;
    	let button0;
    	let t21;
    	let button0_farm_value;
    	let t22;
    	let button1;
    	let t23;
    	let button1_farm_value;
    	let t24;
    	let td4;
    	let div1;
    	let t25;
    	let t26_value = /*t*/ ctx[23].token + "";
    	let t26;
    	let t27;
    	let t28;
    	let input2;
    	let input2_placeholder_value;
    	let t29;
    	let button2;
    	let t30;
    	let button2_farm_value;
    	let t31;
    	let button3;
    	let t32;
    	let button3_farm_value;
    	let t33;
    	let tr2;
    	let td5;
    	let show_if_1 = !/*t*/ ctx[23].usdc_allowance.gt("1");
    	let t34;
    	let div2;
    	let t35;
    	let span4;
    	let t36_value = /*t*/ ctx[23].token + "";
    	let t36;
    	let t37;
    	let t38_value = format(/*t*/ ctx[23].usdc_balance) + "";
    	let t38;
    	let t39;
    	let span5;
    	let t41;
    	let br2;
    	let t42;
    	let input3;
    	let i = /*i*/ ctx[25];
    	let t43;
    	let button4;
    	let t44;
    	let button4_farm_value;
    	let t45;
    	let br3;
    	let t46;
    	let t47;
    	let td6;
    	let show_if = !/*t*/ ctx[23].soy_allowance.gt("1");
    	let t48;
    	let div3;
    	let t49;
    	let t50_value = /*t*/ ctx[23].token + "";
    	let t50;
    	let t51;
    	let t52;
    	let t53_value = format(/*t*/ ctx[23].soy_balance) + "";
    	let t53;
    	let t54;
    	let span6;
    	let t56;
    	let br4;
    	let t57;
    	let input4;
    	let t58;
    	let button5;
    	let t59;
    	let button5_farm_value;
    	let t60;
    	let br5;
    	let t61;
    	let t62;
    	let tr4;
    	let td10;
    	let div4;
    	let t63;
    	let table0;
    	let tr3;
    	let td7;
    	let t64;
    	let t65_value = /*t*/ ctx[23].rewards + "";
    	let t65;
    	let t66;
    	let td8;
    	let t67;
    	let t68_value = /*t*/ ctx[23].epochIndex + "";
    	let t68;
    	let t69;
    	let td9;
    	let t70;
    	let t71_value = /*t*/ ctx[23].timeDifference + "";
    	let t71;
    	let t72;
    	let t73;
    	let div5;
    	let t74_value = format(/*t*/ ctx[23].rewardBalance) + "";
    	let t74;
    	let t75;
    	let t76;
    	let tr5;
    	let td11;
    	let t77;
    	let a;
    	let t78_value = /*t*/ ctx[23].address + "";
    	let t78;
    	let a_href_value;
    	let t79;
    	let table2_class_value;
    	let t80;
    	let mounted;
    	let dispose;
    	let if_block0 = /*t*/ ctx[23].disabled && create_if_block_8$1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*t*/ ctx[23].interest == 0) return create_if_block_6$1;
    		if (/*t*/ ctx[23].interest < 0.1) return create_if_block_7$1;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*t*/ ctx[23].token == "scream" || /*t*/ ctx[23].token == "credit") return create_if_block_5$1;
    		return create_else_block_2$1;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_1(ctx);
    	let if_block3 = show_if_1 && create_if_block_4$1(ctx);
    	const assign_input3 = () => /*input3_binding*/ ctx[17](input3, i);
    	const unassign_input3 = () => /*input3_binding*/ ctx[17](null, i);
    	let if_block4 = show_if && create_if_block_3$1(ctx);
    	const assign_input4 = () => /*input4_binding*/ ctx[18](input4, i);
    	const unassign_input4 = () => /*input4_binding*/ ctx[18](null, i);

    	function select_block_type_3(ctx, dirty) {
    		if (/*t*/ ctx[23].rewards == 0) return create_if_block_2$1;
    		return create_else_block_1$1;
    	}

    	let current_block_type_2 = select_block_type_3(ctx);
    	let if_block5 = current_block_type_2(ctx);

    	const block = {
    		c: function create() {
    			tr7 = element("tr");
    			td13 = element("td");
    			input0 = element("input");
    			t0 = space();
    			table2 = element("table");
    			label = element("label");
    			tr0 = element("tr");
    			td0 = element("td");
    			img = element("img");
    			t1 = space();
    			td1 = element("td");
    			span0 = element("span");
    			span0.textContent = "Deposit";
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			span1 = element("span");
    			span1.textContent = "earn";
    			t7 = text(" WJK\r\n                                ");
    			if (if_block0) if_block0.c();
    			t8 = space();
    			br0 = element("br");
    			t9 = space();
    			span2 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			if_block1.c();
    			t12 = space();
    			td2 = element("td");
    			t13 = text(t13_value);
    			br1 = element("br");
    			t14 = text("Deposited");
    			t15 = space();
    			if_block2.c();
    			t16 = space();
    			tr6 = element("tr");
    			td12 = element("td");
    			div6 = element("div");
    			table1 = element("table");
    			tr1 = element("tr");
    			td3 = element("td");
    			div0 = element("div");
    			t17 = text("Approve ");
    			span3 = element("span");
    			t18 = text(t18_value);
    			t19 = space();
    			input1 = element("input");
    			t20 = space();
    			button0 = element("button");
    			t21 = text("Approve");
    			t22 = space();
    			button1 = element("button");
    			t23 = text("Approve Unlimited");
    			t24 = space();
    			td4 = element("td");
    			div1 = element("div");
    			t25 = text("Approve ");
    			t26 = text(t26_value);
    			t27 = text("SOY");
    			t28 = space();
    			input2 = element("input");
    			t29 = space();
    			button2 = element("button");
    			t30 = text("Approve");
    			t31 = space();
    			button3 = element("button");
    			t32 = text("Approve Unlimited");
    			t33 = space();
    			tr2 = element("tr");
    			td5 = element("td");
    			if (if_block3) if_block3.c();
    			t34 = space();
    			div2 = element("div");
    			t35 = text("Deposit ");
    			span4 = element("span");
    			t36 = text(t36_value);
    			t37 = text("\r\n                                            Balance: ");
    			t38 = text(t38_value);
    			t39 = text(" (");
    			span5 = element("span");
    			span5.textContent = "MAX";
    			t41 = text(")");
    			br2 = element("br");
    			t42 = space();
    			input3 = element("input");
    			t43 = space();
    			button4 = element("button");
    			t44 = text("Deposit");
    			t45 = space();
    			br3 = element("br");
    			t46 = text("Warning: Everytime you deposit or withdraw, the epoch resets.");
    			t47 = space();
    			td6 = element("td");
    			if (if_block4) if_block4.c();
    			t48 = space();
    			div3 = element("div");
    			t49 = text("Withdraw ");
    			t50 = text(t50_value);
    			t51 = text("SOY");
    			t52 = text("\r\n                                            Balance: ");
    			t53 = text(t53_value);
    			t54 = text(" (");
    			span6 = element("span");
    			span6.textContent = "MAX";
    			t56 = text(")");
    			br4 = element("br");
    			t57 = space();
    			input4 = element("input");
    			t58 = space();
    			button5 = element("button");
    			t59 = text("Withdraw");
    			t60 = space();
    			br5 = element("br");
    			t61 = text("Warning: Everytime you deposit or withdraw, the epoch resets.");
    			t62 = space();
    			tr4 = element("tr");
    			td10 = element("td");
    			div4 = element("div");
    			if_block5.c();
    			t63 = space();
    			table0 = element("table");
    			tr3 = element("tr");
    			td7 = element("td");
    			t64 = text("Rewards: ");
    			t65 = text(t65_value);
    			t66 = space();
    			td8 = element("td");
    			t67 = text("Epoch index: ");
    			t68 = text(t68_value);
    			t69 = space();
    			td9 = element("td");
    			t70 = text("Your epoch: ");
    			t71 = text(t71_value);
    			t72 = text("/7");
    			t73 = space();
    			div5 = element("div");
    			t74 = text(t74_value);
    			t75 = text(" WJK");
    			t76 = space();
    			tr5 = element("tr");
    			td11 = element("td");
    			t77 = text("Contract: ");
    			a = element("a");
    			t78 = text(t78_value);
    			t79 = text(" (source)");
    			t80 = space();
    			attr_dev(input0, "class", "toggle-reveal");
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "id", input0_id_value = "" + (/*t*/ ctx[23].ib.toLowerCase() + "_cb"));
    			set_style(input0, "display", "none");
    			add_location(input0, file$1, 283, 16, 12175);
    			attr_dev(img, "class", "icon");
    			if (!src_url_equal(img.src, img_src_value = /*t*/ ctx[23].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*t*/ ctx[23].name);
    			add_location(img, file$1, 287, 56, 12514);
    			attr_dev(td0, "class", "px-1 w-1 center");
    			add_location(td0, file$1, 287, 28, 12486);
    			attr_dev(span0, "class", "darken");
    			add_location(span0, file$1, 289, 32, 12660);
    			attr_dev(span1, "class", "darken");
    			add_location(span1, file$1, 289, 92, 12720);
    			add_location(br0, file$1, 293, 32, 12953);
    			attr_dev(span2, "class", "darken smaller");
    			add_location(span2, file$1, 294, 32, 12991);
    			attr_dev(td1, "class", "w-full py-0_5");
    			add_location(td1, file$1, 288, 28, 12600);
    			add_location(br1, file$1, 307, 79, 13752);
    			attr_dev(td2, "class", "px-0_5 w-5 left");
    			add_location(td2, file$1, 307, 28, 13701);
    			add_location(tr0, file$1, 286, 24, 12452);
    			attr_dev(label, "for", label_for_value = "" + (/*t*/ ctx[23].ib.toLowerCase() + "_cb"));
    			add_location(label, file$1, 285, 20, 12389);
    			attr_dev(span3, "class", "uppercase");
    			add_location(span3, file$1, 322, 75, 14657);
    			attr_dev(div0, "class", "bold mt-1");
    			add_location(div0, file$1, 322, 44, 14626);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "w-full my-0_5");

    			attr_dev(input1, "placeholder", input1_placeholder_value = "Allowance: " + (/*t*/ ctx[23].usdc_allowance.gt(unlimited)
    			? "Unlimited"
    			: ethers.utils.commify(ethers.utils.formatUnits(/*t*/ ctx[23].usdc_allowance, /*t*/ ctx[23].decimals))));

    			add_location(input1, file$1, 323, 44, 14749);
    			attr_dev(button0, "farm", button0_farm_value = /*t*/ ctx[23].name);
    			attr_dev(button0, "direction", "in");
    			attr_dev(button0, "type", "amount");
    			add_location(button0, file$1, 324, 44, 15011);
    			attr_dev(button1, "farm", button1_farm_value = /*t*/ ctx[23].name);
    			attr_dev(button1, "direction", "in");
    			attr_dev(button1, "type", "all");
    			add_location(button1, file$1, 325, 44, 15147);
    			attr_dev(td3, "class", "p-1");
    			add_location(td3, file$1, 321, 40, 14564);
    			attr_dev(div1, "class", "bold mt-1");
    			add_location(div1, file$1, 328, 44, 15395);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "w-full my-0_5");

    			attr_dev(input2, "placeholder", input2_placeholder_value = "Allowance: " + (/*t*/ ctx[23].soy_allowance.gt(unlimited)
    			? "Unlimited"
    			: ethers.utils.commify(ethers.utils.formatUnits(/*t*/ ctx[23].soy_allowance, /*t*/ ctx[23].decimals))));

    			add_location(input2, file$1, 329, 44, 15490);
    			attr_dev(button2, "farm", button2_farm_value = /*t*/ ctx[23].name);
    			attr_dev(button2, "direction", "out");
    			attr_dev(button2, "type", "amount");
    			add_location(button2, file$1, 330, 44, 15751);
    			attr_dev(button3, "farm", button3_farm_value = /*t*/ ctx[23].name);
    			attr_dev(button3, "direction", "out");
    			attr_dev(button3, "type", "all");
    			add_location(button3, file$1, 331, 44, 15888);
    			attr_dev(td4, "class", "p-1");
    			add_location(td4, file$1, 327, 40, 15333);
    			add_location(tr1, file$1, 320, 36, 14518);
    			attr_dev(span4, "class", "uppercase");
    			add_location(span4, file$1, 339, 75, 16507);
    			attr_dev(div2, "class", "bold mt-1");
    			add_location(div2, file$1, 339, 44, 16476);
    			attr_dev(span5, "class", "cblue hover:underline pointer");
    			attr_dev(span5, "id", /*i*/ ctx[25]);
    			add_location(span5, file$1, 340, 79, 16634);
    			add_location(br2, file$1, 340, 167, 16722);
    			attr_dev(input3, "class", "w-full my-0_5");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "Amount");
    			add_location(input3, file$1, 341, 44, 16772);
    			attr_dev(button4, "farm", button4_farm_value = /*t*/ ctx[23].name);
    			attr_dev(button4, "id", /*i*/ ctx[25]);
    			add_location(button4, file$1, 342, 44, 16911);
    			add_location(br3, file$1, 343, 44, 17027);
    			attr_dev(td5, "class", "relative p-1");
    			add_location(td5, file$1, 335, 40, 16160);
    			attr_dev(div3, "class", "bold mt-1");
    			add_location(div3, file$1, 349, 44, 17496);
    			attr_dev(span6, "class", "cblue hover:underline pointer");
    			attr_dev(span6, "id", /*i*/ ctx[25]);
    			add_location(span6, file$1, 350, 78, 17626);
    			add_location(br4, file$1, 350, 167, 17715);
    			attr_dev(input4, "class", "w-full my-0_5");
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "placeholder", "Amount");
    			add_location(input4, file$1, 351, 44, 17765);
    			attr_dev(button5, "farm", button5_farm_value = /*t*/ ctx[23].name);
    			attr_dev(button5, "id", /*i*/ ctx[25]);
    			add_location(button5, file$1, 352, 44, 17905);
    			add_location(br5, file$1, 353, 44, 18023);
    			attr_dev(td6, "class", "relative p-1");
    			add_location(td6, file$1, 345, 40, 17181);
    			add_location(tr2, file$1, 334, 36, 16114);
    			add_location(div4, file$1, 358, 44, 18339);
    			attr_dev(td7, "class", "px-1 py-0_5");
    			add_location(td7, file$1, 367, 52, 19016);
    			attr_dev(td8, "class", "px-1 py-0_5");
    			add_location(td8, file$1, 368, 52, 19119);
    			attr_dev(td9, "class", "px-1 py-0_5");
    			add_location(td9, file$1, 369, 52, 19229);
    			add_location(tr3, file$1, 366, 48, 18958);
    			attr_dev(table0, "class", "my-1 shadow border-1 rounded mx-auto");
    			add_location(table0, file$1, 365, 44, 18856);
    			attr_dev(div5, "class", "center");
    			add_location(div5, file$1, 372, 44, 19445);
    			attr_dev(td10, "class", "center");
    			attr_dev(td10, "colspan", "2");
    			add_location(td10, file$1, 357, 40, 18262);
    			add_location(tr4, file$1, 356, 36, 18216);
    			attr_dev(a, "href", a_href_value = "https://goerli.etherscan.io/address/" + /*t*/ ctx[23].address);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 379, 54, 19857);
    			attr_dev(td11, "class", "center");
    			attr_dev(td11, "colspan", "2");
    			add_location(td11, file$1, 378, 40, 19770);
    			add_location(tr5, file$1, 377, 36, 19724);
    			attr_dev(table1, "class", "w-full border-0");
    			add_location(table1, file$1, 319, 32, 14449);
    			add_location(div6, file$1, 318, 28, 14410);
    			attr_dev(td12, "colspan", "99");
    			add_location(td12, file$1, 317, 24, 14363);
    			attr_dev(tr6, "class", "window-reveal");
    			add_location(tr6, file$1, 316, 20, 14311);
    			attr_dev(table2, "class", table2_class_value = "" + (/*t*/ ctx[23].token.toLowerCase() + "-farm w-full border-solid border-1 pgray"));
    			add_location(table2, file$1, 284, 16, 12288);
    			attr_dev(td13, "class", "w-full");
    			add_location(td13, file$1, 282, 12, 12138);
    			add_location(tr7, file$1, 281, 8, 12120);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr7, anchor);
    			append_dev(tr7, td13);
    			append_dev(td13, input0);
    			append_dev(td13, t0);
    			append_dev(td13, table2);
    			append_dev(table2, label);
    			append_dev(label, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, img);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(td1, span0);
    			append_dev(td1, t3);
    			append_dev(td1, t4);
    			append_dev(td1, t5);
    			append_dev(td1, span1);
    			append_dev(td1, t7);
    			if (if_block0) if_block0.m(td1, null);
    			append_dev(td1, t8);
    			append_dev(td1, br0);
    			append_dev(td1, t9);
    			append_dev(td1, span2);
    			append_dev(span2, t10);
    			append_dev(tr0, t11);
    			if_block1.m(tr0, null);
    			append_dev(tr0, t12);
    			append_dev(tr0, td2);
    			append_dev(td2, t13);
    			append_dev(td2, br1);
    			append_dev(td2, t14);
    			append_dev(tr0, t15);
    			if_block2.m(tr0, null);
    			append_dev(table2, t16);
    			append_dev(table2, tr6);
    			append_dev(tr6, td12);
    			append_dev(td12, div6);
    			append_dev(div6, table1);
    			append_dev(table1, tr1);
    			append_dev(tr1, td3);
    			append_dev(td3, div0);
    			append_dev(div0, t17);
    			append_dev(div0, span3);
    			append_dev(span3, t18);
    			append_dev(td3, t19);
    			append_dev(td3, input1);
    			/*input1_binding*/ ctx[15](input1);
    			append_dev(td3, t20);
    			append_dev(td3, button0);
    			append_dev(button0, t21);
    			append_dev(td3, t22);
    			append_dev(td3, button1);
    			append_dev(button1, t23);
    			append_dev(tr1, t24);
    			append_dev(tr1, td4);
    			append_dev(td4, div1);
    			append_dev(div1, t25);
    			append_dev(div1, t26);
    			append_dev(div1, t27);
    			append_dev(td4, t28);
    			append_dev(td4, input2);
    			/*input2_binding*/ ctx[16](input2);
    			append_dev(td4, t29);
    			append_dev(td4, button2);
    			append_dev(button2, t30);
    			append_dev(td4, t31);
    			append_dev(td4, button3);
    			append_dev(button3, t32);
    			append_dev(table1, t33);
    			append_dev(table1, tr2);
    			append_dev(tr2, td5);
    			if (if_block3) if_block3.m(td5, null);
    			append_dev(td5, t34);
    			append_dev(td5, div2);
    			append_dev(div2, t35);
    			append_dev(div2, span4);
    			append_dev(span4, t36);
    			append_dev(td5, t37);
    			append_dev(td5, t38);
    			append_dev(td5, t39);
    			append_dev(td5, span5);
    			append_dev(td5, t41);
    			append_dev(td5, br2);
    			append_dev(td5, t42);
    			append_dev(td5, input3);
    			assign_input3();
    			append_dev(td5, t43);
    			append_dev(td5, button4);
    			append_dev(button4, t44);
    			append_dev(td5, t45);
    			append_dev(td5, br3);
    			append_dev(td5, t46);
    			append_dev(tr2, t47);
    			append_dev(tr2, td6);
    			if (if_block4) if_block4.m(td6, null);
    			append_dev(td6, t48);
    			append_dev(td6, div3);
    			append_dev(div3, t49);
    			append_dev(div3, t50);
    			append_dev(div3, t51);
    			append_dev(td6, t52);
    			append_dev(td6, t53);
    			append_dev(td6, t54);
    			append_dev(td6, span6);
    			append_dev(td6, t56);
    			append_dev(td6, br4);
    			append_dev(td6, t57);
    			append_dev(td6, input4);
    			assign_input4();
    			append_dev(td6, t58);
    			append_dev(td6, button5);
    			append_dev(button5, t59);
    			append_dev(td6, t60);
    			append_dev(td6, br5);
    			append_dev(td6, t61);
    			append_dev(table1, t62);
    			append_dev(table1, tr4);
    			append_dev(tr4, td10);
    			append_dev(td10, div4);
    			if_block5.m(div4, null);
    			append_dev(td10, t63);
    			append_dev(td10, table0);
    			append_dev(table0, tr3);
    			append_dev(tr3, td7);
    			append_dev(td7, t64);
    			append_dev(td7, t65);
    			append_dev(tr3, t66);
    			append_dev(tr3, td8);
    			append_dev(td8, t67);
    			append_dev(td8, t68);
    			append_dev(tr3, t69);
    			append_dev(tr3, td9);
    			append_dev(td9, t70);
    			append_dev(td9, t71);
    			append_dev(td9, t72);
    			append_dev(td10, t73);
    			append_dev(td10, div5);
    			append_dev(div5, t74);
    			append_dev(div5, t75);
    			append_dev(table1, t76);
    			append_dev(table1, tr5);
    			append_dev(tr5, td11);
    			append_dev(td11, t77);
    			append_dev(td11, a);
    			append_dev(a, t78);
    			append_dev(td11, t79);
    			append_dev(tr7, t80);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*approve*/ ctx[10], false, false, false),
    					listen_dev(button1, "click", /*approve*/ ctx[10], false, false, false),
    					listen_dev(button2, "click", /*approve*/ ctx[10], false, false, false),
    					listen_dev(button3, "click", /*approve*/ ctx[10], false, false, false),
    					listen_dev(span5, "click", /*maxDeposit*/ ctx[7], false, false, false),
    					listen_dev(button4, "click", /*deposit*/ ctx[6], false, false, false),
    					listen_dev(span6, "click", /*maxWithdraw*/ ctx[9], false, false, false),
    					listen_dev(button5, "click", /*withdraw*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*farms*/ 2 && input0_id_value !== (input0_id_value = "" + (/*t*/ ctx[23].ib.toLowerCase() + "_cb"))) {
    				attr_dev(input0, "id", input0_id_value);
    			}

    			if (dirty & /*farms*/ 2 && !src_url_equal(img.src, img_src_value = /*t*/ ctx[23].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*farms*/ 2 && img_alt_value !== (img_alt_value = /*t*/ ctx[23].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*farms*/ 2 && t4_value !== (t4_value = /*t*/ ctx[23].token.toUpperCase() + "")) set_data_dev(t4, t4_value);

    			if (/*t*/ ctx[23].disabled) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_8$1(ctx);
    					if_block0.c();
    					if_block0.m(td1, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*farms*/ 2 && t10_value !== (t10_value = /*t*/ ctx[23].platform + "")) set_data_dev(t10, t10_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(tr0, t12);
    				}
    			}

    			if (dirty & /*farms*/ 2 && t13_value !== (t13_value = format(/*t*/ ctx[23].soy_balance) + "")) set_data_dev(t13, t13_value);

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(tr0, null);
    				}
    			}

    			if (dirty & /*farms*/ 2 && label_for_value !== (label_for_value = "" + (/*t*/ ctx[23].ib.toLowerCase() + "_cb"))) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty & /*farms*/ 2 && t18_value !== (t18_value = /*t*/ ctx[23].token + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*farms*/ 2 && input1_placeholder_value !== (input1_placeholder_value = "Allowance: " + (/*t*/ ctx[23].usdc_allowance.gt(unlimited)
    			? "Unlimited"
    			: ethers.utils.commify(ethers.utils.formatUnits(/*t*/ ctx[23].usdc_allowance, /*t*/ ctx[23].decimals))))) {
    				attr_dev(input1, "placeholder", input1_placeholder_value);
    			}

    			if (dirty & /*farms*/ 2 && button0_farm_value !== (button0_farm_value = /*t*/ ctx[23].name)) {
    				attr_dev(button0, "farm", button0_farm_value);
    			}

    			if (dirty & /*farms*/ 2 && button1_farm_value !== (button1_farm_value = /*t*/ ctx[23].name)) {
    				attr_dev(button1, "farm", button1_farm_value);
    			}

    			if (dirty & /*farms*/ 2 && t26_value !== (t26_value = /*t*/ ctx[23].token + "")) set_data_dev(t26, t26_value);

    			if (dirty & /*farms*/ 2 && input2_placeholder_value !== (input2_placeholder_value = "Allowance: " + (/*t*/ ctx[23].soy_allowance.gt(unlimited)
    			? "Unlimited"
    			: ethers.utils.commify(ethers.utils.formatUnits(/*t*/ ctx[23].soy_allowance, /*t*/ ctx[23].decimals))))) {
    				attr_dev(input2, "placeholder", input2_placeholder_value);
    			}

    			if (dirty & /*farms*/ 2 && button2_farm_value !== (button2_farm_value = /*t*/ ctx[23].name)) {
    				attr_dev(button2, "farm", button2_farm_value);
    			}

    			if (dirty & /*farms*/ 2 && button3_farm_value !== (button3_farm_value = /*t*/ ctx[23].name)) {
    				attr_dev(button3, "farm", button3_farm_value);
    			}

    			if (dirty & /*farms*/ 2) show_if_1 = !/*t*/ ctx[23].usdc_allowance.gt("1");

    			if (show_if_1) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_4$1(ctx);
    					if_block3.c();
    					if_block3.m(td5, t34);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*farms*/ 2 && t36_value !== (t36_value = /*t*/ ctx[23].token + "")) set_data_dev(t36, t36_value);
    			if (dirty & /*farms*/ 2 && t38_value !== (t38_value = format(/*t*/ ctx[23].usdc_balance) + "")) set_data_dev(t38, t38_value);

    			if (i !== /*i*/ ctx[25]) {
    				unassign_input3();
    				i = /*i*/ ctx[25];
    				assign_input3();
    			}

    			if (dirty & /*farms*/ 2 && button4_farm_value !== (button4_farm_value = /*t*/ ctx[23].name)) {
    				attr_dev(button4, "farm", button4_farm_value);
    			}

    			if (dirty & /*farms*/ 2) show_if = !/*t*/ ctx[23].soy_allowance.gt("1");

    			if (show_if) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_3$1(ctx);
    					if_block4.c();
    					if_block4.m(td6, t48);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty & /*farms*/ 2 && t50_value !== (t50_value = /*t*/ ctx[23].token + "")) set_data_dev(t50, t50_value);
    			if (dirty & /*farms*/ 2 && t53_value !== (t53_value = format(/*t*/ ctx[23].soy_balance) + "")) set_data_dev(t53, t53_value);

    			if (i !== /*i*/ ctx[25]) {
    				unassign_input4();
    				i = /*i*/ ctx[25];
    				assign_input4();
    			}

    			if (dirty & /*farms*/ 2 && button5_farm_value !== (button5_farm_value = /*t*/ ctx[23].name)) {
    				attr_dev(button5, "farm", button5_farm_value);
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_3(ctx)) && if_block5) {
    				if_block5.p(ctx, dirty);
    			} else {
    				if_block5.d(1);
    				if_block5 = current_block_type_2(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(div4, null);
    				}
    			}

    			if (dirty & /*farms*/ 2 && t65_value !== (t65_value = /*t*/ ctx[23].rewards + "")) set_data_dev(t65, t65_value);
    			if (dirty & /*farms*/ 2 && t68_value !== (t68_value = /*t*/ ctx[23].epochIndex + "")) set_data_dev(t68, t68_value);
    			if (dirty & /*farms*/ 2 && t71_value !== (t71_value = /*t*/ ctx[23].timeDifference + "")) set_data_dev(t71, t71_value);
    			if (dirty & /*farms*/ 2 && t74_value !== (t74_value = format(/*t*/ ctx[23].rewardBalance) + "")) set_data_dev(t74, t74_value);
    			if (dirty & /*farms*/ 2 && t78_value !== (t78_value = /*t*/ ctx[23].address + "")) set_data_dev(t78, t78_value);

    			if (dirty & /*farms*/ 2 && a_href_value !== (a_href_value = "https://goerli.etherscan.io/address/" + /*t*/ ctx[23].address)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*farms*/ 2 && table2_class_value !== (table2_class_value = "" + (/*t*/ ctx[23].token.toLowerCase() + "-farm w-full border-solid border-1 pgray"))) {
    				attr_dev(table2, "class", table2_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr7);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			/*input1_binding*/ ctx[15](null);
    			/*input2_binding*/ ctx[16](null);
    			if (if_block3) if_block3.d();
    			unassign_input3();
    			if (if_block4) if_block4.d();
    			unassign_input4();
    			if_block5.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(281:8) {#if !t.disabled}",
    		ctx
    	});

    	return block;
    }

    // (291:32) {#if t.disabled}
    function create_if_block_8$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "deprecated";
    			attr_dev(span, "class", "disabled");
    			add_location(span, file$1, 291, 32, 12840);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(291:32) {#if t.disabled}",
    		ctx
    	});

    	return block;
    }

    // (303:32) {:else}
    function create_else_block_3(ctx) {
    	let td;
    	let t0_value = /*t*/ ctx[23].interest.toFixed(2) + "";
    	let t0;
    	let t1;
    	let t2_value = (/*t*/ ctx[23].wjkInterest * 100).toFixed(2) + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t0 = text(t0_value);
    			t1 = text("% > ");
    			t2 = text(t2_value);
    			t3 = text("%");
    			attr_dev(td, "class", "px-0_5 w-8 left");
    			add_location(td, file$1, 303, 32, 13500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t0);
    			append_dev(td, t1);
    			append_dev(td, t2);
    			append_dev(td, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*farms*/ 2 && t0_value !== (t0_value = /*t*/ ctx[23].interest.toFixed(2) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*farms*/ 2 && t2_value !== (t2_value = (/*t*/ ctx[23].wjkInterest * 100).toFixed(2) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(303:32) {:else}",
    		ctx
    	});

    	return block;
    }

    // (301:32) {#if t.interest < 0.1}
    function create_if_block_7$1(ctx) {
    	let td;
    	let t0_value = /*t*/ ctx[23].interest.toFixed(3) + "";
    	let t0;
    	let t1;
    	let t2_value = (/*t*/ ctx[23].wjkInterest * 100).toFixed(3) + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t0 = text(t0_value);
    			t1 = text("% > ");
    			t2 = text(t2_value);
    			t3 = text("%");
    			attr_dev(td, "class", "px-0_5 w-8 left");
    			add_location(td, file$1, 301, 32, 13330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t0);
    			append_dev(td, t1);
    			append_dev(td, t2);
    			append_dev(td, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*farms*/ 2 && t0_value !== (t0_value = /*t*/ ctx[23].interest.toFixed(3) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*farms*/ 2 && t2_value !== (t2_value = (/*t*/ ctx[23].wjkInterest * 100).toFixed(3) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(301:32) {#if t.interest < 0.1}",
    		ctx
    	});

    	return block;
    }

    // (298:28) {#if t.interest == 0}
    function create_if_block_6$1(ctx) {
    	let td;

    	const block = {
    		c: function create() {
    			td = element("td");
    			td.textContent = "X+52.356%";
    			attr_dev(td, "class", "px-0_5 w-8 left");
    			add_location(td, file$1, 298, 32, 13161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(298:28) {#if t.interest == 0}",
    		ctx
    	});

    	return block;
    }

    // (312:28) {:else}
    function create_else_block_2$1(ctx) {
    	let td;
    	let t0_value = format(/*t*/ ctx[23].ctoken_balance) + "";
    	let t0;
    	let br;
    	let span;
    	let t1_value = /*t*/ ctx[23].token + "";
    	let t1;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t0 = text(t0_value);
    			br = element("br");
    			span = element("span");
    			t1 = text(t1_value);
    			add_location(br, file$1, 312, 87, 14144);
    			attr_dev(span, "class", "uppercase");
    			add_location(span, file$1, 312, 91, 14148);
    			attr_dev(td, "class", "px-0_5 w-5 right");
    			add_location(td, file$1, 312, 32, 14089);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t0);
    			append_dev(td, br);
    			append_dev(td, span);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*farms*/ 2 && t0_value !== (t0_value = format(/*t*/ ctx[23].ctoken_balance) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*farms*/ 2 && t1_value !== (t1_value = /*t*/ ctx[23].token + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(312:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (310:28) {#if t.token == "scream" || t.token == "credit"}
    function create_if_block_5$1(ctx) {
    	let td;
    	let t0_value = format(/*t*/ ctx[23].ctoken_balance * /*t*/ ctx[23].index) + "";
    	let t0;
    	let br;
    	let span;
    	let t1_value = /*t*/ ctx[23].token + "";
    	let t1;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t0 = text(t0_value);
    			br = element("br");
    			span = element("span");
    			t1 = text(t1_value);
    			add_location(br, file$1, 310, 93, 13945);
    			attr_dev(span, "class", "uppercase");
    			add_location(span, file$1, 310, 97, 13949);
    			attr_dev(td, "class", "px-0_5 w-5 right");
    			add_location(td, file$1, 310, 28, 13880);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t0);
    			append_dev(td, br);
    			append_dev(td, span);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*farms*/ 2 && t0_value !== (t0_value = format(/*t*/ ctx[23].ctoken_balance * /*t*/ ctx[23].index) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*farms*/ 2 && t1_value !== (t1_value = /*t*/ ctx[23].token + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(310:28) {#if t.token == \\\"scream\\\" || t.token == \\\"credit\\\"}",
    		ctx
    	});

    	return block;
    }

    // (337:44) {#if !t.usdc_allowance.gt("1")}
    function create_if_block_4$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "absolute l-0 t-0 w-full h-full half-transparent");
    			add_location(div, file$1, 337, 48, 16312);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(337:44) {#if !t.usdc_allowance.gt(\\\"1\\\")}",
    		ctx
    	});

    	return block;
    }

    // (347:44) {#if !t.soy_allowance.gt("1")}
    function create_if_block_3$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "absolute l-0 t-0 w-full h-full half-transparent");
    			add_location(div, file$1, 347, 48, 17332);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(347:44) {#if !t.soy_allowance.gt(\\\"1\\\")}",
    		ctx
    	});

    	return block;
    }

    // (362:48) {:else}
    function create_else_block_1$1(ctx) {
    	let button;
    	let t;
    	let button_farm_value;
    	let br;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Withdraw Rewards");
    			br = element("br");
    			attr_dev(button, "farm", button_farm_value = /*t*/ ctx[23].name);
    			add_location(button, file$1, 362, 52, 18621);
    			add_location(br, file$1, 362, 130, 18699);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*withdrawRewards*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*farms*/ 2 && button_farm_value !== (button_farm_value = /*t*/ ctx[23].name)) {
    				attr_dev(button, "farm", button_farm_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(362:48) {:else}",
    		ctx
    	});

    	return block;
    }

    // (360:48) {#if t.rewards == 0}
    function create_if_block_2$1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Withdraw Rewards";
    			button.disabled = true;
    			add_location(button, file$1, 360, 52, 18468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(360:48) {#if t.rewards == 0}",
    		ctx
    	});

    	return block;
    }

    // (280:8) {#each farms as t, i}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = !/*t*/ ctx[23].disabled && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*t*/ ctx[23].disabled) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(280:8) {#each farms as t, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h1;
    	let t1;
    	let br0;
    	let t2;
    	let br1;
    	let t3;
    	let br2;
    	let t4;
    	let br3;
    	let t5;
    	let ul;
    	let li0;
    	let t7;
    	let li1;
    	let t9;
    	let br4;
    	let t10;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (!/*connected*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Soy farms (4, 4)";
    			t1 = text("\r\nMake about ~52.356% more from your crypto!");
    			br0 = element("br");
    			t2 = text("\r\nIn order to participate you must lock your tokens for 7 days, in order to \r\nkeep fairness and the math correct you will not receive rewards from your \r\nfirst round, thus its recommended to enter right before the next epoch begins.");
    			br1 = element("br");
    			t3 = text("\r\nYour first round rewards will be distributed among the farmers that are already in.");
    			br2 = element("br");
    			t4 = space();
    			br3 = element("br");
    			t5 = text("\r\nTax is as below\r\n");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "5% on profits made in each epoch";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "1% to devs to pay for gas, system expenses and etc.";
    			t9 = space();
    			br4 = element("br");
    			t10 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			add_location(h1, file$1, 260, 0, 11178);
    			add_location(br0, file$1, 261, 42, 11247);
    			add_location(br1, file$1, 264, 78, 11483);
    			add_location(br2, file$1, 265, 83, 11572);
    			add_location(br3, file$1, 266, 0, 11578);
    			add_location(li0, file$1, 269, 4, 11611);
    			add_location(li1, file$1, 270, 4, 11658);
    			add_location(ul, file$1, 268, 0, 11601);
    			add_location(br4, file$1, 272, 0, 11727);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t10, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t10);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const unlimited = "0xffffffffffffffffffffffffffffffffffffffffffffffffff";

    // console.log("Multiplier=")
    // console.log((getMultiplier(35) * 100).toFixed(2) + "%")
    function getMultiplier(percent) {
    	let interest = percent / 100;
    	let end_wojak = 0;
    	let wojakTotal = 0;
    	let earnPerDay = interest / 365;
    	earnPerDay -= earnPerDay * 0.1;

    	for (let x = 0; x < 365; x++) {
    		end_wojak += earnPerDay + wojakTotal * 0.005;
    		wojakTotal += earnPerDay;
    	}

    	return end_wojak;
    }

    function format(number) {
    	if (typeof number === "undefined" || isNaN(number)) return 0;
    	return ethers.utils.commify(parseFloat(number).toFixed(2));
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Soyfarms', slots, []);
    	const { addNotification } = getNotificationsContext();
    	let { account } = $$props;
    	let { token } = $$props;
    	let { signer } = $$props;
    	let { connected } = $$props;
    	let farms = [];
    	if (connected) getBasic();
    	window.dispatch = () => getBasic();

    	function getBasic() {
    		if (typeof token.contracts !== "undefined") {
    			let i = 0, collector = [], farmId = 0;
    			const mantissa = Math.pow(10, 18); // 1 * 10 ^ 18
    			const blocksPerDay = 60 / token.chain.blockTime * 60 * 24;
    			new ethers.Contract(token.contracts.token.address, token.contracts.token.abi, signer);
    			const zoomer = new ethers.Contract(token.contracts.zoomer.address, token.contracts.zoomer.abi, signer);

    			for (let x in token.contracts) {
    				if (token.contracts[x].farm && !token.contracts[x].disabled) {
    					const ib = new ethers.Contract(token.contracts[x].ib,
    					[
    							"function supplyRatePerBlock() public view returns (uint256)",
    							"function exchangeRateCurrent() public view returns (uint256)",
    							"function balanceOf(address) public view returns (uint256)",
    							"function symbol() public view returns (string memory)",
    							"function totalSupply() public view returns (uint256)",
    							"function underlyingBalanceForAccount(address) public view returns (uint)",
    							"function balanceOfUnderlying(address) public view returns (uint)",
    							"function BOOBalance(address) public view returns (uint)",
    							"function decimals() public view returns (uint)"
    						],
    					signer);

    					const usdc = new ethers.Contract(token.contracts[x].usdc, token.tokens.usdc.abi, signer);
    					const soy = new ethers.Contract(token.contracts[x].address, token.contracts[x].abi, signer);

    					if (token.contracts[x].token == "usdc") {
    						collector[i++] = ib.supplyRatePerBlock();
    					}

    					collector[i++] = usdc.decimals();
    					collector[i++] = ib.decimals();
    					collector[i++] = usdc.balanceOf(account.address);
    					collector[i++] = soy.balanceOf(account.address);
    					collector[i++] = soy.checkRewards(account.address);
    					collector[i++] = usdc.allowance(account.address, token.contracts[x].address);
    					collector[i++] = soy.allowance(account.address, token.contracts[x].address);
    					collector[i++] = soy.timeDifference(account.address);

    					if (token.contracts[x].token == "tarot") {
    						collector[i++] = ib.underlyingBalanceForAccount(token.contracts[x].address);
    					} else if (token.contracts[x].token == "usdc" || token.contracts[x].token == "bifi" || token.contracts[x].token == "crv") {
    						collector[i++] = ib.balanceOfUnderlying(token.contracts[x].address);
    					} else if (token.contracts[x].token == "boo") {
    						collector[i++] = ib.BOOBalance(token.contracts[x].address);
    					} else {
    						collector[i++] = ib.balanceOf(token.contracts[x].address);
    					}

    					collector[i++] = soy.epochIndex();
    					collector[i++] = ib.symbol();
    					collector[i++] = usdc.balanceOf(token.contracts[x].ib);
    					collector[i++] = ib.totalSupply();
    					collector[i++] = zoomer.balanceOf(token.contracts[x].address);
    				}
    			}

    			Promise.all(collector).then(async values => {
    				i = 0;

    				for (let x in token.contracts) {
    					if (token.contracts[x].farm && !token.contracts[x].disabled) {
    						if (token.contracts[x].token == "usdc") {
    							$$invalidate(12, token.contracts[x].interest = (Math.pow(values[i++] / mantissa * blocksPerDay + 1, 365 - 1) - 1) * 100, token);
    						} else {
    							$$invalidate(12, token.contracts[x].interest = 0, token);
    						}

    						$$invalidate(12, token.contracts[x].wjkInterest = getMultiplier(token.contracts[x].interest), token);
    						let idecimals = parseInt(values[i++]);
    						let ldecimals = parseInt(values[i++]);
    						$$invalidate(12, token.contracts[x].decimals = idecimals, token);
    						const usdcBalance = values[i++];
    						$$invalidate(12, token.contracts[x].usdc_balance = ethers.utils.formatUnits(usdcBalance, idecimals), token);
    						$$invalidate(12, token.contracts[x].soy_balance = ethers.utils.formatUnits(values[i++], idecimals), token);
    						$$invalidate(12, token.contracts[x].rewards = ethers.utils.formatEther(await zoomer.balanceOfUnderlying(values[i++])), token);
    						$$invalidate(12, token.contracts[x].usdc_allowance = values[i++], token);
    						$$invalidate(12, token.contracts[x].soy_allowance = values[i++], token);
    						$$invalidate(12, token.contracts[x].timeDifference = values[i++], token);
    						$$invalidate(12, token.contracts[x].ctoken_balance = ethers.utils.formatUnits(values[i++], idecimals), token);
    						$$invalidate(12, token.contracts[x].epochIndex = values[i++], token);
    						$$invalidate(12, token.contracts[x].symbol = values[i++], token);
    						const isupply = parseFloat(ethers.utils.formatUnits(values[i++], idecimals));
    						const xsupply = parseFloat(ethers.utils.formatUnits(values[i++], ldecimals));
    						$$invalidate(12, token.contracts[x].index = 0, token);
    						if (isupply > 0 && xsupply > 0) $$invalidate(12, token.contracts[x].index = isupply / xsupply, token);
    						$$invalidate(12, token.contracts[x].rewardBalance = ethers.utils.formatEther(await zoomer.balanceOfUnderlying(values[i++])), token);
    						$$invalidate(1, farms[farmId++] = token.contracts[x], farms);
    					}
    				}
    			});
    		}
    	}

    	let depositAmount = [];

    	async function deposit() {
    		if (!account.connected) return processError({ message: "Wallet is not connected" });
    		const farm = this.getAttribute("farm");
    		if (token.contracts[farm].usdc_allowance.eq("0")) return processError({ message: "You must approve first" });
    		const id = parseInt(this.id);
    		const decimals = token.tokens[token.contracts[farm].token].decimals;
    		const amount = depositAmount[id].value;

    		if (amount.length == 0) return processError(
    			{
    				message: "You must enter value to deposit"
    			});

    		const soy = new ethers.Contract(token.contracts[farm].address, token.contracts[farm].abi, signer);

    		try {
    			const tx = await soy.deposit(ethers.utils.parseUnits(amount, decimals));
    			notify("Transaction processing", "warning");
    			await tx.wait();
    			notify("Transaction successful", "success");
    		} catch(error) {
    			processError(error);
    		}
    	}

    	async function maxDeposit() {
    		const i = parseInt(this.id);
    		$$invalidate(2, depositAmount[i].value = farms[i].usdc_balance, depositAmount);
    	}

    	let withdrawAmount = [];

    	async function withdraw() {
    		if (!account.connected) return processError({ message: "Wallet is not connected" });
    		const farm = this.getAttribute("farm");
    		if (token.contracts[farm].soy_allowance.eq("0")) return processError({ message: "You must approve first" });
    		const id = parseInt(this.id);
    		const decimals = token.tokens[token.contracts[farm].token].decimals;
    		const amount = withdrawAmount[id].value;

    		if (amount.length == 0) return processError(
    			{
    				message: "You must enter value to withdraw"
    			});

    		const soy = new ethers.Contract(token.contracts[farm].address, token.contracts[farm].abi, signer);

    		try {
    			const tx = await soy.withdraw(ethers.utils.parseUnits(amount, decimals));
    			notify("Transaction processing", "warning");
    			await tx.wait();
    			notify("Transaction successful", "success");
    		} catch(error) {
    			processError(error);
    		}
    	}

    	async function maxWithdraw() {
    		const i = parseInt(this.id);
    		$$invalidate(3, withdrawAmount[i].value = farms[i].soy_balance, withdrawAmount);
    	}

    	let approvein, approveout;

    	async function approve() {
    		if (!account.connected) return processError({ message: "Wallet is not connected" });
    		const type = this.getAttribute("type");
    		const direction = this.getAttribute("direction");
    		const farm = this.getAttribute("farm");
    		const decimals = token.tokens[token.contracts[farm].token].decimals;
    		const usdc = new ethers.Contract(token.contracts[farm].usdc, token.tokens.usdc.abi, signer);
    		const soy = new ethers.Contract(token.contracts[farm].address, token.contracts[farm].abi, signer);

    		try {
    			let tx, amount;

    			if (type == "all") {
    				amount = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    			} else {
    				const amount = approveout.value;

    				if (amount.length == 0) return processError(
    					{
    						message: "You must enter value to approve"
    					},
    					true
    				);

    				amount = ethers.utils.parseUnits(amount, decimals);
    			}

    			tx = await (direction == "in" ? usdc : soy).approve(token.contracts[farm].address, amount);
    			notify("Transaction processing", "warning");
    			await tx.wait();
    			notify("Transaction successful", "success");
    		} catch(error) {
    			processError(error);
    		}
    	}

    	async function withdrawRewards() {
    		const farm = this.getAttribute("farm");

    		try {
    			const soy = new ethers.Contract(token.contracts[farm].address, token.contracts[farm].abi, signer);
    			const tx = await soy.withdrawRewards();
    			notify("Transaction processing", "warning");
    			await tx.wait();
    			notify("Transaction successful", "success");
    		} catch(error) {
    			
    		}
    	}

    	function notify(text, type) {
    		addNotification({
    			text,
    			position: "bottom-left",
    			type,
    			removeAfter: 4000
    		});
    	}

    	function processError(error) {
    		if (typeof error === "object") {
    			addNotification({
    				text: error.message,
    				position: "bottom-left",
    				type: "danger",
    				removeAfter: 4000
    			});
    		} else {
    			let json = JSON.parse(error.message.toString().split("error=")[1].split(", method=")[0]);

    			addNotification({
    				text: json.message,
    				position: "bottom-left",
    				type: "danger",
    				removeAfter: 4000
    			});
    		}

    		console.log(error.message);
    	}

    	const writable_props = ['account', 'token', 'signer', 'connected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Soyfarms> was created with unknown prop '${key}'`);
    	});

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			approvein = $$value;
    			$$invalidate(4, approvein);
    		});
    	}

    	function input2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			approveout = $$value;
    			$$invalidate(5, approveout);
    		});
    	}

    	function input3_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			depositAmount[i] = $$value;
    			$$invalidate(2, depositAmount);
    		});
    	}

    	function input4_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			withdrawAmount[i] = $$value;
    			$$invalidate(3, withdrawAmount);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('account' in $$props) $$invalidate(13, account = $$props.account);
    		if ('token' in $$props) $$invalidate(12, token = $$props.token);
    		if ('signer' in $$props) $$invalidate(14, signer = $$props.signer);
    		if ('connected' in $$props) $$invalidate(0, connected = $$props.connected);
    	};

    	$$self.$capture_state = () => ({
    		getNotificationsContext,
    		addNotification,
    		account,
    		token,
    		signer,
    		connected,
    		unlimited,
    		farms,
    		getBasic,
    		getMultiplier,
    		depositAmount,
    		deposit,
    		maxDeposit,
    		withdrawAmount,
    		withdraw,
    		maxWithdraw,
    		approvein,
    		approveout,
    		approve,
    		withdrawRewards,
    		notify,
    		processError,
    		format
    	});

    	$$self.$inject_state = $$props => {
    		if ('account' in $$props) $$invalidate(13, account = $$props.account);
    		if ('token' in $$props) $$invalidate(12, token = $$props.token);
    		if ('signer' in $$props) $$invalidate(14, signer = $$props.signer);
    		if ('connected' in $$props) $$invalidate(0, connected = $$props.connected);
    		if ('farms' in $$props) $$invalidate(1, farms = $$props.farms);
    		if ('depositAmount' in $$props) $$invalidate(2, depositAmount = $$props.depositAmount);
    		if ('withdrawAmount' in $$props) $$invalidate(3, withdrawAmount = $$props.withdrawAmount);
    		if ('approvein' in $$props) $$invalidate(4, approvein = $$props.approvein);
    		if ('approveout' in $$props) $$invalidate(5, approveout = $$props.approveout);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		connected,
    		farms,
    		depositAmount,
    		withdrawAmount,
    		approvein,
    		approveout,
    		deposit,
    		maxDeposit,
    		withdraw,
    		maxWithdraw,
    		approve,
    		withdrawRewards,
    		token,
    		account,
    		signer,
    		input1_binding,
    		input2_binding,
    		input3_binding,
    		input4_binding
    	];
    }

    class Soyfarms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			account: 13,
    			token: 12,
    			signer: 14,
    			connected: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Soyfarms",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*account*/ ctx[13] === undefined && !('account' in props)) {
    			console_1$1.warn("<Soyfarms> was created without expected prop 'account'");
    		}

    		if (/*token*/ ctx[12] === undefined && !('token' in props)) {
    			console_1$1.warn("<Soyfarms> was created without expected prop 'token'");
    		}

    		if (/*signer*/ ctx[14] === undefined && !('signer' in props)) {
    			console_1$1.warn("<Soyfarms> was created without expected prop 'signer'");
    		}

    		if (/*connected*/ ctx[0] === undefined && !('connected' in props)) {
    			console_1$1.warn("<Soyfarms> was created without expected prop 'connected'");
    		}
    	}

    	get account() {
    		throw new Error("<Soyfarms>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set account(value) {
    		throw new Error("<Soyfarms>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get token() {
    		throw new Error("<Soyfarms>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set token(value) {
    		throw new Error("<Soyfarms>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get signer() {
    		throw new Error("<Soyfarms>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set signer(value) {
    		throw new Error("<Soyfarms>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get connected() {
    		throw new Error("<Soyfarms>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connected(value) {
    		throw new Error("<Soyfarms>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var chain$1 = {
    	name: "GORRRLI Testnet",
    	currency: "öETH",
    	id: 5,
    	blockTime: 15,
    	defender: "0x47896621b22d7aa0c4176e7cf5d1a2fe1c9c5398",
    	owner: {
    		address: "0xB14Ba501390A89A9E8e6C4E2f8ef95e3124B2119"
    	}
    };
    var contracts$1 = {
    	token: {
    		cost: "0.06388024 Ether",
    		address: "0x63AeC7f4cC98c11Aa32175e0F95Db1DdfA5f372c",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address owner, address spender) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address spender, uint amount) public returns (bool)",
    			"function hasRole(bytes32, address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32, address) public",
    			"function revokeRole(bytes32, address) public",
    			"function mint(address, uint) public",
    			"function burn(uint) public",
    			"function triggerTax() public",
    			"function disable() public view returns (bool)",
    			"function totalBurnt() public view returns (uint)"
    		]
    	},
    	stake: {
    		cost: "0.07962926 Ether",
    		address: "0x56bdF63B23C0E03FCb4C7dfF8B7836Dce1d287BF",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address owner, address spender) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address spender, uint amount) public returns (bool)",
    			"function hasRole(bytes32, address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32, address) public",
    			"function revokeRole(bytes32, address) public",
    			"function disabled() public view returns (bool)",
    			"function wjk() public view returns (address)",
    			"function chad() public view returns (address)",
    			"function keeper() public view returns (address)",
    			"function index() public view returns (uint)",
    			"function stake(uint wjkAmount) public returns (uint)",
    			"function unstake(uint bAmount) public returns(uint)",
    			"function boomersForMe(uint) public view returns (uint)",
    			"function balanceOfUnderlying(uint) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressBonds(address) public",
    			"function setAddressKeeper(address) public",
    			"function triggerStaking() public"
    		]
    	},
    	bonds: {
    		cost: "0.08471068 Ether",
    		address: "0xE95d2e74778B6679C847031477EeE20303Be88Fe",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address owner, address spender) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address spender, uint amount) public returns (bool)",
    			"function hasRole(bytes32, address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32, address) public",
    			"function revokeRole(bytes32, address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function keeper() public view returns (address)",
    			"function usdcCollected() public view returns (uint)",
    			"function bondPrice() public view returns (uint)",
    			"function bonded() public view returns (uint)",
    			"function bond(uint wjkAmount) public returns (uint)",
    			"function claimBond() public returns (uint)",
    			"function timeleft(address _bonder) public view returns (uint)",
    			"function updatePrice() public",
    			"function setAddressToken(address newAddress) public",
    			"function setAddressKeeper(address newAddress) public",
    			"function setAddressStaking(address newAddress) public"
    		]
    	},
    	treasury: {
    		cost: "0.0481507 Ether",
    		address: "0xcE44a2BFeffA7437384Cd3F6D7Bf13E36C94e8f5",
    		abi: [
    			"function hasRole(bytes32, address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32, address) public",
    			"function revokeRole(bytes32, address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function tstrategy() public view returns (address)",
    			"function USDC() public view returns (address)",
    			"function stayHome() public view returns (address)",
    			"function usdcInTreasury() public view returns (uint)",
    			"function addToTreasury() public",
    			"function get() public",
    			"function put() public",
    			"function changeTreasuryContract(address) public",
    			"function fillBonds() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function setAddressTreasuryStrategy(address) public"
    		]
    	},
    	tstrategy: {
    		cost: "0.0580584 Ether",
    		address: "0x5FB70517D66D2Ce5dEe076d17c4A098E97B9D489",
    		abi: [
    			"function hasRole(bytes32, address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32, address) public",
    			"function revokeRole(bytes32, address) public",
    			"function USDC() public view returns (uint)",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function soy() public view returns (address)",
    			"function chad() public view returns (address)",
    			"function treasury() public view returns (address)",
    			"function deposit() public",
    			"function withdraw() public",
    			"function withdrawWojak() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function setAddressTreasury(address) public",
    			"function setAddressSoyFarm(address) public",
    			"function setAddressBonds(address) public"
    		]
    	},
    	keeper: {
    		cost: "0.05984082 Ether",
    		address: "0xDDe58C61c9c96D3c3c09E8b7569BCD349965136C",
    		abi: [
    			"function hasRole(bytes32, address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32, address) public",
    			"function revokeRole(bytes32, address) public",
    			"function lastKeep() public view returns (uint)",
    			"function totalUpkeeps() public view returns (uint)",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function chad() public view returns (address)",
    			"function treasury() public view returns (address)",
    			"function stakeLocker() public view returns (address)",
    			"function USDC() public view returns (address)",
    			"function SWAP_ROUTER() public view returns (address)",
    			"function checkUpkeep(bytes calldata checkData) public view returns(bool, bytes memory)",
    			"function performUpkeep(bytes calldata performData) external",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function setAddressBonds(address) public",
    			"function setAddressTreasury(address) public"
    		]
    	},
    	stakelocker: {
    		cost: "0.0 Ether",
    		address: "0x656268b4CE543d5A7CAa2aff029f828702136a56",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address owner, address spender) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address spender, uint amount) public returns (bool)",
    			"function hasRole(bytes32, address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32, address) public",
    			"function revokeRole(bytes32, address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function USDC() public view returns (address)",
    			"function SWAP_ROUTER() public view returns (address)",
    			"function lock() public view returns (bool)",
    			"function disabled() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function deposit(uint) public",
    			"function withdraw(uint) public",
    			"function withdrawRewards() public returns (uint)",
    			"function checkRewards(address) public view returns (uint)",
    			"function depositUSDC(uint) public",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function triggerLocker() public"
    		]
    	},
    	"cream-dai": {
    		name: "cream-dai",
    		token: "dai",
    		cost: " Ether",
    		address: "",
    		farm: true,
    		disabled: true,
    		ib: "0x822397d9a55d0fefd20F5c4bCaB33C5F65bd28Eb",
    		usdc: "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address owner, address spender) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address spender, uint amount) public returns (bool)",
    			"function hasRole(bytes32, address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32, address) public",
    			"function revokeRole(bytes32, address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function LTOKEN() public view returns (address)",
    			"function ITOKEN() public view returns (address)",
    			"function lock() public view returns (bool)",
    			"function disabled() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function deposit(uint usdcAmount) public",
    			"function withdraw(uint soyAmount) public",
    			"function withdrawRewards() public returns (uint)",
    			"function checkRewards(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address newAddress) public",
    			"function setAddressStaking(address newAddress) public",
    			"function disableFarm() public"
    		],
    		platform: "CREAM Finance",
    		image: "/static/images/dai.webp",
    		interest: -1,
    		wjkInterest: -1
    	},
    	"cream-usdc": {
    		name: "cream-usdc",
    		token: "usdc",
    		cost: "0.09468034 Ether",
    		address: "0x8550Ad57DdFe5db972A4CA1642183AAEeDeA582D",
    		farm: true,
    		disabled: false,
    		ib: "0xCEC4a43eBB02f9B80916F1c718338169d6d5C1F0",
    		usdc: "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address owner, address spender) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address spender, uint amount) public returns (bool)",
    			"function hasRole(bytes32, address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32, address) public",
    			"function revokeRole(bytes32, address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function LTOKEN() public view returns (address)",
    			"function ITOKEN() public view returns (address)",
    			"function lock() public view returns (bool)",
    			"function disabled() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function deposit(uint usdcAmount) public",
    			"function withdraw(uint soyAmount) public",
    			"function withdrawRewards() public returns (uint)",
    			"function checkRewards(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address newAddress) public",
    			"function setAddressStaking(address newAddress) public",
    			"function disableFarm() public"
    		],
    		platform: "CREAM Finance",
    		image: "/static/images/usdc.webp",
    		interest: -1,
    		wjkInterest: -1
    	}
    };
    var swap$1 = {
    	router: {
    		address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
    	},
    	factory: {
    		address: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    		abi: [
    			"function createPair(address token1, address token2) public returns (address)",
    			"function getPair(address token1, address token2) public view returns (address)"
    		]
    	},
    	pair: {
    		address: "0x2dc69f5522D3546A1fbF1874F592b0e61dC82C93",
    		abi: [
    			"function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
    		]
    	}
    };
    var tokens$1 = {
    	usdc: {
    		decimals: 6,
    		address: "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address owner, address spender) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address spender, uint amount) public returns (bool)",
    			"function decimals() public view returns (uint)"
    		]
    	},
    	dai: {
    		decimals: 6,
    		address: "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address owner, address spender) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address spender, uint amount) public returns (bool)",
    			"function decimals() public view returns (uint)"
    		]
    	}
    };
    var goerli = {
    	chain: chain$1,
    	contracts: contracts$1,
    	swap: swap$1,
    	tokens: tokens$1
    };

    var chain = {
    	name: "Localhost",
    	currency: "SEPTIM",
    	id: 1337,
    	blockTime: 1,
    	defender: "",
    	owner: {
    		address: "0xc1269f367e41e49B17D1a26e63B0c6c2cfD8586f"
    	}
    };
    var contracts = {
    	token: {
    		address: "0x745438Fe8eAd28Bd77a57e5ee46C00d5f9aA31f6",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function mint(address,uint) public",
    			"function burn(uint) public",
    			"function triggerTax() public",
    			"function disable() public view returns (bool)",
    			"function totalBurnt() public view returns (uint)"
    		]
    	},
    	stake: {
    		address: "0xe291F6A227936cB8B3c81501DAB93A76033F001F",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function disabled() public view returns (bool)",
    			"function wjk() public view returns (address)",
    			"function chad() public view returns (address)",
    			"function keeper() public view returns (address)",
    			"function index() public view returns (uint)",
    			"function stake(uint) public returns (uint)",
    			"function unstake(uint) public returns(uint)",
    			"function boomersForMe(uint) public view returns (uint)",
    			"function balanceOfUnderlying(uint) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressBonds(address) public",
    			"function setAddressKeeper(address) public",
    			"function triggerStaking() public"
    		]
    	},
    	zoomer: {
    		address: "0x84e749E2228AeF3AAC92Af33389CED9540263fcB",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function disabled() public view returns (bool)",
    			"function wjk() public view returns (address)",
    			"function chad() public view returns (address)",
    			"function keeper() public view returns (address)",
    			"function index() public view returns (uint)",
    			"function stake(uint) public returns (uint)",
    			"function unstake(uint) public returns(uint)",
    			"function boomersForMe(uint) public view returns (uint)",
    			"function balanceOfUnderlying(uint) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressBonds(address) public",
    			"function setAddressKeeper(address) public",
    			"function triggerStaking() public"
    		]
    	},
    	bonds: {
    		address: "0x9C4CA0671532dbF609815E174F1373b9B6764312",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function keeper() public view returns (address)",
    			"function usdcCollected() public view returns (uint)",
    			"function bondPrice() public view returns (uint)",
    			"function bonded() public view returns (uint)",
    			"function bond(uint) public returns (uint)",
    			"function claimBond() public returns (uint)",
    			"function timeleft(address) public view returns (uint)",
    			"function updatePrice() public",
    			"function setAddressToken(address) public",
    			"function setAddressKeeper(address) public",
    			"function setAddressStaking(address) public"
    		]
    	},
    	treasury: {
    		address: "0xdE0837f08914d1ecEFD7db2cf8047eB53Bc9Dedc",
    		abi: [
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function getRoleMember(bytes32,uint) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function wjk() public view returns (address)",
    			"function chad() public view returns (address)",
    			"function keeper() public view returns (address)",
    			"function statsSentToChad() public view returns (uint)",
    			"function statsBurntWJK() public view returns (uint)",
    			"function token(address) public view returns (address,uint,bool)",
    			"function addStrategy(address,address) public",
    			"function disableStrategy(address) public",
    			"function forceWithdraw(address) public",
    			"function enableStrategy(address) public",
    			"function changeStrategy(address,address) public",
    			"function deposit(address,uint) public",
    			"function fillBonds() public",
    			"function setAddressToken(address) public",
    			"function setAddressBonds(address) public",
    			"function setAddressKeeper(address) public",
    			"function enterMarket(address) public",
    			"function exitAndBalanceMarkets(address) public",
    			"function exitMarket(address) public"
    		]
    	},
    	keeper: {
    		address: "0x00031C3D45880d7be608930a403cd822447038e9",
    		abi: [
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function lastKeep() public view returns (uint)",
    			"function totalUpkeeps() public view returns (uint)",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function chad() public view returns (address)",
    			"function treasury() public view returns (address)",
    			"function stakeLocker() public view returns (address)",
    			"function USDC() public view returns (address)",
    			"function SWAP_ROUTER() public view returns (address)",
    			"function checkUpkeep(bytes calldata checkData) public view returns(bool,bytes memory)",
    			"function performUpkeep(bytes calldata performData) external",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function setAddressBonds(address) public",
    			"function setAddressTreasury(address) public",
    			"function forLiquidity() public view returns (uint)",
    			"function forTokens(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function lastDist() public view returns (uint)",
    			"function dists() public view returns (uint)"
    		]
    	},
    	manager: {
    		address: "0x7780538643e71AF6C71bBaF874f778aFd83E49f6",
    		abi: [
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function setAddressBonds(address) public",
    			"function setAddressKeeper(address) public",
    			"function setAddressLocker(address) public",
    			"function setAddressTreasury(address) public",
    			"function setAddressZoomer(address) public",
    			"function setAddressBooSoy(address) public",
    			"function setAddressCreditSoy(address) public",
    			"function setAddressScreamSoy(address) public",
    			"function setAddressTarotSoy(address) public",
    			"function setAddressUsdcSoy(address) public",
    			"function setAddressBifiSoy(address) public",
    			"function setAddressCrvSoy(address) public",
    			"function wojak() public view returns (address)",
    			"function stake() public view returns (address)",
    			"function bonds() public view returns (address)",
    			"function keeper() public view returns (address)",
    			"function locker() public view returns (address)",
    			"function treasury() public view returns (address)",
    			"function zoomer() public view returns (address)",
    			"function boosoy() public view returns (address)",
    			"function creditsoy() public view returns (address)",
    			"function screamsoy() public view returns (address)",
    			"function tarotsoy() public view returns (address)",
    			"function usdcsoy() public view returns (address)",
    			"function updateKeeperContracts() public",
    			"function updateContract() public"
    		]
    	},
    	stakelocker: {
    		address: "0x0455290d6aC4955889F27Ff74EdACe1573Be2962",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function getRoleMember(bytes32,uint) public view returns (address)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function statsBurntWJK() public view returns (uint)",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function USDC() public view returns (address)",
    			"function disabled() public view returns (bool)",
    			"function lock() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function token(address) public view returns (address, uint, uint, bool)",
    			"function addStrategy(address,address) public",
    			"function disableStrategy(address) public",
    			"function enableStrategy(address) public",
    			"function changeStrategy(address,address) public",
    			"function depositToBank(address,uint) public",
    			"function enter(uint) public returns (address[] memory tokens,uint[] memory amounts,uint8[] memory decimals)",
    			"function leave(uint) public returns (address[] memory tokens,uint[] memory amounts,uint8[] memory decimals)",
    			"function leaveAdmin(uint) public returns (address[] memory tokens,uint[] memory amounts,uint8[] memory decimals)",
    			"function withdrawRewards() public returns (address[] memory,uint[] memory,uint8[] memory)",
    			"function checkRewards(address _locker, address rewardToken) public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function triggerLocker() public"
    		]
    	},
    	boosoy: {
    		name: "boosoy",
    		token: "boo",
    		address: "0x8F04b4652F7e8b79F38cE8dE08eEf0FE745476c6",
    		farm: true,
    		disabled: false,
    		ib: "0xa48d959AE2E88f1dAA7D5F611E01908106dE7598",
    		usdc: "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function LTOKEN() public view returns (address)",
    			"function ITOKEN() public view returns (address)",
    			"function lock() public view returns (bool)",
    			"function disabled() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function booBalance() public view returns (uint)",
    			"function deposit(uint) public",
    			"function withdraw(uint) public",
    			"function withdrawAdmin(uint) public",
    			"function withdrawRewards() public returns (uint)",
    			"function checkRewards(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function disableFarm() public"
    		],
    		platform: "Spookyswap",
    		image: "/static/images/boo.webp",
    		interest: -1,
    		wjkInterest: -1
    	},
    	creditsoy: {
    		name: "creditsoy",
    		token: "credit",
    		address: "0x2a3EcF313a26a65B4d88dac36ef687A992CC87E9",
    		farm: true,
    		disabled: false,
    		ib: "0xd9e28749e80D867d5d14217416BFf0e668C10645",
    		usdc: "0x77128DFdD0ac859B33F44050c6fa272F34872B5E",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function LTOKEN() public view returns (address)",
    			"function ITOKEN() public view returns (address)",
    			"function lock() public view returns (bool)",
    			"function disabled() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function creditBalance() public view returns (uint)",
    			"function deposit(uint) public",
    			"function withdraw(uint) public",
    			"function withdrawAdmin(uint) public",
    			"function withdrawRewards() public returns (uint)",
    			"function checkRewards(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function disableFarm() public"
    		],
    		platform: "Creditum",
    		image: "/static/images/credit.webp",
    		interest: -1,
    		wjkInterest: -1
    	},
    	screamsoy: {
    		name: "screamsoy",
    		token: "scream",
    		address: "0x07D374f163be30377D226b40bfd989fF42615237",
    		farm: true,
    		disabled: false,
    		ib: "0xe3D17C7e840ec140a7A51ACA351a482231760824",
    		usdc: "0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function LTOKEN() public view returns (address)",
    			"function ITOKEN() public view returns (address)",
    			"function lock() public view returns (bool)",
    			"function disabled() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function screamBalance() public view returns (uint)",
    			"function deposit(uint) public",
    			"function withdraw(uint) public",
    			"function withdrawAdmin(uint) public",
    			"function withdrawRewards() public returns (uint)",
    			"function checkRewards(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function disableFarm() public"
    		],
    		platform: "Scream lending",
    		image: "/static/images/scream.webp",
    		interest: -1,
    		wjkInterest: -1
    	},
    	tarotsoy: {
    		name: "tarotsoy",
    		token: "tarot",
    		address: "0x06735E4287bb868CE97bC13f8b6EAA972E71B013",
    		farm: true,
    		disabled: false,
    		ib: "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4",
    		usdc: "0xC5e2B037D30a390e62180970B3aa4E91868764cD",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function LTOKEN() public view returns (address)",
    			"function ITOKEN() public view returns (address)",
    			"function lock() public view returns (bool)",
    			"function disabled() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function tarotBalance() public view returns (uint)",
    			"function deposit(uint) public",
    			"function withdraw(uint) public",
    			"function withdrawAdmin(uint) public",
    			"function withdrawRewards() public returns (uint)",
    			"function checkRewards(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function disableFarm() public"
    		],
    		platform: "Tarot leveraged yield farm",
    		image: "/static/images/tarot.webp",
    		interest: -1,
    		wjkInterest: -1
    	},
    	usdcsoy: {
    		name: "usdcsoy",
    		token: "usdc",
    		address: "0x7A643E8e3dF8545ba7ee8Bdb0629799E26a970fa",
    		farm: true,
    		disabled: false,
    		ib: "0xE45Ac34E528907d0A0239ab5Db507688070B20bf",
    		usdc: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function LTOKEN() public view returns (address)",
    			"function ITOKEN() public view returns (address)",
    			"function lock() public view returns (bool)",
    			"function disabled() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function usdcBalance() public view returns (uint)",
    			"function deposit(uint) public",
    			"function withdraw(uint) public",
    			"function withdrawAdmin(uint) public",
    			"function withdrawRewards() public returns (uint)",
    			"function checkRewards(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function disableFarm() public"
    		],
    		platform: "Scream lending",
    		image: "/static/images/usdc.webp",
    		interest: -1,
    		wjkInterest: -1
    	},
    	bifisoy: {
    		name: "bifisoy",
    		token: "bifi",
    		address: "0x55f84F0395180A83AC4C4a197F020433834187Bc",
    		farm: true,
    		disabled: false,
    		ib: "0x0467c22fB5aF07eBb14C851C75bFf4180674Ed64",
    		usdc: "0xd6070ae98b8069de6B494332d1A1a81B6179D960",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function LTOKEN() public view returns (address)",
    			"function ITOKEN() public view returns (address)",
    			"function lock() public view returns (bool)",
    			"function disabled() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function bifiBalance() public view returns (uint)",
    			"function deposit(uint) public",
    			"function withdraw(uint) public",
    			"function withdrawAdmin(uint) public",
    			"function withdrawRewards() public returns (uint)",
    			"function checkRewards(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function disableFarm() public"
    		],
    		platform: "Scream lending",
    		image: "/static/images/bifi.webp",
    		interest: -1,
    		wjkInterest: -1
    	},
    	crvsoy: {
    		name: "crvsoy",
    		token: "crv",
    		address: "0x90e4e4890D3ec2488Dc68C03D9295CB45b01377C",
    		farm: true,
    		disabled: false,
    		ib: "0x820BdA1786AFA19DA6B92d6AC603574962337326",
    		usdc: "0x1E4F97b9f9F913c46F1632781732927B9019C68b",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function hasRole(bytes32,address) public view returns (bool)",
    			"function getRoleMemberCount(bytes32) public view returns (uint)",
    			"function grantRole(bytes32,address) public",
    			"function revokeRole(bytes32,address) public",
    			"function wjk() public view returns (address)",
    			"function swjk() public view returns (address)",
    			"function LTOKEN() public view returns (address)",
    			"function ITOKEN() public view returns (address)",
    			"function lock() public view returns (bool)",
    			"function disabled() public view returns (bool)",
    			"function epochIndex() public view returns (uint)",
    			"function timeDifference(address) public view returns (uint)",
    			"function crvBalance() public view returns (uint)",
    			"function deposit(uint) public",
    			"function withdraw(uint) public",
    			"function withdrawAdmin(uint) public",
    			"function withdrawRewards() public returns (uint)",
    			"function checkRewards(address) public view returns (uint)",
    			"function distributeRewards() public",
    			"function setAddressToken(address) public",
    			"function setAddressStaking(address) public",
    			"function disableFarm() public"
    		],
    		platform: "Scream lending",
    		image: "/static/images/crv.webp",
    		interest: -1,
    		wjkInterest: -1
    	}
    };
    var swap = {
    	router: {
    		address: "0xF491e7B69E4244ad4002BC14e878a34207E38c29",
    		abi: [
    			"function swapExactETHForTokens(uint,address[] calldata,address,uint) public payable returns (uint[] memory)",
    			"function addLiquidity(address,address,uint,uint,uint,uint,address,uint) public returns (uint,uint,uint)"
    		]
    	},
    	factory: {
    		address: "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3",
    		abi: [
    			"function createPair(address,address) public returns (address)",
    			"function getPair(address,address) public view returns (address)"
    		]
    	},
    	pair: {
    		address: "0x5201f3BF23C03991a82fA4b691ABA589C20d49cf",
    		abi: [
    			"function getReserves() external view returns (uint112,uint112,uint32)"
    		]
    	},
    	usdcftmpair: {
    		address: "0x2b4c76d0dc16be1c31d4c1dc53bf9b45987fc75c",
    		abi: [
    			"function getReserves() external view returns (uint112,uint112,uint32)"
    		]
    	},
    	booftmpair: {
    		address: "0xec7178f4c41f346b2721907f5cf7628e388a7a58",
    		abi: [
    			"function getReserves() external view returns (uint112,uint112,uint32)"
    		]
    	},
    	creditftmpair: {
    		address: "0x06f3cb227781a836fefaea7e686bdc857e80eaa7",
    		abi: [
    			"function getReserves() external view returns (uint112,uint112,uint32)"
    		]
    	},
    	screamftmpair: {
    		address: "0x30872e4fc4edbfd7a352bfc2463eb4fae9c09086",
    		abi: [
    			"function getReserves() external view returns (uint112,uint112,uint32)"
    		]
    	},
    	tarotftmpair: {
    		address: "0x11d90ea9d16e1ee5879b299a819f6d618816d70f",
    		abi: [
    			"function getReserves() external view returns (uint112,uint112,uint32)"
    		]
    	},
    	crvftmpair: {
    		address: "0xb471ac6ef617e952b84c6a9ff5de65a9da96c93b",
    		abi: [
    			"function getReserves() external view returns (uint112,uint112,uint32)"
    		]
    	},
    	bififtmpair: {
    		address: "0x1656728af3a14e1319f030dc147fabf6f627059e",
    		abi: [
    			"function getReserves() external view returns (uint112,uint112,uint32)"
    		]
    	}
    };
    var tokens = {
    	wftm: {
    		decimals: 18,
    		address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function transfer(address,uint) public returns (bool)"
    		]
    	},
    	usdc: {
    		decimals: 6,
    		address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function transfer(address,uint) public returns (bool)"
    		]
    	},
    	scusdc: {
    		decimals: 8,
    		address: "0xE45Ac34E528907d0A0239ab5Db507688070B20bf",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function balanceOfUnderlying(address) public view returns (uint)"
    		]
    	},
    	bifi: {
    		decimals: 18,
    		address: "0xd6070ae98b8069de6B494332d1A1a81B6179D960",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function transfer(address,uint) public returns (bool)"
    		]
    	},
    	scbifi: {
    		decimals: 8,
    		address: "0x0467c22fB5aF07eBb14C851C75bFf4180674Ed64",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function balanceOfUnderlying(address) public view returns (uint)"
    		]
    	},
    	crv: {
    		decimals: 18,
    		address: "0x1E4F97b9f9F913c46F1632781732927B9019C68b",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function transfer(address,uint) public returns (bool)"
    		]
    	},
    	sccrv: {
    		decimals: 8,
    		address: "0x820BdA1786AFA19DA6B92d6AC603574962337326",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function balanceOfUnderlying(address) public view returns (uint)"
    		]
    	},
    	xboo: {
    		decimals: 18,
    		address: "0xa48d959AE2E88f1dAA7D5F611E01908106dE7598",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function BOOForxBOO(uint) public view returns (uint)",
    			"function BOOBalance(address) public view returns (uint)"
    		]
    	},
    	boo: {
    		decimals: 18,
    		address: "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function transfer(address,uint) public returns (bool)"
    		]
    	},
    	xcredit: {
    		decimals: 18,
    		address: "0xd9e28749e80D867d5d14217416BFf0e668C10645",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)"
    		]
    	},
    	credit: {
    		decimals: 18,
    		address: "0x77128DFdD0ac859B33F44050c6fa272F34872B5E",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function transfer(address,uint) public returns (bool)"
    		]
    	},
    	xscream: {
    		decimals: 18,
    		address: "0xe3D17C7e840ec140a7A51ACA351a482231760824",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)"
    		]
    	},
    	scream: {
    		decimals: 18,
    		address: "0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function transfer(address,uint) public returns (bool)"
    		]
    	},
    	xtarot: {
    		decimals: 18,
    		address: "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)",
    			"function underlyingBalanceForAccount(address) public view returns (uint)",
    			"function underlyingValuedAsShare(uint) public view returns (uint)"
    		]
    	},
    	tarot: {
    		decimals: 18,
    		address: "0xC5e2B037D30a390e62180970B3aa4E91868764cD",
    		abi: [
    			"function balanceOf(address) view returns (uint)",
    			"function allowance(address,address) public view returns (uint)",
    			"function totalSupply() public view returns (uint)",
    			"function approve(address,uint) public returns (bool)",
    			"function decimals() public view returns (uint)"
    		]
    	}
    };
    var localhost = {
    	chain: chain,
    	contracts: contracts,
    	swap: swap,
    	tokens: tokens
    };

    /* src\App.svelte generated by Svelte v3.44.2 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    // (162:4) {:else}
    function create_else_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "width", "80%");
    			set_style(img, "padding", "1rem 0");
    			if (!src_url_equal(img.src, img_src_value = "/static/images/wojak.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Wojak Face");
    			add_location(img, file, 162, 5, 5451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(162:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (160:52) 
    function create_if_block_15(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "width", "80%");
    			set_style(img, "padding", "1rem 0");
    			if (!src_url_equal(img.src, img_src_value = "/static/images/pepe_insuit.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Soyboy Face");
    			add_location(img, file, 160, 5, 5339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(160:52) ",
    		ctx
    	});

    	return block;
    }

    // (158:51) 
    function create_if_block_14(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "width", "80%");
    			set_style(img, "padding", "1rem 0");
    			if (!src_url_equal(img.src, img_src_value = "/static/images/pirate.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Wojak Pirate Face");
    			add_location(img, file, 158, 5, 5185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(158:51) ",
    		ctx
    	});

    	return block;
    }

    // (156:54) 
    function create_if_block_13(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "width", "80%");
    			set_style(img, "padding", "1rem 0");
    			if (!src_url_equal(img.src, img_src_value = "/static/images/soyboy.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Soyboy Face");
    			add_location(img, file, 156, 5, 5038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(156:54) ",
    		ctx
    	});

    	return block;
    }

    // (154:51) 
    function create_if_block_12(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "width", "80%");
    			set_style(img, "padding", "1rem 0");
    			if (!src_url_equal(img.src, img_src_value = "/static/images/chad.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Chad Face");
    			add_location(img, file, 154, 5, 4892);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(154:51) ",
    		ctx
    	});

    	return block;
    }

    // (152:55) 
    function create_if_block_11(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "width", "80%");
    			set_style(img, "padding", "1rem 0");
    			if (!src_url_equal(img.src, img_src_value = "/static/images/cat.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "ITS A CAT");
    			add_location(img, file, 152, 5, 4750);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(152:55) ",
    		ctx
    	});

    	return block;
    }

    // (150:4) {#if window.location.pathname == "/stake"}
    function create_if_block_10(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			set_style(img, "width", "80%");
    			set_style(img, "padding", "1rem 0");
    			if (!src_url_equal(img.src, img_src_value = "/static/images/boomer.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Boomer Face");
    			add_location(img, file, 150, 5, 4599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(150:4) {#if window.location.pathname == \\\"/stake\\\"}",
    		ctx
    	});

    	return block;
    }

    // (191:6) {#if lastKeep != 0}
    function create_if_block_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*lastKeepText*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*lastKeepText*/ 8) set_data_dev(t, /*lastKeepText*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(191:6) {#if lastKeep != 0}",
    		ctx
    	});

    	return block;
    }

    // (197:6) {#if lastDist != 0}
    function create_if_block_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*lastDistText*/ ctx[5]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*lastDistText*/ 32) set_data_dev(t, /*lastDistText*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(197:6) {#if lastDist != 0}",
    		ctx
    	});

    	return block;
    }

    // (214:4) {#if typeof token.chain !== "undefined"}
    function create_if_block_7(ctx) {
    	let div;
    	let t0_value = /*token*/ ctx[1].chain.name + "";
    	let t0;
    	let br;
    	let t1;
    	let t2_value = ethers.utils.commify((/*account*/ ctx[2].nbalance / Math.pow(10, 18)).toFixed(4)) + "";
    	let t2;
    	let t3;
    	let t4_value = /*token*/ ctx[1].chain.currency + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			br = element("br");
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			add_location(br, file, 215, 24, 7426);
    			set_style(div, "margin-top", "1rem");
    			set_style(div, "text-align", "center");
    			set_style(div, "width", "100%");
    			set_style(div, "font-size", "12px");
    			add_location(div, file, 214, 5, 7328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*token*/ 2 && t0_value !== (t0_value = /*token*/ ctx[1].chain.name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*account*/ 4 && t2_value !== (t2_value = ethers.utils.commify((/*account*/ ctx[2].nbalance / Math.pow(10, 18)).toFixed(4)) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*token*/ 2 && t4_value !== (t4_value = /*token*/ ctx[1].chain.currency + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(214:4) {#if typeof token.chain !== \\\"undefined\\\"}",
    		ctx
    	});

    	return block;
    }

    // (223:5) {:else}
    function create_else_block_1(ctx) {
    	let t_value = /*account*/ ctx[2].address + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*account*/ 4 && t_value !== (t_value = /*account*/ ctx[2].address + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(223:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (221:5) {#if account.address == "" || typeof account.address === "undefined"}
    function create_if_block_6(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Connect";
    			add_location(button, file, 221, 6, 7803);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*connect*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(221:5) {#if account.address == \\\"\\\" || typeof account.address === \\\"undefined\\\"}",
    		ctx
    	});

    	return block;
    }

    // (254:2) {:else}
    function create_else_block(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "class", "bg-face");
    			if (!src_url_equal(iframe.src, iframe_src_value = "/static/ascii/wojak.html")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "WJK");
    			add_location(iframe, file, 254, 3, 9454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(254:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (252:50) 
    function create_if_block_5(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "class", "bg-face");
    			if (!src_url_equal(iframe.src, iframe_src_value = "/static/ascii/pepe.html")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "pipi");
    			add_location(iframe, file, 252, 3, 9364);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(252:50) ",
    		ctx
    	});

    	return block;
    }

    // (250:49) 
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "bg-face");
    			if (!src_url_equal(img.src, img_src_value = "/static/images/pirate.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Wojak Pirate Face");
    			add_location(img, file, 250, 3, 9231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(250:49) ",
    		ctx
    	});

    	return block;
    }

    // (248:52) 
    function create_if_block_3(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "class", "bg-face");
    			if (!src_url_equal(iframe.src, iframe_src_value = "/static/ascii/soyjak.html")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "SOYJAK");
    			add_location(iframe, file, 248, 3, 9097);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(248:52) ",
    		ctx
    	});

    	return block;
    }

    // (246:49) 
    function create_if_block_2(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "class", "bg-face");
    			if (!src_url_equal(iframe.src, iframe_src_value = "/static/ascii/chad.html")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "CHAD");
    			add_location(iframe, file, 246, 3, 8964);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(246:49) ",
    		ctx
    	});

    	return block;
    }

    // (244:53) 
    function create_if_block_1(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "class", "bg-face");
    			if (!src_url_equal(iframe.src, iframe_src_value = "/static/ascii/cat.html")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "Depressed cat");
    			add_location(iframe, file, 244, 3, 8826);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(244:53) ",
    		ctx
    	});

    	return block;
    }

    // (242:2) {#if window.location.pathname == "/stake"}
    function create_if_block(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "class", "bg-face");
    			set_style(iframe, "margin-left", "-175px");
    			if (!src_url_equal(iframe.src, iframe_src_value = "/static/ascii/boomer.html")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "BOOMER");
    			add_location(iframe, file, 242, 3, 8661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(242:2) {#if window.location.pathname == \\\"/stake\\\"}",
    		ctx
    	});

    	return block;
    }

    // (144:0) <Notifications>
    function create_default_slot(ctx) {
    	let div0;
    	let t0;
    	let div16;
    	let div15;
    	let div13;
    	let t1;
    	let t2;
    	let span0;
    	let t3;
    	let br0;
    	let t4;
    	let t5;
    	let br1;
    	let br2;
    	let t6;
    	let div1;
    	let t7;
    	let br3;
    	let t8;
    	let t9;
    	let ul;
    	let a0;
    	let li0;
    	let t11;
    	let a1;
    	let li1;
    	let t13;
    	let a2;
    	let li2;
    	let t15;
    	let a3;
    	let li3;
    	let t17;
    	let a4;
    	let li4;
    	let t19;
    	let a5;
    	let li5;
    	let t21;
    	let br4;
    	let t22;
    	let div4;
    	let div2;
    	let t23;
    	let t24;
    	let t25;
    	let br5;
    	let t26;
    	let t27;
    	let div3;
    	let t28;
    	let t29;
    	let t30;
    	let br6;
    	let t31;
    	let t32;
    	let br7;
    	let t33;
    	let br8;
    	let t34;
    	let br9;
    	let t35;
    	let div8;
    	let a6;
    	let div5;
    	let t37;
    	let div6;
    	let t38;
    	let br10;
    	let t39;
    	let span1;
    	let t40_value = ethers.utils.commify(parseFloat(ethers.utils.formatEther(/*account*/ ctx[2].balance))) + "";
    	let t40;
    	let t41;
    	let div7;
    	let t42;
    	let br11;
    	let t43;
    	let span2;
    	let t44_value = ethers.utils.commify((parseFloat(ethers.utils.formatEther(/*account*/ ctx[2].staked)) * parseFloat(ethers.utils.formatEther(/*account*/ ctx[2].index))).toFixed(4).toString()) + "";
    	let t44;
    	let t45;
    	let t46;
    	let div9;
    	let t47;
    	let t48;
    	let br12;
    	let t49;
    	let a7;
    	let div10;
    	let t50;
    	let a8;
    	let div11;
    	let t51;
    	let a9;
    	let div12;
    	let t52;
    	let div14;
    	let comp;
    	let updating_token;
    	let updating_account;
    	let updating_wojak;
    	let updating_stake;
    	let updating_stakelocker;
    	let updating_connected;
    	let updating_nonce;
    	let t53;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (window.location.pathname == "/stake") return create_if_block_10;
    		if (window.location.pathname == "/dashboard") return create_if_block_11;
    		if (window.location.pathname == "/bonds") return create_if_block_12;
    		if (window.location.pathname == "/soyfarms") return create_if_block_13;
    		if (window.location.pathname == "/admin") return create_if_block_14;
    		if (window.location.pathname == "/bridge") return create_if_block_15;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type();
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*lastKeep*/ ctx[4] != 0 && create_if_block_9(ctx);
    	let if_block2 = /*lastDist*/ ctx[6] != 0 && create_if_block_8(ctx);
    	let if_block3 = typeof /*token*/ ctx[1].chain !== "undefined" && create_if_block_7(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*account*/ ctx[2].address == "" || typeof /*account*/ ctx[2].address === "undefined") return create_if_block_6;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block4 = current_block_type_1(ctx);

    	function comp_token_binding(value) {
    		/*comp_token_binding*/ ctx[17](value);
    	}

    	function comp_account_binding(value) {
    		/*comp_account_binding*/ ctx[18](value);
    	}

    	function comp_wojak_binding(value) {
    		/*comp_wojak_binding*/ ctx[19](value);
    	}

    	function comp_stake_binding(value) {
    		/*comp_stake_binding*/ ctx[20](value);
    	}

    	function comp_stakelocker_binding(value) {
    		/*comp_stakelocker_binding*/ ctx[21](value);
    	}

    	function comp_connected_binding(value) {
    		/*comp_connected_binding*/ ctx[22](value);
    	}

    	function comp_nonce_binding(value) {
    		/*comp_nonce_binding*/ ctx[23](value);
    	}

    	let comp_props = {
    		provider: /*provider*/ ctx[13],
    		signer: /*signer*/ ctx[14]
    	};

    	if (/*token*/ ctx[1] !== void 0) {
    		comp_props.token = /*token*/ ctx[1];
    	}

    	if (/*account*/ ctx[2] !== void 0) {
    		comp_props.account = /*account*/ ctx[2];
    	}

    	if (/*wojak*/ ctx[9] !== void 0) {
    		comp_props.wojak = /*wojak*/ ctx[9];
    	}

    	if (/*stake*/ ctx[10] !== void 0) {
    		comp_props.stake = /*stake*/ ctx[10];
    	}

    	if (/*stakelocker*/ ctx[11] !== void 0) {
    		comp_props.stakelocker = /*stakelocker*/ ctx[11];
    	}

    	if (/*connected*/ ctx[0] !== void 0) {
    		comp_props.connected = /*connected*/ ctx[0];
    	}

    	if (/*nonce*/ ctx[12] !== void 0) {
    		comp_props.nonce = /*nonce*/ ctx[12];
    	}

    	comp = new Soyfarms({ props: comp_props, $$inline: true });
    	binding_callbacks.push(() => bind(comp, 'token', comp_token_binding));
    	binding_callbacks.push(() => bind(comp, 'account', comp_account_binding));
    	binding_callbacks.push(() => bind(comp, 'wojak', comp_wojak_binding));
    	binding_callbacks.push(() => bind(comp, 'stake', comp_stake_binding));
    	binding_callbacks.push(() => bind(comp, 'stakelocker', comp_stakelocker_binding));
    	binding_callbacks.push(() => bind(comp, 'connected', comp_connected_binding));
    	binding_callbacks.push(() => bind(comp, 'nonce', comp_nonce_binding));

    	function select_block_type_2(ctx, dirty) {
    		if (window.location.pathname == "/stake") return create_if_block;
    		if (window.location.pathname == "/dashboard") return create_if_block_1;
    		if (window.location.pathname == "/bonds") return create_if_block_2;
    		if (window.location.pathname == "/soyfarms") return create_if_block_3;
    		if (window.location.pathname == "/admin") return create_if_block_4;
    		if (window.location.pathname == "/bridge") return create_if_block_5;
    		return create_else_block;
    	}

    	let current_block_type_2 = select_block_type_2();
    	let if_block5 = current_block_type_2(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div13 = element("div");
    			t1 = text("Wojak Token\n\t\t\t\t");
    			if_block0.c();
    			t2 = space();
    			span0 = element("span");
    			t3 = text("Experimental");
    			br0 = element("br");
    			t4 = text("\n\t\t\t\t\twealth building token");
    			t5 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t6 = space();
    			div1 = element("div");
    			t7 = text("We maybe not moon,");
    			br3 = element("br");
    			t8 = text("but its honest work.");
    			t9 = space();
    			ul = element("ul");
    			a0 = element("a");
    			li0 = element("li");
    			li0.textContent = "Hom";
    			t11 = space();
    			a1 = element("a");
    			li1 = element("li");
    			li1.textContent = "Dashboard";
    			t13 = space();
    			a2 = element("a");
    			li2 = element("li");
    			li2.textContent = "Boomer Stake";
    			t15 = space();
    			a3 = element("a");
    			li3 = element("li");
    			li3.textContent = "Chad Bonds";
    			t17 = space();
    			a4 = element("a");
    			li4 = element("li");
    			li4.textContent = "SoyFarms";
    			t19 = space();
    			a5 = element("a");
    			li5 = element("li");
    			li5.textContent = "Bridge";
    			t21 = space();
    			br4 = element("br");
    			t22 = space();
    			div4 = element("div");
    			div2 = element("div");
    			t23 = text("Next keep (epoch ");
    			t24 = text(/*totalUpkeeps*/ ctx[7]);
    			t25 = text(")");
    			br5 = element("br");
    			t26 = space();
    			if (if_block1) if_block1.c();
    			t27 = space();
    			div3 = element("div");
    			t28 = text("Next dist (");
    			t29 = text(/*totalDists*/ ctx[8]);
    			t30 = text(")");
    			br6 = element("br");
    			t31 = space();
    			if (if_block2) if_block2.c();
    			t32 = space();
    			br7 = element("br");
    			t33 = space();
    			br8 = element("br");
    			t34 = space();
    			br9 = element("br");
    			t35 = space();
    			div8 = element("div");
    			a6 = element("a");
    			div5 = element("div");
    			div5.textContent = "Admin Panel";
    			t37 = space();
    			div6 = element("div");
    			t38 = text("Holdings:");
    			br10 = element("br");
    			t39 = space();
    			span1 = element("span");
    			t40 = text(t40_value);
    			t41 = space();
    			div7 = element("div");
    			t42 = text("Staked:");
    			br11 = element("br");
    			t43 = space();
    			span2 = element("span");
    			t44 = text(t44_value);
    			t45 = space();
    			if (if_block3) if_block3.c();
    			t46 = space();
    			div9 = element("div");
    			if_block4.c();
    			t47 = text("\n\t\t\t\tNonce: ");
    			t48 = text(/*nonce*/ ctx[12]);
    			br12 = element("br");
    			t49 = space();
    			a7 = element("a");
    			div10 = element("div");
    			t50 = space();
    			a8 = element("a");
    			div11 = element("div");
    			t51 = space();
    			a9 = element("a");
    			div12 = element("div");
    			t52 = space();
    			div14 = element("div");
    			create_component(comp.$$.fragment);
    			t53 = space();
    			if_block5.c();
    			set_style(div0, "position", "absolute");
    			set_style(div0, "left", "0");
    			set_style(div0, "top", "0");
    			set_style(div0, "width", "100%");
    			set_style(div0, "background", "#e74c3c");
    			set_style(div0, "color", "#fff");
    			set_style(div0, "font-size", "12px");
    			set_style(div0, "padding", ".25rem");
    			add_location(div0, file, 144, 1, 4124);
    			add_location(br0, file, 165, 17, 5577);
    			add_location(span0, file, 164, 4, 5553);
    			add_location(br1, file, 168, 4, 5625);
    			add_location(br2, file, 168, 8, 5629);
    			add_location(br3, file, 169, 54, 5688);
    			set_style(div1, "margin-bottom", "1rem");
    			add_location(div1, file, 169, 4, 5638);
    			add_location(li0, file, 172, 17, 5785);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 172, 5, 5773);
    			add_location(li1, file, 173, 26, 5828);
    			attr_dev(a1, "href", "/dashboard");
    			add_location(a1, file, 173, 5, 5807);
    			add_location(li2, file, 174, 22, 5873);
    			attr_dev(a2, "href", "/stake");
    			add_location(a2, file, 174, 5, 5856);
    			add_location(li3, file, 175, 22, 5921);
    			attr_dev(a3, "href", "/bonds");
    			add_location(a3, file, 175, 5, 5904);
    			add_location(li4, file, 176, 25, 5970);
    			attr_dev(a4, "href", "/soyfarms");
    			add_location(a4, file, 176, 5, 5950);
    			add_location(li5, file, 177, 23, 6015);
    			attr_dev(a5, "href", "/bridge");
    			add_location(a5, file, 177, 5, 5997);
    			set_style(ul, "text-align", "left");
    			attr_dev(ul, "class", "menu");
    			add_location(ul, file, 171, 4, 5726);
    			add_location(br4, file, 186, 4, 6264);
    			add_location(br5, file, 189, 38, 6434);
    			set_style(div2, "background", "#eee");
    			set_style(div2, "border-radius", ".5rem");
    			set_style(div2, "padding", ".5rem .75rem");
    			set_style(div2, "margin-top", ".5rem");
    			add_location(div2, file, 188, 5, 6308);
    			add_location(br6, file, 195, 30, 6634);
    			set_style(div3, "background", "#eee");
    			set_style(div3, "border-radius", ".5rem");
    			set_style(div3, "padding", ".5rem .75rem");
    			set_style(div3, "margin-top", ".5rem");
    			add_location(div3, file, 194, 5, 6516);
    			set_style(div4, "text-align", "left");
    			add_location(div4, file, 187, 4, 6273);
    			add_location(br7, file, 201, 4, 6726);
    			add_location(br8, file, 202, 4, 6735);
    			add_location(br9, file, 203, 4, 6744);
    			add_location(div5, file, 205, 22, 6805);
    			attr_dev(a6, "href", "/admin");
    			add_location(a6, file, 205, 5, 6788);
    			add_location(br10, file, 206, 66, 6898);
    			add_location(span1, file, 207, 6, 6909);
    			set_style(div6, "overflow", "hidden");
    			set_style(div6, "text-overflow", "ellipsis");
    			add_location(div6, file, 206, 5, 6837);
    			add_location(br11, file, 209, 64, 7076);
    			add_location(span2, file, 210, 6, 7087);
    			set_style(div7, "overflow", "hidden");
    			set_style(div7, "text-overflow", "ellipsis");
    			add_location(div7, file, 209, 5, 7017);
    			set_style(div8, "text-align", "left");
    			add_location(div8, file, 204, 4, 6753);
    			set_style(div9, "margin-top", ".1rem");
    			set_style(div9, "border", "1px solid #ccc");
    			set_style(div9, "border-radius", ".25rem");
    			set_style(div9, "padding", ".25rem");
    			set_style(div9, "background", "#f0f0f0");
    			set_style(div9, "overflow", "hidden");
    			set_style(div9, "text-overflow", "ellipsis");
    			set_style(div9, "max-width", "10rem");
    			add_location(div9, file, 219, 4, 7559);
    			add_location(br12, file, 226, 18, 7926);
    			attr_dev(div10, "class", "twitter h-3 w-3 bg-black pointer mt-1 inline-block");
    			attr_dev(div10, "title", "Twitter");
    			add_location(div10, file, 227, 44, 7975);
    			attr_dev(a7, "href", "https://twitter.com/wojak_bro");
    			add_location(a7, file, 227, 4, 7935);
    			attr_dev(div11, "class", "docs h-3 w-3 bg-black pointer mt-1 inline-block");
    			attr_dev(div11, "title", "Documentation");
    			add_location(div11, file, 228, 53, 8119);
    			attr_dev(a8, "href", "https://kaperstone.gitbook.io/wojak-1/");
    			add_location(a8, file, 228, 4, 8070);
    			attr_dev(div12, "class", "telegram h-3 w-3 bg-black pointer mt-1 inline-block");
    			attr_dev(div12, "title", "Telegram");
    			add_location(div12, file, 229, 37, 8250);
    			attr_dev(a9, "href", "https://t.me/wojak_bro");
    			add_location(a9, file, 229, 4, 8217);
    			set_style(div13, "display", "inline-block");
    			set_style(div13, "vertical-align", "top");
    			set_style(div13, "width", "10rem");
    			set_style(div13, "padding", "1rem");
    			set_style(div13, "border-right", "1px solid #363636");
    			set_style(div13, "text-align", "center");
    			add_location(div13, file, 147, 3, 4403);
    			set_style(div14, "display", "inline-block");
    			set_style(div14, "vertical-align", "top");
    			set_style(div14, "padding", "1rem");
    			set_style(div14, "width", "48rem");
    			add_location(div14, file, 231, 3, 8356);
    			set_style(div15, "margin", "2rem auto");
    			set_style(div15, "width", "64rem");
    			set_style(div15, "min-height", "600px");
    			set_style(div15, "font-size", ".85rem");
    			add_location(div15, file, 146, 2, 4323);
    			set_style(div16, "width", "1024px");
    			set_style(div16, "margin", "0 auto");
    			set_style(div16, "position", "relative");
    			add_location(div16, file, 145, 1, 4262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			div0.innerHTML = /*warnHim*/ ctx[16];
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div16, anchor);
    			append_dev(div16, div15);
    			append_dev(div15, div13);
    			append_dev(div13, t1);
    			if_block0.m(div13, null);
    			append_dev(div13, t2);
    			append_dev(div13, span0);
    			append_dev(span0, t3);
    			append_dev(span0, br0);
    			append_dev(span0, t4);
    			append_dev(div13, t5);
    			append_dev(div13, br1);
    			append_dev(div13, br2);
    			append_dev(div13, t6);
    			append_dev(div13, div1);
    			append_dev(div1, t7);
    			append_dev(div1, br3);
    			append_dev(div1, t8);
    			append_dev(div13, t9);
    			append_dev(div13, ul);
    			append_dev(ul, a0);
    			append_dev(a0, li0);
    			append_dev(ul, t11);
    			append_dev(ul, a1);
    			append_dev(a1, li1);
    			append_dev(ul, t13);
    			append_dev(ul, a2);
    			append_dev(a2, li2);
    			append_dev(ul, t15);
    			append_dev(ul, a3);
    			append_dev(a3, li3);
    			append_dev(ul, t17);
    			append_dev(ul, a4);
    			append_dev(a4, li4);
    			append_dev(ul, t19);
    			append_dev(ul, a5);
    			append_dev(a5, li5);
    			append_dev(div13, t21);
    			append_dev(div13, br4);
    			append_dev(div13, t22);
    			append_dev(div13, div4);
    			append_dev(div4, div2);
    			append_dev(div2, t23);
    			append_dev(div2, t24);
    			append_dev(div2, t25);
    			append_dev(div2, br5);
    			append_dev(div2, t26);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div4, t27);
    			append_dev(div4, div3);
    			append_dev(div3, t28);
    			append_dev(div3, t29);
    			append_dev(div3, t30);
    			append_dev(div3, br6);
    			append_dev(div3, t31);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div13, t32);
    			append_dev(div13, br7);
    			append_dev(div13, t33);
    			append_dev(div13, br8);
    			append_dev(div13, t34);
    			append_dev(div13, br9);
    			append_dev(div13, t35);
    			append_dev(div13, div8);
    			append_dev(div8, a6);
    			append_dev(a6, div5);
    			append_dev(div8, t37);
    			append_dev(div8, div6);
    			append_dev(div6, t38);
    			append_dev(div6, br10);
    			append_dev(div6, t39);
    			append_dev(div6, span1);
    			append_dev(span1, t40);
    			append_dev(div8, t41);
    			append_dev(div8, div7);
    			append_dev(div7, t42);
    			append_dev(div7, br11);
    			append_dev(div7, t43);
    			append_dev(div7, span2);
    			append_dev(span2, t44);
    			append_dev(div13, t45);
    			if (if_block3) if_block3.m(div13, null);
    			append_dev(div13, t46);
    			append_dev(div13, div9);
    			if_block4.m(div9, null);
    			append_dev(div13, t47);
    			append_dev(div13, t48);
    			append_dev(div13, br12);
    			append_dev(div13, t49);
    			append_dev(div13, a7);
    			append_dev(a7, div10);
    			append_dev(div13, t50);
    			append_dev(div13, a8);
    			append_dev(a8, div11);
    			append_dev(div13, t51);
    			append_dev(div13, a9);
    			append_dev(a9, div12);
    			append_dev(div15, t52);
    			append_dev(div15, div14);
    			mount_component(comp, div14, null);
    			append_dev(div16, t53);
    			if_block5.m(div16, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*totalUpkeeps*/ 128) set_data_dev(t24, /*totalUpkeeps*/ ctx[7]);

    			if (/*lastKeep*/ ctx[4] != 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_9(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*totalDists*/ 256) set_data_dev(t29, /*totalDists*/ ctx[8]);

    			if (/*lastDist*/ ctx[6] != 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_8(ctx);
    					if_block2.c();
    					if_block2.m(div3, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if ((!current || dirty & /*account*/ 4) && t40_value !== (t40_value = ethers.utils.commify(parseFloat(ethers.utils.formatEther(/*account*/ ctx[2].balance))) + "")) set_data_dev(t40, t40_value);
    			if ((!current || dirty & /*account*/ 4) && t44_value !== (t44_value = ethers.utils.commify((parseFloat(ethers.utils.formatEther(/*account*/ ctx[2].staked)) * parseFloat(ethers.utils.formatEther(/*account*/ ctx[2].index))).toFixed(4).toString()) + "")) set_data_dev(t44, t44_value);

    			if (typeof /*token*/ ctx[1].chain !== "undefined") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_7(ctx);
    					if_block3.c();
    					if_block3.m(div13, t46);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block4) {
    				if_block4.p(ctx, dirty);
    			} else {
    				if_block4.d(1);
    				if_block4 = current_block_type_1(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(div9, null);
    				}
    			}

    			if (!current || dirty & /*nonce*/ 4096) set_data_dev(t48, /*nonce*/ ctx[12]);
    			const comp_changes = {};

    			if (!updating_token && dirty & /*token*/ 2) {
    				updating_token = true;
    				comp_changes.token = /*token*/ ctx[1];
    				add_flush_callback(() => updating_token = false);
    			}

    			if (!updating_account && dirty & /*account*/ 4) {
    				updating_account = true;
    				comp_changes.account = /*account*/ ctx[2];
    				add_flush_callback(() => updating_account = false);
    			}

    			if (!updating_wojak && dirty & /*wojak*/ 512) {
    				updating_wojak = true;
    				comp_changes.wojak = /*wojak*/ ctx[9];
    				add_flush_callback(() => updating_wojak = false);
    			}

    			if (!updating_stake && dirty & /*stake*/ 1024) {
    				updating_stake = true;
    				comp_changes.stake = /*stake*/ ctx[10];
    				add_flush_callback(() => updating_stake = false);
    			}

    			if (!updating_stakelocker && dirty & /*stakelocker*/ 2048) {
    				updating_stakelocker = true;
    				comp_changes.stakelocker = /*stakelocker*/ ctx[11];
    				add_flush_callback(() => updating_stakelocker = false);
    			}

    			if (!updating_connected && dirty & /*connected*/ 1) {
    				updating_connected = true;
    				comp_changes.connected = /*connected*/ ctx[0];
    				add_flush_callback(() => updating_connected = false);
    			}

    			if (!updating_nonce && dirty & /*nonce*/ 4096) {
    				updating_nonce = true;
    				comp_changes.nonce = /*nonce*/ ctx[12];
    				add_flush_callback(() => updating_nonce = false);
    			}

    			comp.$set(comp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(comp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(comp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div16);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if_block4.d();
    			destroy_component(comp);
    			if_block5.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(144:0) <Notifications>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let notifications;
    	let current;

    	notifications = new Notifications({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(notifications.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(notifications, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const notifications_changes = {};

    			if (dirty & /*$$scope, token, account, wojak, stake, stakelocker, connected, nonce, lastDistText, lastDist, totalDists, lastKeepText, lastKeep, totalUpkeeps*/ 536879103) {
    				notifications_changes.$$scope = { dirty, ctx };
    			}

    			notifications.$set(notifications_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notifications.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notifications.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notifications, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getTimeRemaining(endtime) {
    	if (Math.round(new Date() / 1000) < endtime) {
    		const total = endtime - Math.round(new Date() / 1000);
    		return "" + Math.floor(total / 3600 % 24) + "hr " + Math.floor(total / 60 % 60) + "min " + Math.floor(total % 60) + "sec";
    	} else {
    		return "0hr 0min 0sec";
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let connected = false;

    	let token = {},
    		account = {
    			address: window.ethereum.selectedAddress,
    			nbalance: "0",
    			balance: "0",
    			staked: "0",
    			index: "1",
    			connected: false
    		};

    	let chains = [];
    	chains[5] = goerli;
    	chains[1337] = localhost;

    	window.dispatch = function () {
    		
    	};

    	const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    	const signer = provider.getSigner(0);

    	let lastKeepText = "",
    		lastKeep = Math.round(new Date() / 1000),
    		lastDistText = "",
    		lastDist = Math.round(new Date() / 1000),
    		totalUpkeeps = 0,
    		totalDists = 0,
    		wojak,
    		stake,
    		keeper,
    		stakelocker,
    		nonce = 0;

    	async function connect() {
    		await provider.send("eth_requestAccounts", []).then(() => load(parseInt(window.ethereum.networkVersion)));
    	}

    	setInterval(
    		() => {
    			$$invalidate(3, lastKeepText = getTimeRemaining(lastKeep));
    			$$invalidate(5, lastDistText = getTimeRemaining(lastDist));
    		},
    		1000
    	);

    	let lastLoad = new Date();

    	async function load(chainId, onNewBlock) {
    		// console.log("chainid=" + chainId)
    		if (typeof chains[chainId] !== "undefined") {
    			if (typeof onNewBlock === "undefined" || onNewBlock == true && new Date() - lastLoad > 5000) {
    				lastLoad = new Date();
    				$$invalidate(1, token = chains[chainId]);

    				if (wojak == null) {
    					$$invalidate(9, wojak = new ethers.Contract(token.contracts.token.address, token.contracts.token.abi, signer));
    					$$invalidate(10, stake = new ethers.Contract(token.contracts.stake.address, token.contracts.stake.abi, signer));
    					keeper = new ethers.Contract(token.contracts.keeper.address, token.contracts.keeper.abi, signer);
    					$$invalidate(11, stakelocker = new ethers.Contract(token.contracts.stakelocker.address, token.contracts.stakelocker.abi, signer));
    				}

    				let collector = [];
    				collector[0] = keeper.lastKeep();
    				collector[1] = keeper.totalUpkeeps();
    				collector[7] = keeper.lastDist();
    				collector[8] = keeper.dists();
    				$$invalidate(0, connected = true);

    				if (typeof window.ethereum.selectedAddress === "string") {
    					$$invalidate(2, account.address = window.ethereum.selectedAddress, account);
    					collector[2] = provider.getBalance(account.address);
    					collector[3] = wojak.balanceOf(account.address);
    					collector[4] = stake.balanceOf(account.address);
    					collector[5] = stake.index();
    					collector[6] = stakelocker.balanceOf(account.address);
    					$$invalidate(2, account.connected = true, account);
    				} // The rest

    				Promise.all(collector).then(values => {
    					$$invalidate(4, lastKeep = parseInt(values[0]) + 86400);
    					$$invalidate(7, totalUpkeeps = parseInt(values[1]));
    					$$invalidate(6, lastDist = parseInt(values[7]) + 3600);
    					$$invalidate(8, totalDists = parseInt(values[8]));

    					if (typeof window.ethereum.selectedAddress === "string") {
    						$$invalidate(2, account.nbalance = values[2], account);
    						$$invalidate(2, account.balance = values[3], account);
    						$$invalidate(2, account.staked = values[4].add(values[6]), account);
    						$$invalidate(2, account.index = values[5], account);
    					}

    					window.dispatch();
    				});
    			}
    		} else $$invalidate(0, connected = false);
    	}

    	let tt;

    	provider.on("network", async (network, oldNetwork) => {
    		console.log("Changed accounts");
    		provider.send("eth_requestAccounts", []).then(() => load(network.chainId));

    		// Sometimes we receive two or more blocks at the same time because of delays
    		// To ensure constant up-to-date
    		if (typeof token.chain !== "undefined") ; // clearInterval(tt)
    		// tt = setInterval(() => {
    	}); // 	if(connected) load(parseInt(window.ethereum.networkVersion), true)
    	// }, token.chain.blockTime * 1000)

    	provider.on("block", () => {
    		// console.log("block")
    		if (connected) {
    			load(parseInt(token.chain.id), true);
    			signer.getTransactionCount().then(n => $$invalidate(12, nonce = n));
    		}
    	});

    	provider.on("error", error => console.error(error));
    	const warnHim = `DISCLAIMER: THIS LIKE EVERY OTHER PROJECT, IS EXPERIMENTAL, USE AT YOUR OWN RISK. WE DON'T HAVE INSURANCE BRO`;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function comp_token_binding(value) {
    		token = value;
    		$$invalidate(1, token);
    	}

    	function comp_account_binding(value) {
    		account = value;
    		$$invalidate(2, account);
    	}

    	function comp_wojak_binding(value) {
    		wojak = value;
    		$$invalidate(9, wojak);
    	}

    	function comp_stake_binding(value) {
    		stake = value;
    		$$invalidate(10, stake);
    	}

    	function comp_stakelocker_binding(value) {
    		stakelocker = value;
    		$$invalidate(11, stakelocker);
    	}

    	function comp_connected_binding(value) {
    		connected = value;
    		$$invalidate(0, connected);
    	}

    	function comp_nonce_binding(value) {
    		nonce = value;
    		$$invalidate(12, nonce);
    	}

    	$$self.$capture_state = () => ({
    		Comp: Soyfarms,
    		goerli,
    		localhost,
    		Notifications,
    		connected,
    		token,
    		account,
    		chains,
    		provider,
    		signer,
    		lastKeepText,
    		lastKeep,
    		lastDistText,
    		lastDist,
    		totalUpkeeps,
    		totalDists,
    		wojak,
    		stake,
    		keeper,
    		stakelocker,
    		nonce,
    		connect,
    		lastLoad,
    		load,
    		tt,
    		getTimeRemaining,
    		warnHim
    	});

    	$$self.$inject_state = $$props => {
    		if ('connected' in $$props) $$invalidate(0, connected = $$props.connected);
    		if ('token' in $$props) $$invalidate(1, token = $$props.token);
    		if ('account' in $$props) $$invalidate(2, account = $$props.account);
    		if ('chains' in $$props) chains = $$props.chains;
    		if ('lastKeepText' in $$props) $$invalidate(3, lastKeepText = $$props.lastKeepText);
    		if ('lastKeep' in $$props) $$invalidate(4, lastKeep = $$props.lastKeep);
    		if ('lastDistText' in $$props) $$invalidate(5, lastDistText = $$props.lastDistText);
    		if ('lastDist' in $$props) $$invalidate(6, lastDist = $$props.lastDist);
    		if ('totalUpkeeps' in $$props) $$invalidate(7, totalUpkeeps = $$props.totalUpkeeps);
    		if ('totalDists' in $$props) $$invalidate(8, totalDists = $$props.totalDists);
    		if ('wojak' in $$props) $$invalidate(9, wojak = $$props.wojak);
    		if ('stake' in $$props) $$invalidate(10, stake = $$props.stake);
    		if ('keeper' in $$props) keeper = $$props.keeper;
    		if ('stakelocker' in $$props) $$invalidate(11, stakelocker = $$props.stakelocker);
    		if ('nonce' in $$props) $$invalidate(12, nonce = $$props.nonce);
    		if ('lastLoad' in $$props) lastLoad = $$props.lastLoad;
    		if ('tt' in $$props) tt = $$props.tt;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		connected,
    		token,
    		account,
    		lastKeepText,
    		lastKeep,
    		lastDistText,
    		lastDist,
    		totalUpkeeps,
    		totalDists,
    		wojak,
    		stake,
    		stakelocker,
    		nonce,
    		provider,
    		signer,
    		connect,
    		warnHim,
    		comp_token_binding,
    		comp_account_binding,
    		comp_wojak_binding,
    		comp_stake_binding,
    		comp_stakelocker_binding,
    		comp_connected_binding,
    		comp_nonce_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // import Comp from "./__pagePath__.svelte"

    var main = new App({
    	target: document.body,
    	props: {
    		// Comp
    	}
    });

    return main;

})();
//# sourceMappingURL=soyfarms.js.map
