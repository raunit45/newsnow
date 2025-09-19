package klu.model;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import klu.repository.UsersRepository;

@Service
public class UsersManager {
	@Autowired
	UsersRepository UR;
	
	@Autowired
	EmailManager EM;
	
	
	@Autowired
	JWTManager JWT;
	
	
	public String addUser(Users U) {    
	    if(UR.validateEmail(U.getEmail()) > 0)
	      return "401::Email already exist";    
	    UR.save(U);
	    return "200::User Registered Successfully";
	}
	
	public  String recoverPassword(String email)
	{
		Users U = UR.findById(email).get();
		String message = String.format("Dear %s, \n \n Your Password is : %s", U.getFullname(), U.getPassword());
		return EM.sendEmail(U.getEmail(), "JobPortal : Password Recovery",message);
		
	}
	public String validateCredentials(String email, String password) {
		if(UR.validateCredentials(email, password)> 0) 
		{
			String token = JWT.generateToken(email);
			return "200::"+ token;
			
		}
		
		return "401::Invalid Credentials(Check Username and Password)";
		
	}

	public String getFullname(String token) {
		String email = JWT.validateToken(token);
		if(email.compareTo("401") == 0)
			return "401::Token Expired!";
		Users U = UR.findById(email).get();
		return U.getFullname();
		
		
	}
	
}

