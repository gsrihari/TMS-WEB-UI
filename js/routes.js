angular
.module('app')
.config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$breadcrumbProvider', function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $breadcrumbProvider) {

  // $urlRouterProvider.otherwise('/dashboard');
  $urlRouterProvider.otherwise('/login');

  $ocLazyLoadProvider.config({
    // Set to true if you want to see what and when is dynamically loaded
    debug: true
  });

  $breadcrumbProvider.setOptions({
    prefixStateName: 'app.main',
    includeAbstract: true,
    template: '<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>'
  });

  $stateProvider
  .state('app', {
    abstract: true,
    templateUrl: 'views/common/layouts/full.html',
    //page title goes here
    ncyBreadcrumb: {
      label: 'Root',
      skip: true
    },
    resolve: {
      loadCSS: ['$ocLazyLoad', function($ocLazyLoad) {
        // you can lazy load CSS files
        return $ocLazyLoad.load([{
          serie: true,
          name: 'Font Awesome',
          files: ['css/font-awesome.min.css']
        },{
          serie: true,
          name: 'Simple Line Icons',
          files: ['css/simple-line-icons.css']
        }]);
      }],
      loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
        // you can lazy load files for an existing module
        return $ocLazyLoad.load([{
          serie: true,
          name: 'chart.js',
          files: [
            'bower_components/chart.js/dist/Chart.min.js',
            'bower_components/angular-chart.js/dist/angular-chart.min.js'
          ]
        }]);
      }],
    }
  })

  .state('app.main', {
    url: '/dashboard',
    templateUrl: 'views/main.html',
    controller: 'TMSDashboardController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'Home',
    },
    //page subtitle goes here
    params: { subtitle: 'Complete Fleet Management' },
    resolve: {
      loadCSS: ['$ocLazyLoad', function($ocLazyLoad) {
        // you can lazy load CSS files
        return $ocLazyLoad.load([{
          serie: true,
          name: 'Card View',
          files: ['css/cardview.css']
        },{
          serie: true,
          name: 'select2',
          files: ['css/map-style.css']
        }]);
      }],
      loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
        // you can lazy load files for an existing module
        return $ocLazyLoad.load([
          {
            serie: true,
            name: 'chart.js',
            files: [
              'bower_components/chart.js/dist/Chart.min.js',
              'bower_components/angular-chart.js/dist/angular-chart.min.js'
            ]
          },
        ]);
      }],
      loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
        // you can lazy load controllers
        return $ocLazyLoad.load({
          files: ['js/controllers/main.js']
        });
      }]
    }
  })

  .state('appSimple', {
    abstract: true,
    templateUrl: 'views/common/layouts/simple.html',
    resolve: {
      loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
        // you can lazy load files for an existing module
        return $ocLazyLoad.load([{
          serie: true,
          name: 'Font Awesome',
          files: ['css/font-awesome.min.css']
        },{
          serie: true,
          name: 'Simple Line Icons',
          files: ['css/simple-line-icons.css']
        }]);
      }],
    }
  })

  .state('appSimple.login', {
    url: '/login',
    templateUrl: 'views/pages/login.html',
    controller: 'LoginController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'Table',
    },
    //page subtitle goes here
    params: { subtitle: 'Complete Fleet Management' },
    resolve: {
      loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
        // you can lazy load controllers
        return $ocLazyLoad.load({
          files: ['bower_components/encryption/AesUtil.js',
                  'bower_components/encryption/aes.js',
                  'bower_components/encryption/pbkdf2.js',
                  'bower_components/encryption/encrypt.js']
        });
      }]
    }
  })

  .state('app.tms-vehicles', {
    url: '/tms-vehicles',
    templateUrl: 'views/pages/tms-vehicles.html',
    controller: 'TMSController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })

  .state('app.tms-tyre', {
    url: '/tms-tyre',
    templateUrl: 'views/pages/tms-tyre.html',
    controller: 'TMSController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })

  .state('app.tmsTyreService', {
    url: '/tmsTyreService',
    templateUrl: 'views/pages/tmsTyreService.html',
    controller: 'TMSController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })

  .state('app.tmsTyreInspection', {
    url: '/tmsTyreInspection',
    templateUrl: 'views/pages/tmsTyreInspection.html',
    controller: 'TMSController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })

  .state('app.tyreTempPressure', {
    url: '/tyreTempPressure',
    templateUrl: 'views/pages/tyreTempPressure.html',
    controller: 'TMSTempPressureController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })

  // Reports
  .state('app.tpms-report', {
    url: '/tpms-report',
    templateUrl: 'views/pages/tpms-report.html',
    controller: 'TPMSReportController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })

  // Org Admin Or Sys Admin
  .state('app.tms-sensor', {
    url: '/tms-sensor',
    templateUrl: 'views/pages/tms-sensor.html',
    controller: 'TMSSysAdminController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })

  .state('app.tms-bluetooth', {
    url: '/tms-bluetooth',
    templateUrl: 'views/pages/tms-bluetooth.html',
    controller: 'TMSSysAdminController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })

  .state('app.tms-rfid', {
    url: '/tms-rfid',
    templateUrl: 'views/pages/tms-rfid.html',
    controller: 'TMSSysAdminController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })


  // Only for Sys Admin
  .state('app.tms-assignVehicle', {
    url: '/tms-assignVehicle',
    templateUrl: 'views/pages/tms-assignVehicle.html',
    controller: 'TMSSysAdminController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })

  .state('app.tms-vehDetails', {
    url: '/vehDetails',
    templateUrl: 'views/pages/tms-semiCongVeh.html',
    controller: 'TMSDashboardController'
  })

  .state('app.tms-vehicleDetails', {
    url: '/tms-vehicleDetails',
    templateUrl: 'views/pages/tms-vehicleDetails.html',
    controller: 'TMSSysAdminController',
    //page title goes here
    ncyBreadcrumb: {
      label: 'TMS',
    },
    //page subtitle goes here
    params: { subtitle: 'Tyre Monitor System' },
  })

  .state('appSimple.register', {
    url: '/register',
    templateUrl: 'views/pages/register.html'
  })

  .state('appSimple.404', {
    url: '/404',
    templateUrl: 'views/pages/404.html'
  })

  .state('appSimple.500', {
    url: '/500',
    templateUrl: 'views/pages/500.html'
  })

}]);
