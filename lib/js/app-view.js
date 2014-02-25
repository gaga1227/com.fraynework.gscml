/* ------------------------------------------------------------------------------ */
/* App - view */
/* ------------------------------------------------------------------------------ */
window.App = (function(app){
	
	//create empty App obj if none found
	var App = app || {};
	
	/* ------------------------------------------------------------------------------ */
	/* view */
	App.view = {
		
		//properties
		searchIsInit: false,
		mapFocus: false,
		pages:
		{
			$all:			$('div[data-role=page]'),
			$splash: 		$('#pgSplash'),
			$home: 			$('#pgHome'),
			$search: 		$('#pgSearch'),
			$map: 			$('#pgMap'),
			$browse: 		$('#pgBrowse'),
			$branch: 		$('#pgBranch'),
			$afterhours: 	$('#pgAfterHours'),
			$info: 			$('#pgInfo'),
			$modal:			$('#pgModal'),
			prevPage:		''
		},
		forms:
		{
			$search:		$('#formSearch'),
		},
		
		//templates
		templates:
		{
			browseList:	'<li data-icon="false"><a href="#pgBranch" data-transition="slidefade"><span class="suburb">suburb</span><span class="name">{name}</span><span class="address">{streetaddress}</span><span class="status">{status}</span><i class="icon fwicon-chevron-right"></i></a></li>',
			option: '<option value="{val}">{text}</option>'
		},
		
		/* ------------------------------------------------------------------------------ */
		//function - initCommon
		initCommon: function(){
			
			//onPageInit (run only once)
			function onPageInit(e, data){
				
				//alert.log('E: [' + e.currentTarget.id + ' ->', e.type + ']', 'B:' + App.data.selected);
				console.log('E: [' + e.currentTarget.id + ' ->', e.type + ']', 'B:' + App.data.selected);
									
			}
			
			//onPageBeforeShow (runs each visit)
			function onPageBeforeShow(e, data){
				
				//alert.log('E: [' + e.currentTarget.id + ' ->', e.type + ']', 'B:' + App.data.selected);
				console.log('E: [' + e.currentTarget.id + ' ->', e.type + ']', 'B:' + App.data.selected);
				
				//store prev page's id for updateGoogleMap
				App.view.pages.prevPage = App.utils.getPrevPageID(data);
				console.log('PREVPAGE: [' + App.view.pages.prevPage + ']');
				
			}

			//pageshow (runs each visit)
			function onPageshow(e, data){
				
				//alert.log('E: [' + e.currentTarget.id + ' ->', e.type + ']', 'B:' + App.data.selected);
				console.log('E: [' + e.currentTarget.id + ' ->', e.type + ']', 'B:' + App.data.selected);
				
			}
			
			//attach page events
			this.pages.$all.on( 'pageinit', onPageInit );	
			this.pages.$all.on( 'pagebeforeshow', onPageBeforeShow );
			this.pages.$all.on( 'pageshow', onPageshow );
			
		},
		
		/* ------------------------------------------------------------------------------ */
		//function - initSplash
		initSplash: function(){

			//alert('app.view.initSplash()');

			//gotoHome
			function gotoHome(){
				//alert('now going to home...');
				console.log('now going to home...');
				
				//checkConnection
				if ( App.utils.checkConnection() == 'none' ) {
					//show no selected msg
					App.utils.popmsg( 'show', { 
						text:'', 
						html: App.data.msg.noConnection, 
						textonly: true,
						textVisible: true,
						theme: 'e'
					} );  
				} else {
					//go to homepage
					$.mobile.changePage( App.view.pages.$home );
				
					//hide loadng msg
					App.utils.popmsg( 'hide' );		
				}
			}

			//onPageInit (run only once)
			function onPageInit(e){
											
			}
			
			//onPageBeforeShow (runs each visit)
			function onPageBeforeShow(e){
				
			}

			//pageshow (runs each visit)
			function onPageshow(e){
				
				//wait for deviceready
				
				//show loadng msg
				App.utils.popmsg( 'show', {} );
				/*
				App.utils.popmsg( 'show', { 
					text:'', 
					html: '', 
					textonly: false,
					textVisible: false,
					theme: 'e'
				} ); 
				*/
				
				//go to homepage
				if ( App.onDevice ) {
					//go upon deviceready
					document.addEventListener('deviceready', function(e){ gotoHome(); }, false);
				} else {
					//go right away on non-device
					gotoHome();
				}
				
			}
			
			//attach page events
			this.pages.$splash.on( 'pageinit', onPageInit );	
			this.pages.$splash.on( 'pagebeforeshow', onPageBeforeShow );
			this.pages.$splash.on( 'pageshow', onPageshow );
			
		},		
		
		/* ------------------------------------------------------------------------------ */
		//function - initHome
		initHome: function(){

			//alert('app.view.initHome()');

			//function updateAfterHoursBtn
			function updateAfterHoursBtn(){
				
				//vars
				var $btnAfterHours = $('#btnAfterHours'),
					isAfterHours = App.utils.getDateTime().ah;
				
				//toggle button
				if ( isAfterHours ) {
					App.view.pages.$home.addClass('afterHours');
					$btnAfterHours.show();	
				} else {
					App.view.pages.$home.removeClass('afterHours');
					$btnAfterHours.hide();
				}
				
			}

			//onPageInit (run only once)
			function onPageInit(e){
				
				//update geo location info
				App.utils.getGeolocation();
											
			}
			
			//onPageBeforeShow (runs each visit)
			function onPageBeforeShow(e){
				
				//discard search selection data
				if (App.data.firstLoadData) App.data.useFullSelection();
				
				//handle after hours button status
				updateAfterHoursBtn();
				
			}

			//pageshow (runs each visit)
			function onPageshow(e){
								
				//get gloabl data if not already
				if (!App.data.firstLoadData) App.data.getServices();
							
			}
			
			//attach page events
			this.pages.$home.on( 'pageinit', onPageInit );	
			this.pages.$home.on( 'pagebeforeshow', onPageBeforeShow );
			this.pages.$home.on( 'pageshow', onPageshow );
			
		},
		
		/* ------------------------------------------------------------------------------ */
		//function - updateFilters
		updateFilters: function(){
			
			//exit if already init
			if ( this.searchIsInit ) return false;
							
			//vars
			var	$type = $('#formServiceType').empty(),
				$suburb = $('#formLocation').empty(),
				$hours = $('#formHours').empty(),
				model = App.data.searchModel,
				$defaultOpt1 = $(this.templates.option).attr('value', 'all').text('All'),
				$defaultOpt2 = $(this.templates.option).attr('value', 'all').text('All'),
				$defaultOpt3 = $(this.templates.option).attr('value', '0').text('All'),
				i;
			
			//append default opt
			$defaultOpt1.appendTo($type);
			$defaultOpt2.appendTo($suburb);
			$defaultOpt3.appendTo($hours);
			
			//populate search page contents
			for ( i=0; i<model.type.length; i++ ) {
				var $opt = $(this.templates.option),
					val = $.trim(model.type[i]);
				$opt
					.attr('value', val)
					.text(val)
					.appendTo($type);
			}
			for ( i=0; i<model.surburb.length; i++ ) {
				var $opt = $(this.templates.option),
					val = $.trim(model.surburb[i]);
				$opt
					.attr('value', val)
					.text(val)
					.appendTo($suburb);
			}
			for ( i=0; i<model.hours.length; i++ ) {
				var $opt = $(this.templates.option),
					valStr = $.trim(model.hours[i]),
					valArr = valStr.split(':', 2);
				//if ( valStr.indexOf('Sunday') >= 0) continue;
				$opt
					.attr('value', valArr[1])
					.text(valArr[0])
					.appendTo($hours);
			}
			
			//refresh jqm widgets
			$type.selectmenu('refresh');
			$suburb.selectmenu('refresh');
			$hours.selectmenu('refresh');
			
			//turn on flag
			this.searchIsInit = true;
		},
		
		/* ------------------------------------------------------------------------------ */
		//function - initSearch
		initSearch: function(){
						
			//vars
			var thisObj = this;
			
			//initBtnSearch
			function initBtnSearch(){
				//vars
				var $submit = $('#btnSubmit');
				
				//bind button events
				$submit.unbind().bind('click', function(e){
					e.preventDefault();
					
					//vars
					var	filters = {};
					filters.city = $('#formLocation').val(),
					filters.serviceType = $('#formServiceType').val(),
					filters.serviceTime = $('#formHours').val(),
					filters.keywords = $('#formKeywords').val()
					
					//pass filter data to data function
					App.data.getServices( filters );
				});	
			}

			//onPageCreate (before jqm init)
			function onPageCreate(e){
								
				//getSearchOpts
				App.data.getSearchOpts();
										
			}
			
			//onPageInit (run only once)
			function onPageInit(e){
				
				//initBtnSearch
				initBtnSearch();
										
			}
			
			//onPageBeforeShow (runs each visit)
			function onPageBeforeShow(e){
				
			}

			//pageshow (runs each visit)
			function onPageshow(e){
							
			}
			
			//attach page events
			this.pages.$search.on( 'pagecreate', onPageCreate );
			this.pages.$search.on( 'pageinit', onPageInit );	
			this.pages.$search.on( 'pagebeforeshow', onPageBeforeShow );
			this.pages.$search.on( 'pageshow', onPageshow );	
			
		},
		
		/* ------------------------------------------------------------------------------ */
		//function - initMap
		initMap: function(){
						
			//vars
			var	thisObj = this,
				map, geocoder, 
				zoomMin = 8, zoomMax = 16,
				delay = 0, 
				oldSelectionArr = [];
			
			//onMarkerClick
			function onMarkerClick(id){
				console.log('Marker clicked:', id);
				//set selected id
				App.data.prevselected = String(App.data.selected);
				App.data.selected = id;
				//goto branch page
				$.mobile.changePage( App.view.pages.$branch );
			}
			
			//initLocation
			function initLocation(locationObj){
				
				//exit if no location Obj
				if ( !locationObj ) return false;
				
				//vars
				var marker, markerOpts, customIcon,	//marker
					latlng;							//position

				//update position
				latlng = new google.maps.LatLng( locationObj.lat, locationObj.lng );				

				//update icons
				customIcon = (locationObj.id == App.data.selected) ? App.data.static.customMarkerAlt : App.data.static.customMarker;
								
				//update marker opts
				markerOpts = {
					map: map,
					icon: customIcon,
					position: latlng,
					draggable: false,
					animation: google.maps.Animation.NONE,
					labelContent: '<span>' + $.trim(locationObj.name) + '</span>',
					labelAnchor: new google.maps.Point(50, 0),
					labelClass: 'mapMarkerLabel'
				}
								
				//create marker
				//marker = locationObj.marker = new google.maps.Marker( markerOpts );
				/*using google map label utility than google.maps.Marker*/
				marker = locationObj.marker = new MarkerWithLabel( markerOpts );
				
				//marker event
				google.maps.event.addListener(marker, 'click', function(e){
					onMarkerClick( locationObj.id );
				});
				
			}
			
			//initLocations
			function initLocations(){
				
				//vars
				var i = 0;
				
				//loop through fullselection to init all locations from model
				if ( delay == 0 ) {
					
					//without delay
					for ( i = 0; i < App.data.fullselection.length; i++ ) {
						console.log('init location: ' + (i+1), '-> id: ' + App.data.fullselection[i]);
						//init single location with google api
						initLocation( App.data.model[ App.data.fullselection[i] ] );
						//if last location, switch mapInit flag
						if ( i == App.data.fullselection.length - 1 ) {
							thisObj.locationsInit = true;
						}
					}
					
				} else {
										
					//with delay
					function loop(){
						var timeout;
						timeout = setTimeout( function(){
							if ( i < App.data.fullselection.length ) {
								console.log('location: ' + (i+1));
								initLocation( App.data.model[ App.data.fullselection[i] ] );
								i++;
								loop();
							} else {
								clearTimeout( timeout );
								thisObj.locationsInit = true;	
							}
						}, delay );
					}
					loop();					
					
				}
				
			}
			
			//gotoLocation
			function gotoLocation(id){
				//vars
				var locationID = id || 0,
					zoom = (locationID == 0) ? zoomMin : zoomMax,
					locationObj = (locationID == 0) ? App.data.static.defaultLocation : App.data.model[id];
				
				//go to location
				if ( !map ) {
					//go to with map init
					console.log('no valid map');	
					initGoogleMap( locationObj, zoom, true );	
				} else {
					//go to with map update
					if ( locationObj.lat && locationObj.lng ) {
						map.panTo/*setCenter*/( new google.maps.LatLng( locationObj.lat, locationObj.lng ) );
						map.setZoom(zoom);
						console.log('go to location', locationObj.lat, locationObj.lng, 'zoom:', zoom);
					} else {
						console.log('no valid location');
					}
				}		
			}

			//updateMarker
			function updateMarker(id, highlight){
				
				//exit if map and locations are not init
				if (!map /*|| !thisObj.locationsInit*/) { console.log('map and locations not ready, exit...'); return false; }
				
				//vars
				var icon = App.data.static.customMarker,
					iconAlt = App.data.static.customMarkerAlt,
					labelCls = 'mapMarkerLabel',
					labelClsAlt = 'mapMarkerLabelHighlighted',
					marker, opts, optsAlt;
				
				//update opts
				optsAlt = { 
					//highlight
					icon: iconAlt,
					labelClass: labelClsAlt,
				}
				opts = {
					//default
					icon: icon,
					labelClass: labelCls,
				}
				
				//make all markers default
				for ( key in App.data.model ) {
					marker = App.data.model[key].marker;
					if ( marker ) {
						marker.setOptions( opts );
						//marker.setIcon( icon );
					}
				}
				console.log('updated all markers to default');
				
				//update highlight marker
				if ( highlight && id != -1 ) {
					marker = App.data.model[id].marker;
					if ( marker ) {	
						marker.setOptions( optsAlt );
						//marker.setIcon( iconAlt );
					}
					console.log('updated highlight marker:', id);
				}
								
			}
			
			//initGoogleMap
			function initGoogleMap(location, zoom, highlight) {
				
				//exit if map created already
				if (map) {
					console.log('google map exists, exit!');	
					return false;
				} else {
					console.log('create new google map instance...');
				}
								
				//vars
				var centerLocation = location ? location : App.data.static.defaultLocation, 
					latlng = new google.maps.LatLng( centerLocation.lat, centerLocation.lng ),
					mapOpts = {
						zoom: zoom ? zoom : zoomMin,
						center: latlng,
						mapTypeId: google.maps.MapTypeId.ROADMAP
					}
					
				//init map
				map = thisObj.map = new google.maps.Map(document.getElementById('mapCanvas'), mapOpts);
				
				//initLocations
				initLocations();
				
			}
			
			//updateGoogleMap
			function updateGoogleMap(selectionArr){
				
				//check initMap first
				initGoogleMap();
				
				//trigger resize for map for each visit
				google.maps.event.trigger(map, 'resize');
				
				//check if should focus on selected location
				if ( thisObj.mapFocus && thisObj.pages.prevPage == 'pgBranch' && App.data.selected != -1 ) {
					console.log('has selected id, update map to selected location');
					gotoLocation(App.data.selected);
					if (App.data.selected != App.data.prevselected || ( App.data.selected == App.data.prevselected && App.data.selected != -1 )) {
						updateMarker(App.data.selected, true);
					}
				} else {
					console.log('show all locations');
					gotoLocation();
					updateMarker();
				}
								
			}
			
			//onPageInit (run only once)
			function onPageInit(e){
										
			}
			
			//onPageBeforeShow (runs each visit)
			function onPageBeforeShow(e, data){
				
			}

			//pageshow (runs each visit)
			function onPageshow(e){
								
				//updateGoogleMap
				updateGoogleMap(App.data.fullselection);
							
			}

			//pagehide (runs each exit)
			function onPagehide(e){
				
				//reset map focus on every exit
				thisObj.mapFocus = false;
				console.log('mapFocus: ' + thisObj.mapFocus);
							
			}
			
			//attach page events
			this.pages.$map.on( 'pageinit', onPageInit );
			this.pages.$map.on( 'pagebeforeshow', onPageBeforeShow );
			this.pages.$map.on( 'pageshow', onPageshow );
			this.pages.$map.on( 'pagehide', onPagehide );
				
		},	
		
		/* ------------------------------------------------------------------------------ */
		//function - initBrowse
		initBrowse: function(){
			
			//vars
			var thisObj = this,
				$list = $('#browseResult'),
				listCreated = false,
				oldSelectionArr = [];
			
			//initListview
			function initListview(){
				
				//init jqm listview widget
				$list.listview({
					autodividers: true,
					autodividersSelector: function ( li ) {
						var cateLabel = li.find('.suburb').hide().text();
						return cateLabel;
					}
				});
				
				//prevent list to be created again
				listCreated = true;
				
				console.log('browse listview created');
				
			}
			
			//initListButtons
			function initListButtons(){
				
				//add behavior to list buttons
				$list.find('a').off().on( 'click', function(e){
					
					//vars
					var $entry = $(e.target).parents('li');
					
					//update unique service id for App
					App.data.prevselected = String(App.data.selected);
					App.data.selected = $entry.attr('data-id');
					
					console.log('selected service: ' + App.data.selected);
					
				} );
					
			}
			
			//checkSelection
			function checkSelection( selectionArr ){
			
				//if selection content is none
				if ( selectionArr.length < 1 ) {
					
					console.log('current selection is none');
					
					//show no selection msg
					App.utils.popmsg( 'show', { 
						text:'', 
						html: App.data.msg.noMatchingRecord, 
						textonly: true,
						textVisible: true,
						theme: 'e'
					} ); 
					
				}
				
			}
			
			//populateListContent
			function populateListContent( selectionArr ){
				
				//check if selection has changed since last run
				if ( selectionArr.toString() ==  oldSelectionArr.toString() ) {
					console.log('No update on selection, no update on current view');
					//exit function
					return false;
				} else {
					console.log('current selection cached, updating view...');
					//cache new selection for comparison in next run
					oldSelectionArr = selectionArr;
				}
								
				//vars
				var data = App.data.model,
					i, entryDataObj,
					suburb, name, streetaddress, status;				
				
				//clear all existing entries
				$list.empty();
				
				//loop through data model selection array
				for ( i = 0; i < selectionArr.length; i++ ) {
					
					//console.log('looping selection', i);
					
					//vars
					var entry, $entry, 
						key = selectionArr[i];
					
					//assign each entry data to temp data obj
					entryDataObj = data[key]; 
					//console.log(entryDataObj, i, selectionArr.length);
					
					//get value from each entry data obj
					suburb = entryDataObj.suburb ? entryDataObj.suburb : null;
					name = entryDataObj.name ? entryDataObj.name : null;
					street_address = entryDataObj.street_address ? entryDataObj.street_address: null;
					status = entryDataObj.status ? entryDataObj.status: null;
					
					//update $entry with model data, id and add to DOM
					$entry = $( thisObj.templates.browseList );
					$entry.attr( 'data-id', key );
					$entry.find( '.suburb' ).text(suburb.toLowerCase());
					$entry.find( '.name' ).text(name);
					$entry.find( '.address' ).text(street_address);
					$entry.find( '.status' ).hide()/*.text(status)*/;
					$entry.appendTo( $list );
					
					//when last entry is processed
					if ( i == selectionArr.length - 1 ) { 
						
						//console.log('looping selection END');
						
						//create or update listview
						if ( listCreated ) {
							$list.listview('refresh');
							console.log('browse listview refreshed');
						} else {
							initListview();
						}
						
						//update list button behaviors
						initListButtons(); 
						
					}
									
				}				
					
			}
			
			//onPageInit (run only once)
			function onPageInit(e){
															
			}
			
			//onPageBeforeShow (runs each visit)
			function onPageBeforeShow(e){
								
				//adding content from lstest data selection
				populateListContent(App.data.selection);
				
			}

			//pageshow (runs each visit)
			function onPageshow(e){
								
				//check selection
				checkSelection(App.data.selection);
				
			}
			
			//attach page events
			this.pages.$browse.on( 'pageinit', onPageInit );	
			this.pages.$browse.on( 'pagebeforeshow', onPageBeforeShow );
			this.pages.$browse.on( 'pageshow', onPageshow );	
			
		},	
		
		/* ------------------------------------------------------------------------------ */
		//function - initBranch
		initBranch: function(){
			
			//vars
			var thisObj = this;
			
			//function - checkSelected
			function checkSelected(id){
				
				//vars
				var id = id || App.data.selected;
				
				//check and handle invalid selected id
				if ( id == -1 || App.data.model[id] == undefined ) {
					
					console.log('current selected branch is invalid');
					
					//show no selected msg
					App.utils.popmsg( 'show', { 
						text:'', 
						html: App.data.msg.noBranchRecord, 
						textonly: true,
						textVisible: true,
						theme: 'e'
					} ); 
					
					//exit funtion
					return false;
				}
				
			}
			
			//function - updateBranchInfo
			function updateBranchInfo(id){
								
				//vars
				var id = id || App.data.selected,
					branchData = App.data.model[id],
					$secPhone = $('#secPhone'),
					$secEmail = $('#secEmail'),
					$secWeb = $('#secWeb'),
					$secDetails = $('#secDetails'),
					$secHours = $('#secHours'),
					$secNotes = $('#secNotes'),
					phoneURL, email, webURL,
					noContent = App.data.static.noContent,
					dateObj = new Date(),
					
					//common function to inject plain text
					injectPlainContent = function( field, $tgt ){
						//vars
						var content = $.trim(branchData[field]);
						
						//check content and inject
						if (content) {
							$tgt
								.removeClass('noContent')
								.text( content )
						} else {
							$tgt
								.addClass('noContent')
								.text( noContent );
						}
					};
				
				//exit if no data record
				if ( branchData == undefined ) return false;
				
				//get real time branch status
				App.data.getServicesStatus({
					id: id,
					hour: dateObj.getHours(),
					minute: dateObj.getMinutes()
				});
				
				//update DOM with model data
				
				//phone
				if ( branchData.phone ) {
					phoneURL = $.trim(branchData.phone).replace(/\s/g, ""); //remove spaces
					if ( phoneURL.charAt(0) === '0' ) { //remove if first digit is 0
						phoneURL = phoneURL.substr(1);	
					}
					phoneURL = App.data.static.phoneURLPrefix + phoneURL;
					$secPhone.find('a')
						.attr( 'href', 'tel:' + phoneURL )
						.removeClass( 'noContent' )
						.text( $.trim(branchData.phone) );		
				} else {
					$secPhone.find('a')
						.removeAttr( 'href' )
						.addClass( 'noContent' )
						.text( noContent );	
				}
				
				//email
				if ( branchData.email ) {
					email = $.trim(branchData.email);
					$secEmail.find('a')
						.attr( 'href', 'mailto:' + email )
						.removeClass( 'noContent' )
						.text( email );		
				} else {
					$secEmail.find('a')
						.removeAttr( 'href' )
						.addClass( 'noContent' )
						.text( noContent );	
				}
				
				//web
				if ( branchData.website ) {
					webURL = $.trim(branchData.website);
					if ( webURL.indexOf('http:') != -1 ) webURL.replace( 'http://', '' );
					if ( webURL.substr( webURL.length - 1 ) == '/' ) webURL.substr( 0, webURL.length - 1 );
					$secWeb.find('a')
						.attr( 'href', 'http://' + webURL )
						.attr( 'target', '_blank' )
						.removeClass( 'noContent' )
						.text( webURL );		
				} else {
					$secWeb.find('a')
						.removeAttr( 'href' )
						.addClass( 'noContent' )
						.text( noContent );	
				}
				
				//details
				injectPlainContent( 'name', $secDetails.find('.heading') );
				injectPlainContent( 'address', $secDetails.find('.address') );
								
				//hours
				injectPlainContent( 'mon_hours', $secHours.find('.mon > .hours') );
				injectPlainContent( 'tue_hours', $secHours.find('.tue > .hours') );
				injectPlainContent( 'wed_hours', $secHours.find('.wed > .hours') );
				injectPlainContent( 'thu_hours', $secHours.find('.thu > .hours') );
				injectPlainContent( 'fri_hours', $secHours.find('.fri > .hours') );
				injectPlainContent( 'sat_hours', $secHours.find('.sat > .hours') );
				injectPlainContent( 'sun_hours', $secHours.find('.sun > .hours') );

				//notes
				injectPlainContent( 'afterhours_notes', $secNotes.find('p') );	
					
			}
			
			//function - initAddContactBtn
			function initAddContactBtn(){
				
				//alert('app.view.initBranch().initAddContactBtn()');
				
				//vars
				var $btnAddContact = $('#btnAddContact');
				
				//bind btn behavior
				$btnAddContact.unbind().bind('click', function(e){
					
					e.preventDefault();
					
					//if not on a device
					if ( !App.onDevice ) {
						
						//alert(App.onDevice);
						
						//show no contact support msg
						App.utils.popmsg( 'show', { 
							text:'', 
							html: App.data.msg.noDeviceSupport, 
							textonly: true,
							textVisible: true,
							theme: 'e'
						}, true ); 
						
						console.log('Feature not supported!');
						
					} else {
						
						//alert(App.onDevice);
						//alert('Adding contact...');
						console.log('Adding contact...');
						
						//call getContactInfo
						App.utils.addContact( App.data.getContactInfo() );
					
					}
						
				});				
				
			}
			
			//function - initMapBtn
			function initMapBtn(){
				
				//alert('app.view.initBranch().initMapBtn()');
				
				//vars
				var $btnMap = $('#btnViewMap');
				
				//bind btn behavior
				$btnMap.unbind().bind('click', function(e){
					
					//enable map focus via this button
					thisObj.mapFocus = true;
					console.log('mapFocus: ', thisObj.mapFocus);
				
				});				
				
			}
			
			//onPageInit (run only once)
			function onPageInit(e){
								
				//init buttons
				initAddContactBtn();
				initMapBtn();
											
			}
			
			//onPageBeforeShow (runs each visit)
			function onPageBeforeShow(e){
								
				//populate branch info
				updateBranchInfo();
				
			}

			//pageshow (runs each visit)
			function onPageshow(e){
								
				//check selected
				checkSelected();
								
			}
			
			//attach page events
			this.pages.$branch.on( 'pageinit', onPageInit );	
			this.pages.$branch.on( 'pagebeforeshow', onPageBeforeShow );
			this.pages.$branch.on( 'pageshow', onPageshow );	
			
		},
		
		/* ------------------------------------------------------------------------------ */
		//function - updateBranchStatus
		updateBranchStatus: function( data ){
			
			//vars
			var status = data || -1,
				statusOpen = true,
				statusAvail = true,
				noStatusInfo = false,
				$statusOpen = $('#statusOpen'),
				$statusAvail = $('#statusAvail');
			
			//process status code
			if ( status == 1 ) {
				statusOpen = false,
				statusAvail = true;	
			} else if ( status == 2 ) {
				statusOpen = true,
				statusAvail = true;	
			} else if ( status == 3 ) {
				statusOpen = true,
				statusAvail = false;	
			} else if ( status == 4 ) {
				statusOpen = false,
				statusAvail = false;	
			} else {
				noStatusInfo = true;
			}
			
			console.log('Branch StatusOpen: ', status, statusOpen);
			console.log('Branch statusAvail: ', status, statusAvail);
			
			//update dom
			if ( noStatusInfo ) {
				$statusOpen.hide();
				$statusAvail.hide();
			} else {
				statusOpen ? $statusOpen.hide() : $statusOpen.show();
				statusAvail ? $statusAvail.hide() : $statusAvail.show();
			}

		},			
		
		/* ------------------------------------------------------------------------------ */
		//function - initAfterhours
		initAfterhours: function(){
			
			//vars
			var thisObj = this;
			
			//function - updateTriageNurseCall
			function updateTriageNurseCall(){
				console.log('Get triage nurse number for: ', App.data.static.location.postcode);
				
				//vars
				var $btnCall = $('#btnCallTriageNurse'),
					$btnCallLabel = $btnCall.find('.telNum'),
					postcode = App.data.static.location.postcode,
					areas = App.data.static.areas,
					area,
					phone,
					phoneURL,
					i;
 
 				//update phone from post code
				for ( i=0; i<=areas.length; i++ ) {
					if ( String(areas[i]).indexOf( postcode ) != -1 ) {
						console.log('Postcode matched to Area: ' + (i+1));
						phone = App.data.static.triageNurseNumbers[i];
						area = i;
						break;	
					} else if ( i==areas.length ) {
						console.log('No postcode match, using default area: ' + App.data.static.defaultLocation.area);
						phone = App.data.static.triageNurseNumbers[ parseInt(App.data.static.defaultLocation.area,10) - 1 ];
						area = parseInt(App.data.static.defaultLocation.area,10) - 1;
					}
				}
				
				//process phone url
				phoneURL = phone.replace(/\s/g, ""); //remove spaces
				phoneURL = App.data.static.phoneURLPrefix + App.data.static.phoneURLAreaCode + phoneURL;
				
				//apply to dom
				$btnCallLabel.text( phone );
				$btnCall.attr( 'href', 'tel:' + phoneURL );
				
				//update areaCalls
				updateAreaCalls(area);
				
			}
			
			//function - updateAreaCalls
			function updateAreaCalls(area){
				
				//process area
				area = parseInt(area,10);
				
				//exit if no valid area code
				if (area < 0) return false;
				
				console.log('Will hide area:' + (area+1) + ' from list');
				
				//vars
				var $areaCalls = $('.areaCall'),
					hiddenCls = 'hidden',
					noTopBorderCls = 'noTopBorder';
				
				//process areaCalls
				$.each($areaCalls, function(idx,ele){
					//vars
					var $areaCall = $(ele),
						id = $areaCall.attr('id'),
						isHidden = $areaCall.hasClass(hiddenCls),
						isNoTopBorder = $areaCall.hasClass(noTopBorderCls);
					//if is current area (hidden)
					if (id == 'area' + (area+1)) {
						//hide area 
						$areaCall.addClass(hiddenCls); 
					} else {
						//show area
						$areaCall.removeClass(hiddenCls);
					}
					//if current is first and current process is on area2
					if ( area == 0 && id == 'area2' ) {
						//second area to hide top border
						$areaCall.addClass(noTopBorderCls);	
					} else {
						//reset noTopBorderCls
						$areaCall.removeClass(noTopBorderCls);	
					}
				});
				
			}
			
			//onPageInit (run only once)
			function onPageInit(e){		
				
											
			}
			
			//onPageBeforeShow (runs each visit)
			function onPageBeforeShow(e){
								
				//update triage nurse phone number
				updateTriageNurseCall();
				
			}

			//pageshow (runs each visit)
			function onPageshow(e){
			
										
								
			}
			
			//attach page events
			this.pages.$afterhours.on( 'pageinit', onPageInit );	
			this.pages.$afterhours.on( 'pagebeforeshow', onPageBeforeShow );
			this.pages.$afterhours.on( 'pageshow', onPageshow );	
			
		},	
		
		/* ------------------------------------------------------------------------------ */
		//function - initInfo
		initInfo: function(){
			
			//vars
			var thisObj = this;
			
			//function - updateInfo
			function updateInfo(){
				
				//vars
				var $version = $('#infoVersion'),
					$lastUpdate = $('#infoLastUpdate');
				
				//updates
				$version.text( App.version );
				$lastUpdate.text( App.lastUpdate );
				
			}
			
			//onPageInit (run only once)
			function onPageInit(e){		
				
											
			}
			
			//onPageBeforeShow (runs each visit)
			function onPageBeforeShow(e){

				//updateInfo
				updateInfo();
				
			}

			//pageshow (runs each visit)
			function onPageshow(e){
			
							
			}
			
			//attach page events
			this.pages.$info.on( 'pageinit', onPageInit );	
			this.pages.$info.on( 'pagebeforeshow', onPageBeforeShow );
			this.pages.$info.on( 'pageshow', onPageshow );	
			
		},	

		/* ------------------------------------------------------------------------------ */
		//function - init
		init: function(){
			
			//alert('app.view.init()');
			
			//common
			this.initCommon();
			
			//splash
			this.initSplash();
			
			//home
			this.initHome();
			
			//search
			this.initSearch();
			
			//map
			this.initMap();
			
			//browse
			this.initBrowse();
			
			//branch
			this.initBranch();
			
			//afterhours
			this.initAfterhours();
			
			//info
			this.initInfo();
						
		}
		
	};
	
	return App;
	
})(window.App);