// controller.js
app = angular.module('app');

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
    		} else {
          $rootScope.showSemiConfigVehData = false;
          $timeout(function() { $location.url('/tms-vehicles'); }, 100);
        }
	    } catch (e) { loading.finish(); console.log(e); }
	}

	if($state.current.url == "/vehDetails") {
	    if($rootScope.allVehicles.length == 0 ) {
		$scope.getSemiAssignedVehicles('SemiConfigVehicles1');
	    }
	}

  $scope.gotoVehView = function(){
      try {
        $timeout(function() { $location.url('/tms-vehicles'); }, 100);
      } catch (e) { loading.finish(); console.log(e); }
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

  // Calling dashboard API when this page is loading
  $timeout(function(){
    $rootScope.getDashboardDetails(false, false, function(dashboardResponse) {
    });
  },1000);


}]);
