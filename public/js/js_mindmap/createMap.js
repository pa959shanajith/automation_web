var activeNode,childNode,uNix,uLix,node,link,dNodes,dLinks,allMMaps,temp,rootIndex,faRef,nCount,scrList,tcList,mapSaved,zoom,cSpan,cScale,taskAssign,releaseResult,selectedProject;
//unassignTask is an array to store whose task to be deleted
var deletednode=[],unassignTask=[],deletednode_info=[];
var userInfo =  JSON.parse(window.localStorage['_UI']);
var user_role=window.localStorage['_SR'];
var userid = userInfo.user_id;
var versioning_enabled=0;
// node_names_tc keep track of testcase names to decide reusability of testcases
var node_names_tc=[];
var saveFlag=false;
//for handling the case when creatednode goes beyond screensize
var CreateEditFlag=false;
var isIE = /*@cc_on!@*/false || !!document.documentMode;
function loadMindmapData(param){
	blockUI("Loading...");
	dataSender({task:'populateProjects',user_id:userid},function(err,result){
		if(err){
			console.log(result);
			unblockUI();
		}
		else{
			 if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == false)
                {
                   $("#ct-moduleBox,.tabAssign").addClass("ct-expand-module");
                }
			result1=JSON.parse(result);
			//selectedProject=$(".project-list").val();
			$(".project-list").empty();
			for(i=0; i<result1.projectId.length && result1.projectName.length; i++){
				$('.project-list').append("<option app-type='"+result1.appType[i]+"' data-id='"+result1.projectName[i]+"' value='"+result1.projectId[i]+"'>"+result1.projectName[i]+"</option>");	
			}
			if(getCookie('mm_pid') != ''){
				selectedProject=getCookie('mm_pid');
			}
			if (selectedProject == null){
				setCookie('mm_pid',result1.projectId[0],15);
				selectedProject=result1.projectId[0];
			}
			$(".project-list").val(selectedProject);
			//$(".project-list option[value='" + selectedProject + "']").attr('selected', 'selected');
			if (param==1){
				versioning_enabled=1;
				dataSender({task:'getVersions',projectId:$(".project-list").val(),versioning:1},function(err,result){
				if(err){ console.log(err);callback(null,err);}
				else{
					addVersioning(result);	
					if(getCookie('mm_pvid') ==''){
					setCookie('mm_pvid',$('.version-list').children()[0].value,15);
					$('.version-list').val($('.version-list').children()[0].value);		
					}		
				}
			});
			}else{
				loadMindmapData1(param); 
			}
			
			
			$(".project-list").change(function () {
			//Mindmap clear search box on selecting different project
				$('#searchModule-create').val('');
				$('#searchModule-assign').val('');
				selectedProject=$(".project-list").val();
            //alert($(".project-list").val());
				if($("img.iconSpaceArrow").hasClass("iconSpaceArrowTop"))
				{
					$("img.iconSpaceArrow").removeClass("iconSpaceArrowTop");
				}
				if (param==1){
					dataSender({task:'getVersions',projectId:$(".project-list").val(),versioning:1},function(err,result){
					if(err){ console.log(err);callback(null,err);}
					else{
						addVersioning(result);
						setCookie('mm_pvid',$('.version-list').children()[0].value,15);
						$('.version-list').val($('.version-list').children()[0].value);
						}
					});
				}else{
					loadMindmapData1(param);
				}
				setCookie('mm_pid',selectedProject,15);
				
			});
			//Calling the function to restrict the user to give default node names
			$("#ct-canvas").click(callme);
			unblockUI();
		}
	});
}
function loadMindmapData1(param){
	blockUI("Loading...");
	var selectedTab = window.localStorage['tabMindMap'];
	uNix=0;uLix=0;dNodes=[];dLinks=[];nCount=[0,0,0,0];scrList=[];tcList=[];cSpan=[0,0];cScale=1;mapSaved=!1;
	//Adding task to scenario
	taskAssign={"modules_endtoend":{"task":["Execute","Execute Batch"],"attributes":["bn","at","rw","sd","ed","re","cy"]},"modules":{"task":["Execute","Execute Batch"],"attributes":["bn","at","rw","sd","ed","re","cy"]},"scenarios":{"task":["Execute Scenario"],"attributes":["at","rw","sd","ed"]},"screens":{"task":["Scrape","Append","Compare","Add","Map"],"attributes":["at","rw","sd","ed"]},"testcases":{"task":["Update","Design"],"attributes":["at","rw","sd","ed"]}};
	zoom=d3.behavior.zoom().scaleExtent([0.1,3]).on("zoom", zoomed);
	faRef={"plus":"fa-plus","edit":"fa-pencil-square-o","delete":"fa-trash-o"};	
		$(document).on('click',".ct-tile", function() {
			createNewMap();
			});

				 $(document).on('click',"#ctExpandCreate", function(e) {
					if($(".ct-node:visible").length > 6)
					{
						toggleExpand(e);
					}
				 	});
				$(document).on('click',"#ctExpandAssign", function(e) {
					if($(".ct-node:visible").length > 6)
					{
						toggleExpandAssign(e);
					}
				 	});
	d3.select('#ct-main').on('contextmenu',function(e){d3.event.preventDefault();});
	var svgTileG=d3.select('.ct-tile').append('svg').attr('class','ct-svgTile').attr('height','150px').attr('width','150px').append('g');
	var svgTileLen = $(".ct-svgTile").length;
	if(svgTileLen == 0)
	{
		$('#ct-mapSvg, #ct-canvas').empty();
		$('#ct-canvas').append('<div class="ct-tileBox"><div class="ct-tile" title="Create Mindmap"><svg class="ct-svgTile" height="150px" width="150px"><g><circle cx="75" cy="75" r="30"></circle><path d="M75,55L75,95"></path><path d="M55,75L95,75"></path></g></svg></div><span class="ct-text">Create Mindmap</span></div>');
			// svgTileG.append('circle').attr('cx',75).attr('cy',75).attr('r',30);
			// svgTileG.append('path').attr('d','M75,55L75,95');
			// svgTileG.append('path').attr('d','M55,75L95,75');
	}
	d3.select('#ct-assignBox').classed('no-disp',!0);
	var version_num='';

	if(param==1){
		version_num=$('.version-list').val();
	}
	
	dataSender({task:'getModules',tab:window.localStorage['tabMindMap'],prjId:$(".project-list").val(),versioning:param,version:version_num},function(err,result){
		if(err){
			console.log(result);
			unblockUI();
		}
		else{
			var nodeBox=d3.select('.ct-nodeBox');
			$(nodeBox[0]).empty();
			allMMaps=JSON.parse(result);
			allMMaps.forEach(function(e,i){
				//var t=e.name.replace(/_/g,' ');
				var t = $.trim(e.name);
				var img_src='images_mindmap/node-modules-no.png';
				if (e.type=='modules_endtoend') img_src='images_mindmap/MM5.png';
				var node=nodeBox.append('div').attr('class','ct-node fl-left').attr('data-mapid',i).attr('title',t).on('click',loadMap);
				node.append('img').attr('class','ct-nodeIcon').attr('src',img_src).attr('alt','Module').attr('aria-hidden',true);
				node.append('span').attr('class','ct-nodeLabel').html(t);
			});
			if(selectedTab=='tabCreate')
			populateDynamicInputList();
			setModuleBoxHeight();
			unblockUI();
		}
	});
}
window.onresize=function() {
	var w=window.innerWidth-28,h=window.innerHeight-123;
	var mapSvg=d3.select('#ct-mapSvg').style('width',w+'px').style('height',h+'px');
};
var initiate = function(){
	var t,u;
	var selectedTab = window.localStorage['tabMindMap'];
	d3.select('.ct-tileBox').remove();
	if(d3.select('#ct-mindMap')[0][0]!=null) return;
	if(selectedTab == "tabAssign") var canvas=d3.select('#ct-canvasforAssign');
	else var canvas=d3.select('#ct-canvas');
	u=canvas.append('div').attr('id','ct-inpBox').classed('no-disp',!0);
	u.append('input').attr('id','ct-inpPredict').attr('class','ct-inp');
	u.append('input').attr('id','ct-inpAct').attr('maxlength','40').attr('class','ct-inp').on('change',inpChange).on('keyup',inpKeyUp);
	u.append('ul').attr('id','ct-inpSugg').classed('no-disp',!0);
	u=canvas.append('div').attr('id','ct-ctrlBox').classed('no-disp',!0);
	u.append('p').attr('class','ct-ctrl fa '+faRef.plus).on('click',createNode).append('span').attr('class','ct-tooltiptext').html('');
	u.append('p').attr('class','ct-ctrl fa '+faRef.edit).on('click',editNode).append('span').attr('class','ct-tooltiptext').html('');
	u.append('p').attr('class','ct-ctrl fa '+faRef.delete).on('click',deleteNode).append('span').attr('class','ct-tooltiptext').html('');
	u=canvas.append('div').attr('id','ct-assignBox').classed('no-disp',!0);
	u.append('div').attr('id','ct-assignTable');
	u.append('div').attr('class','ct-assignDetailsBox').append('textarea').attr('id','ct-assignDetails').attr('placeholder','Enter Details');
	u.append('div').attr('id','ct-assignButton').append('a').html('OK').on('click',addTask);
	u.append('div').attr('id','ct-unassignButton').append('a').html('Unassign').on('click',removeTask);
	// var mapSvgDiv = canvas.append('div').attr("class","ct-mapSvgContainer");
	// var mapSvg=mapSvgDiv.append('svg').attr('id','ct-mapSvg').call(zoom).on('click.hideElements',clickHideElements);
	var mapSvg=canvas.append('svg').attr('id','ct-mapSvg').call(zoom).on('click.hideElements',clickHideElements);
	var dataAdder=[{c:'#5c5ce5',t:'Modules'},{c:'#4299e2',t:'Scenarios'},{c:'#19baae',t:'Screens'},{c:'#efa022',t:'Test Cases'}];
	u=canvas.append('svg').attr('id','ct-legendBox').append('g').attr('transform','translate(10,10)');
	dataAdder.forEach(function(e,i) {
		t=u.append('g');
		t.append('circle').attr('class','ct-'+(e.t.toLowerCase().replace(/ /g,''))).attr('cx',i*90).attr('cy',0).attr('r',10);
		t.append('text').attr('class','ct-nodeLabel').attr('x',i*90+15).attr('y',3).text(e.t);
	});
	u=canvas.append('svg').attr('id','ct-actionBox').append('g');
	t=u.append('g').attr('id','ct-saveAction').attr('class','ct-actionButton').on('click',actionEvent);
	t.append('rect').attr('x',0).attr('y',0).attr('rx',12).attr('ry',12);
	t.append('text').attr('x',23).attr('y',18).text('Save');
	if(selectedTab == "tabCreate"){
		t=u.append('g').attr('id','ct-createAction').attr('class','ct-actionButton disableButton').on('click',actionEvent);
		t.append('rect').attr('x',100).attr('y',0).attr('rx',12).attr('ry',12);
		t.append('text').attr('x',114).attr('y',18).text('Create');
	}
	
	
};
var zoomed = function(){
	cSpan=d3.event.translate;
	cScale=d3.event.scale;
	
	//Logic to change the layout
	d3.select("#ct-mindMap").attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale +")");
};
var getElementDimm = function(s){return [parseFloat(s.style("width")),parseFloat(s.style("height"))];};

