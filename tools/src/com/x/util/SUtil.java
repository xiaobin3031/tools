package com.x.util;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.x.db.DB;

/**
 * 操作数据库的类
 * @author XWB	2016-05-14
 *
 */
public class SUtil{
	
	private int pageSize = 50;
	private String column = "";
	private ArrayList<String> condition = new ArrayList<String>();
	private ArrayList<ArrayList<String>> conditionList = new ArrayList<ArrayList<String>>();
	private boolean isNeedCount;		//是否需要总数
	private boolean isNeedPage;			//是否需要分页
	private int totalCount = 0;			//isNeedCount == true的情况下,计算SQL的总记录数
	
	public int getTotalCount() {return totalCount;}
	public void setTotalCount(int totalCount) {this.totalCount = totalCount;}
	public SUtil() {isNeedCount = true;isNeedPage = true;}
	public SUtil(boolean isNeed){this.isNeedCount = isNeed;this.isNeedPage = isNeed;}
	public SUtil(boolean isNeedCount,boolean isNeedPage){this.isNeedCount = isNeedCount;this.isNeedPage = isNeedPage;}
	
	public void setColumns(String column){this.column = column;}
	public void add(String... strs){for(String str : strs) condition.add(str);}
	public void addList(String... strs){ArrayList<String> _condition = new ArrayList<String>();for(String str : strs) _condition.add(str);conditionList.add(_condition);}
	
	/**
	 * 查询数据	--根据isNeedCount变量是否查询总数据(如果查询出来的总数小于页容量,则直接取list的size,否则,重新查询总数);
	 * 			--根据isNeedPage变量是否分页
	 * XWB
	 * @param sql		--SQL语句
	 * @param pageNum	--页码,如果isNeedPage == false,则此参数无效
	 * @return			--一个自定义的list extends ArrayList
	 */
	@SuppressWarnings("resource")
	public XList<String> fetch(String sql,int pageNum){
		XList<String> x = new XList<>();
		if(!Util.isNotNull(column)) return x;
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			con = DB.getInstance().getConn();
			ps = con.prepareStatement(sql + (isNeedPage ? " limit "+(pageNum - 1)*pageSize+","+pageNum*pageSize : ""));
			for(int i=0;i<condition.size();i++)
				ps.setString(i+1, condition.get(i));
			rs = ps.executeQuery();
			String[] columns = column.split(",");
			StringBuffer resultB = null;
			while(rs.next()){
				resultB = new StringBuffer();
				resultB.append("{");
				for(String col : columns)
					resultB.append("\""+col+"\":").append("\""+rs.getString(col)+"\",");
				resultB = resultB.replace(resultB.length() - 1, resultB.length(), "}");
				x.add(resultB.toString());
			}
			if(isNeedCount){
				if(x.size() < pageSize) setTotalCount(x.size());
				else{
					ps = con.prepareStatement("select count(1) as count from ("+sql+") a");
					rs = ps.executeQuery();
					if(rs.next()) setTotalCount(Integer.parseInt(rs.getString("count")));
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			x = new XList<>();
		} finally{
			DB.getInstance().close(con, ps,rs);
			condition.clear();
			column = "";
		}
		return x;
	}
	
	/**
	 * 保存,更新,删除操作
	 * XWB
	 * @param sql		--SQL语句
	 * @return			--一个json格式的字符串
	 */
	public String update(String sql){
		String json = "";
		int rCount = -1;
		Connection con = null;
		PreparedStatement ps = null;
		try {
			con = DB.getInstance().getConn();
			con.setAutoCommit(false);
			ps = con.prepareStatement(sql);
			for(int i=0;i<condition.size();i++)
				ps.setString(i+1, condition.get(i));
			rCount = ps.executeUpdate();
			con.commit();
			if(rCount == -1) json = JUtil.getJson("操作失败,请重试!", -1, false);
			else if(rCount == 0) json = JUtil.getJson("未修改任何数据", 0, false);
			else json = JUtil.getCommJson(true);
		} catch (Exception e) {
			try {
				con.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
			}
			e.printStackTrace();
		} finally{
			DB.getInstance().close(con, ps);
			condition.clear();
		}
		return json;
	}
	
	public String updateList(String sql){
		String json = "";
		Connection con = null;
		PreparedStatement ps = null;
		try {
			con = DB.getInstance().getConn();
			con.setAutoCommit(false);
			ps = con.prepareStatement(sql);
			for(int i = 0;i<conditionList.size();i++){
				ArrayList<String> _condition = conditionList.get(i);
				for(int j=0;j<_condition.size();j++)
					ps.setString(j+1, _condition.get(j));
				ps.addBatch();
				if(i % 100 == 0 || i == conditionList.size() - 1){
					ps.executeBatch();
					ps.clearBatch();
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
			DB.getInstance().close(con, ps);
			conditionList.clear();
		}
		return json;
	}
}
