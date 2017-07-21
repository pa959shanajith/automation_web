
mySPA.controller('mindmapController', ['$scope', '$http', '$location', '$timeout', 'mindmapServices','cfpLoadingBar','$window', function($scope,$http,$location,$timeout,mindmapServices,cfpLoadingBar,$window) {
    $("body").css("background","#eee");
    $("head").append('<link id="mindmapCSS1" rel="stylesheet" type="text/css" href="css/css_mindmap/style.css" /><link id="mindmapCSS2" rel="stylesheet" type="text/css" href="fonts/font-awesome_mindmap/css/font-awesome.min.css" />')
	
    /*var taskAuth;
	if(window.localStorage["_VM"] == "false")
	{
		taskAuth = false;
	}*/
	if(window.localStorage['navigateScreen'] != "home")
	{
		window.location.href = "/";
	}
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
        if($("#left-nav-section").is(":visible") == true)
            {
               $("span.taskname").addClass('taskTitle');
            }
        else{
             $("span.taskname").removeClass('taskTitle');
             $("div.content-div").removeClass("content-div-req");
        }
        
	}, 500)
		/*Sidebar-toggle*/
    $scope.tab = "tabRequirement";
    $(".left-sec-mindmap,.rsSlide").show();
    $('.selectProject').hide();
    // $("#ct-moduleBox").hide();
    //$("#ct-moduleBox,.ct-tilebox").hide();
    $(".ct-show-left").click(function(e) {
        e.preventDefault();
        $(".left-sec-mindmap").hide();
        //$("#wrapper").toggleClass("active");
    });
   
    $("#ct-expand").click(function(e) {
         $("#ct-moduleBox,.tabAssign").removeClass("ct-expand-module");
           $(".left-sec-mindmap").show();
           if($('#right-dependencies-section').is(':visible')){
                $(".ct-tileBox").css({'left':'50%'})
                 $("#ct-moduleBox,.tabAssign").removeClass("leftBarClose rightBarClose rightBarOpen bar-collapse leftOpenRightClose rightOpenLeftClose bar-expand").addClass("leftBarOpen");
              //endtoend
                $(".endtoend-modulesContainer").prop("style","width:calc(100% - 174px) !important; left:160px !important;");
                $(".searchModuleimg").prop("style","right:91px !important;");
                $(".endtoend-modules-right-upper img").prop("style","left:195px !important;");
                $(".eteLabel").prop("style","left:392px !important; width:140px !important; bottom:23px !important;");
           }
           else{
                 $("#ct-moduleBox,.tabAssign").removeClass("leftBarClose leftBarOpen bar-collaspe rightBarClose rightBarOpen rightOpenLeftClose bar-expand").addClass("leftOpenRightClose");
              // $("#ct-moduleBox,.tabAssign").css({'left':'147px !important','width':'100%'})
               $(".ct-tileBox").css({'left':'52% !important'});
               //endtoend
               $(".endtoend-modulesContainer").prop("style","width:calc(100% - 256px) !important; left:160px !important;");
               $(".searchModuleimg").prop("style","right:86px !important;");
               $(".endtoend-modules-right-upper img").prop("style","left:180px !important;");
               $(".eteLabel").prop("style","left:366px !important; width:140px !important; bottom:23px !important;");
           }  
            $("span.taskname").addClass('taskTitle');
            $("div.content-div").removeClass("content-div-both-collapse");
            $("div.content-div").addClass("content-div-req");
            
    });
    $("#ct-collapse").click(function(e) {
         $("#ct-moduleBox,.tabAssign").removeClass("ct-expand-module");
           $(".left-sec-mindmap").hide();
            $("#ct-expand").addClass('collapsed');
           if($('#right-dependencies-section').is(':visible')){
               $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen rightBarClose rightBarOpen bar-collapse leftOpenRightClose rightOpenLeftClose bar-expand").addClass("leftBarClose");
               $(".ct-tileBox").css({'left':'50%'})
           }
           else{
               $("#ct-expand").removeClass('collapsed');
               $(".ct-tileBox").css({'left':'52% !important'})
           }
              $("span.taskname").removeClass('taskTitle');
              $("div.content-div").removeClass("content-div-req ");
            if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == false))
                {
                   $("div.content-div").addClass("content-div-both-collapse");
                      $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarClose rightBarOpen bar-expand leftOpenRightClose rightOpenLeftClose").addClass("bar-collaspe");
                }
                else{
                      $("div.content-div").removeClass("content-div-both-collapse");
                }
            if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == true))
            {
                $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarClose rightBarOpen bar-collapse leftOpenRightClose bar-expand").addClass("rightOpenLeftClose");
            }
            //endtoend
            $(".endtoend-modulesContainer").prop("style","width:calc(100% - 32px) !important; left:10px !important;");
            $(".searchModuleimg").prop("style","right:100px !important;");
            $(".endtoend-modules-right-upper img").prop("style","left:222px !important;");
            $(".eteLabel").prop("style","left:0 !important; width:140px !important; bottom:18px !important;");
    });
    $("#ct-expand-right").click(function(e) {
         $("#ct-moduleBox,.tabAssign").removeClass("ct-expand-module");
    	var flg = false;
         e.preventDefault()
         $(".rsSlide").toggle(5, function(){
             $(this).siblings("#ct-expand-right").toggleClass("ct-collapse-right");
             $("#ct-expand-right").removeClass('expand');
             if($(".left-sec-mindmap").is(':visible') && $('#right-dependencies-section').is(':visible')){
                 // $("#ct-moduleBox,.tabAssign").removeClass("rightBarClose").addClass("rightBarOpen");
            	 flg = true;
                 $("div.content-div").addClass("content-div-req");
                 $("div.content-div").removeClass("content-div-right-expand");
                 $(".project-list").removeClass("selectProject");
                $timeout(function(){
                    $("select.selectProject").removeClass("selectProjectPri");
                },300)
              //endtoend
                $(".endtoend-modulesContainer").prop("style","width:calc(100% - 256px) !important; left:160px !important;");
                $(".searchModuleimg").prop("style","right:86px !important;");
                $(".endtoend-modules-right-upper img").prop("style","left:180px !important;");
                $(".eteLabel").prop("style","left:366px !important; width:140px !important; bottom:23px !important;");
             }
             else{
                 
                 $("#ct-expand-right").addClass('expand');
                 $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarOpen bar-collapse bar-expand leftOpenRightClose rightOpenLeftClose").addClass("rightBarClose");
                 $("div.content-div").removeClass("content-div-req");
                 $("div.content-div").addClass("content-div-right-expand");
                $(".project-list").addClass("selectProject");
                if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == true))
                {
                   $("div.content-div").removeClass("content-div-right-expand");
                   $(".project-list").removeClass("selectProject");
                }
                $timeout(function(){
                    $("select.selectProject").addClass("selectProjectPri");
                },300)
              //endtoend
                $(".endtoend-modulesContainer").prop("style","width:calc(100% - 32px) !important; left:10px !important;");
                $(".searchModuleimg").prop("style","right:100px !important;");
                $(".endtoend-modules-right-upper img").prop("style","left:222px !important;");
                $(".eteLabel").prop("style","left:0 !important; width:140px !important; bottom:18px !important;");
             }
             if(flg) $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarClose rightBarOpen bar-collaspe leftOpenRightClose rightOpenLeftClose").addClass("bar-expand");
               if(($("#left-nav-section").is(":visible") == false &&  $("#right-dependencies-section").is(":visible") == false))
                {
                   $("div.content-div").addClass("content-div-both-collapse");
                     $("#ct-moduleBox,.tabAssign").removeClass("leftBarOpen leftBarClose rightBarClose rightBarOpen bar-expand leftOpenRightClose rightOpenLeftClose").addClass("bar-collaspe");
                }
                else{
                      $("div.content-div").removeClass("content-div-both-collapse");
                }
         });
     
    });

    // Changes made for End to end module implementation
    $scope.createMapsCall = function(e){
        if($scope.tab=='tabRequirement'){
        	$('.selectProject').hide();
            $("img.selectedIcon").removeClass("selectedIcon");
            $('#reqImg').addClass('selectedIcon');
        }
        else if($scope.tab=='mindmapCreateOption'){
            $('.selectProject').hide();
        	$("img.selectedIcon").removeClass("selectedIcon");
	        $('#createImg').addClass('selectedIcon');
            if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
            {
               $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
            }
        }
        else if($scope.tab=='mindmapEndtoEndModules'){
        	$("#ct-main").hide();
        	$("img.selectedIcon").removeClass("selectedIcon");
	        $('#createImg').addClass('selectedIcon');
            if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
            {
               $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
            }
           
            if($('.scrollbar-macosx').is(':visible'))
                $("#ct-collapse").trigger("click");
            if($('.rsSlide').is(':visible'))
                $("#ct-expand-right").trigger("click");
            loadMindmapData_W();
        }
        else{
            if ($scope.tab=='tabCreate'){
            	$('.selectProject').show();
                $("img.selectedIcon").removeClass("selectedIcon");
		        $('#createImg').addClass('selectedIcon');
                if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
                {
                   $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
                }
                $("#ct-main").css("display","block");
            }else if($scope.tab=='tabAssign'){
                $('.selectProject').show();
                $("img.selectedIcon").removeClass("selectedIcon");
		        $('#assignImg').addClass('selectedIcon');
                 if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
                {
                    $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
                }
                $("#ct-main").css("display","block");
            }
            
            if($('.scrollbar-macosx').is(':visible'))
                $("#ct-collapse").trigger("click");
            if($('#right-dependencies-section').is(':visible'))
                $("#ct-expand-right").trigger("click");
            
            loadMindmapData();
            $timeout(function(){
                $('#ct-moduleBox').prop("style","width:100% ; left:0px ;");
            },10);
            $timeout(function(){
                $('#ct-AssignBox').prop("style","width:100% ; left:0px ;");
            },10);
            
          
            
        }
        window.localStorage['tabMindMap'] = $scope.tab;
    }
    
    $scope.createMap = function(option){
    	$scope.tab = option;
    }

    // $(document).on('change', "#selectProjectEtem", function(){
    // 	if($(this).children("option:selected").val()){
    // 		var container = $("#etemModuleContainer");
    // 		container.empty();
    // 		for(i=0; i<20; i++){
    // 			container.append("<span class='moduleContainer' data-moduleId=''><img alt='Module icon' class='eteMbox' src='imgs/ic-reportbox.png' title=''><br/><span class='modulename' title=''>Module"+(i+1)+"</span></span>");
    // 		}
    // 		initScroller();
    // 	}
    // })
    
    // $(document).on('click', '.moduleContainer', function(){
    // 	var container = $("#eteScenarioContainer");
	// 	container.empty();
    // 	for(i=0; i<50; i++){
    // 		container.append("<span class='eteScenrios' data-scenarioId=''>End to End Scenario"+(i+1)+"</span>")
    // 	}
    // })
    
    var collapseEteflag = true;
    $(document).on('click', '.collapseEte', function(){
    	if(collapseEteflag){
    		if(screen.height < 1024){
    			$(".endtoend-modulesContainer").prop("style","height: 48% !important;");
    			$("#ct-canvas").prop("style","height: 250px !important");
    			$("#ct-legendBox").prop("style","top: calc(100% - 24px) !important; left: 8px !important;");
    			$("#ct-actionBox_W").prop("style","top: calc(100% - 34px) !important; left: (100% - 285px) !important;");
    		}
    		else{
    			$(".endtoend-modulesContainer").css("height","calc(100% - 430px)");
                $("#ct-canvas").prop("style","height: 410px !important")
    		}
        	$(this).attr("src","imgs/ic-collapseup.png");
        	collapseEteflag = false;
    	}
    	else{
    		if(screen.height < 1024){
    			$(".endtoend-modulesContainer").prop("style","height: 28% !important;");
    			$("#ct-canvas").prop("style","height: 352px !important")
    		}
    		else{
    			$(".endtoend-modulesContainer").css("height","calc(100% - 643px)");
                $("#ct-canvas").prop("style","height: 660px !important")
    		}
        	$(this).attr("src","imgs/ic-collapse.png");
        	collapseEteflag = true;
    	}
    })
    
    //Search Modules
    $(document).on('keyup', '#eteSearchModules', function() {
		filter(this, 'etemModuleContainer'); 
	});
    
    //Search Scenarios
    $(document).on('keyup', '#eteSearchScenarios', function() {
		filter(this, 'eteScenarioContainer'); 
	});
    
	function filter(element, id) {
		var value = $(element).val();
		var container;
		if(id == "etemModuleContainer")	container = $("#etemModuleContainer span.modulename");
		else container = $("#eteScenarioContainer span.eteScenrios");
		$(container).each(function () {
			if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
				id == "etemModuleContainer"? $(this).parent().show() : $(this).show()
			} else {
				id == "etemModuleContainer"? $(this).parent().hide() : $(this).hide()
			}
		});
	}

	$(document).on('click', '.eteScenrios', function(){
		$.each($('.eteScenrios'), function(){
			$(this).removeClass('selectScenariobg');
		})
		/*if($(this).siblings("input").is(":checked")){
			$(this).siblings("input").prop("checked",false);
		}
		else $(this).siblings("input").prop("checked",true);*/
		$(this).addClass('selectScenariobg');
	})
    // $(".highlightImg").on('click',function(e) {
    //     if(e.target.id == "reqImg" || e.target.id == "createImg" ||  e.target.id == "assignImg" || 
    //     e.target.id == "reqImg1" || e.target.id == "createImg1" ||  e.target.id == "assignImg1")
    //     {
    //         $("a.selectedIcon").removeClass("selectedIcon");
	// 	    $(this).addClass('selectedIcon');
    //     }
		
	// });
    function initScroller(){
    	$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
    }
    // Changes made for End to end module implementation
}]);