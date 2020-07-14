mySPA.controller('mindmapController', ['$scope', '$rootScope', '$http', '$location', '$timeout', 'chatbotService', 'mindmapServices', 'cfpLoadingBar', '$window', 'socket', function($scope, $rootScope, $http, $location, $timeout, chatbotService, mindmapServices, cfpLoadingBar, $window, socket) {

    //------------------Global Variables---------------------------//
    //Createmap//
    var activeNode, nCount2, childNode, node, link, dNodes_c, dLinks_c, allMMaps, temp, rootIndex, faRef, nCount, scrList, tcList, mapSaved, taskAssign, releaseResult, selectedProject;
    //unassignTask is an array to store whose task to be deleted
    var deletednode = [],
        unassignTask = [],
        deletednode_info = [];
    var versioning_enabled = 0;
    var idxSearch = 0;
    var count1 = new Set();
    $scope.verticalLayout = false;
    $scope.moving = false;
    $scope.apptype = '';
    $scope.pdmode = false;
    $scope.createdthrough="";
    var sections = {
        'modules': 112,
        'scenarios': 237,
        'screens': 363,
        'testcases': 488
    }; // from now mindmap levels will be divided into sections
    var saveFlag = false;
    //for handling the case when creatednode goes beyond screensize
    var CreateEditFlag = false;
    var isIE = /*@cc_on!@*/ false || !!document.documentMode;
    var IncompleteFlowFlag = false,
        progressFlag = false;
    var taskidArr = [],
        assignedObj = {},
        reuseDict = {};
    //Createmap//

    //Workflow//
    var uNix, uLix, dNodes, dLinks, temp_W, zoom, cSpan, cScale;
    var cur_module, allMaps_info, activeNode, childNode;
    //unassignTask is an array to store whose task to be deleted
    var deletednode_W = [];
    var saveFlag_W = false;
    var collapseEteflag = true;
    var reldata = {};
    var cycdata = {};
    //Workflow//
    var currMap = {};
    var excelMap = {};
    var excelFlag = 0;
    var versionFlag = 0;
    var dragsearch = false;
    $scope.allMMaps = [];
    var split_char = (isIE)? ' ':',';
    // Complexity
    var cx_weightage = { //scale , weightage
        'Application Type': 3,
        'Domain knowledge factor': 1,
        'Requirement Complexity': 2,
        'Test Data Requirement/complexity': 3,
        'Test Management Tool being used': 1,

        'Multi-lingual support': 5,
        '# of Objects': 5,

        'Analytical & Logical Reasoning': 1,
        'Team Capability': 1,
        '# of steps': 1,
        '# of Verification Points': 2,
        'Multi-browser support': 1,
        'Re-usability/Re-#': 2,
        'Database Check points': 1
    }
    var cx_scale = {
        //apptype
        'DW ETL (H)': 5,
        'Desktop (H)': 5,
        'Oracle (H)': 5,
        'SAP (H)': 5,
        'Mainframe Application (H)': 5,
        'Mobile Application - IOS (H)': 5,
        'Mobile Web - IOS (H)': 5,
        'Webservices - REST (M)': 3,
        'Mobile Web - Android (M)': 3,
        'Database Application (M)': 3,
        'Web Application (L)': 1,
        'Webservices - SOAP (L)': 1,
        'Mobile Application - Android (L)': 1,
        //Domain knowledge
        'Limited': 5,
        'Fair': 3,
        'Good': 1,
        'H': 5,
        'M': 3,
        'L': 1,
        //Test Management Tool
        'Yes': 5,
        'No': 3,
        //Multi-lingual support Multi-browser support
        '1': 1,
        '2 to 3': 3,
        '>3': 5,
        //# of objects
        '<11': 1,
        '11-25': 3,
        '>25': 5,
        //Analytical & Logical Reasoning + Team Capability
        'Very Low': 5,
        'Low': 4,
        'Nominal': 3,
        'High': 2,
        'Very High': 1,
        //# of Steps
        '< 15': 1,
        '15-30': 3,
        '>30': 5,
        //# of Verification Points Database Check points
        '< 2': 1,
        '3-8': 3,
        '>8': 5,
        //Re-usability/Re-#
        'Reused': 1,
        'Rehashed': 3,
        'NA': 5
    };
    var cscore = 0;
    var clist;
    $scope.nodeDisplay = {};
    $scope.linkDisplay = {};
    var flowMove = false;
    var elemlist = {
            'mindmapCreateOption': {
                'idx': 0,
                'elems': [
                    '#createImg',
                    '#assignImg',
                    '[title="Create New"]',
                    '[title="End to End flow"]',
                    '[title="Import from Excel"]',
                    '[alt="Tasks"]',
                    '[title="Info"]',
                    '[title="Prof J"]'
                ]
            },
        }
        //-------------------End of Global Variables-----------------------//
    var faRef = {
        "plus": "fa-plus",
        "plus1": "fa-hand-peace-o",
        "edit": "fa-pencil-square-o",
        "delete": "fa-trash-o"
    };

	// process discovery related
    var parseAction = {
        "inprogress":"Assigned",
        "review":"Submitted for Approval",
        "approve":"Approved by reviewer",
        "export":"Exported"
    }
	
    if (window.localStorage['navigateScreen'] != "mindmap") {
        return $rootScope.redirectPage();
    }
    //------------------Createmap.js---------------------//

    function unloadMindmapData() {
        //$('#ct-mindMap').hide();
        $scope.nodeDisplay = {};
        $scope.linkDisplay = {};
    }

    function collapseSidebars() {
        if ($('#left-nav-section').is(':visible'))
            $("#ct-expand-left").trigger("click");
        if ($('#right-dependencies-section').is(':visible'))
            $("#ct-expand-right").trigger("click");
    }
    function loadMindmapData() {
        //param 0: normal , 1: normal with versioning, 2: end to end
        blockUI("Loading...");
        $('#searchModule-create').val('');
        $('#searchModule-assign').val('');
        mindmapServices.populateProjects().then(function(res) {
            if (res == "Invalid Session") {
                return $rootScope.redirectPage();
            }

            // Fetch apptype and domain
            if (res.projectId.length > 0) {
                $scope.projectList = [];
                for (i = 0; i < (res.projectId.length && res.projectName.length); i++) {
                    $scope.projectList.push({
                        'apptype': res.appType[i],
                        'name': res.projectName[i],
                        'id': res.projectId[i],
                        'releases':res.releases[i],
                        'domains':res.domains[i]
                    });
                }
                var default_releaseid = '';
                if (!selectedProject) {
                    selectedProject = res.projectId[0];
                    selectedProjectIndex = 0;
                }
                if (!$scope.projectNameO) {
                    $scope.projectNameO = res.projectId[0];
                }
                mindmapServices.getProjectTypeMM_Nineteen68($scope.projectNameO).then(function(res1){
                    $scope.apptypelist = res1;
                    $scope.apptype = res1.project_typename;
                    $scope.domain = res1.domains;
                    addInfo({'attributes':{
                            'Domain': $scope.domain,
                            'Apptype':$scope.apptype
                        }
                    });
                });                   
                if ($scope.tab == 'tabAssign') {
                    result=$scope.projectList[selectedProjectIndex].releases
                    $('.release-list').empty();
                    $('.release-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
                    $('.release-list').addClass('errorClass');
                    $('.cycle-list').empty();
                    $('.cycle-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
                    $('.cycle-list').addClass('errorClass');
                    reldata = {};
                    cycdata = {};
                    for (i = 0; i < result.length; i++) {
                        $('.release-list').append("<option data-id='" + result[i].name + "' value='" + i + "'>" + result[i].name + "</option>");
                        for(j = 0;j < result[i].cycles.length; j++){
                            reldata[result[i].cycles[j]._id]=result[i].name;
                            cycdata[result[i].cycles[j]._id]=result[i].cycles[j].name;
                        }
                    }
                    $('.cycle-list').change(function() {
                        $('.cycle-list').removeClass('errorClass');
                        loadMindmapData1();
                    });
                    $('.release-list').change(function() {
                        $('.release-list').removeClass('errorClass');
                        if ($("#ct-AssignBox").hasClass("ct-open") == true) {
                            $('.iconSpaceArrow').trigger('click');
                        }
                        $('#ctExpandAssign').unbind('click');
                        unloadMindmapData();
                        default_releaseid = $('.release-list').val() ? $('.release-list').val() : 0;
                            var result2 = $scope.projectList[selectedProjectIndex]["releases"][default_releaseid]["cycles"];
                            $('.cycle-list').empty();
                            $('.cycle-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
                            $('.cycle-list').addClass('errorClass');
                            for (i = 0; i < result2.length; i++) {
                                $('.cycle-list').append("<option data-id='" + result2[i]["name"] + "' value='" + result2[i]["_id"] + "'>" + result2[i]["name"] + "</option>");
                            }
                    });
                }

                if ($scope.param == 0 && $scope.tab == 'tabCreate') {
                    loadMindmapData1();
                } else if ($scope.param == 2) {
                    $('#eteSearchModules').val('');
                    if ($("img.iconSpaceArrow").hasClass("iconSpaceArrowTop")) {
                        $("img.iconSpaceArrow").removeClass("iconSpaceArrowTop");
                    }
                    loadMindmapData1_W();
                }
                //Calling the function to restrict the user to give default node names
                $("#ct-canvas").click(callme);
                unblockUI();
                $scope.projectName4 = $scope.projectNameO;
                $scope.projectName3 = $scope.projectNameO;
                $scope.projectName2 = $scope.projectNameO;
                $scope.projectName1 = $scope.projectNameO;
                $timeout(function(){
                    collapseSidebars();
                },200);
            }
        }, function(error) {
            console.log("Error:", error);
            unblockUI();
        })
    }

    $scope.projectListChange = function(prjName) {
        versionFlag = 0;
        excelFlag = 0;
        $scope.projectNameO = prjName;
        $scope.projectName4 = $scope.projectNameO;
        $scope.projectName3 = $scope.projectNameO;
        $scope.projectName2 = $scope.projectNameO;
        $scope.projectName1 = $scope.projectNameO;

        selectedProject = $scope.projectNameO;
        selectedProjectIndex=0;
        $scope.projectList.forEach(function(p,i){
            if ((p.id)==selectedProject) selectedProjectIndex=i;
        })
        if ($scope.tab == 'mindmapEndtoEndModules') {
            selectedProject = $("#selectProjectEtem").val();
            $scope.projectList.forEach(function(p,i){
                if ((p.id)==selectedProject) selectedProjectIndex=i;
            })
            //alert($scope.projectName);
            $('#eteSearchModules').val('');
            if ($("img.iconSpaceArrow").hasClass("iconSpaceArrowTop")) {
                $("img.iconSpaceArrow").removeClass("iconSpaceArrowTop");
            }
            loadMindmapData1_W();
        }
        //Mindmap clear search box on selecting different project
        dNodes_c = [] //Copied data should be cleared
        dLinks_c = [] // on change of projet list
        $('.fa.fa-pencil-square-o.fa-lg.plus-icon').removeClass('active-map');
        $('#rect-copy').remove();
        $('.fa.fa-clipboard.fa-lg.plus-icon').removeClass('active-map');
        $('#searchModule-create').val('');
        $('#searchModule-assign').val('');
        

        if ($scope.tab == 'tabAssign') {
            if ($("#ct-AssignBox").hasClass("ct-open") == true) {
                $('.iconSpaceArrow').trigger('click');
            }
            $('#ctExpandAssign').unbind('click');
            unloadMindmapData();
            default_releaseid = '';
            $('.release-list').empty();
            $('.release-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
            $('.release-list').addClass('errorClass');
            $('.cycle-list').empty();
            $('.cycle-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
            $('.cycle-list').addClass('errorClass');
            if ($('.search-canvas').hasClass('search-visible')) {
                $('.search-canvas').removeClass('search-visible');
                $('.search-canvas').val('');
            }
            var result=$scope.projectList[selectedProjectIndex].releases;
            $scope.domain=$scope.projectList[selectedProjectIndex].domains;
            reldata = {};
            cycdata = {};
            for (i = 0; i < result.length; i++) {
                $('.release-list').append("<option data-id='" + result[i].name + "' value='" + i + "'>" + result[i].name + "</option>");
                for(j = 0;j < result[i].cycles.length; j++){
                    reldata[result[i].cycles[j]._id]=result[i].name;
                    cycdata[result[i].cycles[j]._id]=result[i].cycles[j].name;
                }
            }

            $('.release-list').change(function() {
                $('.release-list').removeClass('errorClass');
                $('.cycle-list').addClass('errorClass');
                if ($("#ct-AssignBox").hasClass("ct-open") == true) {
                    $('.iconSpaceArrow').trigger('click');
                }
                $('#ctExpandAssign').unbind('click');
                unloadMindmapData();
                default_releaseid = $('.release-list').val() ? $('.release-list').val() : 0;
                var result2 = $scope.projectList[selectedProjectIndex]["releases"][default_releaseid]["cycles"];
                $('.cycle-list').empty();
                $('.cycle-list').append("<option data-id='Select' value='Select' disabled selected>Select</option>");
                $('.cycle-list').addClass('errorClass');
                for (i = 0; i < result2.length; i++) {
                    $('.cycle-list').append("<option data-id='" + result2[i]["name"] + "' value='" + result2[i]["_id"] + "'>" + result2[i]["name"] + "</option>");
                }
            });
        }

        if ($("img.iconSpaceArrow").hasClass("iconSpaceArrowTop")) {
            $("img.iconSpaceArrow").removeClass("iconSpaceArrowTop");
        }
        if ($scope.param == 1) {
            mindmapServices.getVersions($scope.projectNameO).then(
                function(res) {
                    if (res == "Invalid Session") {
                        return $rootScope.redirectPage();
                    }
                    addVersioning(res);
                },
                function(err) {
                    console.log(err);
                    openDialogMindmap('Error', 'Error loading Versions')
                })

        } else if ($scope.tab == 'tabCreate') {
            loadMindmapData1();
        }
        mindmapServices.getProjectTypeMM_Nineteen68($scope.projectNameO).then(function(res1){
            $scope.apptypelist = res1;
            $scope.apptype = res1.project_typename;
            addInfo({'attributes':{
                'Domain': $scope.domain,
                'Apptype':$scope.apptype
                }
            });
        });
		if ($scope.tab == 'tabCreate') {
			if ($('.search-canvas').hasClass('search-visible')) {
					$('.search-canvas').removeClass('search-visible');
					$('.search-canvas').val('');
				}
		}
    };

    function addSearchNodeListeners() {
        var reg = /[^a-zA-Z0-9\_]+/;
        $('.searchimg-canvas').unbind("click");
        $('.searchimg-canvas').click(function(e) {
            if (!dragsearch) {
                if ($('.search-canvas').hasClass('search-visible')) {
                    $('.search-canvas').removeClass('search-visible');
                    $('.search-canvas').val('');
                    $('.searched-node').removeClass('searched-node');
                } else {
                    $('.search-canvas').addClass('search-visible');
                }
            } else dragsearch = false;
        });
        $('#search-canvas-icon').draggable({
            containment: "#ct-mapSvg",
            start: function(e, ui) {
                dragsearch = true
            }
        });
        $(".search-canvas").off("keyup");
        $('.search-canvas').keyup(function(e) {
            if (reg.test($('.search-canvas').val())) {
                $('.search-canvas').addClass('inputErrorBorderFull');
                $('.searched-node').removeClass('searched-node');
            } else {
                $('.searched-node').removeClass('searched-node');
                if (Object.keys($scope.nodeDisplay).length > 0) {
                    $('.search-canvas').removeClass('inputErrorBorderFull');
                    var mptf = $('#ct-mindMap').attr('transform');
                    var searchVal =  $('.search-canvas').val();
                    if(isIE){
                        var elem = $('text[title*="'+searchVal+'"]');  
                    }
                    else{
                        var elem = $('text[title*="' + $('.search-canvas').val() + '" i]');
                    }
                    if (elem.length == 0) {
                        if (!$('.search-canvas').val() == '')
                            $('.search-canvas').addClass('inputErrorBorderFull');
                        return;
                    }
                    if (e.keyCode == 13) {
                        idxSearch = (idxSearch + 1) % elem.length;
                    } else {
                        idxSearch = 0;
                    }
                    var nodetf = $(elem.parent()[idxSearch]).attr('transform');
                    var split_char = ',';
                    if(isIE){
                        split_char = ' ';
                    }
                    var x_mptf = parseInt(mptf.split(/[()]/)[1].split(split_char)[0]);
                    var y_mptf = parseInt(mptf.split(/[()]/)[1].split(split_char)[1]);
                    var scale_mptf = 1; //parseFloat(mptf.split(/[()]/)[3]);
                    var x_nodetf = parseInt(nodetf.split(/[()]/)[1].split(split_char)[0]);
                    var y_nodetf = parseInt(nodetf.split(/[()]/)[1].split(split_char)[1]);
                    //Approx cordinates of node: mindmap translate + nodetf/mpscale
                    var ccord = [x_mptf + (x_nodetf / scale_mptf), y_mptf + (y_nodetf / scale_mptf)];
                    if ($scope.tab == 'mindmapEndtoEndModules') zoom = zoom;
                    zoom.translate([x_mptf - ccord[0] + 400, y_mptf - ccord[1] + 300]);
                    zoom.scale(scale_mptf);
                    zoom.event(d3.select('#ct-mindMap'));
                    $(elem.parent()[idxSearch]).addClass('searched-node');
                } else {
                    return;
                }
                return;
            }

        });
    }

    function loadMindmapData1() {
        blockUI("Loading...");
        var selectedTab = window.localStorage['tabMindMap'];
        uNix = 0;
        uLix = 0;
        dNodes = [];
        dLinks = [];
        nCount = [1, 1, 1, 1];
        scrList = [];
        tcList = [];
        cSpan = [0, 0];
        cScale = 1;
        mapSaved = !1;
        $("#ct-saveAction").addClass("disableButton")
        //Adding task to scenario
        taskAssign = {
            "endtoend": {
                "task": ["Execute", "Execute Batch"],
                "attributes": ["bn", "at", "rw", "sd", "ed", "reestimation", "pg"]
            },
            "modules": {
                "task": ["Execute", "Execute Batch"],
                "attributes": ["bn", "at", "rw", "sd", "ed", "reestimation", "pg"]
            },
            "scenarios": {
                "task": ["Execute Scenario"],
                "attributes": ["at", "rw", "sd", "ed", "reestimation", "pg", "cx"]
            },
            "screens": {
                "task": ["Scrape", "Append", "Compare", "Add", "Map"],
                "attributes": ["at", "rw", "sd", "ed", "reestimation", "pg", "cx"]
            },
            "testcases": {
                "task": ["Design", "Update"],
                "attributes": ["at", "rw", "sd", "ed", "reestimation", "cx"]
            }
        };
        zoom = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoomed);
        $('#ctExpandCreate').click(function(e) {
            toggleExpand(e, 'module');
        });

        $("#ctExpandAssign").click(function(e) {
            toggleExpand(e, 'Assign');
        });

        d3.select('#ct-main').on('contextmenu', function(e) {
            d3.event.preventDefault();
        });


        d3.select('#ct-assignBox').classed('no-disp', !0);
        var version_num = '';

        if ($scope.param == 1) {
            version_num = $('.version-list').val();
        }
        unloadMindmapData();
        mindmapServices.getModules(versioning_enabled, window.localStorage['tabMindMap'], $scope.projectNameO || $scope.projectList[0].id, parseFloat(version_num), $('.cycle-list').val(),null,null)
            .then(function(res) {
                if (res == "Invalid Session") {
                    return $rootScope.redirectPage();
                }
                var nodeBox = d3.select('.ct-nodeBox');
                $scope.allMMaps = res;
                if (selectedTab == 'tabCreate')
                    populateDynamicInputList();
                setModuleBoxHeight();
                unassignTask=[];
                unblockUI();

            }, function(error) {
                console.log("Error:", error);
                unblockUI();
            })
    }



    window.onresize = function() {
        var w = window.innerWidth - 28,
            h = window.innerHeight - 123;
        var mapSvg = d3.select('#ct-mapSvg').style('width', w + 'px').style('height', h + 'px');
    };

    function initiate() {
        var t, u;
        var selectedTab = window.localStorage['tabMindMap'];
        // if (d3.select('#ct-mindMap')[0][0] != null) return;
        addSearchNodeListeners();
        d3.select('#ct-mapSvg').call(zoom).on('click.hideElements', clickHideElements);
    };


    function zoomed(e) {
        if (!$scope.moving) {
            cSpan = d3.event.translate;
            cScale = d3.event.scale;
            //Logic to change the layout               
            d3.select("#ct-mindMap").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

        }
    };

    function getElementDimm(s) {
        return [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    };

    function createNewMap(moduleName) {
        initiate();
        clearSvg();
        var s = getElementDimm(d3.select("#ct-mapSvg"));

        //X and y changed to implement layout change
        // switch-layout feature
        node = {
            id: uNix,
            childIndex: 0,
            name: 'Module_0',
            type: 'modules',
            y: s[1] * 0.4,
            x: s[0] * 0.1 * 0.9,
            children: [],
            parent: null,
            state: 'created',
            _id: null
        };
        if (moduleName) node.name = moduleName;

        if ($scope.verticalLayout) {
            node.y = s[0] * 0.1 * (0.9);
            node.x = s[1] * 0.4;
        };

        dNodes.push(node);
        $scope.nodeDisplay[node.id] = {
            'type': node.type,
            'transform': "translate(" + (node.x).toString() + "," + (node.y).toString() + ")",
            'opacity': !(node._id == null) ? 1 : 0.5,
            'title': node.name,
            'name': node.display_name || node.name,
            '_id': node._id || null
        };
        nCount[0]++;
        uNix++;
        //To fix issue 710-Create a module and see that module name does not display in edit mode
        v = addNode(dNodes[uNix - 1], !1, null);
        childNode = v;
        activeNode = undefined;
        if (!moduleName) {
            setTimeout(function() { $scope.editNode(true, node); }, 100);
        }
    };

    $scope.loadMap = function(idx) {
        $("#ct-saveAction").removeClass("disableButton")
        $("#expCreate").attr('src','imgs/ic-collapse.png');
        $(".search-canvas").val('');
        $scope.functionTBE = 'loadMapPopupConfirmed';
        excelFlag = 1;
        versionFlag = 1;
        $('#createNewConfirmationPopup').attr('mapname', $scope.allMMaps[idx].name);
        $('#createNewConfirmationPopup').attr('mapid', $scope.allMMaps[idx]._id);
        // $('#createNewConfirmationPopup').attr('_id',$scope.allMaps[idx]._id);
        if (Object.keys($scope.nodeDisplay).length != 0) {
            $('#createNewConfirmationPopup').modal('show');
        } else
            loadMapPopupConfirmed();
    };

    function moveMap(dir) {
        var offset = -20; // blocks to move
        switch (dir) {
            case "left":
                zoom.translate([cSpan[0] - offset, cSpan[1]]);
                break;
            case "up":
                zoom.translate([cSpan[0], cSpan[1] - offset]);
                break;
            case "right":
                zoom.translate([cSpan[0] + offset, cSpan[1]]);
                break;
            case "down":
                zoom.translate([cSpan[0], cSpan[1] + offset]);
                break;
            default:
                console.log("no direction provided.");
        }
        zoom.event(d3.select('#ct-mindMap'));
    }

    function zoomedmap() {
        cSpan = zoom.translate();
        cScale = zoom.scale();
        d3.select('#ct-mindMap').attr("transform",
            "translate(" + zoom.translate() + ")" +
            "scale(" + zoom.scale() + ")"
        );
    }

    function interpolateZoom(translate, scale) {
        var self = this;
        return d3.transition().duration(350).tween("zoom", function() {
            var iTranslate = d3.interpolate(zoom.translate(), translate),
                iScale = d3.interpolate(zoom.scale(), scale);
            return function(t) {
                zoom
                    .scale(iScale(t))
                    .translate(iTranslate(t));
                zoomedmap();
            };
        });
    }

    function zoomClick() {
        var direction = 1,
            factor = 0.4,
            target_zoom = 1,
            center = [$('#ct-mapSvg').width() / 2, $('#ct-mapSvg').height() / 2],
            extent = zoom.scaleExtent(),
            translate = zoom.translate(),
            translate0 = [],
            l = [],
            view = { x: translate[0], y: translate[1], k: zoom.scale() };

        d3.event.preventDefault();
        //direction = 1;
        direction = (this.id === 'zoom_in') ? 1 : -1;
        target_zoom = zoom.scale() * (1 + factor * direction);

        if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

        translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
        view.k = target_zoom;
        l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

        view.x += center[0] - l[0];
        view.y += center[1] - l[1];

        interpolateZoom([view.x, view.y], view.k);
    }

    function loadMapPopupConfirmed() {
        clearSvg();
        d3.selectAll('.zoom-btn').on('click', zoomClick);
        $('.navigate-widget').removeClass("no-disp");
        $('.navigate-widget').draggable({ containment: "#ct-mapSvg" });
        $('.arrow-box-ic').unbind('mousedown');
        $('.arrow-box-ic').unbind('mouseup');
        $('.arrow-box-ic').unbind('mouseout');
        $('.arrow-box-ic').mousedown(function(e, i) {
            refreshIntervalId = setInterval(function() { moveMap(e.target.classList[1]) }, 20);
        });
        $('.arrow-box-ic').mouseout(function(e, i) {
            try { clearInterval(refreshIntervalId); } catch (err) { console.log("no interval found."); }

        });
        $('.arrow-box-ic').mouseup(function(e, i) {
            try { clearInterval(refreshIntervalId); } catch (err) { console.log("no interval found."); }
        });
        if (progressFlag) return;
        progressFlag = true;
        $('.fa.fa-pencil-square-o.fa-lg.plus-icon.active-map').trigger('click') //Remove copy rectangle
        $('.fa.fa-clipboard.fa-lg.plus-icon.active-map').trigger('click') //Disable paste
        // saveFlag = false;
        saveFlag=true;
        SaveCreateED('#ct-createAction', 1, 0);
        $("div.nodeBoxSelected").removeClass("nodeBoxSelected");
        $('[title=' + $('#createNewConfirmationPopup').attr('mapname') + ']').addClass("nodeBoxSelected");
        d3.select('#ct-inpBox').classed('no-disp', true);
        var modName = $('#createNewConfirmationPopup').attr('mapname');
        var moduleid =$('#createNewConfirmationPopup').attr('mapid');
        $scope.modType = 'e2e';
        blockUI("Loading module.. Please wait..");
        mindmapServices.getModules(versioning_enabled, window.localStorage['tabMindMap'], $scope.projectNameO, 0, $('.cycle-list').val(), modName,moduleid).then(function(result) {
            progressFlag=false;
            if($scope.tab=="tabAssign" && result["completeFlow"]==false)
            {
				unblockUI();
                openDialogMindmap("Error", "Please select a complete flow to assign tasks.");						   
            }
            else
            {
                unloadMindmapData();
                initiate();
                clearSvg();
                if (result == "Invalid Session") {
                    return $rootScope.redirectPage();
                }
                currMap=result;
                unassignTask=[];
                excelMap = JSON.parse(JSON.stringify(currMap));
                loadedmodule = excelMap.name;
                $('div[title=' + modName + ']').addClass('nodeBoxSelected');
                if ($scope.tab == 'tabCreate')
                    populateDynamicInputList();
                setModuleBoxHeight();
                treeBuilder(currMap);
                unblockUI();
                IncompleteFlowFlag = false;
                var errTemp = false;
                if (dNodes[0].type != 'endtoend') {
                    errTemp = treeIterator(undefined, dNodes[0], false);
                    $scope.modType = 'generic';
                }
                if (errTemp) {
                    IncompleteFlowFlag = true;
                }
            }
        }, function(error) {
            unblockUI();
            openDialogMindmap("Error", "Error while loading module");
            console.log(error);
        })
    }


    function getReuseDetails() {
        // reuse details within the same module
        var dictTmp = {};
        dNodes.forEach(function(e, i) {
            dictTmp[i] = [];
            if (e.reuse) {
                dNodes.forEach(function(f, j) {
                    if (e.type == f.type && e.type == 'screens' && e.name == f.name && i != j && f.reuse)
                        dictTmp[i].push(j);
                    else if (e.type == f.type && e.type == 'testcases' && e.name == f.name && i != j && e.parent && f.parent && e.parent.name == f.parent.name && f.reuse)
                        dictTmp[i].push(j);
                    else if (e.type == f.type && e.type== 'scenarios' && e.name==f.name && i!=j && f.reuse)
                        dictTmp[i].push(j);
                })
            }
        })
        return dictTmp;
    }

    // to load the map again after switching the layout
    function loadMap2() {
        var selectedTab = window.localStorage['tabMindMap'];
        if (selectedTab == 'mindmapEndtoEndModules') {
            var tbd = dNodes[0];
            initiate();
            clearSvg();
            treeBuilder_W(tbd);
        } else {
            var tbd = dNodes[0];
            initiate();
            clearSvg();
            treeBuilder(tbd);
        }
    };

    function genPathData(s, t) {
    if(isIE){
            return ('M ' + s[0] + ' ' + s[1] + ' C ' + (s[0] + t[0]) / 2 + ' ' + s[1] + ' ' + (s[0] + t[0]) / 2 + ' ' + t[1] + ' ' + t[0] + ' ' + t[1]);
        }
        else{
            return ('M' + s[0] + ',' + s[1] + 'C' + (s[0] + t[0]) / 2 + ',' + s[1] + ' ' + (s[0] + t[0]) / 2 + ',' + t[1] + ' ' + t[0] + ',' + t[1]);
        }
    };


    function addNode(n, m, pi) {
        // n:node m : flag , pi: parentnode
        n.display_name = n.name;
        var ch = 15;
        if (n.name.length > 15) {
            n.display_name = n.display_name.slice(0, ch) + '...';
        }
        var img_src = 'imgs/node-' + n.type + '.png';
        if (n.reuse && (n.type == 'testcases' || n.type == 'screens')) img_src = 'imgs/' + n.type + '-reuse.png';

        $scope.nodeDisplay[n.id] = {
            'type': n.type,
            'transform': "translate(" + (n.x).toString() + "," + (n.y).toString() + ")",
            'opacity': !( n._id == null || n._id == undefined) ? 1 : 0.5,
            'title': n.name,
            'name': n.display_name,
            'img_src': img_src,
            '_id': n._id || null,
            'state':n.state || "created",
            'reuse':n.reuse || false
        };
        var v = '#ct-node-' + n.id;
        return v;
    };

    function addNode_W(n, m, pi) {
        // n:node m : flag , pi: parentnode
        n.display_name = n.name;
        var nodeOpacity = n._id ? 1 : 0.5;
        var ch = 15;
        img_src = "imgs/node-" + n.type + ".png";
        if (n.name.length > ch) {
            n.display_name = n.display_name.slice(0, ch) + '...';
        }
        //Condition to add the properties of reuse to the node (Currently only for testcases)
        $scope.nodeDisplay[n.id] = {
            'type': n.type,
            'transform': "translate(" + (n.x).toString() + "," + (n.y).toString() + ")",
            'opacity': nodeOpacity,
            'title': n.name,
            'name': n.display_name,
            'img_src': img_src,
            '_id':n._id,
            'state':n.state || "created",
            'reuse':n.reuse || false
        };
        var v = '#ct-node-' + n.id;
        return v;
    };

    function addLink(r, p, c) {
        //Modified parameters for layout change

        // switch-layout feature
        if ($scope.verticalLayout) {
            var s = [p.x + 20, p.y + 55];
            var t = [c.x + 20, c.y - 3];
        } else {
            var s = [p.x + 43, p.y + 20];
            var t = [c.x - 3, c.y + 20];
        }
        var d = genPathData(s, t);
        var lid = 'link-' + p.id + '-' + c.id
        $scope.linkDisplay[lid] = ({ 'd': d });
        $timeout(function(){
                $("#link-"+p.id+"-"+c.id).attr("d",d);
        },200);
        //var l = d3.select('#ct-mindMap').insert('path', 'g').attr('id', 'ct-link-' + r).attr('class', 'ct-link').attr('d', d);
    };
    //To Unassign the task of a particular node
    $scope.removeTask = function(e, tidx,twf) {
        var uinfo = JSON.parse(window.localStorage['_UI']);
        reuseDict = getReuseDetails();
        //Fetching the config value for strictTaskWorkflow for the first time, hence the check
        var cycleid=$('.cycle-list').val();
		if (twf !== false) twf= uinfo.taskwflow;  
        var pi,p=null;
		if (tidx==undefined){
			p = d3.select(activeNode);
		}else{
			p = d3.select('#ct-node-' + tidx);
		}
        if (tidx == 0 || tidx == undefined) {
            if ($("#ct-unassignButton a").attr('class') == 'disableButton') return;
            pi = parseInt(p.attr('id').split('-')[2]);
        } else pi = tidx;

        if(dNodes[pi].type=="screens" || dNodes[pi].type=="testcases")
        {
            if(dNodes[pi].task!=null && dNodes[pi].task.cycleid!=cycleid)
            {
                return;
            } 
        }
        task_unassignment(pi,twf);

        if (reuseDict[pi].length > 0) {
            reuseDict[pi].forEach(count1.add, count1)
        }
        count1.forEach(function(ee,indx){
            var p = d3.select('#ct-node-' + indx);
            p.select('.ct-nodeTask').classed('no-disp', !0);
            count1.delete(indx);
        });
    }

    $('#unassignTask').click(function() {
		var p = d3.select(activeNode);
		var pi = parseInt(p.attr('id').split('-')[2]);
        task_unassignment(pi,false);
    });
	
    function task_unassignment(pi,twf){
		if (twf && (dNodes[pi].type=="screens" || dNodes[pi].type=="testcases")){
			$('#unassignmentConfirmationPopup').modal("show");
			return;
		} 
		var p = d3.select('#ct-node-' + pi);
        p.select('.ct-nodeTask').classed('no-disp', !0);
        if (dNodes[pi].task != null) {
            dNodes[pi].task.status = 'unassigned'; //status and assignedtoname are solely for notification
            if (dNodes[pi].task._id!=null)
            {
                unassignTask.push(dNodes[pi].task._id);
                $scope.nodeDisplay[pi].task=false;
            }
        }
        d3.select('#ct-assignBox').classed('no-disp', !0);
        index=activeNode.split("-")[2]
        if (dNodes[pi].children && $('.pg-checkbox')[0].checked && (index == pi || dNodes[index]._id==dNodes[pi].parent._id || dNodes[index].type == "modules")) {
            dNodes[pi].children.forEach(function(e, i) {
                $scope.removeTask('something', e.id,twf);
            });
        }
    }


    function assignBoxValidator() {
        var uinfo = JSON.parse(window.localStorage['_UI']);
        var twf= uinfo.taskwflow; 
        if(twf){
            if($("#ct-assignedTo option:selected").val()==$("#ct-assignRevw option:selected").val()){
                $("#ct-assignRevw").css('border', '').addClass("inputErrorBorderFull");
                $("#ct-assignedTo").css('border', '').addClass("inputErrorBorderFull");
                return false;
            }
        }
        $("ct-assignTask,#ct-assignedTo,#ct-assignRevw").removeClass("selectErrorBorder");
        $("#startDate,#endDate").removeClass("inputErrorBorder");
        if ($("ct-assignTask option:selected").val() == "select user") {
            $("#ct-assignedTo").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#ct-assignTask option:selected").val() == "Execute Batch" && $("#ct-executeBatch").val() == "") {
            $("#ct-executeBatch").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#ct-assignedTo option:selected").val() == "select user") {
            $("#ct-assignedTo").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#ct-assignRevw option:selected").val() == "select reviewer") {
            $("#ct-assignRevw").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#startDate").val() == "") {
            $("#startDate").css('border', '').addClass("inputErrorBorderFull");
            return false;
        } else if ($("#endDate").val() == "") {
            $("#endDate").css('border', '').addClass("inputErrorBorderFull");
            return false;
        }
        var ed = $("#endDate").val().split('/');
        var sd = $("#startDate").val().split('/');
        start_date = new Date(sd[2] + '-' + sd[1] + '-' + sd[0]);
        end_date = new Date(ed[2] + '-' + ed[1] + '-' + ed[0]);
        var apptype = $('.project-list option:selected').attr('app-type');

        if (end_date < start_date) {
            $("#endDate").css('border', '').addClass("inputErrorBorderFull");
            return false;
        }
    }

    function initTaskObject(pi) {
        tvn = 0;
        var estimationCount = 0;
        if (dNodes[pi].task != undefined || dNodes[pi].task != null) {
            if (dNodes[pi].task.enddate != "" || dNodes[pi].task.enddate != undefined || dNodes[pi].task.enddate != " ") {
                var nodeDateSplit = dNodes[pi].task.enddate.split("/");
                var modDateSplit = $('#endDate').val().split("/");
                if (new Date(nodeDateSplit[2], (nodeDateSplit[1] - 1), nodeDateSplit[0]) != new Date(modDateSplit[2], (modDateSplit[1] - 1), modDateSplit[0])) {
                    estimationCount = parseInt(dNodes[pi].task.reestimation) + 1;
                }
            }
        }
        if ($('.version-list') !== undefined)
            tvn = $('.version-list').val();
        var tObj = {
            tvn: tvn,
            t: $('#ct-assignTask').val(),
            bn: $('#ct-executeBatch').val(),
            at: $('#ct-assignedTo').val(),
            rw: /*(d3.select('#ct-assignRevw')[0][0])?*/ $('#ct-assignRevw').val() /*:null*/ ,
            sd: $('#startDate').val(),
            ed: $('#endDate').val(),
            reestimation: estimationCount,
            re: $('.release-list').val(),
            cy: $('.cycle-list').val(),
            det: d3.select('#ct-assignDetails').property('value'),
            app: $('option:selected', '.project-list').attr('app-type')
        };
        //console.log(tObj);
        if (dNodes[pi].task) {
            tObj._id = dNodes[pi].task._id;
            tObj.parent = dNodes[pi].task.parent;
        } else {
            tObj._id = null;
            tObj.parent = null;
        }

        return tObj;

    }

    function updateTaskObject(tObj, data,taskUndef) {

        var t = {
            taskvn: tObj.tvn,
            _id:null,
            batchName: tObj.bn,
            task: tObj.t,
            assignedto: tObj.at,
            assignedToName: $('[value="' + tObj.at + '"]').attr('data-id'),
            reviewer: tObj.rw,
            startdate: tObj.sd,
            enddate: tObj.ed,
            reestimation: tObj.reestimation,
            release: $('.release-list').val(),
            cycleid: $('.cycle-list').val(),
            details: tObj.det,
            parent: data.parent,
            complexity: clist != undefined ? clist.toString() : undefined
        };
        if (!taskUndef) t._id = tObj._id != undefined ? tObj._id : null
        
        if (data.id == 0) return t;
        else delete t.batchName;
        if (data.id == 1) {
            t.task = "Execute Scenario";
        } else if (data.id == 2) {
            t.task = "Scrape";
        } else if (data.id == 3) {
            t.task = "Design";
        } else if (data.id == 5) {
            delete t.taskvn;
            t.task = "Scrape";
        } else if (data.id == 8) {
            t.task = data.ctask;
        } else if (data.id == 6) {
            t.task = "Design";
        }
        return t;
    }

    $scope.addTask = function(e) {
        var cycleid=$('.cycle-list').val();
        reuseDict = getReuseDetails();
        var validateStatus = assignBoxValidator();
        // $('#ct-unassignButton').addClass("disableButton");
        if (validateStatus === false) return false;
        d3.select('#ct-assignBox').classed('no-disp', !0);
        var a, b, p = d3.select(activeNode);
        var pi = parseInt(p.attr('id').split('-')[2]);
        var nType = p.attr('data-nodetype');
        var tObj = initTaskObject(pi);
        var taskflag = false;
        var errorRelCyc = false;
        var dateFlag = true;
        var reviewerFlag = true;
        var apptype = $('.project-list option:selected').attr('app-type');
        if ($('#startDate').val() == null || $('#endDate').val() == null || $('#startDate').val() == '' || $('#endDate').val() == '') {
            dateFlag = false;
        }
        if (tObj.rw == 'select reviewer' || tObj.at == 'select user') {
            reviewerFlag = false;
        }
        if (dateFlag && reviewerFlag) {
            Object.keys(tObj).forEach(function(k) {
                if (tObj[k] === undefined) tObj[k] = null;
            });
            if(p.select('.ct-nodeTask')[0][0]==null) p.append('image').attr('class','ct-nodeTask').attr('xlink:href','imgs/node-task-assigned.png').attr('x',29).attr('y',-10);
            if (nType == "modules" || nType == "endtoend") {
                if (dNodes[pi]._id != "null") {

                    addTask_11(pi, tObj, 0);
                }
                //Logic to add tasks for the scenario
                if (dNodes[pi].children && $('.pg-checkbox')[0].checked) dNodes[pi].children.forEach(function(tSc) {
                    addTask_11(tSc.id, tObj, 1);
                    if (tSc.children != undefined) {
                        tSc.children.forEach(function(scr) {
                            if (apptype != "258afbfd-088c-445f-b270-5014e61ba4e2" && apptype != "7a6820f1-2817-4d57-adaf-53734dd2354b") addTask_11(scr.id, tObj, 2);
                            scr.children.forEach(function(tCa) {
                                addTask_11(tCa.id, tObj, 3);
                            });
                        });
                    }
                });
            }
            //Logic to add tasks for the scenario
            else if (nType == "scenarios") {
                var modid = dNodes[pi].parent.id_c,
                    tscid = dNodes[pi].id_c;

                if (tscid != 'null') {
                    addTask_11(dNodes[pi].id, tObj, 4);
                    if (dNodes[pi].children && $('.pg-checkbox')[0].checked) dNodes[pi].children.forEach(function(scr) {
                        if (apptype != "258afbfd-088c-445f-b270-5014e61ba4e2" && apptype != "7a6820f1-2817-4d57-adaf-53734dd2354b") addTask_11(scr.id, tObj, 5);
                        scr.children.forEach(function(tCa) {
                            addTask_11(tCa.id, tObj, 6);
                        });
                    });
                }


            } else if (nType == "screens") {
                addTask_11(pi, tObj, 7);
                if (dNodes[pi].children && $('.pg-checkbox')[0].checked) dNodes[pi].children.forEach(function(tCa) {
                    var cTask = (tObj.t == "Scrape" || tObj.t == "Append" || tObj.t == "Compare") ? "Design" : "Debug";
                    addTask_11(tCa.id, tObj, 8, cTask);
                });
            } else if (nType == "testcases") {
                addTask_11(pi, tObj, 9);
            }
        }

        function addTask_11(pi, tObj, qid, cTask) {
            var cycleid=$('.cycle-list').val();
            var validate = checkAndUpdate(dNodes[pi], []);
            var taskUndef = (dNodes[pi].task === undefined || dNodes[pi].task == null || (dNodes[pi].task != null && dNodes[pi].task.status== "complete"));
            var origTask = ([0, 4, 7, 9].indexOf(qid) != -1); // Orignal tasks not cascaded  
            var taskStatus;
            if(dNodes[pi].type=="screens" || dNodes[pi].type=="testcases")
            {
               if(dNodes[pi].task!=null && dNodes[pi].task.cycleid!=cycleid)
               {
                   return;
               } 
            }
            if (validate[0]) {
                taskflag = true;
                if (taskUndef) {
                    d3.select('#ct-node-' + pi).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/node-task-assigned.png').attr('x', 29).attr('y', -10).attr('width', '21px').attr('height', '21px');
                }
                // If task already exists then set it to true
                if (dNodes[pi].task) taskStatus = dNodes[pi].task.status;
                else taskStatus = 'assigned';
                if (qid == 9)
                    dNodes[pi].task = updateTaskObject(tObj, {
                        id: 9,
                        parent: (tObj.parent != null) ? tObj.parent : dNodes[pi].parent.parent._id
                    },taskUndef);
                else if (qid == 7)
                    dNodes[pi].task = updateTaskObject(tObj, {
                        id: 7,
                        parent: (tObj.parent != null) ? tObj.parent : dNodes[pi].projectID
                    },taskUndef);
                else if (qid == 8 && taskUndef) {
                    dNodes[pi].task = updateTaskObject(tObj, {
                        id: 8,
                        parent: dNodes[pi].parent.parent._id,
                        ctask: cTask
                    },taskUndef);
                } else if (qid == 5 && taskUndef) {
                    dNodes[pi].task = updateTaskObject(tObj, {
                        id: 5,
                        parent: dNodes[pi].projectID
                    },taskUndef);
                } else if (qid == 6 && taskUndef) {
                    dNodes[pi].task = updateTaskObject(tObj, {
                        id: 6,
                        parent: dNodes[pi].parent.parent._id
                    },taskUndef);
                } else if (qid == 4) {
                    dNodes[pi].task = updateTaskObject(tObj, {
                        id: 4,
                        parent: (tObj.parent != null) ? tObj.parent : dNodes[pi].parent._id
                    },taskUndef)
                } else if (qid == 3 && taskUndef) {
                    dNodes[pi].task = updateTaskObject(tObj, {
                        id: 3,
                        parent: dNodes[pi].parent.parent._id
                    },taskUndef);
                } else if (qid == 2 && taskUndef) {
                    dNodes[pi].task = updateTaskObject(tObj, {
                        id: 2,
                        parent: dNodes[pi].projectID
                    },taskUndef);
                } else if (qid == 1 && taskUndef) {
                    dNodes[pi].task = updateTaskObject(tObj, {
                        id: 1,
                        parent: dNodes[pi].parent._id
                    },taskUndef);
                } else if (qid == 0) {
                    dNodes[pi].task = updateTaskObject(tObj, {
                        id: 0,
                        parent: (tObj.parent != null) ? tObj.parent : ""
                    },taskUndef);
                }
                if ((!taskUndef && !origTask) || origTask) {
                    //update parent
                    if (tObj.parent != validate[1]) {
                        dNodes[pi].task['updatedParent'] = validate[1];
                    }
                }
                if (!origTask) {
                    dNodes[pi].task.complexity = undefined;
                    dNodes[pi].task.details = '';
                }
                if(!origTask && taskUndef){
                    dNodes[pi].task.details =  dNodes[pi].task.task + " " + dNodes[pi].type.substring(0,dNodes[pi].type.length-1) + " " + dNodes[pi].name;
                }                
                if(!taskUndef && !origTask){
                    dNodes[pi].task.reviewer = tObj.rw;
                    dNodes[pi].task.enddate = tObj.ed;
                }
                dNodes[pi].task.status = taskStatus;
              

                function replicateTask(pi) {
                    //replicate task to reused node
                    //extend creates new copy of object instead of taking reference
                    var tempTask = jQuery.extend(true, {}, dNodes[pi].task);
                    if (reuseDict[pi].length > 0) {
                        reuseDict[pi].forEach(function(e, i) {
                            if (dNodes[e]._id == null) return;
                            dNodes[e].task = tempTask;
                            dNodes[e].task.copied = true;
                            dNodes[e].task.copiedidx = pi;
                            $scope.nodeDisplay[e].task = true;
                            // d3.select('#ct-node-' + e).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/node-task-assigned.png').attr('style', 'opacity:1').attr('x', 29).attr('y', -10).attr('width', '21px').attr('height', '21px');
                        });
                    }
                    dNodes[pi].task.copied = false;
                }

                replicateTask(pi);
            }
        }

        function checkAndUpdate(nObj, parentlist) {
            parentlist.unshift(nObj.id_c);
            if (nObj.id_c == "null") return [false, []];
            if (nObj.type == 'modules' || nObj.type == 'endtoend') {
                return [true, parentlist];
            }
            if (nObj.parent) {
                return checkAndUpdate(nObj.parent, parentlist);
            }
        }
        if (!(dateFlag || reviewerFlag)) {
            openDialogMindmap("Date Error", "Please select User/Reviewer and Date ")
        } else if (dateFlag == false) {
            openDialogMindmap("Date Error", "Please select Date")
        } else if (reviewerFlag == false) {
            openDialogMindmap("Task Assignment Error", "Please select Reviewer/Assigned User")
        } else if (taskflag) {
            if (p.select('.ct-nodeTask')[0][0] == null) p.append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/node-task-assigned.png').attr('x', 29).attr('y', -10).attr('width', '21px').attr('height', '21px');
        } else if (taskflag == false) {
            openDialogMindmap("Task Assignment Error", "Please create the structure before assigning task")
        }
        if (errorRelCyc) {
            openDialogMindmap("Task Assignment Error", "Please select Release/Cycle")
        }
        for (var i = 0; i < taskidArr.length; i++) {
            if (taskidArr[i]._id == dNodes[pi].task._id) {
                if (dNodes[pi].task.task == "Execute" || dNodes[pi].task.task == "Execute Batch") {
                    assignedObj[dNodes[pi].task.task] = $("#ct-assignedTo option:selected").text();
                } else if (dNodes[pi].task.task == "Execute Scenario") {
                    assignedObj[dNodes[pi].task.task] = $("#ct-assignedTo option:selected").text();
                } else if (dNodes[pi].task.task == "Scrape" || dNodes[pi].task.task == "Append" || dNodes[pi].task.task == "Compare" || dNodes[pi].task.task == "Add" || dNodes[pi].task.task == "Map") {
                    assignedObj[dNodes[pi].task.task] = $("#ct-assignedTo option:selected").text();
                } else if (dNodes[pi].task.task == "Design" || dNodes[pi].task.task == "Update") {
                    assignedObj[dNodes[pi].task.task] = $("#ct-assignedTo option:selected").text();
                }
            }
        }
    };

    function addInfo(d) {
        if(d.type){
            attrArr = "<strong>Node Type:</strong> " + d.type+"<br>";
        }
        else{
            attrArr = "";            
        }
        for (var key in d.attributes) {
            if (d.attributes[key])
                attrArr += "<strong>" + key + ":</strong> " + d.attributes[key]+"<br>";
        }
        d3.select('#window-pi p.proj-info-wrap').html(attrArr);
    };


    function nodeCtrlClick($event) {
        d3.select('#ct-inpBox').classed('no-disp', !0);
        //In case of paste
        var activeNode_temp;
        if ($('#pasteImg1').hasClass('active-map')) {
            activeNode_temp = activeNode;
            if (d3.select(activeNode).attr('data-nodetype') == $($('.node-selected')[0]).attr('data-nodetype')) {
                if ($($('.node-selected')[0]).attr('data-nodetype') == 'scenarios') {
                    //paste to scenarios
                    //call $scope.createnode for each node
                    dNodes_c.forEach(function(e, i) {
                        activeNode = activeNode_temp;
                        if (e.type == 'screens') {
                            $scope.createNode(true, {
                                name: e.name
                            });
                            activeNode = childNode;
                            dLinks_c.forEach(function(f, j) {
                                if (f.source.id == e.id) {
                                    $scope.createNode(true, {
                                        name: f.target.name
                                    });
                                }
                            })
                        }

                    });
                } else if ($($('.node-selected')[0]).attr('data-nodetype') == 'modules') {
                    var activenode_scr;
                    //paste to module
                    //call $scope.createNode for each node
                    dNodes_c.forEach(function(e, i) {
                        if (e.type == 'scenarios') {
                            activeNode = '#ct-node-0';
                            $scope.createNode(true, {
                                name: e.name
                            });
                            activeNode = childNode;
                            activenode_scr = activeNode;
                            dLinks_c.forEach(function(f, j) {
                                if (f.source.id == e.id && f.target.type == 'screens') {
                                    activeNode = activenode_scr;
                                    $scope.createNode(true, {
                                        name: f.target.name
                                    });
                                    activeNode = childNode;
                                    dLinks_c.forEach(function(g, k) {
                                        if (g.source.id == f.target.id && g.source.type == 'screens') {
                                            $scope.createNode(true, {
                                                name: g.target.name
                                            });
                                        }
                                    });
                                }
                            })
                        }

                    });
                }
                openDialogMindmap('Success', 'Pasted successfully');
            } else if ($($('.node-selected')[0]).attr('data-nodetype') == 'scenarios') {
                openDialogMindmap('Error', 'Please select a Scenario to paste to..');
            } else if($($('.node-selected')[0]).attr('data-nodetype') == 'modules') {
                openDialogMindmap('Error', 'Please select a Module to paste to..');
            }
            return;
        }
        var p = d3.select(activeNode);
        var t = p.attr('data-nodetype');
        var split_char = ',';
        if (isIE) split_char = ' ';
        var l = p.attr('transform').slice(10, -1).split(split_char);
        l = [(parseFloat(l[0]) + 40) * cScale + cSpan[0], (parseFloat(l[1]) + 40) * cScale + cSpan[1]];
        var c = d3.select('#ct-ctrlBox').style('top', l[1] + 'px').style('left', l[0] + 'px').classed('no-disp', !1);
        c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !1);
        c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !1);
        c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !1);
        c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !1);
        if ($scope.tab == 'mindmapEndtoEndModules') {
            if (t == 'endtoend') {
                c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !0);
                c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Module');
                //513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
                c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !0);
                //c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Module');
            } else if (t == 'scenarios') {
                c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !0);
                c.select('p.' + faRef.edit).classed('ct-ctrl-inactive', !0);
                c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Scenario');
            }
        } else {
            if (t == 'modules') {
                c.select('p.' + faRef.plus + ' .ct-tooltiptext').html('Create Scenarios');
                c.select('p.' + faRef.plus1 + ' .ct-tooltiptext').html('Create Multiple Scenarios');
                c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Module');
                //513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
                c.select('p.' + faRef.delete).classed('ct-ctrl-inactive', !0);
                //c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Module');
            } else if (t == 'scenarios') {
                c.select('p.' + faRef.plus + ' .ct-tooltiptext').html('Create Screens');
                c.select('p.' + faRef.plus1 + ' .ct-tooltiptext').html('Create Multiple Screens');
                c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Scenario');
                c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Scenario');
            } else if (t == 'screens') {
                c.select('p.' + faRef.plus + ' .ct-tooltiptext').html('Create Testcases');
                c.select('p.' + faRef.plus1 + ' .ct-tooltiptext').html('Create Multiple Testcases');
                c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Screen');
                c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Screen');
            } else if (t == 'testcases') {
                c.select('p.' + faRef.plus).classed('ct-ctrl-inactive', !0);
                c.select('p.' + faRef.plus1).classed('ct-ctrl-inactive', !0);
                c.select('p.' + faRef.edit + ' .ct-tooltiptext').html('Edit Testcase');
                c.select('p.' + faRef.delete + ' .ct-tooltiptext').html('Delete Testcase');
            }
        }

    };

    function nodeClick(e) {
        d3.select('#window-pi p.proj-info-wrap').empty();
        if (IncompleteFlowFlag) {
            openDialogMindmap('Error', 'Incomplete Flow!');
            return;
        }
        var u, v, w, f, c = d3.select('#ct-assignBox');
        var p = d3.select(activeNode);
        var pi = parseInt(p.attr('id').split('-')[2]);
        var cycleid=$('.cycle-list').val();
        if ((dNodes[pi].type == 'screens' || dNodes[pi].type == 'testcases') && (dNodes[pi].task && dNodes[pi].task.cycleid!=cycleid)) {
            addInfo({
                type: dNodes[pi].type,
                attributes: {
                    'Task': dNodes[pi].task.tasktype,
                    'Release': reldata[dNodes[pi].task.cycleid],
                    'Cycle': cycdata[dNodes[pi].task.cycleid],
                    'Domain': $scope.domain,
                    'Apptype':$scope.apptype
                }
            });
            if (!$("#right-dependencies-section").is(":visible")) {
                $("#ct-expand-right").trigger('click');
            }
            $('[title="Info"]').trigger('click');
            return;
        }

        var t = p.attr('data-nodetype');
        var flag = true;
        var apptype = $('.project-list option:selected').attr('app-type')
        if (t == 'scenarios' && dNodes[pi].parent.type == 'endtoend') {
            flag = false;
        } else if (t == 'screens' && (apptype == "258afbfd-088c-445f-b270-5014e61ba4e2" || apptype == "7a6820f1-2817-4d57-adaf-53734dd2354b")) {
            if (apptype == "7a6820f1-2817-4d57-adaf-53734dd2354b")
                openDialogMindmap('Error', 'Task disabled for System screen');
            else
                openDialogMindmap('Error', 'Task disabled for Mainframe screen');
            return;
        }
        if (flag) {
            if (t != 'testcases' && (dNodes[pi]._children != null)) {
                //380-Mindmap-Unable to create node when parent node is collapsed .- Error msg changed to Expand the node
                openDialogMindmap('Error', 'Expand the node');
                return;
            } else if (t != 'testcases' && (dNodes[pi].children == null)) {
                openDialogMindmap('Error', 'Incomplete Flow');
                return;
            }
        }


        //if(t=='scenarios') return;
        var cycleid=$('.cycle-list').val();
        var nt = (dNodes[pi].task !== undefined || dNodes[pi].task != null) ? dNodes[pi].task : !1;
        
        var tObj = {
            t: (nt) ? nt.tasktype : '',
            bn: (nt) ? nt.batchname : '',
            at: (nt) ? nt.assignedto : '',
            rw: (nt && nt.reviewer != null) ? nt.reviewer : '',
            sd: (nt) ? nt.startdate : '',
            ed: (nt) ? nt.enddate : '',
            re: (nt && nt.release != null) ? nt.release : '',
            cy: (nt && nt.cycleid != null) ? nt.cycleid : '',
            det: (nt) ? nt.details : '',
            cx: (nt) ? nt.complexity : undefined,
            _id:(nt)? nt._id:null
        };

        c.classed('no-disp', !1);
        //d3.select('#ct-assignDetails').property('value', tObj.det);
        d3.select('#ct-assignTable').select('ul').remove();
        u = d3.select('#ct-assignTable').append('ul');
        v = u.append('li');
        v.append('span').attr('class', 'ct-assignItem fl-left').html('Task');
        var d = v.append('select').attr('id', 'ct-assignTask');
        taskAssign[t].task.forEach(function(tsk, i) {
            $('#ct-assignTask').append("<option data-id='" + tsk + "' value='" + tsk + "'>" + tsk + "</option>");
        });
        if (tObj.t == null || tObj.t == "") {
            tObj.t = taskAssign[t].task[0];
        }

        $("#ct-assignTask option[value='" + tObj.t + "']").attr('selected', 'selected');

        if (tObj.det === null || tObj.det.trim() == "") {
            d3.select('#ct-assignDetails').property('value', tObj.t + " " + dNodes[pi].type.substring(0,dNodes[pi].type.length-1) + " " + dNodes[pi].name);
        } else {
            d3.select('#ct-assignDetails').property('value', tObj.det);
        }

        $("#ct-assignTask").change(function() {
            if ($("#ct-assignTask").val() == 'Execute Batch') {
                $('#ct-executeBatch').removeAttr("disabled");
            } else {
                $('#ct-executeBatch').attr('disabled', 'true');
                $('#ct-executeBatch').val('');
            }
        })


        var default_releaseid = '';
        taskAssign[t].attributes.forEach(function(tk) {
            v = tk != 'reestimation' ? u.append('li') : v;
            //v=u.append('li');
            if (tk == "bn") {
                v.append('span').attr('class', 'ct-assignItem fl-left').html('Batch Name');

                var d = v.append('input').attr('type', 'text').attr('id', 'ct-executeBatch');
                $('#ct-executeBatch').attr('maxlength', '255');
                $('#ct-executeBatch').attr('value', tObj.bn);
                if (tObj.t != 'Execute Batch') {
                    $('#ct-executeBatch').attr('disabled', 'true')
                }
            }
            if (tk == 'at') {
                var result1 = {};
                v.append('span').attr('class', 'ct-assignItem fl-left').html('Assigned to');
                var d = v.append('select').attr('id', 'ct-assignedTo'); //.attr('class','assignedTo')

                
                //PAssing selected projectid to the service
                mindmapServices.populateUsers($scope.projectNameO)
                    .then(function(res) {
                        if (res == "Invalid Session") {
                            return $rootScope.redirectPage();
                        }
                        $('#ct-assignedTo').empty().append("<option value='select user' >Select User</option>");
                        res=res.rows
                        for (i = 0; i < res.length; i++) {
                            $('#ct-assignedTo').append("<option data-id='" + res[i]["name"] + "' value='" + res[i]["_id"] + "'>" + res[i]["name"] + "</option>");
						}
                        $("#ct-assignedTo option[value='" + tObj.at + "']").attr('selected', 'selected');
                        if ($("#ct-assignedTo").val() != "select user" && nt._id != null) {
                            $('#ct-assignedTo').attr('disabled', 'disabled');
                            $('#ct-assignedTo').css('background', '#ebebe4');
                        }
                    }, function(error) {
                        console.log("Error:::::::::::::", error);
                        unblockUI();
                    })

            } else if (tk == 'rw') {
                var result1 = {};
                v.append('span').attr('class', 'ct-assignItem fl-left').html('Reviewer');
                var d = v.append('select').attr('id', 'ct-assignRevw'); //.attr('class','reviwedBy');                
                mindmapServices.populateUsers($scope.projectNameO)
                    .then(function(res) {
                        if (res == "Invalid Session") {
                            return $rootScope.redirectPage();
                        }
                        $('#ct-assignRevw').empty();
                        $('#ct-assignRevw').append("<option value='select reviewer' select=selected>" + "Select Reviewer" + "</option>");
                        res=res.rows
                        for (i = 0; i < res.length; i++) {
                            $('#ct-assignRevw').append("<option data-id='" + res[i]["name"] + "' value='" + res[i]["_id"] + "'>" + res[i]["name"] + "</option>");
                        }
                        $("#ct-assignRevw option[value='" + tObj.rw + "']").attr('selected', 'selected');

                    }, function(error) {
                        console.log("Error:::::::::::::", error);
                        unblockUI();
                    })

            } else if (tk == 'sd') {
                v.append('span').attr('class', 'ct-assignItem fl-left').html('Start Date');
                w = v.append('div').attr('class', 'ct-assignItem btn-group dropdown fl-right-assign dateBoxSd');
                // w.append('input').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignStart').html(tObj.sd);
                // w.append('button').attr('class','ct-asValBoxIcon ct-asItemCal btn dropdown-toggle').attr('data-toggle','dropdown').append('img').attr('src','imgs/ic-datepicker.png').attr('alt','calIcon');
                w.append('input').attr('class', 'datepicker').attr('id', 'startDate');
                //$("img[src='imgs/ic-datepicker.png']:not(.dateIcon)").remove();
                $(".dateBoxSd").append("<img id='dateIconStartDate' class='dateIcon' src='imgs/ic-datepicker.png' />").attr('alt', 'calIcon');
                $('#startDate').datepicker({
                    format: "dd/mm/yyyy",
                    todayHighlight: true,
                    autoclose: true,
                    startDate: new Date()
                });
                $('#startDate').blur(function() {
                    $('#startDate').val($(this).val());
                });
                $('#dateIconStartDate').click(function() {
                    $("#startDate").datepicker("show");
                });
                f = w.append('ul').attr('class', 'ct-asValCalBox dropdown-menu'); //.on('click',$('.ct-asValBoxIcon.ct-asItemCal.btn.dropdown-toggle').datepicker());
                if (tObj.sd != '' && tObj.sd.indexOf('/')==-1) {
                    var d=new Date(tObj.sd);
                    tObj.sd=d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
                    $("#startDate").attr('disabled', 'disabled');
                }
                $("#startDate").val(tObj.sd);

            } else if (tk == 'ed') {
                v.append('span').attr('class', 'ct-assignItem fl-left').html('End Date');
                $(".fl-right-assign").append("<img src='imgs/ic-datepicker.png' />").attr('alt', 'calIcon');
                w = v.append('div').attr('class', 'ct-assignItem btn-group dropdown fl-right-assign dateBoxEd');
                w.append('input').attr('class', 'datepicker').attr('id', 'endDate');
                $(".dateBoxEd").append("<img id='dateIconEndDate' class='dateIcon' src='imgs/ic-datepicker.png' />").attr('alt', 'calIcon');
                $('#endDate').datepicker({
                    format: "dd/mm/yyyy",
                    todayHighlight: true,
                    autoclose: true,
                    startDate: new Date()
                });
                $('#dateIconEndDate').click(function() {
                    $("#endDate").datepicker("show");
                });
                if (tObj.ed != '' && tObj.ed.indexOf('/')==-1) {
                    var d=new Date(tObj.ed);
                    tObj.ed=d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
                }
                f = w.append('ul').attr('class', 'ct-asValCalBox dropdown-menu'); //.on('click',$('.ct-asValBoxIcon.ct-asItemCal.btn.dropdown-toggle').datepicker());
                $("#endDate").val(tObj.ed);

            } else if (tk == "pg") {
                if (dNodes[pi].children) {
                    v.append('span').append('input').attr('type', 'checkbox').attr('class', 'pg-checkbox');
                    v.append('span').html(' Propagate');
                } else
                    $(v[0][0]).remove();
            } else if (tk == "cx") {
                if (dNodes[pi].parent) {
                    v.append('span').attr('class', 'ct-assignItem fl-left').html('Complexity');
                    v.append('span').attr('id', 'ct-cxval').attr('nType', t).attr('idx', pi).text('Not Set');
                    v.append('span').attr('id', 'ct-compbox');
                    $("#ct-compbox").append('<i class="fa fa-list" aria-hidden="true"></i>');
                    $("#ct-compbox").css('color', '#643693').css('margin-left', '30px');
                    var HTMLcontent = getHTMLdropdown(t);
                    $('#addObjContainer111').empty().append(HTMLcontent);
                    clist = tObj.cx;
                    if (!(clist == "undefined" || clist == undefined)) clist = clist.split(",");
                    else cscore = 0;
                    populateComplexityValues(pi);
                    $('#ct-compbox').click(function() {
                        showComplexityBox(t);
                    });
                    if (!(clist == "undefined" || clist == undefined || clist == "")) {
                        $('#ct-cxval').text(getComplexityLevel(t, parseInt(clist[0])));
                        $('#complexity-val').text('Complexity: ' + getComplexityLevel(t, parseInt(clist[0])));
                    } else {
                        $('#complexity-val').text('Complexity: Not Set');
                    }

                } else
                    $(v[0][0]).remove();
            }
        });

        function populateComplexityValues(pi) {
            if (clist == "undefined" || clist == undefined) return;
            $.each($(".addObj-row"), function(i) {
                $(this).find("select").val(clist[i + 1]);
            });
        }

        //var cSize=getElementDimm(c);
        // Removed assgin box overflow (Himanshu)
        var cSize = [268, 386];
        if (t == 'modules' || t == 'endtoend') cSize = [268, 452];
        //var cSize1=[270,386];
        var canvSize = getElementDimm(d3.select("#ct-mapSvg"));
        var split_char = ',';
        if (isIE) split_char = ' ';
        //Set position of assign box
        var l = p.attr('transform').slice(10, -1).split(split_char);
        l = [(parseFloat(l[0]) + 50) * cScale + cSpan[0], (parseFloat(l[1]) - 20) * cScale + cSpan[1]];
        if (canvSize[0] - l[0] < cSize[0]) l[0] = l[0] - cSize[0] - 60 * cScale;
        if (canvSize[1] - l[1] < cSize[1]) l[1] = canvSize[1] - cSize[1] - 10 * cScale;
        c.style('top', l[1] + 'px').style('left', l[0] + 'px');

        if (canvSize[1] - 25 < cSize[1]) {
            c.style('height', canvSize[1] - 25 + 'px').style('top', '0px').style('overflow', 'scroll');
        } else {
            c.style('height', 'auto');
        }
        if (l[1] < 0)
            l[1] = 0;
        else if (l[1] > canvSize[1] - cSize[1])
            l[1] = (canvSize[1] - cSize[1]) - 150;

        //condition to disable unassign task button
        setTimeout(function() {
            $('#ct-unassignButton a').addClass("disableButton");
            if (dNodes[pi].task != null && dNodes[pi].task != undefined) {
                $('#ct-unassignButton a').removeClass("disableButton");
            }
        }, 30);
        if (dNodes[pi].task && dNodes[pi].task._id) {
            var nodeClik = {};
            nodeClik._id = dNodes[pi].task._id;
            taskidArr.push(nodeClik);
        }
    };

    $scope.nodeUniversalClick = function(idx) {
        addInfo({
            type: dNodes[idx].type,
            attributes: {
                'Name': dNodes[idx].name,
                'Domain': $scope.domain,
                'Apptype':$scope.apptype
            }
        });
        activeNode = "#ct-node-" + idx;
        if ($scope.tab == 'tabCreate') nodeCtrlClick();
        else if ($scope.tab == 'mindmapEndtoEndModules') nodeCtrlClick();
        else if ($scope.tab == 'tabAssign') nodeClick();
    }

    function showComplexityBox(nType) {
        //Calculate complexity and then show
        $('#dialog-compBox').modal("show");
        cscore_tmp = cscore;
        $('.form-control.form-control-custom').change(function() {
            cscore_tmp = 0;
            $.each($(".addObj-row"), function(e) {
                var cs = 0,
                    cw = 0;
                cw = cx_weightage[$(this).find('.form-group-1').text().trim()] != undefined ? cx_weightage[$(this).find('.form-group-1').text().trim()] : 0;
                cs = cx_scale[$(this).find("select option:selected").val().trim()] != undefined ? cx_scale[$(this).find("select option:selected").val().trim()] : 0;
                cscore_tmp = cscore_tmp + (cs * cw);
            });
            $('#complexity-val').text('Complexity: ' + getComplexityLevel(nType, cscore_tmp));
        });
        //$('.modal-backdrop.in').remove();
    }

    $scope.submitComplexity = function() {
        var pi = $('#ct-cxval').attr('idx');
        var err = false;
        clist_tmp = [cscore_tmp];
        $(".addObj-row").find("select").removeClass('selectErrorBorder');

        $.each($(".addObj-row"), function() {
            if ($(this).find("select option:selected").val() == "Select Option") {
                $(this).find("select").attr("style", "border-bottom: 4px solid #d33c3c !important;").focus(); //.addClass('selectErrorBorder')
                err = "true";
            } else {
                clist_tmp.push($(this).find("select option:selected").val().trim());
            }
        })
        if (!err) {
            cscore = cscore_tmp;
            clist = clist_tmp;
            $('#dialog-compBox').modal("hide");
            $('#ct-cxval').text(getComplexityLevel($('#ct-cxval').attr('nType'), cscore));
        }
    }

    function getComplexityLevel(nType, csc) {
        if (nType == 'scenarios') {
            if (csc <= 20) {
                return 'Low';
            } else if (csc <= 30) {
                return 'Medium';
            } else {
                return 'High';
            }
        }
        if (nType == 'screens') {
            if (csc <= 20) {
                return 'Low';
            } else if (csc <= 30) {
                return 'Medium';
            } else {
                return 'High';
            }
        }
        if (nType == 'testcases') {
            if (csc <= 20) {
                return 'Low';
            } else if (csc <= 35) {
                return 'Medium';
            } else {
                return 'High';
            }
        } else return undefined;
    }

    function getHTMLdropdown(nType) {
        var tableHTML = '';
        var cTableDataS = {
            'Application Type': ['DW ETL (H)', 'Desktop (H)', 'Oracle (H)', 'SAP (H)', 'Mainframe Application (H)', 'Mobile Application - IOS (H)', 'Mobile Web - IOS (H)', 'Webservices - REST (M)', 'Mobile Web - Android (M)', 'Database Application (M)', 'Web Application (L)', 'Webservices - SOAP (L)', 'Mobile Application - Android (L)'],
            'Domain knowledge factor': ['Limited', 'Fair', 'Good'],
            'Requirement Complexity': ['H', 'M', 'L'],
            'Test Data Requirement/complexity': ['H', 'M', 'L'],
            'Test Management Tool being used': ['Yes', 'No']
        };
        var cTableDataSr = {
            'Multi-lingual support': ['1', '2 to 3', '>3'],
            '# of Objects': ['<11', '11-25', '>25']
        };

        var cTableDataT = {
            'Analytical & Logical Reasoning': ['Very Low', 'Low', 'Nominal', 'High', 'Very High'],
            'Team Capability': ['Very Low', 'Low', 'Nominal', 'High', 'Very High'],
            '# of steps': ['<15', '15-30', '>30'],
            '# of Verification Points': ['<3', '3-8', '>8'],
            'Multi-browser support': ['<1', '2-3', '>3'],
            'Re-usability/Re-#': ['NA', 'Reused', 'Rehashed'],
            'Database Check points': ['2', '3-8', '>8']
        };


        function selectHead(key) {
            return '<div class="row row-modal addObj-row"><div class="form-group form-group-1">' + key + ' </div><div class="form-group form-group-2"><select class="form-control form-control-custom">';
        }
        var selectFoot = '</select></div></div>';

        function buildSelect(optionList) {
            var olist = '<option selected disabled>Select Option</option>';
            optionList.forEach(function(e) {
                olist = olist + '<option value="' + e + '">' + e + '</option>';
            });
            return olist;

        }

        if (nType == 'scenarios') {
            Object.keys(cTableDataS).forEach(function(key) {
                var optlist = buildSelect(cTableDataS[key]);
                tableHTML = tableHTML + selectHead(key) + optlist + selectFoot;
            });
        } else if (nType == 'screens') {
            Object.keys(cTableDataSr).forEach(function(key) {
                var optlist = buildSelect(cTableDataSr[key]);
                tableHTML = tableHTML + selectHead(key) + optlist + selectFoot;
            });
        } else if (nType == 'testcases') {
            Object.keys(cTableDataT).forEach(function(key) {
                var optlist = buildSelect(cTableDataT[key]);
                tableHTML = tableHTML + selectHead(key) + optlist + selectFoot;
            });
        }
        return tableHTML;
    }





    function getNewPosition(node, pi, arr_co) {
        // Switch_layout functionality
        // **NOTE**
        //dNodes[pi].children are arranged in increasing
        // order of x/y disance depending on layout
        var layout_vertical = $scope.verticalLayout;
        if (dNodes[pi].children.length > 0) { // new node has siblings
            index = dNodes[pi].children.length - 1;
            if (layout_vertical)
                new_one = {
                    x: parseInt(dNodes[pi].children[index].x) + 100,
                    y: sections[node.type]
                }; // Go beside last sibling node
            else
                new_one = {
                    x: sections[node.type],
                    y: parseInt(dNodes[pi].children[index].y + 80)
                };
            node = getNonOverlappingPosition(node, arr_co, new_one);

        } else { //first kid of any node

            if (dNodes[pi].parent != null) { //if kid of scenario/testcase/screen
                arr = dNodes[pi].parent.children;
                index = dNodes[pi].parent.children.length - 1; //number of parents siblings - 1
                //new_one={x:parseInt(arr[index].x),y:parseInt(arr[index].y)+125};

                if (layout_vertical) {
                    new_one = {
                        x: parseInt(dNodes[pi].x),
                        y: parseInt(sections[node.type])
                    }; // go directly below parent
                } else {
                    new_one = {
                        x: parseInt(sections[node.type]),
                        y: parseInt(dNodes[pi].y)
                    }; // go directly below parent
                }
                node = getNonOverlappingPosition(node, arr_co, new_one);

            } else { //Module's kid
                //layout_change
                if (layout_vertical) {
                    node.x = parseInt(dNodes[pi].x);
                    node.y = parseInt(sections[node.type]);
                } else {
                    node.y = parseInt(dNodes[pi].y);
                    node.x = parseInt(sections[node.type]);
                }
            }

        }
        return node;
    }

    function getNonOverlappingPosition(node, arr_co, new_one) {
        var layout_vertical = $scope.verticalLayout;
        var dist = 0;
        dist = closestCord(arr_co, new_one);
        while (dist < 60) {
            if (layout_vertical) {
                new_one.x = new_one.x + 80;
            } else {
                new_one.y = new_one.y + 80;
            }
            dist = closestCord(arr_co, new_one);
        }
        node.x = new_one.x;
        node.y = new_one.y;
        return node;
    }

    function closestCord(arr_co, new_one) {
        var dmin = 1000;
        for (var i = 0; i < arr_co.length; i++) {
            var a = new_one.x - arr_co[i].x;
            var b = new_one.y - arr_co[i].y;
            var c = Math.sqrt(a * a + b * b);
            if (c < dmin)
                dmin = c;
        }
        return dmin;
    }

    $scope.createNode = function($event, obj) {
        //If module is in edit mode, then return do not add any node
        if ($event !== true && (d3.select('#ct-inpBox').attr('class') == "" || d3.select($event.target).classed('ct-ctrl-inactive'))) return;
        d3.select('#ct-inpBox').classed('no-disp', !0);
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        var pi = activeNode.split('-')[2];
        var pt = $scope.nodeDisplay[pi].type;
        if (pt == 'testcases') return;
        SaveCreateED('#ct-createAction', 1, 0);
        if (dNodes[pi]._children == null) {
            if (dNodes[pi].children == undefined) dNodes[pi]['children'] = [];
            var nNext = {
                'modules': ['Scenario', 1],
                'scenarios': ['Screen', 2],
                'screens': ['Testcase', 3]
            };
            var mapSvg = d3.select('#ct-mapSvg');
            var w = parseFloat(mapSvg.style('width'));
            var h = parseFloat(mapSvg.style('height'));
            //name:nNext[pt][0]+'_'+nCount[nNext[pt][1]]
            var arr_co = [];
            dNodes.forEach(function(d, i) {
                var objj = {
                    x: parseInt(d.x),
                    y: parseInt(d.y)
                };
                arr_co.push(objj);

            });
            // switch-layout feature
            if (obj) {
                var tempName = obj.name;
            } else {
                var tempName = nNext[pt][0] + '_' + nCount[nNext[pt][1]];
            }
            node = {
                id: uNix,
                childIndex: '',
                path: '',
                name: tempName,
                type: (nNext[pt][0]).toLowerCase() + 's',
                y: h * (0.15 * (1.34 + nNext[pt][1]) + Math.random() * 0.1),
                x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
                children: [],
                parent: dNodes[pi],
                state: 'created'
            };
            node = getNewPosition(node, pi, arr_co); //pi: active node ID
            var curNode = node;
            dNodes.push(node);
            $scope.nodeDisplay[node.id] = {
                'type': node.type,
                'transform': "translate(" + (node.x).toString() + "," + (node.y).toString() + ")",
                'opacity': !(node._id == null) ? 1 : 0.5,
                'title': node.name,
                'name': node.display_name || node.name,
                '_id':node._id || null
            };
            nCount[nNext[pt][1]]++;
            dNodes[pi].children.push(dNodes[uNix]);
            dNodes[uNix].childIndex = dNodes[pi].children.length;
            dNodes[uNix].cidxch = 'true'; // child index updated
            var currentNode = addNode(dNodes[uNix], !0, dNodes[pi]);
            if (currentNode != null) {
                childNode = currentNode;

                link = {
                    id: uLix,
                    source: dNodes[pi],
                    target: dNodes[uNix]
                };
                dLinks.push(link);
                addLink(uLix, dNodes[pi], dNodes[uNix]);
                uNix++;
                uLix++;

                //By default when a node is created it's name should be in ediatable mode
                CreateEditFlag = true;
                if (obj);
                else {
                    setTimeout(function() { $scope.editNode(true, node); }, 100);
                }
            }

        } else {
            openDialogMindmap('Error', 'Expand the node');
        }

    };

    //------Create Multiple Child Node-------//
    $scope.createMultipleNode = function() {
        $(".view-msg").empty();
        switch (d3.select(activeNode).attr('data-nodetype')) {
            case 'endtoend':
                $scope.addedntype = 'Scenario';
                break;
            case 'modules':
                $scope.addedntype = 'Scenario';
                break;
            case 'scenarios':
                $scope.addedntype = 'Screen';
                break;
            case 'screens':
                $scope.addedntype = 'Testcase';
                break;
        }
        $("#addObjContainer").empty();
        if (d3.select('.fa-hand-peace-o').classed('ct-ctrl-inactive')) return;
        $scope.errorMessage = "";
        $("#dialog-addObject").modal("show");
        nCount2= nCount.slice(); //taking the clone of nCount to avoid duplicate updation, issue 2405.
        //Add two nodes 
        $scope.addMoreNode();
        $scope.addMoreNode();
        $timeout(function() {
            $('.modal-backdrop.in').remove();
        }, 1000);
    }

    $scope.addMoreNode = function() {
        if ($('.row.row-modal.addObj-row').length < 10) {
            var nodeId = {
                'Scenario': 1,
                'Screen': 2,
                'Testcase': 3
            }
            var idxAddNode = 1 + $('.row.row-modal.addObj-row').length;
            $("#addObjContainer").append("<div class='row row-modal addObj-row'><form class='form-horizontal' role='form' onSubmit='return false;'><div class='col-sm-2 addNode-label'><label>" + idxAddNode + "</label></div><div class='col-sm-6'><input type='text' class='form-control form-control-custom' placeholder='Enter node name' maxlength='255' value=" + $scope.addedntype + "_"+ (nCount2[nodeId[$scope.addedntype]]++) + "></div><div class='col-sm-2 deleteAddObjRow'><img src='imgs/ic-delete.png' /></div></form></div>");
        } else {
            openDialogMindmap('Error', 'At a time only 10 nodes can be added');
        }
    };

    $scope.clearNodes = function() {
        $(".view-msg").empty();
        $("input").val('');
        $(".addObj-row").find("input").removeClass('inputErrorBorder')
        $(".addObj-row").find("select").removeClass('selectErrorBorder')
        $scope.errorMessage = "";
    }


    $(document).on("click", ".deleteAddObjRow", function() {
        $(this).parent().parent().remove();
        var tmpidx = 1;
        $('.addNode-label').each(function() {
            $(this).text(tmpidx);
            tmpidx = tmpidx + 1;
        });
    });

    $scope.createNodes = function($event) {
        if(!$event.originalEvent) return;
        blockUI('Validating names..');
        var nodeNames = [];
        $('.errBorder').removeClass('errBorder');
        $('input.form-control-custom').each(function() {
            nodeNames.push($.trim($(this).val()));
            if (!validNodeDetails($.trim($(this).val()))) {
                $(this).addClass('errBorder');
            }
        });
        if ($('.errBorder').length == 0) {
            console.log("NodeNames:", nodeNames);
            nodeNames.forEach(function(node, i) {
                $scope.createNode(true, {
                    name: node
                });
            });

            if (nodeNames.length == 0) {
                $("#dialog-addObject").modal("hide");
                openDialogMindmap("Failure", "No nodes to create");
            } else {
                $("#dialog-addObject").modal("hide");
                openDialogMindmap("Success", "Nodes created successfully!");
            }
        } else {
             $(".view-msg").text("Please provide a valid name!");
        }
        unblockUI();
    }

    //------End of Create Multiple Child Node-------//

    $scope.editNode = function($event, node) {
        // $scope.$apply(); // to load the newly added node
        if ($event !== true && d3.select($event.target).classed('ct-ctrl-inactive')) return;
        $('#ct-inpAct').removeClass('errorClass');
        d3.select('#ct-inpAct').classed('no-disp', !1);
        if (node == undefined) {
            childNode = null;
            var p = d3.select(activeNode);
        } else {
            var p = d3.select(childNode);
            activeNode = childNode;
        }
        var pi = p.attr('id').split('-')[2];
        var t = p.attr('data-nodetype');
        if(dNodes[pi]["taskexists"]!=null)
        {
            openDialogMindmap('Rename Error',"Unassign the task to rename");
            return;
        }
        var split_char = ',';
        if (isIE) split_char = ' ';
        var l = p.attr('transform').slice(10, -1).split(split_char);
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        if (p && dNodes[p.attr('id').split('-')[2]].taskexists) {
            var msg = 'Unassign the task to rename';
            if (t == 'screens') {
                msg = 'Unassign the task to rename. And unassign the corresponding testcases tasks';
            }
            openDialogMindmap('Rename Error', msg);
            return;
        }
        var name = '';
        //By default when a node is created it's name should be in ediatable mode

        name = dNodes[pi].name;
        //name=p.text();
        l = [(parseFloat(l[0]) - 20) * cScale + cSpan[0], (parseFloat(l[1]) + 42) * cScale + cSpan[1]];
        // If editing right after the node is added and node goes beyond the screen size

        cSize = getElementDimm(d3.select("#ct-mapSvg"));
        if (CreateEditFlag == true && l[1] > cSize[1]) {
            CreateEditFlag = false;
            cSpanX = cSpan[0];
            cSpanY = cSpan[1];
            var temp = l[1];
            while (temp > cSize[1]) {
                temp = temp / 2;
                cSpanY = cSpanY - temp;
            }

            zoom.translate([cSpanX, cSpanY]);
            zoom.event(d3.select('#ct-mindMap'));
            //d3.select('#ct-mindMap').attr('transform', "translate(" + cSpanX + "," + cSpanY + ")scale(" + cScale + ")");
            //cSpan[0]=cSpan[0]-l[0]/2 //after edit mindmap doesn't move to orignal position
            l = p.attr('transform').slice(10, -1).split(split_char);
            l = [(parseFloat(l[0]) - 20) * cScale + cSpanX, (parseFloat(l[1]) + 42) * cScale + cSpanY];
        }

        // If created node is beyond screen size on horizontal side
        if (CreateEditFlag == true && l[0] > cSize[0]) {
            CreateEditFlag = false;
            cSpanX = cSpan[0];
            cSpanY = cSpan[1];
            var temp = l[0];
            while (temp > cSize[0]) {
                temp = temp / 2;
                cSpanX = cSpanX - temp;
            }
            zoom.translate([cSpanX, cSpanY]);
            zoom.event(d3.select('#ct-mindMap'));
            //d3.select('#ct-mindMap').attr('transform', "translate(" + cSpanX + "," + cSpanY + ")scale(" + cScale + ")");
            //cSpan[0]=cSpan[0]-l[0]/2 //after edit mindmap doesn't move to orignal position
            l = p.attr('transform').slice(10, -1).split(split_char);
            l = [(parseFloat(l[0]) - 20) * cScale + cSpanX, (parseFloat(l[1]) + 42) * cScale + cSpanY];
        }

        d3.select('#ct-inpBox').style('top', l[1] + 'px').style('left', l[0] + 'px').classed('no-disp', !1);
        d3.select('#ct-inpPredict').property('value', '');
        d3.select('#ct-inpAct').attr('data-nodeid', null).property('value', name).node().focus();
        d3.select('#ct-inpSugg').classed('no-disp', !0);
    };

    function checkparenttask(parenttempnode,parent_flag)
    {
       
        if (parent_flag) return parent_flag;
        
        if(parenttempnode!=null)
        {
            if (parenttempnode.taskexists!=null)
            {
                parent_flag=true;
                
            }
            parenttempnode=parenttempnode.parent || null;
            parent_flag=checkparenttask(parenttempnode,parent_flag);
            
        }
        return parent_flag;
    }

    function checkchildrentask(d,children_flag)
    {
        if(children_flag) return children_flag;
        if (d.taskexists != null) {
        
            children_flag=true;
            return children_flag;
            
        }
        if (d.children) d.children.forEach(function(e) {
            children_flag=checkchildrentask(e, children_flag);
        });
        return children_flag;
    }

    $scope.deleteNode = function($event) {
        //If module is in edit mode, then return do not add any node

        if (d3.select('#ct-inpBox').attr('class') == "") return;
        if ($event !== true && d3.select($event.target).classed('ct-ctrl-inactive')) return;
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        var s = d3.select(activeNode);
        SaveCreateED('#ct-createAction', 1, 0);
        //513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
        var t = s.attr('data-nodetype');
        if (t == 'modules') return;
        var sid = s.attr('id').split('-')[2];
        var p = dNodes[sid].parent;
        // If this node has an existing task then cannot allow to delte the node.
        if(dNodes[sid]['taskexists']!=null)
        {
            openDialogMindmap('Error', "Cannot delete node if task is assigned. Please unassign task first.");
            return; 
        }

        // If any of the parent node has a task assigned to it cannot delete the node.
        var parenttempnode=dNodes[sid];
        var flag=checkparenttask(parenttempnode,false);
        if(flag){
            openDialogMindmap('Error', "Cannot delete node if parent task is assigned. Please unassign task first.");
            return;
        } 

        var flag_error=checkchildrentask(dNodes[sid],false);
        if(flag_error)
        {
            openDialogMindmap('Error', "Cannot delete node if children task is assigned. Please unassign task first.");
            return;
        }
        
        recurseDelChild(dNodes[sid], $scope.tab);

        for (j = dLinks.length - 1; j >= 0; j--) {
            if (dLinks[j].target.id == sid) {
                // d3.select('#ct-link-' + dLinks[j].id).remove();
                dLinks[j].deleted = !0;
                delete $scope.linkDisplay['link-' + dLinks[j].source.id + '-' + dLinks[j].target.id];
                break;
            }
        }
        p.children.some(function(d, i) {
            if (d.id == sid) {

                p.children.splice(i, 1);
                return !0;
            }
            return !1;
        });
    };

    function deleteTestCases(pi) {
        if (dNodes[pi].children) {
            dNodes[pi].children.forEach(function(d, i) {
                d.parent = null;
                d.children = null;
                d.task = null;
                d3.select('#ct-node-' + d.id).remove();
                deletednode_info.push(d);
                if (d._id) {
                    deletednode.push([d._id,d.type]);
                    delete $scope.nodeDisplay[d.id];
                    dNodes[d.id].state = 'deleted';
                }
                var temp = dLinks;
                for (j = temp.length - 1; j >= 0; j--) {
                    if (temp[j].target.id == d.id) {
                        // d3.select('#ct-link-' + temp[j].id).remove();
                        delete $scope.linkDisplay['link-' + temp[j].source.id + '-' + temp[j].target.id];
                        temp[j].deleted = !0;
                    }
                }
                //dNodes.splice(i, 1);                   
            });
            dNodes[pi].children = [];
        }
        if (reuseDict[pi].length > 0) {
            reuseDict[pi].forEach(function(idx, i) {
                var dn = dNodes[idx];
                if (dn.children) {
                    dn.children.forEach(function(d, i) {
                        d.parent = null;
                        d.children = null;
                        d.task = null;
                        d3.select('#ct-node-' + d.id).remove();
                        deletednode_info.push(d);
                        if (d.oid != undefined && d.oid != '') {
                            deletednode.push([d._id,d.type]);
                            delete $scope.nodeDisplay[d.id];
                            dNodes[d.id].state = 'deleted';
                        }
                        var temp = dLinks;
                        for (j = temp.length - 1; j >= 0; j--) {
                            if (temp[j].target.id == d.id) {
                                // d3.select('#ct-link-' + temp[j].id).remove();
                                delete $scope.linkDisplay['link-' + temp[j].source.id + '-' + temp[j].target.id];
                                temp[j].deleted = !0;
                            }
                        }
                        //dNodes.splice(i, 1);                   
                    });
                    dNodes[idx].children = [];
                }
            });
        }
    }

    function recurseDelChild(d, tab) {
        if (d.children) d.children.forEach(function(e) {
            recurseDelChild(e, tab);
        });
        if(d.state=="deleted")
        {
            return;
        }
        // d3.select('#ct-node-' + d.id).remove();
        if(d._id)
        {  
            var parentid=dNodes[d.parent.id]._id;
            deletednode.push([d._id,d.type,parentid]);
        }
        d.parent = null;
        d.children = null;
        d.task = null;
        delete $scope.nodeDisplay[d.id];
        deletednode_info.push(d);
        dNodes[d.id].state = 'deleted';
        var temp = dLinks;
        if (tab == 'mindmapEndtoEndModules') {
            temp = dLinks;
        }
        for (j = temp.length - 1; j >= 0; j--) {
            if (temp[j].source.id == d.id) {
                // d3.select('#ct-link-' + temp[j].id).remove();
                delete $scope.linkDisplay['link-' + temp[j].source.id + '-' + temp[j].target.id];
                temp[j].deleted = !0;
            }
        }

    };

    function moveNode(e) {
        //#886 Unable to rearrange nodes in e2e
        d3.select('.ct-movable').attr('transform', "translate(" + parseFloat((e.pageX - $('#ct-mapSvg').offset().left - cSpan[0]) / cScale + 2) + "," + parseFloat((e.pageY - $('#ct-mapSvg').offset().top - cSpan[1]) / cScale - 20) + ")");
    };

    $scope.moveNodeBegin = function(idx) {
        $scope.moving = true;
        //Issue #763 is fixed,Mindmap - If node is moved in edit mode ,then Textbox is not been moved with the Node.
        d3.select('#ct-inpAct').classed('no-disp', !0);
        //To check whether browser Is IE or not issue #415
        temp = {
            s: [],
            t: ""
        };
        dLinks.forEach(function(d, i) {
            if (d.source.id == idx) {
                temp.s.push(d.id);
                delete $scope.linkDisplay['link-' + d.source.id + '-' + d.target.id];
            } else if (d.target.id == idx) {
                temp.t = d.id;
                delete $scope.linkDisplay['link-' + d.source.id + '-' + d.target.id];
            }
        });
        d3.select('#ct-node-' + idx).classed('ct-movable', !0);
        $(d3.select('#ct-mapSvg').node()).on('mousemove.nodemove', moveNode);

    };

    $scope.moveNodeEnd = function(idx) {
        $scope.moving = false;
        d3.select('#ct-mapSvg').on('mousemove.nodemove', null);
        var isIE = /*@cc_on!@*/ false || !!document.documentMode;
        var p = d3.select("#ct-node-" + idx);


        var pi = idx;
        var l = p.attr('transform').slice(10, -1).split(split_char);
        dNodes[pi].x = parseFloat(l[0]);
        dNodes[pi].y = parseFloat(l[1]);
        addLink(temp.t, dLinks[temp.t].source, dLinks[temp.t].target);
        var v = (dNodes[pi].children) ? !1 : !0;

        //Issue fixed #374: 'Mindmap - Blank nodes are retained if we delete the connected nodes'
        temp.s.forEach(function(d) {
            if (deletednode_info.indexOf(dLinks[d].target) == -1) {
                addLink(d, dLinks[d].source, dLinks[d].target);
                d3.select('#ct-link-' + d).classed('no-disp', v);
            }

        });
        p.classed('ct-movable', !1);
    };

    $scope.toggleNode = function(id) {
        var p = d3.select('#ct-node-' + id);
        var pi = id;
        if (dNodes[pi].children && dNodes[pi].children.length > 0) {
            p.select('.ct-cRight').classed('ct-nodeBubble', !1);
            dNodes[pi]._children = dNodes[pi].children;
            dNodes[pi].children = null;
            recurseTogChild(dNodes[pi], !0);
        } else if (dNodes[pi]._children && dNodes[pi]._children.length > 0) {
            p.select('.ct-cRight').classed('ct-nodeBubble', !0);
            dNodes[pi].children = dNodes[pi]._children;
            dNodes[pi]._children = null;
            recurseTogChild(dNodes[pi], !1);
        }
    };

    function recurseTogChild(d, v) {
        if (d.children) d.children.forEach(function(e) {
            recurseTogChild(e, v);
            d3.select('#ct-node-' + e.id).classed('no-disp', v);
            for (j = dLinks.length - 1; j >= 0; j--) {
                if (dLinks[j].source.id == d.id) {
                    d3.select('#link-' + dLinks[j].source.id + '-' + dLinks[j].target.id).classed('no-disp', v);
                }
            }
        });
        else if (d._children) d._children.forEach(function(e) {
            recurseTogChild(e, !0);
            d3.select('#ct-node-' + e.id).classed('no-disp', !0);
            for (j = dLinks.length - 1; j >= 0; j--) {
                if (dLinks[j].source.id == d.id) {
                    d3.select('#link-' + dLinks[j].source.id + '-' + dLinks[j].target.id).classed('no-disp', !0);
                }
            }
        });
    };

    function validNodeDetails(value) {
        $('#ct-inpAct').removeClass('errorClass');
        var nName, flag = !0;
        nName = value;
        var regex = /^[a-zA-Z0-9_]*$/;;
        if (nName.length == 0 || nName.length > 255 || nName.indexOf('_') < 0 || !(regex.test(nName)) || nName== 'Screen_0' || nName == 'Scenario_0' || nName == 'Testcase_0') {
            $('#ct-inpAct').addClass('errorClass');
            flag = !1;
        }
        return flag;
    };

    $scope.txtBoxChange = function() {
        reuseDict = getReuseDetails();
        var inp = d3.select('#ct-inpAct');
        var val = inp.property('value');
        if (val == 'Screen_0' || val == 'Scenario_0' || val == 'Testcase_0') {
            $('#ct-inpAct').addClass('errorClass');
            return;
        }
        if (!validNodeDetails(val)) return;
        if (childNode != null) {
            var p = d3.select(childNode);
        } else {
            var p = d3.select(activeNode);
        }
        var pi = p.attr('id').split('-')[2];
        var pt = p.select('.ct-nodeLabel');
        var t = p.attr('data-nodetype');
        if (!d3.select('#ct-inpSugg').classed('no-disp') && temp && temp.length > 0) return;
        if (dNodes[pi]._id) {
            dNodes[pi].original_name = pt.attr('title');
            dNodes[pi].rnm = !0;
        }
        if (t == 'screens' && scrList[inp.attr('data-nodeid')] !== undefined) {
            dNodes[pi].name = scrList[inp.attr('data-nodeid')].name;
        } else if (t == 'testcases' && tcList[inp.attr('data-nodeid')] !== undefined) {
            dNodes[pi].name = tcList[inp.attr('data-nodeid')].name;
        } else {
            dNodes[pi].name = val;
        }
        if (dNodes[pi].original_name != val) {
            d3.select('#ct-node-' + pi + '>image').attr('style', 'opacity:0.6')
        }
        d3.select('#ct-inpBox').classed('no-disp', !0);
        var tmp = dNodes[pi].name;
        if (tmp.length > 15) var tmp = tmp.slice(0, 15) + "...";
        pt.text(tmp);
        zoom.event(d3.select('#ct-mapSvg'));

        function replicateName(pi) {
            //replicate task to reused node
            if (reuseDict[pi].length > 0) {
                reuseDict[pi].forEach(function(e, i) {
                    dNodes[e].name = dNodes[pi].name;
                    dNodes[e].original_name = dNodes[pi].original_name;
                    dNodes[e].rnm = dNodes[pi].rnm;
                    $('#ct-node-' + e + ' > text').text(tmp);
                });
            }
        }
        replicateName(pi);
    };

    $('#deleteTestcase').click(function() {
        pi = $('#renamingConfirmationPopup').attr('node');
        deleteTestCases(pi);
    });
    $('#undoChanges').click(function() {
        pi = $('#renamingConfirmationPopup').attr('node');
        dNodes[pi].name = dNodes[pi].original_name;
        $('#ct-node-' + pi + ' > text').text(dNodes[pi].original_name);
        if (reuseDict && reuseDict[pi].length > 0) {
            reuseDict[pi].forEach(function(e, i) {
                dNodes[e].name = dNodes[e].original_name;
                $('#ct-node-' + e + ' > text').text(dNodes[e].original_name);
            });
        }
    });

    $('#undoChanges2').click(function() {
        pi = $('#renamingConfirmationPopup').attr('node');
        dNodes[pi].name = dNodes[pi].original_name;
        $('#ct-node-' + pi + ' > text').text(dNodes[pi].original_name);
        if (reuseDict && reuseDict[pi].length > 0) {
            reuseDict[pi].forEach(function(e, i) {
                dNodes[e].name = dNodes[e].original_name;
                $('#ct-node-' + e + ' > text').text(dNodes[e].original_name);
            });
        }
    });

    $scope.txtBoxKeyup = function(keyCode) {
        temp = [];
        temp1=[];
        var t, list;
        $scope.inpText = angular.element("#ct-inpBox").scope().inpText;
        //To fix issue with suggestions
        var p = d3.select(activeNode);
        inp = d3.select('#ct-inpAct');
        var val = inp.property('value');
        if(!validNodeDetails(val)) { d3.select('#ct-inpSugg').selectAll('li').remove(); return; }
        //var p=d3.select(activeNode);
        var iul = d3.select('#ct-inpSugg');
        if (keyCode == 13) {
            $scope.txtBoxChange();
            return;
        }
        if ($scope.inpText.indexOf('_') == -1) {
            iul.classed('no-disp', !0);
            var isIE = /*@cc_on!@*/ false || !!document.documentMode;
            d3.select('#ct-inpPredict').property('value', '');
            return;
        }
        t = p.attr('data-nodetype');
        //if(t == 'scenarios') list = scenarioList;
        if (t == 'screens') list = scrList;
        else if (t == 'testcases') list = tcList;
        else return;
        iul.selectAll('li').remove();
        if(t=='testcases'){
            links=Object.keys($scope.linkDisplay)
            links.forEach(function(d, i){
                if(d.split('-')[2] === p[0][0].id.split("-")[2]) {
                  index=d.split('-')[1];
                }
            },[]);
            screenid=$scope.nodeDisplay[index]._id
            list.forEach(function(d, i){
                if(screenid === d.screenid) {
                  temp1.push(d);
                }
            },[]);
            list=temp1;
            }
        var list = list.reduce((unique, o) => {
            if(!unique.some(obj => obj.name === o.name)) {
              unique.push(o);
            }
            return unique;
        },[]);
        
        list.forEach(function(d, i) {
            var s = d.name.toLowerCase();
            if (s.lastIndexOf($scope.inpText.toLowerCase(), 0) === 0) {
                temp.push(i);
                if (d.name.length > 23) s = d.name.slice(0, 23) + "...";
                else s = d.name;
                iul.append('li').attr('class', 'divider');
                iul.append('li').append('a').attr('data-nodeid', i).attr('data-nodename', d.name).attr('title', d.name).html(s).on('click', function() {
                    var k = d3.select('#ct-inpAct');
                    d3.select('#ct-inpSugg').classed('no-disp', !0);
                    d3.select('#ct-inpPredict').property('value', '');
                    d3.select('#ct-inpAct').attr('data-nodeid', k.attr('data-nodeid')).property('value', d.name).node().focus();
                });
            }
        });
        if (temp.length > 0 && $scope.inpText != list[temp[0]].name) {
            if (keyCode == 39) {
                iul.classed('no-disp', !0);
                d3.select('#ct-inpPredict').property('value', '');
                d3.select('#ct-inpAct').attr('data-nodeid', temp[0]).property('value', list[temp[0]].name);
            } else {
                iul.select('li.divider').remove();
                iul.classed('no-disp', !1);
                d3.select('#ct-inpAct').attr('data-nodeid', null);
                d3.select('#ct-inpPredict').property('value', list[temp[0]].name);
            }
        } else {
            iul.classed('no-disp', !0);
            d3.select('#ct-inpAct').attr('data-nodeid', null);
            d3.select('#ct-inpPredict').property('value', '');
        }
    };

    function treeIterator(c, d, e) {
        if (c != undefined) {
            c.push({
                projectID: d.projectID,
                id: d.id,
                childIndex: d.childIndex,
                _id: (d._id) ? d._id : null,
                oid: (d.oid) ? d.oid : null,
                name: d.name,
                type: d.type,
                pid: (d.parent) ? d.parent.id : null,
                pid_c: (d.parent) ? d.parent.id_c : null,
                task: (d.task) ? d.task : null,
                renamed: (d.rnm) ? d.rnm : !1,
                orig_name: (d.original_name) ? d.original_name : null,
                taskexists: (d.taskexists) ? d.taskexists : null,
                state: (d.state) ? d.state : "created",
                cidxch: (d.cidxch) ? d.cidxch : null // childindex changed
            });
            if (d.type == 'testcases') c[c.length - 1].screenname = d.parent.name; // **Impact check**
        }
        if (d.children && d.children.length > 0) d.children.forEach(function(t) {
            e = treeIterator(c, t, e);
        });
        else if (d._children && d._children.length > 0) d._children.forEach(function(t) {
            e = treeIterator(c, t, e);
        });
        else if (d.type != 'testcases') return !0;
        return e;
    };

    function treeIterator_W(c, d, e) {
        c.push({
            projectID: d.projectID,
            id: d.id,
            childIndex: d.childIndex,
            _id: (d._id) ? d._id : null,
            oid: (d.oid) ? d.oid : null,
            name: d.name,
            type: d.type,
            pid: (d.parent) ? d.parent.id : null,
            pid_c: (d.parent) ? d.parent.id_c : null,
            task: (d.task) ? d.task : null,
            renamed: (d.rnm) ? d.rnm : !1,
            orig_name: (d.original_name) ? d.original_name : null,
            state : (d.state) ? d.state : "created"
        });
        if (d.children && d.children.length > 0) d.children.forEach(function(t) {
            e = treeIterator_W(c, t, e);
        });
        else if (d._children && d._children.length > 0) d._children.forEach(function(t) {
            e = treeIterator(c, t, e);
        });
        //else if(d.type!='testcases') return !0;
        return e;
    };

    $scope.actionEvent = function($event) {
        $("#searchModule-assign").val("");
        $("#pasteImg1").removeClass("active-map");
        e = $event;
        var selectedNodeTitle = $('.nodeBoxSelected').attr('title');
        if(isIE){
            if ($(e.target.parentNode).hasClass('disableButton') || $(e.target.parentNode).hasClass('no-access')) return;
                var selectedTab = window.localStorage['tabMindMap'];
                var s = d3.select(e.target.parentNode);
        }else{
            if ($(e.target.parentElement).hasClass('disableButton') || $(e.target.parentElement).hasClass('no-access')) return;
                var selectedTab = window.localStorage['tabMindMap'];
                var s = d3.select(e.target.parentElement);
        }
        var selectedTab = window.localStorage['tabMindMap'];
        var s = d3.select(e.target.parentNode);
        var cur_module = null;
        var error = !1,
            mapData = [],
            flag = 0,
            alertMsg;
        var temp_data = [];
        dNodes.forEach(function(e, i) {
            if (i == 0) return;
            temp_data[i] = {
                idx: i,
                x: e.x,
                y: e.y,
                type: e.type
            };
        });

        var layout_vertical = $scope.verticalLayout;
        if (layout_vertical) {

            temp_data.sort(function(a, b) {
                return a.x - b.x;
            });
        } else {

            temp_data.sort(function(a, b) {
                return a.y - b.y;
            });
        }

        var counter = {};
        temp_data.forEach(function(e, i) {
            var key_1=undefined;
            if(dNodes[e.idx].parent==null) return;
            // key_1=dNodes[e.idx].parent._id;
            // if(key_1==undefined){
            key_1= dNodes[e.idx].parent.id;
            // }
            var key=e.type+'_'+key_1;
            if(counter[key]==undefined)  counter[key]=1;
            if (dNodes[e.idx].childIndex != counter[key]) {
                dNodes[e.idx].childIndex = counter[key];
                dNodes[e.idx].cidxch = 'true'; // child index updated
            }
            counter[key] = counter[key] + 1;
        })
        if (s.attr('id') == 'ct-saveAction' || $event.target.getAttribute('id')=='ct-saveAction') {
            blockUI('Saving Flow! Please wait...');
        }

        error = treeIterator(mapData, dNodes[0], error);
        if (dNodes[0].type == 'endtoend') {
            cur_module = 'end_to_end';
            error = false;
        } else {
            //Part of Issue 1685
            cur_module = $scope.tab;
        }

        if (s.attr('id') == 'ct-saveAction'  || $event.target.getAttribute('id')=='ct-saveAction') {
            // blockUI('Saving Flow! Please wait...');
            flag = 10;
            if ($scope.tab == 'tabAssign') flag = 30;
            d3.select('#ct-inpBox').classed('no-disp', !0);
            saveFlag = true;
            //$('#ct-createAction').removeClass('disableButton');
            SaveCreateED('#ct-createAction', 0, 0);
        }
        if (flag == 0) return;
        if (s.classed('no-access')) return;
        //s.classed('no-access', !0);
        var userInfo = JSON.parse(window.localStorage['_UI']);
        var username = userInfo.username;
        var assignedTo = assignedObj;

        var currTime = new Date();
        var utcTime = currTime.getTime();

        if ($('.project-list').val() == null) {
            unblockUI();
            openDialogMindmap('Error', 'No projects is assigned to User');
            return !1;
        }
        var from_v = to_v = 0;
        if ($('.version-list').length != 0)
            from_v = to_v = $('.version-list').val();

        mindmapServices.saveData(versioning_enabled, assignedTo, flag, from_v, to_v, cur_module, mapData, deletednode, unassignTask,
            $('.project-list').val(), $('.cycle-list').val(), selectedTab, utcTime,$scope.createdthrough).then(function(result) {
            deletednode = [],
            deletednode_info = [];
            unassignTask =[];
            $scope.createdthrough="";
            if (result == "Invalid Session") {
                return $rootScope.redirectPage();
            } else if(result.rows=='fail'|| result=='fail') {
                unblockUI();
                if (!result.error) result.error="Error while Saving"
                openDialogMindmap("Error", result.error);
                flag=-1;
                // openDialogMindmap("Error", "Failed to save structure");
                return;
            }
            unblockUI();
            var moduleid = result;
            setModuleBoxHeight();
            if (selectedTab == 'tabCreate') populateDynamicInputList();
            clearSvg();
            // treeBuilder(res);
            unassignTask = [];

            if (selectedTab == 'tabAssign') {
                openDialogMindmap("Success", "Tasks saved successfully");
            } else {
                if(!$scope.pdmode){
                    openDialogMindmap("Success", "Data saved successfully");
                    SaveCreateED('#ct-saveAction', 0, 0);
                }
                else{
                    $timeout(function() {
                        angular.element('#ct-createAction').triggerHandler('click');
						openDialogMindmap("Success", "Data saved successfully");
                    }, 100);                            
                }
            }
            var vn = '';
            if ($('.version-list').length != 0)
                from_v = to_v = $('.version-list').val()
            mindmapServices.getModules(versioning_enabled, window.localStorage['tabMindMap'], $scope.projectNameO, parseFloat(from_v), $('.cycle-list').val(),null,moduleid).then(function(result) {
                if (result == "Invalid Session") {
                    return $rootScope.redirectPage();
                }
                unassignTask = [];						
                currMap=result;
                excelMap = JSON.parse(JSON.stringify(currMap));
                loadedmodule = excelMap.name;
                $('div[title=' + loadedmodule + ']').addClass('nodeBoxSelected');
                if ($scope.tab == 'tabCreate')
                    populateDynamicInputList();
                setModuleBoxHeight();
                clearSvg();
                treeBuilder(currMap);
                unblockUI();
                IncompleteFlowFlag = false;
                var errTemp = false;
                if (dNodes[0].type != 'endtoend') {
                    errTemp = treeIterator(undefined, dNodes[0], false);
                    $scope.modType = 'generic';
                }
                if (errTemp) {
                    IncompleteFlowFlag = true;
                }
            }, function(error) {
                console.log(error);
            });
            blockUI('Loading...');
            mindmapServices.getModules(versioning_enabled, window.localStorage['tabMindMap'], $scope.projectNameO, parseFloat(from_v), $('.cycle-list').val(),null,null).then(function(result) {
            if (result == "Invalid Session") {
                return $rootScope.redirectPage();
            }
            $scope.allMMaps = result;
            unassignTask=[];
            setModuleBoxHeight();
            unblockUI();
            if (selectedTab == 'tabCreate')
                populateDynamicInputList();
            }, function(error) {
                console.log(error);
            });
        }, function(error) {
            unblockUI();
            console.log(error);
            //$('#ct-createAction').addClass('disableButton')
            SaveCreateED('#ct-createAction', 1, 0);
            if (error == 'DuplicateModules') {
                openDialogMindmap('Save error', 'Module names cannot be duplicate');
            } else {
                openDialogMindmap('Save error', 'Failed to save data');
            }
        });
    };

    $scope.actionEvent_W = function($event) {
        if(isIE){
            if ($($event.target.parentNode).hasClass('disableButton') || $($event.target.parentNode).hasClass('no-access')) return;
                var selectedNodeTitle = $('.nodeBoxSelected').attr('title');
                var s = d3.select($event.target.parentNode);
        }else{
            if ($($event.target.parentElement).hasClass('disableButton') || $($event.target.parentElement).hasClass('no-access')) return;
                var selectedNodeTitle = $('.nodeBoxSelected').attr('title');
                var s = d3.select($event.target.parentElement);
        }
        var error = !1,
            mapData = [],
            flag = 0,
            alertMsg;
        var temp_data = [];
        dNodes.forEach(function(event, i) {
            if (i == 0) return;
            temp_data[i] = {
                idx: i,
                x: event.x,
                y: event.y,
                type: event.type
            };
        });

        var layout_vertical = $scope.verticalLayout;
        if (layout_vertical) {

            temp_data.sort(function(a, b) {
                return a.x - b.x;
            });
        } else {

            temp_data.sort(function(a, b) {
                return a.y - b.y;
            });
        }


        var counter = {
            'scenarios': 1
        };
        temp_data.forEach(function(e, i) {
            if (dNodes[e.idx].childIndex != counter[e.type]) {
                dNodes[e.idx].childIndex = counter[e.type];
                dNodes[e.idx].cidxch = 'true'; // child index updated
            }
            counter[e.type] = counter[e.type] + 1;
        })
        error = treeIterator_W(mapData, dNodes[0], error);

        if (s.attr('id') == 'ct-saveAction') {
            if (error) {
                openDialogMindmap("Error", "Mindmap flow must be complete! End to End Module -> Scenarios");
                return;
            }
            blockUI('Saving flow! Please wait...');
            flag = 10;
            d3.select('#ct-inpBox').classed('no-disp', !0);
            // blockUI('Creating structure! Please wait...');
            d3.select('#ct-inpBox').classed('no-disp', !0);
            if (flag == 0) return;
            if (s.classed('no-access')) return;
            //s.classed('no-access', !0);
            var userInfo = JSON.parse(window.localStorage['_UI']);
            var username = userInfo.username;
            if ($('#selectProjectEtem').val() == null) {
                unblockUI();
                openDialogMindmap('Error', 'No projects is assigned to User');
                return !1;
            }
            var cur_project = $('#selectProjectEtem').val();
            // var selectedProject = '';

            mapData.forEach(function(d) {
                if (d.type == 'endtoend') {
                    selectedProject = d.projectID;
                    return;
                }
            });

            if (selectedProject != cur_project) {
                unblockUI();
                openDialogMindmap('Error', "Module belongs to project: '" + $("#selectProjectEtem option[value='" + selectedProject + "']").text() + "' Please go back to the same project and Save");
                return;
            }
            var from_v = to_v = '';
            mindmapServices.saveEndtoEndData(username, flag, from_v, to_v, 'endToend', mapData, deletednode, unassignTask, selectedProject, $('#ct-assignRel').val(), $('#ct-assignCyc').val()).then(function(result) {
                deletednode = [],
                deletednode_info = [];

                if (result == "Invalid Session") {
                    return $rootScope.redirectPage();
                } else if(result.rows=='fail') {
                    unblockUI();
                    openDialogMindmap("Error", result.error);
                    flag=-1;
                }
                unblockUI();
                var res = result;
                if (flag == 10) {
                    unblockUI();
                    openDialogMindmap("Success", "Data saved successfully");
                    clearSvg();
                    // fix for 1046:  "Create" does not work when we add scenarios from different projects
                    saveFlag_W = true;
                    //$('#ct-createAction_W').removeClass('disableButton').removeClass('no-access');
                    SaveCreateED('#ct-createAction', 0, 0);
                    //alert(window.localStorage['tabMindMap']);
                    mindmapServices.getModules(versioning_enabled, 'endToend', $scope.projectNameO, 0, $('.cycle-list').val(),null,res)
                        .then(function(result) {
                        if (result == "Invalid Session") {
                            return $rootScope.redirectPage();
                        }
                        initScroller();
                        unassignTask=[];
                        // setModuleBoxHeight_W();
                        currMap=result;
                        excelMap = JSON.parse(JSON.stringify(currMap));
                        loadedmodule = excelMap.name;
                        $('div[title=' + loadedmodule + ']').addClass('nodeBoxSelected');
                        if ($scope.tab == 'tabCreate')
                            populateDynamicInputList();
                        setModuleBoxHeight();
                        treeBuilder_W(currMap);
                        unblockUI();
                        IncompleteFlowFlag = false;
                        var errTemp = false;
                        if (dNodes[0].type != 'endtoend') {
                            errTemp = treeIterator(excelMap, dNodes[0], false);
                            $scope.modType = 'generic';
                        }
                        if (errTemp) {
                            IncompleteFlowFlag = true;
                        }
                    }, function(error) {
                        console.log(error);
                    });
                    mindmapServices.getModules(versioning_enabled, 'endToend', $scope.projectNameO, 0, $('.cycle-list').val(),null,null)
                    .then(function(result) {
                        if (result == "Invalid Session") {
                            return $rootScope.redirectPage();
                        }
                        var nodeBox = d3.select('#etemModuleContainer');
                        // $(nodeBox[0]).empty();
                        unassignTask=[];
                        $scope.allMMaps = allMaps_info = result;
                        $('span[title=' + selectedNodeTitle + ']').addClass('nodeBoxSelected');
                        initScroller();
                        setModuleBoxHeight_W();
                    }, function(error) {
                        console.log(error);
                    });
                }
            }, function(error) {
                unblockUI();
                if (error == 'DuplicateModules') {
                    openDialogMindmap('Save error', 'Module names cannot be duplicate');
                } else {
                    openDialogMindmap('Save error', 'Failed to save data');
                }
            })
        }
    };
    
    $scope.loadEndToEnd = function(mapid, type, name,modid) {
        if (type == 'endtoend') loadScenarios(modid);
        loadEndtoEndModule(name, mapid, type,modid);
    }

    function toggleExpand(e, tab) {
        if ($scope.allMMaps.length == 0 && $("#ct-" + tab + "Box").hasClass("ct-open") != true) return;
        var s = d3.select($(e.target).parent());
        var p = d3.select($(e.target).parent().parent());
        $(e.target).parent().toggleClass('ct-rev');
        $(e.target).parent().parent().toggleClass('ct-open');
        $(e.target).toggleClass("iconSpaceArrowTop");
        e.stopImmediatePropagation();
        if ($("#ct-" + tab + "Box").hasClass("ct-open") == true) {
            $("#ct-canvas").css("top", "5px");
            $(".ct-nodeBox .ct-node").css("width", "139px");
            $(".ct-nodeBox").css({
                "overflow": "auto",
                "width": "99%"
            })
            $(".iconSpaceArrow").attr("src", "imgs/ic-collapseup.png");
        } else {
            $(".iconSpaceArrow").attr("src", "imgs/ic-collapse.png");
            $("#ct-" + tab + "Box").css({
                "position": "",
                "top": ""
            });
            $("#ct-canvas").css("top", "");
            $(".ct-nodeBox .ct-node").css("width", "");
            $(".ct-nodeBox").css({
                "overflow": "",
                "width": ""
            })
        }
    };

    function clickHideElements(e) {
        if (d3.event.target!== this) { return; }
        d3.select('#ct-inpBox').classed('no-disp', !0);
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        d3.select('#ct-assignBox').classed('no-disp', !0);
    };

    function setModuleBoxHeight() {
        var lm = d3.select('.ct-moduleBoxOptional').classed('ct-open', !0);
        if ($scope.tab == 'tabCreate')
            var lm = d3.select('#ct-moduleBox').classed('ct-open', !0);
        var h1 = lm.style('height');
        lm.classed('ct-open', !1);
        if (h1 == lm.style('height')) lm.select('.ct-expand').classed('no-disp', !0);
        else lm.select('.ct-expand').classed('no-disp', !1);
    };

    function populateDynamicInputList() {
        mindmapServices.getScreens($('.project-list').val()).then(function(result) {
            if (result == "Invalid Session") {
                return $rootScope.redirectPage();
            } else {
                scrList = result.screenList;
                tcList = result.testCaseList;
            }
        })
    };

    //Function is tagged to every click on 'canvas' element to validate the names of nodes when created
    function callme() {
        if (Object.keys($scope.nodeDisplay).length > 0) return;
        if (childNode != null && (childNode.text() == 'Module_0' || childNode.text() == 'Screen_0' || childNode.text() == 'Scenario_0' || childNode.text() == 'Testcase_0')) {
            d3.select('#ct-inpBox').classed('no-disp', !1);
        }
        if (!$('#ct-inpBox').hasClass('no-disp')) {
            $scope.txtBoxChange();
        }
    }

    function treeBuilder(tree) { // Async
        var pidx = 0,
            levelCount = [1],
            cSize = getElementDimm(d3.select("#ct-mapSvg"));
        var typeNum = {
            'modules': 0,
            'endtoend': 0,
            'scenarios': 1,
            'screens': 2,
            'testcases': 3
        };

        function childCounter(l, s) {
            if (levelCount.length <= l) levelCount.push(0);
            if (s.children) {
                levelCount[l] += s.children.length;
                s.children.forEach(function(d) {
                    childCounter(l + 1, d);
                });
            }
        };
        childCounter(1, tree);
        var newHeight = d3.max(levelCount) * 90;
        var d3Tree = d3.layout.tree().size([newHeight * 2, cSize[0]]);
        if(tree.oid===undefined) d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
        else d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});

        d3Tree.sort(function(a, b) {
            return a.childIndex - b.childIndex;
        });

        dNodes = d3Tree.nodes(tree);
        dLinks=d3Tree.links(dNodes);

        dNodes.sort(function(a, b) {
            return a.childIndex - b.childIndex;
        });  


        // var reusedata = parseDataReuse(false);

        // Now call the service and assign reuse property to all other nodes
        var userInfo = JSON.parse(window.localStorage['_UI']);
        var user_id = userInfo.user_id;

            dNodes.forEach(function(d) {
                // switch-layout feature
                if ($scope.verticalLayout) {
                    d.y = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
                    sections[d.type] = d.y;
                } else {
                    d.y = d.x;
                    //Logic to change the layout and to reduce the length of the links
                    d.x = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
                    sections[d.type] = d.x;
                }
                // if (d.oid === undefined) d.oid = d.id;
                d.id = uNix++;
                addNode(d, !0, d.parent);
                $scope.nodeDisplay[d.id].task = false;
                if (d.task != null && $scope.tab != 'tabCreate') {
                    if (d.task.cycleid == $('.cycle-list').val()) {
                        $scope.nodeDisplay[d.id].task = true;
                        $scope.nodeDisplay[d.id].taskOpacity = 1;
                    }
                    if(d.type=="screens" || d.type=="testcases")
                    {
                        if (d.task.cycleid != $('.cycle-list').val()) {
                            $scope.nodeDisplay[d.id].task = true;
                            $scope.nodeDisplay[d.id].taskOpacity = 0.5;
                        }
                    }
                }
                //Enhancement : Part of Issue 1685 showing the task assigned icon little transperent to indicate that task originally do not belongs to this release and cycle but task exists in some other release and cycle
                else if (d.taskexists && $scope.tab != 'tabCreate' && d.type !="modules" && d.type !="scenarios") {
                    d3.select('#ct-node-' + d.id).append('image').attr('class', 'ct-nodeTask').attr('width', '21px').attr('height', '21px').attr('xlink:href', 'imgs/node-task-assigned.png').attr('style', 'opacity:0.5').attr('x', 29).attr('y', -10);
                    $scope.nodeDisplay[d.id].task = true;
                    $scope.nodeDisplay[d.id].taskOpacity = 0.5;
                }
            });
            dLinks = d3Tree.links(dNodes);
            dLinks.forEach(function(d) {
                d.id = uLix++;
                addLink(d.id, d.source, d.target);
            });
            $timeout(function(){
                dLinks.forEach(function(d) {
                    $("#link-"+d.source.id+"-"+d.target.id).attr("d",$scope.linkDisplay["link-"+d.source.id+"-"+d.target.id].d);
                    //addLink(d.id, d.source, d.target);
                });
            },200);
            // switch-layout feature
            if ($scope.verticalLayout)
                zoom.translate([(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]);
            else
                zoom.translate([(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]);
            //zoom.translate([(cSize[0]/2),(cSize[1]/2)]);
            zoom.event(d3.select('#ct-mapSvg'));
            progressFlag = false;

    };

    //Dialog used through out mindmap
    function openDialogMindmap(title, body) {
		if(!$scope.pdmode){
            $("#auditTable").remove();
            $("#mindmapGlobalDialog .modal-dialog").css("width","auto")
        }
        if (window.location.pathname == '/mindmap' || window.location.pathname == '/version') {
            $("#mindmapGlobalDialog").find('.modal-title').text(title);
            $("#mindmapGlobalDialog").find('.modal-body p').text(body).css('color', 'black');
            $("#mindmapGlobalDialog").modal("show");
            setTimeout(function() {
                $("#mindmapGlobalDialog").find('.btn-default').focus();
            }, 300);
        } else if (window.location.pathname == '/designTestCase' || window.location.pathname == '/design' || window.location.pathname == '/execute') {
            $("#globalTaskSubmit").find('.modal-title').text(title);
            $("#globalTaskSubmit").find('.modal-body p').text(body);
            $("#globalTaskSubmit").modal("show");
        }

    }

    /*
    function : exportData()
    Purpose : Exporting data in json file
    param :
    */

    $scope.exportData = function(versioning_status) {
        if (versionFlag != 1) {
            openDialogMindmap("Fail", "Please select a module to proceed");
            return;
        }
        var version_num = ($('.version-list').val() != undefined)? $('.version-list').val(): "0.0";
        var suiteDetailsTemplate = { "condition": 0, "dataparam": [" "], "scenarioId": "", "scenarioName": "" };
        var moduleData = { "testsuiteName": "", "testsuiteId": "", "versionNumber": "", "appType": "", "domainName": "", "projectName": "", "projectId": "", "releaseId": "", "cycleName": "", "cycleId": "", "suiteDetails": [suiteDetailsTemplate] };
        var executionData = { "executionData": [{ "source": "api", "exectionMode": "serial", "browserType": ["1"], "qccredentials": { "qcurl": "", "qcusername": "", "qcpassword": "" }, "batchInfo": [JSON.parse(JSON.stringify(moduleData))], "userInfo": { "tokenhash": "", "tokenname": "", "icename": "" } } ] };
        var moduleInfo = { "batchInfo": [] };
        blockUI('Loading UI');
        var moduleid = $('#createNewConfirmationPopup').attr('mapid');
        var modName = $('#createNewConfirmationPopup').attr('mapname');
        const prjInfo = $("#ct-AssignBox").find('.project-list').children("option").filter(":selected");
        const relInfo = $('.release-list').children("option").filter(":selected");
        const cycInfo = $('.cycle-list').children("option").filter(":selected");
        moduleData.appType = $scope.apptype;
        moduleData.domainName = $scope.domain;
        moduleData.projectName = prjInfo.text();
        moduleData.projectId = prjInfo.val();
        moduleData.releaseId = relInfo.text();
        moduleData.cycleName = cycInfo.text();
        moduleData.cycleId = cycInfo.val();
        const reqObject = [{
            "releaseid": moduleData.releaseId,
            "cycleid": moduleData.cycleId,
            "testsuiteid": moduleid,
            "testsuitename": modName,
            "projectidts": moduleData.projectId,
            "versionnumber": parseFloat(version_num)
        }];
        mindmapServices.getTestSuiteDetails(reqObject).then(
                function(moduleObj) {
                if (moduleObj == "Invalid Session") {
                    return $rootScope.redirectPage();
                } else if (moduleObj == 'fail') {
                    unblockUI();
                    openDialogMindmap('Mindmap', "Data Exported Failed");
                    return;
                }
                unassignTask=[];
                moduleObj = moduleObj[moduleid];
                if(moduleObj && moduleObj.testsuitename == loadedmodule && moduleObj.testsuiteid != null) {
                    moduleData.testsuiteId = moduleObj.testsuiteid;
                    moduleData.testsuiteName = moduleObj.testsuitename;
                    moduleData.versionNumber = moduleObj.versionnumber;
                    moduleData.suiteDetails = [];
                    for (var j = 0; j < moduleObj.scenarioids.length; j++) {
                        var s_data = JSON.parse(JSON.stringify(suiteDetailsTemplate));
                        s_data.condition = moduleObj.condition[j];
                        s_data.dataparam = [moduleObj.dataparam[j]];
                        s_data.scenarioName = moduleObj.scenarionames[j];
                        s_data.scenarioId = moduleObj.scenarioids[j];
                        moduleData.suiteDetails.push(s_data);
                    }
                    moduleInfo.batchInfo.push(moduleData);
                    unblockUI();
                    jsonDownload('moduleinfo.json', JSON.stringify(moduleInfo));
                    jsonDownload('executiondata.json', JSON.stringify(executionData));
                    openDialogMindmap('Mindmap', "Data Exported Successfully.");
                } else {
                    unblockUI();
                    openDialogMindmap('Mindmap', "Module is not created in ICE");
                    // openDialogMindmap('Mindmap', "Data Exported Successfully. Note: Only Created Modules are exported.");
                    console.log('Not exported : ', moduleObj[i].name);
                }
            },
            function(err) {
                console.log(err);
                unblockUI();
                openDialogMindmap('Mindmap', "Data Exported Failed");
            }
        );
    }

    /*
    function : jsonDownload()
    Purpose : download json file
    */

    function jsonDownload(filename, responseData) {
        if (isIE) {
            window.navigator.msSaveOrOpenBlob(new Blob([responseData], { type: "text/json;charset=utf-8" }), filename);
        } else {
            var blob = new Blob([responseData], { type: 'text/json' });
            var e = document.createEvent('MouseEvents');
            var a = document.createElement('a');
            a.download = filename;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initMouseEvent('click', true, true, window,
                0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        }
    }

    function draww() {
        var mmap = dNodes[0];
        clearSvg();
        treeBuilder(mmap);
        //Disable every other action	
        $('#ct-canvas').append("<div id='rect-copy'><div>").on('resize', resize1).on('drag', resize1);
        $("#rect-copy").resizable();
        $("#rect-copy").draggable();
    }

    function resize1() {
        dNodes_c = [];
        dLinks_c = [];
        $('.ct-node').removeClass('node-selected node-error');
        $('.ct-link').removeClass('link-selected');
        // console.log('Resize');
        var xvp = d3.select("#ct-mindMap").attr("transform").split(/[()]/)[1].split(split_char)[0];
        var yvp = d3.select("#ct-mindMap").attr("transform").split(/[()]/)[1].split(split_char)[1];
        var scale = (d3.select("#ct-mindMap").attr("transform").split(/[()]/)[3]);

        dNodes.forEach(function(e, i) {
            var lt = [parseFloat(xvp) + parseFloat(e.x) * parseFloat(scale), parseFloat(yvp) + parseFloat(e.y) * parseFloat(scale)];
            // console.log('l,t :',lt);
            if (e.type != 'modules') {
                if (lt[0] > $('#rect-copy').position().left && lt[0] < ($('#rect-copy').position().left + $('#rect-copy').width()) && lt[1] > $('#rect-copy').position().top && lt[1] < ($('#rect-copy').position().top + $('#rect-copy').height())) {
                    $('#ct-node-' + i).addClass('node-selected');
                    if (e.type == 'testcases' && (dNodes_c.indexOf(dNodes[e.parent.id]) == -1)) {
                        $('#ct-node-' + e.parent.id).addClass('node-selected');
                        dNodes_c.push(dNodes[e.parent.id]);
                    }
                    dNodes_c.push(e);
                }
            }
        });
        dLinks.forEach(function(e, i) {
            if ($('#ct-node-' + e.source.id).hasClass('node-selected') && $('#ct-node-' + e.target.id).hasClass('node-selected')) {
                $('#ct-link-' + e.id).addClass('link-selected');
                dLinks_c.push(e);
            }
        })
    };

    function copyMap() {
        var dangling_screen_check_flag = false,
            dangling_screen, dangling_screen_flag = false,
            ds_list = [];
        //validate
        //if topmost is scenario and screen without parent -> fail
        dNodes_c.forEach(function(e, i) {
            if (e.type == 'scenarios')
                dangling_screen_check_flag = true; // then check for dangling screen
        })
        if (dangling_screen_check_flag) {
            dNodes_c.forEach(function(e, i) {
                if (e.type == 'screens') {
                    dangling_screen = true;
                    dLinks_c.forEach(function(f, i) {
                        if (e.id == f.target.id)
                            dangling_screen = false;
                    })
                }
                if (dangling_screen) {

                    dangling_screen_flag = true;
                    ds_list.push(e);
                }
            })
        }

        if (dangling_screen_flag) {
            openDialogMindmap('Error', 'dangling screen!!! validation failed!');
            ds_list.forEach(function(e, i) {
                $('#ct-node-' + e.id).addClass('node-error');
            });
        } else {
            openDialogMindmap('Success', 'Data Copied successfully');
            $('.ct-node').removeClass('node-selected');
            $('.ct-link').removeClass('link-selected');
            $('#rect-copy').remove();
            $('#copyImg1').removeClass('active-map');
        }

    }

    //------------------------------------------------Workflow.js----------------------------------------

    var isIE = /*@cc_on!@*/ false || !!document.documentMode;

    function loadMindmapData1_W() {
        blockUI("Loading...");
        $('#eteScenarioContainer').empty();
        d3.select('.addScenarios-ete').classed('disableButton', !0);
        //$('#ct-saveAction_W').removeClass('no-access');
        //uNix=0;uLix=0;dNodes=[];dLinks=[];nCount=[0,0,0,0];scrList=[];tcList=[];cSpan=[0,0];cScale=1;mapSaved=!1;
        taskAssign = {
            "endtoend": {
                "task": ["Execute"],
                "attributes": ["at", "rw", "sd", "ed"]
            },
            "scenarios": {
                "task": ["Execute Scenario"],
                "attributes": ["at", "rw", "sd", "ed", "cx"]
            },
            "screens": {
                "task": ["Scrape", "Append", "Compare", "Add", "Map"],
                "attributes": ["at", "rw", "sd", "ed", "cx"]
            },
            "testcases": {
                "task": ["Update", "Design"],
                "attributes": ["at", "rw", "sd", "ed", "cx"]
            }
        };
        zoom = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoomed);
        $("#ctExpandCreate").click(function(e) {
            if ($(".ct-node:visible").length > 6) {
                toggleExpand(e, 'module');
            }
        });
        $("#ctExpandAssign").click(function(e) {
            if ($(".ct-node:visible").length > 6) {
                toggleExpand(e, 'Assign');
            }
        });
        d3.select('#ct-main').on('contextmenu', function(e) {
            d3.event.preventDefault();
        });

        d3.select('#ct-assignBox').classed('no-disp', !0);
        mindmapServices.getModules(versioning_enabled, 'endToend', $scope.projectNameO, $('.cycle-list').val(),null,null).then(function(result) {
            if (result == "Invalid Session") {
                return $rootScope.redirectPage();
            }
            var nodeBox = d3.select('#etemModuleContainer');
            // $(nodeBox[0]).empty();
            $scope.allMMaps = allMaps_info = result;
            unassignTask=[];
            initScroller();
            setModuleBoxHeight_W();
            unblockUI();
        }, function(error) {
            console.log(error);
            unblockUI();
        })

    }



    function getElementDimm(s) {
        return [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    };

    $scope.createNewMap_W = function($event) {
        initiate();
        clearSvg();
        var s = getElementDimm(d3.select("#ct-mapSvg"));
        $("#ct-saveAction").removeClass("disableButton")
        //X and y changed to implement layout change
        // switch-layout feature
        if ($scope.verticalLayout) {
            node = {
                projectID: $('#selectProjectEtem').val(),
                id: uNix,
                childIndex: 0,
                name: 'Module_0',
                type: 'endtoend',
                y: s[0] * 0.2,
                x: s[1] * 0.4,
                children: [],
                parent: null
            };
        } else {
            node = {
                projectID: $('#selectProjectEtem').val(),
                id: uNix,
                childIndex: 0,
                name: 'Module_0',
                type: 'endtoend',
                y: s[1] * 0.4,
                x: s[0] * 0.2,
                children: [],
                parent: null,
                state: 'created'
            };
        }

        dNodes.push(node);
        $scope.nodeDisplay[node.id] = {
            'type': node.type,
            'transform': "translate(" + (node.x).toString() + "," + (node.y).toString() + ")",
            'opacity': !(node._id == null) ? 1 : 0.5,
            'title': node.name,
            'name': node.display_name || node.name,
            '_id':node._id || null
        };
        nCount[0]++;
        uNix++;
        //To fix issue 710-Create a module and see that module name does not display in edit mode
        v = addNode_W(dNodes[uNix - 1], !1, null);
        childNode = v;
        setTimeout(function() { $scope.editNode(true, node); }, 100);
    };

    function loadScenarios(title) {
        $scope.functionTBE = 'loadScenariosPopupConfirmed';
        $(".search-canvas").val('');
        $('#createNewConfirmationPopup').attr('mapid', title);
        if (Object.keys($scope.nodeDisplay).length != 0) {
            $('#createNewConfirmationPopup').modal('show');
        } else
            loadScenariosPopupConfirmed();
    };

    function loadScenariosPopupConfirmed() {
        d3.selectAll('.zoom-btn').on('click', zoomClick);
        $('.navigate-widget').removeClass("no-disp");
        $('.navigate-widget').draggable({ containment: "#ct-mapSvg" });
        $('.arrow-box-ic').unbind('mousedown');
        $('.arrow-box-ic').unbind('mouseup');
        $('.arrow-box-ic').unbind('mouseout');
        $('.arrow-box-ic').mousedown(function(e, i) {
            refreshIntervalId = setInterval(function() { moveMap(e.target.classList[1]) }, 20);
        });
        $('.arrow-box-ic').mouseout(function(e, i) {
            try { clearInterval(refreshIntervalId); } catch (err) { console.log("no interval found."); }

        });
        $('.arrow-box-ic').mouseup(function(e, i) {
            try { clearInterval(refreshIntervalId); } catch (err) { console.log("no interval found."); }
        });
        d3.select('.addScenarios-ete').classed('disableButton', !0);
        saveFlag_W = false;
        //$('#ct-createAction_W').addClass('disableButton');
        SaveCreateED('#ct-createAction', 1, 0);
        $("span.nodeBoxSelected").removeClass("nodeBoxSelected");
        $('[title=' + $('#createNewConfirmationPopup').attr('mapid') + ']').addClass("nodeBoxSelected");
        cur_module = $('[data-mapid=' + $('#createNewConfirmationPopup').attr('mapid') + ']');
        initiate();
        clearSvg();
        var moduleid = $('#createNewConfirmationPopup').attr('mapid');
        // var moduleid =$('#createNewConfirmationPopup').attr('_id');
        mindmapServices.getModules(versioning_enabled, 'endToend', $scope.projectNameO, 0, $('.cycle-list').val(), null,moduleid)
            .then(function(result) {
                if (result == "Invalid Session") {
                    return $rootScope.redirectPage();
                }
                currMap = result;
                unassignTask=[];
                treeBuilder_W(currMap);
            }, function(error) {
                console.log(error);
            })

    }

    function loadEndtoEndModule(name, mapid, type,modid) {
        if (type != 'endtoend') {
            if (Object.keys($scope.nodeDisplay).length == 0) { // if no map is loaded 
                openDialogMindmap('Error', 'First, Please select an end to end module or create a new one!');
                return;
            }
            var som = 'Module Name: ' + name;
            if (som.length > 31)
                $('.endtoend-modules-right-upper label').text(som.substring(0, 30) + '...');
            else
                $('.endtoend-modules-right-upper label').text(som);
            $('.endtoend-modules-right-upper label').attr('title', som.substring(13))
        } else {
            $('.endtoend-modules-right-upper label').attr('title', '')
            $('.endtoend-modules-right-upper label').text('Scenarios');
        }
        $("#ct-saveAction").removeClass("disableButton")
        // #894: Add button disabled by default
        $('.addScenarios-ete').addClass('disableButton');
        //#821 UI issues in e2e
        $('#eteSearchScenarios').val("");
        var container = $("#eteScenarioContainer");
        container.empty();
        var moduleid = modid;
        if (allMaps_info[mapid].type == "endtoend") {
            return;
        }
        blockUI("Loading module.. Please wait..");
        mindmapServices.populateScenarios(moduleid).then(function(result) {
            if (result == "Invalid Session") {
                return $rootScope.redirectPage();
            }
            container.empty();
            result.forEach(function(row) {
                container.append("<span class='eteScenrios' data-scenarioId='" + row._id + "' title='" + row.name + "'>" + row.name + "</span>")
            });
            // #817 To select multiple scenarios in e2e (Himanshu)
            var nCounter=0;
            $('.eteScenrios').click(function() {
                $(this).toggleClass('selectScenariobg');
                if($(this).hasClass('selectScenariobg')) {
                    $(this).attr('data-position', ++nCounter);
                }
                else{
                    $(this).attr('data-position',null);
                } 
                var classflag = false;
                d3.select('.addScenarios-ete').classed('disableButton', !0);
                $.each($('.eteScenrios'), function() {
                    if ($(this).hasClass('selectScenariobg')) {
                        classflag = true;
                        d3.select('.addScenarios-ete').classed('disableButton', !1);
                    }
                })
            })
            unblockUI();
        }, function(error) {
            unblockUI();
            openDialogMindmap("Error", "Error occured while loading Module");
            console.log(error);
        })
    }

    function createScenario_Node(text, scenario_prjId,scrid) {
        if (text == '') return;
        //If module is in edit mode, then return do not add any node
        if (d3.select('#ct-inpBox').attr('class') == "") return;
        d3.select('#ct-inpBox').classed('no-disp', !0);
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        var pi = 0;
        if (dNodes[pi]._children == null) {
            if (dNodes[pi].children == undefined) dNodes[pi]['children'] = [];
            //var nNext={'modules_endtoend':['Scenario',1],'scenarios':['Screen',2],'screens':['Testcase',3]};
            var mapSvg = d3.select('#ct-mapSvg');
            var w = parseFloat(mapSvg.style('width'));
            var h = parseFloat(mapSvg.style('height'));
            //name:nNext[pt][0]+'_'+nCount[nNext[pt][1]]

            node = {
                projectID: scenario_prjId,
                id: uNix,
                childIndex: '',
                path: '',
                name: text,
                type: 'scenarios',
                y: h * (0.15 * (1.34 + 1) + Math.random() * 0.1),
                x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
                children: [],
                parent: dNodes[pi],
                state: 'created',
                _id:scrid
            };
            //TO fix issue with random positions of newly created nodes
            if (dNodes[pi].children.length > 0) {
                arr = dNodes[pi].children;
                index = dNodes[pi].children.length - 1;
                // switch-layout feature
                if ($scope.verticalLayout) {
                    node.x = arr[index].x + 80;
                    node.y = arr[index].y;
                } else {
                    node.y = arr[index].y + 80;
                    node.x = arr[index].x;
                }


            } else {
                //Modified parameters to change the layout
                // switch-layout feature
                if ($scope.verticalLayout) {
                    node.x = dNodes[pi].x;
                    node.y = dNodes[pi].y + 125;
                } else {
                    node.y = dNodes[pi].y;
                    node.x = dNodes[pi].x + 125;
                }
            }

            dNodes.push(node);
            $scope.nodeDisplay[node.id] = {
                'type': node.type,
                'transform': "translate(" + (node.x).toString() + "," + (node.y).toString() + ")",
                'opacity': !(node._id == null) ? 1 : 0.5,
                'title': node.name,
                'name': node.display_name || node.name,
                '_id': node._id || null
            };
            dNodes[pi].children.push(dNodes[uNix]);
            dNodes[uNix].childIndex = dNodes[pi].children.length
            dNodes[uNix].cidxch = 'true'; // child index updated
            var currentNode = addNode_W(dNodes[uNix], !0, dNodes[pi]);
            if (currentNode != null) {
                childNode = currentNode;
                //console.log(currentNode);
                link = {
                    id: uLix,
                    source: dNodes[pi],
                    target: dNodes[uNix]
                };
                dLinks.push(link);
                addLink(uLix, dNodes[pi], dNodes[uNix]);
                uNix++;
                uLix++;

            }

        } else {
            openDialogMindmap('Error', 'Expand the node');
        }

    };

    function moveNode_W(e) {
        e = e || window.event;
        //#886 Unable to rearrange nodes in e2e
        d3.select('.ct-movable').attr('transform', "translate(" + parseFloat((e.pageX - $('#ct-mapSvg').offset().left - cSpan[0]) / cScale + 2) + "," + parseFloat((e.pageY - $('#ct-mapSvg').offset().top - cSpan[1]) / cScale - 20) + ")");
    };

    function moveNodeBegin_W(e) {
        e = e || window.event;
        e.cancelbubble = !0;
        if (e.stopPropagation) e.stopPropagation();
        //To check whether browser Is IE or not issue #415
        var isIE = /*@cc_on!@*/ false || !!document.documentMode;
        var p = d3.select(this.parentElement);
        if (isIE) {
            var p = d3.select(this.parentNode);
        }
        var pi = p.attr('id').split('-')[2];
        temp_W = {
            s: [],
            t: ""
        };
        dLinks.forEach(function(d, i) {
            if (d.source.id == pi) {
                temp_W.s.push(d.id);
                d3.select('#ct-link-' + d.id).remove();
            } else if (d.target.id == pi) {
                temp_W.t = d.id;
                d3.select('#ct-link-' + d.id).remove();
            }
        });
        p.classed('ct-movable', !0);
        d3.select('#ct-mapSvg').on('mousemove.nodemove', moveNode_W);
    };

    function moveNodeEnd_W(e) {
        d3.select('#ct-mapSvg').on('mousemove.nodemove', null);
        var isIE = /*@cc_on!@*/ false || !!document.documentMode;
        var p = d3.select(this.parentElement);
        var split_char = ',';
        if (isIE) {
            var p = d3.select(this.parentNode);
            split_char = ' ';
        }

        var pi = p.attr('id').split('-')[2];
        var l = p.attr('transform').slice(10, -1).split(split_char);
        //Logic to implement rearranging of nodes
        var curNode = dNodes[pi];

        dNodes[pi].x = parseFloat(l[0]);
        dNodes[pi].y = parseFloat(l[1]);
        addLink(temp_W.t, dLinks[temp_W.t].source, dLinks[temp_W.t].target);
        var v = (dNodes[pi].children) ? !1 : !0;
        temp_W.s.forEach(function(d) {
            addLink(d, dLinks[d].source, dLinks[d].target);
            d3.select('#ct-link-' + d).classed('no-disp', v);
        });
        p.classed('ct-movable', !1);
    };


    function recurseTogChild_W(d, v) {
        if (d.children) d.children.forEach(function(e) {
            recurseTogChild_W(e, v);
            d3.select('#ct-node-' + e.id).classed('no-disp', v);
            for (j = dLinks.length - 1; j >= 0; j--) {
                if (dLinks[j].source.id == d.id) {
                    d3.select('#ct-link-' + dLinks[j].id).classed('no-disp', v);
                }
            }
        });
        else if (d._children) d._children.forEach(function(e) {
            recurseTogChild_W(e, !0);
            d3.select('#ct-node-' + e.id).classed('no-disp', !0);
            for (j = dLinks.length - 1; j >= 0; j--) {
                if (dLinks[j].source.id == d.id) {
                    d3.select('#ct-link-' + dLinks[j].id).classed('no-disp', !0);
                }
            }
        });
    };

    $scope.addScenariosete = function($event) {
        if (!$event.originalEvent) return;
        SaveCreateED('#ct-createAction', 1, 0);
        var spanArray = $("#eteScenarioContainer").find("span").filter(".selectScenariobg");
        // sort based on data position attribute
        var sortedSpanArray = spanArray.sort(function (a, b) {
            return +a.getAttribute('data-position') - +b.getAttribute('data-position');
        });
        //// #817 To select multiple scenarios in e2e (Himanshu)
        sortedSpanArray.each(function(i, obj) {
            var text = $(obj).text();
            var scrid = $(obj).attr('data-scenarioId')
            if (scrid!= 'null') {
                createScenario_Node(text, $('#selectProjectEtem').val(),scrid);
            } else {
                openDialogMindmap('Error', 'Scenario is not created');
            }
        });
    };


    function setModuleBoxHeight_W() {
        //var lm=d3.select('#ct-moduleBox').classed('ct-open',!0);
        var lm = d3.select('#etemModuleContainer').classed('ct-open', !0);
        var h1 = lm.style('height');
        lm.classed('ct-open', !1);
        if (h1 == lm.style('height')) lm.select('.ct-expand').classed('no-disp', !0);
        else lm.select('.ct-expand').classed('no-disp', !1);
    };

    function clearSvg() {
        unloadMindmapData();
        //$("#ct-node-0").children(".ng-binding").each(function(i,obj){
            //obj.innerHTML='Module_0';
        //});
        d3.select('#ct-ctrlBox').classed('no-disp', !0);
        d3.select('#ct-assignBox').classed('no-disp', !0);
        //d3.select('#ct-mapSvg').append('g').attr('id', 'ct-mindMap');
        uNix = 0;
        uLix = 0;
        dNodes = [];
        dLinks = [];
        nCount = [1, 1, 1, 1];
        cSpan = [0, 0];
        cScale = 1;
        mapSaved = !1;
        zoom.scale(cScale).translate(cSpan);
        zoom.event(d3.select('#ct-mapSvg'));
        d3.select('#ct-inpBox').classed('no-disp', !0);
    };

    //FUnction is tagged to every click on 'cnavas' element to validate the names of nodes when created
    function callme() {
        if (childNode != null && (d3.select(childNode).text() == 'Module_0' || d3.select(childNode).text() == 'Screen_0' || d3.select(childNode).text() == 'Scenario_0' || d3.select(childNode).text() == 'Testcase_0')) {
            d3.select('#ct-inpBox').classed('no-disp', !1);
        }

    }

    function treeBuilder_W(tree) {
        var pidx = 0,
            levelCount = [1],
            cSize = getElementDimm(d3.select("#ct-mapSvg"));
        var typeNum = {
            'endtoend': 0,
            'modules':0,
            'scenarios': 1,
            'screens': 2,
            'testcases': 3
        };
        var childCounter = function(l, s) {
            if (levelCount.length <= l) levelCount.push(0);
            if (s.children) {
                levelCount[l] += s.children.length;
                s.children.forEach(function(d) {
                    childCounter(l + 1, d);
                });
            }
        };
        childCounter(1, tree);
        var newHeight = d3.max(levelCount) * 90;
        var d3Tree = d3.layout.tree().size([newHeight, cSize[0]]);
        if(tree.oid===undefined) d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
        else d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
        if (tree.childIndex === undefined) d3Tree.sort(function(a, b) {
            return a.childIndex - b.childIndex;
        });
        else d3Tree.sort(function(a, b) {
            return a.childIndex - b.childIndex;
        });
        dNodes.sort(function(a, b) {
            return a.childIndex - b.childIndex;
        });        
        dNodes = d3Tree.nodes(tree);
        dLinks=d3Tree.links(dNodes);
        dNodes.forEach(function(d) {

            // switch-layout feature
            if ($scope.verticalLayout) {
                d.y = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
            } else {
                d.y = d.x;
                //Logic to change the layout and to reduce the length of the links
                d.x = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
            }
            if (d.oid === undefined) d.oid = d.id;
            d.id = uNix++;
            addNode_W(d, !0, d.parent);
            if ($scope.tab != 'mindmapEndtoEndModules') {
                if (d.task != null) d3.select('#ct-node-' + d.id).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/node-task-assigned.png').attr('x', 29).attr('y', -10).attr('width', '21px').attr('height', '21px');
                // else
                // {
                //     d3.select('#ct-node-' + d.id).selectAll("img").remove();
                // }
            }
        });
        dLinks = d3Tree.links(dNodes);
        dLinks.forEach(function(d) {
            d.id = uLix++;
            addLink(d.id, d.source, d.target);
        });
        //zoom.translate([0,(cSize[1]/2)-dNodes[0].y]);
        // switch-layout feature
        if ($scope.verticalLayout) {
            zoom.translate([(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]);
        } else {
            zoom.translate([(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]);
        }
        zoom.event(d3.select('#ct-mapSvg'));
    };
    //-------------------End of workflow.js---------------------------//
    //-------------------Start of Versioning.js-----------------------//
    /*
function replicationHandler()
Purpose : displaying pop up for replication of project
*/

    // function replicationHandler() {
    //     console.log('Inside..')
    //     var userInfo = JSON.parse(window.localStorage['_UI']);
    //     var user_id = userInfo.user_id;
    //     blockUI('Loading....')
    //     mindmapServices.populateProjects().then(function(result) {
    //         if (result == "Invalid Session") {
    //             return $rootScope.redirectPage();
    //         }
    //         var project_type = $('.project-list').find(':selected').attr('app-type')
    //         mindmapServices.getProjectsNeo().then(function(res) {
    //             if (res == "Invalid Session") {
    //                 return $rootScope.redirectPage();
    //             }
    //             var parse_data = res;
    //             var flag = 0;
    //             $('.versioningOption').remove()
    //             var parsed_project_id = [];
    //             for (var i = 0; i < parse_data[0].data.length; i++) {
    //                 parsed_project_id.push(parse_data[0].data[i].row[0])
    //             }

    //             var new_projectsList = {
    //                 projectId: [],
    //                 projectName: [],
    //                 appType: []
    //             };
    //             for (var i = 0; i < result['projectName'].length; i++) {
    //                 if (project_type == result['appType'][i]) {
    //                     new_projectsList.projectId.push(result['projectId'][i]);
    //                     new_projectsList.projectName.push(result['projectName'][i]);
    //                     new_projectsList.appType.push(result['appType'][i]);
    //                 }

    //             }
    //             if (parsed_project_id.indexOf($('.project-list').val()) != -1) {
    //                 for (var i = 0; i < new_projectsList['projectName'].length; i++) {
    //                     if (parsed_project_id.indexOf(new_projectsList['projectId'][i]) != -1) {
    //                         console.log('Available in Neo4j')
    //                     } else {
    //                         flag = 1;
    //                         $('#destProjects').append($('<option>').attr({
    //                             value: new_projectsList['projectId'][i],
    //                             class: 'versioningOption'
    //                         }).text(new_projectsList['projectName'][i]));
    //                     }
    //                 }
    //                 $('#ProjectReplicationPopUp').modal("show");
    //                 $('#replicateVersionButton').removeClass('disableButton').removeAttr('disabled', 'disabled');
    //                 if (!flag)
    //                     $('#replicateVersionButton').addClass('disableButton').attr('disabled', 'disabled');
    //             } else {
    //                 openDialogMindmap('Mindmap', "Empty Projects cannot be replicated.")
    //             }
    //             unblockUI();

    //         }, function(err) {
    //             console.log('Error in fetching projects list');
    //             unblockUI();
    //         })
    //     }, function(err) {
    //         console.log('Error in fetching projects list');
    //         unblockUI();
    //     })


    // }

    /*
      function replicationController()
      Purpose : Invoking replication project
    */

    $scope.replicationController = function replicationController() {

        replicate_project($('.version-list').val(), '0.0', $('#destProjects').val())
    }

    /*
    function replicate_project()
    Purpose:Invoking the node service for replication of project
    */

    function replicate_project(from_v, to_v, pid) {
        var userInfo = JSON.parse(window.localStorage['_UI']);
        var user_id = userInfo.user_id;
        console.log("inside replicate project");
        blockUI('Loading....')
        mindmapServices.createVersion('project_replicate', $scope.projectNameO, pid, from_v, to_v, 10).then(
            function(res) {
                if (res == "Invalid Session") {
                    return $rootScope.redirectPage();
                }
                //$('.version-list').val(to_v);
                unblockUI();
                openDialogMindmap('Mindmap', "Project Replicated Successfully.")
            },
            function(err) {
                console.log(err);
                unblockUI();
                openDialogMindmap('Mindmap', "Project Replication Failed.")
            }
        )


    }


    /*
    function : loadMindmapData()
    Purpose : loading mindmap data for default version.
    */

    function loadMindmapData_V() {
        $scope.param = 1;
        loadMindmapData();
    }

    /*
    function : addVersioning(vn)
    Purpose : Adding versioning UI in the mindmap UI.
    params : versions : list of all versions of the selected project
    */

    function addVersioning(versions) {
        //   versions = JSON.parse(versions);
        console.log("versioning enabled");
        $('.replicate').remove()
        $('.selectVersion').remove();
        $('.ct-project-tab').append($('<span>').attr({
            class: 'selectVersion'
        }).append($('<label>').attr({
            class: 'selectVersionLabel'
        }).text('Version: ')).append($('<select>').attr({
            class: 'version-list'
        })).append($('<i>').attr({
            class: 'fa fa-plus-circle fa-lg plus-icon',
            title: "Create New Version",
            //onclick: "versionInputDialogShow(event)"
        })).append($('<i>').attr({
            class: 'fa fa-window-restore fa-lg plus-icon',
            title: "Replicate project",
            //onclick: 'replicationHandler()'
        })).append($('<i>').attr({
            class: 'glyphicon glyphicon-export plus-icon',
            title: "Export Version",
            //onclick: 'exportData(1)'
        })));
        for (i = 0; i < versions.length; i++) {
            $('.version-list').append($('<option>').attr({
                value: versions[i]
            }).text(versions[i]))
        }

        $('.version-list').change(function() {
            loadModules();
        });
        $('.fa.fa-plus-circle.fa-lg.plus-icon').click(function(e) {
            versionInputDialogShow(e);
        });

        $('.fa.fa-window-restore.fa-lg.plus-icon').click(function() {

            replicationHandler();
        });

        $('.glyphicon.glyphicon-export.plus-icon').click(function() {
            exportData(versioning_enabled);
        });

        //setCookie('mm_pvid', $('.version-list').children()[0].value, 15);
        $('.version-list').val($('.version-list').children()[0].value);

        // if (getCookie('mm_pvid') != '') {
        //   $('.version-list').val(getCookie('mm_pvid'));
        // }
        loadMindmapData1(1);
        //loadModules(versions)
        $('.version-list').attr({
            title: $('.version-list').val()
        });
        $('.selectProject').addClass('selectProjectPosition')
        if (window.localStorage['tabMindMap'] == "tabAssign") {
            $('.plus-icon').remove();
            $('.selectVersion').css('margin-left', '2%');
        }
    }

    /*
    function : loadModules()
    Purpose : Loads modules for the active project Version.
    params : None
    */

    function loadModules() {
        var active_version = $('.version-list').val();
        $('.version-list').attr({
            title: active_version
        });
        blockUI('Loading...');
        mindmapServices.getModules(versioning_enabled, window.localStorage['tabMindMap'], $scope.projectNameO, parseFloat(active_version), $('.cycle-list').val(),null,null).then(
            function(res) {
                if (res == "Invalid Session") {
                    return $rootScope.redirectPage();
                }
                var nodeBox = d3.select('.ct-nodeBox');
                // $(nodeBox[0]).empty();
                $scope.allMMaps = res;
                unassignTask=[];
                $scope.allMMaps.forEach(function (e, i) {
                    var t = $.trim(e.name);
                    var img_src = 'imgs/node-modules-no.png';
                    if (e.type == 'endtoend') img_src = 'imgs/MM5.png';
                    var node = nodeBox.append('div').attr('class', 'ct-node fl-left').attr('data-mapid', i).attr('title', t).on('click', loadMap);
                    node.append('img').attr('class', 'ct-nodeIcon').attr('src', img_src).attr('alt', 'Module').attr('aria-hidden', true);
                    if(t.length>20) t = t.substring(0, 20)+'...';
                    node.append('span').attr('class', 'ct-nodeLabel').html(t);
                });
                populateDynamicInputList();
                setModuleBoxHeight();
                unblockUI();
            },
            function(err) {
                console.log(err);
                unblockUI();
            }
        )
    }


    /*
    function : createNewTab(from_v,to_v)
    Purpose : Creates a New project version in the Neo4j db and creates a new tab for that.
    params : from_v : from the version (Source version), to_v : Version number provided by the user.
    */
    function createNewTab(from_v, to_v) {

        var userInfo = JSON.parse(window.localStorage['_UI']);
        var user_id = userInfo.user_id;
        if ($('.ct-nodeBox')[0].children !== undefined && $('.ct-nodeBox')[0].children.length == 0) {
            openDialogMindmap('Error', "Cannot Create Empty Version");
            return;
        }
        blockUI('Loading...');
        mindmapServices.createVersion('', $scope.projectNameO, '', from_v, to_v, 10).then(
            function(res) {
                if (res == "Invalid Session") {
                    return $rootScope.redirectPage();
                }
                $('.version-list').val(to_v);
                unblockUI();
                loadModules();
                openDialogMindmap('Mindmap', "New Version Created Successfully.");
            },
            function(err) {
                console.log(err);
                unblockUI();
                openDialogMindmap('Mindmap', "New Version Creation Failed.")
            }

        )

    }

    /*

      function : versionInputDialogClose()
      Purpose : Closes the dialog box for version Number input.

    */

    function versionInputDialogClose() {

        $('#versionNumInputPopUp').modal('toggle');
    }

    /*

      function : clearInputData()
      Purpose : Clears the data in  dialog box for version Number input.

    */

    $scope.clearInputData = function() {
        $('#versionNumberInput').val('');
    }


    $('#createNewVersionButton').click(function(e) {
            var from_v = $('.version-list').val();
            console.log(from_v);
            createNewVersion(from_v);
        })
        /*

          function : versionInputDialogShow(e)
          Purpose : Shows the dialog to add version number.
          param: e : event to get the source version number tab
        */
    function versionInputDialogShow() {
        mindmapServices.getVersions($scope.projectNameO).then(
            function(res) {
                if (res == "Invalid Session") {
                    return $rootScope.redirectPage();
                }
                maxVersionNumber = res[res.length - 1];
                $('#versionNumInputPopUp').modal("show");
                $('#versionNumberInput').val((parseFloat(maxVersionNumber) + 0.1).toFixed(1));
            },
            function(err) {
                console.log(err);
                openDialogMindmap('Error', 'Error in creating versions')
            })



    }

    /*
    function : createNewVersion(from_v)
    Purpose : This function calls isValidVersionToCreate to verify the version number
    provided by the user in the dialog box and calls createNewTab to create new version in the database
    param : from_v : source version
    */

    function createNewVersion(from_v) {
        console.log(from_v);
        inputVersion = parseFloat($('#versionNumberInput').val());
        mindmapServices.getVersions($scope.projectNameO).then(
            function(result) {
                if (result == "Invalid Session") {
                    return $rootScope.redirectPage();
                }
                maxVersionNumber = result[result.length - 1];
                if (inputVersion > parseFloat(maxVersionNumber)) {
                    createNewTab(from_v, inputVersion);
                } else {
                    if (result.includes(inputVersion.toString()))
                        openDialogMindmap('Error', "Version Number already exists");

                    else {
                        openDialogMindmap('Error', "Invalid Version Number");
                    }
                }
            },
            function(err) {
                console.log(err);
                openDialogMindmap('Error', 'Error in creating versions')
            })

    }

    /*
    function : validateFloatKeyPress(el, evt)
    Purpose : This function restricts user to add only float number and to keep float as one decimal point.
    param : el, evt
    */

    function validateFloatKeyPress(el, evt) {
        var charCode = (evt.which) ? evt.which : event.keyCode;
        var number = el.value.split('.');
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        //just one dot
        if (number.length > 1 && charCode == 46) {
            return false;
        }
        //get the carat position
        var caratPos = getSelectionStart(el);
        var dotPos = el.value.indexOf(".");
        if (caratPos > dotPos && dotPos > -1 && (number[1].length > 0)) {
            return false;
        }
        return true;
    }

    /*
    function : getSelectionStart(o)
    Purpose : Helper function for validateFloatKeyPress
    param : o
    */
    function getSelectionStart(o) {
        if (o.createTextRange) {
            var r = document.selection.createRange().duplicate()
            r.moveEnd('character', o.value.length)
            if (r.text == '') return o.value.length
            return o.value.lastIndexOf(r.text)
        } else return o.selectionStart
    }
    //--------------------End of Versioning.js---------------------//
    //--------------------Controller logic-------------------------//
    $("body").css("background", "#eee");
    $("head").append('<link id="mindmapCSS1" rel="stylesheet" type="text/css" href="css/css_mindmap/style.css" /><link id="mindmapCSS2" rel="stylesheet" type="text/css" href="fonts/font-awesome_mindmap/css/font-awesome.min.css" />');
    var versioningEnabled = false;
    $timeout(function() {
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
        document.getElementById("currentYear").innerHTML = new Date().getFullYear()
        adjustMidPanel();
    }, 500)
    var blockMsg = 'Please Wait...';
    blockUI(blockMsg);
    loadUserTasks();
    unblockUI();
    /*creating version in ui*/
    socket.on('versionUpdate', function(to_v) {
        $('.version-list').append($('<option>').attr({
            value: to_v
        }).text(to_v))
    });

    /*Sidebar-toggle*/
    $scope.tab = "tabRequirement";
    $(".lsSlide,.rsSlide").show();
    $('#ct-main').addClass('leftBarOpen rightBarOpen');
    $('.selectProject').show();
    // $("#ct-moduleBox").hide();
    //$("#ct-moduleBox,.ct-tilebox").hide();
    $("#ct-expand-left").click(function(e) {
        console.log('leftbar click')
        if ($("#ct-expand-left").hasClass("ct-rev")) $(".lsSlide").animate({
            width: 0
        }, 200, function() {
            $(".lsSlide").hide();
        })
        else
            $(".lsSlide").show().animate({
                width: 166
            }, 200);
        $("#ct-expand-left").toggleClass("ct-rev");
        $("#ct-main").toggleClass("leftBarOpen");
        adjustMidPanel();
    });

    $("#ct-expand-right").click(function(e) {
        console.log('rightbar click')
        if ($("#ct-expand-right").hasClass("ct-rev")) $(".rsSlide").animate({
            width: 0
        }, 200, function() {
            $(".rsSlide").hide();
        })
        else $(".rsSlide").show().animate({
            width: 90
        }, 200);
        $("#ct-expand-right").toggleClass("ct-rev");
        $("#ct-main").toggleClass("rightBarOpen");
        adjustMidPanel();
    });

    function adjustMidPanel() {
        if ($('.leftBarOpen.rightBarOpen').length > 0) {
            //endtoend
            $(".endtoend-modulesContainer").prop("style", "width:calc(100% - 256px) !important; left:166px !important;");
            $(".searchModuleimg").prop("style", "right:86px !important;");
            $(".endtoend-modules-right-upper img").prop("style", "left:180px !important;");
            $(".eteLabel").prop("style", "left:366px !important; width:140px !important; bottom:23px !important;");
        } else if ($('.leftBarOpen').length > 0) {
            // $("#ct-moduleBox,.tabAssign").css({'left':'147px !important','width':'100%'})
            //endtoend
            $(".endtoend-modulesContainer").prop("style", "width:calc(100% - 172px) !important; left:166px !important;");
            $(".searchModuleimg").prop("style", "right:91px !important;");
            $(".endtoend-modules-right-upper img").prop("style", "left:195px !important;");
            $(".eteLabel").prop("style", "left:392px !important; width:140px !important; bottom:23px !important;");
        } else if ($('.rightBarOpen').length > 0) {
            //endtoend
            $(".endtoend-modulesContainer").prop("style", "width:calc(100% - 96px) !important;");
            $(".searchModuleimg").prop("style", "right:95px !important;");
            $(".endtoend-modules-right-upper img").prop("style", "left:210px !important;");
            $(".eteLabel").prop("style", "left:420px !important; width:140px !important; bottom:18px !important;");
        } else {
            //endtoend
            $(".endtoend-modulesContainer").prop("style", "width:calc(100% - 10px) !important;");
            $(".searchModuleimg").prop("style", "right:100px !important;");
            $(".endtoend-modules-right-upper img").prop("style", "left:222px !important;");
            $(".eteLabel").prop("style", "left:0 !important; width:140px !important; bottom:18px !important;");

        }
    }

    // Changes made for End to end module implementation
    $scope.createMapsCall = function(e) {
        mindmapServices.getProjectsNeo().then(function(res) {
            if (res == "Invalid Session") {
                return $rootScope.redirectPage();
            } else {
                if (res == "true") versioningEnabled = true;
                load_tab();
            }
        }, function(err) {
            load_tab();
        })

        function load_tab() {
            function selectOpt(tab) {
                $("img.selectedIcon").removeClass("selectedIcon");
                $('#' + tab).addClass('selectedIcon');
				$("#ct-saveAction").addClass("disableButton")
            }
            if ($scope.tab == 'tabRequirement') {
                $('.selectProject').hide();
                selectOpt('reqImg');
            } else if ($scope.tab == 'mindmapCreateOption') {
                $('.selectProject').hide();
                selectOpt('createImg');
            } else if ($scope.tab == 'mindmapEndtoEndModules') {
                // if(!versioningEnabled){
                $("#ct-main").hide();
                selectOpt('createImg');
                //collapseSidebars();
                //loadMindmapData_W();
                $scope.param = 2;
                loadMindmapData();

            } else {
                if ($scope.tab == 'tabCreate') {
                    $('.selectProject').show();
                    selectOpt('createImg');
                    if (!versioningEnabled)
                        $('.selectProject').addClass('selectProjectPosition');
                    $("#ct-main").show();
                    // if (!versioningEnabled) {
                    //     addExport(versioningEnabled);
                    // }
                } else if ($scope.tab == 'tabAssign') {
                    $('.selectProject').show();
                    selectOpt('assignImg');
                    if (!versioningEnabled)
                        $('.selectProject').addClass('selectProjectPosition');
                    $("#ct-main").show();
                }

                //collapseSidebars();
                //if versioning.js file is present then call addVersioning function else call loadMindmapData()
                if (versioningEnabled) {
                    loadMindmapData_V();
                } else {
                    $scope.param = 0;
                    loadMindmapData();
                }

                $timeout(function() {
                    $('#ct-moduleBox').prop("style", "width:100% ; left:0px ;");
                }, 10);
                $timeout(function() {
                    $('#ct-AssignBox').prop("style", "width:100% ; left:0px ;");
                }, 10);
            }
            window.localStorage['tabMindMap'] = $scope.tab;
        }
    }

    $scope.createMap = function(option) {
        $('#expAssign').attr('src','imgs/ic-collapse.png');
        $scope.tab = option;
        excelFlag=0;
        unloadMindmapData();
        dNodes = [];
        dLinks = [];
        $scope.allMMaps = [];
        versionFlag=0;
    }

    $scope.collapseETE = function() {
        if (collapseEteflag) {
            if (screen.height < 1024) {
                $(".endtoend-modulesContainer").prop("style", "height: 48% !important;");
                //$("#ct-canvas").prop("style","height: 250px !important");
                $("#ct-legendBox").prop("style", "top: calc(100% - 24px) !important; left: 8px !important;");
                $("#ct-actionBox_W").prop("style", "top: calc(100% - 34px) !important; left: (100% - 285px) !important;");
            } else {
                $(".endtoend-modulesContainer").css("height", "calc(100% - 430px)");
                //$("#ct-canvas").prop("style","height: 410px !important")
            }
            $('.iconSpace.collapseEte').attr("src", "imgs/ic-collapseup.png");
            collapseEteflag = false;
        } else {
            if (screen.height < 1024) {
                $(".endtoend-modulesContainer").prop("style", "height: 28% !important;");
                //$("#ct-canvas").prop("style","height: 352px !important")
            } else {
                $(".endtoend-modulesContainer").css("height", "");
                //$("#ct-canvas").prop("style","height: 660px !important")
            }
            $('.iconSpace.collapseEte').attr("src", "imgs/ic-collapse.png");
            collapseEteflag = true;
        }
    }

    //Search Modules
    $('#eteSearchModules').keyup(function() {
        filter(this, 'etemModuleContainer');
    });

    //Search Scenarios
    $('#eteSearchScenarios').keyup(function() {
        filter(this, 'eteScenarioContainer');
    });

    function filter(element, id) {
        var value = $(element).val();
        var container;
        container = $("#" + id + " span.eteScenrios");
        $(container).each(function() {
            if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
                id == "etemModuleContainer" ? $(this).parent().show() : $(this).show()
            } else {
                id == "etemModuleContainer" ? $(this).parent().hide() : $(this).hide()
            }
        });
    }

    // Search for modules in create tab (Himanshu)
    $scope.searchModule = function(tab) {
        input = document.getElementById(tab);
        filter_elem = input.value.toUpperCase();
        if (tab == 'eteSearchModules')
            elems = $('.moduleContainer');
        else if (tab == 'eteSearchScenarios')
            elems = $('.eteScenrios');
        else if (tab == 'searchModule-create')
            elems = $('#ct-moduleBox .ct-node');
        else if (tab == 'searchModule-assign')
            elems = $('.ct-nodeBox .ct-node');


        for (i = 0; i < elems.length; i++) {
            if ($(elems[i]).attr('title').toUpperCase().indexOf(filter_elem) > -1) {
                elems[i].style.display = "";
            } else {
                elems[i].style.display = "none";
            }
        }
    };


    function initScroller() {
        $('.scrollbar-inner').scrollbar();
        $('.scrollbar-macosx').scrollbar();
    }
    // Changes made for End to end module implementation
    //To toggle the view when user clicks on switch layout (Himanshu)
    $scope.toggleview = function() {
        var selectedTab = window.localStorage['tabMindMap'];
        if (selectedTab == 'mindmapEndtoEndModules')
            var temp = dNodes.length;
        else
            var temp = dNodes.length;

        if (Object.keys($scope.nodeDisplay).length == 0) {
            openDialogMindmap('Error', "Please select a module first");
        } else if ((selectedTab == 'mindmapEndtoEndModules' || selectedTab == 'tabCreate') && !$('#ct-inpBox').hasClass('no-disp')) {
            openDialogMindmap('Error', "Please complete editing first");
            d3.select('#ct-inpAct').node().focus();
        } else if (selectedTab == 'tabAssign' && !$('#ct-assignBox').hasClass('no-disp')) {
            openDialogMindmap('Error', 'Please complete assign step first');
        } else {
            $scope.verticalLayout = !$scope.verticalLayout;
            loadMap2();
        }
    };

    $scope.createNewMapModal = function(moduleName) {
        $scope.functionTBE = 'createNewMap';
        if($scope.createdthrough=="") $scope.createdthrough="Web";
        $("#ct-saveAction").removeClass("disableButton");
        // clearSvg();
        if (Object.keys($scope.nodeDisplay).length != 0)
            $('#createNewConfirmationPopup').modal('show');
        else
            $scope.createNewMap(moduleName);
    }

    $scope.callFunction = function() {
        $('#createNewConfirmationPopup').modal('hide');
        if ($scope.functionTBE == 'createNewMap')
            $scope.createNewMap();
        if ($scope.functionTBE == 'loadMapPopupConfirmed')
            loadMapPopupConfirmed();
        if ($scope.functionTBE == 'loadScenariosPopupConfirmed')
            loadScenariosPopupConfirmed();
    }

    $scope.createNewMap = function(moduleName) {
        $('.nodeBoxSelected').removeClass('nodeBoxSelected');
        createNewMap(moduleName);
    }

    $scope.fullScreen = function() {
        var elt = document.querySelector("html");
        console.log("Requesting fullscreen for", elt);
        if ((window.fullScreen) || (window.innerWidth == screen.width && (screen.height - window.innerHeight) <= 1)) {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            $timeout(function() {
                $('.thumb-ic-highlight').removeClass('thumb-ic-highlight');
            }, 100);
        } else {
            if (elt.requestFullscreen) {
                elt.requestFullscreen();
            } else if (elt.msRequestFullscreen) {
                elt.msRequestFullscreen();
            } else if (elt.mozRequestFullScreen) {
                elt.mozRequestFullScreen();
            } else if (elt.webkitRequestFullscreen) {
                elt.webkitRequestFullscreen();
            } else {
                console.error("Fullscreen not available");
            }
        }
    }

    $scope.copyMindMap = function() {
        if ($('.fa.fa-clipboard.fa-lg.plus-icon').hasClass('active-map')) {
            openDialogMindmap('Error', 'Cannot copy when the Paste-map icon is active!');
            return;
        }
        if (dNodes_c.length == 0) {
            openDialogMindmap('Warning', 'Nothing is copied');
            return;
        }
        copyMap();
    }
    $scope.startCopy = function() {
        // $('#copyImg1').toggleClass('copyEnable');
        if ($('#pasteImg1.active-map').length > 0) $scope.pasteMap(); //Disable paste
        if ($('#rect-copy').length == 0) {
            $('#copyImg1').addClass('active-map');
            draww();
        } else {
            $('#rect-copy').remove();
            $('#copyImg1').removeClass('active-map');
            $('.node-selected').removeClass('node-selected');
            $('.link-selected').removeClass('link-selected');
        }
    }
    $scope.pasteMap = function() {
        if ($('.fa.fa-pencil-square-o.fa-lg.plus-icon').hasClass('active-map')) {
            openDialogMindmap('Error', 'Please complete copy step first');
            return;
        }
        if (dNodes_c.length == 0) {
            openDialogMindmap('Error', 'Nothing to paste');
            return;
        }
        $('#pasteImg1').toggleClass('active-map');
        var mod = false;
        //select a node to paste all red just available green module/scenario
        dNodes_c.forEach(function(e, i) {
            if (e.type == 'scenarios')
                mod = true; // then check for dangling screen
        })        
        if (mod) {
            //add to module
            $('[data-nodetype=modules]').addClass('node-selected');
        } else {
            //highlight scenarios
            $('[data-nodetype=scenarios]').addClass('node-selected');
        }
        if (!$('#pasteImg1').hasClass('active-map')) {
            dNodes_c = [];
            dLinks_c = [];
            $('.node-selected').removeClass('node-selected');            
        }
        $(".node-selected").mouseenter(function(){
            if(!$(this).children("title").text().includes("Click ")){
                $(this).children("title").text("Click "+$(this).children("title").text()+" to Paste");
            }
        })
        $(".node-selected").mouseleave(function(){
            if($(this).children("title").text().includes("Click ")){
                $(this).children("title").text($(this).children("title").text().replace("Click ",""));
                $(this).children("title").text($(this).children("title").text().replace(" to Paste",""));
            }
        })
    }
    $scope.parsefile = function() {
        console.log("Hi! parsed file.");
    };
    //--------------------Controller logic Ends-------------------------//

    function SaveCreateED(element, disable, noAccess) {
        d3.select(element).classed('no-access', noAccess);
        d3.select(element).classed('disableButton', disable);
    }
    setTimeout(function() {
        $('#createImg').trigger("click");
    }, 500);

    $('.project-list-popup').change(function(e, i) {
        $scope.projectNameO = $('.project-list-popup').val();
    });


    $scope.createFromJson = function($event) {
        var typeo, typen;
        $scope.dataJSON.forEach(function(e, i) {
            if (i == 0) {
                $scope.createNewMapModal($scope.dataJSON[0].name);
                activeNode = '#ct-node-0';
                typeo = 1;
            } else {
                typen = $scope.dataJSON[i].type;
                if (typen > typeo) {
                    activeNode = '#ct-node-' + (dNodes.length - 1);

                } else if (typen < typeo) {
                    var lvl = typeo - typen;
                    if (lvl == 1) {
                        activeNode = '#ct-node-' + dNodes[dNodes.length - 1].parent.parent.id;
                    }
                    if (lvl == 2) {
                        activeNode = '#ct-node-' + dNodes[dNodes.length - 1].parent.parent.parent.id;
                    }
                }
                $scope.createNode(true, {
                    name: $scope.dataJSON[i].name
                });
                typeo = typen;
            }
        });

    };


    $scope.exportToExcel = function() {
        //var excelMap = {};
        if (excelFlag != 1) {
            openDialogMindmap("Fail", "Select the Module to export to excel");
        } else {
            mindmapServices.exportToExcel(excelMap).then(function(result) {
                if (result == "Invalid Session") return $rootScope.redirectPage();
                else if (result == "fail") openDialogMindmap("Fail", "Error while exporting to excel");
                else {
                    openWindow = 0;
                    if (openWindow == 0) {
                        var file = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        if (isIE) {
                            navigator.msSaveOrOpenBlob(file);
                        }else{
                            var fileURL = URL.createObjectURL(file);
                            var a = document.createElement('a');
                            a.href = fileURL;
                            a.download = 'sample.xlsx';
                            //a.target="_new";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            //$window.open(fileURL, '_blank');
                            URL.revokeObjectURL(fileURL);
                        }
                        openDialogMindmap("Success", "Successfully exported to Excel");
                    }
                    openWindow++;
                }
            });
        }
    }

    $scope.getSheetName = function($fileContent) {
        $scope.createdthrough="Excel";
        $scope.content = $fileContent;
        mindmapServices.excelToMindmap({'content':$scope.content,'flag':'sheetname'}).then(function(result) {
            if (result == "Invalid Session") {
                return $rootScope.redirectPage();
            } else if (result == 'fail') {
                openDialogMindmap('Error', 'error fetching sheet names');
            } else {
                $scope.sheetnames = result;
                $("#SheetInput").modal("show");
            }
        }, function(error) {
            console.log(error);
        });        
    }

    $scope.showContent = function(sheetname) {
        if ($("#selectid option:selected").text()== "Please Select Sheet"){
            $("#SheetInput").modal("hide");
            openDialogMindmap('Error', 'Cannot proceed without selecting a Sheet');
            return;
        }
        $("#SheetInput").modal("hide");
        var validate = true;
        mindmapServices.excelToMindmap({'content':$scope.content,'flag':'data','sheetname':sheetname}).then(function(result) {
            if (result == "Invalid Session") {
                return $rootScope.redirectPage();
            } else if (result == 'fail') {
                openDialogMindmap('Error', 'Some column names are invalid');
            } else {
                $scope.dataJSON = result;
                $scope.dataJSON.forEach(function(e, i) {
                    if (!validNodeDetails(e.name)) validate = false;
                });
                if (!validate) {
                    openDialogMindmap('Error', 'Some node names are invalid');
                } else if ($.grep($scope.dataJSON, function(v) {
                        return v.type === 0;
                    }).length > 1) { //mode than one module
                    openDialogMindmap('Error', 'More than one module name in Excel. ( Only one module is supported at a time )');
                } else {
                    // Create Mindmap Flow
                    $scope.createMap('tabCreate');
                    $scope.tab = 'tabCreate';
                    $scope.createMapsCall();
                    $('#ProjectInput').modal('show');
                }

            }
        }, function(error) {
            console.log(error);
        })
    };
    // Shortcut Controller
    document.onkeyup = function(e) {

        //$('[title="Create New"]').attr("tabindex",-1).focus();
        if (e.target.getAttribute('shortcut') == "disabled") {
            return;
        } else if (e.which == 13) {
            $(e.target).trigger('click');
        } else if ($scope.tab == 'mindmapCreateOption') {
            if (e.ctrlKey && e.which == 65) $('[title="Create New"]').trigger('click');
            else if (e.ctrlKey && e.which == 67) $("#assignImg1").trigger('click');
            else if (e.ctrlKey && e.which == 69) $('[title="End to End flow"]').trigger('click');
            else if (e.ctrlKey && e.which == 69) $('[title="End to End flow"]').trigger('click');

            else if ((!e.ctrlKey) && (e.which == 39 || e.which == 40)) {
                elemlist[$scope.tab].idx = (elemlist[$scope.tab].idx + 1) % elemlist[$scope.tab].elems.length;
                $(elemlist[$scope.tab].elems[elemlist[$scope.tab].idx]).attr("tabindex", -1).focus();
            } else if ((!e.ctrlKey) && (e.which == 38 || e.which == 37)) {
                elemlist[$scope.tab].idx = (elemlist[$scope.tab].elems.length + elemlist[$scope.tab].idx - 1) % elemlist[$scope.tab].elems.length;
                $(elemlist[$scope.tab].elems[elemlist[$scope.tab].idx]).attr("tabindex", -1).focus();
            }
        } else if ($scope.tab == 'tabCreate') {

        } else if ($scope.tab == 'mindmapEndtoEndModules') {

        } else if ($scope.tab == 'tabAssign') {

        } else return;

        // if (e.which == 77) {
        //   alert("M key was pressed");
        // } else if (e.ctrlKey && e.which == 66) {
        //   alert("Ctrl + B shortcut combination was pressed");
        // } else if (e.ctrlKey && e.altKey && e.which == 89) {
        //   alert("Ctrl + Alt + Y shortcut combination was pressed");
        // } else if (e.ctrlKey && e.altKey && e.shiftKey && e.which == 85) {
        //   alert("Ctrl + Alt + Shift + U shortcut combination was pressed");
        // }
    };
    if (FileReader.prototype.readAsBinaryString === undefined) {
        FileReader.prototype.readAsBinaryString = function (fileData) {
            var binary = "";
            var pt = this;
            var reader = new FileReader();
            reader.onload = function (e) {
                var bytes = new Uint8Array(reader.result);
                var length = bytes.byteLength;
                for (var i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                //pt.result  - readonly so assign content to another property
                pt.content = binary;
                pt.onload(); // thanks to @Denis comment
            }
            reader.readAsArrayBuffer(fileData);
        }
    }          
	
	// Changes for import from process discovery

    $scope.importFromPD = function(file){
        if(!file) return;
		var res = $scope.apptype;
		var file1 = JSON.parse(file);
		var doc = new DOMParser().parseFromString(file1.data,'text/xml');
        var activityJSON = JSON.parse(xml2json(doc).replace("\nundefined",""));
        if(activityJSON["mxGraphModel"]["root"]["Task"].length>1){
            var cdata = JSON.parse(activityJSON["mxGraphModel"]["root"]["Task"][0]["#cdata"]);  
        }
		else{
            var cdata = JSON.parse(activityJSON["mxGraphModel"]["root"]["Task"]["#cdata"]);
        }
        var res1 = cdata[0]['apptype'];
        if(res1.toLowerCase()!=res.toLowerCase()){
            openDialogMindmap("App Type Error", "AppType doesn't match, please check!!")
            return;
        }
        $scope.pdmode = true;
        $scope.createdthrough="PD";
        clearSvg();
        blockUI("Importing File.. Please Wait..");
        mindmapServices.pdProcess({'projectid':$('.project-list').val(),'file':file}).then(function(result){
            console.log(result);
            unblockUI();
            //{"success":true,"data":["Demo","Activity_0"]}
            var orderMatrix = result.data;
            $scope.dataJSON = [];
            $scope.dataJSON.push({
                name:'Module_PD_'+generateGuid(),
                type:1
            });
            orderMatrix.forEach(function(orderList,orderListIdx){
                $scope.dataJSON.push({
                    name:'Scenario_PD_'+generateGuid(),
                    type:2
                });
                orderList.forEach(function(data,i){
                    $scope.dataJSON.push({
                        name:"Screen_PD_"+data.label,
                        type:3
                    });     
                    $scope.dataJSON.push({
                        name:"Testcase_PD_"+data.label,
                        type:4
                    });                                                             
                });    
            });
            if(result.history){
                $scope.pdAuditData = JSON.parse(atob(result.history));
            }
            else{
                $scope.pdAuditData = []
            }
            $scope.createFromJson();
            $timeout(function() {
                angular.element('#ct-saveAction').triggerHandler('click');
				openDialogMindmap("Success","Data saved successfully");
            }, 100);
            
            // now save and create
        },function(err){
            unblockUI();
            console.log("something went wrong!");
            openDialogMindmap("Fail","failed to import!");
        }
    )

    }  
  /**
	* converts provided xml to json
	*/	
	function xml2json(xml, tab) {
		var X = {
			toObj: function (xml) {
				var o = {};
				if (xml.nodeType == 1) {   // element node ..
					if (xml.attributes.length)   // element with attributes  ..
						for (var i = 0; i < xml.attributes.length; i++)
							o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
					if (xml.firstChild) { // element has child nodes ..
						var textChild = 0, cdataChild = 0, hasElementChild = false;
						for (var n = xml.firstChild; n; n = n.nextSibling) {
							if (n.nodeType == 1) hasElementChild = true;
							else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
							else if (n.nodeType == 4) cdataChild++; // cdata section node
						}
						if (hasElementChild) {
							if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
								X.removeWhite(xml);
								for (var n = xml.firstChild; n; n = n.nextSibling) {
									if (n.nodeType == 3)  // text node
										o["#text"] = X.escape(n.nodeValue);
									else if (n.nodeType == 4)  // cdata node
										o["#cdata"] = X.escape(n.nodeValue);
									else if (o[n.nodeName]) {  // multiple occurence of element ..
										if (o[n.nodeName] instanceof Array)
											o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
										else
											o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
									}
									else  // first occurence of element..
										o[n.nodeName] = X.toObj(n);
								}
							}
							else { // mixed content
								if (!xml.attributes.length)
									o = X.escape(X.innerXml(xml));
								else
									o["#text"] = X.escape(X.innerXml(xml));
							}
						}
						else if (textChild) { // pure text
							if (!xml.attributes.length)
								o = X.escape(X.innerXml(xml));
							else
								o["#text"] = X.escape(X.innerXml(xml));
						}
						else if (cdataChild) { // cdata
							if (cdataChild > 1)
								o = X.escape(X.innerXml(xml));
							else
								for (var n = xml.firstChild; n; n = n.nextSibling)
									o["#cdata"] = X.escape(n.nodeValue);
						}
					}
					if (!xml.attributes.length && !xml.firstChild) o = null;
				}
				else if (xml.nodeType == 9) { // document.node
					o = X.toObj(xml.documentElement);
				}
				else
					alert("unhandled node type: " + xml.nodeType);
				return o;
			},
			toJson: function (o, name, ind) {
				var json = name ? ("\"" + name + "\"") : "";
				if (o instanceof Array) {
					for (var i = 0, n = o.length; i < n; i++)
						o[i] = X.toJson(o[i], "", ind + "\t");
					json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
				}
				else if (o == null)
					json += (name && ":") + "null";
				else if (typeof (o) == "object") {
					var arr = [];
					for (var m in o)
						arr[arr.length] = X.toJson(o[m], m, ind + "\t");
					json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
				}
				else if (typeof (o) == "string")
					json += (name && ":") + "\"" + o.toString() + "\"";
				else
					json += (name && ":") + o.toString();
				return json;
			},
			innerXml: function (node) {
				var s = ""
				if ("innerHTML" in node)
					s = node.innerHTML;
				else {
					var asXml = function (n) {
						var s = "";
						if (n.nodeType == 1) {
							s += "<" + n.nodeName;
							for (var i = 0; i < n.attributes.length; i++)
								s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
							if (n.firstChild) {
								s += ">";
								for (var c = n.firstChild; c; c = c.nextSibling)
									s += asXml(c);
								s += "</" + n.nodeName + ">";
							}
							else
								s += "/>";
						}
						else if (n.nodeType == 3)
							s += n.nodeValue;
						else if (n.nodeType == 4)
							s += "<![CDATA[" + n.nodeValue + "]]>";
						return s;
					};
					for (var c = node.firstChild; c; c = c.nextSibling)
						s += asXml(c);
				}
				return s;
			},
			escape: function (txt) {
				return txt.replace(/[\\]/g, "\\\\")
					.replace(/[\"]/g, '\\"')
					.replace(/[\n]/g, '\\n')
					.replace(/[\r]/g, '\\r');
			},
			removeWhite: function (e) {
				e.normalize();
				for (var n = e.firstChild; n;) {
					if (n.nodeType == 3) {  // text node
						if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
							var nxt = n.nextSibling;
							e.removeChild(n);
							n = nxt;
						}
						else
							n = n.nextSibling;
					}
					else if (n.nodeType == 1) {  // element node
						X.removeWhite(n);
						n = n.nextSibling;
					}
					else                      // any other node
						n = n.nextSibling;
				}
				return e;
			}
		};
		if (xml.nodeType == 9) // document node
			xml = xml.documentElement;
		var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
		return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
    }  
    var generateGuid = function() {
        var result, i, j;
        result = '';
        for(j=0; j<32; j++) {
          i = Math.floor(Math.random()*16).toString(16).toUpperCase();
          result = result + i;
        }
        return result;
    }     
    
}]);

mySPA.directive('onReadFile', function($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('change', function(onChangeEvent) {
                if((onChangeEvent.srcElement || onChangeEvent.target).files[0] == null) return;
                var reader = new FileReader();

                reader.onload = function(onLoadEvent) {
                    try{
                        var res = onLoadEvent.target.result;
                    }
                    catch(ex){
                        var res = this.content;
                    }
                    scope.$apply(function() {
                        fn(scope, {
                            $fileContent: res
                        });
                    });
                };          
                
                
                reader.readAsBinaryString((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                this.value = null;
            });
        }
    };
});