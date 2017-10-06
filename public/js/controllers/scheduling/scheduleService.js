mySPA.factory('ScheduleService', ['$http','$q', function ($http, $httpProvider, $q)   {
  return{
	  readTestSuite_ICE : function(readTestSuite){
			return $http.post('/readTestSuite_ICE',{
				param : 'readTestSuite_ICE',
				readTestSuite : readTestSuite,
				fromFlag:	"scheduling"
			})
			.then(function(response)  { return response.data},
			function(response)        {return $q.reject(response.data)})
	  },
		testSuitesScheduler_ICE : function(moduleInfo){
			return $http.post('/testSuitesScheduler_ICE',{
				param : 'testSuitesScheduler_ICE',
				moduleInfo: moduleInfo
			})
			.then(function(response){	return response.data},
			function(response){return $q.reject(response.data)})
		},
		getScheduledDetails_ICE : function(){
			return $http.post('/getScheduledDetails_ICE',{
				param : 'getScheduledDetails_ICE'
			})
			.then(function(response){	return response.data},
			function(response){return $q.reject(response.data)})
		},
		cancelScheduledJob_ICE : function(suiteDetailsObj){
			return $http.post('/cancelScheduledJob_ICE',{
				param : 'cancelScheduledJob_ICE',
				suiteDetails: suiteDetailsObj
			})
			.then(function(response){	return response.data},
			function(response){return $q.reject(response.data)})
		}
  }
}]);
