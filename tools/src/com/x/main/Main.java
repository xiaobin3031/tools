package com.x.main;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.x.pojo.Pojo;
import com.x.projectVersion.Project;
import com.x.projectVersion.Question;
import com.x.projectVersion.Solution;
import com.x.projectVersion.User;
import com.x.util.Const;
import com.x.util.JUtil;
import com.x.util.Util;

public class Main extends HttpServlet{

	/**
	 * servlet主入口
	 */
	private static final long serialVersionUID = 1L;
	
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		doPost(req,resp);
	}
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse res)
			throws ServletException, IOException {
		res.setCharacterEncoding("UTF-8");
		res.setContentType("text/html;charset=UTF-8");
		res.addHeader("Access-Control-Allow-Origin", "*");
		
		HttpSession session = req.getSession();
		Object username = session.getAttribute("username");
		String json = JUtil.getCommJson(false);
		String action = req.getParameter("action");
		String subAction = req.getParameter("subAction");
		if("login".equals(action)){
			if("login".equals(subAction)){
				String loginname = req.getParameter("loginname");
				String pass = req.getParameter("pass");
				User user = new User();
				String _username = user.doLogin(loginname, pass);
				if(loginname.equals(_username)){
					json = JUtil.getJson("", 0, true);
					session.setAttribute("username", loginname);
					setSessionTime(session,loginname);
				}else
					json = JUtil.getJson("用户名或者密码错误", Const.alertCode, false);
			}else if("regist".equals(subAction)){
				String loginname = req.getParameter("loginname");
				String pass = req.getParameter("pass");
				User user = new User();
				json = user.doRegist(loginname, pass);
				if(json.indexOf("\"success\":true") >= 0)
					session.setAttribute("username", loginname);
				else
					json = JUtil.getJson("注册失败，请重试", Const.alertCode, false);
			}
		}else{
			if(Util.isNotNull(username)){
				if("project".equals(action)){
					Project p = new Project();
					if("getProject".equals(subAction))
						json = p.getProject(username.toString());
					else if("saveProject".equals(subAction)){
						String sProjectName = req.getParameter("projectName");
						String sProjectId = req.getParameter("projectId");
						String[] aChildrens = req.getParameterValues("childrens[]");
						json = p.saveProject(username.toString(),sProjectId,sProjectName,aChildrens);
					}
				}else if("questions".equals(action)){
					Question q = new Question();
					String parentId = req.getParameter("parentId");
					String childrenId = req.getParameter("childrenId");
					if("getQuestions".equals(subAction)){
						String pageNumber = req.getParameter("pageNumber");
						String status = req.getParameter("status");
						String searchTxt = req.getParameter("searchTxt");
						json = q.getQuestions(username.toString(),Integer.parseInt(pageNumber),parentId,childrenId,status,searchTxt);
					}else if("saveQuestion".equals(subAction)){
						String[] id = req.getParameterValues("id[]");
						String[] status = req.getParameterValues("status[]");
						String[] question = req.getParameterValues("question[]");
						String editwho = req.getParameter("editwho");
						editwho = Util.isNotNull(editwho) ? editwho : username.toString();
						json = q.saveQuestion(username.toString(), id, status, question,parentId,childrenId,editwho);
					}else if("removeQuestion".equals(subAction)){
						String id = req.getParameter("id");
						json = q.removeQuestion(username.toString(), id);
					}
				}else if("solution".equals(action)){
					Solution a = new Solution();
					if("getSolutions".equals(subAction)){
						String questionId = req.getParameter("questionId");
						json = a.getSolutions(questionId, username.toString());
					}else if("saveSolution".equals(subAction)){
						String id = req.getParameter("id");
						String questionId = req.getParameter("questionId");
						String[] solution = req.getParameterValues("solution[]");
						String[] keyword = req.getParameterValues("keyword[]");
						String[] status = req.getParameterValues("status[]");
						String editwho = req.getParameter("editwho");
						editwho = Util.isNotNull(editwho) ? editwho : username.toString();
						json = a.saveSolution(id,questionId,solution,keyword,status,username.toString(),editwho);
					}else if("removeSolution".equals(subAction)){
						String id = req.getParameter("id");
						json = a.removeSolution(id,username.toString());
					}
				}else if("getPojo".equals(action)){
					Pojo p = new Pojo();
					String tableName = req.getParameter("TABLENAME");
					String dbtype = req.getParameter("DBTYPE");
					if(Util.isNotNull(tableName)) json = p.getPojo(tableName,dbtype);
					else json = JUtil.getJson("请输入表名或视图名", -1, false);
				}
			}else
				json = JUtil.getJson("用户未登录", -101, false);
		}
		PrintWriter pw = null;
		try {
			pw = res.getWriter();
			pw.write(json);
			System.out.println("返回结果:"+json);
		} catch (Exception e) {
			e.printStackTrace();
		} finally{
			if(pw != null){
				pw.flush();
				pw.close();
				pw = null;
			}
		}
	}
	
	private void setSessionTime(HttpSession session,String username){
		if(!Const.HOSTER.equals(username)) return;
		session.setMaxInactiveInterval(6 * 60 * 60);
	}
}
