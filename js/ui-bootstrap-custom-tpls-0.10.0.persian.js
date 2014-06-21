/*
 * angular-ui-bootstrap-persianDatepicker
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.10.0-beta.1 - 2014-06-21
 * License: MIT
 */
angular.module('persianDate', [])
    .filter('persianDate', function ($locale,PersianDateService) {

       var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
                     // 1        2       3         4          5          6          7          8  9     10      11
		function padNumber(num, digits, trim) {
		  var neg = '';
		  if (num < 0) {
			neg =  '-';
			num = -num;
		  }
		  num = '' + num;
		  while(num.length < digits) num = '0' + num;
		  if (trim)
			num = num.substr(num.length - digits);
		  return neg + num;
		}


		function dateGetter(name, size, offset, trim) {
		  offset = offset || 0;
		  return function(date) {
		  //
			//var value = date['get' + name]();
			var persianDate = PersianDateService.gregorianDate_to_persianDateArray(date);
			var value = PersianDateService['get' + name](persianDate);
			//
			if (offset > 0 || value > -offset)
			  value += offset;
			if (value === 0 && offset == -12 ) value = 12;
			return padNumber(value, size, trim);
		  };
		}

		function dateStrGetter(name, shortForm) {
		  return function(date, formats) {
		  //
			//var value = date['get' + name]();
			
		
			var persianDate = PersianDateService.gregorianDate_to_persianDateArray(date);
			var value = PersianDateService['get' + name](persianDate);
			
			//
			var get = angular.uppercase(shortForm ? ('SHORT' + name) : name);

			return formats[get][value];
		  };
		}

		function timeZoneGetter(date) {
		  var zone = -1 * date.getTimezoneOffset();
		  var paddedZone = (zone >= 0) ? "+" : "";

		  paddedZone += padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) +
						padNumber(Math.abs(zone % 60), 2);

		  return paddedZone;
		}

		function ampmGetter(date, formats) {
		
		  return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
		}
		
		function concat(array1, array2, index) {
			var slice = [].slice;
		  return array1.concat(slice.call(array2, index));
		}
		var DATE_FORMATS = {
		  yyyy: dateGetter('FullYear', 4),
			yy: dateGetter('FullYear', 2, 0, true),
			 y: dateGetter('FullYear', 1),
		  MMMM: dateStrGetter('Month'),
		   MMM: dateStrGetter('Month', true),
			MM: dateGetter('Month', 2, 1),
			 M: dateGetter('Month', 1, 1),
			dd: dateGetter('Date', 2),
			 d: dateGetter('Date', 1),
			HH: dateGetter('Hours', 2),
			 H: dateGetter('Hours', 1),
			hh: dateGetter('Hours', 2, -12),
			 h: dateGetter('Hours', 1, -12),
			mm: dateGetter('Minutes', 2),
			 m: dateGetter('Minutes', 1),
			ss: dateGetter('Seconds', 2),
			 s: dateGetter('Seconds', 1),
			 // while ISO 8601 requires fractions to be prefixed with `.` or `,`
			 // we can be just safely rely on using `sss` since we currently don't support single or two digit fractions
		   sss: dateGetter('Milliseconds', 3),
		  EEEE: dateStrGetter('Day'),
		   EEE: dateStrGetter('Day', true),
			 a: ampmGetter,
			 Z: timeZoneGetter
		};
		
		var DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/,
			NUMBER_STRING = /^\-?\d+$/;
		function jsonStringToDate(string) {
    var match;
    if (match = string.match(R_ISO8601_STR)) {
      var date = new Date(0),
          tzHour = 0,
          tzMin  = 0,
          dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear,
          timeSetter = match[8] ? date.setUTCHours : date.setHours;

      if (match[9]) {
        tzHour = int(match[9] + match[10]);
        tzMin = int(match[9] + match[11]);
      }
      dateSetter.call(date, int(match[1]), int(match[2]) - 1, int(match[3]));
      var h = int(match[4]||0) - tzHour;
      var m = int(match[5]||0) - tzMin;
      var s = int(match[6]||0);
      var ms = Math.round(parseFloat('0.' + (match[7]||0)) * 1000);
      timeSetter.call(date, h, m, s, ms);
      return date;
    }
    return string;
  }

		return function(date, format) {
			var text = '',
				parts = [],
				fn, match;

			format = format || 'mediumDate';
			format = $locale.DATETIME_FORMATS[format] || format;
			if (angular.isString(date)) {
			  if (NUMBER_STRING.test(date)) {
				date = int(date);
			  } else {
				date = jsonStringToDate(date);
			  }
			}

			if (angular.isNumber(date)) {
			  date = new Date(date);
			}

			if (!angular.isDate(date)) {
			  return date;
			}

			while(format) {
			  match = DATE_FORMATS_SPLIT.exec(format);
			  if (match) {
				parts = concat(parts, match, 1);
				format = parts.pop();
			  } else {
				parts.push(format);
				format = null;
			  }
			}

			angular.forEach(parts, function(value){
			  fn = DATE_FORMATS[value];
			  
			  
		
			  
			  text += fn ? fn(date, {
        MONTH:
            'فروردین,اردیبهشت,خرداد,تیر,مرداد,شهریور,مهر,آبان,آذر,دی,بهمن,اسفند'
            .split(','),
        SHORTMONTH:  'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
        DAY: 'یک شنبه,دوشنبه,سه شنبه,چهارشنبه,پنج شنبه,جمعه,شنبه'.split(','),
        SHORTDAY: 'ی,د,س,چ,پ,ج,ش'.split(','),
        AMPMS: ['AM','PM'],
        medium: 'MMM d, y h:mm:ss a',
        short: 'M/d/yy h:mm a',
        fullDate: 'EEEE, MMMM d, y',
        longDate: 'MMMM d, y',
        mediumDate: 'MMM d, y',
        shortDate: 'M/d/yy',
        mediumTime: 'h:mm:ss a',
        shortTime: 'h:mm a'
      }) : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
			  //text += fn ? fn(date, $locale.DATETIME_FORMATS) : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
			});

			return text;
		};
    })
	.service('PersianDateService', function() {
		if (typeof fdef !== 'function') {
		var fdef = function (f) {
			return (typeof f === 'function');
		};
	}
	 this.isPersianDate=function(input) {
    var parts, tmp;

    if (input.search(/^\d+\-\d+\-\d+$/) == 0) {
        parts = input.split("-", 3);
    } else if (input.search(/^\d+\/\d+\/\d+$/) == 0) {
        parts = input.split('/', 3);
    } else if (input.search(/^\d{6}|\d{8}$/) == 0) {
        parts = [
        input.substr(0, input.length - 4),
        input.substr(input.length - 4, 2),
        input.substr(input.length - 2, 2)];
    } else if (
    (parts = input.match(/^(\d{2})(\d{2})$/)) || // 1234
    (parts = input.match(/^(\d{1,2})[/\-](\d{1,2})$/)) || // 1/2, 12/34, 1/23, 12/3 both with '/' and "-"
    (parts = input.match(/^(\d{1,2})$/)) // 1, 12
    ) {
        var curPDate = new Date();
        curPDate = gregorian_to_jd(curPDate.getFullYear(), curPDate.getMonth() + 1, curPDate.getDate());
        curPDate = jd_to_persian(curPDate);

        // set year
        parts[0] = curPDate[0];

        // single digit date is assumed to be day of current month
        // the position will be swapped in next step...
        if (typeof parts[2] == "undefined") parts[2] = curPDate[1];

        // swap month and day
        if (parseInt(parts[2], 10) <= 12) {
            tmp = parts[1];
            parts[1] = parts[2];
            parts[2] = tmp;
        }

    } else {
        return false;
    }

    for (var i = 0; i <= 2; ++i)
    parts[i] = parseInt(parts[i], 10);

    // --- month ---
    if (parts[1] > 12 || parts[1] <= 0) return false;

    // replace the day and year if position is incorrect
    if (parts[2] > persianMonthDays(longYear(parts[0]), parts[1])) {
        tmp = parts[2];
        parts[2] = parts[0];
        parts[0] = tmp;
    }

    // --- year ---
    // --- it's enough ! ---
    if (parts[0] > 9999) return false;

    if (parts[0] < 100) parts[0] = longYear(parts[0]);

    // day
    if (parts[2] === 0 || parts[2] > persianMonthDays(parts[0], parts[1])) return false;

    return parts;
};

// Converts two digit year to four digit
 var longYear=function(yr) {
    var curPDate, curCentury;

    if (yr >= 100) return yr;

    curPDate = new Date();
    curPDate = gregorian_to_jd(curPDate.getFullYear(), curPDate.getMonth() + 1, curPDate.getDate());
    curPDate = jd_to_persian(curPDate);
    curCentury = Math.floor(curPDate[0] / 100) * 100;

    if (Math.abs(curPDate[0] - curCentury - yr) > 70) curCentury = curCentury + 100;

    return curCentury + yr;
};

var GREGORIAN_EPOCH = 1721425.5,
    PERSIAN_EPOCH = 1948320.5;

if (!fdef(mod)) {
    var mod = function (a, b) {
        return a - (b * Math.floor(a / b));
    };
};

 var leap_persian=function(year) {
    return (
    (((((year - ((year > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
};

 var jd_to_persian=function(jd) {
    var year, month, day, depoch, cycle, cyear, ycycle, aux1, aux2, yday;

    jd = Math.floor(jd) + 0.5;

    depoch = jd - persian_to_jd(475, 1, 1);
    cycle = Math.floor(depoch / 1029983);
    cyear = mod(depoch, 1029983);
    if (cyear == 1029982) {
        ycycle = 2820;
    } else {
        aux1 = Math.floor(cyear / 366);
        aux2 = mod(cyear, 366);
        ycycle = Math.floor(((2134 * aux1) + (2816 * aux2) + 2815) / 1028522) + aux1 + 1;
    }
    year = ycycle + (2820 * cycle) + 474;
    if (year <= 0) {
        year--;
    }
    yday = (jd - persian_to_jd(year, 1, 1)) + 1;
    month = (yday <= 186) ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
    day = (jd - persian_to_jd(year, month, 1)) + 1;
    return new Array(year, month, day);
}
;
var  persian_to_jd=function(year, month, day) {
    var epbase, epyear;

    epbase = year - ((year >= 0) ? 474 : 473);
    epyear = 474 + mod(epbase, 2820);

    return day + ((month <= 7) ? ((month - 1) * 31) : (((month - 1) * 30) + 6)) + Math.floor(((epyear * 682) - 110) / 2816) + (epyear - 1) * 365 + Math.floor(epbase / 2820) * 1029983 + (PERSIAN_EPOCH - 1);
};

var  leap_gregorian=function(year) {
    return ((year % 4) == 0) && (!(((year % 100) == 0) && ((year % 400) != 0)));
};

var jd_to_gregorian=function(jd) {
    var wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad, yindex, year, month, day, yearday, leapadj;

    wjd = Math.floor(jd - 0.5) + 0.5;
    depoch = wjd - GREGORIAN_EPOCH;
    quadricent = Math.floor(depoch / 146097);
    dqc = mod(depoch, 146097);
    cent = Math.floor(dqc / 36524);
    dcent = mod(dqc, 36524);
    quad = Math.floor(dcent / 1461);
    dquad = mod(dcent, 1461);
    yindex = Math.floor(dquad / 365);
    year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
    if (!((cent == 4) || (yindex == 4))) {
        year++;
    }
    yearday = wjd - gregorian_to_jd(year, 1, 1);
    leapadj = (
    (wjd < gregorian_to_jd(year, 3, 1)) ? 0 : (leap_gregorian(year) ? 1 : 2));
    month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
    day = (wjd - gregorian_to_jd(year, month, 1)) + 1;

    return new Array(year, month, day);
};

var  gregorian_to_jd=function(year, month, day) {
    return (GREGORIAN_EPOCH - 1) + (365 * (year - 1)) + Math.floor((year - 1) / 4) + (-Math.floor((year - 1) / 100)) + Math.floor((year - 1) / 400) + Math.floor(
    (((367 * month) - 362) / 12) + (
    (month <= 2) ? 0 : (leap_gregorian(year) ? -1 : -2)) + day);
};

this.gregorian_to_persian=function(year, month, day){
	return jd_to_persian(gregorian_to_jd(year, month, day));
};

this.getFullYear = function(persianDate){
	return persianDate[0];
};
this.getMonth = function(persianDate){
	return persianDate[1] - 1;
};
this.getDay = function(persianDate){
	return this.persian_to_gregorian_Date(persianDate[0],persianDate[1],persianDate[2]).getDay();
};
this.getDate = function(persianDate){

	return persianDate[2];
};
this.gregorianDate_to_persianDateArray = function(date){
	return this.gregorian_to_persian(date.getFullYear(),date.getMonth() + 1,date.getDate());
};
this.persian_to_gregorian=function(year, month, day){
	return jd_to_gregorian(persian_to_jd(year, month, day));
};
this.persian_to_gregorian_Date=function(year, month, day){
	var greg = jd_to_gregorian(persian_to_jd(year, month, day));
	return new Date(greg[0],greg[1] - 1,greg[2]);
};
this.persianMonthDays=function(year, month) {
    return (
    month <= 6 ? 31 : (
    month <= 11 ? 30 : (
    month == 12 ? (leap_persian(year) ? 30 : 29) : 0)));
};

if (!fdef(stopPropagation)) {
    var stopPropagation = function (evt) {

        if (evt.stopPropagation) {
            evt.stopPropagation();
        } else {
            evt.cancelBubble = true;
        }

    };
};

if (!fdef(preventDefault)) {
    var preventDefault = function (evt) {

        if (evt.preventDefault) {
            evt.preventDefault();
        } else {
            evt.returnValue = false;
        }

    };
};

if (!fdef(faDigitsToEn)) {
    var faDigitsToEn = function (input) {
        var inputLength = input.length,
            strOutput = '',
            i = 0;

        for (i = 0; i < inputLength; ++i) {

            strOutput += String.fromCharCode(
            input.charCodeAt(i) >= 1776 && input.charCodeAt(i) <= 1785 ? input.charCodeAt(i) - 1728 : input.charCodeAt(i))

        }

        return strOutput;
    };
};

if (!fdef(enDigitsToFa)) {
    var enDigitsToFa = function (input) {
        input = input.toString();

        var inputLength = input.length,
            strOutput = '',
            i = 0;

        for (i = 0; i < inputLength; ++i) {

            strOutput += String.fromCharCode(
            input.charCodeAt(i) >= 48 && input.charCodeAt(i) <= 57 ? input.charCodeAt(i) + 1728 : input.charCodeAt(i))

        }

        return strOutput;
    };
};

if (!('trim' in String.prototype)) {
    String.prototype.trim = function () {
        return this.replace(/^\s*/, '').replace(/\s*$/, '');
    }
};

if (!('map' in Array.prototype)) {
    Array.prototype.map = function (mapper, that /*opt*/ ) {
        var other = new Array(this.length);

        for (var i = 0, n = this.length; i < n; i++)

        if (i in this) other[i] = mapper.call(that, this[i], i, this);

        return other;
    };
};
	});
	
 
 
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.position","ui.bootstrap.datepicker"]);
angular.module("ui.bootstrap.tpls", ["template/datepicker/datepicker.html","template/datepicker/popup.html"]);
angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, "position") || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft  || $document[0].documentElement.scrollLeft)
        };
      }
    };
  }]);

angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.position','persianDate'])

.constant('datepickerConfig', {
  dayFormat: 'dd',
  monthFormat: 'MMMM',
  yearFormat: 'yyyy',
  dayHeaderFormat: 'EEE',
  dayTitleFormat: 'MMMM yyyy',
  monthTitleFormat: 'yyyy',
  showWeeks: true,
  startingDay: 0,
  yearRange: 20,
  minDate: null,
  maxDate: null
})

.controller('DatepickerController', ['$scope', '$attrs','$filter', 'dateFilter', 'datepickerConfig','PersianDateService','persianDateFilter', function($scope, $attrs,$filter, dateFilter, dtConfig,PersianDateService,persianDateFilter) {
  var format = {
    day:        getValue($attrs.dayFormat,        dtConfig.dayFormat),
    month:      getValue($attrs.monthFormat,      dtConfig.monthFormat),
    year:       getValue($attrs.yearFormat,       dtConfig.yearFormat),
    dayHeader:  getValue($attrs.dayHeaderFormat,  dtConfig.dayHeaderFormat),
    dayTitle:   getValue($attrs.dayTitleFormat,   dtConfig.dayTitleFormat),
    monthTitle: getValue($attrs.monthTitleFormat, dtConfig.monthTitleFormat)
  },
  startingDay = getValue($attrs.startingDay,      dtConfig.startingDay),
  yearRange =   getValue($attrs.yearRange,        dtConfig.yearRange);

  this.minDate = dtConfig.minDate ? new Date(dtConfig.minDate) : null;
  this.maxDate = dtConfig.maxDate ? new Date(dtConfig.maxDate) : null;
  

  function getValue(value, defaultValue) {
    return angular.isDefined(value) ? $scope.$parent.$eval(value) : defaultValue;
  }

  function getDaysInMonth( year, month ) {
    return new Date(year, month, 0).getDate();
  }

  function getDates(startDate, n) {
    var dates = new Array(n);
    var current = startDate, i = 0;
    while (i < n) {
      dates[i++] = new Date(current);
      current.setDate( current.getDate() + 1 );
    }
    return dates;
  }

  function makeDate(date, format, isSelected, isSecondary) {
	//return { date: date, label: gregorian_to_persian(date.getFullYear(), date.getMonth() + 1, date.getDate())[0], selected: !!isSelected, secondary: !!isSecondary };
    return { date: date, label: persianDateFilter(date, format), selected: !!isSelected, secondary: !!isSecondary };
  }

  this.modes = [
    {
      name: 'day',
      getVisibleDates: function(date, selected) {
        var year = date.getFullYear();
		var month = date.getMonth();
		var day = date.getDate();
		
		//firstDayOfMonth
			var persianDate = PersianDateService.gregorian_to_persian(year, month + 1 ,day);
			var firstDayOfMonth = PersianDateService.persian_to_gregorian_Date(persianDate[0],persianDate[1],1);
			//var firstDayOfMonth = new Date(year, month, 1);
		//firstDayOfMonth
        var difference = startingDay - firstDayOfMonth.getDay(),
        numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : - difference,
        firstDate = new Date(firstDayOfMonth), numDates = 0;

        if ( numDisplayedFromPreviousMonth > 0 ) {
          firstDate.setDate(firstDate.getDate() - numDisplayedFromPreviousMonth);
          numDates += numDisplayedFromPreviousMonth; // Previous
        }
		//DaysInMonth
			numDates += PersianDateService.persianMonthDays(year, month ); // Current
			//numDates += getDaysInMonth(year, month + 1); // Current
		//DaysInMonth
        numDates += (7 - numDates % 7) % 7; // Next

        var days = getDates(firstDate, numDates), labels = new Array(7);
        for (var i = 0; i < numDates; i ++) {
          var dt = new Date(days[i]);
		  //set secondary
		  var persianMonthOfDate = PersianDateService.gregorian_to_persian(dt.getFullYear(), dt.getMonth()+1, dt.getDate())[1];
		  days[i] = makeDate(dt, format.day, (selected && selected.getDate() === dt.getDate() && selected.getMonth() === dt.getMonth() && selected.getFullYear() === dt.getFullYear()), persianMonthOfDate !== persianDate[1]);
          //days[i] = makeDate(dt, format.day, (selected && selected.getDate() === dt.getDate() && selected.getMonth() === dt.getMonth() && selected.getFullYear() === dt.getFullYear()), dt.getMonth() !== month);
		  //set secondary
        }
        for (var j = 0; j < 7; j++) {
		//
          //labels[j] = dateFilter(days[j].date, format.dayHeader);
		  labels[j] = persianDateFilter(days[j].date, format.dayHeader);
		  //
        }
        return { objects: days, title: persianDateFilter(date, format.dayTitle), labels: labels };
      },
      compare: function(date1, date2) {
        return (new Date( date1.getFullYear(), date1.getMonth(), date1.getDate() ) - new Date( date2.getFullYear(), date2.getMonth(), date2.getDate() ) );
      },
      split: 7,
      step: { months: 1 }
    },
    {
      name: 'month',
      getVisibleDates: function(date, selected) {
        var months = new Array(12); 
		//
		//var year = date.getFullYear();
		var persianDate = PersianDateService.gregorianDate_to_persianDateArray(date);
		
		var persianSelected = selected ? PersianDateService.gregorianDate_to_persianDateArray(selected):selected;
		
		var year = PersianDateService.getFullYear(persianDate);
		//
        for ( var i = 0; i < 12; i++ ) {
			//
          //var dt = new Date(year, i, 1);
		  var dt = PersianDateService.persian_to_gregorian_Date(year,i + 1,1);
			
          //months[i] = makeDate(dt, format.month, (selected && selected.getMonth() === i && selected.getFullYear() === year));
		  months[i] = makeDate(dt, format.month, (persianSelected && PersianDateService.getMonth(persianSelected) === i && PersianDateService.getFullYear(persianSelected) === year));
		  //
        }
        return { objects: months, title: persianDateFilter(date, format.monthTitle) };
      },
      compare: function(date1, date2) {
        //return new Date( date1.getFullYear(), date1.getMonth() ) - new Date( date2.getFullYear(), date2.getMonth() );
		//FIXME
      },
      split: 3,
      step: { years: 1 }
    },
    {
      name: 'year',
      getVisibleDates: function(date, selected) {
        var years = new Array(yearRange);
		//
			var persianDate = PersianDateService.gregorianDate_to_persianDateArray(date);
			var year = PersianDateService.getFullYear(persianDate);
			//var year = date.getFullYear(); 
		//
		
		var startYear = parseInt((year - 1) / yearRange, 10) * yearRange + 1;
        for ( var i = 0; i < yearRange; i++ ) {
			//
			var dt = PersianDateService.persian_to_gregorian_Date(startYear + i, 1, 1);
			//var dt = new Date(startYear + i, 0, 1);
			//
          
          years[i] = makeDate(dt, format.year, (selected && selected.getFullYear() === dt.getFullYear()));
        }
        return { objects: years, title: [years[0].label, years[yearRange - 1].label].join(' - ') };
      },
      compare: function(date1, date2) {
        return date1.getFullYear() - date2.getFullYear();
      },
      split: 5,
      step: { years: yearRange }
    }
  ];

  this.isDisabled = function(date, mode) {
    var currentMode = this.modes[mode || 0];
    return ((this.minDate && currentMode.compare(date, this.minDate) < 0) || (this.maxDate && currentMode.compare(date, this.maxDate) > 0) || ($scope.dateDisabled && $scope.dateDisabled({date: date, mode: currentMode.name})));
  };
}])

