package com.x.projectVersion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.x.db.DB;
import com.x.util.MD5;
import com.x.util.SUtil;
import com.x.util.Util;

public class User {

	private int start = 0;
	private int second = 5;
	private int third = 11;
	private int forth = 20;
	
	public String doLogin(String username,String pass){
		Connection con = null;
		ResultSet rs = null;
		PreparedStatement ps = null;
		StringBuffer sb = new StringBuffer();
		sb.append("select ")
		.append("password from USER where name = ? and active_flag = 'Y'");
		try {
			con = DB.getInstance().getConn();
			ps = con.prepareStatement(sb.toString());
			ps.setString(1, username);
			rs = ps.executeQuery();
			String sql_pass = "";
			if(rs.next()){
				sql_pass= rs.getString("password");
			}
			if(chkPassword(pass, sql_pass)) return username;
		} catch (Exception e) {
			e.printStackTrace();
		} finally{
			DB.getInstance().close(con, ps,rs);
		}
		return "";
	}
	
	public String doRegist(String username,String pass){
		StringBuffer sb = new StringBuffer();
		sb.append("insert into USER(NAME,PASSWORD,ADDTIME,ADDWHO,ACTIVE_FLAG) ")
		.append("values(?,?,?,?,?)");
		SUtil sUtil = new SUtil();
		sUtil.add(username,MD5.getMD5Str(pass),Util.date2String(),"system","Y");
		return sUtil.update(sb.toString());
	}
	
	private boolean chkPassword(String pass,String pass_sql){
		String md5_pass = MD5.getMD5Str(pass);
		if(md5_pass.substring(start, second).equals(pass_sql.substring(start,second))
				&& md5_pass.substring(second, third).equals(pass_sql.substring(second,third))
				&& md5_pass.substring(third, forth).equals(pass_sql.substring(third,forth))) return true;
		return false;
	}
}
