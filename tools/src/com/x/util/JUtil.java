package com.x.util;

import java.util.HashMap;
import java.util.List;
import java.util.Set;

/**
 * 主要处理json格式的字符串	--尚未使用json包
 * @author XWB	2016-05-31
 *
 */
public class JUtil {
	/**
	 * 获取JSON的格�?
	 * @param resultMsg  返回提示信息
	 * @param code  代码
	 * @param success  是否正确
	 * @param map  自定义键值对
	 * @return
	 */
	public static String getJson(String resultMsg,int code,boolean success,HashMap<String,Object> map){
		StringBuffer json = new StringBuffer();
		json.append("{");
		json.append("\"resultMsg\":\""+resultMsg+"\",");
		json.append("\"code\":"+code+",");
		json.append("\"success\":"+success);
		if(map != null && map.size() > 0){
			Set<String> keys = map.keySet();
			for(String key : keys){
				json.append(",\""+key+"\":");
				if(map.get(key) instanceof String){
					json.append("\""+map.get(key)+"\"");
				}else {
					json.append(map.get(key));
				}
			}
		}
		json.append("}");
		return json.toString();
	}
	
	/**
	 * 获取JSON的格�?
	 * @param resultMsg  返回提示信息
	 * @param code  代码
	 * @param success  是否正确
	 * @param keyAndValue  自定义键值对，由字符串组�?
	 * @return
	 */
	public static String getJson(String resultMsg,int code,boolean success){
		return getJson(resultMsg,code,success,"");
	}
	
	public static String getJson(String resultMsg,int code,boolean success,String keyAndValue){
		StringBuffer json = new StringBuffer();
		json.append("{");
		json.append("\"resultMsg\":\""+resultMsg+"\",");
		json.append("\"code\":"+code+",");
		json.append("\"success\":"+success);
		if(Util.isNotNull(keyAndValue)){
			String[] keys = keyAndValue.split(",");
			for(int i=0;i<keys.length;i++){
				if(Util.isNotNull(keys[i])){
					json.append(",\""+keys[i]+"\":");
					i++;
					if(i<keys.length){
						json.append("\""+keys[i]+"\"");
					}
				}else{
					i++;
				}
			}
		}
		json.append("}");
		return json.toString();
	}
	
	public static String getCommJson(boolean success){
		StringBuffer json = new StringBuffer();
		json.append("{");
		json.append("\"resultMsg\":\"\",");
		if(success){
			json.append("\"code\":0,");
			json.append("\"success\":"+success);
		}else{
			json.append("\"code\":-1,");
			json.append("\"success\":"+success);
		}
		json.append("}");
		return json.toString();
	}
	
	/**
	 * 获取JSON数组
	 * @param list
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static String getJsonArray(List<?> list){
		StringBuffer json = new StringBuffer();
		if(Util.isNotNull(list)){
			for(HashMap<String,String> map : (List<HashMap<String,String>>)list){
				json.append("{");
				for(String key : map.keySet()){
					json.append("\""+key+"\":"+"\""+map.get(key)+"\",");
				}
				json = new StringBuffer(json.substring(0,json.length()-1));
				json.append("},");
			}
		}
		return "["+json.substring(0,json.length()-1)+"]";
	}

	public static String getDatagrid(int totalCount,String rows){
		String resultMsg = "";
		if(totalCount <= 0) resultMsg = "未找到任何数据!";
		return "{\"total\":"+totalCount+",\"rows\":"+rows+",\"success\":true,\"code\":"+(totalCount - 1)+",\"resultMsg\":\""+resultMsg+"\"}";
	}
}
