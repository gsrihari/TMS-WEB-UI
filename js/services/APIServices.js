angular.module('app').service('APIServices', function($q) {


	this.callAPI = function(URL, reqObj, loadingImgStatus) {
		var deferred = $q.defer();
		if(loadingImgStatus == true)
		{
			loading.start();
		}
		var httpResponse = undefined;
		try	{
			$.ajax({
				url: URL,
	            type: "POST",
	            xhrFields: {withCredentials: true},
	            data:reqObj,
	            cache: false,
					success: function (result, textStatus, request) {
						try {
							 if(loadingImgStatus == true)
							 {
								 loading.finish();
							 }
						} catch (e) { console.log(e); }

	    			httpResponse = {
	    				data: result,
	    				request: request
	    			};
	    			deferred.resolve(httpResponse);
          },
          error: function (e) {
						if(loadingImgStatus == true)
						{
							loading.finish();
						}
              // return "";
              httpResponse = e;
              deferred.reject(httpResponse);
          }
			});
		}catch(err)
		{
			console.log(err);
		}

		return deferred.promise;
	};

	this.callGET_API = function(URL, loadingImgStatus) {
		var deferred = $q.defer();
		if(loadingImgStatus == true)
		{
			loading.start();
		}
		var httpResponse = undefined;
		try	{
			$.ajax({
							url: URL,
	            type: "GET",
	            xhrFields: {withCredentials: true},
	            cache: false,
					success: function (result, textStatus, request) {
						try {
							 if(loadingImgStatus == true)
							 {
								 loading.finish();
							 }
						} catch (e) { console.log(e); }

	    			httpResponse = {
	    				data: result,
	    				request: request
	    			};
	    			deferred.resolve(httpResponse);
          },
          error: function (e) {
						if(loadingImgStatus == true)
						{
							loading.finish();
						}
              // return "";
              httpResponse = e;
              deferred.reject(httpResponse);
          }
			});
		}catch(err)
		{
			console.log(err);
			loading.finish();
		}

		return deferred.promise;
	};
}).service('DashboardDataSharingServices', function() {

	var vehiclesList = [];

	var deportList = [];

	var AllSectionParam = [];

	var paramList_HashMap = new Object();

	var vehIdName_HashMap = new Object();

	var totalVehiclesList = [];

	var minMaxTempPressureValues_Obj = new Object();

	var setVehiclesList = function(vehiclesList) {
		this.vehiclesList = vehiclesList;
	};

	var getVehiclesList = function() {
			return this.vehiclesList;
	};

	var addDeportList = function(deports) {
      this.deportList = deports;
  };

	var getDeportList = function() {
      return this.deportList;
  };

	var setAllSectionParam = function(AllSectionParam)
	{
			this.AllSectionParam = AllSectionParam;
	}

	var getAllSectionParam = function()
	{
			return this.AllSectionParam;
	}

	var setParamListHashMap = function(paramList_HashMap)
	{
		this.paramList_HashMap = paramList_HashMap
	}

	var getParamListHashMap = function()
	{
			return this.paramList_HashMap;
	}

	var setVehIdName_HashMap = function(vehIdName_HashMap)
	{
		this.vehIdName_HashMap = vehIdName_HashMap;
	}

	var getVehIdName_HashMap = function()
	{
		return this.vehIdName_HashMap;
	}

	var setTotalVehiclesList = function(totalVehiclesList)
	{
		this.totalVehiclesList = totalVehiclesList;
	}

	var getTotalVehiclesList = function()
	{
		return this.totalVehiclesList;
	}

	var setMinMaxTempPressureValues_Obj = function(minMaxTempPressureValues_Obj)
	{
		this.minMaxTempPressureValues_Obj = minMaxTempPressureValues_Obj;
	}

	var getMinMaxTempPressureValues_Obj = function()
	{
		return this.minMaxTempPressureValues_Obj;
	}

	return {
    addDeportList: addDeportList,
    getDeportList: getDeportList,
		setVehiclesList: setVehiclesList,
		getVehiclesList: getVehiclesList,
		setTotalVehiclesList: setTotalVehiclesList,
		getTotalVehiclesList: getTotalVehiclesList,
		setAllSectionParam: setAllSectionParam,
		getAllSectionParam: getAllSectionParam,
		setParamListHashMap: setParamListHashMap,
		getParamListHashMap: getParamListHashMap,
		setVehIdName_HashMap: setVehIdName_HashMap,
		getVehIdName_HashMap: getVehIdName_HashMap,
		setMinMaxTempPressureValues_Obj: setMinMaxTempPressureValues_Obj,
		getMinMaxTempPressureValues_Obj: getMinMaxTempPressureValues_Obj
  };

});
