/* ========================================================================
 * ChangeOnScroll: jquery.changeonscroll.js v2.1.1
 * Author: Daniel Pfisterer (info@daniel-pfisterer.de)
 * ========================================================================
 * Copyright 2015-2015 Daniel Pfisterer
 *
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 * ======================================================================== */

(function ($) {
  'use strict';

  var ChangeOnScroll = function(element, options) {
    this.$element       = $(element);
    this.data           = this.$element.data();
    this.options        = $.extend({}, ChangeOnScroll.DEFAULTS, this.data, options);
    this.$parent         = typeof this.options.parent === 'boolean' ? this.$element.parent() : $(this.options.parent);

    this.pos            = $(window).scrollTop();
    this.top            = this.offsetTop();
    this.bottom         = this.offsetBottom();

    if(typeof this.options.start === 'object') {
      this.start          = this.options.start
    } else {
      this.start          = String(this.options.start).indexOf(';') > -1 ? this.options.start.split(";") : this.options.start;
    }

    if(typeof this.options.end === 'object') {
      this.end          = this.options.end;
    } else {
      this.end          = String(this.options.end).indexOf(';') > -1 ? this.options.end.split(";") : this.options.end;
    }

    this.style          = String(this.options.style).indexOf(';') > -1 ? this.options.style.split(";") : this.options.style;
    this.unit           = String(this.options.unit).indexOf(';') > -1 && this.options.unit ? this.options.unit.split(";") :  String(this.options.unit);

    if(this.options.indicators) {
      $('.inidcator.top').css({'top': this.top, 'display' : 'block'});
      $('.inidcator.bottom').css({'top': this.bottom, 'display' : 'block'});
    }
    this.Init();
  };
  ChangeOnScroll.VERSION  = '2.1.1';

  ChangeOnScroll.DEFAULTS = {
    beforeClass       : 'scroller_before',
    whileClass        : 'scroller_while',
    afterClass        : 'scroller_after',
    unit              : '',
    top               : '',
    bottom            : '',
    start             : '',
    end               : '',
    parent            : '',
    factor            : 1
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
    var element = this.options.parent ? this.$parent : this.$element;
    var trigger = this.options.top ? this.options.top : element;
    var offsetTop;
    if(trigger){
      offsetTop = typeof trigger === 'number' ? trigger :  $(trigger).offset().top;
    } else {
      offsetTop = typeof this.options.top === 'number' ? this.options.top : element.offset().top;
    }
    return offsetTop;
  };

  ChangeOnScroll.prototype.offsetBottom = function() {
    var element = this.options.parent ? this.$parent : this.$element;
    var trigger = this.options.bottom ? this.options.bottom : element;
    var offsetBottom;
    var elementHeight = element.outerHeight();
    if(trigger){
      offsetBottom = typeof trigger === 'number' ? trigger : $(trigger).offset().top + elementHeight;
    } else {
      offsetBottom = typeof this.options.bottom === 'number' ? this.options.bottom : element.offset().top + elementHeight;
    }
    return offsetBottom;
  };

  ChangeOnScroll.prototype.Percentage = function() {
    var result = (this.pos - this.top) / (this.bottom - this.top);
    return result.toFixed(6);
  };

  // Set CSS styles on page load
  ChangeOnScroll.prototype.SetStyles = function(value) {
    if(
      this.style
      &&
      typeof this.style === 'string'
      &&
      this.style.indexOf('color') === -1
      &&
      this.style.indexOf('transform') === -1
    ) {
      // Set CSS Style if data-style contains a single property
      this.$element.css(this.style, Number(value * this.options.factor)  + this.unit );
    } else if (
      this.style
      &&
      typeof this.style === 'string'
      &&
      this.style.indexOf('color')
      &&
      this.style.indexOf('transform') === -1
    ) {
      // If CSS property has keyword "Color"
      this.$element.css(this.style, $.Color( setColors(this, value) ) );
    } else if (
      this.style
      &&
      typeof this.style === 'string'
      &&
      this.style.indexOf('transform') !== -1
    ) {
      // If CSS property has keyword "Transform"
      this.$element.css( eval('({' + setTransform(this, value) + '})') );
    } else {
      // Set CSS Styles if data-style contains multiple properties
      this.$element.css( setStyles(this, value) );
    }
  };

  function setColors(element, values){
    var value = [], separator = '';
    for(var i in values) {
      separator = values.length === Number(i)+1 ? '' : ', ';
      value += Number(values[i] * element.options.factor) + separator;
    }
    return JSON.parse('[' + value + ']');
  }

  function setTransform(element, value, index) {
    var styles = index ? element.style[index] : element.style,
        unit = index ? element.unit[index] : element.unit,
        factor = element.options.factor ? element.options.factor : 0,
        split = {
          0 : styles.indexOf('['),
          1: styles.indexOf(']')
        },
        property = styles.slice(styles.indexOf('transform'), split[0]),
        transform = styles.slice(split[0] +1, split[1]),
        values = typeof value === 'object' ? splitValues(value, factor, unit) : value * factor + unit,
        style = '"' + property  +'":"' + transform + '(' + values + ')"';
    return style
  }

  function splitValues(value, factor, unit) {
    var values = '', separator = ''
    for (var i in value) {
      separator = value.length === Number(i)+1 ? '' : ',';
      values += Number(value[i] * factor) + unit + separator
    }
    return values
  }

  function setStyles(element, value) {
    var style = '', separator = '', unit='';
    for(var i in element.style){
      separator = element.style.length === Number(i)+1 ? '' : ',';
      if (
        element.style[i].indexOf('color') !== -1
        &&
        element.style[i].indexOf('transform') === -1
      ) {
        style += '"' + element.style[i] + '"' + ':"' + $.Color( JSON.parse(value[i]) ) + '"' + separator;
      } else if (
        element.style[i].indexOf('transform') !== -1
      ) {
        style += setTransform(element, eval(value[i]), i) + separator;
      } else {
        unit = element.unit !== '' ?  element.unit[i] : '',
        style += '"' + element.style[i] + '"' + ':' + '"' + (value[i] * element.options.factor) + unit + '"'  + separator;
      }
    }
    var styles = eval('({' + style + '})');
    return styles;
  }

  // Calculate CSS Styles in relation to the scroll position
  ChangeOnScroll.prototype.CalculatePositionAndSetStyles = function() {
    if (
      this.style
      &&
      typeof this.style === 'string'
      &&
      this.style.indexOf('color') === -1 && this.style.indexOf('transform') === -1
    ) {
      // Set CSS Style if data-style contains a single property
      this.$element.css( this.style, calculate(this, this.start, this.end, 0) + this.unit );
    } else if (
      this.style
      &&
      typeof this.style === 'string'
      &&
      this.style.indexOf('color')
      &&
      this.style.indexOf('transform') === -1
    ) {
      // If CSS property has keyword "Color"
      this.$element.css( this.style, calculateColors(this) );
    } else if(
      this.style
      &&
      typeof this.style === 'string'
      &&
      this.style.indexOf('transform') !== -1
    ) {
      // If CSS property has keyword "Transform"

      // TODO - Split Values of Start and End and calculate them
      var transform = calculate(this, this.start, this.end, 0)
      this.$element.css( eval('({' + setTransform(this, transform) + '})') );
    } else {
      // Set CSS Styles if data-style contains multiple properties
      this.$element.css( calculatePositionAndSetStyles(this) );
    }
  };

  function calculate(element, start, end, index){
    var s = typeof start === 'number' ? start : start[index];
    var e = typeof end === 'number' ? end : end[index];
    var forward = Number(s) + ( element.Percentage() * (e - s) * element.options.factor );
    var backward = Number(s) - ( element.Percentage() * ( s - e) * element.options.factor );
    var result = element.options.reverse ? backward : forward;
    return result;
  }

  function calculatePositionAndSetStyles(element) {
    var style = '', separator = '', unit= '';
      for(var i in element.style) {
        separator = element.style.length === Number(i)+1 ? ' ' : ',';
        unit = typeof element.unit[i] !== 'undefined' ?  element.unit[i] : '';
        if (
          element.style[i].indexOf('color') !== -1
          &&
          element.style[i].indexOf('transform') === -1
        ) {
          style += '"' + element.style[i] + '"' + ':"' + calculateColors(element, eval(element.start[i]), eval(element.end[i])) + '"' + separator;
        } else if(
          element.style[i].indexOf('transform') !== -1
        ) {
          // TODO - Split Values of Start and End and calculate them
          style += setTransform(element, Number(calculate(element, element.start, element.end, i)), i) + separator;
        } else {
          style += '"' + element.style[i] + '"' + ':' + '"' + Number(calculate(element, element.start, element.end, i)) + unit + '"' + separator;
        }
      }
      var styles = eval('({' + style + '})');
      return styles;
  }


  function calculateColors (element, start, end){
    var r = Number(calculate(element, start ? start[0] : element.start[0], end ? end[0] : element.end[0]));
    var g = Number(calculate(element, start ? start[1] : element.start[1], end ? end[1] : element.end[1]));
    var b = Number(calculate(element, start ? start[2] : element.start[2], end ? end[2] : element.end[2]));
    var a = start && end ? calculate(element, start[3], end[3]) : calculate(element, element.start[3],element.end[3]) //
    var color = !a ? $.Color(r,g,b) : $.Color(r,g,b,a);
    return color;
  }

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

  $(window).on('load', function(){
    $('[data-spy="scroller"]').each(function(){
      var $spy = $(this);
      var data = $spy.data();
      Plugin.call($spy, data);
    });
    $(this).on('scroll.changeonscroll.data-api', function() {
      $('[data-spy="scroller"]').each(function(){
        var $spy = $(this);
        var data = $spy.data();
        Plugin.call($spy, data);
      });
    });
  });

}(jQuery));
