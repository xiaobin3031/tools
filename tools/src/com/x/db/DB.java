package com.x.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.logicalcobwebs.proxool.ProxoolException;
import org.logicalcobwebs.proxool.ProxoolFacade;
import org.logicalcobwebs.proxool.admin.SnapshotIF;

import com.mysql.jdbc.Statement;

public class DB {

	private static DB instance;
	private static int activeCount = 0;
//	private static String DB_DRIVER = "org.logicalcobwebs.proxool.ProxoolDriver";
	
	public synchronized static DB getInstance(){
		if(instance == null) instance = new DB();
		return instance;
	}
	
	public Connection getConn(){
		try {
			return DriverManager.getConnection("proxool.ms");
		} catch (SQLException e) {
			e.printStackTrace();
		} finally{
			showSnapshotInfo("ms");
		}
		return null;
	}
	public Connection getConn(String alias){
		try {
			return DriverManager.getConnection("proxool."+alias);
		} catch (Exception e) {
			e.printStackTrace();
		} finally{
			showSnapshotInfo(alias);
		}
		return null;
	}
	
	private void showSnapshotInfo(String db){
		SnapshotIF ss = null;
		try {
			ss = ProxoolFacade.getSnapshot(db,true);
		} catch (ProxoolException e) {
			e.printStackTrace();
			return;
		}
		int curActiveAcount = ss.getActiveConnectionCount();
		int availableCount = ss.getAvailableConnectionCount();
		if(curActiveAcount != activeCount){
			System.out.println("使用连接数: "+curActiveAcount + ",可用连接数:"+availableCount);
			activeCount = curActiveAcount;
		}
	}
	
	public void close(Connection con,PreparedStatement ps,ResultSet rs){
		try {
			if(rs != null){rs.close();rs = null;}
			if(ps != null){ps.close();ps = null;}
			if(con != null){con.close();con = null;}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	public void close(Connection con,PreparedStatement ps){close(con,ps,null);}
	
	public void close(Connection con,Statement s,ResultSet rs){
		try {
			if(rs != null){rs.close();rs = null;}
			if(s != null){s.close();s = null;}
			if(con != null){con.close();con = null;}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	public void close(Connection con,Statement s){close(con,s,null);}
}
