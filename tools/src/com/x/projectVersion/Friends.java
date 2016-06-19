package com.x.projectVersion;

import com.x.util.JUtil;
import com.x.util.SUtil;
import com.x.util.XList;

public class Friends {

	public String getFriends(String username){
		SUtil sUtil = new SUtil(false);
		StringBuffer sb = new StringBuffer();
		sb.append("select userid from FRIENDS where ADDWHO = ? order by ADDTIME desc");
		sUtil.add(username);
		sUtil.setColumns("userid");
		XList<String> rows = sUtil.fetch(sb.toString(), 0);
		return JUtil.getDatagrid(0, rows.toString());
	}
}
