// index.js - VERSIÓN SIMPLIFICADA
import React from "react";
import ReactDOM from "react-dom";
import Layout from "./layout";
import { loadStripe } from "@stripe/stripe-js";

import "../styles/index.css";

const stripePromise = loadStripe(
  "pk_test_51SEDdyLxJdjDhzqNZoyoCG0PYioqRVmaTIK5LRUAsk0GfhxzYKxKnFx4Zt9lj8J0NYoe7Yzq6ZbO6zX6PDl6cX6200USUJHrBN"
);

const Root = () => {
  return <Layout />;
};

ReactDOM.render(<Root />, document.querySelector("#app"));
