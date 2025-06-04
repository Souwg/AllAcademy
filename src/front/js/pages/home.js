import React from "react";
import "../../styles/home.css";
import { AboutSearch } from "./aboutSearchHome";
import { ChooseCourses } from "./chooseCoursesHome";
import { SkillsHome } from "./skillsHome";
export const Home = () => {
  return (
    <>
      <AboutSearch />
      <SkillsHome />
      <ChooseCourses />
    </>
  );
};
