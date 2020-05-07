/*
 * L.TileLayer.Grayscale is a regular tilelayer with grayscale makeover.
 */

L.TileLayer.Grayscale = L.TileLayer.extend({
	options: {
		enableCanvas: true
	},

	initialize: function (url, options) {
		var canvasEl = document.createElement('canvas');
		if( !(canvasEl.getContext && canvasEl.getContext('2d')) ) {
			options.enableCanvas = false;
		}

		L.TileLayer.prototype.initialize.call(this, url, options);
	},

	_loadTile: function (tile, tilePoint) {
		tile.setAttribute('crossorigin', 'anonymous');
		L.TileLayer.prototype._loadTile.call(this, tile, tilePoint);
	},

	_tileOnLoad: function () {
		if (this._layer.options.enableCanvas && !this.canvasContext) {
			var canvas = document.createElement("canvas");
			canvas.width = canvas.height = this._layer.options.tileSize;
			this.canvasContext = canvas.getContext("2d");
		}
		var ctx = this.canvasContext;

		if (ctx) {
			this.onload  = null; // to prevent an infinite loop
			ctx.drawImage(this, 0, 0);
			var imgd = ctx.getImageData(0, 0, this._layer.options.tileSize, this._layer.options.tileSize);
			var pix = imgd.data;
			for (var i = 0, n = pix.length; i < n; i += 4) {
				pix[i] = pix[i + 1] = pix[i + 2] = (pix[i] + 3*pix[i + 1] + pix[i + 2]) / 8;
				pix[i] = 6 * (pix[i] - 128) + 128;
				pix[i + 1] = 6 * (pix[i + 1] - 128) + 128;
				pix[i + 2] = 6 * (pix[i + 2] - 128) + 128;
			}
			ctx.putImageData(imgd, 0, 0);
			this.removeAttribute("crossorigin");
			this.src = ctx.canvas.toDataURL();
		}

		L.TileLayer.prototype._tileOnLoad.call(this);
	}
});

L.tileLayer.grayscale = function (url, options) {
	return new L.TileLayer.Grayscale(url, options);
};
