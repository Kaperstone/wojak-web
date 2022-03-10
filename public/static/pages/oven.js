
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35732/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    const outroing = new Set();
    let outros;
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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

    /* src\pages\oven.svelte generated by Svelte v3.44.2 */

    const file$1 = "src\\pages\\oven.svelte";

    function create_fragment$1(ctx) {
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let br2;
    	let t3;
    	let table;
    	let tr0;
    	let td0;
    	let t5;
    	let tr1;
    	let td1;
    	let t6;
    	let br3;
    	let t7;
    	let br4;
    	let t8;
    	let button;
    	let br5;
    	let t10;

    	const block = {
    		c: function create() {
    			t0 = text("Nothing much to say here");
    			br0 = element("br");
    			t1 = text("\r\nLiquidity fee: 5%");
    			br1 = element("br");
    			t2 = text("\r\nAdmin fee: 5%");
    			br2 = element("br");
    			t3 = space();
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Next burn power: 153,135.34$";
    			t5 = space();
    			tr1 = element("tr");
    			td1 = element("td");
    			t6 = text("Next Burn In");
    			br3 = element("br");
    			t7 = text("\r\n            6 hours, 23 minutes, 63 seconds");
    			br4 = element("br");
    			t8 = space();
    			button = element("button");
    			button.textContent = "Launch Burn";
    			br5 = element("br");
    			t10 = text("\r\n            Reward: 1 $WJK");
    			add_location(br0, file$1, 0, 24, 24);
    			add_location(br1, file$1, 1, 17, 47);
    			add_location(br2, file$1, 2, 13, 66);
    			set_style(td0, "padding", ".5rem");
    			set_style(td0, "border", "1px solid #ddd");
    			add_location(td0, file$1, 5, 8, 160);
    			add_location(tr0, file$1, 4, 4, 146);
    			add_location(br3, file$1, 11, 24, 370);
    			add_location(br4, file$1, 12, 43, 419);
    			add_location(button, file$1, 13, 12, 437);
    			add_location(br5, file$1, 13, 40, 465);
    			set_style(td1, "padding", ".5rem");
    			set_style(td1, "border", "1px solid #ddd");
    			add_location(td1, file$1, 10, 8, 296);
    			add_location(tr1, file$1, 9, 4, 282);
    			set_style(table, "margin-top", "1rem");
    			set_style(table, "border", "1px solid #ddd");
    			set_style(table, "max-width", "100%");
    			add_location(table, file$1, 3, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(table, t5);
    			append_dev(table, tr1);
    			append_dev(tr1, td1);
    			append_dev(td1, t6);
    			append_dev(td1, br3);
    			append_dev(td1, t7);
    			append_dev(td1, br4);
    			append_dev(td1, t8);
    			append_dev(td1, button);
    			append_dev(td1, br5);
    			append_dev(td1, t10);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(table);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Oven', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Oven> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Oven extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Oven",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div7;
    	let div5;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let span0;
    	let t2;
    	let br0;
    	let t3;
    	let t4;
    	let br1;
    	let br2;
    	let t5;
    	let div0;
    	let t6;
    	let br3;
    	let t7;
    	let t8;
    	let ul0;
    	let a0;
    	let li0;
    	let t10;
    	let a1;
    	let li1;
    	let t12;
    	let a2;
    	let li2;
    	let t14;
    	let a3;
    	let li3;
    	let t16;
    	let a4;
    	let li4;
    	let t18;
    	let li5;
    	let s0;
    	let t20;
    	let li6;
    	let s1;
    	let t22;
    	let li7;
    	let s2;
    	let t24;
    	let li8;
    	let s3;
    	let t26;
    	let li9;
    	let s4;
    	let t28;
    	let br4;
    	let t29;
    	let br5;
    	let t30;
    	let br6;
    	let t31;
    	let br7;
    	let t32;
    	let ul1;
    	let a5;
    	let li10;
    	let t34;
    	let a6;
    	let li11;
    	let t36;
    	let li12;
    	let t37;
    	let br8;
    	let t38;
    	let span1;
    	let t40;
    	let div1;
    	let t42;
    	let div4;
    	let div2;
    	let t43;
    	let span2;
    	let t45;
    	let div3;
    	let t46;
    	let span3;
    	let t48;
    	let br9;
    	let t49;
    	let t50;
    	let div6;
    	let comp;
    	let current;
    	comp = new Oven({ $$inline: true });

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div5 = element("div");
    			t0 = text("Wojak Token\n\t\t");
    			img = element("img");
    			t1 = space();
    			span0 = element("span");
    			t2 = text("Experimental");
    			br0 = element("br");
    			t3 = text("wealth building token");
    			t4 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t5 = space();
    			div0 = element("div");
    			t6 = text("We maybe not moon,");
    			br3 = element("br");
    			t7 = text("but its honest work.");
    			t8 = space();
    			ul0 = element("ul");
    			a0 = element("a");
    			li0 = element("li");
    			li0.textContent = "Hom";
    			t10 = space();
    			a1 = element("a");
    			li1 = element("li");
    			li1.textContent = "Dashboard";
    			t12 = space();
    			a2 = element("a");
    			li2 = element("li");
    			li2.textContent = "Boomer Stake";
    			t14 = space();
    			a3 = element("a");
    			li3 = element("li");
    			li3.textContent = "Chad Bonds";
    			t16 = space();
    			a4 = element("a");
    			li4 = element("li");
    			li4.textContent = "SoyFarms";
    			t18 = space();
    			li5 = element("li");
    			s0 = element("s");
    			s0.textContent = "Mumu & Bobo";
    			t20 = space();
    			li6 = element("li");
    			s1 = element("s");
    			s1.textContent = "Coomer Farms";
    			t22 = space();
    			li7 = element("li");
    			s2 = element("s");
    			s2.textContent = "Soyjak Loans";
    			t24 = space();
    			li8 = element("li");
    			s3 = element("s");
    			s3.textContent = "Mooner Launch";
    			t26 = space();
    			li9 = element("li");
    			s4 = element("s");
    			s4.textContent = "Zoomer Swap";
    			t28 = space();
    			br4 = element("br");
    			t29 = space();
    			br5 = element("br");
    			t30 = space();
    			br6 = element("br");
    			t31 = space();
    			br7 = element("br");
    			t32 = space();
    			ul1 = element("ul");
    			a5 = element("a");
    			li10 = element("li");
    			li10.textContent = "Portfolio";
    			t34 = space();
    			a6 = element("a");
    			li11 = element("li");
    			li11.textContent = "Admin Panel";
    			t36 = space();
    			li12 = element("li");
    			t37 = text("Holdings:");
    			br8 = element("br");
    			t38 = space();
    			span1 = element("span");
    			span1.textContent = "1,345.00 $WJK";
    			t40 = space();
    			div1 = element("div");
    			div1.textContent = "Binance Smart Chain";
    			t42 = space();
    			div4 = element("div");
    			div2 = element("div");
    			t43 = text("1,345.00\n\t\t\t\t");
    			span2 = element("span");
    			span2.textContent = "$WJK";
    			t45 = space();
    			div3 = element("div");
    			t46 = text("500.00\n\t\t\t\t");
    			span3 = element("span");
    			span3.textContent = "$sWJK";
    			t48 = text("\n\t\t\tConnected");
    			br9 = element("br");
    			t49 = text("\n\t\t\t0x41227a3f9df302d6fbdf7dd1b3261928ba789d47");
    			t50 = space();
    			div6 = element("div");
    			create_component(comp.$$.fragment);
    			set_style(img, "width", "80%");
    			set_style(img, "padding", "1rem 0");
    			if (!src_url_equal(img.src, img_src_value = "/static/images/wojak.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Wojak Face");
    			add_location(img, file, 6, 2, 280);
    			add_location(br0, file, 7, 20, 387);
    			add_location(span0, file, 7, 2, 369);
    			add_location(br1, file, 8, 2, 422);
    			add_location(br2, file, 8, 6, 426);
    			add_location(br3, file, 9, 52, 483);
    			set_style(div0, "margin-bottom", "1rem");
    			add_location(div0, file, 9, 2, 433);
    			add_location(li0, file, 12, 15, 561);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 12, 3, 549);
    			add_location(li1, file, 13, 24, 602);
    			attr_dev(a1, "href", "/dashboard");
    			add_location(a1, file, 13, 3, 581);
    			add_location(li2, file, 14, 20, 645);
    			attr_dev(a2, "href", "/stake");
    			add_location(a2, file, 14, 3, 628);
    			add_location(li3, file, 15, 20, 691);
    			attr_dev(a3, "href", "/bonds");
    			add_location(a3, file, 15, 3, 674);
    			add_location(li4, file, 16, 20, 735);
    			attr_dev(a4, "href", "/bonds");
    			add_location(a4, file, 16, 3, 718);
    			add_location(s0, file, 17, 7, 764);
    			add_location(li5, file, 17, 3, 760);
    			add_location(s1, file, 18, 7, 795);
    			add_location(li6, file, 18, 3, 791);
    			add_location(s2, file, 19, 7, 827);
    			add_location(li7, file, 19, 3, 823);
    			add_location(s3, file, 20, 7, 859);
    			add_location(li8, file, 20, 3, 855);
    			add_location(s4, file, 21, 7, 892);
    			add_location(li9, file, 21, 3, 888);
    			set_style(ul0, "text-align", "left");
    			add_location(ul0, file, 11, 2, 517);
    			add_location(br4, file, 23, 2, 926);
    			add_location(br5, file, 24, 2, 933);
    			add_location(br6, file, 25, 2, 940);
    			add_location(br7, file, 26, 2, 947);
    			add_location(li10, file, 28, 24, 1007);
    			attr_dev(a5, "href", "/portfolio");
    			add_location(a5, file, 28, 3, 986);
    			add_location(li11, file, 29, 20, 1050);
    			attr_dev(a6, "href", "/admin");
    			add_location(a6, file, 29, 3, 1033);
    			add_location(br8, file, 30, 16, 1091);
    			add_location(span1, file, 31, 4, 1100);
    			add_location(li12, file, 30, 3, 1078);
    			set_style(ul1, "text-align", "left");
    			add_location(ul1, file, 27, 2, 954);
    			set_style(div1, "margin-top", "1rem");
    			set_style(div1, "text-align", "center");
    			set_style(div1, "width", "100%");
    			add_location(div1, file, 34, 2, 1146);
    			set_style(span2, "background", "#f0f0f0");
    			set_style(span2, "border-radius", ".25rem");
    			set_style(span2, "padding", "0 .15rem");
    			add_location(span2, file, 38, 4, 1528);
    			set_style(div2, "width", "100%");
    			set_style(div2, "border-radius", ".25rem");
    			set_style(div2, "background", "#ccc");
    			set_style(div2, "text-align", "center");
    			set_style(div2, "padding", ".15rem 0");
    			set_style(div2, "margin", ".15rem 0");
    			add_location(div2, file, 36, 3, 1398);
    			set_style(span3, "background", "#f0f0f0");
    			set_style(span3, "border-radius", ".25rem");
    			set_style(span3, "padding", "0 .15rem");
    			add_location(span3, file, 42, 4, 1752);
    			set_style(div3, "width", "100%");
    			set_style(div3, "border-radius", ".25rem");
    			set_style(div3, "background", "#ccc");
    			set_style(div3, "text-align", "center");
    			set_style(div3, "padding", ".15rem 0");
    			set_style(div3, "margin", ".15rem 0");
    			add_location(div3, file, 40, 3, 1624);
    			add_location(br9, file, 44, 12, 1858);
    			set_style(div4, "margin-top", ".1rem");
    			set_style(div4, "border", "1px solid #ccc");
    			set_style(div4, "border-radius", ".25rem");
    			set_style(div4, "padding", ".25rem");
    			set_style(div4, "background", "#f0f0f0");
    			set_style(div4, "overflow", "hidden");
    			set_style(div4, "text-overflow", "ellipsis");
    			set_style(div4, "max-width", "10rem");
    			add_location(div4, file, 35, 2, 1232);
    			set_style(div5, "display", "inline-block");
    			set_style(div5, "vertical-align", "top");
    			set_style(div5, "width", "10rem");
    			set_style(div5, "padding", "1rem");
    			set_style(div5, "border-right", "1px solid #363636");
    			set_style(div5, "text-align", "center");
    			add_location(div5, file, 4, 1, 136);
    			set_style(div6, "display", "inline-block");
    			set_style(div6, "vertical-align", "top");
    			set_style(div6, "padding", "1rem");
    			set_style(div6, "width", "48rem");
    			add_location(div6, file, 48, 1, 1927);
    			set_style(div7, "margin", "2rem auto");
    			set_style(div7, "width", "64rem");
    			set_style(div7, "min-height", "600px");
    			set_style(div7, "font-size", ".85rem");
    			add_location(div7, file, 3, 0, 58);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div5);
    			append_dev(div5, t0);
    			append_dev(div5, img);
    			append_dev(div5, t1);
    			append_dev(div5, span0);
    			append_dev(span0, t2);
    			append_dev(span0, br0);
    			append_dev(span0, t3);
    			append_dev(div5, t4);
    			append_dev(div5, br1);
    			append_dev(div5, br2);
    			append_dev(div5, t5);
    			append_dev(div5, div0);
    			append_dev(div0, t6);
    			append_dev(div0, br3);
    			append_dev(div0, t7);
    			append_dev(div5, t8);
    			append_dev(div5, ul0);
    			append_dev(ul0, a0);
    			append_dev(a0, li0);
    			append_dev(ul0, t10);
    			append_dev(ul0, a1);
    			append_dev(a1, li1);
    			append_dev(ul0, t12);
    			append_dev(ul0, a2);
    			append_dev(a2, li2);
    			append_dev(ul0, t14);
    			append_dev(ul0, a3);
    			append_dev(a3, li3);
    			append_dev(ul0, t16);
    			append_dev(ul0, a4);
    			append_dev(a4, li4);
    			append_dev(ul0, t18);
    			append_dev(ul0, li5);
    			append_dev(li5, s0);
    			append_dev(ul0, t20);
    			append_dev(ul0, li6);
    			append_dev(li6, s1);
    			append_dev(ul0, t22);
    			append_dev(ul0, li7);
    			append_dev(li7, s2);
    			append_dev(ul0, t24);
    			append_dev(ul0, li8);
    			append_dev(li8, s3);
    			append_dev(ul0, t26);
    			append_dev(ul0, li9);
    			append_dev(li9, s4);
    			append_dev(div5, t28);
    			append_dev(div5, br4);
    			append_dev(div5, t29);
    			append_dev(div5, br5);
    			append_dev(div5, t30);
    			append_dev(div5, br6);
    			append_dev(div5, t31);
    			append_dev(div5, br7);
    			append_dev(div5, t32);
    			append_dev(div5, ul1);
    			append_dev(ul1, a5);
    			append_dev(a5, li10);
    			append_dev(ul1, t34);
    			append_dev(ul1, a6);
    			append_dev(a6, li11);
    			append_dev(ul1, t36);
    			append_dev(ul1, li12);
    			append_dev(li12, t37);
    			append_dev(li12, br8);
    			append_dev(li12, t38);
    			append_dev(li12, span1);
    			append_dev(div5, t40);
    			append_dev(div5, div1);
    			append_dev(div5, t42);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, t43);
    			append_dev(div2, span2);
    			append_dev(div4, t45);
    			append_dev(div4, div3);
    			append_dev(div3, t46);
    			append_dev(div3, span3);
    			append_dev(div4, t48);
    			append_dev(div4, br9);
    			append_dev(div4, t49);
    			append_dev(div7, t50);
    			append_dev(div7, div6);
    			mount_component(comp, div6, null);
    			current = true;
    		},
    		p: noop,
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
    			if (detaching) detach_dev(div7);
    			destroy_component(comp);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Comp: Oven });
    	return [];
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
//# sourceMappingURL=oven.js.map
