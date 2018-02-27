/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var vehicleListGlobal = new Array();
var map;
var Allmarkers = new Array();
var selectedParamId = new Array();
var FilterMarkerCategory = "all";
var infowindow = new google.maps.InfoWindow();
var allMarkersWithInfoWindows = new Array();
var SelectedVehicleID = "0";
var SelectedDepotID = "0";
var AllSectionParam;
var AllReportParam;
MapAsideVehicleInfoWindowShow = 0; // display false
var date = new Date();

var HashMapVehicle = new Object();
var HashMapParameter = new Object();
var HashMapParameterUnit = new Object();

//jeni
moving_count = 0;
halted_count = 0;
notworking_count = 0;
CANdisconnect_count = 0;
var markers = [];
var GroupList = [];
var Lat = 0;
var Long = 0;
var filter_val = 1;
var displayAllDepotLocation = false;
var circle = "";
var depoLocationmarker = "";
var depoLocationMarkersList = new Array();
var depoLocationCirclesList = new Array();
var iconImg;
var require_date = new Date();
var old_section_id = 0;

var UserURL = $.cookie('UserURL');
var LiveTracking_url = "";
var Notification_url = "";

$('#notifySearchFromDate').datetimepicker({
    format: 'd-m-Y',
    onShow: function (ct) {
        if ($('#notifySearchFromDate').hasClass('error'))
            $('#notifySearchFromDate').removeClass('error');
    },
    maxDate: moment().format('DD-MM-YYYY'),
    defaultTime: '00:00',
    timepicker: false,
    value: moment().format("DD-MM-YYYY")
});

$('#notifySearchFromDate').change(function () {
    $('#dateDoubleOnward').empty();
    AlertPopUpOnloadFun('D');
    $('#notifyview-spinner').show();
});

$('input:radio[name="search"]').change(function () {
    filter_val = ($(this).val());
    AlertPopUpOnloadFun('F');
});

function display_DateFormat(date) {
    // changing date format as dd-mm-yyyy (eg: 06-04-2016)
    var twoDigitMonth = date.getMonth() + 1 + "";
    if (twoDigitMonth.length == 1)
        twoDigitMonth = "0" + twoDigitMonth;
    var twoDigitDate = date.getDate() + "";
    if (twoDigitDate.length == 1)
        twoDigitDate = "0" + twoDigitDate;
    return twoDigitDate + '-' + twoDigitMonth + '-' + date.getFullYear();
}
var global_date = new Date();
var today_date = new Date();
var ExpectOperator = '';
var notificationType = 'all';
var notify_request = {};
$('#notify_head_all').show();

