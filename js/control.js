/*To Do
Validate Inputs
*/



//Process scheduler app
var dataApp = angular.module('dataApp', ['ngAnimate']);

// Service for data
dataApp.factory('dataService',function() {
	//Initial values
  var data = {
    processes: [
    {id:0, startTime:0, runTime:15},
    {id:1, startTime:10, runTime:10},
    {id:2, startTime:35, runTime:25}, 
    {id:3, startTime:22, runTime:20},
    {id:4, startTime:25, runTime:30},
    ],
  };
  return data;
});

dataApp.controller('DataCtrl', function ($scope,dataService){

	//Processes default
	$scope.processes = dataService.processes;//[{id:0, startTime:0, runTime:10}];

	$scope.addProcess = function() {
		//make a process element
		var p = {id:$scope.enteredId, startTime:$scope.enteredStartTime, runTime:$scope.enteredRunTime};

		//push it into the data set
		$scope.processes.push(p);

		//clear testboxes
	  $scope.enteredId = '';
	  $scope.enteredStartTime = '';
	  $scope.enteredRunTime = '';
	};

	$scope.removeProcess = function(id) {

		//find the element with that process id
		var index = -1;
		for(var i = 0, len = $scope.processes.length; i < len; i++) {
	    if ($scope.processes[i].id == id) {
	        index = i;
	        break;
	    } }
	    
	    //remove it
	  	var proc = $scope.processes.splice(index, 1)[0];
	  	$scope.enteredId = proc.id;
	  	$scope.enteredStartTime = proc.startTime;
	  	$scope.enteredRunTime = proc.runTime;
	};


});