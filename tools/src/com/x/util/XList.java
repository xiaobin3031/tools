package com.x.util;

import java.util.ArrayList;

/**
 * 自定义的ArrayList,主要是重写下列方法
 * 1.toString();
 * @author XWB	2016-05-18
 *
 * @param <E>
 */
public class XList<E> extends ArrayList<E>{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Override
	public String toString() {
		StringBuffer _sb = new StringBuffer();
		_sb.append("[");
		for(E _s : this)
			_sb.append(_s+",");
		return _sb.substring(0,_sb.length() == 1 ? 1 : _sb.length() - 1) + "]";
	}
	
}
