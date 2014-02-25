/* ------------------------------------------------------------------------------ */
/* App - utils */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){
	
	//create empty App obj if none found
	var App = app || {};

	/* ------------------------------------------------------------------------------ */
	/* utils - logger */
	window.Logger = function() {
		var oldConsoleLog = null,
			pub = {};
		pub.enableLogger = function enableLogger() {
			if(oldConsoleLog == null) return;
			window['console']['log'] = oldConsoleLog;
		};
		pub.disableLogger = function disableLogger() {
			oldConsoleLog = console.log;
			window['console']['log'] = function() {};
		};
		return pub;
	}();
	
	/* ------------------------------------------------------------------------------ */
	/* utils - Platform */
	window.Platform = new function(){
		//detecting functions
		function checkPlatform(os) { return (navigator.userAgent.toLowerCase().indexOf(os.toLowerCase())>=0); }
		function checkEvent(e) { return (e in document.documentElement); }
		function IsGCFInstalled() {
			try {
				var i = new ActiveXObject('ChromeTab.ChromeFrame');
				if (i) { return true; }
			} catch(e) {
				//console.log('ChromeFrame not available, error:', e.message);
			}
			return false;
		}
		//add properties
		this.ie = checkPlatform('msie');
		this.gcf = IsGCFInstalled();
		this.iPhone = checkPlatform('iPhone');
		this.iPad = checkPlatform('iPad');
		this.iPod = checkPlatform('iPod');
		this.iOS = this.iPhone||this.iPad||this.iPod;
		this.android = checkPlatform('android');
		this.touchOS = checkEvent('ontouchstart');
		this.debugLog = function(){
			console.log('iPhone: '+this.iPhone);
			console.log('iPad: '+this.iPad);
			console.log('iPod: '+this.iPod);
			console.log('iOS: '+this.iOS);
			console.log('android: '+this.android);
			console.log('touchOS: '+this.touchOS);
		}
		//return self
		return this;
	}
	
	/* ------------------------------------------------------------------------------ */
	/* utils - alert */
	if ( !window.Platform.iOS && !window.Platform.android ) {
		window.alert = function(msg){ console.log('window.alert: '+msg); }
	}
	
	/* ------------------------------------------------------------------------------ */
	/* utils */
	App.utils = {
				
		/* ------------------------------------------------------------------------------ */
		/*addDeviceClass*/
		addDeviceClass:	function() {
			var p = Platform;
				$html = $('html:eq(0)');
			if ( p.touchOS ) {
				$html.addClass('touch');
				if (p.iOS) {
					$html.addClass('ios');
					if (p.iPhone) {	$html.addClass('iphone'); }
					else if (p.iPod) {	$html.addClass('ipod'); }
					else if (p.iPad) {	$html.addClass('ipad'); }
				} 
				else if (p.android) {
					$html.addClass('android');
				}
			} else {
				$html.addClass('no-touch');	
			}
			$html.removeClass('no-js').addClass('js');
		},

		/* ------------------------------------------------------------------------------ */
		/*getDateTime*/		
		getDateTime: function() {
			
			//vars
			var dateObj = new Date(), //get Date from system
				dateTime = {}; //data container
			
			//update dateTime data
			(function updateDateTime() {
				dateTime.d = dateObj.getDay();
				dateTime.dd = dateObj.getDate();
				dateTime.hh = dateObj.getHours();
				dateTime.mm = dateObj.getMinutes();
				dateTime.am = ( dateTime.hh >= 12 ) ? false : true;
				dateTime.pm = !dateTime.am;
				dateTime.ah = ( (dateTime.hh >= 0 && dateTime.hh < 9) || (dateTime.hh >= 18 && dateTime.hh <= 24) || dateTime.d == 0 || dateTime.d == 6 ) ? true : false;
			})();

			//return result	
			return dateTime;	
			
		},		
		
		/* ------------------------------------------------------------------------------ */
		/*popmsg*/	
		popmsg: function(showSwitch, customOpts, dismiss){
			
			//vars
			var opts,
				defaultOpts = 						//default jqm loader opts for reset
				{
					theme:			'a',			//skin swatch
					text:			'loading',		//string: msg
					textVisible: 	false,			//boolean: show/hide spinner
					textonly:		false,			//boolean: show/hide text msg
					html:			''				//String: replace all content
				};
			
			//update params
			if (showSwitch != 'show' ) {
				showSwitch = 'hide';
				opts = defaultOpts;
			} else {
				opts = customOpts;
			}
			
			//call jqm loader
			$.mobile.loading( showSwitch, opts );
			
			//attach dismiss behavior
			if (dismiss) {
				$('.ui-loader').one('click', function(){
					$.mobile.loading( 'hide' );	
				});
			}
			
		},
		
		/* ------------------------------------------------------------------------------ */
		/*getPrevPageID*/
		getPrevPageID: function(data){
			if ( data.prevPage.length ) {
				return data.prevPage.attr('id');
			} else {
				return false;	
			}
		},
		
		/* ------------------------------------------------------------------------------ */
		/*getGeolocation*/
		getGeolocation: function(custom){
			
			//vars
			var //default geo settings
				defaultOpts = { 
					enableHighAccuracy: true,
					timeout:			20000,
					maximumAge: 		60000 
				},
				defaultOnSuccess = function(position) { 
					console.log('using geolocation');
					console.log('Latitude: '       	  + position.coords.latitude          + '\n' +
								'Longitude: '         + position.coords.longitude         + '\n' +
								'Altitude: '          + position.coords.altitude          + '\n' +
								'Accuracy: '          + position.coords.accuracy          + '\n' +
								'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
								'Heading: '           + position.coords.heading           + '\n' +
								'Speed: '             + position.coords.speed             + '\n' +
								'Timestamp: '         + new Date(position.timestamp)      + '\n');
					
					//populate location data
					App.data.static.location.lat = position.coords.latitude;
					App.data.static.location.lng = position.coords.longitude;
					App.data.static.location.Timestamp = new Date(position.timestamp);
					
					//update location info from geo info
					App.utils.getLocationInfo();
				},
				defaultOnError = function(error) {
					console.log('no geolocation');
					console.log('code: '    + error.code    + '\n' +
								'message: ' + error.message + '\n');
					
					//update to default location data
					App.data.static.location.lat = App.data.static.defaultLocation.lat;
					App.data.static.location.lng = App.data.static.defaultLocation.lng;
					App.data.static.location.Timestamp = false;
				},
				
				//update custom geo settings
				opts = (custom && custom.opts) ? $.extend( defaultOpts, custom.opts ) : defaultOpts,
				onSuccess = (custom && typeof(custom.onSuccess) === 'function') ? custom.onSuccess : defaultOnSuccess,
				onError = (custom && typeof(custom.onError) === 'function') ? custom.onError : defaultOnError;
			
			//start geolocation
			if( navigator.geolocation ) {
				navigator.geolocation.getCurrentPosition( onSuccess, onError, opts );
			}
			
		},
		
		/* ------------------------------------------------------------------------------ */
		/*getLocationInfo*/
		getLocationInfo: function(){
			
			//exit if no valid location in data
			if ( App.data.static.location.lat == 0 || App.data.static.location.lng == 0 ) return false;
			
			//vars
			var thisObj = this,
				request,
				url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=';
				
			//completing request url for google
			url += App.data.static.location.lat; //-37.80281668787015
			url += ',';
			url += App.data.static.location.lng; //144.95926133828488
			url += '&sensor=true';
						
			//abort if in request already
			if (this.inRequest) return false;
			
			//otherwise set in request status and show loader
			this.inRequest = true;
			App.utils.popmsg( 'show', {} );
			
			//make request call			
			request = $.ajax({
				url:		url,
				dataType:	'json',
				cache:		false,
				success:	function(data, textStatus, jqXHR) {  
								//alert('getLocationInfo: success');
								console.log('getLocationInfo: success');
								//console.log(data);
								
								//update location info
								App.data.static.location.address = data.results[0].formatted_address;
								App.data.static.location.postcode = data.results[0].address_components[5].short_name;
								//alert( 'You are in: ' + App.data.static.location.postcode );
								console.log( 'You are in: ' + App.data.static.location.postcode );			
							},
				complete:	function(jqXHR, textStatus) { 
								//alert('getLocationInfo: complete');
								console.log('getLocationInfo: complete');
								thisObj.inRequest = false;
								//hide loader
								App.utils.popmsg();
							},
				error:		function(jqXHR, textStatus, errorThrown) { 
								//alert('getLocationInfo: error', textStatus, errorThrown);
								console.log('getLocationInfo: error', textStatus, errorThrown);
								
								//update to default location info
								App.data.static.location.address = App.data.static.defaultLocation.address;
								App.data.static.location.postCode = App.data.static.defaultLocation.postCode;
								App.data.static.location.lat = App.data.static.defaultLocation.lat;
								App.data.static.location.lng = App.data.static.defaultLocation.lng;
								App.data.static.location.Timestamp = false;
								//alert( 'Default: ' + App.data.static.location.postcode );
							}
			});
			
		},
		
		/* ------------------------------------------------------------------------------ */
		/*addContact*/		
		addContact: function(dataObj) {
			
			//exit if no API
			if ( !navigator.contacts ) return false;
						
			//vars
			var contact = navigator.contacts.create( dataObj ),
				onSuccess = function(contact) {
					//alert('New contact is saved!');
					console.log('New contact is saved!');
				},
				onError = function(contactError) {
					//alert('Error saving contact: ' + contactError.code);
					console.log('Error saving new contact: ' + contactError.code);
				}
			
			//save contact
			contact.save(onSuccess, onError);
			
		},
		
		/* ------------------------------------------------------------------------------ */
		/*checkConnection*/
		checkConnection: function() {
			
			//exit if no API
			if ( !navigator.network || !navigator.network.connection ) return false;
			
			//vars
			var networkState = navigator.network.connection.type;
			
			//return state
			return networkState;
			
		},
		
		/* ------------------------------------------------------------------------------ */
		/*reloadApp*/
		reloadApp: function() {
			
			//update to main app file address without page id
			window.location = String(window.location).substr(0, String(window.location).indexOf('#'));	
		
		},
		
		/* ------------------------------------------------------------------------------ */
		/*init*/
		init: function() {
			
			//alert('app.utils.init()');
			
			//attach devices class to html
			this.addDeviceClass();
			
		}
		
	};
	
	return App;
	
})(window.App);