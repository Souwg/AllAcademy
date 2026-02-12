import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useParams, Link, useNavigate } from "react-router-dom";
import noImage from "../../img/noImage.jpg";
import "../../styles/courseDetails.css";
import { StripeModal } from "./stripeModal";
import { ConfettiCanvas } from "../component/confettiCanvas";
import { useSearchParams } from "react-router-dom";

export const CourseDetails = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { store, actions } = useContext(Context);
  const { courses, coursesLoading, coursesError } = store;
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingPayPal, setLoadingPayPal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const userCountry = user?.country;
  console.log("🌍 User country:", userCountry);
  const [showVenezuelaModal, setShowVenezuelaModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchParams] = useSearchParams(); // ✅ esto crea la variable correctamente

  useEffect(() => {
    const paypalSuccess = searchParams.get("paypal_success");
    const paypalCancel = searchParams.get("paypal_cancel");

    if (paypalSuccess === "true") {
      const token = searchParams.get("token");
      if (token) {
        actions
          .capturePaypalOrder(token)
          .then((res) => {
            if (!res.error) {
              console.log("✅ Pago capturado correctamente:", res);
              actions.setLastPaymentId(res?.order?.id || token);
              setShowSuccessModal(true);
            } else {
              actions.showNotification("error", "Error capturando el pago");
            }
          })
          .catch((err) => {
            console.error("❌ Error en captura PayPal:", err);
          });
      } else {
        console.warn("⚠️ No se encontró token de PayPal en la URL");
      }
    }

    if (paypalCancel === "true") {
      actions.showNotification("error", "Payment was cancelled");
    }
  }, [searchParams]);

  const handlePayPal = async () => {
    if (!user) return navigate("/login");

    // 🛑 👉 Aquí agregamos la validación del horario seleccionado
    if (!selectedSchedule || isNaN(selectedSchedule)) {
      actions.showNotification("error", "Por favor selecciona un horario");
      return;
    }

    try {
      setLoadingPayPal(true);
      const order = await actions.createPaypalOrder(
        course.id,
        selectedSchedule
      );
      if (!order || !order.links) {
        actions.showNotification("error", "No se pudo iniciar PayPal");
        return;
      }

      const approve = order.links.find((l) => l.rel === "approve");
      if (approve?.href) {
        localStorage.setItem("pp_course_id", course.id);
        localStorage.setItem("pp_schedule_id", selectedSchedule);
        window.location.href = approve.href; // 👉 Redirección al checkout de PayPal
      } else {
        actions.showNotification("error", "No se obtuvo link de aprobación");
      }
    } catch (e) {
      console.error(e);
      actions.showNotification("error", "Error iniciando PayPal");
    } finally {
      setLoadingPayPal(false);
    }
  };

  useEffect(() => {
    if (courses.length === 0) {
      actions.loadCourses();
    }
  }, [courses.length, store.user]);

  const course = courses.find((c) => c.slug === slug);

  // 🧭 Evita mostrar "Course not found" antes de que los cursos carguen
  if (coursesLoading || courses.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Loading course...</p>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="container py-5 text-center text-danger">
        {coursesError}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-5 text-center">
        <h2>Course not found</h2>
        <Link to="/allCourses" className="btn btn-primary mt-3">
          Browse All Courses
        </Link>
      </div>
    );
  }

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedSchedule) {
      actions.showNotification("error", "Por favor selecciona un horario");
      return;
    }

    try {
      setLoadingPayment(true);
      const payment = await actions.createPaymentIntent(
        course.id,
        selectedSchedule
      );

      if (payment && payment.clientSecret) {
        setClientSecret(payment.clientSecret);
        setShowStripeModal(true);
      } else {
        actions.showNotification("error", "Error al iniciar el pago");
      }
    } catch (error) {
      console.error("❌ Error en handleBuyNow:", error);
      actions.showNotification("error", "Error al procesar la compra");
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div className="course-details-page" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Hero Section */}
      <div
        className="hero-section-course py-5"
        style={{ backgroundColor: "#001933" }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/" className="text-white-50">
                      Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/allCourses" className="text-white-50">
                      Courses
                    </Link>
                  </li>
                  <li
                    className="breadcrumb-item active text-white"
                    aria-current="page"
                  >
                    {course.title || "Untitled Course"}
                  </li>
                </ol>
              </nav>
              <h1 className="text-white display-4 fw-bold mb-3">
                {course.title || "Untitled Course"}
              </h1>
              <p className="text-white-50 lead mb-4">
                {course.description || "No description available"}
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center text-white">
                  <i className="fa-solid fa-clock me-2"></i>
                  <span>
                    Last updated {course.lastUpdated || "No update info"}
                  </span>
                </div>

                {course.liveClasses && (
                  <div className="d-flex align-items-center text-white">
                    <i className="fa-solid fa-circle-play me-2 text-warning"></i>
                    <span>
                      Live classes:{" "}
                      {course.live_class_days?.length > 0
                        ? course.live_class_days.join(" and ")
                        : "No days"}{" "}
                      de {course.live_class_start_time || "no data"}
                      {" - "}
                      {course.live_class_end_time || "no data"} (
                      {course.live_class_timezone || "no data"})
                    </span>
                  </div>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-success px-3 py-2 rounded-pill">
                  New Release
                </span>
                <span className="badge bg-info px-3 py-2 rounded-pill">
                  {course.level || "All levels"}
                </span>
                {course.liveClasses && (
                  <span className="badge bg-warning px-3 py-2 rounded-pill">
                    <i className="fa-solid fa-video"></i> Live classes
                  </span>
                )}

                {course.recordedVideos && (
                  <span className="badge bg-secondary px-3 py-2 rounded-pill">
                    <i className="fa-solid fa-video"></i> Recorded videos
                  </span>
                )}
              </div>
            </div>
            <div className="col-lg-4 d-none d-lg-block">
              <div className="ratio ratio-16x9">
                <img
                  src={course.image_url || noImage}
                  alt={course.alt || "Course image"}
                  className="img-fluid rounded-3 shadow"
                  style={{ objectFit: "cover", height: "300px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row">
          {/* Left Column */}
          <div className="col-lg-8 pe-lg-5">
            {/* What You'll Learn */}
            <section className="mb-5">
              <h2 className="section-title mb-4">
                <i className="fa-solid fa-lightbulb text-warning me-2"></i>
                What you'll learn
              </h2>
              <div className="row">
                {(course.what_you_learn?.length
                  ? course.what_you_learn
                  : ["No learning objectives available"]
                ).map((item, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <div className="d-flex">
                      <span className="text-success me-2">
                        <i className="fa-solid fa-chevron-right"></i>
                      </span>
                      <span>{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Content */}
            <section className="mb-5">
              <h2 className="section-title">
                <i className="fa-solid fa-book-open text-primary me-2"></i>
                Course content
              </h2>

              <div className="accordion" id="courseAccordion">
                {(course.modules?.length
                  ? course.modules
                  : [
                      {
                        module: "N/A",
                        title: "No modules available",
                        lessons: 0,
                      },
                    ]
                ).map((item, index) => (
                  <div
                    key={index}
                    className="accordion-item mb-2 border-0 rounded-3 overflow-hidden"
                  >
                    <h3 className="accordion-header">
                      <button
                        className="accordion-button collapsed fw-bold"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                      >
                        <span className="me-3">
                          Module {index + 1}: {item.title || "Untitled Section"}
                        </span>
                        <span className="text-muted">
                          {item.lessons?.length || 0} lessons
                        </span>
                      </button>
                    </h3>
                    <div
                      id={`collapse${index}`}
                      className="accordion-collapse collapse"
                    >
                      <div className="accordion-body pt-0">
                        {/* 📘 Descripción del módulo (si existe) */}
                        {item.description && (
                          <p
                            className="text-muted mb-3"
                            style={{ fontStyle: "italic", fontSize: "0.85rem" }}
                          >
                            {item.description}
                          </p>
                        )}

                        <div className="list-group list-group-flush">
                          {(item.lessons?.length
                            ? [...item.lessons].sort((a, b) => {
                                const ao =
                                  typeof a.order === "number"
                                    ? a.order
                                    : Number.MAX_SAFE_INTEGER;
                                const bo =
                                  typeof b.order === "number"
                                    ? b.order
                                    : Number.MAX_SAFE_INTEGER;
                                if (ao !== bo) return ao - bo;
                                const ac = a.created_at ?? 0;
                                const bc = b.created_at ?? 0;
                                return ac - bc; // más viejo primero
                              })
                            : [{ title: "No lessons available" }]
                          ).map((lesson, i) => (
                            <div
                              key={i}
                              className="list-group-item border-0 py-3 d-flex justify-content-between align-items-center"
                            >
                              <div className="d-flex align-items-center">
                                <span className="me-3 text-muted">
                                  {i + 1}.
                                </span>
                                <span>{lesson.title || "Untitled Lesson"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Requirements */}
            <section className="mb-5">
              <h2 className="section-title mb-4">
                <i className="fa-solid fa-list-check text-primary me-2"></i>
                Requirements
              </h2>
              <ul className="list-unstyled">
                {(course.requirements?.length
                  ? course.requirements
                  : ["No requirements specified"]
                ).map((item, index) => (
                  <li key={index} className="mb-2">
                    <span className="me-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructor */}
            <section className="mb-5">
              <h2 className="section-title mb-4">
                <i className="fa-solid fa-user-graduate text-info me-2"></i>
                Instructor
              </h2>

              <div className="d-flex align-items-start">
                <img
                  src={course.instructorImage || noImage}
                  alt={course.instructor || "Instructor"}
                  className="rounded-circle me-4"
                  width="100"
                  height="100"
                />

                <div>
                  <h3 className="fw-bold mb-1">
                    {course.instructor || "Unknown Instructor"}
                  </h3>
                  <p className="text-muted mb-2">
                    {course.instructorBio || "No biography available"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: "20px" }}>
              <div className="card shadow-lg border-0">
                <img
                  src={course.image_url || noImage}
                  alt={course.alt || "Course image"}
                  className="card-img-top d-lg-none"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <div className="mb-3 d-flex align-items-center">
                    <span className="course-price">
                      ${course.discount_price || course.price || "0.00"}
                    </span>
                    {course.discount_price && (
                      <span className="course-price-original">
                        ${course.price || "N/A"}
                      </span>
                    )}
                  </div>
                  {/* 📅 Selector de horario solo si es estudiante */}
                  {user && user.role === "student" ? (
                    <>
                      {course.schedules && course.schedules.length > 0 && (
                        <div className="mb-3">
                          <label htmlFor="scheduleSelect" className="fw-bold">
                            Select your schedule
                          </label>
                          <select
                            id="scheduleSelect"
                            className="form-select"
                            value={selectedSchedule}
                            onChange={(e) =>
                              setSelectedSchedule(Number(e.target.value))
                            }
                          >
                            <option value="">Choose a group...</option>
                            {course.schedules.map((schedule) => (
                              <option key={schedule.id} value={schedule.id}>
                                {schedule.group_name || "Group"}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="d-grid gap-2 mb-4">
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            if (!user) {
                              navigate("/login");
                              return;
                            }

                            if (!selectedSchedule) {
                              actions.showNotification(
                                "error",
                                "Por favor selecciona un horario"
                              );
                              return;
                            }

                            // 🔑 AQUÍ USAS userCountry
                            if (userCountry === "VE") {
                              setShowVenezuelaModal(true);
                            } else {
                              setShowPaymentModal(true);
                            }
                          }}
                        >
                          Buy Now
                        </button>

                        <button className="btn btn-outline-secondary py-3">
                          Add to Wishlist
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="d-grid gap-2 mb-4">
                      <button className="btn btn-secondary" disabled>
                        Only students can enroll
                      </button>
                      {!user && (
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => navigate("/login")}
                        >
                          Log in to enroll
                        </button>
                      )}
                    </div>
                  )}

                  <h5 className="fw-bold mb-3">This course includes:</h5>
                  <ul className="list-unstyled">
                    {/* 🔹 Lessons */}
                    <li className="mb-2">
                      <i className="fa-solid fa-video text-primary me-2"></i>
                      <span>{course.lessons || "N/A"} on-demand lessons</span>
                    </li>

                    {/* 🔹 Duración del curso (en vivo) */}
                    {course.duration && (
                      <li className="mb-2">
                        <i className="fa-solid fa-clock text-primary me-2"></i>
                        <span>Course duration: {course.duration}</span>
                      </li>
                    )}

                    {/* 🔹 Acceso al curso */}
                    {course.access_duration && (
                      <li className="mb-2">
                        <i className="fa-solid fa-calendar-days text-primary me-2"></i>
                        <span>Access duration: {course.access_duration}</span>
                      </li>
                    )}
                    {course.schedules && course.schedules.length > 0 && (
                      <li className="mb-2">
                        <i className="fa-regular fa-calendar-days text-primary me-2"></i>
                        <div>
                          <span className="schedule-block-title d-block">
                            Available Schedules:
                          </span>
                          <ul className="enroll-schedules-list">
                            {course.schedules
                              .slice(0, 3)
                              .map((schedule, index) => (
                                <li key={index}>
                                  <i className="fa-solid fa-clock"></i>
                                  <strong>
                                    {schedule.group_name ||
                                      `Group ${index + 1}`}
                                  </strong>
                                  : {schedule.day_of_week} —{" "}
                                  {schedule.start_time} - {schedule.end_time} (
                                  {schedule.timezone})
                                </li>
                              ))}
                          </ul>
                          {course.schedules.length > 3 && (
                            <span className="more-schedules">
                              + More schedules available
                            </span>
                          )}
                        </div>
                      </li>
                    )}

                    {/* 🔹 Idioma */}
                    <li className="mb-2">
                      <i className="fa-solid fa-language text-primary me-2"></i>
                      <span>
                        Language of instruction:{" "}
                        {course.language || "Not specified"}
                      </span>
                    </li>

                    {/* 🔹 Live classes */}
                    {course.liveClasses && (
                      <li className="mb-2">
                        <i className="fa-solid fa-circle-play text-primary me-2"></i>
                        <span>Live classes included</span>
                      </li>
                    )}

                    {/* 🔹 Grabaciones */}
                    {course.recordedVideos && (
                      <li className="mb-2">
                        <i className="fa-solid fa-video text-primary me-2"></i>
                        <span>Recorded videos available</span>
                      </li>
                    )}

                    {/* 🔹 Certificado */}
                    {course.certificate && (
                      <li className="mb-2">
                        <i className="fa-solid fa-certificate text-primary me-2"></i>
                        <span>Certificate of completion</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showVenezuelaModal && (
        <div className="payment-method-modal-overlay-modern">
          <div className="payment-method-modal-modern p-4 shadow-lg">
            {/* Header */}
            <div className="payment-method-header-modern text-center mb-4">
              <i className="fa-solid fa-flag fa-2x text-warning mb-2"></i>
              <h5 className="fw-bold mb-0">Payment methods for Venezuela</h5>
              <p className="text-muted small mt-1">
                Choose the payment option that works best for you
              </p>
            </div>

            {/* Opciones */}
            <div className="d-grid gap-3">
              {/* STRIPE */}
              <button
                className="payment-method-option-modern stripe"
                onClick={() => {
                  setShowVenezuelaModal(false);
                  setTimeout(() => handleBuyNow(), 300);
                }}
              >
                <i className="fa-brands fa-stripe"></i>
                Pay with Stripe
              </button>

              {/* PAYPAL */}
              <button
                className="payment-method-option-modern paypal"
                onClick={() => {
                  setShowVenezuelaModal(false);
                  handlePayPal();
                }}
              >
                <i className="fa-brands fa-paypal"></i>
                Pay with PayPal
              </button>

              {/* WHATSAPP */}
              <button
                className="payment-method-option-modern paypal"
                onClick={() => {
                  const url = `https://api.whatsapp.com/send?phone=584123421868&text=${encodeURIComponent(
                    `Hola, quiero pagar el curso ${course.title}`
                  )}`;

                  console.log("🔗 WhatsApp URL:", url);
                  window.open(url, "_blank");
                }}
              >
                <i className="fa-brands fa-whatsapp"></i>
                WhatsApp (Pago móvil y Binance Pay)
              </button>

              {/* CANCEL */}
              <button
                className="payment-method-option-modern cancel"
                onClick={() => setShowVenezuelaModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💳 Modal único de selección de método de pago (Moderno) */}
      {showPaymentModal && (
        <div className="payment-method-modal-overlay-modern">
          <div className="payment-method-modal-modern p-4 shadow-lg">
            {/* 🪙 Título */}
            <div className="payment-method-header-modern text-center mb-4">
              <i className="fa-solid fa-wallet fa-2x text-success mb-2"></i>
              <h5 className="fw-bold mb-0">Select a payment method</h5>
              <p className="text-muted small mt-1">
                Choose how you want to securely make your payment
              </p>
            </div>

            {/* 🔘 Botones */}
            <div className="d-grid gap-3">
              <button
                className="payment-method-option-modern stripe"
                onClick={() => {
                  // Cerramos el modal de método de pago
                  setShowPaymentModal(false);

                  // Esperamos a que se desmonte el DOM (300ms)
                  setTimeout(() => {
                    handleBuyNow(); // luego abrimos Stripe
                  }, 350);
                }}
              >
                <i className="fa-brands fa-stripe"></i>
                <span>Pay with Stripe</span>
              </button>

              <button
                className="payment-method-option-modern paypal"
                onClick={() => {
                  setShowPaymentModal(false);
                  handlePayPal();
                }}
              >
                <i className="fa-brands fa-paypal"></i>
                <span>Pay with PayPal</span>
              </button>

              <button
                className="payment-method-option-modern cancel"
                onClick={() => setShowPaymentModal(false)}
              >
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <StripeModal
        show={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        clientSecret={clientSecret}
        onSuccess={() => setShowSuccessModal(true)}
      />
      {showSuccessModal && (
        <div className="stripe-overlay">
          <ConfettiCanvas />
          <div className="stripe-modal">
            <div className="stripe-header bg-success">
              <h5>
                <i className="fa-solid fa-check-circle me-2"></i>
                Payment Successful
              </h5>
            </div>

            <div className="stripe-body text-center">
              <p className="text-muted mb-3">
                Your payment has been processed successfully.
              </p>

              {/* 🧾 Mini Recibo */}
              <div
                className="receipt-card text-start mx-auto p-3 border rounded-3 shadow-sm"
                style={{ maxWidth: "320px", background: "#fff" }}
              >
                <h6 className="text-center mb-3 fw-bold text-success">
                  Payment Receipt
                </h6>
                <p className="mb-1">
                  <strong>Course:</strong> {course.title}
                </p>
                <p className="mb-1">
                  <strong>Amount:</strong> $
                  {course.discount_price || course.price}
                </p>
                <p className="mb-1">
                  <strong>Transaction ID:</strong>{" "}
                  <span className="text-muted small">
                    {store.lastPaymentId || "pi_8A2bXk12demo"}
                  </span>
                </p>
                <p className="mb-1">
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </p>
                <p className="mb-0">
                  <strong>User:</strong> {user?.email}
                </p>
              </div>

              <button
                className="btn btn-primary mt-4"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
