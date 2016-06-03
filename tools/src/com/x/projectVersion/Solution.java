package com.x.projectVersion;

import com.x.util.JUtil;
import com.x.util.SUtil;
import com.x.util.Util;
import com.x.util.XList;

/**
 * 解决方案列表
 * @author XWB
 *
 */
public class Solution {

	public String getSolutions(String questionId,String username){
		String json = JUtil.getCommJson(false);
		StringBuffer sb = new StringBuffer();
		SUtil sUtil = new SUtil(false);
		sb.append("select ")
		.append("s.ID,s.SOLUTION,s.KEYWORD,s.STATUS,s.ADDWHO as RELEASER ")
		.append("from SOLUTIONS s ")
		.append("where s.QUESTIONID = ? and s.ACTIVEFLAG = 'Y' and s.ADDWHO = ? ")
		.append("order by s.ID desc");
		sUtil.add(questionId,username);
		sUtil.setColumns("ID,SOLUTION,KEYWORD,STATUS,RELEASER");
		XList<String> result = sUtil.fetch(sb.toString(), 0);
		if(result.size() > 0)
			json = "{data:"+result.toString()+",success:true,code:0,resultMsg:''}";
		return json;
	}
	
	public String saveSolution(String id,String questionId,String[] solution,String[] keyword,String[] status,String username){
		String json = JUtil.getCommJson(false);
		SUtil sUtil = new SUtil();
		if(Util.isNotNull(id)){
			//update
			for(int i=0;i<solution.length;i++){
				sUtil.addList(solution[i],keyword[i],Util.isNotNull(status[i]) ? status[i] : "00",id,username);
			}
			json = sUtil.updateList("update SOLUTIONS set SOLUTION = ?,KEYWORD = ?,STATUS = ? where ID = ? and ADDWHO = ?");
		}else{
			//insert
			for(int i=0;i<solution.length;i++){
				sUtil.addList(questionId,solution[i],keyword[i],Util.isNotNull(status[i]) ? status[i] : "00","Y",username,Util.date2String());
			}
			json = sUtil.updateList("insert into SOLUTIONS(QUESTIONID,SOLUTION,KEYWORD,STATUS,ACTIVEFLAG,ADDWHO,ADDTIME) values(?,?,?,?,?,?,?)");
		}
		return json;
	}
	
	public String removeSolution(String id,String username){
		String json = JUtil.getCommJson(false);
		/*SUtil sUtil = new SUtil();
		sUtil.add(id,username);
		json = sUtil.update("delete from SOLUTIONS where ID = ? and ADDWHO = ?");*/
		json = JUtil.getJson("暂不开放删除功能,请与管理员联系", -1, false);
		return json;
	}
}
