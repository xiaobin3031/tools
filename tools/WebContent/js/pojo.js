var metaData = '{data:{"COLUMNS":["ADDTIME","ADDWHO","CARTONIZEUOM1","CARTONIZEUOM2","CARTONIZEUOM3","CARTONIZEUOM4","CARTONIZEUOM5","CUBEUOM1","CUBEUOM2","CUBEUOM3","CUBEUOM4","CUBEUOM5","DESCR","DESCR1","DESCR2","DESCR3","DESCR4","DESCR5","EDITTIME","EDITWHO","HEIGHTUOM1","HEIGHTUOM2","HEIGHTUOM3","HEIGHTUOM4","HEIGHTUOM5","IN_LABEL1","IN_LABEL2","IN_LABEL3","IN_LABEL4","IN_LABEL5","LENGTHUOM1","LENGTHUOM2","LENGTHUOM3","LENGTHUOM4","LENGTHUOM5","OUT_LABEL1","OUT_LABEL2","OUT_LABEL3","OUT_LABEL4","OUT_LABEL5","PACKID","PACKMATERIAL1","PACKMATERIAL2","PACKMATERIAL3","PACKMATERIAL4","PACKMATERIAL5","PACKNAME","PACKUOM","PACKUOM1","PACKUOM2","PACKUOM3","PACKUOM4","PACKUOM5","PACK_MATERIAL2","PALLETHI","PALLETTI","PALLETWOODHEIGHT","PALLETWOODLENGTH","PALLETWOODWIDTH","QTY1","QTY2","QTY3","QTY4","QTY5","QTY_MATERIAL2","RPL_LABEL1","RPL_LABEL2","RPL_LABEL3","RPL_LABEL4","SN_1","SN_2","SN_3","WEIGHTUOM1","WEIGHTUOM2","WEIGHTUOM3","WEIGHTUOM4","WEIGHTUOM5","WIDTHUOM1","WIDTHUOM2","WIDTHUOM3","WIDTHUOM4","WIDTHUOM5"],"COMMENTS":["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],"DATATYPE":["DATE","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","DATE","VARCHAR2","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","VARCHAR2","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","CHAR","CHAR","CHAR","CHAR","CHAR","CHAR","CHAR","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER","NUMBER"],"DATALENGTH":["7","140","4","4","4","4","4","22","22","22","22","22","240","80","80","80","80","80","7","140","22","22","22","22","22","4","4","4","4","4","22","22","22","22","22","4","4","4","4","4","160","80","80","80","80","80","255","255","40","40","40","40","40","200","22","22","22","22","22","22","22","22","22","22","22","1","1","1","1","1","1","1","22","22","22","22","22","22","22","22","22","22"]}}';
var jCol,tableName,uiXml,commentsType;
$(function(){
	$('textarea[name="columns"]').val('addtime,addwho,edittime,editwho,');
	$('textarea[name="origin"]').focus();
	
	$('.detailTop > div').click(function(){
		$('.detailTop input[type="button"]').attr('disabled',true);
		$('.detailTop span').css('color','#FFF');
		$(this).find('span').css('color','#000');
		$(this).find('input[type="button"]').attr('disabled',false);
		$('.detailArea > div').attr('hidden',true);
		$('.detailArea > div').eq($(this).index()).attr('hidden',false);
	});
	$('.detailTop > div:first').click();
	
	$('input[name="initSearch"]').click(function(){
		if(X.isEmpty($('textarea[name="resultView"]').val())) return;
		if($(this).is(':checked')){
			alert(true);
		}else{
			alert(false);
		}
	});
});
function translate2Pojo(){
	if(X.isEmpty($('textarea[name="origin"]').val())) return;
	var r = $('textarea[name="origin"]').val().replace(/[\[\]\r\n\t]/g,'');
	$('textarea[name="result"]').val('');
	if((/create +table +.*?\((.*)\)/ig).test(r)){
		byui(r);
	}else{
		tableName = $('textarea[name="origin"]').val();
		X.ajax({action:'getPojo',TABLENAME:$('textarea[name="origin"]').val(),DBTYPE:$('input[name="dbType"]:checked').val()},function(data){
			bydb(data);
		});
	}
//	tableName = 'BAS_PACKAGE';
//	bydb(metaData);
}

