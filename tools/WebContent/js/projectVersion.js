var edit_index = undefined,rowIndex = undefined,rowSelectedData = undefined,
solutionId = 0,panelId = undefined,isAdd=false,isEdit=false,
editIndexs = {};
$(function(){
	var pager = $('#questions').datagrid().datagrid('getPager');	// get the pager of datagrid
	pager.pagination({
		total:0,
		showPageList:false,
		displayMsg:'{total} items all',
		height:'50px',
		overflow:'hidden',
		buttons:$('#buttons'),
		onSelectPage:function(pageNumber,pageSize){
			getQuestions();
		}
	});	
	
	$('#solution').delegate('.panel-header','click',function(){
		if(Boolean($(this).next('.panel-body').panel('options').collapsed)){
			collapsePanel();
			$(this).next('.panel-body').panel('expand',true);
			panelId = $(this).next('.panel-body').panel('options').id;
		}else{
			$(this).next('.panel-body').panel('collapse',true);
			panelId = undefined;
		}
	});
	
});  
function collapsePanel(){
	if(panelId != undefined){
		$('#'+panelId).panel('collapse',true);
	}
}
function tabAdd(){
	var data = {};
	data.action = "1111";
	X.ajax(data);
}
function doSearch(v){
	alert('your input: '+v);
}

function addProject(){
	$('#w').window('open');
	var roots = $('#projectNames').tree('getRoots');
	var data = new Array();
	for(var i=0;i<roots.length;i++){
		var d = {};
		d.id = roots[i].id;
		d.text = roots[i].text;
		data.push(d);
	}
	$('#projectNameSelect').combobox('loadData',data);
	//为添加窗口初始化输入框
	var selectedProject = $('#projectNames').tree('getSelected');
	if(selectedProject != null){
		if($('#projectNames').tree('isLeaf',selectedProject.target)){
			//Children
			$('#projectLevel').combobox('select','s');
			var parent = $('#projectNames').tree('getParent',selectedProject.target);
			if(parent){
				$('#projectId').textbox('setValue',parent.id);
				$('#projectName').textbox('setValue',parent.text);
			}else{
				$('#projectId').textbox('setValue',selectedProject.id);
				$('#projectName').textbox('setValue',selectedProject.text);
			}
			$('#projectName').textbox('disable');
		}else
			//Parent
			$('#projectLevel').combobox('select','p');
	}
}

