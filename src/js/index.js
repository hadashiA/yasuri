import React from 'react';
import $ from 'jquery';
import Ladda from 'ladda';
import suzuri from './lib/suzuri';

class Profile extends React.Component {
  render() {
    return (
      <p className="user">
        <span>Hello </span>
        <span>{this.props.user.name}</span>
        <img src={this.props.user.avatarUrl} width="30" height="30" />
      </p>
    );
  }
}

class UploadLayout extends React.Component {
  handleClick(e) {
    e.preventDefault();
    React.findDOMNode(this.refs.file).click();
  }

  handleFile(e) {
    var file = e.target.files[0];
    console.log(file);
  }

  render() {
    var handleClick = this.handleClick.bind(this),
        handleFile  = this.handleFile.bind(this);

    return (
      <div>
        <Profile user={this.props.user} />
        <form className="uploader">
          <input type="file" onChange={handleFile} ref="file" />
          <button className="ladda-button" data-style="expand-right" data-color="red" data-size="xl" onClick={handleClick}>
            <span className="ladda-label">+Add ANIMATED GIF</span>
          </button>
        </form>
      </div>
    );
  }
}

class SignInLayout extends React.Component {
  render() {
    return (
      <section>
        <a href={this.props.authorizeUrl}>Sign in SUZURI</a>
      </section>
    );
  }
}

class Indicator extends React.Component {
  render() {
    return (
      <div id="indicator">
        <img src="/img/indicator.gif" />
      </div>
    );
  }
}

class Yasuri extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
  }

  componentDidMount() {
    suzuri.request('GET', 'user')
      .then((body) => {
        this.setState({ user: body.user });
      })
      .catch(() => {
        this.setState({ user: null });
      });
  }

  render() {
    var layout;
    if (this.state.user) {
      if (this.state.user.name) {
        layout = <UploadLayout user={this.state.user} />;
      } else {
        layout = <SignInLayout authorizeUrl={this.props.authorizeUrl} />;
      }
    } else {
      layout = <Indicator />;
    }

    return (
      <div>{layout}</div>
    );
  }
}

var contentNode = document.getElementById('content'),
    authorizeUrl = contentNode.dataset.authorizeUrl;

React.render(<Yasuri authorizeUrl={authorizeUrl} />, contentNode);

// var uploadScene = function(user) {
//   var $user = $('.user'),
//       $button   = $('.uploader button'),
//       $input    = $('.uploader input[type=file]'),
//       $products = $('.products'),
//       button    = Ladda.create($button[0]);

//   var startCreateMaterialFromFrame = function(filename, frameNumber, dataURL) {
//     var $li  = $(document.createElement('li'))
//           .appendTo($products);

//     var $a = $(document.createElement('a'))
//           .prop('target', '_blank')
//           .css({ display: 'block', width: '323px', height: '323px' })
//           .appendTo($li);

//     var $img = $(document.createElement('img'))
//           .prop('id', filename + '-' + frameNumber)
//           .addClass('product-image')
//           .css({ width: 323, height: 323 });

//     return suzuri.request('POST', 'materials', {
//       texture: dataURL,
//       title: filename + ' (' + (frameNumber + 1) + 'コマ目)',
//       products: [
//         { itemId: 1, published: true, resizeMode: 'contain' }
//       ]
//     })
//       .then(function(body) {
//         var material = body.material,
//             product  = body.products[0];
        
//         $img
//           .prop('src', product.sampleImageUrl)
//           .appendTo($a);
//         $a
//           .prop('href', product.sampleUrl)
//           .css('backgroundColor', material.dominantRgb)
//           .appendTo($li);

//         return new Promise(function(resolve) {
//           setTimeout(resolve, 2000);
//         });
//       });
//   };

//   $('.upload-scene').show();

//   $input.on('change', function(e) {
//     var file        = this.files[0],
//         reader      = new FileReader,
//         promise     = Promise.resolve(),
//         $sourceImg  = $('.source'),
//         $previewImg = $('.preview');

//     if (file.type !== 'image/gif') {
//       alert(file.name + ' is not a gif.');
//       return;
//     }

//     $products.empty();
//     button.start();
//     reader.readAsDataURL(file);
//     reader.onload = function(e) {
//       var gif;
      
//       $sourceImg.prop('src', e.target.result).show();
//       $previewImg.prop('src', e.target.result);

//       gif = new SuperGif({
//         gif: $sourceImg[0],
//         auto_play: false,
//         loop_mode: false,
//         draw_while_loading: false
//       });
//       gif.load(function() {
//         var length = gif.get_length(),
//             canvas = gif.get_canvas(),
//             i;
        
//         for (i = 0; i< length; i++) {
//           (function() {
//             var frameNumber = i,
//                 dataURL = canvas.toDataURL();
//             promise = promise.then(function() {
//               return startCreateMaterialFromFrame(file.name, frameNumber, dataURL);
//             });

//             promise.then(function() {
//               button.setProgress((i + 1) / length);
//             });

//             if (i >= (length - 1)) {
//               promise.then(function() {
//                 $('.jsgif').hide();
//                 $previewImg.show();
//                 button.stop();
//               });
//             }
//             gif.move_relative(1);
//           })();
//         }
//       });
//     };
//   });

//   $button.on('click', function(e) {
//     $input.click();
//   });
// };


// $(function() {
//   var $indicator = $('#indicator');

//   suzuri.request('GET', 'user')
//     .then(function(body) {
//       $indicator.hide();
//       uploadScene(body.user);
//     })
//     .catch(function() {
//       $indicator.hide();
//       signinScene();
//     });
// });
