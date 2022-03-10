
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35737/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    var contracts$2 = [
    	{
    		name: "manager",
    		roles: [
    		],
    		functions: [
    			{
    				name: "setAddressToken",
    				type: "input",
    				inputs: [
    					{
    						"default": "token",
    						equal: "wojak",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressStaking",
    				type: "input",
    				inputs: [
    					{
    						"default": "stake",
    						equal: "stake",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressBonds",
    				type: "input",
    				inputs: [
    					{
    						"default": "bonds",
    						equal: "bonds",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressKeeper",
    				type: "input",
    				inputs: [
    					{
    						"default": "keeper",
    						equal: "keeper",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressLocker",
    				type: "input",
    				inputs: [
    					{
    						"default": "stakelocker",
    						equal: "locker",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressTreasury",
    				type: "input",
    				inputs: [
    					{
    						"default": "treasury",
    						equal: "treasury",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressZoomer",
    				type: "input",
    				inputs: [
    					{
    						"default": "zoomer",
    						equal: "zoomer",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressBooSoy",
    				type: "input",
    				inputs: [
    					{
    						"default": "boosoy",
    						equal: "boosoy",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressCreditSoy",
    				type: "input",
    				inputs: [
    					{
    						"default": "creditsoy",
    						equal: "creditsoy",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressScreamSoy",
    				type: "input",
    				inputs: [
    					{
    						"default": "screamsoy",
    						equal: "screamsoy",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressTarotSoy",
    				type: "input",
    				inputs: [
    					{
    						"default": "tarotsoy",
    						equal: "tarotsoy",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			},
    			{
    				name: "setAddressUsdcSoy",
    				type: "input",
    				inputs: [
    					{
    						"default": "usdcsoy",
    						equal: "usdcsoy",
    						placeholder: "address",
    						type: "should-equal-this"
    					}
    				]
    			}
    		]
    	},
    	{
    		name: "token",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			},
    			{
    				name: "CONTRACT_ROLE",
    				keccak256: "0x364d3d7565c7a8300c96fd53e065d19b65848d7b23b3191adcd55621c744223c",
    				target: [
    					"contracts.stake",
    					"contracts.zoomer"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "stake",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "bonds",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "keeper",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			},
    			{
    				name: "TARGETS",
    				keccak256: "0x86b309ff057c1dbc796d9470d76bc906c80d2a3ff6bd5a2e447d1e7112884379",
    				target: [
    					"contracts.stake",
    					"contracts.zoomer",
    					"contracts.stakelocker",
    					"contracts.boosoy",
    					"contracts.creditsoy",
    					"contracts.screamsoy",
    					"contracts.tarotsoy",
    					"contracts.usdcsoy",
    					"contracts.bifisoy",
    					"contracts.crvsoy"
    				],
    				result: [
    				]
    			},
    			{
    				name: "TOKENS",
    				keccak256: "0x1d0c4a6d5955c15210d504b24311f07967d735ab1b30eb7918850991b51c3ce6",
    				target: [
    					"tokens.boo",
    					"tokens.credit",
    					"tokens.scream",
    					"tokens.tarot",
    					"tokens.usdc",
    					"tokens.bifi",
    					"tokens.crv"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "stakelocker",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			},
    			{
    				name: "TOKENS",
    				keccak256: "0x1d0c4a6d5955c15210d504b24311f07967d735ab1b30eb7918850991b51c3ce6",
    				target: [
    					"tokens.boo",
    					"tokens.credit",
    					"tokens.scream",
    					"tokens.tarot",
    					"tokens.usdc",
    					"tokens.bifi",
    					"tokens.crv"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "treasury",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			},
    			{
    				name: "TOKENS",
    				keccak256: "0x1d0c4a6d5955c15210d504b24311f07967d735ab1b30eb7918850991b51c3ce6",
    				target: [
    					"tokens.boo",
    					"tokens.credit",
    					"tokens.scream",
    					"tokens.tarot",
    					"tokens.usdc",
    					"tokens.bifi",
    					"tokens.crv"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "zoomer",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "boosoy",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "creditsoy",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "screamsoy",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "tarotsoy",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "usdcsoy",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "bifisoy",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	},
    	{
    		name: "crvsoy",
    		roles: [
    			{
    				name: "DEFAULT_ADMIN_ROLE",
    				keccak256: "0x0000000000000000000000000000000000000000000000000000000000000000",
    				target: [
    					"contracts.manager"
    				],
    				result: [
    				]
    			}
    		],
    		functions: [
    		]
    	}
    ];
    var struct = {
    	contracts: contracts$2
    };

    /* src\pages\admin.svelte generated by Svelte v3.44.2 */

    const { console: console_1$1 } = globals;
    const file$3 = "src\\pages\\admin.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[98] = list[i];
    	child_ctx[100] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[101] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[104] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[107] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[110] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[98] = list[i];
    	child_ctx[100] = i;
    	return child_ctx;
    }

    // (514:0) {#if typeof token.contracts !== "undefined"}
    function create_if_block$2(ctx) {
    	let div3;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let t7;
    	let br0;
    	let t8;
    	let button4;
    	let t10;
    	let button5;
    	let t12;
    	let div1;
    	let div0;
    	let t13;
    	let t14;
    	let t15;
    	let br1;
    	let t16;
    	let html_tag;
    	let br2;
    	let t17;
    	let html_tag_1;
    	let br3;
    	let t18;
    	let div2;
    	let t19;
    	let br4;
    	let br5;
    	let t20;
    	let t21_value = ethers.utils.commify(parseFloat(/*keeper_usdcbalance*/ ctx[12]).toFixed(2)) + "";
    	let t21;
    	let t22;
    	let br6;
    	let br7;
    	let t23;
    	let t24;
    	let br8;
    	let br9;
    	let t25;
    	let button6;
    	let button7;
    	let t28;
    	let t29;
    	let br10;
    	let t30;
    	let button8;
    	let t32;
    	let t33_value = ethers.utils.commify(parseFloat(/*usdcBalance*/ ctx[5]).toFixed(2)) + "";
    	let t33;
    	let br11;
    	let t34;
    	let button9;
    	let t36;
    	let t37_value = ethers.utils.commify(parseFloat(/*booBalance*/ ctx[6]).toFixed(2)) + "";
    	let t37;
    	let t38;
    	let button10;
    	let br12;
    	let t40;
    	let button11;
    	let t42;
    	let t43_value = ethers.utils.commify(parseFloat(/*creditBalance*/ ctx[7]).toFixed(2)) + "";
    	let t43;
    	let t44;
    	let button12;
    	let br13;
    	let t46;
    	let button13;
    	let t48;
    	let t49_value = ethers.utils.commify(parseFloat(/*screamBalance*/ ctx[8]).toFixed(2)) + "";
    	let t49;
    	let t50;
    	let button14;
    	let br14;
    	let t52;
    	let button15;
    	let t54;
    	let t55_value = ethers.utils.commify(parseFloat(/*tarotBalance*/ ctx[9]).toFixed(2)) + "";
    	let t55;
    	let br15;
    	let t56;
    	let button16;
    	let t58;
    	let t59_value = ethers.utils.commify(parseFloat(/*bifiBalance*/ ctx[10]).toFixed(2)) + "";
    	let t59;
    	let br16;
    	let t60;
    	let button17;
    	let t62;
    	let t63_value = ethers.utils.commify(parseFloat(/*crvBalance*/ ctx[11]).toFixed(2)) + "";
    	let t63;
    	let br17;
    	let t64;
    	let button18;
    	let button19;
    	let t67;
    	let button20;
    	let t69;
    	let br18;
    	let t70;
    	let button21;
    	let t72;
    	let button22;
    	let t74;
    	let button23;
    	let t76;
    	let button24;
    	let t78;
    	let ul0;
    	let t79;
    	let div4;
    	let t80;
    	let div6;
    	let t81;
    	let br19;
    	let t82;
    	let input0;
    	let t83;
    	let input1;
    	let t84;
    	let button25;
    	let br20;
    	let t86;
    	let input2;
    	let t87;
    	let button26;
    	let br21;
    	let t89;
    	let input3;
    	let t90;
    	let button27;
    	let br22;
    	let t92;
    	let input4;
    	let t93;
    	let input5;
    	let t94;
    	let button28;
    	let br23;
    	let t96;
    	let div5;
    	let input6;
    	let t97;
    	let button29;
    	let br24;
    	let t99;
    	let input7;
    	let t100;
    	let button30;
    	let br25;
    	let t102;
    	let input8;
    	let t103;
    	let button31;
    	let br26;
    	let t105;
    	let div7;
    	let t106;
    	let ul1;
    	let li0;
    	let t107;
    	let t108_value = /*token*/ ctx[0].tokens.boo.address + "";
    	let t108;
    	let t109;
    	let li1;
    	let t110;
    	let t111_value = /*token*/ ctx[0].tokens.credit.address + "";
    	let t111;
    	let t112;
    	let li2;
    	let t113;
    	let t114_value = /*token*/ ctx[0].tokens.scream.address + "";
    	let t114;
    	let t115;
    	let li3;
    	let t116;
    	let t117_value = /*token*/ ctx[0].tokens.tarot.address + "";
    	let t117;
    	let t118;
    	let li4;
    	let t119;
    	let t120_value = /*token*/ ctx[0].tokens.usdc.address + "";
    	let t120;
    	let t121;
    	let li5;
    	let t122;
    	let t123_value = /*token*/ ctx[0].tokens.bifi.address + "";
    	let t123;
    	let t124;
    	let li6;
    	let t125;
    	let t126_value = /*token*/ ctx[0].tokens.crv.address + "";
    	let t126;
    	let t127;
    	let ul2;
    	let li7;
    	let t128;
    	let t129_value = /*token*/ ctx[0].contracts.boosoy.address + "";
    	let t129;
    	let t130;
    	let li8;
    	let t131;
    	let t132_value = /*token*/ ctx[0].contracts.creditsoy.address + "";
    	let t132;
    	let t133;
    	let li9;
    	let t134;
    	let t135_value = /*token*/ ctx[0].contracts.screamsoy.address + "";
    	let t135;
    	let t136;
    	let li10;
    	let t137;
    	let t138_value = /*token*/ ctx[0].contracts.tarotsoy.address + "";
    	let t138;
    	let t139;
    	let li11;
    	let t140;
    	let t141_value = /*token*/ ctx[0].contracts.usdcsoy.address + "";
    	let t141;
    	let t142;
    	let li12;
    	let t143;
    	let t144_value = /*token*/ ctx[0].contracts.bifisoy.address + "";
    	let t144;
    	let t145;
    	let li13;
    	let t146;
    	let t147_value = /*token*/ ctx[0].contracts.crvsoy.address + "";
    	let t147;
    	let t148;
    	let div8;
    	let t149;
    	let br27;
    	let t150;
    	let input9;
    	let t151;
    	let input10;
    	let t152;
    	let button32;
    	let br28;
    	let t154;
    	let input11;
    	let t155;
    	let button33;
    	let br29;
    	let t157;
    	let input12;
    	let t158;
    	let button34;
    	let br30;
    	let t160;
    	let input13;
    	let t161;
    	let input14;
    	let t162;
    	let button35;
    	let br31;
    	let mounted;
    	let dispose;
    	let each_value_5 = /*struct*/ ctx[1].contracts;
    	validate_each_argument(each_value_5);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks_1[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	let each_value = /*struct*/ ctx[1].contracts;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "USDC Faucet Goerli";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Launch Keeper Manually";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Launch Distribution Manually";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "Transfer to Keeper 101$";
    			t7 = space();
    			br0 = element("br");
    			t8 = space();
    			button4 = element("button");
    			button4.textContent = "Manager Update Keeper Tokens/Targets";
    			t10 = space();
    			button5 = element("button");
    			button5.textContent = "Manager Update Addresses & Roles";
    			t12 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t13 = text(/*completed*/ ctx[15]);
    			t14 = text("%");
    			t15 = space();
    			br1 = element("br");
    			t16 = text("\r\n    status = ");
    			html_tag = new HtmlTag();
    			br2 = element("br");
    			t17 = text("\r\n    tx_status = ");
    			html_tag_1 = new HtmlTag();
    			br3 = element("br");
    			t18 = space();
    			div2 = element("div");
    			t19 = text("LIQUIDITY FUN");
    			br4 = element("br");
    			br5 = element("br");
    			t20 = text("\r\n        USDC BALANCE: ");
    			t21 = text(t21_value);
    			t22 = text("$");
    			br6 = element("br");
    			br7 = element("br");
    			t23 = text("\r\n        BOOForxBOO=");
    			t24 = text(/*BOOForxBOO*/ ctx[13]);
    			br8 = element("br");
    			br9 = element("br");
    			t25 = space();
    			button6 = element("button");
    			button6.textContent = "Create Pair";
    			button7 = element("button");
    			button7.textContent = "Get Pair";
    			t28 = space();
    			t29 = text(/*pair*/ ctx[16]);
    			br10 = element("br");
    			t30 = space();
    			button8 = element("button");
    			button8.textContent = "Buy USDC with ETH";
    			t32 = text(" FTM(7,000,000) => USDC -> BALANCE: ");
    			t33 = text(t33_value);
    			br11 = element("br");
    			t34 = space();
    			button9 = element("button");
    			button9.textContent = "Buy BOO with ETH";
    			t36 = text(" BOO -> BALANCE: ");
    			t37 = text(t37_value);
    			t38 = space();
    			button10 = element("button");
    			button10.textContent = "Send boo to IB contract";
    			br12 = element("br");
    			t40 = space();
    			button11 = element("button");
    			button11.textContent = "Buy CREDIT with ETH";
    			t42 = text(" CREDIT -> BALANCE: ");
    			t43 = text(t43_value);
    			t44 = space();
    			button12 = element("button");
    			button12.textContent = "Send credit to IB contract";
    			br13 = element("br");
    			t46 = space();
    			button13 = element("button");
    			button13.textContent = "Buy SCREAM with ETH";
    			t48 = text(" SCREAM -> BALANCE: ");
    			t49 = text(t49_value);
    			t50 = space();
    			button14 = element("button");
    			button14.textContent = "Send scream to IB contract";
    			br14 = element("br");
    			t52 = space();
    			button15 = element("button");
    			button15.textContent = "Buy TAROT with ETH";
    			t54 = text(" TAROT -> BALANCE: ");
    			t55 = text(t55_value);
    			br15 = element("br");
    			t56 = space();
    			button16 = element("button");
    			button16.textContent = "Buy TAROT with ETH";
    			t58 = text(" BIFI -> BALANCE: ");
    			t59 = text(t59_value);
    			br16 = element("br");
    			t60 = space();
    			button17 = element("button");
    			button17.textContent = "Buy TAROT with ETH";
    			t62 = text(" CRV -> BALANCE: ");
    			t63 = text(t63_value);
    			br17 = element("br");
    			t64 = space();
    			button18 = element("button");
    			button18.textContent = "Approve WJK";
    			button19 = element("button");
    			button19.textContent = "Approve USDC";
    			t67 = space();
    			button20 = element("button");
    			button20.textContent = "Supply Liquidity to WJK:USDC";
    			t69 = space();
    			br18 = element("br");
    			t70 = space();
    			button21 = element("button");
    			button21.textContent = "treasury.disableBoo";
    			t72 = space();
    			button22 = element("button");
    			button22.textContent = "treasury.disableCredit";
    			t74 = space();
    			button23 = element("button");
    			button23.textContent = "treasury.disableScream";
    			t76 = space();
    			button24 = element("button");
    			button24.textContent = "treasury.disableTarot";
    			t78 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t79 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t80 = space();
    			div6 = element("div");
    			t81 = text("Treasury Control");
    			br19 = element("br");
    			t82 = space();
    			input0 = element("input");
    			t83 = space();
    			input1 = element("input");
    			t84 = space();
    			button25 = element("button");
    			button25.textContent = "addStrategy";
    			br20 = element("br");
    			t86 = space();
    			input2 = element("input");
    			t87 = space();
    			button26 = element("button");
    			button26.textContent = "disableStrategy";
    			br21 = element("br");
    			t89 = space();
    			input3 = element("input");
    			t90 = space();
    			button27 = element("button");
    			button27.textContent = "enableStrategy";
    			br22 = element("br");
    			t92 = space();
    			input4 = element("input");
    			t93 = space();
    			input5 = element("input");
    			t94 = space();
    			button28 = element("button");
    			button28.textContent = "changeStrategy";
    			br23 = element("br");
    			t96 = space();
    			div5 = element("div");
    			input6 = element("input");
    			t97 = space();
    			button29 = element("button");
    			button29.textContent = "enterMarket";
    			br24 = element("br");
    			t99 = space();
    			input7 = element("input");
    			t100 = space();
    			button30 = element("button");
    			button30.textContent = "exitAndBalanceMarkets";
    			br25 = element("br");
    			t102 = space();
    			input8 = element("input");
    			t103 = space();
    			button31 = element("button");
    			button31.textContent = "exitMarket";
    			br26 = element("br");
    			t105 = space();
    			div7 = element("div");
    			t106 = text("Token addresses\r\n    ");
    			ul1 = element("ul");
    			li0 = element("li");
    			t107 = text("BOO::");
    			t108 = text(t108_value);
    			t109 = space();
    			li1 = element("li");
    			t110 = text("CREDIT::");
    			t111 = text(t111_value);
    			t112 = space();
    			li2 = element("li");
    			t113 = text("SCREAM::");
    			t114 = text(t114_value);
    			t115 = space();
    			li3 = element("li");
    			t116 = text("TAROT::");
    			t117 = text(t117_value);
    			t118 = space();
    			li4 = element("li");
    			t119 = text("USDC::");
    			t120 = text(t120_value);
    			t121 = space();
    			li5 = element("li");
    			t122 = text("BIFI::");
    			t123 = text(t123_value);
    			t124 = space();
    			li6 = element("li");
    			t125 = text("CRV::");
    			t126 = text(t126_value);
    			t127 = text("\r\n\r\n    SoyFarm addresses\r\n    ");
    			ul2 = element("ul");
    			li7 = element("li");
    			t128 = text("BOO::");
    			t129 = text(t129_value);
    			t130 = space();
    			li8 = element("li");
    			t131 = text("CREDIT::");
    			t132 = text(t132_value);
    			t133 = space();
    			li9 = element("li");
    			t134 = text("SCREAM::");
    			t135 = text(t135_value);
    			t136 = space();
    			li10 = element("li");
    			t137 = text("TAROT::");
    			t138 = text(t138_value);
    			t139 = space();
    			li11 = element("li");
    			t140 = text("USDC::");
    			t141 = text(t141_value);
    			t142 = space();
    			li12 = element("li");
    			t143 = text("BIFI::");
    			t144 = text(t144_value);
    			t145 = space();
    			li13 = element("li");
    			t146 = text("CRV::");
    			t147 = text(t147_value);
    			t148 = space();
    			div8 = element("div");
    			t149 = text("Locker Control");
    			br27 = element("br");
    			t150 = space();
    			input9 = element("input");
    			t151 = space();
    			input10 = element("input");
    			t152 = space();
    			button32 = element("button");
    			button32.textContent = "addStrategy";
    			br28 = element("br");
    			t154 = space();
    			input11 = element("input");
    			t155 = space();
    			button33 = element("button");
    			button33.textContent = "disableStrategy";
    			br29 = element("br");
    			t157 = space();
    			input12 = element("input");
    			t158 = space();
    			button34 = element("button");
    			button34.textContent = "enableStrategy";
    			br30 = element("br");
    			t160 = space();
    			input13 = element("input");
    			t161 = space();
    			input14 = element("input");
    			t162 = space();
    			button35 = element("button");
    			button35.textContent = "changeStrategy";
    			br31 = element("br");
    			add_location(button0, file$3, 515, 4, 20159);
    			add_location(button1, file$3, 516, 4, 20224);
    			add_location(button2, file$3, 517, 4, 20295);
    			add_location(button3, file$3, 518, 4, 20378);
    			add_location(br0, file$3, 522, 4, 20601);
    			add_location(button4, file$3, 523, 4, 20611);
    			add_location(button5, file$3, 524, 4, 20705);
    			attr_dev(div0, "class", "rounded");
    			set_style(div0, "color", "white");
    			set_style(div0, "padding", ".1rem 0");
    			set_style(div0, "width", "0%");
    			set_style(div0, "background", "#3894db");
    			add_location(div0, file$3, 528, 8, 20930);
    			attr_dev(div1, "class", "w-full center bg-white border rounded");
    			add_location(div1, file$3, 527, 4, 20869);
    			add_location(br1, file$3, 532, 4, 21098);
    			html_tag.a = br2;
    			add_location(br2, file$3, 533, 27, 21131);
    			html_tag_1.a = br3;
    			add_location(br3, file$3, 534, 33, 21170);
    			add_location(br4, file$3, 536, 21, 21266);
    			add_location(br5, file$3, 536, 25, 21270);
    			add_location(br6, file$3, 537, 88, 21364);
    			add_location(br7, file$3, 537, 92, 21368);
    			add_location(br8, file$3, 538, 31, 21405);
    			add_location(br9, file$3, 538, 35, 21409);
    			add_location(button6, file$3, 539, 8, 21423);
    			add_location(button7, file$3, 539, 60, 21475);
    			add_location(br10, file$3, 539, 113, 21528);
    			add_location(button8, file$3, 540, 8, 21542);
    			add_location(br11, file$3, 540, 162, 21696);
    			add_location(button9, file$3, 541, 8, 21710);
    			add_location(button10, file$3, 541, 141, 21843);
    			add_location(br12, file$3, 541, 205, 21907);
    			add_location(button11, file$3, 542, 8, 21921);
    			add_location(button12, file$3, 542, 153, 22066);
    			add_location(br13, file$3, 542, 223, 22136);
    			add_location(button13, file$3, 543, 8, 22150);
    			add_location(button14, file$3, 543, 153, 22295);
    			add_location(br14, file$3, 543, 223, 22365);
    			add_location(button15, file$3, 544, 8, 22379);
    			add_location(br15, file$3, 544, 148, 22519);
    			add_location(button16, file$3, 545, 8, 22533);
    			add_location(br16, file$3, 545, 145, 22670);
    			add_location(button17, file$3, 546, 8, 22684);
    			add_location(br17, file$3, 546, 142, 22818);
    			add_location(button18, file$3, 549, 8, 22852);
    			add_location(button19, file$3, 549, 69, 22913);
    			add_location(button20, file$3, 550, 8, 22986);
    			add_location(br18, file$3, 551, 8, 23068);
    			add_location(button21, file$3, 552, 8, 23082);
    			add_location(button22, file$3, 553, 8, 23160);
    			add_location(button23, file$3, 554, 8, 23244);
    			add_location(button24, file$3, 555, 8, 23328);
    			attr_dev(div2, "class", "border bg-white shadow-1 rounded my-1 px-1 py-0_5");
    			add_location(div2, file$3, 535, 4, 21180);
    			attr_dev(div3, "class", "w-full word-break");
    			add_location(div3, file$3, 514, 0, 20122);
    			attr_dev(ul0, "class", "block p-0 m-0 list-none bg-gray border w-full");
    			add_location(ul0, file$3, 558, 0, 23422);
    			attr_dev(div4, "class", "border w-full bg-white shadow");
    			add_location(div4, file$3, 568, 0, 23956);
    			add_location(br19, file$3, 630, 20, 27656);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "token address");
    			attr_dev(input0, "autocomplete", "off");
    			add_location(input0, file$3, 631, 4, 27666);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "strategy address");
    			attr_dev(input1, "autocomplete", "off");
    			add_location(input1, file$3, 632, 4, 27777);
    			add_location(button25, file$3, 633, 4, 27894);
    			add_location(br20, file$3, 633, 65, 27955);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "token address");
    			attr_dev(input2, "autocomplete", "off");
    			add_location(input2, file$3, 634, 4, 27965);
    			add_location(button26, file$3, 635, 4, 28080);
    			add_location(br21, file$3, 635, 73, 28149);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "token address");
    			attr_dev(input3, "autocomplete", "off");
    			add_location(input3, file$3, 636, 4, 28159);
    			add_location(button27, file$3, 637, 4, 28273);
    			add_location(br22, file$3, 637, 71, 28340);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "placeholder", "token address");
    			attr_dev(input4, "autocomplete", "off");
    			add_location(input4, file$3, 638, 4, 28350);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "placeholder", "strategy address");
    			attr_dev(input5, "autocomplete", "off");
    			add_location(input5, file$3, 639, 4, 28464);
    			add_location(button28, file$3, 640, 4, 28584);
    			add_location(br23, file$3, 640, 71, 28651);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "placeholder", "token address");
    			attr_dev(input6, "autocomplete", "off");
    			add_location(input6, file$3, 642, 8, 28689);
    			add_location(button29, file$3, 643, 8, 28804);
    			add_location(br24, file$3, 643, 69, 28865);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "placeholder", "token address");
    			attr_dev(input7, "autocomplete", "off");
    			add_location(input7, file$3, 644, 8, 28879);
    			add_location(button30, file$3, 645, 8, 29004);
    			add_location(br25, file$3, 645, 89, 29085);
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "placeholder", "token address");
    			attr_dev(input8, "autocomplete", "off");
    			add_location(input8, file$3, 646, 8, 29099);
    			add_location(button31, file$3, 647, 8, 29213);
    			add_location(br26, file$3, 647, 67, 29272);
    			attr_dev(div5, "class", "mt-1");
    			add_location(div5, file$3, 641, 4, 28661);
    			attr_dev(div6, "class", "border bg-white shadow-1 rounded my-1 px-1 py-0_5");
    			add_location(div6, file$3, 629, 0, 27571);
    			add_location(li0, file$3, 653, 8, 29402);
    			add_location(li1, file$3, 654, 8, 29452);
    			add_location(li2, file$3, 655, 8, 29508);
    			add_location(li3, file$3, 656, 8, 29564);
    			add_location(li4, file$3, 657, 8, 29618);
    			add_location(li5, file$3, 658, 8, 29670);
    			add_location(li6, file$3, 659, 8, 29722);
    			add_location(ul1, file$3, 652, 4, 29388);
    			add_location(li7, file$3, 664, 8, 29818);
    			add_location(li8, file$3, 665, 8, 29874);
    			add_location(li9, file$3, 666, 8, 29936);
    			add_location(li10, file$3, 667, 8, 29998);
    			add_location(li11, file$3, 668, 8, 30058);
    			add_location(li12, file$3, 669, 8, 30116);
    			add_location(li13, file$3, 670, 8, 30174);
    			add_location(ul2, file$3, 663, 4, 29804);
    			attr_dev(div7, "class", "border bg-white shadow-1 rounded my-1 px-1 py-0_5");
    			add_location(div7, file$3, 650, 0, 29298);
    			add_location(br27, file$3, 674, 18, 30324);
    			attr_dev(input9, "type", "text");
    			attr_dev(input9, "placeholder", "token address");
    			attr_dev(input9, "autocomplete", "off");
    			add_location(input9, file$3, 675, 4, 30334);
    			attr_dev(input10, "type", "text");
    			attr_dev(input10, "placeholder", "strategy address");
    			attr_dev(input10, "autocomplete", "off");
    			add_location(input10, file$3, 676, 4, 30443);
    			add_location(button32, file$3, 677, 4, 30558);
    			add_location(br28, file$3, 677, 63, 30617);
    			attr_dev(input11, "type", "text");
    			attr_dev(input11, "placeholder", "token address");
    			attr_dev(input11, "autocomplete", "off");
    			add_location(input11, file$3, 678, 4, 30627);
    			add_location(button33, file$3, 679, 4, 30740);
    			add_location(br29, file$3, 679, 71, 30807);
    			attr_dev(input12, "type", "text");
    			attr_dev(input12, "placeholder", "token address");
    			attr_dev(input12, "autocomplete", "off");
    			add_location(input12, file$3, 680, 4, 30817);
    			add_location(button34, file$3, 681, 4, 30929);
    			add_location(br30, file$3, 681, 69, 30994);
    			attr_dev(input13, "type", "text");
    			attr_dev(input13, "placeholder", "token address");
    			attr_dev(input13, "autocomplete", "off");
    			add_location(input13, file$3, 682, 4, 31004);
    			attr_dev(input14, "type", "text");
    			attr_dev(input14, "placeholder", "strategy address");
    			attr_dev(input14, "autocomplete", "off");
    			add_location(input14, file$3, 683, 4, 31116);
    			add_location(button35, file$3, 684, 4, 31234);
    			add_location(br31, file$3, 684, 69, 31299);
    			attr_dev(div8, "class", "border bg-white shadow-1 rounded my-1 px-1 py-0_5");
    			add_location(div8, file$3, 673, 0, 30241);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, button0);
    			append_dev(div3, t1);
    			append_dev(div3, button1);
    			append_dev(div3, t3);
    			append_dev(div3, button2);
    			append_dev(div3, t5);
    			append_dev(div3, button3);
    			append_dev(div3, t7);
    			append_dev(div3, br0);
    			append_dev(div3, t8);
    			append_dev(div3, button4);
    			append_dev(div3, t10);
    			append_dev(div3, button5);
    			append_dev(div3, t12);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t13);
    			append_dev(div0, t14);
    			/*div0_binding*/ ctx[78](div0);
    			append_dev(div3, t15);
    			append_dev(div3, br1);
    			append_dev(div3, t16);
    			html_tag.m(/*status*/ ctx[3], div3);
    			append_dev(div3, br2);
    			append_dev(div3, t17);
    			html_tag_1.m(/*tx_status*/ ctx[4], div3);
    			append_dev(div3, br3);
    			append_dev(div3, t18);
    			append_dev(div3, div2);
    			append_dev(div2, t19);
    			append_dev(div2, br4);
    			append_dev(div2, br5);
    			append_dev(div2, t20);
    			append_dev(div2, t21);
    			append_dev(div2, t22);
    			append_dev(div2, br6);
    			append_dev(div2, br7);
    			append_dev(div2, t23);
    			append_dev(div2, t24);
    			append_dev(div2, br8);
    			append_dev(div2, br9);
    			append_dev(div2, t25);
    			append_dev(div2, button6);
    			append_dev(div2, button7);
    			append_dev(div2, t28);
    			append_dev(div2, t29);
    			append_dev(div2, br10);
    			append_dev(div2, t30);
    			append_dev(div2, button8);
    			append_dev(div2, t32);
    			append_dev(div2, t33);
    			append_dev(div2, br11);
    			append_dev(div2, t34);
    			append_dev(div2, button9);
    			append_dev(div2, t36);
    			append_dev(div2, t37);
    			append_dev(div2, t38);
    			append_dev(div2, button10);
    			append_dev(div2, br12);
    			append_dev(div2, t40);
    			append_dev(div2, button11);
    			append_dev(div2, t42);
    			append_dev(div2, t43);
    			append_dev(div2, t44);
    			append_dev(div2, button12);
    			append_dev(div2, br13);
    			append_dev(div2, t46);
    			append_dev(div2, button13);
    			append_dev(div2, t48);
    			append_dev(div2, t49);
    			append_dev(div2, t50);
    			append_dev(div2, button14);
    			append_dev(div2, br14);
    			append_dev(div2, t52);
    			append_dev(div2, button15);
    			append_dev(div2, t54);
    			append_dev(div2, t55);
    			append_dev(div2, br15);
    			append_dev(div2, t56);
    			append_dev(div2, button16);
    			append_dev(div2, t58);
    			append_dev(div2, t59);
    			append_dev(div2, br16);
    			append_dev(div2, t60);
    			append_dev(div2, button17);
    			append_dev(div2, t62);
    			append_dev(div2, t63);
    			append_dev(div2, br17);
    			append_dev(div2, t64);
    			append_dev(div2, button18);
    			append_dev(div2, button19);
    			append_dev(div2, t67);
    			append_dev(div2, button20);
    			append_dev(div2, t69);
    			append_dev(div2, br18);
    			append_dev(div2, t70);
    			append_dev(div2, button21);
    			append_dev(div2, t72);
    			append_dev(div2, button22);
    			append_dev(div2, t74);
    			append_dev(div2, button23);
    			append_dev(div2, t76);
    			append_dev(div2, button24);
    			insert_dev(target, t78, anchor);
    			insert_dev(target, ul0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			insert_dev(target, t79, anchor);
    			insert_dev(target, div4, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			insert_dev(target, t80, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, t81);
    			append_dev(div6, br19);
    			append_dev(div6, t82);
    			append_dev(div6, input0);
    			/*input0_binding*/ ctx[79](input0);
    			append_dev(div6, t83);
    			append_dev(div6, input1);
    			/*input1_binding*/ ctx[80](input1);
    			append_dev(div6, t84);
    			append_dev(div6, button25);
    			append_dev(div6, br20);
    			append_dev(div6, t86);
    			append_dev(div6, input2);
    			/*input2_binding*/ ctx[81](input2);
    			append_dev(div6, t87);
    			append_dev(div6, button26);
    			append_dev(div6, br21);
    			append_dev(div6, t89);
    			append_dev(div6, input3);
    			/*input3_binding*/ ctx[82](input3);
    			append_dev(div6, t90);
    			append_dev(div6, button27);
    			append_dev(div6, br22);
    			append_dev(div6, t92);
    			append_dev(div6, input4);
    			/*input4_binding*/ ctx[83](input4);
    			append_dev(div6, t93);
    			append_dev(div6, input5);
    			/*input5_binding*/ ctx[84](input5);
    			append_dev(div6, t94);
    			append_dev(div6, button28);
    			append_dev(div6, br23);
    			append_dev(div6, t96);
    			append_dev(div6, div5);
    			append_dev(div5, input6);
    			/*input6_binding*/ ctx[85](input6);
    			append_dev(div5, t97);
    			append_dev(div5, button29);
    			append_dev(div5, br24);
    			append_dev(div5, t99);
    			append_dev(div5, input7);
    			/*input7_binding*/ ctx[86](input7);
    			append_dev(div5, t100);
    			append_dev(div5, button30);
    			append_dev(div5, br25);
    			append_dev(div5, t102);
    			append_dev(div5, input8);
    			/*input8_binding*/ ctx[87](input8);
    			append_dev(div5, t103);
    			append_dev(div5, button31);
    			append_dev(div5, br26);
    			insert_dev(target, t105, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, t106);
    			append_dev(div7, ul1);
    			append_dev(ul1, li0);
    			append_dev(li0, t107);
    			append_dev(li0, t108);
    			append_dev(ul1, t109);
    			append_dev(ul1, li1);
    			append_dev(li1, t110);
    			append_dev(li1, t111);
    			append_dev(ul1, t112);
    			append_dev(ul1, li2);
    			append_dev(li2, t113);
    			append_dev(li2, t114);
    			append_dev(ul1, t115);
    			append_dev(ul1, li3);
    			append_dev(li3, t116);
    			append_dev(li3, t117);
    			append_dev(ul1, t118);
    			append_dev(ul1, li4);
    			append_dev(li4, t119);
    			append_dev(li4, t120);
    			append_dev(ul1, t121);
    			append_dev(ul1, li5);
    			append_dev(li5, t122);
    			append_dev(li5, t123);
    			append_dev(ul1, t124);
    			append_dev(ul1, li6);
    			append_dev(li6, t125);
    			append_dev(li6, t126);
    			append_dev(div7, t127);
    			append_dev(div7, ul2);
    			append_dev(ul2, li7);
    			append_dev(li7, t128);
    			append_dev(li7, t129);
    			append_dev(ul2, t130);
    			append_dev(ul2, li8);
    			append_dev(li8, t131);
    			append_dev(li8, t132);
    			append_dev(ul2, t133);
    			append_dev(ul2, li9);
    			append_dev(li9, t134);
    			append_dev(li9, t135);
    			append_dev(ul2, t136);
    			append_dev(ul2, li10);
    			append_dev(li10, t137);
    			append_dev(li10, t138);
    			append_dev(ul2, t139);
    			append_dev(ul2, li11);
    			append_dev(li11, t140);
    			append_dev(li11, t141);
    			append_dev(ul2, t142);
    			append_dev(ul2, li12);
    			append_dev(li12, t143);
    			append_dev(li12, t144);
    			append_dev(ul2, t145);
    			append_dev(ul2, li13);
    			append_dev(li13, t146);
    			append_dev(li13, t147);
    			insert_dev(target, t148, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, t149);
    			append_dev(div8, br27);
    			append_dev(div8, t150);
    			append_dev(div8, input9);
    			/*input9_binding*/ ctx[88](input9);
    			append_dev(div8, t151);
    			append_dev(div8, input10);
    			/*input10_binding*/ ctx[89](input10);
    			append_dev(div8, t152);
    			append_dev(div8, button32);
    			append_dev(div8, br28);
    			append_dev(div8, t154);
    			append_dev(div8, input11);
    			/*input11_binding*/ ctx[90](input11);
    			append_dev(div8, t155);
    			append_dev(div8, button33);
    			append_dev(div8, br29);
    			append_dev(div8, t157);
    			append_dev(div8, input12);
    			/*input12_binding*/ ctx[91](input12);
    			append_dev(div8, t158);
    			append_dev(div8, button34);
    			append_dev(div8, br30);
    			append_dev(div8, t160);
    			append_dev(div8, input13);
    			/*input13_binding*/ ctx[92](input13);
    			append_dev(div8, t161);
    			append_dev(div8, input14);
    			/*input14_binding*/ ctx[93](input14);
    			append_dev(div8, t162);
    			append_dev(div8, button35);
    			append_dev(div8, br31);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*makeMeRich*/ ctx[35], false, false, false),
    					listen_dev(button1, "click", /*launchKeeper*/ ctx[39], false, false, false),
    					listen_dev(button2, "click", /*launchDistribution*/ ctx[40], false, false, false),
    					listen_dev(button3, "click", /*transfer101*/ ctx[53], false, false, false),
    					listen_dev(button4, "click", /*updateKeeperContracts*/ ctx[51], false, false, false),
    					listen_dev(button5, "click", /*updateContract*/ ctx[52], false, false, false),
    					listen_dev(button6, "click", /*createPair*/ ctx[36], false, false, false),
    					listen_dev(button7, "click", /*getPair*/ ctx[37], false, false, false),
    					listen_dev(button8, "click", /*swapFTM2USDC*/ ctx[41], false, false, false),
    					listen_dev(button9, "click", /*swapFTM2BOO*/ ctx[42], false, false, false),
    					listen_dev(button10, "click", /*sendToXBOO*/ ctx[58], false, false, false),
    					listen_dev(button11, "click", /*swapFTM2CREDIT*/ ctx[43], false, false, false),
    					listen_dev(button12, "click", /*sendToXCREDIT*/ ctx[59], false, false, false),
    					listen_dev(button13, "click", /*swapFTM2SCREAM*/ ctx[44], false, false, false),
    					listen_dev(button14, "click", /*sendToXSCREAM*/ ctx[60], false, false, false),
    					listen_dev(button15, "click", /*swapFTM2TAROT*/ ctx[45], false, false, false),
    					listen_dev(button16, "click", /*swapFTM2BIFI*/ ctx[46], false, false, false),
    					listen_dev(button17, "click", /*swapFTM2CRV*/ ctx[47], false, false, false),
    					listen_dev(button18, "click", /*approveLiquidityWJK*/ ctx[50], false, false, false),
    					listen_dev(button19, "click", /*approveLiquidityUSDC*/ ctx[49], false, false, false),
    					listen_dev(button20, "click", /*makeLiquidity*/ ctx[48], false, false, false),
    					listen_dev(button21, "click", /*treasuryDisableBoo*/ ctx[54], false, false, false),
    					listen_dev(button22, "click", /*treasuryDisableCredit*/ ctx[55], false, false, false),
    					listen_dev(button23, "click", /*treasuryDisableScream*/ ctx[56], false, false, false),
    					listen_dev(button24, "click", /*treasuryDisableTarot*/ ctx[57], false, false, false),
    					listen_dev(button25, "click", /*treasuryAddStrategy*/ ctx[61], false, false, false),
    					listen_dev(button26, "click", /*treasuryDisableStrategy*/ ctx[62], false, false, false),
    					listen_dev(button27, "click", /*treasuryEnableStrategy*/ ctx[63], false, false, false),
    					listen_dev(button28, "click", /*treasuryChangeStrategy*/ ctx[64], false, false, false),
    					listen_dev(button29, "click", /*treasuryEnterMarket*/ ctx[65], false, false, false),
    					listen_dev(button30, "click", /*treasuryExitAndBalanceMarkets*/ ctx[66], false, false, false),
    					listen_dev(button31, "click", /*treasuryExitMarket*/ ctx[67], false, false, false),
    					listen_dev(button32, "click", /*lockerAddStrategy*/ ctx[68], false, false, false),
    					listen_dev(button33, "click", /*lockerDisableStrategy*/ ctx[69], false, false, false),
    					listen_dev(button34, "click", /*lockerEnableStrategy*/ ctx[70], false, false, false),
    					listen_dev(button35, "click", /*lockerChangeStrategy*/ ctx[71], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*completed*/ 32768) set_data_dev(t13, /*completed*/ ctx[15]);
    			if (dirty[0] & /*status*/ 8) html_tag.p(/*status*/ ctx[3]);
    			if (dirty[0] & /*tx_status*/ 16) html_tag_1.p(/*tx_status*/ ctx[4]);
    			if (dirty[0] & /*keeper_usdcbalance*/ 4096 && t21_value !== (t21_value = ethers.utils.commify(parseFloat(/*keeper_usdcbalance*/ ctx[12]).toFixed(2)) + "")) set_data_dev(t21, t21_value);
    			if (dirty[0] & /*BOOForxBOO*/ 8192) set_data_dev(t24, /*BOOForxBOO*/ ctx[13]);
    			if (dirty[0] & /*pair*/ 65536) set_data_dev(t29, /*pair*/ ctx[16]);
    			if (dirty[0] & /*usdcBalance*/ 32 && t33_value !== (t33_value = ethers.utils.commify(parseFloat(/*usdcBalance*/ ctx[5]).toFixed(2)) + "")) set_data_dev(t33, t33_value);
    			if (dirty[0] & /*booBalance*/ 64 && t37_value !== (t37_value = ethers.utils.commify(parseFloat(/*booBalance*/ ctx[6]).toFixed(2)) + "")) set_data_dev(t37, t37_value);
    			if (dirty[0] & /*creditBalance*/ 128 && t43_value !== (t43_value = ethers.utils.commify(parseFloat(/*creditBalance*/ ctx[7]).toFixed(2)) + "")) set_data_dev(t43, t43_value);
    			if (dirty[0] & /*screamBalance*/ 256 && t49_value !== (t49_value = ethers.utils.commify(parseFloat(/*screamBalance*/ ctx[8]).toFixed(2)) + "")) set_data_dev(t49, t49_value);
    			if (dirty[0] & /*tarotBalance*/ 512 && t55_value !== (t55_value = ethers.utils.commify(parseFloat(/*tarotBalance*/ ctx[9]).toFixed(2)) + "")) set_data_dev(t55, t55_value);
    			if (dirty[0] & /*bifiBalance*/ 1024 && t59_value !== (t59_value = ethers.utils.commify(parseFloat(/*bifiBalance*/ ctx[10]).toFixed(2)) + "")) set_data_dev(t59, t59_value);
    			if (dirty[0] & /*crvBalance*/ 2048 && t63_value !== (t63_value = ethers.utils.commify(parseFloat(/*crvBalance*/ ctx[11]).toFixed(2)) + "")) set_data_dev(t63, t63_value);

    			if (dirty[0] & /*struct, show*/ 6 | dirty[1] & /*changeTab*/ 2) {
    				each_value_5 = /*struct*/ ctx[1].contracts;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_5(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_5.length;
    			}

    			if (dirty[0] & /*struct, token, show*/ 7 | dirty[1] & /*revokeRole, grantRole, setAddress*/ 140) {
    				each_value = /*struct*/ ctx[1].contracts;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*token*/ 1 && t108_value !== (t108_value = /*token*/ ctx[0].tokens.boo.address + "")) set_data_dev(t108, t108_value);
    			if (dirty[0] & /*token*/ 1 && t111_value !== (t111_value = /*token*/ ctx[0].tokens.credit.address + "")) set_data_dev(t111, t111_value);
    			if (dirty[0] & /*token*/ 1 && t114_value !== (t114_value = /*token*/ ctx[0].tokens.scream.address + "")) set_data_dev(t114, t114_value);
    			if (dirty[0] & /*token*/ 1 && t117_value !== (t117_value = /*token*/ ctx[0].tokens.tarot.address + "")) set_data_dev(t117, t117_value);
    			if (dirty[0] & /*token*/ 1 && t120_value !== (t120_value = /*token*/ ctx[0].tokens.usdc.address + "")) set_data_dev(t120, t120_value);
    			if (dirty[0] & /*token*/ 1 && t123_value !== (t123_value = /*token*/ ctx[0].tokens.bifi.address + "")) set_data_dev(t123, t123_value);
    			if (dirty[0] & /*token*/ 1 && t126_value !== (t126_value = /*token*/ ctx[0].tokens.crv.address + "")) set_data_dev(t126, t126_value);
    			if (dirty[0] & /*token*/ 1 && t129_value !== (t129_value = /*token*/ ctx[0].contracts.boosoy.address + "")) set_data_dev(t129, t129_value);
    			if (dirty[0] & /*token*/ 1 && t132_value !== (t132_value = /*token*/ ctx[0].contracts.creditsoy.address + "")) set_data_dev(t132, t132_value);
    			if (dirty[0] & /*token*/ 1 && t135_value !== (t135_value = /*token*/ ctx[0].contracts.screamsoy.address + "")) set_data_dev(t135, t135_value);
    			if (dirty[0] & /*token*/ 1 && t138_value !== (t138_value = /*token*/ ctx[0].contracts.tarotsoy.address + "")) set_data_dev(t138, t138_value);
    			if (dirty[0] & /*token*/ 1 && t141_value !== (t141_value = /*token*/ ctx[0].contracts.usdcsoy.address + "")) set_data_dev(t141, t141_value);
    			if (dirty[0] & /*token*/ 1 && t144_value !== (t144_value = /*token*/ ctx[0].contracts.bifisoy.address + "")) set_data_dev(t144, t144_value);
    			if (dirty[0] & /*token*/ 1 && t147_value !== (t147_value = /*token*/ ctx[0].contracts.crvsoy.address + "")) set_data_dev(t147, t147_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*div0_binding*/ ctx[78](null);
    			if (detaching) detach_dev(t78);
    			if (detaching) detach_dev(ul0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t79);
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t80);
    			if (detaching) detach_dev(div6);
    			/*input0_binding*/ ctx[79](null);
    			/*input1_binding*/ ctx[80](null);
    			/*input2_binding*/ ctx[81](null);
    			/*input3_binding*/ ctx[82](null);
    			/*input4_binding*/ ctx[83](null);
    			/*input5_binding*/ ctx[84](null);
    			/*input6_binding*/ ctx[85](null);
    			/*input7_binding*/ ctx[86](null);
    			/*input8_binding*/ ctx[87](null);
    			if (detaching) detach_dev(t105);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t148);
    			if (detaching) detach_dev(div8);
    			/*input9_binding*/ ctx[88](null);
    			/*input10_binding*/ ctx[89](null);
    			/*input11_binding*/ ctx[90](null);
    			/*input12_binding*/ ctx[91](null);
    			/*input13_binding*/ ctx[92](null);
    			/*input14_binding*/ ctx[93](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(514:0) {#if typeof token.contracts !== \\\"undefined\\\"}",
    		ctx
    	});

    	return block;
    }

    // (563:8) {:else}
    function create_else_block_3(ctx) {
    	let li;
    	let t0_value = /*s*/ ctx[98].name + "";
    	let t0;
    	let t1;

    	let t2_value = (typeof /*s*/ ctx[98].todo === "undefined"
    	? 0
    	: /*s*/ ctx[98].todo) + "";

    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			attr_dev(li, "class", "inline-block px-0_5 py-0_5 bg-gray hover:bg-gray-light pointer");
    			attr_dev(li, "x", /*x*/ ctx[100]);
    			add_location(li, file$3, 563, 12, 23753);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*changeTab*/ ctx[32], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && t0_value !== (t0_value = /*s*/ ctx[98].name + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*struct*/ 2 && t2_value !== (t2_value = (typeof /*s*/ ctx[98].todo === "undefined"
    			? 0
    			: /*s*/ ctx[98].todo) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(563:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (561:8) {#if show == x}
    function create_if_block_11$1(ctx) {
    	let li;
    	let t0_value = /*s*/ ctx[98].name + "";
    	let t0;
    	let t1;

    	let t2_value = (typeof /*s*/ ctx[98].todo === "undefined"
    	? 0
    	: /*s*/ ctx[98].todo) + "";

    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			attr_dev(li, "class", "inline-block px-0_5 py-0_5 bg-white hover:bg-gray-light pointer");
    			attr_dev(li, "x", /*x*/ ctx[100]);
    			add_location(li, file$3, 561, 12, 23557);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*changeTab*/ ctx[32], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && t0_value !== (t0_value = /*s*/ ctx[98].name + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*struct*/ 2 && t2_value !== (t2_value = (typeof /*s*/ ctx[98].todo === "undefined"
    			? 0
    			: /*s*/ ctx[98].todo) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$1.name,
    		type: "if",
    		source: "(561:8) {#if show == x}",
    		ctx
    	});

    	return block;
    }

    // (560:4) {#each struct.contracts as s, x}
    function create_each_block_5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*show*/ ctx[2] == /*x*/ ctx[100]) return create_if_block_11$1;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
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
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(560:4) {#each struct.contracts as s, x}",
    		ctx
    	});

    	return block;
    }

    // (571:8) {#if show == x}
    function create_if_block_1$1(ctx) {
    	let div;
    	let a;
    	let t0_value = /*s*/ ctx[98].name + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let t2_value = /*token*/ ctx[0].contracts[/*s*/ ctx[98].name].address + "";
    	let t2;
    	let t3;
    	let br0;
    	let br1;
    	let t4;
    	let t5;
    	let each1_anchor;
    	let each_value_3 = /*s*/ ctx[98].functions;
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_1 = /*s*/ ctx[98].roles;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text("=");
    			t2 = text(t2_value);
    			t3 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t4 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    			attr_dev(a, "href", a_href_value = "http://goerli.etherscan.io/address/" + /*token*/ ctx[0].contracts[/*s*/ ctx[98].name].address);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$3, 572, 16, 24111);
    			add_location(br0, file$3, 573, 16, 24270);
    			add_location(br1, file$3, 573, 20, 24274);
    			attr_dev(div, "class", "p-1");
    			add_location(div, file$3, 571, 12, 24076);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, t4);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div, null);
    			}

    			insert_dev(target, t5, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && t0_value !== (t0_value = /*s*/ ctx[98].name + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*token, struct*/ 3 && a_href_value !== (a_href_value = "http://goerli.etherscan.io/address/" + /*token*/ ctx[0].contracts[/*s*/ ctx[98].name].address)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty[0] & /*token, struct*/ 3 && t2_value !== (t2_value = /*token*/ ctx[0].contracts[/*s*/ ctx[98].name].address + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*struct, token*/ 3 | dirty[1] & /*setAddress*/ 128) {
    				each_value_3 = /*s*/ ctx[98].functions;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty[0] & /*struct*/ 2 | dirty[1] & /*revokeRole, grantRole*/ 12) {
    				each_value_1 = /*s*/ ctx[98].roles;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(571:8) {#if show == x}",
    		ctx
    	});

    	return block;
    }

    // (601:53) 
    function create_if_block_10$1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Execute";
    			add_location(button, file$3, 601, 28, 26203);
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
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(601:53) ",
    		ctx
    	});

    	return block;
    }

    // (578:24) {#if f.type == "input"}
    function create_if_block_4$1(ctx) {
    	let each_1_anchor;
    	let each_value_4 = /*f*/ ctx[107].inputs;
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct, token*/ 3 | dirty[1] & /*setAddress*/ 128) {
    				each_value_4 = /*f*/ ctx[107].inputs;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(578:24) {#if f.type == \\\"input\\\"}",
    		ctx
    	});

    	return block;
    }

    // (596:32) {:else}
    function create_else_block_2$1(ctx) {
    	let input;
    	let input_placeholder_value;
    	let input_value_value;
    	let t0;
    	let button;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Execute";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "w-24");
    			attr_dev(input, "placeholder", input_placeholder_value = /*i*/ ctx[110].placeholder);
    			input.value = input_value_value = /*i*/ ctx[110].default;
    			add_location(input, file$3, 596, 36, 25898);
    			add_location(button, file$3, 597, 36, 26018);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && input_placeholder_value !== (input_placeholder_value = /*i*/ ctx[110].placeholder)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty[0] & /*struct*/ 2 && input_value_value !== (input_value_value = /*i*/ ctx[110].default) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(596:32) {:else}",
    		ctx
    	});

    	return block;
    }

    // (583:72) 
    function create_if_block_6$1(ctx) {
    	let input;
    	let input_placeholder_value;
    	let input_value_value;
    	let t;
    	let if_block_anchor;
    	let if_block = typeof /*token*/ ctx[0].contracts[/*s*/ ctx[98].name].call != "undefined" && create_if_block_7$1(ctx);

    	const block = {
    		c: function create() {
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "w-24");
    			attr_dev(input, "placeholder", input_placeholder_value = /*i*/ ctx[110].placeholder);
    			input.value = input_value_value = /*token*/ ctx[0].contracts[/*i*/ ctx[110].default].address;
    			input.disabled = true;
    			add_location(input, file$3, 583, 36, 24865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && input_placeholder_value !== (input_placeholder_value = /*i*/ ctx[110].placeholder)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty[0] & /*token, struct*/ 3 && input_value_value !== (input_value_value = /*token*/ ctx[0].contracts[/*i*/ ctx[110].default].address) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (typeof /*token*/ ctx[0].contracts[/*s*/ ctx[98].name].call != "undefined") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_7$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(583:72) ",
    		ctx
    	});

    	return block;
    }

    // (580:32) {#if i.type == "const"}
    function create_if_block_5$1(ctx) {
    	let input;
    	let input_placeholder_value;
    	let input_value_value;
    	let t0;
    	let button;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Execute";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "w-24");
    			attr_dev(input, "placeholder", input_placeholder_value = /*i*/ ctx[110].placeholder);
    			input.value = input_value_value = /*i*/ ctx[110].default;
    			input.disabled = "true";
    			add_location(input, file$3, 580, 36, 24593);
    			add_location(button, file$3, 581, 36, 24729);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && input_placeholder_value !== (input_placeholder_value = /*i*/ ctx[110].placeholder)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty[0] & /*struct*/ 2 && input_value_value !== (input_value_value = /*i*/ ctx[110].default) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(580:32) {#if i.type == \\\"const\\\"}",
    		ctx
    	});

    	return block;
    }

    // (585:36) {#if typeof token.contracts[s.name].call != "undefined"}
    function create_if_block_7$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (/*i*/ ctx[110].response == null) return create_if_block_8$1;
    		if (/*token*/ ctx[0].contracts[/*i*/ ctx[110].default].address != /*i*/ ctx[110].response) return create_if_block_9$1;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
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
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(585:36) {#if typeof token.contracts[s.name].call != \\\"undefined\\\"}",
    		ctx
    	});

    	return block;
    }

    // (591:44) {:else}
    function create_else_block_1$1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Equals";
    			button.disabled = true;
    			add_location(button, file$3, 591, 48, 25646);
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
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(591:44) {:else}",
    		ctx
    	});

    	return block;
    }

    // (589:44) {#if token.contracts[i.default].address != i.response}
    function create_if_block_9$1(ctx) {
    	let button;
    	let t;
    	let button_fname_value;
    	let button_address_value;
    	let button_command_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Set");
    			attr_dev(button, "fname", button_fname_value = /*s*/ ctx[98].name);
    			attr_dev(button, "address", button_address_value = /*token*/ ctx[0].contracts[/*i*/ ctx[110].default].address);
    			attr_dev(button, "command", button_command_value = /*f*/ ctx[107].name);
    			add_location(button, file$3, 589, 48, 25416);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*setAddress*/ ctx[38], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && button_fname_value !== (button_fname_value = /*s*/ ctx[98].name)) {
    				attr_dev(button, "fname", button_fname_value);
    			}

    			if (dirty[0] & /*token, struct*/ 3 && button_address_value !== (button_address_value = /*token*/ ctx[0].contracts[/*i*/ ctx[110].default].address)) {
    				attr_dev(button, "address", button_address_value);
    			}

    			if (dirty[0] & /*struct*/ 2 && button_command_value !== (button_command_value = /*f*/ ctx[107].name)) {
    				attr_dev(button, "command", button_command_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(589:44) {#if token.contracts[i.default].address != i.response}",
    		ctx
    	});

    	return block;
    }

    // (586:40) {#if i.response == null}
    function create_if_block_8$1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Wait";
    			button.disabled = true;
    			add_location(button, file$3, 586, 44, 25187);
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
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(586:40) {#if i.response == null}",
    		ctx
    	});

    	return block;
    }

    // (579:28) {#each f.inputs as i}
    function create_each_block_4(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*i*/ ctx[110].type == "const") return create_if_block_5$1;
    		if (/*i*/ ctx[110].type == "should-equal-this") return create_if_block_6$1;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
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
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(579:28) {#each f.inputs as i}",
    		ctx
    	});

    	return block;
    }

    // (575:16) {#each s.functions as f}
    function create_each_block_3(ctx) {
    	let div;
    	let t0_value = /*f*/ ctx[107].name + "";
    	let t0;
    	let br;
    	let t1;
    	let t2;

    	function select_block_type_1(ctx, dirty) {
    		if (/*f*/ ctx[107].type == "input") return create_if_block_4$1;
    		if (/*f*/ ctx[107].type == "button") return create_if_block_10$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			br = element("br");
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			add_location(br, file$3, 576, 32, 24394);
    			attr_dev(div, "class", "mt-1");
    			add_location(div, file$3, 575, 20, 24342);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && t0_value !== (t0_value = /*f*/ ctx[107].name + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t2);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(575:16) {#each s.functions as f}",
    		ctx
    	});

    	return block;
    }

    // (618:28) {:else}
    function create_else_block$1(ctx) {
    	let td;
    	let button;
    	let t;
    	let button_fname_value;
    	let button_address_value;
    	let button_keccak____value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			td = element("td");
    			button = element("button");
    			t = text("Grant");
    			attr_dev(button, "fname", button_fname_value = /*s*/ ctx[98].name);
    			attr_dev(button, "address", button_address_value = /*r*/ ctx[104].address);
    			attr_dev(button, "keccak256", button_keccak____value = /*r*/ ctx[104].keccak256);
    			add_location(button, file$3, 618, 47, 27204);
    			attr_dev(td, "class", "px-0_5");
    			add_location(td, file$3, 618, 28, 27185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*grantRole*/ ctx[33], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && button_fname_value !== (button_fname_value = /*s*/ ctx[98].name)) {
    				attr_dev(button, "fname", button_fname_value);
    			}

    			if (dirty[0] & /*struct*/ 2 && button_address_value !== (button_address_value = /*r*/ ctx[104].address)) {
    				attr_dev(button, "address", button_address_value);
    			}

    			if (dirty[0] & /*struct*/ 2 && button_keccak____value !== (button_keccak____value = /*r*/ ctx[104].keccak256)) {
    				attr_dev(button, "keccak256", button_keccak____value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(618:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (616:63) 
    function create_if_block_3$1(ctx) {
    	let td;
    	let button;

    	const block = {
    		c: function create() {
    			td = element("td");
    			button = element("button");
    			button.textContent = "Wait";
    			button.disabled = true;
    			add_location(button, file$3, 616, 47, 27083);
    			attr_dev(td, "class", "px-0_5");
    			add_location(td, file$3, 616, 28, 27064);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, button);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(616:63) ",
    		ctx
    	});

    	return block;
    }

    // (614:28) {#if r.response == true}
    function create_if_block_2$1(ctx) {
    	let td;
    	let button;
    	let t;
    	let button_fname_value;
    	let button_address_value;
    	let button_keccak____value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			td = element("td");
    			button = element("button");
    			t = text("Revoke");
    			attr_dev(button, "fname", button_fname_value = /*s*/ ctx[98].name);
    			attr_dev(button, "address", button_address_value = /*r*/ ctx[104].address);
    			attr_dev(button, "keccak256", button_keccak____value = /*r*/ ctx[104].keccak256);
    			add_location(button, file$3, 614, 47, 26852);
    			attr_dev(td, "class", "px-0_5");
    			add_location(td, file$3, 614, 28, 26833);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*revokeRole*/ ctx[34], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && button_fname_value !== (button_fname_value = /*s*/ ctx[98].name)) {
    				attr_dev(button, "fname", button_fname_value);
    			}

    			if (dirty[0] & /*struct*/ 2 && button_address_value !== (button_address_value = /*r*/ ctx[104].address)) {
    				attr_dev(button, "address", button_address_value);
    			}

    			if (dirty[0] & /*struct*/ 2 && button_keccak____value !== (button_keccak____value = /*r*/ ctx[104].keccak256)) {
    				attr_dev(button, "keccak256", button_keccak____value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(614:28) {#if r.response == true}",
    		ctx
    	});

    	return block;
    }

    // (610:20) {#each role.result as r}
    function create_each_block_2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*r*/ ctx[104].name + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*r*/ ctx[104].address + "";
    	let t2;
    	let t3;
    	let t4;
    	let td2;
    	let t5_value = /*r*/ ctx[104].response + "";
    	let t5;

    	function select_block_type_4(ctx, dirty) {
    		if (/*r*/ ctx[104].response == true) return create_if_block_2$1;
    		if (/*r*/ ctx[104].response == "Updating") return create_if_block_3$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			if_block.c();
    			t4 = space();
    			td2 = element("td");
    			t5 = text(t5_value);
    			attr_dev(td0, "class", "px-0_5");
    			add_location(td0, file$3, 611, 28, 26652);
    			attr_dev(td1, "class", "px-0_5");
    			add_location(td1, file$3, 612, 28, 26714);
    			attr_dev(td2, "class", "px-0_5 w-5");
    			add_location(td2, file$3, 620, 28, 27384);
    			add_location(tr, file$3, 610, 24, 26618);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			if_block.m(tr, null);
    			append_dev(tr, t4);
    			append_dev(tr, td2);
    			append_dev(td2, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && t0_value !== (t0_value = /*r*/ ctx[104].name + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*struct*/ 2 && t2_value !== (t2_value = /*r*/ ctx[104].address + "")) set_data_dev(t2, t2_value);

    			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(tr, t4);
    				}
    			}

    			if (dirty[0] & /*struct*/ 2 && t5_value !== (t5_value = /*r*/ ctx[104].response + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(610:20) {#each role.result as r}",
    		ctx
    	});

    	return block;
    }

    // (607:12) {#each s.roles as role}
    function create_each_block_1$1(ctx) {
    	let table;
    	let tr;
    	let td;
    	let t0_value = /*role*/ ctx[101].name + "";
    	let t0;
    	let t1;
    	let t2_value = /*role*/ ctx[101].count + "";
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let each_value_2 = /*role*/ ctx[101].result;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr = element("tr");
    			td = element("td");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			attr_dev(td, "colspan", "99");
    			attr_dev(td, "class", "bg-gray white p-0_5");
    			add_location(td, file$3, 608, 24, 26465);
    			add_location(tr, file$3, 608, 20, 26461);
    			attr_dev(table, "class", "w-full border-0 mt-1 border-spacing-0");
    			add_location(table, file$3, 607, 16, 26386);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);
    			append_dev(tr, td);
    			append_dev(td, t0);
    			append_dev(td, t1);
    			append_dev(td, t2);
    			append_dev(td, t3);
    			append_dev(table, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			append_dev(table, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*struct*/ 2 && t0_value !== (t0_value = /*role*/ ctx[101].name + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*struct*/ 2 && t2_value !== (t2_value = /*role*/ ctx[101].count + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*struct*/ 2 | dirty[1] & /*revokeRole, grantRole*/ 12) {
    				each_value_2 = /*role*/ ctx[101].result;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, t5);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(607:12) {#each s.roles as role}",
    		ctx
    	});

    	return block;
    }

    // (570:4) {#each struct.contracts as s, x}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*show*/ ctx[2] == /*x*/ ctx[100] && create_if_block_1$1(ctx);

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
    			if (/*show*/ ctx[2] == /*x*/ ctx[100]) {
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(570:4) {#each struct.contracts as s, x}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let h1;
    	let t1;
    	let if_block_anchor;
    	let if_block = typeof /*token*/ ctx[0].contracts !== "undefined" && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Admin Panel";
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h1, file$3, 511, 0, 20052);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (typeof /*token*/ ctx[0].contracts !== "undefined") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	validate_slots('Admin', slots, []);
    	let { account } = $$props;
    	let { token } = $$props;
    	let { signer } = $$props;
    	let { provider } = $$props;
    	let { connected } = $$props;
    	let { nonce } = $$props;
    	let { stakelocker } = $$props;
    	let treasury;
    	let show = 0;
    	let status = "Waiting for new status";
    	let tx_status = "None";

    	let usdcBalance = "0",
    		booBalance = "0",
    		creditBalance = "0",
    		screamBalance = "0",
    		tarotBalance = "0",
    		bifiBalance = "0",
    		crvBalance = "0",
    		keeper_usdcbalance = "0",
    		BOOForxBOO = "0",
    		snonce = 0,
    		missiles,
    		completed = 0;

    	setInterval(
    		() => {
    			if (snonce > 0) {
    				let z = nonce - snonce;
    				let c = 100 / (32 / z);
    				$$invalidate(14, missiles.style.width = c + "%", missiles);
    				$$invalidate(15, completed = c.toFixed(0));

    				if (snonce + 32 == nonce) {
    					snonce = 0;
    					$$invalidate(15, completed = 0);
    				}
    			}
    		},
    		1000
    	);

    	async function init() {
    		if (typeof token.contracts !== "undefined") {
    			treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, signer);
    			let y = 0, name;
    			let collector = [], index = 0;

    			for (let x in struct.contracts) {
    				let differ;

    				for (let q in struct.contracts[x].roles) for (let z in struct.contracts[x].roles[q].target) {
    					differ = struct.contracts[x].roles[q].target[z].split(".");

    					$$invalidate(
    						1,
    						struct.contracts[x].roles[q].result[z] = {
    							name: struct.contracts[x].roles[q].target[z],
    							address: token[differ[0]][differ[1]].address,
    							response: "Updating"
    						},
    						struct
    					);
    				}

    				for (let z in struct.contracts[x].functions) for (let k in struct.contracts[x].functions[z].inputs) if (struct.contracts[x].functions[z].inputs[k].type == "should-equal-this") $$invalidate(1, struct.contracts[x].functions[z].inputs[k].response = null, struct);
    			}

    			for (let x in struct.contracts) {
    				$$invalidate(1, struct.contracts[x].id = y++, struct);
    				$$invalidate(1, struct.contracts[x].show = false, struct);

    				// Storing pointers
    				name = struct.contracts[x].name;

    				$$invalidate(0, token.contracts[name].call = new ethers.Contract(token.contracts[name].address, token.contracts[name].abi, signer), token);

    				// setAddress
    				for (let z in struct.contracts[x].functions) for (let k in struct.contracts[x].functions[z].inputs) if (struct.contracts[x].functions[z].inputs[k].type == "should-equal-this") collector[index++] = token.contracts[name].call[struct.contracts[x].functions[z].inputs[k].equal]();

    				// Getting .roles[q].results
    				let differ;

    				for (let q in struct.contracts[x].roles) {
    					for (let z in struct.contracts[x].roles[q].target) {
    						differ = struct.contracts[x].roles[q].target[z].split(".");

    						$$invalidate(
    							1,
    							struct.contracts[x].roles[q].result[z] = {
    								name: struct.contracts[x].roles[q].target[z],
    								address: token[differ[0]][differ[1]].address,
    								keccak256: struct.contracts[x].roles[q].keccak256,
    								response: null
    							},
    							struct
    						);

    						collector[index++] = token.contracts[name].call.hasRole(struct.contracts[x].roles[q].keccak256, token[differ[0]][differ[1]].address);
    					}

    					collector[index++] = token.contracts[name].call.getRoleMemberCount(struct.contracts[x].roles[q].keccak256);
    				}
    			}

    			Promise.all(collector).then(values => {
    				index = 0;

    				for (let x in struct.contracts) {
    					$$invalidate(1, struct.contracts[x].todo = 0, struct);

    					for (let z in struct.contracts[x].functions) {
    						for (let k in struct.contracts[x].functions[z].inputs) {
    							if (struct.contracts[x].functions[z].inputs[k].type == "should-equal-this") {
    								$$invalidate(1, struct.contracts[x].functions[z].inputs[k].response = values[index], struct);
    								if (values[index] !== token.contracts[struct.contracts[x].functions[z].inputs[k].default].address) $$invalidate(1, struct.contracts[x].todo++, struct);
    								index++;
    							}
    						}
    					}

    					for (let q in struct.contracts[x].roles) {
    						for (let z in struct.contracts[x].roles[q].target) {
    							struct.contracts[x].roles[q].target[z].split(".");
    							$$invalidate(1, struct.contracts[x].roles[q].result[z].response = values[index], struct);
    							if (!values[index]) $$invalidate(1, struct.contracts[x].todo++, struct);
    							index++;
    						}

    						$$invalidate(1, struct.contracts[x].roles[q].count = values[index++], struct);
    					}
    				}
    			});

    			const usdc = new ethers.Contract(token.tokens.usdc.address, token.tokens.usdc.abi, provider);
    			$$invalidate(5, usdcBalance = ethers.utils.formatUnits(await usdc.balanceOf(account.address), 6));
    			const boo = new ethers.Contract(token.tokens.boo.address, token.tokens.boo.abi, provider);
    			$$invalidate(6, booBalance = ethers.utils.formatUnits(await boo.balanceOf(account.address), 18));
    			const credit = new ethers.Contract(token.tokens.credit.address, token.tokens.credit.abi, provider);
    			$$invalidate(7, creditBalance = ethers.utils.formatUnits(await credit.balanceOf(account.address), 18));
    			const scream = new ethers.Contract(token.tokens.scream.address, token.tokens.scream.abi, provider);
    			$$invalidate(8, screamBalance = ethers.utils.formatUnits(await scream.balanceOf(account.address), 18));
    			const tarot = new ethers.Contract(token.tokens.tarot.address, token.tokens.tarot.abi, provider);
    			$$invalidate(9, tarotBalance = ethers.utils.formatUnits(await tarot.balanceOf(account.address), 18));
    			const bifi = new ethers.Contract(token.tokens.bifi.address, token.tokens.bifi.abi, provider);
    			$$invalidate(10, bifiBalance = ethers.utils.formatUnits(await bifi.balanceOf(account.address), 18));
    			const crv = new ethers.Contract(token.tokens.crv.address, token.tokens.crv.abi, provider);
    			$$invalidate(11, crvBalance = ethers.utils.formatUnits(await crv.balanceOf(account.address), 18));
    			$$invalidate(12, keeper_usdcbalance = ethers.utils.formatUnits(await usdc.balanceOf(token.contracts.keeper.address), 6));
    			const xboo = new ethers.Contract(token.tokens.xboo.address, token.tokens.xboo.abi, provider);
    			$$invalidate(13, BOOForxBOO = ethers.utils.formatUnits(await xboo.BOOForxBOO(ethers.utils.parseUnits("1")), 18));
    			$$invalidate(1, struct.contracts[0].show = true, struct);
    		}
    	}

    	if (connected) init();
    	window.dispatch = () => init();

    	function changeTab() {
    		$$invalidate(2, show = parseInt(this.getAttribute("x")));
    	}

    	async function grantRole() {
    		let fname = this.getAttribute("fname");
    		let address = this.getAttribute("address");
    		let keccak256 = this.getAttribute("keccak256");

    		try {
    			$$invalidate(4, tx_status = "Waiting for tx confirm");
    			const tx = await token.contracts[fname].call.grantRole(keccak256, address);
    			$$invalidate(4, tx_status = "Processing tx <a href='https://goerli.etherscan.io/tx/" + tx.hash + "' target='_blank'>" + tx.hash + "</a>");
    			await tx.wait();
    			$$invalidate(4, tx_status = "tx finished <a href='https://goerli.etherscan.io/tx/" + tx.hash + "' target='_blank'>" + tx.hash + "</a>");
    		} catch(error) {
    			$$invalidate(4, tx_status = error);
    		}
    	}

    	async function revokeRole() {
    		let fname = this.getAttribute("fname");
    		let address = this.getAttribute("address");
    		let keccak256 = this.getAttribute("keccak256");

    		try {
    			$$invalidate(4, tx_status = "Waiting for tx confirm");
    			const tx = await token.contracts[fname].call.revokeRole(keccak256, address);
    			$$invalidate(4, tx_status = "Processing tx <a href='https://goerli.etherscan.io/tx/" + tx.hash + "' target='_blank'>" + tx.hash + "</a>");
    			await tx.wait();
    			$$invalidate(4, tx_status = "tx finished <a href='https://goerli.etherscan.io/tx/" + tx.hash + "' target='_blank'>" + tx.hash + "</a>");
    		} catch(error) {
    			$$invalidate(4, tx_status = error);
    		}
    	}

    	const gUSDC = new ethers.Contract("0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C", ["function allocateTo(address _owner, uint256 value) public"], signer);

    	async function makeMeRich() {
    		try {
    			const tx = await gUSDC.allocateTo("0xB14Ba501390A89A9E8e6C4E2f8ef95e3124B2119", ethers.utils.parseUnits("200000000.0", 6));
    			await tx.wait();
    		} catch(error) {
    			$$invalidate(3, status = error);
    		}
    	}

    	let pair = "0x0";

    	async function createPair() {
    		const factory = new ethers.Contract(token.swap.factory.address, token.swap.factory.abi, signer);
    		const tx = await factory.createPair(token.contracts.token.address, token.tokens.usdc.address);
    		await tx.wait();
    	}

    	async function getPair() {
    		const factory = new ethers.Contract(token.swap.factory.address, token.swap.factory.abi, signer);
    		$$invalidate(16, pair = await factory.getPair(token.contracts.token.address, token.tokens.usdc.address));
    	}

    	async function setAddress() {
    		let fname = this.getAttribute("fname");
    		let address = this.getAttribute("address");
    		let command = this.getAttribute("command");
    		await token.contracts[fname].call[command](address);
    	}

    	async function launchKeeper() {
    		try {
    			console.log("Trying to perform a keep");
    			const keeper = new ethers.Contract(token.contracts.keeper.address, token.contracts.keeper.abi, signer);
    			const tx = await keeper.performUpkeep("0x0000000000000000000000000000000000000000000000000000000000000000");
    			$$invalidate(3, status = "Tx hash: " + tx.hash);
    		} catch(error) {
    			console.log(error);
    		}
    	}

    	async function launchDistribution() {
    		try {
    			console.log("Trying to perform a distribution");
    			const keeper = new ethers.Contract(token.contracts.keeper.address, token.contracts.keeper.abi, signer);
    			const tx = await keeper.distributeRewards();
    			$$invalidate(3, status = "Tx hash: " + tx.hash);
    		} catch(error) {
    			console.log(error);
    		}
    	}

    	// const TARGETS = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TARGETS"))
    	// console.log("TARGETS="+TARGETS)
    	async function swapFTM2USDC() {
    		const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer);

    		await router.swapExactETHForTokens(0, [token.tokens.wftm.address, token.tokens.usdc.address], account.address, Date.now() + 1000 * 60 * 10, {
    			value: ethers.utils.parseEther("7000000"),
    			gasLimit: 310000,
    			gasPrice: provider.getGasPrice()
    		});
    	}

    	async function swapFTM2BOO() {
    		const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer);

    		await router.swapExactETHForTokens(0, [token.tokens.wftm.address, token.tokens.boo.address], account.address, Date.now() + 1000 * 60 * 10, {
    			value: ethers.utils.parseEther("1000000"),
    			gasLimit: 310000,
    			gasPrice: provider.getGasPrice()
    		});
    	}

    	async function swapFTM2CREDIT() {
    		const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer);

    		await router.swapExactETHForTokens(0, [token.tokens.wftm.address, token.tokens.credit.address], account.address, Date.now() + 1000 * 60 * 10, {
    			value: ethers.utils.parseEther("1000000"),
    			gasLimit: 310000,
    			gasPrice: provider.getGasPrice()
    		});
    	}

    	async function swapFTM2SCREAM() {
    		const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer);

    		await router.swapExactETHForTokens(0, [token.tokens.wftm.address, token.tokens.scream.address], account.address, Date.now() + 1000 * 60 * 10, {
    			value: ethers.utils.parseEther("1000000"),
    			gasLimit: 310000,
    			gasPrice: provider.getGasPrice()
    		});
    	}

    	async function swapFTM2TAROT() {
    		const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer);

    		await router.swapExactETHForTokens(0, [token.tokens.wftm.address, token.tokens.tarot.address], account.address, Date.now() + 1000 * 60 * 10, {
    			value: ethers.utils.parseEther("1000000"),
    			gasLimit: 310000,
    			gasPrice: provider.getGasPrice()
    		});
    	}

    	async function swapFTM2BIFI() {
    		const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer);

    		await router.swapExactETHForTokens(0, [token.tokens.wftm.address, token.tokens.bifi.address], account.address, Date.now() + 1000 * 60 * 10, {
    			value: ethers.utils.parseEther("1000000"),
    			gasLimit: 310000,
    			gasPrice: provider.getGasPrice()
    		});
    	}

    	async function swapFTM2CRV() {
    		const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer);

    		await router.swapExactETHForTokens(0, [token.tokens.wftm.address, token.tokens.crv.address], account.address, Date.now() + 1000 * 60 * 10, {
    			value: ethers.utils.parseEther("1000000"),
    			gasLimit: 310000,
    			gasPrice: provider.getGasPrice()
    		});
    	}

    	async function makeLiquidity() {
    		const router = new ethers.Contract(token.swap.router.address, token.swap.router.abi, signer);
    		await router.addLiquidity(token.contracts.token.address, token.tokens.usdc.address, ethers.utils.parseUnits("88000000", 18), ethers.utils.parseUnits("8800000", 6), 0, 0, token.contracts.keeper.address, Date.now() + 1000 * 60 * 10);
    	}

    	async function approveLiquidityUSDC() {
    		const usdc = new ethers.Contract(token.tokens.usdc.address, token.tokens.usdc.abi, signer);
    		await usdc.approve(token.swap.router.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    	}

    	async function approveLiquidityWJK() {
    		const wjk = new ethers.Contract(token.contracts.token.address, token.contracts.token.abi, signer);
    		await wjk.approve(token.swap.router.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    	}

    	async function updateKeeperContracts() {
    		try {
    			const c = new ethers.Contract(token.contracts.manager.address, token.contracts.manager.abi, signer);
    			await c.updateKeeperContracts();
    		} catch(error) {
    			console.log(error);
    		}
    	}

    	async function updateContract() {
    		try {
    			const c = new ethers.Contract(token.contracts.manager.address, token.contracts.manager.abi, signer);
    			await c.updateContract();
    		} catch(error) {
    			console.log(error);
    		}
    	}

    	// let tt
    	// function start() {
    	//     let n = nonce
    	//     clearInterval(tt)
    	//     tt = setInterval(async () => {
    	//         const keeper = new ethers.Contract(token.contracts.keeper.address, token.contracts.keeper.abi, signer)
    	//         try {
    	//             await keeper.distributeRewards({ nonce: n++ })
    	//         } catch (e) {}
    	//     }, 15000)
    	// }
    	// function stop() {
    	//     clearInterval(tt)
    	// }
    	function transfer101() {
    		const usdc = new ethers.Contract(token.tokens.usdc.address, token.tokens.usdc.abi, signer);
    		usdc.transfer(token.contracts.keeper.address, ethers.utils.parseUnits("1000000", 6));
    	}

    	function treasuryDisableBoo() {
    		const treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, signer);
    		treasury.disableStrategy(token.tokens.boo.address);
    	}

    	function treasuryDisableCredit() {
    		const treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, signer);
    		treasury.disableStrategy(token.tokens.credit.address);
    	}

    	function treasuryDisableScream() {
    		const treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, signer);
    		treasury.disableStrategy(token.tokens.scream.address);
    	}

    	function treasuryDisableTarot() {
    		const treasury = new ethers.Contract(token.contracts.treasury.address, token.contracts.treasury.abi, signer);
    		treasury.disableStrategy(token.tokens.tarot.address);
    	}

    	function sendToXBOO() {
    		const boo = new ethers.Contract(token.tokens.boo.address, token.tokens.boo.abi, signer);
    		boo.transfer(token.contracts.boosoy.ib, ethers.utils.parseUnits("2000"));
    	}

    	function sendToXCREDIT() {
    		const credit = new ethers.Contract(token.tokens.credit.address, token.tokens.credit.abi, signer);
    		credit.transfer(token.contracts.creditsoy.ib, ethers.utils.parseUnits("2000"));
    	}

    	function sendToXSCREAM() {
    		const scream = new ethers.Contract(token.tokens.scream.address, token.tokens.scream.abi, signer);
    		scream.transfer(token.contracts.screamsoy.ib, ethers.utils.parseUnits("300"));
    	}

    	/*************************/
    	///////// TREASURY ////////
    	/*************************/
    	let treasuryAddStrategyToken, treasuryAddStrategyStrategy;

    	async function treasuryAddStrategy() {
    		const tokenAddress = treasuryAddStrategyToken.value;
    		const strategyAddress = treasuryAddStrategyStrategy.value;
    		await treasury.addStrategy(tokenAddress, strategyAddress);
    	}

    	let treasuryDisableStrategyToken;

    	async function treasuryDisableStrategy() {
    		const tokenAddress = treasuryDisableStrategyToken.value;
    		await treasury.disableStrategy(tokenAddress);
    	}

    	let treasuryEnableStrategyToken;

    	async function treasuryEnableStrategy() {
    		const tokenAddress = treasuryEnableStrategyToken.value;
    		await treasury.enableStrategy(tokenAddress);
    	}

    	let treasuryChangeStrategyToken, treasuryChangeStrategyStrategy;

    	async function treasuryChangeStrategy() {
    		const tokenAddress = treasuryChangeStrategyToken.value;
    		const strategyAddress = treasuryChangeStrategyStrategy.value;
    		await treasury.changeStrategy(tokenAddress, strategyAddress);
    	}

    	let treasuryEnterMarketToken;

    	async function treasuryEnterMarket() {
    		const tokenAddress = treasuryEnterMarketToken.value;
    		await treasury.enterMarket(tokenAddress);
    	}

    	let treasuryExitAndBalanceMarketsToken;

    	async function treasuryExitAndBalanceMarkets() {
    		const tokenAddress = treasuryExitAndBalanceMarketsToken.value;
    		await treasury.exitAndBalanceMarkets(tokenAddress);
    	}

    	let treasuryExitMarketToken;

    	async function treasuryExitMarket() {
    		const tokenAddress = treasuryExitMarketToken.value;
    		await treasury.exitMarket(tokenAddress);
    	}

    	/*************************/
    	///////// LOCKER //////////
    	/*************************/
    	let lockerAddStrategyToken, lockerAddStrategyStrategy;

    	async function lockerAddStrategy() {
    		const tokenAddress = lockerAddStrategyToken.value;
    		const strategyAddress = lockerAddStrategyStrategy.value;
    		await stakelocker.addStrategy(tokenAddress, strategyAddress);
    	}

    	let lockerDisableStrategyToken;

    	async function lockerDisableStrategy() {
    		const tokenAddress = lockerDisableStrategyToken.value;
    		await stakelocker.disableStrategy(tokenAddress);
    	}

    	let lockerEnableStrategyToken;

    	async function lockerEnableStrategy() {
    		const tokenAddress = lockerEnableStrategyToken.value;
    		await stakelocker.enableStrategy(tokenAddress);
    	}

    	let lockerChangeStrategyToken, lockerChangeStrategyStrategy;

    	async function lockerChangeStrategy() {
    		const tokenAddress = lockerChangeStrategyToken.value;
    		const strategyAddress = lockerChangeStrategyStrategy.value;
    		await stakelocker.changeStrategy(tokenAddress, strategyAddress);
    	}

    	const writable_props = ['account', 'token', 'signer', 'provider', 'connected', 'nonce', 'stakelocker'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Admin> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			missiles = $$value;
    			$$invalidate(14, missiles);
    		});
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			treasuryAddStrategyToken = $$value;
    			$$invalidate(17, treasuryAddStrategyToken);
    		});
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			treasuryAddStrategyStrategy = $$value;
    			$$invalidate(18, treasuryAddStrategyStrategy);
    		});
    	}

    	function input2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			treasuryDisableStrategyToken = $$value;
    			$$invalidate(19, treasuryDisableStrategyToken);
    		});
    	}

    	function input3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			treasuryEnableStrategyToken = $$value;
    			$$invalidate(20, treasuryEnableStrategyToken);
    		});
    	}

    	function input4_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			treasuryChangeStrategyToken = $$value;
    			$$invalidate(21, treasuryChangeStrategyToken);
    		});
    	}

    	function input5_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			treasuryChangeStrategyStrategy = $$value;
    			$$invalidate(22, treasuryChangeStrategyStrategy);
    		});
    	}

    	function input6_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			treasuryEnterMarketToken = $$value;
    			$$invalidate(23, treasuryEnterMarketToken);
    		});
    	}

    	function input7_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			treasuryExitAndBalanceMarketsToken = $$value;
    			$$invalidate(24, treasuryExitAndBalanceMarketsToken);
    		});
    	}

    	function input8_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			treasuryExitMarketToken = $$value;
    			$$invalidate(25, treasuryExitMarketToken);
    		});
    	}

    	function input9_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			lockerAddStrategyToken = $$value;
    			$$invalidate(26, lockerAddStrategyToken);
    		});
    	}

    	function input10_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			lockerAddStrategyStrategy = $$value;
    			$$invalidate(27, lockerAddStrategyStrategy);
    		});
    	}

    	function input11_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			lockerDisableStrategyToken = $$value;
    			$$invalidate(28, lockerDisableStrategyToken);
    		});
    	}

    	function input12_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			lockerEnableStrategyToken = $$value;
    			$$invalidate(29, lockerEnableStrategyToken);
    		});
    	}

    	function input13_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			lockerChangeStrategyToken = $$value;
    			$$invalidate(30, lockerChangeStrategyToken);
    		});
    	}

    	function input14_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			lockerChangeStrategyStrategy = $$value;
    			$$invalidate(31, lockerChangeStrategyStrategy);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('account' in $$props) $$invalidate(72, account = $$props.account);
    		if ('token' in $$props) $$invalidate(0, token = $$props.token);
    		if ('signer' in $$props) $$invalidate(73, signer = $$props.signer);
    		if ('provider' in $$props) $$invalidate(74, provider = $$props.provider);
    		if ('connected' in $$props) $$invalidate(75, connected = $$props.connected);
    		if ('nonce' in $$props) $$invalidate(76, nonce = $$props.nonce);
    		if ('stakelocker' in $$props) $$invalidate(77, stakelocker = $$props.stakelocker);
    	};

    	$$self.$capture_state = () => ({
    		account,
    		token,
    		signer,
    		provider,
    		connected,
    		nonce,
    		stakelocker,
    		struct,
    		treasury,
    		show,
    		status,
    		tx_status,
    		usdcBalance,
    		booBalance,
    		creditBalance,
    		screamBalance,
    		tarotBalance,
    		bifiBalance,
    		crvBalance,
    		keeper_usdcbalance,
    		BOOForxBOO,
    		snonce,
    		missiles,
    		completed,
    		init,
    		changeTab,
    		grantRole,
    		revokeRole,
    		gUSDC,
    		makeMeRich,
    		pair,
    		createPair,
    		getPair,
    		setAddress,
    		launchKeeper,
    		launchDistribution,
    		swapFTM2USDC,
    		swapFTM2BOO,
    		swapFTM2CREDIT,
    		swapFTM2SCREAM,
    		swapFTM2TAROT,
    		swapFTM2BIFI,
    		swapFTM2CRV,
    		makeLiquidity,
    		approveLiquidityUSDC,
    		approveLiquidityWJK,
    		updateKeeperContracts,
    		updateContract,
    		transfer101,
    		treasuryDisableBoo,
    		treasuryDisableCredit,
    		treasuryDisableScream,
    		treasuryDisableTarot,
    		sendToXBOO,
    		sendToXCREDIT,
    		sendToXSCREAM,
    		treasuryAddStrategyToken,
    		treasuryAddStrategyStrategy,
    		treasuryAddStrategy,
    		treasuryDisableStrategyToken,
    		treasuryDisableStrategy,
    		treasuryEnableStrategyToken,
    		treasuryEnableStrategy,
    		treasuryChangeStrategyToken,
    		treasuryChangeStrategyStrategy,
    		treasuryChangeStrategy,
    		treasuryEnterMarketToken,
    		treasuryEnterMarket,
    		treasuryExitAndBalanceMarketsToken,
    		treasuryExitAndBalanceMarkets,
    		treasuryExitMarketToken,
    		treasuryExitMarket,
    		lockerAddStrategyToken,
    		lockerAddStrategyStrategy,
    		lockerAddStrategy,
    		lockerDisableStrategyToken,
    		lockerDisableStrategy,
    		lockerEnableStrategyToken,
    		lockerEnableStrategy,
    		lockerChangeStrategyToken,
    		lockerChangeStrategyStrategy,
    		lockerChangeStrategy
    	});

    	$$self.$inject_state = $$props => {
    		if ('account' in $$props) $$invalidate(72, account = $$props.account);
    		if ('token' in $$props) $$invalidate(0, token = $$props.token);
    		if ('signer' in $$props) $$invalidate(73, signer = $$props.signer);
    		if ('provider' in $$props) $$invalidate(74, provider = $$props.provider);
    		if ('connected' in $$props) $$invalidate(75, connected = $$props.connected);
    		if ('nonce' in $$props) $$invalidate(76, nonce = $$props.nonce);
    		if ('stakelocker' in $$props) $$invalidate(77, stakelocker = $$props.stakelocker);
    		if ('treasury' in $$props) treasury = $$props.treasury;
    		if ('show' in $$props) $$invalidate(2, show = $$props.show);
    		if ('status' in $$props) $$invalidate(3, status = $$props.status);
    		if ('tx_status' in $$props) $$invalidate(4, tx_status = $$props.tx_status);
    		if ('usdcBalance' in $$props) $$invalidate(5, usdcBalance = $$props.usdcBalance);
    		if ('booBalance' in $$props) $$invalidate(6, booBalance = $$props.booBalance);
    		if ('creditBalance' in $$props) $$invalidate(7, creditBalance = $$props.creditBalance);
    		if ('screamBalance' in $$props) $$invalidate(8, screamBalance = $$props.screamBalance);
    		if ('tarotBalance' in $$props) $$invalidate(9, tarotBalance = $$props.tarotBalance);
    		if ('bifiBalance' in $$props) $$invalidate(10, bifiBalance = $$props.bifiBalance);
    		if ('crvBalance' in $$props) $$invalidate(11, crvBalance = $$props.crvBalance);
    		if ('keeper_usdcbalance' in $$props) $$invalidate(12, keeper_usdcbalance = $$props.keeper_usdcbalance);
    		if ('BOOForxBOO' in $$props) $$invalidate(13, BOOForxBOO = $$props.BOOForxBOO);
    		if ('snonce' in $$props) snonce = $$props.snonce;
    		if ('missiles' in $$props) $$invalidate(14, missiles = $$props.missiles);
    		if ('completed' in $$props) $$invalidate(15, completed = $$props.completed);
    		if ('pair' in $$props) $$invalidate(16, pair = $$props.pair);
    		if ('treasuryAddStrategyToken' in $$props) $$invalidate(17, treasuryAddStrategyToken = $$props.treasuryAddStrategyToken);
    		if ('treasuryAddStrategyStrategy' in $$props) $$invalidate(18, treasuryAddStrategyStrategy = $$props.treasuryAddStrategyStrategy);
    		if ('treasuryDisableStrategyToken' in $$props) $$invalidate(19, treasuryDisableStrategyToken = $$props.treasuryDisableStrategyToken);
    		if ('treasuryEnableStrategyToken' in $$props) $$invalidate(20, treasuryEnableStrategyToken = $$props.treasuryEnableStrategyToken);
    		if ('treasuryChangeStrategyToken' in $$props) $$invalidate(21, treasuryChangeStrategyToken = $$props.treasuryChangeStrategyToken);
    		if ('treasuryChangeStrategyStrategy' in $$props) $$invalidate(22, treasuryChangeStrategyStrategy = $$props.treasuryChangeStrategyStrategy);
    		if ('treasuryEnterMarketToken' in $$props) $$invalidate(23, treasuryEnterMarketToken = $$props.treasuryEnterMarketToken);
    		if ('treasuryExitAndBalanceMarketsToken' in $$props) $$invalidate(24, treasuryExitAndBalanceMarketsToken = $$props.treasuryExitAndBalanceMarketsToken);
    		if ('treasuryExitMarketToken' in $$props) $$invalidate(25, treasuryExitMarketToken = $$props.treasuryExitMarketToken);
    		if ('lockerAddStrategyToken' in $$props) $$invalidate(26, lockerAddStrategyToken = $$props.lockerAddStrategyToken);
    		if ('lockerAddStrategyStrategy' in $$props) $$invalidate(27, lockerAddStrategyStrategy = $$props.lockerAddStrategyStrategy);
    		if ('lockerDisableStrategyToken' in $$props) $$invalidate(28, lockerDisableStrategyToken = $$props.lockerDisableStrategyToken);
    		if ('lockerEnableStrategyToken' in $$props) $$invalidate(29, lockerEnableStrategyToken = $$props.lockerEnableStrategyToken);
    		if ('lockerChangeStrategyToken' in $$props) $$invalidate(30, lockerChangeStrategyToken = $$props.lockerChangeStrategyToken);
    		if ('lockerChangeStrategyStrategy' in $$props) $$invalidate(31, lockerChangeStrategyStrategy = $$props.lockerChangeStrategyStrategy);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		token,
    		struct,
    		show,
    		status,
    		tx_status,
    		usdcBalance,
    		booBalance,
    		creditBalance,
    		screamBalance,
    		tarotBalance,
    		bifiBalance,
    		crvBalance,
    		keeper_usdcbalance,
    		BOOForxBOO,
    		missiles,
    		completed,
    		pair,
    		treasuryAddStrategyToken,
    		treasuryAddStrategyStrategy,
    		treasuryDisableStrategyToken,
    		treasuryEnableStrategyToken,
    		treasuryChangeStrategyToken,
    		treasuryChangeStrategyStrategy,
    		treasuryEnterMarketToken,
    		treasuryExitAndBalanceMarketsToken,
    		treasuryExitMarketToken,
    		lockerAddStrategyToken,
    		lockerAddStrategyStrategy,
    		lockerDisableStrategyToken,
    		lockerEnableStrategyToken,
    		lockerChangeStrategyToken,
    		lockerChangeStrategyStrategy,
    		changeTab,
    		grantRole,
    		revokeRole,
    		makeMeRich,
    		createPair,
    		getPair,
    		setAddress,
    		launchKeeper,
    		launchDistribution,
    		swapFTM2USDC,
    		swapFTM2BOO,
    		swapFTM2CREDIT,
    		swapFTM2SCREAM,
    		swapFTM2TAROT,
    		swapFTM2BIFI,
    		swapFTM2CRV,
    		makeLiquidity,
    		approveLiquidityUSDC,
    		approveLiquidityWJK,
    		updateKeeperContracts,
    		updateContract,
    		transfer101,
    		treasuryDisableBoo,
    		treasuryDisableCredit,
    		treasuryDisableScream,
    		treasuryDisableTarot,
    		sendToXBOO,
    		sendToXCREDIT,
    		sendToXSCREAM,
    		treasuryAddStrategy,
    		treasuryDisableStrategy,
    		treasuryEnableStrategy,
    		treasuryChangeStrategy,
    		treasuryEnterMarket,
    		treasuryExitAndBalanceMarkets,
    		treasuryExitMarket,
    		lockerAddStrategy,
    		lockerDisableStrategy,
    		lockerEnableStrategy,
    		lockerChangeStrategy,
    		account,
    		signer,
    		provider,
    		connected,
    		nonce,
    		stakelocker,
    		div0_binding,
    		input0_binding,
    		input1_binding,
    		input2_binding,
    		input3_binding,
    		input4_binding,
    		input5_binding,
    		input6_binding,
    		input7_binding,
    		input8_binding,
    		input9_binding,
    		input10_binding,
    		input11_binding,
    		input12_binding,
    		input13_binding,
    		input14_binding
    	];
    }

    class Admin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				account: 72,
    				token: 0,
    				signer: 73,
    				provider: 74,
    				connected: 75,
    				nonce: 76,
    				stakelocker: 77
    			},
    			null,
    			[-1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Admin",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*account*/ ctx[72] === undefined && !('account' in props)) {
    			console_1$1.warn("<Admin> was created without expected prop 'account'");
    		}

    		if (/*token*/ ctx[0] === undefined && !('token' in props)) {
    			console_1$1.warn("<Admin> was created without expected prop 'token'");
    		}

    		if (/*signer*/ ctx[73] === undefined && !('signer' in props)) {
    			console_1$1.warn("<Admin> was created without expected prop 'signer'");
    		}

    		if (/*provider*/ ctx[74] === undefined && !('provider' in props)) {
    			console_1$1.warn("<Admin> was created without expected prop 'provider'");
    		}

    		if (/*connected*/ ctx[75] === undefined && !('connected' in props)) {
    			console_1$1.warn("<Admin> was created without expected prop 'connected'");
    		}

    		if (/*nonce*/ ctx[76] === undefined && !('nonce' in props)) {
    			console_1$1.warn("<Admin> was created without expected prop 'nonce'");
    		}

    		if (/*stakelocker*/ ctx[77] === undefined && !('stakelocker' in props)) {
    			console_1$1.warn("<Admin> was created without expected prop 'stakelocker'");
    		}
    	}

    	get account() {
    		throw new Error("<Admin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set account(value) {
    		throw new Error("<Admin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get token() {
    		throw new Error("<Admin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set token(value) {
    		throw new Error("<Admin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get signer() {
    		throw new Error("<Admin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set signer(value) {
    		throw new Error("<Admin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get provider() {
    		throw new Error("<Admin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set provider(value) {
    		throw new Error("<Admin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get connected() {
    		throw new Error("<Admin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connected(value) {
    		throw new Error("<Admin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nonce() {
    		throw new Error("<Admin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nonce(value) {
    		throw new Error("<Admin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stakelocker() {
    		throw new Error("<Admin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stakelocker(value) {
    		throw new Error("<Admin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

    const context = {
      subscribe: null,
      addNotification: null,
      removeNotification: null,
      clearNotifications: null,
    };

    const getNotificationsContext = () => getContext(context);

    /* node_modules\svelte-notifications\src\components\Notification.svelte generated by Svelte v3.44.2 */

    function create_fragment$3(ctx) {
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			item: 0,
    			notification: 1,
    			withoutStyles: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notification",
    			options,
    			id: create_fragment$3.name
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
    const file$2 = "node_modules\\svelte-notifications\\src\\components\\DefaultNotification.svelte";

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

    function create_fragment$2(ctx) {
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
    			add_location(div0, file$2, 101, 2, 2236);
    			attr_dev(button, "class", "" + (null_to_empty(/*getClass*/ ctx[2]('button')) + " svelte-2oyqkv"));
    			attr_dev(button, "aria-label", "delete notification");
    			add_location(button, file$2, 104, 2, 2305);
    			attr_dev(div1, "class", "" + (null_to_empty(/*getClass*/ ctx[2]()) + " svelte-2oyqkv"));
    			attr_dev(div1, "role", "status");
    			attr_dev(div1, "aria-live", "polite");
    			add_location(div1, file$2, 94, 0, 2148);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			notification: 3,
    			withoutStyles: 4,
    			onRemove: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DefaultNotification",
    			options,
    			id: create_fragment$2.name
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
    const file$1 = "node_modules\\svelte-notifications\\src\\components\\Notifications.svelte";

    function get_each_context(ctx, list, i) {
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
    function create_if_block$1(ctx) {
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
    		id: create_if_block$1.name,
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
    	let if_block = /*notification*/ ctx[9].position === /*position*/ ctx[6] && create_if_block$1(ctx);

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
    					if_block = create_if_block$1(ctx);
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
    function create_each_block(ctx) {
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
    			add_location(div, file$1, 68, 4, 1451);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(68:2) {#each positions as position}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let each_value = positions;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    			add_location(div, file$1, 66, 0, 1387);
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { item: 0, withoutStyles: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notifications",
    			options,
    			id: create_fragment$1.name
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
    			add_location(img, file, 162, 5, 5448);
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
    			add_location(img, file, 160, 5, 5336);
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
    			add_location(img, file, 158, 5, 5182);
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
    			add_location(img, file, 156, 5, 5035);
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
    			add_location(img, file, 154, 5, 4889);
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
    			add_location(img, file, 152, 5, 4747);
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
    			add_location(img, file, 150, 5, 4596);
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
    			add_location(br, file, 215, 24, 7423);
    			set_style(div, "margin-top", "1rem");
    			set_style(div, "text-align", "center");
    			set_style(div, "width", "100%");
    			set_style(div, "font-size", "12px");
    			add_location(div, file, 214, 5, 7325);
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
    			add_location(button, file, 221, 6, 7800);
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
    			add_location(iframe, file, 254, 3, 9451);
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
    			add_location(iframe, file, 252, 3, 9361);
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
    			add_location(img, file, 250, 3, 9228);
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
    			add_location(iframe, file, 248, 3, 9094);
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
    			add_location(iframe, file, 246, 3, 8961);
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
    			add_location(iframe, file, 244, 3, 8823);
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
    			add_location(iframe, file, 242, 3, 8658);
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

    	comp = new Admin({ props: comp_props, $$inline: true });
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
    			add_location(div0, file, 144, 1, 4121);
    			add_location(br0, file, 165, 17, 5574);
    			add_location(span0, file, 164, 4, 5550);
    			add_location(br1, file, 168, 4, 5622);
    			add_location(br2, file, 168, 8, 5626);
    			add_location(br3, file, 169, 54, 5685);
    			set_style(div1, "margin-bottom", "1rem");
    			add_location(div1, file, 169, 4, 5635);
    			add_location(li0, file, 172, 17, 5782);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 172, 5, 5770);
    			add_location(li1, file, 173, 26, 5825);
    			attr_dev(a1, "href", "/dashboard");
    			add_location(a1, file, 173, 5, 5804);
    			add_location(li2, file, 174, 22, 5870);
    			attr_dev(a2, "href", "/stake");
    			add_location(a2, file, 174, 5, 5853);
    			add_location(li3, file, 175, 22, 5918);
    			attr_dev(a3, "href", "/bonds");
    			add_location(a3, file, 175, 5, 5901);
    			add_location(li4, file, 176, 25, 5967);
    			attr_dev(a4, "href", "/soyfarms");
    			add_location(a4, file, 176, 5, 5947);
    			add_location(li5, file, 177, 23, 6012);
    			attr_dev(a5, "href", "/bridge");
    			add_location(a5, file, 177, 5, 5994);
    			set_style(ul, "text-align", "left");
    			attr_dev(ul, "class", "menu");
    			add_location(ul, file, 171, 4, 5723);
    			add_location(br4, file, 186, 4, 6261);
    			add_location(br5, file, 189, 38, 6431);
    			set_style(div2, "background", "#eee");
    			set_style(div2, "border-radius", ".5rem");
    			set_style(div2, "padding", ".5rem .75rem");
    			set_style(div2, "margin-top", ".5rem");
    			add_location(div2, file, 188, 5, 6305);
    			add_location(br6, file, 195, 30, 6631);
    			set_style(div3, "background", "#eee");
    			set_style(div3, "border-radius", ".5rem");
    			set_style(div3, "padding", ".5rem .75rem");
    			set_style(div3, "margin-top", ".5rem");
    			add_location(div3, file, 194, 5, 6513);
    			set_style(div4, "text-align", "left");
    			add_location(div4, file, 187, 4, 6270);
    			add_location(br7, file, 201, 4, 6723);
    			add_location(br8, file, 202, 4, 6732);
    			add_location(br9, file, 203, 4, 6741);
    			add_location(div5, file, 205, 22, 6802);
    			attr_dev(a6, "href", "/admin");
    			add_location(a6, file, 205, 5, 6785);
    			add_location(br10, file, 206, 66, 6895);
    			add_location(span1, file, 207, 6, 6906);
    			set_style(div6, "overflow", "hidden");
    			set_style(div6, "text-overflow", "ellipsis");
    			add_location(div6, file, 206, 5, 6834);
    			add_location(br11, file, 209, 64, 7073);
    			add_location(span2, file, 210, 6, 7084);
    			set_style(div7, "overflow", "hidden");
    			set_style(div7, "text-overflow", "ellipsis");
    			add_location(div7, file, 209, 5, 7014);
    			set_style(div8, "text-align", "left");
    			add_location(div8, file, 204, 4, 6750);
    			set_style(div9, "margin-top", ".1rem");
    			set_style(div9, "border", "1px solid #ccc");
    			set_style(div9, "border-radius", ".25rem");
    			set_style(div9, "padding", ".25rem");
    			set_style(div9, "background", "#f0f0f0");
    			set_style(div9, "overflow", "hidden");
    			set_style(div9, "text-overflow", "ellipsis");
    			set_style(div9, "max-width", "10rem");
    			add_location(div9, file, 219, 4, 7556);
    			add_location(br12, file, 226, 18, 7923);
    			attr_dev(div10, "class", "twitter h-3 w-3 bg-black pointer mt-1 inline-block");
    			attr_dev(div10, "title", "Twitter");
    			add_location(div10, file, 227, 44, 7972);
    			attr_dev(a7, "href", "https://twitter.com/wojak_bro");
    			add_location(a7, file, 227, 4, 7932);
    			attr_dev(div11, "class", "docs h-3 w-3 bg-black pointer mt-1 inline-block");
    			attr_dev(div11, "title", "Documentation");
    			add_location(div11, file, 228, 53, 8116);
    			attr_dev(a8, "href", "https://kaperstone.gitbook.io/wojak-1/");
    			add_location(a8, file, 228, 4, 8067);
    			attr_dev(div12, "class", "telegram h-3 w-3 bg-black pointer mt-1 inline-block");
    			attr_dev(div12, "title", "Telegram");
    			add_location(div12, file, 229, 37, 8247);
    			attr_dev(a9, "href", "https://t.me/wojak_bro");
    			add_location(a9, file, 229, 4, 8214);
    			set_style(div13, "display", "inline-block");
    			set_style(div13, "vertical-align", "top");
    			set_style(div13, "width", "10rem");
    			set_style(div13, "padding", "1rem");
    			set_style(div13, "border-right", "1px solid #363636");
    			set_style(div13, "text-align", "center");
    			add_location(div13, file, 147, 3, 4400);
    			set_style(div14, "display", "inline-block");
    			set_style(div14, "vertical-align", "top");
    			set_style(div14, "padding", "1rem");
    			set_style(div14, "width", "48rem");
    			add_location(div14, file, 231, 3, 8353);
    			set_style(div15, "margin", "2rem auto");
    			set_style(div15, "width", "64rem");
    			set_style(div15, "min-height", "600px");
    			set_style(div15, "font-size", ".85rem");
    			add_location(div15, file, 146, 2, 4320);
    			set_style(div16, "width", "1024px");
    			set_style(div16, "margin", "0 auto");
    			set_style(div16, "position", "relative");
    			add_location(div16, file, 145, 1, 4259);
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
    		Comp: Admin,
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
//# sourceMappingURL=admin.js.map