function NotificationListAPICall(notify_request_data, callback) {
    $.ajax({
        url: UserURL + "Notifications",
        type: "POST",
        xhrFields: {withCredentials: true},
        dataType: 'json',
        data: notify_request_data,
        success: function (data) {
            callback(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        }
    });
}

function prepareChart(paramListName, YaxisText, seriesData, pid) {
    var param_short_name = "";
    $.each(AllSectionParam, function (c, MySectionList) {
        $.each(MySectionList.section_param_list, function (d, MyParamList) {
            if (pid == MyParamList.parameter_id) {
                param_short_name = MyParamList.parameter_short_name;
            }
        });
    });

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    $('#notify_chart').highcharts({
        chart: {
            type: 'spline',
            panning: false,
            panKey: 'shift',
            renderTo: 'notify_chart'
        },
        credits: {
            enabled: false
        },
        title: {
            text: paramListName,
            x: -20 //center
        },
        xAxis: [
            {
                type: "datetime",
                labels: {
                    format: "{value:%H:%M:%S}"
                },
            }
        ],
        scrollbar: {
            enabled: true
        },
        yAxis: {
            title: {
                text: YaxisText
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
        tooltip: {
            crosshairs: false,
            formatter: function () {
                var ECT_Levels = "";
                if (pid == 10 || pid == 11) {
                    if (this.y >= 98 && this.y <= 100) {
                        ECT_Levels = " - L1";
                    } else if (this.y >= 101 && this.y <= 103) {
                        ECT_Levels = " - L2";
                    } else if (this.y >= 104) {
                        ECT_Levels = " - L3";
                    }
                }
                return '<b> ' + param_short_name + ': </b> ' + this.y + ' (°C)' + ECT_Levels + '<br>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', new Date(this.x));
            }
        },
        series: seriesData
    });
}

var ECT_Levels = "";
function NotifyVehcilePopup(vehicle_id, pid, filter_val) {

    Highcharts.chart('notify_chart', {

        title: {
            text: 'ECT Notification'
        },

        yAxis: {
            title: {
                text: 'Temperature(°C)'
            }
        },
        plotOptions: {
            series: {
                pointStart: 2010
            }
        },

        series: [{
            data: [98, 101, 110, 107, 110, 102, 99, 107]
        }]

    });
    //var vehicleIdList = [];
    //vehicleIdList[0] = vehicle_id;
    //
    //var paramIdList = [];
    //paramIdList[0] = pid;
    //
    //var notify_paramlog = JSON.stringify({veh_id: vehicleIdList, pid: paramIdList});
    //var notify_request_data = {
    //    RequestParam: notify_paramlog,
    //    type: "MyNotificationList",
    //    filterValue: filter_val,
    //    requestDate: require_date
    //};
    //
    //NotificationListAPICall(notify_request_data, function (data) {
    //    var seriesData = new Array();
    //
    //    var xAndYValuesList = [];
    //
    //    $.each(data.results, function (a, notification) {
    //        var yValue = parseInt(notification.value);
    //        var xAndYValue = new Array();
    //        xAndYValue.push(
    //                notification.device_date_time_millis,
    //                yValue
    //                );
    //        xAndYValuesList.push(xAndYValue);
    //    });
    //
    //    var vehicleListName = HashMapVehicle[vehicle_id];
    //    var paramListName = HashMapParameter[pid];
    //    var myMarker = {radious: 4, enabled: true};
    //
    //    var veh_data = {name: vehicleListName, marker: myMarker, data: xAndYValuesList};
    //    if (pid == 10 || pid == 11) {
    //        veh_data = {name: vehicleListName, marker: myMarker, data: xAndYValuesList, zones: chartColors_Temp};
    //    } else if (pid == 10002) {
    //        veh_data = {name: vehicleListName, marker: myMarker, data: xAndYValuesList, zones: chartColors_Speed};
    //    }
    //
    //    seriesData.push(veh_data);
    //    prepareChart(paramListName, "Temperature (°C)", seriesData, pid);
    //});
}

function FDSNotifyVehcilePopup(vehicle_id, pid, filter_val) {
    $('#id-FDS-history-list-tbody').html('');
    var vehicleIdList = [];
    vehicleIdList[0] = vehicle_id;

    var paramIdList = [];
    paramIdList[0] = pid;

    var notify_paramlog = JSON.stringify({veh_id: vehicleIdList, pid: paramIdList});
    var notify_request_data = {
        RequestParam: notify_paramlog,
        type: "MyNotificationList",
        filterValue: filter_val,
        requestDate: require_date
    };

    NotificationListAPICall(notify_request_data, function (data) {
        var vehicleListName = HashMapVehicle[vehicle_id];
        $.each(data.results, function (i, MyFDSHistory) {
            $('#FDSNotify_header_id').html( vehicleListName );
            $("#id-FDS-history-list-tbody").append('<tr><td>&nbsp;</td><td>' + MyFDSHistory.device_date_time + '</td><td>' + MyFDSHistory.value + '</td><td>' + MyFDSHistory.param_range + '</td></tr>');
        });
    });
}

function AlertPopUpOnloadFun(changeAction, type) {
    $('#total_notify_entry_id').text('');
    $('#next-day-link').attr('disabled', true);
    if (type == undefined || type == "" || type.length < 1) {
        // triggered next or prev link
    } else if (type == 'FDS') {
        notificationType = 'fds';
        $('#notify_head_fds').show();
        $('#notify_head_all').hide();
    } else {
        notificationType = 'all';
        $('#notify_head_all').show();
        $('#notify_head_fds').hide();
    }

    if (changeAction == 'N') {      //next date
        var nextDate = new Date(global_date);
        nextDate.setDate(nextDate.getDate() + 1);
        global_date = nextDate;

        require_date = display_DateFormat(nextDate);
        $('#dateDoubleOnward').text(require_date);
        $('#notifySearchFromDate').val(require_date);
    } else if (changeAction == 'P') {   //previous date
        var prevDate = new Date(global_date);
        prevDate.setDate(prevDate.getDate() - 1);
        global_date = prevDate;

        require_date = display_DateFormat(prevDate);
        $('#dateDoubleOnward').text(require_date);
        $('#notifySearchFromDate').val(require_date);
    } else if (changeAction == 'D') {   //changing date in datepicker
        require_date = $('#notifySearchFromDate').val();
        var tempDate = require_date.split('-');
        var replaceDate = new Date(tempDate[2], tempDate[1] - 1, tempDate[0]);
        global_date = replaceDate;
        $('#dateDoubleOnward').text(require_date).toString();
    } else if (changeAction == 'F') {   // when Filter value changed
        $('#dateDoubleOnward').text(require_date);
        $('#notifySearchFromDate').val(require_date);
    } else {     //today date
        global_date = today_date;
        require_date = display_DateFormat(today_date);
        $('#dateDoubleOnward').text(require_date);
        $('#notifySearchFromDate').val(require_date);
    }

    var init1 = display_DateFormat(global_date);
    var init2 = display_DateFormat(today_date);
    if (init1 === init2) {
        $('#next-day-link').attr('disabled', true);
    } else {
        $('#next-day-link').removeAttr('disabled', 'disabled');
    }

    if (filter_val == 'undefined' || filter_val == '') {
        filter_val = 1;
    }
    $("#id-alert-vehicle-list-tbody").empty();
    if (notificationType == 'fds') {
        var ReportSelectedParam = ['10012', '10013', '10014'];
        var report_paramlog = JSON.stringify({veh_id: (vehicleListGlobal), pid: (ReportSelectedParam)});
        notify_request = {
            RequestParam: report_paramlog,
            type: "MyNotificationListNew",
            filterValue: filter_val,
            requestDate: require_date
        };
    } else {
        notify_request = {
            vehicleid: vehicleListGlobal,
            type: "MyNotificationListNew",
            filterValue: filter_val,
            requestDate: require_date
        };
    }
    try {
        $.ajax({
            url: BaseUrl + "Notifications",
            type: "POST",
            xhrFields: {withCredentials: true},
            dataType: 'json',
            data: notify_request,
            success: function (data) {
                var no_of_notifyRecords = data.results.length;
                $('#total_notify_entry_id').append(no_of_notifyRecords);

                if (data.results.length > 0) {
                    var notify_radio_status = $('input:radio[name="search"]:checked').val();

                    if (notify_radio_status == 1) {
                        //Action pending FDS
                        i = 0;
                        if (notificationType == 'fds') {
                            $("#id-alert-vehicle-list-thead").html("<tr><th style='width:5%;'>S.No</th><th style='width: 15%'>Vehicle</th><th style='width: 15%'>Updated Time</th><th style='width: 25%'>Parameter</th><th>Parameter Value</th><th>Expected Value</th><th>Response</th></tr>");
                            $.each(data.results, function (a, Content) {
                                try {
                                    var discription = '<button onclick=\'EditClassifyAlert("' + Content.notification_id + '","' + Content.device_date_time_millis + '","' + Content.vehId + '","' + i + '","' + Content.pid + '");\' >Action Pending</button>';
                                    var descriptions = '<div id="ClassifyAlert' + i + '">' + discription + '</div>';
                                    ExpectOperator = Content.operator;
                                    if (loginuser == 'spandey') {
                                        if (Content.value > 103) {
                                            i++;
                                            $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td style="width: 15%"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myFDSModal" onClick="FDSNotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td style="width:15%;">' + Content.device_date_time + '</td>\n\<td style="width: 25%">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td >' + Content.value + '</td>\n\<td>' + Content.param_range + '</td>\n\<td>' + descriptions + '</td>\n\</tr>');
                                        }
                                    } else {
                                        i++;
                                        $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td style="width: 15%"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myFDSModal" onClick="FDSNotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td style="width:15%;">' + Content.device_date_time + '</td>\n\<td style="width: 25%">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td >' + Content.value + '</td>\n\<td>' + Content.param_range + '</td>\n\<td>' + descriptions + '</td>\n\</tr>');
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            });
                        } else {
                            // Notifications except FDS
                            $("#id-alert-vehicle-list-thead").html("<tr class='row'><th style='width:5%;'>S.No</th><th class='col-lg-1'>Vehicle</th><th class='col-lg-2'>Updated Time</th><th class='col-lg-2'>Parameter</th><th class='col-lg-2'>Parameter Value</th><th class='col-lg-2'>Expected Value</th><th class='col-lg-1'>Levels</th><th class='col-lg-2'>Response</th></tr>");
                            $.each(data.results, function (a, Content) {
                                try {
                                    var discription = '<button onclick=\'EditClassifyAlert("' + Content.notification_id + '","' + Content.device_date_time_millis + '","' + Content.vehId + '","' + i + '","' + Content.pid + '");\' >Action Pending</button>';
                                    var descriptions = '<div id="ClassifyAlert' + i + '">' + discription + '</div>';
                                    ExpectOperator = Content.operator;
                                    if (loginuser == 'spandey') {
                                        if (Content.value > 103) {
                                            i++;
                                            if (ExpectOperator == "=") {
                                                $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td class="col-lg-1"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td class="col-lg-2">' + Content.device_date_time + '</td>\n\<td class="col-lg-2">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td class="col-lg-2">' + Content.value + '</td>\n\<td class="col-lg-2">' + Content.param_range + '</td>\n\<td class="col-lg-1"></td>\n\<td class="col-lg-2">' + descriptions + '</td>\n\</tr>');
                                            } else {
                                                $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td class="col-lg-1"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td class="col-lg-2">' + Content.device_date_time + '</td>\n\<td class="col-lg-2">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td class="col-lg-2">' + Content.value + '</td>\n\<td class="col-lg-2">' + Content.operator + ' ' + Content.param_range + '</td>\n\<td class="col-lg-1"></td>\n\<td class="col-lg-2">' + descriptions + '</td>\n\</tr>');
                                            }
                                        }
                                    } else {
                                        i++;
                                        if (ExpectOperator == "=") {
                                            $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td class="col-lg-1"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td class="col-lg-2">' + Content.device_date_time + '</td>\n\<td class="col-lg-2">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td class="col-lg-1">' + Content.value + '</td>\n\<td class="col-lg-2">' + Content.param_range + '</td>\n\<td class="col-lg-1"></td>\n\<td class="col-lg-2">' + descriptions + '</td>\n\</tr>');
                                        } else {
                                            //$("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td style="width: 15%">' + HashMapVehicle[Content.vehId] + '</td>\n\<td style="width:15%;">' + Content.device_date_time + '</td>\n\<td style="width: 25%">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td>' + Content.value + '</td>\n\<td>' + Content.operator + ' ' + Content.param_range + '</td>\n\<td>' + descriptions + '</td>\n\</tr>');
                                            if (Content.pid == 10 || Content.pid == 11) {
                                                if (Content.value >= 98 && Content.value < 101) {
                                                    $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '" >\n\<td style="width:5%;">&nbsp;</td>\n\<td class="col-lg-1"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');">' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td class="col-lg-2">' + Content.device_date_time + '</td>\n\<td class="col-lg-2">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td class="col-lg-2 notify-level1">' + Content.value + '</td>\n\<td class="col-lg-2 notify-level1">' + Content.operator + ' ' + Content.param_range + '</td>\n\<td class="col-lg-1 notify-level1"> L1 </td>\n\<td class="col-lg-2">' + descriptions + '</td>\n\</tr>');
                                                } else if (Content.value >= 101 && Content.value <= 103) {
                                                    $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '" >\n\<td style="width:5%;">&nbsp;</td>\n\<td class="col-lg-1"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');">' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle">' + Content.subRecCount + '</button></a></b></td>\n\<td class="col-lg-2">' + Content.device_date_time + '</td>\n\<td class="col-lg-2">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td class="col-lg-2 notify-level2">' + Content.value + '</td>\n\<td class="col-lg-2 notify-level2">' + Content.operator + ' ' + Content.param_range + '</td>\n\<td class="col-lg-1 notify-level2"> L2 </td>\n\<td class="col-lg-2">' + descriptions + '</td>\n\</tr>');
                                                } else if (Content.value > 103) {
                                                    $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '" >\n\<td style="width:5%;">&nbsp;</td>\n\<td class="col-lg-1"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');">' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td class="col-lg-2">' + Content.device_date_time + '</td>\n\<td class="col-lg-2">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td class="col-lg-2 notify-level3">' + Content.value + '</td>\n\<td class="col-lg-2 notify-level3">' + Content.operator + ' ' + Content.param_range + '</td>\n\<td class="col-lg-1 notify-level3"> L3 </td>\n\<td class="col-lg-2">' + descriptions + '</td>\n\</tr>');
                                                }
                                            } else {
                                                $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td class="col-lg-1"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td class="col-lg-2">' + Content.device_date_time + '</td>\n\<td class="col-lg-2">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td class="col-lg-2">' + Content.value + '</td>\n\<td class="col-lg-2">' + Content.operator + ' ' + Content.param_range + '</td>\n\<td class="col-lg-1"></td>\n\<td class="col-lg-2">' + descriptions + '</td>\n\</tr>');
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            });
                        }
                        //Added by sri hari
                        $('#total_notify_entry_id').text('');
                        $('#total_notify_entry_id').append(i);
                    } else {
                        //Action taken
                        i = 0;
                        $("#id-alert-vehicle-list-thead").html("<tr><th style='width:5%;'>S.No</th><th style='width: 10%'>Vehicle</th><th style='width: 12%'>Updated Time</th><th style='width: 20%'>Parameter</th><th style='width: 10%'>Parameter Value</th><th style='width: 10%'>Expected Value</th><th style='width: 10%'>Action Taken By</th><th style='width: 10%'>Action Taken Time</th><th style='width: 15%'>Description</th></tr>");
                        $.each(data.results, function (a, Content) {
                            try {
                                ExpectOperator = Content.operator;
                                if (loginuser == 'spandey') {
                                    if (Content.value > 103) {
                                        i++;
                                        if (ExpectOperator == "=") {
                                            $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td style="width: 10%"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myFDSModal" onClick="FDSNotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '</a><button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></b></td>\n\<td style="width:12%;">' + Content.device_date_time + '</td>\n\<td style="width: 20%">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td style="width: 10%">' + Content.value + '</td>\n\<td style="width: 10%">' + Content.param_range + '</td>\n\<td style="width: 10%">' + Content.actionTakenBy + '</td>\n\<td style="width: 10%">' + Content.timestamp + '</td>\n\<td style="max-width:100px"><span class="more">' + Content.description + '</span></td>\n\</tr>');
                                        } else {
                                            $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td style="width: 10%"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td style="width:12%;">' + Content.device_date_time + '</td>\n\<td style="width: 20%">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td style="width: 10%">' + Content.value + '</td>\n\<td style="width: 10%">' + Content.operator + ' ' + Content.param_range + '</td>\n\<td style="width: 10%">' + Content.actionTakenBy + '</td>\n\<td style="width: 10%">' + Content.timestamp + '</td>\n\<td style="max-width:100px"><span class="more">' + Content.description + '</span></td>\n\</tr>');
                                        }
                                    }
                                } else {
                                    i++;
                                    if (ExpectOperator == "=") {
                                        $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td style="width: 10%"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myFDSModal" onClick="FDSNotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '</a><button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></b></td>\n\<td style="width:12%;">' + Content.device_date_time + '</td>\n\<td style="width: 20%">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td style="width: 10%">' + Content.value + '</td>\n\<td style="width: 10%">' + Content.param_range + '</td>\n\<td style="width: 10%">' + Content.actionTakenBy + '</td>\n\<td style="width: 10%">' + Content.timestamp + '</td>\n\<td style="max-width:100px"><span class="more">' + Content.description + '</span></td>\n\</tr>');
                                    } else {
                                        if (Content.pid == 10 || Content.pid == 11) {
                                            if (Content.value >= 98 && Content.value < 101) {
                                                $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td style="width: 10%"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td style="width:12%;">' + Content.device_date_time + '</td>\n\<td style="width: 20%">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td style="width: 10%" class="notify-level1">' + Content.value + '</td>\n\<td style="width: 10%" class="notify-level1">' + Content.operator + ' ' + Content.param_range + '</td>\n\<td style="width: 10%">' + Content.actionTakenBy + '</td>\n\<td style="width: 10%">' + Content.timestamp + '</td>\n\<td style="max-width:100px"><span class="more">' + Content.description + '</span></td>\n\</tr>');
                                            } else if (Content.value >= 101 && Content.value <= 103) {
                                                $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td style="width: 10%"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td style="width:12%;">' + Content.device_date_time + '</td>\n\<td style="width: 20%">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td style="width: 10%" class="notify-level2">' + Content.value + '</td>\n\<td style="width: 10%" class="notify-level2">' + Content.operator + ' ' + Content.param_range + '</td>\n\<td style="width: 10%">' + Content.actionTakenBy + '</td>\n\<td style="width: 10%">' + Content.timestamp + '</td>\n\<td style="max-width:100px"><span class="more">' + Content.description + '</span></td>\n\</tr>');
                                            } else if (Content.value > 103) {
                                                $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td style="width: 10%"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td style="width:12%;">' + Content.device_date_time + '</td>\n\<td style="width: 20%">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td style="width: 10%" class="notify-level3">' + Content.value + '</td>\n\<td style="width: 10%" class="notify-level3">' + Content.operator + ' ' + Content.param_range + '</td>\n\<td style="width: 10%">' + Content.actionTakenBy + '</td>\n\<td style="width: 10%">' + Content.timestamp + '</td>\n\<td style="max-width:100px"><span class="more">' + Content.description + '</span></td>\n\</tr>');
                                            }
                                        } else {
                                            $("#id-alert-vehicle-list-tbody").append('<tr id="notification_popup_table_id-tr' + Content.vehId + '">\n\<td style="width:5%;">&nbsp;</td>\n\<td style="width: 10%"><b><a style="text-decoration:none;" href="javascript:;" data-toggle="modal" data-target="#myModal" onClick="NotifyVehcilePopup(' + Content.vehId + ',' + Content.pid + ',' + filter_val + ');" >' + HashMapVehicle[Content.vehId] + '<button type="button" class="btn btn-danger btn-circle ">' + Content.subRecCount + '</button></a></b></td>\n\<td style="width:12%;">' + Content.device_date_time + '</td>\n\<td style="width: 20%">' + HashMapParameter[Content.pid] + ' ' + (HashMapParameterUnit[Content.pid]) + '</td>\n\<td style="width: 10%">' + Content.value + '</td>\n\<td style="width: 10%">' + Content.operator + ' ' + Content.param_range + '</td>\n\<td style="width: 10%">' + Content.actionTakenBy + '</td>\n\<td style="width: 10%">' + Content.timestamp + '</td>\n\<td style="max-width:100px"><span class="more">' + Content.description + '</span></td>\n\</tr>');
                                        }

                                    }
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                        //Added by sri hari
                        $('#total_notify_entry_id').text('');
                        $('#total_notify_entry_id').append(i);
                    }
                    //$("#id-alert-vehicle-list-tbody").niceScroll({cursorborder: "", cursorcolor: "#d36868", dblclickzoom: "false", autohidemode: "true", cursorwidth: "6"});
                    $('#notifyview-spinner').hide();

                    var $rows = $('#id-alert-vehicle-list-tbody tr');
                    $('#notify_search').keyup(function () {
                        var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
                        $rows.show().filter(function () {
                            var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                            return !~text.indexOf(val);
                        }).hide();
                    });

                    AlignNumberLeft();
                } else {
                    $("#id-alert-vehicle-list-tbody").html("<center><h3 style='color: #ff7f74;'>No Notifications To Display.</h3></center>");
                    $('#notifyview-spinner').hide();
                }
            }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                //Logout('Notification Error --> Notification & FDS table view' + textStatus, false);
                // window.location.href = "./index.html";
              // LoadPageInfo(0, false);
            }
        });
    } catch (e) {
    }
}

function EditClassifyAlert(alert_id, num, char, id, pid) {
    $("#ClassifyAlert" + id).html('<textarea maxlength="300" id="textarea">' + $('#ClassifyAlert' + id + ' p').text() + '</textarea><br><button id="btn_save" onclick=\'UpdateClassifyAlert("' + alert_id + '","' + num + '","' + char + '","' + id + '","' + pid + '")\' >Save</button><button id="btn_cancel" onclick=\'CancelClassifyAlert("' + alert_id + '","' + num + '","' + char + '","' + id + '","' + pid + '")\'>Cancel</button>');
}
function CancelClassifyAlert(alert_id, num, char, id, pid) {
    var discription = '<button onclick=\'EditClassifyAlert("' + alert_id + '","' + num + '","' + char + '","' + id + '","' + pid + '");\' >Action Pending</button>';
    $("#ClassifyAlert" + id).html(discription);
}
function UpdateClassifyAlert(alert_id, num, char, id, pid) {
    //var discription = '';
    var textContent = $('#ClassifyAlert' + id + ' textarea').val().trim();
    if (textContent.length === 0) {
        alertify.error("Please enter your description.");
    } else {
        $.ajax({
            url: UserURL + "Notifications",
            type: "POST",
            xhrFields: {withCredentials: true},
            dataType: 'json',
            data: {
                alert_id: alert_id,
                timestamp: num,
                textContent: textContent,
                vehicleId: char,
                paramId: pid,
                type: "NotificationDescriptionUpdateNew"
            }, success: function (data) {
                if (data.results) {
                    alertify.success("Description added successfully.");
                    $(".ClassifyAlert_tr" + id).remove();
                    //  var table = $('#notification_popup_table_id');
                    //  table.row('.ClassifyAlert_tr' + id).remove().draw(false);
                    $('#textarea').hide();
                    $('#btn_save').hide();
                    $('#btn_cancel').hide();

                    if ($('#id-alert-vehicle-list-tbody tr').length == 0) {
                        $("#notification-single-table").html("<center><h3 style='color: #ff7f74;'>No Notifications To Display.</h3></center>");
                    }
                } else {
                    alertify.error("Description added failed.");
                }
            }, error: function (err) {
                alertify.error("Unable to reach Server. Please Re-login");
            }
        });
    }
}
