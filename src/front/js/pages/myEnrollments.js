import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";

export const MyEnrollments = () => {
  const { store, actions } = useContext(Context);

  useEffect(() => {
    actions.getMyEnrollments();
  }, []);

  return (
    <div className="container py-5">
      <h2>My Enrollments</h2>
      <ul className="list-group">
        {store.myEnrollments.length === 0 ? (
          <li className="list-group-item">You have no enrollments yet</li>
        ) : (
          store.myEnrollments.map((enroll, index) => (
            <li key={index} className="list-group-item">
              Course ID: {enroll.course_id} | Progress: {enroll.progress}%
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
