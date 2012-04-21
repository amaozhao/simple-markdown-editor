/*
 * jQuery Hotkeys Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Based upon the plugin by Tzury Bar Yochay:
 * http://github.com/tzuryby/hotkeys
 *
 * Original idea by:
 * Binny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/
*/

(function(jQuery){
	
	jQuery.hotkeys = {
		version: "0.8",

		specialKeys: {
			8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
			20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
			37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
			96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
			104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
			112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
			120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 188: ",", 190: ".",
			191: "/", 224: "meta"
 		},
	
		shiftNums: {
			"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", 
			"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<", 
			".": ">",  "/": "?",  "\\": "|"
		}
	};

	function keyHandler( handleObj ) {
		// Only care when a possible input has been specified
		if ( typeof handleObj.data !== "string" ) {
			return;
		}
		
		var origHandler = handleObj.handler,
			keys = handleObj.data.toLowerCase().split(" ");
	
		handleObj.handler = function( event ) {
			// Don't fire in text-accepting inputs that we didn't directly bind to
			if ( this !== event.target && (/textarea|select/i.test( event.target.nodeName ) ||
				 event.target.type === "text" || $(event.target).prop('contenteditable') == 'true' )) {
				return;
			}
			
			// Keypress represents characters, not special keys
			var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[ event.which ],
				character = String.fromCharCode( event.which ).toLowerCase(),
				key, modif = "", possible = {};

			// check combinations (alt|ctrl|shift+anything)
			if ( event.altKey && special !== "alt" ) {
				modif += "alt+";
			}

			if ( event.ctrlKey && special !== "ctrl" ) {
				modif += "ctrl+";
			}
			
			// TODO: Need to make sure this works consistently across platforms
			if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
				modif += "meta+";
			}

			if ( event.shiftKey && special !== "shift" ) {
				modif += "shift+";
			}

			if ( special ) {
				possible[ modif + special ] = true;

			} else {
				possible[ modif + character ] = true;
				possible[ modif + jQuery.hotkeys.shiftNums[ character ] ] = true;

				// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
				if ( modif === "shift+" ) {
					possible[ jQuery.hotkeys.shiftNums[ character ] ] = true;
				}
			}

			for ( var i = 0, l = keys.length; i < l; i++ ) {
				if ( possible[ keys[i] ] ) {
					return origHandler.apply( this, arguments );
				}
			}
		};
	}

	jQuery.each([ "keydown", "keyup", "keypress" ], function() {
		jQuery.event.special[ this ] = { add: keyHandler };
	});

})( jQuery );
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. 
 
 Created by Jonas Gauffin. http://www.gauffin.org
 
 Usage:
 
 // get selection
 var selection = new textSelector($('#mytextArea'));
 selection.replace('Will replace selected text');
 
 */

