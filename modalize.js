(function($){
  $.fn.modalize = function(options){

    var Modalize = function(element, options){

      var $element        = $(element),
          $modal          = $('#modal'),
          $modalContent   = $('.content', $modal),
          $modalOverlay   = $modal.parent(),
          obj             = this,
          ajaxRequest;

      var options = $.extend({
        transitionSpeed: 'fast',
        closable: true
      }, options || {});

      this.hideModal = function(){
        $modalOverlay.fadeOut();
      }

      this.showModal = function(requestOptions){
        obj.populateModal(requestOptions);

        obj.setPosition(requestOptions.modal_position);
        obj.setClosable(requestOptions.closable !== false);

        $modalOverlay.fadeIn(options.transitionSpeed, function(){
          $('input[type="text"], input[type="email"]', $modal).first().focus();
        });
      }

      this.populateModal = function(requestOptions){
        //Cancel current AJAX request
        if(ajaxRequest){
          ajaxRequest.abort();
        }

        //Clear Modal
        obj.setLoading();

        var params = {}

        ajaxRequest = $.ajax({
          type: 'GET',
          url: '/modals/' + requestOptions['modal_type'],
          data: requestOptions,
          success: function(layout){
            $modalContent.html(layout);
            FB.XFBML.parse(document.getElementById('modal'));
          }
        });

        return obj;
      }

      this.setClosable = function(closable){
        if(closable){

          // check inputs for non-empty values (user-edited)
          function checkForInput() {            
            edited = 0; // flag, did the user enter data?
            $('#modal input[type=text], #modal input[type=password], #modal input[type=email], #modal textarea').each(function(){
              var thevalue = $(this).val().trim();
              if (thevalue != '') {
                edited = 1;
              }            
            });

            if (edited != 0) {
              var conf = confirm("You've entered some text.\nAre you sure you want to cancel?");
              if (conf == true) { 
                obj.hideModal();                
                if ($('#onboarding-user-form').length > 0){
                  location.reload(true);  
                }
              }
            } else {
              obj.hideModal();              
              if ($('#onboarding-user-form').length > 0){
                location.reload(true);  
              }
            }
          }

          // close modal if overlay is clicked. Unbind + bind here prevents this event from firing twice per click
          $modalOverlay.unbind('click').bind('click', function(e){            
            if($(e.target).is($modalOverlay)){
              checkForInput();
            }            
          });

          // close modal on ESCAPE key. off + on here prevents this event from firing twice per ESC
          $('body').off('keyup').on('keyup', function(e) {            
            if (e.keyCode == 27) {                            
              checkForInput();
            }
          });

          // explicit close button          
          $('.close-modal').unbind('click.close-modal-button').bind('click.close-modal-button', function(e) {                        
            checkForInput();
          });


        } else {
          $modal.off('click', '.close-modal');
          $('body').off('keyup');
          $modalOverlay.unbind('click');
          $modal.removeClass('closable');
          $modal.addClass('not-closable');
        }

        return obj;
      }

      this.setPosition = function(position){
        position == 'top-of-page' ? $modal.addClass('top-of-page') :  $modal.removeClass('top-of-page');
      }

      this.setLoading = function(){
        $modalContent.html('<h2 class="icon spinner spinner-2">Loading</h2>');
      }

      //Private - FOR DEBUGGING
      this.details = function(){
        console.log(element);
        console.log(obj);
        console.log(options);
        console.log($modal);
        console.log($modalContent);
        console.log($modalOverlay);
      }

      var init = function(){
        $element.on('click', '.modal-link', function(e){
          e.preventDefault();
          var requestOptions = {
            modal_type: $(this).data('modal'),
            item: $(this).data('item'),
            resource_type: $(this).data('resource-type'),
            modal_type: $(this).data('modal'),
            title: $(this).data('title'),
            text: $(this).data('text'),
            source: $(this).data('source'),
            item_id: $(this).data('item-id'),
            item_type: $(this).data('item-type'),
            ga_action: $(this).data('ga-action'),
            ga_label: $(this).data('ga-label'),
            link_to: $(this).data('link-to')
          };
          obj.showModal(requestOptions);
        });

        obj.setClosable(options.closable);
      }();
    }

    var createModalOverlay = function(){
      if($('#modal').length < 1){
        return $('<div id="modal-overlay"><div id="modal" class="large-5-fixed medium-7-fixed small-12"><a class="icon cancel-circle notext end-of-line close-modal close-modal-button">Close</a><div class="content"></div></div></div>').appendTo('body');
      }
    };

    return this.each(function(){
      createModalOverlay();

      var element = $(this);

      if(element.data('modalize')) return ;

      var modalize = new Modalize(this, options);

      element.data('modalize', modalize);
    });
  }
})(jQuery);
