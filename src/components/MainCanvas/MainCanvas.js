import React, { useEffect, useRef } from 'react';
import spinner from '../../spinner.mp4';

const mobileSpeed = 0.5;
const pcSpeed = 0.85;
const picSpeed = window.innerWidth < 576 ? mobileSpeed : pcSpeed;
const centerOffset = 70;
const float_Gmin = 0.008;
const float_Gmax = 0.015;
const picScale = 0.1;
const newPicInterval = 60;
const perspectiveView = 0.8;
const { $ } = window;

const MainCanvas = ({ searchTerm, setSearchTerm }) => {
  const canvas = useRef(null);
  const ctx = useRef(null);
  const PERSPECTIVE = useRef(null);
  const fpsCount = useRef(0);
  const pictures = useRef([]);
  const picCount = useRef(0);
  // Pixabay stuff ==============================================
  const images = useRef([]);
  const currentImage = useRef(0);
  const loading = useRef(false);
  const fetchPage = useRef(1);
  const totalHits = useRef(null);
  const dontProject = useRef(false);

  window.videoGif = document.createElement('video');
  window.videoGif.src = spinner;
  window.videoGif.loop = true;

  // onComponentDidMount
  useEffect(() => {
    // Initial setup
    canvas.current = $('#MainCanvas');
    ctx.current = canvas.current.getContext('2d');
    // field of view for 3D scene
    PERSPECTIVE.current = canvas.current.width * perspectiveView;
    // start render loop

    class Picture {
      constructor(image) {
        this.image = image;
        this.angle = Math.random() * Math.PI * 2;
        this.x =
          Math.cos(this.angle) *
          (window.innerWidth < 576 ? centerOffset / 1.6 : centerOffset);
        this.y =
          Math.sin(this.angle) *
          (window.innerWidth < 576 ? centerOffset / 1.2 : centerOffset / 1.6);
        this.z = canvas.current.width / 100;
        this.speed = picSpeed;
        this.speedOut = false;
        this.speedOff = false;
        this.opacity = 0;
        this.float_amp = 0.4;
        // float on X
        this.float_x = 0;
        this.float_xSpeed = 0.35 * (Math.random() < 0.5 ? 1 : -1);
        this.float_xG = Math.random() * float_Gmin + float_Gmax;
        this.float_xGInvert = this.float_xSpeed < 0 ? 1 : -1;
        // float on Y
        this.float_y = 0;
        this.float_ySpeed = 0.35 * (Math.random() < 0.5 ? 1 : -1);
        this.float_yG = Math.random() * float_Gmin + float_Gmax;
        this.float_yGInvert = this.float_ySpeed < 0 ? 1 : -1;
        this.projected = {
          x: 0,
          y: 0,
          scale: 0
        };
        // prevent spawning angle to close to previous picture
        if (
          currentImage.current > 1 &&
          Math.abs(
            this.angle - pictures.current[pictures.current.length - 2].angle
          ) <
            Math.PI / 2.5 // angle difference is less then this angle
        ) {
          this.x *= -1;
          this.y *= -1;
        }

        this.id = picCount.current;
        pictures.current[this.id] = this;

        picCount.current > Number.MAX_SAFE_INTEGER
          ? (picCount.current = 0)
          : picCount.current++;
      }

      float() {
        let {
          float_x,
          float_xSpeed,
          float_xG,
          float_xGInvert,
          float_y,
          float_ySpeed,
          float_yG,
          float_yGInvert,
          float_amp
        } = this;
        // X
        this.float_x += float_xSpeed;
        this.float_xSpeed += (float_xG / 4) * float_xGInvert; // add a third of xG to Speed
        if (
          (float_xGInvert > 0 && float_x > 0) ||
          (float_xGInvert < 0 && float_x < 0)
        ) {
          // inver yG when X surpasses its staring position (0)
          this.float_xSpeed = float_amp * float_xGInvert;
          this.float_xGInvert *= -1; // invert G
          this.float_xG = Math.random() * float_Gmin + float_Gmax; // assign new xG
        }
        // Y
        this.float_y += float_ySpeed;
        this.float_ySpeed += (float_yG / 4) * float_yGInvert; // add a third of yG to Speed
        if (
          (float_yGInvert > 0 && float_y > 0) ||
          (float_yGInvert < 0 && float_y < 0)
        ) {
          // inver yG when Y surpasses its staring position (0)
          this.float_ySpeed = float_amp * float_yGInvert;
          this.float_yGInvert *= -1; // invert G
          this.float_yG = Math.random() * float_Gmin + float_Gmax; // assign new yG
        }
      }

      project() {
        let { x, y, opacity, speed, speedOff, speedOut } = this;

        if (speedOff) {
          // speed ease in to stop
          speed > 0 ? (this.speed *= 0.9) : (this.speed = 0);
        } else if (speed < picSpeed) {
          // fade speed in
          this.speed += 0.04;
        } else if (speedOut) {
          // speed out effect
          this.speed *= 1.1;
        }

        this.z -= this.speed;
        // fade in
        opacity < 1 ? (this.opacity += 0.007) : (this.opacity = 1);
        // calculate projection scale based on distance from camera
        this.projected.scale =
          PERSPECTIVE.current / (PERSPECTIVE.current + this.z);
        // calculate x and y projection position
        this.projected.x = x * this.projected.scale + canvas.current.width / 2;
        this.projected.y = y * this.projected.scale + canvas.current.height / 2;
      }

      draw() {
        // check window to apply speed smooth transition when projecting
        this.speedOff = window.pausePictures ? true : false;

        // calculate projection values if not paused
        !dontProject.current && this.project();

        // delete if projection scale falls out
        if (this.projected.scale < 0) {
          return delete pictures.current[this.id];
        }

        this.float(); // calculate float values

        // draw img
        let { image, projected, float_x, float_y } = this;
        let sx, sy, sw, sh, dx, dy, dw, dh;
        let scaleX = image.width * picScale * projected.scale;
        let scaleY = image.height * picScale * projected.scale;
        sx = 0;
        sy = 0;
        sw = image.width;
        sh = image.height;
        dx = projected.x - scaleX / 2 + float_x;
        dy = projected.y - scaleY / 2 + float_y;
        dw = scaleX;
        dh = scaleY;

        ctx.current.globalAlpha = this.opacity;
        ctx.current.globalCompositeOperation = 'destination-over';
        if (image.complete)
          ctx.current.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        else {
          // spinner video fallback (pic is loading)
          scaleX = window.videoGif.videoWidth * picScale * projected.scale;
          scaleY = window.videoGif.videoHeight * picScale * projected.scale;
          !window.isMobile && window.videoGif.play(); // this is becasue of a safari retarded bug (-_-)
          ctx.current.drawImage(
            window.videoGif,
            0,
            0,
            window.videoGif.videoWidth,
            window.videoGif.videoHeight,
            projected.x - scaleX / 2 + float_x,
            projected.y - scaleY / 2 + float_y,
            scaleX,
            scaleY
          );
        }
      }
    }

    function startPlaying() {
      window.restartCanvasMain = false;
      // set dimentions
      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;
      // set pictures
      pictures.current = []; // store each particle here
      picCount.current = 0;
      setTimeout(() => requestAnimationFrame(render), 100);
    }

    function render() {
      if (window.restartCanvasMain) return startPlaying();
      if (window.clearSearch) return clearSearch();

      // fps counter
      fpsCount.current === 60000 ? (fpsCount.current = 0) : fpsCount.current++;

      // clear canvas
      ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);

      // draw each picture
      for (let id in pictures.current) pictures.current[id].draw();

      // return if no initial fetch has finished
      if (!window.searchTerm || totalHits.current == null)
        return requestAnimationFrame(render);

      // edge cases
      if (currentImage.current === images.current.length && loading.current) {
        dontProject.current = true;
        if (loading.current) $('#Loading').style.opacity = 1;
        return requestAnimationFrame(render); // wait for searchFetch
      }

      // soon out of images to render
      if (
        currentImage.current >= images.current.length - 5 &&
        !loading.current &&
        window.searchTerm
      ) {
        // fetch next page
        if (fetchPage.current < totalHits.current / 20) fetchMore();
        // else loop if last imgage of last page
        else if (currentImage.current >= totalHits.current - 1)
          currentImage.current = 0;
      }

      //don't run if no results
      if (!totalHits.current) return requestAnimationFrame(render);

      // add new Picture every interval span
      if (fpsCount.current % newPicInterval === 0) {
        if (!window.pausePictures) {
          // but no if pause is true
          new Picture(images.current[currentImage.current]);
          currentImage.current++;
        }
      }

      return requestAnimationFrame(render);
    }

    function fetchMore() {
      loading.current = true;
      fetchPage.current++;
      fetch(
        `https://pixabay.com/api/?key=13006177-73169be48185efce371c8af86&q=${window.searchTerm}&page=${fetchPage.current}`
      )
        .then(res => res.json())
        .then(data => {
          data.hits.forEach(hit => {
            let newImage = document.createElement('img');
            newImage.src = hit.webformatURL;
            images.current.push(newImage);
          });
          loading.current = false;
          dontProject.current = false;
          $('#Loading').style.opacity = 0;
        });
    }

    function clearSearch() {
      window.clearSearch = false;
      window.searchTerm = '';

      images.current = []; // reset images
      currentImage.current = 0; // reset currentImage

      window.pausePictures = false; // unpause make sure
      $('footer ul').children[1].style.textShadow = null; // unstyle pause Element

      window.hideInfo();
      window.setInfo(0, 0);

      for (let id in pictures.current) {
        pictures.current[id].speedOff = false;
        pictures.current[id].speedOut = true; // speed out current set of displaying pics
      }
      requestAnimationFrame(render);
    }

    startPlaying();
  }, []);

  // searchTerm change effect
  useEffect(() => {
    // called each time searchterm changes
    window.searchTerm = searchTerm;

    // info elements handler
    if (!window.searchTerm) {
      // hide info elements and return
      $('#imagesFound').style.opacity = 0;
      $('#imagesShowing').style.opacity = 0;
      for (let id in pictures.current) pictures.current[id].speedOut = true; // speed out current set of displaying pics
      return;
    } else {
      // show info elements and don't return
      $('#imagesFound').style.opacity = 1;
      $('#imagesShowing').style.opacity = 1;
    }

    window.pausePictures = false; // unpause make sure
    $('footer ul').children[1].style.textShadow = null; // style pause Element
    loading.current = true;
    $('#Loading').style.opacity = 1;
    fetchPage.current = 1;
    fetch(
      `https://pixabay.com/api/?key=13006177-73169be48185efce371c8af86&q=${window.searchTerm}&page=${fetchPage.current}`
    )
      .then(res => res.json())
      .then(data => {
        if (data.total === 0) window.showNoImages(window.searchTerm);
        // show info elemts and set values
        $('#imagesFound').style.transform = null;
        $('#imagesShowing').style.transform = null;
        $('#imagesFound').style.opacity = 1;
        $('#imagesShowing').style.opacity = 1;
        $('#imagesFoundVal').textContent = data.total;
        $('#imagesShowingVal').textContent = data.totalHits;
        images.current = []; // reset images
        currentImage.current = 0; // reset currentImage
        data.hits.forEach(hit => {
          // push new images
          let newImage = document.createElement('img');
          newImage.src = hit.webformatURL;
          images.current.push(newImage);
        });
        for (let id in pictures.current) pictures.current[id].speedOut = true; // speed out current set of displaying pics
        totalHits.current = data.totalHits; // set totalHits
        dontProject.current = false;
        loading.current = false; // *done loading
        $('#Loading').style.opacity = 0;
      });
  }, [searchTerm]);

  return <canvas id="MainCanvas" />;
};

export default MainCanvas;
