mySPA.factory('ScheduleService', ['$http','$q', function ($http,$q) {
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
		testSuitesScheduleCheck_ICE : function(moduleInfo) {
			return $http.post('/testSuitesScheduleCheck_ICE', {
				param : 'testSuitesScheduleCheck_ICE',
				moduleInfo: moduleInfo
			})
			.then(function(response){	return response.data},
			function(response){return $q.reject(response.data)})
		},
		testSuitesScheduler_ICE : function(executionData) {
			return $http.post('/testSuitesScheduler_ICE',{
				param : 'testSuitesScheduler_ICE',
				executionData: executionData
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
		cancelScheduledJob_ICE : function(schDetails, host, schedUserid){
			return $http.post('/cancelScheduledJob_ICE',{
				param: 'cancelScheduledJob_ICE',
				schDetails: schDetails,
				host: host,
				schedUserid: schedUserid
			})
			.then(function(response){	return response.data},
			function(response){return $q.reject(response.data)})
		}
	}
}]);
