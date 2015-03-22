/**
 * Copernicus
 */

var Design = {
	
	
	checkNavWidth : function() {

		// Cache
		var $el	= { };

		$el.siteHeader	= $('.navigation');
		$el.viewPage	= $('.navigation_pages');
		$el.viewNav		= $('.view_navigation');

		if ( $el.siteHeader.outerWidth() < $el.viewPage.outerWidth() + $el.viewNav.outerWidth() + 138) {
			$el.siteHeader.addClass('collapse');
		} else {
			$el.siteHeader.removeClass('collapse');
		}

	},
	
	
	Data : {
		scroll_offset : 90	
	},
	
	goToNextProject: function() {

		var route			= Cargo.Helper.GetCurrentRoute(),
			is_feed_view	= !!($('[data-view="Feed"]').length > 0),
			nextContainer,
			newPos;

		if (is_feed_view || route == "Feed" || route == "") {

			nextContainer = $(Design.getBlockInViewport()).next();

			if (nextContainer.length > 0) {
								
				$(".project_container.active").removeClass("active");
				nextContainer.addClass("active");

				newPos = nextContainer.offset().top - this.Data.scroll_offset;
				Design.doScroll(newPos, newPos - 50, 250);
				
				if(nextContainer.next().length <= 0 && Cargo.Helper.GetTotalPages() > Cargo.API.Config.current_page) {

					Cargo.View.Autopaginate.Data.is_updating = true;
					Cargo.View.Main.NextPage();

				}

			}

		} else {
			Action.Project.Next();
		}

	},

	goToPrevProject: function() {

		var route = Cargo.Helper.GetCurrentRoute(),
			is_feed_view = !!($('[data-view="Feed"]').length > 0),
			firstContainer = $('.project_container').first(),
			prevContainer = $(Design.getBlockInViewport()).prev(),
			nextContainer;

		if (is_feed_view || route == "Feed" || route == "") {

			if (prevContainer.length > 0) {

				$(".project_container.active").removeClass("active");
				prevContainer.addClass("active");

				newPos = prevContainer.offset().top - this.Data.scroll_offset;
				Design.doScroll(newPos, newPos + 50, 100);

			}

		} else {
			Action.Project.Prev();
		}
		
		if (prevContainer[0] == firstContainer[0]){
			$('html, body').animate({
				scrollTop: 0
			}, 100);
		}
				
	},

	getBlockInViewport: function(el) {

		var centerViewport	= (window.innerHeight / 2),
			blocks			= $('.project_container'),
			blockLocation,
			result;

		
		blocks.each(function(blockId, block){

			blockLocation = block.getBoundingClientRect();
						
			if (centerViewport > blockLocation.top && centerViewport < blockLocation.bottom) {
				result = block;
			}

		});		
		
		if (result === undefined) {
			
			if (blocks[0].getBoundingClientRect().top > centerViewport) {
				result = blocks[0];
			} else {
				result = blocks[blocks.length - 1];
			}
		}
		
		return result;
			
	},	

	bindHotKeys: function() {

		// Shortcut navigation
		Cargo.Core.KeyboardShortcut.Remove("J");
		Cargo.Core.KeyboardShortcut.Remove("K");
		Cargo.Core.KeyboardShortcut.Remove("Left");
		Cargo.Core.KeyboardShortcut.Remove("Right");

		Cargo.Core.KeyboardShortcut.Add("Left", 37, function() {
			Design.goToPrevProject();
			return false;
		});

		Cargo.Core.KeyboardShortcut.Add("Right", 39, function() {
			Design.goToNextProject();
			return false;
		});

		Cargo.Core.KeyboardShortcut.Add("J", 74, function() {
			Design.goToNextProject();
			return false;
		});

		Cargo.Core.KeyboardShortcut.Add("K", 75, function() {
			Design.goToPrevProject();
			return false;
		});

	},

	doScroll: function(targetYPos, y, t, callback) {

		$({ scrollPos: y }).animate({ scrollPos: targetYPos }, {
			duration: t,
			easing: "swing",
			step: function() {
				window.scrollTo(0, this.scrollPos);
			}
		});

		return false;

	},
	
	arrowNav : function () {

		// Previous entry button
		$("a.prev_entry").click(function(e) {
			
			Design.goToPrevProject();
			return false;
			
		});
		
		// Next entry button
		$("a.next_entry").click(function(e) {	

			Design.goToNextProject();
			return false;

		});
		
		// Go to top button
		$("a.go_to_top").click(function(e) {

			$('html, body').animate({
				scrollTop: 0
			}, 200);

		});

	},
	
	adjustHeader: function () {

		//Move Header Img / Text with height of nav
		$(window).on("load resize", function() {
				
			var navHeight	= $('.site_header').height(),
				headImgWrap	= $('.header_image_wrapper, .header_text_wrapper');
			
			if (navHeight > 30 && screen.width > 768) {

				headImgWrap.css('margin-top', navHeight);

			} else if (navHeight <= 30 && screen.width > 768) {

				headImgWrap.removeAttr('style');

			}
			
			Design.checkNavWidth();
	
		});
					
		$('#feed, #index').waypoint(function() {
			$('.site_header, .go_to_top').toggleClass('scroll');
		});
		
	},
	
	setMaxWidth: function () {

		var userWidth = parseInt(Cargo.Model.DisplayOptions.GetImageWidth()),
			controlWidth = $('.header_max_width, .navigation, .feed_wrapper, .search_container'),
			containerWidth = $('.project_title, .project_content, .search, .header_image a, .project_footer'),
			projContainer = $('.header_image_wrapper'),
			paddingTotal = projContainer.outerWidth() - projContainer.width();
		
		if (userWidth <= 1800) {
			$(controlWidth).css("maxWidth", userWidth + paddingTotal + 'px');
		} else {
			$(controlWidth).css("maxWidth", 1800 + 'px');
		}
				
		if (controlWidth.width() >= 1200) {
			$(containerWidth).addClass('center-max');
		} else {
			$(containerWidth).removeClass('center-max');
		}
		
	},
	
	Mobile : {
		
		data: {
			thumbWidth : 200
		},
		
		Init: function() {
			
			Design.Mobile.touchOutside();
			Design.Mobile.touchInside();
			
			if (Cargo.Helper.isPhone() === true) {
				
				$('body').addClass('mobile');
				$('.cargo_link').hide();
				$('head').append('<meta name="viewport" content="width=device-width height=device-height">');
				
				// Set thumbnails to columnize at ideal width of 240
				$('.thumbnails').attr("data-columnize-width", Design.Mobile.data.thumbWidth );
				
				//Toggle button for mobile nav
				$(".navigation_toggle").on('click', function(e) {

					e.stopPropagation();

					if (!$(".nav_container").is(":visible")) {
						Design.Mobile.menuOpen();
					} else {
						Design.Mobile.menuClose();
					}

				});
				
				$('#feed, #index').waypoint(function() {
					Design.Mobile.navOpacity();
				});
		
			}
			
			if (Cargo.Helper.isTablet() === true) {
				$('body').addClass('tablet');
			}
			
			if (!Cargo.Helper.isMobile()) {
				$('body').addClass('desktop');
			}
		},
		
		// Open Menu
		menuOpen: function() {

			$('.nav_container, .close').show();
			$('.navigation_toggle .menu_icon').hide();
			$('.navigation_toggle').addClass('active');	
			$('.close, .body_cover').show();

		},
		
		// Close Menu
		menuClose: function() {

			$('.nav_container, .close, .body_cover').hide();
			$('.menu_icon').show();
			$('.navigation_toggle').removeClass('active');

		},
		
		// Opacity of Mobile Nav Tab when scrolling down
		navOpacity: function() {

			$('.navigation_toggle').toggleClass('scroll');

		},
		
		// Close the mobile nav if you touch anywhere outside of it		
		touchOutside: function() {

			var container;

			$('.body_cover').on( "touchstart", function(e){
				
				container = $(".nav_container");

				if (!container.is(e.target) && container.has(e.target).length === 0) {
					Design.Mobile.menuClose();
				}

			});

		},
		
		// Close the mobile nav if you click on a link inside (so it will close when changing views)
		touchInside: function() {

			$("#nav_wrapper > a").click(function() {
				Design.Mobile.menuClose();
			});

		}

	}

}


