/*
 * jQuery wraplines plugin
 *
 * Copyright (c) 2010 Paul Bennett (http://pmbennett.net)
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 */

jQuery.fn.wraplines = function(options) {
	var options = jQuery.extend({
		lineWrap: 'span', //name of html element used to wrap lines
		lineClassPrefix: 'wrap_line_', // prefix for class name to be added to line wrapper element
		wordClassPrefix: 'w_line_',
		index: 0,
		offsetTop: 0,
		offsetLeft: 0
	}, options);
	return this.each(function() {
		options.index  = 0;
		options.offset = 0;
		var parentElm = $(this);
		var elmText = $(parentElm).text();
		$(parentElm).html(function(ind, htm) {
			var $repText = '<' + options.lineWrap + '>' + elmText.replace( /\s/g, '</' + options.lineWrap + '> <' + options.lineWrap + '>');
			$repText = $repText + '</' + options.lineWrap + '>';
			return $repText;
		});
		$(options.lineWrap, parentElm).each(function() {
			var spanOffset = $(this).offset();
			if (spanOffset.top > options.offsetTop) {
				options.offsetTop = spanOffset.top;
				options.index++;
			}
			$(this).addClass(options.wordClassPrefix + options.index);
		});
		// in IE 7+8, the first span on a line will have the wrong offset. 
		// Looks like some bug as it has the same top offset as previous line!?
		// Seems to work fine in IE6 though oddly!!!!!
		if ($.browser.msie && ($.browser.version == 7 || $.browser.version == 8)) {
			for (var x = 1; x <= options.index; x++) {
				var $spans = $('.' + options.wordClassPrefix + x);
				$spans
				.eq($spans.length - 1)
				.removeClass(options.wordClassPrefix + x)
				.addClass(options.wordClassPrefix + (x+1))
			}
		}
		for (var x = 1; x <= options.index; x++) {
			$('.' + options.wordClassPrefix + x, parentElm)
			.wrapAll('<' + options.lineWrap + ' class="' + options.lineClassPrefix + x + '" />')
			.append(" ");
			var innerText = $('.' + options.lineClassPrefix + x, parentElm).text();
			$('.' + options.lineClassPrefix + x, parentElm).html(function() {
				return innerText;
			});
		}
	});
};
