package com.x.pojo;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.x.db.DB;
import com.x.util.JUtil;

public class Pojo {

	public String getPojo(String tableName,String dbtype){
		String json = JUtil.getCommJson(false);
		StringBuffer sb = new StringBuffer();
		sb = new StringBuffer();
		Connection conn = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			switch (Integer.parseInt(dbtype)) {
			case 0:
				sb.append("select b.name as COLUMN_NAME,'' as COMMENTS,'' as DATA_TYPE,'' as DATA_LENGTH ")
				.append("from sys.objects a left join sys.all_columns b on a.object_id = b.object_id where a.name = ?");
				conn = DB.getInstance().getConn("ss");
				break;
			case 1:
				sb.append("select a.COLUMN_NAME,b.COMMENTS,a.DATA_TYPE,a.DATA_LENGTH,a.DATA_DEFAULT ")
				.append("from user_tab_columns a,user_col_comments b ")
				.append("where a.table_name = b.table_name(+) and a.column_name = b.column_name(+) and a.table_name = ?")
				.append(" order by a.COLUMN_NAME");
				conn = DB.getInstance().getConn("orcl");
				break;
			case 2:
				conn = DB.getInstance().getConn();
				break;
			}
			ps = conn.prepareStatement(sb.toString());
			ps.setString(1, tableName.toUpperCase());
			System.out.println("tablename:"+tableName.toUpperCase());
			rs = ps.executeQuery();
			String cols = "",coms = "",dType = "",dlen = "",dDefault = "";
			while (rs.next()){
				cols += rs.getString("COLUMN_NAME") + ",";
				coms += (rs.getString("COMMENTS") == null ? "," : rs.getString("COMMENTS")) + ",";
				dType += (rs.getString("DATA_TYPE") == null ? "," : rs.getString("DATA_TYPE")) + ",";
				dlen += (rs.getString("DATA_LENGTH") == null ? "," : rs.getString("DATA_LENGTH")) + ",";
				String  df = rs.getString("DATA_DEFAULT");
				dDefault += (df == null ? "," : df + ",");
			}
			if(!"".equals(cols)){
				cols = cols.replace(",","\",\"");
				coms = coms.replace(",","\",\"");
				dType = dType.replace(",","\",\"");
				dlen = dlen.replace(",","\",\"");
				dDefault = dDefault.replace(",", "\",\"");
				dDefault = dDefault.replaceAll("\\n", "");
				json = "{data:{\"COLUMNS\":[\""+cols.substring(0,cols.length() - 2)+"],"
						+ "\"COMMENTS\":[\""+coms.substring(0,coms.length() - 2)+"],"
								+ "\"DATATYPE\":[\""+dType.substring(0,dType.length() - 2)+"],"
										+ "\"DATALENGTH\":[\""+dlen.substring(0,dlen.length()-2)+"]}}";
//					,"
//							+ "\"DATADEFAULT\":[\""+dDefault.substring(0,dDefault.length() - 2)+"]
			}else
				json = JUtil.getJson("表名无效或者未创建表", -1, false);
		} catch (Exception e) {
			e.printStackTrace();
			json = JUtil.getJson("查询失败,请重试", -2, false);
		} finally{
			DB.getInstance().close(conn, ps,rs);
		}
		return json;
	}
}