.directive( 'datepicker', ['dateFilter', '$parse', 'datepickerConfig', '$log','PersianDateService','persianDateFilter' ,function (dateFilter, $parse, datepickerConfig, $log ,PersianDateService,persianDateFilter) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/datepicker/datepicker.html',
    scope: {
      dateDisabled: '&'
    },
    require: ['datepicker', '?^ngModel'],
    controller: 'DatepickerController',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0], ngModel = ctrls[1];

      if (!ngModel) {
        return; // do nothing if no ng-model
      }

      // Configuration parameters
      var mode = 0, selected = new Date(), showWeeks = datepickerConfig.showWeeks;

      if (attrs.showWeeks) {
        scope.$parent.$watch($parse(attrs.showWeeks), function(value) {
          showWeeks = !! value;
          updateShowWeekNumbers();
        });
      } else {
        updateShowWeekNumbers();
      }

      if (attrs.min) {
        scope.$parent.$watch($parse(attrs.min), function(value) {
          datepickerCtrl.minDate = value ? new Date(value) : null;
          refill();
        });
      }
      if (attrs.max) {
        scope.$parent.$watch($parse(attrs.max), function(value) {
          datepickerCtrl.maxDate = value ? new Date(value) : null;
          refill();
        });
      }

      function updateShowWeekNumbers() {
        scope.showWeekNumbers = mode === 0 && showWeeks;
      }

      // Split array into smaller arrays
      function split(arr, size) {
        var arrays = [];
        while (arr.length > 0) {
          arrays.push(arr.splice(0, size));
        }
        return arrays;
      }

      function refill( updateSelected ) {
        var date = null, valid = true;

        if ( ngModel.$modelValue ) {
          date = new Date( ngModel.$modelValue );

          if ( isNaN(date) ) {
            valid = false;
            $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
          } else if ( updateSelected ) {
            selected = date;
          }
        }
        ngModel.$setValidity('date', valid);

        var currentMode = datepickerCtrl.modes[mode], data = currentMode.getVisibleDates(selected, date);
        angular.forEach(data.objects, function(obj) {
          obj.disabled = datepickerCtrl.isDisabled(obj.date, mode);
        });

        ngModel.$setValidity('date-disabled', (!date || !datepickerCtrl.isDisabled(date)));

        scope.rows = split(data.objects, currentMode.split);
        scope.labels = data.labels || [];
        scope.title = data.title;
      }

      function setMode(value) {
        mode = value;
        updateShowWeekNumbers();
        refill();
      }

      ngModel.$render = function() {
        refill( true );
      };

      scope.select = function( date ) {
        if ( mode === 0 ) {
          var dt = ngModel.$modelValue ? new Date( ngModel.$modelValue ) : new Date(0, 0, 0, 0, 0, 0, 0);
          dt.setFullYear( date.getFullYear(), date.getMonth(), date.getDate() );
          ngModel.$setViewValue( dt );
          refill( true );
        } else {
		
          selected = date;
          setMode( mode - 1 );
        }
      };
      scope.move = function(direction) {
        var step = datepickerCtrl.modes[mode].step;
		//
		var persianDate = PersianDateService.gregorianDate_to_persianDateArray(selected);
		selected = PersianDateService.persian_to_gregorian_Date(persianDate[0] + direction * (step.years || 0),persianDate[1] + direction * (step.months || 0) ,1);
		//selected.setMonth( selected.getMonth() + direction * (step.months || 0) );
        //selected.setFullYear( selected.getFullYear() + direction * (step.years || 0) );
		//
        refill();
      };
      scope.toggleMode = function() {
        setMode( (mode + 1) % datepickerCtrl.modes.length );
      };
      scope.getWeekNumber = function(row) {
        return ( mode === 0 && scope.showWeekNumbers && row.length === 7 ) ? getISO8601WeekNumber(row[0].date) : null;
      };

      function getISO8601WeekNumber(date) {
        var checkDate = new Date(date);
        checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
        var time = checkDate.getTime();
        checkDate.setMonth(0); // Compare with Jan 1
        checkDate.setDate(1);
        return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
      }
    }
  };
}])

