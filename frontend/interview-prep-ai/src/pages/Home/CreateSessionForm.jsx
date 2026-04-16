import React,{ useState } from "react"
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
const CreateSessionForm = () => {
    const [blueprintId, setBlueprintId] = useState(null);
    const [formData , setFormData] = useState({
        role:"",
        experience:"",
        topicsToFocus:"",
        description:"",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handlechange = (key,value) => {
        setFormData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();

        const { role, experience, topicsToFocus} = formData;

        if(!role || !experience || !topicsToFocus){
            setError("Please fill all the required fields.")
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const aiResponse = await axiosInstance.post(
                API_PATHS.AI.GENERATE_QUESTIONS,
                {
                    role,
                    experience,
                    topicsToFocus,
                    numberOfQuestions: 10,
                }
            );

            const generatedQuestions = aiResponse.data;

            const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
                ...formData,
                questions: generatedQuestions,
                blueprint: blueprintId,
            });

            if(response.data?.session?._id) {
                // 💾 PERSIST FOR GLOBAL RESOURCES
                const interviewData = { blueprint: formData, questions: generatedQuestions };
                console.log("SAVED DATA:", interviewData);
                localStorage.setItem("interviewData", JSON.stringify(interviewData));
                
                navigate(`/interview-prep/${response.data?.session?._id}`);
            }
        } catch (error) {
            if(error.response && error.response.data.message){
                setError(error.response.data.message);
            }else{
                setError("Something went wrong. Please try again.")
            }
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        const fetchBlueprint = async () => {
            try {
                const res = await axiosInstance.get(API_PATHS.BLUEPRINT.GET);
                if (res.data) setBlueprintId(res.data._id);
            } catch (err) {
                console.error("Error fetching blueprint for session:", err);
            }
        };
        fetchBlueprint();
    }, []);

    return (
    <div className="w-[90vw] md:w-[35vw] p-7 flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-black">
            Start a New Interview Journey
        </h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-3">
            Fill out a few quick details and  unlock your personalized set of 
            interview questions!
        </p>

        <form onSubmit={handleCreateSession} className="flex flex-col  gap-3">
            <Input
             value={formData.role}
             onChange={({target}) => handlechange("role", target.value)}
             label="Target Role"
             placeholder="(e.g., Frontend Developer,UI/UX Designer, etc.)"
             type="text"
             />

            <Input
            value={formData.experience}
            onChange={({target}) => handlechange("experience",target.value)}
            label="Years of Experience"
            placeholder="(e.g., 1 year, 3 years, 5+ years)"
            type="number"
            />

            <Input 
            value={formData.topicsToFocus}
            onChange={({target}) => handlechange("topicsToFocus",target.value)}
            label="Topics To Focus On"
            placeholder="(Comma-separated, e.g., React, Node.js, MongoDB)"
            type="text"
            />

            <Input 
            value={formData.description}
            onChange={({target}) => handlechange("description",target.value)}
            label="Description"
            placeholder="(Any specific goals or notes for this session)"
            type="text"
            />

            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

            <button
            type="submit"
            className="h-10 w-full text-white bg-black hover:bg-[#f4cfc3] rounded transition-colors duration-300"
            disabled={isLoading}
            >
                <div className="flex justify-center items-center gap-3">
            {isLoading && <SpinnerLoader />}  Create Session
            </div>
            </button>
        </form>
    </div>
   
)}

export default CreateSessionForm;