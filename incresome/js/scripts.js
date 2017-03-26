// -----------------------------------------------------------
	// Author       : Tanvirul Haque
	// Template Name: Rongila - MultiPurpose Onepage Portfolio Template
	// Version      : 1.1	
// ------------------------------------------------------------
// ==============================================================
    // JS TABLE OF CONTENTS
// ==============================================================
    // 01. START PRELOADER JS
    // 02. START MENU BACKGROUND CHANGE JS
    // 03. START SMOTH SCROOL JS
    // 04. START SCROLLSPY JS
    // 05. START TOGGLE DROPDOWN JS
    // 06. START PORTFOLIO MIXITUP JS
    // 07. START VENOBOX JS
    // 08. START COUNTDOWN JS
	// 09. START MAGNIFIC POPUP JS
	// 10. START AJAXCHIMP JS
	// 11. START PARALLAX JS
	// 12. START SCROLL UP JS
	// 13. START WOW ANIMATION JS
// ==============================================================

(function ($) {
    "use strict";
	
	jQuery(document).ready(function($){
		
		// 01. START PRELOADER JS
		$(window).load(function() {
			// ANIMATE LOADER OFF SCREEN
			$(".preloader").fadeOut("slow");
		});
		// 01. END PRELOADER JS
		
		// 02. START MENU BACKGROUND CHANGE JS
		$(window).on('scroll', function () {
            if ($(window).scrollTop() > 200) {
                $('.header-top-area').addClass('menu-bg');
            } else {
                $('.header-top-area').removeClass('menu-bg');
            }
        });
		// 02. END MENU BACKGROUND CHANGE JS
		
		// 03. START SMOOTH SCROLL JS
		$('a.smoth-scroll').on("click", function (e) {
            var anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $(anchor.attr('href')).offset().top - 70
            }, 1200);
            e.preventDefault();
        });
		// 03. END SMOOTH SCROLL JS
		
		// 04. START SCROLLSPY JS
		$('body').scrollspy({
            target: '.navbar-collapse',
            offset: 80
        });
		// 04. END SCROLLSPY JS
		
		// 05. START TOGGLE DROPDOWN JS
		$(document).on('click','.navbar-collapse.in',function(e) {
		if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
				$(this).collapse('hide');
			}
		});
		// 05. END TOGGLE DROPDOWN JS
		
		// 06. START PORTFOLIO MIXITUP JS
		jQuery('.grid').mixitup({
			targetSelector: '.mix'
		});
		// 06. END PORTFOLIO MIXITUP JS
		
		// 07. START VENOBOX JS
		$('.image-popup').venobox({
			numeratio: true,
			infinigall: true
		});
		// 07. END VENOBOX JS
		
		// 08. START COUNTDOWN JS
		$('.count-area').on('inview', function(event, visible, visiblePartX, visiblePartY) {
			if (visible) {
				$(this).find('.timer').each(function () {
					var $this = $(this);
					$({ Counter: 0 }).animate({ Counter: $this.text() }, {
						duration: 3000,
						easing: 'swing',
						step: function () {
							$this.text(Math.ceil(this.Counter));
						}
					});
				});
				$(this).unbind('inview');
			}
		});
		// 08. END COUNTDOWN JS
		
		// 09. START MAGNIFIC POPUP JS
		$('.video-play').magnificPopup({
            type: 'iframe'
        });
		// 09. END MAGNIFIC POPUP JS
		
		// 10. START AJAXCHIMP JS
		$('#mc-form').ajaxChimp();
		// 10. END AJAXCHIMP JS
		
		// 11. START PARALLAX JS
        $(window).stellar({
            responsive: true,
            positionProperty: 'position',
            horizontalScrolling: false
        });
		// 11. END PARALLAX JS
		
		// 12. START SCROLL UP JS
		$(window).scroll(function () {
            if ($(this).scrollTop() > 250) {
                $('.scroll-up').fadeIn();
            } else {
                $('.scroll-up').fadeOut();
            }
        });
        $('.scroll-up').on("click", function () {
            $("html, body").animate({
                scrollTop: 0
            }, 800);
            return false;
        });
		// 12. END SCROLL UP JS
		
      	});
	
	// 13. START WOW ANIMATION JS
	new WOW().init();
	// 13. END WOW ANIMATION JS
	
})(jQuery);