/**
 * Events
 */

$(function() {

	Cargo.Core.ReplaceLoadingAnims.init();
	Design.bindHotKeys();
	Design.adjustHeader();
	Design.arrowNav();
	Design.Mobile.Init();
	
	// Remove Directlink BG
	$('style#site_bg_color').remove();

	// Add padding to slideshow captions and navigation
	$('.slideshow_navigation, .slideshow_caption').wrap( "<div class='slide_padding'></div>" );

	
});

// Fix for wide aspect ratio images in elementresizer

Cargo.Event.on("project_collection_reset", function() {

	if (Cargo.Plugins.hasOwnProperty("elementResizer")) {
	
		setTimeout(function(){
			Cargo.Plugins.elementResizer.refresh();
			Cargo.Plugins.elementResizer.update();
		}, 1);
	
	}

});


// Set options for element resizer
Cargo.Event.on("element_resizer_init", function(plugin) {

	plugin.setOptions({
		adjustElementsToWindowHeight: Cargo.Model.DisplayOptions.get("image_scale_vertical"),
		centerElements: true,
		forceVerticalMargin: 250,
		minimumHeight: 20,
		allowInit: Cargo.Model.DisplayOptions.get("resize_images")
	});
		
});

Cargo.Event.on("fullscreen_destroy_hotkeys", function() {
	Design.bindHotKeys();
});

Cargo.Event.on("pagination_complete navigation_reset project_load_complete element_resizer_init", function(page) {
	Design.setMaxWidth();
});

Cargo.Event.on("project_load_complete", function(page) {

	$(".navigation [data-id='"+Cargo.Model.Project.GetId()+"']").addClass("active");

});
