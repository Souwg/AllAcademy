import React from "react";
import "../../styles/home.css";
import { AboutSearch } from "./aboutSearch";
import { ChooseCourses, PopularTopics } from "./chooseCourses";

export const Home = () => {
  return (
    <>
      <AboutSearch />
      <ChooseCourses />
    </>
  );
};
