package klu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import klu.model.Jobs;
import klu.model.JobsManager;

@RestController
@CrossOrigin(origins="*")
@RequestMapping("/jobs")
public class JobsController {

	@Autowired
	JobsManager JM;
	@PostMapping("/create")
	  public String create(@RequestBody Jobs J)
	  {
	    return JM.createJob(J);
	  }
	
	@GetMapping("/read")
	  public String read()
	  {
	    return JM.readJobs();
	  }
	
	@GetMapping("/getdata/{id}")
	  public String getData(@PathVariable("id") Long ID)
	  {
	    return JM.getData(ID);
	  }
	
	@PutMapping("/update")
	  public String update(@RequestBody Jobs J)
	  {
	    return JM.updateJob(J);
	  }
	@DeleteMapping("/delete/{id}")
	  public String delete(@PathVariable("id") Long ID)
	  {
	    return JM.deleteJob(ID);
	  }
	
}