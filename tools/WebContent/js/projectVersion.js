/**
 * init begin;
 */
var edit_index = undefined,rowIndex = undefined,rowSelectedData = undefined,
solutionId = 0,panelId = undefined,isAdd=false,isEdit=false,
question_cache = new Map(),solution_cache = new Map()
,ques_selectedTitle = undefined,share_selectedTitle = undefined;
$(function(){
	$('#questions').datagrid().datagrid('getPager').pagination({
		total:0,
		showPageList:false,
		displayMsg:'{total} items all',
		height:'50px',
		overflow:'hidden',
		showRefresh:false,
		onSelectPage:function(pageNumber,pageSize){
			getQuestions();
		}
	});	
	$('#shareQuestions').datagrid().datagrid('getPager').pagination({
		total:0,
		showPageList:false,
		displayMsg:'{total} items all',
		height:'50px',
		overflow:'hidden',
		onSelectPage:function(pageNumber,pageSize){
			getShareQuestions();
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
	
	//给table添加点击事件
	$('#quesTabs').delegate('input','keyup',function(e){
		if(e.keyCode == 13) 
			saveData();
	});
	
	getProject('projectNames');
	getProject('projectShare',true);
	$('#usertext').text(X.cookie.get('username'));
});
function saveTheme(){
	var theme = $('#themeChange').combobox('getValue');
	if(theme != "" && theme != X.cookie.get('theme')){
		var oData = {action:'login',subAction:'updateTheme'};
		oData.theme = theme;
		X.ajax(oData,function(data){
			var json = X.toJson(data);
			X.dialog(json.resultMsg, json.code);
			if(json.success)
				X.cookie.set({theme:theme});
		});
	}
}
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
function getProject(id,isShare){
	//查询数据库
	if(!isShare) isShare = false;
	var oData = {};
	oData.action = 'project';
	oData.subAction = 'getProject';
	oData.isShare = isShare;
	X.ajax(oData,function(data){
		if(data) {
			var json = X.toJson(data);
			$('#'+id).tree('loadData',json);
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
	var selectedProject = getTreeParentChildren();
	//如果选中的子节点
	if(!X.isEmpty(selectedProject.parentId) && !X.isEmpty(selectedProject.childrenId)){
		$('#projectLevel').combobox('select','s');
		$('#projectName').textbox('disable');
		$('#projectId').textbox('setValue',selectedProject.parentId);
		$('#projectName').textbox('setValue',selectedProject.parentText);
		$('#projectNameSelect').combobox('select',selectedProject.parentId);
	}else
		$('#projectLevel').combobox('select','p');
	
	
	/*if(selectedProject != null){
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
	}*/
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
	$('#subCodeName').next('span').find('input').focus();
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
function quesTabSelect(title,index){
	ques_selectedTitle = title;
	if(title == '共享')
		getShareQuestions();
}
function getQuestions(isRequired,searchTxt){
	$('#solution').empty();
	var q = $('#questions');
	if(q.datagrid('getPager').pagination('options').loading) return;
	q.datagrid('getPager').pagination('loading');
	var selected = getTreeParentChildren();
	if(selected == null) return;
	$('#quesAttachment').linkbutton({text:'0'});
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
		X.dialog(json.resultMsg, json.code);
		setQuestions(json.rows);
		if(!X.isEmpty(selected.childrenId)){
			//说明是选中的子节点
			question_cache.m('c'+selected.childrenId,json.rows);
		}else if(!X.isEmpty(selected.parentId))
			//说明是选中的父节点
			question_cache.m('p'+selected.parentId,json.rows);
	});
}
function attachment(){
	if($('#questions').datagrid('getSelected') == null) return;
	$('#attachmentWin').window('open');
}
function uploadFile(){
	if(parseInt($('#quesfileprobar').progressbar('getValue')) < 100) return;
	var oData = {};
	oData.action = 'question';
	oData.subAction = 'uploadFile';
	oData.questionid = $('#questions').datagrid('getSelected').id;
	uploadIndex --;
	oData.index = uploadIndex;
	$('#quesUploadBtn').linkbutton({text:'上传中...'}).linkbutton('disable');
	uploadFile2(oData);
}
function uploadFile2(oData){
	oData.index = oData.index + 1;
	if(oData.index < uploadFileNames.length){
		oData.filename = uploadFileNames[oData.index];
		oData.file = uploadFiles[oData.index];
		X.ajax(oData,function(data){
			var json = X.toJson(data,{needReload:false});
			X.dialog(json.resultMsg,json.code);
			if(json.success){
				//刷新文件数
				uploadFile2(oData);
				$('#quesfileuploadbar').progressbar('setValue',parseInt(oData.index/uploadFileNames.length*100));
			}else{
				if(json.code != X.cons.notLogin){
					$('#quesUploadBtn').linkbutton({text:'部分文件上传完毕，但是有错误'});
					uploadIndex = oData.index;
					$('#attachmentWin').window('close');
				}else
					$('#quesUploadBtn').linkbutton({text:'上传文件'}).linkbutton('enable');
			}
		},X.cons.upload);
	}else{
		$('#quesUploadBtn').linkbutton({text:'上传完毕，2秒后关闭该窗口'});
		timeo = window.setTimeout(function(){
			$('#attachmentWin').window('close');
		}, 2000);
	}
}
function closeAttachment(){
	var filecount = parseInt($('#questions').datagrid('getSelected').filecount);
	var newcount = document.getElementById('fileSelect').files.length;
	if(newcount > 0){
		filecount += newcount;
		$('#questions').datagrid('getSelected').filecount = filecount;
		$('#quesAttachment').linkbutton({text:filecount});
	}
	uploadFileNames = undefined;
	unloadFiles = undefined;
	X.closeIntervalTimeout();
	$('#quesfileprobar').progressbar('setValue',0);
	$('#quesfileuploadbar').progressbar('setValue',0);
	$('#fileSelect').val('');
	$('#quesUploadBtn').linkbutton({text:'上传文件'}).linkbutton('enable');
}
function getShareQuestions(isRequired,searchTxt){
	$('#solution').empty();
	var q = $('#shareQuestions');
	if(q.datagrid('getPager').pagination('options').loading) return;
	var pageNumber = q.datagrid('getPager').pagination('options').pageNumber;
	pageNumber = pageNumber == 0 ? 1 : pageNumber;
	var pageSize = q.datagrid('getPager').pagination('options').pageSize;
	if(X.isEmpty(pageSize)) pageSize = x.cons.pageSize;
	var oData = {};
	oData.action = 'share';
	oData.subAction = 'getShare';
	oData.pageNumber = pageNumber;
	oData.pageSize = pageSize;
	X.ajax(oData,function(data){
		var json = X.toJson(data);
		if(json.success){
			$('#shareQuestions').datagrid('loadData',json.rows);
			$('#shareQuestions').datagrid('getPager').pagination('loaded');
		}
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
function shareData(){
	if(ques_selectedTitle != '全部' 
		|| !$('#quesLayout').layout('panel','west').panel('options')['collapsed']
		//|| $('#questions').datagrid('getRows').length <= 0
	) return;
	$('#questions').datagrid('showColumn','ques_ck');
	$('#quesLayout').layout('expand','west');
	//现在也可以共享整个项目
//	$('#projectNames').tree({checkbox:true});
	$('#projectNames .tree-title').before('<span class="tree-checkbox tree-checkbox0"></span>');
	var oData = {};
	oData.action = 'friends';
	oData.subAction = 'getFriends';
	X.ajax(oData,function(data){
		var json = X.toJson(data);
		if(json.success){
			$('#friends').datagrid('loadData',json.rows);
		}
	});
	if('转移' == share_selectedTitle) shareTabSelect(share_selectedTitle);
}
function shareTabSelect(title,index){
	share_selectedTitle = title;
	if(share_selectedTitle == '转移' && $('#projectParent').tree('getRoot') == null){
		var oData = {};
		oData.action = 'project';
		oData.subAction = 'getProject';
		X.ajax(oData,function(data){
			if(data) {
				var json = X.toJson(data);
				$('#projectParent').tree('loadData',json);
			}
		});
	}
}
function addQuesFile(){
	var len = $('#quesAttach > div').find('a').size();
	len /= 2;
	for(var i=1;i<=len;i++)
		if(X.isEmpty($('#file'+i).filebox('getValue'))) return;
	len ++;
	$('#quesAttach > div').append('<a id="file' + len +'" href="javascript:void(0);" style="width:100%;">选择文件</a>');
	$('#file'+len).filebox({
		buttonText:'Choose File',
		buttonAlign:'right'
	});
}
/**
 * 分享
 */
function shareQues(){
//	var nodes = $('#projectNames').tree('getChecked',['checked','indeterminate']);
//	for(var i=0;i<nodes.length;i++)
//		testObj(nodes[i]);
//	return;
	var friends_cked = $('#friends').datagrid('getChecked');
	var friends = new Array();
	if(friends_cked != null && friends_cked.length > 0){
		for(var i=0;i<friends_cked.length;i++)
			friends.push(friends_cked[i].userid);
	}
	if(friends.length > 0){
		var questions = new Array();
		var ques_cked = $('#questions').datagrid('getChecked');
		if(ques_cked != null && ques_cked.length > 0){
			for(var i=0;i<ques_cked.length;i++)
				questions.push(ques_cked[i].id);
			var oData = {};
			oData.action = 'share';
			oData.subAction = 'saveShare';
			oData.userids = friends;
			oData.questionids = questions;
			X.ajax(oData,function(data){
				var json = X.toJson(data);
				if(json.success){
					cancelShareQues();
				}
			});
		}
	}
	//转移
	if($('#projectParent').tree('getSelected') != null){
		var oData = getTreeParentChildren('projectParent');
		oData.action = 'questions';
		oData.subAction = 'transfer';
		oData.questionids = questions;
		X.ajax(oData,function(data){
			var json = X.toJson(data);
			X.dialog(json.resultMsg, json.code);
			getQuestions(true);
		});
	}
	//分享Project
	if(friends.length > 0){
		var nodes = $('#projectNames').tree('getChecked',['checked','indeterminate']);
		if(nodes.length > 0){
			var parents = new Array(),childrens = new Array();
			for(var i =0;i<nodes.length;i++){
				//如果子节点有被选中，父节点总是被会选中，只是checkState有所不同
				if(nodes[i].children != undefined)
					parents.push(nodes[i].id);
				childrens.push(nodes[i].id);
			}
			//遍历一般都是到子节点结束，所以，最后一组可能没有push进childrens，但是如果最后一个父节点是完全选中状态，则不需要重新push，所以判断children_的length即可
			var oData = {};
			oData.action = 'project';
			oData.subAction = 'shareProject';
			oData.parents = parents;
			oData.childrens = childrens;
			oData.friends = friends;
			X.ajax(oData,function(data){
				var json = X.toJson(data);
				X.dialog(json.resultMsg,json.code);
				if(json.success)
					getProject('projectShare', true);
			});
		}
	}
}
function cancelShareQues(){
	$('#friends').datagrid('loadData',[]);
	$('#quesLayout').layout('collapse','west');
	$('#questions').datagrid('hideColumn','ques_ck');
	$('#questions').datagrid('uncheckAll');
	$('#projectParent').tree('loadData',[]);
	$('#projectNames .tree-checkbox.tree-checkbox0').detach();
	$('#projectNames .tree-checkbox.tree-checkbox1').detach();
	$('#projectNames .tree-checkbox.tree-checkbox2').detach();
}
function editQuesNote(){
	if($('#questions').datagrid('getSelected') != null && $('#ques_input').length <= 0){
		$('#quesNotePanel').empty();
		$('#quesNotePanel').append('<input id="ques_input">');
		var options = {};
		options.multiline = true;
		options.width = '100%';
		options.height = '100%';
		$('#ques_input').textbox(options);
		$('#ques_input').textbox('setValue',$('#questions').datagrid('getSelected').notes.replace(/<br>/g,'\n'));
		$('#ques_input').next('span').find('textarea').focus();
	}
}
function saveQuesNote(){
	if($('#questions').datagrid('getSelected') != null && $('#ques_input').length > 0){
		var oData = {};
		oData.action = 'questions';
		oData.subAction = 'saveQuesNotes';
		oData.questionid = $('#questions').datagrid('getSelected').id;
		oData.notes = X.rhtmlC($('#ques_input').textbox('getValue')).replace(/\n/g,'<br>');
		X.ajax(oData,function(data){
			var json = X.toJson(data);
			X.dialog(json.resultMsg, json.code);
			if(json.success){
				$('#questions').datagrid('getSelected').notes = oData.notes;
				cancelQuesNote();
			}
		});
	}
}
function cancelQuesNote(){
	if($('#questions').datagrid('getSelected') != null && $('#ques_input').length > 0){
		$('#quesNotePanel').empty();
		$('#quesNotePanel').panel({content:$('#questions').datagrid('getSelected').notes});
	}
}
function addData(){
	var q = $('#questions');
	if(endEditing() || !isEdit){
		isAdd = true;
		q.datagrid('appendRow',{});
		var index = q.datagrid('getRows').length - 1;
		q.datagrid('selectRow',index).datagrid('beginEdit',index);
		var comb = q.datagrid('getEditor',{index:index,field:'status'});
		$(comb.target).combobox('setValue','00');
		edit_index = index;
	}else
		q.datagrid('selectRow',edit_index);
	q.datagrid('getEditor',{index:edit_index,field:'title'}).target.focus();
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
			status.push(X.que_sts[changedRows[i].status] == undefined ? changedRows[i].status : X.que_sts[changedRows[i].status]);
			question.push(X.rhtmlC(changedRows[i].title));
		}
		if(question.length == 0) return;
		oData.id = id;
		oData.status = status;
		oData.question = question;
		X.ajax(oData, function(data){
			var json = X.toJson(data);
			X.dialog(json.resultMsg,json.code);
			if(json.success){
				q.datagrid('acceptChanges');
				getQuestions(true);
				edit_index = undefined;
				isAdd = false;
				isEdit = false;
			}
		});
	}
}

function removeData(){
	if($('#questions').datagrid('getPager').pagination('options').loading || ques_selectedTitle != '全部') return;
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
					X.dialog(json.resultMsg,json.code);
					if(json.success)
						q.datagrid('deleteRow',rowIndex);
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
	if(isEdit || isAdd) $('#questions').datagrid('endEdit',edit_index);
	if(data.id == undefined) return;
	if($('#notes_span').length <= 0)
		$('#quesNotePanel').empty();
	$('#quesNotePanel').panel({content:data.notes});
	$('#quesAttachment').linkbutton({text:data.filecount});
	getSolution(data.id);
}
function questionDblRow(rowIndex,rowData){
	if(isAdd || rowData.status.substring(0,3) == '已解决') return;
	isEdit = true;
	$('#questions').datagrid('beginEdit',rowIndex);
	if(edit_index != undefined) $('#questions').datagrid('endEdit',edit_index);
	edit_index = rowIndex;
	var editor = $('#questions').datagrid('getEditor',{index:edit_index,field:'title'});
	$(editor.target).focus();
	$(editor.target).val(X.fromEntities($(editor.target).val()));
}
//questions模块结束

/**
 * 获取选中的Project
 */
function getTreeParentChildren(id){
	if(id == undefined) id = 'projectNames';
	if(!$('#'+id).tree('getSelected')) return null;
	var selected = $('#'+id).tree('getSelected');
	$('#'+id).tree('expand',selected.target);
	var oData = {};
	if($('#'+id).tree('isLeaf',selected.target)){
		var parent = $('#'+id).tree('getParent',selected.target);
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
			var json = X.toJson(data.replace(/[\n]+/g,'<br />'),{needReload:false});
			X.dialog(json.resultMsg,json.code);
			if(json.success){
				setSolutions(json.data);
				solution_cache.m(id,json.data);
			}
		});
	}
	
}
function setSolutions(json){
	for(var i=0;i<json.length;i++){
		$('#solution').append('<div id="'+json[i].id+'" class="easyui-panel" style="width:100%;padding:30px 70px 20px 70px"></div>');
		var options = {width:'100%',headerCls:'pointer',collapsed:true,iconCls:'icon-edit'};
		options.title = json[i].KEYWORD + '<span style="padding-left:20px;">--by<span style="padding-left:10px;">' + json[i].RELEASER + '</span></span>';
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
			X.dialog(json.resultMsg,json.code);
			if(json.success){
				$('#'+panelId).panel('destroy');
				panelId = undefined;
			}
		});
	}
}
function saveSolution(){
	if(solutionId == 0) return;
	var solution = new Array(),keyword = new Array(),status = new Array(),_oData;
	for(var i=1;i<= solutionId;i++){
		//如果该panel已被删除,则continue
		if($('#ta'+i).length <= 0) continue;
		solution.push(X.rhtmlC($('#ta'+i).textbox('getValue')));
		keyword.push(X.rhtmlC($('#keyword'+i).textbox('getValue')));
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