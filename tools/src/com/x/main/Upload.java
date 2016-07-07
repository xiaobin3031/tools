package com.x.main;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;

import com.x.projectVersion.Question;
import com.x.util.Const;
import com.x.util.JUtil;
import com.x.util.Util;

@WebServlet(name="fileUpload", urlPatterns={"/upload.php"})
@MultipartConfig
public class Upload extends HttpServlet{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private int curFileIndex = 0;
//	private int totalFileLength = 0;
	
	/*private static final String IMGTYPE = "(?i)(bmp|jpg|jpeg|png|gif)";
	private static final String UPLOADFILE= "uploadfile";
	private static final String UPLOADIMG = "uploadimg";*/
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		resp.setContentType("text/html;charset="+Const.CHARSET);
		System.out.println("Servlet := upload");
		String json = "";
		Object username = req.getSession().getAttribute("username");
		PrintWriter out = resp.getWriter();
		//以下采用AJAX上传文件
		if(Util.isNotNull(username)){
			String action = req.getParameter("action");
			String subAction = req.getParameter("subAction");
			if("question".equals(action)){
				if("uploadFile".equals(subAction)){
					String path = req.getSession().getServletContext().getRealPath("");
					String questionid = req.getParameter("questionid");
					path += File.separator + "upload";
					String filename = req.getParameter("filename");
					String file = req.getParameter("file");
					String fileMsg = outputFile(path, file, filename);
					if(fileMsg.equals("true")){
						Question q = new Question();
						json = q.saveFile(username.toString(), questionid, path, filename);
					}else
						json = JUtil.getJson("存储文件["+filename+"]失败，原因："+fileMsg, Const.fail, false);
				}else if("getProgress".equals(subAction)){
					json = JUtil.getJson("", 0, true,"progress,"+curFileIndex);
				}
			}
		}else
			json = JUtil.getJson("用户未登录", Const.notLogin, false);
		try {
			out.println(json);
		} catch (Exception e) {
			e.printStackTrace();
		} finally{
			if(out != null){
				out.flush();
				out.close();
				out = null;
			}
		}
	}
	
	private String outputFile(String path,String file,String filename){
		String flag = "false";
		OutputStream fileout = null;
		File _file = new File(path);
		if(!_file.exists()) _file.mkdir();
		_file = new File(path + File.separator + filename);
		//开始写文件
		try {
			fileout = new FileOutputStream(_file);
			byte[] bs = Base64.decodeBase64(file);
			fileout.write(bs);
			curFileIndex ++;
			flag = "true";
		} catch (Exception e) {
			e.printStackTrace();
			flag = e.getMessage();
		} finally{
			if(fileout != null){
				try {
					fileout.flush();
					fileout.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
				fileout = null;
			}
		}
		return flag;
	}
	
	/**
	 * 获取文件名
	 */
	/*private String getFileName(Part part){
		final String partHeader = part.getHeader("content-disposition");
		for(String content : partHeader.split(";")){
			if(content.trim().startsWith("filename")){
				return content.substring(content.indexOf("=")+1).trim().replace("\"","");
			}
		}
		return "";
	}*/

	//以下方法适用form表单上传文件
			/*if(Util.isNotNull(username)){
				String path = req.getSession().getServletContext().getRealPath("");
				final Part part = req.getPart("imgs[]");
				String filename = getFileName(part);
				byte[] bs = filename.getBytes();
				filename = new String(bs,Const.CHARSET);
				if(filename.matches("\\."+IMGTYPE+"$"))
					//该文件是图片，就放在图片uoload文件夹下
					path += File.separator + UPLOADIMG;
				else
					//放在文件upload文件夹下
					path += File.separator + UPLOADFILE;
				path += File.separator + username;
				File file = new File(path);
				if(!file.exists()) file.mkdirs();
				path += File.separator + filename;
				file = new File(path);
				if(!file.exists()){
					//该文件不存在，开始写入文件
					file.createNewFile();
					OutputStream fileout = null;
					InputStream filecontent = null;
					try {
						fileout = new FileOutputStream(file);
						filecontent = part.getInputStream();
						int read = 0;
						final byte[] bytes = new byte[1024];
						while((read = filecontent.read(bytes)) != -1){
							fileout.write(bytes,0,read);
						}
					} catch (Exception e) {
						e.printStackTrace();
					} finally{
						if(filecontent != null){
							filecontent.close();
							filecontent = null;
						}
						if(fileout != null){
							fileout.flush();
							fileout.close();
							fileout = null;
						}
					}
					json = JUtil.getJson("New File "+filename+" is created!", Const.success, true);
				}else{
					json = JUtil.getJson("同名文件已经存在，请修改！", Const.fail, false);
				}
			}else
				json = JUtil.getJson("用户未登录", Const.notLogin, false);*/
	
}
