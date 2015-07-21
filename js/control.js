/*To Do
Validate Inputs
*/



//Process scheduler app
var schedulerApp = angular.module('schedulerApp', ['ngAnimate']);

// Service for data
schedulerApp.service('dataService',function() {
	//Initial values
  var data = {
    processes: [
    {id:0, startTime:0, runTime:15},
    {id:1, startTime:10, runTime:10},
    {id:2, startTime:35, runTime:25}, 
    {id:3, startTime:22, runTime:20},
    {id:4, startTime:25, runTime:30},
    ],

    cpuDetails:{step:0, //current step
    			curretnProcessId:-1,
    			}, 


  };
  return data;
});

schedulerApp.controller('dataCtrl', function ($scope,dataService){

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

//Process Simulator

schedulerApp.controller('simulationCtrl', function ($scope,dataService){

	//Processes default
	$scope.processes = dataService.processes;//[{id:0, startTime:0, runTime:10}];
	$scope.cpuDetails = dataService.cpuDetails;
	$scope.cpuDetails = dataService.cpuDetails;

	$scope.stepForward = function() {
		$scope.cpuDetails.step +=1;
		calculatePriority();
	};

	function calculatePriority(){
		//update waiting time, RR of processes
		for(var i = 0, len = $scope.processes.length; i < len; i++) {
			//Negative for processes which are not yet started
			$scope.processes[i].waitingTime = $scope.cpuDetails.step-$scope.processes[i].startTime;

			//Calculate RR(priority)
			$scope.processes[i].priority = 1+($scope.processes[i].waitingTime/$scope.processes[i].runTime)
		}	
	};



});


//CPU Details ctrl
schedulerApp.controller('cpuDetails', function ($scope,dataService){
	$scope.cpuDetails = dataService.cpuDetails;
});