// controller.js
app = angular.module('app');

// NavController
app.controller('TPMSReportController', ['$scope', '$rootScope', '$state', 'APIServices', '$http',
    'DashboardDataSharingServices', '$location','$cookieStore','$filter', 'logger','$timeout',
    function($scope, $rootScope, $state, APIServices, $http, DashboardDataSharingServices, $location,
    $cookieStore, $filter, logger, $timeout) {
	$scope.controller = 'ReportsController!';
	
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
	    
	    // showing in main table 
	    $scope.getTPMSReportData(selected_vehIds_report, true, startDateTime, endDateTime, function(TPMSReportDataResponse){
		$rootScope.processVehDetailsForView(TPMSReportDataResponse, function(processedData){
		    $scope.TPMSReportDataResponse = processedData;
		})
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
	
	var XaxisDateTime = [];
	var FL_temp = [];
	var FR_temp = [];
	var RLO_temp = [];
	var RLI_temp = [];
	var RRI_temp = [];
	var RRO_temp = [];
	
	var FL_pressure = [];
	var FR_pressure = [];
	var RLO_pressure = [];
	var RLI_pressure = [];
	var RRI_pressure = [];
	var RRO_pressure = [];
	
	$scope.findHistoryData = function(selected_vehId){
	    console.log("chart display");
	    var selected_vehIds_report = [];
	    selected_vehIds_report.push(selected_vehId);
	    
	    //showing in chart
	    $scope.getTPMSReportData(selected_vehIds_report, false, startDateTime, endDateTime,
	    function(TPMSReportHistoryDataResponse){
		
		if (TPMSReportHistoryDataResponse.data.status == true) {
		    // prepare chart
		    XaxisDateTime = [];
		    FL_temp = [];
		    FR_temp = [];
		    RLO_temp = [];
		    RLI_temp = [];
		    RRI_temp = [];
		    RRO_temp = [];
		    
		    FL_pressure = [];
		    FR_pressure = [];
		    RLO_pressure = [];
		    RLI_pressure = [];
		    RRI_pressure = [];
		    RRO_pressure = [];
		    angular.forEach(TPMSReportHistoryDataResponse.data.result, function(value, key){
			XaxisDateTime.push($filter('date')(value.device_date_time, "dd/MM/yyyy HH:mm:ss"));
			angular.forEach(value.tyres, function(tyre, id){
			    if (tyre.position == 'FL') {
				FL_temp.push(tyre.temp);
			    }
			    if (tyre.position == 'FR') {
				FR_temp.push(tyre.temp);
			    }
			    if (tyre.position == 'RLO') {
				RLO_temp.push(tyre.temp);
			    }
			    if (tyre.position == 'RLI') {
				RLI_temp.push(tyre.temp);
			    }
			    if (tyre.position == 'RRI') {
				RRI_temp.push(tyre.temp);
			    }
			    if (tyre.position == 'RRO') {
				RRO_temp.push(tyre.temp);
			    }
			    
			    if (tyre.position == 'FL') {
				FL_pressure.push(tyre.pressure);
			    }
			    if (tyre.position == 'FR') {
				FR_pressure.push(tyre.pressure);
			    }
			    if (tyre.position == 'RLO') {
				RLO_pressure.push(tyre.pressure);
			    }
			    if (tyre.position == 'RLI') {
				RLI_pressure.push(tyre.pressure);
			    }
			    if (tyre.position == 'RRI') {
				RRI_pressure.push(tyre.pressure);
			    }
			    if (tyre.position == 'RRO') {
				RRO_pressure.push(tyre.pressure);
			    }
			})
		    });
		    
		    $('#reportModal').modal('show');
		    // by default pressure chart will display
		    $scope.typeOfChart = 2;
		    $scope.pressureReportchart(XaxisDateTime, FL_pressure, FR_pressure, RLO_pressure, RLI_pressure, RRI_pressure, RRO_pressure);
		}
	    })
	}
	
	//pressure chart
	$scope.typeOfChart = 2;
	
	$scope.newValue = function() {

	    if($scope.typeOfChart == 1) {
		$scope.tempReportchart(XaxisDateTime, FL_temp, FR_temp, RLO_temp, RLI_temp, RRI_temp, RRO_temp);
	    }
	    if($scope.typeOfChart == 2) {
		$scope.pressureReportchart(XaxisDateTime, FL_pressure, FR_pressure, RLO_pressure, RLI_pressure, RRI_pressure, RRO_pressure);
	    }
	}
	
	Highcharts.setOptions({
	    colors: ['#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#F15C80'],
	    global: {
	        useUTC: false
	    }
	});
	
	// Temperature Chart
	$scope.tempReportchart = function(XaxisDateTime, FL_temp, FR_temp, RLO_temp, RLI_temp, RRI_temp, RRO_temp){
	    $('#report_chart').highcharts({
		chart: {
		    type: 'spline',
		    width: 1050,
		    panning: false,
		    panKey: 'shift',
		    renderTo: 'report_chart'
		},
		credits: {
		    enabled: false
		},
		title: {
		    text: 'Temperature Report',
		    x: -20 //center
		},
		xAxis: {
		    categories: XaxisDateTime,
		},
		scrollbar: {
		    enabled: true
		},
		yAxis: {
		    title: {
			text: 'Temperature'
		    }
		},
		plotOptions: {
		    line: {
			dataLabels: {
			    enabled: true
			},
			enableMouseTracking: true
		    }
		},
		legend: {
		    layout: 'horizontal',
		    align: 'right',
		    verticalAlign: 'bottom',
		    borderWidth: 0
		},
		
		series: [{
		    name: 'FL',
		    data: FL_temp
		}, {
		    name: 'FR',
		    data: FR_temp
		}, {
		    name: 'RLO',
		    data: RLO_temp
		}, {
		    name: 'RLI',
		    data: RLI_temp
		}, {
		    name: 'RRI',
		    data: RRI_temp
		}, {
		    name: 'RRO',
		    data: RRO_temp
		}],
	    });
	}
	
	// Pressure Chart
	$scope.pressureReportchart = function(XaxisDateTime, FL_pressure, FR_pressure, RLO_pressure, RLI_pressure, RRI_pressure, RRO_pressure){
	    $('#report_chart').highcharts({
		chart: {
		    type: 'spline',
		    width: 1050,
		    panning: false,
		    panKey: 'shift',
		    renderTo: 'report_chart'
		},
		credits: {
		    enabled: false
		},
		title: {
		    text: 'Pressure Report',
		    x: -20 //center
		},
		xAxis: {
		    categories: XaxisDateTime,
		},
		scrollbar: {
		    enabled: true
		},
		yAxis: {
		    title: {
			text: 'Pressure'
		    }
		},
		plotOptions: {
		    line: {
			dataLabels: {
			    enabled: true
			},
			enableMouseTracking: true
		    }
		},
		legend: {
		    layout: 'horizontal',
		    align: 'right',
		    verticalAlign: 'bottom',
		    borderWidth: 0
		},
		
		series: [{
		    name: 'FL',
		    data: FL_pressure,
		}, {
		    name: 'FR',
		    data: FR_pressure
		}, {
		    name: 'RLO',
		    data: RLO_pressure
		}, {
		    name: 'RLI',
		    data: RLI_pressure
		}, {
		    name: 'RRI',
		    data: RRI_pressure
		}, {
		    name: 'RRO',
		    data: RRO_pressure
		}],
	    });
	}
    }]); // End of ReportsController
