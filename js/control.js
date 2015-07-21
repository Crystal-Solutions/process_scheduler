/*
Each model should works on their own
--To Do
Validate Inputs

*/



//Process scheduler app
var schedulerApp = angular.module('schedulerApp', ['ngAnimate']);

// Service for data
schedulerApp.service('dataService',function() {
	//Initial values
  var data = {
    processes: [
    {id:0, startTime:0, runTime:15, finished:false},
    {id:1, startTime:10, runTime:10, finished:false},
    {id:2, startTime:35, runTime:25, finished:false}, 
    {id:3, startTime:22, runTime:20, finished:false},
    {id:4, startTime:25, runTime:30, finished:false},
    ],

    cpuDetails:{step:0, //current step
    			processI:-1,
    			occupyTime:0,
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

	$scope.stepForward = function() {
		//First time calculate priorities
		if($scope.cpuDetails.step==0)
			calculatePriority();

		updateCPU();

		//Calculate priorities for next step alocation
		$scope.cpuDetails.step +=1;
		calculatePriority();
	};

	function calculatePriority(){
		//update waiting time, priority of processes
		for(var i = 0, len = $scope.processes.length; i < len; i++) {
			//Negative for processes which are not yet started
			$scope.processes[i].waitingTime = $scope.cpuDetails.step-$scope.processes[i].startTime;

			//Calculate RR(priority)
			$scope.processes[i].priority = 1+($scope.processes[i].waitingTime/$scope.processes[i].runTime)
		}	
	};

	//Udate CPU
	function updateCPU()
	{
		//If CPU is not free and occupied time equal to currentProcesses runtime => make cpu free
		if($scope.cpuDetails.processI!=-1 )
		if($scope.cpuDetails.occupyTime==$scope.processes[$scope.cpuDetails.processI].runTime)
		{
			//free CPU
			var processId = $scope.cpuDetails.processI;
			$scope.cpuDetails.processI = -1;

			//mark occupy time 0
			$scope.cpuDetails.occupyTime = 0;

			//mark the time the process ended
			$scope.processes[processId].endedTime = $scope.cpuDetails.step;
			$scope.processes[processId].finished = true;
		}
		//allocate if cpu is free and if there is a process to be allocated
		if($scope.cpuDetails.processI==-1)
		{
			var processI = -1;
			var highestPriority = 0;
			for(var i = 0, len = $scope.processes.length; i < len; i++) {
				//if waitingTime >=0 and notFinished and highestPriority
		    	if ($scope.processes[i].waitingTime >= 0 && (!$scope.processes[i].finished) && highestPriority<$scope.processes[i].priority) {
		    		processI = i;
		    		highestPriority = $scope.processes[i].priority;
		    	}
	    	}

	    	//if there is a process to be allocated
		    if(processI!=-1)
		    	{
	    			$scope.cpuDetails.processI = processI
	    			$scope.processes[processId].startedTime = $scope.cpuDetails.step;

		    	}
		}

		//Increase CPU occupied time if it is not free
		if($scope.cpuDetails.processI!=-1)
			$scope.cpuDetails.occupyTime+=1;
	};


});


//CPU Details ctrl
schedulerApp.controller('cpuDetails', function ($scope,dataService){
	
	$scope.processes = dataService.processes;
	$scope.cpuDetails = dataService.cpuDetails;

});