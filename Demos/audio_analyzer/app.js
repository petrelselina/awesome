/**
 * Created by Roger on 16/6/5.
 */
var ctx = {
  init: function () {
    var _this = this;
    console.log(this);
    _this.progress = document.getElementById('progress');
    _this.stage = document.getElementById('stage');

    _this.context = new AudioContext();

    _this.analyzer = _this.context.createAnalyser();
    _this.analyzer.smoothingTimeConstant = 0.3;
    _this.analyzer.fftSize = 2048;

    _this.node = _this.context.createScriptProcessor(2048, 1, 1);
    _this.node.onaudioprocess = _this._handleAudioData.bind(_this);

    _this.source = _this.context.createBufferSource();

    _this.localRes = document.getElementById('localRes');
    _this.localRes.onchange = function () {
      _this.initLocalResource();
    };
  },
  connect: function () {
    var _this = this;
    if (_this.source.buffer) {
      _this.disconnect();
      _this.source = _this.context.createBufferSource();
    }
    _this.analyzer.connect(_this.node);
    _this.node.connect(_this.context.destination);
    _this.source.connect(_this.analyzer);
    _this.analyzer.connect(_this.context.destination);
  },
  disconnect: function () {
    var _this = this;
    _this.source.stop();
    _this.source.disconnect();
    _this.node.disconnect();
    _this.analyzer.disconnect();
  },
  initLocalResource: function () {
    var _this = this;
    var fr = new FileReader();
    _this.connect();
    fr.onload = function (e) {
      console.log('audio loaded');
      _this.context.decodeAudioData(e.target.result, function (buffer) {
        if (_this.source.buffer) {
          _this.disconnect();
          _this.source = _this.context.createBufferSource();
        }
        _this.source.buffer = buffer;
        _this.source.loop = true;
        _this.source.start(0);
      }, function (e) {
        console.log("!哎玛，文件解码失败:(");
      });
    }
    fr.readAsArrayBuffer(_this.localRes.files[0]);
  },
  initWebResource: function () {
    var _this = this;
    _this.connect();
    _this.xhr = new XMLHttpRequest();
    _this.xhr.onload = function () {
      _this.context.decodeAudioData(_this.xhr.response, function (b) {
        _this.source.buffer = b;
        _this.source.loop = true;
        _this.source.start(0);
      });
    };
    _this.xhr.onprogress = function (ev) {
      _this.progress.max = ev.total;
      _this.progress.value = ev.loaded;
    };
    _this.xhr.open('GET', './demo.mp3', true);
    _this.xhr.responseType = 'arraybuffer';
    _this.xhr.send();
  },
  _handleAudioData: function () {
    var _this = this;
    var len = _this.analyzer.frequencyBinCount;
    var array = new Uint8Array(len);
    _this.analyzer.getByteFrequencyData(array);
    var newArray = array.filter(function (item, i) {
      return (i + 1) % 10 === 0;
    });
    if (_this.stage.childNodes.length < newArray.length) {
      var frag = document.createDocumentFragment();
      newArray.forEach(function (item, i) {
        var wrapper = document.createElement('div');
        var headDiv = document.createElement('div');
        var div = document.createElement('div');
        div.style.transform = 'translateY(' + (300 - item) + 'px)';
        var color = _this._getColor(i, newArray.length);
        div.style.backgroundColor = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
        div.className = 'level';
        headDiv.style.backgroundColor = div.style.backgroundColor;
        headDiv.style.transform = div.style.transform;
        headDiv.className = 'head';
        wrapper.className = 'levelWrapper';
        wrapper.appendChild(headDiv);
        wrapper.appendChild(div);
        frag.appendChild(wrapper);
      });
      _this.stage.innerHTML = '';
      _this.stage.appendChild(frag);
    } else {
      newArray.forEach(function (item, i) {
        var wrapper = _this.stage.childNodes[i];
        var head = wrapper.getElementsByClassName('head')[0];
        var body = wrapper.getElementsByClassName('level')[0];
        body.style.transform = 'translateY(' + (300 - item) + 'px)';
        var headPos = +(head.style.transform.match(/\d+/g)[0]);
        if (headPos < (300 - item)) {
          head.style.transform = 'translateY(' + (headPos + 5) + 'px)';
        } else {
          head.style.transform = 'translateY(' + (300 - item) + 'px)';
        }
      });
    }

  },
  _getColor: function (index, total) {
    var per = 255 * 4 / total;
    var cur = per * index;
    var result = {};
    if (cur <= 255) {
      result.b = 255;
      result.g = ~~cur;
      result.r = 0;
    } else if (cur <= 255 * 2 && cur > 255) {
      result.b = ~~(255 * 2 - cur);
      result.g = 255;
      result.r = 0;
    } else if (cur <= 255 * 3 && cur > 255 * 2) {
      result.b = 0;
      result.g = 255;
      result.r = ~~(cur - 255 * 2);
    } else {
      result.b = 0;
      result.g = ~~(255 * 4 - cur);
      result.r = 255;
    }
    return result;
  },
};

ctx.init();
