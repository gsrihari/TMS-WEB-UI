// controller.js
app = angular.module('app');

// NavController
app.controller('NavController', ['$scope', '$rootScope', '$state', 'APIServices',
    'DashboardDataSharingServices', '$location','$cookieStore','$filter', 'logger','$timeout',
    function($scope, $rootScope, $state, APIServices, DashboardDataSharingServices, $location,
    $cookieStore, $filter, logger, $timeout) {
	$scope.controller = 'NavController!';
	$rootScope.innerIdForTroubledChart = "innerIdForTroubledChart";
	$scope.troubledVehChartData = [];

	$rootScope.allVehCount = "";
  $rootScope.tyreCount_all = "";
  $rootScope.tyreCount_installed = "";
  $rootScope.tyreCount_scraped = "";
  $rootScope.tyreCount_instock = "";
  $rootScope.tireCount_withoutSensor = "";
  $rootScope.tyreCount_services = "";
  $rootScope.tyreCount_inspections = "";

  // Vehicle tyre assignment chart
  $rootScope.allSemiConfigVehCount = "";
  $scope.allTyresAssignedVeh = "";
  $rootScope.vehTyreAssignmentChartData = [];

  // Tyre pressure & Temperature chart
  $rootScope.troubledVehCount = ""; $rootScope.NontroubledVehCount = "";
  $rootScope.troubledVehChartData = [];

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
          sessionStorage.setItem('SIDEMENU', "");
          sessionStorage.setItem('UserLevelId', "");
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
                  if($rootScope.minMaxTempPressureValues == undefined){
                      if(httpResponse.data.result[0].minMaxTempPressureValues == undefined)
                      {
                        // Getting Normal Conditional values
                        $rootScope.getDashboardDetails(true, true, function(dashboardResponse) {
                        });
                      } else {
                        $rootScope.minMaxTempPressureValues = httpResponse.data.result[0].minMaxTempPressureValues;
                        DashboardDataSharingServices.setMinMaxTempPressureValues_Obj($rootScope.minMaxTempPressureValues);
                      }
                  }
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
      				// var vehiclesList = DashboardDataSharingServices.getVehiclesList();
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
  		var allVehicles = new Array();
      var vehIdName_HashMap = DashboardDataSharingServices.getVehIdName_HashMap();
  		if(httpResponse.data.status) {
		    angular.forEach(httpResponse.data.result, function(vehicle, key) {
          // Update vehName
          vehicle.vehName = vehIdName_HashMap[vehicle.vehId];

          // Tyre Detials
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
          // Tyre Pressure and Temperature
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
      				tyre.pressure = '-';
      				tyre.temp = '-';
      				vehicle.tyres.push(tyre);
  			    }
  			    if (FRStatus ==  false) {
      				var tyre = new Object();
      				tyre.position = "FR";
      				tyre.tyreId = 0;
      				tyre.pressure = '-';
      				tyre.temp = '-';
      				vehicle.tyres.push(tyre);
  			    }
  			    if (RLOStatus ==  false) {
      				var tyre = new Object();
      				tyre.position = "RLO";
      				tyre.tyreId = 0;
      				tyre.pressure = '-';
      				tyre.temp = '-';
      				vehicle.tyres.push(tyre);
  			    }
  			    if (RLIStatus ==  false) {
      				var tyre = new Object();
      				tyre.position = "RLI";
      				tyre.tyreId = 0;
      				tyre.pressure = '-';
      				tyre.temp = '-';
      				vehicle.tyres.push(tyre);
  			    }
  			    if (RRIStatus ==  false) {
      				var tyre = new Object();
      				tyre.position = "RRI";
      				tyre.tyreId = 0;
      				tyre.pressure = '-';
      				tyre.temp = '-';
      				vehicle.tyres.push(tyre);
  			    }
  			    if (RROStatus ==  false) {
      				var tyre = new Object();
      				tyre.position = "RRO";
      				tyre.tyreId = 0;
      				tyre.pressure = '-';
      				tyre.temp = '-';
      				vehicle.tyres.push(tyre);
  			    }
    			}
  			allVehicles.push(vehicle);
	    });
      loading.finish();
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
  $scope.initDashboardData = function(){
    $rootScope.getDashboardDetails(true, true, function(dashboardResponse) {
      $scope.getTroubledVehCount();
    });
  }

  $scope.initDashboardData();

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

      $scope.logoutFun_JS = function(msg)
      {
        $rootScope.logoutFun(msg);
      }
      $('#dynamicSideMenu_id').append(sessionStorage.getItem('SIDEMENU'));

}]); // End of SideNavController
