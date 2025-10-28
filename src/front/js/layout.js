import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Home } from "./pages/home/home";
import { AllCourses } from "./pages/allCourses";
import { CheckoutWrapper } from "./pages/checkoutWrapper";
import { PaymentSuccess } from "./pages/paymentSucess";
import { PayPalSuccess } from "./pages/paypalSucess";
import { PayPalCancel } from "./pages/paypalCancel";
import { CourseDetails } from "./pages/courseDetails";
import { MyEnrollments } from "./pages/myEnrollments";
import { Signup } from "./pages/signup";
import { Login } from "./pages/login";
import { DashboardAdmin } from "./pages/dashboardAdmin/dashboardAdmin";
import { DashboardTeacher } from "./pages/dashboardTeacher/dashboardTeacher";
import { DashboardStudent } from "./pages/dashboardStudent/dashboardStudent";
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
            <Route element={<MyEnrollments />} path="/my-enrollments" />
            <Route element={<DashboardAdmin />} path="/admin/dashboard" />
            <Route element={<DashboardTeacher />} path="/teacher/dashboard" />
            <Route element={<DashboardStudent />} path="/student/dashboard" />
            <Route element={<CheckoutWrapper />} path="/checkout" />
            <Route element={<PaymentSuccess />} path="/payment-success" />
            <Route element={<PayPalSuccess />} path="/checkout-success" />
            <Route element={<PayPalCancel />} path="/checkout-cancel" />
            <Route element={<NotFound />} path="iji" />
          </Routes>
          <Footer />
        </ScrollToTop>
      </BrowserRouter>
    </div>
  );
};

export default injectContext(Layout);
