package com.x.projectVersion;

import com.x.util.JUtil;
import com.x.util.SUtil;
import com.x.util.Util;
import com.x.util.XList;

public class Share {

	public String getShare(String username,int pageNumber){
		SUtil sUtil = new SUtil();
		StringBuffer sb = new StringBuffer();
		sb.append("select b.ID as id,b.title,c.name as status,a.ADDWHO as sharedby")
		.append(" from")
		.append(" SHARE a left join QUESTIONS b on a.QUESTIONID = b.ID")
		.append(" left join BASCODES c on b.status = c.CODE and c.CODEID = 'QUE_STS'")
		.append(" where a.SHARETOWHO = ? and a.ADDWHO <> ?")
		.append(" order by a.ID desc");
		sUtil.add(username,username);
		sUtil.setColumns("id,title,status,sharedby");
		XList<String> rows = sUtil.fetch(sb.toString(), pageNumber);
		return JUtil.getDatagrid(sUtil.getTotalCount(), rows.toString());
	}
	
	public String saveShare(String username,String[] userids,String[] questionids){
		SUtil sUtil = new SUtil();
		StringBuffer sb = new StringBuffer();
		sb.append("insert into SHARE(QUESTIONID,ADDWHO,ADDTIME,SHARETOWHO)")
		.append(" values(?,?,?,?)");
		for(String userid : userids){
			for(String questionid : questionids)
				sUtil.addList(questionid,username,Util.date2String(),userid);
		}
		return sUtil.updateList(sb.toString());
	}
}
