angular
.module('app')
.directive('a', preventClickDirective)
.directive('a', bootstrapCollapseDirective)
.directive('a', navigationDirective)
.directive('button', layoutToggleDirective)
.directive('a', layoutToggleDirective)
.directive('button', collapseMenuTogglerDirective)
.directive('div', bootstrapCarouselDirective)
.directive('toggle', bootstrapTooltipsPopoversDirective)
.directive('tab', bootstrapTabsDirective)
.directive('button', cardCollapseDirective)
.directive('hcPie', hcPieDirective)
.directive('hcBar', hcBarDirective)

function hcPieDirective() {
  return {
    restrict: 'C',
    replace: true,
    scope: {
      items: '=items',
      innerid: '=innerid',
      someCtrlFn:'&callbackFn'
    },
    controller: function ($scope, $element, $attrs) {
      // console.log(1);
    },
    // scope: { someCtrlFn: '&callbackFn' },
    template: '<div id="container" style="margin: 0 auto"></div>',
    link: function (scope, element, attrs) {
      // console.log(scope.innerid);
      //Create inner div and append to template
      var view = '<div id="' + scope.innerid + '" style="min-width: 310px; height: 290px; max-width: 600px; margin: 0 auto"></div>';
      element.append(view);

      Highcharts.setOptions({
        colors: ['#E62D5D', '#0FB199'],
        credits: {
          enabled: false
        },
        global: {
          useUTC: false
        }
      });
      var chart = new Highcharts.Chart({
        chart: {
          renderTo: scope.innerid,
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          text: ''
        },
        tooltip: {
          // pointFormat: '{series.name}: <b>{point.y}</b>',
          // percentageDecimals: 1
          formatter: function() {
              return 'Total Records: ' + this.y;
          }

        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              color: '#000000',
              connectorColor: '#000000',
              formatter: function () {
                // return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
              }
            },
            showInLegend: true,
          },
          series: {
            point: {
              events: {
                legendItemClick: function (event) {
                  var options = this.options;
                  // alert('hi '+options.id);
                  scope.someCtrlFn({id: options.id});
                  return false; // <== returning false will cancel the default action
                },
                click : function(event){
                  var options = this.options;
                  // alert('hi1 : '+options.id +" - "+options.name);
                  scope.someCtrlFn({id: options.id});
                }
              }
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Total',
          data: scope.items
        }]
      });
      scope.$watch("items", function (newValue) {
        // console.log(newValue);
        chart.series[0].setData(newValue, true);
      }, true);
    }
  }
}

//Working copy backup
// function hcPieDirective() {
//   return {
//     restrict: 'C',
//     replace: true,
//     scope: {
//       items: '=items',
//       innerid: '=innerid'
//     },
//     controller: function ($scope, $element, $attrs) {
//       console.log(1);
//     },
//     template: '<div id="container" style="margin: 0 auto"></div>',
//     link: function (scope, element, attrs) {
//       console.log(scope.innerid);
//       //Create inner div and append to template
//       var view = '<div id="' + scope.innerid + '" style="min-width: 310px; height: 290px; max-width: 600px; margin: 0 auto"></div>';
//       element.append(view);
//
//       Highcharts.setOptions({
//         colors: ['#0FB199', '#E62D5D'],
//         credits: {
//           enabled: false
//         },
//         global: {
//           useUTC: false
//         }
//       });
//       var chart = new Highcharts.Chart({
//         chart: {
//           renderTo: scope.innerid,
//           plotBackgroundColor: null,
//           plotBorderWidth: null,
//           plotShadow: false
//         },
//         title: {
//           text: ''
//         },
//         tooltip: {
//           //pointFormat: '{series.name}: <b>{point.percentage}%</b>',
//           percentageDecimals: 1
//         },
//         plotOptions: {
//           pie: {
//             allowPointSelect: true,
//             cursor: 'pointer',
//             dataLabels: {
//               enabled: true,
//               color: '#000000',
//               connectorColor: '#000000',
//               formatter: function () {
//                 //return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
//               }
//             },
//             showInLegend: true,
//           },
//           series: {
//             point: {
//               events: {
//                 legendItemClick: function () {
//                   return false; // <== returning false will cancel the default action
//                 }
//               }
//             }
//           }
//         },
//         series: [{
//           type: 'pie',
//           name: 'Total',
//           data: scope.items
//         }]
//       });
//       scope.$watch("items", function (newValue) {
//         console.log(newValue);
//         chart.series[0].setData(newValue, true);
//       }, true);
//     }
//   }
// }