function byui(r){
	var t = new Text(),t3 = new Text(),f = new Text();
	t3._('');
	r = r.match(/create +table +.*?\((.*)\)/ig) + '';
	var s = r.match(/[(,] *[a-z_1-9]+ +[a-z]+(\(\d+(, ?\d+)?\))? +[ _a-z1-9\(\)\']+/ig) + '';
	s = s.replace(/\(\d+(, ?\d+)?\)/g,'').replace(/[\(\)]/g,'').replace(/,+/g,',');
	var aResult = s.split(',');
	for(var i=0;i<aResult.length;i++){
		t._('\t')._('private String ')._(aResult[i].split(' ')[0].toUpperCase())._(';\n');
		t3._('\t')._('<property name=\"'+aResult[i].split(' ')[0].toUpperCase()+'\" />')._('\n');
	}
	t._('\n')._('\n');
	var c = '';
	for(var i=0;i<aResult.length;i++){
		c = aResult[i].split(' ')[0].toUpperCase();
		t._('\t')._('public void set')._(c)._('(')
		 ._('String ')._(X.toLowerAtPos(c, 0,1))._('){\n')
		 ._('\t\t')._('this.')._(c)._(' = ')._(X.toLowerAtPos(c, 0,1))._(';\n')
		 ._('\t')._('}\n\n');
		t._('\t')._('public String get')._(c)._('(){\n')
		 ._('\t\t')._('return ')._(c)._(';\n')
		 ._('\t')._('}\n\n');
	}
	$('textarea[name="result"]').val(t.toString());
	$('textarea[name="resultXml"]').val(t3.toString());
}
function bydb(data){
	var json = X.toJson(data);
	jCol = json;
	if(X.isEmpty(json.data))
		alert(json.resultMsg);
	else{
		var c = '',type,type2,type3;
		var t1 = new Text(),t2 = new Text(),t3 = new Text(),f = new Text(),ui = new Text(),cols = new Text(),ui = new Text();
		t1.settn();t2.settn();t3.settn();f.settn();ui.settn();
		for(var i=0;i<json.data.COLUMNS.length;i++){
			c = json.data.COLUMNS[i].toUpperCase();
			if(/_?FLAG$/i.test(c) || '1' == json.data.DATALENGTH[i]){
				type='Boolean';
				type2='yes_no';
				type3='CheckboxItem';
			}else{
				type='String';
				type2='text';
				type3 = 'TextItem';
			}
			t1._t('private '+type+' '+c+';');
			t2._t('public void set'+c+'('+type+' '+X.toLowerAtPos(c, 0,1)+'){').i++;
			t2._t('this.'+c+' = '+X.toLowerAtPos(c, 0,1)+';').i--;
			t2._t('}')._()
			._t('public '+type+' get'+c+'(){').i++;
			t2._t('return '+c+';').i--;
			t2._t('}')._();
			t3._t('<property name=\"'+c+'\" '+(type2=='yes_no'?'type="yes_no"':'')+' />');
			f._t('<field name="'+c+'" type="'+(type2 == 'yes_no'?'boolean':type2)+'" title="'+json.data.COMMENTS[i]+'" hidden="true"/>');
			cols._(c)._(',');
			ui._t('<'+type3+' name="'+c+'" title="'+json.data.COMMENTS[i]+'" titleOrientation="top"/>');
		}
		tableName = tableName.toLowerCase();
		var a_ = tableName.match(/_[a-z]/g);
		if(a_ != null){
			for(var i=0;i<a_.length;i++){
				tableName = tableName.replace(a_[i],a_[i].toUpperCase());
			}
		}
		f.__('<fields> \n')._('</fields> \n')
		.__('<DataSource ID="'+tableName.replace(/_/g,'')+'" serverType="sql" tableName="'+tableName.toUpperCase()+'" dataFormat="json" showPrompt="false"> \n')
		._('<serverObject lookupStyle="spring" bean="'+X.toUpperAtPos(tableName.replace(/_/g,''), 0, 1)+'Dao" />')._()
		._('<operationBindings>')._()
		._('<operationBindings operationType="fetch">')._()
		._('<selectClause>'+cols.toString()+'</selectClause>')._()
		._('<tableClause> from '+tableName.toUpperCase()+' where 1 = 1 </tableClause>')._()
		._('<orderClause> order by addtime desc</orderClause>')._()
		._('</operationBindings>')._()
		._('</operationBindings>')._()
		._('</DataSource>');
		t1._()._();
		$('textarea[name="result"]').val(t1.toString()+t2.toString());
		$('textarea[name="resultXml"]').val(t3.toString());
		$('textarea[name="resultField"]').val(f.toString());
		$('textarea[name="resultColumns"]').val(cols.toString());
		uiXml = ui.toString();
		$('textarea[name="resultUI"]').val(ui.toString());
		if($('input[name="getViewAndDao"]').is(':checked')){
			getView();
			getDao();
		}
	}
}

function ignoreColumn(){
	if(X.isEmpty($('textarea[name="columns"]').val())) return;
	var v = X.removeRepStr(X.getSepStr($('textarea[name="columns"]').val())).replace(/,+$/,'').replace(/,/g,'|');
	var v2,r,t;
	$('.ignoreChkGroup input[type="checkbox"]:checked').each(function(){
		switch(parseInt($(this).val())){
		case 0:
			r = new RegExp('('+v+'),','ig');
			alert(r);
			v2 = $('textarea[name="resultColumns"]').val();
			v2 = v2.replace(r,'');
			if(!X.isEmpty($('input[name="alias"]').val()))
				v2 = $('input[name="alias"]').val() + '.' + v2.substring(0,c.length-1).replace(/,/g,','+$('input[name="alias"]').val()+'.');
			$('textarea[name="resultColumns"]').val(v2);
			break;
		case 1:
			v2 = $('textarea[name="result"]').val();
			r = new RegExp('\\t*?(private String ('+v+');|public .+ (set|get)('+v+')\(.+\)\{[\\n\\t]+.+[\\n\\t]+\})','ig');
			$('textarea[name="result"]').val(v2.replace(r,'').replace(/\n{3,}/g,'\n').replace(/^[\t\n]+$/g,''));
			break;
		case 2:
			v2 = $('textarea[name="resultXml"]').val();
			r = new RegExp('\\t*?<property name=\"('+v+')\".*?/>\\n?','ig');
			$('textarea[name="resultXml"]').val(v2.replace(r,'').replace(/^[\t\n]+$/g,''));
			break;
		case 3:
			v2 = $('textarea[name="resultField"]').val();
			r = new RegExp('\\t*?<field name="('+v+')".*?/>\\n?','ig');
			v2 = v2.replace(r,'');
			t = v2.match(/<selectClause>.*?<\/selectClause>/ig)+'';
			r = new RegExp('('+v+')','ig');
			t = t.replace(r,'').replace(/,+/g,',').replace(/<selectClause>,+/ig,'<selectClause> ').replace(/,+<\/selectClause>/ig,' </selectClause>');
			$('textarea[name="resultField"]').val(v2.replace(/<selectClause>.*?<\/selectClause>/ig,t));
			break;
		case 4:
			v2 = $('textarea[name="resultUI"]').val();
			r = new RegExp('\\t*?<(Checkbox|Text|Select)Item name="('+v+')".*?/>\\n?','ig');
			$('textarea[name="resultUI"]').val(v2.replace(r,''));
			break;
		}
	});
}

function setComments(){
	if(X.isEmpty($('textarea[name="comments"]').val())) return;
	var v = $('textarea[name="comments"]').val(),v5,t,t5;
	commentsType = v.match(/[a-z0-9_]+[ \t]+?[a-z0-9]+ *?(\(\d+(, ?\d+)?\))?\t/ig)+'';
	v = v.replace(/\t[a-z0-9]+ *?(\(\d+(, ?\d+)?\))?\t/ig,'');
	v = v.replace(/( *\t)+/g,',').replace(/\n+/g,';').replace(/;,/g,';');
	v5 = v.match(/([a-z_]+)\d+,.*?;(\1\d+,;)+/ig);
	for(var i=0;i<v5.length;i++){
		t = v5[i]+'';
		t5 = t.split(';')[0].split(',')[1];
		if(/\d+$/g.test(t5))
			t5 = t5.replace(/\d+$/g,'');
		else{
			t = t.replace(t5,t5+t.match(/[a-z_]+(\d+),.+;/i)[1]);
		}
		while(/[a-z_]+\d+,;/ig.test(t)){
			t = t.replace(/,;/,','+t5+t.match(/[a-z_]+(\d+),;/i)[1]+';');
		}
		v = v.replace(v5[i],t);
	}
	var title = '',r1,r2,c,m,ui = $('textarea[name="resultUI"]').val(),r,type,type3;
	var pojo = $('textarea[name="result"]').val(),rxml = $('textarea[name="resultXml"]').val(),f = $('textarea[name="resultField"]').val();
	var sui = $('textarea[name="searchUI"]').val();
	for(var i=0;i<jCol.data.COLUMNS.length;i++){
		c = jCol.data.COLUMNS[i].toUpperCase();
		r = new RegExp(c+'[\\t ]*?char\\(1\\)','ig');
		if(/_?FLAG$/.test(c) || r.test(commentsType) || '1' == jCol.data.DATALENGTH[i]){
			type = 'yes_no';
			type3 = 'CheckboxItem';
			r = new RegExp('\\t*?private String '+c+';','ig');
			pojo = pojo.replace(r,'\tprivate Boolean '+c+';');
			r = new RegExp('public void set'+c+'\\(String .+?\\)(\\{[\\n\\t]+?.+?[\\n\\t]+?\\}\\n?)','i');
			if(r.test(pojo)){
				t = (pojo.match(r)+'').split(',');
				pojo = pojo.replace(r,'public void set'+c+'(Boolean '+X.toLowerAtPos(c, 0, 1)+')'+t[t.length - 1]);
				r = new RegExp('public String get'+c+'\\(\\)(\\{[\\n\\t]+?.+?[\\n\\t]+?\\}\\n?)','i');
				t = (pojo.match(r)+'').split(',');
				pojo = pojo.replace(r,'public Boolean get'+c+'()'+t[t.length - 1]);
			}
			r = new RegExp('name="'+c+'" +?type="yes_no"');
			if(!r.test(rxml)){
				r = new RegExp('name="'+c+'"');
				rxml = rxml.replace(r,'name="'+c+'"'+' type="yes_no"');
			}
			r = new RegExp('name="'+c+'" type="text"','ig');
			if(r.test(f)){
				r = new RegExp('name="'+c+'" type="text"\(.*?\)/>','i');
				t = (f.match(r)+'').split(',');
				f = f.replace(r,'name="'+c+'" type="boolean"'+t[t.length-1]+'/>');
			}
		}else{
			type = 'text';
			type3 = 'TextItem';
		}
		r1 = new RegExp(c+'[a-z0-9_]*?,.*?;','ig');
		if(c.indexOf('_')>=0)
			r2 = new RegExp(c.substring(0,c.indexOf('_'))+'[a-z0-9_]*?,.*?;','ig');
		else
			r2 = r1;
		if(v.match(r1) != null)
			m = v.match(r1)+'';
		else if(v.match(r2) != null)
			m = v.match(r2)+'';
		else m = '';
		if(m != ''){
			title = m.substring(0,m.length-1).split(',')[1];
			if(title.indexOf('BAS_')>=0){
				title = title.substring(0,title.indexOf('BAS_')).replace(/ /g,'');
				type3 = 'SelectItem';
			}
			title = title.replace(/;/g,'');
		}else
			title = '';
		r = new RegExp('<field name="'+c+'"','ig');
		if(r.test(f)){
			r = new RegExp('name="'+c+'"(.*?)title=".*?"(.*?)/>','i');
			t = (f.match(r)+'').split(',');
			f = f.replace(r,'name="'+c+'"'+t[t.length-2]+'title="'+title+'"'+t[t.length-1]+'/>');
		}
		r = new RegExp('(\\t*)<TextItem name="'+c+'"');
		if(r.test(ui)){
			t = ui.match(r);
			ui = ui.replace(r,t[t.length - 1]+'<'+type3+' name="'+c+'"');
		}
		if(r.test(sui)){
			t = sui.match(r);
			sui = sui.replace(r,t[t.length - 1]+'<'+type3+' name="'+c+'"');
		}
		r = new RegExp('\\t*?.*?name="'+c+'".*?/>\\n?');
		if(r.test(ui))
			ui = ui.replace(r,(ui.match(r)+'').replace(/title=".*?"/g,'title="'+title+'"'));
		if(r.test(sui))
			sui = sui.replace(r,(sui.match(r)+'').replace(/title=".*?"/g,'title="'+title+'"'));
	}
	$('textarea[name="comments"]').val(v);
	$('textarea[name="resultField"]').val(f.toString());
	$('textarea[name="resultUI"]').val(ui);
	$('textarea[name="result"]').val(pojo);
	$('textarea[name="resultXml"]').val(rxml);
	$('textarea[name="searchUI"]').val(sui);
	getView();
	getDao();
}

function uiSort(){
	if(X.isEmpty($('textarea[name="uiSort"]').val())) return;
	var v = $('textarea[name="uiSort"]').val();
	var ui = uiXml.substring(0,uiXml.length);
	if(v.indexOf(';')<0) v += ';主信息'
	var g = v.split(';')[0].split(/ +/g);
	var tab = v.split(';')[1].split(',');
	var i,t = new Text(),r,title;
	t.settn();
	t._t('<TabSet ID="TabSet0" width="70%" height="100%" autoDraw="false">')
	._t('<tabs>').i++;
	for(var j=0;j<g.length;j++){
		if(tab.length > j)
			title = tab[j];
		else 
			title = '';
		t._t('<Tab title="'+title+'">').i++;
		t._t('<pane ref="VLayout'+j+'">').i++;
		t._t('<DynamicForm numCols="4" ID="" width="100%" height="100%" right="100" top="10" titleSuffix="" cellPadding="10" titleWidth="75">')
		._t('<fields>');
		i = g[j].split(',');
		for(var k=0;k<i.length;k++){
			if(/[\u4e00-\u9fa5]/g.test(i[k]))
				r = new RegExp('\\t*?.*?title="'+i[k]+'.*?".*?/>\\n?');
			else
				r = new RegExp('\\t*?.*?name="'+i[k]+'.*?".*?/>\\n?');
			t._(ui.match(r));
			ui = ui.replace(r,'');
		}
		t._t('</fields>')
		._t('</DynamicForm>').i--;
		t._t('</pane>').i--;
		t._t('</Tab>');
	}
	t.i--;
	t._t('</tabs>')._('</TabSet>')
	._()._()
	._t(ui);
	$('textarea[name="resultUI"]').val(t.toString());
	setComments();
}

function displayField(){
	if(X.isEmpty($('textarea[name="displayField"]').val())) return;
	var v = X.removeRepStr(X.getSepStr($('textarea[name="displayField"]').val()));
	var v2 = $('textarea[name="resultField"]').val();
	var r = new RegExp('\\t*?<field name="('+v+')" type="([a-z_]*?)" title=".*?" hidden="(true|false)?" *?/>\\n?','ig');
	var v3 = v2.match(r)+'';
	v3 = v3.replace(/hidden="(true|false)?"/g,'hidden="false"');
	v2 = v2.replace(r,'').replace(/<fields>\n?/g,'<fields>\n'+v3);
	$('textarea[name="resultField"]').val(v2);
}

function getView(){
	var ti = 2;
	var t = new Text();
	t.setn();
	t._('private DataGrid listGrid;')
	._('private DynamicForm mainForm;')
	._('private PageBar pageBar;')
	._('private Window searchWin;')
	._('private ValuesManager vm;')
	._()
	._('private String canvasId;')
	._()
	._('@Override')
	._('public Canvas getViewPanel() {')
	t.sett();
	t._t('final VLayout main = new VLayout();')
	._t('vm = new ValuesManager();')
	._t('main.setWidth100();')
	._t('main.setHeight100();')
	._t('RPCManager.loadScreen("'+X.toUpperAtPos(tableName.replace(/_/g,''), 0, 1)+'", new LoadScreenCallback() {')
	._t().i++;
	t._t('@Override')
	._t('public void execute() {').i++;
	t._t('final Canvas canvas = this.getScreen();')
	._t('listGrid = (DataGrid) canvas.getByLocalId("listGrid");')
	._t('mainForm = (DynamicForm) canvas.getByLocalId("mainForm");')
	._t('pageBar = (PageBar) canvas.getByLocalId("PageBar1");')
	._t()
	._t('ToolStrip toolStrip = new ToolStrip();   //按钮布局')
	._t('toolStrip.setAlign(Alignment.RIGHT);')
	._t()
	._t('vm.addMember(mainForm);')
	._t('vm.setDataSource(listGrid.getDataSource());')
	._t();
	var v = $('textarea[name="comments"]').val().split(';');
	var av,av2,av3;
	for(var i=0;i<v.length;i++){
		av = v[i].match(/[a-z_0-9]+,.*?((bas|rul)[a-z_$| ]+)/i);
		if(av != null){
			av2 = X.trim(av[1]).split('$');
			av3 = v[i].split(',')[0].toUpperCase();
			switch(av2[0].toUpperCase()){
			case 'BAS_CODES':
				t._t('Util.initComboByCodes(mainForm, "'+av3+'","'+av2[1]+'");');
				break;
			case 'RUL_ROTATION'://缺省库存周转规则
				t._t('Util.initQCRule(ruleForm, "'+av3+'"); //库存周转规则');
				break;
			case 'RUL_PUTAWAY'://缺省上架规则
				t._t('Util.initPutawayRule(ruleForm, "'+av3+'");       //上架规则');
				break;
			case 'RUL_SOFTALLOCATION'://缺省预分配规则
				t._t('Util.initSoftAllocationRule(ruleForm, "'+av3+'"); //预配规则');
				break;
			case 'RUL_ALLOCATION'://缺省分配规则
				t._t('Util.initAllocationRule(ruleForm,"'+av3+'");  //分配规则');
				break;
			case 'RUL_REPLENISHMENT'://缺省补货规则
				t._t('Util.initReplenishmentRule(ruleForm, "'+av3+'"); //补货规则');
				break;
			case 'BAS_PACKAGE'://包装
				t._t('Util.initPackage(ruleForm, "'+av3+'"); //包装');
				break;
			case 'BAS_LOTID'://批次属性
				t._t('Util.initLotAttr(ruleForm, "'+av3+'"); //批次属性');
				break;
			}
		}
	}
	t._()._()
	._t('//创建按钮布局')
	._t('createBtnWidget(toolStrip);')
	._t('main.addMember(toolStrip);')
	._t('main.addMember(canvas);')
	._()
	._t('listGrid.addRecordClickHandler(new RecordClickHandler() {').i++;
	t._t('public void onRecordClick(RecordClickEvent event) {  ').i++;
	t._t('Record record = event.getRecord(); ')
	._t('mainForm.editRecord(record);').i--;
	t._t('}').i--;
	t._t('}); ').i--;
	t._t('}').i--;
	t._t('});')._()
	._t('return main;').i--;
	t._t('}')._();
	
	t._t('@Override')
	._t('public Canvas createCanvas() {').i++;
	t._t('类名 user = new 类名();')
	._t('user.addMember(user.getViewPanel());')
	._t('canvasId = user.getID();')
	._t('return user;').i--;
	t._t('}')._();
	
	t._t('@Override')
	._t('public String getCanvasID() {').i++;
	t._t('return canvasId;').i--;
	t._t('}')._();
	
	t._t('private void createBtnWidget(ToolStrip toolStrip) {').i++;
	t._t('toolStrip.setWidth("100%");')
	._t('toolStrip.setHeight("20");')
	._t('toolStrip.setPadding(2);')
	._t('toolStrip.setSeparatorSize(12);')
	._t('toolStrip.addSeparator();')
	._()
	._t('IButton searchButton = createBtn(Util.BI18N.SEARCH(),StaticRef.ICON_SEARCH,"");')
	._t('searchButton.addClickHandler(new ClickHandler() {').i++;
	t._()
	._t('@Override')
	._t('public void onClick(ClickEvent event) {').i++;
	t._t('if(searchWin == null)').i++;
	t._t('searchWin = new SearchWin(listGrid,pageBar).createForm("Search");').i--;
	t._t('else').i++;
	t._t('searchWin.show();').i--;
	t.i--;
	t._t('}').i--;
	t._t('});');
	t._()
	._t('IButton newButton = createBtn(Util.BI18N.NEW(),StaticRef.ICON_NEW, "");')
	._t('newButton.addClickHandler(new NewFormAction(vm));')
	._()
	._t('IButton saveButton = createBtn(Util.BI18N.SAVE(),StaticRef.ICON_SAVE, "");')
	._t('saveButton.addClickHandler(new SaveFormAction(vm, listGrid));')
	._()
	._t('IButton delButton = createBtn(Util.BI18N.DELETE(),StaticRef.ICON_DEL, "");')
	._t('delButton.addClickHandler(new DeleteFormAction(vm, listGrid));')
	._()
	._t('IButton canButton = createBtn(Util.BI18N.CANCEL(),StaticRef.ICON_CANCEL, "");')
	._t('canButton.addClickHandler(new CancelFormAction(vm, listGrid));')
	._()
	._t('toolStrip.setMembersMargin(4);')
	._t('toolStrip.setMembers(searchButton,newButton,saveButton,delButton,canButton);').i--;
	t._t('}');
	t._()
	._t('@Override')
	._t('protected void onDestroy() {').i++;
	t._t('if(searchWin != null) searchWin.destroy();').i--;
	t._t('}');
	$('textarea[name="resultView"]').val(t.toString());
}

function getDao(){
	var t = new Text();
	t.setn();
	t._('Logger log = new Logger(类名.class.getName());')._()
	._('private SessionFactory sessionFactory;')._()
	._('public void setSessionFactory(SessionFactory sessionFactory) {');
	t.sett();
	t._t('this.sessionFactory = sessionFactory;').i--;
	t._t('}')._();
	t._t('@SuppressWarnings("unchecked")')
	._t('public DSResponse fetch(DSRequest dsRequest) throws Exception{').i++;
	t._t('System.out.println("in");')
	._t('return super.fetch(dsRequest, sessionFactory);').i--;
	t._t('}')._();
	
	t._t('public DSResponse add(DSRequest dsRequest,类名 item) throws Exception{').i++;
	t._t('log.info("procesing DMI add operation");')
	._t('return super.add(dsRequest, item, sessionFactory);').i--;
	t._t('}')._();
	
	t._t('@SuppressWarnings("unchecked")')
	._t('public DSResponse update(DSRequest dsRequest,Map newValues) throws Exception{').i++;
	t._t('log.info("processing DMI update operation");')
	._t('return super.update(dsRequest, newValues, 实体类.class, 主键, sessionFactory);').i--;
	t._t('}')._();
	
	t._t('public 类名 remove(类名 item) throws Exception{').i++;
	t._t('log.info("processing DMI remove operation");')
	._t('return super.remove(item, sessionFactory);').i--;
	t._t('}')._();
	t._("@Override")
	._("protected void getCondiftion(SQLUtil sqlUtil, StringBuffer sql,DSRequest dsRequest) {").i++;
	t._().i--;
	t._("}");
	$('textarea[name="resultDao"]').val(t.toString());
}
 
function toBol(){
	if(X.isEmpty($('textarea[name="toBol"]').val())) return;
	var f = $('textarea[name="resultXml"]').val(),ds = $('textarea[name="resultField"]').val(),ui = $('textarea[name="resultUI"]').val(),r,t,v;
	var pojo = $('textarea[name="result"]').val();
	v = X.removeRepStr(X.getSepStr($('textarea[name="toBol"]').val()));
	v = v.split(',');
	for(var i=0;i<v.length;i++){
		r = new RegExp('private String '+v[i]+';','i');
		if(r.test(pojo)){
			t = pojo.match(r);
			pojo = pojo.replace(r,'private Boolean '+v[i]+';');
			r = new RegExp('public String get'+v[i]+'\\(\\)\\{([\\n\\t]+.+[\\n\\t]+)\\}','i');
			t = pojo.match(r);
			pojo = pojo.replace(r,'public Boolean get'+v[i]+'(){'+t[t.length - 1]+'}');
			r = new RegExp('public void set'+v[i]+'\\(String (.+?)\\)\\{([\\n\\t]+.+[\\n\\t]+)\\}');
			t = pojo.match(r);
			pojo = pojo.replace(r,'public void set'+v[i]+'(Boolean '+t[t.length - 2]+'){'+t[t.length - 1]+'}');
		}
		r = new RegExp('name="'+v[i]+'".+?type="yes_no"','ig');
		if(!r.test(f)){
			r = new RegExp('name="'+v[i]+'"','ig');
			f = f.replace(r,'name="'+v[i]+'" type="yes_no"');
		}
		r = new RegExp('name="'+v[i]+'".+?type="boolean"','ig');
		if(!r.test(ds)){
			r = new RegExp('name="'+v[i]+'"(.+?)type=".*?"','i');
			t = ds.match(r);
			ds = ds.replace(r,'name="'+v[i]+'"'+t[t.length-1]+'type="boolean"');
		}
	}
	$('textarea[name="result"]').val(pojo);
	$('.pojoArea input[type="checkbox"]:checked').each(function(){
		switch (parseInt($(this).val())) {
		case 2:
			$('textarea[name="resultXml"]').val(f);
			break;
		case 3:
			$('textarea[name="resultField"]').val(ds);
			break;
		}
	});
}

function searchUI(){
	if(X.isEmpty($('textarea[name="searchCol"').val()) || X.isEmpty($('textarea[name="resultUI"]').val())) return;
	var v = X.removeRepStr(X.getSepStr($('textarea[name="searchCol"]').val())),ui = $('textarea[name="resultUI"]').val(),sui = $('textarea[name="searchUI"]').val();
	alert(v);
	var aF = v.split(',');
	var t = new Text(),r,t3 = new Text();
	t3.setn();
	for(var i=0;i<aF.length;i++){
		r = new RegExp('<(selectitem|checkboxitem|textitem) +name="'+aF[i]+'".+/>\\n?','ig');
		if(r.test(ui))
			t._(ui.match(r)+'');
		t3._('sql.append(sqlUtil.addALikeSQL("'+aF[i]+'", ObjUtil.ifNull(dsRequest.getFieldValue("'+aF[i]+'"), "")));');
	}
	if(sui.indexOf('DynamicForm') < 0){
		var t2 = new Text();
		t2.setn();
		t2._('<HLayout xmlns:xsi="http://www.w3.org/1999/XMLSchema-instance"');
		t2.sett();
		t2._t('ID="componentsLayout" autoDraw="false" membersMargin="10">')
		._t('<members>').i++;
		t2._t('<TabSet ID="TabSet0" width="70%" height="100%" autoDraw="false">').i++;
		t2._t('<tabs>').i++;
		t2._t('<Tab title="查询">').i++;
		t2._t('<pane ref="VLayout0">').i++;
		t2._t('<DynamicForm numCols="4" ID="mainForm" width="auto" height="100%" right="5" top="5" dataSource="'+tableName.replace(/_/g,'')+'" autoDraw="true" canSubmit="true" titleSuffix="" cellPadding="10" titleWidth="75">')
		._t('<fields>').i++;
		t2._t(t.toString()).i--;
		t2._t('</fields>')
		._t('</DynamicForm>').i--;
		t2._t('</pane>').i--;
		t2._t('</Tab>').i--;
		t2._t('</tabs>').i--;
		t2._t('</TabSet>').i--;
		t2._t('</members>').i--;
		t2._t('</HLayout>');
		
		$('textarea[name="searchUI"]').val(t2.toString());
	}else
		$('textarea[name="searchUI"]').val(sui.replace(/<fields>\n?(\t*?<(selectitem|checkboxitem|textitem).+\/>\n?)+\n*?\t*<\/fields>/ig,'<fields>\n'+t.toString()+'</fields>'));
	$('textarea[name="searchCondiftion"]').val(t3.toString());
}

function fromUI(){
	if(X.isEmpty($('textarea[name="resultUI"]').val())) return;
	
}

