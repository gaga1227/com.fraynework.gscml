/* ------------------------------------------------------------------------------ 
   Code for 'mobileinit'
    - to be inserted after jquery but before jqm
    - executed before JQM start processing the page
	- jqm global configs
   ------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------ */
/* binding */
$(document).bind( 'mobileinit', onMobileinit );

/* ------------------------------------------------------------------------------ */
/* onMobileinit */  
function onMobileinit() { 
	//alert('e:mobileinit');
	console.log('e:mobileinit');
	$.mobile.allowCrossDomainPages = true;	
}
