package com.x.projectVersion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.x.db.DB;
import com.x.util.Const;
import com.x.util.JUtil;
import com.x.util.SUtil;
import com.x.util.Util;
import com.x.util.XList;

/**
 * 项目列表
 * @author XWB 2016-05-27
 *
 */
public class Project {

	public String getProject(String user,boolean isShare){
		StringBuffer sb = new StringBuffer();
		sb.append("select")
		.append(" p.ID as PARENT_ID,p.NAME as PARENT_NAME,(case c.ACTIVE_FLAG when 'N' then '' else ifnull(c.id,'') end) as SUB_ID,c.NAME as SUB_NAME")
		.append(" from project_parent p left join project_children c on p.ID = c.PARENT_ID")
		.append(" where p.ADDWHO = ? and ifnull(c.ADDWHO,?) = ?");
		if(isShare)
			sb.append(" and c.ISSHARE = 'Y'");
		else
			sb.append(" and ifnull(p.ISSHARE,'N') = 'N' and ifnull(c.ISSHARE,'N') = 'N'");
		sb.append(" and p.ACTIVE_FLAG = 'Y'")
		.append(" order by c.PARENT_ID desc,c.ID desc");
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		XList<String> parent = new XList<String>();
		try {
			con = DB.getInstance().getConn();
			ps = con.prepareStatement(sb.toString());
			ps.setString(1, user);
			ps.setString(2, user);
			ps.setString(3, user);
			rs = ps.executeQuery();
			String id = "";
			String pre_id = "";
			String text = "";
			XList<String> children = new XList<String>();
			while(rs.next()){
				id = rs.getString("parent_id");
				if(!id.equals(pre_id) && !"".equals(pre_id)){
					parent.add("{\"id\":\""+pre_id+"\",\"text\":\""+text+"\",\"state\":\"closed\",\"children\":"+children.toString()+"}");
					children = new XList<String>();
				}
				text = rs.getString("parent_name");
				if(Util.isNotNull(rs.getString("sub_id")))
					children.add("{\"id\":\""+rs.getString("sub_id")+"\",\"text\":\""+rs.getString("sub_name")+"\"}");
				pre_id = id;
			}
			if(!"".equals(pre_id))
				parent.add("{\"id\":\""+id+"\",\"text\":\""+text+"\",\"state\":\"closed\",\"children\":"+children.toString()+"}");
		} catch (Exception e) {
			e.printStackTrace();
		} finally{
			DB.getInstance().close(con, ps,rs);
		}
		return parent.toString();
	}
	
