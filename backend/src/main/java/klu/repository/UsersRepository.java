package klu.repository;
import klu.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
@Repository
public interface UsersRepository extends JpaRepository<Users, String >{
	
	@Query("select count(U) from Users U where U.email=:email")
	public int validateEmail( @Param("email") String email );
	
	
	@Query("select count(U) from Users U where U.email=:email and U.password=:password")
	  public int validateCredentials(@Param("email") String email, @Param("password") String password);
}
