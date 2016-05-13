/**
 * jquery.pithyUpload.js - upload files with ajax or iframe
 * http://www.ashin.space
 * 
 * Copyright (c) 2016 Ashin Gau
 * author		: Ashin Gau
 * date			: 2016/05/11
 * version		: 1.0.1 
 * license		: GPLv3
 * 
 */

; (function ($) {
	$.fn.pithyUpload = function (opts) {
		var $self = this;
		//default settings
		opts = $.extend({
			//properties
			url: document.URL,
			method: 'POST',
			extData: {},//extra data
			maxFileSize: null,
			maxFiles: null,
			allowedTypes: null,//null or array(eg. ['jpg', 'doc'])
			dataType: 'json',//ajax dataType
			fileName: 'pithyUpload',
			trigger: null,//null or 'change'
			//callbacks - if IE, only onNewFile, onComplete
			onNewFile: function () { },
			onComplete: function () { },
			onUploadProgress: function () { },
			onUploadSuccess: function () { },
			onUploadError: function () { },
			onFileTypeError: function () { },
			onFileSizeError: function () { },
			onFilesMaxError: function () { }
		}, opts || {});
		var typeReg = null;
		if (opts.allowedTypes)
			typeReg = RegExp("\.(" + opts.allowedTypes.join("|") + ")$", "i");

		//upload every single file
		function upload_file() {
			if (this._pos >= this.files.length) {
				this._pos = 0;
				opts.onComplete.call(this);
				return;
			}

			//check file type an file size
			var typeTest = true,
				sizeTest = true;

			//check file type
			if (typeReg)
				if (!typeReg.test(this.files[this._pos].name)) {
					opts.onFileTypeError.call(this, this.files[this._pos]);
					this._pos++;
					typeTest = false;
					upload_file.call(this);
				}

			//check file size
			if (opts.maxFileSize)
				if (opts.maxFileSize < this.files[this._pos].size) {
					opts.onFileSizeError.call(this, this.files[this._pos]);
					this._pos++;
					sizeTest = false;
					upload_file.call(this);
				}

			//ajax submit
			if (typeTest && sizeTest) {
				var self = this,
					$self = $(this),
					file = self.files[self._pos],
					fd = new FormData();
				opts.onNewFile.call(self, file, opts);
				for (var key in opts.extData)
					fd.append(key, opts.extData[key]);
				fd.append(opts.fileName, file);

				$.ajax({
					url: opts.url,
					type: opts.method,
					dataType: opts.dataType,
					data: fd,
					cache: false,
					contentType: false,
					processData: false,
					forceSync: false,
					xhr: function () {
						var xhrobj = $.ajaxSettings.xhr();
						if (xhrobj.upload) {
							xhrobj.upload.addEventListener('progress', function (event) {
								var percent = 0;
								var position = event.loaded || event.position;
								var total = event.total || event.totalSize;
								if (event.lengthComputable) {
									percent = Math.ceil(position / total * 100);
								}
								opts.onUploadProgress.call(self, file, percent);
							}, false);
						}
						return xhrobj;
					},
					success: function (data, textStatus, xhr) {
						opts.onUploadSuccess.call(self, file, data, textStatus, xhr);
					},
					error: function (xhr, textStatus, errorThrown) {
						opts.onUploadError.call(self, file, xhr, textStatus, errorThrown);
					},
					complete: function (xhr, textStatus) {
						self._pos++;
						upload_file.call(self);
					}
				});
			}
		}

		function upload_files() {
			var self = this,
				$self = $(this);
			if (typeof FormData == 'undefined') {//IE
				var $iframe = $('<iframe style="position:absolute;top:-9999px;"/>')
					.attr('name', 'pithyUploadIframe'),
					$form = $('<form style="display:none;" method="post" enctype="multipart/form-data"></form>')
						.attr('name', 'pithyUploadForm')
						.attr("target", 'pithyUploadIframe')
						.attr('action', opts.url),
					$input = $('<input type="file"/>').attr('name', opts.fileName),
					$hidden = $('<input type="hidden"/>');
				$iframe._upload_read = false;
				$('body').append($iframe).append($form.append($input));
				for (var key in opts.extData)
					$form.append(
						$hidden.clone()
							.attr('name', key)
							.val(opts.extData[key])
					);
				$input.change(function () {
					opts.onNewFile.call(self, this.value);
					$form.submit();
					$iframe._upload_read = true;
				});
				$iframe.load(function () {
					if(!$iframe._upload_read)
						return;
					var contents = $(this).contents().get(0);
					console.log(contents);
					var data = $(contents).find('body').text();
					if ('json' == opts.dataType) {
						data = window.eval('(' + data + ')');
					}
					opts.onComplete(data);
					$iframe.remove();
					$form.remove();
				});
				$input.click();
			} else {
				if (opts.maxFiles)
					if (opts.maxFiles < this.files.length) {
						opts.onFilesMaxError.call(this, this.files);
						return;
					}
				self._pos = 0;
				upload_file.call(self);
			}
		};

		if (opts.trigger) {
			if (typeof FormData == 'undefined') {//IE
				return $self.click(function () {
					upload_files.call(this);
					return false;
				});
			}
			return $self.change(function () {
				upload_files.call(this);
			});
		} else {
			upload_files.call($self.get(0));
			return $self;
		}
	};
})(jQuery);

