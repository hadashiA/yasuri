var $      = require('jquery'),
    Ladda  = require('./Ladda/dist/ladda.min'),
    suzuri = require('./lib/suzuri');

var signinScene = function() {
  $('.scene').hide();
  $('.signin-scene').show();
};

var uploadScene = function(user) {
  var $user = $('.user'),
      $button   = $('.uploader button'),
      $input    = $('.uploader input[type=file]'),
      $products = $('.products'),
      button    = Ladda.create($button[0]);

  var startCreateMaterialFromFrame = function(filename, frameNumber, dataURL) {
    var $li  = $(document.createElement('li'))
          .appendTo($products);

    var $a = $(document.createElement('a'))
          .prop('target', '_blank')
          .css({ display: 'block', width: '323px', height: '323px' })
          .appendTo($li);

    var $img = $(document.createElement('img'))
          .prop('id', filename + '-' + frameNumber)
          .addClass('product-image')
          .css({ width: 323, height: 323 });

    return suzuri.request('POST', 'materials', {
      texture: dataURL,
      title: filename + ' (' + (frameNumber + 1) + 'コマ目)',
      products: [
        { itemId: 1, published: true, resizeMode: 'contain' }
      ]
    })
      .then(function(body) {
        var material = body.material,
            product  = body.products[0];
        
        $img
          .prop('src', product.sampleImageUrl)
          .appendTo($a);
        $a
          .prop('href', product.sampleUrl)
          .css('backgroundColor', material.dominantRgb)
          .appendTo($li);

        return new Promise(function(resolve) {
          setTimeout(resolve, 2000);
        });
      });
  };

  $('.scene').hide();

  $user.find('.user-name').text(user.name);
  $user.find('.user-avatar').prop('src', user.avatarUrl);

  $('.upload-scene').show();

  $input.on('change', function(e) {
    var file        = this.files[0],
        reader      = new FileReader,
        promise     = Promise.resolve(),
        $sourceImg  = $('.source'),
        $previewImg = $('.preview');

    if (file.type !== 'image/gif') {
      alert(file.name + ' is not a gif.');
      return;
    }

    $products.empty();
    button.start();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
      var gif;
      
      $sourceImg.prop('src', e.target.result).show();
      $previewImg.prop('src', e.target.result);

      gif = new SuperGif({
        gif: $sourceImg[0],
        auto_play: false,
        loop_mode: false,
        draw_while_loading: false
      });
      gif.load(function() {
        var length = gif.get_length(),
            canvas = gif.get_canvas(),
            i;
        
        for (i = 0; i< length; i++) {
          (function() {
            var frameNumber = i,
                dataURL = canvas.toDataURL();
            promise.then(function() {
              return startCreateMaterialFromFrame(file.name, frameNumber, dataURL);
            })
              .then(function() {
                button.setProgress((i + 1) / length);
                if (i >= (length - 1)) {
                  $('.jsgif').hide();
                  $previewImg.show();
                  button.stop();
                }
              });

            gif.move_relative(1);
          })();
        }
      });
    };
  });

  $button.on('click', function(e) {
    $input.click();
  });
};


$(function() {
  var $indicator = $('#indicator');

  suzuri.request('GET', 'user')
    .then(function(body) {
      $indicator.hide();
      uploadScene(body.user);
    })
    .catch(function() {
      $indicator.hide();
      signinScene();
    });
});
