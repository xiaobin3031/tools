package com.x.util;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;
/**
 * 通用�?
 * @author xuweibin
 *
 */
public class Util {

	//用来为明文密码加密和解密
	private static final int INDEX1 = 7;
	private static final int INDEX2 = 19;
	private static final int INDEX3 = 27;
//	private static final String SUPP = "0123456789abcdef";
	
	private static final String regExp_DOUBLE = "^[-]?[0-9]*[.]?[0-9]*";
	private static final String regExp_LessOne = "^[-]?[0]+[.][0-9]*";
	private static final String regExp_INTEGER = "^[-]?[0-9]*";
	/**
	 * 判断obj是否为空
	 * @param obj
	 * @return
	 */
	public static boolean isNotNull(Object obj){
		if(obj == null) return false;
		return (obj.toString()).trim().length() > 0;
	}
	
	public static Object ifObjNull(Object obj,Object ret){
		if(isNotNull(obj)) return obj;
		return ret;
	}
	
	/**
	 * 验证密文形式的密�?
	 * @param input  输入的密文密�?
	 * @param database  数据库中的密�?
	 * @return
	 */
	public static boolean chkPassword(String input,String database){
		if(isNotNull(database) && isNotNull(input)){
			if(input.substring(0,INDEX1).equals(database.substring(0,INDEX1)) 
					&& input.substring(INDEX2,INDEX3).equals(database.substring(INDEX2,INDEX3))){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * 判断是否为数�?
	 * @param value
	 * @return
	 */
	public static boolean isFloat(String value){
		return value.matches(regExp_DOUBLE) && !(Float.parseFloat(value)+"").equals("Infinity") && !(Float.parseFloat(value)+"").equals("-Infinity");
	}
	
	public static boolean isDouble(String value){
		return value.matches(regExp_DOUBLE) && !(Double.parseDouble(value)+"").equals("Infinity") && !(Double.parseDouble(value)+"").equals("-Infinity");
	}
	
	public static boolean isLessOne(String value){
		return value.matches(regExp_LessOne);
	}
	
	public static boolean isInteger(String value){
		return value.matches(regExp_INTEGER) && !(Integer.parseInt(value)+"").equals("Infinity") && !(Integer.parseInt(value)+"").equals("-Infinity");
	}
	
	public static boolean isLong(String value){
		return value.matches(regExp_INTEGER) && !(Long.parseLong(value)+"").equals("Infinity") && !(Long.parseLong(value)+"").equals("-Infinity");
	}
	
	/**
	 * 判断�?��字符串是否为�?
	 * @param value
	 * @return
	 */
	public static boolean isTrue(String value){
		if(isNotNull(value)){
			if(value.equalsIgnoreCase("t") || Boolean.parseBoolean(value) || value.equals("1")) return true;
		}
		return false;
	}
	
	/**
	 * 格式化Double位数
	 * @param value  要格式的�?
	 * @param digits  格式化后保留的位�?
	 * @return  如果格式化后的�?不是double,返回原�?，否则，返回新�?
	 */
	public static double formatDouble(double value,int digits){
		String reg = "%."+digits+"d";
		String result = String.format(reg);
		if(isDouble(result)){
			return Double.parseDouble(result);
		}
		return value;
	}
	
	/**
	 * 格式化float位数
	 * @param value  要格式的�?
	 * @param digits  格式化后保留的位�?
	 * @return  如果格式化后的�?不是float,返回原�?，否则，返回新�?
	 */
	public static float formatFloat(float value,int digits){
		String reg = "%."+digits+"f";
		String result = String.format(reg);
		if(isFloat(result)){
			return Float.parseFloat(result);
		}
		return value;
	}
	
	public static String date2String(){
		return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
	}
	
	/**
	 * 获取唯一的ID�?
	 * @return
	 */
	public static String getUuid() {
		return UUID.randomUUID().toString().replace("-", "");
	}
}