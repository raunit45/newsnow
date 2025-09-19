package klu.model;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.gson.GsonBuilder;

import klu.repository.JobsRepository;

@Service
public class JobsManager {

	@Autowired
	JobsRepository JR;

	public String createJob(Jobs J) {
		try {
			JR.save(J);
			return "200::New job has been created";
		} catch (Exception e) {
			return "400::" + e.getMessage();
		}
	}

	public String readJobs() {
		try {
			List<Jobs> jobList = JR.findAll();
			return new GsonBuilder().create().toJson(jobList);
		} catch (Exception e) {
			return "400::" + e.getMessage();
		}
	}

	public String getData(Long id) {
		try {
			Jobs J = JR.findById(id).get();
			return new GsonBuilder().create().toJson(J);
		} catch (Exception e) {
			return "404::" + e.getMessage();
		}
	}

	public String updateJob(Jobs J) {
		try {
			JR.save(J);
			return "200::Job details has been updated";
		} catch (Exception e) {
			return "400::" + e.getMessage();
		}
	}

	public String deleteJob(Long id) {
		try {
			JR.deleteById(id);
			return "200::Job details has been deleted";
		} catch (Exception e) {
			return "404::" + e.getMessage();
		}
	}

}