(function () {
  "use strict";

  window.onload = function () {

    var hideOption = function (opt) {
      $(opt).parents(".playlists-item").on("mouseleave", function () {
        $(opt).hide("slow");
      });
    };

    $(".options").on("click", function () {
      var optionTitle = $(this).find('.options-title');
      optionTitle.show("slow");
      hideOption(optionTitle);
    });

    // Options click end

    // Notification start

    // var iconHeader = function (icon) {
    //   $(icon).parents("#header").on("mouseleave", function () {
    //     $(icon).fadeOut();
    //   });
    // }
    //
    // $("#notification-icon").on("click", function () {
    //   var notification = $(this).parents("#notification").find('.notification-block');
    //   notification.fadeIn();
    //   iconHeader(notification);
    //   console.log("log");
    // });

    // Notification end

    // Modal start

    $("#info-service").on("click", function (e) {
      e.preventDefault();
      $("#modal-info").fadeIn();
    });

    $(".close-modal").on("click", function () {
      $("#modal-info").fadeOut();
    });

    $("#modal-info").on("click", function (e) {
      if (e.target.offsetParent) {
        return false;
      }
      $(this).fadeOut();
    });

    // Modal end

  };

})();