var createNewMap = function(e){ 
	initiate();
	clearSvg();
	var s=getElementDimm(d3.select("#ct-mapSvg"));

	//X and y changed to implement layout change
	// switch-layout feature
	if($('#switch-layout').hasClass('vertical-layout')){
		node={id:uNix,childIndex:0,name:'Module_0',type:'modules',y:s[0]*0.2,x:s[1]*0.4,children:[],parent:null};
	}
	else{
		node={id:uNix,childIndex:0,name:'Module_0',type:'modules',y:s[1]*0.4,x:s[0]*0.2,children:[],parent:null};
	}
	
	dNodes.push(node);nCount[0]++;uNix++;
	//To fix issue 710-Create a module and see that module name does not display in edit mode
	v=addNode(dNodes[uNix-1],!1,null);
	childNode=v;
	editNode(e);
};

var loadMap = function(e){

	if(!d3.select('#ct-mindMap')[0][0] || confirm('Unsaved work will be lost if you continue.\nContinue?')){
		saveFlag=false;
		$('#ct-createAction').addClass('disableButton');
		$("div.nodeBoxSelected").removeClass("nodeBoxSelected");
		$(this).addClass("nodeBoxSelected");
		initiate();
		d3.select('#ct-inpBox').classed('no-disp',!0);
		clearSvg();
		var reqMap=d3.select(this).attr('data-mapid');
		treeBuilder(allMMaps[reqMap]);
	}
};
// to load the map again after switching the layout 
var loadMap2 = function(){
	var selectedTab = window.localStorage['tabMindMap'];
    if(selectedTab=='mindmapEndtoEndModules'){
		var tbd=dNodes_W[0];
		initiate_W();
		clearSvg_W();
		treeBuilder_W(tbd);
	}
	else{
		var tbd=dNodes[0];	
		initiate();
		clearSvg();	
		treeBuilder(tbd);
	}
};

