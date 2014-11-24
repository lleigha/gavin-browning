Y.use('node', 'event-mouseenter', 'squarespace-util', function(Y) {

	Y.on('domready', function() {

		// Declar vars
		var body = Y.one('body'),
				isProducts = Y.one('.collection-type-products'),
				isIndex = Y.one('.collection-type-index'),
				isGallery = Y.one('.collection-type-gallery'),
				isList = Y.one('.view-list'),
				canvas = Y.one('#canvas'),
				main = Y.one('#main'),
				flowItems = Y.one('#flowItems'),
				flowItemFirst = Y.one('.flow-item'),
				flowItemsGreater = false,
				flowContent = Y.one('#flowContent'),
				flowScrollPrompt = Y.one('#flowScrollPrompt'),
				flowBody = Y.one('#flowBody'),
				indexList = Y.one('#indexList'),
				indexColumnWidth = parseInt(Y.Squarespace.Template.getTweakValue('indexColumnWidth'),10),
				indexGutter = parseInt(Y.Squarespace.Template.getTweakValue('indexGutter'),10),
				galleryMargin = parseInt(Y.Squarespace.Template.getTweakValue('galleryMargin'),10),
				productList = Y.one('#productList'),
				productColumnWidth = parseInt(Y.Squarespace.Template.getTweakValue('productColumnWidth'),10),
				productGutter = parseInt(Y.Squarespace.Template.getTweakValue('productGutter'),10),
				productMargin = parseInt(Y.Squarespace.Template.getTweakValue('productMargin'),10),
				windowX, windowY,
				navOpen = Y.one('#navOpen'),
				navClose = Y.one('#navClose'),
				navOpened = false,
				masonry;

		// Add ie10 class
		if (Function('/*@cc_on return document.documentMode===10@*/')()){
			document.documentElement.className+=' ie10';
		}

		getWindowSize();

		emptyNav();
		lowerHeaderBottom();
		toggleFolder();


		if(isProducts){
			// Remove active link from parent products collection when category link is active
			if(Y.one('.products-child .active-link')){
				Y.all('.products-child .active-link').each(function(link){
					link.ancestor('.products-collection').removeClass('active-link');
				});
			}

			// Cache query string in url, so clicking back link in item view takes you back to category
			var location = Y.config.win.location;
			if(isList){
				Y.all('.masonry-link').each(function(link){
					link.setAttribute('href',link.getAttribute('href') + location.search);
				});
			}else{
				var flowBack = Y.one('.flow-back');
				flowBack.setAttribute('href',flowBack.getAttribute('href') + location.search);
				if(location.search.length > 0){
					flowBack.setHTML(decodeURI(location.search.substr(location.search.indexOf('=') + 1)));
				}
			}
		}

		// Gallery show item info
		if(Y.one('.flow-item-info')){
			flowItems.delegate('click',function(e){
				e.preventDefault();

				var flowItem = this.ancestor('.flow-item');
				flowItem.toggleClass('active');
				flowItem.siblings().removeClass('active');
			},'.flow-item.has-info .button-expand');
		}

		// Products show body
		if(flowBody){
			flowBodyOpen = Y.one('#flowBodyOpen');
			flowBodyClose = Y.one('#flowBodyClose');

			flowBodyOpen.on('click',function(e){
				e.preventDefault();
				body.addClass('flow-body-active');
			});
			flowBodyClose.on('click',function(e){
				e.preventDefault();
				if(Y.one('.flow-body-active')){
					body.removeClass('flow-body-active');
				}
			});
		}

		setFlowStyles();
		setFlowPosition();
		flowItemsMiddle();

		if((isProducts || isIndex) && isList && Y.one('.masonry-item')){
			if(Y.one('.product-aspect-ratio-auto') && isProducts){
				Y.all('.masonry-thumbnail .intrinsic').removeClass('content-fill');
			}else if(Y.one('.index-aspect-ratio-auto') && isIndex){
				Y.all('.masonry-thumbnail .intrinsic').removeClass('content-fill');
			}
			masonry = new Y.Squarespace.Gallery2({
				container: Y.one('.masonry-container'),
				element: Y.all('.masonry-item'),
				design: 'autocolumns',
				designOptions: {
					columnWidth: productColumnWidth,	// column width (minimum width or maximum width depending on culumnWidthBehavior setting). Needs to be a number.
					columnWidthBehavior: 'min',			// column width style (min or max).
					gutter: productGutter,				// sets equal spacing around images. Inherent units are 'px'
					aspectRatio: false,					// explicitly sets items to a fixed aspect ratio (Width/Height)
					mixedContent: true					// useful when non-image content, when only images, no dom access is required because the initializer reads the image data attributes to calculate the height of each item (when non-image, the script needs to get the height of the items)
				},
				loaderOptions: { load: false },
				lazyLoad: false,
				refreshOnResize: true
			});

			masonryResetMode();

			if(isIndex){
				masonry.set('columnWidth',indexColumnWidth);
				masonry.set('gutter',indexGutter);
			}
		}

		masonryMobile();
		masonryCatalog();

		if(masonry){
			masonry.refresh();
		}

		// Mobile Nav
		navOpen.on('click',function(e){
			e.preventDefault();
			e.halt();

			if(navOpened){
				closeNav();
			}else{
				openNav();
			}
		});
		navClose.on('click',function(e){
			e.preventDefault();
			e.halt();
			if(navOpened){
				closeNav();
			}
		});
		Y.one('#canvasOverlay').on('click',function(e){
			e.preventDefault();
			e.halt();
			if(navOpened){
				closeNav();
			}
		});

		// Add margin-top when announcement bar is present
		var fixNavMargin = function() {
			var mobileNav = Y.one('#under');
		  if(Y.one('.sqs-announcement-bar') && mobileNav) {
		    mobileNav.setStyles({
		      marginTop: Y.one('.sqs-announcement-bar').get('offsetHeight')
		    });

		    // Undo the margin-top when the announcement bar is closed
		    var clickAnnounceBarClose = Y.one(".sqs-announcement-bar-close");
				clickAnnounceBarClose.on("click", function(e) {
					mobileNav.setStyles({
						marginTop: 0
					});
				});
		  }
		}
		fixNavMargin();
		Y.on('windowresize', fixNavMargin);

		// Rmeove loading classes
		if(Y.one('.products-collection')){
			Y.all('.products-collection').removeClass('loading');
		}
		if(isProducts && Y.one('.view-item')){
			Y.one('.flow-back').removeClass('loading');
		}
		if(productList){
			productList.removeClass('loading');
		}
		if(indexList){
			indexList.removeClass('loading');
		}
		if(flowContent){
			flowContent.removeClass('loading');
		}
		Y.one('#header .lower-header').removeClass('loading');
		Y.one('#header > .wrapper').removeClass('loading');


		Y.on('windowresize',function(){
			getWindowSize();

			if(navOpened){
				body.removeClass('nav-opened');
				navOpened = false;
			}

			lowerHeaderBottom();

			setFlowStyles();
			setFlowPosition();
			flowItemsMiddle();

			masonryMobile();
			masonryCatalog();

			if(masonry){
				masonry.refresh();
			}

			debounce(loadAllImages);
		});


		// Tweak stuff
		Y.Global.on('tweak:beforeopen', function (f) {
			if(navOpened){
				body.removeClass('nav-opened');
				navOpened = false;
			}

			setTimeout(function(){
				if(masonry){
					masonry.refresh();
				}
				setFlowStyles();
				setFlowPosition();
			},450);
			setTimeout(loadAllImages,500);
		});

		Y.Global.on('tweak:change', function (f) {
			masonryTweaks();
			setTimeout(function(){
				masonryCatalog();
				if(masonry){
					masonry.refresh();
				}
			},500);
			masonryResetMode();
			setFlowStyles();
			setFlowPosition();
			flowItemsMiddle();
			if(flowItems){
				loadAllImages(flowItems);
			}
		});
		Y.Global.on('tweak:reset', function (f) {
			masonryTweaks();
			setTimeout(function(){
				masonryCatalog();
				masonryMobile();
				if(masonry){
					masonry.refresh();
				}
			},500);
			masonryResetMode();
			setFlowStyles();
			setFlowPosition();
			flowItemsMiddle();
		});
		Y.Global.on('tweak:close', function (f) {
			setTimeout(function(){
				toggleFolder();
				masonryCatalog();
				masonryMobile();
				if(masonry){
					masonry.refresh();
				}
				setFlowStyles();
				setFlowPosition();
				flowItemsMiddle();
			},450);
			setTimeout(loadAllImages,500);
		});

		// Image Load function
		function debounce (callback) {
			var timeout;
			if (timeout) {
				timeout.cancel();
			}
			timeout = Y.later(100, this, callback);
		}
		function loadAllImages(wrapper){
			wrapper = wrapper || Y.one('body');

			// Load all ImageLoader images in the wrapper
			wrapper.all( 'img[data-src]' ).each( function( img ) {
				ImageLoader.load(img);
			});
		}
		function openNav(){
			body.addClass('nav-opened');
			// Y.one('#header').setStyle('top',window.scrollY);
			// Y.one('#navOpen').setStyle('top',window.scrollY);
			navOpened = true;
		}
		function closeNav(){
			// setTimeout(function(){
			// 	Y.one('#header').setStyle('top',0);
			// 	Y.one('#navOpen').setStyle('top',0);
			// },200);
			body.removeClass('nav-opened');
			navOpened = false;
		}
		function toggleFolder(){
			Y.all('.folder-links-collapsible .folder-collection > a').each(function(link){
				var folder = link.get('parentNode');
				link.on('click',function(e){
					e.preventDefault();
					if(folder.hasClass('folder-closed')){
						folder.addClass('folder-opened');
						folder.removeClass('folder-closed');
					}else if(folder.hasClass('folder-opened')){
						folder.removeClass('folder-opened');
						folder.addClass('folder-closed');
					}else if(folder.hasClass('active-folder')){
						folder.addClass('folder-closed');
					}else{
						folder.addClass('folder-opened');
					}

					lowerHeaderBottom();
				});
			});
		}
		function getWindowSize(){
			// Set window size variables
			windowX = body.get('winWidth');
			windowY = body.get('winHeight');
		}
		function lowerHeaderBottom(){
			if(Y.one('#canvas .lower-header.bottom')){
				Y.one('#canvas .lower-header').removeClass('bottom');
			}
			Y.one('#header > .wrapper').removeClass('middle');
			if(windowY > Y.one('#header > .wrapper').get('offsetHeight')){
				if(Y.one('#canvas .lower-header')){
					Y.one('#canvas .lower-header').addClass('bottom');
				}
				Y.one('#header > .wrapper').addClass('middle');
			}else{
				Y.one('#canvas .lower-header').removeClass('bottom');
				Y.one('#header > .wrapper').removeClass('middle');
			}
		}
		function emptyNav(){
			if(!Y.one('.navigation li') && !Y.one('.navigation-secondary li')){
				navOpen.addClass('empty');
			}
		}
		function masonryTweaks(){
			// Sets column and gutter width in masonry to tweak values
			if(masonry){
				var tweakPrefix;
				if(isProducts){
					tweakPrefix = 'product';
				}else{
					tweakPrefix = 'index';
				}

				columnWidth = parseInt(Y.Squarespace.Template.getTweakValue(tweakPrefix+'ColumnWidth'),10);
				gutter = parseInt(Y.Squarespace.Template.getTweakValue(tweakPrefix+'Gutter'),10);
				
				if(Y.one('.product-aspect-ratio-auto') && isProducts){
					Y.all('.masonry-thumbnail .intrinsic').removeClass('content-fill');
				}else if(Y.one('.index-aspect-ratio-auto') && isIndex){
					Y.all('.masonry-thumbnail .intrinsic').removeClass('content-fill');
				}else{
					Y.all('.masonry-thumbnail .intrinsic').addClass('content-fill');
				}

				masonry.set('columnWidth',columnWidth);
				masonry.set('gutter',gutter);

				masonry.getImages().each(function(img) {
					img.loader.set('mode', 'fill');
				});

				if(isProducts){
					productColumnWidth = columnWidth;
					productGutter = gutter;
				}else{
					indexColumnWidth = columnWidth;
					indexGutter = gutter;
				}
			}
		}
		function masonryMobile(){
			if(masonry){
				if(isProducts){
					if(productGutter < 10){
						masonry.set('gutter',productGutter);
					}else if(productGutter < 25){
						if(windowX < 640){
							masonry.set('gutter',10);
						}else if(windowX < 1024){
							masonry.set('gutter',productGutter);
						}else{
							masonry.set('gutter',productGutter);
						}
					}else{
						if(windowX < 640){
							masonry.set('gutter',10);
						}else if(windowX < 1024){
							masonry.set('gutter',25);
						}else{
							masonry.set('gutter',productGutter);
						}
					}
				}else if(isIndex){
					if(indexGutter < 10){
						masonry.set('gutter',indexGutter);
					}else if(indexGutter < 25){
						if(windowX < 640){
							masonry.set('gutter',10);
						}else if(windowX < 1024){
							masonry.set('gutter',indexGutter);
						}else{
							masonry.set('gutter',indexGutter);
						}
					}else{
						if(windowX < 640){
							masonry.set('gutter',10);
						}else if(windowX < 1024){
							masonry.set('gutter',25);
						}else{
							masonry.set('gutter',indexGutter);
						}
					}
				}
			}
		}
		function masonryCatalog(){
			if(isIndex){
				if(windowX >= 640 && Y.one('.index-list-title-style-under') && !Y.one('.index-aspect-ratio-auto')){
					clearHeights();
					setHeights();
				}else{
					clearHeights();
				}
			}else if(isProducts && isList){
				if(windowX >= 640 && Y.one('.product-list-style-catalog') && !Y.one('.product-aspect-ratio-auto')){
					clearHeights();
					setHeights();
				}else{
					clearHeights();
				}
			}
			function setHeights(){
				var masonryOverlayMax = 0;

				Y.all('.masonry-content').each(function(e){
					if(e.height() > masonryOverlayMax){
						masonryOverlayMax = e.height();
					}
				});
				Y.all('.masonry-content').each(function(e){
					e.setStyle('height',masonryOverlayMax);
				});
			}
			function clearHeights(){
				Y.all('.masonry-content').each(function(e){
					e.setAttribute('style','');
				});
			}
		}
		function masonryResetMode(){
			if(masonry){
				masonry.getImages().each(function(img) {
					img.loader.set('mode', 'fill');
				});
			}
		}
		function setFlowStyles(){
			getWindowSize();

			if(flowItems && flowItemFirst){
				body.removeClass('flow-items-fill');
				flowItemFirst.removeClass('content-fill');
				if(Y.one('.flow-item > img')){
					Y.one('.flow-item > img').setAttribute('style','');
				}

				if(windowX >= 640){
					if(flowItemFirst && flowItemFirst.siblings('.flow-item').size() < 1){
						if(isGallery && Y.one('.gallery-single-image-fill')){
							body.addClass('flow-items-fill');
							flowItemFirst.addClass('content-fill');
						}
						if(isProducts && Y.one('.product-item-single-image-fill')){
							body.addClass('flow-items-fill');
							flowItemFirst.addClass('content-fill');
						}

						loadAllImages(flowItemFirst);
					}
					if(windowX < 1024){
						if(flowItemFirst && flowItemFirst.siblings('.flow-item').size() >= 1){
							if(isGallery && galleryMargin < 1){
								Y.all('.flow-item').setStyle('margin-left','0');
							}else{
								Y.all('.flow-item').setAttribute('style','');
							}
							if(isProducts && !isList && productMargin < 1){
								Y.all('.flow-item').setStyle('margin-left','0');
							}else{
								Y.all('.flow-item').setAttribute('style','');
							}
						}
					}
				}
			}
		}
		function setFlowPosition(){
			getWindowSize();

			if(flowItems && flowItemFirst){
				body.removeClass('force-vertical-alignment-top');
				flowContent.setAttribute('style','');
				flowItems.setAttribute('style','');

				predictFlowHeight();

				if(windowX >= 640){
					if(flowContent.height() > windowY){
						body.addClass('force-vertical-alignment-top');
						if(!flowItemsGreater){
							flowItems.setStyle('position','fixed');
						}
					}else if(flowItemsGreater){
						if(flowContent.height() <= windowY){
							flowContent.setStyle('position','fixed');
						}
					}
				}
			}
		}
		function flowItemsMiddle(){
			if(flowItems && flowItemFirst){
				predictFlowHeight();
				if(Y.one('.site-vertical-alignment-middle') && windowX >= 1024){
					if((isGallery && !Y.one('.gallery-single-image-fill')) || (isProducts && !Y.one('product-item-single-image-fill'))){
						if(flowItemsGreater){
							flowItems.removeClass('middle');
						}else{
							flowItems.addClass('middle');
						}
					}
				}else{
					flowItems.removeClass('middle');
				}
			}
		}
		function predictFlowHeight(){
			if(flowItems && flowItemFirst){
				var flowItemsHeightPredicted = 0;
				var flowImages = Y.all('.flow-item img');

				for(var i=0;i<flowImages.size() && flowItemsHeightPredicted <= windowY;i++){
					var currentImage = flowImages.item(i);
					var currentImageDim = currentImage.getAttribute('data-image-dimensions');
					var currentImageAspect = currentImageDim.split('x')[1] / currentImageDim.split('x')[0];

					flowItemsHeightPredicted = flowItemsHeightPredicted + currentImageAspect * flowItemFirst.width();

					if(flowItemsHeightPredicted > windowY){
						flowItemsGreater = true;
					}else{
						flowItemsGreater = false;
					}
				}
			}
		}
	});
});