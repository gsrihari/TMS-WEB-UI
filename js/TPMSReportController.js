// controller.js
app = angular.module('app');

// NavController
app.controller('TPMSReportController', ['$scope', '$rootScope', '$state', 'APIServices', '$http',
    'DashboardDataSharingServices', '$location','$cookieStore','$filter', 'logger','$timeout',
    function($scope, $rootScope, $state, APIServices, $http, DashboardDataSharingServices, $location,
    $cookieStore, $filter, logger, $timeout) {
	$scope.controller = 'ReportsController!';
  console.log($scope.controller);

  $('#tpmsVehicleReport').select2({
  	placeholder: "Select Vehicle",
  	allowClear: true,
  	width: '100%'
  });

  // Get the vehicles list
  $scope.vehDetails =   DashboardDataSharingServices.getVehIdName_HashMap();
	// Get TPMS report data
	$scope.getTPMSReportData = function(selected_vehIds_report, uniqueStatus, startDateTime, endDateTime, callback) {
    try {
      loading.start();
      var request = {
        startDateTime : startDateTime,
        endDateTime: endDateTime,
        vehIds: selected_vehIds_report,
        uniqueStatus: uniqueStatus
      }
      $http.post($rootScope.HOST_TMS + "api/tms/getTPReportData", request)
          .then(function successCallback(httpResponse){
            try {
              loading.finish();
              if(httpResponse.data.status == true) {
                callback(httpResponse);
              } else {
                logger.logWarning(httpResponse.data.displayMsg);
              }
            } catch(error) {
      			    loading.finish();
      			    console.log("Error :"+error);
      			}
          }, function errorCallback(response){
              console.log("POST-ing of data failed");
      });
    } catch (e) { loading.finish(); console.log(e); }
	}

  // loading the service first time
  var startDateTime = 0;
  var endDateTime = 0;
  $scope.generateTPReport = function(){
    var selected_vehIds_report = $('#tpmsVehicleReport').val();
    startDateTime = moment($("#tpms_ReportStartTime").val(), "D/M/YYYY HH:mm").valueOf();
    // Adding 59 sec at the end
    endDateTime = moment($("#tpms_ReportEndTime").val()+":59", "D/M/YYYY HH:mm:ss").valueOf();

    $scope.getTPMSReportData(selected_vehIds_report, true, startDateTime, endDateTime, function(TPMSReportDataResponse){
      $rootScope.processVehDetailsForView(TPMSReportDataResponse, function(processedData){
        $scope.TPMSReportDataResponse = processedData;
      })
    })
  }

  $scope.findHistoryData = function(selected_vehId){
    console.log(selected_vehId);
    var selected_vehIds_report = [];
    selected_vehIds_report.push(selected_vehId);
    $scope.getTPMSReportData(selected_vehIds_report, false, startDateTime, endDateTime,
      function(TPMSReportHistoryDataResponse){
        console.log(TPMSReportHistoryDataResponse);
    })

  }

  //Load the values after 1 sec
  $timeout(function() {
    if($scope.vehDetails == undefined){
      // Call Dashboard service
      $rootScope.getDashboardDetails(true, true, function(dashboardResponse) {
        $scope.vehDetails =   DashboardDataSharingServices.getVehIdName_HashMap();
      });
    }
  }, 1000);

}]); // End of ReportsController
