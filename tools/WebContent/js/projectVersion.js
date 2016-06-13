/**
 * init begin;
 */
var edit_index = undefined,rowIndex = undefined,rowSelectedData = undefined,
solutionId = 0,panelId = undefined,isAdd=false,isEdit=false,
question_cache = new Map(),solution_cache = new Map();
$(function(){
	var pager = $('#questions').datagrid().datagrid('getPager');	// get the pager of datagrid
	pager.pagination({
		total:0,
		showPageList:false,
		displayMsg:'{total} items all',
		height:'50px',
		overflow:'hidden',
		buttons:$('#quesButtons'),
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
	
	getProject();
});
function collapsePanel(){
	if(panelId != undefined){
		$('#'+panelId).panel('collapse',true);
	}
}
// initEnd;

function tabAdd(){
	var data = {};
	data.action = "1111";
	X.ajax(data);
}

/**
 * project模块
 */
function getProject(){
	//查询数据库
	var oData = {};
	oData.action = 'project';
	oData.subAction = 'getProject';
	X.ajax(oData,function(data){
		if(data) {
			var json = X.toJson(data);
			$('#projectNames').tree('loadData',json);
		}
	});
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
			//$('#projectNames').tree('reload');
			getProject();
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
//projectEnd

/**
 * questions模块
 */
function getQuestions(isRequired,searchTxt){
	$('#solution').empty();
	var q = $('#questions');
	if(q.datagrid('getPager').pagination('options').loading) return;
	q.datagrid('getPager').pagination('loading');
	var selected = getTreeParentChildren();
	if(selected == null) return;
	var pageNumber = q.datagrid('getPager').pagination('options').pageNumber;
	pageNumber = pageNumber == 0 ? 1 : pageNumber;
	if(pageNumber == 1 && !isRequired){
		//说明显示缓存
		if(!X.isEmpty(selected.childrenId)){
			//说明是选中的子节点
			if(question_cache.m('c'+selected.childrenId) != undefined){
				setQuestions(question_cache.m('c'+selected.childrenId));
				return;
			}
		}else if(!X.isEmpty(selected.parentId))
			//说明是选中的父节点
			if(question_cache.m('p'+selected.parentId) != undefined){
				setQuestions(question_cache.m('p'+selected.parentId));
				return;
			}
	}
	var pageSize = q.datagrid('getPager').pagination('options').pageSize;
	if(X.isEmpty(pageSize)) pageSize = X.cons.pageSize;
	var oData = {};
	oData.action = 'questions';
	oData.subAction = 'getQuestions';
	oData.parentId = selected.parentId;
	oData.childrenId = selected.childrenId;
	oData.pageNumber = pageNumber;
	oData.pageSize = pageSize;
	if(!X.isEmpty(searchTxt)) oData.searchTxt = searchTxt;
	X.ajax(oData, function(data){
		var json = X.toJson(data);
		setQuestions(json.rows);
		if(!X.isEmpty(selected.childrenId)){
			//说明是选中的子节点
			question_cache.m('c'+selected.childrenId,json.rows);
		}else if(!X.isEmpty(selected.parentId))
			//说明是选中的父节点
			question_cache.m('p'+selected.parentId,json.rows);
	});
}
//问题查询框
function doQuesSearch(v){
	if(X.isEmpty(v)) return;
	var q = $('#questions');
	if(q.datagrid('getPager').pagination('options').total <= X.cons.pageSize){
		//说明不足或刚好一页数据,不用查询数据库
		var rows = q.datagrid('getRows');
		var new_rows = new Array();
		var regexp = new RegExp('^.*'+v+'.*$');
		for(var i=0;i<rows.length;i++){
			if(!rows[i].title.match(regexp)){} //q.datagrid('deleteRow',q.datagrid('getRowIndex',rows[i]));
			else{
				//将搜索的关键字标蓝
				var _regexp = new RegExp(v,'g');
				rows[i].title = rows[i].title.replace(_regexp,'<i style="color:blue;">'+v+'</i>');
				new_rows.push(rows[i]);
			}
		}
		setQuestions(new_rows);
	}else{
		getQuestions(true, v);
	}
}
function setQuestions(rows){
	$('#questions').datagrid('loadData',rows);
	$('#questions').datagrid('getPager').pagination('loaded');
	$('#questions').datagrid('acceptChanges');
	isAdd = false;
	isEdit = false;
}
function addData(){
	var q = $('#questions');
	if(endEditing() || !isEdit){
		isAdd = true;
		q.datagrid('appendRow',{});
		var index = q.datagrid('getRows').length - 1;
		edit_index = index;
		q.datagrid('selectRow',index).datagrid('beginEdit',index);
		var comb = q.datagrid('getEditor',{index:edit_index,field:'status'});
		$(comb.target).combobox('setValue','00');
	}else
		q.datagrid('selectRow',edit_index);
	$('#questions').prev('div').find('.datagrid-body').find('table tbody tr:eq('+edit_index+')').find('input:eq(0)').focus();
}
function endEditing(){
	return edit_index == undefined && !$('#questions').datagrid('getPager').pagination('options').loading;
}
function cancelData(isNeedConfirm){
	if(!endEditing())
		if(!isNeedConfirm && confirm("sure to cancel adding?")){
			$('#questions').datagrid('rejectChanges');
			edit_index = undefined;
			isAdd = false;
			isEdit = false;
		}
}
function saveData(){
	var q = $('#questions');
	q.datagrid('endEdit',edit_index);
	var changedRows = q.datagrid('getChanges');
	if(changedRows.length == 0 || edit_index == undefined) return;
	var oData = {};
	var selected = getTreeParentChildren();
	if(changedRows.length > 0 && selected != null){
		var id = new Array(),status = new Array(),question = new Array();
		oData.action = 'questions';
		oData.subAction = 'saveQuestion';
		oData.parentId = selected.parentId;
		oData.childrenId = selected.childrenId;
		for(var i =0;i<changedRows.length;i++){
			if(X.isEmpty(changedRows[i].title)) continue;
			id.push(changedRows[i].id ? changedRows[i].id : '');
			status.push(changedRows[i].status);
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
				getQuestions(true);
				edit_index = undefined;
				isAdd = false;
				isEdit = false;
			}else
				X.dialog(json.resultMsg);
		});
	}
}
//保存时，库存属性不能保存成功
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
				oData.id = q.datagrid('getSelected').id;
				X.ajax(oData, function(data){
					var json = X.toJson(data);
					if(json.success)
						q.datagrid('deleteRow',rowIndex);
					else
						X.dialog(json.resultMsg,json.code);
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
	if(isEdit) $('#questions').datagrid('endEdit',edit_index);
	if(data.id == undefined) return;
	getSolution(data.id);
}
function questionDblRow(rowIndex,rowData){
	if(isAdd) return;
	isEdit = true;
	$('#questions').datagrid('beginEdit',rowIndex);
	if(edit_index != undefined) $('#questions').datagrid('endEdit',edit_index);
	edit_index = rowIndex;
	var a = $('#questions').prev('div').find('.datagrid-body').find('table tbody tr:eq('+edit_index+')').find('input:eq(0)');
	a.focus();
	a.value = '';
	a.value = rowData.title;
}
//questions模块结束


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

/**
 * solution模块
 * @param id
 */   
function getSolution(id,isRequired){
	$('#solution').empty();
	if(solution_cache.m(id) != undefined && isRequired){
		setSolutions(solution_cache.m(id));
	}else{
		var oData = {};
		oData.action = 'solution';
		oData.subAction = 'getSolutions';
		oData.questionId = id;
		X.ajax(oData,function(data){
			var json = X.toJson(data.replace(/[\r\n]+/g,' '));
			if(json.success){
				setSolutions(json.data);
				solution_cache.m(id,json.data);
			}else
				X.dialog(json.resultMsg);
		});
	}
	
}
function setSolutions(json){
	for(var i=0;i<json.length;i++){
		$('#solution').append('<div id="'+json[i].id+'" class="easyui-panel" style="width:100%;padding:30px 70px 20px 70px"></div>');
		var options = {width:'100%',headerCls:'pointer',collapsed:true,iconCls:'icon-edit'};
		options.title = json[i].KEYWORD + '               --by' + json[i].RELEASER;
		if(i == 0) options.collapsed = false;
		options.content = json[i].SOLUTION;
		options.id = json[i].ID;
		$('#'+json[i].id).panel(options);
	}
	solutionId = 0;
}

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