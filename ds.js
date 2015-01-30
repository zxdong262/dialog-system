/*!
 * ds.js https://github.com/zxdong262/dialog-system
 */

;(function(window, undefined) {


	//for seajs
	if ( typeof define === 'function' ) {
		define( function(require, exports) {
			factory(require('jquery'))
		})
	}

	//for direct use
	else factory(jQuery)

	//factory
	function factory($) {

		//no $ error
		if(!$) throw new Error('no jquery object!')

		//DS Class
		$.dsOption = {
			indexCounter: 250
			,defaultWidth: 200
			,defaultTimer: 4000
			,defaultTitle: 'Info'
			,defaultTop: 40
			,defaults: {
				modal: false
				,closeText: 'close' //title for close buttom
				,timer: 0 //time before this.hide(), 0 will not auto run this.hide()
				,css: {} //css setting
				,type: 'default' //dialog type
				,show: 'show' //show function, can be 'slideDown', 'slideUp', 'animate', 'show', 'fadein', 'fadeTo'...
				,showParam: null //animate params, object,such as { height: 100 }
				,hide: 'hide' //hide function, can be 'slideDown', 'slideUp', 'animate', 'hide', 'fadeOut', 'fadeTo'...
				,hideParam: null //animate params, object,such as { height: 0 }
				,animateSpeed: 0
				,msg: '' //dialog message html
				,open: true //if false, will only init it, will not open it.
				,title: '' //for dialog with title
				,hasCloseBtn: true
				,selfDestroy: false //if true, after this.hide(), instance will self-destroy.

				//event
				,beforeShow: null
				,afterShow: null
				,beforeHide: null
				,afterHide: null
			}
			,closeHtml: '&times;'
			,typeHtml: {
				default: '<i class="ds-default ds-type-unit"></i>'
				,info: '<i class="ds-info ds-type-unit">i</i>'
				,warn: '<i class="ds-warn ds-type-unit">!</i>'
				,error: '<i class="ds-error ds-type-unit">&Chi;</i>'
				,ok: '<i class="ds-ok ds-type-unit">&radic;</i>'
			}
		}
		
		function DS(opts) {
 
			var th = this
			this.init(opts)
			if(this.defs.open) {
				this.show()
				if(this.defs.timer) this.handler = setTimeout(function() {
					th.hide()
				}, this.defs.timer)
			}

		}

		DS.prototype.init = function(opts) {

			var defs = this.defs = $.extend({}, $.dsOption.defaults, opts)
			var id = this.id = new Date().getTime()
			var zIndex = this.zIndex = ++$.dsOption.indexCounter
			var th = this

			$('body').append('<span style="z-index:' + (zIndex + 1) + '" class="ds-wrap ds-type-' + defs.dsType + ' ds-hide" id="ds-unit-' + id + '">' +
			(defs.title?'<span class="ds-head ds-block">' +
			 			'<span class="ds-head-content ds-iblock">' + defs.title + '</span>' +
			 			(defs.hasCloseBtn?'<span class="ds-btn-close ds-close">' + $.dsOption.closeHtml + '</span>':'') +
			 			'</span>':'') +
			'<span class="ds-inner">' +
			'<span class="ds-content">' +
			$.dsOption.typeHtml[defs.type] + defs.msg +
			'</span></span>' +
			(defs.title?'':(defs.hasCloseBtn?'<span class="ds-btn-close ds-close">' + $.dsOption.closeHtml + '</span>':'')) +
			'</span>')
			this.dom = $('#ds-unit-' + this.id)
			this.dom.css(defs.css)
			this.dom.on('click', '.ds-close', function() {
				th.hide()
			})

			if(defs.modal) {
				$('body').append('<div class="ds-overlay ds-hide" id="ds-overlay-' + id + '" style="z-index:' + zIndex + '"></div>')
				this.overlay = $('#ds-overlay-' + this.id)
			}

		}

		DS.prototype.destroy = function() {
			this.dom.off('click', '**')
			this.dom.remove()
			this.overlay && this.overlay.remove()
			delete this.defs
			delete this.id
			delete this.dom
			delete this.overlay
		}

		DS.prototype.showCallback = function() {
			this.afterShow && this.afterShow()
		}

		DS.prototype.hideCallback = function() {
			this.dom.addClass('ds-hide')
			this.afterHide && this.defs.afterHide.call(th)
			if(this.defs.selfDestroy) this.destroy()
		}

		DS.prototype.show = function() {
			var show = this.defs.show
			,th = this
			if(this.overlay) this.overlay.removeClass('ds-hide')
			this.defs.beforeShow && this.defs.beforeShow.call(this)
			if(show === 'animate') this.dom.removeClass('ds-hide').animate(this.defs.showParam, this.defs.animateSpeed, function() {
				th.showCallback()
			})
			else this.dom.removeClass('ds-hide')[show](this.defs.animateSpeed, function() {
				th.showCallback()
			})
		}

		DS.prototype.hide = function() {
			var hide = this.defs.hide
			,th = this
			this.defs.beforeHide && this.defs.beforeHide.call(this)
			if(this.overlay) this.overlay.addClass('ds-hide')
			if(hide === 'animate') this.dom.animate(this.defs.hideParam, this.defs.animateSpeed, function() {
				th.hideCallback()
			})
			else this.dom[hide](this.defs.animateSpeed, function() {
				th.hideCallback()
			})
		}

		//ds
		$.ds = {}

		$.ds.ds = function(options, options2) {

			var win = $(window)
			,ww = win.width()
			,wh = win.height()
			,body = $('body')
			,bh = body.height()
			,st = win.scrollTop()
			,ct = 0
			,dopt = $.dsOption
			,options = $.extend({}, options)
			,cw = options.width?options.width:dopt.defaultWidth
			,tid = 'id' + new Date().getTime()
			,ch = 0
			,top = 0
			,left = 0
			,css = {}
			,type = options.type
			,

			cw = cw > ww?ww:cw
			left = (ww - cw) / 2

			if($.inArray(options2.dsType, ['dialog', 'popup']) > -1) {
				body.append(
					'<div id="' + tid + '" style="position:fixed;left:0;top:0;opacity:0;filter:alpha(opacity=0);z-index:-1">' +
					'<div style="width:' + cw + 'px">' +
					'<div class="ds-content">' +
					dopt.typeHtml[type?type:'default'] + options.msg +
					'</div></div></div>'
				)

				ch = $('#' + tid).height()
				$('#' + tid).remove()

				top = (wh - ch)/2 + st
				top = wh > ch?top:(st + 20)
			}

			css = $.extend({
				top: top
				,left: left
				,position: 'absolute'
				,width: cw
			}, options.css, options2.css)

			return new DS($.extend(
				options
				,{
					timer: options.timer || 0
					,type: options.type || 'default'
					,msg: options.msg
				}
				,options2
				,{
					css: css
				}
			))

		}

		$.ds.popup = function(msg, timer, type, options) {
			if($.isPlainObject(msg)) {
				options = msg
				msg = options.msg
				timer = options.timer
				type = options.type || type
			}
			return $.ds.ds(
				$.extend(options, {
					msg: msg
					,timer: (timer || timer === 0)?timer:$.dsOption.defaultTimer
					,type: type
				})
				,{
					title: ''
					,selfDestroy: true
					,dsType: 'popup'
				}
			)
		}

		$.ds.info = function(msg, timer, options) {
			return $.ds.popup(msg, timer, 'info', options)
		}
		$.ds.warn = function(msg, timer, options) {
			return $.ds.popup(msg, timer, 'warn', options)
		}
		$.ds.error = function(msg, timer, options) {
			return $.ds.popup(msg, timer, 'error', options)
		}
		$.ds.ok = function(msg, timer, options) {
			return $.ds.popup(msg, timer, 'ok', options)
		}

		$.ds.dialog = function(options) {
			options = options || {}
			options.title = options.title?options.title:$.dsOption.defaultTitle
			return $.ds.ds(options, { dsType: 'dialog' })
		}

		$.ds.right = function(msg, timer, type, options) {
			if($.isPlainObject(msg)) {
				options = msg
				msg = options.msg
				timer = options.timer
				type = options.type
			}
			else options = {}

			var 
			dopt = $.dsOption
			,tid = 'id' + new Date().getTime()
			,cw = 0
			,ch = 0
			,body = $('body')
			body.append(
				'<div id="' + tid + '" style="position:fixed;left:0;top:0;opacity:0;filter:alpha(opacity=0);z-index:-1">' +
				'<div style="max-width:100%">' +
				'<span class="ds-content">' +
				dopt.typeHtml[type?type:'default'] + msg +
				'</span></div></div>'
			)

			cw = $('#' + tid + ' .ds-content').width()
			ch = $('#' + tid + ' .ds-content').height()

			$('#' + tid).remove()

			return $.ds.ds(
				$.extend({ hasCloseBtn: false }, options, {
					msg: msg
					,timer: (timer || timer === 0)?timer:$.dsOption.defaultTimer
					,type: type
				})
				,{
					title: ''
					,modal: false
					,selfDestroy: true
					,css: {
						right: -cw
						,left: 'auto'
						,position: 'fixed'
						,top: options.top || $.dsOption.defaultTop
						,width: 'auto'
					}
					,animateSpeed: 400
					,show: 'animate'
					,showParam: {
						right: 0
					}
					,hide: 'animate'
					,hideParam: {
						right: -cw
					}
					,dsType: 'right'
				}
			)
		}

		$.ds.left = function(msg, timer, type, options) {

			if($.isPlainObject(msg)) {
				options = msg
				msg = options.msg
				timer = options.timer
				type = options.type
			}
			else options = {}

			var 
			dopt = $.dsOption
			,tid = 'id' + new Date().getTime()
			,cw = 0
			,ch = 0
			$('body').append(
				'<div id="' + tid + '" style="position:fixed;left:0;top:0;opacity:0;filter:alpha(opacity=0);z-index:-1">' +
				'<div style="max-width:100%">' +
				'<span class="ds-content">' +
				dopt.typeHtml[type?type:'default'] + msg +
				'</span></div></div>'
			)

			cw = $('#' + tid + ' .ds-content').width()
			ch = $('#' + tid + ' .ds-content').height()

			$('#' + tid).remove()

			return $.ds.ds(
				$.extend({ hasCloseBtn: false }, options, {
					msg: msg
					,timer: (timer || timer === 0)?timer:$.dsOption.defaultTimer
					,type: type
				})
				,{
					title: ''
					,animateSpeed: 400
					,modal: false
					,selfDestroy: true
					,css: {
						right: 'auto'
						,left: -cw
						,position: 'fixed'
						,top: options.top || 40
						,width: 'auto'
					}
					,show: 'animate'
					,showParam: {
						left: 0
					}
					,hide: 'animate'
					,hideParam: {
						left: -cw
					}
					,dsType: 'left'
				}
			)
		}

		$.ds.top = function(msg, timer, type, options) {

			if($.isPlainObject(msg)) {
				options = msg
				msg = options.msg
				timer = options.timer
				type = options.type
			}
			else options = {}

			var 
			dopt = $.dsOption
			,tid = 'id' + new Date().getTime()
			,cw = 0
			,ch = 0
			,body = $('body')
			body.append(
				'<div id="' + tid + '" style="position:fixed;left:0;top:0;opacity:0;filter:alpha(opacity=0);z-index:-1">' +
				'<div style="max-width:100%">' +
				'<span class="ds-content">' +
				dopt.typeHtml[type?type:'default'] + msg +
				'</span></div></div>'
			)

			cw = $('#' + tid + ' .ds-content').width()
			ch = $('#' + tid + ' .ds-content').height()

			$('#' + tid).remove()
			return $.ds.ds(
				$.extend({ hasCloseBtn: false }, options, {
					msg: msg
					,timer: (timer || timer === 0)?timer:$.dsOption.defaultTimer
					,type: type
				})
				,{
					title: ''
					,animateSpeed: 400
					,modal: false
					,selfDestroy: true
					,css: {
						top: -ch
						,left: '50%'
						,right: 'auto'
						,'margin-left': -(cw/2)
						,position: 'fixed'
						,width: 'auto'
					}
					,show: 'animate'
					,showParam: {
						top: 0
					}
					,hide: 'animate'
					,hideParam: {
						top: -ch
					}
					,dsType: 'top'
				}
			)
		}


	//code end

	}

})(this);


