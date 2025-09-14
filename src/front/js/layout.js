import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Home } from "./pages/home/home";
import { AllCourses } from "./pages/allCourses";
import { CourseDetails } from "./pages/courseDetails";
import { Signup } from "./pages/signup";
import { Login } from "./pages/login";
import { DashboardAdmin } from "./pages/dashboardAdmin/dashboardAdmin";
import { DashboardTeacher } from "./pages/dashboardTeacher";
import { DashboardStudent } from "./pages/dashboardStudent";
import { NotFound } from "./pages/notFound";
import injectContext from "./store/appContext";

import { ContactMeNavbar } from "./component/contactMeNavbar";
import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";

//create your first component
const Layout = () => {
  //the basename is used when your project is published in a subdirectory and not in the root of the domain
  // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
  const basename = process.env.BASENAME || "";

  if (!process.env.BACKEND_URL || process.env.BACKEND_URL == "")
    return <BackendURL />;

  return (
    <div>
      <BrowserRouter basename={basename}>
        <ScrollToTop>
          <ContactMeNavbar />
          <Navbar />
          <Routes>
            <Route element={<Home />} path="/" />
            <Route element={<AllCourses />} path="/allCourses" />
            <Route element={<CourseDetails />} path="/courses/:slug" />
            <Route element={<Signup />} path="/signup" />
            <Route element={<Login />} path="/login" />
            <Route element={<DashboardAdmin />} path="/admin/dashboard" />
            <Route element={<DashboardTeacher />} path="/teacher/dashboard" />
            <Route element={<DashboardStudent />} path="/student/dashboard" />
            <Route element={<NotFound />} path="iji" />
          </Routes>
          <Footer />
        </ScrollToTop>
      </BrowserRouter>
    </div>
  );
};

export default injectContext(Layout);
