var Kamihubuki = (function() {
  
  // public variable
  var options = {
    canvasId   : "kamihubuki-canvas",
    viewCount  : 500,
    randomColor: false,
    fill       : "yellow",
    zIndex     : 1000
  }

  // private variable
  var
  cvs,
  ctx,
  stageWidth,
  stageHeight,
  marginBottom   = 10, // スクロールが発生しないように縦幅を少し縮める
  kamikire_array = [],
  resizeFlg      = true;

  /**
   * 初期化
   */
  function init() {
    // キャンパスを取得
    cvs = document.getElementById(options.canvasId);

    if (!cvs || cvs.tagName !== 'canvas') {
      // 指定のcanvasがなければbody直下に生成する
      createCanvas();
    }

    // ウィンドウサイズ設定
    stageWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth;
    stageHeight = (window.innerHeight ? window.innerHeight : document.documentElement.clientHeight) - marginBottom;

    // ウィンドウサイズをキャンパスサイズに変更
    cvs.width = stageWidth;
    cvs.height = stageHeight;

    cvs.style.zIndex = options.zIndex;

    // キャンパス全面に四角を描画
    ctx = cvs.getContext("2d");
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // 紙吹雪生成
    for (var i = 0; i < options.viewCount; i++) {
      // 紙インスタンスを生成
      var kami = new Kamikire(2+Math.floor(Math.random()*10));

      // 位置をランダムで決定
      kami.x = Math.random()*stageWidth;
      kami.y = Math.random()*stageHeight;

      // 色を指定
      ctx.fillStyle = "#" + kami._r + kami._g + kami._b;
      ctx.fillRect(kami.x, kami.y, kami.SIZE, kami.SIZE);

      // 紙インスタンスを配列に入れる
      kamikire_array.push(kami);
    }

    // 描画を0.03秒ごとに行う
    setInterval(enterFrame, 30);
  }

  function createCanvas() {
    cvs = document.createElement('canvas');
    cvs.className = options.canvasId;
    cvs.style.position = 'absolute';
    cvs.style.top = 0;
    cvs.style.left = 0;
    document.getElementsByTagName('body')[0].append(cvs);
  }

  /**
   * 紙クラス
   */
  function Kamikire(_size) {
    // インスタンス変数
    this.SIZE = _size;
    this.x = 0;
    this.y = 0;
    this.alpha = 1;

    var t = Math.random()*Math.PI*2;
    var r = Math.floor((1+Math.cos(t))*127.9999);
    var g = Math.floor((1+Math.cos(t+Math.PI*2/3))*127.9999);
    var b = Math.floor((1+Math.cos(t-Math.PI*2/3))*127.9999);

    this._r = r;
    this._g = g;
    this._b = b;
    this._backColor = 0x010101*Math.floor(127+Math.random()*64);
    this._omega = (Math.random()*2-1)*Math.PI/4;
    this._fallTheta = 0;
    this._fallSpeed = 1+Math.random()*2;

    this._theta = Math.random()*Math.PI*2;
    this._Ax = 1;
    this._Ay = Math.random();
    this._Az = Math.random()*2-1;

    var _l = Math.sqrt(this._Ax*this._Ax+this._Ay*this._Ay+this._Az*this._Az);
    this._Ax /= _l;
    this._Ay /= _l;
    this._Az /= _l;

    var _s = Math.sqrt(this._Ax*this._Ax+this._Ay*this._Ay);
    if (_s == 0) {
      this._Bx = 1.0; this._By = 0.0; this._Bz = 0.0;
      this._Cx = 0.0; this._Cy = 1.0; this._Cz = 0.0;
    } else {
      this._Bx = this._Ay; this._By = -this._Ax; this._Bz = 0;
      this._Cx = this._Ax*this._Az; this._Cy = this._Ay*this._Az; this._Cz = -(_s*_s);
      this._Bx /= _s; this._By /= _s;
      this._Cx /= _s*_l; this._Cy /= _s*_l; this._Cz /= _s*_l;
    }
  }

  /**
   * 紙クラスの拡張
   */
  Kamikire.prototype = {
    /**
     * 3Dの回転をゲット
     */
    getRotation3D: function() {
      return this._theta - (Math.PI*2)*Math.floor(this._theta/(Math.PI*2));
    },

    /**
     * 3Dの回転をセット
     */
    setRotation3D: function(theta) {
      this._theta = theta - (Math.PI*2)*Math.floor(theta/(Math.PI*2));
      var _cos = Math.cos(this._theta);
      var _sin = Math.sin(this._theta);

      // vector F is the rotated image of (1,0,0);
      var _Fx = this._Ax*this._Ax+(this._Bx*this._Bx+this._Cx*this._Cx)*_cos;
      var _Fy = this._Ax*this._Ay+(this._Bx*this._By+this._Cx*this._Cy)*_cos+(this._Bx*this._Cy-this._Cx*this._By)*_sin;
      var _Fz = this._Ax*this._Az+(this._Bx*this._Bz+this._Cx*this._Cz)*_cos-(this._Bx*this._Cz-this._Cx*this._Bz)*_sin;
      // vector G is the rotated image of (0,1,0);
      var _Gx = this._Ax*this._Ay+(this._By*this._Bx+this._Cy*this._Cz)*_cos+(this._By*this._Cx-this._Cy*this._Bx)*_sin;
      var _Gy = this._Ay*this._Ay+(this._By*this._By+this._Cy*this._Cy)*_cos;
      var _Gz = this._Ay*this._Az+(this._By*this._Bz+this._Cy*this._Cz)*_cos+(this._By*this._Cz-this._Cy*this._Bz)*_sin;

      if (options.randomColor) {
        //ctx.fillStyle = 'rgba('+this._r+', '+this._g+', '+this._b+', '+this.alpha+')';
        ctx.fillStyle = 'rgb('+this._r+', '+this._g+', '+this._b+')';
      } else {
        ctx.fillStyle = options.fill;
      }

      ctx.beginPath();
      ctx.lineTo(this.x+-_Fx*this.SIZE/2+_Gx*this.SIZE/2, this.y+-_Fy*this.SIZE/2+_Gy*this.SIZE/2);
      ctx.lineTo(this.x+-_Fx*this.SIZE/2-_Gx*this.SIZE/2, this.y+-_Fy*this.SIZE/2-_Gy*this.SIZE/2);
      ctx.lineTo(this.x+_Fx*this.SIZE/2-_Gx*this.SIZE/2, this.y+_Fy*this.SIZE/2-_Gy*this.SIZE/2);
      ctx.lineTo(this.x+_Fx*this.SIZE/2+_Gx*this.SIZE/2, this.y+_Fy*this.SIZE/2+_Gy*this.SIZE/2);
      ctx.closePath();

      ctx.fill();
    },

    /**
     * 落ちる
     */
    fall: function() {
      this.setRotation3D(this.getRotation3D() + this._omega);
      this.x += this._fallSpeed*Math.sin(this._fallTheta);
      this.y += this._fallSpeed*Math.cos(this._fallTheta);
      this._fallTheta += (Math.random()*2-1)*Math.PI/12;
      if (this._fallTheta < -Math.PI/2) {
        this._fallTheta = -Math.PI - this._fallTheta;
      }
      if (this._fallTheta > Math.PI/2) {
        this._fallTheta = Math.PI - this._fallTheta;
      }
    }
  }

  /**
   * フレームイン
   */
  function enterFrame() {
    // 初期化
    if (resizeFlg) {
      resizeFlg = false;
      cvs.width = stageWidth;
      cvs.height = stageHeight;
    }

    // 紙をクリアー
    ctx.clearRect(0, 0, stageWidth, stageHeight);

    // 表示更新
    for (var i = 0; i < options.viewCount; ++i) {
      if (kamikire_array[i].y > 0) {
        var par = kamikire_array[i].y / stageHeight;
        par = 1 - par;
        kamikire_array[i].alpha = par;
      }

      if (kamikire_array[i].x - kamikire_array[i].SIZE/Math.SQRT2 > stageWidth) {
        kamikire_array[i].x -= stageWidth;
      }

      if (kamikire_array[i].x + kamikire_array[i].SIZE/Math.SQRT2 < 0) {
        kamikire_array[i].x += stageWidth;
      }

      if (kamikire_array[i].y - kamikire_array[i].SIZE/Math.SQRT2 > stageHeight) {
        kamikire_array[i].y -= stageHeight;
      }
      kamikire_array[i].fall();
    }
  }

  /**
   * リサイズ
   */
  window.addEventListener('resize', function() {
    resizeFlg = true;
    stageWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth;
    stageHeight = (window.innerHeight ? window.innerHeight : document.documentElement.clientHeight)  - marginBottom;
  });

  return {
    run: init,
    options: options
  }
})();
