import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuCircle, LuListCollapse } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";

import RoleInfoHeader from "./components/RoleInfoHeader"
import axiosInstance from "../../utils/axiosInstance"
import { API_PATHS } from "../../utils/apiPath"
import QuestionCard from "../../components/Cards/QuestionCard"
import Drawer from "../../components/Drawer"
import SkeletonLoader from "../../components/loader/SkeletonLoader";
import AIResponsePreview from "./components/AIResponseReview";

import { useRef } from "react";

const InterviewPrep = () => {
  const explanationInFlight = useRef(false);
  const explanationCache = useRef({});
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [openLearnMoreDrawer, setopenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);

  const fetchSessionDetailsById = async () => {
    try {
      console.log("Fetching session:", sessionId);
      const response = await axiosInstance.get(

        API_PATHS.SESSION.GET_ONE(sessionId)

      );
      console.log("API Response:", response.data);
      if (response.data && response.data.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error:", error)
    }
  };

  const generatedConceptExplanation = async (question) => {
    // 🔒 HARD LOCK
    if (explanationInFlight.current) return;

    // 📦 CACHE CHECK
    if (explanationCache.current[question]) {
      setExplanation(explanationCache.current[question]);
      setopenLearnMoreDrawer(true);
      return;
    }

    explanationInFlight.current = true;

    try {
      setErrorMsg("");
      setExplanation(null);
      setIsLoading(true);
      setopenLearnMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question }
      );

      if (response.data) {
        setExplanation(response.data);

        // 💾 SAVE TO CACHE
        explanationCache.current[question] = response.data;
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to generate explanation. Try again later.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      explanationInFlight.current = false;
    }
  };


  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );

      console.log(response);

      if (response.data && response.data.question) {
        fetchSessionDetailsById();
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  const payload = {
    role: sessionData?.role,
    experience: sessionData?.experience, // prevents -1, -2, etc.
    topicsToFocus: sessionData?.topicsToFocus,
    numberOfQuestions: 10,
  };

  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);

      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        payload
      );

      const generatedQuestions = aiResponse.data;

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,

        }
      );

      if (response.data) {
        toast.success("Added More Q&A!!");
        fetchSessionDetailsById();
      }

    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }

    return () => { };
  }, []);

  return (
    <>
      <RoleInfoHeader
        role={sessionData?.company ? `${sessionData.company} - ${sessionData.type}` : (sessionData?.role || "")}
        topicsToFocus={sessionData?.type || sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || "-"}
        questions={sessionData?.question?.length || "-"}
        description={sessionData?.description || `AI-driven ${sessionData?.type} interview session.`}
        lastUpdated={
          sessionData?.updatedAt
            ? moment(sessionData.updatedAt).format("Do MMM YYYY")
            : ""
        }
      />
      <div className="container mx-auto pt-4 pb-4 px-4 md:px-0">
        <h2 className="text-lg font-semibold color-black">
          Interview Q & A
        </h2>
        <div className="grid grid-cols-12 gap-4 mt-5 mb-10">
          <div className={`col-span-12 ${openLearnMoreDrawer ? "md:col-span-7" : "md:col-span-8"}`}>
            <AnimatePresence>
              {sessionData?.question?.map((data, index) => {
                console.log("Question Data:", data);
                return (
                  <motion.div
                    key={data._id || index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.4,
                      type: "spring",
                      stiffness: 100,
                      delay: index * 0.1,
                      damping: 15,
                    }}
                    layout
                    layoutId={`question-${data._id || index}`}
                  >
                    <>
                      <QuestionCard
                        question={data?.question}
                        answer={data?.answer}
                        onLearnMore={() => {
                          if (!isLoading) {
                            generatedConceptExplanation(data.question);
                          }
                        }}

                        isPinned={data?.isPinned}
                        onTogglePin={() => toggleQuestionPinStatus(data._id)}
                      />


                      {!isLoading && sessionData?.question?.length == index + 1 && (
                        <div className="flex items-center justify-center mt-5">
                          <button className="flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer"
                            disabled={isLoading || isUpdateLoader}
                            onClick={uploadMoreQuestions}>
                            {isUpdateLoader ? (
                              <SpinnerLoader />
                            ) : (
                              <LuListCollapse className="text-lg" />
                            )}{" "}
                            Load More
                          </button>
                        </div>
                      )}
                    </>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <Drawer
            isOpen={openLearnMoreDrawer}
            onClose={() => setopenLearnMoreDrawer(false)}
            title={!isLoading && explanation?.title}
          >
            {errorMsg && (
              <p className="flex gap-2 text-sm text-amber-600 font-medium">
                <LuCircleAlert className="mt-1" /> {errorMsg}
              </p>
            )}
            {isLoading && <SkeletonLoader />}
            {!isLoading && explanation && (
              <AIResponsePreview content={explanation?.explanation} />
            )}
          </Drawer>
        </div>
      </div>
    </>
  )
}

export default InterviewPrep