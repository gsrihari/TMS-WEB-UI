var FilterMarkerCategory = "all";
var displayAllDepotLocation = true;
var SelectedVehicleID = 0;
var latitude = 28.644800, longitude = 77.216721, map_zoom = 11;
var currentCategoryOfVehicles = "undefined";
var Allmarkers = new Array();
var infowindow = new google.maps.InfoWindow();
var allMarkersWithInfoWindows = new Array();
var MapAsideVehicleInfoWindowShow = 0; // display false
var infoWindows = [];
var infoWindowsHashMap = new Object();
var infoWindowVehId = new Array();
var HashMapVehicle = new Object();
var userSectionList = [];
var moving_count = 0;
var halted_count = 0;
var notworking_count = 0;
var CANdisconnect_count = 0;
var LiveTracking_url = "LiveTracking";
var baseURL = '';
var depoLocationMarkersList = new Array();
var depoLocationCirclesList = new Array();
var iconImg = "";

function FocusDepot(DepotLat, DepotLong, DeportName, DeportId, boolvalue) {
    var position = new google.maps.LatLng(DepotLat, DepotLong);
    var depotname = DeportName;
    var depotid = DeportId;
    displayAllDepotLocation = boolvalue;
    iconImg = "";
    if (depotid == 2) {
        iconImg = 'img/depot-icons/depot_SND.png';
    } else if (depotid == 3) {
        iconImg = 'img/depot-icons/depot_GTK.png';
    } else if (depotid == 4) {
        iconImg = 'img/depot-icons/depot_NND.png';
    } else if (depotid == 5) {
        iconImg = 'img/depot-icons/depot_ND.png';
    } else if (depotid == 6) {
        iconImg = 'img/depot-icons/depot_DWK.png';
    } else if (depotid == 7) {
        iconImg = 'img/depot-icons/depot_VVD.png';
    } else if (depotid == 9) {
        iconImg = 'img/depot-icons/depot_TKD.png';
    } else if (depotid == 10) {
        iconImg = 'img/depot-icons/depot_HND 2.png';
    } else if (depotid == 11) {
        iconImg = 'img/depot-icons/depot_SVD.png';
    } else if (depotid == 12) {
        iconImg = 'img/depot-icons/depot_KPD.png';
    } else if (depotid == 13) {
        iconImg = 'img/depot-icons/depot_WPD.png';
    } else if (depotid == 14) {
        iconImg = 'img/depot-icons/depot_GPD.png';
    } else if (depotid == 15) {
        iconImg = 'img/depot-icons/depot_NRLD.png';
    } else if (depotid == 16) {
        iconImg = 'img/depot-icons/depot_KJLD.png';
    }

    // map.setCenter(position);
    var circlecolor = 'rgba(57, 57, 56, 0.65)';
    if (displayAllDepotLocation == false) {
        if (depoLocationMarkersList.length > 1) {
            for (var i = 0; i < depoLocationMarkersList.length; i++) {
                depoLocationMarkersList[i].setMap(null);
            }
        }
        if (depoLocationCirclesList.length > 1) {
            for (var i = 0; i < depoLocationCirclesList.length; i++) {
                depoLocationCirclesList[i].setMap(null);
            }
        }
    }
    var depoLocationmarker = new google.maps.Marker({
        position: position,
        title: depotname,
        map: map,
        icon: iconImg,
        optimized: false,
        zIndex: 99999999,
        gid: depotid
    });

    google.maps.event.addListener(depoLocationmarker, "click", function (e) {
        depotWiseDisplay(depoLocationmarker.gid);
    });
    depoLocationMarkersList.push(depoLocationmarker);

    circle = new google.maps.Circle({
        map: map,
        radius: 200, // metres
        fillColor: 'rgba(57, 57, 56, 0.65)',
        strokeWeight: 1,
        strokeColor: circlecolor
    });
    depoLocationCirclesList.push(circle);
    circle.bindTo('center', depoLocationmarker, 'position');

    //If single deport is selected then change the map center to that deport location
    if(boolvalue == false)
    {
        map.setCenter(new google.maps.LatLng(DepotLat, DepotLong));
    }
    else {
      setMapToDefaultPosition();
    }
}

// Click function on depot icon
function depotWiseDisplay(groupid) {
    //Close the info window and side popup window
    MapAsideVehicleInfoWindowClose();

   // LoadPageInfo(groupid, false);

    displayAllDepotLocation = false;
    if (groupid == 0) {
        setMapToDefaultPosition();
        displayAllDepotLocation = true;
        $("#reset_depot").hide();
        for (i = 0; i < GroupList.length; i++) {
            FocusDepot(GroupList[i].depot_latitude, GroupList[i].depot_longitude,
                    GroupList[i].group_name, GroupList[i].group_id, false);
        }
    } else {
        displayAllDepotLocation = false;
        for (i = 0; i < GroupList.length; i++) {
            if (groupid == GroupList[i].group_id) {
                Lat = GroupList[i].depot_latitude;
                Long = GroupList[i].depot_longitude;
                var Group = GroupList[i].group_name;
            }
        }
        //Set the map center to depot lat, long
        var position = new google.maps.LatLng(Lat, Long);
        map.setCenter(position);
        FocusDepot(Lat, Long, Group, groupid, true);
    }
}

//Clear the dashboard
function ClearDashboardInfo() {
    infoWindows = [];
    infoWindowsHashMap = new Object();
    for (var i = 0; i < Allmarkers.length; i++) {
        Allmarkers[i].setMap(null);
    }
    Allmarkers = new Array();
    FilterMarkerCategory = "all";
    infowindow = new google.maps.InfoWindow();
    SelectedVehicleID = "0";
    MapAsideVehicleInfoWindowShow = 0; // display false
    HashMapVehicle = new Object();

    try {
        //Clearing deport location icons & circles
        for (var i = 0; i < depoLocationCirclesList.length; i++) {
            depoLocationCirclesList[i].setMap(null);
        }
    } catch (e) {
        console.log(e);
    }
}

