/* ------------------------------------------------------------------------------ */
/* App - data */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){
	
	//create empty App obj if none found
	var App = app || {};
	
	/* ------------------------------------------------------------------------------ */
	/* data */
	App.data = {
		
		/* ------------------------------------------------------------------------------ */
		//static properties
		static:
		{	
			//serves as the default startup location (centre of covered areas)
			defaultLocation: { 
				address: 'Penshurst VIC 3289, Australia',
				postcode: '3289',
				lat: -37.8751454,
				lng: 142.2908847,
				area: 6
			},
			//location from geolocation
			location: { 
				address: 'Penshurst VIC 3289, Australia',
				postcode: '3289',
				lat: -37.8751454,
				lng: 142.2908847
			},
			//default phone url prefix
			phoneURLPrefix: '+61',
			phoneURLAreaCode: '3',
			//nurse on call
			triageNurseNumbers: [ 
				'5595 3100',								//B Cobden District Health Services 
				'5593 7300',								//A SWHC: Camperdown Campus
				'5592 0222',								//E Terang Health Services
				'5558 6000',								//C Timboon & District Health Care Services
				'5568 0100',								//D Moyne Health Services: Port Fairy
				'5554 2555'									//F Casterton Memorial Hospital
			],
			//areas
			areas: [
				'3266,3267',								//B Cobden District Health Services
				'3260,3324,3325,3361',						//A SWHC: Camperdown Campus
				'3264,3265,3275,3277,3278,3280,3281,3282',	//E Terang Health Services
				'3268,3269,3270',							//C Timboon & District Health Care Services
				'3271,3272,3273,3274,3276,3293',			//D Moyne Health Services: Port Fairy
				'3292,3309,3310,3311,3312,3315'				//F Casterton Memorial Hospital
			],
			noContent: 'Unavailable',
			customMarker: 'lib/img/marker-sml.png',
			customMarkerAlt: 'lib/img/marker-red.png',
		},
		
		/* ------------------------------------------------------------------------------ */
		//messages
		msg:
		{
			dataLoadError: 		'<p class="title"><b>Unable to retieve data!</b></p><p class="ins">Please make sure you have a working network connection then restart the app.</p>',
			noMatchingRecord: 	'<p class="title"><b>No matching record found!</b></p><p class="ins">There is no service location matching your search requirements.</p>',
			noBranchRecord:		'<p class="title"><b>No record found for this service!</b></p>',
			noDeviceSupport:	'<p class="title"><b>Sorry, this feature is not supported by your device.</b></p>',
			noConnection:		'<p class="title"><b>No connection found!</b></p><p class="ins">Please make sure you have a working network connection then restart the app.</p>'
		},
		
		/* ------------------------------------------------------------------------------ */
		//properties
		firstLoadData: 	false,																				//if done a first load of all data
		serviceURLGet: 	'http://frenzy.fraynework.com.au/gscmlcomau/webservice/_lib/publicService.cfc',		//service url get
		model: 			{},																					//empty data model
		searchModel:	{},																					//empty search data model
		selection:		[],																					//current selection of services ids
		fullselection:	[],
		selected:		-1,																					//current selected branch id
		prevselected:	-1,																					//current selected branch id
		
		/* ------------------------------------------------------------------------------ */
		//function - useFullSelection
		useFullSelection: function() {
			this.selection = this.fullselection.slice();
			console.log('search selection expired, using full selection now');
		},
		
		/* ------------------------------------------------------------------------------ */
		//function - updateSelection
		updateSelection: function( data, isSearch ) {
			//vars
			var i;
			
			//clear up selection
			if (isSearch) {
				this.selection = []
			} else {
				this.selection = [];
				this.fullselection = [];
			}
			
			//loop through supplied data
			for ( i=0; i<data.length; i++ ) {
				//store selection data id sequence
				if (!isSearch) {
					//full data
					this.selection[i] = String(data[i].id);
					this.fullselection[i] = String(data[i].id);
				} else {
					//filtered data
					this.selection[i] = String(data[i].id);
				}
			}
			
			//extra functions depending on if is a search
			if (isSearch) {
				console.log('selection array updated', this.selection);
				//go to browse page
				$.mobile.changePage( App.view.pages.$browse );
			} else {
				console.log('fullselection array updated', this.fullselection);
				//update full model obj
				this.updateModel(data);
			}			
		},

		/* ------------------------------------------------------------------------------ */
		//function - updateModel
		updateModel: function( data ) {	
			//vars
			var i;
			
			//loop through supplied data
			for ( i=0; i<data.length; i++ ) {
				//assign each object to model obj using id as key
				this.model[ String(data[i].id) ] = data[i];
			}
			
			console.log('data model updated', this.model);
		},
		
		/* ------------------------------------------------------------------------------ */
		//function - updateSearchModel
		updateSearchModel: function( data ) {
			//vars
			var i, j, key,
				model = this.searchModel;
			
			//exit if data is init already
			if (model.init) return false;
			
			//loop through supplied data
			for ( i=0; i<data.length; i++ ) {
				//set init flag
				if ( i == data.length - 1 ) {
					model.init = true;	
				}
				
				//set category key
				if ( i==0 ) key = 'type';
				if ( i==1 ) key = 'surburb';
				if ( i==2 ) key = 'hours';
				if ( i>2 ) return false;
				
				//new sub array in model
				model[key] = [];
				
				//loop through sub array to copy data
				for ( j=0; j<data[i].length; j++ ) {
					model[key][j] = data[i][j];
				}
			}
			
			console.log('search model updated', this.searchModel);
			
			//updating DOM
			App.view.updateFilters();
		},
		
		/* ------------------------------------------------------------------------------ */
		//function - getContactInfo
		getContactInfo: function() {
			
			//vars
			var thisObj = this,
				branchObj = thisObj.model[thisObj.selected],
				contactDataObj = {};
				
			//update data to new contact data obj
			contactDataObj.name = { givenName: branchObj.name };
			contactDataObj.displayName = branchObj.name;
			contactDataObj.phoneNumbers = [ new ContactField( 'work', branchObj.phone ) ];
			contactDataObj.addresses = [ new ContactField( 'work', branchObj.address ) ];
			contactDataObj.emails = [ new ContactField( 'work', branchObj.email ) ];
			contactDataObj.urls = [ new ContactField( 'website', branchObj.website ) ];
			contactDataObj.note = branchObj.afterhours_notes;
			
			console.log('new contact data', contactDataObj);
			
			//return contact info obj
			return contactDataObj;
				
		},

		/* ------------------------------------------------------------------------------ */
		//function - getSearchOpts
		getSearchOpts: function(){
						
			//vars
			var thisObj = this,										//ref to data obj
				request,											//request status
				url = this.serviceURLGet,							//request url
				method = 'getSearchOptions',						//request method
				params = { method: method };						//request params
			
			//abort if no url or in request already
			if (!url || this.inRequest) return false;
			
			//otherwise set in request status and show loader
			this.inRequest = true;
			App.utils.popmsg( 'show', {} );
			
			//make request call			
			request = $.ajax({
				url:		url,
				dataType:	'json',
				cache:		false,
				data:		params,
				success:	function(data, textStatus, jqXHR) {  
								//alert('getSearchOpts: success');
								console.log('getSearchOpts: success');
								//organise data into a data model
								thisObj.updateSearchModel( data );
							},
				complete:	function(jqXHR, textStatus) { 
								//alert('getSearchOpts: complete');
								console.log('getSearchOpts: complete');
								thisObj.inRequest = false;
								//hide loader
								App.utils.popmsg(); 
							},
				error:		function(jqXHR, textStatus, errorThrown) { 
								//alert('getSearchOpts: error', textStatus, errorThrown);
								console.log('getSearchOpts: error', textStatus, errorThrown);
								//show data load error
								App.utils.popmsg( 'show', { 
									text:'', 
									html: thisObj.msg.dataLoadError, 
									textonly: true,
									textVisible: true,
									theme: 'e'
								} ); 
							}
			});
									
		},
				
		/* ------------------------------------------------------------------------------ */
		//function - getServices (all or filtered)
		getServices: function( filter ){
			
			//vars
			var thisObj = this,										//ref to data obj
				request,											//request status
				url = this.serviceURLGet,							//request url
				method = 'getServices',								//request method
				params = $.extend( { method: method }, filter );	//request params
						
			//abort if no url or in request already
			if (!url || this.inRequest) return false;
			
			//otherwise set in request status and show loader
			this.inRequest = true;
			App.utils.popmsg( 'show', {} );
			
			//make request call			
			request = $.ajax({
				url:		url, //'data.json'
				dataType:	'json',
				cache:		false,
				data:		params,
				success:	function(data, textStatus, jqXHR) {  
								//alert('getServices: success');
								console.log('getServices: success');
								//process returned data
								if ( !filter ) {
									//update full data model, first run 
									thisObj.updateSelection( data, false );
									//prevent further data load from homepage 'pageshow'
									thisObj.firstLoadData = true; 
								} else {
									//update filtered model, search
									thisObj.updateSelection( data, true );
								}
							},
				complete:	function(jqXHR, textStatus) { 
								//alert('getServices: complete');
								console.log('getServices: complete');
								thisObj.inRequest = false;
								//hide loader
								App.utils.popmsg(); 
							},
				error:		function(jqXHR, textStatus, errorThrown) { 
								//alert('getServices: error', textStatus, errorThrown);
								console.log('getServices: error', textStatus, errorThrown);
								//show data load error
								App.utils.popmsg( 'show', { 
									text:'', 
									html: thisObj.msg.dataLoadError, 
									textonly: true,
									textVisible: true,
									theme: 'e'
								} ); 
							}
			});
									
		},
		
		/* ------------------------------------------------------------------------------ */
		//function - getServicesStatus
		getServicesStatus: function( paramsObj ){
			
			//vars
			var thisObj = this,										//ref to data obj
				request,											//request status
				url = this.serviceURLGet,							//request url
				method = 'getServiceStatus',						//request method
				params = $.extend( { method: method }, paramsObj );	//request params
						
			//abort if no url or in request already
			if (!url || this.inRequest) return false;
			
			//otherwise set in request status and show loader
			this.inRequest = true;
			App.utils.popmsg( 'show', {} );
			
			//make request call			
			request = $.ajax({
				url:		url, //'data.json'
				dataType:	'json',
				cache:		false,
				data:		params,
				success:	function(data, textStatus, jqXHR) {  
								//alert('getServicesStatus: success');
								console.log('getServicesStatus: success');
								//update branch status
								App.view.updateBranchStatus( data );
							},
				complete:	function(jqXHR, textStatus) { 
								//alert('getServicesStatus: complete');
								console.log('getServicesStatus: complete');
								thisObj.inRequest = false;
								//hide loader
								App.utils.popmsg(); 
							},
				error:		function(jqXHR, textStatus, errorThrown) { 
								//alert('getServicesStatus: error', textStatus, errorThrown);
								console.log('getServicesStatus: error', textStatus, errorThrown);
								//show fallback message
								App.view.updateBranchStatus();
							}
			});
									
		},
					
		/* ------------------------------------------------------------------------------ */
		//function - init data obj
		init: function() {
			
			//alert('app.data.init()');
			
		}
			
	}
	
	return App;
	
})(window.App);