function saveProject(){
	var oData = {};
	oData.action = 'project';
	oData.subAction = 'saveProject';
	oData.projectCode = $('#projectCode').textbox('getValue');
	oData.projectName = $('#projectName').textbox('getValue');
	oData.projectId = $('#projectId').textbox('getValue');
	if(!X.isEmpty($('#subCodeName').textbox('getValue'))){
		var aSub = new Array();
		var sT = $('#subCodeName').textbox('getValue');
		aST = sT.split(';');
		for(var i=0;i<aST.length;i++)
			aSub.push(aST[i]);
		oData.childrens = aSub;
	}
	X.ajax(oData,function(data){
		var json = X.toJson(data);
		if(json.success){
			if($('#w input[name="isCloseAfterSave"]').is(':checked'))
				$('#w').window('close');
			$('#projectNames').tree('reload');
			cancelProject();
		}else
			X.dialog(json.resultMsg);
	});
}
function cancelProject(){
	$('#projectLevel').combobox('select','p');
	$('#projectNameSelect').combobox('select','');
	$('#projectName').textbox('setValue','');
	$('#subCodeName').textbox('setValue','');
}
function setProjectInWindow(v){
	if(X.isEmpty(v)) return;
	$('#projectId').textbox('setValue',v.id).textbox('disable');
	$('#projectCode').textbox('setValue',v.code).textbox('disable');
	$('#projectName').textbox('setValue',v.text).textbox('disable');
	$('#projectLevel').combobox('setValue','s');
}
function projectLevelSelect(v){
	if(v.value == 'p'){
		$('#projectCode').textbox('enable').textbox('setValue','');
		$('#projectName').textbox('enable').textbox('setValue','');
		$('#projectId').textbox('setValue','');
		$('#projectNameSelect').combobox('setValue','');
	}else if(v.value == 's'){
		$('#projectCode').textbox('disable');
		$('#projectName').textbox('disable');
	}
}
function getQuestions(){
	$('#solution').empty();
	var q = $('#questions');
	if(q.datagrid('getPager').pagination('options').loading) return;
	q.datagrid('getPager').pagination('loading');
	var selected = getTreeParentChildren();
	if(selected == null) return;
	var pageNumber = q.datagrid('getPager').pagination('options').pageNumber;
	pageNumber = pageNumber == 0 ? 1 : pageNumber;
	var pageSize = q.datagrid('getPager').pagination('options').pageSize;
	if(X.isEmpty(pageSize)) pageSize = X.cons.pageSize;
	var oData = {};
	oData.action = 'questions';
	oData.subAction = 'getQuestions';
	oData.parentId = selected.parentId;
	oData.childrenId = selected.childrenId;
	oData.pageNumber = pageNumber;
	oData.pageSize = pageSize;
	X.ajax(oData, function(data){
		var json = X.toJson(data);
		$('#questions').datagrid('loadData',json.rows);
		$('#questions').datagrid('getPager').pagination('loaded');
		$('#questions').datagrid('acceptChanges');
	});
}
function addData(){
	var q = $('#questions');
	if(endEditing() || !isEdit){
		isAdd = true;
		q.datagrid('appendRow',{});
		var index = q.datagrid('getRows').length - 1;
		edit_index = index;
		if(editIndexs[index] == undefined) editIndex[index] = 1;
		q.datagrid('selectRow',index).datagrid('beginEdit',index);
	}else
		q.datagrid('selectRow',edit_index);
}
function endEditing(){
	if(edit_index != undefined || $('#questions').datagrid('getPager').pagination('options').loading) return false;
	else return true;
}
function cancelData(isNeedConfirm){
	if(!endEditing())
		if(isNeedConfirm && confirm("sure to cancel adding?")){
//			$('#questions').datagrid('deleteRow',edit_index);
			$('#questions').datagrid('rejectChanges');
			edit_index = undefined;
		}
}
function saveData(){
	if(endEditing()) return;
	var oData = {};
	var q = $('#questions');
	var selected = getTreeParentChildren();
	for(var x in editIndexs){
		//alert(x);
		q.datagrid('endEdit',parseInt(editIndexs[x]));
		alert(x);
	}
	//q.datagrid('endEdit',3);
	var changedRows = q.datagrid('getChanges');
	alert('changedRows.length := '+changedRows.length);
	if(changedRows.length > 0 && selected != null){
		var id = new Array(),status = new Array(),question = new Array();
		oData.action = 'questions';
		oData.subAction = 'saveQuestion';
		oData.parentId = selected.parentId;
		oData.childrenId = selected.childrenId;
		for(var i =0;i<changedRows.length;i++){
			if(X.isEmpty(changedRows[i].title)) continue;
			id.push(changedRows[i].id ? changedRows[i].id : '');
			status.push(changedRows[i].status ? changedRows[i].status : '');
			question.push(changedRows[i].title);
		}
		if(question.length == 0) return;
		oData.id = id;
		oData.status = status;
		oData.question = question;
		X.ajax(oData, function(data){
			var json = X.toJson(data);
			if(json.success){
				q.datagrid('acceptChanges');
				getQuestions();
				edit_index = undefined;
				isAdd = false;
				isEdit = false;
				editIndexs = {};
			}else
				X.dialog(json.resultMsg);
		});
	}
}
function removeData(){
	if($('#questions').datagrid('getPager').pagination('options').loading) return;
	if(confirm("sure to remove this data?")){
		var q = $('#questions');
		if(q.datagrid('getSelected') != null){
			if(!X.isEmpty(q.datagrid('getSelected').id)){
				$('#questions').datagrid('getPager').pagination('loading');
				var oData = {};
				oData.action = 'questions';
				oData.subAction = 'removeQuestion';
//				alert(rowSelectedData.id);
				oData.id = q.datagrid('getSelected').id;
				X.ajax(oData, function(data){
					var json = X.toJson(data);
					if(json.success)
						q.datagrid('deleteRow',rowIndex);
					else
						X.dialog(json.resultMsg);
					$('#questions').datagrid('getPager').pagination('loaded');
				});
			}else{
				//说明是新增的
				q.datagrid('deleteRow',rowIndex);
			}
		}
	}
}
function onSelectRow(index,data){
	rowIndex = index;rowSelectedData = data;
	if(data.id == undefined) return;
	getSolution(data.id);
}
function questionDblRow(rowIndex,rowData){
	if(isAdd) return;
	isEdit = true;
	$('#questions').datagrid('beginEdit',rowIndex);
	if(editIndexs[rowIndex] == undefined) editIndexs[rowIndex] = 1;
	edit_index = rowIndex;
}
function getTreeParentChildren(){
	if(!$('#projectNames').tree('getSelected')) return null;
	var selected = $('#projectNames').tree('getSelected');
	var oData = {};
	if($('#projectNames').tree('isLeaf',selected.target)){
		var parent = $('#projectNames').tree('getParent',selected.target);
		if(parent){
			oData.parentId = parent.id;
			oData.parentText = parent.text;
		}else{
			oData.parentId = '';
			oData.parentText = '';
		}
		oData.childrenId = selected.id;
		oData.childrenText = selected.text;
	}else{
		oData.parentId = selected.id;
		oData.parentText = selected.text;
		oData.childrenId = '';
		oData.childrenText = '';
	}
	return oData;
}

