/* ------------------------------------------------------------------------------ */
/* App */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){

	//create empty App obj if none found
	App = app || {};
	
	//app name
	App.name = 'GSCML';
	App.version = '1.0.0';
	App.lastUpdate = '2013-04';
	
	//function onDeviceReady
	App.onDeviceReady = function(e) {
		
		//alert('e:deviceready');
		console.log('e:deviceready');
		
	};
	
	//function onResume
	App.onResume = function(e) {
		
		//alert('e:resume');
		console.log('e:resume');
		
		//reloadApp
		App.utils.reloadApp();
		
	};
	
	//function init
	App.init = function() {
				
		//starting app
		if ( !window.Platform.iOS && !window.Platform.android ) {
			
			//alert('NOT running on iOS/Android');
			console.log('NOT running on iOS/Android');
			
			//set onDevice flag
			App.onDevice = false;
			
			//manually start app when not on a device
			this.onDeviceReady();
			
		} else {
			
			//alert('running on iOS/Android');
			console.log('running on iOS/Android');
			
			//set onDevice flag
			App.onDevice = true;
			
			//attach phoneGap events
			document.addEventListener('deviceready', this.onDeviceReady, false);
			document.addEventListener("resume", this.onResume, false);

		}
		
		//only continue if there's jQuery
		if (!$) return false;
		
		//init app modules
		App.utils.init();
		App.data.init();
		App.view.init();

	};
	
	return App;
	
})(window.App);

//init App
App.init();