function TextSelector(elem) {
    "use strict";
    if (typeof elem === 'undefined')
        throw 'Failed to find passed element';
    
    if (elem instanceof jQuery) {
        elem = elem[0];
    }
    this.parent = elem;
    this._stored = null;
    
    /** @returns object {start: X, end: Y, length: Z} 
      * x = start character
      * y = end character
      * length: number of selected characters
      */
    this.get = function () {
        if (typeof elem.selectionStart !== 'undefined') {
            return { start: elem.selectionStart, end: elem.selectionEnd, length: elem.selectionEnd - elem.selectionStart };
        }

        /*
        elem.focus();
        var range = document.selection.createRange();
        var length = range.text.length;
        range.moveStart ('character', elem.value.length);
        var pos = elem.value.length - length;
        */
        var range = document.selection.createRange();
        var stored_range = range.duplicate();
        stored_range.moveToElementText(elem);
        stored_range.setEndPoint('EndToEnd', range);
        var start = stored_range.text.length - range.text.length;
        var end = start + range.text.length;

        return { start: start, end: end, length: range.text.length };
    };
    
    /** Replace selected text with the specified one */
    this.replace = function(newText) {
        if (typeof elem.selectionStart !== 'undefined') {
            elem.value = elem.value.substr(0, elem.selectionStart) + newText + elem.value.substr(elem.selectionEnd);
            return this;
        }
        
        elem.focus();
        document.selection.createRange().text = newText;
        return this;
    };
    
    /** Store current selection */
    this.store = function() {
        this._stored = this.get();
    };
    
    /** load last selection */
    this.load = function() {
        this.select(this._stored);
    };
    
    /** Selected the specified range
     * @param start Start character
     * @param end End character
     */
    this.select = function(start, end) {
        // using the object from get
        if (typeof start.start !== 'undefined') {
            end = start.end;
            start = start.start;
        }
        if (typeof elem.setSelectionRange !== 'undefined') {
            elem.focus();
            elem.setSelectionRange(start, end);
        }
        else if (typeof elem.createTextRange !== 'undefined') {
        
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
        
        return this;
    };
    
    /** @returns if anything is selected */
    this.isSelected = function() {
        return this.get().length !== 0;
    };
    
    /** @returns selected text */
    this.text = function() {
        if (typeof document.selection !== 'undefined') {
            //elem.focus();
            //console.log(document.selection.createRange().text);
            return document.selection.createRange().text;
        }
        
        return elem.value.substr(elem.selectionStart, elem.selectionEnd - elem.selectionStart);
    };
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. 
 
 Created by Jonas Gauffin. http://www.gauffin.org
 
 Usage:
 
 $('editor').griffinEditor();
 
 */

String.prototype.capitalize = function(){
    "use strict";
   return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};

(function($) {
    "use strict";

    /** Global extension points for griffinEditor */
    $.griffinEditorExtension = { 
        /** Used to handle everything that is written in the text area */
        textHandler: null, 
        
        /** Used by a text handler when the user want's to insert an image 
         * @param options { title: someTitleNullOrUndefined, url: someUrlNullOrUndeinfed, success: function(options){} }
         * successFunction options = { title: X, url: Y }
         */
        
        imageDialog: function(options) {
            if($('#griffin-image-dialog').length == 0){
                $('<div class="modal fade form-horizontal" id="griffin-image-dialog">'+
                	'<div class="modal-header">'+
    					'<a class="close" data-dismiss="modal">×</a>'+
    					'<h3>插入图片</h3>'+
  					'</div>'+
  					'<div class="modal-body">'+
	  					'<div class="control-group">'+
	            			'<label class="control-label" for="focusedInput">图片标题</label>'+
		            		'<div class="controls">'+
		              			'<input class="input" name="griffin-image-title" type="text" placeholder="图片标题">'+
		            		'</div>'+
	          			'</div>'+
	          			'<div class="control-group">'+
	            			'<label class="control-label">图片地址</label>'+
		            		'<div class="controls">'+
		              			'<input class="input" name="griffin-image-url" type="text" placeholder="图片地址">'+
		            		'</div>'+
	          			'</div>'+
  					'</div>'+
  					'<div class="modal-footer">'+
    					'<button class="btn btn-danger">取消</button>'+
    					'<button class="btn btn-primary">插入图片</button>'+
  					'</div>'+
                '</div>').appendTo('body');
            }
            $('#griffin-image-dialog').modal('show');
			$('#griffin-image-dialog .btn-primary').click(function(){
	            var $title = $('input[name="griffin-image-title"]');
				var $url = $('input[name="griffin-image-url"]');
				if($title.val() != '' && $url.val() != ''){
					options.success({ url: $url.val(), title: $title.val() });
					$('#griffin-image-dialog').modal('hide');
				} else{
					if($title.val() === ''){
						$title.parent().parent().addClass('error');
					} else {
						$title.parent().parent().removeClass('error');
					}
					if($url.val() === ''){
						$url.parent().parent().addClass('error');
					} else {
						$url.parent().parent().removeClass('error');
					}
				}
			});
			$('#griffin-image-dialog .btn-danger').click(function(){
				$('#griffin-image-dialog').modal('hide');
			});
			$('#griffin-image-dialog').on('hidden', function () {
				$('#griffin-image-dialog').remove();
			});
        },

        /** Used by a text handler when the user want's to insert a link 
         * @param options { title: someTitleNullOrUndefined, url: someUrlNullOrUndeinfed, success: function(options){} }
         * successFunction options = { title: X, url: Y }
         */
        linkDialog: function(options) { 
            if($('#griffin-link-dialog').length == 0){
                $('<div class="modal fade form-horizontal" id="griffin-link-dialog">'+
                	'<div class="modal-header">'+
    					'<a class="close" data-dismiss="modal">×</a>'+
    					'<h3>插入链接</h3>'+
  					'</div>'+
  					'<div class="modal-body">'+
	  					'<div class="control-group">'+
	            			'<label class="control-label" for="focusedInput">链接标题</label>'+
		            		'<div class="controls">'+
		              			'<input class="input" name="griffin-link-title" type="text" placeholder="链接标题">'+
		            		'</div>'+
	          			'</div>'+
	          			'<div class="control-group">'+
	            			'<label class="control-label">链接地址</label>'+
		            		'<div class="controls">'+
		              			'<input class="input" name="griffin-link-url" type="text" placeholder="链接地址">'+
		            		'</div>'+
	          			'</div>'+
  					'</div>'+
  					'<div class="modal-footer">'+
    					'<button class="btn btn-danger">取消</button>'+
    					'<button class="btn btn-primary">插入链接</button>'+
  					'</div>'+
                '</div>').appendTo('body');
            }
            $('#griffin-link-dialog').modal('show');
			$('#griffin-link-dialog .btn-primary').click(function(){
	            var $title = $('input[name="griffin-link-title"]');
				var $url = $('input[name="griffin-link-url"]');
				if($title.val() != '' && $url.val() != ''){
					options.success({ url: $url.val(), title: $title.val() });
					$('#griffin-link-dialog').modal('hide');
				} else{
					if($title.val() === ''){
						$title.parent().parent().addClass('error');
					} else {
						$title.parent().parent().removeClass('error');
					}
					if($url.val() === ''){
						$url.parent().parent().addClass('error');
					} else {
						$url.parent().parent().removeClass('error');
					}
				}
			});
			$('#griffin-link-dialog .btn-danger').click(function(){
				$('#griffin-link-dialog').modal('hide');
			});
			$('#griffin-link-dialog').on('hidden', function () {
				$('#griffin-link-dialog').remove();
			});
        } 
    };

    //globals
    $.griffinEditor = {

        texts: {
            title: 'Please wait, loading..'
        },
        translations: []
    };
    
    var methods = {
        init: function(options) {

            var settings = $.extend({
                textHandler: $.griffinEditorExtension.textHandler,
                autoSize: false
            }, options);

            return this.each(function() {
                var $this = $(this);
                var self = this;
                var data = $this.data('griffin-editor');

                this.trimSpaceInSelection = function () {
                    var selectedText = data.selection.text();
                    var pos = data.selection.get();
                    if (selectedText.substr(selectedText.length - 1, 1) === ' ') {
                        data.selection.select(pos.start, pos.end - 1);
                    }
                };
                
                this.getActionNameFromClass = function(classString) {
                    var classNames = classString.split(/\s+/);
                    for (var i = 0; i < classNames.length; i++) {
                        if (classNames[i].substr(0, 7) === 'button-') {
                            return classNames[i].substr(7);
                        }
                    }
                    
                    return null;
                };
                
                this.assignAccessKeys = function() {
                    $('span[accesskey]', data.toolbar).each(function() {
                        var button = this;
                        if (jQuery.hotkeys) {
                            $(data.editor).bind('keydown', 'ctrl+' + $(this).attr('accesskey'), function(e) {
                                e.preventDefault();
                                
                                var actionName = self.getActionNameFromClass(button.className);
                                var args = [];
                                args[0] = actionName;
                                methods.invokeAction.apply(self, args); 
                                self.preview();
                                return this;
                            });
                        
                            //$(this).attr('title', $(this).attr('title') + ' [CTRL+' + $(this).attr('accesskey').toUpperCase() + ']');
                        } 
                    });
                };
                
                this.preview = function() {
                    if (data.preview.length === 0) {
                        return this;
                    }
                    
                    data.options.textHandler.preview(self, data.preview, data.editor.val());
                    
                    // no code highlighter.
                    if (typeof hljs === 'undefined') {
                        return this;
                    }
                        
                    var timer = $(this).data('editor-timer');
                    if (typeof timer !== 'undefined') {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(function() {
                        
                        hljs.tabReplace = '    ';
                        var text = $("code", data.preview).html();
                        if (text === null) {
                            return;
                        }
                        var result = hljs.highlightAuto(text);
                        $('code', data.preview).html(result.value);
                    }, 1000);
                    $(this).data('editor-timer', timer);

                    return this;
                };
                this.autoSize = function () {
                    if (!data.options.autoSize) {
                        return this;
                    }

                    var twin = $(this).data('twin-area');
                    if (typeof twin === 'undefined') {
                        twin = $('<textarea style="position:absolute; top: -10000px"></textarea>');
                        twin.appendTo('body');
                        //div.appendTo('body');
                        $(this).data('twin-area', twin);
                        $(this).data('originalSize', { 
                            width: data.editor[0].clientWidth, 
                            height: data.editor[0].clientHeight, 
                            //position: data.editor.css('position'), 
                            top: data.editor.css('top'), 
                            left: data.editor.css('left')
                        });
                    }
                    twin.css('height', data.editor[0].clientHeight);
                    twin.css('width', data.editor[0].clientWidth);
                    twin.html(data.editor.val() + 'some\r\nmore\r\n');
                    if (twin[0].clientHeight < twin[0].scrollHeight) {
                        var style = { 
                            height: (data.editor[0].clientHeight + 100) + 'px', 
                            width: data.editor[0].clientWidth, 
                            //position: 'absolute', 
                            top: data.editor.offset().top, 
                            left: data.editor.offset().left
                            //zindex: 99
                        };
                        $(data.editor).css(style);
                        $(this).data('expandedSize', style);
                    }

                    return this;
                };
                
                if (typeof data !== 'undefined') {
                    return this;
                }
                            
                $('.toolbar span[class^="button"]', this).click(function(e) {
                    e.preventDefault();
                    
                    var actionName = self.getActionNameFromClass(this.className);
                    var args = [];
                    args[0] = actionName;
                    methods.invokeAction.apply(self, args); 
                    self.preview();
                    return this;
                });
                
                $('textarea', this).bind('paste', function(e) {
                    setTimeout(function() {
                        self.preview();
                    }, 100);
                });
                
                $('textarea', this).keyup(function() {
                    self.preview();
                    self.autoSize();
                });
                
                $('textarea', this).blur(function() {
                    if (data.options.autoSize) {
                        var originalSize = $(this).data('originalSize');
                        if (typeof originalSize !== 'undefined') {
                            $(data.editor).css(originalSize);
                        }
                    }
                });
                $('textarea', this).focus(function() {
                    if (data.options.autoSize) {
                        var expandedSize = $(this).data('expandedSize');
                        if (typeof expandedSize !== 'undefined') {
                            $(data.editor).css(expandedSize);
                        }
                    }
                });

                data = { };
                data.toolbar = $('.toolbar', $this);
                data.editor = $('textarea', $this);
                data.selection = new TextSelector(data.editor);
                data.preview = $('#' + $this.attr('id') + '-preview');
                data.options = settings;
                $(this).data('griffin-editor', data);
                this.assignAccessKeys();
                this.preview();

                return this;
            });
        },
        destroy: function( ) {

            return this.each(function() {

                var $this = $(this),
                    data = $this.data('overlay');

                // Namespacing FTW
                $(window).unbind('.elementOverlay');
                data.overlay.remove();
                $this.removeData('overlay');

            });
        },
        
        /** Invoke a toolbar action */
        invokeAction: function(actionName) {
            var $this = $(this),
                data = $this.data('griffin-editor');
                
            this.trimSpaceInSelection();
            
            var context = {};
            data.options.textHandler.invokeAction(this, actionName, data.selection, context);
        },
        
        /** Refresh the preview window (if any) */
        preview: function() {
            var $this = $(this),
                data = $this.data('griffin-editor');
                
            this.preview();
        }
    };

    $.fn.griffinEditor = function(method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.griffinEditor');
        }

    };

})(jQuery);
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. 


 Markdown integration for griffin.editor.
 Created by Jonas Gauffin. http://www.gauffin.org
 
 Usage:
 
 Include the script below the main editor script.
 
 */

(function($) {
    "use strict";
    
	$.griffinEditorExtension.textHandler = {
		invokeAction: function($editor, actionName, selection, context) {
	//			console.log(griffinEditor);

			context.editor = $editor;
			var method = 'action' + actionName.capitalize();
			if (this[method]) {
				var args = [];
				args[0] = selection;
				args[1] = context;
				return this[method].apply(this, args);
			} else {
                if (typeof alert !== 'undefined') {
                    alert('Missing ' + method + ' in the active textHandler (griffinEditorExtension)');
                }
			}
			
			return this;
		},
		
		preview: function($editor, $preview, contents) {
			if (contents === null || typeof contents === 'undefined') {
                if (typeof alert !== 'undefined') {
                    alert('Empty contents');
                }
				return this;
			}
			$preview.html($.markdown(contents));
		},
		
		// private func
		removeWrapping: function(selection, wrapperString) {
			var wrapperLength = wrapperString.length;
			var $editor = $(selection.parent);
			var pos = selection.get();
			
			// expand double click
			if (pos.start !== 0 && $editor.val().substr(pos.start - wrapperLength, wrapperLength) === wrapperString) {
				selection.select(pos.start - wrapperLength, pos.end + wrapperLength);
				pos = selection.get();
			}
			
			// remove 
			if (selection.text().substr(0, wrapperLength) === wrapperString) {
				var text = selection.text().substr(wrapperLength, selection.text().length - (wrapperLength*2));
				selection.replace(text);
				selection.select(pos.start, pos.end - (wrapperLength*2));
				return true;
			}
		
			return false;
		},	
		
		
		actionBold: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			if (this.removeWrapping(selection, '**')) {
				return this;
			}
			
			selection.replace("**" + selection.text() + "**");
			
			if (isSelected) {
				selection.select(pos.start, pos.end + 4);
			} else {
				selection.select(pos.start + 2, pos.start + 2);
			}
			
			return this;
		},
		
		actionItalic: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			if (this.removeWrapping(selection, '_')) {
				return this;
			}
						
			selection.replace("_" + selection.text() + "_");
			
			if (isSelected) {
				selection.select(pos.start, pos.end + 2);
			} else {
				selection.select(pos.start + 1, pos.start + 1);
			}
			
			return this;
		},

		actionH1: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("# " + selection.text());
			
			if (isSelected) {
				selection.select(pos.end + 2, pos.end + 2);
			}
            
			return this;
		},
		
		actionH2: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("## " + selection.text());
			
			if (isSelected) {
				selection.select(pos.end + 3, pos.end + 3);
			}
		},

		actionH3: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("### " + selection.text());
			selection.select(pos.end + 4, pos.end + 4);

			return this;
		},
        actionH4: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("#### " + selection.text());
			selection.select(pos.end + 5, pos.end + 5);

			return this;
		},
        actionH5: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("##### " + selection.text());
			selection.select(pos.end + 6, pos.end + 6);

			return this;
		},
        actionH6: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("###### " + selection.text());
			selection.select(pos.end + 7, pos.end + 7);

			return this;
		},
		
		actionBullets: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("* " + selection.text());
			selection.select(pos.end + 2, pos.end + 2);
		
			return this;
		},

		actionNumbers: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("1. " + selection.text());
			selection.select(pos.end + 3, pos.end + 3);

			return this;
		},
		
		actionSourcecode: function(selection) {
			var pos = selection.get();
			if (!selection.isSelected()) {
				selection.replace('```python\n\n```');
				selection.select(pos.start + 10, pos.start + 10);
				return this;
			}
			
			if (selection.text().indexOf('\n') === -1) {
				selection.replace('```python\n' + selection.text() + '\n```');
				selection.select(pos.end + 10, pos.end + 10);
				return this;
			}
			
			var text = '    ' + selection.text().replace(/\n/g, '\n    ');
			if (text.substr(text.length-3, 1) === ' ' && text.substr(text.length-1, 1) === ' ') {
				text = text.substr(0, text.length - 4);
			}
			selection.replace(text);
			selection.select(pos.start + text.length, pos.start + text.length);
			
			return this;
		},
		
		actionQuote: function(selection) {
			var pos = selection.get();
			if (!selection.isSelected()) {
				selection.replace('> ');
				selection.select(pos.start + 2, pos.start + 2);
				return this;
			}
			
			
			var text = '> ' + selection.text().replace(/\n/g, '\n> ');
			if (text.substr(text.length-3, 1) === ' ') {
				text = text.substr(0, text.length - 4);
			}
			selection.replace(text);
			selection.select(pos.start + text.length, pos.start + text.length);

			return this;
		},
		
		//context: { url: 'urlToImage' }
		actionImage: function(selection, context) {
			var pos = selection.get();
			var text = selection.text();
			
            selection.store();
			var options = {
				success: function(result) {
					var newText = '![' + result.title + '](' + result.url + ')';
                    selection.load();
					selection.replace(newText);
					selection.select(pos.start + newText.length, pos.start + newText.length);
					context.editor.preview();
				}
			};
			
			if (!selection.isSelected()) {
                options.url = '';
                options.title = '';
			} else if (text.substr(-4, 4) === '.png' || text.substr(-4, 4) === '.gif' || text.substr(-4, 4) === '.jpg') {
				options.url = text;
			} else {
				options.title = text;
			}
			
			$.griffinEditorExtension.imageDialog(options);
			return this;
		},
		
		//context: { url: 'url' }
		actionLink: function(selection, context) {
			//[Google] [1]
			//[1]: http://google.com/        "Google"
			var pos = selection.get();
			var text = selection.text();
			selection.store();
			var options = {
				success: function(result) {
                    selection.load();
					var newText = '[' + result.title + '](' + result.url + '/)';
					selection.replace(newText);
					selection.select(pos.start + newText.length, pos.start + newText.length);
					context.editor.preview();
				}
			};			
			if (selection.isSelected()) {
                if (text.substr(0,4) === 'http' || text.substr(0,3) === 'www') {
                    options.url = text;
                } else {
                    options.title = text;
                }
			} 
			
			$.griffinEditorExtension.linkDialog(options);
			return this;
		}

		
	};
	