var genPathData = function(s,t){
	/*if(s[1]<t[1]) return ('M'+s[0]+','+s[1]+' H'+(((s[0]+t[0])/2)-10)+' Q'+((s[0]+t[0])/2)+','+s[1]+' '+((s[0]+t[0])/2)+','+(s[1]+10)+'  V'+(t[1]-10)+' Q'+((s[0]+t[0])/2)+','+t[1]+' '+(((s[0]+t[0])/2)+10)+','+t[1]+' H'+t[0]);
	else return ('M'+s[0]+','+s[1]+' H'+(((s[0]+t[0])/2)-10)+' Q'+((s[0]+t[0])/2)+','+s[1]+' '+((s[0]+t[0])/2)+','+(s[1]-10)+'  V'+(t[1]+10)+' Q'+((s[0]+t[0])/2)+','+t[1]+' '+(((s[0]+t[0])/2)+10)+','+t[1]+' H'+t[0]);*/
	return ('M'+s[0]+','+s[1]+'C'+(s[0]+t[0])/2+','+s[1]+' '+(s[0]+t[0])/2+','+t[1]+' '+t[0]+','+t[1]);
};
var addNode = function(n,m,pi){

	var selectedTab = window.localStorage['tabMindMap'];
	if(n.type=='testcases'){
		node_names_tc.push(n.name);
	}
	
	var v=d3.select('#ct-mindMap').append('g').attr('id','ct-node-'+n.id).attr('class','ct-node').attr('data-nodetype',n.type).attr('transform',"translate("+(n.x).toString()+","+(n.y).toString()+")");
	// To fix rendering issue in FF issue #415
	
	var img_src='images_mindmap/node-'+n.type+'.png';
	if (n.type=='modules_endtoend') img_src='images_mindmap/MM5.png';
	if($("#ct-canvas").attr('class')=='tabCreate ng-scope'){
		v.append('image').attr('height','40px').attr('width','40px').attr('class','ct-nodeIcon').attr('xlink:href',img_src).on('click',nodeCtrlClick);
	}else{
		v.append('image').attr('height','40px').attr('width','40px').attr('class','ct-nodeIcon').attr('xlink:href',img_src).on('click',nodeClick);
	}
	
	n.display_name=n.name;
	var ch=15;
	//Issue 697
	if(n.type=='testcases') ch=9;
	if((n.name.length>15 && n.type!='modules' && n.type!='modules_endtoend') || (n.name.length>9 && n.type=='testcases')){
		
		n.display_name=n.display_name.slice(0,ch)+'...';
	}
	v.append('text').attr('class','ct-nodeLabel').text(n.display_name).attr('text-anchor','middle').attr('x',20).attr('title',n.name).attr('y',50);
	v.append('title').text(n.name);
	//Condition to add the properties of reuse to the node (Currently only for testcases)
	if(node_names_tc.length>0 && node_names_tc.indexOf(n.name)>-1){
		if(node_names_tc.indexOf(n.name)==node_names_tc.lastIndexOf(n.name)){
			n.reuse='reuse';
		}else{
			n.reuse='parent';
		}
		
		//if(v.select('.ct-nodeReuse')[0][0]==null) 
		//v.append('image').attr('class','ct-nodeReuse').attr('xlink:href','images_mindmap/NEAREST.png').attr('x',10).attr('y',10);
	}
	
	
	
	if(m&&pi){
		var p=d3.select('#ct-node-'+pi.id);
		//modified params for layout change
			// switch-layout feature
			if($('#switch-layout').hasClass('vertical-layout')){
				if(!p.select('circle.ct-cRight')[0][0]){
					p.append('circle').attr('class','ct-'+pi.type+' ct-cRight ct-nodeBubble').attr('cx',20).attr('cy',55).attr('r',4).on('click',toggleNode);
				}
				v.append('circle').attr('class','ct-'+n.type+' ct-cLeft ct-nodeBubble').attr('cx',20).attr('cy',-3).attr('r',4);//.on('mousedown',moveNodeBegin).on('mouseup',moveNodeEnd);
				if(selectedTab=='tabAssign')
					v.append('circle').attr('class','ct-'+n.type+' ct-cLeft ct-nodeBubble').attr('cx',-3).attr('cy',20).attr('r',4);
				else
					v.append('circle').attr('class','ct-'+n.type+' ct-cLeft ct-nodeBubble').attr('cx',-3).attr('cy',20).attr('r',4).on('mousedown',moveNodeBegin).on('mouseup',moveNodeEnd);
			}
			else{
				if(!p.select('circle.ct-cRight')[0][0]){
					p.append('circle').attr('class','ct-'+pi.type+' ct-cRight ct-nodeBubble').attr('cx',43).attr('cy',20).attr('r',4).on('click',toggleNode);
				}
				if(selectedTab=='tabAssign')
					v.append('circle').attr('class','ct-'+n.type+' ct-cLeft ct-nodeBubble').attr('cx',-3).attr('cy',20).attr('r',4);
				else
					v.append('circle').attr('class','ct-'+n.type+' ct-cLeft ct-nodeBubble').attr('cx',-3).attr('cy',20).attr('r',4).on('mousedown',moveNodeBegin).on('mouseup',moveNodeEnd);
			}

	}
	return v;
};
var addLink = function(r,p,c){
//Modified parameters for layout change

	// switch-layout feature
	if($('#switch-layout').hasClass('vertical-layout')){
	var s=[p.x+20,p.y+55];
	var t=[c.x+20,c.y-3];
	}
	else{
	var s=[p.x+43,p.y+20];
	var t=[c.x-3,c.y+20];
	}
	var d=genPathData(s,t);
	var l=d3.select('#ct-mindMap').insert('path','g').attr('id','ct-link-'+r).attr('class','ct-link').attr('d',d);
};
//To Unassign the task of a particular node
var removeTask= function(e){
	if ($("#ct-unassignButton a").attr('class')=='disableButton') return;
	var p=d3.select(activeNode);
	p.select('.ct-nodeTask').classed('no-disp',!0);
	var pi=parseInt(p.attr('id').split('-')[2]);
	var nType=p.attr('data-nodetype');
	if(dNodes[pi].oid !=undefined && dNodes[pi].task !=null){
		unassignTask.push(dNodes[pi].oid)
	}
	d3.select('#ct-assignBox').classed('no-disp',!0);
}
var addTask = function(e){
	
	$("ct-assignTask,#ct-assignedTo,#ct-assignRevw,#ct-assignRel,#ct-assignCyc").removeClass("selectErrorBorder");
	$("#startDate,#endDate").removeClass("inputErrorBorder");
	if($("ct-assignTask option:selected").val() == "select user") {
			$("#ct-assignedTo").css('border','').addClass("inputErrorBorderFull");
			return false;
		}
	else if($("#ct-assignTask option:selected").val() == "Execute Batch" && $("#ct-executeBatch").val() == "") {
			$("#ct-executeBatch").css('border','').addClass("inputErrorBorderFull");
			return false;
		}
	else if($("#ct-assignedTo option:selected").val() == "select user") {
		$("#ct-assignedTo").css('border','').addClass("inputErrorBorderFull");
		return false;
	}
	else if($("#ct-assignRevw option:selected").val() == "select reviewer") {
		$("#ct-assignRevw").css('border','').addClass("inputErrorBorderFull");
		return false;
	}
	
	else if($("#startDate").val() == "") {
		$("#startDate").css('border','').addClass("inputErrorBorderFull");
		return false;
	}
	else if($("#endDate").val() == "") {
		$("#endDate").css('border','').addClass("inputErrorBorderFull");
		return false;
	}
	
	else if($("#ct-assignRel option:selected").val() == "select release") {
		$("#ct-assignRel").css('border','').addClass("inputErrorBorderFull");
		return false;
	}
	else if($("#ct-assignCyc option:selected").val() == "select cycle") {
		$("#ct-assignCyc").css('border','').addClass("inputErrorBorderFull");
		return false;
	}
	var ed=$("#endDate").val().split('/');
	var sd=$("#startDate").val().split('/');
	start_date=new Date(sd[2]+'-'+sd[1]+'-'+sd[0]);
	end_date=new Date(ed[2]+'-'+ed[1]+'-'+ed[0]);


	if(end_date<start_date){
		$("#endDate").css('border','').addClass("inputErrorBorderFull");
		return false;
	}
	d3.select('#ct-assignBox').classed('no-disp',!0);
	var a,b,p=d3.select(activeNode);
	var pi=parseInt(p.attr('id').split('-')[2]);
	var nType=p.attr('data-nodetype');
	tvn=0;
	if ($('.version-list') !== undefined)
	tvn=$('.version-list').val();
	var tObj={tvn:tvn,t:$('#ct-assignTask').val(),bn:$('#ct-executeBatch').val(),at:$('#ct-assignedTo').val(),rw:/*(d3.select('#ct-assignRevw')[0][0])?*/$('#ct-assignRevw').val()/*:null*/,sd:$('#startDate').val(),ed:$('#endDate').val(),re:(d3.select('#ct-assignRel')[0][0])?$('#ct-assignRel').val():null,cy:(d3.select('#ct-assignCyc')[0][0])?$('#ct-assignCyc').val():null,det:d3.select('#ct-assignDetails').property('value'),app:$('option:selected', '.project-list').attr('app-type')};
	//console.log(tObj);
	if(dNodes[pi].task){
		tObj.id=dNodes[pi].task.id;
		tObj.oid=dNodes[pi].task.oid;
		tObj.parent=dNodes[pi].task.parent;
	}
	else {
		tObj.id=null;
		tObj.oid=null;
		tObj.parent=null;
	}
	var taskflag=false;
	var errorRelCyc=false;
	var dateFlag=true;
	var reviewerFlag=true;
	if($('#startDate').val() == null || $('#endDate').val() == null || $('#startDate').val() == '' || $('#endDate').val() ==''){
		dateFlag=false;
	}
	if(tObj.rw=='select reviewer' || tObj.at=='select user'){
		reviewerFlag=false;
	}
	if(dateFlag && reviewerFlag){
		Object.keys(tObj).forEach(function(k){if(tObj[k]===undefined) tObj[k]=null;});
		//if(p.select('.ct-nodeTask')[0][0]==null) p.append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
		if(nType=="modules" || nType=="modules_endtoend"){
			if(tObj.cy != 'select cycle' && tObj.re != 'select release'){
				if(dNodes[pi].id_c!="null"){
					dNodes[pi].task={taskvn:tObj.tvn,id:tObj.id,oid:tObj.oid,batchName:tObj.bn,task:tObj.t,assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,release:tObj.re,cycle:tObj.cy,details:tObj.det,parent:(tObj.parent!=null)?tObj.parent:[dNodes[pi].id_c]};
				}
				//Logic to add tasks for the scenario
				if(dNodes[pi].children) dNodes[pi].children.forEach(function(tSc){
					if(tSc.task===undefined||tSc.task==null){
							if(dNodes[pi].id_c!='null' && tSc.id_c!='null'){
								taskflag=true;
								//Issue- 711 Assign directly to the module and see that scenario gets assign but on click of "Save" scenario gets unassign.
								tSc.task={taskvn:tObj.tvn,id:null,oid:null,task:"Execute Scenario",assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,release:tObj.re,cycle:tObj.cy,details:tObj.det,parent:(tObj.parent!=null)?tObj.parent:[dNodes[pi].id_c,tSc.id_c]};
								d3.select('#ct-node-'+tSc.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
							}
							
					}else{
							//If any of the cassandra id in parent list of the task is null then update it
							if(tSc.task.parent.indexOf(null)==-1 && tSc.task.parent!=[dNodes[pi].id_c,tSc.id_c]){
								tSc.task['updatedParent']=[dNodes[pi].id_c,tSc.id_c];
							}

					}
					if(tSc.children != undefined){				
						tSc.children.forEach(function(scr){
							if(scr.task===undefined||scr.task==null){
								if(dNodes[pi].id_c!='null' && tSc.id_c!='null' && scr.id_c!='null'){
									taskflag=true;
									scr.task={taskvn:tObj.tvn,id:null,oid:null,task:"Scrape",assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:[dNodes[pi].id_c,tSc.id_c,scr.id_c]};
									d3.select('#ct-node-'+scr.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
								}
								
							}else{
								if(scr.task.parent.indexOf(null)==-1 && scr.task.parent!=[dNodes[pi].id_c,tSc.id_c,scr.id_c]){
									scr.task['updatedParent']=[dNodes[pi].id_c,tSc.id_c,scr.id_c];
								}

							}
							
							scr.children.forEach(function(tCa){
								if(tCa.task===undefined||tCa.task==null){
									if(dNodes[pi].id_c!='null' && tSc.id_c!='null' && scr.id_c!='null' && tCa.id_c != 'null' ){
										taskflag=true;
										tCa.task={taskvn:tObj.tvn,id:null,oid:null,task:"Design",assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:[dNodes[pi].id_c,tSc.id_c,scr.id_c,tCa.id_c]};
										d3.select('#ct-node-'+tCa.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
									}
								}else{
									if(tCa.task.parent!=[dNodes[pi].id_c,tSc.id_c,scr.id_c,tCa.id_c]){
										tCa.task['updatedParent']=[dNodes[pi].id_c,tSc.id_c,scr.id_c,tCa.id_c];
									}
									taskflag=true;
								}
							});
						});
						//Removed a condition to fix assign issue in end to end flow
					}

				});
			}else{
				taskflag='';
				errorRelCyc=true;
			}
		}
		//Logic to add tasks for the scenario
		else if(nType=="scenarios"){
			var modid=dNodes[pi].parent.id_c,tscid=dNodes[pi].id_c;

				if(dNodes[pi].parent.task != null){
					var parentTask=dNodes[pi].parent.task ;
					
				
				if(tscid!='null'){
					dNodes[pi].task={taskvn:tObj.tvn,id:tObj.id,oid:tObj.oid,task:tObj.t,assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,release:parentTask.release,cycle:parentTask.cycle,details:tObj.det,parent:(tObj.parent!=null)?tObj.parent:[modid,dNodes[pi].id_c]};
					if(dNodes[pi].parent.type=='modules_endtoend') taskflag=true;
				}

				
				if(dNodes[pi].children) dNodes[pi].children.forEach(function(scr){
					//tSc.children.forEach(function(scr){
						if(scr.task===undefined||scr.task==null){
							if(modid!='null' && tscid!='null' && scr.id_c!='null'){
								taskflag=true;
								scr.task={taskvn:tObj.tvn,id:null,oid:null,task:"Scrape",assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:[modid,tscid,scr.id_c]};
								d3.select('#ct-node-'+scr.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
							}
							
						}else{
							if(scr.task.parent!=[modid,tscid,scr.id_c]){
								scr.task['updatedParent']=[modid,tscid,scr.id_c];
							}

						}
						
						scr.children.forEach(function(tCa){
							if(tCa.task===undefined||tCa.task==null){
								if(modid!='null' && tscid!='null' && scr.id_c!='null' && tCa.id_c != 'null' ){
									taskflag=true;
									tCa.task={taskvn:tObj.tvn,id:null,oid:null,task:"Design",assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:[modid,tscid,scr.id_c,tCa.id_c]};
									d3.select('#ct-node-'+tCa.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
								}
							}else{
								if(tCa.task.parent!=[modid,tscid,scr.id_c,tCa.id_c]){
									tCa.task['updatedParent']=[modid,tscid,scr.id_c,tCa.id_c];
								}
								taskflag=true;
							}
						});
					//});
				});
			}else{
				openDialogMindmap("Error",'Assign task to the module')
				return;
			}
		}
		else if(nType=="screens"){
			var modid=dNodes[pi].parent.parent.id_c,tscid=dNodes[pi].parent.id_c,scrid=dNodes[pi].id_c;
			if(dNodes[pi].id_c!='null'){
				dNodes[pi].task={taskvn:tObj.tvn,id:tObj.id,oid:tObj.oid,task:tObj.t,assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:(tObj.parent!=null)?tObj.parent:[modid,tscid,scrid]};
			}
			
			if(tObj.parent!=[modid,tscid,scrid]){
				dNodes[pi].task['updatedParent']=[modid,tscid,scrid];
			}
			if(dNodes[pi].children) dNodes[pi].children.forEach(function(tCa){
				var cTask=(tObj.t=="Scrape"||tObj.t=="Append"||tObj.t=="Compare")? "Design":"Debug";
				var tcid=tCa.id_c;
				if(tCa.task===undefined||tCa.task==null){
					if (modid !='null' && tscid !='null' && scrid!='null' && tcid!='null'){
						taskflag=true;
						tCa.task={taskvn:tObj.tvn,id:null,oid:null,task:cTask,assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:[modid,tscid,scrid,tcid]};
						d3.select('#ct-node-'+tCa.id).append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
					}
				}else{
					if(tCa.task.parent!=[modid,tscid,scrid,tcid]){
						tCa.task['updatedParent']=[modid,tscid,scrid,tcid];
					}
					taskflag=true;
				}
			});
		}
		else if(nType=="testcases"){
			var modid=dNodes[pi].parent.parent.parent.id_c,tscid=dNodes[pi].parent.parent.id_c,scrid=dNodes[pi].parent.id_c;var tcid=dNodes[pi].id_c;
			if (modid !='null' && tscid !='null' && scrid!='null' && tcid!='null'){
				taskflag=true;
				dNodes[pi].task={taskvn:tObj.tvn,id:tObj.id,oid:tObj.oid,task:tObj.t,assignedTo:tObj.at,reviewer:tObj.rw,startDate:tObj.sd,endDate:tObj.ed,details:tObj.det,parent:(tObj.parent!=null)?tObj.parent:[modid,tscid,scrid,tcid]};
				if(tObj.parent!=[modid,tscid,scrid,tcid]){
					dNodes[pi].task['updatedParent']=[modid,tscid,scrid,tcid];
				}
			}
		}
  }
  if(!(dateFlag || reviewerFlag)){
	  openDialogMindmap("Date Error", "Please select User/Reviewer and Date ")
  }
  else if(dateFlag==false){
	  openDialogMindmap("Date Error", "Please select Date")
  }else if(reviewerFlag==false){
	openDialogMindmap("Task Assignment Error", "Please select Reviewer/Assigned User")
  }
	else if (taskflag){
		if(p.select('.ct-nodeTask')[0][0]==null) p.append('image').attr('class','ct-nodeTask').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
	}else if(taskflag==false){
		openDialogMindmap("Task Assignment Error", "Please create the structure before assigning task")
	}
	if (errorRelCyc){
		openDialogMindmap("Task Assignment Error", "Please select Release/Cycle")
	}
};

var nodeClick = function(e){
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	if(isIE) activeNode=this.parentNode;
	else activeNode=this.parentElement;
	var u,v,w,f,c=d3.select('#ct-assignBox');
	var p=d3.select(activeNode);
	var pi=parseInt(p.attr('id').split('-')[2]);
	var t=p.attr('data-nodetype');
	var flag=true;
	if(t=='scenarios' && dNodes[pi].parent.type=='modules_endtoend'){
		flag=false;
	}
	if(flag){
		if(t!='testcases' && (dNodes[pi]._children != null)){
			//380-Mindmap-Unable to create node when parent node is collapsed .- Error msg changed to Expand the node
			openDialogMindmap('Error','Expand the node');
			return;
		}else if(t!='testcases' && (dNodes[pi].children == null)){
			openDialogMindmap('Error','Incomplete Flow');
			return;
		}
	}
	
	
	//if(t=='scenarios') return;
	var nt=(dNodes[pi].task!==undefined||dNodes[pi].task!=null)?dNodes[pi].task:!1;
	var tObj={t:(nt)?nt.task:'',bn:(nt)?nt.batchName:'',at:(nt)?nt.assignedTo:'',rw:(nt&&nt.reviewer!=null)?nt.reviewer:'',sd:(nt)?nt.startDate:'',ed:(nt)?nt.endDate:'',re:(nt&&nt.release!=null)?nt.release:'',cy:(nt&&nt.cycle!=null)?nt.cycle:'',det:(nt)?nt.details:''};
	d3.select('#ct-assignDetails').property('value',tObj.det);
	d3.select('#ct-assignTable').select('ul').remove();
	u=d3.select('#ct-assignTable').append('ul');
	v=u.append('li');
	v.append('span').attr('class','ct-assignItem fl-left').html('Task');
	var d = v.append('select').attr('id','ct-assignTask');
	taskAssign[t].task.forEach(function(tsk,i){
		$('#ct-assignTask').append("<option data-id='"+tsk+"' value='"+tsk+"'>"+tsk+"</option>");
	});
	if (tObj.t==null || tObj.t==""){
		tObj.t=taskAssign[t].task[0];
	}
	$("#ct-assignTask option[value='" + tObj.t + "']").attr('selected', 'selected'); 

	$("#ct-assignTask").change(function () {
            if($("#ct-assignTask").val()=='Execute Batch'){
				$('#ct-executeBatch').removeAttr("disabled");
			}else{
				$('#ct-executeBatch').attr('disabled','true');
			}
	})
	
	
	var default_releaseid='';
	taskAssign[t].attributes.forEach(function(tk){
		v=u.append('li');
		if(tk=="bn"){	
			v.append('span').attr('class','ct-assignItem fl-left').html('Batch Name');
			
			var d = v.append('input').attr('type','text').attr('id','ct-executeBatch');
			$('#ct-executeBatch').attr('value',tObj.bn);
			if(tObj.t!='Execute Batch'){
				$('#ct-executeBatch').attr('disabled','true')
			} 
			
			
		}
		if(tk=='at'){			
			var result1 = {};
			v.append('span').attr('class','ct-assignItem fl-left').html('Assigned to');
			var d = v.append('select').attr('id','ct-assignedTo');//.attr('class','assignedTo')
			
			$('#ct-assignedTo').append("<option value='select user' >Select User</option>");
			//PAssing selected projectid to the service
			dataSender({task:'populateUsers',projectId:$(".project-list").val()},function(err,result){
				if(err){ console.log(result);callback(null,err);}
				else{
					result1=JSON.parse(result);
					//alert(assignedUser);
				
						for(i=0; i<result1.userRoles.length && result1.r_ids.length; i++){
							$('#ct-assignedTo').append("<option data-id='"+result1.userRoles[i]+"' value='"+result1.r_ids[i]+"'>"+result1.userRoles[i]+"</option>");	
						}
							$("#ct-assignedTo option[value='" + tObj.at + "']").attr('selected', 'selected');					
				}
				
			});
		
		}
		else if(tk=='rw'){
			var result1 = {};
			v.append('span').attr('class','ct-assignItem fl-left').html('Reviewer');
			var d = v.append('select').attr('id','ct-assignRevw');//.attr('class','reviwedBy');
			$('#ct-assignRevw').append("<option value='select reviewer' select=selected>"+"Select Reviewer"+"</option>");
			dataSender({task:'populateUsers',projectId:$(".project-list").val()},function(err,result){
				if(err){ console.log(result);callback(null,err);}
				else{
					result1=JSON.parse(result);
					for(i=0; i<result1.userRoles.length && result1.r_ids.length; i++){
						$('#ct-assignRevw').append("<option data-id='"+result1.userRoles[i]+"' value='"+result1.r_ids[i]+"'>"+result1.userRoles[i]+"</option>");
					}
					$("#ct-assignRevw option[value='" + tObj.rw + "']").attr('selected', 'selected'); 
					
				}
				
			});
		 }
		else if(tk=='sd'){
			v.append('span').attr('class','ct-assignItem fl-left').html('Start Date');
			w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right dateBoxSd');
			// w.append('input').attr('class','ct-asValBox btn dropdown-toggle').attr('data-toggle','dropdown').append('a').attr('id','ct-assignStart').html(tObj.sd);
			// w.append('button').attr('class','ct-asValBoxIcon ct-asItemCal btn dropdown-toggle').attr('data-toggle','dropdown').append('img').attr('src','images_mindmap/ic-datepicker.png').attr('alt','calIcon');
			w.append('input').attr('class', 'datepicker').attr('id','startDate');
		    //$("img[src='images_mindmap/ic-datepicker.png']:not(.dateIcon)").remove();
			$(".dateBoxSd").append("<img id='dateIconStartDate' class='dateIcon' src='images_mindmap/ic-datepicker.png' />").attr('alt','calIcon');
					$('#startDate').datepicker({
						 format: "dd/mm/yyyy",
						 todayHighlight: true,
                         autoclose: true,
						 startDate: new Date()
					});
			$(document).on('blur', '#startDate',function() {
				$('#startDate').val($(this).val());
			});
			$(document).on('click','#dateIconStartDate', function() {
					$("#startDate").datepicker("show");
			});
			f=w.append('ul').attr('class','ct-asValCalBox dropdown-menu');//.on('click',$('.ct-asValBoxIcon.ct-asItemCal.btn.dropdown-toggle').datepicker());
			if(tObj.sd != ''){
				$("#startDate").attr('disabled','disabled');
			}
			$("#startDate").val(tObj.sd);
							
		}
		else if(tk=='ed'){
			v.append('span').attr('class','ct-assignItem fl-left').html('End Date');
			$(".fl-right").append("<img src='images_mindmap/ic-datepicker.png' />").attr('alt','calIcon');
			w=v.append('div').attr('class','ct-assignItem btn-group dropdown fl-right dateBoxEd');
			w.append('input').attr('class', 'datepicker').attr('id','endDate');
			$(".dateBoxEd").append("<img id='dateIconEndDate' class='dateIcon' src='images_mindmap/ic-datepicker.png' />").attr('alt','calIcon');
			    $('#endDate').datepicker({
						  format: "dd/mm/yyyy",
						  todayHighlight: true,
                          autoclose: true,
						  startDate: new Date()
					});
			$(document).on('click','#dateIconEndDate', function() {
					$("#endDate").datepicker("show");
			});
			f=w.append('ul').attr('class','ct-asValCalBox dropdown-menu');//.on('click',$('.ct-asValBoxIcon.ct-asItemCal.btn.dropdown-toggle').datepicker());
			$("#endDate").val(tObj.ed);
		}
		else if(tk=='re'){
			var result1 = {};
			v.append('span').attr('class','ct-assignItem fl-left').html('Release');
					var d = v.append('select').attr('id','ct-assignRel');
					//'d4965851-a7f1-4499-87a3-ce53e8bf8e66'
					$('#ct-assignRel').append("<option value='select release' select=selected>"+"Select release"+"</option>");
					dataSender({task:'populateReleases',projectId:$(".project-list").val()},function(err,result){
						if(err){ releaseResult=err;console.log(result);callback(null,err);}
						
						else{
							
							result1=JSON.parse(result);
							releaseResult = result1;
							default_releaseid='';
							for(i=0; i<result1.r_ids.length && result1.rel.length; i++){
								$('#ct-assignRel').append("<option data-id='"+result1.rel[i]+"' value='"+result1.r_ids[i]+"'>"+result1.rel[i]+"</option>");
							}
							$('#ct-assignRel').change(function(){
								default_releaseid=$('#ct-assignRel').val();
								loadCycles();
							});
							//var selectedRel=result1.r_ids[0];
							var selectedRel='select release';
							if(tObj.re!=""){
								selectedRel=tObj.re;
								//672 Mindmap - Cycle selected under execution task is getting reset to default value after save
								default_releaseid=tObj.re;
							}
							$("#ct-assignRel option[value='" + selectedRel + "']").attr('selected', 'selected'); 
							var result2 = {};
							v.append('span').attr('class','ct-assignItem fl-left').html('Cycle');
							var d = v.append('select').attr('id','ct-assignCyc');
							$('#ct-assignCyc').append("<option value='select cycle' select=selected>"+"Select cycle"+"</option>");
							//'46974ffa-d02a-49d8-978d-7da3b2304255'
							dataSender({task:'populateCycles',relId:default_releaseid},function(err,result){
								if(err){ 
									//console.log(err);
									callback(null,err);
								}
								else{
									result2=JSON.parse(result);
									for(i=0; i<result2.c_ids.length && result2.cyc.length; i++){
										$('#ct-assignCyc').append("<option data-id='"+result2.cyc[i]+"' value='"+result2.c_ids[i]+"'>"+result2.cyc[i]+"</option>");
									}
									 //var selectedCyc=result2.c_ids[0];
									var selectedCyc='select cycle';
									if(tObj.cy!=""){
										selectedCyc=tObj.cy;
									}
									$("#ct-assignCyc option[value='" + selectedCyc + "']").attr('selected', 'selected'); 
								}
								
							});
							
						}


						
					});
					
					

		}

	});
	//var cSize=getElementDimm(c);
	// Removed assgin box overflow (Himanshu)
	var cSize=[268,386];
	if(t=='modules' || t=='modules_endtoend') cSize=[268,452];
	//var cSize1=[270,386];
	var canvSize=getElementDimm(d3.select("#ct-mapSvg"));
	var split_char=',';
	if(isIE) split_char=' ';
	var l=p.attr('transform').slice(10,-1).split(split_char);
	l=[(parseFloat(l[0])+50)*cScale+cSpan[0],(parseFloat(l[1])-20)*cScale+cSpan[1]];
	if(canvSize[0]-l[0]<cSize[0]) l[0]=l[0]-cSize[0]-60*cScale;
	if(canvSize[1]-l[1]<cSize[1]) l[1]=canvSize[1]-cSize[1]-10*cScale;
	c.style('top',l[1]+'px').style('left',l[0]+'px').classed('no-disp',!1);


	if(l[1]<0)
		l[1]=0;
	else if(l[1]>canvSize[1]-cSize[1])
		l[1]=(canvSize[1]-cSize[1])-150;

	c.style('top',l[1]+'px').style('left',l[0]+'px').classed('no-disp',!1);
	
	//condition to disable unassign task button
	setTimeout(function(){
		$('#ct-unassignButton a').addClass("disableButton");
		
		 if(dNodes[pi].task!=null && dNodes[pi].task!=undefined && dNodes[pi].task.oid!=null){
			$('#ct-unassignButton a').removeClass("disableButton");
		}	
	},30)
	
	
};

function loadCycles(){
	$('#ct-assignCyc').empty();
	$('#ct-assignCyc').append("<option value='select cycle' select=selected>"+"Select cycle"+"</option>");
							//'46974ffa-d02a-49d8-978d-7da3b2304255'
	dataSender({task:'populateCycles',relId:$("#ct-assignRel").val()},function(err,result){
								console.log('In CYC ',$("#ct-assignRel").val());
								if(err){ 
									callback(null,err);
								}
								else{
									result2=JSON.parse(result);
									for(i=0; i<result2.c_ids.length && result2.cyc.length; i++){
										$('#ct-assignCyc').append("<option data-id='"+result2.cyc[i]+"' value='"+result2.c_ids[i]+"'>"+result2.cyc[i]+"</option>");
									}
									$("#ct-assignCyc option[value='" + result2.cyc[0] + "']").attr('selected', 'selected'); 
								}
								
							});
}

var nodeCtrlClick = function(e){
	d3.select('#ct-inpBox').classed('no-disp',!0);
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	if(isIE) activeNode=this.parentNode;
	else activeNode=this.parentElement;
	var p=d3.select(activeNode);
	var t=p.attr('data-nodetype');
	var split_char=',';
	if(isIE) split_char=' ';
	var l=p.attr('transform').slice(10,-1).split(split_char);
	l=[(parseFloat(l[0])+40)*cScale+cSpan[0],(parseFloat(l[1])+40)*cScale+cSpan[1]];
	var c=d3.select('#ct-ctrlBox').style('top',l[1]+'px').style('left',l[0]+'px').classed('no-disp',!1);
	c.select('p.'+faRef.plus).classed('ct-ctrl-inactive',!1);
	c.select('p.'+faRef.delete).classed('ct-ctrl-inactive',!1);
	if(t=='modules'){
		c.select('p.'+faRef.plus+' .ct-tooltiptext').html('Create Scenarios');
		c.select('p.'+faRef.edit+' .ct-tooltiptext').html('Edit Module');
		//513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
		c.select('p.'+faRef.delete).classed('ct-ctrl-inactive',!0);
		//c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Module');
	}
	else if(t=='scenarios'){
		c.select('p.'+faRef.plus+' .ct-tooltiptext').html('Create Screens');
		c.select('p.'+faRef.edit+' .ct-tooltiptext').html('Edit Scenario');
		c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Scenario');
	}
	else if(t=='screens'){
		c.select('p.'+faRef.plus+' .ct-tooltiptext').html('Create Testcases');
		c.select('p.'+faRef.edit+' .ct-tooltiptext').html('Edit Screen');
		c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Screen');
	}
	else if(t=='testcases'){
		c.select('p.'+faRef.plus).classed('ct-ctrl-inactive',!0);
		c.select('p.'+faRef.edit+' .ct-tooltiptext').html('Edit Testcase');
		c.select('p.'+faRef.delete+' .ct-tooltiptext').html('Delete Testcase');
	}
};

var getNewPosition=function(node,pi,arr_co){
	// Switch_layout functionality
	var layout_vertical=$('#switch-layout').hasClass('vertical-layout');
	if(dNodes[pi].children.length >0){
			index=dNodes[pi].children.length-1;
			if(layout_vertical)
				new_one={x:parseInt(dNodes[pi].children[index].x)+80,y:parseInt(dNodes[pi].children[index].y)};
			else
				new_one={x:parseInt(dNodes[pi].children[index].x),y:parseInt(dNodes[pi].children[index].y+80)};
			
			if(JSON.stringify(arr_co).indexOf(JSON.stringify(new_one))>-1){
				if(layout_vertical){
				node.x=dNodes[pi].children[index].x+160;
				node.y=dNodes[pi].children[index].y;
				}
				else{
				node.y=dNodes[pi].children[index].y+160;
				node.x=dNodes[pi].children[index].x;
				}

			}else{
				//layout_change
				if(layout_vertical){
				node.x=dNodes[pi].children[index].x+80;
				node.y=dNodes[pi].children[index].y;

				}
				else{
				node.y=dNodes[pi].children[index].y+80;
				node.x=dNodes[pi].children[index].x;
				}

			}
		
			
	}else{
			
			if(dNodes[pi].parent != null){
				arr=dNodes[pi].parent.children;
				index=dNodes[pi].parent.children.length-1;
				//new_one={x:parseInt(arr[index].x),y:parseInt(arr[index].y)+125};

				if(layout_vertical){
				new_one={x:parseInt(dNodes[pi].x),y:parseInt(dNodes[pi].y)+125};
				}
				else{
				new_one={x:parseInt(dNodes[pi].x)+125,y:parseInt(dNodes[pi].y)};
				}

				if(JSON.stringify(arr_co).indexOf(JSON.stringify(new_one))>-1){
					//layout_change
					if(layout_vertical){
					node.x=arr[index].x+80;
					node.y=arr[index].y+125;
					}
					else{
					node.y=arr[index].y+80;
					node.x=arr[index].x+125;
					}

				}else{
					//layout_Change
					if(layout_vertical){
					node.x=dNodes[pi].x;
					node.y=dNodes[pi].y+125;
					}
					else{
					node.y=dNodes[pi].y;
					node.x=dNodes[pi].x+125;
					}
				}
			}else{
				//layout_change
				if(layout_vertical){
				node.x=dNodes[pi].x;
				node.y=dNodes[pi].y+125;
				}
				else{
				node.y=dNodes[pi].y;
				node.x=dNodes[pi].x+125;
				}
			}
			
	}
	return node;
}

var createNode = function(e){
	//If module is in edit mode, then return do not add any node
	if(d3.select('#ct-inpBox').attr('class')=="") return;

	d3.select('#ct-inpBox').classed('no-disp',!0);
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	var p=d3.select(activeNode);
	var pt=p.attr('data-nodetype');
	if(pt=='testcases') return;
	var pi = p.attr('id').split('-')[2];
	
	if(dNodes[pi]._children == null){
		if(dNodes[pi].children == undefined) dNodes[pi]['children']=[];
		var nNext={'modules':['Scenario',1],'scenarios':['Screen',2],'screens':['Testcase',3]};
		var mapSvg=d3.select('#ct-mapSvg');
		var w=parseFloat(mapSvg.style('width'));
		var h=parseFloat(mapSvg.style('height'));
		//name:nNext[pt][0]+'_'+nCount[nNext[pt][1]]
		var arr_co=[];
		dNodes.forEach(function(d,i){
			var objj={x:parseInt(d.x),y:parseInt(d.y)};
			arr_co.push(objj);
			
		});
	// switch-layout feature
		if($('#switch-layout').hasClass('vertical-layout')){
		node={id:uNix,childIndex:'',path:'',name:nNext[pt][0]+'_'+nCount[nNext[pt][1]],type:(nNext[pt][0]).toLowerCase()+'s',y:h*(0.15*(1.34+nNext[pt][1])+Math.random()*0.1),x:90+30*Math.floor(Math.random()*(Math.floor((w-150)/80))),children:[],parent:dNodes[pi]};
		}
		else{
		node={id:uNix,childIndex:'',path:'',name:nNext[pt][0]+'_'+nCount[nNext[pt][1]],type:(nNext[pt][0]).toLowerCase()+'s',y:h*(0.15*(1.34+nNext[pt][1])+Math.random()*0.1),x:90+30*Math.floor(Math.random()*(Math.floor((w-150)/80))),children:[],parent:dNodes[pi]};		
		}

		node=getNewPosition(node,pi,arr_co);
		var curNode=node;
		dNodes.push(node);nCount[nNext[pt][1]]++;
		dNodes[pi].children.push(dNodes[uNix]);
		dNodes[uNix].childIndex=dNodes[pi].children.length;

		var currentNode=addNode(dNodes[uNix],!0,dNodes[pi]);
		if(currentNode != null){
			childNode=currentNode;
			
			link={id:uLix,source:dNodes[pi],target:dNodes[uNix]};
			dLinks.push(link);
			addLink(uLix,dNodes[pi],dNodes[uNix]);
			uNix++;uLix++;
			
			//By default when a node is created it's name should be in ediatable mode
			CreateEditFlag=true;
			editNode(e,currentNode);
		}
		
	}else{
		openDialogMindmap('Error','Expand the node');
	}
	
};
var editNode = function(e,node){
	
	$('#ct-inpAct').removeClass('errorClass');
	d3.select('#ct-inpAct').classed('no-disp',!1);
	e=e||window.event;
	e.cancelbubble=!0;
	if(e.stopPropagation) e.stopPropagation();
	//logic to create the node in editable mode
	if(node==0){
		childNode=null;
		var p=d3.select(activeNode);
	}else var p=childNode;
	var pi = p.attr('id').split('-')[2];
	var t=p.attr('data-nodetype');
	var split_char=',';
	if(isIE) split_char=' ';
	var l=p.attr('transform').slice(10,-1).split(split_char);
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	if(p.select('.ct-nodeTask')[0][0] != null){
		var msg='Unassign the task to rename';
		if(t=='screens'){
			msg='Unassign the task to rename. And unassign the corresponding testcases tasks';
		}
		openDialogMindmap('Rename Error',msg);
		return;
	}

	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	var name='';
	//By default when a node is created it's name should be in ediatable mode
	
	name=dNodes[pi].name;
	//name=p.text();
	l=[(parseFloat(l[0])-20)*cScale+cSpan[0],(parseFloat(l[1])+42)*cScale+cSpan[1]];
// If editing right after the node is added and node goes beyond the screen size

	cSize=getElementDimm(d3.select("#ct-mapSvg"));
	if(CreateEditFlag==true && l[1]>cSize[1]){
		CreateEditFlag=false;
		cSpanX=cSpan[0];
		cSpanY=cSpan[1];
		var temp=l[1];
		while(temp>cSize[1]){
			temp=temp/2;
			cSpanY=cSpanY-temp;
		}

		
		d3.select('#ct-mindMap').attr('transform', "translate("+cSpanX+","+cSpanY+")scale("+cScale+")");
		//cSpan[0]=cSpan[0]-l[0]/2 //after edit mindmap doesn't move to orignal position
		l=p.attr('transform').slice(10,-1).split(split_char);
		l=[(parseFloat(l[0])-20)*cScale+cSpanX,(parseFloat(l[1])+42)*cScale+cSpanY];
	}
	
	// If created node is beyond screen size on horizontal side
	if(CreateEditFlag==true && l[0]>cSize[0]){
		CreateEditFlag=false;
		cSpanX=cSpan[0];
		cSpanY=cSpan[1];
		var temp=l[0];
		while(temp>cSize[0]){
			temp=temp/2;
			cSpanX=cSpanX-temp;
		}
	}


	d3.select('#ct-inpBox').style('top',l[1]+'px').style('left',l[0]+'px').classed('no-disp',!1);
	d3.select('#ct-inpPredict').property('value','');
	d3.select('#ct-inpAct').attr('data-nodeid',null).property('value',name).node().focus();
	d3.select('#ct-inpSugg').classed('no-disp',!0);
};

var deleteNode = function(e){
	//If module is in edit mode, then return do not add any node
	if(d3.select('#ct-inpBox').attr('class')=="") return;
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	var s=d3.select(activeNode);
	//513-'Mindmap: When we delete an existing Module and create another module in the same work space  then a new Module instance is being appended .
	var t=s.attr('data-nodetype');
	if(t=='modules') return;
	var sid = s.attr('id').split('-')[2];
	var p=dNodes[sid].parent;
	recurseDelChild(dNodes[sid]);
	for(j=dLinks.length-1;j>=0;j--){
		if(dLinks[j].target.id==sid){
			d3.select('#ct-link-'+dLinks[j].id).remove();
			dLinks[j].deleted=!0;
			break;
		}
	}
	p.children.some(function(d,i){
		if(d.id==sid){
			//var nodeDel=dNodes.pop(sid);
			p.children.splice(i,1);
			return !0;
		}
		return !1;
	});
	if(p.children.length==0) d3.select('#ct-node-'+p.id).select('.ct-cRight').remove();
};
var recurseDelChild = function(d){
	if(d.children) d.children.forEach(function(e){recurseDelChild(e);});
	d.parent=null;
	d.children=null;
	d.task=null;
	d3.select('#ct-node-'+d.id).remove();
	deletednode_info.push(d);
	if(d.oid != undefined){
		deletednode.push(d.oid)
	}
	for(j=dLinks.length-1;j>=0;j--){
		if(dLinks[j].source.id==d.id){
			d3.select('#ct-link-'+dLinks[j].id).remove();
			dLinks[j].deleted=!0;
		}
	}
};
var moveNode = function(e){
	e=e||window.event;
	//#886 Unable to rearrange nodes in e2e
	d3.select('.ct-movable').attr('transform', "translate("+parseFloat((e.pageX-14-cSpan[0])/cScale+2)+","+parseFloat((e.pageY-188-cSpan[1])/cScale-20)+")");
};
var moveNodeBegin = function(e){
	e=e||window.event;
	e.cancelbubble=!0;
	//Issue #763 is fixed,Mindmap - If node is moved in edit mode ,then Textbox is not been moved with the Node.
	d3.select('#ct-inpAct').classed('no-disp',!0);
	if(e.stopPropagation) e.stopPropagation();
	//To check whether browser Is IE or not issue #415
	var isIE = /*@cc_on!@*/false || !!document.documentMode;
	var p=d3.select(this.parentElement);
	if (isIE) { 
		var p=d3.select(this.parentNode);
	}
	var pi=p.attr('id').split('-')[2];
	temp={s:[],t:""};
	dLinks.forEach(function(d,i){
		if(d.source.id==pi){
			temp.s.push(d.id);
			d3.select('#ct-link-'+d.id).remove();
		}
		else if(d.target.id==pi){
			temp.t=d.id;
			d3.select('#ct-link-'+d.id).remove();
		}
	});
	p.classed('ct-movable',!0);
	d3.select('#ct-mapSvg').on('mousemove.nodemove',moveNode);
};
var moveNodeEnd = function(e){
	d3.select('#ct-mapSvg').on('mousemove.nodemove',null);
	var isIE = /*@cc_on!@*/false || !!document.documentMode;
	var p=d3.select(this.parentElement);
	var split_char=',';
	if (isIE) { 
		var p=d3.select(this.parentNode);
		split_char=' ';
	}
	
	var pi=p.attr('id').split('-')[2];
	var l=p.attr('transform').slice(10,-1).split(split_char);
	//Logic to implement rearranging of nodes
	var curNode=dNodes[pi];
	//logic changed to the change in layout
	var changeOrderRight = function(curNode,ci,totalChildren){
		var counter=-1;
		var flag=false;
		totalChildren.forEach(function(a,i){
			if(ci<=(i+1)){
				return false;
			}
//			Layout_change
//			if(l[0]<a.x){
	// switch-layout feature
		if($('#switch-layout').hasClass('vertical-layout')){
			if(l[0]<a.x){
				if(counter==-1) counter=(i+1);
				
				a.childIndex++;
				curNode.childIndex=counter;
			}						
		}
		else{
			if(l[1]<a.y){
				if(counter==-1) counter=(i+1);
				
				a.childIndex++;
				curNode.childIndex=counter;
			}			
		}

		});
	};
	var changeOrderLeft = function(curNode,ci,totalChildren){
		var counter=0;
		var flag=false;
		totalChildren.forEach(function(a,ci){
//			Layout_change
//			if(l[0]>a.x){
	// switch-layout feature
		if($('#switch-layout').hasClass('vertical-layout')){
			if(l[0]>a.x){
				counter=(ci+1);
				a.childIndex--;
				curNode.childIndex=counter;
			}
		}
		else
		{
			if(l[1]>a.y){
				counter=(ci+1);
				a.childIndex--;
				curNode.childIndex=counter;
			}
		}
		});
	};
	var currentChildIndex=curNode.childIndex;
	var totalChildren=curNode.parent.children;
	if(currentChildIndex!=totalChildren.indexOf(curNode)+1){
		currentChildIndex=totalChildren.indexOf(curNode)+1

	}
	//layout change
//	if(l[0]<curNode.x){
	// switch-layout feature
	if($('#switch-layout').hasClass('vertical-layout')){
	if(l[0]<curNode.x){
		//alert('moved up');
		changeOrderRight(curNode,currentChildIndex,totalChildren);
	}else{
		//alert('moved down');
		changeOrderLeft(curNode,currentChildIndex,totalChildren);
		}
	}
	else{
	if(l[1]<curNode.y){
		//alert('moved up');
		changeOrderRight(curNode,currentChildIndex,totalChildren);
	}else{
		//alert('moved down');
		changeOrderLeft(curNode,currentChildIndex,totalChildren);
		}

	}
	dNodes[pi].x=parseFloat(l[0]);
	dNodes[pi].y=parseFloat(l[1]);
	addLink(temp.t,dLinks[temp.t].source,dLinks[temp.t].target);
	var v=(dNodes[pi].children)?!1:!0;
	
	//Issue fixed #374: 'Mindmap - Blank nodes are retained if we delete the connected nodes'
	temp.s.forEach(function(d){
		if(deletednode_info.indexOf(dLinks[d].target)==-1){
			addLink(d,dLinks[d].source,dLinks[d].target);
			d3.select('#ct-link-'+d).classed('no-disp',v);
		}
			
	});
	p.classed('ct-movable',!1);
};
var toggleNode = function(e){
	var isIE = /*@cc_on!@*/false || !!document.documentMode;
	var p=d3.select(this.parentElement);
	if (isIE) { 
		var p=d3.select(this.parentNode);
	}
	var pi = p.attr('id').split('-')[2];
	if(dNodes[pi].children){
		p.select('.ct-cRight').classed('ct-nodeBubble',!1);
		dNodes[pi]._children=dNodes[pi].children;
		dNodes[pi].children=null;
		recurseTogChild(dNodes[pi],!0);
	}
	else if(dNodes[pi]._children){
		p.select('.ct-cRight').classed('ct-nodeBubble',!0);
		dNodes[pi].children=dNodes[pi]._children;
		dNodes[pi]._children=null;
		recurseTogChild(dNodes[pi],!1);
	}
};
var recurseTogChild = function(d,v){
	if(d.children) d.children.forEach(function(e){
		recurseTogChild(e,v);
		d3.select('#ct-node-'+e.id).classed('no-disp',v);
		for(j=dLinks.length-1;j>=0;j--){
			if(dLinks[j].source.id==d.id){
				d3.select('#ct-link-'+dLinks[j].id).classed('no-disp',v);
			}
		}
	});
	else if(d._children) d._children.forEach(function(e){
		recurseTogChild(e,!0);
		d3.select('#ct-node-'+e.id).classed('no-disp',!0);
		for(j=dLinks.length-1;j>=0;j--){
			if(dLinks[j].source.id==d.id){
				d3.select('#ct-link-'+dLinks[j].id).classed('no-disp',!0);
			}
		}
	});
};
var validNodeDetails = function(value,p){
	var nName,flag=!0;
	nName=value;
	//var specials=/[*|\":<>[\]{}`\\()'!;@&$~#%^-]/;
	var regex = /^[a-zA-Z0-9_]*$/;;
	if (nName.length==0 || nName.length>40|| nName.indexOf('_')<0 || !(regex.test(nName))){
		$('#ct-inpAct').addClass('errorClass');
		flag=!1;
	}
	return flag;
};


var inpChange = function(e){
	console.log('inpchange executed')
	var inp=d3.select('#ct-inpAct');
	var val=inp.property('value');
	if(val=='Screen_0' || val=='Scenario_0' || val=='Testcase_0' ){
		$('#ct-inpAct').addClass('errorClass');
		return;
	} 
	if(!validNodeDetails(val,this)) return;
	//if(!validNodeDetails(this)) return;
	if(childNode!=null){
		var p=childNode;
	 }else{
		var p=d3.select(activeNode);
	}
	var pi=p.attr('id').split('-')[2];
		var pt=p.select('.ct-nodeLabel');
		var t=p.attr('data-nodetype');
	if(!d3.select('#ct-inpSugg').classed('no-disp') && temp && temp.length>0) return;
	if(dNodes[pi].id_n){
		dNodes[pi].original_name=pt.attr('title');
		dNodes[pi].rnm=!0;
	} 
	if(t=='screens' && scrList[inp.attr('data-nodeid')]!==undefined){
		//The below line leads to duplicate id_n of nodes when the node name is selected from suggestions list (only via mouse click)
		//dNodes[pi].id_n=scrList[inp.attr('data-nodeid')].id_n;
		dNodes[pi].name=scrList[inp.attr('data-nodeid')].name;
		pt.text(dNodes[pi].name);
		d3.select('#ct-inpBox').classed('no-disp',!0);
	}
	else if(t=='testcases' && tcList[inp.attr('data-nodeid')]!==undefined){
		//The below line leads to duplicate id_n of nodes when the node name is selected from suggestions list (only via mouse click)
		//dNodes[pi].id_n=tcList[inp.attr('data-nodeid')].id_n;
		dNodes[pi].name=tcList[inp.attr('data-nodeid')].name;
		pt.text(dNodes[pi].name);
		d3.select('#ct-inpBox').classed('no-disp',!0);
	}
	else{
		dNodes[pi].name=val;
		pt.text(dNodes[pi].name);
		d3.select('#ct-inpBox').classed('no-disp',!0);
	}
	zoom.event(d3.select('#ct-mapSvg'));
};
var inpKeyUp = function(e){
	e=e||window.event;
	temp=[];
	var t,list;
	//To fix issue with suggestions
	if(childNode!=null){
		var p=childNode;
	 }else{
		var p=d3.select(activeNode);
	}
	//var p=d3.select(activeNode);
	var val=d3.select(this).property('value');
	var iul=d3.select('#ct-inpSugg');
	if(e.keyCode==13) {
		inpChange();			
		return;
	}
	if(val.indexOf('_')==-1) {
		iul.classed('no-disp',!0);
		var isIE = /*@cc_on!@*/false || !!document.documentMode;
		if (isIE) { 
			d3.select(this.parentNode).select('#ct-inpPredict').property('value','');
		}else d3.select(this.parentElement).select('#ct-inpPredict').property('value','');
		
		return;
	}
	t=p.attr('data-nodetype');
	//if(t == 'scenarios') list = scenarioList;
	if(t=='screens') list=scrList;
	else if(t=='testcases') list=tcList;
	else return;
	iul.selectAll('li').remove();
	list.forEach(function(d,i){
		var s=d.name.toLowerCase();
		if(s.lastIndexOf(val.toLowerCase(),0)===0){
			temp.push(i);
			if(d.name.length>23) s=d.name.slice(0,23)+"...";
			else s=d.name;
			iul.append('li').attr('class','divider');
			iul.append('li').append('a').attr('data-nodeid',i).attr('data-nodename',d.name).html(s).on('click',function(){
				var k=d3.select(this);
				d3.select('#ct-inpSugg').classed('no-disp',!0);
				d3.select('#ct-inpPredict').property('value','');
				d3.select('#ct-inpAct').attr('data-nodeid',k.attr('data-nodeid')).property('value',k.attr('data-nodename')).node().focus();
			});
		}
	});
	if(temp.length>0 && val!=list[temp[0]].name){
		if(e.keyCode==39){
			iul.classed('no-disp',!0);
			d3.select('#ct-inpPredict').property('value','');
			d3.select(this).attr('data-nodeid',temp[0]).property('value',list[temp[0]].name);
		}
		else{
			iul.select('li.divider').remove();
			iul.classed('no-disp',!1);
			d3.select(this).attr('data-nodeid',null);
			if(isIE) d3.select(this.parentNode).select('#ct-inpPredict').property('value',list[temp[0]].name);
			else d3.select(this.parentElement).select('#ct-inpPredict').property('value',list[temp[0]].name);
		}
	}
	else{
		iul.classed('no-disp',!0);
		d3.select(this).attr('data-nodeid',null);
		if(isIE) d3.select(this.parentNode).select('#ct-inpPredict').property('value','');
		else d3.select(this.parentElement).select('#ct-inpPredict').property('value','');
	}
};
var treeIterator = function(c,d,e){
	c.push({id:d.id,childIndex:d.childIndex,id_c:(d.id_c)?d.id_c:null,id_n:(d.id_n)?d.id_n:null,oid:(d.oid)?d.oid:null,name:d.name,type:d.type,pid:(d.parent)?d.parent.id:null,pid_c:(d.parent)?d.parent.id_c:null,task:(d.task)?d.task:null,renamed:(d.rnm)?d.rnm:!1,orig_name:(d.original_name)?d.original_name:null});
	if(d.children&&d.children.length>0) d.children.forEach(function(t){e=treeIterator(c,t,e);});
	else if(d._children&&d._children.length>0) d._children.forEach(function(t){e=treeIterator(c,t,e);});
	else if(d.type!='testcases') return !0;
	return e;
};

var submit_task=function(e){
	var taskinfo=JSON.parse(window.localStorage['_CT']);
	var taskid=taskinfo.subTaskId;
	//alert(taskinfo.subTaskId);
	dataSender({task:'reviewTask',prjId:$(".project-list").val(),taskId:taskid,userId:userid},function(err,result){
		if(err) console.log(result);
		else{
			console.log(result);
			if (result=='fail'){
				openDialogMindmap("Task Submission Error", "Reviewer is not assigned !")
			}else if(result=='Tasksubmitted'){
				openDialogMindmap("Task Submission Error", "Task Already Submitted!")
			}else{
				openDialogMindmap("Task Submission Success", "Task Submitted scucessfully!")
			}
		}
	});
}

var actionEvent = function(e){
	var selectedTab = window.localStorage['tabMindMap'];
	var s=d3.select(this);
	var cur_module=null;
	var error=!1,mapData=[],flag=0,alertMsg;
	error=treeIterator(mapData,dNodes[0],error);
	if(dNodes[0].type=='modules_endtoend'){
		cur_module='end_to_end';
		error=false;
	} 
	// if(error){
	// 	openDialogMindmap("Error", "Mindmap flow must be complete! Modules -> Scenarios -> Screens -> Testcases")
	// 	//$('#Mindmap_error').modal('show');
	// 	return;
	// }
	if(s.attr('id')=='ct-saveAction'){
		flag=10;
		d3.select('#ct-inpBox').classed('no-disp',!0);
		saveFlag=true;
		$('#ct-createAction').removeClass('disableButton');
		
	}
	else if(s.attr('id')=='ct-createAction'){
		if(error){
			openDialogMindmap("Error", "Mindmap flow must be complete! Modules -> Scenarios -> Screens -> Testcases")
			//$('#Mindmap_error').modal('show');
			return;
		}
		flag=20;
		d3.select('#ct-inpBox').classed('no-disp',!0);
		
	}
	if(flag==0) return;
	if(s.classed('no-access')) return;
	s.classed('no-access',!0);
	var userInfo =  JSON.parse(window.localStorage['_UI']);
	var username = userInfo.username;
	if($('.project-list').val()==null){
		openDialogMindmap('Error','No projects is assigned to User');
		return !1;
	}
	var from_v=to_v=0;
	if ($('.version-list') !== undefined)
	from_v=to_v=$('.version-list').val();
	dataSender({task:'writeMap',data:{write:flag,userRole:user_role,vn_from: from_v, vn_to: to_v,tab:cur_module,map:mapData,user_name:username,abc:deletednode,xyz:unassignTask,prjId:$('.project-list').val(),relId:$('#ct-assignRel').val(),cycId:$('#ct-assignCyc').val()},role:user_role,versioning:versioning_enabled},function(err,result){
		s.classed('no-access',!1);
		if(err){
			console.log(result);
			if(result.indexOf('Schema.ConstraintValidationFailed')>-1){
				openDialogMindmap('Save error','Module names cannot be duplicate');
			}
			else{
				openDialogMindmap('Save error','Failed to save data');
			}
			
		} 
		else{
			//alert(alertMsg);
			var res=JSON.parse(result);
			if(flag==10){

			 mapSaved=!0;
			var mid,sts=allMMaps.some(function(m,i){
				if(m.id_n==res.id_n) {
					mid=i;
					allMMaps[i]=res;
					return !0;
				}
				return !1;
			});
			if(!sts){
				mid=allMMaps.length;
				allMMaps.push(res);
				var node=d3.select('.ct-nodeBox').append('div').attr('class','ct-node fl-left').attr('data-mapid',mid).attr('title',res.name).on('click',loadMap);
				node.append('img').attr('class','ct-nodeIcon').attr('src','images_mindmap/node-modules-no.png').attr('alt','Module').attr('aria-hidden',true);
				node.append('span').attr('class','ct-nodeLabel').html(res.name.replace(/_/g,' '));
			}
			setModuleBoxHeight();
			if(selectedTab=='tabCreate') populateDynamicInputList();
			
			clearSvg();
			treeBuilder(allMMaps[mid]);
			unassignTask=[];
			
			if(selectedTab=='tabAssign'){
				openDialogMindmap("Success", "Tasks saved successfully");
			}else{
				openDialogMindmap("Success", "Data saved successfully");
			}
			var vn='';
			if ($('.version-list')!== undefined)
			from_v=to_v=$('.version-list').val()

			 dataSender({task:'getModules',tab:window.localStorage['tabMindMap'],prjId:$(".project-list").val(),versioning:versioning_enabled,version:parseFloat(from_v)},function(err,result){
				 	if(err) console.log(result);
				 	else{
						// console.log(result);
						var nodeBox=d3.select('.ct-nodeBox');
						$(nodeBox[0]).empty();
						allMMaps=JSON.parse(result);
						allMMaps.forEach(function(e,i){
							//var t=e.name.replace(/_/g,' ');
							var img_src='images_mindmap/node-modules-no.png';
							if (e.type=='modules_endtoend') img_src='images_mindmap/MM5.png';
							var t = $.trim(e.name);
							var node=nodeBox.append('div').attr('class','ct-node fl-left').attr('data-mapid',i).attr('title',t).on('click',loadMap);
							node.append('img').attr('class','ct-nodeIcon').attr('src',img_src).attr('alt','Module').attr('aria-hidden',true);
							node.append('span').attr('class','ct-nodeLabel').html(t);
						});
						if(selectedTab=='tabCreate') 
						populateDynamicInputList();
						setModuleBoxHeight();
				 	}
				});
			//$('#Mindmap_save').modal('show');
		}
if(flag==20){
	if(!saveFlag) return;
	var res=JSON.parse(result);
	res=res[0];
	var mid,resMap=Object.keys(res);
	allMMaps.some(function(m,i){
		if(m.id_n==resMap[0]) {
			mid=i;
			return !0;
		}
			//return !1;
	});
	//263-'Mindmap- Module: Currently allowing to create 2 modules with same name- Error msg is given on click of Create button
	if(allMMaps[mid] != undefined){
		allMMaps[mid].id_c=res[resMap[0]];
		allMMaps[mid].children.forEach(function(tsc){
				tsc.id_c=res[tsc.id_n];
				tsc.children.forEach(function(scr){
					scr.id_c=res[scr.id_n];
					scr.children.forEach(function(tc){
						if (res[tc.id_n]!='null'){
							tc.id_c=res[tc.id_n];
						}
					});
			});
		});
		//To update cassandra_ids (id_c) of nodes in dNodes variable
		dNodes.forEach(function(d){
			if (d.type=='modules') d.id_c=res[resMap[0]];
			else d.id_c=res[d.id_n];

		});
		
		openDialogMindmap("Success", "Structure created successfully");
		saveFlag=false;
		$('#ct-createAction').addClass('disableButton');
	}else{
		saveFlag=false;
		openDialogMindmap("Success", "Failed to create structure");
	}
	
	
	//$('#Mindmap_create').modal('show');
  }

		}
	});
};
var toggleExpand = function(e){
	var s=d3.select($(e.target).parent());
	var p=d3.select($(e.target).parent().parent());
    $(e.target).parent().toggleClass('ct-rev');
	$(e.target).parent().parent().toggleClass('ct-open');
	$(e.target).toggleClass("iconSpaceArrowTop");
	e.stopImmediatePropagation();
		if($("#ct-moduleBox").hasClass("ct-open") == true){
 	$("#ct-canvas").css("top","5px");
	// if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == true)
	// 	{
	// 	$("#ct-AssignBox").css({"position":"relative","top":"25px"});
	// 	}
		$(".ct-nodeBox .ct-node").css("width","139px");
		$(".ct-nodeBox").css({"overflow":"auto", "width":"99%"})
		$(".iconSpaceArrow").attr("src","imgs/ic-collapseup.png");
	}
	else{
		$(".iconSpaceArrow").attr("src","imgs/ic-collapse.png");
		$("#ct-moduleBox").css({"position":"","top":""});
	$("#ct-canvas").css("top","");
		$(".ct-nodeBox .ct-node").css("width","");
		$(".ct-nodeBox").css({"overflow":"", "width":""})
	}
};
var toggleExpandAssign = function(e){
	// var s=d3.select($("#"+e.target.id));
	// var p=d3.select($("#"+e.target.id).parent());
	// $("#"+e.target.id).toggleClass('ct-rev');
	// $("#"+e.target.id).parent().toggleClass('ct-open');
	var s=d3.select($(e.target).parent());
	var p=d3.select($(e.target).parent().parent());
    $(e.target).parent().toggleClass('ct-rev');
	$(e.target).parent().parent().toggleClass('ct-open');
	$(e.target).toggleClass("iconSpaceArrowTop");
	e.stopImmediatePropagation();
	if($("#ct-AssignBox").hasClass("ct-open") == true){		
		$("#ct-canvas").css("top","5px");
	// 	if($("#left-nav-section").is(":visible") == true && $("#right-dependencies-section").is(":visible") == true)
	// {
	// 		//$("#ct-AssignBox").css({"position":"relative","top":"25px"});
	// }
		$(".ct-nodeBox .ct-node").css("width","139px");
	$(".ct-nodeBox").css({"overflow":"auto", "width":"98%"})
		$(".iconSpaceArrow").attr("src","imgs/ic-collapseup.png");
	}
	else{
		$(".iconSpaceArrow").attr("src","imgs/ic-collapse.png");
		$("#ct-AssignBox").css({"position":"","top":""});
		$("#ct-canvas").css("top","");
		$(".ct-nodeBox .ct-node").css("width","");
		$(".ct-nodeBox").css({"overflow":"", "width":""})
	}
};
var clickHideElements = function(e){
	d3.select('#ct-inpBox').classed('no-disp',!0);
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	d3.select('#ct-assignBox').classed('no-disp',!0);
};
var setModuleBoxHeight = function(){
	//var lm=d3.select('#ct-moduleBox').classed('ct-open',!0);
	var lm=d3.select('.ct-moduleBoxOptional').classed('ct-open',!0);
	var h1=lm.style('height');
	lm.classed('ct-open',!1);
	if(h1==lm.style('height')) lm.select('.ct-expand').classed('no-disp',!0);
	else lm.select('.ct-expand').classed('no-disp',!1);
};
var populateDynamicInputList = function(){
	scrList=[];tcList=[];scenarioList=[];
	var scrDict={},tcDict={},scenarioDict={};
	allMMaps.forEach(function(m){
		if (m.children != undefined){
			m.children.forEach(function(ts){
			// if(scenarioDict[ts.id_n]===undefined){
			// 		scenarioList.push({id:ts.id,name:ts.name,id_n:ts.id_n,id_c:ts.id_c});
			// 		scenarioDict[ts.id_n]=!0;
			// }
			if (ts.children != undefined){
				ts.children.forEach(function(s){
					if(scrDict[s.name]===undefined ){
						scrList.push({id:s.id,name:s.name,id_n:s.id_n,id_c:s.id_c});
						scrDict[s.name]=!0;
					}
					if (s.children != undefined){
						s.children.forEach(function(tc){
							if(tcDict[tc.name]===undefined){
								tcList.push({id:tc.id,name:tc.name,id_n:tc.id_n,id_c:tc.id_c});
								tcDict[tc.name]=!0;
							}
						});
					}
					
				});
			}
			
		});
	}
		
	});
};
var clearSvg = function(){
	d3.select('#ct-mindMap').remove();
	d3.select('#ct-ctrlBox').classed('no-disp',!0);
	d3.select('#ct-assignBox').classed('no-disp',!0);
	d3.select('#ct-mapSvg').append('g').attr('id','ct-mindMap');
	uNix=0;uLix=0;dNodes=[];dLinks=[];nCount=[0,0,0,0];cSpan=[0,0];cScale=1;mapSaved=!1;
	zoom.scale(cScale).translate(cSpan);
	zoom.event(d3.select('#ct-mapSvg'));
};

//FUnction is tagged to every click on 'cnavas' element to validate the names of nodes when created
var callme=function(){
	if(childNode != null && (childNode.text()=='Module_0' || childNode.text()=='Screen_0' || childNode.text()=='Scenario_0' || childNode.text()=='Testcase_0')){
		d3.select('#ct-inpBox').classed('no-disp',!1);
	}
	
}

var treeBuilder = function(tree){
	node_names_tc=[];
	var pidx=0,levelCount=[1],cSize=getElementDimm(d3.select("#ct-mapSvg"));
	var typeNum={'modules':0,'modules_endtoend':0,'scenarios':1,'screens':2,'testcases':3};
	var childCounter = function(l,s){
		if(levelCount.length<=l) levelCount.push(0);
		if(s.children) {
			levelCount[l]+=s.children.length;
			s.children.forEach(function(d){childCounter(l+1,d);});
		}
	};
	childCounter(1,tree);
	var newHeight = d3.max(levelCount)*90;
	var d3Tree=d3.layout.tree().size([newHeight,cSize[0]]);
	// if(tree.oid===undefined) d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
	// else d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
	if(tree.childIndex===undefined) d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
	else d3Tree.sort(function(a,b){return a.childIndex-b.childIndex;});
	dNodes=d3Tree.nodes(tree);
	//dLinks=d3Tree.links(dNodes);
	dNodes.forEach(function(d){

		// switch-layout feature
		if($('#switch-layout').hasClass('vertical-layout')){
		d.y=cSize[0]*0.1*(0.9+typeNum[d.type]);
		}
		else{
		d.y=d.x;
		//Logic to change the layout and to reduce the length of the links
		d.x=cSize[0]*0.1*(0.9+typeNum[d.type]);
		}



		if(d.oid===undefined)d.oid=d.id;
		d.id=uNix++;
		addNode(d,!0,d.parent);
		if(d.task!=null) d3.select('#ct-node-'+d.id).append('image').attr('class','ct-nodeTask').attr('width','21px').attr('height','21px').attr('xlink:href','images_mindmap/node-task-assigned.png').attr('x',29).attr('y',-10);
	});
	dLinks=d3Tree.links(dNodes);
	dLinks.forEach(function(d){
		d.id=uLix++;
		addLink(d.id,d.source,d.target);
	});
	//zoom.translate([0,(cSize[1]/2)-dNodes[0].y]);

// switch-layout feature
if($('#switch-layout').hasClass('vertical-layout'))
	zoom.translate([(cSize[0]/2)-dNodes[0].x,(cSize[1]/5)-dNodes[0].y]);
else
	zoom.translate([(cSize[0]/3)-dNodes[0].x,(cSize[1]/2)-dNodes[0].y]);
	//zoom.translate([(cSize[0]/2),(cSize[1]/2)]);
	zoom.event(d3.select('#ct-mapSvg'));
};


var dataSender = function(data,callback){
	var xhttp;
	try{xhttp=new XMLHttpRequest();}catch(e){try{xhttp=new ActiveXObject("Msxml2.XMLHTTP");}catch(e){try{xhttp=new ActiveXObject("Microsoft.XMLHTTP");}catch(e){alert("Your Browser is outdated!\nPlease Update!");return false;}}}
	xhttp.onreadystatechange = function(){4==this.readyState&&(200==this.status?callback(!1,this.responseText):(400==this.status||401==this.status||402==this.status||403==this.status||404==this.status)&&callback(!0,this.responseText));};
	//xhttp.open("POST",window.location.pathname,!0);
	if(data.versioning==1)
		xhttp.open("POST",'/version',!0);
	else
		xhttp.open("POST",'/home',!0);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(data));
};

//Dialog used through out mindmap
function openDialogMindmap(title, body){
	if (window.location.pathname == '/home' || window.location.pathname == '/version'){
		$("#mindmapGlobalDialog").find('.modal-title').text(title);
		$("#mindmapGlobalDialog").find('.modal-body p').text(body).css('color','black');
		$("#mindmapGlobalDialog").modal("show");
		setTimeout(function(){
			$("#mindmapGlobalDialog").find('.btn-default').focus();					
		}, 300);
	}else if(window.location.pathname == '/designTestCase' || window.location.pathname == '/design' ||window.location.pathname == '/execute'){
		$("#globalTaskSubmit").modal("show");
	}
	
	
}

/* function to set a Browser cookie */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/* function to get a Browser cookie */
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}