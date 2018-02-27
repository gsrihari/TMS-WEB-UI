// controller.js
app = angular.module('app');

app.controller('TMSTempPressureController', ['$scope', '$rootScope', '$state', 'APIServices',
    'DashboardDataSharingServices', '$location','$cookieStore', '$timeout', '$filter','logger',
    function($scope, $rootScope, $state, APIServices, DashboardDataSharingServices, $location, $cookieStore,
    $timeout, $filter, logger, $apply) {
	try {
	    $rootScope.troubledVehiclesDetails = [];
      $scope.loadTPMSLiveData = function(type){
        $rootScope.tempPressureType = type;
        $scope.callTroubledVehiclesAPI(true);
      }
	    $scope.callTroubledVehiclesAPI = function(loadingImgStatus) {
		      try {
            if(loadingImgStatus == undefined){
              loadingImgStatus = true;
            }
            $rootScope.troubledVehiclesDetails = [];
            if($rootScope.tempPressureType == undefined || $rootScope.tempPressureType == ""){
              $rootScope.tempPressureType = 'All';
            }
    		    APIServices.callGET_API($rootScope.HOST_TMS + 'api/tms/getTPMSVehData?type='+$rootScope.tempPressureType, loadingImgStatus)
    		    .then(
        			function(httpResponse) { 	// Success block
      			    try {
          				loading.finish();
          				if(httpResponse.data.status == true){
        				    var vehIdName_HashMap = DashboardDataSharingServices.getVehIdName_HashMap();
                    $rootScope.minMaxTempPressureValues = DashboardDataSharingServices.getMinMaxTempPressureValues_Obj();
                    if(vehIdName_HashMap == undefined || $rootScope.minMaxTempPressureValues == undefined){
                      // Call dashboard and load vehicle details and other things
                      $rootScope.getDashboardDetails(true, true, function(dashboardResponse) {
                        $rootScope.minMaxTempPressureValues = DashboardDataSharingServices.getMinMaxTempPressureValues_Obj();
                        vehIdName_HashMap = DashboardDataSharingServices.getVehIdName_HashMap();
                        $scope.processTPMSVehData(httpResponse, vehIdName_HashMap);
                      });
                    } else {
                      $scope.processTPMSVehData(httpResponse, vehIdName_HashMap);
                    }
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

        $scope.processTPMSVehData = function(httpResponse, vehIdName_HashMap){
          try {
            $rootScope.processVehDetailsForView(httpResponse, function(response) {
              angular.forEach(response, function(troubledVehicle, key){
                try {
                  troubledVehicle.vehName = vehIdName_HashMap[troubledVehicle.vehId];
                  $rootScope.troubledVehiclesDetails.push(troubledVehicle);
                } catch (e) {
                  console.log(e);
                }
              });
            });
          } catch (e) {
            console.log(e);
          }
        }

        $scope.$on('$destroy', function() {
          // clean up stuff
          console.log("On destroy");
          $scope.clearInterval_tmsTroubledVehData();
        })

        //Updating the service every 30 sec once
      	var refreshInterval_tmsTroubledVehData = 30000;
      	var updateTroubledVehData = window.setInterval(function () {
    	    $scope.callTroubledVehiclesAPI(false);
      	}, refreshInterval_tmsTroubledVehData);

      	$scope.clearInterval_tmsTroubledVehData = function(){
    	    clearInterval(updateTroubledVehData);
    	    updateTroubledVehData = undefined;
      	}

        $timeout(function() {
          $rootScope.tempPressureType = "All";
          $scope.callTroubledVehiclesAPI(true);
        }, 1000);

    } catch(e){ console.log(e);	}
}]);
// end TMSTempPressureController
