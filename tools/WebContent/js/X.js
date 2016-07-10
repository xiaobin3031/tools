var usernametext = 'loginname',passtext = 'pass',globalNotes = undefined,notesFlag = false,
themeChangeIsLoaded = false,uploadFiles,uploadFileNames,inter,timeo,uploadIndex = 0;
$(function(){
	if(X.isEmpty(X.cookie.get('username'))){
		var oData = {};
		oData.action = 'login';
		oData.action = 'isLogin';
		X.ajax(oData,function(data){
			var json = X.toJson(data);
			if(json.success) {
				X.cookie.set({username:json.resultMsg,theme:json.theme});
				//判断下拉框是否已经加载完毕
				if(themeChangeIsLoaded)
					$('#themeChange').combobox('select',json.theme);
			}
		});
	}
	
	//加载更换主题
	if($('#themeChange').length > 0){
		if($('#mainCss').length > 0){
			$('#themeChange').combobox({
				url:'json/theme.json',
				valueField:'value',
				textField:'text',
				onLoadSuccess:function(){
					themeChangeIsLoaded = true;
					var theme = X.isEmpty(X.cookie.get('theme')) ? 'easyui' : X.cookie.get('theme');
					$('#themeChange').combobox('select',theme);
				},
				onSelect:function(record){
					if(X.isEmpty(record.value)) $('#mainCss').attr('href','css/earyui.css');
					else $('#mainCss').attr('href','css/'+record.value+'.css');
				}
			});
		}else
			$('#themeChange').parent().remove();
	}
});
var X={
cons:{url:'action.php',upload:'upload.php',pageSize:50,alertCode:-200,notLogin:-101},
que_sts:{'已创建':'00','已解决':'50'},
init:function(){
    X.ajax({action:"userOrAdmin"},function(data){
           var json = X.toJson(data);
           if(json.success){
           location.href = X.url.home + json.href;
           }else{
           X.dialog(json.resultMsg);
           }
           });
},
ajax:function(data,callback,url){
    var s = {};
    s.type="POST";
    s.url = X.isEmpty(url) ? X.cons.url : url;
    s.data = data;
    s.success = callback;
    s.error = function(){
    	alert("请求发生异常，请重试");
    }
    $.ajax(s);
},
readFile:function(){
	uploadIndex = 0;
	var files = document.getElementById('fileSelect').files;
	uploadFiles = new Array();
	uploadFileNames = new Array();
	if(files.length > 0){
//		$('#quesfileprobar').progressbar({value:files.length});
		var index = 0;
		var reader = new FileReader();
		reader.onload = function(e){
			uploadFiles.push(e.target.result.replace(/^data.*?base64,/,''));
			index ++;
			$('#quesfileprobar').progressbar('setValue',parseInt(index/files.length*100));
			if(index < files.length){
				uploadFileNames.push(files[index].name);	
				reader.readAsDataURL(files[index]);
			}
		}
		uploadFileNames.push(files[index].name);
		reader.readAsDataURL(files[index]);
	}
},
closeIntervalTimeout:function(interval,timeout){
	if(interval == undefined) interval = inter;
	if(timeout == undefined) timeout = timeo;
	if(interval != undefined){
		window.clearInterval(interval);
		interval = undefined;
	}
	if(timeout != undefined){
		window.clearTimeout(timeout);
		timeout = undefined;
	}
},
getWeatherImg:function(weatherDes){
    if(weatherDes.indexOf('多云') != -1 || weatherDes.indexOf('晴') != -1){
        return 's_1.png';
    }else if(weatherDes.indexOf('多云') != -1 && weatherDes.indexOf('阴') != -1){
        return 's_2.png';
    }else if(weatherDes.indexOf('阴') != -1 && weatherDes.indexOf('雨') != -1){
        return 's_3.png';
    }else if(weatherDes.indexOf('晴') != -1 && weatherDes.indexOf('雨') != -1){
        return 's_12.png';
    }else if(weatherDes.indexOf('晴') != -1 && weatherDes.indexOf('雾') != -1){
        return 's_12.png';
    }else if(weatherDes.indexOf('晴') != -1) return 's_13.png';
    else if(weatherDes.indexOf('多云') != -1) return 's_2.png';
    else if(weatherDes.indexOf('阵雨') != -1) return 's_3.png';
    else if(weatherDes.indexOf('小雨') != -1) return 's_3.png';
    else if(weatherDes.indexOf('中雨') != -1) return 's_4.png';
    else if(weatherDes.indexOf('大雨') != -1) return 's_5.png';
    else if(weatherDes.indexOf('暴雨') != -1) return 's_5.png';
    else if(weatherDes.indexOf('冰雹') != -1) return 's_6.png';
    else if(weatherDes.indexOf('雷阵雨') != -1) return 's_7.png';
    else if(weatherDes.indexOf('小雪') != -1) return 's_8.png';
    else if(weatherDes.indexOf('中雪') != -1) return 's_9.png';
    else if(weatherDes.indexOf('大雪') != -1) return 's_10.png';
    else if(weatherDes.indexOf('暴雪') != -1) return 's_10.png';
    else if(weatherDes.indexOf('扬沙') != -1) return 's_11.png';
    else if(weatherDes.indexOf('尘沙') != -1) return 's_11.png';
    else return 's_12.png';
},
/**
 * od:需要补充进data的对象
 */
toJson:function(data,od){
    //		return JSON.parse(data);
    //		return $.parseJSON(data);
	var json = eval('('+data+')');
	if(od != undefined)
		for(var x in od)
			json[x] = od[x];
	if(json.success == false && X.cons.notLogin == json.code){
		X.loginDialog(json.needReload);
	}
    return json;
},
isEmpty:function(v){
    switch (typeof v){
		case 'undefined':
			return true;
		case 'object':
			if(v === null || v.length === 0 || (v.length === 1 && X.trim(v[0]).length == 0)) return true;
			for(var i in v){
				return false;
			}
			break;
		case 'string':
			if(X.trim(v).length == 0) return true;
            break;
		case 'boolean':
			if(!v) return true;
            break;
		case 'number':
			if(0 === v || isNaN(v)) return true;
            break;
    }
	return false;
},
copyObj:function(fromData,toData){
	if(X.getObjLenOrCompare(fromData, 0)){
		for(var x in fromData){
			toData[x] = fromData[x];
		}
	}
},
	//手机号
isTel:function(v){
    return !X.isEmpty(v) && (/^((\+|00)?86)?[1-9]\d{10}/g).test(v.replace(/ +/g,''));
},
	//固定电话
isLandLine:function(v){
    return (/[0-9^ ]{3,4} *-? *[1-9][0-9^ ]{6,7}/g).test(v.replace(/ +/g,''));
},
	//身份证
isIdCard:function(v){
    return (/\d{15}|\d{17}(\d|X)/g).test(v.replace(/ +/g,''));
},
	//email
isEmail:function(v){
    
},
trim:function(v){
    return v.replace(/^[ \t\r\n]*/g,'').replace(/[ \r\t\n]*$/g,'');
},
delSpaceArrayEle:function(v,matchedEle){
    var count = 0;
    for(var i = v.length - 1;i>=0;i--){
        if(v[i] == matchedEle){
            count ++;
        }else{
            if(count > 0){
                v.splice(i+1,count);
                count = 0;
            }
        }
    }
},
toUpperAtPos:function(v,index,len){  //将给定长度的一段字符串转换成大写
    if(X.isEmpty(v)) return;
    if(X.isEmpty(index)) index = 0;
    if(X.isEmpty(len)) len = v.length;
    v = X.trim(v);
    return v.substring(0,index)+v.substring(index,index+len).toUpperCase()+v.substring(index+len);
},
toLowerAtPos:function(v,index,len){  //将给定长度的一段字符串转换成小写
    if(X.isEmpty(v)) return;
    if(X.isEmpty(index)) index = 0;
    if(X.isEmpty(len)) len = v.length;
    v = X.trim(v);
    return v.substring(0,index)+v.substring(index,index+len).toLowerCase()+v.substring(index+len);
},
loadXMLDoc:function(dname){
    try {//Internet Explorer
        xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
    }catch(e){
        try{ //Firefox, Mozilla, Opera, etc.
		    xmlDoc=document.implementation.createDocument("","",null);
        }catch(e) { X.dialog(e.message)}
    }
    try{
        xmlDoc.async=false;
        xmlDoc.load(dname);
        return(xmlDoc);
    }catch(e) { X.dialog(e.message)}
    return(null);
},
loadXMLString:function(dname){
	if (window.DOMParser)
	  {
	  parser=new DOMParser();
	  xmlDoc=parser.parseFromString(dname,"text/xml");
	  }
	else // Internet Explorer
	  {
	  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	  xmlDoc.async="false";
	  xmlDoc.loadXML(dname);
	  }
    return xmlDoc;
},
dialog:function(v,c){
	if($('#globalNotes').length > 0){
		if(!X.isEmpty(v) && c != undefined){
			$('#globalNotes > div').css({width:'','margin-left':''});
			
			$('#globalNotes span').text(v);
			var parentWidth = parseInt($('#globalNotes').css('width').replace('px',''));
			var spanWidth = parseInt($('#globalNotes span').css('width').replace('px',''));
			spanWidth += 15;
			var leftWidth = (parentWidth - spanWidth)/2;
			$('#globalNotes > div').css({width:spanWidth+'px','margin-left':leftWidth+'px'});
			//动画展示
			$('#globalNotes').animate({bottom:'0px'},500);
			if(globalNotes != undefined){
				//说明定时器已经触发，取消动画并且取消定时
				$('#globalNotes').stop();
				window.clearTimeout(globalNotes);
				globalNotes = undefined;
			}
			if(c >= 0){
				//warn，对警告信息，设置消息框隐藏功能
				$('#globalNotes > div').css('background-color','#00CCFF');
				globalNotes = window.setTimeout(function(){
					$('#globalNotes').animate({bottom:'-30px'},'slow');
					window.clearTimeout(globalNotes);
					globalNotes = undefined;
				},3*1000+500);
			}else{
				//error，对错误信息，设置消息框不隐藏
				$('#globalNotes > div').css('background-color','#FF0033');
			}
		}
	}else{
		alert(v);
	}
},
loginDialog:function(isNeedReload,id){
	var t = new Text();
	if(X.isEmpty(id)) id = 'login';
	if($('#'+id+'Win').length > 0) $('#'+id+'Win').remove();
	$('body').append('<div id="'+id+'Win" class="easyui-window"></div>');
	var options = {width:400,height:250,modal:true,resizable:false};
	options.title="";
	$('#'+id+'Win').window(options).append('<div id="'+id+'WinLayout" class="easyui-layout" data-options="fit:true"></div>');
	$('#'+id+'WinLayout').layout();
	$('#'+id+'WinLayout').layout('add',{    
	    region: 'south',    
	    height: '25%' ,
	}); 
	$('#'+id+'WinLayout').layout('add',{    
	    region: 'center',
	    height:'75%'
	}); 
	t._('<div style="padding:20px;text-align:center;">')
	._('<div style="margin-top:15px;"><span>用  户: </span><input id="'+usernametext+'" required="true" type="text" style="width:60%;height:30px;"></div>')
	._('<div style="margin-top:15px;"><span>密  码: </span><input id="'+passtext+'" required="true" type="password" style="width:60%;height:30px;"></div>')
	._('</div>');
	$('#'+id+'WinLayout').layout('panel','center').append(t.toString());
	$('#'+usernametext).textbox();
	$('#'+passtext).textbox();
	t.close();
	t._('<div style="width:40%;text-align:center;float:left;margin-left:10%;margin-top:20px;">')
	._('<a id="'+id+'WinLayoutOKBtn" class="easyui-linkbutton" data-options="iconCls:\'icon-ok\'" ')
	._('href="javascript:void(0)" onclick="login(\''+isNeedReload+'\',\''+id+'Win'+'\');" style="width:80px">登录</a></div>')
	._('<div style="width:40%;text-align:center;float:left;margin-top:20px;">')
	._('<a id="'+id+'WinLayoutCANBtn" class="easyui-linkbutton" data-options="iconCls:\'icon-cancel\'" ')
	._('href="javascript:void(0)" onclick="regist();" style="width:80px">注册</a>')
	._('</div>');
	$('#'+id+'WinLayout').layout('panel','south').append(t.toString());
	$('#'+id+'WinLayoutOKBtn').linkbutton();
	$('#'+id+'WinLayoutCANBtn').linkbutton();
	$('#'+usernametext).textbox('textbox').bind('keyup',function(e){
		loginDialogKeyup(e, id);
	});
	$('#'+passtext).textbox('textbox').bind('keyup',function(e){
		loginDialogKeyup(e, id);
	});
	$('#'+usernametext).textbox('textbox').focus();
},
//比较json对象的键值对个数和给定数值的大小，如果com空，则返回data的键值对个数
getObjLenOrCompare:function(data,com){
    var size = 0;
    //com == undefined
    if(X.isEmpty(com)){
    	if(!X.isEmpty(data)){
    		for(x in data){
        		size ++;
        	}
    	}
    	return size;
    }else{
    	if(com<0) return true;
    	else{
    		if(!X.isEmpty(data)){
    			for(x in data){
        			com --;
        			if(com < 0) return true;
        		}
    		}
    		return false;
    	}
    }
},
getSepStr:function(v,sep){
	if(X.isEmpty(sep)) sep = ',';
	var r = new RegExp('^'+sep+'+|'+sep+'+$','g');
	v = v.replace(/[\t\n ]+/g,sep).replace(r,'');
	r = new RegExp(sep+'+','g');
	v = v.replace(r,sep);
	return v;
},
removeRepStr:function(v){
	if(X.isEmpty(v)) return;
	var t;
	if(v.charAt(0) != ',') v += ',';
	while(/,([a-z_0-9]+),.*?\1[^\d]/ig.test(v) && v != ''){
		t = v.match(/,([a-z_0-9]+),(.*?)\1[^\d]/i);
		if(t != null && t.length > 0)
			v = v.replace(t[0],','+t[t.length - 2]+','+t[t.length - 1]);
		else
			break;
	}
	return v;
},
toEntities:function(v){
	return v.replace(/'/g,'&#39;').replace(/"/g,'&#34;').replace(/</g,'&#60;').replace(/>/g,'&#62;');
},
fromEntities:function(v){
	return v.replace(/&#39;/g,"'").replace(/&#34;/g,'"').replace(/&#60;/g,'<').replace(/&#62;/g,'>');
},
rhtmlC:function(v){
	if(X.isEmpty(v)) return '';
	v = v.replace(/"/g,'&#34;');
	v = v.replace(/'/g,'&#39;');
	return v;
},
toUrl:function(v){
	if(X.isEmpty(v)) return '';
	var regexp = new RegExp('https?:\/\/[a-zA-Z0-9]+\.[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)?(:[0-9]{1,5})?(/[a-zA-Z0-9?=]+)?','g');
	var av = v.match(regexp);
	if(av == null) return v;
	for(var i=0;i<av.length;i++){
		v = v.replace(av[i],'<a href="'+av[i]+'" target="_blank">'+av[i]+'</a>');
	}
	return v;
}
}
X.html={
disBtn:function(names,boos){
    if(names.indexOf(",") >= 0){
        var name = names.split(',');
        var boo = boos.split(',');
        for(x in name){
            $('input[name="'+name[x]+'"]').attr('disabled',boo[x]);
        }
    }else{
        $('input[name="'+names+'"]').attr('disabled',boos);
    }
},
getInputs:function(){
	var src = window.location.href;
	var data = {};
    if(src.indexOf('?inputs') > -1){
        var inputs = src.substr(src.indexOf('?inputs') + '?inputs'.length + 1).split('&');
        for(var i=0;i<inputs.length;i++){
            data[decodeURIComponent(inputs[i].split('=')[0])] = inputs[i].split('=').length > 1 ? decodeURIComponent(inputs[i].split('=')[1]) : '';
        }
    }
	return data;
},
setInputs:function(data,toHtml){
    var href = '';
    if(X.getObjLenOrCompare(data,0)){
        href = href + '?inputs';
        for(var x in data){
            href = href + '&' + encodeURIComponent(x) + '=' + encodeURIComponent(data[x]);
        }
    }
    if(!X.isEmpty(toHtml)){
        href = toHtml + href;
    }
    return href;
},
setOverlay:function(txt){
    var t = '正在加载数据...';
    if(typeof txt == 'number'){
        switch(txt){
            case 0:
                t = '正在提交数据...';
                break;
            case 1:
                t = '正在查询天气...';
                break;
        }
    }else if(!X.isEmpty(txt)){
        t = txt;
    }
    if($('.overlayX').length <= 0) $('body').append('<div class="overlayX"><div><img src="loading.gif"/><span>'+t+'</span></div></div>');
    $('.overlayX').css('display','block');
},
removeOverlay:function(cls){
    if(X.isEmpty(cls)) cls = 'overlayX';
    $('.'+cls).css('display','none');
    $('.'+cls).attr('hidden',true);
},
removeIframe:function(){
	var c1,c2,nt;
	for(var i=0;i<arguments.length && i<3;i++){
		if(typeof arguments[i] == 'number') nt = arguments[i];
		else if(arguments[i].indexOf('overlay') >= 0) c1 = arguments[i];
		else c2 = arguments[i];
	}
	if(X.isEmpty(nt)) nt = 0;
	X.html.removeOverlay(c1);
	$('.'+c2).css('display','block');
	$("body,html").animate({scrollTop: nt - 2*parseInt($('.header').css('height').replace('px',''))+10}, 1);
}
}
X.array={
contain:function(data,v){
    for(x in data){
        if(data[x] == v) return true;
    }
    return false;
}
}
X.cookie={
set:function(cookies,expiredays){
    if(X.isEmpty(cookies)) return;
    var date = new Date();
    date.setDate(date.getDate() + expiredays);
    for(var x in cookies){
    	document.cookie = x + '=' + escape(cookies[x]) + (X.isEmpty(expiredays) ? "" : ";expires="+date.toGMTString());
    }
},
get:function(name){
    if(X.isEmpty(name)) return '';
//    if(name == 'username') return '18505880795';
    if(document.cookie.length>0){
        var c_start = document.cookie.indexOf(name+'=');
        if(c_start >= 0){
            c_start = c_start + name.length + 1;
            var c_end = document.cookie.indexOf(';',c_start);
            if(c_end < 0) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return '';
}
}
X.snail=function(){
    //$('.snail').animate({"margin-left":"80%"},15000);
}
function Text(){
	this.txt = "";
	this.i = 1;
	this.t = '';
	this.n = '';
	this.b = '';//每次执行_方法的时候,都在前面拼接这个参数
	this._ = function(v){
		this.txt += this.b + (typeof v == 'undefined' ? '' : v) + this.n;
		return this;
	}
	this._t = function(v){
		this.txt += _x(this.t,this.i) + (typeof v == 'undefined' ? '' : v) + this.n;
		return this;
	}
	this.__ = function(v){
		this.txt = v + this.txt.toString();
		return this;
	}
	this.toString = function(){
		return this.txt.toString();
	}
	this.close = function(){
		this.txt = "";
		this.i = 1;
		this.t = '';
		this.n = '';
		return this;
	}
	this.sett = function(v){
		this.t = typeof v == 'undefined' ? '\t' : '';
	}
	this.setn = function(v){
		this.n = typeof v == 'undefined' ? '\n' : '';
	}
	this.settn = function(v){
		this.sett(v);
		this.setn(v);
	}
	this.setb = function(v){
		this.b = v;
	}
}

function Map(){
	this.map = {};
	this.m = function(key,value){
		if(value == undefined){
			return this.map[key];
		}else{
			this.map[key] = value;
			return this;
		}
	}
	//判断是否为空
	this.isEmpty = function(){
		for(var x in this.map) return false;
		return true;
	}
}

function _x(v,i){
	var t = ''
	if(typeof i != 'undefined' && typeof v != 'undefined' && i>=0){
		while(i>0){
			t += v;
			i--;
		}
		return t;
	}else
		return '';
	
}

function login(isNeedReload,winid){
	var oData = {};
	oData.loginname = $('#'+usernametext).textbox('getValue');
	if(X.isEmpty(oData.loginname)) {
		$('#'+usernametext).textbox('textbox').focus();
		return;
	}
	oData.pass = $('#'+passtext).textbox('getValue');
	if(X.isEmpty(oData.pass)){
		$('#'+passtext).textbox('textbox').focus();
		return;
	}
	oData.action = 'login';
	oData.subAction = 'login';
	X.ajax(oData,function(data){
		var json = X.toJson(data);
		if(json.success){
			X.cookie.set({username:oData.loginname,theme:json.theme});
			if(isNeedReload == undefined || isNeedReload == 'undefined') location.reload(true);
			else{
				if(!X.isEmpty(winid)) $('#'+winid).window('close');
				$('#globalNotes').animate({bottom:'-30px'},'slow');
			}
		}else{
			X.dialog(json.resultMsg,json.code);
			$('#'+usernametext).linkbutton('enable');
			$('#'+passtext).linkbutton('enable');
		}
	});
	$('#'+usernametext).linkbutton('disable');
	$('#'+passtext).linkbutton('disable');
}
function regist(){
	var oData = {};
	oData.loginname = $('#'+usernametext).textbox('getValue');
	if(X.isEmpty(oData.loginname)) {
		$('#'+usernametext).textbox('textbox').focus();
		return;
	}
	oData.pass = $('#'+passtext).textbox('getValue');
	if(X.isEmpty(oData.pass)){
		$('#'+passtext).textbox('textbox').focus();
		return;
	}
	oData.action = 'login';
	oData.subAction = 'regist';
	X.ajax(oData,function(data){
		var json = X.toJson(data);
		if(json.success){
			X.cookie.set({username:oData.loginname});
			location.reload(true);
		}else{
			X.dialog(json.resultMsg,json.code);
			$('#'+usernametext).linkbutton('enable');
			$('#'+passtext).linkbutton('enable');
		}
	});
	$('#'+usernametext).linkbutton('disable');
	$('#'+passtext).linkbutton('disable');
}
function loginDialogKeyup(e,id){
	if(e.keyCode == 13) $('#'+id+'WinLayoutOKBtn').click();
}
function testObj(v){
	for(var x in v){
		alert(x+';'+v[x]);
	}
}