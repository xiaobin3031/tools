package com.x.util;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;

import com.x.db.DB;

/**
 * �������ݿ����
 * @author XWB	2016-05-14
 *
 */
public class SUtil{
	
	private int pageSize = 50;
	private String column = "";
	private ArrayList<String> condition = new ArrayList<String>();
	private ArrayList<ArrayList<String>> conditionList = new ArrayList<ArrayList<String>>();
	private HashMap<Integer,ArrayList<ArrayList<String>>> conditionMap = new HashMap<Integer,ArrayList<ArrayList<String>>>();
	private boolean isNeedCount;		//�Ƿ���Ҫ����
	private boolean isNeedPage;			//�Ƿ���Ҫ��ҳ
	private int totalCount = 0;			//isNeedCount == true�������,����SQL���ܼ�¼��
	
	/**
	 * ��ȡ�ôβ�ѯ������
	 * @return
	 */
	public int getTotalCount() {return totalCount;}
	/**
	 * ���øôβ�ѯ������
	 * @param totalCount
	 */
	public void setTotalCount(int totalCount) {this.totalCount = totalCount;}
	/**
	 * ��������Ĭ��isNeedCount��isNeedPage��Ϊtrue
	 */
	public SUtil() {isNeedCount = true;isNeedPage = true;}
	/**
	 * ������������isNeedCount��isNeedPage����һ����booleanֵ
	 * @param isNeed
	 */
	public SUtil(boolean isNeed){this.isNeedCount = isNeed;this.isNeedPage = isNeed;}
	/**
	 * ���������ֱ�����isNeedCount��isNeedPage��booleanֵ
	 * @param isNeedCount
	 * @param isNeedPage
	 */
	public SUtil(boolean isNeedCount,boolean isNeedPage){this.isNeedCount = isNeedCount;this.isNeedPage = isNeedPage;}
	
	/**
	 * ������Ҫ��ѯ����
	 * @param column
	 */
	public void setColumns(String column){this.column = column;}
	/**
	 * ��������(����select,update,delete)
	 * @param strs
	 */
	public void add(String... strs){for(String str : strs) condition.add(str);}
	/**
	 * ������������(����update,delete)
	 * @param strs
	 */
	public void addList(String... strs){ArrayList<String> _condition = new ArrayList<String>();for(String str : strs) _condition.add(str);conditionList.add(_condition);}
	
	public void addLists(int index,String...strs){
		ArrayList<ArrayList<String>> list = conditionMap.get(index);
		if(list == null) list = new ArrayList<ArrayList<String>>();
		ArrayList<String> _condition = new ArrayList<String>();
		for(String str : strs) _condition.add(str);
		list.add(_condition);
		conditionMap.put(index, list);
	}
	
	/**
	 * ��ѯ����	--����isNeedCount�����Ƿ��ѯ������(�����ѯ����������С��ҳ����,��ֱ��ȡlist��size,����,���²�ѯ����);
	 * 			--����isNeedPage�����Ƿ��ҳ
	 * XWB
	 * @param sql		--SQL���
	 * @param pageNum	--ҳ��,���isNeedPage == false,��˲�����Ч
	 * @return			--һ���Զ����list extends ArrayList
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
			System.out.println("ִ��SQL := "+sql);
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
	 * ����,����,ɾ������
	 * XWB
	 * @param sql		--SQL���
	 * @return			--һ��json��ʽ���ַ���
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
			System.out.println("ִ��SQL := "+sql);
			con.commit();
			if(rCount == -1) json = JUtil.getJson("����ʧ��,������!", Const.fail, false);
			else json = JUtil.getJson("���³ɹ�,Ӱ��������: "+rCount, Const.success, true);
		} catch (Exception e) {
			try {
				con.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
			}
			e.printStackTrace();
			json = JUtil.getJson("�����쳣,ԭ��: "+e.getMessage().replaceAll("near.*", ""), Const.fail, false);
		} finally{
			DB.getInstance().close(con, ps);
			condition.clear();
		}
		return json;
	}
	
	/**
	 * �������棬���£�ɾ������(����һ��SQL)
	 * @param sql
	 * @return
	 */
	public String updateList(String sql){
		String json = "";
		Connection con = null;
		PreparedStatement ps = null;
		int resultCount = 0;
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
					int[] counts = ps.executeBatch();
					for(int count : counts)
						resultCount += count;
					ps.clearBatch();
				}
			}
			System.out.println("ִ��SQL := "+sql);
			con.commit();
			json = JUtil.getJson("�����������!Ӱ����������"+resultCount, Const.success, true);
		} catch (Exception e) {
			try {
				con.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
			}
			e.printStackTrace();
			json = JUtil.getJson("���������쳣!ԭ��: "+e.getMessage().replaceAll("near.*", ""), Const.fail, false);
		} finally{
			DB.getInstance().close(con, ps);
			conditionList.clear();
		}
		return json;
	}
	
	/**
	 * ���¶��SQL
	 * @param sqls
	 * @return
	 */
	public String updateLists(String[] sqls){
		String json = "";
		Connection con = null;
		PreparedStatement ps = null;
		int resultCount = 0;
		try {
			con = DB.getInstance().getConn();
			con.setAutoCommit(false);
			if(sqls != null && sqls.length > 0){
				for(int i=0;i<sqls.length;i++){
					ps = con.prepareStatement(sqls[i]);
					ArrayList<ArrayList<String>> list = conditionMap.get(i);
					for(int k =0;k<list.size();k++){
						for(int j=0;j<list.get(k).size();j++) ps.setString(j+1, list.get(k).get(j));
						ps.addBatch();
						if(k % 100 == 0 || k == list.get(k).size() - 1){
							int[] counts = ps.executeBatch();
							for(int count : counts)
								resultCount += count;
							ps.clearBatch();
						}
					}
					System.out.println("ִ��SQL := "+sqls[i]);
				}
				con.commit();
			}
			json = JUtil.getJson("�����������!Ӱ����������"+resultCount, Const.success, true);
		} catch (Exception e) {
			e.printStackTrace();
			try {
				con.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
			}
			json = JUtil.getJson("���������쳣!ԭ��: "+e.getMessage().replaceAll("near.*", ""), Const.fail, false);
		} finally{
			DB.getInstance().close(con, ps);
			conditionMap.clear();
		}
		return json;
	}
}