//	$.griffinEditorExtension.textHandler = $.griffinEditorExtension.textHandlers.markdown;

})(jQuery); 

(function($) {       
$.fn.markdown = function() {
	if($('.toolbar').length <= 0){
     	$('<div class="toolbar btn-toolbar" style="margin-top:0;">'+
			'<div class="btn-group">'+
				'<span class="button-h1 btn" accesskey="1" title="标题1 [Ctrl + 1]"><strong>H1</strong></span>'+
				'<span class="button-h2 btn" accesskey="2" title="标题2 [Ctrl + 2]"><strong>H2</strong></span>'+
				'<span class="button-h3 btn" accesskey="3" title="标题3 [Ctrl + 3]"><strong>H3</strong></span>'+
				'<span class="button-h4 btn" accesskey="4" title="标题4 [Ctrl + 4]"><strong>H4</strong></span>'+
				'<span class="button-h5 btn" accesskey="5" title="标题5 [Ctrl + 5]"><strong>H5</strong></span>'+
				'<span class="button-h6 btn" accesskey="6" title="标题6 [Ctrl + 6]"><strong>H6</strong></span>'+
			'</div>'+
			'<div class="btn-group">'+
				'<span class="button-bold btn" accesskey="b" title="加粗 [Ctrl + B]"><strong>B</strong></span>'+
				'<span class="button-italic btn" accesskey="i" title="斜体 [Ctrl + I]"><strong><em>I</em></strong></span>'+
				'<span class="button-sourcecode btn" accesskey="k" title="插入代码 [Ctrl + K]"><strong>C</strong></span>'+
				'<span class="button-link btn" accesskey="l" title="插入链接 [Ctrl + L]"><strong>L</strong></span>'+
			'</div>'+
			'<div class="btn-group">'+
				'<span class="button-bullets btn" accesskey="u" title="列表 [Ctrl + U]"><i class="icon-list"></i></span>'+
				'<span class="button-numbers btn" accesskey="o" title="排序列表 [Ctrl + O]"><i class="icon-th-list"></i></span>'+
				'<span class="button-image btn" accesskey="p" title="插入图片 [Ctrl + P]"><i class="icon-picture"></i></span>'+
			'</div>'+
		'</div>').prependTo(this);
        $('.toolbar span').tooltip();
	}
	this.griffinEditor();
};     
})(jQuery);  
