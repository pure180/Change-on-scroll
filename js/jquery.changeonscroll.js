/* ========================================================================
 * ChangeOnScroll: jquery.changeonscroll.js v2.0.0
 * Author: Daniel Pfisterer (info@daniel-pfisterer.de)
 * ========================================================================
 * Copyright 2015-2015 Daniel Pfisterer
 *
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 * ======================================================================== */

+function ($) {
  'use strict';

  var ChangeOnScroll = function(element, options) {
    this.$element       = $(element);
    this.data           = this.$element.data();
    this.options        = $.extend({}, ChangeOnScroll.DEFAULTS, this.data, options);

    this.pos            = $(window).scrollTop();
    this.top            = this.offsetTop();
    this.bottom         = this.offsetBottom();

    this.start          = String(this.options.start).indexOf(',') > -1 ? this.options.start.split(",") : this.options.start;
    this.end            = String(this.options.end).indexOf(',') > -1 ? this.options.end.split(",") : this.options.end;
    this.style          = String(this.options.style).indexOf(',') > -1 ? this.options.style.split(",") : this.options.style;

    //$('.inidcator.top').css('top', this.top )
    //$('.inidcator.bottom').css('top', this.bottom )

    this.Init();
  };
  ChangeOnScroll.VERSION  = '2.0.0';

  ChangeOnScroll.DEFAULTS = {
    beforeClass       : 'scroller_before',
    whileClass        : 'scroller_while',
    afterClass        : 'scroller_after',
    top               : 0,
    bottom            : 0,
    start             : '',
    end               : '',
    faktor            : 1
  };

  ChangeOnScroll.prototype.Init = function() {
    var scrolled = null;

    if(this.pos >= this.top && this.pos <= this.bottom ) {
      scrolled = 'inside';
      this.Inside();
    } else if ( this.pos >= this.bottom ) {
      scrolled = 'after';
      this.After();
    } else if ( this.pos <= this.top ) {
      scrolled = 'before';
      this.Before();
    } else {
      //console.log('else: ' + scroll_pos)
    }

    var eventType = scrolled;
    var e = $.Event(eventType + '.changeonscroll');
    this.$element.trigger(e);

    if (e.isDefaultPrevented()) return;
  };

  ChangeOnScroll.prototype.Inside = function() {
    this.$element.one()
      .addClass(this.options.whileClass)
      .removeClass(this.options.beforeClass)
      .removeClass(this.options.afterClass);
    this.CalculatePositionAndSetStyles();
  };

  ChangeOnScroll.prototype.Before = function() {
    this.$element.one()
      .removeClass(this.options.whileClass)
      .addClass(this.options.beforeClass);
    this.SetStyles(this.start);
  };

  ChangeOnScroll.prototype.After = function() {
    this.$element.one()
      .removeClass(this.options.whileClass)
      .addClass(this.options.afterClass);
    this.SetStyles(this.end);
  };

  ChangeOnScroll.prototype.offsetTop = function() {
    var trigger = this.options.top;
    var offsetTop;
    if(trigger){
      offsetTop = typeof trigger === 'number' ? trigger :  $(trigger).offset().top;
    } else {
      offsetTop = typeof this.options.top === 'number' ? this.options.top : this.$element.offset().top;
    }
    return offsetTop;
  };

  ChangeOnScroll.prototype.offsetBottom = function() {
    var trigger = this.options.bottom;
    var offsetBottom;
    if(trigger){
      offsetBottom = typeof trigger === 'number' ? trigger : $(trigger).offset().top;
    } else {
      offsetBottom = typeof this.options.bottom === 'number' ? this.options.bottom : this.$element.offset().top;
    }
    return offsetBottom;
  };

  ChangeOnScroll.prototype.Percentage = function() {
    var result = (this.pos - this.top) / (this.bottom - this.top);
    return result.toFixed(6);
  };

  ChangeOnScroll.prototype.Calculate = function() {
    var forward = Number(this.start) + ( this.Percentage() * (this.end - this.start) * this.options.faktor );
    var backward = Number(this.start) - ( this.Percentage() * ( this.start - this.end) * this.options.faktor );
    var result = this.options.reverse ? backward : forward;
    return result;
  };

  ChangeOnScroll.prototype.CalculateArray = function(index) {
    var forward = Number(this.start[index]) + ( this.Percentage() * (this.end[index] - this.start[index]) * this.options.faktor );
    var backward = Number(this.start[index]) - ( this.Percentage() * ( this.start[index] - this.end[index]) * this.options.faktor );
    var result = this.options.reverse ? backward : forward;
    return result;
  };

  ChangeOnScroll.prototype.SetStyles = function(value) {
    var style = '', separator = '';
    if(this.style && typeof this.style === 'string') {
      this.$element.css(this.style, value * this.options.faktor);
    } else {
      for(var i in this.style){
        separator = this.style.length - 1 === i ? '' : ', ';
        style += this.style[i] + ':' + value[i] * this.options.faktor + separator;
      }
      var styles = eval('({' + style + '})');
      this.$element.css( styles );
    }
  };

  ChangeOnScroll.prototype.CalculatePositionAndSetStyles = function() {
    var style = '', separator = '';
    if(this.style && typeof this.style === 'string') {
      this.$element.css( this.style, this.Calculate() );
    } else {
      for(var i in this.style) {
        separator = this.style.length - 1 === i ? ' ' : ', ';

        style += this.style[i] + ':' + this.CalculateArray(i) + separator;
      }
      var styles = eval('({' + style + '})');
      this.$element.css( styles );
    }
  };

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this);
      var data    = $this.data('changeonscroll');
      var options = $.extend({}, ChangeOnScroll.DEFAULTS, data, option);
      new ChangeOnScroll($this, options);
    });
  }

  var old = $.fn.changeonscroll;

  $.fn.changeonscroll             = Plugin;
  $.fn.changeonscroll.Constructor = ChangeOnScroll;

  $.fn.changeonscroll.noConflict = function () {
    $.fn.changeonscroll = old;
    return this;
  };

  $(window).on('load, scroll.changeonscroll.data-api', function() {
    $('[data-spy="scroller"]').each(function(){
      var $spy = $(this);
      var data = $spy.data();
      Plugin.call($spy, data);
    });
  });

}(jQuery);
