# jquery.pithyUpload.js

> jQuery Ajax File uploader with progress bar, and Compatible with IE browser of lower version via iframe.
Demo page: [www.ashin.space/pithyUpload](http://www.ashin.space/pithyUpload)

I have recently been in a project using javascript asynchronous file uploader. However, plugins searched in internet are neithor compatible with IE nor convenient in use. Moreover, these plugins are dependent on HTML/CSS settings excessively that logic and views are mixed. Therefore, I write this plugin which is neat(only 3KB) and compatible(support down to IE8).

## Basic use

### HTML

```html
<script src="http://cdn.bootcss.com/jquery/1.11.2/jquery.min.js"></script>
<script type="text/javascript" src="jquery.pithyUpload.js"></script>
...
<input type="file" name="pithyUpload" id="pithyUpload" multiple="multiple">
```

### javascript

```javascript
$(function() {
	$('#pithyUpload').pithyUpload({
		trigger: 'change', 
		dataType: 'text', 
		allowedTypes: ["gif", "jpeg", "jpg", "bmp", "png"],
		maxFiles: 8,
		maxFileSize: 10 * 1024 * 1024,
		extData: {
			userid: 'gaoxin',
			userpwd: '19931030'
		},
		onNewFile: function(file) {
			console.log('new file:', file.name || file);
		},
		onComplete: function(data) {
			if (data)
				console.log('ie complete', data);
			else
				console.log('complete');
		},
		onUploadProgress: function(file, percent) {
			console.log(file.name, percent);
		},
		onUploadSuccess: function(file, data, status, xhr) {
			console.log(file.name, 'success - ', data);
		},
		onUploadError: function(file, xhr, status, err) {
			console.log(file.name, 'error - ', status);
		},
		onFileTypeError: function(file) {
			console.log('file type error', file);
		},
		onFileSizeError: function(file) {
			console.log('file size error', file);
		},
		onFilesMaxError: function(file) {
			console.log('files max error', file);
		}
	})
});
```

## Settings

### Default settings

```javascript
{
	//properties
	url: document.URL,//ajax url
	method: 'POST',//ajax type
	extData: {},//extra data
	maxFileSize: null,//null or number
	maxFiles: null,//null or number
	allowedTypes: null,//null or array(eg. ['jpg', 'doc'])
	dataType: 'json',//ajax dataType
	fileName: 'pithyUpload',//input[name=fileName]
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
}
```

### Note
if under IE10, only onComplete and on onNewfile will be called

#### trigger
if trigger is 'change', onChange() event will be binded and the usage is like the demo.html;

if trigger is null, no event will be binded, then the usage should be:
```javascript
$(function(){
	$('#pithyUpload').change(function(){
		$(this).pithyUpload({ /* ... */ });
	});
	//or 
	$('#submitButton').click(function(){
		$('#pithyUpload').pithyUpload({ /* ... */ });
	});
});
``` 
so trigger events and input elements are separated.

#### extData
The extra data to be submited. Every key in extData will be translated to "key=extData\[key\]" or < input type="hidden" name="key" value="extData\[key\]" >.

#### onNewFile(file, opts)
Fires before every file uploading
- this - refers to input document object (other callbacks are the same)
- file {javascript file object} - refers to the file to be submit
- opts {pithyUpload user settings} - you can modify opts.fileName and opts.extData before uploading

*if under IE10,  'file' refers to the file name(string) and no 'opts' are passed*

#### onComplete()
Fires when all file are uploaded either successly or abortively

*if under IE10, data will be passed as arguments which refers to the data returned by server*

#### onUploadProgress(file, percent)
Fires if the browser support onProgress() event, which is the API of progress bar
- percent {number} - the percentage of uploaded data

####	onUploadSuccess(file, data, textStatus, xhr)
Fires when every single file is uploaded
- data {ajax data} - data returned by server
- textStatus {ajax textStatus} - request status
- xhr {ajax XMLHttpRequest} - jQuery ajax object

####	onUploadError(file, xhr, textStatus, errorThrown)
Fires when every single file is uploaded abortively
- errorThrown {javascript error object}

####	onFileTypeError(file)
Fires when file type error

####	onFileSizeError(file)
Fires when file size is greater than maxFileSize

####	onFilesMaxError(files)
Fires when the number of files is greater than maxFiles
