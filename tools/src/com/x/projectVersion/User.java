package com.x.projectVersion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.x.db.DB;
import com.x.util.MD5;
import com.x.util.SUtil;
import com.x.util.Util;

/**
 * 用户信息主类
 * @author Administrator
 *
 */
public class User {

	private int start = 0;
	private int second = 5;
	private int third = 11;
	private int forth = 20;
	
	/**
	 * 登录
	 * @param username  	用户名
	 * @param pass			密码
	 * @return
	 */
	public String doLogin(String username,String pass){
		Connection con = null;
		ResultSet rs = null;
		PreparedStatement ps = null;
		StringBuffer sb = new StringBuffer();
		sb.append("select ")
		.append("password,ifnull(theme,'') as theme from USER where name = ? and active_flag = 'Y'");
		try {
			con = DB.getInstance().getConn();
			ps = con.prepareStatement(sb.toString());
			ps.setString(1, username);
			rs = ps.executeQuery();
			String sql_pass = "";
			String theme = "";
			if(rs.next()){
				sql_pass= rs.getString("password");
				theme = rs.getString("theme");
			}
			if(chkPassword(pass, sql_pass)) {
				return username+","+theme;
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally{
			DB.getInstance().close(con, ps,rs);
		}
		return "";
	}
	
	/**
	 * 注册
	 * @param username	用户名
	 * @param pass			密码
	 * @return
	 */
	public String doRegist(String username,String pass){
		StringBuffer sb = new StringBuffer();
		sb.append("insert into USER(NAME,PASSWORD,ADDTIME,ADDWHO,ACTIVE_FLAG) ")
		.append("values(?,?,?,?,?)");
		SUtil sUtil = new SUtil();
		sUtil.add(username,MD5.getMD5Str(pass),Util.date2String(),"system","Y");
		return sUtil.update(sb.toString());
	}
	
	public String updateTheme(String username,String theme){
		StringBuffer sb = new StringBuffer();
		sb.append("update USER set THEME = ? where name = ?");
		SUtil sUtil = new SUtil();
		sUtil.add(theme,username);
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
