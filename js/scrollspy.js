/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.5
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // SCROLLSPY CLASS DEFINITION
    // ==========================

    function ScrollSpy(element, options) {
        this.$body          = $(document.body);
        this.$scrollElement = $(element).is(document.body) ? $(window) : $(element);
        this.options        = $.extend({offset:0}, options);
        this.offsets        = [];
        this.activeOffset   = null;
        this.scrollHeight   = 0;
        this.sectionsClass  = options.sectionsClass;
        this.triggerer        = options.triggerer;

        this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this));
        this.refresh();
        this.process();
    }

    ScrollSpy.prototype.getScrollHeight = function () {
        return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
    };

    ScrollSpy.prototype.refresh = function () {
        var that          = this;
        var offsetMethod  = 'offset';
        var offsetBase    = 0;

        this.offsets      = [];
        this.scrollHeight = this.getScrollHeight();

        if (!$.isWindow(this.$scrollElement[0])) {
            offsetMethod = 'position';
            offsetBase   = this.$scrollElement.scrollTop();
        }

        this.$body
            .find($(this.sectionsClass))
            .map(function () {
                var $section = $(this);

                return ($section
                    && $section.length
                    && $section.is(':visible')
                    && [[$section[offsetMethod]().top + offsetBase, $section.data('spy-params') || {}]]) || null
            })
            .sort(function (a, b) { return a[0] - b[0] })
            .each(function () {
                that.offsets.push({value: this[0], params: this[1]});
            })
    };

    ScrollSpy.prototype.process = function () {
        var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset;
        var scrollHeight = this.getScrollHeight();
        var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height();
        var offsets      = this.offsets;
        var activeOffset = this.activeOffset;

        if (this.scrollHeight != scrollHeight) {
            this.refresh()
        }

        if (scrollTop >= maxScroll) {
            var offset = offsets[offsets.length - 1];

            return activeOffset != offset.value && this.activate(offset.value, offset.params);
        }

        if (activeOffset && scrollTop < offsets[0].value) {
            this.activeOffset = null;
        }

        for (var i = offsets.length; i--;) {
            activeOffset != offsets[i].value
            && scrollTop >= offsets[i].value
            && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1].value)
            && this.activate(offsets[i].value, offsets[i].params)
        }
    };

    ScrollSpy.prototype.activate = function (offset, params) {
        this.activeOffset = offset;
        this.triggerer.trigger('activate.scrollspy', [params]);
    };

    // SCROLLSPY PLUGIN DEFINITION
    // ===========================

    function Plugin(option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('bs.scrollspy');
            var options = typeof option == 'object' && option;

            if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)));
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.scrollspy;

    $.fn.scrollspy             = Plugin;
    $.fn.scrollspy.Constructor = ScrollSpy;


    // SCROLLSPY NO CONFLICT
    // =====================

    $.fn.scrollspy.noConflict = function () {
        $.fn.scrollspy = old;
        return this
    };


    // SCROLLSPY DATA-API
    // ==================

    $(window).on('load.bs.scrollspy.data-api', function () {
        $('[data-spy="scroll"]').each(function () {
            var $spy = $(this);
            Plugin.call($spy, $spy.data())
        })
    })

}(jQuery);