.constant('datepickerPopupConfig', {
  dateFormat: 'yyyy-MM-dd',
  currentText: 'Today',
  toggleWeeksText: 'Weeks',
  clearText: 'Clear',
  closeText: 'Done',
  closeOnDateSelection: true,
  appendToBody: false,
  showButtonBar: true
})

.directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'datepickerPopupConfig', 'datepickerConfig','persianDateFilter',
function ($compile, $parse, $document, $position, dateFilter, datepickerPopupConfig, datepickerConfig,persianDateFilter) {
  return {
    restrict: 'EA',
    require: 'ngModel',
    link: function(originalScope, element, attrs, ngModel) {
      var scope = originalScope.$new(), // create a child scope so we are not polluting original one
          dateFormat,
          closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? originalScope.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
          appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? originalScope.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;

      attrs.$observe('datepickerPopup', function(value) {
          dateFormat = value || datepickerPopupConfig.dateFormat;
          ngModel.$render();
      });

      scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? originalScope.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

      originalScope.$on('$destroy', function() {
        $popup.remove();
        scope.$destroy();
      });

      attrs.$observe('currentText', function(text) {
        scope.currentText = angular.isDefined(text) ? text : datepickerPopupConfig.currentText;
      });
      attrs.$observe('toggleWeeksText', function(text) {
        scope.toggleWeeksText = angular.isDefined(text) ? text : datepickerPopupConfig.toggleWeeksText;
      });
      attrs.$observe('clearText', function(text) {
        scope.clearText = angular.isDefined(text) ? text : datepickerPopupConfig.clearText;
      });
      attrs.$observe('closeText', function(text) {
        scope.closeText = angular.isDefined(text) ? text : datepickerPopupConfig.closeText;
      });

      var getIsOpen, setIsOpen;
      if ( attrs.isOpen ) {
        getIsOpen = $parse(attrs.isOpen);
        setIsOpen = getIsOpen.assign;

        originalScope.$watch(getIsOpen, function updateOpen(value) {
          scope.isOpen = !! value;
        });
      }
      scope.isOpen = getIsOpen ? getIsOpen(originalScope) : false; // Initial state

      function setOpen( value ) {
        if (setIsOpen) {
          setIsOpen(originalScope, !!value);
        } else {
          scope.isOpen = !!value;
        }
      }

      var documentClickBind = function(event) {
        if (scope.isOpen && event.target !== element[0]) {
          scope.$apply(function() {
            setOpen(false);
          });
        }
      };

      var elementFocusBind = function() {
        scope.$apply(function() {
          setOpen( true );
        });
      };

      // popup element used to display calendar
      var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
      popupEl.attr({
        'ng-model': 'date',
        'ng-change': 'dateSelection()'
      });
      var datepickerEl = angular.element(popupEl.children()[0]),
          datepickerOptions = {};
      if (attrs.datepickerOptions) {
        datepickerOptions = originalScope.$eval(attrs.datepickerOptions);
        datepickerEl.attr(angular.extend({}, datepickerOptions));
      }

      // TODO: reverse from dateFilter string to Date object
      function parseDate(viewValue) {
        if (!viewValue) {
          ngModel.$setValidity('date', true);
          return null;
        } else if (angular.isDate(viewValue)) {
          ngModel.$setValidity('date', true);
          return viewValue;
        } else if (angular.isString(viewValue)) {
          var date = new Date(viewValue);
          if (isNaN(date)) {
            ngModel.$setValidity('date', false);
            return undefined;
          } else {
            ngModel.$setValidity('date', true);
            return date;
          }
        } else {
          ngModel.$setValidity('date', false);
          return undefined;
        }
      }
      ngModel.$parsers.unshift(parseDate);

      // Inner change
      scope.dateSelection = function(dt) {
        if (angular.isDefined(dt)) {
          scope.date = dt;
        }
        ngModel.$setViewValue(scope.date);
        ngModel.$render();

        if (closeOnDateSelection) {
          setOpen( false );
        }
      };

      element.bind('input change keyup', function() {
        scope.$apply(function() {
          scope.date = ngModel.$modelValue;
        });
      });

      // Outter change
      ngModel.$render = function() {
        var date = ngModel.$viewValue ? persianDateFilter(ngModel.$viewValue, dateFormat) : '';
        element.val(date);
        scope.date = ngModel.$modelValue;
      };

      function addWatchableAttribute(attribute, scopeProperty, datepickerAttribute) {
        if (attribute) {
          originalScope.$watch($parse(attribute), function(value){
            scope[scopeProperty] = value;
          });
          datepickerEl.attr(datepickerAttribute || scopeProperty, scopeProperty);
        }
      }
      addWatchableAttribute(attrs.min, 'min');
      addWatchableAttribute(attrs.max, 'max');
      if (attrs.showWeeks) {
        addWatchableAttribute(attrs.showWeeks, 'showWeeks', 'show-weeks');
      } else {
        scope.showWeeks = 'show-weeks' in datepickerOptions ? datepickerOptions['show-weeks'] : datepickerConfig.showWeeks;
        datepickerEl.attr('show-weeks', 'showWeeks');
      }
      if (attrs.dateDisabled) {
        datepickerEl.attr('date-disabled', attrs.dateDisabled);
      }

      function updatePosition() {
        scope.position = appendToBody ? $position.offset(element) : $position.position(element);
        scope.position.top = scope.position.top + element.prop('offsetHeight');
      }

      var documentBindingInitialized = false, elementFocusInitialized = false;
      scope.$watch('isOpen', function(value) {
        if (value) {
          updatePosition();
          $document.bind('click', documentClickBind);
          if(elementFocusInitialized) {
            element.unbind('focus', elementFocusBind);
          }
          element[0].focus();
          documentBindingInitialized = true;
        } else {
          if(documentBindingInitialized) {
            $document.unbind('click', documentClickBind);
          }
          element.bind('focus', elementFocusBind);
          elementFocusInitialized = true;
        }

        if ( setIsOpen ) {
          setIsOpen(originalScope, value);
        }
      });

      scope.today = function() {
        scope.dateSelection(new Date());
      };
      scope.clear = function() {
        scope.dateSelection(null);
      };

      var $popup = $compile(popupEl)(scope);
      if ( appendToBody ) {
        $document.find('body').append($popup);
      } else {
        element.after($popup);
      }
    }
  };
}])

