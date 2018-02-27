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
            if(httpResponse.data.result == undefined || httpResponse.data.result == null){

            } else {
              $rootScope.SIDEMENU = httpResponse.data.result[0].sideMenu;

              sessionStorage.setItem('SIDEMENU', $rootScope.SIDEMENU);
              sessionStorage.setItem('UserLevelId', httpResponse.data.result[0].userLevelId);
            }


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