//解决方法的函数块   
function getSolution(id){
	var oData = {};
	oData.action = 'solution';
	oData.subAction = 'getSolutions';
	oData.questionId = id;
	X.ajax(oData,function(data){
		$('#solution').empty();
		var json = X.toJson(data);
		if(json.success){
			json = json.data;
			for(var i=0;i<json.length;i++){
				$('#solution').append('<div id="'+json[i].id+'" class="easyui-panel" style="width:100%;padding:30px 70px 20px 70px"></div>');
				var options = {width:'100%',headerCls:'pointer',collapsed:true};
				options.title = json[i].KEYWORD + '               --by' + json[i].RELEASER;
				if(i == 0) options.collapsed = false;
				options.content = json[i].SOLUTION;
				options.id = json[i].ID;
				$('#'+json[i].id).panel(options);
			}
			solutionId = 0;
		}else
			X.dialog(json.resultMsg);
	});
}
//solutionBegin;
function expandAll(){
	$('#solution .panel-body').panel('expand',true);
}
function collapseAll(){
	$('#solution .panel-body').panel('collapse',true);
}
function addSolution(){
	if(solutionId > 0 && X.isEmpty($('#ta'+solutionId).val())) {
		$('#solution'+solutionId+' textarea').focus();
		return;
	}
	solutionId ++;
	$('#solution').append('<div id="solution'+solutionId+'" class="easyui-panel" style="padding:10px 30px;"></div>');
	$('#solution'+solutionId).panel({
		width:'100%',
		//height:200,
		headerCls:'pointer',
		title:'basic panel*'
	});
	$('#solution'+solutionId).panel('body').append('<div style="margin-bottom:5px;"><input id="keyword'+solutionId+'" type="text" style="width:100%;height:30px;"></div>');
	$('#solution'+solutionId).panel('body').append('<div><input id="ta'+solutionId+'" type="text" style="width:100%;height:50px;"></div>');
	$('#ta'+solutionId).textbox({
		prompt:'something to write...',
		multiline:true
	});
	$('#keyword'+solutionId).textbox({
		prompt:'keyword to display in title...'
	});
	panelId = 'solution'+solutionId;
	$('#'+panelId+' textarea').focus();
}
function removeSolution(){
	if(panelId == undefined) return;
	if(panelId.indexOf('solution') == 0){
		//说明是新增,不需要请求服务器
		$('#'+panelId).panel('destroy');
		if(/\d+$/g.exec(panelId) == solutionId){
			while(solutionId > 0 && $('#solution'+solutionId).length <=0)
				solutionId --;
		}
		panelId = undefined;
	}else{
		//说明需要请求服务器
		var oData = {};
		oData.action = 'solution';
		oData.subAction = 'removeSolution';
		oData.id = panelId;
		X.ajax(oData, function(data){
			var json = X.toJson(data);
			if(json.success){
				$('#'+panelId).panel('destroy');
				panelId = undefined;
			}else
				X.dialog(json.resultMsg);
		});
	}
}
function saveSolution(){
	if(solutionId == 0) return;
	var solution = new Array(),keyword = new Array(),status = new Array(),_oData;
	for(var i=1;i<= solutionId;i++){
		//如果该panel已被删除,则continue
		if($('#ta'+i).length <= 0) continue;
		solution.push($('#ta'+i).textbox('getValue'));
		keyword.push($('#keyword'+i).textbox('getValue'));
		status.push('');
	}
	//如果所有新增的panel都被删除,则不请求服务器
	if(solution.length == 0) return;
	var oData = {};
	oData.action = 'solution';
	oData.subAction = 'saveSolution';
	oData.solution = solution;
	oData.keyword = keyword;
	oData.questionId = rowSelectedData.id;
	oData.status = status;
	X.ajax(oData, function(data){
		var json = X.toJson(data);
		if(json.success){
			getSolution(rowSelectedData.id);
		}else
			X.dialog(json.resultMsg);
	});
}
function cancelSolution(){
	if(solutionId == 0) return;
	for(var i=1;i<= solutionId;i++){
		if($('#ta'+i).length <= 0) continue;
		$('#solution'+i).panel('destroy');
		if(panelId == 'solution'+i && panelId != undefined) panelId = undefined;
	}
	solutionId = 0;
}
//solutionEnd;