.directive('datepickerPopupWrap', function() {
  return {
    restrict:'EA',
    replace: true,
    transclude: true,
    templateUrl: 'template/datepicker/popup.html',
    link:function (scope, element, attrs) {
      element.bind('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
      });
    }
  };
});

angular.module("template/datepicker/datepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/datepicker.html",
    "<table>\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "      <th colspan=\"{{rows[0].length - 2 + showWeekNumbers}}\"><button type=\"button\" class=\"btn btn-default btn-sm btn-block\" ng-click=\"toggleMode()\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "    </tr>\n" +
    "    <tr ng-show=\"labels.length > 0\" class=\"h6\">\n" +
    "      <th ng-show=\"showWeekNumbers\" class=\"text-center\">#</th>\n" +
    "      <th ng-repeat=\"label in labels\" class=\"text-center\">{{label}}</th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows\">\n" +
    "      <td ng-show=\"showWeekNumbers\" class=\"text-center\"><em>{{ getWeekNumber(row) }}</em></td>\n" +
    "      <td ng-repeat=\"dt in row\" class=\"text-center\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\"><span ng-class=\"{'text-muted': dt.secondary}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/datepicker/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/popup.html",
    "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\">\n" +
    "	<li ng-transclude></li>\n" +
    "	<li ng-show=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
    "		<span class=\"btn-group\">\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"today()\">{{currentText}}</button>\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-default\" ng-click=\"showWeeks = ! showWeeks\" ng-class=\"{active: showWeeks}\">{{toggleWeeksText}}</button>\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"clear()\">{{clearText}}</button>\n" +
    "		</span>\n" +
    "		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"isOpen = false\">{{closeText}}</button>\n" +
    "	</li>\n" +
    "</ul>\n" +
    "");
}]);
