package com.x.projectVersion;

import java.util.List;

import com.x.util.Const;
import com.x.util.JUtil;
import com.x.util.SUtil;
import com.x.util.Util;

/**
 * 问题列表
 * @author XWB 2016-05-27
 *
 */
public class Question {

	/**
	 * 获取question
	 * @param username		用户
	 * @param pageNum		页码，来自前台
	 * @param parentId			projectParent的ID
	 * @param childrenId		projectChildren的ID
	 * @param status				question的状态，考虑到后面根据状态筛选
	 * @param searchTxt		筛选文本
	 * @return
	 */
	public String getQuestions(String username,int pageNum,String parentId,String childrenId,String status,String searchTxt){
		String json = JUtil.getCommJson(false);
		StringBuffer sb = new StringBuffer();
		SUtil sUtil = new SUtil();
		sb.append("select")
		.append(" q.id,q.title,bc.name as status,replace(ifnull(q.notes,''),'\n','<br>') as notes,ifnull(count(qu.id),0) as filecount")  
		.append(" from QUESTIONS q left join BASCODES bc on q.STATUS = bc.code and bc.codeid = 'QUE_STS'")
		.append(" left join QUESTIONUPLOAD qu on q.ID = qu.QUESTIONID")
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
		if(Util.isNotNull(searchTxt)){
			sb.append(" and q.title like ?");
			sUtil.add("%"+searchTxt+"%");
		}
		sb.append(" group by q.id,q.title,bc.name,q.notes")
		.append(" order by q.status,q.CHILDREN_ID,q.ID desc");
		sUtil.setColumns("id,title,status,notes,filecount");
		List<String> rows = sUtil.fetch(sb.toString(), pageNum);
		json = JUtil.getDatagrid(sUtil.getTotalCount(), rows.toString());
		return json;
	}
	
	/**
	 * 保存question，包括新增和修改
	 * @param username
	 * @param ids
	 * @param status
	 * @param question
	 * @param parentId
	 * @param childrenId
	 * @param editwho
	 * @return
	 */
	public String saveQuestion(String username,String[] ids,String[] status,String[] question,String parentId,String childrenId,String editwho){
		String json = "";
		SUtil sUtil = new SUtil();
		if(ids != null && ids.length > 0 && !ids[0].equals("")){
			//update
			for(int i=0;i<ids.length;i++){
				sUtil.addList(Util.isNotNull(status[i]) ? status[i] : "00",question[i],Util.date2String(),editwho,ids[i],username);
			}
			json = sUtil.updateList("update QUESTIONS set STATUS = ?,TITLE = ?,EDITTIME = ?,EDITWHO = ? where ID = ? and ADDWHO = ?");
		}else{
			//insert
			for(int i=0;i<question.length;i++){
				sUtil.addList(parentId,Util.isNotNull(childrenId) ? childrenId : "0",question[i],status[i],"Y",username,Util.date2String());
			}
			json = sUtil.updateList("insert into QUESTIONS(PARENT_ID,CHILDREN_ID,TITLE,STATUS,ACTIVE_FLAG,ADDWHO,ADDTIME) values(?,?,?,?,?,?,?)");
		}
		return json;
	}
	
	/**
	 * 移除question，暂时不开放
	 * @param username
	 * @param id
	 * @return
	 */
	public String removeQuestion(String username,String id){
		SUtil sUtil = new SUtil();
		sUtil.add(id,username,Const.SUPERROLE);
		return sUtil.update("delete a from QUESTIONS a,USER b where a.ADDWHO = b.NAME and a.id = ? and a.ADDWHO = ? and b.role = ?");
	}
	
	/**
	 * 保存question的说明，因为暂时不好和数据一起保存，所以分开处理
	 * @param username
	 * @param questionid
	 * @param notes
	 * @return
	 */
	public String saveQuesNotes(String username,String questionid,String notes){
		StringBuffer sb = new StringBuffer();
		sb.append("update questions set notes = ? where id = ? and addwho = ?");
		SUtil sUtil = new SUtil();
		sUtil.add(notes,questionid,username);
		return sUtil.update(sb.toString());
	}
	
	/**
	 * 将question转移至其他的project下，一次可以转移多个question，但是只能转移到其中一个project(父或子)
	 * @param username
	 * @param parentid
	 * @param childrenid
	 * @param questionids
	 * @return
	 */
	public String transfer(String username,String parentid,String childrenid,String[] questionids){
		SUtil sUtil = new SUtil();
		StringBuffer sb = new StringBuffer();
		sb.append("update QUESTIONS set PARENT_ID = ?,CHILDREN_ID = ? where ID = ? and ADDWHO = ? and ACTIVE_FLAG = 'Y' and CHILDREN_ID <> ?");
		for(String questionid : questionids)
			sUtil.addList(parentid,childrenid,questionid,username,childrenid);
		return sUtil.updateList(sb.toString());
	}
	
	public String saveFile(String username,String questionid,String path,String filename){
		SUtil sUtil = new SUtil();
		StringBuffer sb = new StringBuffer();
		sb.append("insert into QUESTIONUPLOAD(QUESTIONID,PATH,FILENAME,ADDWHO,ADDTIME) values(?,?,?,?,?)");
		path = path.substring(path.indexOf("tools")+"tools".length()).replace("\\", "/");
		sUtil.add(questionid,path,filename,username,Util.date2String());
		return sUtil.update(sb.toString());
	}
	
	public String getFileGrid(String username,String id){
		SUtil sUtil = new SUtil(false);
		StringBuffer sb = new StringBuffer();
		sb.append("select path,filename,date_format(addtime,'%Y-%c-%d %h:%i:%s') as addtime,path+'/'+filename as download")
		.append(" from QUESTIONUPLOAD")
		.append(" where QUESTIONID = ? and ADDWHO = ?")
		.append(" order by id desc");
		sUtil.setColumns("path,filename,addtime,download");
		sUtil.add(id,username);
		return JUtil.getDatagrid(sUtil.getTotalCount(), sUtil.fetch(sb.toString(), 0).toString());
	}
}
