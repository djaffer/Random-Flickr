import React from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import Loader from "react-loader-spinner";
import Button from "@material-ui/core/Button";
import renderIf from "render-if";
class Gallery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      photos: []
    };
  }
  getImages() {
    fetch(
      "https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=ca370d51a054836007519a00ff4ce59e&per_page=10&format=json&nojsoncallback=1"
    )
      .then(res => res.json())
      .then(result => {
        Promise.all(
          result.photos.photo.map(photo => {
            return fetch(
              `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=ca370d51a054836007519a00ff4ce59e&photo_id=${
                photo.id
              }&format=json&nojsoncallback=1`
            ).then(imageResp => imageResp.json());
          })
        )
          .then(images => {
            this.setState({
              photos: images.map(img => {
                return {
                  original: img.sizes.size[img.sizes.size.length - 1].source,
                  thumbnail: img.sizes.size[2].source
                };
              }),
              isLoaded: true
            });
          })
          .catch(error => {
            this.setState({
              isLoaded: true,
              error
            });
          });
      })
      .catch(error => {
        this.setState({
          isLoaded: true,
          error
        });
      });
  }
  componentDidMount() {
    this.getImages();
  }
  buttonHandler(ev) {
    this.setState(
      {
        isLoaded: false
      },
      this.getImages
    );
  }

  render() {
    const { error, isLoaded } = this.state;
    return (
      <div>
        <Button
          className="randomButton"
          variant="contained"
          color="primary"
          onClick={this.buttonHandler.bind(this)}
        >
          Get images
        </Button>
        {renderIf(error && error.message)(
          <div>Error: {error && error.message}</div>
        )}

        {renderIf(!isLoaded)(
          <div>
            <Loader type="Puff" color="#00BFFF" height={500} width={500} />
          </div>
        )}
        {renderIf(isLoaded)(
          <ImageGallery thumbnailPosition="bottom" items={this.state.photos} />
        )}
      </div>
    );
  }
}
export default Gallery;
