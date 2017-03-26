(function($) {
    "use strict";
    
    /*--
     Menu Sticky
    -----------------------------------*/
    $(window).on('scroll',function() {    
        var scroll = $(window).scrollTop();
        if (scroll < 245) { 
            $(".sticker").removeClass("stick");
        }else{
            $(".sticker").addClass("stick");
        }
    }); 
    
    /*--
     One Page Menu
    -----------------------------------*/
    var TopOffsetId = $('.header-area').height() - 25;
    $('#main-menu nav').onePageNav({
        currentClass: 'active',
        scrollThreshold: 0.2,
        scrollSpeed: 1000,
        scrollOffset: TopOffsetId,
    });
       
    /*--
    Bootstrap Menu Fix For Mobile
    -----------------------------------*/
    $(document).on('click', '.navbar-collapse.in', function(e) {
        if ($(e.target).is('a')) {
            $(this).collapse('hide');
        }
    });
    
    /*--
	ImagesLoaded & isotope active
	------------------------------------*/
    $('.grid').imagesLoaded(function() {
        // filter items on button click
        $('.portfolio-menu').on('click', 'button', function() {
            var filterValue = $(this).attr('data-filter');
            $grid.isotope({
                filter: filterValue
            });
        });
        // init Isotope
        var $grid = $('.grid').isotope({
            itemSelector: '.grid-item',
            percentPosition: true,
            masonry: {
                // use outer width of grid-sizer for columnWidth
                columnWidth: '.grid-item',
            }
        });
    });
    
    /*--
	Portfolio menu active
	------------------------------------*/
    $('.portfolio-menu button').on('click', function(event) {
        $(this).siblings('.active').removeClass('active');
        $(this).addClass('active');
        event.preventDefault();
    });
     
    /*--
	Slider active
	------------------------------------*/
    $('.slider-active').owlCarousel({
        loop: true,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        items: 1,
        dots: false,
        nav: true,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    })
      
    /*--
	Testimonial active
	------------------------------------*/
    $('.testimonial-active').owlCarousel({
        loop: true,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        items: 1,
        dots: true,
        nav: false,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    })
           
    /*--
    Magnific Popup
    ------------------------*/
    $('.img-poppu').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });
        
    /*--
    Smooth Scroll
    -----------------------------------*/
    $('.scroll-down').on('click', function(e) {
        e.preventDefault();
        var link = this;
        $.smoothScroll({
            offset: -80,
            scrollTarget: link.hash
        });
    });
        
    /* scrollUp jquery active
    --------------------------------------------- */
    $.scrollUp({
        scrollText: '<i class="fa fa-angle-up"></i>',
        easingType: 'linear',
        scrollSpeed: 900,
        animation: 'fade'
    });
      
    /* CounterUp
    ---------------------------- */ 
     $('.counter').counterUp({
        delay: 10,
        time: 2000
    }); 
 
    /* Google Maps
	------------------------------------*/
	 var myCenter=new google.maps.LatLng(51.124717, 71.422496);
            function initialize()
            {
                var mapProp = {
                	center:myCenter,
               		scrollwheel: false,
                	zoom:15,
                	mapTypeId:google.maps.MapTypeId.ROADMAP
                };
                var map=new google.maps.Map(document.getElementById("theme31"),mapProp);
                var marker=new google.maps.Marker({
	                position:myCenter,
	                animation:google.maps.Animation.BOUNCE,
	                icon:'img/map-marker.png',
	                map: map,
                });
                var styles = [
					{
						stylers: [
							{ hue: "#c5c5c5" },
							{ saturation: -100 }
						]
					},
                ];
                map.setOptions({styles: styles});
                marker.setMap(map);
            }
            google.maps.event.addDomListener(window, 'load', initialize);
            
      
    
})(jQuery);

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-93825438-1', 'auto');
  ga('send', 'pageview');