import React from 'react';
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

class FrameList extends React.Component {
  render() {
    var productsNode = this.props.frames.map(function(frame) {
      var material = frame.material,
          product  = frame.products[0],
          background = {
            backgroundColor: material.dominantRgb
          };

      return (
        <li>
          <a href={product.sampleUrl} style={background} target="_blank">
            <img src={product.sampleImageUrl} width="323" height="323" />
          </a>
        </li>
      );
    });

    return <ul>{productsNode}</ul>;
  }
}

class UploadLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      frames: [],
      sourceDataUrl: null
    };
  }

  componentDidMount() {
    var buttonNode = React.findDOMNode(this.refs.button);
    this.button = Ladda.create(buttonNode);
  }

  handleClick(e) {
    e.preventDefault();
    React.findDOMNode(this.refs.file).click();
  }

  handleFile(e) {
    var file    = e.target.files[0],
        reader  = new FileReader,
        promise = Promise.resolve();
    
    this.button.start();

    reader.readAsDataURL(file);
    reader.onload = (e) => {
      var dataUrl = e.target.result,
          img = document.getElementById('gif-canvas'),
          gif;
      
      this.setState({ sourceDataUrl: dataUrl, frames: [] });

      img.src = dataUrl;
      gif = new SuperGif({
        gif: img,
        auto_play: false,
        loop_mode: false,
        draw_while_loading: false
      });
      gif.load(() => {
        var length = gif.get_length(),
            canvas = gif.get_canvas(),
            i;
        
        for (i = 0; i < length; i++) {
          let frameNumber = i,
              dataUrl = canvas.toDataURL();
          promise = promise
            .then(() => {
              return suzuri.request('POST', 'materials', {
                texture: dataUrl,
                title: `${file.name} (${i + 1}コマ目)`,
                products: [
                  { itemId: 1, published: true, resizeMode: 'contain' }
                ]
              });
            })
            .then((body) => {
              this.setState({ frames: this.state.frames.concat(body)});
              if (i >= (length - 1)) {
                this.button.stop();
                return Promise.resolve();
              } else {
                this.setProgress((i + 1) / length);
                return new Promise(function(resolve) {
                  setTimeout(resolve, 2000);
                });
              }
            });
          gif.move_relative(1);
        }
      });
    };
  }

  render() {
    var handleClick = this.handleClick.bind(this),
        handleFile  = this.handleFile.bind(this),
        sourceImgNode = null;

    if (this.state.sourceDataUrl) {
      sourceImgNode = <img src={this.state.sourceDataUrl} height="100" />;
    }

    return (
      <section>
        <Profile user={this.props.user} />
        <form className="uploader">
          <input type="file" onChange={handleFile} ref="file" />
          <button className="ladda-button" data-style="expand-right" data-color="red" data-size="xl" onClick={handleClick} ref="button">
            <span className="ladda-label">+Add ANIMATED GIF</span>
          </button>
        </form>
        <div>
          {sourceImgNode}
        </div>
        <FrameList frames={this.state.frames} />
      </section>
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
        this.setState({ user: {} });
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