function DrawGMap(APIURL, ModalStatus) {
    baseURL = APIURL;
    try {
        infoWindows = [];
        infoWindowsHashMap = new Object();
        Allmarkers = new Array();

        if (ModalStatus) {
            $("#googleMap1").height($(window).height());
        } else {
            $("#googleMap").height($(window).height());
        }
        //set google map options
        var map_options = {
            center: new google.maps.LatLng(latitude, longitude),
            zoom: map_zoom,
            panControl: false,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false
        };
        //inizialize the map
        if (ModalStatus) {
            map = new google.maps.Map(document.getElementById('googleMap1'), map_options);
        } else {
            map = new google.maps.Map(document.getElementById('googleMap'), map_options);
        }
        
        map.setCenter(new google.maps.LatLng(latitude, longitude));

        //$("#googleMap").height($(window).height());
        google.maps.event.trigger(map, 'resize');

        $.getJSON("./json/gmapStyles.json", function (jsonGmapStyles) {
            var GMapStyle = jsonGmapStyles.GMapStyle9;
            map.setOptions({'styles': GMapStyle});
        });

        //add custom buttons for the zoom-in/zoom-out on the map
        function CustomZoomControl(controlDiv, map) {
            //grap the zoom elements from the DOM and insert them in the map
            controlDiv = document.createElement('div');
            var controlUIzoomIn = document.getElementById('cd-zoom-in');
            var controlUIzoomOut = document.getElementById('cd-zoom-out');
            try {
              controlDiv.appendChild(controlUIzoomIn);
              controlDiv.appendChild(controlUIzoomOut);
            } catch (e) {
              console.log(e);
            }
            
            // Setup the click event listeners and zoom-in or out according to the clicked element
            google.maps.event.addDomListener(controlUIzoomIn, 'click', function () {
                map.setZoom(map.getZoom() + 1);
            });
            google.maps.event.addDomListener(controlUIzoomOut, 'click', function () {
                map.setZoom(map.getZoom() - 1);
            });
        }

        var zoomControlDiv = document.createElement('div');
        var zoomControl = new CustomZoomControl(zoomControlDiv, map);

        //insert the zoom div on the top left of the map
        map.controls[google.maps.ControlPosition.LEFT_TOP].push(zoomControlDiv);

        var ImgLoading = document.getElementById("ImgLoading");
        map.controls[google.maps.ControlPosition.CENTER].push(ImgLoading);

        var ResetBtn = document.getElementById("reset_depot");
        map.controls[google.maps.ControlPosition.LEFT].push(ResetBtn);
    } catch (e) {
      console.log(e);
    } 
}

//Plot the vehicles on map
function DrowMarkers(liveTrackingData, type, HashMapVehicleIdVehicleName, sectionList, isMapCenterChanged) {

    try {
        HashMapVehicle = HashMapVehicleIdVehicleName;
        userSectionList = sectionList;

        moving_count = 0;
        halted_count = 0;
        notworking_count = 0;
        CANdisconnect_count = 0;
        var err = true;

        $.each(liveTrackingData.results, function (a, vehicles) { // loop
            try {
                var vehLat, vehLng, vehSpeed, vehUpdateTime, vehLocation, canDisconnected, LatLngUpdatesMillis;
                $.each(vehicles.VehParamValues, function (a, VehParamValues) {
                    try {
                        if (VehParamValues.pid == 10001) {
                            var vehLatLng = (VehParamValues.value).split(",");
                            vehLat = vehLatLng[0];
                            vehLng = vehLatLng[1];
                        } else if (VehParamValues.pid == 10002) {
                            vehSpeed = VehParamValues.value;
                            vehUpdateTime = VehParamValues.device_date_time;
                            LatLngUpdatesMillis = VehParamValues.device_date_millis;
                        } else if (VehParamValues.pid == 10000) {
                            vehLocation = VehParamValues.value;
                        } else if (VehParamValues.pid == 10023) {
                            canDisconnected = VehParamValues.value;
                        }
                    } catch (e) {
                    }
                });
                if (!vehLat.undefined && !vehLng.undefined) {
                    err = false;
                    AddMarker(vehLat, vehLng, vehSpeed, vehUpdateTime, vehLocation, vehicles.veh_id,
                      vehicles.veh_name, canDisconnected, LatLngUpdatesMillis, isMapCenterChanged); // for a particular marker
                    if(isMapCenterChanged) {
                      $('#ImgLoading').hide('500');
                      map.setCenter(new google.maps.LatLng(vehLat, vehLng));
                    }
                } else {
                }
            } catch (e) {
            }
        });

        $('#map_total_count_id').text(moving_count + halted_count + notworking_count + CANdisconnect_count);
        $('#map_moving_count_id').text(moving_count);
        $('#map_halted_count_id').text(halted_count);
        $('#map_notwork_count_id').text(notworking_count);
        $('#map_CANdisconnect_count_id').text(CANdisconnect_count);

        $('#map_total_count_id2').text(moving_count + halted_count + notworking_count + CANdisconnect_count);
        $('#map_moving_count_id2').text(moving_count);
        $('#map_halted_count_id2').text(halted_count);
        $('#map_notwork_count_id2').text(notworking_count);
        $('#map_CANdisconnect_count_id2').text(CANdisconnect_count);
        
        if (!err && isMapCenterChanged == false) {
            FilterMarker(FilterMarkerCategory, "auto");
            $('#ImgLoading').hide('1000');
        }
        //Update the side popup window
        //if (currentCategoryOfVehicles !== "undefined" && SelectedVehicleID == 0) {
        //    FilterVehicle(currentCategoryOfVehicles);
        //}
    } catch (e) {
        console.log(e);
    } finally {

    }
}

