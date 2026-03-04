import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const InterviewGoalModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    role: "",
    experience: "",
    skills: "",
    companies: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    await axiosInstance.post(API_PATHS.BLUEPRINT.CREATE, {
      role: form.role,
      experience: form.experience,
      skills: form.skills.split(",").map(s=>s.trim()),
      companies: form.companies.split(",").map(c=>c.trim())
    });

    onClose();
  };

  return (
    <div className="modal">
      <h2>Set Interview Goal</h2>

      <input name="role" placeholder="Role" onChange={handleChange}/>
      <input name="experience" placeholder="Experience" onChange={handleChange}/>
      <input name="skills" placeholder="Skills comma separated" onChange={handleChange}/>
      <input name="companies" placeholder="Companies" onChange={handleChange}/>

      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default InterviewGoalModal;
