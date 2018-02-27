// Default colors
var brandPrimary =  '#20a8d8';
var brandSuccess =  '#4dbd74';
var brandInfo =     '#63c2de';
var brandWarning =  '#f8cb00';
var brandDanger =   '#f86c6b';

var grayDark =      '#2a2c36';
var gray =          '#55595c';
var grayLight =     '#818a91';
var grayLighter =   '#d1d4d7';
var grayLightest =  '#f8f9fa';

angular
.module('app', [
  'ui.router',
  'oc.lazyLoad',
  'ncy-angular-breadcrumb',
  'angular-loading-bar',
  'ngCookies',
  'ui.bootstrap'
])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = false;
  cfpLoadingBarProvider.latencyThreshold = 1;
}])
.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
}])
.run(['$rootScope', '$state', '$stateParams',
  function($rootScope, $state, $stateParams) {
  $rootScope.$on('$stateChangeSuccess',function(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  });
  $rootScope.$state = $state;
  return $rootScope.$stateParams = $stateParams;
}]).run(['$rootScope',function($rootScope) {
  $rootScope.HOST_TMS = "http://172.16.0.229:8080/TMS/";
  $rootScope.HOST_TMS1 = "https://tpms-api.placer.in/TMS/";

    $rootScope.rootSelectedDeportId = 0;

    $rootScope.$on('handleEmit', function(event, args) {
      $rootScope.$broadcast('handleBroadcast', args);
    });
}]).factory("logger",[
  function(){
    var logIt;
    return toastr.options={closeButton: true, positionClass:"toast-bottom-right", "newestOnTop": true,
    preventDuplicates:true, progressBar: true, timeOut:"10000"},
    logIt=function(message,type){return toastr[type](message)},
    {
      log:function(message){logIt(message,"info")},
      logWarning:function(message){logIt(message,"warning")},
      logSuccess:function(message){logIt(message,"success")},
      logError:function(message){logIt(message,"error")}
    }
  }
]).filter('fclFIlter', function() {
  return function(fcl) {
    var output_fcl = fcl.replace(/[^0-9,]+/g, "");;
    var fcls = output_fcl.split(",");
    if(fcls.length > 3) {
      output_fcl = fcls[0]+','+fcls[1]+', more';
    }
    return output_fcl;
  }
}).filter('fclFIlter_2', function() {
  return function(fcl) {
    var output_fcl = fcl.replace(/[^0-9,]+/g, "");;
    var fcls = output_fcl.split(",");
    if(fcls.length > 2) {
      output_fcl = fcls[0]+',more';
    }
    return output_fcl;
  }
}).filter('DateTimeFormatter', function() {
  return function(longDate) {
    var dt =  new Date(longDate);

    var date = dt.getDate();
    if(dt.getDate() < 10){
      date = 0+""+dt.getDate();
    }

    var month = dt.getMonth();
    if((dt.getMonth()+1) < 10) {
      month = 0+""+(dt.getMonth()+1);
    }

    var hr = dt.getHours();
    if(dt.getHours() < 10) {
      hr = 0+""+dt.getHours();
    }

    var mm = dt.getMinutes();
    if(dt.getMinutes() < 10) {
      mm = 0+""+dt.getMinutes();
    }

    var ss = dt.getSeconds();
    if(dt.getSeconds() < 10) {
      ss = 0+""+dt.getSeconds();
    }

    var device_date_time = date +'-'+ month +'-'+ dt.getFullYear() +' '+ hr +':'+ mm +':'+ ss;
    return device_date_time;
  }
}).directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = elm[0];
    elm.bind('scroll', function() {
      if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
        scope.$apply(attr.whenScrolled);
      }
    });
  };
});
