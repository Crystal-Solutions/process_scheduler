# process_scheduler
OS Project
HRRN algorithm simulator


Inner Architecture
	-schedulerApp
		--dataService
			processes
			waitingList
			cpuDetails
	
		--dataCtrl - to add processes
			addProcess
			removeProcess
	
		--simulationCtrl - control simulation process
			stepForward
			updateWaitingList - for privte use