	@SuppressWarnings("resource")
	public String saveProject(String sUser,String sProjectId,String sProjectName,String[] aChildrens){
		System.out.println("sProjectId := "+sProjectId);
		String json = JUtil.getCommJson(false);
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			con = DB.getInstance().getConn();
			con.setAutoCommit(false);
			if(!Util.isNotNull(sProjectId)){
				ps = con.prepareStatement("insert into PROJECT_PARENT(NAME,ACTIVE_FLAG,ADDWHO,ADDTIME) values(?,?,?,?)");
				ps.setString(1, sProjectName);
				ps.setString(2, "Y");
				ps.setString(3, sUser);
				ps.setString(4, Util.date2String());
				if(ps.executeUpdate() <= 0) {
					con.rollback();
					return JUtil.getJson("保存父节点失败", Const.alertCode, false);
				}
				con.commit();
				ps = con.prepareStatement("select ID from PROJECT_PARENT where ADDWHO = ? order by ADDTIME desc limit 0,1");
				ps.setString(1, sUser);
				rs = ps.executeQuery();
				rs.next();
				sProjectId = rs.getString("ID");
			}
			System.out.println("childrens:"+aChildrens);
			if(aChildrens != null && aChildrens.length > 0){
				StringBuffer sb = new StringBuffer();
				sb.append("insert into PROJECT_CHILDREN(PARENT_ID,NAME,ACTIVE_FLAG,ADDWHO,ADDTIME)")
				.append(" select ?,?,?,?,? from PROJECT_CHILDREN where not exists(select 1 from PROJECT_CHILDREN where NAME = ? and PARENT_ID = ?)")
				.append(" limit 0,1");
				ps = con.prepareStatement(sb.toString());
				for(int i=0;i<aChildrens.length;i++){
					ps.setString(1, sProjectId);
					ps.setString(2, aChildrens[i]);
					ps.setString(3, "Y");
					ps.setString(4, sUser);
					ps.setString(5, Util.date2String());
					ps.setString(6, aChildrens[i]);
					ps.setString(7, sProjectId);
					ps.addBatch();
					if((i>0 && i % 100 == 0) || i == aChildrens.length - 1){
						ps.executeBatch();
						ps.clearBatch();
					}
				}
			}
			con.commit();
			json = JUtil.getCommJson(true);
		} catch (Exception e) {
			try {
				con.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
			}
			e.printStackTrace();
		} finally{
			DB.getInstance().close(con, ps,rs);
		}
		return json;
	}
	
	public String getProjectParent(String username){
		StringBuffer sb = new StringBuffer();
		sb.append("select id,name from PROJECT_PARENT where ADDWHO = ? and ACTIVE_FLAG = 'Y'");
		SUtil sUtil = new SUtil(false);
		sUtil.add(username);
		sUtil.setColumns("id,name");
		return JUtil.getDatagrid(sUtil.getTotalCount(), sUtil.fetch(sb.toString(), 0).toString());
	}
	
	public String shareProject(String username,String[] parents,String[] childrens,String[] friends){
		String[] sqls = new String[2];
		StringBuffer sb = new StringBuffer();
		sb.append("insert into PROJECT_PARENT(NAME,ACTIVE_FLAG,ADDWHO,ADDTIME,EDITWHO,EDITTIME,ISSHARE,SHOW_SEQ)")
		.append(" select NAME,ACTIVE_FLAG,?,?,?,?,'Y',SHOW_SEQ from PROJECT_PARENT where id in (");
		ArrayList<String> parent = new ArrayList<String>();
		for(int i=0;i<parents.length;i++){
			sb.append("?,");
			parent.add(parents[i]);
		}
		sqls[0] = sb.substring(0,sb.length() - 1)+")";
		sb = new StringBuffer();
		sb.append("insert into PROJECT_CHILDREN(PARENT_ID,NAME,ACTIVE_FLAG,ADDWHO,ADDTIME,EDITWHO,EDITTIME,ISSHARE,SHOW_SEQ)")
		.append(" select PARENT_ID,NAME,ACTIVE_FLAG,?,?,?,?,'Y',SHOW_SEQ from PROJECT_CHILDREN where id in (");
		ArrayList<String> children = new ArrayList<>();
		for(int i=0;i<childrens.length;i++){
			sb.append("?,");
			children.add(childrens[i]);
		}
		sqls[1] = sb.substring(0, sb.length() - 1) + ")";
		SUtil sUtil = new SUtil();
		parent.add(0,Util.date2String());
		parent.add(0,"");
		parent.add(0,Util.date2String());
		parent.add(0,"");
		children.add(0,Util.date2String());
		children.add(0,"");
		children.add(0,Util.date2String());
		children.add(0,"");
		for(String friend : friends){
			parent.set(0, friend);
			parent.set(2, friend);
			sUtil.addLists(0, parent.toArray(new String[parent.size()]));
			children.set(0, friend);
			children.set(2, friend);
			sUtil.addLists(1, children.toArray(new String[children.size()]));
		}
		return sUtil.updateLists(sqls);
	}
	
	public String removeProject(String username,String parentId,String childrenId){
		SUtil sUtil = new SUtil();
		StringBuffer sb = new StringBuffer();
		sb.append("update");
		if(!"".equals(childrenId)){
			sb.append(" PROJECT_CHILDREN");
			sUtil.add(childrenId);
		}else if(!"".equals(parentId)){
			sb.append(" PROJECT_PARENT");
			sUtil.add(parentId);
		}
		sb.append(" set ACTIVE_FLAG = 'N' where id = ?");
		return sUtil.update(sb.toString());
	}
	
}
