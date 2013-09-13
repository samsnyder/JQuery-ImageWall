(function($){

	$.fn.imageWall = function(config){

		this.create = function (){

			this.addClass('imageWall');

			this.html("<div id='imagesWrap' style='width:100%;height:100%;overflow:hidden;position:absolute;top:0px;left:0px'><div id='imageScrollWrap' style='position:relative;top:-" + settings.rowHeight + "px;left:0px;transition:" + (settings.rowHeight/settings.scrollSpeed) + "ms top linear'></div></div>");
			this.append("<div id='imageCover' style='background:rgba(0,0,0,0.5);width:100%;height:100%;position:absolute;top:0px;left:0px;box-shadow:inset 0px 0px 250px black;'></div>");

			var imagesWrap = this.find('#imageScrollWrap');

			var rowNum = Math.ceil(this.height()/settings.rowHeight) + 2;

			for(var i=0;i<rowNum;i++){
				this.createRow(imagesWrap, true);
			}
		}

		this.createRow = function(imageWrapObj, isAfter){
			var html = "<div class='imageRow' style='height:" + (settings.rowHeight) + "px;'><div class='imageRowImageWrap' style='width:120%;'></div></div>";
			if(isAfter){
				imageWrapObj.append(html);
				var imageNum = this.populateRow(imageWrapObj.find('.imageRow').last());
				imageWrapObj.find('.imageRow').last().attr('imageNum', imageNum);
				return imageNum;
			}else{
				imageWrapObj.html(html + imageWrapObj.html());
				var imageNum = this.populateRow(imageWrapObj.find('.imageRow').first());
				imageWrapObj.find('.imageRow').first().attr('imageNum', imageNum);
				return imageNum;
			}
		}

		this.populateRow = function(rowObj){
			var that = this;
			var imageRowImageWrap = rowObj.find('.imageRowImageWrap').first();
			if(!settings.imageGrid){
				imageRowImageWrap.css({
					position: 'relative',
					left: '-' + (Math.random() * (0.07 * rowObj.width())) + 'px'
				});				
			}
			var totalImageWidth = 0;
			var picNum = 0;
			//var picIndex = pathOffset;
			while(totalImageWidth < (rowObj.width()*1.1)){
				var picIndex = randInt(0, settings.imagePaths.length-1);
				//var imageWidth = (Math.random()*(0.8*settings.rowHeight)) + settings.rowHeight - (0.4*settings.rowHeight);
				var imageWidth = randInt((settings.averageImageWidth*(1-(settings.imageWidthDeviation/2))), (settings.averageImageWidth*(1+(settings.imageWidthDeviation/2))));
				if(settings.imageGrid){imageWidth = settings.rowHeight;}
				imageRowImageWrap.append("<div class='singleImageHolder' style='position:relative;height:" + settings.rowHeight + "px;width:" + imageWidth + "px;text-align:center;display:inline-block;overflow:hidden;transition:" + settings.animDur + "ms opacity ease'>" + htmlTemplates.image.replace('#src', imagePaths[picIndex]) + "</div>");
				imageRowImageWrap.find('.image').last().load(function(){
					that.positionImage(this);
					$(this).css('opacity', '1');
				});
				totalImageWidth = totalImageWidth + imageWidth;
				picNum++;
			}
			return picNum;
		}

		this.positionImage = function(obj){
			var parentWidth = $(obj).parent().width();
			var parentHeight = settings.rowHeight;
			var imageWidth = $(obj).width();
			var imageHeight = $(obj).height();
			var newImageWidth = 0;
			var newImageHeight = 0;
			var scaleFactor = imageWidth / imageHeight;
			if(imageWidth < ((parentHeight - parentWidth) + imageHeight)){
				//Portrait
				newImageWidth = parentWidth;
				newImageHeight = newImageWidth / scaleFactor;
			}else{
				//Landscape
				newImageHeight = parentHeight;
				newImageWidth = newImageHeight * scaleFactor;
			}
			var newImageLeft = (newImageWidth - parentWidth) / 2;
			var newImageTop = (newImageHeight - parentHeight) / 2;
			$(obj).css({
				position: 'absolute',
				width: newImageWidth + 'px',
				height: newImageHeight + 'px',
				left: '-' + newImageLeft + 'px',
				top: '-' + newImageTop + 'px'
			})
		}

		this.animateScroll = function(){
			var that = this;
			var scrollWrap = this.find('#imageScrollWrap');
			scrollWrap.css('top', '0px');
			globalVariables.animateTimeout = setTimeout(function(){
				that.find('.imageRow').last().remove();
				that.createRow(scrollWrap, false);
				scrollWrap.css('transition', 'none');
				scrollWrap.css('top', '-' + settings.rowHeight + 'px');
				scrollWrap.height();
				scrollWrap.css('transition', (settings.rowHeight/settings.scrollSpeed) + 'ms top linear');
				//alert('transition:' + (settings.rowHeight/settings.scrollSpeed) + 'ms top linear');
				that.animateScroll();
			}, (settings.rowHeight/settings.scrollSpeed));
		}

		this.changeImage = function(prevRow, prevColumn, newImagePath, doAnimate){
			var that = this;
			var imgObj = this.find('#imagesWrap').find('.imageRow:eq(' + prevRow + ')').find('.singleImageHolder:eq(' + prevColumn + ')');
			imgObj.append(htmlTemplates.image.replace('#src', newImagePath));
			imgObj.find('.image').last().load(function(){
				that.positionImage(this);
				$(this).css('opacity', '1');
			});
			setTimeout(function(){
				imgObj.find('.image').first().remove();
			}, settings.animDur);
		}

		this.changeThread = function(){
			var that = this;
			return setTimeout(function(){
				var rowNum = randInt(0, $('.imageRow').length-1);
				that.changeImage(rowNum, randInt(0, parseInt($('.imageRow:eq(' + rowNum + ')').attr('imageNum'))-1), settings.imagePaths[randInt(0, settings.imagePaths.length-1)], true);
				that.changeThread();
			}, randInt(settings.minChangeTime, settings.maxChangeTime));
		}

		var randInt = function(min, max){
			return Math.floor((Math.random() * (max - min + 1)) + min);
		}

		var settings = $.extend({
			imagePaths: [],
			rowHeight: 170,
			animDur: 800,
			maxChangeTime: 10000,
			minChangeTime: 1000,
			changeThreadNum: 5,
			imageGrid: true,
			averageImageWidth: 100,
			imageWidthDeviation: 0.8, //Percent
			anim: 'fade',
			scrollSpeed: 0.02
		}, config);

		var globalVariables = {
			changeThreads: [],
			animateTimeout: null
		}

		var htmlTemplates = {
			image: "<img class='image' style='display:block;opacity:0;transition:" + settings.animDur + "ms opacity ease' src='#src#'/>"
		}

		this.create();

		for(var i=0;i<settings.changeThreadNum;i++){
			globalVariables.changeThreads[i] = this.changeThread();
		}
		

		this.animateScroll();

		// setTimeout(function(){
		// 	clearTimeout(globalVariables.animateTimeout);
		// }, 5000);
	};

}(jQuery));