//bar chart
function hcBarDirective() {
  return {
    restrict: 'C',
    replace: true,
    scope: {
      items: '=',
      xAxisData : '='
    },
    controller: function ($scope, $element, $attrs) {
    },
    link: function (scope, element, attrs) {
      var chart = new Highcharts.Chart({
        colors: ['#f1c40f', '#FF8C00', '#FF0000'],
        chart: {
          type: 'column',
          renderTo: 'ECTLevelChart',
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          text: ' '
        },
        xAxis: {
          categories: scope.xAxisData,
          // categories: [
          //   '23/05/2017',
          //   '24/05/2017',
          // ],
          crosshair: true
        },
        yAxis: {
          min: 0,
          title: {
            text: ''
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0">{point.y}</td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
        },
        plotOptions: {
          series: {
            dataLabels:{
              enabled:true,
            },
            events: {
              legendItemClick: function() {
                return false;
              }
            }
          },
          column: {
            pointPadding: 0,
            borderWidth: 0,
            groupPadding: 0.3
          }
        },
        // series: scope.items
        // series: [{
        //   // type: 'bar',
        //   name: 'Fleet ',
        //   data: scope.items
        // }]
        series: [{
          name: 'Level 1',
          data: [49, 71]
        }, {
          name: 'Level 2',
          data: [48, 38]
        }, {
          name: 'Level 3',
          data: [42, 33]
        }]
      });
      scope.$watch("items", function (newValue) {
        chart.series = newValue;
      }, true);
    }
  }
}

//Prevent click if href="#"
function preventClickDirective() {
  var directive = {
    restrict: 'E',
    link: link
  }
  return directive;

  function link(scope, element, attrs) {
    if (attrs.href === '#'){
      element.on('click', function(event){
        event.preventDefault();
      });
    }
  }
}

//Bootstrap Collapse
function bootstrapCollapseDirective() {
  var directive = {
    restrict: 'E',
    link: link
  }
  return directive;

  function link(scope, element, attrs) {
    if (attrs.toggle=='collapse'){
      element.attr('href','javascript;;').attr('data-target',attrs.href.replace('index.html',''));
    }
  }
}

/**
* @desc Genesis main navigation - Siedebar menu
* @example <li class="nav-item nav-dropdown"></li>
*/
function navigationDirective() {
  var directive = {
    restrict: 'E',
    link: link
  }
  return directive;

  function link(scope, element, attrs) {
    if(element.hasClass('nav-dropdown-toggle') && angular.element('body').width() > 782) {
      element.on('click', function(){
        if(!angular.element('body').hasClass('compact-nav')) {
          element.parent().toggleClass('open').find('.open').removeClass('open');
        }
      });
    } else if (element.hasClass('nav-dropdown-toggle') && angular.element('body').width() < 783) {
      element.on('click', function(){
        element.parent().toggleClass('open').find('.open').removeClass('open');
      });
    }
  }
}

//Dynamic resize .sidebar-nav
sidebarNavDynamicResizeDirective.$inject = ['$window', '$timeout'];
function sidebarNavDynamicResizeDirective($window, $timeout) {
  var directive = {
    restrict: 'E',
    link: link
  }
  return directive;

  function link(scope, element, attrs) {

    if (element.hasClass('sidebar-nav') && angular.element('body').hasClass('fixed-nav')) {
      var bodyHeight = angular.element(window).height();
      scope.$watch(function(){
        var headerHeight = angular.element('header').outerHeight();

        if (angular.element('body').hasClass('sidebar-off-canvas')) {
          element.css('height', bodyHeight);
        } else {
          element.css('height', bodyHeight - headerHeight);
        }
      })

      angular.element($window).bind('resize', function(){
        var bodyHeight = angular.element(window).height();
        var headerHeight = angular.element('header').outerHeight();
        var sidebarHeaderHeight = angular.element('.sidebar-header').outerHeight();
        var sidebarFooterHeight = angular.element('.sidebar-footer').outerHeight();

        if (angular.element('body').hasClass('sidebar-off-canvas')) {
          element.css('height', bodyHeight - sidebarHeaderHeight - sidebarFooterHeight);
        } else {
          element.css('height', bodyHeight - headerHeight - sidebarHeaderHeight - sidebarFooterHeight);
        }
      });
    }
  }
}

//LayoutToggle
layoutToggleDirective.$inject = ['$interval'];
function layoutToggleDirective($interval) {
  var directive = {
    restrict: 'E',
    link: link
  }
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function(){

      if (element.hasClass('sidebar-toggler')) {
        angular.element('body').toggleClass('sidebar-hidden');
      }

      if (element.hasClass('aside-menu-toggler')) {
        angular.element('body').toggleClass('aside-menu-hidden');
      }
    });
  }
}

//Collapse menu toggler
function collapseMenuTogglerDirective() {
  var directive = {
    restrict: 'E',
    link: link
  }
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function(){
      if (element.hasClass('navbar-toggler') && !element.hasClass('layout-toggler')) {
        angular.element('body').toggleClass('sidebar-mobile-show')
      }
    })
  }
}

//Bootstrap Carousel
function bootstrapCarouselDirective() {
  var directive = {
    restrict: 'E',
    link: link
  }
  return directive;

  function link(scope, element, attrs) {
    if (attrs.ride=='carousel'){
      element.find('a').each(function(){
        $(this).attr('data-target',$(this).attr('href').replace('index.html','')).attr('href','javascript;;')
      });
    }
  }
}

//Bootstrap Tooltips & Popovers
function bootstrapTooltipsPopoversDirective() {
  var directive = {
    restrict: 'A',
    link: link
  }
  return directive;

  function link(scope, element, attrs) {
    if (attrs.toggle=='tooltip'){
      angular.element(element).tooltip();
    }
    if (attrs.toggle=='popover'){
      angular.element(element).popover();
    }
  }
}

//Bootstrap Tabs
function bootstrapTabsDirective() {
  var directive = {
    restrict: 'A',
    link: link
  }
  return directive;

  function link(scope, element, attrs) {
    element.click(function(e) {
      e.preventDefault();
      angular.element(element).tab('show');
    });
  }
}

//Card Collapse
function cardCollapseDirective() {
  var directive = {
    restrict: 'E',
    link: link
  }
  return directive;

  function link(scope, element, attrs) {
    if (attrs.toggle=='collapse' && element.parent().hasClass('card-actions')){

      if (element.parent().parent().parent().find('.card-block').hasClass('in')) {
        element.find('i').addClass('r180');
      }

      var id = 'collapse-' + Math.floor((Math.random() * 1000000000) + 1);
      element.attr('data-target','#'+id)
      element.parent().parent().parent().find('.card-block').attr('id',id);

      element.on('click', function(){
        element.find('i').toggleClass('r180');
      })
    }
  }
}