//Add the marker to map
function AddMarker(vehLat, vehLng, vehSpeed, vehUpdateTime, vehLocation, veh_id, veh_name, canDisconnected,
  LatLngUpdatesMillis, isMapCenterChanged) {
    try {
        var stat_flag = 0; //validating using vehicleid marker if exists ...
        var ExistMarker;
        for (var i = 0; i < Allmarkers.length && stat_flag == 0; i++) {
            var marker_id = Allmarkers[i].id;
            if (marker_id == veh_id) {
                stat_flag = 1;
                ExistMarker = Allmarkers[i];
            }
        }
        var icon, category;
        var dateNow = new Date();
        var dateNowMillis = dateNow.getTime();
        if (LatLngUpdatesMillis < (dateNowMillis - (3600000 * 3))) {
            notworking_count++;
            icon = "img/markers/busnotworking.png";
            category = "notworking";
        } else if (canDisconnected === "1") {
            CANdisconnect_count++;
            category = "canDisconnected";
            icon = "img/markers/canDisconnected.png";
        } else if ((vehSpeed > 3) && (LatLngUpdatesMillis > (dateNowMillis - 180000))) {
            moving_count++;
            category = "moving";
            if (vehSpeed >= 70) {
                icon = "img/markers/speed70.gif";
            } else if (vehSpeed >= 60) {
                icon = "img/markers/speed69.gif";
            } else if (vehSpeed >= 50) {
                icon = "img/markers/speed59.gif";
            } else if (vehSpeed >= 40) {
                icon = "img/markers/speed49.gif";
            } else if (vehSpeed >= 30) {
                icon = "img/markers/speed39.gif";
            } else if (vehSpeed >= 20) {
                icon = "img/markers/speed29.gif";
            } else if (vehSpeed >= 10) {
                icon = "img/markers/speed19.gif";
            } else {
                icon = "img/markers/speed09.gif";
            }
        } else { // halt
            halted_count++;
            icon = "img/markers/bushalt.png";
            category = "halted";
        }

        // info window properties
        var boxText;
        var myOptions_txtbox;
        boxText = document.createElement("div");
        boxText.style.cssText = "border: 1px solid #999999; margin-top: 8px; border-radius: 5px; color: black; padding: 5px; background:#FFFFFF;";
        boxText.innerHTML = "<div class='center'><b>" + veh_name + "</b><br>" + vehUpdateTime + "<br>" + vehLocation + "</div>";
        myOptions_txtbox = {
            content: boxText
            , disableAutoPan: false
            , maxWidth: 0
            , pixelOffset: new google.maps.Size(-140, 0)
            , zIndex: null
            , boxStyle: {
                background: "url('./img/tipbox.gif') no-repeat"
                , opacity: 0.75
                , width: "280px"
            }
            , closeBoxMargin: "10px 2px 2px 2px"
            , closeBoxURL: "./img/close.gif"
            , infoBoxClearance: new google.maps.Size(1, 1)
            , isHidden: false
            , pane: "floatPane"
            , enableEventPropagation: false
        };

        if (stat_flag == 0) {
            try {
                var marker = new SlidingMarker({
                    position: new google.maps.LatLng(vehLat, vehLng),
                    map: map,
                    visible: true,
                    optimized: false,
                    id: veh_id,
                    title: veh_name
                });
                marker.setOptions({'icon': icon, category: category});

                //Create by defalut infoWindow
                infowindow[veh_id] = new InfoBox(myOptions_txtbox);

                google.maps.event.addListener(marker, "click", function (e) {
                    closeAllInfoWindows();
                    //Get info window from infoWindowsHashMap
                    infowindow[veh_id] = infoWindowsHashMap[veh_id];
                    if (infowindow[veh_id]) {
                    } else {
                        // Text box being created for marker `markers`
                        infowindow[veh_id] = new InfoBox(myOptions_txtbox);
                    }
                    marker.info = infowindow[veh_id];
                    infowindow[veh_id].open(map, marker);
                    map.panTo(this.position);
                    SelectedVehicleID = marker.id;
                    MapAsideVehicleInfoWindowShow = 1;
                    MapAsideVehicleInfoWindowOpen(veh_id);
                    infoWindowVehId[infoWindowVehId.length] = veh_id;

                    //Update the infoWindowsHashMap object
                    infoWindowsHashMap[veh_id] = infowindow[veh_id];
                });
                google.maps.event.addListener(infowindow[veh_id], 'closeclick', function () {
                    //Close the info window and side popup window
                    MapAsideVehicleInfoWindowClose();
                    VehicleAsideVehicleInfoWindowClose();
                });
                infoWindows.push(infowindow[veh_id]);
                //Add infowindow into the infoWindowsHashMap object
                infoWindowsHashMap[veh_id] = infowindow[veh_id];
                Allmarkers.push(marker);
            } catch (e) {
                console.log(e);
            } finally {

            }
        } else {
            try {
                ExistMarker.setOptions({'icon': icon, category: category});
                if (vehSpeed > 3) {
                    ExistMarker.setDuration(30000);
                    ExistMarker.setEasing('easeInOutQuint');
                    ExistMarker.setPosition(new google.maps.LatLng(vehLat, vehLng));
                }
                try {
                  // Find and update the infowindow which is currently opened
                  infowindow[veh_id] = infoWindowsHashMap[veh_id];
                  infowindow[veh_id].setContent(boxText);
                  ExistMarker.info = infowindow[veh_id];
                } catch (e) {
                    console.log(e);
                } finally {

                }

                if (parseInt(SelectedVehicleID) === parseInt(veh_id)) {
                    map.panTo(ExistMarker.position);
                    for (var i = 0; i < infoWindows.length; i++) {
                        if (infoWindows[i].veh_id === veh_id) {
                            //Replacing the new info window into the array
                            infoWindows[i] = infowindow[veh_id];
                        }
                    }
                }
                if (SelectedVehicleID === veh_id) {
                    if (MapAsideVehicleInfoWindowShow == 1) {
                        MapAsideVehicleInfo(veh_id);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    } catch (e) {

    }
}

function FilterMarker(category, type) {
    if (type == "click") {
        SelectedVehicleID = 0;
        MapAsideVehicleInfoWindowClose();
        VehicleAsideVehicleInfoWindowClose();
    }
    try {
        for (var i = 0; i < Allmarkers.length; i++) {
            if (Allmarkers[i].category == category || category == "all") {
                Allmarkers[i].setVisible(true);
            } else {
                Allmarkers[i].setVisible(false);
            }
        }
        FilterMarkerCategory = category;
        if (type == "click") {
        }
    } catch (e) {
        alert("a: " + e);
    }
    if (category == "all" && type == "click") {
    }
    //Set zoom to 11
    if (((category === "all" || category === "moving" || category === "halted" || category === "notworking"
            || category === "canDisconnected") && type == "click") || (displayAllDepotLocation === true && SelectedVehicleID === 0)) {
        setMapToDefaultPosition();
    }
}

//Default settings to map
function setMapToDefaultPosition() {
    try {
        map.setZoom(map_zoom);
        map.setCenter(new google.maps.LatLng(latitude, longitude));
    } catch (e) {
        console.log(e);
    }
}

function closeAllInfoWindows() {
    for (var i = 0; i < infoWindows.length; i++) {
        infoWindows[i].close();
    }
}

//Selected vehicle in selection in map view
function SelectedVehicle(vehicle_id) {
    try {
        MapAsideVehicleInfoWindowClose();
    } catch (e) {
        console.log(e);
    }
    try {
        $("#MenuDashboard")[0].click();
    } catch (err) {
    }

    for (var i in Allmarkers) {
        if (parseInt(Allmarkers[i].id) === parseInt(vehicle_id)) {
            var latlng = Allmarkers[i].getPosition();
            map.panTo(latlng);

            infowindow[vehicle_id].open(map, Allmarkers[i]);
            map.setZoom(16);
            SelectedVehicleID = vehicle_id;
            MapAsideVehicleInfoWindowShow = 1;

            Allmarkers[i].setAnimation(google.maps.Animation.BOUNCE);

            stopAnimation(Allmarkers[i]);
        } else {
            try {
            } catch (e) {
                console.log(e);
            }
        }
    }
    MapAsideVehicleInfoWindowOpen(vehicle_id);
}

function MapAsideVehicleInfoWindowOpen(vehicleId) {
    $('#map-list-view-aside').animate({
        width: '35%'
    }, 500, function () {
        $('#map-list-view-aside-close').html('<button class="btn-danger" type="button" onclick="MapAsideVehicleInfoWindowClose();" style="cursor: pointer;">X</button>');
        $("#map-list-view-aside-content-div").removeClass("hidden").empty();
        $("#map-list-view-aside-header").removeClass("hidden").empty();
        $("#map-list-view-aside-content-vehicle").removeClass("hidden").empty();
        $("#map-list-view-aside-content-vts").removeClass("hidden").empty();


        $("#map-list-view-aside-content-vehicle").append("<p><span>" + HashMapVehicle[vehicleId] + "</span></p>");
        $.each(userSectionList, function (c, MySectionList) {

            if (MySectionList.section_short_name == "VTS") {
                    $.each(MySectionList.section_param_list, function (d, MyParamList) {
                        if (MyParamList.parameter_id == 10000) {    //location
                           $("#map-list-view-aside-content-vts").append('<i class="fa fa-map-marker"> <span class="map-sideview-head-text" id="idDashBoardMapAsideCAN10000"> </span></i><br/>');
                        }
                        else if (MyParamList.parameter_id == 10002) {    //vehicle speed
                            $("#map-list-view-aside-content-vts").append('<i class="icon icon-speedometer"> <span class="speedhalt map-sideview-head-text" id="idDashBoardMapAsideCAN10002"> </span></i><br/>');
                        }
                    });
                    $("#map-list-view-aside-content-vts").append('<i class="fa fa-clock-o" aria-hidden="true"> <span class="map-sideview-head-text" id="idDashBoardMapAsideCAN"></span></i>');
            }
        });

        $.each(userSectionList, function (c, MySectionList) {
            if (MySectionList.section_short_name != "VTS") {
                $("#map-list-view-aside-content-div").append('<ul class="map-sideview-ui" id="idDashBoardMapVehSection' + MySectionList.section_id + '"><span class="section-list">' + MySectionList.section_name + '</span></ul>');
                $("#idDashBoardMapVehSection" + MySectionList.section_id).append('<div class="info-box-table" border="1" id="idDashBoardMapVehTableSection' + MySectionList.section_id + '"> </div>');
                $.each(MySectionList.section_param_list, function (d, MyParamList) {
                    var param_id = MyParamList.parameter_id;
                    $("#idDashBoardMapVehTableSection" + MySectionList.section_id + " ").append("<div class='row param-vals'><div class='col-md-6 col-sm-6 col-6'>" + MyParamList.parameter_short_name + '' + MyParamList.parameter_unit +
                         "</div><span>: </span><div class='col-md-5 col-sm-5 col-5' id='idDashBoardMapAsideCAN" + param_id + "'>" + $("#can-list-table-tr-td-veh" + vehicleId + "-param" + param_id).text() +
                         "</div></div>");
                });
                $("#map-list-view-aside-content-div").append('<div class="span1" ><hr class="bar-horizontal" style="margin-top:0rem !important"/> </div>');
            }
        });
        MapAsideVehicleInfo(vehicleId);
    });
}

function MapAsideVehicleInfoWindowClose() {
    try {
        closeAllInfoWindows();
    } catch (e) { console.log(e);

    }
    MapAsideVehicleInfoWindowShow = 0;
    $('#map-list-view-aside').animate({
        width: '0%'
    }, function () {
        $('#map-list-view-aside-close').text('');
        $("#map-list-view-aside-header").addClass("hidden");
        $("#map-list-view-aside-content-div").addClass("hidden");
        $("#map-list-view-aside").css('overflow','hidden');
    });
    currentCategoryOfVehicles = "undefined";
    //We need to close info window also(tool tip)
    SelectedVehicleID = 0;
}

function VehicleAsideVehicleInfoWindowClose() {
    try {
        closeAllInfoWindows();
    } catch (e) { console.log(e);

    }
    VehicleAsideVehicleInfoWindowShow = 0;
    $('#vehicle-list-view-aside').animate({
        width: '0%'
    }, function () {
        $('#vehicle-list-view-aside-close').text('');
        $("#vehicle-list-view-aside-header").addClass("hidden");
        $("#vehicle-list-view-aside-content-div").addClass("hidden");
        $("#vehicle-list-view-aside").css('overflow','hidden');
    });
    currentCategoryOfVehicles = "undefined";
    SelectedVehicleID = 0;
}

function MapAsideVehicleInfo(veh_id) {
    var paramListLocal = new Array();
    var fds_device_sidepopup = " ";
    var vehicle_speed = 0;
    var FCL_List = [];

    //We are fetching data from table (in table view) based on selected tab id
    //Remaining pids only we are passing in service
    $.each(userSectionList, function (c, MySectionList) {
        $.each(MySectionList.section_param_list, function (d, MyParamList) {
            if ($("#can-list-table-tr-td-veh" + veh_id + "-param" + MyParamList.parameter_id).length == 0) {
                paramListLocal[paramListLocal.length] = MyParamList.parameter_id;
            }
        });
    });
    //speed param id for FDS color code
    paramListLocal[paramListLocal.length] = 10002;

    //To get the FC List
    paramListLocal[paramListLocal.length] = 10024;

    var vehListLocal = new Array();
    vehListLocal[0] = veh_id;

    var CANLatestDateTimeReq = false;
    $.ajax({
        url: baseURL + LiveTracking_url, //$.cookie('UserURL') + "LiveTracking",
        type: "POST",
        xhrFields: {withCredentials: true},
        dataType: 'json',
        data: {vehicleid: vehListLocal, parametersid: paramListLocal, AccessToken: '', CANLatestDateTimeReq: CANLatestDateTimeReq},
        success: function (data) {
            $.each(data.results, function (a, vehicles) { // loop
                $.each(vehicles.VehParamValues, function (a, VehParamValues) {
                    if (VehParamValues.pid == 10002) {
                        vehicle_speed = parseInt(VehParamValues.value);
                    }
                    if (VehParamValues.pid == 10024) {
                        FCL_List = new Array(VehParamValues.value);
                    }
                });
                $("#idDashBoardMapAsideCAN").text(vehicles.veh_updated_time);

                $.each(vehicles.VehParamValues, function (a, VehParamValues) {
                    if (VehParamValues.pid == 10000) {      //location
                        $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value);
                    }
                    if (VehParamValues.pid == 10002) {      //vehicle speed
                        $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value);
                    }
                    if (VehParamValues.pid == 10 || VehParamValues.pid == 11) {
                        if (parseInt(VehParamValues.value) < 0) {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text("Fault");
                        } else {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value);
                        }
                    } else if (VehParamValues.pid == 10012) {
                        fds_device_sidepopup = VehParamValues.value;
                        if (VehParamValues.value == 'ON' || (VehParamValues.value == 'OFF' && vehicle_speed <= 3)) {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value).css('color', 'green');
                        } else if (VehParamValues.value == 'OFF' && vehicle_speed > 3) {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value).css('color', 'red');
                        } else {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value);
                        }
                    } else if (VehParamValues.pid == 10013 || VehParamValues.pid == 10014) {
                        if (fds_device_sidepopup == "OFF" && vehicle_speed > 3) {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value).css('color', 'black');
                        } else if (VehParamValues.value == 'OFF') {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value).css('color', 'green');
                        } else if (VehParamValues.value == 'ON') {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value).css('color', 'red');
                        } else {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value);
                        }
                    } else if (VehParamValues.pid == 14 || VehParamValues.pid == 15 || VehParamValues.pid == 33 || VehParamValues.pid == 39) {
                        if (VehParamValues.value == 'Lamp Off') {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value).css('color', 'green');
                        } else if (VehParamValues.value == 'Lamp On' || VehParamValues.value == 'Error') {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value).css('color', 'red');
                        } else {
                            $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value);
                        }
                    } else if (VehParamValues.pid == 10024) {
                        var fcList = new Array(VehParamValues.value);
                        var fcListTemp = VehParamValues.value;
                        var fcListValue = VehParamValues.value.replace(/['"]+/g, '');
                        fcList = JSON.parse(fcListValue);

                        var btnTitle = "";

                        if (fcList.length == 1) {
                            btnTitle = fcList;
                        } else if (fcList.length > 1) {
                            for (var i = 0; fcList.length > i, i < 2; i++) {
                                if (btnTitle == "") {
                                    btnTitle = fcList[i];
                                } else {
                                    btnTitle = btnTitle + ", " + fcList[i];
                                }
                            }
                            if (fcList.length > 2) {
                                btnTitle = btnTitle + ", More...";
                            } else {
                                btnTitle = btnTitle;
                            }
                        }
                        var fcListBtn = '<button id="fcdListBtn" class="btn btn-info-outline" type="button" >' + btnTitle + '</button>';
                        if(fcList.length > 0)
                        {
                          fcListBtn = '<button id="fcdListBtn" class="btn btn-info-outline" type="button" onclick=getFCDescriptions('+fcListTemp+');>' + btnTitle + '</button>';
                          $("#idDashBoardMapAsideCAN" + VehParamValues.pid).html(fcListBtn);
                        }
                    } else {
                        $("#idDashBoardMapAsideCAN" + VehParamValues.pid).text(VehParamValues.value);
                    }
                });

                //add the selected section data to side popup
                $.each(userSectionList, function (c, MySectionList) {
                    $.each(MySectionList.section_param_list, function (d, MyParamList) {
                        if ($("#can-list-table-tr-td-veh" + veh_id + "-param" + MyParamList.parameter_id).length == 0) {

                        } else {
                            var value = $("#can-list-table-tr-td-veh" + veh_id + "-param" + MyParamList.parameter_id).text();
                            if (MyParamList.parameter_id == 14 || MyParamList.parameter_id == 15 || MyParamList.parameter_id == 39 || MyParamList.parameter_id == 33) {
                                if (value == 'Lamp Off') {
                                    $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text(value).css('color', 'green');
                                } else if (value == 'Lamp On' || value == 'Error') {
                                    $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text(value).css('color', 'red');
                                } else {
                                    $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text(value);
                                }
                            } else if (MyParamList.parameter_id == 10012) {
                                fds_device_sidepopup = value;
                                //Assgning the value to list
                                MyParamList.value = value;
                                if (MyParamList.value == 'ON' || (MyParamList.value == 'OFF' && vehicle_speed <= 3)) {
                                    $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text(MyParamList.value).css('color', 'green');
                                } else if (MyParamList.value == 'OFF' && vehicle_speed > 3) {
                                    $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text(MyParamList.value).css('color', 'red');
                                } else {
                                    $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text(MyParamList.value);
                                }
                            } else if (MyParamList.parameter_id == 10013 || MyParamList.parameter_id == 10014) {
                                //Assgning the value to list
                                MyParamList.value = value;
                                if (fds_device_sidepopup == "OFF" && vehicle_speed > 3) {
                                    $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text(MyParamList.value).css('color', 'black');
                                } else if (MyParamList.value == 'OFF') {
                                    $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text(MyParamList.value).css('color', 'green');
                                } else if (MyParamList.value == 'ON') {
                                    $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text(MyParamList.value).css('color', 'red');
                                } else {
                                    $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text(MyParamList.value);
                                }
                            } else if (MyParamList.parameter_id == 10024) {
                                var fcList = new Array(FCL_List);
                                var fcListTemp = new Array(FCL_List);
                                var fcListValue = FCL_List.replace(/['"]+/g, '');
                                fcList = JSON.parse(fcListValue);

                                var btnTitle = "";
                                if (fcList.length == 1) {
                                    btnTitle = fcList;
                                } else if (fcList.length > 1) {
                                    for (var i = 0; fcList.length > i, i < 2; i++) {
                                        if (btnTitle == "") {
                                            btnTitle = fcList[i];
                                        } else {
                                            btnTitle = btnTitle + ", " + fcList[i];
                                        }
                                    }
                                    if (fcList.length > 2) {
                                        btnTitle = btnTitle + ", More...";
                                    } else {
                                        btnTitle = btnTitle;
                                    }
                                }
                                if(fcListTemp.length > 0) {
                                  var fcListBtn = '<button id="fcdListBtn" class="btn btn-info-outline" type="button" onclick=getFCDescriptions('+fcListTemp+');>' + btnTitle + '</button>';
                                  $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).html(fcListBtn);
                                }
                            } else {
                                $("#idDashBoardMapAsideCAN" + MyParamList.parameter_id).text($("#can-list-table-tr-td-veh" + veh_id + "-param" + MyParamList.parameter_id).text());
                            }
                        }
                    });
                });
            });
        }
    });
    // LoadTrackingInfo(vehListLocal, paramListLocal, "MapAsideCAN", false, function (data) {
    //
    // });
    AlignNumberLeft();
}

