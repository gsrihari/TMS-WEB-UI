// controller.js
app = angular.module('app');

//LoginController
app.controller('LoginController', ['$scope', '$http','$rootScope','APIServices','$cookieStore', 'logger',
    '$location','$state','DashboardDataSharingServices', function($scope, $http, $rootScope, APIServices,
    $cookieStore, logger, $location, $state, DashboardDataSharingServices) {
	//Saving the view details in cookieStore
	//L - Login, D - Dashboard View, M - Map View, T - Table View
	$cookieStore.view = "L";

	$("#page-top").on("contextmenu", function (e) {
	    logger.logError('Right Click is not allowed');
	    return false;
	});

	$('#txtInput').keyup(function (evt) {
	    var theEvent = evt || window.event;
	    var key = theEvent.keyCode || theEvent.which;

	    var inputVal = $(this).val();
	    var characterReg = /^\s*[a-zA-Z0-9,\s]+\s*$/;

	    if (inputVal === '' || inputVal === undefined) {
	        return;
	    }
	    if (key === 9) { //TAB was pressed
	        return;
	    }
	    if (!characterReg.test(inputVal)) {
	        logger.logWarning('Special Characters not allowed');
	        var no_spl_char = inputVal.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
	        $(this).val(no_spl_char);
	    }
	});

	// special character not allowed
	// username
	$('#uname').keyup(function (evt) {
	    var theEvent = evt || window.event;
	    var key = theEvent.keyCode || theEvent.which;

	    var LoginInputVal = $(this).val();
	    var notifyCharacterReg = /^\s*[a-zA-Z0-9,. \s]+\s*$/;

	    if (LoginInputVal === '' || LoginInputVal === undefined){
		return;
	    }
	    if (!notifyCharacterReg.test(LoginInputVal)) {
	    	logger.logWarning('Special Characters not allowed');
		var no_spl_char = LoginInputVal.replace(/[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '');
		$(this).val(no_spl_char);
	    }
	    if (key === 9) { //TAB was pressed
		return;
	    }
	});

	// password
	$('#password').keyup(function (evt) {
	    var theEvent = evt || window.event;
	    var key = theEvent.keyCode || theEvent.which;

	    var textbox = $(this).val();
	    var pattern = /^([a-zA-Z0-9!@#$%^&*_={}?s]+)$/;

	    if (textbox === '' || textbox === undefined) {
		return;
	    }
	    if (!pattern.test(textbox)) {
		logger.logWarning(' \' " : ; () <> / []. , + - Characters not allowed');
		var no_spl_char = textbox.replace(/[()\-\[\];':"\\|,.+<>\/\s]/gi, '');
		$(this).val(no_spl_char);
	    } else if (key === 9) { //TAB was pressed
		return;
	    }
	});

	$scope.getCaptchaImg = function() {
	    try {
		loading.start();
		$.ajax({
		    url: $rootScope.HOST_TMS + "api/captcha-image",
		    type: "GET",
		    xhrFields: {withCredentials: true},
		    dataType: 'json',
		    success: function (result) {
			loading.finish();
			document.getElementById('captcha-img-id').setAttribute('src', "data:image/jpeg;base64," + result.strResponse);
		    }, error: function (httpRequest, textStatus, errorThrown) {
			loading.finish();
			logger.logWarning("Unable to connect to server. Please check your internet connection / Server may down. Please try again later");
		        // alert(JSON.stringify(httpRequest)+", "+textStatus+", "+errorThrown);
		    }
		});
	    } catch (e) { loading.finish(); console.log(e); }
	};
	$scope.getCaptchaImg();

	$scope.submitLoginForm = function () {
	    if ($('#uname').val() == '' || $('#uname').val() === undefined || $('#uname').val() === null) {
		logger.logError('Username Required');
	    } else if ($('#password').val() == '' || $('#password').val() === undefined || $('#password').val() === null) {
		logger.logError('Password Required');
	    } else if ($('#txtInput').val() == '' || $('#txtInput').val() === undefined || $('#txtInput').val() === null) {
		logger.logError('Enter captcha');
	    } else {
		var data = {
		    "username": $scope.uname.replace(/[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, ''),
		    // "password": Encrypt($scope.password.replace(/[()\-\[\];':"\\|,.+<>\/\s]/gi, '')),
		    "password": $scope.password.replace(/[()\-\[\];':"\\|,.+<>\/\s]/gi, ''),
		    "securitycode": $scope.captcha
		};
		try {
		    loading.start();
		    APIServices.callAPI($rootScope.HOST_TMS + 'api/login',data, true)
		    .then(
			function(httpResponse){ // Success block
			    try {
				loading.finish();
				// if(httpResponse.request.getResponseHeader('Status') === "Success") {
				if(httpResponse.data.status) {
				    $cookieStore.put("LoginUser", httpResponse.data.strResponse);
				    $rootScope.UserName = httpResponse.data.strResponse;
				    $location.url('/dashboard');
				} else {
				    logger.logError(httpResponse.data.displayMsg);
				    $scope.getCaptchaImg();
				    $scope.captcha = '';
				}
			    }
			    catch(error) {
				$scope.getCaptchaImg();
				$scope.captcha = '';
				loading.finish();
				console.log("Error :"+error);
			    }
			}, function(httpError) { 	// Error block
			    $scope.getCaptchaImg();
			    $scope.captcha = '';
			    loading.finish();
			    console.log("Error while processing request");
			}, function(httpInProcess){	// In process
			    console.log(httpInProcess);
			}
		    );
		}catch(err) {
		    $scope.getCaptchaImg();
		    loading.finish();
		    $scope.captcha = '';
		    console.log(err);
		}
	    }
	} //End of the submitLoginForm
    }]); /* End of the Login controller */


// NavController
app.controller('NavController', ['$scope', '$rootScope', '$state', 'APIServices',
    'DashboardDataSharingServices', '$location','$cookieStore','$filter', 'logger','$timeout',
    function($scope, $rootScope, $state, APIServices, DashboardDataSharingServices, $location,
    $cookieStore, $filter, logger, $timeout) {
	$scope.controller = 'NavController!';
	$rootScope.innerIdForTroubledChart = "innerIdForTroubledChart";
	$scope.troubledVehChartData = [];

	$rootScope.allVehCount = 0;
	$rootScope.allSemiConfigVehCount = 0;

	function deleteAllCookies() {
	    var cookies = document.cookie.split(";");
	    for (var i = 0; i < cookies.length; i++) {
	        var cookie = cookies[i];
	        var eqPos = cookie.indexOf("=");
	        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
	        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
	    }
	}

	try {
	    $scope.LOGOUT_URL = "api/logout";
	    $rootScope.logoutFun = function(msg){
		try {
		    try {
    			deleteAllCookies();
    			$rootScope.clearInterval_tmsTroubledVeh();
    			//$rootScope.clearInterval_tmsDashboard();
		    } catch (e) { console.log(e); }

		    try {
			var data = {
			    "logoutMsg": msg,
			    "invalidateSession": true
			}
			APIServices.callAPI($rootScope.HOST_TMS + $scope.LOGOUT_URL, data, false)
			.then(
			    function(httpResponse) { 	// Success block
				try{
				}catch(e){ console.log(e); }
			    }, function(httpError) {		 // Error block
				console.log("Error while processing request "+httpError);
			    }, function(httpInProcess){	// In process
				console.log(httpInProcess);
			    }
			);
		    } catch (e) { console.log(e); }
		} catch (e) { console.log(e)	}
		$location.url('/login');
	    };
	} catch (e) {
	    console.log(e);
	}

	//Dashboard
	// Get Troubled Vehicles count
	// Get TMS Dashboard details
	$rootScope.getDashboardDetails = function(vehStatus, tempPressureStatus, callback) {
    try {
      APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getDashboardDetails?vehStatus='
        +vehStatus+'&tempPressureStatus='+tempPressureStatus, false)
  		.then(
  	    function(httpResponse) {	 // Success block
    			try {
  			    loading.finish();
  			    if(httpResponse.data.status == true) {
      				var vehIdName_HashMap = new Object();
      				try {
      				    // Basic user details
      				    $rootScope.UserName = httpResponse.data.result[0].userName;
      				} catch (e) { console.log(e); }
      				try {
      				    // Assigned Temperature & Pressure values
      				    $rootScope.minMaxTempPressureValues = httpResponse.data.result[0].minMaxTempPressureValues;
      				} catch (e) { console.log(e); }
      				try {
      				    // Assigned Vehicles
                  if(null != httpResponse.data.result[0].vehicles && httpResponse.data.result[0].vehicles.length > 0){
        				    DashboardDataSharingServices.setVehiclesList(httpResponse.data.result[0].vehicles);
        				    angular.forEach(httpResponse.data.result[0].vehicles, function(vehicle, key){
        					         vehIdName_HashMap[vehicle.vehId] = vehicle.vehName;
        				    });
        				    DashboardDataSharingServices.setVehIdName_HashMap(vehIdName_HashMap);
                  }
                  $rootScope.allVehCount = httpResponse.data.result[0].total_fleets;
      				} catch (e) { console.log(e); }
      				try {
      				    // Vehicle - Tyre counts
      				    // $scope.vehTyreCounts = httpResponse.data.result[0].vehTyreCount;
      				    $scope.allTyresAssignedVeh = httpResponse.data.result[0].allTiresConfigVehCount;
                  $rootScope.allSemiConfigVehCount = $rootScope.allVehCount - $scope.allTyresAssignedVeh;
                  $scope.updatePieChart_vehTyreRelation($rootScope.allSemiConfigVehCount, $scope.allTyresAssignedVeh);
      				} catch (e) { console.log(e); }
      				try {
      				    // Basic user details
      				    $rootScope.tyreCount_all = httpResponse.data.result[0].tireCount_all;
      				    $rootScope.tyreCount_installed = httpResponse.data.result[0].tireCount_installed;
      				    $rootScope.tyreCount_scraped = httpResponse.data.result[0].tireCount_scraped;
      				    $rootScope.tyreCount_instock = httpResponse.data.result[0].tireCount_instock;
                  $rootScope.tireCount_withoutSensor = httpResponse.data.result[0].tireCount_withoutSensor;
      				    $rootScope.tyreCount_services = httpResponse.data.result[0].tireCount_services;
      				    $rootScope.tyreCount_inspections = httpResponse.data.result[0].tireCount_inspections;
      				} catch (e) { console.log(e); }
      				callback(httpResponse.data);
  			    } else {
              $rootScope.logoutFun('Dashboard - Session Expired');
            }
    			}
    			catch(error) {
    			    loading.finish();
    			    console.log("Error :"+error);
    			}
		    }, function(httpError){	 // Error block
    			loading.finish();
    			$rootScope.logoutFun('');
    			console.log("Error while processing request");
		    }
  		);
    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.getTroubledVehCount = function() {
    try {
  		APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getTPMSVehDataCount', false)
  		.then(
		    function(httpResponse){ // Success block
    			try{
  			    loading.finish();
  			    if(httpResponse.data.status == true) {
      				$rootScope.troubledVehCount = httpResponse.data.badTPVehCount;
              $rootScope.NontroubledVehCount = httpResponse.data.goodTPVehCount;
              $rootScope.totalTPVehCount = $rootScope.troubledVehCount + $rootScope.NontroubledVehCount;
      				var vehiclesList = DashboardDataSharingServices.getVehiclesList();
              $scope.updatePieChart($rootScope.troubledVehCount, $rootScope.NontroubledVehCount);
  			    } else {
    				// logout the user
    				$rootScope.logoutFun("TMS getProblematicVehCount - true");
  			    }
    			}
    			catch(error) {
    			    loading.finish();
    			    console.log("Error :"+error);
    			}
		    }, function(httpError){	 // Error block
    			loading.finish();
    			$rootScope.logoutFun("Error while processing request - getProblematicVehCount");
    			console.log("Error while processing request");
		    }, function(httpInProcess){		// In process
    			console.log(httpInProcess);
		    }
  		);
	    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.updatePieChart = function(troubledVehCount, nonTroubledVehCount){
	    $rootScope.troubledVehChartData = [{
    		name:'Bad Pressure & Temp ( '+ troubledVehCount +' )',
    		id: 'TroubledVehicles1',
    		y: troubledVehCount
    	    },{
    		name:'Good Pressure & Temp ( '+ (nonTroubledVehCount) +' )',
    		id: 'TroubledVehicles0',
    		y: nonTroubledVehCount
	    }];
	}

	$rootScope.innerIdForvehTyreChart = "innerIdForvehTyreChart";

	$scope.updatePieChart_vehTyreRelation = function(semiAssignedVehCount, remainingVehCount){
	    $rootScope.vehTyreAssignmentChartData = [
	    {
		name:' Incomplete ( '+ semiAssignedVehCount +' )',
		id: 'SemiConfigVehicles1',
		y: semiAssignedVehCount
	    },{
		name:' Complete ( '+ remainingVehCount +' )',
		id: 'SemiConfigVehicles0',
		y: remainingVehCount
	    }
	    ];
	}

	// Parse the vehicle response for view
	$rootScope.processVehDetailsForView = function(httpResponse, callback){
	    try {
		loading.finish();
		var allVehicles = new Array();
		if(httpResponse.data.status) {
		    angular.forEach(httpResponse.data.result, function(vehicle, key) {
			if (vehicle.tires != undefined && vehicle.tires.length < 6) {
			    var FLStatus = false;
			    var FRStatus = false;
			    var RLOStatus = false;
			    var RLIStatus = false;
			    var RRIStatus = false;
			    var RROStatus = false;
			    angular.forEach(vehicle.tires, function(tire, key1){
				if (tire.tirePosition == 'FL') {
				    FLStatus = true;
				} else if (tire.tirePosition == 'FR') {
				    FRStatus = true;
				} else if (tire.tirePosition == 'RLO') {
				    RLOStatus = true;
				} else if (tire.tirePosition == 'RLI') {
				    RLIStatus = true;
				} else if (tire.tirePosition == 'RRI') {
				    RRIStatus = true;
				} else if (tire.tirePosition == 'RRO') {
				    RROStatus = true;
				}
			    });
			    if (FLStatus ==  false) {
				var tire = new Object();
				tire.tirePosition = "FL";
				tire.tireId = 0;
				tire.tireNumber = '';
				vehicle.tires.push(tire);
			    }
			    if (FRStatus ==  false) {
				var tire = new Object();
				tire.tirePosition = "FR";
				tire.tireId = 0;
				tire.tireNumber = '';
				vehicle.tires.push(tire);
			    }
			    if (RLOStatus ==  false) {
				var tire = new Object();
				tire.tirePosition = "RLO";
				tire.tireId = 0;
				tire.tireNumber = '';
				vehicle.tires.push(tire);
			    }
			    if (RLIStatus ==  false) {
				var tire = new Object();
				tire.tirePosition = "RLI";
				tire.tireId = 0;
				tire.tireNumber = '';
				vehicle.tires.push(tire);
			    }
			    if (RRIStatus ==  false) {
				var tire = new Object();
				tire.tirePosition = "RRI";
				tire.tireId = 0;
				tire.tireNumber = '';
				vehicle.tires.push(tire);
			    }
			    if (RROStatus ==  false) {
				var tire = new Object();
				tire.tirePosition = "RRO";
				tire.tireId = 0;
				tire.tireNumber = '';
				vehicle.tires.push(tire);
			    }
			}
			if (vehicle.tyres != undefined && vehicle.tyres.length < 6) {
			    var FLStatus = false;
			    var FRStatus = false;
			    var RLOStatus = false;
			    var RLIStatus = false;
			    var RRIStatus = false;
			    var RROStatus = false;
			    angular.forEach(vehicle.tyres, function(tyre, key1){
				if (tyre.position == 'FL') {
				    FLStatus = true;
				} else if (tyre.position == 'FR') {
				    FRStatus = true;
				} else if (tyre.position == 'RLO') {
				    RLOStatus = true;
				} else if (tyre.position == 'RLI') {
				    RLIStatus = true;
				} else if (tyre.position == 'RRI') {
				    RRIStatus = true;
				} else if (tyre.position == 'RRO') {
				    RROStatus = true;
				}
			    });
			    if (FLStatus ==  false) {
				var tyre = new Object();
				tyre.position = "FL";
				tyre.tireId = 0;
				tyre.pressure = '0';
				tyre.temp = '0';
				vehicle.tyres.push(tyre);
			    }
			    if (FRStatus ==  false) {
				var tyre = new Object();
				tyre.position = "FR";
				tyre.tyreId = 0;
				tyre.pressure = '0';
				tyre.temp = '0';
				vehicle.tyres.push(tyre);
			    }
			    if (RLOStatus ==  false) {
				var tyre = new Object();
				tyre.position = "RLO";
				tyre.tyreId = 0;
				tyre.pressure = '0';
				tyre.temp = '0';
				vehicle.tyres.push(tyre);
			    }
			    if (RLIStatus ==  false) {
				var tyre = new Object();
				tyre.position = "RLI";
				tyre.tyreId = 0;
				tyre.pressure = '0';
				tyre.temp = '0';
				vehicle.tyres.push(tyre);
			    }
			    if (RRIStatus ==  false) {
				var tyre = new Object();
				tyre.position = "RRI";
				tyre.tyreId = 0;
				tyre.pressure = '0';
				tyre.temp = '0';
				vehicle.tyres.push(tyre);
			    }
			    if (RROStatus ==  false) {
    				var tyre = new Object();
    				tyre.position = "RRO";
    				tyre.tyreId = 0;
    				tyre.pressure = '0';
    				tyre.temp = '0';
    				vehicle.tyres.push(tyre);
			    }
  			}
  			allVehicles.push(vehicle);
	    });
	    callback(allVehicles);
		} else if(httpResponse.data.displayMsg == "Session Expired. Please login again") {
	    // Auto logout
	    logger.logWarning(httpResponse.data.displayMsg);
	    try {
  			deleteAllCookies();
	    } catch (e) {
  			console.log(e);
	    }
			$rootScope.logoutFun("TMS Vehicle View - false");
		} else {
		    logger.logWarning(httpResponse.data.displayMsg);
		}
	    } catch (e) { console.log(e); }
	}

	// loading the service first time
  $rootScope.getDashboardDetails(true, true, function(dashboardResponse) {
    $scope.getTroubledVehCount();
  });


	//Updating the service every 30 sec once
	var refreshInterval_tmsTroubledVeh = 30000;
	var updateTroubledVehCount = window.setInterval(function () {
	    $scope.getTroubledVehCount();
	}, refreshInterval_tmsTroubledVeh);

	$rootScope.clearInterval_tmsTroubledVeh = function(){
	    clearInterval(updateTroubledVehCount);
	    updateTroubledVehCount = undefined;
	}
    }]); // End of NavController


app.controller('SideNavController', ['$scope' ,'$rootScope', 'limitToFilter','APIServices',
    'DashboardDataSharingServices', '$state', '$cookieStore', '$location',
    function($scope, $rootScope, limitToFilter, APIServices, DashboardDataSharingServices, $state, $cookieStore, $location) {

    }]); // End of SideNavController


app.controller('TMSDashboardController', ['$scope', '$rootScope', '$state', 'APIServices',
    'DashboardDataSharingServices', '$location','$cookieStore', '$timeout', '$filter','logger',
    function($scope, $rootScope, $state, APIServices, DashboardDataSharingServices, $location, $cookieStore,
    $timeout, $filter, logger, $apply) {
	// TMS Dashboard Controller
	$rootScope.allVehicles = [];
	$rootScope.innerIdForTroubledChart = "innerIdForTroubledChart";
	$rootScope.innerIdForvehTyreChart = "innerIdForvehTyreChart";
	$rootScope.showSemiConfigVehData = false;

	$scope.getTroubledVehicles = function(id) {
	    if(id == 'TroubledVehicles1') {
          $rootScope.tempPressureType = "Bad";
	    } else {
          $rootScope.tempPressureType = "Good";
      }
      $timeout(function() { $location.url('/tyreTempPressure'); }, 100);
	}

	$scope.getSemiAssignedVehicles = function(id){
	    try {
		if(id == 'SemiConfigVehicles1'){
		    $rootScope.showSemiConfigVehData = true;
		    $timeout(function() { $location.url('/tms-vehicles'); }, 100);
		}
	    } catch (e) { loading.finish(); console.log(e); }
	}

	if($state.current.url == "/vehDetails") {
	    if($rootScope.allVehicles.length == 0 ) {
		$scope.getSemiAssignedVehicles('SemiConfigVehicles1');
	    }
	}

	$scope.getVehTyreDetails = function(id){
	    try {
    		$rootScope.tyreDetailsType = id;
    		$timeout(function() { $location.url('/tms-tyre'); }, 100);
	    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.getVehTyreInspectionDetail = function(id){
	    try {
		$timeout(function() { $location.url('/tmsTyreInspection'); }, 100);
	    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.getVehTyreServiceDetail = function(id){
	    try {
		$timeout(function() { $location.url('/tmsTyreService'); }, 100);
	    } catch (e) { loading.finish(); console.log(e); }
	}
    }]);


app.controller('TMSTempPressureController', ['$scope', '$rootScope', '$state', 'APIServices',
    'DashboardDataSharingServices', '$location','$cookieStore', '$timeout', '$filter','logger',
    function($scope, $rootScope, $state, APIServices, DashboardDataSharingServices, $location, $cookieStore,
    $timeout, $filter, logger, $apply) {
	try {
	    $rootScope.troubledVehiclesDetails = [];
	    $scope.callTroubledVehiclesAPI = function() {
		      try {
    		    APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getTPMSVehData?type='+$rootScope.tempPressureType, true)
    		    .then(
        			function(httpResponse) { 	// Success block
      			    try {
          				loading.finish();
          				if(httpResponse.data.status == true){
          				    var vehIdName_HashMap = DashboardDataSharingServices.getVehIdName_HashMap();
          				    $rootScope.processVehDetailsForView(httpResponse, function(response) {
              					console.log(response);
              					angular.forEach(response, function(troubledVehicle, key){
            					    troubledVehicle.vehName = vehIdName_HashMap[troubledVehicle.vehId];
            					    $rootScope.troubledVehiclesDetails.push(troubledVehicle);
              					});
              		    });
          				}
      			    }
      			    catch(error) {
          				loading.finish();
          				console.log("Error :"+error);
      			    }
        			}, function(httpError) {	// Error block
        			    loading.finish();
        			    console.log("Error while processing request");
        			}, function(httpInProcess){	// In process
        			    console.log(httpInProcess);
        			}
    		    );
      		} catch (e) { loading.finish(); console.log(e); }
  	    }

        $timeout(function() {$scope.callTroubledVehiclesAPI(); }, 1000);
    } catch(e){
	}
}]);
// end TMSTempPressureController


app.controller('TMSController', ['$scope', '$rootScope', '$state', 'APIServices',
    'DashboardDataSharingServices', '$location','$cookieStore', '$timeout', '$filter','logger',
    function($scope, $rootScope, $state, APIServices, DashboardDataSharingServices, $location, $cookieStore,
    $timeout, $filter, logger, $apply) {
	try {
	    $('#vehicleOrganizationId').select2({
		placeholder: "Select Organization",
		allowClear: true,
		width: 227
	    });
	    $('#vehicledepotId').select2({
		placeholder: "Select Depot",
		allowClear: true,
		width: 227
	    });
	    $('#vehicletyreId').select2({
		placeholder: "Select Tyre",
		allowClear: true,
		width: 227
	    });
	    $('#vehicletyrepositiontId').select2({
		placeholder: "Select Position",
		allowClear: true,
		width: 227
	    });
	    $('#vehiclerfidId').select2({
		placeholder: "Select RFID",
		allowClear: true,
		width: 227
	    });
	    $('#vehiclebluetoothId').select2({
		placeholder: "Select Bluetooth",
		allowClear: true,
		width: 227
	    });
	    $('#tyredepotId').select2({
		placeholder: "Select Depot",
		allowClear: true,
		width: 227
	    });
	    $('#tyremakeId').select2({
		placeholder: "Select Tyre Make",
		allowClear: true,
		width: 227
	    });
	    $('#sensorId').select2({
		placeholder: "Select Sensor UID",
		allowClear: true,
		width: 227
	    });

	    // Tyre assign to vehicle ddl
	    $('#FrontLeft_Id').select2({
		placeholder: "FrontLeft Tyre",
		allowClear: true,
		width: 230
	    });
	    $('#FrontRight_Id').select2({
		placeholder: "FrontRight Tyre",
		allowClear: true,
		width: 230
	    });
	    $('#RearLeftOuter_Id').select2({
		placeholder: "RearLeftOuter Tyre",
		allowClear: true,
		width: 230
	    });
	    $('#RearLeftInner_Id').select2({
		placeholder: "RearLeftInner Tyre",
		allowClear: true,
		width: 230
	    });
	    $('#RearRightOuter_Id').select2({
		placeholder: "RearRightOuter Tyre",
		allowClear: true,
		width: 230
	    });
	    $('#RearRightInner_Id').select2({
		placeholder: "RearRightInner Tyre",
		allowClear: true,
		width: 230
	    });

	    // Tire Inspection
	    $('#tyreNumberId').select2({
		placeholder: "Tyre Number",
		allowClear: true,
		width: 278
	    });
	    $('#serviceTyreId').select2({
		placeholder: "Tyre Number",
		allowClear: true,
		width: 235
	    });
	    $('#tyreScrapId').select2({
		placeholder: "Tyre Condition",
		allowClear: true,
		width: 235
	    });
	    $('#searchTyreId').select2({
		placeholder: "Tyre Number",
		allowClear: true,
		width: 227
	    });

	    $('#selectVehId_TMSVehFilter').select2({
		placeholder: "Select Vehicles",
		allowClear: true,
		width: 200
	    });

	    $('#vehicleStatusId').select2({
		placeholder: "Select Status",
		allowClear: true,
		width: 200
	    });

	    $('#tyrePosition_id').select2({
	 	placeholder: "Tyre Position",
	 	allowClear: true,
	 	width: 235
	    });
	    $('#selectedTMSServiceVeh_id').select2({
		placeholder: "Select Vehicle",
	 	allowClear: true,
	 	width: 235
	    });
	    $('#tyreTypeId').select2({
		placeholder: "Select Tyre Type",
		allowClear: true,
		width: 227
	    });
	    $('#location_id').select2 ({
	        placeholder: "Tyre Position",
	        allowClear: true,
	        width: 278
	    });
	    $('#deallocatedDeviceSelect_id').select2({
		placeholder: "Select Status",
		allowClear: true,
		width: 227
	    });

	    // Tyre status
	    $scope.tyreStatusList = ["InStock", "Retread", "Scrap"];
	    $scope.DeviceStatusList = ["InStock", "Scrap"];
	} catch (e) { console.log(e); }

	$scope.getTMSDepotList = function() {
	    try {
		$.ajax({
		    url: $rootScope.HOST_TMS + 'api/tms/getTMSDepotList',
		    type: "GET",
		    xhrFields: {withCredentials: true},
		    cache: false,
		    success: function (result, textStatus, request) {
			loading.finish();
			if(result.status == true) {
			    $rootScope.TMSDepotList = result.result;
			}
		    },
		    error: function (e) {
			$scope.getCaptchaImg();
			$scope.captcha = '';
			loading.finish();
			console.log("Error while processing request");
		    }
		});
	    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.DefaultTyreMakeId = 4; // JK Tyre
	$scope.tyreMakeList = function() {
	    try {
		APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getTyreMakeList', true)
 		.then(
 		    function(httpResponse){ // Success block
			try{
			    loading.finish();
			    if(httpResponse.data.status == true) {
				$rootScope.TMSTyreMakeList = httpResponse.data.result;
				angular.forEach($rootScope.TMSTyreMakeList, function (tyreMakeObj, key){
				    if(tyreMakeObj.tyreMake == "JK Tyre") {
					$scope.DefaultTyreMakeId = tyreMakeObj.tyreMakeId;
				    }
				});
			    }
 			}
 			catch(error) {
 			    loading.finish();
			    console.log("Error :"+error);
 			}
 		    }, function(httpError){	 // Error block
			loading.finish();
 			console.log("Error while processing request");
 		    }, function(httpInProcess){		// In process
			console.log(httpInProcess);
 		    }
 		);
	    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.getTMSOrganizationList = function() {
	    try {
		APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getTMSOrgList', true)
		.then(
		    function(httpResponse){ // Success block
			try{
			    loading.finish();
			    if(httpResponse.data.status == true) {
				$rootScope.TMSOrgList = httpResponse.data.result;
			    }
			}
			catch(error) {
			    loading.finish();
			    console.log("Error :"+error);
			}
		    }, function(httpError) { 	// Error block
			loading.finish();
			console.log("Error while processing request");
		    }, function(httpInProcess){	// In process
			console.log(httpInProcess);
		    }
		);
	    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.getTMSShortTireDetails = function() {
	    try {
		APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getTyreDetails?fullDetails=false', true)
		.then(
		    function(httpResponse){ // Success block
 			try{
			    loading.finish();
			    if(httpResponse.data.status == true) {
				$rootScope.TMSShortTiresList = httpResponse.data.result;
			    }
 			}
 			catch(error) {
 			    loading.finish();
 			}
 		    }, function(httpError){	 // Error block
			loading.finish();
 			console.log("Error while processing request");
 		    }, function(httpInProcess){		// In process
			console.log(httpInProcess);
 		    }
 		);
	    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.tmsVehViewOrgId = 0
	$scope.getTMSShortVehDetails = function() {
	    try {
		APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getBasicVehDetails?orgId='+$scope.tmsVehViewOrgId, true)
		.then(
		    function(httpResponse){ // Success block
 			try {
 			    loading.finish();
			    if(httpResponse.data.status == true) {
				$rootScope.TMSShortVehList = httpResponse.data.result;
			    }
 			}
 			catch(error) {
 			    loading.finish();
 			}
 		    }, function(httpError){	 // Error block
			loading.finish();
 			console.log("Error while processing request");
 		    }, function(httpInProcess){		// In process
			console.log(httpInProcess);
 		    }
 		);
	    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.getTMSDepotList();
	$scope.tyreMakeList();
	$scope.getTMSOrganizationList();
	$scope.getTMSShortTireDetails();
	$scope.getTMSShortVehDetails();

	$scope.addNewDepot = function() {
	    try {
		if($scope.newDepotName != undefined && $scope.newDepotName != "" && $scope.newDepotName.length > 0) {
		    APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/addDepot?depotName='+$scope.newDepotName, true)
		    .then(
	 		function(httpResponse){ // Success block
			    try {
	 			loading.finish();
				if(httpResponse.data.status == true) {
				    logger.logSuccess('Depot added successfully');
				    $scope.getTMSDepotList();
				    $('#depot-popup').hide();
				    $('#create_NewDepot').val('');
				} else {
				    logger.logError(httpResponse.data.displayMsg);
				}
	 		    }
			    catch(error) {
	 			loading.finish();
	 			console.log("Error :"+error);
	 		    }
	 		}, function(httpError) {	// Error block
			    loading.finish();
	 		    console.log("Error while processing request");
	 		}, function(httpInProcess){	// In process
			    console.log(httpInProcess);
	 		}
	 	    );
		} else {
		    logger.logError("Please enter Depot Name");
		}
	    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.addNewOrg = function() {
	    try {
		if($scope.TMSVehNewOrgName != undefined && $scope.TMSVehNewOrgName != "" && $scope.TMSVehNewOrgName.length > 0 ){
		    APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/addOrganization?orgName='+$scope.TMSVehNewOrgName, true)
		    .then(
			function(httpResponse){ // Success block
			    try{
				loading.finish();
				if(httpResponse.data.status == true) {
				    logger.logSuccess('Organization added successfully');
				    $scope.getTMSOrganizationList();
				    $('#org-popup').hide();
				    $('#create_NewOrg').val('');
				} else {
				    logger.logError(httpResponse.data.displayMsg);
				}
			    }
			    catch(error) {
				loading.finish();
				console.log("Error :"+error);
			    }
			}, function(httpError){	 	// Error block
			    loading.finish();
			    console.log("Error while processing request");
			}, function(httpInProcess){	// In process
			    console.log(httpInProcess);
			}
		    );
		} else{
		    logger.logError("Please enter Organization Name");
		}
	    } catch (e) { loading.finish(); console.log(e); }
	}

	// Vehicle Code Starts here
	$scope.totalItems_vehicles = 0;
	$scope.currentPage_vehicles = 1;
	$scope.itemsPerPage_vehicles = 10;
	$scope.maxSize_vehicles = 3;

	$scope.pageChanged_vehicles = function(){
	    $scope.nextIndex_vehicles = ($scope.currentPage_vehicles - 1) * $scope.itemsPerPage_vehicles;
	    if($rootScope.showSemiConfigVehData == true){
		$scope.getAllTMSVehiclesDetails($scope.nextIndex_vehicles, $scope.searchStringForVeh, "semi");
	    } else {
		$scope.getAllTMSVehiclesDetails($scope.nextIndex_vehicles, $scope.searchStringForVeh, "all");
	    }
	}

	$scope.getTMSVehicles = function(id){
    if(id == "semi"){
  		$rootScope.showSemiConfigVehData = true;
    } else {
  		$rootScope.showSemiConfigVehData = false;
    }
    $scope.currentPage_vehicles = 1;
    $scope.pageChanged_vehicles();
	}

	$scope.getSemiConfiguredVehicles = function(startIndex) {
	    APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getSemiConfiguredVehicles?limit='+$scope.itemsPerPage_vehicles+'&startIndex='+startIndex, true)
	    .then(
    		function(httpResponse) { // Success block
  		    try {
      			loading.finish();
      			$scope.totalItems_vehicles = httpResponse.data.count;
      			$rootScope.processVehDetailsForView(httpResponse, function(response) {
      			    $rootScope.allVehicles = response;
      			});
  			    $location.url('/tms-vehicles');
  		    }
  		    catch(error) {
      			loading.finish();
      			console.log("Error :"+error);
  		    }
    		}, function(httpError) { 	// Error block
    		    loading.finish();
    		    console.log("Error while processing request");
    		}, function(httpInProcess){	// In process
    		    console.log(httpInProcess);
    		}
    );
	}

	$scope.getAllTMSVehiclesDetails = function(nextIndex_vehicle, searchWord, configType) {
	    $rootScope.allVehicles = new Array();
	    try	{
		if(configType == undefined || configType == "" || configType.length == 0){
		    configType = "all";
		}
		var request = {
		    limit : $scope.itemsPerPage_vehicles,
		    startIndex: nextIndex_vehicle,
		    configType: configType
		}
		if(searchWord != undefined && searchWord != null && searchWord.trim().length > 0){
		    // Seach vehicles
		    request = {
			limit : $scope.itemsPerPage_vehicles,
			startIndex: nextIndex_vehicle,
			searchWord: searchWord,
			configType: configType
		    }
		}

		APIServices.callAPI($rootScope.HOST_TMS + 'api/tms/getVehicles', request, true)
		.then(
		    function(httpResponse){ // Success block
			try{
			    if (httpResponse.data.status) {
			        if (httpResponse.data.result.length > 0) {
				    $rootScope.processVehDetailsForView(httpResponse, function(response){
					$rootScope.allVehicles = response;
				    });
				    $scope.totalItems_vehicles = httpResponse.data.count;
				} else {
				    $rootScope.allVehicles = [];
				    $scope.totalItems_vehicles = 0;
				}
			    }
			}
			catch(error) {
			    loading.finish();
			    console.log("Error :"+error);
			}
		    }, function(httpError){	 // Error block
			loading.finish();
			console.log("Error while processing request");
		    }, function(httpInProcess){		// In process
			console.log(httpInProcess);
		    }
		);
	    } catch(err) {
		loading.finish();
		console.log(err);
	    }
	}

	$scope.addedEmptyTireFun = function(vehicleDetails){
	    try {
		if (vehicleDetails.tires != undefined && vehicleDetails.tires.length < 6) {
		    var FLStatus = false;
		    var FRStatus = false;
		    var RLOStatus = false;
		    var RLIStatus = false;
		    var RRIStatus = false;
		    var RROStatus = false;
		    if(vehicleDetails.tires != undefined || vehicleDetails.tires.length > 0){
			angular.forEach(vehicleDetails.tires, function(tire, key1){
			    if (tire.tirePosition == 'FL') {
				FLStatus = true;
			    } else if (tire.tirePosition == 'FR') {
				FRStatus = true;
			    } else if (tire.tirePosition == 'RLO') {
				RLOStatus = true;
			    } else if (tire.tirePosition == 'RLI') {
				RLIStatus = true;
			    } else if (tire.tirePosition == 'RRI') {
				RRIStatus = true;
			    } else if (tire.tirePosition == 'RRO') {
				RROStatus = true;
			    }
			});
		    }
		    if (FLStatus ==  false) {
			var tire = new Object();
			tire.tirePosition = "FL";
			tire.tireId = 0;
			tire.tireNumber = '';

			vehicleDetails.tires.push(tire);
		    }
		    if (FRStatus ==  false) {
			var tire = new Object();
			tire.tirePosition = "FR";
			tire.tireId = 0;
			tire.tireNumber = '';
			vehicleDetails.tires.push(tire);
		    }
		    if (RLOStatus ==  false) {
			var tire = new Object();
			tire.tirePosition = "RLO";
			tire.tireId = 0;
			tire.tireNumber = '';
			vehicleDetails.tires.push(tire);
		    }
		    if (RLIStatus ==  false) {
			var tire = new Object();
			tire.tirePosition = "RLI";
			tire.tireId = 0;
			tire.tireNumber = '';
			vehicleDetails.tires.push(tire);
		    }
		    if (RRIStatus ==  false) {
			var tire = new Object();
			tire.tirePosition = "RRI";
			tire.tireId = 0;
			tire.tireNumber = '';
			vehicleDetails.tires.push(tire);
		    }
		    if (RROStatus ==  false) {
			var tire = new Object();
			tire.tirePosition = "RRO";
			tire.tireId = 0;
			tire.tireNumber = '';
			vehicleDetails.tires.push(tire);
		    }
		}
		return vehicleDetails;
	    } catch (e) { console.log(e); }
	}

	var timer_vehicles = false
	$scope.searchvehicles = function() {
	    if(timer_vehicles){
		$timeout.cancel(timer_vehicles)
	    }
	    timer_vehicles= $timeout(function(){
		$scope.pageChanged_vehicles();
	    },1000);
	};

	$scope.showVehicleAddingForm = false;
	$scope.tmsVehicleAddingFormClose = function(){
	    $scope.showVehicleAddingForm = false;
	}

	$scope.showVehicleAddingFormForAdd = function() {
	    try {
		$('#showTMSVehicleModalId').modal('show');
		$rootScope.getTMSAllBController('InStock');
		$rootScope.getTMSAllRFID('InStock');
		$scope.getTMSAllTyres('InStock');
		$scope.TMSVehName = '';
		$scope.TMSVehOrgId = '';
		$scope.TMSVehDepotId = '';
		$scope.TMSVehRFID = '';
		$scope.TMSVehBControlerId = '';
		$scope.showVehicleAddingForm = true;
		$scope.addVehButtonStatus = true;
		$scope.updateVehButtonStatus = false;

		// clearing variables
		$scope.TMSVehRFUID = undefined;
		$scope.TMSVehBControlerUID = undefined;
	    } catch (e) { console.log(e); }
	    try {
		$('#vehiclerfidId').select2('val', '');
	    } catch (e) { }
	    try {
		$('#vehicleOrganizationId').select2('val', '');
	    } catch (e) { }
	    try {
		$('#vehicledepotId').select2('val', '');
	    } catch (e) { }
	    try {
		$('#vehiclebluetoothId').select2('val', '');
	    } catch (e) { }
	}

	$scope.getVehDetailsFormForUpdate = function(TMSVehDetails) {
	    $('#showTMSVehicleModalId').modal('show');
	    $rootScope.getTMSAllBController('InStock');
	    $rootScope.getTMSAllRFID('InStock');
	    $scope.getTMSAllTyres('InStock');

	    $scope.TMSVehDetailsUpdate = TMSVehDetails;
	    $scope.TMSVehName = TMSVehDetails.vehName;
	    $scope.TMSVehOrgId = TMSVehDetails.orgId;
	    $scope.TMSVehDepotId = TMSVehDetails.depotId;
	    $scope.TMSVehRFID = TMSVehDetails.rfid;
	    $scope.TMSVehBControlerId = TMSVehDetails.controllerID;
	    $scope.TMSVehRFUID = TMSVehDetails.rfiduid;
	    $scope.TMSVehBControlerUID = TMSVehDetails.controllerUID;

	    $scope.showVehicleAddingForm = true;
	    $scope.addVehButtonStatus = false;
	    $scope.updateVehButtonStatus = true;

	    try {
		// $("#vehicleOrganizationId").select2('val', $scope.TMSVehOrgId).trigger('change');
		$("#vehicleOrganizationId").val($scope.TMSVehOrgId).trigger('change');
	    } catch (e) { }
	    try {
		$("#vehicledepotId").val($scope.TMSVehDepotId).trigger('change');
	    } catch (e) { }
	    try {
		$("#vehiclerfidId").val($scope.TMSVehRFID).trigger('change');
	    } catch (e) { }
	    try {
		$("#vehiclebluetoothId").val($scope.TMSVehBControlerId).trigger('change');
	    } catch (e) { }
	}

	$scope.deallocatedDeviceStatus = $scope.DeviceStatusList[0];
	$scope.removeBTUID = function(TMSVehBControlerUID) {
	    $scope.deallocatedDeviceNo = TMSVehBControlerUID;
	    $scope.deallocatedVehNo = $scope.TMSVehName;
	    $('#deallocatedBTRFIDModalId').modal('show');
	}

	$scope.deallocatedDevice = function() {
	    try {
		if($scope.deallocatedDeviceNo == $scope.TMSVehDetailsUpdate.controllerUID){
		    // Deallocating Bluetooth Controller
		    $scope.callDeallocatedDeviceAPI($scope.TMSVehDetailsUpdate.vehId, $scope.TMSVehDetailsUpdate.vehName,
		    0, $scope.TMSVehDetailsUpdate.controllerID, $scope.deallocatedDeviceStatus);
		} else {
		    // Deallocating RFID
		    $scope.callDeallocatedDeviceAPI($scope.TMSVehDetailsUpdate.vehId, $scope.TMSVehDetailsUpdate.vehName,
		     $scope.TMSVehDetailsUpdate.rfid, 0, $scope.deallocatedDeviceStatus);
		}
	    } catch (e) { console.log(e); }
	}

	$scope.callDeallocatedDeviceAPI = function(vehId, vehName, RFID, ControllerId, status){
	    try {
		var params = "vehId="+vehId+"&vehName="+vehName+"&RFID="+RFID+"&ControllerId="+ControllerId
			+"&status="+status;
		APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Vehicle/deallocateDevice?'+params, true)
		.then(
		    function(httpResponse){ // Success block
			try{
			    loading.finish();
			    if(httpResponse.data.status) {
				$scope.pageChanged_vehicles();
				logger.logSuccess('deallocated successfully');
				$('#deallocatedBTRFIDModalId').modal('hide');
				if($scope.deallocatedDeviceNo == $scope.TMSVehDetailsUpdate.controllerUID){
				    // Deallocating Bluetooth Controller
				    $scope.TMSVehDetailsUpdate.controllerUID = "";
				    $scope.TMSVehDetailsUpdate.controllerID = 0;
				} else {
				    // Deallocating RFID
				    $scope.TMSVehDetailsUpdate.rfiduid = "";
				    $scope.TMSVehDetailsUpdate.rfid = 0;
				}
				$('#showTMSVehicleModalId').modal('show');
				scope.getVehDetailsFormForUpdate($scope.TMSVehDetailsUpdate);
			    } else {
				logger.logError(httpResponse.data.displayMsg);
			    }
			}
			catch(error) {
			    loading.finish();
			    console.log("Error :"+error);
			}
		    }, function(httpError) {	// Error block
			loading.finish();
			console.log("Error while processing request");
		    }, function(httpInProcess){	// In process
			console.log(httpInProcess);
		    }
		);
	    } catch (e) { console.log(e); }
	}

	$scope.addNewVehicle = function() {
    try {
  		$scope.TMSVehOrgId = 1;
      if ($scope.TMSVehName == null || $scope.TMSVehName == undefined) {
		    logger.logError("Enter Vehicle Name");
    	} else if ($scope.TMSVehDepotId == null || $scope.TMSVehDepotId == undefined) {
    	    logger.logError("Select Depot");
    	} else if ($scope.TMSVehOrgId == null || $scope.TMSVehOrgId == undefined) {
    	    logger.logError("Select Organization");
    	} else {
		    if( $scope.TMSVehRFID == undefined || $scope.TMSVehRFID == null) {
		        $scope.TMSVehRFID = "";
		    }
		    if($scope.TMSVehBControlerId == undefined || $scope.TMSVehBControlerId == null) {
		        $scope.TMSVehBControlerId = "";
		    }
		    loading.start();
		    var params = "vehName=" + $scope.TMSVehName + "&depotId=" + $scope.TMSVehDepotId + "&orgId="
			    + $scope.TMSVehOrgId + "&RFID=" + $scope.TMSVehRFID + "&ControllerId=" + $scope.TMSVehBControlerId;
		    APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Vehicle/Add?'+params, true)
		    .then(
    			function(httpResponse){ // Success block
  			    try{
      				loading.finish();
      				if(httpResponse.data.status) {
      				    $scope.pageChanged_vehicles();
      				    logger.logSuccess('Vehicle added successfully');
      				    $('#showTMSVehicleModalId').modal('hide');
      				     $rootScope.getDashboardDetails(true, false);
      				} else {
      				    logger.logError(httpResponse.data.displayMsg);
      				}
  			    }
  			    catch(error) {
      				loading.finish();
      				console.log("Error :"+error);
  			    }
    			}, function(httpError) {	// Error block
    			    loading.finish();
    			    console.log("Error while processing request");
    			}, function(httpInProcess){	// In process
    			    console.log(httpInProcess);
    			}
		    );
  		}
    } catch(err){
  		loading.finish();
  		console.log(err);
    }
	}

	$scope.updateVehDetailsFun = function() {
	    try {
		$scope.TMSVehOrgId = 1;
		if($scope.TMSVehRFID == undefined || $scope.TMSVehRFID == null || $scope.TMSVehRFID.length == 0) {
		    $scope.TMSVehRFID = 0;
		}
		if($scope.TMSVehBControlerId == undefined || $scope.TMSVehBControlerId == null || $scope.TMSVehBControlerId.length == 0) {
		    $scope.TMSVehBControlerId = 0;
		}
		var UPDATE_URL =$rootScope.HOST_TMS + 'api/tms/Vehicle/Update?vehId='
		+$scope.TMSVehDetailsUpdate.vehId+'&vehName='+$scope.TMSVehName+'&depotId='+$scope.TMSVehDepotId
		+'&orgId='+$scope.TMSVehOrgId+'&RFID='+$scope.TMSVehRFID+'&ControllerId='+$scope.TMSVehBControlerId;

		APIServices.callGET_API(UPDATE_URL, true)
		.then(
		    function(httpResponse){ // Success block
			try{
			    loading.finish();
			    if(httpResponse.data.status == true) {
				$('#showTMSVehicleModalId').modal('hide');
				logger.logSuccess('Vehicle updated successfully');
				$scope.pageChanged_vehicles();
			    }
			    else {
				logger.logError(httpResponse.data.displayMsg);
			    }
			}
			catch(error) {
			    loading.finish();
			    console.log("Error :"+error);
			}
		    }, function(httpError) {	// Error block
			loading.finish();
			console.log("Error while processing request");
		    }, function(httpInProcess){		// In process
			console.log(httpInProcess);
		    }
		);
	    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.AssignTyreVehName = "";

	// Show popup for assign tyres to vehicle
	$scope.getTyreDetailsForAssignVehicle = function(TMSVehDetails){
	    $('#showTyreAssignModalId').modal('show');
			$scope.assignTyreVehDetails = TMSVehDetails;
			$scope.getTMSAllTyres('InStock');
			$scope.AssignTyreVehName = $scope.assignTyreVehDetails.vehName;
			$scope.FLTyreId = 0;
			$scope.FRTyreId = 0;
			$scope.RLOTyreId = 0;
			$scope.RLITyreId = 0;
			$scope.RRITyreId = 0;
			$scope.RROTyreId = 0;
			$scope.existing_tyreFL = undefined;
			$scope.existing_tyreFR = undefined;
			$scope.existing_tyreRLO = undefined;
			$scope.existing_tyreRLI = undefined;
			$scope.existing_tyreRRI = undefined;
			$scope.existing_tyreRRO = undefined;
			try {
				angular.forEach($scope.assignTyreVehDetails.tires, function(tire, key){
					if (tire.tirePosition == 'FL') {
						$scope.existing_tyreFL = tire.tireNumber;
					}
					if (tire.tirePosition == 'FR') {
						$scope.existing_tyreFR = tire.tireNumber;
					}
					if (tire.tirePosition == 'RLO') {
						$scope.existing_tyreRLO = tire.tireNumber;
					}
					if (tire.tirePosition == 'RLI') {
						$scope.existing_tyreRLI = tire.tireNumber;
					}
					if (tire.tirePosition == 'RRI') {
						$scope.existing_tyreRRI = tire.tireNumber;
					}
					if (tire.tirePosition == 'RRO') {
						$scope.existing_tyreRRO = tire.tireNumber;
					}
				});

				try {
				    $('#FrontLeft_Id').select2('val', 0);
						// $("#FrontLeft_Id").val($scope.FLTyreId).trigger('change');
				} catch (e) {  }
				try {
				    $('#FrontRight_Id').select2('val', 0);
						// $("#FrontRight_Id").val($scope.FRTyreId).trigger('change');
				} catch (e) {  }
				try {
				    $('#RearLeftOuter_Id').select2('val', 0);
						// $("#RearLeftOuter_Id").val($scope.RLOTyreId).trigger('change');
				} catch (e) {  }
				try {
				    $('#RearLeftInner_Id').select2('val', 0);
						// $("#RearLeftInner_Id").val($scope.RLITyreId).trigger('change');
				} catch (e) {  }
				try {
				    $('#RearRightInner_Id').select2('val', 0);
						// $("#RearRightInner_Id").val($scope.RRITyreId).trigger('change');
				} catch (e) {  }
				try {
				    $('#RearRightOuter_Id').select2('val', 0);
						// $("#RearRightOuter_Id").val($scope.RROTyreId).trigger('change');
				} catch (e) {  }
			} catch (e) { console.log(e); }
	}

	// Assign Tyres to Vehicle
	$scope.assignTyres = function(){
		try {
			var TyreAssing_URL =$rootScope.HOST_TMS + 'api/tms/assignTyres?';
			var param = "vehId="+$scope.assignTyreVehDetails.vehId;

			if($scope.FLTyreId != undefined && $scope.FLTyreId > 0)
			{
				param = param+"&tyreId1="+$scope.FLTyreId+"&tyrePosition1=FL";
			}
			if($scope.FRTyreId != undefined || $scope.FRTyreId > 0)
			{
				param = param+"&tyreId2="+$scope.FRTyreId+"&tyrePosition2=FR"
			}
			if($scope.RLOTyreId != undefined || $scope.RLOTyreId > 0)
			{
				param = param+"&tyreId3="+$scope.RLOTyreId+"&tyrePosition3=RLO"
			}
			if($scope.RLITyreId != undefined || $scope.RLITyreId > 0)
			{
				param = param+"&tyreId4="+$scope.RLITyreId+"&tyrePosition4=RLI"
			}
			if($scope.RRITyreId != undefined || $scope.RRITyreId > 0)
			{
				param = param+"&tyreId5="+$scope.RRITyreId+"&tyrePosition5=RRI"
			}
			if($scope.RROTyreId != undefined || $scope.RROTyreId > 0)
			{
				param = param+"&tyreId6="+$scope.RROTyreId+"&tyrePosition6=RRO"
			}
			APIServices.callGET_API(TyreAssing_URL+param, true)
		 .then(
			 function(httpResponse){ // Success block
				 try{
					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess('Tyres Assigned successfully');
						 $scope.pageChanged_vehicles();
						 $scope.assignTyreVehDetails1 = $scope.addedEmptyTireFun(httpResponse.data.result[0]);
						 $timeout(function () {
							 $scope.getTyreDetailsForAssignVehicle($scope.assignTyreVehDetails1);
						 }, 1000);
					 }
					 else {
						logger.logError(httpResponse.data.displayMsg);
					 }
				 }
				 catch(error)
				 {
					 loading.finish();
					 console.log("Error :"+error);
				 }
			 }, function(httpError) // Error block
			 {
				 loading.finish();
				 console.log("Error while processing request");
			 }, function(httpInProcess)// In process
			 {
				 console.log(httpInProcess);
			 }
		 );
		} catch (e) { console.log(e); }
	}

	$scope.addNewTyreService = function(vehId, FLTyreId, FRTyreId, RLOTyreId, RLITyreId, RRITyreId, RROTyreId){

		$scope.newTyreServiceTireList = new Array();
		try {
			if(vehId == undefined && vehId < 1){
				alert("Please select vehicle");
			} else{
				if(FLTyreId != undefined && FLTyreId > 0){
					var obj = { tyreId:FLTyreDetials.tireId, vehId : vehId,
										fittedDate: '10/01/2016', kmsAtTireFitted: 25000, location:'FL'};
					$scope.newTyreServiceTireList.push(obj);
				}
				// Loop it and save the service details
				angular.forEach($scope.newTyreServiceTireList, function(serviceDetails, key){

					var params = "tireId="+serviceDetails.tyreId+"&depot="+serviceDetails.tyreId+"&tireMake="+serviceDetails.tyreId
							+"&vehId="+serviceDetails.tyreId+"&fittedDate="+fittedDate
							+"&kmsAtTireFitted="+serviceDetails.tyreId+"&location="+$scope.tyreServiceTyreLocation;
					APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Tire/addServiceHistory?'+params, true)
				 .then(
					 function(httpResponse){ // Success block
						 try{
							 loading.finish();
							 if(httpResponse.data.status == true)
							 {
								 logger.logSuccess(httpResponse.data.displayMsg);
								 $scope.pageChanged_services();
								 $('#showTMSTyreServiceModalId').modal('hide');
							 } else {
								logger.logError(httpResponse.data.displayMsg);
							 }
						 }
						 catch(error)
						 {
							 loading.finish();
							 console.log("Error :"+error);
						 }
					 }, function(httpError) // Error block
					 {
						 loading.finish();
						 console.log("Error while processing request");
					 }, function(httpInProcess)// In process
					 {
						 console.log(httpInProcess);
					 }
				 );
				});
			}
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.getServiceDetails = function(serviceId, callback){
		try {
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Tire/getServiceDetailsById?serviceId='+serviceId, true)
		 .then(
			 function(httpResponse){ // Success block
				 try{
					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 callback(httpResponse.data.result[0]);
					 }
				 } catch (e) { console.log(e)}
			 }, function(httpError) // Error block
			 {
				 loading.finish();
				 console.log("Error while processing request");
			 }
			 );
		} catch (e) { console.log(e)}
	}

	$scope.lastServicefitmentDate = 31516200000;
	$scope.deallocateTyre = function(deallocateTyreNumber) {
		// Set default value
		$scope.deallocatedTyreStatus = $scope.tyreStatusList[0];
		$scope.actionTaken = "";
		$scope.tyreRemovedKms = "";
		$scope.tyreCondition = "";
		$scope.reason = "";
		$scope.tyreScrappedParty = "";
		$scope.depthLocation1 = 0;
		$scope.depthLocation2 = 0;
		$scope.depthLocation3 = 0;
		$scope.TyrePressure = 0;
		try{
		    $("#tyreScrapCondition").val("").trigger('change');
		} catch(e){ console.log(e); }
		try{
		    $("#vehicleStatusId").val($scope.deallocatedTyreStatus).trigger('change');
		} catch(e){ console.log(e); }

		$scope.deallocatedTyreNo = deallocateTyreNumber;
		$scope.deallocatedVehNo = $scope.assignTyreVehDetails.vehName;
		angular.forEach($scope.assignTyreVehDetails.tires, function(tire, key){
			if(tire.tireNumber == $scope.deallocatedTyreNo){
				// Get service details
				$scope.getServiceDetails(tire.lastServiceId, function(res) {
					$scope.lastServiceDetails = res;
					$scope.fittedKms = $scope.lastServiceDetails.kmsAtTyreFitted;
					$scope.lastServicefitmentDate = $scope.lastServiceDetails.fittedDate;
				});
			}
		});
		$('#deallocatedTyreStatusModalId').modal('show');
	}

	$scope.updateDeallocatedTyreStatus = function(){
		$scope.serviceAvgThreadDepth = 0;
		var tyreRemovalDate = moment($("#tyreRemoveDate").val(), "D/M/YYYY").valueOf();
		try {
			angular.forEach($scope.assignTyreVehDetails.tires, function(tire, key){
				if(tire.tireNumber == $scope.deallocatedTyreNo){
					$scope.callDeallocateTyreAPI(tire.tireId, $scope.assignTyreVehDetails.vehId,
						 $scope.deallocatedTyreStatus, tire, tyreRemovalDate, $scope.actionTaken,
						 $scope.tyreRemovedKms, $scope.tyreCondition, $scope.reason, $scope.tyreScrappedParty,
					 	 $scope.depthLocation1, $scope.depthLocation2, $scope.depthLocation3, $scope.TyrePressure);
				}
			});
		} catch (e) { console.log(e); }
	}

	$scope.serviceAvgThreadDepth = 0;
	$("#threadDepth1_id").blur(function() {
		$scope.serviceAvgThreadDepth = $scope.avgFinder($scope.depthLocation1,
			$scope.depthLocation2, $scope.depthLocation3);
		$scope.$apply();
	});
	$("#threadDepth2_id").blur(function() {
		$scope.serviceAvgThreadDepth = $scope.avgFinder($scope.depthLocation1,
			$scope.depthLocation2, $scope.depthLocation3);
		$scope.$apply();
	});
	$("#threadDepth3_id").blur(function() {
		$scope.serviceAvgThreadDepth = $scope.avgFinder($scope.depthLocation1,
			$scope.depthLocation2, $scope.depthLocation3);
		$scope.$apply();
	});

	$scope.callDeallocateTyreAPI = function(tyreId, vehId, status, tire, tyreRemovalDate,
		actionTaken, tyreRemovedKms, tyreCondition, reason, tyreScrappedParty,depthLocation1, depthLocation2,
		depthLocation3, tyrePressure){
		try{
			var params = "tyreId="+tyreId+"&vehId="+vehId+"&status="+status
					+ "&removalDate="+tyreRemovalDate+"&removalKM="+tyreRemovedKms+"&reason="+reason
					+ "&action="+actionTaken+"&tyreCondition="+tyreCondition+"&scrappedParty="+tyreScrappedParty
					+ "&depthLocation1="+depthLocation1+"&depthLocation2="+depthLocation2
					+ "&depthLocation3="+depthLocation3+"&tirePressure="+tyrePressure;

			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/deallocateTyre?'+params, true)
		 .then(
			 function(httpResponse){ // Success block
				 try{
					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						  logger.logSuccess('Deallocated the tyre successfully');
						  $scope.pageChanged_vehicles();
							$scope.assignTyreVehDetails1 = $scope.addedEmptyTireFun(httpResponse.data.result[0]);
							$('#deallocatedTyreStatusModalId').modal('hide');
							$timeout(function () {
							  $scope.getTyreDetailsForAssignVehicle($scope.assignTyreVehDetails1);
							}, 1000);
					 }
					 else {
						logger.logError(httpResponse.data.displayMsg);
					 }
				 }
				 catch(error)
				 {
					 loading.finish();
					 console.log("Error :"+error);
				 }
			 }, function(httpError) // Error block
			 {
				 loading.finish();
				 console.log("Error while processing request");
			 }, function(httpInProcess)// In process
			 {
				 console.log(httpInProcess);
			 }
		 );
		} catch (e) { console.log(e); }
	}

	$scope.showNewTyreServiceForm = function(selectedTyreId, position){
		if(selectedTyreId != undefined && selectedTyreId != "" && selectedTyreId > 0){
			tyre = $filter('filter')($rootScope.TMSAllTyres, {'tireId':selectedTyreId})
			if(tyre[0] != undefined){
				$scope.fittedTyrePosition = position;
				$scope.assignTyreDetails = tyre[0]
				$scope.allocatedTyreNo = $scope.assignTyreDetails.tireNumber;
				$scope.allocatedVehNo = $scope.assignTyreVehDetails.vehName;
				$('#allocatedTyreModalId').modal('show');
			}
		}
	}

	var fittedDate = moment(new Date()).format("DD-MM-YYYY");
	$('#tyreFitmentDate').val(fittedDate);

	$scope.assignTyreToVehicle = function(){
		try {
			var fittedDate = moment($("#tyreFitmentDate").val(), "D/M/YYYY").valueOf();
			var TyreAssing_URL =$rootScope.HOST_TMS + 'api/tms/assignTyreToVeh?';
			var param = "vehId="+$scope.assignTyreVehDetails.vehId+"&tyreId="+$scope.assignTyreDetails.tireId
									+"&tyrePosition="+$scope.fittedTyrePosition+"&fitmentDate="+fittedDate
									+"&fitmentKM="+$scope.tyreFitmentKM;
			APIServices.callGET_API(TyreAssing_URL+param, true)
		 .then(
			 function(httpResponse){ // Success block
				 try{
					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess('Tyres Assigned successfully');
						 $scope.pageChanged_vehicles();
						 $scope.assignTyreVehDetails1 = $scope.addedEmptyTireFun(httpResponse.data.result[0]);
						 $('#allocatedTyreModalId').modal('hide');

						 // Reset to default
						 $scope.tyreFitmentKM = '';
						 var fittedDate = moment(new Date()).format("DD-MM-YYYY");
						 $('#tyreFitmentDate').val(fittedDate);

						 $timeout(function () {
							 $scope.getTyreDetailsForAssignVehicle($scope.assignTyreVehDetails1);
						 }, 500);
					 }
					 else {
						logger.logError(httpResponse.data.displayMsg);
					 }
				 }
				 catch(error)
				 {
					 loading.finish();
					 console.log("Error :"+error);
				 }
			 }, function(httpError) // Error block
			 {
				 loading.finish();
				 console.log("Error while processing request");
			 }, function(httpInProcess)// In process
			 {
				 console.log(httpInProcess);
			 }
		 );
	 } catch (e) { console.log(e); }
	}

	// Tire code starts Here
	$scope.addTireButtonStatus = true;
	$rootScope.TMSAllTyres = new Array();
	// $scope.tmsTyre_sortReverse = true;

	$scope.totalItems_tyres = 0;
	$scope.currentPage_tyres = 1;
	$scope.itemsPerPage_tyres = 10;
	$scope.maxSize_tyres = 3;

	$scope.setTyreDetailsType = function(id){
	    $rootScope.tyreDetailsType = id;
	    $scope.pageChanged_tyres();
	}

	$scope.pageChanged_tyres = function(){
		$scope.nextIndex_tyres = ($scope.currentPage_tyres - 1) * $scope.itemsPerPage_tyres;
		$scope.getTMSAllTyres($rootScope.tyreDetailsType, $scope.nextIndex_tyres, true, $scope.searchStringForTyre);
	}

	$scope.getTMSAllTyres = function(status, nextIndex_tyres, fullDetailsStatus, searchString_tyres)
	{

		try {
			var param = "";
			if(fullDetailsStatus == true){
				param = "fullDetails="+true;
			} else{
				param = "fullDetails="+false;
			}
			if (status != undefined && status != null) {
					    param = param+"&status="+status;
			}
			if(nextIndex_tyres != undefined && nextIndex_tyres != null)
			{
				param = param +"&limit="+$scope.itemsPerPage_tyres+"&startIndex="+nextIndex_tyres;
			}
			if(searchString_tyres != undefined && searchString_tyres != null && searchString_tyres != ""
					&& searchString_tyres.trim().length > 0){
						param = param + "&searchString="+searchString_tyres
			}

			if($rootScope.TMSDepotList == undefined || $rootScope.TMSDepotList.length == 0) {
				$scope.getTMSDepotList();
			}
		} catch (e) { console.log(e); }

		try {
			if($rootScope.TMSTyreMakeList == undefined || $rootScope.TMSTyreMakeList.length == 0) {
				$scope.tyreMakeList();
			}
		} catch (e) { console.log(e); }

		try {
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getTyreDetails?'+param, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 $rootScope.TMSAllTyres = httpResponse.data.result;
						 $scope.totalItems_tyres = httpResponse.data.count;
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	var timer = false
	$scope.searchTyres = function() {
		if(timer){
      $timeout.cancel(timer)
  	}
	  timer= $timeout(function(){
			$scope.pageChanged_tyres();
		},1000);
	};

	$scope.showTyreAddingForm = false;
	$scope.showSensorChangeDiv = false;
	$scope.getTyreDetailsFormForAdd = function(){
		$('#showTMSTyreModalId').modal('show');
		$rootScope.getTMSAllSensors("InStock");
		$scope.tyreMakeList();
		$scope.showSensorChangeDiv = false;
		$scope.tyreNumber = "";
		$scope.tyreMake = "";
		$scope.tireDepot = "";
		$scope.tireThreadDepth = "";
		$scope.selectedTyreSensorId = 0;
		$scope.tyreMakeId = $scope.DefaultTyreMakeId;
		if($scope.tyreMakeId == null){
			$scope.tyreMakeId == 4
		}
		$scope.showTyreAddingForm = !$scope.showTyreAddingForm;
		$scope.updateTyreButtonStatus = false;
		$scope.addTyreButtonStatus = true;
		$scope.selectedTyreSensorUID = "";

		try {
		    $("#tyredepotId").val('').trigger('change');
		} catch (e) { }
		try {
		    $("#sensorId").val(0).trigger('change');
		} catch (e) { }
		try {
		    $("#tyremakeId").val($scope.tyreMakeId).trigger('change');
		} catch (e) { }

		try {
				$("#tyreTypeId").val("").trigger('change');
		} catch (e) { }
	}

	$scope.getTyreDetailsFormForUpdate = function(tyreDetails)
	{
		$('#showTMSTyreModalId').modal('show');
		//Get InStock Sensor Detials
		$rootScope.getTMSAllSensors("InStock");
		$scope.tyreMakeList();
		$scope.showSensorChangeDiv = false;
		$scope.tyreNumber = tyreDetails.tireNumber;
		$scope.tyreMakeId = tyreDetails.tireMakeId;
		$scope.tyreDepotId = tyreDetails.depotId;
		$scope.tireThreadDepth = tyreDetails.threadDepth;
		$scope.selectedTyreSensorId = tyreDetails.sensorId;
		$scope.selectedTyreSensorUID = tyreDetails.sensorUID;
		$scope.TMSTyreType = tyreDetails.tireType;
		$scope.updateTyreDetails = tyreDetails;
		$scope.showTyreAddingForm = true;
		$scope.updateTyreButtonStatus = true;
		$scope.addTyreButtonStatus = false;

		try {
				$("#tyremakeId").val(tyreDetails.tireMakeId).trigger('change');
		} catch (e) { }
		try {
				$("#tyredepotId").val($scope.tyreDepotId).trigger('change');
		} catch (e) { }
		try {
				$("#sensorId").val(0).trigger('change');
		} catch (e) { }

		try {
				$("#tyreTypeId").val($scope.TMSTyreType).trigger('change');
		} catch (e) { }

		try {
			$("#deallocatedDeviceSelect_id").val($scope.DeviceStatusList[0]).trigger('change');
		} catch (e) { }
	}

	$scope.AddTyre = function()
	{
		try {
			var reAssignedTyreMakeId = 4;
			if($scope.tyreMakeId == null || $scope.tyreMakeId == "null" || $scope.tyreMakeId == undefined || $scope.tyreMakeId == 0){
				reAssignedTyreMakeId = 4; // JK tyre
			} else if($("#tyremakeId").val() == ""){
				reAssignedTyreMakeId = 4; // JK tyre
			} else {
				reAssignedTyreMakeId = $scope.tyreMakeId;
			}

			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Tyre/Add?tyreNumber='+$scope.tyreNumber
			+'&tyreMakeId='+reAssignedTyreMakeId+'&depotId='+$scope.tyreDepotId+'&threadDepth='+$scope.tireThreadDepth
			+'&sensorId='+$scope.selectedTyreSensorId+'&tyreType='+$scope.TMSTyreType, true)
		 .then(
			 function(httpResponse){ // Success block
				 try{
					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess('Tyre added successfully');
						 $scope.pageChanged_tyres();
						 $('#showTMSTyreModalId').modal('hide');
					 } else {
						logger.logError(httpResponse.data.displayMsg);
					 }
				 }
				 catch(error)
				 {
					 loading.finish();
					 console.log("Error :"+error);
				 }
			 }, function(httpError) // Error block
			 {
				 loading.finish();
				 console.log("Error while processing request");
			 }, function(httpInProcess)// In process
			 {
				 console.log(httpInProcess);
			 }
		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.updateTyreDetailsFun = function()
	{
		try {
			if($scope.tyreMakeId == undefined || $scope.tyreMakeId ==  null || $scope.tyreMakeId == "")
			{
				$scope.tyreMakeId = 0;
			}
			var UPDATE_URL =$rootScope.HOST_TMS + 'api/tms/Tyre/Update?tyreId='+$scope.updateTyreDetails.tireId
						+'&tyreType='+$scope.TMSTyreType+'&tyreNumber='+$scope.tyreNumber
						+'&sensorId='+$scope.selectedTyreSensorId+'&tyreMakeId='+$scope.tyreMakeId
						+'&depotId='+$scope.tyreDepotId+'&threadDepth='+$scope.tireThreadDepth;

			APIServices.callGET_API(UPDATE_URL, true)
		 .then(
			 function(httpResponse){ // Success block
				 try{
					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 $('#showTMSTyreModalId').modal('hide');
						 logger.logSuccess('Tyre updated successfully');
						 $scope.pageChanged_tyres();
					 }
					 else {
						logger.logError(httpResponse.data.displayMsg);
					 }
				 }
				 catch(error)
				 {
					 loading.finish();
					 console.log("Error :"+error);
				 }
			 }, function(httpError) // Error block
			 {
				 loading.finish();
				 console.log("Error while processing request");
			 }, function(httpInProcess)// In process
			 {
				 console.log(httpInProcess);
			 }
		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.deallocateSensorFromTyre = function(){
		try {
			var status = $("#deallocatedDeviceSelect_id").val();
			if(status == undefined || status == null || status.trim().length == 0){
				logger.logWarning("Please select the status");
			} else{
				var DEALLOCATE_SENSOR_URL =$rootScope.HOST_TMS + 'api/tms/deallocateSensor?tyreNumber='
						+$scope.updateTyreDetails.tireNumber+"&tireId="+$scope.updateTyreDetails.tireId
						+"&sensorId="+$scope.updateTyreDetails.sensorId+"&status="+status;
				APIServices.callGET_API(DEALLOCATE_SENSOR_URL, true)
			 .then(
				 function(httpResponse){ // Success block
					 try{
						 loading.finish();
						 if(httpResponse.data.status == true)
						 {
							 $scope.showSensorChangeDiv = false;
							 logger.logSuccess('Sensor is deallocated from this tire');
							 $scope.updateTyreDetails = httpResponse.data.result[0];
							 $scope.getTyreDetailsFormForUpdate($scope.updateTyreDetails);
						 }
						 else {
							logger.logError(httpResponse.data.displayMsg);
						 }
					 }
					 catch(error)
					 {
						 loading.finish();
						 console.log("Error :"+error);
					 }
				 }, function(httpError) // Error block
				 {
					 loading.finish();
					 console.log("Error while processing request");
				 }, function(httpInProcess)// In process
				 {
					 console.log(httpInProcess);
				 }
			 );
			}
		} catch (e) {
			console.log(e);
		}
	}

	// Tire Inspection Code Starts Here
	$scope.totalItems_inspection = 0;
  $scope.currentPage_inspection = 1;
  $scope.itemsPerPage_inspection = 10;
	$scope.maxSize_inspection = 3;

	$scope.getTyreInspectionHistory = function(startIndex, searchWord){
		try {
			var Inspection_Param = 'limit='+$scope.itemsPerPage_inspection+'&startIndex='+startIndex;
			if(searchWord != undefined && searchWord != null && searchWord.trim().length > 0)
			{
				Inspection_Param = Inspection_Param + "&searchWord=" + searchWord;
			}
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Tire/getInspections?'+Inspection_Param, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 $rootScope.TMSTireInspectionHistory = httpResponse.data.result;
						 $scope.totalItems_inspection = httpResponse.data.count;
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.pageChanged_inspection = function(){
		$scope.nextIndex = ($scope.currentPage_inspection - 1) * $scope.itemsPerPage_inspection;
		$scope.getTyreInspectionHistory($scope.nextIndex, $scope.TMSInspection_searchWord);
	}

	// Search functionality
	var timer_inspection = false
	$scope.searchTyreInspections = function() {
		if(timer_inspection){
      $timeout.cancel(timer_inspection)
  	}
	  timer_inspection= $timeout(function(){
			$scope.pageChanged_inspection();
		}, 1000);
	};

	$scope.findAvgDepth = function(){
		try {
			$scope.AvgTreadDepth = $scope.avgFinder($scope.depthLocation1, $scope.depthLocation2,
				$scope.depthLocation3);
		} catch (e) { console.log(e); }
	}

	$scope.avgFinder = function(val1, val2, val3){
		var avg = (parseFloat(val1)+parseFloat(val2)+parseFloat(val3))/3;
		return Math.round(avg * 100) / 100;
	}

	$scope.getTyreInspectionFormForAdd = function() {
		$scope.showAddTyreInspectionForm = true;
		$scope.showUpdateTyreInspectionForm = false;
		$('#showTMSTyreInspectionModalId').modal('show');

		// Clear the existing data
		$scope.tireId = 0;
		$scope.location = '';
		$scope.kmsReading = '';
		$scope.depthLocation1 = '';
		$scope.depthLocation2 = '';
		$scope.depthLocation3 = '';
		$scope.serviceAvgThreadDepth = 0;
		$scope.TyrePressure = '';
		$('#tyreNumberId').prop('disabled', false);
		try {
			$("#tyreNumberId").val(0).trigger('change');
		} catch (e) { }

		try {
			$("#location_id").val("").trigger('change');
		} catch (e) { }

	}

	$scope.getTyreInspectionFormForUpdate = function(tyreInspection) {
		$scope.showAddTyreInspectionForm = false;
		$scope.showUpdateTyreInspectionForm = true;
		$('#showTMSTyreInspectionModalId').modal('show');
		$scope.updateTyreInspectionDetails = tyreInspection;

		$scope.tireId = tyreInspection.tireId;
		$scope.location = tyreInspection.location;
		$scope.kmsReading = tyreInspection.kmsreading;
		$scope.depthLocation1 = tyreInspection.depthLocation1;
		$scope.depthLocation2 = tyreInspection.depthLocation2;
		$scope.depthLocation3 = tyreInspection.depthLocation3;
		$scope.serviceAvgThreadDepth = tyreInspection.avgThreadDepth;
		$scope.TyrePressure = tyreInspection.tirePressure;

		$('#tyreNumberId').prop('disabled', true);
		try {
			$("#tyreNumberId").val($scope.tireId).trigger('change');
		} catch (e) {}

		try {
			$("#location_id").val($scope.location).trigger('change');
		} catch (e) { }
	}

	$scope.addTyreInspection = function(){
		try {
			$scope.AvgTreadDepth = $scope.avgFinder($scope.depthLocation1, $scope.depthLocation2,
																$scope.depthLocation3);
			var params = "tireId="+$scope.tireId+"&Location="+$scope.location+"&KMSReading="+$scope.kmsReading
					+"&depthLocation1="+$scope.depthLocation1+"&depthLocation2="+$scope.depthLocation2
					+"&depthLocation3="+$scope.depthLocation3+"&tirePressure="+$scope.TyrePressure;
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Tire/addInspection?'+params, true)
		 .then(
			 function(httpResponse){ // Success block
				 try{
					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess(httpResponse.data.displayMsg);
						 //$scope.getTyreInspectionHistory();
						 $scope.pageChanged_inspection();
						 $('#showTMSTyreInspectionModalId').modal('hide');
					 } else {
					 	logger.logError(httpResponse.data.displayMsg);
					 }
				 }
				 catch(error)
				 {
					 loading.finish();
					 console.log("Error :"+error);
				 }
			 }, function(httpError) // Error block
			 {
				 loading.finish();
				 console.log("Error while processing request");
			 }, function(httpInProcess)// In process
			 {
				 console.log(httpInProcess);
			 }
		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.updateTyreInspection = function(){
		try {
			$scope.AvgTreadDepth = $scope.avgFinder($scope.depthLocation1, $scope.depthLocation2,
																$scope.depthLocation3);
			var params = "inspectionId="+$scope.updateTyreInspectionDetails.tireInspectionId+"&Location="+$scope.location+"&KMSReading="+$scope.kmsReading
					+"&depthLocation1="+$scope.depthLocation1+"&depthLocation2="+$scope.depthLocation2
					+"&depthLocation3="+$scope.depthLocation3+"&tirePressure="+$scope.TyrePressure;
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Tire/updateInspection?'+params, true)
		 .then(
			 function(httpResponse){ // Success block
				 try{
					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess(httpResponse.data.displayMsg);
						//  $scope.getTyreInspectionHistory();
						 $scope.pageChanged_inspection();
						 $('#showTMSTyreInspectionModalId').modal('hide');
					 } else {
					 	logger.logError(httpResponse.data.displayMsg);
					 }
				 }
				 catch(error)
				 {
					 loading.finish();
					 console.log("Error :"+error);
				 }
			 }, function(httpError) // Error block
			 {
				 loading.finish();
				 console.log("Error while processing request");
			 }, function(httpInProcess)// In process
			 {
				 console.log(httpInProcess);
			 }
		 );
		} catch (e) { loading.finish(); console.log(e); }
	}


	// Tire Service Code Starts Here
	$scope.totalItems_services = 0;
	$scope.currentPage_services = 1;
	$scope.itemsPerPage_services = 10;
	$scope.maxSize_services = 3;

	$scope.TMSService_searchWord = "";

	$scope.pageChanged_services = function(){
		$scope.nextIndex_services = ($scope.currentPage_services - 1) * $scope.itemsPerPage_services;
		$scope.getTyreServiceHistory($scope.nextIndex_services, $scope.TMSService_searchWord);
	}

	$scope.getTyreServiceHistory = function(serviceStartIndex, searchWord){
		try {
			var serviceHistoryParams = 'api/tms/Tire/getServices?limit='+$scope.itemsPerPage_services
							+ '&startIndex=' + serviceStartIndex;
			if(searchWord != undefined && searchWord != null && searchWord != "" && searchWord.trim().length > 0){
				serviceHistoryParams = serviceHistoryParams + "&searchWord="+searchWord;
			}

			APIServices.callGET_API($rootScope.HOST_TMS + serviceHistoryParams, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 $rootScope.TMSTireServiceHistory = httpResponse.data.result;
						 $scope.totalItems_services = httpResponse.data.count;
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	// Search functionality
	var timer_service = false
	$scope.searchTyreServices = function() {
		if(timer_service){
      $timeout.cancel(timer_service)
  	}
	  timer_service= $timeout(function(){
			$scope.pageChanged_services();
		}, 1000);
	};

	$scope.getTyreServiceFormForAdd = function() {
		$scope.addTyreServiceStatus = true;
		$scope.updateTyreServiceStatus = false;
		$('#showTMSTyreServiceModalId').modal('show');
		$scope.selectedTyreId = 0;
		$scope.selectedTMSServiceVehId = 0;
		$scope.totalKms = 0;
		$scope.depot = '';
		$scope.tireMake = '';
		$scope.fittedDate = '';
		$scope.fittedKms = '';
		$scope.location = '';
		$scope.removalDate = '';
		$scope.tyreRemovedKms = '';
		$scope.totalKms = '';
		$scope.reason = '';
		$scope.actionTaken = '';
		$scope.tyreCondition = '';
		$scope.tyreScrappedParty = '';
		try {
			var fittedDate = moment(new Date()).format("DD-MM-YYYY");
			$('#tyreFittedDate_id').val(fittedDate);
		} catch (e) {}
		try {
			var removalDate = moment(new Date()).format("DD-MM-YYYY");
			$('#tyreRemoveDate_id').val(removalDate);
		} catch (e) {}

		$('#serviceTyreId').prop('disabled', false);
		$('#tyreDeport_id').prop('disabled', false);
		$('#tyreMake_id').prop('disabled', false);
		try {
			$("#serviceTyreId").val(0).trigger('change');
		} catch (e) { }
		try {
			$("#tyreScrapId").val('').trigger('change');
		} catch (e) { }
		try {
			$("#selectedTMSServiceVeh_id").val(0).trigger('change');
		} catch (e) { }
		try {
			$("#tyrePosition_id").val("").trigger('change');
		} catch (e) { }
	}

	$scope.getTyreServiceFormForUpdate = function(service) {
		$scope.addTyreServiceStatus = false;
		$scope.updateTyreServiceStatus = true;

		$scope.totalKms = 0;
		$scope.updateTyreServiceDetails = service;
		$scope.selectedTMSServiceVehId = service.vehId;
		$scope.depot = service.depot;
		$scope.tireMake = service.tireMake;
		$scope.fittedDate = service.fittedDate;
		$scope.fittedKms = service.kmsAtTyreFitted;
		$scope.tyreServiceTyreLocation = service.location
		$scope.removalDate = service.removalDate;
		$scope.tyreRemovedKms = service.kmsAtTyreRemoved;
		$scope.totalKms = service.tyreKms;
		$scope.reason = service.reason;
		$scope.actionTaken = service.actionTaken;
		$scope.tyreCondition = service.tyreCondition;
		$scope.tyreScrappedParty = service.scrappedToParty;
		try {
			var fittedDate = moment($scope.fittedDate).format("DD-MM-YYYY");
			$('#tyreFittedDate_id').val(fittedDate);
		} catch (e) {}
		try {
			var removalDate = moment($scope.removalDate).format("DD-MM-YYYY");
			$('#tyreRemoveDate_id').val(removalDate);
		} catch (e) {}

		$('#showTMSTyreServiceModalId').modal('show');
		$('#serviceTyreId').prop('disabled', true);
		$('#tyreDeport_id').prop('disabled', true);
		$('#tyreMake_id').prop('disabled', true);
		try {
			$("#serviceTyreId").val(service.tireId).trigger('change');
		} catch (e) { }
		try {
			$("#tyreScrapId").val($scope.tyreCondition).trigger('change');
		} catch (e) { }
		try {
			$("#selectedTMSServiceVeh_id").val($scope.selectedTMSServiceVehId).trigger('change');
		} catch (e) { }
		try {
			$("#tyrePosition_id").val($scope.tyreServiceTyreLocation).trigger('change');
		} catch (e) { }
	}

	$scope.tyreIdChanged = function() {
		angular.forEach($rootScope.TMSShortTiresList, function(tire, key)
		{
			if(tire.tireId == $scope.selectedTyreId){
				$scope.depot = tire.depotName;
				$scope.tireMake = tire.tireMake;
			}
		})
	}

	$scope.kmsCalculator = function(){
		if($scope.tyreRemovedKms >= $scope.fittedKms){

			$scope.totalKms = $scope.tyreRemovedKms - $scope.fittedKms;
			return $scope.totalKms;
		} else {
			logger.logError("Tyre removal Kms must be greater than tyre fitted Kms");
			return -1;
		}
	}

	// Add New Tyre Service History
	$scope.totalKms = 0;
	$("#tyreFittedKms_id").blur(function() {

	});

	$("#tyreRemovedKms_id").blur(function() {
		if($scope.tyreRemovedKms >= 0 && $scope.fittedKms >= 0){
			if($scope.tyreRemovedKms >= $scope.fittedKms){
				$scope.totalKms = $scope.tyreRemovedKms - $scope.fittedKms;
			} else{
				$scope.totalKms = 0;
				logger.logWarning("Removal Kms should be greater than Fitment Kms");
			}
		}
		else {
			$scope.totalKms = 0;
			logger.logWarning("Removal Kms should be greater than Fitment Kms")
		}
		$scope.$apply();
	});

	$scope.addNewTyreServiceHistory = function(){
		try {
			var fittedDate = moment($("#tyreFittedDate_id").val(), "D/M/YYYY").valueOf();
			var removalDate = moment($("#tyreRemoveDate_id").val(), "D/M/YYYY").valueOf();
			var params = "tireId="+$scope.selectedTyreId+"&depot="+$scope.depot+"&tireMake="+$scope.tireMake
					+"&vehId="+$scope.selectedTMSServiceVehId+"&fittedDate="+fittedDate
					+"&kmsAtTireFitted="+$scope.fittedKms+"&location="+$scope.tyreServiceTyreLocation
					+"&removalDate="+removalDate+"&kmsAtTireRemoved="+$scope.tyreRemovedKms
					+"&tireKms="+$scope.totalKms+"&reason="+$scope.reason
					+"&actionTaken="+$scope.actionTaken+"&tireCondition="+$scope.tyreCondition
					+"&tireScrappedParty="+$scope.tyreScrappedParty;
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Tire/addServiceHistory?'+params, true)
		 .then(
			 function(httpResponse){ // Success block
				 try{
					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess(httpResponse.data.displayMsg);
						 $scope.pageChanged_services();
						 $('#showTMSTyreServiceModalId').modal('hide');
					 } else {
					 	logger.logError(httpResponse.data.displayMsg);
					 }
				 }
				 catch(error)
				 {
					 loading.finish();
					 console.log("Error :"+error);
				 }
			 }, function(httpError) // Error block
			 {
				 loading.finish();
				 console.log("Error while processing request");
			 }, function(httpInProcess)// In process
			 {
				 console.log(httpInProcess);
			 }
		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.updateTyreService = function(){
		try {
			var totalKms = $scope.kmsCalculator();
			if(totalKms != -1)
			{
				var fittedDate = moment($("#tyreFittedDate_id").val(), "D/M/YYYY").valueOf();
				var removalDate = moment($("#tyreRemoveDate_id").val(), "D/M/YYYY").valueOf();
				if(removalDate < fittedDate){
					logger.logError("Tyre removal Date must be greater than tyre fitted Date");
				} else {
					var params = "serviceId="+$scope.updateTyreServiceDetails.tireServiceId
							+"&vehId="+$scope.selectedTMSServiceVehId+"&fittedDate="+fittedDate
							+"&kmsAtTireFitted="+$scope.fittedKms+"&location="+$scope.tyreServiceTyreLocation
							+"&removalDate="+removalDate+"&kmsAtTireRemoved="+$scope.tyreRemovedKms
							+"&tireKms="+$scope.totalKms+"&reason="+$scope.reason
							+"&actionTaken="+$scope.actionTaken+"&tireCondition="+$scope.tyreCondition
							+"&tireScrappedParty="+$scope.tyreScrappedParty;

					APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Tire/updateService?'+params, true)
				 .then(
					 function(httpResponse){ // Success block
						 try{
							 loading.finish();
							 if(httpResponse.data.status == true)
							 {
								 logger.logSuccess(httpResponse.data.displayMsg);
								 $scope.pageChanged_services();
								 $('#showTMSTyreServiceModalId').modal('hide');
							 } else {
								logger.logError(httpResponse.data.displayMsg);
							 }
						 }
						 catch(error)
						 {
							 loading.finish();
							 console.log("Error :"+error);
						 }
					 }, function(httpError) // Error block
					 {
						 loading.finish();
						 console.log("Error while processing request");
					 }, function(httpInProcess)// In process
					 {
						 console.log(httpInProcess);
					 }
				 );
				}
			}
		} catch (e) { loading.finish(); console.log(e); }
	}

	// Bluetooth Details code starts Here
	$scope.addBControllerButtonStatus = true;
	$rootScope.TMSAllBController = new Array();
	$rootScope.getTMSAllBController = function(status)
	{
		try {
		    if (status == undefined || status == "" || status.length == 0) {
			status = '';
		    }
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getBController?status='+status, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 $rootScope.TMSAllBController = httpResponse.data.result;
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.getBControllerDetailsFormForAdd = function()
	{
		$('#showTMSBluetoothModalId').modal('show');
		$scope.showBControllerAddingForm = !$scope.showBControllerAddingForm;
		$scope.updateBControllerButtonStatus = false;
		$scope.showBControllerAddingForm = true;
		$scope.addBControllerButtonStatus = true;
		$scope.BControllerUID = '';
		$scope.updateBControllerButtonStatus = false;
	}

	$scope.getBControllerDetailsFormForUpdate = function(BControllerDetails)
	{
		$('#showTMSBluetoothModalId').modal('show');
		$scope.BControllerUID = BControllerDetails.controllerUID;
		$scope.updateBController = BControllerDetails;
		$scope.updateBControllerButtonStatus = true;
		$scope.showBControllerAddingForm = true;
		$scope.addBControllerButtonStatus = false;
	}

	$scope.AddBController = function()
	{
		try {

			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/BController/Add?BControllerUID='+$scope.BControllerUID, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess('Bluetooth UID added successfully');
						 $rootScope.getTMSAllBController();
						 $('#showTMSBluetoothModalId').modal('hide');
					 } else {
					 	logger.logError(httpResponse.data.displayMsg);
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.updateBControllerDetails = function()
	{
		try {
			var UPDATE_URL =$rootScope.HOST_TMS + 'api/tms/BController/Update?BControllerId='
			+$scope.updateBController.controllerId+'&BControllerUID='+$scope.BControllerUID;

			APIServices.callGET_API(UPDATE_URL, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess('Bluetooth UID udated successfully');
						 $rootScope.getTMSAllBController();
						 $('#showTMSBluetoothModalId').modal('hide');
					 }
					 else {
					 	logger.logError(httpResponse.data.displayMsg);
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	// RFID Details code starts Here
	$scope.addRFIDButtonStatus = true;
	$rootScope.TMSAllRFID = new Array();
	$rootScope.getTMSAllRFID = function(status)
	{
		try {
		    if (status == undefined || status == "" || status.length == 0) {
			status = '';
		    }
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getRFID?status='+status, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 $rootScope.TMSAllRFIDS = httpResponse.data.result;
					 } else {
						 logger.logError(httpResponse.data.displayMsg);
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.getRFIDDetailsFormForAdd = function()
	{
		$('#showTMSRfidModalId').modal('show');
		$scope.showRFIDAddingForm = !$scope.showRFIDAddingForm;
		$scope.updateRFIDButtonStatus = false;
		$scope.showRFIDAddingForm = true;
		$scope.addRFIDButtonStatus = true;
		$scope.RFIDUID = '';
		$scope.updateRFIDButtonStatus = false;
	}

	$scope.getRFIDDetailsFormForUpdate = function(RFIDDetails)
	{
		$('#showTMSRfidModalId').modal('show');
		$scope.RFIDUID = RFIDDetails.rfiduid;
		$scope.updateRFID = RFIDDetails;
		$scope.updateRFIDButtonStatus = true;
		$scope.showRFIDAddingForm = true;
		$scope.addRFIDButtonStatus = false;
	}

	$scope.AddRFID = function()
	{
		try {
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/RFID/Add?RFIDUID='+$scope.RFIDUID, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess('RFID UID added successfully');
						 $rootScope.getTMSAllRFID();
						 $('#showTMSRfidModalId').modal('hide');
					 } else {
					 	logger.logError(httpResponse.data.displayMsg);
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.updateRFIDDetails = function()
	{
		try {
			var UPDATE_URL =$rootScope.HOST_TMS + 'api/tms/RFID/Update?RFID='
			+$scope.updateRFID.rfid+'&RFIDUID='+$scope.RFIDUID;

			APIServices.callGET_API(UPDATE_URL, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess('RFID UID updated successfully');
						 $rootScope.getTMSAllRFID()
						 $('#showTMSRfidModalId').modal('hide');
					 }
					 else {
					 	logger.logError(httpResponse.data.displayMsg);
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	// Sensor Details Code Starts Here
	$scope.addSensorButtonStatus = true;
	$scope.sensorStatusList = ["All", "InStock", "Installed", "Scraped"];
	$rootScope.TMSAllSensors = new Array();
	$scope.limit_sensor = 10;
	$scope.startIndex_sensor = 0;

	$scope.AddSensor = function()
	{
		try {
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/Sensor/Add?sensorUID='+$scope.sensorUID, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 logger.logSuccess('Sensor UID added successfully');
						 $rootScope.getTMSAllSensors();
						 $('#showTMSSensorModalId').modal('hide');
					 } else {
					 	logger.logError(httpResponse.data.displayMsg);
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.sensorStatusFilter = "All";
	$scope.sensorStatusChanged = function(){
		$scope.limit_sensor = 10;
		$scope.startIndex_sensor = 0;
		$rootScope.getTMSAllSensors($scope.sensorStatusFilter);
		// By default prev is disabled
		$('#prevBtnId_sensor').attr('disabled', true).css('background-color','gray');
		$('#prevBtnId_sensor').css('cursor', 'not-allowed');


	}

	// By default prev is disabled
	if($scope.startIndex_sensor == 0){
		$('#prevBtnId_sensor').attr('disabled', true).css('background-color','gray');
		$('#prevBtnId_sensor').css('cursor', 'not-allowed');
	}

	$scope.sensorSID = 0;
	$rootScope.getTMSAllSensors = function(status)
	{
		try {
			if(status == undefined || status == 'All')
			{
				status ='';
			}
			$scope.sensorSID = $scope.startIndex_sensor;
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getSensors?status=' + status
			+'&limit='+$scope.limit_sensor+'&startIndex='+$scope.startIndex_sensor, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 $rootScope.TMSAllSensors = httpResponse.data.result;
						 if($rootScope.TMSAllSensors.length < $scope.limit_sensor){
				 			// Disable the Next button
							    $('#nextBtnId_sensor').attr('disabled', true).css('background-color','gray');
							    $('#nextBtnId_sensor').css('cursor', 'not-allowed');

					 		} else {
								$('#nextBtnId_sensor').attr('disabled', false);
								$('#nextBtnId_sensor').css('background-color','#2C98DE');
								$('#nextBtnId_sensor').css('cursor', 'pointer');

					 		}
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	$scope.nextSensors = function(){
		$scope.startIndex_sensor = $scope.startIndex_sensor + $scope.limit_sensor;
		$rootScope.getTMSAllSensors($scope.sensorStatusFilter);
		if($scope.startIndex_sensor >= 0){
			$('#prevBtnId_sensor').attr('disabled', false).css('background-color','#2C98DE');
			$('#prevBtnId_sensor').css('cursor', 'pointer');

		}
	}

	$scope.prevSensors = function(){
		$scope.startIndex_sensor = $scope.startIndex_sensor - $scope.limit_sensor;
		if($scope.startIndex_sensor > 0){
			$('#prevBtnId_sensor').attr('disabled', false).css('background-color','#2C98DE');
			$('#prevBtnId_sensor').css('cursor', 'pointer');
		}else{
			$('#prevBtnId_sensor').attr('disabled', true).css('background-color','gray');
			$('#prevBtnId_sensor').css('cursor', 'not-allowed');

		}
		$rootScope.getTMSAllSensors($scope.sensorStatusFilter);
	}

	$scope.getSensorDetailsFormForUpdate = function(sensorDetails)
	{
		$('#showTMSSensorModalId').modal('show');
		$scope.sensorUID = sensorDetails.sensorUID;
		$scope.updateSensor = sensorDetails;
		$scope.updateSensorButtonStatus = true;
		$scope.showSensorAddingForm = true;
		$scope.addSensorButtonStatus = false;
	}

	$scope.getSensorDetailsFormForAdd = function()
	{
		$('#showTMSSensorModalId').modal('show');
		$scope.showSensorAddingForm = !$scope.showSensorAddingForm;
		$scope.updateSensorButtonStatus = false;
		$scope.showSensorAddingForm = true;
		$scope.addSensorButtonStatus = true;
		$scope.sensorUID = '';
		$scope.updateSensorButtonStatus = false;
	}

	$scope.updateSensorDetails = function()
	{
		try {
			var UPDATE_URL =$rootScope.HOST_TMS + 'api/tms/Sensor/Update?sensorId='+$scope.updateSensor.sensorId
			+'&sensorUID='+$scope.sensorUID;

			APIServices.callGET_API(UPDATE_URL, true)
 		 .then(
 			 function(httpResponse){ // Success block
 				 try{
 					 loading.finish();
					 if(httpResponse.data.status == true)
					 {
						 $rootScope.getTMSAllSensors();
						 logger.logSuccess('Sensor UID updated successfully');
						 $('#showTMSSensorModalId').modal('hide');
					 } else {
					 	logger.logError(httpResponse.data.displayMsg);
					 }
 				 }
 				 catch(error)
 				 {
 					 loading.finish();
 					 console.log("Error :"+error);
 				 }
 			 }, function(httpError) // Error block
 			 {
 				 loading.finish();
 				 console.log("Error while processing request");
 			 }, function(httpInProcess)// In process
 			 {
 				 console.log(httpInProcess);
 			 }
 		 );
		} catch (e) { loading.finish(); console.log(e); }
	}

	// Assign vehicle code starts
	// display users
	$scope.getTMSAllUsers = function() {
    try {
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getAllUserDetails', true)
	 		.then(
 		    function(httpResponse){ // Success block
		 			try {
		 			    loading.finish();
					    if (httpResponse.data.status) {
								$scope.basicUserDetails = httpResponse.data.result;
					    }  else {
								logger.logWarning(httpResponse.data.displayMsg);
					    }
					}
		 			catch(error) {
		 			    loading.finish();
		 			    console.log("Error :"+error);
		 			}
 		    }, function(httpError) { // Error block
		 			loading.finish();
		 			console.log("Error while processing request");
 		    }, function(httpInProcess)  { // In process
					console.log(httpInProcess);
 		    }
			);
		} catch (e) { loading.finish(); console.log(e); }
	}

	// display Vehicles
	$scope.getTMSAllVehicles = function() {
    try {
			APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getBasicVehDetails', true)
	 		.then(
 		    function(httpResponse){ // Success block
		 			try {
	 			    loading.finish();
				    if (httpResponse.data.status) {
							$scope.basicVehicleDetails = httpResponse.data.result;
				    }  else {
							logger.logWarning(httpResponse.data.displayMsg);
				    }
					} catch(error) {
	 			    loading.finish();
	 			    console.log("Error :"+error);
		 			}
 		    }, function(httpError) { // Error block
		 			loading.finish();
		 			console.log("Error while processing request");
 		    }, function(httpInProcess)  { // In process
					console.log(httpInProcess);
 		    }
	 		);
    } catch (e) { loading.finish(); console.log(e); }
	}

	$scope.tmsAssignVehToUser = function() {
    try {
			if ($('#tms_assignUser_id :selected').length == 0) {
			    alert("Select atleast one user");
			} else if ($('#tms_assignVehicle_id :selected').length == 0) {
			    alert("Select atleast one vehicle");
			} else {
			    var assignVeh_paramlog = JSON.stringify({userIds: $('#tms_assignUser_id').val(), vehIds: $('#tms_assignVehicle_id').val()});
			    var assignVeh_request_data = {
				RequestParam: assignVeh_paramlog,
			    };

			    APIServices.callAPI($rootScope.HOST_TMS + 'api/tms/assignVehToUsers', assignVeh_request_data, true)
			    .then(function(httpResponse){ // Success block
				try{
						if (httpResponse.data.status) {
							logger.logSuccess(httpResponse.data.displayMsg);
						}else {
							logger.logError(httpResponse.data.displayMsg)
						}
				    loading.finish();
				    console.log(httpResponse);
				} catch (e) { console.log(e); }
			    });
			}
    } catch (e) { loading.finish(); console.log(e); }
	}


	if($state.current.url == "/tms-vehicles") {
    $timeout(function() { $scope.pageChanged_vehicles(); }, 1000);
	} else if($state.current.url == "/tms-tyre") {
	    $scope.pageChanged_tyres();
	} else if($state.current.url == "/tmsTyreService") {
	    $scope.pageChanged_services();
	} else if($state.current.url == "/tmsTyreInspection") {
	    // $scope.getTyreInspectionHistory(0);
	    $scope.pageChanged_inspection();
	} else if($state.current.url == "/tms-sensor") {
	    $rootScope.getTMSAllSensors();
	} else if($state.current.url == "/tms-bluetooth") {
	    $rootScope.getTMSAllBController();
	} else if($state.current.url == "/tms-rfid") {
	    $rootScope.getTMSAllRFID();
	} else if ($state.current.url == "/tms-assignVehicle") {
	    $scope.getTMSAllUsers();
	    $scope.getTMSAllVehicles();
	}
    }]);
