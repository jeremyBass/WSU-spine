 /*!
 *
 * Depends:
 *		jquery.ui.v.js
 */
/*jshint multistr: true */
( function($) {
	$.extend($.ui.spine.prototype, {
		framework_init: function(options) {
			//alert("init framework");
			//alert("options==>"+dump(options));
			$.extend(this.framework_options,options);
			//alert("options==>"+dump(this.framework_options));
			this._set_globals(this.framework_globals);
			this.framework_create();
		},
		framework_options:{
			equalizer_filter:".skip*",
			contact_template:" <address itemscope itemtype='http://schema.org/Organization' class='hcard'> \
									<% if (typeof(this.department) != 'undefined') { %><div class='organization-unit fn org'>\
										<% if (typeof(this.url) != 'undefined') { %><a href='<%this.url%>' class='url'><% } %> \
											<%this.department%> \
										<% if (typeof(this.url) != 'undefined') { %></a><% } %> \
									</div><% } %> \
									<% if (typeof(this.name) != 'undefined') { %><div class='organization-name'><%this.name%></div><% } %> \
									<div class='address'> \
										<% if (typeof(this.streetAddress) != 'undefined') { %><div class='street-address'><%this.streetAddress%></div><% } %> \
										<% if (typeof(this.addressLocality) != 'undefined' || typeof(this.postalCode) != 'undefined') { %><div class='locality'> \
											<% if (typeof(this.addressLocality) != 'undefined' ) { %><%this.addressLocality%><% } %> <% if (typeof(this.addressRegion) != 'undefined' ) { %>, <%this.addressRegion%><% } %> \
											<% if (typeof(this.postalCode) != 'undefined' ) { %><span class='postalcode'><%this.postalCode%></span><% } %> \
										</div><% } %> \
									</div> \
									<% if (typeof(this.telephone) != 'undefined' ) { %><div class='tel'><%this.telephone%></div><% } %> \
									<% if (typeof(this.email) != 'undefined' ) { %><div class='email' rel='email'><a href='mailto:<%this.email%>'>Email us</a></div><% } %> \
										 \
									<% if (typeof(this.ContactPoint) != 'undefined' && typeof(this.ContactPointTitle) != 'undefined') { %> \
										<div class='more'><a href='<%this.ContactPoint%>'><%this.ContactPointTitle%></a></div> \
									<% } %> \
								</address>"
		},
		framework_globals: {
			spine: $("#spine"),
			glue: $("#glue"),
			main: $("main"),
			wsu_actions:$("#wsu-actions"),
		},
		framework_create: function(){
			var self,contactHtml,propmap={},spread,verso,page,recto,recto_margin,verso_width,svg_imgs;
			//alert("framework_create");
			self=this;//hold to preserve scop

			// Section -> Contact
			if (!$("#wsu-contact").length) {
				contactHtml = "<section id='wsu-contact' class='spine-contact tools closed'>";
				propmap={};
				$.each($("[itemtype='http://schema.org/Organization']"),function(){
					var tar = this;
					$.each($(tar).find("[itemprop]"),function(i,v){
						var tmp={};
						tmp[$(v).attr("itemprop")]=$(v).attr("content");
						$.extend(propmap,tmp);
					});
					contactHtml+=$.runTemplate(self.framework_options.contact_template,propmap);
				});
				contactHtml += "</section>";
				self.setup_tabs("contact",contactHtml);
			} // End Contact Generation


			svg_imgs = $(".lt-ie9 img[src$='.svg']");
			if(svg_imgs.lenght){
				$.each(svg_imgs,function(){
					$(this).attr("src",$(this).attr("src").replace(".svg",".png"));
				});
			}
			


			self.setup_nav();
			self.setup_spine();
			self.setup_printing();
			$(window).on("resize", function(){
				self.sizing();
				self.equalizing();
				self.mainheight();
				// Only run function if an unbound element exists
				if( $(".unbound").length || $("#binder.broken").length ) {
					spread = $(window).width();
					verso = self._get_globals("main").offset().left;
					page = self._get_globals("main").width();
					recto = spread - self._get_globals("main").offset().left;
					recto_margin = "";
					if (recto >= page ) { recto_margin = recto - page; } else { recto_margin = 0; }
					/* Broken Binding */ if ($("#binder").hasClass("broken")) { self._get_globals("main").css("width",recto); }
					verso_width = verso + self._get_globals("main").width();
					$(".unbound.recto").css("width",recto).css("margin-right",-(recto_margin));
					$(".unbound.verso").css("width",verso_width).css("margin-left",-(verso));
					$(".unbound.verso.recto").css("width",spread);
				}
			}).trigger("resize");
		},
		// Label #jacket with current window size
		sizing: function (jacket) {
			var current_width,ele_class;
			jacket=jacket||$("#jacket");
			current_width = $(window).width();
			ele_class="";
			if(current_width >= 1188) {
				ele_class="size-xlarge size-gt-small size-gt-smallish size-gt-medium size-gt-large";
			} else if(current_width >= 990) {
				ele_class="size-large size-lt-xlarge size-gt-small size-gt-smallish size-gt-medium";
			} else if(current_width < 990 && current_width >= 792) {
				ele_class="size-medium size-lt-xlarge size-lt-large size-gt-smallish size-gt-small";
			} else if((current_width >= 694 && current_width < 792) && ($("#binder").hasClass("fixed"))) {
				ele_class="size-smallish size-lt-medium size-lt-large size-lt-xlarge size-gt-small";
			} else if(current_width < 792) {
				ele_class="size-small size-lt-smallish size-lt-medium size-lt-large size-lt-xlarge";
			} else if(current_width < 396) {
				ele_class="size-small size-lt-small size-lt-smallish size-lt-medium size-lt-large size-lt-xlarge";
			}
			jacket.stripClass("size-").addClass(ele_class);
		},
		// Equalize Columns
		equalizing: function () {
			var obj;
			// come back to .. look to mage"s eq"i
			// all box attr not accounted for
			if( $(".equalize").length ) {
				obj=$(".row.equalize");
				obj.find(".column").css("min-height","");
				$.each(obj,function(){
					var tallestBox = 0;
					$.each($(".column", this),function(){
						tallestBox = ($(this).outerHeight() > tallestBox) ? $(this).outerHeight() : tallestBox;
					});
					$(".column",this).not(".unequaled").css("min-height",tallestBox);
					$("section.equalize .column",this).css("min-height","auto");
				});
			}
		},
		mainheight: function () {
			var main,main_top,window_height,main_height;
			main = this._get_globals("main").refresh();
			if(main.offset()){
				main_top = main.offset().top;
				window_height = $(window).height();
				main_height = window_height;
				if ($("#binder").hasClass("size-lt-large")) {
					main_height -= 50;
				}
				$("main.fill-window-height").css("min-height",main_height);
			}
		},

		/**
		 * Sets up framework html and other DOM attributes
		 */
		setup_jacket: function(){

		},

		/**
		 * Sets up framework html and other DOM attributes
		 */
		setup_binder: function(){

		},

		 /**
		 * Sets up framework html and other DOM attributes
		 */
		setup_content: function(){

		},

		/**
		 * Sets up the spine area
		 */
		setup_spine: function(){
			var self,spine,glue,main,scroll_top,scroll_diff,windowHeight,positionLock;
			
			windowHeight=$(window).height();
			scroll_diff=0;
			positionLock=0;
			scroll_top=0;
			
			console.log("starting positionLock::" + positionLock);
			
			self=this;
			spine = self._get_globals("spine").refresh();
			glue = self._get_globals("glue").refresh();
			main = self._get_globals("main").refresh();
			// Fixed/Sticky Horizontal Header
			$(document).scroll(function() {
				var top,spineHeight,heightDif;
				spineHeight = glue.height();
				
				if( spineHeight>windowHeight ){
					top = $(document).scrollTop();
					scroll_diff = scroll_top-top;
					scroll_top = top;

					heightDif= spineHeight - windowHeight;

					if( (scroll_diff>0?false:true) ){//down
						positionLock= ( positionLock <= -(heightDif) ) ? -(heightDif) : positionLock+scroll_diff;
					}else{//up
						positionLock= (positionLock >= 0) ? 0 : positionLock+scroll_diff;
					}
					glue.css({"position":"fixed","top":positionLock+"px"});
				}
				/*
				if (top > 49) {
					spine.not(".unshelved").addClass("scanned");
				} else {
					spine.removeClass("scanned");
				}*/
			});

			$("#glue > header").append("<button id='shelve' />");
			$("#shelve").click(function(e) {
				e.preventDefault();
				spine.toggleClass("unshelved shelved");
			});

			// Clicking Outside Spine Closes It
			/* $(document).on("mouseup touchstart", function (e) {
				var container = $("#spine.unshelved");
				if (container.has(e.target).length === 0)
				{ container.toggleClass("shelved unshelved"); }
			}); */
			main.on("click swipeleft", function() {
				if ( spine.hasClass("unshelved") ) {
					spine.toggleClass("shelved unshelved");
				}
			});

			// Cracking the Spine for Short Windows
			$(window).on("load resize scroll mouseup touchend",function() {
				var footerHeight, windowHeight, spineHeight;
				
				footerHeight = $("#spine footer").height();
				windowHeight = window.innerHeight - footerHeight - 50;
				spineHeight = $("#glue").height();
				//$("main").prepend(footerHeight);
				if ( windowHeight < spineHeight ) {
					spine.removeClass("uncracked").addClass("cracked");
				} else {
					spine.removeClass("cracked").addClass("uncracked");
				}
			});

			// Moving the Spine for Short Windows
			/* $(document).scroll(function() {
				var windowHeight = window.innerHeight;
				var top = $(document).scrollTop();
				var spineHeight = $("#glue").height();
				var crack = spineHeight - windowHeight;
				if ( top > crack ) { $("#spine.cracked").addClass("pinned"); }
				else { $("#spine.cracked").removeClass("pinned"); }
			}); */

			// Moving the Spine for Short Windows
			/*$(document).scroll(function() {
				var windowHeight, top, spineHeight, crack;
				windowHeight = window.innerHeight;
				top = $(document).scrollTop();
				spineHeight = $("#glue").height();
				crack = spineHeight - windowHeight;
				if ( top > crack ) {
					$("#spine.cracked").addClass("scrolled");
				} else {
					$("#spine.cracked").removeClass("scrolled");
				}
			});*/

			// Moving the Spine for Short Windows
			/*$(document).scroll(function() {
				var windowHeight = window.innerHeight;
				var top = $(document).scrollTop();
				var spineHeight = $("#glue").height();
				var crack = spineHeight - windowHeight;
				if ( top > crack ) {
					var top_pos = -(top);
					$("#spine.cracked").addClass("pinned");
					$("#spine.cracked #glue").css("top",top_pos);
				} else {
					$("#spine.cracked").removeClass("pinned");
				}
			});*/
		},

		/**
		 * Sets up the tabs that will be able to be used by other extensions
		 */
		setup_tabs: function(tab,html){
			var self, wsu_actions;
			html=html||"";
			self=this;//hold to preserve scope
			wsu_actions = self._get_globals("wsu_actions").refresh();
			wsu_actions.append(html);
			$("#wsu-"+tab+"-tab button").on("click",function(e) {
				e.preventDefault();
				wsu_actions.find("*.opened,#wsu-"+tab+",#wsu-"+tab+"-tab").toggleClass("opened closed");
			});
		},

		/**
		 * Sets up navagation system
		 */
		setup_nav: function(){
			// NAVIGATION
			// Tag location and hierarchy
			$("#spine nav ul,#spine ul").parents("li").addClass("parent");
			$("#spine nav li[class*=current], nav li[class*=active]").addClass("active").parents("li").addClass("active");
			$("#spine nav li a[class*=current], nav li a[class*=active]").parents("li").addClass("active");
			$("#spine .active").not(":has(.active)").addClass("dogeared");
	
			// Disclosure
			$("#spine nav li.parent > a").on("click",function(e) {
				e.preventDefault();
				var tar=$(this);
				tar.parent("li").siblings().removeClass("opened");
				tar.parent("li").toggleClass("opened");
			});

			// Couplets
			$("#spine nav li.parent > a").each( function() {
				var tar, title, alt, classes, url;
				tar=$(this);
				title = "Overview";
				if (tar.attr("title")) {
					alt = tar.attr("title").length;
					if ( alt > 0 ) { title = tar.attr("title"); }
				}
				classes = "overview";
				if (tar.closest(".parent").hasClass("dogeared")) {
					classes += " dogeared";
				}
				url = tar.attr("href");
				if ( url !== "#" ) {
					tar.parent("li").children("ul").prepend("<li class='" + classes + "'><a href='"  + url +  "'>" + title + "</a></li>");
				}
			});
			// External Links in nav
			// this shouldn"t be done this way
			$("nav#spine-sitenav a").filter(function() {
				return this.hostname && this.hostname !== window.location.hostname;
			}).addClass("external");
		},

		/**
		 * Sets up printing, not 100% this should live here
		 */
		setup_printing: function(){
			var self, spine, wsu_actions, print_controls;
			
			self=this;//hold to preserve scope
			spine = self._get_globals("spine").refresh();
			wsu_actions = self._get_globals("wsu_actions").refresh();

			// Print & Print View
			print_controls = "<span class='print-controls'><button id='print-invoke'>Print</button><button id='print-cancel'>Cancel</button></span>";

			function printPage(){
				window.print();
			}

			function print_cancel() {
				$("html").toggleClass("print");
				$(".print-controls").remove();
			}

			/* var print_timeout = setTimeout(function() { window.print(); }, 400); Cancel timeout? */
			function print(e) {
				if ( undefined !== e ) {
					e.preventDefault();
				}
				wsu_actions.find(".opened").toggleClass("opened closed");
				$("html").toggleClass("print");
				spine.find("header").prepend(print_controls);
				spine.find(".unshelved").removeClass("unshelved").addClass("shelved");
				$("#print-invoke").on("click",function() { window.print(); });
				$("#print-cancel").on("click",print_cancel);
				window.setTimeout(function() { printPage(); }, 400);
			}
			$("#wsu-print-tab button").click(print);
	
			// Shut a tool section
			$("button.shut").on("click",function(e) {
				e.preventDefault();
				wsu_actions.find(".opened").toggleClass("opened closed");
			});
		}

	});
} (jQuery) );