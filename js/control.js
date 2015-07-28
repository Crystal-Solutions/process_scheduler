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
    {id:0, startTime:0, runTime:15, state:"defined", startedTime:-1, endedTime:-1},
    {id:1, startTime:10, runTime:10, state:"defined", startedTime:-1, endedTime:-1},
    {id:2, startTime:35, runTime:25, state:"defined", startedTime:-1, endedTime:-1}, 
    {id:3, startTime:25, runTime:30, state:"defined", startedTime:-1, endedTime:-1}, 
    {id:4, startTime:22, runTime:30, state:"defined", startedTime:-1, endedTime:-1}, 
    {id:5, startTime:20, runTime:30, state:"defined", startedTime:-1, endedTime:-1}, 
    {id:6, startTime:10, runTime:30, state:"defined", startedTime:-1, endedTime:-1}, 
    {id:7, startTime:5, runTime:30, state:"defined", startedTime:-1, endedTime:-1},
    ],

    states:{step:0, //current step
    			processI:-1,
    			occupyTime:0,
    			simulatorState:"stoped",
    			finishedProcessCount:0,
    			cpuTotalOccupiedTime:0 //Number of processes finished
    			}, 

   	timeBars:[],


  };
  return data;
});

schedulerApp.controller('dataCtrl',  function ($scope,dataService){

	//Processes default
	$scope.processes = dataService.processes;//[{id:0, startTime:0, runTime:10}];


	//Bars for History
	$scope.timeBars = dataService.timeBars;
	$scope.scale = 4;


	$scope.addProcess = function() {

		for(var i = 0, len = $scope.processes.length; i < len; i++) {
			if($scope.processes[i].id==$scope.enteredId)
			{
				alert("Invalid Process Id. Process Id has to be unique!");
				return;
			}
			}

		//make a process element
		var p = {id:$scope.enteredId, startTime:$scope.enteredStartTime, runTime:$scope.enteredRunTime , state:"defined", startedTime:-1, endedTime:-1};

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


	$scope.isWaiting = function(item){
	      return item.waitingTime>=0 && item.state=="defined";
	    };



});

//Process Simulator
schedulerApp.controller('simulationCtrl', ['$scope','$interval', 'dataService', function ($scope,  $interval,dataService){

	//Processes default
	$scope.processes = dataService.processes;//[{id:0, startTime:0, runTime:10}];
	$scope.states = dataService.states;
	$scope.timeBars = dataService.timeBars;

	$scope.speed = 100;

	var runner; 

	//Run the simulaation
	$scope.play = function()
	{
		if(!angular.isDefined(runner))//if not already started
		{
			runner = $interval(function() {

				$scope.stepForward();
			},$scope.speed);
			$scope.states.simulatorState="running";
		}
	};

	//Pause the simulation
	$scope.pause= function()
	{
		if(angular.isDefined(runner) )
		{
			 $interval.cancel(runner);
			 runner = undefined;
			 $scope.states.simulatorState="paused";
		}
	};

	//Pause the simulation
	$scope.reset = function()
	{
		$scope.pause();

		for(var i = 0, len = $scope.processes.length; i < len; i++) {
			var p = $scope.processes[i];
			p.state="defined";
			p.startedTime=-1;
			p.endedTime=-1;
			p.waitingTime = -1;
	    }
	    $scope.states.step = 0;
	    $scope.states.processI = -1;
    	$scope.states.occupyTime=0;
    	$scope.states.simulatorState="stoped";
    	$scope.states.finishedProcessCount=0;
    	$scope.states.cpuTotalOccupiedTime = 0;

    	dataService.timeBars.splice(0,dataService.timeBars.length);

	};

	$scope.stepForward = function() {

		//if all processes are finished
		if($scope.states.finishedProcessCount==$scope.processes.length) { $scope.pause(); return; }

		// add a new bar 
		if($scope.states.step%10==0)
			$scope.timeBars.push($scope.states.step);
		//First time calculate priorities
		if($scope.states.step==0)
			calculatePriority();

		updateCPU();

		//Calculate priorities for next step alocation
		$scope.states.step +=1;

		if($scope.states.processI!=-1)
			$scope.states.cpuTotalOccupiedTime++;
		calculatePriority();
	};

	function calculatePriority(){
		//update waiting time, priority of processes
		for(var i = 0, len = $scope.processes.length; i < len; i++) {
			if($scope.processes[i].state == "defined")
			{
			//Negative for processes which are not yet started
			$scope.processes[i].waitingTime = $scope.states.step-$scope.processes[i].startTime;

			//Calculate RR(priority)
			$scope.processes[i].priority = 1+($scope.processes[i].waitingTime/$scope.processes[i].runTime);
			}
		}	
	};

	//Udate CPU
	function updateCPU()
	{
		//If CPU is not free and occupied time equal to currentProcesses runtime => make cpu free
		if($scope.states.processI!=-1 )
		if($scope.states.occupyTime==$scope.processes[$scope.states.processI].runTime)
		{
			//free CPU
			var processId = $scope.states.processI;
			$scope.states.processI = -1;

			//mark occupy time 0
			$scope.states.occupyTime = 0;

			//mark the time the process ended
			$scope.processes[processId].endedTime = $scope.states.step;
			$scope.processes[processId].state="finished";
			$scope.states.finishedProcessCount++;
		}

		//allocate if cpu is free and if there is a process to be allocated
		if($scope.states.processI==-1)
		{
			var processI = -1;
			var highestPriority = 0;
			for(var i = 0, len = $scope.processes.length; i < len; i++) {
				//if waitingTime >=0 and notFinished and highestPriority
		    	if ($scope.processes[i].waitingTime >= 0 && ($scope.processes[i].state!="finished") && highestPriority<$scope.processes[i].priority) {
		    		processI = i;
		    		highestPriority = $scope.processes[i].priority;
		    	}
	    	}

	    	//if there is a process to be allocated
		    if(processI!=-1)
		    	{
	    			$scope.states.processI = processI
	    			$scope.processes[processI].startedTime = $scope.states.step;
	    			$scope.processes[processI].state = "running";
		    	}
		}

		//Increase CPU occupied time if it is not free
		if($scope.states.processI!=-1)
		{
			$scope.states.occupyTime+=1;
			var processId = $scope.states.processI;
			$scope.processes[processId].endedTime = $scope.states.step;
		}
	};


}]);





//CPU Details ctrl
schedulerApp.controller('states', function ($scope,dataService){

	$scope.processes = dataService.processes;
	$scope.states = dataService.states;

});


schedulerApp.filter('width', function() {
   return function(process){
			return (process.endedTime-process.startedTime);
	};
});

schedulerApp.filter('left', function() {
   return function(process){
   	if(process.startedTime<0) return -5;
			return process.startedTime;
	};
});

schedulerApp.filter('format', function() {
   return function(val){
   			if(val<0 || angular.isUndefined(val) )
			return "-";
			return val;
	};
});


schedulerApp.filter('finishedTime', function() {
   return function(process){
   			if(val<0 || angular.isUndefined(val) )
			return "-";
			return val;
	};
});