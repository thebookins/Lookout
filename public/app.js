angular.module('AngularOpenAPS', [
  'AngularOpenAPS.home',
  'AngularOpenAPS.preferences',
  'AngularOpenAPS.cgm',
  'AngularOpenAPS.loop',
  'AngularOpenAPS.pump',
  'ngRoute',
  'ngStorage',
  // 'ngTouch',
  'mobile-angular-ui',
  'mobile-angular-ui.core.sharedState',
  'btford.socket-io',
  'chart.js'
])

.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
})

.controller('MyCtrl', ['$rootScope', '$scope', '$localStorage', 'SharedState', function (
  $rootScope,
  $scope,
  $localStorage,
  SharedState
) {
  $rootScope.$on('$routeChangeStart', function() {
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function() {
    $rootScope.loading = false;
  });

  SharedState.initialize($scope, 'glucoseUnits', {defaultValue: $localStorage.glucoseUnits || 'mg/dL'});
  $scope.$on('mobile-angular-ui.state.changed.glucoseUnits', function(e, newVal, oldVal) {
    $localStorage.glucoseUnits = newVal;
  });

  // app.controller('controller1', function($scope, SharedState){
  // SharedState.initialize($scope, 'myId');
// });


  // $cookies.put('myFavorite', 'oatmeal');

  //   // for demo chart
  //   $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  //   $scope.series = ['Series A', 'Series B'];
  //   $scope.data = [
  //     [65, 59, 80, 81, 56, 55, 40]
  //     // [28, 48, 40, 19, 86, 27, 90]
  //   ];
  //   // $scope.onClick = function (points, evt) {
  //   //   console.log(points, evt);
  //   // };
  //   // $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  //   $scope.options = {
  //     scales: {
  //       yAxes: [
  //         {
  //           id: 'y-axis-1',
  //           type: 'linear',
  //           display: true,
  //           position: 'left'
  //         },
  //         {
  //           id: 'y-axis-2',
  //           type: 'linear',
  //           display: true,
  //           position: 'right'
  //         }
  //       ]
  //     }
  //   };
  // }]);
  //
}])


.filter('time', function() {
  // TODO: handle singulars, as in
  // https://gist.github.com/lukevella/f23423170cb43e78c40b
  return function(seconds) {
    if (!seconds) return '--';
    if (seconds < 60) return seconds.toFixed(0) + ' sec';
    else {
      const minutes = seconds / 60;
      if (minutes < 60) return minutes.toFixed(0) + ' min';
      else {
        const hours = minutes / 60;
        if (hours < 24) return hours.toFixed(0) + ' hr';
        else {
          const days = hours / 24;
          return days.toFixed(0) + ' d';
        }
      }
    }
  };
})

.filter('glucose', ['SharedState', function(SharedState) {
  return function(glucose, hideUnits) {
    const units = SharedState.get('glucoseUnits');
    if (!glucose) return '--';
    const unitsString = hideUnits ? '' : ' ' + units;
    switch (units) {
      case 'mg/dL':
        return glucose.toFixed(0) + unitsString;
      case 'mmol/L':
        return (glucose/18).toFixed(1) + ' ' + unitsString;
      default:
        return 'ERR';
    }
  };
}])

.directive('glucose', ['SharedState', function (SharedState) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {

      // convert value going to user (model to view)
      ngModel.$formatters.push(function(value) {
        const units = SharedState.get('glucoseUnits');
        switch (units) {
          case 'mmol/L':
            factor = 18;
            break;
          case 'mg/dL':
          default:
            factor = 1;
        }
        return value / factor;
      });

      // value from the user (view to model)
      ngModel.$parsers.push(function(value) {
        const units = SharedState.get('glucoseUnits');
        switch (units) {
          case 'mmol/L':
            factor = 18;
            break;
          case 'mg/dL':
          default:
            factor = 1;
        }
        return Math.round(value * factor);
      });
    }
  }
}]);

//
// app.filter('mg_per_dl', function() {
//   return function(glucose) {
//     return glucose ? glucose + ' mg/dl' : '--';
//   };
// });
//
// app.filter('mmol_per_L', function() {
//   return function(glucose) {
//     return glucose ? (glucose/18).toFixed(1) + ' mmol/L' : '--';
//   };
// });
//