function AlignNumberLeft() {
    $('tr').each(function () {
        // right align any numeric columns
        $(this).children('td:gt(0)').filter(function () {
            var cond1 = this.innerHTML.match(/^[0-9\s\.\-,]+$/);
            if (cond1) {
                $(this).css('text-align', 'center');
                $(".testclass").css('text-align', 'center');
            }
        }).css('text-align', 'center');

        // right align any date columns in ddmmmyyyy format
        $(this).children('td:gt(0)').filter(function () {
            var cond2 = this.innerHTML.match(/\d{1,2}\w{3}\d{2,4}/);
            if (cond2) {
                $(this).css('text-align', 'center');
                $(".testclass").css('text-align', 'center');
            }
        }).css('text-align', 'center');
    });
}

function getFCDescriptions(btnTitle) {
    $("#fcDescModal").modal();
    $.ajax(baseURL + "FaultCodeDescription?RequestParam={fclist:[" + btnTitle + "] }", {
        success: function (data) {

            drawTable(data);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function drawTable(data) {
    var fcdArray = data.faultcode;
    try {
        var tbl = document.getElementById('fcdTab');
        if (tbl)
            tbl.parentNode.removeChild(tbl);
    } catch (error) {
        error.message;
    }

    var fcdDataTable = document.getElementById("fcdDataTable");
    var tbl = document.createElement('table');
    tbl.style.width = '100%';
   // tbl.setAttribute('border', '1');
    tbl.setAttribute('id', 'fcdTab');
    tbl.setAttribute( 'class', 'table table-fixed table-bordered table-striped table-responsive');

    //var col0 = document.createElement('col');
    //col0.style.width = '10px';
    //var col1 = document.createElement('col');
    //col1.style.width = '20px';
    //var col2 = document.createElement('col');
    //col2.style.width = '200px';
    //
    //tbl.appendChild(col0);
    //tbl.appendChild(col1);
    //tbl.appendChild(col2);

    var tbdy = document.createElement('tbody');
    var tbdy = document.createElement('tbody');
    tbdy.setAttribute("style", "height:285px !important; display:block;");
    tbdy.setAttribute('id', 'mapfcdTab-id');
    var trHeader = document.createElement('tr');
    trHeader.setAttribute( 'class', 'row' );

    var sNoheader = document.createElement('th');
    sNoheader.setAttribute( 'class', 'col-md-1 col-sm-1 col-1 tableHead-center mapFcdHead');
    sNoheader.appendChild(document.createTextNode("S. No"));

    var fcheader = document.createElement('th');
    fcheader.setAttribute( 'class', 'col-md-2 col-sm-2 col-2 tableHead-center mapFcdHead' );
    fcheader.appendChild(document.createTextNode("Cummins Fault Code"));

    var fcdHeader = document.createElement('th');
    fcdHeader.setAttribute( 'class', 'col-md-9 col-sm-9 col-9 tableHead-center mapFcdHead' );
    fcdHeader.appendChild(document.createTextNode("Cummins Description"));

    trHeader.appendChild(sNoheader);
    trHeader.appendChild(fcheader);
    trHeader.appendChild(fcdHeader);
    tbdy.appendChild(trHeader);

    for (var i = 0; i < fcdArray.length; i++) {
        var tr = document.createElement('tr');
        tr.setAttribute( 'class', 'row' );

        var sNo = document.createElement('td');
        sNo.setAttribute( 'class', 'col-md-1 col-sm-1 col-1 tableHead-center' );
        sNo.appendChild(document.createTextNode(i+1));

        var fc = document.createElement('td');
        fc.setAttribute( 'class', 'col-md-2 col-sm-2 col-2' );
        fc.appendChild(document.createTextNode(fcdArray[i].CumminsFaultCode));

        var fcd = document.createElement('td');
        fcd.setAttribute( 'class', 'col-md-9 col-sm-9 col-9' );
        fcd.appendChild(document.createTextNode(fcdArray[i].Cummins_Description));

        tr.appendChild(sNo);
        tr.appendChild(fc);
        tr.appendChild(fcd);
        tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
    fcdDataTable.appendChild(tbl);
}

function FilterVehicle(category) {
    //1. Find vehicles
    //2. Call service
    //3. Prepare UI
    currentCategoryOfVehicles = category;
    var index = 0;
    var vehiclesList = new Array();
    $('#vehicle-list-view-aside').animate({
        width: '35%'
    }, 500, function () {
        $('#vehicle-list-view-aside-close').html('<button class="btn-danger" type="button" onclick="VehicleAsideVehicleInfoWindowClose();" style="cursor:pointer;">X</button>');
        $("#vehicle-list-view-aside-content-div").removeClass("hidden").empty();
        $("#vehicle-list-view-aside-header").removeClass("hidden").empty();

        if (category === "canDisconnected") {
            $("#vehicle-list-view-aside-header").html("<h4 class='popupTableHead'> CAN Disconnected Vehicles </h4>");
            $("#vehicle-list-view-aside-content-div").append(' <table class="table table-fixed table-bordered table-striped table-responsive" style="width:100%" border="1" id="idCANDisconnectMapVehTable"><thead class="row"></thead><tbody></tbody></table>');
            $("#idCANDisconnectMapVehTable thead").append("<td class='col-md-4 col-sm-4 col-4 vehicle-popupHeader'> Vehicle Name </td><td class='col-md-4 col-sm-4 col-4 vehicle-popupHeader'> CAN Updated Date </td><td class='col-md-4 col-sm-4 col-4 vehicle-popupHeader'> Battery Status </td>");
        } else if (category == "notworking") {
            $("#vehicle-list-view-aside-header").html("<h4 class='popupTableHead'> Offline Vehicles </h4>");
            $("#vehicle-list-view-aside-content-div").append(' <table class="table table-fixed table-bordered table-striped table-responsive" style="width:100%" border="1" id="idCANDisconnectMapVehTable"><thead class="row"></thead><tbody></tbody></table>');
            $("#idCANDisconnectMapVehTable thead").append("<td class='col-md-4 col-sm-4 col-4 vehicle-popupHeader'> Vehicle Name </td><td class='col-md-4 col-sm-4 col-4 vehicle-popupHeader'> VTS Updated Date </td><td class='col-md-4 col-sm-4 col-4 vehicle-popupHeader'> Location </td>");
        } else {
            $("#vehicle-list-view-aside-content-div").append(' <table class="table table-fixed table-bordered table-striped table-responsive" style="width:100%" border="1" id="idCANDisconnectMapVehTable"><thead class="row"></thead><tbody></tbody></table>');
            $("#idCANDisconnectMapVehTable thead").append("<td class='col-md-4 col-sm-4 col-4 vehicle-popupHeader'> Vehicle Name </td><td class='col-md-4 col-sm-4 col-4 vehicle-popupHeader'> Updated Date </td><td class='col-md-4 col-sm-4 col-4 vehicle-popupHeader'> Battery Status </td>");
        }
    });
    var i = 0;
    $.each(Allmarkers, function (c, marker) {
        if (marker.category == category || category == "all") {
            var vehicleId = marker.id;
            vehiclesList[index] = parseInt(vehicleId);
            index++;
        } else {
            marker.setVisible(false);
        }
        i++;
    });
    MapAsideVehiclesInfo(vehiclesList, category);
}

function MapAsideVehiclesInfo(vehiclesList, category) {
    var paramListLocal = new Array();
    var CANLatestDateTimeReq = false;
    if (category === "canDisconnected") {
        paramListLocal[0] = 53;     // Battery Voltage pid
        CANLatestDateTimeReq = true;
    } else {
        paramListLocal[0] = 10000;  // VTS pid
    }
    try {
      $.ajax({
          url: baseURL + LiveTracking_url, //$.cookie('UserURL') + "LiveTracking",
          type: "POST",
          xhrFields: {withCredentials: true},
          dataType: 'json',
          data: {vehicleid: vehiclesList, parametersid: paramListLocal, AccessToken: '', CANLatestDateTimeReq: CANLatestDateTimeReq},
          success: function (data) {
              // sorting based on vehicle name
              data.results.sort(function (a, b) {
                  return a.veh_name == b.veh_name ? 0 : a.veh_name < b.veh_name ? -1 : 1;
              })

              $.each(data.results, function (a, vehicles) { // loop
                  if (category === "canDisconnected") {
                      //In CAN disconnected list, showing latest CAN updated date time
                      if (vehicles.VehParamValues.length == 0) {
                          $('#vehicle-list-view-aside').animate({
                              width: '35%'
                          }, 1, function () {
                            //$("#vehicle-list-view-aside-content-vehicle").append("<p><span>" + HashMapVehicle[vehicles.veh_id] + "</span></p>");
                              $("#idCANDisconnectMapVehTable").append("<tr class='row' id='idDashBoardMapAsideCAN" + vehicles.veh_id
                                      + "'><td class='col-md-4 col-sm-4 col-4 vehicleNameStyle'><a href='javascript:;' style='color: black !important;' onClick='SelectedCANVehicle(" + vehicles.veh_id + ");'>" + HashMapVehicle[vehicles.veh_id] +
                                      "</a></td><td class='col-md-4 col-sm-4 col-4'>" + vehicles.CAN_updated_time
                                      + "</td><td class='col-md-4 col-sm-4 col-4'></td></tr>");
                          });
                      } else {
                          $.each(vehicles.VehParamValues, function (a, VehParamValues) {
                              $('#vehicle-list-view-aside').animate({
                                  width: '35%'
                              }, 1, function () {
                                  $("#idCANDisconnectMapVehTable tbody").append("<tr class='row' id='idDashBoardMapAsideCAN" + vehicles.veh_id
                                          + "'><td class='col-md-4 col-sm-4 col-4 vehicleNameStyle'><a style='color: black !important;' href='javascript:;' onClick='SelectedCANVehicle(" + vehicles.veh_id + ");'>" + HashMapVehicle[vehicles.veh_id] +
                                          "</a></td><td class='col-md-4 col-sm-4 col-4' style='text-align:center;'>" + vehicles.CAN_updated_time
                                          + "</td><td class='col-md-4 col-sm-4 col-4' style='text-align:center;'>" + vehicles.VehParamValues[0].value + "</td></tr>");
                              });
                          });
                      }
                  } else {
                      //In Offline vehicles list, showing VTS updated date time
                      if (vehicles.VehParamValues.length == 0) {
                          $('#vehicle-list-view-aside').animate({
                              width: '35%'
                          }, 1, function () {

                              $("#idCANDisconnectMapVehTable tbody").append("<tr class='row id='idDashBoardMapAsideCAN" + vehicles.veh_id
                                      + "'><td class='col-md-4 col-sm-4 col-4 vehicleNameStyle'><a href='javascript:;' style='color: black !important;' onClick='SelectedCANVehicle(" + vehicles.veh_id + ");'>" + HashMapVehicle[vehicles.veh_id] +
                                      "</a></td><td class='col-md-4 col-sm-4 col-4'>" + vehicles.veh_updated_time
                                      + "</td><td class='col-md-4 col-sm-4 col-4'></td></tr>");
                          });
                      } else {
                          $.each(vehicles.VehParamValues, function (a, VehParamValues) {
                              $('#vehicle-list-view-aside').animate({
                                  width: '35%'
                              }, 1, function () {
                                  $("#idCANDisconnectMapVehTable tbody").append("<tr class='row id='idDashBoardMapAsideCAN" + vehicles.veh_id
                                          + "'><td class='col-md-4 col-sm-4 col-4 vehicleNameStyle'><a style='color: black !important;' href='javascript:;' onClick='SelectedCANVehicle(" + vehicles.veh_id + ");'>" + HashMapVehicle[vehicles.veh_id] +
                                          "</a></td><td class='col-md-4 col-sm-4 col-4' style='text-align:center;'>" + vehicles.veh_updated_time
                                          + "</td><td class='col-md-4 col-sm-4 col-4' style='text-align:center;'>" + VehParamValues.value + "</td></tr>");
                              });
                          });
                      }
                  }
              });
          }
      });
    } catch (e) {

    } finally {

    }
}

function SelectedCANVehicle(vehicle_id) {
    try {
        VehicleAsideVehicleInfoWindowClose();
        $("#MenuDashboard")[0].click();
    } catch (err) {
    }

    for (var i in Allmarkers) {
        if (parseInt(Allmarkers[i].id) === parseInt(vehicle_id)) {
            var latlng = Allmarkers[i].getPosition();
            map.panTo(latlng);

            infowindow[vehicle_id].open(map, Allmarkers[i]);
            map.setZoom(16);
            SelectedVehicleID = vehicle_id;
            MapAsideVehicleInfoWindowShow = 1;

            Allmarkers[i].setAnimation(google.maps.Animation.BOUNCE);

            stopAnimation(Allmarkers[i]);
        } else {
            try {
                var m_id = Allmarkers[i].id;
                infowindow[m_id].close(map, Allmarkers[i]);
            } catch (e) {
            }
        }
    }

    MapAsideVehicleInfoWindowOpen(vehicle_id);
}

function stopAnimation(marker) {
    setTimeout(function () {
        marker.setAnimation(null);
    }, 3000);
}
