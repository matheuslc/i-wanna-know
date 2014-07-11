/*
 * I wanna know.
 * Version: 0.1
 * matheuslc.github.io/i-wanna-know
 * Released under the MIT license.
 * Date: 10-07-2014.
 */



;(function(window, undefined) {

  /**
  * Variables used in entire project.
  */

  var context = new audioCtx(),
      source,
      analyser,
      analyser2,
      gain,
      processor,
      splitter,
      fftSize = 256,
      smooth = 0.5,
      wavesNumber = 14,
      browser = navigator.userAgent.toLowerCase();

/**
 * Audio Context support.
 *
 * @return {audioContext}.
 */
function audioCtx() {

  window.AudioContext = window.AudioContext || window.webkitAudioContext ||
                        window.mozAudioContext;

  if(window.AudioContext) {
    return new window.AudioContext();
  } else {
    alert("Sorry bro. Your browser doesn't provide Audio API support.");
  }

}

/**
 * Request animation frame support.
 *
 * @return {requestAnimaionFrame}.
 */
function rqstAnimationFrame() {

  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
                                 window.mozRequestAnimationFrame;
  
  if(window.requestAnimationFrame) {
    return window.requestAnimationFrame;
  } else {
    alert("Seriously bro. Take a modern web broswer, thank you.");
  }

}

/**
 * AJAX Request for load the sound.
 *
 * @param {blob} url Contains the sound path.
 */
function loadSound() {

  var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";

      request.onload = function() {
        spinner('.spinner');
      },

      request.onreadystatechange = function() {

        if(request.readyState === 4 && request.status === 200) {
          context.decodeAudioData(request.response, function(data) {
            spinner('.spinner');
            getAudioData(data);
          }, onError);
        }
      },

      request.send();

}

/**
* Log the error.
*
* @param {string} e error return from callback.
*/
function onError(e) {
  console.log(e);
}

/**
 * Make Audio API nodes
 */
function makeNodes() {

  // Check if have a buffer created.
  if(!source) {
    source    = context.createBufferSource();
    analyser  = context.createAnalyser();
    analyser2 = context.createAnalyser();
    processor = context.createScriptProcessor();
    splitter  = context.createChannelSplitter();
    gain      = context.createGain();
  }

}

/**
 * Conntect audio to destination, splitt the audio in two
 * channels, and analyse the data for each.
 *
 * @param {arraybuffer} data sound decoded.
 */
 function getAudioData(data) {

  // Pute the data in buffer.
  source.buffer = data;
  processor.connect(context.destination);

  // Make the analysers.
  analyser.smootingTimeConstant = smooth;
  analyser.fftSize = fftSize;

  analyser2.smootingTimeConstant = smooth;
  analyser2.fftSize = fftSize;

  // Split the sound.
  source.connect(splitter);
  splitter.connect(analyser, 0, 0);
  splitter.connect(analyser2, 1, 0);
  analyser.connect(processor);

  // Control volume node.
  source.connect(gain);
  gain.gain.value = 0.5;

  // Final node connect to destination.
  gain.connect(context.destination);
  
  // Start the sound.
  source.start(0);

  /**
   * On audio process analyze the frequencies and
   * put this on array.
   */
  processor.onaudioprocess = function() {
    var array,
        array2,
        leftChannel,
        rightChannel;

        array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);

        array2 = new Uint8Array(analyser2.frequencyBinCount);
        analyser2.getByteFrequencyData(array2);

        leftChannel  = getAverage(array, wavesNumber);
        rightChannel = getAverage(array2, wavesNumber);
        getAM(leftChannel, rightChannel);
  };

 }

/**
* Get the average by range of frequencies.
* The rage is set by frequencie divisor.
*
* @param {array} array The frequencie array.
* @param {integer} frequencieDivisor the number of parts into whichthe array will be sliced.
* @return {array} result A array with frequencies range average.
*/
function getAverage(array, frequenciesDivisor) {

  var result = new Array(frequenciesDivisor),
      i      = 0,
      j      = 0,
      fragmentSize = 0,
      size   = Math.floor(array.length / frequenciesDivisor);

  for(j = 0; j < frequenciesDivisor; j++) {
    result[j] = 1;

    if(j === 0) {
      fragmentSize = size * 1;
    } else {
      fragmentSize = size * j;
    }

    for(i = 0; i < size; i++) {
      result[j] += array[fragmentSize + i];
    }
      result[j] = result[j] / size;
  }

  return result;

}

/**
 * Control the volume usin gain node
 * @param {integer} value audio volume
 */
 function volume(value) {
  gain.gain.value = value;
 }

/**
* Make the canvas waves with frequencies
*
* @param {array} leftChannel Array with left audio channel
* average.
* @param {array} rightChannel Array with right audio channel
* average.
* @param {string} canvas The Canvas ID
*/
function getAM(leftChannel, rightChannel) {

  var canvas   = document.getElementById("beat"),
      i        = 0,
      j        = leftChannel.length - 1,
      initP    = 21.25,
      nextP    = 28.75,
      back     = false,
      ctx      = canvas.getContext("2d");


  canvas.width     = window.innerWidth;
  canvas.height    = 300;
  ctx.strokeStyle  = "#fff";
  ctx.lineCap      = "round";
  ctx.lineWidth    = 4;
  ctx.lineJoin     = "miter";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(12, canvas.height / 2);

  for (i = 0; i < Math.round(canvas.width / 26); i++) {
   
   if(j === 0) {
    back = true;
   } else if ( j === leftChannel.length - 1) {
    back = false;
   }

   if(back === false) {
    j--;
   } else {
    j++;
   } 

    ctx.quadraticCurveTo(initP, 150  + (rightChannel[j] * -1), nextP, canvas.height / 2 );
    initP += 12.5;
    nextP += 11.25;
    ctx.quadraticCurveTo(initP, 150  + (leftChannel[j] * 1), nextP, canvas.height / 2 );
    initP += 12.5;
    nextP += 13.75;
  }

    ctx.lineTo(canvas.width - 20, canvas.height / 2);
    ctx.stroke();

    rqstAnimationFrame(getAM);

}

/**
 * Make load appear and disapear
 * @param {string} klass HTML element class from loader
 */
 function spinner(klass) {
  var el = document.querySelector(klass);

      // If support Audio API, supports classList \o
      el.classList.toggle("spinner-hide");
 }

 /**
  * Get file blob url
  * @param {string} id ID from HTML element where file will be inputed.
    @return {blob} The blob url
  */
  function getFile(id) {
    var file,
        reader,
        files,
        url;

    files   = document.getElementById(id);
    reader  = new FileReader();
    file    = files.files[0];

    // Check if is MP3

    if(file.type === "audio/mpeg" || file.type === "audio/mp3") {

      url = window.URL.createObjectURL(file);
      return url;
    } else {
      return false;
    }

  }



/**
 * Make the magic
 */
  var file         = document.getElementById("file"),
      sound        = document.getElementById("volume-control"),
      wavesControl = document.getElementById("waves-control"),
      url;

  file.addEventListener("change", function(e) {
    e.preventDefault();
    url = getFile("file");
    if(url !== false) {
      makeNodes();
      loadSound(url);
    } else {
      alert("Only mp3 bro. Select another file");
    }

  });

  sound.addEventListener("change", function(e) {
    e.preventDefault();
    volume(sound.value);
  }, false);

  wavesControl.addEventListener("change", function(e) {
    e.preventDefault();
    wavesNumber = this.value;
  });


})(window);