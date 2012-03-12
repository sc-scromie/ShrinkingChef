// $Id: floating_block.js,v 1.3 2011/01/07 16:08:01 alexpott Exp $

/**
 * Provides the ability to fix a html block to a position on the page when the 
 * browser is scroled.
 *
 * This code is based on tableheader.js
 */
(function ($) {
// Keep track of all floating blocks.
var floating_blocks = [];

Drupal.blockFloatDoScroll = function () {
  if (typeof(Drupal.blockFloatOnScroll) == 'function') {
    Drupal.blockFloatOnScroll();
  }
};

/**
 * Attaches the floating_block behavior.
 */
Drupal.behaviors.blockFloat = {
  attach: function (context) {
    var doResize = true;
    // This breaks in anything less than IE 7. Prevent it from running.
    if (!jQuery.support.boxModel) {
      return;
    }
    if (jQuery.isFunction(context.parent)) {
      context = context.parent();
      doResize = false;
    }  
    $(Drupal.settings.floating_block).each(function (i, selector) {
      $(selector.toString() + ':not(.blockFloat-processed)', context).each(function (j, block) {
        var blockInfo = [];
        blockInfo.original_position = $(block).offset();
        blockInfo.original_css_position = $(block).css("position");
        blockInfo.original_identifier = 'blockFloat-' + floating_blocks.length;
        blockInfo.viewHeight = 0;
        floating_blocks.push(blockInfo);
        // Initialzing block positioning.
        tracker(blockInfo);
        $(block).addClass('blockFloat-processed ' + blockInfo.original_identifier);
      });
    });

    // Track positioning and visibility.
    function tracker(e) {
      // Save positioning data.
      var viewHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      var block = $('.' + e.original_identifier);
      if (block.length > 0) {
        if (e.viewHeight != viewHeight) {
          if (e.reset) {
            //reset block so we can calculate new position
            block.css({left: e.original_position.left + 'px', position: e.original_css_position, top: e.original_position.top + 'px'});
            e.original_position = $(block).offset();
            e.original_css_position = $(block).css("position");
          }
          e.viewHeight = viewHeight;
          e.docHeight = $(document).height();
          e.vPosition = e.original_position.top;
          e.hPosition = e.original_position.left;
          e.blockHeight = block.height();
        }

        // Track horizontal positioning relative to the viewport and set position.
        var current_position = block.offset();
        var hScroll = document.documentElement.scrollLeft || document.body.scrollLeft;
        var vOffset = (document.documentElement.scrollTop || document.body.scrollTop) - e.vPosition;

        if (vOffset > 0) {
          //Don't let the bottom of the block go beneath the document height
          var topPosition = 0;
          if ((current_position.top + e.blockHeight) > e.docHeight) {
             topPosition = block.docHeight - current_position.top - e.blockHeight;
          }
          block.css({left: -hScroll + e.hPosition + 'px', position: 'fixed', top: topPosition + 'px'});
        }
        else {
          block.css({left: e.original_position.left + 'px', position: e.original_css_position, top: e.original_position.top + 'px'});
        }
      }
    }

    // Only attach to scrollbars once, even if Drupal.attachBehaviors is called
    //  multiple times.
    if (!$('body').hasClass('blockFloat-processed')) {
      $('body').addClass('blockFloat-processed');
      $(window).scroll(Drupal.blockFloatDoScroll);
      $(document.documentElement).scroll(Drupal.blockFloatDoScroll);
    }

    // Track scrolling.
    Drupal.blockFloatOnScroll = function() {
      $(floating_blocks).each(function () {
        tracker(this);
      });
    };

    // Track resizing.
    var time = null;
    var resize = function () {
      // Ensure minimum time between adjustments.
      if (time) {
        return;
      }
      time = setTimeout(function () {
        $(floating_blocks).each(function () {
          this.viewHeight = 0;
          this.reset = true;
          tracker(this);
        });
        // Reset timer
        time = null;
      }, 250);
    };
    
    if (doResize) {
      $(window).resize(resize);
    }
  }
};
})(jQuery);