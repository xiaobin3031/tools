package com.x.projectVersion;

import java.util.List;

import com.x.util.JUtil;
import com.x.util.SUtil;
import com.x.util.Util;

/**
 * 问题列表
 * @author XWB 2016-05-27
 *
 */
public class Question {

	public String getQuestions(String username,int pageNum,String parentId,String childrenId,String status){
		String json = JUtil.getCommJson(false);
		StringBuffer sb = new StringBuffer();
		SUtil sUtil = new SUtil();
		sb.append("select")
		.append(" q.id,q.title,q.status")
		.append(" from QUESTIONS q")
		.append(" where q.ACTIVE_FLAG = 'Y'")
		.append(" and q.ADDWHO = ? and q.PARENT_ID = ?");
		sUtil.add(username,parentId);
		if(Util.isNotNull(childrenId)){
			sb.append(" and ifnull(q.CHILDREN_ID,'') = ?");
			sUtil.add(childrenId);
		}
		if(Util.isNotNull(status)){
			sb.append(" and q.STATUS = ?");
			sUtil.add(status);
		}
		sb.append(" order by q.CHILDREN_ID,q.ID desc");
		sUtil.setColumns("id,title,status");
		List<String> rows = sUtil.fetch(sb.toString(), pageNum);
		json = "{\"total\":"+sUtil.getTotalCount()+",\"rows\":"+rows.toString()+",\"success\":true}";
		return json;
	}
	
	public String saveQuestion(String username,String[] ids,String[] status,String[] question,String parentId,String childrenId){
		String json = "";
		SUtil sUtil = new SUtil();
		if(ids != null){
			//update
			for(int i=0;i<ids.length;i++){
				sUtil.addList(Util.isNotNull(status[i]) ? status[i] : "00",question[i],ids[i]);
			}
			json = sUtil.updateList("update QUESTIONS set STATUS = ?,TITLE = ? where ID = ?");
		}else{
			//insert
			for(int i=0;i<question.length;i++){
				sUtil.add(parentId,Util.isNotNull(childrenId) ? childrenId : "0",question[i],status[i],"Y",username,Util.date2String());
			}
			json = sUtil.updateList("insert into QUESTIONS(PARENT_ID,CHILDREN_ID,TITLE,STATUS,ACTIVE_FLAG,ADDWHO,ADDTIME) values(?,?,?,?,?,?,?)");
		}
		return json;
	}
	
	public String removeQuestion(String username,String id){
		String json = "";
		/*SUtil sUtil = new SUtil();
		sUtil.add(id,username);
		json = sUtil.update("delete from QUESTIONS where id = ? and ADDWHO = ?");*/
		json = JUtil.getJson("暂不开放删除功能,请与管理员联系", -1, false);
		return json;
	}
}
